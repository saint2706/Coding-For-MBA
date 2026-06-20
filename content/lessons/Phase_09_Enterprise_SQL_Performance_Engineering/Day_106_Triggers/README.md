---
day: 106
title: "Triggers & Event-Driven SQL"
phase: 9
phaseTitle: "Enterprise SQL Performance Engineering"
slug: "triggers-events"
duration: 120
difficulty: "advanced"
tags:
  - triggers
  - audit-logging
  - notify-listen
  - event-sourcing
concepts:
  - "BEFORE vs AFTER Triggers"
  - "Row vs Statement Level"
  - "Audit Logging Pattern (Hstore/JSONB)"
  - "Real-Time Events (NOTIFY / LISTEN)"
prerequisites:
  - "Basic Functions (Day 100)"
outcomes:
  - "Build a 'Time-Travel' Audit Log"
  - "Sanitize data automatically on Insert"
  - "Push real-time updates to a Node.js app using Postgres"
---

# 🎯 Day 101: Triggers & Event-Driven SQL

> *"A database should not just be a bucket. It should be a nervous system that reacts to touch."*

---

## The "Never-Coded" Bridge

**The Security Guard & The Photographer**

* **BEFORE Trigger (The Guard)**:
  * You try to enter the club.
  * Guard stops you *before* you enter. Checks ID. "No sneakers allowed."
  * *Action*: Can modify you (give you a tie) or reject you (Error).
* **AFTER Trigger (The Photographer)**:
  * You have *already* entered.
  * Photographer takes a picture of you for the album (Audit Log).
  * *Action*: Cannot change the fact that you entered. Just records it.

---

## The Technical Deep Dive

### 1. Trigger Anatomy

* **Timing**: `BEFORE` (Validation/Mutation) vs `AFTER` (Logging/Propagation).
* **Level**: `FOR EACH ROW` (Run 10 times for 10 rows) vs `FOR EACH STATEMENT` (Run once for batch).
* **Variables**: `NEW` (The proposed row) and `OLD` (The existing row).

### 2. The Audit Log Pattern

The most common use case.

* **Requirement**: "Who changed the user's email? What was it before?"
* **Implementation**:
  * Table `audit_log (table_name, user, old_val, new_val, timestamp)`.
  * Trigger on `users` table copies `OLD.email` and `NEW.email` to `audit_log`.
  * *Benefit*: Indisputable proof of every change.

### 3. Real-Time Events (`NOTIFY`)

Postgres has a built-in Pub/Sub system!

* **SQL**: `NOTIFY my_channel, 'User 123 Updated'`.
* **Client (Node/Python)**: `LISTEN my_channel`.
* **Result**: The moment the transaction commits, the app gets a push notification. No polling required!
* **Transactional semantics**: `NOTIFY` (and the function form `pg_notify()`) is queued like any other write — the payload is only delivered to listeners *after* the issuing transaction successfully `COMMIT`s. If the transaction rolls back, the notification is discarded along with everything else. This makes `NOTIFY` safe to call from inside a trigger: you never get a "phantom" notification for a write that didn't actually happen.
* **Limits**: payloads are capped at 8000 bytes and delivery is "fire and forget" — there's no guaranteed delivery, replay, or ordering across reconnects. For anything beyond a lightweight cache-invalidation or UI-refresh signal, `NOTIFY` should kick off a re-query rather than carry the full payload, and durable event delivery belongs in a dedicated queue (Kafka, SQS, or an outbox table).

### 4. INSTEAD OF Triggers (Updatable Views)

Plain views are read-only the moment they involve a join or aggregation — you can't `UPDATE`/`INSERT`/`DELETE` against them directly. `INSTEAD OF` triggers let you intercept a DML statement aimed at a view and translate it into whatever multi-table writes are actually needed, while the caller keeps using a simple, single-table-looking interface.

```sql
CREATE VIEW user_profile AS
SELECT u.id, u.email, p.display_name
FROM users u JOIN profiles p ON p.user_id = u.id;

CREATE OR REPLACE FUNCTION user_profile_update() RETURNS TRIGGER AS $$
BEGIN
    UPDATE users SET email = NEW.email WHERE id = OLD.id;
    UPDATE profiles SET display_name = NEW.display_name WHERE user_id = OLD.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_user_profile_update
INSTEAD OF UPDATE ON user_profile
FOR EACH ROW
EXECUTE FUNCTION user_profile_update();

-- Callers can now do this even though it spans two tables:
UPDATE user_profile SET display_name = 'Bobby' WHERE id = 1;
```

`INSTEAD OF` triggers only apply to views (never to plain tables) and must be `FOR EACH ROW` — there is no `FOR EACH STATEMENT` variant. This is the standard pattern for abstracting a complex multi-table write behind a simple, app-facing view contract.

### 5. Event Triggers (DDL-Level)

Row-level triggers fire on `INSERT`/`UPDATE`/`DELETE`. **Event triggers** fire on schema *changes themselves* — `CREATE TABLE`, `DROP TABLE`, `ALTER TABLE`, etc. They are the tool for regulated environments that must capture "who changed the schema and when," independent of any application code path.

```sql
CREATE OR REPLACE FUNCTION log_ddl_command() RETURNS event_trigger AS $$
BEGIN
    INSERT INTO ddl_audit_log(command_tag, executed_by, executed_at)
    VALUES (tg_tag, current_user, now());
END;
$$ LANGUAGE plpgsql;

CREATE EVENT TRIGGER trg_ddl_audit
ON ddl_command_start
EXECUTE FUNCTION log_ddl_command();
```

`ON DDL_COMMAND_START` fires before the command executes; `ddl_command_end` fires after. Event triggers are a niche tool — most teams reach for them only in compliance-heavy environments (finance, healthcare) where every schema migration must be independently logged outside of CI/CD records.

---

## Senior-Level Insights

### Performance Cost

* **Fact**: Triggers are synchronous.
* **Impact**: If your Trigger takes 100ms, your `INSERT` takes 100ms + Write Time.
* **Advice**: Keep triggers extremely lightweight.

### The Business Case for Trigger-Based Audit Logs

Regulations like GDPR Article 30 require organizations to maintain "records of processing activities" — an auditable trail of who changed what personal data, and when. A trigger-based audit log (Exercise 2) adds roughly 0.5ms of write latency per row, since it's just one more `INSERT` inside the same transaction. Compare that to the downside of *not* having one: GDPR fines can reach up to €20M or 4% of global annual revenue, whichever is higher, and "we don't know who changed this record" is precisely the gap regulators look for during an investigation. A few hundred microseconds of write overhead versus an eight-figure fine exposure is not a close call — this is a trade-off you should almost always take, even before a regulator asks.

> ⚠️ Pitfall: Trigger Cascade Loop
>
> **Scenario**: `Table A` has an `AFTER UPDATE` trigger that updates `Table B`. `Table B` has its own `AFTER UPDATE` trigger that updates `Table A`. The first `UPDATE` on `A` fires `B`'s trigger, which fires `A`'s trigger again, which fires `B`'s trigger again — an infinite loop that ends in `ERROR: stack depth limit exceeded`.
>
> **Detection**: Guard any trigger that writes to a table which might write back to *this* table with `pg_trigger_depth()`, which returns how many trigger levels deep the current execution is (0 if called directly, not from within a trigger):
>
> ```sql
> CREATE OR REPLACE FUNCTION sync_b_from_a() RETURNS TRIGGER AS $$
> BEGIN
>     IF pg_trigger_depth() > 1 THEN
>         RETURN NEW; -- We're already inside a cascade; stop here.
>     END IF;
>     UPDATE table_b SET ... WHERE ...;
>     RETURN NEW;
> END;
> $$ LANGUAGE plpgsql;
> ```
>
> **Architectural advice**: treating `pg_trigger_depth()` as a safety net is reasonable, but the better fix is architectural — avoid bidirectional trigger relationships entirely. Pick one table as the source of truth and have the other *read* from it (via a view or application-layer query) instead of writing back. If two tables genuinely need to stay in sync in both directions, that's usually a sign the data model should be normalized differently, or that the sync belongs in application code where it's easier to reason about and test.

> ⚠️ Pitfall: Synchronous Email/HTTP in Trigger
>
> Triggers execute **synchronously**, inside the same transaction as the write that fired them. If a trigger calls out to an external service — sending an email via SMTP, hitting a webhook, calling a payment gateway — that `INSERT`/`UPDATE` now blocks on network I/O it has no business depending on. A flaky mail server with a 5-second timeout turns every signup into a 5-second `INSERT`, and a `ROLLBACK` after the email already sent means the user gets a "Welcome!" email for an account that doesn't exist.
>
> **Fix**: never perform synchronous I/O inside a trigger. Insert into a queue table instead, and let a separate worker process (or `LISTEN`/`NOTIFY` consumer) drain the queue outside the transaction:
>
> ```sql
> CREATE TABLE email_queue (
>     id serial PRIMARY KEY,
>     user_id INT NOT NULL,
>     template TEXT NOT NULL,
>     status TEXT DEFAULT 'pending',
>     created_at timestamptz DEFAULT now()
> );
>
> CREATE OR REPLACE FUNCTION queue_welcome_email() RETURNS TRIGGER AS $$
> BEGIN
>     INSERT INTO email_queue(user_id, template) VALUES (NEW.id, 'welcome');
>     RETURN NEW;
> END;
> $$ LANGUAGE plpgsql;
>
> CREATE TRIGGER trg_queue_welcome_email
> AFTER INSERT ON users
> FOR EACH ROW
> EXECUTE FUNCTION queue_welcome_email();
> ```
>
> The `INSERT` into `email_queue` is fast and local — no network call, no timeout risk — and a worker (or a trigger-fired `NOTIFY` that wakes a listener) can process `status = 'pending'` rows independently, with its own retry logic.

---

## Hands-on Lab

### Exercise 1: The Sanitizer (BEFORE Trigger)

**Goal**: Force emails to lowercase.

**Seed data**:

```sql
CREATE TABLE users (id serial, email text);
INSERT INTO users VALUES (1, 'BOB@EXAMPLE.COM');
```

```sql
CREATE OR REPLACE FUNCTION sanitize_user() RETURNS TRIGGER AS $$
BEGIN
    NEW.email := LOWER(NEW.email); -- Modify the data in flight
    RETURN NEW; -- Proceed with the modified row
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sanitize
BEFORE INSERT OR UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION sanitize_user();

UPDATE users SET email = 'ALICE@EXAMPLE.COM' WHERE id = 1;
SELECT email FROM users WHERE id = 1;
```

**Expected result**:

```text
      email
-------------------
 alice@example.com
(1 row)
```

The `BEFORE UPDATE` trigger rewrote `NEW.email` to lowercase *before* the row was actually written, so the value that lands in the table is already sanitized — no separate cleanup pass needed.

### Exercise 2: The Audit (AFTER Trigger)

**Goal**: Log changes to JSONB.

**Understanding the diff operator**: `to_jsonb(NEW) - to_jsonb(OLD)` converts both the new and old row to JSONB objects, then applies the JSONB `-` (minus) operator. For two JSONB objects, `-` returns a new object containing only the keys from the *left* operand whose **value** doesn't match the corresponding key in the right operand (and any keys missing from the right entirely). In other words, it's "the fields that actually changed." This is far more storage-efficient than logging the entire `OLD` and `NEW` rows on every update — a one-column email change in a 30-column table produces a one-key JSONB diff, not 60 stored values.

**Seed data**:

```sql
CREATE TABLE audits (
    id serial, diff jsonb, changed_at timestamptz DEFAULT now()
);
INSERT INTO users VALUES (2, 'charlie@example.com');
```

```sql
CREATE OR REPLACE FUNCTION log_change() RETURNS trigger AS $$
BEGIN
    INSERT INTO audits(diff)
    VALUES (to_jsonb(NEW) - to_jsonb(OLD)); -- Storage efficient diff
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_audit
AFTER UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION log_change();

UPDATE users SET email = 'new@x.com' WHERE id = 2;
SELECT diff FROM audits;
```

**Expected result**:

```text
        diff
---------------------
 {"email": "new@x.com"}
(1 row)
```

Only the `email` key appears — `id` was unchanged between `OLD` and `NEW`, so it's excluded from the diff.

### Exercise 3: The Notification (NOTIFY)

**Goal**: Real-time push.

**Seed data**: reuse the `users` table from Exercise 1/2.

```sql
CREATE OR REPLACE FUNCTION notify_app() RETURNS TRIGGER AS $$
BEGIN
    PERFORM pg_notify('user_updates', 'User ' || NEW.id || ' changed');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_notify
AFTER UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION notify_app();

-- In one psql session:
LISTEN user_updates;

-- In a second psql session:
UPDATE users SET email = 'updated@x.com' WHERE id = 1;
```

**Expected result** (in the listening session, immediately after the second session's transaction commits):

```text
Asynchronous notification "user_updates" with payload "User 1 changed" received from server process with PID 1234.
```

---

## Mastery Check

### Question 1: Performance

If I run `UPDATE users SET active=true` on 1000 rows, how many times does a `FOR EACH ROW` trigger fire?
A) 1.
B) 1000.
C) 0.
D) 2.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Be careful with bulk updates on tables with triggers!
</details>

### Question 2: Validation

Which trigger timing prevents bad data from being saved?
A) AFTER.
B) BEFORE.
C) INSTEAD OF.
D) LATER.

<details>
<summary>Click for Answer</summary>

**Answer: B**
If you raise an exception in a BEFORE trigger, the insert fails.
</details>

### Question 3: Infinite Loops

How can you prevent a trigger loop (A->B->A)?
A) You can't.
B) Check `IF pg_trigger_depth() > 1 THEN RETURN NEW;`.
C) Use `BEFORE` triggers only.
D) Hope for the best.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Or structure your architecture so A updates B, but B never updates A.
</details>

### Question 4: NOTIFY

When is the `NOTIFY` payload sent to listeners?
A) Immediately when the line runs.
B) Only when the transaction successfully `COMMIT`s.
C) When the server restarts.
D) Never.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Transactional event sourcing. If the tx rolls back, the notification is cancelled.
</details>

### Question 5: Variables

In an `INSERT` trigger, what is the value of `OLD`?
A) The previous row.
B) `NULL`.
C) The new row.
D) Zero.

<details>
<summary>Click for Answer</summary>

**Answer: B**
There is no "Old" version of a new row.
</details>

---

## Glossary

| Term | Definition |
|---|---|
| **BEFORE Trigger** | Fires before the triggering row is written; can modify `NEW` or raise an exception to abort the write entirely. |
| **AFTER Trigger** | Fires after the triggering row is committed to the table; cannot change the row, used for logging/propagation. |
| **INSTEAD OF Trigger** | Fires on a view (never a plain table) in place of the attempted DML, letting you translate a single-table-looking write into the real underlying multi-table writes. |
| **FOR EACH ROW** | Trigger fires once per affected row — `NEW`/`OLD` refer to that specific row. |
| **FOR EACH STATEMENT** | Trigger fires once per SQL statement, regardless of how many rows it affects — no `NEW`/`OLD` access. |
| **NEW** | The proposed row after the change (available in `INSERT`/`UPDATE` triggers). |
| **OLD** | The row as it existed before the change (available in `UPDATE`/`DELETE` triggers; `NULL` in `INSERT` triggers). |
| **NOTIFY** | SQL command (`NOTIFY channel, 'payload'` or `pg_notify()`) that queues a Pub/Sub message, delivered to listeners only after the issuing transaction commits. |
| **LISTEN** | Client command that subscribes the current session to a `NOTIFY` channel. |
| **pg_trigger_depth()** | Function returning how many trigger levels deep the current execution is; used to detect and break cascading trigger loops. |
| **Audit Log** | A table recording who changed what and when, typically populated by an `AFTER` trigger that diffs `OLD` and `NEW`. |
| **Event Trigger** | A trigger that fires on DDL commands (`CREATE`, `ALTER`, `DROP`) rather than row-level DML, used to capture schema changes. |

---

## Summary

Today you learned:

* ✅ **BEFORE vs AFTER**: Modification vs Logging.
* ✅ **Audit Logs**: Using triggers to create a paper trail.
* ✅ **Row vs Statement**: Managing bulk performance.
* ✅ **NOTIFY**: Turning Postgres into a Message Broker.
* ✅ **INSTEAD OF / Event Triggers**: Updatable-view abstraction and DDL-level auditing.

**Tomorrow**: We solve hierarchical problems with **Recursive CTEs**.

---

## 🚨 Escalating Incident Drill Track (Days 105–107: Procedures → Triggers → Recursion)

This lesson's drill track continues the storyline from Day 105: the midnight archiving procedure has now been re-implemented as a trigger-based system, and tomorrow's recursive rollup will depend on the audit data this trigger produces. Each drill below is scoped to *this* lesson's tools — trigger timing, cascades, `NOTIFY` semantics, and `pg_trigger_depth()`.

### Drill 1 (Severity 2): The audit trigger that silently doubled write latency

**Scenario**: After the Day 105 archiving procedure was patched to COMMIT in batches, a new `AFTER UPDATE` trigger was added to `orders` to log every archive event to an `audits` table. Within a week, checkout-adjacent `UPDATE orders` calls show p95 latency up 400ms, and on-call is paged for "slow writes," not "slow reads."

**Required outputs**:

1. **Root-cause analysis using query plans and schema objects**
   * Use `EXPLAIN ANALYZE` on a representative `UPDATE orders ...` to see total execution time including trigger firing (`Trigger trg_audit: time=...`).
   * Inspect the trigger function body for a missing index on the audit table's `INSERT` path, or accidental row-by-row work that should be statement-level.
   * Confirm whether the trigger is `FOR EACH ROW` on a bulk `UPDATE` touching thousands of rows — multiply the per-row trigger cost by row count to explain the aggregate latency.
2. **Mitigation patch strategy and rollback criteria**
   * Patch the trigger to do the minimum necessary work (e.g., write only the JSONB diff via `to_jsonb(NEW) - to_jsonb(OLD)`, not the full row) and ensure the audit table has appropriate indexes so its own `INSERT` is fast.
   * If the audit write still adds unacceptable latency, move it off the synchronous path: queue a lightweight event and let an async worker write the full audit record.
   * Rollback criteria: if p95 `UPDATE orders` latency does not return within 20ms of pre-trigger baseline after the patch, disable the trigger and re-evaluate the audit architecture.
3. **Post-incident report**
   * Summarize business impact (checkout latency regression, duration before detection, number of affected requests).
   * Document prevention controls (require `EXPLAIN ANALYZE` trigger-inclusive timing in code review for any new trigger on a hot-path table).
   * Add monitoring updates (alert on trigger execution time reported in `pg_stat_user_functions`, p95 write-latency dashboards split by table).

### Drill 2 (Severity 1): The trigger cascade between `orders` and `inventory`

**Scenario**: A trigger on `orders` (`AFTER UPDATE`) decrements `inventory.quantity` when an order is marked shipped. A trigger on `inventory` (`AFTER UPDATE`) was later added to re-check `orders` for backorder fulfillment, creating an unintentional cascade. Under a specific update pattern, the database starts throwing `ERROR: stack depth limit exceeded` and several checkout transactions fail simultaneously.

**Required outputs**:

1. **Root-cause analysis using query plans and schema objects**
   * Read both trigger function definitions (`\df+`, `pg_trigger`) and draw the write dependency graph: `orders -> inventory -> orders`.
   * Reproduce the loop in a test transaction and confirm via the error that `pg_trigger_depth()` exceeded Postgres's internal recursion limit.
   * Identify the specific update pattern (e.g., a backorder-fulfillment order) that triggers the cycle, versus the common case that doesn't.
2. **Mitigation patch strategy and rollback criteria**
   * Patch the `inventory` trigger to check `IF pg_trigger_depth() > 1 THEN RETURN NEW; END IF;` as an immediate safety net.
   * Follow up with an architectural fix: make `inventory` the source of truth that `orders` reads from (via a query, not a write-back trigger), eliminating the bidirectional dependency entirely.
   * Rollback criteria: any recurrence of `stack depth limit exceeded` in production logs after the patch triggers an immediate trigger disable and architecture review before re-enabling.
3. **Post-incident report**
   * Summarize business impact (number of failed checkout transactions, customer-facing error rate spike, revenue at risk).
   * Document prevention controls (ban on triggers that write to a table already known to write back to the origin table; require a dependency graph review for any new cross-table trigger).
   * Add monitoring updates (alert on any `stack depth limit exceeded` error in Postgres logs, dashboard of trigger-to-trigger write dependencies).

### Drill 3 (Severity 1 / Executive Escalation): Lost NOTIFY events break the real-time dashboard during a rollback storm

**Scenario**: The ops team relies on `pg_notify()` fired from an `AFTER UPDATE` trigger on `orders` to drive a real-time "orders in flight" dashboard via `LISTEN`. During a deployment, a batch of order updates is wrapped in transactions that get rolled back due to an unrelated constraint violation introduced by the same deploy. The dashboard shows stale/incorrect counts for 40 minutes before anyone notices revenue figures don't match the database.

**Required outputs**:

1. **Root-cause analysis using query plans and schema objects**
   * Confirm via `NOTIFY`'s transactional semantics that the rolled-back transactions' notifications were correctly *never sent* — the dashboard's drift is not a `NOTIFY` bug, it's a missing "rollback happened" signal the dashboard never displays.
   * Audit the deploy's migration for the constraint violation that caused the rollbacks, and cross-reference `pg_stat_database.xact_rollback` to quantify how many transactions failed in the window.
   * Determine whether the dashboard has any reconciliation/heartbeat mechanism, or relies purely on `NOTIFY` events with no periodic ground-truth resync.
2. **Mitigation patch strategy and rollback criteria**
   * Roll back the bad migration immediately to stop further constraint-violation rollbacks.
   * Add a periodic reconciliation query (every 60s, a full recount against `orders`) as a safety net so `LISTEN`-driven dashboards self-correct even if individual `NOTIFY` events are skipped by design (rollback) or lost (connection drop).
   * Rollback criteria: dashboard counts must match a direct `SELECT count(*)` query within one reconciliation interval before the incident is closed.
3. **Post-incident report**
   * Summarize business impact (40 minutes of incorrect real-time revenue visibility during a live deploy, decisions potentially made on stale data).
   * Document prevention controls (mandatory reconciliation heartbeat for any dashboard relying solely on `NOTIFY`/`LISTEN`; pre-deploy constraint validation against a production-like dataset).
   * Add monitoring updates (alert on `xact_rollback` rate spikes, dashboard self-reported "last reconciled at" timestamp surfaced to the ops team).
