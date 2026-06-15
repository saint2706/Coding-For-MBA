---
day: 40
title: "Introduction to Machine Learning"
phase: 4
phaseTitle: "Mathematical Foundations & ML Fundamentals"
slug: "intro-ml"
duration: 55
difficulty: "intermediate"
tags:
  - machine-learning
  - sklearn
  - data-science
  - supervised-learning
concepts:
  - "supervised vs unsupervised learning"
  - "train-test split"
  - "model evaluation"
  - "overfitting and underfitting"
  - "cross-validation"
prerequisites: [38, 39]
outcomes:
  - "Understand ML paradigms and terminology"
  - "Split data correctly for evaluation"
  - "Train and evaluate basic models"
  - "Recognize overfitting and underfitting"
---

# 🎯 Day 40: Introduction to Machine Learning

> *"Machine learning is programming with examples instead of rules."*

---

## The "Never-Coded" Bridge

**Imagine teaching a child to recognize dogs.** You don't give them a rulebook ("four legs, fur, tail, barks"). Instead, you show them pictures: "Dog. Dog. Not dog. Dog." Eventually, they can recognize dogs they've never seen before.

That's machine learning. Instead of writing explicit rules, you provide examples. The algorithm figures out the patterns.

**Traditional programming:**

```
Data + Rules → Answers
```

**Machine learning:**

```
Data + Answers → Rules (Model)
```

**Real-world ML in action:**

- **Gmail**: Learns which emails you mark as spam to filter future spam
- **Netflix**: Learns your viewing patterns to suggest what to watch next
- **Banks**: Learn transaction patterns to detect fraudulent activity
- **Hospitals**: Learn from scans to assist in cancer detection

---

## The Technical Deep Dive

### ML Paradigms

| Type              | What It Learns                  | Input             | Output          | Examples                                                 |
| ----------------- | ------------------------------- | ----------------- | --------------- | -------------------------------------------------------- |
| **Supervised**    | Mapping inputs to known outputs | Features + Labels | Predictions     | Spam detection, price prediction, medical diagnosis      |
| **Unsupervised**  | Structure in unlabeled data     | Features only     | Groups/Patterns | Customer segmentation, anomaly detection, topic modeling |
| **Reinforcement** | Actions from trial and error    | States + Rewards  | Policy          | Game AI, robotics, autonomous driving                    |

### Foundational ML Concepts

**Generalization**
A model *generalizes* when it performs well on new, unseen data — not just on the training data it learned from. The entire goal of ML is to learn patterns that generalize, not to memorize training examples.

**Overfitting**
A model *overfits* when it learns the training data too specifically — memorizing noise rather than signal. Signs:

- Training accuracy >> test accuracy (large gap)
- Learning curve: training loss continues dropping while validation loss rises
- A 15-node decision tree that achieves 99% training accuracy but 72% test accuracy is overfit

**Underfitting**
A model *underfits* when it is too simple to capture the underlying pattern. Signs:

- Both training and test accuracy are low
- Learning curve: both training and validation loss plateau at a high value
- A linear model on clearly nonlinear data is underfit

**Bias–Variance Tradeoff**
Every model error decomposes into:

- **Bias** (systematic error from wrong assumptions) → underfitting → simple models
- **Variance** (sensitivity to training data fluctuations) → overfitting → complex models
- **Irreducible noise** (randomness in the data)

| Model | Bias | Variance | Typical Situation |
|-------|------|----------|------------------|
| Linear regression (simple) | High | Low | Underfit on complex relationships |
| Deep decision tree | Low | High | Overfit on training data |
| Random Forest | Low-Medium | Medium | Well-balanced; popular for tabular data |

**Training, Validation, and Test Sets**

- **Training set**: Data used to fit model parameters (weights)
- **Validation set**: Data used to tune hyperparameters and select the best model — never used to fit weights
- **Test set**: Data held out until final evaluation — used exactly once to report unbiased performance. Looking at test performance during development defeats its purpose.

### The Supervised Learning Workflow

```python
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score
import numpy as np
import pandas as pd

# Step 1: Prepare your data
# X = features (what you know)
# y = target (what you want to predict)
df = pd.DataFrame(
    {
        "sqft": [1400, 1600, 1700, 1875, 1100, 1550, 2350, 2450, 1425, 1700],
        "bedrooms": [3, 3, 2, 4, 2, 3, 4, 4, 3, 3],
        "price": [
            245000,
            312000,
            279000,
            308000,
            199000,
            289000,
            349000,
            392000,
            262000,
            299000,
        ],
    }
)

X = df[["sqft", "bedrooms"]]  # Features
y = df["price"]  # Target

# Step 2: Split into training and test sets
# NEVER train and test on the same data!
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,  # 20% for testing
    random_state=42,  # Reproducibility
)

print(f"Training samples: {len(X_train)}")
print(f"Testing samples: {len(X_test)}")
```

> **Why 80/20 and 5-fold?**
>
> The 80/20 split is a convention, not a mathematical rule. The right split depends on:
>
> | Factor | Guideline |
> |--------|----------|
> | Small dataset (n < 1,000) | 70/30 or use CV only — 20% test may be too small to be reliable |
> | Large dataset (n > 100,000) | 95/5 or 99/1 is fine — 1% of a million rows is still 10,000 |
> | Time-ordered data | Use chronological split — random splits create temporal leakage |
> | Grouped data (users, patients) | Split by group — the same user cannot be in both train and test |
> | Class imbalance | Use stratified split to preserve class ratio |
>
> For 5-fold CV: the choice of 5 folds gives each sample an 80% chance of being in training and 20% in validation. This is practically identical to an 80/20 split but repeated 5 times across different held-out subsets. 10-fold is better for small datasets; 3-fold saves compute for large ones.

```python
# Step 3: Train the model
model = LinearRegression()
model.fit(X_train, y_train)

# Step 4: Make predictions on unseen test data
y_pred = model.predict(X_test)

# Step 5: Evaluate performance
mse = mean_squared_error(y_test, y_pred)
rmse = np.sqrt(mse)
r2 = r2_score(y_test, y_pred)

print(f"RMSE: ${rmse:,.0f}")
print(f"R² Score: {r2:.3f}")
```

### Why We Split Data

```
All Data (100%)
├── Training Set (70-80%)
│   └── Model learns patterns from this
├── Validation Set (10-15%) [optional]
│   └── Tune hyperparameters
└── Test Set (15-20%)
    └── Final evaluation on truly unseen data
```

**The critical rule:** Never use test data for training or model selection. It must remain "unseen" until final evaluation.

```python
# Common mistake: evaluating on training data
train_score = model.score(X_train, y_train)  # Overly optimistic!
test_score = model.score(X_test, y_test)  # Realistic performance

print(f"Training score: {train_score:.3f}")
print(f"Test score: {test_score:.3f}")
# If train >> test, you're overfitting
```

### Overfitting vs Underfitting

```python
import numpy as np
import matplotlib.pyplot as plt
from sklearn.preprocessing import PolynomialFeatures
from sklearn.linear_model import LinearRegression
from sklearn.pipeline import make_pipeline

# Generate data: true relationship is quadratic
np.random.seed(42)
X = np.linspace(0, 10, 30).reshape(-1, 1)
y = 2 + 3 * X.squeeze() - 0.5 * X.squeeze() ** 2 + np.random.randn(30) * 2

# Fit models of different complexity
degrees = [1, 4, 15]  # Underfitting, Good fit, Overfitting
fig, axes = plt.subplots(1, 3, figsize=(15, 4))

for ax, degree in zip(axes, degrees):
    model = make_pipeline(PolynomialFeatures(degree), LinearRegression())
    model.fit(X, y)

    # Plot
    X_plot = np.linspace(0, 10, 100).reshape(-1, 1)
    y_plot = model.predict(X_plot)

    ax.scatter(X, y, alpha=0.7, label="Data")
    ax.plot(X_plot, y_plot, "r-", linewidth=2, label=f"Degree {degree}")
    ax.set_title(
        f"Degree {degree}: {'Underfit' if degree == 1 else 'Good fit' if degree == 4 else 'Overfit'}"
    )
    ax.set_xlabel("X")
    ax.set_ylabel("y")
    ax.legend()
    ax.set_ylim(-20, 30)

plt.tight_layout()
plt.show()

# What happened:
# Degree 1: Too simple - can't capture the curve (underfit)
# Degree 4: Just right - captures the pattern without noise
# Degree 15: Too complex - memorizes noise (overfit)
```

### Cross-Validation: Robust Evaluation

A single train-test split can be lucky or unlucky. Cross-validation gives a more reliable estimate.

```python
from sklearn.model_selection import cross_val_score
from sklearn.linear_model import LinearRegression

# 5-fold cross-validation
# Splits data into 5 parts, trains on 4, tests on 1, rotates
scores = cross_val_score(
    LinearRegression(),
    X,
    y,
    cv=5,  # 5 folds
    scoring="neg_mean_squared_error",  # Negative because sklearn maximizes
)

rmse_scores = np.sqrt(-scores)
print(f"RMSE across folds: {rmse_scores}")
print(f"Mean RMSE: {rmse_scores.mean():.3f} (+/- {rmse_scores.std():.3f})")
```

```
Fold 1: Train on 80%, Test on first 20%
Fold 2: Train on 80%, Test on second 20%
Fold 3: Train on 80%, Test on third 20%
Fold 4: Train on 80%, Test on fourth 20%
Fold 5: Train on 80%, Test on fifth 20%

Final score: Average across all 5 folds
```

### Evaluation Metrics

**For Regression:**

```python
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score

y_true = [100, 200, 300, 400, 500]
y_pred = [110, 190, 310, 400, 480]

# Mean Absolute Error: average absolute difference
mae = mean_absolute_error(y_true, y_pred)
print(f"MAE: {mae:.2f}")  # Easy to interpret

# Mean Squared Error: penalizes large errors more
mse = mean_squared_error(y_true, y_pred)
print(f"MSE: {mse:.2f}")

# Root MSE: same units as target
rmse = np.sqrt(mse)
print(f"RMSE: {rmse:.2f}")  # Most commonly used

# R²: proportion of variance explained (1 = perfect)
r2 = r2_score(y_true, y_pred)
print(f"R²: {r2:.3f}")
```

**For Classification:**

```python
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

y_true = [1, 0, 1, 1, 0, 1, 0, 0, 1, 1]
y_pred = [1, 0, 1, 0, 0, 1, 1, 0, 1, 1]

# Accuracy: % correct (can be misleading for imbalanced data!)
accuracy = accuracy_score(y_true, y_pred)
print(f"Accuracy: {accuracy:.2%}")

# Precision: Of predicted positives, how many are actually positive?
precision = precision_score(y_true, y_pred)
print(f"Precision: {precision:.2%}")

# Recall: Of actual positives, how many did we catch?
recall = recall_score(y_true, y_pred)
print(f"Recall: {recall:.2%}")

# F1: Harmonic mean of precision and recall
f1 = f1_score(y_true, y_pred)
print(f"F1 Score: {f1:.2%}")
```

### Metric Selection Guide

**Regression Metrics**

| Metric | Formula | When to Use | When NOT to Use |
|--------|---------|-------------|-----------------|
| MAE | mean(\|y − ŷ\|) | Error must be interpretable in original units; outliers should not dominate | When large errors are disproportionately costly |
| RMSE | √mean((y − ŷ)²) | Large errors are especially bad (financial forecasts, safety) | When outliers in target are common and acceptable |
| MAPE | mean(\|y−ŷ\|/y) | Percentage errors matter; useful for forecasting | When y can be zero or near-zero |
| R² | 1 − SS_res/SS_tot | Explaining variance; communicating to non-technical stakeholders | Never as sole metric in production |

**Classification Metrics**

| Metric | Formula | When to Use | When NOT to Use |
|--------|---------|-------------|-----------------|
| Accuracy | Correct / Total | Balanced classes, equal cost of errors | Imbalanced classes — always misleading |
| Precision | TP / (TP + FP) | Cost of false positives is high (spam filter, fraud alert) | When missing positives is costly |
| Recall (Sensitivity) | TP / (TP + FN) | Cost of false negatives is high (cancer screening, fraud detection) | When false alarms are costly |
| F1 Score | 2 × P × R / (P + R) | Balance between precision and recall; imbalanced classes | When the two error types have very different costs |
| ROC-AUC | Area under ROC curve | Model ranking/discrimination; comparing models | When class prevalence is very different between train and production |
| PR-AUC | Area under Precision-Recall curve | Imbalanced classes; rare positives | When classes are balanced |

**Decision rule**: Ask "What is the cost of a false positive vs false negative in business terms?" If FN cost >> FP cost (missed cancer, missed fraud), maximize recall. If FP cost >> FN cost (spam filter, intrusive alert), maximize precision.

---

## Senior-Level Insights

### Choosing the Right Metric

| Scenario            | Priority                    | Metric                                  |
| ------------------- | --------------------------- | --------------------------------------- |
| Spam filter         | Don't miss important emails | High Recall                             |
| Fraud detection     | Minimize false alarms       | High Precision                          |
| Medical screening   | Catch all cases             | High Recall                             |
| Balanced importance | Equal precision and recall  | F1 Score                                |
| Regression          | Interpretable error         | RMSE or MAE                             |
| Comparing models    | Statistical significance    | Cross-validation + confidence intervals |

### The Bias-Variance Tradeoff

|              | High Bias (Underfit)                 | High Variance (Overfit)                    |
| ------------ | ------------------------------------ | ------------------------------------------ |
| **Symptoms** | High error on train AND test         | Low train error, high test error           |
| **Model**    | Too simple                           | Too complex                                |
| **Data**     | Not using all features               | Memorizing noise                           |
| **Fix**      | Add features, use more complex model | Reduce features, regularize, get more data |

### Production ML Considerations

```python
# 1. Stratified split for classification (maintain class ratios)
from sklearn.model_selection import train_test_split

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    stratify=y,  # Maintain class balance
    random_state=42,
)

# 2. Time-series split (preserve temporal order)
from sklearn.model_selection import TimeSeriesSplit

tscv = TimeSeriesSplit(n_splits=5)
for train_idx, test_idx in tscv.split(X):
    X_train, X_test = X[train_idx], X[test_idx]
    # Train always comes before test in time

# 3. Group split (keep related samples together)
from sklearn.model_selection import GroupKFold

groups = df["customer_id"]  # Keep all transactions from same customer together
gkf = GroupKFold(n_splits=5)
for train_idx, test_idx in gkf.split(X, y, groups):
    # Customer in train won't appear in test
    pass
```

### Essential ML Engineering Practices

**Always Compare to a Baseline**
Before claiming your model "works," compare to trivial baselines:

- **Regression**: predict the mean; predict the last value; predict by category mean
- **Classification**: always predict the majority class; random classifier; predict by base rate
If your model cannot beat a baseline, it has not learned anything useful.

**Class Imbalance**
If 95% of customers do not churn, a model that always predicts "no churn" gets 95% accuracy while being completely useless. Solutions:

- `class_weight='balanced'` in sklearn: upweights minority class during training
- SMOTE: synthetic oversampling of minority class
- Adjust decision threshold: instead of 0.5, use a lower threshold to catch more churners

**Target Leakage**
A feature that is only available after the target is known will not be available at prediction time. Example: including `days_since_last_contact` in a churn model when that contact was triggered by early churn signals. Always audit feature availability with a timeline.

**Model Calibration**
A well-calibrated model produces predicted probabilities that match actual frequencies. Check:

```python
from sklearn.calibration import calibration_curve
fraction_of_positives, mean_predicted_value = calibration_curve(y_test, y_prob, n_bins=10)
```

A model with AUC=0.85 but poor calibration will mislead business stakeholders who use the probabilities to make decisions.

**Threshold Selection**
The default 0.5 threshold is rarely optimal. Choose the threshold that minimizes business cost:

```python
# For each threshold, compute (FP_cost × FP_count) + (FN_cost × FN_count)
thresholds = np.linspace(0, 1, 100)
costs = [fp_cost * FP(t) + fn_cost * FN(t) for t in thresholds]
optimal_threshold = thresholds[np.argmin(costs)]
```

### Model Governance Checklist

Before deploying any ML model, verify:

| Checkpoint | Question | Why It Matters |
|-----------|---------|----------------|
| **Metric ownership** | Who defined the success metric? Can they explain it to stakeholders? | Prevents "accuracy theatre" |
| **Reproducibility** | Can I re-run training and get the same result? | Debugging, auditing, regulatory requirements |
| **Subgroup evaluation** | Does the model perform equally across gender, region, age group? | Fairness; regulatory risk |
| **Drift monitoring** | How will you detect when input distributions change? | Models degrade silently |
| **Retraining triggers** | What metric degradation triggers a retrain? | Prevents stale models from making bad decisions |
| **Go/no-go criteria** | What test-set performance is required before deployment? | Prevents deploying underperforming models |
| **Rollback plan** | If the model fails in production, how do you revert? | Risk management |

---

## Hands-on Lab

### Exercise 1: Complete ML Workflow on Iris Dataset

**Business Scenario:** RetailCo wants to predict which customers will churn (not purchase in next 90 days). Marketing has a budget to contact 500 customers per month.

**Goal:** Build a baseline classification model and understand how to evaluate it beyond accuracy.

**Tasks:**

1. Load the provided customer dataset; split 80/20 with stratification on churn label
2. Train a LogisticRegression model; report accuracy, precision, recall, F1 on test set
3. Plot the confusion matrix
4. Plot the ROC curve and report AUC
5. Write a 1-sentence interpretation: "Of every 100 customers the model flags, ____ will actually churn."

**Expected Output:**

```
Test accuracy: ~0.82 (note: a model predicting "no churn" always gets ~0.80 with 80% non-churners)
Precision: ~0.58, Recall: ~0.51, F1: ~0.54
ROC-AUC: ~0.78
Interpretation: This model is better than random but precision is low — nearly half of flagged customers won't churn.
```

```python
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

# Load famous Iris dataset
iris = load_iris()
X, y = iris.data, iris.target
feature_names = iris.feature_names
target_names = iris.target_names

print(f"Features: {feature_names}")
print(f"Classes: {target_names}")
print(f"Shape: {X.shape}")

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# Experiment with different K values
k_values = range(1, 21)
train_scores = []
test_scores = []

for k in k_values:
    model = KNeighborsClassifier(n_neighbors=k)
    model.fit(X_train, y_train)
    train_scores.append(model.score(X_train, y_train))
    test_scores.append(model.score(X_test, y_test))

# Plot K vs accuracy
plt.figure(figsize=(10, 5))
plt.plot(k_values, train_scores, "b-", label="Training accuracy")
plt.plot(k_values, test_scores, "r-", label="Test accuracy")
plt.xlabel("K (number of neighbors)")
plt.ylabel("Accuracy")
plt.title("K-NN: Finding Optimal K")
plt.legend()
plt.grid(True, alpha=0.3)
plt.show()

# Best K
best_k = k_values[np.argmax(test_scores)]
print(f"Best K: {best_k}")

# Final model with cross-validation
final_model = KNeighborsClassifier(n_neighbors=best_k)
cv_scores = cross_val_score(final_model, X, y, cv=5)
print(f"CV Accuracy: {cv_scores.mean():.3f} (+/- {cv_scores.std():.3f})")

# Train final model and show confusion matrix
final_model.fit(X_train, y_train)
y_pred = final_model.predict(X_test)

print("\nClassification Report:")
print(classification_report(y_test, y_pred, target_names=target_names))

# Confusion matrix
cm = confusion_matrix(y_test, y_pred)
plt.figure(figsize=(8, 6))
sns.heatmap(
    cm,
    annot=True,
    fmt="d",
    cmap="Blues",
    xticklabels=target_names,
    yticklabels=target_names,
)
plt.xlabel("Predicted")
plt.ylabel("Actual")
plt.title("Confusion Matrix")
plt.show()
```

---

### Exercise 2: Detecting Overfitting

```python
import numpy as np
import matplotlib.pyplot as plt
from sklearn.preprocessing import PolynomialFeatures
from sklearn.linear_model import LinearRegression
from sklearn.pipeline import make_pipeline
from sklearn.model_selection import learning_curve

# Generate data
np.random.seed(42)
n_samples = 100
X = np.sort(np.random.uniform(0, 10, n_samples)).reshape(-1, 1)
y = np.sin(X.squeeze()) + np.random.normal(0, 0.3, n_samples)

# Compare learning curves for different model complexities
fig, axes = plt.subplots(1, 3, figsize=(15, 4))

for ax, degree in zip(axes, [1, 3, 10]):
    model = make_pipeline(PolynomialFeatures(degree), LinearRegression())

    train_sizes, train_scores, test_scores = learning_curve(
        model, X, y, train_sizes=np.linspace(0.1, 1.0, 10), cv=5
    )

    train_mean = train_scores.mean(axis=1)
    train_std = train_scores.std(axis=1)
    test_mean = test_scores.mean(axis=1)
    test_std = test_scores.std(axis=1)

    ax.fill_between(
        train_sizes,
        train_mean - train_std,
        train_mean + train_std,
        alpha=0.1,
        color="blue",
    )
    ax.fill_between(
        train_sizes,
        test_mean - test_std,
        test_mean + test_std,
        alpha=0.1,
        color="orange",
    )
    ax.plot(train_sizes, train_mean, "b-", label="Training score")
    ax.plot(
        train_sizes, test_mean, "o-", color="orange", label="Cross-validation score"
    )

    ax.set_xlabel("Training examples")
    ax.set_ylabel("Score")
    status = "Underfit" if degree == 1 else "Good" if degree == 3 else "Overfit"
    ax.set_title(f"Degree {degree}: {status}")
    ax.legend(loc="best")
    ax.set_ylim(-0.5, 1.1)
    ax.grid(True, alpha=0.3)

plt.tight_layout()
plt.show()

# Interpretation:
# Underfit: Both curves low, converge early
# Good fit: Both curves high, converge together
# Overfit: Training high, validation low (big gap)
```

---

### Exercise 3: Building a Complete Prediction Pipeline

**Business Scenario:** Predict quarterly sales for RetailCo stores.

**Tasks:**

1. Split data; train LinearRegression
2. Report RMSE, MAE, R² on test set
3. Plot predictions vs actuals — examine whether errors are random or systematic
4. Compare to a baseline: predict mean sales for every store

**Expected Output:**

```
Baseline RMSE (predict mean): ~$45,000
Linear model RMSE: ~$28,000
R²: ~0.61
Conclusion: Model reduces error by 38% vs baseline, but 39% of variance is unexplained.
```

```python
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score

# Create synthetic housing data
np.random.seed(42)
n = 500

data = pd.DataFrame(
    {
        "sqft": np.random.randint(800, 3000, n),
        "bedrooms": np.random.randint(1, 6, n),
        "bathrooms": np.random.randint(1, 4, n),
        "age": np.random.randint(0, 50, n),
        "garage": np.random.randint(0, 3, n),
    }
)

# Target with some noise
data["price"] = (
    100 * data["sqft"]
    + 20000 * data["bedrooms"]
    + 15000 * data["bathrooms"]
    - 500 * data["age"]
    + 10000 * data["garage"]
    + np.random.normal(0, 20000, n)
)

# Prepare features and target
X = data.drop("price", axis=1)
y = data["price"]

# Split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Scale features (important for some models)
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Define models to compare
models = {
    "Linear Regression": LinearRegression(),
    "Ridge (L2 Regularization)": Ridge(alpha=1.0),
    "Random Forest": RandomForestRegressor(n_estimators=100, random_state=42),
}

# Evaluate each model
results = []
for name, model in models.items():
    # Use scaled data for linear models
    X_tr = X_train_scaled if "Linear" in name or "Ridge" in name else X_train
    X_te = X_test_scaled if "Linear" in name or "Ridge" in name else X_test

    # Cross-validation
    cv_scores = cross_val_score(
        model, X_tr, y_train, cv=5, scoring="neg_mean_squared_error"
    )
    cv_rmse = np.sqrt(-cv_scores.mean())

    # Train and evaluate on test set
    model.fit(X_tr, y_train)
    y_pred = model.predict(X_te)
    test_rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    test_r2 = r2_score(y_test, y_pred)

    results.append(
        {"Model": name, "CV RMSE": cv_rmse, "Test RMSE": test_rmse, "Test R²": test_r2}
    )

# Display results
results_df = pd.DataFrame(results)
print("=== Model Comparison ===")
print(results_df.to_string(index=False))

# Feature importance for Random Forest
rf_model = models["Random Forest"]
importance = pd.DataFrame(
    {"Feature": X.columns, "Importance": rf_model.feature_importances_}
).sort_values("Importance", ascending=False)

print("\n=== Feature Importance (Random Forest) ===")
print(importance.to_string(index=False))
```

---

## Mastery Check

### Question 1: Why Split Data?

Why can't we evaluate a model on the same data it was trained on?

<details>
<summary>Click for Answer</summary>

**Answer:** Training performance is overly optimistic because the model has "seen" the answers.

**Analogy:** It's like giving a student the exam answers to study, then testing them with the same questions. They'll ace it, but have they really learned?

**The problem:**

- A model can memorize training data without learning generalizable patterns
- Training accuracy can be 100% even for a useless model
- Only truly unseen data reveals if the model generalizes

**Rule:** Always evaluate on data the model has never seen during training.

</details>

---

### Question 2: Identifying Overfitting

Your model has 98% training accuracy but 75% test accuracy. What's happening and how do you fix it?

<details>
<summary>Click for Answer</summary>

**Answer:** The model is **overfitting**—it memorized training data but doesn't generalize.

**Signs:**

- High training score, low test score
- Gap between train and test performance

**Fixes:**

1. **Simplify the model**: Fewer features, lower polynomial degree, shallower tree
2. **Regularization**: Add L1/L2 penalty (Ridge, Lasso)
3. **More data**: Harder to memorize larger datasets
4. **Early stopping**: Stop training before overfitting
5. **Dropout** (for neural networks): Randomly disable neurons during training
6. **Cross-validation**: Use to detect and tune against overfitting

</details>

---

### Question 3: Accuracy Pitfall

A fraud detection model has 99% accuracy. Why might this be misleading?

<details>
<summary>Click for Answer</summary>

**Answer:** If only 1% of transactions are fraudulent, a model that predicts "not fraud" for everything achieves 99% accuracy while catching zero fraud!

**The problem:** Accuracy ignores class imbalance.

**Better metrics for imbalanced data:**

- **Precision**: Of predicted frauds, how many are real?
- **Recall**: Of real frauds, how many did we catch?
- **F1 Score**: Balances precision and recall
- **ROC-AUC**: Measures discrimination ability

**Example:**

```
1000 transactions: 990 legitimate, 10 fraudulent
Model predicts: "Not fraud" for all
Accuracy: 990/1000 = 99%
Recall: 0/10 = 0% (caught no fraud!)
```

</details>

---

### Question 4: Cross-Validation Benefits

Why use 5-fold cross-validation instead of a single train-test split?

<details>
<summary>Click for Answer</summary>

**Answer:** Cross-validation gives a more reliable estimate by averaging across multiple splits.

**Benefits:**

1. **Every sample gets tested**: Each data point appears in test set exactly once
2. **Reduces variance**: Single split might be lucky/unlucky; averaging is more stable
3. **Confidence intervals**: Standard deviation across folds shows reliability
4. **Better use of data**: All data contributes to both training and evaluation

**When to use:**

- Small datasets (every sample counts)
- Model selection (comparing algorithms)
- Hyperparameter tuning

**Trade-off:** Takes 5x longer than single split.

</details>

---

### Question 5: Choosing K-Folds

You have 10,000 samples. Should you use 5-fold, 10-fold, or leave-one-out cross-validation?

<details>
<summary>Click for Answer</summary>

**Answer:** 5-fold or 10-fold. Leave-one-out is computationally expensive for large datasets.

**Trade-offs:**

| Folds   | Train Size | Computation                | Variance |
| ------- | ---------- | -------------------------- | -------- |
| 5-fold  | 80%        | Fast (5 models)            | Higher   |
| 10-fold | 90%        | Moderate (10 models)       | Lower    |
| LOOCV   | 99.99%     | Very slow (10,000 models!) | Lowest   |

**Guidelines:**

- **Small data (<1000)**: 10-fold or LOOCV
- **Medium data (1000-10000)**: 5-fold or 10-fold
- **Large data (>10000)**: 5-fold (or even 3-fold)

For 10,000 samples, 5-fold gives reliable estimates while training only 5 models.

</details>

---

## Math-to-Debug Tasks

1. **Math-foundation failure map**: For one failed baseline model, connect symptoms to foundation-level causes (linear algebra: collinearity, calculus: unstable optimization, statistics: distribution shift).
2. **Why-model-failed case**: Validation accuracy drops while training accuracy rises. Explain conceptually *why the model failed* (high variance + weak generalization assumptions), then take corrective action using stronger regularization, simpler hypothesis class, and cross-validation-based model selection.

---

## Glossary

| Term | Definition |
|------|-----------|
| Supervised learning | Learning from labeled (input, output) pairs |
| Unsupervised learning | Finding patterns without labeled outputs |
| Generalization | Model performs well on unseen data |
| Overfitting | Model memorizes training noise; fails on new data |
| Underfitting | Model too simple to capture patterns |
| Bias | Systematic error from wrong model assumptions |
| Variance | Sensitivity to fluctuations in training data |
| Training set | Data used to fit model parameters |
| Validation set | Data used to tune hyperparameters |
| Test set | Data held out for final, unbiased evaluation |
| Precision | Fraction of predicted positives that are truly positive |
| Recall | Fraction of actual positives that were predicted positive |
| ROC-AUC | Area under Receiver Operating Characteristic curve; measures discrimination |
| Calibration | Agreement between predicted probabilities and observed frequencies |

---

## Summary

Today you learned:

- ✅ ML learns patterns from data instead of explicit rules
- ✅ Supervised learning: features + labels → predictions
- ✅ Train-test split prevents evaluating on memorized data
- ✅ Overfitting: model too complex, memorizes noise
- ✅ Underfitting: model too simple, misses patterns
- ✅ Cross-validation gives reliable performance estimates
- ✅ Choose metrics appropriate to your problem (accuracy isn't always best)

**Tomorrow**: Supervised Learning—Regression in depth.
