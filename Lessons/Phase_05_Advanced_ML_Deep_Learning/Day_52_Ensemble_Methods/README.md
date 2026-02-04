---
day: 52
title: "Ensemble Methods"
phase: 5
phaseTitle: "Advanced ML & Deep Learning"
slug: "ensemble-methods"
duration: 55
difficulty: "advanced"
tags: [machine-learning, random-forest, gradient-boosting]
concepts: [bagging, boosting, Random Forest, XGBoost]
prerequisites: [41, 42]
outcomes: [Combine models for better performance, Use Random Forest and XGBoost, Understand bagging vs boosting]
---

# 🎯 Day 52: Ensemble Methods

> *"Many weak models become one strong model."*

---

## The Technical Deep Dive

### Random Forest (Bagging)

```python
from sklearn.ensemble import RandomForestClassifier

model = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)
model.fit(X_train, y_train)

# Feature importance
for name, importance in zip(feature_names, model.feature_importances_):
    print(f"{name}: {importance:.3f}")
```

### Gradient Boosting

```python
from sklearn.ensemble import GradientBoostingClassifier

model = GradientBoostingClassifier(n_estimators=100, learning_rate=0.1, max_depth=3)
model.fit(X_train, y_train)
```

### XGBoost

```python
import xgboost as xgb

model = xgb.XGBClassifier(n_estimators=100, learning_rate=0.1, max_depth=3)
model.fit(X_train, y_train)
```

| Bagging (Random Forest) | Boosting (XGBoost)     |
| ----------------------- | ---------------------- |
| Parallel trees          | Sequential trees       |
| Reduces variance        | Reduces bias           |
| Less prone to overfit   | Can overfit            |
| Good default choice     | Often best performance |

---

## Summary

- ✅ Random Forest: parallel, reduces variance
- ✅ Gradient Boosting: sequential, reduces bias
- ✅ XGBoost: optimized, often wins competitions

**Tomorrow**: Model tuning and feature selection.
