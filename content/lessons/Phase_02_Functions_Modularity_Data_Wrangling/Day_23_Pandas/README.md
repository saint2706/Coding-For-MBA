---
day: 23
title: "Pandas Essentials"
phase: 2
phaseTitle: "Functions, Modularity & Data Wrangling"
slug: "pandas-essentials"
duration: 60
difficulty: "intermediate"
tags: [python, pandas, dataframes]
concepts: [Series and DataFrame, data loading, selection and filtering]
prerequisites: [22, 5, 8]
outcomes: [Create and manipulate DataFrames, Load data from CSV, Filter and transform data]
---

# 🎯 Day 23: Pandas Essentials

> *"Pandas: Excel on steroids, powered by Python."*

---

## The "Never-Coded" Bridge

**Think about the last time you used Excel.** You opened a file, filtered rows, sorted columns, calculated a sum, and copy-pasted results into another sheet. Each step was manual, unrepeatable, and error-prone.

Pandas gives you the same power but as code — making every step **reproducible, auditable, and automatable**:

```python
import pandas as pd

df = pd.read_csv("sales.csv")          # Open the file
high_revenue = df[df["revenue"] > 500] # Filter rows
by_region = df.groupby("region")["revenue"].sum()  # Sum by category
by_region.to_csv("summary.csv")        # Save results
```

A DataFrame is like a SQL table or an Excel sheet in memory: rows have numeric indices, columns have named headers, and you can query, join, and transform data using Python instead of clicking around a spreadsheet. The key difference is that your entire analysis is a script you can re-run on next month's data in seconds.

---

## The Technical Deep Dive

### DataFrame Creation

```python
import pandas as pd

df = pd.DataFrame(
    {
        "name": ["Alice", "Bob", "Charlie"],
        "department": ["Sales", "Engineering", "Sales"],
        "salary": [75000, 95000, 72000],
    }
)
```

### Loading Data

```python
df = pd.read_csv("data.csv")
df = pd.read_excel("data.xlsx", sheet_name="Sales")
```

### Exploring Data

```python
df.head()  # First 5 rows
df.shape  # (rows, columns)
df.info()  # Summary info
df.describe()  # Statistics
```

### Selecting Data

```python
df["name"]  # Single column
df[["name", "salary"]]  # Multiple columns
df.loc[0:2, "name"]  # Label-based
df.iloc[0:2, 0]  # Position-based
```

### Filtering Data

```python
high_earners = df[df["salary"] > 80000]
sales_team = df[(df["department"] == "Sales") & (df["salary"] > 70000)]
```

### Adding Columns

```python
df["bonus"] = df["salary"] * 0.10
```

### Aggregations

```python
df["salary"].sum()
df["salary"].mean()
df["department"].value_counts()
```

### Saving Data

```python
df.to_csv("output.csv", index=False)
df.to_excel("output.xlsx", index=False)
```

---

## Hands-on Lab

### Exercise: Employee Analysis

```python
employees = pd.DataFrame(
    {
        "name": ["Alice", "Bob", "Charlie"],
        "department": ["Sales", "Engineering", "Sales"],
        "salary": [75000, 95000, 72000],
    }
)

# Average salary
print(f"Avg salary: ${employees['salary'].mean():,.2f}")

# High earners
high_earners = employees[employees["salary"] > 80000]
print(high_earners)
```

**Expected Output:**

```
Avg salary: $80,666.67
      name  department  salary
1  Bob     Engineering   95000
```

---

## Mastery Check

### Question 1: Column Selection

How do you select multiple columns from a DataFrame?

<details>
<summary>Click for Answer</summary>

Pass a list of column names inside double brackets:

```python
df[["col1", "col2"]]
```

A single set of brackets returns a Series; double brackets return a DataFrame.

</details>

---

### Question 2: Multi-Condition Filter

How do you filter rows where department is "Sales" AND salary > 70,000?

<details>
<summary>Click for Answer</summary>

Use `&` to combine conditions, wrapping each in parentheses:

```python
df[(df["department"] == "Sales") & (df["salary"] > 70000)]
```

</details>

---

### Question 3: Calculated Column

How do you add a `bonus` column equal to 10% of salary?

<details>
<summary>Click for Answer</summary>

```python
df["bonus"] = df["salary"] * 0.10
```

This is a vectorized operation — it applies to all rows at once without a loop.

</details>

---

### Question 4: loc vs iloc

What is the difference between `.loc` and `.iloc`?

<details>
<summary>Click for Answer</summary>

- `.loc` selects by **label** (row index or column name): `df.loc[0:2, "name"]`
- `.iloc` selects by **integer position**: `df.iloc[0:2, 0]`

Use `.loc` for named access and `.iloc` for positional slicing.

</details>

---

### Question 5: Design Scenario

**Scenario**: You have a sales DataFrame with columns `region`, `product`, `revenue`. Write code to find the total revenue per region, sorted from highest to lowest.

<details>
<summary>Click for Answer</summary>

```python
df.groupby("region")["revenue"].sum().sort_values(ascending=False)
```

</details>

---

## Summary

- ✅ DataFrames are 2D labeled data structures
- ✅ Load with `pd.read_csv()`, `pd.read_excel()`
- ✅ Select with brackets, `.loc`, `.iloc`
- ✅ Filter with boolean conditions

**Tomorrow**: Advanced Pandas—groupby, merges, and pivots.

---

## Glossary

| Term | Definition |
|------|------------|
| DataFrame | A 2-dimensional labeled data structure with named columns and a row index; the core Pandas object, similar to a SQL table or spreadsheet. |
| Series | A 1-dimensional labeled array in Pandas; a single column of a DataFrame is a Series. |
| Index | The row labels of a DataFrame or Series; defaults to integers (0, 1, 2, …) but can be set to meaningful identifiers. |
| `.loc` | Label-based selection: selects rows/columns by their explicit index label or column name. |
| `.iloc` | Integer-location-based selection: selects rows/columns by their positional offset (0-based integer). |
| Aggregation | A computation that reduces multiple values to a single summary statistic, e.g., `sum()`, `mean()`, `count()`. |
| `groupby()` | A Pandas method that splits a DataFrame into groups based on a column’s values, enabling per-group aggregations. |
| `fillna()` / `dropna()` | Methods for handling missing values: `fillna()` replaces them; `dropna()` removes affected rows or columns. |
| Method Chaining | Writing multiple Pandas operations end-to-end in a single expression, e.g., `df.query(...).groupby(...).sum()`. |

## Task Block (Core / Stretch / Expert)

### Data Migration Thread (Days 22–24): Arrays → DataFrame Pipelines

### Core

- Rebuild yesterday’s NumPy workflow in Pandas using explicit column names and typed parsing.
- Verify metric parity between NumPy and Pandas outputs with assertions.

### Stretch

- Replace index-based NumPy logic with label-based Pandas operations (`loc`, `assign`, `groupby`).
- Add one migration exercise where learners convert a provided NumPy snippet into idiomatic Pandas.

### Expert

- Package the pipeline into reusable functions (`load`, `transform`, `summarize`) with clear contracts.
- Add validation checks for nulls, schema drift, and unexpected category values.

## Common Grading Rubric (applies every day)

| Criterion | 1 - Emerging | 2 - Developing | 3 - Proficient | 4 - Strong |
|---|---|---|---|---|
| Correctness | Major logic errors; results frequently wrong. | Core path works but multiple inaccuracies remain. | Outputs are correct for expected inputs and checked with examples. | Outputs are consistently correct, including tricky cases and clear verification. |
| Robustness | Breaks on minor input changes or missing values. | Handles some variation but fails on common edge cases. | Handles expected edge cases with explicit guards/validation. | Gracefully handles unexpected data, with informative failures and recovery paths. |
| Readability | Hard to follow; unclear naming/structure. | Partially clear but inconsistent style or organization. | Clear naming, structure, and comments/docstrings where needed. | Highly readable, well-organized, and easy for teammates to extend quickly. |
| Reuse | One-off script with duplicated logic. | Some modularization, limited reuse. | Reusable functions/classes with sensible boundaries. | Well-factored components with clean interfaces and minimal duplication. |
