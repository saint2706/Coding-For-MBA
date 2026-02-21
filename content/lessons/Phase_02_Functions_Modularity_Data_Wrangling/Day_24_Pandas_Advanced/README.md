---
day: 24
title: "Advanced Pandas"
phase: 2
phaseTitle: "Functions, Modularity & Data Wrangling"
slug: "advanced-pandas"
duration: 60
difficulty: "intermediate"
tags: [python, pandas, groupby, merge]
concepts: [groupby operations, merging DataFrames, pivot tables, time series]
prerequisites: [23, 22]
outcomes: [Aggregate data with groupby, Merge and join DataFrames, Create pivot tables]
---

# 🎯 Day 24: Advanced Pandas

> *"Master groupby and merges to transform raw data into business insights."*

---

## The "Never-Coded" Bridge

Yesterday you learned to load and filter data. Today you'll learn to **aggregate** and **combine** data—the operations that turn raw records into executive dashboards.

---

## The Technical Deep Dive

### GroupBy Operations

```python
import pandas as pd

df = pd.DataFrame(
    {
        "region": ["North", "South", "North", "South"],
        "product": ["A", "A", "B", "B"],
        "sales": [100, 150, 200, 120],
    }
)

# Single aggregation
df.groupby("region")["sales"].sum()
# North: 300, South: 270

# Multiple aggregations
df.groupby("region")["sales"].agg(["sum", "mean", "count"])

# Group by multiple columns
df.groupby(["region", "product"])["sales"].sum()
```

### Transform vs Agg

```python
# agg: returns reduced data (one row per group)
totals = df.groupby("region")["sales"].sum()

# transform: returns same-size data (broadcasts back)
df["region_total"] = df.groupby("region")["sales"].transform("sum")
df["pct_of_region"] = df["sales"] / df["region_total"]
```

### Merging DataFrames

```python
orders = pd.DataFrame(
    {"order_id": [1, 2, 3], "customer_id": [101, 102, 101], "amount": [250, 150, 300]}
)

customers = pd.DataFrame(
    {"customer_id": [101, 102, 103], "name": ["Alice", "Bob", "Charlie"]}
)

# Inner join (default)
merged = pd.merge(orders, customers, on="customer_id")

# Left join (keep all orders)
merged = pd.merge(orders, customers, on="customer_id", how="left")

# Different column names
pd.merge(df1, df2, left_on="id", right_on="customer_id")
```

### Pivot Tables

```python
sales = pd.DataFrame(
    {
        "date": ["2024-01", "2024-01", "2024-02", "2024-02"],
        "region": ["North", "South", "North", "South"],
        "revenue": [100, 150, 120, 180],
    }
)

# Pivot table
pivot = pd.pivot_table(
    sales, values="revenue", index="region", columns="date", aggfunc="sum"
)
```

### Time Series Basics

```python
df = pd.DataFrame(
    {"date": pd.date_range("2024-01-01", periods=100, freq="D"), "value": range(100)}
)

df.set_index("date", inplace=True)

# Resample to monthly
monthly = df.resample("M").sum()

# Rolling average
df["rolling_7d"] = df["value"].rolling(7).mean()
```

### Missing Data

```python
# Fill missing values
df["col"].fillna(0)
df["col"].fillna(df["col"].mean())
df["col"].fillna(method="ffill")  # Forward fill

# Drop rows with missing
df.dropna()
df.dropna(subset=["important_col"])
```

---

### Validation plots before dashboarding

Before you build a polished dashboard, make three **quick validation plots** with `DataFrame.plot()` to catch data issues early.

#### 1) Trend check (time)
Use a **line plot** to verify direction and volatility.

```python
# Example: daily sales trend
sales_by_day = df.groupby("date", as_index=False)["sales"].sum()
sales_by_day.plot(x="date", y="sales", kind="line", title="Daily Sales Trend")
```

#### 2) Distribution check (shape + outliers)
Use a **histogram** to inspect spread, skew, and suspicious values.

```python
# Example: order-value distribution
df.plot(y="sales", kind="hist", bins=20, title="Sales Distribution")
```

#### 3) Category comparison (ranking)
Use a **bar chart** to compare categories side by side.

```python
# Example: region performance
region_totals = df.groupby("region", as_index=False)["sales"].sum()
region_totals.plot(x="region", y="sales", kind="bar", title="Sales by Region")
```

#### Chart-choice heuristics for business decisions

- **"What changed over time?"** → line chart.
- **"How are values distributed?"** → histogram/box plot.
- **"Who is ahead/behind?"** → bar chart (sorted if possible).
- **"Part-to-whole"** decisions are usually clearer with bars than pie charts when categories are many or close in size.

#### Common misreads to prevent

- **Axis scaling traps:** a truncated y-axis can exaggerate tiny differences.
- **Aggregation mismatch:** comparing daily metrics to monthly targets creates false conclusions.
- **Granularity confusion:** totals can hide segment-level declines; always validate at the decision level.

#### Hands-on exercise: 3 diagnostic plots from `extras/sample_sales.csv`

Create three quick plots and add a one-sentence interpretation for each.

```python
import pandas as pd
import matplotlib.pyplot as plt

# Load sample file from Phase 2 extras
sales = pd.read_csv("content/lessons/Phase_02_Functions_Modularity_Data_Wrangling/extras/sample_sales.csv")
sales["date"] = pd.to_datetime(sales["date"])

# 1) Trend plot: total sales by date
(
    sales.groupby("date", as_index=False)["sales"].sum()
    .plot(x="date", y="sales", kind="line", title="Diagnostic 1: Sales Trend")
)
plt.show()
# Interpretation: "Sales trend is mostly stable with a late-period uptick worth validating against campaigns."

# 2) Distribution plot: sales value distribution
sales.plot(y="sales", kind="hist", bins=15, title="Diagnostic 2: Sales Distribution")
plt.show()
# Interpretation: "The right-skew suggests a few high-value transactions are driving average sales."

# 3) Category comparison: sales by region
(
    sales.groupby("region", as_index=False)["sales"].sum()
    .sort_values("sales", ascending=False)
    .plot(x="region", y="sales", kind="bar", title="Diagnostic 3: Sales by Region")
)
plt.show()
# Interpretation: "Region ranking shows concentration risk because one region contributes a disproportionate share."
```

➡️ Continue this storyline in **[Phase 3 Day 27: Data Visualization](../../Phase_03_Data_Engineering_Web_Development/Day_27_Visualization/README.md)**, where you turn these validation checks into presentation-ready visual narratives.

---

## Hands-on Lab

### Exercise: Sales Dashboard

```python
import pandas as pd
import numpy as np

np.random.seed(42)
sales = pd.DataFrame(
    {
        "date": pd.date_range("2024-01-01", periods=90, freq="D"),
        "region": np.random.choice(["North", "South", "East"], 90),
        "product": np.random.choice(["A", "B", "C"], 90),
        "revenue": np.random.randint(100, 1000, 90),
    }
)

# Revenue by region
print(sales.groupby("region")["revenue"].agg(["sum", "mean"]))

# Top product per region
top = sales.groupby(["region", "product"])["revenue"].sum()
print(top.unstack())

# Monthly trend
sales.set_index("date")["revenue"].resample("M").sum()
```

---

## Mastery Check

**Q1**: GroupBy with multiple aggregations: `df.groupby("col").agg(["sum", "mean"])`

**Q2**: Merge with left join: `pd.merge(df1, df2, on="key", how="left")`

**Q3**: Pivot table: `pd.pivot_table(df, values="val", index="row", columns="col")`

---

## Summary

- ✅ `groupby()` aggregates data by categories
- ✅ `merge()` combines DataFrames like SQL joins
- ✅ `pivot_table()` creates cross-tabulations
- ✅ `resample()` handles time-based aggregation

**🎉 Congratulations!** You've completed **Phase 2: Functions, Modularity & Data Wrangling**!

---

## Task Block (Core / Stretch / Expert)

### Data Migration Thread (Days 22–24): Arrays → DataFrame Pipelines

### Core

- Upgrade the Day 23 Pandas pipeline with advanced operations (`merge`, `pivot_table`, `resample`).
- Keep each step modular so learners can trace migration from raw arrays to analytical tables.

### Stretch

- Add an explicit migration exercise: optimize one NumPy-heavy section into a Pandas-native pattern.
- Produce a compact before/after comparison (code length, clarity, and maintainability).

### Expert

- Create a production-style mini workflow with configuration-driven transformations.
- Add regression checks that protect outputs when new columns or dates appear.

## Common Grading Rubric (applies every day)

| Criterion | 1 - Emerging | 2 - Developing | 3 - Proficient | 4 - Strong |
|---|---|---|---|---|
| Correctness | Major logic errors; results frequently wrong. | Core path works but multiple inaccuracies remain. | Outputs are correct for expected inputs and checked with examples. | Outputs are consistently correct, including tricky cases and clear verification. |
| Robustness | Breaks on minor input changes or missing values. | Handles some variation but fails on common edge cases. | Handles expected edge cases with explicit guards/validation. | Gracefully handles unexpected data, with informative failures and recovery paths. |
| Readability | Hard to follow; unclear naming/structure. | Partially clear but inconsistent style or organization. | Clear naming, structure, and comments/docstrings where needed. | Highly readable, well-organized, and easy for teammates to extend quickly. |
| Reuse | One-off script with duplicated logic. | Some modularization, limited reuse. | Reusable functions/classes with sensible boundaries. | Well-factored components with clean interfaces and minimal duplication. |
