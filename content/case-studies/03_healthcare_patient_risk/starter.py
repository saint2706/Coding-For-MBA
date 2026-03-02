"""
Case Study 03 — Healthcare Patient Risk Stratification
=======================================================
Follow the step-by-step guide in README.md.

Usage:
    python data_generator.py   # first — creates patient_encounters.csv
    python starter.py          # then — runs this analysis
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.impute import KNNImputer, SimpleImputer
from sklearn.ensemble import (
    RandomForestClassifier, GradientBoostingClassifier, StackingClassifier,
)
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score, brier_score_loss, classification_report
# from sklearn.calibration import CalibratedClassifierCV, calibration_curve

# ---------------------------------------------------------------------------
# Step 1 — Load Data
# ---------------------------------------------------------------------------
# TODO: Load patient_encounters.csv
# df = pd.read_csv("patient_encounters.csv")
# print(df.shape)
# print(df["readmitted_30d"].value_counts(normalize=True))

# ---------------------------------------------------------------------------
# Step 2 — Clinical Feature Engineering
# ---------------------------------------------------------------------------
# TODO: Create comorbidity_score, prior_admit_rate, abnormal_labs, los_ratio
# See README.md Step 2 for detailed guidance.

# ---------------------------------------------------------------------------
# Step 3 — Handle Missing Data
# ---------------------------------------------------------------------------
# TODO: KNN imputation for numerics, mode imputation for categoricals
# Verify: df.isnull().sum() should return all zeros

# ---------------------------------------------------------------------------
# Step 4 — Stacking Ensemble
# ---------------------------------------------------------------------------
# TODO: Build StackingClassifier (RF + GBM, LR meta-learner)
# Target: AUC-ROC >= 0.75

# ---------------------------------------------------------------------------
# Step 5 — Probability Calibration
# ---------------------------------------------------------------------------
# TODO: Calibrate with CalibratedClassifierCV (isotonic)
# TODO: Plot calibration curve
# Target: Brier score <= 0.12

# ---------------------------------------------------------------------------
# Step 6 — Risk Stratification
# ---------------------------------------------------------------------------
# TODO: Segment patients into Low / Medium / High risk tiers
# TODO: Assign recommended clinical actions
# TODO: Calculate ROI (savings from prevented readmissions)

print("✅ Starter script loaded — follow the TODOs in README.md step by step.")
