"""Reusable helpers for Day 29 interactive Plotly visualisations."""

from __future__ import annotations

from pathlib import Path
from typing import Iterable

import pandas as pd
import plotly.express as px
import plotly.graph_objects as go

__all__ = [
    "load_sales_data",
    "build_region_revenue_bar",
    "build_daily_revenue_line",
    "build_price_units_scatter",
    "main",
]


def _require_columns(df: pd.DataFrame, required: Iterable[str]) -> None:
    """Raise ``ValueError`` if ``df`` is missing any of ``required`` columns."""

    missing = set(required) - set(df.columns)
    if missing:
        columns = ", ".join(sorted(missing))
        raise ValueError(f"DataFrame is missing required columns: {columns}")
    if df.empty:
        raise ValueError("DataFrame must contain at least one row to build the figure.")


def load_sales_data(data_path: Path | str | None = None) -> pd.DataFrame:
    """Return the ``sales_data.csv`` dataset bundled with the lesson."""

    if data_path is None:
        resource_dir = Path(__file__).resolve().parent
        data_path = resource_dir / "sales_data.csv"

    df = pd.read_csv(data_path, parse_dates=["Date"])
    return df.dropna().reset_index(drop=True)


def build_region_revenue_bar(df: pd.DataFrame) -> go.Figure:
    """Return a bar chart showing total revenue by region."""

    _require_columns(df, ["Region", "Revenue"])

    region_revenue = (
        df.groupby("Region", as_index=False)["Revenue"].sum().sort_values("Region")
    )

    fig = px.bar(
        region_revenue,
        x="Region",
        y="Revenue",
        color="Region",
        title="Total Revenue by Region",
        labels={"Revenue": "Total Revenue (USD)"},
    )
    fig.update_layout(showlegend=False)
    return fig


def build_daily_revenue_line(df: pd.DataFrame) -> go.Figure:
    """Return a daily revenue line chart with markers."""

    _require_columns(df, ["Date", "Revenue"])

    daily_revenue = (
        df.groupby("Date", as_index=False)["Revenue"].sum().sort_values("Date")
    )
    # ``plotly`` preserves ``datetime64`` values when rendering, which pandas now
    # returns from ``groupby`` aggregations.  Converting to plain ``datetime``
    # objects keeps backwards compatibility with the existing visualisation and
    # tests that expect Python ``datetime`` instances.
    daily_revenue["Date"] = [
        pd.Timestamp(ts).to_pydatetime() for ts in daily_revenue["Date"]
    ]

    fig = px.line(
        daily_revenue,
        x="Date",
        y="Revenue",
        title="Daily Revenue Trend",
        markers=True,
    )
    fig.update_traces(mode="lines+markers")
    fig.update_layout(yaxis_title="Revenue (USD)")
    for trace in fig.data:
        python_datetimes = tuple(pd.Timestamp(x).to_pydatetime() for x in trace.x)
        trace.update(x=python_datetimes)
    return fig


def build_price_units_scatter(df: pd.DataFrame) -> go.Figure:
    """Return a scatter plot comparing price and units sold with revenue sizing."""

    _require_columns(df, ["Price", "Units Sold", "Revenue", "Product", "Region"])

    fig = px.scatter(
        df,
        x="Price",
        y="Units Sold",
        color="Product",
        size="Revenue",
        hover_data=["Region", "Revenue"],
        title="Price vs. Units Sold Analysis",
    )
    fig.update_layout(
        legend_title_text="Product",
        xaxis_title="Price (USD)",
        yaxis_title="Units Sold",
    )
    return fig


def main() -> None:
    """Load the lesson dataset and display the interactive figures."""

    try:
        df = load_sales_data()
    except FileNotFoundError:
        print("Error: sales_data.csv not found. Keep the CSV beside this script.")
        return

    print("Data loaded successfully.")

    print("\n--- 1. Interactive Bar Chart: Revenue by Region ---")
    build_region_revenue_bar(df).show()

    print("\n--- 2. Interactive Line Chart: Revenue Over Time ---")
    build_daily_revenue_line(df).show()

    print("\n--- 3. Interactive Scatter Plot: Price vs. Units Sold ---")
    scatter = build_price_units_scatter(df)
    scatter.show()
    output_filename = "interactive_scatter_plot.html"
    scatter.write_html(output_filename)
    print(
        f"\nScatter plot saved to '{output_filename}'. You can open this file in a web browser."
    )


if __name__ == "__main__":
    main()
