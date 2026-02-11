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

*   **SQL (User)**: "Select Snickers." (Input -> Output).
*   **Stored Procedure (Technician)**:
    1.  Open door.
    2.  **IF** coil is jammed **THEN** unjam it.
    3.  **ELSE** refill row E5.
    4.  **LOOP** through all rows and check prices.
    5.  Close door.

**Key Difference**: Procedures have **Control Flow** (If/Else, Loops) and can manage **Transactions** (Commit/Rollback halfway through).

---

## The Technical Deep Dive

### 1. PL/pgSQL Control Structures

*   **Variables**: `DECLARE total integer := 0;`
*   **Loops**:
    ```sql
    FOR row IN SELECT * FROM users LOOP
        -- Do something
    END LOOP;
    ```
*   **Conditionals**: `IF x > 10 THEN ... END IF;`

### 2. Exception Handling

How to catch errors without crashing the whole script.
*   **Block**:
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
*   **Scenario**: "Truncate all tables that start with `test_`."
*   **Problem**: You can't write `TRUNCATE variable_name`.
*   **Solution**:
    ```sql
    EXECUTE 'TRUNCATE TABLE ' || quote_ident(table_name);
    ```
*   **Risk**: SQL Injection if you don't use `quote_*` functions.

### 4. Security: Definer vs Invoker

*   **SECURITY INVOKER (Default)**: The function runs with the permissions of the user *calling* it.
    *   Bob calls `delete_user()`. check if Bob has DELETE rights on `users` table.
*   **SECURITY DEFINER**: The function runs with the permissions of the *creator* (usually Admin).
    *   Bob calls `sudo_delete_user()`. Logic runs as Admin. Bob deletes the user *even if he has no access to the table*.
    *   **Use Case**: Encapsulated Logic. (Bob can delete users ONLY via this function, which logs the action).

---

## Senior-Level Insights

### The "Logic in DB" Debate: The Final Word

*   **Pro-Procedure**:
    *   **Performance**: Saves network round-trips. (1 Call vs 1000 Calls in a loop).
    *   **Consistency**: The logic is identical whether called from Python, Java, or CLI.
*   **Anti-Procedure**:
    *   **Debugging**: Harder to step-through debug than Python.
    *   **Scaling**: DB CPU is expensive/hard to scale. App Server CPU is cheap.
    *   **Version Control**: Harder to manage migrations.
*   **Verdict**: Use Procedures for **Data Maintenance** (Archiving, Partitioning). Use App Code for **Business Logic** (Pricing, Rules).

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
*   ✅ **PL/pgSQL**: The imperative programming language inside Postgres.
*   ✅ **Exceptions**: Graceful error recovery in SQL.
*   ✅ **Dynamic SQL**: Writing meta-code with `EXECUTE`.
*   ✅ **Security Definer**: Creating privileged wrappers for sensitive actions.

**Tomorrow**: We automate the database with **Triggers & Events**.
