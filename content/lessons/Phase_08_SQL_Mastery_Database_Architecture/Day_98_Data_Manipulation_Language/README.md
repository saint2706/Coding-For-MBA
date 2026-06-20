---
day: 98
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
  - idempotency
concepts:
  - "The Upsert (INSERT ON CONFLICT)"
  - "Bulk Loading (COPY vs INSERT)"
  - "Modifying CTEs (RETURNING clause)"
  - "Savepoints in Transactions"
  - "Idempotency vs Retry Safety"
prerequisites:
  - "Day 96: Relational Database Internals"
  - "Day 97: Advanced DDL & Schema"
  - "Basic INSERT/UPDATE"
outcomes:
  - "Distinguish a retry-safe upsert from a truly idempotent operation"
  - "Implement an idempotency-key pattern"
  - "Move data atomically between tables"
  - "Recover from partial transaction failure using Savepoints"
  - "Justify a bulk-load strategy with its concurrency and recovery tradeoffs"
---

# 🎯 Day 98: Advanced DML & Upserts

> *"Writing data is easy. Writing data safely, idempotently, and fast is hard."*

---

## Cross-References

This lesson applies the `accounts` and `audit_log` schemas built in **[Day 97 — Advanced DDL & Schema](../Day_97_Data_Definition_Language/README.md)**, and the transaction/locking mechanics explained here rest on the MVCC and WAL internals from **[Day 96 — Relational Database Internals](../Day_96_Relational_Databases/README.md)**. If a savepoint or upsert behavior here seems surprising, the "why" is almost always in Day 96.

---

## The "Never-Coded" Bridge

**The Guest List (Upsert)**

* **Insert**: "Add Bob to the list."
  * *Problem*: What if Bob is already there? (Error: Duplicate).
* **Update**: "Change Bob's status to 'Arrived'."
  * *Problem*: What if Bob isn't there yet? (Error: Not Found).
* **Upsert**: "Look for Bob. If he's there, check him in. If he's not, add him."
  * *Result*: Guaranteed success regardless of starting state.

**Bulk Loading (The Moving Van)**

* **Insert**: Carrying one box at a time into the house. (Slow).
* **COPY**: Backing the truck up and dumping everything at once. (Fast).

---

## Part 1: Idempotency vs. Retry Safety — A Critical Distinction

### The Counter Upsert Is NOT Idempotent — Here's the Corrected Claim

```sql
-- Dialect: PostgreSQL 14+

INSERT INTO page_views (url, hits)
VALUES ('home', 1)
ON CONFLICT (url)
DO UPDATE SET hits = page_views.hits + 1;
```

It is tempting to call this "idempotent" because it never errors no matter how many times you run it — but that is **retry safety**, not idempotency. They are different properties:

- **Retry-safe**: running the operation again does not produce an error or corrupt the schema. The counter upsert above is retry-safe — you can run it 1, 5, or 100 times and it always succeeds.
- **Idempotent**: running the operation N times produces the **same end state** as running it once.

**Trace through the math** to see why the counter upsert fails the idempotency test:

| Run # | `hits` before | `hits` after |
|---|---|---|
| 1 | (row doesn't exist) | 1 |
| 2 | 1 | 2 |
| 3 | 2 | 3 |
| ... | ... | ... |
| 100 | 99 | 100 |

Running it once leaves `hits = 1`. Running it 100 times leaves `hits = 100`. These are **different end states** — by definition, this operation is not idempotent. If your application accidentally double-submits a page-view event (a duplicate HTTP request due to a client retry, for instance), this query will silently double-count, and there is nothing about its "safety" that prevents that.

### The True Idempotency-Key Pattern

To make an operation genuinely idempotent — safe against retries *and* guaranteed to produce the same end state regardless of how many times it runs — key it on a value the **client** supplies once per logical operation, and make the second attempt a no-op rather than a state change:

```sql
-- Dialect: PostgreSQL 14+

CREATE TABLE payment_events (
    request_id   UUID PRIMARY KEY,   -- client-generated idempotency key
    account_id   INT NOT NULL,
    amount       NUMERIC(10,2) NOT NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- The client generates ONE request_id per logical "charge this card" action,
-- and resends the SAME request_id on every retry of that same action.
INSERT INTO payment_events (request_id, account_id, amount)
VALUES ('5a9d8f3e-...', 1, 49.99)
ON CONFLICT (request_id) DO NOTHING;
-- Run once: 1 row inserted, payment recorded.
-- Run 100 times with the SAME request_id: still exactly 1 row in the table.
-- End state is IDENTICAL whether this runs once or 100 times -- this is genuine idempotency.
```

**Why this is different from the counter**: the conflict target is a value that represents "this exact logical operation," not "this resource that should accumulate changes." `DO NOTHING` on conflict means a retry changes nothing — the first successful attempt's result is permanent and retries are pure no-ops. Contrast with the counter upsert's `DO UPDATE SET hits = hits + 1`, where every successful conflict *does* change state.

**Practical rule**: if your `DO UPDATE` clause references the *old* value of a column (`hits + 1`, `balance - amount`), the operation is not idempotent — it's a relative change. If your `DO UPDATE` (or `DO NOTHING`) just re-asserts an *absolute* value that would be identical regardless of how many times you write it, it is idempotent.

---

## Part 2: The Technical Deep Dive

### 1. The Upsert (`INSERT ... ON CONFLICT`)

```sql
INSERT INTO users (id, name, login_count)
VALUES (1, 'Bob', 1)
ON CONFLICT (id)
DO UPDATE SET
    login_count = users.login_count + 1,
    name = EXCLUDED.name;
```

**Conflict target**: `(id)` — the column or constraint that, if violated by the new row, triggers the `DO UPDATE`/`DO NOTHING` clause instead of raising a duplicate-key error. It must match an existing unique index or constraint; you cannot pick an arbitrary column.

**`EXCLUDED`**: a pseudo-table, available only inside `ON CONFLICT`, holding the row values that were *proposed* by the `INSERT` (i.e., what you tried to insert) — as opposed to `users.login_count`, which refers to the row's *existing* value already on disk. `name = EXCLUDED.name` says "overwrite the stored name with whatever new name was proposed"; `login_count = users.login_count + 1` says "take the existing stored value and increment it, ignoring whatever value was proposed in `VALUES`."

### 2. Modifying CTEs (`RETURNING`)

```sql
WITH moved_rows AS (
    DELETE FROM users
    WHERE status = 'archived'
    RETURNING *
)
INSERT INTO users_archive
SELECT * FROM moved_rows;
```

**Line by line**: `WITH moved_rows AS (...)` defines a CTE whose body is not a `SELECT` but a `DELETE ... RETURNING *` — this is a **modifying CTE**: it performs the delete as a side effect and makes the deleted rows available, by name, to the rest of the statement, exactly once. The outer `INSERT INTO users_archive SELECT * FROM moved_rows` then reads those already-deleted rows and inserts them elsewhere. **Atomicity**: both the `DELETE` and the `INSERT` execute as part of the same single SQL statement, which Postgres always wraps in an implicit transaction — if the `INSERT` fails (say, a `CHECK` constraint on `users_archive` rejects a row), the entire statement, including the `DELETE`, rolls back. There is no window where rows are deleted from `users` but not yet present in `users_archive`.

### 3. Bulk Loading (`COPY`)

* **`INSERT INTO table VALUES (1), (2), (3)...`**: Slow. The database parses every value, checks types, checks constraints row-by-row, and (if not batched in one statement) commits a transaction per call.
* **`COPY table FROM 'file.csv'`**: Fast. It streams data directly into the table's storage format in larger batches, amortizing parsing and constraint-checking overhead, and writes WAL more efficiently than many small statements.
* **Speedup**: commonly cited as 10x-100x faster than row-at-a-time `INSERT`, but this range depends heavily on row width, index count, and whether the `INSERT`s were batched (`INSERT ... VALUES (...), (...), (...)` in one statement closes most of the gap with `COPY`). The honest claim is: *row-at-a-time, separately-committed `INSERT` statements* are 10x-100x slower than `COPY`; multi-row batched `INSERT`s narrow that gap substantially — benchmark your specific schema and row count rather than assuming the upper bound.

---

## Part 3: UPDATE, DELETE, and MERGE (Postgres 15+)

### Standard UPDATE / DELETE

```sql
-- Dialect: PostgreSQL 14+
UPDATE accounts SET balance = balance - 50 WHERE account_id = 1 AND balance >= 50;
-- The "AND balance >= 50" guard prevents the balance from going negative even
-- under a race -- if two concurrent withdrawals both pass an application-level
-- check but only one row satisfies this WHERE clause by the time it executes,
-- the second UPDATE affects 0 rows instead of corrupting the balance.

DELETE FROM accounts WHERE account_id = 1 AND balance = 0;
```

### MERGE (PostgreSQL 15+ only — qualify this dialect note explicitly)

`MERGE` is new in Postgres 15 and gives a single statement that can `INSERT`, `UPDATE`, *and* `DELETE` depending on whether a source row matches a target row — useful for multi-outcome syncs that `ON CONFLICT` alone cannot express (e.g., "update existing, insert new, AND delete target rows with no matching source").

```sql
-- Dialect: PostgreSQL 15+ (NOT available in 14 or earlier)

MERGE INTO accounts AS tgt
USING staged_balance_updates AS src
ON tgt.account_id = src.account_id
WHEN MATCHED AND src.amount = 0 THEN
    DELETE
WHEN MATCHED THEN
    UPDATE SET balance = src.amount
WHEN NOT MATCHED THEN
    INSERT (account_id, owner, balance) VALUES (src.account_id, src.owner, src.amount);
```

`ON CONFLICT` only handles the insert-or-update case on a single target table against a single proposed row. `MERGE` handles three-way branching (update / insert / delete) against an arbitrary source set (often a staging table from a bulk load), which is the more general ETL "sync" pattern.

### Locking and Concurrent-Upsert Behavior

`INSERT ... ON CONFLICT` acquires a row-level lock on the conflicting row for the duration of the `DO UPDATE`. Two concurrent upserts targeting the *same* conflict key will serialize — one blocks briefly until the other commits — but they will not both succeed in creating duplicate rows, and they will not deadlock against each other for a single-row upsert (deadlocks need a *cycle* of waits, which a single contested row cannot form alone). Concurrent upserts on *different* keys proceed independently with no blocking.

### Batch Sizing Guidance

| Batch Size | Tradeoff |
|---|---|
| 1 row per statement | Simplest code, slowest, one round-trip and one WAL flush decision per row |
| 100-1,000 rows per multi-row `INSERT`/`UPDATE` | Good default — amortizes round-trip and parsing overhead while keeping each transaction's lock footprint and potential rollback cost manageable |
| 10,000+ rows per statement | Diminishing returns on speed, increasing risk: a single failed row aborts the whole batch (unless using `ON CONFLICT DO NOTHING` defensively), and large batches hold locks longer, increasing contention with concurrent readers/writers |
| Entire file via `COPY` | Fastest for initial bulk load, but an error partway through aborts the entire `COPY` (Postgres `COPY` is all-or-nothing per invocation) — see the recovery plan in Pitfalls below |

### `COPY` Error Handling

Standard `COPY` aborts entirely on the first malformed row — there is no partial commit. For large, possibly-dirty source files, the safer pattern is:

1. `COPY` into a permissive **staging table** with no constraints (or very loose ones) and `TEXT` columns.
2. Run validation queries against the staging table to identify and quarantine bad rows.
3. `INSERT ... SELECT` the clean rows from staging into the real, constrained target table.

This isolates "did the file parse" from "does the data meet business rules," and a bad row never aborts the whole load.

### Safe Archival and Retention Design

* Prefer the **modifying-CTE atomic move** pattern (Exercise 2 below) over a separate `SELECT` + `INSERT` + `DELETE`, which has a window where a crash leaves rows duplicated or lost.
* For very large archives, partition the source table by date (Day 97's partitioning material) so "archive everything older than 90 days" becomes `DETACH PARTITION` + bulk-copy, rather than a row-by-row `DELETE ... RETURNING`.
* Always run archival deletes/copies in a maintenance window or with explicit batching (e.g., archive 10,000 rows per transaction in a loop) to avoid holding a single enormous transaction open, which — per Day 96 — blocks `VACUUM` for the whole database.

---

## Hands-on Lab

### Setup

```sql
-- Dialect: PostgreSQL 14+

DROP TABLE IF EXISTS page_views;
CREATE TABLE page_views (url TEXT PRIMARY KEY, hits INT NOT NULL DEFAULT 0);

DROP TABLE IF EXISTS payment_events;
CREATE TABLE payment_events (
    request_id  UUID PRIMARY KEY,
    account_id  INT NOT NULL,
    amount      NUMERIC(10,2) NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TABLE IF EXISTS logs, logs_archive;
CREATE TABLE logs (
    log_id      SERIAL PRIMARY KEY,
    message     TEXT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE logs_archive (LIKE logs);

INSERT INTO logs (message, created_at) VALUES
    ('startup ok',       now() - INTERVAL '45 days'),
    ('disk warning',     now() - INTERVAL '40 days'),
    ('user login',       now() - INTERVAL '2 days'),
    ('user logout',      now() - INTERVAL '1 days');

DROP TABLE IF EXISTS users;
CREATE TABLE users (id INT PRIMARY KEY);
```

### Exercise 1 — Upsert: Retry-Safe Counter vs. True Idempotency, Side by Side

```sql
-- Retry-safe but NOT idempotent: each run increments.
INSERT INTO page_views (url, hits) VALUES ('home', 1)
ON CONFLICT (url) DO UPDATE SET hits = page_views.hits + 1;
```

| Run # | Query Result (`hits`) |
|---|---|
| 1 | 1 |
| 2 | 2 |
| 3 | 3 |

```sql
SELECT hits FROM page_views WHERE url = 'home';
-- Expected after 3 runs above: 3
```

```sql
-- True idempotency: same request_id, run 3 times.
INSERT INTO payment_events (request_id, account_id, amount)
VALUES ('11111111-1111-1111-1111-111111111111', 1, 49.99)
ON CONFLICT (request_id) DO NOTHING;
-- run this exact statement 3 times in a row
```

```sql
SELECT count(*) FROM payment_events;
-- Expected after 3 runs: 1 -- the second and third runs are no-ops because
-- request_id already exists; the end state is identical to running it once.
```

**Cleanup for Exercise 1:**

```sql
DELETE FROM page_views WHERE url = 'home';
DELETE FROM payment_events;
```

### Exercise 2 — Atomic Move: Archive Logs Older Than 30 Days

**Before state:**

```sql
SELECT message, created_at < now() - INTERVAL '30 days' AS is_old FROM logs ORDER BY created_at;
```

| message | is_old |
|---|---|
| startup ok | true |
| disk warning | true |
| user login | false |
| user logout | false |

```sql
WITH moved AS (
    DELETE FROM logs
    WHERE created_at < now() - INTERVAL '30 days'
    RETURNING *
)
INSERT INTO logs_archive
SELECT * FROM moved;
```

**After state (expected):**

```sql
SELECT message FROM logs ORDER BY created_at;
-- Expected: only 'user login' and 'user logout' remain

SELECT message FROM logs_archive ORDER BY created_at;
-- Expected: 'startup ok' and 'disk warning' are now here
```

**Verification — row counts must add up:**

```sql
SELECT (SELECT count(*) FROM logs) + (SELECT count(*) FROM logs_archive) AS total;
-- Expected: 4 (no rows lost or duplicated)
```

### Exercise 3 — Savepoint Recovery: Failure Case and Resulting State

```sql
BEGIN;
INSERT INTO users (id) VALUES (1);
SAVEPOINT s1;
INSERT INTO users (id) VALUES (1); -- duplicate primary key
-- Expected error: ERROR: duplicate key value violates unique constraint "users_pkey"
ROLLBACK TO s1; -- discards only the failed statement's effects, transaction stays open
INSERT INTO users (id) VALUES (2);
COMMIT;
```

**Verification:**

```sql
SELECT id FROM users ORDER BY id;
-- Expected: 1, 2 -- the failed duplicate insert never took effect, but the
-- transaction was NOT aborted entirely, so id=1 (from before the savepoint)
-- and id=2 (after the rollback-to-savepoint) both survived.
```

**What if you skip `ROLLBACK TO s1` and just try to continue?** Postgres aborts the entire transaction on the first error and refuses all further statements until you issue a `ROLLBACK` (full) or `ROLLBACK TO` a savepoint taken before the error — this is the behavior the savepoint pattern exists to avoid.

### Cleanup

```sql
DROP TABLE IF EXISTS page_views;
DROP TABLE IF EXISTS payment_events;
DROP TABLE IF EXISTS logs, logs_archive;
DROP TABLE IF EXISTS users;
```

---

## Senior-Level Insights and Pitfalls

### Dropping Indexes Before Bulk Load — Qualified

The original advice — drop indexes, `COPY`, rebuild indexes — is real, but incomplete without these caveats:

* **Uniqueness/FK constraints depend on indexes**: dropping a `UNIQUE` or primary-key constraint to speed up a load also removes the protection that prevents duplicate rows from entering during the load. If the source data has duplicates, you will not find out until you try to rebuild the index afterward and it fails — by which point you have to de-duplicate a now-larger table. Foreign-key constraints similarly rely on the referenced table's indexes; dropping them means orphaned references can be inserted silently.
* **Concurrent-reader impact**: dropping an index that a read-heavy application depends on (even temporarily, during the load window) causes those queries to fall back to sequential scans, which can produce a user-facing latency spike or timeout storm during the load — not just a risk to the load itself.
* **Disk/WAL space during rebuild**: `CREATE INDEX` (without `CONCURRENTLY`) builds the entire index in one pass and needs roughly the size of the final index again in temporary disk space, plus it generates a large burst of WAL. On a disk-constrained instance, this can exhaust available space mid-rebuild.
* **Recovery plan if the load fails mid-way**: if `COPY` aborts partway (a malformed row at row 8 million of 10 million), you are left with a partially loaded table and no index to validate it. The safe recovery plan is: load into a staging table with the same structure but no constraints, validate the row count and a few content checks, then `INSERT ... SELECT` into the production table inside a transaction — if validation fails, you `TRUNCATE` the staging table and retry without ever having touched the production table's indexes or constraints.
* **Staging-table alternative**: rather than dropping indexes on the live table at all, load into an unindexed staging table, build minimal validation indexes there if needed, and swap it into place (`ALTER TABLE ... RENAME`, or partition-attach if using Day 97's partitioning) once verified — this avoids ever leaving the production table in an unprotected state.

### Justifying the Magic Numbers

* **"30 days" retention**: not a universal constant — it should be driven by a stated business/compliance requirement (e.g., "operational logs are queried for debugging within 30 days; older logs move to cold storage per the data-retention policy"). State the requirement explicitly rather than treating 30 as inherently correct.
* **"1 Billion rows"**: used here as an illustrative scale where row-at-a-time `INSERT` becomes operationally painful (multi-day load times), not a threshold where `COPY` suddenly becomes necessary — the crossover point where batching/`COPY` clearly wins is much lower, often in the low millions, depending on row width and hardware.
* **"10x-100x faster" for `COPY` vs `INSERT`**: this range assumes the comparison is against *unbatched, individually committed* `INSERT` statements. Batched multi-row `INSERT`s close much of this gap. Always state which `INSERT` pattern you're comparing against when citing a speedup number.

---

### Non-Functional Constraints (Apply to All Exercises)

* **Performance / Scale**: Document a target query runtime of **p95 < 2s** for your final solution, validate behavior at **30 concurrent analytical users/sessions**, and keep compute spend below **$3** per production-equivalent run.
* **Data Governance / Security**: Define acceptance criteria for least-privilege access, PII handling (masking/tokenization where applicable), audit logging of query access, and retention/deletion alignment with policy.
* **Business KPI Impact**: Explicitly state which business KPI(s) improve based on your schema/query decisions and quantify expected directional impact.
  * KPI focus for this day: *DML patterns should improve data-correction turnaround time and reduce failed-write retries in core operational flows.*

## Mastery Check

### Question 1: Upsert

What is `EXCLUDED` in an Upsert query?
A) The row that was deleted.
B) The special table containing the values you *tried* to insert (the proposed new data).
C) A keyword for banning users.
D) An error.

<details>
<summary>Click for Answer</summary>

**Answer: B**
`EXCLUDED` lets you reference the proposed row inside `ON CONFLICT DO UPDATE`, e.g. `SET name = EXCLUDED.name`, distinct from the existing stored row referenced by the table name.
</details>

### Question 2: COPY vs INSERT

Which is generally faster for loading 1 million rows, and why does the speedup figure need a caveat?
A) Row-at-a-time `INSERT` is always faster.
B) `COPY FROM` is generally faster, but the commonly cited "10x-100x" figure assumes comparison against unbatched, individually-committed INSERTs — multi-row batched INSERTs close much of that gap.
C) They perform identically.
D) `UPDATE` is the fastest option for loading new rows.

<details>
<summary>Click for Answer</summary>

**Answer: B**
COPY amortizes parsing/constraint overhead across the whole load and is genuinely faster, but the magnitude of the speedup depends heavily on what kind of INSERT you're comparing it to.
</details>

### Question 3: Idempotency vs Retry Safety

A counter upsert (`ON CONFLICT DO UPDATE SET hits = hits + 1`) is described as "safe to run 100 times." Is it idempotent?

A) Yes — it never raises an error no matter how many times it runs.
B) No — it is retry-safe (never errors/corrupts state), but running it 100 times produces a different end state (hits=100) than running it once (hits=1), which fails the definition of idempotency.
C) Yes, because ON CONFLICT always guarantees idempotency.
D) No, because upserts are never safe to retry.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Idempotency requires the END STATE to be identical regardless of how many times the operation runs. "Never errors" is retry safety, a weaker and different property. A true idempotency-key pattern (INSERT ... ON CONFLICT (request_id) DO NOTHING) produces the same end state on every retry.
</details>

### Question 4: Modifying CTE

Can a CTE modify data (`DELETE`) and return the data to the outer query?
A) No, CTEs are read-only.
B) Yes, using the `RETURNING` clause, and the DELETE and the outer INSERT execute atomically as one statement.
C) Only in SQL Server.
D) It deletes the CTE.

<details>
<summary>Click for Answer</summary>

**Answer: B**
This is the "modifying CTE" pattern used for atomic moves: WITH moved AS (DELETE ... RETURNING *) INSERT INTO archive SELECT * FROM moved. If the INSERT fails, the whole statement (including the DELETE) rolls back.
</details>

### Question 5: Savepoint

If I `ROLLBACK TO savepoint`, does the transaction end?
A) Yes, it commits.
B) No, the transaction is still active (open). You must eventually `COMMIT` or fully `ROLLBACK`.
C) It crashes.
D) It saves the file.

<details>
<summary>Click for Answer</summary>

**Answer: B**
A savepoint rollback only rewinds state to the bookmark; the outer transaction remains open, letting you continue with further statements before a final COMMIT or ROLLBACK.
</details>

### Question 6: Indexing

Why is "drop indexes before bulk load" risky without further qualification?
A) It is never risky.
B) Dropping a UNIQUE/FK-backing index removes duplicate/orphan protection during the load, concurrent readers lose index support and may see latency spikes, and a failed COPY mid-load leaves an unindexed, unvalidated table with no clean recovery path unless a staging table was used.
C) It only matters for tables under 1,000 rows.
D) It has no effect on concurrent readers.

<details>
<summary>Click for Answer</summary>

**Answer: B**
The performance benefit is real, but production use requires planning for constraint loss during the load window, reader impact, disk/WAL needs during index rebuild, and a recovery plan (commonly: stage first, then INSERT...SELECT into the constrained production table) if the load fails partway.
</details>

### Question 7: MERGE Dialect

Is the `MERGE` statement available in PostgreSQL 14?

A) Yes, it has always been part of Postgres.
B) No — `MERGE` was introduced in PostgreSQL 15; on 14 or earlier, use `INSERT ... ON CONFLICT` for insert-or-update, or separate DML statements for cases involving deletes.
C) Yes, but only with the btree_gist extension.
D) MERGE is a MySQL-only feature.

<details>
<summary>Click for Answer</summary>

**Answer: B**
This lesson explicitly flags PostgreSQL 15+ as the dialect requirement for MERGE. Always state the minimum version when introducing a feature that isn't universal across supported Postgres versions.
</details>

### Question 8: Concurrency

Two transactions concurrently run `INSERT ... ON CONFLICT (id) DO UPDATE` targeting the SAME row's id. What happens?

A) Both succeed instantly with no interaction.
B) One acquires the row lock and proceeds; the other blocks briefly until the first commits, then proceeds -- they serialize on that row but neither errors nor deadlocks (a single contested row can't form a wait cycle).
C) A deadlock is guaranteed.
D) The second transaction is silently dropped.

<details>
<summary>Click for Answer</summary>

**Answer: B**
ON CONFLICT's DO UPDATE takes a row-level lock for the duration of the update. Contention on the same key causes brief serialization, not an error -- deadlocks require a cycle of mutual waits, which one contested row alone cannot create.
</details>

---

## Glossary

| Term | Definition |
|---|---|
| **DML** | Data Manipulation Language — SQL statements that read or modify row data (`SELECT`, `INSERT`, `UPDATE`, `DELETE`, `MERGE`). |
| **Upsert** | A single statement that inserts a new row or updates an existing one depending on whether a conflict is detected, via `INSERT ... ON CONFLICT`. |
| **Idempotency** | The property that running an operation N times produces the same end state as running it once — distinct from retry safety (never erroring), which a counter-style upsert has without being idempotent. |
| **Conflict target** | The column or constraint named in `ON CONFLICT (...)` that determines which existing row, if any, the new row conflicts with. |
| **`EXCLUDED`** | The pseudo-table inside `ON CONFLICT DO UPDATE` holding the values that were proposed by the triggering `INSERT`. |
| **Bulk load** | Loading a large volume of rows in a way optimized for throughput (e.g., `COPY`, batched multi-row `INSERT`) rather than transactional row-by-row safety checks. |
| **Savepoint** | A named bookmark within an open transaction that `ROLLBACK TO` can return to, undoing only the statements after that point without ending the transaction. |
| **Atomicity** | The guarantee that a statement or transaction's effects are all-or-nothing — relevant here because a modifying CTE's `DELETE` and `INSERT` succeed or fail together. |
| **Batch** | A group of rows processed together in one statement or transaction, sized to balance throughput against lock duration and failure-blast-radius. |

---

## Summary

Today you learned:

* ✅ **Idempotency vs. retry safety**: the corrected distinction, with a true idempotency-key pattern alongside the (retry-safe but not idempotent) counter upsert.
* ✅ **Upserts**: `ON CONFLICT`, `EXCLUDED`, and conflict targets, explained line by line.
* ✅ **Modifying CTEs**: atomic moves via `DELETE ... RETURNING` feeding an `INSERT`.
* ✅ **UPDATE/DELETE/MERGE**: including the Postgres 15+ `MERGE` statement and when it's needed over `ON CONFLICT`.
* ✅ **Bulk load tradeoffs**: a qualified, recovery-aware view of dropping indexes, staging tables, and `COPY` error handling.
* ✅ **Savepoints**: partial rollback within an open transaction.

**Tomorrow**: We query faster with **Data Query Language (DQL)** — reading the data structures and writes built across Days 96-98.
