"""Day 27: Creating Business Visualizations.

This module provides reusable plotting functions for the lesson so that the
charts can be tested and embedded in notebooks without relying on the GUI
backend.  Each function returns a :class:`matplotlib.figure.Figure` instance.
"""

from __future__ import annotations

from pathlib import Path
from typing import Iterable

import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns

# Matplotlib/Seaborn global configuration
sns.set_theme(style="whitegrid")

RESOURCE_DIR = Path(__file__).resolve().parent
DEFAULT_DATA_PATHS: Iterable[Path] = (
    RESOURCE_DIR / "sales_data.csv",
    RESOURCE_DIR.parent / "Day_24_Pandas_Advanced" / "sales_data.csv",
)


def load_sales_data(paths: Iterable[Path] = DEFAULT_DATA_PATHS) -> pd.DataFrame:
    """Load the sales dataset used throughout the visualisation lesson.

    Parameters
    ----------
    paths:
        Candidate file paths that will be checked in order.  The first existing
        CSV file is read.

    Returns
    -------
    pandas.DataFrame
        The cleaned sales data with parsed dates.  An empty DataFrame is
        returned if none of the paths exist.
    """

    for path in paths:
        if path.exists():
            df = pd.read_csv(path, parse_dates=["Date"])
            df.dropna(inplace=True)
            return df

    print("Error: sales_data.csv not found. Keep the CSV beside this script.")
    return pd.DataFrame()


def _validate_dataframe(df: pd.DataFrame, required_columns: Iterable[str]) -> None:
    missing = [col for col in required_columns if col not in df.columns]
    if missing:
        raise ValueError(f"DataFrame is missing required columns: {missing}")
    if df.empty:
        raise ValueError("DataFrame is empty; cannot build visualization.")


def build_revenue_by_region_plot(df: pd.DataFrame) -> plt.Figure:
    """Create a bar chart showing total revenue by region."""

    _validate_dataframe(df, ["Region", "Revenue"])

    fig, ax = plt.subplots(figsize=(10, 6))
    sns.barplot(x="Region", y="Revenue", data=df, estimator=sum, errorbar=None, ax=ax)
    ax.set_title("Total Revenue by Region", fontsize=16)
    ax.set_ylabel("Total Revenue ($)")
    ax.set_xlabel("Region")
    fig.tight_layout()
    return fig


def build_daily_revenue_plot(df: pd.DataFrame) -> plt.Figure:
    """Create a line chart showing daily total revenue."""

    _validate_dataframe(df, ["Date", "Revenue"])

    daily_revenue = df.groupby("Date")["Revenue"].sum().reset_index()
    fig, ax = plt.subplots(figsize=(12, 6))
    sns.lineplot(x="Date", y="Revenue", data=daily_revenue, ax=ax)
    ax.set_title("Daily Revenue Trend", fontsize=16)
    ax.set_xlabel("Date")
    ax.set_ylabel("Total Revenue ($)")
    for label in ax.get_xticklabels():
        label.set_rotation(45)
    fig.tight_layout()
    return fig


def build_units_sold_distribution_plot(df: pd.DataFrame) -> plt.Figure:
    """Create a histogram showing the distribution of units sold."""

    _validate_dataframe(df, ["Units Sold"])

    fig, ax = plt.subplots(figsize=(10, 6))
    sns.histplot(x="Units Sold", data=df, bins=10, kde=True, ax=ax)
    ax.set_title("Distribution of Units Sold per Transaction", fontsize=16)
    ax.set_xlabel("Units Sold")
    ax.set_ylabel("Frequency")
    fig.tight_layout()
    return fig


def build_price_vs_units_sold_plot(df: pd.DataFrame) -> plt.Figure:
    """Create a scatter plot comparing price to units sold."""

    _validate_dataframe(df, ["Price", "Units Sold", "Product"])

    fig, ax = plt.subplots(figsize=(10, 6))
    sns.scatterplot(x="Price", y="Units Sold", data=df, hue="Product", ax=ax)
    ax.set_title("Price vs. Units Sold", fontsize=16)
    ax.set_xlabel("Price ($)")
    ax.set_ylabel("Units Sold")
    ax.legend(title="Product")
    fig.tight_layout()
    return fig


def main() -> None:
    """Load the data and display the standard lesson charts."""

    df = load_sales_data()
    if df.empty:
        return

    print(
        "Displaying Bar Chart: Total Revenue by Region. Close the window to continue."
    )
    build_revenue_by_region_plot(df).show()

    print("Displaying Line Chart: Daily Revenue Trend. Close the window to continue.")
    build_daily_revenue_plot(df).show()

    print(
        "Displaying Histogram: Distribution of Units Sold. Close the window to continue."
    )
    build_units_sold_distribution_plot(df).show()

    print(
        "Displaying Scatter Plot: Price vs. Units Sold. Close the window to continue."
    )
    build_price_vs_units_sold_plot(df).show()


if __name__ == "__main__":
    main()
