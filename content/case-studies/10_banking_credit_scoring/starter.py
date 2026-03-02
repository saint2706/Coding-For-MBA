"""
Case Study 10 — Banking Credit Scoring
=======================================
Follow the step-by-step guide in README.md.

Usage:
    python data_generator.py   # first — creates credit_applications.csv
    python starter.py          # then — runs this analysis
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score, classification_report
# from xgboost import XGBClassifier   # uncomment after install

# ---------------------------------------------------------------------------
# Step 1 — Load Data
# ---------------------------------------------------------------------------
# TODO: Load credit_applications.csv
# df = pd.read_csv("credit_applications.csv")
# print(df.shape)
# print(df["default"].value_counts(normalize=True))

# ---------------------------------------------------------------------------
# Step 2 — WoE Binning & IV Calculation
# ---------------------------------------------------------------------------
# TODO: Implement compute_woe_iv() function
# TODO: Calculate IV for all numeric features
# TODO: Rank features by Information Value

# ---------------------------------------------------------------------------
# Step 3 — Traditional Scorecard (LR + WoE)
# ---------------------------------------------------------------------------
# TODO: Transform features to WoE values
# TODO: Train LogisticRegression on WoE features
# Target: AUC-ROC >= 0.75

# ---------------------------------------------------------------------------
# Step 4 — ML Model Comparison (XGBoost)
# ---------------------------------------------------------------------------
# TODO: Train XGBoost on raw features
# TODO: Compare AUC-ROC with scorecard

# ---------------------------------------------------------------------------
# Step 5 — Fairness Audit
# ---------------------------------------------------------------------------
# TODO: Implement fairness_audit() function
# TODO: Check disparate impact ratio (>= 0.80) across groups
# TODO: Document any disparities

# ---------------------------------------------------------------------------
# Step 6 — Model Card
# ---------------------------------------------------------------------------
# TODO: Complete model card template (see README.md Step 6)

print("✅ Starter script loaded — follow the TODOs in README.md step by step.")
