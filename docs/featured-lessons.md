# Featured Lessons

This page highlights key lessons that demonstrate advanced concepts and production-ready patterns.

## MLOps and Production Workflows

### Day 50 – MLOps

**File:** `Day_50_MLOps/solutions.py`

Exposes reusable helpers for training, saving, loading, and predicting with a Logistic Regression
Iris classifier.

**Quick start:**

```bash
python Day_50_MLOps/solutions.py
```

**Programmatic usage:**

```python
from Day_50_MLOps.solutions import (
    load_model,
    predict_sample,
    save_model,
    train_iris_model,
)

model, accuracy, X_test, y_test, target_names = train_iris_model()
model_path = save_model(model, "iris_model.joblib")
reloaded = load_model(model_path)
prediction, label = predict_sample(reloaded, X_test[0], target_names)
```

### Day 65 – MLOps Pipelines and CI/CD

**File:** `Day_65_MLOps_Pipelines_and_CI/solutions.py`

Implements CI/CD automation patterns for ML systems.

### Day 66 – Model Deployment and Serving

**File:** `Day_66_Model_Deployment_and_Serving/solutions.py`

Demonstrates REST and gRPC serving patterns for production model deployment.

### Day 67 – Model Monitoring and Reliability

**File:** `Day_67_Model_Monitoring_and_Reliability/solutions.py`

Covers monitoring, drift detection, and reliability engineering for ML systems.

## Deep Learning and Modern NLP

### Day 58 – Transformers and Attention

**File:** `Day_58_Transformers_and_Attention/solutions.py`

Builds encoder–decoder stacks, deterministic transformer text classifiers, Hugging Face fine-tuning
playbooks, and attention visualisations for rapid experimentation.

### Day 59 – Generative Models

**File:** `Day_59_Generative_Models/solutions.py`

Contrasts autoencoders, VAEs, GAN dynamics, and diffusion denoisers with synthetic training loops
that log reconstruction improvements.

### Day 64 – Modern NLP Pipelines

**File:** `Day_64_Modern_NLP_Pipelines/solutions.py`

Implements end-to-end NLP pipelines with state-of-the-art techniques.

## Advanced ML Techniques

### Day 60 – Graph and Geometric Learning

**File:** `Day_60_Graph_and_Geometric_Learning/solutions.py`

Implements GraphSAGE and graph attention message passing for toy node-classification graphs with
interpretable attention matrices.

### Day 61 – Reinforcement and Offline Learning

**File:** `Day_61_Reinforcement_and_Offline_Learning/solutions.py`

Simulates policy-gradient bandits, tabular value iteration, contextual bandits, and offline
evaluation with deterministic reward thresholds for regression testing.

### Day 62 – Model Interpretability and Fairness

**File:** `Day_62_Model_Interpretability_and_Fairness/solutions.py`

Covers SHAP, LIME, counterfactual explanations, and fairness metrics.

### Day 63 – Causal Inference and Uplift

**File:** `Day_63_Causal_Inference_and_Uplift/solutions.py`

Demonstrates causal inference techniques and uplift modeling for business decisions.

## Supervised and Unsupervised Learning

### Day 51 – Regularised Models

**File:** `Day_51_Regularized_Models/solutions.py`

Compares ridge, lasso, and elastic net pipelines while introducing Poisson regression as a
generalised linear model.

### Day 52 – Ensemble Methods

**File:** `Day_52_Ensemble_Methods/solutions.py`

Trains random forests, gradient boosting, and stacking ensembles with calibration utilities for
trustworthy probabilities.

### Day 53 – Model Tuning & Feature Selection

**File:** `Day_53_Model_Tuning_and_Feature_Selection/solutions.py`

Demonstrates grid search, Bayesian optimisation (via `skopt`), permutation importance, and recursive
feature elimination on a reproducible dataset.

### Day 54 – Probabilistic Modeling

**File:** `Day_54_Probabilistic_Modeling/solutions.py`

Provides Gaussian mixtures, expectation-maximisation, Bayesian classifiers, and hidden Markov model
log-likelihood utilities for reasoning under uncertainty.

### Day 55 – Advanced Unsupervised Learning

**File:** `Day_55_Advanced_Unsupervised_Learning/solutions.py`

Explores DBSCAN, agglomerative clustering, t-SNE embeddings, autoencoders, and anomaly detection
baselines.

## Time Series and Recommenders

### Day 56 – Time Series & Forecasting

**File:** `Day_56_Time_Series_and_Forecasting/solutions.py`

Fits ARIMA/SARIMAX, Holt-Winters, and Prophet-style models with rolling-origin evaluation helpers.

### Day 57 – Recommender Systems

**File:** `Day_57_Recommender_Systems/solutions.py`

Implements collaborative filtering, matrix factorisation, and ranking metrics for implicit-feedback
aware recommenders.

## Data Engineering and Analytics

### Day 31 – Relational Databases

**File:** `Day_31_Databases/databases.py`

Builds and queries a SQLite database, mirroring production-ready analysis workflows.

### Day 32 – Other Databases

**File:** `Day_32_Other_Databases/other_databases.py`

Demonstrates dependency-injected connection patterns for SQL and MongoDB clients so that data access
logic remains testable.

### Day 36 – Capstone Case Study

**File:** `Day_36_Case_Study/case_study.py` and `solutions.py`

Ties together the full analytics workflow with a real dataset, cleaning, analysis, and business
recommendations.
