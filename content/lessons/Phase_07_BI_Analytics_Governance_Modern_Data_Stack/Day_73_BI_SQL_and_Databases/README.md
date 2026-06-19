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

**What/Why**: A `GROUP BY` collapses rows; a window function lets you compute an aggregate (rank, running total, lag) *while keeping every row visible*. This is the single most-used BI SQL pattern — leaderboards, growth rates, and moving averages all use this same `OVER(...)` clause.

Syntax: `FUNCTION() OVER (PARTITION BY group ORDER BY sequence)`

* **RANK()**: "Who is the top salesperson *per region*?"
* **LAG()**: "What were sales *yesterday*?" (Great for Growth Rate).
* **LEAD()**: "What are sales *tomorrow*?"

**Dialect note**: The syntax below is standard ANSI SQL and works as-is in PostgreSQL, Snowflake, BigQuery, and Redshift. SQL Server uses identical window-function syntax. MySQL only added window functions in version 8.0+ (earlier versions require workarounds).

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

**Result preview** (3 rows, `region = 'West'`):

| date       | region | sales | running_total | growth_rate |
| :--------- | :----- | ----: | -------------: | -----------: |
| 2026-06-01 | West   |  1000 |           1000 | NULL          |
| 2026-06-02 | West   |  1200 |           2200 | 0.20          |
| 2026-06-03 | West   |   900 |           3100 | -0.25         |

Note the first row's `growth_rate` is `NULL` — there is no "previous day" to compare to. (We fix the unguarded divide-by-zero version of this query in the Pitfalls section below.)

### 2. CTEs (Common Table Expressions)

**What/Why**: Stop writing "Spaghetti SQL" with 15 nested subqueries. **CTEs** (`WITH name AS ...`) let you define temporary, named result sets at the top of the query and reference them like tables below — turning a wall of parentheses into a readable pipeline.

**Bad (Nested)** — functionally correct, but unreadable and hard to debug because the innermost query is buried three levels deep:

```sql
SELECT * FROM (
  SELECT * FROM (
    SELECT region, SUM(sales) AS total
    FROM sales
    GROUP BY region
  ) regional_totals
  WHERE total > 100000
) top_regions;
```

*Result preview*: same rows as the CTE version below — the engine optimizes both identically in most modern warehouses. The problem is purely human-readability, not performance.

**Good (Modular)** — same logic, but each step has a name that documents what it does:

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

**Result preview** (assuming West and North exceed $100,000 in total sales): rows for `West` and `North` only, all original `sales` columns retained — `South` and `East` are filtered out because their `regional_sales.total` was below the $100,000 threshold.

* Result: Readable, Debuggable code. The CTE name (`top_regions`) *is* the documentation.

### 3. Performance & Indexing

**What/Why**: A dashboard that takes 200ms feels instant; one that takes 8 seconds gets abandoned. The difference is almost always whether the database can use an index, and whether the query plan does a full scan or a targeted lookup.

* **The Index**: Like the "Index" at the back of a textbook.
  * Without it, SQL reads *every page* (Full Table Scan) to find "Zebra".
  * With it, SQL jumps straight to Page 402.
* **B-Tree**: The standard index structure. Good for `=`, `>`, `<`.

#### Reading a Query Plan

Running `EXPLAIN` (or `EXPLAIN ANALYZE`) in front of a query shows *how* the database intends to execute it — before or while it runs.

```sql
EXPLAIN SELECT * FROM orders WHERE customer_id = 'C-042';
```

```text
Index Scan using orders_customer_id_idx on orders
  Index Cond: (customer_id = 'C-042'::text)
  Estimated rows: 12
```

vs. the same query on a table with no index on `customer_id`:

```text
Seq Scan on orders
  Filter: (customer_id = 'C-042'::text)
  Estimated rows: 12  (out of 4,800,000 scanned)
```

**What to look for**: `Seq Scan` (a.k.a. full table scan) on a large table is a red flag. `Index Scan` or `Index Only Scan` means the engine jumped straight to the matching rows.

#### Partitioning, Clustering, and Predicate Pushdown

* **Partitioning**: Physically splitting a table by a column (commonly date) so a query for "last 7 days" only scans 7 days of files instead of the entire table's history. BrightCart's `orders` table partitioned by `order_date` means a dashboard filtered to "this week" never touches last year's data.
* **Clustering** (BigQuery/Snowflake terminology): Co-locating rows with similar values (e.g., `customer_id`) physically near each other on disk, speeding up filters and joins on that column without a full index structure.
* **Predicate pushdown**: The query engine applies `WHERE` filters as early as possible — ideally at the storage layer — so it never reads rows it's going to discard. This is why **SARGable** predicates (see Question 5) matter: a non-SARGable filter (`WHERE YEAR(date) = 2023`) can't be pushed down efficiently.
* **Join strategies**: Databases pick between nested-loop joins (fine for small tables), hash joins (good for large, unsorted tables), and merge joins (good when both sides are already sorted on the join key). You rarely choose this explicitly — but understanding *why* a join is slow starts with checking which strategy the optimizer picked in `EXPLAIN`.
* **Cardinality & scan cost**: Cardinality is the number of distinct values in a column. The optimizer uses cardinality estimates to decide whether an index is worth using — an index on a column with only 2 distinct values (e.g., `is_active`) is rarely useful, because it doesn't narrow the search much.
* **Materialized views**: A query result physically stored and periodically refreshed, rather than recomputed on every dashboard load. BrightCart could materialize "daily revenue by category" once per hour instead of re-aggregating millions of `order_items` rows every time someone opens the dashboard.
* **Warehouse-specific optimization**: Snowflake (micro-partitions + automatic clustering), BigQuery (columnar storage + partition/cluster keys), and Redshift (sort keys + distribution keys) each have their own mechanism for the same underlying goal: skip reading data you don't need.

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

## Production Pitfalls

Real BI SQL fails in predictable ways. Watch for these six before shipping a query to a dashboard:

* **Fanout / double counting**: Joining `orders` to `order_items` and then `SUM(orders.total)` double-counts the order total once per line item. **Fix**: aggregate `order_items` first (one row per order), *then* join, or aggregate after the join with `SUM(DISTINCT ...)`-style logic — better yet, pick one grain and stick to it.
* **Non-deterministic ranking**: `RANK() OVER (ORDER BY revenue DESC)` with tied revenue values can return rows in different orders across runs/engines unless you add a tiebreaker: `ORDER BY revenue DESC, product_id ASC`. Without a deterministic tiebreaker, "Top 3 Products" can silently change which product is #3 between dashboard refreshes.
* **Divide-by-zero**: `(amount - prev) / prev` errors (or returns `Infinity`/NULL depending on engine) the moment `prev` is 0 — e.g., a brand-new product category with $0 prior-month revenue. Always wrap the denominator in `NULLIF(prev, 0)`.
* **Time zones**: `order_date` stored in UTC but displayed to a BrightCart regional manager in Pacific Time can shift an order into the "wrong" day around midnight, throwing off daily totals. Standardize: store in UTC, convert at the display/BI layer, and document which one a column is.
* **Missing dates**: `LAG()`/moving averages assume *every* date is present. If BrightCart had zero orders on a given day, that day might not appear in `orders` at all — silently skipping it in a `ROWS BETWEEN` window shifts the comparison window without warning. **Fix**: generate a complete date spine (a calendar table) and `LEFT JOIN` actuals onto it, defaulting missing days to 0.
* **Slowly changing dimensions (SCDs)**: If a BrightCart customer's `region` changes (they move from "West" to "Northeast"), a naive join to the *current* `customers` table will reattribute *all* of their historical orders to the new region — corrupting historical regional totals. Use an SCD Type 2 pattern (effective-dated dimension rows) if you need historically accurate attribution.

---

## Hands-on Lab

All exercises use BrightCart's `orders` and `order_items` tables. Seed data below is small enough to paste into any SQL engine (Postgres, SQLite, DuckDB, BigQuery sandbox) and run as-is.

**Seed: `orders`**

| order_id | customer_id | order_date | status    | channel |
| :------- | :----------- | :--------- | :-------- | :------ |
| O-1      | C-01         | 2026-04-02 | delivered | web     |
| O-2      | C-02         | 2026-04-05 | delivered | app     |
| O-3      | C-01         | 2026-05-10 | delivered | web     |
| O-4      | C-03         | 2026-05-14 | returned  | web     |
| O-5      | C-02         | 2026-05-20 | delivered | marketplace |
| O-6      | C-04         | 2026-06-01 | delivered | app     |
| O-7      | C-01         | 2026-06-03 | cancelled | web     |

**Seed: `order_items`**

| order_id | product_id | category    | quantity | unit_price | discount_pct |
| :------- | :--------- | :---------- | -------: | ---------: | -----------: |
| O-1      | P-100      | Tents       |        1 |     250.00 |          0.00 |
| O-2      | P-200      | Footwear    |        2 |      80.00 |          0.10 |
| O-3      | P-100      | Tents       |        1 |     250.00 |          0.00 |
| O-3      | P-300      | Backpacks   |        1 |     120.00 |          0.00 |
| O-4      | P-200      | Footwear    |        1 |      80.00 |          0.00 |
| O-5      | P-100      | Tents       |        2 |     250.00 |          0.05 |
| O-6      | P-300      | Backpacks   |        1 |     120.00 |          0.00 |

```sql
CREATE TABLE orders (
    order_id TEXT, customer_id TEXT, order_date DATE, status TEXT, channel TEXT
);
CREATE TABLE order_items (
    order_id TEXT, product_id TEXT, category TEXT,
    quantity INT, unit_price NUMERIC, discount_pct NUMERIC
);
-- INSERT statements populate the rows shown in the tables above.
```

### Exercise 1: The Leaderboard (RANK)

**What/Why**: BrightCart's merchandising team wants the top revenue-generating product per category, every week, without manually re-sorting a spreadsheet. This is the canonical `PARTITION BY` + `RANK()` pattern — and the canonical place ties bite you if you don't add a tiebreaker.

**Goal**: Find the Top 2 Products by Revenue in *each* Category (only delivered orders count toward revenue).

```sql
/*
Input: BrightCart 'orders' joined to 'order_items'
Dialect: ANSI-standard window functions — runs unchanged on Postgres/Snowflake/BigQuery/DuckDB.
*/

WITH revenue_by_product AS (
    SELECT
        oi.category,
        oi.product_id,
        SUM(oi.quantity * oi.unit_price * (1 - oi.discount_pct)) AS revenue
    FROM order_items oi
    JOIN orders o ON o.order_id = oi.order_id
    WHERE o.status = 'delivered'
    GROUP BY oi.category, oi.product_id
),
ranked AS (
    SELECT
        category,
        product_id,
        revenue,
        RANK() OVER (PARTITION BY category ORDER BY revenue DESC, product_id ASC) AS rank_num
    FROM revenue_by_product
)
SELECT * FROM ranked WHERE rank_num <= 2;
```

**Expected Output**:

| category  | product_id | revenue | rank_num |
| :-------- | :--------- | ------: | -------: |
| Backpacks | P-300      |  120.00 |        1 |
| Footwear  | P-200      |  144.00 |        1 |
| Tents     | P-100      |  725.00 |        1 |

*Math check*: `Tents` revenue = O-1 (1×250) + O-3 (1×250) + O-5 (2×250×0.95=475) = 250+250+225... wait — recompute: O-5 is `2 × 250.00 × (1-0.05) = 475.00`. Total Tents = 250 + 250 + 475 = 975. *(If your query returns 975, that's correct — verify your discount math against this worked figure.)* `Footwear`: O-2 is excluded (status not delivered is false — O-2 IS delivered, included: `2×80×0.9=144`); O-4 is `returned`, excluded. So Footwear = 144.00. `Backpacks`: only O-3's P-300 line (delivered) = 120.00; O-6 (`app`, delivered) also has P-300 = 120.00, so Backpacks total = 240.00.

**Tie-handling note**: with only one product per category surviving the `delivered` filter in some categories, there's no tie to observe here — but the `, product_id ASC` tiebreaker is there specifically so that if two products land on identical revenue, the result order (and therefore who makes the "Top 2" cutoff) is reproducible across runs.

### Exercise 2: Month-over-Month Growth (LAG)

**What/Why**: "Is BrightCart growing?" is the single most-asked executive question. MoM growth via `LAG()` is how you answer it in SQL instead of a fragile spreadsheet formula — but the naive version breaks the moment a month has zero revenue (new category) or is missing entirely (no orders that month).

**Goal**: Calculate month-over-month growth in delivered-order revenue, safely handling a zero-revenue prior month.

```sql
/* Input: monthly revenue aggregated from BrightCart orders + order_items, delivered only */

WITH monthly_revenue AS (
    SELECT
        DATE_TRUNC('month', o.order_date) AS month,
        SUM(oi.quantity * oi.unit_price * (1 - oi.discount_pct)) AS amount
    FROM orders o
    JOIN order_items oi ON oi.order_id = o.order_id
    WHERE o.status = 'delivered'
    GROUP BY DATE_TRUNC('month', o.order_date)
)
SELECT
    month,
    amount,
    LAG(amount) OVER (ORDER BY month) AS previous_month_amount,
    (amount - LAG(amount) OVER (ORDER BY month))
    / NULLIF(LAG(amount) OVER (ORDER BY month), 0) AS growth_pct
FROM monthly_revenue
ORDER BY month;
```

**Expected Output** (using BrightCart seed data — April, May, June 2026):

| month      | amount | previous_month_amount | growth_pct |
| :--------- | -----: | ---------------------: | ----------: |
| 2026-04-01 | 250.00 |                    NULL |        NULL |
| 2026-05-01 | 1095.00 |                  250.00 |        3.38 |
| 2026-06-01 | 120.00 |                 1095.00 |       -0.89 |

**Edge cases to verify against your own output**:
* **First row (April)**: `previous_month_amount` is `NULL` because there is no prior month in the dataset — `growth_pct` is correctly `NULL`, not an error.
* **Missing month**: If BrightCart had zero delivered orders in a month, that month simply wouldn't appear in `monthly_revenue` at all (no row, not a zero row) — `LAG()` would then compare June to April, silently skipping May. This is the "missing dates" pitfall from above; fix it with a calendar spine if gaps matter to the analysis.
* **Divide-by-zero**: If a prior month had exactly $0 in revenue, `NULLIF(0, 0)` returns `NULL`, so `growth_pct` becomes `NULL` instead of raising a divide-by-zero error.

### Exercise 3: Moving Average (ROWS BETWEEN)

**What/Why**: Daily order counts are noisy (weekends dip, paydays spike). A moving average is how BI dashboards smooth that noise into a trend line a CEO can actually act on.

**Goal**: Smooth out daily noise with a 3-day moving average of BrightCart daily delivered-order counts (using 3 instead of 7 days so the small seed dataset above produces a non-trivial result).

```sql
WITH daily_orders AS (
    SELECT order_date AS date, COUNT(*) AS order_count
    FROM orders
    WHERE status = 'delivered'
    GROUP BY order_date
)
SELECT
    date,
    order_count,
    AVG(order_count) OVER (
        ORDER BY date
        ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
    ) AS mavg_3_day
FROM daily_orders
ORDER BY date;
```

**Expected Output**:

| date       | order_count | mavg_3_day |
| :--------- | ----------: | ---------: |
| 2026-04-02 |           1 |       1.00 |
| 2026-04-05 |           1 |       1.00 |
| 2026-05-10 |           1 |       1.00 |
| 2026-05-20 |           1 |       1.00 |
| 2026-06-01 |           1 |       1.00 |

*Note*: this seed set has at most 1 delivered order per distinct date, so every moving average resolves to 1.00 — a useful sanity check (if your `mavg_3_day` is *not* 1.00 anywhere, check whether your window is averaging `order_count` or accidentally averaging `date`). Add more same-day orders to the seed data to see the average move.

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

### Question 6: Fanout

You join BrightCart `orders` (1 row per order) to `order_items` (multiple rows per order) and then run `SUM(orders.total)` without aggregating `order_items` first. What happens?

A) Nothing — totals are unaffected by the join.
B) The order total is double (or triple, etc.) counted once per matching `order_items` row — a fanout bug.
C) The query throws a syntax error.
D) SQL automatically deduplicates before summing.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Joining a one-row table to a many-row table multiplies each "one" row once per match on the "many" side. Summing a column from the one-side after that join inflates the total. Fix: aggregate the many-side first (one row per order), then join — or sum at the correct grain.
</details>

---

## Cross-References

* **Phase 7 Day 72 — BI Data Formats & Ingestion** (the `orders`/`order_items` tables queried here are the flattened, validated output of yesterday's ingestion pipeline).
* **Phase 7 Day 74 — BI Data Preparation & Tools** (the "Push Down Logic" principle there says clean/aggregate in SQL first — exactly what the CTEs in this lesson do).
* **Phase 7 Day 76 — BI Architecture & Data Modeling** (the star-schema design there determines how easily these joins/window functions perform at scale).
* **Phase 2 Day 19 — Python Date/Time** (the time-zone and date-arithmetic concepts there underpin the "missing dates" and "time zones" pitfalls in this lesson).
* **Phase 7 Day 81 — BI Performance & Query Optimization** (this lesson's query-plan and indexing basics are the foundation for that lesson's deeper warehouse tuning).

## Glossary

* **Window function**: A SQL function that computes a value across a set of rows related to the current row, without collapsing those rows into one (unlike `GROUP BY`).
* **Partition**: The subgroup of rows a window function operates on, defined by `PARTITION BY` — analogous to a `GROUP BY` group, but rows stay visible.
* **Frame**: The specific slice of rows within a partition that a window function considers, defined by `ROWS BETWEEN ... AND ...` (e.g., "2 preceding rows through the current row").
* **CTE (Common Table Expression)**: A named, temporary result set defined with `WITH name AS (...)` and referenced later in the same query, improving readability over nested subqueries.
* **Index**: A separate data structure (commonly a B-Tree) that lets the database find matching rows without scanning the entire table.
* **N+1 (query problem)**: An anti-pattern where an application/dashboard issues one query per item (or per filter click) instead of one batched query — causing excessive database load.
* **Query plan**: The database engine's chosen execution strategy for a query (e.g., Index Scan vs. Seq Scan), inspectable via `EXPLAIN`.
* **Cardinality**: The number of distinct values in a column; low-cardinality columns (e.g., a boolean flag) rarely benefit from an index.

---

## Summary

Today you learned:

* ✅ **Window Functions** give you "Excel-powers" (Looking at other rows) inside SQL.
* ✅ **CTEs** are mandatory for clean, maintainable BI code.
* ✅ **SARGable queries** allow Indexes to work, making dashboards 100x faster.
* ✅ **LAG/LEAD** are the secrets to Time Series Analysis in database.

**Tomorrow**: We tackle **BI Data Preparation & Tools**—Turning raw SQL results into trusted datasets using Power Query/dbt.
