---
title: 'Day 91: Relational Databases'
tags:
  - Data
  - Database
  - SQL
---

Welcome to Day 91! Today, we'll dive deep into the foundational concepts of **Relational
Databases**.

## What is a Relational Database?

A relational database is a type of database that stores and provides access to data points that are
related to one another. Relational databases are based on the relational model, an intuitive,
straightforward way of representing data in tables.

In a relational database, each row in the table is a record with a unique ID called the key. The
columns of the table hold attributes of the data, and each record usually has a value for each
attribute, making it easy to establish relationships among data points.

## Key Concepts

### Tables

- **Definition:** A table is a collection of related data held in a table format within a database.
  It consists of columns and rows.
- **Example:** A table named `employees` might store information about the employees in a company.

### Rows (Records)

- **Definition:** A row, also called a record, represents a single, implicitly structured data item
  in a table.
- **Example:** In the `employees` table, a row would represent a single employee.

### Columns (Attributes)

- **Definition:** A column, also called an attribute, is a set of data values of a particular simple
  type, one for each row of the table.
- **Example:** In the `employees` table, columns might include `employee_id`, `first_name`,
  `last_name`, and `hire_date`.

### Primary Key

- **Definition:** A primary key is a key in a relational database that is unique for each record. It
  is a unique identifier, such as a driver's license number, telephone number (including area code),
  or vehicle identification number (VIN). A relational database must always have one and only one
  primary key.
- **Example:** In the `employees` table, `employee_id` would be the primary key.

### Foreign Key

- **Definition:** A foreign key is a key used to link two tables together. It is a field (or
  collection of fields) in one table that refers to the PRIMARY KEY in another table.
- **Example:** If we have a `departments` table with a primary key `department_id`, we can add a
  `department_id` column to our `employees` table to specify which department each employee belongs
  to. This `department_id` in the `employees` table is a foreign key.

### Relationships

- **One-to-One:** Each record in one table is linked to one and only one record in another table.
- **One-to-Many:** A record in one table can be linked to many records in another table. (e.g., one
  department has many employees).
- **Many-to-Many:** Many records in one table are linked to many records in another table. (e.g.,
  many students can be enrolled in many courses).

## 💻 Exercises: Day 91

Please see the `exercises.sql` file for today's exercises.

<!-- LESSON_FOOTER_START -->

______________________________________________________________________

**Previous:** [Day 90 – Day 90 – Career Workshop and Next Steps](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_90_Career_Workshop/README.md) • **Next:** [Day 92 – Day 92: Data Definition Language (DDL)](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_92_Data_Definition_Language/README.md)

_You are on lesson 91 of 108._

<!-- LESSON_FOOTER_END -->