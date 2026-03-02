"""
Case Study 06 — Operations Demand Forecasting
==============================================
Follow the step-by-step guide in README.md.

Usage:
    python data_generator.py   # first — creates daily_sales.csv
    python starter.py          # then — runs this analysis
"""

import pandas as pd
import numpy as np
from sklearn.metrics import mean_absolute_percentage_error
from sklearn.ensemble import GradientBoostingRegressor
# from statsmodels.tsa.statespace.sarimax import SARIMAX  # uncomment after install
# from prophet import Prophet                               # uncomment after install

# ---------------------------------------------------------------------------
# Step 1 — Load Data
# ---------------------------------------------------------------------------
# TODO: Load daily_sales.csv with parse_dates
# df = pd.read_csv("daily_sales.csv", parse_dates=["date"])
# print(df.shape)

# ---------------------------------------------------------------------------
# Step 2 — Time Series Decomposition
# ---------------------------------------------------------------------------
# TODO: Use seasonal_decompose on one product category
# TODO: Save decomposition plot

# ---------------------------------------------------------------------------
# Step 3 — SARIMA Model
# ---------------------------------------------------------------------------
# TODO: Fit SARIMA(1,1,1)(1,1,1,7) on training data
# TODO: Forecast 14 days and compute MAPE

# ---------------------------------------------------------------------------
# Step 4 — Prophet Model
# ---------------------------------------------------------------------------
# TODO: Fit Prophet with yearly + weekly seasonality
# TODO: Forecast 14 days and compute MAPE

# ---------------------------------------------------------------------------
# Step 5 — ML Model (Gradient Boosting with Lag Features)
# ---------------------------------------------------------------------------
# TODO: Create lag features (1, 7, 14, 28 days)
# TODO: Add calendar features (day_of_week, month, is_weekend)
# TODO: Train GradientBoostingRegressor and compute MAPE

# ---------------------------------------------------------------------------
# Step 6 — Model Comparison & Ordering Plan
# ---------------------------------------------------------------------------
# TODO: Compare all three models (MAPE, RMSE)
# TODO: Generate 14-day ordering plan with safety stock

print("✅ Starter script loaded — follow the TODOs in README.md step by step.")
