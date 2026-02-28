---
day: 126
title: "Streaming Pipelines — Kafka, Pub/Sub, Kinesis"
phase: 11
phaseTitle: "Cloud Data Engineering"
slug: "streaming-pipelines"
duration: 90
difficulty: "advanced"
tags:
  - kafka
  - pubsub
  - kinesis
  - streaming
  - real-time
concepts:
  - "event-driven architecture"
  - "topics, partitions, and consumer groups"
  - "exactly-once vs at-least-once delivery"
  - "stream processing patterns"
  - "windowing (tumbling, sliding, session)"
prerequisites:
  - "Day 125: Orchestration"
  - "Day 96C: Streaming SQL Fundamentals"
outcomes:
  - "Design a Kafka-based event streaming architecture"
  - "Compare at-least-once and exactly-once delivery guarantees"
  - "Implement windowed aggregations for real-time analytics"
---

# 🌊 Day 126: Streaming Pipelines — Kafka, Pub/Sub, Kinesis

> *"Batch is an answer to yesterday's question. Streaming is an answer in real-time — while the question still matters."*

---

## The "Never-Coded" Bridge

**Think of batch processing like mail delivery** — letters go out once a day, sorted by route, delivered in bulk. **Streaming is like texting** — each message arrives instantly, processed individually, and the recipient acts immediately. Both have their place: payroll runs daily (batch), but fraud detection must be instant (streaming).

Kafka, Pub/Sub, and Kinesis are the messaging highways that let you build real-time data pipelines — processing millions of events per second as they happen.

---

## The Technical Deep Dive

### 1. Event Streaming Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  PRODUCERS  │ ──► │  MESSAGE BROKER  │ ──► │   CONSUMERS     │
│  (sources)  │     │  (Kafka/PubSub)  │     │  (processors)   │
├─────────────┤     ├──────────────────┤     ├─────────────────┤
│ Web clicks  │     │ Topic: clicks    │     │ Real-time dash  │
│ IoT sensors │     │ Topic: sensors   │     │ Fraud detection │
│ App events  │     │ Topic: payments  │     │ ML inference    │
│ DB CDC      │     │ Topic: orders    │     │ Data warehouse  │
└─────────────┘     └──────────────────┘     └─────────────────┘
```

### 2. Apache Kafka Deep Dive

```python
from confluent_kafka import Producer, Consumer
import json

# --- Producer: Send events to Kafka ---
producer = Producer({"bootstrap.servers": "kafka-broker:9092"})

def produce_event(topic: str, key: str, value: dict):
    """Send a single event to a Kafka topic."""
    producer.produce(
        topic=topic,
        key=key.encode("utf-8"),
        value=json.dumps(value).encode("utf-8"),
        callback=lambda err, msg: print(f"{'❌ Error' if err else '✅ Delivered'}: {msg.topic()}")
    )
    producer.flush()

# Example: clickstream event
produce_event("user-clicks", "user_123", {
    "event_type": "page_view",
    "page": "/products/camera",
    "timestamp": "2025-01-15T10:30:00Z",
    "session_id": "sess_abc123",
})

# --- Consumer: Read events from Kafka ---
consumer = Consumer({
    "bootstrap.servers": "kafka-broker:9092",
    "group.id": "analytics-pipeline",
    "auto.offset.reset": "earliest",
    "enable.auto.commit": False,  # Manual commit for exactly-once
})
consumer.subscribe(["user-clicks"])

while True:
    msg = consumer.poll(timeout=1.0)
    if msg is None:
        continue
    if msg.error():
        print(f"Error: {msg.error()}")
        continue

    event = json.loads(msg.value().decode("utf-8"))
    print(f"Received: {event['event_type']} from {msg.key().decode()}")

    # Process the event...
    # process_click(event)

    consumer.commit(msg)  # Commit offset after successful processing
```

### 3. Kafka Architecture Concepts

```python
kafka_architecture = {
    "topic": "A named stream of events (like a database table for events)",
    "partition": "A topic is split into partitions for parallelism. Events with the same key go to the same partition (ordering guarantee).",
    "offset": "Position of each message within a partition. Consumers track their offset to know where they left off.",
    "consumer_group": "Multiple consumers share work — each partition is assigned to exactly one consumer in the group.",
    "replication_factor": "Each partition is replicated across N brokers for fault tolerance (typically 3).",
    "retention": "How long to keep messages. Default: 7 days. Can be set to 'forever' for event sourcing.",
}

# Partition key design — critical for ordering and load distribution
partition_strategies = {
    "by_user_id": {
        "key": "user_123",
        "guarantees": "All events for user_123 go to same partition → ordered processing",
        "risk": "Hot partition if one user generates 90% of traffic",
    },
    "by_region": {
        "key": "us-east",
        "guarantees": "Regional ordering, good for geo-distributed processing",
        "risk": "Uneven partition sizes if regions have different activity levels",
    },
    "random": {
        "key": None,
        "guarantees": "Even distribution across partitions",
        "risk": "No ordering guarantee for related events",
    },
}
```

### 4. Delivery Guarantees

```python
delivery_guarantees = {
    "at-most-once": {
        "behavior": "Fire and forget. Message may be lost.",
        "use_case": "Logging, metrics where occasional loss is acceptable",
        "implementation": "Auto-commit offsets before processing",
    },
    "at-least-once": {
        "behavior": "Message delivered at least once. May be duplicated on retry.",
        "use_case": "Most data pipelines (handle duplicates downstream)",
        "implementation": "Commit offset AFTER successful processing. Idempotent consumer.",
    },
    "exactly-once": {
        "behavior": "Each message processed exactly once. No loss, no duplicates.",
        "use_case": "Financial transactions, billing, inventory",
        "implementation": "Kafka Transactions API + idempotent producer + read-committed consumer",
        "caveat": "Higher latency, more complex. Only works within Kafka ecosystem.",
    },
}
```

### 5. Windowing for Real-Time Analytics

```python
# Window types for aggregating streaming events

import time
from collections import defaultdict

# Tumbling Window: Fixed, non-overlapping intervals
# "Count page views per minute" → [10:00-10:01], [10:01-10:02], ...
tumbling_window = defaultdict(int)
def process_tumbling(event, window_seconds=60):
    window_key = int(time.time()) // window_seconds
    tumbling_window[window_key] += 1

# Sliding Window: Fixed size, overlapping
# "Moving average over last 5 minutes, updated every minute"

# Session Window: Dynamic size based on inactivity gaps
# "Group user clicks into sessions — session ends after 30 min inactivity"
sessions = {}
def process_session(event, gap_seconds=1800):
    user_id = event["user_id"]
    now = time.time()
    if user_id in sessions and (now - sessions[user_id]["last"]) < gap_seconds:
        sessions[user_id]["events"].append(event)
        sessions[user_id]["last"] = now
    else:
        if user_id in sessions:
            emit_session(sessions[user_id])  # Close old session
        sessions[user_id] = {"events": [event], "last": now, "start": now}
```

---

## Senior-Level Insights

### Batch vs. Streaming: The Decision Framework

| Factor               | Choose Batch             | Choose Streaming           |
| -------------------- | ------------------------ | -------------------------- |
| **Freshness needed** | Minutes to hours is fine | Seconds matter             |
| **Volume**           | Any                      | Continuous high throughput |
| **Complexity**       | Complex transformations  | Simple transforms/routing  |
| **Cost**             | Cheaper per event        | Higher infra cost          |
| **Example**          | Monthly revenue report   | Fraud detection alert      |

Most organizations need **both**: streaming for real-time use cases (alerts, dashboards, ML inference) and batch for complex analytics (training, reporting, reconciliation).

### The Lambda Architecture Trap

Don't build two separate pipelines (batch + streaming) that compute the same metrics differently. Instead, use the **Kappa architecture**: stream events into a data lake, then use batch queries on the historical stream data for complex analytics.

---

## Hands-on Lab

### Exercise 1: Design a Streaming Architecture

```python
# Scenario: E-commerce platform wants real-time capabilities:
# 1. Fraud detection on payments (< 2 second latency)
# 2. Live dashboard showing orders per minute by region
# 3. Real-time inventory updates when items are sold
# 4. Session-based product recommendations

# TODO: Design the topic structure, partition keys,
# consumer groups, and delivery guarantees for each use case
streaming_design = {}
```

### Exercise 2: Partition Key Selection

```python
# For each scenario, choose the best partition key and explain why:
# 1. IoT sensor data from 10,000 devices (need per-device ordering)
# 2. E-commerce clickstream (need per-session ordering)
# 3. Financial transactions (need exactly-once, high throughput)
# 4. Log aggregation (no ordering needed, maximum throughput matters)
```

### Exercise 3: Windowed Aggregation

```python
# TODO: Implement a tumbling window counter that:
# 1. Counts events per 60-second window
# 2. Groups by event_type
# 3. Emits results when a window closes
# 4. Handles late-arriving events (grace period of 10 seconds)

def tumbling_window_counter(events: list, window_seconds: int = 60, grace_seconds: int = 10):
    """Process a list of events and return per-window, per-type counts."""
    pass
```

---

## Mastery Check

**Q1**: What is a Kafka consumer group and why is it important?
<details><summary>Answer</summary>
A consumer group allows multiple consumers to parallelize work — each partition is assigned to exactly one consumer in the group. If you have 6 partitions and 3 consumers, each consumer processes 2 partitions. If a consumer fails, its partitions are reassigned to surviving consumers (rebalancing). This provides both parallelism and fault tolerance.
</details>

**Q2**: Why does exactly-once delivery have higher latency than at-least-once?
<details><summary>Answer</summary>
Exactly-once requires Kafka transactions: the producer sends events within a transaction boundary, consumers read only committed messages (read-committed isolation), and offset commits are atomic with processing. These coordination steps add latency. For most data pipelines, at-least-once with idempotent consumers is sufficient and much simpler.
</details>

**Q3**: When would you choose Google Pub/Sub over Kafka?
<details><summary>Answer</summary>
Choose Pub/Sub when: you're on GCP and want zero infrastructure management (fully serverless), you need global message routing across regions, or your team doesn't have Kafka expertise. Choose Kafka when: you need exactly-once semantics, very low latency (<10ms), topic compaction, or multi-data-centre replication with fine-grained control.
</details>

**Q4**: What is the "hot partition" problem and how do you solve it?
<details><summary>Answer</summary>
A hot partition occurs when one partition key generates disproportionately more events than others — e.g., a celebrity user generating 90% of clicks. The partition's consumer becomes a bottleneck. Solutions: (1) add a random suffix to the key for even distribution (lose ordering), (2) use a composite key like `user_id + hour`, (3) implement key-less (null key) partitioning for non-ordered workloads.
</details>

**Q5**: What is the difference between a tumbling window and a session window?
<details><summary>Answer</summary>
A tumbling window has a fixed, non-overlapping duration (e.g., "count per 1-minute window"). A session window has a dynamic duration based on activity — it groups events that occur within a specified inactivity gap (e.g., 30 minutes). Session windows are ideal for user behavior analysis where sessions have variable lengths.
</details>

---

## Summary

- ✅ **Event streaming**: Producers → Broker (Kafka/Pub/Sub) → Consumers — real-time data flow
- ✅ **Kafka concepts**: Topics, partitions (parallelism), offsets (progress tracking), consumer groups (work distribution)
- ✅ **Delivery guarantees**: At-most-once (lossy), at-least-once (most common), exactly-once (transactions)
- ✅ **Windowing**: Tumbling (fixed), sliding (overlapping), session (activity-based) — for streaming aggregations
- ✅ **Decision**: Use streaming for <1s latency needs; batch for complex analytics; most platforms need both

**Tomorrow → Day 127**: **Lakehouse Architecture** — Databricks, Unity Catalog, Delta Live Tables — merging the best of data lakes and warehouses.
