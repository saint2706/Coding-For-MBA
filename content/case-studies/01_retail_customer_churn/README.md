# 🛒 Case Study 01: Retail Customer Churn

> **Phases covered**: Phase 4 (ML Fundamentals) · Phase 5 (Advanced ML)
> **Difficulty**: Intermediate
> **Estimated time**: 6–8 hours

---

## 🎯 Case Overview

**RetailMart** is a national retail chain with 1.2 million active loyalty-card
members. Over the past year, 18% of members stopped purchasing — a churn rate
that costs the company an estimated **$42 M annually** in lost lifetime value.

The VP of Marketing wants a **predictive model** that identifies at-risk
customers 30 days before they lapse so the retention team can intervene with
personalised offers. Your job: build that model, explain what drives churn, and
recommend a targeting strategy.

---

## 📋 Business Context

| Metric | Value |
| --- | --- |
| Active members | 1,200,000 |
| Monthly churn rate | ~1.5% |
| Annual revenue at risk | $42 M |
| Retention campaign cost | $8 per customer |
| Average customer LTV | $580 |

**Key question:** *Which customers should we target, and what offer type
(discount, loyalty points, personal outreach) will be most effective?*

---

## 🗂️ Project Structure

```
01_retail_customer_churn/
├── README.md           ← this file (hand-holding guide)
├── starter.py          ← scaffold with TODOs — follow step by step
└── data_generator.py   ← creates synthetic retail dataset
```

---

## 🛠️ Skills Applied

| Phase | Topics |
| ----- | ------ |
| Phase 4 | Logistic regression, decision trees, cross-validation, feature engineering |
| Phase 5 | XGBoost, SMOTE, SHAP, hyperparameter tuning, model evaluation |
| Phase 37B | Probability distributions, Bayes theorem |
| Phase 37C | sklearn Pipelines, ColumnTransformer |

---

## 🤝 Hand-Holding Walkthrough

> Follow these steps one at a time. Each step tells you *what* to do, *why*
> it matters for the business, and *how* to code it.

### Step 1 — Generate & Explore the Data

**What:** Run the data generator to create a synthetic dataset of 10,000
customers with features like recency, frequency, monetary value (RFM),
tenure, support tickets, and a binary `churned` label.

**Why:** In real projects, you'd receive a data extract from the CRM. Here we
simulate it so you can start immediately.

**How:**

```python
# In starter.py — Step 1
python data_generator.py          # creates retail_customers.csv
df = pd.read_csv("retail_customers.csv")
print(df.shape)                   # (10000, 12)
print(df["churned"].value_counts(normalize=True))
```

**✅ Checkpoint:** You should see ~18% churn rate. If not, re-run the generator.

---

### Step 2 — Exploratory Data Analysis (EDA)

**What:** Understand feature distributions and their relationship to churn.

**Why:** The marketing VP needs to understand *why* customers leave, not just
*who* will leave. EDA helps you craft the narrative.

**How:**

```python
# Numeric summaries
df.describe()

# Churn rate by customer segment
df.groupby("customer_segment")["churned"].mean()

# Correlation matrix
import seaborn as sns
sns.heatmap(df.select_dtypes("number").corr(), annot=True, fmt=".2f")
```

**✅ Checkpoint:** Identify the 3 features most correlated with churn.

---

### Step 3 — Feature Engineering

**What:** Create business-meaningful derived features.

**Why:** Raw columns rarely capture the full signal. For example,
`avg_order_value = total_spend / num_orders` is more predictive than either
raw column alone.

**How:**

```python
df["avg_order_value"]    = df["total_spend"] / df["num_orders"].replace(0, 1)
df["support_rate"]       = df["support_tickets"] / df["tenure_months"].replace(0, 1)
df["spend_trend"]        = df["last_3m_spend"] - df["prev_3m_spend"]
df["days_since_last"]    = (pd.Timestamp.now() - pd.to_datetime(df["last_purchase_date"])).dt.days
```

**✅ Checkpoint:** You should now have 15+ columns. Print `df.columns`.

---

### Step 4 — Preprocessing Pipeline

**What:** Build a scikit-learn pipeline that handles numeric scaling and
categorical encoding in one reproducible step.

**Why:** Pipelines prevent data leakage and make deployment easy — the same
object that fits on training data transforms production data.

**How:**

```python
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder

num_cols = ["recency_days", "frequency", "monetary", "tenure_months",
            "avg_order_value", "support_rate", "spend_trend"]
cat_cols = ["customer_segment", "preferred_channel"]

preprocessor = ColumnTransformer([
    ("num", StandardScaler(), num_cols),
    ("cat", OneHotEncoder(handle_unknown="ignore"), cat_cols),
])
```

**✅ Checkpoint:** `preprocessor.fit_transform(X_train).shape` returns a
numeric array with no NaNs.

---

### Step 5 — Baseline Model (Logistic Regression)

**What:** Train a logistic regression as the simplest possible model.

**Why:** Always start with a simple, interpretable baseline. If logistic
regression achieves AUC 0.75, you know any fancier model must beat that.

**How:**

```python
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score, classification_report

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42
)

baseline = Pipeline([
    ("pre", preprocessor),
    ("clf", LogisticRegression(max_iter=1000, class_weight="balanced")),
])
baseline.fit(X_train, y_train)
y_prob = baseline.predict_proba(X_test)[:, 1]
print(f"Baseline AUC-ROC: {roc_auc_score(y_test, y_prob):.3f}")
```

**✅ Checkpoint:** AUC-ROC should be between 0.70–0.80.

---

### Step 6 — Advanced Model (XGBoost)

**What:** Train an XGBoost gradient-boosted classifier and tune it.

**Why:** XGBoost handles non-linear interactions and is the go-to for
tabular classification in industry. The marketing team cares about lift
in the top decile — XGBoost typically excels here.

**How:**

```python
from xgboost import XGBClassifier
from sklearn.model_selection import RandomizedSearchCV
import numpy as np

xgb_pipe = Pipeline([
    ("pre", preprocessor),
    ("clf", XGBClassifier(
        eval_metric="logloss",
        use_label_encoder=False,
        scale_pos_weight=(y_train == 0).sum() / (y_train == 1).sum(),
    )),
])

param_grid = {
    "clf__n_estimators": [100, 200, 300],
    "clf__max_depth": [3, 5, 7],
    "clf__learning_rate": [0.01, 0.05, 0.1],
    "clf__subsample": [0.8, 1.0],
}

search = RandomizedSearchCV(
    xgb_pipe, param_grid, n_iter=20, scoring="roc_auc",
    cv=5, random_state=42, n_jobs=-1
)
search.fit(X_train, y_train)
print(f"Best XGB AUC-ROC: {search.best_score_:.3f}")
```

**✅ Checkpoint:** AUC-ROC ≥ 0.80 (improvement over baseline).

---

### Step 7 — Model Explainability (SHAP)

**What:** Use SHAP to explain individual and aggregate predictions.

**Why:** The VP won't approve a black-box model. SHAP lets you say
"customers who decreased spending by >30% in the last quarter have a 4×
higher churn probability." That's actionable.

**How:**

```python
import shap

best_model = search.best_estimator_
explainer = shap.TreeExplainer(best_model.named_steps["clf"])
X_test_transformed = best_model.named_steps["pre"].transform(X_test)
shap_values = explainer.shap_values(X_test_transformed)

# Global importance
shap.summary_plot(shap_values, X_test_transformed)

# Single customer explanation
shap.force_plot(explainer.expected_value, shap_values[0])
```

**✅ Checkpoint:** List the top 5 churn drivers and write a one-sentence
business explanation for each.

---

### Step 8 — Business Recommendations

**What:** Translate model outputs into a targeting strategy.

**Why:** The model is only useful if it changes decisions.

**How:**

```python
# Score all customers
df["churn_probability"] = best_model.predict_proba(X)[:, 1]

# Segment into risk tiers
df["risk_tier"] = pd.cut(
    df["churn_probability"],
    bins=[0, 0.3, 0.6, 1.0],
    labels=["Low", "Medium", "High"]
)

# Recommended actions
action_map = {"Low": "No action", "Medium": "Email offer", "High": "Personal call"}
df["recommended_action"] = df["risk_tier"].map(action_map)

print(df["risk_tier"].value_counts())
```

**✅ Checkpoint:** Estimate the expected revenue saved if the retention team
contacts all High-risk customers with an 80% success rate.

---

## 📊 Deliverables

| # | Deliverable | Format |
| - | --- | --- |
| 1 | Exploratory analysis with 3+ charts | Jupyter / .py |
| 2 | Trained XGBoost model with AUC ≥ 0.80 | `.pkl` file |
| 3 | SHAP feature importance plot | PNG / notebook |
| 4 | Executive summary (1 page) | Markdown |
| 5 | Retention targeting CSV | `at_risk_customers.csv` |

---

## 🏆 Stretch Goals

- [ ] Build a Streamlit dashboard showing churn risk by customer segment
- [ ] Add a cost-sensitive threshold optimisation (minimise retention spend)
- [ ] Implement a calibration curve and Brier score
- [ ] Compare with a neural network (PyTorch tabular)
- [ ] Add fairness analysis across demographic groups

---

## 📚 Reference Lessons

- Day 43–48: Classification models — logistic regression, decision trees (Phase 4)
- Day 49–52: Ensemble methods — random forest, gradient boosting (Phase 4)
- Day 53–56: Advanced evaluation — ROC, PR curves, class imbalance (Phase 5)
- Day 37B: Probability & statistics — distributions, Bayes theorem
- Day 37C: sklearn Pipelines & ColumnTransformer

---

*Complete all checkpoints, push to GitHub, and add the SHAP plot to your MBA portfolio.*
