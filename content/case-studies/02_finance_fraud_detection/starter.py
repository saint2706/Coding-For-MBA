"""
Case Study 02 — Finance Fraud Detection
========================================
Follow the step-by-step guide in README.md.
Fill in each TODO section, then run the script end-to-end.

Usage:
    python data_generator.py   # first — creates transactions.csv
    python starter.py          # then — runs this analysis
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.metrics import (
    precision_score, recall_score, precision_recall_curve,
    classification_report, average_precision_score,
)
from sklearn.preprocessing import StandardScaler
# from xgboost import XGBClassifier            # uncomment after install
# from imblearn.over_sampling import SMOTE      # uncomment after install
# from imblearn.pipeline import Pipeline as ImbPipeline  # uncomment after install

# ---------------------------------------------------------------------------
# Step 1 — Load Data
# ---------------------------------------------------------------------------
# TODO: Load transactions.csv
# df = pd.read_csv("transactions.csv")
# print(f"Shape: {df.shape}")
# print(f"Fraud rate: {df['is_fraud'].mean():.4%}")

# ---------------------------------------------------------------------------
# Step 2 — Feature Engineering
# ---------------------------------------------------------------------------
# TODO: Create velocity features (txn_count_1h, amount_zscore, is_cross_border)
# See README.md Step 2 for detailed guidance.

# ---------------------------------------------------------------------------
# Step 3 — Isolation Forest (Unsupervised Baseline)
# ---------------------------------------------------------------------------
# TODO: Train Isolation Forest and evaluate recall / precision
# features = ["amount", "txn_count_1h", "amount_zscore", "is_cross_border", "hour"]
# iso = IsolationForest(contamination=0.002, random_state=42)
# df["anomaly_score"] = iso.fit_predict(df[features])

# ---------------------------------------------------------------------------
# Step 4 — Supervised Model (XGBoost + SMOTE)
# ---------------------------------------------------------------------------
# TODO: Build SMOTE + XGBoost pipeline
# TODO: Evaluate with StratifiedKFold cross-validation
# Target: Average Precision >= 0.60

# ---------------------------------------------------------------------------
# Step 5 — Threshold Optimisation
# ---------------------------------------------------------------------------
# TODO: Find optimal threshold that maximises business value
# fraud_value = 150   # average fraud loss prevented per caught fraud
# fp_cost = 3.50      # cost per false positive

# ---------------------------------------------------------------------------
# Step 6 — GNN Exploration (Stretch)
# ---------------------------------------------------------------------------
# TODO: Write a 1-paragraph explanation of how a GNN approach would work
# This is conceptual — implementation is a stretch goal.

print("✅ Starter script loaded — follow the TODOs in README.md step by step.")
