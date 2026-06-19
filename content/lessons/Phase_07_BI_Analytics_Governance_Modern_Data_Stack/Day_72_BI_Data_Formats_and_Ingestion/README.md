---
day: 72
title: "BI Data Formats & Ingestion"
phase: 7
phaseTitle: "BI Analytics, Governance & Modern Data Stack"
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

* Flexible. You can throw a lamp, a pillow, and a cat in one box.
* **Pros**: Easy to pack (Generate). Human readable (you can look inside).
* **Cons**: Terrible for stacking heavily. Inefficient space usage due to packing peanuts (Metadata `{"key": "value"}` repeated every time).

**Parquet (Shipping Containers)**:

* Rigid structure. Only "Lamps" go in the Lamp container.
* **Pros**: Extremely efficient. Stackable. Compressed.
* **Cons**: You can't just "peek inside" without a crane (Software).

**Business Impact**:

* **APIs** use JSON (Boxes) to send small messages fast.
* **Data Lakes** use Parquet (Containers) to store massive data cheaply. **Parquet is 10x smaller and 100x faster to read than CSV/JSON.**

---

## The Technical Deep Dive

### 1. File Formats Compared

| Format      | Readability   | Speed (Write) | Speed (Read) | Use Case                                         |
| :---------- | :------------ | :------------ | :----------- | :----------------------------------------------- |
| **CSV**     | ⭐⭐⭐⭐⭐ (Excel) | ⭐⭐⭐           | ⭐⭐           | Small manual uploads. Brittle (commas break).    |
| **JSON**    | ⭐⭐⭐⭐          | ⭐⭐⭐           | ⭐            | APIs, Web Apps. Managing nested data.            |
| **Parquet** | ⭐ (Binary)    | ⭐⭐            | ⭐⭐⭐⭐⭐        | Big Data Analytics (Spark, Snowflake). Columnar. |
| **Avro**    | ⭐ (Binary)    | ⭐⭐⭐⭐⭐         | ⭐⭐⭐          | Streaming Data (Kafka). Row-based.               |

#### Decision Guidance: Choosing a Format

The table above tells you *what* each format is. The table below tells you *which one to pick* for a given job at BrightCart, our running example DTC e-commerce company (web + app + marketplace sales channels):

| Factor                    | CSV                          | JSON                              | Parquet                                  | Avro                                |
| :------------------------ | :--------------------------- | :--------------------------------- | :---------------------------------------- | :----------------------------------- |
| **Orientation**           | Row                           | Row (document-oriented)            | **Columnar** — reads only needed columns  | Row                                   |
| **Compression**           | Poor (text, repeats values)  | Poor (key names repeated per row)  | **Excellent** (dictionary + RLE + Snappy) | Good (binary, schema separate)        |
| **Schema**                | None — types inferred/guessed | Implicit, can vary row-to-row      | **Embedded & enforced**                   | **Embedded**, evolves via schema registry |
| **Append/Update behavior**| Easy to append; updates need full rewrite | Easy to append (one object per line / JSON Lines) | Append-friendly in object storage; updates require rewriting files (or a table format like Delta/Iceberg on top) | Append-friendly; designed for log/event streams |
| **Interoperability**      | Universal (Excel, every tool) | Universal for APIs/web              | Needs a Parquet-aware engine (Spark, DuckDB, Pandas, Snowflake) | Needs Avro-aware tooling (mostly Kafka ecosystem) |
| **Cost at scale**         | High storage + high scan cost | High storage + high scan cost      | **Low** — this is the $23k → $2k story below | Low storage, optimized for streaming throughput |
| **BrightCart use case**   | Ad-hoc marketing export to a vendor | `orders` webhook payloads from the marketplace API | Nightly warehouse landing zone for `orders`/`order_items` | Real-time clickstream events from the BrightCart mobile app |

**Rule of thumb**: if a human opens the file in a text editor, use CSV/JSON. If a *machine* reads it repeatedly for analytics, use Parquet. If it's a continuous stream of small events, use Avro (or JSON Lines as a simpler stand-in).

### 2. The API Ingestion Pattern

APIs (Application Programming Interfaces) are how we get data *out* of SaaS tools (Salesforce, Stripe) — and, in our running example, out of BrightCart's own order-management system.

* **REST**: The standard. Uses HTTP `GET` requests.
* **Pagination**: APIs don't send 1,000,000 records at once. They send 100. You must ask for "Page 2", "Page 3", etc.
* **Rate Limits**: "429 Too Many Requests." You must sleep (wait) between calls.

#### Authentication & Secrets

Every real API call needs credentials. Never hardcode them.

```python
import os

# Read from environment variables, not from source code.
API_KEY = os.environ["BRIGHTCART_API_KEY"]
HEADERS = {"Authorization": f"Bearer {API_KEY}"}
```

* **Why/what**: Hardcoded keys leak the moment the code is pushed to GitHub. Secrets belong in environment variables, a secrets manager (AWS Secrets Manager, HashiCorp Vault), or a `.env` file that is git-ignored — never in the script itself.
* **Rotation**: Treat API keys like passwords — rotate them on a schedule and immediately if a key is exposed.

#### Rate-Limit Backoff & Retries

A naive loop that hammers an API on every `429` will get your account banned. Production ingestion uses **exponential backoff**: wait longer after each consecutive failure.

```python
import time
import random


def fetch_with_backoff(page_num, max_retries=5):
    """What: retry a flaky/rate-limited call. Why: transient errors (429, 503)
    are common at scale and should not crash the whole pipeline."""
    for attempt in range(max_retries):
        status_code = simulate_api_call(page_num, attempt)
        if status_code == 200:
            return {"data": [1, 2, 3], "next_page": page_num + 1}
        if status_code == 429:
            wait = (2 ** attempt) + random.uniform(0, 1)  # exponential + jitter
            print(f"Rate limited. Retrying in {wait:.1f}s...")
            time.sleep(wait)
    raise RuntimeError(f"Failed after {max_retries} retries")


def simulate_api_call(page_num, attempt):
    # Pretend the API rate-limits the first attempt, then succeeds.
    return 429 if attempt == 0 else 200
```

**Expected behavior**: attempt 0 prints `Rate limited. Retrying in 1.x s...`, attempt 1 returns data successfully. The `random.uniform(0, 1)` "jitter" prevents many clients from retrying at the exact same instant (the "thundering herd" problem).

* **Idempotency**: Design ingestion so re-running a failed batch doesn't create duplicate rows. Use an `idempotency key` (e.g., `order_id` + `extracted_at` date) and `INSERT ... ON CONFLICT DO NOTHING` / `MERGE` semantics rather than blind `INSERT`.

#### Incremental Extraction & Watermarks

Re-pulling all of BrightCart's order history every night is slow and expensive. Instead, track a **watermark** — the timestamp/ID of the last record you successfully ingested — and only ask the API for records newer than that.

```python
last_watermark = "2026-06-18T00:00:00Z"  # stored from the previous run

params = {"updated_since": last_watermark}
# response only contains orders updated after the watermark
new_watermark = "2026-06-19T00:00:00Z"  # persist this for tomorrow's run
```

* **CDC (Change Data Capture)**: A more advanced form of incremental extraction that reads a database's transaction log (e.g., Postgres WAL, MySQL binlog) to capture every insert/update/delete in near real time, instead of polling an API on a schedule.
* **Webhooks**: Instead of *polling* BrightCart's API every hour, the API can *push* an event to your endpoint the instant an order ships ("event-driven ingestion"). Lower latency, but you must build a receiver that's always available and handles retries from the sender.
* **Streaming**: For continuous high-volume data (clickstream, IoT), tools like Kafka or Kinesis ingest events as an unbounded stream rather than discrete batches.
* **Dead-letter handling**: When a record fails validation or repeatedly errors out, don't crash the whole pipeline — route it to a "dead-letter queue" (a quarantine table/topic) for manual review, and keep processing the rest.

### 3. Reading Nested JSON

Data isn't always flat. Here is a real BrightCart marketplace webhook payload — note that `orders` is a *list nested inside* a single customer record:

```json
{
  "user": "Alice",
  "orders": [
    {"id": 101, "item": "Book"},
    {"id": 102, "item": "Pen"}
  ]
}
```

* **Challenge**: SQL tables are flat (Row/Col).
* **Solution**: "Explode" or "Unnest" the `orders` array to create 2 rows for Alice.

### 4. Schema Contracts, Validation & Observability

Ingestion isn't just "move bytes from A to B." Production pipelines treat the *shape* of the data as a contract.

* **Schema contract**: An explicit agreement (often a JSON Schema or Avro schema) describing required fields, types, and nullability — e.g., "every BrightCart order event must have `order_id: string`, `order_date: date`, `status: enum`."
* **Schema evolution**: New fields (e.g., `gift_wrap: bool` added to `orders`) should be *additive* and *optional* so old consumers don't break. Removing or retyping a field is a **breaking change** and needs a version bump.
* **Validation**: Check incoming records against the contract before loading. Reject or quarantine records that fail (missing `order_id`, `order_date` in the future, `status` not in the allowed enum).
* **Quarantine**: Invalid records go to a holding table (`orders_quarantine`) instead of silently being dropped or silently corrupting the warehouse — this is what enables someone to ask "why are yesterday's numbers off?" and get an answer.
* **Deduplication**: Webhooks and retries can deliver the same `order_id` twice. Dedupe on a natural key + `ingested_at` (keep latest) before loading into the warehouse.
* **Late data**: An order that "happened" on June 18 but arrives in the June 19 batch (due to a retry or an offline mobile app sync) needs a policy: do you restate June 18's numbers, or attribute it to when it arrived?
* **PII classification**: Tag fields like `customer_email`, `shipping_address` as PII at ingestion time so downstream masking/access-control policies (Phase 7's governance lessons) can be applied automatically instead of being bolted on later.
* **Ingestion observability**: Track row counts in vs. out, schema-validation failure rate, pipeline latency (extract-to-load time), and freshness (time since last successful load) — and alert when any of these drift from baseline.

---

## Senior-Level Insights

### "Schema Evolution"

The world changes.

* **CSV**: If a column is added ("Middle Name"), old parsers break because the comma count is wrong.
* **JSON/Parquet**: Handles added/removed fields gracefully (Self-describing).
* **Advice**: Never use CSV for long-term storage in a Data Lake. Use Parquet.

### Compression is Cash

Storing 1 Petabyte of uncompressed JSON on S3 costs ~$23,000/month.
Storing the same data in Snappy-Compressed Parquet costs ~$2,000/month.
**Format choices directly impact the CFO's budget.**

---

## Hands-on Lab

All exercises use a single runnable, self-contained Python fixture: the **BrightCart Orders API** (simulated, no network calls or API key needed, so it runs anywhere).

### Exercise 1: Handling Pagination (API Loop)

**What/Why**: Real BI ingestion pipelines almost never get all their data in one call. Before writing any transformation logic, you must master the "ask for the next page until told to stop" loop — get this wrong and your dashboard silently shows 1/10th of BrightCart's real order volume.

**Goal**: Write a loop to fetch all pages of data from the simulated BrightCart orders endpoint.

**Scenario**: The endpoint returns `{"data": [...], "next_page": 2}`. If `next_page` is null, stop. This fixture simulates 3 pages of BrightCart order IDs.

```python
import time


def fetch_page(page_num):
    # Simulate API call to GET /v1/orders?page={page_num}
    print(f"Fetching Page {page_num}...")
    if page_num < 3:
        return {"data": [1, 2, 3], "next_page": page_num + 1}
    else:
        return {"data": [4, 5], "next_page": None}  # Last page


all_data = []
current_page = 1
page_count = 0

while current_page is not None:
    response = fetch_page(current_page)
    all_data.extend(response["data"])
    page_count += 1

    current_page = response["next_page"]
    time.sleep(0.5)  # Respect rate limits!

print(f"Captured {len(all_data)} records across {page_count} pages: {all_data}")
```

**Expected Output**:

```text
Fetching Page 1...
Fetching Page 2...
Fetching Page 3...
Captured 8 records across 3 pages: [1, 2, 3, 1, 2, 3, 4, 5]
```

**Checkpoint**: page count must equal 3, and total record count must equal 8 (3 + 3 + 2). If your loop returns a different count, check whether you are overwriting `current_page` before extending `all_data`, or stopping on the first `None` check instead of after extending.

### Exercise 2: Flattening Nested JSON

**What/Why**: BrightCart's marketplace channel sends one JSON document per customer, with an `events` (or `orders`) array nested inside. SQL/BI tools need one *row* per event, not one row per customer. This is the single most common ingestion bug: forgetting to flatten, and ending up with 1 row instead of N.

**Goal**: Convert a nested dictionary into a list of specific events.

```python
data = [
    {"user": "Alice", "events": ["login", "click", "logout"]},
    {"user": "Bob", "events": ["login"]},
]

flat_rows = []

for entry in data:
    user_name = entry["user"]
    for event in entry["events"]:
        # Create one row per event
        flat_rows.append({"user": user_name, "event_type": event})

# Print all flattened rows and the row-count check
for row in flat_rows:
    print(row)
print(f"Total flattened rows: {len(flat_rows)}")
```

**Expected Output**:

```text
{'user': 'Alice', 'event_type': 'login'}
{'user': 'Alice', 'event_type': 'click'}
{'user': 'Alice', 'event_type': 'logout'}
{'user': 'Bob', 'event_type': 'login'}
Total flattened rows: 4
```

**Checkpoint**: 2 input customer records become 4 output rows (3 + 1 events). If your row count equals your *input* record count (2), you forgot the inner loop — the most common flattening mistake.

### Exercise 3: BrightCart Orders API — Full Ingestion with Backoff and Schema Validation

**What/Why**: This combines pagination, retry/backoff, and schema validation into one runnable pipeline — the shape of a real ingestion job, just small enough to trace by hand.

**Fixture**: A simulated BrightCart orders endpoint that fails once with a `429`, then returns 2 pages of orders, one of which contains a record missing a required field.

```python
import time
import random

random.seed(42)  # deterministic "jitter" for reproducible output

BRIGHTCART_PAGES = {
    1: {
        "status": 429,  # first call is rate-limited
    },
    1.1: {  # retry of page 1 succeeds
        "status": 200,
        "data": [
            {"order_id": "BC-1001", "customer_id": "C-01", "status": "delivered"},
            {"order_id": "BC-1002", "customer_id": "C-02", "status": "shipped"},
        ],
        "next_page": 2,
    },
    2: {
        "status": 200,
        "data": [
            {"order_id": "BC-1003", "customer_id": "C-03", "status": "placed"},
            {"customer_id": "C-04", "status": "cancelled"},  # missing order_id!
        ],
        "next_page": None,
    },
}

REQUIRED_FIELDS = {"order_id", "customer_id", "status"}


def fetch_page_with_backoff(page_num, attempt=0):
    key = page_num if attempt == 0 else page_num + 0.1
    response = BRIGHTCART_PAGES.get(key, BRIGHTCART_PAGES[page_num])
    if response["status"] == 429:
        wait = (2 ** attempt) + random.uniform(0, 0.1)
        print(f"Page {page_num}: 429 received, backing off {wait:.2f}s...")
        time.sleep(wait)
        return fetch_page_with_backoff(page_num, attempt + 1)
    print(f"Page {page_num}: 200 OK ({len(response['data'])} records)")
    return response


good_rows, quarantine_rows = [], []
current_page = 1
while current_page is not None:
    page = fetch_page_with_backoff(current_page)
    for record in page["data"]:
        if REQUIRED_FIELDS.issubset(record.keys()):
            good_rows.append(record)
        else:
            quarantine_rows.append(record)
    current_page = page["next_page"]

print(f"Loaded: {len(good_rows)} good rows, {len(quarantine_rows)} quarantined")
print("Quarantined record(s):", quarantine_rows)
```

**Expected Output**:

```text
Page 1: 429 received, backing off 1.04s...
Page 1: 200 OK (2 records)
Page 2: 200 OK (2 records)
Loaded: 3 good rows, 1 quarantined
Quarantined record(s): [{'customer_id': 'C-04', 'status': 'cancelled'}]
```

**Checkpoint**: 4 total input records, 3 pass validation, 1 is quarantined for missing `order_id`. This is exactly the schema-contract + quarantine pattern described above — the pipeline keeps running instead of crashing on the bad record.

### Exercise 4: File-Size & Cost Comparison

**What/Why**: Format choice is a budget decision, not just a technical one. This exercise makes the CFO-facing math concrete using BrightCart's order history.

**Goal**: Calculate cost savings for storing 1 year of BrightCart `order_items` (100 GB raw).

* **Raw CSV**: 100 GB.
* **Parquet (Columnar + Dictionary Encoding)**: Typically 10x smaller.
  * *Why?* The column "channel" has "web" 1 million times. Parquet just says "web x 1,000,000" (Run Length Encoding). CSV writes "web, web, web..." 1 million times.
* **Compressed Parquet (Snappy)**: Another 2x smaller.
* **Final Size**: 100 GB -> 5 GB.
* **Cost Savings**: 95%.

**Expected Output** (using $0.023/GB/month, a typical S3 standard-tier rate):

```text
Raw CSV:               100 GB  -> $2.30/month
Parquet (uncompressed): 10 GB  -> $0.23/month
Parquet (Snappy):        5 GB  -> $0.12/month
Savings vs raw CSV: 95% ($2.18/month per 100GB — scales to thousands/month at real BrightCart volume)
```

---

## Translation Lab: Ingestion Quality to Governance Signals

**Scenario**: A schema migration introduces silent null inflation that skews fairness monitoring.

**Your task**:

1. Translate ingestion-quality, causal, and fairness outputs into KPI impact narratives.
2. Define BI metrics for long-term degradation and bias detection (null-rate drift, schema-change impact, subgroup metric stability).
3. Convert pipeline/deployment monitoring signals into dashboard specs and escalation rules.
4. Write a one-page decision memo with technical evidence and business recommendation.

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

### Question 6: Idempotency

Why does an ingestion pipeline need idempotency keys (like `order_id` + extraction date)?

A) To make the code run faster.
B) So that re-running a failed batch doesn't insert duplicate rows.
C) To satisfy GDPR.
D) To compress the JSON payload.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Network failures and retries are common. If a batch partially loads and is re-run, idempotency keys (combined with `MERGE`/`UPSERT` logic) ensure the same record isn't loaded twice.
</details>

---

## Cross-References

* **Phase 7 Day 73 — BI SQL & Databases** (the flattened rows you produce here become the raw tables you query tomorrow).
* **Phase 7 Day 74 — BI Data Preparation & Tools** (schema validation/quarantine here is the upstream half of the data-cleaning pipeline covered there).
* **Phase 7 Day 76 — BI Architecture & Data Modeling** (this lesson's raw extracts feed the warehouse/star-schema design in that lesson).
* **Phase 6 Day 65 — MLOps Pipelines & CI** (the CI data-contract gate introduced there is the same validation pattern applied here to ingestion).
* **Phase 7 Day 80 — Data Governance & Compliance** (PII classification flagged at ingestion time is enforced by the governance controls covered there).

## Glossary

* **CSV (Comma-Separated Values)**: A plain-text, row-oriented file format with no embedded schema or type information.
* **JSON (JavaScript Object Notation)**: A human-readable, hierarchical text format that natively supports nested objects and arrays; the default for REST APIs.
* **Parquet**: A binary, columnar storage format with embedded schema, compression, and encoding optimizations built for analytics at scale.
* **API (Application Programming Interface)**: A defined contract that lets one system request data or actions from another, typically over HTTP.
* **Pagination**: The practice of splitting a large result set into smaller "pages" that must be requested one at a time.
* **Rate limit**: A cap on how many requests a client can make in a time window, enforced by HTTP `429 Too Many Requests` responses.
* **Schema evolution**: The ability of a data format/contract to gain, lose, or change fields over time without breaking existing consumers.
* **CDC (Change Data Capture)**: Reading a source database's transaction log to capture every row-level insert/update/delete as it happens.
* **Compression**: Encoding data so it takes less storage space (and less I/O to read), e.g., Snappy compression on Parquet files.
* **Watermark**: The timestamp or ID marking the last successfully ingested record, used to support incremental (rather than full) extraction.
* **Dead-letter queue**: A holding location for records that fail processing/validation, so they can be inspected without blocking the rest of the pipeline.

---

## Summary

Today you learned:

* ✅ **JSON** is for flexibility (APIs); **Parquet** is for performance (Analytics).
* ✅ **Pagination** is required to get full datasets from APIs.
* ✅ **Compression** isn't just technical; it's financial.
* ✅ **Nested Data** requires "Flattening" to fit into SQL Analysis.

**Congratulations!** You have completed Phase 6. You now possess the skills of both an Advanced ML Engineer and a BI Leader. You are ready to bridge the gap between Technical Models and Business Strategy.
