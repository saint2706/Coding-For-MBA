"""Utilities for the Day 82 BI ETL and Pipeline Automation lesson."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Mapping, Sequence

from mypackage.bi_curriculum import BiTopic, group_topics_by_titles

# --- Roadmap groupings -----------------------------------------------------

TOPIC_GROUP_TITLES: Mapping[str, Sequence[str]] = {
    "Pipeline foundations": (
        "ETL basics",
        "Data Pipeline Design",
    ),
    "Automation toolkit": (
        "ETL Tools",
        "Airflow",
        "dbt",
    ),
    "Delivery lifecycle": ("End-to-end Analytics Project",),
}


def load_topics(
    groups: Mapping[str, Sequence[str]] = TOPIC_GROUP_TITLES,
) -> dict[str, list[BiTopic]]:
    """Return roadmap topics grouped for the ETL automation lesson."""

    return group_topics_by_titles(groups)


# --- Pipeline sketch helpers -----------------------------------------------


@dataclass(frozen=True, slots=True)
class PipelineTask:
    """Representation of a pipeline task and its upstream dependencies."""

    task_id: str
    description: str
    upstream: tuple[str, ...] = ()
    owner: str = "analytics_engineering"


PIPELINE_STEPS: tuple[PipelineTask, ...] = (
    PipelineTask(
        "extract_sources",
        "Land CRM, product, and finance extracts into a controlled raw zone.",
    ),
    PipelineTask(
        "validate_raw",
        "Run schema and row-count checks to gate downstream transformations.",
        ("extract_sources",),
    ),
    PipelineTask(
        "stage_clean",
        "Normalize field names, cast types, and deduplicate business keys.",
        ("validate_raw",),
    ),
    PipelineTask(
        "load_warehouse",
        "Persist curated tables into the analytics warehouse for modeling.",
        ("stage_clean",),
    ),
    PipelineTask(
        "run_dbt_models",
        "Execute dbt models to assemble marts and publish metrics.",
        ("load_warehouse",),
        owner="analytics_engineering",
    ),
    PipelineTask(
        "refresh_dashboards",
        "Trigger downstream dashboards and notify stakeholders of completion.",
        ("run_dbt_models",),
        owner="bi_operations",
    ),
)


def build_pipeline_outline(
    steps: Sequence[PipelineTask] = PIPELINE_STEPS,
) -> list[PipelineTask]:
    """Return a mutable outline of the canonical ETL pipeline tasks."""

    return list(steps)


def build_airflow_dag_stub(
    *,
    dag_id: str = "analytics_etl",
    schedule: str = "@daily",
    steps: Sequence[PipelineTask] = PIPELINE_STEPS,
) -> dict[str, object]:
    """Return a minimal Airflow DAG definition mapping tasks to dependencies."""

    task_definitions: dict[str, dict[str, object]] = {}
    for task in steps:
        task_definitions[task.task_id] = {
            "upstream": task.upstream,
            "owner": task.owner,
            "retries": (
                2 if task.task_id in {"extract_sources", "load_warehouse"} else 1
            ),
        }
    return {
        "dag_id": dag_id,
        "schedule": schedule,
        "default_args": {
            "start_date": "2024-01-01",
            "email_on_failure": True,
        },
        "tasks": task_definitions,
    }


def build_dbt_project_stub(
    *,
    steps: Sequence[PipelineTask] = PIPELINE_STEPS,
) -> dict[str, object]:
    """Return a lightweight dbt manifest showing staging and mart dependencies."""

    staging_models = {
        "stg_crm_contacts": {
            "materialized": "view",
            "depends_on": ("raw_crm_contacts", "raw_product_users"),
        },
        "stg_finance_transactions": {
            "materialized": "incremental",
            "depends_on": ("raw_finance_ledger",),
        },
        "stg_product_events": {
            "materialized": "view",
            "depends_on": ("raw_product_events",),
        },
    }
    mart_models = {
        "fct_customer_lifecycle": {
            "materialized": "table",
            "depends_on": ("stg_crm_contacts", "stg_finance_transactions"),
        },
        "dim_product_usage": {
            "materialized": "table",
            "depends_on": ("stg_product_events",),
        },
    }
    exposures = {
        "weekly_revenue_review": {
            "type": "dashboard",
            "depends_on": ("fct_customer_lifecycle",),
            "owner": "finance_lead",
        }
    }
    return {
        "name": "analytics_etl",
        "sources": {
            "raw_crm_contacts": {"loaded_by": "extract_sources"},
            "raw_product_users": {"loaded_by": "extract_sources"},
            "raw_finance_ledger": {"loaded_by": "extract_sources"},
            "raw_product_events": {"loaded_by": "extract_sources"},
        },
        "staging": staging_models,
        "marts": mart_models,
        "exposures": exposures,
        "final_task": steps[-1].task_id if steps else "refresh_dashboards",
    }


__all__ = [
    "PIPELINE_STEPS",
    "PipelineTask",
    "TOPIC_GROUP_TITLES",
    "build_airflow_dag_stub",
    "build_dbt_project_stub",
    "build_pipeline_outline",
    "load_topics",
]
