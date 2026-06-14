---
day: 42
title: "Supervised Learning: Classification Part 1"
phase: 4
phaseTitle: "Mathematical Foundations & ML Fundamentals"
slug: "classification-part1"
duration: 55
difficulty: "intermediate"
tags:
  - machine-learning
  - classification
  - sklearn
  - logistic-regression
concepts:
  - "binary classification"
  - "logistic regression"
  - "confusion matrix"
  - "precision, recall, F1"
  - "ROC curves and AUC"
prerequisites: [40, 41]
outcomes:
  - "Build and interpret logistic regression models"
  - "Understand the confusion matrix"
  - "Choose appropriate classification metrics"
  - "Evaluate models with ROC curves"
---

# 🎯 Day 42: Supervised Learning—Classification Part 1

> *"Classification answers yes-or-no questions. Spam or not? Fraud or legitimate? Churn or stay?"*

---

## The "Never-Coded" Bridge

**You're building a spam filter.** Every email needs a decision: Inbox or Spam? This isn't a number—it's a category. And mistakes have different costs: missing spam is annoying, but blocking an important email could cost a deal.

That's classification: predicting **discrete categories** from input features.

**Classification everywhere:**

- **Gmail**: Spam detection
- **Banks**: Fraud detection
- **Hospitals**: Disease diagnosis (cancer/not cancer)
- **HR**: Resume screening
- **Security**: Malware detection
- **Marketing**: Customer churn prediction

---

## The Technical Deep Dive

### Core Classification Concepts

**Decision Threshold**
A classifier outputs a probability score (0 to 1). The *decision threshold* is the probability cutoff above which we predict "positive." The default is 0.5, but this is rarely optimal for business problems.
- Threshold=0.3: More positives predicted → higher recall, lower precision
- Threshold=0.7: Fewer positives predicted → higher precision, lower recall

**Score vs Probability**
Not all classifiers produce true probabilities. Logistic regression outputs calibrated probabilities. Decision trees and SVMs output scores that need calibration before being interpreted as probabilities.

**Calibration**
A *calibrated* model's predicted probability of 0.7 means: "Of all cases scored 0.7, roughly 70% are actually positive." Poor calibration misleads decision-makers who use predicted probabilities to set priorities.

**Prevalence / Base Rate**
The fraction of positive cases in the dataset. If only 5% of customers churn, a model that always predicts "no churn" gets 95% accuracy while being completely useless. Prevalence determines which metrics matter.

**Class Imbalance**
When one class is rare (fraud: 0.1%, disease: 1%, churn: 5–20%). Effects:
- Accuracy becomes misleading
- Models biased toward majority class without correction
- Solutions: `class_weight='balanced'`, SMOTE oversampling, threshold adjustment, use PR-AUC over ROC-AUC

### Logistic Regression: The Fundamental Classifier

Despite its name, logistic regression is for classification, not regression. It predicts probabilities by passing a linear score through the **sigmoid (logistic) function**:

$$
\sigma(z) = \frac{1}{1 + e^{-z}} \in (0, 1)
$$

The model is:

$$
P(y = 1 \mid \mathbf{x}) = \sigma(\mathbf{w}^\top \mathbf{x} + b) = \frac{1}{1 + \exp\!\big(-(\mathbf{w}^\top \mathbf{x} + b)\big)}
$$

Equivalently, the **log-odds (logit)** of $y = 1$ is linear in the features:

$$
\log\!\frac{P(y=1 \mid \mathbf{x})}{P(y=0 \mid \mathbf{x})} = \mathbf{w}^\top \mathbf{x} + b
$$

Parameters are fit by minimizing the **binary cross-entropy** (a.k.a. log-loss):

$$
\mathcal{L}_{\text{BCE}}(\mathbf{w}, b) = -\frac{1}{n} \sum_{i=1}^{n} \Big[ y_i \log \hat{p}_i + (1 - y_i) \log(1 - \hat{p}_i) \Big]
$$

where $\hat{p}_i = \sigma(\mathbf{w}^\top \mathbf{x}_i + b)$.

```python
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report

# Generate sample data: customer churn
np.random.seed(42)
n = 500

tenure = np.random.uniform(1, 72, n)  # Months with company
monthly_charges = np.random.uniform(20, 100, n)
usage_hours = np.random.uniform(0, 50, n)

# Churn probability increases with high charges and low tenure/usage
churn_prob = 1 / (
    1
    + np.exp(
        -(
            -3
            + 0.05 * monthly_charges
            - 0.05 * tenure
            - 0.1 * usage_hours
            + np.random.randn(n) * 0.5
        )
    )
)
churn = (np.random.random(n) < churn_prob).astype(int)

df = pd.DataFrame(
    {
        "tenure": tenure,
        "monthly_charges": monthly_charges,
        "usage_hours": usage_hours,
        "churn": churn,
    }
)

print(f"Churn rate: {churn.mean():.1%}")

# Prepare data
X = df[["tenure", "monthly_charges", "usage_hours"]]
y = df["churn"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# Train logistic regression
model = LogisticRegression()
model.fit(X_train, y_train)

# Predictions
y_pred = model.predict(X_test)
y_prob = model.predict_proba(X_test)[:, 1]  # Probability of churn

# Evaluate
print("\n=== Model Performance ===")
print(f"Accuracy: {accuracy_score(y_test, y_pred):.3f}")
print("\nClassification Report:")
print(classification_report(y_test, y_pred, target_names=["Stay", "Churn"]))
```

### Understanding the Confusion Matrix

The confusion matrix shows where your model gets it right and wrong.

```python
import seaborn as sns

# Create confusion matrix
cm = confusion_matrix(y_test, y_pred)
print("Confusion Matrix:")
print(cm)

# Visualize
plt.figure(figsize=(8, 6))
sns.heatmap(
    cm,
    annot=True,
    fmt="d",
    cmap="Blues",
    xticklabels=["Predicted: Stay", "Predicted: Churn"],
    yticklabels=["Actual: Stay", "Actual: Churn"],
)
plt.title("Confusion Matrix")
plt.ylabel("Actual")
plt.xlabel("Predicted")
plt.show()

# Interpretation:
# Top-left (TN): Correctly predicted Stay
# Top-right (FP): Wrongly predicted Churn (false alarm)
# Bottom-left (FN): Wrongly predicted Stay (missed churn!)
# Bottom-right (TP): Correctly predicted Churn

TN, FP, FN, TP = cm.ravel()
print(f"\nTrue Negatives (correct Stay): {TN}")
print(f"False Positives (false alarms): {FP}")
print(f"False Negatives (missed churns): {FN}")
print(f"True Positives (caught churns): {TP}")
```

### Precision, Recall, and F1 Score

Different metrics matter for different problems. Each is a simple ratio of confusion-matrix counts:

$$
\text{Precision} = \frac{TP}{TP + FP}, \qquad
\text{Recall} = \frac{TP}{TP + FN}
$$

The **F1 score** is their harmonic mean — it punishes models that ignore one of the two:

$$
F_1 = 2 \cdot \frac{\text{Precision} \cdot \text{Recall}}{\text{Precision} + \text{Recall}}
$$

A more general $F_\beta$ score lets you weight recall more heavily ($\beta > 1$) when missing positives is costly:

$$
F_\beta = (1 + \beta^2) \cdot \frac{\text{Precision} \cdot \text{Recall}}{\beta^2 \cdot \text{Precision} + \text{Recall}}
$$


```python
from sklearn.metrics import precision_score, recall_score, f1_score

precision = precision_score(y_test, y_pred)
recall = recall_score(y_test, y_pred)
f1 = f1_score(y_test, y_pred)

print("=== Classification Metrics ===")
print(f"Precision: {precision:.3f}")
print(f"  → Of all predicted churns, {precision:.1%} actually churned")
print(f"  → Low precision = too many false alarms")
print()
print(f"Recall: {recall:.3f}")
print(f"  → Of all actual churns, we caught {recall:.1%}")
print(f"  → Low recall = missing too many churns")
print()
print(f"F1 Score: {f1:.3f}")
print(f"  → Harmonic mean of precision and recall")
print(f"  → Use when you need to balance both")

# Visual representation
print("\n=== The Trade-off ===")
print("""
                    Actual Positive    Actual Negative
                    ---------------    ---------------
Predicted Positive       TP                 FP
                     (caught!)         (false alarm)
                    
Predicted Negative       FN                 TN
                     (missed!)         (correct reject)

Precision = TP / (TP + FP)  →  "How accurate are positive predictions?"
Recall    = TP / (TP + FN)  →  "How many positives did we catch?"
""")
```

### ROC Curve and AUC

The ROC curve shows performance across all possible thresholds. It plots the **true-positive rate** against the **false-positive rate**:

$$
\text{TPR} = \frac{TP}{TP + FN} = \text{Recall}, \qquad
\text{FPR} = \frac{FP}{FP + TN}
$$

**AUC** (area under the ROC curve) has a clean probabilistic meaning: it equals the probability that a randomly drawn positive sample is ranked higher than a randomly drawn negative one.

```python
from sklearn.metrics import roc_curve, roc_auc_score

# Get ROC curve data
fpr, tpr, thresholds = roc_curve(y_test, y_prob)
auc = roc_auc_score(y_test, y_prob)

# Plot
plt.figure(figsize=(8, 6))
plt.plot(fpr, tpr, "b-", linewidth=2, label=f"Model (AUC = {auc:.3f})")
plt.plot([0, 1], [0, 1], "k--", linewidth=1, label="Random (AUC = 0.5)")
plt.xlabel("False Positive Rate (1 - Specificity)")
plt.ylabel("True Positive Rate (Recall)")
plt.title("ROC Curve")
plt.legend(loc="lower right")
plt.grid(True, alpha=0.3)
plt.show()

print(f"AUC: {auc:.3f}")
print("Interpretation:")
print("  AUC = 0.5: Random guessing")
print("  AUC = 0.7-0.8: Acceptable")
print("  AUC = 0.8-0.9: Good")
print("  AUC > 0.9: Excellent")
```

### Threshold Tuning

The default threshold is 0.5, but you can adjust it.

```python
from sklearn.metrics import precision_recall_curve

# Get precision-recall curve
precisions, recalls, thresholds_pr = precision_recall_curve(y_test, y_prob)

# Find threshold for different targets
fig, axes = plt.subplots(1, 2, figsize=(14, 5))

# Precision-Recall curve
axes[0].plot(recalls, precisions, "b-", linewidth=2)
axes[0].set_xlabel("Recall")
axes[0].set_ylabel("Precision")
axes[0].set_title("Precision-Recall Curve")
axes[0].grid(True, alpha=0.3)

# Threshold impact
axes[1].plot(thresholds_pr, precisions[:-1], "b-", label="Precision")
axes[1].plot(thresholds_pr, recalls[:-1], "r-", label="Recall")
axes[1].axvline(x=0.5, color="k", linestyle="--", alpha=0.5, label="Default threshold")
axes[1].set_xlabel("Threshold")
axes[1].set_ylabel("Score")
axes[1].set_title("Precision & Recall vs Threshold")
axes[1].legend()
axes[1].grid(True, alpha=0.3)

plt.tight_layout()
plt.show()


# Custom threshold example
def predict_with_threshold(probs, threshold):
    return (probs >= threshold).astype(int)


for thresh in [0.3, 0.5, 0.7]:
    y_pred_custom = predict_with_threshold(y_prob, thresh)
    prec = precision_score(y_test, y_pred_custom)
    rec = recall_score(y_test, y_pred_custom)
    print(f"Threshold {thresh}: Precision={prec:.3f}, Recall={rec:.3f}")
```

---

## Senior-Level Insights

### Choosing the Right Metric

| Scenario             | Priority                                | Metric         | Why                        |
| -------------------- | --------------------------------------- | -------------- | -------------------------- |
| **Spam filter**      | Don't lose important emails             | High Precision | FP = losing business email |
| **Cancer screening** | Catch all cases                         | High Recall    | FN = missed cancer         |
| **Fraud detection**  | Balance cost of fraud vs. investigation | F1 or custom   | Both FP and FN have costs  |
| **Credit approval**  | Compare models                          | AUC            | Threshold-independent      |

### Handling Class Imbalance

Real-world classification often has imbalanced classes (1% fraud, 99% legitimate).

```python
# Check class balance
print(f"Class distribution:\n{y_train.value_counts(normalize=True)}")

# Solutions:

# 1. Class weights (built-in)
model_balanced = LogisticRegression(class_weight="balanced")
model_balanced.fit(X_train, y_train)

# 2. Adjust threshold
# Instead of 0.5, use lower threshold to catch more positives

# 3. Resampling (SMOTE)
# from imblearn.over_sampling import SMOTE
# smote = SMOTE()
# X_resampled, y_resampled = smote.fit_resample(X_train, y_train)

# 4. Use appropriate metrics (not accuracy!)
# With 99% negative, predicting all negative gives 99% accuracy!
```

### Model Coefficients Interpretation

```python
# Interpreting logistic regression coefficients
print("=== Coefficient Interpretation ===")
print(f"Intercept: {model.intercept_[0]:.3f}")
for name, coef in zip(X.columns, model.coef_[0]):
    odds_ratio = np.exp(coef)
    print(f"{name}: coef={coef:.3f}, odds_ratio={odds_ratio:.3f}")
    if odds_ratio > 1:
        print(f"  → Each unit increase multiplies churn odds by {odds_ratio:.2f}")
    else:
        print(
            f"  → Each unit increase multiplies churn odds by {odds_ratio:.2f} (reduces)"
        )
```

### Extended Classification Toolkit

**PR-AUC (Precision-Recall AUC)**
ROC-AUC can be optimistic for imbalanced data because it includes true negatives in the denominator. PR-AUC focuses only on the positive class:
```python
from sklearn.metrics import average_precision_score, PrecisionRecallDisplay
pr_auc = average_precision_score(y_test, y_prob)
PrecisionRecallDisplay.from_predictions(y_test, y_prob)
```
Rule of thumb: If positive class < 10% of data, prefer PR-AUC over ROC-AUC.

**Calibration Curves**
```python
from sklearn.calibration import calibration_curve, CalibrationDisplay
CalibrationDisplay.from_predictions(y_test, y_prob, n_bins=10)
# A perfectly calibrated model follows the diagonal line
```
To fix miscalibration: use `CalibratedClassifierCV(model, cv=5, method='isotonic')`.

**Handling Class Imbalance**
```python
# Option 1: Class weights (built-in to most sklearn models)
LogisticRegression(class_weight='balanced')

# Option 2: SMOTE (synthetic minority oversampling)
from imblearn.over_sampling import SMOTE
X_resampled, y_resampled = SMOTE(random_state=42).fit_resample(X_train, y_train)

# Option 3: Threshold adjustment (no retraining needed)
# Lower threshold from 0.5 to 0.3 to catch more positives
```

**Multiclass Classification Metrics**
For problems with >2 classes (e.g., product category prediction):
```python
from sklearn.metrics import classification_report
print(classification_report(y_test, y_pred))
# Shows per-class precision, recall, F1 + macro/weighted averages
```

**Fairness Across Subgroups**
Always evaluate model performance separately for key demographic or business subgroups:
```python
for group in ['North', 'South', 'East', 'West']:
    mask = test_df['region'] == group
    group_recall = recall_score(y_test[mask], y_pred[mask])
    print(f"{group}: recall={group_recall:.3f}")
```
If one subgroup has substantially lower recall (more missed churners), the model is inequitably serving that group.

### Critical: Threshold Selection Must Use Validation Data

**Never select your optimal threshold using the test set.**

The test set is reserved for a single, final, unbiased evaluation. If you tune the threshold on test data:
1. You're fitting a hyperparameter (threshold) to test data
2. Your reported metrics are optimistically biased
3. Production performance will be worse than reported

**Correct procedure:**
1. Train model on training set
2. Use validation set (or CV) to sweep thresholds and find the cost-minimizing threshold
3. Apply that threshold to the test set for a single final evaluation — report these numbers

**Production prevalence shifts**
The training set may have 15% churn rate, but production may shift to 8% after a product improvement. A threshold optimized for 15% prevalence will over-flag at 8% prevalence. Re-calibrate and re-validate the threshold periodically using recent labeled data.

### Metric Decision Guide

| Business Situation | Recommended Primary Metric | Reason |
|-------------------|--------------------------|--------|
| Equal cost of FP and FN; balanced classes | F1 Score | Harmonic mean of precision and recall |
| FN much costlier than FP (fraud, disease) | Recall (maximize) | Minimize missed positives |
| FP much costlier than FN (spam, intrusive alerts) | Precision (maximize) | Minimize false alarms |
| Need to rank/score cases (no threshold fixed yet) | ROC-AUC | Threshold-agnostic discrimination |
| Class imbalance (positive < 10%) | PR-AUC | Ignores TN dominance in ROC |
| Model probabilities used for decisions | Calibration (Brier score) | Accurate probability estimates matter |
| Must explain to stakeholders | Confusion matrix + business cost | Most transparent |

---

## Hands-on Lab

### Exercise 1: Building a Complete Churn Classifier

```python
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    roc_auc_score,
    precision_recall_curve,
)
import matplotlib.pyplot as plt

# Create realistic churn data
np.random.seed(42)
n = 1000

data = pd.DataFrame(
    {
        "tenure_months": np.random.exponential(24, n).clip(1, 72),
        "monthly_spend": np.random.uniform(30, 150, n),
        "support_calls": np.random.poisson(2, n),
        "contract_type": np.random.choice(
            ["month-to-month", "one-year", "two-year"], n, p=[0.5, 0.3, 0.2]
        ),
        "has_partner": np.random.choice([0, 1], n, p=[0.4, 0.6]),
    }
)

# Encode categorical
data["contract_monthly"] = (data["contract_type"] == "month-to-month").astype(int)

# Generate churn (higher for: low tenure, high support calls, monthly contracts)
churn_score = (
    -0.05 * data["tenure_months"]
    + 0.3 * data["support_calls"]
    + 1.5 * data["contract_monthly"]
    - 0.5 * data["has_partner"]
    - 1
)
data["churn"] = (np.random.random(n) < 1 / (1 + np.exp(-churn_score))).astype(int)

print(f"Churn rate: {data['churn'].mean():.1%}")

# Prepare features
features = [
    "tenure_months",
    "monthly_spend",
    "support_calls",
    "contract_monthly",
    "has_partner",
]
X = data[features]
y = data["churn"]

# Split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42
)

# Build pipeline
pipeline = Pipeline(
    [
        ("scaler", StandardScaler()),
        ("classifier", LogisticRegression(class_weight="balanced", random_state=42)),
    ]
)

# Cross-validate
cv_scores = cross_val_score(pipeline, X_train, y_train, cv=5, scoring="roc_auc")
print(f"CV AUC: {cv_scores.mean():.3f} (+/- {cv_scores.std():.3f})")

# Train and evaluate
pipeline.fit(X_train, y_train)
y_pred = pipeline.predict(X_test)
y_prob = pipeline.predict_proba(X_test)[:, 1]

print("\n=== Test Set Performance ===")
print(classification_report(y_test, y_pred, target_names=["Stay", "Churn"]))
print(f"AUC: {roc_auc_score(y_test, y_prob):.3f}")

# Feature importance
model = pipeline.named_steps["classifier"]
importance = pd.DataFrame(
    {
        "Feature": features,
        "Coefficient": model.coef_[0],
        "Odds_Ratio": np.exp(model.coef_[0]),
    }
).sort_values("Coefficient", key=abs, ascending=False)

print("\n=== Feature Importance ===")
print(importance.to_string(index=False))
```

**Business Scenario:** RetailCo loses an average of $800 when a customer churns (FN cost) and spends $60 on a retention campaign sent to a loyal customer (FP cost).

**Tasks:**
1. Train LogisticRegression and a second model of your choice on the churn dataset
2. Report: accuracy, precision, recall, F1, ROC-AUC for both models on test set
3. Plot the confusion matrix for the best model
4. Find the optimal probability threshold using business costs: minimize (800 × FN_count + 60 × FP_count)
5. Write a stakeholder-facing recommendation: "We recommend setting the model threshold at __%, which will contact __% of customers and retain approximately __ churners per month at a net cost saving of $__."

**Expected Outputs:**
Confusion Matrix (at threshold=0.5, example):
```
                Predicted No Churn  Predicted Churn
Actual No Churn        1,520                80      (FP=80, $60 each = $4,800)
Actual Churn             180               220      (FN=180, $800 each = $144,000)
Total cost at 0.5 threshold: ~$148,800/month
```

At optimal threshold (~0.35):
- FN reduced to ~90 (savings: $72,000)
- FP increased to ~200 (cost: $12,000)
- Net: ~$102,000 — 31% cost reduction vs default threshold

---

### Exercise 2: Threshold Optimization for Business Metrics

```python
import numpy as np
import matplotlib.pyplot as plt
from sklearn.metrics import precision_score, recall_score, f1_score

# Using data from Exercise 1
# Assume: Cost of FN (missed churn) = $500, Cost of FP (unnecessary retention offer) = $50

cost_fn = 500  # Lost customer
cost_fp = 50  # Wasted retention effort


def calculate_cost(y_true, y_pred, cost_fn, cost_fp):
    """Calculate total cost of predictions."""
    fn = ((y_true == 1) & (y_pred == 0)).sum()
    fp = ((y_true == 0) & (y_pred == 1)).sum()
    return fn * cost_fn + fp * cost_fp


# Test different thresholds
thresholds = np.linspace(0.1, 0.9, 50)
costs = []
precisions = []
recalls = []
f1s = []

for thresh in thresholds:
    y_pred_thresh = (y_prob >= thresh).astype(int)
    costs.append(calculate_cost(y_test.values, y_pred_thresh, cost_fn, cost_fp))
    precisions.append(precision_score(y_test, y_pred_thresh, zero_division=0))
    recalls.append(recall_score(y_test, y_pred_thresh, zero_division=0))
    f1s.append(f1_score(y_test, y_pred_thresh, zero_division=0))

# Plot
fig, axes = plt.subplots(1, 2, figsize=(14, 5))

# Cost curve
axes[0].plot(thresholds, costs, "b-", linewidth=2)
optimal_idx = np.argmin(costs)
axes[0].axvline(
    x=thresholds[optimal_idx],
    color="r",
    linestyle="--",
    label=f"Optimal: {thresholds[optimal_idx]:.2f}",
)
axes[0].set_xlabel("Threshold")
axes[0].set_ylabel("Total Cost ($)")
axes[0].set_title(f"Business Cost vs Threshold\n(FN=${cost_fn}, FP=${cost_fp})")
axes[0].legend()
axes[0].grid(True, alpha=0.3)

# Metrics curves
axes[1].plot(thresholds, precisions, "b-", label="Precision")
axes[1].plot(thresholds, recalls, "r-", label="Recall")
axes[1].plot(thresholds, f1s, "g-", label="F1")
axes[1].axvline(x=0.5, color="k", linestyle="--", alpha=0.5, label="Default (0.5)")
axes[1].axvline(
    x=thresholds[optimal_idx],
    color="orange",
    linestyle="--",
    label=f"Cost-optimal ({thresholds[optimal_idx]:.2f})",
)
axes[1].set_xlabel("Threshold")
axes[1].set_ylabel("Score")
axes[1].set_title("Classification Metrics vs Threshold")
axes[1].legend()
axes[1].grid(True, alpha=0.3)

plt.tight_layout()
plt.show()

print(f"Default threshold (0.5): Cost = ${costs[24]:,.0f}")
print(f"Optimal threshold ({thresholds[optimal_idx]:.2f}): Cost = ${min(costs):,.0f}")
print(f"Savings: ${costs[24] - min(costs):,.0f}")
```

> **How are FN and FP costs estimated in practice?**
>
> The $500 False Negative cost (missed churn) and $50 False Positive cost (unnecessary retention offer) above are illustrative. In practice, business teams estimate these from:
>
> - **FN cost** (missing a churner): Lost annual contract value minus average cost to retain (e.g., $1,200 revenue × 0.9 margin − $200 retention offer = $880 per missed churn)
> - **FP cost** (contacting a loyal customer): Retention offer cost + staff time − cannibalization risk
>
> These are estimates, not truths. Always run **sensitivity analysis**:
>
> ```python
> import numpy as np
>
> fn_costs = np.arange(100, 1000, 100)  # Test a range of FN costs
> fp_costs = np.arange(10, 200, 20)    # Test a range of FP costs
>
> for fn_cost in fn_costs:
>     for fp_cost in fp_costs:
>         total_cost = fn_cost * FN_count + fp_cost * FP_count
>         optimal_threshold = ... # recompute for these costs
> ```
>
> If the optimal threshold changes significantly across the plausible cost range, your decision is sensitive to cost assumptions — get better estimates from finance before committing.

---

### Exercise 3: Comparing Multiple Classifiers

```python
import numpy as np
import pandas as pd
from sklearn.model_selection import cross_val_score, StratifiedKFold
from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import KNeighborsClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.preprocessing import StandardScaler
import matplotlib.pyplot as plt

# Using same data
# Scale for KNN
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Define classifiers
classifiers = {
    "Logistic Regression": LogisticRegression(class_weight="balanced", random_state=42),
    "Logistic Reg (L1)": LogisticRegression(
        penalty="l1", solver="liblinear", class_weight="balanced", random_state=42
    ),
    "K-Nearest Neighbors": KNeighborsClassifier(n_neighbors=5),
    "Naive Bayes": GaussianNB(),
}

# Evaluate with cross-validation
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
results = []

for name, clf in classifiers.items():
    # Use scaled data for KNN
    X_for_cv = X_train_scaled if "Neighbors" in name else X_train

    # Cross-validate
    auc_scores = cross_val_score(clf, X_for_cv, y_train, cv=cv, scoring="roc_auc")
    f1_scores = cross_val_score(clf, X_for_cv, y_train, cv=cv, scoring="f1")

    results.append(
        {
            "Classifier": name,
            "AUC Mean": auc_scores.mean(),
            "AUC Std": auc_scores.std(),
            "F1 Mean": f1_scores.mean(),
            "F1 Std": f1_scores.std(),
        }
    )

results_df = pd.DataFrame(results)
print("=== Classifier Comparison (Cross-Validation) ===")
print(results_df.to_string(index=False))

# Visualize
fig, ax = plt.subplots(figsize=(10, 6))
x = np.arange(len(classifiers))
width = 0.35

bars1 = ax.bar(
    x - width / 2,
    results_df["AUC Mean"],
    width,
    yerr=results_df["AUC Std"],
    label="AUC",
    capsize=5,
)
bars2 = ax.bar(
    x + width / 2,
    results_df["F1 Mean"],
    width,
    yerr=results_df["F1 Std"],
    label="F1",
    capsize=5,
)

ax.set_ylabel("Score")
ax.set_title("Classifier Comparison")
ax.set_xticks(x)
ax.set_xticklabels(results_df["Classifier"], rotation=15, ha="right")
ax.legend()
ax.set_ylim(0, 1)
ax.grid(True, alpha=0.3, axis="y")

plt.tight_layout()
plt.show()
```

---

## Mastery Check

### Question 1: Accuracy Trap

A model predicts 95% of credit card transactions as "not fraud." Your dataset has 1% fraud. What's the accuracy, and why is this problematic?

<details>
<summary>Click for Answer</summary>

**Answer:** If the model predicts everything as "not fraud," accuracy is 99% (catching 99% of legitimate transactions). But it catches 0% of fraud!

**The problem:**

```
Dataset: 10,000 transactions
- 100 fraud (1%)
- 9,900 legitimate (99%)

Model predicts: All "not fraud"
- Correct: 9,900 (all legitimate)
- Wrong: 100 (all fraud missed)
- Accuracy: 99%
- Recall for fraud: 0%
```

**Better metrics for imbalanced data:**

- Recall (catches fraud)
- Precision (avoids false alarms)
- F1 Score (balances both)
- AUC (threshold-independent)

</details>

---

### Question 2: Precision vs Recall Trade-off

Your fraud detection system has precision=0.9 and recall=0.5. What does this mean in business terms?

<details>
<summary>Click for Answer</summary>

**Answer:**

- **Precision = 0.9**: Of transactions flagged as fraud, 90% are actually fraudulent. Only 10% are false alarms.
- **Recall = 0.5**: Of all actual fraud, we catch only 50%. Half the fraudsters get away!

**Business interpretation:**

- Good at not bothering legitimate customers (few false alarms)
- Bad at catching fraud (half of fraudulent transactions slip through)

**Should you adjust?**
If fraud is costly, lower the threshold to catch more (increase recall), accepting more false alarms (lower precision).

</details>

---

### Question 3: Confusion Matrix

From this confusion matrix, calculate precision and recall:

```
              Predicted Positive  Predicted Negative
Actual Positive         40              10
Actual Negative         20              130
```

<details>
<summary>Click for Answer</summary>

**Extract values:**

- TP = 40 (correctly predicted positive)
- FN = 10 (missed positives)
- FP = 20 (false alarms)
- TN = 130 (correctly rejected)

**Precision** = TP / (TP + FP) = 40 / (40 + 20) = 40/60 = **0.667**

- "Of 60 predicted positives, 40 were correct"

**Recall** = TP / (TP + FN) = 40 / (40 + 10) = 40/50 = **0.800**

- "Of 50 actual positives, we caught 40"

**Accuracy** = (TP + TN) / Total = (40 + 130) / 200 = **0.850**

</details>

---

### Question 4: When to Use AUC

When is AUC more useful than accuracy or F1?

<details>
<summary>Click for Answer</summary>

**Use AUC when:**

1. **Comparing models** regardless of threshold choice
2. **Threshold not decided yet** — AUC measures discrimination ability
3. **Ranking matters more than classification** (e.g., prioritizing high-risk customers)
4. **Class distribution might change** between train and production

**AUC measures:**

- How well the model separates classes
- Probability that a random positive ranks higher than a random negative
- Invariant to class imbalance

**Don't use AUC when:**

- You need a specific threshold for decisions
- The business cost structure is asymmetric
- You need calibrated probabilities (AUC doesn't require calibration)

</details>

---

### Question 5: Threshold Selection

A medical test has these results at threshold=0.5:

- Precision: 0.95 (few false positives)
- Recall: 0.70 (misses 30% of cases)

The disease is deadly if untreated. Should you adjust the threshold?

<details>
<summary>Click for Answer</summary>

**Answer:** Yes, **lower the threshold** to catch more cases (increase recall).

**Reasoning:**

- Deadly disease → missing a case (FN) is catastrophic
- False positive (FP) means unnecessary testing, but patient survives
- Current recall of 70% means 30% of sick patients are sent home!

**Action:**

```python
# Lower threshold from 0.5 to, say, 0.3
y_pred = (y_prob >= 0.3).astype(int)
```

**Result:**

- Recall increases (catch more sick patients)
- Precision decreases (more healthy people flagged)
- This trade-off is acceptable for deadly diseases

**General principle:** Match threshold to cost structure. When FN is catastrophic, prioritize recall.

</details>

---

## Math-to-Debug Tasks

1. **Confusion-matrix diagnosis tied to assumptions**: Diagnose whether class overlap, threshold choice, or class imbalance is driving FP/FN patterns; relate findings to probability calibration and decision-threshold assumptions.
2. **Why-model-failed case (classification)**: Model shows 92% accuracy but misses most positives. Explain conceptually *why the model failed* (accuracy paradox under imbalance + default threshold assumption), then take corrective action with class-weighting, threshold tuning, and PR-AUC/F1 tracking.

---

## Summary

Today you learned:

- ✅ Classification predicts categories, not numbers
- ✅ Logistic regression outputs probabilities via the sigmoid: $\sigma(z) = 1 / (1 + e^{-z})$
- ✅ Trained by minimizing log-loss: $\mathcal{L} = -\tfrac{1}{n}\sum [y \log \hat{p} + (1 - y) \log(1 - \hat{p})]$
- ✅ Confusion matrix shows $TP$, $TN$, $FP$, $FN$
- ✅ Precision $= TP / (TP + FP)$: how accurate are positive predictions?
- ✅ Recall $= TP / (TP + FN)$: how many positives did we catch?
- ✅ $F_1 = 2 \cdot \text{Prec} \cdot \text{Rec} / (\text{Prec} + \text{Rec})$: harmonic mean of precision and recall
- ✅ ROC-AUC: classifier performance across all thresholds
- ✅ Threshold tuning matches business costs

**Tomorrow**: Classification Part 2—Decision Trees and Random Forests.
