"""Utility functions for Day 28 advanced visualization examples."""

from __future__ import annotations

from pathlib import Path
from typing import Iterable

import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns


def _require_columns(df: pd.DataFrame, required: Iterable[str]) -> None:
    """Raise a ``ValueError`` if any of the ``required`` columns are missing."""

    missing = set(required) - set(df.columns)
    if missing:
        raise ValueError(f"DataFrame is missing required columns: {sorted(missing)}")


def build_product_revenue_bar(df: pd.DataFrame) -> plt.Figure:
    """Return a bar chart showing total revenue per product."""

    _require_columns(df, ["Product", "Revenue"])
    if df.empty:
        raise ValueError("DataFrame must contain at least one row to build the chart.")

    product_revenue = (
        df.groupby("Product", as_index=False)["Revenue"]
        .sum()
        .sort_values("Revenue", ascending=False)
    )
    avg_revenue = product_revenue["Revenue"].mean()

    fig, ax = plt.subplots(figsize=(12, 7))
    sns.barplot(
        x="Product",
        y="Revenue",
        data=product_revenue,
        hue="Product",
        palette="viridis",
        legend=False,
        ax=ax,
    )

    ax.set_title("Total Revenue per Product", fontsize=18, weight="bold")
    ax.set_xlabel("Product Category", fontsize=12)
    ax.set_ylabel("Total Revenue (in USD)", fontsize=12)
    ax.tick_params(axis="x", rotation=45)

    ax.axhline(
        y=avg_revenue,
        color="red",
        linestyle="--",
        label=f"Avg Revenue (${avg_revenue:,.2f})",
    )
    ax.legend()
    fig.tight_layout()
    return fig


def build_sales_dashboard(df: pd.DataFrame) -> plt.Figure:
    """Return a dashboard with a daily revenue line chart and revenue distribution histogram."""

    _require_columns(df, ["Date", "Revenue"])
    if df.empty:
        raise ValueError(
            "DataFrame must contain at least one row to build the dashboard."
        )

    daily_revenue = df.groupby("Date")["Revenue"].sum().sort_index().reset_index()

    fig, axes = plt.subplots(nrows=2, ncols=1, figsize=(12, 10))
    sns.lineplot(x="Date", y="Revenue", data=daily_revenue, ax=axes[0], color="blue")
    axes[0].set_title("Daily Revenue Trend", fontsize=14)
    axes[0].set_xlabel("Date")
    axes[0].set_ylabel("Revenue ($)")

    sns.histplot(data=df, x="Revenue", bins=15, kde=True, ax=axes[1], color="green")
    axes[1].set_title("Distribution of Individual Sale Revenue", fontsize=14)
    axes[1].set_xlabel("Revenue per Sale ($)")
    axes[1].set_ylabel("Frequency")

    fig.suptitle("Company Sales Dashboard", fontsize=20, weight="bold")
    fig.tight_layout(rect=(0, 0.03, 1, 0.95))
    return fig


def load_sales_data(data_path: Path | None = None) -> pd.DataFrame:
    """Load the ``sales_data.csv`` file bundled with the lesson."""

    if data_path is None:
        resource_dir = Path(__file__).resolve().parent
        data_path = resource_dir / "sales_data.csv"

    df = pd.read_csv(data_path, parse_dates=["Date"])
    df.dropna(inplace=True)
    return df


def main() -> None:
    """Run the example workflow and display the generated figures."""

    try:
        df = load_sales_data()
    except FileNotFoundError:
        print("Error: sales_data.csv not found. Keep the CSV beside this script.")
        return

    print("Data loaded successfully.")

    print("\n--- 1. Creating a Customized Plot ---")
    fig_bar = build_product_revenue_bar(df)
    fig_bar.show()

    print("\n--- 2. Creating a 2x1 Dashboard ---")
    fig_dashboard = build_sales_dashboard(df)
    fig_dashboard.show()


if __name__ == "__main__":
    main()
