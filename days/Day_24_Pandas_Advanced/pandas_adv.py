"""
Day 24: Advanced Pandas - Working with Real Data (Refactored)

This script demonstrates loading data from a CSV file and
using advanced selection and cleaning techniques with Pandas,
refactored into testable functions.
"""

from pathlib import Path
from typing import Any, List, Optional

import pandas as pd
import plotly.graph_objects as go


def load_sales_data(file_path: str) -> Optional[pd.DataFrame]:
    """Loads sales data from a CSV file into a Pandas DataFrame."""
    try:
        return pd.read_csv(file_path)
    except FileNotFoundError:
        print(f"❌ Error: The file was not found at {file_path}")
        return None


def select_by_label(
    df: pd.DataFrame, index_label: Any, columns: List[str]
) -> Optional[pd.Series]:
    """Selects data by row label and column names using .loc."""
    if df is None or df.empty:
        return None
    try:
        return df.loc[index_label, columns]
    except KeyError:
        return None


def select_by_position(
    df: pd.DataFrame, row_pos: int, col_slice: slice
) -> Optional[pd.Series]:
    """Selects data by integer position using .iloc."""
    if df is None or df.empty:
        return None
    try:
        return df.iloc[row_pos, col_slice]
    except IndexError:
        return None


def filter_by_high_revenue(df: pd.DataFrame, threshold: float) -> pd.DataFrame:
    """Filters the DataFrame for rows where Revenue exceeds a threshold."""
    if df is None or "Revenue" not in df.columns:
        return pd.DataFrame()
    return df[df["Revenue"] > threshold]


def filter_by_product_and_region(
    df: pd.DataFrame, product: str, region: str
) -> pd.DataFrame:
    """Filters the DataFrame for a specific product and region."""
    if df is None or "Product" not in df.columns or "Region" not in df.columns:
        return pd.DataFrame()
    product_normalized = product.strip().casefold()
    region_normalized = region.strip().casefold()

    normalized_product_series = (
        df["Product"].astype("string").str.strip().str.casefold()
    )
    normalized_region_series = df["Region"].astype("string").str.strip().str.casefold()

    mask = (normalized_product_series == product_normalized) & (
        normalized_region_series == region_normalized
    )
    return df[mask]


def handle_missing_data(
    df: Optional[pd.DataFrame], strategy: str = "drop", fill_value=None
) -> pd.DataFrame:
    """Handles missing data by either dropping rows or filling with a value."""
    if df is None or df.empty:
        raise ValueError(
            "No sales data is available. Ensure the CSV exists and contains rows before"
            " calling handle_missing_data."
        )

    df_copy = df.copy()
    if strategy == "drop":
        return df_copy.dropna()
    elif strategy == "fill":
        if fill_value is None:
            # Default to filling with the mean for numeric columns
            for col in df_copy.columns:
                if pd.api.types.is_numeric_dtype(df_copy[col]):
                    df_copy[col] = df_copy[col].fillna(df_copy[col].mean())
        else:
            df_copy = df_copy.fillna(fill_value)
    return df_copy


def build_revenue_by_region_bar_chart(df: pd.DataFrame) -> go.Figure:
    """Build an interactive bar chart comparing revenue across regions."""

    if df is None or df.empty:
        raise ValueError("DataFrame must not be empty")
    if not {"Region", "Revenue"}.issubset(df.columns):
        raise KeyError("DataFrame must include 'Region' and 'Revenue' columns")

    regional_revenue = (
        df.groupby("Region", dropna=False)["Revenue"]
        .sum(min_count=1)
        .sort_values(ascending=False)
    )
    figure = go.Figure(
        data=[
            go.Bar(
                x=regional_revenue.index.astype(str),
                y=regional_revenue.values,
                marker_color="#00A1D6",
                hovertemplate="Region: %{x}<br>Revenue: %{y:$,.0f}<extra></extra>",
            )
        ]
    )
    figure.update_layout(
        title="Revenue by Region",
        xaxis_title="Region",
        yaxis_title="Total Revenue",
        template="plotly_white",
    )
    return figure


def build_units_vs_price_scatter(df: pd.DataFrame) -> go.Figure:
    """Return a scatter plot showing how pricing relates to units sold."""

    if df is None or df.empty:
        raise ValueError("DataFrame must not be empty")
    required_columns = {"Units Sold", "Price", "Product"}
    if not required_columns.issubset(df.columns):
        missing = ", ".join(sorted(required_columns - set(df.columns)))
        raise KeyError(f"Missing required columns: {missing}")

    figure = go.Figure(
        data=[
            go.Scatter(
                x=df["Price"],
                y=df["Units Sold"],
                mode="markers",
                marker=dict(
                    size=10,
                    color=df["Units Sold"],
                    colorscale="Viridis",
                    showscale=True,
                ),
                text=df["Product"],
                hovertemplate=(
                    "Product: %{text}<br>Price: %{x:$,.0f}<br>Units Sold: %{y}<extra></extra>"
                ),
            )
        ]
    )
    figure.update_layout(
        title="Units Sold vs. Price",
        xaxis_title="Price",
        yaxis_title="Units Sold",
        template="plotly_white",
    )
    return figure


def main():
    """Main function to demonstrate advanced Pandas operations."""
    print("--- Loading and Inspecting sales_data.csv ---")
    resource_dir = Path(__file__).resolve().parent
    data_path = resource_dir / "sales_data.csv"
    df = load_sales_data(str(data_path))

    if df is not None:
        print(df.head())
        print("-" * 20)

        print("--- Advanced Data Selection ---")
        product_3 = select_by_label(df, 3, ["Product", "Revenue"])
        print(f"Product and Revenue for row index 3 (using .loc):\n{product_3}\n")

        row_0 = select_by_position(df, 0, slice(0, 3))
        print(f"First row, first 3 columns (using .iloc):\n{row_0}\n")
        print("-" * 20)

        print("--- Conditional Filtering ---")
        high_revenue_df = filter_by_high_revenue(df, 50000)
        print(f"Found {len(high_revenue_df)} sales with revenue > $50,000.")

        laptop_north_df = filter_by_product_and_region(df, "Laptop", "North")
        print(f"Found {len(laptop_north_df)} 'Laptop' sales in the 'North' region.")
        print("-" * 20)

        print("--- Handling Missing Data ---")
        print(f"Original shape: {df.shape}")
        print(f"Missing values count:\n{df.isnull().sum()}\n")

        df_dropped = handle_missing_data(df, strategy="drop")
        print(f"Shape after dropping missing rows: {df_dropped.shape}")

        df_filled = handle_missing_data(df, strategy="fill")
        print(
            f"Missing values after filling with mean:\n{df_filled.isnull().sum().sum()}"
        )
        print("-" * 20)


if __name__ == "__main__":
    main()
