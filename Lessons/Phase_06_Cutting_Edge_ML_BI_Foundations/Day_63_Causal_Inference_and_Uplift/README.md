---
day: 63
title: "Causal Inference & Uplift"
phase: 6
phaseTitle: "Cutting-Edge ML & BI Foundations"
slug: "causal-inference"
duration: 55
difficulty: "advanced"
tags: [machine-learning, causality, experimentation]
concepts: [A/B testing, causal models, uplift modeling]
prerequisites: [26, 40]
outcomes: [Distinguish correlation from causation, Design experiments, Apply uplift models]
---

# 🎯 Day 63: Causal Inference & Uplift

> *"Correlation is not causation. Find what actually works."*

---

## The Technical Deep Dive

### A/B Testing

```python
from scipy import stats

control = [...]  # Conversion rates
treatment = [...]

t_stat, p_value = stats.ttest_ind(control, treatment)
print(f"p-value: {p_value:.4f}")
```

### Uplift Modeling

```python
# Who benefits most from treatment?
# Uplift = P(Y|Treatment) - P(Y|Control)

from causalml.inference.meta import BaseSClassifier

learner = BaseSClassifier(learner=LogisticRegression())
learner.fit(X, treatment, y)
uplift = learner.predict(X_new)
```

---

## Summary

- ✅ A/B tests establish causation
- ✅ Uplift finds who benefits most
- ✅ Causal thinking prevents mistakes

**Tomorrow**: Modern NLP Pipelines.
