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

### Pitfalls: How Star Schemas Silently Lie

These five mistakes don't crash your query — they just quietly produce a *wrong but plausible-looking* number, which is the worst kind of bug.

* **Fanout (Join Multiplication)**: Joining two fact-like tables (or a fact to a dimension with a one-to-many relationship you didn't expect) multiplies rows. If `order_items` (multiple rows per order) is joined to a `fact_returns` table also at the order grain without care, `SUM(revenue)` silently multiplies by however many line items each order had.
* **Mixed Grain**: Mixing "per order item" rows with "per order" rows in the same fact table (e.g., adding a flat `shipping_cost` row at order grain into a fact table that's otherwise at order-item grain) makes `SUM()` wrong the moment anyone aggregates without knowing to divide first. This is the Exercise 2 problem below.
* **Duplicate Facts**: A retried ETL job re-inserts the same `order_id` twice because the load wasn't idempotent (see Phase 7 Day 82). Every revenue total is now inflated by however many rows got duplicated.
* **Null Keys**: A `fact_orders` row with `customer_key = NULL` (because the customer dimension hadn't loaded yet) silently disappears from any `INNER JOIN`-based report — the revenue still happened, but it's invisible in the dashboard. Use a placeholder "Unknown Member" surrogate key (e.g., `-1`) instead of NULL, so the row still joins and shows up as an explicit "Unknown" bucket.
* **Referential-Integrity Gaps**: A `product_key` in `fact_orders` that doesn't exist in `dim_products` (e.g., a discontinued product purged from the dimension but not from history) causes the same silent disappearance under an inner join, or a crash under a strict foreign key constraint.
* **Double-Counting from Bad Grain Joins**: The general case of fanout — joining a table at a finer grain into a report expecting a coarser grain without first aggregating. Always ask "what is one row of this join result actually representing?" before trusting a `SUM`.

---

## Hands-on Lab: Modeling BrightCart's OLTP Data into a Star Schema

### The Source: BrightCart's Normalized OLTP Tables

This is the live transactional schema powering BrightCart's checkout system. It's correctly normalized for fast `INSERT`s — and slow for analytics, which is exactly why we're about to remodel it.

**`customers`**

| customer_id | signup_date | region | acquisition_channel |
| :--- | :--- | :--- | :--- |
| C001 | 2024-01-10 | West | paid_search |
| C002 | 2024-02-22 | East | organic |
| C003 | 2024-03-05 | West | referral |

**`orders`**

| order_id | customer_id | order_date | status | channel |
| :--- | :--- | :--- | :--- | :--- |
| O100 | C001 | 2024-06-01 | delivered | web |
| O101 | C002 | 2024-06-02 | delivered | app |
| O102 | C001 | 2024-06-03 | returned | web |

**`order_items`**

| order_id | product_id | quantity | unit_price | discount_pct |
| :--- | :--- | :--- | :--- | :--- |
| O100 | P10 | 2 | 50.00 | 0.10 |
| O100 | P11 | 1 | 30.00 | 0.00 |
| O101 | P10 | 1 | 50.00 | 0.00 |
| O102 | P12 | 1 | 80.00 | 0.00 |

**`products`**

| product_id | category | subcategory | cost | list_price |
| :--- | :--- | :--- | :--- | :--- |
| P10 | Footwear | Hiking Boots | 22.00 | 50.00 |
| P11 | Apparel | Base Layers | 12.00 | 30.00 |
| P12 | Footwear | Trail Runners | 35.00 | 80.00 |

### Exercise 1: Declare the Grain, Then Build the Star

**Goal**: Before writing any SQL, declare the grain in one sentence. Getting this wrong invalidates everything downstream (see the Grain pitfalls above).

> **Grain declaration**: "One row of `fact_orders` represents one product, in one order, on one day." (i.e., the grain of `order_items`, enriched with order- and date-level attributes — NOT the grain of `orders` alone, because an order can contain multiple products.)

**`dim_customers`** (one row per customer, SCD Type 2 ready)

```sql
CREATE TABLE dim_customers (
    customer_key      INTEGER PRIMARY KEY,  -- surrogate key
    customer_id       VARCHAR,              -- natural key from OLTP
    region            VARCHAR,
    acquisition_channel VARCHAR,
    signup_date       DATE,
    valid_from        DATE,
    valid_to          DATE,
    is_current        BOOLEAN
);
```

**`dim_products`** (one row per product)

```sql
CREATE TABLE dim_products (
    product_key   INTEGER PRIMARY KEY,
    product_id    VARCHAR,
    category      VARCHAR,
    subcategory   VARCHAR,
    cost          NUMERIC,
    list_price    NUMERIC
);
```

**`fact_orders`** (one row per order line item — the declared grain)

```sql
CREATE TABLE fact_orders (
    order_id        VARCHAR,        -- degenerate dimension (no attributes of its own)
    customer_key    INTEGER,        -- FK -> dim_customers
    product_key     INTEGER,        -- FK -> dim_products
    date_key        INTEGER,        -- FK -> dim_date
    order_status    VARCHAR,        -- placed | shipped | delivered | returned | cancelled
    channel         VARCHAR,        -- web | app | marketplace
    quantity        INTEGER,
    unit_price      NUMERIC,
    discount_pct    NUMERIC,
    net_revenue     NUMERIC         -- quantity * unit_price * (1 - discount_pct)
);
```

**Load query** (joining the normalized sources at the declared grain):

```sql
INSERT INTO fact_orders
SELECT
    oi.order_id,
    dc.customer_key,
    dp.product_key,
    CAST(STRFTIME('%Y%m%d', o.order_date) AS INTEGER) AS date_key,
    o.status,
    o.channel,
    oi.quantity,
    oi.unit_price,
    oi.discount_pct,
    oi.quantity * oi.unit_price * (1 - oi.discount_pct) AS net_revenue
FROM order_items AS oi
JOIN orders AS o          ON oi.order_id = o.order_id
JOIN dim_customers AS dc  ON o.customer_id = dc.customer_id AND dc.is_current = TRUE
JOIN dim_products AS dp   ON oi.product_id = dp.product_id;
```

**Expected output** (`fact_orders`, 4 rows — matching the 4 `order_items` rows above, confirming the grain held):

| order_id | customer_key | product_key | order_status | channel | quantity | net_revenue |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| O100 | 1 | 10 | delivered | web | 2 | 90.00 |
| O100 | 1 | 11 | delivered | web | 1 | 30.00 |
| O101 | 2 | 10 | delivered | app | 1 | 50.00 |
| O102 | 1 | 12 | returned | web | 1 | 80.00 |

**Test the join**: `SELECT COUNT(*) FROM fact_orders` must equal `SELECT COUNT(*) FROM order_items` (4 = 4). If it's higher, you have fanout. If it's lower, you have a referential-integrity gap (an order_item whose order_id or product_id didn't match).

### Exercise 2: Grain Check — The Shipping Cost Trap

**Problem**: BrightCart's finance system tracks `shipping_cost` at the **order** grain ($10 flat per order, not per item). Order O100 has 2 line items in `fact_orders` (grain: order item).

* Naively joining `shipping_cost` onto `fact_orders` by `order_id` duplicates the $10 onto *both* rows.
* **Query**: `SELECT SUM(shipping_cost) FROM fact_orders WHERE order_id = 'O100'` returns **$20**. **Wrong** — BrightCart only paid $10 once.
* **Fix options**:
  1. **Allocate**: Divide $10 across the 2 line items ($5 each) — correct for "shipping cost per item" analysis, but introduces an allocation assumption.
  2. **Separate fact table**: Create `fact_order_shipping(order_id, shipping_cost)` at the order grain, and `SUM` it independently — never join it directly into the item-grain fact for a revenue total.
* **Expected correct output**: `SUM(shipping_cost)` from `fact_order_shipping` for O100 = **$10.00** (queried at the correct grain, not joined into the item-level fact).

### Exercise 3: Modern OBT — Denormalize for Self-Service

**Goal**: Build the wide, join-free table that a marketing analyst can drop straight into Power BI Import Mode, without needing to understand the star schema underneath.

```sql
CREATE TABLE obt_brightcart_orders AS
SELECT
    f.order_id,
    f.order_status,
    f.channel,
    dc.region,
    dc.acquisition_channel,
    dp.category,
    dp.subcategory,
    f.quantity,
    f.net_revenue
FROM fact_orders AS f
JOIN dim_customers AS dc ON f.customer_key = dc.customer_key
JOIN dim_products AS dp ON f.product_key = dp.product_key;
```

**Expected output** (4 rows, one per `fact_orders` row, no joins needed downstream):

| order_id | order_status | channel | region | category | net_revenue |
| :--- | :--- | :--- | :--- | :--- | :--- |
| O100 | delivered | web | West | Footwear | 90.00 |
| O100 | delivered | web | West | Apparel | 30.00 |
| O101 | delivered | app | East | Footwear | 50.00 |
| O102 | returned | web | West | Footwear | 80.00 |

*Trade-off reminder*: if `dim_products.category` for P10 is later renamed from "Footwear" to "Footwear & Boots," the star schema needs a 1-row UPDATE in `dim_products`; the OBT needs every historical row touching P10 rewritten. That's the storage-vs-maintenance trade-off from the architecture table above, made concrete.

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

## Cross-References

* Phase 7 Day 73 — BI SQL & Databases (the join mechanics used to build `fact_orders` from normalized sources).
* Phase 7 Day 80 — BI Data Quality & Governance (the source tables modeled here must pass quality tests *before* they're trustworthy inputs to a star schema).
* Phase 7 Day 82 — BI ETL & Pipeline Automation (operationalizes the load query in Exercise 1 into a scheduled, idempotent, re-runnable pipeline).
* Phase 7 Day 83 — BI Cloud & Modern Data Stack (where Bronze/Silver/Gold medallion architecture and warehouse-native modeling tools like dbt live).
* Phase 7 Day 84B — dbt Fundamentals (the modern tooling for building and testing these exact dimension/fact models as version-controlled SQL).

## Glossary

* **Fact**: A row recording a measurable business event, holding numeric measures and foreign keys to dimensions.
* **Dimension**: A table providing descriptive context (the "who/what/where") for facts.
* **Grain**: The precise definition of what one row of a fact table represents — must be declared before modeling and never mixed within one table.
* **Surrogate Key**: A warehouse-generated, meaningless integer key (vs. a natural key from the source system) used to join facts to dimensions and to support history tracking.
* **Star Schema**: A fact table joined directly to denormalized dimension tables, minimizing joins for fast reads.
* **Snowflake Schema**: A star schema whose dimensions are further normalized into sub-dimensions, trading query speed for storage efficiency.
* **OBT (One Big Table)**: A fully denormalized, pre-joined wide table requiring no joins at query time.
* **SCD (Slowly Changing Dimension)**: A pattern for handling changes to dimension attributes over time (Type 1 overwrites, Type 2 versions with new rows, Type 3 adds a "previous value" column).
* **Conformed Dimension**: A dimension table reused unchanged across multiple fact tables so cross-process analysis (e.g., orders vs. support tickets) shares one definition of "customer."
* **Factless Fact Table**: A fact table that records an event occurred with no numeric measures, used for tracking coverage/occurrence (e.g., product views).
* **Fanout**: Unintended row multiplication from a join that doesn't respect grain, silently inflating `SUM()`/`COUNT()` results.

## Summary

Today you learned:

* ✅ **Star Schema**: The gold standard for BI.
* ✅ **Facts measure Verbs, Dimensions describe Nouns**.
* ✅ **OBT**: The modern "Power BI Import" standard.
* ✅ **Grain**: The level of detail defines what questions you can answer.
* ✅ **Advanced Patterns**: SCDs, conformed/role-playing dimensions, factless facts, bridges, snapshots, and late-arriving data.
* ✅ **Architecture Trade-offs**: Kimball, Inmon, Data Vault, OBT, and lakehouse/medallion approaches are complementary layers, not rival religions.
* ✅ **Pitfalls**: Fanout, mixed grain, duplicate facts, null keys, and referential-integrity gaps all produce wrong-but-plausible numbers.

**Tomorrow**: We automate the movement of data in **BI ETL & Pipeline Automation**.
