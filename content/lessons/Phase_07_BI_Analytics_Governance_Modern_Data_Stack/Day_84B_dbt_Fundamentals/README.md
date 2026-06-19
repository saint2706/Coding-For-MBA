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

## Run This For Real: BrightCart's dbt Project

Everything in this lesson — models, sources, tests, freshness checks — is demonstrated against a real, runnable project, not just code snippets to read. `extras/sample_dbt_project/` (sibling folder to this phase's lessons) is a working dbt-duckdb project for **BrightCart**, the Phase 7 running-example DTC retailer, seeded with 20 customers and 25 orders. Get it running before reading further — the rest of this lesson's examples reference this exact project:

```bash
pip install dbt-duckdb
cd content/lessons/Phase_07_BI_Analytics_Governance_Modern_Data_Stack/extras/sample_dbt_project
export DBT_PROFILES_DIR=$(pwd)   # uses the local profiles.yml — no warehouse account needed
dbt deps && dbt seed && dbt run && dbt test
```

**Expected output**: `dbt seed` loads 20 rows into `raw_customers` and 25 rows into `raw_orders`. `dbt run` builds `stg_customers` (18 rows — 2 inactive customers filtered), `stg_orders`, `int_order_items` (21 rows — completed orders only), `fct_revenue` (21 rows, totaling **$1,697.79**), and `dim_customers` (18 rows, 4 with `lifetime_revenue_usd = 0`). `dbt test` runs 17 tests, all passing.

This is the same project Phase 7 Day 84C extends with a semantic layer, and the same dataset Phase 7 Day 84's capstone is pinned to — what you build here is not a throwaway exercise.

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

### 6. Macros and Jinja: Don't Repeat Your SQL

A macro is a reusable Jinja function that generates SQL. If you find yourself copy-pasting the same `CASE` statement into three models, write a macro instead:

```sql
-- macros/usd_value_tier.sql
{% macro usd_value_tier(column_name) %}
    CASE
        WHEN {{ column_name }} >= 100 THEN 'high_value'
        WHEN {{ column_name }} >= 50  THEN 'mid_value'
        ELSE 'low_value'
    END
{% endmacro %}
```

```sql
-- used in a model:
SELECT order_id, {{ usd_value_tier('amount_usd') }} AS order_value_tier
FROM {{ ref('int_order_items') }}
```

**Why it matters**: `extras/sample_dbt_project/models/marts/fct_revenue.sql` inlines this exact tiering logic directly in the model. That's fine for one model — but the moment a second model needs the same tier definition, inlining it twice creates the same "two numbers in one meeting" risk this lesson opened with. Macros are how dbt avoids that at the SQL level.

### 7. Packages

`packages.yml` declares external dbt code you depend on — most commonly [dbt-utils](https://github.com/dbt-labs/dbt-utils) for tests like `accepted_range` and `unique_combination_of_columns` used throughout this lesson and in `extras/sample_dbt_project/packages.yml`:

```yaml
# packages.yml
packages:
  - package: dbt-labs/dbt_utils
    version: [">=1.1.0", "<2.0.0"]
```

Run `dbt deps` to install — this is the first command in this lesson's setup, and skipping it is why `dbt_utils.accepted_range` tests fail with "macro not found" errors.

### 8. Docs and Exposures

`dbt docs generate` builds a static site with column-level descriptions and a lineage DAG, sourced from the `description:` fields in your `schema.yml` (see `extras/sample_dbt_project/models/marts/schema.yml` for real examples). **Exposures** extend this lineage one hop further, declaring that a dashboard or reverse-ETL sync (not just another dbt model) depends on a mart:

```yaml
# models/marts/schema.yml (exposures block)
exposures:
  - name: executive_revenue_dashboard
    type: dashboard
    depends_on:
      - ref('fct_revenue')
    owner:
      name: BI Team
      email: bi-team@brightcart.example
```

This is what lets `dbt docs` answer "if I change `fct_revenue`, what breaks downstream?" — including BI tools dbt itself can't see.

### 9. Snapshots: Tracking Slowly Changing Dimensions (SCDs)

Models show you the *current* state of data. **Snapshots** capture how a row changed *over time* — e.g., if a BrightCart customer's `country` changes after a house move, a snapshot preserves both the old and new value with valid-from/valid-to timestamps:

```yaml
# snapshots/customers_snapshot.yml
snapshots:
  - name: customers_snapshot
    relation: source('raw', 'raw_customers')
    config:
      unique_key: id
      strategy: timestamp
      updated_at: sign_up_date
```

Without snapshots, a `dbt run` that re-reads the latest `raw_customers` state silently overwrites history — you lose the ability to answer "what country was this customer in when they made that purchase?"

### 10. Incremental Models in Practice

The Senior-Level Insights section below shows the syntax; the operational risk is this: an incremental model that filters `WHERE created_at > (SELECT MAX(created_at) FROM {{ this }})` will silently miss **late-arriving** or **updated** rows with an older timestamp than your last run. This is why incremental models need a `unique_key` (so a re-inserted row is updated, not duplicated) and, often, a wider lookback window (e.g., "last 3 days," not just "since max(created_at)") to absorb late data.

### 11. Model Contracts and Unit Tests

A **contract** (`dbt_project.yml` or model `config`) pins a model's column names and data types — if someone changes the model in a way that breaks the contract, `dbt run` fails loudly instead of letting a silently-renamed column break a downstream dashboard:

```yaml
models:
  - name: fct_revenue
    config:
      contract:
        enforced: true
    columns:
      - name: order_id
        data_type: varchar
      - name: amount_usd
        data_type: double
```

**Unit tests** (dbt 1.8+) test model *logic* against hand-written fake input rows, rather than testing real data like `dbt test` does:

```yaml
unit_tests:
  - name: test_order_value_tier_boundaries
    model: fct_revenue
    given:
      - input: ref('int_order_items')
        rows:
          - {order_id: 1, amount_usd: 99.99, customer_id: 1}
          - {order_id: 2, amount_usd: 100.00, customer_id: 1}
    expect:
      rows:
        - {order_id: 1, order_value_tier: 'mid_value'}
        - {order_id: 2, order_value_tier: 'high_value'}
```

This catches the classic off-by-one boundary bug (is $100.00 "mid" or "high"?) before it ever touches real BrightCart data.

### 12. Seeds and Environment Configuration

**Seeds** (`dbt seed`) load small, static CSVs into the warehouse as tables — this is how `extras/sample_dbt_project/seeds/raw_orders.csv` and `raw_customers.csv` get loaded; seeds are for reference/lookup data and demo fixtures, not for your actual production source data pipeline.

**Environment configuration** (`profiles.yml` + `DBT_PROFILES_DIR` + dbt Cloud "environments," or `target:` in `profiles.yml`) controls which warehouse/schema/credentials a `dbt run` uses. This lesson's local lab sets `DBT_PROFILES_DIR` to point at a local DuckDB file specifically so no warehouse account or secret credentials are needed — in production, dev and prod targets point at different schemas (or different warehouses entirely) so a developer's `dbt run` never touches production tables.

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

### Production Workflow: How dbt Actually Ships

A solo `dbt run` on a laptop is the learning environment, not the production pattern. In a real BrightCart analytics engineering team:

1. **Git branches**: Every model change happens on a feature branch, reviewed via pull request — same as application code.
2. **CI on every PR**: A CI job runs `dbt build` (run + test) against a CI schema before merge. This catches a broken model or failing test before it reaches main.
3. **State-based selection (`--select state:modified+`)**: Instead of rebuilding the entire project on every CI run, dbt compares the PR's compiled manifest to the last successful prod run's manifest (`--state`) and rebuilds only changed models and their downstream dependents. This is what makes CI fast on a 500-model project instead of rerunning everything every time.
4. **Deferral (`--defer`)**: CI builds your changed models in an isolated schema, but *defers* unchanged upstream models to prod — so your CI run doesn't need to rebuild the entire DAG from raw sources, just the part you touched. Together, `state:modified+` and `--defer` are what dbt calls **Slim CI**.
5. **Deployment jobs**: After merge, a scheduled or triggered job (dbt Cloud job, Airflow task, GitHub Actions on a cron) runs `dbt build` against production, producing fresh `manifest.json`/`run_results.json` **artifacts** that the next CI run's `--state` comparison depends on.
6. **Observability**: Deployment jobs should alert (Slack, PagerDuty, email) on `dbt test` failures and `dbt source freshness` STALE results — not just log them to a console nobody reads.
7. **Rollback**: If a deployed model change breaks downstream dashboards, the fastest fix is usually `git revert` the merge commit and rerun the deployment job — not a fast, ad hoc fix forward under pressure. Keep production deployable from any commit on main.

### Pitfalls: Where dbt Projects Actually Break

* **Circular references**: Model A refs Model B, which refs Model A. dbt will refuse to compile with a "found a cycle" error — the fix is almost always that one of the two models has business logic that belongs in a third, lower-level model both can reference.
* **Unsafe incremental logic**: As noted above, an incremental model keyed only on `MAX(timestamp)` misses late-arriving and updated rows. Always pair `is_incremental()` with a `unique_key` and consider a lookback window wider than "since the last run."
* **`--full-refresh` risk**: Rerunning an incremental model with `--full-refresh` rebuilds it from scratch — necessary after a schema change, but dangerous on a multi-billion-row production table if triggered accidentally (it can be a multi-hour, expensive rebuild). Gate `--full-refresh` behind a manual approval step in CI/CD, not an automatic flag.
* **Freshness caveats**: `loaded_at_field` must resolve to a `TIMESTAMP`, not a `DATE` — `extras/sample_dbt_project/models/staging/sources.yml` documents exactly this bug: `raw_customers.sign_up_date` is a DATE column, and forgetting to `CAST(sign_up_date AS TIMESTAMP)` causes `dbt source freshness` to error with a type mismatch before it even gets to check staleness. Separately, note that a freshness check is only as good as `warn_after`/`error_after` thresholds that match real pipeline SLAs — thresholds copy-pasted from a tutorial are meaningless.
* **Source severity vs. test severity**: Not every failed test should block a deployment. dbt lets you set `severity: warn` (logs but doesn't fail the run) vs. `severity: error` (fails the run) per test — reserve `error` for tests where bad data must never reach a dashboard, and use `warn` for tests you're still tuning.
* **Warehouse cost**: Every `table`-materialized model and every `dbt run` execution costs warehouse compute (see Phase 7 Day 83's bytes-scanned economics). A project with 200 `table` models that all rebuild on every nightly run, when only 10 actually changed, is paying for 190 unnecessary rebuilds — this is exactly the problem Slim CI's `state:modified+` selection solves for deployment, and `materialized='incremental'` solves for any single large table.

---

## Hands-on Lab

### Exercise 1: Build a Staging Model (Check Your Work Against the Real Project)

Using `extras/sample_dbt_project/seeds/raw_customers.csv` (`id, Name, Email, country_code, sign_up_date, is_active` — 20 rows), write `stg_customers.sql` that:

1. Renames `id` to `customer_id`
2. Lowercases and trims `Email` → `email`
3. Title-cases `Name` → `customer_name`
4. Maps `country_code` using a CASE statement to full names (US→'United States', IN→'India', GB→'United Kingdom', else→'Other')
5. Removes inactive records (`is_active = false`)

**Don't guess at the answer — compare your work against the real model**: `extras/sample_dbt_project/models/staging/stg_customers.sql` implements exactly this spec (note DuckDB has no `INITCAP()`, so the title-casing there uses `LIST_TRANSFORM`/`STRING_SPLIT`/`ARRAY_TO_STRING` instead — a portable workaround worth understanding even if your warehouse has `INITCAP()`). Run `dbt run --select stg_customers` after `dbt seed` and confirm you get **18 rows** (20 seeded customers minus 2 inactive: ids 106 and 115).

### Exercise 2: Write a Mart Model with ref()

Extend `extras/sample_dbt_project` with a new mart, `fct_monthly_revenue.sql`, that aggregates `fct_revenue` (referenced with `ref('fct_revenue')`) by year-month:

```
-- Output columns: year_month, order_count, total_revenue_usd, avg_order_value_usd
```

**Expected output**, using the seed data as-is: all 21 completed orders fall in April 2025, so your aggregation should produce exactly **one row**: `year_month = '2025-04'`, `order_count = 21`, `total_revenue_usd = 1697.79`, `avg_order_value_usd ≈ 80.85`. If you get more than one row, check whether you're grouping by the full timestamp instead of truncating to year-month.

### Exercise 3: Write schema.yml Tests (and Watch One Fail on Purpose)

For the `fct_monthly_revenue` model from Exercise 2, write a `schema.yml` with:

- `year_month` must be unique (one row per month in this seed)
- `total_revenue_usd` must be not null and use `dbt_utils.accepted_range` with `arguments: {min_value: 0}` (note the nested `arguments:` key — the flat `min_value:` form is deprecated, as shown in `extras/sample_dbt_project/models/marts/schema.yml`)
- Add a model-level `description:` explaining what this table represents

**Now break it on purpose, to see what a failing test actually looks like**: temporarily edit a row in `seeds/raw_orders.csv` to set one `amount_cents` to a negative number, rerun `dbt seed && dbt run && dbt test`, and read the failure. A real run against this exact change produces:

```
Failure in test dbt_utils_accepted_range_fct_revenue_amount_usd__0... (marts/schema.yml)
Got 1 result, configured to fail if != 0
```

This is what a production data-quality catch looks like — `dbt test` doesn't show you the bad row by default, just the count, which is why pairing tests with a query you can run manually (`SELECT * FROM fct_revenue WHERE amount_usd < 0`) is part of triaging a real test failure. Revert your seed edit and rerun before moving on.

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

## Cross-References

* **Phase 7 Day 73**: SQL window-function queries — the analytical SQL patterns your dbt marts often wrap.
* **Phase 7 Day 80**: Data quality tests and RACI/stewardship — the governance thinking behind `schema.yml` tests.
* **Phase 7 Day 81**: Star schema design — the `fact_orders`/`dim_customers` pattern this lesson's `fct_revenue`/`dim_customers` implements in dbt.
* **Phase 7 Day 83**: Cloud warehouse cost economics — relevant to the "warehouse cost" pitfall and incremental-model motivation above.
* **Phase 7 Day 84C**: Reverse ETL & Semantic Layer — extends this exact `sample_dbt_project` with a metrics layer and a sync job that reads from `fct_revenue`.

---

## Glossary

* **Model**: A `.sql` file containing a `SELECT` statement that dbt compiles and runs as a view, table, or other materialization.
* **ref()**: A Jinja function that declares a dependency on another dbt model, letting dbt resolve build order and environment-specific schema names automatically.
* **source()**: A Jinja function that declares a dependency on a raw, non-dbt-managed table, enabling freshness checks and lineage tracking.
* **Freshness**: A check comparing a source table's most recent `loaded_at_field` timestamp to the current time, warning or erroring if data is stale.
* **Materialization**: The physical strategy (`view`, `table`, `incremental`, `ephemeral`) dbt uses to persist a model's output.
* **Seed**: A small, static CSV loaded into the warehouse as a table via `dbt seed` — used for reference data and, in this lesson, the BrightCart demo fixtures.
* **Snapshot**: A dbt feature that captures how a row changes over time, preserving history that a regular model (which only shows current state) would overwrite.
* **Macro**: A reusable Jinja function that generates SQL, used to avoid duplicating logic (like a tiering `CASE` statement) across multiple models.
* **Lineage**: The dependency graph (built from `ref()`/`source()` calls) showing how data flows from raw sources through models to marts — viewable via `dbt docs serve`.
* **Contract**: A pinned set of column names/types on a model that causes `dbt run` to fail loudly if violated, protecting downstream consumers from silent breaking changes.
* **Slim CI**: The combination of `--select state:modified+` and `--defer` that lets CI rebuild only changed models and their dependents instead of the entire project.

---

## Summary

- ✅ **dbt = SQL + software engineering**: version control, testing, documentation, lineage
- ✅ **Models are SELECT statements**: Simple SQL files transformed into views/tables
- ✅ **ref() enforces dependency order**: dbt builds models in the correct sequence
- ✅ **Tests are the contract**: `not_null`, `unique`, `accepted_values` ensure data quality
- ✅ **Production dbt is a CI/CD pipeline**: Slim CI, deployment jobs, artifacts, and observability — not just a local `dbt run`

**Tomorrow → Phase 7 Capstone**: You've now mastered the full modern BI stack. Time to build.
