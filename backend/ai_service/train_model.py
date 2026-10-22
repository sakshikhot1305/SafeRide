"""
SafeRide - Random Forest Regressor Training & Evaluation
========================================================
This script trains an actual Random Forest Regressor to predict the remaining travel
time (in minutes) for school bus arrival at upcoming stops.

Evaluation Metrics reported:
- Mean Absolute Error (MAE)
- Root Mean Squared Error (RMSE)
- Coefficient of Determination (R² Score)
- Baseline Comparison vs naive distance/speed calculation
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

FEATURE_COLUMNS = [
    "distance_km",
    "current_speed_kmh",
    "time_of_day_minutes",
    "day_of_week",
    "stops_remaining",
    "stop_index"
]
TARGET_COLUMN = "actual_remaining_minutes"

def train():
    base_dir = os.path.dirname(__file__)
    data_path = os.path.join(base_dir, "data", "synthetic_school_bus_trips.csv")
    models_dir = os.path.join(base_dir, "models")
    os.makedirs(models_dir, exist_ok=True)

    if not os.path.exists(data_path):
        print(f"Data file not found at {data_path}. Running generator first...")
        from generate_dataset import generate_synthetic_data
        df = generate_synthetic_data(num_samples=2500)
        os.makedirs(os.path.dirname(data_path), exist_ok=True)
        df.to_csv(data_path, index=False)
    else:
        df = pd.read_csv(data_path)

    print(f"Loaded dataset: {df.shape[0]} samples with features {FEATURE_COLUMNS}")

    X = df[FEATURE_COLUMNS]
    y = df[TARGET_COLUMN]

    # 80/20 train/test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42
    )

    print(f"Training set: {X_train.shape[0]} samples | Test set: {X_test.shape[0]} samples")

    # Initialize Random Forest Regressor
    rf_model = RandomForestRegressor(
        n_estimators=100,
        max_depth=12,
        min_samples_split=4,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1
    )

    print("Fitting Random Forest Regressor...")
    rf_model.fit(X_train, y_train)

    # Predictions on test set
    y_pred = rf_model.predict(X_test)

    # Compute metrics
    mae = float(mean_absolute_error(y_test, y_pred))
    mse = float(mean_squared_error(y_test, y_pred))
    rmse = float(np.sqrt(mse))
    r2 = float(r2_score(y_test, y_pred))

    # Baseline physics model: ETA = (distance / max(speed, 20km/h)) * 60
    baseline_pred = (X_test["distance_km"] / np.maximum(X_test["current_speed_kmh"], 20.0)) * 60.0
    baseline_mae = float(mean_absolute_error(y_test, baseline_pred))

    # Feature importances
    feature_importances = {
        feat: round(float(imp), 4)
        for feat, imp in zip(FEATURE_COLUMNS, rf_model.feature_importances_)
    }

    metrics = {
        "model_type": "RandomForestRegressor",
        "n_estimators": 100,
        "max_depth": 12,
        "train_samples": int(X_train.shape[0]),
        "test_samples": int(X_test.shape[0]),
        "evaluation_metrics": {
            "mean_absolute_error_minutes": round(mae, 3),
            "root_mean_squared_error_minutes": round(rmse, 3),
            "r2_score": round(r2, 4),
            "baseline_physics_mae_minutes": round(baseline_mae, 3)
        },
        "feature_importances": feature_importances,
        "feature_columns": FEATURE_COLUMNS,
        "data_source": "SYNTHETIC_DEMO (clearly labelled development dataset)",
        "traffic_data_note": "No live municipal traffic API integrated; peak hours modeled statistically."
    }

    # Save model and metadata
    model_save_path = os.path.join(models_dir, "eta_random_forest.joblib")
    metrics_save_path = os.path.join(models_dir, "model_metrics.json")

    joblib.dump(rf_model, model_save_path)
    with open(metrics_save_path, "w") as f:
        json.dump(metrics, f, indent=2)

    print("\n================ ML MODEL EVALUATION REPORT ================")
    print(f"Model saved to: {model_save_path}")
    print(f"Metrics saved to: {metrics_save_path}")
    print(f"Test MAE (Mean Absolute Error): {mae:.2f} minutes")
    print(f"Test RMSE: {rmse:.2f} minutes")
    print(f"Test R² Score: {r2:.4f}")
    print(f"Naive Physics Baseline MAE: {baseline_mae:.2f} minutes")
    print(f"Improvement over naive physics: {((baseline_mae - mae) / baseline_mae) * 100:.1f}%")
    print("Feature Importances:")
    for k, v in feature_importances.items():
        print(f"  - {k}: {v * 100:.1f}%")
    print("============================================================\n")

    return metrics

if __name__ == "__main__":
    train()
