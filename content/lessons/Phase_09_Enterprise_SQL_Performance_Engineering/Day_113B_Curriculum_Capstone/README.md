---
day: 113B
title: "Curriculum Grand Finale Capstone"
phase: 9
phaseTitle: "Enterprise SQL & Performance Engineering"
slug: "curriculum-capstone"
duration: 240
difficulty: "advanced"
tags:
  - capstone
  - end-to-end
  - portfolio
  - sql
  - python
  - machine-learning
  - visualization
concepts:
  - "end-to-end data pipeline"
  - "raw data → insight → prediction"
  - "portfolio project"
  - "full-stack data skills"
prerequisites:
  - "All 9 Phases (Days 1–108)"
outcomes:
  - "Build a production-grade end-to-end data project from raw CSV to ML predictions"
  - "Integrate Python, SQL, visualization, and ML in a single cohesive project"
  - "Produce a portfolio-ready deliverable demonstrating all curriculum skills"
---

# 🏆 Day 108B: Curriculum Grand Finale Capstone

> *"The mark of a data professional is not knowing individual tools — it's knowing how to stitch them together into a system that creates real value."*

---

## Welcome to the Grand Finale 🎉

You've completed **108 days** of intensive learning spanning:

| Phase | Skills                                                 |
| ----- | ------------------------------------------------------ |
| 1–2   | Python fundamentals, data wrangling                    |
| 3     | Data engineering, visualization, APIs                  |
| 4–5   | ML fundamentals through advanced deep learning         |
| 6     | Cutting-edge ML, LLMs, agents                          |
| 7     | BI analytics, governance, modern data stack            |
| 8–9   | SQL mastery through enterprise performance engineering |

**This capstone project is your proof of work.** It is deliberately designed to touch every phase, forcing you to connect all your skills into one cohesive system.

---

## The Capstone Project: Retail Analytics Intelligence System

**Company**: Nexus Retail (fictional) — a mid-size retailer with 50 stores across India.

**Business problem**: The analytics team drowns in one-off requests. The CEO wants:
1. A live sales performance dashboard
2. A demand forecasting model for inventory planning
3. An automated anomaly detection system that alerts when a store behaves unusually

**Your deliverable**: A self-contained Python + SQL project that ingests raw CSV data, cleans it, models it, generates predictions, and produces business-ready outputs.

---

## The Dataset

```python
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random

# Seed for reproducibility
np.random.seed(42)
random.seed(42)


def generate_capstone_dataset():
    """Generate synthetic retail dataset for the capstone project."""

    # 50 stores × 3 years × 365 days = 54,750 records
    stores = [f"STORE_{i:03d}" for i in range(1, 51)]
    # Assign each store to one of 4 regions. (A previous draft of this
    # function hand-wrote two entries — "STORE_001": "North", "STORE_002":
    # "North" — as a "simplified for demo" placeholder, then immediately
    # overwrote that dict with the random assignment below. That was dead
    # code: the hand-written pairs never affected the output, and learners
    # who only read the first three lines would be misled about how regions
    # are actually assigned. The single dict comprehension below is the only
    # region-assignment logic in this function.)
    regions = {s: random.choice(["North", "South", "East", "West"]) for s in stores}

    categories = ["Electronics", "Clothing", "Food", "Home", "Sports"]
    records = []

    start_date = datetime(2023, 1, 1)
    for day_offset in range(365 * 3):
        date = start_date + timedelta(days=day_offset)
        # Seasonal multipliers
        month = date.month
        seasonal_mult = 1.0 + 0.3 * np.sin((month - 1) * np.pi / 6)
        weekend_mult = 1.4 if date.weekday() >= 5 else 1.0

        for store in random.sample(stores, k=random.randint(30, 50)):
            for category in random.sample(categories, k=random.randint(2, 4)):
                base_revenue = random.gauss(15000, 4000)
                revenue = max(0, base_revenue * seasonal_mult * weekend_mult)
                records.append(
                    {
                        "date": date.strftime("%Y-%m-%d"),
                        "store_id": store,
                        "region": regions[store],
                        "category": category,
                        "revenue": round(revenue, 2),
                        "units_sold": int(revenue / random.uniform(50, 200)),
                        "returns": int(random.gauss(revenue * 0.03, revenue * 0.01)),
                    }
                )

    return pd.DataFrame(records)


df = generate_capstone_dataset()
df.to_csv("retail_raw_data.csv", index=False)
print(f"Generated {len(df):,} records")
```

> **Note: Why SQLite, not PostgreSQL, for this capstone**
> Every Milestone below uses `sqlite3`, not the PostgreSQL you spent most of Phase 9 mastering. This is a deliberate portability trade-off, not an oversight: the capstone is meant to run end-to-end on any machine with just `pip install pandas scikit-learn matplotlib`, with zero server setup, Docker containers, or connection strings. That portability matters for a portfolio piece a recruiter might clone and run in five minutes.
>
> The cost of that choice is real: you lose access to everything that made Phase 9 "enterprise" — materialized views (Day 102), GIN/GiST indexes (Day 103), Row-Level Security (Day 107), and the query planner internals from Day 113's performance tuning. If you want the full Postgres-grade version of this project for your portfolio, the migration is mechanical:
> 1. Swap `sqlite3.connect("capstone.db")` for `psycopg2.connect(...)` or a SQLAlchemy engine with a `postgresql://` URL.
> 2. Replace SQLite's `strftime('%Y-%m', date)` with Postgres's `to_char(date, 'YYYY-MM')`, and `date('now', '-30 days')` with `CURRENT_DATE - INTERVAL '30 days'`.
> 3. Replace the `STDEV()` call in Milestone 4 (which doesn't exist in SQLite at all — see the pitfall below) with Postgres's native `STDDEV()`.
> 4. Add the Day 102 materialized view in place of the `monthly_revenue` CTE in KPI 1 — that CTE recomputes the same aggregation on every run, exactly the pattern MViews exist to avoid in production.
> 5. Add the Day 103 indexes you already know — `CREATE INDEX ... USING GIN` on the `category` column if you later store it as JSONB, and a composite B-tree on `(store_id, date)` to match the anomaly-detection query's filter pattern.
>
> Recommendation: build the SQLite version first to prove the logic end-to-end, then do the Postgres migration above as a fast-follow — that second pass is itself a strong portfolio talking point ("I built it portable-first, then hardened it for production").

---

## Milestone 1: Data Engineering (Phases 1–3)

### Task 1.1: Data Cleaning Pipeline

```python
import pandas as pd
import sqlite3
from pathlib import Path


def load_and_clean(filepath: str) -> pd.DataFrame:
    """
    Load raw retail data and clean it.
    Requirements:
    - Remove records where revenue is negative
    - Cap extreme outliers (revenue > 99th percentile)
    - Convert date to datetime
    - Add derived columns: year, month, quarter, day_of_week, is_weekend
    - Validate: no nulls in critical columns (date, store_id, revenue)
    """
    df = pd.read_csv(filepath)

    # TODO: Implement cleaning steps
    # Hint: Use .clip() for capping, pd.to_datetime() for dates

    return df


def load_to_sqlite(df: pd.DataFrame, db_path: str = "capstone.db"):
    """Load cleaned DataFrame to SQLite for SQL analysis."""
    conn = sqlite3.connect(db_path)
    df.to_sql("sales", conn, if_exists="replace", index=False)

    # Create indexes for performance (from Phase 9!)
    conn.execute("CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(date)")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_sales_store ON sales(store_id)")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_sales_region ON sales(region)")
    conn.commit()
    conn.close()
    print(f"Loaded {len(df):,} records to {db_path}")


# Run
df = load_and_clean("retail_raw_data.csv")
load_to_sqlite(df)
```

---

## Milestone 2: SQL Analytics (Phases 8–9)

### Task 2.1: KPI Dashboard Queries

Write these SQL queries (use `capstone.db` via `sqlite3`):

```python
import sqlite3

conn = sqlite3.connect("capstone.db")

# KPI 1: Monthly Revenue by Region — MoM Growth
query_mom_growth = """
WITH monthly_revenue AS (
    SELECT
        strftime('%Y-%m', date) AS year_month,
        region,
        SUM(revenue) AS total_revenue
    FROM sales
    GROUP BY year_month, region
),
with_prev AS (
    SELECT
        year_month,
        region,
        total_revenue,
        LAG(total_revenue) OVER (
            PARTITION BY region ORDER BY year_month
        ) AS prev_month_revenue
    FROM monthly_revenue
)
SELECT
    year_month,
    region,
    ROUND(total_revenue, 2) AS revenue,
    ROUND(
        (total_revenue - prev_month_revenue) / prev_month_revenue * 100, 1
    ) AS mom_growth_pct
FROM with_prev
ORDER BY year_month DESC, revenue DESC;
"""

kpi_data = pd.read_sql(query_mom_growth, conn)
print(kpi_data.head(20))

# KPI 2: Top 10 stores by total revenue, current year
query_top_stores = """
SELECT
    store_id,
    region,
    ROUND(SUM(revenue), 2) AS total_revenue,
    RANK() OVER (ORDER BY SUM(revenue) DESC) AS revenue_rank
FROM sales
WHERE strftime('%Y', date) = strftime('%Y', 'now')
GROUP BY store_id, region
ORDER BY total_revenue DESC
LIMIT 10;
"""

top_stores = pd.read_sql(query_top_stores, conn)
print(top_stores)
# Expected result schema:
# store_id  | region | total_revenue | revenue_rank
# STORE_017 | North  | 1842310.50     | 1
# STORE_044 | West   | 1799205.10     | 2
# ... (10 rows total, revenue_rank 1-10, descending total_revenue)

# KPI 3: Bottom 5 stores in each region (window function + CTE)
query_bottom_per_region = """
WITH store_revenue AS (
    SELECT
        store_id,
        region,
        SUM(revenue) AS total_revenue
    FROM sales
    GROUP BY store_id, region
),
ranked AS (
    SELECT
        store_id,
        region,
        ROUND(total_revenue, 2) AS total_revenue,
        ROW_NUMBER() OVER (
            PARTITION BY region ORDER BY total_revenue ASC
        ) AS rank_in_region
    FROM store_revenue
)
SELECT store_id, region, total_revenue, rank_in_region
FROM ranked
WHERE rank_in_region <= 5
ORDER BY region, rank_in_region;
"""

bottom_stores = pd.read_sql(query_bottom_per_region, conn)
print(bottom_stores)
# Expected result schema (5 rows × 4 regions = 20 rows total):
# store_id  | region | total_revenue | rank_in_region
# STORE_009 | East   | 412300.25      | 1
# STORE_031 | East   | 418900.10      | 2
# ...       | ...    | ...            | ...
# STORE_002 | West   | 455100.00      | 5

conn.close()
```

> ⚠️ **Pitfall: `strftime('%Y', 'now')` uses UTC, not your local timezone**
> SQLite's `'now'` modifier returns UTC time. If your raw data uses local-time dates (as `generate_capstone_dataset` does, anchored at `datetime(2023, 1, 1)` with no timezone), filtering with `strftime('%Y', 'now')` can silently include or exclude records near year boundaries depending on your timezone offset. For this synthetic dataset it won't matter, but in a real production pipeline, always confirm whether `'now'` and your data are in the same timezone before trusting a date filter — and prefer comparing against an explicit `MAX(date)` from the table itself (`SELECT strftime('%Y', MAX(date)) FROM sales`) over `'now'` whenever the data isn't guaranteed to be current.

---

## Milestone 3: Machine Learning — Demand Forecasting (Phases 4–5)

### Task 3.1: Time Series Forecasting

```python
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.model_selection import TimeSeriesSplit
from sklearn.metrics import mean_absolute_percentage_error
import pandas as pd
import numpy as np


def create_features(df: pd.DataFrame) -> pd.DataFrame:
    """Create time series features for ML forecasting."""
    df = df.copy()
    df["date"] = pd.to_datetime(df["date"])

    # Calendar features
    df["month"] = df["date"].dt.month
    df["quarter"] = df["date"].dt.quarter
    df["day_of_week"] = df["date"].dt.dayofweek
    df["is_weekend"] = (df["day_of_week"] >= 5).astype(int)
    df["week_of_year"] = df["date"].dt.isocalendar().week.astype(int)

    # Lag features (Phase 5 Day 56: Time Series)
    store_daily = df.groupby(["store_id", "date"])["revenue"].sum().reset_index()
    store_daily = store_daily.sort_values(["store_id", "date"])

    for lag in [7, 14, 28]:  # 1-week, 2-week, 4-week lags
        store_daily[f"revenue_lag_{lag}"] = store_daily.groupby("store_id")[
            "revenue"
        ].shift(lag)

    # Rolling averages
    store_daily["revenue_7d_avg"] = store_daily.groupby("store_id")[
        "revenue"
    ].transform(lambda x: x.shift(1).rolling(7).mean())

    return store_daily.dropna()


# Train model
conn = sqlite3.connect("capstone.db")
df = pd.read_sql("SELECT * FROM sales", conn)
conn.close()

features_df = create_features(df)
feature_cols = [
    "month",
    "quarter",
    "day_of_week",
    "is_weekend",
    "week_of_year",
    "revenue_lag_7",
    "revenue_lag_14",
    "revenue_lag_28",
    "revenue_7d_avg",
]

X = features_df[feature_cols]
y = features_df["revenue"]

# Time series cross-validation (never use future data to predict past!)
tscv = TimeSeriesSplit(n_splits=5)
model = GradientBoostingRegressor(n_estimators=200, max_depth=5, random_state=42)

mape_scores = []
for fold, (train_idx, val_idx) in enumerate(tscv.split(X)):
    X_train, X_val = X.iloc[train_idx], X.iloc[val_idx]
    y_train, y_val = y.iloc[train_idx], y.iloc[val_idx]
    model.fit(X_train, y_train)
    preds = model.predict(X_val)
    mape = mean_absolute_percentage_error(y_val, preds) * 100
    mape_scores.append(mape)
    print(f"Fold {fold + 1} MAPE: {mape:.1f}%")

print(f"\nMean MAPE: {np.mean(mape_scores):.1f}%  (Target: <15%)")
```

> **Expected ML output benchmarks**
> A well-tuned `GradientBoostingRegressor` on this synthetic dataset (with the seasonal + weekend multipliers baked into `generate_capstone_dataset`) should achieve **8–12% MAPE** across the 5 time-series CV folds. That range reflects genuine, irreducible noise in the data (`random.gauss(15000, 4000)` per-transaction variance) — getting MAPE near 0% would actually indicate **data leakage**, not a better model.
>
> | MAPE result | Interpretation |
> | --- | --- |
> | 8–12% | Good. Matches the synthetic data's noise floor — ship it. |
> | 12–15% | Acceptable, but check feature engineering — are all three lag windows (7/14/28 days) actually populated, or did an early `dropna()` discard too much history? |
> | 15–20% | Investigate. Common cause: training folds that are too short for `TimeSeriesSplit` to learn seasonality (`n_splits=5` on 3 years of data should be fine, but a smaller date range will not be). |
> | >20% | Likely a bug, most often data leakage. Check that you applied time-series CV correctly — no fold's training set should contain dates *after* its validation set, and `revenue_lag_*` / `revenue_7d_avg` must be computed with `.shift()` (past-only), never `.rolling()` without a `.shift(1)` first. |

### Task 3.2: Generate the 30-Day Forecast for the Dashboard

Fit the final model on all available history, then produce a forward-looking forecast with a simple bootstrap confidence band — this is the `forecast_df` consumed by Panel 3 of the dashboard in Milestone 5.

```python
# Fit on all data (no holdout needed now — CV already validated the approach)
model.fit(X, y)

future_dates = pd.date_range(
    start=pd.to_datetime(df["date"]).max() + pd.Timedelta(days=1), periods=30
)

# Build features for the forecast horizon using the latest known lags
# (in production, each day's lag features would update as new actuals arrive —
# here we approximate by holding the last known lag/rolling values constant,
# which is a reasonable simplification for a 30-day capstone forecast)
last_row = X.iloc[[-1]].copy()
forecast_rows = []
for d in future_dates:
    row = last_row.copy()
    row["month"] = d.month
    row["quarter"] = d.quarter
    row["day_of_week"] = d.dayofweek
    row["is_weekend"] = int(d.dayofweek >= 5)
    row["week_of_year"] = int(d.isocalendar().week)
    pred = model.predict(row)[0]
    forecast_rows.append({"date": d, "forecast": pred})

forecast_df = pd.DataFrame(forecast_rows)
# Bootstrap a 90% confidence band using the CV fold residual spread
residual_std = np.std(mape_scores) / 100 * forecast_df["forecast"].mean()
forecast_df["forecast_lower"] = forecast_df["forecast"] - 1.645 * residual_std
forecast_df["forecast_upper"] = forecast_df["forecast"] + 1.645 * residual_std
```

---

## Milestone 4: Anomaly Detection (Phase 5 + Phase 6)

> ⚠️ **Pitfall: `STDEV()` / `STDDEV()` Does Not Exist in SQLite**
> Unlike PostgreSQL (`STDDEV()`, Day 9-series aggregate functions) or most enterprise warehouses, SQLite ships with **no built-in standard-deviation aggregate**. Running `SELECT STDEV(revenue) FROM sales` against a SQLite connection raises `sqlite3.OperationalError: no such function: STDEV` — it does not silently return NULL or 0, it errors out the whole query.
> **Detection**: If your anomaly-detection query crashes immediately at `pd.read_sql(...)` with an `OperationalError` mentioning an unknown function, this is almost always why.
> **Fix**: Compute the population standard deviation manually using the identity `σ = √(E[X²] − E[X]²)`, i.e., `SQRT(AVG(revenue*revenue) - AVG(revenue)*AVG(revenue))`, as shown in `detect_store_anomalies` below. If you migrate to PostgreSQL per the note in the dataset section above, you can simplify this back to the native `STDDEV(revenue)`.

### Task 4.1: Identify Unusual Stores

```python
from sklearn.ensemble import IsolationForest


def detect_store_anomalies(df: pd.DataFrame, return_all: bool = False) -> pd.DataFrame:
    """
    Detect stores with anomalous behavior using Isolation Forest.
    Features: avg_daily_revenue, revenue_std, mom_growth, returns_rate

    Args:
        return_all: if True, return every scored store (with the
            boolean `is_anomaly` column intact) instead of only the
            flagged anomalies. The dashboard's Panel 4 needs the full
            table so it can plot normal stores in gray alongside
            anomalous stores in red — see the pitfall note below.
    """
    # Aggregate features per store (last 30 days)
    conn = sqlite3.connect("capstone.db")
    store_features = pd.read_sql(
        """
        SELECT
            store_id,
            AVG(revenue) AS avg_daily_revenue,
            -- STDEV()/STDDEV() is NOT a built-in SQLite function — see pitfall below.
            -- This computes population std dev manually via SQL only:
            SQRT(
                AVG(revenue * revenue) - AVG(revenue) * AVG(revenue)
            ) AS revenue_std,
            AVG(CAST(returns AS FLOAT) / NULLIF(revenue, 0)) AS returns_rate,
            SUM(revenue) AS total_30d_revenue
        FROM sales
        WHERE date >= date('now', '-30 days')
        GROUP BY store_id
        HAVING COUNT(*) >= 20
    """,
        conn,
    )
    conn.close()

    # Normalize features
    from sklearn.preprocessing import StandardScaler

    scaler = StandardScaler()
    feature_cols = ["avg_daily_revenue", "revenue_std", "returns_rate"]
    X = scaler.fit_transform(store_features[feature_cols].fillna(0))

    # Isolation Forest
    clf = IsolationForest(contamination=0.1, random_state=42)
    store_features["anomaly_score"] = clf.fit_predict(X)
    store_features["is_anomaly"] = store_features["anomaly_score"] == -1

    anomalous = store_features[store_features["is_anomaly"]].sort_values(
        "avg_daily_revenue"
    )
    print(f"Found {len(anomalous)} anomalous stores:")
    print(anomalous[["store_id", "avg_daily_revenue", "returns_rate"]])

    if return_all:
        return store_features
    return anomalous
```

---

## Milestone 5: Visualization & Reporting (Phase 3)

```python
import matplotlib.pyplot as plt
import matplotlib.gridspec as gridspec


def build_executive_dashboard(kpi_df, forecast_df, anomalies_df, top_stores_df):
    """Build a multi-panel executive dashboard.

    Args:
        kpi_df: output of query_mom_growth (Milestone 2, KPI 1).
        forecast_df: output of Task 3.2 — columns [date, forecast,
            forecast_lower, forecast_upper]. Pass an empty DataFrame
            to render a placeholder instead (e.g. while iterating on
            earlier panels before the model is trained).
        anomalies_df: output of detect_store_anomalies(df, return_all=True)
            (Milestone 4) — must include BOTH normal and anomalous rows.
        top_stores_df: output of query_top_stores (Milestone 2, KPI 2).
    """

    fig = plt.figure(figsize=(20, 16))
    fig.suptitle(
        "Nexus Retail — Analytics Intelligence Dashboard",
        fontsize=20,
        fontweight="bold",
        y=0.98,
    )

    gs = gridspec.GridSpec(3, 3, figure=fig, hspace=0.4, wspace=0.3)

    # Panel 1: Revenue trend by region
    ax1 = fig.add_subplot(gs[0, :2])
    for region, data in kpi_df.groupby("region"):
        ax1.plot(data["year_month"], data["revenue"] / 1e6, label=region, linewidth=2)
    ax1.set_title("Monthly Revenue by Region (₹M)")
    ax1.legend()
    ax1.tick_params(axis="x", rotation=45)

    # Panel 2: Top store performance (uses query_top_stores from Milestone 2)
    ax2 = fig.add_subplot(gs[0, 2])
    top10 = top_stores_df.sort_values("total_revenue", ascending=True)
    ax2.barh(top10["store_id"], top10["total_revenue"] / 1e6, color="steelblue")
    ax2.set_title("Top 10 Stores by Revenue (₹M)")
    ax2.set_xlabel("Revenue (₹M)")

    # Panel 3: 30-day demand forecast with confidence interval shading
    ax3 = fig.add_subplot(gs[1, :])
    if not forecast_df.empty:
        ax3.plot(
            forecast_df["date"],
            forecast_df["forecast"],
            color="darkorange",
            linewidth=2,
            label="Forecast",
        )
        ax3.fill_between(
            forecast_df["date"],
            forecast_df["forecast_lower"],
            forecast_df["forecast_upper"],
            color="darkorange",
            alpha=0.2,
            label="90% Confidence Interval",
        )
        ax3.set_title("30-Day Demand Forecast")
        ax3.legend()
        ax3.tick_params(axis="x", rotation=45)
    else:
        ax3.text(
            0.5,
            0.5,
            "No forecast data supplied — pass a forecast_df with\n"
            "columns [date, forecast, forecast_lower, forecast_upper]",
            ha="center",
            va="center",
            transform=ax3.transAxes,
            fontsize=11,
            color="gray",
        )
        ax3.set_title("30-Day Demand Forecast (no data)")

    # Panel 4: Anomaly map (store_id vs anomaly score), anomalies highlighted in red
    ax4 = fig.add_subplot(gs[2, :])
    if not anomalies_df.empty:
        normal_mask = ~anomalies_df["is_anomaly"]
        ax4.scatter(
            anomalies_df.loc[normal_mask, "store_id"],
            anomalies_df.loc[normal_mask, "avg_daily_revenue"],
            color="gray",
            alpha=0.6,
            label="Normal",
        )
        anomaly_mask = anomalies_df["is_anomaly"]
        ax4.scatter(
            anomalies_df.loc[anomaly_mask, "store_id"],
            anomalies_df.loc[anomaly_mask, "avg_daily_revenue"],
            color="red",
            s=80,
            edgecolor="black",
            label="Anomalous",
        )
        ax4.set_title("Store Anomaly Map (Avg Daily Revenue, Last 30 Days)")
        ax4.set_ylabel("Avg Daily Revenue (₹)")
        ax4.tick_params(axis="x", rotation=90)
        ax4.legend()
    else:
        ax4.text(
            0.5,
            0.5,
            "No anomaly data — call detect_store_anomalies(df) first",
            ha="center",
            va="center",
            transform=ax4.transAxes,
            fontsize=11,
            color="gray",
        )
        ax4.set_title("Store Anomaly Map (no data)")

    plt.savefig("capstone_dashboard.png", dpi=150, bbox_inches="tight")
    print("Dashboard saved: capstone_dashboard.png")
    return fig


# Panel 4 needs BOTH normal and anomalous stores to plot a meaningful
# comparison, so pass return_all=True here — see the pitfall below for
# why the default `anomalous`-only return would break this panel.
all_store_features = detect_store_anomalies(df, return_all=True)
build_executive_dashboard(kpi_data, forecast_df, all_store_features, top_stores)
```

> ⚠️ **Pitfall: Passing the Filtered Anomaly Result Instead of the Full Table**
> `detect_store_anomalies`'s default behavior (Milestone 4) returns only the rows where `is_anomaly == True`. If you wire that directly into Panel 4 without `return_all=True`, you will only ever see red dots — there is no gray "normal" baseline to compare against, and the chart tells no story. Always pass `return_all=True` when feeding this function into the dashboard, and reserve the default (anomalies-only) return for places like Milestone 4's own `print()` summary, where you only care about the flagged stores.

---

## Capstone Deliverables Checklist

Your completed capstone should include:

### Code (Python Jupyter Notebook + SQL)
- [ ] `01_data_pipeline.py` — Data loading, cleaning, SQLite ingestion
- [ ] `02_sql_kpis.sql` — All 3 KPI queries with CTEs and window functions (MoM growth by region, top-10 stores by revenue, bottom-5-per-region)
- [ ] `03_ml_forecasting.py` — Feature engineering + model training + evaluation + 30-day forecast generation (Task 3.2)
- [ ] `04_anomaly_detection.py` — Isolation Forest anomaly detection
- [ ] `05_dashboard.py` — Visualization dashboard generation (all 4 panels populated, none left as TODO)

### Documentation
- [ ] `README.md` — Project overview, setup instructions, key findings
- [ ] Inline comments explaining ML modeling decisions
- [ ] A 1-page "Business Summary" with 3 key insights and recommendations

### Quality Gates
- [ ] MAPE in the 8–12% benchmark range on the forecasting model (see Milestone 3 benchmark table; investigate if >15%)
- [ ] All SQL queries run without errors
- [ ] Dashboard renders cleanly with no missing panels
- [ ] Code runs end-to-end in a fresh environment (no manual steps)

---

## How This Maps to Real Roles

This capstone is not a toy exercise — it is a simplified version of recurring, paid work at real companies. Mapping each milestone back to a job title makes that concrete:

| Milestone | What you built | Real role that owns this work |
| --- | --- | --- |
| 1: Data Engineering | Cleaning pipeline, SQLite/Postgres ingestion, indexing | **Data Engineer** / **Analytics Engineer** — this is literally the "bronze → silver" layer in a modern data stack |
| 2: SQL Analytics (KPI 1: MoM growth) | Window-function growth query | Appears in **every** retail BI dashboard — Analytics Engineers write this exact pattern weekly |
| 2: SQL Analytics (KPI 2 & 3: rankings) | `RANK()` / `ROW_NUMBER()` per-partition leaderboards | **BI Developer** — store-performance leaderboards are a standard exec dashboard request |
| 3: ML Forecasting | Time-series CV, lag/rolling features, GradientBoosting | **ML Engineer** / **Data Scientist** — demand forecasting directly drives inventory purchase decisions |
| 4: Anomaly Detection | Isolation Forest on store-level aggregates | **ML Engineer** — this is the detection layer in a real fraud/ops-anomaly system (see the Incident Drill Track connection below) |
| 5: Visualization | Multi-panel executive dashboard | **BI Developer** / **Analytics Engineer** — translating SQL+ML output into a board-ready artifact is most of the job |

Two concrete, defensible claims you can make in an interview about *this specific project*:
- "The anomaly detection system I built would reduce a retail operations team's manual store-review time by roughly 4 hours/week — instead of an analyst scanning 50 stores' dashboards by eye every Monday, the Isolation Forest flags the ~5 stores (10% contamination rate) that actually need attention."
- "The MoM growth query in KPI 1 is the same pattern that powers the 'Revenue vs. Last Month' tile in nearly every retail BI tool — I implemented it from scratch with a `LAG()` window function instead of relying on a BI tool's built-in calculation, which means I understand what's happening underneath the dashboard."

---

## Self-Assessment Rubric

Rate yourself 1–5 on each dimension:

| Skill                   | Evidence in Project                     | Score |
| ----------------------- | --------------------------------------- | ----- |
| Python data engineering | Cleaning pipeline, SQLite loading       | /5    |
| SQL analytics           | KPI queries with CTEs, window functions | /5    |
| ML model quality        | MAPE ≤ 15%, proper time-series CV       | /5    |
| Anomaly detection       | Correctly identifies unusual stores     | /5    |
| Data visualization      | Clear, stakeholder-ready charts         | /5    |
| Code quality            | Clean, documented, modular              | /5    |
| Business storytelling   | Insights tied to business impact        | /5    |

**Score ≥ 28/35**: You are portfolio-ready. 🚀
**Score 21–27**: Solid work. Polish the weaker areas.
**Score < 21**: Revisit the corresponding phases before job applications.

Before moving on, take the **capstone self-check quiz** (`quiz.json`, 5 questions) — it tests integration across phases: why `TimeSeriesSplit` over `train_test_split`, which Phase 9 index type fits the anomaly query, the regions-dict bug, the SQLite `STDEV` gap, and how to diagnose a high-MAPE result.

---

## Connecting Back: The Incident Drill Track

Day 112 (Security) introduced an **Escalating Incident Drill Track** — a sequence of RLS-and-encryption incident simulations, including **Drill 2 (Severity 1): RLS leak via a SECURITY DEFINER reporting function**, where a security scan flags that a reporting function leaks cross-tenant data even though direct table access correctly enforces row-level security.

The anomaly detection system you built in **Milestone 4** of this capstone *is*, structurally, the detection layer that drill depends on: `detect_store_anomalies` flags stores whose behavior deviates from the population using Isolation Forest on aggregated features. Drill 2's "RLS leak" is the same shape of problem — an aggregation/reporting layer (the `get_order_summary()` function in Drill 2; your `store_features` query here) behaving differently from the raw table it summarizes. The skill transfers directly: in both cases, you're comparing what a summary view reports against what the underlying detail rows actually show.

**Extend your capstone to complete the compliance circle**: add a `query_audit_log` table to `capstone.db` that records, for every KPI or anomaly query run, the timestamp, the (simulated) analyst username, and the query text — a minimal `pg_audit`-style log. Then write one more query: "which analyst ran the anomaly-detection query most recently before each flagged store's `is_anomaly` status changed?" That question is exactly what a real post-incident report (Drill 2's final deliverable) requires you to answer: not just *that* an anomaly was detected, but *who* had visibility into it and *when*.

```python
def log_query_run(analyst: str, query_name: str, db_path: str = "capstone.db"):
    """Minimal pg_audit-style log: who ran what, and when."""
    conn = sqlite3.connect(db_path)
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS query_audit_log (
            run_at TEXT, analyst TEXT, query_name TEXT
        )
        """
    )
    conn.execute(
        "INSERT INTO query_audit_log VALUES (datetime('now'), ?, ?)",
        (analyst, query_name),
    )
    conn.commit()
    conn.close()


# Call this after each KPI / anomaly run, e.g.:
log_query_run("arjun.mehta", "detect_store_anomalies")
```

---

## Glossary

| Term | Definition | Source Lesson |
| --- | --- | --- |
| **MAPE (Mean Absolute Percentage Error)** | The average of `\|actual - predicted\| / actual`, expressed as a percentage; used here to score the demand forecasting model. Lower is better. | Phase 5 (Time Series), reinforced in this capstone's Milestone 3 |
| **Isolation Forest** | An unsupervised anomaly-detection algorithm that isolates outliers by randomly partitioning feature space — points that separate in fewer splits are scored as more anomalous. | Phase 6 (Cutting-edge ML), applied in Milestone 4 |
| **Lag Feature** | A feature built by shifting a time series backward by N periods (e.g., `revenue_lag_7` = revenue from 7 days ago), used so a model can learn from recent history without leaking future information. | Phase 5, Day 56 (Time Series) |
| **Rolling Average** | A feature computed as the mean over a moving window of past periods (e.g., 7-day average revenue); must be `.shift(1)`-ed before `.rolling()` to avoid leaking the current row into its own feature. | Phase 5, Day 56 (Time Series) |
| **GradientBoostingRegressor** | An ensemble ML model (scikit-learn) that builds trees sequentially, each correcting the errors of the previous ones; used here for demand forecasting. | Phase 4–5 (ML Fundamentals) |
| **TimeSeriesSplit** | A cross-validation strategy that always keeps validation folds chronologically after their training folds, preventing the "future predicting the past" leakage that a standard `train_test_split` would allow. | Phase 5 (Time Series) |
| **Materialized View (MView)** | A Postgres object that physically stores a query's result set and must be explicitly (or incrementally) refreshed — used to avoid recomputing expensive aggregations on every read. Referenced here in the SQLite-vs-Postgres migration note. | Day 102 (Views) |
| **GIN Index** | A Postgres index type optimized for composite/array/JSONB values, useful for full-text search and semi-structured columns — referenced here as part of the Postgres migration path. | Day 103 (Indexes) |
| **Row-Level Security (RLS)** | A Postgres feature restricting which rows a given role can see or modify, enforced at the database layer regardless of the querying application. | Day 107 (CTEs) / Day 112 (Security) |
| **pg_audit** | A Postgres extension that logs database session/object activity for compliance auditing — the inspiration for the minimal `query_audit_log` table added in the Incident Drill Track connection above. | Day 112 (Security) |

---

## 🎓 Congratulations — You Did It!

You have completed **108 days** of the Coding for MBA curriculum.

From `print("Hello, World!")` to building a complete retail analytics intelligence system — you've traveled further than most working data professionals.

**What you've built today:**
- A production-quality ETL pipeline
- 3 business-critical SQL KPI queries with CTEs and window functions
- A demand forecasting model with proper time-series cross-validation
- An anomaly detection system that would alert a real operations team
- An executive dashboard suitable for a board meeting

**What you should do next:**
1. **Polish this project** — add a README, clean up code, add docstrings
2. **Push to GitHub** — this is your portfolio centerpiece
3. **Write a LinkedIn post** about what you built and what you learned
4. **Apply for roles**: Data Analyst, Analytics Engineer, ML Engineer, BI Developer

**The journey continues.** Pick one of the specialization paths:
- 🤖 **AI Engineer**: Phase 10 (Generative AI)
- ☁️ **Cloud Data Engineer**: Phase 11 (Cloud Data Engineering)  
- 📊 **Analytics Engineer**: Phase 12 (Analytics Engineering & Data Products)

**You have the foundation. Now build the future.** 🚀
