---
day: 122
title: "Object Storage — S3, GCS, Delta Lake, Iceberg"
phase: 11
phaseTitle: "Cloud Data Engineering"
slug: "object-storage"
duration: 90
difficulty: "intermediate"
tags:
  - s3
  - gcs
  - delta-lake
  - iceberg
  - object-storage
concepts:
  - "object storage vs block storage"
  - "data lake architecture"
  - "open table formats (Delta Lake, Iceberg)"
  - "partitioning strategies"
  - "lifecycle policies"
prerequisites:
  - "Day 121: Cloud Fundamentals"
outcomes:
  - "Design a multi-tier data lake on S3/GCS"
  - "Compare Delta Lake and Apache Iceberg table formats"
  - "Implement lifecycle policies for cost optimization"
---

# 📦 Day 122: Object Storage — S3, GCS, Delta Lake, Iceberg

> *"Object storage is the foundation of every modern data platform — cheap, durable, infinitely scalable, and deceptively simple until you need to manage 10 million files."*

---

## The "Never-Coded" Bridge

**Think of object storage like a massive warehouse.**

A traditional database is like a filing cabinet — every document has a specific drawer, folder, and position. Object storage is like a warehouse with infinite shelf space — you give each box a label (key), store anything inside (any format, any size), and retrieve it by label. No rigid structure, but you need good labelling conventions or you'll never find anything.

**S3** and **GCS** are the warehouses. **Delta Lake** and **Iceberg** are the inventory management systems that make the warehouse behave like a database — with transactions, schema enforcement, and time travel.

---

## The Technical Deep Dive

### 1. Object Storage Fundamentals

```python
import boto3

# S3: Objects are stored in buckets with unique keys
s3 = boto3.client("s3")

# Upload a file
s3.upload_file(
    "sales_2025_01.parquet",
    Bucket="company-data-lake",
    Key="raw/sales/year=2025/month=01/sales_2025_01.parquet",
)

# Key anatomy: raw/sales/year=2025/month=01/sales_2025_01.parquet
#   └── prefix (acts as folder)
#       └── Hive-style partitioning (year=, month=)
#           └── object name

# List objects with prefix filtering (no real folders — just key prefixes)
response = s3.list_objects_v2(
    Bucket="company-data-lake",
    Prefix="raw/sales/year=2025/",
)
for obj in response.get("Contents", []):
    print(f"  {obj['Key']} — {obj['Size'] / 1e6:.1f} MB — {obj['LastModified']}")
```

### 2. Data Lake Architecture (Medallion Pattern)

```
┌──────────────────────────────────────────────────────────┐
│                    DATA LAKE TIERS                        │
├──────────┬──────────────┬────────────────────────────────┤
│  BRONZE  │    SILVER    │           GOLD                 │
│ (Raw)    │ (Cleaned)    │ (Business-Ready)               │
├──────────┼──────────────┼────────────────────────────────┤
│ s3://raw/│ s3://cleaned/│ s3://curated/                  │
│ CSV, JSON│ Parquet      │ Parquet (aggregated)           │
│ As-is    │ Deduplicated │ Joins, business logic          │
│ Append   │ Type-cast    │ SCD Type 2, metrics            │
│ only     │ Validated    │ Ready for BI / ML              │
└──────────┴──────────────┴────────────────────────────────┘
```

```python
# S3 bucket structure following medallion architecture
bucket_structure = {
    "company-data-lake": {
        "raw/": {
            "description": "Bronze layer — raw data as received",
            "format": "Original format (CSV, JSON, Avro)",
            "policy": "Immutable — never modify, append only",
            "partitioning": "source/year/month/day/",
            "retention": "7 years (regulatory)",
        },
        "cleaned/": {
            "description": "Silver layer — cleaned, typed, deduplicated",
            "format": "Parquet (columnar, compressed)",
            "policy": "Overwrite partitions during processing",
            "partitioning": "domain/entity/year/month/",
            "retention": "3 years",
        },
        "curated/": {
            "description": "Gold layer — business-ready aggregates",
            "format": "Parquet or Delta Lake",
            "policy": "Versioned, schema-enforced",
            "partitioning": "domain/metric/",
            "retention": "5 years",
        },
    }
}
```

### 3. Storage Tiers and Lifecycle Policies

```python
# S3 Storage Classes — choose by access frequency
storage_tiers = {
    "S3 Standard":            {"cost_gb": 0.023, "access": "Frequent",       "retrieval": "Instant"},
    "S3 Intelligent-Tiering": {"cost_gb": 0.023, "access": "Unknown",        "retrieval": "Instant"},
    "S3 Standard-IA":         {"cost_gb": 0.0125,"access": "Monthly",        "retrieval": "Instant"},
    "S3 Glacier Instant":     {"cost_gb": 0.004, "access": "Quarterly",      "retrieval": "Milliseconds"},
    "S3 Glacier Flexible":    {"cost_gb": 0.0036,"access": "Yearly",         "retrieval": "Minutes-Hours"},
    "S3 Glacier Deep Archive":{"cost_gb": 0.00099,"access":"Regulatory only", "retrieval": "12 hours"},
}

# Lifecycle policy: automatically transition data to cheaper tiers
lifecycle_policy = {
    "Rules": [
        {
            "ID": "ArchiveRawData",
            "Filter": {"Prefix": "raw/"},
            "Status": "Enabled",
            "Transitions": [
                {"Days": 30, "StorageClass": "STANDARD_IA"},
                {"Days": 90, "StorageClass": "GLACIER_IR"},
                {"Days": 365, "StorageClass": "DEEP_ARCHIVE"},
            ],
        },
        {
            "ID": "CleanupTempData",
            "Filter": {"Prefix": "tmp/"},
            "Status": "Enabled",
            "Expiration": {"Days": 7},
        },
    ]
}
# 10TB raw data: $230/mo → $10/mo after 1 year with lifecycle policies!
```

### 4. Open Table Formats — Delta Lake vs Iceberg

```python
# The problem: Parquet files in a data lake have no ACID transactions,
# no schema evolution, no time travel. Open table formats add these.

table_format_comparison = {
    "Delta Lake": {
        "creator": "Databricks",
        "transaction_log": "_delta_log/ (JSON + Parquet checkpoints)",
        "strengths": [
            "Best Spark integration",
            "MERGE (upsert) support",
            "Z-ORDER clustering for query performance",
            "Time travel via version numbers",
        ],
        "ecosystem": "Databricks, Spark, Flink, Trino",
    },
    "Apache Iceberg": {
        "creator": "Netflix → Apache Foundation",
        "transaction_log": "metadata/ (Avro + manifest files)",
        "strengths": [
            "Engine-agnostic (Spark, Trino, Flink, Dremio)",
            "Hidden partitioning (users don't need to know partition columns)",
            "Partition evolution (change partitioning without rewriting data)",
            "Row-level deletes without rewriting entire files",
        ],
        "ecosystem": "Snowflake, BigQuery, AWS Athena, Trino, Spark",
    },
}

# Delta Lake example with PySpark
"""
from delta import DeltaTable
import pyspark.sql.functions as F

# Write as Delta
df.write.format("delta").mode("overwrite").partitionBy("year", "month") \
    .save("s3://company/curated/sales_delta")

# Time travel — read data as of yesterday
yesterday_df = spark.read.format("delta") \
    .option("timestampAsOf", "2025-01-14") \
    .load("s3://company/curated/sales_delta")

# MERGE (upsert) — insert new rows, update existing
delta_table = DeltaTable.forPath(spark, "s3://company/curated/sales_delta")
delta_table.alias("target").merge(
    new_data.alias("source"),
    "target.order_id = source.order_id"
).whenMatchedUpdateAll() \
 .whenNotMatchedInsertAll() \
 .execute()
"""
```

---

## Senior-Level Insights

### The Small Files Problem

Writing many small Parquet files (< 128 MB) dramatically degrades query performance — each file requires metadata overhead and an I/O operation. Use compaction jobs to merge small files into larger ones (target: 128MB–1GB per file).

### Partitioning: The Make-or-Break Decision

Over-partition (e.g., by `customer_id` with 1M customers) and you get millions of tiny files. Under-partition (no partitioning) and every query scans everything. The sweet spot: partition by time (daily/monthly) and one high-cardinality business dimension (region, category).

---

## Hands-on Lab

### Exercise 1: Design a Data Lake Structure

```python
# Scenario: E-commerce company with these data sources:
# - Clickstream events (100M/day, JSON)
# - Orders (500K/day, from PostgreSQL CDC)
# - Product catalog (10K items, updated weekly)
# - Customer reviews (50K/day, unstructured text)

# TODO: Design the S3 bucket structure with:
# 1. Bronze/Silver/Gold tiers
# 2. Partitioning strategy for each source
# 3. File format for each tier
# 4. Lifecycle policy for cost optimization

data_lake_design = {}
```

### Exercise 2: Cost Comparison

```python
# Calculate annual storage cost for:
# - 50 TB of raw data (accessed daily for first month, then rarely)
# - 10 TB of processed data (queried frequently)
# - 5 TB of ML training data (accessed monthly for retraining)
# Compare: everything in S3 Standard vs. using lifecycle policies

def calculate_annual_cost(data_sizes: dict, use_lifecycle: bool) -> float:
    """TODO: Implement storage cost calculation with and without tiering."""
    pass
```

### Exercise 3: Delta Lake vs Iceberg Decision

For each scenario, choose Delta Lake or Iceberg and justify in 2 sentences:

1. A Databricks-first company running 100% on Spark.
2. A multi-engine environment using Trino for interactive queries and Spark for batch ETL.
3. A data platform that needs to frequently change partitioning strategies as query patterns evolve.

---

## Mastery Check

**Q1**: What is the key difference between object storage and a traditional filesystem?
<details><summary>Answer</summary>
Object storage uses a flat namespace with key-value pairs (no directory hierarchy, just key prefixes that simulate folders). It's optimized for large-scale reads/writes of complete objects, not random access within files. Traditional filesystems have real directories, support in-place file modification, and random byte-level access.
</details>

**Q2**: Why is the medallion (Bronze/Silver/Gold) architecture important?
<details><summary>Answer</summary>
It separates concerns: Bronze preserves raw data for auditability and reprocessing, Silver handles data quality and standardization, Gold delivers business-ready datasets. If a Gold table has issues, you can reprocess from Bronze without re-ingesting from source systems. This layered approach also enables different access controls, retention policies, and SLAs per tier.
</details>

**Q3**: What makes Delta Lake and Iceberg different from plain Parquet?
<details><summary>Answer</summary>
Plain Parquet is just a file format — no ACID transactions, no schema enforcement, no time travel. Delta Lake and Iceberg add a transaction log layer on top of Parquet files, enabling database-like features: atomic writes, schema evolution, merge/upsert operations, and the ability to query data as of any point in time.
</details>

**Q4**: A teammate suggests partitioning a 100M row table by user_id (500K unique users). What's wrong?
<details><summary>Answer</summary>
This creates 500K partitions with tiny files (200 rows each). Queries will suffer from excessive metadata overhead, S3 list operations, and I/O per file. Instead, partition by date (daily or monthly) and filter by user_id within partitions — most queries are time-bounded anyway.
</details>

**Q5**: How can lifecycle policies reduce storage costs without impacting query performance?
<details><summary>Answer</summary>
Lifecycle policies automatically move data to cheaper tiers based on age. Recent data (queried frequently) stays in Standard, older data transitions to IA/Glacier. Since most analytics queries focus on recent data (last 30-90 days), older data transitions don't affect interactive query performance but can reduce storage costs by 80-95%.
</details>

---

## Summary

- ✅ **Object storage** (S3, GCS) is infinitely scalable, durable, and cheap — the foundation of every data lake
- ✅ **Medallion architecture** (Bronze/Silver/Gold) separates raw, cleaned, and business-ready data
- ✅ **Lifecycle policies** automatically tier data, reducing storage costs by 80%+
- ✅ **Delta Lake**: Best for Databricks/Spark-first shops — ACID, time travel, Z-ORDER
- ✅ **Apache Iceberg**: Best for multi-engine environments — hidden partitioning, partition evolution, engine-agnostic

**Tomorrow → Day 123**: **Cloud Data Warehouses** — BigQuery, Snowflake, Redshift — how they actually work under the hood.
