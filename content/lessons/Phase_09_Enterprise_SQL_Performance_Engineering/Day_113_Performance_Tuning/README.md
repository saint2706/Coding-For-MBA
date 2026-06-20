---
day: 113
title: "Performance Tuning & Optimization"
phase: 9
phaseTitle: "Enterprise SQL Performance Engineering"
slug: "performance-optimization"
duration: 120
difficulty: "advanced"
tags:
  - explain-analyze
  - vacuum
  - configuration
  - query-optimization
concepts:
  - "EXPLAIN ANALYZE Interpretation"
  - "Configuration Tuning (shared_buffers, work_mem)"
  - "VACUUM and Bloat Management"
  - "Query Plan Forcing (pg_hint_plan)"
prerequisites:
  - "Basic SQL SELECT"
outcomes:
  - "Read an EXPLAIN plan and identify the bottleneck"
  - "Configure Postgres for a 64GB RAM server"
  - "Diagnose and fix table bloat with VACUUM FULL"
---

# 🎯 Day 108: Performance Tuning & Optimization

> *"Premature optimization is the root of all evil. But knowing how to optimize when the time comes is the root of all promotions."*

---

## The "Never-Coded" Bridge

**The Traffic Jam**

* **Seq Scan (The Local Road)**:
  * You drive past every house on the street checking mailbox numbers until you find #742.
  * *Speed*: Slow (O(N)).
* **Index Scan (The Highway Exit)**:
  * You look at the sign: "Houses 700-800, Exit 5". You skip directly to that neighborhood.
  * *Speed*: Fast (O(log N)).
* **Bitmap Heap Scan (The Tour Bus)**:
  * You have a list of 50 addresses. Instead of driving to House 1, then House 50, then House 2 (random order), you sort them geographically and visit them in disk order.
  * *Speed*: Medium (Reduces Random I/O).

---

## The Technical Deep Dive

### 1. EXPLAIN ANALYZE

The X-Ray of queries.

* **Syntax**: `EXPLAIN ANALYZE SELECT ...`
* **Key Metrics**:
  * `cost=0.00..483.00`: Estimated cost (Planning).
  * `actual time=0.015..10.234`: Real execution time (ms).
  * `rows=1000`: How many rows returned.
  * `Buffers: shared hit=42`: Did we use RAM cache or disk?

### 2. Configuration Tuning

`postgresql.conf` parameters.

* **`shared_buffers`**: RAM allocated to cache table data. (Rule: 25% of system RAM).
* **`work_mem`**: RAM per sort/hash operation. (Too high = OOM. Too low = Disk spills).
* **`effective_cache_size`**: Tells the planner how much OS cache is available. (Doesn't allocate RAM, just a hint).
* **`max_connections`**: Each connection uses ~10MB. 1000 connections = 10GB overhead. Use connection pooling (PgBouncer).

### 3. VACUUM (The Garbage Collector)

* **The Problem**: UPDATEs don't modify rows in place. They mark old rows dead and write new ones. (MVCC). Dead rows accumulate ("Bloat").
* **`VACUUM`**: Marks dead space as reusable. (Doesn't shrink the file).
* **`VACUUM FULL`**: Rewrites the table. (Locks table. Use only in maintenance windows).
* **Autovacuum**: Runs automatically. Tune `autovacuum_vacuum_scale_factor`.

  > **What `autovacuum_vacuum_scale_factor = 0.2` (the default) actually means**: autovacuum triggers a vacuum on a table once dead tuples exceed 20% of that table's live row count (plus a small fixed `autovacuum_vacuum_threshold`). For a 10M-row table, that means roughly 2M dead rows must accumulate before autovacuum even fires — on a high-write table, that's a lot of bloat sitting around in the meantime. For large, high-churn tables, it's common practice to lower this to `0.01` (1%) via `ALTER TABLE t SET (autovacuum_vacuum_scale_factor = 0.01);` so cleanup happens far more frequently and in smaller, cheaper increments.

### 4. `ANALYZE`: Keeping the Planner Honest

`VACUUM` cleans up dead rows, but it doesn't tell the query planner anything about the *shape* of your data. That's `ANALYZE`'s job.

* **What it does**: Samples the table and updates `pg_statistics` — row count estimates, most-common values, histogram boundaries for each column.
* **Why it matters**: The query planner decides Seq Scan vs Index Scan based on these statistics, not on the live table. If statistics are stale, the planner can pick a catastrophically bad plan even though the correct index exists.
* **When it goes stale**: Any large `INSERT`/`UPDATE`/`DELETE`, and *especially* schema changes like adding a new column with a default value distribution the planner has never seen.
* **Run it explicitly**: `ANALYZE orders;` (cheap, read-only, no lock). `VACUUM ANALYZE orders;` does both in one pass and is the standard post-migration command.
* **Check staleness**: `SELECT relname, n_mod_since_analyze, last_analyze FROM pg_stat_user_tables WHERE relname = 'orders';` — a large `n_mod_since_analyze` relative to table size with an old `last_analyze` timestamp is the smoking gun for a stats-driven plan regression.

### 5. `pg_stat_statements`: The DBA's Dashboard

Everything above explains *how* to read one query's plan. In production you don't get to pick which query is slow — you need to find it first. `pg_stat_statements` is the standard extension for exactly that.

* **Enable it**: `CREATE EXTENSION IF NOT EXISTS pg_stat_statements;` (and add it to `shared_preload_libraries` in `postgresql.conf`, which requires a restart).
* **The one query every DBA runs daily**:

  ```sql
  SELECT query, calls, mean_exec_time, total_exec_time
  FROM pg_stat_statements
  ORDER BY mean_exec_time DESC
  LIMIT 10;
  ```

* **Why `mean_exec_time` over `total_exec_time`**: `total_exec_time` is dominated by call frequency (a cheap query called 1M times can out-rank a slow query called 10 times). `mean_exec_time` surfaces queries that are *individually* slow regardless of how often they run — usually the better starting point for plan-level optimization. Sort by `total_exec_time` instead when you're hunting for aggregate database load rather than single-query latency.
* **Reset the counters** after a fix ships, so the dashboard reflects post-fix behavior: `SELECT pg_stat_statements_reset();`

### 6. Table Partitioning: Performance at the Architecture Level

Indexing speeds up *finding* rows within a table. Partitioning changes the size of the table you're searching in the first place — it's the natural next step after a table outgrows what indexing alone can fix, and a direct successor to the Materialized View patterns from Day 102.

* **Range partitioning** (most common for time-series data): `CREATE TABLE orders (id int, created_at date, ...) PARTITION BY RANGE (created_at);` then `CREATE TABLE orders_2026_01 PARTITION OF orders FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');`
* **List partitioning**: partition by a discrete category, e.g. `PARTITION BY LIST (region)` with one partition per region — useful when queries almost always filter by that category.
* **Hash partitioning**: `PARTITION BY HASH (customer_id)` spreads rows evenly across N partitions when there's no natural range/list key but you still want to shrink each physical table.
* **Why it's a performance tool, not just an organization tool**: a query filtering `WHERE created_at >= '2026-06-01'` against a partitioned table only scans the relevant monthly partitions ("partition pruning") instead of the entire history — a 500M-row table effectively becomes a 5M-row scan. `VACUUM` and index maintenance also become cheaper per-partition, and old partitions can be dropped instantly (`DROP TABLE orders_2020_01;`) instead of running a slow `DELETE`.

---

## Senior-Level Insights

### The "Missing Index" Myth

* **Junior**: "This query is slow. I'll add an index!"
* **Senior**: "But... this query returns 80% of the table rows. A Seq Scan *is* faster than an Index Scan for bulk reads."
* **Reality**: Indexes help when you're filtering to <10% of rows. For analytics (large scans), Seq Scan is optimal.

### The Connection Pool Lie

* **Startup**: App opens 1000 connections. "We scale!"
* **Reality**: Postgres uses one thread per connection. 1000 threads thrash the CPU. pgBouncer pools 1000 app connections into 20 DB connections.
* **Impact**: Latency drops 90%.

> ⚠️ **Pitfall: VACUUM FULL in Production**
> `VACUUM FULL` rewrites the entire table into a new file and requires an `AccessExclusiveLock` for the full duration — no reads, no writes, nothing, until it finishes. On a 500GB table this can take *hours*, during which the table is effectively offline.
> **Detection**: If you run `VACUUM FULL` and queries against that table start timing out or queuing, you've already caused the outage — check first with `SELECT pg_size_pretty(pg_total_relation_size('orders'));` before deciding whether `VACUUM FULL` is even feasible.
> **Fix**: Schedule `VACUUM FULL` only inside an explicit maintenance window with stakeholder sign-off, or use the `pg_repack` extension, which performs the equivalent rewrite using a shadow table and a brief swap, achieving near-zero-downtime instead of an hours-long lock.

---

## Glossary

| Term | Definition |
|---|---|
| **EXPLAIN ANALYZE** | Runs the query for real and reports the actual execution plan, timing, and row counts — as opposed to plain `EXPLAIN`, which only estimates. |
| **Sequential Scan (Seq Scan)** | A plan node that reads every row in a table in physical order; optimal for returning a large fraction of the table, poor for selective lookups. |
| **Index Scan** | A plan node that uses an index to jump directly to matching rows, ideal for highly selective queries (returning a small fraction of rows). |
| **Bitmap Heap Scan** | A hybrid plan node that uses an index to build an in-memory bitmap of matching row locations, sorts them by physical disk order, then reads the heap — reduces random I/O for medium-selectivity queries. |
| **shared_buffers** | The block of RAM Postgres reserves to cache table and index pages, avoiding repeated disk reads; typically tuned to ~25% of system RAM. |
| **work_mem** | The RAM budget allocated per sort/hash operation within a single query; too low forces disk-based "external merge" spills, too high risks out-of-memory under concurrent load. |
| **effective_cache_size** | A planner *hint* (not an allocation) estimating how much total memory (Postgres + OS file cache) is available for caching — influences whether the planner favors Index Scans. |
| **VACUUM** | Reclaims dead tuple space for reuse within the existing table file, without shrinking the file on disk or blocking concurrent reads/writes. |
| **VACUUM FULL** | Rewrites the entire table into a new, compact file, physically shrinking it on disk — but holds an `AccessExclusiveLock` for the duration. |
| **MVCC** | Multi-Version Concurrency Control — Postgres's strategy of never overwriting a row in place; updates create a new row version and mark the old one dead, enabling lock-free concurrent reads. |
| **Table Bloat** | The accumulation of dead-but-unreclaimed row versions in a table's storage, inflating its on-disk size and slowing scans without adding usable data. |
| **Autovacuum** | The background process that automatically runs `VACUUM`/`ANALYZE` once a table's dead-tuple ratio crosses a configurable threshold (`autovacuum_vacuum_scale_factor`). |
| **PgBouncer** | A lightweight external connection pooler that multiplexes many application connections onto a small, fixed number of real Postgres backend connections. |
| **Connection Pooling** | The general technique of reusing a limited set of database connections across many client requests instead of opening one connection per request. |

---

## Hands-on Lab

### Exercise 1: Reading EXPLAIN

**Goal**: Identify the slow operation, then fix it with an index.

1. **Setup** (seed data):

    ```sql
    CREATE TABLE users (id serial PRIMARY KEY, email text);
    INSERT INTO users (email)
    SELECT 'user' || i || '@x.com'
    FROM generate_series(1, 1000000) AS i;
    ```

2. **Before the index**:

    ```sql
    EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'user500000@x.com';
    ```

3. **Expected result** (before):

    ```
    Seq Scan on users  (cost=0.00..18334.00 rows=1 width=36) (actual time=50.123..50.125 rows=1 loops=1)
      Filter: (email = 'user500000@x.com'::text)
      Rows Removed by Filter: 999999
    Planning Time: 0.112 ms
    Execution Time: 50.180 ms
    ```

4. **Analysis**: Postgres scanned all 1,000,000 rows to find 1 match. Add an index:

    ```sql
    CREATE INDEX idx_email ON users(email);
    ```

5. **After the index**:

    ```sql
    EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'user500000@x.com';
    ```

6. **Expected result** (after):

    ```
    Index Scan using idx_email on users  (cost=0.42..8.44 rows=1 width=36) (actual time=0.015..0.017 rows=1 loops=1)
      Index Cond: (email = 'user500000@x.com'::text)
    Planning Time: 0.098 ms
    Execution Time: 0.041 ms
    ```

    Roughly **3000x faster** (50.18ms → 0.041ms) — the Seq Scan's "Rows Removed by Filter: 999999" line is the visual proof of exactly how much wasted work the index eliminated.

### Exercise 2: Configuration

**Goal**: Tune `postgresql.conf` for a dedicated 64GB RAM server.

1. `shared_buffers = 16GB` (25% of 64GB).
2. `work_mem = 64MB` (Per sort/hash operation — be conservative; this is *per operation*, and a complex query can run several in parallel).
3. `effective_cache_size = 48GB` (75% of 64GB — a planner hint, not a real allocation).
4. `max_connections = 200` (Use PgBouncer for anything beyond this; each raw connection costs ~10MB of overhead).
5. **Observable difference**: with `work_mem` raised from the 4MB default to 64MB, re-run `EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM users ORDER BY email;` on the 1M-row table from Exercise 1 — the `Sort Method` line should change from `external merge Disk` to `quicksort Memory`, and total execution time typically drops from several seconds to a few hundred milliseconds.

### Exercise 3: VACUUM and Bloat

**Goal**: Reproduce bloat, then fix it.

1. **Setup** (seed data + create bloat):

    ```sql
    CREATE TABLE bloat_demo (id serial PRIMARY KEY, payload text);
    INSERT INTO bloat_demo (payload)
    SELECT 'x' || i
    FROM generate_series(1, 1000000) AS i;

    SELECT pg_size_pretty(pg_total_relation_size('bloat_demo'));
    -- Expected result: 73 MB (approx)

    DELETE FROM bloat_demo WHERE id < 900000;
    ```

2. **After DELETE, before VACUUM**:

    ```sql
    SELECT pg_size_pretty(pg_total_relation_size('bloat_demo'));
    ```

    **Expected result**: still **~73 MB** — the 900,000 deleted rows are marked dead but the file has not shrunk. This is MVCC bloat.

3. **Plain VACUUM**:

    ```sql
    VACUUM bloat_demo;
    SELECT pg_size_pretty(pg_total_relation_size('bloat_demo'));
    ```

    **Expected result**: still **~73 MB** — `VACUUM` marks the dead space as *reusable by future inserts on this table*, but it does not return the space to the operating system or shrink the file.

4. **VACUUM FULL**:

    ```sql
    VACUUM FULL bloat_demo;
    SELECT pg_size_pretty(pg_total_relation_size('bloat_demo'));
    ```

    **Expected result**: drops to **~7 MB** (proportional to the ~100,000 surviving rows) — the table was physically rewritten. Recall the Pitfall above: this acquired an `AccessExclusiveLock` for the duration, which is fine on a demo table but must be scheduled carefully on a production table of any real size.

### Exercise 4: Finding the Slow Query with `pg_stat_statements`

**Goal**: Use the standard production monitoring tool instead of guessing which query to `EXPLAIN`.

1. **Setup**: `CREATE EXTENSION IF NOT EXISTS pg_stat_statements;` (requires `shared_preload_libraries = 'pg_stat_statements'` in `postgresql.conf` plus a restart in a real deployment; many managed providers — RDS, Cloud SQL — pre-load it).
2. Run a mix of queries against the `users` table from Exercise 1, including a few without the index advantage (e.g., `SELECT * FROM users WHERE email LIKE '%500%';` several times).
3. **Query**:

    ```sql
    SELECT query, calls, round(mean_exec_time::numeric, 2) AS mean_ms
    FROM pg_stat_statements
    ORDER BY mean_exec_time DESC
    LIMIT 10;
    ```

4. **Expected result**: the `LIKE '%500%'` query (a non-indexable leading-wildcard scan) appears near the top with a `mean_ms` far higher than the indexed `email = ...` lookups — this is exactly how a DBA identifies optimization targets without needing a user complaint first.

### Exercise 5: Partition Pruning

**Goal**: Observe partitioning reduce a scan's working set.

1. **Setup**:

    ```sql
    CREATE TABLE orders (id serial, created_at date, amount numeric) PARTITION BY RANGE (created_at);
    CREATE TABLE orders_2026_01 PARTITION OF orders FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
    CREATE TABLE orders_2026_02 PARTITION OF orders FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
    INSERT INTO orders (created_at, amount)
    SELECT '2026-01-01'::date + (i % 59), random() * 100
    FROM generate_series(1, 200000) AS i;
    ```

2. **Query**:

    ```sql
    EXPLAIN ANALYZE SELECT * FROM orders WHERE created_at >= '2026-02-01';
    ```

3. **Expected result**: the plan shows only `Seq Scan on orders_2026_02` — `orders_2026_01` never appears in the plan at all. This is partition pruning: the planner eliminated an entire partition before execution rather than scanning it and filtering rows out afterward.

---

## Decision Table: Diagnosing a Slow Query

| Symptom in `EXPLAIN ANALYZE` | Likely Cause | Fix |
|---|---|---|
| `Seq Scan` with high `Rows Removed by Filter` on a small result set | Missing index on the filter column | `CREATE INDEX ... ` on the filtered column(s) |
| `Sort Method: external merge Disk` | `work_mem` too low for the sort/hash size | Raise `work_mem`, or add an index that avoids the sort |
| `Buffers: shared read=` (high) vs `shared hit=` (low) | Data not cached in `shared_buffers`; disk-bound | Increase `shared_buffers`/`effective_cache_size`, or the working set genuinely exceeds RAM |
| Planner chooses Seq Scan despite an index existing, and `n_mod_since_analyze` is large | Stale statistics | Run `ANALYZE table_name;` |
| Query plan looks fine but overall server CPU is saturated under load | Too many concurrent raw connections | Introduce PgBouncer connection pooling |
| Table size keeps growing even though row count is stable | Table bloat (high write/delete churn outpacing autovacuum) | Lower `autovacuum_vacuum_scale_factor`; consider `pg_repack` |

---

## Mastery Check

### Question 1: Explain

What does `Buffers: shared hit=100` mean?
A) 100 rows were returned.
B) 100 disk blocks were read from RAM cache (not disk).
C) 100 indexes were used.
D) 100 errors occurred.

<details>
<summary>Click for Answer</summary>

**Answer: B**
"Hit" means the requested block was already in `shared_buffers` (RAM cache), so no disk I/O was needed for it. The counterpart metric, `shared read=N`, means N blocks had to be fetched from disk (or the OS page cache), which is the much more expensive path. When diagnosing a slow query, a plan dominated by `shared read` rather than `shared hit` points you toward increasing `shared_buffers`/`effective_cache_size` or accepting that your working set genuinely exceeds available RAM.
</details>

### Question 2: Seq Scan

When is a Seq Scan faster than an Index Scan?
A) Never.
B) When returning >10-20% of table rows (large result set).
C) When the index is broken.
D) When the moon is full.

<details>
<summary>Click for Answer</summary>

**Answer: B**
An Index Scan does random I/O — it jumps around the table fetching one row at a time wherever the index says it lives. A Seq Scan does sequential I/O — it reads the file from start to finish in physical order, which disks (especially spinning disks, but even SSDs to a lesser degree) handle far more efficiently in bulk. Once a query needs roughly 10–20%+ of the table's rows, the cumulative cost of all that random-access index lookups exceeds the cost of just reading everything in order — this is why the planner will deliberately *ignore* an available index for broad analytical queries, and why "just add an index" is not a universal fix.
</details>

### Question 3: work_mem

What happens if `work_mem` is too low?
A) Queries fail.
B) Sort/Hash operations spill to disk (temp files), slowing down queries.
C) The server crashes.
D) Nothing.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Each sort or hash operation (`ORDER BY`, hash joins, `GROUP BY` aggregation) is allocated up to `work_mem` of RAM to do its work in-memory. If the data being sorted/hashed exceeds that budget, Postgres falls back to writing intermediate batches to temporary disk files and merging them — you'll see `Sort Method: external merge Disk` in `EXPLAIN ANALYZE` instead of `quicksort Memory`. Disk I/O is orders of magnitude slower than RAM, so this "spill" is usually the single biggest lever for speeding up sort-heavy or aggregation-heavy queries, but raising `work_mem` carelessly is dangerous: it's allocated *per operation, per concurrent query*, so a high setting under high concurrency can exhaust server RAM (see Question 4-adjacent OOM risk in the Technical Deep Dive).
</details>

### Question 4: Autovacuum

Can you disable autovacuum?
A) No.
B) Yes, but you'll suffer from bloat and eventually index corruption.
C) Yes, it improves performance.
D) Only in production.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Disabling autovacuum is like disabling garbage collection in a managed-memory language: nothing breaks immediately, but dead tuples from every `UPDATE`/`DELETE` just keep accumulating with nothing reclaiming the space. Tables bloat, indexes bloat alongside them, every query touching that table gets progressively slower because it has to skip over more dead rows, and in extreme, long-neglected cases Postgres can hit transaction ID wraparound issues that require emergency intervention. The short-term "performance gain" from skipping autovacuum's background I/O is never worth the long-term degradation.
</details>

### Question 5: Connections

Why use PgBouncer?
A) To cache query results.
B) To pool 1000s of app connections into a small number of DB connections, reducing overhead.
C) To backup the database.
D) To encrypt data.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Postgres uses a process-per-connection model: every connection, even an idle one, consumes a backend process and roughly 10MB of memory, and the OS scheduler has to context-switch between all of them under load. An application that "scales" by opening thousands of raw connections is actually thrashing the database server. PgBouncer sits between the app and Postgres, accepting thousands of lightweight client connections but multiplexing them onto a small, fixed pool (e.g., 20) of real backend connections — reducing per-connection overhead and typically cutting latency dramatically under high concurrency.
</details>

### Question 6: Statistics

A query that used to run in 50ms now takes 4 seconds after a schema migration added two new columns, even though the relevant index is still in place. What is the most likely first thing to check?

<details>
<summary>Click for Answer</summary>

**Answer**: Stale table statistics. Schema migrations that touch a large table (adding columns, especially with backfilled defaults) change the data Postgres has on disk without automatically updating `pg_statistics`. Check `SELECT n_mod_since_analyze, last_analyze FROM pg_stat_user_tables WHERE relname = 'orders';` — a large `n_mod_since_analyze` and a stale `last_analyze` timestamp means the planner is working from outdated row-count and value-distribution estimates, and may have silently switched from an Index Scan to a Seq Scan (or vice versa) for the wrong reasons. Running `ANALYZE orders;` and re-checking the plan is the standard, low-risk first diagnostic step — far cheaper than touching the index or the query itself.
</details>

---

## Summary

Today you learned:

* ✅ **EXPLAIN**: The diagnostic tool for query performance.
* ✅ **Configuration**: Tuning Postgres for your hardware.
* ✅ **VACUUM / ANALYZE**: Managing MVCC bloat and keeping planner statistics fresh.
* ✅ **pg_stat_statements**: Finding the slow query before a user reports it.
* ✅ **Partitioning**: Shrinking the effective table size a query has to scan.
* ✅ **Indexes**: When to use them (and when not to).

**Tomorrow**: The Curriculum Capstone (Day 113B) and Cloud-Native SQL (Day 113C) complete the phase.

---

## 🚨 Escalating Incident Drill Track: Performance Regressions (Day 113)

Use these three drills as a connected simulation sequence specific to today's performance-tuning theme. Each drill is intentionally harder than the previous one and must be completed with production-style evidence.

### Drill 1 (Severity 3): A single dashboard query suddenly times out

**Scenario**: A finance dashboard query that has run in under 200ms for months suddenly times out at the application's 30-second limit. No code or query text has changed.

**Required outputs**:

1. **Root-cause analysis using query plans and schema objects**
   * Run `EXPLAIN (ANALYZE, BUFFERS) <the query>` and compare the actual plan against what you'd expect — look specifically for an unexpected `Seq Scan` where an `Index Scan` used to appear.
   * Check `SELECT n_mod_since_analyze, last_analyze FROM pg_stat_user_tables WHERE relname = 'target_table';` to rule out (or confirm) stale statistics as the trigger.
2. **Mitigation patch strategy and rollback criteria**
   * If statistics are stale: run `ANALYZE target_table;` and re-run `EXPLAIN ANALYZE` to confirm the plan reverts to the expected Index Scan.
   * Rollback criteria: if `ANALYZE` does not restore the expected plan within one attempt, escalate to checking for index bloat (`REINDEX CONCURRENTLY`) rather than repeatedly re-running `ANALYZE`.
3. **Post-incident report**
   * Document the fix and add a scheduled `ANALYZE` (or lower `autovacuum_analyze_scale_factor`) on any table that receives large batch writes, so statistics never drift this far again.

### Drill 2 (Severity 2): A nightly batch job's runtime has crept from 20 minutes to 3 hours

**Scenario**: A nightly aggregation job against a 50M-row `events` table has been getting progressively slower over the past month, with no application changes — just steady write volume.

**Required outputs**:

1. **Root-cause analysis using query plans and schema objects**
   * Check `SELECT pg_size_pretty(pg_total_relation_size('events'));` against the expected size for the row count — a mismatch points to bloat.
   * Confirm via `SELECT relname, n_dead_tup, n_live_tup FROM pg_stat_user_tables WHERE relname = 'events';` whether dead tuples have been accumulating faster than autovacuum reclaims them.
   * Query `pg_stat_statements` to confirm the job's queries (not unrelated queries) are the ones whose `mean_exec_time` has grown.
2. **Mitigation patch strategy and rollback criteria**
   * If bloat is confirmed and the table is too large for a maintenance-window `VACUUM FULL`, use `pg_repack` for a near-zero-downtime rewrite.
   * Lower `autovacuum_vacuum_scale_factor` on this specific table (`ALTER TABLE events SET (autovacuum_vacuum_scale_factor = 0.01);`) so future bloat is caught earlier.
   * Rollback criteria: monitor `n_dead_tup` for one week post-fix; if it climbs back toward pre-fix levels, autovacuum is still losing the race against write volume and needs further tuning (more aggressive autovacuum workers, or partitioning the table by date).
3. **Post-incident report**
   * Quantify the cost in compute-hours of running 3-hour batch jobs nightly versus 20-minute jobs, and recommend partitioning `events` by date (see the Table Partitioning section above) as the longer-term structural fix, since old partitions can later be dropped instead of vacuumed.

### Drill 3 (Severity 1 / Executive Escalation): Post-migration, every query against a 500M-row table is 5x slower

**Scenario**: After a schema migration added two nullable columns to the 500M-row `orders` table (backfilled with a default value via a background job), every query touching `orders` — not just queries using the new columns — is now roughly 5x slower. Customer-facing checkout latency has breached SLA.

**Required outputs**:

1. **Root-cause analysis using query plans and schema objects**
   * Pull the top 10 slowest `orders`-related queries from `pg_stat_statements` ordered by `mean_exec_time` to confirm the regression is broad, not isolated to one query.
   * Check `SELECT n_mod_since_analyze, last_analyze FROM pg_stat_user_tables WHERE relname = 'orders';` — the backfill job touched all 500M rows, which is exactly the kind of mass write that invalidates planner statistics, and at this scale autovacuum's automatic `ANALYZE` may not have caught up yet.
   * Confirm via `EXPLAIN ANALYZE` on a previously-fast query that the plan has changed (e.g., planner now underestimates row counts and picks a poor join order or scan type).
2. **Mitigation patch strategy and rollback criteria**
   * Run `ANALYZE orders;` immediately — on a 500M-row table this samples rather than scans every row, so it completes in minutes, not hours, and is safe to run without a maintenance window since it takes no exclusive locks.
   * Re-run the previously-slow queries' `EXPLAIN ANALYZE` to confirm plans return to baseline before declaring the incident resolved.
   * Rollback criteria: if `ANALYZE` alone does not restore baseline latency, the next step is checking whether the backfill job itself caused index bloat on `orders`'s existing indexes (via `pgstattuple` or comparing index size pre/post-migration), which would require a `REINDEX CONCURRENTLY`, not just fresh statistics.
3. **Post-incident report**
   * Quantify the SLA breach window and customer impact (checkout latency, abandoned-cart rate during the incident).
   * Document a new migration checklist rule: any migration that backfills a default value across a large table must be followed immediately by an explicit `ANALYZE` on that table — do not rely on autovacuum's schedule to catch up after a single massive write burst.
   * Add a monitoring alert on `pg_stat_user_tables.n_mod_since_analyze` exceeding a percentage-of-table-size threshold, so the next stats-staleness regression is caught before it reaches production traffic.
