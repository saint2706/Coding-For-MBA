---
day: 41
title: "Supervised Learning: Regression"
phase: 4
phaseTitle: "Mathematical Foundations & ML Fundamentals"
slug: "regression"
duration: 55
difficulty: "intermediate"
tags: [machine-learning, regression, sklearn]
concepts: [linear regression, polynomial regression, regularization]
prerequisites: [38, 39, 40]
outcomes: [Build regression models, Evaluate with MSE and R², Handle overfitting]
---

# 🎯 Day 41: Supervised Learning - Regression

> *"Regression predicts continuous values. How much will the house sell for?"*

---

## The "Never-Coded" Bridge

Regression answers: **"How much?"**
- House price based on size, location
- Revenue based on marketing spend
- Temperature based on time of year

---

## The Technical Deep Dive

### Linear Regression

```python
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
import numpy as np

# Generate data
np.random.seed(42)
X = np.random.rand(100, 1) * 10
y = 2 * X + 1 + np.random.randn(100, 1) * 2

# Split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# Train
model = LinearRegression()
model.fit(X_train, y_train)

# Coefficients
print(f"Slope: {model.coef_[0][0]:.2f}")
print(f"Intercept: {model.intercept_[0]:.2f}")
```

### Evaluation Metrics

```python
from sklearn.metrics import mean_squared_error, r2_score

predictions = model.predict(X_test)

mse = mean_squared_error(y_test, predictions)
rmse = np.sqrt(mse)
r2 = r2_score(y_test, predictions)

print(f"MSE: {mse:.2f}")
print(f"RMSE: {rmse:.2f}")
print(f"R²: {r2:.2f}")  # 1.0 = perfect, 0 = no predictive power
```

### Multiple Features

```python
# Multiple linear regression
from sklearn.datasets import load_boston  # or make_regression

X = df[["sqft", "bedrooms", "bathrooms"]]
y = df["price"]

model = LinearRegression()
model.fit(X, y)

# Feature importance
for name, coef in zip(X.columns, model.coef_):
    print(f"{name}: {coef:.2f}")
```

### Polynomial Regression

```python
from sklearn.preprocessing import PolynomialFeatures

# Transform features
poly = PolynomialFeatures(degree=2)
X_poly = poly.fit_transform(X)

model = LinearRegression()
model.fit(X_poly, y)
```

---

## Hands-on Lab

```python
from sklearn.datasets import make_regression
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score
import matplotlib.pyplot as plt

# Generate synthetic data
X, y = make_regression(n_samples=100, n_features=1, noise=10, random_state=42)

# Split and train
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
model = LinearRegression()
model.fit(X_train, y_train)

# Visualize
plt.scatter(X_test, y_test, label="Actual")
plt.plot(X_test, model.predict(X_test), color="red", label="Predicted")
plt.legend()
plt.title(f"R² = {r2_score(y_test, model.predict(X_test)):.2f}")
plt.show()
```

---

## Summary

- ✅ Linear regression predicts continuous values
- ✅ R² measures explained variance
- ✅ Multiple features = multiple coefficients
- ✅ Polynomial for non-linear patterns

**Tomorrow**: Classification algorithms.
