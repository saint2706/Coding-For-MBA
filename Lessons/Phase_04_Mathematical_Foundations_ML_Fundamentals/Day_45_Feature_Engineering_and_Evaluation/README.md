---
day: 45
title: "Feature Engineering & Evaluation"
phase: 4
phaseTitle: "Mathematical Foundations & ML Fundamentals"
slug: "feature-engineering"
duration: 55
difficulty: "intermediate"
tags: [machine-learning, features, cross-validation]
concepts: [feature creation, scaling, encoding, cross-validation]
prerequisites: [40, 41, 42]
outcomes: [Engineer useful features, Scale and encode data, Validate with cross-validation]
---

# 🎯 Day 45: Feature Engineering & Model Evaluation

> *"Good features are worth more than complex algorithms."*

---

## The "Never-Coded" Bridge

Raw data rarely works well. Feature engineering transforms data into forms models understand:
- **Scaling**: Normalize ranges
- **Encoding**: Convert categories to numbers
- **Creation**: Build new informative features

---

## The Technical Deep Dive

### Feature Scaling

```python
from sklearn.preprocessing import StandardScaler, MinMaxScaler

# Standardization: mean=0, std=1
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Min-Max: scale to [0, 1]
scaler = MinMaxScaler()
X_scaled = scaler.fit_transform(X)
```

### Categorical Encoding

```python
from sklearn.preprocessing import LabelEncoder, OneHotEncoder

# Label encoding: categories to integers
le = LabelEncoder()
df["color_encoded"] = le.fit_transform(df["color"])

# One-hot encoding: create binary columns
df_encoded = pd.get_dummies(df, columns=["color"])
```

### Feature Creation

```python
# Date features
df["month"] = df["date"].dt.month
df["day_of_week"] = df["date"].dt.dayofweek
df["is_weekend"] = df["day_of_week"].isin([5, 6])

# Ratios
df["price_per_sqft"] = df["price"] / df["sqft"]

# Binning
df["age_group"] = pd.cut(df["age"], bins=[0, 18, 35, 55, 100], labels=["youth", "young_adult", "middle", "senior"])
```

### Cross-Validation

```python
from sklearn.model_selection import cross_val_score

model = LogisticRegression()
scores = cross_val_score(model, X, y, cv=5)

print(f"Scores: {scores}")
print(f"Mean: {scores.mean():.2f} (+/- {scores.std()*2:.2f})")
```

---

## Hands-on Lab

```python
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score

# Create pipeline
pipeline = Pipeline([
    ("scaler", StandardScaler()),
    ("classifier", LogisticRegression())
])

# Cross-validate
scores = cross_val_score(pipeline, X, y, cv=5)
print(f"CV Accuracy: {scores.mean():.2%} (+/- {scores.std()*2:.2%})")
```

---

## Summary

- ✅ Scale features for equal importance
- ✅ Encode categories for algorithms
- ✅ Create features from domain knowledge
- ✅ Cross-validate for robust estimates

**Tomorrow**: Neural Networks introduction.
