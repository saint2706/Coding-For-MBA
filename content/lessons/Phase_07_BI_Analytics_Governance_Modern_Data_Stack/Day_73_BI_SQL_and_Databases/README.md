---
day: 73
title: "BI SQL & Advanced Databases"
phase: 7
phaseTitle: "BI Analytics, Governance & Modern Data Stack"
slug: "bi-sql"
duration: 120
difficulty: "advanced"
tags:
  - sql
  - window-functions
  - performance
  - ctes
concepts:
  - "Window Functions (RANK, LEAD, LAG)"
  - "Common Table Expressions (CTEs)"
  - "Query Optimization (Indexing, Execution Plans)"
  - "Analytical SQL Patterns"
prerequisites:
  - "Intermediate SQL (Joins, Aggregates)"
outcomes:
  - "Calculate Moving Averages and Running Totals"
  - "Write readable modular SQL using CTEs"
  - "Debug slow queries using EXPLAIN"
---

# 🎯 Day 73: BI SQL & Advanced Databases

> *"SQL is the native language of data. If you can't speak it fluently, you will always be a tourist in the land of insights."*

---

## The "Never-Coded" Bridge

**Excel Formulas vs. SQL Window Functions**

**In Excel**:

* To calculate a "Running Total," you click cell C2 and type `=SUM($B$2:B2)`, then drag it down 10,000 rows.
* **The Problem**: It's manual, fragile (don't sort the rows!), and crashes with 1M rows.

**In SQL**:

* Standard `GROUP BY` collapses rows (100 daily sales -> 1 row). You lose the detail.
* **Window Functions** are like a "Magic Column." They let you look at *other* rows (Yesterday's sales) without collapsing the current row.
* It's like having the power of Excel's "Cell Referencing" (`B2-B1`) but strictly defined and scalable to Billions of rows.

---

## The Technical Deep Dive

### 1. The Power of Window Functions

Syntax: `FUNCTION() OVER (PARTITION BY group ORDER BY sequence)`

* **RANK()**: "Who is the top salesperson *per region*?"
* **LAG()**: "What were sales *yesterday*?" (Great for Growth Rate).
* **LEAD()**: "What are sales *tomorrow*?"

```sql
SELECT
    date,
    region,
    sales,
    -- Running Total per Region
    SUM(sales) OVER (PARTITION BY region ORDER BY date) AS running_total,
    -- Percent Difference from Previous Day
    (sales - LAG(sales) OVER (PARTITION BY region ORDER BY date))
    / LAG(sales) OVER (PARTITION BY region ORDER BY date) AS growth_rate
FROM daily_sales;
```

### 2. CTEs (Common Table Expressions)

Stop writing "Spaghetti SQL" with 15 nested subqueries.
**CTEs** (`WITH name AS ...`) let you define temporary tables at the top.

**Bad (Nested):**

```sql
SELECT * FROM (SELECT * FROM (SELECT ... ) )
```

**Good (Modular):**

```sql
WITH regional_sales AS (
    SELECT region, SUM(sales) as total FROM sales GROUP BY region
),
top_regions AS (
    SELECT region FROM regional_sales WHERE total > 100000
)
SELECT * 
FROM sales 
WHERE region IN (SELECT region FROM top_regions)
```

* Result: Readable, Debuggable code.

### 3. Performance & Indexing

* **The Index**: Like the "Index" at the back of a textbook.
  * Without it, SQL reads *every page* (Full Table Scan) to find "Zebra".
  * With it, SQL jumps straight to Page 402.
* **B-Tree**: The standard index structure. Good for `=`, `>`, `<`.

---

## Senior-Level Insights

### Readability > Cleverness

* **Junior**: Writes a 50-line query using obscure math tricks to do it all in one go.
* **Senior**: Breaks it into 3 clear CTEs (`raw_data` -> `cleaned_data` -> `final_metrics`).
* **Why?**: Because in 6 months, *you* will have to debug it. Detailed CTE names document the logic for you.

### The "N+1" Query Problem (in BI)

* **Don't do**: Run 1 query for "Jan Sales", then another for "Feb Sales".
* **Do**: Run 1 query grouping by Month.
* **Dashboards**: If your dashboard fires 50 SQL queries every time a user changes a filter, the database will crash. Aggregate *before* the dashboard.

---

## Hands-on Lab

### Exercise 1: The Leaderboard (RANK)

**Goal**: Find the Top 3 Products by Revenue in *each* Category.

```sql
/*
Input: 'sales' table [product_id, category, revenue]
*/

WITH ranked_sales AS (
    SELECT
        product_id,
        category,
        revenue,
        RANK() OVER (PARTITION BY category ORDER BY revenue DESC) AS rank_num
    FROM sales
)

SELECT *
FROM ranked_sales
WHERE rank_num <= 3;
```

* *Note*: `RANK()` skips numbers for ties (1, 1, 3). `DENSE_RANK()` does not (1, 1, 2).

### Exercise 2: Month-over-Month Growth (LAG)

**Goal**: Calculate growth rate.

```sql
/* Input: 'monthly_revenue' [month, amount] */

SELECT
    month,
    amount,
    LAG(amount) OVER (ORDER BY month) AS previous_month_amount,
    -- Calculation (Current - Prev) / Prev
    (amount - LAG(amount) OVER (ORDER BY month))
    / NULLIF(LAG(amount) OVER (ORDER BY month), 0) AS growth_pct
FROM monthly_revenue;
```

* *Note*: Use `NULLIF` to avoid "Divide by Zero" errors.

### Exercise 3: Moving Average (ROWS BETWEEN)

**Goal**: Smooth out daily noise with a 7-day Moving Average.

```sql
SELECT
    date,
    daily_visitors,
    AVG(daily_visitors) OVER (
        ORDER BY date
        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
    ) AS mavg_7_day
FROM web_traffic;
```

---

## Mastery Check

### Question 1: Window Scope

What does `PARTITION BY` do in a Window Function?
A) It deletes duplicate rows.
B) It sorts the data.
C) It resets the calculation for each group (like a Group By, but without collapsing rows).
D) It partitions the hard drive.

<details>
<summary>Click for Answer</summary>

**Answer: C**
It defines the "window" of rows the function can see using grouping logic.
</details>

### Question 2: Filtering Window Functions

Why can't you put `WHERE RANK() = 1` in the same query?
A) You can.
B) SQL Order of Operations: `WHERE` runs *before* Window Functions. You must use a CTE or Subquery.
C) `RANK` function assumes all rows exist.
D) It causes a syntax error.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Window functions run at the very end (SELECT step), so WHERE (which runs earlier) can't see them.
</details>

### Question 3: CTE Usage

Why use a CTE instead of a Subquery?
A) It makes the query run faster (usually).
B) It improves Readability and allows re-using the logic multiple times in the main query.
C) It allows recursion.
D) All of the above.

<details>
<summary>Click for Answer</summary>

**Answer: B (& C/D)**
Mainly Readability for BI, though Recursion is a specific use case. Modern optimizers treat them similarly to subqueries for speed.
</details>

### Question 4: NULL Handling

What does `COUNT(column_name)` do with NULL values?
A) Counts them as 0.
B) Counts them as 1.
C) Ignores/Skips them.
D) Returns an error.

<details>
<summary>Click for Answer</summary>

**Answer: C**
It ignores them. Use `COUNT(*)` to count rows including NULLs.
</details>

### Question 5: Performance

Which query is likely faster on a large table?
A) `SELECT * FROM users WHERE YEAR(created_at) = 2023`
B) `SELECT * FROM users WHERE created_at >= '2023-01-01' AND created_at < '2024-01-01'`

<details>
<summary>Click for Answer</summary>

**Answer: B**
B is "SARGable" (Search ARGument ABLE). It allows the index on `created_at` to work. A function like `YEAR()` forces a full scan because every row must be calculated.
</details>

---

## Summary

Today you learned:

* ✅ **Window Functions** give you "Excel-powers" (Looking at other rows) inside SQL.
* ✅ **CTEs** are mandatory for clean, maintainable BI code.
* ✅ **SARGable queries** allow Indexes to work, making dashboards 100x faster.
* ✅ **LAG/LEAD** are the secrets to Time Series Analysis in database.

**Tomorrow**: We tackle **BI Data Preparation & Tools**—Turning raw SQL results into trusted datasets using Power Query/dbt.
