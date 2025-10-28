---
title: 'Day 98: Indexes'
tags:
  - SQL
---

Welcome to Day 98! Today, we'll learn about **Indexes**, a crucial performance-tuning feature in
databases.

## What is an Index?

An index is a data structure that improves the speed of data retrieval operations on a database
table. Indexes are used to quickly locate data without having to search every row in a database
table every time a table is accessed.

### Key Points

- Indexes are special lookup tables that the database search engine can use to speed up data
  retrieval.
- An index is a pointer to data in a table.
- Indexes are created on columns that are frequently used in `WHERE` clauses.
- While indexes speed up data retrieval, they can slow down data modification (`INSERT`, `UPDATE`,
  `DELETE`) because the index also needs to be updated.

## Creating and Managing Indexes

### `CREATE INDEX`

The `CREATE INDEX` statement is used to create an index on a table. Duplicates are allowed.

```sql
CREATE INDEX index_name
ON table_name (column1, column2, ...);
```

### `CREATE UNIQUE INDEX`

The `CREATE UNIQUE INDEX` statement creates a unique index on a table. Duplicate values are not
allowed.

```sql
CREATE UNIQUE INDEX index_name
ON table_name (column1, column2, ...);
```

### `DROP INDEX`

The `DROP INDEX` statement is used to delete an index in a table.

```sql
DROP INDEX index_name ON table_name;
```

## 💻 Exercises: Day 98

Please see the `exercises.sql` file for today's exercises.

<!-- LESSON_FOOTER_START -->

______________________________________________________________________

**Previous:** [Day 97 – Day 97: Views](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_97_Views/README.md) • **Next:** [Day 99 – Day 99: Transactions](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_99_Transactions/README.md)

_You are on lesson 98 of 108._

<!-- LESSON_FOOTER_END -->
