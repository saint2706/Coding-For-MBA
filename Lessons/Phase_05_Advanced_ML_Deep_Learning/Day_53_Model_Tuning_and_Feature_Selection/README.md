---
day: 53
title: "Model Tuning & Feature Selection"
phase: 5
phaseTitle: "Advanced ML & Deep Learning"
slug: "model-tuning"
duration: 55
difficulty: "advanced"
tags: [machine-learning, hyperparameters, feature-selection]
concepts: [grid search, random search, feature importance, recursive elimination]
prerequisites: [45, 52]
outcomes: [Tune hyperparameters systematically, Select important features, Optimize model performance]
---

# 🎯 Day 53: Model Tuning & Feature Selection

> *"The difference between good and great is in the details."*

---

## The Technical Deep Dive

### Grid Search

```python
from sklearn.model_selection import GridSearchCV

param_grid = {
    "n_estimators": [50, 100, 200],
    "max_depth": [3, 5, 10],
    "learning_rate": [0.01, 0.1, 0.2]
}

grid_search = GridSearchCV(model, param_grid, cv=5, scoring="accuracy")
grid_search.fit(X_train, y_train)

print(f"Best params: {grid_search.best_params_}")
print(f"Best score: {grid_search.best_score_:.2%}")
```

### Random Search

```python
from sklearn.model_selection import RandomizedSearchCV
from scipy.stats import uniform, randint

param_dist = {
    "n_estimators": randint(50, 200),
    "max_depth": randint(3, 15),
    "learning_rate": uniform(0.01, 0.3)
}

random_search = RandomizedSearchCV(model, param_dist, n_iter=20, cv=5)
random_search.fit(X_train, y_train)
```

### Feature Selection

```python
from sklearn.feature_selection import SelectKBest, f_classif, RFE

# K-best features
selector = SelectKBest(f_classif, k=10)
X_selected = selector.fit_transform(X, y)

# Recursive Feature Elimination
from sklearn.ensemble import RandomForestClassifier
rfe = RFE(RandomForestClassifier(), n_features_to_select=10)
X_selected = rfe.fit_transform(X, y)
```

---

## Summary

- ✅ Grid search: exhaustive but slow
- ✅ Random search: often equally effective
- ✅ Feature selection reduces complexity

**Tomorrow**: Probabilistic modeling.
