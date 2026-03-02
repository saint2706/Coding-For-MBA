"""
Synthetic data generator for Case Study 09 — Supply Chain Inventory.
Run this first to create supply_chain.csv.

Usage:
    python data_generator.py
"""

import numpy as np
import pandas as pd

np.random.seed(42)

products = [f"PROD_{i:03d}" for i in range(50)]
dcs = ["DC_1", "DC_2", "DC_3", "DC_4", "DC_5"]

rows = []
for prod in products:
    base_demand = np.random.uniform(5, 50)  # daily demand varies by product
    base_variability = base_demand * np.random.uniform(0.15, 0.40)
    holding_cost = np.random.uniform(0.50, 5.00)
    stockout_cost = holding_cost * np.random.uniform(3, 6)  # stockout is more expensive
    order_cost = np.random.uniform(50, 300)
    lead_time = np.random.choice([3, 5, 7, 10, 14])

    for dc in dcs:
        dc_factor = {"DC_1": 1.2, "DC_2": 0.9, "DC_3": 1.4, "DC_4": 0.7, "DC_5": 1.0}[dc]
        rows.append({
            "product_id": prod,
            "dc_id": dc,
            "demand_daily_mean": round(base_demand * dc_factor, 1),
            "demand_daily_std": round(base_variability * dc_factor, 1),
            "demand_annual": round(base_demand * dc_factor * 365, 0),
            "lead_time_days": lead_time,
            "holding_cost_unit": round(holding_cost, 2),
            "stockout_cost_unit": round(stockout_cost, 2),
            "order_cost": round(order_cost, 2),
        })

df = pd.DataFrame(rows)
df.to_csv("supply_chain.csv", index=False)
print(f"✅ Generated supply_chain.csv — {len(df)} rows "
      f"({len(products)} products × {len(dcs)} DCs)")
