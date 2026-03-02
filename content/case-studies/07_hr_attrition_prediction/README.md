# 👥 Case Study 07: HR Attrition Prediction

> **Phases covered**: Phase 4 (ML Fundamentals) · Phase 5 (Advanced ML)
> **Difficulty**: Intermediate
> **Estimated time**: 6–8 hours

---

## 🎯 Case Overview

**TalentFirst Corp**, a 15,000-employee technology company, is experiencing
a **22% annual attrition rate** — well above the industry average of 13%.
Each voluntary departure costs an estimated **$45,000** in recruiting,
onboarding, and lost productivity. The CHRO wants a **predictive model**
that identifies flight-risk employees 90 days in advance so HR Business
Partners can intervene with retention conversations, role changes, or
compensation adjustments.

Your mission: build a classification model that predicts voluntary attrition,
explain the key drivers with SHAP, and design an ethical intervention
framework that avoids discriminatory targeting.

---

## 📋 Business Context

| Metric | Value |
| --- | --- |
| Headcount | 15,000 |
| Annual attrition rate | 22% |
| Cost per departure | $45,000 |
| Annual attrition cost | $148 M |
| Retention intervention cost | $2,500 / employee |
| HR Business Partners available | 45 |

**Key question:** *Which employees are most likely to leave in the next 90
days, and what can we do to retain them?*

---

## 🗂️ Project Structure

```
07_hr_attrition_prediction/
├── README.md           ← this file (hand-holding guide)
├── starter.py          ← scaffold with TODOs
└── data_generator.py   ← creates synthetic HR dataset
```

---

## 🛠️ Skills Applied

| Phase | Topics |
| ----- | ------ |
| Phase 4 | Logistic regression, decision trees, random forest |
| Phase 5 | XGBoost, SHAP, hyperparameter tuning |
| Phase 6 | Responsible AI — fairness metrics across protected groups |
| Phase 37B | Statistical testing for feature significance |

---

## 🤝 Hand-Holding Walkthrough

### Step 1 — Generate & Explore HR Data

**What:** Create a synthetic dataset of 5,000 employees with features like
tenure, salary, performance rating, promotion history, manager satisfaction,
commute distance, and a binary `attrited` label.

**Why:** HR datasets have unique challenges: ordinal features (performance
ratings), skewed distributions (tenure), and sensitive attributes (age,
gender) that require fairness considerations.

**How:**

```python
python data_generator.py          # creates hr_employees.csv
df = pd.read_csv("hr_employees.csv")
print(df.shape)                   # (5000, 16)
print(df["attrited"].value_counts(normalize=True))
```

**✅ Checkpoint:** Attrition rate ≈ 22%. Print attrition rate by department.

---

### Step 2 — Exploratory Data Analysis

**What:** Understand which factors correlate with attrition.

**Why:** The CHRO needs to understand *why* people leave — not just *who*
will leave. HR interventions differ: a salary issue needs a compensation
response; a career growth issue needs a development plan.

**How:**

```python
# Attrition rate by feature
for col in ["department", "job_level", "performance_rating", "overtime"]:
    print(f"\n{col}:")
    print(df.groupby(col)["attrited"].mean().sort_values(ascending=False))

# Salary vs attrition
import seaborn as sns
sns.boxplot(data=df, x="attrited", y="monthly_salary")
plt.title("Salary Distribution by Attrition Status")
plt.savefig("salary_vs_attrition.png")
```

**✅ Checkpoint:** Identify the 3 strongest predictors of attrition.
Overtime, low salary, and recent promotion denial are common top drivers.

---

### Step 3 — Feature Engineering

**What:** Create derived features that capture career trajectory and
engagement signals.

**Why:** Raw features like `years_at_company` are less predictive than
derived features like `years_since_last_promotion` or `salary_vs_market_ratio`.

**How:**

```python
df["years_since_promotion"] = df["years_at_company"] - df["years_since_last_promotion"]
df["salary_vs_median"] = df.groupby("job_level")["monthly_salary"].transform(
    lambda x: (x - x.median()) / x.median()
)
df["engagement_score"] = (
    df["job_satisfaction"] * 0.3
    + df["environment_satisfaction"] * 0.3
    + df["relationship_satisfaction"] * 0.2
    + df["work_life_balance"] * 0.2
)
df["is_stuck"] = ((df["years_since_last_promotion"] >= 3) &
                  (df["performance_rating"] >= 3)).astype(int)
```

**✅ Checkpoint:** `is_stuck` employees should have ≥ 30% attrition rate.

---

### Step 4 — Classification Model

**What:** Train a Random Forest and XGBoost model, using proper stratified
cross-validation.

**Why:** HR prediction is a classification problem with moderate imbalance
(22% positive). Tree-based models handle mixed feature types well.

**How:**

```python
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from sklearn.model_selection import cross_val_score, StratifiedKFold

models = {
    "RandomForest": RandomForestClassifier(n_estimators=200, max_depth=8,
                                            class_weight="balanced", random_state=42),
    "XGBoost": XGBClassifier(n_estimators=200, max_depth=5, learning_rate=0.05,
                              scale_pos_weight=3.5, eval_metric="logloss",
                              use_label_encoder=False, random_state=42),
}

cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
for name, model in models.items():
    scores = cross_val_score(model, X, y, cv=cv, scoring="roc_auc")
    print(f"{name} AUC-ROC: {scores.mean():.3f} ± {scores.std():.3f}")
```

**✅ Checkpoint:** AUC-ROC ≥ 0.80 for the best model.

---

### Step 5 — SHAP Explainability

**What:** Use SHAP to explain global and individual-level predictions.

**Why:** HR teams need to understand *why* the model flags an employee.
"This employee is at risk because their salary is 20% below median for
their level and they haven't been promoted in 4 years" is actionable.
"This employee has a risk score of 0.73" is not.

**How:**

```python
import shap

best_model = models["XGBoost"]
best_model.fit(X_train, y_train)

explainer = shap.TreeExplainer(best_model)
shap_values = explainer.shap_values(X_test)

# Global importance
shap.summary_plot(shap_values, X_test, feature_names=feature_names)

# Individual explanation for a high-risk employee
high_risk_idx = y_prob.argmax()
shap.force_plot(explainer.expected_value, shap_values[high_risk_idx],
                X_test.iloc[high_risk_idx], feature_names=feature_names)
```

**✅ Checkpoint:** Write a 3-sentence narrative for one high-risk employee
explaining why they're flagged and what intervention is recommended.

---

### Step 6 — Fairness Analysis

**What:** Check whether the model's predictions are fair across protected
groups (gender, age band, ethnicity).

**Why:** An attrition model that disproportionately flags women or older
employees for "retention interventions" could expose the company to
discrimination lawsuits. Fairness is not optional in HR ML.

**How:**

```python
from sklearn.metrics import roc_auc_score

# Check AUC across gender groups
for group in df["gender"].unique():
    mask = df["gender"] == group
    auc = roc_auc_score(y[mask], model.predict_proba(X[mask])[:, 1])
    print(f"AUC for {group}: {auc:.3f}")

# Demographic parity: flag rate should be similar across groups
for group in df["gender"].unique():
    mask = df["gender"] == group
    flag_rate = (model.predict_proba(X[mask])[:, 1] > 0.5).mean()
    print(f"Flag rate for {group}: {flag_rate:.1%}")
```

**✅ Checkpoint:** AUC should not differ by more than 0.05 across groups.
If it does, investigate whether the model is using proxy features.

---

## 📊 Deliverables

| # | Deliverable | Format |
| - | --- | --- |
| 1 | EDA with attrition drivers analysis | Jupyter / .py |
| 2 | XGBoost model with AUC ≥ 0.80 | `.pkl` file |
| 3 | SHAP feature importance plot | PNG |
| 4 | Fairness audit report | Markdown |
| 5 | Intervention priority list (top 100 employees) | CSV |

---

## 🏆 Stretch Goals

- [ ] Build a Streamlit HR dashboard showing department-level risk
- [ ] Add a survival analysis approach (time-to-attrition)
- [ ] Implement counterfactual explanations ("if salary increased by 10%…")
- [ ] Design a retention ROI calculator
- [ ] Compare with a neural network approach

---

## 📚 Reference Lessons

- Day 43–48: Classification — logistic regression, random forest (Phase 4)
- Day 49–52: Ensemble methods — XGBoost, feature importance (Phase 4–5)
- Day 53–56: Model evaluation — AUC, class imbalance (Phase 5)
- Day 69: Responsible AI — fairness metrics, bias detection (Phase 6)

---

*This case study showcases both technical ML skills and ethical awareness
— essential for data science roles in People Analytics.*
