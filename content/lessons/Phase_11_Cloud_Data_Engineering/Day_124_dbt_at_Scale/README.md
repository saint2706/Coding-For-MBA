---
day: 124
title: "dbt at Scale — Incremental Models, Snapshots, Advanced Patterns"
phase: 11
phaseTitle: "Cloud Data Engineering"
slug: "dbt-at-scale"
duration: 90
difficulty: "advanced"
tags:
  - dbt
  - incremental
  - snapshots
  - jinja
  - analytics-engineering
concepts:
  - "incremental models"
  - "dbt snapshots (SCD Type 2)"
  - "Jinja macros and packages"
  - "dbt tests and contracts"
  - "model governance"
prerequisites:
  - "Day 84B: dbt Fundamentals"
  - "Day 123: Cloud Data Warehouses"
outcomes:
  - "Build incremental models that process only new data"
  - "Implement SCD Type 2 snapshots for slowly changing dimensions"
  - "Write reusable Jinja macros for DRY analytics code"
  - "Enforce data contracts and quality tests in the DAG"
---

# 🔧 Day 124: dbt at Scale — Incremental Models, Snapshots, Advanced Patterns

> *"dbt is the tool that turns your data warehouse from a pile of SQL files into a tested, documented, version-controlled analytics engine."*

---

## The "Never-Coded" Bridge

**Think of dbt like a factory assembly line.**

Without dbt, building analytics is like craft production — each analyst writes SQL one-off, nobody knows what depends on what, and testing is "I ran it and it looked right." dbt brings the assembly line: every transformation is a versioned step, each step is tested, dependencies are tracked automatically, and the whole pipeline is deployed with one command.

Day 84B taught you dbt fundamentals. Today you learn the patterns that make dbt work at enterprise scale — when you have 500+ models, 50+ analysts, and data that changes every 5 minutes.

---

## The Technical Deep Dive

### 1. Incremental Models

```sql
-- models/staging/stg_orders.sql
-- Incremental: only process NEW rows since the last run

{{
    config(
        materialized='incremental',
        unique_key='order_id',
        incremental_strategy='merge',
        on_schema_change='sync_all_columns',
        partition_by={
            "field": "order_date",
            "data_type": "date",
            "granularity": "day"
        }
    )
}}

SELECT
    order_id,
    customer_id,
    order_date,
    total_amount,
    status,
    _loaded_at

FROM {{ source('raw', 'orders') }}

{% if is_incremental() %}
    -- Only process rows newer than the latest in our table
    WHERE _loaded_at > (SELECT MAX(_loaded_at) FROM {{ this }})
{% endif %}
```

```yaml
# Why incremental matters:
# Full refresh of 100M rows: 45 minutes, scans 500 GB
# Incremental (10K new rows): 8 seconds, scans 50 MB
# At $6.25/TB scanned (BigQuery), that's $3.13 vs $0.0003 per run
```

### 2. Snapshots (SCD Type 2)

```sql
-- snapshots/snap_customers.sql
-- Track how customer data changes over time

{% snapshot snap_customers %}

{{
    config(
        target_schema='snapshots',
        unique_key='customer_id',
        strategy='timestamp',
        updated_at='updated_at',
        invalidate_hard_deletes=True,
    )
}}

SELECT
    customer_id,
    email,
    segment,        -- This changes: standard → premium → enterprise
    lifetime_value,
    region,
    updated_at

FROM {{ source('raw', 'customers') }}

{% endsnapshot %}
```

```sql
-- Query snapshot: "What segment was customer 123 in last quarter?"
SELECT segment, dbt_valid_from, dbt_valid_to
FROM {{ ref('snap_customers') }}
WHERE customer_id = 123
  AND dbt_valid_from <= '2025-03-31'
  AND (dbt_valid_to > '2025-03-31' OR dbt_valid_to IS NULL)
```

### 3. Jinja Macros for DRY Code

```sql
-- macros/cents_to_dollars.sql
{% macro cents_to_dollars(column_name, precision=2) %}
    ROUND(CAST({{ column_name }} AS NUMERIC) / 100, {{ precision }})
{% endmacro %}

-- macros/generate_surrogate_key.sql
{% macro generate_surrogate_key(field_list) %}
    {{ dbt_utils.generate_surrogate_key(field_list) }}
{% endmacro %}

-- macros/union_sources.sql
{% macro union_regional_tables(regions) %}
    {% for region in regions %}
        SELECT *, '{{ region }}' AS source_region
        FROM {{ source('raw', 'orders_' ~ region) }}
        {% if not loop.last %} UNION ALL {% endif %}
    {% endfor %}
{% endmacro %}

-- Usage in a model:
-- models/staging/stg_orders_all.sql
{{ union_regional_tables(['us', 'eu', 'apac']) }}
```

### 4. Data Tests and Contracts

```yaml
# models/marts/fct_orders.yml
models:
  - name: fct_orders
    description: "Fact table for completed orders"
    config:
      contract:
        enforced: true  # dbt 1.5+ — schema enforcement
    columns:
      - name: order_id
        data_type: bigint
        constraints:
          - type: not_null
          - type: primary_key
        tests:
          - unique
          - not_null

      - name: total_amount
        data_type: numeric
        tests:
          - not_null
          - dbt_expectations.expect_column_values_to_be_between:
              min_value: 0
              max_value: 1000000
              severity: warn

      - name: order_date
        data_type: date
        tests:
          - not_null
          - dbt_expectations.expect_column_values_to_be_between:
              min_value: "'2020-01-01'"
              max_value: "CURRENT_DATE()"

    tests:
      - dbt_utils.recency:
          datepart: day
          field: order_date
          interval: 2
          severity: error  # Alert if no orders in last 2 days
```

### 5. Project Organization at Scale

```
dbt_project/
├── models/
│   ├── staging/          # 1:1 source cleanup (stg_*)
│   │   ├── _staging.yml  # Source definitions + tests
│   │   ├── stg_orders.sql
│   │   └── stg_customers.sql
│   ├── intermediate/     # Business logic joins (int_*)
│   │   ├── int_order_items_enriched.sql
│   │   └── int_customer_segments.sql
│   └── marts/            # Final business tables (fct_*, dim_*)
│       ├── finance/
│       │   ├── fct_revenue.sql
│       │   └── dim_chart_of_accounts.sql
│       └── marketing/
│           ├── fct_campaigns.sql
│           └── dim_channels.sql
├── snapshots/             # SCD Type 2 snapshots
├── macros/                # Reusable SQL functions
├── tests/                 # Custom data tests
├── seeds/                 # Small reference CSVs
└── dbt_project.yml        # Project configuration
```

---

## Senior-Level Insights

### The "Late-Arriving Data" Problem

Incremental models assume new rows have higher timestamps. But data sometimes arrives late (a payment settles 3 days after the order). Solution: use a lookback window:

```sql
{% if is_incremental() %}
    WHERE _loaded_at > (SELECT MAX(_loaded_at) - INTERVAL '3 days' FROM {{ this }})
{% endif %}
```

### Model Governance at Scale

With 500+ models, you need governance:
- **Model access**: `access: protected` prevents other teams from referencing your staging models
- **Model groups**: organize models by team ownership
- **Model versions**: deprecate old model versions while maintaining backward compatibility

---

## Hands-on Lab

### Exercise 1: Build an Incremental Model

```sql
-- TODO: Write an incremental model for a clickstream events table.
-- Requirements:
-- 1. Use 'merge' strategy with event_id as unique_key
-- 2. Partition by event_date (daily)
-- 3. Use a 2-day lookback window for late-arriving events
-- 4. Add a test to verify no duplicate event_ids
```

### Exercise 2: Snapshot Customer Changes

```sql
-- TODO: Create a snapshot that tracks changes to product pricing.
-- The source table has: product_id, price, category, updated_at
-- After running the snapshot twice (with price changes in between),
-- write a query to find all products whose price increased by >10%.
```

### Exercise 3: Write a Reusable Macro

```sql
-- TODO: Write a Jinja macro called 'safe_divide' that:
-- 1. Takes numerator, denominator, and default_value parameters
-- 2. Returns numerator/denominator if denominator != 0
-- 3. Returns default_value otherwise
-- Use it in a model to calculate conversion_rate = orders / visits
```

---

## Mastery Check

**Q1**: When should you use an incremental model vs. a full refresh?
<details><summary>Answer</summary>
Use incremental when: the source table is large (>10M rows), data is append-only or has a reliable timestamp, and processing all rows every run is too slow or expensive. Use full refresh when: the table is small (<1M rows), data can be arbitrarily updated/deleted, or the logic is complex enough that incremental correctness is hard to guarantee.
</details>

**Q2**: What is the difference between a dbt snapshot and an incremental model?
<details><summary>Answer</summary>
Incremental models append or merge new data — they represent the current state. Snapshots track historical changes using SCD Type 2 — they add valid_from/valid_to columns to record when each row version was active. Use incremental for fact tables (events, transactions) and snapshots for slowly changing dimensions (customer segments, product prices).
</details>

**Q3**: Why should staging models be `view` materialization instead of `table`?
<details><summary>Answer</summary>
Staging models are 1:1 transformations of source data (renaming, casting, basic filtering). Materializing them as views avoids duplicating data storage — the warehouse evaluates the view on demand. Since staging models are always referenced by downstream models (not queried directly by analysts), the view approach is more cost-effective.
</details>

**Q4**: What is a data contract in dbt and why does it matter?
<details><summary>Answer</summary>
A data contract (`contract: enforced: true`) specifies exact column names, types, and constraints for a model. dbt validates the model output against this contract at build time. This prevents schema drift — if a column name changes or a new column is added without updating the contract, the build fails. This is critical when downstream systems (dashboards, ML pipelines) depend on specific schemas.
</details>

**Q5**: Your incremental model is producing duplicate rows. What are the most likely causes?
<details><summary>Answer</summary>
1. The `unique_key` is wrong or not truly unique in the source data. 2. The `incremental_strategy` is `append` instead of `merge` — append doesn't deduplicate. 3. Late-arriving data is being re-processed without the merge handling duplicates. Fix: verify unique_key uniqueness, switch to `merge` strategy, and add a `unique` test.
</details>

---

## Summary

- ✅ **Incremental models**: Process only new data — saves time and cost at scale
- ✅ **Snapshots**: Track historical dimension changes with SCD Type 2
- ✅ **Jinja macros**: DRY SQL for reusable transformation logic
- ✅ **Data contracts**: Enforce schema stability for downstream consumers
- ✅ **Project structure**: staging → intermediate → marts with clear naming conventions

**Tomorrow → Day 125**: **Orchestration** — Apache Airflow, Prefect, Dagster — scheduling and managing your data pipelines.
