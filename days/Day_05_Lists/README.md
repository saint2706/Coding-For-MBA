---
title: "Day 5: Managing Collections of Data (Lists)"
tags:
  - Basics
  - Python
  - Data Structures
---

# 📘 Day 5: Managing Collections of Data (Lists)

## Managerial Relevance

A single number (`revenue`) is a metric. A **List** of numbers (`monthly_revenues`) is a dataset.

Lists are Python's primary way of handling ordered sequences—like a column in Excel. Whether you're tracking a portfolio of stocks, a queue of customer tickets, or a historical sales ledger, you will use lists. They are flexible (you can add/remove items) and powerful (you can sort/analyze them instantly).

## Key Concepts

- **List Creation**: `prices = [10.5, 20.0, 5.0]`
- **Indexing**: `prices[0]` is the first item. `prices[-1]` is the _last_ item.
- **Methods**:
  - `.append(x)`: Add x to the end (e.g., add new daily sales).
  - `.sort()`: Order the list (e.g., rank top performing products).
  - `.pop()`: Remove an item (e.g., resolve a ticket).
- **Functions**: `sum()`, `min()`, `max()` provide instant summary statistics.

## Code Walkthrough

Open `lists.py`. We manage a dynamic list of sales figures and tasks.

1.  **`analyze_sales()`**:
    - Takes a raw list of sales figures.
    - Uses `sum(sales)` to get Total Revenue.
    - Uses `max(sales)` to find the Top Performing sale.
    - No loops needed for these high-level metrics!

2.  **`manage_todo_list()`**:
    - Shows how lists change over time.
    - We `append` new tasks.
    - We `sort` them to prioritize.
    - We `pop` one off the list when it's done.

### Running the Code

```bash
python Day_05_Lists/lists.py
```

## 💻 Practice Exercises

Open `solutions.py`.

1.  **Sales Growth**:
    - Create a list: `sales = [100, 110, 120]`.
    - Add a new month's sale (`130`) using `.append()`.
    - Print the new list.

2.  **Stock Analysis**:
    - `prices = [150.2, 145.0, 155.5, 140.0]`.
    - Sort them.
    - Print the lowest price (`prices[0]`) and highest price (`prices[-1]`).

3.  **Team Roster**:
    - Create a list of 3 names.
    - Change the second name (`roster[1]`) to something else (e.g., a replacement).

<!-- LESSON_FOOTER_START -->

---

**Previous:** [Day 04 – Strings](../Day_04_Strings/README.md) • **Next:** [Day 06 – Tuples](../Day_06_Tuples/README.md)

_You are on lesson 5 of 108._

<!-- LESSON_FOOTER_END -->
