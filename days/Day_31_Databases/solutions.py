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
