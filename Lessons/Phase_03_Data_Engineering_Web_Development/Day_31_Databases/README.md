---
day: 31
title: "SQL Databases"
phase: 3
phaseTitle: "Data Engineering & Web Development"
slug: "sql-databases"
duration: 55
difficulty: "intermediate"
tags: [python, sqlite, sql, databases]
concepts: [database connections, SQL queries from Python, CRUD operations]
prerequisites: [16, 23]
outcomes: [Connect to SQLite from Python, Execute SQL queries, Convert results to DataFrames]
---

# 🎯 Day 31: SQL Databases with Python

> *"SQL is the language of data. Python is its interpreter."*

---

## The "Never-Coded" Bridge

DataFrames are great for analysis. But when data grows to millions of rows, you need databases. Python's `sqlite3` lets you query databases directly.

---

## The Technical Deep Dive

### SQLite Basics

```python
import sqlite3

# Connect (creates file if doesn't exist)
conn = sqlite3.connect("mydata.db")
cursor = conn.cursor()

# Create table
cursor.execute("""
    CREATE TABLE IF NOT EXISTS employees (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        department TEXT,
        salary REAL
    )
""")

# Insert data
cursor.execute(
    "INSERT INTO employees (name, department, salary) VALUES (?, ?, ?)",
    ("Alice", "Engineering", 85000)
)

conn.commit()
```

### Querying Data

```python
# Select all
cursor.execute("SELECT * FROM employees")
rows = cursor.fetchall()
for row in rows:
    print(row)

# With conditions
cursor.execute("SELECT name, salary FROM employees WHERE salary > ?", (70000,))

# Aggregate
cursor.execute("SELECT department, AVG(salary) FROM employees GROUP BY department")
```

### Pandas Integration

```python
import pandas as pd
import sqlite3

conn = sqlite3.connect("mydata.db")

# Read SQL to DataFrame
df = pd.read_sql_query("SELECT * FROM employees", conn)

# Write DataFrame to SQL
df.to_sql("employees_backup", conn, if_exists="replace", index=False)

conn.close()
```

### Context Manager Pattern

```python
import sqlite3

with sqlite3.connect("mydata.db") as conn:
    df = pd.read_sql_query("SELECT * FROM employees WHERE department = 'Engineering'", conn)
# Connection automatically closed
```

---

## Hands-on Lab

```python
import sqlite3
import pandas as pd

# Create sample database
conn = sqlite3.connect(":memory:")  # In-memory for demo

# Create and populate
conn.execute("""
    CREATE TABLE sales (
        id INTEGER PRIMARY KEY,
        product TEXT,
        region TEXT,
        amount REAL
    )
""")

data = [
    ("Laptop", "North", 999),
    ("Mouse", "South", 29),
    ("Laptop", "North", 999),
    ("Keyboard", "East", 79),
]

conn.executemany("INSERT INTO sales (product, region, amount) VALUES (?, ?, ?)", data)

# Query with Pandas
df = pd.read_sql_query("""
    SELECT region, SUM(amount) as total
    FROM sales
    GROUP BY region
    ORDER BY total DESC
""", conn)

print(df)
conn.close()
```

---

## Summary

- ✅ `sqlite3` connects Python to databases
- ✅ Execute SQL with `cursor.execute()`
- ✅ `pd.read_sql_query()` returns DataFrames
- ✅ Use context managers for safe connections

**Tomorrow**: Other database types (PostgreSQL, MongoDB).
