---
day: 108B
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
    regions = {
        "STORE_001": "North",
        "STORE_002": "North",
        # ... (simplified for demo)
    }
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

# KPI 2: Top 10 stores by revenue this year
# TODO: Write this query yourself using Phase 8-9 skills

# KPI 3: Identify bottom 5 stores in each region (window function + CTE)
# TODO: Write this query yourself

conn.close()
```

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

---

## Milestone 4: Anomaly Detection (Phase 5 + Phase 6)

### Task 4.1: Identify Unusual Stores

```python
from sklearn.ensemble import IsolationForest


def detect_store_anomalies(df: pd.DataFrame) -> pd.DataFrame:
    """
    Detect stores with anomalous behavior using Isolation Forest.
    Features: avg_daily_revenue, revenue_std, mom_growth, returns_rate
    """
    # Aggregate features per store (last 30 days)
    conn = sqlite3.connect("capstone.db")
    store_features = pd.read_sql(
        """
        SELECT
            store_id,
            AVG(revenue) AS avg_daily_revenue,
            STDEV(revenue) AS revenue_std,         -- May not work in SQLite
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
    return anomalous
```

---

## Milestone 5: Visualization & Reporting (Phase 3)

```python
import matplotlib.pyplot as plt
import matplotlib.gridspec as gridspec


def build_executive_dashboard(kpi_df, forecast_df, anomalies_df):
    """Build a multi-panel executive dashboard."""

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

    # Panel 2: Top store performance
    ax2 = fig.add_subplot(gs[0, 2])
    # TODO: Bar chart of top 10 stores

    # Panel 3: 30-day demand forecast
    ax3 = fig.add_subplot(gs[1, :])
    # TODO: Forecast line with confidence interval shading

    # Panel 4: Anomaly map (store_id vs anomaly score)
    ax4 = fig.add_subplot(gs[2, :])
    # TODO: Scatter plot highlighting anomalous stores in red

    plt.savefig("capstone_dashboard.png", dpi=150, bbox_inches="tight")
    print("Dashboard saved: capstone_dashboard.png")
    return fig


build_executive_dashboard(kpi_data, pd.DataFrame(), detect_store_anomalies(df))
```

---

## Capstone Deliverables Checklist

Your completed capstone should include:

### Code (Python Jupyter Notebook + SQL)
- [ ] `01_data_pipeline.py` — Data loading, cleaning, SQLite ingestion
- [ ] `02_sql_kpis.sql` — All 5 KPI queries with CTEs and window functions
- [ ] `03_ml_forecasting.py` — Feature engineering + model training + evaluation
- [ ] `04_anomaly_detection.py` — Isolation Forest anomaly detection
- [ ] `05_dashboard.py` — Visualization dashboard generation

### Documentation
- [ ] `README.md` — Project overview, setup instructions, key findings
- [ ] Inline comments explaining ML modeling decisions
- [ ] A 1-page "Business Summary" with 3 key insights and recommendations

### Quality Gates
- [ ] MAPE < 15% on the forecasting model
- [ ] All SQL queries run without errors
- [ ] Dashboard renders cleanly with no missing panels
- [ ] Code runs end-to-end in a fresh environment (no manual steps)

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

---

## 🎓 Congratulations — You Did It!

You have completed **108 days** of the Coding for MBA curriculum.

From `print("Hello, World!")` to building a complete retail analytics intelligence system — you've traveled further than most working data professionals.

**What you've built today:**
- A production-quality ETL pipeline
- 5 business-critical SQL KPI queries with window functions
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
