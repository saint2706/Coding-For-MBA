---
day: 72
title: "BI Data Formats & Ingestion"
phase: 6
phaseTitle: "Cutting-Edge ML & BI Foundations"
slug: "data-ingestion"
duration: 120
difficulty: "advanced"
tags:
  - data-engineering
  - json
  - parquet
  - apis
  - ingestion
concepts:
  - "JSON vs CSV vs Parquet"
  - "Row vs Columnar Formats"
  - "REST API Pagination"
  - "Batch vs Streaming Ingestion"
prerequisites:
  - "Python Basics (Requests library)"
  - "Understanding of File Systems"
outcomes:
  - "Extract data from a paginated REST API"
  - "Parse complex nested JSON"
  - "Explain why Parquet saves millions in cloud costs"
---

# 🎯 Day 72: BI Data Formats & Ingestion

> *"Data is like garbage. You’d better know what you are going to do with it before you collect it." — Mark Twain*

---

## The "Never-Coded" Bridge

**Moving Houses: Boxes vs. Shipping Containers.**

**JSON (Cardboard Boxes)**:
*   Flexible. You can throw a lamp, a pillow, and a cat in one box.
*   **Pros**: Easy to pack (Generate). Human readable (you can look inside).
*   **Cons**: Terrible for stacking heavily. Inefficient space usage due to packing peanuts (Metadata `{"key": "value"}` repeated every time).

**Parquet (Shipping Containers)**:
*   Rigid structure. Only "Lamps" go in the Lamp container.
*   **Pros**: Extremely efficient. Stackable. Compressed.
*   **Cons**: You can't just "peek inside" without a crane (Software).

**Business Impact**:
*   **APIs** use JSON (Boxes) to send small messages fast.
*   **Data Lakes** use Parquet (Containers) to store massive data cheaply. **Parquet is 10x smaller and 100x faster to read than CSV/JSON.**

---

## The Technical Deep Dive

### 1. File Formats Compared

| Format      | Readability   | Speed (Write) | Speed (Read) | Use Case                                         |
| :---------- | :------------ | :------------ | :----------- | :----------------------------------------------- |
| **CSV**     | ⭐⭐⭐⭐⭐ (Excel) | ⭐⭐⭐           | ⭐⭐           | Small manual uploads. Brittle (commas break).    |
| **JSON**    | ⭐⭐⭐⭐          | ⭐⭐⭐           | ⭐            | APIs, Web Apps. Managing nested data.            |
| **Parquet** | ⭐ (Binary)    | ⭐⭐            | ⭐⭐⭐⭐⭐        | Big Data Analytics (Spark, Snowflake). Columnar. |
| **Avro**    | ⭐ (Binary)    | ⭐⭐⭐⭐⭐         | ⭐⭐⭐          | Streaming Data (Kafka). Row-based.               |

### 2. The API Ingestion Pattern

APIs (Application Programming Interfaces) are how we get data *out* of SaaS tools (Salesforce, Stripe).
*   **REST**: The standard. Uses HTTP `GET` requests.
*   **Pagination**: APIs don't send 1,000,000 records at once. They send 100. You must ask for "Page 2", "Page 3", etc.
*   **Rate Limits**: "429 Too Many Requests." You must sleep (wait) between calls.

### 3. Reading Nested JSON

Data isn't always flat.
```json
{
  "user": "Alice",
  "orders": [
    {"id": 101, "item": "Book"},
    {"id": 102, "item": "Pen"}
  ]
}
```
*   **Challenge**: SQL tables are flat (Row/Col).
*   **Solution**: "Explode" or "Unnest" the `orders` array to create 2 rows for Alice.

---

## Senior-Level Insights

### "Schema Evolution"

The world changes.
*   **CSV**: If a column is added ("Middle Name"), old parsers break because the comma count is wrong.
*   **JSON/Parquet**: Handles added/removed fields gracefully (Self-describing).
*   **Advice**: Never use CSV for long-term storage in a Data Lake. Use Parquet.

### Compression is Cash

Storing 1 Petabyte of uncompressed JSON on S3 costs ~$23,000/month.
Storing the same data in Snappy-Compressed Parquet costs ~$2,000/month.
**Format choices directly impact the CFO's budget.**

---

## Hands-on Lab

### Exercise 1: Handling Pagination (API Loop)
**Goal**: Write a loop to fetch all pages of data.

**Scenario**: An API returns `{"data": [...], "next_page": 2}`. If `next_page` is null, stop.

```python
import time

def fetch_page(page_num):
    # Simulate API call
    print(f"Fetching Page {page_num}...")
    if page_num < 3:
        return {"data": [1, 2, 3], "next_page": page_num + 1}
    else:
        return {"data": [4, 5], "next_page": None} # Last page

all_data = []
current_page = 1

while current_page is not None:
    response = fetch_page(current_page)
    all_data.extend(response['data'])
    
    current_page = response['next_page']
    time.sleep(0.5) # Respect rate limits!

print(f"Captured {len(all_data)} records: {all_data}")
```

**Expected Output**:
```text
Fetching Page 1...
Fetching Page 2...
Fetching Page 3...
Captured 8 records: [1, 2, 3, 1, 2, 3, 4, 5]
```

### Exercise 2: Flattening Nested JSON
**Goal**: Convert a nested dictionary into a list of specific events.

```python
data = [
    {"user": "Alice", "events": ["login", "click", "logout"]},
    {"user": "Bob", "events": ["login"]}
]

flat_rows = []

for entry in data:
    user_name = entry['user']
    for event in entry['events']:
        # Create one row per event
        flat_rows.append({"user": user_name, "event_type": event})

# Print first 2 flattened rows
print(flat_rows[0])
print(flat_rows[1])
```

**Expected Output**:
```text
{'user': 'Alice', 'event_type': 'login'}
{'user': 'Alice', 'event_type': 'click'}
```

### Exercise 3: File Size Conceptual
**Goal**: Calculate cost savings.

*   **Raw CSV**: 100 GB.
*   **Parquet (Columnar + Dictionary Encoding)**: Typically 10x smaller.
    *   *Why?* The column "Country" has "USA" 1 million times. Parquet just says "USA x 1,000,000" (Run Length Encoding). CSV writes "USA, USA, USA..." 1 million times.
*   **Compressed Parquet (Snappy)**: Another 2x smaller.
*   **Final Size**: 100 GB -> 5 GB.
*   **Cost Savings**: 95%.

---

## Mastery Check

### Question 1: Parquet
Why is Parquet faster for analytics than CSV?
A) It is text-based.
B) It is Column-Oriented, allowing the engine to skip reading unnecessary columns.
C) It is owned by Google.
D) It uses commas.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Analytics queries usually ask for specific columns (AVG Price), not full rows. Parquet is built for this.
</details>

### Question 2: Pagination
If you forget to handle pagination when calling an API, what happens?
A) You get all the data automatically.
B) You get only the first page (e.g., first 50 records) and miss the rest.
C) The API crashes.
D) You get banned.

<details>
<summary>Click for Answer</summary>

**Answer: B**
APIs default to returning a small subset to save bandwidth.
</details>

### Question 3: Rate Limits
What does HTTP Code 429 mean?
A) Not Found.
B) Server Error.
C) Too Many Requests (Rate Limit Exceeded).
D) Unauthorized.

<details>
<summary>Click for Answer</summary>

**Answer: C**
You are calling the API too fast. Slow down your loop.
</details>

### Question 4: Nested Data
Which format supports Nested Data (Arrays/Objects) natively?
A) CSV
B) JSON
C) TSV
D) Fixed Width

<details>
<summary>Click for Answer</summary>

**Answer: B**
JSON is hierarchical. CSV is flat.
</details>

### Question 5: Ingestion
What is "Streaming Ingestion"?
A) Loading data once a day at midnight.
B) Loading data immediately as it is generated (Real-time).
C) Watching Netflix while coding.
D) Manual data entry.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Tools like Kafka or Kinesis handle streams of events in real-time.
</details>

---

## Summary

Today you learned:
*   ✅ **JSON** is for flexibility (APIs); **Parquet** is for performance (Analytics).
*   ✅ **Pagination** is required to get full datasets from APIs.
*   ✅ **Compression** isn't just technical; it's financial.
*   ✅ **Nested Data** requires "Flattening" to fit into SQL Analysis.

**Congratulations!** You have completed Phase 6. You now possess the skills of both an Advanced ML Engineer and a BI Leader. You are ready to bridge the gap between Technical Models and Business Strategy.
