---
day: 125
title: "Orchestration — Apache Airflow, Prefect, Dagster"
phase: 11
phaseTitle: "Cloud Data Engineering"
slug: "orchestration"
duration: 90
difficulty: "intermediate"
tags:
  - airflow
  - prefect
  - dagster
  - orchestration
  - dag
concepts:
  - "directed acyclic graphs (DAGs)"
  - "task dependencies and scheduling"
  - "idempotency in data pipelines"
  - "retry strategies and alerting"
  - "orchestrator selection"
prerequisites:
  - "Day 124: dbt at Scale"
  - "Day 36B: Docker Fundamentals"
outcomes:
  - "Build and schedule a data pipeline DAG in Airflow"
  - "Compare Airflow, Prefect, and Dagster for different use cases"
  - "Implement retry logic, alerting, and idempotent tasks"
---

# 🎼 Day 125: Orchestration — Apache Airflow, Prefect, Dagster

> *"An orchestrator doesn't run your code faster — it runs it reliably, on schedule, and wakes you up when something breaks."*

---

## The "Never-Coded" Bridge

**Think of an orchestrator like an airport control tower.** Planes (data tasks) need to take off and land in the right order, at the right time, with the right runway. Without control, two planes collide. With a control tower, every flight has a slot, dependencies are respected (fueling before takeoff), and when something goes wrong (weather delay), the tower adjusts the entire schedule.

Airflow, Prefect, and Dagster are control towers for data pipelines. They schedule tasks, manage dependencies, handle failures, and give you visibility into what's running, what failed, and what's next.

---

## The Technical Deep Dive

### 1. Apache Airflow — The Industry Standard

```python
# dags/daily_sales_pipeline.py
from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.providers.google.cloud.operators.bigquery import BigQueryInsertJobOperator
from airflow.utils.dates import days_ago
from datetime import timedelta

default_args = {
    "owner": "data-engineering",
    "retries": 3,
    "retry_delay": timedelta(minutes=5),
    "email_on_failure": True,
    "email": ["data-team@company.com"],
}

with DAG(
    dag_id="daily_sales_pipeline",
    default_args=default_args,
    schedule_interval="0 6 * * *",  # Daily at 6 AM UTC
    start_date=days_ago(1),
    catchup=False,
    tags=["sales", "daily", "production"],
    doc_md="""
    ## Daily Sales Pipeline
    Extracts → Cleans → Loads → Tests → Notifies
    Owner: Data Engineering Team
    SLA: Complete by 7 AM UTC
    """,
) as dag:

    extract = PythonOperator(
        task_id="extract_from_source",
        python_callable=lambda: print("Extracting from API..."),
        execution_timeout=timedelta(minutes=30),
    )

    transform = PythonOperator(
        task_id="transform_and_clean",
        python_callable=lambda: print("Cleaning data..."),
    )

    load = BigQueryInsertJobOperator(
        task_id="load_to_bigquery",
        configuration={
            "query": {
                "query": "INSERT INTO dataset.sales SELECT * FROM staging.sales_clean",
                "useLegacySql": False,
            }
        },
    )

    test = PythonOperator(
        task_id="run_data_tests",
        python_callable=lambda: print("Running dbt test..."),
    )

    notify = PythonOperator(
        task_id="notify_slack",
        python_callable=lambda: print("Pipeline complete ✅"),
        trigger_rule="all_done",  # Run even if upstream failed
    )

    # DAG Dependencies
    extract >> transform >> load >> test >> notify
```

### 2. Prefect — The Modern Alternative

```python
# flows/daily_sales.py
from prefect import flow, task
from prefect.tasks import task_input_hash
from datetime import timedelta

@task(
    retries=3,
    retry_delay_seconds=60,
    cache_key_fn=task_input_hash,
    cache_expiration=timedelta(hours=1),
    log_prints=True,
)
def extract_sales(date: str) -> dict:
    """Extract sales data for a given date."""
    print(f"Extracting sales for {date}")
    return {"records": 15000, "date": date}

@task(retries=2)
def transform_sales(raw_data: dict) -> dict:
    """Clean and transform sales data."""
    print(f"Transforming {raw_data['records']} records")
    return {"clean_records": 14800, "date": raw_data["date"]}

@task
def load_sales(clean_data: dict):
    """Load to data warehouse."""
    print(f"Loaded {clean_data['clean_records']} records for {clean_data['date']}")

@flow(name="daily-sales-pipeline", log_prints=True)
def daily_sales_pipeline(date: str = "2025-01-15"):
    """End-to-end daily sales pipeline."""
    raw = extract_sales(date)
    clean = transform_sales(raw)
    load_sales(clean)
    print(f"Pipeline complete for {date} ✅")

# Run
if __name__ == "__main__":
    daily_sales_pipeline()
```

### 3. Orchestrator Comparison

| Feature               | Airflow                | Prefect                | Dagster                 |
| --------------------- | ---------------------- | ---------------------- | ----------------------- |
| **Architecture**      | Scheduler + Workers    | Agent-based            | Dagit UI + Daemon       |
| **DAG Definition**    | Python files in folder | Python decorators      | Software-defined assets |
| **Scheduling**        | Cron + sensors         | Schedules + triggers   | Schedules + sensors     |
| **Testing**           | Difficult              | Native Python tests    | First-class testing     |
| **Local Development** | Docker Compose         | `prefect server start` | `dagster dev`           |
| **Cloud Managed**     | MWAA, Composer         | Prefect Cloud          | Dagster Cloud           |
| **Best For**          | Large orgs, complex    | Modern teams, speed    | Data mesh, assets       |
| **Market Adoption**   | ~70% (dominant)        | ~15% (growing fast)    | ~10% (growing)          |
| **Learning Curve**    | Steep                  | Gentle                 | Moderate                |

### 4. Idempotency — The Golden Rule

```python
# An idempotent task produces the same result whether run once or 100 times.

# ❌ NON-IDEMPOTENT: Appends duplicates on re-run
def bad_load(data, db):
    db.execute("INSERT INTO sales VALUES (%s)", data)

# ✅ IDEMPOTENT: Same result on re-run (partition overwrite)
def good_load(data, date, db):
    db.execute(f"DELETE FROM sales WHERE date = '{date}'")
    db.execute("INSERT INTO sales VALUES (%s)", data)

# ✅ EVEN BETTER: MERGE/UPSERT pattern
def best_load(data, db):
    db.execute("""
        MERGE INTO sales AS target
        USING staging AS source
        ON target.order_id = source.order_id
        WHEN MATCHED THEN UPDATE SET ...
        WHEN NOT MATCHED THEN INSERT ...
    """)
```

---

## Senior-Level Insights

### The SLA Contract

Every production pipeline needs an SLA (Service Level Agreement). Example: "Daily sales pipeline completes by 7 AM UTC with data freshness < 4 hours." Monitor SLA breaches and alert before business users notice stale dashboards.

### When to NOT Use Airflow

Airflow is over-engineering for: (1) simple cron jobs that run one script, (2) real-time/streaming pipelines (use Kafka/Flink instead), (3) ML experiment tracking (use MLflow/Weights & Biases). Use the right tool for the right job.

---

## Hands-on Lab

### Exercise 1: Design a Pipeline DAG

```python
# Scenario: Daily customer analytics pipeline
# Tasks: extract_orders, extract_customers, join_data, compute_metrics,
#         run_ml_model, update_dashboard, send_report
# Dependencies:
# - extract_orders and extract_customers can run in parallel
# - join_data depends on both extracts
# - compute_metrics depends on join_data
# - run_ml_model depends on join_data
# - update_dashboard depends on compute_metrics AND run_ml_model
# - send_report depends on update_dashboard

# TODO: Write this as an Airflow DAG with proper dependencies
# TODO: Add retry logic (3 retries, 5 min delay) for extract tasks
# TODO: Add an SLA of 2 hours for the entire DAG
```

### Exercise 2: Make It Idempotent

```python
# This pipeline has 3 idempotency bugs. Find and fix them:
def extract(api_url, output_path):
    data = requests.get(api_url).json()
    with open(output_path, "a") as f:  # Bug 1: ???
        json.dump(data, f)

def transform(input_path, output_path):
    data = json.load(open(input_path))
    clean = [d for d in data if d["status"] != "cancelled"]
    with open(output_path, "a") as f:  # Bug 2: ???
        json.dump(clean, f)

def load(input_path, db):
    data = json.load(open(input_path))
    for row in data:
        db.execute("INSERT INTO orders VALUES (%s)", row)  # Bug 3: ???
```

### Exercise 3: Orchestrator Selection

For each scenario, choose Airflow, Prefect, or Dagster and justify:
1. A 3-person startup that needs to schedule 5 dbt jobs and 3 Python scripts.
2. A bank with 200 data engineers, strict audit requirements, and existing Kubernetes.
3. A data mesh organization with 10 domain teams each owning their own data products.

---

## Mastery Check

**Q1**: What is a DAG and why can't it have cycles?
<details><summary>Answer</summary>
A Directed Acyclic Graph defines task dependencies where edges point from upstream to downstream tasks. Cycles (A depends on B depends on A) would create infinite loops — no task could ever start because each is waiting for the other. The acyclic constraint guarantees a valid execution order exists.
</details>

**Q2**: What does idempotency mean and why is it critical for data pipelines?
<details><summary>Answer</summary>
An idempotent task produces the same result whether executed once or many times with the same input. This is critical because pipelines fail and need to be re-run. Without idempotency, re-running a failed pipeline creates duplicate data. Achieve it with MERGE/UPSERT patterns or partition overwrite strategies.
</details>

**Q3**: Your Airflow DAG failed at 3 AM. How should it be configured to handle this?
<details><summary>Answer</summary>
Configure: (1) `retries=3` with `retry_delay=timedelta(minutes=5)` for transient failures, (2) `email_on_failure=True` to alert the on-call engineer, (3) `execution_timeout` to prevent tasks from hanging indefinitely, (4) `trigger_rule="all_done"` on a cleanup/notification task so it runs regardless of upstream success/failure.
</details>

**Q4**: What is Airflow's `catchup` parameter and when should it be False?
<details><summary>Answer</summary>
When `catchup=True`, Airflow runs the DAG for every missed interval since `start_date`. If your DAG starts today but `start_date` is January 2024, Airflow would queue 365+ runs. Set `catchup=False` for pipelines that should only process current data (most analytics pipelines). Set `catchup=True` for historical backfills.
</details>

**Q5**: Why do many teams separate ETL and analytics workloads into different warehouses in Snowflake?
<details><summary>Answer</summary>
Separate warehouses provide: (1) cost attribution — each team's compute is tracked independently, (2) resource isolation — a heavy ETL job won't slow down analyst queries, (3) right-sizing — ETL can use a large warehouse briefly while analytics uses a small warehouse continuously. This maps directly to how orchestrators schedule different task types.
</details>

---

## Summary

- ✅ **Orchestrators** schedule tasks, manage dependencies, handle failures, and provide visibility
- ✅ **Airflow**: Industry standard (~70% market share), best for complex enterprise pipelines
- ✅ **Prefect**: Modern, Pythonic, fastest to get started, great for small-mid teams
- ✅ **Dagster**: Software-defined assets, best for data mesh and domain-oriented architectures
- ✅ **Idempotency**: The golden rule — every task must produce the same result on re-run

**Tomorrow → Day 126**: **Streaming Pipelines** — Kafka, Pub/Sub, Kinesis — when batch isn't fast enough.
