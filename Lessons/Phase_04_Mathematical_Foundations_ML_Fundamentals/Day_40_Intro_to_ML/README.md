---
day: 40
title: "Introduction to Machine Learning"
phase: 4
phaseTitle: "Mathematical Foundations & ML Fundamentals"
slug: "intro-ml"
duration: 55
difficulty: "intermediate"
tags: [machine-learning, sklearn, concepts]
concepts: [supervised vs unsupervised, training and testing, model evaluation]
prerequisites: [38, 39]
outcomes: [Understand ML paradigms, Split data properly, Evaluate model performance]
---

# 🎯 Day 40: Introduction to Machine Learning

> *"Machine learning is programming with examples instead of rules."*

---

## The "Never-Coded" Bridge

Traditional programming:
```
Rules + Data → Answers
```

Machine learning:
```
Data + Answers → Rules (Model)
```

---

## The Technical Deep Dive

### ML Paradigms

| Type              | Goal                         | Examples                                 |
| ----------------- | ---------------------------- | ---------------------------------------- |
| **Supervised**    | Predict labels from features | Spam detection, price prediction         |
| **Unsupervised**  | Find patterns in data        | Customer segmentation, anomaly detection |
| **Reinforcement** | Learn actions from rewards   | Game AI, robotics                        |

### The ML Workflow

```python
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error

# 1. Prepare data
X = df[["feature1", "feature2"]]
y = df["target"]

# 2. Split: train and test
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 3. Train model
model = LinearRegression()
model.fit(X_train, y_train)

# 4. Predict
predictions = model.predict(X_test)

# 5. Evaluate
mse = mean_squared_error(y_test, predictions)
print(f"MSE: {mse}")
```

### Why Split Data?

```
All Data (100%)
├── Training Set (80%) - Model learns from this
└── Test Set (20%) - Evaluate on unseen data

Prevents overfitting (memorizing vs learning)
```

### Evaluation Metrics

**Regression:**
- MSE (Mean Squared Error)
- RMSE (Root MSE)
- R² (coefficient of determination)

**Classification:**
- Accuracy
- Precision, Recall, F1
- Confusion Matrix

---

## Hands-on Lab

```python
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import accuracy_score

# Load data
iris = load_iris()
X, y = iris.data, iris.target

# Split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train
model = KNeighborsClassifier(n_neighbors=3)
model.fit(X_train, y_train)

# Evaluate
predictions = model.predict(X_test)
accuracy = accuracy_score(y_test, predictions)
print(f"Accuracy: {accuracy:.2%}")
```

---

## Summary

- ✅ ML learns patterns from data
- ✅ Supervised = labeled data
- ✅ Train/test split prevents overfitting
- ✅ Scikit-learn is the go-to library

**Tomorrow**: Linear Regression deep dive.
