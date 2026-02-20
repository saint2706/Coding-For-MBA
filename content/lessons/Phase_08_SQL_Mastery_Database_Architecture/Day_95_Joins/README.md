---
day: 95
title: "Advanced Joins & Algorithms"
phase: 8
phaseTitle: "SQL Mastery & Database Architecture"
slug: "join-algorithms"
duration: 120
difficulty: "advanced"
tags:
  - hash-join
  - nested-loop
  - skew
  - cross-join
concepts:
  - "Join Algorithms (Nested Loop, Hash, Merge)"
  - "Skewed Joins (The NULL Problem)"
  - "Cross Join (Data Generation)"
  - "Self Join (Hierarchies)"
prerequisites:
  - "Basic INNER/LEFT JOIN"
outcomes:
  - "Explain why your Join is slow (Algorithm mismatch)"
  - "Generate a Date Series using Cross Join"
  - "Debug a Cartesian Product explosion"
---

# 🎯 Day 95: Advanced Joins & Algorithms

> *"A Join is not magic. It's just two loops. If one loop is broken, the query dies."*

---

## The "Never-Coded" Bridge

**The Wedding Seating Chart**

**Goal**: Match Guests (Table A) to Seats (Table B).

1. **Nested Loop Join**:
    * Pick Guest 1. Walk to every Seat. Is it for them? No.
    * Pick Guest 2. Walk to every Seat.
    * *Result*: Extremely slow if you have 1000 guests. (1M checks).
2. **Hash Join**:
    * Make a list of Guests sorted by Name (Hash Table).
    * Go to Seat 1 ("Reserved for Bob"). Look up "Bob" in the list. Done.
    * *Result*: Very fast. (2000 checks).
3. **Merge Join**:
    * Sort Guests by Name. Sort Seats by Name.
    * Walk down both lists together. "Alice matches Alice". "Bob matches Bob".
    * *Result*: Fastest, but requires sorting first.

---

## The Technical Deep Dive

### 1. Join Algorithms

The Optimizer chooses one based on statistics.

* **Nested Loop**:
  * Good for: Joining 10 rows to 1 Million rows (using an Index).
  * Bad for: Joining 1 Million to 1 Million.
* **Hash Join**:
  * Good for: Equi-Joins (`ON a.id = b.id`) on large unsorted tables.
  * Memory: Builds a Hash Table in RAM (`work_mem`). If it spills to disk, it gets slow.
* **Merge Join**:
  * Good for: Tables that are *already sorted* (e.g., by Primary Key).

### 2. Skewed Joins (The Silent Killer)

**Scenario**: You join `Orders` to `Users` on `user_id`.

* **Problem**: 90% of Orders have `user_id = NULL` (Guest Checkouts).
* **Result**:
  * Standard Hash Join puts all NULLs into **one bucket**.
  * One CPU Core processes 90% of the data. Other Cores sit idle.
* **Fix**: Filter out NULLs *before* the join. `WHERE user_id IS NOT NULL`.

### 3. Cross Join (Generating Data)

Useful for "filling gaps" in reports.

* **Report**: "Show Sales for Jan, Feb, Mar".
* **Data**: No sales in Feb. (Feb row is missing).
* **Fix**:
  * `CROSS JOIN` (All Dates) with (All Products).
  * `LEFT JOIN` actual Sales.
  * `COALESCE(sales, 0)`.

---

## Senior-Level Insights

### "Broadcasting" (Distributed Joins)

* **In Spark/BigQuery/Snowflake**:
* **Scenario**: Join `Transactions` (10TB) to `State_Names` (50 rows).
* **Shuffle Join**: Move 10TB of data across the network to match States. (Slow).
* **Broadcast Join**: Copy the 50 rows of States to *every server*. Join locally.
* **Result**: 100x faster.

### The "Cartesian Explosion"

* **Query**: `SELECT * FROM A, B` (No Join condition).
* **Result**: A has 100 rows. B has 100 rows. Result has 10,000 rows.
* **Risk**: If A has 1M and B has 1M... you just crashed the server (1 Trillion rows).

---

## Hands-on Lab

### Exercise 1: Generating a Calendar (Cross Join)

**Goal**: Create a row for every day.

```sql
SELECT generate_series(
    '2024-01-01'::date,
    '2024-01-31'::date,
    '1 day'::interval
) as date;
```

* Now `CROSS JOIN` this with your `products` table to find days with **Zero Sales**.

### Exercise 2: Self Join (Duplicates)

**Goal**: Find users with same email.

```sql
SELECT u1.name, u2.name, u1.email
FROM users u1
JOIN users u2 ON u1.email = u2.email
WHERE u1.id < u2.id; -- Avoid matching (1,1) and (2,1) vs (1,2)
```

### Exercise 3: Analyze Join Type

**Goal**: Force a plan (Postgres).

1. `SET enable_hashjoin = OFF;`
2. Run a large query.
3. Observe: Does it switch to `Merge Join` or `Nested Loop`? Is it slower?

---

### Non-Functional Constraints (Apply to All Exercises)

- **Performance / Scale**: Document a target query runtime of **p95 < 2s** for your final solution, validate behavior at **30 concurrent analytical users/sessions**, and keep compute spend below **$2** per production-equivalent run.
- **Data Governance / Security**: Define acceptance criteria for least-privilege access, PII handling (masking/tokenization where applicable), audit logging of query access, and retention/deletion alignment with policy.
- **Business KPI Impact**: Explicitly state which business KPI(s) improve based on your schema/query decisions and quantify expected directional impact.
  - KPI focus for this day: *Join strategy should improve report generation SLA adherence and reduce compute consumed per dashboard refresh.*

## Mastery Check

### Question 1: Hash Join

What is the limitation of Hash Joins?
A) They rely on efficient indexes.
B) They require enough RAM (`work_mem`) to hold the smaller table.
C) They are slow.
D) They only work on `LEFT JOIN`.

<details>
<summary>Click for Answer</summary>

**Answer: B**
If hash table > RAM, it spills to disk (Slow).
</details>

### Question 2: Cartesian Product

What causes a Cartesian Product?
A) `CROSS JOIN`.
B) Forgetting the `ON` clause in a join.
C) `Select * FROM A, B`.
D) All of the above.

<details>
<summary>Click for Answer</summary>

**Answer: D**
Always be careful with joins.
</details>

### Question 3: Nested Loop

When is Nested Loop the *best* choice?
A) Joining two massive tables.
B) Joining a small table to a specific indexed row in a large table.
C) Never.
D) When you like loops.

<details>
<summary>Click for Answer</summary>

**Answer: B**
It's precise. Low overhead for small row counts.
</details>

### Question 4: Skew

How do you fix a skewed join caused by NULLs?
A) Delete the data.
B) Filter NULLs before joining.
C) Use a bigger server.
D) Use a Cross Join.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Optimization by filtering.
</details>

### Question 5: Merge Join

What does a Merge Join require?
A) Sorted Inputs.
B) Hashing.
C) Random I/O.
D) Luck.

<details>
<summary>Click for Answer</summary>

**Answer: A**
Often triggers a `Sort` node in the plan first.
</details>

---

## Summary

Today you learned:

* ✅ **Algorithms**: Nested Loop (Small), Hash (Unsorted Large), Merge (Sorted Large).
* ✅ **Skew**: NULLs can break parallel processing.
* ✅ **Cross Join**: Not just a mistake; a tool for data densification.
* ✅ **Broadcast**: The distributed version of a Hash Join.

**Tomorrow**: We nest logic deeply with **Advanced Subqueries**.
