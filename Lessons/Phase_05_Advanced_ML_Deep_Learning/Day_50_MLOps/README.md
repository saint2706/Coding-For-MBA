---
day: 50
title: "MLOps Fundamentals"
phase: 5
phaseTitle: "Advanced ML & Deep Learning"
slug: "mlops"
duration: 55
difficulty: "advanced"
tags: [mlops, deployment, production]
concepts: [model versioning, experiment tracking, model serving]
prerequisites: [40, 45]
outcomes: [Track experiments, Version models, Deploy to production]
---

# 🎯 Day 50: MLOps Fundamentals

> *"ML that works in a notebook isn't ML in production."*

---

## The Technical Deep Dive

### Experiment Tracking with MLflow

```python
import mlflow

mlflow.set_experiment("my_experiment")

with mlflow.start_run():
    mlflow.log_param("learning_rate", 0.01)
    mlflow.log_param("epochs", 100)
    
    # Train model...
    
    mlflow.log_metric("accuracy", 0.95)
    mlflow.log_metric("loss", 0.05)
    mlflow.sklearn.log_model(model, "model")
```

### Model Versioning

```python
# Save model
import joblib
joblib.dump(model, "model_v1.0.pkl")

# Load model
loaded_model = joblib.load("model_v1.0.pkl")
predictions = loaded_model.predict(X_test)
```

### Model Serving with FastAPI

```python
from fastapi import FastAPI
import joblib
import numpy as np

app = FastAPI()
model = joblib.load("model.pkl")

@app.post("/predict")
def predict(features: list):
    X = np.array(features).reshape(1, -1)
    prediction = model.predict(X)
    return {"prediction": prediction.tolist()}
```

### CI/CD for ML

```yaml
# .github/workflows/ml-pipeline.yml
name: ML Pipeline
on: push
jobs:
  train:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: pip install -r requirements.txt
      - run: python train.py
      - run: python test_model.py
```

---

## Summary

- ✅ Track experiments with MLflow
- ✅ Version models with joblib
- ✅ Serve with FastAPI
- ✅ Automate with CI/CD

**Tomorrow**: Regularization techniques.
