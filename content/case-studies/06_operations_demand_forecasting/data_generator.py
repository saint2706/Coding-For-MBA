"""
Synthetic data generator for Case Study 06 — Operations Demand Forecasting.
Run this first to create daily_sales.csv.

Usage:
    python data_generator.py
"""

import numpy as np
import pandas as pd

np.random.seed(42)

dates = pd.date_range("2023-01-01", "2024-12-31", freq="D")
categories = ["Produce", "Dairy", "Bakery", "Beverages", "Snacks"]
store_types = ["Urban", "Suburban", "Rural"]

rows = []
for cat in categories:
    base = {"Produce": 200, "Dairy": 150, "Bakery": 120, "Beverages": 180, "Snacks": 100}[cat]
    for store in store_types:
        store_factor = {"Urban": 1.3, "Suburban": 1.0, "Rural": 0.7}[store]
        for i, d in enumerate(dates):
            trend = 0.05 * i / len(dates)  # gentle upward trend
            weekly = 0.15 * np.sin(2 * np.pi * d.dayofweek / 7)  # weekly cycle
            yearly = 0.10 * np.sin(2 * np.pi * d.dayofyear / 365)  # yearly cycle
            holiday = 0.3 if d.month == 12 and d.day >= 20 else 0  # holiday boost
            noise = np.random.normal(0, 0.08)
            units = int(base * store_factor * (1 + trend + weekly + yearly + holiday + noise))
            units = max(units, 0)
            rows.append({
                "date": d,
                "product_category": cat,
                "store_type": store,
                "units_sold": units,
            })

df = pd.DataFrame(rows)
df.to_csv("daily_sales.csv", index=False)
print(f"✅ Generated daily_sales.csv — {len(df)} rows, "
      f"{len(dates)} days × {len(categories)} categories × {len(store_types)} stores")
