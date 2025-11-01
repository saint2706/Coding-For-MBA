---
title: 'Day 99: Transactions'
tags:
  - SQL
---

Welcome to Day 99! Today, we'll learn about **Transactions**, a sequence of operations performed as
a single logical unit of work.

## What is a Transaction?

A transaction is a unit of work that is performed against a database. Transactions are used to
ensure data integrity. All the statements in a transaction are executed as a single unit. If any
statement in the transaction fails, the entire transaction is rolled back, and the database is left
in its original state.

### ACID Properties

Transactions have four standard properties, often referred to by the acronym ACID:

- **Atomicity:** Ensures that all operations within a work unit are completed successfully.
  Otherwise, the transaction is aborted at the point of failure, and all the previous operations are
  rolled back to their former state.
- **Consistency:** Ensures that the database properly changes states upon a successfully committed
  transaction.
- **Isolation:** Enables transactions to operate independently of and transparent to each other.
- **Durability:** Ensures that the result or effect of a committed transaction persists in case of a
  system failure.

## Transaction Control Language (TCL)

### `BEGIN TRANSACTION`

Starts a new transaction.

### `COMMIT`

Saves all the changes made in the current transaction.

### `ROLLBACK`

Undoes all the changes made in the current transaction.

### `SAVEPOINT`

Creates a point within a transaction to which you can later roll back.

## 💻 Exercises: Day 99

Please see the `exercises.sql` file for today's exercises.

<!-- LESSON_FOOTER_START -->

______________________________________________________________________

**Previous:** [Day 98 – Day 98: Indexes](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_98_Indexes/README.md) • **Next:** [Day 100 – Day 100: Stored Procedures](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_100_Stored_Procedures/README.md)

_You are on lesson 99 of 108._

<!-- LESSON_FOOTER_END -->