---
day: 32
title: "Other Databases"
phase: 3
phaseTitle: "Data Engineering & Web Development"
slug: "other-databases"
duration: 50
difficulty: "intermediate"
tags: [python, mongodb, nosql, postgresql]
concepts: [NoSQL databases, document stores, when to use what]
prerequisites: [31]
outcomes: [Understand NoSQL vs SQL tradeoffs, Work with MongoDB, Choose appropriate database]
---

# 🎯 Day 32: Other Databases

> *"Not every problem fits in rows and columns."*

---

## The "Never-Coded" Bridge

**Imagine storing user profiles.** Some users have 3 phone numbers, others have none. Some have 5 addresses, others have 1. Traditional SQL forces you into rigid schemas.

**NoSQL offers flexibility.** Document databases store JSON-like structures—each document can have different fields.

**When to use what:**
| Need                           | Use              |
| ------------------------------ | ---------------- |
| Structured data, relationships | SQL (PostgreSQL) |
| Flexible schemas, documents    | MongoDB          |
| Simple key-value cache         | Redis            |
| Graph relationships            | Neo4j            |

---

## The Technical Deep Dive

### MongoDB Basics

```python
from pymongo import MongoClient

# Connect to MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["business"]
collection = db["customers"]

# Insert document (like a JSON object)
customer = {
    "name": "Alice",
    "email": "alice@example.com",
    "addresses": [
        {"type": "home", "city": "NYC"},
        {"type": "work", "city": "Boston"}
    ],
    "purchases": 15
}
collection.insert_one(customer)

# Insert many
customers = [
    {"name": "Bob", "email": "bob@example.com", "purchases": 8},
    {"name": "Charlie", "email": "charlie@example.com", "purchases": 23}
]
collection.insert_many(customers)
```

### CRUD Operations in MongoDB

```python
# CREATE - Insert
collection.insert_one({"name": "Diana", "purchases": 5})

# READ - Query
all_customers = collection.find()  # All documents
high_value = collection.find({"purchases": {"$gt": 10}})  # Purchases > 10
one = collection.find_one({"name": "Alice"})  # Single document

# UPDATE
collection.update_one(
    {"name": "Bob"},
    {"$set": {"purchases": 12}}
)

# DELETE
collection.delete_one({"name": "Diana"})
```

### PostgreSQL with SQLAlchemy

```python
from sqlalchemy import create_engine, text
import pandas as pd

# Connect to PostgreSQL
engine = create_engine("postgresql://user:password@localhost/mydb")

# Query with pandas
df = pd.read_sql("SELECT * FROM customers WHERE active = true", engine)

# Execute raw SQL
with engine.connect() as conn:
    result = conn.execute(text("SELECT COUNT(*) FROM orders"))
    print(result.fetchone())
```

---

## Senior-Level Insights

### SQL vs NoSQL Decision Matrix

| Factor           | SQL                    | NoSQL (Document)        |
| ---------------- | ---------------------- | ----------------------- |
| Schema           | Fixed, defined upfront | Flexible, per-document  |
| Relationships    | Excellent (JOINs)      | Poor (embedded/refs)    |
| Transactions     | Strong (ACID)          | Limited (eventual)      |
| Scale            | Vertical (bigger box)  | Horizontal (more boxes) |
| Query complexity | Complex queries easy   | Simple queries fast     |

### When to Choose NoSQL

✅ **Good for:**
- User profiles with varying fields
- Content management (articles, posts)
- Real-time analytics / logging
- Rapid prototyping

❌ **Bad for:**
- Financial transactions (need ACID)
- Complex reporting with many JOINs
- Strict data integrity requirements

---

## Hands-on Lab

### Exercise 1: MongoDB Document Operations

```python
# Note: Requires MongoDB running locally
from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017/")
db = client["test_db"]
products = db["products"]

# Insert products with different structures
products.insert_many([
    {"name": "Laptop", "price": 999, "specs": {"ram": "16GB", "storage": "512GB"}},
    {"name": "Mouse", "price": 29, "colors": ["black", "white"]},
    {"name": "Monitor", "price": 299, "specs": {"size": "27 inch"}, "warranty": 3}
])

# Query products over $100
expensive = products.find({"price": {"$gt": 100}})
for p in expensive:
    print(p["name"], p["price"])

# Clean up
products.drop()
```

### Exercise 2: Aggregation Pipeline

```python
# MongoDB aggregation (like GROUP BY in SQL)
pipeline = [
    {"$match": {"category": "Electronics"}},
    {"$group": {
        "_id": "$brand",
        "avg_price": {"$avg": "$price"},
        "count": {"$sum": 1}
    }},
    {"$sort": {"avg_price": -1}}
]

results = collection.aggregate(pipeline)
for r in results:
    print(r)
```

### Exercise 3: Database Selection Exercise

Match each scenario to the best database:

1. E-commerce product catalog with varying attributes
2. Banking transaction ledger
3. Social network friend connections
4. Session cache for web application
5. Time-series sensor data

<details>
<summary>Click for Answers</summary>

1. **MongoDB** - Varying product attributes (clothes vs electronics)
2. **PostgreSQL** - ACID compliance critical for money
3. **Neo4j** - Graph database for relationships
4. **Redis** - In-memory for fast session lookups
5. **TimescaleDB or InfluxDB** - Optimized for time-series

</details>

---

## Mastery Check

### Question 1: Schema Flexibility
What's the main advantage of MongoDB over PostgreSQL?

<details>
<summary>Click for Answer</summary>

**Flexible schema.** Each document can have different fields without ALTER TABLE.

PostgreSQL: Must define all columns upfront
MongoDB: Store `{"name": "A", "field1": 1}` alongside `{"name": "B", "field2": "x"}`

Tradeoff: Less data integrity guarantees.

</details>

### Question 2: ACID Compliance
Why might you choose PostgreSQL for a payment system?

<details>
<summary>Click for Answer</summary>

**ACID compliance:**
- **Atomicity**: Transactions complete fully or not at all
- **Consistency**: Data stays valid
- **Isolation**: Transactions don't interfere
- **Durability**: Committed data survives crashes

For payments, partial transactions are unacceptable. Can't debit without crediting.

</details>

### Question 3: Horizontal Scaling
What does "horizontal scaling" mean for NoSQL?

<details>
<summary>Click for Answer</summary>

**Adding more machines** instead of upgrading one machine.

- **Vertical**: Buy bigger server (has limits)
- **Horizontal**: Add more servers, distribute data (sharding)

NoSQL databases like MongoDB are designed to spread data across many machines, handling massive scale.

</details>

### Question 4: Embedded vs References
When would you embed a document vs reference it in MongoDB?

<details>
<summary>Click for Answer</summary>

**Embed when:**
- Data is always accessed together
- Relationship is one-to-few
- Example: User with addresses

**Reference when:**
- Data is accessed independently
- Relationship is one-to-many or many-to-many
- Example: User's orders (orders queried separately)

```javascript
// Embedded (one document)
{"user": "Alice", "addresses": [{...}, {...}]}

// Referenced (separate collections)
{"user_id": 1, "order_id": 100}
```

</details>

### Question 5: Migration Scenario
You have a PostgreSQL database. When might you migrate to MongoDB?

<details>
<summary>Click for Answer</summary>

Consider migration when:
- Schema changes become frequent and painful
- You need to store semi-structured data (JSON blobs)
- Read performance at scale matters more than complex queries
- Your team is comfortable with eventual consistency

**Don't migrate if:**
- You need complex JOINs
- Transactions are critical
- Data integrity is paramount
- Existing queries work well

Often, use both: PostgreSQL for transactions, MongoDB for flexible content.

</details>

---

## Summary

- ✅ NoSQL trades schema flexibility for complexity
- ✅ MongoDB stores documents (JSON-like)
- ✅ PostgreSQL for structured, relational data
- ✅ Choose based on: schema flexibility, scaling needs, transaction requirements

**Tomorrow**: Consuming APIs to fetch data from external services.
