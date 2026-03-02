# 🏦 Case Study 10: Banking Credit Scoring

> **Phases covered**: Phase 6 (BI & Analytics)
> **Difficulty**: Advanced
> **Estimated time**: 8–10 hours

---

## 🎯 Case Overview

**NeoBank**, a digital-first bank with 2 million applicants per year, needs
to modernise its **credit scoring system**. The legacy scorecard, built
in 2018, has an approval rate of 45% and a default rate of 6.2% among
approved loans. Management believes a modern ML-based scorecard can
increase the approval rate to 55% while *reducing* the default rate to 4%,
generating an estimated **$35 M/year** in additional interest income.

Your mission: build a credit scorecard using Weight of Evidence (WoE)
binning, develop an ML model for comparison, conduct a fairness audit
across protected groups, and document the model for regulatory compliance.

---

## 📋 Business Context

| Metric | Value |
| --- | --- |
| Annual applicants | 2,000,000 |
| Current approval rate | 45% |
| Default rate (approved) | 6.2% |
| Average loan size | $12,000 |
| Target approval rate | 55% |
| Target default rate | ≤ 4% |
| Potential revenue uplift | $35 M/year |

**Key question:** *Can we approve more applicants while reducing default
risk, and can we prove the model is fair?*

---

## 🗂️ Project Structure

```
10_banking_credit_scoring/
├── README.md           ← this file (hand-holding guide)
├── starter.py          ← scaffold with TODOs
└── data_generator.py   ← creates synthetic credit application dataset
```

---

## 🛠️ Skills Applied

| Phase | Topics |
| ----- | ------ |
| Phase 6 | Responsible AI — fairness metrics, disparate impact, model cards |
| Phase 4 | Logistic regression, WoE/IV (Weight of Evidence / Information Value) |
| Phase 5 | Gradient boosting, model comparison, calibration |
| Phase 37B | Probability — odds, log-odds, Bayesian default rates |

---

## 🤝 Hand-Holding Walkthrough

### Step 1 — Generate & Explore Credit Data

**What:** Create a synthetic dataset of 50,000 loan applications with
credit bureau features, demographic information, and a binary `default`
label.

**Why:** Real credit data is heavily regulated (FCRA). Synthetic data
preserves the statistical structure while avoiding compliance issues.

**How:**

```python
python data_generator.py          # creates credit_applications.csv
df = pd.read_csv("credit_applications.csv")
print(df.shape)                   # (50000, 15)
print(df["default"].value_counts(normalize=True))
```

**✅ Checkpoint:** Default rate ≈ 6%. Print default rate by income bracket
and credit score range.

---

### Step 2 — Weight of Evidence (WoE) Binning

**What:** Bin continuous features into groups, compute WoE for each bin,
and calculate Information Value (IV) to rank features.

**Why:** WoE is the standard technique in credit risk modelling because:
(1) it handles non-linear relationships, (2) it's interpretable to
regulators, (3) it creates a monotonic transformation that logistic
regression loves.

**How:**

```python
def compute_woe_iv(df, feature, target, bins=10):
    """Compute Weight of Evidence and Information Value for a feature."""
    df["bin"] = pd.qcut(df[feature], q=bins, duplicates="drop")
    grouped = df.groupby("bin")[target].agg(["sum", "count"])
    grouped.columns = ["events", "total"]
    grouped["non_events"] = grouped["total"] - grouped["events"]

    total_events = grouped["events"].sum()
    total_non_events = grouped["non_events"].sum()

    grouped["event_rate"] = grouped["events"] / total_events
    grouped["non_event_rate"] = grouped["non_events"] / total_non_events
    grouped["woe"] = np.log(grouped["non_event_rate"] / grouped["event_rate"])
    grouped["iv"] = (grouped["non_event_rate"] - grouped["event_rate"]) * grouped["woe"]

    iv = grouped["iv"].sum()
    return grouped, iv

# Calculate IV for all features
feature_ivs = {}
for col in numeric_features:
    _, iv = compute_woe_iv(df.copy(), col, "default")
    feature_ivs[col] = iv

iv_df = pd.Series(feature_ivs).sort_values(ascending=False)
print("Feature ranking by Information Value:")
print(iv_df)
```

**✅ Checkpoint:** Features with IV > 0.3 are "strong" predictors.
Credit score and debt-to-income should rank highest.

---

### Step 3 — Traditional Scorecard (Logistic Regression + WoE)

**What:** Build a logistic regression scorecard using WoE-transformed
features.

**Why:** Logistic regression on WoE features is the gold standard for
regulatory-compliant credit models. Banks must be able to explain every
decision to regulators and declined applicants.

**How:**

```python
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score

# Transform features to WoE values
for col in selected_features:
    woe_table, _ = compute_woe_iv(df.copy(), col, "default")
    # Map each observation to its bin's WoE value
    df[f"{col}_woe"] = pd.qcut(df[col], q=10, duplicates="drop").map(
        woe_table["woe"].to_dict()
    )

woe_features = [f"{c}_woe" for c in selected_features]
X = df[woe_features].fillna(0)
y = df["default"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42
)

scorecard = LogisticRegression(max_iter=1000)
scorecard.fit(X_train, y_train)
y_prob = scorecard.predict_proba(X_test)[:, 1]
print(f"Scorecard AUC-ROC: {roc_auc_score(y_test, y_prob):.3f}")
```

**✅ Checkpoint:** AUC-ROC ≥ 0.75 (credit models typically achieve 0.70–0.85).

---

### Step 4 — ML Model Comparison (XGBoost)

**What:** Train an XGBoost model on the raw features (without WoE) and
compare performance.

**Why:** ML models typically outperform scorecards on raw accuracy, but
the trade-off is interpretability. You need both to make a recommendation
to the risk committee.

**How:**

```python
from xgboost import XGBClassifier

xgb = XGBClassifier(
    n_estimators=200, max_depth=5, learning_rate=0.05,
    scale_pos_weight=(y_train == 0).sum() / (y_train == 1).sum(),
    eval_metric="logloss", use_label_encoder=False, random_state=42,
)
xgb.fit(X_train_raw, y_train)
y_prob_xgb = xgb.predict_proba(X_test_raw)[:, 1]
print(f"XGBoost AUC-ROC: {roc_auc_score(y_test, y_prob_xgb):.3f}")

# Performance comparison
print("\nModel Comparison:")
print(f"  Scorecard (LR+WoE): AUC = {roc_auc_score(y_test, y_prob):.3f}")
print(f"  XGBoost:            AUC = {roc_auc_score(y_test, y_prob_xgb):.3f}")
```

**✅ Checkpoint:** XGBoost should outperform the scorecard by 2–5% AUC.
Document the trade-offs.

---

### Step 5 — Fairness Audit

**What:** Assess whether the model treats applicants fairly across
protected groups (age, gender, ethnicity).

**Why:** The Equal Credit Opportunity Act (ECOA) prohibits discrimination
in lending. Even if protected attributes aren't model inputs, proxy
features can create disparate impact. A fairness audit is legally required.

**How:**

```python
from sklearn.metrics import roc_auc_score

def fairness_audit(model, X, y, sensitive_feature, groups):
    """Compute AUC, approval rate, and default rate per group."""
    y_prob = model.predict_proba(X)[:, 1]
    threshold = 0.10  # approve if P(default) < 10%

    results = []
    for group in groups:
        mask = sensitive_feature == group
        auc = roc_auc_score(y[mask], y_prob[mask]) if y[mask].sum() > 0 else None
        approval_rate = (y_prob[mask] < threshold).mean()
        actual_default = y[mask][y_prob[mask] < threshold].mean() if (y_prob[mask] < threshold).sum() > 0 else None
        results.append({
            "Group": group,
            "N": mask.sum(),
            "AUC": auc,
            "Approval_Rate": approval_rate,
            "Default_Rate": actual_default,
        })

    return pd.DataFrame(results)

# Audit across age groups
audit = fairness_audit(scorecard, X_test, y_test,
                       df.loc[X_test.index, "age_group"],
                       ["18-25", "26-35", "36-50", "51-65", "65+"])
print(audit)

# Disparate impact ratio (4/5ths rule)
max_approval = audit["Approval_Rate"].max()
audit["Disparate_Impact"] = audit["Approval_Rate"] / max_approval
print(f"\nDisparate impact check (must be >= 0.80):")
print(audit[["Group", "Approval_Rate", "Disparate_Impact"]])
```

**✅ Checkpoint:** All groups should have a disparate impact ratio ≥ 0.80
(the 4/5ths rule). If any group fails, investigate which features drive
the disparity.

---

### Step 6 — Model Card & Regulatory Documentation

**What:** Create a model card documenting the model's intended use,
performance, limitations, and fairness analysis.

**Why:** Regulators (OCC, CFPB) require documented model risk management.
A model card is the industry-standard format for ML model documentation.

**How:**

```markdown
## Model Card: NeoBank Credit Scoring Model v2.0

### Model Details
- **Developer:** [Your Name], Data Science Team
- **Model type:** Logistic Regression on WoE-binned features
- **Training data:** 40,000 historical applications (Jan 2023 – Dec 2024)
- **Features:** 8 WoE-transformed credit bureau and application features

### Intended Use
- Primary: automated credit decisioning for personal loans ($1K–$50K)
- Out of scope: mortgage lending, business loans

### Performance
- AUC-ROC: 0.XX (test set)
- Approval rate at 4% default target: XX%
- Gini coefficient: 0.XX

### Fairness Analysis
- Disparate impact ratio (all groups): ≥ 0.80 ✅
- AUC variation across groups: < 0.05 ✅

### Limitations
- Trained on applications from a single geographic market
- Does not include alternative data (rent payments, utility bills)
- Performance may degrade for thin-file applicants

### Monitoring
- Monthly performance report (AUC, PSI)
- Quarterly fairness re-audit
- Annual full model revalidation
```

**✅ Checkpoint:** Complete all sections of the model card with your actual
model's metrics.

---

## 📊 Deliverables

| # | Deliverable | Format |
| - | --- | --- |
| 1 | WoE/IV analysis and feature ranking | Jupyter / .py |
| 2 | Logistic Regression scorecard | `.pkl` + scorecard table |
| 3 | XGBoost comparison model | `.pkl` |
| 4 | Fairness audit report | Markdown |
| 5 | Model card for regulatory filing | Markdown |

---

## 🏆 Stretch Goals

- [ ] Implement reject inference (accounting for unobserved defaults)
- [ ] Build a Population Stability Index (PSI) monitoring pipeline
- [ ] Add SHAP explanations for individual declined applications
- [ ] Create a Streamlit loan decisioning demo
- [ ] Compare with a fair-lending constrained model (using Fairlearn)

---

## 📚 Reference Lessons

- Day 43–48: Classification — logistic regression (Phase 4)
- Day 49–52: Ensemble methods — gradient boosting (Phase 4–5)
- Day 69: Responsible AI — fairness, model cards, bias audit (Phase 6)
- Day 37B: Probability — odds ratios, Bayesian default rates

---

*This case study demonstrates your ability to build models that are both
performant and fair — essential for fintech and banking data science roles.*
