# 💳 Case Study 14: Credit Card Fraud Detection (Real Transactions)

> **Phases covered**: Phase 4 (ML Fundamentals) · Phase 5 (Advanced ML)
> **Difficulty**: Advanced
> **Estimated time**: 8–10 hours

---

## 🎯 Case Overview

This case study uses **real, anonymised credit card transactions** collected
by Worldline and the Machine Learning Group at the Université Libre de
Bruxelles (ULB) — actual European cardholder purchases from September 2013,
not a synthetic simulation.

Because the underlying transaction fields are commercially confidential, the
original 28 numeric features have been PCA-transformed by the data
providers (you'll work with anonymised components `V1`–`V28` plus `Time` and
`Amount`) — this is itself a realistic constraint: in production fraud
teams, you rarely get raw, human-readable features either, because the
signal often comes from a black-box risk engine.

Your job: build a fraud classifier that catches as much real fraud as
possible without generating so many false alarms that legitimate customers
get blocked.

---

## 📊 Data Source & Attribution

| | |
| --- | --- |
| **Dataset** | Credit Card Fraud Detection |
| **Providers** | Worldline and the Machine Learning Group, Université Libre de Bruxelles (ULB) |
| **Host** | Kaggle — https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud |
| **License** | Open Database License (ODbL) v1.0 |
| **Citation** | Dal Pozzolo, A., Caelen, O., Johnson, R.A., & Bontempi, G. (2015). "Calibrating Probability with Undersampling for Unbalanced Classification." *IEEE Symposium Series on Computational Intelligence (SSCI)*. |
| **Size** | 284,807 transactions over 2 days, 492 confirmed frauds (0.172%) |

**Getting the data:** Kaggle requires a free account to download datasets.
1. Create a Kaggle account and API token (`kaggle.json`) — see
   https://www.kaggle.com/docs/api
2. Run `python data_loader.py`, which uses `kagglehub` to fetch and cache
   the dataset locally as `creditcard.csv`.

---

## 📋 Business Context

| Metric | Value |
| --- | --- |
| Total transactions | 284,807 |
| Confirmed fraud cases | 492 (0.172%) |
| Avg. fraud loss per missed case | $122 (dataset average fraud amount) |
| Cost of a false decline (customer friction) | $4 estimated support/goodwill cost |
| Time window | 2 days of real transactions |

**Key question:** *What decision threshold catches the most fraud dollars
while keeping false declines of legitimate customers to an acceptable
level?*

---

## 🗂️ Project Structure

```
14_creditcard_fraud_real_data/
├── README.md          ← this file (hand-holding guide)
├── starter.py          ← scaffold with TODOs — follow step by step
└── data_loader.py       ← downloads the real ULB/Kaggle dataset
```

---

## 🛠️ Skills Applied

| Phase | Topics |
| ----- | ------ |
| Phase 4 | Classification, precision/recall, confusion matrices |
| Phase 5 | Anomaly detection, extreme class imbalance, ensemble methods |
| Phase 37B | Probability, cost-based decision thresholds |

---

## 🤝 Hand-Holding Walkthrough

### Step 1 — Fetch the Real Dataset

**What:** Download the actual anonymised transaction dataset from Kaggle.

**Why:** This is one of the most-cited real fraud datasets in applied ML —
its extreme, genuine class imbalance (0.172% fraud) is exactly the kind of
challenge synthetic data tends to understate.

**How:**

```python
# pip install kagglehub
python data_loader.py             # downloads and caches creditcard.csv

df = pd.read_csv("creditcard.csv")
print(df.shape)
print(df["Class"].value_counts())
print(df["Class"].value_counts(normalize=True) * 100)
```

**✅ Checkpoint:** 284,807 rows, 31 columns (`Time`, `V1`–`V28`, `Amount`,
`Class`). Only 492 rows should have `Class == 1`.

---

### Step 2 — Respect the Real Time Ordering

**What:** Split the data by `Time` (transaction seconds elapsed) instead of
randomly, training on the earlier portion and testing on the later portion.

**Why:** In production, a fraud model is always trained on the past and
deployed on the future. A random split leaks information across time and
overstates how well the model would really perform.

**How:**

```python
df_sorted = df.sort_values("Time")
split_idx = int(len(df_sorted) * 0.8)
train = df_sorted.iloc[:split_idx]
test = df_sorted.iloc[split_idx:]

print(f"Train fraud rate: {train['Class'].mean():.4%}")
print(f"Test fraud rate: {test['Class'].mean():.4%}")
```

**✅ Checkpoint:** Both splits should retain roughly (though not exactly) the
same ~0.17% fraud rate — real fraud rates do drift slightly over time,
which is itself worth noting in your write-up.

---

### Step 3 — Model with the Right Metric

**What:** Train a baseline logistic regression and a random forest, both
weighted for class imbalance, and evaluate with **precision-recall AUC**,
not ROC-AUC.

**Why:** With 0.17% positives, ROC-AUC can look deceptively high even for a
mediocre model, because the huge majority class dominates the false-positive
rate calculation. Precision-recall AUC is the honest metric for this level
of imbalance.

**How:**

```python
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import average_precision_score, classification_report

features = [c for c in df.columns if c not in ("Class",)]
X_train, y_train = train[features], train["Class"]
X_test, y_test = test[features], test["Class"]

logreg = LogisticRegression(max_iter=1000, class_weight="balanced")
logreg.fit(X_train, y_train)

rf = RandomForestClassifier(n_estimators=200, class_weight="balanced", random_state=42)
rf.fit(X_train, y_train)

for name, model in [("LogReg", logreg), ("RandomForest", rf)]:
    proba = model.predict_proba(X_test)[:, 1]
    print(name, "PR-AUC:", average_precision_score(y_test, proba))
```

**✅ Checkpoint:** Random Forest should meaningfully outperform logistic
regression on PR-AUC (typically 0.75+ vs. 0.6-ish) — note this in your
model comparison.

---

### Step 4 — Anomaly Detection as a Second Opinion

**What:** Fit an unsupervised Isolation Forest (trained without labels) and
compare its flagged transactions to the supervised model's.

**Why:** In real fraud operations, new fraud patterns emerge that a
supervised model — trained only on *known* past fraud — has never seen.
Anomaly detection catches novel patterns a labelled classifier would miss.

**How:**

```python
from sklearn.ensemble import IsolationForest

iso = IsolationForest(contamination=0.0017, random_state=42)
iso.fit(X_train)
anomaly_scores = -iso.decision_function(X_test)  # higher = more anomalous

# Compare: how many true frauds fall in the top 1% most anomalous?
top_1pct_cutoff = pd.Series(anomaly_scores).quantile(0.99)
flagged = anomaly_scores >= top_1pct_cutoff
print(f"Frauds caught in top 1% anomalous: {y_test[flagged].sum()} / {y_test.sum()}")
```

**✅ Checkpoint:** The Isolation Forest should catch a meaningful (if
imperfect) share of real frauds purely from anomaly structure, with no
label information — a useful sanity check and a talking point for "what if
a new fraud pattern that isn't in our training labels shows up tomorrow."

---

### Step 5 — Cost-Based Threshold Tuning

**What:** Instead of the default 0.5 probability threshold, find the
threshold that minimises total business cost (missed fraud + false
declines).

**Why:** The business doesn't care about F1 score — it cares about dollars.
This step is where the model becomes an actual policy recommendation.

**How:**

```python
import numpy as np

FRAUD_LOSS = 122     # avg. loss per missed fraud
FALSE_DECLINE_COST = 4  # avg. cost per legitimate customer wrongly declined

proba = rf.predict_proba(X_test)[:, 1]
best_cost, best_threshold = np.inf, 0.5

for threshold in np.arange(0.1, 0.9, 0.05):
    preds = (proba >= threshold).astype(int)
    missed_fraud = ((preds == 0) & (y_test == 1)).sum()
    false_declines = ((preds == 1) & (y_test == 0)).sum()
    total_cost = missed_fraud * FRAUD_LOSS + false_declines * FALSE_DECLINE_COST
    if total_cost < best_cost:
        best_cost, best_threshold = total_cost, threshold

print(f"Optimal threshold: {best_threshold:.2f}, total cost: ${best_cost:,.0f}")
```

**✅ Checkpoint:** The cost-optimal threshold is usually well below the
default 0.5 — because missed fraud is far more expensive than a false
decline, the model should be biased toward flagging more transactions for
review.

---

## 📊 Deliverables

| # | Deliverable | Format |
| - | --- | --- |
| 1 | Time-ordered train/test pipeline | `data_loader.py` + .py |
| 2 | Model comparison with PR-AUC (LogReg vs. RF) | Jupyter / .py |
| 3 | Isolation Forest anomaly-detection comparison | .py |
| 4 | Cost-optimal threshold analysis | Markdown + chart |
| 5 | Executive summary for the fraud operations team | Markdown |

---

## 🏆 Stretch Goals

- [ ] Try SMOTE / undersampling and compare against `class_weight="balanced"`
- [ ] Add a precision-recall curve plot for each model
- [ ] Ensemble the supervised model and Isolation Forest score
- [ ] Explore `Amount` and `Time` distributions between fraud/non-fraud (real, tangible patterns even in anonymised data)
- [ ] Research and discuss why the original features were PCA-anonymised, and what that means for real-world model explainability requirements (e.g. regulatory adverse-action notices)

---

## 📚 Reference Lessons

- Day 42–43: Classification & evaluation metrics (Phase 4)
- Day 55: Advanced unsupervised learning — anomaly detection (Phase 5)
- Day 37B: Probability & cost-based decisions (Phase 4)

---

*This case study uses the same real, published dataset behind a peer-
reviewed IEEE paper on unbalanced fraud classification — genuine extreme
class imbalance that synthetic data generators routinely understate.*
