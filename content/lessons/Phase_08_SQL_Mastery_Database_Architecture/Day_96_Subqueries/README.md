---
day: 96
title: "Advanced Subqueries"
phase: 8
phaseTitle: "SQL Mastery & Database Architecture"
slug: "correlated-subqueries"
duration: 120
difficulty: "advanced"
tags:
  - correlated-subquery
  - exists
  - in
  - scalar-subquery
concepts:
  - "Correlated vs Uncorrelated (Performance Impact)"
  - "EXISTS vs IN (The NULL Trap)"
  - "Subquery Unnesting (Optimizer Magic)"
  - "Scalar Subqueries in SELECT"
prerequisites:
  - "Basic WHERE clause"
outcomes:
  - "Rewrite a slow Correlated Subquery into a Join"
  - "Use EXISTS to filter rows safely"
  - "Debug a `NOT IN` query that returns zero rows"
---

# 🎯 Day 96: Advanced Subqueries

> *"Subqueries are intuitive. Joins are fast. The journey from Junior to Senior is learning to turn the former into the latter."*

---

## The "Never-Coded" Bridge

**The Teacher's Grading**

**Uncorrelated Subquery**:

* Teacher: "Everyone who scored higher than the *Class Average* gets a sticker."
* Process: Calculate Average **once** (e.g., 85). Walk through students. "Is 90 > 85? Yes."
* *Speed*: Fast.

**Correlated Subquery**:

* Teacher: "Everyone who scored higher than the *Average of their own Table Group* gets a sticker."
* Process: Go to Student A. Calculate Table 1 Average. Compare.
* Go to Student B. Calculate Table 2 Average. Compare.
* *Speed*: Slow. You recalculate the average for every student. (O(N^2)).

---

## The Technical Deep Dive

### 1. Correlated Subqueries

A subquery that references a column from the outer query.

* **Code**: `SELECT * FROM employees e WHERE salary > (SELECT AVG(salary) FROM employees WHERE department_id = e.department_id)`.
* **Execution**: For every row in `e`, run the subquery.
* **Optimization**: Rewriting as a `JOIN` with a pre-aggregated CTE.

### 2. EXISTS vs IN (The NULL Trap)

* **IN**: Checks values against a list.
  * `WHERE id NOT IN (1, 2, NULL)`.
  * **Result**: Empty Set. (Because `id != NULL` is `UNKNOWN`). **Dangerous Bug**.
* **EXISTS**: Checks if *at least one row* is returned.
  * `WHERE NOT EXISTS (SELECT 1 FROM table WHERE id = ...)`.
  * **Result**: Works correctly even with NULLs. **Always prefer EXISTS**.

### 3. Scalar Subqueries in SELECT

* **Scenario**: `SELECT name, (SELECT count(*) FROM orders WHERE user_id = u.id) FROM users u`.
* **Problem**: Forces N executions (Correlated).
* **Fix**: `LEFT JOIN` with `GROUP BY`.

---

## Senior-Level Insights

### "Unnesting"

* **The Optimizer's Job**: Modern Postgres/Oracle tries to turn your Correlated Subquery into a Join automatically ("Unnesting").
* **The Risk**: Sometimes it fails (e.g., if you use `LIMIT` or `RANDOM()` inside the subquery).
* **Advice**: Don't rely on magic. Write the Join yourself.

### Is `IN` ever okay?

* **Yes**: For small, static lists. `WHERE status IN ('active', 'pending')`.
* **No**: For large subqueries. `WHERE id IN (SELECT id FROM billion_row_table)`. (Slow Hash Build).

---

## Hands-on Lab

### Exercise 1: The Correlated Killer

**Goal**: Identify the bottleneck.

**Query**: Find products cheaper than the average of their category.

```sql
SELECT product_name, price 
FROM products p
WHERE price < (
    SELECT AVG(price) 
    FROM products 
    WHERE category_id = p.category_id -- Correlation
);
```

### Exercise 2: The Optimization (Rewrite to Join)

**Goal**: Make it fast.

```sql
WITH category_avgs AS (
    SELECT category_id, AVG(price) as avg_price
    FROM products
    GROUP BY category_id
)
SELECT p.product_name, p.price
FROM products p
JOIN category_avgs c ON p.category_id = c.category_id
WHERE p.price < c.avg_price;
```

* *Result*: Calculates averages only once (Join).

### Exercise 3: The NULL Trap

**Goal**: Observe the bug.

1. Create table A: `1, 2`.
2. Create table B: `1, NULL`.
3. Query: `SELECT * FROM A WHERE id NOT IN (SELECT id FROM B)`.
4. **Result**: 0 rows. (Should be '2').
5. **Fix**: Use `NOT EXISTS`.

---

### Non-Functional Constraints (Apply to All Exercises)

* **Performance / Scale**: Document a target query runtime of **p95 < 2s** for your final solution, validate behavior at **30 concurrent analytical users/sessions**, and keep compute spend below **$2** per production-equivalent run.
* **Data Governance / Security**: Define acceptance criteria for least-privilege access, PII handling (masking/tokenization where applicable), audit logging of query access, and retention/deletion alignment with policy.
* **Business KPI Impact**: Explicitly state which business KPI(s) improve based on your schema/query decisions and quantify expected directional impact.
  * KPI focus for this day: *Subquery rewrites should reduce p95 query latency and increase concurrent analyst throughput during peak reporting windows.*

## Mastery Check

### Question 1: NOT IN

Why does `NOT IN` fail with NULLs?
A) Because `5 != NULL` is `TRUE`.
B) Because `5 != NULL` is `UNKNOWN`. In SQL, `UNKNOWN` means "Don't return the row".
C) Because NULLs are invisible.
D) It converts NULL to 0.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Three-valued logic (True, False, Unknown) is the hardest part of SQL.
</details>

### Question 2: Correlated Subquery

How many times does a Correlated Subquery run?
A) Once.
B) Once per row of the Outer Query.
C) Never.
D) Twice.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Linear performance degradation.
</details>

### Question 3: EXISTS

Does `EXISTS (SELECT * ...)` need to read the whole subquery table?
A) Yes.
B) No, it stops as soon as it finds **one** matching row ("Short Circuit").
C) It reads half.
D) It depends on the weather.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Short-circuiting makes EXISTS faster than COUNT(*) > 0.
</details>

### Question 4: Scalar Subquery

Where can you use a Scalar Subquery (returns 1 row, 1 column)?
A) In the `SELECT` list.
B) In the `WHERE` clause.
C) In the `HAVING` clause.
D) All of the above.

<details>
<summary>Click for Answer</summary>

**Answer: D**
It behaves like a variable.
</details>

### Question 5: Unnesting

What is "Subquery Unnesting"?
A) Removing the subquery manually.
B) The Database Optimizer automatically converting a subquery into a Join or Semi-Join for performance.
C) Deleting the data.
D) Nesting it deeper.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Advanced optimization feature.
</details>

---

## Summary

Today you learned:

* ✅ **Correlation**: The enemy of scale.
* ✅ **Joins**: The solution to correlation.
* ✅ **NULLs**: The logic bomb in `NOT IN`.
* ✅ **EXISTS**: The safer, faster alternative.

**Congratulations! You have understood the Internals.**
**Tomorrow**: We begin the End... **Phase 8 Overview**.
