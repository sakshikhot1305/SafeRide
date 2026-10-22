"""
SafeRide - Python FastAPI Microservice for AI Bus Arrival Prediction
====================================================================
Provides an internal REST API for:
- Predicting estimated travel time (in minutes) to an upcoming bus stop
- Model health checks and performance metrics
- Graceful error handling for missing/invalid inputs
"""

import os
import math
import json
import joblib
from datetime import datetime
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(
    title="SafeRide AI ETA Prediction Microservice",
    description="Random Forest ML Service for School Bus Arrival Time Estimation",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model state
MODEL = None
METRICS = None
BASE_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(BASE_DIR, "models", "eta_random_forest.joblib")
METRICS_PATH = os.path.join(BASE_DIR, "models", "model_metrics.json")

def load_model():
    """Loads trained model and metrics once into memory."""
    global MODEL, METRICS
    if os.path.exists(MODEL_PATH):
        try:
            MODEL = joblib.load(MODEL_PATH)
            print(f"[SafeRide AI] Loaded model successfully from {MODEL_PATH}")
        except Exception as e:
            print(f"[SafeRide AI] Error loading model: {e}")
            MODEL = None
    else:
        print(f"[SafeRide AI] Model file not found at {MODEL_PATH}. Attempting initial training...")
        try:
            from train_model import train
            METRICS = train()
            if os.path.exists(MODEL_PATH):
                MODEL = joblib.load(MODEL_PATH)
        except Exception as e:
            print(f"[SafeRide AI] Auto-training failed: {e}")
            MODEL = None

    if os.path.exists(METRICS_PATH):
        try:
            with open(METRICS_PATH, "r") as f:
                METRICS = json.load(f)
        except Exception as e:
            print(f"[SafeRide AI] Error loading metrics: {e}")

@app.on_event("startup")
def startup_event():
    load_model()

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Great-circle distance between two geographic coordinates in kilometers."""
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

class PredictionRequest(BaseModel):
    current_lat: float = Field(..., ge=-90.0, le=90.0, description="Bus latitude")
    current_lng: float = Field(..., ge=-180.0, le=180.0, description="Bus longitude")
    speed: float = Field(default=0.0, ge=0.0, description="Current speed in km/h")
    stop_lat: float = Field(..., ge=-90.0, le=90.0, description="Target stop latitude")
    stop_lng: float = Field(..., ge=-180.0, le=180.0, description="Target stop longitude")
    stops_remaining: int = Field(default=1, ge=1, le=20, description="Stops remaining until target stop")
    stop_index: int = Field(default=0, ge=0, description="Stop sequence index")
    timestamp: Optional[str] = Field(default=None, description="Optional ISO timestamp")

class PredictionResponse(BaseModel):
    predicted_eta_minutes: float
    distance_km: float
    speed_kmh: float
    prediction_source: str
    model_version: str
    status: str
    details: Optional[dict] = None

@app.get("/health")
def health():
    return {
        "status": "online",
        "service": "SafeRide AI ETA Service",
        "model_loaded": MODEL is not None,
        "model_type": "RandomForestRegressor",
        "metrics": METRICS.get("evaluation_metrics", {}) if METRICS else None,
        "data_notice": "Development trained on synthetic domain data; real journey logs required for production accuracy."
    }

@app.post("/predict-eta", response_model=PredictionResponse)
def predict_eta(req: PredictionRequest):
    # Compute Haversine distance
    distance_km = haversine_distance(
        req.current_lat, req.current_lng,
        req.stop_lat, req.stop_lng
    )

    # Resolve time of day & day of week
    if req.timestamp:
        try:
            dt = datetime.fromisoformat(req.timestamp.replace("Z", "+00:00"))
        except Exception:
            dt = datetime.now()
    else:
        dt = datetime.now()

    time_of_day_minutes = dt.hour * 60 + dt.minute
    day_of_week = min(dt.weekday(), 4) # 0=Monday .. 4=Friday (school days)

    # If ML model is loaded and available
    if MODEL is not None:
        try:
            import pandas as pd
            features_df = pd.DataFrame([{
                "distance_km": distance_km,
                "current_speed_kmh": req.speed,
                "time_of_day_minutes": time_of_day_minutes,
                "day_of_week": day_of_week,
                "stops_remaining": req.stops_remaining,
                "stop_index": req.stop_index
            }])
            raw_pred = MODEL.predict(features_df)[0]
            predicted_minutes = max(round(float(raw_pred), 1), 0.5)

            return PredictionResponse(
                predicted_eta_minutes=predicted_minutes,
                distance_km=round(distance_km, 2),
                speed_kmh=round(req.speed, 1),
                prediction_source="RANDOM_FOREST_ML",
                model_version="RandomForestRegressor-v1.0",
                status="Available",
                details={
                    "mae_minutes": METRICS.get("evaluation_metrics", {}).get("mean_absolute_error_minutes", 0.8) if METRICS else None
                }
            )
        except Exception as e:
            print(f"[SafeRide AI] Inference failed, falling back: {e}")

    # Fallback physics calculation: time = (dist / effective_speed) * 60 + dwell
    effective_speed = max(req.speed * 0.6 + 12.0, 15.0)
    base_minutes = (distance_km / effective_speed) * 60.0
    dwell = (req.stops_remaining - 1) * 1.5
    fallback_minutes = max(round(float(base_minutes + dwell), 1), 0.5)

    return PredictionResponse(
        predicted_eta_minutes=fallback_minutes,
        distance_km=round(distance_km, 2),
        speed_kmh=round(req.speed, 1),
        prediction_source="FALLBACK_PHYSICS",
        model_version="PhysicsBaseline",
        status="Available",
        details={"note": "ML model uninitialized; physics fallback applied."}
    )

@app.post("/retrain")
def retrain():
    try:
        from train_model import train
        new_metrics = train()
        load_model()
        return {"status": "success", "message": "Model retrained and reloaded successfully", "metrics": new_metrics}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    host = os.environ.get("HOST", "0.0.0.0")
    port = int(os.environ.get("PORT", 8000))
    print(f"[SafeRide AI] Starting Uvicorn server on {host}:{port}")
    uvicorn.run("main:app", host=host, port=port, reload=False)
