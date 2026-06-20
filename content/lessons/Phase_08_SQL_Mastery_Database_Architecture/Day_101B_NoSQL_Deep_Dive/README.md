---
day: 101B
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

# 🍃 Day 101B: NoSQL Deep Dive

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

### 1. The CAP Theorem (and why "pick two" is the wrong mental model)

The classic shorthand — "every distributed database must trade off between three properties, you can only guarantee two" — is the version most engineers learn first, and it is **imprecise enough to cause bad architecture decisions**. Here is the corrected version:

**CAP only applies when there is an actual network partition (P).** If the network is healthy and every node can talk to every other node, a well-built distributed system can give you both Consistency and Availability simultaneously — there is no tax to pay in the happy path. The theorem (Brewer's conjecture, formalized by Gilbert & Lynch, 2002) says: **the instant a partition occurs, you must choose between Consistency and Availability for the requests touching the partitioned nodes.** "Partition Tolerance" is not really a knob you turn off — in any real multi-node system, the network *will* eventually partition (a switch fails, a cable gets cut, a region loses connectivity), so you must design for it. The real decision is:

- **CP (Consistency over Availability during a partition)**: when the partition hits, the system refuses to answer (or returns an error) on the minority side rather than risk returning stale/conflicting data. Example: a single-leader Postgres cluster where a replica that can't reach the primary stops serving writes.
- **AP (Availability over Consistency during a partition)**: when the partition hits, every reachable node keeps answering requests, even if that means different nodes temporarily disagree. Example: Cassandra nodes on each side of a network split keep accepting writes; they reconcile later.

```
                    Consistency
              (all nodes see same data)
                         |
                         |  <- the CP/AP choice ONLY
                         |     matters HERE: during
                         |     an actual partition
   Availability ─────────────────── Partition (P)
   (always responds)              (network split happened)

No partition?  You get C AND A together. CAP says nothing about this case.
Partition happened?  Pick: block/error (CP) or answer with possibly-stale data (AP).
```

**PACELC — the more useful framework for the 99% of the time there is NO partition.** PACELC (Abadi, 2012) extends CAP: "if Partition, then choose Availability or Consistency; **Else** (no partition), choose **Latency or Consistency**." This is the tradeoff that actually governs day-to-day behavior of most systems, because partitions are rare but every single request pays a latency-vs-consistency cost:

- **PA/EL** systems (e.g., Cassandra, DynamoDB default mode): available under partition, and low-latency (favors fast local reads over guaranteed-fresh reads) when healthy.
- **PC/EC** systems (e.g., a synchronously-replicated relational cluster): consistent under partition (blocks/errors), and willing to add latency (wait for quorum/replica acknowledgment) when healthy, to keep reads fresh.

**Qualify the product labels — most are configurable, not fixed:**

| System | Default leaning | Why it's not a fixed label |
|---|---|---|
| PostgreSQL (single primary) | CP | A synchronous replica setup blocks writes if it can't confirm to the standby (favors C); async replication favors A but risks losing recent writes on failover. |
| MongoDB | Tunable CP↔AP | `writeConcern` (`majority`, `1`, `0`) and `readConcern`/`readPreference` (`primary`, `secondaryPreferred`) let you dial between "wait for majority ack" (more C) and "answer from any node fast" (more A), per query. |
| Cassandra | Tunable, defaults toward AP | Per-query **consistency levels** (`ONE`, `QUORUM`, `ALL`) trade off latency/availability against read/write consistency — `ALL` behaves much more like CP than `ONE` does. |
| Redis (single node) | N/A — no partition possible | A single node can't partition against itself; CAP doesn't apply until you add replicas/cluster mode, at which point unconfirmed async replication favors A over C. |

The takeaway: **"MongoDB is CP" or "Cassandra is AP" is a claim about a specific configuration, not an immutable property of the product.** Always ask "consistency level/write concern set to what?" before trusting a CAP label.

### 2. MongoDB — Document Store

MongoDB stores data as **flexible JSON-like documents**, serialized on disk as **BSON** (Binary JSON — adds types JSON lacks, like dates, binary blobs, and 64-bit integers, and supports byte-offset traversal so the server doesn't have to re-parse text). One document = one "row" conceptually, but unlike a SQL table, documents in the same collection are not required to share the same fields.

**What/why**: the block below shows the full lifecycle a business application actually needs — inserting orders with nested structure (items, customer), querying by field/array/range, aggregating like a `GROUP BY`, and updating. Read it as "how do I replace five normalized SQL tables (orders, order_items, customers) with one denormalized collection, and what do I gain/lose."

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

**Line-by-line — the aggregation pipeline (the part most readers skim past):**

1. `pipeline = [...]` — a **list of stages**, executed in order, each stage's output feeding the next stage's input. Conceptually this is a SQL query read top-to-bottom as `FROM orders → WHERE → GROUP BY → ORDER BY`, except each clause is its own explicit JSON object.
2. `{"$match": {"status": "shipped"}}` — equivalent to SQL `WHERE status = 'shipped'`. Always put `$match` first when possible: it shrinks the document set before the more expensive `$group` stage runs, the same reasoning as filtering before joining in SQL.
3. `{"$group": {"_id": "$status", ...}}` — equivalent to `GROUP BY status`. `_id` here is *not* the document's primary key; inside `$group` it means "the grouping key" — a common point of confusion for SQL natives. The `$` prefix on `"$status"` and `"$total"` means "read this field's value from each input document," not a literal string.
4. `"count": {"$sum": 1}` — equivalent to `COUNT(*)`: add 1 for every document in the group.
5. `"total_revenue": {"$sum": "$total"}` — equivalent to `SUM(total)`: add up the `total` field's value across the group.
6. `{"$sort": {"total_revenue": -1}}` — equivalent to `ORDER BY total_revenue DESC`; `-1` is descending, `1` is ascending.
7. `orders.aggregate(pipeline)` returns a cursor; iterating it (`for result in ...`) pulls result documents lazily, the same streaming model as a SQL cursor — important for pipelines that could return millions of grouped rows.

**Schema validation — MongoDB is schema-flexible, not schema-*less* in production.** Letting every document have arbitrary fields is fine for prototyping; in production you almost always want a **JSON Schema validator** attached to the collection so a typo'd field name or a missing required field is rejected at write time instead of silently corrupting downstream aggregations:

```python
db.command({
    "collMod": "orders",
    "validator": {
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["order_id", "total", "status"],
            "properties": {
                "order_id": {"bsonType": "string"},
                "total": {"bsonType": "double", "minimum": 0},
                "status": {"enum": ["placed", "shipped", "cancelled", "pending"]},
            },
        }
    },
    "validationLevel": "moderate",  # "moderate" = only validate new/modified docs; "strict" = validate all writes
})
```

**Indexes — without one, every query above is a full collection scan.** Create a compound index that matches your most common query shape (filter field first, sort field second, following the same left-to-right rule as a SQL composite index):

```python
orders.create_index([("status", 1), ("total", -1)])  # supports the high_value query above
orders.create_index([("customer.email", 1)], unique=True, sparse=True)
# sparse=True: skip indexing documents where customer.email doesn't exist (e.g., ORD-002)
```

**Multi-document transactions.** Since MongoDB 4.0, you can wrap multiple writes across multiple documents/collections in an ACID transaction — useful when, e.g., debiting an `accounts` collection and inserting into `orders` must succeed or fail together:

```python
with client.start_session() as session:
    with session.start_transaction():
        accounts.update_one({"_id": "ACC-1"}, {"$inc": {"balance": -50}}, session=session)
        orders.insert_one({"order_id": "ORD-003", "total": 50}, session=session)
        # both commit together, or both roll back on any exception
```

Transactions in MongoDB carry a real performance cost (they hold locks and coordinate across the replica set) — use them for genuine multi-document invariants, not as a default habit.

**When to use MongoDB**: Product catalogs (varying attributes per product), user profiles, CMS content, event logging.

### 3. Redis — Key-Value / Cache

Redis stores data **in-memory**, so the database engine itself can locate and return a key in nanoseconds-to-low-microseconds. **That is not the same number an application observes.** Once you add the network round-trip (client → Redis server → client), serialization, and connection-pool overhead, real-world Redis latency from an application is typically **sub-millisecond to a few milliseconds** (commonly cited as ~0.1–1ms on a local/same-datacenter network) — still dramatically faster than a disk-backed database query, but "nanosecond latency" overstates what your code will actually see. The corrected framing: *in-memory access is nanosecond-scale; application-observed latency is sub-millisecond-scale, dominated by the network, not the lookup.*

**What/why**: the block below demonstrates the four Redis use cases that show up constantly in production systems — simple key-value with expiry, the cache-aside pattern (the single most common caching strategy), sorted sets for leaderboards, and lists as a lightweight queue. Read it as "five different data structures, one in-memory engine."

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

**Line-by-line — the cache-aside pattern (the most important block here):**

1. `cache_key = f"user:{user_id}"` — Redis is a flat key-value store with no concept of "tables," so the convention is to build hierarchical-looking keys with colons (`user:1001`, `user:1001:score`) purely as a human-readable naming convention; Redis treats the whole string as one opaque key.
2. `cached = r.get(cache_key)` — a single round-trip to check if this key currently exists. Returns `None` if absent or expired.
3. `if cached: return json.loads(cached)` — the **cache hit** path. The value was stored as a JSON string (Redis values are strings/bytes; it doesn't natively store Python dicts), so we deserialize it back into a dict before returning. This path skips the database entirely.
4. `user = get_user_expensive(user_id)` — the **cache miss** path: only now do we pay the cost of the slow source (database, API, computation).
5. `r.setex(cache_key, timedelta(minutes=15), json.dumps(user))` — `SETEX` atomically sets the key **and** its time-to-live (TTL) in one command, avoiding a race where a separate `SET` then `EXPIRE` could leave the key without an expiry if the process crashes between the two calls. After 15 minutes, Redis auto-evicts this key — the next `get_user()` call will miss and refresh from source.
6. The function returns the freshly fetched value either way — callers don't need to know whether it was a hit or miss.

**Eviction policies — what happens when Redis runs out of memory.** Redis is bounded by RAM; once `maxmemory` is reached, it must evict keys to make room for new writes (or refuse writes, depending on policy). This is configured server-side, not per-call:

| Policy | Behavior | When to use |
|---|---|---|
| `noeviction` | Reject writes once full; reads still work | Never silently lose data — accept write failures instead (e.g., a queue you must not corrupt) |
| `allkeys-lru` | Evict the least-recently-used key, any key | General-purpose cache (most common default for cache-aside workloads) |
| `volatile-lru` | Evict least-recently-used key **among keys with a TTL set** | Mixed workload: some keys must never be evicted (no TTL), others are disposable cache entries |
| `allkeys-lfu` | Evict least-*frequently*-used key | Workloads where popularity matters more than recency (e.g., trending-product cache) |

**Persistence — Redis is in-memory, but it is not necessarily volatile.** Two mechanisms let you survive a restart, with a durability/performance tradeoff:

- **RDB (snapshotting)**: periodically dumps the entire dataset to disk (e.g., every N seconds if M keys changed). Fast to restart from, but you lose any writes since the last snapshot on a crash.
- **AOF (Append-Only File)**: logs every write command to disk as it happens. Configurable fsync frequency (`always`, `everysec`, `no`) trades durability for write throughput — `everysec` (the common default) can lose at most ~1 second of writes on a crash.
- Many production deployments enable both: RDB for fast full restores, AOF for tighter durability between snapshots.
- A pure cache-aside cache (where Redis only ever holds derived/recomputable data) often runs with persistence **disabled** entirely — a cold cache after restart just means a burst of cache misses, not data loss, since the source of truth lives elsewhere.

**Cache invalidation — the other half of cache-aside that the basic pattern above ignores.** TTL expiry alone means stale data can be served for up to the TTL window after the underlying data changes. Two common strategies layered on top of TTL:
- **Write-through invalidation**: when the source data changes, explicitly `DELETE` (or update) the cache key in the same transaction/request that wrote the database, so the next read is a guaranteed miss-and-refresh.
- **Versioned keys**: include a version/timestamp in the key itself (`user:1001:v3`) and bump the version on write, so old cached entries are simply never looked up again (they age out via TTL on their own).

**When to use Redis**: Session storage, API caching, rate limiting, real-time leaderboards, pub/sub messaging.

### 4. Cassandra — Wide-Column Store

Cassandra is built for **massive write throughput** with geographic distribution. Used by Netflix, Twitter, Apple:

**What/why**: the block below shows the single most important Cassandra design skill — modeling a table around the query you will run, not around normalized entities. Read the `PRIMARY KEY` clause carefully; it is the part that determines both correctness and performance.

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

**Line-by-line — the `PRIMARY KEY` clause (the part that decides everything):**

1. `WITH replication = {'class': 'NetworkTopologyStrategy', 'us-east': 3, 'eu-west': 3}` — tells Cassandra to keep 3 full copies of every row in the `us-east` datacenter and 3 in `eu-west`. This is how Cassandra achieves both geo-distribution and the "Available, Partition-tolerant" CAP leaning: a region can lose connectivity to the other and both sides keep serving from their local replicas.
2. `PRIMARY KEY ((customer_id), order_date, order_id)` — the **double parentheses around `customer_id`** are not decorative; they mark it as the **partition key**: Cassandra hashes this value to decide which physical node(s) own the row. Every row with the same `customer_id` lands on the same partition, physically co-located on disk.
3. `order_date, order_id` (no extra parens) are the **clustering keys** — they determine the **sort order of rows within a partition**, not which node owns them. Combined with `WITH CLUSTERING ORDER BY (order_date DESC)`, this means "within one customer's partition, store/return rows newest-first" — turning "get this customer's orders sorted by date" into a sequential disk read with zero sorting at query time.
4. Why this matters: a partition key chosen badly (e.g., a low-cardinality value like `status`) creates a **hot partition** — one node holding a disproportionate share of data/traffic while others sit idle (see Pitfalls below).
5. `INSERT ... VALUES (uuid(), toTimestamp(now()), uuid(), ...)` — Cassandra's storage engine is a Log-Structured Merge-tree (LSM-tree): writes are appended sequentially with no read-before-write check, which is why Cassandra write throughput is so high compared to a B-tree-indexed relational table that must locate the correct page to update.
6. `SELECT * FROM orders_by_customer WHERE customer_id = ...` — this query is efficient *only* because it filters on the partition key, letting Cassandra route the request directly to the 1-3 nodes that own that partition. Filtering on `order_date` or `order_id` alone (without `customer_id`) would require scanning every partition on every node — Cassandra disables this by default unless you add `ALLOW FILTERING` (and even then, it is usually a sign your data model doesn't match your query pattern).

**Consistency levels — the per-query AP↔CP dial.** Every CQL read/write can specify a consistency level that decides how many replicas must respond before Cassandra considers the operation successful:

| Level | Behavior | Tradeoff |
|---|---|---|
| `ONE` | Only 1 replica must respond | Fastest, most available; highest chance of reading stale data if that replica hasn't received the latest write yet |
| `QUORUM` | Majority of replicas (e.g., 2 of 3) must respond | Balances consistency and availability; the most common production default |
| `ALL` | Every replica must respond | Strongest consistency; fails entirely if even one replica is unreachable — behaves like CP |

Writing at `QUORUM` and reading at `QUORUM` guarantees **read-your-writes** consistency (a strong consistency guarantee) without needing `ALL`.

**Tombstones — deletes are writes, not removals.** `DELETE` in Cassandra does not erase data immediately; it writes a **tombstone** marker that suppresses the deleted value until compaction physically removes it (governed by `gc_grace_seconds`, default 10 days). Heavy delete-and-recreate patterns (e.g., using Cassandra as a queue, where you insert then delete constantly) accumulate tombstones that the read path must scan past, silently degrading read latency over time — a well-known anti-pattern.

**Secondary indexes are limited.** Cassandra supports `CREATE INDEX` on non-partition-key columns, but it works by querying every node and filtering locally — there is no efficient way to avoid a full cluster scan for a low-selectivity secondary index. In practice, teams avoid secondary indexes for anything beyond very low-cardinality filtering and instead build a **second denormalized table** keyed by the column they need to query (e.g., `orders_by_status` alongside `orders_by_customer`) — accepting the cost of keeping both in sync on every write.

**When to use Cassandra**: Time-series data (IoT, logs, metrics), event sourcing, geo-distributed apps requiring multi-region writes.

**Polyglot persistence — the synchronization problem nobody mentions.** Using MongoDB + Redis + Cassandra + Postgres together (common at scale) means the same logical entity (e.g., "this customer's current order total") can exist in 3-4 places. None of these systems have native cross-database transactions, so you inherit: (1) **eventual consistency windows** between stores — a cache, a search index, and a primary store can disagree for seconds to minutes after a write; (2) **dual-write risk** — if your application writes to Postgres then Cassandra and crashes between the two calls, the stores diverge permanently unless you use an outbox pattern or change-data-capture (CDC) pipeline to propagate changes asynchronously and idempotently; (3) **reconciliation cost** — someone has to build/monitor jobs that detect and repair drift between stores. Polyglot persistence is a deliberate architectural commitment to managing this complexity, not a free upgrade.

---

## Senior-Level Insights

### The Decision Table

The old decision tree ("flexible schema → MongoDB, fast reads → Redis...") collapses too many real constraints into one branch. Use this table instead — go row by row against your actual requirements, not just the dominant access pattern:

| Dimension | Document Store (MongoDB) | Key-Value (Redis) | Wide-Column (Cassandra) | Relational (PostgreSQL) |
|---|---|---|---|---|
| **Best access pattern** | Fetch/update one rich, nested entity by ID or moderate filter | Fetch one value by exact key, very high QPS | Fetch a range of rows for one partition key (e.g., "this customer's history") | Arbitrary ad-hoc queries, multi-entity joins |
| **Consistency model** | Tunable per-query (`writeConcern`/`readConcern`); strong by default for single-document ops | Single-node: strongly consistent; cluster/replicated: eventual, async | Tunable per-query consistency level (`ONE`→`ALL`); eventual by default | Strong (ACID) by default; tunable isolation levels |
| **Typical latency** | Low single-digit ms | Sub-millisecond to low single-digit ms (network-bound, not memory-bound) | Low single-digit ms for partition-key reads; scan queries much slower | Sub-ms to 10s of ms depending on index/plan |
| **Durability** | Durable to disk (journaling); replicated | Optional — RDB/AOF or none (pure cache) | Durable (commit log + SSTables); replicated across nodes/DCs | Durable (WAL); replicated via streaming/logical replication |
| **JOIN / multi-entity support** | None natively; `$lookup` exists but is not optimized for large-scale joins | None — pure key lookup | None by design; model one table per query, denormalize | Full JOIN support, the core strength |
| **Operational burden** | Moderate — index/shard management, schema validation upkeep | Low for simple cache; moderate for cluster mode/persistence tuning | High — partition key design mistakes are costly to fix later, multi-DC ops | Moderate — well-understood tooling, but vertical scaling has ceilings |
| **Cost profile** | Pay for storage + compute; scales horizontally | Pay for RAM (expensive per GB vs. disk) | Pay for storage + write-heavy compute; scales horizontally well | Pay for compute/storage; vertical scaling gets expensive at extremes |
| **Failure behavior** | Replica set failover; can lose unacknowledged writes on primary crash | Node loss = data loss unless persistence + replicas configured | Designed to tolerate node loss gracefully (that's its core value prop) | Failover requires replication setup; single-primary writes pause during failover |

### Don't Abandon SQL Prematurely

The #1 NoSQL mistake: choosing MongoDB because "it's more flexible", then spending months implementing relationships that SQL handles in 3 lines.

**Rule of thumb**:
1. **Start with PostgreSQL** — it can do JSON documents (`jsonb`), time-series (`TimescaleDB`), and more
2. **Add a specific NoSQL database** only when PostgreSQL genuinely can't meet the requirement
3. **Most startups never need NoSQL** until Series B+ scale

### Pitfalls

| Pitfall | What goes wrong | Mitigation |
|---|---|---|
| **Cache stampede** | A popular cache key expires; hundreds of concurrent requests all miss simultaneously and hammer the database at once, sometimes hard enough to take it down | Add **request coalescing** (a lock so only the first miss fetches from source while others wait) or **jitter** (randomize TTLs slightly so keys don't all expire at the same instant); some teams add a short "stale-while-revalidate" window that serves slightly-old data while one request refreshes |
| **Stale reads under eventual consistency** | A write to one Cassandra/MongoDB replica hasn't propagated yet; a read immediately after hits a different replica and returns the old value | Use `QUORUM`/`majority` consistency for read-after-write-critical paths; for less critical reads, document the staleness window explicitly so product/business teams aren't surprised |
| **Split-brain / misconfiguration risk** | A network partition isolates a subset of nodes that each believe they are authoritative (especially dangerous in self-managed clusters without a proper quorum/fencing mechanism) | Always run replica counts that support quorum (odd numbers, e.g., 3 or 5), use managed services or battle-tested orchestration (not hand-rolled failover scripts), and test partition scenarios deliberately ("chaos" testing) before relying on them in production |
| **Unbounded document growth (MongoDB)** | A pattern like "push every event onto this user's document forever" eventually hits the 16MB BSON document size limit, or makes every read/write of that document slower as it grows | Cap array sizes with `$slice` on push, or move high-growth child data (e.g., events, logs) into its own collection referencing the parent by ID instead of embedding indefinitely |
| **Secondary-index limitations in wide-column stores** | A Cassandra secondary index looks like a normal index but silently requires a full cluster scan under the hood, causing a query that "worked fine in dev" to time out in production at scale | Avoid secondary indexes for high-cardinality or frequently-filtered columns; build a denormalized lookup table keyed by the column you need instead |
| **Denormalized-write consistency challenges** | Cassandra/MongoDB patterns often write the same fact into multiple tables/documents (e.g., `orders_by_customer` and `orders_by_status`); if one write succeeds and the other fails, the copies disagree | Use batched writes where the engine supports atomicity within a partition (Cassandra batches are atomic per-partition, not across partitions), add reconciliation jobs, and design for "eventually correct" rather than assuming every denormalized write lands |

---

## Glossary

| Term | Definition |
|---|---|
| **Document store** | A NoSQL database (e.g., MongoDB) that stores data as self-contained, nested documents (JSON/BSON-like) rather than fixed-column rows |
| **BSON** | "Binary JSON" — MongoDB's on-disk binary serialization format; adds types (dates, binary, int64) that plain JSON lacks and supports faster traversal than parsing text |
| **Key-value store** | A database (e.g., Redis) that maps opaque keys directly to values with no query language beyond exact-key lookup and a handful of structure-specific operations |
| **Wide-column store** | A NoSQL database (e.g., Cassandra) that organizes data into partitions of rows with flexible columns, optimized for high-throughput writes and partition-key reads |
| **CAP (theorem)** | States that during an actual network partition, a distributed system must choose between Consistency (all nodes agree) and Availability (every reachable node keeps responding) |
| **Eventual consistency** | A consistency model where, absent new writes, all replicas will *eventually* converge to the same value — but may disagree for some window of time after a write |
| **Partition key** | The field(s) a wide-column/distributed store hashes to decide which physical node(s) store a row; determines data locality and scalability |
| **Clustering key** | The field(s) that determine sort order of rows *within* a partition, evaluated after the partition key has routed the query to the right node(s) |
| **TTL (time-to-live)** | A duration after which a key/document automatically expires and is removed, commonly used for caches and session data |
| **Cache-aside** | A caching pattern where the application checks the cache first, falls back to the source of truth on a miss, then populates the cache before returning — the cache never proactively loads data on its own |

---

## Hands-on Lab

### Lab Setup: Docker Environment

Both exercises below run against real MongoDB and Redis instances. Use this `docker-compose.yml` (save it in a new `nosql-lab/` directory):

```yaml
# nosql-lab/docker-compose.yml
version: "3.8"
services:
  mongo:
    image: mongo:7.0          # MongoDB 7.0 (released 2023, stable LTS-style line)
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

  redis:
    image: redis:7.2-alpine   # Redis 7.2
    ports:
      - "6379:6379"

volumes:
  mongo_data:
```

```bash
cd nosql-lab
docker compose up -d              # starts both containers in the background
docker compose ps                 # confirm both show "running"/"healthy"
pip install "pymongo==4.7.2" "redis==5.0.4"   # exact versions used/tested for this lab
```

**Cleanup (run after both exercises are complete):**
```bash
docker compose down -v   # stops containers AND deletes the mongo_data volume
```

---

### Exercise 1: MongoDB Aggregation Pipeline

**Seed step** — run this once to load the reviews collection:

```python
# seed_reviews.py
from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017")
db = client["lab"]
reviews = db["reviews"]

reviews.delete_many({})  # idempotent: clear any previous run before seeding
reviews.insert_many([
    {"product": "Laptop Pro", "rating": 5, "verified": True},
    {"product": "Laptop Pro", "rating": 3, "verified": False},
    {"product": "Laptop Pro", "rating": 4, "verified": True},
    {"product": "Mouse WL",   "rating": 4, "verified": True},
    {"product": "Mouse WL",   "rating": 5, "verified": True},
])
print(f"Seeded {reviews.count_documents({})} reviews")
```

```bash
python seed_reviews.py
# Expected: Seeded 5 reviews
```

**Task** — write an aggregation pipeline that:
1. Filters to only verified reviews
2. Groups by product
3. Returns: `product`, `avg_rating` (2 decimal places), `review_count`
4. Sorts by `avg_rating` descending

```python
# solve_reviews.py
from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017")
reviews = client["lab"]["reviews"]

pipeline = [
    {"$match": {"verified": True}},
    {"$group": {
        "_id": "$product",
        "avg_rating": {"$avg": "$rating"},
        "review_count": {"$sum": 1},
    }},
    {"$project": {
        "product": "$_id",
        "_id": 0,
        "avg_rating": {"$round": ["$avg_rating", 2]},
        "review_count": 1,
    }},
    {"$sort": {"avg_rating": -1}},
]

results = list(reviews.aggregate(pipeline))
for r in results:
    print(r)

# --- Automated check ---
assert len(results) == 2, f"Expected 2 products, got {len(results)}"
assert results[0]["product"] == "Laptop Pro", "Laptop Pro (avg 4.5) should rank first"
assert results[0]["avg_rating"] == 4.5, f"Expected 4.5, got {results[0]['avg_rating']}"
assert results[1]["product"] == "Mouse WL"
assert results[1]["avg_rating"] == 4.5
assert results[1]["review_count"] == 2
print("All checks passed.")
```

**Expected output:**
```
{'product': 'Laptop Pro', 'avg_rating': 4.5, 'review_count': 2}
{'product': 'Mouse WL', 'avg_rating': 4.5, 'review_count': 2}
All checks passed.
```
(Note: Laptop Pro's unverified rating=3 review is correctly excluded by `$match`, leaving only the two verified reviews rating 5 and 4 → average 4.5.)

---

### Exercise 2: Redis Cache Decorator

**Task** — complete the decorator so it caches function results in Redis, keyed by function name + arguments, with a configurable TTL:

```python
# cache_decorator.py
import functools
import json
import time
import redis

r = redis.Redis(host="localhost", port=6379, decode_responses=True)
r.flushdb()  # start from a clean cache for this lab run


def cached(ttl_seconds: int = 300):
    """Decorator that caches function results in Redis."""

    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            cache_key = f"{func.__name__}:{args}:{kwargs}"
            cached_value = r.get(cache_key)
            if cached_value is not None:
                return json.loads(cached_value)

            result = func(*args, **kwargs)
            r.setex(cache_key, ttl_seconds, json.dumps(result))
            return result

        return wrapper

    return decorator


@cached(ttl_seconds=60)
def get_top_products(category: str, limit: int = 3) -> list:
    """Simulates an expensive DB query (1-second delay)."""
    time.sleep(1)
    return [{"name": f"Product {i}", "sales": 1000 - i * 10} for i in range(limit)]


# --- Automated check ---
start = time.perf_counter()
first = get_top_products("electronics", limit=3)
first_duration = time.perf_counter() - start

start = time.perf_counter()
second = get_top_products("electronics", limit=3)
second_duration = time.perf_counter() - start

assert first == second, "Cached result must match original result"
assert first_duration > 0.9, f"First call should take ~1s (cache miss), took {first_duration:.3f}s"
assert second_duration < 0.05, f"Second call should be a fast cache hit, took {second_duration:.3f}s"
print(f"Cache miss: {first_duration:.3f}s | Cache hit: {second_duration:.3f}s")
print("All checks passed.")
```

**Expected output:**
```
Cache miss: 1.00Xs | Cache hit: 0.00Xs
All checks passed.
```

---

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

- ✅ **CAP Theorem**: Applies specifically during an actual network partition — the real choice is Consistency vs. Availability for affected nodes, not a static "pick two of three." Use **PACELC** to reason about the (more common) no-partition case: Latency vs. Consistency.
- ✅ **MongoDB**: Flexible schema documents with optional validation, indexing, and multi-document transactions; great for catalogs and profiles
- ✅ **Redis**: In-memory engine access is nanosecond-scale; application-observed latency is sub-millisecond, dominated by the network — still dramatically faster than disk-backed lookups
- ✅ **Cassandra**: Massive write throughput, time-series, multi-region, with tunable consistency levels per query
- ✅ **Default to PostgreSQL**: Add NoSQL only when you have a specific, justified need

**Tomorrow → [Day 101C: Streaming SQL Fundamentals](../Day_101C_Streaming_SQL_Fundamentals/README.md)** — real-time analytics with Kafka and ksqlDB.
