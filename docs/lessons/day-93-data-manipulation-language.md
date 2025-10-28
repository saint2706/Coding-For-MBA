Welcome to Day 93! Today, we'll learn about **Data Manipulation Language (DML)**, a subset of SQL used to manage data within database objects.

## What is DML?

DML commands are used to insert, update, and delete data in a database. Unlike DDL commands, which work on the structure of the database, DML commands work on the data itself.

## Key DML Commands

### INSERT
- **Definition:** The `INSERT` command is used to add new rows of data to a table.
- **Syntax:**
  ```sql
  INSERT INTO table_name (column1, column2, column3, ...)
  VALUES (value1, value2, value3, ...);
  ```

### UPDATE
- **Definition:** The `UPDATE` command is used to modify existing records in a table.
- **Syntax:**
  ```sql
  UPDATE table_name
  SET column1 = value1, column2 = value2, ...
  WHERE condition;
  ```
  **Note:** The `WHERE` clause is crucial! If you omit it, all records in the table will be updated.

### DELETE
- **Definition:** The `DELETE` command is used to remove existing records from a table.
- **Syntax:**
  ```sql
  DELETE FROM table_name WHERE condition;
  ```
  **Note:** The `WHERE` clause is crucial! If you omit it, all records in the table will be deleted.

## 💻 Exercises: Day 93

Please see the `exercises.sql` file for today's exercises.