---
day: 102
title: "Advanced CTEs & Recursion"
phase: 9
phaseTitle: "Enterprise SQL Performance Engineering"
slug: "recursive-ctes"
duration: 120
difficulty: "advanced"
tags:
  - recursive-cte
  - hierarchy
  - graph-algorithms
  - bill-of-materials
concepts:
  - "Recursive CTE Syntax (Anchor vs Recursive Member)"
  - "Traversing Trees (Org Charts)"
  - "Graph Traversal (Shortest Path)"
  - "Cycle Detection"
prerequisites:
  - "Basic CTEs (WITH clause)"
outcomes:
  - "Query a 10-level deep Org Chart in one SQL statement"
  - "Calculate the total cost of a Car (Bill of Materials)"
  - "Detect infinite loops in hierarchical data"
---

# 🎯 Day 102: Advanced CTEs & Recursion

> *"To understand recursion, you must first understand recursion."*

---

## The "Never-Coded" Bridge

**The Family Tree**

*   **Iterative Approach**:
    *   Find "Grandpa". (Query 1).
    *   Find "Grandpa's Kids". (Query 2).
    *   Find "Kids' Kids". (Query 3).
    *   *Problem*: You don't know how deep the tree goes. You need an infinite loop in Python.
*   **Recursive Approach (SQL)**:
    *   "Find Grandpa."
    *   **RULE**: "For every person found, find their children."
    *   **Repeat**: Apply the Rule until no new children are found.
    *   *Result*: One single query returns the entire lineage.

---

## The Technical Deep Dive

### 1. Anatomy of `WITH RECURSIVE`

It has two parts joined by `UNION ALL`.
1.  **Anchor Member**: The starting point (e.g., "Grandpa"). Run once.
2.  **Recursive Member**: The loop. It references the CTE itself (`t`).
3.  **Termination**: Stops when the Recursive Member returns 0 rows.

```sql
WITH RECURSIVE subordinates AS (
    -- Anchor: The CEO
    SELECT id, name, manager_id 
    FROM employees 
    WHERE manager_id IS NULL
    
    UNION ALL
    
    -- Recursive: Employees managed by people already found
    SELECT e.id, e.name, e.manager_id
    FROM employees e
    INNER JOIN subordinates s ON s.id = e.manager_id
)
SELECT * FROM subordinates;
```

### 2. Depth Usage (The "Level" Column)

How deep are we?
*   Add `1 as level` to Anchor.
*   Add `s.level + 1` to Recursive Member.
*   *Result*: You know if someone is a VP (Level 2) or Intern (Level 99).

### 3. Path Tracking (The Breadcrumbs)

How did we get here?
*   Anchor: `ARRAY[id] as path`.
*   Recursive: `s.path || e.id`.
*   *Result*: `{1, 5, 20}` means CEO -> VP -> Manager.
*   **Cycle Detection**: `WHERE NOT (e.id = ANY(s.path))` prevents infinite loops.

---

## Senior-Level Insights

### The "Bill of Materials" (BOM) Problem

*   **Scenario**: A "Car" is made of 4 "Wheels". A "Wheel" is made of "Rim" + "Tire".
*   **Task**: "How many screws are in a Car?"
*   **Solution**: Recursive CTE allows you to "explode" the parts list down to the raw materials and `SUM()` them up.
*   **Impact**: Essential for Manufacturing (ERP systems).

### Performance Limits

*   **Risk**: Recursion is CPU intensive.
*   **Limit**: Postgres has a failsafe? No. You must write `LIMIT 100` or cycle detection to prevent server crashes if logic is buggy.
*   **Graph Databases**: If you do *complex* graph math (Shortest Path with weights), consider Neo4j. For simple Trees, SQL is fine.

---

## Hands-on Lab

### Exercise 1: The Org Chart
**Goal**: View the hierarchy.

1.  **Data**:
    *   Alice (Manager: NULL).
    *   Bob (Manager: Alice).
    *   Charlie (Manager: Bob).
2.  **Query**: Write a Recursive CTE to show:
    *   Name: Charlie
    *   Path: Alice -> Bob -> Charlie
    *   Level: 3

### Exercise 2: Bill of Materials
**Goal**: Calculate total weight.

*   Part 1 (Machine): Contains 2 of Part 2.
*   Part 2 (Gear): Contains 5 of Part 3.
*   Part 3 (Screw): Weight 10g.
*   **Task**: Use recursion to find total weight of Part 1 (2 * 5 * 10 = 100g).

### Exercise 3: Cycle Panic
**Goal**: Create and fix an infinite loop.

1.  Update Data: Set Alice's Manager to Charlie (A -> B -> C -> A).
2.  Run the Query from Exercise 1. (It runs forever/crashes).
3.  **Fix**: Add `WHERE NOT (e.id = ANY(path))` to the join condition.

---

## Mastery Check

### Question 1: Syntax
Which keyword is mandatory for recursion in Postgres?
A) `RECURSIVE`.
B) `LOOP`.
C) `REPEAT`.
D) `AGAIN`.

<details>
<summary>Click for Answer</summary>

**Answer: A**
`WITH RECURSIVE cte_name AS ...`
</details>

### Question 2: Anchor
When does the Anchor Member run?
A) Every loop.
B) Only once, at the start.
C) At the end.
D) Never.

<details>
<summary>Click for Answer</summary>

**Answer: B**
It seeds the recursion.
</details>

### Question 3: Termination
When does the recursion stop?
A) When the recursive query returns no rows.
B) When the CPU melts.
C) When it hits 100 rows.
D) When you press Ctrl+C.

<details>
<summary>Click for Answer</summary>

**Answer: A**
Mathematically defined fixed-point.
</details>

### Question 4: Breadcrumbs
Why store the `path` as an Array?
A) To find the shortest path.
B) To print the hierarchy (A > B > C) and for cycle detection.
C) Arrays are faster.
D) It looks cool.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Crucial for debugging and display.
</details>

### Question 5: Alternatives
For a very deep tree (e.g., 10,000 levels), is recursion fast?
A) Yes, it's instant.
B) No, each level is a separate join iteration. It can be slow.
C) It depends on the weather.
D) SQL cannot handle it.

<details>
<summary>Click for Answer</summary>

**Answer: B**
For massive graphs, specialized Graph DBs are better.
</details>

---

## Summary

Today you learned:
*   ✅ **WITH RECURSIVE**: The loop structure in SQL.
*   ✅ **Trees**: Querying Parent-Child relationships.
*   ✅ **Paths**: Tracking traversal history.
*   ✅ **Cycle Detection**: Preventing infinite loops.

**Tomorrow**: We reshape data formats with **Pivoting & Crosstabs**.
