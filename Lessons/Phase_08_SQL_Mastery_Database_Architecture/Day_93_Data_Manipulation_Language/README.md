---
day: 93
title: "Advanced DML & Upserts"
phase: 8
phaseTitle: "SQL Mastery & Database Architecture"
slug: "advanced-dml"
duration: 120
difficulty: "advanced"
tags:
  - upsert
  - copy
  - modifying-cte
  - bulk-load
concepts:
  - "The Upsert (INSERT ON CONFLICT)"
  - "Bulk Loading (COPY vs INSERT)"
  - "Modifying CTEs (RETURNING clause)"
  - "Savepoints in Transactions"
prerequisites:
  - "Basic INSERT/UPDATE"
outcomes:
  - "Perform an idempotent Upsert"
  - "Move data atomically between tables"
  - "Recover from partial transaction failure using Savepoints"
---

# 🎯 Day 93: Advanced DML & Upserts

> *"Writing data is easy. Writing data safely, idempotently, and fast is hard."*

---

## The "Never-Coded" Bridge

**The Guest List (Upsert)**

* **Insert**: "Add Bob to the list."
  * *Problem*: What if Bob is already there? (Error: Duplicate).
* **Update**: "Change Bob's status to 'Arrived'."
  * *Problem*: What if Bob isn't there yet? (Error: Not Found).
* **Upsert**: "Look for Bob. If he's there, check him in. If he's not, add him."
  * *Result*: Guaranteed success. Idempotent.

**Bulk Loading (The Moving Van)**

* **Insert**: Carrying one box at a time into the house. (Slow).
* **COPY**: Backing the truck up and dumping everything at once. (Fast).

---

## The Technical Deep Dive

### 1. The Upsert (`INSERT ... ON CONFLICT`)

Standard Pattern for ETL.

* **Syntax**:

    ```sql
    INSERT INTO users (id, name, login_count) 
    VALUES (1, 'Bob', 1)
    ON CONFLICT (id) 
    DO UPDATE SET 
        login_count = users.login_count + 1,
        name = EXCLUDED.name;
    ```

* **Logic**: Tries to Insert. If ID=1 exists, it updates `login_count` instead.
* **Idempotency**: Runs safely 100 times.

### 2. Modifying CTEs (`RETURNING`)

You can `DELETE` and `INSERT` in one statement.

* **Scenario**: Move 'archived' users to a different table.
* **Code**:

    ```sql
    WITH moved_rows AS (
        DELETE FROM users 
        WHERE status = 'archived' 
        RETURNING *
    )
    INSERT INTO users_archive 
    SELECT * FROM moved_rows;
    ```

* **Atomicity**: Both happen, or neither happens. No data lost in between.

### 3. Bulk Loading (`COPY`)

* **`INSERT INTO table VALUES (1), (2), (3)...`**: Slow. The Database parses every value, checks types, checks constraints row-by-row.
* **`COPY table FROM 'file.csv'`**: Fast. It streams raw bytes directly to disk (mostly). Validation is batched.
* **Speedup**: ~10x-100x faster than INSERT.

---

## Senior-Level Insights

### Partial Rollbacks (Savepoints)

* **Scenario**: You are processing a batch of 100 payments.
* **Payment #50 Fails**.
* **Normally**: `ROLLBACK` undoes *everything* (Success 1-49 are lost).
* **Better**: Use `SAVEPOINT sp1`. If #50 fails, `ROLLBACK TO sp1` (undo just #50), keep going.
* **Code**:

    ```sql
    BEGIN;
    INSERT ... (Row 1);
    SAVEPOINT s1;
    INSERT ... (Row 2); -- Fails!
    ROLLBACK TO s1; -- Undo Row 2 only.
    COMMIT; -- Row 1 is saved.
    ```

### Disabling Indexes for Bulk Load

* **Tip**: If loading 1 Billion rows...
    1. `DROP INDEX` on the table.
    2. `COPY` data (Super fast).
    3. `CREATE INDEX` (One big sort).
* **Why?**: Transforming the index tree 1 Billion times (once per row) is slower than building it once at the end.

---

## Hands-on Lab

### Exercise 1: The Upsert

**Goal**: Manage a Counter.

**Table**: `page_views (url text PRIMARY KEY, hits int)`.

**Task**: Write a query that:

1. Tries to insert `('home', 1)`.
2. If 'home' exists, increments `hits`.

```sql
INSERT INTO page_views (url, hits) 
VALUES ('home', 1)
ON CONFLICT (url) 
DO UPDATE SET hits = page_views.hits + 1;
```

### Exercise 2: Atomic Move

**Goal**: Archive old logs.

**Table**: `logs`. Move logs older than 30 days to `logs_archive`.

```sql
WITH deleted AS (
    DELETE FROM logs
    WHERE created_at < NOW() - INTERVAL '30 days'
    RETURNING *
)
INSERT INTO logs_archive
SELECT * FROM deleted;
```

### Exercise 3: Savepoint Recovery

**Goal**: Simulate partial failure.

```sql
BEGIN;
INSERT INTO users (id) VALUES (1);
SAVEPOINT s1;
INSERT INTO users (id) VALUES (1); -- Fails (Duplicate)
ROLLBACK TO s1; -- Catch the error
INSERT INTO users (id) VALUES (2); -- Continue
COMMIT;
-- Result: IDs 1 and 2 are in the table.
```

---

## Mastery Check

### Question 1: Upsert

What is `EXCLUDED` in an Upsert query?
A) The row that was deleted.
B) The special table containing the values you *tried* to insert (The proposed new data).
C) A keyword for banning users.
D) An error.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Allows you to merge new data with old data (`SET name = EXCLUDED.name`).
</details>

### Question 2: COPY vs INSERT

Which is faster for loading 1 million rows?
A) `INSERT` in a loop.
B) `COPY FROM`.
C) `UPDATE`.
D) `SELECT`.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Designed for speed.
</details>

### Question 3: Modifying CTE

Can a CTE modify data (`DELETE`) and return the data to the outer query?
A) No, CTEs are Read-Only.
B) Yes, using the `RETURNING` clause.
C) Only in SQL Server.
D) It deletes the CTE.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Powerful feature of Postgres used for atomic workflows.
</details>

### Question 4: Savepoint

If I `ROLLBACK TO savepoint`, does the transaction end?
A) Yes, it commits.
B) No, the transaction is still active (Open). You must eventually `COMMIT` or `ROLLBACK` fully.
C) It crashes.
D) It saves the file.

<details>
<summary>Click for Answer</summary>

**Answer: B**
It just rewinds the state to the bookmark.
</details>

### Question 5: Indexing

Why drop indexes before bulk load?
A) To delete the data.
B) To avoid the overhead of updating the index tree for every single inserted row.
C) To save space.
D) It's required.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Batch processing optimization.
</details>

---

## Summary

Today you learned:

* ✅ **Upserts**: Idempotent writes.
* ✅ **Bulk Load**: Speed is about batching.
* ✅ **Modifying CTEs**: Atomic moves.
* ✅ **Savepoints**: Error handling within SQL.

**Tomorrow**: We query faster with **Data Query Language (DQL)**.
