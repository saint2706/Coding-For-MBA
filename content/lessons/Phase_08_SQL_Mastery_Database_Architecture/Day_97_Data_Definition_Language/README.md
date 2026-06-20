---
day: 97
title: "Advanced DDL & Schema"
phase: 8
phaseTitle: "SQL Mastery & Database Architecture"
slug: "advanced-ddl"
duration: 120
difficulty: "advanced"
tags:
  - schema-design
  - normalization
  - partitioning
  - exclusion-constraints
  - triggers
  - procedures
concepts:
  - "Schema Design Fundamentals (Keys, Relationships, Normalization)"
  - "Declarative Partitioning (Range/List/Hash)"
  - "Exclusion Constraints (The 'No Overlap' Rule)"
  - "Stored Procedures vs Functions"
  - "Triggers (Audit Logs)"
prerequisites:
  - "Day 96: Relational Database Internals"
  - "Basic CREATE TABLE"
outcomes:
  - "Design a normalized schema with correct keys and referential actions"
  - "Partition a 1TB table by Date"
  - "Prevent Booking Overlaps at the DB level"
  - "Write a PL/pgSQL Trigger"
  - "Choose between a constraint, trigger, procedure, or application check for a given invariant"
---

# 🎯 Day 97: Advanced DDL & Schema

> *"A weak schema allows garbage in. A strong schema forces the application to be correct."*

---

## Cross-References

This lesson builds directly on **[Day 96 — Relational Database Internals](../Day_96_Relational_Databases/README.md)**: the normalization (1NF–3NF) and key concepts introduced there are the foundation for the schema-design section below, and the locking/MVCC mechanics from Day 96 explain *why* exclusion constraints and triggers behave the way they do under concurrency. If you have not yet read Day 96, the exclusion-constraint material in Part 2 will make more sense after you have.

Forward links: the schemas built here (`accounts`, `audit_log`, `bookings`, `sales`) are the ones manipulated with `UPDATE`/`DELETE`/`MERGE`/upserts in **[Day 98 — Advanced DML & Upserts](../Day_98_Data_Manipulation_Language/README.md)**.

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

## Part 1: Schema Design Fundamentals (Read This Before the Advanced Material)

Every advanced DDL feature below — exclusion constraints, triggers, partitions — sits on top of an ordinary, well-designed table. If the underlying schema is wrong, no amount of advanced tooling fixes it. This section covers what "well-designed" means.

### Entities, Keys, and Relationships

An **entity** is a real-world thing your schema tracks (a customer, a booking, an account). Each entity typically becomes one table.

**Keys:**
- **Primary key (PK)**: uniquely identifies a row in its table. Example: `accounts.account_id`.
- **Foreign key (FK)**: a column (or columns) in one table that references a primary key in another, enforcing that the referenced row must exist. Example: `bookings.room_id REFERENCES rooms(room_id)`.
- **Composite key**: a primary key made of more than one column, used when no single column is unique on its own. Example: `order_items(order_id, product_id)` — neither column alone is unique, but the pair is.
- **Surrogate key**: a system-generated identifier (typically `SERIAL`/`IDENTITY` or a `UUID`) with no business meaning, used instead of a natural key like an email or SSN, because natural keys can change or collide across systems.

**Relationships between entities:**

| Relationship | Example | How It's Modeled |
|---|---|---|
| **1:1** | A `users` row has exactly one `user_profile` row | Foreign key in the child table with a `UNIQUE` constraint, or share the same primary key |
| **1:N** | One `customer` has many `orders` | Foreign key on the "many" side (`orders.customer_id`) |
| **N:N** | Many `students` enroll in many `courses` | A junction/bridge table (`enrollments`) with a composite key referencing both sides |

### Normalization Worked Example (1NF → 3NF)

This mirrors the normalization walkthrough from Day 96, applied here to the schema you'll extend in this lesson's labs.

**Before (denormalized, violates 3NF):**

```
bookings_flat
| booking_id | room_number | room_type | guest_name | guest_email      | check_in   | check_out  |
|------------|-------------|-----------|-------------|------------------|------------|------------|
| 1          | 101         | Deluxe    | Asha Rao    | asha@acme.com    | 2024-01-01 | 2024-01-03 |
| 2          | 205         | Suite     | Asha Rao    | asha@acme.com    | 2024-02-10 | 2024-02-12 |
```

`room_type` depends on `room_number`, not on `booking_id` — a transitive dependency (3NF violation). `guest_email` depends on `guest_name`, not on `booking_id` — same problem. If Asha's email changes, two rows need updating, and missing one creates a contradiction.

**After (normalized to 3NF):**

```sql
-- Dialect: PostgreSQL 14+

CREATE TABLE guests (
    guest_id    SERIAL PRIMARY KEY,
    name        TEXT NOT NULL,
    email       TEXT NOT NULL UNIQUE
);

CREATE TABLE rooms (
    room_id     SERIAL PRIMARY KEY,
    room_number INT NOT NULL UNIQUE,
    room_type   TEXT NOT NULL DEFAULT 'Standard'
);

CREATE TABLE bookings (
    booking_id  SERIAL PRIMARY KEY,
    guest_id    INT NOT NULL REFERENCES guests(guest_id) ON DELETE RESTRICT,
    room_id     INT NOT NULL REFERENCES rooms(room_id) ON DELETE RESTRICT,
    check_in    DATE NOT NULL,
    check_out   DATE NOT NULL,
    CHECK (check_out > check_in)
);
```

Now `room_type` and `guest_email` each exist in exactly one row. This is the schema the rest of this lesson's exclusion-constraint and trigger exercises extend.

### Data Types, Nullability, Defaults, Naming

- **Choose the narrowest correct type**: `INT` for counts, `NUMERIC(p,s)` for money (never `FLOAT` — binary floating point cannot represent currency exactly), `TIMESTAMPTZ` for any timestamp that crosses time zones, `TEXT` over `VARCHAR(n)` in Postgres unless you have a specific length-enforcement reason (Postgres's `TEXT` and `VARCHAR` have identical performance; `VARCHAR(n)` only adds a length check).
- **Nullability**: make a column `NOT NULL` unless "unknown/not applicable" is a genuinely valid business state. A nullable foreign key (e.g., `bookings.cancelled_by_user_id` for bookings that were never cancelled) is normal; a nullable `email` on a `guests` table usually is not.
- **Defaults**: use `DEFAULT` for values the database can supply safely (`created_at TIMESTAMPTZ NOT NULL DEFAULT now()`), not for business logic that belongs in application code.
- **Naming conventions**: snake_case, singular or plural table names consistently (this repo uses plural: `bookings`, `rooms`), primary keys named `<table_singular>_id`, foreign keys named to match the column they reference.

### Referential Actions (What Happens on Delete/Update of a Parent Row)

```sql
-- Dialect: PostgreSQL 14+
room_id INT REFERENCES rooms(room_id) ON DELETE CASCADE   -- delete bookings when their room is deleted
room_id INT REFERENCES rooms(room_id) ON DELETE RESTRICT  -- block deleting a room that has bookings (the default-ish safe choice)
room_id INT REFERENCES rooms(room_id) ON DELETE SET NULL  -- orphan the booking by nulling room_id (requires room_id to be nullable)
```

| Action | Effect | When to Use |
|---|---|---|
| `CASCADE` | Deletes/updates child rows automatically | Child rows have no meaning without the parent (e.g., `order_items` when an `order` is deleted) |
| `RESTRICT` (or default `NO ACTION`) | Blocks the parent delete/update if children exist | Default safe choice — forces an explicit decision rather than silent data loss |
| `SET NULL` | Sets the FK column to `NULL` | Child rows should survive but lose the reference (requires the FK column to be nullable) |

---

## Part 2: The Technical Deep Dive — Advanced Constructs

### 1. Declarative Partitioning

Postgres 10+ made this easy.

* **Parent Table**: `CREATE TABLE logs (...) PARTITION BY RANGE (created_at);`
* **Child Tables**: `CREATE TABLE logs_2023 PARTITION OF logs FOR VALUES FROM ('2023-01-01') TO ('2024-01-01');`
* **Benefit**: You query `logs`, Postgres scans `logs_2023`.
* **Maintenance**: You can `DROP TABLE logs_2020` instantly to reclaim space (vs `DELETE FROM logs` which is slow).

**Key terms**: a **partition bound** is the `FOR VALUES FROM (...) TO (...)` (range) or `FOR VALUES IN (...)` (list) clause that determines which rows route to which child table. A **default partition** (`CREATE TABLE sales_other PARTITION OF sales DEFAULT;`) catches any row that doesn't match another partition's bound — without one, an `INSERT` matching no partition fails with `no partition of relation "sales" found for row`.

### 2. Constraints++ (Exclusion)

`UNIQUE` prevents duplicate IDs. `EXCLUDE` prevents overlapping ranges.

* **Scenario**: Room Booking.
* **Code**: `EXCLUDE USING gist (room_id WITH =, during WITH &&)`.
* **Meaning**: "Reject any row where `room_id` matches AND the `duration` (Time Range) overlaps with an existing row."
* *Why?*: A **race condition** — two concurrent transactions both check "is this room free?" via a `SELECT`, both see "yes," both `INSERT` — is impossible to close from application code alone without locking the whole table for every booking check, which would serialize all bookings globally. The exclusion constraint pushes the conflict check into the storage engine itself, where it can be enforced atomically per-row.

### 3. Stored Procedures and Triggers

* **Function**: Returns a value. Run inside `SELECT`. (`SELECT my_func()`). A **scalar type** return (e.g., `INT`, `TEXT`) means it returns one value; functions can also return a `SETOF` rows.
* **Procedure**: Performs actions (Transactions). Call with `CALL proc()`. Can `COMMIT` inside.
* **Trigger**: Runs automatically `BEFORE` or `AFTER` an Event (`INSERT`, `UPDATE`, `DELETE`).
  * **Use Case**: Audit Logging. Copy the *old row* to a `history` table before updating.

---

## Part 3: Line-by-Line Walkthroughs

### Exclusion Constraint — Line by Line

```sql
-- Dialect: PostgreSQL 14+

CREATE EXTENSION IF NOT EXISTS btree_gist;
-- WHY: the EXCLUDE clause below mixes an equality check (room_id, a plain integer)
-- with a range-overlap check (during, a TSTZRANGE). GiST indexes natively support
-- range types, but the btree_gist extension is what teaches GiST how to also index
-- ordinary scalar types (INT, TEXT, etc.) so it can combine both kinds of checks
-- in one index. Without this extension, the EXCLUDE statement below fails with
-- "data type integer has no default operator class for access method gist."

CREATE TABLE bookings (
    booking_id  SERIAL PRIMARY KEY,
    room_id     INT NOT NULL,
    during      TSTZRANGE NOT NULL,
    -- TSTZRANGE: a "timestamp with time zone range" type -- a single column holding
    -- both a start and end timestamp, e.g. '[2024-01-01 10:00+00, 2024-01-01 12:00+00)'.
    EXCLUDE USING gist (room_id WITH =, during WITH &&)
    -- WHY: for every PAIR of rows, if room_id is EQUAL (=) AND during RANGES OVERLAP (&&),
    -- reject the new row. This is checked atomically as part of the INSERT/UPDATE,
    -- so two concurrent transactions cannot both succeed for the same overlapping slot.
);
```

**Half-open range semantics — `[)` vs `[]`:** `TSTZRANGE` literals use `[` or `(` for the lower bound and `]` or `)` for the upper bound, where `[`/`]` mean *inclusive* and `(`/`)` mean *exclusive*. The convention used throughout this lesson, `'[2024-01-01 10:00, 2024-01-01 12:00)'`, is **half-open**: 10:00 is included, 12:00 is excluded. This matters directly for booking systems — it means a booking ending at 12:00 and another starting at 12:00 do **not** overlap (the room is free for back-to-back bookings at the exact boundary). If you instead used a closed range `[10:00, 12:00]`, a booking ending at 12:00 and one starting at 12:00 would be considered overlapping and the second insert would be rejected — almost never the behavior you want for scheduling.

### Range Operators

| Operator | Meaning | Example |
|---|---|---|
| `&&` | Ranges overlap | `'[1,5)' && '[3,8)'` → `true` |
| `<@` | Contained by | `'[3,4)' <@ '[1,10)'` → `true` |
| `@>` | Contains | `'[1,10)' @> '[3,4)'` → `true` |
| `-\|-` | Adjacent (no gap, no overlap) | `'[1,5)' -\|- '[5,10)'` → `true` |

### Audit Trigger — Line by Line

```sql
-- Dialect: PostgreSQL 14+

CREATE OR REPLACE FUNCTION log_balance_change() RETURNS TRIGGER AS $$
-- RETURNS TRIGGER: a special pseudo-type that marks this function as usable only
-- as a trigger function -- it cannot be called directly via SELECT.
BEGIN
    INSERT INTO audit_log(changed_by, account_id, old_balance, new_balance, changed_at)
    VALUES (current_user, OLD.account_id, OLD.balance, NEW.balance, now());
    -- OLD: a row-typed variable holding the row's values BEFORE this statement.
    -- NEW: a row-typed variable holding the row's values AFTER this statement.
    -- Both are only available inside ROW-level triggers; OLD is unavailable on INSERT
    -- (there is no "before" row) and NEW is unavailable on DELETE (there is no "after" row).
    RETURN NEW;
    -- For a BEFORE trigger, returning NEW (possibly modified) is what actually gets written.
    -- For an AFTER trigger (as used below), the return value is ignored, but a value
    -- must still be returned -- by convention, NEW.
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_log_balance_change
AFTER UPDATE ON accounts
-- AFTER vs BEFORE: AFTER means the row is already durably changed; use AFTER for
-- side effects like audit logging that should reflect what was actually committed.
-- BEFORE is for validation/sanitization that needs to alter the row before it's written.
FOR EACH ROW
-- ROW vs STATEMENT: FOR EACH ROW fires once per affected row (needed here, since OLD/NEW
-- are row-specific). FOR EACH STATEMENT fires once per SQL statement regardless of how
-- many rows it touched, and cannot reference OLD/NEW directly.
WHEN (OLD.balance IS DISTINCT FROM NEW.balance)
-- WHEN clause: only fire the trigger body if the balance actually changed -- avoids
-- writing audit rows for updates to unrelated columns.
EXECUTE FUNCTION log_balance_change();
```

### Partitioning — Routing Logic Line by Line

```sql
-- Dialect: PostgreSQL 14+

CREATE TABLE sales (
    sale_id  SERIAL,
    region   TEXT NOT NULL,
    amount   NUMERIC(10,2) NOT NULL,
    PRIMARY KEY (sale_id, region)
    -- WHY region is in the primary key: Postgres requires the partition key
    -- (region, declared below) to be part of every unique constraint on a
    -- partitioned table, because uniqueness can only be enforced WITHIN each
    -- partition, not across all partitions combined.
) PARTITION BY LIST (region);
-- PARTITION BY LIST: route rows to a child table based on an exact-match list
-- of values in `region`, as opposed to PARTITION BY RANGE (continuous ranges,
-- e.g. dates) or PARTITION BY HASH (even distribution with no natural grouping key).

CREATE TABLE sales_us PARTITION OF sales FOR VALUES IN ('US');
CREATE TABLE sales_eu PARTITION OF sales FOR VALUES IN ('EU');
CREATE TABLE sales_other PARTITION OF sales DEFAULT;
-- DEFAULT partition: catches any region not explicitly listed (e.g., 'APAC'),
-- preventing INSERT failures for regions added later without a matching partition.

INSERT INTO sales (region, amount) VALUES ('US', 100);   -- routed to sales_us
INSERT INTO sales (region, amount) VALUES ('APAC', 50);  -- routed to sales_other (default)
```

**Partition-key UPDATE restriction**: updating the `region` column on an existing row (moving it from `'US'` to `'EU'`) requires Postgres to physically move the row from `sales_us` to `sales_eu`. Postgres 11+ supports this automatically, but it is more expensive than an ordinary update (it's effectively a delete-plus-insert across partitions) and will fail if the destination partition doesn't exist or violates a constraint there.

---

## Hands-on Lab

### Setup — Complete Schema with Seed Rows

```sql
-- Dialect: PostgreSQL 14+

CREATE EXTENSION IF NOT EXISTS btree_gist;

DROP TABLE IF EXISTS bookings;
CREATE TABLE rooms (
    room_id     SERIAL PRIMARY KEY,
    room_number INT NOT NULL UNIQUE
);

CREATE TABLE bookings (
    booking_id  SERIAL PRIMARY KEY,
    room_id     INT NOT NULL REFERENCES rooms(room_id),
    during      TSTZRANGE NOT NULL,
    EXCLUDE USING gist (room_id WITH =, during WITH &&)
);

INSERT INTO rooms (room_id, room_number) VALUES (101, 101);

DROP TABLE IF EXISTS accounts;
CREATE TABLE accounts (
    account_id INT PRIMARY KEY,
    owner      TEXT NOT NULL,
    balance    NUMERIC(10,2) NOT NULL CHECK (balance >= 0)
);
INSERT INTO accounts VALUES (1, 'Asha', 500.00);

DROP TABLE IF EXISTS audit_log;
CREATE TABLE audit_log (
    log_id       SERIAL PRIMARY KEY,
    changed_by   TEXT,
    account_id   INT,
    old_balance  NUMERIC(10,2),
    new_balance  NUMERIC(10,2),
    changed_at   TIMESTAMPTZ
);
```

### Exercise 1 — Exclusion Constraint: Booking Success and Failure

```sql
-- This succeeds: room 101, no existing overlapping booking yet.
INSERT INTO bookings (room_id, during)
VALUES (101, '[2024-01-01 10:00+00, 2024-01-01 12:00+00)');
-- Expected: INSERT 0 1
```

```sql
-- This FAILS: same room, overlapping window (11:00-13:00 overlaps 10:00-12:00).
INSERT INTO bookings (room_id, during)
VALUES (101, '[2024-01-01 11:00+00, 2024-01-01 13:00+00)');
-- Expected error:
-- ERROR:  conflicting key value violates exclusion constraint "bookings_room_id_during_excl"
-- DETAIL:  Key (room_id, during)=(101, ["2024-01-01 11:00:00+00","2024-01-01 13:00:00+00")) conflicts
--          with existing key (room_id, during)=(101, ["2024-01-01 10:00:00+00","2024-01-01 12:00:00+00")).
```

```sql
-- This SUCCEEDS: same room, back-to-back booking starting exactly when the first ends.
-- Demonstrates the half-open [) semantics -- 12:00 is excluded from the first booking.
INSERT INTO bookings (room_id, during)
VALUES (101, '[2024-01-01 12:00+00, 2024-01-01 14:00+00)');
-- Expected: INSERT 0 1
```

**Verification query:**

```sql
SELECT booking_id, room_id, during FROM bookings ORDER BY booking_id;
-- Expected: 2 rows -- the 10:00-12:00 booking and the 12:00-14:00 booking. The
-- 11:00-13:00 attempt is absent because it was rejected.
```

### Exercise 2 — Audit Trigger: Expected Rows

```sql
CREATE OR REPLACE FUNCTION log_balance_change() RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_log(changed_by, account_id, old_balance, new_balance, changed_at)
    VALUES (current_user, OLD.account_id, OLD.balance, NEW.balance, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_log_balance_change
AFTER UPDATE ON accounts
FOR EACH ROW
WHEN (OLD.balance IS DISTINCT FROM NEW.balance)
EXECUTE FUNCTION log_balance_change();

UPDATE accounts SET balance = 450.00 WHERE account_id = 1;
```

**Expected `audit_log` row after the trigger fires:**

```sql
SELECT changed_by, account_id, old_balance, new_balance FROM audit_log;
```

| changed_by | account_id | old_balance | new_balance |
|---|---|---|---|
| (your psql role, e.g. `postgres`) | 1 | 500.00 | 450.00 |

```sql
-- Updating an unrelated detail does NOT fire the trigger (WHEN clause excludes it):
UPDATE accounts SET owner = 'Asha R.' WHERE account_id = 1;
SELECT count(*) FROM audit_log;
-- Expected: 1 -- still just the one row from the balance change above.
```

### Exercise 3 — Partitioning: Verification Queries

```sql
CREATE TABLE sales (
    sale_id  SERIAL,
    region   TEXT NOT NULL,
    amount   NUMERIC(10,2) NOT NULL,
    PRIMARY KEY (sale_id, region)
) PARTITION BY LIST (region);

CREATE TABLE sales_us PARTITION OF sales FOR VALUES IN ('US');
CREATE TABLE sales_eu PARTITION OF sales FOR VALUES IN ('EU');
CREATE TABLE sales_other PARTITION OF sales DEFAULT;

INSERT INTO sales (region, amount) VALUES ('US', 100), ('EU', 75), ('APAC', 50);
```

```sql
-- Verify routing: query each partition directly.
SELECT * FROM sales_us;
-- Expected: 1 row -- (sale_id, 'US', 100.00)

SELECT * FROM sales_other;
-- Expected: 1 row -- (sale_id, 'APAC', 50.00)
```

```sql
-- Verify a query against the parent sees all partitions:
SELECT region, sum(amount) FROM sales GROUP BY region ORDER BY region;
-- Expected:
--  region | sum
-- --------+--------
--  APAC   |  50.00
--  EU     |  75.00
--  US     | 100.00
```

### Cleanup

```sql
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS rooms;
DROP TRIGGER IF EXISTS trg_log_balance_change ON accounts;
DROP FUNCTION IF EXISTS log_balance_change();
DROP TABLE IF EXISTS audit_log;
DROP TABLE IF EXISTS accounts;
DROP TABLE IF EXISTS sales;
```

---

## Senior-Level Insights and Pitfalls

### "Logic in DB" vs "Logic in App"

* **The Debate**:
  * **DB Approach**: Use Triggers/Procedures. "Data is valid even if I insert via CLI."
  * **App Approach**: Keep DB dumb (Storage). Logic in Python. "Easier to test/version control."
* **Middle Ground**: Use **Constraints** (Foreign Keys, Checks, Exclusion) in DB because they are fast/safe. Keep **Business Workflow** in App. Avoid complex PL/pgSQL if possible (hard to debug).

### Decision Table — Constraints vs Triggers vs Procedures vs App Validation

| Invariant Type | Best Mechanism | Concurrency Safety | Testability | Portability |
|---|---|---|---|---|
| "No two rows with the same value" | `UNIQUE` constraint | Enforced atomically by the index — safe under any concurrency | High — fails predictably, easy to unit test | High — supported by every relational DB |
| "No overlapping time ranges per room" | `EXCLUDE` constraint | Enforced atomically (this lesson's example) | High, but requires Postgres-specific test setup (`btree_gist`) | Low — exclusion constraints are largely Postgres-specific; other engines need different patterns (e.g., SQL Server requires a trigger or computed-column workaround) |
| "Log every balance change for compliance" | `AFTER` trigger | Safe — fires within the same transaction as the change, so it can never be "missed" by a race | Medium — requires integration tests against a real database, harder to unit test in isolation | Medium — trigger syntax (PL/pgSQL vs T-SQL vs PL/SQL) varies significantly across engines |
| "Multi-step business workflow with external API calls" | Application code | Depends entirely on how the app handles concurrency/retries | High — standard application test frameworks apply | High — application logic is engine-agnostic |
| "Field must be a valid value from a fixed list" | `CHECK` constraint or `ENUM` type | Enforced atomically | High | Medium — `CHECK` is portable; native `ENUM` types vary in syntax and mutability across engines |

### Pitfalls

* **Trigger recursion and hidden side effects**: a trigger on `accounts` that itself updates `accounts` (even indirectly, through a function call) can re-fire itself, looping until Postgres hits its trigger-recursion safety limit or you hit a stack-depth error. Always check `pg_trigger_depth()` inside a trigger body if there's any chance of self-reference, and prefer `WHEN` clauses to scope exactly when a trigger should fire.
* **`SECURITY DEFINER` privilege risks**: a trigger function marked `SECURITY DEFINER` runs with the privileges of the function's *owner*, not the caller. This is sometimes necessary (e.g., letting a low-privilege role write to an audit table it can't directly access) but means a bug or injection in that function executes with elevated privileges — always set `search_path` explicitly inside `SECURITY DEFINER` functions to prevent schema-spoofing attacks.
* **Missing-partition errors**: inserting a row whose partition key doesn't match any child table's bound, with no `DEFAULT` partition defined, fails with `no partition of relation "sales" found for row`. Always create a `DEFAULT` partition during initial design as a safety net, even if you expect to enumerate every value — it turns a production outage into a row quietly landing in a catch-all table you can audit later.
* **Partition-key `UPDATE` restrictions**: moving a row across partitions via `UPDATE` is supported in Postgres 11+ but is more expensive than an in-place update and can fail if the destination partition's constraints reject the row.
* **Extension portability across cloud providers**: `btree_gist`, `pg_partman`, and other extensions used in this lesson are not universally available. Some managed Postgres offerings (certain AWS RDS tiers, some serverless Postgres providers) restrict which extensions can be installed, or require a support ticket to enable them. Always check your target platform's allowed-extensions list before designing around an extension-dependent feature like exclusion constraints.

### Partition Maintenance

* **Challenge**: You created partitions for 2023. It is now 2024.
* **Result**: Insert fails (if no default partition exists) — "No partition found."
* **Fix**: Automation (`pg_partman` extension, or a scheduled job) to create future partitions automatically ahead of need.

---

### Non-Functional Constraints (Apply to All Exercises)

* **Performance / Scale**: Document a target query runtime of **p95 < 3s** for your final solution, validate behavior at **20 concurrent analytical users/sessions**, and keep compute spend below **$2** per production-equivalent run.
* **Data Governance / Security**: Define acceptance criteria for least-privilege access, PII handling (masking/tokenization where applicable), audit logging of query access, and retention/deletion alignment with policy.
* **Business KPI Impact**: Explicitly state which business KPI(s) improve based on your schema/query decisions and quantify expected directional impact.
  * KPI focus for this day: *DDL decisions should reduce schema-change lead time and incident frequency for customer-facing product releases.*

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
Dropping a child table deletes its data. Fast cleanup — this is why date-range partitioning is popular for retention policies (drop old partitions instead of running a slow DELETE).
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
This is the main difference between Procedures (`CALL`, can manage transactions) and Functions (`SELECT`, run inside an existing transaction and cannot commit/rollback it).
</details>

### Question 3: Trigger Timing

When should you use a `BEFORE UPDATE` trigger instead of `AFTER UPDATE`?
A) To log the change for an audit table.
B) To modify the data *before* it hits the disk (e.g., lowercase an email, validate a value).
C) To send an email notification.
D) To slow down the database intentionally.

<details>
<summary>Click for Answer</summary>

**Answer: B**
`BEFORE` triggers can modify `NEW` and have that modification actually written. `AFTER` triggers (like audit logging) run once the row is already durably changed, so they're for side effects, not for altering the row itself.
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
Referential integrity — a foreign key guarantees the referenced row exists (or is null, if the column is nullable).
</details>

### Question 5: Exclusion vs Unique

Can a plain `UNIQUE` constraint handle "no two bookings for the same room with overlapping time ranges"?
A) Yes, with the right index type.
B) No — `UNIQUE` only checks exact equality between full column values; overlapping ranges require an `EXCLUDE` constraint with a range-overlap operator.
C) Sometimes, depending on the database.
D) Only on leap years.

<details>
<summary>Click for Answer</summary>

**Answer: B**
`UNIQUE` would only reject two rows with the *exact same* range value, not two rows whose ranges merely overlap. You need `EXCLUDE USING gist (... WITH &&)` for overlap semantics.
</details>

### Question 6: Half-Open Ranges

A booking ends at exactly 12:00 and another booking for the same room starts at exactly 12:00, using the range literal style `'[start, end)'`. Do they violate the exclusion constraint?

A) Yes, because 12:00 appears in both ranges.
B) No — the half-open `[)` convention excludes the upper bound, so the first booking's range does not actually include 12:00, and the two ranges don't overlap.
C) It depends on the time zone.
D) Exclusion constraints don't support back-to-back bookings at all.

<details>
<summary>Click for Answer</summary>

**Answer: B**
`[10:00, 12:00)` includes 10:00 but excludes 12:00. A booking starting at `[12:00, 14:00)` has no overlapping instant with the first, so both inserts succeed -- this is the standard, intentional convention for scheduling systems.
</details>

### Question 7: Dialect Caveat

Is the `EXCLUDE USING gist` syntax portable to other databases like MySQL or SQL Server?

A) Yes, it's part of the ANSI SQL standard.
B) No — exclusion constraints are a PostgreSQL-specific feature; other engines require workarounds like triggers, computed columns with unique indexes, or application-level locking to achieve equivalent overlap protection.
C) Yes, but only in MySQL 8+.
D) No database supports this concept.

<details>
<summary>Click for Answer</summary>

**Answer: B**
`EXCLUDE` constraints rely on Postgres's GiST index infrastructure and range types, which are not part of the SQL standard. Migrating this pattern to another engine requires a different implementation strategy entirely.
</details>

---

## Glossary

| Term | Definition |
|---|---|
| **DDL** | Data Definition Language — SQL statements that define or alter schema structure (`CREATE`, `ALTER`, `DROP`). |
| **Normalization** | The process of structuring tables so each fact is stored once, eliminating update anomalies (see 1NF/2NF/3NF). |
| **Exclusion constraint** | A Postgres constraint that rejects a new row if it conflicts with an existing row under a specified operator (commonly range overlap), generalizing `UNIQUE` beyond equality. |
| **GiST** | Generalized Search Tree — an extensible Postgres index type capable of indexing complex data like ranges, geometric types, and (with `btree_gist`) ordinary scalars. |
| **Trigger** | A function that runs automatically in response to a table event (`INSERT`/`UPDATE`/`DELETE`), at a specified timing (`BEFORE`/`AFTER`) and granularity (`ROW`/`STATEMENT`). |
| **Procedure** | A database routine invoked with `CALL`, capable of managing its own transactions (`COMMIT`/`ROLLBACK`). |
| **Function** | A database routine invoked within a query (e.g., `SELECT my_func()`), always running inside the caller's existing transaction. |
| **Partition** | A child table holding a subset of a logically larger parent table's rows, routed automatically based on a partition key. |
| **Race condition** | A bug class where the correctness of an operation depends on the relative timing of concurrent operations — e.g., two transactions both checking "is this slot free?" before either writes. |
| **Scalar type** | A type holding a single atomic value (`INT`, `TEXT`, `NUMERIC`), as opposed to a composite, array, or range type. |

---

## Summary

Today you learned:

* ✅ **Schema design fundamentals**: entities, keys (primary/foreign/composite/surrogate), relationships, normalization, and referential actions — the foundation beneath everything else in this lesson.
* ✅ **Declarative Partitioning**: Manage massive tables easily, with default-partition safety nets and routing logic explained.
* ✅ **Exclusion Constraints**: Solve the "Booking Problem" natively, with exact half-open range semantics.
* ✅ **Triggers**: Automate actions on DB events, with `OLD`/`NEW`, timing, and recursion risk explained.
* ✅ **Procedures**: Transactional logic in the database, and a decision table for when to use constraints vs triggers vs procedures vs application code.

**Tomorrow**: We manipulate data with power in **Data Manipulation Language (DML)** — applying these same `accounts`/`audit_log` schemas.
