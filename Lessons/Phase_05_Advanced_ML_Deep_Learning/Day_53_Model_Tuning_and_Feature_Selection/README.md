---
day: 53
title: "Model Tuning & Feature Selection"
phase: 5
phaseTitle: "Advanced ML & Deep Learning"
slug: "model-tuning"
duration: 55
difficulty: "advanced"
tags:
  - machine-learning
  - hyperparameters
  - feature-selection
  - optimization
concepts:
  - "grid search and random search"
  - "Bayesian optimization"
  - "feature importance"
  - "recursive feature elimination"
  - "dimensionality reduction"
prerequisites: [45, 52]
outcomes:
  - "Tune hyperparameters systematically and efficiently"
  - "Select optimal feature subsets"
  - "Balance model complexity and performance"
  - "Automate hyperparameter optimization"
---

# 🎯 Day 53: Model Tuning & Feature Selection

> *"The difference between good and great models is in the details."*

---

## The "Never-Coded" Bridge

**Imagine tuning a car engine.** Out of the box, it runs fine. But adjusting the air-fuel mixture, ignition timing, and turbo boost can improve performance by 20-30%. Same with machine learning models.

**Default hyperparameters** work, but they're rarely optimal for your specific data.

**Real-world impact of tuning:**
- **Airbnb**: 5% better pricing predictions after hyperparameter tuning → millions in revenue
- **Spotify**: Tuned recommendation models → 15% increase in listening time
- **Credit card fraud**: Tuned threshold from 0.5 to 0.7 → 30% fewer false positives

**Feature selection** is equally critical:
- **Medical diagnosis**: 500 genes → select 20 most predictive → faster, more interpretable models
- **Text classification**: 10,000 words → select 500 → 10x faster training, same accuracy
- **Production APIs**: Fewer features → lower latency, reduced data collection costs

---

## The Technical Deep Dive

### Grid Search: Exhaustive but Expensive

Grid search tests every combination of hyperparameters.

```python
from sklearn.model_selection import GridSearchCV
from sklearn.ensemble import RandomForestClassifier
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
import pandas as pd
import time

# Generate data
X, y = make_classification(n_samples=1000, n_features=20, n_informative=15, random_state=42)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Define parameter grid
param_grid = {
    'n_estimators': [50, 100, 200],
    'max_depth': [5, 10, 15, None],
    'min_samples_split': [2, 5, 10],
    'min_samples_leaf': [1, 2, 4]
}

# Grid search
start_time = time.time()
grid_search = GridSearchCV(
    RandomForestClassifier(random_state=42),
    param_grid,
    cv=5,
    scoring='accuracy',
    n_jobs=-1,  # Use all CPU cores
    verbose=1
)

grid_search.fit(X_train, y_train)
elapsed_time = time.time() - start_time

# Results
print(f"Best parameters: {grid_search.best_params_}")
print(f"Best CV score: {grid_search.best_score_:.4f}")
print(f"Test score: {grid_search.score(X_test, y_test):.4f}")
print(f"Time elapsed: {elapsed_time:.1f} seconds")
print(f"Total combinations tested: {len(grid_search.cv_results_['params'])}")

# Analyze all results
results_df = pd.DataFrame(grid_search.cv_results_)
top_10 = results_df.nsmallest(10, 'rank_test_score')[
    ['param_n_estimators', 'param_max_depth', 'param_min_samples_split', 
     'param_min_samples_leaf', 'mean_test_score', 'std_test_score']
]
print("\n=== Top 10 Configurations ===")
print(top_10.to_string(index=False))
```

**Problem with Grid Search:**
- 3 × 4 × 3 × 3 = 108 combinations
- Each with 5-fold CV = 540 model fits
- For large datasets or complex models, this can take hours/days!

### Random Search: Smarter Sampling

Random search samples from parameter distributions—often finds good solutions faster.

```python
from sklearn.model_selection import RandomizedSearchCV
from scipy.stats import randint, uniform
import numpy as np

# Define parameter distributions
param_distributions = {
    'n_estimators': randint(50, 300),  # Uniform integer from 50-300
    'max_depth': randint(5, 30),
    'min_samples_split': randint(2, 20),
    'min_samples_leaf': randint(1, 10),
    'max_features': uniform(0.1, 0.9),  # Continuous uniform from 0.1-1.0
}

# Random search (try 50 random combinations)
start_time = time.time()
random_search = RandomizedSearchCV(
    RandomForestClassifier(random_state=42),
    param_distributions,
    n_iter=50,  # Number of random combinations to try
    cv=5,
    scoring='accuracy',
    n_jobs=-1,
    random_state=42,
    verbose=1
)

random_search.fit(X_train, y_train)
elapsed_time = time.time() - start_time

print(f"\nBest parameters: {random_search.best_params_}")
print(f"Best CV score: {random_search.best_score_:.4f}")
print(f"Test score: {random_search.score(X_test, y_test):.4f}")
print(f"Time elapsed: {elapsed_time:.1f} seconds")

# Compare to grid search
print(f"\n Random Search: {elapsed_time:.1f}s, Score: {random_search.best_score_:.4f}")
print(f"Grid Search: {grid_search.best_score_:.4f} (took longer)")
```

### Bayesian Optimization: The Smart Way

Bayesian optimization uses past results to intelligently choose next parameters to test.

```python
from skopt import BayesSearchCV
from skopt.space import Real, Integer

# Define search space
search_spaces = {
    'n_estimators': Integer(50, 300),
    'max_depth': Integer(5, 30),
    'min_samples_split': Integer(2, 20),
    'min_samples_leaf': Integer(1, 10),
    'max_features': Real(0.1, 1.0)
}

# Bayesian optimization
bayes_search = BayesSearchCV(
    RandomForestClassifier(random_state=42),
    search_spaces,
    n_iter=50,
    cv=5,
    n_jobs=-1,
    random_state=42,
    verbose=1
)

bayes_search.fit(X_train, y_train)

print(f"\nBayesian Optimization Best Score: {bayes_search.best_score_:.4f}")
print(f"Best parameters: {bayes_search.best_params_}")
```

### Feature Selection: Univariate Methods

Select features based on statistical tests.

```python
from sklearn.feature_selection import SelectKBest, f_classif, chi2, mutual_info_classif
from sklearn.datasets import load_breast_cancer
import matplotlib.pyplot as plt

# Load real dataset
cancer = load_breast_cancer()
X, y = cancer.data, cancer.target
feature_names = cancer.feature_names

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Method 1: ANOVA F-test
selector_f = SelectKBest(f_classif, k=10)
X_train_selected_f = selector_f.fit_transform(X_train, y_train)
X_test_selected_f = selector_f.transform(X_test)

# Get selected feature names
selected_features_f = feature_names[selector_f.get_support()]
print("=== ANOVA F-test: Top 10 Features ===")
for i, (name, score) in enumerate(zip(selected_features_f, selector_f.scores_[selector_f.get_support()])):
    print(f"{i+1}. {name}: {score:.2f}")

# Method 2: Mutual Information
selector_mi = SelectKBest(mutual_info_classif, k=10)
selector_mi.fit(X_train, y_train)

selected_features_mi = feature_names[selector_mi.get_support()]
print("\n=== Mutual Information: Top 10 Features ===")
for i, name in enumerate(selected_features_mi):
    print(f"{i+1}. {name}")

# Visualize feature scores
plt.figure(figsize=(12, 6))
plt.subplot(1, 2, 1)
plt.barh(range(len(selector_f.scores_)), selector_f.scores_)
plt.xlabel('F-score')
plt.ylabel('Feature Index')
plt.title('ANOVA F-test Scores')

plt.subplot(1, 2, 2)
plt.barh(range(len(selector_mi.scores_)), selector_mi.scores_)
plt.xlabel('Mutual Information')
plt.ylabel('Feature Index')
plt.title('Mutual Information Scores')

plt.tight_layout()
plt.show()
```

### Recursive Feature Elimination (RFE)

Iteratively remove least important features.

```python
from sklearn.feature_selection import RFE, RFECV

# RFE with fixed number of features
rfe = RFE(
    estimator=RandomForestClassifier(n_estimators=100, random_state=42),
    n_features_to_select=10,
    step=1  # Remove 1 feature at a time
)

rfe.fit(X_train, y_train)

selected_features_rfe = feature_names[rfe.support_]
print("=== RFE: Top 10 Features ===")
for i, (name, rank) in enumerate(zip(feature_names, rfe.ranking_)):
    if rank == 1:  # Selected features have rank 1
        print(f"{name}")

# RFECV: Automatically find optimal number of features
rfecv = RFECV(
    estimator=RandomForestClassifier(n_estimators=50, random_state=42),
    step=1,
    cv=5,
    scoring='accuracy',
    n_jobs=-1
)

rfecv.fit(X_train, y_train)

print(f"\nOptimal number of features: {rfecv.n_features_}")
print(f"CV score with optimal features: {rfecv.grid_scores_[rfecv.n_features_-1]:.4f}")

# Plot number of features vs CV score
plt.figure(figsize=(10, 6))
plt.plot(range(1, len(rfecv.grid_scores_) + 1), rfecv.grid_scores_, marker='o')
plt.xlabel('Number of Features')
plt.ylabel('CV Score')
plt.title('RFECV: Optimal Number of Features')
plt.axvline(x=rfecv.n_features_, color='r', linestyle='--', label=f'Optimal: {rfecv.n_features_}')
plt.legend()
plt.grid(True, alpha=0.3)
plt.show()
```

### Feature Importance from Models

Use model-based feature importance.

```python
from sklearn.ensemble import RandomForestClassifier
import numpy as np

# Train model
rf = RandomForestClassifier(n_estimators=100, random_state=42)
rf.fit(X_train, y_train)

# Get feature importance
importance_df = pd.DataFrame({
    'Feature': feature_names,
    'Importance': rf.feature_importances_
}).sort_values('Importance', ascending=False)

print("=== Feature Importance from Random Forest ===")
print(importance_df.head(10).to_string(index=False))

# Select top K features
k = 10
top_features = importance_df.head(k)['Feature'].values
top_feature_indices = [np.where(feature_names == f)[0][0] for f in top_features]

X_train_important = X_train[:, top_feature_indices]
X_test_important = X_test[:, top_feature_indices]

# Train model on selected features
rf_selected = RandomForestClassifier(n_estimators=100, random_state=42)
rf_selected.fit(X_train_important, y_train)

# Compare performance
print(f"\nAll features ({X_train.shape[1]}): {rf.score(X_test, y_test):.4f}")
print(f"Top {k} features: {rf_selected.score(X_test_important, y_test):.4f}")
```

### Permutation Importance (Model-Agn ostic)

```python
from sklearn.inspection import permutation_importance

# Compute permutation importance
perm_importance = permutation_importance(
    rf, X_test, y_test,
    n_repeats=10,
    random_state=42,
    n_jobs=-1
)

# Sort by importance
perm_sorted_idx = perm_importance.importances_mean.argsort()[::-1]

print("=== Permutation Importance ===")
for i in perm_sorted_idx[:10]:
    print(f"{feature_names[i]}: {perm_importance.importances_mean[i]:.4f} "
          f"± {perm_importance.importances_std[i]:.4f}")

# Visualize
plt.figure(figsize=(10, 6))
plt.boxplot(perm_importance.importances[perm_sorted_idx[:15]].T,
            vert=False, labels=feature_names[perm_sorted_idx[:15]])
plt.xlabel('Permutation Importance')
plt.title('Top 15 Features by Permutation Importance')
plt.tight_layout()
plt.show()
```

---

## Senior-Level Insights

### Hyperparameter Tuning Comparison

| Method            | Strategy        | Efficiency | When to Use                        |
| ----------------- | --------------- | ---------- | ---------------------------------- |
| **Grid Search**   | Exhaustive      | 🐌 Slow     | Small param space, need guarantees |
| **Random Search** | Random sampling | 🔥 Medium   | Large param space, good default    |
| **Bayesian Opt**  | Smart sampling  | ⚡ Fast     | Expensive models, limited budget   |
| **Hyperband**     | Early stopping  | ⚡⚡ Fastest | Deep learning, many configs        |

### Feature Selection Strategy

```python
# Decision tree
if n_features < 50:
    method = "Try all features (no selection needed)"
elif interpretability_critical:
    method = "RFE with linear model (LASSO coefficients)"
elif speed_critical:
    method = "Univariate tests (SelectKBest)"
else:
    method = "Model-based (Random Forest importance)"
```

### Cross-Validation for Tuning

**Nested CV**: Avoids overfitting to validation set

```python
from sklearn.model_selection import cross_val_score

# WRONG: Single CV (optimistic bias)
grid_search.fit(X, y)  # Tuning and evaluation on same CV splits
print(grid_search.best_score_)  # Overly optimistic!

# RIGHT: Nested CV
outer_scores = cross_val_score(
    GridSearchCV(model, param_grid, cv=5),  # Inner CV for tuning
    X, y,
    cv=5  # Outer CV for evaluation
)
print(f"True generalization performance: {outer_scores.mean():.4f}")
```

### Production Tuning Checklist

```python
tuning_checklist = {
    "1. Define metric": "Business metric (revenue, not just accuracy)",
    "2. Search space": "Use domain knowledge to narrow ranges",
    "3. Budget": "Time limit for tuning (hours, not days)",
    "4. Validation": "Holdout test set never touched during tuning",
    "5. Reproducibility": "Fix random_state, log all configs",
    "6. Monitor": "Track performance over time in production"
}
```

---

## Hands-on Lab

### Exercise 1: Complete Hyperparameter Tuning Pipeline

```python
import xgboost as xgb
from sklearn.model_selection import RandomizedSearchCV
from scipy.stats import randint, uniform
import time

# Load data
X, y = make_classification(n_samples=5000, n_features=30, n_informative=20, random_state=42)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Define search space
param_dist = {
    'n_estimators': randint(50, 500),
    'max_depth': randint(3, 15),
    'learning_rate': uniform(0.01, 0.3),
    'subsample': uniform(0.6, 0.4),  # 0.6 to 1.0
    'colsample_bytree': uniform(0.6, 0.4),
    'gamma': uniform(0, 5),
    'reg_alpha': uniform(0, 1),
    'reg_lambda': uniform(0, 5)
}

# Random search
random_search = RandomizedSearchCV(
    xgb.XGBClassifier(random_state=42),
    param_dist,
    n_iter=100,
    cv=5,
    scoring='roc_auc',
    n_jobs=-1,
    verbose=2,
    random_state=42
)

start_time = time.time()
random_search.fit(X_train, y_train)
tuning_time = time.time() - start_time

# Results
print(f"\n=== Tuning Results ===")
print(f"Best parameters: {random_search.best_params_}")
print(f"Best CV AUC: {random_search.best_score_:.4f}")
print(f"Test AUC: {random_search.score(X_test, y_test):.4f}")
print(f"Tuning time: {tuning_time:.1f} seconds")

# Compare to default
default_model = xgb.XGBClassifier(random_state=42)
default_model.fit(X_train, y_train)
default_score = default_model.score(X_test, y_test)

print(f"\nDefault XGBoost: {default_score:.4f}")
print(f"Tuned XGBoost: {random_search.score(X_test, y_test):.4f}")
print(f"Improvement: {random_search.score(X_test, y_test) - default_score:.4f}")
```

---

### Exercise 2: Feature Selection with Multiple Methods

```python
from sklearn.feature_selection import SelectKBest, RFE, SelectFromModel, f_classif
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LassoCV
import matplotlib.pyplot as plt

# Load high-dimensional data
from sklearn.datasets import load_digits
digits = load_digits()
X, y = digits.data, digits.target
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print(f"Original features: {X_train.shape[1]}")

# Method 1: SelectKBest (Univariate)
selector_kb = SelectKBest(f_classif, k=20)
X_train_kb = selector_kb.fit_transform(X_train, y_train)
X_test_kb = selector_kb.transform(X_test)

# Method 2: RFE with Random Forest
selector_rfe = RFE(RandomForestClassifier(n_estimators=50, random_state=42), n_features_to_select=20)
X_train_rfe = selector_rfe.fit_transform(X_train, y_train)
X_test_rfe = selector_rfe.transform(X_test)

# Method 3: LASSO
lasso = LassoCV(cv=5, random_state=42, max_iter=10000)
selector_lasso = SelectFromModel(lasso, prefit=False, max_features=20)
X_train_lasso = selector_lasso.fit_transform(X_train, y_train)
X_test_lasso = selector_lasso.transform(X_test)

# Method 4: Random Forest Importance
rf = RandomForestClassifier(n_estimators=100, random_state=42)
selector_rf = SelectFromModel(rf, prefit=False, max_features=20)
X_train_rf = selector_rf.fit_transform(X_train, y_train)
X_test_rf = selector_rf.transform(X_test)

# Compare all methods
from sklearn.linear_model import LogisticRegression

methods = {
    'All Features (64)': (X_train, X_test),
    'SelectKBest (20)': (X_train_kb, X_test_kb),
    'RFE (20)': (X_train_rfe, X_test_rfe),
    'LASSO (20)': (X_train_lasso, X_test_lasso),
    'RF Importance (20)': (X_train_rf, X_test_rf)
}

results = []
for name, (X_tr, X_te) in methods.items():
    model = LogisticRegression(max_iter=1000, random_state=42)
    model.fit(X_tr, y_train)
    score = model.score(X_te, y_test)
    results.append({'Method': name, 'Accuracy': score})
    print(f"{name}: {score:.4f}")

# Visualize
results_df = pd.DataFrame(results)
plt.figure(figsize=(10, 6))
plt.barh(results_df['Method'], results_df['Accuracy'])
plt.xlabel('Accuracy')
plt.title('Feature Selection Methods Comparison')
plt.xlim(0.9, 1.0)
plt.tight_layout()
plt.show()
```

---

### Exercise 3: AutoML with TPOT

```python
# TPOT: Automated hyperparameter tuning + feature engineering
from tpot import TPOTClassifier

# AutoML
tpot = TPOTClassifier(
    generations=5,  # Number of iterations
    population_size=20,  # Number of models per generation
    cv=5,
    random_state=42,
    verbosity=2,
    max_time_mins=10,  # Time budget
    n_jobs=-1
)

tpot.fit(X_train, y_train)

# Results
print(f"\nTPOT Test Score: {tpot.score(X_test, y_test):.4f}")

# Export  best pipeline
tpot.export('best_pipeline.py')
print("Best pipeline exported to best_pipeline.py")
```

---

## Mastery Check

### Question 1: Grid vs Random Search
For XGBoost with 8 hyperparameters, each with 5 values, how many combinations does Grid Search test? Why might Random Search with 100 iterations be better?

<details>
<summary>Click for Answer</summary>

**Answer:** Grid Search tests **5^8 = 390,625 combinations**. Random Search is better because it explores the space more efficiently without testing redundant combinations.

**Math:**
- 8 parameters × 5 values each = 5^8 = 390,625 combinations
- With 5-fold CV: 390,625 × 5 = **1,953,125 model fits**!

**Why Random Search wins:**

1. **Curse of dimensionality**: Grid Search wastes effort on unimportant parameters
   ```
   If only 2 of 8 params matter:
   - Grid: Tests everything → 390K combos
   - Random (100 iters): Tests 100 combos, likely hits good values for the 2 important params
   ```

2. **Diminishing returns**: Many param combos yield similar performance
   - Random Search finds "good enough" quickly
   - Grid Search exhaustively tests tiny differences

3. **Practical example:**
   ```python
   # Grid: n_estimators=[100, 200, 300], learning_rate=[0.1, 0.2, 0.3]
   # Tests: (100, 0.1), (100, 0.2), (100, 0.3), (200, 0.1), ...
   # If learning_rate doesn't matter much, 6 of 9 combos are wasted

   # Random: Samples 9 random combos, explores both params efficiently
   ```

**Bergstra & Bengio (2012)**: Random Search finds optimal configs in **~10% of Grid Search's time**.

</details>

---

### Question 2: Feature Selection Timing
Should you perform feature selection before or after splitting into train/test sets?

<details>
<summary>Click for Answer</summary>

**Answer:** **After splitting**, and only on the training set. Otherwise you leak information from the test set → overly optimistic evaluation.

**WRONG (data leakage):**
```python
# Select features on full dataset
selector = SelectKBest(k=10)
X_selected = selector.fit_transform(X, y)  # Uses test data!

# Then split
X_train, X_test, y_train, y_test = train_test_split(X_selected, y)

# Problem: Feature selection "saw" test labels → biased selection
```

**RIGHT:**
```python
# Split first
X_train, X_test, y_train, y_test = train_test_split(X, y)

# Select features only on training data
selector = SelectKBest(k=10)
X_train_selected = selector.fit_transform(X_train, y_train)
X_test_selected = selector.transform(X_test)  # Apply same selection

# Now evaluation is unbiased
```

**Why it matters:**
- If test set influences feature selection, you've "peeked" at the answer
- Example: You select features correlated with test labels → artificially high accuracy

**Rule**: Everything that learns from data (scaling, feature selection, imputation) must be fit **only** on training data.

</details>

---

### Question 3: Overfitting to Validation
You tune hyperparameters on a validation set and achieve 95% accuracy. Test set gives 80%. What happened?

<details>
<summary>Click for Answer</summary>

**Answer:** You **overfit to the validation set** by using it repeatedly to choose hyperparameters. The validation set is no longer independent.

**The problem:**
```python
# Try 100 different hyperparameter configs
for config in configs:
    model = train_model(config, X_train, y_train)
    val_score = model.score(X_val, y_val)
    if val_score > best_score:
        best_config = config  # Select based on validation
        best_score = val_score

# Validation: 95% (but we "tuned" to maximize this!)
# Test: 80% (true unseen data)
```

**Why:**
- Each time you evaluate on validation set, you gain information about it
- After 100 tries, you've implicitly memorized validation set quirks
- Best config is "overfit" to validation data distribution

**Solutions:**

**1. Nested Cross-Validation** (gold standard)
```python
from sklearn.model_selection import cross_val_score

# Outer CV: True performance estimate
outer_scores = []
for train_idx, test_idx in outer_cv.split(X, y):
    X_train_outer, X_test_outer = X[train_idx], X[test_idx]
    y_train_outer, y_test_outer = y[train_idx], y[test_idx]
    
    # Inner CV: Hyperparameter tuning
    grid_search = GridSearchCV(model, params, cv=inner_cv)
    grid_search.fit(X_train_outer, y_train_outer)
    
    # Evaluate on outer test fold
    score = grid_search.score(X_test_outer, y_test_outer)
    outer_scores.append(score)

print(f"True performance: {np.mean(outer_scores):.2%}")
```

**2. Holdout Test Set** (never touch until final evaluation)
```python
# Split once
X_train_val, X_test, y_train_val, y_test = train_test_split(X, y, test_size=0.2)
X_train, X_val, y_train, y_val = train_test_split(X_train_val, y_train_val, test_size=0.25)

# Tune on train/val
# ... (100 configs)

# FINAL evaluation (only once!)
final_score = best_model.score(X_test, y_test)
```

**Rule**: Test set should be sacred—evaluate on it only once, at the very end.

</details>

---

### Question 4: Feature Importance Reliability
Random Forest ranks "customer_id" as the most important feature. Should you trust this?

<details>
<summary>Click for Answer</summary>

**Answer:** **No**. This is likely spurious correlation or data leakage. Customer IDs shouldn't predict outcomes—investigate immediately.

**Red flags:**

1. **Data leakage**: Did customer_id accidentally encode the target?
   ```python
   # Bad: Customer IDs assigned sequentially by outcome
   # customer_id 1-1000: churned
   # customer_id 1001-2000: stayed
   # Model "learns" this pattern → 100% accuracy (useless in production!)
   ```

2. **High cardinality**: Lots of unique values create overfitting
   ```python
   # 10,000 unique customer IDs
   # Random Forest memorizes: "customer 5432 → churn"
   # Doesn't generalize to new customers
   ```

3. **Spurious correlation**: Random noise in small datasets
   ```python
   # Small dataset (n=100), many features (p=50)
   # Some random patterns emerge → high importance for irrelevant features
   ```

**How to verify:**

**Test 1: Permutation importance**
```python
from sklearn.inspection import permutation_importance

perm_imp = permutation_importance(rf, X_test, y_test, n_repeats=10)
# If customer_id still ranks high → investigate further
# If it drops → likely spurious in training
```

**Test 2: Retrain without the feature**
```python
X_no_id = X.drop(columns=['customer_id'])
rf_no_id = RandomForestClassifier().fit(X_no_id_train, y_train)

print(f"With customer_id: {rf.score(X_test, y_test):.2%}")
print(f"Without customer_id: {rf_no_id.score(X_no_id_test, y_test):.2%}")

# If scores are similar → customer_id was useless
# If score drops significantly → data leakage!
```

**Test 3: Check for leakage**
```python
# Are customer IDs unique to train/test?
train_ids = set(X_train['customer_id'])
test_ids = set(X_test['customer_id'])

if len(train_ids & test_ids) > 0:
    print("LEAKAGE: Same customer IDs in train and test!")
```

**Rule**: High importance for ID/index features almost always indicates a problem.

</details>

---

### Question 5: Production Feature Selection
You selected 20 features out of 200 using RFE. In production, 5 of those features become unavailable (API changed). What do you do?

<details>
<summary>Click for Answer</summary>

**Answer:** Retrain with the 15 available features, or rebuild the entire feature selection pipeline from the 195 available features.

**Options:**

**Option 1: Quick fix - Use 15 remaining features**
```python
# Remove unavailable features
available_features = [f for f in selected_features if f not in unavailable]

X_train_reduced = X_train[available_features]
X_test_reduced = X_test[available_features]

# Retrain model
model.fit(X_train_reduced, y_train)

# Evaluate performance drop
print(f"20 features: {original_score:.2%}")
print(f"15 features: {model.score(X_test_reduced, y_test):.2%}")
```

**Pros**: Fast, no pipeline changes  
**Cons**: May miss better 20-feature subset from remaining 195

---

**Option 2: Rerun RFE with 195 features**
```python
# Exclude unavailable features
X_available = X.drop(columns=unavailable_features)

# Rerun RFE
rfe = RFE(estimator, n_features_to_select=20)
rfe.fit(X_available_train, y_train)

# New optimal 20 features (may include some previously excluded)
```

**Pros**: Optimal selection from available features  
**Cons**: Requires full retraining, testing, deployment

---

**Option 3: Feature importance fallback**
```python
# Rank remaining 195 features by importance
remaining_importance = importance_df[~importance_df['Feature'].isin(unavailable)]

# Select top 20
new_top_20 = remaining_importance.head(20)['Feature'].values
```

**Pros**: Fast, interpretable  
**Cons**: importance != RFE ranking

---

**Best Practice (Prevention):**

1. **Monitor feature availability** in production
   ```python
   # Alert if features missing
   if set(required_features) != set(production_features):
       alert("Feature mismatch!")
   ```

2. **Feature contracts**: SLA with data providers
   - Guarantee features won't disappear
   - Advance notice of schema changes

3. **Robust feature selection**: Prefer stable methods
   - SelectKBest (statistical) over RFE (model-based)
   - Less sensitive to small changes

4. **Fallback features**: Maintain alternate feature sets
   ```python
   # Primary: 20 premium features (high accuracy, may be unstable)
   # Fallback: 30 basic features (lower accuracy, always available)
   ```

**Rule**: In production, **feature availability** is as important as **feature relevance**.

</details>

---

## Summary

Today you learned:
- ✅ Grid Search exhaustively tests all combinations (slow but thorough)
- ✅ Random Search samples efficiently (often finds optimum faster)
- ✅ Bayesian Optimization intelligently explores parameter space
- ✅ Feature selection reduces dimensionality and improves interpretability
- ✅ Multiple selection methods (univariate, RFE, model-based, permutation)
- ✅ Nested CV prevents overfitting to validation set
- ✅ Production requires monitoring feature availability and performance

**Tomorrow**: Probabilistic modeling—reasoning under uncertainty with Bayesian methods.
