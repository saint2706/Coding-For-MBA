---
day: "101C"
title: "Streaming SQL Fundamentals"
phase: 8
phaseTitle: "SQL Mastery & Database Architecture"
slug: "streaming-sql-fundamentals"
duration: 80
difficulty: "advanced"
tags:
  - kafka
  - streaming
  - ksqldb
  - real-time
  - event-streaming
concepts:
  - "Apache Kafka architecture"
  - "ksqlDB stream processing"
  - "tumbling and hopping windows"
  - "real-time aggregations"
  - "streaming vs batch trade-offs"
prerequisites: [101, "101B"]
outcomes:
  - "Explain the Kafka producer/consumer/topic model"
  - "Write ksqlDB CREATE STREAM and CREATE TABLE statements"
  - "Apply tumbling windows for real-time aggregations"
  - "Decide when streaming beats batch for a business use case"
  - "Implement a Python Kafka producer/consumer with kafka-python"
---

# ⚡ Day 96C: Streaming SQL Fundamentals

> *"Batch analytics tells you what happened. Streaming analytics tells you what's happening right now — with a latency measured in milliseconds."*

---

## The "Never-Coded" Bridge

**Imagine you run a fraud team at a bank.**

With batch SQL, you run a fraud detection job at midnight. By the time it flags a fraudulent transaction, the money is gone, the card has been used 47 more times, and the customer is furious.

With streaming SQL, every transaction is analyzed as it happens — sub-second latency — and the card is frozen before the second fraudulent charge clears.

The difference between batch and streaming is the difference between **looking at a photograph** and **watching a live feed**. Both are valuable; they solve different business problems.

**Today you'll learn Apache Kafka** (the infrastructure that makes streaming possible) **and ksqlDB** (the SQL layer that lets you query streams without writing Java). By Days 96B (NoSQL) and today, you now have the complete picture of modern database architectures.

---

## The Technical Deep Dive

### Apache Kafka: The Architecture

Kafka is the infrastructure layer of the streaming world — a distributed event log that decouples producers (who generate events) from consumers (who process them).

```
PRODUCERS                   KAFKA CLUSTER              CONSUMERS
                                                   
E-commerce orders ──┐   ┌─── Topic: orders ────► Fraud Detection Service
Payment events  ───►│──►│─── Topic: payments ──► Analytics Dashboard  
User clicks     ──┘   └─── Topic: clickstream ─► Recommendation Engine
                                                   
Key concepts:
• Topic    — named stream of records (like a table, but append-only)
• Partition — horizontal scale unit; a topic splits into N partitions
• Offset    — unique sequential ID within a partition (like a row number)
• Consumer Group — multiple consumers sharing work across partitions
• Retention — events stored for configured period (default 7 days)
```

#### Python: Producer and Consumer

```python
# pip install kafka-python
from kafka import KafkaProducer, KafkaConsumer
import json
import time
from datetime import datetime

# --- PRODUCER: Simulate e-commerce order stream ---
producer = KafkaProducer(
    bootstrap_servers='localhost:9092',
    value_serializer=lambda v: json.dumps(v).encode('utf-8'),
    key_serializer=lambda k: k.encode('utf-8'),
)

def produce_order(order_id: str, customer_id: str, amount: float, 
                  product: str):
    event = {
        'order_id': order_id,
        'customer_id': customer_id,
        'amount': amount,
        'product': product,
        'timestamp': datetime.utcnow().isoformat(),
        'status': 'placed'
    }
    # Key by customer_id → ensures same customer's events go to same partition
    producer.send(topic='orders', key=customer_id, value=event)
    print(f"Produced: {event}")

# Simulate a burst of orders
import random
for i in range(10):
    produce_order(
        order_id=f'ORD-{1000+i}',
        customer_id=f'CUST-{random.randint(1, 5)}',
        amount=round(random.uniform(10, 500), 2),
        product=random.choice(['laptop', 'shirt', 'book', 'phone'])
    )
    time.sleep(0.1)

producer.flush()
producer.close()
```

```python
# --- CONSUMER: Process orders in real-time ---
consumer = KafkaConsumer(
    'orders',
    bootstrap_servers='localhost:9092',
    group_id='analytics-group',
    value_deserializer=lambda v: json.loads(v.decode('utf-8')),
    auto_offset_reset='earliest',  # Start from beginning if no committed offset
    enable_auto_commit=True,       # Auto-commit processed offsets
)

print("Consuming orders...")
revenue_by_customer = {}

for message in consumer:
    event = message.value
    customer_id = event['customer_id']
    amount = event['amount']
    
    # Real-time aggregation (in-memory — use Flink/ksqlDB for production)
    revenue_by_customer[customer_id] = revenue_by_customer.get(customer_id, 0) + amount
    
    print(f"[Offset {message.offset}] {customer_id}: ${amount:.2f} | "
          f"Running total: ${revenue_by_customer[customer_id]:.2f}")
    
    # In production: write results to a sink (Redis, database, dashboard API)
```

---

### ksqlDB: Streaming SQL

ksqlDB brings SQL syntax to Kafka streams — no Java required. Write queries that run continuously, processing events as they arrive.

```sql
-- First: Create a stream from the Kafka topic
CREATE STREAM orders_stream (
    order_id    VARCHAR,
    customer_id VARCHAR,
    amount      DOUBLE,
    product     VARCHAR,
    status      VARCHAR,
    event_time  TIMESTAMP
)
WITH (
    KAFKA_TOPIC='orders',
    VALUE_FORMAT='JSON',
    TIMESTAMP='event_time'   -- Use event time, not processing time
);

-- Query the stream (like SELECT * but continuous)
SELECT * FROM orders_stream EMIT CHANGES;


-- Create a filtered stream: high-value orders only
CREATE STREAM high_value_orders AS
SELECT *
FROM orders_stream
WHERE amount > 200
EMIT CHANGES;


-- Create a materialized table: running total per customer
-- (persisted in Kafka, queryable like a database table)
CREATE TABLE customer_revenue AS
SELECT
    customer_id,
    COUNT(*) AS order_count,
    SUM(amount) AS total_revenue,
    AVG(amount) AS avg_order_value
FROM orders_stream
GROUP BY customer_id
EMIT CHANGES;

-- Point query: look up one customer's current total
SELECT * FROM customer_revenue WHERE customer_id = 'CUST-3';
```

### Windowed Aggregations: Time-Boxed Analysis

Real-time analytics almost always needs time windows — "revenue in the last 5 minutes", "fraud rate per 1-hour window".

```sql
-- TUMBLING WINDOW: fixed-size, non-overlapping windows
-- "Orders grouped into 1-minute buckets"
CREATE TABLE orders_per_minute AS
SELECT
    WINDOWSTART                           AS window_start,
    WINDOWEND                             AS window_end,
    product,
    COUNT(*) AS order_count,
    SUM(amount) AS window_revenue
FROM orders_stream
WINDOW TUMBLING (SIZE 1 MINUTE)
GROUP BY product
EMIT FINAL;
-- EMIT FINAL: emit result once the window closes (reduces noise vs EMIT CHANGES)


-- HOPPING WINDOW: overlapping windows
-- "Sliding 5-minute window, updated every 1 minute"
CREATE TABLE orders_5min_rolling AS
SELECT
    WINDOWSTART AS window_start,
    COUNT(*) AS order_count,
    SUM(amount) AS revenue
FROM orders_stream
WINDOW HOPPING (SIZE 5 MINUTES, ADVANCE BY 1 MINUTE)
GROUP BY 1   -- no natural grouping — aggregate all orders
EMIT CHANGES;


-- SESSION WINDOW: activity-based, gap-defined
-- "Group events within 30min of each other as one user session"
CREATE TABLE user_sessions AS
SELECT
    customer_id,
    COUNT(*) AS actions_in_session,
    SUM(amount) AS session_revenue
FROM orders_stream
WINDOW SESSION (30 MINUTES)
GROUP BY customer_id
EMIT CHANGES;
```

### Streaming vs Batch: Decision Framework

```python
# Use this framework to choose the right architecture:

def recommend_architecture(latency_requirement_minutes: int,
                           data_volume_events_per_second: int,
                           needs_joins_with_historical: bool) -> str:
    
    if latency_requirement_minutes < 1:
        return "Streaming (Kafka + Flink/ksqlDB) — sub-minute latency required"
    
    elif latency_requirement_minutes < 60:
        if data_volume_events_per_second > 1000:
            return "Streaming (Kafka + ksqlDB) — high volume + near-realtime"
        else:
            return "Micro-batch (Spark Structured Streaming or dbt Cloud 15-min runs)"
    
    else:
        if needs_joins_with_historical:
            return "Batch (dbt + BigQuery/Snowflake) — best for complex joins"
        else:
            return "Batch — simpler, cheaper, easier to debug"


# Business use case mapping:
use_cases = {
    "Fraud detection":           recommend_architecture(0, 5000, False),
    "Live dashboard (KPIs)":     recommend_architecture(5, 100, True),
    "Daily sales report":        recommend_architecture(1440, 10, True),
    "Inventory restock alerts":  recommend_architecture(30, 50, True),
    "Real-time recommendation":  recommend_architecture(1, 10000, True),
}

for case, recommendation in use_cases.items():
    print(f"{case}:\n  → {recommendation}\n")
```

---

## 💼 MBA Context: Where Streaming SQL Delivers ROI

| Industry                | Streaming Use Case               | Business Impact                     |
| ----------------------- | -------------------------------- | ----------------------------------- |
| **Banking**             | Fraud detection per transaction  | Prevent $X loss per prevented fraud |
| **E-commerce**          | Cart abandonment alerts (<5 min) | 15–30% recovery uplift              |
| **Ride-sharing**        | Dynamic surge pricing            | Revenue optimization per market     |
| **Trading**             | Price anomaly detection          | Milliseconds = millions             |
| **IoT / Manufacturing** | Equipment failure early warning  | Prevent costly downtime             |
| **Media**               | Live content trending            | Editor intervention in real-time    |

**LinkedIn** processes 7 trillion events per day on Kafka. **Uber** uses Kafka for real-time trip matching and surge pricing. **Netflix** uses it for real-time A/B test analytics.

---

## Senior-Level Insights

### The Streaming Pitfalls

```python
# 1. LATE-ARRIVING DATA
# Events from mobile apps can arrive minutes after they occurred.
# ksqlDB/Flink handle this with "allowed lateness":
#   WINDOW TUMBLING (SIZE 1 MINUTE) RETENTION 10 MINUTES
# Retains window state for 10 minutes to absorb late arrivals.

# 2. EXACTLY-ONCE SEMANTICS
# Default Kafka = at-least-once delivery (duplicates possible).
# For financial transactions: configure exactly-once with:
#   producer = KafkaProducer(enable_idempotence=True, transactional_id='txn-1')

# 3. EVENT TIME vs PROCESSING TIME
# Event time: when the event actually happened (in the app)
# Processing time: when Kafka received it
# USE EVENT TIME for analytics — "5 minute window of purchases" should
# mean 5 minutes of actual purchases, not 5 minutes of Kafka processing.
# ksqlDB: set TIMESTAMP='event_time' in your CREATE STREAM.

# 4. SCHEMA EVOLUTION
# As your event schema evolves, old consumers may break.
# Solution: Schema Registry (Confluent) + Avro/Protobuf schemas
# — enforces backwards compatibility before events are produced.
```

### The Streaming Stack in 2026

```
Data Producers        Message Layer      Processing        Sinks
─────────────────     ────────────────   ─────────────     ──────────────
Mobile apps      ──►  Apache Kafka   ──► ksqlDB        ──► PostgreSQL
Microservices    ──►  Confluent Cloud ──► Apache Flink  ──► Elasticsearch
IoT sensors      ──►  AWS Kinesis    ──► Spark Streaming──► Snowflake
Webhooks         ──►  GCP Pub/Sub    ──► Materialize    ──► Redis cache
                                                        ──► Dashboard API
```

---

## Hands-on Lab

### Exercise 1: Design a Fraud Detection Topology (Easy)

```
Given: A "payments" Kafka topic with events:
{ payment_id, customer_id, amount, merchant_id, timestamp }

Design the ksqlDB pipeline to:
1. CREATE STREAM for the raw payments topic
2. CREATE TABLE counting payments per customer in a 5-min tumbling window
3. Filter customers with > 3 payments in 5 minutes OR any payment > $10,000
4. Sink to a "fraud_alerts" Kafka topic for the risk team

Write the ksqlDB SQL (don't need to run it — write the statements).
```

### Exercise 2: Python Producer for Clickstream (Medium)

```python
from kafka import KafkaProducer
import json, random, time
from datetime import datetime

# Extend this producer to simulate an e-commerce clickstream:
# Events: page_view, add_to_cart, checkout_start, purchase
# Each event: {event_id, session_id, user_id, event_type, page, timestamp, metadata}

producer = KafkaProducer(
    bootstrap_servers='localhost:9092',
    value_serializer=lambda v: json.dumps(v).encode('utf-8'),
)

def simulate_user_journey(session_id: str, user_id: str):
    # TODO: produce a realistic sequence of events for one user session
    # Hint: most sessions are page_view → add_to_cart
    # 30% reach checkout, 15% complete purchase
    pass

# Simulate 5 concurrent user sessions
for i in range(5):
    simulate_user_journey(f'session_{i}', f'user_{random.randint(1, 100)}')
```

### Exercise 3: Windowed Aggregation Design Challenge (Hard)

```sql
-- The operations team wants to know within 2 minutes if:
-- 1. Any product category has 0 sales in the last 15 minutes (potential website bug)
-- 2. The average order value drops below $30 in any 10-minute window (pricing anomaly)
-- 3. A single customer places more than 5 orders in 30 minutes (possible bot)

-- Write three separate ksqlDB queries to detect each anomaly.
-- For each: choose the right window type (tumbling/hopping/session) and justify.
-- Include: CREATE STREAM, CREATE TABLE with window, and the anomaly filter.
```

---

## Mastery Check

**Q1**: What is the difference between a Kafka topic and a traditional database table?
<details><summary>Answer</summary>

A **Kafka topic** is an immutable, append-only log — records are never updated or deleted (within the retention period). Events arrive in order, each with a unique offset. A **database table** is mutable — rows can be inserted, updated, deleted, and the current state is what you query. Topic → history of what happened. Table → current state of the world. ksqlDB bridges both: STREAM = topic (history), TABLE = materialized current state.
</details>

**Q2**: What is the difference between a tumbling window and a hopping window?
<details><summary>Answer</summary>

**Tumbling window**: fixed size, non-overlapping. Each event belongs to exactly one window. Example: 1-minute windows at [00:00–01:00], [01:00–02:00], [02:00–03:00]. Good for discrete period reports (orders in the last hour).

**Hopping window**: fixed size, overlapping (advance < size). Each event may appear in multiple windows. Example: 5-minute window advancing every 1 minute: [00:00–05:00], [01:00–06:00], [02:00–07:00]. Good for rolling metrics (last-N-minutes averages).
</details>

**Q3**: What is the "event time vs processing time" problem in streaming, and why does it matter?
<details><summary>Answer</summary>

**Event time**: when the event happened in the real world (device clock). **Processing time**: when Kafka received and processed the event. Mobile apps can batch events and deliver them minutes later — so processing time ≠ event time. If you use processing time for a "1-hour sales window", you might include events that actually happened hours ago, violating the window semantic. Always use event time for business analytics. ksqlDB: set `TIMESTAMP='event_time'` in your STREAM definition.
</details>

**Q4**: When would you choose streaming over batch for an analytics use case?
<details><summary>Answer</summary>

Choose streaming when: (1) latency requirement < 5-10 minutes (fraud, live dashboards, alerts), (2) event volume is high and continuous (IoT sensors, clickstreams), (3) you need to trigger actions from data (cart abandonment email, fraud block). Choose batch when: (1) latency can be hourly/daily, (2) you need complex joins across large historical datasets, (3) cost is a primary constraint (streaming infrastructure is expensive). Most organizations run both — streaming for alerting/operations, batch for historical analysis.
</details>

**Q5**: What is `EMIT FINAL` vs `EMIT CHANGES` in ksqlDB?
<details><summary>Answer</summary>

**`EMIT CHANGES`**: output a result every time the windowed aggregate updates (every new event within the window). Creates many intermediate results, good for real-time dashboards. **`EMIT FINAL`**: output only once, when the window closes. Cleaner, less noisy — good for reports and downstream triggers. Use `EMIT FINAL` for anomaly detection (you want one alert when the window closes, not one per event) and `EMIT CHANGES` for live dashboards where you want up-to-the-second numbers.
</details>

---

## Further Reading & Tools

- 📖 [Kafka: The Definitive Guide](https://www.oreilly.com/library/view/kafka-the-definitive/9781492043072/) — Free from Confluent
- 📖 [ksqlDB Documentation](https://docs.ksqldb.io/) — Official ksqlDB reference
- 🔧 [Confluent Docker Quickstart](https://docs.confluent.io/platform/current/platform-quickstart.html) — Run Kafka locally in 5 minutes
- 🔧 [kafka-python Docs](https://kafka-python.readthedocs.io/) — Python Kafka client
- 🏢 **LinkedIn Engineering**: "Apache Kafka at LinkedIn" — origin story and scale patterns

---

## Summary

Today you learned the real-time layer of the modern data stack:

- ✅ **Kafka** is a distributed event log decoupling producers from consumers at massive scale
- ✅ **Topics, partitions, and consumer groups** enable horizontal scalability
- ✅ **ksqlDB** brings SQL to Kafka streams — no Java, just familiar query syntax
- ✅ **Windows** (tumbling, hopping, session) enable time-boxed real-time aggregations
- ✅ **Streaming vs Batch** decision: latency requirement + volume + join complexity

**Phase 8 Complete!** You now command the full database spectrum: relational SQL → NoSQL → streaming. → **Next: Phase 9** — Enterprise SQL: views, indexes, CTEs, query optimization, and performance engineering.
