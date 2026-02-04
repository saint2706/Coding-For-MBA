---
day: 62
title: "Model Interpretability & Fairness"
phase: 6
phaseTitle: "Cutting-Edge ML & BI Foundations"
slug: "interpretability-fairness"
duration: 55
difficulty: "advanced"
tags: [machine-learning, explainability, ethics]
concepts: [SHAP, LIME, bias detection, fairness metrics]
prerequisites: [40, 52]
outcomes: [Explain model predictions, Detect bias, Apply fairness constraints]
---

# 🎯 Day 62: Model Interpretability & Fairness

> *"Black boxes aren't acceptable when decisions affect lives."*

---

## The Technical Deep Dive

### SHAP Values

```python
import shap

explainer = shap.TreeExplainer(model)
shap_values = explainer.shap_values(X_test)

# Summary plot
shap.summary_plot(shap_values, X_test)

# Single prediction
shap.force_plot(explainer.expected_value, shap_values[0], X_test.iloc[0])
```

### Fairness Metrics

```python
from fairlearn.metrics import demographic_parity_difference

# Compare outcomes across groups
dpd = demographic_parity_difference(y_true, y_pred, sensitive_features=sensitive)
```

---

## Summary

- ✅ SHAP explains feature importance
- ✅ Fairness metrics detect bias
- ✅ Trade-offs between accuracy and fairness

**Tomorrow**: Causal Inference.
