---
day: 81
title: "BI Architecture & Data Modeling"
phase: 7
phaseTitle: "BI Analytics, Governance & Modern Data Stack"
slug: "data-modeling"
duration: 120
difficulty: "advanced"
tags:
  - data-modeling
  - star-schema
  - normalization
  - kimball
concepts:
  - "Fact Tables vs. Dimension Tables"
  - "Star Schema vs. Snowflake Schema"
  - "One Big Table (OBT)"
  - "Normalization (3NF)"
prerequisites:
  - "Understanding of SQL Joins (Day 73)"
outcomes:
  - "Design a Star Schema for E-Commerce"
  - "Optimize Query Performance using Modeling"
  - "Defend OBT vs Star Schema architecture choice"
---

# 🎯 Day 81: BI Architecture & Data Modeling

> *"Data Modeling is the art of telling a computer how to find things quickly."*

---

## The "Never-Coded" Bridge

**The Closet: Piles vs. Hangers**

**Transaction System (OLTP - The Pile)**:

* You throw your clothes on the chair. Fast to *put away* (Write). Hard to *find* (Read).
* *Computers*: Fast `INSERT`, Slow `SELECT`.

**Analytical System (OLAP - The Hangers)**:

* You organize shirts by color, pants by size. Slow to *put away* (ETL). Fast to *find* (Read).
* **Star Schema**:
  * **Facts (Events)**: "I wore this shirt on Tuesday." (Verb).
  * **Dimensions (Nouns)**: "The Shirt (Red, Cotton, Size M)."
* *Result*: "Show me all Red Shirts worn on Tuesdays" -> Instant answer.

---

## The Technical Deep Dive

### 1. Facts vs. Dimensions (Kimball Methodology)

* **Fact Table**: The center of the star. Contains **Numbers** (Metrics) and **Keys** (IDs).
  * `fact_sales`: `order_id`, `product_id`, `date_id`, `quantity`, `revenue`.
  * *Characteristics*: Long (Billions of rows), Narrow.
* **Dimension Table**: The points of the star. Contains **Context** (Text).
  * `dim_product`: `product_id`, `name`, `category`, `color`, `manufacturer`.
  * *Characteristics*: Short (Thousands of rows), Wide.

### 2. Star Schema vs. Snowflake Schema

* **Star**: Dimensions are denormalized.
  * `dim_product` contains `category_name`.
  * *Pros*: Fewer Joins = Faster Queries.
* **Snowflake**: Dimensions are normalized.
  * `dim_product` links to `dim_category`.
  * *Pros*: Less Disk Space (Data Integrity). *Cons*: More Joins = Slower.

### 3. One Big Table (OBT)

Modern Columnar Databases (Snowflake/BigQuery) are so fast they tolerate "Flat Tables".

* `obt_sales`: `date`, `product_name`, `category`, `revenue` (All in one table).
* **Pros**: No Joins! (Simple for end users).
* **Cons**: Redundant storage (String "Electronics" repeated 1M times).
* *Trend*: OBT is winning for *User-Facing* layers due to compression.

### 4. Advanced Dimensional Modeling Patterns

The star schema above is the simple case. Real BrightCart data has history, ambiguity, and events without numbers. Kimball's toolkit has named patterns for each:

* **Slowly Changing Dimensions (SCD)**: What happens when `dim_customers.region` changes (a customer moves from West to East)?
  * **SCD Type 1 (Overwrite)**: Just update the row. History is lost — useful when you only care about the *current* state.
  * **SCD Type 2 (New Row + Versioning)**: Insert a new row with a new surrogate key, mark the old row `is_current = FALSE`, and stamp both with `valid_from`/`valid_to` dates. History is preserved — a sale made while the customer was "West" still reports as "West" forever.
  * **SCD Type 3 (New Column)**: Add a `previous_region` column. Cheap, but only remembers *one* prior value.
  * BrightCart almost always wants **Type 2** for `dim_customers.region` — marketing attribution by region needs to reflect the region *at the time of the order*, not today.
* **Role-Playing Dimensions**: One physical dimension table playing multiple logical roles. `dim_date` joined once as `order_date_key` and again as `ship_date_key` in `fact_orders` — same table, two roles, two foreign keys.
* **Conformed Dimensions**: The *same* `dim_customers` table is reused, unchanged, across `fact_orders`, `fact_returns`, and `fact_support_tickets`. This is what lets a BI tool join "Customer Lifetime Value" (from orders) against "Support Ticket Volume" (from tickets) without inventing a new customer definition each time.
* **Degenerate Dimensions**: An attribute that lives in the fact table because it has no dimension attributes of its own — e.g., `fact_orders.order_id` (the operational order number). It's dimension-like (an identifier) but doesn't justify a separate table.
* **Junk Dimensions**: A handful of low-cardinality flags (`is_gift_order`, `is_first_order`, `used_promo_code`) bundled into one small `dim_order_flags` table instead of cluttering the fact table with a dozen boolean columns.
* **Factless Fact Tables**: A fact table with no measures — it just records that an *event* happened. E.g., `fact_product_views(customer_key, product_key, date_key)` records views with no "amount," useful for "which products were viewed but never purchased."
* **Bridge Tables**: Used to resolve many-to-many relationships, e.g., one order can have multiple promo codes — a `bridge_order_promo(order_id, promo_id, weighting_factor)` avoids fanout in `fact_orders` itself.
* **Snapshots**: Periodic full copies of state for trend analysis — e.g., `fact_inventory_snapshot` taken nightly, so you can ask "how much inventory did we have on any past date" without replaying every transaction.
* **Late-Arriving Data**: A `fact_orders` row arrives before its `dim_customers` row exists yet (e.g., a marketplace order from a brand-new customer record that hasn't synced). Handle with either a placeholder/"Unknown Member" surrogate key that gets corrected later, or by delaying the fact load until the dimension catches up.

### 5. Architecture Philosophies: Kimball, Inmon, Data Vault, OBT, Lakehouse

| Approach | Core Idea | Strength | Trade-off | When BrightCart Would Choose It |
| :--- | :--- | :--- | :--- | :--- |
| **Kimball (Dimensional/Star)** | Model around business processes; denormalize for fast, intuitive BI queries | Fast to build, intuitive for analysts, great BI-tool compatibility | Less flexible if business processes change shape; some redundancy | Default choice for the BrightCart sales/ops warehouse — analysts query facts and dimensions directly |
| **Inmon (Normalized EDW)** | Build a fully normalized (3NF) enterprise warehouse first; dimensional marts are derived views on top | Single source of truth, no redundancy, strong integrity | Slower to build, more joins, steeper learning curve for business users | If BrightCart had 40+ source systems and needed one normalized "system of record" before any reporting layer |
| **Data Vault** | Hub/Link/Satellite modeling; optimized for auditability, traceability, and handling fast-changing sources | Highly auditable, resilient to source-system change, parallel-loadable | Verbose, requires a dimensional layer on top for BI consumption (it's not meant to be queried directly) | If BrightCart faced heavy regulatory audit requirements and needed full historical traceability of every source change |
| **OBT (One Big Table)** | Pre-join everything into a single wide, denormalized table | Zero joins for end users, plays well with BI-tool "Import"/in-memory engines | Update complexity (a category rename touches millions of rows), storage redundancy | The self-service Tableau/Power BI extract layer sitting *on top of* the star schema, not a replacement for it |
| **Lakehouse / Medallion (Bronze-Silver-Gold)** | Raw data lands as-is (Bronze), gets cleaned/conformed (Silver), then aggregated into BI-ready marts (Gold) | Handles all data types (not just structured), decouples raw ingestion from modeling, cheap storage | Requires more orchestration tooling; "Gold" still needs dimensional thinking underneath | BrightCart's actual 2026 stack: raw event/clickstream data lands in Bronze, gets conformed in Silver, and Gold is a Kimball star schema — the patterns aren't mutually exclusive |

**Migration and scale note**: these are not mutually exclusive lifecycle stages you must pick once and live with. A common real-world path is Inmon-style normalized staging -> Data Vault for auditable history -> Kimball star schema for the BI-facing "Gold" layer -> OBT extracts for specific dashboards. The "fight" between Kimball and Inmon evangelists from the 2000s is largely resolved in practice: most lakehouse architectures use normalized/vault-like staging *and* dimensional marts, at different layers, for different audiences.

---

## Senior-Level Insights

### Surrogate Keys

* **Natural Key**: The Product ID from the operational system (`SKU-123`).
  * *Risk*: What if the company re-uses SKUs?
* **Surrogate Key**: An auto-increment integer generated by the Data Warehouse (`dim_product_key = 1, 2, 3...`).
  * *Benefit*: Independence from upstream chaos. Handles "Slowly Changing Dimensions" (SCD Type 2) - tracking history of name changes.

### "Grain" is Everything

* **Rule**: You cannot mix grains in a Fact Table.
  * Don't mix "Daily Sales" rows with "Monthly Budget" rows.
  * Result: `SUM(Sales)` works, `SUM(Budget)` counts x30 times.
* **Fix**: Create separate Fact Tables (`fact_sales_daily`, `fact_budget_monthly`).

---

## Hands-on Lab

### Exercise 1: Star Schema Design

**Goal**: Design `fact_orders` for an Uber-like app.

**Fact**: `fact_trips`

* `trip_id` (PK)
* `driver_key` (FK) -> connects to `dim_driver`
* `rider_key` (FK) -> connects to `dim_rider`
* `date_key` (FK) -> connects to `dim_date`
* **Metrics**: `distance_miles`, `duration_minutes`, `fare_amount`.

**Dimension**: `dim_driver`

* `driver_key`
* `name`
* `rating`
* `car_model`

### Exercise 2: Grain Check

**Problem**: You have `fact_sales` (Grain: Product) and `shipping_cost` (Grain: Order).

* Order 101 contains 3 Products. Shipping is $10 flat.
* Row 1: Product A, Ship $10.
* Row 2: Product B, Ship $10.
* Row 3: Product C, Ship $10.
* **Query**: `SUM(Shipping)` returns $30. **Wrong.**
* **Task**: Allocate shipping? (Divide by count? $3.33 each) OR separate table?

### Exercise 3: Modern OBT

**Goal**: Denormalize using SQL.

```sql
CREATE TABLE obt_sales AS
SELECT
    f.sale_id,
    f.revenue,
    d.date,
    p.product_name,
    c.customer_city
FROM fact_sales AS f
INNER JOIN dim_date AS d ON f.date_key = d.date_key
INNER JOIN dim_product AS p ON f.product_key = p.product_key
INNER JOIN dim_customer AS c ON f.customer_key = c.customer_key;
```

* *Result*: One wide table ready for Tableau/Power BI Import Mode.

---

## Mastery Check

### Question 1: Schema Types

Which schema is optimized for READ performance in BI?
A) 3NF (Normalized).
B) Star Schema.
C) XML.
D) Unstructured Text.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Star Schema minimizes joins.
</details>

### Question 2: Fact Tables

What usually goes into a Fact Table?
A) Names and Addresses.
B) Keys and Measures (Numbers).
C) Images.
D) Colors.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Quantitative data.
</details>

### Question 3: Surrogate Keys

Why use a Surrogate Key (`Unknown Integer`) instead of a Natural Key (`Email Address`)?
A) It makes the database smaller.
B) Emails can change; Keys should be immutable history trackers.
C) Emails are private.
D) Integers join faster than Strings (and B is also true).

<details>
<summary>Click for Answer</summary>

**Answer: D**
Performance + History Tracking (SCD).
</details>

### Question 4: Granularity

If your Fact Table is at the "Daily" grain, can you see what time a sale happened?
A) Yes.
B) No.
C) Maybe.
D) Only if you ask nicely.

<details>
<summary>Click for Answer</summary>

**Answer: B**
You aggregated away the time. You lost that detail forever (in this table).
</details>

### Question 5: OBT

What is the downsides of One Big Table?
A) Slow queries.
B) Data Redundancy (Storage cost, Update complexity).
C) It's messy.
D) Only supports small data.

<details>
<summary>Click for Answer</summary>

**Answer: B**
If a Product Name changes, you have to update millions of rows in OBT, vs 1 row in Star Schema.
</details>

---

## Summary

Today you learned:

* ✅ **Star Schema**: The gold standard for BI.
* ✅ **Facts measure Verbs, Dimensions describe Nouns**.
* ✅ **OBT**: The modern "Power BI Import" standard.
* ✅ **Grain**: The level of detail defines what questions you can answer.

**Tomorrow**: We automate the movement of data in **BI ETL & Pipeline Automation**.
