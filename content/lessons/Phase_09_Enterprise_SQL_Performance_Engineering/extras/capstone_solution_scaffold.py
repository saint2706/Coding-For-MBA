"""
Capstone Solution Scaffold — Retail Analytics Intelligence System.

This scaffold provides the skeleton for the Phase 9 curriculum capstone.
Students should fill in the TODO sections using skills from all 9 phases.

Reference: Day 108B (Curriculum Grand Finale Capstone)
"""

import sqlite3
from pathlib import Path

import numpy as np
import pandas as pd


# ═══════════════════════════════════════════════════════════════════════════════
# MILESTONE 1: Data Engineering Pipeline (Phases 1-3)
# ═══════════════════════════════════════════════════════════════════════════════


def generate_dataset(n_stores: int = 50, n_days: int = 365) -> pd.DataFrame:
    """Generate synthetic retail dataset for the capstone."""
    np.random.seed(42)

    stores = [f"STORE_{i:03d}" for i in range(1, n_stores + 1)]
    regions = {s: np.random.choice(["North", "South", "East", "West"]) for s in stores}
    categories = ["Electronics", "Clothing", "Food", "Home", "Sports"]

    records = []
    base_date = pd.Timestamp("2024-01-01")

    for day in range(n_days):
        date = base_date + pd.Timedelta(days=day)
        seasonal = 1.0 + 0.3 * np.sin((date.month - 1) * np.pi / 6)
        weekend = 1.4 if date.dayofweek >= 5 else 1.0

        for store in np.random.choice(stores, size=np.random.randint(30, n_stores), replace=False):
            for cat in np.random.choice(categories, size=np.random.randint(2, 4), replace=False):
                revenue = max(0, np.random.normal(15000, 4000) * seasonal * weekend)
                records.append({
                    "date": date.strftime("%Y-%m-%d"),
                    "store_id": store,
                    "region": regions[store],
                    "category": cat,
                    "revenue": round(revenue, 2),
                    "units_sold": int(revenue / np.random.uniform(50, 200)),
                    "returns": max(0, int(np.random.normal(revenue * 0.03, revenue * 0.01))),
                })

    return pd.DataFrame(records)


def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Clean raw retail data.

    TODO: Implement the following:
    1. Remove records where revenue is negative
    2. Cap outliers above the 99th percentile using .clip()
    3. Convert 'date' to datetime
    4. Add derived columns: year, month, quarter, day_of_week, is_weekend
    5. Validate no nulls in critical columns
    """
    df = df.copy()

    # Your implementation here...
    # Hint: df["revenue"] = df["revenue"].clip(upper=df["revenue"].quantile(0.99))
    # Hint: df["date"] = pd.to_datetime(df["date"])
    # Hint: df["is_weekend"] = df["date"].dt.dayofweek >= 5

    return df


def load_to_db(df: pd.DataFrame, db_path: str = "capstone.db"):
    """Load cleaned data to SQLite with performance indexes."""
    conn = sqlite3.connect(db_path)
    df.to_sql("sales", conn, if_exists="replace", index=False)
    conn.execute("CREATE INDEX IF NOT EXISTS idx_date ON sales(date)")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_store ON sales(store_id)")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_region ON sales(region)")
    conn.commit()
    conn.close()
    print(f"Loaded {len(df):,} records to {db_path}")


# ═══════════════════════════════════════════════════════════════════════════════
# MILESTONE 2: SQL Analytics (Phases 8-9)
# ═══════════════════════════════════════════════════════════════════════════════

SQL_QUERIES = {
    "monthly_revenue_by_region": """
        -- TODO: Write a CTE-based query showing monthly revenue by region
        -- with MoM growth percentage using LAG() window function
        SELECT 1
    """,
    "top_10_stores": """
        -- TODO: Top 10 stores by total revenue this year
        SELECT 1
    """,
    "bottom_5_per_region": """
        -- TODO: Bottom 5 stores per region using RANK() window function
        SELECT 1
    """,
    "category_share": """
        -- TODO: Category revenue share as percentage of total
        SELECT 1
    """,
    "weekend_vs_weekday": """
        -- TODO: Compare weekend vs weekday revenue patterns
        SELECT 1
    """,
}


# ═══════════════════════════════════════════════════════════════════════════════
# MILESTONE 3: ML Forecasting (Phases 4-5)
# ═══════════════════════════════════════════════════════════════════════════════


def build_forecast_model(df: pd.DataFrame) -> dict:
    """
    Build a demand forecasting model using GradientBoosting.

    TODO: Implement:
    1. Create time features (month, quarter, day_of_week, is_weekend)
    2. Create lag features (7, 14, 28 day lags)
    3. Create rolling mean (7-day average)
    4. Train with TimeSeriesSplit cross-validation
    5. Return model and MAPE scores

    Target: MAPE < 15%
    """
    # Your implementation here...
    return {"model": None, "mape_scores": [], "mean_mape": 0.0}


# ═══════════════════════════════════════════════════════════════════════════════
# MILESTONE 4: Anomaly Detection (Phase 5-6)
# ═══════════════════════════════════════════════════════════════════════════════


def detect_anomalies(db_path: str = "capstone.db") -> pd.DataFrame:
    """
    Detect anomalous stores using Isolation Forest.

    TODO: Implement:
    1. Aggregate store-level features (avg revenue, std, return rate)
    2. Normalize with StandardScaler
    3. Fit IsolationForest(contamination=0.1)
    4. Return stores flagged as anomalous
    """
    # Your implementation here...
    return pd.DataFrame()


# ═══════════════════════════════════════════════════════════════════════════════
# MILESTONE 5: Dashboard (Phase 3)
# ═══════════════════════════════════════════════════════════════════════════════


def build_dashboard():
    """
    TODO: Create a 4-panel matplotlib dashboard:
    1. Revenue trend by region (line chart)
    2. Top 10 stores (horizontal bar chart)
    3. 30-day forecast with confidence interval
    4. Anomaly scatter plot (normal=blue, anomaly=red)

    Save to: capstone_dashboard.png
    """
    pass


# ═══════════════════════════════════════════════════════════════════════════════
# MAIN — Run the full pipeline
# ═══════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    print("=" * 60)
    print("Capstone: Retail Analytics Intelligence System")
    print("=" * 60)

    # Step 1: Generate and clean data
    print("\n[1/5] Generating dataset...")
    raw_df = generate_dataset()
    print(f"  Generated {len(raw_df):,} records")

    print("\n[2/5] Cleaning data...")
    clean_df = clean_data(raw_df)
    load_to_db(clean_df)

    # Step 3: Run SQL KPIs
    print("\n[3/5] Running SQL analytics...")
    # TODO: Execute SQL_QUERIES and print results

    # Step 4: Build ML model
    print("\n[4/5] Training forecast model...")
    results = build_forecast_model(clean_df)
    print(f"  Mean MAPE: {results['mean_mape']:.1f}%")

    # Step 5: Anomaly detection + dashboard
    print("\n[5/5] Detecting anomalies & building dashboard...")
    anomalies = detect_anomalies()
    build_dashboard()

    print("\n✅ Capstone pipeline complete!")
    print("Next: Fill in the TODO sections, then push to GitHub.")
