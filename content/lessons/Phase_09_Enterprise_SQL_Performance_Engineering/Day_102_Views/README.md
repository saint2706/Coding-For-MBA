---
day: 102
title: "Materialized Views & Caching"
phase: 9
phaseTitle: "Enterprise SQL Performance Engineering"
slug: "materialized-views"
duration: 120
difficulty: "advanced"
tags:
  - materialized-views
  - caching
  - performance
  - concurrency
concepts:
  - "Standard vs Materialized Views"
  - "Refresh Strategies (Concurrent vs Blocking)"
  - "Dependencies and Staleness"
  - "View Indexing"
prerequisites:
  - "Basic SQL Select"
outcomes:
  - "Create a Materialized View for a 1 Billion row table"
  - "Refresh the view safely without downtime"
  - "Index the view to make it faster than the base table"
---

# 🎯 Day 97: Materialized Views & Caching

> *"The fastest query is the one you don't have to run. Materialized Views are the database's cheat sheet."*

---

## The "Never-Coded" Bridge

**The Live Stream vs The DVD**

* **Standard View (Live Stream)**:
  * Every time you watch, the camera turns on, the actors declaim their lines, the lights flash.
  * *Real-time*: Yes.
  * *Cost*: High (Actors get tired).
* **Materialized View (The DVD)**:
  * You record the play once. You put it on a disc.
  * Every time you watch, you just spin the disc.
  * *Real-time*: No (It's a recording from Tuesday).
  * *Cost*: Low (Zero actor effort).

**Enterprise Strategy**: Most business reports don't need "Live" data. They need "Yesterday's" data fast.

---

## The Technical Deep Dive

### 1. View vs Materialized View

* **`CREATE VIEW summary AS SELECT ...`**:
  * Does **nothing** but save the SQL string.
  * When you query `summary`, it *unfolds* the SQL and runs the heavy computation *now*.
  * Zero storage cost. High CPU cost.
* **`CREATE MATERIALIZED VIEW summary AS SELECT ...`**:
  * Runs the query *immediately*.
  * Saves the **results** to a physical disk table.
  * When you query `summary`, it reads the physical table. (Instant).
  * High storage cost. Zero CPU cost (on read).

### 2. The Refresh Problem

The data is now "Frozen". If you add a sale to `orders`, the `summary` MView doesn't know.

* **`REFRESH MATERIALIZED VIEW summary`**:
  * Locks the view (Exclusive Lock). No one can read it for 5 minutes. (Bad for Prod).
* **`REFRESH MATERIALIZED VIEW CONCURRENTLY summary`**:
  * Calculate the new version in the background.
  * Diff it with the old version.
  * Swap them atomically.
  * *Requirement*: The view must have a Unique Index.

### 3. Indexing the View

Because an MView is a real table on disk, you can index it! (Prereq: B-Tree indexing — Day 103 covers the GIN/GiST/BRIN alternatives for non-scalar columns.)

* **Base Table**: `orders` (1 Billion rows). Scrambled order.
* **MView**: `recent_orders` `WHERE date > '2024-01-01'`.
* **Index**: `CREATE INDEX idx_recent_client ON recent_orders(client_id)`.
* *Benefit*: You query a tiny, perfectly indexed table instead of the massive heap.

### 4. Incremental / Partial Materialized Views

Most teams don't materialize the *entire* fact table — they materialize a "hot" window.

* **Pattern**: `CREATE MATERIALIZED VIEW mv_recent_orders AS SELECT * FROM orders WHERE order_date >= now() - interval '30 days';`
* **Why**: A 30-day MView refreshes in seconds; the full 5-year history would take minutes. Most dashboards only need the recent window anyway.
* **Trade-off**: Queries needing historical data (e.g., "compare this March to last March") must fall back to the base table or a second, larger MView refreshed less frequently (e.g., nightly full rebuild + hourly hot-window rebuild).
* **Production pattern**: Pair a `mv_recent_orders` (refreshed every 15 min) with `mv_orders_archive` (refreshed nightly) — together they cover both "live-ish" and "historical" needs without ever re-scanning the full 1B-row table during business hours.

---

## Business Impact: Quantifying the Trade-off

A dashboard querying a 500M-row fact table 300 times/day at 2 seconds/query consumes 600,000 seconds (~166 hours) of cumulative DB CPU time per day. Reading the same result from a Materialized View at 5ms/query consumes just 1,500 seconds (~0.4 hours) — a saving of roughly **165 hours of DB CPU per day**. That headroom is the difference between provisioning a bigger (costlier) database server and running comfortably on your current one. The "cost" is staleness: the dashboard shows data as of the last `REFRESH`, not the live state — which is why the business decision (not just the technical one) is *how stale is acceptable*.

---

## Decision Table: View vs Materialized View vs Base Table Query

| Scenario | Recommended Approach | Why |
|---|---|---|
| Real-time operational dashboard (e.g., live order queue) | Standard View or direct query | Freshness matters more than speed; data changes every second so an MView would be stale almost immediately. |
| Daily finance / executive report (e.g., monthly revenue rollup) | Materialized View, refreshed nightly | Heavy joins/aggregations run once at 3 AM instead of on every page load; T-1 freshness is acceptable for finance close. |
| Ad hoc data-science exploration | Base Table Query (with sampling/LIMIT) | Analysts need flexibility to change filters and joins on the fly — a frozen MView schema would block iteration. |
| High-frequency OLTP reads (e.g., "get my account balance") | Base Table Query, indexed | These reads must reflect the latest committed write; correctness trumps the marginal speed gain of an MView. |

---

## Senior-Level Insights

### "Eventual Consistency" is a Feature

* **Junior**: "The dashboard must show the sale made 1 second ago!"
* **Senior**: "Why? Can the warehouse ship it in 1 second? Can the CEO fire them in 1 second?"
* **Reality**: Most orgs run on T-1 (Yesterday's data). An MView refreshed at 3 AM is perfect.

> ⚠️ Pitfall: Refresh Ordering
>
> **Failure mode**: View A is built `SELECT ... FROM view_B`, and View B is built `SELECT ... FROM table_C`. If an orchestration job refreshes A *before* B has picked up C's latest changes, A silently bakes in stale data — and because A "succeeded," nothing alerts you.
> **Detection**: Query `pg_depend` to map the dependency chain (`SELECT * FROM pg_depend WHERE refobjid = 'view_b'::regclass;`) before scheduling refresh order, and check `pg_matviews.last_refresh` (or your own audit table) to confirm B refreshed more recently than A.
> **Fix**: Use an orchestration tool (Airflow or dbt) that builds and refreshes objects in topological order based on the DAG (Directed Acyclic Graph, see below) — never schedule MView refreshes as independent cron jobs with guessed timings.

A **DAG** is a graph of tasks where edges point only "forward" (no cycles) — in this context, each node is a refresh job (View B depends on Table C; View A depends on View B), and the orchestrator walks the graph so dependencies always refresh before their dependents. **dbt** ("data build tool") and **Airflow** are the two most common tools that manage this DAG in production: dbt focuses on SQL transformation dependencies, Airflow on general task scheduling (dbt runs are often *triggered by* an Airflow DAG).

---

## Hands-on Lab

### Exercise 1: The Heavy Lift

**Goal**: Observe the speed difference.

```sql
-- Step 1: Create and seed a 1M-row table
CREATE TABLE big_table AS
SELECT generate_series(1, 1000000) AS id;

-- Step 2: Time the raw aggregation (Seq Scan)
EXPLAIN ANALYZE
SELECT count(*) FROM big_table;

-- Step 3: Materialize it
CREATE MATERIALIZED VIEW mv_count AS
SELECT count(*) FROM big_table;

-- Step 4: Time the MView read
EXPLAIN ANALYZE
SELECT * FROM mv_count;
```

**Expected result**:

```
-- Step 2 (base table):
Aggregate  (cost=14425.00..14425.01 rows=1 width=8) (actual time=89.214..89.215 rows=1 loops=1)
  ->  Seq Scan on big_table  (cost=0.00..14425.00 rows=1000000 width=0) (actual time=0.010..45.123 rows=1000000 loops=1)
Planning Time: 0.085 ms
Execution Time: 89.241 ms

-- Step 4 (materialized view):
Seq Scan on mv_count  (cost=0.00..1.01 rows=1 width=8) (actual time=0.015..0.017 rows=1 loops=1)
Planning Time: 0.020 ms
Execution Time: 0.020 ms
```

The base-table aggregation costs ~14,425 query-planner cost units and takes ~89ms; the MView read costs ~1 unit and takes ~0.02ms — roughly **4,000x faster** because the answer was already computed and stored.

### Exercise 2: The Refresh

**Goal**: See the staleness.

```sql
-- Insert 1 row into the base table
INSERT INTO big_table VALUES (1000001);

-- Query the MView: still shows the OLD count
SELECT * FROM mv_count;
-- count = 1000000  (stale — does not see the new row)

-- Refresh it
REFRESH MATERIALIZED VIEW mv_count;

-- Query again: now correct
SELECT * FROM mv_count;
-- count = 1000001
```

**Expected result**: the first `SELECT * FROM mv_count` returns `1000000` (stale), and only after `REFRESH MATERIALIZED VIEW mv_count` does the second `SELECT` return `1000001`.

### Exercise 3: Concurrent Refresh

**Goal**: Production-grade refresh with zero downtime for readers.

```sql
-- CONCURRENTLY requires a UNIQUE index on the MView first
CREATE UNIQUE INDEX idx_mv_count ON mv_count(count);

-- Insert another row to create fresh staleness
INSERT INTO big_table VALUES (1000002);

-- Refresh without blocking readers
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_count;
```

**Expected result**: while the `REFRESH MATERIALIZED VIEW CONCURRENTLY` is running, open a second `psql` session and run `SELECT * FROM mv_count;` — it returns immediately with the *old* row count (no blocking, no "still waiting" lock). Once the refresh completes, that same query returns `1000002`. Compare this to a plain `REFRESH MATERIALIZED VIEW mv_count` (no `CONCURRENTLY`), where the second session's `SELECT` would hang until the refresh finishes, because the non-concurrent refresh takes an `ACCESS EXCLUSIVE` lock.

---

## Mastery Check

### Question 1: Storage

Does a standard `VIEW` take up disk space?
A) Yes, substantial space.
B) No, only the query definition (text) is stored.
C) Yes, but compressed.
D) Depends on the moon phase.

<details>
<summary>Click for Answer</summary>

**Answer: B**
A standard `VIEW` stores nothing but the SQL text you wrote in `CREATE VIEW ... AS SELECT ...`. No rows, no computed results, and no extra disk pages are allocated for it. Every time you query the view, Postgres substitutes that saved SQL into your query (a process called "unfolding" or "view expansion") and re-executes the underlying joins and aggregations from scratch against the live base tables. Contrast this with a Materialized View, which actually runs the query once and writes the *result set* to a physical table on disk — that's why an MView has a real size in `pg_relation_size()` and a standard view's size is effectively zero.
</details>

### Question 2: Locking

What happens if you run `REFRESH MATERIALIZED VIEW` (without concurrently) on a busy production system?
A) Everything is fine.
B) Readers block. The dashboard freezes until the refresh is done.
C) The server crashes.
D) The view updates instantly.

<details>
<summary>Click for Answer</summary>

**Answer: B**
A plain `REFRESH MATERIALIZED VIEW` takes an `ACCESS EXCLUSIVE` lock on the MView for the entire duration of the rebuild. Any query trying to `SELECT` from that view — including your production dashboard — must wait in a queue until the lock is released, because Postgres won't let readers see a half-rebuilt table. If the refresh takes 5 minutes on a large aggregation, every dashboard user experiences a 5-minute freeze, which looks to them like the application is down. The fix is `REFRESH MATERIALIZED VIEW CONCURRENTLY`, which builds the new version in a separate temporary structure and atomically swaps it in, so readers keep seeing the *old* (still consistent) data right up until the swap.
</details>

### Question 3: Freshness

If I modify the base table, does the Materialized View update automatically?
A) Yes, Postgres has magic.
B) No, you must triggers or a schedule to call REFRESH.
C) Only if you pay extra.
D) Yes, but slowly.

<details>
<summary>Click for Answer</summary>

**Answer: B**
A Materialized View is a one-time snapshot — Postgres does not maintain a live link back to the base tables the way a standard view does. When you `INSERT`, `UPDATE`, or `DELETE` rows in `orders`, the `summary` MView has no trigger or listener that detects the change automatically. You (or your scheduler) must explicitly run `REFRESH MATERIALIZED VIEW summary` — typically via a cron job, an Airflow DAG, or a `pg_cron` schedule — to pull in the latest base-table state. Until that refresh runs, the MView will confidently and silently serve stale data with no warning.
</details>

### Question 4: Indexing

Can you put an index on a Standard View?
A) Yes.
B) No, because there is no data to index.
C) Only B-Trees.
D) Requires a plugin.

<details>
<summary>Click for Answer</summary>

**Answer: B**
A standard view has no physical storage of its own — it's just a saved query string — so there is no data for an index to point at; Postgres can only index real heap pages on disk. (SQL Server's "Indexed View" feature is a different product-specific exception that materializes the view automatically, which is conceptually closer to a Postgres Materialized View than a Postgres standard view.) In Postgres, if you need an indexed, fast-reading view, you create a `MATERIALIZED VIEW` instead — because it writes its result set to a real table, you can run `CREATE INDEX` on it exactly as you would on `orders` or any other table.
</details>

### Question 5: Use Case

When should you use an MView?
A) For a "Forgot Password" lookup. (Needs real-time).
B) For a "Monthly Sales Report" that involves joining 15 tables.
C) For everything.
D) For small tables.

<details>
<summary>Click for Answer</summary>

**Answer: B**
A "Monthly Sales Report" joining 15 tables is the textbook MView use case because it combines two conditions that justify materialization: the query is *expensive* (many joins/aggregations means high CPU per execution) and the *freshness requirement is low* (a monthly report doesn't need to reflect a sale from 30 seconds ago). Materializing it means the 15-table join runs once, on a schedule, and every report viewer afterward reads a flat, pre-computed table in milliseconds. A "Forgot Password" lookup (option A) is the opposite profile — cheap to query but must be 100% real-time, so a standard query (or even a simple indexed base-table read) is correct there, and an MView would actually introduce a dangerous staleness bug (a user resets their password but the MView still shows the old token state).
</details>

---

## Glossary

| Term | Definition |
|---|---|
| **Materialized View** | A database object that stores the *results* of a query physically on disk, like a regular table, rather than re-running the query each time. |
| **Standard View** | A saved SQL query (just text) that is re-executed in full every time it is queried; stores no data of its own. |
| **Exclusive Lock** | A lock that prevents any other session from reading or writing the locked object until it is released — the cause of dashboard "freezes" during a non-concurrent refresh. |
| **DAG (Directed Acyclic Graph)** | A graph of tasks/dependencies where edges only point forward (no loops) — used by orchestrators to determine the correct order to refresh dependent views/tables. |
| **Staleness** | The gap between the data shown by a Materialized View and the current state of its base tables; grows until the next `REFRESH`. |
| **Concurrent Refresh** | `REFRESH MATERIALIZED VIEW CONCURRENTLY` — rebuilds the MView in the background and atomically swaps it in, so readers are never blocked. Requires a `UNIQUE` index on the MView. |
| **dbt** | "data build tool" — an open-source framework for managing SQL transformations (including MView refresh order) as version-controlled, testable code, organized as a DAG. |
| **Airflow** | A general-purpose workflow orchestrator that schedules and sequences tasks (including dbt runs or raw `REFRESH` commands) according to a DAG. |

---

## Summary

Today you learned:

* ✅ **Standard Views**: Virtual windows (Zero Space, High CPU).
* ✅ **Materialized Views**: Physical Snapshots (High Space, Zero CPU).
* ✅ **Concurrency**: How to refresh without blocking readers.
* ✅ **Staleness**: The trade-off you make for speed.

**Tomorrow**: We speed up searches with **Advanced Indexing (GIN, GiST, BRIN)**.

---

## 🚨 Escalating Incident Drill Track (Days 97–108)

### Day 102 Spotlight Drill: The Frozen Dashboard

**Scenario**: The nightly MView refresh job reports "SUCCESS" in the scheduler logs at 3:05 AM, but at 9 AM the sales dashboard still shows yesterday's totals. The on-call analyst escalates: "Is the data wrong, or is the dashboard broken?"

**Required steps**:

1. Confirm whether the refresh actually ran and updated the underlying storage: `SELECT schemaname, matviewname, last_refresh FROM pg_matviews WHERE matviewname = 'mv_daily_sales';` (note: Postgres does not natively track `last_refresh` pre-15 without an extension — pair this with your own audit trigger or check `pg_stat_user_tables` activity timestamps as a proxy).
2. Cross-check `pg_stat_user_tables` for the MView's underlying table OID — look at `n_tup_ins`/`n_tup_upd` to see whether a refresh actually wrote new rows around 3 AM, or whether the job silently no-op'd (e.g., crashed before swapping in new data, or hit a permissions error that got swallowed by the scheduler).
3. If the refresh *did* run but a downstream View-on-MView in the dependency chain wasn't refreshed in the correct order (see the Refresh Ordering pitfall above), use `pg_depend` to trace the chain and confirm which object is actually stale.
4. Once root-caused, add a `CREATE UNIQUE INDEX` if missing (required for `CONCURRENTLY`) and switch the nightly job from blocking `REFRESH` to `REFRESH MATERIALIZED VIEW CONCURRENTLY` so a slow or retried refresh never causes a multi-hour production outage window for dashboard readers.
5. Write a one-paragraph post-incident note: what masked the failure (a scheduler that reports "success" on a no-op refresh), and what monitoring you're adding (e.g., row-count delta alert comparing MView count to expected base-table count).

Use the three drills below as a connected simulation sequence spanning the rest of the phase. Each drill is intentionally harder than the previous one and must be completed with production-style evidence.

### Drill 1 (Severity 2): Performance degradation under peak load

**Scenario**: During peak checkout traffic, API latency jumps from 120ms to 2.8s, and dashboards show CPU saturation on the primary database.

**Required outputs**:

1. **Root-cause analysis using query plans and schema objects**
   * Capture `EXPLAIN (ANALYZE, BUFFERS)` for the top 3 slow statements from `pg_stat_statements`.
   * Identify the dominant bottleneck (e.g., sequential scans, stale stats, sort spill, lock waits).
   * Map the issue to schema objects (specific index, table, materialized view, partition, or join path).
2. **Mitigation patch strategy and rollback criteria**
   * Propose a low-risk patch (index change, query rewrite, refresh strategy, stats maintenance, or connection throttling).
   * Define rollout steps, canary checks, and explicit rollback triggers (p95 latency, error rate, lock queue depth, CPU threshold).
3. **Post-incident report**
   * Summarize business impact (checkout conversion, order delay, SLA breach duration).
   * Document prevention controls (capacity threshold alerting, index review checklist, load-test gate before release).
   * Add monitoring updates (query-plan drift alert, wait-event dashboard, incident runbook links).

### Drill 2 (Severity 1): Security policy breach involving row-level access

**Scenario**: A regional sales manager can query customer rows from another region due to a row-level security policy regression.

**Required outputs**:

1. **Root-cause analysis using query plans and schema objects**
   * Reproduce the leak using a least-privilege role and capture relevant SQL.
   * Inspect policy definitions (`pg_policies`), grants, security-definer functions, and view ownership chains.
   * Use query plans to show where policy filters are bypassed or pushed incorrectly.
2. **Mitigation patch strategy and rollback criteria**
   * Provide an emergency containment patch (policy fix, revoke path, view hardening, function privilege correction).
   * Define validation tests for allowed vs denied row sets per role.
   * Set rollback criteria tied to false-deny rate, support-ticket spike, and audit-log anomalies.
3. **Post-incident report**
   * Quantify business/compliance impact (records exposed, jurisdictions affected, notification obligations).
   * List prevention controls (policy-as-code review, CI policy simulation, privileged object inventory).
   * Add monitoring updates (cross-tenant access detectors, policy-change alerts, immutable audit retention).

### Drill 3 (Severity 1 / Executive Escalation): Data correctness regression from trigger/procedure change

**Scenario**: A trigger/procedure deployment silently double-counts revenue in month-end reporting and breaks finance reconciliation.

**Required outputs**:

1. **Root-cause analysis using query plans and schema objects**
   * Diff trigger/procedure versions and execution order; trace writes across dependent tables/views.
   * Use plans and dependency metadata (`pg_trigger`, `pg_proc`, `pg_depend`) to locate duplicate or missing mutations.
   * Build a minimal reproducible dataset proving the correctness gap.
2. **Mitigation patch strategy and rollback criteria**
   * Deliver a hotfix plan (procedure correction + backfill/reconciliation script) with idempotency guarantees.
   * Include data repair strategy for already-corrupted records and freeze windows for risky writes.
   * Define rollback criteria based on reconciliation deltas, financial control checks, and downstream report parity.
3. **Post-incident report**
   * Summarize business impact (close-delay, misstated KPI exposure, executive communication timeline).
   * Document prevention controls (change contracts for triggers, shadow writes, dual-run verification, release checklist).
   * Add monitoring updates (data quality assertions, ledger-vs-fact drift alarms, automated reconciliation jobs).
