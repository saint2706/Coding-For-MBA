"""Day 73 – BI SQL and Databases classroom script."""

from __future__ import annotations

import pandas as pd
from Day_73_BI_SQL_and_Databases import (
    build_topic_dataframe,
    compute_region_window_metrics,
    create_sales_database,
    fetch_monthly_revenue,
)

TOPIC_FRAME = build_topic_dataframe()

BASIC_FILTER_QUERY = """
SELECT order_id, region, product, revenue
FROM sales
WHERE revenue >= 3500
ORDER BY revenue DESC;
"""


def preview_taxonomy(frame: pd.DataFrame) -> None:
    """Print the grouped roadmap topics for discussion."""

    print("\nDay 73 SQL and database roadmap\n")
    print(frame.to_markdown(index=False))


def demonstrate_basic_queries(connection) -> None:
    """Showcase foundational SELECT/WHERE patterns."""

    print("\nReviewing SQL fundamentals from Day 31\n")
    results = pd.read_sql_query(BASIC_FILTER_QUERY, connection)
    print(results.to_markdown(index=False))


def demonstrate_aggregations(connection) -> None:
    """Summarize monthly revenue for BI QA conversations."""

    print("\nAggregating revenue for staging-table checks\n")
    aggregated = fetch_monthly_revenue(connection)
    print(aggregated.to_markdown(index=False))


def demonstrate_window_functions(connection) -> None:
    """Connect analytics engineering topics to SQL window functions."""

    print("\nWindow functions for cohort monitoring\n")
    windowed = compute_region_window_metrics(connection)
    formatted = windowed.assign(
        cumulative_revenue=lambda df: df["cumulative_revenue"].map("${:,.0f}".format),
        average_region_revenue=lambda df: df["average_region_revenue"].map(
            "${:,.0f}".format
        ),
        revenue=lambda df: df["revenue"].map("${:,.0f}".format),
        revenue_change=lambda df: df["revenue_change"].map("${:,.0f}".format),
    )
    print(formatted.to_markdown(index=False))


def main() -> None:
    """Run the Day 73 classroom walkthrough."""

    preview_taxonomy(TOPIC_FRAME)
    with create_sales_database() as connection:
        demonstrate_basic_queries(connection)
        demonstrate_aggregations(connection)
        demonstrate_window_functions(connection)


if __name__ == "__main__":
    main()
