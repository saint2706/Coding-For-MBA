"""
Case Study 14 — Credit Card Fraud Detection (Real Transactions)
==================================================================
Follow the step-by-step guide in README.md.

Usage:
    python data_loader.py      # first — downloads creditcard.csv via Kaggle
    python starter.py          # then — runs this analysis
"""

import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, IsolationForest
from sklearn.metrics import average_precision_score, classification_report

# ---------------------------------------------------------------------------
# Step 1 — Load the Real Dataset
# ---------------------------------------------------------------------------
# TODO: df = pd.read_csv("creditcard.csv")
# TODO: print(df["Class"].value_counts(normalize=True) * 100)

# ---------------------------------------------------------------------------
# Step 2 — Respect the Real Time Ordering
# ---------------------------------------------------------------------------
# TODO: Sort by Time, split 80/20 into train/test (no shuffling)

# ---------------------------------------------------------------------------
# Step 3 — Model with the Right Metric
# ---------------------------------------------------------------------------
# TODO: Fit LogisticRegression(class_weight="balanced")
# TODO: Fit RandomForestClassifier(class_weight="balanced")
# TODO: Compare average_precision_score (PR-AUC) for both

# ---------------------------------------------------------------------------
# Step 4 — Anomaly Detection as a Second Opinion
# ---------------------------------------------------------------------------
# TODO: Fit IsolationForest(contamination=0.0017) on X_train (no labels)
# TODO: Check how many true frauds fall in the top 1% anomaly scores

# ---------------------------------------------------------------------------
# Step 5 — Cost-Based Threshold Tuning
# ---------------------------------------------------------------------------
# TODO: Sweep thresholds 0.1-0.9, compute missed_fraud*FRAUD_LOSS +
#       false_declines*FALSE_DECLINE_COST, pick the minimum-cost threshold

print("✅ Starter script loaded — follow the TODOs in README.md step by step.")
