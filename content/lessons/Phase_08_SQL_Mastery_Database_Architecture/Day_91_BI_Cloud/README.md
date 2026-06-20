---
day: 91
title: "Cloud Architecture & Optimization"
phase: 8
phaseTitle: "SQL Mastery & Database Architecture"
slug: "cloud-optimization"
duration: 120
difficulty: "advanced"
tags:
  - snowflake
  - bigquery
  - clustering
  - partitioning
concepts:
  - "Partitioning vs Clustering"
  - "Materialized Views (Auto-Refresh)"
  - "Query Execution Plans (Cloud)"
  - "Slot Contention"
prerequisites:
  - "Basics of Cloud (Day 83)"
  - "SQL Indexing (Day 73)"
outcomes:
  - "Tune a slow query on 1TB of data"
  - "Design a Clustering Strategy for Time-Series Data"
  - "Understand Serverless vs Provisioned Compute"
---

# 🎯 Day 86: Cloud Architecture & Optimization

> *"The Cloud makes bad queries run fast, and cost a fortune. Optimization is no longer about speed; it's about bankruptcy prevention."*

---

## Prerequisites & Recommended Order

**This is advanced material, and Phase 8's day numbering does not match the prerequisite chain.** Tuning scans, clustering, and execution plans assumes you already understand how a database reads data and uses indexes — those fundamentals appear later in this phase by day number:

| If you are unfamiliar with... | Read this first |
| --- | --- |
| How `SELECT`/`WHERE`/`GROUP BY` are logically processed, what an execution plan node means | **Day 99 — Advanced DQL & Optimization** |
| Tables, keys, transactions, MVCC | **Day 96 — Relational Database Internals** |
| `CREATE TABLE`, schemas | **Day 97 — Advanced DDL & Schema** |

The directory is not being renamed or moved. If terms like "sequential scan," "index scan," or "selectivity" are unfamiliar while reading this lesson, detour to Day 99 first, then Day 96, then return here. Day 90 (Advanced SQL) is a useful warm-up for the SQL syntax used in the lab queries below, but is not strictly required.

---

## The "Never-Coded" Bridge

**The Encyclopedia vs. The Filing Cabinet**

**Scanning**:

* **Encyclopedia (Unpartitioned)**: To find "History of Rome", you flip through every page of Volume A-Z. (Slow, Expensive).
* **Filing Cabinet (Partitioned)**: You open the drawer labeled "History". You ignore "Science", "Math", "Art". (Fast, Cheap).

**Clustering**:

* Inside the "History" drawer, the folders are sorted by **Date**.
* To find "1990", you jump to the back. You don't scan "1800".

**Cloud Databases** (Snowflake/BigQuery) charge you for every page you touch. **Optimization** is the art of touching as few pages as possible.

---

## The Technical Deep Dive

> **Dialect note**: this lesson is conceptually vendor-neutral, but runnable lab queries use **PostgreSQL 14+**. Where BigQuery/Snowflake syntax is shown for context (`PARTITION BY`, `CLUSTER BY`), it is marked explicitly and is illustrative, not executable in the Postgres labs below.

### 1. Partitioning (The Sledgehammer)

Breaks a large table into physical segments, most often by date range.

* **Strategy**: Usually by **Date** (`Ingestion Date` or `Event Date`).
* **BigQuery** (illustrative, not run in labs): Automatic. `PARTITION BY DATE(timestamp)`.
* **Postgres**: declarative partitioning — `PARTITION BY RANGE (event_date)`, then attach child partitions per range.
* **Query**: `WHERE date = '2023-01-01'`.
* **Result**: a query that filters on the partition key reads only the matching partition(s) instead of the whole table — this is called **partition pruning**.

**Qualifying the savings claim**: a figure like "reads only 1/365th of the data, ~99.7% cost saving" assumes (a) 365 *roughly equal-sized* daily partitions, (b) the query filters by a *single, exact* partition key value with no other predicates needing a broader scan, and (c) the engine's pricing model charges by bytes/rows scanned (true for BigQuery on-demand pricing; not directly true for Postgres, which has no per-byte billing, or for Snowflake's per-second virtual-warehouse billing, where you still pay for warehouse uptime even if the bytes scanned drop). Treat "1/365th" as the *theoretical ceiling* for a uniform daily partition scheme with a single-day filter — real savings vary with partition skew, query shape, and pricing model.

### 2. Clustering (The Scalpel)

Sorts data *within* a partition (or within the whole table, if unpartitioned).

* **Strategy**: High **cardinality** (many distinct values) columns commonly filtered (e.g., `user_id`, `customer_region`).
* **Snowflake** (illustrative): `CLUSTER BY (user_id)`.
* **Postgres equivalent**: `CLUSTER table USING index_name` physically reorders the table once (a one-time, non-automatic operation — Postgres does not auto-maintain cluster order on new inserts, unlike Snowflake's automatic re-clustering service).
* **Query**: `WHERE user_id = 555`.
* **Result**: "Micro-Partition Pruning" — skips storage blocks/files that don't contain ID 555, because clustering groups nearby values into the same physical blocks.

### 3. Materialized Views (The Cheat Code)

A pre-computed table that stores the result of a query, refreshed on some schedule or trigger rather than recalculated on every read.

* **Scenario**: You run `SUM(Sales)` every minute. It scans 1 Billion rows.
* **Materialize**: Create a materialized view `mv_daily_sales` that stores just the answer.
* **Refresh modes**:
  * **Full / `REFRESH MATERIALIZED VIEW`** (Postgres): recomputes the entire view from scratch. Simple, but on a 1-billion-row source this can itself be slow and locks the view for reads unless you use `REFRESH MATERIALIZED VIEW CONCURRENTLY` (requires a unique index on the view).
  * **Incremental refresh** (BigQuery materialized views, Snowflake materialized views): the engine tracks which base-table partitions/micro-partitions changed and recomputes only the affected aggregate slices — described loosely above as "if you insert 5 new rows, the DB only adds 5 to the sum," but this only holds for refresh strategies/engines that support true incremental maintenance, and only for aggregate functions the engine knows how to incrementally maintain (e.g., `SUM`/`COUNT` are easy; some `DISTINCT`/window-function patterns are not eligible for incremental refresh and force a full recompute).
* **Staleness/SLA tradeoff**: a materialized view answers "as of the last refresh," not "right now." If your refresh interval is 15 minutes and the business needs a dashboard accurate to the minute, a materialized view is the wrong tool — a real-time query or streaming aggregate is needed instead (see Day 101C, Streaming SQL Fundamentals).
* **Incremental-refresh limitations**: not all queries are eligible (joins across volatile tables, non-deterministic functions, large fan-out joins often disqualify a view from incremental maintenance and silently fall back to full refresh — check your engine's documentation for which view shapes qualify).
* **Warehouse sizing & cache effects**: a materialized view still consumes storage and, on first read after a cold cache, may need to be loaded from disk/blob storage — repeated reads within a warm cache window are far cheaper than the first. Sizing a warehouse/cluster too small causes refresh jobs to queue behind other work; too large wastes spend on idle compute.
* **Cost-governance controls**: most warehouses let you cap a materialized view's auto-refresh frequency, restrict who can create them (they have an ongoing maintenance cost even if never queried), and tag them for cost attribution (chargeback/showback) so an unused materialized view doesn't silently accrue compute charges indefinitely.

---

## Decision Guidance: Choosing a Physical Optimization

| Technique | Best when | Selectivity needed | Maintenance cost | Vendor support |
| --- | --- | --- | --- | --- |
| **Partitioning** | Queries consistently filter on one low-cardinality, range-friendly column (date, region) | Coarse (a handful to a few thousand partitions) | Low once set up; risk of "too many tiny partitions" if over-applied | Postgres (declarative), BigQuery (automatic), Snowflake (micro-partitions are automatic, not user-defined) |
| **Clustering** | Queries filter on a high-cardinality column *within* large partitions/tables | Fine-grained (thousands+ distinct values) | Moderate — Snowflake auto-reclusters (costs credits); Postgres `CLUSTER` is a manual, one-time, blocking operation | Snowflake (native), BigQuery (clustering keys), Postgres (manual `CLUSTER`, decays over time) |
| **B-tree / secondary indexes** | Point lookups or small-range lookups on OLTP-style queries | Very fine-grained, often unique or near-unique | Moderate — every index slows writes and consumes storage | Universal (Postgres, MySQL, SQL Server); less central in columnar warehouses like BigQuery, which favor scan+prune over indexes |
| **Materialized views** | The same expensive aggregate/join is read far more often than the source data changes | N/A (precomputation, not pruning) | Highest — refresh compute, storage, staleness management | Postgres (manual/cron refresh), BigQuery & Snowflake (managed incremental refresh) |
| **Duplicated projections** (storing the same data sorted/laid out two different ways) | Two very different, both-hot query patterns on the same table (e.g., "by date" and "by user") that can't both be served by one sort order | N/A | High — doubles storage and write-amplification | Vertica/Redshift-style (native "projections"); emulate elsewhere with materialized views or duplicate clustered tables |

Use this table directionally, not as a strict decision tree — most production systems combine 2–3 of these (e.g., partition by date *and* cluster by user_id *and* add a materialized daily rollup) rather than picking exactly one.

---

## Senior-Level Insights

### The "Slot Contention" Problem

* **BigQuery's slot model** (illustrative — this is BigQuery-specific terminology, not a universal cloud-warehouse concept): on-demand pricing allocates from a shared pool of "slots" (units of CPU/IO capacity); a commonly cited starting allocation is around 2,000 slots per project, but this is a *current BigQuery on-demand default*, not a fixed law — Google has changed default slot allocations over time, and reserved/flat-rate pricing changes the number entirely. Snowflake's equivalent concept is "warehouse size" (XS–6XL), which scales compute differently (whole virtual warehouses, not individually metered slots).
* If a query needs more slots/capacity than is available, it **queues** rather than failing outright.
* **Impact**: dashboard loads in 2 seconds at 9 AM, but 20 seconds at 9:05 AM (when everyone logs in) — a real, observable contention pattern, even though the exact slot counts are vendor- and plan-specific.
* **Fix**: buy reserved/flat-rate capacity (fixed cost, predictable performance) or optimize queries to use less compute (e.g., `APPROX_COUNT_DISTINCT` instead of exact `COUNT(DISTINCT)`).

### Logical vs Physical Design

* **Logical**: "This table has a User ID." (For Humans).
* **Physical**: "This table is sorted by User ID and stored in fixed-size blocks." (For Machines — block sizes vary by engine; BigQuery's storage format does not expose a fixed "400MB block" as a user-facing constant the way this lesson previously implied, so treat any specific block size as engine/version-dependent, not a number to memorize.)
* **Senior Devs** think Physically. "If I sort by Date, my Date queries are fast, but my User queries are slow. Should I duplicate the data and sort it differently?" (Z-Ordering / Projection — see the decision table above.)

---

## Hands-on Lab

All labs run on **PostgreSQL 14+**. Conceptual BigQuery/Snowflake equivalents are noted per exercise — the mechanism (partition/cluster pruning) is the same even though the syntax and billing model differ.

### Exercise 1: Partition Pruning

**Goal**: Observe how a partition-unfriendly predicate forces a full scan, while a partition-friendly one prunes.

**Setup**:

```sql
-- Dialect: PostgreSQL 14+
CREATE TABLE events (
    id SERIAL,
    event_date DATE NOT NULL,
    date_string TEXT NOT NULL,   -- same date, stored as text, to show the LIKE pitfall
    payload TEXT
) PARTITION BY RANGE (event_date);

CREATE TABLE events_2023_01 PARTITION OF events
    FOR VALUES FROM ('2023-01-01') TO ('2023-02-01');
CREATE TABLE events_2023_02 PARTITION OF events
    FOR VALUES FROM ('2023-02-01') TO ('2023-03-01');

INSERT INTO events (event_date, date_string, payload)
SELECT
    d::date,
    to_char(d, 'YYYY-MM-DD'),
    'row-' || gs
FROM generate_series('2023-01-01'::date, '2023-02-28'::date, interval '1 day') AS d,
     generate_series(1, 50) AS gs;  -- 50 rows/day, ~2,900 rows total across both partitions
```

**Query A (Bad)** — defeats pruning because the planner cannot prove a `TEXT` pattern match maps to a date range:

```sql
EXPLAIN ANALYZE
SELECT count(*) FROM events WHERE date_string LIKE '2023-01%';
```

**Query B (Good)** — filters on the actual partition key with a typed range:

```sql
EXPLAIN ANALYZE
SELECT count(*) FROM events WHERE event_date BETWEEN '2023-01-01' AND '2023-01-31';
```

**Steps to capture evidence**: run both `EXPLAIN ANALYZE` statements and compare the plan output.

**Expected before/after metrics**:

| Query | Plan shows | Partitions touched |
| --- | --- | --- |
| A (Bad) | `Seq Scan on events_2023_01` **and** `Seq Scan on events_2023_02` (or an `Append` over both) | 2 of 2 |
| B (Good) | A single scan node referencing only `events_2023_01` | 1 of 2 |

**Expected row count** (same answer either way — this lab is about scan cost, not result correctness): `count = 1550` (31 days × 50 rows/day).

* **BigQuery equivalent**: a table with `PARTITION BY DATE(event_date)` shows this same effect in the query's "Bytes Processed" estimate before running, and in `INFORMATION_SCHEMA.JOBS` after running.
* **Snowflake equivalent**: check `QUERY_HISTORY` `PARTITIONS_SCANNED` vs `PARTITIONS_TOTAL` for the query.

### Exercise 2: Clustering Keys

**Goal**: Reason through a clustering-key trade-off using a concrete query mix (no ride-sharing capstone dependency — this uses a generic trips table).

**Scenario**: A `trips` table queried two ways: "Trips in city X" (high frequency) and "Trips on date Y" (lower frequency, mostly for finance reconciliation).

```sql
-- Dialect: PostgreSQL 14+ (CLUSTER is manual/one-time in Postgres;
-- Snowflake's CLUSTER BY is automatic and ongoing — see note below)
CREATE TABLE trips (
    id SERIAL PRIMARY KEY,
    city_id INTEGER NOT NULL,
    trip_date DATE NOT NULL,
    fare NUMERIC(8,2)
);
CREATE INDEX idx_trips_city_date ON trips (city_id, trip_date);
-- One-time physical reorder to match the index order:
CLUSTER trips USING idx_trips_city_date;
```

* **Cluster/sort key chosen**: `(city_id, trip_date)`.
* **Impact**: rows for the same `city_id` are physically grouped; within a city, rows are sorted by `trip_date`. A query `WHERE city_id = 5 AND trip_date = '2023-06-01'` touches a small, contiguous block range.
* **Trade-off**: a query that filters by `trip_date` *alone* (no `city_id`) must scan across every city's block range to find matching dates, because dates are no longer globally contiguous — they're contiguous only *within* each city. This is the cost of optimizing for one query pattern over another.
* **Postgres caveat**: `CLUSTER` is a one-time, table-locking operation — Postgres does not keep the table clustered as new rows are inserted (clustering "decays" — see Pitfalls). Snowflake's `CLUSTER BY` is maintained automatically and continuously by a background service (at a credit cost), which is the major operational difference between the two engines for this feature.

### Exercise 3: Approximate Aggregations

**Goal**: Compare exact vs. approximate distinct-counting cost and result, and see how close the approximation actually is.

**Setup**:

```sql
-- Dialect: PostgreSQL 14+ (requires the hll extension for true HyperLogLog;
-- core Postgres ships approximate counting only via extensions, unlike
-- BigQuery/Snowflake which have it built in as APPROX_COUNT_DISTINCT)
CREATE TABLE page_views (
    id SERIAL,
    user_id INTEGER NOT NULL
);

INSERT INTO page_views (user_id)
SELECT (random() * 100000)::int FROM generate_series(1, 2000000);  -- 2M rows, ~100K distinct users
```

**Exact**:

```sql
SELECT COUNT(DISTINCT user_id) AS exact_distinct_users FROM page_views;
```

* *Cost*: must materialize and deduplicate up to 2,000,000 values — expensive in both Postgres (hash aggregate over the full set) and distributed engines (requires shuffling all values to one or more nodes for deduplication).

**Approximate** (BigQuery/Snowflake syntax, shown for context — not run in the Postgres lab without the `hll` extension):

```sql
-- BigQuery / Snowflake:
SELECT APPROX_COUNT_DISTINCT(user_id) AS approx_distinct_users FROM page_views;
```

* *Cost*: dramatically cheaper — uses the **HyperLogLog (HLL)** probabilistic algorithm, which tracks a small fixed-size sketch (a few KB) instead of every distinct value, trading a small, bounded error rate for large memory/compute savings.
* **Qualifying "trade 0.1% accuracy for 99% speed"**: the actual error rate and speedup depend on the engine's HLL implementation (bucket/precision settings), the true cardinality, and data distribution — standard HLL implementations target roughly 1–2% relative error at typical default precision, not a guaranteed 0.1%. The "99% speed" framing is similarly a rough illustration of relative cost, not a benchmarked constant — always validate against your own engine and data before quoting a specific number to stakeholders.
* **Use case**: dashboard showing "Weekly Active Users." Does it matter if it's 1,000,000 or 1,000,800 (an ~0.08% difference)? Usually not — but it absolutely matters for financial reconciliation or billing, where exact counts are required regardless of cost.

---

## Pitfalls

### 1. Partition Filters That Disable Pruning

The classic mistake from Exercise 1: filtering on a *derived* or *mistyped* expression of the partition column instead of the column itself defeats pruning even when a partitioned table exists. Examples: `WHERE date_string LIKE '2023-01%'` on a text column shadowing a real date partition key; `WHERE EXTRACT(MONTH FROM event_date) = 1` (the planner often cannot prove this maps to a contiguous partition range); wrapping the partition column in a function without an expression index. Always filter on the raw partition column with a direct comparison or range when you need pruning.

### 2. Too Many Tiny Partitions

Partitioning by minute or by a high-cardinality key (e.g., `user_id`) instead of day/month creates thousands of tiny partitions. Each partition carries fixed metadata overhead (catalog entries, file headers, planning cost to enumerate candidate partitions). Past a few thousand partitions, query planning time itself can become a bottleneck — you trade scan cost for planning cost. Rule of thumb: partition by the coarsest grain that still prunes most queries (daily is far more common than hourly; hourly or finer is usually reserved for very high-volume event streams with dedicated tooling).

### 3. Clustering-Key Decay

In Postgres, `CLUSTER` is a one-time operation — every subsequent `INSERT` appends new rows wherever there's free space, not in cluster order. Over time, the physical ordering "decays" back toward insertion order, and you must re-run `CLUSTER` periodically to restore the benefit. In Snowflake, auto-clustering keeps order maintained continuously, but at an ongoing credit cost that scales with write volume — "set and forget" clustering is not free in either engine, just billed differently (manual maintenance windows vs. continuous background credits).

### 4. Data Skew

If one partition or one cluster-key value absorbs a disproportionate share of rows (e.g., 90% of rows have `user_id = NULL` due to an upstream bug, or one city dominates a multi-city trips table), distributed engines that parallelize work per-partition/per-key will have one worker doing 90% of the work while others sit idle — the job's wall-clock time is bound by the slowest (most skewed) worker, not the average. Detect skew by checking row-count distribution across partitions/cluster keys before assuming a clustering or partitioning strategy will help; fix by filtering known bad values early, salting keys, or choosing a different partition/cluster key.

### 5. Benchmark Warm-Cache Bias

Running the "before" query, then immediately running the "after" (optimized) query, often makes the optimization look better than it is — the second query benefits from the first having already pulled relevant pages into memory/cache. To get a fair before/after comparison: alternate run order, run each variant multiple times and discard the first (cold) run, or explicitly clear caches between runs where the engine allows it (e.g., restarting a warehouse, or in Postgres, comparing `EXPLAIN (ANALYZE, BUFFERS)` shared-hit vs. read counts rather than wall-clock time alone).

---

### Non-Functional Constraints (Apply to All Exercises)

* **Performance / Scale**: Document a target query runtime of **p95 < 3s** for your final solution, validate behavior at **30 concurrent analytical users/sessions**, and keep compute spend below **$5** per production-equivalent run.
* **Data Governance / Security**: Define acceptance criteria for least-privilege access, PII handling (masking/tokenization where applicable), audit logging of query access, and retention/deletion alignment with policy.
* **Business KPI Impact**: Explicitly state which business KPI(s) improve based on your schema/query decisions and quantify expected directional impact.
  * KPI focus for this day: *BI dashboard freshness and warehouse spend should keep executive reporting latency under 10 minutes while staying inside budget.*

## Mastery Check

### Question 1: Partitioning

If you partition by `Date`, and then query `WHERE User_ID = 5`, does it prune partitions?
A) Yes.
B) No.
C) Maybe.
D) It deletes the table.

<details>
<summary>Click for Answer</summary>

**Answer: B**
No. It must scan *all* days to find User 5, unless you also filter by Date.
</details>

### Question 2: Materialized View

What is the downside of Materialized Views?
A) They are slow to read.
B) They cost money to maintain (Write cost) and can lag slightly behind real-time.
C) They are illegal in Europe.
D) They are hard to spell.

<details>
<summary>Click for Answer</summary>

**Answer: B**
You pay storage + compute for updates.
</details>

### Question 3: HyperLogLog

When should you use `APPROX_COUNT_DISTINCT`?
A) For Financial Audits (Must be exact to the penny).
B) For High-Traffic Analytics (Unique Visitors, distinct devices) where speed > precision.
C) Never.
D) For small tables.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Standard for Big Data analytics.
</details>

### Question 4: Clustering

Can you re-cluster a table after it's built?
A) No, it's permanent.
B) Yes, but it requires re-writing the data (Maintenance Cost).
C) It happens by magic for free.
D) Only on leap years.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Sorting 1 Petabyte takes a lot of compute. Snowflake charges for "Auto-Clustering".
</details>

### Question 5: Skew

What happens if one partition (e.g., "NULL" user_id) has 90% of the data?
A) Nothing.
B) "Data Skew". Parallelism fails because one worker node has to process 90% of the work while others wait.
C) It runs faster.
D) It deletes the NULLs.

<details>
<summary>Click for Answer</summary>

**Answer: B**
The #1 killer of performance in distributed systems. Filter NULLs early!
</details>

### Question 6: Qualifying Claims

Why shouldn't "reads only 1/365th of the data, 99.7% cost saving" be treated as a universal fact?

A) It's always true regardless of engine or query.
B) It assumes uniform daily partitions, a single-day filter, and a per-byte pricing model — actual savings vary by engine, partition skew, and query shape.
C) Partition pruning doesn't actually save any cost.
D) Only BigQuery supports partition pruning.

<details>
<summary>Click for Answer</summary>

**Answer: B**
The figure is a theoretical ceiling under specific assumptions (uniform partitions, exact single-partition filter, byte-based billing). Real-world savings depend on partition size variance, additional predicates, and whether the engine even bills by bytes scanned (Postgres and Snowflake's per-second compute billing do not).
</details>

### Question 7: Postgres CLUSTER vs Snowflake CLUSTER BY

What is the key operational difference between `CLUSTER` in Postgres and `CLUSTER BY` in Snowflake?

A) They are identical in every way.
B) Postgres `CLUSTER` is a one-time, manual, blocking reorder; Snowflake `CLUSTER BY` is maintained continuously by an automated background service (at ongoing cost).
C) Snowflake's clustering is free and instantaneous.
D) Postgres automatically reclusters on every insert.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Postgres requires you to manually re-run `CLUSTER` as new rows decay the sort order; Snowflake's auto-clustering re-sorts data continuously in the background, billed as ongoing credit consumption.
</details>

---

## Glossary

| Term | Definition |
| --- | --- |
| **Partition pruning** | The query planner skipping entire partitions that cannot contain matching rows, based on a filter on the partition key. |
| **Clustering** | Physically sorting data (within a table or partition) by one or more columns so that related values are stored close together. |
| **Cardinality** | The number of distinct values in a column; "high cardinality" (e.g., `user_id`) means many distinct values, "low cardinality" (e.g., `country`) means few. |
| **Micro-partition** | Snowflake's internal, automatically managed unit of physical storage (roughly 50–500MB uncompressed), the basis for its pruning and clustering metadata. |
| **Slot** | BigQuery's unit of compute/IO capacity allocated to a query; queries that need more slots than available queue rather than fail. |
| **Materialized view** | A database object that stores the precomputed result of a query, refreshed on a schedule or trigger rather than recalculated on every read. |
| **Skew** | An uneven distribution of values across partitions or keys, causing some workers/partitions to carry disproportionately more data or work than others. |
| **Projection** (Vertica/Redshift sense) | A physically duplicated copy of a table's data stored in a different sort order, to serve a second query pattern efficiently. |
| **HyperLogLog (HLL)** | A probabilistic algorithm for estimating the number of distinct values in a dataset using a small, fixed-size memory sketch instead of storing every value. |

---

## Cross-References

* **Prerequisites**: Day 99 (Advanced DQL & Optimization — execution plans, indexing) and Day 96 (Relational Database Internals) — see "Prerequisites & Recommended Order" above.
* **Related**: Day 90 (Advanced SQL Patterns) for the JSON/lateral-join syntax used in some queries; Day 92 (Data Governance) for cost-governance controls that intersect with the warehouse-sizing topics here.

---

## Summary

Today you learned:

* ✅ **Pruning**: The key to speed and cost savings — partition by filtered columns, but the exact savings figure depends on partition uniformity and the engine's pricing model.
* ✅ **Clustering**: Sorting data physically helps filter non-partitioned columns, with very different maintenance models across Postgres (manual) and Snowflake (automatic, ongoing cost).
* ✅ **Materialized Views**: Tradeoffs between full and incremental refresh, staleness/SLA, and cost governance.
* ✅ **Approximate Count**: Use HLL for massive cardinality sets — but validate the actual error rate and speedup for your engine rather than quoting "0.1%/99%" as fact.
* ✅ **Data Skew**: Avoid uneven distribution of keys; it bottlenecks distributed parallelism.

**Tomorrow**: We tackle **Data Governance**—The policies that keep this architecture safe.
