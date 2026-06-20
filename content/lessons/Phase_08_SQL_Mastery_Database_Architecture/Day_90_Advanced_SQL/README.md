---
day: 90
title: "Advanced SQL Patterns"
phase: 8
phaseTitle: "SQL Mastery & Database Architecture"
slug: "advanced-sql"
duration: 120
difficulty: "advanced"
tags:
  - recursive-cte
  - json
  - lateral-join
  - pivoting
concepts:
  - "Recursive CTEs (Hierarchies)"
  - "JSON Parsing in SQL"
  - "Lateral Joins (Cross Apply)"
  - "Array Aggregates"
prerequisites:
  - "Intermediate SQL (Joins, Window Functions)"
  - "Understanding of Trees/Graphs"
outcomes:
  - "Model Org Charts using Recursion"
  - "Query NoSQL JSON blobs inside Postgres/Snowflake"
  - "Use Lateral Joins for powerful 'For-Each' logic"
---

# 🎯 Day 85: Advanced SQL Patterns

> *"Standard SQL analyzes tables. Advanced SQL analyzes Trees, Graphs, and Documents."*

---

## Prerequisites & Recommended Order

**This is an advanced lesson, and Phase 8 teaches it out of the usual order.** The recursive CTEs, JOINs, and subqueries used below assume you are already comfortable with relational fundamentals that this phase doesn't formally introduce until *later* day numbers:

| If you are unfamiliar with... | Read this first |
| --- | --- |
| Tables, keys, transactions, ACID basics | **Day 96 — Relational Database Internals** |
| `CREATE TABLE`, constraints, schemas | **Day 97 — Advanced DDL & Schema** |
| `INSERT`/`UPDATE`/`DELETE`, upserts | **Day 98 — Advanced DML & Upserts** |
| `SELECT`, `WHERE`, `GROUP BY`, basic query order | **Day 99 — Advanced DQL & Optimization** |
| `INNER`/`LEFT`/`RIGHT` JOIN semantics | **Day 100 — Advanced Joins & Algorithms** |
| Correlated subqueries, `EXISTS`/`IN` | **Day 101 — Advanced Subqueries** |

**Why the numbering looks backwards**: Days 90–95 were authored as the "advanced/architecture" arc and Days 96–101C as the "core SQL" arc, but the core arc is the actual prerequisite chain. The directory/day numbers are not being renamed (that would break existing links and progress tracking), so treat **Day 90 as a preview of where SQL mastery is heading** — skim it now for motivation, but if a JOIN or subquery in the code below doesn't make sense, that is expected. Detour to Days 96–101 first, then come back.

**Remediation path**: If you hit a wall in this lesson, stop and read, in order: Day 96 (how the database actually executes a query) → Day 100 (JOIN semantics) → Day 101 (subqueries) → Day 99 (`EXPLAIN` plans, indexes) → return here.

---

## The "Never-Coded" Bridge

**The Family Tree**

**Standard SQL**: "Find me Bob's father." (Easy - `SELECT father FROM table WHERE child = 'Bob'`).
**Advanced SQL**: "Find me Bob's Great-Great-Great Grandfather."

* **Problem**: You don't know how many "Greats" are in the chain. Is it 3 joins? 10 joins?
* **Recursive SQL**: A loop. "Find Father. Then Find *his* Father. Repeat until no Father is found."

**The Russian Doll (JSON)**

**Standard SQL**: "Give me the address." (Column: `address`).
**Advanced SQL**: "Give me the Zip Code."

* **But**: The address is inside a sealed box (JSON Blob): `{"city": "NY", "zip": "10001"}`.
* **JSON SQL**: Open the box, grab the zip, close the box. All in one query.

---

## The Technical Deep Dive

> **Dialect note**: every query in this lesson targets **PostgreSQL 14+**. `LATERAL`, the `->`/`->>` JSON operators, and `ARRAY_AGG` syntax shown here are Postgres-specific; Snowflake/BigQuery have close equivalents (`FLATTEN`, `:` path operators, `ARRAY_AGG`) but different function names.

### 1. Recursive CTEs

Used for Hierarchies (Org Charts, Category Trees, Graph Paths). A **CTE** (Common Table Expression) is a named, temporary result set defined with `WITH` that you can reference like a table for the rest of the query. A **hierarchy** is any parent-child relationship where the depth (number of levels) is not fixed in advance — you don't know if Alice is 2 levels from the CEO or 20.

**Syntax**:

```sql
WITH RECURSIVE org_chart AS (
    -- Anchor Member (Base Case)
    SELECT id, name, manager_id, 1 as level 
    FROM employees 
    WHERE manager_id IS NULL  -- The CEO
    
    UNION ALL
    
    -- Recursive Member (Loop)
    SELECT e.id, e.name, e.manager_id, o.level + 1
    FROM employees e
    JOIN org_chart o ON e.manager_id = o.id
)
SELECT * FROM org_chart;
```

**Line-by-line walkthrough**:

1. `WITH RECURSIVE org_chart AS (...)` — declares a CTE named `org_chart`. The `RECURSIVE` keyword is required for the CTE to reference itself inside its own definition; without it, `org_chart` in the second `SELECT` would be an undefined name.
2. **Anchor member** (`SELECT id, name, manager_id, 1 as level FROM employees WHERE manager_id IS NULL`) — this runs *exactly once*. It produces the starting row set: here, the one employee with no manager (the CEO). `level = 1` seeds the depth counter.
3. `UNION ALL` — combines the anchor's output with the recursive member's output. Use `UNION ALL`, not `UNION`: `UNION` would deduplicate rows, which is wasteful (the recursion already guarantees distinct `id`s here) and, in graphs with possible duplicate paths, can mask cycles instead of stopping them.
4. **Recursive member** (`SELECT e.id, ... FROM employees e JOIN org_chart o ON e.manager_id = o.id`) — this is the part that loops. On each iteration, `o` refers only to the rows *produced in the previous iteration* (not the whole accumulated result) — that's the execution model: Postgres keeps re-running this `SELECT`, joining `employees` against the newest batch of `org_chart` rows, until a pass produces zero rows.
5. **Alias scope**: `o` is scoped to the recursive member only — it does not exist in the anchor member, and it is not the same as the final `org_chart` name used outside the CTE. Inside the recursive term, `o` means "rows added in the last iteration"; `org_chart` as a whole (used in the final `SELECT * FROM org_chart`) means "the union of everything produced across all iterations."
6. **Termination condition**: the loop stops automatically when the recursive `SELECT`'s `JOIN` produces no new rows — i.e., when no remaining employee has a `manager_id` matching an `id` from the last batch. There is no explicit "stop" keyword; termination is implicit and depends on the join predicate eventually finding no matches.

**Why `level` matters and the `WHERE level < 20` guard**: `level` is not required by the recursion mechanics — it's a counter you add yourself to (a) understand depth in the output and (b) defend against runaway recursion. If the `employees` table had a cycle (B reports to A, A reports to B), the recursive join would never naturally terminate. Adding `WHERE level < 20` to the recursive member caps it at 20 iterations — chosen here as a generous ceiling for a typical org chart (most real corporate hierarchies are under 10 levels deep), not a magic constant with special meaning. Pick a ceiling proportional to the *maximum plausible depth* of your real hierarchy plus a safety margin.

### 2. Array Aggregates: `ARRAY_AGG`

Before JSON, the simplest way to "pack rows into a list" in Postgres is `ARRAY_AGG`. It takes one value per group and returns a Postgres array.

```sql
-- Dialect: PostgreSQL 14+
SELECT
    manager_id,
    ARRAY_AGG(name ORDER BY name) AS direct_reports
FROM employees
WHERE manager_id IS NOT NULL
GROUP BY manager_id;
```

* `ARRAY_AGG(name ORDER BY name)` — the `ORDER BY` *inside* the aggregate call controls the order of elements within the resulting array. This is independent of any outer `ORDER BY` on the query — without it, the order of elements in each array is **unspecified** (it depends on the order rows happen to arrive from the scan/join, which can change between runs or after a `VACUUM`/re-plan). Always specify an internal `ORDER BY` if array element order is meaningful (e.g., chronological events, ranked lists).
* **NULL behavior**: `ARRAY_AGG` *includes* `NULL` values in the resulting array by default (unlike `COUNT(column)`, which skips NULLs). `ARRAY_AGG(name) FROM t` where one row has `name = NULL` produces an array like `{Alice,NULL,Bob}`. If you don't want NULLs in the array, filter them out first: `ARRAY_AGG(name) FILTER (WHERE name IS NOT NULL)`.
* **Use cases**: collapsing a one-to-many relationship into a single display row (e.g., "VP -> [Alice, Carlos, Deepa]"), building a list of tags/categories per item, preparing data for downstream array operations (`ANY()`, `unnest()`).
* **Tradeoffs vs. JSON aggregation (`JSON_AGG`)**: `ARRAY_AGG` is faster and more memory-efficient when every element is the *same scalar type* (all text, all integers) because Postgres can store it as a native typed array. `JSON_AGG` (or `JSONB_AGG`) is the right choice when you need to pack **heterogeneous or nested structures** — e.g., `JSON_AGG(json_build_object('id', id, 'name', name))` to get a list of objects, not just a list of names. Rule of thumb: flat list of one scalar column → `ARRAY_AGG`; list of multi-field rows or mixed types → `JSON_AGG`.

### 3. Working with JSON (Postgres/Snowflake)

Don't use Mongo just because you have JSON. SQL can do it. A **JSON blob** here means a single column whose value is a JSON document rather than a scalar (e.g., `{"city": "NY", "zip": "10001"}` stored in one `jsonb` column).

**Postgres operators**:

* `data -> 'key'`: Extract value **as JSON** (or `jsonb`). The result is still a JSON type, so you can chain another `->`/`->>` on it.
* `data ->> 'key'`: Extract value **as text** (`->>` always returns `text` or `NULL`). Use this when you're done navigating and want a usable scalar — for filtering, comparing to a string, or casting to a number/date.

**Rule for chaining**: use `->` for every intermediate hop into the JSON tree, and `->>` only on the *final* hop, because `->>` collapses the result to text and you can't navigate further into text with another `->`.

```sql
-- Dialect: PostgreSQL 14+
SELECT
    id,
    info ->> 'email' AS email,
    info -> 'preferences' ->> 'theme' AS theme
FROM users
WHERE info ->> 'status' = 'active';
```

**Line-by-line walkthrough**:

1. `info ->> 'email' AS email` — `info` is a `jsonb` column. `->>'email'` extracts the `email` key's value directly as text, because we want a final, usable string — there's nothing further to navigate.
2. `info -> 'preferences' ->> 'theme' AS theme` — `info -> 'preferences'` returns the *nested* JSON object (e.g., `{"theme": "dark"}`) as JSON (not text — using `->>` here would return the literal text `'{"theme": "dark"}'`, which you could not then drill into). The second hop, `->> 'theme'`, then extracts `theme`'s value as text.
3. `WHERE info ->> 'status' = 'active'` — text comparison against a string literal, so `->>` (text) is correct, not `->` (which would compare a JSON value against a plain string and never match, since `'"active"'::jsonb <> 'active'::text`).

### 4. Lateral Joins (LATERAL / CROSS APPLY)

Standard Joins can't refer to the table on the left inside the right subquery. **Lateral** can — this is called a **correlated** subquery in the `FROM` clause: each iteration's inner query depends on (is "correlated with") the current row from the outer table.

* It's like a "For Each Loop" in SQL.
* **Scenario**: "For each User, find their Top 3 most recent Orders."

```sql
-- Dialect: PostgreSQL 14+
SELECT u.name, o.order_date, o.amount
FROM users u
CROSS JOIN LATERAL (
    SELECT order_date, amount FROM orders 
    WHERE user_id = u.id 
    ORDER BY order_date DESC 
    LIMIT 3
) o;
```

**Line-by-line walkthrough**:

1. `FROM users u` — the outer/left side. For every row in `users`, Postgres will run the inner subquery once.
2. `CROSS JOIN LATERAL (...)` — `LATERAL` is what makes `u.id` visible inside the subquery. Without `LATERAL`, `WHERE user_id = u.id` would fail with "invalid reference to FROM-clause entry for table u," because a plain (non-lateral) subquery in `FROM` can't see sibling tables.
3. `WHERE user_id = u.id` — the correlation: this is what makes the subquery re-run with a different filter for each outer row, functioning like a for-each loop.
4. `ORDER BY order_date DESC LIMIT 3` — **why `LIMIT 3` must be inside the lateral subquery, not outside**: `LIMIT` outside the subquery (after the final `SELECT`) would cap the *entire result set* at 3 rows total — e.g., 3 orders total across all users, possibly all belonging to one user. `LIMIT 3` inside the lateral subquery caps it at 3 rows **per user**, because the subquery re-executes per outer row before the rows are ever combined. This is the single most common mistake when converting "top N per group" logic into a lateral join.
5. The alias `o` covers `(order_date, amount)` as returned by the subquery — note we explicitly listed those two columns instead of `SELECT *`, so the outer `SELECT u.name, o.order_date, o.amount` has unambiguous column names to reference.

**Performance note**: a lateral join with a `LIMIT` inside is the same physical pattern as `ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY order_date DESC) WHERE rn <= 3`, but it can be faster because the planner can push the `LIMIT` into an index scan (using an index on `orders(user_id, order_date)`) and stop early per user, rather than computing a window function over the full partition before filtering.

---

## Senior-Level Insights

### "Schemaless" is a Lie

* **Junior**: "I'll store everything in a JSON column so I don't have to migrate the schema!"
* **Senior**: "You just moved the schema (structure) from *Write Time* (Table Definition) to *Read Time* (Query Complexity)."
* **Logic**: Querying JSON is slower and harder to index. Use it for *rarely queried attributes* (e.g., "Custom User Config"), not core data (e.g., "Email").

### Recursion Safety

* **Infinite Loops**: If Employee A reports to B, and B reports to A, your Recursive CTE will run forever.
* **fix**: Postgres does **not** auto-stop a runaway recursive CTE — there is no built-in iteration cap by default. (This differs by engine: some databases, like SQL Server, default to a 100-iteration `MAXRECURSION` limit and error out; Postgres will spin until it exhausts memory or you cancel the query.) Always add your own depth guard — `WHERE level < 20` — or, more robustly, a cycle-detection guard (see Pitfalls below).

A **functional index** is an index built not on a raw column, but on the *result of an expression* applied to a column — e.g., `CREATE INDEX ON users ((info ->> 'email'))`. Postgres can use this index to make `WHERE info ->> 'email' = 'x@example.com'` as fast as an index on a normal `email` column, because it stores the computed text value, not just the raw JSON.

---

## Pitfalls

### 1. Cycles in Recursive CTEs (Beyond a Depth Guard)

A `WHERE level < 20` guard stops infinite loops, but it still wastes 20 iterations of work before failing, and it doesn't tell you *where* the cycle is. The more robust pattern tracks the visited path explicitly and stops the instant a cycle is detected:

```sql
-- Dialect: PostgreSQL 14+
WITH RECURSIVE org_chart AS (
    SELECT id, name, manager_id, 1 AS level, ARRAY[id] AS visited_path
    FROM employees
    WHERE manager_id IS NULL

    UNION ALL

    SELECT e.id, e.name, e.manager_id, o.level + 1, o.visited_path || e.id
    FROM employees e
    JOIN org_chart o ON e.manager_id = o.id
    WHERE NOT (e.id = ANY(o.visited_path))  -- stop the instant we revisit a node
)
SELECT * FROM org_chart;
```

`visited_path` accumulates every `id` seen so far on this branch. `WHERE NOT (e.id = ANY(o.visited_path))` refuses to recurse into a node already on the path, which detects a cycle on the iteration it occurs rather than 20 iterations later.

### 2. Recursion-Depth Limits Differ by Engine

* **Postgres**: no default cap; an unguarded cycle runs until you cancel it or the server runs out of work_mem/temp space.
* **SQL Server**: defaults to `OPTION (MAXRECURSION 100)`; raises an error past that unless you override it (or set it to 0 for unlimited, which reintroduces the Postgres risk).
* **MySQL (8.0+)**: governed by `cte_max_recursion_depth` (default 1000).
* **Snowflake / BigQuery**: recursive CTE support is newer and more limited — check current docs before assuming recursive syntax is portable.

### 3. JSON Missing-Key and Type Errors

* `info ->> 'email'` on a row where `info` has no `email` key returns `NULL` — it does **not** error. This is usually convenient but can silently hide malformed records; don't assume "I queried it, so the key exists."
* Casting matters: `(info ->> 'age')::int` will **throw a runtime error** if `age` is missing (`NULL::int` is fine) but will also throw if the value is non-numeric text (e.g., `"unknown"`). Validate or use `CASE WHEN info ->> 'age' ~ '^\d+$' THEN (info ->> 'age')::int END` for defensive casting on untrusted JSON.
* `info -> 'preferences' ->> 'theme'` returns `NULL` (not an error) if `info -> 'preferences'` itself is `NULL` — chained `->`/`->>` on a `NULL` short-circuits to `NULL` rather than failing, which is helpful for sparse/optional nested keys.

### 4. Lateral Join Row Explosion

A lateral join's inner subquery re-runs **once per outer row**. If the outer table has 1 million users and the inner subquery has no `LIMIT` and no selective filter, you get a full cross-product-like explosion of work — effectively the same cost profile as an uncontrolled nested-loop join. Always pair `LATERAL` with either: a `LIMIT` inside the subquery (as in Exercise 3 below), a highly selective `WHERE`, or both. Also confirm there's a supporting index (e.g., `orders(user_id, order_date)`) — without one, each of the million per-user subquery calls falls back to a sequential scan of `orders`.

---

## Hands-on Lab

All exercises target **PostgreSQL 14+**. Run the `CREATE TABLE`/`INSERT` block for each exercise before the task query.

### Exercise 1: The Boss Finder (Recursion)

**Goal**: Find the full management chain for "Alice", from her up to the CEO.

**Setup**:

```sql
-- Dialect: PostgreSQL 14+
CREATE TABLE employees (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    manager_id INTEGER REFERENCES employees(id)
);

INSERT INTO employees (id, name, manager_id) VALUES
    (1, 'CEO', NULL),
    (2, 'VP', 1),
    (3, 'Alice', 2);
```

**Task**: Write a recursive CTE that walks from Alice upward to the CEO, one level at a time, and outputs the chain in order.

```sql
WITH RECURSIVE chain AS (
    SELECT id, name, manager_id, 1 AS level
    FROM employees
    WHERE name = 'Alice'          -- anchor: start at Alice, not at the CEO

    UNION ALL

    SELECT e.id, e.name, e.manager_id, c.level + 1
    FROM employees e
    JOIN chain c ON e.id = c.manager_id   -- walk UP: find Alice's manager, then their manager
)
SELECT level, name
FROM chain
ORDER BY level;
```

**Expected result** (exact, 3 rows):

| level | name  |
| ----- | ----- |
| 1     | Alice |
| 2     | VP    |
| 3     | CEO   |

**Why the anchor starts at Alice, not the CEO**: the goal is "Alice's chain of command," so the anchor member must select the *starting point of the question* (Alice), and the recursive member must walk in the direction of `manager_id` (child to parent) rather than `id` (parent to child, which is what the org-chart-building example earlier in this lesson does — that one starts at the CEO and walks down).

### Exercise 2: The Log Parser (JSON)

**Goal**: Extract a field from a JSON column and aggregate by it.

**Setup**:

```sql
-- Dialect: PostgreSQL 14+
CREATE TABLE logs (
    id SERIAL PRIMARY KEY,
    description JSONB NOT NULL
);

INSERT INTO logs (description) VALUES
    ('{"event": "login", "browser": "Chrome", "lat": 40.7}'),
    ('{"event": "login", "browser": "Chrome", "lat": 40.7}'),
    ('{"event": "login", "browser": "Firefox", "lat": 51.5}'),
    ('{"event": "logout", "browser": "Chrome", "lat": 40.7}'),
    ('{"event": "login", "browser": "Safari", "lat": 37.8}');
```

**Task**:

1. Extract `browser`.
2. Filter for `event` = 'login'.
3. Count logins by Browser.

```sql
SELECT 
    description ->> 'browser' AS browser_name,
    COUNT(*) AS login_count
FROM logs
WHERE description ->> 'event' = 'login'
GROUP BY 1
ORDER BY login_count DESC;
```

**Expected result** (exact, 3 rows — the `logout` row is excluded by the `WHERE` filter):

| browser_name | login_count |
| ------------ | ------------ |
| Chrome       | 2            |
| Firefox      | 1            |
| Safari       | 1            |

### Exercise 3: The Top X per Group (Lateral)

**Goal**: Find the last 2 comments for every blog post.

**Setup**:

```sql
-- Dialect: PostgreSQL 14+
CREATE TABLE posts (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL
);

CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    post_id INTEGER REFERENCES posts(id),
    body TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL
);

INSERT INTO posts (id, title) VALUES
    (1, 'Intro to SQL'),
    (2, 'Advanced JSON');

INSERT INTO comments (post_id, body, created_at) VALUES
    (1, 'Great post!',        '2024-01-01 10:00'),
    (1, 'Very helpful',       '2024-01-02 09:00'),
    (1, 'Could use more detail', '2024-01-03 14:00'),
    (2, 'Loved the JSON section', '2024-02-01 08:00');

-- Recommended index for the lateral join below
CREATE INDEX idx_comments_post_created ON comments(post_id, created_at DESC);
```

**Without Lateral**: You'd use `ROW_NUMBER() OVER (PARTITION BY post_id ORDER BY created_at DESC)` and filter `WHERE rn <= 2`.

**With Lateral**:

```sql
SELECT p.title, c.created_at, c.body
FROM posts p
CROSS JOIN LATERAL (
    SELECT body, created_at FROM comments 
    WHERE post_id = p.id 
    ORDER BY created_at DESC 
    LIMIT 2
) c
ORDER BY p.title, c.created_at DESC;
```

**Expected result** (exact, 3 rows — Post 1 has 3 comments but only its 2 newest appear; Post 2 has only 1 comment total):

| title          | created_at          | body                     |
| -------------- | ------------------- | ------------------------ |
| Advanced JSON  | 2024-02-01 08:00:00 | Loved the JSON section   |
| Intro to SQL   | 2024-01-03 14:00:00 | Could use more detail    |
| Intro to SQL   | 2024-01-02 09:00:00 | Very helpful              |

* *Compare*: Lateral is often faster than the window-function rewrite if you have the supporting index above on `comments(post_id, created_at)`, because the planner can use it to fetch just the top 2 rows per post directly, rather than scoring and ranking every comment per post before filtering.

---

### Non-Functional Constraints (Apply to All Exercises)

* **Performance / Scale**: Document a target query runtime of **p95 < 2s** for your final solution, validate behavior at **20 concurrent analytical users/sessions**, and keep compute spend below **$2** per production-equivalent run.
* **Data Governance / Security**: Define acceptance criteria for least-privilege access, PII handling (masking/tokenization where applicable), audit logging of query access, and retention/deletion alignment with policy.
* **Business KPI Impact**: Explicitly state which business KPI(s) improve based on your schema/query decisions and quantify expected directional impact.
  * KPI focus for this day: *Manager-chain lookups and JSON-based behavioral reporting should support <5 minute leadership and product analytics refresh cycles.*

## Mastery Check

### Question 1: Recursive CTE

What are the two parts of a Recursive CTE?
A) The Head and the Tail.
B) The Anchor Member (Base) and the Recursive Member (Loop).
C) The Left and the Right.
D) The Start and the Finish.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Anchor gives the starting set. Recursive loops on it.
</details>

### Question 2: JSON in SQL

True or False: Storing data in JSON columns prevents you from indexing it.
A) True.
B) False. Modern databases allow "Functional Indexes" on JSON keys.

<details>
<summary>Click for Answer</summary>

**Answer: B**
FALSE. You can index `(data ->> 'email')` to make searches instant.
</details>

### Question 3: Lateral Join

What does `LATERAL` allow a subquery to do?
A) Run faster.
B) Reference columns from the preceding tables in the `FROM` clause.
C) Join horizontally.
D) Delete data.

<details>
<summary>Click for Answer</summary>

**Answer: B**
It enables correlated subqueries in the FROM clause.
</details>

### Question 4: Use Case for Recursion

Which dataset is best suited for Recursive CTEs?
A) Sales Transactions.
B) A Product Category Tree (Electronics -> Laptops -> Gaming Laptops).
C) User Logs.
D) Weather Data.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Any "Parent-Child" relationship with unknown depth.
</details>

### Question 5: JSON vs Table

When should you use a JSON column?
A) For the User's Primary Key.
B) For sparse, dynamic attributes (e.g., metadata for 50 different 3rd party integrations).
C) For Foreign Keys.
D) Always.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Flexibility comes at the cost of strictness/performance. Use strictly for dynamic data.
</details>

### Question 6: ARRAY_AGG Ordering

Without an internal `ORDER BY`, what order will `ARRAY_AGG(name)` return elements in?

A) Alphabetical, always.
B) Unspecified — it depends on scan/join order and can change between runs.
C) Reverse insertion order, always.
D) Numeric ID order, always.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Without `ARRAY_AGG(name ORDER BY name)`, Postgres makes no guarantee about element order — it reflects whatever order rows arrived in during execution, which is not guaranteed to be stable.
</details>

### Question 7: Lateral LIMIT Placement

You want the 3 most recent orders **per user**. Where must `LIMIT 3` go?

A) On the outermost `SELECT`, after the lateral join.
B) Inside the lateral subquery, before the join completes.
C) It doesn't matter — both placements are equivalent.
D) `LIMIT` cannot be used with `LATERAL`.

<details>
<summary>Click for Answer</summary>

**Answer: B**
`LIMIT 3` inside the lateral subquery caps results to 3 rows *per outer row* (per user), because the subquery re-runs once per user. `LIMIT 3` on the outside caps the *entire combined result* at 3 rows total, which is almost never what "top 3 per user" means.
</details>

---

## Glossary

| Term | Definition |
| --- | --- |
| **Anchor member** | The non-recursive `SELECT` in a `WITH RECURSIVE` CTE; runs once and produces the starting row set. |
| **Recursive member** | The `SELECT` after `UNION ALL` in a `WITH RECURSIVE` CTE that re-runs, joining against the previous iteration's output, until it produces no new rows. |
| **CTE (Common Table Expression)** | A named, temporary result set defined with `WITH` that can be referenced like a table within the same query. |
| **Hierarchy** | A parent-child data relationship (org chart, category tree, file system) where depth is not fixed in advance. |
| **JSON blob** | A single column value stored as a JSON/JSONB document rather than a scalar, containing nested keys. |
| **Functional index** | An index built on the result of an expression (e.g., `(info ->> 'email')`) rather than directly on a column. |
| **Lateral join** | A join where the right-hand subquery is allowed to reference columns from tables earlier in the same `FROM` clause. |
| **Correlation (correlated subquery)** | A subquery whose result depends on a value from the outer query — it cannot be evaluated independently of the row currently being processed. |

---

## Cross-References

* **Prerequisites**: Day 96 (Relational Database Internals), Day 97 (Advanced DDL & Schema), Day 98 (Advanced DML & Upserts), Day 99 (Advanced DQL & Optimization), Day 100 (Advanced Joins & Algorithms), Day 101 (Advanced Subqueries) — see "Prerequisites & Recommended Order" above.
* **Forward**: Day 91 (Cloud Architecture & Optimization) builds on indexing concepts introduced here; Day 99 covers `EXPLAIN` plan reading referenced in the Lateral Join performance note.

---

## Summary

Today you learned:

* ✅ **Recursive CTEs**: Loop through unlimited hierarchy levels, with anchor/recursive members and cycle-detection guards.
* ✅ **Array Aggregates**: `ARRAY_AGG` packs rows into a Postgres array, with explicit ordering and NULL-inclusive behavior — choose it over `JSON_AGG` for flat, single-type lists.
* ✅ **JSON SQL**: Treat Postgres/Snowflake like a NoSQL store, using `->` to navigate and `->>` to extract text.
* ✅ **Lateral Joins**: The "for-each loop" of SQL joins — `LIMIT` must live inside the subquery to mean "per group."

**Tomorrow**: We explore **BI Cloud**—Moving from SQL syntax to Cloud Architecture.
