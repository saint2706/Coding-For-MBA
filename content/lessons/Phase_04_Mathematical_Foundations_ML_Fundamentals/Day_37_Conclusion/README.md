---
day: 37
title: "Python Review & ML Prep"
phase: 4
phaseTitle: "Mathematical Foundations & ML Fundamentals"
slug: "python-review-ml-prep"
duration: 45
difficulty: "intermediate"
tags:
  - python
  - review
  - machine-learning
  - numpy
  - pandas
concepts:
  - "NumPy array operations"
  - "Pandas data manipulation"
  - "visualization fundamentals"
  - "ML mindset preparation"
prerequisites: [22, 23, 24]
outcomes:
  - "Review and solidify core data skills"
  - "Perform vectorized computations with NumPy"
  - "Manipulate DataFrames with Pandas fluently"
  - "Understand the ML problem framing"
---

# 🎯 Day 37: Python Review & ML Preparation

> *"Before climbing the ML mountain, ensure your Python foundation is solid."*

---

## The "Never-Coded" Bridge

**You're about to start a data science job.** On your first day, the senior ML engineer asks you to prepare a dataset for training. "Clean it, explore it, visualize the relationships, and tell me what you find."

This is the moment where everything you've learned comes together. NumPy for fast numerical operations. Pandas for data wrangling. Matplotlib for visualization. These aren't separate tools—they're your integrated data science toolkit.

**Real-world context:**

- **Netflix** uses NumPy to process billions of viewing events at scale
- **Uber** relies on Pandas for exploratory data analysis of trip data
- **Airbnb** visualizes pricing trends to inform pricing algorithms

Today, we consolidate these skills before diving into machine learning. Think of this as your pre-flight checklist before takeoff.

---

## The Technical Deep Dive

### NumPy Essentials: The Foundation of Scientific Python

NumPy is the backbone of all Python data science. Machine learning libraries like scikit-learn and TensorFlow are built on NumPy arrays.

```python
import numpy as np

# Array creation - the building blocks
arr = np.array([1, 2, 3, 4, 5])  # From list
zeros = np.zeros((3, 4))  # 3x4 matrix of zeros
ones = np.ones((2, 3))  # 2x3 matrix of ones
identity = np.eye(3)  # 3x3 identity matrix
random = np.random.randn(100)  # 100 random normal values
linspace = np.linspace(0, 10, 50)  # 50 evenly spaced from 0 to 10
arange = np.arange(0, 10, 0.5)  # Step by 0.5

# Vectorized operations - why NumPy is fast
arr = np.array([1, 2, 3, 4, 5])
print(arr * 2)  # [2, 4, 6, 8, 10] - element-wise
print(arr**2)  # [1, 4, 9, 16, 25] - element-wise
print(arr + arr)  # [2, 4, 6, 8, 10] - element-wise

# Statistics - essential for ML
print(f"Mean: {arr.mean()}")
print(f"Std:  {arr.std()}")
print(f"Sum:  {arr.sum()}")
print(f"Min:  {arr.min()}, Max: {arr.max()}")

# Boolean indexing - filtering data
data = np.array([10, 25, 5, 30, 15])
print(data[data > 15])  # [25, 30] - only values > 15
print(data[data % 2 == 0])  # [10, 30] - only even values

# Reshaping - critical for ML input formats
flat = np.arange(12)
matrix = flat.reshape(3, 4)  # 3 rows, 4 columns
print(matrix.shape)  # (3, 4)
print(matrix.T.shape)  # (4, 3) - transpose

# Broadcasting - NumPy's superpower
matrix = np.array([[1, 2], [3, 4], [5, 6]])  # 3x2
scalar = 10
print(matrix + scalar)  # Adds 10 to every element
```

### Pandas Essentials: Data Manipulation Mastery

Pandas is your primary tool for loading, cleaning, and exploring data before ML.

```python
import pandas as pd

# Loading data
df = pd.read_csv("data.csv")

# First look - always do this
print(df.head())  # First 5 rows
print(df.info())  # Data types, missing values
print(df.describe())  # Statistics for numeric columns
print(df.shape)  # (rows, columns)
print(df.columns.tolist())  # Column names

# Selection - accessing data
df["column"]  # Single column (Series)
df[["col1", "col2"]]  # Multiple columns (DataFrame)
df.loc[0]  # Row by label
df.iloc[0]  # Row by position
df.loc[0:5, "column"]  # Slice rows, specific column

# Filtering - subset by condition
df[df["age"] > 30]  # Age over 30
df[(df["age"] > 30) & (df["city"] == "NYC")]  # Multiple conditions
df[df["category"].isin(["A", "B"])]  # In a list
df[df["name"].str.contains("John")]  # String matching

# Aggregation - computing statistics
df.groupby("category")["sales"].mean()  # Mean sales per category
df.groupby("category").agg(
    {
        "sales": "sum",
        "quantity": "mean",
        "customer_id": "nunique",  # Unique count
    }
)

# Creating new columns
df["revenue"] = df["price"] * df["quantity"]
df["year"] = pd.to_datetime(df["date"]).dt.year
df["age_group"] = pd.cut(
    df["age"], bins=[0, 18, 35, 50, 100], labels=["child", "young", "middle", "senior"]
)

# Handling missing values
df.isnull().sum()  # Count missing per column
df.dropna(subset=["critical_column"])  # Drop rows with missing
df.fillna({"age": df["age"].mean()})  # Fill with mean
```

### Visualization Essentials: Seeing Patterns

Before ML modeling, visualization helps you understand relationships in your data.

```python
import matplotlib.pyplot as plt
import seaborn as sns

# Set style
plt.style.use("seaborn-v0_8-whitegrid")

# Scatter plot - relationship between two variables
plt.figure(figsize=(10, 6))
plt.scatter(df["sqft"], df["price"], alpha=0.5)
plt.xlabel("Square Footage")
plt.ylabel("Price ($)")
plt.title("House Size vs Price")
plt.tight_layout()
plt.show()

# Histogram - distribution of a single variable
plt.figure(figsize=(10, 6))
plt.hist(df["salary"], bins=30, edgecolor="black", alpha=0.7)
plt.xlabel("Salary ($)")
plt.ylabel("Frequency")
plt.title("Salary Distribution")
plt.axvline(df["salary"].mean(), color="red", linestyle="--", label="Mean")
plt.legend()
plt.show()

# Box plot - distribution and outliers
plt.figure(figsize=(10, 6))
df.boxplot(column="salary", by="department")
plt.xlabel("Department")
plt.ylabel("Salary ($)")
plt.title("Salary by Department")
plt.suptitle("")  # Remove auto-title
plt.show()

# Correlation heatmap - relationships between all numeric columns
plt.figure(figsize=(10, 8))
correlation = df[["age", "income", "spending", "score"]].corr()
sns.heatmap(correlation, annot=True, cmap="coolwarm", center=0)
plt.title("Feature Correlations")
plt.tight_layout()
plt.show()

# Pair plot - all pairwise relationships (great for ML exploration)
sns.pairplot(df[["age", "income", "spending", "category"]], hue="category")
plt.show()
```

---

## Senior-Level Insights

### The ML Mindset Shift

| Traditional Programming       | Machine Learning                     |
| ----------------------------- | ------------------------------------ |
| Write rules → Apply to data   | Provide data + answers → Learn rules |
| Explicit logic for each case  | Patterns discovered automatically    |
| Debug by tracing logic        | Debug by analyzing predictions       |
| Performance = code efficiency | Performance = prediction accuracy    |

### Data Readiness Checklist

Before any ML project, ensure your data is ready:

| Check            | Question                         | Tool                                        |
| ---------------- | -------------------------------- | ------------------------------------------- |
| **Shape**        | How many samples? Features?      | `df.shape`                                  |
| **Types**        | All columns correct dtype?       | `df.dtypes`                                 |
| **Missing**      | Any null values?                 | `df.isnull().sum()`                         |
| **Duplicates**   | Any duplicate rows?              | `df.duplicated().sum()`                     |
| **Target**       | Is target variable defined?      | `df["target"].value_counts()`               |
| **Balance**      | Class imbalance?                 | `df["target"].value_counts(normalize=True)` |
| **Correlations** | Features correlated with target? | `df.corr()["target"]`                       |

### Memory Optimization for Large Datasets

```python
# Check memory usage
print(df.memory_usage(deep=True).sum() / 1e6, "MB")

# Optimize dtypes
df["category"] = df["category"].astype("category")  # String → Category
df["count"] = df["count"].astype("int32")  # int64 → int32
df["price"] = df["price"].astype("float32")  # float64 → float32

# For very large files, read in chunks
chunk_size = 10_000
chunks = pd.read_csv("huge_file.csv", chunksize=chunk_size)
for chunk in chunks:
    process(chunk)
```

---

## Hands-on Lab

### Exercise 1: NumPy Array Gymnastics

```python
import numpy as np

# Task: Create and manipulate arrays

# 1. Create a 5x5 matrix with values 1-25
matrix = np.arange(1, 26).reshape(5, 5)
print("Matrix:\n", matrix)

# 2. Extract the diagonal
diagonal = np.diag(matrix)
print("Diagonal:", diagonal)

# 3. Calculate row-wise and column-wise sums
row_sums = matrix.sum(axis=1)
col_sums = matrix.sum(axis=0)
print("Row sums:", row_sums)
print("Col sums:", col_sums)

# 4. Normalize each row to sum to 1
normalized = matrix / matrix.sum(axis=1, keepdims=True)
print("Row sums after normalization:", normalized.sum(axis=1))

# 5. Find indices of values greater than the mean
mean_val = matrix.mean()
indices = np.where(matrix > mean_val)
print(f"Values > {mean_val}: {matrix[indices]}")
```

---

### Exercise 2: Pandas Data Exploration

```python
import pandas as pd
import numpy as np

# Create sample dataset
np.random.seed(42)
n = 200

df = pd.DataFrame(
    {
        "customer_id": range(1, n + 1),
        "age": np.random.randint(18, 70, n),
        "income": np.random.normal(60000, 20000, n).round(2),
        "spending": np.random.normal(1000, 500, n).round(2),
        "category": np.random.choice(["Gold", "Silver", "Bronze"], n),
        "signup_date": pd.date_range("2020-01-01", periods=n, freq="D"),
    }
)
df.loc[0:10, "income"] = np.nan  # Add some missing values

# Task: Explore and prepare this dataset

# 1. Basic exploration
print(f"Shape: {df.shape}")
print(f"Missing values:\n{df.isnull().sum()}")
print(f"Data types:\n{df.dtypes}")

# 2. Handle missing income - fill with median by category
df["income"] = df.groupby("category")["income"].transform(
    lambda x: x.fillna(x.median())
)

# 3. Create derived features
df["age_group"] = pd.cut(
    df["age"], bins=[0, 30, 50, 100], labels=["Young", "Middle", "Senior"]
)
df["spending_ratio"] = df["spending"] / df["income"]
df["signup_year"] = df["signup_date"].dt.year
df["signup_month"] = df["signup_date"].dt.month

# 4. Aggregation
category_summary = (
    df.groupby("category")
    .agg(
        {
            "customer_id": "count",
            "income": "mean",
            "spending": "mean",
            "spending_ratio": "mean",
        }
    )
    .rename(columns={"customer_id": "count"})
)

print("\nCategory Summary:")
print(category_summary.round(2))

# 5. Identify high-value customers
high_value = df[(df["spending_ratio"] > 0.02) & (df["income"] > 70000)]
print(f"\nHigh-value customers: {len(high_value)}")
```

---

### Exercise 3: ML-Ready Data Preparation

```python
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

# Simulate a dataset for predicting purchase amount
np.random.seed(42)
n = 500

df = pd.DataFrame(
    {
        "age": np.random.randint(18, 65, n),
        "income": np.random.normal(55000, 15000, n),
        "website_visits": np.random.poisson(10, n),
        "email_clicks": np.random.poisson(5, n),
        "is_member": np.random.choice([0, 1], n, p=[0.7, 0.3]),
    }
)

# Target: purchase_amount influenced by features
df["purchase_amount"] = (
    50
    + 0.5 * df["age"]
    + 0.001 * df["income"]
    + 10 * df["website_visits"]
    + 15 * df["email_clicks"]
    + 50 * df["is_member"]
    + np.random.normal(0, 30, n)
)

# Task: Prepare for ML

# 1. Check for issues
print("Missing values:", df.isnull().sum().sum())
print("Negative incomes:", (df["income"] < 0).sum())

# 2. Fix negative incomes (data error)
df.loc[df["income"] < 0, "income"] = df["income"].median()

# 3. Visualize target distribution
plt.figure(figsize=(10, 4))
plt.subplot(1, 2, 1)
plt.hist(df["purchase_amount"], bins=30, edgecolor="black")
plt.title("Purchase Amount Distribution")

# 4. Check correlations with target
plt.subplot(1, 2, 2)
correlations = df.corr()["purchase_amount"].drop("purchase_amount").sort_values()
correlations.plot(kind="barh")
plt.title("Correlation with Target")
plt.tight_layout()
plt.show()

# 5. Prepare features (X) and target (y)
feature_columns = ["age", "income", "website_visits", "email_clicks", "is_member"]
X = df[feature_columns]
y = df["purchase_amount"]

print(f"\nFeatures shape: {X.shape}")
print(f"Target shape: {y.shape}")
print(f"Target range: {y.min():.2f} to {y.max():.2f}")
```

---

## Mastery Check

### Question 1: NumPy Broadcasting

What is the output of this code?

```python
a = np.array([[1], [2], [3]])  # Shape (3, 1)
b = np.array([10, 20, 30])  # Shape (3,)
print(a + b)
```

<details>
<summary>Click for Answer</summary>

**Output:**

```
[[11 21 31]
 [12 22 32]
 [13 23 33]]
```

**Explanation:** NumPy broadcasts `a` (3, 1) and `b` (3,) to shape (3, 3). Each row of `a` is added to the entire array `b`, creating a 3x3 result.

</details>

---

### Question 2: Pandas GroupBy

What does this code compute?

```python
df.groupby("department")["salary"].transform("mean")
```

<details>
<summary>Click for Answer</summary>

**Answer:** It returns a Series with the same length as the original DataFrame, where each employee's value is replaced by their department's mean salary.

This is useful for creating features like "salary relative to department average":

```python
df["salary_vs_dept_avg"] = df["salary"] / df.groupby("department")["salary"].transform(
    "mean"
)
```

Unlike `groupby().mean()` which returns one value per group, `transform()` returns values aligned with the original index.

</details>

---

### Question 3: Memory Efficiency

Why might you convert a column to `category` dtype?

<details>
<summary>Click for Answer</summary>

**Reasons to use category dtype:**

1. **Memory savings**: A column with 1 million rows but only 10 unique values stores 10 strings + 1M integer codes, not 1M strings

2. **Faster operations**: Groupby and comparison operations are faster with integer codes

3. **Ordering**: Categories can have an order (e.g., "low" < "medium" < "high")

**Example:**

```python
df["status"] = df["status"].astype("category")
# Memory reduction: often 10-50x for low-cardinality columns
```

Use for: status codes, categories, ratings, any column with few unique values relative to rows.

</details>

---

### Question 4: Visualization Choice

When exploring data for ML, which plot best shows the relationship between a categorical feature and a continuous target?

<details>
<summary>Click for Answer</summary>

**Answer:** Box plot (or violin plot)

```python
df.boxplot(column="price", by="category")
# or
sns.violinplot(x="category", y="price", data=df)
```

**Why:**

- Shows distribution of target for each category
- Reveals median, quartiles, and outliers
- Easy to compare across categories
- Identifies if category is useful for prediction

Alternatives: Strip plot (shows all points), bar plot with error bars (shows means).

</details>

---

### Question 5: ML Problem Framing

A company asks you to "predict which customers will churn next month." Frame this as an ML problem: What's X? What's y? What type of ML is this?

<details>
<summary>Click for Answer</summary>

**ML Problem Framing:**

- **X (Features):** Customer attributes
  - Demographics: age, location, tenure
  - Behavior: login frequency, support tickets, usage metrics
  - Financial: payment history, plan type, monthly spend

- **y (Target):** Binary label
  - 1 = churned (cancelled within 30 days)
  - 0 = retained

- **ML Type:** Supervised learning, specifically **binary classification**

**Key considerations:**

1. Need historical data with known outcomes
2. Define "churn" precisely (cancelled? reduced usage?)
3. Set prediction window (30 days before churn)
4. Handle class imbalance (typically few churners)

</details>

---

## Summary

Today you reviewed:

- ✅ NumPy for vectorized numerical operations
- ✅ Pandas for loading, cleaning, and exploring data
- ✅ Matplotlib/Seaborn for visualization
- ✅ The ML mindset: data + answers → learned rules
- ✅ Data readiness checklist before modeling

**Tomorrow**: Linear Algebra for Machine Learning—the mathematical language that powers all ML algorithms.
