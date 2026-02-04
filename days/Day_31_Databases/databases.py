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
