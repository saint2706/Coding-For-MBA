---
title: "Day 103: Pivoting Data"
tags:
  - Data
  - SQL
---

# 📘 Day 103: Pivoting Data

Welcome to Day 103! Today, we'll learn about **Pivoting Data**, a technique used to transform data
from a row-level format to a columnar format.

## What is Pivoting?

Pivoting is a data transformation technique that rotates a table by turning unique values from one
column into separate columns. This is a common operation in data analysis and reporting to summarize
data and make it easier to read.

### Example

Imagine you have a `sales` table like this:

| Product | Quarter | Sales | |---|---|---| | Laptop | Q1 | 1000 | | Laptop | Q2 | 1200 | | Mouse |
Q1 | 200 | | Mouse | Q2 | 250 |

After pivoting, you might have a table like this:

| Product | Q1 | Q2 | |---|---|---| | Laptop | 1000 | 1200 | | Mouse | 200 | 250 |

## Pivoting in SQL

Different SQL dialects have different ways of pivoting data.

### `CASE` Statement (Standard SQL)

You can use the `CASE` statement with an aggregate function to pivot data in standard SQL.

```sql
SELECT
    Product,
    SUM(CASE WHEN Quarter = 'Q1' THEN Sales ELSE 0 END) AS Q1,
    SUM(CASE WHEN Quarter = 'Q2' THEN Sales ELSE 0 END) AS Q2
FROM sales
GROUP BY Product;
```

### `PIVOT` Operator (SQL Server)

SQL Server has a built-in `PIVOT` operator that makes this easier.

```sql
SELECT Product, Q1, Q2
FROM (
    SELECT Product, Quarter, Sales
    FROM sales
) AS SourceTable
PIVOT (
    SUM(Sales)
    FOR Quarter IN (Q1, Q2)
) AS PivotTable;
```

## 💻 Exercises: Day 103

Please see the `exercises.sql` file for today's exercises.

<!-- LESSON_FOOTER_START -->

---

**Previous:** [Day 102 – Day 102: Common Table Expressions (CTEs)](../Day_102_Common_Table_Expressions/README.md) • **Next:** [Day 104 – Day 104: Database Design and Normalization](../Day_104_Database_Design_and_Normalization/README.md)

_You are on lesson 103 of 108._

<!-- LESSON_FOOTER_END -->
