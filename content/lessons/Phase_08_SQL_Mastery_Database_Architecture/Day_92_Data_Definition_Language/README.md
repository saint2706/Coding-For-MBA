---
day: 92
title: "Advanced DDL & Schema"
phase: 8
phaseTitle: "SQL Mastery & Database Architecture"
slug: "advanced-ddl"
duration: 120
difficulty: "advanced"
tags:
  - partitioning
  - exclusion-constraints
  - triggers
  - procedures
concepts:
  - "Declarative Partitioning (Range/List/Hash)"
  - "Exclusion Constraints (The 'No Overlap' Rule)"
  - "Stored Procedures vs Functions"
  - "Triggers (Audit Logs)"
prerequisites:
  - "Basic CREATE TABLE"
outcomes:
  - "Partition a 1TB table by Date"
  - "Prevent Booking Overlaps at the DB level"
  - "Write a PL/pgSQL Trigger"
---

# 🎯 Day 92: Advanced DDL & Schema

> *"A weak schema allows garbage in. A strong schema forces the application to be correct."*

---

## The "Never-Coded" Bridge

**The Hotel Reservation Book**

**Basic Rule**: "Don't double book Room 101."

* **Application Logic**: The receptionist checks the book manually before writing.
  * *Risk*: Two receptionists check at the same time. Both see "Empty". Both write "Booked". (Race Condition).
* **Database Constraint (Exclusion)**: The physical book *refuses* to let you write on a line that is already written.
  * *Result*: One receptionist writes. The other's pen snaps. (Error: Conflict).

**Partitioning**: Instead of one giant book for 2020-2030, you have 10 separate binders (one per year). It's faster to find "March 2024".

---

## The Technical Deep Dive

### 1. Declarative Partitioning

Postgres 10+ made this easy.

* **Parent Table**: `CREATE TABLE logs (...) PARTITION BY RANGE (created_at);`
* **Child Tables**: `CREATE TABLE logs_2023 PARTITION OF logs FOR VALUES FROM ('2023-01-01') TO ('2024-01-01');`
* **Benefit**: You query `logs`, Postgres scans `logs_2023`.
* **Maintenance**: You can `DROP TABLE logs_2020` instantly to reclaim space (vs `DELETE FROM logs` which is slow).

### 2. Constraints++ (Exclusion)

`UNIQUE` prevents duplicate IDs. `EXCLUDE` prevents overlapping ranges.

* **Scenario**: Room Booking.
* **Code**: `EXCLUDE USING gist (room_id WITH =, duration WITH &&)`.
* **Meaning**: "Reject any row where `room_id` matches AND the `duration` (Time Range) overlaps with an existing row."
* *Why?*: Impossible to enforce consistently in Python/Node without locking the whole table.

### 3. Stored Procedures and Triggers

* **Function**: Returns a value. Run inside `SELECT`. (`SELECT my_func()`).
* **Procedure**: Performs actions (Transactions). Call with `CALL proc()`. Can `COMMIT` inside.
* **Trigger**: Runs automatically `BEFORE` or `AFTER` an Event (`INSERT`, `UPDATE`).
  * **Use Case**: Audit Logging. Copy the *old row* to a `history` table before updating.

---

## Senior-Level Insights

### "Logic in DB" vs "Logic in App"

* **The Debate**:
  * **DB Approach**: Use Triggers/Procedures. "Data is valid even if I insert via CLI."
  * **App Approach**: Keep DB dumb (Storage). Logic in Python. "Easier to test/version control."
* **Middle Ground**: Use **Constraints** (Foreign Keys, Checks, Exclusion) in DB because they are fast/safe. Keep **Business Workflow** in App. Avoid complex PL/pgSQL if possible (hard to debug).

### Partition Maintenance

* **Challenge**: You created partitions for 2023. It is now 2024.
* **Result**: Insert Fails. "No partition found."
* **Fix**: Automation (pg_partman extension) to create future partitions automatically.

---

## Hands-on Lab

### Exercise 1: Exclusion Constraint

**Goal**: Prevent double booking.

```sql
CREATE EXTENSION btree_gist; -- Required for scalar types

CREATE TABLE bookings (
    room_id INT,
    during TSTZRANGE, -- Range of timestamp
    EXCLUDE USING gist (room_id WITH =, during WITH &&)
);

INSERT INTO bookings VALUES (101, '[2024-01-01 10:00, 2024-01-01 12:00)');
-- This next insert fails:
INSERT INTO bookings VALUES (101, '[2024-01-01 11:00, 2024-01-01 13:00)');
```

### Exercise 2: Audit Trigger

**Goal**: Log changes.

```sql
CREATE OR REPLACE FUNCTION log_change() RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_log(user, old_val, new_val)
    VALUES (current_user, OLD.balance, NEW.balance);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_balance
BEFORE UPDATE ON accounts
FOR EACH ROW
EXECUTE FUNCTION log_change();
```

### Exercise 3: Partitioning

**Goal**: Split data by region.

```sql
CREATE TABLE sales (id int, region text, amount int) 
PARTITION BY LIST (region);

CREATE TABLE sales_us PARTITION OF sales FOR VALUES IN ('US');
CREATE TABLE sales_eu PARTITION OF sales FOR VALUES IN ('EU');

INSERT INTO sales VALUES (1, 'US', 100); -- Goes to sales_us
```

---

### Non-Functional Constraints (Apply to All Exercises)

- **Performance / Scale**: Document a target query runtime of **p95 < 3s** for your final solution, validate behavior at **20 concurrent analytical users/sessions**, and keep compute spend below **$2** per production-equivalent run.
- **Data Governance / Security**: Define acceptance criteria for least-privilege access, PII handling (masking/tokenization where applicable), audit logging of query access, and retention/deletion alignment with policy.
- **Business KPI Impact**: Explicitly state which business KPI(s) improve based on your schema/query decisions and quantify expected directional impact.
  - KPI focus for this day: *DDL decisions should reduce schema-change lead time and incident frequency for customer-facing product releases.*

## Mastery Check

### Question 1: Partitioning

If you drop a partition table, what happens to the data?
A) It remains in the parent table.
B) It is deleted instantly.
C) It moves to the default partition.
D) It converts to JSON.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Dropping a child table deletes its data. Fast cleanup.
</details>

### Question 2: Stored Procedure

Can a Stored Procedure manage transactions (`COMMIT`/`ROLLBACK`)?
A) Yes.
B) No, only functions can.
C) Only in Oracle.
D) Never.

<details>
<summary>Click for Answer</summary>

**Answer: A**
This is the main difference between Procedures (Call) and Functions (Select).
</details>

### Question 3: Trigger Timing

When should you use `BEFORE UPDATE` trigger?
A) To log the change.
B) To modify the data *before* it hits the disk (e.g., lowercase email).
C) To send an email.
D) To slow down the database.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Validation or Sanitization logic.
</details>

### Question 4: Constraints

Which constraint ensures a column value refers to a valid row in another table?
A) CHECK.
B) UNIQUE.
C) FOREIGN KEY.
D) NOT NULL.

<details>
<summary>Click for Answer</summary>

**Answer: C**
Referential Integrity.
</details>

### Question 5: Exclusion

Can `UNIQUE` validation handle "Time Overlaps"?
A) Yes.
B) No, Unique only checks for exact equality.
C) Sometimes.
D) Only on leap years.

<details>
<summary>Click for Answer</summary>

**Answer: B**
You need Exclusion Constraints (&& operator) for overlaps.
</details>

---

## Summary

Today you learned:

* ✅ **Declarative Partitioning**: Manage massive tables easily.
* ✅ **Exclusion Constraints**: Solve the "Booking Problem" natively.
* ✅ **Triggers**: Automate actions on DB events.
* ✅ **Procedures**: Transactional logic in the database.

**Tomorrow**: We manipulate data with power in **Data Manipulation Language (DML)**.
