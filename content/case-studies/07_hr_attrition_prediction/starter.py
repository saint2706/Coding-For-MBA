"""
Case Study 07 — HR Attrition Prediction
========================================
Follow the step-by-step guide in README.md.

Usage:
    python data_generator.py   # first — creates hr_employees.csv
    python starter.py          # then — runs this analysis
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import roc_auc_score, classification_report
# from xgboost import XGBClassifier   # uncomment after install
# import shap                          # uncomment after install

# ---------------------------------------------------------------------------
# Step 1 — Load Data
# ---------------------------------------------------------------------------
# TODO: Load hr_employees.csv
# df = pd.read_csv("hr_employees.csv")
# print(df.shape)
# print(df["attrited"].value_counts(normalize=True))

# ---------------------------------------------------------------------------
# Step 2 — EDA
# ---------------------------------------------------------------------------
# TODO: Attrition rate by department, job_level, overtime
# TODO: Salary distribution by attrition status

# ---------------------------------------------------------------------------
# Step 3 — Feature Engineering
# ---------------------------------------------------------------------------
# TODO: Create years_since_promotion, salary_vs_median, engagement_score, is_stuck

# ---------------------------------------------------------------------------
# Step 4 — Classification Model
# ---------------------------------------------------------------------------
# TODO: Train RandomForest and XGBoost with StratifiedKFold
# Target: AUC-ROC >= 0.80

# ---------------------------------------------------------------------------
# Step 5 — SHAP Explainability
# ---------------------------------------------------------------------------
# TODO: Global SHAP summary plot
# TODO: Individual force plot for one high-risk employee

# ---------------------------------------------------------------------------
# Step 6 — Fairness Analysis
# ---------------------------------------------------------------------------
# TODO: Check AUC and flag rate across gender groups
# TODO: Document any disparities and mitigation strategies

print("✅ Starter script loaded — follow the TODOs in README.md step by step.")
