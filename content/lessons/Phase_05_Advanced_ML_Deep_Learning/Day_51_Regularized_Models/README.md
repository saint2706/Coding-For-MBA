---
day: 51
title: "Regularized Models"
phase: 5
phaseTitle: "Advanced ML & Deep Learning"
slug: "regularization"
duration: 50
difficulty: "advanced"
tags:
  - machine-learning
  - regularization
  - overfitting
  - ridge
  - lasso
concepts:
  - "L1 and L2 regularization"
  - "Ridge regression"
  - "Lasso regression"
  - "ElasticNet"
  - "regularization path"
prerequisites: [41, 45]
outcomes:
  - "Understand bias-variance tradeoff"
  - "Apply Ridge, Lasso, and ElasticNet"
  - "Tune regularization strength with cross-validation"
  - "Use Lasso for feature selection"
---

# 🎯 Day 51: Regularized Models

> *"Regularization: teaching models to generalize, not memorize."*

---

## The "Never-Coded" Bridge

**Imagine hiring for a job.** Candidate A scores 100% on your practice test by memorizing every answer. Candidate B scores 85% but deeply understands the concepts. Who performs better on real work?

**Candidate B**—because they generalize, not memorize.

Machine learning has the same problem:

- **Overfitting** (Candidate A): Model memorizes training data → 100% training accuracy, 60% test accuracy
- **Generalizing** (Candidate B): Model learns patterns → 85% training, 85% test

**Regularization prevents overfitting by penalizing complexity.** It's like telling the model:

> "You can fit the training data, but I'll punish you for using too many features or making coefficients too large."

**Real-world impact:**

- **Google Ads**: Regularized models prevent overfitting to individual users → better ad targeting
- **Credit Scoring**: Lasso selects 15 most important features from 200 → more interpretable, stable models
- **Medical Diagnosis**: Ridge regression with 1000 genes → avoids spurious correlations, better generalization

---

## The Technical Deep Dive

### The Overfitting Problem

```python
import numpy as np
import matplotlib.pyplot as plt
from sklearn.preprocessing import PolynomialFeatures
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error

# Generate data: true relationship is quadratic
np.random.seed(42)
X = np.linspace(0, 1, 30).reshape(-1, 1)
y = 2 + 3*X.squeeze() + 2*X.squeeze()**2 + np.random.randn(30) * 0.5

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)

# Fit models of different polynomial degrees
degrees = [1, 2, 9, 15]
fig, axes = plt.subplots(2, 2, figsize=(12, 10))

for ax, degree in zip(axes.flatten(), degrees):
    # Create polynomial features
    poly = PolynomialFeatures(degree)
    X_train_poly = poly.fit_transform(X_train)
    X_test_poly = poly.transform(X_test)
    
    # Fit model
    model = LinearRegression()
    model.fit(X_train_poly, y_train)
    
    # Evaluate
    train_mse = mean_squared_error(y_train, model.predict(X_train_poly))
    test_mse = mean_squared_error(y_test, model.predict(X_test_poly))
    
    # Plot
    X_plot = np.linspace(0, 1, 100).reshape(-1, 1)
    X_plot_poly = poly.transform(X_plot)
    y_plot = model.predict(X_plot_poly)
    
    ax.scatter(X_train, y_train, label='Train', alpha=0.7)
    ax.scatter(X_test, y_test, label='Test', alpha=0.7, marker='s')
    ax.plot(X_plot, y_plot, 'r-', linewidth=2)
    ax.set_title(f'Degree {degree}\nTrain MSE: {train_mse:.2f}, Test MSE: {test_mse:.2f}')
    ax.legend()
    ax.set_ylim(0, 10)

plt.tight_layout()
plt.show()

# Notice: High degrees (9, 15) overfit—low train error, high test error
```

### Ridge Regression (L2 Regularization)

Ridge adds a penalty proportional to the **square** of coefficients.

**Cost function:**

```
Cost = MSE + α × Σ(coefficient²)
```

```python
from sklearn.linear_model import Ridge
from sklearn.preprocessing import StandardScaler
import pandas as pd

# Generate high-dimensional data (more features than samples—prone to overfitting)
np.random.seed(42)
n_samples, n_features = 100, 50
X = np.random.randn(n_samples, n_features)
true_coefs = np.random.randn(n_features) * (np.random.rand(n_features) < 0.2)  # Most are zero
y = X @ true_coefs + np.random.randn(n_samples) * 0.5

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)

# Standardize features (important for regularization!)
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Compare different alpha values
alphas = [0, 0.1, 1.0, 10.0, 100.0]
results = []

for alpha in alphas:
    model = Ridge(alpha=alpha)
    model.fit(X_train_scaled, y_train)
    
    train_score = model.score(X_train_scaled, y_train)
    test_score = model.score(X_test_scaled, y_test)
    n_large_coefs = np.sum(np.abs(model.coef_) > 0.1)
    
    results.append({
        'alpha': alpha,
        'train_R2': train_score,
        'test_R2': test_score,
        'large_coefs': n_large_coefs
    })

results_df = pd.DataFrame(results)
print("=== Ridge Regression: Effect of Alpha ===")
print(results_df.to_string(index=False))

# Visualize coefficient shrinkage
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))

# Coefficient values
for alpha in [0, 1.0, 10.0]:
    model = Ridge(alpha=alpha)
    model.fit(X_train_scaled, y_train)
    ax1.plot(model.coef_, marker='o', label=f'α={alpha}', alpha=0.6)

ax1.set_xlabel('Feature Index')
ax1.set_ylabel('Coefficient Value')
ax1.set_title('Ridge: Coefficient Shrinkage')
ax1.legend()
ax1.grid(True, alpha=0.3)

# Train vs Test R²
ax2.plot(results_df['alpha'], results_df['train_R2'], marker='o', label='Train R²')
ax2.plot(results_df['alpha'], results_df['test_R2'], marker='s', label='Test R²')
ax2.set_xscale('log')
ax2.set_xlabel('Alpha (Regularization Strength)')
ax2.set_ylabel('R² Score')
ax2.set_title('Ridge: Finding Optimal Alpha')
ax2.legend()
ax2.grid(True, alpha=0.3)

plt.tight_layout()
plt.show()
```

### Lasso Regression (L1 Regularization)

Lasso adds a penalty proportional to the **absolute value** of coefficients. **Key difference**: It can zero out coefficients → automatic feature selection!

**Cost function:**

```
Cost = MSE + α × Σ|coefficient|
```

```python
from sklearn.linear_model import Lasso

# Same high-dimensional data as before
alphas = [0.001, 0.01, 0.1, 1.0]
results_lasso = []

for alpha in alphas:
    model = Lasso(alpha=alpha, max_iter=10000)
    model.fit(X_train_scaled, y_train)
    
    train_score = model.score(X_train_scaled, y_train)
    test_score = model.score(X_test_scaled, y_test)
    n_nonzero = np.sum(model.coef_ != 0)
    
    results_lasso.append({
        'alpha': alpha,
        'train_R2': train_score,
        'test_R2': test_score,
        'features_selected': n_nonzero
    })

results_lasso_df = pd.DataFrame(results_lasso)
print("\n=== Lasso Regression: Feature Selection ===")
print(results_lasso_df.to_string(index=False))

# Visualize regularization path
from sklearn.linear_model import lasso_path

alphas_path, coefs_path, _ = lasso_path(X_train_scaled, y_train, alphas=np.logspace(-3, 1, 100))

plt.figure(figsize=(12, 6))
for i in range(coefs_path.shape[0]):
    plt.plot(alphas_path, coefs_path[i], alpha=0.3)
plt.xscale('log')
plt.xlabel('Alpha (Regularization Strength)')
plt.ylabel('Coefficient Value')
plt.title('Lasso Regularization Path\n(Coefficients shrink to zero as alpha increases)')
plt.axhline(y=0, color='black', linestyle='--', linewidth=0.5)
plt.grid(True, alpha=0.3)
plt.show()

# Show which features survived
best_alpha = 0.1
model = Lasso(alpha=best_alpha)
model.fit(X_train_scaled, y_train)

selected_features = np.where(model.coef_ != 0)[0]
print(f"\nWith α={best_alpha}, Lasso selected {len(selected_features)} features:")
print(f"Indices: {selected_features[:10]}...")  # Show first 10
```

### ElasticNet (L1 + L2)

Combines benefits of both: feature selection (L1) + stability (L2).

```python
from sklearn.linear_model import ElasticNet

# l1_ratio controls L1 vs L2 mix
# l1_ratio=1 → pure Lasso
# l1_ratio=0 → pure Ridge

results_elastic = []
for l1_ratio in [0, 0.25, 0.5, 0.75, 1.0]:
    model = ElasticNet(alpha=0.1, l1_ratio=l1_ratio, max_iter=10000)
    model.fit(X_train_scaled, y_train)
    
    test_score = model.score(X_test_scaled, y_test)
    n_nonzero = np.sum(model.coef_ != 0)
    
    results_elastic.append({
        'l1_ratio': l1_ratio,
        'test_R2': test_score,
        'features_selected': n_nonzero,
        'method': 'Ridge' if l1_ratio == 0 else 'Lasso' if l1_ratio == 1 else 'ElasticNet'
    })

results_elastic_df = pd.DataFrame(results_elastic)
print("\n=== ElasticNet: L1/L2 Trade-off ===")
print(results_elastic_df.to_string(index=False))
```

### Cross-Validation for Hyperparameter Tuning

```python
from sklearn.linear_model import RidgeCV, LassoCV, ElasticNetCV

# Automatically find best alpha using cross-validation
alphas = np.logspace(-3, 3, 100)

# Ridge
ridge_cv = RidgeCV(alphas=alphas, cv=5)
ridge_cv.fit(X_train_scaled, y_train)
print(f"Best Ridge alpha: {ridge_cv.alpha_:.4f}")

# Lasso
lasso_cv = LassoCV(alphas=alphas, cv=5, max_iter=10000, random_state=42)
lasso_cv.fit(X_train_scaled, y_train)
print(f"Best Lasso alpha: {lasso_cv.alpha_:.4f}")

# ElasticNet
elastic_cv = ElasticNetCV(alphas=alphas, l1_ratio=[0.1, 0.5, 0.9], cv=5, max_iter=10000, random_state=42)
elastic_cv.fit(X_train_scaled, y_train)
print(f"Best ElasticNet alpha: {elastic_cv.alpha_:.4f}, l1_ratio: {elastic_cv.l1_ratio_:.2f}")

# Compare final models
models = {
    'Ridge': ridge_cv,
    'Lasso': lasso_cv,
    'ElasticNet': elastic_cv
}

print("\n=== Final Model Comparison ===")
for name, model in models.items():
    test_score = model.score(X_test_scaled, y_test)
    n_nonzero = np.sum(model.coef_ != 0)
    print(f"{name}: Test R² = {test_score:.3f}, Features = {n_nonzero}")
```

---

## Senior-Level Insights

### Regularization Comparison

| Method         | Penalty    | Feature Selection | Stability | When to Use                                      |
| -------------- | ---------- | ----------------- | --------- | ------------------------------------------------ |
| **Ridge**      | L2 (²)     | ❌ No              | ✅ High    | Many correlated features, all potentially useful |
| **Lasso**      | L1 (\|·\|) | ✅ Yes             | ⚠️ Medium  | Sparse solutions, want interpretability          |
| **ElasticNet** | L1 + L2    | ✅ Yes             | ✅ High    | Best of both worlds, grouped features            |

### Geometric Interpretation

```
Ridge vs Lasso Constraint Regions:

Ridge (L2):               Lasso (L1):
    β₂                        β₂
     |                         |
     |    ○                    |    /|
     |   / \                   |   / |
     |  /   \                  |  /  |
--●-/-----\-●--- β₁         --●/----●--- β₁
     \     /                   |/    
      \   /                    |
       \ /                     |
        ○                      
        
Ridge: Circle → solutions     Lasso: Diamond → solutions
rarely hit axes (β≠0)         often hit corners (β=0)
```

### Why Standardization Matters

```python
# BAD: Without standardization
# Feature 1: range [0, 1]
# Feature 2: range [0, 1000]
# Ridge penalizes large coefficients equally → unfair!

# GOOD: Standardize first
# Both features: mean=0, std=1
# Now penalty is fair across features
```

### Regularization in Deep Learning

```python
# L2 regularization (weight decay) in PyTorch
import torch.nn as nn
import torch.optim as optim

model = nn.Linear(10, 1)
optimizer = optim.SGD(model.parameters(), lr=0.01, weight_decay=0.01)  #  L2 penalty

# Dropout is another form of regularization (randomly zero neurons)
dropout = nn.Dropout(p=0.5)
```

---

## Hands-on Lab

### Exercise 1: Preventing Overfitting with Ridge

```python
import numpy as np
import pandas as pd
from sklearn.datasets import load_diabetes
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.metrics import mean_squared_error, r2_score

# Load diabetes dataset
diabetes = load_diabetes()
X, y = diabetes.data, diabetes.target

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Standardize
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Compare Linear Regression vs Ridge
models_to_compare = {
    'Linear Regression (no regularization)': LinearRegression(),
    'Ridge (alpha=0.1)': Ridge(alpha=0.1),
    'Ridge (alpha=1.0)': Ridge(alpha=1.0),
    'Ridge (alpha=10.0)': Ridge(alpha=10.0),
}

results = []
for name, model in models_to_compare.items():
    model.fit(X_train_scaled, y_train)
    
    train_pred = model.predict(X_train_scaled)
    test_pred = model.predict(X_test_scaled)
    
    train_mse = mean_squared_error(y_train, train_pred)
    test_mse = mean_squared_error(y_test, test_pred)
    train_r2 = r2_score(y_train, train_pred)
    test_r2 = r2_score(y_test, test_pred)
    
    results.append({
        'Model': name,
        'Train MSE': train_mse,
        'Test MSE': test_mse,
        'Train R²': train_r2,
        'Test R²': test_r2,
        'Gap (Train-Test R²)': train_r2 - test_r2
    })

results_df = pd.DataFrame(results)
print("=== Overfitting Analysis ===")
print(results_df.to_string(index=False))

# Smaller gap = better generalization
# Ridge reduces overfitting (smaller gap)
```

---

### Exercise 2: Feature Selection with Lasso

```python
from sklearn.datasets import fetch_california_housing
from sklearn.linear_model import Lasso
import matplotlib.pyplot as plt

# Load California housing (8 features)
housing = fetch_california_housing()
X, y = housing.data, housing.target
feature_names = housing.feature_names

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Standardize
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Train Lasso with different alphas
alphas = [0.001, 0.01, 0.1, 1.0]
fig, axes = plt.subplots(2, 2, figsize=(14, 10))

for ax, alpha in zip(axes.flatten(), alphas):
    model = Lasso(alpha=alpha, max_iter=10000)
    model.fit(X_train_scaled, y_train)
    
    # Plot coefficients
    coef_df = pd.DataFrame({
        'Feature': feature_names,
        'Coefficient': model.coef_
    }).sort_values('Coefficient', key=abs, ascending=False)
    
    colors = ['green' if c != 0 else 'red' for c in coef_df['Coefficient']]
    ax.barh(coef_df['Feature'], coef_df['Coefficient'], color=colors)
    ax.set_title(f'Lasso (α={alpha})\nFeatures selected: {np.sum(model.coef_ != 0)}/{len(feature_names)}')
    ax.set_xlabel('Coefficient Value')
    ax.axvline(x=0, color='black', linestyle='--', linewidth=0.5)

plt.tight_layout()
plt.show()

# Best practices: Use cross-validation
from sklearn.linear_model import LassoCV

lasso_cv = Las soCV(alphas=np.logspace(-3, 1, 50), cv=5, max_iter=10000)
lasso_cv.fit(X_train_scaled, y_train)

print(f"\nOptimal alpha: {lasso_cv.alpha_:.4f}")
print(f"Features selected: {np.sum(lasso_cv.coef_ != 0)}/{len(feature_names)}")
print("\nSelected features:")
for feature, coef in zip(feature_names, lasso_cv.coef_):
    if coef != 0:
        print(f"  {feature}: {coef:.4f}")
```

---

### Exercise 3: Regularization Path Visualization

```python
from sklearn.linear_model import ridge_regression, lasso_path
import matplotlib.pyplot as plt

# Generate data
np.random.seed(42)
X = np.random.randn(100, 20)
true_coefs = np.zeros(20)
true_coefs[:5] = [5, 4, 3, 2, 1]  # Only first 5 features matter
y = X @ true_coefs + np.random.randn(100) * 0.5

# Standardize
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Lasso path
alphas_lasso, coefs_lasso, _ = lasso_path(X_scaled, y, alphas=np.logspace(-2, 2, 100))

# Ridge path (manual computation)
alphas_ridge = np.logspace(-2, 2, 100)
coefs_ridge = []
for alpha in alphas_ridge:
    coef = ridge_regression(X_scaled.T @ X_scaled + alpha * np.eye(X_scaled.shape[1]), 
                            X_scaled.T @ y, 
                            solver='cholesky')
    coefs_ridge.append(coef)
coefs_ridge = np.array(coefs_ridge).T

# Plot
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(16, 6))

# Lasso path
for i in range(coefs_lasso.shape[0]):
    linestyle = '-' if i < 5 else '--'
    linewidth = 2 if i < 5 else 0.5
    ax1.plot(alphas_lasso, coefs_lasso[i], linestyle=linestyle, linewidth=linewidth, alpha=0.7)
ax1.set_xscale('log')
ax1.set_xlabel('Alpha (Regularization Strength)', fontsize=12)
ax1.set_ylabel('Coefficient Value', fontsize=12)
ax1.set_title('Lasso Regularization Path\n(Bold lines = important features)', fontsize=14)
ax1.axhline(y=0, color='black', linestyle='--', linewidth=0.5)
ax1.grid(True, alpha=0.3)

# Ridge path
for i in range(coefs_ridge.shape[0]):
    linestyle = '-' if i < 5 else '--'
    linewidth = 2 if i < 5 else 0.5
    ax2.plot(alphas_ridge, coefs_ridge[i], linestyle=linestyle, linewidth=linewidth, alpha=0.7)
ax2.set_xscale('log')
ax2.set_xlabel('Alpha (Regularization Strength)', fontsize=12)
ax2.set_ylabel('Coefficient Value', fontsize=12)
ax2.set_title('Ridge Regularization Path\n(Coefficients shrink but never zero)', fontsize=14)
ax2.axhline(y=0, color='black', linestyle='--', linewidth=0.5)
ax2.grid(True, alpha=0.3)

plt.tight_layout()
plt.show()
```

---

## Mastery Check

### Question 1: L1 vs L2 Penalty

Why does Lasso (L1) produce sparse solutions (zeros) while Ridge (L2) only shrinks coefficients?

<details>
<summary>Click for Answer</summary>

**Answer:** Lasso's L1 penalty has "corners" in its constraint region where coefficients hit exactly zero. Ridge's L2 penalty is circular and rarely hits axes.

**Geometric intuition:**

**Lasso (L1):**

```
Constraint: |β₁| + |β₂| ≤ t
Shape: Diamond with corners on axes
```

When the cost function ellipse expands, it first touches the diamond at a corner → one coefficient = 0.

**Ridge (L2):**

```
Constraint: β₁² + β₂² ≤ t
Shape: Circle
```

The ellipse touches the circle at a smooth point (rarely on an axis) → coefficients shrink but stay non-zero.

**Mathematical reason:**

- L1 derivative at zero is discontinuous → optimizer "jumps" to zero
- L2 derivative at zero is zero → optimizer approaches zero asymptotically

**Practical impact:**

```python
# Lasso with α=0.1
coef = [0.5, 0, 0.3, 0, 0, 0.2]  # Sparse!

# Ridge with α=0.1
coef = [0.45, 0.02, 0.28, 0.01, 0.03, 0.19]  # All non-zero
```

</details>

---

### Question 2: When Ridge Over Lasso

You have 100 features, many correlated (e.g., multiple measures of "company size"). Should you use Ridge or Lasso?

<details>
<summary>Click for Answer</summary>

**Answer:** Use **Ridge** or **ElasticNet**. Lasso arbitrarily picks one feature from correlated groups, causing instability.

**The problem with Lasso and correlated features:**

Suppose features 1, 2, 3 are highly correlated (all measure company revenue).

- Run 1: Lasso picks feature 1, zeros out 2 and 3
- Run 2 (different data split): Lasso picks feature 2, zeros out 1 and 3
- **Result**: Unstable feature selection → different runs give different "important" features

**Why Ridge handles this better:**

- Ridge shrinks all correlated features together
- Stable across different data splits
- Interpretable: "All revenue-related features matter"

**Best solution: ElasticNet**

```python
ElasticNet(alpha=0.1, l1_ratio=0.5)
# Combines L1 (feature selection) + L2 (stability with correlation)
```

**Rule of thumb:**

- **Independent features** → Lasso (clean feature selection)
- **Correlated features** → Ridge or ElasticNet (stability)
- **Unsure** → ElasticNet with cross-validation

</details>

---

### Question 3: Alpha Tuning

Your Ridge model has train R² = 0.95 and test R² = 0.60. Should you increase or decrease alpha?

<details>
<summary>Click for Answer</summary>

**Answer:** **Increase** alpha. The large gap (0.95 - 0.60 = 0.35) indicates overfitting. Stronger regularization (higher alpha) will reduce this gap.

**Interpretation:**

- Train R² = 0.95 → model fits training data very well
- Test R² = 0.60 → model generalizes poorly
- **Diagnosis**: Overfitting!

**Effect of alpha:**

- **Low alpha** (close to 0) → weak regularization → model can overfit
- **High alpha** → strong regularization → shrinks coefficients → reduces overfitting

**Tuning strategy:**

```python
from sklearn.linear_model import RidgeCV

# Try increasing alphas
alphas = [0.1, 1, 10, 100, 1000]
ridge_cv = RidgeCV(alphas=alphas, cv=5)
ridge_cv.fit(X_train, y_train)

print(f"Best alpha: {ridge_cv.alpha_}")
# Likely selects higher alpha to close the gap
```

**Expected outcome with higher alpha:**

- Train R² decreases (e.g., 0.95 → 0.85)
- Test R² increases (e.g., 0.60 → 0.80)
- **Smaller gap = better generalization**

**Visual check:**

- Plot train/test R² vs alpha
- Sweet spot: where lines converge

</details>

---

### Question 4: Feature Scaling

Why must you standardize features before applying Ridge or Lasso?

<details>
<summary>Click for Answer</summary>

**Answer:** Regularization penalizes large coefficients. Without standardization, features with different scales get unfairly penalized.

**The problem:**

```python
# Feature 1: Age (range 20-80)
# Feature 2: Income (range 20,000-200,000)

# Without scaling:
β₁ = 0.5  # Age coefficient
β₂ = 0.0001  # Income coefficient (small to compensate for large scale)

# Regularization penalty:
Penalty_β₁ = 0.5² = 0.25
Penalty_β₂ = 0.0001² = 0.00000001

# Ridge unfairly shrinks β₁ much more than β₂!
```

**After standardization:**

```python
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)
# Now: mean=0, std=1 for all features

# Coefficients have comparable scales
β₁ = 0.4
β₂ = 0.3

# Penalty is fair
```

**Key principle:**
> Regularization should penalize **importance**, not **scale**.

**Exception:**

- If features are already on the same scale (e.g., all percentages 0-100), scaling isn't strictly necessary
- But it's best practice to always standardize

**Code template:**

```python
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.linear_model import Ridge

pipeline = Pipeline([
    ('scaler', StandardScaler()),
    ('ridge', Ridge(alpha=1.0))
])
pipeline.fit(X_train, y_train)
```

</details>

---

### Question 5: Production Regularization

Your Lasso model selected 10 features out of 100. In production, one of the selected features becomes unavailable (API change). What do you do?

<details>
<summary>Click for Answer</summary>

**Answer:** You have three options: (1) retrain without that feature, (2) impute the missing feature, or (3) fall back to a Ridge model that uses all features.

**Option 1: Retrain (Best)**

```python
# Remove unavailable feature
X_train_reduced = X_train.drop(columns=['unavailable_feature'])

# Retrain Lasso
lasso = LassoCV(cv=5)
lasso.fit(X_train_reduced, y_train)

# Deploy new model
```

**Pros**: Most accurate  
**Cons**: Requires retraining pipeline, testing, deployment

---

**Option 2: Feature Imputation (Quick Fix)**

```python
# Impute missing feature with mean/median/model prediction
from sklearn.impute import SimpleImputer

imputer = SimpleImputer(strategy='median')
X_production = imputer.fit_transform(X_production)

# Use existing model
predictions = lasso.predict(X_production)
```

**Pros**: No retraining needed  
**Cons**: Imputed values may degrade accuracy

---

**Option 3: Fallback to Ridge (Robust)**

```python
# Train a Ridge model alongside Lasso
ridge_backup = Ridge(alpha=1.0)
ridge_backup.fit(X_train, y_train)

# In production:
if feature_available:
    predictions = lasso.predict(X)
else:
    predictions = ridge_backup.predict(X_with_imputation)
```

**Pros**: Handles missing features gracefully  
**Cons**: Maintains two models

---

**Best Practice:**

1. **Monitor features**: Track feature availability in production
2. **Graceful degradation**: Have a fallback model (Ridge uses all features)
3. **Alert and retrain**: Trigger retraining when features disappear
4. **Feature contracts**: Negotiate SLAs with data providers

**Prevention:**

```python
# Prefer Ridge/ElasticNet over pure Lasso for production
# They use all features (more robust to missing data)
elastic = ElasticNetCV(l1_ratio=0.5, cv=5)
```

</details>

---

## Summary

Today you learned:

- ✅ Regularization prevents overfitting by penalizing model complexity
- ✅ Ridge (L2) shrinks coefficients, handles correlated features well
- ✅ Lasso (L1) performs feature selection by zeroing coefficients
- ✅ ElasticNet combines benefits of both Ridge and Lasso
- ✅ Always standardize features before regularization
- ✅ Use cross-validation (RidgeCV, LassoCV) to find optimal alpha

**Tomorrow**: Ensemble methods—combining multiple models for superior performance.
