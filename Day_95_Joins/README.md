---
title: 'Day 95: Joins'
tags:
- SQL
---
# 📘 Day 95: Joins

Welcome to Day 95! Today, we'll learn about **Joins**, a fundamental concept in SQL for combining
rows from two or more tables based on a related column between them.

## Types of Joins

### `INNER JOIN`

Returns records that have matching values in both tables.

```sql
SELECT orders.order_id, customers.customer_name
FROM orders
INNER JOIN customers ON orders.customer_id = customers.customer_id;
```

### `LEFT (OUTER) JOIN`

Returns all records from the left table, and the matched records from the right table. The result is
NULL from the right side, if there is no match.

```sql
SELECT customers.customer_name, orders.order_id
FROM customers
LEFT JOIN orders ON customers.customer_id = orders.customer_id;
```

### `RIGHT (OUTER) JOIN`

Returns all records from the right table, and the matched records from the left table. The result is
NULL from the left side, when there is no match.

```sql
SELECT orders.order_id, employees.employee_name
FROM orders
RIGHT JOIN employees ON orders.employee_id = employees.employee_id;
```

### `FULL (OUTER) JOIN`

Returns all records when there is a match in either left or right table.

```sql
SELECT customers.customer_name, orders.order_id
FROM customers
FULL OUTER JOIN orders ON customers.customer_id=orders.customer_id;
```

**Note:** `FULL OUTER JOIN` is not supported in all SQL databases (e.g., SQLite, MySQL).

### `CROSS JOIN`

Produces the Cartesian product of the two tables, meaning it returns all possible combinations of
rows.

```sql
SELECT customers.customer_name, products.product_name
FROM customers
CROSS JOIN products;
```

## 💻 Exercises: Day 95

Please see the `exercises.sql` file for today's exercises.

<!-- LESSON_FOOTER_START -->

---

**Previous:** [Day 94 – Day 94: Data Query Language (DQL)](../Day_94_Data_Query_Language/README.md) • **Next:** [Day 96 – Day 96: Subqueries](../Day_96_Subqueries/README.md)

_You are on lesson 95 of 108._

<!-- LESSON_FOOTER_END -->