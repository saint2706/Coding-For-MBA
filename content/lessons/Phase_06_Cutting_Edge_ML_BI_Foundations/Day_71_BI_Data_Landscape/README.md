---
day: 71
title: "BI Data Landscape"
phase: 6
phaseTitle: "Cutting-Edge ML & BI Foundations"
slug: "data-landscape"
duration: 120
difficulty: "advanced"
tags:
  - data-engineering
  - data-warehouse
  - data-lake
  - snowflake
  - dbt
concepts:
  - "OLTP vs OLAP"
  - "Row vs Columnar Storage"
  - "Data Lake vs Warehouse"
  - "The Modern Data Stack"
prerequisites:
  - "SQL Proficiency"
  - "Understanding of Databases (Tables, Keys)"
outcomes:
  - "Architect a scalable BI solution"
  - "Explain why Snowflake is faster than Postgres for analytics"
  - "Design a Star Schema (Fact/Dimension)"
---

# 🎯 Day 71: BI Data Landscape

> *"Data matures like wine, applications like fish." — James Governor*

---

## The "Never-Coded" Bridge

**The Library vs. The Junkyard.**

**Data Warehouse (The Library)**:

* Everything is organized. Books are on shelves by category (Schema).
* Great for finding answers fast (*"Where is ‘War and Peace’?"*).
* Hard to put things IN (You need to catalog, label, and shelve every book).
* **Examples**: Snowflake, BigQuery, Redshift.

**Data Lake (The Junkyard)**:

* Just dump everything in a pile. Old tires, gold bars, broken glass (Images, JSON, CSVs).
* Easy to put things IN (Just back up the truck and dump).
* Hard to find answers later ("Where is that one specific tire?").
* **Examples**: AWS S3, Azure Blob Storage.

**The Lakehouse (The New Standard)**:

* A Library built *on top* of a Junkyard. Cheap storage (Lake), organized structure (Warehouse).
* **Examples**: Databricks, Snowflake (Hybrid).

---

## The Technical Deep Dive

### 1. OLTP vs. OLAP

1. **OLTP (Online Transaction Processing)**:
    * **Goal**: Speed for *one* user.
    * **Action**: "User A buys Item B." (Insert 1 row).
    * **Tech**: Postgres, MySQL.
    * **Optimization**: Row-oriented.

2. **OLAP (Online Analytical Processing)**:
    * **Goal**: Speed for *aggregation*.
    * **Action**: "What is the Average Spend of 10 Million Users?" (Scan 1 column).
    * **Tech**: Snowflake, BigQuery.
    * **Optimization**: Column-oriented.

### 2. Row vs. Columnar Storage

* **Row-Oriented (Postgres)**: Data is stored like: `[ID, Name, Age], [ID, Name, Age]`.
  * To find "Average Age", the disk must read `Name` (useless) to get to `Age`. Slow.
* **Column-Oriented (Snowflake)**: Data is stored like: `[ID, ID...], [Name, Name...], [Age, Age...]`.
  * To find "Average Age", the disk reads *only* the `Age` block. 100x faster.

### 3. The Modern Data Stack (MDS)

The standard startup architecture:

1. **Ingest**: Fivetran (Copies data from Salesforce/Postgres to Warehouse).
2. **Store**: Snowflake (The Warehouse).
3. **Transform**: dbt (SQL scripts that clean data *inside* Snowflake).
4. **Visualize**: Looker/Tableau.

---

## Senior-Level Insights

### The "T" in ELT vs. ETL

* **Old Way (ETL)**: Extract -> **Transform** (on a separate server) -> Load.
  * *Problem*: Transformations are brittle. If logic changes, you must re-extract.
* **New Way (ELT)**: Extract -> **Load** (Raw) -> Transform (inside Warehouse).
  * *Benefit*: Agility. Raw data is always there. If logic changes, just re-run the SQL.

### Cost Governance

Snowflake is "Pay for what you use."

* **The Trap**: An intern writes `SELECT * FROM big_table` (scanning 10TB).
* **The Bill**: $500 for one query.
* **The Fix**: Logical Partitions (Clustering Keys) and Resource Monitors (Budget Caps).

---

## Hands-on Lab

### Exercise 1: Star Schema Design

**Goal**: Design a Fact/Dimension model for Sales.

**Scenario**: You sell Products to Customers in Stores.

* **Fact Table (Events - The Center)**:
  * `fact_sales`: `sales_id`, `date_id`, `product_id`, `customer_id`, `store_id`, `quantity`, `revenue`.

* **Dimension Tables (Context - The Points of the Star)**:
  * `dim_product`: `product_id`, `name`, `category`, `price`.
  * `dim_customer`: `customer_id`, `name`, `email`, `city`.
  * `dim_store`: `store_id`, `address`, `manager`.
  * `dim_date`: `date_id`, `day`, `month`, `year`, `is_holiday`.

* *Why?*: If a customer changes their name, update 1 row in `dim_customer`, not 1 million rows in `fact_sales`.

### Exercise 2: Columnar Speed Logic

**Goal**: Explain why Snowflake is faster.

**Query**: `SELECT AVG(Salary) FROM Employees WHERE Department = 'IT'`

**Row Database (Postgres) Steps**:

1. Read Row 1 (ID, Name, Dept, Salary...). Check Dept.
2. Read Row 2 (ID, Name, Dept, Salary...). Check Dept.
3. ... Read 1M Rows. (Reads irrelevant columns like 'Name' into memory).

**Column Database (Snowflake) Steps**:

1. Read `Department` Column Block only. Identify Rows [1, 5, 8] are 'IT'.
2. Read `Salary` Column Block for Rows [1, 5, 8] only.
3. Compute Average.

* *Result*: Reads 2% of the data. 50x Faster.

### Exercise 3: Simple dbt Logic

**Goal**: Write a transformation usually done in dbt.

**Scenario**: Raw table `stripe_charges` has messy data. Clean it.

```sql
-- models/clean_charges.sql

WITH raw_charges AS (
    -- Reference the source (dbt lineage)
    SELECT * FROM {{ source('stripe', 'charges') }}
),

cleaned AS (
    SELECT
        id as charge_id,
        created_at as transaction_date,
        amount / 100.0 as amount_dollars, -- Fix cents to dollars
        status,
        CASE 
            WHEN refunded = true THEN 0 
            ELSE 1 
        END as is_valid_revenue
    FROM
        raw_charges
)

SELECT * FROM cleaned
WHERE status = 'succeeded'
```

* *Note*: The `{{ source }}` syntax allows dbt to build a dependency graph.

---

## Translation Lab: Data Landscape to Decision Readiness

**Scenario**: Source-system inconsistencies create different fairness conclusions across business units.

**Your task**:

1. Translate causal/fairness findings from heterogeneous datasets into a single KPI narrative.
2. Define BI metrics that monitor degradation and bias over time across domains and geographies.
3. Map deployment/monitoring signals to stakeholder dashboards and escalation ownership.
4. Produce a one-page decision memo combining technical caveats with business recommendation.

---

## Mastery Check

### Question 1: OLAP vs OLTP

Which database is best for your Shopify Website (Checkout System)?
A) OLAP (Snowflake)
B) OLTP (Postgres)
C) Excel
D) A Text File

<details>
<summary>Click for Answer</summary>

**Answer: B**
OLTP (Row) captures single transactions quickly. OLAP (Column) would be too slow for individual inserts.
</details>

### Question 2: Star Schema

What is a "Fact Table"?
A) A table with facts about the world (e.g., Geography).
B) A central table containing business events (Sales, Clicks) and foreign keys.
C) A table containing descriptive attributes (Customer Name).
D) A backup table.

<details>
<summary>Click for Answer</summary>

**Answer: B**
It records "What happened" (The Event).
</details>

### Question 3: ELT

Why is ELT preferred over ETL in the cloud?
A) It uses less storage.
B) Cloud warehouses are powerful enough to transform data *after* loading, giving more flexibility.
C) Tools like Fivetran only support ELT.
D) It sounds cooler.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Decoupling extraction from transformation allows for non-destructive data pipelines.
</details>

### Question 4: Data Lake

Where should you store raw logs, images, and unstructured PDF files?
A) Snowflake
B) Postgres
C) Data Lake (S3/Azure Blob)
D) RAM

<details>
<summary>Click for Answer</summary>

**Answer: C**
Lakes are cheap and handle unstructured data perfectly.
</details>

### Question 5: Columnar Storage

Why is `SELECT *` (Select All Columns) bad in Snowflake?
A) It isn't bad.
B) It forces the engine to reconstruct the rows by reading EVERY column block, defeating the purpose of columnar storage.
C) It deletes data.
D) It crashes the server.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Use `SELECT specific_col` to get the performance benefits.
</details>

---

## Summary

Today you learned:

* ✅ **OLTP (Rows)** is for Apps; **OLAP (Columns)** is for Analytics.
* ✅ **Warehouses** are Libraries; **Lakes** are Junkyards.
* ✅ **dbt** allows Analysts to act like Data Engineers (Software Engineering best practices for SQL).
* ✅ **Star Schema** separates Facts (Events) from Dimensions (Context) for speed.

**Tomorrow**: We finish the phase with **BI Data Formats & Ingestion**—JSON, Parquet, and APIs.
