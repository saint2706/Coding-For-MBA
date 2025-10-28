______________________________________________________________________

## layout: default title: Machine Learning Curriculum Roadmap nav_order: 2 permalink: /ml-curriculum/

This roadmap outlines a phased journey from classic machine learning foundations to modern deep
learning systems and production operations. Each phase highlights anchor lessons from the Coding for
MBA series and recommends follow-on topics so you can keep advancing after Day 57.

> **📐 Looking for mathematical foundations?** Check out the comprehensive
> [ML Theory & Mathematics](theory.md) guide, which covers linear algebra, calculus, probability,
> neural networks, deep learning architectures, and all the mathematical concepts underlying this
> curriculum.

## Phase 1 – Classic Machine Learning Foundations

> **Start here if you are following the Day 40–53 sequence.**
>
> The goal of Phase 1 is to master supervised learning workflows, evaluation techniques, and model
> selection before layering on deep learning.

| Day | Lesson | Key takeaway | | --- | ------ | ------------ | | Day 40 |
[Introduction to Machine Learning](lessons/day-40-intro-to-ml.md) | Frame ML problems, manage the
train/validate/test split, and measure performance with cross-validation. | | Day 41 |
[Supervised Learning – Regression](lessons/day-41-supervised-learning-regression.md) | Fit linear
models, tune regularisation, and interpret coefficients for business insights. | | Day 42 |
[Supervised Learning – Classification Part 1](lessons/day-42-supervised-learning-classification-part-1.md)
| Compare logistic regression and decision trees while diagnosing accuracy, precision, and recall. |
| Day 43 |
[Supervised Learning – Classification Part 2](lessons/day-43-supervised-learning-classification-part-2.md)
| Ensemble methods, ROC curves, and thresholding strategy selection. | | Day 44 |
[Unsupervised Learning](lessons/day-44-unsupervised-learning.md) | Cluster customer segments and
reduce dimensionality with PCA. | | Day 45 |
[Feature Engineering & Evaluation](lessons/day-45-feature-engineering-and-evaluation.md) | Build
repeatable feature pipelines and validate models with more nuanced metrics. | | Day 46 |
[Intro to Neural Networks](lessons/day-46-intro-to-neural-networks.md) | Understand perceptrons,
activation functions, and gradient descent. | | Day 47 |
[Convolutional Neural Networks](lessons/day-47-convolutional-neural-networks.md) | Apply
convolutional filters for image classification. | | Day 48 |
[Recurrent Neural Networks](lessons/day-48-recurrent-neural-networks.md) | Model sequential data
with RNNs, LSTMs, and GRUs. | | Day 49 | [Natural Language Processing](lessons/day-49-nlp.md) |
Build text classification pipelines with tokenisation and embeddings. | | Day 50 |
[MLOps](lessons/day-50-mlops.md) | Package, persist, and monitor models for reliable deployment. | |
Day 51 | [Regularised Models](lessons/day-51-regularized-models.md) | Contrast ridge, lasso, elastic
net, and Poisson GLMs while measuring coefficient shrinkage. | | Day 52 |
[Ensemble Methods](lessons/day-52-ensemble-methods.md) | Blend bagging, boosting, and stacking
ensembles with calibrated probability estimates. | | Day 53 |
[Model Tuning & Feature Selection](lessons/day-53-model-tuning-and-feature-selection.md) | Optimise
hyperparameters with grid/Bayesian search and validate feature subsets via permutation importance
and RFE. | | Day 54 | [Probabilistic Modeling](lessons/day-54-probabilistic-modeling.md) | Master
Gaussian mixtures, Bayesian classifiers, EM, and HMM log-likelihoods to reason about uncertainty. |
| Day 55 | [Advanced Unsupervised Learning](lessons/day-55-advanced-unsupervised-learning.md) |
Deploy DBSCAN, hierarchical clustering, t-SNE/UMAP-style embeddings, and autoencoder-driven anomaly
detection. | | Day 56 | [Time Series & Forecasting](lessons/day-56-time-series-and-forecasting.md) |
Forecast seasonal demand with ARIMA/SARIMAX, Holt-Winters, and Prophet-style decompositions plus
robust evaluation. | | Day 57 | [Recommender Systems](lessons/day-57-recommender-systems.md) | Build
collaborative filtering and matrix factorisation recommenders with implicit-feedback aware ranking
metrics. |

### Recommended next steps after Phase 1

- Apply cross-validation and feature engineering to your own datasets, documenting experiment
  results in a reproducible format.
- Practice hyperparameter optimisation with grid search, random search, and Bayesian optimisation
  frameworks.
- Explore AutoML tooling (e.g., Auto-sklearn, H2O AutoML) to accelerate baseline model comparisons.

## Phase 2 – Modern Deep Learning & Representation Learning

Deep learning expands the model families available in Phase 1. Focus on building intuition for
architectures, transfer learning, and optimisation.

| Day | Lesson | Key takeaway | | --- | ------ | ------------ | | Day 58 |
[Transformers and Attention](lessons/day-58-transformers-and-attention.md) | Assemble
encoder–decoder stacks, fine-tune pretrained checkpoints, and interpret attention heatmaps with
deterministic demos. | | Day 59 | [Generative Models](lessons/day-59-generative-models.md) | Compare
autoencoders, VAEs, GANs, and diffusion denoisers while monitoring reconstruction loss curves on
synthetic data. | | Day 60 |
[Graph and Geometric Learning](lessons/day-60-graph-and-geometric-learning.md) | Prototype GraphSAGE
and GAT-style message passing networks for toy node classification tasks with interpretable
attention scores. | | Day 61 |
[Reinforcement and Offline Learning](lessons/day-61-reinforcement-and-offline-learning.md) | Explore
policy/value methods, contextual bandits, and offline evaluation baselines that converge to
reproducible reward thresholds. |

- Refresh Python packages for GPU acceleration (PyTorch or TensorFlow) and practice training models
  on cloud notebooks.
- Study convolutional network variants (ResNet, EfficientNet) and fine-tune pretrained models for
  domain-specific images.
- Learn about transformer architectures for text, vision, and multimodal data, starting with
  embeddings and attention mechanisms.
- Experiment with self-supervised learning and contrastive objectives to pre-train representations
  on unlabelled data.

## Phase 3 – Responsible AI & Model Governance

Ensure that your models meet ethical, legal, and organisational standards before moving them into
production.

- Perform bias and fairness audits using disparate impact, equal opportunity, and calibration
  diagnostics.
- Implement explainability techniques (feature importance, SHAP, LIME) to communicate model
  decisions to stakeholders.
- Establish data governance practices: data lineage, versioning, and documentation (model cards,
  data sheets).
- Learn the regulatory landscape (GDPR, CCPA, sector-specific rules) and how they influence data
  collection and model deployment.

## Phase 4 – MLOps, Monitoring, and Lifecycle Management

Turn prototypes into production systems by investing in reliable infrastructure and collaboration
workflows.

| Day | Lesson | Key takeaway | | --- | ------ | ------------ | | Day 65 |
[MLOps Pipelines and CI/CD](lessons/day-65-mlops-pipelines-and-ci.md) | Orchestrate feature stores,
registries, and GitHub Actions workflows with DAG-style automation. | | Day 66 |
[Model Deployment and Serving](lessons/day-66-model-deployment-and-serving.md) | Compare REST, gRPC,
batch, streaming, and edge serving patterns with load-tested adapters. | | Day 67 |
[Model Monitoring and Reliability](lessons/day-67-model-monitoring-and-reliability.md) | Detect data
drift, evaluate canaries, and export observability metrics for retraining triggers. |

- Industrialise feature pipelines with tools like Feature Store platforms or workflow orchestrators
  (Airflow, Prefect).
- Automate training and evaluation with CI/CD pipelines, integrating unit tests, data quality
  checks, and model validation gates.
- Deploy models to scalable serving infrastructure (REST endpoints, batch scoring, or streaming)
  with containerisation and serverless platforms.
- Instrument monitoring for data drift, model drift, and performance regressions; integrate alerting
  and human-in-the-loop retraining.
- Track experiments, artefacts, and lineage with MLflow, Weights & Biases, or similar platforms,
  ensuring reproducibility across teams.

## Putting it all together

Progressing through these phases transforms the Day 40–53 lessons into a comprehensive ML competency
path. Loop back to earlier phases whenever you encounter new domains or stakeholders—revisiting the
fundamentals will keep each new system grounded in sound methodology.
