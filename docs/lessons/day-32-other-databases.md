In the previous lesson, we used `sqlite3`, which is fantastic for learning and small projects because it's built into Python and doesn't require a separate server. However, in a corporate environment, you will most likely be connecting to a more powerful, server-based database like **MySQL**, **PostgreSQL**, or a NoSQL database like **MongoDB**.

The great news is that the patterns and skills you just learned are directly transferable.

## Connecting to Other SQL Databases (MySQL, PostgreSQL)

To connect to other SQL databases, the only thing that changes is the library you use to make the connection. The SQL queries you write and the way you use Pandas to interact with the database remain almost identical.

You would first need to install the appropriate library:

- For MySQL: `pip install mysql-connector-python`
- For PostgreSQL: `pip install psycopg2-binary`

Then, your connection code would look slightly different, requiring credentials like a username, password, and host address.

**Example with `psycopg2` for PostgreSQL:**

```python
import psycopg2
import pandas as pd

# The connection details change, but the pattern is the same
conn = psycopg2.connect(
    host="your_database_host",
    database="your_database_name",
    user="your_username",
    password="your_password"
)

# After this, using Pandas is EXACTLY the same!
sql_query = "SELECT * FROM sales WHERE region = 'North';"
north_sales_df = pd.read_sql_query(sql_query, conn)

conn.close()

print(north_sales_df.head())
```

**Key Takeaway:** As an analyst, your main tool, `pandas.read_sql_query`, works the same way. You just need to get the correct connection details from your IT or data engineering team.

## A Brief Introduction to NoSQL: MongoDB

Not all databases are "relational" (i.e., table-based) like SQL databases. Another popular category is **NoSQL**, and one of the most popular NoSQL databases is **MongoDB**.

Instead of tables and rows, MongoDB stores data in **collections** of **documents**. A document is very similar to a Python dictionary or a JSON object, allowing for flexible and nested data structures.

To work with MongoDB in Python, you use the `pymongo` library:
`pip install pymongo`

**Example with `pymongo` for MongoDB:**

```python
from pymongo import MongoClient

# Connect to the MongoDB server
client = MongoClient('mongodb://your_username:your_password@your_host')

# Select your database and collection (similar to a table)
db = client['company_db']
collection = db['employees']

# Find a document (similar to a row)
# This finds one employee in the 'Sales' department
sales_employee = collection.find_one({'department': 'Sales'})

print(sales_employee)

# Find multiple documents
engineering_employees = collection.find({'department': 'Engineering'})

# You can convert the results to a list of dictionaries...
engineering_list = list(engineering_employees)
# ...and then load that list directly into a Pandas DataFrame!
engineering_df = pd.DataFrame(engineering_list)

client.close()
```

## Summary

This was a conceptual lesson to show you that while the specific connection details may change, the skills you've learned are broadly applicable.

- For any **SQL database**, you will use a specific library to connect, but your interaction will primarily be writing SQL queries and using `pandas.read_sql_query`.
- For **NoSQL databases** like MongoDB, you'll use a different library (`pymongo`) and query language, but the goal is the same: get the data into a format that can be loaded into a Pandas DataFrame for analysis.

There are no coding exercises for this day. The goal is to understand the concepts so you are prepared when you encounter these different database systems in the workplace.

## Additional Materials

- **other_databases.ipynb**  
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_32_Other_Databases/other_databases.ipynb){ .md-button } 
  [📓 Open in NBViewer](https://nbviewer.org/github/saint2706/Coding-For-MBA/blob/main/Day_32_Other_Databases/other_databases.ipynb){ .md-button } 
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_32_Other_Databases/other_databases.ipynb){ .md-button .md-button--primary } 
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_32_Other_Databases/other_databases.ipynb){ .md-button }

???+ example "other_databases.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_32_Other_Databases/other_databases.py)

    ```python title="other_databases.py"
    """Reusable helpers that demonstrate SQL and MongoDB connection patterns.

    The functions in this module deliberately receive their database clients as
    arguments so they can be easily tested without establishing real network
    connections.  The calling code is responsible for creating the client (or a
    stub implementation) and passing in the relevant credentials or connection
    configuration.
    """

    from __future__ import annotations

    from typing import Any, Callable, Iterable, Mapping, MutableMapping, Optional, Sequence

    Credentials = Mapping[str, Any]
    ClientFactory = Callable[[Credentials], Any]


    def execute_sql_query(
        client_factory: ClientFactory,
        query: str,
        *,
        credentials: Credentials,
        parameters: Optional[Sequence[Any]] = None,
        commit: bool = False,
    ) -> Sequence[Any]:
        """Execute a SQL query using a dependency-injected client factory.

        Parameters
        ----------
        client_factory:
            Callable that accepts a credentials mapping and returns a DB-API style
            connection object.  In production this could be ``mysql.connector.connect``
            or ``psycopg2.connect``; in tests this can be a stub or mock.
        query:
            SQL string to execute.
        credentials:
            Mapping that contains the connection details (host, database, user,
            password, etc.).
        parameters:
            Optional sequence of parameters to pass to ``cursor.execute``.
        commit:
            Whether to call ``commit`` on the connection after execution.  This is
            useful for ``INSERT``/``UPDATE`` statements.

        Returns
        -------
        Sequence[Any]
            The rows returned by ``cursor.fetchall()``.  For statements that do not
            return rows this will typically be an empty sequence.
        """

        connection = client_factory(credentials)
        cursor = connection.cursor()
        try:
            if parameters is None:
                cursor.execute(query)
            else:
                cursor.execute(query, parameters)

            results: Sequence[Any] = []
            description = getattr(cursor, "description", None)
            if description:
                results = cursor.fetchall()

            if commit and hasattr(connection, "commit"):
                connection.commit()

            return results
        finally:
            # Ensure resources are released even if ``execute`` raises an error.
            if hasattr(cursor, "close"):
                cursor.close()
            if hasattr(connection, "close"):
                connection.close()


    def upsert_sales_forecast(
        client_factory: ClientFactory,
        *,
        credentials: Credentials,
        forecast_rows: Iterable[Sequence[Any]],
    ) -> None:
        """Insert or update forecast data via an injected SQL client.

        The function expects the ``forecast_rows`` iterable to contain tuples of the
        form ``(region, forecast_month, revenue)``.  The specific SQL syntax is kept
        intentionally generic so that the function remains database-agnostic.
        """

        merge_query = """
            INSERT INTO sales_forecast (region, forecast_month, revenue)
            VALUES (%s, %s, %s)
            ON CONFLICT (region, forecast_month) DO UPDATE
            SET revenue = EXCLUDED.revenue
            """.strip()

        connection = client_factory(credentials)
        cursor = connection.cursor()
        try:
            for row in forecast_rows:
                cursor.execute(merge_query, row)

            if hasattr(connection, "commit"):
                connection.commit()
        finally:
            if hasattr(cursor, "close"):
                cursor.close()
            if hasattr(connection, "close"):
                connection.close()


    def find_documents(
        mongo_client: MutableMapping[str, Any],
        *,
        database: str,
        collection: str,
        filter_query: Optional[Mapping[str, Any]] = None,
        projection: Optional[Mapping[str, Any]] = None,
    ) -> list[Any]:
        """Query a MongoDB collection using an injected client object."""

        filter_query = dict(filter_query or {})

        db = mongo_client[database]
        collection_handle = db[collection]

        if projection is None:
            cursor = collection_handle.find(filter_query)
        else:
            cursor = collection_handle.find(filter_query, projection)

        return list(cursor)


    def insert_documents(
        mongo_client: MutableMapping[str, Any],
        *,
        database: str,
        collection: str,
        documents: Sequence[Mapping[str, Any]],
    ) -> Sequence[Any]:
        """Insert multiple documents into a MongoDB collection."""

        if not documents:
            return []

        db = mongo_client[database]
        collection_handle = db[collection]
        result = collection_handle.insert_many(list(documents))
        return getattr(result, "inserted_ids", result)
    ```
