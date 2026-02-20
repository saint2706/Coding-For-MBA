---
day: 106
title: "XML & Complex Data Types"
phase: 9
phaseTitle: "Enterprise SQL Performance Engineering"
slug: "xml-complex-types"
duration: 120
difficulty: "advanced"
tags:
  - xml
  - arrays
  - enums
  - composites
concepts:
  - "Querying XML (xpath)"
  - "Arrays in SQL (Slicing, Unnesting)"
  - "ENUM Types (Static Dropdowns)"
  - "Composite Types (Structs)"
prerequisites:
  - "Basic Data Types"
outcomes:
  - "Extract data from a legacy XML column"
  - "Store a list of tags in a single column (Array)"
  - "Enforce state transitions with ENUMs"
---

# 🎯 Day 106: XML & Complex Data Types

> *"The past is XML. The present is JSON. The future is... probably still a CSV file someone emailed you."*

---

## The "Never-Coded" Bridge

**The Toolbox**

* **Standard SQL (Hammer)**: Integers, Text, Dates. (Simple, effective).
* **The Weird Stuff (Specialty Tools)**:
  * **XML**: The rusty wrench. Old, verbose, but sometimes you find a pipe that only it can turn.
  * **Arrays**: The socket set. Holds multiple items of the same size in one box.
  * **ENUMs**: The shape sorter. Only "Square", "Circle", or "Triangle" fit. Try to put a "Star" in? Rejected.

---

## The Technical Deep Dive

### 1. XML in SQL

Legacy systems (SOAP, Enterprise Java) love XML.

* **Type**: `XML`. Validates the syntax.
* **Query**: `xpath('/book/title/text()', data)`.
* **Performance**: Slower than JSONB. No binary storage format in standard Postgres.

### 2. Arrays

Postgres allows columns to be arrays.

* **Def**: `tags text[]`.
* **Insert**: `VALUES (ARRAY['sql', 'db'])`.
* **Query**: `WHERE 'sql' = ANY(tags)`.
* **Unnest**: `SELECT unnest(tags) FROM table`. Expands 1 row into N rows.

### 3. ENUMs (Enumerated Types)

Restricts a column to a fixed list.

* **Create**: `CREATE TYPE status AS ENUM ('open', 'closed', 'pending');`
* **Benefit**: Data Integrity. Uses 4 bytes (int) internally, saves space vs Text.
* **Downside**: Adding a new value requires `ALTER TYPE`.

---

## Senior-Level Insights

### The "Array vs Join" Debate

* **Junior**: "I'll store `order_ids` as an array `[1, 2, 5]` in the User table to avoid a Join!"
* **Senior**: "Don't."
  * *Why*: You lose Foreign Key constraints. You can't ensure Order 5 actually exists.
  * *Exception*: Tags. It's okay if a tag doesn't exist in a master list.

### XML: The Legacy Burden

* **Reality**: You will eventually inherit a DB with a `config_xml` column.
* **Strategy**: Don't convert it to JSON unless you have to. Postgres treats XML as a first-class citizen. Index it with Functional Indexes if needed.

---

## Hands-on Lab

### Exercise 1: The XML Extraction

**Goal**: Parse legacy data.

1. `CREATE TABLE library (id serial, doc xml)`.
2. `INSERT INTO library(doc) VALUES ('<book><title>SQL 101</title></book>')`.
3. Query: `SELECT xpath('//title/text()', doc) FROM library`.

### Exercise 2: Array Math

**Goal**: Manage vectors.

1. `CREATE TABLE vectors (id serial, coords int[])`.
2. `INSERT INTO vectors(coords) VALUES (ARRAY[1, 2, 3]), (ARRAY[4, 5, 6])`.
3. **Task**: Find vectors where the 2nd coordinate is 5.
    * `SELECT * FROM vectors WHERE coords[2] = 5`.

### Exercise 3: The ENUM Trap

**Goal**: Understand rigidity.

1. `CREATE TYPE mood AS ENUM ('happy', 'sad')`.
2. `CREATE TABLE person (current_mood mood)`.
3. `INSERT INTO person VALUES ('happy')`.
4. **Fail**: `INSERT INTO person VALUES ('angry')`. (Error: invalid input value for enum mood: "angry").
5. **Fix**: `ALTER TYPE mood ADD VALUE 'angry'`.

---

## Mastery Check

### Question 1: Arrays

How do you turn an Array `['a', 'b']` into two rows?
A) `unnest()`.
B) `expand()`.
C) `split()`.
D) `explode()`.

<details>
<summary>Click for Answer</summary>

**Answer: A**
`unnest(col)` is the reverse of `array_agg(col)`.
</details>

### Question 2: ENUMs

Why use an ENUM instead of a Foreign Key to a 'Statuses' table?
A) Performance (No Join needed) and Space (4 bytes vs Text).
B) It is more flexible.
C) It allows any text.
D) It supports NULLs better.

<details>
<summary>Click for Answer</summary>

**Answer: A**
It's a micro-optimization for static lists (e.g., Days of Week).
</details>

### Question 3: XML

Can you index XML content?
A) Yes, using Functional Indexes (e.g., index the result of `xpath`).
B) No.
C) Yes, using GIN (like JSON).
D) Only in Oracle.

<details>
<summary>Click for Answer</summary>

**Answer: A**
`CREATE INDEX idx_title ON lib ((xpath('//title/text()', doc)::text))`.
</details>

### Question 4: Array Constraints

Can I enforce a Foreign Key on individual elements of an array column?
A) Yes.
B) No.
C) Only in Postgres 16.
D) Triggers only.

<details>
<summary>Click for Answer</summary>

**Answer: B**
This is the main argument against using Arrays for relationships.
</details>

### Question 5: Composite Types

What is a Composite Type?
A) A column that holds a Struct (e.g., `(x, y)` coordinates).
B) A Primary Key.
C) A Join.
D) A JSON.

<details>
<summary>Click for Answer</summary>

**Answer: A**
`CREATE TYPE point AS (x int, y int)`. Useful for standardized data structures.
</details>

---

## Summary

Today you learned:

* ✅ **XML**: Not dead yet. Handled via `xpath`.
* ✅ **Arrays**: Lists in a cell. Good for Tags, bad for Relationships.
* ✅ **ENUMs**: Strict, static, efficient categorization.
* ✅ **Unnest**: Exploding arrays into rows.

**Tomorrow**: We lock down the fortress with **Enterprise Security**.

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

