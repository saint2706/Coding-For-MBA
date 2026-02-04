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

df = pd.DataFrame({
    "region": ["North", "South", "North", "South"],
    "product": ["A", "A", "B", "B"],
    "sales": [100, 150, 200, 120]
})

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
orders = pd.DataFrame({
    "order_id": [1, 2, 3],
    "customer_id": [101, 102, 101],
    "amount": [250, 150, 300]
})

customers = pd.DataFrame({
    "customer_id": [101, 102, 103],
    "name": ["Alice", "Bob", "Charlie"]
})

# Inner join (default)
merged = pd.merge(orders, customers, on="customer_id")

# Left join (keep all orders)
merged = pd.merge(orders, customers, on="customer_id", how="left")

# Different column names
pd.merge(df1, df2, left_on="id", right_on="customer_id")
```

### Pivot Tables

```python
sales = pd.DataFrame({
    "date": ["2024-01", "2024-01", "2024-02", "2024-02"],
    "region": ["North", "South", "North", "South"],
    "revenue": [100, 150, 120, 180]
})

# Pivot table
pivot = pd.pivot_table(
    sales,
    values="revenue",
    index="region",
    columns="date",
    aggfunc="sum"
)
```

### Time Series Basics

```python
df = pd.DataFrame({
    "date": pd.date_range("2024-01-01", periods=100, freq="D"),
    "value": range(100)
})

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

## Hands-on Lab

### Exercise: Sales Dashboard

```python
import pandas as pd
import numpy as np

np.random.seed(42)
sales = pd.DataFrame({
    "date": pd.date_range("2024-01-01", periods=90, freq="D"),
    "region": np.random.choice(["North", "South", "East"], 90),
    "product": np.random.choice(["A", "B", "C"], 90),
    "revenue": np.random.randint(100, 1000, 90)
})

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
