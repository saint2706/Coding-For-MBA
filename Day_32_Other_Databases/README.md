# 📘 Day 32: Connecting to Other Databases (MySQL & MongoDB)

In the previous lesson, we used `sqlite3`, which is fantastic for learning and small projects
because it's built into Python and doesn't require a separate server. However, in a corporate
environment, you will most likely be connecting to a more powerful, server-based database like
**MySQL**, **PostgreSQL**, or a NoSQL database like **MongoDB**.

The great news is that the patterns and skills you just learned are directly transferable.

## Connecting to Other SQL Databases (MySQL, PostgreSQL)

To connect to other SQL databases, the only thing that changes is the library you use to make the
connection. The SQL queries you write and the way you use Pandas to interact with the database
remain almost identical.

You would first need to install the appropriate library:

- For MySQL: `pip install mysql-connector-python`
- For PostgreSQL: `pip install psycopg2-binary`

Then, your connection code would look slightly different, requiring credentials like a username,
password, and host address.

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

**Key Takeaway:** As an analyst, your main tool, `pandas.read_sql_query`, works the same way. You
just need to get the correct connection details from your IT or data engineering team.

## A Brief Introduction to NoSQL: MongoDB

Not all databases are "relational" (i.e., table-based) like SQL databases. Another popular category
is **NoSQL**, and one of the most popular NoSQL databases is **MongoDB**.

Instead of tables and rows, MongoDB stores data in **collections** of **documents**. A document is
very similar to a Python dictionary or a JSON object, allowing for flexible and nested data
structures.

To work with MongoDB in Python, you use the `pymongo` library: `pip install pymongo`

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

This was a conceptual lesson to show you that while the specific connection details may change, the
skills you've learned are broadly applicable.

- For any **SQL database**, you will use a specific library to connect, but your interaction will
  primarily be writing SQL queries and using `pandas.read_sql_query`.
- For **NoSQL databases** like MongoDB, you'll use a different library (`pymongo`) and query
  language, but the goal is the same: get the data into a format that can be loaded into a Pandas
  DataFrame for analysis.

There are no coding exercises for this day. The goal is to understand the concepts so you are
prepared when you encounter these different database systems in the workplace.
