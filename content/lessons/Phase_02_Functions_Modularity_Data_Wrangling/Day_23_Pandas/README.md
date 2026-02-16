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

Think of Pandas as a programmable spreadsheet. Load, analyze, export—in 3 lines:

```python
import pandas as pd
df = pd.read_csv("sales.csv")
summary = df.groupby("region")["revenue"].sum()
```

---

## The Technical Deep Dive

### DataFrame Creation

```python
import pandas as pd

df = pd.DataFrame({
    "name": ["Alice", "Bob", "Charlie"],
    "department": ["Sales", "Engineering", "Sales"],
    "salary": [75000, 95000, 72000]
})
```

### Loading Data

```python
df = pd.read_csv("data.csv")
df = pd.read_excel("data.xlsx", sheet_name="Sales")
```

### Exploring Data

```python
df.head()      # First 5 rows
df.shape       # (rows, columns)
df.info()      # Summary info
df.describe()  # Statistics
```

### Selecting Data

```python
df["name"]              # Single column
df[["name", "salary"]]  # Multiple columns
df.loc[0:2, "name"]     # Label-based
df.iloc[0:2, 0]         # Position-based
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
employees = pd.DataFrame({
    "name": ["Alice", "Bob", "Charlie"],
    "department": ["Sales", "Engineering", "Sales"],
    "salary": [75000, 95000, 72000]
})

# Average salary
print(f"Avg salary: ${employees['salary'].mean():,.2f}")

# High earners
high_earners = employees[employees["salary"] > 80000]
print(high_earners)
```

---

## Mastery Check

**Q1**: Select multiple columns: `df[["col1", "col2"]]`

**Q2**: Filter with multiple conditions: `df[(cond1) & (cond2)]`

**Q3**: Add calculated column: `df["new"] = df["old"] * 1.1`

---

## Summary

- ✅ DataFrames are 2D labeled data structures
- ✅ Load with `pd.read_csv()`, `pd.read_excel()`
- ✅ Select with brackets, `.loc`, `.iloc`
- ✅ Filter with boolean conditions

**Tomorrow**: Advanced Pandas—groupby, merges, and pivots.
