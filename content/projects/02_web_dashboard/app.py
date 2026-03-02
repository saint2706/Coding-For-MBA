"""
Project 02: Web Dashboard — Scaffold (Streamlit)
=================================================
Phase 3 skills showcase.

Fill in every section marked TODO.
Run with:  streamlit run app.py
"""

from __future__ import annotations

import sqlite3
from pathlib import Path

import numpy as np
import pandas as pd
import plotly.express as px
import streamlit as st

# ─────────────────────────────────────────────────────────────────────────────
# Configuration
# ─────────────────────────────────────────────────────────────────────────────

DB_PATH = Path("../01_python_data_pipeline/output/retailco.db")

st.set_page_config(
    page_title="RetailCo Dashboard",
    page_icon="📊",
    layout="wide",
)

# ─────────────────────────────────────────────────────────────────────────────
# MILESTONE 1 — Data Layer
# ─────────────────────────────────────────────────────────────────────────────


@st.cache_data(ttl=300)
def load_sales() -> pd.DataFrame:
    """
    Load the 'sales' table from SQLite (or generate synthetic data).

    TODO:
    1. If DB_PATH exists, open a sqlite3 connection and run:
           SELECT * FROM sales
       then close the connection and return the DataFrame.
    2. If DB_PATH does not exist, generate and return synthetic data using
       _generate_sample_data() defined below.
    3. Parse the 'date' column as datetime after loading.

    Hint:
        conn = sqlite3.connect(DB_PATH)
        df = pd.read_sql("SELECT * FROM sales", conn)
        conn.close()
    """
    # Your implementation here...
    raise NotImplementedError("Implement load_sales()")


def _generate_sample_data(n_rows: int = 5000) -> pd.DataFrame:
    """Synthetic fallback so the app works without Project 01."""
    rng = np.random.default_rng(42)
    stores = [f"STORE_{i:03d}" for i in range(1, 21)]
    regions = {s: rng.choice(["North", "South", "East", "West"]) for s in stores}
    categories = ["Electronics", "Clothing", "Food", "Home", "Sports"]
    dates = pd.date_range("2024-01-01", periods=n_rows, freq="H")
    chosen = rng.choice(stores, size=n_rows)
    return pd.DataFrame({
        "date": dates,
        "store_id": chosen,
        "region": [regions[s] for s in chosen],
        "category": rng.choice(categories, size=n_rows),
        "net_revenue": np.clip(rng.normal(500, 150, n_rows), 0, None).round(2),
        "units_sold": rng.integers(1, 50, size=n_rows),
        "returns": rng.integers(0, 5, size=n_rows),
    })


# ─────────────────────────────────────────────────────────────────────────────
# MILESTONE 2 — Sidebar Filters
# ─────────────────────────────────────────────────────────────────────────────


def apply_filters(df: pd.DataFrame) -> pd.DataFrame:
    """
    Render sidebar widgets and return a filtered DataFrame.

    TODO:
    1. Add st.sidebar.header("Filters").
    2. Date range: use st.sidebar.date_input() with min/max from df["date"].
       Filter df to rows where date is within the selected range.
    3. Region multi-select: st.sidebar.multiselect() with all unique regions.
       If nothing selected, keep all rows.
    4. Category multi-select: same pattern as region.
    5. Return the filtered df.

    Hint:
        date_range = st.sidebar.date_input("Date range", [df["date"].min(), df["date"].max()])
        if len(date_range) == 2:
            df = df[(df["date"] >= pd.Timestamp(date_range[0])) &
                    (df["date"] <= pd.Timestamp(date_range[1]))]
    """
    # Your implementation here...
    raise NotImplementedError("Implement apply_filters()")


# ─────────────────────────────────────────────────────────────────────────────
# MILESTONE 3 — KPI Cards
# ─────────────────────────────────────────────────────────────────────────────


def render_kpi_cards(df: pd.DataFrame) -> None:
    """
    Display Total Revenue, Avg Order Value, and Return Rate as st.metric tiles.

    TODO:
    1. Compute:
       - total_revenue   = df["net_revenue"].sum()
       - avg_order_value = df["net_revenue"].sum() / df["units_sold"].sum()
       - return_rate     = df["returns"].sum() / df["units_sold"].sum() * 100
    2. For delta, compare the current period to the prior period
       (split df at the midpoint by date, compute the same KPIs for each half).
    3. Use st.columns(3) then st.metric() for each KPI.
       Format revenue as "$1,234,567", AOV as "$123.45", rate as "2.3%".

    Hint:
        col1, col2, col3 = st.columns(3)
        col1.metric("Total Revenue", f"${total_revenue:,.0f}", delta=f"{delta_pct:+.1f}%")
    """
    # Your implementation here...
    raise NotImplementedError("Implement render_kpi_cards()")


# ─────────────────────────────────────────────────────────────────────────────
# MILESTONE 4 — Charts
# ─────────────────────────────────────────────────────────────────────────────


def render_revenue_trend(df: pd.DataFrame) -> None:
    """
    Line chart: monthly revenue per region.

    TODO:
    1. Add 'year_month' column: df["date"].dt.to_period("M").astype(str)
    2. Group by ['year_month', 'region'], sum net_revenue.
    3. Plot with px.line(x="year_month", y="net_revenue", color="region").
    4. Display with st.plotly_chart(fig, use_container_width=True).
    """
    # Your implementation here...
    raise NotImplementedError("Implement render_revenue_trend()")


def render_top_stores(df: pd.DataFrame, top_n: int = 10) -> None:
    """
    Horizontal bar chart: top N stores by total net_revenue.

    TODO:
    1. Group by 'store_id', sum net_revenue, sort descending, take top_n.
    2. Plot with px.bar(orientation="h", x="net_revenue", y="store_id").
    3. Display with st.plotly_chart(fig, use_container_width=True).
    """
    # Your implementation here...
    raise NotImplementedError("Implement render_top_stores()")


def render_category_mix(df: pd.DataFrame) -> None:
    """
    Donut chart: category revenue share.

    TODO:
    1. Group by 'category', sum net_revenue.
    2. Plot with px.pie(names="category", values="net_revenue", hole=0.4).
    3. Display with st.plotly_chart(fig, use_container_width=True).
    """
    # Your implementation here...
    raise NotImplementedError("Implement render_category_mix()")


# ─────────────────────────────────────────────────────────────────────────────
# MAIN — App entry point
# ─────────────────────────────────────────────────────────────────────────────


def main() -> None:
    st.title("📊 RetailCo Sales Dashboard")
    st.caption("Built with Streamlit · Phase 3 Capstone Project")

    raw_df = load_sales()
    df = apply_filters(raw_df)

    if df.empty:
        st.warning("No data matches the current filters. Adjust the sidebar and try again.")
        return

    st.subheader("Key Performance Indicators")
    render_kpi_cards(df)

    st.subheader("Revenue Trend by Region")
    render_revenue_trend(df)

    col_left, col_right = st.columns(2)
    with col_left:
        st.subheader("Top 10 Stores")
        render_top_stores(df)
    with col_right:
        st.subheader("Revenue by Category")
        render_category_mix(df)


if __name__ == "__main__":
    main()
