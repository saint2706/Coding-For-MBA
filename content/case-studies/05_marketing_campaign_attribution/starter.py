"""
Case Study 05 — Marketing Campaign Attribution
===============================================
Follow the step-by-step guide in README.md.

Usage:
    python data_generator.py   # first — creates customer_journeys.csv
    python starter.py          # then — runs this analysis
"""

import pandas as pd
import numpy as np
from scipy import stats
from sklearn.linear_model import LogisticRegression

# ---------------------------------------------------------------------------
# Step 1 — Load Data
# ---------------------------------------------------------------------------
# TODO: Load customer_journeys.csv
# df = pd.read_csv("customer_journeys.csv")
# print(f"Journeys: {df['journey_id'].nunique()}")

# ---------------------------------------------------------------------------
# Step 2 — Rule-Based Attribution Models
# ---------------------------------------------------------------------------
# TODO: Implement last_click, first_click, linear, time_decay attribution
# See README.md Step 2 for detailed code.

# ---------------------------------------------------------------------------
# Step 3 — A/B Test Analysis
# ---------------------------------------------------------------------------
# TODO: Two-proportion z-test on control vs treatment groups
# TODO: Calculate lift and 95% confidence interval

# ---------------------------------------------------------------------------
# Step 4 — Causal Inference (Propensity Score Matching)
# ---------------------------------------------------------------------------
# TODO: Build propensity model for Social touchpoint exposure
# TODO: Match treated/control users on propensity scores
# TODO: Estimate ATT (Average Treatment Effect on Treated)

# ---------------------------------------------------------------------------
# Step 5 — Budget Reallocation Recommendation
# ---------------------------------------------------------------------------
# TODO: Create summary table with current vs recommended spend
# TODO: Rank channels by incremental ROAS

print("✅ Starter script loaded — follow the TODOs in README.md step by step.")
