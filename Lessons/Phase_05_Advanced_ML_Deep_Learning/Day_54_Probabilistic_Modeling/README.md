---
day: 54
title: "Probabilistic Modeling"
phase: 5
phaseTitle: "Advanced ML & Deep Learning"
slug: "probabilistic-modeling"
duration: 50
difficulty: "advanced"
tags: [machine-learning, bayes, probability]
concepts: [Naive Bayes, Gaussian processes, probabilistic predictions]
prerequisites: [42, 43]
outcomes: [Use probabilistic classifiers, Understand uncertainty in predictions, Apply Bayesian thinking]
---

# 🎯 Day 54: Probabilistic Modeling

> *"Not just predictions, but confidence in predictions."*

---

## The Technical Deep Dive

### Naive Bayes

```python
from sklearn.naive_bayes import GaussianNB, MultinomialNB

# For continuous features
model = GaussianNB()
model.fit(X_train, y_train)

# Probability predictions
probs = model.predict_proba(X_test)
```

### Calibrated Probabilities

```python
from sklearn.calibration import CalibratedClassifierCV

calibrated = CalibratedClassifierCV(model, method="isotonic")
calibrated.fit(X_train, y_train)
probs = calibrated.predict_proba(X_test)
```

### Gaussian Processes

```python
from sklearn.gaussian_process import GaussianProcessClassifier
from sklearn.gaussian_process.kernels import RBF

kernel = 1.0 * RBF()
model = GaussianProcessClassifier(kernel=kernel)
model.fit(X_train, y_train)
probs = model.predict_proba(X_test)
```

---

## Summary

- ✅ Naive Bayes: fast, good baseline
- ✅ Calibration improves probability accuracy
- ✅ GPs provide uncertainty estimates

**Tomorrow**: Advanced unsupervised learning.
