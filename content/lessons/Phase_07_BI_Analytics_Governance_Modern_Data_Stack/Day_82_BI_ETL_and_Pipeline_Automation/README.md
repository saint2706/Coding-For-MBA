---
day: 82
title: "BI ETL & Pipeline Automation"
phase: 7
phaseTitle: "BI Analytics, Governance & Modern Data Stack"
slug: "etl-pipelines"
duration: 120
difficulty: "advanced"
tags:
  - etl
  - elt
  - automation
  - airflow
  - python
concepts:
  - "Extract, Transform, Load (ETL) vs. ELT"
  - "Idempotency (Run it twice safely)"
  - "Dependency Management (DAGs)"
  - "Backfilling History"
prerequisites:
  - "Python Basics (Phase 1)"
  - "SQL (Day 73)"
outcomes:
  - "Write a robust ETL script in Python"
  - "Design a DAG for task dependency"
  - "Implement Error Handling and Retries"
---

# 🎯 Day 82: BI ETL & Pipeline Automation

> *"A pipeline that breaks at 3 AM is not a pipeline. It's a pager."*

---

## The "Never-Coded" Bridge

**Moving Houses (ETL vs ELT)**

**ETL (Old Way)**: Move furniture from Old House -> Sort/Clean on the Lawn -> Move into New House.

* *Pros*: Don't move junk.
* *Cons*: Slow. The Lawn (ETL Server) gets bottlenecked.

**ELT (Modern Way)**: Move EVERYTHING from Old House -> Dump into New House Garage -> Sort/Clean inside New House.

* *Pros*: Fast loading. Use the New House's big space (Cloud Warehouse) to sort.
* *Cons*: The Garage (Raw Zone) is messy.

**Automation**: Hiring a Robot Movers helper who works every night at 2 AM.

---

## The Technical Deep Dive

### 1. Idempotency (The Golden Rule)

If I run my script twice, what happens?

* **Bad**: It inserts the data again. (Result: Duplicate Revenue).
* **Good (Idempotent)**: It detects the data exists and does nothing (or overwrites it cleanly).
* **Pattern**: `DELETE FROM target WHERE date = 'today'; INSERT INTO target ...`

### 2. Dependency Management (DAGs)

**Directed Acyclic Graph**. Logic flow:

1. Verify Source API is Up -> 2. Download Data -> 3. Clean Data -> 4. Update Dashboard.

* If Step 2 fails, Step 3 *must not run*.
* Tools: **Apache Airflow**, **Prefect**, **Dagster**.

### 3. Backfilling

* **Scenario**: You changed the logic for "Profit" today.
* **Problem**: The historical data in the warehouse still uses the old logic.
* **Solution**: **Backfill**. Re-running the pipeline for `start_date='2020-01-01'` to `end_date='today'` to fix history.

### 4. Incremental Loading: Watermarks and CDC

Re-loading BrightCart's entire `orders` history every run doesn't scale. Two patterns solve "only load what's new":

* **Watermark (High-Water Mark)**: Track the maximum `updated_at` (or `order_id`) successfully loaded last run. Next run queries `WHERE updated_at > :last_watermark`. Simple, but misses updates to old rows if the source doesn't bump `updated_at` reliably.
* **CDC (Change Data Capture)**: Read the database's transaction log directly (e.g., Debezium reading Postgres WAL) to capture every insert/update/delete as an event, in order, even if the source table has no `updated_at` column at all. More complex to operate, but catches changes a watermark query would miss — including deletes, which a `WHERE updated_at > X` filter can never see.

### 5. Schema Changes, Transactions, and Data Contracts

* **Schema changes**: BrightCart's source system adds a new `orders.gift_wrap_flag` column. Does your pipeline crash, silently drop it, or pick it up? Schema-on-write pipelines need an explicit migration step; schema-on-read (lakehouse Bronze) tolerates it better but pushes the problem downstream.
* **Transactions**: When a load writes multiple tables (e.g., `fact_orders` and an aggregate rollup table), wrap the writes in a database transaction so a mid-load failure doesn't leave one table updated and the other stale — partial writes are a major source of "the dashboard doesn't match the detail report" tickets.
* **Data contracts**: A versioned, explicit agreement between the source-system team and the data team about schema, types, and semantics (e.g., "`orders.status` will only ever contain these 5 values, and we'll notify you 30 days before adding a 6th"). Contracts let pipelines fail loudly and early — at the API boundary — instead of silently downstream in a dashboard.
* **Quality gates**: The Phase 7 Day 80 data tests (uniqueness, completeness, validity) should run as a gate *inside* the pipeline, blocking promotion to the BI-facing layer if they fail — not as a separate, disconnected audit run days later.

### 6. Observability, SLOs, and Incident Runbooks

A pipeline needs the same observability discipline as the data flowing through it (Phase 7 Day 80): track run duration, row counts in/out, and freshness against an SLO ("orders pipeline completes by 6 AM ET, 99% of days"). When the SLO breaches, a **runbook** — a written, specific response procedure — beats improvising at 3 AM: who gets paged, what dashboard shows current pipeline health, what the safe rollback or pause procedure is, and when to escalate versus wait for the next scheduled retry.

---

## Senior-Level Insights

### The "3 AM Test"

* If a pipeline breaks, does it self-heal?
  * **Level 1**: It crashes silently. User finds out 3 days later. (Fired).
  * **Level 2**: It sends an email. You wake up at 3 AM to fix it. (Burnout).
  * **Level 3**: It retries 3 times, then alerts. (Better).
  * **Level 4**: It detects bad data *before* loading and alerts. Users see yesterday's stale (but correct) data. (Pro).

### ETL vs ELT: The Shift

* **ETL**: Python does the heavy lifting. Good for complex API parsing.
* **ELT**: Python just loads JSON to Snowflake. SQL (dbt) does the transformation. *Winning strategy in Modern Stack.*

### Choosing an Orchestrator: Criteria, Not Brand Names

Picking "Airflow because everyone uses it" is how teams end up fighting a tool that doesn't match their actual workload. Compare by criteria instead:

| Criterion | Airflow | Dagster | Prefect |
| :--- | :--- | :--- | :--- |
| **Core abstraction** | Tasks in a DAG (imperative, operator-based) | Software-defined "Assets" (data-aware, declarative) | Python-native "Flows" (dynamic, code-first) |
| **Best fit** | Large, mature teams with many scheduled batch DAGs and a big plugin ecosystem | Teams who want strong typing, testability, and asset lineage built in | Teams who want lightweight, dynamic Python workflows without heavy DSL boilerplate |
| **Local dev experience** | Historically heavier (webserver + scheduler + metadata DB) | Designed for local-first development and testing | Lightweight, fast to prototype |
| **Dynamic/conditional flows** | Harder (DAGs are largely static at parse time) | Native support for asset-based conditional logic | Strong — flows are just Python control flow |
| **BrightCart's pick** | If standardizing 200+ scheduled jobs across many teams with existing Airflow expertise | If the priority is data lineage and asset freshness tracking for the warehouse | If the team is small, ships fast, and wants minimal orchestration overhead |

### Batch vs. Streaming vs. Event-Driven: Decision Criteria

| Pattern | Latency | Cost/Complexity | Best For | BrightCart Example |
| :--- | :--- | :--- | :--- | :--- |
| **Batch** | Minutes to hours/days | Lowest — simple to reason about, easy to backfill | Reporting and analytics where "as of last night" is acceptable | Nightly load of `orders`/`order_items` into the star schema |
| **Streaming** | Seconds | Higher — requires stream infrastructure (Kafka/Kinesis), harder to backfill/replay correctly | Near-real-time operational dashboards or alerting | Live inventory-level alerts when a product's stock crosses a threshold |
| **Event-Driven** | Sub-second to seconds | Highest — requires event bus, idempotent consumers, and careful ordering guarantees | Triggering an immediate downstream action from a specific business event | Sending a "your order shipped" notification the instant `orders.status` flips to `shipped` |

**Decision rule of thumb**: default to batch unless a stakeholder can name the specific decision that needs to be made *faster* than the next batch window allows. Streaming and event-driven architectures cost real engineering complexity (replay semantics, exactly-once processing, backpressure) — don't pay that cost for a dashboard that's only looked at once a day.

---

## Hands-on Lab: An Idempotent BrightCart Pipeline

### Exercise 1: `reliable_load.py` — Idempotency, For Real This Time

**What**: A function that loads one day's worth of BrightCart `orders`/`order_items` into the `fact_orders` star schema (from Phase 7 Day 81), safely re-runnable any number of times.

**Why**: Orchestrators retry failed tasks automatically (that's the whole point of Day 82's "self-healing" levels). If a retry after a *partial* success re-inserts rows that already landed, revenue silently doubles. Idempotency is what makes "just retry it" a safe default instead of a landmine.

**Dependencies**: `pandas`, `sqlite3` (standard library, used here in place of a warehouse so the lab runs with zero setup).

**Contract**:
* **Input**: `load_date` (str, `'YYYY-MM-DD'`), `df` (DataFrame of that day's `order_items` joined to `orders`, matching the `fact_orders` columns from Phase 7 Day 81), `conn` (an open DB connection).
* **Output**: None (writes to the `fact_orders` table as a side effect); prints a row count.
* **Guarantee**: Calling this function 1 time or 50 times with the same `(load_date, df)` leaves the table in the *same final state* — this is the definition of idempotent.

**The flawed starting point** (the original lesson version — delete-then-insert is the right *idea*, but has no transaction boundary, no row-count verification, and is vulnerable to SQL injection via an unparameterized date string):

```python
def load_daily_sales(date, df, db_engine):
    # Step 1: Clear existing data for this date (Idempotency)
    sql = f"DELETE FROM sales WHERE sale_date = '{date}'"
    db_engine.execute(sql)

    # Step 2: Insert new data
    df.to_sql("sales", db_engine, if_exists="append", index=False)
    print(f"Loaded {len(df)} rows for {date}")
```

**Reference implementation** — corrected and complete, with a transaction boundary, parameterized SQL, and post-load verification:

```python
import sqlite3
import pandas as pd


def load_daily_orders(load_date: str, df: pd.DataFrame, conn: sqlite3.Connection) -> int:
    """Idempotently load one day of BrightCart fact_orders rows.

    Re-running this with the same (load_date, df) always leaves exactly
    len(df) rows for that date in fact_orders -- never more, never fewer.
    """
    cur = conn.cursor()
    try:
        # Single transaction: delete + insert succeed or fail together.
        cur.execute("BEGIN")
        cur.execute("DELETE FROM fact_orders WHERE order_date = ?", (load_date,))
        df.to_sql("fact_orders", conn, if_exists="append", index=False)
        conn.commit()
    except Exception:
        conn.rollback()
        raise

    # Verification: prove idempotency held, don't just assume it.
    row_count = cur.execute(
        "SELECT COUNT(*) FROM fact_orders WHERE order_date = ?", (load_date,)
    ).fetchone()[0]
    if row_count != len(df):
        raise RuntimeError(
            f"Idempotency check failed: expected {len(df)} rows for {load_date}, found {row_count}"
        )
    print(f"Loaded {row_count} rows for {load_date} (verified)")
    return row_count
```

**Why this is better**: the original deletes and inserts as two unguarded statements — if the process crashes between them, the table is left with *zero* rows for that date (data loss, not just duplication). Wrapping both in `BEGIN`/`commit`/`rollback` means a crash mid-load leaves the *previous* state intact, untouched, ready for a clean retry. The post-load count check turns "idempotent" from an assumption into something the function actually verifies on every run.

### Exercise 2: The Full Pipeline, With Injected Failures

**Goal**: Run `load_daily_orders` against a fixture that includes a duplicate-row scenario and a mid-load failure, and confirm the exact expected row counts after rerunning.

```python
import sqlite3
import pandas as pd

conn = sqlite3.connect(":memory:")
conn.execute("""
    CREATE TABLE fact_orders (
        order_id TEXT NOT NULL, customer_key INTEGER, product_key INTEGER,
        order_date TEXT, order_status TEXT, channel TEXT,
        quantity INTEGER, net_revenue REAL
    )
""")

# Day 1 fixture: 4 line items for 2026-06-18 (BrightCart orders O100-O102 from Day 81's lab)
day1 = pd.DataFrame([
    {"order_id": "O100", "customer_key": 1, "product_key": 10, "order_date": "2026-06-18",
     "order_status": "delivered", "channel": "web", "quantity": 2, "net_revenue": 90.00},
    {"order_id": "O100", "customer_key": 1, "product_key": 11, "order_date": "2026-06-18",
     "order_status": "delivered", "channel": "web", "quantity": 1, "net_revenue": 30.00},
    {"order_id": "O101", "customer_key": 2, "product_key": 10, "order_date": "2026-06-18",
     "order_status": "delivered", "channel": "app", "quantity": 1, "net_revenue": 50.00},
    {"order_id": "O102", "customer_key": 1, "product_key": 12, "order_date": "2026-06-18",
     "order_status": "returned", "channel": "web", "quantity": 1, "net_revenue": 80.00},
])

load_daily_orders("2026-06-18", day1, conn)
# Loaded 4 rows for 2026-06-18 (verified)

# SCENARIO A: The orchestrator retries the same task (e.g., after a network blip
# in a downstream step) and re-submits the IDENTICAL day1 fixture.
load_daily_orders("2026-06-18", day1, conn)
# Loaded 4 rows for 2026-06-18 (verified)  <-- still 4, not 8. Idempotency held.

print(conn.execute("SELECT COUNT(*) FROM fact_orders WHERE order_date = '2026-06-18'").fetchone()[0])
# 4

# SCENARIO B: Injected failure. A marketplace extract glitch produced a row with
# a NULL order_id (violates the fact_orders NOT NULL contract) -- this simulates
# a real upstream data defect causing a mid-load failure.
bad_day = pd.DataFrame([
    {"order_id": None, "customer_key": 3, "product_key": 99, "order_date": "2026-06-19",
     "order_status": "placed", "channel": "marketplace", "quantity": 1, "net_revenue": 25.00},
])
try:
    load_daily_orders("2026-06-19", bad_day, conn)
except Exception as e:
    print(f"Load failed and rolled back: {type(e).__name__}: {e}")

print(conn.execute("SELECT COUNT(*) FROM fact_orders WHERE order_date = '2026-06-19'").fetchone()[0])
# 0  <-- the failed load left zero partial rows, not a half-written mess

# RETRY after fixing the bad row (the orchestrator's automatic retry, post-fix):
good_day = bad_day.copy()
good_day["order_id"] = "O103"
load_daily_orders("2026-06-19", good_day, conn)
# Loaded 1 rows for 2026-06-19 (verified)
```

**Expected final state** (run after the full script above):

```text
SELECT order_date, COUNT(*) FROM fact_orders GROUP BY order_date;
-- 2026-06-18 | 4
-- 2026-06-19 | 1
```

Total rows = 5, regardless of how many times the orchestrator retried 2026-06-18 or how many times 2026-06-19 failed before succeeding. That invariant — same inputs always produce the same final row count, no matter how many retries happened along the way — is what "idempotent" means in production, not just in theory.

### Exercise 3: Designing the DAG

**Goal**: Draw the dependencies for the full BrightCart daily pipeline.

**Tasks**: `extract_orders`, `extract_order_items`, `quality_gate_check` (Phase 7 Day 80 tests), `load_fact_orders`, `refresh_obt_extract`, `alert_on_failure`.

* **Parallel**: `extract_orders` and `extract_order_items` can run at the same time (independent source queries).
* **Converge + Gate**: `quality_gate_check` waits for BOTH extracts, and *blocks* `load_fact_orders` if any Day 80-style test fails.
* **Sequential**: `load_fact_orders` -> `refresh_obt_extract` (Phase 7 Day 81's OBT layer rebuilds only after the fact table is confirmed correct).
* **Conditional branch**: `alert_on_failure` fires only if `quality_gate_check` or `load_fact_orders` fails — not on the happy path.

### Exercise 4: Handling Failure with Retries and Backfill

**Goal**: Design logic for an upstream API failure, and the backfill needed afterward.

**Scenario**: BrightCart's marketplace channel API (a third-party integration) returns a 500 error during `extract_orders`.

* **Retry logic**:
    1. Catch the exception.
    2. Wait with exponential backoff: 60s, then 120s, then 240s.
    3. Retry up to 3 times.
    4. If still failing after 3 attempts -> send a Slack alert ("BrightCart marketplace extract down") and mark the task `Failed` — do not let downstream tasks run on stale/missing data.
* **Backfill after recovery**: Once the marketplace API is back, the pipeline needs to backfill the missed day(s). Because `load_daily_orders` is idempotent, the fix is simply: re-run the pipeline for the missed `load_date` values. No special "backfill mode" branch is needed — idempotency *is* what makes backfilling safe and mechanical instead of a manual data-surgery exercise.

---

## Mastery Check

### Question 1: Idempotency

Why is `DELETE WHERE date = X` followed by `INSERT` better than just `INSERT`?
A) It isn't.
B) It prevents duplicates if the script is re-run.
C) It is faster.
D) It saves disk space.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Crucial for reliability.
</details>

### Question 2: ELT vs ETL

In Modern Data Stack (Snowflake/BigQuery), which is preferred?
A) ETL (Transform in Python/Server).
B) ELT (Load raw, Transform in Warehouse using SQL).
C) Manual Copy Paste.
D) No transformation.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Cloud Warehouses are insanely powerful computers. Use them.
</details>

### Question 3: DAG

What happens in a DAG if an upstream task fails?
A) The downstream task runs anyway (and breaks).
B) The downstream task waits/skips automatically (Dependency success).
C) The server explodes.
D) It deletes the data.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Standard behavior in Airflow.
</details>

### Question 4: Backfilling

When do you need to Backfill?
A) Every day.
B) When logic changes or historical data was corrupted.
C) Never.
D) When you are bored.

<details>
<summary>Click for Answer</summary>

**Answer: B**
</details>

### Question 5: Retries

Why use "Exponential Backoff" (wait 1s, then 2s, then 4s...)?
A) To annoy the user.
B) To give the failing server time to recover without hammering it.
C) To save electricity.
D) Because math is fun.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Standard API etiquette.
</details>

---

## Cross-References

* Phase 7 Day 80 — BI Data Quality & Governance (the quality-gate tests that should block `load_fact_orders` in the DAG above).
* Phase 7 Day 81 — BI Architecture & Data Modeling (the `fact_orders`/`dim_customers`/`dim_products` star schema this pipeline loads into).
* Phase 7 Day 83 — BI Cloud & Modern Data Stack (the warehouse and orchestration infrastructure this pipeline runs on).
* Phase 7 Day 84B — dbt Fundamentals (where the ELT "transform inside the warehouse" half of this pipeline is typically implemented).
* Phase 6 Day 65 — MLOps Pipelines & CI (the same idempotency/retry/quality-gate philosophy applied to model training pipelines instead of data pipelines).

## Glossary

* **Idempotency**: The property that running an operation once or many times with the same input produces the same final state.
* **DAG (Directed Acyclic Graph)**: A dependency graph of tasks with no cycles, used to express "what must finish before what starts."
* **Backfill**: Re-running a pipeline over a past date range to apply a logic fix or recover from a gap, made safe by idempotency.
* **Retry**: An automatic re-attempt of a failed task, typically with backoff, instead of failing permanently on the first error.
* **Watermark**: The highest timestamp/ID successfully processed so far, used to fetch only new/changed records on the next run.
* **CDC (Change Data Capture)**: Reading a database's transaction log to capture every insert/update/delete as an ordered event stream.
* **Orchestration**: The scheduling, sequencing, and monitoring of interdependent pipeline tasks (e.g., via Airflow, Dagster, or Prefect).
* **SLA/SLO**: An SLA is the external promise about pipeline/data freshness; an SLO is the internal engineering target that keeps that promise true.

## Summary

Today you learned:

* ✅ **Idempotency**: Make your scripts bulletproof to re-runs.
* ✅ **DAGs**: Visualize dependencies to prevent chaos.
* ✅ **ELT**: Use the Warehouse's power for transformation.
* ✅ **Retries**: Don't fail on the first network blip.
* ✅ **Incremental Loading**: Watermarks and CDC keep pipelines from re-processing everything, every run.
* ✅ **Data Contracts & Quality Gates**: Fail loudly at the boundary, not silently in a dashboard.
* ✅ **Orchestrator & Pattern Selection**: Choose Airflow/Dagster/Prefect and batch/streaming/event-driven by criteria, not by brand recognition.

**Tomorrow**: We evaluate the infrastructure in **BI Cloud & Modern Data Stack**.
