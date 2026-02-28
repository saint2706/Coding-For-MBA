---
day: 127
title: "Lakehouse Architecture — Databricks, Unity Catalog, Delta Live Tables"
phase: 11
phaseTitle: "Cloud Data Engineering"
slug: "lakehouse-architecture"
duration: 90
difficulty: "advanced"
tags:
  - databricks
  - lakehouse
  - delta-live-tables
  - unity-catalog
  - spark
concepts:
  - "lakehouse paradigm"
  - "Unity Catalog for data governance"
  - "Delta Live Tables for declarative ETL"
  - "medallion architecture at scale"
  - "photon engine optimization"
prerequisites:
  - "Day 122: Object Storage"
  - "Day 123: Cloud Data Warehouses"
outcomes:
  - "Explain the lakehouse architecture and its advantages"
  - "Design a Unity Catalog namespace for multi-team governance"
  - "Build a declarative ETL pipeline with Delta Live Tables"
---

# 🏠 Day 127: Lakehouse Architecture — Databricks, Unity Catalog, Delta Live Tables

> *"The lakehouse ended the data lake vs. data warehouse debate — by combining the best of both into a single platform."*

---

## The "Never-Coded" Bridge

**Data lakes** are like a giant filing room — cheap, stores everything, but chaotic. No schema enforcement, no ACID transactions, no way to efficiently query without reading everything. **Data warehouses** are like a perfectly organized library — fast queries, strong governance, but expensive and can only store structured data.

The **lakehouse** is both: store everything cheaply in open formats (like a data lake), but with transactions, schema enforcement, and SQL performance (like a warehouse). Databricks pioneered this with **Delta Lake** as the storage layer and **Unity Catalog** as the governance layer.

---

## The Technical Deep Dive

### 1. Lakehouse vs. Lake vs. Warehouse

| Feature                | Data Lake                | Data Warehouse     | Lakehouse             |
| ---------------------- | ------------------------ | ------------------ | --------------------- |
| **Storage**            | Object storage           | Proprietary format | Object storage (open) |
| **Format**             | Any (CSV, JSON, Parquet) | Proprietary        | Delta Lake / Iceberg  |
| **ACID Transactions**  | ❌ No                     | ✅ Yes              | ✅ Yes                 |
| **Schema Enforcement** | ❌ No                     | ✅ Yes              | ✅ Yes                 |
| **SQL Performance**    | 🐌 Slow                   | 🚀 Fast             | 🚀 Fast (Photon)       |
| **ML/DS Workloads**    | ✅ Yes                    | ❌ Limited          | ✅ Yes                 |
| **Unstructured Data**  | ✅ Yes                    | ❌ No               | ✅ Yes                 |
| **Cost**               | 💰 Low                    | 💰💰💰 High           | 💰💰 Medium             |
| **Governance**         | ❌ Manual                 | ✅ Built-in         | ✅ Unity Catalog       |

### 2. Databricks Architecture

```python
# Databricks Workspace Organization
workspace = {
    "catalog": "prod_analytics",           # Unity Catalog top-level namespace
    "schemas": {
        "bronze": "Raw data, as-ingested",
        "silver": "Cleaned, typed, deduplicated",
        "gold": "Business-ready aggregates and features",
    },
    "tables": {
        "bronze.raw_orders": "Delta table, append-only, partitioned by date",
        "silver.clean_orders": "Delta table, incremental merge, deduplicated",
        "gold.daily_revenue": "Delta table, aggregated, powers dashboards",
    },
}

# Unity Catalog: Three-level namespace
# catalog.schema.table → prod_analytics.gold.daily_revenue
# This enables:
# 1. Multi-workspace governance (dev/staging/prod share the same catalog)
# 2. Fine-grained access control (column-level, row-level)
# 3. Lineage tracking (who reads what, where does data flow)
# 4. Data discovery (search across all catalogs)
```

### 3. Delta Live Tables (DLT) — Declarative Pipelines

```python
# DLT: Declare WHAT you want, not HOW to process it
# Databricks handles incremental processing, error handling, and data quality

import dlt
from pyspark.sql.functions import col, when, current_timestamp

@dlt.table(
    name="raw_orders",
    comment="Bronze: Raw orders from source system",
    table_properties={"quality": "bronze"},
)
def raw_orders():
    return (
        spark.readStream
        .format("cloudFiles")  # Auto Loader
        .option("cloudFiles.format", "json")
        .option("cloudFiles.schemaLocation", "/checkpoints/raw_orders")
        .load("s3://raw-bucket/orders/")
    )

@dlt.table(
    name="clean_orders",
    comment="Silver: Cleaned and validated orders",
    table_properties={"quality": "silver"},
)
@dlt.expect_or_drop("valid_amount", "total_amount > 0")
@dlt.expect_or_drop("valid_date", "order_date IS NOT NULL")
@dlt.expect("reasonable_amount", "total_amount < 100000", on_violation="warn")
def clean_orders():
    return (
        dlt.read_stream("raw_orders")
        .withColumn("total_amount", col("total_amount").cast("decimal(12,2)"))
        .withColumn("order_date", col("order_date").cast("date"))
        .withColumn("processed_at", current_timestamp())
        .dropDuplicates(["order_id"])
    )

@dlt.table(
    name="daily_revenue",
    comment="Gold: Daily revenue aggregates",
    table_properties={"quality": "gold"},
)
def daily_revenue():
    return (
        dlt.read("clean_orders")
        .groupBy("order_date", "region")
        .agg(
            {"total_amount": "sum", "order_id": "countDistinct"}
        )
        .withColumnRenamed("sum(total_amount)", "total_revenue")
        .withColumnRenamed("count(DISTINCT order_id)", "total_orders")
    )
```

### 4. Unity Catalog Governance

```sql
-- Grant fine-grained access to different teams

-- Data engineers: full access to all schemas
GRANT ALL PRIVILEGES ON CATALOG prod_analytics TO `data-engineers`;

-- Analysts: read-only to silver and gold
GRANT USAGE ON CATALOG prod_analytics TO `analysts`;
GRANT SELECT ON SCHEMA prod_analytics.silver TO `analysts`;
GRANT SELECT ON SCHEMA prod_analytics.gold TO `analysts`;

-- ML engineers: read gold, write to features schema
GRANT SELECT ON SCHEMA prod_analytics.gold TO `ml-engineers`;
GRANT ALL PRIVILEGES ON SCHEMA prod_analytics.features TO `ml-engineers`;

-- Row-level security: analysts only see their region
CREATE FUNCTION region_filter(region STRING)
RETURN IF(IS_ACCOUNT_GROUP_MEMBER('global-analysts'), true, region = current_user_region());

ALTER TABLE prod_analytics.gold.daily_revenue
SET ROW FILTER region_filter ON (region);

-- Column masking: hide PII from non-privileged users
CREATE FUNCTION mask_email(email STRING)
RETURN IF(IS_ACCOUNT_GROUP_MEMBER('pii-access'), email, REGEXP_REPLACE(email, '(.).*@', '***@'));

ALTER TABLE prod_analytics.silver.customers
ALTER COLUMN email SET MASK mask_email;
```

---

## Senior-Level Insights

### Photon: Databricks' Secret Weapon

Photon is Databricks' C++ query engine that replaces the Spark SQL engine for supported operations. It's 3-12x faster for SQL workloads and costs the same (included in SQL warehouses and premium clusters). Always use Photon-enabled clusters for SQL analytics workloads.

### The Vendor Lock-in Question

Databricks uses Delta Lake (open source) on open storage (S3/GCS/ADLS). Your data is never locked in — you can read Delta tables from Spark, Trino, Presto, or any engine that supports the Delta protocol. However, Unity Catalog and DLT are Databricks-specific — that governance layer doesn't transfer.

---

## Hands-on Lab

### Exercise 1: Design a Unity Catalog Namespace

```python
# Scenario: A retail company with these teams:
# - Data Engineering (build pipelines)
# - Marketing Analytics (campaign reporting)
# - Finance (revenue reconciliation, PII access)
# - ML Team (features, model training)

# TODO: Design the catalog/schema hierarchy and access matrix
# Include: which teams can read/write which schemas
# Consider: PII columns, row-level security by region
```

### Exercise 2: DLT Quality Expectations

```python
# TODO: Write DLT expectations for a customer table:
# 1. email must not be null
# 2. email must match a basic regex pattern
# 3. age must be between 13 and 120 (warn, don't drop)
# 4. created_at must not be in the future (drop bad rows)
# 5. country_code must be a valid 2-letter ISO code
```

### Exercise 3: Lakehouse Migration Plan

```
Scenario: A company currently uses:
- 30 TB in PostgreSQL (OLTP + analytics queries causing slowdowns)
- 100 GB of CSV files on a shared drive
- 20 Python scripts run manually by analysts

TODO: Design a lakehouse migration plan:
1. What goes into bronze/silver/gold?
2. What should use streaming vs batch ingestion?
3. How do you handle the transition period (old + new systems)?
4. What governance policies do you set up in Unity Catalog?
```

---

## Mastery Check

**Q1**: What problem does the lakehouse solve that data lakes and warehouses individually cannot?
<details><summary>Answer</summary>
Data lakes have cheap storage for all data types but lack transactions, governance, and query performance. Warehouses have great SQL performance and governance but can't handle unstructured data and are expensive. The lakehouse provides ACID transactions, schema enforcement, and fast SQL queries on top of cheap object storage — supporting both BI and ML workloads from a single copy of the data.
</details>

**Q2**: What is the purpose of DLT expectations (`@dlt.expect_or_drop`)?
<details><summary>Answer</summary>
DLT expectations define data quality rules inline with your pipeline. `expect_or_drop` removes rows that fail the check (e.g., null emails), `expect` logs a warning but keeps the row, and `expect_or_fail` halts the entire pipeline on violation. This provides built-in data quality monitoring without external frameworks — quality metrics appear in the DLT dashboard.
</details>

**Q3**: How does Unity Catalog differ from database-level GRANT statements?
<details><summary>Answer</summary>
Unity Catalog provides centralized, cross-workspace governance — one set of permissions applies across all Databricks workspaces (dev, staging, prod). It also adds column masking, row-level security, data lineage, and audit logging that simple GRANT statements don't provide. Think of it as a governance layer above individual databases.
</details>

**Q4**: What is Databricks Auto Loader and why is it preferred over manual file listing?
<details><summary>Answer</summary>
Auto Loader (`cloudFiles`) automatically detects and processes new files as they arrive in cloud storage. It uses cloud notifications (S3 SNS/SQS or GCS Pub/Sub) instead of listing all files — which is critical when you have millions of files in a directory. File listing at that scale is slow and expensive; Auto Loader scales to billions of files with constant-time detection.
</details>

**Q5**: Should you always use the lakehouse pattern? When might a traditional warehouse be better?
<details><summary>Answer</summary>
A traditional warehouse (Snowflake, BigQuery) may be better when: (1) your data is 100% structured/tabular, (2) you have no ML workloads, (3) your team doesn't have Spark expertise, (4) you want fully managed with zero operations. The lakehouse shines when you need ML + BI on the same data, have mixed structured/unstructured data, or need fine-grained governance at scale.
</details>

---

## Summary

- ✅ **Lakehouse** = data lake cost and flexibility + warehouse performance and governance
- ✅ **Delta Lake** provides ACID transactions, time travel, and schema enforcement on object storage
- ✅ **Unity Catalog** provides centralized governance: permissions, lineage, masking, auditing
- ✅ **Delta Live Tables** provides declarative ETL with built-in data quality expectations
- ✅ **Photon engine** delivers 3-12x SQL performance improvement over vanilla Spark

**Tomorrow → Day 128**: **Data Contracts and Quality** — Great Expectations, Soda, and the discipline of treating data like a product.
