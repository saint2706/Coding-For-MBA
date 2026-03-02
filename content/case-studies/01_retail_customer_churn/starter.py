"""
Case Study 01 — Retail Customer Churn Prediction
=================================================
Follow the step-by-step guide in README.md.
Fill in each TODO section, then run the script end-to-end.

Usage:
    python data_generator.py   # first — creates retail_customers.csv
    python starter.py          # then — runs this analysis
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, RandomizedSearchCV
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score, classification_report
# from xgboost import XGBClassifier  # uncomment after pip install xgboost
# import shap                        # uncomment after pip install shap

# ---------------------------------------------------------------------------
# Step 1 — Load Data
# ---------------------------------------------------------------------------
# TODO: Load retail_customers.csv into a DataFrame
# df = pd.read_csv("retail_customers.csv")
# print(df.shape)
# print(df["churned"].value_counts(normalize=True))

# ---------------------------------------------------------------------------
# Step 2 — Exploratory Data Analysis
# ---------------------------------------------------------------------------
# TODO: Print descriptive statistics
# TODO: Compute churn rate by customer_segment
# TODO: Plot a correlation heatmap (use seaborn)

# ---------------------------------------------------------------------------
# Step 3 — Feature Engineering
# ---------------------------------------------------------------------------
# TODO: Create derived features
# df["avg_order_value"] = df["total_spend"] / df["num_orders"].replace(0, 1)
# df["support_rate"]    = df["support_tickets"] / df["tenure_months"].replace(0, 1)
# df["spend_trend"]     = df["last_3m_spend"] - df["prev_3m_spend"]

# ---------------------------------------------------------------------------
# Step 4 — Preprocessing Pipeline
# ---------------------------------------------------------------------------
num_cols = [
    "recency_days", "frequency", "monetary", "tenure_months",
    "avg_order_value", "support_rate", "spend_trend",
]
cat_cols = ["customer_segment", "preferred_channel"]

preprocessor = ColumnTransformer([
    ("num", StandardScaler(), num_cols),
    ("cat", OneHotEncoder(handle_unknown="ignore"), cat_cols),
])

# TODO: Define X (features) and y (target)
# X = df[num_cols + cat_cols]
# y = df["churned"]
# X_train, X_test, y_train, y_test = train_test_split(
#     X, y, test_size=0.2, stratify=y, random_state=42
# )

# ---------------------------------------------------------------------------
# Step 5 — Baseline Model (Logistic Regression)
# ---------------------------------------------------------------------------
# TODO: Build and evaluate a logistic regression baseline
# baseline = Pipeline([
#     ("pre", preprocessor),
#     ("clf", LogisticRegression(max_iter=1000, class_weight="balanced")),
# ])
# baseline.fit(X_train, y_train)
# y_prob = baseline.predict_proba(X_test)[:, 1]
# print(f"Baseline AUC-ROC: {roc_auc_score(y_test, y_prob):.3f}")
# print(classification_report(y_test, baseline.predict(X_test)))

# ---------------------------------------------------------------------------
# Step 6 — Advanced Model (XGBoost)
# ---------------------------------------------------------------------------
# TODO: Train XGBClassifier with RandomizedSearchCV
# Uncomment the xgboost import at the top first.
# Target AUC-ROC >= 0.80

# ---------------------------------------------------------------------------
# Step 7 — SHAP Explainability
# ---------------------------------------------------------------------------
# TODO: Compute SHAP values and plot feature importance
# Uncomment the shap import at the top first.

# ---------------------------------------------------------------------------
# Step 8 — Business Recommendations
# ---------------------------------------------------------------------------
# TODO: Score all customers and segment into risk tiers
# TODO: Map risk tiers to recommended actions
# TODO: Export at_risk_customers.csv

print("✅ Starter script loaded — follow the TODOs in README.md step by step.")
