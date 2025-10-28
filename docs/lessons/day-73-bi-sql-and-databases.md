Day 73 rebuilds the SQL and database depth outlined in the BI roadmap so the track moves beyond the
light touch from [Day 31 – Databases](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_31_Databases/README.md) and the tooling survey in
[Day 70 – BI Metrics and Data Literacy](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_70_BI_Metrics_and_Data_Literacy/README.md). The
facilitation plan clusters the roadmap titles into two discussion blocks:

- **SQL foundations** – SQL Fundamentals, Basic Queries, Advanced Queries, Window Functions, and
  Data Cleaning. The exercises reopen the core syntax students first practiced on Day 31 while
  layering in modern analytic patterns such as window functions for cohort monitoring and quality
  checks for BI pipelines.
- **Database engines** – Popular Databases, PostgreSQL, MySQL, Oracle, and SQLite. The lesson
  compares engine traits for BI workloads and shows how to start with SQLite before graduating to
  managed PostgreSQL or MySQL services.

The accompanying `lesson.py` script walks through a lightweight analytics warehouse built with
SQLite. It demonstrates:

1. Basic selection and filtering patterns.
1. Aggregations that BI teams use to sanity-check staging tables.
1. Window functions that compute cumulative revenue and period-over-period deltas.

Use these walkthroughs alongside Day 31's notebooks when you want learners to contrast Python-side
DataFrame transformations with raw SQL and database operations.

## Additional Topic: ETL & Data Preparation

> This lesson is part of the Phase 5 Business Intelligence specialization. Use the
> [Phase 5 overview](https://github.com/saint2706/Coding-For-MBA/blob/main/docs/bi-curriculum.md) to see how the developer-roadmap topics align across
> Days 68–84.

## Why it matters

Design reliable ingestion pipelines for analytics-ready data.

## Developer-roadmap alignment

- ETL basics
- ETL Tools
- Data Transformation Techniques
- Data Cleaning

## Next steps

- Draft case studies and notebooks that exercise these roadmap nodes.
- Update the Phase 5 cheat sheet with the insights you capture here.

## Additional Materials

???+ example "lesson.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_73_BI_SQL_and_Databases/lesson.py)

    ```python title="lesson.py"
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
    ```

???+ example "solutions.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_73_BI_SQL_and_Databases/solutions.py)

    ```python title="solutions.py"
    """Utilities for the Day 73 BI SQL and Databases lesson."""

    from __future__ import annotations

    import sqlite3
    from dataclasses import asdict, dataclass
    from typing import Iterable, Mapping, Sequence

    import pandas as pd

    from mypackage.bi_curriculum import BiTopic, group_topics_by_titles

    # --- Roadmap groupings ----------------------------------------------------

    TOPIC_GROUP_TITLES: Mapping[str, Sequence[str]] = {
        "SQL foundations": (
            "SQL Fundamentals",
            "Basic Queries",
            "Advanced Queries",
            "Window Functions",
            "Data Cleaning",
        ),
        "Database engines": (
            "Popular Databases",
            "PostgreSQL",
            "MySQL",
            "Oracle",
            "SQLite",
        ),
    }

    TOPIC_SUMMARIES: Mapping[str, str] = {
        "SQL Fundamentals": (
            "Reintroduce core syntax elements—SELECT, FROM, WHERE, GROUP BY—to anchor "
            "analytics workflows in declarative querying."
        ),
        "Basic Queries": (
            "Show how filtering and projection translate business questions into "
            "repeatable SQL statements."
        ),
        "Advanced Queries": (
            "Highlight joins, subqueries, and CTEs that power multi-table BI views "
            "and ad-hoc investigations."
        ),
        "Window Functions": (
            "Use analytic functions to compute running totals, rankings, and cohort "
            "metrics without losing row-level detail."
        ),
        "Data Cleaning": (
            "Demonstrate SQL-based validation and transformation steps that keep BI "
            "pipelines trustworthy."
        ),
        "Popular Databases": (
            "Compare the engines analysts are most likely to encounter across "
            "product, finance, and operations teams."
        ),
        "PostgreSQL": (
            "Introduce the open-source default for analytics engineering, including "
            "extensions and window-function depth."
        ),
        "MySQL": (
            "Cover the ubiquitous transactional store that many BI teams inherit and "
            "must tune for reporting."
        ),
        "Oracle": (
            "Discuss enterprise workloads that continue to rely on Oracle's feature "
            "set and performance guarantees."
        ),
        "SQLite": (
            "Leverage the lightweight engine for prototyping metrics before scaling "
            "to managed services."
        ),
    }


    def load_topics(
        groups: Mapping[str, Sequence[str]] = TOPIC_GROUP_TITLES,
    ) -> dict[str, list[BiTopic]]:
        """Return roadmap topics grouped by the requested sections."""

        return group_topics_by_titles(groups)


    def build_topic_dataframe(
        *,
        groups: Mapping[str, Sequence[str]] = TOPIC_GROUP_TITLES,
        summaries: Mapping[str, str] = TOPIC_SUMMARIES,
    ) -> pd.DataFrame:
        """Return a DataFrame describing the SQL and database taxonomy."""

        records: list[dict[str, str]] = []
        for section, topics in load_topics(groups).items():
            for topic in topics:
                records.append(
                    {
                        "section": section,
                        "title": topic.title,
                        "description": summaries.get(topic.title, ""),
                    }
                )
        frame = pd.DataFrame(records, columns=["section", "title", "description"])
        if frame.empty:
            return frame
        return frame.drop_duplicates(subset=["title"]).reset_index(drop=True)


    # --- SQLite helpers -------------------------------------------------------


    @dataclass(frozen=True, slots=True)
    class SalesRecord:
        """Simple container for populating the demo SQLite database."""

        order_id: int
        region: str
        month: str
        product: str
        units: int
        revenue: float


    DEFAULT_SALES_DATA: tuple[SalesRecord, ...] = (
        SalesRecord(1, "East", "2024-01", "Starter", 5, 2500.0),
        SalesRecord(2, "East", "2024-02", "Starter", 7, 3650.0),
        SalesRecord(3, "East", "2024-03", "Growth", 6, 4200.0),
        SalesRecord(4, "West", "2024-01", "Starter", 4, 2000.0),
        SalesRecord(5, "West", "2024-02", "Growth", 5, 3150.0),
        SalesRecord(6, "West", "2024-03", "Growth", 7, 4550.0),
    )


    SALES_TABLE_SCHEMA = """
    CREATE TABLE IF NOT EXISTS sales (
        order_id INTEGER PRIMARY KEY,
        region TEXT NOT NULL,
        month TEXT NOT NULL,
        product TEXT NOT NULL,
        units INTEGER NOT NULL,
        revenue REAL NOT NULL
    );
    """


    def create_sales_database(
        records: Iterable[SalesRecord] | None = None,
    ) -> sqlite3.Connection:
        """Create an in-memory SQLite database populated with sales records."""

        connection = sqlite3.connect(":memory:")
        connection.execute("PRAGMA foreign_keys = ON;")
        connection.executescript(SALES_TABLE_SCHEMA)

        payload = tuple(records) if records is not None else DEFAULT_SALES_DATA
        connection.executemany(
            "INSERT INTO sales (order_id, region, month, product, units, revenue)\n"
            "VALUES (:order_id, :region, :month, :product, :units, :revenue);",
            [asdict(record) for record in payload],
        )
        connection.commit()
        return connection


    MONTHLY_REVENUE_QUERY = """
    SELECT
        month,
        SUM(revenue) AS monthly_revenue,
        SUM(units) AS monthly_units
    FROM sales
    GROUP BY month
    ORDER BY month;
    """


    def fetch_monthly_revenue(
        connection: sqlite3.Connection, query: str = MONTHLY_REVENUE_QUERY
    ) -> pd.DataFrame:
        """Return aggregated revenue and units by month."""

        return pd.read_sql_query(query, connection)


    WINDOW_METRICS_QUERY = """
    SELECT
        region,
        month,
        revenue,
        SUM(revenue) OVER (
            PARTITION BY region
            ORDER BY month
            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
        ) AS cumulative_revenue,
        AVG(revenue) OVER (PARTITION BY region) AS average_region_revenue,
        revenue - LAG(revenue, 1, revenue) OVER (
            PARTITION BY region
            ORDER BY month
        ) AS revenue_change
    FROM sales
    ORDER BY region, month;
    """


    def compute_region_window_metrics(
        connection: sqlite3.Connection, query: str = WINDOW_METRICS_QUERY
    ) -> pd.DataFrame:
        """Return window function analytics for the sales table."""

        return pd.read_sql_query(query, connection)


    __all__ = [
        "SalesRecord",
        "TOPIC_GROUP_TITLES",
        "TOPIC_SUMMARIES",
        "build_topic_dataframe",
        "compute_region_window_metrics",
        "create_sales_database",
        "fetch_monthly_revenue",
        "load_topics",
    ]
    ```
