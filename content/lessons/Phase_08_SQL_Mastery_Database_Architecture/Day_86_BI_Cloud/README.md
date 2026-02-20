---
day: 86
title: "Cloud Architecture & Optimization"
phase: 8
phaseTitle: "SQL Mastery & Database Architecture"
slug: "cloud-optimization"
duration: 120
difficulty: "advanced"
tags:
  - snowflake
  - bigquery
  - clustering
  - partitioning
concepts:
  - "Partitioning vs Clustering"
  - "Materialized Views (Auto-Refresh)"
  - "Query Execution Plans (Cloud)"
  - "Slot Contention"
prerequisites:
  - "Basics of Cloud (Day 83)"
  - "SQL Indexing (Day 73)"
outcomes:
  - "Tune a slow query on 1TB of data"
  - "Design a Clustering Strategy for Time-Series Data"
  - "Understand Serverless vs Provisioned Compute"
---

# 🎯 Day 86: Cloud Architecture & Optimization

> *"The Cloud makes bad queries run fast, and cost a fortune. Optimization is no longer about speed; it's about bankruptcy prevention."*

---

## The "Never-Coded" Bridge

**The Encyclopedia vs. The Filing Cabinet**

**Scanning**:

* **Encyclopedia (Unpartitioned)**: To find "History of Rome", you flip through every page of Volume A-Z. (Slow, Expensive).
* **Filing Cabinet (Partitioned)**: You open the drawer labeled "History". You ignore "Science", "Math", "Art". (Fast, Cheap).

**Clustering**:

* Inside the "History" drawer, the folders are sorted by **Date**.
* To find "1990", you jump to the back. You don't scan "1800".

**Cloud Databases** (Snowflake/BigQuery) charge you for every page you touch. **Optimization** is the art of touching as few pages as possible.

---

## The Technical Deep Dive

### 1. Partitioning (The Sledgehammer)

Breaks a large table into physical segments.

* **Strategy**: Usually by **Date** (`Ingestion Date` or `Event Date`).
* **BigQuery**: Automatic. `PARTITION BY DATE(timestamp)`.
* **Query**: `WHERE date = '2023-01-01'`.
* **Result**: Reads only 1/365th of the data. 99.7% cost saving.

### 2. Clustering (The Scalpel)

Sorts data *within* a partition.

* **Strategy**: High Cardinality columns commonly filtered (e.g., `user_id`, `customer_region`).
* **Snowflake**: `CLUSTER BY (user_id)`.
* **Query**: `WHERE user_id = 555`.
* **Result**: "Micro-Partition Pruning". It skips files that don't contain ID 555.

### 3. Materialized Views (The Cheat Code)

A pre-computed table that auto-updates (mostly).

* **Scenario**: You run `SUM(Sales)` every minute. It scans 1 Billion rows.
* **Materialize**: Create a view `mv_daily_sales` that stores just the answer.
* **Cloud Magic**: If you insert 5 new rows, the DB only adds 5 to the sum. It doesn't recalculate everything.

---

## Senior-Level Insights

### The "Slot Contention" Problem

* **BigQuery** gives you 2000 "Slots" (CPUs).
* If you run a query that needs 5000 slots, it **Queues**.
* **Impact**: Dashboard loads in 2 seconds at 9 AM, but 20 seconds at 9:05 AM (when everyone logs in).
* **Fix**: Buy "Reserved Slots" (Fixed cost) or optimize queries to use less CPU (Approximate Count Distinct).

### Logical vs Physical Design

* **Logical**: "This table has a User ID." (For Humans).
* **Physical**: "This table is sorted by User ID and stored in 400MB blocks." (For Machines).
* **Senior Devs** think Physically. "If I sort by Date, my Date queries are fast, but my User queries are slow. Should I duplicate the data and sort it differently?" (Z-Ordering / Projection).

---

## Hands-on Lab

### Exercise 1: Partition Pruning

**Goal**: Observe the "Bytes Scanned".

**Query A (Bad)**: `SELECT count(*) FROM big_table WHERE date_string LIKE '2023-01%'`.

* *Result*: Scans full table. The DB doesn't know strings are dates.

**Query B (Good)**: `SELECT count(*) FROM big_table WHERE date_column BETWEEN '2023-01-01' AND '2023-01-31'`.

* *Result*: Scans only Jan partition.

### Exercise 2: Clustering Keys

**Goal**: Design the sort order.

**Scenario**: Uber Trips table.

* Common Queries: "Trips in NYC" and "Trips by Date".
* **Cluster Key**: `(City_ID, Date)`.
* **Impact**: Data for "NYC" is grouped together. Inside NYC, it is sorted by Date.
* *Trade-off*: Queries for "Date" (without City) are now slower because the dates are scattered across cities.

### Exercise 3: Approximate Aggregations

**Goal**: Trade 0.1% accuracy for 99% speed.

**Exact**: `COUNT(DISTINCT user_id)`.

* *Cost*: Highly expensive. Requires shuffling all IDs to one node to deduplicate.

**Approximate**: `APPROX_COUNT_DISTINCT(user_id)`.

* *Cost*: Extremely cheap. Uses **HyperLogLog** algorithm.
* *Use Case**: Dashboard showing "Weekly Active Users". Does it matter if it's 1,000,000 or 1,000,005? No.

---

### Non-Functional Constraints (Apply to All Exercises)

- **Performance / Scale**: Document a target query runtime of **p95 < 3s** for your final solution, validate behavior at **30 concurrent analytical users/sessions**, and keep compute spend below **$5** per production-equivalent run.
- **Data Governance / Security**: Define acceptance criteria for least-privilege access, PII handling (masking/tokenization where applicable), audit logging of query access, and retention/deletion alignment with policy.
- **Business KPI Impact**: Explicitly state which business KPI(s) improve based on your schema/query decisions and quantify expected directional impact.
  - KPI focus for this day: *BI dashboard freshness and warehouse spend should keep executive reporting latency under 10 minutes while staying inside budget.*

## Mastery Check

### Question 1: Partitioning

If you partition by `Date`, and then query `WHERE User_ID = 5`, does it prune partitions?
A) Yes.
B) No.
C) Maybe.
D) It deletes the table.

<details>
<summary>Click for Answer</summary>

**Answer: B**
No. It must scan *all* days to find User 5, unless you also filter by Date.
</details>

### Question 2: Materialized View

What is the downside of Materialized Views?
A) They are slow to read.
B) They cost money to maintain (Write cost) and can lag slightly behind real-time.
C) They are illegal in Europe.
D) They are hard to spell.

<details>
<summary>Click for Answer</summary>

**Answer: B**
You pay storage + compute for updates.
</details>

### Question 3: HyperLogLog

When should you use `APPROX_COUNT_DISTINCT`?
A) For Financial Audits (Must be exact to the penny).
B) For High-Traffic Analytics (Unique Visitors, distinct devices) where speed > precision.
C) Never.
D) For small tables.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Standard for Big Data analytics.
</details>

### Question 4: Clustering

Can you re-cluster a table after it's built?
A) No, it's permanent.
B) Yes, but it requires re-writing the data (Maintenance Cost).
C) It happens by magic for free.
D) Only on leap years.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Sorting 1 Petabyte takes a lot of compute. Snowflake charges for "Auto-Clustering".
</details>

### Question 5: Skew

What happens if one partition (e.g., "NULL" user_id) has 90% of the data?
A) Nothing.
B) "Data Skew". Parallelism fails because one worker node has to process 90% of the work while others wait.
C) It runs faster.
D) It deletes the NULLs.

<details>
<summary>Click for Answer</summary>

**Answer: B**
The #1 killer of performance in distributed systems. Filter NULLs early!
</details>

---

## Summary

Today you learned:

* ✅ **Pruning**: The key to speed and cost savings. partition by filtered columns.
* ✅ **Clustering**: Sorting data physically helps filter non-partitioned columns.
* ✅ **Approximate Count**: Use HLL for massive cardinality sets.
* ✅ **Data Skew**: Avoid uneven distribution of keys.

**Tomorrow**: We tackle **Data Governance**—The policies that keep this architecture safe.
