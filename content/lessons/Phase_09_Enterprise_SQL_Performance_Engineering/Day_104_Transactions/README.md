---
day: 104
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

1. **Phase 1 (Prepare)**:
    * Priest (Coordinator): "Do you, Alice, take Bob?" (Prepare to Commit).
    * Alice (Participant A): "I do." (Vote: Yes. Lock resources).
    * Priest: "Do you, Bob, take Alice?"
    * Bob (Participant B): "I do." (Vote: Yes. Lock resources).
2. **Phase 2 (Commit)**:
    * Priest: "I now pronounce you..." (Global Commit).
    * *Result*: Both are married.

**Failure Scenario**:

* Priest asks Alice. Alice says "I do".
* Priest asks Bob. Bob says "Wait, I left the ring (transaction data) at home!" (Vote: No).
* Priest: "Stop everything! Rollback!" (Global Abort). Alice is *not* married.

---

## The Technical Deep Dive

### 1. Two-Phase Commit (2PC)

Ensures ACID (see Day 91 for the ACID overview) across *two different databases*. The industry name for this pattern across heterogeneous database vendors is **XA** (eXtended Architecture) — the X/Open/ISO standard that defines how a transaction coordinator talks to multiple participant databases using the same Prepare/Commit protocol described below. When a job posting lists "XA transactions" as a skill, this is what they mean.

* **The Problem**: Order is created in DB1. Payment is processed in DB2.
* **The Command**: `PREPARE TRANSACTION 'tx_id'`.
  * Writes all changes to the **WAL** (Write-Ahead Log — Postgres's sequential, append-only journal of every change, written to disk *before* the change is applied to the actual table; see Day 113 for how WAL underpins MVCC and crash recovery).
  * Holds locks.
  * Does *not* make it visible to readers.
* **The Finish**: `COMMIT PREPARED 'tx_id'` or `ROLLBACK PREPARED 'tx_id'`.
* **The Risk**: If the Coordinator crashes *after* Prepare but *before* Commit, the locks are held **forever** ("In-Doubt Transaction").

> ⚠️ Pitfall: In-Doubt Transaction Lock Starvation
>
> **Failure mode**: A `PREPARE TRANSACTION` succeeds and the row locks are held, but the Coordinator (the service that was supposed to send the final `COMMIT PREPARED` or `ROLLBACK PREPARED`) crashes, reboots, or simply forgets about the transaction. The locks are *not* released — Postgres has no timeout for prepared transactions by default — so they sit there indefinitely, blocking every other session that needs those same rows.
> **Detection**: `SELECT * FROM pg_prepared_xacts;` — any row with a `prepared` timestamp older than a few minutes (let alone hours) is almost certainly abandoned. Cross-check against your application's transaction log to see if the originating coordinator process is still alive.
> **Fix**: `ROLLBACK PREPARED 'tx_id';` (or `COMMIT PREPARED 'tx_id';` if you can confirm from the coordinator's logs that the transaction *should* have succeeded). In production, alert on any `pg_prepared_xacts` entry older than a defined SLA (e.g., 5 minutes) so an in-doubt transaction triggers a page instead of silently starving locks for hours.

### 2. CAP Theorem

You can only have 2 of 3:

* **Consistency**: Everyone sees the same data at the same time.
* **Availability**: The system keeps working even if a node crashes.
* **Partition Tolerance**: The system works even if the network cable is cut.
* **RDBMS (Postgres/MySQL)**: Choose **CP** (Consistency + Partition Tolerance). If the network breaks, they stop accepting writes to prevent data divergence.

### 3. Sagas Pattern (Modern Alternative)

2PC is slow (holds locks). Microservices use Sagas.

* **Step 1**: Create Order (Pending). (Commit Local Tx).
* **Step 2**: Charge Payment. (Commit Local Tx).
* **Failure**: Payment Fails.
* **Compensation**: Run a "Undo" transaction. `UPDATE orders SET status = 'Failed'`.
* *Trade-off*: Eventual Consistency. (User sees "Order Pending" -> "Order Failed").

### 4. MVCC Isolation Levels (Single-Database Concurrency)

Before reaching for distributed patterns like 2PC or Sagas, most "concurrency" problems in practice are solved *within a single Postgres database* using **MVCC** (Multi-Version Concurrency Control) isolation levels. Postgres supports three (a fourth, READ UNCOMMITTED, is accepted as syntax but behaves identically to READ COMMITTED):

| Isolation Level | Default? | Prevents | Still Allows | Anomaly Example |
|---|---|---|---|---|
| **READ COMMITTED** | Yes (Postgres default) | Dirty reads (seeing uncommitted data from other transactions) | Non-repeatable reads, phantom reads | Tx1 reads `balance = 100`. Tx2 commits a deposit, `balance = 150`. Tx1 re-reads in the *same* transaction and now sees `150` — the value changed mid-transaction (non-repeatable read). |
| **REPEATABLE READ** | No | Dirty reads, non-repeatable reads | Phantom reads (in most DBs; Postgres's implementation also blocks phantoms in practice via snapshot isolation) | Tx1 runs `SELECT count(*) FROM orders WHERE status = 'pending'` twice in the same transaction. In a naive implementation, Tx2 could insert a new pending order between the two reads, changing the count (a "phantom" row appearing). Postgres's snapshot-based REPEATABLE READ prevents this by freezing the snapshot at transaction start. |
| **SERIALIZABLE** | No | Dirty reads, non-repeatable reads, phantom reads, and write skew | Nothing — full isolation, transactions behave as if run one-at-a-time | Two transactions each check "is there already a doctor on call?" and, seeing none, both insert themselves as on-call — a classic write-skew anomaly that REPEATABLE READ alone does not catch, but SERIALIZABLE detects and aborts one transaction with a serialization failure. |

**Practical rule of thumb**: stay on READ COMMITTED (the default) unless you have a specific anomaly you're defending against. REPEATABLE READ is common for financial reporting transactions that need a consistent snapshot across multiple queries. SERIALIZABLE is reserved for genuinely conflict-sensitive logic (e.g., the on-call scheduling example) because it carries the highest abort-and-retry overhead.

### 5. `SELECT FOR UPDATE` and `SKIP LOCKED`

The other everyday concurrency tool — far more common in business systems than 2PC — is **row-level locking** inside a single transaction:

* **`SELECT ... FOR UPDATE`**: locks the selected rows so no other transaction can update or delete them until your transaction commits or rolls back. Classic use case: inventory deduction — `BEGIN; SELECT quantity FROM inventory WHERE sku = 'WIDGET-1' FOR UPDATE; -- check quantity > 0 in application code UPDATE inventory SET quantity = quantity - 1 WHERE sku = 'WIDGET-1'; COMMIT;` — without `FOR UPDATE`, two concurrent checkouts could both read `quantity = 1`, both decrement, and oversell the last unit.
* **`SELECT ... FOR UPDATE SKIP LOCKED`**: same locking behavior, but instead of *waiting* for a locked row to free up, it silently skips any row that's already locked by another transaction. This is the standard pattern for **job queues**: multiple workers run `SELECT id FROM jobs WHERE status = 'pending' ORDER BY created_at LIMIT 1 FOR UPDATE SKIP LOCKED;` and each worker grabs a *different* job instead of piling up waiting for the same row.

---

## Decision Table: Choosing a Consistency Pattern

| Pattern | Consistency Level | Latency Overhead | Best For |
|---|---|---|---|
| **2PC (XA)** | Strong (atomic across DBs) | High — two network round-trips, locks held throughout | Cross-database financial transfers where partial completion is unacceptable (e.g., core banking ledger moves) |
| **Sagas** | Eventual (per-step committed) | Low per-step, but end-to-end completion can take seconds-minutes | Microservices workflows (order -> payment -> shipping) where each step can be independently retried/compensated |
| **Eventual Consistency (Kafka/event streams)** | Eventual (no global lock at all) | Very low — producers don't wait for consumers | High-throughput event pipelines (analytics, notifications, audit logs) where slight delay is acceptable |
| **SERIALIZABLE isolation** | Strong (single database only) | Moderate-High — risk of serialization failures requiring retry | Single-database logic with subtle write-skew risk (on-call scheduling, seat reservation, double-booking prevention) |

---

## Senior-Level Insights

### The "Split Brain" Nightmare

* **Scenario**: Master DB is in NY. Replica is in London. Network Cut.
* **NY**: "I'm the Master. Acceptance write."
* **London**: "I can't see NY. I promote myself to Master. Acceptance write."
* **Result**: Two Masters. Divergent data.
* **Fix**: "Quorum". You need 3 nodes. If you can't see 2 nodes, you shut down (Prioritize Consistency).

### Why 2PC is dying

* **Latency**: Phase 1 requires round-trip to all nodes. Phase 2 requires round-trip.
* **Locking**: If Node A is slow, Node B waits. The whole system is as slow as the slowest node.
* **Modern Web**: Prefers Sagas or Eventual Consistency (Kafka).

---

## Hands-on Lab

### Exercise 1: Manual 2PC

**Goal**: Observe the "Prepared" (In-Doubt) state and resolve it.

**Setup** (run once):

```sql
CREATE TABLE accounts (id int PRIMARY KEY, balance int);
INSERT INTO accounts VALUES (1, 100);

-- Required: PREPARE TRANSACTION needs this setting (default is usually already > 0)
-- max_prepared_transactions must be > 0 in postgresql.conf (restart required if changed)
```

**Session 1**:

```sql
BEGIN;
INSERT INTO accounts VALUES (2, 50);
PREPARE TRANSACTION 'my_tx';
-- Session 1 can now disconnect; the transaction survives independently of the session.
```

**Session 2** (a separate `psql` connection):

```sql
-- The new row is NOT visible yet — it's prepared, not committed
SELECT * FROM accounts;

-- Inspect the in-doubt transaction
SELECT * FROM pg_prepared_xacts;
```

**Expected result** (`pg_prepared_xacts`):

```
 transaction |   gid   |            prepared             |  owner   | database
-------------+---------+----------------------------------+----------+----------
        4821 | my_tx   | 2026-06-20 09:14:02.881223+00   | postgres | postgres
```

**Session 2 (resolve it)**:

```sql
COMMIT PREPARED 'my_tx';
SELECT * FROM accounts;  -- id=2, balance=50 now appears
```

### Exercise 2: The Distributed Deadlock (Runnable Lock Timeout)

**Goal**: Reproduce a lock wait and resolve it with a timeout, simulating the cross-database deadlock pattern on a single table.

**Setup** (run once, reuse the `accounts` table from Exercise 1):

```sql
-- Make sure row id=1 exists
SELECT * FROM accounts WHERE id = 1;
```

**Session 1**:

```sql
BEGIN;
SELECT * FROM accounts WHERE id = 1 FOR UPDATE;
-- Row 1 is now locked. Do NOT commit yet — leave this transaction open.
```

**Session 2** (a separate `psql` connection, simulating "Tx2 waiting for A"):

```sql
SET lock_timeout = '2s';
BEGIN;
SELECT * FROM accounts WHERE id = 1 FOR UPDATE;
```

**Expected result** (Session 2, after ~2 seconds):

```
ERROR:  canceling statement due to lock timeout
```

This is the single-database analog of the cross-DB deadlock described above: Tx1 holds a lock, Tx2 waits for it. In a true distributed deadlock (Tx1 waiting on DB2 while Tx2 waits on DB1), neither database's local deadlock detector can see the other side of the cycle — each one only sees "a transaction is waiting," not "this is a cycle." `lock_timeout` (or `statement_timeout`) is the practical fix: it doesn't *detect* the deadlock, but it guarantees no transaction waits forever, breaking the cycle after a bounded time.

### Exercise 3: Saga Design (Paper)

**Goal**: Draw the flow.

* **Service**: Travel Booking.
* **Steps**: Flight, Hotel, Car.
* **Scenario**: Flight OK. Hotel OK. Car Fails.
* **Compensation**:
    1. Cancel Car (No-op).
    2. Cancel Hotel (Refund).
    3. Cancel Flight (Refund).
    4. Update Status: "Booking Failed".

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
A prepared transaction is written to the WAL (Write-Ahead Log) during `PREPARE TRANSACTION`, exactly like a normal commit's changes are — so it is fully durable against a crash or restart. When Postgres restarts, it replays the WAL, recognizes the transaction is in the "prepared but not finished" state, and keeps it in `pg_prepared_xacts` waiting for an explicit `COMMIT PREPARED` or `ROLLBACK PREPARED`. This durability is exactly what makes In-Doubt transactions dangerous in practice — the database won't quietly discard them on restart, so a forgotten prepared transaction can hold locks across a server reboot.
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
A network partition means the two sides of a system literally cannot talk to each other. If you insist on remaining "Available" (still accepting writes) on *both* sides of the cut, each side must accept writes independently — and since they can't synchronize, they will inevitably accept different, conflicting writes, becoming inconsistent with each other. The only way to keep them consistent during the cut is for at least one side to refuse writes (sacrifice Availability) until the partition heals. This isn't a coding limitation — it's a logical consequence of partition tolerance plus the laws of physics (you cannot communicate faster than the network allows), which is why CAP is called a *theorem*, not a guideline.
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
A Compensating Transaction is application logic written in advance specifically to *semantically reverse* a previously committed step, because Sagas have no global rollback — each step already committed independently and is visible to other systems. For a payment, the compensation isn't "delete the charge record" (the charge already happened and may already be reflected in a bank statement); it's "issue a refund," which is a *new*, separate transaction that achieves the equivalent of undoing the business effect. This is fundamentally different from a database `ROLLBACK`, which only works *before* commit — Sagas accept that each step is permanently committed and instead chain forward-only compensating actions when a later step fails.
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
Quorum requires `floor(N/2) + 1` nodes to agree before a write is accepted — for N=5, that's `floor(5/2) + 1 = 3`. The reason this prevents Split Brain is arithmetic: with 5 total nodes, it is mathematically impossible for *two different* groups of 3-or-more nodes to exist simultaneously without overlapping (3 + 3 = 6 > 5), so at most one side of any network partition can ever reach a quorum and accept writes. The minority side (at most 2 nodes here) correctly refuses to accept writes, sacrificing its own availability to guarantee the cluster never diverges into two conflicting "masters."
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
Once `PREPARE TRANSACTION` runs, Postgres has already taken row/table locks on behalf of that transaction and written the change to WAL — but it is deliberately withholding visibility until a final `COMMIT PREPARED` or `ROLLBACK PREPARED` arrives. If the coordinator that was supposed to send that final command crashes, restarts with amnesia, or simply has a bug that forgets the transaction ID, those locks are held with no natural expiration. Every other session that needs to read or write the same rows queues up behind the phantom transaction — in the worst case (a busy table), this can stall an entire application within minutes, which is exactly why production systems must alert on any `pg_prepared_xacts` entry older than a few minutes rather than discovering it only when the support tickets arrive.
</details>

---

## Glossary

| Term | Definition |
|---|---|
| **Two-Phase Commit (2PC)** | A protocol ensuring all participants in a distributed transaction either commit together or abort together, using a Prepare phase (vote) followed by a Commit/Abort phase (execute). |
| **XA** | The X/Open/ISO standard name for the 2PC protocol across heterogeneous database vendors; what Postgres implements via `PREPARE TRANSACTION` / `COMMIT PREPARED`. |
| **Coordinator** | The process/service that orchestrates a 2PC transaction — sends Prepare requests to all participants, collects votes, and issues the final global Commit or Abort. |
| **Participant** | A single database/resource manager taking part in a 2PC transaction; votes Yes/No during Prepare and executes the Coordinator's final decision. |
| **In-Doubt Transaction** | A prepared transaction whose Coordinator has crashed or disappeared before sending the final Commit/Rollback — its locks remain held indefinitely until manually resolved. |
| **CAP Theorem** | States a distributed system can guarantee at most two of: Consistency, Availability, Partition Tolerance — during an actual network partition, you must choose C or A. |
| **Saga** | A sequence of local transactions across services, each committed independently, with a predefined compensating transaction to "undo" the business effect if a later step fails. |
| **Compensating Transaction** | A new, forward-only transaction that semantically reverses the business effect of an already-committed step (e.g., a refund reversing a charge), since true rollback is unavailable post-commit. |
| **WAL (Write-Ahead Log)** | Postgres's sequential, append-only disk journal recording every change before it's applied to the actual table data — the foundation of crash recovery, replication, and prepared-transaction durability. |
| **Quorum** | The minimum number of nodes (`floor(N/2) + 1`) that must agree before a distributed write is accepted, mathematically preventing two disjoint node groups from both reaching quorum simultaneously. |
| **Split Brain** | The failure state where a network partition causes two or more nodes to each believe they are the sole authoritative leader/master, accepting independent and conflicting writes. |

---

## Summary

Today you learned:

* ✅ **2PC**: The strict way to coordinate multiple DBs.
* ✅ **CAP Theorem**: The trade-offs of distributed systems.
* ✅ **In-Doubt**: The zombie state of 2PC.
* ✅ **Sagas**: The messy but scalable alternative.

**Tomorrow**: We automate logic implementation with **Advanced Stored Procedures**.

---

## 🚨 Escalating Incident Drill Track (Days 97–108)

### Day 104 Spotlight Drill: 47 Stuck In-Doubt Transactions After a Coordinator Reboot

**Scenario**: Monitoring fires at 6 AM: `pg_prepared_xacts` shows 47 entries, the oldest timestamped 6 hours ago. Overnight, the payment-processing coordinator node rebooted mid-batch during the nightly settlement job, and it appears every in-flight 2PC transaction from that batch was abandoned mid-Prepare. Customer support is reporting "payment stuck processing" tickets, and several unrelated tables are now experiencing slow queries due to lock contention.

**Required outputs**:

1. **Root-cause analysis using query plans and schema objects**
   * Run `SELECT gid, prepared, owner, database FROM pg_prepared_xacts ORDER BY prepared;` to enumerate all 47 in-doubt transactions and confirm they all originate from the same batch window (same `gid` naming convention/timestamp range as the settlement job).
   * Cross-reference each `gid` against the coordinator's own transaction log (if the coordinator persists transaction IDs before sending Prepare) to determine, for each one, whether the coordinator had already decided to commit or abort *before* it crashed.
   * Use `pg_locks` joined to `pg_prepared_xacts` to identify exactly which tables/rows are blocked, and confirm that the "unrelated tables" slowness is downstream lock-queue contention caused by these 47 zombie transactions, not a separate issue.
2. **Mitigation patch strategy and rollback criteria**
   * For any transaction the coordinator's log confirms should have committed, run `COMMIT PREPARED 'gid';`; for any it confirms should have aborted (or for any where intent is unrecoverable and the safer default is "rollback"), run `ROLLBACK PREPARED 'gid';`.
   * Define a rollback criterion: if resolving a given `gid` would create a financial inconsistency (e.g., double-charging a customer), escalate to manual reconciliation instead of blindly committing — accuracy outranks speed for payment data.
   * Add `max_prepared_transactions` monitoring and a hard SLA alert (e.g., page on-call if any `pg_prepared_xacts` row exceeds 5 minutes old) so this class of incident triggers in minutes, not 6 hours.
3. **Post-incident report**
   * Summarize business impact (number of customer payments delayed, dollar value held in limbo, support ticket volume, and any SLA/contractual breach from the multi-hour delay).
   * Document prevention controls (coordinator restart procedure that explicitly resolves any open prepared transactions before accepting new batch work; consider replacing this 2PC batch step with a Saga + compensating-refund pattern to eliminate the in-doubt failure mode entirely).
   * Add monitoring updates (a dedicated `pg_prepared_xacts` age dashboard panel, plus an automated nightly check that fails the deploy/batch pipeline if any prepared transaction from the previous run is still open).

Use the three drills below as a connected simulation sequence spanning the rest of the phase. Each drill is intentionally harder than the previous one and must be completed with production-style evidence.

### Drill 1 (Severity 2): Performance degradation under peak load

**Scenario**: During peak checkout traffic, API latency jumps from 120ms to 2.8s, and dashboards show CPU saturation on the primary database.

**Required outputs**:

1. **Root-cause analysis using query plans and schema objects**
   * Capture `EXPLAIN (ANALYZE, BUFFERS)` for the top 3 slow statements from `pg_stat_statements`.
   * Identify the dominant bottleneck (e.g., sequential scans, stale stats, sort spill, lock waits).
   * Map the issue to schema objects (specific index, table, materialized view, partition, or join path).
2. **Mitigation patch strategy and rollback criteria**
   * Propose a low-risk patch (index change, query rewrite, refresh strategy, stats maintenance, or connection throttling).
   * Define rollout steps, canary checks, and explicit rollback triggers (p95 latency, error rate, lock queue depth, CPU threshold).
3. **Post-incident report**
   * Summarize business impact (checkout conversion, order delay, SLA breach duration).
   * Document prevention controls (capacity threshold alerting, index review checklist, load-test gate before release).
   * Add monitoring updates (query-plan drift alert, wait-event dashboard, incident runbook links).

### Drill 2 (Severity 1): Security policy breach involving row-level access

**Scenario**: A regional sales manager can query customer rows from another region due to a row-level security policy regression.

**Required outputs**:

1. **Root-cause analysis using query plans and schema objects**
   * Reproduce the leak using a least-privilege role and capture relevant SQL.
   * Inspect policy definitions (`pg_policies`), grants, security-definer functions, and view ownership chains.
   * Use query plans to show where policy filters are bypassed or pushed incorrectly.
2. **Mitigation patch strategy and rollback criteria**
   * Provide an emergency containment patch (policy fix, revoke path, view hardening, function privilege correction).
   * Define validation tests for allowed vs denied row sets per role.
   * Set rollback criteria tied to false-deny rate, support-ticket spike, and audit-log anomalies.
3. **Post-incident report**
   * Quantify business/compliance impact (records exposed, jurisdictions affected, notification obligations).
   * List prevention controls (policy-as-code review, CI policy simulation, privileged object inventory).
   * Add monitoring updates (cross-tenant access detectors, policy-change alerts, immutable audit retention).

### Drill 3 (Severity 1 / Executive Escalation): Data correctness regression from trigger/procedure change

**Scenario**: A trigger/procedure deployment silently double-counts revenue in month-end reporting and breaks finance reconciliation.

**Required outputs**:

1. **Root-cause analysis using query plans and schema objects**
   * Diff trigger/procedure versions and execution order; trace writes across dependent tables/views.
   * Use plans and dependency metadata (`pg_trigger`, `pg_proc`, `pg_depend`) to locate duplicate or missing mutations.
   * Build a minimal reproducible dataset proving the correctness gap.
2. **Mitigation patch strategy and rollback criteria**
   * Deliver a hotfix plan (procedure correction + backfill/reconciliation script) with idempotency guarantees.
   * Include data repair strategy for already-corrupted records and freeze windows for risky writes.
   * Define rollback criteria based on reconciliation deltas, financial control checks, and downstream report parity.
3. **Post-incident report**
   * Summarize business impact (close-delay, misstated KPI exposure, executive communication timeline).
   * Document prevention controls (change contracts for triggers, shadow writes, dual-run verification, release checklist).
   * Add monitoring updates (data quality assertions, ledger-vs-fact drift alarms, automated reconciliation jobs).
