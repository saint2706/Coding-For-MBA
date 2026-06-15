---
day: 13
title: "Higher-Order Functions"
phase: 2
phaseTitle: "Functions, Modularity & Data Wrangling"
slug: "higher-order-functions"
duration: 50
difficulty: "intermediate"
tags:
  - python
  - functional-programming
  - map-filter-reduce
  - lambda
concepts:
  - "functions as first-class objects"
  - "map, filter, reduce"
  - "lambda functions"
  - "closures"
prerequisites: [11, 12]
outcomes:
  - "Pass functions as arguments to other functions"
  - "Transform data with map, filter, and reduce"
  - "Create concise lambdas for inline operations"
---

# 🎯 Day 13: Higher-Order Functions

> *"When functions can manipulate other functions, you unlock a new paradigm of programming."*

---

## The "Never-Coded" Bridge

**Imagine you're a manager delegating tasks.** You don't just give instructions—you hand over entire procedures for your team to execute.

"Here's how to process expenses. Apply this to every receipt."
"Here's how to check for violations. Filter using this rule."
"Here's how to calculate totals. Reduce all numbers using this formula."

That's what higher-order functions do. They're functions that **take other functions as input** or **return functions as output**. You're not just passing data—you're passing behavior.

```python
# Pass a behavior (function) to transform data
prices = [10, 20, 30]
discounted = list(map(lambda p: p * 0.9, prices))
# [9.0, 18.0, 27.0]
```

---

## The Technical Deep Dive

### Functions as First-Class Objects

In Python, functions are objects. You can:

- Assign them to variables
- Pass them as arguments
- Return them from other functions

```python
def greet(name):
    return f"Hello, {name}!"


# Assign to variable
say_hi = greet
print(say_hi("Alice"))  # Hello, Alice!


# Pass as argument
def apply_twice(func, value):
    return func(func(value))


def double(x):
    return x * 2


print(apply_twice(double, 5))  # 20 (5 → 10 → 20)
```

### The `map()` Function

Apply a function to every item in an iterable:

```python
numbers = [1, 2, 3, 4, 5]

# Using map
squared = list(map(lambda x: x**2, numbers))
# [1, 4, 9, 16, 25]

# Equivalent comprehension
squared = [x**2 for x in numbers]

# With multiple iterables
a = [1, 2, 3]
b = [10, 20, 30]
sums = list(map(lambda x, y: x + y, a, b))
# [11, 22, 33]
```

### The `filter()` Function

Keep only items that satisfy a condition:

```python
numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

# Keep even numbers
evens = list(filter(lambda x: x % 2 == 0, numbers))
# [2, 4, 6, 8, 10]

# Equivalent comprehension
evens = [x for x in numbers if x % 2 == 0]

# Filter objects
products = [
    {"name": "Laptop", "price": 999},
    {"name": "Mouse", "price": 29},
    {"name": "Keyboard", "price": 79},
]
expensive = list(filter(lambda p: p["price"] > 50, products))
```

### The `reduce()` Function

Accumulate values into a single result:

```python
from functools import reduce

numbers = [1, 2, 3, 4, 5]

# Sum all numbers
total = reduce(lambda acc, x: acc + x, numbers)
# ((((1+2)+3)+4)+5) = 15

# Find maximum
maximum = reduce(lambda a, b: a if a > b else b, numbers)
# 5

# With initial value
total_plus_10 = reduce(lambda acc, x: acc + x, numbers, 10)
# 25
```

### Lambda Functions

Anonymous, inline functions:

```python
# Regular function
def square(x):
    return x**2


# Lambda equivalent
square = lambda x: x**2

# Common patterns
sorted(items, key=lambda x: x["price"])
map(lambda x: x.upper(), strings)
filter(lambda x: x > 0, numbers)
```

### Closures

Functions that remember their environment:

```python
def make_multiplier(factor):
    def multiplier(x):
        return x * factor  # 'factor' is captured

    return multiplier


double = make_multiplier(2)
triple = make_multiplier(3)

print(double(5))  # 10
print(triple(5))  # 15
```

---

## Senior-Level Insights

### Lazy Evaluation

`map` and `filter` return iterators (lazy evaluation):

```python
# This doesn't compute anything yet
squared = map(lambda x: x**2, range(1_000_000))

# Computation happens on iteration
for s in squared:
    print(s)  # Each computed on demand
```

### Functional vs. Comprehension

| Use Case          | Functional          | Comprehension                 |
| ----------------- | ------------------- | ----------------------------- |
| Simple transform  | `map(fn, items)`    | `[fn(x) for x in items]`      |
| Simple filter     | `filter(fn, items)` | `[x for x in items if fn(x)]` |
| Chaining many ops | Functional          | Comprehension                 |
| Readability       | Varies              | Often better                  |

**Modern Python preference**: List comprehensions for most cases, functional for complex pipelines.

### Partial Functions

Pre-fill some arguments:

```python
from functools import partial


def power(base, exponent):
    return base**exponent


square = partial(power, exponent=2)
cube = partial(power, exponent=3)

print(square(5))  # 25
print(cube(5))  # 125
```

---

## Hands-on Lab

### Exercise 1: Data Transformation Pipeline

```python
sales = [
    {"rep": "Alice", "amount": 5000},
    {"rep": "Bob", "amount": 3000},
    {"rep": "Charlie", "amount": 7500},
    {"rep": "Diana", "amount": 4200},
]

# Filter: Only sales >= 4000
top_sales = list(filter(lambda s: s["amount"] >= 4000, sales))

# Map: Add 10% bonus
with_bonus = list(map(lambda s: {**s, "bonus": s["amount"] * 0.1}, top_sales))

# Reduce: Total bonuses
from functools import reduce

total_bonus = reduce(lambda acc, s: acc + s["bonus"], with_bonus, 0)

print(f"Top performers: {len(top_sales)}")
print(f"Total bonus pool: ${total_bonus:,.2f}")
```

**Expected Output:**

```
Top performers: 3
Total bonus pool: $1,670.00
```

---

### Exercise 2: Building a Calculator Factory

```python
def create_operation(operator):
    """Factory for arithmetic operations."""
    operations = {
        "+": lambda a, b: a + b,
        "-": lambda a, b: a - b,
        "*": lambda a, b: a * b,
        "/": lambda a, b: a / b if b != 0 else None,
    }
    return operations.get(operator)


# Create operations
add = create_operation("+")
multiply = create_operation("*")

# Use them
print(add(5, 3))  # 8
print(multiply(4, 7))  # 28

# Apply dynamically
expression = [("+", 5, 3), ("*", 4, 7), ("-", 10, 4)]
results = [create_operation(op)(a, b) for op, a, b in expression]
print(results)  # [8, 28, 6]
```

**Expected Output:**

```
8
28
[8, 28, 6]
```

---

### Exercise 3: Sorting Complex Data

```python
products = [
    {"name": "Laptop", "price": 999, "rating": 4.5},
    {"name": "Mouse", "price": 29, "rating": 4.8},
    {"name": "Monitor", "price": 299, "rating": 4.2},
    {"name": "Keyboard", "price": 79, "rating": 4.7},
]

# Sort by price
by_price = sorted(products, key=lambda p: p["price"])

# Sort by rating (descending)
by_rating = sorted(products, key=lambda p: p["rating"], reverse=True)

# Sort by value (rating/price ratio)
by_value = sorted(products, key=lambda p: p["rating"] / p["price"], reverse=True)

print("Best value:")
for p in by_value:
    ratio = p["rating"] / p["price"] * 100
    print(f"  {p['name']}: {ratio:.2f} rating per $")
```

**Expected Output:**

```
Best value:
  Mouse: 1.66 rating per $
  Keyboard: 0.59 rating per $
  Laptop: 0.05 rating per $
  Monitor: 0.14 rating per $
```

---

## Mastery Check

### Question 1: Map Output

What does this return?

```python
list(map(lambda x: x.upper(), ["a", "b", "c"]))
```

<details>
<summary>Click for Answer</summary>

`['A', 'B', 'C']`

</details>

---

### Question 2: Filter Logic

What's the result?

```python
list(filter(lambda x: x, [0, 1, "", "hello", None, True]))
```

<details>
<summary>Click for Answer</summary>

`[1, 'hello', True]`

Filter keeps truthy values. 0, "", and None are falsy.

</details>

---

### Question 3: Reduce Understanding

Trace through this:

```python
from functools import reduce

reduce(lambda a, b: a * b, [1, 2, 3, 4])
```

<details>
<summary>Click for Answer</summary>

24

Step by step:

- 1 * 2 = 2
- 2 * 3 = 6
- 6 * 4 = 24

</details>

---

### Question 4: Closure Application

```python
def make_counter():
    count = 0

    def counter():
        nonlocal count
        count += 1
        return count

    return counter


c = make_counter()
print(c(), c(), c())
```

<details>
<summary>Click for Answer</summary>

`1 2 3`

Each call increments the captured `count` variable.

</details>

---

### Question 5: Design Scenario

**Scenario**: Create a data processing pipeline that:

1. Takes a list of transactions
2. Filters out refunds (negative amounts)
3. Applies tax (8%)
4. Calculates the grand total

<details>
<summary>Click for Answer</summary>

```python
from functools import reduce

transactions = [150, -30, 200, -15, 75, 300]

# Pipeline
result = reduce(
    lambda acc, x: acc + x,
    map(lambda x: x * 1.08, filter(lambda x: x > 0, transactions)),
    0,
)

print(f"Total with tax: ${result:.2f}")
# 150 + 200 + 75 + 300 = 725 * 1.08 = 783.00
```

</details>

---

## Summary

Today you learned:

- ✅ Functions are first-class objects in Python
- ✅ `map()` transforms every element
- ✅ `filter()` keeps matching elements  
- ✅ `reduce()` accumulates to a single value
- ✅ Closures capture their environment

**Tomorrow**: We'll explore **modules**—organizing code into reusable packages.

---

## Glossary

| Term | Definition |
|------|------------|
| Higher-Order Function | A function that accepts another function as an argument or returns a function as its output. |
| First-Class Object | A value that can be assigned to a variable, passed as an argument, or returned from a function; in Python, functions are first-class objects. |
| Lambda | An anonymous, single-expression function defined with the `lambda` keyword, e.g., `lambda x: x * 2`. |
| Closure | A function that retains access to variables from its enclosing scope even after that scope has finished executing. |
| Lazy Evaluation | A strategy where computation is deferred until the result is actually needed; `map()` and `filter()` return lazy iterators. |
| `map()` | A built-in that applies a function to every element of an iterable and returns a lazy iterator of results. |
| `filter()` | A built-in that returns a lazy iterator of items from an iterable for which the function returns `True`. |
| `reduce()` | From `functools`; collapses an iterable into a single value by applying a function cumulatively to pairs of elements. |
| Partial Function | A function created with `functools.partial` that pre-fills some arguments of another function. |

## Task Block (Core / Stretch / Expert)

### Core

- Complete one end-to-end task that applies today’s main concept to realistic business data.
- Add basic validation (assertions or checks) for normal and edge-case inputs.

### Stretch

- Refactor for modularity: split logic into reusable helper functions or modules.
- Add one additional scenario that tests robustness under imperfect data.

### Expert

- Generalize your solution for reuse across datasets or teams.
- Document key tradeoffs and why your implementation is maintainable.

## Common Grading Rubric (applies every day)

| Criterion | 1 - Emerging | 2 - Developing | 3 - Proficient | 4 - Strong |
|---|---|---|---|---|
| Correctness | Major logic errors; results frequently wrong. | Core path works but multiple inaccuracies remain. | Outputs are correct for expected inputs and checked with examples. | Outputs are consistently correct, including tricky cases and clear verification. |
| Robustness | Breaks on minor input changes or missing values. | Handles some variation but fails on common edge cases. | Handles expected edge cases with explicit guards/validation. | Gracefully handles unexpected data, with informative failures and recovery paths. |
| Readability | Hard to follow; unclear naming/structure. | Partially clear but inconsistent style or organization. | Clear naming, structure, and comments/docstrings where needed. | Highly readable, well-organized, and easy for teammates to extend quickly. |
| Reuse | One-off script with duplicated logic. | Some modularization, limited reuse. | Reusable functions/classes with sensible boundaries. | Well-factored components with clean interfaces and minimal duplication. |
