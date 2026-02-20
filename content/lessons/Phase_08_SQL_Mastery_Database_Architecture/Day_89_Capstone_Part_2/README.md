---
day: 89
title: "Capstone Part 2: Implementation"
phase: 8
phaseTitle: "SQL Mastery & Database Architecture"
slug: "capstone-build"
duration: 120
difficulty: "advanced"
tags:
  - ddl
  - etl
  - optimization
  - build
concepts:
  - "Translating ERD to DDL (Create Tables)"
  - "Loading Data (ETL Script)"
  - "Index Tuning (Explain Analyze)"
  - "Stress Testing"
prerequisites:
  - "Completed Design Doc (Day 88)"
outcomes:
  - "Deploy a working Postgres Database"
  - "Write a Python Script to seed 1M rows"
  - "Optimize a Slow Query from 5s to 50ms"
---

# 🎯 Day 89: Capstone Part 2: Implementation

> *"Talk is cheap. Show me the code." — Linus Torvalds*

---

## The "Never-Coded" Bridge

**The Construction Site**

* **Day 88 (Architect)**: Drew the plans. "Kitchen goes here."
* **Day 89 (Builder)**: Pours the concrete. Installs the pipes.
  * **DDL**: Framing the house (`CREATE TABLE`).
  * **ETL**: Moving the furniture in (`INSERT`).
  * **Optimization**: Sanding the floors (`CREATE INDEX`).

**Today**, we turn the paper design into a running database.

---

## The Technical Deep Dive

### 1. DDL: Constraints are Key

Don't just `CREATE TABLE`. Use **Constraints** to protect data quality.

* `PRIMARY KEY`: Enforces uniqueness.
* `FOREIGN KEY`: Enforces relationships. (Prevents "Orphaned" orders).
* `CHECK (age > 0)`: Enforces business logic.
* `NOT NULL`: Prevents missing data.

### 2. Seeding Data (Python Faker)

You need data to test performance.

* **Library**: `faker`.
* **Script**: Generate 1 Million users.
* **Why?**: Identifying "Slow Queries" on 10 rows is impossible. You need volume.

### 3. Optimization Strategy

* **Step 1**: Run `EXPLAIN ANALYZE SELECT ...`.
* **Step 2**: Look for `Seq Scan` (Sequential Scan = Reading the whole book).
* **Step 3**: `CREATE INDEX idx_name ON table(column)`.
* **Step 4**: Run `EXPLAIN ANALYZE` again. Look for `Index Scan` (Jump to page).

---

## Senior-Level Insights

### "Indexes are not Free"

* **Junior**: "I'll index every column so reads are fast!"
* **Senior**: "Each index slows down `INSERT` / `UPDATE`."
* **Why?**: When you write a new row, the DB has to update the Table AND the 10 Indexes.
* **Balance**: Only index columns used in `WHERE`, `JOIN`, or `ORDER BY`.

### The "Migration" Headache

* **Dev**: "I changed the schema locally. It works."
* **Prod**: "The deployment failed because the table has 1 Billion rows and the `ALTER TABLE` locked it for 4 hours."
* **Solution**: "Online DDL" tools or "Expand/Contract" pattern (Add new column, dual write, backfill, switch read, drop old column).

---

## Hands-on Lab

### Exercise 1: The Build (DDL)

**Goal**: Create the schema from Day 88.

```sql
CREATE TABLE drivers (
    driver_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    current_city VARCHAR(50),
    rating DECIMAL(3,2) CHECK (rating BETWEEN 0 AND 5)
);

CREATE TABLE trips (
    trip_id SERIAL PRIMARY KEY,
    driver_id INT REFERENCES drivers(driver_id),
    fare DECIMAL(10,2) NOT NULL,
    trip_date DATE DEFAULT CURRENT_DATE
);
```

### Exercise 2: The Load (Python)

**Goal**: Generate 100k rows.

```python
from faker import Faker
import random

fake = Faker()

# Generate SQL
with open('seed.sql', 'w') as f:
    for _ in range(100000):
        name = fake.name().replace("'", "''")
        city = random.choice(['NY', 'SF', 'London'])
        f.write(f"INSERT INTO drivers (name, current_city, rating) VALUES ('{name}', '{city}', 4.5);\n")
```

### Exercise 3: The Optimize

**Goal**: Fix the slow query.

**Query**: `SELECT * FROM drivers WHERE current_city = 'London'`.

* **Without Index**: Scans 100k rows. Cost: 500. Time: 200ms.
* **Action**: `CREATE INDEX idx_city ON drivers(current_city)`.
* **With Index**: Scans 30k rows (Index Bitmap Scan). Cost: 50. Time: 10ms.

---

### Non-Functional Constraints (Apply to All Exercises)

- **Performance / Scale**: Document a target query runtime of **p95 < 5s** for your final solution, validate behavior at **40 concurrent analytical users/sessions**, and keep compute spend below **$8** per production-equivalent run.
- **Data Governance / Security**: Define acceptance criteria for least-privilege access, PII handling (masking/tokenization where applicable), audit logging of query access, and retention/deletion alignment with policy.
- **Business KPI Impact**: Explicitly state which business KPI(s) improve based on your schema/query decisions and quantify expected directional impact.
  - KPI focus for this day: *Capstone implementation should deliver stakeholder-ready KPI dashboards with <15 minute latency and predictable monthly infra spend.*

### Architecture Decision Log (Capstone Requirement)

For your final capstone submission, include an **Architecture Decision Log** that captures:

1. **Decision and Context**: The architecture/schema/query decision, business context, and constraints.
2. **Tradeoffs**: What you gain and what you accept (performance, flexibility, governance, operational complexity).
3. **Rejected Alternatives**: At least two alternatives considered, with concise reasons they were rejected.
4. **Expected Operational Impact**: Predicted impact on reliability, on-call burden, incident recovery time, and ongoing cost.


## Mastery Check

### Question 1: Foreign Keys

What happens if you try to `INSERT` a trip with `driver_id = 999` but Driver 999 does not exist?
A) It works fine.
B) The Database throws an Error (Foreign Key Constraint Violation).
C) It creates Driver 999 automatically.
D) It crashes.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Constraints protect integrity.
</details>

### Question 2: Explain Analyze

What does `EXPLAIN ANALYZE` do?
A) Runs the query and tells you how it executed (Plan + Actual Time).
B) Only predicts the plan.
C) Optimizes the query automatically.
D) Deletes the table.

<details>
<summary>Click for Answer</summary>

**Answer: A**
Crucial for debugging performance.
</details>

### Question 3: Indexing

Which column is a good candidate for an Index?
A) `gender` (Only 'M' or 'F'). (Low Cardinality).
B) `email` (Unique per user). (High Cardinality + Frequent Search).
C) `description` (Long text blob).
D) A column never used in WHERE.

<details>
<summary>Click for Answer</summary>

**Answer: B**
High Cardinality columns used in WHERE are best for B-Tree indexes.
</details>

### Question 4: Default Values

What does `DEFAULT CURRENT_DATE` do?
A) Automatically fills the date if you don't provide one.
B) Forces you to provide a date.
C) Updates the date every time you read the row.
D) Nothing.

<details>
<summary>Click for Answer</summary>

**Answer: A**
Useful for `created_at` timestamps.
</details>

### Question 5: Migration Safety

Is `DROP COLUMM` safe in production?
A) Yes, always.
B) No, it might break applications that rely on `SELECT *` or that column.
C) Only on weekends.
D) If you say "Please".

<details>
<summary>Click for Answer</summary>

**Answer: B**
Always deprecate first (ignore in code), then drop later.
</details>

---

## Summary

Today you learned:

* ✅ **DDL Constraints**: Build quality into the schema.
* ✅ **Seeding**: Validate performance with volume (Faker).
* ✅ **Indexing**: The first line of defense against slow queries.
* ✅ **Migration Safety**: Be careful with production schemas.

**Tomorrow**: We review your career strategy in **Career Workshop**.
