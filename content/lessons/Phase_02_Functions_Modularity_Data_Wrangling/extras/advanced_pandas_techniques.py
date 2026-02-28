"""
Advanced Pandas Techniques — Phase 2 Extras
=============================================
Goes beyond Day 23-24 with power-user patterns every data wrangler needs.

Topics:
  1. MultiIndex — hierarchical indexing
  2. GroupBy + custom aggregations
  3. Pivot tables & cross-tabs
  4. Merge strategies (left / inner / outer / cross)
  5. .apply() vs vectorised ops (performance)
  6. Method chaining
  7. Window functions (rolling, expanding, ewm)

Run:
    python advanced_pandas_techniques.py
"""

import numpy as np
import pandas as pd

np.random.seed(42)

# ─── Helper: tiny sales dataset ─────────────────────────────────────────────

def make_sales() -> pd.DataFrame:
    """Build a small sales DataFrame for all examples below."""
    dates = pd.date_range("2024-01-01", periods=120, freq="D")
    products = ["Laptop", "Mouse", "Keyboard", "Monitor", "Headphones"]
    regions = ["North", "South", "East", "West"]
    rows = []
    for d in dates:
        for _ in range(np.random.randint(2, 6)):
            rows.append({
                "date": d,
                "product": np.random.choice(products),
                "region": np.random.choice(regions),
                "quantity": np.random.randint(1, 15),
                "unit_price": round(np.random.uniform(25, 1200), 2),
                "discount_pct": np.random.choice([0, 5, 10, 15, 20]),
            })
    df = pd.DataFrame(rows)
    df["revenue"] = (df["quantity"] * df["unit_price"]
                     * (1 - df["discount_pct"] / 100)).round(2)
    return df


# ═════════════════════════════════════════════════════════════════════════════
# 1. MultiIndex — Hierarchical Indexing
# ═════════════════════════════════════════════════════════════════════════════

def demo_multiindex(df: pd.DataFrame):
    """Create and slice a MultiIndex DataFrame."""
    print("\n" + "=" * 60)
    print("1. MULTIINDEX")
    print("=" * 60)

    # Group and set a 2-level index
    summary = (
        df.groupby(["region", "product"])["revenue"]
        .agg(["sum", "mean", "count"])
        .rename(columns={"sum": "total", "mean": "avg", "count": "orders"})
    )
    print("\n--- Hierarchical summary (first 10 rows) ---")
    print(summary.head(10))

    # xs — cross-section slicing (get a single level)
    print("\n--- Cross-section: region='North' ---")
    print(summary.xs("North", level="region"))

    # swaplevel + sort for alternate views
    swapped = summary.swaplevel().sort_index()
    print("\n--- Swapped levels (product → region), first 6 ---")
    print(swapped.head(6))


# ═════════════════════════════════════════════════════════════════════════════
# 2. GroupBy + Custom Aggregations
# ═════════════════════════════════════════════════════════════════════════════

def demo_groupby(df: pd.DataFrame):
    """Named aggregations, transform, and filter."""
    print("\n" + "=" * 60)
    print("2. GROUPBY + CUSTOM AGGREGATIONS")
    print("=" * 60)

    # Named aggregation (Pandas ≥ 0.25)
    agg = df.groupby("product").agg(
        total_revenue=("revenue", "sum"),
        avg_order=("revenue", "mean"),
        max_qty=("quantity", "max"),
        order_count=("quantity", "count"),
        discount_rate=("discount_pct", lambda x: (x > 0).mean()),
    )
    print("\n--- Named aggregation ---")
    print(agg.round(2))

    # transform — broadcast aggregation back to original shape
    df["pct_of_product_rev"] = (
        df["revenue"] / df.groupby("product")["revenue"].transform("sum") * 100
    ).round(2)
    print("\n--- transform: each row as % of its product's total ---")
    print(df[["product", "revenue", "pct_of_product_rev"]].head(8))

    # filter — keep only groups meeting a condition
    big_products = df.groupby("product").filter(lambda g: g["revenue"].sum() > 100_000)
    print(f"\n--- filter: products with >100K total revenue: "
          f"{big_products['product'].nunique()} products kept ---")


# ═════════════════════════════════════════════════════════════════════════════
# 3. Pivot Tables & Cross-Tabs
# ═════════════════════════════════════════════════════════════════════════════

def demo_pivot(df: pd.DataFrame):
    """Pivot table and crosstab examples."""
    print("\n" + "=" * 60)
    print("3. PIVOT TABLES & CROSS-TABS")
    print("=" * 60)

    # Monthly revenue pivot by region
    df_m = df.copy()
    df_m["month"] = df_m["date"].dt.to_period("M")

    pivot = pd.pivot_table(
        df_m,
        values="revenue",
        index="month",
        columns="region",
        aggfunc="sum",
        fill_value=0,
        margins=True,
        margins_name="Total",
    )
    print("\n--- Monthly revenue by region ---")
    print(pivot.round(0))

    # crosstab — count of discount tiers per product
    df_m["discount_tier"] = pd.cut(
        df_m["discount_pct"], bins=[-1, 0, 10, 20], labels=["None", "Low", "High"]
    )
    ct = pd.crosstab(df_m["product"], df_m["discount_tier"], normalize="index")
    print("\n--- Crosstab: discount distribution per product (%) ---")
    print((ct * 100).round(1))


# ═════════════════════════════════════════════════════════════════════════════
# 4. Merge Strategies
# ═════════════════════════════════════════════════════════════════════════════

def demo_merges():
    """Left / inner / outer / cross merges."""
    print("\n" + "=" * 60)
    print("4. MERGE STRATEGIES")
    print("=" * 60)

    orders = pd.DataFrame({
        "order_id": [1, 2, 3, 4, 5],
        "customer_id": [101, 102, 103, 104, 105],
        "amount": [250, 430, 120, 890, 75],
    })
    customers = pd.DataFrame({
        "customer_id": [101, 102, 103, 106],
        "name": ["Alice", "Bob", "Carol", "Dave"],
        "segment": ["premium", "standard", "premium", "enterprise"],
    })

    for how in ["inner", "left", "outer"]:
        merged = orders.merge(customers, on="customer_id", how=how)
        print(f"\n--- {how.upper()} merge ({len(merged)} rows) ---")
        print(merged)

    # Cross join — every order × every customer (use with care!)
    cross = orders.merge(customers, how="cross")
    print(f"\n--- CROSS merge: {len(orders)} × {len(customers)} = {len(cross)} rows ---")


# ═════════════════════════════════════════════════════════════════════════════
# 5. .apply() vs Vectorised Operations
# ═════════════════════════════════════════════════════════════════════════════

def demo_apply_vs_vectorised(df: pd.DataFrame):
    """Show why vectorised ops are 10-100× faster than apply."""
    print("\n" + "=" * 60)
    print("5. .apply() vs VECTORISED (performance)")
    print("=" * 60)

    import time

    n = len(df)

    # Slow: row-wise apply
    start = time.perf_counter()
    _ = df.apply(lambda row: row["quantity"] * row["unit_price"], axis=1)
    apply_ms = (time.perf_counter() - start) * 1000

    # Fast: vectorised
    start = time.perf_counter()
    _ = df["quantity"] * df["unit_price"]
    vec_ms = (time.perf_counter() - start) * 1000

    speedup = apply_ms / vec_ms if vec_ms > 0 else float("inf")
    print(f"  Rows: {n:,}")
    print(f"  apply(axis=1): {apply_ms:.1f} ms")
    print(f"  Vectorised:    {vec_ms:.2f} ms")
    print(f"  Speedup:       {speedup:.0f}×")
    print("\n  💡 Rule: Use vectorised ops whenever possible.")
    print("     Reserve .apply() for truly complex row-level logic.")


# ═════════════════════════════════════════════════════════════════════════════
# 6. Method Chaining
# ═════════════════════════════════════════════════════════════════════════════

def demo_chaining(df: pd.DataFrame):
    """Fluent Pandas pipelines via method chaining."""
    print("\n" + "=" * 60)
    print("6. METHOD CHAINING")
    print("=" * 60)

    result = (
        df
        .assign(month=lambda d: d["date"].dt.month)
        .query("discount_pct <= 10")
        .groupby(["month", "region"], as_index=False)
        .agg(total_revenue=("revenue", "sum"),
             avg_qty=("quantity", "mean"))
        .sort_values("total_revenue", ascending=False)
        .head(10)
        .reset_index(drop=True)
    )
    print("\n--- Top 10 month-region combos (low-discount orders only) ---")
    print(result.round(2))
    print("\n  💡 Chaining keeps transformations readable and auditable.")


# ═════════════════════════════════════════════════════════════════════════════
# 7. Window Functions (rolling, expanding, ewm)
# ═════════════════════════════════════════════════════════════════════════════

def demo_windows(df: pd.DataFrame):
    """Rolling averages, expanding sums, and exponential weighted means."""
    print("\n" + "=" * 60)
    print("7. WINDOW FUNCTIONS")
    print("=" * 60)

    daily = df.groupby("date")["revenue"].sum().reset_index()
    daily.columns = ["date", "daily_revenue"]

    # Rolling 7-day average
    daily["rolling_7d"] = daily["daily_revenue"].rolling(7).mean()

    # Expanding cumulative sum (YTD)
    daily["cum_revenue"] = daily["daily_revenue"].expanding().sum()

    # Exponentially weighted mean (smoothing)
    daily["ewm_7d"] = daily["daily_revenue"].ewm(span=7).mean()

    print("\n--- Daily revenue with windows (last 10 days) ---")
    print(daily.tail(10).round(2).to_string(index=False))
    print("\n  💡 rolling() = fixed window, expanding() = cumulative,")
    print("     ewm() = recent data weighted more → great for trends.")


# ═════════════════════════════════════════════════════════════════════════════
# MAIN
# ═════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    print("Advanced Pandas Techniques — Phase 2 Extras")
    print("=" * 60)

    df = make_sales()
    print(f"Dataset: {len(df):,} rows, {df['date'].nunique()} days\n")

    demo_multiindex(df)
    demo_groupby(df)
    demo_pivot(df)
    demo_merges()
    demo_apply_vs_vectorised(df)
    demo_chaining(df)
    demo_windows(df)

    print("\n" + "=" * 60)
    print("✅ All 7 techniques demonstrated!")
    print("Next: Try these on sample_sales.csv in this folder.")
    print("=" * 60)
