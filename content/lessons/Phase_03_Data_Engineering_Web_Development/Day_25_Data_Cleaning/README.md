---
day: 25
title: "Data Cleaning"
phase: 3
phaseTitle: "Data Engineering & Web Development"
slug: "data-cleaning"
duration: 55
difficulty: "intermediate"
tags:
  - python
  - pandas
  - data-cleaning
  - etl
concepts:
  - "handling missing data"
  - "type conversion"
  - "deduplication"
  - "string normalization"
  - "outlier detection"
prerequisites: [23, 24]
outcomes:
  - "Clean messy datasets systematically"
  - "Handle missing values with appropriate strategies"
  - "Standardize data formats for analysis"
  - "Detect and handle outliers"
---

# 🎯 Day 25: Data Cleaning

> *"Data scientists spend 80% of their time cleaning data. Master this, and you're already ahead."*

---

## The "Never-Coded" Bridge

**Imagine you're merging customer lists from three different departments.** Marketing spells it "John Smith", Sales has "JOHN SMITH ", and Support logged "john smith ". The phone numbers? Some have dashes, some have parentheses, some are just digits. And half the records are missing email addresses entirely.

This is the reality of business data. It's messy, inconsistent, and riddled with gaps.

**Real-world data problems:**

- Customer names with inconsistent capitalization and extra spaces
- Prices stored as "$1,234.56" (strings) instead of numbers
- Dates in five different formats: "Jan 15, 2024", "2024-01-15", "15/01/24"
- Duplicate records from system migrations
- Missing values that break your calculations

**Your job:** Transform this chaos into analysis-ready datasets. The techniques you learn today are used daily at companies like:

- **Netflix**: Cleaning viewing data from 200+ million accounts
- **Uber**: Normalizing location data from different map providers
- **Banks**: Standardizing transaction records from legacy systems

---

## The Technical Deep Dive

### Handling Missing Data

Missing data is inevitable. The key is choosing the right strategy.

```python
import pandas as pd
import numpy as np

df = pd.DataFrame({
    "name": ["Alice", None, "Charlie", "Diana"],
    "salary": [50000, 60000, np.nan, 75000],
    "department": ["Sales", "Engineering", None, "Sales"],
    "hire_date": ["2020-01-15", None, "2021-03-20", "2019-06-01"]
})

# Detect missing values
print(df.isnull().sum())           # Count per column
print(df.isnull().sum().sum())     # Total missing across all columns
print(df.isnull().any(axis=1))     # Which rows have missing values

# Drop missing values
df_dropped = df.dropna()                          # Drop rows with ANY missing
df_dropped_subset = df.dropna(subset=["name"])    # Only if name is missing
df_dropped_thresh = df.dropna(thresh=3)           # Keep rows with at least 3 non-null values

# Fill missing values
df["salary"] = df["salary"].fillna(df["salary"].mean())           # Fill with mean
df["department"] = df["department"].fillna("Unknown")             # Fill with constant
df["salary"] = df["salary"].fillna(method="ffill")                # Forward fill
df["salary"] = df["salary"].fillna(method="bfill")                # Backward fill
df["hire_date"] = df["hire_date"].fillna(pd.Timestamp.now())      # Fill with today
```

### Type Conversion

Data often arrives as strings. Convert to proper types for analysis.

```python
# Price with $ symbols and commas
df = pd.DataFrame({
    "price": ["$100", "$1,250.50", "$75", "$2,000"],
    "quantity": ["10", "5", "20", "3"],
    "date": ["2024-01-15", "Jan 20, 2024", "2024/02/01", "15-03-2024"]
})

# Clean and convert price
df["price_clean"] = (
    df["price"]
    .str.replace("$", "", regex=False)
    .str.replace(",", "", regex=False)
    .astype(float)
)

# Convert quantity to integer
df["quantity"] = df["quantity"].astype(int)

# Parse dates with mixed formats
df["date_clean"] = pd.to_datetime(df["date"], format="mixed")

# Categorical for memory efficiency (great for repeated string values)
df["category"] = pd.Series(["Electronics", "Electronics", "Home", "Electronics"])
df["category"] = df["category"].astype("category")
print(f"Memory saved: {df['category'].nbytes} vs {df['category'].astype(str).nbytes} bytes")
```

### String Cleaning

Standardize text for consistent matching and grouping.

```python
df = pd.DataFrame({
    "name": ["  JOHN DOE ", "jane smith", "  Bob Wilson  "],
    "email": ["JOHN@EXAMPLE.COM", "Jane@Company.org", "bob@test.com"],
    "product": ["Laptop-Pro_2024!", "mouse (wireless)", "keyboard #mechanical#"]
})

# Standardize names: strip whitespace, title case
df["name_clean"] = df["name"].str.strip().str.title()

# Standardize emails: lowercase, strip
df["email_clean"] = df["email"].str.lower().str.strip()

# Remove special characters from product names
df["product_clean"] = df["product"].str.replace(r"[^a-zA-Z0-9\s]", "", regex=True)

# Fix inconsistent category values with mapping
country_mapping = {
    "USA": "United States",
    "U.S.": "United States", 
    "US": "United States",
    "United States of America": "United States"
}
df["country"] = df["country"].replace(country_mapping)

# Extract patterns with regex
df["phone_digits"] = df["phone"].str.replace(r"\D", "", regex=True)  # Keep only digits
```

### Handling Duplicates

Duplicates can skew analysis. Identify and remove them systematically.

```python
df = pd.DataFrame({
    "order_id": [1001, 1002, 1001, 1003, 1002],
    "customer": ["Alice", "Bob", "Alice", "Charlie", "Bob"],
    "amount": [100, 200, 100, 150, 200]
})

# Find duplicates
print(f"Duplicate rows: {df.duplicated().sum()}")
print(df[df.duplicated(keep=False)])    # Show ALL duplicate rows (including first occurrence)

# Remove duplicates
df_unique = df.drop_duplicates()                                    # Remove exact duplicates
df_unique = df.drop_duplicates(subset=["order_id"])                 # Based on specific columns
df_unique = df.drop_duplicates(subset=["order_id"], keep="last")    # Keep last occurrence
df_unique = df.drop_duplicates(subset=["order_id"], keep="first")   # Keep first occurrence
```

### Outlier Detection and Handling

Outliers can distort statistics. Detect them with IQR or Z-scores.

```python
import numpy as np

df = pd.DataFrame({
    "revenue": [1000, 1200, 1100, 1300, 50000, 1150, 900, 1250]  # 50000 is outlier
})

# IQR Method (robust to outliers)
Q1 = df["revenue"].quantile(0.25)
Q3 = df["revenue"].quantile(0.75)
IQR = Q3 - Q1
lower_bound = Q1 - 1.5 * IQR
upper_bound = Q3 + 1.5 * IQR

outliers = df[(df["revenue"] < lower_bound) | (df["revenue"] > upper_bound)]
print(f"Outliers found: {len(outliers)}")

# Remove outliers
df_clean = df[(df["revenue"] >= lower_bound) & (df["revenue"] <= upper_bound)]

# Z-Score Method (assumes normal distribution)
from scipy import stats
z_scores = np.abs(stats.zscore(df["revenue"]))
df_clean = df[z_scores < 3]  # Keep values within 3 standard deviations

# Cap outliers instead of removing (winsorizing)
df["revenue_capped"] = df["revenue"].clip(lower=lower_bound, upper=upper_bound)
```

---

## Senior-Level Insights

### Data Quality Dimensions

| Dimension        | Description                     | Check Method                        |
| ---------------- | ------------------------------- | ----------------------------------- |
| **Completeness** | No missing values               | `df.isnull().sum()`                 |
| **Uniqueness**   | No duplicate records            | `df.duplicated().sum()`             |
| **Validity**     | Values follow business rules    | Range checks, regex patterns        |
| **Consistency**  | Same format across records      | `df["col"].unique()`                |
| **Accuracy**     | Values reflect real-world truth | Cross-reference with source systems |

### Missing Data Strategies

| Strategy             | When to Use                                  | Pandas Method                 |
| -------------------- | -------------------------------------------- | ----------------------------- |
| **Drop rows**        | Small % missing, rows aren't critical        | `dropna()`                    |
| **Fill with mean**   | Numerical, approximately normal distribution | `fillna(df["col"].mean())`    |
| **Fill with median** | Numerical, skewed distribution or outliers   | `fillna(df["col"].median())`  |
| **Fill with mode**   | Categorical data                             | `fillna(df["col"].mode()[0])` |
| **Forward fill**     | Time series, value persists until changed    | `fillna(method="ffill")`      |
| **Interpolate**      | Time series, smooth transitions expected     | `interpolate()`               |
| **Flag as unknown**  | Missing is meaningful information            | `fillna("Unknown")`           |

### Production Considerations

1. **Idempotent Cleaning**: Run your cleaning pipeline multiple times without changing already-clean data. Always check before modifying.

2. **Preserve Raw Data**: Never overwrite source files. Create cleaned copies with clear naming: `customers_raw.csv` → `customers_cleaned.csv`.

3. **Validation Gates**: Add assertions after critical steps:

   ```python
   assert df["price"].isnull().sum() == 0, "Found null prices after cleaning"
   assert (df["price"] > 0).all(), "Found negative prices"
   ```

4. **Logging Changes**: Track what your pipeline modifies:

   ```python
   rows_before = len(df)
   df = df.dropna(subset=["email"])
   print(f"Dropped {rows_before - len(df)} rows with missing emails")
   ```

---

## Hands-on Lab

### Exercise 1: Customer Data Normalization

```python
import pandas as pd

# Messy customer data from multiple sources
customers = pd.DataFrame({
    "Name": ["  ALICE JOHNSON ", "bob smith", "CHARLIE BROWN", "alice johnson", None],
    "Email": ["alice@GMAIL.COM", "BOB@company.org", "charlie@test.com", "ALICE@gmail.com", "dan@email.com"],
    "Phone": ["555-123-4567", "(555) 234-5678", "555.345.6789", "5551234567", "invalid"],
    "Signup_Date": ["2024-01-15", "Jan 20, 2024", "2024/02/01", "15-03-2024", None]
})

def clean_customers(df):
    """Clean and standardize customer data."""
    df = df.copy()
    
    # Step 1: Handle missing names
    df = df.dropna(subset=["Name"])
    
    # Step 2: Standardize names
    df["Name"] = df["Name"].str.strip().str.title()
    
    # Step 3: Standardize emails
    df["Email"] = df["Email"].str.lower().str.strip()
    
    # Step 4: Extract phone digits and validate (must be 10 digits)
    df["Phone"] = df["Phone"].str.replace(r"\D", "", regex=True)
    df["Phone_Valid"] = df["Phone"].str.len() == 10
    
    # Step 5: Parse dates
    df["Signup_Date"] = pd.to_datetime(df["Signup_Date"], format="mixed", errors="coerce")
    
    # Step 6: Remove duplicate customers by email
    df = df.drop_duplicates(subset=["Email"], keep="first")
    
    return df

cleaned = clean_customers(customers)
print(cleaned)
print(f"\nValid phone numbers: {cleaned['Phone_Valid'].sum()}/{len(cleaned)}")
```

---

### Exercise 2: Sales Data Deduplication

```python
import pandas as pd

# Sales data with duplicates from system sync issues
sales = pd.DataFrame({
    "Order_ID": ["ORD001", "ORD002", "ORD001", "ORD003", "ORD002", "ORD004"],
    "Customer": ["Alice", "Bob", "Alice", "Charlie", "Bob", "Diana"],
    "Product": ["Laptop", "Mouse", "Laptop", "Keyboard", "Mouse", "Monitor"],
    "Amount": [999.99, 29.99, 999.99, 79.99, 29.99, 299.99],
    "Date": ["2024-01-15", "2024-01-15", "2024-01-15", "2024-01-16", "2024-01-15", "2024-01-16"]
})

def deduplicate_sales(df):
    """Remove duplicate orders while preserving data integrity."""
    df = df.copy()
    
    # Find and report duplicates
    duplicates = df[df.duplicated(subset=["Order_ID"], keep=False)]
    print(f"Found {len(duplicates)} duplicate records from {duplicates['Order_ID'].nunique()} orders")
    
    # Keep first occurrence of each order
    df_clean = df.drop_duplicates(subset=["Order_ID"], keep="first")
    
    # Verify no duplicates remain
    assert df_clean["Order_ID"].is_unique, "Duplicates still exist!"
    
    print(f"Cleaned: {len(df)} → {len(df_clean)} records")
    return df_clean

cleaned_sales = deduplicate_sales(sales)
print(f"\nTotal revenue: ${cleaned_sales['Amount'].sum():,.2f}")
```

---

### Exercise 3: Complete Data Pipeline

```python
import pandas as pd
import numpy as np

# Messy e-commerce data
raw_data = pd.DataFrame({
    "product_name": ["  LAPTOP PRO ", "mouse", "LAPTOP PRO", "Keyboard", None, "monitor"],
    "price": ["$999.99", "$29.99", "$999.99", "79.99", "$199.99", "$-50"],
    "category": ["Electronics", "electronics", "ELECTRONICS", "Electronics", "Home", "Electronics"],
    "rating": [4.5, 3.8, 4.5, 4.2, None, 6.0],  # 6.0 is invalid (max 5)
    "stock": ["100", "50", "100", "75", "25", "-10"]  # -10 is invalid
})

def clean_ecommerce_data(df):
    """Complete cleaning pipeline for e-commerce data."""
    df = df.copy()
    print(f"Starting with {len(df)} records")
    
    # 1. Drop rows with missing product names
    df = df.dropna(subset=["product_name"])
    print(f"After dropping null names: {len(df)}")
    
    # 2. Clean product names
    df["product_name"] = df["product_name"].str.strip().str.title()
    
    # 3. Clean and convert prices
    df["price"] = (
        df["price"]
        .str.replace(r"[$,]", "", regex=True)
        .astype(float)
    )
    
    # 4. Remove invalid prices (negative or zero)
    df = df[df["price"] > 0]
    print(f"After removing invalid prices: {len(df)}")
    
    # 5. Standardize categories
    df["category"] = df["category"].str.lower().str.strip()
    
    # 6. Fix invalid ratings (cap at 5.0)
    df["rating"] = df["rating"].clip(upper=5.0)
    df["rating"] = df["rating"].fillna(df["rating"].median())
    
    # 7. Convert and validate stock
    df["stock"] = df["stock"].astype(int)
    df = df[df["stock"] >= 0]
    print(f"After removing invalid stock: {len(df)}")
    
    # 8. Remove duplicates
    df = df.drop_duplicates(subset=["product_name"], keep="first")
    print(f"After deduplication: {len(df)}")
    
    return df.reset_index(drop=True)

cleaned = clean_ecommerce_data(raw_data)
print("\nCleaned Data:")
print(cleaned)
```

---

## Mastery Check

### Question 1: Missing Value Strategy

When would you use median instead of mean to fill missing values?

<details>
<summary>Click for Answer</summary>

**Use median when:**

- Data is skewed (has outliers)
- Distribution is not normal
- You want a value that represents the "typical" case

**Example:**

```python
salaries = [50000, 55000, 52000, 1000000]  # CEO outlier
mean_salary = np.mean(salaries)     # 289,250 (misleading)
median_salary = np.median(salaries)  # 53,500 (realistic)
```

Median is robust to outliers while mean gets pulled toward extreme values.

</details>

---

### Question 2: Duplicate Detection

What's the difference between `df.duplicated()` and `df.duplicated(keep=False)`?

<details>
<summary>Click for Answer</summary>

- `df.duplicated()` - Marks duplicates as `True`, but keeps the **first occurrence** as `False`
- `df.duplicated(keep=False)` - Marks **ALL** duplicate rows as `True`, including the first occurrence

**Example:**

```python
df = pd.DataFrame({"id": [1, 2, 1, 3]})

df.duplicated()           # [False, False, True, False] - only the second "1" is marked
df.duplicated(keep=False) # [True, False, True, False]  - both "1"s are marked
```

Use `keep=False` when you want to inspect all duplicate records before deciding which to keep.

</details>

---

### Question 3: Outlier Handling

Why might you cap outliers (winsorize) instead of removing them?

<details>
<summary>Click for Answer</summary>

**Reasons to cap instead of remove:**

1. **Preserve sample size**: Removing outliers reduces data, which may affect statistical power
2. **Real data**: Outliers might be legitimate (a CEO's salary is a real data point)
3. **Downstream impact**: Models may need complete data (no dropped rows)
4. **Partial information**: You keep the knowledge that "this was a high value" even if capped

**Example:**

```python
# Instead of dropping the $50,000 outlier, cap it
df["revenue"] = df["revenue"].clip(upper=upper_bound)
# Now it's still marked as "high" (at the cap) without distorting the mean
```

</details>

---

### Question 4: Debugging Challenge

This cleaning code has a bug. Find and fix it:

```python
df["price"] = df["price"].str.replace("$", "").astype(float)
```

When applied to prices like "$1,234.56", what goes wrong?

<details>
<summary>Click for Answer</summary>

**Bug**: The comma in "$1,234.56" causes `astype(float)` to fail because "1,234.56" is not a valid float.

**Error**: `ValueError: could not convert string to float: '1,234.56'`

**Fix**:

```python
df["price"] = (
    df["price"]
    .str.replace("$", "", regex=False)
    .str.replace(",", "", regex=False)
    .astype(float)
)
# Or use regex to remove all non-numeric except decimal:
df["price"] = df["price"].str.replace(r"[^\d.]", "", regex=True).astype(float)
```

</details>

---

### Question 5: Design Scenario

You're cleaning customer data and find 15% of records have missing phone numbers. How do you decide whether to drop, fill, or flag these records?

<details>
<summary>Click for Answer</summary>

**Decision framework:**

1. **Is phone number critical for analysis?**
   - If doing phone-based marketing analysis → may need to drop
   - If doing general customer segmentation → probably okay to keep

2. **Is there a reasonable fill value?**
   - Phone numbers are unique → cannot fill with mean/mode
   - Could fill with "Unknown" or leave as null

3. **Would dropping hurt the analysis?**
   - 15% is significant; dropping may bias results
   - Check if missing phones correlate with other variables (e.g., older customers)

4. **Best practice**: Create a flag column and keep the records:

   ```python
   df["phone_missing"] = df["phone"].isnull()
   df["phone"] = df["phone"].fillna("Unknown")
   ```

   This preserves the information that phone was missing (useful for analysis) while keeping all records.

</details>

---

## Summary

Today you learned:

- ✅ Handle missing data: drop, fill with statistics, or forward-fill
- ✅ Convert types: strings to numbers, dates, categories
- ✅ Standardize text: case normalization, whitespace removal
- ✅ Remove duplicates based on key columns
- ✅ Detect and handle outliers using IQR or Z-scores
- ✅ Build idempotent, logged cleaning pipelines

**Tomorrow**: Statistical foundations for business analysis—understanding what your clean data is actually telling you.
