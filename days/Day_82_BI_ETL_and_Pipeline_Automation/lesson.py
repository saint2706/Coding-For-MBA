# %%
"""Day 82 – BI ETL and Pipeline Automation classroom script."""

# %%
from __future__ import annotations

from Day_82_BI_ETL_and_Pipeline_Automation.solutions import (
    build_airflow_dag_stub,
    build_dbt_project_stub,
    build_pipeline_outline,
    load_topics,
)

# %%
TOPIC_GROUPS = load_topics()
PIPELINE_OUTLINE = build_pipeline_outline()
AIRFLOW_DAG = build_airflow_dag_stub()
DBT_PROJECT = build_dbt_project_stub()


# %%
def summarize_topics() -> None:
    """Print the roadmap groupings that frame the ETL automation lesson."""

    print("\nDay 82 roadmap groupings\n")
    for section, topics in TOPIC_GROUPS.items():
        titles = ", ".join(topic.title for topic in topics)
        print(f"- {section}: {titles}")


# %%
def outline_pipeline() -> None:
    """Print the canonical pipeline steps and ownership model."""

    print("\nPipeline outline\n")
    for task in PIPELINE_OUTLINE:
        upstream = ", ".join(task.upstream) if task.upstream else "start"
        print(f"{task.task_id} -> depends on [{upstream}] ({task.owner})")
        print(f"  {task.description}")


# %%
def review_airflow_stub() -> None:
    """Explain how the pipeline outline maps into an Airflow DAG."""

    print("\nAirflow DAG stub\n")
    print(f"DAG id: {AIRFLOW_DAG['dag_id']} | schedule: {AIRFLOW_DAG['schedule']}")
    for task_id, config in AIRFLOW_DAG["tasks"].items():
        upstream = ", ".join(config["upstream"]) if config["upstream"] else "start"
        print(
            f"- {task_id}: upstream [{upstream}], owner={config['owner']}, retries={config['retries']}"
        )


# %%
def review_dbt_stub() -> None:
    """Highlight the downstream dbt manifest that consumes the Airflow outputs."""

    print("\ndbt project stub\n")
    print("Sources:")
    for source, config in DBT_PROJECT["sources"].items():
        print(f"- {source} <- {config['loaded_by']}")

    print("\nStaging models:")
    for model, config in DBT_PROJECT["staging"].items():
        deps = ", ".join(config["depends_on"])
        print(f"- {model} ({config['materialized']}) depends on [{deps}]")

    print("\nMart models:")
    for model, config in DBT_PROJECT["marts"].items():
        deps = ", ".join(config["depends_on"])
        print(f"- {model} ({config['materialized']}) depends on [{deps}]")

    print("\nExposures:")
    for exposure, config in DBT_PROJECT["exposures"].items():
        deps = ", ".join(config["depends_on"])
        print(
            f"- {exposure} ({config['type']}) depends on [{deps}] -> owner {config['owner']}"
        )

    print(f"\nPipeline completion task: {DBT_PROJECT['final_task']}")


# %%
def main() -> None:
    """Run the Day 82 classroom walkthrough."""

    summarize_topics()
    outline_pipeline()
    review_airflow_stub()
    review_dbt_stub()


# %%
if __name__ == "__main__":
    main()
