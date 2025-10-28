# 📘 Day 97: Views

Welcome to Day 97! Today, we'll learn about **Views**, which are virtual tables based on the
result-set of an SQL statement.

## What is a View?

A view is a stored query that you can treat as a table. A view does not store any data itself, but
it presents data from one or more tables. Views are often used to simplify complex queries, to
restrict access to data, or to present data in a different format.

### Key Points

- A view contains rows and columns, just like a real table.
- The fields in a view are fields from one or more real tables in the database.
- You can add SQL functions, `WHERE`, and `JOIN` clauses to a view and present the data as if the
  data were coming from one single table.

## Creating and Managing Views

### `CREATE VIEW`

The `CREATE VIEW` statement is used to create a new view.

```sql
CREATE VIEW [View Name] AS
SELECT column1, column2, ...
FROM table_name
WHERE condition;
```

### `UPDATE VIEW`

The `CREATE OR REPLACE VIEW` statement is used to update a view.

```sql
CREATE OR REPLACE VIEW [View Name] AS
SELECT column1, column2, ...
FROM table_name
WHERE condition;
```

### `DROP VIEW`

The `DROP VIEW` statement is used to delete a view.

```sql
DROP VIEW [View Name];
```

## 💻 Exercises: Day 97

Please see the `exercises.sql` file for today's exercises.

<!-- LESSON_FOOTER_START -->

---

**Previous:** [Day 96 – Day 96: Subqueries](../Day_96_Subqueries/README.md) • **Next:** [Day 98 – Day 98: Indexes](../Day_98_Indexes/README.md)

_You are on lesson 97 of 108._

<!-- LESSON_FOOTER_END -->