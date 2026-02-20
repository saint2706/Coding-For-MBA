---
day: 52
title: "Ensemble Methods"
phase: 5
phaseTitle: "Advanced ML & Deep Learning"
slug: "ensemble-methods"
duration: 55
difficulty: "advanced"
tags:
  - machine-learning
  - ensemble
  - random-forest
  - gradient-boosting
  - xgboost
concepts:
  - "bagging and boosting"
  - "Random Forest"
  - "Gradient Boosting"
  - "XGBoost and LightGBM"
  - "ensemble stacking"
prerequisites: [41, 42, 43]
outcomes:
  - "Understand bagging vs boosting strategies"
  - "Build and tune Random Forest models"
  - "Master gradient boosting with XGBoost"
  - "Stack multiple models for maximum performance"
---

# 🎯 Day 52: Ensemble Methods

> *"Wisdom of the crowd: many weak learners become one strong learner."*

---

## The "Never-Coded" Bridge

**Imagine making a critical business decision.** Do you:

- **A)** Ask one expert and trust their opinion 100%?
- **B)** Poll 100 experts and take the majority vote?

**Option B** is almost always better. Even if each expert is only 60% accurate, combining their opinions yields 85%+ accuracy. This is the **wisdom of the crowd**.

**Ensemble methods** apply this principle to machine learning:

- Train many models (the "experts")
- Combine their predictions
- Get better accuracy than any single model

**Real-world ensembles:**

- **Netflix Prize Winner (2009)**: Team blended 107 algorithms → 10% better than Netflix's system
- **Kaggle Competitions**: Top solutions are almost always ensembles of 5-20 models
- **Random Forest**: Used by Uber for rider demand prediction (handles 100M+ predictions/day)
- **XGBoost**: Powers fraud detection at PayPal, ad click prediction at Microsoft

---

## The Technical Deep Dive

### Bagging: Bootstrap Aggregating  

**Idea**: Train many models on random subsets of data, average their predictions.

```python
import numpy as np
import matplotlib.pyplot as plt
from sklearn.datasets import make_moons
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import BaggingClassifier
from sklearn.metrics import accuracy_score

# Generate non-linear data
X, y = make_moons(n_samples=500, noise=0.3, random_state=42)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)

# Single decision tree (high variance, overfits)
tree = DecisionTreeClassifier(random_state=42)
tree.fit(X_train, y_train)
single_accuracy = accuracy_score(y_test, tree.predict(X_test))

# Bagging: 50 trees on random samples
bagging = BaggingClassifier(
    estimator=DecisionTreeClassifier(),
    n_estimators=50,
    max_samples=0.8,  # Each tree sees 80% of data (bootstrap sample)
    random_state=42
)
bagging.fit(X_train, y_train)
bagging_accuracy = accuracy_score(y_test, bagging.predict(X_test))

print(f"Single Tree Accuracy: {single_accuracy:.3f}")
print(f"Bagging (50 trees) Accuracy: {bagging_accuracy:.3f}")
print(f"Improvement: {bagging_accuracy - single_accuracy:.3f}")

# Visualize decision boundaries
def plot_decision_boundary(model, X, y, title):
    h = .02
    x_min, x_max = X[:, 0].min() - 0.5, X[:, 0].max() + 0.5
    y_min, y_max = X[:, 1].min() - 0.5, X[:, 1].max() + 0.5
    xx, yy = np.meshgrid(np.arange(x_min, x_max, h),
                         np.arange(y_min, y_max, h))
    
    Z = model.predict(np.c_[xx.ravel(), yy.ravel()])
    Z = Z.reshape(xx.shape)
    
    plt.contourf(xx, yy, Z, alpha=0.3, cmap='RdYlBu')
    plt.scatter(X[:, 0], X[:, 1], c=y, edgecolors='k', cmap='RdYlBu')
    plt.title(title)

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))

plt.sca(ax1)
plot_decision_boundary(tree, X_test, y_test, f'Single Tree (Acc: {single_accuracy:.2f})')

plt.sca(ax2)
plot_decision_boundary(bagging, X_test, y_test, f'Bagging (Acc: {bagging_accuracy:.2f})')

plt.tight_layout()
plt.show()
```

### Random Forest: Bagging + Feature Randomness

**Random Forest = Bagging + Random Feature Selection**

Each tree sees:

- Random **sample** of data (bootstrap)
- Random **subset** of features at each split

This decorrelates trees → better ensemble performance.

```python
from sklearn.ensemble import RandomForestClassifier
from sklearn.datasets import load_breast_cancer
import pandas as pd

# Load dataset
cancer = load_breast_cancer()
X, y = cancer.data, cancer.target
feature_names = cancer.feature_names

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)

# Train Random Forest
rf = RandomForestClassifier(
    n_estimators=100,      # Number of trees
    max_depth=10,          # Limit tree depth
    min_samples_split=10,  # Don't split tiny nodes
    max_features='sqrt',   # √n features per split (default for classification)
    random_state=42
)
rf.fit(X_train, y_train)

# Evaluate
rf_accuracy = accuracy_score(y_test, rf.predict(X_test))
print(f"Random Forest Accuracy: {rf_accuracy:.3f}")

# Feature importance
importance_df = pd.DataFrame({
    'Feature': feature_names,
    'Importance': rf.feature_importances_
}).sort_values('Importance', ascending=False)

print("\n=== Top 10 Most Important Features ===")
print(importance_df.head(10).to_string(index=False))

# Visualize
plt.figure(figsize=(10, 6))
plt.barh(importance_df['Feature'][:15], importance_df['Importance'][:15])
plt.xlabel('Importance')
plt.title('Random Forest Feature Importance')
plt.gca().invert_yaxis()
plt.tight_layout()
plt.show()
```

### Boosting: Sequential Learning

**Idea**: Train models sequentially, each correcting the previous model's mistakes.

```python
from sklearn.ensemble import GradientBoostingClassifier

# Gradient Boosting
gb = GradientBoostingClassifier(
    n_estimators=100,
    learning_rate=0.1,  # Shrinkage factor (smaller = more robust)
    max_depth=3,         # Shallow trees (weak learners)
    random_state=42
)
gb.fit(X_train, y_train)

gb_accuracy = accuracy_score(y_test, gb.predict(X_test))
print(f"Gradient Boosting Accuracy: {gb_accuracy:.3f}")

# Compare all methods
print("\n=== Model Comparison ===")
print(f"Single Tree:       {single_accuracy:.3f}")
print(f"Random Forest:     {rf_accuracy:.3f}")
print(f"Gradient Boosting: {gb_accuracy:.3f}")
```

### XGBoost: Extreme Gradient Boosting

**XGBoost** is an optimized implementation of gradient boosting with:

- Regularization (L1/L2) to prevent overfitting
- Parallel processing for speed
- Handling of missing values
- Built-in cross-validation

```python
import xgboost as xgb
from sklearn.metrics import classification_report, roc_auc_score

# XGBoost Classifier
xgb_model = xgb.XGBClassifier(
    n_estimators=100,
    learning_rate=0.1,
    max_depth=5,
    subsample=0.8,          # Row sampling
    colsample_bytree=0.8,   # Column sampling
    reg_alpha=0.1,          # L1 regularization
    reg_lambda=1.0,         # L2 regularization
    random_state=42
)

xgb_model.fit(X_train, y_train)

# Predict
y_pred = xgb_model.predict(X_test)
y_proba = xgb_model.predict_proba(X_test)[:, 1]

# Evaluate
xgb_accuracy = accuracy_score(y_test, y_pred)
xgb_auc = roc_auc_score(y_test, y_proba)

print(f"XGBoost Accuracy: {xgb_accuracy:.3f}")
print(f"XGBoost AUC: {xgb_auc:.3f}")

print("\n=== Classification Report ===")
print(classification_report(y_test, y_pred, target_names=['Malignant', 'Benign']))

# Feature importance
xgb.plot_importance(xgb_model, max_num_features=15, importance_type='gain')
plt.title('XGB Feature Importance (Gain)')
plt.tight_layout()
plt.show()
```

### LightGBM: Microsoft's Fast Gradient Boosting

**LightGBM** is even faster than XGBoost for large datasets (millions of rows).

```python
import lightgbm as lgb

# LightGBM Classifier
lgb_model = lgb.LGBMClassifier(
    n_estimators=100,
    learning_rate=0.1,
    max_depth=5,
    num_leaves=31,
    random_state=42
)

lgb_model.fit(X_train, y_train)

lgb_accuracy = accuracy_score(y_test, lgb_model.predict(X_test))
print(f"LightGBM Accuracy: {lgb_accuracy:.3f}")
```

### Stacking: Meta-Ensemble

**Stacking** combines different model types using a meta-model.

```python
from sklearn.ensemble import StackingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC

# Base models
base_models = [
    ('rf', RandomForestClassifier(n_estimators=50, random_state=42)),
    ('gb', GradientBoostingClassifier(n_estimators=50, random_state=42)),
    ('svm', SVC(probability=True, random_state=42))
]

# Meta-model
meta_model = LogisticRegression()

# Stacking ensemble
stacking = StackingClassifier(
    estimators=base_models,
    final_estimator=meta_model,
    cv=5
)

stacking.fit(X_train, y_train)

stacking_accuracy = accuracy_score(y_test, stacking.predict(X_test))
print(f"Stacking Ensemble Accuracy: {stacking_accuracy:.3f}")
```

---

## Senior-Level Insights

### Bagging vs Boosting

| Aspect               | Bagging (Random Forest)      | Boosting (XGBoost)        |
| -------------------- | ---------------------------- | ------------------------- |
| **Training**         | Parallel (independent trees) | Sequential (iterative)    |
| **Reduces**          | Variance (overfitting)       | Bias (underfitting)       |
| **Base Learners**    | Deep trees                   | Shallow trees (stumps)    |
| **Speed**            | Fast (parallelizable)        | Slower (sequential)       |
| **Overfitting**      | Resistant                    | Prone if not regularized  |
| **Interpretability** | Feature importance           | Feature importance + SHAP |
| **When to Use**      | Default choice, stable       | Maximum accuracy, tuning  |

### Hyperparameter Tuning Guide

**Random Forest:**

```python
# Most important
n_estimators = 100-500    # More trees = better (diminishing returns)
max_depth = 10-30          # Control overfitting
min_samples_split = 2-20   # Prevent tiny splits

# Less critical
max_features = 'sqrt'      # √n features per split
```

**XGBoost:**

```python
# Learning
learning_rate = 0.01-0.3   # Lower = more robust, needs more trees
n_estimators = 100-1000    # More trees if learning_rate is low

# Tree structure
max_depth = 3-10           # Shallow trees (3-6) prevent overfitting
min_child_weight = 1-10    # Minimum samples in leaf

# Sampling
subsample = 0.6-1.0        # Row sampling
colsample_bytree = 0.6-1.0 # Column sampling

# Regularization
reg_alpha = 0-1            # L1 (Lasso)
reg_lambda = 0-10          # L2 (Ridge)
```

### Production Considerations

```python
# Memory: Random Forest stores all trees
# XGBoost: 100 trees × 1MB = 100MB model size
# Trade-off: Accuracy vs model size

# Latency: Prediction time
# Random Forest: O(n_trees × depth) – parallel
# XGBoost: O(n_trees × depth) – sequential but optimized

# For production with strict latency (<10ms):
# - Use fewer, shallower trees
# - Consider model distillation (train small model to mimic ensemble)
```

---

## Hands-on Lab

### Exercise 1: Random Forest vs XGBoost Comparison

```python
import numpy as np
import pandas as pd
from sklearn.datasets import make_classification
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.ensemble import RandomForestClassifier
import xgboost as xgb
import time

# Create challenging dataset
X, y = make_classification(
    n_samples=10000,
    n_features=20,
    n_informative=15,
    n_redundant=5,
    random_state=42
)

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Define models
models = {
    'Random Forest (50 trees)': RandomForestClassifier(n_estimators=50, max_depth=10, random_state=42),
    'Random Forest (200 trees)': RandomForestClassifier(n_estimators=200, max_depth=10, random_state=42),
    'XGBoost (lr=0.1)': xgb.XGBClassifier(n_estimators=100, learning_rate=0.1, max_depth=5, random_state=42),
    'XGBoost (lr=0.01)': xgb.XGBClassifier(n_estimators=500, learning_rate=0.01, max_depth=5, random_state=42),
}

# Benchmark all models
results = []
for name, model in models.items():
    # Cross-validation
    start_time = time.time()
    cv_scores = cross_val_score(model, X_train, y_train, cv=5, scoring='roc_auc')
    cv_time = time.time() - start_time
    
    # Train on full training set
    start_time = time.time()
    model.fit(X_train, y_train)
    train_time = time.time() - start_time
    
    # Test set performance
    test_score = model.score(X_test, y_test)
    
    results.append({
        'Model': name,
        'CV AUC (mean)': cv_scores.mean(),
        'CV AUC (std)': cv_scores.std(),
        'Test Accuracy': test_score,
        'CV Time (s)': cv_time,
        'Train Time (s)': train_time
    })

results_df = pd.DataFrame(results)
print("=== Model Comparison ===")
print(results_df.to_string(index=False))

# Winner analysis
best_model = results_df.loc[results_df['Test Accuracy'].idxmax()]
print(f"\n🏆 Best Model: {best_model['Model']}")
print(f"   Test Accuracy: {best_model['Test Accuracy']:.4f}")
```

---

### Exercise 2: Hyperparameter Tuning with GridSearchCV

```python
from sklearn.model_selection import GridSearchCV
import xgboost as xgb

# Define parameter grid
param_grid = {
    'n_estimators': [50, 100, 200],
    'max_depth': [3, 5, 7],
    'learning_rate': [0.01, 0.1, 0.3],
    'subsample': [0.8, 1.0],
    'colsample_bytree': [0.8, 1.0]
}

# Grid search
grid_search = GridSearchCV(
    xgb.XGBClassifier(random_state=42),
    param_grid,
    cv=3,
    scoring='roc_auc',
    n_jobs=-1,
    verbose=1
)

grid_search.fit(X_train, y_train)

# Best parameters
print("=== Best Parameters ===")
print(grid_search.best_params_)
print(f"Best CV AUC: {grid_search.best_score_:.4f}")

# Test performance
best_model = grid_search.best_estimator_
test_score = best_model.score(X_test, y_test)
print(f"Test Accuracy: {test_score:.4f}")

# Analyze grid search results
results_grid = pd.DataFrame(grid_search.cv_results_)
top_5 = results_grid.nsmallest(5, 'rank_test_score')[['param_n_estimators', 'param_max_depth', 'param_learning_rate', 'mean_test_score']]
print("\n=== Top 5 Configurations ===")
print(top_5.to_string(index=False))
```

---

### Exercise 3: Building a Stacked Ensemble

```python
from sklearn.ensemble import StackingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier

# Diverse base models
base_models = [
    ('rf', RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)),
    ('xgb', xgb.XGBClassifier(n_estimators=100, learning_rate=0.1, max_depth=5, random_state=42)),
    ('svm', SVC(probability=True, C=1.0, random_state=42)),
    ('knn', KNeighborsClassifier(n_neighbors=5))
]

# Meta-model (learns how to combine base predictions)
meta_model = LogisticRegression()

# Stacking
stacking = StackingClassifier(
    estimators=base_models,
    final_estimator=meta_model,
    cv=5,
    passthrough=False  # Only use base predictions, not original features
)

stacking.fit(X_train, y_train)

# Evaluate
stacking_score = stacking.score(X_test, y_test)
print(f"Stacking Ensemble Test Accuracy: {stacking_score:.4f}")

# Compare to best individual model
individual_scores = []
for name, model in base_models:
    model.fit(X_train, y_train)
    score = model.score(X_test, y_test)
    individual_scores.append({'Model': name, 'Accuracy': score})
    print(f"{name}: {score:.4f}")

print(f"\nStacking (ensemble): {stacking_score:.4f}")
print(f"Improvement over best single model: {stacking_score - max([s['Accuracy'] for s in individual_scores]):.4f}")
```

---

## Mastery Check

### Question 1: Bagging vs Boosting

When would you choose Random Forest over XGBoost, despite XGBoost often having higher accuracy?

<details>
<summary>Click for Answer</summary>

**Answer:** Choose Random Forest when you need speed, simplicity, or resistance to overfitting without heavy tuning.

**Scenarios favoring Random Forest:**

1. **Limited time for tuning**
   - RF works well with default params
   - XGBoost requires careful tuning (learning_rate, max_depth, regularization)

2. **Training speed matters**
   - RF trains in parallel → faster on multi-core machines
   - XGBoost is sequential → slower

3. **Small datasets (\<10K samples)**
   - Boosting can overfit easily
   - Bagging is more robust

4. **Noisy labels**
   - RF averages out noise
   - Boosting amplifies noise (focuses on "hard" examples, including mislabeled ones)

5. **Production simplicity**
   - RF has fewer hyperparameters to monitor
   - XGBoost requires more careful deployment

**Example:**

```python
# Quick model for exploratory analysis
rf = RandomForestClassifier()  # Works out of the box
rf.fit(X, y)

# Production model after tuning phase
xgb_tuned = XGBClassifier(
    n_estimators=500, learning_rate=0.01, max_depth=5,
    subsample=0.8, colsample_bytree=0.8, reg_alpha=0.1
)  # Needs tuning, but yields +2-3% accuracy
```

**Rule of thumb**: Start with RF, optimize to XGBoost if accuracy gains justify the complexity.

</details>

---

### Question 2: Feature Importance Reliability

Your Random Forest ranks Feature A as most important. Can you trust this for feature selection?

<details>
<summary>Click for Answer</summary>

**Answer:** Be cautious. Random Forest feature importance has biases: it favors high-cardinality and continuous features over categorical/binary ones.

**The problem:**

**Bias 1: High cardinality**

```python
# Feature A: 1000 unique values (customer ID)
# Feature B: 2 values (gender: M/F)
# RF may rank A higher even if B is more predictive
# (More split opportunities with high cardinality)
```

**Bias 2: Correlated features**

```python
# Feature 1: Revenue Q1
# Feature 2: Revenue Q2
# If correlated, importance is split between them
# Both appear "less important" than they actually are
```

**Better approaches:**

1. **Permutation importance** (model-agnostic)

   ```python
   from sklearn.inspection import permutation_importance
   
   perm_importance = permutation_importance(rf, X_test, y_test, n_repeats=10, random_state=42)
   # Shuffles each feature, measures performance drop
   ```

2. **SHAP values** (SHapley Additive exPlanations)

   ```python
   import shap
   
   explainer = shap.TreeExplainer(rf)
   shap_values = explainer.shap_values(X)
   shap.summary_plot(shap_values, X)
   # Provides feature importance + direction of effect
   ```

3. **Recursive Feature Elimination**

   ```python
   from sklearn.feature_selection import RFE
   
   rfe = RFE(rf, n_features_to_select=10)
   rfe.fit(X, y)
   # Iteratively removes least important features
   ```

**Best practice**: Use multiple importance metrics and look for consensus.

</details>

---

### Question 3: XGBoost Overfitting

Your XGBoost has 98% training accuracy but 75% test accuracy. Which hyperparameters should you adjust?

<details>
<summary>Click for Answer</summary>

**Answer:** The model is overfitting. Increase regularization and reduce model complexity.

**Priority adjustments:**

**1. Lower learning rate + increase trees**

```python
# Before (overfitting)
XGBClassifier(n_estimators=100, learning_rate=0.3)

# After (more conservative)
XGBClassifier(n_estimators=500, learning_rate=0.01)
# Smaller steps, more iterations → better generalization
```

**2. Reduce max_depth**

```python
# Before
max_depth=10  # Deep trees memorize

# After
max_depth=3  # Shallow trees generalize
```

**3. Add regularization**

```python
reg_alpha=1.0,    # L1 (Lasso) – feature selection
reg_lambda=10.0   # L2 (Ridge) – coefficient shrinkage
```

**4. Increase sampling randomness**

```python
subsample=0.7,         # Use 70% of rows per tree
colsample_bytree=0.7   # Use 70% of features per tree
# Adds randomness → reduces overfitting
```

**5. Increase min_child_weight**

```python
min_child_weight=5  # Need ≥5 samples to create leaf
# Prevents tiny, overfit leaves
```

**Debugging workflow:**

```python
# Plot learning curves
from xgboost import cv

dtrain = xgb.DMatrix(X_train, label=y_train)
cv_results = xgb.cv(
    params,
    dtrain,
    num_boost_round=1000,
    early_stopping_rounds=50,
    metrics='auc',
    as_pandas=True
)

cv_results[['train-auc-mean', 'test-auc-mean']].plot()
plt.title('Learning Curve')
# If train-test gap widens → overfitting
```

</details>

---

### Question 4: Ensemble Size

Does adding more trees to Random Forest always improve performance?

<details>
<summary>Click for Answer</summary>

**Answer:** No. Performance plateaus after a certain number of trees, and more trees increase memory and latency without accuracy gains.

**What happens as you add trees:**

```python
# Experiment
n_estimators_range = [10, 50, 100, 200, 500, 1000]
train_scores, test_scores = [], []

for n in n_estimators_range:
    rf = RandomForestClassifier(n_estimators=n, random_state=42)
    rf.fit(X_train, y_train)
    train_scores.append(rf.score(X_train, y_train))
    test_scores.append(rf.score(X_test, y_test))

# Typical pattern:
# 10 trees:   Test = 0.85
# 50 trees:   Test = 0.90
# 100 trees:  Test = 0.91
# 500 trees:  Test = 0.911 ← Diminishing returns
# 1000 trees: Test = 0.911 ← No improvement, but 2x slower
```

**Diminishing returns curve:**

- **10-50 trees**: Large accuracy improvement
- **50-200 trees**: Moderate improvement
- **200+ trees**: Minimal improvement (~0.001 per doubling)

**Trade-offs:**

| n_estimators | Accuracy   | Training Time | Prediction Time | Memory     |
| ------------ | ---------- | ------------- | --------------- | ---------- |
| 50           | ✅ Good     | ⚡ Fast        | ⚡ Fast          | 📦 Small    |
| 200          | ✅ Better   | 🔥 Moderate    | 🔥 Moderate      | 📦 Moderate |
| 1000         | ✅ Marginal | 🐌 Slow        | 🐌 Slow          | 📦 Large    |

**Production guideline:**

```python
# Start with 100 trees
rf = RandomForestClassifier(n_estimators=100)

# If accuracy insufficient, try 200
# Beyond 200, consider XGBoost instead
```

**Exception**: For `oob_score` (out-of-bag estimation), more trees = more reliable estimate.

</details>

---

### Question 5: Stacking Strategy

You're stacking 5 models together. Should the base models be similar (e.g., 5 Random Forests) or diverse (RF, XGBoost, SVM, KNN, Logistic Regression)?

<details>
<summary>Click for Answer</summary>

**Answer:** **Diverse** models. Stacking works best when base models make different types of errors (low correlation).

**Why diversity matters:**

**Bad stacking (similar models):**

```python
# All Random Forests with different seeds
base_models = [
    ('rf1', RandomForestClassifier(random_state=1)),
    ('rf2', RandomForestClassifier(random_state=2)),
    ('rf3', RandomForestClassifier(random_state=3)),
]
# Problem: They all make similar mistakes
# Meta-model has little new information to learn from
```

**Good stacking (diverse models):**

```python
base_models = [
    ('rf', RandomForestClassifier()),       # Tree-based, non-linear
    ('xgb', XGBClassifier()),               # Boosted trees
    ('lr', LogisticRegression()),           # Linear model
    ('svm', SVC(kernel='rbf')),             # Non-linear, different approach
    ('mlp', MLPClassifier()),               # Neural network
]
# Each model has different biases
# Meta-model learns which to trust for which patterns
```

**Correlation analysis:**

```python
import numpy as np

# Get base model predictions
base_preds = np.column_stack([
    model.predict(X_val) for name, model in base_models
])

# Correlation matrix
correlation = np.corrcoef(base_preds.T)
print(correlation)

# Low correlation (0.3-0.7) = good diversity
# High correlation (>0.9) = redundant models
```

**Optimal stacking recipe:**

1. **Different algorithms**: Trees, linear, SVM, neural nets
2. **Different representations**:  Some with engineered features, some with raw data
3. **Different hyperparameters**: Shallow vs deep trees
4. **Complementary strengths**: One handles outliers well, another handles interactions

**Real-world example (Netflix Prize):**

```
Base Layer (107 models):
- Matrix factorization (20 variants)
- Restricted Boltzmann Machines
- K-Nearest Neighbors
- Gradient Boosted Trees
- Neural Networks

Meta Layer:
- Blended with linear regression
- Result: 10% better than any single model
```

**Rule**: If two models have >0.95 correlation, drop one. Diversity > Quantity.

</details>

---

## Summary

Today you learned:

- ✅ Bagging (Random Forest) reduces variance by training parallel trees on bootstrap samples
- ✅ Boosting (XGBoost) reduces bias by training sequential trees that correct errors
- ✅ Random Forest excels with default settings, robust to overfitting
- ✅ XGBoost achieves state-of-the-art accuracy with careful tuning
- ✅ LightGBM is faster for large datasets (millions of rows)
- ✅ Stacking combines diverse models using a meta-learner
- ✅ Feature importance helps interpret black-box ensembles

**Tomorrow**: Model tuning and feature selection—systematic optimization for production.

---

## Optional Build Tracks (Day 49-60 Extension)

Keep the **core lab tasks** in this lesson common for all learners, then add one optional extension artifact per track:

| Track | Day 52 assignment artifact |
| --- | --- |
| **NLP** | Ensemble moderation baseline (single classifier) vs advanced stacking/voting ensemble. |
| **Forecasting** | Forecast baseline (single tree model) vs advanced boosted/bagged ensemble. |
| **Recommenders/Graph** | Recommendation ranker baseline (single model) vs advanced blended ensemble ranker. |

### Track requirements (apply to all three tracks)

1. **Baseline + advanced model comparison (required):** report offline metrics, error slices, and deployment trade-offs.
2. **Constraint scenario test (required):** run at least one scenario each day from: **limited data**, **latency limit**, **explainability requirement**.
3. **Refactoring checkpoint #1 (Day 53):** modularize data prep, training, evaluation, and inference into reusable pipeline components.
4. **Refactoring checkpoint #2 (Day 58):** externalize hyperparameters/model settings into versioned config files.
5. **Final deliverable (Day 60):** submit a concise **performance + business-impact memo** tying model lift to ROI, risk, and rollout recommendation.
