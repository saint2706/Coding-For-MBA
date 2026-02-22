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

### Performance Toolkit

When data grows from thousands to millions of rows, small Pandas choices create big runtime and memory differences.

```python
import pandas as pd

# Read only needed columns
df = pd.read_csv("large_sales.csv", usecols=["date", "region", "product", "revenue"])

# Specify dtypes at read-time to avoid expensive inference
dtype_map = {"region": "string", "product": "string", "revenue": "float32"}
df = pd.read_csv("large_sales.csv", usecols=list(dtype_map) + ["date"], dtype=dtype_map)

# Convert repeated text columns to category to reduce memory
df["region"] = df["region"].astype("category")
df["product"] = df["product"].astype("category")
```

```python
# Chunked reading for files that don't fit comfortably in memory
chunk_totals = {}
for chunk in pd.read_csv("large_sales.csv", chunksize=100_000):
    grouped = chunk.groupby("region")["revenue"].sum()
    for region, total in grouped.items():
        chunk_totals[region] = chunk_totals.get(region, 0) + total

print(chunk_totals)
```

```python
# Prefer vectorized operations over row-wise .apply() where possible
df["is_high_value"] = df["revenue"] > 500
df["commission"] = df["revenue"] * 0.08  # vectorized, fast

# Slower alternative (avoid on large frames)
# df["commission"] = df.apply(lambda row: row["revenue"] * 0.08, axis=1)
```

```python
# Readable and performant method chains
summary = (
    df.query("revenue > 0")
      .eval("net_revenue = revenue * 0.92")
      .pipe(lambda d: d.groupby(["region", "product"], as_index=False)["net_revenue"].sum())
      .sort_values("net_revenue", ascending=False)
)
```

```python
# Simple timing + memory profiling pattern
import time

start = time.perf_counter()
result = df.groupby("region", as_index=False)["revenue"].sum()
elapsed = time.perf_counter() - start

memory_mb = df.memory_usage(deep=True).sum() / (1024 ** 2)
print(f"Elapsed: {elapsed:.4f}s")
print(f"DataFrame memory: {memory_mb:.2f} MB")
```

### Performance Decision Matrix

Use this matrix before optimizing. Pick the smallest change that meaningfully improves runtime or memory for your current bottleneck.

| Technique | Best for | Primary benefit | Tradeoff / watch-out | Use when... |
|---|---|---|---|---|
| `usecols` in `read_csv` | Wide files with many unused columns | Faster IO + lower memory | Can break downstream code expecting dropped columns | You only need a subset of columns for analysis |
| `dtype` map at load | Large CSVs where type inference is slow | Lower parse time + predictable memory | Wrong dtypes can cause coercion errors | You already know schema and can enforce it safely |
| Cast repeated strings to `category` | Low-cardinality text columns (e.g., region/product) | Big memory reduction | Can add overhead if cardinality is very high | Unique values are much smaller than row count |
| Vectorized operations | Column-level transformations | Major runtime improvement | Complex logic may be harder than simple `apply` | You can express logic with Pandas/NumPy expressions |
| Chunked processing (`chunksize`) | Files near/above memory limit | Prevents memory spikes | More code and accumulator logic | Full-load approach risks OOM or swap thrashing |
| `query` / `eval` / `pipe` chains | Multi-step filtering + derived metrics | Readable pipelines, sometimes faster expressions | Over-chaining can reduce beginner readability | You need reproducible, composable transformation steps |

### Benchmark Lab: Baseline vs Optimized `large_sales.csv`

Goal: quantify performance decisions using runtime and memory, then decide on a final approach using explicit thresholds.

```python
import time
import pandas as pd
import numpy as np

# 1) Create synthetic dataset (same workflow family as above)
np.random.seed(42)
n = 1_000_000
large_sales = pd.DataFrame(
    {
        "date": pd.date_range("2024-01-01", periods=n, freq="min"),
        "region": np.random.choice(["North", "South", "East", "West"], n),
        "product": np.random.choice(["A", "B", "C", "D"], n),
        "revenue": np.random.randint(50, 2000, n),
        "discount": np.random.uniform(0.0, 0.25, n),
    }
)
large_sales.to_csv("large_sales.csv", index=False)


def run_baseline(path: str):
    """No explicit optimization."""
    t0 = time.perf_counter()
    df = pd.read_csv(path)
    out = (
        df[df["revenue"] > 0]
        .assign(net_revenue=lambda d: d["revenue"] * (1 - d["discount"]))
        .groupby(["region", "product"], as_index=False)["net_revenue"]
        .sum()
    )
    elapsed = time.perf_counter() - t0
    memory_mb = df.memory_usage(deep=True).sum() / (1024 ** 2)
    return out, elapsed, memory_mb


def run_optimized(path: str):
    """Optimized with usecols + dtype map + category + query/eval/pipe."""
    t0 = time.perf_counter()
    dtype_map = {
        "region": "category",
        "product": "category",
        "revenue": "float32",
        "discount": "float32",
    }
    df = pd.read_csv(path, usecols=["region", "product", "revenue", "discount"], dtype=dtype_map)
    out = (
        df.query("revenue > 0")
        .eval("net_revenue = revenue * (1 - discount)")
        .pipe(lambda d: d.groupby(["region", "product"], as_index=False)["net_revenue"].sum())
    )
    elapsed = time.perf_counter() - t0
    memory_mb = df.memory_usage(deep=True).sum() / (1024 ** 2)
    return out, elapsed, memory_mb


# 2) Run both versions
baseline_out, baseline_time, baseline_mem = run_baseline("large_sales.csv")
opt_out, opt_time, opt_mem = run_optimized("large_sales.csv")

# Optional correctness check (same totals after sorting)
baseline_sorted = baseline_out.sort_values(["region", "product"]).reset_index(drop=True)
opt_sorted = opt_out.sort_values(["region", "product"]).reset_index(drop=True)
pd.testing.assert_frame_equal(baseline_sorted, opt_sorted, check_exact=False, rtol=1e-5)

# 3) Compute measurable improvement
speedup_pct = ((baseline_time - opt_time) / baseline_time) * 100
memory_reduction_pct = ((baseline_mem - opt_mem) / baseline_mem) * 100

print(f"Baseline   -> time: {baseline_time:.3f}s | memory: {baseline_mem:.2f} MB")
print(f"Optimized  -> time: {opt_time:.3f}s | memory: {opt_mem:.2f} MB")
print(f"Speedup: {speedup_pct:.1f}%")
print(f"Memory reduction: {memory_reduction_pct:.1f}%")

# 4) Decision rule (required)
if speedup_pct > 20 or memory_reduction_pct > 30:
    final_choice = "optimized"
else:
    final_choice = "baseline"

print(f"Final approach selected: {final_choice}")
```

#### Required learner report

1. Record baseline runtime and memory.
2. Record optimized runtime and memory.
3. Report `speedup_pct` and `memory_reduction_pct`.
4. State your final approach using the threshold rule: **choose optimized if speedup > 20% OR memory reduction > 30%; otherwise choose baseline for readability/simplicity.**

### Lab: Chunked Processing vs Full-Load Validation

Goal: process a larger synthetic CSV in chunks and prove the aggregated output matches the full-load method.

```python
import pandas as pd
import numpy as np

# 1) Create synthetic large dataset
np.random.seed(42)
n = 1_000_000
large_sales = pd.DataFrame(
    {
        "region": np.random.choice(["North", "South", "East", "West"], n),
        "product": np.random.choice(["A", "B", "C", "D"], n),
        "revenue": np.random.randint(50, 2000, n),
    }
)
large_sales.to_csv("large_sales.csv", index=False)

# 2) Full-load aggregation
full = (
    pd.read_csv("large_sales.csv")
    .groupby(["region", "product"], as_index=False)["revenue"]
    .sum()
    .sort_values(["region", "product"])
    .reset_index(drop=True)
)

# 3) Chunked aggregation
accumulator = {}
for chunk in pd.read_csv("large_sales.csv", chunksize=200_000):
    grouped = chunk.groupby(["region", "product"])["revenue"].sum()
    for key, value in grouped.items():
        accumulator[key] = accumulator.get(key, 0) + value

chunked = (
    pd.Series(accumulator)
    .rename("revenue")
    .reset_index()
    .rename(columns={"level_0": "region", "level_1": "product"})
    .sort_values(["region", "product"])
    .reset_index(drop=True)
)

# 4) Equality check
pd.testing.assert_frame_equal(full, chunked)
print("✅ Chunked output matches full-load output")
```

---

## Mastery Check

**Q1**: GroupBy with multiple aggregations: `df.groupby("col").agg(["sum", "mean"])`

**Q2**: Merge with left join: `pd.merge(df1, df2, on="key", how="left")`

**Q3**: Pivot table: `pd.pivot_table(df, values="val", index="row", columns="col")`

**Q4**: Your optimized pipeline is 24% faster but only saves 8% memory and is less readable for junior analysts. Based on your benchmark thresholds and team maintainability needs, which version do you ship and why?

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
