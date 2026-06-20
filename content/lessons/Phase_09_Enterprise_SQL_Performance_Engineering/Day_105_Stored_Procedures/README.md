---
day: 105
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
* **Solution — prefer `format()` with `%I` over manual `||` concatenation**:

    ```sql
    EXECUTE format('TRUNCATE TABLE %I', table_name);
    ```

* **Why `format()` is the recommended idiom**: `format('...%I...', ident)` is Postgres's purpose-built string-templating function. The `%I` specifier automatically double-quotes and escapes the value as a SQL **identifier** (table/column name), while `%L` does the same for a **literal** value. Manual concatenation with `||` and `quote_ident()` works, but it's easy to forget the call on one of several interpolated values, or to use `quote_ident()` where you meant `quote_literal()`. `format()` makes the intent explicit at the call site and is the idiom you should reach for first in new code.
* **Risk**: SQL Injection if you don't escape interpolated identifiers/values at all — e.g. `EXECUTE 'DROP TABLE ' || table_name` lets an attacker-controlled `table_name` like `users; DROP TABLE orders;--` execute arbitrary SQL.

### 4. Security: Definer vs Invoker

* **SECURITY INVOKER (Default)**: The function runs with the permissions of the user *calling* it.
  * Bob calls `delete_user()`. check if Bob has DELETE rights on `users` table.
* **SECURITY DEFINER**: The function runs with the permissions of the *creator* (usually Admin).
  * Bob calls `sudo_delete_user()`. Logic runs as Admin. Bob deletes the user *even if he has no access to the table*.
  * **Use Case**: Encapsulated Logic. (Bob can delete users ONLY via this function, which logs the action).

### 5. OUT Parameters and `RETURNS TABLE`

Most real-world functions don't print `NOTICE`s — they hand back structured data to the caller. Two common signatures:

* **OUT parameters** — named return values, useful for returning a handful of scalars:

    ```sql
    CREATE OR REPLACE FUNCTION get_employee_stats(emp_id INT, OUT total_orders INT, OUT lifetime_value NUMERIC) AS $$
    BEGIN
        SELECT count(*), COALESCE(SUM(amount), 0)
        INTO total_orders, lifetime_value
        FROM orders WHERE customer_id = emp_id;
    END;
    $$ LANGUAGE plpgsql;

    -- Call it like a query:
    SELECT * FROM get_employee_stats(42);
    ```

* **`RETURNS TABLE`** — the most common production pattern for returning a multi-row result set, since callers can `SELECT * FROM my_function(...)` and treat it like any other table:

    ```sql
    CREATE OR REPLACE FUNCTION top_earners(n INT)
    RETURNS TABLE(emp_name TEXT, salary NUMERIC) AS $$
    BEGIN
        RETURN QUERY
        SELECT name, employees.salary FROM employees ORDER BY employees.salary DESC LIMIT n;
    END;
    $$ LANGUAGE plpgsql;

    SELECT * FROM top_earners(5);
    ```

### 6. Beyond PL/pgSQL: PL/Python and PL/R

PL/pgSQL is excellent for control flow and data manipulation, but it is a poor fit for numeric-heavy or ML-style logic. Postgres supports pluggable procedural languages:

* **PL/Python** (`CREATE EXTENSION plpython3u;`) lets you write functions in Python, with access to libraries like `numpy` or `scikit-learn` running *inside* the database process. Useful for lightweight scoring functions you want colocated with the data.
* **PL/R** is the same idea for R, popular in statistics-heavy shops that already have R model code.
* **Caveat**: both require the language extension to be installed and trusted/untrusted considerations apply (untrusted languages can read the filesystem, so they typically require superuser to install). For anything beyond a small scoring function, prefer doing the heavy computation in the application layer and using the database for storage and filtering.

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

### The Business Cost of DB CPU

Stored procedures own real, billable compute on your most expensive and hardest-to-scale server. A web/app server is stateless and horizontally scalable — spin up 10 more containers for $50/month. A primary database is usually a single scale-up box, and doubling its CPU/RAM tier can cost 3–5x more per vCPU than an equivalent app server. Concretely: a procedure that loops row-by-row through 100,000 orders inside the database (100k round-trips of interpreted PL/pgSQL) can consume 10x the DB CPU-seconds of an equivalent query that returns the result set once and lets the application loop over it in memory. If your database is already CPU-bound at peak, that 10x difference is the difference between a smooth checkout and a multi-second timeout cascade. Rule of thumb: push set-based, single-pass logic into the database (it's good at that); push row-by-row iteration and branching business rules into the app tier (cheaper compute, easier to scale, easier to test).

> ⚠️ Pitfall: Autonomous Transaction Trap
>
> A Postgres **FUNCTION** runs inside the transaction of its caller and **cannot** issue `COMMIT` or `ROLLBACK` mid-execution — there is no "autonomous transaction" escape hatch like some other databases offer. If you try:
>
> ```sql
> CREATE OR REPLACE FUNCTION bad_commit() RETURNS VOID AS $$
> BEGIN
>     INSERT INTO logs VALUES ('step 1');
>     COMMIT; -- This will fail!
> END;
> $$ LANGUAGE plpgsql;
> ```
>
> Calling `SELECT bad_commit();` raises: `ERROR: invalid transaction termination`.
>
> **Fix**: Use a **PROCEDURE** invoked with `CALL`, not a function. Procedures (Postgres 11+) are allowed to `COMMIT`/`ROLLBACK` internally, which is exactly what you need for long-running batch jobs that must persist partial progress:
>
> ```sql
> CREATE OR REPLACE PROCEDURE archive_orders() AS $$
> DECLARE
>     rec RECORD;
>     i INT := 0;
> BEGIN
>     FOR rec IN SELECT id FROM orders WHERE archived = false LOOP
>         UPDATE orders SET archived = true WHERE id = rec.id;
>         i := i + 1;
>         IF i % 10000 = 0 THEN
>             COMMIT; -- Legal inside a PROCEDURE
>         END IF;
>     END LOOP;
> END;
> $$ LANGUAGE plpgsql;
>
> CALL archive_orders();
> ```

---

## Hands-on Lab

### Exercise 1: The Loop

**Goal**: Iterate over rows.

**Task**: Write a function that calculates the "Running Total" of salaries and prints it.

**Seed data**:

```sql
CREATE TABLE employees (id serial, name text, salary numeric);
INSERT INTO employees VALUES (1,'Alice',90000),(2,'Bob',75000);
```

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

SELECT running_total();
```

**Expected result** (console NOTICEs):

```text
NOTICE:  User Alice: Running Total 90000
NOTICE:  User Bob: Running Total 165000
```

### Exercise 2: Safe Insert (Try/Catch)

**Goal**: Handle duplicates silently.

**Seed data**:

```sql
CREATE TABLE users (id int PRIMARY KEY);
```

```sql
CREATE OR REPLACE FUNCTION safe_insert(u_id INT) RETURNS TEXT AS $$
BEGIN
    INSERT INTO users(id) VALUES (u_id);
    RETURN 'Inserted';
EXCEPTION WHEN unique_violation THEN
    RETURN 'Skipped (Duplicate)';
END;
$$ LANGUAGE plpgsql;

SELECT safe_insert(1); -- 'Inserted'
SELECT safe_insert(1); -- 'Skipped (Duplicate)'
```

**Expected result**:

```text
 safe_insert
-------------
 Inserted
(first call)

 safe_insert
-------------
 Skipped (Duplicate)
(second call)
```

### Exercise 3: The Danger Zone (Dynamic SQL)

**Goal**: Drop multiple tables safely.

**Seed data**:

```sql
CREATE TABLE temp_sales (id int);
CREATE TABLE temp_orders (id int);
```

```sql
CREATE OR REPLACE PROCEDURE clean_temp_tables() AS $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN 
        SELECT tablename FROM pg_tables WHERE tablename LIKE 'temp_%'
    LOOP
        EXECUTE format('DROP TABLE %I', tbl);
        RAISE NOTICE 'Dropped %', tbl;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

CALL clean_temp_tables();
```

**Expected result** (console NOTICEs; order may vary):

```text
NOTICE:  Dropped temp_sales
NOTICE:  Dropped temp_orders
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
When a block has no `EXCEPTION` clause, an error propagates upward: the current function/procedure block aborts immediately at the failing statement, and that abort cascades to the *entire enclosing transaction*, which rolls back every change made since the last `COMMIT` — even changes made by other statements earlier in the same transaction that succeeded. The calling application receives the error (e.g., a Python `psycopg2.errors.UniqueViolation`) and must handle it there. Contrast this with wrapping the risky statement in a `BEGIN ... EXCEPTION WHEN ... END;` block: the exception is caught locally, the surrounding transaction is *not* aborted, and execution continues with whatever fallback logic you wrote (like Exercise 2's `RETURN 'Skipped (Duplicate)'`). This is why production procedures almost always wrap individual risky operations in their own exception blocks rather than letting one bad row blow up an entire batch.
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

## Glossary

| Term | Definition |
|---|---|
| **PL/pgSQL** | Postgres's built-in procedural language, adding variables, loops, conditionals, and exception handling to SQL. |
| **SECURITY DEFINER** | A function/procedure attribute that makes it execute with the privileges of the user who *created* it, not the caller — used for controlled privilege escalation ("sudo" pattern). |
| **SECURITY INVOKER** | The default attribute: the function executes with the privileges of the user who *calls* it. |
| **Dynamic SQL** | SQL statements built and executed as strings at runtime (via `EXECUTE`), typically because the table/column name is a variable. |
| **Exception Block** | A `BEGIN ... EXCEPTION WHEN condition THEN ... END;` block that catches a runtime error locally instead of letting it abort the transaction. |
| **quote_ident** | A function that safely double-quotes and escapes a string for use as a SQL identifier (table/column name), preventing injection via crafted names. |
| **quote_literal** | A function that safely quotes and escapes a string for use as a SQL literal value. `format()`'s `%L` specifier does this automatically. |
| **Savepoint** | A named point inside a transaction you can roll back to without discarding the whole transaction (`SAVEPOINT x; ... ROLLBACK TO x;`). |
| **Autonomous Transaction** | A sub-transaction that can commit/rollback independently of its parent — **not supported** by Postgres functions; this is why `COMMIT` inside a `FUNCTION` fails (see the Pitfall above). |

---

## Summary

Today you learned:

* ✅ **PL/pgSQL**: The imperative programming language inside Postgres.
* ✅ **Exceptions**: Graceful error recovery in SQL.
* ✅ **Dynamic SQL**: Writing meta-code with `EXECUTE format(...)`.
* ✅ **Security Definer**: Creating privileged wrappers for sensitive actions.
* ✅ **OUT parameters / RETURNS TABLE**: Returning structured, multi-row results from functions.

**Tomorrow**: We automate the database with **Triggers & Events**.

---

## 🚨 Escalating Incident Drill Track (Days 105–107: Procedures → Triggers → Recursion)

This lesson's drill track follows one storyline across Days 105–107: a midnight batch job (today) that gets re-implemented as a trigger (Day 106), whose audit logic then needs a recursive rollup query (Day 107). Each drill below is scoped to *this* lesson's tools — stored procedures, COMMIT batching, and `pg_stat_activity`.

### Drill 1 (Severity 2): The runaway archiving procedure

**Scenario**: A stored procedure that archives orders older than 2 years (`CALL archive_old_orders();`) was kicked off at midnight as part of a deployment. It is now 6 AM, the procedure is still "running," and the `orders` table is showing lock waits that are delaying the morning batch of customer-facing order-status queries.

**Required outputs**:

1. **Root-cause analysis using query plans and schema objects**
   * Query `pg_stat_activity WHERE state = 'active'` to confirm the procedure's backend PID, current wait event, and `query_start` (calculate elapsed runtime).
   * Check `pg_locks` joined to `pg_stat_activity` to see whether the procedure holds a long-running row lock or table lock blocking other sessions.
   * Inspect the procedure body: does it `COMMIT` periodically, or is it one giant transaction holding locks and accumulating undeletable dead tuples for 6 hours?
2. **Mitigation patch strategy and rollback criteria**
   * Patch the procedure to `COMMIT` every 10,000 rows (per the Autonomous Transaction Trap fix above), so partial progress survives a cancel and locks are released incrementally.
   * Define a safe cancel procedure (`SELECT pg_cancel_backend(pid)`) and confirm it does not leave a half-archived inconsistent state (idempotency check: re-running the procedure should skip already-archived rows).
   * Rollback criteria: if lock wait time for customer queries exceeds 500ms p95, kill and reschedule the procedure for an off-peak window with smaller batch sizes.
3. **Post-incident report**
   * Summarize business impact (delayed order-status pages, support ticket volume during the lock window).
   * Document prevention controls (mandatory `COMMIT` batching standard for any procedure touching >10k rows, pre-deployment row-count estimate review).
   * Add monitoring updates (alert on any single backend with `query_start` older than 15 minutes against a production table).

### Drill 2 (Severity 1): A SECURITY DEFINER procedure leaks privilege

**Scenario**: A `SECURITY DEFINER` procedure (`reset_password()`) intended to let support agents reset a customer's password without `UPDATE` rights on `users` is discovered being called with crafted input that updates *other* columns — an agent used it to grant themselves admin rights.

**Required outputs**:

1. **Root-cause analysis using query plans and schema objects**
   * Read the procedure source via `\df+ reset_password` / `pg_proc.prosrc` and confirm whether it builds dynamic SQL by concatenating caller-supplied column names instead of hardcoding the `password_hash` column.
   * Check `pg_proc.prosecdef` to confirm `SECURITY DEFINER` is set and identify the function owner's full privilege set (everything the exploit inherited).
   * Reproduce the exploit end-to-end with a least-privilege test role to prove the leak.
2. **Mitigation patch strategy and rollback criteria**
   * Patch the procedure to hardcode the target column (no dynamic identifier from user input) and add `quote_literal`/parameter binding for any remaining dynamic value.
   * Add an explicit allow-list check inside the procedure (`IF target_col NOT IN ('password_hash') THEN RAISE EXCEPTION ...`) as defense-in-depth.
   * Rollback criteria: any regression in legitimate password-reset latency or failure rate triggers immediate revert to the previous procedure version pinned by migration hash.
3. **Post-incident report**
   * Summarize business impact (scope of unauthorized privilege grant, accounts affected, time-to-detection).
   * Document prevention controls (mandatory code review checklist item: "does this SECURITY DEFINER function interpolate any caller-controlled identifier?").
   * Add monitoring updates (alert on `GRANT`/role-membership changes executed by non-admin-owned functions).

### Drill 3 (Severity 1 / Executive Escalation): Archiving procedure double-counts revenue

**Scenario**: The midnight archiving procedure from Drill 1 was patched to `COMMIT` every 10,000 rows — but a bug in the batching logic re-processes the last partial batch after a crash-restart, double-archiving (and double-counting in a downstream revenue rollup) roughly 4,000 orders before finance catches the discrepancy in month-end reconciliation.

**Required outputs**:

1. **Root-cause analysis using query plans and schema objects**
   * Diff the procedure's batching logic against the patched version; trace whether the `WHERE archived = false` predicate was evaluated once per loop start (stale) instead of per-row, causing already-archived rows to be reprocessed after a restart.
   * Use `pg_proc.prosrc` and deployment logs to identify exactly which migration introduced the batching change.
   * Build a minimal reproducible dataset (a few hundred rows, a forced restart mid-batch) proving the double-count.
2. **Mitigation patch strategy and rollback criteria**
   * Deliver a hotfix making the procedure idempotent (e.g., an `archived_at` timestamp check, or `ON CONFLICT DO NOTHING` on the archive insert) plus a backfill/reconciliation script that nets out the duplicate rows.
   * Freeze further archiving runs until the reconciliation script confirms ledger parity.
   * Rollback criteria: any reconciliation delta beyond a defined cent-level tolerance blocks re-enabling the nightly job.
3. **Post-incident report**
   * Summarize business impact (misstated revenue in month-end close, finance team hours spent reconciling, executive communication timeline).
   * Document prevention controls (idempotency requirement for all batch procedures, mandatory restart/crash testing in staging before deploying any `COMMIT`-batched procedure).
   * Add monitoring updates (ledger-vs-fact drift alarm comparing `orders.archived` counts against the finance revenue rollup nightly).
