"""
Case Study 09 — Supply Chain Inventory Optimisation
====================================================
Follow the step-by-step guide in README.md.

Usage:
    python data_generator.py   # first — creates supply_chain.csv
    python starter.py          # then — runs this analysis
"""

import pandas as pd
import numpy as np
from scipy.stats import norm
from scipy.optimize import linprog

# ---------------------------------------------------------------------------
# Step 1 — Load Data
# ---------------------------------------------------------------------------
# TODO: Load supply_chain.csv
# df = pd.read_csv("supply_chain.csv")
# print(df.shape)

# ---------------------------------------------------------------------------
# Step 2 — EOQ Baseline
# ---------------------------------------------------------------------------
# TODO: Calculate Economic Order Quantity for each product-DC
# EOQ = sqrt(2 * D * S / H)  where D=demand, S=order cost, H=holding cost

# ---------------------------------------------------------------------------
# Step 3 — Safety Stock Calculation
# ---------------------------------------------------------------------------
# TODO: Calculate safety stock for 95% service level (z=1.645)
# TODO: Compute reorder points

# ---------------------------------------------------------------------------
# Step 4 — Linear Programming Optimisation
# ---------------------------------------------------------------------------
# TODO: Formulate LP: minimise holding cost
# TODO: Subject to: inventory >= reorder_point, DC capacity constraints
# TODO: Solve with scipy.optimize.linprog

# ---------------------------------------------------------------------------
# Step 5 — Monte Carlo Simulation
# ---------------------------------------------------------------------------
# TODO: Simulate 10,000 demand scenarios
# TODO: Compute cost distribution and service level distribution
# TODO: Plot histograms

# ---------------------------------------------------------------------------
# Step 6 — Sensitivity Analysis
# ---------------------------------------------------------------------------
# TODO: Test scenarios: demand +/-20%, lead time 2x
# TODO: Create sensitivity table

print("✅ Starter script loaded — follow the TODOs in README.md step by step.")
