---
day: 96
title: "Relational Database Internals"
phase: 8
phaseTitle: "SQL Mastery & Database Architecture"
slug: "rdbms-internals"
duration: 120
difficulty: "advanced"
tags:
  - acid
  - mvcc
  - wal
  - locking
concepts:
  - "ACID Compliance (Deep Dive)"
  - "MVCC (Multi-Version Concurrency Control)"
  - "Write-Ahead Logging (WAL)"
  - "Deadlocks and Transaction Isolation"
prerequisites:
  - "Understanding of Transactions (Begin/Commit)"
outcomes:
  - "Explain why Postgres doesn't lock readers"
  - "Recover data from a WAL file"
  - "Debug a Deadlock in production"
---

# 🎯 Day 91: Relational Database Internals

> *"The Database is the only component in your stack that cannot be stateless. Respect the physics of disk I/O."*

---

## The "Never-Coded" Bridge

**The Bank Vault (ACID)**

1. **Atomicity**: You transfer $100 to Mom.
    * *Scenario*: Only $50 leaves your account before the power dies.
    * *Result*: The vault locks down. The $50 is put back. **All or Nothing**.
2. **Consistency**: You cannot transfer money you don't have. (Constraint: Balance >= 0).
3. **Isolation**: While you are transferring, the ATM can't check your balance and see "Half-Transferred" money.
4. **Durability**: Once the receipt prints, even if the bank burns down, your money is safe (on a hard drive in a bunker).

**MVCC (The Snapshot)**:

* Imagine the bank takes a **Photo** of the vault when you walk in.
* You act on the Photo.
* Even if someone else changes the vault *while* you are there, your photo doesn't change.
* *Result*: **Readers (You) don't block Writers (Them).**

---

## The Technical Deep Dive

### 1. MVCC (Multi-Version Concurrency Control)

How Postgres handles concurrency.

* **Old Way (Locking)**: If I am reading the table, YOU cannot write to it. (Slow).
* **MVCC Way**:
  * Row 1 (Version 1): `User: Bob, Active: True` (Created at 10:00).
  * Update: I set `Active: False`.
  * Row 1 (Version 2): `User: Bob, Active: False` (Created at 10:01).
  * **The Trick**: Both versions exist on disk!
  * Transaction A (Started 09:59) sees V1.
  * Transaction B (Started 10:02) sees V2.

### 2. The WAL (Write-Ahead Log)

The "Journal" of the database.

* **Rule**: Before writing to the Table (Data File), write to the Log (WAL).
* **Why?**: Appending to a Log is fast (Sequential I/O). Writing to a Table is slow (Random I/O).
* **Crash Recovery**:
  * Power Fail.
  * On Reboot: DB reads the WAL. "Oh, I see I promised to update Row 5 but didn't finish. I'll finish it now."

### 3. Isolation Levels

* **Read Uncommitted**: Dirty Reads. (Fast, Dangerous).
* **Read Committed** (Default): You only see committed data.
* **Repeatable Read**: If you read Row A twice, it's guaranteed to be the same (even if someone updated it in between).
* **Serializable**: Strict Execution. Slowest.

---

## Senior-Level Insights

### The "VACUUM" Problem

* **MVCC Side Effect**: Old versions (Dead Tuples) pile up.
* **VACUUM**: The Garbage Collector. It deletes old versions.
* **Bloat**: If VACUUM doesn't run fast enough, your 1GB table becomes 10GB of dead rows. Queries slow down.
* **Senior Action**: Tuned Autovacuum settings on high-churn tables.

### Deadlocks

* **Scenario**:
  * Tx1: Locks Table A, wants Table B.
  * Tx2: Locks Table B, wants Table A.
  * **Result**: Standoff.
* **The DB**: Detects this after 1s. Kills one transaction (Rollback).
* **Fix**: Always lock tables in the **same order** (A then B) in all code paths.

---

## Hands-on Lab

### Exercise 1: Observing MVCC

**Goal**: See "Dirty Reads" (or lack thereof).

1. **Session 1**: `BEGIN; UPDATE users SET age = 99 WHERE id = 1;` (Do NOT commit).
2. **Session 2**: `SELECT * FROM users WHERE id = 1;`
3. **Result**: Session 2 sees the *Old Age*, not 99. Session 1 holds the lock on the *New Version*.
4. **Session 1**: `COMMIT;`
5. **Session 2**: Now sees 99.

### Exercise 2: Defining a Deadlock

**Goal**: Cause an error.

1. **Session 1**: `BEGIN; UPDATE accounts SET balance = 0 WHERE id = 1;`
2. **Session 2**: `BEGIN; UPDATE accounts SET balance = 0 WHERE id = 2;`
3. **Session 1**: `UPDATE accounts SET balance = 0 WHERE id = 2;` (Blocks... waiting for Session 2).
4. **Session 2**: `UPDATE accounts SET balance = 0 WHERE id = 1;` (Deadlock!).
    * *Error*: `deadlock detected`.

### Exercise 3: WAL Analysis (Conceptual)

**Goal**: Why is `fsync` important?

* Postgres calls `fsync()` to force the OS to flush Log to Disk.
* Some people disable `fsync` to get 2x speed.
* **Risk**: If power fails, the WAL is in RAM (lost). Data Corruption. **Never do this in prod.**

---

### Non-Functional Constraints (Apply to All Exercises)

* **Performance / Scale**: Document a target query runtime of **p95 < 2s** for your final solution, validate behavior at **25 concurrent analytical users/sessions**, and keep compute spend below **$2** per production-equivalent run.
* **Data Governance / Security**: Define acceptance criteria for least-privilege access, PII handling (masking/tokenization where applicable), audit logging of query access, and retention/deletion alignment with policy.
* **Business KPI Impact**: Explicitly state which business KPI(s) improve based on your schema/query decisions and quantify expected directional impact.
  * KPI focus for this day: *Transaction and locking strategies should protect checkout/order reliability KPIs (success rate, timeout rate, and retry volume).*

## Mastery Check

### Question 1: MVCC

What is the main benefit of MVCC over locking?
A) Readers don't block Writers.
B) It uses less disk space.
C) It is simpler.
D) It converts SQL to C++.

<details>
<summary>Click for Answer</summary>

**Answer: A**
High concurrency.
</details>

### Question 2: WAL

Why write to the log before the data file?
A) Because logs look cool.
B) To ensure Durability (D in ACID) in case of a crash.
C) To slow down the database.
D) To use more disk space.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Write-Ahead Logging is the standard durability mechanism.
</details>

### Question 3: Isolation

Which Isolation Level is the strictest?
A) Read Committed.
B) Serializable.
C) Repeatable Read.
D) Chaotic.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Serializable mimics execution one-by-one.
</details>

### Question 4: VACUUM

What happens if you never VACUUM a Postgres database?
A) It runs perfectly forever.
B) It "bloats" with dead rows, performance degrades, and eventually it runs out of Transaction IDs (Wraparound failure).
C) It deletes itself.
D) It migrates to Mongo.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Wraparound failure is catastrophic (Database goes Read-Only).
</details>

### Question 5: Atomicity

If a transaction has 10 statements, and the 10th one fails...
A) The first 9 remain saved.
B) The entire transaction rolls back (First 9 are undone).
C) The DB crashes.
D) The DBA strikes the user.

<details>
<summary>Click for Answer</summary>

**Answer: B**
All or Nothing.
</details>

---

## Summary

Today you learned:

* ✅ **ACID**: The contract the DB makes with you.
* ✅ **MVCC**: How high-concurrency is achieved (Readers don't block Writers).
* ✅ **WAL**: The durability guarantee.
* ✅ **Deadlocks**: How locks interact in complex transactions.

**Tomorrow**: We define structures in **Data Definition Language (DDL)**.
