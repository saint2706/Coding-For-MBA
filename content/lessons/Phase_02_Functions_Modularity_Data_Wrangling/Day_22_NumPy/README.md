---
day: 22
title: "NumPy Fundamentals"
phase: 2
phaseTitle: "Functions, Modularity & Data Wrangling"
slug: "numpy-fundamentals"
duration: 60
difficulty: "intermediate"
tags:
  - python
  - numpy
  - arrays
  - numerical-computing
concepts:
  - "ndarray creation"
  - "array operations"
  - "broadcasting"
  - "indexing and slicing"
prerequisites: [5, 10, 12]
outcomes:
  - "Create and manipulate NumPy arrays"
  - "Perform vectorized operations"
  - "Understand broadcasting rules"
---

# 🎯 Day 22: NumPy Fundamentals

> *"NumPy: where Python meets the speed of C for numerical computing."*

---

## What Is Vectorization?

**Vectorization** is the practice of replacing Python loops with array-level operations that execute in optimized C code. Instead of iterating element-by-element, you express the computation once and NumPy applies it to the entire array simultaneously.

```python
# Non-vectorized: Python loop (slow)
result = []
for salary in salaries:
    result.append(salary * 1.10)

# Vectorized: NumPy array operation (fast)
result = salaries * 1.10  # Applied to all 10,000 values at once
```

Why is it faster? Python loops carry per-iteration overhead (type checking, memory allocation, interpreter dispatch). NumPy operations delegate to pre-compiled C routines operating on contiguous memory blocks — no Python overhead per element. For large datasets, vectorized operations are typically **10–100× faster** than equivalent Python loops.

A 2D array like `X` below isn't really a grid in memory — it's one flat, contiguous block of numbers plus a little metadata (shape, data type, and "strides") that tells NumPy how far to jump to reach the next row or column:

![Diagram of a NumPy array data structure: a 4x3 matrix X is shown alongside its underlying flat data buffer, data type (8-byte integer), shape (4, 3), and strides (24, 8), which record how many bytes to skip to move one element or one row](images/phase-02/numpy-array-structure.webp)

*Figure from Harris, C.R., Millman, K.J., van der Walt, S.J. et al. "Array programming with NumPy." Nature 585, 357–362 (2020), via [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:The_NumPy_array_data_structure_and_its_associated_metadata_fields.webp), [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).*

---

## The "Never-Coded" Bridge

**Imagine calculating year-end bonuses for 10,000 employees:**

```python
# Pure Python: Loop through each employee
bonuses = []
for salary in salaries:
    bonuses.append(salary * 0.10)
# Time: ~50ms
```

```python
# NumPy: One operation on all employees
import numpy as np

bonuses = salaries * 0.10
# Time: ~0.5ms (100x faster!)
```

NumPy is the backbone of data science in Python. It provides:

- **Speed**: Operations happen in optimized C code
- **Simplicity**: Write math as you would on paper
- **Foundation**: Pandas, scikit-learn, TensorFlow all use NumPy

---

## The Technical Deep Dive

### Creating Arrays

```python
import numpy as np

# From Python lists
arr = np.array([1, 2, 3, 4, 5])

# Common array creation
zeros = np.zeros(5)  # [0., 0., 0., 0., 0.]
ones = np.ones((3, 3))  # 3x3 matrix of 1s
range_arr = np.arange(0, 10, 2)  # [0, 2, 4, 6, 8]
linspace = np.linspace(0, 1, 5)  # 5 evenly spaced: [0, 0.25, 0.5, 0.75, 1]

# Random arrays
random = np.random.rand(3, 3)  # Uniform [0,1)
normal = np.random.randn(3, 3)  # Standard normal
integers = np.random.randint(1, 100, size=10)  # Random integers
```

### Array Properties

```python
arr = np.array([[1, 2, 3], [4, 5, 6]])

arr.shape  # (2, 3) - 2 rows, 3 columns
arr.ndim  # 2 - dimensions
arr.size  # 6 - total elements
arr.dtype  # int64 - data type
```

### Indexing and Slicing

```python
arr = np.array([10, 20, 30, 40, 50])

# Basic indexing
arr[0]  # 10
arr[-1]  # 50
arr[1:4]  # [20, 30, 40]

# 2D arrays
matrix = np.array([[1, 2, 3], [4, 5, 6], [7, 8, 9]])

matrix[0, 0]  # 1 (row 0, col 0)
matrix[1, :]  # [4, 5, 6] (entire row 1)
matrix[:, 2]  # [3, 6, 9] (entire column 2)
matrix[0:2, 1:]  # [[2, 3], [5, 6]] (submatrix)
```

### Vectorized Operations

```python
arr = np.array([1, 2, 3, 4, 5])

# Arithmetic (applies to all elements)
arr + 10  # [11, 12, 13, 14, 15]
arr * 2  # [2, 4, 6, 8, 10]
arr**2  # [1, 4, 9, 16, 25]

# Array with array
a = np.array([1, 2, 3])
b = np.array([4, 5, 6])
a + b  # [5, 7, 9]
a * b  # [4, 10, 18]

# Comparison
arr > 3  # [False, False, False, True, True]
```

### Aggregation Functions

```python
arr = np.array([1, 2, 3, 4, 5])

np.sum(arr)  # 15
np.mean(arr)  # 3.0
np.std(arr)  # 1.414...
np.min(arr)  # 1
np.max(arr)  # 5
np.argmax(arr)  # 4 (index of max)

# 2D aggregation
matrix = np.array([[1, 2, 3], [4, 5, 6]])
np.sum(matrix)  # 21 (all elements)
np.sum(matrix, axis=0)  # [5, 7, 9] (column sums)
np.sum(matrix, axis=1)  # [6, 15] (row sums)
```

### Reshaping Arrays

```python
arr = np.arange(12)  # [0, 1, 2, ..., 11]

# Reshape to 3x4
reshaped = arr.reshape(3, 4)

# Flatten back to 1D
flat = reshaped.flatten()

# Transpose
transposed = reshaped.T  # 4x3
```

### Boolean Indexing

```python
arr = np.array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])

# Filter with condition
evens = arr[arr % 2 == 0]  # [2, 4, 6, 8, 10]
greater_5 = arr[arr > 5]  # [6, 7, 8, 9, 10]

# Multiple conditions
mask = (arr > 3) & (arr < 8)  # Use & for 'and', | for 'or'
filtered = arr[mask]  # [4, 5, 6, 7]
```

---

## Senior-Level Insights

### Broadcasting

NumPy automatically expands arrays for operations:

```python
# Scalar broadcasts to array
arr = np.array([1, 2, 3])
arr + 10  # [11, 12, 13] - 10 broadcasts

# 2D + 1D
matrix = np.ones((3, 3))
row = np.array([1, 2, 3])
matrix + row  # Adds row to each row of matrix

# Broadcasting rules:
# 1. Dimensions are compared from right to left
# 2. Dimensions must be equal OR one of them is 1
```

### Memory Efficiency: Views vs Copies

```python
original = np.array([1, 2, 3, 4, 5])

# View (shares memory)
view = original[1:4]
view[0] = 100
print(original)  # [1, 100, 3, 4, 5] - modified!

# Copy (independent)
copy = original[1:4].copy()
copy[0] = 999
print(original)  # [1, 100, 3, 4, 5] - unchanged
```

### Performance vs Pure Python

```python
import time

size = 1_000_000
python_list = list(range(size))
numpy_array = np.arange(size)

# Python list
start = time.time()
result = [x * 2 for x in python_list]
print(f"Python: {time.time() - start:.4f}s")

# NumPy array
start = time.time()
result = numpy_array * 2
print(f"NumPy: {time.time() - start:.4f}s")

# NumPy is typically 10-100x faster
```

---

## Hands-on Lab

### Exercise 1: Sales Analysis

**Goal**: Use axis-aware `np.sum`/`np.mean`/`np.argmax` on a 2D sales array to find totals, the best day, and the best product.

```python
import numpy as np

# Daily sales for 4 products over 5 days
sales = np.array(
    [
        [120, 95, 80, 110],  # Day 1
        [135, 88, 92, 105],  # Day 2
        [142, 102, 75, 98],  # Day 3
        [128, 98, 88, 115],  # Day 4
        [155, 110, 95, 108],  # Day 5
    ]
)

print("Sales Analysis:")
print(f"Total sales: {np.sum(sales)}")
print(f"Daily totals: {np.sum(sales, axis=1)}")
print(f"Product totals: {np.sum(sales, axis=0)}")
print(f"Best day overall: Day {np.argmax(np.sum(sales, axis=1)) + 1}")
print(f"Best product: Product {np.argmax(np.sum(sales, axis=0)) + 1}")
print(f"Average daily revenue: {np.mean(sales):.2f}")
```

**Expected Output:**

```
Sales Analysis:
Total sales: 2680
Daily totals: [405 420 417 429 468]
Product totals: [680 493 430 536]
Best day overall: Day 5
Best product: Product 1
Average daily revenue: 107.20
```

---

### Exercise 2: Portfolio Returns

**Goal**: Combine per-stock daily returns with portfolio weights via vectorized multiplication to compute weighted daily returns and volatility.

```python
import numpy as np

# Stock returns (%) for 5 stocks over 10 days
np.random.seed(42)
returns = np.random.randn(10, 5) * 2  # Daily returns in %

# Portfolio weights
weights = np.array([0.3, 0.25, 0.2, 0.15, 0.1])

# Calculate weighted portfolio return each day
portfolio_returns = np.sum(returns * weights, axis=1)

print("Portfolio Analysis:")
print(f"Average daily return: {np.mean(portfolio_returns):.2f}%")
print(f"Return volatility: {np.std(portfolio_returns):.2f}%")
print(f"Best day: {np.max(portfolio_returns):.2f}%")
print(f"Worst day: {np.min(portfolio_returns):.2f}%")
print(f"Days with positive return: {np.sum(portfolio_returns > 0)}")
```

**Expected Output (uses random seed 42 — deterministic):**

```
Portfolio Analysis:
Average daily return: -0.18%
Return volatility: 1.89%
Best day: 3.54%
Worst day: -4.25%
Days with positive return: 4
```

---

### Exercise 3: Data Cleaning

**Goal**: Replace sentinel error values with `NaN` using `np.where`, compute NaN-aware statistics, then fill the gaps with the mean.

```python
import numpy as np

# Sensor data with some invalid readings (-999 = missing)
readings = np.array([23.5, 24.1, -999, 25.0, 24.8, -999, 23.9, 24.5])

# Replace -999 with NaN
cleaned = np.where(readings == -999, np.nan, readings)

# Statistics ignoring NaN
print("Sensor Statistics:")
print(f"Valid readings: {np.sum(~np.isnan(cleaned))}")
print(f"Mean: {np.nanmean(cleaned):.2f}")
print(f"Std: {np.nanstd(cleaned):.2f}")

# Fill NaN with mean
filled = np.where(np.isnan(cleaned), np.nanmean(cleaned), cleaned)
print(f"Filled data: {filled}")
```

**Expected Output:**

```
Sensor Statistics:
Valid readings: 6
Mean: 24.30
Std: 0.57
Filled data: [23.5  24.1  24.3  25.   24.8  24.3  23.9  24.5]
```

---

## Mastery Check

### Question 1: Array Creation

Create a 4x4 identity matrix:

<details>
<summary>Click for Answer</summary>

```python
identity = np.eye(4)
# or
identity = np.identity(4)
```

</details>

---

### Question 2: Broadcasting

What does this produce?

```python
a = np.array([[1], [2], [3]])  # 3x1
b = np.array([10, 20, 30])  # 1x3 (broadcast to 3x3)
a + b
```

<details>
<summary>Click for Answer</summary>

```
[[11, 21, 31],
 [12, 22, 32],
 [13, 23, 33]]
```

The 3x1 column broadcasts across columns, and 1x3 row broadcasts down rows.

</details>

---

### Question 3: Filtering

Get all values > 50 from a 2D array:

<details>
<summary>Click for Answer</summary>

```python
arr = np.array([[30, 60, 45], [70, 20, 80]])
filtered = arr[arr > 50]  # [60, 70, 80]
```

</details>

---

### Question 4: Axis Understanding

Given shape (3, 4), what does `axis=0` operate on?

<details>
<summary>Click for Answer</summary>

`axis=0` operates **along rows** (down the columns). Result has shape (4,).

- `axis=0`: Collapse rows → result per column
- `axis=1`: Collapse columns → result per row

</details>

---

### Question 5: Design Scenario

**Scenario**: Calculate the Sharpe ratio for a stock given daily returns:

- Sharpe = (mean return - risk-free rate) / std deviation
- Risk-free rate: 0.02% daily

<details>
<summary>Click for Answer</summary>

```python
import numpy as np

# Daily returns (%)
returns = np.array([0.5, -0.3, 0.8, 0.1, -0.2, 0.6, -0.4, 0.3])

risk_free = 0.02  # 0.02% daily

# Calculate Sharpe ratio
excess_returns = returns - risk_free
sharpe_ratio = np.mean(excess_returns) / np.std(excess_returns)

print(f"Mean return: {np.mean(returns):.3f}%")
print(f"Volatility: {np.std(returns):.3f}%")
print(f"Sharpe ratio: {sharpe_ratio:.3f}")
```

</details>

---

## Summary

Today you learned:

- ✅ NumPy arrays are faster than Python lists
- ✅ Vectorized operations apply to all elements
- ✅ Axis parameter controls aggregation direction
- ✅ Boolean indexing filters arrays
- ✅ Broadcasting handles different-shaped arrays

**Tomorrow**: We'll explore **Pandas**—the data analysis powerhouse built on NumPy.

---

## Glossary

| Term | Definition |
|------|------------|
| Vectorization | Replacing Python loops with array-level operations that execute in optimized C code — the primary reason NumPy is 10–100× faster than pure Python. |
| Broadcasting | NumPy's mechanism for automatically expanding arrays of compatible shapes so element-wise operations can be performed without explicit copying. |
| ndarray | NumPy's core data structure: a fixed-type, contiguous-memory N-dimensional array that supports vectorized operations. |
| Axis | A dimension of an ndarray; `axis=0` refers to rows (collapse down columns), `axis=1` refers to columns (collapse across rows). |
| Shape | A tuple describing the size of each dimension of an array, e.g., `(3, 4)` for a 3-row, 4-column matrix. |
| Boolean Indexing | Filtering an array by passing a boolean mask (array of `True`/`False` values) as the index, e.g., `arr[arr > 5]`. |
| View | A NumPy array that shares underlying memory with another; modifying the view changes the original. |
| `np.nan` | A special floating-point value representing "Not a Number"; used to represent missing numeric data in NumPy arrays. |

## Task Block (Core / Stretch / Expert)

### Data Migration Thread (Days 22–24): Arrays → DataFrame Pipelines

### Core

- Implement a NumPy-only pipeline for a small sales dataset (clean, transform, aggregate).
- Document array shapes and dtypes at each step so migration targets are explicit.

### Stretch

- Identify two operations that become harder in raw arrays (e.g., labeled joins, mixed dtypes).
- Write migration notes mapping each NumPy step to a future Pandas equivalent.

### Expert

- Build a side-by-side prototype: same output from NumPy arrays and a minimal DataFrame version.
- Compare readability/performance tradeoffs and define migration criteria for Day 23.

## Common Grading Rubric (applies every day)

| Criterion | 1 - Emerging | 2 - Developing | 3 - Proficient | 4 - Strong |
|---|---|---|---|---|
| Correctness | Major logic errors; results frequently wrong. | Core path works but multiple inaccuracies remain. | Outputs are correct for expected inputs and checked with examples. | Outputs are consistently correct, including tricky cases and clear verification. |
| Robustness | Breaks on minor input changes or missing values. | Handles some variation but fails on common edge cases. | Handles expected edge cases with explicit guards/validation. | Gracefully handles unexpected data, with informative failures and recovery paths. |
| Readability | Hard to follow; unclear naming/structure. | Partially clear but inconsistent style or organization. | Clear naming, structure, and comments/docstrings where needed. | Highly readable, well-organized, and easy for teammates to extend quickly. |
| Reuse | One-off script with duplicated logic. | Some modularization, limited reuse. | Reusable functions/classes with sensible boundaries. | Well-factored components with clean interfaces and minimal duplication. |
