---
day: 83
title: "BI Cloud & Modern Data Stack"
phase: 7
phaseTitle: "BI Analytics, Governance & Modern Data Stack"
slug: "cloud-analytics"
duration: 120
difficulty: "advanced"
tags:
  - snowflake
  - bigquery
  - cloud-computing
  - finops
concepts:
  - "Separation of Compute & Storage"
  - "Reverse ETL (Census/Hightouch)"
  - "The Modern Data Stack (Fivetran-dbt-Snowflake)"
  - "FinOps (Managing Cloud Bills)"
prerequisites:
  - "Understanding of Databases (Day 73)"
  - "ETL Basics (Day 82)"
outcomes:
  - "Estimate cloud warehouse costs"
  - "Explain 'Reverse ETL' to a marketer"
  - "Optimize queries for column-store"
---

# 🎯 Day 83: BI Cloud & Modern Data Stack

> *"The Cloud means you don't own the server. It also means you can rent a Supercomputer for $3, use it for 1 minute, and give it back."*

---

## The "Never-Coded" Bridge

**Renting vs. Buying a Hotel**

**On-Premise (Old Way)**: You buy a 100-room hotel (Server).
*   *Tuesday*: 5 guests. (95 empty rooms wasted).
*   *New Year's Eve*: 500 guests. (400 people angry).
*   *Cost*: Fixed & High.

**Cloud (Snowflake/BigQuery)**: You rent rooms dynamically.
*   *Tuesday*: Rent 5 rooms. Pay $5.
*   *New Year's Eve*: Rent 500 rooms. Pay $500.
*   *Cost*: Variable & Efficient (if managed well).

**Separation of Compute & Storage**:
*   **Storage (The Building)**: Cheap. Store data forever on S3 ($0.02/GB).
*   **Compute (The Staff)**: Expensive. Only hire staff (spin up servers) when guests arrive (Query runs).

---

## The Technical Deep Dive

### 1. The Modern Data Stack (MDS)

The standard architecture for high-growth companies:
1.  **Ingest (No Code)**: Fivetran / Airbyte. (Copies data from Salesforce/Postgres to Warehouse).
2.  **Store (Cloud)**: Snowflake / BigQuery / Redshift.
3.  **Transform (SQL)**: dbt. (Cleans data inside the Warehouse).
4.  **Analyze (BI)**: Tableau / Looker.
5.  **Activate (Reverse ETL)**: Census / Hightouch. (Sends data back to Salesforce).

### 2. Reverse ETL

We spent 10 years getting data *out* of Salesforce into Snowflake. Why put it back?
*   **Scenario**: Sales Rep needs to know "Target Account" score inside Salesforce.
*   They won't login to Tableau.
*   **Reverse ETL** puts the score directly into the CRM field `churn_risk_score`.

### 3. Columnar Storage & Pruning

*   **Row Store (Postgres)**: Reads row by row. Good for `SELECT * FROM user WHERE id=1`.
*   **Column Store (Snowflake)**: internal partitions.
    *   Query: `SELECT SUM(Sales) FROM orders WHERE date = '2023-01-01'`.
    *   **Micro-Partitions**: Snowflake knows which "files" contain 2023-01-01. It *skips* 99% of the data (Pruning).
    *   It only reads the `Sales` column (not Address, Name, etc.).

---

## Senior-Level Insights

### FinOps: The $10,000 Query

*   **Danger**: `SELECT * FROM logs` (where logs = 1 Petabyte).
*   **Result**: You just spent $5,000 in 10 seconds.
*   **Defense**:
    *   Set **Quotas/Limits**.
    *   Force Partition Filters (`WHERE date = 'today'`).
    *   Monitor "Top Spenders" daily.

### "Zero Copy Cloning"

*   In Snowflake, you can "Clone" a 10TB production database to "Dev" instantly.
*   It costs $0 (initially). It takes 0 seconds.
*   *How?* It just points to the same underlying files. It only stores *deltas* (changes) you make in Dev.
*   *Impact*: Safe, real-data testing environments.

---

## Hands-on Lab

### Exercise 1: Cost Estimation
**Goal**: Calculate the bill.

**Scenario**: Snowflake "Medium" Warehouse (4 Credits/Hour).
*   Price: $3.00 / Credit.
*   Usage: Runs 2 hours a day, 20 days a month.

**Math**:
*   $4 \text{ credits} \times \$3 = \$12/\text{hour}$.
*   $2 \text{ hours} \times 20 \text{ days} = 40 \text{ hours}$.
*   $40 \times \$12 = \$480/\text{month}$.
*   *Compare*: Buying a server costs $10k upfront. Cloud wins for bursts.

### Exercise 2: Architecture Diagram
**Goal**: Draw the flow.

**Scenario**: Marketing wants to email "High Value Customers" who abandoned a cart.
1.  **Shopify** (Source) -> **Fivetran** -> **Snowflake**.
2.  **dbt** creates table `high_value_abandoners` (Logic: Cart > $100 AND Risk < 5).
3.  **Reverse ETL** (Hightouch) syncs table to **Mailchimp** (Tag: `VIP_Abandon`).
4.  **Mailchimp** triggers email.

### Exercise 3: Partition Pruning
**Goal**: Optimize a query.

**Bad Query**: `SELECT count(*) FROM events WHERE user_id = 555`.
*   (Scans all history to find User 555).

**Good Query**: `SELECT count(*) FROM events WHERE date > '2023-01-01' AND user_id = 555`.
*   (Prunes 90% of files before searching for User).

---

## Mastery Check

### Question 1: Separation of Compute/Storage
What is the main benefit of separating Compute and Storage?
A) It is slower.
B) You can scale them independently (e.g., Massive storage with tiny compute for night, Massive compute for day).
C) It locks you into AWS.
D) It deletes data.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Elasticity is the cloud's superpower.
</details>

### Question 2: Columnar Store
Why are Columnar databases bad for Transactional (OLTP) apps?
A) They are slow at `INSERT` and `UPDATE` of single rows.
B) They are too fast.
C) They cannot store text.
D) They are free.

<details>
<summary>Click for Answer</summary>

**Answer: A**
They are optimized for `SELECT SUM(col)`, not `UPDATE row`.
</details>

### Question 3: Reverse ETL
What describes Reverse ETL?
A) Moving data from Warehouse -> Operational Tool (CRM/Ads).
B) Moving data from App -> Warehouse.
C) Deleting data.
D) Backing up data.

<details>
<summary>Click for Answer</summary>

**Answer: A**
Closing the loop. "Operational Analytics".
</details>

### Question 4: FinOps
If a query scans 1TB of data in BigQuery, do you pay for it?
A) No, only storage is charged.
B) Yes, BigQuery charges by "Bytes Scanned".
C) Only if it returns a row.
D) Only on Tuesdays.

<details>
<summary>Click for Answer</summary>

**Answer: B**
This is why `SELECT *` is dangerous in BigQuery.
</details>

### Question 5: Modern Data Stack
Which tool is the industry standard for "Transformation" (The T in ELT)?
A) Excel.
B) dbt (data build tool).
C) Word.
D) Notepad.

<details>
<summary>Click for Answer</summary>

**Answer: B**
dbt allows you to write SQL with software engineering best practices (Tests, Version Control).
</details>

---

## Summary

Today you learned:
*   ✅ **Modern Data Stack**: Fivetran -> Snowflake -> dbt.
*   ✅ **Cloud Economics**: Rent compute only when you need it.
*   ✅ **FinOps**: Optimizing queries saves real money.
*   ✅ **Reverse ETL**: Activating data back into business tools.

**Tomorrow**: We wrap up with **BI Career Development & Capstone**—Building your portfolio.
