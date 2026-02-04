---
title: "Day 96: Subqueries"
tags:
  - SQL
---

# 📘 Day 96: Subqueries

Welcome to Day 96! Today, we'll explore **Subqueries**, also known as nested queries or inner
queries. A subquery is a query within another SQL query.

## What is a Subquery?

A subquery is a `SELECT` statement that is nested inside another `SELECT`, `INSERT`, `UPDATE`, or
`DELETE` statement, or inside another subquery. Subqueries can be used to perform operations that
would otherwise require complex joins and unions.

### Key Points

- A subquery is always enclosed in parentheses.
- Subqueries can return a single value (a scalar), a single row, a single column, or a table.
- Subqueries are often used in the `WHERE` clause of the main query.

## Types of Subqueries

### Scalar Subquery

A scalar subquery returns a single value (one row, one column).

```sql
SELECT employee_name, salary
FROM employees
WHERE salary > (SELECT AVG(salary) FROM employees);
```

### Multi-row Subquery

A multi-row subquery returns a set of rows. You can use operators like `IN`, `NOT IN`, `ANY`, and
`ALL` with multi-row subqueries.

```sql
SELECT employee_name
FROM employees
WHERE department_id IN (SELECT department_id FROM departments WHERE location = 'New York');
```

### Correlated Subquery

A correlated subquery is a subquery that uses values from the outer query. The inner query is
executed once for each row processed by the outer query.

```sql
SELECT employee_name, salary
FROM employees e
WHERE salary > (
    SELECT AVG(salary)
    FROM employees
    WHERE department_id = e.department_id
);
```

## 💻 Exercises: Day 96

Please see the `exercises.sql` file for today's exercises.

<!-- LESSON_FOOTER_START -->

---

**Previous:** [Day 95 – Day 95: Joins](../Day_95_Joins/README.md) • **Next:** [Day 97 – Day 97: Views](../Day_97_Views/README.md)

_You are on lesson 96 of 108._

<!-- LESSON_FOOTER_END -->
