---
day: 101
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
  - "Correlated vs Uncorrelated Subqueries (Semantics First, Performance Second)"
  - "EXISTS vs IN vs JOIN (NULL and Duplicate Semantics)"
  - "Subquery Unnesting (Optimizer Decorrelation, and Its Limits)"
  - "Scalar Subqueries in SELECT (Cardinality Requirements)"
prerequisites:
  - "Basic WHERE clause"
  - "Day 100: Advanced Joins & Algorithms (JOIN semantics: INNER/LEFT/SEMI/ANTI)"
  - "Day 99: Advanced DQL & Optimization (reading EXPLAIN/EXPLAIN ANALYZE plans)"
outcomes:
  - "Choose between EXISTS, IN, and JOIN based on NULL/duplicate semantics, not folklore"
  - "Use EXPLAIN ANALYZE to compare a correlated subquery against its JOIN rewrite on real data"
  - "Write a correct, complete NOT EXISTS query with the correlation condition included"
  - "Diagnose a scalar subquery that errors because it returns more than one row"
---

# 🎯 Day 101: Advanced Subqueries

> *"A subquery and a JOIN are often two spellings of the same plan. The optimizer cares about the plan. You should care about the semantics first."*

**Dialect note**: SQL and `EXPLAIN ANALYZE` output below are **PostgreSQL 14+**. `LATERAL` syntax, decorrelation behavior, and exact optimizer rewrite limits are Postgres-specific — other engines (MySQL, SQL Server, Oracle) decorrelate subqueries differently and with different limitations.

**Cross-references**: This lesson assumes you can already read `EXISTS`/`NOT EXISTS` as semi-/anti-join semantics from **Day 100 — Advanced Joins & Algorithms**, and that you can run and interpret `EXPLAIN ANALYZE` plan trees from **Day 99 — Advanced DQL & Optimization**. If either is unfamiliar, review those lessons before the benchmarking exercises below — you will be asked to read real plans, not take performance claims on faith.

---

## The "Never-Coded" Bridge

**The Teacher's Grading**

**Uncorrelated Subquery**:

* Teacher: "Everyone who scored higher than the *class average* gets a sticker."
* Process: Calculate the average once (e.g., 85). Walk through students. "Is 90 > 85? Yes."
* The subquery (computing the average) does not depend on which student is currently being checked.

**Correlated Subquery**:

* Teacher: "Everyone who scored higher than the *average of their own table group* gets a sticker."
* Process: Go to Student A, calculate Table 1's average, compare. Go to Student B, calculate Table 2's average, compare.
* The subquery's result *depends on* (is correlated with) the row currently being evaluated by the outer query — it references an outer column.

**A claim worth retiring right away**: it is tempting to say the correlated version is "slow" because it looks like it reruns the average calculation once per student. **Modern optimizers frequently rewrite this exact pattern into a single GROUP BY + JOIN automatically** before execution — the naive "once per row" mental model describes the *naive execution strategy*, not necessarily what the database actually does. This lesson teaches you to check, not assume.

---

## The Technical Deep Dive

### 1. Correlated Subqueries

A subquery that references a column from the outer query is **correlated**.

```sql
SELECT * FROM employees e
WHERE salary > (
    SELECT AVG(salary) FROM employees WHERE department_id = e.department_id  -- e.department_id is the outer reference
);
```

* **Naive mental model**: for every row in `e`, run the subquery once, recalculating the average for that row's department.
* **What modern Postgres often actually does**: recognizes that the subquery is grouped by `department_id`, and **decorrelates** it into something logically equivalent to a single pre-aggregated `JOIN` — computing each department's average exactly once, not once per employee. Whether this rewrite happens depends on the query shape (see "Optimizer Decorrelation Limits" below).
* **The only way to know which actually happened**: run `EXPLAIN ANALYZE` and read the plan. If you see a single `HashAggregate` feeding a `Hash Join`, it decorrelated. If you see a `SubPlan` re-executed with `loops = <row count of e>`, it did not.

### 2. EXISTS vs. IN vs. JOIN — Semantics First

These three tools answer related but **not identical** questions, and the differences are about *correctness*, not speed, before they're about anything else.

| Tool | Question it answers | Returns left-row how many times? | NULL behavior |
|---|---|---|---|
| `JOIN` (INNER) | "Give me combined rows where a match exists" | Once **per matching right-row** — can multiply (fanout) | A row with a NULL join key matches nothing (NULL = NULL is UNKNOWN) |
| `IN (subquery)` | "Is this value present in that list?" | Used in `WHERE`, doesn't multiply rows by itself | If the subquery's result list contains a NULL, `NOT IN` can unexpectedly return zero rows for every input (see Pitfalls) |
| `EXISTS (subquery)` | "Does at least one matching row exist?" | Used in `WHERE`, never multiplies — boolean per outer row | NULLs inside the subquery's selected columns don't matter; only the existence of *a row* matters, and the correlation condition's own NULL handling is what to watch |

**The performance question is real, but it is the second question, not the first.** Once you know which semantics you need, *then* you check the plan to see how the engine actually executes it, and you may find `IN`, `EXISTS`, and an equivalent `JOIN` produce the *same* plan after optimizer rewrites — or different plans, depending on indexes, table sizes, and duplicate keys. Section "Lab" below makes you verify this with `EXPLAIN ANALYZE` rather than asserting it.

### 3. Scalar Subqueries in SELECT — Cardinality Requirement

A scalar subquery **must return exactly one row and one column**, or the database raises a runtime error.

```sql
SELECT name, (SELECT COUNT(*) FROM orders WHERE user_id = u.id) AS order_count
FROM users u;
```

* This is correlated (references `u.id`) and returns exactly one row per inner execution (`COUNT(*)` always returns exactly one row, even when zero rows match — it returns `0`, not nothing).
* **What if you write a scalar-subquery slot with a query that *can* return multiple rows?**

```sql
SELECT name, (SELECT amount FROM orders WHERE user_id = u.id) AS some_order_amount
FROM users u;
-- ERROR:  more than one row returned by a subquery used as an expression
```

  If a user has 2+ orders, the inner query returns 2+ rows for that user, and the scalar-subquery slot has no way to represent "many values" as one cell — Postgres raises an error at runtime, not at parse time, so this can pass testing on a development dataset with one order per user and then fail in production the first time someone places a second order.
* **Fix**: aggregate (`COUNT`, `SUM`, `MAX`, ...) so the subquery is guaranteed to return exactly one row, or rewrite using a `LEFT JOIN ... GROUP BY` so the cardinality problem can't occur at all.

---

## Senior-Level Insights

### "Unnesting" / Decorrelation — and Its Limits

* **The optimizer's job**: Modern Postgres tries to transform (`unnest`/decorrelate) a correlated subquery into a semi-join, anti-join, or grouped join automatically, because a single pass over pre-aggregated data is usually cheaper than re-evaluating per outer row.
* **When decorrelation typically succeeds**: simple equality correlations (`WHERE dept_id = e.dept_id`), `EXISTS`/`NOT EXISTS` with a straightforward correlation condition, and `IN`/`NOT IN` against a subquery without LIMIT.
* **When decorrelation typically fails or is restricted** — these are the cases where the naive per-row execution model is *actually* what happens, so checking the plan matters most here:
  * The subquery contains `LIMIT` or `OFFSET` — limiting "the top 1 order per customer" genuinely requires per-customer evaluation in most planners, because the cutoff depends on per-group ordering.
  * The subquery references a volatile function (`RANDOM()`, `now()` in some contexts) where re-evaluating once globally vs. once per row would change the answer.
  * The correlation is inside a `LATERAL` subquery deliberately (see below) — `LATERAL` exists specifically to *force* row-by-row evaluation when that's what you actually want.
  * Some aggregate/window-function combinations inside the correlated subquery are too complex for the planner's rewrite rules.
* **Advice**: don't assume either way. `EXPLAIN ANALYZE` and look for `SubPlan` (per-row re-execution, with `loops` matching the outer row count) vs. a flattened single-pass plan.

### Correlated `LATERAL` Subqueries

`LATERAL` is a keyword that explicitly allows a subquery in the `FROM` clause to reference columns from preceding `FROM` items — i.e., a *deliberately* correlated, per-row subquery in a context (`FROM`) where correlation isn't normally allowed at all.

```sql
-- "Top 2 most recent orders per customer" -- needs LIMIT per customer, so it cannot decorrelate
SELECT c.name, recent.order_id, recent.order_date
FROM customers c
CROSS JOIN LATERAL (
    SELECT o.id AS order_id, o.order_date
    FROM orders o
    WHERE o.customer_id = c.id          -- correlated reference to the preceding FROM item
    ORDER BY o.order_date DESC
    LIMIT 2
) AS recent;
```

This is the same fundamental tradeoff as a correlated `WHERE`-clause subquery (per-row evaluation), but used intentionally because the `LIMIT 2 ... ORDER BY` logic genuinely cannot be expressed as a flat join — there is no equivalent single GROUP BY that produces "top 2 per group" directly.

### Is `IN` ever the right choice?

* **Yes**: small, static lists. `WHERE status IN ('active', 'pending')`.
* **For subqueries**: prefer `EXISTS`/`JOIN` when the inner table is large or might contain `NULL`s in the selected column (see Pitfalls) — not because `IN` is inherently "slow," but because its `NOT IN` form has a well-documented correctness trap that `NOT EXISTS` avoids entirely.

---

## Hands-on Lab

### Setup: Schema and Seed Data

**Dialect: PostgreSQL 14+.**

```sql
DROP TABLE IF EXISTS products, category;

CREATE TABLE category (
    id    SERIAL PRIMARY KEY,
    name  TEXT NOT NULL
);

CREATE TABLE products (
    id            SERIAL PRIMARY KEY,
    product_name  TEXT NOT NULL,
    category_id   INTEGER REFERENCES category(id),
    price         NUMERIC(10,2) NOT NULL
);

INSERT INTO category (name) VALUES ('Electronics'), ('Books'), ('Toys');

INSERT INTO products (product_name, category_id, price) VALUES
    ('Laptop',      1, 1200.00),
    ('Headphones',  1, 80.00),
    ('Monitor',     1, 300.00),
    ('Novel',       2, 15.00),
    ('Textbook',    2, 95.00),
    ('Puzzle',      3, 20.00),
    ('Action Figure', 3, 25.00),
    ('Board Game',  3, 35.00);

ANALYZE category;
ANALYZE products;
```

**Category averages, computed by hand for verification**:
* Electronics: `(1200 + 80 + 300) / 3 = 526.67`
* Books: `(15 + 95) / 2 = 55.00`
* Toys: `(20 + 25 + 35) / 3 = 26.67`

### Exercise 1: Correlated Subquery — Identify the Bottleneck (or Lack Thereof)

**Goal**: Find products cheaper than the average of their own category.

```sql
EXPLAIN ANALYZE
SELECT product_name, price
FROM products p
WHERE price < (
    SELECT AVG(price)
    FROM products
    WHERE category_id = p.category_id   -- correlation: references the outer row's category_id
);
```

**Expected result set** (5 rows — a row qualifies if its price is strictly less than its category's average; trace each one against the per-category averages above):

| product_name | category | price | category avg | qualifies? |
|---|---|---|---|---|
| Laptop | Electronics | 1200.00 | 526.67 | No (1200.00 > 526.67) |
| Headphones | Electronics | 80.00 | 526.67 | Yes |
| Monitor | Electronics | 300.00 | 526.67 | Yes |
| Novel | Books | 15.00 | 55.00 | Yes |
| Textbook | Books | 95.00 | 55.00 | No (95.00 > 55.00) |
| Puzzle | Toys | 20.00 | 26.67 | Yes |
| Action Figure | Toys | 25.00 | 26.67 | Yes |
| Board Game | Toys | 35.00 | 26.67 | No (35.00 > 26.67) |

**Query result** (5 rows that qualify):

| product_name | price |
|---|---|
| Headphones | 80.00 |
| Monitor | 300.00 |
| Novel | 15.00 |
| Puzzle | 20.00 |
| Action Figure | 25.00 |

**Task**: Run the `EXPLAIN ANALYZE` above. With only 8 rows total, look at the plan shape — does it show a `SubPlan` node with `loops` equal to the outer row count (naive per-row re-execution), or has the planner already flattened it into a single grouped join? On a table this small the optimizer's choice barely affects wall-clock time, which is exactly why Exercise 2 asks you to verify with a *real* before/after comparison rather than trusting intuition about small tables.

### Exercise 2: The Rewrite — Verify It's Equivalent, Then Compare Plans

```sql
WITH category_avgs AS (
    SELECT category_id, AVG(price) AS avg_price
    FROM products
    GROUP BY category_id
)
SELECT p.product_name, p.price
FROM products AS p
INNER JOIN category_avgs AS c ON p.category_id = c.category_id
WHERE p.price < c.avg_price;
```

**Expected result**: identical 5 rows to Exercise 1 (Headphones, Monitor, Novel, Puzzle, Action Figure) — confirm this by running both queries and comparing output, not by assuming the rewrite is correct.

**EXPLAIN ANALYZE comparison step**:

```sql
EXPLAIN ANALYZE
WITH category_avgs AS (
    SELECT category_id, AVG(price) AS avg_price FROM products GROUP BY category_id
)
SELECT p.product_name, p.price
FROM products AS p
INNER JOIN category_avgs AS c ON p.category_id = c.category_id
WHERE p.price < c.avg_price;
```

Compare this plan's `cost=` and node structure against Exercise 1's plan. On this 8-row table, expect them to be nearly identical in cost and possibly in actual plan shape too — Postgres likely decorrelates Exercise 1's query into something resembling this CTE version automatically. **The lesson is not "the JOIN is faster"** — on this dataset it may not be measurably different at all. The lesson is: *check the plan, don't assume the Big-O label*. (To see a case where decorrelation genuinely cannot happen, revisit the `LATERAL` "top 2 per customer" example above and try `EXPLAIN ANALYZE` on it — that one *cannot* be flattened into a single grouped join, because `LIMIT` is per-group by construction.)

### Exercise 3: The NULL Trap — Complete `NOT EXISTS` Solution

**Goal**: Observe the `NOT IN` / NULL bug, then provide the complete, correct `NOT EXISTS` fix (the original lesson left this step incomplete).

```sql
DROP TABLE IF EXISTS table_a, table_b;
CREATE TABLE table_a (id INTEGER);
CREATE TABLE table_b (id INTEGER);

INSERT INTO table_a (id) VALUES (1), (2);
INSERT INTO table_b (id) VALUES (1), (NULL);

-- The bug
SELECT * FROM table_a WHERE id NOT IN (SELECT id FROM table_b);
-- Result: 0 rows. (Intuitively you'd expect '2', since 2 is not in {1, NULL}.)
```

**Why zero rows, exactly**: `NOT IN (SELECT id FROM table_b)` expands conceptually to `id != 1 AND id != NULL`. For `id = 2`: `2 != 1` is `TRUE`, but `2 != NULL` is `UNKNOWN` (three-valued logic — comparing anything to `NULL` with `=` or `!=` yields `UNKNOWN`, never `TRUE` or `FALSE`). `TRUE AND UNKNOWN` evaluates to `UNKNOWN`, and `WHERE` only keeps rows where the condition is `TRUE` — `UNKNOWN` rows are discarded just like `FALSE` rows. Since `table_b` contains *any* `NULL` at all, **every** row in `table_a` gets `UNKNOWN` for this comparison, and the result is empty regardless of what other values are in `table_a`.

**The complete, correct fix**:

```sql
SELECT * FROM table_a a
WHERE NOT EXISTS (
    SELECT 1 FROM table_b b WHERE b.id = a.id   -- the correlation condition: this is the part the original lesson omitted
);
```

**Expected result** (1 row):

| id |
|---|
| 2 |

**Why this works where `NOT IN` failed**: `NOT EXISTS` asks "is there a row in `table_b` where `b.id = a.id`?" for `id = 2`: no row in `table_b` has `id = 2` (rows are `1` and `NULL`; `NULL = 2` is `UNKNOWN`, not a match), so `EXISTS` is `FALSE`, and `NOT EXISTS` is `TRUE` — row 2 is correctly kept. The `NULL` row in `table_b` simply never produces a match for *any* value, instead of poisoning the entire comparison the way it does inside an `IN`/`NOT IN` list.

**Why `SELECT 1` and not `SELECT id` or `SELECT *`**: `EXISTS` only cares whether the subquery returns *any row at all* — it never inspects the values of the selected columns. `SELECT 1` is idiomatic precisely because it signals "the literal doesn't matter, only row-existence does." `SELECT id`, `SELECT *`, and `SELECT 1` are functionally identical here and typically produce the same plan; `SELECT 1` is a readability convention, not a performance requirement.

**The mistake to avoid**: writing `NOT EXISTS (SELECT 1 FROM table_b)` *without* the correlation condition `WHERE b.id = a.id`. Without it, the subquery asks "does `table_b` have any rows at all?" — a single global yes/no answer, completely independent of `a.id`. Since `table_b` has 2 rows, that `EXISTS` is always `TRUE`, so `NOT EXISTS` is always `FALSE`, and the outer query returns **zero rows for every value of `a.id`**, including `2`. This is the inverse failure mode: forgetting the correlation condition turns a row-by-row filter into a single always-true-or-always-false check.

---

## Coverage: Error Cases, Terminology, and Operators

### Scalar Subquery Error: More Than One Row

Shown above in the Technical Deep Dive — a scalar-subquery slot (used where exactly one value is expected, such as `column = (subquery)` or as a `SELECT` list expression) raises `ERROR: more than one row returned by a subquery used as an expression` if the inner query returns 2+ rows. This is a **runtime** error, not caught at parse time, so a development dataset with coincidentally unique values per group can hide the bug until production data violates the assumption.

### Semi-join / Anti-join Terminology

* **Semi-join**: a join-like operation that returns rows from the left side that have *at least one* match on the right, without ever duplicating left rows or exposing right-side columns. `WHERE EXISTS (...)` and `WHERE x IN (subquery)` are both semi-join patterns.
* **Anti-join**: the complement — left rows with *no* match on the right. `WHERE NOT EXISTS (...)` and `WHERE x NOT IN (subquery)` (NULL caveats aside) are anti-join patterns.

### `ANY` / `ALL`

* `WHERE price > ANY (SELECT price FROM products WHERE category_id = 2)` — true if the row's price exceeds **at least one** value in the subquery's result (equivalent to `> (SELECT MIN(price) ...)`).
* `WHERE price > ALL (SELECT price FROM products WHERE category_id = 2)` — true if the row's price exceeds **every** value in the subquery's result (equivalent to `> (SELECT MAX(price) ...)`).
* `= ANY (subquery)` is equivalent to `IN (subquery)`; `<> ALL (subquery)` is equivalent to `NOT IN (subquery)` — including inheriting the same NULL trap, since the underlying three-valued logic is identical.

### Duplicate-Row Semantics When Rewriting `IN` to a `JOIN`

`WHERE category_id IN (SELECT category_id FROM products WHERE price > 1000)` is a semi-join — each matching `products` row appears once, regardless of how many rows in the subquery share that `category_id`. If you naively rewrite this as `INNER JOIN (SELECT category_id FROM products WHERE price > 1000) sub ON p.category_id = sub.category_id` **without first deduplicating** the subquery's result, and the subquery returns the same `category_id` multiple times (e.g., 3 expensive products in Electronics), the join multiplies — every Electronics product appears 3 times in the output instead of once. **Fix**: `GROUP BY` or `DISTINCT` the subquery side before joining, or just use `EXISTS`/`IN` directly when you only need the semi-join semantics.

### Null-Safe Alternatives

* For `NOT IN` against a column that might contain `NULL`s: use `NOT EXISTS` (shown above), or filter NULLs out of the subquery explicitly: `WHERE id NOT IN (SELECT id FROM table_b WHERE id IS NOT NULL)` — this avoids the trap but is easy to forget to apply consistently, which is why `NOT EXISTS` is the more robust default.
* `IS DISTINCT FROM` / `IS NOT DISTINCT FROM` treat `NULL` as a comparable value (`NULL IS DISTINCT FROM NULL` is `FALSE`, unlike `NULL = NULL` which is `UNKNOWN`) — useful when you specifically want NULL-aware equality rather than three-valued-logic equality.

---

## Pitfalls

* **`NOT EXISTS` correlation mistakes**: Forgetting the correlation condition (`WHERE b.id = a.id`) turns a per-row check into a single global always-true or always-false check for the entire outer query — see Exercise 3's worked failure mode above. Always double check that a `NOT EXISTS`/`EXISTS` subquery references at least one outer-query column.
* **Duplicate-row multiplication when rewriting `IN` to a `JOIN`**: Covered above — converting a semi-join (`IN`) to a plain `INNER JOIN` without deduplicating the right side multiplies output rows whenever the right side has duplicate keys.
* **Scalar subqueries that sometimes return multiple rows**: A query that works in development (one row per group, by coincidence of small test data) can error in production the first time a group legitimately has 2+ rows. Always aggregate or constrain a scalar-subquery slot explicitly — don't rely on the data happening to be unique.
* **The semantic difference between JOIN and EXISTS**: A `JOIN` can multiply rows (fanout) when the right side has multiple matches; `EXISTS` is strictly boolean and never multiplies. If you only need to *filter* the left table based on the presence of related rows (not pull in right-side columns), `EXISTS`/`NOT EXISTS` is both semantically cleaner and structurally immune to fanout bugs that a `JOIN` + `DISTINCT` patch-up would otherwise need to guard against.

---

## Glossary

| Term | Definition |
|---|---|
| **Subquery** | A query nested inside another query, used as a value, row set, or boolean test. |
| **Correlation** | A reference inside a subquery to a column from the enclosing (outer) query, making the subquery's result depend on the current outer row. |
| **Scalar (subquery)** | A subquery guaranteed (or required) to return exactly one row and one column, usable anywhere a single value is expected. |
| **Semi-join** | An operation returning left-table rows that have at least one match on the right, without duplicating left rows or exposing right-table columns (`EXISTS`, `IN`). |
| **Anti-join** | The complement of a semi-join: left-table rows with no match on the right (`NOT EXISTS`, `NOT IN` with NULL caveats). |
| **Three-valued logic** | SQL's boolean system of `TRUE`, `FALSE`, and `UNKNOWN`, where any comparison involving `NULL` (other than `IS [NOT] NULL` and `IS [NOT] DISTINCT FROM`) evaluates to `UNKNOWN`, and `WHERE` discards `UNKNOWN` rows just like `FALSE` rows. |
| **Unnesting (Decorrelation)** | The optimizer's automatic rewrite of a correlated subquery into a semi-join, anti-join, or grouped join for single-pass execution, when the query shape permits it. |
| **Short-circuiting** | `EXISTS`'s behavior of stopping evaluation as soon as one matching row is found, rather than counting or reading every possible match. |

---

## Mastery Check

### Question 1: NOT IN and NULL

Why does `WHERE id NOT IN (SELECT id FROM table_b)` return zero rows when `table_b` contains any `NULL` in its `id` column, regardless of other values?

A) Because `5 != NULL` evaluates to `TRUE` for every comparison.
B) Because `5 != NULL` evaluates to `UNKNOWN` (three-valued logic), and `AND`-ing that `UNKNOWN` into every row's overall condition makes the whole condition `UNKNOWN`, which `WHERE` discards just like `FALSE`.
C) Because `NULL` values are invisible to the database and get skipped.
D) Because `NOT IN` converts `NULL` to `0` automatically.

<details>
<summary>Click for Answer</summary>

**Answer: B**
NOT IN expands to a chain of != comparisons ANDed together. Any single NULL in the list makes one of those comparisons UNKNOWN, and UNKNOWN AND anything is at best UNKNOWN — which WHERE treats as false. This poisons the result for every row in the outer table, not just rows that would have matched the NULL.
</details>

### Question 2: Performance claims

Which statement best reflects this lesson's guidance on correlated subqueries vs. JOINs?

A) Correlated subqueries are always O(N^2) and should never be used.
B) Modern optimizers often rewrite (decorrelate) correlated subqueries into single-pass semi-/grouped-joins automatically; real performance must be verified with EXPLAIN ANALYZE rather than assumed from the query's surface syntax.
C) JOINs are always faster than subqueries in every database engine.
D) EXISTS should always be preferred over every other construct in every situation.

<details>
<summary>Click for Answer</summary>

**Answer: B**
The naive "runs once per outer row" mental model describes one possible execution strategy, not a guarantee. Decorrelation often eliminates the performance difference entirely for common patterns; LIMIT-bearing or volatile-function subqueries are the cases where per-row execution is more likely to be unavoidable.
</details>

### Question 3: EXISTS short-circuiting

Does `EXISTS (SELECT * FROM big_table WHERE ...)` need to scan every matching row in `big_table`?

A) Yes, it must count all matches first.
B) No — it stops as soon as it finds one matching row ("short-circuiting"), regardless of how many more matches exist.
C) It always reads exactly half the table.
D) It depends on the time of day.

<details>
<summary>Click for Answer</summary>

**Answer: B**
EXISTS only needs a yes/no answer, so the engine can stop scanning the instant it finds a single qualifying row. This is why EXISTS is typically cheaper than COUNT(*) > 0, which must finish counting before comparing.
</details>

### Question 4: Scalar subquery cardinality

A scalar subquery slot (e.g., `WHERE price = (SELECT price FROM products WHERE category_id = 5)`) is run against data where category_id 5 has 2 products. What happens?

A) It silently returns the first matching row.
B) It silently returns NULL.
C) It raises a runtime error: more than one row returned by a subquery used as an expression.
D) It averages the two prices automatically.

<details>
<summary>Click for Answer</summary>

**Answer: C**
A scalar subquery slot requires exactly one row and one column. If the inner query returns more than one row, the engine raises an error at runtime rather than guessing which row to use -- this can pass testing on data with coincidentally unique groups and fail later in production.
</details>

### Question 5: NOT EXISTS without correlation

A developer writes `SELECT * FROM table_a a WHERE NOT EXISTS (SELECT 1 FROM table_b)` -- omitting any reference to `a` inside the subquery. What happens?

A) It behaves identically to a correctly correlated NOT EXISTS.
B) If table_b has any rows, the subquery is a single global TRUE/FALSE check independent of a's value, so NOT EXISTS becomes always FALSE for every row in table_a, returning zero rows entirely.
C) It raises a syntax error, since EXISTS subqueries must always be correlated.
D) It only returns rows from table_a that also exist in table_b.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Without a correlation condition, the subquery answers one global question ("does table_b have any rows?") instead of a per-row question. If table_b is non-empty, EXISTS is always true and NOT EXISTS is always false for every outer row -- a silent, all-or-nothing bug.
</details>

### Question 6: IN-to-JOIN rewrite risk

`WHERE category_id IN (SELECT category_id FROM products WHERE price > 1000)` is rewritten as `INNER JOIN (SELECT category_id FROM products WHERE price > 1000) sub ON p.category_id = sub.category_id`, without deduplicating sub. If 3 different expensive products share category_id = 1, what happens to Electronics products in the output?

A) Nothing changes; the rewrite is always row-count-safe.
B) Each Electronics product row in the outer table gets duplicated 3 times, once per matching row in sub, because the JOIN multiplies rows while the original IN/semi-join never did.
C) The query returns an error.
D) Electronics products disappear entirely from the result.

<details>
<summary>Click for Answer</summary>

**Answer: B**
IN/EXISTS are semi-joins: each outer row appears at most once regardless of how many subquery rows match. A naive JOIN rewrite without DISTINCT/GROUP BY on the subquery side reintroduces fanout -- exactly the duplication semi-join semantics were designed to avoid.
</details>

### Question 7: SELECT 1 in EXISTS

Why does `EXISTS (SELECT 1 FROM table_b b WHERE b.id = a.id)` use the literal `1` instead of a real column?

A) `1` is required syntax and nothing else is valid.
B) EXISTS only checks whether any row is returned by the subquery -- it never inspects the selected values, so the literal is purely a readability convention signaling "only existence matters here."
C) Using `1` makes the query run in constant time regardless of data size.
D) `SELECT *` would cause a different, larger result.

<details>
<summary>Click for Answer</summary>

**Answer: B**
EXISTS discards whatever the subquery's SELECT list returns; it only cares about row existence. SELECT 1, SELECT id, and SELECT * are functionally equivalent here and typically produce the same plan -- SELECT 1 is idiomatic, not required.
</details>

### Question 8: LATERAL and decorrelation limits

Why can't the optimizer flatten a "top 2 most recent orders per customer" query (using `LATERAL ... ORDER BY ... LIMIT 2`) into a single grouped JOIN the way it can for a simple correlated AVG() subquery?

A) LATERAL queries are always slower by definition and cannot be optimized at all.
B) A per-group LIMIT depends on per-group ordering and a row-count cutoff that has no equivalent single-pass GROUP BY expression -- there's no aggregate function that produces "the top 2 rows," so per-group (per-row) evaluation is structurally required.
C) LATERAL is deprecated syntax that should never be used.
D) The optimizer always decorrelates every subquery, including this one.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Simple correlated aggregates (AVG, SUM, COUNT) have a direct GROUP BY equivalent, which is why they're easy to decorrelate. "Top N per group" has no single-aggregate equivalent -- it requires ranking and limiting within each group, which is exactly what LATERAL is designed to express directly.
</details>

---

## Summary

Today you learned:

* ✅ **Correlation**: a subquery referencing an outer column — not automatically "slow," since modern optimizers often decorrelate it.
* ✅ **Semantics first**: `EXISTS`, `IN`, and `JOIN` differ in NULL handling and row-multiplication before they differ in speed.
* ✅ **NULLs**: the three-valued-logic trap inside `NOT IN`, and why `NOT EXISTS` with a correct correlation condition avoids it.
* ✅ **Scalar cardinality**: a scalar-subquery slot must return exactly one row, or the engine errors at runtime.
* ✅ **Decorrelation limits**: `LIMIT`-bearing and "top N per group" subqueries are genuine cases where per-row (or `LATERAL`) evaluation is unavoidable.

**Congratulations! You have completed the SQL Mastery internals sequence (Days 96-101).**
**Tomorrow**: We move into NoSQL data models — **Day 101B: NoSQL Deep Dive**.
