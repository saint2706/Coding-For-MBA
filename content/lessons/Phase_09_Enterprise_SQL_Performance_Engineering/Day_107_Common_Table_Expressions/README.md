---
day: 107
title: "Advanced CTEs & Recursion"
phase: 9
phaseTitle: "Enterprise SQL Performance Engineering"
slug: "recursive-ctes"
duration: 120
difficulty: "advanced"
tags:
  - recursive-cte
  - hierarchy
  - graph-algorithms
  - bill-of-materials
concepts:
  - "Recursive CTE Syntax (Anchor vs Recursive Member)"
  - "Traversing Trees (Org Charts)"
  - "Graph Traversal (Shortest Path)"
  - "Cycle Detection"
prerequisites:
  - "Basic CTEs (WITH clause)"
outcomes:
  - "Query a 10-level deep Org Chart in one SQL statement"
  - "Calculate the total cost of a Car (Bill of Materials)"
  - "Detect infinite loops in hierarchical data"
---

# 🎯 Day 102: Advanced CTEs & Recursion

> *"To understand recursion, you must first understand recursion."*

---

## The "Never-Coded" Bridge

**The Family Tree**

* **Iterative Approach**:
  * Find "Grandpa". (Query 1).
  * Find "Grandpa's Kids". (Query 2).
  * Find "Kids' Kids". (Query 3).
  * *Problem*: You don't know how deep the tree goes. You need an infinite loop in Python.
* **Recursive Approach (SQL)**:
  * "Find Grandpa."
  * **RULE**: "For every person found, find their children."
  * **Repeat**: Apply the Rule until no new children are found.
  * *Result*: One single query returns the entire lineage.

---

## The Technical Deep Dive

### 1. Anatomy of `WITH RECURSIVE`

It has two parts joined by `UNION ALL`.

1. **Anchor Member**: The starting point (e.g., "Grandpa"). Run once.
2. **Recursive Member**: The loop. It references the CTE itself (`t`).
3. **Termination**: Stops when the Recursive Member returns 0 rows.

```sql
WITH RECURSIVE subordinates AS (
    -- Anchor: The CEO
    SELECT
        id,
        name,
        manager_id
    FROM employees
    WHERE manager_id IS NULL

    UNION ALL

    -- Recursive: Employees managed by people already found
    SELECT
        e.id,
        e.name,
        e.manager_id
    FROM employees AS e
    INNER JOIN subordinates AS s ON e.manager_id = s.id
)

SELECT * FROM subordinates;
```

### 2. Depth Usage (The "Level" Column)

How deep are we?

* Add `1 as level` to Anchor.
* Add `s.level + 1` to Recursive Member.
* *Result*: You know if someone is a VP (Level 2) or Intern (Level 99).

### 3. Path Tracking (The Breadcrumbs)

How did we get here?

* Anchor: `ARRAY[id] as path`.
* Recursive: `s.path || e.id`.
* *Result*: `{1, 5, 20}` means CEO -> VP -> Manager.
* **Cycle Detection**: `WHERE NOT (e.id = ANY(s.path))` prevents infinite loops.

### 4. Why `UNION ALL`, Never `UNION`

Every recursive CTE you write should use `UNION ALL` to join the anchor and recursive members, not plain `UNION`. This isn't a style preference — `UNION` would silently de-duplicate rows across *every* iteration of the recursion, which is both **incorrect** and **expensive**:

* **Incorrect**: in a graph (not a strict tree), the same node can legitimately be reached via two different valid paths with different `path` arrays. `UNION` would collapse rows that look similar on the surface but represent genuinely different traversal paths, silently dropping data you need.
* **Expensive**: `UNION`'s de-duplication requires comparing every new row against the accumulated result set on every single iteration — an O(n²)-ish cost that compounds with recursion depth. `UNION ALL` just appends, because the join condition (`e.manager_id = s.id`) already bounds each iteration's result set to genuinely new rows (assuming a tree with no cycles).
* **Rule of thumb**: if you find yourself reaching for `UNION` to "fix" duplicate rows in a recursive CTE, the real fix is almost always better cycle detection (the `path` array check above), not de-duplication.

---

## Senior-Level Insights

### The "Bill of Materials" (BOM) Problem

* **Scenario**: A "Car" is made of 4 "Wheels". A "Wheel" is made of "Rim" + "Tire".
* **Task**: "How many screws are in a Car?"
* **Solution**: Recursive CTE allows you to "explode" the parts list down to the raw materials and `SUM()` them up.
* **Impact**: Essential for Manufacturing (ERP systems).

> ⚠️ Pitfall: Unbounded Recursion
>
> Postgres has **no default recursion depth limit** — unlike, say, SQL Server, which caps recursive CTEs at 100 levels by default (`MAXRECURSION`). If your hierarchy has a cycle (a manager who, through some chain, reports to themselves) and you have no cycle-detection guard, the query will spin until it exhausts memory or you forcibly cancel it. There is no built-in failsafe protecting you.
>
> **Mandatory safeguard** — cycle detection via path tracking, every time you write a recursive CTE over data you don't 100% trust to be acyclic:
>
> ```sql
> WITH RECURSIVE subordinates AS (
>     SELECT id, name, manager_id, ARRAY[id] AS path
>     FROM employees WHERE manager_id IS NULL
>     UNION ALL
>     SELECT e.id, e.name, e.manager_id, s.path || e.id
>     FROM employees e
>     JOIN subordinates s ON e.manager_id = s.id
>     WHERE NOT (e.id = ANY(s.path)) -- stop before re-visiting a node
> )
> SELECT * FROM subordinates;
> ```
>
> **Postgres 14+ alternative**: the built-in `CYCLE` clause does the same `path`-tracking and cycle check for you, with less boilerplate (see the sidebar below). Either way — never ship a recursive CTE over untrusted hierarchical data without one of these two guards.

### Graph Databases vs SQL Recursion

* **Risk**: Recursion is CPU intensive — each level is a fresh join iteration against the base table.
* **Graph Databases**: If you do *complex* graph math (Shortest Path with weights, centrality, community detection), consider Neo4j or a dedicated graph engine. For simple Trees and shallow hierarchies, SQL recursion is fine and avoids introducing a second database technology.

### Decision Table: Recursive CTE vs Closure Table vs Graph DB

| Use Case | Recommended Approach | Why |
|---|---|---|
| Shallow org chart (≤10 levels, read occasionally) | **Recursive CTE** | Simple, no extra schema/maintenance; recursion depth is small enough that per-level join cost is negligible. |
| Bill-of-Materials explosion (manufacturing parts tree) | **Recursive CTE** | Aggregation (`SUM` of weights/costs) is natural in SQL; BOM trees are rarely so deep that recursion cost dominates. |
| Deep/wide org chart queried on every page load (50k+ employees, read-heavy) | **Closure Table** | Precomputed ancestor-descendant pairs turn the lookup into a single indexed `JOIN`, trading write-time cost for read-time speed — essential when the same hierarchy is queried constantly. |
| Shortest-path routing with weighted edges | **Graph DB** (Neo4j, etc.) | Weighted shortest-path and pathfinding algorithms (Dijkstra, A*) are native graph-engine operations; reimplementing them in recursive SQL is slow and error-prone. |
| Fraud ring detection (arbitrary-depth cyclic relationship traversal) | **Graph DB** | Requires efficient traversal of dense, cyclic graphs with pattern matching across relationship types — exactly what graph engines are optimized for, and exactly where unbounded SQL recursion is riskiest. |

### Sidebar: Postgres 14+ `SEARCH` and `CYCLE` Clauses

Postgres 14 added syntax that removes most of the manual `path`-array boilerplate above:

```sql
WITH RECURSIVE subordinates AS (
    SELECT id, name, manager_id
    FROM employees WHERE manager_id IS NULL
    UNION ALL
    SELECT e.id, e.name, e.manager_id
    FROM employees e
    JOIN subordinates s ON e.manager_id = s.id
)
SEARCH BREADTH FIRST BY id SET ordercol
CYCLE id SET is_cycle USING path
SELECT * FROM subordinates ORDER BY ordercol;
```

* **`SEARCH BREADTH FIRST BY id SET ordercol`** automatically generates an `ordercol` column that orders results level-by-level (or `DEPTH FIRST` for a pre-order traversal), without you having to hand-roll a `level` counter.
* **`CYCLE id SET is_cycle USING path`** automatically tracks visited `id` values and sets a boolean `is_cycle` column to `true` instead of looping forever — functionally equivalent to the manual `path` array + `WHERE NOT (e.id = ANY(path))` pattern, but maintained by Postgres itself.
* This is the current best-practice idiom for new code on Postgres 14+; the manual `path`-array technique above remains essential to understand because you'll still encounter it in older codebases and because it's portable to engines without `SEARCH`/`CYCLE` support.

---

## Hands-on Lab

### Exercise 1: The Org Chart

**Goal**: View the hierarchy with path and level.

**Seed data**:

```sql
CREATE TABLE employees (id int, name text, manager_id int);
INSERT INTO employees VALUES
    (1, 'Alice', NULL),
    (2, 'Bob', 1),
    (3, 'Charlie', 2);
```

**Query**:

```sql
WITH RECURSIVE org_chart AS (
    SELECT
        id, name, manager_id,
        ARRAY[name]::text[] AS path,
        1 AS level
    FROM employees
    WHERE manager_id IS NULL

    UNION ALL

    SELECT
        e.id, e.name, e.manager_id,
        o.path || e.name,
        o.level + 1
    FROM employees e
    JOIN org_chart o ON e.manager_id = o.id
)
SELECT id, name, array_to_string(path, ' -> ') AS path, level
FROM org_chart
ORDER BY level, id;
```

**Expected result**:

```text
 id |  name   |        path             | level
----+---------+--------------------------+-------
  1 | Alice   | Alice                    |     1
  2 | Bob     | Alice -> Bob             |     2
  3 | Charlie | Alice -> Bob -> Charlie  |     3
(3 rows)
```

### Exercise 2: Bill of Materials

**Goal**: Calculate total weight of the top-level part.

**Seed data**:

```sql
CREATE TABLE parts (id int, name text, parent_id int, unit_weight_g numeric, quantity int);
INSERT INTO parts VALUES
    (1, 'Machine', NULL, 0, 1),     -- top-level: 1 Machine
    (2, 'Gear', 1, 0, 2),           -- Machine contains 2 Gears
    (3, 'Screw', 2, 10, 5);         -- each Gear contains 5 Screws @ 10g each
```

**Query**:

```sql
WITH RECURSIVE bom AS (
    SELECT id, name, parent_id, unit_weight_g, quantity,
           quantity::numeric AS total_quantity
    FROM parts
    WHERE id = 1

    UNION ALL

    SELECT p.id, p.name, p.parent_id, p.unit_weight_g, p.quantity,
           b.total_quantity * p.quantity
    FROM parts p
    JOIN bom b ON p.parent_id = b.id
)
SELECT SUM(unit_weight_g * total_quantity) AS total_weight_g
FROM bom;
```

**Expected result**:

```text
 total_weight_g
-----------------
             100
(1 row)
```

2 Gears x 5 Screws/Gear x 10g/Screw = 100g, matching the goal stated above.

### Exercise 3: Cycle Panic

**Goal**: Create and fix an infinite loop.

**Reproduce the bug**:

```sql
-- Break the tree: make Alice report to Charlie (Alice -> Bob -> Charlie -> Alice)
UPDATE employees SET manager_id = 3 WHERE id = 1;

-- Re-run the Exercise 1 query *without* a cycle guard — it will run indefinitely
-- (cancel it manually; this is the failure mode, not something to let finish):
WITH RECURSIVE org_chart AS (
    SELECT id, name, manager_id, ARRAY[id] AS path
    FROM employees WHERE manager_id IS NULL  -- NOTE: now matches ZERO rows, since every employee has a manager!
    UNION ALL
    SELECT e.id, e.name, e.manager_id, o.path || e.id
    FROM employees e JOIN org_chart o ON e.manager_id = o.id
)
SELECT * FROM org_chart;
```

**Fix**: seed the anchor explicitly (since there's no longer a `NULL`-manager root) and add cycle detection to the recursive member's join:

```sql
WITH RECURSIVE org_chart AS (
    SELECT id, name, manager_id, ARRAY[id] AS path
    FROM employees WHERE id = 1  -- start from a known node instead of relying on a NULL root

    UNION ALL

    SELECT e.id, e.name, e.manager_id, o.path || e.id
    FROM employees e
    JOIN org_chart o ON e.manager_id = o.id
    WHERE NOT (e.id = ANY(o.path))  -- stop before re-visiting a node already in the path
)
SELECT * FROM org_chart;
```

**Expected result**: the query now terminates (instead of hanging) because the `WHERE NOT (e.id = ANY(o.path))` guard prevents the recursive member from ever re-joining back to a node already present in `path` — the moment it would revisit `Alice` (id 1), that branch produces zero rows and recursion stops there.

---

## Mastery Check

### Question 1: Syntax

Which keyword is mandatory for recursion in Postgres?
A) `RECURSIVE`.
B) `LOOP`.
C) `REPEAT`.
D) `AGAIN`.

<details>
<summary>Click for Answer</summary>

**Answer: A**
`WITH RECURSIVE cte_name AS ...`
</details>

### Question 2: Anchor

When does the Anchor Member run?
A) Every loop.
B) Only once, at the start.
C) At the end.
D) Never.

<details>
<summary>Click for Answer</summary>

**Answer: B**
It seeds the recursion.
</details>

### Question 3: Termination

When does the recursion stop?
A) When the recursive query returns no rows.
B) When the CPU melts.
C) When it hits 100 rows.
D) When you press Ctrl+C.

<details>
<summary>Click for Answer</summary>

**Answer: A**
The recursion halts when the recursive `SELECT` returns an **empty result set** — meaning no new rows satisfy the `JOIN` condition (no more unvisited children to find). This is the mathematical notion of a "fixed point": applying the recursive rule one more time to the current accumulated result produces no change (zero new rows), so Postgres knows it has reached the end of the hierarchy and stops. Contrast this with a buggy or cyclic query, where the recursive member keeps finding "new" rows forever (because a `path` guard is missing) and the fixed point is never reached — see the Unbounded Recursion pitfall above.
</details>

### Question 4: Breadcrumbs

Why store the `path` as an Array?
A) To find the shortest path.
B) To print the hierarchy (A > B > C) and for cycle detection.
C) Arrays are faster.
D) It looks cool.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Crucial for debugging and display.
</details>

### Question 5: Alternatives

For a very deep tree (e.g., 10,000 levels), is recursion fast?
A) Yes, it's instant.
B) No, each level is a separate join iteration. It can be slow.
C) It depends on the weather.
D) SQL cannot handle it.

<details>
<summary>Click for Answer</summary>

**Answer: B**
For massive graphs, specialized Graph DBs are better.
</details>

---

## Glossary

| Term | Definition |
|---|---|
| **Anchor Member** | The non-recursive `SELECT` that seeds a recursive CTE; runs exactly once, before any recursion begins. |
| **Recursive Member** | The `SELECT` that joins back to the CTE's own name, run repeatedly until it returns zero new rows. |
| **WITH RECURSIVE** | The Postgres syntax (`WITH RECURSIVE cte_name AS (...)`) required to define a recursive CTE; plain `WITH` cannot self-reference. |
| **UNION ALL** | The set operator (almost always, not plain `UNION`) used to combine the anchor and recursive members without de-duplication overhead or incorrect row-dropping. |
| **Cycle Detection** | A guard (typically `WHERE NOT (e.id = ANY(path))`) that prevents the recursive member from re-visiting a node already on the current path, avoiding infinite loops. |
| **Path Array** | An array column (e.g., `ARRAY[id]`, extended via `path \|\| e.id` each iteration) that records the full traversal history to a row — used for display and cycle detection. |
| **Bill of Materials (BOM)** | A hierarchical parts-explosion structure (assembly -> sub-assembly -> raw component) common in manufacturing/ERP, naturally modeled and aggregated with a recursive CTE. |
| **Fixed-Point** | The mathematical condition under which recursion terminates: applying the recursive rule again produces no new rows, meaning the result set has stabilized. |
| **Closure Table** | A precomputed table of all ancestor-descendant pairs in a hierarchy, trading write-time cost (must be maintained on every insert/move) for read-time speed (a single indexed join replaces recursion). |

---

## Summary

Today you learned:

* ✅ **WITH RECURSIVE**: The loop structure in SQL.
* ✅ **Trees**: Querying Parent-Child relationships.
* ✅ **Paths**: Tracking traversal history.
* ✅ **Cycle Detection**: Preventing infinite loops, including the Postgres 14+ `CYCLE` clause.
* ✅ **Architecture trade-offs**: When to reach for a Closure Table or a Graph DB instead of recursive SQL.

**Tomorrow**: We reshape data formats with **Pivoting & Crosstabs**.

---

## 🚨 Escalating Incident Drill Track (Days 105–107: Procedures → Triggers → Recursion)

This lesson closes out the three-day storyline: the midnight archiving procedure (Day 105) was rebuilt as a trigger-based audit system (Day 106), and now finance needs a recursive rollup query over that audit/hierarchy data. Each drill below is scoped to *this* lesson's tools — recursive CTEs, cycle detection, and `pg_stat_activity` for runaway recursive queries.

### Drill 1 (Severity 2): The org-chart recursive query that won't return

**Scenario**: A new "manager span of control" report runs a recursive CTE over the `employees` table (the same table fed by the Day 106 audit trigger whenever a manager reassignment happens) to compute each employee's full reporting chain. After a bulk reorg import, the report has been "running" for 12 minutes and dashboards show one backend pegged at 100% CPU.

**Required outputs**:

1. **Root-cause analysis using query plans and schema objects**
   * Query `pg_stat_activity WHERE state = 'active'` to find the offending backend's PID and `query_start`, confirming the 12-minute runtime.
   * Inspect the recursive CTE's join condition and check whether it includes a `path`-array cycle guard (`WHERE NOT (e.id = ANY(path))`) — the bulk reorg import likely introduced a cycle (an employee whose manager chain loops back to themselves) that the original query never anticipated.
   * Reproduce the cycle on a small fixture: find the specific employee row(s) where `manager_id` creates a loop.
2. **Mitigation patch strategy and rollback criteria**
   * Add the cycle-detection `WHERE NOT (e.id = ANY(path))` guard (or migrate to the Postgres 14+ `CYCLE` clause) to the recursive member immediately, and cancel the runaway backend with `pg_cancel_backend(pid)`.
   * Add a data-quality check on the reorg import pipeline that rejects any `manager_id` change creating a cycle, before it reaches the `employees` table.
   * Rollback criteria: if the patched query still exceeds a 5-second timeout against the full 50k-employee table, escalate to a closure-table migration rather than continuing to tune the recursive CTE.
3. **Post-incident report**
   * Summarize business impact (delayed span-of-control report, CPU contention affecting other queries during the 12-minute window).
   * Document prevention controls (mandatory cycle-guard code review checklist item for any new recursive CTE; reorg import validation step).
   * Add monitoring updates (alert on any backend with `query_start` older than 60 seconds running a query containing `RECURSIVE`).

### Drill 2 (Severity 1): BOM explosion recursive query returns wrong total after a parts-table edit

**Scenario**: The Day 105/106 archiving and audit work surfaced a request from manufacturing: total weight per finished product, computed via the Bill-of-Materials recursive CTE from Exercise 2. After an engineer edits the `parts` table to re-parent a sub-assembly, the computed total weight for "Machine" silently doubles, and a customer-facing shipping-weight estimate becomes wrong on the website.

**Required outputs**:

1. **Root-cause analysis using query plans and schema objects**
   * Walk the `parts` table's `parent_id` chain manually for the affected product and compare against what the recursive CTE returns — check whether the re-parenting edit created a part that is now reachable via *two* different paths from the root (a diamond, not a tree), which a tree-shaped recursive CTE will double-count.
   * Confirm whether the recursive query uses `UNION ALL` (expected) or `UNION` (would mask the duplication symptom differently) to understand exactly how the bad data manifests as a wrong total.
   * Build a minimal 4-row reproduction of the diamond-shaped parts edit that demonstrates the double-count.
2. **Mitigation patch strategy and rollback criteria**
   * Revert or correct the `parent_id` edit that created the diamond relationship — BOM trees should not have shared sub-assemblies reachable by two paths unless the query is explicitly designed to handle that (e.g., with `DISTINCT` part instances tracked separately from quantity multiplication).
   * If shared sub-assemblies are a legitimate business case going forward, redesign the schema (e.g., a `part_usages` join table with explicit multiplicities) rather than patching the query to special-case diamonds.
   * Rollback criteria: any discrepancy between the recursive CTE's total and a manually-verified spreadsheet total for a sample of 10 products blocks re-publishing the shipping-weight estimate.
3. **Post-incident report**
   * Summarize business impact (incorrect shipping-weight estimates shown to customers, duration until caught, any shipping cost miscalculations).
   * Document prevention controls (schema constraint or data-quality check preventing diamond-shaped `parent_id` edits in tree-only BOM data; required spot-check against manual totals after any BOM data migration).
   * Add monitoring updates (automated weekly reconciliation comparing recursive-CTE BOM totals against a known-good reference dataset).

### Drill 3 (Severity 1 / Executive Escalation): 50k-employee hierarchy migration to a closure table under deadline

**Scenario**: Following Drills 1 and 2, leadership has lost confidence in recursive CTEs over the now-50,000-row `employees` table — reports are slow, fragile to cycles, and fragile to diamond-shaped edits in adjacent hierarchical tables. The CTO mandates a migration to a closure table within two weeks, while the org-chart report must keep working throughout.
**Required outputs**:

1. **Root-cause analysis using query plans and schema objects**
   * Benchmark the current recursive CTE's performance at 50k rows with `EXPLAIN (ANALYZE, BUFFERS)` to quantify exactly how much slower it is than a target closure-table join, justifying the migration with numbers.
   * Design the closure table schema (`ancestor_id, descendant_id, depth`) and the maintenance triggers/procedures needed to keep it in sync with every `INSERT`/`UPDATE`/`DELETE` on `employees.manager_id`.
   * Identify all current consumers of the recursive CTE (reports, APIs) that must be migrated to query the closure table instead.
2. **Mitigation patch strategy and rollback criteria**
   * Stand up the closure table alongside the existing recursive-CTE-based reports (dual-run), backfilling it once via a one-time recursive CTE pass, then maintaining it incrementally via triggers going forward.
   * Cut over consumers one at a time behind a feature flag, validating each report's output against the old recursive-CTE version before fully decommissioning it.
   * Rollback criteria: any consumer showing a discrepancy between closure-table and recursive-CTE results blocks that consumer's cutover until the closure-table maintenance logic is fixed.
3. **Post-incident report**
   * Summarize business impact (report latency before/after, engineering hours spent on the two-week migration, risk window during dual-run).
   * Document prevention controls (closure-table maintenance must be covered by the same code-review rigor as any other trigger; performance regression tests added to CI comparing query latency against a 50k+ row fixture).
   * Add monitoring updates (alert if closure-table row counts drift from the expected `O(n * avg_depth)` relationship to `employees` row count, indicating a maintenance trigger gap).
