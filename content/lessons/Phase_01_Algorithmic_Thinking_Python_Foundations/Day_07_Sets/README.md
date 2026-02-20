---
day: 7
title: "Sets"
phase: 1
phaseTitle: "Algorithmic Thinking & Python Foundations"
slug: "sets"
duration: 45
difficulty: "beginner"
tags:
  - python
  - sets
  - uniqueness
  - set-operations
concepts:
  - "set creation"
  - "uniqueness constraint"
  - "set operations (union, intersection, difference)"
  - "membership testing"
prerequisites: [1, 2, 3, 4, 5, 6]
outcomes:
  - "Store unique collections of values"
  - "Perform mathematical set operations"
  - "Use sets for efficient membership testing"
---

# 🎯 Day 7: Sets

> *"When you need to know 'what's unique' or 'is this in that group?'—sets are your answer."*

---

## The "Never-Coded" Bridge

**Imagine you're running a marketing campaign and collecting email signups.**

Problem: The same person might sign up multiple times. You don't want to send 10 emails to one customer.

A **set** is like a VIP list at a club—once you're on it, you're on it. Adding the same person again doesn't create duplicates.

```python
# With a list (problem: duplicates)
signups_list = ["alice@email.com", "bob@email.com", "alice@email.com"]
print(len(signups_list))  # 3 (but we only have 2 unique people!)

# With a set (solution: automatic deduplication)
signups_set = {"alice@email.com", "bob@email.com", "alice@email.com"}
print(len(signups_set))   # 2 (correct!)
```

Sets also answer questions like:

- "Which customers bought BOTH products?"
- "Who's in List A but NOT in List B?"
- "What are all the UNIQUE categories?"

---

## The Technical Deep Dive

### Creating Sets

```python
# Empty set (note: {} creates a dict, not a set!)
empty = set()

# Set with values
fruits = {"apple", "banana", "cherry"}
numbers = {1, 2, 3, 4, 5}

# Duplicates are automatically removed
unique = {1, 1, 2, 2, 3, 3}  # {1, 2, 3}

# From other iterables
from_list = set([1, 2, 2, 3, 3, 3])  # {1, 2, 3}
from_string = set("hello")          # {'h', 'e', 'l', 'o'}
```

### Set Characteristics

```python
# UNORDERED - no indexing!
colors = {"red", "green", "blue"}
# colors[0]  # ERROR! Sets don't support indexing

# Only HASHABLE items (immutable types)
valid = {1, "hello", (1, 2)}  # OK
# invalid = {[1, 2]}          # ERROR! Lists aren't hashable

# Iterating still works
for color in colors:
    print(color)
```

### Modifying Sets

```python
skills = {"Python", "SQL", "Excel"}

# Add single element
skills.add("Tableau")

# Add multiple elements
skills.update(["PowerBI", "R"])

# Remove elements
skills.remove("R")        # Raises KeyError if not found
skills.discard("Ruby")    # No error if not found
item = skills.pop()       # Remove and return arbitrary element

# Clear all
# skills.clear()
```

### Set Operations (The Magic)

```python
team_a = {"Alice", "Bob", "Charlie", "Diana"}
team_b = {"Charlie", "Diana", "Eve", "Frank"}

# UNION: All members of either team
all_people = team_a | team_b
# or: team_a.union(team_b)
# {"Alice", "Bob", "Charlie", "Diana", "Eve", "Frank"}

# INTERSECTION: Members of BOTH teams
both_teams = team_a & team_b
# or: team_a.intersection(team_b)
# {"Charlie", "Diana"}

# DIFFERENCE: In A but not in B
only_a = team_a - team_b
# or: team_a.difference(team_b)
# {"Alice", "Bob"}

# SYMMETRIC DIFFERENCE: In either, but not both
exclusive = team_a ^ team_b
# or: team_a.symmetric_difference(team_b)
# {"Alice", "Bob", "Eve", "Frank"}
```

### Fast Membership Testing

```python
# Sets use hash tables - O(1) lookup!
premium_customers = {"CST001", "CST145", "CST892", "CST234"}

customer_id = "CST145"
if customer_id in premium_customers:
    print("Apply premium discount")

# Compare to list - O(n) lookup
# For 1 million customers, set is ~100,000x faster for lookups
```

### Set Comparisons

```python
a = {1, 2, 3}
b = {1, 2, 3, 4, 5}
c = {1, 2, 3}

a == c           # True (same elements)
a < b            # True (a is proper subset of b)
a <= b           # True (a is subset of b)
b > a            # True (b is proper superset of a)
a.issubset(b)    # True
b.issuperset(a)  # True
a.isdisjoint({4, 5})  # True (no common elements)
```

---

## Senior-Level Insights

### When to Use Sets vs. Lists

| Use Set When...                | Use List When...              |
| ------------------------------ | ----------------------------- |
| Need unique values only        | Need duplicates               |
| Order doesn't matter           | Order matters                 |
| Frequent "is X in collection?" | Frequent indexing by position |
| Set math operations needed     | Sequential processing         |

### Performance Deep-Dive

```python
import time

# Generate test data
data = list(range(1_000_000))

# List membership: O(n)
start = time.time()
999999 in data  # Must check each element
list_time = time.time() - start

# Set membership: O(1)
data_set = set(data)
start = time.time()
999999 in data_set  # Hash table lookup
set_time = time.time() - start

print(f"List: {list_time:.6f}s")  # ~0.015s
print(f"Set:  {set_time:.6f}s")   # ~0.000001s
```

### Frozen Sets (Immutable Sets)

```python
# Regular set - mutable
mutable = {1, 2, 3}
mutable.add(4)

# Frozen set - immutable
immutable = frozenset([1, 2, 3])
# immutable.add(4)  # ERROR!

# Frozen sets can be dictionary keys or nested in other sets
nested = {frozenset([1, 2]), frozenset([3, 4])}
```

### Set Comprehensions

```python
# Square of even numbers
squares = {x**2 for x in range(10) if x % 2 == 0}
# {0, 4, 16, 36, 64}

# Unique first letters
words = ["apple", "apricot", "banana", "cherry", "coconut"]
first_letters = {word[0] for word in words}
# {'a', 'b', 'c'}
```

---

## Hands-on Lab

### Exercise 1: Customer Segment Analysis

**Goal**: Find customer overlaps between segments.

```python
# Customer IDs by segment
newsletter = {"C001", "C002", "C003", "C004", "C005"}
purchasers = {"C003", "C004", "C006", "C007"}
premium = {"C004", "C007", "C008"}

# Subscribers who haven't purchased
potential = newsletter - purchasers
print("Marketing targets:", potential)

# Active but not premium (upgrade opportunity)
upgrade_candidates = purchasers - premium
print("Upgrade candidates:", upgrade_candidates)

# Premium subscribers (high value)
premium_subscribers = newsletter & premium
print("VIP customers:", premium_subscribers)

# All engaged customers
all_engaged = newsletter | purchasers
print("Total engaged:", len(all_engaged))
```

---

### Exercise 2: Skill Gap Analysis

**Goal**: Compare required skills vs. team capabilities.

```python
# Skills required for project
required_skills = {"Python", "SQL", "AWS", "Docker", "Kubernetes"}

# Current team skills
team_skills = {"Python", "SQL", "JavaScript", "AWS", "React"}

# Analysis
have = required_skills & team_skills
missing = required_skills - team_skills
extra = team_skills - required_skills

print("=== SKILL GAP ANALYSIS ===")
print(f"✅ Covered: {have}")
print(f"❌ Need training/hiring: {missing}")
print(f"💡 Bonus capabilities: {extra}")
print(f"\nReadiness: {len(have)}/{len(required_skills)} skills covered")
```

---

### Exercise 3: Deduplication Pipeline

**Goal**: Clean a list of emails and categorize.

```python
# Raw data with duplicates
raw_emails = [
    "alice@company.com",
    "bob@gmail.com",
    "alice@company.com",  # duplicate
    "charlie@company.com",
    "diana@gmail.com",
    "bob@gmail.com",      # duplicate
]

# Deduplicate
unique_emails = set(raw_emails)
print(f"Original: {len(raw_emails)} → Unique: {len(unique_emails)}")

# Categorize by domain
company_emails = {e for e in unique_emails if e.endswith("@company.com")}
personal_emails = unique_emails - company_emails

print(f"Company emails: {company_emails}")
print(f"Personal emails: {personal_emails}")
```

---

## Mastery Check

### Question 1: Set Creation

What's in this set?

```python
my_set = {3, 1, 4, 1, 5, 9, 2, 6, 5, 3}
print(len(my_set))
```

<details>
<summary>Click for Answer</summary>

**Answer: `7`**

Duplicates are removed: `{1, 2, 3, 4, 5, 6, 9}` has 7 unique elements.

</details>

---

### Question 2: Set Operations

Given:

```python
a = {1, 2, 3, 4}
b = {3, 4, 5, 6}
```

What is `a ^ b`?

<details>
<summary>Click for Answer</summary>

**Answer: `{1, 2, 5, 6}`**

The symmetric difference (`^`) contains elements in either set, but not in both. Elements 3 and 4 are in both, so they're excluded.

</details>

---

### Question 3: Empty Set Trap

What does this create?

```python
x = {}
y = set()
print(type(x), type(y))
```

<details>
<summary>Click for Answer</summary>

```python
x = {}      # <class 'dict'>  (empty dictionary!)
y = set()   # <class 'set'>   (empty set)
```

This is a common Python gotcha. Always use `set()` for empty sets.

</details>

---

### Question 4: Practical Application

You have visitor logs from Monday and Tuesday. Find visitors who came both days:

```python
monday = {"user_001", "user_042", "user_198", "user_567"}
tuesday = {"user_042", "user_567", "user_789", "user_234"}
```

<details>
<summary>Click for Answer</summary>

```python
both_days = monday & tuesday
# or: monday.intersection(tuesday)
print(both_days)  # {'user_042', 'user_567'}
```

</details>

---

### Question 5: Design Scenario

**Scenario**: Build a tag-based content recommendation system. Users "follow" tags, articles have tags. Recommend articles where at least 2 tags match user interests.

<details>
<summary>Click for Answer</summary>

```python
# User's followed tags
user_tags = {"python", "data-science", "machine-learning", "career"}

# Article database
articles = [
    {"title": "Python Tips", "tags": {"python", "coding", "tips"}},
    {"title": "ML for Beginners", "tags": {"machine-learning", "ai", "data-science"}},
    {"title": "Resume Writing", "tags": {"career", "job-hunting"}},
    {"title": "SQL Basics", "tags": {"sql", "database", "coding"}},
]

# Find recommendations
print("=== RECOMMENDED FOR YOU ===")
for article in articles:
    matching_tags = user_tags & article["tags"]
    if len(matching_tags) >= 2:
        print(f"📰 {article['title']}")
        print(f"   Matching: {matching_tags}\n")
```

Output:

```text
=== RECOMMENDED FOR YOU ===
📰 ML for Beginners
   Matching: {'machine-learning', 'data-science'}
```

</details>

---

## Summary

Today you learned:

- ✅ Sets store unique, unordered collections
- ✅ Use `set()` for empty sets (not `{}`)
- ✅ Set operations: union (`|`), intersection (`&`), difference (`-`)
- ✅ Membership testing is O(1)—blazingly fast
- ✅ Perfect for deduplication and comparison tasks

**Tomorrow**: We'll explore **dictionaries**—key-value pairs that let you look up data instantly.

---

## Recurring Mini-Scenario Challenge: Retail Pulse Sales Tracker (Day 7)

Keep extending `sales_tracker_phase1.py` by tracking uniqueness.

**Challenge**

- Build a set of unique customer IDs from a list that intentionally contains duplicates.
- Reuse prior-day records by associating each tuple record with a customer ID list for the same day.
- Identify repeated IDs by comparing raw count vs unique count.

**Measurable output**

- Print one anomaly line: `"DUPLICATE_CUSTOMERS=<count>"`.
