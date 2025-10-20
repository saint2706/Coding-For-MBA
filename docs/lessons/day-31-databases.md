While CSV files are great for smaller datasets, most real-world business data is stored in **databases**. Databases are systems designed for storing, managing, and retrieving large amounts of structured data efficiently and safely.

As a data analyst, you will almost certainly need to pull data from a database. Learning to do this with Python is a critical skill.

## Why Databases?

- **Persistence:** The data is stored safely on disk and doesn't disappear when you turn off your computer.
- **Scalability:** Databases are designed to handle enormous amounts of data—far more than can fit in a spreadsheet.
- **Querying:** Databases use a powerful language called **SQL (Structured Query Language)** to let you select, filter, and aggregate the exact data you need.
- **Concurrency:** They allow multiple users to access and modify the data at the same time without conflicts.

## Introduction to SQL

SQL is the standard language for relational databases. Here are a few of the most important commands:

- `SELECT [column1], [column2]`: Specifies the columns you want.
- `FROM [table]`: Specifies the table you're getting data from.
- `WHERE [condition]`: Filters the rows based on a condition.
- `GROUP BY [column]`: Groups rows that have the same values into summary rows.
- `JOIN`: Combines rows from two or more tables based on a related column.

## Python's `sqlite3` Module

Python has a built-in module called `sqlite3` that allows you to work with a lightweight, serverless database called SQLite. The entire database is just a single file on your computer, making it perfect for learning and for smaller applications.

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

The `sqlite3` workflow is a bit verbose. For data analysis, there's a much easier way. Pandas can interact with databases directly and load the results of a query into a DataFrame.

The `pd.read_sql_query()` function takes an SQL query and a connection object and returns a full DataFrame. This is the method you will use most of the time.

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
   - Create a table named `products` with three columns: `product_id` (INTEGER), `name` (TEXT), and `price` (REAL).
   - Insert 3-4 sample products into the table.

1. **Query with `sqlite3`:**

   - Write a script that connects to the `company.db` you created.
   - Execute a SQL query to select all products with a price greater than $100.
   - Fetch all the results and loop through them, printing each one.

1. **Query with Pandas:**

   - Write a script that connects to the `company.db`.
   - Use `pd.read_sql_query()` to select all records from the `products` table and load them into a DataFrame.
   - Print the DataFrame.

🎉 **Excellent!** You can now connect to and retrieve data from a database, the primary source of truth for most businesses. Knowing how to pull data directly into a Pandas DataFrame is a workflow you will use constantly as a data analyst.

## Additional Materials

- **databases.ipynb**  
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_31_Databases/databases.ipynb){ .md-button } 
  [📓 Open in NBViewer](https://nbviewer.org/github/saint2706/Coding-For-MBA/blob/main/Day_31_Databases/databases.ipynb){ .md-button } 
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_31_Databases/databases.ipynb){ .md-button .md-button--primary } 
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_31_Databases/databases.ipynb){ .md-button }
- **databases_smoke_test.ipynb**  
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_31_Databases/databases_smoke_test.ipynb){ .md-button } 
  [📓 Open in NBViewer](https://nbviewer.org/github/saint2706/Coding-For-MBA/blob/main/Day_31_Databases/databases_smoke_test.ipynb){ .md-button } 
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_31_Databases/databases_smoke_test.ipynb){ .md-button .md-button--primary } 
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_31_Databases/databases_smoke_test.ipynb){ .md-button }
- **solutions.ipynb**  
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_31_Databases/solutions.ipynb){ .md-button } 
  [📓 Open in NBViewer](https://nbviewer.org/github/saint2706/Coding-For-MBA/blob/main/Day_31_Databases/solutions.ipynb){ .md-button } 
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_31_Databases/solutions.ipynb){ .md-button .md-button--primary } 
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_31_Databases/solutions.ipynb){ .md-button }

???+ example "databases.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_31_Databases/databases.py)

    ```python title="databases.py"
    """Utilities for working with the Day 31 employee database."""

    from __future__ import annotations

    import os
    import sqlite3
    from contextlib import contextmanager
    from typing import Iterator, List, Sequence, Tuple, Union

    import pandas as pd

    DB_FILE = "company_data.db"

    EmployeeRecord = Tuple[int, str, str, float]
    SalaryResult = List[Tuple[str, float]]
    DatabaseLike = Union[str, os.PathLike[str], sqlite3.Connection]

    EMPLOYEE_ROWS: Sequence[EmployeeRecord] = (
        (101, "Alice", "Sales", 80_000),
        (102, "Bob", "Engineering", 120_000),
        (103, "Charlie", "Sales", 85_000),
        (104, "Diana", "HR", 70_000),
        (105, "Eve", "Engineering", 130_000),
    )


    @contextmanager
    def _get_connection(database: DatabaseLike) -> Iterator[sqlite3.Connection]:
        """Yield a SQLite connection for a file path or existing connection."""

        if isinstance(database, sqlite3.Connection):
            yield database
            return

        connection = sqlite3.connect(os.fspath(database))
        try:
            yield connection
        finally:
            connection.close()


    def initialize_employee_db(database: DatabaseLike) -> None:
        """Create the employees table and populate it with sample rows."""

        with _get_connection(database) as connection:
            cursor = connection.cursor()
            cursor.execute("DROP TABLE IF EXISTS employees")
            cursor.execute(
                """
                CREATE TABLE employees (
                    employee_id INTEGER PRIMARY KEY,
                    name TEXT NOT NULL,
                    department TEXT NOT NULL,
                    salary REAL NOT NULL
                )
                """
            )
            cursor.executemany(
                "INSERT INTO employees VALUES (?, ?, ?, ?)",
                EMPLOYEE_ROWS,
            )
            connection.commit()


    def fetch_department_salaries(database: DatabaseLike, department: str) -> SalaryResult:
        """Return ``(name, salary)`` pairs for the requested department."""

        query = """
            SELECT name, salary
            FROM employees
            WHERE department = ?
            ORDER BY salary
        """
        with _get_connection(database) as connection:
            cursor = connection.execute(query, (department,))
            return [(row[0], float(row[1])) for row in cursor.fetchall()]


    def fetch_department_dataframe(database: DatabaseLike, department: str) -> pd.DataFrame:
        """Return a ``pandas.DataFrame`` of the department's employees."""

        query = "SELECT * FROM employees WHERE department = ? ORDER BY salary"
        with _get_connection(database) as connection:
            return pd.read_sql_query(query, connection, params=(department,))


    def cleanup_employee_db(database: DatabaseLike) -> None:
        """Remove the SQLite file for the employee database if it exists."""

        if isinstance(database, sqlite3.Connection):
            database.close()
            return

        db_path = os.fspath(database)
        if os.path.exists(db_path):
            os.remove(db_path)


    def main(database: DatabaseLike = DB_FILE) -> None:
        """Demonstrate basic interactions with the employee database."""

        print(f"--- 1. Creating and populating the database: {database} ---")
        initialize_employee_db(database)
        print("Database and table created successfully.")
        print("-" * 20)

        print("--- 2. Querying for 'Sales' employees with sqlite3 ---")
        sales_employees = fetch_department_salaries(database, "Sales")
        print("Results from sqlite3:")
        for name, salary in sales_employees:
            print(f"  - Name: {name}, Salary: ${salary:,.2f}")
        print("-" * 20)

        print("--- 3. Querying all 'Engineering' employees with Pandas ---")
        engineering_df = fetch_department_dataframe(database, "Engineering")
        print("DataFrame returned by pd.read_sql_query():")
        print(engineering_df)
        avg_salary = engineering_df["salary"].mean()
        print(f"\nAverage Engineering Salary: ${avg_salary:,.2f}")

        cleanup_employee_db(database)
        print(f"\nCleaned up and removed {database}.")
        print("-" * 20)


    if __name__ == "__main__":
        main()
    ```

???+ example "solutions.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_31_Databases/solutions.py)

    ```python title="solutions.py"
    """
    Day 31: Solutions to Exercises
    """

    import os
    import sqlite3

    import pandas as pd

    DB_FILE = "company.db"

    # --- Exercise 1: Create and Populate a Database ---
    print("--- Solution to Exercise 1 ---")
    try:
        # Connect to the database (creates the file if it doesn't exist)
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()

        # Create the 'products' table
        # "IF NOT EXISTS" prevents an error if the script is run multiple times
        cursor.execute(
            """
        CREATE TABLE IF NOT EXISTS products (
            product_id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            price REAL NOT NULL
        )"""
        )

        # Insert sample data
        # Using a list of tuples for the data
        products_to_insert = [
            (101, "Laptop", 1200.00),
            (102, "Mouse", 25.50),
            (103, "Keyboard", 75.00),
            (104, "Monitor", 350.00),
        ]
        # executemany is efficient for inserting multiple rows
        cursor.executemany(
            "INSERT INTO products (product_id, name, price) VALUES (?, ?, ?)",
            products_to_insert,
        )

        # Commit the changes to save them to the database file
        conn.commit()
        print(f"Database '{DB_FILE}' created and populated successfully.")

    except sqlite3.Error as e:
        print(f"An error occurred: {e}")
    finally:
        # Always close the connection
        if conn:  # pyright: ignore[reportPossiblyUnboundVariable]
            conn.close()
    print("-" * 20)


    # --- Exercise 2: Query with `sqlite3` ---
    print("--- Solution to Exercise 2 ---")
    try:
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()

        # SQL query to select products with price > 100
        sql_query = "SELECT * FROM products WHERE price > 100"
        cursor.execute(sql_query)

        # Fetch all the results that match the query
        expensive_products = cursor.fetchall()

        print("Products with price > $100:")
        for product in expensive_products:
            print(f"  - ID: {product[0]}, Name: {product[1]}, Price: ${product[2]:.2f}")

    except sqlite3.Error as e:
        print(f"An error occurred: {e}")
    finally:
        if conn:  # pyright: ignore[reportPossiblyUnboundVariable]
            conn.close()
    print("-" * 20)


    # --- Exercise 3: Query with Pandas ---
    print("--- Solution to Exercise 3 ---")
    try:
        conn = sqlite3.connect(DB_FILE)

        # The SQL query to select all data
        sql_query_all = "SELECT * FROM products"

        # Use pandas to execute the query and load data into a DataFrame
        products_df = pd.read_sql_query(sql_query_all, conn)

        print("All products loaded into a Pandas DataFrame:")
        print(products_df)

    except sqlite3.Error as e:
        print(f"An error occurred: {e}")
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        if conn:  # pyright: ignore[reportPossiblyUnboundVariable]
            conn.close()
        # Clean up the database file after the script is done
        if os.path.exists(DB_FILE):
            os.remove(DB_FILE)
            print(f"\nCleaned up and removed '{DB_FILE}'.")
    print("-" * 20)
    ```
