---
day: 5
title: "Lists"
phase: 1
phaseTitle: "Algorithmic Thinking & Python Foundations"
slug: "lists"
duration: 55
difficulty: "beginner"
tags:
  - python
  - lists
  - collections
  - data-structures
concepts:
  - "list creation"
  - "indexing and slicing"
  - "list methods (append, remove, sort)"
  - "list iteration"
prerequisites: [1, 2, 3, 4]
outcomes:
  - "Store multiple values in ordered collections"
  - "Access and modify list elements"
  - "Use list methods for data manipulation"
---

# 🎯 Day 5: Lists

> *"One variable holds one value. One list holds a world of possibilities."*

---

## The "Never-Coded" Bridge

**Imagine organizing your desk with sticky notes vs. a proper filing system.**

With variables, you've been using sticky notes—one piece of information per note. But what if you need to track all your customers? All products? All transactions?

A **list** is like a filing cabinet with numbered folders. Each folder (index) holds one item, and you can:
- Add new folders at the end
- Remove folders you don't need
- Reorganize the entire cabinet
- Find specific folders by their number

```python
# Sticky notes approach (tedious!)
customer1 = "Alice"
customer2 = "Bob"
customer3 = "Charlie"

# Filing cabinet approach (scalable!)
customers = ["Alice", "Bob", "Charlie"]
```

Now you can have 3 customers or 3 million—the code stays manageable.

---

## The Technical Deep Dive

### Creating Lists

```python
# Empty list
empty = []

# List with values
numbers = [1, 2, 3, 4, 5]
names = ["Alice", "Bob", "Charlie"]
mixed = [1, "hello", 3.14, True]  # Any types allowed

# List from range
one_to_ten = list(range(1, 11))  # [1, 2, 3, ..., 10]
```

### Indexing and Slicing

```python
products = ["Laptop", "Phone", "Tablet", "Watch", "Earbuds"]
#             0         1        2         3        4
#            -5        -4       -3        -2       -1

# Single element
print(products[0])     # "Laptop" (first)
print(products[-1])    # "Earbuds" (last)

# Slicing [start:end:step]
print(products[1:4])   # ["Phone", "Tablet", "Watch"]
print(products[:3])    # ["Laptop", "Phone", "Tablet"]
print(products[2:])    # ["Tablet", "Watch", "Earbuds"]
print(products[::2])   # ["Laptop", "Tablet", "Earbuds"]
print(products[::-1])  # Reversed list
```

### Modifying Lists

```python
inventory = ["Apple", "Banana", "Cherry"]

# Change an element
inventory[1] = "Blueberry"  # ["Apple", "Blueberry", "Cherry"]

# Add elements
inventory.append("Date")           # Add to end
inventory.insert(0, "Avocado")     # Insert at position
inventory.extend(["Elderberry"])   # Add multiple

# Remove elements
inventory.remove("Cherry")      # Remove by value
popped = inventory.pop()        # Remove & return last
deleted = inventory.pop(0)      # Remove & return at index
del inventory[0]                # Delete at index

# Clear all
# inventory.clear()
```

### Essential List Methods

| Method          | Description               | Example                  |
| --------------- | ------------------------- | ------------------------ |
| `.append(x)`    | Add to end                | `lst.append(5)`          |
| `.insert(i, x)` | Insert at index           | `lst.insert(0, "first")` |
| `.extend(lst2)` | Add all from another list | `lst.extend([4,5])`      |
| `.remove(x)`    | Remove first occurrence   | `lst.remove(3)`          |
| `.pop(i)`       | Remove & return at index  | `lst.pop(-1)`            |
| `.index(x)`     | Find index of value       | `lst.index("bob")`       |
| `.count(x)`     | Count occurrences         | `lst.count(5)`           |
| `.sort()`       | Sort in place             | `lst.sort()`             |
| `.reverse()`    | Reverse in place          | `lst.reverse()`          |
| `.copy()`       | Shallow copy              | `new = lst.copy()`       |

```python
# Sorting example
sales = [45000, 32000, 78000, 56000]
sales.sort()                    # [32000, 45000, 56000, 78000]
sales.sort(reverse=True)        # [78000, 56000, 45000, 32000]

# Sorted returns new list (original unchanged)
original = [3, 1, 4, 1, 5]
new_sorted = sorted(original)   # new_sorted: [1, 1, 3, 4, 5]
print(original)                 # Still [3, 1, 4, 1, 5]
```

### Iterating Over Lists

```python
products = ["Laptop", "Phone", "Tablet"]

# Basic iteration
for product in products:
    print(product)

# With index
for index, product in enumerate(products):
    print(f"{index}: {product}")

# Output:
# 0: Laptop
# 1: Phone
# 2: Tablet
```

### Common Operations

```python
numbers = [10, 20, 30, 40, 50]

len(numbers)           # 5 (length)
sum(numbers)           # 150 (sum)
min(numbers)           # 10 (minimum)
max(numbers)           # 50 (maximum)
30 in numbers          # True (membership)
99 not in numbers      # True
```

---

## Senior-Level Insights

### Lists Are Mutable and Passed by Reference

```python
def add_item(lst):
    lst.append("new item")

my_list = ["a", "b", "c"]
add_item(my_list)
print(my_list)  # ["a", "b", "c", "new item"] - CHANGED!

# To avoid this, pass a copy:
def safe_add(lst):
    lst = lst.copy()
    lst.append("new item")
    return lst
```

### List vs. Generator (Memory Efficiency)

```python
# List: Stores ALL values in memory
big_list = [x**2 for x in range(1_000_000)]  # Uses ~40MB

# Generator: Computes on-demand
big_gen = (x**2 for x in range(1_000_000))   # Uses ~100 bytes

# Use generators for huge datasets you only iterate once
```

### Time Complexity Awareness

| Operation          | Time Complexity | Notes                  |
| ------------------ | --------------- | ---------------------- |
| `lst[i]`           | O(1)            | Direct access by index |
| `lst.append(x)`    | O(1)            | Add to end             |
| `lst.insert(0, x)` | O(n)            | Shift all elements     |
| `x in lst`         | O(n)            | Must check each        |
| `lst.sort()`       | O(n log n)      | Timsort algorithm      |

**Production Tip**: For frequent `x in lst` checks, use a `set` instead.

### Nested Lists (2D Data)

```python
# Sales by quarter for each region
sales_matrix = [
    [45000, 52000, 48000, 61000],  # North
    [38000, 41000, 39000, 45000],  # South
    [62000, 58000, 71000, 69000]   # West
]

# Access: matrix[row][column]
north_q3 = sales_matrix[0][2]  # 48000

# Sum all Q1 sales
q1_total = sum(row[0] for row in sales_matrix)  # 145000
```

---

## Hands-on Lab

### Exercise 1: Sales Tracker

**Goal**: Build a simple sales tracking system.

```python
# Daily sales
daily_sales = []

# Add sales
daily_sales.append(1250)
daily_sales.append(980)
daily_sales.append(1540)
daily_sales.append(1120)
daily_sales.append(1680)

# Analysis
print("Sales this week:", daily_sales)
print("Total:", sum(daily_sales))
print("Average:", sum(daily_sales) / len(daily_sales))
print("Best day:", max(daily_sales))
print("Worst day:", min(daily_sales))
```

---

### Exercise 2: Product Inventory Manager

**Goal**: Manage a product inventory list.

```python
# Initial inventory
products = ["Laptop", "Mouse", "Keyboard", "Monitor", "Webcam"]

# Operations
print("Current inventory:", products)

# Add new product
products.append("Microphone")
print("After adding:", products)

# Remove discontinued product
products.remove("Webcam")
print("After removing:", products)

# Sort alphabetically
products.sort()
print("Sorted:", products)

# Find a product's position
if "Monitor" in products:
    position = products.index("Monitor")
    print(f"Monitor is at position {position}")
```

---

### Exercise 3: Top Performer Analysis

**Goal**: Find top and bottom performers from sales data.

```python
# Sales rep data: (name, sales)
sales_data = [
    ("Alice", 85000),
    ("Bob", 72000),
    ("Charlie", 91000),
    ("Diana", 68000),
    ("Eve", 95000)
]

# Extract just the sales numbers
sales_numbers = [rep[1] for rep in sales_data]

# Sort the data by sales
sorted_data = sorted(sales_data, key=lambda x: x[1], reverse=True)

print("=== PERFORMANCE RANKING ===")
for i, (name, sales) in enumerate(sorted_data, 1):
    print(f"{i}. {name}: ${sales:,}")

print(f"\nTop Performer: {sorted_data[0][0]}")
print(f"Needs Improvement: {sorted_data[-1][0]}")
```

---

## Mastery Check

### Question 1: List Indexing
What does this print?
```python
items = [10, 20, 30, 40, 50]
print(items[1:4])
```

<details>
<summary>Click for Answer</summary>

**Answer: `[20, 30, 40]`**

Slicing is [start:end) — end is exclusive, so indices 1, 2, 3.

</details>

---

### Question 2: List Modification
What's the output?
```python
a = [1, 2, 3]
b = a
b.append(4)
print(a)
```

<details>
<summary>Click for Answer</summary>

**Answer: `[1, 2, 3, 4]`**

`b = a` creates a reference, not a copy. Both names point to the same list.

</details>

---

### Question 3: Method Behavior
What's the difference between `sort()` and `sorted()`?

<details>
<summary>Click for Answer</summary>

- `list.sort()` modifies the list in place, returns `None`
- `sorted(list)` returns a NEW sorted list, original unchanged

```python
nums = [3, 1, 2]
nums.sort()      # nums is now [1, 2, 3], returns None

nums = [3, 1, 2]
new = sorted(nums)  # new is [1, 2, 3], nums still [3, 1, 2]
```

</details>

---

### Question 4: Practical Application
Given a list of prices, calculate the total, average, and identify any items over $100:

```python
prices = [45.99, 129.50, 88.00, 156.75, 32.50]
```

<details>
<summary>Click for Answer</summary>

```python
prices = [45.99, 129.50, 88.00, 156.75, 32.50]

total = sum(prices)
average = total / len(prices)
expensive = [p for p in prices if p > 100]

print(f"Total: ${total:.2f}")
print(f"Average: ${average:.2f}")
print(f"Items over $100: {expensive}")
```

</details>

---

### Question 5: Design Scenario
**Scenario**: Design a system to track the last 10 customer interactions for a support chatbot. New interactions are added frequently, and you need to maintain only the most recent 10.

<details>
<summary>Click for Answer</summary>

```python
# Use a list as a "circular buffer"
MAX_HISTORY = 10
interactions = []

def add_interaction(message):
    interactions.append(message)
    # Remove oldest if over limit
    if len(interactions) > MAX_HISTORY:
        interactions.pop(0)

# Simulation
for i in range(15):
    add_interaction(f"Message {i}")

print(interactions)
# ['Message 5', 'Message 6', ..., 'Message 14']
```

**Production Alternative**: Use `collections.deque(maxlen=10)` for O(1) operations:
```python
from collections import deque
interactions = deque(maxlen=10)
interactions.append("message")  # Auto-removes oldest
```

</details>

---

## Summary

Today you learned:
- ✅ Lists store ordered collections of values
- ✅ Indexing starts at 0; negative indices count from end
- ✅ Lists are mutable—contents can be changed
- ✅ Essential methods: `append`, `remove`, `sort`, `pop`
- ✅ Lists are passed by reference—be careful with modifications

**Tomorrow**: We'll explore **tuples**—lists that can't be changed, perfect for data integrity.
