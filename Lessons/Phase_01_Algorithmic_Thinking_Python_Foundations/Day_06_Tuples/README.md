---
day: 6
title: "Tuples"
phase: 1
phaseTitle: "Algorithmic Thinking & Python Foundations"
slug: "tuples"
duration: 40
difficulty: "beginner"
tags:
  - python
  - tuples
  - immutable
  - data-structures
concepts:
  - "tuple creation"
  - "immutability"
  - "tuple unpacking"
  - "when to use tuples vs lists"
prerequisites: [1, 2, 3, 4, 5]
outcomes:
  - "Create and access tuple elements"
  - "Understand immutability and its benefits"
  - "Use tuple unpacking for clean code"
---

# 🎯 Day 6: Tuples

> *"Some things are meant to be permanent. Tuples ensure data stays exactly as intended."*

---

## The "Never-Coded" Bridge

**Think about your company's founding details:**

- Founded: 2015
- Location: San Francisco
- Founders: ("Alice Chen", "Bob Smith")

These facts don't change. The founding year won't suddenly become 2016. You want this data **locked down**.

A **tuple** is like a sealed envelope. Once you put data inside, you can look at it but never modify it. This intentional "read-only" nature is a feature, not a limitation.

**Real business uses:**
- Coordinates: (latitude, longitude)
- Database rows: (id, name, price)
- RGB colors: (255, 128, 0)
- Date stamps: (2024, 3, 15)

When data should NEVER change, use a tuple.

---

## The Technical Deep Dive

### Creating Tuples

```python
# Empty tuple
empty = ()

# Single element (note the comma!)
single = (42,)    # This is a tuple
not_tuple = (42)  # This is just 42 in parentheses

# Multiple elements
coordinates = (37.7749, -122.4194)
person = ("Alice", 28, "Engineer")

# Without parentheses (packing)
point = 10, 20, 30  # Also a tuple!

# From other iterables
from_list = tuple([1, 2, 3])
from_string = tuple("hello")  # ('h', 'e', 'l', 'l', 'o')
```

### Accessing Elements

```python
# Same indexing as lists
product = ("Laptop", 999.99, "Electronics", True)
#            0        1         2            3

name = product[0]      # "Laptop"
price = product[1]     # 999.99
last = product[-1]     # True

# Slicing works too
subset = product[1:3]  # (999.99, "Electronics")
```

### Immutability in Action

```python
point = (10, 20)

# This will ERROR:
# point[0] = 15  # TypeError: 'tuple' object does not support item assignment

# Create a new tuple instead
point = (15, 20)  # This is a new tuple
```

### Tuple Unpacking (The Real Power)

```python
# Basic unpacking
coordinates = (37.7749, -122.4194)
latitude, longitude = coordinates

# Function returns
def get_min_max(numbers):
    return min(numbers), max(numbers)

low, high = get_min_max([5, 2, 8, 1, 9])
print(f"Range: {low} to {high}")  # Range: 1 to 9

# Swapping variables
a, b = 10, 20
a, b = b, a  # Now a=20, b=10

# Ignore values with _
first, _, third = (1, 2, 3)  # We don't need the second value

# Extended unpacking
first, *middle, last = (1, 2, 3, 4, 5)
# first=1, middle=[2, 3, 4], last=5
```

### Tuple Methods

Tuples have only 2 methods (because they're immutable):

```python
data = (1, 2, 3, 2, 4, 2)

data.count(2)  # 3 (how many 2s)
data.index(3)  # 2 (position of first 3)
```

### Tuple Operations

```python
# Concatenation (creates new tuple)
a = (1, 2)
b = (3, 4)
combined = a + b  # (1, 2, 3, 4)

# Repetition
repeated = (1, 2) * 3  # (1, 2, 1, 2, 1, 2)

# Membership
5 in (1, 2, 3, 4, 5)  # True

# Length
len((1, 2, 3))  # 3
```

---

## Senior-Level Insights

### Why Immutability Matters

1. **Thread Safety**: In concurrent programs, immutable data can't cause race conditions
2. **Hashability**: Tuples can be dictionary keys or set members; lists cannot
3. **Intent Signaling**: Using a tuple tells other developers "this shouldn't change"
4. **Memory Efficiency**: Tuples use slightly less memory than lists

```python
# Tuples as dictionary keys (lists can't do this!)
locations = {
    (40.7128, -74.0060): "New York",
    (51.5074, -0.1278): "London",
    (35.6762, 139.6503): "Tokyo"
}

coords = (40.7128, -74.0060)
print(locations[coords])  # "New York"
```

### Named Tuples (Production Code)

For readable tuple access:

```python
from collections import namedtuple

# Define a "record" structure
Employee = namedtuple('Employee', ['name', 'age', 'department'])

# Create instances
alice = Employee('Alice', 28, 'Engineering')

# Access by name (much clearer!)
print(alice.name)        # "Alice"
print(alice.department)  # "Engineering"

# Still works like a tuple
print(alice[0])          # "Alice"
name, age, dept = alice  # Unpacking works too
```

### Tuples vs Lists: Decision Framework

| Use Tuple When...                       | Use List When...                 |
| --------------------------------------- | -------------------------------- |
| Data is fixed (coordinates, config)     | Data will change (shopping cart) |
| Returning multiple values from function | Collecting items over time       |
| Dictionary keys needed                  | Order might change               |
| Data integrity is critical              | Sorting/filtering needed         |

### Performance Comparison

```python
import sys

# Memory usage
list_size = sys.getsizeof([1, 2, 3, 4, 5])    # 104 bytes
tuple_size = sys.getsizeof((1, 2, 3, 4, 5))   #  80 bytes

# Creation speed (tuples are slightly faster)
# This matters at scale (millions of records)
```

---

## Hands-on Lab

### Exercise 1: Product Catalog Entry

**Goal**: Create an immutable product record.

```python
# Product: (SKU, Name, Price, Category, In_Stock)
product = ("SKU-001", "Wireless Mouse", 29.99, "Electronics", True)

# Unpack for display
sku, name, price, category, in_stock = product

print("=== PRODUCT DETAILS ===")
print(f"SKU: {sku}")
print(f"Name: {name}")
print(f"Price: ${price:.2f}")
print(f"Category: {category}")
print(f"In Stock: {'Yes' if in_stock else 'No'}")
```

---

### Exercise 2: GPS Distance Calculator

**Goal**: Work with coordinate tuples.

```python
import math

def calculate_distance(point1, point2):
    """Calculate distance between two (x, y) coordinates."""
    x1, y1 = point1
    x2, y2 = point2
    return math.sqrt((x2 - x1)**2 + (y2 - y1)**2)

# Store locations as tuples
warehouse = (0, 0)
customer1 = (3, 4)
customer2 = (6, 8)

d1 = calculate_distance(warehouse, customer1)
d2 = calculate_distance(warehouse, customer2)

print(f"Distance to Customer 1: {d1:.2f} units")  # 5.00
print(f"Distance to Customer 2: {d2:.2f} units")  # 10.00
```

---

### Exercise 3: Sales Report with Named Tuples

**Goal**: Create structured sales records.

```python
from collections import namedtuple

# Define the record structure
SalesRecord = namedtuple('SalesRecord', ['date', 'region', 'product', 'quantity', 'revenue'])

# Create records
records = [
    SalesRecord('2024-01-15', 'North', 'Widget', 100, 2999.00),
    SalesRecord('2024-01-15', 'South', 'Gadget', 75, 5624.25),
    SalesRecord('2024-01-16', 'North', 'Widget', 120, 3598.80),
]

# Process records
print("=== SALES SUMMARY ===")
total_revenue = 0
for record in records:
    print(f"{record.date} | {record.region:5} | {record.product:6} | {record.quantity:4} units | ${record.revenue:,.2f}")
    total_revenue += record.revenue

print(f"\nTotal Revenue: ${total_revenue:,.2f}")
```

---

## Mastery Check

### Question 1: Tuple Creation
Which of these creates a single-element tuple?
```python
a = (42)
b = (42,)
c = 42,
```

<details>
<summary>Click for Answer</summary>

**Answers: `b` and `c`**

- `a = (42)` → Just the number 42 (parentheses are for grouping)
- `b = (42,)` → Tuple with one element
- `c = 42,` → Also a tuple (comma creates the tuple)

</details>

---

### Question 2: Immutability
What happens with this code?
```python
data = (1, [2, 3], 4)
data[1].append(5)
print(data)
```

<details>
<summary>Click for Answer</summary>

**Answer: `(1, [2, 3, 5], 4)`**

The tuple itself is immutable, but it contains a reference to a mutable list. The list inside can still be modified!

This is an important gotcha: immutable containers can hold mutable objects.

</details>

---

### Question 3: Unpacking
What values do a, b, c have?
```python
a, *b, c = (1, 2, 3, 4, 5)
```

<details>
<summary>Click for Answer</summary>

- `a = 1`
- `b = [2, 3, 4]` (list, not tuple!)
- `c = 5`

The `*` collects all remaining elements into a list.

</details>

---

### Question 4: Dictionary Keys
Why can tuples be dictionary keys but lists cannot?

<details>
<summary>Click for Answer</summary>

Dictionary keys must be **hashable** (have a fixed hash value). Hashability requires immutability.

- Tuples are immutable → hashable → valid keys
- Lists are mutable → not hashable → invalid keys

```python
# Works
locations = {(40.7, -74.0): "NYC"}

# Fails with TypeError
# locations = {[40.7, -74.0]: "NYC"}
```

</details>

---

### Question 5: Design Scenario
**Scenario**: You're building a configuration system where database settings should never be changed at runtime. Design the data structure.

<details>
<summary>Click for Answer</summary>

```python
from collections import namedtuple

# Define immutable config structure
DBConfig = namedtuple('DBConfig', [
    'host', 
    'port', 
    'database', 
    'user', 
    'max_connections'
])

# Create the configuration (can't be modified after this)
prod_db = DBConfig(
    host='db.company.com',
    port=5432,
    database='production',
    user='app_user',
    max_connections=100
)

# Usage
connection_string = f"postgresql://{prod_db.user}@{prod_db.host}:{prod_db.port}/{prod_db.database}"
print(connection_string)

# prod_db.port = 5433  # This would FAIL - protecting config integrity
```

**Production Enhancement**: In Python 3.8+, use `@dataclass(frozen=True)` for even more powerful immutable structures.

</details>

---

## Summary

Today you learned:
- ✅ Tuples are immutable ordered collections
- ✅ Single-element tuples need a trailing comma: `(42,)`
- ✅ Tuple unpacking enables clean, readable code
- ✅ Named tuples add readability to structured data
- ✅ Tuples can be dictionary keys; lists cannot

**Tomorrow**: We'll explore **sets**—collections optimized for uniqueness and fast membership testing.
