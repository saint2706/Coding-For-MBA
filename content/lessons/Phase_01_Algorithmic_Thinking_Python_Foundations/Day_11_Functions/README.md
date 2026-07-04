---
day: 11
title: "Functions"
phase: 1
phaseTitle: "Algorithmic Thinking & Python Foundations"
slug: "functions"
duration: 60
difficulty: "beginner"
tags:
  - python
  - functions
  - modular-code
  - reusability
concepts:
  - "function definition"
  - "parameters and arguments"
  - "return values"
  - "scope and namespace"
  - "error handling (try/except/raise)"
prerequisites: [1, 2, 3, 9, 10]
outcomes:
  - "Define and call functions"
  - "Use parameters and return values effectively"
  - "Understand variable scope"
  - "Handle errors gracefully with try/except and raise"
---

# 🎯 Day 11: Functions

> *"Functions are the building blocks of maintainable code. Write once, use everywhere."*

---

## The "Never-Coded" Bridge

**Think about your company's processes:**

- A formula in Excel that calculates tax
- A checklist for onboarding new employees
- A standard procedure for handling customer complaints

Each of these is a **procedure**: a named sequence of steps you can use whenever needed.

Functions in programming are the same concept. Instead of copying the same calculation code everywhere, you:

1. Define it once with a name
2. Call it by name whenever needed
3. Change it in one place, updates everywhere

```python
# Without function (copy-paste nightmare)
price1, tax1 = 100, 100 * 0.08
price2, tax2 = 250, 250 * 0.08
price3, tax3 = 175, 175 * 0.08


# With function (clean and maintainable)
def calculate_tax(price, rate=0.08):
    return price * rate


tax1 = calculate_tax(100)
tax2 = calculate_tax(250)
tax3 = calculate_tax(175)
```

Now if the tax rate changes, you update ONE line.

---

## The Technical Deep Dive

Every function you write follows the same simple shape: something goes in, the function does its work, and a result comes out.

![Diagram of a function machine: an arrow labeled "INPUT x" feeds into a box labeled "FUNCTION f:", which outputs an arrow labeled "OUTPUT f(x)"](images/phase-01/function-machine.svg)

*Function machine by Wvbailey, via [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Function_machine2.svg) (public domain).*

### Basic Function Definition

```python
def greet():
    """Say hello to the user."""
    print("Hello, World!")


# Calling the function
greet()  # Output: Hello, World!
```

**Anatomy:**

- `def` - keyword to define a function
- `greet` - function name (use descriptive names)
- `()` - parentheses (parameters go here)
- `:` - colon starts the function body
- Docstring - optional but recommended documentation
- Indented block - the function body

### Parameters and Arguments

```python
# Positional parameters
def greet(name):
    print(f"Hello, {name}!")


greet("Alice")  # "Hello, Alice!"


# Multiple parameters
def full_greeting(name, time_of_day):
    print(f"Good {time_of_day}, {name}!")


full_greeting("Bob", "morning")


# Default parameters
def greet_with_default(name, greeting="Hello"):
    print(f"{greeting}, {name}!")


greet_with_default("Charlie")  # "Hello, Charlie!"
greet_with_default("Diana", "Welcome")  # "Welcome, Diana!"
```

### Keyword Arguments

```python
def create_profile(name, age, city, role="Member"):
    print(f"{name}, {age}, from {city} - {role}")


# Positional
create_profile("Alice", 30, "NYC")

# Keyword (order doesn't matter)
create_profile(age=25, name="Bob", city="LA")

# Mixed (positional first, then keyword)
create_profile("Charlie", 28, role="Admin", city="Chicago")
```

### Return Values

```python
# Single return
def calculate_tax(amount, rate=0.08):
    return amount * rate


tax = calculate_tax(100)  # 8.0


# Multiple returns (tuple)
def get_stats(numbers):
    return min(numbers), max(numbers), sum(numbers) / len(numbers)


low, high, avg = get_stats([10, 20, 30, 40, 50])


# Early return
def divide(a, b):
    if b == 0:
        return None  # Guard clause
    return a / b
```

### *args and **kwargs

```python
# *args - variable number of positional arguments
def sum_all(*numbers):
    return sum(numbers)


sum_all(1, 2, 3)  # 6
sum_all(1, 2, 3, 4, 5)  # 15


# **kwargs - variable number of keyword arguments
def print_info(**details):
    for key, value in details.items():
        print(f"{key}: {value}")


print_info(name="Alice", age=30, city="NYC")


# Combining
def flexible_func(required, *args, **kwargs):
    print(f"Required: {required}")
    print(f"Extra positional: {args}")
    print(f"Extra keyword: {kwargs}")
```

### Real Business Use: Flexible Report Builder

`*args` and `**kwargs` shine when function callers have genuinely different needs that you can't predict at design time. Two common scenarios:

**`*args` — variable columns in a report**: You're building a report generation function. Some reports need 2 columns, others need 10. `*args` lets you pass any number of column names without changing the function signature every time requirements change.

**`**kwargs` — optional dashboard settings**: A dashboard configuration function where different dashboards need different settings (`title`, `color_scheme`, `show_legend`, etc.). Callers only pass the settings they need; the function uses `settings.get()` with a default for everything else.

```python
def generate_report(*columns, **settings):
    """Build a report with any columns and optional settings."""
    title = settings.get("title", "Monthly Report")
    print(f"=== {title} ===")
    for col in columns:
        print(f"  Column: {col}")
    if settings.get("show_totals", False):
        print("  [Totals row included]")

# Flexible: works with 2 or 20 columns
generate_report("Revenue", "Units", title="Q1 Summary", show_totals=True)
```

### Scope and Namespace

```python
# Global scope
tax_rate = 0.08


def calculate_tax(amount):
    # Local scope - can read global
    return amount * tax_rate


# Can't modify global without 'global' keyword
counter = 0


def increment():
    global counter  # Now we can modify it
    counter += 1


# LEGB Rule: Local → Enclosing → Global → Built-in
```

### Error Handling in Functions

When a function receives bad input or encounters an unexpected condition, it needs to handle it gracefully rather than crashing the entire program. Python's `try/except` block is the tool for this.

**The structure:**

```python
try:
    # Code that might fail
    result = risky_operation()
except SomeErrorType:
    # What to do when that specific error occurs
    result = fallback_value
```

**Business example — safe division for KPI calculations:**

```python
def growth_rate(current, previous):
    try:
        return (current - previous) / previous * 100
    except ZeroDivisionError:
        return None  # Can't calculate growth with no baseline


print(growth_rate(120000, 100000))  # 20.0
print(growth_rate(120000, 0))       # None
```

**Catching multiple error types:**

```python
def parse_revenue(value):
    try:
        return float(value.strip().replace("$", "").replace(",", ""))
    except AttributeError:
        # value was None or not a string
        return None
    except ValueError:
        # string was not a valid number
        return None


print(parse_revenue("$1,250.00"))  # 1250.0
print(parse_revenue(None))         # None
print(parse_revenue("N/A"))        # None
```

**`else` and `finally` clauses:**

```python
def load_config(filename):
    try:
        f = open(filename)
        data = f.read()
    except FileNotFoundError:
        print(f"Config file {filename} not found, using defaults")
        data = "{}"
    else:
        # Runs only if no exception occurred
        print("Config loaded successfully")
    finally:
        # Runs always — cleanup code goes here
        print("load_config finished")
    return data
```

**`raise` — validating inputs inside your own functions:**

```python
def apply_discount(price, discount_pct):
    if discount_pct < 0 or discount_pct > 100:
        raise ValueError(f"discount_pct must be 0-100, got {discount_pct}")
    return price * (1 - discount_pct / 100)


try:
    final = apply_discount(100, 150)  # Invalid input
except ValueError as e:
    print("Error:", e)
# Error: discount_pct must be 0-100, got 150
```

> **Rule of thumb**: validate inputs at the top of a function with `raise`, and wrap uncertain external operations (file reads, type conversions, network calls) with `try/except`. Never use bare `except:` — always name the specific error type so you don't accidentally swallow unrelated bugs.

---

### Lambda Functions (Anonymous Functions)

```python
# Regular function
def square(x):
    return x**2


# Lambda equivalent
square = lambda x: x**2

# Common use: sorting
products = [
    {"name": "Laptop", "price": 999},
    {"name": "Mouse", "price": 29},
    {"name": "Keyboard", "price": 79},
]

# Sort by price
sorted_products = sorted(products, key=lambda p: p["price"])
```

---

## Senior-Level Insights

### Type Hints (Modern Python)

```python
def calculate_roi(revenue: float, cost: float) -> float:
    """Calculate Return on Investment."""
    return (revenue - cost) / cost * 100


# Complex types
from typing import List, Dict, Optional


def process_orders(orders: List[Dict]) -> Optional[str]:
    if not orders:
        return None
    return f"Processed {len(orders)} orders"
```

### Docstrings (Documentation)

```python
def calculate_compound_interest(principal: float, rate: float, years: int) -> float:
    """
    Calculate compound interest.

    Args:
        principal: Initial investment amount
        rate: Annual interest rate (e.g., 0.05 for 5%)
        years: Number of years to compound

    Returns:
        Final amount after compound interest

    Example:
        >>> calculate_compound_interest(1000, 0.05, 10)
        1628.89
    """
    return principal * (1 + rate) ** years
```

### Pure Functions (Functional Programming)

```python
# Pure function: no side effects, same input = same output
def pure_double(x):
    return x * 2


# Impure: has side effects
results = []


def impure_double(x):
    results.append(x * 2)  # Side effect!
    return x * 2


# Pure functions are easier to test and reason about
```

### Decorators (Advanced Pattern)

```python
import time


def timer(func):
    """Decorator to measure function execution time."""

    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        end = time.time()
        print(f"{func.__name__} took {end - start:.4f} seconds")
        return result

    return wrapper


@timer
def slow_function():
    time.sleep(1)
    return "Done"


slow_function()  # "slow_function took 1.0012 seconds"
```

---

## Hands-on Lab

### Exercise 1: Financial Calculator

**Goal**: Build a set of financial calculation functions.

```python
def calculate_roi(revenue, cost):
    """Calculate Return on Investment as percentage."""
    if cost == 0:
        return None
    return ((revenue - cost) / cost) * 100


def calculate_cagr(start_value, end_value, years):
    """Calculate Compound Annual Growth Rate."""
    if start_value <= 0 or years <= 0:
        return None
    return ((end_value / start_value) ** (1 / years) - 1) * 100


def calculate_break_even(fixed_costs, price_per_unit, cost_per_unit):
    """Calculate break-even point in units."""
    margin = price_per_unit - cost_per_unit
    if margin <= 0:
        return None
    return fixed_costs / margin


# Test the functions
print(f"ROI: {calculate_roi(150000, 100000):.1f}%")
print(f"CAGR: {calculate_cagr(100000, 200000, 5):.1f}%")
print(f"Break-even: {calculate_break_even(50000, 25, 10):.0f} units")
```

**Expected Output:**

```text
ROI: 50.0%
CAGR: 14.9%
Break-even: 3333 units
```

---

### Exercise 2: Data Validator

**Goal**: Create validation functions with clear error messages.

```python
def validate_email(email):
    """Validate email format."""
    if not email:
        return False, "Email is required"
    if "@" not in email:
        return False, "Missing @ symbol"
    if "." not in email.split("@")[1]:
        return False, "Invalid domain"
    return True, "Valid email"


def validate_age(age):
    """Validate age is reasonable."""
    if not isinstance(age, int):
        return False, "Age must be a number"
    if age < 0:
        return False, "Age cannot be negative"
    if age > 150:
        return False, "Age seems unrealistic"
    return True, "Valid age"


def validate_user(email, age):
    """Validate complete user profile."""
    errors = []

    valid, msg = validate_email(email)
    if not valid:
        errors.append(f"Email: {msg}")

    valid, msg = validate_age(age)
    if not valid:
        errors.append(f"Age: {msg}")

    return len(errors) == 0, errors


# Test
is_valid, errors = validate_user("test@example.com", 25)
print(f"Valid: {is_valid}")

is_valid, errors = validate_user("invalid-email", -5)
print(f"Valid: {is_valid}")
print(f"Errors: {errors}")
```

**Expected Output:**

```text
Valid: True
Valid: False
Errors: ['Email: Missing @ symbol', 'Age: Age cannot be negative']
```

---

### Exercise 3: Report Generator

**Goal**: Build a configurable report generator.

```python
def generate_report(data, title="Report", show_total=True, show_average=False):
    """
    Generate a formatted report from data.

    Args:
        data: List of (label, value) tuples
        title: Report title
        show_total: Whether to show sum
        show_average: Whether to show average
    """
    width = 40
    print("=" * width)
    print(f"{title:^{width}}")
    print("=" * width)

    total = 0
    for label, value in data:
        print(f"{label:<20} ${value:>15,.2f}")
        total += value

    print("-" * width)

    if show_total:
        print(f"{'TOTAL':<20} ${total:>15,.2f}")

    if show_average:
        avg = total / len(data)
        print(f"{'AVERAGE':<20} ${avg:>15,.2f}")

    print("=" * width)


# Usage
sales = [
    ("Q1 Sales", 125000),
    ("Q2 Sales", 148000),
    ("Q3 Sales", 132000),
    ("Q4 Sales", 175000),
]

generate_report(sales, title="2024 Sales Report", show_total=True, show_average=True)
```

**Expected Output:**

```text
========================================
           2024 Sales Report            
========================================
Q1 Sales             $     125,000.00
Q2 Sales             $     148,000.00
Q3 Sales             $     132,000.00
Q4 Sales             $     175,000.00
----------------------------------------
TOTAL                $     580,000.00
AVERAGE              $     145,000.00
========================================
```

---

## Mastery Check

### Question 1: Default Parameters

What's wrong with this function?

```python
def add_item(item, items=[]):
    items.append(item)
    return items
```

<details>
<summary>Click for Answer</summary>

**Mutable default argument trap!** The list `[]` is created once when the function is defined, not each time it's called.

```python
add_item("a")  # ["a"]
add_item("b")  # ["a", "b"] - same list!
```

**Fix:**

```python
def add_item(item, items=None):
    if items is None:
        items = []
    items.append(item)
    return items
```

</details>

---

### Question 2: Return vs Print

What's the difference?

```python
def func_a(x):
    print(x * 2)


def func_b(x):
    return x * 2
```

<details>
<summary>Click for Answer</summary>

- `func_a` displays output but returns `None`
- `func_b` returns the computed value

```python
result_a = func_a(5)  # Prints 10, result_a is None
result_b = func_b(5)  # Returns 10, result_b is 10

# func_b can be used in expressions
total = func_b(5) + func_b(10)  # Works: 30
total = func_a(5) + func_a(10)  # Error: None + None
```

</details>

---

### Question 3: Scope

What prints?

```python
x = 10


def modify():
    x = 20
    print(x)


modify()
print(x)
```

<details>
<summary>Click for Answer</summary>

```text
20
10
```

The `x = 20` inside the function creates a local variable, it doesn't modify the global `x`.

</details>

---

### Question 4: *args Usage

Write a function that takes any number of prices and applies a discount:

<details>
<summary>Click for Answer</summary>

```python
def apply_discount(discount_rate, *prices):
    return [price * (1 - discount_rate) for price in prices]


# Usage
discounted = apply_discount(0.15, 100, 250, 75)
print(discounted)  # [85.0, 212.5, 63.75]
```

</details>

---

### Question 5: Design Scenario

**Scenario**: Design a function for a payment processor that:

1. Validates the payment amount
2. Applies fees based on payment type
3. Returns the total and a breakdown

<details>
<summary>Click for Answer</summary>

```python
def process_payment(amount, payment_type="credit"):
    """
    Process a payment with applicable fees.

    Args:
        amount: Payment amount
        payment_type: credit, debit, or bank_transfer

    Returns:
        Dict with breakdown and total
    """
    # Validation
    if amount <= 0:
        return {"error": "Invalid amount"}

    # Fee structure
    fees = {
        "credit": 0.029,  # 2.9%
        "debit": 0.015,  # 1.5%
        "bank_transfer": 0.005,  # 0.5%
    }

    fee_rate = fees.get(payment_type, 0.029)
    fee_amount = round(amount * fee_rate, 2)
    total = round(amount + fee_amount, 2)

    return {
        "subtotal": amount,
        "payment_type": payment_type,
        "fee_rate": f"{fee_rate:.1%}",
        "fee_amount": fee_amount,
        "total": total,
    }


# Usage
result = process_payment(100, "credit")
print(result)
# {'subtotal': 100, 'payment_type': 'credit', 'fee_rate': '2.9%',
#  'fee_amount': 2.9, 'total': 102.9}
```

</details>

---

## Summary

Today you learned:

- ✅ Functions encapsulate reusable code blocks
- ✅ Parameters accept input; return values provide output
- ✅ Default parameters make functions flexible
- ✅ `*args` and `**kwargs` handle variable arguments
- ✅ Scope determines variable visibility (LEGB rule)

**Tomorrow**: We'll explore **list comprehensions**—a powerful Pythonic way to create and transform lists.

**Next-step depth**: After Day 12, continue with [Day 11B: Generators & Iterators](../Day_11B_Generators_Iterators/README.md) to handle large, streaming datasets efficiently.

---

## Recurring Mini-Scenario Challenge: Retail Pulse Sales Tracker (Day 11)

Refactor `sales_tracker_phase1.py` into reusable functions.

**Challenge**

- Decompose logic into at least three functions, for example:
  - `classify_traffic(orders_count, is_weekend)`
  - `build_snapshot(...)`
  - `summarize_week(weekly_snapshots)`
- Ensure functions reuse existing Day 2-10 variables/data structures.
- Keep outputs identical to prior summary lines for easy regression checks.

**Measurable output**

- Print one function-generated line confirming KPI parity, e.g., `"FUNCTION_CHECK | weekly_revenue=..."`.

---

## Glossary

- **Function**: A named, reusable block of code that performs a specific task
- **`def`**: Keyword used to define a function
- **Parameter**: A variable in the function definition that receives input values
- **Argument**: The actual value passed to a function when it is called
- **`return`**: Sends a value back from a function to the caller
- **Docstring**: A string literal at the top of a function that documents its purpose
- **`*args`**: Allows a function to accept any number of positional arguments as a tuple
- **`**kwargs`**: Allows a function to accept any number of keyword arguments as a dictionary
- **Default parameter**: A parameter with a pre-set value used when no argument is provided
- **Scope**: The region of code where a variable is accessible (local vs. global)
- **DRY (Don't Repeat Yourself)**: The principle that logic should be written once and reused
- **Pure function**: A function that always returns the same output for the same input and has no side effects
