# ☎️ Case Study 12: Bank Telemarketing Conversion (Real Data)

> **Phases covered**: Phase 4 (ML Fundamentals) · Phase 5 (Advanced ML)
> **Difficulty**: Intermediate
> **Estimated time**: 6–8 hours

---

## 🎯 Case Overview

A Portuguese retail bank ran direct-marketing phone campaigns between 2008
and 2010, calling clients to sell **term deposit** products. Call centre
capacity is limited — agents can make roughly 2,000 calls a week — so the
bank needs to know *who to call first*.

This case study uses the bank's **actual, published campaign records**
(anonymised client attributes, no synthetic generator). Your job: build a
model that ranks clients by conversion probability, then translate that
ranking into a call-list policy the call centre can actually use.

---

## 📊 Data Source & Attribution

| | |
| --- | --- |
| **Dataset** | Bank Marketing |
| **Provider** | UCI Machine Learning Repository |
| **Authors** | Sérgio Moro, Paulo Rita, Paulo Cortez |
| **URL** | https://archive.ics.uci.edu/dataset/222/bank+marketing |
| **License** | CC BY 4.0 |
| **Citation** | Moro, S., Rita, P., & Cortez, P. (2014). *Bank Marketing* [Dataset]. UCI Machine Learning Repository. https://doi.org/10.24432/C5K306 |
| **Academic reference** | Moro, S., Cortez, P., & Rita, P. (2014). "A Data-Driven Approach to Predict the Success of Bank Telemarketing." *Decision Support Systems*, 62, 22-31. |
| **Size** | 41,188 rows (`bank-additional-full` variant), 20 client/campaign/economic features |

Real campaign data means real quirks: many categorical fields contain an
explicit `"unknown"` category (the bank genuinely didn't have that data), and
the target is heavily imbalanced — only ~11% of calls resulted in a "yes".

---

## 📋 Business Context

| Metric | Value |
| --- | --- |
| Total calls in dataset | 41,188 |
| Historical conversion rate | ~11.3% |
| Cost per call (agent time) | $6 |
| Average term deposit value to bank | $180 (first-year margin) |
| Weekly call centre capacity | ~2,000 calls |

**Key question:** *Given limited call capacity, which clients should the
call centre prioritise to maximise conversions per dollar spent on calling?*

---

## 🗂️ Project Structure

```
12_bank_telemarketing_conversion/
├── README.md          ← this file (hand-holding guide)
├── starter.py          ← scaffold with TODOs — follow step by step
└── data_loader.py       ← downloads the real UCI dataset via `ucimlrepo`
```

---

## 🛠️ Skills Applied

| Phase | Topics |
| ----- | ------ |
| Phase 4 | Logistic regression, classification metrics, train/test splitting |
| Phase 5 | Gradient boosting / ensemble methods, class imbalance handling |
| Phase 37B | Probability, expected value, threshold tuning |

---

## 🤝 Hand-Holding Walkthrough

### Step 1 — Fetch the Real Dataset

**What:** Download the real UCI Bank Marketing dataset.

**Why:** This is the exact dataset behind a widely-cited banking analytics
paper — working with it means your results are directly comparable to
published research, not a one-off synthetic sample.

**How:**

```python
# pip install ucimlrepo
python data_loader.py            # downloads and caches bank_marketing.csv

df = pd.read_csv("bank_marketing.csv")
print(df.shape)
print(df["y"].value_counts(normalize=True))
```

**✅ Checkpoint:** ~41,188 rows, 20 feature columns, target `y` roughly
88.7% "no" / 11.3% "yes".

---

### Step 2 — Explore the Real Messiness

**What:** Check for `"unknown"` categories, the `pdays` sentinel value
(`999` means "never contacted before"), and the economic context columns
(`emp.var.rate`, `euribor3m`, etc.).

**Why:** Unlike synthetic data, real survey/CRM fields have missing-as-a-
category values and encoded sentinels you have to know to interpret
correctly — treating `pdays=999` as a literal number of days would badly
distort any model.

**How:**

```python
for col in df.select_dtypes(include="object").columns:
    print(col, df[col].unique()[:6])

df["was_previously_contacted"] = (df["pdays"] != 999).astype(int)
```

**✅ Checkpoint:** Several columns (`job`, `education`, `default`, `housing`,
`loan`) should contain `"unknown"` — decide whether to impute, drop, or keep
as its own category (keeping it is usually best here — non-response can
itself be predictive).

---

### Step 3 — Encode & Split

**What:** One-hot encode categoricals, then split into train/test sets
*stratified* on the target.

**Why:** With only ~11% positive class, a random (non-stratified) split can
easily leave your test set with a skewed conversion rate, making metrics
unreliable.

**How:**

```python
from sklearn.model_selection import train_test_split

X = pd.get_dummies(df.drop(columns=["y"]), drop_first=True)
y = (df["y"] == "yes").astype(int)

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42
)
```

**✅ Checkpoint:** Conversion rate in `y_train` and `y_test` should both be
within ~0.5 percentage points of the full dataset's 11.3%.

---

### Step 4 — Model with Class Imbalance in Mind

**What:** Train a baseline logistic regression and a gradient boosting
model, both with class-imbalance handling.

**Why:** A model that just predicts "no" for everyone gets ~89% accuracy and
is completely useless to the business — accuracy is the wrong metric here.

**How:**

```python
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import classification_report, roc_auc_score

logreg = LogisticRegression(max_iter=1000, class_weight="balanced")
logreg.fit(X_train, y_train)

gbc = GradientBoostingClassifier(random_state=42)
gbc.fit(X_train, y_train)

for name, model in [("LogReg", logreg), ("GBC", gbc)]:
    proba = model.predict_proba(X_test)[:, 1]
    print(name, "ROC-AUC:", roc_auc_score(y_test, proba))
```

**✅ Checkpoint:** Both models should score well above 0.5 ROC-AUC (a good
model on this dataset typically lands around 0.75–0.80). Print a full
`classification_report` and note precision/recall for the "yes" class
specifically — that's what matters to the call centre.

---

### Step 5 — Turn Probabilities into a Call Policy

**What:** Rank test-set clients by predicted conversion probability and
compute the expected profit of calling the top N%.

**Why:** The call centre doesn't need a probability — it needs a ranked
list and a cut-off. This step converts model output into an operational
decision.

**How:**

```python
CALL_COST = 6
DEPOSIT_VALUE = 180

results = X_test.copy()
results["actual"] = y_test.values
results["predicted_proba"] = gbc.predict_proba(X_test)[:, 1]
results = results.sort_values("predicted_proba", ascending=False)

for pct in [0.1, 0.2, 0.3, 0.5, 1.0]:
    n_calls = int(len(results) * pct)
    subset = results.head(n_calls)
    conversions = subset["actual"].sum()
    profit = conversions * DEPOSIT_VALUE - n_calls * CALL_COST
    print(f"Top {pct:.0%} ({n_calls} calls): {conversions} conversions, "
          f"profit ${profit:,.0f}")
```

**✅ Checkpoint:** Calling only the top 20–30% by predicted probability
should capture a disproportionate share of conversions relative to random
calling — this is your headline "lift" chart for the executive summary.

---

## 📊 Deliverables

| # | Deliverable | Format |
| - | --- | --- |
| 1 | Cleaned dataset with imbalance-aware split | `data_loader.py` |
| 2 | Model comparison (LogReg vs. GBC) with ROC-AUC & PR curves | Jupyter / .py |
| 3 | Lift chart / gains table by decile | PNG + table |
| 4 | Recommended call-list threshold with expected profit | Markdown |
| 5 | Executive summary for the call centre operations lead | Markdown |

---

## 🏆 Stretch Goals

- [ ] Add SHAP values to explain which features drive conversion
- [ ] Try SMOTE oversampling and compare to `class_weight="balanced"`
- [ ] Segment by `poutcome` (outcome of previous campaign) — repeat contacts behave very differently
- [ ] Build a simple Streamlit tool where an agent enters client attributes and gets a call/no-call recommendation
- [ ] Re-run the analysis using only pre-call features (drop `duration`, which leaks the call outcome) and compare degradation

---

## 📚 Reference Lessons

- Day 42–43: Classification (Phase 4)
- Day 52: Ensemble methods — gradient boosting (Phase 5)
- Day 37B: Probability, expected value, and decision thresholds (Phase 4)

---

*This case study is grounded in the same real dataset behind a published,
peer-reviewed banking analytics paper — a good exercise in reproducing and
extending real research rather than fitting a toy problem.*
