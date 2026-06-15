---
day: 50
title: "MLOps Fundamentals"
phase: 5
phaseTitle: "Advanced ML & Deep Learning"
slug: "mlops"
duration: 55
difficulty: "advanced"
tags:
  - mlops
  - deployment
  - production
  - devops
concepts:
  - "experiment tracking"
  - "model versioning"
  - "model deployment"
  - "monitoring and drift detection"
  - "CI/CD for ML"
prerequisites: [40, 45]
outcomes:
  - "Track experiments systematically with MLflow"
  - "Version and deploy models to production"
  - "Monitor model performance and detect data drift"
  - "Implement CI/CD pipelines for ML"
---

# 🎯 Day 50: MLOps Fundamentals

> *"ML that works in a notebook isn't ML that works in production."*

---

## The "Never-Coded" Bridge

**Imagine your

 company spent 6 months building a perfect ML model.** It predicts customer churn with 95% accuracy in testing. You're ready to deploy. Then reality hits:

- **"Which model version are we deploying?"** 47 experiments, no tracking.
- **"What hyperparameters did we use?"** Lost in a notebook somewhere.
- **"The model stopped working after 3 months!"** Data distribution changed, no one noticed.
- **"How do we roll back to the old model?"** No versioning system.

This is why 87% of ML models never make it to production (VentureBeat, 2019).

**MLOps solves this.** It's DevOps for machine learning—bringing software engineering discipline to ML:

**Real-world MLOps impact:**

- **Spotify**: Deploys 10+ ML models daily using automated pipelines
- **Uber**: Monitors 1000+ models in production, auto-rolls back failing models
- **Netflix**: A/B tests model changes on millions of users safely
- **Airbnb**: Reduced model deployment time from weeks to days

---

## The Technical Deep Dive

### Experiment Tracking with MLflow

Stop losing experiments. Track everything automatically.

```python
import mlflow
import mlflow.sklearn
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.datasets import make_classification
from sklearn.metrics import accuracy_score, precision_score, recall_score

# Create sample data
X, y = make_classification(n_samples=1000, n_features=20, n_classes=2, random_state=42)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Set experiment (organizes related runs)
mlflow.set_experiment("customer_churn_prediction")

# Run multiple experiments
hyperparameters = [
    {"n_estimators": 50, "max_depth": 10},
    {"n_estimators": 100, "max_depth": 15},
    {"n_estimators": 200, "max_depth": 20},
]

for params in hyperparameters:
    with mlflow.start_run(run_name=f"RF_{params['n_estimators']}_trees"):
        # Log parameters
        mlflow.log_params(params)

        # Train model
        model = RandomForestClassifier(**params, random_state=42)
        model.fit(X_train, y_train)

        # Make predictions
        y_pred = model.predict(X_test)

        # Calculate metrics
        accuracy = accuracy_score(y_test, y_pred)
        precision = precision_score(y_test, y_pred)
        recall = recall_score(y_test, y_pred)

        # Log metrics
        mlflow.log_metrics(
            {"accuracy": accuracy, "precision": precision, "recall": recall}
        )

        # Log model
        mlflow.sklearn.log_model(model, "random_forest_model")

        # Log additional artifacts
        import matplotlib.pyplot as plt
        from sklearn.metrics import confusion_matrix
        import seaborn as sns

        cm = confusion_matrix(y_test, y_pred)
        plt.figure(figsize=(6, 5))
        sns.heatmap(cm, annot=True, fmt="d", cmap="Blues")
        plt.title(f"Confusion Matrix (n_estimators={params['n_estimators']})")
        plt.ylabel("True")
        plt.xlabel("Predicted")
        plt.savefig("confusion_matrix.png")
        mlflow.log_artifact("confusion_matrix.png")
        plt.close()

        print(f"Run completed: {params} → Accuracy: {accuracy:.3f}")

# View results in MLflow UI
print("\nView experiments at: http://localhost:5000")
print("Run: mlflow ui")
```

**Benefits of tracking:**

- Compare 100+ experiments at a glance
- Reproduce any result months later
- Share findings with team (no more "it worked on my machine")
- Automatically track who ran what and when

### Model Versioning and Registry

```python
import mlflow
from mlflow.tracking import MlflowClient

# Initialize client
client = MlflowClient()

# Register model (after training)
model_uri = "runs:/<run_id>/random_forest_model"
model_name = "ChurnPredictionModel"

# Create registered model
try:
    client.create_registered_model(model_name)
except:
    pass  # Already exists

# Add version to registry
model_version = mlflow.register_model(model_uri, model_name)

print(f"Model registered as {model_name} version {model_version.version}")

# Promote model through stages
# Staging → Production → Archived
client.transition_model_version_stage(
    name=model_name,
    version=model_version.version,
    stage="Staging",  # or "Production"
)

# Load production model (anywhere in organization)
production_model = mlflow.sklearn.load_model(f"models:/{model_name}/Production")

# Make predictions
new_predictions = production_model.predict(X_test[:5])
print(f"Production predictions: {new_predictions}")
```

### Model Deployment with FastAPI

Transform models into production-ready APIs.

```python
# save_model.py - Save model for deployment
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split

X, y = make_classification(n_samples=1000, n_features=10, random_state=42)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

joblib.dump(model, "churn_model.pkl")
print("Model saved successfully!")
```

```python
# app.py - FastAPI deployment
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import numpy as np
from typing import List
import uvicorn

# Load model at startup
model = joblib.load("churn_model.pkl")

app = FastAPI(title="Churn Prediction API", version="1.0")


# Define input schema
class PredictionInput(BaseModel):
    features: List[float]

    class Config:
        schema_extra = {
            "example": {
                "features": [0.5, -1.2, 0.8, 0.3, -0.5, 1.1, 0.2, -0.7, 0.9, 0.1]
            }
        }


# Define output schema
class PredictionOutput(BaseModel):
    prediction: int
    probability: float
    risk_level: str


@app.get("/")
def home():
    return {"message": "Churn Prediction API", "status": "healthy"}


@app.post("/predict", response_model=PredictionOutput)
def predict(input_data: PredictionInput):
    try:
        # Validate input
        if len(input_data.features) != 10:
            raise HTTPException(status_code=400, detail="Expected 10 features")

        # Prepare data
        X = np.array(input_data.features).reshape(1, -1)

        # Make prediction
        prediction = int(model.predict(X)[0])
        probability = float(model.predict_proba(X)[0][1])

        # Determine risk level
        if probability > 0.7:
            risk_level = "HIGH"
        elif probability > 0.4:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"

        return PredictionOutput(
            prediction=prediction, probability=probability, risk_level=risk_level
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
def health_check():
    return {"status": "healthy", "model_loaded": model is not None}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

# Run: python app.py
# Test: curl -X POST http://localhost:8000/predict -H "Content-Type: application/json" -d '{"features": [0.5, -1.2, 0.8, 0.3, -0.5, 1.1, 0.2, -0.7, 0.9, 0.1]}'
```

### Monitoring and Data Drift Detection

```python
import numpy as np
from scipy import stats
import pandas as pd
import matplotlib.pyplot as plt


class ModelMonitor:
    """Monitor model performance and detect data drift."""

    def __init__(self, reference_data):
        """Store reference data from training."""
        self.reference_data = reference_data
        self.reference_mean = reference_data.mean(axis=0)
        self.reference_std = reference_data.std(axis=0)

    def detect_drift(self, new_data, threshold=0.05):
        """Detect distribution drift using Kolmogorov-Smirnov test."""
        drifted_features = []

        for i in range(new_data.shape[1]):
            # KS test: are distributions significantly different?
            statistic, p_value = stats.ks_2samp(
                self.reference_data[:, i], new_data[:, i]
            )

            if p_value < threshold:
                drifted_features.append(
                    {"feature_idx": i, "p_value": p_value, "statistic": statistic}
                )

        return drifted_features

    def compare_distributions(self, new_data, feature_idx=0):
        """Visualize distribution drift."""
        plt.figure(figsize=(10, 5))

        plt.hist(
            self.reference_data[:, feature_idx],
            bins=30,
            alpha=0.5,
            label="Training Data",
            density=True,
        )
        plt.hist(
            new_data[:, feature_idx],
            bins=30,
            alpha=0.5,
            label="Production Data",
            density=True,
        )

        plt.axvline(
            self.reference_mean[feature_idx],
            color="blue",
            linestyle="--",
            label="Training Mean",
        )
        plt.axvline(
            new_data[:, feature_idx].mean(),
            color="orange",
            linestyle="--",
            label="Production Mean",
        )

        plt.xlabel(f"Feature {feature_idx}")
        plt.ylabel("Density")
        plt.title("Data Distribution: Training vs Production")
        plt.legend()
        plt.grid(True, alpha=0.3)
        plt.show()


# Example usage
np.random.seed(42)

# Training data
X_train = np.random.randn(1000, 5)

# Production data (simulated drift in feature 0)
X_production_week1 = np.random.randn(200, 5)  # No drift
X_production_week4 = np.random.randn(200, 5)
X_production_week4[:, 0] += 2.0  # Significant drift!

# Initialize monitor
monitor = ModelMonitor(X_train)

# Check for drift
print("=== Week 1 (Normal) ===")
drift_week1 = monitor.detect_drift(X_production_week1)
print(f"Drifted features: {len(drift_week1)}")

print("\n=== Week 4 (Drift Detected) ===")
drift_week4 = monitor.detect_drift(X_production_week4)
print(f"Drifted features: {len(drift_week4)}")
for drift in drift_week4:
    print(f"  Feature {drift['feature_idx']}: p-value = {drift['p_value']:.6f}")

# Visualize
monitor.compare_distributions(X_production_week4, feature_idx=0)
```

### CI/CD Pipeline for ML

```yaml
# .github/workflows/ml-pipeline.yml
name: ML Training and Deployment Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  data-validation:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.9'
      
      - name: Install dependencies
        run: |
          pip install -r requirements.txt
      
      - name: Validate data schema
        run: python scripts/validate_data.py
      
      - name: Check data quality
        run: python scripts/data_quality_checks.py

  train-model:
    needs: data-validation
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Train model
        run: python train.py
      
      - name: Evaluate model
        run: python evaluate.py
      
      - name: Check performance threshold
        run: |
          python -c "
          import json
          with open('metrics.json') as f:
              metrics = json.load(f)
          assert metrics['accuracy'] > 0.85, 'Model accuracy below threshold'
          "
      
      - name: Upload model artifact
        uses: actions/upload-artifact@v3
        with:
          name: trained-model
          path: model.pkl

  deploy-staging:
    needs: train-model
    runs-on: ubuntu-latest
    steps:
      - name: Download model
        uses: actions/download-artifact@v3
        with:
          name: trained-model
      
      - name: Deploy to staging
        run: |
          # Deploy to staging environment
          echo "Deploying to staging..."
          # curl -X POST https://staging-api.company.com/deploy ...

  integration-tests:
    needs: deploy-staging
    runs-on: ubuntu-latest
    steps:
      - name: Run API tests
        run: |
          pytest tests/integration/
      
      - name: Load testing
        run: |
          python tests/load_test.py

  deploy-production:
    needs: integration-tests
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to production
        run: |
          echo "Deploying to production..."
          # Blue-green deployment or canary release
```

---

## Senior-Level Insights

### MLOps Maturity Levels

| Level                           | Characteristics                        | Tools                             | Deployment Time  |
| ------------------------------- | -------------------------------------- | --------------------------------- | ---------------- |
| **Level 0: Manual**             | Jupyter notebooks, manual deployment   | Notebook, email                   | Weeks to months  |
| **Level 1: Automated Training** | Experiment tracking, versioning        | MLflow, Weights & Biases          | Days to weeks    |
| **Level 2: Automated Pipeline** | CI/CD, automated retraining            | Airflow, Kubeflow, GitHub Actions | Hours to days    |
| **Level 3: Full MLOps**         | Monitoring, auto-rollback, A/B testing | Complete MLOps platform           | Minutes to hours |

### Cloud Platform Comparison

| Feature                 | AWS SageMaker     | Azure ML             | GCP Vertex AI     |
| ----------------------- | ----------------- | -------------------- | ----------------- |
| **Experiment Tracking** | Built-in          | Built-in             | Built-in          |
| **AutoML**              | Autopilot         | AutoML               | AutoML Tables     |
| **Model Registry**      | Yes               | Yes                  | Yes               |
| **Endpoint Deployment** | Real-time + batch | Real-time + batch    | Real-time + batch |
| **Monitoring**          | Model Monitor     | Data Drift           | Model Monitoring  |
| **Pricing**             | Pay-per-use       | Pay-per-use          | Pay-per-use       |
| **Best For**            | AWS ecosystem     | .NET/Microsoft stack | TensorFlow users  |

### When to Retrain Models

```python
# Retrain triggers
retrain_if = {
    "scheduled": "Weekly/monthly regardless of performance",
    "performance_drop": "Accuracy drops below threshold (e.g., <85%)",
    "data_drift": "Input distribution changes significantly",
    "concept_drift": "Relationship between X and y changes",
    "new_data": "Sufficient new labeled data available",
}

# Don't retrain blindly—validate improvement first!
```

---

## Hands-on Lab

### Exercise 1: Complete MLflow Experiment Tracking

```python
import mlflow
import mlflow.sklearn
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.datasets import make_classification
from sklearn.metrics import accuracy_score, roc_auc_score
import numpy as np

# Generate data
X, y = make_classification(n_samples=2000, n_features=15, n_informative=10, random_state=42)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Set experiment
mlflow.set_experiment("model_comparison")

# Define models to compare
models = {
    "Logistic Regression": LogisticRegression(max_iter=1000),
    "Random Forest": RandomForest Classifier(n_estimators=100, random_state=42),
    "Gradient Boosting": GradientBoostingClassifier(n_estimators=100, random_state=42)
}

best_model = None
best_auc = 0

for model_name, model in models.items():
    with mlflow.start_run(run_name=model_name):
        # Log model type
        mlflow.log_param("model_type", model_name)
        
        # Cross-validation
        cv_scores = cross_val_score(model, X_train, y_train, cv=5, scoring='roc_auc')
        mlflow.log_metric("cv_auc_mean", cv_scores.mean())
        mlflow.log_metric("cv_auc_std", cv_scores.std())
        
        # Train on full training set
        model.fit(X_train, y_train)
        
        # Test set evaluation
        y_pred = model.predict(X_test)
        y_proba = model.predict_proba(X_test)[:, 1]
        
        accuracy = accuracy_score(y_test, y_pred)
        auc = roc_auc_score(y_test, y_proba)
        
        mlflow.log_metrics({
            "test_accuracy": accuracy,
            "test_auc": auc
        })
        
        # Log model
        mlflow.sklearn.log_model(model, "model")
        
        print(f"{model_name}: AUC = {auc:.3f}")
        
        if auc > best_auc:
            best_auc = auc
            best_model = model_name

print(f"\n🏆 Best Model: {best_model} (AUC: {best_auc:.3f})")
print("\nView results: mlflow ui")
```

---

### Exercise 2: Dockerize ML API

Create a containerized deployment.

```dockerfile
# Dockerfile
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Copy requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY app.py .
COPY churn_model.pkl .

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl --fail http://localhost:8000/health || exit 1

# Run application
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  ml-api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - MODEL_PATH=/app/churn_model.pkl
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped

  mlflow:
    image: ghcr.io/mlflow/mlflow:latest
    ports:
      - "5000:5000"
    volumes:
      - mlflow-data:/mlflow
    command: mlflow server --host 0.0.0.0 --backend-store-uri sqlite:///mlflow/mlflow.db --default-artifact-root /mlflow/artifacts

volumes:
  mlflow-data:
```

```bash
# Build and run
docker-compose up --build

# Test API
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"features": [0.5, -1.2, 0.8, 0.3, -0.5, 1.1, 0.2, -0.7, 0.9, 0.1]}'
```

---

### Exercise 3: Implement Model Monitoring Dashboard

```python
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from datetime import datetime, timedelta


class ProductionMonitor:
    """Track model performance over time."""

    def __init__(self):
        self.predictions_log = []
        self.performance_log = []

    def log_prediction(self, timestamp, features, prediction, ground_truth=None):
        """Log each prediction."""
        self.predictions_log.append(
            {
                "timestamp": timestamp,
                "prediction": prediction,
                "ground_truth": ground_truth,
                "feature_mean": np.mean(features),
            }
        )

    def calculate_daily_metrics(self):
        """Aggregate daily performance."""
        df = pd.DataFrame(self.predictions_log)
        df["date"] = pd.to_datetime(df["timestamp"]).dt.date

        # Calculate accuracy where ground truth is available
        daily_stats = (
            df.groupby("date")
            .agg(
                {
                    "prediction": "count",  # Volume
                    "ground_truth": lambda x: (
                        df[df["ground_truth"].notna()]["prediction"]
                        == df[df["ground_truth"].notna()]["ground_truth"]
                    ).mean(),
                }
            )
            .rename(columns={"prediction": "volume", "ground_truth": "accuracy"})
        )

        return daily_stats

    def plot_dashboard(self):
        """Visualize monitoring metrics."""
        daily_stats = self.calculate_daily_metrics()

        fig, axes = plt.subplots(2, 2, figsize=(14, 10))

        # Prediction volume
        axes[0, 0].plot(daily_stats.index, daily_stats["volume"], marker="o")
        axes[0, 0].set_title("Daily Prediction Volume")
        axes[0, 0].set_xlabel("Date")
        axes[0, 0].set_ylabel("Predictions")
        axes[0, 0].grid(True, alpha=0.3)

        # Accuracy over time
        axes[0, 1].plot(
            daily_stats.index, daily_stats["accuracy"], marker="o", color="green"
        )
        axes[0, 1].axhline(y=0.85, color="r", linestyle="--", label="Threshold")
        axes[0, 1].set_title("Model Accuracy Over Time")
        axes[0, 1].set_ylabel("Accuracy")
        axes[0, 1].legend()
        axes[0, 1].grid(True, alpha=0.3)

        # Prediction distribution
        df = pd.DataFrame(self.predictions_log)
        axes[1, 0].hist(df["prediction"], bins=20, edgecolor="black")
        axes[1, 0].set_title("Prediction Distribution")
        axes[1, 0].set_xlabel("Predicted Class")
        axes[1, 0].set_ylabel("Frequency")

        # Feature drift
        axes[1, 1].plot(df["timestamp"], df["feature_mean"], alpha=0.5)
        axes[1, 1].set_title("Feature Drift (Mean)")
        axes[1, 1].set_xlabel("Time")
        axes[1, 1].set_ylabel("Feature Mean")
        axes[1, 1].grid(True, alpha=0.3)

        plt.tight_layout()
        plt.show()


# Simulate production usage
monitor = ProductionMonitor()

# Simulate 30 days of predictions
start_date = datetime(2024, 1, 1)
for day in range(30):
    for _ in range(np.random.randint(50, 150)):  # Variable daily volume
        timestamp = start_date + timedelta(days=day, hours=np.random.randint(0, 24))
        features = np.random.randn(10)
        prediction = np.random.choice([0, 1], p=[0.7, 0.3])

        # Simulate ground truth availability (50% of cases)
        if np.random.random() < 0.5:
            ground_truth = prediction if np.random.random() < 0.90 else 1 - prediction
        else:
            ground_truth = None

        monitor.log_prediction(timestamp, features, prediction, ground_truth)

# Display dashboard
monitor.plot_dashboard()
```

---

## Mastery Check

### Question 1: Experiment Tracking Value

Your team runs 100+ experiments per month. Why is MLflow better than spreadsheets for tracking?

<details>
<summary>Click for Answer</summary>

**Answer:** MLflow automates logging, ensures reproducibility, and enables collaboration—spreadsheets don't scale.

**Why spreadsheets fail:**

1. **Manual entry** → errors and missing data
2. **No artifact storage** → can't retrieve models or plots
3. **No code versioning** → can't reproduce results
4. **Collaboration nightmare** → merge conflicts, version hell
5. **No search/filter** → finding best model takes hours

**MLflow advantages:**

```python
# Automatic logging
with mlflow.start_run():
    mlflow.log_params(params)  # Auto-logs all hyperparameters
    mlflow.log_metrics(metrics)  # Auto-logs all metrics
    mlflow.sklearn.log_model(model)  # Saves entire model

# Easy comparison
runs = mlflow.search_runs(experiment_ids=["1"])
best_run = runs.sort_values("metrics.accuracy", ascending=False).iloc[0]
```

**Reproducibility:** Any team member can load exact model from 6 months ago:

```python
model = mlflow.sklearn.load_model(f"runs:/{run_id}/model")
```

</details>

---

### Question 2: API Deployment Challenge

Your FastAPI model endpoint takes 500ms to respond. Users expect <100ms. What's the bottleneck and how do you fix it?

<details>
<summary>Click for Answer</summary>

**Answer:** Likely causes are model loading on each request or inefficient preprocessing. Solutions include model caching, batch prediction, or model optimization.

**Diagnosis steps:**

```python
import time


@app.post("/predict")
def predict(input_data: PredictionInput):
    start = time.time()

    # Time each step
    t1 = time.time()
    model = joblib.load("model.pkl")  # ⚠️  Loading on each request!
    print(f"Load time: {time.time() - t1:.3f}s")

    t2 = time.time()
    X = preprocess(input_data)  # Maybe slow preprocessing?
    print(f"Preprocess time: {time.time() - t2:.3f}s")

    t3 = time.time()
    prediction = model.predict(X)
    print(f"Predict time: {time.time() - t3:.3f}s")
```

**Solutions:**

1. **Load model once at startup** (not per request):

   ```python
   # Global variable, loaded once
   model = joblib.load('model.pkl')
   
   @app.post("/predict")
   def predict(input_data: PredictionInput):
       prediction = model.predict(X)  # Fast!
   ```

2. **Use lighter model**:
   - Switch from XGBoost to Logistic Regression (10x faster)
   - Quantize deep learning models

3. **Batch predictions** (if real-time not required):

   ```python
   # Collect requests for 100ms, predict batch
   ```

4. **Optimize preprocessing**:
   - Vectorize operations with NumPy
   - Pre-compute transforms

5. **Horizontal scaling**:
   - Deploy multiple instances behind load balancer
   - Use Kubernetes autoscaling

**Target latencies:**

- User-facing: <100ms
- Internal batch: <1s
- Offline scoring: minutes/hours OK

</details>

---

### Question 3: Data Drift Detection

Your churn model's accuracy dropped from 90% to 75% over 3 months. Drift detection shows feature 0 has p-value = 0.001. What does this mean and what do you do?

<details>
<parameter name="CodeContent">
**Answer:** p-value < 0.05 indicates significant drift—feature 0's distribution changed substantially since training. This likely caused the performance drop. You should retrain the model with recent data.

**What p-value = 0.001 means:**

- Kolmogorov-Smirnov test null hypothesis: "distributions are the same"
- p = 0.001 < 0.05 → reject null → distributions are **significantly different**
- Probability this difference is random: 0.1%

**Diagnosis:**

```python
# Visualize the drift
monitor.compare_distributions(X_production, feature_idx=0)
# Likely shows: training data centered at 0, production at 2
```

**Root causes:**

1. **Seasonal change**: Customer behavior shifts (e.g., holiday spending)
2. **Business change**: New product launched, customer base changed
3. **Data pipeline bug**: Incorrect feature engineering in production
4. **Concept drift**: Meaning of churn changed (e.g., pandemic effect)

**Action plan:**

1. **Immediate**: Roll back to previous model? Or accept lower accuracy temporarily?
2. **Investigate**: Is drift expected (seasonal) or a bug?
3. **Retrain**: Use last 6 months of data to capture new patterns
4. **Monitor**: Set up alerts for future drift (p < 0.05)
5. **Automate**: Schedule monthly retraining

**Prevent future issues:**

- **Continuous monitoring**: Check drift weekly
- **A/B testing**: Deploy new model to 10% traffic first
- **Gradual rollout**: Champion-challenger pattern

</details>

---

### Question 4: CI/CD for ML

How is CI/CD for ML different from traditional software CI/CD?

<details>
<parameter name="CodeContent">
**Answer:** ML CI/CD adds data validation, model evaluation, and performance regression tests—traditional CI/CD only tests code, not data or model quality.

**Traditional CI/CD:**

```
Code → Build → Unit Tests → Deploy
```

**ML CI/CD:**

```
Code + Data → Build → Unit Tests → Data Tests → Train → Model Tests → Deploy → Monitor
```

**Key differences:**

| Aspect         | Software CI/CD      | ML CI/CD                         |
| -------------- | ------------------- | -------------------------------- |
| **Inputs**     | Code                | Code + Data                      |
| **Tests**      | Logic correctness   | Logic + model performance        |
| **Deployment** | New code version    | New code + new model             |
| **Rollback**   | Previous code       | Previous model (different data!) |
| **Monitoring** | Error rates, uptime | Accuracy, drift, latency         |

**ML-specific pipeline stages:**

1. **Data Validation**:

   ```python
   # Check schema
   assert df.columns.tolist() == expected_columns
   # Check distributions
   assert 0.4 < df['churn'].mean() < 0.6  # Class balance
   ```

2. **Model Evaluation**:

   ```python
   # Performance threshold
   assert accuracy > 0.85, "Model below prod accuracy!"
   # Fairness tests
   assert demographic_parity < 0.1
   ```

3. **Canary Deployment**:

   ```python
   # Deploy to 10% traffic
   # Monitor for 24 hours
   # If metrics OK → full rollout
   ```

4. **Continuous Monitoring**:

   ```python
   # Alert if accuracy drops
   if daily_accuracy < 0.80:
       trigger_retrain()
   ```

</details>

---

### Question 5: MLOps Architecture

Design an end-to-end MLOps system for a fraud detection model that processes 1M transactions/day. What components do you need?

<details>
<parameter name="CodeContent">
**Answer:** A production MLOps system requires data pipelines, training infrastructure, model registry, serving layer, monitoring, and orchestration.

**Architecture:**

```
┌─────────────────────────────────────────────────────────┐
│                    DATA LAYER                            │
├─────────────────────────────────────────────────────────┤
│ Transaction DB → Kafka → Data Lake (S3) → Feature Store│
│ (Real-time events)   (Streaming)  (Historical)  (Redis) │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                  TRAINING PIPELINE                       │
├─────────────────────────────────────────────────────────┤
│ Airflow DAG (Daily):                                    │
│   1. Extract features from data lake                    │
│   2. Train model (Kubernetes job)                       │
│   3. Evaluate (test accuracy, fairness)                 │
│   4. Register in MLflow if accuracy > threshold         │
│   5. Notify team (Slack)                               │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   MODEL REGISTRY                         │
├─────────────────────────────────────────────────────────┤
│ MLflow Model Registry:                                  │
│   • Staging: Latest trained model                       │
│   • Production: Champion model (90% traffic)            │
│   • Challenger: New model (10% A/B test)                │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   SERVING LAYER                          │
├─────────────────────────────────────────────────────────┤
│ Kubernetes Deployment:                                  │
│   • Load Balancer                                       │
│   • 10 FastAPI replicas (autoscale 5-50)                │
│   • Model cache (Redis)                                 │
│   • Response time: <50ms for 1M requests/day            │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   MONITORING LAYER                       │
├─────────────────────────────────────────────────────────┤
│ Prometheus + Grafana:                                   │
│   • Latency (p50, p95, p99)                             │
│   • Prediction distribution                             │
│   • Data drift (Evidently AI)                           │
│   • Model accuracy (when ground truth available)        │
│   • Alert if accuracy < 85% for 2 hours → Retrain       │
└─────────────────────────────────────────────────────────┘
```

**Component details:**

1. **Feature Store** (Feast, Tecton):
   - Serve low-latency features (<10ms)
   - Ensure train-serve consistency

2. **Training** (Airflow + Kubernetes):
   - Daily retraining job (2 AM, low traffic)
   - Distributed training for large datasets

3. **A/B Testing**:
   - 90% traffic → champion model
   - 10% traffic → challenger model
   - Compare fraud detection rate, false positives

4. **Rollback Strategy**:
   - Keep last 3 production models
   - One-click rollback if metrics degrade

5. **Cost optimization**:
   - Spot instances for training ($50/day → $15/day)
   - Serverless for low-traffic endpoints

**Estimated costs** (AWS):

- Training: $500/month (daily retraining)
- Serving: $2000/month (1M predictions/day)
- Storage: $200/month (data lake)
- Monitoring: $100/month
**Total: ~$2800/month**

</details>

---

## Senior-Level Insights: Advanced MLOps Practices

### A/B Testing Framework for Models

The brief A/B mention in the fraud detection case study deserves a proper framework. A/B testing models is fundamentally different from A/B testing UI changes:

```python
import numpy as np
from scipy import stats

class ModelABTest:
    """
    Tracks online A/B test comparing champion vs challenger model.
    Traffic split is controlled at the API gateway (e.g., via feature flags).
    """
    def __init__(self, champion_name: str, challenger_name: str, split: float = 0.1):
        self.champion = champion_name
        self.challenger = challenger_name
        self.split = split  # Fraction of traffic to challenger
        self.results = {champion_name: [], challenger_name: []}

    def assign_group(self, user_id: int) -> str:
        """Deterministic assignment so same user always gets same model."""
        return self.challenger if (hash(user_id) % 100) < (self.split * 100) else self.champion

    def log_outcome(self, model_name: str, prediction: float, actual: float):
        """Log a prediction outcome for later statistical testing."""
        self.results[model_name].append({"prediction": prediction, "actual": actual})

    def compute_significance(self, metric_fn) -> dict:
        """Run two-sample t-test on accumulated metric values."""
        champion_scores = [metric_fn(r) for r in self.results[self.champion]]
        challenger_scores = [metric_fn(r) for r in self.results[self.challenger]]

        t_stat, p_value = stats.ttest_ind(champion_scores, challenger_scores)
        champion_mean = np.mean(champion_scores)
        challenger_mean = np.mean(challenger_scores)

        return {
            "champion_mean": round(champion_mean, 4),
            "challenger_mean": round(challenger_mean, 4),
            "lift": round((challenger_mean - champion_mean) / champion_mean * 100, 2),
            "p_value": round(p_value, 4),
            "significant": p_value < 0.05,
            "sample_size": (len(champion_scores), len(challenger_scores)),
        }

# Usage:
# ab_test = ModelABTest("rf_v1", "xgb_v2", split=0.05)
# At request time: model_name = ab_test.assign_group(user_id)
# After outcome: ab_test.log_outcome(model_name, prediction, actual)
# After N=500 observations per group: ab_test.compute_significance(lambda r: r["actual"])
```

**A/B Test decision rules:**
- Run for minimum 2 weeks to capture weekly seasonality
- Require p < 0.05 AND practical significance (lift > 2%) before promoting challenger
- Check for novelty effects: performance sometimes inflates in week 1 due to user curiosity
- Use sequential testing (e.g., mSPRT) when you need to check daily without inflating Type I error

### Feature Store: The Missing Infrastructure

Feature stores solve the train-serve skew problem: the same feature must be computed identically during training and serving.

| Component | Without Feature Store | With Feature Store |
|-----------|----------------------|-------------------|
| Feature computation | Duplicated in notebook + API | Defined once, served everywhere |
| Training data | Manually joined from raw tables | Point-in-time correct historical features |
| Serving latency | Custom ETL per model | Shared low-latency feature cache |
| Feature reuse | Team A rebuilds what Team B built | Shared feature catalog |

**Key concept**: Point-in-time correctness — when creating training data, features must use the values that were available *at the time of prediction*, not future data.

```python
# WRONG: leaks future information into training
# feature_df.merge(outcome_df, on='user_id')  # Uses features computed AFTER outcome

# CORRECT: point-in-time join
# Each training row uses the feature values as of the prediction timestamp
# Feast, Tecton, and Hopsworks handle this automatically
```

---

## Glossary

- **Experiment tracking**: The systematic logging of hyperparameters, metrics, artifacts, and code versions for each model training run, enabling reproducibility and comparison across experiments (e.g., using MLflow).
- **Model versioning**: The practice of assigning unique version identifiers to trained models and storing them in a registry so teams can audit, compare, reproduce, and roll back any version.
- **Data drift**: A change in the statistical distribution of input features in production compared to training data, which can degrade model performance over time without any change to the model itself.
- **Concept drift**: A change in the underlying relationship between input features and the target variable (e.g., the meaning of "high risk" shifting after a recession), requiring model retraining even if input distributions appear stable.
- **CI/CD (Continuous Integration/Continuous Delivery)**: An automated pipeline that tests, validates, and deploys code and model changes; in MLOps it extends traditional software CI/CD to include data validation, model training, and performance gating.
- **Model registry**: A centralized repository that stores trained model artifacts along with their metadata, staging status (e.g., Staging, Production, Archived), and lineage information.
- **Canary deployment**: A release strategy where a new model version is exposed to a small percentage of real traffic (e.g., 5–10%) before a full rollout, allowing safe comparison with the incumbent model.
- **Shadow mode**: A deployment pattern where a new model receives the same real-time requests as the production model but its predictions are logged rather than served, enabling risk-free evaluation on live traffic.

---

## Cross-References

- **Day 40** — Baseline model concepts: the simple benchmark models that MLOps practices help version, track, and eventually replace with improved versions.
- **Day 45** — Feature engineering pipelines: the upstream data transformation steps that must be versioned and deployed alongside models in an MLOps system.
- **Day 52** — Ensemble methods: multi-model architectures whose components each require separate versioning, registry entries, and deployment management.
- **Day 53** — Hyperparameter tuning: the experiment-intensive process whose results are tracked and compared using MLflow, the primary tool introduced in this lesson.

---

## Summary

Today you learned:

- ✅ Experiment tracking with MLflow ensures reproducibility and comparison
- ✅ Model versioning and registry manage production models
- ✅ FastAPI + Docker enables scalable model deployment
- ✅ Monitoring detects data drift and performance degradation
- ✅ CI/CD for ML automates training, testing, and deployment
- ✅ Production MLOps requires orchestration, monitoring, and feedback loops

**Tomorrow**: Regularization techniques—preventing overfitting in complex models.

---

## Optional Build Tracks (Day 49-60 Extension)

Keep the **core lab tasks** in this lesson common for all learners, then add one optional extension artifact per track:

| Track | Day 50 assignment artifact |
| --- | --- |
| **NLP** | NLP model delivery pipeline baseline (manual batch scoring) vs advanced CI/CD + monitoring deployment. |
| **Forecasting** | Forecast retraining ops baseline (weekly notebook rerun) vs advanced scheduled feature/model pipeline with drift alerts. |
| **Recommenders/Graph** | Recommendation serving ops baseline (offline top-N export) vs advanced online feature store + canary rollout. |

### Track requirements (apply to all three tracks)

1. **Baseline + advanced model comparison (required):** report offline metrics, error slices, and deployment trade-offs.
2. **Constraint scenario test (required):** run at least one scenario each day from: **limited data**, **latency limit**, **explainability requirement**.
3. **Refactoring checkpoint #1 (Day 53):** modularize data prep, training, evaluation, and inference into reusable pipeline components.
4. **Refactoring checkpoint #2 (Day 58):** externalize hyperparameters/model settings into versioned config files.
5. **Final deliverable (Day 60):** submit a concise **performance + business-impact memo** tying model lift to ROI, risk, and rollout recommendation.
