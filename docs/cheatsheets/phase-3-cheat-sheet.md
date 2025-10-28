# Phase 3 Cheat Sheet — Machine Learning Foundations (Days 40-54)

> Convert analytics assets into predictive engines. This phase covers the entire ML development
> loop, from math intuition to production-ready baselines.

## Core Outcomes

- Recall the math building blocks: linear algebra operations, calculus intuition, and optimisation
  basics.
- Execute the supervised learning workflow end-to-end (train/validation/test splits, metrics, error
  analysis).
- Compare regression vs. classification approaches and select the right algorithm for the business
  problem.
- Engineer features, evaluate model drift, and document assumptions for stakeholders.
- Understand neural network fundamentals (dense nets, CNNs, RNNs) and when deep learning adds
  leverage.
- Build NLP-ready pipelines for tokenisation, embeddings, and text classification.

## Standard ML Playbook

1. **Frame the question** – Align on business impact, success metrics, and decision cadence.
1. **Prepare the data** – Feature selection, scaling (`StandardScaler`, `MinMaxScaler`), encoding
   (`OneHotEncoder`, embeddings).
1. **Split responsibly** – Use stratified splits when class imbalance exists. Preserve temporal
   order for time-aware problems.
1. **Train baseline models** – Start with linear/logistic regression, decision trees, or gradient
   boosting as interpretable anchors.
1. **Evaluate** – Track MAE/RMSE for regression; accuracy/precision/recall/F1/ROC-AUC for
   classification.
1. **Stress-test** – Perform cross-validation, residual analysis, calibration checks, and fairness
   diagnostics.
1. **Communicate** – Pair charts (lift curves, SHAP summaries) with a narrative focused on risk/ROI.

## Metric Cliff Notes

| Scenario | Metric(s) | Notes | |----------|-----------|-------| | Forecast continuous values |
MAE, RMSE, MAPE | RMSE penalises large errors; MAPE communicates % miss. | Predict churn /
conversion | Precision, recall, F1, ROC-AUC | Align threshold with business tolerance for false
positives/negatives. | Rank leads or products | Average precision, nDCG | Evaluate ordering quality,
not just classification. | Multi-class problems | Macro vs. weighted F1 | Macro = treat classes
equally; weighted = respect class frequency.

## Deep Learning Highlights

- **Dense networks:** great for structured data once feature engineering is mature.
- **CNNs:** pattern detection for images, spatial data, or even time series via sliding windows.
- **RNNs/LSTMs/GRUs:** sequential decisioning, language modelling, demand forecasting.
- **Training tips:** normalise inputs, monitor overfitting (dropout, early stopping), profile GPU
  vs. CPU trade-offs.

## Experiment Tracking Checklist

- [ ] Log dataset version, feature set, and preprocessing pipeline.
- [ ] Record hyperparameters and random seeds for reproducibility.
- [ ] Persist models with metadata (metrics, timestamp, Git commit) using `joblib`, `mlflow`, or
  similar.
- [ ] Maintain a comparison table (spreadsheet or markdown) summarising candidate models.
- [ ] Capture qualitative findings: failure modes, surprising segments, data quality risks.

## Business Wins to Target

- Customer churn predictor that surfaces at-risk accounts with explainable drivers.
- Dynamic pricing or demand forecasting models with scenario planning dashboards.
- NLP classifier that routes support tickets or surfaces voice-of-customer themes.
- Computer vision proof-of-concept demonstrating automated quality checks.

## 30-Minute Refresh Sprint

1. **Baseline (10 min):** Load a prepared dataset, create train/test splits, and fit logistic
   regression.
1. **Feature tweak (10 min):** Add a new engineered feature, retrain, and compare lift using a
   metric table.
1. **Explain (10 min):** Generate SHAP or feature importance plots and draft a stakeholder-ready
   narrative.

______________________________________________________________________

**Next stop:** Phase 4 focuses on production realities—governance, monitoring, and scaling advanced
model families.
