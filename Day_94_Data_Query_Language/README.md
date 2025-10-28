# 📘 Day 94: Data Query Language (DQL)

Welcome to Day 94! Today, we'll focus on the **Data Query Language (DQL)**, which is used to retrieve data from a database. While DQL technically only consists of the `SELECT` statement, it's the most commonly used part of SQL for data analysis.

## The `SELECT` Statement

The `SELECT` statement is used to query the database and retrieve data that matches criteria that you specify.

### Basic Syntax
```sql
SELECT column1, column2, ...
FROM table_name;
```

### `WHERE` Clause
The `WHERE` clause is used to filter records.
```sql
SELECT column1, column2, ...
FROM table_name
WHERE condition;
```

### `ORDER BY` Clause
The `ORDER BY` keyword is used to sort the result-set in ascending or descending order.
```sql
SELECT column1, column2, ...
FROM table_name
ORDER BY column1, column2, ... ASC|DESC;
```

### `GROUP BY` Clause
The `GROUP BY` statement groups rows that have the same values into summary rows, like "find the number of customers in each country". The `GROUP BY` statement is often used with aggregate functions (`COUNT`, `MAX`, `MIN`, `SUM`, `AVG`) to group the result-set by one or more columns.
```sql
SELECT COUNT(CustomerID), Country
FROM Customers
GROUP BY Country;
```

### `HAVING` Clause
The `HAVING` clause was added to SQL because the `WHERE` keyword could not be used with aggregate functions.
```sql
SELECT COUNT(CustomerID), Country
FROM Customers
GROUP BY Country
HAVING COUNT(CustomerID) > 5;
```

## 💻 Exercises: Day 94

Please see the `exercises.sql` file for today's exercises.
