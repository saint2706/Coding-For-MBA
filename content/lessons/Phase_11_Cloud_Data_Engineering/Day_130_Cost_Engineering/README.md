---
day: 130
title: "Cost Engineering — FinOps for Data Platforms"
phase: 11
phaseTitle: "Cloud Data Engineering"
slug: "cost-engineering"
duration: 75
difficulty: "intermediate"
tags:
  - finops
  - cost-optimization
  - cloud-costs
  - reserved-instances
  - query-optimization
concepts:
  - "FinOps principles and culture"
  - "cost attribution and tagging"
  - "reserved vs on-demand vs spot"
  - "query cost optimization"
  - "storage tiering"
prerequisites:
  - "Day 121: Cloud Fundamentals"
  - "Day 123: Cloud Data Warehouses"
outcomes:
  - "Implement a cost attribution framework with resource tagging"
  - "Optimize compute costs using reserved instances and auto-scaling"
  - "Reduce data warehouse query costs by 50-80%"
---

# 💰 Day 130: Cost Engineering — FinOps for Data Platforms

> *"The cloud is only expensive if you don't manage it. The most successful data teams treat cost as a first-class metric alongside latency and quality."*

---

## The "Never-Coded" Bridge

**Think of cloud cost engineering like managing a restaurant.** You wouldn't leave all the ovens running 24/7, buy premium ingredients for every dish when house brand works, or keep lights on in empty dining rooms. Cloud cost engineering applies the same common sense: turn off idle resources, right-size compute for the workload, and use cheaper storage tiers for data nobody accesses.

FinOps (Financial Operations) is the discipline that brings engineering, finance, and business together to manage cloud spend — treating cloud bills not as overhead but as an optimizable business metric.

---

## The Technical Deep Dive

### 1. FinOps Principles

```python
finops_pillars = {
    "inform": {
        "principle": "Everyone can see what they spend",
        "actions": [
            "Tag all resources (team, project, environment)",
            "Cost dashboards visible to all teams",
            "Monthly cost reviews per team",
        ],
    },
    "optimize": {
        "principle": "Continuously right-size and reduce waste",
        "actions": [
            "Reserved instances for predictable workloads",
            "Auto-scaling for variable loads",
            "Storage lifecycle policies",
            "Query optimization for warehouse costs",
        ],
    },
    "operate": {
        "principle": "Build cost awareness into engineering culture",
        "actions": [
            "Cost impact in PR reviews",
            "Budget alerts and anomaly detection",
            "Unit economics: cost per query, cost per TB processed",
        ],
    },
}
```

### 2. Cost Attribution with Tagging

```python
# Every cloud resource MUST be tagged for cost attribution
required_tags = {
    "team": "data-engineering",       # Who owns this?
    "project": "sales-pipeline",      # What project?
    "environment": "production",      # Dev/staging/production?
    "cost_center": "CC-1234",         # Finance tracking
    "data_classification": "internal",# Compliance
}

# Enforce tagging with AWS Organizations SCP
tag_enforcement_policy = {
    "Version": "2012-10-17",
    "Statement": [{
        "Sid": "DenyUntaggedResources",
        "Effect": "Deny",
        "Action": ["ec2:RunInstances", "s3:CreateBucket", "redshift:CreateCluster"],
        "Resource": "*",
        "Condition": {
            "Null": {
                "aws:RequestTag/team": "true",
                "aws:RequestTag/project": "true",
                "aws:RequestTag/environment": "true",
            }
        },
    }],
}
```

### 3. Compute Cost Optimization

```python
compute_strategies = {
    "reserved_instances": {
        "savings": "40-72% vs on-demand",
        "commitment": "1 or 3 years",
        "best_for": "24/7 production workloads (Airflow, always-on DBs)",
        "risk": "Locked in if requirements change",
    },
    "spot_instances": {
        "savings": "60-90% vs on-demand",
        "risk": "Can be interrupted with 2-min notice",
        "best_for": "Batch processing, Spark jobs, CI/CD, non-critical ETL",
        "not_for": "Production databases, user-facing services",
    },
    "auto_scaling": {
        "savings": "30-60%",
        "strategy": "Scale down during off-hours (nights, weekends)",
        "example": "Snowflake auto-suspend after 60s idle",
    },
    "right_sizing": {
        "savings": "20-50%",
        "strategy": "Match instance type to actual CPU/memory usage",
        "tooling": "AWS Compute Optimizer, GCP Recommender",
    },
}
```

### 4. Query Cost Optimization

```python
# BigQuery: $6.25/TB scanned. Reducing scanned data = direct cost savings.

optimization_checklist = {
    "partitioning": {
        "impact": "50-95% cost reduction",
        "action": "Partition by date, filter on partition column in WHERE",
    },
    "clustering": {
        "impact": "20-60% additional reduction",
        "action": "Cluster by frequently filtered columns (region, category)",
    },
    "select_specific_columns": {
        "impact": "30-90% reduction",
        "action": "Never SELECT * — columnar storage only reads requested columns",
    },
    "materialized_views": {
        "impact": "90%+ for repeated queries",
        "action": "Pre-compute aggregates, warehouse auto-routes queries",
    },
    "query_caching": {
        "impact": "100% (free re-runs)",
        "action": "BigQuery caches results for 24h (same query + table unchanged)",
    },
    "approximate_functions": {
        "impact": "50-90% faster, same cost",
        "action": "Use APPROX_COUNT_DISTINCT for explorations",
    },
}

# Real example: $3,000/month → $400/month
# Before: 500 daily queries × avg 3 GB scanned × $6.25/TB = $93.75/day
# After partitioning + clustering: avg 0.3 GB scanned = $9.38/day
```

### 5. Storage Cost Optimization

```python
storage_optimization = {
    "lifecycle_policies": {
        "impact": "60-90% on archival data",
        "strategy": {
            "0-30 days": "S3 Standard ($0.023/GB)",
            "30-90 days": "S3 Standard-IA ($0.0125/GB)",
            "90-365 days": "S3 Glacier Instant ($0.004/GB)",
            "365+ days": "S3 Glacier Deep Archive ($0.00099/GB)",
        },
    },
    "compression": {
        "impact": "60-80% reduction",
        "action": "Use Parquet with Snappy or ZSTD compression",
        "example": "100 GB CSV → 20 GB Parquet (ZSTD) — same data, 80% cheaper",
    },
    "deduplication": {
        "impact": "Variable — often 20-40%",
        "action": "Identify and remove duplicate files and tables",
    },
    "unused_table_cleanup": {
        "impact": "Often 10-30% of total storage cost",
        "action": "Find tables not queried in 90+ days, archive or delete",
    },
}
```

---

## Hands-on Lab

### Exercise 1: Cost Analysis

```python
# TODO: Given this monthly cloud bill breakdown, identify the top 3
# optimization opportunities and estimate savings:
monthly_bill = {
    "EC2 (on-demand)": 12000,     # 20 instances, avg 40% utilization
    "S3 Standard": 5000,           # 200 TB, 80% not accessed in 90 days
    "BigQuery on-demand": 8000,    # 1.3 TB scanned/day, many SELECT *
    "NAT Gateway data": 3000,      # 30TB/month through NAT
    "Redshift RA3 (2 nodes)": 6000,# 30% average utilization
    "Data transfer (egress)": 2000,# 20TB/month cross-region
}
# Total: $36,000/month
```

### Exercise 2: Unit Economics Dashboard

```python
# TODO: Design a unit economics dashboard showing:
# 1. Cost per pipeline run (broken down by compute, storage, query)
# 2. Cost per 1M records processed
# 3. Cost trend over 30 days with anomaly highlighting
# 4. Top 10 most expensive queries this week
# 5. Reserved vs on-demand utilization
```

### Exercise 3: FinOps Culture Implementation

```markdown
## TODO: Write a 1-page FinOps policy for your data team covering:
1. Tagging requirements (what tags are mandatory?)
2. Budget alerts (at what % do we alert? Who gets notified?)
3. PR review policy (when must cost impact be included in PR review?)
4. Monthly review cadence (who attends? What do we review?)
5. Optimization targets (what's our cost efficiency goal?)
```

---

## Mastery Check

**Q1**: What is the FinOps principle of "unit economics" for data platforms?
<details><summary>Answer</summary>
Unit economics measures the cost per unit of business value: cost per pipeline run, cost per GB processed, cost per dashboard query, cost per active user. This converts abstract cloud bills into actionable metrics. If cost per pipeline run increases 50% month-over-month, that's a signal to investigate — even if the total bill looks normal (it might just mean you're running fewer pipelines).
</details>

**Q2**: Your team uses BigQuery on-demand and spends $10,000/month scanning 1.6 TB/day. Should you switch to flat-rate?
<details><summary>Answer</summary>
At 1.6 TB/day, on-demand costs ~$10,000/month ($6.25/TB × 1.6 TB × 30 days). BigQuery flat-rate editions start at ~$2,000/month for 100 slots. You'd need to test whether 100 slots provide enough concurrency for your query volume. If queries run in acceptable time with 100 slots, you'd save $8,000/month (80%). Run a side-by-side test before committing.
</details>

**Q3**: When should you use spot instances for data workloads?
<details><summary>Answer</summary>
Use spot instances for: Spark batch jobs (checkpointed, can resume if interrupted), development/test environments, CI/CD pipelines, and non-time-sensitive processing. Never use for: production databases, Airflow schedulers, user-facing APIs, or any workload that can't tolerate a 2-minute interruption. The key: your workload must be fault-tolerant or checkpoint-capable.
</details>

**Q4**: What is the single most impactful optimization for BigQuery costs?
<details><summary>Answer</summary>
Partitioning by date and adding WHERE clauses that prune partitions. This alone typically reduces scanned data by 80-95%. A query on a year of data that scans only today's partition goes from reading 365 partitions to 1 — a 365x cost reduction. Combined with clustering and column selection, total cost reductions of 90%+ are common.
</details>

**Q5**: Why should cost impact be part of code reviews for data pipelines?
<details><summary>Answer</summary>
A single inefficient query can cost $10,000/month if it runs hourly. A full table scan instead of a partitioned query, a missing WHERE clause, or an unnecessary materialization can silently inflate costs. Including cost impact in PR reviews catches these issues before they hit production — the same way PR reviews catch bugs.
</details>

---

## Summary

- ✅ **FinOps** = engineering + finance collaboration to optimize cloud spend
- ✅ **Tagging** is mandatory — enables cost attribution per team, project, environment
- ✅ **Compute**: Reserved (40-72% savings), Spot (60-90%), Auto-scaling (30-60%)
- ✅ **Queries**: Partition + cluster + specific columns = 80-95% cost reduction
- ✅ **Storage**: Lifecycle policies + compression + cleanup = 60-90% savings
- ✅ **Culture**: Cost in PRs, budget alerts, monthly reviews, unit economics dashboards

**Tomorrow → Day 131**: **Platform Engineering** — Terraform, IaC, and building self-serve data infrastructure.
