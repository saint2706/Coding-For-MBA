---
day: 3
title: "Operators"
phase: 1
phaseTitle: "Algorithmic Thinking & Python Foundations"
slug: "operators"
duration: 45
difficulty: "beginner"
tags:
  - python
  - operators
  - arithmetic
  - comparison
  - logic
concepts:
  - "arithmetic operators"
  - "comparison operators"
  - "logical operators"
  - "assignment operators"
  - "operator precedence"
prerequisites: [1, 2]
outcomes:
  - "Perform mathematical operations with Python"
  - "Compare values using comparison operators"
  - "Combine conditions with logical operators"
---

# 🎯 Day 3: Operators

> *"Operators are the verbs of programming—they make things happen."*

---

## The "Never-Coded" Bridge

**You already know operators. You just call them something else.**

When you write a budget formula in Excel like `=A1+B1*C1`, you're using operators. When you filter a list to show "Sales > $10,000", you're using a comparison operator. When you say "Show me customers who spent over $1000 AND bought in the last month", you're using a logical operator.

Python uses the same concepts, just with slightly different symbols:

| What You Do   | Excel             | Python             |
| ------------- | ----------------- | ------------------ |
| Add           | `A1+B1`           | `a + b`            |
| Multiply      | `A1*B1`           | `a * b`            |
| Greater than  | `A1>100`          | `a > 100`          |
| And condition | `AND(A1>0,B1<10)` | `a > 0 and b < 10` |

If you've done anything in spreadsheets, you're already halfway there.

---

## The Technical Deep Dive

### Arithmetic Operators

| Operator | Name                | Example   | Result |
| -------- | ------------------- | --------- | ------ |
| `+`      | Addition            | `10 + 5`  | `15`   |
| `-`      | Subtraction         | `10 - 5`  | `5`    |
| `*`      | Multiplication      | `10 * 5`  | `50`   |
| `/`      | Division            | `10 / 4`  | `2.5`  |
| `//`     | Floor Division      | `10 // 4` | `2`    |
| `%`      | Modulus (remainder) | `10 % 4`  | `2`    |
| `**`     | Exponent            | `2 ** 3`  | `8`    |

```python
# Business examples
revenue = 150000
costs = 95000
profit = revenue - costs           # 55000

units = 1247
boxes_needed = units // 50         # 24 (full boxes)
remaining_units = units % 50       # 47 (leftover)

# Compound interest: P * (1 + r)^n
principal = 10000
rate = 0.05
years = 10
future_value = principal * (1 + rate) ** years  # 16288.95
```

### Comparison Operators

These return `True` or `False`:

| Operator | Meaning          | Example  | Result  |
| -------- | ---------------- | -------- | ------- |
| `==`     | Equal to         | `5 == 5` | `True`  |
| `!=`     | Not equal        | `5 != 3` | `True`  |
| `>`      | Greater than     | `10 > 5` | `True`  |
| `<`      | Less than        | `10 < 5` | `False` |
| `>=`     | Greater or equal | `5 >= 5` | `True`  |
| `<=`     | Less or equal    | `3 <= 5` | `True`  |

```python
# Business decision making
revenue = 125000
target = 100000

met_target = revenue >= target     # True
exceeded_by_50 = revenue > target * 1.5  # False

# String comparison
status = "active"
is_active = status == "active"     # True
```

> ⚠️ **Common Mistake**: `=` is assignment, `==` is comparison!

### Logical Operators

Combine multiple conditions:

| Operator | Meaning           | Example                                    |
| -------- | ----------------- | ------------------------------------------ |
| `and`    | Both must be True | `x > 0 and x < 100`                        |
| `or`     | At least one True | `status == "gold" or status == "platinum"` |
| `not`    | Inverts the value | `not is_banned`                            |

```python
# Customer eligibility check
age = 28
income = 75000
credit_score = 720

# Eligible if: age 21+, income 50k+, AND credit 700+
eligible = age >= 21 and income >= 50000 and credit_score >= 700
print(eligible)  # True

# Premium offer if: platinum OR (gold AND 5+ years)
tier = "gold"
years = 6
gets_premium = tier == "platinum" or (tier == "gold" and years >= 5)
print(gets_premium)  # True
```

### Assignment Operators

Shortcuts for updating variables:

| Operator | Equivalent  | Example  |
| -------- | ----------- | -------- |
| `+=`     | `x = x + y` | `x += 5` |
| `-=`     | `x = x - y` | `x -= 3` |
| `*=`     | `x = x * y` | `x *= 2` |
| `/=`     | `x = x / y` | `x /= 4` |

```python
# Sales counter
daily_sales = 0
daily_sales += 150    # First sale
daily_sales += 275    # Second sale
daily_sales += 99     # Third sale
print(daily_sales)    # 524
```

### Operator Precedence

Python evaluates operators in this order (highest to lowest):

1. `**` (exponents)
2. `*`, `/`, `//`, `%` (multiplication/division)
3. `+`, `-` (addition/subtraction)
4. `==`, `!=`, `<`, `>`, `<=`, `>=` (comparisons)
5. `not`
6. `and`
7. `or`

**When in doubt, use parentheses!**

```python
# Without parentheses (confusing)
result = 10 + 5 * 2 > 15 and not False
# Evaluates as: ((10 + (5 * 2)) > 15) and (not False)
# = (20 > 15) and True = True

# With parentheses (clear)
result = ((10 + (5 * 2)) > 15) and (not False)
```

---

## Senior-Level Insights

### Short-Circuit Evaluation

Python is smart about `and` / `or`:

```python
# With 'and', Python stops at the first False
result = False and expensive_function()  # expensive_function never runs!

# With 'or', Python stops at the first True
result = True or expensive_function()    # expensive_function never runs!
```

**Production Use**: Guard clauses to prevent errors:
```python
# Safely check nested data
if user and user.account and user.account.balance > 0:
    process_payment()
```

### Truthy and Falsy Values

Python treats certain values as `False`:
- `False`, `None`, `0`, `0.0`
- Empty: `""`, `[]`, `{}`, `()`

Everything else is `True`:

```python
# Instead of this:
if len(customers) > 0:
    process()

# Pythonic way:
if customers:  # Non-empty list is truthy
    process()
```

### Chained Comparisons

Python allows mathematical notation:

```python
# Instead of:
if age >= 18 and age <= 65:
    print("Working age")

# Python allows:
if 18 <= age <= 65:
    print("Working age")

# Great for ranges:
if 90 <= score <= 100:
    grade = "A"
```

---

## Hands-on Lab

### Exercise 1: Loan Eligibility Checker

**Goal**: Determine if a customer qualifies for a business loan.

**Eligibility Criteria**:
- Annual revenue ≥ $100,000
- Years in business ≥ 2
- Credit score ≥ 680

```python
# Customer data
annual_revenue = 125000
years_in_business = 3
credit_score = 710

# Check each criterion
revenue_ok = annual_revenue >= 100000
experience_ok = years_in_business >= 2
credit_ok = credit_score >= 680

# Final eligibility
is_eligible = revenue_ok and experience_ok and credit_ok

print("Revenue Requirement:", revenue_ok)
print("Experience Requirement:", experience_ok)
print("Credit Requirement:", credit_ok)
print("====================")
print("LOAN ELIGIBLE:", is_eligible)
```

---

### Exercise 2: Tiered Commission Calculator

**Goal**: Calculate sales commission based on performance tiers.

**Commission Structure**:
- Sales < $50,000: 5%
- Sales $50,000-$100,000: 7%
- Sales > $100,000: 10%

```python
sales = 75000

# Determine rate (we'll use nested logic)
if sales > 100000:
    rate = 0.10
elif sales >= 50000:
    rate = 0.07
else:
    rate = 0.05

commission = sales * rate
print("Sales: $", sales)
print("Rate:", rate * 100, "%")
print("Commission: $", commission)
```

---

### Exercise 3: Inventory Alert System

**Goal**: Generate stock alerts using logical operators.

```python
# Current inventory
product_name = "Widget Pro"
quantity = 15
reorder_point = 20
max_capacity = 500

# Alert conditions
is_low_stock = quantity <= reorder_point
is_out_of_stock = quantity == 0
is_overstocked = quantity > max_capacity * 0.9
needs_attention = is_low_stock or is_out_of_stock or is_overstocked

print("=== INVENTORY ALERT ===")
print("Product:", product_name)
print("Quantity:", quantity)
print("-" * 25)
print("Low Stock:", is_low_stock)
print("Out of Stock:", is_out_of_stock)
print("Overstocked:", is_overstocked)
print("NEEDS ATTENTION:", needs_attention)
```

---

## Mastery Check

### Question 1: Order of Operations
What does this expression evaluate to?
```python
result = 2 + 3 * 4 ** 2
```

<details>
<summary>Click for Answer</summary>

**Answer: `50`**

Order of operations:
1. `4 ** 2` = 16
2. `3 * 16` = 48
3. `2 + 48` = 50

</details>

---

### Question 2: Comparison Trap
What's wrong with this code?
```python
password = "secret123"
if password = "secret123":
    print("Access granted")
```

<details>
<summary>Click for Answer</summary>

**Error: `=` should be `==`**

`=` is assignment, `==` is comparison. This code would cause a `SyntaxError`.

**Fix**:
```python
if password == "secret123":
```

</details>

---

### Question 3: Logical Operators
Evaluate this expression:
```python
x = 5
result = x > 3 and x < 10 or x == 0
```

<details>
<summary>Click for Answer</summary>

**Answer: `True`**

Step by step:
1. `x > 3` → `5 > 3` → `True`
2. `x < 10` → `5 < 10` → `True`
3. `True and True` → `True`
4. `x == 0` → `5 == 0` → `False`
5. `True or False` → `True`

</details>

---

### Question 4: Modulus Application
A warehouse ships products in boxes of 12. If you have 50 items, how many boxes do you need and how many items are left over?

<details>
<summary>Click for Answer</summary>

```python
items = 50
box_size = 12

full_boxes = items // box_size    # 4
leftover = items % box_size       # 2

print("Full boxes:", full_boxes)  # 4
print("Leftover items:", leftover)  # 2
print("Total boxes needed:", full_boxes + (1 if leftover > 0 else 0))  # 5
```

</details>

---

### Question 5: Design Scenario
**Scenario**: Build a risk scoring system for insurance. A customer is "high risk" if ANY of these apply:
- Age < 25 OR age > 70
- Has more than 2 claims in the past year
- Lives in a high-risk zip code (starting with "9")

Write the logic to determine the risk flag.

<details>
<summary>Click for Answer</summary>

```python
age = 23
claims_past_year = 1
zip_code = "90210"

# Individual risk factors
age_risk = age < 25 or age > 70
claims_risk = claims_past_year > 2
location_risk = zip_code.startswith("9")

# High risk if ANY factor is true
is_high_risk = age_risk or claims_risk or location_risk

print("Age Risk:", age_risk)           # True (23 < 25)
print("Claims Risk:", claims_risk)      # False
print("Location Risk:", location_risk)  # True (starts with 9)
print("HIGH RISK:", is_high_risk)       # True
```

**Production Considerations**:
- Weight different factors differently?
- Create a numerical risk score instead of boolean?
- Log which factors triggered for audit purposes

</details>

---

## Summary

Today you learned:
- ✅ Arithmetic operators (`+`, `-`, `*`, `/`, `//`, `%`, `**`)
- ✅ Comparison operators return `True` or `False`
- ✅ Logical operators (`and`, `or`, `not`) combine conditions
- ✅ Assignment operators (`+=`, `-=`, etc.) update variables
- ✅ Operator precedence determines evaluation order

**Tomorrow**: We'll explore **strings**—the primary way programs handle text, names, and messages.
