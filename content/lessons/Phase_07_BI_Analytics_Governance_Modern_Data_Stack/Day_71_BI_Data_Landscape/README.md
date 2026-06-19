---
day: 71
title: "BI Data Landscape"
phase: 7
phaseTitle: "BI Analytics, Governance & Modern Data Stack"
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

### 4. Storage Architectures Beyond "Library vs. Junkyard"

The Library/Junkyard analogy covers Warehouse vs. Lake, but BrightCart's real data landscape has more layers:

* **Operational Store (OLTP database)**: The live, transactional system of record — e.g., the Postgres
  database behind BrightCart's checkout. Optimized for fast single-row reads/writes, not analytics. This is
  the *source*, not the destination, for BI.
* **Data Lake**: Cheap, schema-flexible storage (e.g., S3) for raw and semi-structured data — clickstream
  JSON, images of returned products, app logs. Inexpensive but requires discipline to stay usable.
* **Data Warehouse**: Structured, query-optimized storage (Snowflake, BigQuery, Redshift) for cleaned,
  business-ready tables. Strong governance and fast aggregation; more expensive per GB than a lake.
* **Lakehouse**: A lake with warehouse-like guarantees layered on top (e.g., Delta Lake, Iceberg tables on
  S3) — ACID transactions, schema enforcement, and time travel on top of cheap object storage. Databricks
  popularized this; Snowflake and BigQuery now offer hybrid lakehouse features too.
* **Data Mart**: A smaller, department-specific subset of the warehouse (e.g., a "Marketing Mart" with only
  campaign and attribution tables) — built for a specific audience's query patterns and access needs.
* **Streaming Store**: For data that must be processed as it arrives rather than in scheduled batches (e.g.,
  Kafka, Kinesis) — used when BrightCart needs near-real-time fraud detection on `events`, not just a nightly
  refresh.
* **Federated Query Engine**: A layer (e.g., Trino, BigQuery Omni) that lets you query data sitting in
  multiple places (warehouse + lake + another cloud) without physically moving it first — useful for ad hoc
  cross-system joins, but generally slower and less governed than a single consolidated warehouse.

#### Build vs. Buy

| Decision | Build (self-managed) | Buy (managed/SaaS) |
|---|---|---|
| When it makes sense | Unique scale/cost requirements, deep in-house data engineering talent, regulatory need for full infra control | Most companies, especially under ~50 engineers — managed Snowflake/Fivetran/dbt Cloud ships faster and has lower total cost of ownership than hiring a platform team |
| Risk | Engineering time sunk into "undifferentiated heavy lifting" (uptime, scaling, security patching) instead of business logic | Vendor lock-in, per-query/per-row cost can spike unpredictably without governance |
| BrightCart's actual choice | N/A — BrightCart is mid-size DTC, not a hyperscale tech company | Buy: managed warehouse + ELT tool + dbt Cloud, freeing the 2-person data team to focus on modeling, not infrastructure |

### 5. OLTP vs. Warehouse vs. Lake vs. Lakehouse — Decision Table

| Factor | OLTP (Postgres/MySQL) | Warehouse (Snowflake/BigQuery) | Lake (S3/Blob) | Lakehouse (Databricks/Iceberg) |
|---|---|---|---|---|
| **Primary workload** | Many small reads/writes (1 row at a time) | Large aggregations over millions of rows | Storing raw/unstructured data cheaply | Both: raw storage + warehouse-grade querying |
| **Latency** | Milliseconds (must support live checkout) | Seconds (acceptable for dashboards) | N/A for query; fast for bulk write | Seconds, improving toward warehouse speed |
| **Governance** | Strong (schema enforced, ACID transactions) | Strong (schema + access controls + lineage tools) | Weak by default (no schema enforcement — "data swamp" risk) | Strong (schema enforcement + ACID added on top of lake) |
| **Cost** | Moderate, scales with transaction volume | Higher per-GB; pay for compute on queries | Very low per-GB storage cost | Low storage cost + warehouse-like compute cost on top |
| **When NOT to use it** | Never run analytical aggregations directly against your production OLTP database — it will slow down or crash live checkout | Don't dump raw unstructured blobs (images, raw JSON logs) here — costly and awkward to query | Don't use a lake alone as your only BI source — no governance, slow ad hoc queries, easy to turn into an unusable "data swamp" | Don't adopt a lakehouse just because it's trendy — if your team is small and your data is already structured, a plain warehouse is simpler to operate |

### 6. Medallion (Layered) Modeling, Contracts, Catalog, and Lineage

Modern transformation layers (whether in dbt or elsewhere) are usually organized into a **medallion
architecture** — three logical layers that get progressively cleaner:

* **Bronze (Raw)**: Data exactly as extracted from the source, untransformed. BrightCart's raw
  `stripe_charges` table from Exercise 3 below is a Bronze table.
* **Silver (Cleaned/Conformed)**: Deduplicated, typed, business-rule-applied tables — one row per real-world
  entity, joined and standardized. BrightCart's `cleaned` CTE in Exercise 3 is Silver-layer logic.
* **Gold (Business/Aggregated)**: Final, dashboard-ready tables matching the metric contracts from Phase 7
  Day 68 — e.g., a `gold_daily_revenue` table that BI tools query directly.

This layering matters because it creates clear **ownership boundaries**: data engineers own Bronze ingestion,
analytics engineers own Silver/Gold transformations, and BI analysts consume Gold without needing to
understand the raw mess underneath.

Three more concepts complete the picture of how this all interoperates:

* **Data Contracts**: A formal agreement between a data producer (e.g., the checkout engineering team) and
  consumers (the BI team) about a table's schema, semantics, and change process — e.g., "if you rename the
  `status` column in the orders table, you must notify the data team 2 weeks ahead." This prevents the classic
  failure mode where an engineer renames a column and silently breaks ten dashboards.
* **Catalog & Lineage**: A catalog (e.g., dbt docs, Atlan, Alation) is the searchable inventory of "what
  tables exist, what do they mean, who owns them." Lineage shows the dependency graph — which Bronze tables
  feed which Silver models feed which Gold tables feed which dashboard — so when something breaks, you can
  trace it backward to the root cause instead of guessing.
* **Observability**: Automated tests (e.g., dbt tests for null checks, uniqueness, referential integrity) and
  monitoring tools that catch broken data *before* it reaches Gold tables and dashboards — the same concept
  introduced as the "Observability" layer in Phase 7 Day 68's BI Stack section.

**How the named tools interoperate**, end to end for BrightCart: Fivetran lands raw Stripe/Postgres data into
Snowflake's Bronze schema → dbt models transform Bronze into Silver (deduplicated, typed) and Gold
(business-aggregated) tables, with dbt tests providing observability and dbt docs providing the catalog/lineage
graph → dbt Cloud or Airflow orchestrates the run schedule → Looker/Tableau query only the Gold layer →
analysts work entirely downstream of a contract that engineering has agreed not to break without notice.

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

### Exercise 3: BrightCart dbt Mini-Project (Executable, with Seed Data)

**Goal**: Build a real, runnable dbt project — from seed data through a tested, documented Gold model — using
a tiny slice of BrightCart's `orders`/`customers` schema. This exercise produces actual files and actual
command output, not just SQL to read.

#### Step 1 — Environment setup

```bash
pip install dbt-duckdb   # dbt + a free, file-based warehouse — no cloud account needed
dbt init brightcart_dbt  # choose "duckdb" as the adapter when prompted
cd brightcart_dbt
```

#### Step 2 — Seed data

Create `seeds/raw_orders.csv`:

```text
order_id,customer_id,order_date,status,channel
O001,C01,2026-01-06,delivered,web
O002,C01,2026-02-10,delivered,web
O003,C02,2026-01-09,cancelled,web
O004,C03,2026-01-15,delivered,app
O005,C03,2026-02-18,returned,app
O006,C04,2026-01-22,delivered,marketplace
```

Create `seeds/raw_customers.csv`:

```text
customer_id,signup_date,region,acquisition_channel
C01,2026-01-05,West,paid_search
C02,2026-01-08,West,organic
C03,2026-01-12,East,paid_social
C04,2026-01-20,East,organic
```

Load them into the warehouse (this is the Bronze layer):

```bash
dbt seed
```

**Expected output**:

```text
Completed successfully
Done. PASS=2 WARN=0 ERROR=0 SKIP=0 TOTAL=2
```

#### Step 3 — Silver model: clean and conform

Create `models/silver_orders.sql`:

```sql
-- models/silver_orders.sql
WITH raw_orders AS (
    SELECT * FROM {{ ref('raw_orders') }}   -- dbt lineage: depends on the seed
),

cleaned AS (
    SELECT
        order_id,
        customer_id,
        CAST(order_date AS DATE) AS order_date,
        status,
        channel,
        CASE WHEN status = 'delivered' THEN 1 ELSE 0 END AS is_valid_revenue
    FROM raw_orders
)

SELECT * FROM cleaned
```

#### Step 4 — Gold model: business-ready aggregate

Create `models/gold_revenue_by_channel.sql`:

```sql
-- models/gold_revenue_by_channel.sql
SELECT
    channel,
    COUNT(*) AS total_orders,
    SUM(is_valid_revenue) AS delivered_orders
FROM {{ ref('silver_orders') }}
GROUP BY channel
ORDER BY delivered_orders DESC
```

#### Step 5 — Add tests (data contract enforcement)

Create `models/schema.yml`:

```yaml
version: 2
models:
  - name: silver_orders
    columns:
      - name: order_id
        tests:
          - unique
          - not_null
      - name: status
        tests:
          - accepted_values:
              values: ['placed', 'shipped', 'delivered', 'returned', 'cancelled']
```

#### Step 6 — Run and test

```bash
dbt run
dbt test
dbt docs generate
```

**Expected `dbt run` output**:

```text
1 of 2 OK created sql table model main.silver_orders ......... [OK]
2 of 2 OK created sql table model main.gold_revenue_by_channel  [OK]
Completed successfully
Done. PASS=2 WARN=0 ERROR=0 SKIP=0 TOTAL=2
```

**Expected `dbt test` output**:

```text
PASS unique_silver_orders_order_id
PASS not_null_silver_orders_order_id
PASS accepted_values_silver_orders_status
Done. PASS=3 WARN=0 ERROR=0 SKIP=0 TOTAL=3
```

**Expected rows in `gold_revenue_by_channel`** (querying the result, e.g. `SELECT * FROM
gold_revenue_by_channel`):

| channel | total_orders | delivered_orders |
|---|---|---|
| web | 3 | 2 |
| app | 2 | 1 |
| marketplace | 1 | 1 |

**Expected `dbt docs generate` output**: a local lineage graph showing `raw_orders` (seed/Bronze) →
`silver_orders` (Silver) → `gold_revenue_by_channel` (Gold), with the test results attached to each column —
this is the catalog/lineage artifact described in the Technical Deep Dive above, generated automatically from
the project you just built.

* *Note*: The `{{ ref() }}` syntax (not `{{ source() }}`, since these came from a `dbt seed` rather than an
  external warehouse table) lets dbt build the dependency graph automatically — this is exactly what makes
  `dbt docs generate` able to draw the lineage diagram without you manually documenting it.

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

## Cross-References

**Prerequisites** (review before this lesson if rusty):

* Phase 3 Day 31 — Databases (foundational relational database / SQL concepts assumed here)
* Phase 3 Day 32 — Other Databases (introduces non-relational storage, a prerequisite for the Lake/Lakehouse discussion)

**Builds on / extends from earlier in Phase 7**:

* Phase 7 Day 68 — BI Analyst Foundations (the BI Stack and metric-contract concepts this lesson's medallion architecture and data contracts formalize)

**Forward links** (where this lesson's architecture gets used):

* Phase 7 Day 73 — BI SQL & Databases (hands-on SQL against the warehouse layer described here)
* Phase 7 Day 81 — BI Architecture & Data Modeling (deepens star schema and medallion modeling)
* Phase 7 Day 82 — BI ETL & Pipeline Automation (operationalizes the ELT pattern and orchestration layer introduced here)
* Phase 7 Day 83 — BI Cloud & Modern Data Stack (expands build-vs-buy and cloud warehouse economics)
* Phase 7 Day 84B — dbt Fundamentals (full treatment of the dbt mini-project started in Exercise 3)
* Phase 7 Day 84C — Reverse ETL & Semantic Layer (extends the Gold layer back out into operational tools)

## Glossary

* **OLTP (Online Transaction Processing)** — Database workload optimized for fast, single-row reads/writes (e.g., checkout systems).
* **OLAP (Online Analytical Processing)** — Database workload optimized for aggregating large volumes of data (e.g., dashboards).
* **Row-Oriented Storage** — Data stored a full record at a time; efficient for OLTP, inefficient for column aggregations.
* **Columnar Storage** — Data stored a column at a time; efficient for OLAP aggregations since irrelevant columns are never read.
* **Data Lake** — Cheap, schema-flexible storage for raw and unstructured data (e.g., S3).
* **Data Warehouse** — Structured, query-optimized storage for cleaned, business-ready data (e.g., Snowflake, BigQuery).
* **Lakehouse** — A data lake with warehouse-grade guarantees (ACID transactions, schema enforcement) layered on top.
* **Star Schema** — A modeling pattern with a central Fact table (events) surrounded by Dimension tables (context).
* **ELT (Extract, Load, Transform)** — The modern pipeline pattern where raw data is loaded first and transformed inside the warehouse.

---

## Summary

Today you learned:

* ✅ **OLTP (Rows)** is for Apps; **OLAP (Columns)** is for Analytics.
* ✅ **Warehouses** are Libraries; **Lakes** are Junkyards.
* ✅ **dbt** allows Analysts to act like Data Engineers (Software Engineering best practices for SQL).
* ✅ **Star Schema** separates Facts (Events) from Dimensions (Context) for speed.

**Tomorrow**: We finish the phase with **BI Data Formats & Ingestion**—JSON, Parquet, and APIs.
