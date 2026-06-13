---
day: 2
title: "Variables & Built-in Functions"
phase: 1
phaseTitle: "Algorithmic Thinking & Python Foundations"
slug: "variables-builtin-functions"
duration: 50
difficulty: "beginner"
tags:
  - python
  - variables
  - functions
  - data-types
concepts:
  - "variable assignment"
  - "data types (int, float, str, bool)"
  - "type conversion"
  - "built-in functions"
prerequisites: [1]
outcomes:
  - "Store and retrieve data using variables"
  - "Understand and work with basic data types"
  - "Use built-in functions for common operations"
---

# 🎯 Day 2: Variables & Built-in Functions

> *"Variables are the memory of your programs—teach them to remember, and they'll never forget."*

---

## The "Never-Coded" Bridge

**Imagine you're running a coffee shop. You need to track inventory:**

- Cups of espresso left: **47**
- Price per cup: **$4.50**
- Store name: **"Bean Dreams"**
- Are we open?: **Yes**

In your head (or on paper), you naturally label these pieces of information. That's exactly what **variables** do in programming—they're labeled containers that hold data.

```python
espresso_cups = 47
price_per_cup = 4.50
store_name = "Bean Dreams"
is_open = True
```

Now, whenever you need that information, you just use the label. Change the value once, and everywhere that uses the label sees the update. No more find-and-replace across spreadsheets!

---

## The Technical Deep Dive

### Variable Assignment

The `=` sign in Python means "store this value in this name":

```python
# Creating variables
revenue = 150000
expenses = 95000
company = "TechStart Inc."

# Using variables
profit = revenue - expenses
print(company, "made a profit of $", profit)
```

**Naming Rules:**

- ✅ Start with a letter or underscore: `sales`, `_private`
- ✅ Use letters, numbers, underscores: `quarter_1_sales`, `revenue2024`
- ❌ No spaces: `my variable` → Use `my_variable`
- ❌ No starting with numbers: `2024_revenue` → Use `revenue_2024`
- ❌ No reserved words: `print`, `if`, `for` are off-limits

### Data Types

Python automatically detects the type of data you store:

| Type    | Description     | Example              | Business Use        |
| ------- | --------------- | -------------------- | ------------------- |
| `int`   | Whole numbers   | `units_sold = 1500`  | Counts, quantities  |
| `float` | Decimal numbers | `price = 29.99`      | Money, percentages  |
| `str`   | Text (strings)  | `name = "Acme Corp"` | Names, descriptions |
| `bool`  | True/False      | `is_active = True`   | Flags, conditions   |

```python
# Check the type of any value
print(type(42))  # <class 'int'>
print(type(3.14))  # <class 'float'>
print(type("Hello"))  # <class 'str'>
print(type(True))  # <class 'bool'>
```

### Type Conversion

Sometimes you need to convert between types:

```python
# String to number
user_input = "150"
quantity = int(user_input)  # 150 (integer)
price = float("29.99")  # 29.99 (decimal)

# Number to string
revenue = 50000
message = "Revenue: $" + str(revenue)

# Anything to boolean
bool(0)  # False
bool(1)  # True
bool("")  # False (empty string)
bool("Hi")  # True (non-empty string)
```

### Essential Built-in Functions

| Function  | Purpose            | Example                       |
| --------- | ------------------ | ----------------------------- |
| `print()` | Display output     | `print("Hello")`              |
| `type()`  | Check data type    | `type(42)` → `int`            |
| `len()`   | Get length         | `len("Hello")` → `5`          |
| `input()` | Get user input     | `name = input("Your name: ")` |
| `int()`   | Convert to integer | `int("42")` → `42`            |
| `float()` | Convert to decimal | `float("3.14")` → `3.14`      |
| `str()`   | Convert to text    | `str(100)` → `"100"`          |
| `round()` | Round numbers      | `round(3.14159, 2)` → `3.14`  |
| `abs()`   | Absolute value     | `abs(-50)` → `50`             |
| `max()`   | Find maximum       | `max(10, 25, 5)` → `25`       |
| `min()`   | Find minimum       | `min(10, 25, 5)` → `5`        |

---

## Senior-Level Insights

### Variable Naming Conventions

In professional Python (following PEP 8 style guide):

```python
# Variables and functions: snake_case
customer_lifetime_value = 2500
monthly_recurring_revenue = 45000

# Constants: UPPER_SNAKE_CASE
TAX_RATE = 0.08
MAX_RETRY_ATTEMPTS = 3

# Classes: PascalCase (you'll learn these later)
# CustomerAccount, PaymentProcessor
```

### Memory and Performance

**How Python stores variables:**
Variables are *references* (pointers) to objects in memory. When you write `x = 100`, Python:

1. Creates an integer object `100` in memory
2. Labels it with the name `x`

```python
a = [1, 2, 3]
b = a  # b points to the SAME list
b.append(4)
print(a)  # [1, 2, 3, 4] - a changed too!
```

**Production Tip**: For large datasets, be mindful of copying vs. referencing. Use `copy()` or `deepcopy()` when you need independent copies.

### Type Hints (Modern Python)

Since Python 3.5+, you can add type hints for documentation and tooling:

```python
def calculate_tax(amount: float, rate: float) -> float:
    return amount * rate


# IDE can now warn you about type mismatches
```

### Dynamic Typing: Power and Peril

Python is **dynamically typed** — it "figures out" the type of a variable from the value you assign. This flexibility accelerates development but introduces a class of bugs that only appear at runtime, not at "compile time" like in Java or C++.

**The production risk**: a type error in a business calculation can cause silent data corruption with no error message. Consider this example:

```python
# A value read from a CSV or API response arrives as a string
monthly_revenue = "1000"   # looks like a number, is actually a string

# This silently "works" — but produces wrong output
annual_revenue = monthly_revenue * 12
print(annual_revenue)  # "100010001000100010001000100010001000" ← string repetition!
# No error raised. Your annual revenue report is now garbage.

# Correct approach: validate type at the boundary
monthly_revenue = int("1000")   # explicit conversion
annual_revenue = monthly_revenue * 12
print(annual_revenue)  # 12000 ← correct
```

**Production recommendations**:

- Use **type hints** in function signatures (`amount: float`) to document intent
- Use **`isinstance()` checks** at data boundaries (API inputs, CSV reads, user input) to catch wrong types early
- Use **`mypy`** or **`pyright`** for static type analysis in larger codebases — these tools catch type mismatches before runtime

```python
# Defensive boundary check
def calculate_commission(sales: float, rate: float) -> float:
    if not isinstance(sales, (int, float)):
        raise TypeError(f"sales must be a number, got {type(sales).__name__}")
    return sales * rate
```

---

## Hands-on Lab

### Exercise 1: Customer Profile

**Goal**: Create a complete customer profile using appropriate data types.

**Business Context**: Store key customer data for your CRM system.

```python
# Your solution:
customer_id = 10042
customer_name = "Sarah Chen"
email = "sarah.chen@email.com"
annual_revenue = 125000.00
is_premium = True
years_as_customer = 3

# Print a summary
print("Customer:", customer_name)
print("ID:", customer_id)
print("Annual Revenue: $", annual_revenue)
print("Premium Status:", is_premium)
```

**Expected Output:**
```text
Customer: Sarah Chen
ID: 10042
Annual Revenue: $ 125000.0
Premium Status: True
```

---

### Exercise 2: Dynamic Pricing Calculator

**Goal**: Build a pricing calculator that handles user input.

**Step-by-step**:

1. Store base price and discount rate
2. Calculate discounted price
3. Format output with proper rounding

```python
# Your solution:
base_price = 299.99
discount_rate = 0.15  # 15% discount
discount_amount = base_price * discount_rate
final_price = base_price - discount_amount

print("Original Price: $", base_price)
print("Discount:", discount_rate * 100, "%")
print("You Save: $", round(discount_amount, 2))
print("Final Price: $", round(final_price, 2))
```

**Expected Output:**
```text
Original Price: $ 299.99
Discount: 15.0 %
You Save: $ 45.0
Final Price: $ 254.99
```

---

### Exercise 3: Quick Stats Dashboard

**Goal**: Use built-in functions to analyze a quarter's sales data.

```python
# Monthly sales figures
jan_sales = 45000
feb_sales = 52000
mar_sales = 48500

# Calculations using built-in functions
total = jan_sales + feb_sales + mar_sales
best_month = max(jan_sales, feb_sales, mar_sales)
worst_month = min(jan_sales, feb_sales, mar_sales)
average = round(total / 3, 2)

print("=== Q1 Sales Dashboard ===")
print("Total:", "$" + str(total))
print("Best Month:", "$" + str(best_month))
print("Worst Month:", "$" + str(worst_month))
print("Average:", "$" + str(average))
```

**Expected Output:**
```text
=== Q1 Sales Dashboard ===
Total: $145500
Best Month: $52000
Worst Month: $45000
Average: $48500.0
```

---

## Mastery Check

### Question 1: Type Identification

What data types are these values?

```python
a = 42
b = 42.0
c = "42"
d = True
```

<details>
<summary>Click for Answer</summary>

- `a` = `int` (integer)
- `b` = `float` (decimal)
- `c` = `str` (string)
- `d` = `bool` (boolean)

Even though `42` and `42.0` represent the same mathematical value, Python treats them as different types.

</details>

---

### Question 2: Variable Reassignment

What does this print?

```python
x = 10
y = x
x = 20
print(y)
```

<details>
<summary>Click for Answer</summary>

**Answer: `10`**

When `y = x` was executed, `y` got the *value* `10`, not a permanent link to `x`. Later changing `x` doesn't affect `y`.

</details>

---

### Question 3: Type Conversion

Fix this error:

```python
quantity = input("Enter quantity: ")  # User types: 5
total = quantity * 10
print("Total:", total)
```

<details>
<summary>Click for Answer</summary>

`input()` always returns a string. "5" * 10 = "5555555555" (string repetition!).

**Fix**:

```python
quantity = int(input("Enter quantity: "))
total = quantity * 10
print("Total:", total)  # Now: 50
```

</details>

---

### Question 4: Built-in Functions

Write code to find which department had the highest Q1 expenses:

- Marketing: $45,000
- Engineering: $78,000
- Sales: $52,000

<details>
<summary>Click for Answer</summary>

```python
marketing = 45000
engineering = 78000
sales = 52000

highest = max(marketing, engineering, sales)
print("Highest expense: $", highest)
# Output: Highest expense: $ 78000
```

**Bonus**: To get the department name, you'd need to use techniques from later lessons (dictionaries or conditionals).

</details>

---

### Question 5: Design Scenario

**Scenario**: Your marketing team needs a tool that calculates Cost Per Acquisition (CPA) from their campaign data. The formula is:

`CPA = Total Spend ÷ Number of Acquisitions`

Design a solution that:

1. Stores campaign name, spend, and acquisitions
2. Calculates CPA
3. Handles the edge case where acquisitions = 0

<details>
<summary>Click for Answer</summary>

```python
campaign_name = "Spring 2024 Launch"
total_spend = 25000
acquisitions = 200

# Handle division by zero
if acquisitions > 0:
    cpa = total_spend / acquisitions
    print(campaign_name)
    print("CPA: $", round(cpa, 2))
else:
    print("Error: No acquisitions recorded")
```

**Production Considerations**:

- Add input validation (negative values?)
- Consider storing multiple campaigns in a list/dictionary
- Format currency properly ($12,500.00 format)
- Add logging for tracking calculations

</details>

---

## Summary

Today you learned:

- ✅ Variables store data with meaningful labels
- ✅ Python has four basic types: `int`, `float`, `str`, `bool`
- ✅ Type conversion transforms data between types
- ✅ Built-in functions (`len`, `max`, `min`, `round`) provide common utilities
- ✅ Professional code uses consistent naming conventions

**Tomorrow**: We'll explore **operators**—the tools for comparing, combining, and transforming your data.

---

## Recurring Mini-Scenario Challenge: Retail Pulse Sales Tracker (Day 2)

Build the starter for a single script named `sales_tracker_phase1.py` that you will extend through Day 12.

**Challenge**

- Create well-named variables in `snake_case` for one day of kiosk data: `store_code`, `report_date`, `orders_count`, `avg_ticket_usd`, `is_weekend`.
- Add one constant in `UPPER_SNAKE_CASE`: `ANOMALY_ORDER_LIMIT`.
- Print one progress line using f-strings: `"KPI | {store_code} | Orders={orders_count}"`.

**Measurable output**

- Output exactly one KPI line that includes the store code and order count so you can compare later days against a visible baseline.

---

## Glossary

**Variable**: A named container that stores a value in memory

**Assignment (`=`)**: The operator that binds a value to a variable name

**Data type**: The category of a value (int, float, str, bool)

**`int`**: Integer type — whole numbers without a decimal point

**`float`**: Floating-point type — numbers with decimal precision

**`str`**: String type — text data enclosed in quotes

**`bool`**: Boolean type — either `True` or `False`

**Type conversion**: Explicitly converting a value from one type to another (e.g., `int("5")`)

**Dynamic typing**: Python automatically infers the type of a variable from the assigned value

**Built-in function**: A function provided by Python without needing any import (e.g., `len()`, `max()`)

**`snake_case`**: Naming convention using lowercase letters and underscores (e.g., `total_revenue`)

**`UPPER_SNAKE_CASE`**: Naming convention for constants (e.g., `TAX_RATE`)
