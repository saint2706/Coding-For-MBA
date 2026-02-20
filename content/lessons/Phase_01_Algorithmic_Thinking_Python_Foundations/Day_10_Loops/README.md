---
day: 10
title: "Loops"
phase: 1
phaseTitle: "Algorithmic Thinking & Python Foundations"
slug: "loops"
duration: 55
difficulty: "beginner"
tags:
  - python
  - loops
  - iteration
  - for-while
concepts:
  - "for loops"
  - "while loops"
  - "break and continue"
  - "enumerate and range"
prerequisites: [1, 2, 3, 4, 5, 9]
outcomes:
  - "Iterate over sequences with for loops"
  - "Control iteration with while loops"
  - "Use break and continue for flow control"
---

# 🎯 Day 10: Loops

> *"Why write the same code 1000 times when you can write it once and loop?"*

---

## The "Never-Coded" Bridge

**You already run loops in daily life:**

- Check each email in your inbox
- Process each transaction in a batch
- Review each slide in a presentation

You don't write "check email 1, check email 2, check email 3..." You say "for each email, check it."

That's exactly what loops do in programming. Instead of:

```python
# Repetitive and unmaintainable
print("Processing customer 1")
print("Processing customer 2")
print("Processing customer 3")
# ... a thousand more lines
```

You write:

```python
# Elegant and scalable
for i in range(1000):
    print(f"Processing customer {i + 1}")
```

Same result, infinite scalability.

---

## The Technical Deep Dive

### For Loops

Iterate over any sequence:

```python
# List iteration
products = ["Laptop", "Mouse", "Keyboard"]
for product in products:
    print(f"In stock: {product}")

# String iteration
for char in "Python":
    print(char)

# Dictionary iteration
prices = {"apple": 1.50, "banana": 0.75}
for fruit, price in prices.items():
    print(f"{fruit}: ${price}")
```

### Range Function

Generate number sequences:

```python
# range(stop) - 0 to stop-1
for i in range(5):
    print(i)  # 0, 1, 2, 3, 4

# range(start, stop)
for i in range(1, 6):
    print(i)  # 1, 2, 3, 4, 5

# range(start, stop, step)
for i in range(0, 10, 2):
    print(i)  # 0, 2, 4, 6, 8

# Countdown
for i in range(5, 0, -1):
    print(i)  # 5, 4, 3, 2, 1
```

### Enumerate (Index + Value)

```python
products = ["Laptop", "Mouse", "Keyboard"]

# Without enumerate (old way)
for i in range(len(products)):
    print(f"{i}: {products[i]}")

# With enumerate (Pythonic way)
for index, product in enumerate(products):
    print(f"{index}: {product}")

# Start from 1
for index, product in enumerate(products, start=1):
    print(f"{index}. {product}")
```

### While Loops

Continue until a condition is False:

```python
# Basic while
count = 0
while count < 5:
    print(count)
    count += 1

# User input loop
password = ""
while password != "secret":
    password = input("Enter password: ")
print("Access granted!")

# Processing queue
queue = ["task1", "task2", "task3"]
while queue:  # While list is not empty
    task = queue.pop(0)
    print(f"Processing: {task}")
```

### Break and Continue

```python
# break - exit loop immediately
for i in range(10):
    if i == 5:
        break
    print(i)  # 0, 1, 2, 3, 4

# continue - skip to next iteration
for i in range(5):
    if i == 2:
        continue
    print(i)  # 0, 1, 3, 4
```

### Else Clause on Loops

```python
# else runs if loop completes without break
for i in range(5):
    if i == 10:  # Never true
        break
else:
    print("Loop completed normally")  # This runs

# With break
for i in range(5):
    if i == 3:
        break
else:
    print("Loop completed normally")  # This does NOT run
```

### Nested Loops

```python
# Multiplication table
for i in range(1, 4):
    for j in range(1, 4):
        print(f"{i} x {j} = {i * j}")
    print("---")

# Processing 2D data
matrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
]

for row in matrix:
    for value in row:
        print(value, end=" ")
    print()  # New line after each row
```

---

## Senior-Level Insights

### Avoid Modifying Lists While Iterating

```python
# WRONG - causes bugs
numbers = [1, 2, 3, 4, 5]
for n in numbers:
    if n % 2 == 0:
        numbers.remove(n)  # Don't do this!

# RIGHT - iterate over a copy
for n in numbers[:]:  # Slice creates copy
    if n % 2 == 0:
        numbers.remove(n)

# BETTER - use list comprehension
numbers = [n for n in numbers if n % 2 != 0]
```

### Performance Considerations

```python
# Pre-compute length outside loop
items = list(range(10000))

# Slow (len called each iteration)
for i in range(len(items)):
    pass

# Fast (length computed once)
length = len(items)
for i in range(length):
    pass

# Best (use enumerate or direct iteration)
for item in items:
    pass
```

### Generator Expressions for Memory Efficiency

```python
# List comprehension - all in memory
squares = [x**2 for x in range(1_000_000)]  # Uses ~40MB

# Generator expression - computed on demand
squares = (x**2 for x in range(1_000_000))  # Uses ~100 bytes
for sq in squares:
    pass  # Each value computed as needed
```

### Zip for Parallel Iteration

```python
names = ["Alice", "Bob", "Charlie"]
scores = [95, 87, 92]

# Old way
for i in range(len(names)):
    print(f"{names[i]}: {scores[i]}")

# Pythonic way
for name, score in zip(names, scores):
    print(f"{name}: {score}")
```

---

## Hands-on Lab

### Exercise 1: Sales Report Generator

**Goal**: Generate a formatted sales report.

```python
sales_data = [
    ("January", 45000),
    ("February", 52000),
    ("March", 48000),
    ("April", 61000),
    ("May", 55000),
]

print("=" * 30)
print("MONTHLY SALES REPORT")
print("=" * 30)

total = 0
for month, amount in sales_data:
    total += amount
    print(f"{month:12} ${amount:>10,}")

print("-" * 30)
print(f"{'TOTAL':12} ${total:>10,}")
print(f"{'AVERAGE':12} ${total/len(sales_data):>10,.0f}")
```

---

### Exercise 2: Prime Number Finder

**Goal**: Find all prime numbers up to N.

```python
def is_prime(n):
    if n < 2:
        return False
    for i in range(2, int(n ** 0.5) + 1):
        if n % i == 0:
            return False
    return True

# Find primes up to 50
limit = 50
primes = []

for num in range(2, limit + 1):
    if is_prime(num):
        primes.append(num)

print(f"Prime numbers up to {limit}:")
print(primes)
print(f"Count: {len(primes)}")
```

---

### Exercise 3: Password Validator

**Goal**: Validate password with retry limit.

```python
def validate_password(password):
    """Check if password meets requirements."""
    if len(password) < 8:
        return False, "Too short (min 8 chars)"
    if not any(c.isupper() for c in password):
        return False, "Needs uppercase letter"
    if not any(c.isdigit() for c in password):
        return False, "Needs a digit"
    return True, "Valid"

# Simulation with max 3 attempts
passwords_to_try = ["pass", "Password", "Password123"]
max_attempts = 3

for attempt, pwd in enumerate(passwords_to_try, 1):
    valid, message = validate_password(pwd)
    print(f"Attempt {attempt}: '{pwd}' → {message}")
    
    if valid:
        print("✅ Login successful!")
        break
    
    if attempt == max_attempts:
        print("❌ Account locked - too many attempts")
```

---

## Mastery Check

### Question 1: Range Output

What does this print?

```python
for i in range(3, 8, 2):
    print(i)
```

<details>
<summary>Click for Answer</summary>

```text
3
5
7
```

`range(3, 8, 2)` starts at 3, goes up to (not including) 8, stepping by 2.

</details>

---

### Question 2: Loop Control

What's the output?

```python
for i in range(5):
    if i == 2:
        continue
    if i == 4:
        break
    print(i)
```

<details>
<summary>Click for Answer</summary>

```text
0
1
3
```

- 0, 1 print normally
- 2 is skipped (continue)
- 3 prints
- 4 triggers break before printing

</details>

---

### Question 3: While vs For

When should you use `while` instead of `for`?

<details>
<summary>Click for Answer</summary>

Use `while` when:

- You don't know how many iterations in advance
- Waiting for a condition (user input, sensor reading)
- The exit condition isn't based on sequence length

Use `for` when:

- Iterating over a known sequence
- You know the number of iterations
- Processing collections

```python
# for - known sequence
for item in items:
    process(item)

# while - unknown iterations
while not user_quit:
    command = get_input()
```

</details>

---

### Question 4: Enumerate

Rewrite using enumerate:

```python
words = ["Python", "is", "fun"]
for i in range(len(words)):
    print(f"{i}: {words[i]}")
```

<details>
<summary>Click for Answer</summary>

```python
words = ["Python", "is", "fun"]
for i, word in enumerate(words):
    print(f"{i}: {word}")
```

</details>

---

### Question 5: Design Scenario

**Scenario**: Build a batch processor that:

1. Processes items from a queue
2. Logs each item processed
3. Stops if it encounters an "ERROR" item
4. Reports total items processed

<details>
<summary>Click for Answer</summary>

```python
def batch_processor(queue):
    processed = 0
    
    for item in queue:
        if item == "ERROR":
            print(f"⚠️ Error encountered. Stopping.")
            break
        
        print(f"Processing: {item}")
        processed += 1
    else:
        print("✅ All items processed successfully")
    
    return processed

# Test
test_queue = ["item1", "item2", "item3", "ERROR", "item4"]
count = batch_processor(test_queue)
print(f"\nTotal processed: {count}")
```

**Output:**

```text
Processing: item1
Processing: item2
Processing: item3
⚠️ Error encountered. Stopping.

Total processed: 3
```

</details>

---

## Summary

Today you learned:

- ✅ `for` loops iterate over sequences
- ✅ `while` loops continue until a condition is False
- ✅ `range()` generates number sequences
- ✅ `enumerate()` provides index + value pairs
- ✅ `break` exits loops; `continue` skips iterations

**Tomorrow**: We'll explore **functions**—reusable blocks of code that make programs modular.

---

## Recurring Mini-Scenario Challenge: Retail Pulse Sales Tracker (Day 10)

Extend `sales_tracker_phase1.py` with loop-based rollups.

**Challenge**

- Loop over `weekly_snapshots` to count how many days are `LOW_TRAFFIC`, `NORMAL`, and `SURGE`.
- Accumulate weekly revenue and compute average daily revenue.
- Reuse Day 9 policy tiers rather than recalculating from scratch.

**Measurable output**

- Print one weekly summary line: `"WEEKLY_SUMMARY | low=... normal=... surge=... avg_revenue=..."`.
