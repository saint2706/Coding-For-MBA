---
day: 105
title: "JSON & NoSQL in SQL"
phase: 9
phaseTitle: "Enterprise SQL Performance Engineering"
slug: "json-nosql"
duration: 120
difficulty: "advanced"
tags:
  - jsonb
  - nosql
  - gin-index
  - document-store
concepts:
  - "JSONB vs JSON (Binary vs Text)"
  - "Querying JSON (->, ->>, @>)"
  - "Indexing JSON (GIN)"
  - "Hybrid Multi-Model Databases"
prerequisites:
  - "Basic SELECT"
outcomes:
  - "Store and Query a User Profile Document"
  - "Index a nested JSON field for millisecond lookups"
  - "Update a specific key inside a JSON blob"
---

# 🎯 Day 105: JSON & NoSQL in SQL

> *"The flexibility of MongoDB. The reliability of Postgres. Why choose one?"*

---

## The "Never-Coded" Bridge

**The Form vs The Box**

* **Relational (The Form)**:
  * Name: [___]
  * Age: [___]
  * *Rule*: You strictly fill in the boxes. If you have a "Middle Name" and the form doesn't ask for it, you can't add it.
* **NoSQL/JSON (The Box)**:
  * Here is a cardboard box. Put whatever you want inside.
  * Person A puts in a photo.
  * Person B puts in a sandwich.
  * *Flexibility*: Infinite.
  * *Chaos*: Also infinite. (How do you "Sort by Sandwich"?)

---

## The Technical Deep Dive

### 1. JSONB vs JSON

Postgres has two types:

* **JSON**: Stores the exact text you type (including whitespace). Slow to query (must re-parse every time).
* **JSONB (Binary)**: Decomposes the JSON into a binary tree.
  * Removes whitespace.
  * Sorts keys.
  * **Supports Indexing**.
  * *Verdict*: Always use `JSONB`.

### 2. Operators

* `->` : Get JSON object (Result is JSON).
* `->>` : Get Text (Result is Text).
* `@>` : Contains. (Does the document contain `{"role": "admin"}`?).

### 3. GIN Indexing (The Secret Weapon)

* **Problem**: Querying `WHERE data->>'email' = 'bob@x.com'` is slow (Seq Scan).
* **Solution**: `CREATE INDEX idx_data ON users USING GIN(data)`.
* **Result**: Postgres indexes *every key and value* in the document using an Inverted Index.

---

## Senior-Level Insights

### The "Schema Evolution" Hack

* **Scenario**: Analytics team wants to track 50 new events per week.
* **Relational**: `ALTER TABLE` 50 times a week. (Nightmare).
* **Hybrid**: `CREATE TABLE events (id serial, timestamp ts, payload jsonb)`.
  * Store key fields (Time, UserID) as Columns (Fast).
  * Store variable fields (Mouse X, Referrer) as JSONB (Flexible).

### Update Performance

* **Warning**: Updating one key in a 10MB JSONB document rewrites the *entire* 10MB document.
* **Advice**: Don't use JSONB for frequently modified data. Use it for "Read-Mostly" documents (Config, Profiles).

---

## Hands-on Lab

### Exercise 1: The Document Store

**Goal**: Insert and Query.

1. `CREATE TABLE products (id serial, info jsonb)`.
2. `INSERT INTO products(info) VALUES ('{"name": "TV", "specs": {"res": "4K"}}')`.
3. Query: `SELECT info->>'name' FROM products WHERE info->'specs'->>'res' = '4K'`.

### Exercise 2: The Search (GIN)

**Goal**: Speed it up.

1. Insert 10,000 rows.
2. `EXPLAIN ANALYZE SELECT * FROM products WHERE info @> '{"color": "red"}'`. (Seq Scan).
3. `CREATE INDEX idx_products ON products USING GIN(info)`.
4. Run Explain again. (Bitmap Heap Scan).

### Exercise 3: The Update

**Goal**: Modify in place.

* **Task**: Change "TV" to "OLED TV".
* **SQL**: `UPDATE products SET info = jsonb_set(info, '{name}', '"OLED TV"') WHERE id = 1`.

---

## Mastery Check

### Question 1: Data Type

Which data type should you use for JSON storage in Postgres?
A) `TEXT`.
B) `JSON`.
C) `JSONB`.
D) `BLOB`.

<details>
<summary>Click for Answer</summary>

**Answer: C**
Binary format allows indexing and fast lookup.
</details>

### Question 2: Querying

What does the operator `->>` return?
A) A JSON Object.
B) A Text String.
C) A Number.
D) An Error.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Useful for comparisons: `WHERE col->>'status' = 'active'`.
</details>

### Question 3: Indexing

Can B-Tree indexes index a JSONB column?
A) Yes, fully.
B) No, only GIN indexes work well for arbitrary JSON searches.
C) Yes, but only the first character.
D) Only on Sundays.

<details>
<summary>Click for Answer</summary>

**Answer: B**
(You *can* put a B-Tree on a specific expression like `(data->>'id')`, but not the whole blob).
</details>

### Question 4: Update Cost

What happens when you update a `JSONB` column?
A) Only the changed bytes are written.
B) The entire new column value is written to disk (Copy-on-Write).
C) Nothing happens.
D) It converts to XML.

<details>
<summary>Click for Answer</summary>

**Answer: B**
This causes "Write Amplification". NoSQL DBs like Mongo are optimized for partial updates; Postgres is not.
</details>

### Question 5: Use Case

When should you use JSONB?
A) For Primary Keys.
B) For semi-structured data (e.g., User Config, Event Logs) that changes schema often.
C) For everything.
D) For huge binary files.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Hybrid approach is best.
</details>

---

## Summary

Today you learned:

* ✅ **JSONB**: The superior storage format.
* ✅ **GIN**: Making JSON searchable.
* ✅ **Operators**: Navigating the tree (`->`, `@>`).
* ✅ **Trade-off**: Flexibility vs Write Performance.

**Tomorrow**: We handle legacy data formats with **XML & Complex Data**.

---

## 🚨 Escalating Incident Drill Track (Days 97–108)

Use these three drills as a connected simulation sequence. Each drill is intentionally harder than the previous one and must be completed with production-style evidence.

### Drill 1 (Severity 2): Performance degradation under peak load

**Scenario**: During peak checkout traffic, API latency jumps from 120ms to 2.8s, and dashboards show CPU saturation on the primary database.

**Required outputs**:

1. **Root-cause analysis using query plans and schema objects**
   - Capture `EXPLAIN (ANALYZE, BUFFERS)` for the top 3 slow statements from `pg_stat_statements`.
   - Identify the dominant bottleneck (e.g., sequential scans, stale stats, sort spill, lock waits).
   - Map the issue to schema objects (specific index, table, materialized view, partition, or join path).
2. **Mitigation patch strategy and rollback criteria**
   - Propose a low-risk patch (index change, query rewrite, refresh strategy, stats maintenance, or connection throttling).
   - Define rollout steps, canary checks, and explicit rollback triggers (p95 latency, error rate, lock queue depth, CPU threshold).
3. **Post-incident report**
   - Summarize business impact (checkout conversion, order delay, SLA breach duration).
   - Document prevention controls (capacity threshold alerting, index review checklist, load-test gate before release).
   - Add monitoring updates (query-plan drift alert, wait-event dashboard, incident runbook links).

### Drill 2 (Severity 1): Security policy breach involving row-level access

**Scenario**: A regional sales manager can query customer rows from another region due to a row-level security policy regression.

**Required outputs**:

1. **Root-cause analysis using query plans and schema objects**
   - Reproduce the leak using a least-privilege role and capture relevant SQL.
   - Inspect policy definitions (`pg_policies`), grants, security-definer functions, and view ownership chains.
   - Use query plans to show where policy filters are bypassed or pushed incorrectly.
2. **Mitigation patch strategy and rollback criteria**
   - Provide an emergency containment patch (policy fix, revoke path, view hardening, function privilege correction).
   - Define validation tests for allowed vs denied row sets per role.
   - Set rollback criteria tied to false-deny rate, support-ticket spike, and audit-log anomalies.
3. **Post-incident report**
   - Quantify business/compliance impact (records exposed, jurisdictions affected, notification obligations).
   - List prevention controls (policy-as-code review, CI policy simulation, privileged object inventory).
   - Add monitoring updates (cross-tenant access detectors, policy-change alerts, immutable audit retention).

### Drill 3 (Severity 1 / Executive Escalation): Data correctness regression from trigger/procedure change

**Scenario**: A trigger/procedure deployment silently double-counts revenue in month-end reporting and breaks finance reconciliation.

**Required outputs**:

1. **Root-cause analysis using query plans and schema objects**
   - Diff trigger/procedure versions and execution order; trace writes across dependent tables/views.
   - Use plans and dependency metadata (`pg_trigger`, `pg_proc`, `pg_depend`) to locate duplicate or missing mutations.
   - Build a minimal reproducible dataset proving the correctness gap.
2. **Mitigation patch strategy and rollback criteria**
   - Deliver a hotfix plan (procedure correction + backfill/reconciliation script) with idempotency guarantees.
   - Include data repair strategy for already-corrupted records and freeze windows for risky writes.
   - Define rollback criteria based on reconciliation deltas, financial control checks, and downstream report parity.
3. **Post-incident report**
   - Summarize business impact (close-delay, misstated KPI exposure, executive communication timeline).
   - Document prevention controls (change contracts for triggers, shadow writes, dual-run verification, release checklist).
   - Add monitoring updates (data quality assertions, ledger-vs-fact drift alarms, automated reconciliation jobs).

