---
day: 42
title: "Classification Part 1"
phase: 4
phaseTitle: "Mathematical Foundations & ML Fundamentals"
slug: "classification-1"
duration: 55
difficulty: "intermediate"
tags: [machine-learning, classification, sklearn]
concepts: [logistic regression, decision boundaries, accuracy metrics]
prerequisites: [40, 41]
outcomes: [Build classification models, Understand probability outputs, Evaluate with accuracy]
---

# 🎯 Day 42: Supervised Learning - Classification Part 1

> *"Classification predicts categories. Will the customer churn? Is this email spam?"*

---

## The "Never-Coded" Bridge

Classification answers: **"Which category?"**
- Spam or not spam
- Customer will churn or stay
- Loan approved or denied

---

## The Technical Deep Dive

### Logistic Regression

```python
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.datasets import load_iris

# Binary classification
iris = load_iris()
X = iris.data[:100]  # Only 2 classes
y = iris.target[:100]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

model = LogisticRegression()
model.fit(X_train, y_train)

# Predict classes
predictions = model.predict(X_test)

# Predict probabilities
probabilities = model.predict_proba(X_test)
print(probabilities[:5])  # [P(class 0), P(class 1)]
```

### Evaluation Metrics

```python
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report

accuracy = accuracy_score(y_test, predictions)
print(f"Accuracy: {accuracy:.2%}")

# Confusion matrix
cm = confusion_matrix(y_test, predictions)
print(cm)
# [[TN, FP],
#  [FN, TP]]

# Full report
print(classification_report(y_test, predictions))
```

### K-Nearest Neighbors

```python
from sklearn.neighbors import KNeighborsClassifier

model = KNeighborsClassifier(n_neighbors=5)
model.fit(X_train, y_train)
predictions = model.predict(X_test)
```

### Decision Trees

```python
from sklearn.tree import DecisionTreeClassifier

model = DecisionTreeClassifier(max_depth=3)
model.fit(X_train, y_train)
predictions = model.predict(X_test)
```

---

## Hands-on Lab

```python
from sklearn.datasets import make_classification
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, confusion_matrix
import seaborn as sns
import matplotlib.pyplot as plt

# Generate data
X, y = make_classification(n_samples=200, n_features=2, n_redundant=0, random_state=42)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# Train
model = LogisticRegression()
model.fit(X_train, y_train)
predictions = model.predict(X_test)

# Confusion matrix heatmap
cm = confusion_matrix(y_test, predictions)
sns.heatmap(cm, annot=True, fmt="d", cmap="Blues")
plt.xlabel("Predicted")
plt.ylabel("Actual")
plt.title(f"Accuracy: {accuracy_score(y_test, predictions):.2%}")
plt.show()
```

---

## Summary

- ✅ Classification predicts categories
- ✅ Logistic regression outputs probabilities
- ✅ Confusion matrix shows errors
- ✅ Accuracy = correct / total

**Tomorrow**: More classification algorithms.
