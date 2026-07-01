"""
Case Study 13 — Taxi Fleet Demand Forecasting (Real Data)
============================================================
Follow the step-by-step guide in README.md.

Usage:
    python data_loader.py              # first — downloads real TLC trip data
    python starter.py                  # then — runs this analysis
"""

import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_absolute_percentage_error

# ---------------------------------------------------------------------------
# Step 1 — Load the Real Dataset
# ---------------------------------------------------------------------------
# TODO: trips = pd.read_parquet("yellow_tripdata_2024-01.parquet")
# TODO: zones = pd.read_csv("taxi_zone_lookup.csv")

# ---------------------------------------------------------------------------
# Step 2 — Clean & Aggregate to Hourly Demand
# ---------------------------------------------------------------------------
# TODO: Filter fare_amount > 0 and trip_distance > 0
# TODO: Floor tpep_pickup_datetime to the hour
# TODO: Groupby PULocationID + pickup_hour, count -> pickups

# ---------------------------------------------------------------------------
# Step 3 — Time-Series Feature Engineering
# ---------------------------------------------------------------------------
# TODO: Pick the busiest zone, reindex to a continuous hourly frequency
# TODO: Add hour_of_day, day_of_week, lag_1h, lag_24h, rolling_24h_avg

# ---------------------------------------------------------------------------
# Step 4 — Forecast & Evaluate
# ---------------------------------------------------------------------------
# TODO: Time-based train/test split (last 7 days = test)
# TODO: Fit GradientBoostingRegressor, compute MAPE

# ---------------------------------------------------------------------------
# Step 5 — Translate Forecasts into Surge Pricing
# ---------------------------------------------------------------------------
# TODO: Compare predicted_pickups to FLEET_CAPACITY_PER_HOUR
# TODO: Derive a clipped surge_multiplier per zone-hour

print("✅ Starter script loaded — follow the TODOs in README.md step by step.")
