---
day: 132
title: "Capstone — Cloud Data Pipeline End-to-End"
phase: 11
phaseTitle: "Cloud Data Engineering"
slug: "capstone-cloud-pipeline"
duration: 120
difficulty: "advanced"
tags:
  - capstone
  - end-to-end
  - data-pipeline
  - cloud
  - integration
concepts:
  - "end-to-end pipeline architecture"
  - "medallion architecture implementation"
  - "orchestrated ETL with quality gates"
  - "cost monitoring and optimization"
  - "production deployment checklist"
prerequisites:
  - "All Phase 11 days (121-131)"
outcomes:
  - "Design and build a complete cloud data pipeline from ingestion to dashboard"
  - "Implement quality gates, monitoring, and alerting"
  - "Document architecture decisions and operational runbooks"
---

# 🏆 Day 132: Capstone — Cloud Data Pipeline End-to-End

> *"This capstone integrates every Phase 11 concept: cloud infrastructure, object storage, warehousing, dbt transformations, orchestration, quality gates, security, and cost monitoring — into one production-ready pipeline."*

---

## The "Never-Coded" Bridge

**This is your graduation project for cloud data engineering.** Think of it like building a complete house — you've learned about foundations (cloud), walls (storage), plumbing (pipelines), electrical (orchestration), building codes (security/compliance), and budgeting (FinOps). Now you build the entire house.

You'll design and implement a complete data pipeline that a real company could use: ingesting data from multiple sources, processing it through bronze/silver/gold tiers, enforcing data quality, powering a dashboard, and monitoring everything with alerts.

---

## The Capstone Project

### System Architecture

```
    ┌─────────────────────────────────────────────────────────────┐
    │                 CLOUD DATA PIPELINE CAPSTONE                │
    ├─────────────────────────────────────────────────────────────┤
    │                                                             │
    │  SOURCES          INGESTION        STORAGE (Medallion)      │
    │  ┌──────┐        ┌────────┐       ┌──────────────────────┐ │
    │  │ API  │──────►│ Python │──────►│ BRONZE (raw/)        │ │
    │  └──────┘        │ scripts│       │  → Parquet, as-is    │ │
    │  ┌──────┐        │  or    │       ├──────────────────────┤ │
    │  │ CSV  │──────►│ Auto   │──────►│ SILVER (cleaned/)    │ │
    │  └──────┘        │ Loader │       │  → dbt staging       │ │
    │  ┌──────┐        └────────┘       ├──────────────────────┤ │
    │  │ DB   │                         │ GOLD (curated/)      │ │
    │  │ (CDC)│──────────────────────►│  → dbt marts          │ │
    │  └──────┘                         └──────────┬───────────┘ │
    │                                              │             │
    │  ORCHESTRATION    QUALITY          CONSUMPTION│             │
    │  ┌──────────┐    ┌──────────┐    ┌──────────┴───────────┐ │
    │  │ Airflow  │    │ Soda /   │    │ Dashboard (Superset) │ │
    │  │ or       │───►│ Great    │    │ SQL queries          │ │
    │  │ Prefect  │    │ Expect.  │    │ ML features          │ │
    │  └──────────┘    └──────────┘    └──────────────────────┘ │
    │                                                             │
    │  MONITORING       SECURITY        COST                      │
    │  ┌──────────┐    ┌──────────┐    ┌──────────────────────┐ │
    │  │ Alerts   │    │ IAM      │    │ Tagging + Budget     │ │
    │  │ Metrics  │    │ Encrypt  │    │ Alerts               │ │
    │  └──────────┘    └──────────┘    └──────────────────────┘ │
    └─────────────────────────────────────────────────────────────┘
```

### Milestone 1: Infrastructure Setup

```python
# Define the cloud resources needed (conceptual — use Terraform in practice)

infrastructure = {
    "storage": {
        "s3_bucket": "capstone-data-lake",
        "folders": ["raw/", "cleaned/", "curated/", "tmp/"],
        "encryption": "SSE-KMS",
        "lifecycle": {
            "raw/": {"transition_to_ia": 30, "transition_to_glacier": 90},
            "tmp/": {"expiration": 7},
        },
    },
    "compute": {
        "orchestrator": "Airflow on MWAA (or Prefect Cloud)",
        "warehouse": "BigQuery (or Snowflake or Redshift Serverless)",
    },
    "security": {
        "iam_roles": ["data-engineer", "data-analyst", "pipeline-service"],
        "encryption": "AES-256 at rest, TLS 1.2+ in transit",
        "network": "VPC with private subnets, VPC endpoints for S3",
    },
    "monitoring": {
        "cost_alerts": "Budget at $200/month, alert at 80%",
        "pipeline_alerts": "Slack notification on failure",
        "data_quality": "Soda checks after each dbt run",
    },
}
```

### Milestone 2: Data Ingestion

```python
# Bronze layer: ingest raw data from 3 sources

def ingest_api_data(api_url: str, output_path: str, date: str):
    """
    TODO: Implement API ingestion.
    1. Call the API with date parameter
    2. Handle pagination (if applicable)
    3. Save as Parquet to S3: raw/api/{date}/data.parquet
    4. Log record count and file size
    5. Handle errors gracefully (retry 3x, then alert)
    """
    pass

def ingest_csv_files(source_dir: str, output_path: str):
    """
    TODO: Implement CSV ingestion.
    1. Read CSV files from source directory
    2. Add metadata columns: _source_file, _loaded_at
    3. Save as Parquet to S3: raw/csv/{date}/
    4. Move processed CSVs to archive
    """
    pass

def ingest_database_cdc(db_connection: str, tables: list, output_path: str):
    """
    TODO: Implement database CDC ingestion.
    1. Read changed rows since last checkpoint
    2. Save as Parquet to S3: raw/db/{table}/{date}/
    3. Update checkpoint
    """
    pass
```

### Milestone 3: dbt Transformations

```sql
-- models/staging/stg_api_events.sql
-- Silver layer: clean and standardize API data

{{
    config(
        materialized='incremental',
        unique_key='event_id',
        incremental_strategy='merge'
    )
}}

-- TODO: Implement staging model
-- 1. Select from raw API source
-- 2. Cast data types
-- 3. Rename columns to snake_case
-- 4. Filter invalid records
-- 5. Add surrogate key
-- 6. Implement incremental logic

SELECT
    {{ dbt_utils.generate_surrogate_key(['event_id']) }} AS event_sk,
    CAST(event_id AS BIGINT) AS event_id,
    CAST(event_timestamp AS TIMESTAMP) AS event_at,
    LOWER(TRIM(event_type)) AS event_type,
    CAST(user_id AS BIGINT) AS user_id,
    CAST(revenue AS DECIMAL(12,2)) AS revenue,
    CURRENT_TIMESTAMP() AS _loaded_at

FROM {{ source('raw', 'api_events') }}

{% if is_incremental() %}
    WHERE event_timestamp > (SELECT MAX(event_at) FROM {{ this }})
{% endif %}
```

```sql
-- models/marts/fct_daily_metrics.sql
-- Gold layer: business-ready aggregates

-- TODO: Implement fact table
-- 1. Join staging models
-- 2. Aggregate to daily grain
-- 3. Calculate KPIs (revenue, orders, conversion rate)
-- 4. Add MoM comparison using window functions

SELECT
    event_date,
    region,
    COUNT(DISTINCT user_id) AS unique_users,
    COUNT(DISTINCT order_id) AS total_orders,
    SUM(revenue) AS total_revenue,
    SUM(revenue) / NULLIF(COUNT(DISTINCT user_id), 0) AS revenue_per_user,
    LAG(SUM(revenue), 7) OVER (
        PARTITION BY region ORDER BY event_date
    ) AS revenue_7d_ago,
    (SUM(revenue) - LAG(SUM(revenue), 7) OVER (
        PARTITION BY region ORDER BY event_date
    )) / NULLIF(LAG(SUM(revenue), 7) OVER (
        PARTITION BY region ORDER BY event_date
    ), 0) * 100 AS wow_growth_pct

FROM {{ ref('stg_api_events') }}
GROUP BY event_date, region
```

### Milestone 4: Orchestration DAG

```python
# dags/capstone_pipeline.py
# TODO: Implement the full orchestration DAG

# Task order:
# 1. ingest_api → ingest_csv → ingest_db (parallel)
# 2. dbt_run (depends on all ingestion)
# 3. dbt_test (depends on dbt_run)
# 4. soda_check (depends on dbt_test)
# 5. notify_success OR notify_failure (depends on all)

# Requirements:
# - Schedule: daily at 5 AM UTC
# - Retries: 3 for ingestion, 1 for dbt
# - SLA: complete within 2 hours
# - Alerting: Slack on failure
# - Idempotent: safe to re-run
```

### Milestone 5: Quality Gates

```yaml
# soda/checks/capstone_checks.yml
# TODO: Implement quality checks for all gold tables

# For fct_daily_metrics:
# - freshness < 1 day
# - row_count > 0
# - no null dates or regions
# - revenue values between 0 and 10M
# - anomaly detection on total_revenue (30-day baseline)

# For dim_users:
# - no duplicate user_ids
# - email format validation
# - segment must be in accepted values
```

### Milestone 6: Monitoring Dashboard

```python
# TODO: Design a monitoring dashboard (mockup) showing:
# 1. Pipeline Status: Last 7 days success/failure timeline
# 2. Data Freshness: Each gold table's last update time vs SLA
# 3. Quality Score: Pass/fail rate of Soda checks this week
# 4. Cost: Daily cloud spend with budget line
# 5. Volume: Records processed per day trend
```

---

## Deliverables Checklist

```markdown
## Capstone Submission Checklist

### Architecture
- [ ] Architecture diagram (as shown above, customized for your design)
- [ ] ADR (Architecture Decision Record) for key choices

### Code
- [ ] Ingestion scripts (3 sources)
- [ ] dbt project (staging + marts, 5+ models)
- [ ] Orchestration DAG (Airflow or Prefect)
- [ ] Quality checks (Soda or Great Expectations)

### Operations
- [ ] IAM policy (least privilege)
- [ ] Cost estimate (monthly budget)
- [ ] Monitoring and alerting setup
- [ ] Runbook for common failures

### Documentation
- [ ] README with setup instructions
- [ ] Data dictionary for gold tables
- [ ] SLA document
```

---

## Mastery Check

**Q1**: What is the most important principle when designing a production data pipeline?
<details><summary>Answer</summary>
Idempotency — every component must produce the same result if re-run. Pipelines will fail and be retried. Without idempotency, re-runs create duplicate data, corrupted aggregates, and incorrect business metrics. Design every task to be safely re-runnable: use MERGE/UPSERT for loads, partition overwrites for transformations, and checkpoint-based ingestion.
</details>

**Q2**: You're presenting your capstone pipeline to a VP. What 3 metrics would you highlight?
<details><summary>Answer</summary>
1. **Freshness SLA compliance**: "Our dashboards update within 2 hours of source data, with 99.5% reliability." 2. **Data quality score**: "Our automated checks catch 99.9% of issues before they reach dashboards." 3. **Cost efficiency**: "We process 10GB daily at $X/month — $Y per million records." Business leaders care about reliability, accuracy, and cost — not technology choices.
</details>

**Q3**: Your pipeline failed at 3 AM and the CEO's dashboard shows stale data at 9 AM. What should have prevented this?
<details><summary>Answer</summary>
1. Automatic retries (3x with exponential backoff) should handle transient failures. 2. Alerting should have notified the on-call engineer at 3 AM. 3. The dashboard should show data freshness — a "last updated" timestamp with a red warning if stale. 4. The SLA monitor should have escalated when the 2-hour window was breached. Multiple layers of defense prevent silent failures.
</details>

**Q4**: How do you handle a schema change in the source API without breaking the pipeline?
<details><summary>Answer</summary>
1. Ingest raw data as-is to bronze (schema-on-read — accept any schema). 2. Use dbt's `on_schema_change='sync_all_columns'` for incremental models. 3. Have data contracts with the source team — 14-day notice for breaking changes. 4. Monitor with schema validation checks (Soda/GE) that alert on unexpected columns. The bronze layer buffers schema changes from downstream consumers.
</details>

**Q5**: What would you change about this pipeline if data volume grew from 10GB/day to 10TB/day?
<details><summary>Answer</summary>
1. Switch from Python ingestion to Spark/Dataflow for parallel processing. 2. Use streaming ingestion (Kafka/Pub/Sub) instead of batch API calls. 3. Switch to Iceberg/Delta Lake for efficient incremental processing. 4. Add partition pruning and clustering to all warehouse queries. 5. Implement auto-scaling compute (Snowflake multi-cluster, Spark auto-scale). The architecture stays the same — only the implementation scales.
</details>

---

## Summary

- ✅ **End-to-end pipeline**: Ingestion → Bronze → Silver → Gold → Dashboard
- ✅ **Production-grade**: Orchestrated, monitored, quality-gated, cost-tracked
- ✅ **Every Phase 11 skill applied**: Cloud, storage, warehousing, dbt, orchestration, quality, security, cost, IaC
- ✅ **Deliverables**: Architecture diagram, code, runbook, SLA document

🎓 **Congratulations on completing Phase 11!** You've mastered cloud data engineering — from provisioning infrastructure to deploying production pipelines. Next up: **Phase 12 — Analytics Engineering & Data Products**.
