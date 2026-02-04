---
day: 51
title: "Regularized Models"
phase: 5
phaseTitle: "Advanced ML & Deep Learning"
slug: "regularization"
duration: 50
difficulty: "advanced"
tags: [machine-learning, regularization, overfitting]
concepts: [L1/L2 regularization, Ridge, Lasso, ElasticNet]
prerequisites: [41, 45]
outcomes: [Prevent overfitting with regularization, Choose between L1/L2, Apply regularization in practice]
---

# 🎯 Day 51: Regularized Models

> *"Regularization: the art of making models generalize."*

---

## The Technical Deep Dive

### Ridge Regression (L2)

```python
from sklearn.linear_model import Ridge

# Alpha controls regularization strength
model = Ridge(alpha=1.0)
model.fit(X_train, y_train)
```

### Lasso Regression (L1)

```python
from sklearn.linear_model import Lasso

# L1 can zero out features (feature selection)
model = Lasso(alpha=0.1)
model.fit(X_train, y_train)

# Check which features were kept
print(f"Non-zero coefficients: {sum(model.coef_ != 0)}")
```

### ElasticNet (L1 + L2)

```python
from sklearn.linear_model import ElasticNet

# Combines L1 and L2
model = ElasticNet(alpha=0.1, l1_ratio=0.5)
model.fit(X_train, y_train)
```

### Cross-Validation for Alpha

```python
from sklearn.linear_model import RidgeCV

# Automatically find best alpha
alphas = [0.01, 0.1, 1.0, 10.0, 100.0]
model = RidgeCV(alphas=alphas, cv=5)
model.fit(X_train, y_train)
print(f"Best alpha: {model.alpha_}")
```

| Method     | Penalty                 | Effect               |
| ---------- | ----------------------- | -------------------- |
| Ridge (L2) | Sum of squared weights  | Shrinks coefficients |
| Lasso (L1) | Sum of absolute weights | Zeros out features   |
| ElasticNet | Both                    | Best of both worlds  |

---

## Summary

- ✅ Regularization reduces overfitting
- ✅ Ridge shrinks, Lasso selects features
- ✅ Use cross-validation to tune alpha

**Tomorrow**: Ensemble methods.
