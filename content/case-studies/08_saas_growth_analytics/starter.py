"""
Case Study 08 — SaaS Growth Analytics
======================================
Follow the step-by-step guide in README.md.

Usage:
    python data_generator.py   # first — creates accounts/events/subscriptions CSVs
    python starter.py          # then — runs this analysis
"""

import pandas as pd
import numpy as np

# ---------------------------------------------------------------------------
# Step 1 — Load Data
# ---------------------------------------------------------------------------
# TODO: Load accounts.csv, events.csv, subscriptions.csv
# accounts = pd.read_csv("accounts.csv")
# events = pd.read_csv("events.csv", parse_dates=["timestamp"])
# subscriptions = pd.read_csv("subscriptions.csv", parse_dates=["start_date"])

# ---------------------------------------------------------------------------
# Step 2 — Cohort Retention Analysis
# ---------------------------------------------------------------------------
# TODO: Assign cohorts by signup month
# TODO: Build retention matrix
# TODO: Plot retention heatmap

# ---------------------------------------------------------------------------
# Step 3 — Product Engagement Scoring
# ---------------------------------------------------------------------------
# TODO: Compute feature_breadth, events_30d, days_since_last_event
# TODO: Calculate composite engagement_score (0–1)

# ---------------------------------------------------------------------------
# Step 4 — Funnel Analysis
# ---------------------------------------------------------------------------
# TODO: Build activation funnel (signup → first_login → core_feature → aha → paid)
# TODO: Identify biggest drop-off point

# ---------------------------------------------------------------------------
# Step 5 — Revenue Analytics (MRR Decomposition)
# ---------------------------------------------------------------------------
# TODO: Decompose MRR into New, Expansion, Contraction, Churned
# TODO: Calculate NRR
# TODO: Plot MRR waterfall

# ---------------------------------------------------------------------------
# Step 6 — Growth Recommendations
# ---------------------------------------------------------------------------
# TODO: Write 3-5 actionable recommendations with expected revenue impact

print("✅ Starter script loaded — follow the TODOs in README.md step by step.")
