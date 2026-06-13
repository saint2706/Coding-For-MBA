---
day: "11B"
title: "Generators & Iterators"
phase: 1
phaseTitle: "Algorithmic Thinking & Python Foundations"
slug: "generators-iterators"
duration: 60
difficulty: "intermediate"
tags:
  - python
  - iterators
  - generators
  - itertools
  - performance
concepts:
  - "iterator protocol"
  - "generator functions and yield"
  - "yield from composition"
  - "itertools workflows"
prerequisites: [10, 11]
outcomes:
  - "Use iter() and next() with confidence"
  - "Build custom iterators and generator pipelines"
  - "Apply itertools to business-style streaming data"
  - "Choose generators for memory-efficient data processing"
---

# 🎯 Day 11B: Generators & Iterators

> *"When datasets get big, smart iteration beats brute-force storage."*

---

## Business Impact: Why MBA Students Need This

> **Scenario**: Your data pipeline needs to process 50 million customer transactions. Loading all 50M rows into a list would crash your 16GB RAM server. Generators solve this by processing one row at a time — your server stays alive, your pipeline stays cheap.

The financial reality:
- A list of 50M transaction records might consume 8–12 GB of RAM.
- With generators, that same pipeline uses under 1 MB — regardless of dataset size.
- Less RAM means smaller (cheaper) cloud instances. On AWS, that difference can be $500–$2,000/month for always-on analytics workloads.

**Tools you already know that use generators internally:**
- **Pandas `read_csv(chunksize=...)`** — reads CSV files one chunk at a time instead of all at once
- **Python's `csv.reader`** — yields one row at a time from a file, never loads the whole file
- **Database cursors** (`psycopg2`, `sqlite3`) — stream query results row by row from the database

When you understand generators, you understand *why* these tools work the way they do — and when to use them.

---

## The "Never-Coded" Bridge

Imagine three MBA situations:

- **Log processing**: millions of app events arrive line by line.
- **Transaction streams**: payments keep coming all day.
- **Inventory feeds**: supplier CSV exports are too large to load at once.

If you load everything into one giant list, memory climbs fast.

Iterators and generators let you process records **one item at a time**:

1. Pull one record
2. Transform/filter it
3. Move on immediately

That streaming mindset is exactly how robust analytics systems scale.

---

## The Technical Deep Dive

### Iterator Protocol Fundamentals

Python's iterator protocol has three core ideas:

- `iter(obj)` asks for an iterator.
- `next(iterator)` asks for the next item.
- `StopIteration` signals there are no more items.

```python
numbers = [10, 20, 30]
it = iter(numbers)

print(next(it))  # 10
print(next(it))  # 20
print(next(it))  # 30
# next(it) would now raise StopIteration
```

A custom iterator class implements both `__iter__` and `__next__`.

```python
class QuarterIterator:
    def __init__(self, quarterly_revenue):
        self.quarterly_revenue = quarterly_revenue
        self.index = 0

    def __iter__(self):
        return self

    def __next__(self):
        if self.index >= len(self.quarterly_revenue):
            raise StopIteration

        value = self.quarterly_revenue[self.index]
        self.index += 1
        return value


revenues = [125000, 148000, 132000, 175000]
for amount in QuarterIterator(revenues):
    print(amount)
```

### Generator Functions (`yield`)

A generator function uses `yield` to produce values lazily.

```python
def payment_stream(payments):
    for amount in payments:
        fee = round(amount * 0.029, 2)
        yield {
            "amount": amount,
            "fee": fee,
            "net": round(amount - fee, 2),
        }


for row in payment_stream([120, 450, 80]):
    print(row)
```

### Composition with `yield from`

Use `yield from` to delegate iteration cleanly.

```python
def online_orders():
    yield from [
        {"channel": "web", "order_id": "W-1001"},
        {"channel": "web", "order_id": "W-1002"},
    ]


def retail_orders():
    yield from [
        {"channel": "store", "order_id": "S-9001"},
        {"channel": "store", "order_id": "S-9002"},
    ]


def unified_orders():
    yield from online_orders()
    yield from retail_orders()


for order in unified_orders():
    print(order)
```

### Generator Expressions

Generator expressions behave like list comprehensions but do not store all values.

```python
# List comprehension (eager)
large_list = [x * x for x in range(1_000_000)]

# Generator expression (lazy)
large_gen = (x * x for x in range(1_000_000))

# Typical pattern: stream directly into aggregations
total = sum(x * x for x in range(1_000_000))
```

### Practical `itertools` Patterns for MBA Workflows

```python
from itertools import islice, chain, groupby

# 1) islice: preview only first N log lines
logs = (f"event_{i}" for i in range(1_000_000))
first_five = list(islice(logs, 5))
print(first_five)

# 2) chain: combine transaction streams from multiple channels
pos_txns = ["POS-001", "POS-002"]
ecom_txns = ["ECOM-501", "ECOM-502"]
all_txns = list(chain(pos_txns, ecom_txns))
print(all_txns)

# 3) groupby: summarize sorted inventory feed by SKU category
inventory_rows = [
    ("Accessories", "Mouse", 120),
    ("Accessories", "Keyboard", 80),
    ("Computers", "Laptop", 35),
    ("Computers", "Desktop", 12),
]

for category, rows in groupby(inventory_rows, key=lambda r: r[0]):
    total_units = sum(r[2] for r in rows)
    print(category, total_units)
```

> `groupby` groups consecutive keys, so sort by the grouping key first when needed.

---

## Senior-Level Insights

### Memory + Performance: Lists vs Generators

```python
import sys
import time

N = 2_000_000

# Eager list build
start = time.perf_counter()
list_data = [x * 2 for x in range(N)]
list_total = sum(list_data)
list_time = time.perf_counter() - start
list_size = sys.getsizeof(list_data)

# Lazy generator flow
start = time.perf_counter()
gen_data = (x * 2 for x in range(N))
gen_total = sum(gen_data)
gen_time = time.perf_counter() - start
gen_size = sys.getsizeof(gen_data)

print(f"List total: {list_total}, time: {list_time:.3f}s, size: {list_size:,} bytes")
print(f"Gen total:  {gen_total}, time: {gen_time:.3f}s, size: {gen_size:,} bytes")
```

**Typical outcome**:

- List version can be fast for repeated random access, but uses much more memory.
- Generator version is usually dramatically smaller in memory and ideal for one-pass analytics pipelines.

### Practical Rule of Thumb

- Use **list** when you need reuse/indexing/slicing multiple times.
- Use **generator** when data is large, streaming, or consumed once.

---

## Hands-on Lab

### Exercise 1: Build a Custom Iterator (Quarterly KPI Reader)

**Goal**: Implement `__iter__` and `__next__` for KPI windows.

```python
class KPIWindow:
    def __init__(self, kpis):
        self.kpis = kpis
        self.pos = 0

    def __iter__(self):
        return self

    def __next__(self):
        if self.pos >= len(self.kpis):
            raise StopIteration
        item = self.kpis[self.pos]
        self.pos += 1
        return item


for metric in KPIWindow(["Revenue", "Gross Margin", "CAC", "LTV"]):
    print(metric)
```

**Expected Output:**
```
Revenue
Gross Margin
CAC
LTV
```

---

### Exercise 2: Generator Pipeline over a Large Simulated Dataset

**Goal**: Process a large transaction stream without loading all rows into memory.

```python
from itertools import islice


def generate_transactions(n=1_000_000):
    for i in range(n):
        amount = (i % 700) + 20
        channel = "online" if i % 3 else "store"
        yield {"id": i, "amount": amount, "channel": channel}


def high_value_only(rows, threshold=500):
    for row in rows:
        if row["amount"] >= threshold:
            yield row


def with_fee(rows, fee_rate=0.015):
    for row in rows:
        fee = round(row["amount"] * fee_rate, 2)
        yield {**row, "fee": fee, "net": round(row["amount"] - fee, 2)}


pipeline = with_fee(high_value_only(generate_transactions()))
preview = list(islice(pipeline, 5))
print("Preview:", preview)

# Recreate stream for full aggregate pass
pipeline = with_fee(high_value_only(generate_transactions()))
count = 0
net_total = 0
for txn in pipeline:
    count += 1
    net_total += txn["net"]

print("High-value count:", count)
print("Net total:", round(net_total, 2))
```

**Expected Output:**
```
Preview: [{'id': 480, 'amount': 500, 'channel': 'store', 'fee': 7.5, 'net': 492.5}, {'id': 481, 'amount': 501, 'channel': 'online', 'fee': 7.51, 'net': 493.49}, {'id': 482, 'amount': 502, 'channel': 'online', 'fee': 7.53, 'net': 494.47}, {'id': 483, 'amount': 503, 'channel': 'store', 'fee': 7.54, 'net': 495.46}, {'id': 484, 'amount': 504, 'channel': 'online', 'fee': 7.56, 'net': 496.44}]
High-value count: 314160
Net total: 188608626.36
```

---

### Exercise 3: `itertools` in Operations Reporting

**Goal**: Use `chain`, `islice`, and `groupby` in one workflow.

```python
from itertools import chain, islice, groupby

feed_a = [
    ("Accessories", "Mouse", 40),
    ("Accessories", "Keyboard", 20),
]
feed_b = [
    ("Computers", "Laptop", 10),
    ("Computers", "Desktop", 6),
]

combined = sorted(chain(feed_a, feed_b), key=lambda x: x[0])
preview = list(islice(combined, 3))
print("Preview rows:", preview)

for category, rows in groupby(combined, key=lambda r: r[0]):
    units = sum(r[2] for r in rows)
    print(f"{category}: {units} units")
```

**Expected Output:**
```
Preview rows: [('Accessories', 'Mouse', 40), ('Accessories', 'Keyboard', 20), ('Computers', 'Laptop', 10)]
Accessories: 60 units
Computers: 16 units
```

---

## Mastery Check

### Question 1: Iterator Protocol Core

What are the roles of `iter()`, `next()`, and `StopIteration`?

<details>
<summary>Click for Answer</summary>

- `iter(obj)` returns an iterator object.
- `next(it)` pulls one item at a time.
- `StopIteration` tells Python iteration is complete.

</details>

---

### Question 2: Custom Iterator Design

Why must a custom iterator class define both `__iter__` and `__next__`?

<details>
<summary>Click for Answer</summary>

`__iter__` returns an iterator-compatible object (often `self`), and `__next__` defines how the next value is produced or when to stop by raising `StopIteration`.

</details>

---

### Question 3: `yield from`

When should you prefer `yield from` over a manual `for item in ...: yield item` loop?

<details>
<summary>Click for Answer</summary>

Use `yield from` when delegating to another iterable/generator directly. It is shorter, clearer, and correctly forwards iteration behavior.

</details>

---

### Question 4: `groupby` Pitfall

Why can `groupby` produce surprising results on unsorted data?

<details>
<summary>Click for Answer</summary>

`groupby` only groups **consecutive** equal keys. If same keys appear in separate blocks, you'll get multiple groups unless you sort first by the key.

</details>

---

### Question 5: Architecture Choice

You must process a 15GB transaction export once to compute totals by channel. Choose list or generator, and why?

<details>
<summary>Click for Answer</summary>

Choose a generator pipeline. It's one-pass work, and generators avoid loading the entire file into RAM, reducing memory pressure and failure risk.

</details>

---

## Summary

Today you learned:

- ✅ How the iterator protocol works (`iter`, `next`, `StopIteration`)
- ✅ How to build custom iterator classes with `__iter__` and `__next__`
- ✅ How generator functions and `yield from` compose streaming workflows
- ✅ How `itertools` tools (`islice`, `chain`, `groupby`) solve practical business data tasks
- ✅ Why generator pipelines are often better for large, one-pass datasets

**Next step depth**: Revisit this lesson while scaling your Phase 1 mini-scenarios into larger pipelines and operational reporting scripts.

### What's Coming Next

**Day 11C: Debugging Workflows** — After building streaming data pipelines, you'll inevitably encounter bugs in them. Day 11C gives you a repeatable five-step system for diagnosing and fixing broken scripts under pressure: reading Python tracebacks, using `breakpoint()` and `pdb` to inspect state mid-execution, and switching from ad-hoc `print()` calls to structured `logging`. These skills directly apply to generators: when a pipeline produces wrong results, you need to know how to step through it and inspect state at each `yield`.

---

## Glossary

- **Iterator**: An object that produces values one at a time when `next()` is called on it
- **Iterable**: Any object that can be looped over (list, tuple, string, generator, etc.)
- **Generator**: A special function using `yield` that produces values lazily, one at a time
- **`yield`**: Pauses a generator function and returns a value to the caller; resumes on the next call
- **`next()`**: Retrieves the next value from an iterator or generator
- **Lazy evaluation**: Values are computed only when requested, not all at once
- **Memory efficiency**: Generators use O(1) memory regardless of the total number of items
- **`__iter__()`**: Dunder method that makes an object iterable
- **`__next__()`**: Dunder method that returns the next value from an iterator
- **`StopIteration`**: Exception raised when an iterator has no more values to produce
- **`itertools`**: Python standard library module with advanced iterator tools (`chain`, `islice`, `groupby`, etc.)
- **Generator expression**: A one-line generator syntax: `(x*2 for x in range(10))`
