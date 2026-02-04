---
day: 25
title: "Data Cleaning"
phase: 3
phaseTitle: "Data Engineering & Web Development"
slug: "data-cleaning"
duration: 55
difficulty: "intermediate"
tags: [python, pandas, data-cleaning, etl]
concepts: [handling missing data, type conversion, deduplication, string normalization]
prerequisites: [23, 24]
outcomes: [Clean messy datasets, Handle missing values strategically, Standardize data formats]
---

# 🎯 Day 25: Data Cleaning

> *"Data scientists spend 80% of their time cleaning data. Master this, and you're already ahead."*

---

## The "Never-Coded" Bridge

Imagine receiving a spreadsheet where:
- Some prices have "$" and some don't
- Dates are "Jan 15, 2024", "2024-01-15", and "15/01/24"
- Customer names are "ALICE", "alice", "Alice "
- Product categories include "Electronics", "electronics", "ELECTRONICS"

This is reality. Raw data is messy. Your job is to make it analysis-ready.

---

## The Technical Deep Dive

### Handling Missing Data

```python
import pandas as pd
import numpy as np

df = pd.DataFrame({
    "name": ["Alice", None, "Charlie"],
    "salary": [50000, 60000, np.nan],
    "department": ["Sales", "Engineering", None]
})

# Detect missing
df.isnull().sum()           # Count per column
df.isnull().sum().sum()     # Total missing

# Drop missing
df.dropna()                  # Drop rows with ANY missing
df.dropna(subset=["name"])   # Only if name is missing

# Fill missing
df["salary"].fillna(df["salary"].mean())
df["department"].fillna("Unknown")
df.fillna(method="ffill")    # Forward fill
```

### Type Conversion

```python
# Price with $ symbols
df["price"] = df["price"].str.replace("$", "").str.replace(",", "").astype(float)

# Dates in various formats
df["date"] = pd.to_datetime(df["date"], format="mixed")

# Categorical for memory efficiency
df["category"] = df["category"].astype("category")
```

### String Cleaning

```python
# Standardize text
df["name"] = df["name"].str.strip().str.title()
df["email"] = df["email"].str.lower()
df["product"] = df["product"].str.replace(r"[^\w\s]", "", regex=True)

# Fix inconsistent values
mapping = {"USA": "United States", "U.S.": "United States", "US": "United States"}
df["country"] = df["country"].replace(mapping)
```

### Handling Duplicates

```python
# Find duplicates
df.duplicated().sum()
df[df.duplicated(keep=False)]   # Show all duplicates

# Remove duplicates
df.drop_duplicates()
df.drop_duplicates(subset=["order_id"], keep="last")
```

### Outlier Detection

```python
# IQR method
Q1 = df["revenue"].quantile(0.25)
Q3 = df["revenue"].quantile(0.75)
IQR = Q3 - Q1
lower = Q1 - 1.5 * IQR
upper = Q3 + 1.5 * IQR

df_clean = df[(df["revenue"] >= lower) & (df["revenue"] <= upper)]
```

---

## Hands-on Lab

```python
import pandas as pd

# Messy data
messy = pd.DataFrame({
    "Name": ["  ALICE ", "bob", "CHARLIE", "alice", None],
    "Price": ["$100", "$250.50", "75", "$1,000", "$50"],
    "Date": ["2024-01-15", "Jan 20, 2024", "2024/02/01", "15-03-2024", None],
    "Category": ["Electronics", "ELECTRONICS", "electronics", "Home", "home"]
})

def clean_dataframe(df):
    df = df.copy()
    
    # Drop rows with missing critical data
    df = df.dropna(subset=["Name"])
    
    # Clean names
    df["Name"] = df["Name"].str.strip().str.title()
    
    # Clean prices
    df["Price"] = df["Price"].str.replace(r"[$,]", "", regex=True).astype(float)
    
    # Parse dates
    df["Date"] = pd.to_datetime(df["Date"], format="mixed", errors="coerce")
    
    # Standardize categories
    df["Category"] = df["Category"].str.lower().str.strip()
    
    # Remove duplicates
    df = df.drop_duplicates(subset=["Name"])
    
    return df

cleaned = clean_dataframe(messy)
print(cleaned)
```

---

## Mastery Check

**Q1**: Fill missing with column mean: `df["col"].fillna(df["col"].mean())`

**Q2**: Remove leading/trailing whitespace: `df["col"].str.strip()`

**Q3**: Convert price string "$1,234.56" to float: `df["price"].str.replace(r"[$,]", "", regex=True).astype(float)`

---

## Summary

- ✅ Handle missing data: drop, fill, or flag
- ✅ Convert types: strings to numbers, dates
- ✅ Standardize text: case, whitespace, categories
- ✅ Remove duplicates and outliers

**Tomorrow**: Statistical foundations for data analysis.
