---
day: 87
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

## The "Never-Coded" Bridge

**The Office Badge**

1.  **Authentication**: The guard checks your ID. "Are you Bob?" (Yes/No).
2.  **Authorization (RBAC)**: You have a "Marketing" badge.
    *   You can open the "Marketing" door.
    *   You *cannot* open the "Server Room" door.
3.  **Row Level Security (RLS)**:
    *   Inside the Marketing room, there are filing cabinets for "North" and "South".
    *   Bob handles "North". The "South" cabinet is **invisible** to him, even though he is in the room.

**Data Security** applies these layers to SQL tables.

---

## The Technical Deep Dive

### 1. Row Level Security (RLS)

Typically implemented via **Views** or **Policies**.
*   **The Policy**: `CREATE POLICY regional_policy ON sales USING (region = current_user_region())`.
*   **The Magic**: When Bob (`region='North'`) runs `SELECT * FROM sales`, the database *silently* adds `WHERE region = 'North'` to his query.
*   **Result**: He sees 100 rows. Alice (`South`) sees 50 rows. The CEO (`All`) sees 150 rows.

### 2. Dynamic Data Masking

Protecting PII (Personally Identifiable Information) without breaking applications.
*   **Column**: `credit_card_number` (`1234-5678-9012-3456`).
*   **Masking Rule**: `mask_inner_digits(credit_card_number)`.
*   **Analyst View**: `1234-XXXX-XXXX-3456`.
*   **App View**: `1234-5678-9012-3456` (If authorized to charge card).
*   **Why?**: Analysts can join/group by the card (using a hash) without seeing the raw number.

### 3. The "Right to be Forgotten" (GDPR)

*   **Requirement**: User X says "Delete me." You have 30 days.
*   **Problem**: User X is in 50 backups, 10 data lakes, and 5 CSVs on laptops.
*   **Solution**: **Crypto-Shredding**.
    *   Encrypt User X's PII with Key X.
    *   Store Key X in a centralized Key Vault.
    *   To "Delete" User X -> **Delete Key X**.
    *   Result: Their data is now unreadable garbage forever. No need to find every backup tape.

---

## Senior-Level Insights

### The "Least Privilege" Principle

*   **Junior**: "Give me Admin access so I don't get Permission Denied errors."
*   **Senior**: "Give me Read-Only access to *only* the tables I need."
*   **Why?**: If your laptop is stolen/hacked, the damage is limited. The Admin account is the "Crown Jewel."

### Audit Logs are your Alibi

*   **Scenario**: A sensitive VIP customer list was leaked to the press.
*   **Question**: "Who queried the `vip_users` table last week?"
*   **The Log**: "Bob queried `SELECT *` at 3 AM on Saturday."
*   **Result**: Bob is in trouble. (Or Bob's account was hacked).
*   *Action*: Enable Audit Logging on all sensitive tables.

---

## Hands-on Lab

### Exercise 1: Designing Roles (RBAC)
**Goal**: Define permissions.

**Roles**:
1.  **Data Engineer**: `READ/WRITE` on `raw_schema`, `READ/WRITE` on `prod_schema`.
2.  **Analyst**: `READ` on `prod_schema`. `NO ACCESS` to `raw_schema` (contains PII).
3.  **Reporting Bot**: `READ` on `prod_schema.dashboard_views_only`.

**Implementation**:
```sql
GRANT SELECT ON ALL TABLES IN SCHEMA prod TO GROUP analysts;
REVOKE ALL ON SCHEMA raw FROM GROUP analysts;
```

### Exercise 2: Implementing RLS (Generic Logic)
**Goal**: Filter by `manager_id`.

**Scenario**: `employees` table.
*   Policy: Users can only see themselves and their direct reports.
*   Logic: `WHERE id = current_user_id() OR manager_id = current_user_id()`.

**Task**: Write the `CREATE VIEW` that enforces this.
```sql
CREATE VIEW my_team AS
SELECT * 
FROM employees
WHERE id = session_user_id() 
   OR manager_id = session_user_id();
```

### Exercise 3: GDPR Deletion
**Goal**: Design the flow.

**Scenario**: Table `users` (Email, Name) and `transactions` (Amount).
*   **Constraint**: You must delete `Name/Email`, but keep `Amount` for Tax Reporting.
*   **Action**:
    1.  `UPDATE users SET email = 'deleted@', name = 'Redacted' WHERE id = 123`.
    2.  Keep `id = 123` so `transactions` joins still work (Referential Integrity).
    3.  This is Anonymization.

---

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
What is the main advantage of Crypto-Shredding for GDPR?
A) Speed (Deleting 1 key vs Finding data in 100 systems).
B) It's cheaper.
C) It's legal requirement.
D) It's fun.

<details>
<summary>Click for Answer</summary>

**Answer: A**
Ensures compliance across backups instantaneously.
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

---

## Summary

Today you learned:
*   ✅ **RLS**: Security at the row level, invisible to the application.
*   ✅ **Masking**: Hiding sensitive fields on the fly.
*   ✅ **GDPR**: Engineering deletion using Anonymization or Keys.
*   ✅ **RBAC**: Groups/Roles > Individual Permissions.

**Tomorrow**: We begin the **Capstone Project (Part 1)**—Architecting your masterpiece.
