"""
Project 01: Python Data Pipeline — Scaffold
============================================
Phase 1–2 skills showcase.

Fill in every section marked TODO.
Run with:  python pipeline.py
Expected output at the end: "✅ Pipeline complete — 12 monthly KPI rows written to output/"
"""

from __future__ import annotations

import sqlite3
from pathlib import Path

import numpy as np
import pandas as pd

OUTPUT_DIR = Path("output")
DB_PATH = OUTPUT_DIR / "retailco.db"
RAW_CSV = Path("sample_data.csv")

# ─────────────────────────────────────────────────────────────────────────────
# MILESTONE 1 — Load & Validate (Phase 1)
# ─────────────────────────────────────────────────────────────────────────────

REQUIRED_COLUMNS = {"date", "store_id", "region", "category", "revenue", "units_sold", "returns"}


def load_data(csv_path: Path = RAW_CSV) -> pd.DataFrame:
    """
    Load the raw sales CSV.

    TODO:
    1. Read the CSV using pd.read_csv().
    2. Print the shape, column names, and first 5 rows.
    3. Raise ValueError if any column in REQUIRED_COLUMNS is missing.
    4. Return the raw DataFrame.
    """
    # Your implementation here...
    raise NotImplementedError("Implement load_data()")


# ─────────────────────────────────────────────────────────────────────────────
# MILESTONE 2 — Clean (Phase 2)
# ─────────────────────────────────────────────────────────────────────────────


def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Clean the raw sales DataFrame.

    TODO:
    1. Convert the 'date' column to datetime with pd.to_datetime().
    2. Drop rows where revenue < 0.
    3. Cap revenue outliers at the 99th percentile using .clip().
    4. Add derived columns:
       - 'year'        : integer year from the date
       - 'month'       : integer month (1-12) from the date
       - 'is_weekend'  : True when date.dt.dayofweek >= 5
       - 'net_revenue' : revenue - returns (floor at 0 with .clip(lower=0))
    5. Assert that no NaN values remain in the REQUIRED_COLUMNS.
    6. Return the cleaned DataFrame.

    Hints:
        df["date"] = pd.to_datetime(df["date"])
        df["month"] = df["date"].dt.month
        df["revenue"] = df["revenue"].clip(upper=df["revenue"].quantile(0.99))
    """
    df = df.copy()

    # Your implementation here...
    raise NotImplementedError("Implement clean_data()")


# ─────────────────────────────────────────────────────────────────────────────
# MILESTONE 3 — Transform / KPI Computation (Phase 2)
# ─────────────────────────────────────────────────────────────────────────────


def compute_kpis(df: pd.DataFrame) -> pd.DataFrame:
    """
    Aggregate to monthly KPIs.

    TODO:
    1. Group by ['year', 'month', 'region'] and aggregate:
       - total_revenue   : sum of net_revenue
       - total_units     : sum of units_sold
       - total_returns   : sum of returns
    2. Calculate:
       - return_rate     : total_returns / total_units  (as %)
       - avg_order_value : total_revenue / total_units
    3. Sort by ['year', 'month', 'region'].
    4. Add 'revenue_growth_mom': pct_change() of total_revenue
       (within each region — use groupby + pct_change or shift).
    5. Return the KPI DataFrame.

    Hints:
        monthly = df.groupby(["year", "month", "region"]).agg(...)
        monthly["revenue_growth_mom"] = (
            monthly.groupby("region")["total_revenue"].pct_change() * 100
        )
    """
    # Your implementation here...
    raise NotImplementedError("Implement compute_kpis()")


def top_performers(df: pd.DataFrame) -> dict:
    """
    Return the top store and top category by total net_revenue.

    TODO:
    1. Group df by 'store_id', sum net_revenue, and find the idxmax().
    2. Group df by 'category', sum net_revenue, and find the idxmax().
    3. Return {"top_store": <store_id>, "top_category": <category>}.
    """
    # Your implementation here...
    raise NotImplementedError("Implement top_performers()")


# ─────────────────────────────────────────────────────────────────────────────
# MILESTONE 4 — Report & Persist (Phase 1–2)
# ─────────────────────────────────────────────────────────────────────────────


def generate_report(kpi_df: pd.DataFrame, performers: dict) -> None:
    """
    Print a formatted KPI summary to the console.

    TODO:
    1. Print a header: "RetailCo Monthly KPI Report"
    2. Print top_store and top_category from performers.
    3. Loop over the kpi_df rows and print a formatted row per month:
       e.g. "2024-01 | North | Revenue: $1,234,567 | AOV: $123.45 | Return Rate: 2.5%"
    """
    # Your implementation here...
    raise NotImplementedError("Implement generate_report()")


def save_outputs(kpi_df: pd.DataFrame, clean_df: pd.DataFrame) -> None:
    """
    Persist results to CSV and SQLite.

    TODO:
    1. Create the OUTPUT_DIR directory (use Path.mkdir(exist_ok=True)).
    2. Write kpi_df to OUTPUT_DIR / "kpi_report.csv" (index=False).
    3. Connect to DB_PATH with sqlite3, then use df.to_sql() to save
       clean_df as table "sales" (if_exists="replace") and
       kpi_df as table "kpi_monthly" (if_exists="replace").
    4. Print "✅ Pipeline complete — {n} monthly KPI rows written to output/"
       where n is len(kpi_df).

    Hint:
        conn = sqlite3.connect(DB_PATH)
        clean_df.to_sql("sales", conn, if_exists="replace", index=False)
        conn.close()
    """
    # Your implementation here...
    raise NotImplementedError("Implement save_outputs()")


# ─────────────────────────────────────────────────────────────────────────────
# HELPERS — Synthetic data generator (runs if sample_data.csv is absent)
# ─────────────────────────────────────────────────────────────────────────────


def _generate_sample_data(path: Path = RAW_CSV, n_rows: int = 5000) -> None:
    """Generate a synthetic sales CSV so the pipeline can run without real data."""
    rng = np.random.default_rng(42)
    stores = [f"STORE_{i:03d}" for i in range(1, 21)]
    regions = {s: rng.choice(["North", "South", "East", "West"]) for s in stores}
    categories = ["Electronics", "Clothing", "Food", "Home", "Sports"]

    dates = pd.date_range("2024-01-01", periods=n_rows, freq="H")
    chosen_stores = rng.choice(stores, size=n_rows)

    data = {
        "date": dates.strftime("%Y-%m-%d"),
        "store_id": chosen_stores,
        "region": [regions[s] for s in chosen_stores],
        "category": rng.choice(categories, size=n_rows),
        "revenue": np.clip(rng.normal(500, 150, n_rows), 0, None).round(2),
        "units_sold": rng.integers(1, 50, size=n_rows),
        "returns": rng.integers(0, 5, size=n_rows),
    }
    pd.DataFrame(data).to_csv(path, index=False)
    print(f"  Generated {n_rows:,} rows → {path}")


# ─────────────────────────────────────────────────────────────────────────────
# MAIN — Run the full pipeline
# ─────────────────────────────────────────────────────────────────────────────


if __name__ == "__main__":
    print("=" * 55)
    print("  RetailCo Python Data Pipeline")
    print("=" * 55)

    # Ensure sample data exists
    if not RAW_CSV.exists():
        print("\n[0/4] Generating sample data...")
        _generate_sample_data()

    print("\n[1/4] Loading data...")
    raw = load_data()

    print("\n[2/4] Cleaning data...")
    clean = clean_data(raw)

    print("\n[3/4] Computing KPIs...")
    kpis = compute_kpis(clean)
    performers = top_performers(clean)
    generate_report(kpis, performers)

    print("\n[4/4] Saving outputs...")
    save_outputs(kpis, clean)
