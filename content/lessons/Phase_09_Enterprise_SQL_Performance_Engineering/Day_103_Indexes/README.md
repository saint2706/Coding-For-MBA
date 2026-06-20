---
day: 103
title: "Advanced Indexing (GIN, GiST, BRIN)"
phase: 9
phaseTitle: "Enterprise SQL Performance Engineering"
slug: "advanced-indexing"
duration: 120
difficulty: "advanced"
tags:
  - gin
  - gist
  - brin
  - indexing
concepts:
  - "Beyond B-Trees (Non-Scalar Data)"
  - "GIN (Inverted Indexes for JSON/Arrays)"
  - "GiST (Spatial/Range Search)"
  - "BRIN (Block Range for Big Data)"
prerequisites:
  - "Basic B-Tree Index"
outcomes:
  - "Index a JSONB document"
  - "Search 'tags contains X' in 1ms vs 1s"
  - "Index a 1TB log table with 50KB overhead (BRIN)"
---

# 🎯 Day 98: Advanced Indexing (GIN, GiST, BRIN)

> *"A B-Tree is a hammer. Sometimes you have a screw (JSON), a map (Geo), or a mountain (Big Data)."*

---

## The "Never-Coded" Bridge

**The Filing Systems**

1. **B-Tree (Phonebook)**:
    * Good for: "Find Smith". (Sorted Alphabetically).
    * Bad for: "Find people who like 'Pizza'". (Tags are inside the person, not sorted).
2. **GIN (Textbook Index)**:
    * Back of the book: "Pizza: Pages 5, 12, 88".
    * *Query*: "Find pages with Pizza". -> Look up "Pizza" once. Done.
3. **GiST (R-Tree / Map)**:
    * "Find restaurants within 5 miles."
    * Instead of checking every address, draw a Box around the city. Discard everything outside.
4. **BRIN (The Chapter Summary)**:
    * "Chapter 1: Dates 1800-1850". "Chapter 2: Dates 1851-1900".
    * *Query*: "Find 1860". -> Skip Chapter 1. Scan Chapter 2.
    * *Size*: Tiny. Very fast for Time-Series.

---

## The Technical Deep Dive

### 1. GIN (Generalized Inverted Index)

Designed for **Composite Values** (Arrays, JSON, Text Search).

* **Scenario**: `tags = ['sql', 'python', 'java']`.
* **Query**: `WHERE 'python' = ANY(tags)`.
* **B-Tree**: Useless. It sorts `['java'...]` before `['sql'...]`. It can't see *inside*.
* **GIN**:
  * Splits the array keys:
  * `python` -> Row 1, Row 5.
  * `java` -> Row 1, Row 8.
* **Performance**: 100x faster for "Contains" queries.

### 2. GiST (Generalized Search Tree)

Designed for **Overlapping Ranges** and **Geometry**.

* **Scenario**: `booking_range = '[10:00, 12:00)'`.
* **Query**: `WHERE booking_range && '[11:00, 13:00)'`. (Overlaps).
* **Algorithm**: Uses a hierarchy of bounding boxes.
* **Use Case**: PostGIS (Maps), Exclusion Constraints.

### 3. BRIN (Block Range Index)

Designed for **Correlated Data** (Time Series).

* **Scenario**: 1 Billion rows of `logs` sorted by `timestamp`.
* **B-Tree**: Stores one entry per row. (Huge size: 20GB).
* **BRIN**: Stores Min/Max for every 1MB block on disk.
  * Block 1: "Min 10:00, Max 10:05".
  * Block 2: "Min 10:05, Max 10:10".
* **Size**: 50KB. (Tiny).
* **Speed**: "Skip 99% of the table".

### 4. Partial, Covering, and Hash Indexes

Beyond the four headline index types, three lighter-weight patterns solve narrow problems extremely well:

* **Partial Index** — `CREATE INDEX idx_active_users ON users(email) WHERE status = 'active';`
  Only indexes the rows matching the `WHERE` clause. If 95% of your `users` table is inactive/churned accounts you never query, a partial index on just the active 5% is dramatically smaller and faster to maintain than indexing the whole table. **Use case**: any table with a "soft delete" or status flag where most queries filter to one status.
* **Covering Index** — `CREATE INDEX idx_orders_covering ON orders(customer_id) INCLUDE (order_date, total);`
  Stores extra columns *inside* the index itself (not just the indexed column), so Postgres can answer a query entirely from the index without touching the heap (an "Index-Only Scan"). **Use case**: a hot lookup query like `SELECT order_date, total FROM orders WHERE customer_id = 5` that only needs a few columns.
* **Hash Index** — `CREATE INDEX idx_session_token ON sessions USING HASH(token);`
  Smaller and marginally faster than a B-Tree for pure equality (`=`) lookups, but cannot support range queries (`<`, `>`, `BETWEEN`) or sorting. **Use case**: a session-token or UUID lookup table where every query is an exact-match `WHERE token = '...'`.

---

## Senior-Level Insights

### The Write Penalty

* **B-Tree**: Fast to update. (Change 1 leaf).
* **GIN**: Slow to update. (Change 10 inverted entries).
* **Outcome**: Don't put GIN on a high-velocity transactional table unless you use `Fast Update` (Buffer).

> ⚠️ Pitfall: GIN Write Amplification
>
> **Impact (quantified)**: A GIN index doesn't store one entry per row — it stores one entry *per indexed key*. A single `INSERT` into a row with a 20-element `tags` array forces Postgres to write 20 separate inverted-index entries (one per tag), not 1. On a table receiving 10,000 inserts/second with an average of 20 tags each, that's 200,000 index-entry writes/second from GIN alone — versus ~10,000 writes/second for a single-column B-Tree on the same table.
> **Detection**: Watch `pg_stat_user_tables.n_tup_ins`/`n_tup_upd` growth rate against your GIN index's write latency in `pg_stat_statements`; a disproportionate slowdown on insert-heavy workloads after adding a GIN index is the signature.
> **Mitigation — Fast Update Buffer**: `CREATE INDEX idx_tags ON books USING GIN(tags) WITH (fastupdate = on);` (this is the default). Instead of immediately inserting each new key into the main GIN structure, Postgres appends new entries to a small unordered "pending list" in memory/temp pages. Periodically (or when the pending list fills up, or `VACUUM`/`gin_clean_pending_list()` runs), the pending list is merged into the main index in one batch — which is far cheaper than thousands of individual tree insertions. The trade-off: reads must also check the pending list, so very large unmerged pending lists slightly slow down queries until the next cleanup.

### Index Bloat

* **Problem**: Indexes grow faster than tables.
* **Fix**: `REINDEX CONCURRENTLY` periodically.
* **Tip**: If an index is larger than the table, check if you have duplicate indexes or unused indexes (`pg_stat_user_indexes`).

---

## Decision Table: Choosing the Right Index

| Index Type | Best Column Type | Best Query Operator | Write Overhead | Size Overhead |
|---|---|---|---|---|
| **B-Tree** | Scalar (int, text, date) | `=`, `<`, `>`, `BETWEEN`, `ORDER BY` | Low (single leaf update) | Moderate (e.g., 18 MB for 1M timestamptz rows) |
| **GIN** | Arrays, JSONB, full-text (`tsvector`) | `@>`, `?`, `ANY()`, `@@` | High (one write per indexed key) | Moderate-High (depends on key cardinality) |
| **GiST** | Ranges, geometric types | `&&` (overlap), `<->` (nearest-neighbor), `@>` (contains) | Moderate (tree rebalancing) | Moderate |
| **BRIN** | Naturally sorted/correlated (timestamps, sequential IDs) | `=`, `<`, `>`, `BETWEEN` (range scans only) | Very Low (only updates block summary) | Tiny (e.g., 24 KB for 1M rows) |

---

## Hands-on Lab

### Exercise 1: The Tag Search (GIN)

**Goal**: Search arrays.

```sql
-- Step 1: Create and seed 100k rows with random tags
CREATE TABLE books (id serial, tags text[]);

INSERT INTO books (tags)
SELECT ARRAY(
  SELECT (ARRAY['fantasy','sci-fi','horror','romance','mystery','biography'])[floor(random() * 6 + 1)]
  FROM generate_series(1, 3)
)
FROM generate_series(1, 100000);

-- Step 2: Slow path — no index yet
EXPLAIN ANALYZE
SELECT * FROM books WHERE 'fantasy' = ANY(tags);

-- Step 3: Build the GIN index
CREATE INDEX idx_tags ON books USING GIN(tags);

-- Step 4: Fast path — same query, now indexed
EXPLAIN ANALYZE
SELECT * FROM books WHERE 'fantasy' = ANY(tags);
```

**Expected result**:

```
-- Step 2 (before index):
Seq Scan on books  (cost=0.00..2334.00 rows=16667 width=36) (actual time=0.020..12.840 rows=16530 loops=1)
  Filter: ('fantasy'::text = ANY (tags))
Execution Time: 13.102 ms

-- Step 4 (after index):
Bitmap Heap Scan on books  (cost=64.45..1234.10 rows=16667 width=36) (actual time=0.512..1.890 rows=16530 loops=1)
  Recheck Cond: ('fantasy'::text = ANY (tags))
  ->  Bitmap Index Scan on idx_tags  (cost=0.00..60.78 rows=16667 width=0) (actual time=0.380..0.380 rows=16530 loops=1)
        Index Cond: (tags @> '{fantasy}'::text[])
Execution Time: 2.015 ms
```

The Seq Scan checks all 100,000 rows (~13ms); the Bitmap Heap Scan uses the GIN index to jump directly to matching rows (~2ms) — roughly **6-7x faster**, and the gap widens further as table size grows.

### Exercise 2: The Geo Search (GiST)

**Goal**: Find overlap.

```sql
CREATE TABLE reservations (id serial, room text, during tsrange);

INSERT INTO reservations (room, during) VALUES
  ('Room A', '[2024-01-01 09:00, 2024-01-01 10:30)'),
  ('Room A', '[2024-01-01 13:00, 2024-01-01 14:00)'),
  ('Room B', '[2024-01-01 10:00, 2024-01-01 11:00)');

-- Slow (no index): full scan checking range overlap on every row
EXPLAIN ANALYZE
SELECT * FROM reservations WHERE during && '[2024-01-01 10:00, 2024-01-01 11:00)';

-- Fast: build the GiST index
CREATE INDEX idx_res ON reservations USING GiST(during);
```

**Expected result**: before indexing, `EXPLAIN ANALYZE` shows `Seq Scan on reservations` with a `Filter` on the `&&` operator. After `CREATE INDEX ... USING GiST(during)`, re-running the same query on a larger seeded table (10k+ rows) shows `Bitmap Heap Scan` / `Index Scan using idx_res`, confirming Postgres can now prune non-overlapping ranges using the GiST bounding structure instead of checking every row.

### Exercise 3: The Time Series (BRIN)

**Goal**: Index a massive table cheaply and compare size against B-Tree.

```sql
-- Step 1: Seed 1M rows of naturally-ordered time-series data
CREATE TABLE sensor_logs (id serial, time timestamptz, val numeric);

INSERT INTO sensor_logs (time, val)
SELECT now() + (i * interval '1 second'), random() * 100
FROM generate_series(1, 1000000) i;

-- Step 2: Build both index types for comparison
CREATE INDEX idx_btree ON sensor_logs USING BTREE(time);
CREATE INDEX idx_brin ON sensor_logs USING BRIN(time);

-- Step 3: Compare sizes
SELECT pg_size_pretty(pg_relation_size('idx_btree')) AS btree_size,
       pg_size_pretty(pg_relation_size('idx_brin'))  AS brin_size;
```

**Expected result**:

```
 btree_size | brin_size
------------+-----------
 18 MB      | 24 kB
```

The B-Tree stores one entry per row (1M entries), while BRIN stores only a Min/Max summary per 1MB block (roughly 128 rows per block by default) — a **~750x size reduction** for data that is physically inserted in time order. Querying `WHERE time BETWEEN '...' AND '...'` against the BRIN index lets Postgres skip entire blocks whose Min/Max range doesn't overlap the filter, scanning a fraction of the table.

---

## Mastery Check

### Question 1: JSON

If I want to search for `{"user_id": 5}` inside a JSONB column, which index do I use?
A) B-Tree.
B) GIN.
C) Hash.
D) BRIN.

<details>
<summary>Click for Answer</summary>

**Answer: B**
GIN handles JSONB key/value lookups perfectly via `jsonb_path_ops`.
</details>

### Question 2: BRIN Constraint

What is the requirement for BRIN to work effectively?
A) The data must be physically sorted (or highly correlated) on disk.
B) The data must be random.
C) The data must be text.
D) You must use SSDs.

<details>
<summary>Click for Answer</summary>

**Answer: A**
Picture three 1MB disk blocks, each holding ~128 rows. If the table is sorted by `time` (correlated), Block 1 might summarize "Min 09:00:00, Max 09:02:08", Block 2 "Min 09:02:09, Max 09:04:15", Block 3 "Min 09:04:16, Max 09:06:30" — narrow, non-overlapping ranges. A query for `WHERE time = '09:05:00'` can immediately skip Blocks 1 and 2 because the target falls outside their Min/Max range, scanning only Block 3.

Now picture the same three blocks holding *randomly ordered* timestamps (e.g., inserted out of order or after a `random()`-based shuffle). Block 1 might now contain rows spanning 08:00:00 through 23:59:59, and so might Blocks 2 and 3 — because rows were written in arbitrary time order. Every block's Min/Max range now covers almost the entire dataset ("0 to Infinity," practically speaking). A query for `09:05:00` can no longer rule out *any* block, since all three ranges include that value — so BRIN degrades to scanning every block anyway, providing zero pruning benefit despite the index existing.
</details>

### Question 3: PostGIS

Which index is standard for Geospatial data (Lines, Polygons)?
A) GiST.
B) GIN.
C) B-Tree.
D) List.

<details>
<summary>Click for Answer</summary>

**Answer: A**
R-Trees implementation.
</details>

### Question 4: Update Speed

Which index is slowest to update (Write)?
A) Hash.
B) B-Tree.
C) GIN.
D) None.

<details>
<summary>Click for Answer</summary>

**Answer: C**
Because one row insert might require updating 50 keys in the inverted index.
</details>

### Question 5: B-Tree

Can a B-Tree index handle `WHERE column LIKE '%hello'` (Leading Wildcard)?
A) Yes.
B) No.
C) Only if using `text_pattern_ops`.
D) Sometimes.

<details>
<summary>Click for Answer</summary>

**Answer: B**
B-Trees are prefix-sorted. Use `pg_trgm` (GIN/GiST) for full-text search.
</details>

---

## Glossary

| Term | Definition |
|---|---|
| **B-Tree** | The default Postgres index type; a balanced sorted-tree structure ideal for equality and range comparisons on scalar values (numbers, text, dates). |
| **GIN (Generalized Inverted Index)** | An index that maps individual keys *inside* a composite value (array elements, JSONB keys, text-search lexemes) back to the rows containing them — like a textbook's back-of-book index. |
| **GiST (Generalized Search Tree)** | An index using a hierarchy of bounding shapes (e.g., bounding boxes) to efficiently answer "overlap" and "nearest neighbor" queries on ranges and geometric data. |
| **BRIN (Block Range Index)** | A tiny index that stores only the Min/Max summary for each physical block of a table; effective only when the indexed column is naturally sorted/correlated with disk order. |
| **Inverted Index** | A general data-structure pattern (used by GIN) that maps "value -> list of locations containing that value," the opposite direction of a normal forward index. |
| **Index Bloat** | Wasted space in an index caused by dead tuples (from updates/deletes) accumulating faster than `VACUUM` reclaims them; detected by comparing index size to expected row count. |
| **REINDEX CONCURRENTLY** | Rebuilds an index from scratch without taking an exclusive lock that blocks reads/writes — the production-safe way to fix bloat or corruption. |
| **Bitmap Heap Scan** | A query-execution step that first builds an in-memory bitmap of matching row locations (often from a GIN or B-Tree Bitmap Index Scan), then fetches those specific rows from the table heap. |
| **Block Range** | The unit BRIN summarizes — a contiguous physical range of disk pages (1MB / ~128 rows by default) for which BRIN stores one Min/Max entry. |

---

## Summary

Today you learned:

* ✅ **GIN**: The "Inverted Index" for Arrays and JSON.
* ✅ **GiST**: The "Geometric Index" for ranges and maps.
* ✅ **BRIN**: The "Big Data Index" for time-series (Tiny size).
* ✅ **Trade-offs**: Writes vs Reads vs Size.

**Tomorrow**: We ensure data integrity with **Transactions & Concurrency**.

---

## 🚨 Escalating Incident Drill Track (Days 97–108)

### Day 103 Spotlight Drill: The Stalled Overnight Index Build

**Scenario**: An overnight job kicked off `CREATE INDEX idx_orders_customer ON orders(customer_id)` on a 500-million-row `orders` table. The maintenance window ended hours ago, the job's process appears to have died, and the on-call engineer needs to know: is the index half-built and corrupt, is it safe to just re-run the command, and will retrying block production writes?

**Required steps**:

1. Check whether the original `CREATE INDEX` is still running or already dead: `SELECT * FROM pg_stat_progress_create_index;` — if a row exists, note the `phase` column (e.g., `building index`, `index validation`) and `blocks_done` / `blocks_total` to estimate how far it got.
2. If no row appears in `pg_stat_progress_create_index`, the backend died. Check `pg_index` for a leftover invalid entry: `SELECT indexrelid::regclass, indisvalid, indisready FROM pg_index WHERE indisvalid = false;` — a non-concurrent `CREATE INDEX` that crashes mid-build can leave a broken, unusable index entry that silently consumes disk space and confuses the planner.
3. Drop any invalid leftover index (`DROP INDEX idx_orders_customer;` — safe, since `indisvalid = false` means it was never usable) before retrying.
4. Restart safely using `CREATE INDEX CONCURRENTLY idx_orders_customer ON orders(customer_id);` instead of a plain `CREATE INDEX` — concurrent builds avoid the `ACCESS EXCLUSIVE` lock that would otherwise block all writes to `orders` for the multi-hour duration of indexing 500M rows. Note the trade-off: `CONCURRENTLY` takes roughly 2x as long and cannot run inside a transaction block, but production stays fully writable throughout.
5. Write a one-paragraph post-incident note recommending all future large-table index builds use `CONCURRENTLY` by default, with `pg_stat_progress_create_index` added to the on-call dashboard so a stalled build is visible in real time rather than discovered the next morning.

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
