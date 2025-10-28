---
title: "Day 65 \u2013 MLOps Pipelines and CI/CD Automation"
tags:
- Advanced
- MLOps
---
# Day 65 – MLOps Pipelines and CI/CD Automation

Day 50 introduced model persistence. Day 65 expands that foundation into production-grade automation
that glues together feature engineering, training, registration, and deployment inside a repeatable
delivery pipeline.

## Learning goals

- **Feature stores** – Design entities, feature views, and point-in-time joins that keep
  online/offline data consistent across training and inference.
- **Model registries** – Promote trained artefacts through staging, production, and archival stages
  with metadata-rich lineage tracking.
- **Workflow orchestration** – Compare how Apache Airflow DAGs and Prefect flows coordinate complex
  ML tasks with retries, schedules, and parameterised runs.
- **Continuous integration and delivery** – Implement GitHub Actions workflows that lint, test,
  train, and roll out models with automated safety gates and human approvals when necessary.

## Hands-on practice

`solutions.py` ships a lightweight pipeline simulator that mirrors a feature store refresh, model
training job, model registry promotion, and GitHub Actions deployment stage. The tasks are wired
together with a miniature DAG executor inspired by Airflow/PyPrefect semantics so you can experiment
with dependency resolution locally.

Run the module to see the orchestration trace:

```bash
python Day_65_MLOps_Pipelines_and_CI/solutions.py
```

The included tests (`tests/test_day_65.py`) stub raw feature inputs and assert that the DAG executes
in topological order, promoting a versioned model artefact only after automated evaluation passes.

## Extend the exercise

- Swap the in-memory feature store with Feast or Tecton to practice managing online/offline
  materialisation.
- Replace the registry stub with MLflow’s model registry to integrate experiment tracking and stage
  transitions.
- Export the DAG to YAML/JSON and feed it into Airflow or Prefect for a production-ready
  orchestration pattern.
- Fork the GitHub Actions example into your repository to add matrix testing (Python versions, CPU
  vs GPU runners) and continuous delivery to Kubernetes, SageMaker, or Vertex AI.

<!-- LESSON_FOOTER_START -->

---

**Previous:** [Day 64 – Day 64 – Modern NLP Pipelines](../Day_64_Modern_NLP_Pipelines/README.md) • **Next:** [Day 66 – Day 66 – Model Deployment and Serving Patterns](../Day_66_Model_Deployment_and_Serving/README.md)

_You are on lesson 65 of 108._

<!-- LESSON_FOOTER_END -->