---
title: "Day 6: Immutable Data (Tuples)"
tags:
  - Basics
  - Python
  - Data Structures
---

# 📘 Day 6: Immutable Data (Tuples)

## Managerial Relevance

In business, some data should _change_ (daily sales, customer lists), but other data _must not change_ (GPS coordinates of a store, tax rates for a fiscal year, days of the week).

**Tuples** are "read-only lists." They are faster, lighter memory-wise, and most importantly, they offer **data integrity**. If you define a tuple for specific business constants, Python guarantees no junior developer (or buggy script) can accidentally overwrite them later.

## Key Concepts

- **Definition**: Uses parentheses `(A, B)` instead of brackets `[A, B]`.
- **Immutability**: You cannot `.append()` or change an item. `coords[0] = 5` throws an error.
- **Unpacking**: The "Business Superpower" of tuples.
  - `profit, revenue, cost = (10, 100, 90)`
  - Instant assignment of multiple related variables.

## Code Walkthrough

Open `tuples.py`.

1.  **`get_quarterly_performance()`**:
    - Returns a tuple `(revenue, profit_margin)`.
    - This allows a function to return _two_ results at once, which is impossible in many other languages without creating a complex object.

2.  **`store_locations`**:
    - Storing `(latitude, longitude)` as a pair.
    - It makes no sense to have a "latitude" without a "longitude" or to "append" a third number to a GPS coordinate. The tuple enforces this structure.

### Running the Code

```bash
python Day_06_Tuples/tuples.py
```

## 💻 Practice Exercises

Open `solutions.py`.

1.  **Metric Unpacking**:
    - Create a tuple: `metrics = (0.15, 0.05)` representing (Growth Rate, Churn Rate).
    - Unpack them: `growth, churn = metrics`.
    - Print them as percentages.

2.  **Fiscal Calendar**:
    - Create a tuple `quarters = ("Q1", "Q2", "Q3", "Q4")`.
    - Try to change "Q1" to "Q5". Observe the error—this explains why we use tuples!

3.  **Function Return**:
    - Write a function `get_min_max(numbers)` that returns `min(numbers), max(numbers)`.
    - Call it on a list of sales and unpack the result.

<!-- LESSON_FOOTER_START -->

---

**Previous:** [Day 05 – Lists](../Day_05_Lists/README.md) • **Next:** [Day 07 – Sets](../Day_07_Sets/README.md)

_You are on lesson 6 of 108._

<!-- LESSON_FOOTER_END -->
