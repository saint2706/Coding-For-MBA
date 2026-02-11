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

---

## Hands-on Lab

### Exercise 1: reliable_load.py (Idempotency)

**Goal**: Write a Python function that loads data safely.

```python
import pandas as pd
from sqlalchemy import create_engine

def load_daily_sales(date, df, db_engine):
    # Step 1: Clear existing data for this date (Idempotency)
    sql = f"DELETE FROM sales WHERE sale_date = '{date}'"
    db_engine.execute(sql)
    
    # Step 2: Insert new data
    df.to_sql('sales', db_engine, if_exists='append', index=False)
    print(f"Loaded {len(df)} rows for {date}")

# If we run this 5 times, we still only have 1 copy of the data.
```

### Exercise 2: Designing a DAG

**Goal**: Draw the dependencies.

**Tasks**: `extract_fb_ads`, `extract_google_ads`, `unify_ads`, `calculate_roi`, `email_ceo`.

* **Parallel**: `extract_fb_ads` and `extract_google_ads` can run at same time.
* **Converge**: `unify_ads` waits for BOTH.
* **Sequential**: `calculate_roi` -> `email_ceo`.

### Exercise 3: Handling Failure

**Goal**: Design logic for API Failure.

**Scenario**: Facebook API is down (500 Error).

* **Logic**:
    1. Catch Exception.
    2. Wait 60 seconds (Exponential Backoff).
    3. Retry.
    4. If fail 3 times -> Send Slack Alert "FB Down". Mark task "Failed".

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

## Summary

Today you learned:

* ✅ **Idempotency**: Make your scripts bulletproof to re-runs.
* ✅ **DAGs**: Visualize dependencies to prevent chaos.
* ✅ **ELT**: Use the Warehouse's power for transformation.
* ✅ **Retries**: Don't fail on the first network blip.

**Tomorrow**: We evaluate the infrastructure in **BI Cloud & Modern Data Stack**.
