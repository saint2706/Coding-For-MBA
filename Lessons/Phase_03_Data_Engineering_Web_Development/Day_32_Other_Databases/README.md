---
day: 32
title: "Other Database Types"
phase: 3
phaseTitle: "Data Engineering & Web Development"
slug: "other-databases"
duration: 45
difficulty: "intermediate"
tags: [python, postgresql, mongodb, nosql]
concepts: [PostgreSQL connection, MongoDB basics, choosing database types]
prerequisites: [31]
outcomes: [Understand SQL vs NoSQL, Connect to PostgreSQL, Basic MongoDB operations]
---

# 🎯 Day 32: Other Database Types

> *"Different data, different databases. Choose wisely."*

---

## The "Never-Coded" Bridge

SQLite is great for learning. Production systems use:
- **PostgreSQL**: Powerful relational DB for complex queries
- **MongoDB**: Document database for flexible schemas

---

## The Technical Deep Dive

### PostgreSQL with psycopg2

```python
import psycopg2
import pandas as pd

# Connection
conn = psycopg2.connect(
    host="localhost",
    database="mydb",
    user="user",
    password="password"
)

# Query to DataFrame
df = pd.read_sql_query("SELECT * FROM customers", conn)

# With parameters
cursor = conn.cursor()
cursor.execute("SELECT * FROM orders WHERE total > %s", (100,))
rows = cursor.fetchall()

conn.close()
```

### MongoDB with PyMongo

```python
from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017")
db = client["mydb"]
collection = db["customers"]

# Insert
customer = {"name": "Alice", "email": "alice@example.com", "orders": []}
result = collection.insert_one(customer)

# Find
customer = collection.find_one({"name": "Alice"})

# Find many
all_customers = collection.find({"orders": {"$gt": []}})

# Update
collection.update_one({"name": "Alice"}, {"$push": {"orders": "ORD001"}})

client.close()
```

### SQL vs NoSQL

| SQL (PostgreSQL)          | NoSQL (MongoDB)                 |
| ------------------------- | ------------------------------- |
| Fixed schema              | Flexible schema                 |
| Tables, rows, columns     | Collections, documents          |
| ACID transactions         | Eventual consistency            |
| Complex joins             | Embedded documents              |
| Best for: structured data | Best for: varied, changing data |

### SQLAlchemy ORM

```python
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import declarative_base, Session

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    email = Column(String)

engine = create_engine("sqlite:///myapp.db")
Base.metadata.create_all(engine)

with Session(engine) as session:
    user = User(name="Alice", email="alice@example.com")
    session.add(user)
    session.commit()
```

---

## Hands-on Lab

```python
# Simulated comparison
import json

# SQL-style (structured)
sql_customer = {
    "id": 1,
    "name": "Alice",
    "email": "alice@example.com"
}
sql_orders = [
    {"id": 1, "customer_id": 1, "total": 150},
    {"id": 2, "customer_id": 1, "total": 200}
]

# NoSQL-style (embedded)
nosql_customer = {
    "_id": "cust_001",
    "name": "Alice",
    "email": "alice@example.com",
    "orders": [
        {"order_id": "ord_001", "total": 150},
        {"order_id": "ord_002", "total": 200}
    ]
}

print("SQL requires JOIN to get customer orders")
print("NoSQL has orders embedded in customer document")
```

---

## Summary

- ✅ PostgreSQL for production SQL
- ✅ MongoDB for flexible documents
- ✅ SQLAlchemy for ORM patterns
- ✅ Choose based on data structure needs

**Tomorrow**: Working with APIs.
