---
day: 43
title: "Classification Part 2"
phase: 4
phaseTitle: "Mathematical Foundations & ML Fundamentals"
slug: "classification-2"
duration: 55
difficulty: "intermediate"
tags: [machine-learning, classification, sklearn]
concepts: [precision, recall, F1-score, ROC curves, class imbalance]
prerequisites: [42]
outcomes: [Evaluate beyond accuracy, Handle imbalanced data, Use ROC curves]
---

# 🎯 Day 43: Supervised Learning - Classification Part 2

> *"Accuracy isn't everything. What if 99% of emails are not spam?"*

---

## The "Never-Coded" Bridge

Accuracy fails with imbalanced classes. Precision and recall tell the full story:
- **Precision**: Of predictions marked positive, how many were correct?
- **Recall**: Of actual positives, how many did we catch?

---

## The Technical Deep Dive

### Precision, Recall, F1

```python
from sklearn.metrics import precision_score, recall_score, f1_score

precision = precision_score(y_test, predictions)
recall = recall_score(y_test, predictions)
f1 = f1_score(y_test, predictions)

print(f"Precision: {precision:.2%}")  # TP / (TP + FP)
print(f"Recall: {recall:.2%}")        # TP / (TP + FN)
print(f"F1: {f1:.2%}")                # Harmonic mean
```

### When to Prioritize

| Scenario            | Prioritize | Why                            |
| ------------------- | ---------- | ------------------------------ |
| Spam detection      | Precision  | Don't mark real emails as spam |
| Disease screening   | Recall     | Don't miss sick patients       |
| Balanced importance | F1-score   | Compromise                     |

### ROC Curve

```python
from sklearn.metrics import roc_curve, auc
import matplotlib.pyplot as plt

y_probs = model.predict_proba(X_test)[:, 1]  # Probability of class 1
fpr, tpr, thresholds = roc_curve(y_test, y_probs)
roc_auc = auc(fpr, tpr)

plt.plot(fpr, tpr, label=f"AUC = {roc_auc:.2f}")
plt.plot([0, 1], [0, 1], "k--")
plt.xlabel("False Positive Rate")
plt.ylabel("True Positive Rate")
plt.title("ROC Curve")
plt.legend()
plt.show()
```

### Handling Imbalanced Data

```python
from sklearn.utils import class_weight

# Compute weights
weights = class_weight.compute_class_weight("balanced", classes=np.unique(y), y=y)
class_weights = dict(zip(np.unique(y), weights))

# Use in model
model = LogisticRegression(class_weight="balanced")
```

---

## Hands-on Lab

```python
from sklearn.datasets import make_classification
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, roc_curve, auc
import matplotlib.pyplot as plt

# Imbalanced dataset
X, y = make_classification(n_samples=1000, weights=[0.9, 0.1], random_state=42)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# Train with balanced weights
model = LogisticRegression(class_weight="balanced")
model.fit(X_train, y_train)

print(classification_report(y_test, model.predict(X_test)))
```

---

## Summary

- ✅ Precision = quality of positive predictions
- ✅ Recall = coverage of actual positives
- ✅ F1 = balanced metric
- ✅ ROC-AUC measures overall performance

**Tomorrow**: Unsupervised Learning.
