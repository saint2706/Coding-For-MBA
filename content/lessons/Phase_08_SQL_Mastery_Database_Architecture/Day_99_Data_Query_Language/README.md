---
day: 99
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
  - "DQL Foundations & Logical Query-Processing Order"
  - "The Query Optimizer (Cost Based)"
  - "Scan Types (Seq, Index, Bitmap Heap, Index-Only)"
  - "CTE Optimization (Materialized vs Not)"
prerequisites:
  - "Basic SELECT, WHERE, GROUP BY"
  - "Day 96: Relational Database Internals (MVCC, statistics)"
outcomes:
  - "Explain why a SELECT alias cannot be used in WHERE, as a consequence of logical query order"
  - "Read a Query Plan bottom-up and identify bottlenecks"
  - "Force an Index Only Scan and verify it with EXPLAIN"
  - "Rewrite a slow query to use SARGable predicates"
---

# 🎯 Day 99: Advanced DQL & Optimization

> *"The Query Optimizer is smart, but it's not psychic. You have to give it clues."*

**Dialect note**: All SQL, `EXPLAIN` output, and timing claims in this lesson are **PostgreSQL 14+** unless stated otherwise. Cost units, page size, and visibility-map mechanics described below are Postgres-specific approximations — other engines (MySQL/InnoDB, SQL Server, Snowflake) use different cost models and storage layouts.

---

## 0. DQL Foundations: The Logical Query-Processing Order

DQL (**D**ata **Q**uery **L**anguage) is the subset of SQL that *reads* data: `SELECT`. Before tuning anything, you need to know the order the database actually evaluates your clauses in — it is **not** the order you type them in.

**You write SQL in this order:**

```sql
SELECT columns
FROM table
WHERE row_filter
GROUP BY grouping_columns
HAVING group_filter
ORDER BY sort_columns
LIMIT n;
```

**The database evaluates it in this order:**

1. `FROM` (and `JOIN`s) — assemble the working row set from the source table(s).
2. `WHERE` — discard rows that don't match (operates on raw columns; aliases from `SELECT` don't exist yet).
3. `GROUP BY` — collapse remaining rows into groups.
4. `HAVING` — discard *groups* that don't match (can reference aggregates; `WHERE` cannot).
5. `SELECT` — compute the final column list and any aliases.
6. `ORDER BY` — sort the result set (in Postgres, `ORDER BY` *can* reference a `SELECT` alias, because it runs after `SELECT`).
7. `LIMIT` / `OFFSET` — truncate to the requested row count.

### Why you can't reference a SELECT alias in WHERE

```sql
-- This FAILS in Postgres: "column total_price does not exist"
SELECT price * quantity AS total_price
FROM order_items
WHERE total_price > 100;
```

`WHERE` (step 2) runs **before** `SELECT` (step 5). At the point `WHERE` executes, `total_price` has not been computed yet — it doesn't exist as a name the engine can resolve. The fix is to repeat the expression, or move the filter into a CTE/subquery so it runs in a later `SELECT`:

```sql
-- Fix 1: repeat the expression in WHERE
SELECT price * quantity AS total_price
FROM order_items
WHERE price * quantity > 100;

-- Fix 2: compute it in a CTE, then filter the CTE's output column
WITH priced AS (
    SELECT price * quantity AS total_price FROM order_items
)
SELECT total_price FROM priced WHERE total_price > 100;
```

The same rule explains why `HAVING` *can* reference an aggregate alias (or the raw aggregate expression) — `HAVING` runs after `GROUP BY` has produced aggregate values, while `WHERE` runs before any grouping or aggregation exists.

| Clause | Runs at step | Can see SELECT aliases? | Can see aggregates? |
|---|---|---|---|
| `FROM`/`JOIN` | 1 | No | No |
| `WHERE` | 2 | No | No |
| `GROUP BY` | 3 | No (standard SQL; Postgres allows ordinal/alias as an extension) | No |
| `HAVING` | 4 | No (Postgres) | Yes |
| `SELECT` | 5 | Yes (defines them) | Yes |
| `ORDER BY` | 6 | Yes | Yes |
| `LIMIT`/`OFFSET` | 7 | Yes | Yes |

Now that you know *what order the engine reasons in*, the rest of this lesson is about *how fast* it executes each step.

---

## The "Never-Coded" Bridge

**The Librarian's Search**

**Query**: "Find 'Harry Potter' (Title) released in '2005' (Year)."

1. **Seq Scan**: Librarian walks down every aisle, pulling every book, checking the title. (Slow, but no setup cost.)
2. **Index Scan**: Librarian goes to the Card Catalog (sorted by Title). Finds "Harry Potter". Goes to the shelf. Checks Year. (Fast for a few matches.)
3. **Bitmap Heap Scan**: Librarian finds 500 "Harry Potter" entries in the catalog, marks their shelf locations on a map, then walks the shelves once in physical order to grab them all — instead of bouncing back and forth.
4. **Index Only Scan**: The Card Catalog lists the Year right next to the Title.
    * Librarian reads the card: "Harry Potter, 2005."
    * **Result**: She never walks to the shelf at all (fastest) — *provided* the catalog card is guaranteed up to date (see "Visibility Map" below).

---

## The Technical Deep Dive

### 1. The Query Plan (`EXPLAIN`)

```sql
EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM orders WHERE amount > 100;
```

* **Cost**: A pair of numbers, `startup_cost..total_cost`, in **arbitrary, engine-internal units** used only to *compare plan options against each other*. In Postgres, the units are calibrated so that reading one sequential 8KB page costs `seq_page_cost = 1.0` by default — that is a **Postgres-specific configuration default**, not a universal SQL constant. Other engines (SQL Server, Oracle, MySQL) use entirely different cost models, page sizes, and units. **Never compare cost numbers across two different database engines, or treat them as milliseconds or dollars.**
* **Rows**: The planner's *estimate* of how many rows a node will produce, derived from table statistics (`pg_statistic`), not an actual count.
* **Actual Time / Actual Rows**: Only appear with `EXPLAIN ANALYZE`, which *really runs the query* and reports ground truth. Comparing "Rows" (estimate) to "Actual Rows" (truth) is the single most useful diagnostic in this lesson — see Section 4.
* **Loops**: How many times a plan node executed. A nested-loop inner side with `loops=10000` is a strong signal of a misestimate (see Pitfalls).

### 2. Scan Types

* **Sequential Scan**: Reads the whole table, page by page, in physical order. Good for small tables, or when the query needs a large fraction of rows — sequential I/O is cheap per row even though it reads everything.
* **Index Scan**: Uses a B-Tree (or other index) to jump directly to matching rows, then fetches each one from the table ("heap") individually. Each fetch can be a random I/O — efficient for a handful of matches, increasingly expensive as match count grows.
* **Bitmap Heap Scan**: A hybrid. The index is used to build an in-memory bitmap of *all* matching page locations first, then the heap is read in physical page order. This avoids the random-I/O penalty of a plain Index Scan when there are too many matches for a simple Index Scan to be efficient, but too few to justify a full Seq Scan.
* **Index Only Scan**: If every column the query needs is present *in the index itself*, the engine can skip visiting the table ("heap fetch") entirely. This is the cheapest scan type *when it is fully usable* — softer framing than "the Holy Grail," because it has a real precondition:
  * **The Visibility Map requirement**: Postgres's MVCC model (Day 96) means a row's true visibility (is this version live, deleted, or from an uncommitted transaction?) is stored on the heap page, not in the index. An Index Only Scan can only skip the heap fetch for a given page if that page is marked **all-visible** in the table's visibility map — meaning no recently-changed/dead tuples exist on it. A table that has been heavily written to since the last `VACUUM` will show `Heap Fetches: <large number>` even when using an "Index Only Scan" node, because the planner had to fall back to checking visibility on the heap anyway. Run `VACUUM` (or wait for autovacuum) to keep the visibility map current and get the full benefit.

```sql
CREATE INDEX idx_users_name_email ON users(name) INCLUDE (email);
-- SELECT email FROM users WHERE name = 'Bob';  -- can be Index Only if the page is all-visible
```

### 3. SARGable Queries

**S**earch **ARG**ument **Able** — can the predicate be evaluated using an index directly, without transforming every row first?

* **Bad**: `WHERE date_trunc('year', date_column) = 2023`. You wrapped the column in a function. The engine must compute `date_trunc()` for *every row* before it can compare — the index on the raw `date_column` is ignored.
* **Good**: `WHERE date_column >= '2023-01-01' AND date_column < '2024-01-01'`. A direct range comparison on the raw column. The index is used.
* **Watch the boundary**: `WHERE date_column BETWEEN '2023-01-01' AND '2023-12-31'` is SARGable, but is an **off-by-one trap** for timestamp columns. `BETWEEN` is inclusive on both ends, so `'2023-12-31'` only matches rows with that exact midnight timestamp (`2023-12-31 00:00:00`) — any order placed later that same day (`2023-12-31 14:32:00`) is silently excluded. Prefer the half-open range pattern (`>= start AND < next_start`) shown above for date/timestamp filters; it's both SARGable and correct at the boundary.

---

## 4. Reading a Plan Tree: Bottom-Up, Estimate vs. Actual

`EXPLAIN ANALYZE` prints a *tree*, indented to show nesting. The most common mistake is reading it top-to-bottom like English prose. **Read it bottom-up**: the innermost (most-indented) nodes execute first; their output feeds the node above them, like ingredients feeding into the next cooking step.

```text
Hash Join  (cost=27.50..60.50 rows=300 width=72) (actual time=0.45..1.20 rows=42 loops=1)
  Hash Cond: (o.user_id = u.id)
  ->  Seq Scan on orders o  (cost=0.00..20.00 rows=1000 width=24) (actual time=0.01..0.15 rows=1000 loops=1)
  ->  Hash  (cost=15.00..15.00 rows=500 width=48) (actual time=0.20..0.20 rows=500 loops=1)
        ->  Seq Scan on users u  (cost=0.00..15.00 rows=500 width=48) (actual time=0.01..0.10 rows=500 loops=1)
```

**Reading order**: `Seq Scan on users` runs first → feeds `Hash` (builds the in-memory hash table) → in parallel, `Seq Scan on orders` runs → both feed the top-level `Hash Join`, which probes the hash table for each `orders` row.

**The single most important comparison**: estimated `rows=300` (top node) vs. actual `rows=42`. The planner expected ~300 matching rows and got 42 — a 7x overestimate. This usually means stale statistics (Section on Pitfalls) and can cause the planner to *choose the wrong join algorithm or scan type* for the real data volume, because it priced its options against the wrong row count.

**Spotting a nested-loop misestimate**: watch for `loops=N` on the inner side of a Nested Loop where `N` is far larger than the planner's estimated row count for the outer side. If the plan shows `Nested Loop ... rows=5` but the inner index scan reports `loops=50000`, the planner thought it would only need to probe the index 5 times — instead it probed 50,000 times. Each probe might be individually cheap, but 50,000 cheap operations is not cheap in aggregate. This pattern (correct algorithm choice, wrong row-count assumption) is the most common real-world cause of "this query used to be fast and now it's slow."

---

## Senior-Level Insights

### "The Optimizer knows better than you" (usually)

* **Junior**: "Why is it doing a Seq Scan? I have an index!"
* **Senior**: "Because you asked for ~40% of the table. A Seq Scan (sequential I/O) is often cheaper in total than that many random-I/O index hops — though the exact tipping point depends on table size, row width, how clustered the matching rows are on disk, and storage hardware (spinning disk vs. SSD). There is no single hard percentage that is correct on every engine and every dataset; treat thresholds as starting points to verify, not laws."
* **Lesson**: Don't force scan types (`SET enable_seqscan = off`) in production unless you have *proven*, with `EXPLAIN ANALYZE` and current statistics, that the optimizer's row estimate is wrong.

### CTEs: Optimization Fences

* **In Postgres < 12**: CTEs were always "materialized" — calculated once into a temporary result, stored, then read. *Pros*: predictable, isolated. *Cons*: an optimization fence — the planner cannot push a `WHERE` clause from the outer query down into the CTE to reduce work early.
* **Postgres 12+**: The planner tries to "inline" a CTE (treat it like a subquery) automatically when it's safe and likely faster.
* **Override**: `WITH x AS MATERIALIZED (...)` forces the old fenced behavior; `WITH x AS NOT MATERIALIZED (...)` forces inlining. Useful when the CTE has side effects (e.g., wraps a volatile function) you want evaluated exactly once.

---

## Hands-on Lab

### Setup: Schema and Seed Data

**Dialect: PostgreSQL 14+.** This lab needs enough rows that an index actually beats a sequential scan — a 10-row table will never show the difference, because the whole table fits in one or two pages regardless of plan choice.

```sql
DROP TABLE IF EXISTS orders, users;

CREATE TABLE users (
    id          SERIAL PRIMARY KEY,
    lastname    TEXT NOT NULL,
    phone       TEXT NOT NULL
);

CREATE TABLE orders (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER REFERENCES users(id),
    amount      NUMERIC(10,2) NOT NULL,
    order_date  TIMESTAMP NOT NULL
);

-- 2,000 users with deterministic, skewed lastname distribution
INSERT INTO users (lastname, phone)
SELECT
    (ARRAY['Smith','Garcia','Lee','Patel','Nguyen'])[1 + (i % 5)],
    '555-' || LPAD(i::text, 4, '0')
FROM generate_series(1, 2000) AS i;

-- 200,000 orders: amount and order_date chosen so selectivity is known exactly
INSERT INTO orders (user_id, amount, order_date)
SELECT
    1 + (i % 2000),
    (i % 1000) + 0.50,                                  -- amounts 0.50 .. 999.50
    TIMESTAMP '2023-01-01 00:00:00' + (i % 365) * INTERVAL '1 day' + (i % 24) * INTERVAL '1 hour'
FROM generate_series(1, 200000) AS i;

-- Statistics MUST be current before reading plans, or estimates will be stale/default
ANALYZE users;
ANALYZE orders;
```

**Known cardinality, computed from the seed logic above** (verify by running the `SELECT COUNT(*)` yourself):
* `orders.amount > 900` matches `i % 1000` in `(900, 999]` → roughly `(999-900)/1000 * 200000 = 19,800` rows (≈9.9% of the table — a "wide" filter, not highly selective).
* `orders.amount > 999` matches only `i % 1000 = 999` → exactly `200000 / 1000 = 200` rows (0.1% — highly selective).
* `orders.user_id = 1` matches every `i` where `1 + (i % 2000) = 1`, i.e. `i % 2000 = 0` → exactly `200000 / 2000 = 100` rows.
* `users.lastname = 'Smith'` matches `i % 5 = 0` (since `Smith` is array index 1, i.e. offset 0) → exactly `2000 / 5 = 400` rows.

### Exercise 1: Reading a Plan (Wide Filter → Seq Scan Expected)

```sql
EXPLAIN ANALYZE
SELECT * FROM orders WHERE amount > 900;
```

* **Expected plan node**: `Seq Scan on orders` with `rows≈19800` actual, because ~9.9% of the table matches — random I/O for that many rows usually costs more than one full sequential pass, even with an index present (you have not created one on `amount` yet).
* **Task**: Identify the Node Type and compare planner `rows=` estimate to `actual ... rows=`. They should be close, since statistics are fresh from the `ANALYZE` above.

### Exercise 2: Selective Filter → Index Scan, Then Killing SARGability

```sql
CREATE INDEX idx_orders_date ON orders(order_date);
ANALYZE orders;

-- Fast: SARGable range predicate, ~200/200000 = 0.1% selective
EXPLAIN ANALYZE
SELECT * FROM orders WHERE order_date >= '2023-06-01' AND order_date < '2023-06-02';
```

* **Expected**: `Index Scan using idx_orders_date` (one day ≈ `200000/365 ≈ 548` rows — small enough that the planner should prefer the index).

```sql
-- Slow: casting to text hides the underlying date structure from the index
EXPLAIN ANALYZE
SELECT * FROM orders WHERE order_date::text LIKE '2023-06-01%';
```

* **Expected**: `Seq Scan on orders`. *Why?*: Casting every row's `order_date` to `text` is a function applied per-row; the B-Tree index is built on the raw timestamp value, not the casted string, so it cannot be used to satisfy a `LIKE` on the casted form.
* **Timing protocol**: Run each query 3 times with `\timing` on in `psql` (or `EXPLAIN (ANALYZE, TIMING)`), discard the first run (cold cache), and record the median of runs 2–3. The *first* run after a fresh connection or after `DISCARD ALL` reflects cold OS/shared-buffer cache; later runs benefit from caching and will look artificially fast — this is why a single timing run is not trustworthy evidence (see Pitfalls).

### Exercise 3: Covering Index → Index Only Scan

```sql
CREATE INDEX idx_lastname_phone ON users(lastname, phone);
ANALYZE users;

EXPLAIN ANALYZE
SELECT phone FROM users WHERE lastname = 'Smith';
```

* **Expected**: `Index Only Scan using idx_lastname_phone`, with `Heap Fetches: 0` — because the query only needs `lastname` (the filter) and `phone` (the output), and both are present directly in the index. (If `Heap Fetches` is greater than 0 immediately after a bulk insert and before a `VACUUM`, that's the visibility-map effect described above — run `VACUUM users;` and re-run to see it drop to 0.)
* **Plan-node interpretation prompt**: Compare this plan's `cost=` to Exercise 1's. Which is lower, and does that match the selectivity numbers computed in Setup (400/2000 = 20% for `lastname='Smith'` vs. ~9.9% for `amount > 900`)? If the covering-index query has a *higher* cost despite being more selective, what does that tell you about index width or row width — and is that a contradiction, or expected given the table sizes differ (2,000 rows vs. 200,000 rows)?

---

### Decision Guidance: Choosing a Scan Type

| Scan Type | Best when... | Selectivity (rule of thumb, not a hard cutoff) | Table size | Needs sort order? | Write cost (extra indexes) |
|---|---|---|---|---|---|
| **Sequential Scan** | No usable index, or query needs most of the table | High (often >10-20%, verify per case) | Any; dominant for small tables regardless of selectivity | No | None — no index to maintain |
| **Index Scan** | Few matching rows, index exists on filter column | Low (a handful to low single-digit %) | Larger tables, where random I/O on a few rows beats reading everything | Can satisfy `ORDER BY` if index order matches | One index to maintain per write |
| **Bitmap Heap Scan** | Moderate match count — too many for plain Index Scan's random I/O, too few for Seq Scan | Mid-range (rule of thumb territory — verify with `EXPLAIN`) | Larger tables | No (bitmap reorders by physical page, not key order) | Same as Index Scan |
| **Index Only Scan** | All needed columns exist in the index, visibility map is current | Any — selectivity matters less since heap is skipped | Any | Yes, if index order matches | Highest — wider index, more page writes on every insert/update |

These are **starting heuristics to verify with `EXPLAIN ANALYZE` on your own data**, not fixed thresholds — the real crossover point depends on row width, disk vs. SSD, cache state, and how clustered matching rows are physically.

---

## Pitfalls

* **Stale statistics**: The planner's row estimates come entirely from `pg_statistic`, populated by `ANALYZE` (run automatically by `autovacuum` on a schedule, or manually). After a large bulk load, bulk delete, or significant data-distribution shift, statistics can be stale until the next autovacuum cycle — re-run `ANALYZE table_name;` manually after any bulk operation before trusting a plan.
* **Parameter sensitivity / plan caching surprises**: Prepared statements and some ORMs cache a *generic* plan after a few executions, optimized for "typical" parameter values — not the specific value you're running right now. A query that's fast for `WHERE status = 'active'` (90% of rows excluded) can reuse a cached plan tuned for a *different*, less selective parameter and perform badly. If a parameterized query is inexplicably slow only sometimes, suspect plan caching before suspecting data.
* **Cache effects on benchmark timing**: The OS page cache and Postgres's shared buffers mean the second run of any query is almost always faster than the first, regardless of plan quality. Never trust a single timing run; always discard a cold first run (see Exercise 2's timing protocol).
* **Write amplification from too many indexes**: Every index must be updated on every `INSERT`/`UPDATE`/`DELETE` to the indexed columns. A table with 8 indexes pays that cost 8 times per write. Index for your actual read patterns, not "just in case."
* **Unused indexes**: Check `pg_stat_user_indexes.idx_scan` periodically — an index with `idx_scan = 0` after a representative workload period is pure write overhead with no read benefit, and a candidate for removal.
* **Expression indexes vs. functional rewrite**: If you cannot avoid filtering on `LOWER(email) = 'x'`, create an expression index — `CREATE INDEX idx_users_email_lower ON users(LOWER(email));` — rather than trying to make the raw-column index magically match a transformed predicate. An expression index is needed precisely when the SARGable rewrite (filtering on the raw column) is not possible because the transformation is part of the business logic (e.g., genuinely case-insensitive lookup), not just a style choice.
* **`BETWEEN` timestamp-boundary risk**: Covered above — `BETWEEN '2023-01-01' AND '2023-12-31'` silently excludes same-day rows with a non-midnight timestamp on the end date. Prefer half-open ranges.

---

## Glossary

| Term | Definition |
|---|---|
| **DQL** | Data Query Language — the `SELECT` subset of SQL used to read (not modify) data. |
| **Optimizer (Query Planner)** | The component that evaluates multiple possible execution strategies for a query and picks the one with the lowest estimated cost. |
| **Cost** | An arbitrary, engine-internal unit used by the optimizer to compare plan options. Not milliseconds, not dollars, and not comparable across different database engines. |
| **Cardinality** | The number of distinct values in a column, or the number of rows a query/operation is expected to return. |
| **Selectivity** | The fraction of a table's rows that match a given filter. Low selectivity (few matches) favors indexes; high selectivity (most rows match) favors sequential scans. |
| **SARGable** | "Search ARGument Able" — a predicate written so the engine can evaluate it directly using an index, without first transforming every row. |
| **Heap** | Postgres's term for the main table storage (as opposed to an index), where full row versions live. |
| **Covering Index** | An index that contains every column a query needs, allowing an Index Only Scan that never touches the heap. |
| **Visibility Map** | A per-table bitmap tracking which pages contain only rows visible to all transactions (no recent changes), used to decide whether an Index Only Scan can skip a heap fetch. |

---

## Mastery Check

### Question 1: Seq Scan

When is a Sequential Scan often faster than an Index Scan?

A) Never.
B) When the query returns a large fraction of the table (a rule of thumb, not a fixed cutoff — verify with EXPLAIN).
C) Only on Tuesdays.
D) When the table is empty.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Random I/O (Index Scan) carries per-row overhead; Sequential I/O reads pages in physical order. As the matched fraction grows, the random-I/O cost of an Index Scan can exceed one full sequential pass — but the exact tipping point is data- and hardware-dependent, not a universal percentage.
</details>

### Question 2: SARGable

Which predicate is SARGable on a B-Tree index over `name`?

A) `WHERE name LIKE '%Smith'` (leading wildcard).
B) `WHERE name LIKE 'Smith%'` (trailing wildcard).
C) `WHERE UPPER(name) = 'SMITH'`.
D) `WHERE id + 1 = 10`.

<details>
<summary>Click for Answer</summary>

**Answer: B**
B-Trees store values in sorted order, so they can efficiently find "starts with Smith." A leading wildcard, a function wrapped around the column, or arithmetic on the column all prevent the index from being used directly.
</details>

### Question 3: Index Only Scan

What does `Heap Fetches: 0` in an `EXPLAIN ANALYZE` output mean?

A) The query failed.
B) The database answered entirely from the index, without visiting the table — and the visibility map confirmed every relevant page was all-visible.
C) The heap is full.
D) Zero rows were returned.

<details>
<summary>Click for Answer</summary>

**Answer: B**
`Heap Fetches: 0` confirms the Index Only Scan didn't need to fall back to the table to check row visibility — the fastest possible outcome for that scan type.
</details>

### Question 4: Cost units

In `cost=0.00..15.00`, what does the `15.00` represent?

A) 15 milliseconds.
B) 15 arbitrary, engine-internal cost units used only to compare plan options against each other.
C) 15 dollars of cloud spend.
D) 15 rows returned.

<details>
<summary>Click for Answer</summary>

**Answer: B**
It's a relative score, calibrated in Postgres against a default `seq_page_cost = 1.0`. It is not a time, currency, or row count, and the calibration is Postgres-specific — other engines use different cost models entirely.
</details>

### Question 5: Statistics

Why does the planner consult table statistics (`n_distinct`, histograms) before choosing a plan?

A) To estimate how many rows a filter like `WHERE id = 5` will return, which drives the cost comparison between scan types.
B) It doesn't use statistics.
C) To physically sort the data on disk.
D) To produce an audit log.

<details>
<summary>Click for Answer</summary>

**Answer: A**
If `n_distinct` is low (e.g., a `gender` column with 2 values), an index lookup returns a large fraction of the table and is likely not worth it. If `n_distinct` is high (e.g., a UUID column), an index lookup returns very few rows and is usually a big win. These estimates come from the last `ANALYZE`, which is why stale statistics cause bad plans.
</details>

### Question 6: Logical order

Why does this query fail in Postgres: `SELECT price * qty AS total FROM items WHERE total > 50`?

A) Multiplication isn't allowed in SELECT.
B) `WHERE` executes before `SELECT` in the logical processing order, so the alias `total` doesn't exist yet when `WHERE` runs.
C) `total` is a reserved keyword.
D) You need a semicolon after `qty`.

<details>
<summary>Click for Answer</summary>

**Answer: B**
The logical order is FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT. Aliases are defined in the SELECT step, which runs after WHERE has already filtered rows using only the raw columns available from FROM.
</details>

### Question 7: Plan reading

In a plan tree, a Hash Join node shows `rows=300` (estimated) at the top, but `actual ... rows=42` once run with `EXPLAIN ANALYZE`. What does this most likely indicate?

A) The query returned the wrong data.
B) Stale or insufficiently granular statistics caused the planner to overestimate matching rows, which can lead it to pick a join algorithm or scan type suited to the wrong row count.
C) The Hash Join algorithm is broken.
D) Nothing — small estimate/actual gaps are never meaningful.

<details>
<summary>Click for Answer</summary>

**Answer: B**
A 7x gap between estimated and actual rows is a flag, not necessarily an error in the result — but it means the cost comparisons the optimizer made were based on inaccurate inputs, which can result in choosing a suboptimal plan. Re-running ANALYZE is the first diagnostic step.
</details>

### Question 8: Index Only Scan precondition

A table was just bulk-loaded with 1 million new rows and has not been vacuumed yet. A query plan shows `Index Only Scan` but `Heap Fetches: 980000`. Why?

A) The index is corrupted.
B) The visibility map hasn't been updated for the new pages yet, so the engine must fall back to the heap to verify row visibility for almost every row, even though the plan node is "Index Only."
C) `Heap Fetches` always equals total row count.
D) The query has a syntax error.

<details>
<summary>Click for Answer</summary>

**Answer: B**
"Index Only Scan" describes the plan's *intent*, not a guarantee of zero heap access. Without a current visibility map (updated by VACUUM), the engine still has to check each new row's visibility on the heap, largely erasing the performance benefit until vacuuming catches up.
</details>

---

## Summary

Today you learned:

* ✅ **Logical query order**: `FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT` — and why it blocks aliases in `WHERE`.
* ✅ **The Optimizer**: It balances I/O cost vs. CPU cost using arbitrary, engine-specific units calibrated from table statistics.
* ✅ **Scan Types**: Seq, Index, Bitmap Heap, and Index Only — chosen by estimated selectivity, with Index Only gated by the visibility map.
* ✅ **SARGable**: Don't hide columns inside functions or casts in `WHERE`; watch `BETWEEN` boundaries on timestamps.
* ✅ **Plan reading**: Read bottom-up, compare estimated vs. actual rows, and watch `loops=` for nested-loop misestimates.

**Tomorrow**: We connect datasets with **Advanced Joins** (Day 100) — and you'll use this same `EXPLAIN ANALYZE` skill to compare join algorithms.
