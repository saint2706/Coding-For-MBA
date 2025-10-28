# 📘 Day 31: Working with Databases in Python

While CSV files are great for smaller datasets, most real-world business data is stored in
**databases**. Databases are systems designed for storing, managing, and retrieving large amounts of
structured data efficiently and safely.

As a data analyst, you will almost certainly need to pull data from a database. Learning to do this
with Python is a critical skill.

## Why Databases?

- **Persistence:** The data is stored safely on disk and doesn't disappear when you turn off your
  computer.
- **Scalability:** Databases are designed to handle enormous amounts of data—far more than can fit
  in a spreadsheet.
- **Querying:** Databases use a powerful language called **SQL (Structured Query Language)** to let
  you select, filter, and aggregate the exact data you need.
- **Concurrency:** They allow multiple users to access and modify the data at the same time without
  conflicts.

## Introduction to SQL

SQL is the standard language for relational databases. Here are a few of the most important
commands:

- `SELECT [column1], [column2]`: Specifies the columns you want.
- `FROM [table]`: Specifies the table you're getting data from.
- `WHERE [condition]`: Filters the rows based on a condition.
- `GROUP BY [column]`: Groups rows that have the same values into summary rows.
- `JOIN`: Combines rows from two or more tables based on a related column.

## Python's `sqlite3` Module

Python has a built-in module called `sqlite3` that allows you to work with a lightweight, serverless
database called SQLite. The entire database is just a single file on your computer, making it
perfect for learning and for smaller applications.

The standard workflow is:

1. **Connect:** Create a connection object to the database file.
1. **Cursor:** Create a cursor object, which allows you to execute SQL commands.
1. **Execute:** Run your SQL query.
1. **Fetch:** Retrieve the results from the cursor.
1. **Close:** Close the connection.

```python
import sqlite3

# 1. Connect to the database (creates the file if it doesn't exist)
conn = sqlite3.connect('my_database.db')
# 2. Create a cursor
cur = conn.cursor()
# 3. Execute a query
cur.execute("SELECT * FROM employees WHERE department = 'Sales';")
# 4. Fetch the results
sales_employees = cur.fetchall()
# 5. Close the connection
conn.close()
```

## The Pandas Way: `read_sql_query`

The `sqlite3` workflow is a bit verbose. For data analysis, there's a much easier way. Pandas can
interact with databases directly and load the results of a query into a DataFrame.

The `pd.read_sql_query()` function takes an SQL query and a connection object and returns a full
DataFrame. This is the method you will use most of the time.

```python
import pandas as pd
import sqlite3

conn = sqlite3.connect('my_database.db')
sql_query = "SELECT * FROM employees WHERE department = 'Sales';"

sales_df = pd.read_sql_query(sql_query, conn)

conn.close()
# sales_df is now a Pandas DataFrame ready for analysis!
```

## 💻 Exercises: Day 31

1. **Create and Populate a Database:**

   - Write a script that creates a new SQLite database called `company.db`.
   - Create a table named `products` with three columns: `product_id` (INTEGER), `name` (TEXT), and
     `price` (REAL).
   - Insert 3-4 sample products into the table.

1. **Query with `sqlite3`:**

   - Write a script that connects to the `company.db` you created.
   - Execute a SQL query to select all products with a price greater than $100.
   - Fetch all the results and loop through them, printing each one.

1. **Query with Pandas:**

   - Write a script that connects to the `company.db`.
   - Use `pd.read_sql_query()` to select all records from the `products` table and load them into a
     DataFrame.
   - Print the DataFrame.

🎉 **Excellent!** You can now connect to and retrieve data from a database, the primary source of
truth for most businesses. Knowing how to pull data directly into a Pandas DataFrame is a workflow
you will use constantly as a data analyst.
