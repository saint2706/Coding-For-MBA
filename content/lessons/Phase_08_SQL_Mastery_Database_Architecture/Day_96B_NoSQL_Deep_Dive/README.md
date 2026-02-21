---
day: 97
title: "NoSQL Deep Dive"
phase: 8
phaseTitle: "SQL Mastery & Database Architecture"
slug: "nosql-deep-dive"
duration: 120
difficulty: "advanced"
tags:
  - nosql
  - mongodb
  - redis
  - cassandra
  - database-design
concepts:
  - "document stores"
  - "key-value stores"
  - "column-family databases"
  - "CAP theorem"
  - "eventual consistency"
prerequisites:
  - "Day 91: Relational Database Internals"
  - "Day 94: Data Query Language"
outcomes:
  - "Explain CAP theorem and when to sacrifice consistency"
  - "Perform CRUD and aggregations in MongoDB"
  - "Use Redis for caching and session management"
  - "Understand Cassandra's write-optimized data model"
---

# 🍃 Day 96B: NoSQL Deep Dive

> *"SQL is the knife. NoSQL is the entire kitchen. Knowing when to use each makes you a chef, not just someone who can chop vegetables."*

---

## The "Never-Coded" Bridge

**Imagine you run a library.**

**SQL (Relational)**: Every book must fit the same catalog format: Title, Author, ISBN, Genre. Fast lookups. Strict rules. Perfect for structured data that changes predictably.

**But what if...** you also need to catalog:
- Social media posts (vary wildly in structure, millions per minute)
- User session state (must be retrieved in single milliseconds)
- IoT sensor logs from 10,000 devices (100M writes/day, never updated)

Forcing all this into rigid SQL tables creates performance nightmares.

**NoSQL databases** were designed for these specific shapes of data at specific scales. They make deliberate tradeoffs — often sacrificing some SQL guarantees for massive performance gains.

---

## The Technical Deep Dive

### 1. The CAP Theorem

Every distributed database must trade off between three properties. **You can only guarantee two**:

```
         Consistency
         (all nodes see same data)
              /\
             /  \
            /    \
           /      \
          /        \
         /    CAP   \
        /   Triangle \
       ──────────────────
   Availability      Partition Tolerance
   (always responds) (works if network splits)

PostgreSQL: CP — Consistent + Partition Tolerant (may be unavailable under partition)
MongoDB:    CP or AP (configurable)
Cassandra:  AP — Available + Partition Tolerant (eventual consistency)
Redis:      CA (single node) / AP (cluster)
```

### 2. MongoDB — Document Store

MongoDB stores data as **flexible JSON-like documents** (~BSON). One document = one "row", but the schema can vary:

```python
from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017")
db = client["ecommerce"]
orders = db["orders"]

# Insert — no schema required
orders.insert_many(
    [
        {
            "order_id": "ORD-001",
            "customer": {"name": "Priya", "email": "priya@example.com"},
            "items": [
                {"sku": "LAPTOP-PRO", "qty": 1, "price": 999.99},
                {"sku": "MOUSE-WL", "qty": 2, "price": 29.99},
            ],
            "total": 1059.97,
            "status": "shipped",
            "tags": ["electronics", "premium"],
        },
        {
            "order_id": "ORD-002",
            "customer": {"name": "Rahul"},  # No email — that's OK in MongoDB
            "total": 45.00,
            "status": "pending",
            # No items array — MongoDB won't complain
        },
    ]
)

# Query
shipped = list(orders.find({"status": "shipped"}))
premium = list(orders.find({"tags": "premium"}))  # Array contains "premium"
high_value = list(orders.find({"total": {"$gte": 500}}).sort("total", -1))

# Aggregation pipeline — like SQL GROUP BY
pipeline = [
    {"$match": {"status": "shipped"}},
    {
        "$group": {
            "_id": "$status",
            "count": {"$sum": 1},
            "total_revenue": {"$sum": "$total"},
        }
    },
    {"$sort": {"total_revenue": -1}},
]
for result in orders.aggregate(pipeline):
    print(result)
# {'_id': 'shipped', 'count': 1, 'total_revenue': 1059.97}

# Update
orders.update_one(
    {"order_id": "ORD-002"},
    {"$set": {"status": "cancelled"}, "$push": {"tags": "refund"}},
)
```

**When to use MongoDB**: Product catalogs (varying attributes per product), user profiles, CMS content, event logging.

### 3. Redis — Key-Value / Cache

Redis stores data **in-memory** — nanosecond latency. It's the world's most popular cache and session store:

```python
import redis
import json
from datetime import timedelta

r = redis.Redis(host="localhost", port=6379, decode_responses=True)

# ── Simple Key-Value ──────────────────────────────
r.set("user:1001:name", "Priya Sharma")
r.set("user:1001:score", 850)
r.expire("user:1001:score", timedelta(hours=24))  # Auto-expiry

name = r.get("user:1001:name")  # "Priya Sharma"


# ── Cache Pattern (Cache-Aside) ───────────────────
def get_user_expensive(user_id: int) -> dict:
    """Simulates a slow database call."""
    import time

    time.sleep(0.5)
    return {"id": user_id, "name": "Priya", "segment": "premium"}


def get_user(user_id: int) -> dict:
    cache_key = f"user:{user_id}"
    cached = r.get(cache_key)

    if cached:
        return json.loads(cached)  # Cache hit: ~0.1ms

    # Cache miss: call the slow source
    user = get_user_expensive(user_id)
    r.setex(cache_key, timedelta(minutes=15), json.dumps(user))
    return user


# ── Sorted Sets (Leaderboards) ────────────────────
r.zadd("weekly_sales_leaderboard", {"sarah": 48200, "michael": 41500, "priya": 52100})
top_3 = r.zrevrange("weekly_sales_leaderboard", 0, 2, withscores=True)
# [('priya', 52100.0), ('sarah', 48200.0), ('michael', 41500.0)]

# ── Lists (Message Queue) ─────────────────────────
r.lpush("task_queue", "send_email:user_1001", "send_email:user_1002")
task = r.brpop("task_queue", timeout=5)  # Blocking pop
```

**When to use Redis**: Session storage, API caching, rate limiting, real-time leaderboards, pub/sub messaging.

### 4. Cassandra — Wide-Column Store

Cassandra is built for **massive write throughput** with geographic distribution. Used by Netflix, Twitter, Apple:

```sql
-- Cassandra Query Language (CQL) — similar SQL syntax, very different semantics

-- CREATE KEYSPACE (like a database)
CREATE KEYSPACE ecommerce
  WITH replication = {'class': 'NetworkTopologyStrategy', 'us-east': 3, 'eu-west': 3};

-- Design for queries, not normalization (no JOINs!)
-- This table is designed for "get all orders for a customer, sorted by date"
CREATE TABLE orders_by_customer (
    customer_id UUID,
    order_date  TIMESTAMP,
    order_id    UUID,
    total       DECIMAL,
    status      TEXT,
    PRIMARY KEY ((customer_id), order_date, order_id)  -- Partition key + clustering keys
) WITH CLUSTERING ORDER BY (order_date DESC);

-- Inserts are extremely fast (append to log, no read-before-write)
INSERT INTO orders_by_customer (customer_id, order_date, order_id, total, status)
VALUES (uuid(), toTimestamp(now()), uuid(), 1059.97, 'shipped');

-- Queries MUST use the partition key
SELECT * FROM orders_by_customer
WHERE customer_id = 5f4dcc3b-5aa6-47e4-8d45-0035b4a29a3c;  -- Exactly 1 partition
```

**When to use Cassandra**: Time-series data (IoT, logs, metrics), event sourcing, geo-distributed apps requiring multi-region writes.

---

## Senior-Level Insights

### The Decision Framework

```
Your data is structured and relational?
└── Yes → PostgreSQL (default choice)
    No → What is the dominant access pattern?
          ├── Flexible schema, nested objects → MongoDB
          ├── Sub-millisecond reads, caching → Redis
          ├── Massive write throughput, time-series → Cassandra/InfluxDB
          └── Graph relationships → Neo4j
```

### Don't Abandon SQL Prematurely

The #1 NoSQL mistake: choosing MongoDB because "it's more flexible", then spending months implementing relationships that SQL handles in 3 lines.

**Rule of thumb**:
1. **Start with PostgreSQL** — it can do JSON documents (`jsonb`), time-series (`TimescaleDB`), and more
2. **Add a specific NoSQL database** only when PostgreSQL genuinely can't meet the requirement
3. **Most startups never need NoSQL** until Series B+ scale

---

## Hands-on Lab

### Exercise 1: MongoDB Aggregation Pipeline

```python
# Given this reviews collection:
reviews_data = [
    {"product": "Laptop Pro", "rating": 5, "verified": True},
    {"product": "Laptop Pro", "rating": 3, "verified": False},
    {"product": "Mouse WL", "rating": 4, "verified": True},
    {"product": "Mouse WL", "rating": 5, "verified": True},
]

# Write an aggregation pipeline that:
# 1. Filters to only verified reviews
# 2. Groups by product
# 3. Returns: product, avg_rating (2 decimal places), review_count
# 4. Sorts by avg_rating descending
pipeline = [
    # TODO: Your pipeline stages here
]
```

### Exercise 2: Redis Cache Decorator

```python
import functools
import json
import redis

r = redis.Redis(host="localhost", port=6379, decode_responses=True)


def cached(ttl_seconds: int = 300):
    """
    Decorator that caches function results in Redis.
    Cache key = function name + serialized arguments.
    """

    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            # TODO: Build cache key from func.__name__ + str(args) + str(kwargs)
            # TODO: Check Redis for cached result
            # TODO: If hit, return parsed JSON
            # TODO: If miss, call func, store in Redis with TTL, return result
            pass

        return wrapper

    return decorator


@cached(ttl_seconds=60)
def get_top_products(category: str, limit: int = 10) -> list:
    """Simulates an expensive DB query."""
    import time

    time.sleep(1)
    return [{"name": f"Product {i}", "sales": 1000 - i * 10} for i in range(limit)]
```

### Exercise 3: NoSQL vs SQL Decision

For each scenario, recommend PostgreSQL, MongoDB, Redis, or Cassandra with 2-sentence justification:

1. A hospital needs to store patient records where each patient has a different set of vital signs tracked depending on their condition.
2. An e-commerce site needs to remember a user's shopping cart for 30 minutes, retrieved in <1ms.
3. A factory has 10,000 sensors each sending temperature readings every second for 5 years.
4. A fintech app needs transaction history with strict ACID guarantees and complex reporting.

---

## Mastery Check

**Q1**: According to CAP theorem, which two properties does Cassandra prioritize?
<details><summary>Answer</summary>
**Availability** (always responds, even under network failures) and **Partition Tolerance** (works even if network splits). It sacrifices strict Consistency — different nodes may temporarily have different data (eventual consistency).
</details>

**Q2**: Why can't you do ad-hoc JOINs in Cassandra?
<details><summary>Answer</summary>
Cassandra distributes data across nodes by partition key. A JOIN requires data from multiple partitions, potentially on different nodes — this would require coordinator queries that kill performance. Instead, you denormalize: design one table per query pattern that stores all needed data together.
</details>

**Q3**: What is the Cache-Aside pattern in Redis?
<details><summary>Answer</summary>
The application checks Redis before querying the database. On cache miss: fetch from DB, store in Redis with TTL, return. On cache hit: return cached value directly. The application (not Redis) manages the cache population.
</details>

**Q4**: MongoDB allows documents in the same collection to have different fields. Why is this an advantage AND a risk?
<details><summary>Answer</summary>
**Advantage**: No migrations needed when adding new fields; models schema-less real-world data naturally. **Risk**: No schema enforcement means typos in field names silently create new fields; queries may return inconsistent results; harder to maintain data quality at scale.
</details>

**Q5**: When should you use PostgreSQL's `jsonb` type instead of MongoDB?
<details><summary>Answer</summary>
When your data is mostly relational with occasional flexible/nested fields. PostgreSQL `jsonb` gives you: JSON indexing, JSON operators, AND full SQL capabilities (JOINs, transactions, complex queries) — without introducing a second database.
</details>

---

## Summary

- ✅ **CAP Theorem**: Pick two — Consistency, Availability, Partition Tolerance
- ✅ **MongoDB**: Flexible schema documents; great for catalogs and profiles
- ✅ **Redis**: In-memory, nanosecond latency; perfect for cache and sessions
- ✅ **Cassandra**: Massive write throughput, time-series, multi-region
- ✅ **Default to PostgreSQL**: Add NoSQL only when you have a specific, justified need

**Tomorrow → Day 97B (Streaming SQL Fundamentals)** — real-time analytics with Kafka and ksqlDB.
