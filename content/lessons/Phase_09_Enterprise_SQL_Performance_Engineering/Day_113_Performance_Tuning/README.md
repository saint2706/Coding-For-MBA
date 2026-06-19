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
* **Autovacuum**: Runs automatically. Tune `autovacuum_vacuum_scale_factor` (default 20%).

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

---

## Hands-on Lab

### Exercise 1: Reading EXPLAIN

**Goal**: Identify the slow operation.

1. `EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'bob@x.com'`.
2. **Output**: `Seq Scan on users (cost=0.00..500.00 rows=1) (actual time=50.123..50.125 rows=1)`.
3. **Analysis**: Scanning 1M rows to find 1. Need an index.
4. `CREATE INDEX idx_email ON users(email)`.
5. **Re-run**: `Index Scan using idx_email (actual time=0.015..0.017 rows=1)`. (3000x faster).

### Exercise 2: Configuration

**Goal**: Tune for a 64GB server.

1. `shared_buffers = 16GB` (25% of 64GB).
2. `work_mem = 64MB` (Per operation. Be conservative).
3. `effective_cache_size = 48GB` (75% of 64GB).
4. `max_connections = 200` (Use PgBouncer for more).

### Exercise 3: VACUUM

**Goal**: Fix bloat.

1. `SELECT pg_size_pretty(pg_total_relation_size('users'))`. (500MB).
2. Delete 90% of rows. (Size still 500MB. Dead tuples).
3. `VACUUM users`. (Size still 500MB. Space is marked reusable but not reclaimed).
4. `VACUUM FULL users`. (Size now 50MB. Table rewritten).

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
"Hit" means cache hit. If you see `shared read=100`, it means disk I/O (slow).
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
Random I/O (Index) is slower than sequential read (Seq Scan) for bulk data.
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
You'll see `Sort Method: external merge Disk` in EXPLAIN.
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
Disabling autovacuum is like disabling garbage collection. Short-term gain, long-term disaster.
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
Thread-per-connection model doesn't scale to 10k concurrent users.
</details>

---

## Summary

Today you learned:

* ✅ **EXPLAIN**: The diagnostic tool for query performance.
* ✅ **Configuration**: Tuning Postgres for your hardware.
* ✅ **VACUUM**: Managing MVCC bloat.
* ✅ **Indexes**: When to use them (and when not to).

**Congratulations! You have completed Phase 9: Enterprise SQL Performance Engineering.**
**Next**: Review the Phase Overview for the complete picture.

---

## 🚨 Escalating Incident Drill Track (Days 97–108)

Use these three drills as a connected simulation sequence. Each drill is intentionally harder than the previous one and must be completed with production-style evidence.

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
