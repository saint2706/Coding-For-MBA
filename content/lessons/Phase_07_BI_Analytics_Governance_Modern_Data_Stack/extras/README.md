# Phase 7 Extras

This folder contains supplementary materials for Phase 7: BI Analytics, Governance & Modern Data Stack.

## Contents

### `sample_dbt_project/`

A scaffold dbt project matching the structure introduced in Day 84B (dbt Fundamentals) and Day 84C (Reverse ETL & Semantic Layer).

**Use this to:**

- Run a real dbt project locally (requires dbt-core + a DuckDB or Postgres connection)
- Understand the recommended folder structure for staging → intermediate → marts
- See working examples of `schema.yml` tests and source definitions

### `metrics_layer_example.yml`

Example dbt Semantic Layer / MetricFlow metric definitions covering:

- `total_mrr` — simple measure with status filter
- `subscriber_count` — count of active subscriptions
- `arpu` — ratio metric (MRR / subscriber_count)

Reference this when completing Day 84C Exercise 2.

---

## Quick Start (dbt local dev)

```bash
# Install dbt with DuckDB adapter (no database server needed)
pip install dbt-duckdb

# Navigate to the sample project
cd sample_dbt_project/

# Install dependencies
dbt deps

# Run all models (creates DuckDB file automatically)
dbt run

# Run tests
dbt test

# Generate and view documentation
dbt docs generate
dbt docs serve
```

## File Structure

```
extras/
├── README.md                          (this file)
├── metrics_layer_example.yml          (dbt Semantic Layer example)
└── sample_dbt_project/
    ├── dbt_project.yml                (project config)
    ├── profiles.yml                   (DuckDB connection)
    ├── packages.yml                   (dbt-utils dependency)
    ├── models/
    │   ├── staging/
    │   │   ├── sources.yml
    │   │   ├── stg_orders.sql
    │   │   └── stg_customers.sql
    │   ├── intermediate/
    │   │   └── int_order_items.sql
    │   └── marts/
    │       ├── schema.yml
    │       ├── fct_revenue.sql
    │       └── dim_customers.sql
    └── seeds/
        ├── raw_orders.csv
        └── raw_customers.csv
```
