---
day: 112
title: "Enterprise Security: RLS & Encryption"
phase: 9
phaseTitle: "Enterprise SQL Performance Engineering"
slug: "data-security"
duration: 120
difficulty: "advanced"
tags:
  - rls
  - pgcrypto
  - encryption
  - rbac
concepts:
  - "Row Level Security (RLS)"
  - "Column Encryption (pgcrypto)"
  - "Role Based Access Control (RBAC)"
  - "SQL Injection Prevention"
prerequisites:
  - "Basic GRANT/REVOKE"
outcomes:
  - "Implement Multi-Tenancy where users can ONLY see their own rows"
  - "Encrypt passwords with Bcrypt"
  - "Create a Read-Only Auditor Role"
---

# 🎯 Day 107: Enterprise Security: RLS & Encryption

> *"The application layer is leaky. The database layer is the final line of defense."*

---

## The "Never-Coded" Bridge

**The Apartment Complex Keys**

* **Application Security**: The Front Desk Guard. checks your ID and lets you into the lobby.
* **RBAC (Table Level)**: The Elevator. Your key card only lets you go to Floor 5. You can see *all* doors on Floor 5.
* **RLS (Row Level)**: The Apartment Key. You can only open Door 502. Even if you are on the right floor (Table), you can't open Door 503.
* **Encryption**: The Safe inside the apartment. Even if someone breaks down the door, they can't read the papers inside the safe without the combination.

---

## The Technical Deep Dive

### 1. Row Level Security (RLS)

Native Policy Engine in Postgres.

* **Enable**: `ALTER TABLE orders ENABLE ROW LEVEL SECURITY`.
* **Policy**:

    ```sql
    CREATE POLICY user_policy ON orders
    FOR SELECT
    USING (user_id = current_user_id()); -- Custom function
    ```

* **Effect**: `SELECT * FROM orders` returns *only* your rows. It silently hides the rest.

### 2. Encryption (`pgcrypto`)

Storing secrets.

* **Hashing (Passwords)**: One-way. `crypt('password', gen_salt('bf'))`.
* **Encryption (Credit Cards)**: Two-way. `pgp_sym_encrypt('1234', 'AES_KEY')`.
* **Key Management**: The hardest part. The key should *not* be in the DB. Pass it from the App Env Vars.

### 3. RBAC (Roles)

* `GRANT SELECT ON ALL TABLES IN SCHEMA public TO data_analyst;`
* `ALTER DEFAULT PRIVILEGES ... GRANT SELECT ...` (Future tables).
* **Best Practice**: Never log in as `postgres` (Superuser). Create a `deployer` role.

---

## Senior-Level Insights

### Multi-Tenancy: "Pool" vs "Silo"

* **Silo (Separate DBs)**:
  * *Pros*: Infinite security. (Target can't see Walmart's data).
  * *Cons*: Migrating schema on 10,000 DBs is a nightmare.
* **Pool (Shared DB with RLS)**:
  * *Pros*: Easy management.
  * *Cons*: One bug in the RLS policy exposes everyone's data. (High Risk).

### The Performance Hit of RLS

* **Fact**: RLS adds a `WHERE` clause to *every* query.
* **Impact**: It forces a Join or lookup on every row. Ensure your `user_id` columns are indexed!

---

## Hands-on Lab

### Exercise 1: Basic RBAC

**Goal**: Create a Read-Only user.

1. `CREATE ROLE intern WITH LOGIN PASSWORD '123';`.
2. `GRANT CONNECT ON DATABASE mydb TO intern;`.
3. `GRANT SELECT ON ALL TABLES IN SCHEMA public TO intern;`.
4. **Test**: Login as intern. Try `DELETE FROM users`. (Access Denied).

### Exercise 2: Implementing RLS

**Goal**: Isolation.

1. `CREATE TABLE chat (id serial, user_name text, msg text)`.
2. `ALTER TABLE chat ENABLE ROW LEVEL SECURITY`.
3. `CREATE POLICY my_chat ON chat USING (user_name = current_user)`.
4. `SET ROLE alice;`
5. `SELECT * FROM chat;` (See only Alice's messages).

### Exercise 3: Encryption

**Goal**: Protect PII.

1. `CREATE EXTENSION pgcrypto`.
2. `INSERT INTO secrets (cc) VALUES (pgp_sym_encrypt('4111-2222', 'my_secret_key'))`.
3. `SELECT pgp_sym_decrypt(cc::bytea, 'my_secret_key') FROM secrets`.

---

## Mastery Check

### Question 1: RLS Visibility

If RLS is enabled but no policy is created, what happens?
A) Everyone sees everything.
B) No one sees anything (Default Deny).
C) The table explodes.
D) Users can see, but not update.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Implicit deny-all is the fail-safe.
</details>

### Question 2: Superuser

Does RLS apply to the `postgres` superuser?
A) Yes.
B) No (Bypasses RLS).
C) Only on Tuesdays.
D) Yes, if configured in `postgresql.conf`.

<details>
<summary>Click for Answer</summary>

**Answer: B**
This is why your App should not run as Superuser.
</details>

### Question 3: Encryption Type

Which function should you use for storing user passwords?
A) `md5`. (Too weak).
B) `pgp_sym_encrypt`. (Reversible - Bad for passwords).
C) `crypt` (Bcrypt). (One-way, salted).
D) `text`.

<details>
<summary>Click for Answer</summary>

**Answer: C**
Store the hash, verify the hash. Never store the password.
</details>

### Question 4: Policy Scope

Can you create different policies for `SELECT` vs `UPDATE`?
A) Yes.
B) No.
C) Only via triggers.
D) Depends on the OS.

<details>
<summary>Click for Answer</summary>

**Answer: A**
You might allow everyone to Read, but only owners to Update.
</details>

### Question 5: Injection

How does `pgcrypto` protect against SQL Injection?
A) It doesn't.
B) It encrypts the injection code.
C) It blocks connection.
D) Encryption is unrelated to Injection.

<details>
<summary>Click for Answer</summary>

**Answer: A** (Trick Question)
Encryption protects data *at rest*. Parameterized queries protect against Injection. Distinct concerns.
</details>

---

## Summary

Today you learned:

* ✅ **RBAC**: Broad door-level access control.
* ✅ **RLS**: Exact row-level visibility rules.
* ✅ **Encryption**: Protecting data even from the DBA.
* ✅ **Principle of Least Privilege**: Never run as root.

**Tomorrow**: We reach the zenith with **Performance Tuning & Optimization**.

---

## 🚨 Escalating Incident Drill Track (Days 97–108)

Use these three drills as a connected simulation sequence. Each drill is intentionally harder than the previous one and must be completed with production-style evidence.

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
