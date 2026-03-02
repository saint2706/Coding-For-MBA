"""
Project 05: SQL Data Warehouse — ETL Pipeline Scaffold
=======================================================
Phase 8–9 skills showcase.

Fill in every section marked TODO.
Run with:  python etl.py
Expected output: "✅ ETL complete — 50,000 fact rows loaded in Xs"
"""

from __future__ import annotations

import sqlite3
import time
from pathlib import Path

import numpy as np
import pandas as pd

DB_PATH = Path("shopstream.db")
SCHEMA_FILE = Path("schema.sql")

# ─────────────────────────────────────────────────────────────────────────────
# HELPERS — Synthetic raw orders generator
# ─────────────────────────────────────────────────────────────────────────────


def _generate_raw_orders(n_orders: int = 50_000, seed: int = 42) -> pd.DataFrame:
    """Generate a synthetic ShopStream orders dataset."""
    rng = np.random.default_rng(seed)
    customers = [f"CUST_{i:06d}" for i in range(1, 5001)]
    products = [f"PROD_{i:04d}" for i in range(1, 501)]
    categories = {
        p: rng.choice(["Electronics", "Clothing", "Home", "Sports", "Food"])
        for p in products
    }
    brands = {p: rng.choice(["BrandA", "BrandB", "BrandC", "Generic"]) for p in products}
    channels = ["web", "mobile", "store", "marketplace"]
    regions = ["North", "South", "East", "West"]
    segments = ["Consumer", "Corporate", "Home Office"]

    chosen_products = rng.choice(products, size=n_orders)
    chosen_customers = rng.choice(customers, size=n_orders)

    revenue = np.clip(rng.lognormal(mean=5.0, sigma=0.8, size=n_orders), 5, 5000).round(2)
    cost = (revenue * rng.uniform(0.3, 0.7, size=n_orders)).round(2)
    discount = (revenue * rng.uniform(0, 0.2, size=n_orders)).round(2)

    return pd.DataFrame({
        "order_id": [f"ORD_{i:08d}" for i in range(n_orders)],
        "order_date": pd.to_datetime(
            rng.integers(
                pd.Timestamp("2020-01-01").value,
                pd.Timestamp("2026-12-31").value,
                size=n_orders,
            )
        ).strftime("%Y-%m-%d"),
        "product_id": chosen_products,
        "product_name": [f"Product {p}" for p in chosen_products],
        "category": [categories[p] for p in chosen_products],
        "subcategory": rng.choice(["Sub_A", "Sub_B", "Sub_C"], size=n_orders),
        "brand": [brands[p] for p in chosen_products],
        "unit_cost_usd": cost,
        "customer_id": chosen_customers,
        "customer_name": [f"Customer {c}" for c in chosen_customers],
        "region": [rng.choice(regions) for _ in range(n_orders)],
        "segment": [rng.choice(segments) for _ in range(n_orders)],
        "channel": rng.choice(channels, size=n_orders),
        "quantity": rng.integers(1, 10, size=n_orders),
        "revenue_usd": revenue,
        "cost_usd": cost,
        "discount_usd": discount,
        "is_returned": rng.integers(0, 2, size=n_orders),
    })


# ─────────────────────────────────────────────────────────────────────────────
# MILESTONE 3 — ETL Pipeline
# ─────────────────────────────────────────────────────────────────────────────


def setup_schema(conn: sqlite3.Connection) -> None:
    """Apply schema.sql to create tables if they don't exist."""
    conn.executescript(SCHEMA_FILE.read_text())
    conn.commit()


def extract(n_orders: int = 50_000) -> pd.DataFrame:
    """
    Extract: generate (or load) raw orders data.

    TODO (stretch):
    - Accept an optional csv_path argument.
    - If csv_path exists, use pd.read_csv(); otherwise call _generate_raw_orders().
    - Print the row count and shape.
    - Return the raw DataFrame.
    """
    print(f"  Generating {n_orders:,} synthetic orders...")
    raw = _generate_raw_orders(n_orders)
    print(f"  Extracted {len(raw):,} rows, {raw.shape[1]} columns")
    return raw


def transform(raw: pd.DataFrame) -> pd.DataFrame:
    """
    Transform raw orders into a clean, warehouse-ready DataFrame.

    TODO:
    1. Convert 'order_date' to datetime, then add 'date_key' as YYYYMMDD integer.
    2. Drop duplicate order_ids (keep first).
    3. Remove rows where revenue_usd <= 0.
    4. Add 'profit_usd' = revenue_usd - cost_usd - discount_usd (floor at 0).
    5. Standardise 'channel' to lowercase strip.
    6. Print: rows before/after dedup, rows removed for negative revenue.
    7. Return the cleaned DataFrame.

    Hints:
        df["date_key"] = pd.to_datetime(df["order_date"]).dt.strftime("%Y%m%d").astype(int)
        df = df.drop_duplicates(subset="order_id", keep="first")
    """
    df = raw.copy()

    # Your implementation here...
    raise NotImplementedError("Implement transform()")


def load_dimensions(df: pd.DataFrame, conn: sqlite3.Connection) -> None:
    """
    Upsert dimension tables from the transformed DataFrame.

    TODO:
    1. dim_date: build a full date spine from df["order_date"].min() to max().
       For each date compute: year, quarter, month, month_name, week,
       day_of_week, is_weekend, date_key.
       Insert with INSERT OR IGNORE into dim_date.
    2. dim_product: deduplicate on product_id, insert with INSERT OR IGNORE.
    3. dim_customer: deduplicate on customer_id, insert with INSERT OR IGNORE.
    4. dim_channel is pre-seeded in schema.sql — no action needed.

    Hints:
        dates = pd.date_range(df["order_date"].min(), df["order_date"].max())
        date_df = pd.DataFrame({"full_date": dates.strftime("%Y-%m-%d"), ...})
        date_df.to_sql("dim_date", conn, if_exists="append", index=False,
                       method="ignore")   # SQLite doesn't support ON CONFLICT in to_sql;
                       # use executemany with INSERT OR IGNORE instead.
    """
    # Your implementation here...
    raise NotImplementedError("Implement load_dimensions()")


def load_fact(df: pd.DataFrame, conn: sqlite3.Connection) -> int:
    """
    Insert transformed rows into fact_sales.

    TODO:
    1. Look up surrogate keys from dimensions:
       - product_key  : SELECT product_key FROM dim_product WHERE product_id = ?
       - customer_key : SELECT customer_key FROM dim_customer WHERE customer_id = ?
       - channel_key  : SELECT channel_key FROM dim_channel WHERE channel_name = ?
    2. Build fact rows with the correct surrogate keys.
    3. Insert into fact_sales (batch insert with to_sql or executemany).
    4. Commit and return the number of rows inserted.

    Hint for key lookup:
        key_map = pd.read_sql("SELECT product_id, product_key FROM dim_product", conn)
        df = df.merge(key_map, on="product_id", how="left")
    """
    # Your implementation here...
    raise NotImplementedError("Implement load_fact()")


def run_etl(n_orders: int = 50_000) -> None:
    """
    Orchestrate the full ETL pipeline: extract → transform → load.

    TODO:
    1. Open sqlite3 connection to DB_PATH.
    2. Call setup_schema(conn).
    3. Call extract(), transform(), load_dimensions(), load_fact() in order.
    4. Track total elapsed time with time.time().
    5. Print "✅ ETL complete — {n} fact rows loaded in {elapsed:.1f}s".
    6. Close the connection.
    """
    # Your implementation here...
    raise NotImplementedError("Implement run_etl()")


if __name__ == "__main__":
    print("=" * 55)
    print("  ShopStream Data Warehouse — ETL Pipeline")
    print("=" * 55)
    run_etl()
