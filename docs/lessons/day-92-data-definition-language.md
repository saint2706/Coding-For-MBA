---
title: 'Day 92: Data Definition Language (DDL)'
tags:
  - Data
  - NLP
  - SQL
---

Welcome to Day 92! Today, we'll learn about **Data Definition Language (DDL)**, a subset of SQL used
to create and manage database objects.

## What is DDL?

DDL is used to define the database schema. It includes commands to create, modify, and delete
database objects such as tables, indexes, and users.

## Key DDL Commands

### CREATE

- **Definition:** The `CREATE` command is used to create new database objects.
- **`CREATE DATABASE`:** Creates a new database.
- **`CREATE TABLE`:** Creates a new table in a database.
- **Syntax:**
  ```sql
  CREATE TABLE table_name (
      column1 datatype,
      column2 datatype,
      column3 datatype,
     ....
  );
  ```

### ALTER

- **Definition:** The `ALTER` command is used to modify the structure of an existing database
  object.
- **`ALTER TABLE`:** Used to add, delete, or modify columns in an existing table.
  - **`ADD`:** Adds a new column.
  - **`DROP COLUMN`:** Deletes a column.
  - **`MODIFY COLUMN`:** Changes the data type of a column.
- **Syntax:**
  ```sql
  ALTER TABLE table_name
  ADD column_name datatype;
  ```

### DROP

- **Definition:** The `DROP` command is used to delete existing database objects.
- **`DROP DATABASE`:** Deletes an entire database.
- **`DROP TABLE`:** Deletes a table.
- **Syntax:**
  ```sql
  DROP TABLE table_name;
  ```

### TRUNCATE

- **Definition:** The `TRUNCATE` command is used to delete all the data inside a table, but not the
  table itself.
- **Syntax:**
  ```sql
  TRUNCATE TABLE table_name;
  ```

## 💻 Exercises: Day 92

Please see the `exercises.sql` file for today's exercises.

<!-- LESSON_FOOTER_START -->

______________________________________________________________________

**Previous:** [Day 91 – Day 91: Relational Databases](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_91_Relational_Databases/README.md) • **Next:** [Day 93 – Day 93: Data Manipulation Language (DML)](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_93_Data_Manipulation_Language/README.md)

_You are on lesson 92 of 108._

<!-- LESSON_FOOTER_END -->