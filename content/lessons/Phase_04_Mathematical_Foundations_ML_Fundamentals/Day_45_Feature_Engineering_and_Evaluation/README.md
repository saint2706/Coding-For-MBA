---
day: 45
title: "Feature Engineering and Evaluation"
phase: 4
phaseTitle: "Mathematical Foundations & ML Fundamentals"
slug: "feature-engineering-evaluation"
duration: 55
difficulty: "intermediate"
tags:
  - machine-learning
  - feature-engineering
  - evaluation
  - cross-validation
concepts:
  - "feature creation"
  - "encoding categorical variables"
  - "cross-validation strategies"
  - "data leakage prevention"
prerequisites: [40, 41, 42, 43]
outcomes:
  - "Create and transform features effectively"
  - "Encode categorical data properly"
  - "Implement robust cross-validation"
  - "Build end-to-end ML pipelines"
---

# 🎯 Day 45: Feature Engineering and Evaluation

> *"Great features make mediocre algorithms perform well. Bad features make great algorithms fail."*

---

## The "Never-Coded" Bridge

**You're building a house price predictor.** The raw data has `year_built=1995`. But what the model really needs to know is: "How old is this house?" Converting `year_built` to `house_age` is feature engineering.

**Feature engineering in industry:**

- **Finance**: Calculating rolling averages, volatility ratios
- **E-commerce**: Extracting month/day from timestamps
- **Healthcare**: Deriving BMI from height/weight
- **Marketing**: Creating RFM scores

---

## The Technical Deep Dive

### Feature Creation

```python
import numpy as np
import pandas as pd

np.random.seed(42)
n = 500

data = pd.DataFrame(
    {
        "transaction_date": pd.date_range("2024-01-01", periods=n, freq="D"),
        "amount": np.random.exponential(100, n),
        "tenure_days": np.random.randint(1, 1000, n),
    }
)

# Date features
data["day_of_week"] = data["transaction_date"].dt.dayofweek
data["month"] = data["transaction_date"].dt.month
data["is_weekend"] = data["day_of_week"].isin([5, 6]).astype(int)

# Numeric transformations
data["log_amount"] = np.log1p(data["amount"])
data["amount_per_tenure"] = data["amount"] / data["tenure_days"]

print(data[["day_of_week", "is_weekend", "log_amount"]].head())
```

### Encoding Categorical Variables

```python
from sklearn.preprocessing import LabelEncoder, OneHotEncoder, OrdinalEncoder

categories = pd.DataFrame(
    {"color": ["Red", "Blue", "Green"], "quality": ["Low", "Medium", "High"]}
)

# One-hot for nominal variables
categories_onehot = pd.get_dummies(categories["color"], prefix="color")

# Ordinal for ordered variables
oe = OrdinalEncoder(categories=[["Low", "Medium", "High"]])
categories["quality_encoded"] = oe.fit_transform(categories[["quality"]])

print("One-Hot:", categories_onehot.values)
print("Ordinal:", categories["quality_encoded"].values)
```

### Cross-Validation Strategies

```python
from sklearn.model_selection import cross_val_score, KFold, StratifiedKFold
from sklearn.ensemble import RandomForestClassifier

np.random.seed(42)
X = np.random.randn(300, 5)
y = (X[:, 0] + X[:, 1] > 0).astype(int)

model = RandomForestClassifier(n_estimators=50, random_state=42)

# Standard K-Fold
kfold = KFold(n_splits=5, shuffle=True, random_state=42)
scores_kfold = cross_val_score(model, X, y, cv=kfold)
print(f"K-Fold: {scores_kfold.mean():.3f} ± {scores_kfold.std():.3f}")

# Stratified K-Fold (preserves class distribution)
skfold = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
scores_strat = cross_val_score(model, X, y, cv=skfold)
print(f"Stratified: {scores_strat.mean():.3f} ± {scores_strat.std():.3f}")
```

### Data Leakage Prevention

```python
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split

# ❌ WRONG: Fit scaler on ALL data
scaler_wrong = StandardScaler()
X_scaled = scaler_wrong.fit_transform(X)  # Sees test data!

# ✅ CORRECT: Fit only on training data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
scaler = StandardScaler()
X_train_s = scaler.fit_transform(X_train)
X_test_s = scaler.transform(X_test)  # Transform only, no fitting!
```

### Sklearn Pipelines

```python
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer

# Preprocessing pipelines
numeric_transformer = Pipeline(
    [("imputer", SimpleImputer(strategy="median")), ("scaler", StandardScaler())]
)

categorical_transformer = Pipeline(
    [
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("onehot", OneHotEncoder(handle_unknown="ignore")),
    ]
)

# Full pipeline with model
preprocessor = ColumnTransformer(
    [
        ("num", numeric_transformer, ["age", "income"]),
        ("cat", categorical_transformer, ["education"]),
    ]
)

pipeline = Pipeline(
    [("preprocessor", preprocessor), ("classifier", RandomForestClassifier())]
)

# Cross-validate entire pipeline (no leakage!)
# cv_scores = cross_val_score(pipeline, df, y, cv=5)
```

---

## Senior-Level Insights

### Feature Engineering Best Practices

| Category        | Technique         | When to Use           |
| --------------- | ----------------- | --------------------- |
| **Numeric**     | Log transform     | Right-skewed data     |
|                 | Binning           | Non-linear effects    |
| **Categorical** | One-hot           | Low cardinality (<10) |
|                 | Ordinal           | Natural order exists  |
| **Temporal**    | Day/month/quarter | Seasonality           |

### CV Strategy Guide

| Data Type       | Strategy          | Why                     |
| --------------- | ----------------- | ----------------------- |
| **Imbalanced**  | Stratified K-Fold | Preserves class ratio   |
| **Time series** | TimeSeriesSplit   | Respects temporal order |
| **Grouped**     | GroupKFold        | Same group in same fold |

---

## Hands-on Lab

### Exercise 1: Feature Engineering Pipeline

```python
import numpy as np
import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

np.random.seed(42)
df = pd.DataFrame(
    {
        "age": np.random.randint(18, 70, 500),
        "income": np.random.exponential(50000, 500),
        "tenure": np.random.randint(1, 1000, 500),
    }
)

# Engineer features
df["log_income"] = np.log1p(df["income"])
df["income_per_year"] = df["income"] / (df["age"] - 17)

print(df.describe())
```

### Exercise 2: CV Strategy Comparison

```python
from sklearn.model_selection import cross_val_score, StratifiedKFold, KFold
from sklearn.linear_model import LogisticRegression

np.random.seed(42)
X = np.random.randn(200, 5)
y = (X[:, 0] > 1).astype(int)  # Imbalanced

model = LogisticRegression()

for cv_name, cv in [("KFold", KFold(5)), ("Stratified", StratifiedKFold(5))]:
    scores = cross_val_score(model, X, y, cv=cv, scoring="f1")
    print(f"{cv_name}: {scores.mean():.3f} ± {scores.std():.3f}")
```

### Exercise 3: Leakage Detection

```python
# Spot the leakage!
from sklearn.preprocessing import StandardScaler

# WRONG
scaler = StandardScaler()
X_all = scaler.fit_transform(X)  # Leakage!
X_train, X_test = X_all[:160], X_all[160:]

# CORRECT
X_train, X_test = X[:160], X[160:]
scaler = StandardScaler()
X_train_s = scaler.fit_transform(X_train)
X_test_s = scaler.transform(X_test)
```

---

## Mastery Check

### Question 1: Choosing Encoding

Feature 'education': High School, Bachelor, Master, PhD. Which encoding?

<details>
<summary>Answer</summary>

**Ordinal Encoding** - education has natural order. Use `OrdinalEncoder(categories=[['High School', 'Bachelor', 'Master', 'PhD']])`.

</details>

### Question 2: Stratified K-Fold

When is Stratified K-Fold essential?

<details>
<summary>Answer</summary>

**Imbalanced classes** - ensures each fold has same class ratio. Without it, some folds might have 0% of minority class.

</details>

### Question 3: Spotting Leakage

99.5% CV accuracy but 70% on production. What happened?

<details>
<summary>Answer</summary>

**Data leakage** - test data information leaked into training. Common causes: preprocessing before split, features derived from target.

</details>

### Question 4: Log Transform

Why log transform income data?

<details>
<summary>Answer</summary>

Income is **right-skewed**. Log transform makes it more normal, reduces outlier impact, helps linear models.

</details>

### Question 5: Pipeline Benefits

Why use sklearn Pipeline over manual preprocessing?

<details>
<summary>Answer</summary>

- Prevents data leakage automatically
- Single object to save/load
- Grid search across preprocessing + model
- Clear, reproducible code

</details>

---

## Math-to-Debug Tasks

1. **Leakage detection protocol**: Audit each feature with a timestamp and data-availability table; flag any feature that is unavailable at prediction time or computed before split.
2. **Metric selection under class imbalance**: For the same model, compare accuracy, balanced accuracy, F1, ROC-AUC, and PR-AUC; justify which metric should govern decisions when positives are rare.
3. **Why-model-failed case**: Offline AUC is excellent but production performance collapses. Explain conceptually *why the model failed* (target leakage + metric mismatch), then take corrective action by rebuilding a leakage-safe pipeline, enforcing temporal validation, and selecting threshold/metric based on minority-class business cost.

---

## Summary

- ✅ Feature engineering transforms raw data into model-ready signals
- ✅ Choose encoding based on categorical type (ordinal vs nominal)
- ✅ Stratified K-Fold preserves class balance
- ✅ Data leakage inflates scores, fails in production
- ✅ Pipelines prevent leakage automatically

**Tomorrow**: Introduction to Neural Networks.
