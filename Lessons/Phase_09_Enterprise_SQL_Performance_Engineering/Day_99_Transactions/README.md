---
day: 99
title: "Distributed Transactions & Concurrency"
phase: 9
phaseTitle: "Enterprise SQL Performance Engineering"
slug: "distributed-transactions"
duration: 120
difficulty: "advanced"
tags:
  - 2pc
  - distributed-systems
  - cap-theorem
  - sagas
concepts:
  - "Two-Phase Commit (2PC / XA)"
  - "CAP Theorem (Consistency vs Availability)"
  - "Sagas Pattern (Compensating Transactions)"
  - "Distributed Deadlocks"
prerequisites:
  - "ACID Basics (Day 91)"
outcomes:
  - "Simulate a Two-Phase Commit Manually"
  - "Identify Split-Brain scenarios"
  - "Design a Saga for a Microservices Order System"
---

# 🎯 Day 99: Distributed Transactions & Concurrency

> *"Everything fails. In distributed systems, failure is the default state." — Werner Vogels*

---

## The "Never-Coded" Bridge

**The Wedding Vows (Two-Phase Commit)**

1.  **Phase 1 (Prepare)**:
    *   Priest (Coordinator): "Do you, Alice, take Bob?" (Prepare to Commit).
    *   Alice (Participant A): "I do." (Vote: Yes. Lock resources).
    *   Priest: "Do you, Bob, take Alice?"
    *   Bob (Participant B): "I do." (Vote: Yes. Lock resources).
2.  **Phase 2 (Commit)**:
    *   Priest: "I now pronounce you..." (Global Commit).
    *   *Result*: Both are married.

**Failure Scenario**:
*   Priest asks Alice. Alice says "I do".
*   Priest asks Bob. Bob says "Wait, I left the ring (transaction data) at home!" (Vote: No).
*   Priest: "Stop everything! Rollback!" (Global Abort). Alice is *not* married.

---

## The Technical Deep Dive

### 1. Two-Phase Commit (2PC)

Ensures ACID across *two different databases*.
*   **The Problem**: Order is created in DB1. Payment is processed in DB2.
*   **The Command**: `PREPARE TRANSACTION 'tx_id'`.
    *   Writes all changes to WAL (Disk).
    *   Holds locks.
    *   Does *not* make it visible to readers.
*   **The Finish**: `COMMIT PREPARED 'tx_id'` or `ROLLBACK PREPARED 'tx_id'`.
*   **The Risk**: If the Coordinator crashes *after* Prepare but *before* Commit, the locks are held **forever** ("In-Doubt Transaction").

### 2. CAP Theorem

You can only have 2 of 3:
*   **Consistency**: Everyone sees the same data at the same time.
*   **Availability**: The system keeps working even if a node crashes.
*   **Partition Tolerance**: The system works even if the network cable is cut.
*   **RDBMS (Postgres/MySQL)**: Choose **CP** (Consistency + Partition Tolerance). If the network breaks, they stop accepting writes to prevent data divergence.

### 3. Sagas Pattern (Modern Alternative)

2PC is slow (holds locks). Microservices use Sagas.
*   **Step 1**: Create Order (Pending). (Commit Local Tx).
*   **Step 2**: Charge Payment. (Commit Local Tx).
*   **Failure**: Payment Fails.
*   **Compensation**: Run a "Undo" transaction. `UPDATE orders SET status = 'Failed'`.
*   *Trade-off*: Eventual Consistency. (User sees "Order Pending" -> "Order Failed").

---

## Senior-Level Insights

### The "Split Brain" Nightmare

*   **Scenario**: Master DB is in NY. Replica is in London. Network Cut.
*   **NY**: "I'm the Master. Acceptance write."
*   **London**: "I can't see NY. I promote myself to Master. Acceptance write."
*   **Result**: Two Masters. Divergent data.
*   **Fix**: "Quorum". You need 3 nodes. If you can't see 2 nodes, you shut down (Prioritize Consistency).

### Why 2PC is dying

*   **Latency**: Phase 1 requires round-trip to all nodes. Phase 2 requires round-trip.
*   **Locking**: If Node A is slow, Node B waits. The whole system is as slow as the slowest node.
*   **Modern Web**: Prefers Sagas or Eventual Consistency (Kafka).

---

## Hands-on Lab

### Exercise 1: Manual 2PC
**Goal**: Observe the "Prepared" state.

1.  **Session 1**: `BEGIN; INSERT INTO accounts VALUES (1, 100);`
2.  `PREPARE TRANSACTION 'my_tx';` (Disconnect session).
3.  **Session 2**: `SELECT * FROM accounts;` (Row is invisible).
4.  **Session 2**: `SELECT * FROM pg_prepared_xacts;` (See the zombie transaction).
5.  **Session 2**: `COMMIT PREPARED 'my_tx';` (Row appears).

### Exercise 2: The Distributed Deadlock
**Goal**: Design failure.

*   Tx1: Lock A on DB1. Wait for B on DB2.
*   Tx2: Lock B on DB2. Wait for A on DB1.
*   *Result*: Both DBs wait forever. Neither knows about the other.
*   *Fix*: Timeouts (`statement_timeout`).

### Exercise 3: Saga Design (Paper)
**Goal**: Draw the flow.

*   **Service**: Travel Booking.
*   **Steps**: Flight, Hotel, Car.
*   **Scenario**: Flight OK. Hotel OK. Car Fails.
*   **Compensation**:
    1.  Cancel Car (No-op).
    2.  Cancel Hotel (Refund).
    3.  Cancel Flight (Refund).
    4.  Update Status: "Booking Failed".

---

## Mastery Check

### Question 1: 2PC
What happens to a "Prepared" transaction if the database restarts?
A) It is lost.
B) It persists in the WAL and waits for a Commit/Rollback command.
C) It auto-commits.
D) It converts to JSON.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Durability applies to Prepared transactions too.
</details>

### Question 2: CAP Theorem
Why can't you have Consistency and Availability during a Network Partition?
A) Physics. If you want to be available (Accept writes) on both sides of the cut, you *must* diverge (Inconsistent).
B) Bad coding.
C) You can if you use Blockchain.
D) Databases are lazy.

<details>
<summary>Click for Answer</summary>

**Answer: A**
Basic implementation of distributed systems.
</details>

### Question 3: Sagas
What is a Compensating Transaction?
A) A transaction that pays you money.
B) Logic that programmatically undoes a previous committed transaction (e.g., Refund).
C) A backup.
D) A retry.

<details>
<summary>Click for Answer</summary>

**Answer: B**
The core mechanism of Sagas.
</details>

### Question 4: Quorum
If I have 5 nodes, how many must be online to accept a write in a Quorum system?
A) 1.
B) 3 (Majority).
C) 5.
D) 0.

<details>
<summary>Click for Answer</summary>

**Answer: B**
(N/2) + 1. Prevents Split Brain.
</details>

### Question 5: In-Doubt
What is the danger of an In-Doubt Transaction (Prepared but not Committed)?
A) It consumes excessive CPU.
B) It holds locks on rows indefinitely, blocking all other users.
C) It deletes data.
D) It prints errors.

<details>
<summary>Click for Answer</summary>

**Answer: B**
This is why 2PC is dangerous.
</details>

---

## Summary

Today you learned:
*   ✅ **2PC**: The strict way to coordinate multiple DBs.
*   ✅ **CAP Theorem**: The trade-offs of distributed systems.
*   ✅ **In-Doubt**: The zombie state of 2PC.
*   ✅ **Sagas**: The messy but scalable alternative.

**Tomorrow**: We automate logic implementation with **Advanced Stored Procedures**.
