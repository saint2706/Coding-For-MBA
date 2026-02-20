---
day: 94
title: "Advanced DQL & Optimization"
phase: 8
phaseTitle: "SQL Mastery & Database Architecture"
slug: "query-tuning"
duration: 120
difficulty: "advanced"
tags:
  - query-plan
  - explain-analyze
  - indexing
concepts:
  - "The Query Optimizer (Cost Based)"
  - "Scan Types (Seq, Index, Bitmap Heap)"
  - "Index-Only Scans (Covering Index)"
  - "CTE Optimization (Materialized vs Not)"
prerequisites:
  - "Basic SELECT"
outcomes:
  - "Read a Query Plan and identify bottlenecks"
  - "Force an Index Only Scan"
  - "Rewrite a slow query to use SARGable predicates"
---

# 🎯 Day 94: Advanced DQL & Optimization

> *"The Query Optimizer is smart, but it's not psychic. You have to give it clues."*

---

## The "Never-Coded" Bridge

**The Librarian's Search**

**Query**: "Find 'Harry Potter' (Title) released in '2005' (Year)."

1. **Seq Scan**: Librarian walks down every aisle, pulling every book, checking the title. (Slow).
2. **Index Scan**: Librarian goes to the Card Catalog (Sorted by Title). Finds "Harry Potter". Goes to Shelf. Checks Year. (Fast).
3. **Bitmap Heap Scan**: Librarian finds 500 "Harry Potter" entries in the catalog. Marks their locations on a map. Walks the optimized path to grab them all at once.
4. **Index Only Scan**: The Card Catalog lists the Year next to the Title!
    * Librarian looks at the Card: "Harry Potter, 2005".
    * **Result**: She never even walks to the shelf. (Fastest).

---

## The Technical Deep Dive

### 1. The Query Plan (`EXPLAIN`)

* **Cost**: Arbitrary units (1.0 = reading one 8kb page).
* **Rows**: Estimated number of rows.
* **Actual Time**: Real execution time (only in `EXPLAIN ANALYZE`).
* **Loops**: How many times a node ran.

### 2. Scan Types

* **Sequential Scan**: Reads whole table. Good for small tables or "Give me 90% of rows".
* **Index Scan**: Random I/O. Best for "Give me 1 row".
* **Index Only Scan**: The Holy Grail. The index contains *all* columns requested. No "Heap Fetch" needed.
  * `CREATE INDEX idx_users_name_email ON users(name) INCLUDE (email)`.
  * `SELECT email FROM users WHERE name = 'Bob'`. (Never touches the table).

### 3. SARGable Queries

**S**earch **ARG**ument **Able**.

* **Bad**: `WHERE YEAR(date_column) = 2023`.
  * *Why?*: You wrapped the column in a function. The DB must calculate `YEAR()` for every row. Index ignored.
* **Good**: `WHERE date_column BETWEEN '2023-01-01' AND '2023-12-31'`.
  * *Why?*: Range comparison on the raw column. Index used.

---

## Senior-Level Insights

### "The Optimizer knows better than you"

* **Junior**: "Why is it doing a Seq Scan? I have an index!"
* **Senior**: "Because you asked for 50% of the table. A Seq Scan (Reading sequentially) is actually faster than 50% Random I/O hops."
* **Lesson**: Don't force indexes (hints) unless you have proven the Optimizer is wrong.

### CTEs: Optimization Fences

* **In Postgres < 12**: CTEs were always "Materialized" (Calculated once, stored in temp RAM).
* *Pros*: Safe.
* *Cons*: Optimization fence. The DB can't push a `WHERE` clause into the CTE.
* **Modern Postgres**: Tries to "Inline" the CTE (treat it like a subquery) for speed.
* **Hack**: `WITH x AS MATERIALIZED (...)` forces calculation.

---

## Hands-on Lab

### Exercise 1: Reading a Plan

**Goal**: Run `EXPLAIN ANALYZE`.

```sql
EXPLAIN ANALYZE 
SELECT * FROM orders WHERE amount > 100;
```

* **Output**: `Seq Scan on orders  (cost=0.00..15.00 rows=3 width=36) (actual time=0.012..0.015 rows=3 loops=1)`.
* **Task**: Identify the *Node Type* (Seq Scan) and *Actual Time*.

### Exercise 2: Killing SARGability

**Goal**: Break an index.

1. `CREATE INDEX idx_date ON orders(order_date)`.
2. **Fast**: `SELECT * FROM orders WHERE order_date = '2023-01-01'`. (Index Scan).
3. **Slow**: `SELECT * FROM orders WHERE order_date::text LIKE '2023-01-01%'`. (Seq Scan).
    * *Why?*: Casting to text hides the date structure.

### Exercise 3: Covering Index

**Goal**: Create an Index Only Scan.

**Query**: `SELECT phone FROM users WHERE lastname = 'Smith'`.

1. **Index**: `CREATE INDEX idx_lastname_phone ON users(lastname, phone)`.
2. **Verify**: Run `EXPLAIN`. Look for `Index Only Scan`.

---

### Non-Functional Constraints (Apply to All Exercises)

- **Performance / Scale**: Document a target query runtime of **p95 < 1.5s** for your final solution, validate behavior at **35 concurrent analytical users/sessions**, and keep compute spend below **$2** per production-equivalent run.
- **Data Governance / Security**: Define acceptance criteria for least-privilege access, PII handling (masking/tokenization where applicable), audit logging of query access, and retention/deletion alignment with policy.
- **Business KPI Impact**: Explicitly state which business KPI(s) improve based on your schema/query decisions and quantify expected directional impact.
  - KPI focus for this day: *Query optimization choices should improve dashboard p95 latency and analyst self-service throughput.*

## Mastery Check

### Question 1: Seq Scan

When is a Sequential Scan faster than an Index Scan?
A) Never.
B) When returning a large % of the table (e.g., > 20%).
C) Only on Tuesdays.
D) When the table is empty.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Random I/O (Index) is slow. Sequential I/O is fast.
</details>

### Question 2: SARGable

Which is SARGable?
A) `WHERE name LIKE '%Smith'` (Leading Wildcard).
B) `WHERE name LIKE 'Smith%'` (Trailing Wildcard).
C) `WHERE UPPER(name) = 'SMITH'`.
D) `WHERE id + 1 = 10`.

<details>
<summary>Click for Answer</summary>

**Answer: B**
B-Trees are sorted alphabetically. They can find "starts with Smith". They cannot find "ends with Smith" or "Middle".
</details>

### Question 3: Index Only Scan

What does "Heap Fetches: 0" mean?
A) The query failed.
B) The database answered directly from the Index without touching the main table.
C) The heap is full.
D) Zero rows returned.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Maximum performance.
</details>

### Question 4: Cost

In `cost=0.00..15.00`, what is the 15.00?
A) 15 milliseconds.
B) 15 arbitrary units of work (Disk page fetches + CPU cycles).
C) 15 dollars.
D) 15 rows.

<details>
<summary>Click for Answer</summary>

**Answer: B**
It's a relative score used by the planner to compare options.
</details>

### Question 5: Cardinality

Why does the planner care about "Statistics" (n_distinct)?
A) To guess how many rows `WHERE id = 5` will return.
B) It doesn't.
C) To sort the data.
D) To audit access.

<details>
<summary>Click for Answer</summary>

**Answer: A**
If `n_distinct` is low (e.g., 'Gender'), an index is useless. If high ('UUID'), index is great.
</details>

---

## Summary

Today you learned:

* ✅ **The Optimizer**: It balances I/O cost vs CPU cost.
* ✅ **Scan Types**: Know when Seq Scan beats Index Scan.
* ✅ **SARGable**: Don't hide columns inside functions in WHERE clauses.
* ✅ **Covering Indexes**: The ultimate optimization.

**Tomorrow**: We connect datasets with **Advanced Joins**.
