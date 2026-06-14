---
day: 31
title: "Databases with SQL"
phase: 3
phaseTitle: "Data Engineering & Web Development"
slug: "databases-sql"
duration: 55
difficulty: "intermediate"
tags: [python, sqlite, sql, databases]
concepts: [relational databases, SQL queries, CRUD operations, joins]
prerequisites: [25]
outcomes: [Connect to SQLite databases, Execute SQL queries, Perform CRUD operations]
---

# 🎯 Day 31: Databases with SQL

> *"CSVs are fine. Databases are professional."*

---

## The "Never-Coded" Bridge

**Imagine your sales data grows from 1,000 to 10 million rows.** Excel crashes. CSVs take forever to load. Your analysis grinds to a halt.

**Databases solve this.** They're designed to handle millions of rows efficiently, with built-in indexing, relationships, and concurrent access.

**Why databases matter:**

- **Speed**: Queries run in milliseconds, not minutes
- **Integrity**: Enforce data types, prevent duplicates
- **Concurrency**: Multiple users access simultaneously
- **Persistence**: Data survives program crashes

**Real-world uses:**

- Every website you use stores data in databases
- Every business application relies on them
- Every analytics platform queries them

---

## The Technical Deep Dive

### Connecting to SQLite

```python
import sqlite3
import pandas as pd

# Create or connect to database
conn = sqlite3.connect("business.db")
cursor = conn.cursor()

# Create a table
cursor.execute("""
CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    department TEXT,
    salary REAL,
    hire_date TEXT
)
""")
conn.commit()
```

### CRUD Operations

```python
# CREATE - Insert data
cursor.execute(
    """
INSERT INTO employees (name, department, salary, hire_date)
VALUES (?, ?, ?, ?)
""",
    ("Alice", "Engineering", 85000, "2023-01-15"),
)

# Insert multiple rows
employees_data = [
    ("Bob", "Sales", 75000, "2023-02-01"),
    ("Charlie", "Engineering", 90000, "2023-03-10"),
    ("Diana", "Marketing", 70000, "2023-04-20"),
]
cursor.executemany(
    """
INSERT INTO employees (name, department, salary, hire_date)
VALUES (?, ?, ?, ?)
""",
    employees_data,
)
conn.commit()

# READ - Query data
cursor.execute("SELECT * FROM employees")
rows = cursor.fetchall()
for row in rows:
    print(row)

# UPDATE - Modify data
cursor.execute(
    """
UPDATE employees SET salary = ? WHERE name = ?
""",
    (95000, "Charlie"),
)
conn.commit()

# DELETE - Remove data
cursor.execute("DELETE FROM employees WHERE name = ?", ("Bob",))
conn.commit()
```

### Querying with Pandas

```python
import pandas as pd

# Read SQL into DataFrame
df = pd.read_sql_query("SELECT * FROM employees", conn)
print(df)

# Query with conditions
df = pd.read_sql_query(
    """
SELECT name, salary FROM employees
WHERE department = 'Engineering' AND salary > 80000
ORDER BY salary DESC
""",
    conn,
)
print(df)

# Write DataFrame to SQL
new_data = pd.DataFrame(
    {
        "name": ["Eve", "Frank"],
        "department": ["HR", "Engineering"],
        "salary": [65000, 88000],
        "hire_date": ["2024-01-01", "2024-02-15"],
    }
)
new_data.to_sql("employees", conn, if_exists="append", index=False)
```

### SQL Fundamentals

```sql
-- SELECT with conditions
SELECT name, salary FROM employees WHERE salary > 80000;

-- Aggregations
SELECT department, AVG(salary) as avg_salary
FROM employees
GROUP BY department;

-- Sorting
SELECT * FROM employees ORDER BY salary DESC LIMIT 5;

-- Counting
SELECT department, COUNT(*) as count
FROM employees
GROUP BY department;

-- JOINs
SELECT e.name, d.department_name
FROM employees e
JOIN departments d ON e.department_id = d.id;
```

---

## Senior-Level Insights

### SQL Injection Prevention

**Why parameterized queries work — the mechanism:**

In a **vulnerable query** like:
```python
cursor.execute(f"SELECT * FROM users WHERE name = '{user_input}'")
```
The database receives a single string of SQL code and executes whatever text it finds — including any SQL commands hidden inside `user_input`. If `user_input` is `"'; DROP TABLE users; --"`, the database executes the DROP.

In a **parameterized query**:
```python
cursor.execute("SELECT * FROM users WHERE name = ?", (user_input,))
```
The database driver separates the **SQL template** from the **data values**. The `?` is a placeholder that the database driver fills in *after* parsing the SQL structure. Critically, the driver **treats the substituted value as a literal string only**, never as executable SQL code. No amount of SQL syntax in `user_input` can be interpreted as a command — the database sees it as text data, not instructions.

**Bottom line:** Always use `?` (SQLite) or `%s` (PostgreSQL/MySQL) placeholders. Never use f-strings or `.format()` to build SQL queries with user-supplied data.

```python
# NEVER do this (SQL injection vulnerability):
name = "'; DROP TABLE employees; --"
cursor.execute(f"SELECT * FROM employees WHERE name = '{name}'")  # DANGEROUS!

# ALWAYS use parameterized queries:
cursor.execute("SELECT * FROM employees WHERE name = ?", (name,))  # SAFE
```

### Performance Tips

| Scenario                | Solution                                  |
| ----------------------- | ----------------------------------------- |
| Slow queries            | Add indexes on frequently queried columns |
| Large inserts           | Use transactions, batch operations        |
| Complex aggregations    | Create summary tables                     |
| Frequent simple lookups | Use in-memory SQLite or caching           |

### When to Use What

| Data Size     | Tool                       |
| ------------- | -------------------------- |
| < 10K rows    | CSV or SQLite              |
| 10K - 1M rows | SQLite                     |
| > 1M rows     | PostgreSQL, MySQL          |
| Distributed   | Cloud databases (BigQuery) |

> **SQLite Concurrency Warning:** SQLite locks the **entire database file** during writes. If two processes try to write simultaneously, one will wait (or fail with a `OperationalError: database is locked`). For applications with concurrent writes (e.g., a web server with multiple users), upgrade to PostgreSQL or MySQL. SQLite is excellent for: single-user tools, prototypes, read-heavy workloads, and embedded databases (e.g., mobile apps).

---

## Hands-on Lab

### Exercise 1: Employee Database

**Business Scenario:** HR needs a quick analysis of average salaries by department from the company's SQLite employee database. The database doesn't exist yet, so you'll create it, populate it with sample data, and run aggregation queries to produce the report.

**Your Task:**
1. Create an SQLite database (in-memory with `:memory:` is fine)
2. Create an `employees` table with columns: `id`, `name`, `department`, `salary`, `hire_date`
3. Insert at least 6 employee records across 3 departments
4. Query: average salary by department (ORDER BY avg salary descending)
5. Query: employees hired in the last 2 years
6. Print results in a formatted way

**Sample Data to Insert:**
| name | department | salary | hire_date |
|------|-----------|--------|-----------|
| Alice Johnson | Engineering | 95000 | 2023-01-15 |
| Bob Smith | Marketing | 72000 | 2022-06-01 |
| Charlie Brown | Engineering | 88000 | 2021-03-20 |
| Diana Prince | HR | 68000 | 2023-09-10 |
| Eve Wilson | Marketing | 76000 | 2020-01-05 |
| Frank Castle | Engineering | 102000 | 2024-02-14 |

```python
import sqlite3
import pandas as pd


def create_employee_db():
    conn = sqlite3.connect(":memory:")  # In-memory database

    # Create table
    conn.execute("""
    CREATE TABLE employees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        department TEXT,
        salary REAL
    )
    """)

    # Insert sample data
    data = [
        ("Alice", "Engineering", 85000),
        ("Bob", "Sales", 75000),
        ("Charlie", "Engineering", 90000),
        ("Diana", "Marketing", 70000),
        ("Eve", "Sales", 78000),
    ]
    conn.executemany(
        "INSERT INTO employees (name, department, salary) VALUES (?, ?, ?)", data
    )

    # Query: Average salary by department
    df = pd.read_sql_query(
        """
    SELECT department, AVG(salary) as avg_salary, COUNT(*) as count
    FROM employees
    GROUP BY department
    ORDER BY avg_salary DESC
    """,
        conn,
    )
    print("Salary by Department:")
    print(df)

    return conn


conn = create_employee_db()
```

**Expected Output:**
```
=== Average Salary by Department ===
   department  avg_salary  employee_count
0  Engineering    95000.00               3
1  Marketing       74000.00               2
2  HR              68000.00               1

=== Recently Hired Employees (last 2 years) ===
   name           department  salary  hire_date
0  Alice Johnson  Engineering  95000  2023-01-15
1  Diana Prince   HR           68000  2023-09-10
2  Frank Castle   Engineering 102000  2024-02-14
```

### Exercise 2: Sales Analytics

**Business Scenario:** The Sales team keeps daily transaction records in SQLite. The CFO wants a weekly summary: total revenue per product, the top 3 highest-value transactions, and month-over-month comparison. You'll build the queries and return the results as DataFrames.

**Your Task:**
1. Create and populate a `sales` table (or use the existing one in the lesson)
2. Query: total revenue and transaction count per product (sorted by revenue desc)
3. Query: top 3 highest-value transactions with customer name and product
4. Use Pandas to read the results: `pd.read_sql_query(sql, conn)`
5. Print both DataFrames

**Expected Output:**
```
=== Revenue by Product ===
      product  total_revenue  transactions
0  Laptop Pro     1999.98              2
1    Monitor      299.99              1
2   Keyboard       79.99              1
3      Mouse       29.99              1

=== Top 3 Transactions ===
   customer       product  amount        date
0  Alice          Laptop Pro  999.99  2024-01-15
1  Charlie        Laptop Pro  999.99  2024-01-15
2  Diana          Monitor     299.99  2024-01-16
```

```python
import sqlite3
import pandas as pd
import numpy as np


def create_sales_db():
    conn = sqlite3.connect(":memory:")

    # Create tables
    conn.execute("""
    CREATE TABLE products (
        id INTEGER PRIMARY KEY,
        name TEXT,
        price REAL
    )
    """)

    conn.execute("""
    CREATE TABLE sales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER,
        quantity INTEGER,
        sale_date TEXT,
        FOREIGN KEY (product_id) REFERENCES products(id)
    )
    """)

    # Insert products
    products = [(1, "Laptop", 999), (2, "Mouse", 29), (3, "Keyboard", 79)]
    conn.executemany("INSERT INTO products VALUES (?, ?, ?)", products)

    # Insert sales
    sales = [
        (1, 5, "2024-01-15"),
        (2, 20, "2024-01-15"),
        (1, 3, "2024-01-16"),
        (3, 10, "2024-01-16"),
        (2, 15, "2024-01-17"),
        (1, 2, "2024-01-17"),
    ]
    conn.executemany(
        "INSERT INTO sales (product_id, quantity, sale_date) VALUES (?, ?, ?)", sales
    )

    # Revenue analysis with JOIN
    df = pd.read_sql_query(
        """
    SELECT p.name, SUM(s.quantity) as units_sold, 
           SUM(s.quantity * p.price) as revenue
    FROM sales s
    JOIN products p ON s.product_id = p.id
    GROUP BY p.name
    ORDER BY revenue DESC
    """,
        conn,
    )
    print("Revenue by Product:")
    print(df)

    return conn


create_sales_db()
```

### Exercise 3: DataFrame to Database

**Business Scenario:** You've cleaned a large CSV of customer survey responses in Pandas. Now you need to persist it to SQLite so other team members can query it with SQL tools like DBeaver or Tableau. The pipeline must be idempotent — running it twice should not create duplicates.

**Your Task:**
1. Create a Pandas DataFrame representing customer survey results (5+ rows, 4+ columns)
2. Write it to SQLite using `df.to_sql("table_name", conn, if_exists="replace", index=False)`
3. Read it back with `pd.read_sql_query()` to verify the round-trip
4. Add a new column to the DataFrame and use `if_exists="replace"` to update the table
5. Print the final table

**Expected Output:**
```
Written 5 rows to SQLite table 'customer_survey'

=== Round-trip Verification ===
   customer_id       name  nps_score  product  satisfaction
0            1     Alice           9   Laptop          High
1            2       Bob           7    Mouse        Medium
2            3   Charlie          10  Keyboard          High
3            4     Diana           6   Monitor          Low
4            5       Eve           8   Laptop        Medium

Table updated with satisfaction column. Final shape: (5, 5)
```

```python
import sqlite3
import pandas as pd
import numpy as np

# Create sample DataFrame
np.random.seed(42)
df = pd.DataFrame(
    {
        "customer_id": range(1, 101),
        "name": [f"Customer_{i}" for i in range(1, 101)],
        "total_purchases": np.random.uniform(100, 5000, 100),
        "signup_date": pd.date_range("2023-01-01", periods=100, freq="D"),
    }
)

# Save to database
conn = sqlite3.connect("customers.db")
df.to_sql("customers", conn, if_exists="replace", index=False)

# Query back with filtering
top_customers = pd.read_sql_query(
    """
SELECT * FROM customers
WHERE total_purchases > 3000
ORDER BY total_purchases DESC
LIMIT 10
""",
    conn,
)
print("Top 10 Customers:")
print(top_customers)

conn.close()
```

### Reliability & Maintainability Tasks

- Add transaction boundaries and rollback handling for all multi-step writes.
- Document indexing decisions (`why this index exists`) alongside each analytics query.
- Add a lightweight data contract for key tables (required columns, data types, uniqueness rules).

### Exercise 4: Failure Injection — Partial Commit Bug

Inject a failure between two dependent inserts (for example, write to `orders` succeeds but write to `order_items` fails).

Your debugging goals:

1. Reproduce the inconsistent state intentionally.
2. Wrap writes in a transaction and confirm rollback restores consistency.
3. Add a verification query that fails CI if orphaned records appear.

---

## Mastery Check

### Question 1: SQL vs CSV

When should you use a database instead of CSV files?

<details>
<summary>Click for Answer</summary>

Use databases when:

- Data exceeds ~100K rows
- Multiple users need concurrent access
- You need to enforce relationships between tables
- Data integrity matters (unique constraints, types)
- You need fast filtered queries

Use CSVs when:

- Quick one-time analysis
- Sharing simple data with non-programmers
- Data is read-only and small

</details>

### Question 2: SQL Injection

Why is this code dangerous?

```python
name = input("Enter name: ")
cursor.execute(f"SELECT * FROM users WHERE name = '{name}'")
```

<details>
<summary>Click for Answer</summary>

SQL injection vulnerability. If user enters: `'; DROP TABLE users; --`

The query becomes:

```sql
SELECT * FROM users WHERE name = ''; DROP TABLE users; --'
```

**Fix**: Use parameterized queries:

```python
cursor.execute("SELECT * FROM users WHERE name = ?", (name,))
```

</details>

### Question 3: JOINs

What does this query return?

```sql
SELECT e.name, d.name FROM employees e
LEFT JOIN departments d ON e.dept_id = d.id
```

<details>
<summary>Click for Answer</summary>

Returns all employees with their department names. If an employee has no matching department (NULL dept_id), they still appear with NULL for department name.

- INNER JOIN: Only matching rows
- LEFT JOIN: All from left table, matched from right
- RIGHT JOIN: All from right table, matched from left

</details>

### Question 4: Performance Issue

Your query takes 30 seconds on a million-row table:

```sql
SELECT * FROM orders WHERE customer_email = 'user@example.com'
```

<details>
<summary>Click for Answer</summary>

**Problem**: No index on `customer_email` column → full table scan

**Fix**: Create an index:

```sql
CREATE INDEX idx_customer_email ON orders (customer_email);
```

Now the query uses the index for fast lookups.

</details>

### Question 5: Transaction

What happens if your program crashes mid-insert with 500 of 1000 rows inserted?

<details>
<summary>Click for Answer</summary>

Without explicit transaction: 500 rows saved (partial state, data corruption)

With transaction:

```python
try:
    cursor.executemany("INSERT ...", data)
    conn.commit()  # All or nothing
except:
    conn.rollback()  # Undo everything
```

Transactions ensure atomicity—all succeed or all fail.

</details>

---

## Summary

- ✅ Connect to SQLite with `sqlite3`
- ✅ Execute CRUD operations (Create, Read, Update, Delete)
- ✅ Use parameterized queries to prevent SQL injection
- ✅ Query databases with pandas `read_sql_query()`
- ✅ Understand JOINs for related tables

**Tomorrow**: NoSQL databases for when relational doesn't fit.
