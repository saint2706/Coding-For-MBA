---
day: 123
title: "Cloud Data Warehouses — BigQuery, Snowflake, Redshift"
phase: 11
phaseTitle: "Cloud Data Engineering"
slug: "cloud-data-warehouses"
duration: 90
difficulty: "intermediate"
tags:
  - bigquery
  - snowflake
  - redshift
  - data-warehouse
  - mpp
concepts:
  - "columnar storage"
  - "massively parallel processing (MPP)"
  - "compute-storage separation"
  - "slots vs virtual warehouses"
  - "materialized views"
prerequisites:
  - "Day 122: Object Storage"
  - "Day 86: SQL Fundamentals"
outcomes:
  - "Compare BigQuery, Snowflake, and Redshift architectures"
  - "Optimize query performance using partitioning and clustering"
  - "Design a cost-effective warehouse strategy for different workloads"
---

# 🏗️ Day 123: Cloud Data Warehouses — BigQuery, Snowflake, Redshift

> *"A cloud data warehouse isn't just a database in the sky — it's a query engine that reads terabytes in seconds, and bills you for every byte it touches."*

---

## The "Never-Coded" Bridge

**Think of cloud data warehouses like electricity.**

In the 1900s, every factory generated its own power. Today, you plug into the grid and pay for what you use. Cloud data warehouses did the same thing to analytics infrastructure — instead of maintaining your own Hadoop cluster, you write SQL and the cloud handles the rest. You pay per query (BigQuery), per compute-minute (Snowflake), or per node-hour (Redshift).

The key innovation is **separating storage from compute**. Your data sits in cheap object storage. When you run a query, the warehouse spins up compute to process it, then shuts down. You don't pay for idle servers staring at your data.

---

## The Technical Deep Dive

### 1. Architecture Comparison

| Architecture      | BigQuery                         | Snowflake                     | Redshift                     |
| ----------------- | -------------------------------- | ----------------------------- | ---------------------------- |
| **Storage**       | Capacitor (columnar)             | Micro-partitions (columnar)   | Columnar on attached SSDs    |
| **Compute**       | Slots (auto-allocated)           | Virtual Warehouses (T-shirt)  | Node clusters                |
| **Separation**    | Full (serverless)                | Full                          | Partial (RA3 nodes)          |
| **Scaling**       | Automatic                        | Manual resize / auto-scale    | Manual resize / Concurrency  |
| **Pricing Model** | Per TB scanned (on-demand)       | Per second of compute         | Per node-hour                |
| **Concurrency**   | 2,000 concurrent queries         | Multi-cluster warehouses      | Concurrency Scaling          |
| **Best For**      | Ad-hoc analytics, cost-optimized | Mixed workloads, data sharing | AWS-heavy shops, predictable |

### 2. BigQuery Deep Dive

```python
from google.cloud import bigquery

client = bigquery.Client(project="my-project")

# BigQuery pricing: $6.25/TB scanned (on-demand)
# Key optimization: only scan columns you need + use partitioning

# ❌ BAD: Scans entire table ($$$)
bad_query = "SELECT * FROM `project.dataset.sales`"

# ✅ GOOD: Scans only 3 columns + 1 partition
good_query = """
SELECT store_id, SUM(revenue) AS total_revenue, COUNT(*) AS orders
FROM `project.dataset.sales`
WHERE DATE(order_date) BETWEEN '2025-01-01' AND '2025-01-31'
  AND region = 'North'
GROUP BY store_id
ORDER BY total_revenue DESC
LIMIT 20
"""

# Check bytes before running (dry run)
job_config = bigquery.QueryJobConfig(dry_run=True, use_query_cache=False)
dry_run = client.query(good_query, job_config=job_config)
print(f"This query will scan {dry_run.total_bytes_processed / 1e9:.2f} GB")
print(f"Estimated cost: ${dry_run.total_bytes_processed / 1e12 * 6.25:.4f}")

# Partitioned + Clustered table (most important optimization)
create_optimized = """
CREATE TABLE `project.dataset.sales_optimized`
PARTITION BY DATE(order_date)
CLUSTER BY region, category
AS SELECT * FROM `project.dataset.sales`
"""
# Partitioning: prunes entire date partitions before scanning
# Clustering: sorts data within partitions for efficient column scanning
```

### 3. Snowflake Architecture

```python
# Snowflake uses Virtual Warehouses (VWs) for compute
# Sizes: XS ($1/hr) → 4XL ($128/hr)

snowflake_config = {
    "warehouses": {
        "ANALYTICS_XS": {
            "size": "X-SMALL",
            "auto_suspend": 60,        # Suspend after 60s idle
            "auto_resume": True,
            "min_cluster_count": 1,
            "max_cluster_count": 3,     # Multi-cluster for concurrency
            "use_case": "Ad-hoc analyst queries",
        },
        "ETL_MEDIUM": {
            "size": "MEDIUM",
            "auto_suspend": 120,
            "auto_resume": True,
            "min_cluster_count": 1,
            "max_cluster_count": 1,
            "use_case": "Scheduled ETL/ELT jobs",
        },
        "ML_LARGE": {
            "size": "LARGE",
            "auto_suspend": 300,
            "auto_resume": True,
            "use_case": "ML feature engineering, heavy transforms",
        },
    },
    "cost_optimization": [
        "Use auto-suspend (60-120s) to stop paying for idle compute",
        "Size-down warehouses for light workloads",
        "Use multi-cluster for concurrency instead of upsizing",
        "Separate ETL and analytics warehouses for cost attribution",
        "Monitor with WAREHOUSE_METERING_HISTORY view",
    ],
}
```

### 4. Query Optimization Patterns

```sql
-- Pattern 1: Avoid SELECT * (scan minimum columns)
-- ❌ SELECT * FROM sales WHERE date > '2025-01-01'
-- ✅
SELECT store_id, SUM(revenue) AS total
FROM sales
WHERE date > '2025-01-01'
GROUP BY store_id;

-- Pattern 2: Use approximate functions for exploration
SELECT APPROX_COUNT_DISTINCT(customer_id) AS unique_customers
FROM sales;
-- 100x faster than COUNT(DISTINCT ...) for exploration

-- Pattern 3: Materialized views for repeated expensive queries
CREATE MATERIALIZED VIEW mv_daily_revenue AS
SELECT
    date,
    region,
    SUM(revenue) AS total_revenue,
    COUNT(DISTINCT store_id) AS active_stores
FROM sales
GROUP BY date, region;
-- Subsequent queries hit the pre-computed view automatically

-- Pattern 4: Use window functions instead of self-joins
-- ❌ Self-join for MoM comparison (scans table twice)
-- ✅ Window function (single scan)
SELECT
    date,
    revenue,
    LAG(revenue) OVER (ORDER BY date) AS prev_day,
    revenue - LAG(revenue) OVER (ORDER BY date) AS daily_change
FROM daily_totals;
```

---

## Senior-Level Insights

### The "Flat Rate vs Pay-Per-Query" Decision

BigQuery on-demand ($6.25/TB) is cheapest for sporadic usage. But at scale (>1TB/day scanned), BigQuery flat-rate slots ($2,000/month for 100 slots) or Snowflake become more predictable. Model your workload before committing.

### Data Sharing: Snowflake's Killer Feature

Snowflake's data sharing lets you share live data with partners, vendors, or other business units **without copying it**. The consumer pays for compute on their own account. This is transformative for organizations with multiple teams or B2B data products.

---

## Hands-on Lab

### Exercise 1: Cost Estimation

```python
# Your analytics team runs 200 queries/day averaging 500GB scanned per query.
# Compare monthly costs for: BigQuery on-demand, BigQuery flat-rate, Snowflake Medium VW

def compare_warehouse_costs(
    queries_per_day: int,
    avg_gb_scanned: float,
    avg_query_seconds: float,
) -> dict:
    """
    TODO: Calculate monthly cost for each platform.
    - BigQuery on-demand: $6.25/TB scanned
    - BigQuery flat-rate: $2,000/month for 100 slots
    - Snowflake Medium: $4/credit, ~8 credits/hour
    """
    pass
```

### Exercise 2: Optimization Audit

```sql
-- Given this slow, expensive query, identify 3 problems and rewrite it:
SELECT *
FROM sales s
JOIN customers c ON s.customer_id = c.customer_id
JOIN products p ON s.product_id = p.product_id
WHERE EXTRACT(YEAR FROM s.order_date) = 2025
ORDER BY s.revenue DESC;

-- TODO: Rewrite with specific columns, partition pruning, and LIMIT
```

### Exercise 3: Warehouse Design

For each scenario, choose a warehouse platform and justify:
1. A startup with 5 analysts, unpredictable query volume, and a $500/month budget.
2. An enterprise with 50 data engineers, heavy ETL, and existing AWS investment.
3. A data marketplace company that needs to share live datasets with 100+ partners.

---

## Mastery Check

**Q1**: What does "compute-storage separation" mean and why is it important?
<details><summary>Answer</summary>
Data is stored in cheap object storage (S3/GCS) independently of compute resources. When a query runs, compute nodes read data from storage, process it, and return results — then shut down. You pay for storage 24/7 (cheap) but only pay for compute when queries are running. This eliminates over-provisioning and enables independent scaling of storage and compute.
</details>

**Q2**: Why is `SELECT *` expensive in BigQuery?
<details><summary>Answer</summary>
BigQuery uses columnar storage and charges per TB scanned. `SELECT *` reads every column in the table, even if you only need 3 out of 50 columns. Specifying exact columns can reduce scanned data by 90%+, directly cutting costs and improving query speed.
</details>

**Q3**: What is the difference between partitioning and clustering in BigQuery?
<details><summary>Answer</summary>
Partitioning divides the table into segments (usually by date) — the query engine skips entire partitions that don't match the WHERE clause. Clustering sorts data within each partition by specified columns — the engine reads fewer blocks within a partition. Use both together: partition by date (coarse filter) + cluster by frequently filtered columns like region or category (fine filter).
</details>

**Q4**: When would you choose Snowflake over BigQuery?
<details><summary>Answer</summary>
Choose Snowflake when: (1) you need data sharing with external partners without data copying, (2) you want multi-cloud support (Snowflake runs on AWS, GCP, and Azure), (3) you need predictable pricing with credit-based billing, or (4) you need separate compute resources for different teams (ETL vs analytics vs ML).
</details>

**Q5**: Your Snowflake bill doubled this month. What are the first 3 things to investigate?
<details><summary>Answer</summary>
1. Check `WAREHOUSE_METERING_HISTORY` for which warehouses consumed the most credits — look for warehouses that didn't auto-suspend.
2. Check `QUERY_HISTORY` for expensive queries — look for full table scans and unoptimized joins.
3. Check warehouse sizes — a developer may have upsized a warehouse for testing and forgot to resize it back.
</details>

---

## Summary

- ✅ **BigQuery**: Serverless, pay-per-scan, best for ad-hoc analytics and GCP-native shops
- ✅ **Snowflake**: Flexible compute, data sharing, multi-cloud, best for mixed workloads
- ✅ **Redshift**: Node-based, best for AWS-heavy orgs with predictable workloads
- ✅ **Optimization**: Partition + cluster, avoid SELECT *, use materialized views, right-size compute
- ✅ **Cost**: Separate compute from storage, auto-suspend, monitor continuously

**Tomorrow → Day 124**: **dbt at Scale** — incremental models, snapshots, macros, and patterns that turn your warehouse into a maintainable analytics engine.
