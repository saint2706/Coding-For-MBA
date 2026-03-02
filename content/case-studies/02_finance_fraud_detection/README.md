# 🏦 Case Study 02: Finance Fraud Detection

> **Phases covered**: Phase 5 (Advanced ML & Deep Learning)
> **Difficulty**: Advanced
> **Estimated time**: 8–10 hours

---

## 🎯 Case Overview

**GlobalPay**, a payment processing company handling 50 million transactions per
day, is losing **$18 M/year** to fraudulent card-not-present (CNP) transactions.
The current rules-based system catches only 60% of fraud while generating a
15% false-positive rate that frustrates legitimate customers.

Your mission: build an **anomaly-detection pipeline** that increases fraud recall
to ≥ 85% while keeping false positives below 5%, then explore a Graph Neural
Network approach to capture fraud ring patterns.

---

## 📋 Business Context

| Metric | Value |
| --- | --- |
| Daily transactions | 50 M |
| Fraud rate | 0.12% of transactions |
| Annual fraud loss | $18 M |
| Current detection recall | 60% |
| False positive rate | 15% |
| Cost per false positive | $3.50 (customer support + friction) |

**Key question:** *How do we detect more fraud without blocking legitimate
customers?*

---

## 🗂️ Project Structure

```
02_finance_fraud_detection/
├── README.md           ← this file (hand-holding guide)
├── starter.py          ← scaffold with TODOs
└── data_generator.py   ← creates synthetic transaction dataset
```

---

## 🛠️ Skills Applied

| Phase | Topics |
| ----- | ------ |
| Phase 5 | Isolation Forest, Autoencoders, SMOTE, precision-recall trade-offs |
| Phase 5 | GNN concepts (PyTorch Geometric), graph-based fraud detection |
| Phase 4 | Feature engineering, class imbalance, threshold optimisation |
| Phase 37B | Bayesian fraud scoring, conditional probability |

---

## 🤝 Hand-Holding Walkthrough

### Step 1 — Generate & Explore Transaction Data

**What:** Create a synthetic dataset of 100,000 transactions with typical
features: amount, time-of-day, merchant category, country, and a binary
`is_fraud` label (≈ 0.12% positive rate).

**Why:** Real fraud data is extremely imbalanced. Understanding this imbalance
is critical — accuracy is a useless metric here (99.88% accuracy by predicting
"not fraud" for every transaction).

**How:**

```python
python data_generator.py          # creates transactions.csv
df = pd.read_csv("transactions.csv")
print(f"Fraud rate: {df['is_fraud'].mean():.4%}")
print(df.describe())
```

**✅ Checkpoint:** Confirm fraud rate is ≈ 0.12%. Note that you have roughly
120 fraud cases in 100,000 transactions.

---

### Step 2 — Feature Engineering for Fraud Signals

**What:** Create velocity features (transactions per hour), amount deviation,
and geographic risk scores.

**Why:** Fraudsters exhibit patterns: rapid-fire small transactions to test
cards, followed by a large purchase. Velocity features capture this.

**How:**

```python
# Transaction velocity — how many txns in the last hour for this card
df = df.sort_values(["card_id", "timestamp"])
df["txn_count_1h"] = df.groupby("card_id")["timestamp"].transform(
    lambda s: s.diff().dt.total_seconds().fillna(9999).lt(3600).rolling(5).sum()
)

# Amount z-score per card
df["amount_zscore"] = df.groupby("card_id")["amount"].transform(
    lambda x: (x - x.mean()) / x.std().clip(lower=1)
)

# Cross-border flag
df["is_cross_border"] = (df["card_country"] != df["merchant_country"]).astype(int)
```

**✅ Checkpoint:** Fraudulent transactions should have significantly higher
`txn_count_1h` and `amount_zscore` values. Verify with a grouped mean.

---

### Step 3 — Isolation Forest (Unsupervised Anomaly Detection)

**What:** Train an Isolation Forest to flag anomalous transactions without
using labels.

**Why:** In production, new fraud patterns emerge before labelled data exists.
Unsupervised methods catch novel attack vectors.

**How:**

```python
from sklearn.ensemble import IsolationForest

features = ["amount", "txn_count_1h", "amount_zscore", "is_cross_border", "hour"]
iso = IsolationForest(contamination=0.002, random_state=42)
df["anomaly_score"] = iso.fit_predict(df[features])
df["iso_flag"] = (df["anomaly_score"] == -1).astype(int)

# Evaluate
from sklearn.metrics import precision_score, recall_score
print(f"Isolation Forest Recall: {recall_score(df['is_fraud'], df['iso_flag']):.2%}")
print(f"Isolation Forest Precision: {precision_score(df['is_fraud'], df['iso_flag']):.2%}")
```

**✅ Checkpoint:** Recall should be 40–60% (better than random, but not great
alone). This is our unsupervised baseline.

---

### Step 4 — Supervised Model with SMOTE

**What:** Train a supervised gradient-boosted classifier with SMOTE
oversampling to handle the extreme class imbalance.

**Why:** With labels available, supervised models outperform unsupervised ones.
SMOTE creates synthetic minority samples so the model learns the fraud
boundary.

**How:**

```python
from imblearn.over_sampling import SMOTE
from imblearn.pipeline import Pipeline as ImbPipeline
from xgboost import XGBClassifier
from sklearn.model_selection import StratifiedKFold, cross_val_score

smote_pipe = ImbPipeline([
    ("smote", SMOTE(random_state=42)),
    ("clf", XGBClassifier(
        scale_pos_weight=1,  # SMOTE handles imbalance
        eval_metric="aucpr",
        use_label_encoder=False,
        n_estimators=200,
        max_depth=5,
    )),
])

cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
scores = cross_val_score(smote_pipe, X, y, cv=cv, scoring="average_precision")
print(f"Average Precision (CV): {scores.mean():.3f} ± {scores.std():.3f}")
```

**✅ Checkpoint:** Average Precision ≥ 0.60 (much better than Isolation Forest).

---

### Step 5 — Threshold Optimisation

**What:** Choose the optimal probability threshold that maximises business
value (fraud caught × fraud value − false positive cost).

**Why:** The default 0.5 threshold is rarely optimal for imbalanced problems.
A lower threshold catches more fraud but increases false positives.

**How:**

```python
from sklearn.metrics import precision_recall_curve

y_prob = model.predict_proba(X_test)[:, 1]
precisions, recalls, thresholds = precision_recall_curve(y_test, y_prob)

# Business value function
fraud_value = 150   # average fraud loss prevented
fp_cost = 3.50      # cost per false positive
best_threshold = thresholds[
    np.argmax(recalls * fraud_value - (1 - precisions) * fp_cost)
]
print(f"Optimal threshold: {best_threshold:.3f}")
```

**✅ Checkpoint:** At the optimal threshold, recall ≥ 85% and precision ≥ 15%.

---

### Step 6 — Graph Neural Network Exploration (Stretch)

**What:** Model transactions as a graph where nodes are cards/merchants
and edges are transactions. Use a GNN to detect fraud ring patterns.

**Why:** Fraud rings share characteristics (same shipping addresses,
connected accounts). Tabular models miss these relational patterns.

**How:**

```python
# Conceptual — requires PyTorch Geometric
# Nodes: card accounts + merchant accounts
# Edges: transactions between them
# Node features: account age, avg txn amount, country
# Task: node classification (is this account part of a fraud ring?)

# This is a stretch goal — see PyTorch Geometric tutorials
# https://pytorch-geometric.readthedocs.io/
```

**✅ Checkpoint:** Write a 1-paragraph explanation of how a GNN would
improve detection of coordinated fraud rings vs. tabular models.

---

## 📊 Deliverables

| # | Deliverable | Format |
| - | --- | --- |
| 1 | EDA with transaction distribution analysis | Jupyter / .py |
| 2 | Isolation Forest anomaly detection baseline | .py |
| 3 | XGBoost + SMOTE supervised model | `.pkl` file |
| 4 | Precision-Recall curve with optimal threshold | PNG |
| 5 | Executive summary with ROI calculation | Markdown |

---

## 🏆 Stretch Goals

- [ ] Implement a simple autoencoder for anomaly detection (PyTorch)
- [ ] Build a real-time scoring API with FastAPI
- [ ] Add a GNN prototype with PyTorch Geometric
- [ ] Simulate a production monitoring dashboard (model drift detection)
- [ ] Calculate the ROI: fraud prevented − (false positive cost + model maintenance)

---

## 📚 Reference Lessons

- Day 53–56: Advanced model evaluation, precision-recall trade-offs (Phase 5)
- Day 57–60: Deep learning fundamentals, autoencoders (Phase 5)
- Day 37B: Bayesian probability — prior fraud rates, conditional probability
- Day 60C: Embeddings and vector representations

---

*Ship this case study to demonstrate your ability to handle extreme class
imbalance — a critical skill for fintech ML roles.*
