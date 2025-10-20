"""Tests for the Day 82 BI ETL and Pipeline Automation helpers."""

from __future__ import annotations

import os
import sys
from collections.abc import Iterable

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from Day_82_BI_ETL_and_Pipeline_Automation.solutions import (  # noqa: E402
    TOPIC_GROUP_TITLES,
    build_airflow_dag_stub,
    build_dbt_project_stub,
    build_pipeline_outline,
    load_topics,
)

EXPECTED_TITLES = {
    "ETL basics",
    "ETL Tools",
    "End-to-end Analytics Project",
    "Data Pipeline Design",
    "Airflow",
    "dbt",
}

EXPECTED_TASKS = [
    "extract_sources",
    "validate_raw",
    "stage_clean",
    "load_warehouse",
    "run_dbt_models",
    "refresh_dashboards",
]


def flatten(iterable: Iterable[Iterable[str]]) -> set[str]:
    """Flatten nested iterables of strings into a set for comparison."""

    accumulator: set[str] = set()
    for group in iterable:
        accumulator.update(group)
    return accumulator


def test_load_topics_includes_all_roadmap_titles() -> None:
    grouped = load_topics()
    assert set(grouped) == set(TOPIC_GROUP_TITLES)
    titles = flatten({topic.title for topic in topics} for topics in grouped.values())
    assert titles == EXPECTED_TITLES


def test_pipeline_outline_preserves_order_and_dependencies() -> None:
    outline = build_pipeline_outline()
    assert [task.task_id for task in outline] == EXPECTED_TASKS

    dependency_map = {task.task_id: set(task.upstream) for task in outline}
    assert dependency_map["validate_raw"] == {"extract_sources"}
    assert dependency_map["stage_clean"] == {"validate_raw"}
    assert dependency_map["load_warehouse"] == {"stage_clean"}
    assert dependency_map["run_dbt_models"] == {"load_warehouse"}
    assert dependency_map["refresh_dashboards"] == {"run_dbt_models"}


def test_airflow_dag_stub_mirrors_pipeline_outline() -> None:
    dag = build_airflow_dag_stub()
    assert dag["dag_id"] == "analytics_etl"
    assert dag["schedule"] == "@daily"

    tasks = dag["tasks"]
    assert set(tasks) == set(EXPECTED_TASKS)
    assert tasks["extract_sources"]["upstream"] == ()
    assert tasks["stage_clean"]["upstream"] == ("validate_raw",)
    assert tasks["load_warehouse"]["upstream"] == ("stage_clean",)
    assert tasks["run_dbt_models"]["upstream"] == ("load_warehouse",)
    assert tasks["refresh_dashboards"]["upstream"] == ("run_dbt_models",)


def test_dbt_project_stub_links_sources_and_models() -> None:
    project = build_dbt_project_stub()
    sources = project["sources"]
    assert all(config["loaded_by"] == "extract_sources" for config in sources.values())

    staging = project["staging"]
    assert {
        "stg_crm_contacts",
        "stg_finance_transactions",
        "stg_product_events",
    }.issubset(staging)
    assert staging["stg_finance_transactions"]["depends_on"] == ("raw_finance_ledger",)

    marts = project["marts"]
    assert {
        "fct_customer_lifecycle",
        "dim_product_usage",
    }.issubset(marts)
    assert marts["fct_customer_lifecycle"]["depends_on"] == (
        "stg_crm_contacts",
        "stg_finance_transactions",
    )

    exposures = project["exposures"]
    assert "weekly_revenue_review" in exposures
    assert exposures["weekly_revenue_review"]["depends_on"] == (
        "fct_customer_lifecycle",
    )

    assert project["final_task"] == EXPECTED_TASKS[-1]


__all__ = [
    "EXPECTED_TASKS",
    "EXPECTED_TITLES",
    "test_airflow_dag_stub_mirrors_pipeline_outline",
    "test_dbt_project_stub_links_sources_and_models",
    "test_load_topics_includes_all_roadmap_titles",
    "test_pipeline_outline_preserves_order_and_dependencies",
]
