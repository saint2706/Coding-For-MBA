# 📘 Day 100: Stored Procedures

Welcome to Day 100! Today, we'll learn about **Stored Procedures**, which are prepared SQL code that you can save, so the code can be reused over and over again.

## What is a Stored Procedure?

A stored procedure is a set of SQL statements that can be executed as a single unit. Stored procedures are stored in the database and can be called from an application.

### Key Benefits
- **Performance:** Stored procedures are pre-compiled, which can lead to better performance.
- **Reusability:** Stored procedures can be called from multiple applications, which reduces code duplication.
- **Security:** You can grant permissions to execute a stored procedure, but not to the underlying tables, which can enhance security.

## Creating and Executing Stored Procedures

### `CREATE PROCEDURE`
The `CREATE PROCEDURE` statement is used to create a new stored procedure.
```sql
CREATE PROCEDURE ProcedureName
AS
sql_statement
GO;
```

### `EXEC`
The `EXEC` statement is used to execute a stored procedure.
```sql
EXEC ProcedureName;
```
**Note:** The syntax for creating and executing stored procedures can vary between different SQL databases. The examples above are for SQL Server. SQLite does not support stored procedures.

## 💻 Exercises: Day 100

Since SQLite does not support stored procedures, the exercises for today are conceptual. Please review the `README.md` file and make sure you understand the following concepts:
- What a stored procedure is.
- The benefits of using stored procedures.
- The basic syntax for creating and executing a stored procedure (in a database like SQL Server or MySQL).
