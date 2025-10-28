"""Tests for the Day 73 BI SQL and Databases lesson helpers."""

from __future__ import annotations

import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pandas as pd
import pytest

from Day_73_BI_SQL_and_Databases import (
    build_topic_dataframe,
    compute_region_window_metrics,
    create_sales_database,
    fetch_monthly_revenue,
    load_topics,
)

EXPECTED_TITLES = {
    "SQL Fundamentals",
    "Popular Databases",
    "PostgreSQL",
    "MySQL",
    "Oracle",
    "SQLite",
    "Basic Queries",
    "Advanced Queries",
    "Window Functions",
    "Data Cleaning",
}


def test_topic_groups_include_all_engines() -> None:
    """The grouped topics should include each database engine focus."""

    grouped = load_topics()
    engines = grouped.get("Database engines")
    assert engines is not None, "Database engines section missing"
    titles = {topic.title for topic in engines}
    expected_engines = {"Popular Databases", "PostgreSQL", "MySQL", "Oracle", "SQLite"}
    assert expected_engines <= titles


def test_topic_dataframe_lists_expected_titles() -> None:
    """The taxonomy DataFrame should include all roadmap titles."""

    frame = build_topic_dataframe()
    assert set(frame["title"]) == EXPECTED_TITLES


def test_sqlite_helpers_generate_expected_metrics() -> None:
    """The SQLite demo should aggregate and window data correctly."""

    connection = create_sales_database()
    try:
        monthly = fetch_monthly_revenue(connection)
        east_west_totals = dict(zip(monthly["month"], monthly["monthly_revenue"]))
        assert east_west_totals["2024-01"] == pytest.approx(4500.0)
        assert east_west_totals["2024-02"] == pytest.approx(6800.0)
        assert east_west_totals["2024-03"] == pytest.approx(8750.0)

        window_metrics = compute_region_window_metrics(connection)
        east_feb = window_metrics[
            (window_metrics["region"] == "East")
            & (window_metrics["month"] == "2024-02")
        ].iloc[0]
        assert east_feb["cumulative_revenue"] == pytest.approx(6150.0)
        assert east_feb["average_region_revenue"] == pytest.approx(3450.0)
        assert east_feb["revenue_change"] == pytest.approx(1150.0)

        west_mar = window_metrics[
            (window_metrics["region"] == "West")
            & (window_metrics["month"] == "2024-03")
        ].iloc[0]
        assert west_mar["cumulative_revenue"] == pytest.approx(9700.0)
        assert west_mar["average_region_revenue"] == pytest.approx(3233.3333333333335)
        assert west_mar["revenue_change"] == pytest.approx(1400.0)
    finally:
        connection.close()


@pytest.fixture(autouse=True)
def _set_pandas_options() -> None:
    """Ensure deterministic DataFrame comparisons in the tests."""

    with pd.option_context("display.float_format", "{:.2f}".format):
        yield
