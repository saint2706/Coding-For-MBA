---
title: "Day 85 \u2013 Advanced SQL and Performance Tuning"
tags:
- Advanced
- SQL
---

## Introduction

This lesson delves into advanced SQL techniques and performance tuning, essential skills for any
business intelligence professional. We will explore complex queries, window functions, and indexing
strategies to optimize database performance.

## Common Table Expressions (CTEs)

A Common Table Expression (CTE) is a temporary, named result set that you can reference within a
`SELECT`, `INSERT`, `UPDATE`, or `DELETE` statement. CTEs help simplify complex queries by breaking
them down into smaller, more readable parts.

### Syntax

```sql
WITH cte_name (column1, column2, ...)
AS (
    -- Query that defines the CTE
    SELECT ...
    FROM ...
    WHERE ...
)
-- Main query
SELECT ...
FROM cte_name;
```

### Example

Suppose we have a table `Employees` and we want to select employees who earn a salary above $50,000.

```sql
WITH HighEarningEmployees AS (
    SELECT EmployeeID, FirstName, LastName, Salary
    FROM Employees
    WHERE Salary > 50000
)
SELECT EmployeeID, FirstName, LastName
FROM HighEarningEmployees;
```

## Window Functions

A window function performs a calculation across a set of table rows that are somehow related to the
current row. Unlike aggregate functions, window functions do not cause rows to become grouped into a
single output row.

### Common Window Functions

- `SUM()`, `COUNT()`, `AVG()`
- `ROW_NUMBER()`
- `RANK()`, `DENSE_RANK()`
- `NTILE()`
- `LAG()`, `LEAD()`

### Syntax

```sql
<window_function>() OVER (
    [PARTITION BY partition_expression, ... ]
    [ORDER BY sort_expression [ASC | DESC], ... ]
)
```

### Example

Here's how to create a running total of sales, partitioned by product category:

```sql
SELECT
    ProductName,
    Category,
    Sales,
    SUM(Sales) OVER (PARTITION BY Category ORDER BY OrderDate) AS RunningTotal
FROM
    SalesData;
```

## Indexing Strategies

Indexes are special lookup tables that the database search engine can use to speed up data
retrieval. An index in a database is very similar to an index in the back of a book.

### General Indexing Guidelines

- **Create indexes on frequently used columns:** Columns that are often used in `WHERE` clauses,
  `JOIN` conditions, and `ORDER BY` clauses are good candidates for indexing.
- **Keep indexes narrow:** Avoid adding unnecessary columns to your indexes.
- **Use unique indexes where possible:** Unique indexes provide more information to the query
  optimizer.
- **Consider filtered indexes:** For columns with well-defined subsets of data, a filtered index can
  be more efficient than a full-table index.

### Clustered vs. Nonclustered Indexes

- **Clustered Index:** A clustered index determines the physical order of data in a table. There can
  be only one clustered index per table.
- **Nonclustered Index:** A nonclustered index has a structure separate from the data rows. A table
  can have multiple nonclustered indexes.

## Exercises

1. **CTE Practice:** Write a query using a CTE to find the top 10 customers by total sales from a
   `Sales` table with `CustomerID` and `SaleAmount` columns.
1. **Window Function Practice:** Use a window function to calculate a 7-day moving average of sales
   from a `Sales` table with a `SaleDate` and `SaleAmount` column.
1. **Indexing Analysis:** Analyze a slow-running query on a large table. Identify which columns
   would benefit from an index and write the `CREATE INDEX` statement.

<!-- LESSON_FOOTER_START -->

---

**Previous:** [Day 84 – Day 84 – BI Career Development and Capstone](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_84_BI_Career_Development_and_Capstone/README.md) • **Next:** [Day 86 – Day 86 – BI in the Cloud](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_86_BI_Cloud/README.md)

_You are on lesson 85 of 108._

<!-- LESSON_FOOTER_END -->