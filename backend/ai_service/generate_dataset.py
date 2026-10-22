"""
SafeRide - Synthetic School Bus Trip Dataset Generator
======================================================
NOTE ON DATA SOURCE & RELIABILITY:
This script generates a clearly labelled synthetic dataset for development, demonstration,
and academic evaluation of the SafeRide Arrival Time Prediction Model.

WHY SYNTHETIC DATA IS USED HERE:
In the current production database, the `BusTracking` collection only stores the latest
real-time snapshot of bus coordinates (latitude, longitude, speed, lastUpdated) using
an in-place upsert. Historical timestamped journey breadcrumbs and actual stop-arrival
event logs have not been recorded yet.

To train an ML model on real-world data, the following historical records must be logged:
1. Continuous GPS trail with timestamps (busId, lat, lng, speed, timestamp).
2. Stop geofence enter/exit events (actual arrival time at each stop).
3. Traffic API or congestion telemetry, if available.

Until such logs are accumulated over several weeks of real bus runs, this synthetic dataset
models realistic school bus dynamics:
- Peak commute hours (7:00-9:00 AM, 2:30-4:30 PM) with school zone speed limits and traffic delays.
- Stop dwell times (boarding/deboarding ~1-2 minutes per stop).
- Non-linear relationships between distance, speed, and real-world travel time.
"""

import os
import math
import random
import numpy as np
import pandas as pd

def haversine_distance(lat1, lon1, lat2, lon2):
    """Calculate great-circle distance between two points in km."""
    R = 6371.0 # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def generate_synthetic_data(num_samples=2500, random_seed=42):
    np.random.seed(random_seed)
    random.seed(random_seed)

    records = []

    for i in range(num_samples):
        # Distance to next stop: 0.2 km to 10.0 km
        distance_km = round(float(np.random.uniform(0.2, 10.0)), 2)

        # Current bus speed: 0 to 50 km/h (school bus speeds in urban/semi-urban areas)
        current_speed_kmh = round(float(np.random.choice([
            0.0, # stopped at red light or bus stop
            np.random.uniform(5.0, 15.0), # slow traffic
            np.random.uniform(15.0, 35.0), # normal city school transit
            np.random.uniform(35.0, 50.0)  # open road
        ], p=[0.12, 0.28, 0.45, 0.15])), 1)

        # Time of day (minutes from midnight, e.g. 6:30 AM = 390 to 6:30 PM = 1110)
        time_slot = np.random.choice(["morning_rush", "afternoon_rush", "regular"], p=[0.45, 0.40, 0.15])
        if time_slot == "morning_rush":
            time_of_day_minutes = int(np.random.uniform(420, 540))
        elif time_slot == "afternoon_rush":
            time_of_day_minutes = int(np.random.uniform(870, 990))
        else:
            time_of_day_minutes = int(np.random.uniform(540, 870))

        # Day of week: 0=Monday, 4=Friday (school days)
        day_of_week = int(np.random.choice([0, 1, 2, 3, 4]))

        # Stops remaining: 1 to 5
        stops_remaining = int(np.random.choice([1, 2, 3, 4, 5], p=[0.4, 0.25, 0.18, 0.12, 0.05]))
        stop_index = int(np.random.randint(0, 8))

        # Traffic congestion multiplier (simulated peak traffic)
        if (420 <= time_of_day_minutes <= 540) or (870 <= time_of_day_minutes <= 990):
            traffic_factor = np.random.uniform(1.20, 1.45)
        else:
            traffic_factor = np.random.uniform(1.02, 1.15)

        # Effective cruise speed estimation
        effective_speed = max(current_speed_kmh * 0.6 + 12.0, 14.0)

        # Baseline travel time (hours to minutes)
        base_travel_time_minutes = (distance_km / effective_speed) * 60.0

        # Dwell time for intermediate stops (approx 1.2 to 2.0 mins per stop)
        dwell_time = (stops_remaining - 1) * np.random.uniform(1.0, 2.0)

        # Random micro-delays (signals, pedestrian crossings)
        random_delay = np.random.normal(loc=0.5, scale=0.4)

        # Target actual remaining minutes
        actual_remaining_minutes = (base_travel_time_minutes * traffic_factor) + dwell_time + random_delay
        actual_remaining_minutes = max(round(float(actual_remaining_minutes), 1), 0.5)

        records.append({
            "sample_id": f"SYN_{i+1:05d}",
            "distance_km": distance_km,
            "current_speed_kmh": current_speed_kmh,
            "time_of_day_minutes": time_of_day_minutes,
            "day_of_week": day_of_week,
            "stops_remaining": stops_remaining,
            "stop_index": stop_index,
            "data_label": "SYNTHETIC_DEVELOPMENT_SAMPLE",
            "actual_remaining_minutes": actual_remaining_minutes
        })

    df = pd.DataFrame(records)
    return df

if __name__ == "__main__":
    out_dir = os.path.join(os.path.dirname(__file__), "data")
    os.makedirs(out_dir, exist_ok=True)
    out_file = os.path.join(out_dir, "synthetic_school_bus_trips.csv")

    print(f"Generating synthetic school bus training dataset...")
    df = generate_synthetic_data(num_samples=2500)
    df.to_csv(out_file, index=False)
    print(f"Successfully generated {len(df)} samples saved to: {out_file}")
    print(df.head())
