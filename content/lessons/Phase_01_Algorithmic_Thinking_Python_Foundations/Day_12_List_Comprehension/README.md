---
day: 12
title: "List Comprehensions"
phase: 1
phaseTitle: "Algorithmic Thinking & Python Foundations"
slug: "list-comprehensions"
duration: 45
difficulty: "beginner"
tags:
  - python
  - list-comprehensions
  - functional
  - pythonic
concepts:
  - "basic list comprehension"
  - "conditional comprehensions"
  - "nested comprehensions"
  - "dict and set comprehensions"
prerequisites: [1, 2, 5, 10]
outcomes:
  - "Create lists using comprehension syntax"
  - "Filter data with conditional comprehensions"
  - "Transform collections efficiently"
---

# 🎯 Day 12: List Comprehensions

> *"Write in one line what others write in five. That's the Pythonic way."*

---

## The "Never-Coded" Bridge

**You know how spreadsheets have formulas that apply to entire columns?**

Click on cell B1, type `=A1*2`, drag it down to B100, and every row applies the same transformation. You didn't write 100 separate formulas.

List comprehensions are Python's equivalent. Instead of:

```python
# Manual approach (4 lines)
doubled = []
for x in [1, 2, 3, 4, 5]:
    doubled.append(x * 2)
```

This single line demonstrates the core pattern of a list comprehension: it reads almost like plain English ("give me `x * 2` for each `x` in this list") and eliminates the ceremony of initializing an empty list and calling `.append()`. The same pattern scales to hundreds of items with no extra code.

You write:

```python
# Comprehension (1 line)
doubled = [x * 2 for x in [1, 2, 3, 4, 5]]
```

Same result. Less code. More readable (once you learn the pattern).

---

## The Technical Deep Dive

### Basic Syntax

```python
# [expression for item in iterable]

numbers = [1, 2, 3, 4, 5]

# Double each number
doubled = [x * 2 for x in numbers]
# [2, 4, 6, 8, 10]

# Square each number
squares = [x**2 for x in numbers]
# [1, 4, 9, 16, 25]

# Convert to strings
strings = [str(x) for x in numbers]
# ['1', '2', '3', '4', '5']
```

### With Conditional Filtering

```python
# [expression for item in iterable if condition]

numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

# Only even numbers
evens = [x for x in numbers if x % 2 == 0]
# [2, 4, 6, 8, 10]

# Squares of even numbers
even_squares = [x**2 for x in numbers if x % 2 == 0]
# [4, 16, 36, 64, 100]

# Filter by length
words = ["cat", "elephant", "dog", "hippopotamus"]
long_words = [w for w in words if len(w) > 5]
# ['elephant', 'hippopotamus']
```

### Conditional Expression (if-else)

```python
# [expr_if_true if condition else expr_if_false for item in iterable]

numbers = [1, 2, 3, 4, 5]

# Label as even or odd
labels = ["even" if x % 2 == 0 else "odd" for x in numbers]
# ['odd', 'even', 'odd', 'even', 'odd']

# Cap values at 3
capped = [x if x <= 3 else 3 for x in numbers]
# [1, 2, 3, 3, 3]
```

### Working with Strings

```python
# Process list of names
names = ["  Alice  ", "BOB", "charlie"]

# Clean and standardize
clean_names = [name.strip().title() for name in names]
# ['Alice', 'Bob', 'Charlie']

# Extract first letters
initials = [name[0].upper() for name in clean_names]
# ['A', 'B', 'C']

# Filter by starting letter
a_names = [n for n in clean_names if n.startswith("A")]
# ['Alice']
```

### Nested Loops in Comprehensions

```python
# Flatten a 2D list
matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
flat = [num for row in matrix for num in row]
# [1, 2, 3, 4, 5, 6, 7, 8, 9]

# Cartesian product
colors = ["red", "blue"]
sizes = ["S", "M", "L"]
combinations = [(c, s) for c in colors for s in sizes]
# [('red', 'S'), ('red', 'M'), ('red', 'L'),
#  ('blue', 'S'), ('blue', 'M'), ('blue', 'L')]
```

### Dictionary Comprehensions

```python
# {key_expr: value_expr for item in iterable}

names = ["Alice", "Bob", "Charlie"]

# Name to length
lengths = {name: len(name) for name in names}
# {'Alice': 5, 'Bob': 3, 'Charlie': 7}

# Swap keys and values
original = {"a": 1, "b": 2, "c": 3}
swapped = {v: k for k, v in original.items()}
# {1: 'a', 2: 'b', 3: 'c'}

# Filter dictionary
prices = {"apple": 1.50, "banana": 0.75, "kiwi": 2.00}
expensive = {k: v for k, v in prices.items() if v > 1}
# {'apple': 1.50, 'kiwi': 2.00}
```

### Set Comprehensions

```python
# {expression for item in iterable}

words = ["hello", "world", "hello", "python", "world"]

# Unique first letters
first_letters = {w[0] for w in words}
# {'h', 'w', 'p'}

# Unique lengths
lengths = {len(w) for w in words}
# {5, 6}
```

---

## Senior-Level Insights

### When NOT to Use Comprehensions

```python
# Too complex - use regular loop
# Bad:
result = [
    process(x) if complex_condition(x) else fallback(x)
    for x in items
    if filter1(x) and filter2(x)
]

# Good - clearer with loop
result = []
for x in items:
    if filter1(x) and filter2(x):
        if complex_condition(x):
            result.append(process(x))
        else:
            result.append(fallback(x))
```

**Rule of thumb**: If it doesn't fit on one readable line, use a loop.

### Generator Expressions (Memory Efficient)

```python
# List comprehension - stores all in memory
big_list = [x**2 for x in range(1_000_000)]  # ~40MB

# Generator expression - computes on demand
big_gen = (x**2 for x in range(1_000_000))  # ~100 bytes

# Use generator when you only need to iterate once
total = sum(x**2 for x in range(1_000_000))  # No brackets needed
```

### Performance Comparison

```python
import time

data = list(range(100_000))

# Loop approach
start = time.time()
loop_result = []
for x in data:
    loop_result.append(x * 2)
loop_time = time.time() - start

# Comprehension approach
start = time.time()
comp_result = [x * 2 for x in data]
comp_time = time.time() - start

# Comprehensions are typically 10-30% faster
print(f"Loop: {loop_time:.4f}s")
print(f"Comprehension: {comp_time:.4f}s")
```

### Performance: Comprehensions vs. Loops

List comprehensions are not just syntactic sugar — they execute at C speed internally. Python's bytecode for a list comprehension is more optimized than an equivalent `for` loop with `.append()`, because the interpreter avoids repeated attribute lookups on the list object and handles the iteration in a tighter internal loop.

```python
import timeit

# Traditional loop
def using_loop():
    result = []
    for x in range(10000):
        if x % 2 == 0:
            result.append(x * 2)
    return result

# List comprehension
def using_comprehension():
    return [x * 2 for x in range(10000) if x % 2 == 0]

# Comprehensions are typically 30-50% faster on large datasets
loop_time = timeit.timeit(using_loop, number=1000)
comp_time = timeit.timeit(using_comprehension, number=1000)
print(f"Loop:          {loop_time:.3f}s")
print(f"Comprehension: {comp_time:.3f}s")
```

For large datasets (100k+ items), this speed difference compounds significantly — a 30% speedup that runs 1,000 times per day adds up fast in production pipelines.

**But**: complex comprehensions with multiple operations or nested conditionals should be split into loops for readability. Correctness and maintainability come before cleverness.

### Walrus Operator (Python 3.8+)

```python
# Avoid computing expression twice
results = [y for x in data if (y := expensive_function(x)) > threshold]

# Without walrus (computes twice)
results = [expensive_function(x) for x in data if expensive_function(x) > threshold]
```

---

## Hands-on Lab

### Exercise 1: Sales Data Processing

**Goal**: Transform and filter sales data.

```python
sales = [
    {"product": "Laptop", "price": 999, "quantity": 5},
    {"product": "Mouse", "price": 29, "quantity": 50},
    {"product": "Keyboard", "price": 79, "quantity": 30},
    {"product": "Monitor", "price": 299, "quantity": 15},
]

# Calculate revenue for each product
revenues = [s["price"] * s["quantity"] for s in sales]
print("Revenues:", revenues)

# Get products with revenue > $1000
high_value = [s["product"] for s in sales if s["price"] * s["quantity"] > 1000]
print("High-value products:", high_value)

# Create price lookup dictionary
price_lookup = {s["product"]: s["price"] for s in sales}
print("Price lookup:", price_lookup)

# Total revenue
total = sum(s["price"] * s["quantity"] for s in sales)
print(f"Total revenue: ${total:,}")
```

**Expected Output:**
```
Revenues: [4995, 1450, 2370, 4485]
High-value products: ['Laptop', 'Mouse', 'Keyboard', 'Monitor']
Price lookup: {'Laptop': 999, 'Mouse': 29, 'Keyboard': 79, 'Monitor': 299}
Total revenue: $13,300
```

---

### Exercise 2: Text Processing Pipeline

**Goal**: Clean and analyze text data.

```python
raw_data = [
    "  ALICE@EMAIL.COM  ",
    "bob@company.org",
    "  CHARLIE@DOMAIN.NET",
    "invalid-email",
    "diana@test.io  ",
]

# Step 1: Clean all entries
cleaned = [email.strip().lower() for email in raw_data]
print("Cleaned:", cleaned)

# Step 2: Filter valid emails
valid = [e for e in cleaned if "@" in e and "." in e.split("@")[1]]
print("Valid:", valid)

# Step 3: Extract domains
domains = {e.split("@")[1] for e in valid}
print("Unique domains:", domains)

# Step 4: Group by domain
from collections import defaultdict

by_domain = defaultdict(list)
for email in valid:
    domain = email.split("@")[1]
    by_domain[domain].append(email)
print("By domain:", dict(by_domain))
```

**Expected Output:**
```
Cleaned: ['alice@email.com', 'bob@company.org', 'charlie@domain.net', 'invalid-email', 'diana@test.io']
Valid: ['alice@email.com', 'bob@company.org', 'charlie@domain.net', 'diana@test.io']
Unique domains: {'email.com', 'company.org', 'domain.net', 'test.io'}  # order may vary (set)
By domain: {'email.com': ['alice@email.com'], 'company.org': ['bob@company.org'], 'domain.net': ['charlie@domain.net'], 'test.io': ['diana@test.io']}
```

---

### Exercise 3: Matrix Operations

**Goal**: Perform matrix transformations.

```python
# 3x3 matrix
matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]

# Flatten to 1D list
flat = [n for row in matrix for n in row]
print("Flattened:", flat)

# Transpose matrix
transposed = [[row[i] for row in matrix] for i in range(len(matrix[0]))]
print("Transposed:")
for row in transposed:
    print(row)

# Get all values > 5
greater_than_5 = [n for row in matrix for n in row if n > 5]
print("Values > 5:", greater_than_5)

# Double every value (new matrix)
doubled_matrix = [[n * 2 for n in row] for row in matrix]
print("Doubled:")
for row in doubled_matrix:
    print(row)
```

**Expected Output:**
```
Flattened: [1, 2, 3, 4, 5, 6, 7, 8, 9]
Transposed:
[1, 4, 7]
[2, 5, 8]
[3, 6, 9]
Values > 5: [6, 7, 8, 9]
Doubled:
[2, 4, 6]
[8, 10, 12]
[14, 16, 18]
```

---

## Mastery Check

### Question 1: Basic Comprehension

Convert to list comprehension:

```python
result = []
for x in range(10):
    result.append(x**2)
```

<details>
<summary>Click for Answer</summary>

```python
result = [x**2 for x in range(10)]
```

</details>

---

### Question 2: With Filter

Create a list of even numbers from 1-20, squared:

<details>
<summary>Click for Answer</summary>

```python
result = [x**2 for x in range(1, 21) if x % 2 == 0]
# [4, 16, 36, 64, 100, 144, 196, 256, 324, 400]
```

</details>

---

### Question 3: Conditional Expression

Create a list that replaces negative numbers with 0:

```python
numbers = [3, -1, 4, -1, 5, -9, 2, -6]
```

<details>
<summary>Click for Answer</summary>

```python
result = [n if n >= 0 else 0 for n in numbers]
# [3, 0, 4, 0, 5, 0, 2, 0]
```

</details>

---

### Question 4: Dictionary Comprehension

Create a dictionary mapping words to their lengths:

```python
words = ["Python", "is", "awesome"]
```

<details>
<summary>Click for Answer</summary>

```python
lengths = {word: len(word) for word in words}
# {'Python': 6, 'is': 2, 'awesome': 7}
```

</details>

---

### Question 5: Design Scenario

**Scenario**: Process a list of transactions, extracting:

1. Only transactions > $100
2. Calculate tax (8%) on each
3. Return list of tuples (original, tax, total)

```python
transactions = [50, 150, 200, 75, 300, 25]
```

<details>
<summary>Click for Answer</summary>

```python
transactions = [50, 150, 200, 75, 300, 25]

result = [(t, round(t * 0.08, 2), round(t * 1.08, 2)) for t in transactions if t > 100]

print(result)
# [(150, 12.0, 162.0), (200, 16.0, 216.0), (300, 24.0, 324.0)]

# With named tuple for clarity
from collections import namedtuple

TaxBreakdown = namedtuple("TaxBreakdown", ["amount", "tax", "total"])

result = [
    TaxBreakdown(t, round(t * 0.08, 2), round(t * 1.08, 2))
    for t in transactions
    if t > 100
]

for r in result:
    print(f"${r.amount} + ${r.tax} tax = ${r.total}")
```

</details>

---

## Summary

Today you learned:

- ✅ List comprehensions create lists in one line
- ✅ Filter with `if` at the end: `[x for x in list if condition]`
- ✅ Transform with `if-else`: `[a if cond else b for x in list]`
- ✅ Dictionary and set comprehensions follow similar patterns
- ✅ Generator expressions save memory for large datasets

**🎉 Congratulations!** You've completed **Phase 1: Algorithmic Thinking & Python Foundations**!

You now understand:

- Variables, data types, and operators
- Collections: lists, tuples, sets, dictionaries
- Control flow: conditionals and loops
- Functions and Pythonic list comprehensions

**Next Phase**: Functions, Modularity & Data Wrangling—where you'll learn to build larger, more organized programs.

**Next-step depth**: Before moving on, deepen your Phase 1 data-processing toolkit with [Day 11B: Generators & Iterators](../Day_11B_Generators_Iterators/README.md).

### What's Coming Next

**Phase 2: Functions, Modularity & Data Wrangling** — You've built strong foundations in Python syntax, data structures, and control flow. Phase 2 takes you from writing scripts to building programs. Key skills you'll develop:

- **Functions as building blocks**: writing reusable, well-named functions that do one thing clearly — the foundation of all production analytics code
- **Modules and packages**: organizing code across files so your projects stay maintainable as they grow
- **Data wrangling with Pandas**: reading, cleaning, transforming, and aggregating real datasets — the skill most in demand for MBA analysts
- **File I/O**: reading CSVs, Excel files, and JSON — the formats you'll encounter in every business context

The list comprehension and generator patterns you learned today will appear constantly in Phase 2 as concise, efficient tools for transforming and filtering data.

---

## Recurring Mini-Scenario Challenge: Retail Pulse Sales Tracker (Day 12)

Complete the end-of-phase version of `sales_tracker_phase1.py`.

**Challenge**

- Refactor at least one loop into a list comprehension (for example, collecting surge-day dates or discount-eligible days).
- Keep function boundaries from Day 11 and only replace internals where comprehension improves clarity.
- Produce a final runnable script that executes the full Day 2-12 flow in order.

**Measurable output**

- Print one final report line that includes both a KPI value and a computed list, e.g., `"FINAL_REPORT | weekly_revenue=... | surge_days=[...]"`.

---

## Glossary

- **List comprehension**: A concise one-line syntax for creating lists: `[expression for item in iterable if condition]`
- **Dictionary comprehension**: Similar syntax for creating dicts: `{k: v for k, v in items}`
- **Set comprehension**: Similar syntax for creating sets: `{expression for item in iterable}`
- **Generator expression**: Lazy version of list comprehension using parentheses: `(x for x in iterable)`
- **Expression**: The value or operation placed before `for` in a comprehension
- **Filter**: The optional `if condition` part of a comprehension that selects only matching items
- **`timeit`**: Python module for timing small code snippets to compare performance
- **Readability**: Code that is easily understood by humans; comprehensions aid readability up to moderate complexity
- **Nested comprehension**: A comprehension inside another comprehension (use sparingly)
- **Pythonic**: Code written in a style idiomatic to Python, leveraging its unique features effectively
