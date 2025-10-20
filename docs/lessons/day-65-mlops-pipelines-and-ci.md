Day 50 introduced model persistence. Day 65 expands that foundation into
production-grade automation that glues together feature engineering,
training, registration, and deployment inside a repeatable delivery
pipeline.

## Learning goals

- **Feature stores** – Design entities, feature views, and point-in-time
  joins that keep online/offline data consistent across training and
  inference.
- **Model registries** – Promote trained artefacts through staging,
  production, and archival stages with metadata-rich lineage tracking.
- **Workflow orchestration** – Compare how Apache Airflow DAGs and
  Prefect flows coordinate complex ML tasks with retries, schedules, and
  parameterised runs.
- **Continuous integration and delivery** – Implement GitHub Actions
  workflows that lint, test, train, and roll out models with automated
  safety gates and human approvals when necessary.

## Hands-on practice

`solutions.py` ships a lightweight pipeline simulator that mirrors a
feature store refresh, model training job, model registry promotion, and
GitHub Actions deployment stage. The tasks are wired together with a
miniature DAG executor inspired by Airflow/PyPrefect semantics so you
can experiment with dependency resolution locally.

Run the module to see the orchestration trace:

```bash
python Day_65_MLOps_Pipelines_and_CI/solutions.py
```

The included tests (`tests/test_day_65.py`) stub raw feature inputs and
assert that the DAG executes in topological order, promoting a versioned
model artefact only after automated evaluation passes.

## Extend the exercise

- Swap the in-memory feature store with Feast or Tecton to practice
  managing online/offline materialisation.
- Replace the registry stub with MLflow’s model registry to integrate
  experiment tracking and stage transitions.
- Export the DAG to YAML/JSON and feed it into Airflow or Prefect for a
  production-ready orchestration pattern.
- Fork the GitHub Actions example into your repository to add matrix
  testing (Python versions, CPU vs GPU runners) and continuous delivery
  to Kubernetes, SageMaker, or Vertex AI.

## Additional Materials

- **solutions.ipynb**  
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_65_MLOps_Pipelines_and_CI/solutions.ipynb){ .md-button } 
  [📓 Open in NBViewer](https://nbviewer.org/github/saint2706/Coding-For-MBA/blob/main/Day_65_MLOps_Pipelines_and_CI/solutions.ipynb){ .md-button } 
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_65_MLOps_Pipelines_and_CI/solutions.ipynb){ .md-button .md-button--primary } 
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_65_MLOps_Pipelines_and_CI/solutions.ipynb){ .md-button }

???+ example "solutions.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_65_MLOps_Pipelines_and_CI/solutions.py)

    ```python title="solutions.py"
    """Utility helpers for orchestrating an end-to-end MLOps pipeline.

    The module intentionally mirrors the stages that appear in a production
    GitHub Actions workflow: refresh a feature store, train and evaluate a
    model, register the resulting artefact, and perform a deployment gate.

    Instead of depending on heavy external services, the code uses
    lightweight, deterministic stubs so unit tests can simulate an Apache
    Airflow or Prefect DAG locally. Each task receives a consolidated
    context dictionary (similar to Airflow's XCom or Prefect's task result)
    and may add new keys for downstream tasks.
    """

    from __future__ import annotations

    from dataclasses import dataclass, field
    from datetime import UTC, datetime
    from typing import (
        Any,
        Callable,
        Dict,
        Iterable,
        List,
        Mapping,
        MutableMapping,
        Optional,
    )

    FeatureRow = Mapping[str, Any]


    @dataclass
    class Task:
        """Represents a node in an orchestration graph.

        Attributes
        ----------
        name:
            Unique identifier for the task. Names are used to resolve
            dependencies and to expose results in the execution context.
        run:
            Callable that receives the merged execution context and returns a
            value that is stored under ``name`` for downstream tasks.
        upstream:
            Optional list of task names that must finish before this task
            executes. The dependency semantics align with Airflow DAGs and
            Prefect flows.
        """

        name: str
        run: Callable[[MutableMapping[str, Any]], Any]
        upstream: List[str] = field(default_factory=list)


    class PipelineDAG:
        """A minimal directed acyclic graph executor for ML pipelines."""

        def __init__(self, tasks: Iterable[Task]):
            self._tasks: Dict[str, Task] = {}
            for task in tasks:
                if task.name in self._tasks:
                    raise ValueError(f"Duplicate task name detected: {task.name}")
                self._tasks[task.name] = task
            for task in self._tasks.values():
                for dependency in task.upstream:
                    if dependency not in self._tasks:
                        raise ValueError(
                            f"Task '{task.name}' references unknown dependency '{dependency}'"
                        )

        @property
        def tasks(self) -> Dict[str, Task]:
            return self._tasks

        def topological_order(self) -> List[str]:
            """Return a deterministic topological ordering of the tasks."""

            temporary_marks: set[str] = set()
            permanent_marks: set[str] = set()
            ordered: List[str] = []

            def visit(node_name: str) -> None:
                if node_name in permanent_marks:
                    return
                if node_name in temporary_marks:
                    raise ValueError("Cycle detected in DAG definition")
                temporary_marks.add(node_name)
                node = self._tasks[node_name]
                for dependency in node.upstream:
                    visit(dependency)
                permanent_marks.add(node_name)
                temporary_marks.remove(node_name)
                ordered.append(node_name)

            for name in sorted(self._tasks):
                if name not in permanent_marks:
                    visit(name)
            return ordered

        def execute(
            self, base_context: Optional[MutableMapping[str, Any]] = None
        ) -> Dict[str, Any]:
            """Execute tasks respecting dependencies.

            Parameters
            ----------
            base_context:
                Optional dictionary containing static inputs (for example raw
                features or configuration). Tasks may mutate this dictionary,
                mimicking orchestration platforms that provide shared context
                objects.
            """

            context: MutableMapping[str, Any]
            if base_context is None:
                context = {}
            else:
                context = base_context
            ordered = self.topological_order()
            for name in ordered:
                task = self._tasks[name]
                context[name] = task.run(context)
            context["execution_order"] = ordered
            return context


    def upsert_feature_store(rows: Iterable[FeatureRow]) -> Dict[str, FeatureRow]:
        """Materialise feature rows into an in-memory feature store.

        The function keeps the most recent row for each primary key and
        stamps the ingestion time. Production feature stores (Feast, Tecton,
        Vertex AI Feature Store) provide similar semantics.
        """

        feature_store: Dict[str, FeatureRow] = {}
        for row in rows:
            entity_id = str(row.get("entity_id"))
            feature_store[entity_id] = {
                **row,
                "ingested_at": datetime.now(UTC).isoformat(timespec="seconds"),
            }
        return feature_store


    def train_model_from_store(store: Mapping[str, FeatureRow]) -> Dict[str, Any]:
        """Train and evaluate a trivial model using feature store contents."""

        feature_values = [row.get("feature_value", 0.0) for row in store.values()]
        if not feature_values:
            raise ValueError("Feature store is empty; cannot train model")
        avg_feature = sum(feature_values) / len(feature_values)
        # The "model" is encoded as a slope anchored by the mean feature value.
        model_artifact = {
            "parameters": {"slope": avg_feature / (1 + abs(avg_feature))},
            "metrics": {"validation_accuracy": 0.8 + (avg_feature % 0.2)},
        }
        return model_artifact


    def register_model(
        model: Mapping[str, Any], *, name: str, stage: str
    ) -> Dict[str, Any]:
        """Record model metadata as if interacting with an MLflow-style registry."""

        if "metrics" not in model:
            raise KeyError("Model metadata must include 'metrics'")
        version = datetime.now(UTC).strftime("%Y%m%d%H%M%S")
        registry_entry = {
            "name": name,
            "version": version,
            "stage": stage,
            "metrics": model["metrics"],
        }
        return registry_entry


    def github_actions_deploy(entry: Mapping[str, Any]) -> Dict[str, Any]:
        """Simulate a GitHub Actions job that deploys a registered model."""

        if entry.get("stage") != "Staging":
            return {
                "status": "skipped",
                "reason": "Only staging models deploy automatically",
            }
        if entry.get("metrics", {}).get("validation_accuracy", 0.0) < 0.85:
            return {
                "status": "failed",
                "reason": "Quality gate failed",
            }
        return {
            "status": "success",
            "environment": "production",
            "commit_sha": "demo-sha",
        }


    def build_mlops_pipeline(raw_rows: Iterable[FeatureRow]) -> PipelineDAG:
        """Construct the pipeline DAG with deterministic task wiring."""

        # Persist raw rows in the base context so the feature-store task can
        # consume them. The orchestrator will attach results by task name.
        base_context = {"raw_rows": list(raw_rows)}

        def feature_task(context: MutableMapping[str, Any]) -> Dict[str, FeatureRow]:
            return upsert_feature_store(context["raw_rows"])

        def training_task(context: MutableMapping[str, Any]) -> Dict[str, Any]:
            return train_model_from_store(context["feature_store"])

        def registry_task(context: MutableMapping[str, Any]) -> Dict[str, Any]:
            return register_model(
                context["model_training"], name="churn_model", stage="Staging"
            )

        def deployment_task(context: MutableMapping[str, Any]) -> Dict[str, Any]:
            return github_actions_deploy(context["model_registry"])

        tasks = [
            Task(name="feature_store", run=feature_task),
            Task(name="model_training", run=training_task, upstream=["feature_store"]),
            Task(name="model_registry", run=registry_task, upstream=["model_training"]),
            Task(name="deployment", run=deployment_task, upstream=["model_registry"]),
        ]

        dag = PipelineDAG(tasks)
        # Attach the base context so callers can re-use it between runs.
        dag.base_context = base_context  # type: ignore[attr-defined]
        return dag


    def run_pipeline(raw_rows: Iterable[FeatureRow]) -> Dict[str, Any]:
        """Helper for scripts/tests: build the DAG and execute it."""

        dag = build_mlops_pipeline(raw_rows)
        context = getattr(dag, "base_context", {})
        return dag.execute(context)


    if __name__ == "__main__":
        rows = [
            {"entity_id": 1, "feature_value": 0.42},
            {"entity_id": 2, "feature_value": 0.58},
        ]
        results = run_pipeline(rows)
        print("Execution order:", results["execution_order"])  # noqa: T201
        print("Deployment status:", results["deployment"])  # noqa: T201
    ```
