"""
Case Study 12 — Bank Telemarketing Conversion (Real Data)
===========================================================
Follow the step-by-step guide in README.md.

Usage:
    python data_loader.py      # first — downloads bank_marketing.csv
    python starter.py          # then — runs this analysis
"""

import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import classification_report, roc_auc_score

# ---------------------------------------------------------------------------
# Step 1 — Load the Real Dataset
# ---------------------------------------------------------------------------
# TODO: df = pd.read_csv("bank_marketing.csv")
# TODO: print(df["y"].value_counts(normalize=True))

# ---------------------------------------------------------------------------
# Step 2 — Explore the Real Messiness
# ---------------------------------------------------------------------------
# TODO: Inspect "unknown" categories in job, education, default, housing, loan
# TODO: Create was_previously_contacted from pdays == 999

# ---------------------------------------------------------------------------
# Step 3 — Encode & Split
# ---------------------------------------------------------------------------
# TODO: One-hot encode categoricals with pd.get_dummies
# TODO: Stratified train_test_split on y

# ---------------------------------------------------------------------------
# Step 4 — Model with Class Imbalance in Mind
# ---------------------------------------------------------------------------
# TODO: Fit LogisticRegression(class_weight="balanced") baseline
# TODO: Fit GradientBoostingClassifier
# TODO: Compare ROC-AUC and classification_report for both

# ---------------------------------------------------------------------------
# Step 5 — Turn Probabilities into a Call Policy
# ---------------------------------------------------------------------------
# TODO: Rank test set by predicted_proba
# TODO: Compute expected profit for calling top 10/20/30/50/100%

print("✅ Starter script loaded — follow the TODOs in README.md step by step.")
