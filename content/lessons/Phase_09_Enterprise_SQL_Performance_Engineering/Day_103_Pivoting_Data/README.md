---
day: 103
title: "Pivoting & Crosstabs"
phase: 9
phaseTitle: "Enterprise SQL Performance Engineering"
slug: "pivoting-data"
duration: 120
difficulty: "advanced"
tags:
  - pivot
  - crosstab
  - formatting
  - tablefunc
concepts:
  - "Row to Column Transformation (Pivot)"
  - "CASE WHEN Aggregation"
  - "Postgres FILTER Clause"
  - "Tablefunc (Crosstab)"
prerequisites:
  - "Intermediate Aggregations (GROUP BY)"
outcomes:
  - "Turn a vertical list of sales into a Month-by-Month matrix"
  - "Write a Pivot query without extension functions"
  - "Use `FILTER` for readable conditional sums"
---

# 🎯 Day 103: Pivoting & Crosstabs

> *"Managers love spreadsheets. Engineers love normalized tables. The Pivot query is the diplomatic treaty between them."*

---

## The "Never-Coded" Bridge

**The Tally Mark to The Scoreboard**

* **Raw Data (Normalized)**: A list of every shot made.
  * `Bob: 3 points`
  * `Alice: 2 points`
  * `Bob: 2 points`
* **Pivot Table (The Scoreboard)**:
  * Rows: Players.
  * Columns: Q1, Q2, Q3, Q4.
  * *Transformation*: We stop listing events vertically and start summing them horizontally.

---

## The Technical Deep Dive

### 1. The Manual Pivot (`CASE` / `FILTER`)

The standard SQL way to pivot.

* **Goal**: Sum sales by Month (Columns) per Region (Rows).
* **Syntax**:

    ```sql
    SELECT 
        region,
        SUM(case when month = 'Jan' then amount else 0 end) as jan_sales,
        SUM(case when month = 'Feb' then amount else 0 end) as feb_sales
    FROM sales
    GROUP BY region;
    ```

* **Modern Postgres**:

    ```sql
    SUM(amount) FILTER (WHERE month = 'Jan') as jan_sales
    ```

### 2. The `crosstab` Function

Part of the `tablefunc` extension.

* **Concept**: Rotates a result set.
* **Requirement**: Query must return 3 columns:
    1. Row Name (Region)
    2. Category (Month)
    3. Value (Amount)
* **Code**:

    ```sql
    SELECT * FROM crosstab(
        'SELECT region, month, amount FROM sales ORDER BY 1,2'
    ) AS ct(region text, jan int, feb int, ...);
    ```

* *Pros*: Less typing. *Cons*: You still have to define output columns manually.

### 3. Dynamic Pivoting?

* **Question**: "Can I make columns for *every* month automatically without typing them?"
* **Answer**: No. SQL requires fixed column definitions at compile time.
* **Workaround**: Generate JSON. `jsonb_object_agg(month, amount)`.

---

## Senior-Level Insights

### Reporting in DB vs BI Tool

* **Scenario**: CEO wants a Pivot Table.
* **Option A**: Write complex SQL with `crosstab`. (Hard to maintain).
* **Option B**: `SELECT * FROM sales` and let Tableau/Excel pivot it. (Easy).
* **Advice**: Only Pivot in SQL if the *Application* specifically needs that format (e.g., a chart library). For humans, use BI tools.

### The "Sparse Matrix" Problem

* **Scenario**: 1000 Products (Rows) x 1000 Stores (Columns).
* **Result**: 1 Million cells. 90% are zero.
* **Performance**: Pivoting this in SQL is memory intensive. It essentially constructs a massive 2D array in RAM.

---

## Hands-on Lab

### Exercise 1: The Manual Pivot

**Goal**: Use `FILTER`.

**Data**: `grades (student, subject, score)`.
**Task**: Show students as rows, subjects (Math, Science) as columns.

```sql
SELECT
    student,
    MAX(score) FILTER (WHERE subject = 'Math') AS math_score,
    MAX(score) FILTER (WHERE subject = 'Science') AS science_score
FROM grades
GROUP BY student;
```

### Exercise 2: The Crosstab

**Goal**: Use `tablefunc`.

1. `CREATE EXTENSION tablefunc;`
2. `SELECT * FROM crosstab(...)`.
3. *Note*: Match the output definition AS `(name text, val1 int, val2 int)` exactly.

### Exercise 3: The JSON Approach (Dynamic)

**Goal**: flexible columns.

```sql
SELECT
    student,
    jsonb_object_agg(subject, score) AS report_card
FROM grades
GROUP BY student;
```

* Output: `{"Math": 90, "Science": 85}`.

---

## Mastery Check

### Question 1: Syntax

What is the modern Postgres replacement for `CASE WHEN condition THEN val ELSE 0 END` in aggregations?
A) `FILTER (WHERE condition)`.
B) `PIVOT`.
C) `WHERE condition`.
D) `HAVING condition`.

<details>
<summary>Click for Answer</summary>

**Answer: A**
Cleaner syntax standard in SQL:2003.
</details>

### Question 2: Crosstab limits

Can `crosstab` automatically determine the number of output columns?
A) Yes.
B) No, you must define the output schema (names and types) explicitly in the `AS (...)` clause.
C) Only in Oracle.
D) Yes, if you use AI.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Strict static typing in SQL prevents dynamic columns.
</details>

### Question 3: JSON Aggregation

Why is `jsonb_object_agg` often better than `crosstab`?
A) It handles dynamic keys (new subjects added tomorrow) without changing the query.
B) It is faster.
C) It looks prettier.
D) It sorts automatically.

<details>
<summary>Click for Answer</summary>

**Answer: A**
Flexibility vs Structure.
</details>

### Question 4: Use Case

When should you Pivot in SQL?
A) Always.
B) When the consumer (App/Frontend) expects a specific JSON/Columnar format.
C) When you want to save space.
D) Never.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Transformation should happen where it provides value.
</details>

### Question 5: Extension

Which extension is required for `crosstab`?
A) `pg_trgm`.
B) `tablefunc`.
C) `hstore`.
D) `postgis`.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Standard built-in extension.
</details>

---

## Summary

Today you learned:

* ✅ **Manual Pivot**: `FILTER` clauses for readability.
* ✅ **Crosstab**: The `tablefunc` way for strict matrices.
* ✅ **JSON Pivot**: The dynamic solution for unknown columns.
* ✅ **BI Tool Offloading**: Knowing when *not* to pivot in SQL.

**Tomorrow**: We structure our data correctly with **Database Design & Normalization**.

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
