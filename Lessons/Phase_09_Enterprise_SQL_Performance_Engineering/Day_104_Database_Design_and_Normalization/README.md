---
day: 104
title: "Database Design & Normalization"
phase: 9
phaseTitle: "Enterprise SQL Performance Engineering"
slug: "normalization"
duration: 120
difficulty: "advanced"
tags:
  - normalization
  - 3nf
  - bcnf
  - denormalization
concepts:
  - "Normal Forms (1NF, 2NF, 3NF)"
  - "The Anomalies (Update, Insertion, Deletion)"
  - "Strategic Denormalization (Star Schema)"
  - "Surrogate vs Natural Keys"
prerequisites:
  - "Basic CREATE TABLE"
outcomes:
  - "Normalize a spreadsheet into 3rd Normal Form"
  - "Identify Partial Dependencies"
  - "Design a Star Schema for Analytics"
---

# 🎯 Day 104: Database Design & Normalization

> *"Data integrity is forever. Join performance is temporary. Optimize for the former, cache the latter."*

---

## The "Never-Coded" Bridge

**The Address Book**

* **Unnormalized (The Spreadsheet)**:
  * Row 1: `John Smith, 123 Main St, New York`.
  * Row 2: `Jane Doe, 123 Main St, New York`.
  * *Problem*: If "New York" changes its name to "New Amsterdam", you have to update 2 rows. If you miss one, John lives in NY and Jane lives in NA. (Inconsistent).
* **Normalized (The Relational DB)**:
  * Table `Cities`: `ID=1, Name=New York`.
  * Table `People`: `John, CityID=1`, `Jane, CityID=1`.
  * *Update*: Change City 1 to "New Amsterdam". Both John and Jane are updated instantly.

---

## The Technical Deep Dive

### 1. The Normal Forms

Rules to prevent anomalies.

* **1NF (Atomic)**: No lists in one cell. (Don't put `["red", "blue"]` in a column. Use a separate row).
* **2NF (Whole Key)**: No Partial Dependencies. (If PK is `(Order, Product)`, don't store `Product_Name` here. It depends only on `Product`, not `Order`).
* **3NF (Direct)**: No Transitive Dependencies. (Don't store `City_Population` in the `Users` table. `User -> City -> Population`. Move Population to `City` table).

### 2. The Anomalies

Why we do this.

* **Update Anomaly**: Updating data in one place leaves it stale in another.
* **Insertion Anomaly**: You can't add a new "City" unless you have a User who lives there.
* **Deletion Anomaly**: If you delete the last User in "Tokyo", you lose the information that "Tokyo" exists.

### 3. Denormalization (The Dark Side)

* **OLTP (Transactional)**: normalize to 3NF. (Fast writes, safe data).
* **OLAP (Analytics)**: Denormalize to **Star Schema**.
  * *Why?*: Joining 10 tables is slow.
  * *Action*: Store `Product_Category_Name` directly in the `Sales` table to avoid joining `Product` -> `SubCategory` -> `Category`.

---

## Senior-Level Insights

### Natural vs Surrogate Keys

* **Natural Key**: `User_Email` or `SSN`.
  * *Pros*: Unique by definition.
  * *Cons*: Emails change. SSNs are PII. If key changes, you must update all Foreign Keys (Cascade).
* **Surrogate Key**: `Serial ID` or `UUID`.
  * *Pros*: Never changes. Purely internal.
  * *Cons*: Extra column.
  * *Verdict*: Use Surrogate Keys (BigInt/UUID) for Primary Keys. Use Natural Keys for Unique Constraints.

### "Over-Normalization"

* **Junior**: Splits address into `Street_Number`, `Street_Name`, `Suffix`, `Apartment`.
* **Senior**: "Just use `Address_Line_1`. Nobody queries by 'Street Suffix'."
* **Rule**: Normalize what you need to *filter* or *aggregate*. JSONB is fine for the rest.

---

## Hands-on Lab

### Exercise 1: Breaking 1NF

**Goal**: Identify the issue.

Data: `orders (id, items)`. Row: `1, "Apple, Banana"`.

* **Task**: Convert to 1NF.
* **Result**: `order_items (order_id, item)`. Rows: `(1, Apple)`, `(1, Banana)`.

### Exercise 2: Achieving 3NF

**Goal**: Fix Transitive Dependency.

Data: `books (isbn, title, author_name, author_birthdate)`.

* **Problem**: `author_birthdate` depends on `author_name`, not `isbn`.
* **Fix**:
    1. `authors (id, name, birthdate)`.
    2. `books (isbn, title, author_id)`.

### Exercise 3: Strategic Denormalization

**Goal**: Speed up a report.

Query: `SELECT count(*) FROM users WHERE city = 'NY'`. (Requires Join to Cities).

* **Optimization**: Add `cached_city_name` to `users` table.
* **Trade-off**: Step 2 trigger required to keep it in sync.

---

## Mastery Check

### Question 1: 3NF

If A implies B, and B implies C, then A implies C. This is a...
A) Transitive Dependency.
B) Partial Dependency.
C) Circular Dependency.
D) Good Design.

<details>
<summary>Click for Answer</summary>

**Answer: A**
Violates 3NF. Splitting tables fixes this (A->B, B->C).
</details>

### Question 2: First Normal Form

Which value violates 1NF?
A) `25`.
B) `2023-01-01`.
C) `blue,red,green`.
D) `NULL`.

<details>
<summary>Click for Answer</summary>

**Answer: C**
Non-atomic values make querying "Where color is blue" hard (LIKE '%blue%').
</details>

### Question 3: Surrogate Keys

What is a benefit of UUID over Natural Key (Email)?
A) Shorter.
B) It doesn't change when the user changes their email.
C) Easier to remember.
D) It sorts alphabetically.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Stability is the primary virtue of a Primary Key.
</details>

### Question 4: Star Schema

In Data Warehousing, do we prefer 3NF or Denormalized?
A) 3NF.
B) Denormalized (Star/Snowflake).
C) No Schema.
D) Excel.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Reduces joins for massive aggregation queries.
</details>

### Question 5: BCNF

Boyce-Codd Normal Form is a stricter version of...
A) 1NF.
B) 2NF.
C) 3NF.
D) 4NF.

<details>
<summary>Click for Answer</summary>

**Answer: C**
Deals with multiple candidate keys.
</details>

---

## Summary

Today you learned:

* ✅ **1NF**: Atomic values.
* ✅ **2NF**: Whole Key dependencies.
* ✅ **3NF**: Separation of concerns (transitive).
* ✅ **Keys**: Surrogate vs Natural.

**Tomorrow**: We break the relational model with **JSON & NoSQL in SQL**.
