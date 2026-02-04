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
  - "Detect and remove outliers"
---

# 🎯 Day 25: Data Cleaning

> *"Data scientists spend 80% of their time cleaning data. Master this, and you're already ahead."*

---

## The "Never-Coded" Bridge

**Imagine you're preparing for a board meeting. Your analyst sends you a spreadsheet with:**
- Revenue figures: Some show "$125,000", others "125000", a few "125K"
- Dates: Mix of "Jan 15, 2024", "2024-01-15", "15/01/24", and even blanks
- Customer names: "ACME Corp", "Acme Corp.", "  acme corp", "ACME CORP"
- Product categories: "Electronics", "electronics", "ELECTRONICS ", "Electrnics" (typo)

**You have 2 hours before the meeting. In Excel, this means:**
- Manually checking 50,000 rows for inconsistencies
- Copy-pasting formulas that break on edge cases
- Praying you didn't miss something

**In Python with Pandas:**
```python
df = clean_pipeline(raw_data)  # 30 seconds, zero errors
```

This is data cleaning—transforming chaotic real-world data into analysis-ready datasets. It's not glamorous, but it's the difference between "gut feeling" decisions and data-driven strategy.

**Why does this matter for business?**
- That $2M revenue report? Wrong if your data has "$2M" and "2000000" mixed together.
- Customer segmentation? Impossible when "John Smith" appears 5 times with different spellings.
- Quarterly trends? Meaningless when dates are formatted inconsistently.

---

## The Technical Deep Dive

### Understanding Data Quality Dimensions

Before cleaning, assess these dimensions:

| Dimension    | Question                              | Example Issue                          |
| ------------ | ------------------------------------- | -------------------------------------- |
| Completeness | Are values missing?                   | 30% of phone numbers are blank         |
| Validity     | Do values conform to rules?           | Email "john@" is invalid               |
| Accuracy     | Are values correct?                   | Age = 150 years                        |
| Consistency  | Do values match across sources?       | "USA" vs "United States" vs "US"       |
| Uniformity   | Are formats standardized?             | "2024-01-15" vs "Jan 15, 2024"         |
| Uniqueness   | Are there unwanted duplicates?        | Same customer ID appears 3 times       |

### Detecting Missing Data

```python
import pandas as pd
import numpy as np

df = pd.DataFrame({
    "customer_id": [1, 2, 3, 4, 5],
    "name": ["Alice", None, "Charlie", "David", "Eve"],
    "email": ["alice@x.com", "bob@x.com", None, "david@x.com", "eve@x.com"],
    "revenue": [50000, 60000, np.nan, 45000, 52000],
    "region": ["East", "West", None, "East", "South"]
})

# Comprehensive missing data analysis
print("=== Missing Data Report ===")
print(f"Total cells: {df.size}")
print(f"Missing cells: {df.isnull().sum().sum()}")
print(f"Missing percentage: {(df.isnull().sum().sum() / df.size) * 100:.2f}%\n")

print("Missing by column:")
missing_summary = pd.DataFrame({
    'column': df.columns,
    'missing_count': df.isnull().sum().values,
    'missing_pct': (df.isnull().sum() / len(df) * 100).values
})
print(missing_summary)

# Visualize missing patterns
print("\nRows with any missing data:")
print(df[df.isnull().any(axis=1)])
```

### Handling Missing Data: The Decision Tree

```python
def handle_missing_data(df, column, strategy='auto'):
    """
    Intelligent missing data handler.
    
    Strategies:
    - 'drop': Remove rows (use when <5% missing)
    - 'mean': Fill with mean (numeric, normally distributed)
    - 'median': Fill with median (numeric, has outliers)
    - 'mode': Fill with most frequent (categorical)
    - 'forward_fill': Use previous value (time series)
    - 'flag': Create indicator column, then fill
    - 'model': Predict from other columns (advanced)
    """
    
    if strategy == 'auto':
        missing_pct = df[column].isnull().sum() / len(df)
        
        if missing_pct < 0.05:
            strategy = 'drop'
        elif df[column].dtype in ['float64', 'int64']:
            # Check for outliers
            if df[column].std() / df[column].mean() > 1:
                strategy = 'median'
            else:
                strategy = 'mean'
        else:
            strategy = 'mode'
    
    # Apply strategy
    if strategy == 'drop':
        df = df.dropna(subset=[column])
    
    elif strategy == 'mean':
        df[column].fillna(df[column].mean(), inplace=True)
    
    elif strategy == 'median':
        df[column].fillna(df[column].median(), inplace=True)
    
    elif strategy == 'mode':
        df[column].fillna(df[column].mode()[0], inplace=True)
    
    elif strategy == 'forward_fill':
        df[column].fillna(method='ffill', inplace=True)
    
    elif strategy == 'flag':
        df[f'{column}_was_missing'] = df[column].isnull()
        df[column].fillna(df[column].median(), inplace=True)
    
    return df

# Example usage
df = handle_missing_data(df, 'revenue', strategy='median')
df = handle_missing_data(df, 'region', strategy='mode')
```

### Type Conversion and Validation

```python
# Cleaning currency values
def clean_currency(value):
    """Convert various currency formats to float."""
    if pd.isna(value):
        return np.nan
    
    # Handle string conversions
    if isinstance(value, str):
        # Remove currency symbols, commas, spaces
        value = value.replace('$', '').replace('€', '').replace('£', '')
        value = value.replace(',', '').replace(' ', '')
        
        # Handle K (thousands) and M (millions)
        if value.endswith('K'):
            return float(value[:-1]) * 1_000
        elif value.endswith('M'):
            return float(value[:-1]) * 1_000_000
    
    return float(value)

# Apply to column
df['revenue'] = df['revenue'].apply(clean_currency)

# Date parsing with multiple formats
def parse_flexible_date(date_str):
    """Parse dates in multiple formats."""
    if pd.isna(date_str):
        return pd.NaT
    
    formats = [
        '%Y-%m-%d',       # 2024-01-15
        '%m/%d/%Y',       # 01/15/2024
        '%d/%m/%Y',       # 15/01/2024
        '%b %d, %Y',      # Jan 15, 2024
        '%B %d, %Y',      # January 15, 2024
        '%d-%m-%Y',       # 15-01-2024
    ]
    
    for fmt in formats:
        try:
            return pd.to_datetime(date_str, format=fmt)
        except:
            continue
    
    # Last resort: let pandas guess
    try:
        return pd.to_datetime(date_str)
    except:
        return pd.NaT

df['order_date'] = df['order_date'].apply(parse_flexible_date)

# Email validation
def is_valid_email(email):
    """Basic email validation."""
    if pd.isna(email):
        return False
    
    import re
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, str(email)))

df['email_valid'] = df['email'].apply(is_valid_email)
invalid_emails = df[~df['email_valid']]
```

### String Normalization

```python
def normalize_text(df, columns):
    """
    Comprehensive text normalization.
    
    Steps:
    1. Strip whitespace
    2. Lowercase (or title case for names)
    3. Remove special characters (optional)
    4. Fix encoding issues
    5. Standardize abbreviations
    """
    
    for col in columns:
        if col in df.columns:
            # Basic cleanup
            df[col] = df[col].str.strip()
            df[col] = df[col].str.replace(r'\s+', ' ', regex=True)  # Multiple spaces
            
            # Fix encoding issues
            df[col] = df[col].str.encode('ascii', 'ignore').str.decode('ascii')
    
    return df

# Standardize company names
def standardize_company_name(name):
    """Standardize company name variations."""
    if pd.isna(name):
        return name
    
    # Convert to title case
    name = name.strip().title()
    
    # Expand abbreviations
    replacements = {
        ' Inc.': ' Inc',
        ' Inc ': ' Inc',
        ' Corp.': ' Corp',
        ' Corp ': ' Corp',
        ' Ltd.': ' Ltd',
        ' Ltd ': ' Ltd',
        ' Llc': ' LLC',
        ' L.l.c': ' LLC',
    }
    
    for old, new in replacements.items():
        name = name.replace(old, new)
    
    return name.strip()

df['company'] = df['company'].apply(standardize_company_name)

# Fuzzy matching for similar strings
from difflib import get_close_matches

def find_canonical_value(value, canonical_list, cutoff=0.8):
    """Find closest match in canonical list."""
    matches = get_close_matches(value, canonical_list, n=1, cutoff=cutoff)
    return matches[0] if matches else value

# Example: standardize product categories
canonical_categories = ['Electronics', 'Furniture', 'Clothing', 'Food']
df['category_clean'] = df['category'].apply(
    lambda x: find_canonical_value(x, canonical_categories)
)
```

### Handling Duplicates

```python
# Identify duplicates
print("=== Duplicate Analysis ===")
print(f"Total rows: {len(df)}")
print(f"Duplicate rows: {df.duplicated().sum()}")
print(f"Unique on customer_id: {df['customer_id'].nunique()}")

# Find exact duplicates
exact_dupes = df[df.duplicated(keep=False)]
print(f"\nExact duplicates: {len(exact_dupes)}")

# Find duplicates based on key columns
key_dupes = df[df.duplicated(subset=['customer_id', 'order_date'], keep=False)]
print(f"Duplicates on key columns: {len(key_dupes)}")

# Intelligent duplicate removal
def remove_duplicates_smart(df, key_columns, keep_strategy='most_recent'):
    """
    Remove duplicates with business logic.
    
    Strategies:
    - 'most_recent': Keep row with latest date
    - 'highest_value': Keep row with highest value
    - 'most_complete': Keep row with fewest nulls
    """
    
    if keep_strategy == 'most_recent':
        # Assume 'updated_at' column exists
        df = df.sort_values('updated_at', ascending=False)
        df = df.drop_duplicates(subset=key_columns, keep='first')
    
    elif keep_strategy == 'highest_value':
        # Assume 'revenue' column exists
        df = df.sort_values('revenue', ascending=False)
        df = df.drop_duplicates(subset=key_columns, keep='first')
    
    elif keep_strategy == 'most_complete':
        # Calculate completeness score
        df['completeness'] = df.count(axis=1)
        df = df.sort_values('completeness', ascending=False)
        df = df.drop_duplicates(subset=key_columns, keep='first')
        df = df.drop('completeness', axis=1)
    
    return df

# Apply
df = remove_duplicates_smart(df, ['customer_id'], keep_strategy='most_complete')
```

### Outlier Detection and Treatment

```python
def detect_outliers_iqr(df, column):
    """Detect outliers using IQR method."""
    Q1 = df[column].quantile(0.25)
    Q3 = df[column].quantile(0.75)
    IQR = Q3 - Q1
    
    lower_bound = Q1 - 1.5 * IQR
    upper_bound = Q3 + 1.5 * IQR
    
    outliers = df[(df[column] < lower_bound) | (df[column] > upper_bound)]
    
    print(f"=== Outlier Detection: {column} ===")
    print(f"Q1 (25th percentile): {Q1:,.2f}")
    print(f"Q3 (75th percentile): {Q3:,.2f}")
    print(f"IQR: {IQR:,.2f}")
    print(f"Lower bound: {lower_bound:,.2f}")
    print(f"Upper bound: {upper_bound:,.2f}")
    print(f"Outliers found: {len(outliers)} ({len(outliers)/len(df)*100:.1f}%)")
    
    return outliers, lower_bound, upper_bound

# Z-score method for normally distributed data
def detect_outliers_zscore(df, column, threshold=3):
    """Detect outliers using Z-score method."""
    mean = df[column].mean()
    std = df[column].std()
    z_scores = (df[column] - mean) / std
    
    outliers = df[abs(z_scores) > threshold]
    
    print(f"=== Z-Score Outlier Detection: {column} ===")
    print(f"Mean: {mean:,.2f}")
    print(f"Std Dev: {std:,.2f}")
    print(f"Threshold: {threshold} standard deviations")
    print(f"Outliers found: {len(outliers)}")
    
    return outliers

# Treatment strategies
def treat_outliers(df, column, method='cap'):
    """
    Treat outliers.
    
    Methods:
    - 'cap': Cap at bounds (winsorization)
    - 'remove': Remove outlier rows
    - 'transform': Log transformation
    - 'flag': Create indicator, keep values
    """
    
    _, lower, upper = detect_outliers_iqr(df, column)
    
    if method == 'cap':
        df[column] = df[column].clip(lower=lower, upper=upper)
    
    elif method == 'remove':
        df = df[(df[column] >= lower) & (df[column] <= upper)]
    
    elif method == 'transform':
        # Log transformation for right-skewed data
        df[f'{column}_log'] = np.log1p(df[column])
    
    elif method == 'flag':
        df[f'{column}_is_outlier'] = (
            (df[column] < lower) | (df[column] > upper)
        )
    
    return df
```

---

## Senior-Level Insights

### Data Cleaning Pipeline Architecture

```python
class DataCleaningPipeline:
    """
    Production-grade data cleaning pipeline.
    
    Follows ETL principles:
    - Extract: Load raw data
    - Transform: Clean and standardize
    - Load: Output to clean dataset
    
    Includes:
    - Logging for audit trails
    - Data quality metrics
    - Rollback capability
    """
    
    def __init__(self, log_file='cleaning.log'):
        self.steps = []
        self.metrics = {}
        self.log_file = log_file
    
    def add_step(self, name, function):
        """Add a cleaning step to the pipeline."""
        self.steps.append((name, function))
        return self
    
    def execute(self, df):
        """Execute all cleaning steps."""
        import logging
        logging.basicConfig(filename=self.log_file, level=logging.INFO)
        
        original_shape = df.shape
        logging.info(f"Starting pipeline with {original_shape[0]} rows")
        
        for name, func in self.steps:
            try:
                df_before = df.shape
                df = func(df)
                df_after = df.shape
                
                logging.info(f"Step '{name}': {df_before} -> {df_after}")
                print(f"✓ {name}: {df_before[0]} -> {df_after[0]} rows")
                
            except Exception as e:
                logging.error(f"Step '{name}' failed: {str(e)}")
                raise
        
        final_shape = df.shape
        rows_removed = original_shape[0] - final_shape[0]
        
        print(f"\n=== Pipeline Complete ===")
        print(f"Original: {original_shape[0]} rows")
        print(f"Final: {final_shape[0]} rows")
        print(f"Removed: {rows_removed} rows ({rows_removed/original_shape[0]*100:.1f}%)")
        
        return df

# Example usage
pipeline = DataCleaningPipeline()

pipeline.add_step('Remove nulls in key columns', 
                  lambda df: df.dropna(subset=['customer_id', 'order_date']))

pipeline.add_step('Standardize names', 
                  lambda df: normalize_text(df, ['customer_name', 'company']))

pipeline.add_step('Clean currency', 
                  lambda df: df.assign(revenue=df['revenue'].apply(clean_currency)))

pipeline.add_step('Remove duplicates', 
                  lambda df: df.drop_duplicates(subset=['order_id']))

pipeline.add_step('Cap outliers', 
                  lambda df: treat_outliers(df, 'revenue', method='cap'))

clean_df = pipeline.execute(raw_df)
```

### Data Quality Scoring

```python
def calculate_data_quality_score(df):
    """
    Calculate overall data quality score (0-100).
    
    Components:
    - Completeness (40%): Percentage of non-null values
    - Validity (30%): Percentage passing validation rules
    - Consistency (20%): Percentage with standardized formats
    - Uniqueness (10%): Percentage without duplicates
    """
    
    # Completeness
    completeness = (1 - df.isnull().sum().sum() / df.size) * 100
    
    # Validity (example: email validation)
    validity = df['email'].apply(is_valid_email).mean() * 100 if 'email' in df.columns else 100
    
    # Consistency (example: date format)
    date_cols = df.select_dtypes(include=['datetime64']).columns
    consistency = 100 if len(date_cols) > 0 else 100
    
    # Uniqueness
    uniqueness = (1 - df.duplicated().sum() / len(df)) * 100
    
    # Weighted score
    score = (
        completeness * 0.4 +
        validity * 0.3 +
        consistency * 0.2 +
        uniqueness * 0.1
    )
    
    return {
        'overall_score': round(score, 2),
        'completeness': round(completeness, 2),
        'validity': round(validity, 2),
        'consistency': round(consistency, 2),
        'uniqueness': round(uniqueness, 2)
    }
```

### Performance Considerations

1. **Memory Efficiency**: 
   - Use `category` dtype for repeated strings (can save 90% memory)
   - Process in chunks for large files: `pd.read_csv(..., chunksize=10000)`

2. **Speed Optimization**:
   - Vectorized operations (`str.replace()`) beat `apply()` with Python functions
   - Use `pd.to_numeric(..., errors='coerce')` instead of try/except in apply

3. **Scalability**:
   - For >10GB data, consider Dask or PySpark
   - For databases, clean with SQL when possible (push computation to DB)

---

## Hands-on Lab

### Exercise 1: E-commerce Data Cleaning

**Goal**: Clean a messy e-commerce dataset.

```python
import pandas as pd
import numpy as np

# Generate messy e-commerce data
np.random.seed(42)
messy_data = pd.DataFrame({
    'Order_ID': ['ORD001', 'ORD002', 'ORD003', 'ORD002', 'ORD004', None],
    'Customer': ['  JOHN DOE', 'jane smith', 'JOHN DOE', 'Jane Smith ', 'bob jones', 'Alice Wonder'],
    'Email': ['john@email.com', 'JANE@EMAIL.COM', 'john@email.com', 'jane@email', 'bob@email.com', None],
    'Product': ['Laptop', 'laptop', 'Mouse', 'KEYBOARD', 'laptop ', 'Monitor'],
    'Price': ['$1,299.99', '1299.99', '$29.99', '79', '$1299.99', '$399'],
    'Quantity': [1, 2, 5, 1, 2, None],
    'Order_Date': ['2024-01-15', 'Jan 20, 2024', '01/25/2024', '20-01-2024', '2024/02/01', '2024-02-05']
})

print("=== Original Data ===")
print(messy_data)
print(f"\nShape: {messy_data.shape}")
print(f"Missing values: {messy_data.isnull().sum().sum()}")

# Your cleaning solution:
def clean_ecommerce_data(df):
    """Complete data cleaning pipeline."""
    df = df.copy()
    
    # Step 1: Handle missing Order_ID (critical field)
    df = df.dropna(subset=['Order_ID'])
    
    # Step 2: Standardize customer names
    df['Customer'] = df['Customer'].str.strip().str.title()
    
    # Step 3: Clean and validate emails
    df['Email'] = df['Email'].str.strip().str.lower()
    df['Email_Valid'] = df['Email'].str.contains(r'^[\w\.-]+@[\w\.-]+\.\w+$', na=False)
    
    # Step 4: Standardize product names
    df['Product'] = df['Product'].str.strip().str.title()
    
    # Step 5: Clean price data
    df['Price'] = df['Price'].str.replace(r'[$,]', '', regex=True).astype(float)
    
    # Step 6: Handle missing quantity (use 1 as default for orders)
    df['Quantity'] = df['Quantity'].fillna(1).astype(int)
    
    # Step 7: Parse dates
    df['Order_Date'] = pd.to_datetime(df['Order_Date'], format='mixed')
    
    # Step 8: Calculate total
    df['Total'] = df['Price'] * df['Quantity']
    
    # Step 9: Remove duplicates (keep first)
    df = df.drop_duplicates(subset=['Order_ID'], keep='first')
    
    # Step 10: Reset index
    df = df.reset_index(drop=True)
    
    return df

cleaned = clean_ecommerce_data(messy_data)

print("\n=== Cleaned Data ===")
print(cleaned)
print(f"\nShape: {cleaned.shape}")
print(f"Missing values: {cleaned.isnull().sum().sum()}")
print(f"\nData types:\n{cleaned.dtypes}")
```

**Expected Output:**
- Order_ID: No nulls, no duplicates
- Customer: Title case, no extra spaces
- Email: Lowercase, validated
- Product: Title case, standardized
- Price: Float type, ready for calculations
- Quantity: Integer, no nulls
- Order_Date: Datetime type
- Total: Calculated correctly

---

### Exercise 2: Financial Data Validation

**Goal**: Clean and validate financial transaction data with outliers.

```python
# Generate financial transaction data with issues
np.random.seed(42)
n_transactions = 1000

transactions = pd.DataFrame({
    'transaction_id': range(1, n_transactions + 1),
    'amount': np.random.lognormal(8, 2, n_transactions),  # Right-skewed
    'merchant': np.random.choice(['Amazon', 'AMAZON', 'amazon', 'Walmart', 'walmart '], n_transactions),
    'category': np.random.choice(['Food', 'Electronics', 'Clothing', 'FOOD', None], n_transactions),
    'status': np.random.choice(['completed', 'COMPLETED', 'pending', 'failed'], n_transactions)
})

# Add some data quality issues
transactions.loc[np.random.choice(transactions.index, 50), 'amount'] = np.random.uniform(100000, 1000000, 50)  # Outliers
transactions.loc[np.random.choice(transactions.index, 20), 'category'] = None  # Missing
transactions.loc[5, 'amount'] = -500  # Invalid negative

print("=== Before Cleaning ===")
print(f"Shape: {transactions.shape}")
print(f"Amount range: ${transactions['amount'].min():,.2f} to ${transactions['amount'].max():,.2f}")
print(f"Amount mean: ${transactions['amount'].mean():,.2f}")
print(f"Amount median: ${transactions['amount'].median():,.2f}")
print(f"Missing categories: {transactions['category'].isnull().sum()}")

# Your solution:
def clean_financial_data(df):
    """Clean financial transaction data."""
    df = df.copy()
    
    # 1. Remove invalid amounts (negative)
    df = df[df['amount'] > 0]
    
    # 2. Standardize merchant names
    df['merchant'] = df['merchant'].str.strip().str.title()
    
    # 3. Standardize categories
    df['category'] = df['category'].str.strip().str.title()
    df['category'] = df['category'].fillna('Uncategorized')
    
    # 4. Standardize status
    df['status'] = df['status'].str.lower().str.strip()
    
    # 5. Handle outliers (cap at 99th percentile)
    upper_limit = df['amount'].quantile(0.99)
    df['amount_original'] = df['amount']
    df['is_outlier'] = df['amount'] > upper_limit
    df['amount'] = df['amount'].clip(upper=upper_limit)
    
    return df

cleaned_transactions = clean_financial_data(transactions)

print("\n=== After Cleaning ===")
print(f"Shape: {cleaned_transactions.shape}")
print(f"Amount range: ${cleaned_transactions['amount'].min():,.2f} to ${cleaned_transactions['amount'].max():,.2f}")
print(f"Amount mean: ${cleaned_transactions['amount'].mean():,.2f}")
print(f"Amount median: ${cleaned_transactions['amount'].median():,.2f}")
print(f"Missing categories: {cleaned_transactions['category'].isnull().sum()}")
print(f"Outliers flagged: {cleaned_transactions['is_outlier'].sum()}")
```

---

### Exercise 3: Customer Master Data Deduplication

**Goal**: Identify and merge duplicate customer records.

```python
# Customer data with duplicates
customers = pd.DataFrame({
    'customer_id': [1, 2, 3, 4, 5, 6],
    'name': ['John Smith', 'JOHN SMITH', 'Jane Doe', 'Jane M. Doe', 'Bob Wilson', 'John Smith'],
    'email': ['john@email.com', 'JOHN@EMAIL.COM', 'jane@email.com', 'jane@email.com', 'bob@email.com', 'jsmith@email.com'],
    'phone': ['555-1234', '555-1234', '555-5678', '555-5678', '555-9012', None],
    'total_purchases': [5, 3, 8, 2, 1, 7],
    'last_purchase_date': ['2024-01-15', '2024-02-01', '2024-01-20', '2024-01-22', '2024-01-10', '2024-01-30']
})

print("=== Customer Data with Duplicates ===")
print(customers)

# Your solution:
def deduplicate_customers(df):
    """
    Intelligent customer deduplication.
    
    Logic:
    - Exact email match = same customer
    - Similar name + same phone = same customer
    - When merging: sum purchases, keep latest date
    """
    df = df.copy()
    
    # Standardize for comparison
    df['name_clean'] = df['name'].str.lower().str.strip()
    df['email_clean'] = df['email'].str.lower().str.strip()
    
    # Group by email (strongest identifier)
    groups = df.groupby('email_clean')
    
    merged_records = []
    for email, group in groups:
        # Merge this group into one record
        merged = {
            'customer_id': group['customer_id'].min(),  # Keep lowest ID
            'name': group['name'].iloc[0],  # Keep first name format
            'email': email,
            'phone': group['phone'].dropna().iloc[0] if not group['phone'].dropna().empty else None,
            'total_purchases': group['total_purchases'].sum(),
            'last_purchase_date': pd.to_datetime(group['last_purchase_date']).max()
        }
        merged_records.append(merged)
    
    result = pd.DataFrame(merged_records)
    return result

deduplicated = deduplicate_customers(customers)

print("\n=== After Deduplication ===")
print(deduplicated)
print(f"\nOriginal records: {len(customers)}")
print(f"Unique customers: {len(deduplicated)}")
print(f"Duplicates removed: {len(customers) - len(deduplicated)}")
```

---

## Mastery Check

### Question 1: Missing Data Strategy

You have a dataset with 1000 customer records. The 'income' column has 50 missing values (5%). Which strategy is most appropriate?

<details>
<summary>Click for Answer</summary>

**Answer: Drop the rows with missing income**

**Reasoning:**
- Only 5% missing = acceptable loss
- Income is typically important for analysis
- Filling with mean/median could introduce bias
- 950 records is still substantial for analysis

**Alternative**: If income is critical, could use regression to predict based on other features (age, location, etc.)

```python
# Simple approach
df_clean = df.dropna(subset=['income'])

# Advanced approach
from sklearn.linear_model import LinearRegression
model = LinearRegression()
# Train on complete cases, predict missing
```

</details>

---

### Question 2: Type Conversion

What's the best way to convert this price column to float?

```python
prices = pd.Series(['$1,234.56', '$567.89', '$12,345.67', '$89.00'])
```

<details>
<summary>Click for Answer</summary>

```python
# Best approach: vectorized string operations
prices_clean = prices.str.replace(r'[$,]', '', regex=True).astype(float)

# Result: [1234.56, 567.89, 12345.67, 89.00]
```

**Why this is best:**
- ✅ Vectorized (fast)
- ✅ Handles multiple characters in one call
- ✅ Regex removes both $ and , together
- ✅ No loops needed

**Avoid:**
```python
# Slow: apply with lambda
prices.apply(lambda x: float(x.replace('$', '').replace(',', '')))
```

</details>

---

### Question 3: Outlier Detection

Given this revenue data, identify outliers using the IQR method:

```python
revenue = pd.Series([1000, 1200, 1100, 1300, 1250, 15000, 1150, 1400, 1050, 1350])
```

<details>
<summary>Click for Answer</summary>

```python
# Calculate IQR
Q1 = revenue.quantile(0.25)  # 1112.5
Q3 = revenue.quantile(0.75)  # 1325.0
IQR = Q3 - Q1                 # 212.5

# Calculate bounds
lower = Q1 - 1.5 * IQR        # 793.75
upper = Q3 + 1.5 * IQR        # 1643.75

# Identify outliers
outliers = revenue[(revenue < lower) | (revenue > upper)]
# Result: [15000]

print(f"Outliers: {outliers.tolist()}")
print(f"Lower bound: {lower}")
print(f"Upper bound: {upper}")
```

**Interpretation**: 15000 is an outlier (>1643.75). Investigate: Is it a data entry error, or a legitimate large sale?

</details>

---

### Question 4: Duplicate Logic

You have customer orders. Some customers placed multiple orders (legitimate), but some orders are true duplicates (data error). How do you distinguish?

```python
orders = pd.DataFrame({
    'order_id': ['A1', 'A1', 'B2', 'C3', 'C3'],
    'customer': ['John', 'John', 'Jane', 'Bob', 'Bob'],
    'date': ['2024-01-15', '2024-01-15', '2024-01-16', '2024-01-20', '2024-01-20'],
    'amount': [100, 100, 200, 150, 150]
})
```

<details>
<summary>Click for Answer</summary>

**Answer: Use order_id as the unique identifier**

```python
# True duplicates: same order_id
true_duplicates = orders[orders.duplicated(subset=['order_id'], keep=False)]
print("True duplicates (data errors):")
print(true_duplicates)
# A1 and C3 appear twice each - these are errors

# Remove duplicates
clean_orders = orders.drop_duplicates(subset=['order_id'], keep='first')

# Multiple orders from same customer is NOT a duplicate
# John's order A1 is different from potential order A2
```

**Key principle**: Define what makes a record unique (the business key). Here it's `order_id`, not `customer`.

</details>

---

### Question 5: Production Pipeline Design

**Scenario**: You're building a nightly ETL pipeline that cleans transaction data. It must:
1. Run at 2 AM daily
2. Handle 100K+ rows
3. Log all changes
4. Alert on data quality issues
5. Be resumable if it fails

Design the architecture.

<details>
<summary>Click for Answer</summary>

```python
import pandas as pd
import logging
from datetime import datetime
import smtplib

class ProductionETLPipeline:
    """
    Production-grade ETL with monitoring and error handling.
    """
    
    def __init__(self, config):
        self.config = config
        self.setup_logging()
        self.metrics = {
            'start_time': datetime.now(),
            'rows_input': 0,
            'rows_output': 0,
            'errors': [],
            'warnings': []
        }
    
    def setup_logging(self):
        """Configure logging with rotation."""
        logging.basicConfig(
            filename=f'etl_{datetime.now().strftime("%Y%m%d")}.log',
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s'
        )
    
    def extract(self):
        """Load data from source."""
        try:
            logging.info("Starting extraction...")
            # Use chunking for large files
            chunks = []
            for chunk in pd.read_csv(self.config['source'], chunksize=10000):
                chunks.append(chunk)
            
            df = pd.concat(chunks, ignore_index=True)
            self.metrics['rows_input'] = len(df)
            logging.info(f"Extracted {len(df)} rows")
            return df
        
        except Exception as e:
            logging.error(f"Extraction failed: {e}")
            self.alert_error("Extraction failed", str(e))
            raise
    
    def transform(self, df):
        """Clean and transform data."""
        try:
            logging.info("Starting transformation...")
            
            # Create checkpoint before cleaning
            df.to_parquet('checkpoint_before_clean.parquet')
            
            # Apply cleaning steps
            df = self.clean_missing(df)
            df = self.clean_types(df)
            df = self.clean_duplicates(df)
            df = self.validate_business_rules(df)
            
            self.metrics['rows_output'] = len(df)
            
            # Calculate data quality score
            quality_score = self.calculate_quality(df)
            if quality_score < self.config['min_quality_threshold']:
                self.metrics['warnings'].append(f"Quality score {quality_score} below threshold")
                self.alert_warning("Low data quality", f"Score: {quality_score}")
            
            logging.info(f"Transformation complete. {len(df)} rows output")
            return df
        
        except Exception as e:
            logging.error(f"Transformation failed: {e}")
            # Restore from checkpoint
            df = pd.read_parquet('checkpoint_before_clean.parquet')
            raise
    
    def load(self, df):
        """Load to destination."""
        try:
            logging.info("Starting load...")
            df.to_csv(self.config['destination'], index=False)
            logging.info("Load complete")
        
        except Exception as e:
            logging.error(f"Load failed: {e}")
            self.alert_error("Load failed", str(e))
            raise
    
    def calculate_quality(self, df):
        """Calculate data quality score."""
        completeness = (1 - df.isnull().sum().sum() / df.size) * 100
        uniqueness = (1 - df.duplicated().sum() / len(df)) * 100
        return (completeness + uniqueness) / 2
    
    def alert_error(self, subject, message):
        """Send alert email on error."""
        # In production: send email/Slack/PagerDuty
        logging.error(f"ALERT: {subject} - {message}")
    
    def alert_warning(self, subject, message):
        """Send warning notification."""
        logging.warning(f"WARNING: {subject} - {message}")
    
    def run(self):
        """Execute full pipeline."""
        try:
            df = self.extract()
            df = self.transform(df)
            self.load(df)
            
            # Log metrics
            self.metrics['end_time'] = datetime.now()
            self.metrics['duration'] = (self.metrics['end_time'] - self.metrics['start_time']).seconds
            logging.info(f"Pipeline complete: {self.metrics}")
            
            return True
        
        except Exception as e:
            logging.error(f"Pipeline failed: {e}")
            return False

# Usage
config = {
    'source': 'raw_transactions.csv',
    'destination': 'clean_transactions.csv',
    'min_quality_threshold': 85
}

pipeline = ProductionETLPipeline(config)
success = pipeline.run()
```

**Key Production Features:**
1. ✅ Chunked reading for large files
2. ✅ Checkpoints for resumability
3. ✅ Comprehensive logging
4. ✅ Data quality monitoring
5. ✅ Error alerting
6. ✅ Metrics tracking

</details>

---

## Summary

Today you learned:
- ✅ Data quality has six dimensions: completeness, validity, accuracy, consistency, uniformity, uniqueness
- ✅ Missing data strategies: drop, fill (mean/median/mode), forward fill, or predictive modeling
- ✅ Type conversion: handle currency symbols, parse flexible dates, validate formats
- ✅ String normalization: strip, lowercase/title, remove special characters, fuzzy matching
- ✅ Duplicate detection: exact duplicates vs. business key duplicates
- ✅ Outlier detection: IQR method for general use, Z-score for normal distributions
- ✅ Production pipelines: logging, checkpoints, quality monitoring, error handling

**Tomorrow**: Statistical foundations for data analysis.
