---
day: 85
title: "Advanced SQL Patterns"
phase: 8
phaseTitle: "SQL Mastery & Database Architecture"
slug: "advanced-sql"
duration: 120
difficulty: "advanced"
tags:
  - recursive-cte
  - json
  - lateral-join
  - pivoting
concepts:
  - "Recursive CTEs (Hierarchies)"
  - "JSON Parsing in SQL"
  - "Lateral Joins (Cross Apply)"
  - "Array Aggregates"
prerequisites:
  - "Intermediate SQL (Joins, Window Functions)"
  - "Understanding of Trees/Graphs"
outcomes:
  - "Model Org Charts using Recursion"
  - "Query NoSQL JSON blobs inside Postgres/Snowflake"
  - "Use Lateral Joins for powerful 'For-Each' logic"
---

# 🎯 Day 85: Advanced SQL Patterns

> *"Standard SQL analyzes tables. Advanced SQL analyzes Trees, Graphs, and Documents."*

---

## The "Never-Coded" Bridge

**The Family Tree**

**Standard SQL**: "Find me Bob's father." (Easy - `SELECT father FROM table WHERE child = 'Bob'`).
**Advanced SQL**: "Find me Bob's Great-Great-Great Grandfather."

* **Problem**: You don't know how many "Greats" are in the chain. Is it 3 joins? 10 joins?
* **Recursive SQL**: A loop. "Find Father. Then Find *his* Father. Repeat until no Father is found."

**The Russian Doll (JSON)**

**Standard SQL**: "Give me the address." (Column: `address`).
**Advanced SQL**: "Give me the Zip Code."

* **But**: The address is inside a sealed box (JSON Blob): `{"city": "NY", "zip": "10001"}`.
* **JSON SQL**: Open the box, grab the zip, close the box. All in one query.

---

## The Technical Deep Dive

### 1. Recursive CTEs

Used for Hierarchies (Org Charts, Category Trees, Graph Paths).

**Syntax**:

```sql
WITH RECURSIVE org_chart AS (
    -- Anchor Member (Base Case)
    SELECT id, name, manager_id, 1 as level 
    FROM employees 
    WHERE manager_id IS NULL  -- The CEO
    
    UNION ALL
    
    -- Recursive Member (Loop)
    SELECT e.id, e.name, e.manager_id, o.level + 1
    FROM employees e
    JOIN org_chart o ON e.manager_id = o.id
)
SELECT * FROM org_chart;
```

* It runs the second part repeatedly, feeding the results back into `o`, until no rows are returned.

### 2. Working with JSON (Postgres/Snowflake)

Don't use Mongo just because you have JSON. SQL can do it.

**Postgres**:

* `data ->> 'key'`: Extract value as Text.
* `data -> 'key'`: Extract value as JSON.

```sql
SELECT
    id,
    info ->> 'email' as email,
    info -> 'preferences' ->> 'theme' as theme
FROM users
WHERE info ->> 'status' = 'active';
```

### 3. Lateral Joins (LATERAL / CROSS APPLY)

Standard Joins can't refer to the table on the left inside the right subquery. **Lateral** can.

* It's like a "For Each Loop" in SQL.
* **Scenario**: "For each User, find their Top 3 most recent Orders."

```sql
SELECT u.name, o.order_date, o.amount
FROM users u
CROSS JOIN LATERAL (
    SELECT * FROM orders 
    WHERE user_id = u.id 
    ORDER BY date DESC 
    LIMIT 3
) o;
```

---

## Senior-Level Insights

### "Schemaless" is a Lie

* **Junior**: "I'll store everything in a JSON column so I don't have to migrate the schema!"
* **Senior**: "You just moved the schema (structure) from *Write Time* (Table Definition) to *Read Time* (Query Complexity)."
* **Logic**: Querying JSON is slower and harder to index. Use it for *rarely queried attributes* (e.g., "Custom User Config"), not core data (e.g., "Email").

### Recursion Safety

* **Infinite Loops**: If Employee A reports to B, and B reports to A, your Recursive CTE will run forever.
* **fix**: Standard databases stop after 100 iterations. Or add a `WHERE level < 20` guard.

---

## Hands-on Lab

### Exercise 1: The Boss Finder (Recursion)

**Goal**: Find the full management chain for "Intern Alice".

**Data**:

| ID  | Name  | Manager_ID |
| --- | ----- | ---------- |
| 1   | CEO   | NULL       |
| 2   | VP    | 1          |
| 3   | Alice | 2          |

**Task**: Write a CTE that outputs: `Alice -> VP -> CEO`.

### Exercise 2: The Log Parser (JSON)

**Goal**: Extract data from a log table.

**Data**: `description` column contains `{"event": "login", "browser": "Chrome", "lat": 40.7}`.

**Task**:

1. Extract `browser`.
2. Filter for `event` = 'login'.
3. Count logins by Browser.

```sql
SELECT 
    description ->> 'browser' as browser_name,
    COUNT(*)
FROM logs
WHERE description ->> 'event' = 'login'
GROUP BY 1;
```

### Exercise 3: The Top X per Group (Lateral)

**Goal**: Find the last 2 comments for every blog post.

**Without Lateral**: You'd use `ROW_NUMBER() OVER (PARTITION BY post_id ...)` and filter `rn <= 2`.
**With Lateral**:

```sql
SELECT p.title, c.body
FROM posts p,
LATERAL (
    SELECT body FROM comments 
    WHERE post_id = p.id 
    ORDER BY created_at DESC 
    LIMIT 2
) c;
```

* *Compare*: Lateral is often faster if you have an Index on `comments(post_id, created_at)`.

---

### Non-Functional Constraints (Apply to All Exercises)

- **Performance / Scale**: Document a target query runtime of **p95 < 2s** for your final solution, validate behavior at **20 concurrent analytical users/sessions**, and keep compute spend below **$2** per production-equivalent run.
- **Data Governance / Security**: Define acceptance criteria for least-privilege access, PII handling (masking/tokenization where applicable), audit logging of query access, and retention/deletion alignment with policy.
- **Business KPI Impact**: Explicitly state which business KPI(s) improve based on your schema/query decisions and quantify expected directional impact.
  - KPI focus for this day: *Manager-chain lookups and JSON-based behavioral reporting should support <5 minute leadership and product analytics refresh cycles.*

## Mastery Check

### Question 1: Recursive CTE

What are the two parts of a Recursive CTE?
A) The Head and the Tail.
B) The Anchor Member (Base) and the Recursive Member (Loop).
C) The Left and the Right.
D) The Start and the Finish.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Anchor gives the starting set. Recursive loops on it.
</details>

### Question 2: JSON in SQL

True or False: Storing data in JSON columns prevents you from indexing it.
A) True.
B) False. Modern databases allow "Functional Indexes" on JSON keys.

<details>
<summary>Click for Answer</summary>

**Answer: B**
FALSE. You can index `(data ->> 'email')` to make searches instant.
</details>

### Question 3: Lateral Join

What does `LATERAL` allow a subquery to do?
A) Run faster.
B) Reference columns from the preceding tables in the `FROM` clause.
C) Join horizontally.
D) Delete data.

<details>
<summary>Click for Answer</summary>

**Answer: B**
It enables correlated subqueries in the FROM clause.
</details>

### Question 4: Use Case for Recursion

Which dataset is best suited for Recursive CTEs?
A) Sales Transactions.
B) A Product Category Tree (Electronics -> Laptops -> Gaming Laptops).
C) User Logs.
D) Weather Data.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Any "Parent-Child" relationship with unknown depth.
</details>

### Question 5: JSON vs Table

When should you use a JSON column?
A) For the User's Primary Key.
B) For sparse, dynamic attributes (e.g., metadata for 50 different 3rd party integrations).
C) For Foreign Keys.
D) Always.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Flexibility comes at the cost of strictness/performance. Use strictly for dynamic data.
</details>

---

## Summary

Today you learned:

* ✅ **Recursive CTEs**: Loop through unlimited hierarchy levels.
* ✅ **JSON SQL**: Treat Postgres/Snowflake like a NoSQL store.
* ✅ **Lateral Joins**: The "Loop" of SQL joins.
* ✅ **Array Aggregates**: Pack rows into lists (not covered in detail, but related to JSON).

**Tomorrow**: We explore **BI Cloud**—Moving from SQL syntax to Cloud Architecture.
