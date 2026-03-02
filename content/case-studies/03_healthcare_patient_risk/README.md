# 🏥 Case Study 03: Healthcare Patient Risk Stratification

> **Phases covered**: Phase 5 (Advanced ML & Deep Learning)
> **Difficulty**: Advanced
> **Estimated time**: 8–10 hours

---

## 🎯 Case Overview

**MedCare Health System** operates 12 hospitals and manages 800,000 patient
records. Hospital readmissions within 30 days cost the system **$28 M/year** in
penalties under the CMS Hospital Readmissions Reduction Program (HRRP). The
Chief Medical Officer wants a **patient risk stratification model** that flags
high-risk patients *before discharge* so care coordinators can arrange follow-up.

Your mission: build an ensemble model that predicts 30-day readmission risk,
calibrate the probabilities so clinicians trust them, and present results that
a medical director can act on.

---

## 📋 Business Context

| Metric | Value |
| --- | --- |
| Total patients / year | 800,000 |
| 30-day readmission rate | 14.2% |
| CMS penalty cost / year | $28 M |
| Cost per preventable readmission | $15,200 |
| Care coordination intervention cost | $350 / patient |

**Key question:** *Which patients need post-discharge follow-up to prevent
costly readmissions?*

---

## 🗂️ Project Structure

```
03_healthcare_patient_risk/
├── README.md           ← this file (hand-holding guide)
├── starter.py          ← scaffold with TODOs
└── data_generator.py   ← creates synthetic patient dataset
```

---

## 🛠️ Skills Applied

| Phase | Topics |
| ----- | ------ |
| Phase 5 | Random Forest, Gradient Boosting, stacking ensembles |
| Phase 5 | Probability calibration (Platt scaling, isotonic regression) |
| Phase 4 | Feature engineering, missing data imputation |
| Phase 37B | Bayesian risk scoring, conditional probability, CLT |

---

## 🤝 Hand-Holding Walkthrough

### Step 1 — Generate & Explore Patient Data

**What:** Create a synthetic dataset of 20,000 patient encounters with
demographics, diagnoses, lab values, prior admissions, and a binary
`readmitted_30d` label.

**Why:** Real hospital data (MIMIC-III) requires credentialing. Synthetic
data lets you start immediately while preserving realistic feature patterns.

**How:**

```python
python data_generator.py          # creates patient_encounters.csv
df = pd.read_csv("patient_encounters.csv")
print(df.shape)                   # (20000, 18)
print(df["readmitted_30d"].value_counts(normalize=True))
```

**✅ Checkpoint:** Readmission rate should be ≈ 14%. Print age distribution
and top 5 diagnosis categories.

---

### Step 2 — Clinical Feature Engineering

**What:** Create clinically meaningful derived features.

**Why:** Clinicians reason in terms like "number of medications" and
"Charlson comorbidity index" — features that map to clinical intuition
improve both model performance and stakeholder trust.

**How:**

```python
# Comorbidity burden (simplified Charlson-like score)
df["comorbidity_score"] = (
    df["has_diabetes"].astype(int)
    + df["has_heart_failure"].astype(int)
    + df["has_copd"].astype(int)
    + df["has_renal_disease"].astype(int)
)

# Prior utilisation
df["prior_admit_rate"] = df["prior_admissions_12m"] / 12

# Lab value flags
df["abnormal_labs"] = (
    (df["hemoglobin"] < 10).astype(int)
    + (df["creatinine"] > 1.5).astype(int)
    + (df["sodium"] < 135).astype(int)
)

# Length of stay ratio to average
df["los_ratio"] = df["length_of_stay"] / df["length_of_stay"].mean()
```

**✅ Checkpoint:** Patients with `comorbidity_score >= 3` should have
≥ 25% readmission rate.

---

### Step 3 — Handle Missing Data

**What:** Impute missing lab values and categorical features.

**Why:** Hospital data always has missing values — labs not ordered, fields
not charted. Proper imputation prevents data loss and bias.

**How:**

```python
from sklearn.impute import SimpleImputer, KNNImputer

# Numeric: KNN imputation preserves feature relationships
num_imputer = KNNImputer(n_neighbors=5)
df[num_cols] = num_imputer.fit_transform(df[num_cols])

# Categorical: mode imputation
cat_imputer = SimpleImputer(strategy="most_frequent")
df[cat_cols] = cat_imputer.fit_transform(df[cat_cols])
```

**✅ Checkpoint:** `df.isnull().sum()` should return all zeros.

---

### Step 4 — Ensemble Model (Stacking)

**What:** Build a stacking ensemble that combines Random Forest, Gradient
Boosting, and Logistic Regression.

**Why:** Stacking captures different aspects of the data — trees handle
non-linearity, logistic regression provides calibrated base probabilities.
Ensembles consistently outperform individual models in healthcare risk prediction.

**How:**

```python
from sklearn.ensemble import (
    RandomForestClassifier, GradientBoostingClassifier, StackingClassifier
)
from sklearn.linear_model import LogisticRegression

estimators = [
    ("rf", RandomForestClassifier(n_estimators=200, max_depth=8, random_state=42)),
    ("gb", GradientBoostingClassifier(n_estimators=150, max_depth=5, random_state=42)),
]

stacker = StackingClassifier(
    estimators=estimators,
    final_estimator=LogisticRegression(max_iter=1000),
    cv=5,
    stack_method="predict_proba",
)

stacker.fit(X_train, y_train)
y_prob = stacker.predict_proba(X_test)[:, 1]
print(f"Stacking AUC-ROC: {roc_auc_score(y_test, y_prob):.3f}")
```

**✅ Checkpoint:** AUC-ROC ≥ 0.75 (healthcare readmission is hard — 0.75+ is
considered clinically useful).

---

### Step 5 — Probability Calibration

**What:** Calibrate the model's predicted probabilities so "30% predicted
risk" really means 30% of those patients are readmitted.

**Why:** Clinicians make decisions based on risk thresholds ("intervene if
risk > 25%"). If the model says 25% but real risk is 40%, patients get
under-served. Calibration is a regulatory expectation in healthcare ML.

**How:**

```python
from sklearn.calibration import CalibratedClassifierCV, calibration_curve

calibrated = CalibratedClassifierCV(stacker, method="isotonic", cv=5)
calibrated.fit(X_train, y_train)

y_cal = calibrated.predict_proba(X_test)[:, 1]
fraction_pos, mean_pred = calibration_curve(y_test, y_cal, n_bins=10)

import matplotlib.pyplot as plt
plt.plot(mean_pred, fraction_pos, marker="o", label="Calibrated model")
plt.plot([0, 1], [0, 1], "--", label="Perfect calibration")
plt.xlabel("Predicted probability")
plt.ylabel("Observed fraction")
plt.legend()
plt.title("Calibration Curve")
plt.savefig("calibration_curve.png")
```

**✅ Checkpoint:** The calibration curve should closely follow the diagonal.
Compute the Brier score — target ≤ 0.12.

---

### Step 6 — Risk Stratification & Clinical Action

**What:** Segment patients into Low / Medium / High risk tiers and assign
clinical actions.

**Why:** Actionable risk tiers let care coordinators prioritise their limited
time and budget.

**How:**

```python
df["risk_score"] = calibrated.predict_proba(X)[:, 1]
df["risk_tier"] = pd.cut(
    df["risk_score"],
    bins=[0, 0.10, 0.25, 1.0],
    labels=["Low", "Medium", "High"]
)

action_map = {
    "Low": "Standard discharge",
    "Medium": "Phone follow-up within 7 days",
    "High": "In-person visit within 48 hours + care coordinator",
}
df["recommended_action"] = df["risk_tier"].map(action_map)

# ROI estimate
high_risk = df[df["risk_tier"] == "High"]
prevented = len(high_risk) * 0.30  # 30% reduction with intervention
savings = prevented * 15200 - len(high_risk) * 350
print(f"Estimated annual savings: ${savings:,.0f}")
```

**✅ Checkpoint:** Calculate the Net Benefit and cost per readmission prevented.

---

## 📊 Deliverables

| # | Deliverable | Format |
| - | --- | --- |
| 1 | EDA with clinical feature analysis | Jupyter / .py |
| 2 | Stacking ensemble with AUC ≥ 0.75 | `.pkl` file |
| 3 | Calibration curve | PNG |
| 4 | Risk stratification report | CSV |
| 5 | Executive summary for CMO | Markdown |

---

## 🏆 Stretch Goals

- [ ] Use LACE index features (Length of stay, Acuity, Comorbidities, ED visits)
- [ ] Build a Streamlit clinical dashboard
- [ ] Add fairness analysis across age, race, and insurance type
- [ ] Compare with a deep learning approach (tabular transformer)
- [ ] Simulate deployment: daily batch scoring + alert system

---

## 📚 Reference Lessons

- Day 49–52: Ensemble methods — random forest, gradient boosting (Phase 4–5)
- Day 53–56: Model evaluation — calibration, Brier score, clinical metrics (Phase 5)
- Day 37B: Probability — Bayesian reasoning, conditional risk (Phase 37B)
- Day 69: Responsible AI — fairness in healthcare models (Phase 6)

---

*Present this case study to demonstrate your ability to build trustworthy,
calibrated ML models for high-stakes healthcare decisions.*
