---
day: 100
title: "Advanced Stored Procedures"
phase: 9
phaseTitle: "Enterprise SQL Performance Engineering"
slug: "stored-procedures"
duration: 120
difficulty: "advanced"
tags:
  - plpgsql
  - dynamic-sql
  - security-definer
  - error-handling
concepts:
  - "PL/pgSQL Control Structures (Loops, If)"
  - "Exception Handling (Try/Catch in SQL)"
  - "Dynamic SQL (EXECUTE format)"
  - "Security Definer vs Invoker"
prerequisites:
  - "Basic Functions (Day 92)"
outcomes:
  - "Write a procedure that loops through tables and truncates them"
  - "Handle a Unique Constraint violation gracefully"
  - "Create a 'Sudo' function using Security Definer"
---

# 🎯 Day 100: Advanced Stored Procedures

> *"SQL is declarative (What). PL/pgSQL is imperative (How). Sometimes you need to take the wheel."*

---

## The "Never-Coded" Bridge

**The Vending Machine Repair**

* **SQL (User)**: "Select Snickers." (Input -> Output).
* **Stored Procedure (Technician)**:
    1. Open door.
    2. **IF** coil is jammed **THEN** unjam it.
    3. **ELSE** refill row E5.
    4. **LOOP** through all rows and check prices.
    5. Close door.

**Key Difference**: Procedures have **Control Flow** (If/Else, Loops) and can manage **Transactions** (Commit/Rollback halfway through).

---

## The Technical Deep Dive

### 1. PL/pgSQL Control Structures

* **Variables**: `DECLARE total integer := 0;`
* **Loops**:

    ```sql
    FOR row IN SELECT * FROM users LOOP
        -- Do something
    END LOOP;
    ```

* **Conditionals**: `IF x > 10 THEN ... END IF;`

### 2. Exception Handling

How to catch errors without crashing the whole script.

* **Block**:

    ```sql
    BEGIN
        INSERT INTO users VALUES (1);
    EXCEPTION WHEN unique_violation THEN
        -- Handle bug
        RAISE NOTICE 'User already exists';
    END;
    ```

### 3. Dynamic SQL (`EXECUTE`)

Writing SQL that writes SQL.

* **Scenario**: "Truncate all tables that start with `test_`."
* **Problem**: You can't write `TRUNCATE variable_name`.
* **Solution**:

    ```sql
    EXECUTE 'TRUNCATE TABLE ' || quote_ident(table_name);
    ```

* **Risk**: SQL Injection if you don't use `quote_*` functions.

### 4. Security: Definer vs Invoker

* **SECURITY INVOKER (Default)**: The function runs with the permissions of the user *calling* it.
  * Bob calls `delete_user()`. check if Bob has DELETE rights on `users` table.
* **SECURITY DEFINER**: The function runs with the permissions of the *creator* (usually Admin).
  * Bob calls `sudo_delete_user()`. Logic runs as Admin. Bob deletes the user *even if he has no access to the table*.
  * **Use Case**: Encapsulated Logic. (Bob can delete users ONLY via this function, which logs the action).

---

## Senior-Level Insights

### The "Logic in DB" Debate: The Final Word

* **Pro-Procedure**:
  * **Performance**: Saves network round-trips. (1 Call vs 1000 Calls in a loop).
  * **Consistency**: The logic is identical whether called from Python, Java, or CLI.
* **Anti-Procedure**:
  * **Debugging**: Harder to step-through debug than Python.
  * **Scaling**: DB CPU is expensive/hard to scale. App Server CPU is cheap.
  * **Version Control**: Harder to manage migrations.
* **Verdict**: Use Procedures for **Data Maintenance** (Archiving, Partitioning). Use App Code for **Business Logic** (Pricing, Rules).

---

## Hands-on Lab

### Exercise 1: The Loop

**Goal**: Iterate over rows.

**Task**: Write a function that calculates the "Running Total" of salaries and prints it.

```sql
CREATE OR REPLACE FUNCTION running_total() RETURNS VOID AS $$
DECLARE
    rec RECORD;
    sum NUMERIC := 0;
BEGIN
    FOR rec IN SELECT name, salary FROM employees ORDER BY id LOOP
        sum := sum + rec.salary;
        RAISE NOTICE 'User %: Running Total %', rec.name, sum;
    END LOOP;
END;
$$ LANGUAGE plpgsql;
```

### Exercise 2: Safe Insert (Try/Catch)

**Goal**: Handle duplicates silently.

```sql
CREATE OR REPLACE FUNCTION safe_insert(u_id INT) RETURNS TEXT AS $$
BEGIN
    INSERT INTO users(id) VALUES (u_id);
    RETURN 'Inserted';
EXCEPTION WHEN unique_violation THEN
    RETURN 'Skipped (Duplicate)';
END;
$$ LANGUAGE plpgsql;
```

### Exercise 3: The Danger Zone (Dynamic SQL)

**Goal**: Drop multiple tables safely.

```sql
CREATE OR REPLACE PROCEDURE clean_temp_tables() AS $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN 
        SELECT tablename FROM pg_tables WHERE tablename LIKE 'temp_%'
    LOOP
        EXECUTE 'DROP TABLE ' || quote_ident(tbl);
        RAISE NOTICE 'Dropped %', tbl;
    END LOOP;
END;
$$ LANGUAGE plpgsql;
```

---

## Mastery Check

### Question 1: Security

If I want a Junior Analyst to be able to "Reset Passwords" (UPDATE users table) without giving them `UPDATE` permission on the table, what do I do?
A) Give them the root password.
B) Create a `SECURITY DEFINER` function `reset_password()` owned by Admin, and grant EXECUTE to the Analyst.
C) Create a `SECURITY INVOKER` function.
D) It's impossible.

<details>
<summary>Click for Answer</summary>

**Answer: B**
This is the "Sudo" pattern in SQL.
</details>

### Question 2: Dynamic SQL

Why must you use `quote_ident()` in `EXECUTE` strings?
A) To make it look pretty.
B) To prevent SQL Injection (e.g., if a table is named `users; DROP TABLE orders;`).
C) To uppercase it.
D) It is optional.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Essential for security.
</details>

### Question 3: Exception

What happens if an error occurs inside a block **without** an Exception clause?
A) It is ignored.
B) The function aborts and the *entire transaction* rolls back.
C) It prints a warning but commits.
D) The server explodes.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Unhandled exceptions are fatal to the transaction.
</details>

### Question 4: Logic Placement

Why might a Senior Engineer reject a PR that puts generic JSON parsing logic in a Stored Procedure?
A) SQL is better at JSON than Python.
B) Database CPU is a precious bottleneck resource; JSON parsing is CPU heavy and better done in the App Layer.
C) They hate SQL.
D) It's illegal.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Scale-out Application Servers vs Scale-up Database.
</details>

### Question 5: Loop

Can you use `COMMIT` inside a `FOR` loop in a **Function**?
A) Yes.
B) No, functions run inside a single transaction. You must use a **Procedure** (`CALL`) to manage transactions.
C) Only on Tuesdays.
D) Yes, if you ask nicely.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Key difference introduced in Postgres 11.
</details>

---

## Summary

Today you learned:

* ✅ **PL/pgSQL**: The imperative programming language inside Postgres.
* ✅ **Exceptions**: Graceful error recovery in SQL.
* ✅ **Dynamic SQL**: Writing meta-code with `EXECUTE`.
* ✅ **Security Definer**: Creating privileged wrappers for sensitive actions.

**Tomorrow**: We automate the database with **Triggers & Events**.

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

