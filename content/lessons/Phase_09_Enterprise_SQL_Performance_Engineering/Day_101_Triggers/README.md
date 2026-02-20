---
day: 101
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

---

## Senior-Level Insights

### The "Trigger Cascade" Nightmare

* **Scenario**:
    1. Update Table A -> Trigger updates Table B.
    2. Update Table B -> Trigger updates Table A.
* **Result**: Infinite Loop. Stack Depth Limit Exceeded.
* **Fix**: `pg_trigger_depth()`. Or better: **Don't do it**. Avoid complex logic in triggers.

### Performance Cost

* **Fact**: Triggers are synchronous.
* **Impact**: If your Trigger takes 100ms, your `INSERT` takes 100ms + Write Time.
* **Advice**: Keep triggers extremely lightweight. If you need to send an email, don't send it *in* the trigger. `INSERT` into a queue table instead.

---

## Hands-on Lab

### Exercise 1: The Sanitizer (BEFORE Trigger)

**Goal**: Force emails to lowercase.

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
```

### Exercise 2: The Audit (AFTER Trigger)

**Goal**: Log changes to JSONB.

```sql
CREATE TABLE audits (id serial, diff jsonb, changed_at timestamptz DEFAULT now());

CREATE OR REPLACE FUNCTION log_change() RETURNS TRIGGER AS $$
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
```

### Exercise 3: The Notification (NOTIFY)

**Goal**: Real-time push.

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

## Summary

Today you learned:

* ✅ **BEFORE vs AFTER**: Modification vs Logging.
* ✅ **Audit Logs**: Using triggers to create a paper trail.
* ✅ **Row vs Statement**: Managing bulk performance.
* ✅ **NOTIFY**: Turning Postgres into a Message Broker.

**Tomorrow**: We solve hierarchical problems with **Recursive CTEs**.

---

## 🚨 Escalating Incident Drill Track (Days 97–108)

Use these three drills as a connected simulation sequence. Each drill is intentionally harder than the previous one and must be completed with production-style evidence.

### Drill 1 (Severity 2): Performance degradation under peak load

**Scenario**: During peak checkout traffic, API latency jumps from 120ms to 2.8s, and dashboards show CPU saturation on the primary database.

**Required outputs**:

1. **Root-cause analysis using query plans and schema objects**
   - Capture `EXPLAIN (ANALYZE, BUFFERS)` for the top 3 slow statements from `pg_stat_statements`.
   - Identify the dominant bottleneck (e.g., sequential scans, stale stats, sort spill, lock waits).
   - Map the issue to schema objects (specific index, table, materialized view, partition, or join path).
2. **Mitigation patch strategy and rollback criteria**
   - Propose a low-risk patch (index change, query rewrite, refresh strategy, stats maintenance, or connection throttling).
   - Define rollout steps, canary checks, and explicit rollback triggers (p95 latency, error rate, lock queue depth, CPU threshold).
3. **Post-incident report**
   - Summarize business impact (checkout conversion, order delay, SLA breach duration).
   - Document prevention controls (capacity threshold alerting, index review checklist, load-test gate before release).
   - Add monitoring updates (query-plan drift alert, wait-event dashboard, incident runbook links).

### Drill 2 (Severity 1): Security policy breach involving row-level access

**Scenario**: A regional sales manager can query customer rows from another region due to a row-level security policy regression.

**Required outputs**:

1. **Root-cause analysis using query plans and schema objects**
   - Reproduce the leak using a least-privilege role and capture relevant SQL.
   - Inspect policy definitions (`pg_policies`), grants, security-definer functions, and view ownership chains.
   - Use query plans to show where policy filters are bypassed or pushed incorrectly.
2. **Mitigation patch strategy and rollback criteria**
   - Provide an emergency containment patch (policy fix, revoke path, view hardening, function privilege correction).
   - Define validation tests for allowed vs denied row sets per role.
   - Set rollback criteria tied to false-deny rate, support-ticket spike, and audit-log anomalies.
3. **Post-incident report**
   - Quantify business/compliance impact (records exposed, jurisdictions affected, notification obligations).
   - List prevention controls (policy-as-code review, CI policy simulation, privileged object inventory).
   - Add monitoring updates (cross-tenant access detectors, policy-change alerts, immutable audit retention).

### Drill 3 (Severity 1 / Executive Escalation): Data correctness regression from trigger/procedure change

**Scenario**: A trigger/procedure deployment silently double-counts revenue in month-end reporting and breaks finance reconciliation.

**Required outputs**:

1. **Root-cause analysis using query plans and schema objects**
   - Diff trigger/procedure versions and execution order; trace writes across dependent tables/views.
   - Use plans and dependency metadata (`pg_trigger`, `pg_proc`, `pg_depend`) to locate duplicate or missing mutations.
   - Build a minimal reproducible dataset proving the correctness gap.
2. **Mitigation patch strategy and rollback criteria**
   - Deliver a hotfix plan (procedure correction + backfill/reconciliation script) with idempotency guarantees.
   - Include data repair strategy for already-corrupted records and freeze windows for risky writes.
   - Define rollback criteria based on reconciliation deltas, financial control checks, and downstream report parity.
3. **Post-incident report**
   - Summarize business impact (close-delay, misstated KPI exposure, executive communication timeline).
   - Document prevention controls (change contracts for triggers, shadow writes, dual-run verification, release checklist).
   - Add monitoring updates (data quality assertions, ledger-vs-fact drift alarms, automated reconciliation jobs).

