---
day: 8
title: "Dictionaries"
phase: 1
phaseTitle: "Algorithmic Thinking & Python Foundations"
slug: "dictionaries"
duration: 55
difficulty: "beginner"
tags:
  - python
  - dictionaries
  - key-value
  - data-structures
concepts:
  - "dictionary creation"
  - "key-value pairs"
  - "dictionary methods"
  - "nested dictionaries"
prerequisites: [1, 2, 3, 4, 5, 6, 7]
outcomes:
  - "Store and retrieve data using key-value pairs"
  - "Use dictionary methods for data manipulation"
  - "Work with nested data structures"
---

# 🎯 Day 8: Dictionaries

> *"Dictionaries are how computers organize knowledge—the same way you organize contacts in your phone."*

---

## The "Never-Coded" Bridge

**Open the Contacts app on your phone. How do you find someone?**

You don't start at "Aaron" and scroll through thousands of entries. You search by **name** (the key) and instantly get their **phone number** (the value).

That's a dictionary: a collection where you look things up by name, not by position.

```python
# List approach (search by position - slow)
contacts = [["Alice", "555-0101"], ["Bob", "555-0102"], ["Charlie", "555-0103"]]
# To find Bob, I need to check each entry...

# Dictionary approach (search by name - instant)
contacts = {"Alice": "555-0101", "Bob": "555-0102", "Charlie": "555-0103"}
print(contacts["Bob"])  # 555-0102 (instant lookup!)
```

**Business applications:**

- Product catalog: `{"SKU001": {"name": "Widget", "price": 29.99}}`
- Configuration: `{"api_key": "abc123", "timeout": 30}`
- JSON data from APIs: Already in dictionary format!

---

## The Technical Deep Dive

### Creating Dictionaries

```python
# Empty dictionary
empty = {}
also_empty = dict()

# With initial values
person = {"name": "Alice", "age": 30, "city": "NYC"}

# Using dict() constructor
product = dict(sku="PRD001", price=29.99, stock=100)

# From pairs
pairs = [("a", 1), ("b", 2), ("c", 3)]
from_pairs = dict(pairs)  # {"a": 1, "b": 2, "c": 3}
```

### Accessing Values

```python
user = {"name": "Bob", "email": "bob@email.com", "age": 25}

# Direct access (KeyError if missing)
print(user["name"])  # "Bob"
# print(user["phone"])   # KeyError!

# Safe access with .get()
print(user.get("phone"))  # None
print(user.get("phone", "N/A"))  # "N/A" (default)

# Check existence first
if "phone" in user:
    print(user["phone"])
```

**Production Insight: Defensive Dictionary Access**

In production, APIs return JSON that may have missing or null keys depending on the data source, the API version, or the user's account tier. Accessing nested keys with bracket notation (`d["key"]`) crashes the moment any level is absent.

Use chained `.get()` calls with sensible domain defaults instead:

```python
# Dangerous (crashes if any key is missing)
user_tier = api_response["user"]["subscription_tier"]

# Safe (returns "free" as fallback if either key is absent)
user_tier = api_response.get("user", {}).get("subscription_tier", "free")
```

The default value in `.get(key, default)` is critical — choose defaults that make sense for your domain:

- `0` for counts or numeric totals (e.g., `response.get("order_count", 0)`)
- `"N/A"` for display labels that must always render as a string
- `[]` for lists you will iterate over (avoids a separate `None` check)
- `{}` for nested dicts you will call `.get()` on again (as shown above)

This pattern is especially common when consuming REST APIs, parsing webhook payloads, or reading records from BigQuery or Snowflake that may have nullable columns.

### Modifying Dictionaries

```python
inventory = {"apples": 50, "bananas": 30}

# Add/Update single item
inventory["oranges"] = 25  # Add new
inventory["apples"] = 45  # Update existing

# Update multiple items
inventory.update({"grapes": 60, "apples": 40})

# Remove items
del inventory["bananas"]  # Delete by key
removed = inventory.pop("oranges")  # Remove and return value
inventory.popitem()  # Remove last inserted pair

# Clear all
# inventory.clear()
```

### Dictionary Methods

```python
product = {"name": "Laptop", "price": 999.99, "category": "Electronics"}

product.keys()  # dict_keys(['name', 'price', 'category'])
product.values()  # dict_values(['Laptop', 999.99, 'Electronics'])
product.items()  # dict_items([('name', 'Laptop'), ...])

len(product)  # 3
"price" in product  # True (checks keys)
```

### Iterating Over Dictionaries

```python
prices = {"apple": 1.50, "banana": 0.75, "orange": 2.00}

# Keys only (default)
for fruit in prices:
    print(fruit)

# Keys explicitly
for key in prices.keys():
    print(key)

# Values only
for price in prices.values():
    print(price)

# Both key and value (most common)
for fruit, price in prices.items():
    print(f"{fruit}: ${price:.2f}")
```

### Nested Dictionaries

```python
company = {
    "name": "TechCorp",
    "employees": {
        "E001": {"name": "Alice", "dept": "Engineering"},
        "E002": {"name": "Bob", "dept": "Sales"},
    },
    "locations": ["NYC", "SF", "London"],
}

# Access nested data
ceo_name = company["employees"]["E001"]["name"]  # "Alice"


# Safely handle missing nested keys
def safe_get(d, *keys, default=None):
    for key in keys:
        if isinstance(d, dict):
            d = d.get(key)
        else:
            return default
    return d if d is not None else default


phone = safe_get(company, "employees", "E001", "phone", default="N/A")
```

---

## Senior-Level Insights

### Dictionary Comprehensions

```python
# Square of numbers
squares = {x: x**2 for x in range(6)}
# {0: 0, 1: 1, 2: 4, 3: 9, 4: 16, 5: 25}

# Filter and transform
prices = {"apple": 1.5, "banana": 0.75, "kiwi": 2.0, "mango": 3.0}
expensive = {k: v for k, v in prices.items() if v > 1.0}
# {"apple": 1.5, "kiwi": 2.0, "mango": 3.0}

# Swap keys and values
inverted = {v: k for k, v in prices.items()}
```

### Default Dictionaries (Avoid KeyError)

```python
from collections import defaultdict

# Regular dict fails
# counts["apples"] += 1  # KeyError!

# defaultdict provides default values
counts = defaultdict(int)  # Default is 0
counts["apples"] += 1
counts["oranges"] += 5
print(counts)  # defaultdict(<class 'int'>, {'apples': 1, 'oranges': 5})

# Default list
grouped = defaultdict(list)
grouped["fruits"].append("apple")
grouped["fruits"].append("banana")
```

### Merge Dictionaries (Python 3.9+)

```python
defaults = {"theme": "light", "lang": "en", "notifications": True}
user_prefs = {"theme": "dark", "lang": "es"}

# Old way
merged = {**defaults, **user_prefs}

# Python 3.9+ way
merged = defaults | user_prefs
# {"theme": "dark", "lang": "es", "notifications": True}
```

### Performance: Dict vs. List Lookup

```python
# Lookups are O(1) regardless of size
large_dict = {f"key_{i}": i for i in range(1_000_000)}
value = large_dict["key_999999"]  # Instant!

# vs. List which is O(n)
# large_list = [[f"key_{i}", i] for i in range(1_000_000)]
# Finding "key_999999" requires checking ~1 million items
```

---

## Hands-on Lab

### Exercise 1: Product Catalog

**Goal**: Build a product lookup system.

```python
# Product catalog
catalog = {
    "SKU001": {"name": "Wireless Mouse", "price": 29.99, "stock": 150},
    "SKU002": {"name": "Mechanical Keyboard", "price": 89.99, "stock": 75},
    "SKU003": {"name": "USB-C Hub", "price": 49.99, "stock": 200},
}


# Lookup function
def lookup_product(sku):
    product = catalog.get(sku)
    if product:
        print(f"Product: {product['name']}")
        print(f"Price: ${product['price']:.2f}")
        print(f"In Stock: {product['stock']} units")
    else:
        print(f"SKU {sku} not found")


# Test
lookup_product("SKU002")
print()
lookup_product("SKU999")
```

**Expected Output:**
```text
Product: Mechanical Keyboard
Price: $89.99
In Stock: 75 units

SKU SKU999 not found
```

---

### Exercise 2: Word Frequency Counter

**Goal**: Count occurrences of each word in text.

```python
text = """
Python is a powerful language. Python is also beginner-friendly.
Many developers love Python for data science and web development.
"""

# Clean and split
words = text.lower().replace(".", "").replace(",", "").split()

# Count frequencies
from collections import defaultdict

frequency = defaultdict(int)
for word in words:
    frequency[word] += 1

# Sort by count
sorted_words = sorted(frequency.items(), key=lambda x: x[1], reverse=True)

print("=== WORD FREQUENCY ===")
for word, count in sorted_words[:5]:
    print(f"{word}: {count}")
```

**Expected Output:**
```text
=== WORD FREQUENCY ===
python: 3
is: 2
a: 2
also: 1
beginner-friendly: 1
```

> Note: Words with the same count (like `"a"` and `"is"`) may appear in a different order depending on Python version, since the sort is stable but ties among equal-count words preserve insertion order from the `defaultdict`.

---

### Exercise 3: Sales Dashboard Aggregation

**Goal**: Aggregate sales by region and category.

```python
transactions = [
    {"region": "North", "category": "Electronics", "amount": 1200},
    {"region": "South", "category": "Clothing", "amount": 450},
    {"region": "North", "category": "Electronics", "amount": 800},
    {"region": "North", "category": "Clothing", "amount": 350},
    {"region": "South", "category": "Electronics", "amount": 950},
]

# Aggregate by region
from collections import defaultdict

by_region = defaultdict(float)
for t in transactions:
    by_region[t["region"]] += t["amount"]

# Aggregate by category
by_category = defaultdict(float)
for t in transactions:
    by_category[t["category"]] += t["amount"]

print("=== SALES BY REGION ===")
for region, total in by_region.items():
    print(f"{region}: ${total:,.2f}")

print("\n=== SALES BY CATEGORY ===")
for category, total in by_category.items():
    print(f"{category}: ${total:,.2f}")
```

**Expected Output:**
```text
=== SALES BY REGION ===
North: $2,350.00
South: $1,400.00

=== SALES BY CATEGORY ===
Electronics: $2,950.00
Clothing: $800.00
```

---

## Mastery Check

### Question 1: Accessing Values

What's the safest way to get a value that might not exist?

<details>
<summary>Click for Answer</summary>

```python
# Use .get() with a default
value = my_dict.get("missing_key", "default_value")
```

This returns the default instead of raising KeyError.

</details>

---

### Question 2: Dictionary Comprehension

Convert this loop to a comprehension:

```python
result = {}
for x in range(5):
    result[x] = x * 10
```

<details>
<summary>Click for Answer</summary>

```python
result = {x: x * 10 for x in range(5)}
# {0: 0, 1: 10, 2: 20, 3: 30, 4: 40}
```

</details>

---

### Question 3: Iteration

What does this print?

```python
d = {"a": 1, "b": 2, "c": 3}
for item in d:
    print(item)
```

<details>
<summary>Click for Answer</summary>

```text
a
b
c
```

Iterating over a dict directly gives you the **keys**, not the values or key-value pairs.

</details>

---

### Question 4: Nested Access

Given:

```python
data = {"users": {"admin": {"permissions": ["read", "write"]}}}
```

How do you safely check if the admin has "delete" permission?

<details>
<summary>Click for Answer</summary>

```python
# Safe chained access
permissions = data.get("users", {}).get("admin", {}).get("permissions", [])
has_delete = "delete" in permissions
print(has_delete)  # False
```

Or use a try/except:

```python
try:
    has_delete = "delete" in data["users"]["admin"]["permissions"]
except KeyError:
    has_delete = False
```

</details>

---

### Question 5: Design Scenario

**Scenario**: Build a caching system for expensive API calls. If data was fetched in the last 5 minutes, return cached result. Otherwise, fetch fresh data.

<details>
<summary>Click for Answer</summary>

```python
import time

cache = {}
CACHE_DURATION = 300  # 5 minutes


def cached_api_call(key):
    now = time.time()

    # Check if cached and not expired
    if key in cache:
        data, timestamp = cache[key]
        if now - timestamp < CACHE_DURATION:
            print(f"Cache hit for {key}")
            return data

    # Simulate API call
    print(f"Fetching {key} from API...")
    result = {"data": f"Fresh data for {key}", "fetched_at": now}

    # Store in cache
    cache[key] = (result, now)
    return result


# Usage
data1 = cached_api_call("user_123")  # "Fetching from API..."
data2 = cached_api_call("user_123")  # "Cache hit"
```

**Production Enhancement**: Use `functools.lru_cache` for simpler memoization or Redis for distributed caching.

</details>

---

## Summary

Today you learned:

- ✅ Dictionaries map keys to values (`{key: value}`)
- ✅ Access values with `d[key]` or safely with `d.get(key)`
- ✅ Iterate with `.keys()`, `.values()`, or `.items()`
- ✅ Nested dictionaries represent complex data structures
- ✅ Dictionary lookups are O(1)—instant regardless of size

**Tomorrow**: We'll explore **conditionals**—teaching your programs to make decisions.

---

## Recurring Mini-Scenario Challenge: Retail Pulse Sales Tracker (Day 8)

Extend `sales_tracker_phase1.py` into a richer business model.

**Challenge**

- Create a dictionary per day with keys like `store_code`, `orders_count`, `daily_revenue`, `unique_customers`, `is_anomaly`.
- Store all day dictionaries in a list called `weekly_snapshots`.
- Reuse Day 7 duplicate logic to populate dictionary fields.

**Measurable output**

- Print one dictionary-driven summary line for the latest day: `"SNAPSHOT <date> | revenue=... | unique_customers=..."`.

---

## Glossary

- **Dictionary**: An unordered collection of key-value pairs enclosed in curly braces `{}`
- **Key**: The unique identifier used to look up a value in a dictionary
- **Value**: The data associated with a key in a dictionary
- **Key-value pair**: A single entry in a dictionary (`"name": "Alice"`)
- **`.get(key, default)`**: Safely retrieves a value, returning a default if the key doesn't exist
- **`.keys()`**: Returns a view of all keys in a dictionary
- **`.values()`**: Returns a view of all values in a dictionary
- **`.items()`**: Returns a view of all key-value tuples in a dictionary
- **`.update()`**: Merges another dictionary into the current one
- **Nested dictionary**: A dictionary where values are themselves dictionaries
- **JSON (JavaScript Object Notation)**: A data format that maps directly to Python dictionaries; ubiquitous in APIs
- **Hash map**: The underlying data structure of a dictionary, enabling O(1) average-time lookups
