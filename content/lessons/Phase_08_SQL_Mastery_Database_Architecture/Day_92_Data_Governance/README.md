---
day: 92
title: "Technical Data Governance & Security"
phase: 8
phaseTitle: "SQL Mastery & Database Architecture"
slug: "data-security"
duration: 120
difficulty: "advanced"
tags:
  - rls
  - gdpr
  - role-based-access
  - masking
concepts:
  - "Row Level Security (RLS) Implementation"
  - "Dynamic Data Masking (PII)"
  - "Right to be Forgotten (GDPR Delete)"
  - "Role Based Access Control (RBAC)"
prerequisites:
  - "SQL SELECT (Day 73)"
  - "Basic Security Concepts (Authentication vs Authorization)"
outcomes:
  - "Write an RLS Policy in SQL"
  - "Mask Credit Card numbers dynamically"
  - "Design a 'Safe Delete' pattern for compliance"
---

# 🎯 Day 87: Technical Data Governance & Security

> *"Security is not a feature; it's a constraint. You can be fast, correct, and insecure... until you are hacked. Then you are nothing."*

---

## Prerequisites & Recommended Order

**This lesson assumes you can already create schemas, views, and safely modify data** — capabilities this phase formally teaches at *higher* day numbers than this one:

| If you are unfamiliar with... | Read this first |
| --- | --- |
| `CREATE SCHEMA`, `CREATE VIEW`, granting/revoking on schemas | **Day 97 — Advanced DDL & Schema** |
| Safe `UPDATE`/`DELETE` patterns, transactions, upserts | **Day 98 — Advanced DML & Upserts** |
| Tables, keys, and how a database executes a query | **Day 96 — Relational Database Internals** |

The directory stays at Day 92; this is a pointer, not a reorder. The RLS and GDPR-deletion exercises below create views and run `UPDATE`s — if those constructs are unfamiliar, skim Day 97 and Day 98 first.

---

## The "Never-Coded" Bridge

**The Office Badge**

1. **Authentication**: The guard checks your ID. "Are you Bob?" (Yes/No).
2. **Authorization (RBAC)**: You have a "Marketing" badge.
    * You can open the "Marketing" door.
    * You *cannot* open the "Server Room" door.
3. **Row Level Security (RLS)**:
    * Inside the Marketing room, there are filing cabinets for "North" and "South".
    * Bob handles "North". The "South" cabinet is **invisible** to him, even though he is in the room.

**Data Security** applies these layers to SQL tables.

---

## The Technical Deep Dive

> **Dialect note**: every concrete query below targets **PostgreSQL 14+**. `CREATE POLICY ... USING (...)` is real PostgreSQL native Row Level Security syntax (available since Postgres 9.5); `current_user_region()` and `session_user_id()` are illustrative placeholder function names you would define yourself (e.g., as a `SECURITY DEFINER` function reading from a session variable or a session-to-role mapping table) — they are not built-in Postgres functions.

### 0. Foundational Concepts

Before the mechanics, the vocabulary needs to be precise, because these terms are often used interchangeably in casual conversation but mean different things to an auditor or a regulator:

| Term | Definition | Reversible? |
| --- | --- | --- |
| **PII (Personally Identifiable Information)** | Any data that can identify a specific natural person, alone or combined with other data (name, email, exact birthdate + zip, biometric data, sometimes IP address depending on jurisdiction). | N/A |
| **Authentication** | Confirming *who* is making the request ("are you Bob?"). | N/A |
| **Authorization** | Confirming *what* an authenticated identity is allowed to do (RBAC: which tables/actions). | N/A |
| **Masking** | Altering how data is *displayed* to unauthorized viewers without changing the stored value. | Yes — the underlying value is untouched; masking is a display-time transform. |
| **Tokenization** | Replacing a sensitive value with a non-sensitive substitute ("token") that maps back to the original via a separate, tightly-controlled lookup table/vault. | Yes, but only by someone with access to the token vault. |
| **Hashing** | A one-way mathematical function producing a fixed-length output from input; the same input always hashes the same way, but you cannot derive the input from the hash. | No (by design) — but a hash is *not* anonymous if the input space is small/guessable (e.g., hashing a 4-digit PIN is crackable by brute force). |
| **Encryption** | Reversibly transforming data using a key, such that anyone holding the correct key can decrypt it back to the original. | Yes, with the key. |
| **Anonymization** | Irreversibly altering data so the original individual **cannot** be re-identified, even by the data controller, even with auxiliary information. | No — and this is precisely why GDPR treats truly anonymized data as outside its scope, while pseudonymized data remains in scope. |
| **Pseudonymization** | Replacing identifying fields with an artificial identifier, where re-identification *is* still possible using additional information held separately (e.g., a lookup table). | Yes — this is the GDPR-defined middle ground between raw PII and true anonymization, and it is *still regulated personal data* under GDPR because re-identification remains possible. |
| **Referential integrity** | The guarantee that a foreign key value in one table always corresponds to an existing primary key value in another table — e.g., every `transactions.user_id` must match a real `users.id`. | N/A |

**When each control is appropriate**: use *masking* when authorized users (support staff, app backend) sometimes need the real value and unauthorized viewers (analysts, dashboards) don't; use *tokenization* when you need to let analytics join/group on a stable substitute value without exposing the real one, and you might need to reverse it later (e.g., for a fraud investigation); use *hashing* when you need a stable, irreversible join key and never need the original back; use *encryption* when data must be stored securely but a legitimate process needs the real value back; use *anonymization* only when you are certain you will never need to re-identify the individual again (research datasets, deleted-user records you must retain in aggregate); use *pseudonymization* when you need to retain the ability to re-identify under controlled conditions (most "GDPR-compliant" production systems use pseudonymization, not true anonymization, because the business still needs to operate on the data).

### 1. Row Level Security (RLS)

Typically implemented via **native RLS policies** or, as a weaker substitute, **views**.

* **The Policy** (PostgreSQL native RLS): `CREATE POLICY regional_policy ON sales USING (region = current_user_region())`.
* **The Magic**: When Bob (`region='North'`) runs `SELECT * FROM sales`, the database *silently* adds `WHERE region = 'North'` to his query.
* **Result**: He sees 100 rows. Alice (`South`) sees 50 rows. The CEO (`All`) sees 150 rows.
* **Why a view is not equivalent to native RLS in all threat models**: a view-based restriction (`CREATE VIEW my_team AS SELECT ... WHERE ...`) only protects users who are *forced* to query through the view and have no direct grant on the underlying table. If Bob is mistakenly (or by design, for some other workflow) also granted `SELECT` on the raw `employees` table, he can simply query the base table directly and bypass the view entirely — the view enforces nothing at the table level. Native RLS (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY` plus `CREATE POLICY`) is enforced by the database engine on the table itself, regardless of which object the query goes through, so it survives even if a user also has raw table grants — *except* it still does **not** protect against table owners or roles with `BYPASSRLS` (see Pitfalls).

### 2. Dynamic Data Masking

Protecting PII without breaking applications, using the masking concept defined above.

* **Column**: `credit_card_number` (`1234-5678-9012-3456`).
* **Masking Rule**: `mask_inner_digits(credit_card_number)` — illustrative; Postgres has no single built-in masking function, so this is typically implemented as a `SECURITY INVOKER` view column expression or via an extension (e.g., `pg_anon` family of tools), not a core keyword.
* **Analyst View**: `1234-XXXX-XXXX-3456`.
* **App View**: `1234-5678-9012-3456` (If authorized to charge card).
* **Why?**: Analysts can join/group by the card (using a hash of the card number, not the masked display string) without seeing the raw number.

### 3. The "Right to be Forgotten" (GDPR) — Deletion, Anonymization, and What Actually Has to Happen

GDPR's Article 17 "right to erasure" is frequently summarized as "just delete a key and you're done." That is an oversimplification with real compliance risk. A complete picture distinguishes several related-but-different obligations:

* **Deletion**: physically removing a record. Straightforward for a single live database row, but a transaction-history table may have *legal retention requirements* (tax law, AML/KYC regulations) that **override** the erasure request for specific fields — this is why GDPR Article 17(3) explicitly allows refusing erasure where retention is required by law.
* **Anonymization**: irreversibly stripping identity such that the record can no longer be linked to the person — once truly anonymized, the data falls outside GDPR's scope entirely (it's no longer "personal data"), and you can retain it indefinitely (e.g., for aggregate trend analysis).
* **Pseudonymization**: keeping a reversible link (e.g., via a key you could use to re-identify) — this does **not** satisfy "right to be forgotten" on its own, because the data is still personal data under GDPR as long as re-identification is possible by anyone, including via a securely stored key.
* **Legal retention vs. backups vs. key lifecycle**: a common real architecture combines all three:
  1. Live production tables: delete or anonymize the row immediately.
  2. Append-only ledgers/transactions kept for tax/audit law: pseudonymize the PII fields, keep the financial facts (this satisfies both the law and the spirit of erasure for the parts that aren't legally mandated).
  3. Backups: this is where **crypto-shredding** is genuinely useful — encrypt each user's PII (or a partition/shard of users) with a per-user or per-tenant key, store keys in a centralized vault, and "delete" by destroying the key. Once the key is gone, any *future restore* of an old backup containing that user's encrypted PII restores only ciphertext, which is unreadable without the (now-destroyed) key.
* **Qualifying "no need to find every backup tape"**: crypto-shredding makes backup-resident PII *cryptographically unreadable*, which is a real and valuable property — but it is **not** a complete substitute for governance process. You still need: (a) **evidence of erasure** — a logged, timestamped record showing which key was destroyed, when, and for which subject, because regulators and auditors expect documented proof, not just an engineering claim; (b) a written **retention/destruction policy** describing how long encrypted-but-undeleted backups are kept before the underlying backup files are themselves purged (crypto-shredding does not delete the encrypted bytes — they remain on disk as unreadable garbage indefinitely unless your retention policy also purges the backup files eventually); and (c) confirmation that the *key vault itself* isn't backed up in a way that could resurrect a "deleted" key. Treat crypto-shredding as solving the "I can't realistically scrub 50 backup tapes by hand" problem, not as eliminating the need for a documented, auditable deletion process.

---

## Senior-Level Insights

### The "Least Privilege" Principle

* **Junior**: "Give me Admin access so I don't get Permission Denied errors."
* **Senior**: "Give me Read-Only access to *only* the tables I need."
* **Why?**: If your laptop is stolen/hacked, the damage is limited. The Admin account is the "Crown Jewel."

### Audit Logs are your Alibi

* **Scenario**: A sensitive VIP customer list was leaked to the press.
* **Question**: "Who queried the `vip_users` table last week?"
* **The Log**: "Bob queried `SELECT *` at 3 AM on Saturday."
* **Result**: Bob is in trouble. (Or Bob's account was hacked).
* *Action*: Enable Audit Logging on all sensitive tables.

---

## Hands-on Lab

All exercises target **PostgreSQL 14+**. Run the setup block once, then the per-role test sessions.

### Shared Setup: Schemas, Roles, and Seed Data

```sql
-- Dialect: PostgreSQL 14+
CREATE SCHEMA raw_schema;   -- contains PII, restricted
CREATE SCHEMA prod_schema;  -- cleaned/curated, broader access

CREATE TABLE raw_schema.employees (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    manager_id INTEGER REFERENCES raw_schema.employees(id),
    region TEXT NOT NULL,
    salary NUMERIC(10,2) NOT NULL
);

INSERT INTO raw_schema.employees (id, name, email, manager_id, region, salary) VALUES
    (1, 'Carla CEO',  'carla@corp.com',  NULL, 'ALL',   250000),
    (2, 'Bob VP',     'bob@corp.com',    1,    'North', 180000),
    (3, 'Alice VP',   'alice@corp.com',  1,    'South', 175000),
    (4, 'Dan Report', 'dan@corp.com',    2,    'North', 95000),
    (5, 'Eve Report', 'eve@corp.com',    2,    'North', 92000),
    (6, 'Fay Report', 'fay@corp.com',    3,    'South', 90000);

-- Roles (login roles, simplified for a single-machine lab)
CREATE ROLE data_engineer LOGIN PASSWORD 'lab_only';
CREATE ROLE analyst LOGIN PASSWORD 'lab_only';
CREATE ROLE reporting_bot LOGIN PASSWORD 'lab_only';

GRANT USAGE, CREATE ON SCHEMA raw_schema, prod_schema TO data_engineer;
GRANT ALL ON ALL TABLES IN SCHEMA raw_schema, prod_schema TO data_engineer;

GRANT USAGE ON SCHEMA prod_schema TO analyst;
REVOKE ALL ON SCHEMA raw_schema FROM analyst;  -- explicit: analyst has NO ACCESS to raw_schema

-- Minimal audit log table (stand-in for a real audit extension like pgAudit)
CREATE TABLE prod_schema.query_audit_log (
    id SERIAL PRIMARY KEY,
    db_user TEXT NOT NULL,
    action TEXT NOT NULL,
    target_table TEXT NOT NULL,
    row_count INTEGER,
    logged_at TIMESTAMP DEFAULT now()
);
```

### Exercise 1: Designing Roles (RBAC)

**Goal**: Verify that `analyst` truly cannot read `raw_schema`, while `data_engineer` can.

**Roles**:

1. **Data Engineer**: `READ/WRITE` on `raw_schema`, `READ/WRITE` on `prod_schema`.
2. **Analyst**: `READ` on `prod_schema` only. `NO ACCESS` to `raw_schema` (contains PII).
3. **Reporting Bot**: `READ` on a single curated view only (built in Exercise 2).

**Test as `analyst`** (`psql -U analyst -d lab_db`):

```sql
SELECT * FROM raw_schema.employees;
```

**Expected denied-operation output**:

```
ERROR:  permission denied for schema raw_schema
```

**Test as `data_engineer`**:

```sql
SELECT count(*) FROM raw_schema.employees;
```

**Expected visible-row output**: `count = 6` (full table — `data_engineer` has unrestricted access by design).

**Audit-log verification step**: in a real deployment with `pgAudit` or equivalent enabled, both attempts — the denied `analyst` query and the successful `data_engineer` query — appear in the server/audit log with the session user, statement, and outcome. For this lab, manually insert the equivalent audit rows to practice the pattern:

```sql
INSERT INTO prod_schema.query_audit_log (db_user, action, target_table, row_count) VALUES
    ('analyst', 'SELECT (DENIED)', 'raw_schema.employees', NULL),
    ('data_engineer', 'SELECT', 'raw_schema.employees', 6);
```

### Exercise 2: Implementing RLS

**Goal**: Let each manager see only themselves and their direct reports — and prove a view-based approach can be bypassed, then fix it with native RLS.

**Step 1 — the view-based approach (weaker)**:

```sql
CREATE VIEW prod_schema.my_team AS
SELECT id, name, manager_id, region
FROM raw_schema.employees
WHERE id = current_setting('app.current_user_id')::int
   OR manager_id = current_setting('app.current_user_id')::int;

GRANT SELECT ON prod_schema.my_team TO analyst;
```

`current_setting('app.current_user_id')` reads a session variable your application sets after authenticating the user (Postgres has no built-in "logged-in employee ID" concept — `session_user_id()` in earlier drafts of this lesson was illustrative, not a real Postgres function). Set it per session with `SET app.current_user_id = '2';`.

**Test as Bob (id=2)**:

```sql
SET app.current_user_id = '2';
SELECT * FROM prod_schema.my_team;
```

**Expected visible rows** (3 rows — Bob himself, plus his two direct reports Dan and Eve):

| id | name      | manager_id | region |
| -- | --------- | ---------- | ------ |
| 2  | Bob VP    | 1          | North  |
| 4  | Dan Report| 2          | North  |
| 5  | Eve Report| 2          | North  |

**The bypass**: if `analyst` also has `GRANT SELECT ON raw_schema.employees` (e.g., granted by mistake, or left over from a prior project), Bob can simply run `SELECT * FROM raw_schema.employees` directly and see all 6 rows, completely bypassing `my_team`'s filter — the view enforces nothing at the table level.

**Step 2 — native RLS (correct fix)**:

```sql
ALTER TABLE raw_schema.employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY manager_team_policy ON raw_schema.employees
    USING (
        id = current_setting('app.current_user_id')::int
        OR manager_id = current_setting('app.current_user_id')::int
    );

GRANT SELECT ON raw_schema.employees TO analyst;
```

**Test as Bob again, now querying the base table directly**:

```sql
SET app.current_user_id = '2';
SELECT * FROM raw_schema.employees;
```

**Expected visible rows**: identical 3-row result as the view above (Bob, Dan, Eve) — because the policy is enforced by Postgres on the table itself, regardless of whether the query goes through `my_team` or hits `raw_schema.employees` directly. This closes the bypass exercise 2's first step demonstrated.

**Audit-log verification**: insert a row recording that Bob's session (`app.current_user_id = 2`) ran a `SELECT` against `raw_schema.employees` and received 3 rows — confirming the row count differs from the unrestricted `data_engineer` count of 6 captured in Exercise 1.

```sql
INSERT INTO prod_schema.query_audit_log (db_user, action, target_table, row_count) VALUES
    ('analyst (as employee 2)', 'SELECT', 'raw_schema.employees', 3);
```

### Exercise 3: GDPR Deletion

**Goal**: Implement and verify a deletion request for employee Fay (id=6) that satisfies "right to be forgotten" while preserving referential integrity with a related `payroll_runs` table that must be retained for tax law.

**Additional setup**:

```sql
CREATE TABLE prod_schema.payroll_runs (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES raw_schema.employees(id),
    pay_period DATE NOT NULL,
    amount NUMERIC(10,2) NOT NULL
);

INSERT INTO prod_schema.payroll_runs (employee_id, pay_period, amount) VALUES
    (6, '2024-01-01', 7500.00),
    (6, '2024-02-01', 7500.00);
```

**Constraint**: you must remove Fay's `name`/`email` (PII), but `payroll_runs.amount` must be retained for tax reporting — a legal-retention case where full deletion is not permitted for the financial facts, only for the identity fields.

**Action (anonymization, not deletion, to preserve referential integrity)**:

```sql
UPDATE raw_schema.employees
SET name = 'REDACTED-6', email = 'redacted-6@deleted.invalid'
WHERE id = 6;
```

**Why `id = 6` is kept**: deleting the row entirely (`DELETE FROM raw_schema.employees WHERE id = 6`) would either fail (the `FOREIGN KEY` from `payroll_runs.employee_id` blocks it under the default `ON DELETE NO ACTION`) or, if the FK were `ON DELETE CASCADE`, would destroy the payroll history you are legally required to keep. Keeping `id = 6` with anonymized name/email preserves the join `payroll_runs.employee_id -> employees.id` (referential integrity) while satisfying erasure for the identifying fields.

**Verification query**:

```sql
SELECT e.id, e.name, e.email, p.pay_period, p.amount
FROM raw_schema.employees e
JOIN prod_schema.payroll_runs p ON p.employee_id = e.id
WHERE e.id = 6;
```

**Expected result** (exact, 2 rows — the join still works, the financial facts survive, but identity is gone):

| id | name        | email                       | pay_period | amount  |
| -- | ----------- | --------------------------- | ---------- | ------- |
| 6  | REDACTED-6  | redacted-6@deleted.invalid  | 2024-01-01 | 7500.00 |
| 6  | REDACTED-6  | redacted-6@deleted.invalid  | 2024-02-01 | 7500.00 |

**Using a fixed placeholder string is a collision risk — see Pitfalls below** for why `'REDACTED-6'` (with the ID suffix) is used here instead of a bare `'REDACTED'` for every anonymized employee.

**Audit-log / evidence-of-erasure verification step**: a real erasure process must produce a durable, queryable record proving the action happened — not just the `UPDATE` itself, which could later be claimed never occurred.

```sql
CREATE TABLE prod_schema.erasure_log (
    id SERIAL PRIMARY KEY,
    subject_id INTEGER NOT NULL,
    requested_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP NOT NULL DEFAULT now(),
    method TEXT NOT NULL,   -- 'anonymization' | 'deletion' | 'crypto-shred'
    performed_by TEXT NOT NULL
);

INSERT INTO prod_schema.erasure_log (subject_id, requested_at, method, performed_by)
VALUES (6, '2024-03-01 09:00', 'anonymization', 'data_engineer');
```

This `erasure_log` row is the durable evidence an auditor or regulator would ask for — "show me proof you actioned this person's erasure request and when."

---

## Pitfalls

### 1. RLS Bypass: Table Owners and `BYPASSRLS`

Native Row Level Security in Postgres does **not** apply to the table's owner by default, nor to any role with the `BYPASSRLS` attribute (typically superusers). If your application connects as the table owner for convenience, every RLS policy you've written is silently inert for that connection. Always run application queries through a role that (a) is *not* the table owner and (b) does not have `BYPASSRLS`, and explicitly test this — RLS policies that "work" in a superuser psql session during testing can give a false sense of security.

### 2. Privilege Inheritance Through Roles

Postgres roles can be members of other roles, and by default a member inherits the parent role's privileges automatically (`INHERIT` is the default). If `analyst` is accidentally added as a member of `data_engineer` (e.g., during an onboarding script that grants broad "starter" access), the analyst silently gains `data_engineer`'s `raw_schema` access without any direct `GRANT` ever being issued to `analyst` — this is invisible unless you specifically check role membership (`\du` in `psql`, or query `pg_auth_members`), not just direct grants.

### 3. Inference Attacks Through Aggregates

Even with row-level restrictions or column masking, **aggregate queries can leak individual values**. Example: if `analyst` can see `AVG(salary)` for a region with only one employee, the average *is* that employee's exact salary. More subtly, running `AVG(salary) WHERE region = 'North'` then `AVG(salary) WHERE region = 'North' AND id != 4` lets you back out employee 4's exact salary by subtraction, even if you never had direct row access. Mitigate with minimum-group-size thresholds before allowing aggregation (e.g., suppress results for any group with fewer than 5 underlying rows) — a standard statistical-disclosure-control technique.

### 4. Shared-Account Risk

If `reporting_bot` (or any service account) is used by multiple humans logging in with the same shared credential, your audit log records "reporting_bot did X" but cannot attribute the action to a specific person — destroying the value of the audit trail for incident response (recall the "Bob queried `vip_users` at 3 AM" scenario: that attribution only works because Bob has his *own* credential, not a shared one).

### 5. Masking Limitations

Dynamic data masking changes what's *displayed*, not what's *computable*. An analyst who can't see raw `credit_card_number` but can run `GROUP BY credit_card_number` (using a hash or the masked-but-still-unique value as a grouping key) can still learn relationships like "this card appears in 40 transactions" — masking protects the literal value but does not always prevent re-identification through behavioral patterns, especially for low-cardinality or sparse populations.

### 6. Fixed-Value Anonymization Collisions

If every anonymized employee's name is overwritten with the literal string `'REDACTED'` (no per-row distinguishing suffix), two different anonymized people become **indistinguishable from each other in display** — and worse, a careless future `JOIN ... ON name = 'REDACTED'` or a deduplication script that treats identical `name` values as the same entity could **incorrectly merge two different anonymized individuals' records**. This is why Exercise 3 above used `'REDACTED-' || id` rather than a bare constant: the suffix keeps anonymized records distinguishable from each other without re-exposing identity, avoiding an accidental "two different anonymized people become joinable" bug.

---

### Non-Functional Constraints (Apply to All Exercises)

* **Performance / Scale**: Document a target query runtime of **p95 < 2s** for your final solution, validate behavior at **25 concurrent analytical users/sessions**, and keep compute spend below **$3** per production-equivalent run.
* **Data Governance / Security**: Define acceptance criteria for least-privilege access, PII handling (masking/tokenization where applicable), audit logging of query access, and retention/deletion alignment with policy.
* **Business KPI Impact**: Explicitly state which business KPI(s) improve based on your schema/query decisions and quantify expected directional impact.
  * KPI focus for this day: *Compliance incident rate and access-review closure SLA should improve through enforceable policy controls in analytical workloads.*

## Mastery Check

### Question 1: RLS

If RLS is enabled, and I run `SELECT count(*) FROM table`, is the result the same for everyone?
A) Yes.
B) No, it depends on what rows the user is allowed to see.
C) It returns an error.
D) It returns 0.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Correct. The count reflects the filtered view.
</details>

### Question 2: Masking

Does Dynamic Data Masking change the data on the disk (storage)?
A) Yes, it overwrites the file.
B) No, it only changes the data "in flight" as it is returned to the user.
C) It deletes the data.
D) It encrypts the disk.

<details>
<summary>Click for Answer</summary>

**Answer: B**
The raw data is safe; the view is obfuscated.
</details>

### Question 3: Least Privilege

Why shouldn't Analysts have `DROP TABLE` permission?
A) They might delete production data by accident.
B) They are evil.
C) It costs money.
D) It slows down queries.

<details>
<summary>Click for Answer</summary>

**Answer: A**
Accidents happen. Limit the blast radius.
</details>

### Question 4: Crypto-Shredding

What is the main advantage of Crypto-Shredding for GDPR, and what does it NOT eliminate the need for?

A) It is fast (destroying 1 key vs. scrubbing every backup tape) — but you still need documented evidence of erasure and a retention/destruction policy for the now-unreadable ciphertext.
B) It is cheaper, and replaces all other compliance documentation.
C) It is a legal requirement in every jurisdiction.
D) It guarantees the data is physically removed from disk immediately.

<details>
<summary>Click for Answer</summary>

**Answer: A**
Crypto-shredding makes backup-resident PII cryptographically unreadable very quickly, which is genuinely valuable — but auditors and regulators still expect a logged, timestamped record of what was destroyed and when, plus a policy for eventually purging the now-useless ciphertext bytes. Treat it as solving the "can't scrub 50 backup tapes by hand" problem, not as a complete substitute for governance process.
</details>

### Question 5: PII

Which of these is PII?
A) "User 123 bought a Shoe."
B) "Alice Smith bought a Shoe."
C) "Someone bought a Shoe."
D) "Shoe #55."

<details>
<summary>Click for Answer</summary>

**Answer: B**
Alice Smith identifies a person.
</details>

### Question 6: RLS Bypass

A table owner connects directly to the database and runs `SELECT * FROM employees`, even though a `CREATE POLICY` exists restricting row visibility. What happens?

A) The policy applies; the owner sees only their own rows.
B) The policy does NOT apply by default to the table owner or to roles with `BYPASSRLS` — the owner sees all rows.
C) The query fails with a permission error.
D) RLS automatically revokes the owner's access.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Native RLS in Postgres exempts the table owner and any role with the BYPASSRLS attribute by default. Application connections should never use the owning role or a superuser if RLS enforcement matters — test this explicitly, since it is easy to assume RLS "just works" from a superuser testing session.
</details>

### Question 7: View vs. Native RLS

Why is a `CREATE VIEW ... WHERE id = current_user_id()` restriction not equivalent to native Row Level Security?

A) Views run slower than RLS policies.
B) A user with separate, direct SELECT access to the underlying base table can bypass the view's filter entirely by querying the table directly.
C) Views cannot use WHERE clauses.
D) They are functionally identical in every threat model.

<details>
<summary>Click for Answer</summary>

**Answer: B**
A view only restricts access for users forced through that view. If the same user also has a grant on the base table (intentionally or by accident), they can query the base table directly and see everything — the view enforces nothing at the storage layer. Native RLS, enabled with ALTER TABLE ... ENABLE ROW LEVEL SECURITY, is enforced by the engine regardless of which object the query targets.
</details>

### Question 8: Anonymization Collisions

Why is overwriting every anonymized employee's name with the exact same literal string `'REDACTED'` risky?

A) It uses too much disk space.
B) Two different anonymized people become indistinguishable, and a careless join/dedup process could incorrectly treat them as the same entity.
C) PostgreSQL does not allow duplicate string values.
D) It violates GDPR by retaining too much information.

<details>
<summary>Click for Answer</summary>

**Answer: B**
A fixed placeholder collapses every anonymized individual into one indistinguishable value. Beyond the obvious display confusion, an automated process that joins or deduplicates on that field could wrongly merge two different people's records. Using a per-row distinguishing suffix (e.g., 'REDACTED-' || id) avoids this while still removing the identifying information.
</details>

---

## Glossary

| Term | Definition |
| --- | --- |
| **Authentication** | Confirming the identity of the requester ("are you who you claim to be?"). |
| **Authorization** | Confirming what an authenticated identity is permitted to do. |
| **RBAC (Role-Based Access Control)** | Granting permissions to roles/groups rather than individual users, then assigning users to roles. |
| **RLS (Row Level Security)** | Database-enforced filtering that restricts which rows a query can see/modify, based on the querying session's identity or attributes. |
| **PII (Personally Identifiable Information)** | Data that can identify a specific natural person, alone or combined with other data. |
| **Masking** | Altering how data is displayed to unauthorized viewers without changing the stored value. |
| **Crypto-shredding** | Destroying the encryption key for a dataset so the ciphertext becomes permanently unreadable, used as a fast "deletion" mechanism for encrypted backups. |
| **Anonymization** | Irreversibly altering data so the individual cannot be re-identified by anyone, even with auxiliary information. |
| **Pseudonymization** | Replacing identifiers with an artificial value where re-identification remains possible via separately held information — still regulated personal data under GDPR. |
| **Least privilege** | Granting only the minimum access required to perform a task, to limit the blast radius of mistakes or compromise. |

---

## Cross-References

* **Prerequisites**: Day 97 (Advanced DDL & Schema — schemas, views) and Day 98 (Advanced DML & Upserts — safe updates) — see "Prerequisites & Recommended Order" above.
* **Related**: Day 96 (Relational Database Internals) for the transaction/locking model underlying `UPDATE`s used in the GDPR deletion exercise; Day 91 (Cloud Architecture & Optimization) for cost-governance controls that intersect with audit logging at scale.

---

## Summary

Today you learned:

* ✅ **RLS**: Security at the row level, enforced by the database — but only when applied as native policies, not just views, and never bypassed by table-owner or `BYPASSRLS` connections.
* ✅ **Masking**: Hiding sensitive fields on the fly, while understanding its limits against inference through grouping/aggregation.
* ✅ **GDPR**: Engineering deletion using anonymization, pseudonymization, or crypto-shredding — each with different legal implications, and all requiring documented evidence of erasure.
* ✅ **RBAC**: Groups/Roles > Individual Permissions, with role-inheritance risks to watch for.

**Tomorrow**: We begin the **Capstone Project (Part 1)**—Architecting your masterpiece.
