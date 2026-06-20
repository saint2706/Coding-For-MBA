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

### 4. Column-Level Permissions

RBAC doesn't have to be all-or-nothing per table. Postgres supports granting access to *specific columns*, which is the standard mechanism for PII compliance.

* **Syntax**: `GRANT SELECT (id, name, department) ON employees TO hr_role;` — `hr_role` can read those three columns but gets a permission error if it tries to `SELECT salary`.
* **Why it matters**: Many MBA learners will work in environments where salary, SSN, or health data must be hidden from most roles (support staff, BI analysts) while still letting them query the rest of the row for legitimate reporting.
* **Limitation**: Column grants apply per-table; they do not replace RLS — combine both when a role should see only *some rows* and only *some columns* of those rows.

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

> ⚠️ **Pitfall: RLS Bypass via Security Definer Functions**
> A `SECURITY DEFINER` function runs with the *privileges of its owner* (often a superuser or table owner) and **ignores the caller's RLS policies** when it touches tables directly. This is a common, easy-to-miss privilege-escalation vector: a "helper" function meant to simplify a query can quietly punch a hole through every RLS policy on the table it queries.
> **Detection**: Test your RLS policies by connecting as a real non-superuser application role and calling the function — never validate RLS only as the function owner or a superuser, since both bypass RLS by default.
> **Fix**: Either mark the function `SECURITY INVOKER` so it runs with the caller's privileges (and therefore respects RLS), or, if `SECURITY DEFINER` is required, explicitly re-check the tenant/user filter inside the function body.

> ⚠️ **Pitfall: Key Stored Alongside Encrypted Data**
> The most common `pgcrypto` mistake is storing the encryption key in the same database as the ciphertext — for example, in a `config` table or hardcoded in a function body. An attacker who dumps the database via a backup leak or SQL injection gets both the locked box *and* the key to it, making the encryption purely cosmetic.
> **Detection**: Search migrations, seed scripts, and function bodies for literal key strings passed to `pgp_sym_encrypt` / `pgp_sym_decrypt`.
> **Fix**: Keys belong outside the database entirely — in environment variables injected at runtime, or better, a managed secrets store (HashiCorp Vault, AWS KMS, GCP Secret Manager). The application fetches the key at connection time and passes it as a query parameter; it is never persisted in SQL source.

---

## Decision Table: Choosing a Security Mechanism

| Security Concern | Mechanism | When to Use |
|---|---|---|
| Table-level access | `GRANT` / `REVOKE` | Whole roles (e.g., "analysts") should never see a whole table (e.g., `payroll_runs`). |
| Row-level isolation | Row Level Security (RLS) | Multi-tenant SaaS where each tenant/user must see only their own rows in a shared table. |
| Column sensitivity | Column-level `GRANT` | Most of a row is fine to share, but specific columns (salary, SSN) must stay hidden from most roles. |
| Data-at-rest confidentiality | `pgcrypto` (column encryption) | Highly sensitive values (credit card numbers, health data) must be unreadable even to someone with raw table access or a DB dump. |
| Connection confidentiality | TLS/SSL | Data in transit between the app and the database must be protected from network-level eavesdropping (`sslmode=require` or stronger). |

---

## Glossary

| Term | Definition |
|---|---|
| **Row Level Security (RLS)** | A Postgres feature that filters which rows a query can see or modify based on policies evaluated per-row, independent of table-level GRANTs. |
| **Policy (RLS)** | A named rule attached to a table via `CREATE POLICY` defining a `USING`/`WITH CHECK` expression that determines row visibility for a given command and role. |
| **RBAC** | Role-Based Access Control — granting permissions to roles (groups) rather than individual users, then assigning users to roles. |
| **Principle of Least Privilege** | The security design rule that every role/user should have the minimum set of permissions needed to do its job, nothing more. |
| **pgcrypto** | A Postgres extension providing cryptographic functions (hashing, symmetric/asymmetric encryption) usable directly in SQL. |
| **crypt()** | A `pgcrypto` function that computes a salted one-way hash (e.g., bcrypt) of input text — used for password storage. |
| **gen_salt()** | A `pgcrypto` function that generates a random salt for use with `crypt()`, parameterized by algorithm (`'bf'` for bcrypt). |
| **pgp_sym_encrypt** | A `pgcrypto` function performing symmetric (reversible) PGP encryption of a value given a passphrase/key. |
| **pgp_sym_decrypt** | The inverse of `pgp_sym_encrypt` — recovers plaintext given the matching key. |
| **bcrypt** | A slow, salted, one-way hashing algorithm designed specifically for password storage (resistant to brute-force/GPU cracking). |
| **Key Management** | The practice of generating, storing, rotating, and restricting access to cryptographic keys, ideally outside the database itself. |
| **SQL Injection** | An attack where untrusted input is concatenated into SQL text and executed as code rather than data, allowing arbitrary query execution. |
| **Parameterised Query** | A query where user input is passed as a separate bound parameter (not string-concatenated), which is the standard defense against SQL injection. |
| **TLS/SSL** | Transport Layer Security — encrypts the network connection between client and database so credentials and data cannot be sniffed in transit. |

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

> 📦 **Preamble**: `current_user` returns the **Postgres role name**, not an application-level username. The policy below only works if you actually create matching Postgres roles (`alice`, `bob`). In production, you instead pass the application user context via `SET app.current_user_id = 42` in the session and reference `current_setting('app.current_user_id')::int` in the policy — this is the standard multi-tenancy pattern when your app uses one shared DB role for all users.

1. `CREATE EXTENSION pgcrypto;` *(needed later in Exercise 3 — safe to enable early)*.
2. `CREATE TABLE chat (id serial, user_name text, msg text)`.
3. `INSERT INTO chat (id, user_name, msg) VALUES (1, 'alice', 'Hi'), (2, 'bob', 'Hello');`
4. `CREATE ROLE alice LOGIN;` and `CREATE ROLE bob LOGIN;` (so `current_user` has something to match).
5. `ALTER TABLE chat ENABLE ROW LEVEL SECURITY`.
6. `CREATE POLICY my_chat ON chat USING (user_name = current_user)`.
7. `GRANT SELECT ON chat TO alice, bob;`
8. **Before RLS** (as table owner / superuser): `SELECT * FROM chat;` → returns **both** rows (id 1 and 2).
9. **After RLS**: `SET ROLE alice; SELECT * FROM chat;`
10. **Expected result**:

    | id | user_name | msg |
    |---|---|---|
    | 1 | alice | Hi |

    Only Alice's row is visible — Bob's row is silently filtered out, not errored.

### Exercise 3: Encryption

**Goal**: Protect PII.

1. `CREATE EXTENSION pgcrypto;` *(if not already enabled)*.
2. `CREATE TABLE secrets (id serial, cc bytea);`
3. `INSERT INTO secrets (cc) VALUES (pgp_sym_encrypt('4111-2222', 'my_secret_key'));`
4. `SELECT pgp_sym_decrypt(cc::bytea, 'my_secret_key') FROM secrets;`
5. **Expected result**:

    | pgp_sym_decrypt |
    |---|
    | 4111-2222 |

    Querying `SELECT cc FROM secrets` directly (without the key) instead returns unreadable binary ciphertext — proof the data is encrypted at rest.

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

## 🚨 Escalating Incident Drill Track: RLS & Encryption Failures (Day 112)

Use these three drills as a connected simulation sequence specific to today's security theme. Each drill is intentionally harder than the previous one and must be completed with production-style evidence.

### Drill 1 (Severity 2): A new analyst role can see all tenants' data

**Scenario**: A newly onboarded BI analyst, granted `SELECT` on the `orders` table for self-service reporting, reports they can see *every* customer's orders, not just their assigned region's.

**Required outputs**:

1. **Root-cause analysis using query plans and schema objects**
   * Check `SELECT relrowsecurity FROM pg_class WHERE relname = 'orders';` — confirm whether RLS is even enabled on the table.
   * Inspect `pg_policies` for the `orders` table to see if a policy exists and what its `USING` expression filters on.
   * Reproduce the issue by connecting as the analyst's actual role (not as superuser) and running the same report query.
2. **Mitigation patch strategy and rollback criteria**
   * If RLS was never enabled, run `ALTER TABLE orders ENABLE ROW LEVEL SECURITY;` and add a policy filtering on the analyst's assigned region/tenant column.
   * Rollback criteria: stage the policy on a read replica first; if legitimate cross-region reports break, add a `bypassrls`-free "all regions" role with an explicit allow-list policy instead of disabling RLS.
3. **Post-incident report**
   * Quantify exposure (how many cross-tenant rows were visible, for how long, to how many analysts) and add a CI check that asserts `relrowsecurity = true` on every table tagged "tenant-scoped."

### Drill 2 (Severity 1): RLS leak via a SECURITY DEFINER reporting function

**Scenario**: A security scan flags that your RLS-protected `orders` table returns data for other tenants when queried *through* a `get_order_summary()` function, even though direct `SELECT * FROM orders` correctly enforces isolation.

**Required outputs**:

1. **Root-cause analysis using query plans and schema objects**
   * Run `SELECT proname, prosecdef FROM pg_proc WHERE proname = 'get_order_summary';` — `prosecdef = true` confirms it is `SECURITY DEFINER`, which means it executes with the function *owner's* privileges and bypasses the caller's RLS policies.
   * Reproduce the leak: connect as a low-privilege tenant role, call the function, and show it returns rows belonging to other tenants.
2. **Mitigation patch strategy and rollback criteria**
   * Patch by changing the function to `SECURITY INVOKER` if it does not need elevated privileges, or, if `SECURITY DEFINER` is required for a legitimate reason, add an explicit `WHERE tenant_id = current_setting('app.tenant_id')::int` filter inside the function body.
   * Define validation tests proving the function now returns only the calling tenant's rows for every test tenant.
   * Rollback criteria: false-deny rate (legitimate users blocked) must stay at zero before promoting the fix past staging.
3. **Post-incident report**
   * Write a regression test that calls every `SECURITY DEFINER` function in the schema as a low-privilege role and asserts row counts match the RLS-filtered expectation — this single drill is exactly the gap stub scenario this lesson calls out.

### Drill 3 (Severity 1 / Executive Escalation): Encryption key found alongside ciphertext in a breach

**Scenario**: A leaked database backup is discovered on a public S3 bucket. The `secrets.cc` column is `pgp_sym_encrypt`-protected, but the incident responder also finds the encryption key hardcoded in a `seed_secrets.sql` migration file in the same repository as the backup.

**Required outputs**:

1. **Root-cause analysis using query plans and schema objects**
   * Search the codebase and migration history for literal key strings passed to `pgp_sym_encrypt` / `pgp_sym_decrypt` — confirm the Key-Stored-Alongside-Data pitfall.
   * Determine the blast radius: every row encrypted with that key is now effectively plaintext to the attacker.
2. **Mitigation patch strategy and rollback criteria**
   * Rotate the key immediately: decrypt all affected rows with the old key, re-encrypt with a new key sourced from a secrets manager (Vault/KMS), and revoke the old key.
   * Remove the key from source control history (not just the latest commit) and audit all other tables for the same anti-pattern.
   * Rollback criteria: re-encryption must be verified row-by-row (decrypt-with-new-key matches original plaintext) before the old key is destroyed.
3. **Post-incident report**
   * Quantify regulatory exposure (PCI-DSS for card data, breach notification obligations) and add a CI/secret-scanning rule that blocks any commit containing a string literal passed directly into `pgp_sym_encrypt`.
