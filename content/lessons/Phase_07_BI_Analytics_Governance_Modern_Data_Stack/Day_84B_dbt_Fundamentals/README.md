---
day: 84B
title: "dbt Fundamentals"
phase: 7
phaseTitle: "BI Analytics, Governance & Modern Data Stack"
slug: "dbt-fundamentals"
duration: 120
difficulty: "intermediate"
tags:
  - dbt
  - analytics-engineering
  - sql
  - data-transformation
  - modern-data-stack
concepts:
  - "dbt models and refs"
  - "sources and freshness"
  - "dbt tests"
  - "Jinja templating in SQL"
  - "lineage and documentation"
prerequisites:
  - "Day 73-84: BI Analytics"
  - "SQL proficiency (Phase 8–9)"
outcomes:
  - "Build a working dbt project with models, sources, and tests"
  - "Use refs to enforce dependency ordering"
  - "Write schema.yml tests for data quality"
  - "Generate and view dbt documentation"
---

# 🔧 Day 85B: dbt Fundamentals

> *"dbt is to SQL what Git is to code. It brings software engineering practices — version control, testing, documentation — to analytics."*

---

## The "Never-Coded" Bridge

**Before dbt, analytics SQL looked like this:**

- Sarah writes a revenue query in a Looker dashboard.
- Tom writes a slightly different revenue query in a Tableau dashboard.
- The board sees two different revenue numbers in the same meeting.
- Nobody knows which is correct.

**This is the "Dark Matter" problem of analytics** — queries duplicated everywhere, no tests, no documentation, no single source of truth.

**dbt (data build tool)** applies software engineering principles to SQL:

- **Version control**: All SQL in Git, reviewed via pull requests
- **Testing**: Automated checks that your data is not null, unique, and referentially consistent
- **Documentation**: Auto-generated data catalog with lineage graphs
- **Modularity**: Reusable SQL models that reference each other

---

## The Technical Deep Dive

### 1. dbt Project Structure

```
my_dbt_project/
├── dbt_project.yml          # Project configuration
├── profiles.yml             # Database connection info
├── models/
│   ├── staging/             # Raw → cleaned (1:1 with source tables)
│   │   ├── stg_orders.sql
│   │   └── stg_customers.sql
│   ├── intermediate/        # Business logic, joins
│   │   └── int_order_items.sql
│   └── marts/               # Final analytics-ready tables
│       ├── finance/
│       │   └── fct_revenue.sql
│       └── marketing/
│           └── dim_customers.sql
├── tests/
│   └── assert_positive_revenue.sql
└── macros/
    └── generate_schema_name.sql
```

### 2. Your First dbt Model

A dbt model is just a `SELECT` statement saved as a `.sql` file:

```sql
-- models/staging/stg_orders.sql
{{ config(materialized='view') }}

SELECT
    order_id,
    customer_id,
    created_at,
    LOWER(TRIM(status)) AS status,
    CAST(amount_cents AS FLOAT) / 100 AS amount_usd,
    DATE(created_at) AS order_date
FROM {{ source('raw', 'orders') }}
WHERE created_at >= '2023-01-01'  -- remove test data
```

```sql
-- models/marts/finance/fct_revenue.sql
{{ config(materialized='table') }}

WITH orders AS (
    SELECT * FROM {{ ref('stg_orders') }}    -- ref() = dependency declaration
),

customers AS (
    SELECT * FROM {{ ref('stg_customers') }}
)

SELECT
    o.order_date,
    o.order_id,
    o.amount_usd,
    c.customer_segment,
    c.country
FROM orders AS o
LEFT JOIN customers AS c ON o.customer_id = c.customer_id
WHERE o.status = 'completed'
```

**Key concept**: `{{ ref('stg_orders') }}` tells dbt that `fct_revenue` depends on `stg_orders`. dbt builds them in the right order — automatically.

### 3. Sources and Freshness Checks

```yaml
# models/staging/schema.yml
version: 2

sources:
  - name: raw
    database: my_warehouse
    schema: raw_data
    tables:
      - name: orders
        description: "Raw orders from Stripe"
        freshness:
          warn_after: {count: 12, period: hour}
          error_after: {count: 24, period: hour}
        loaded_at_field: created_at   # Column to check freshness
        columns:
          - name: order_id
            description: "Unique order identifier"
            tests:
              - unique
              - not_null
          - name: amount_cents
            tests:
              - not_null
              - dbt_utils.accepted_range:
                  min_value: 0
```

### 4. Built-In Tests

```yaml
# models/marts/schema.yml
version: 2

models:
  - name: fct_revenue
    description: "Completed orders with customer attributes. Finance source of truth."
    columns:
      - name: order_id
        tests:
          - unique          # No duplicates
          - not_null        # Required field
      - name: amount_usd
        tests:
          - not_null
          - dbt_utils.accepted_range:
              min_value: 0  # Revenue ≥ 0
      - name: customer_segment
        tests:
          - accepted_values:
              values: ['enterprise', 'smb', 'consumer', 'unknown']
```

### 5. Running dbt

```bash
# Install
pip install dbt-core dbt-postgres  # or dbt-bigquery, dbt-snowflake

# Initialize project
dbt init my_project

# Run all models (creates views/tables in warehouse)
dbt run

# Run only a specific model and its dependencies
dbt run --select fct_revenue+

# Test data quality
dbt test

# Check source freshness
dbt source freshness

# Generate and serve documentation
dbt docs generate
dbt docs serve  # Opens http://localhost:8080 with lineage graph
```

---

## Senior-Level Insights

### Materialization Strategy

| Materialization | When to Use                    | Tradeoff                       |
| --------------- | ------------------------------ | ------------------------------ |
| `view`          | Staging models, rarely queried | Always fresh, slow to query    |
| `table`         | Frequently queried marts       | Fast, costs storage            |
| `incremental`   | Large tables, append-only      | Complex, but avoids full scans |
| `ephemeral`     | Intermediate CTEs              | No storage, just a macro       |

```sql
-- Incremental model: only process new rows
{{ config(
    materialized='incremental',
    unique_key='order_id'
) }}

SELECT * FROM {{ ref('stg_orders') }}

{% if is_incremental() %}
WHERE created_at > (SELECT MAX(created_at) FROM {{ this }})
{% endif %}
```

### The dbt Contract with Stakeholders

When you write a dbt model, you're **making a promise** to downstream dashboard/BI users:

- "This table will exist"
- "These columns will be here"
- "The data will be accurate (tested)"
- "The data will be fresh (source freshness checks)"

This is why `schema.yml` with tests is not optional — it's the contract.

---

## Hands-on Lab

### Exercise 1: Build a Staging Model

Given this raw table:

```sql
-- raw.customers: id, Name, Email, country_code, sign_up_date, is_active
```

Write `stg_customers.sql` that:

1. Renames `id` to `customer_id`
2. Lowercases and trims `Email` → `email`
3. Title-cases `Name` → `customer_name`  
4. Maps `country_code` using a CASE statement to full names (US→'United States', IN→'India', GB→'United Kingdom', else→'Other')
5. Removes inactive records (`is_active = false`)

### Exercise 2: Write a Mart Model with ref()

```sql
-- Write fct_monthly_revenue.sql
-- It should aggregate fct_revenue (that you'll reference with ref())
-- by year-month and customer_segment
-- Output columns: year_month, customer_segment, total_revenue, order_count, avg_order_value
```

### Exercise 3: Write schema.yml Tests

For the `fct_monthly_revenue` model from Exercise 2, write a `schema.yml` with:

- `year_month` + `customer_segment` combination must be unique (use `dbt_utils.unique_combination_of_columns`)
- `total_revenue` must be not null and ≥ 0
- `customer_segment` must be one of the accepted values
- Add a model-level description explaining what this table represents

---

## Mastery Check

**Q1**: What does `{{ ref('stg_orders') }}` do in a dbt model?
<details><summary>Answer</summary>
It creates a dependency declaration — dbt knows to build `stg_orders` before the current model. It also resolves to the correct warehouse location (schema + table name) automatically, making models portable across environments.
</details>

**Q2**: What is the difference between a `view` and `table` materialization?
<details><summary>Answer</summary>
A `view` is a stored query — it recomputes every time it's queried (always fresh, no storage cost, but slow for complex queries). A `table` persists the result (fast to query, uses storage, but only as fresh as the last `dbt run`).
</details>

**Q3**: You add a `not_null` test to `order_id`. When does it actually execute?
<details><summary>Answer</summary>
When you run `dbt test`. It does NOT run automatically with `dbt run`. In production, you schedule both `dbt run` and `dbt test` in your orchestration pipeline (e.g., Airflow).
</details>

**Q4**: What does a freshness check in dbt do?
<details><summary>Answer</summary>
It queries the `loaded_at_field` column in your source table and compares the most recent timestamp to the current time. If it's older than `warn_after`, dbt warns. If older than `error_after`, dbt errors. This alerts you when your data pipeline is delayed.
</details>

**Q5**: Why is `{{ source('raw', 'orders') }}` better than hardcoding `raw_data.orders` in your SQL?
<details><summary>Answer</summary>
`source()` enables: (1) freshness checks, (2) lineage tracking in dbt docs, (3) environment-aware schema resolution (dev vs prod), (4) source catalog documentation. Hardcoding bypasses all these benefits.
</details>

---

## Summary

- ✅ **dbt = SQL + software engineering**: version control, testing, documentation, lineage
- ✅ **Models are SELECT statements**: Simple SQL files transformed into views/tables
- ✅ **ref() enforces dependency order**: dbt builds models in the correct sequence
- ✅ **Tests are the contract**: `not_null`, `unique`, `accepted_values` ensure data quality

**Tomorrow → Phase 7 Capstone**: You've now mastered the full modern BI stack. Time to build.
