---
title: 'Day 102: Common Table Expressions (CTEs)'
tags:
- SQL
---
# 📘 Day 102: Common Table Expressions (CTEs)

Welcome to Day 102! Today, we'll learn about **Common Table Expressions (CTEs)**, a temporary result
set that you can reference within another SQL statement.

## What is a CTE?

A CTE is a temporary, named result set that you can use in a `SELECT`, `INSERT`, `UPDATE`, or
`DELETE` statement. CTEs are defined using the `WITH` clause.

### Key Benefits

- **Readability:** CTEs can make complex queries easier to read and understand by breaking them down
  into smaller, logical building blocks.
- **Recursion:** CTEs can be used to write recursive queries, which are useful for working with
  hierarchical data like organizational charts or bill of materials.

## Creating and Using CTEs

### `WITH` Clause

The `WITH` clause is used to define a CTE.

```sql
WITH cte_name (column1, column2, ...) AS (
    -- CTE query definition
    SELECT ...
)
-- Main query
SELECT *
FROM cte_name;
```

### Recursive CTEs

A recursive CTE is a CTE that references itself.

```sql
WITH RECURSIVE cte_name (column) AS (
    -- Anchor member
    SELECT ...
    UNION ALL
    -- Recursive member
    SELECT ...
    FROM cte_name
)
-- Main query
SELECT *
FROM cte_name;
```

## 💻 Exercises: Day 102

Please see the `exercises.sql` file for today's exercises.

<!-- LESSON_FOOTER_START -->

---

**Previous:** [Day 101 – Day 101: Triggers](../Day_101_Triggers/README.md) • **Next:** [Day 103 – Day 103: Pivoting Data](../Day_103_Pivoting_Data/README.md)

_You are on lesson 102 of 108._

<!-- LESSON_FOOTER_END -->