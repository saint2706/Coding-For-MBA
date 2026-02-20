---
day: 9
title: "Conditionals"
phase: 1
phaseTitle: "Algorithmic Thinking & Python Foundations"
slug: "conditionals"
duration: 50
difficulty: "beginner"
tags:
  - python
  - conditionals
  - if-else
  - decision-making
concepts:
  - "if statements"
  - "elif chains"
  - "nested conditionals"
  - "ternary expressions"
prerequisites: [1, 2, 3]
outcomes:
  - "Control program flow with conditional logic"
  - "Handle multiple conditions with elif"
  - "Write clean, readable decision code"
---

# 🎯 Day 9: Conditionals

> *"Programs that make decisions are programs that solve real problems."*

---

## The "Never-Coded" Bridge

**Your brain runs conditionals constantly:**

- IF it's raining, THEN take an umbrella
- IF the sale price is below budget, THEN approve the purchase
- IF the customer is premium, THEN apply 15% discount, ELSE apply 5%

Programming conditionals work exactly the same way. You give the computer rules, and it follows them consistently—every single time, without getting tired or making mistakes.

```python
# Business rule in plain English:
# "If the order is over $100, give free shipping"

order_total = 125

if order_total > 100:
    shipping = 0
else:
    shipping = 9.99

print(f"Shipping: ${shipping}")  # Shipping: $0
```

Now multiply this by 10,000 orders per day. The logic never wavers.

---

## The Technical Deep Dive

### Basic if Statement

```python
temperature = 35

if temperature > 30:
    print("It's hot outside!")
    print("Remember to stay hydrated.")
```

**Key Points:**

- The condition must evaluate to `True` or `False`
- Colon (`:`) after the condition
- Indented block runs only if condition is `True`

### if-else

```python
age = 17

if age >= 18:
    print("You can vote")
else:
    print("You cannot vote yet")
```

### if-elif-else Chains

```python
score = 85

if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
elif score >= 70:
    grade = "C"
elif score >= 60:
    grade = "D"
else:
    grade = "F"

print(f"Grade: {grade}")  # Grade: B
```

**Important**: Only ONE branch executes. Python stops at the first `True` condition.

### Multiple Conditions

```python
age = 25
has_license = True
has_insurance = True

# AND: All must be true
if age >= 18 and has_license and has_insurance:
    print("You can rent a car")

# OR: At least one must be true
payment = "visa"
if payment == "visa" or payment == "mastercard":
    print("Credit card accepted")

# NOT: Inverts the condition
is_banned = False
if not is_banned:
    print("Welcome back!")
```

### Nested Conditionals

```python
user_type = "member"
years = 5

if user_type == "member":
    if years >= 5:
        discount = 0.20
    elif years >= 2:
        discount = 0.10
    else:
        discount = 0.05
else:
    discount = 0

print(f"Discount: {discount:.0%}")
```

### Ternary Expression (One-line if)

```python
age = 20

# Traditional
if age >= 18:
    status = "adult"
else:
    status = "minor"

# Ternary (same result)
status = "adult" if age >= 18 else "minor"

# Great for simple assignments
price = 100
final = price * 0.9 if price > 50 else price
```

### Truthy and Falsy Values

Python evaluates these as `False`:

- `False`, `None`
- Zero: `0`, `0.0`
- Empty: `""`, `[]`, `{}`, `set()`

Everything else is `True`:

```python
inventory = ["widget"]

# Instead of:
if len(inventory) > 0:
    print("Items available")

# Pythonic:
if inventory:  # Non-empty list is truthy
    print("Items available")
```

---

## Senior-Level Insights

### Guard Clauses (Early Returns)

Instead of deep nesting, return early:

```python
# Deeply nested (hard to read)
def process_order(order):
    if order:
        if order.is_valid:
            if order.in_stock:
                # Process...
                pass

# Guard clauses (cleaner)
def process_order(order):
    if not order:
        return "No order"
    if not order.is_valid:
        return "Invalid order"
    if not order.in_stock:
        return "Out of stock"
    
    # Happy path - process order
    return "Order processed"
```

### Match Statement (Python 3.10+)

For multiple value comparisons:

```python
status_code = 404

match status_code:
    case 200:
        message = "OK"
    case 404:
        message = "Not Found"
    case 500:
        message = "Server Error"
    case _:
        message = "Unknown"
```

### Avoid Deep Nesting

```python
# Bad: Deep nesting
if condition1:
    if condition2:
        if condition3:
            do_something()

# Good: Combine conditions
if condition1 and condition2 and condition3:
    do_something()

# Or use guard clauses
if not condition1:
    return
if not condition2:
    return
if not condition3:
    return
do_something()
```

### Business Logic Tables

For complex rules, consider data-driven approaches:

```python
# Instead of long elif chains:
DISCOUNT_RATES = {
    "platinum": 0.25,
    "gold": 0.15,
    "silver": 0.10,
    "bronze": 0.05,
}

tier = "gold"
discount = DISCOUNT_RATES.get(tier, 0)  # 0.15
```

---

## Hands-on Lab

### Exercise 1: Loan Approval System

**Goal**: Implement a multi-criteria loan approval check.

```python
# Applicant data
credit_score = 720
annual_income = 65000
debt_to_income = 0.35
employment_years = 3

# Approval criteria
min_credit = 650
min_income = 40000
max_dti = 0.43
min_employment = 2

# Evaluation
credit_ok = credit_score >= min_credit
income_ok = annual_income >= min_income
dti_ok = debt_to_income <= max_dti
employment_ok = employment_years >= min_employment

# Decision
if credit_ok and income_ok and dti_ok and employment_ok:
    decision = "APPROVED"
    reason = "All criteria met"
elif not credit_ok:
    decision = "DENIED"
    reason = f"Credit score below {min_credit}"
elif not income_ok:
    decision = "DENIED"
    reason = f"Income below ${min_income:,}"
elif not dti_ok:
    decision = "DENIED"
    reason = f"Debt-to-income above {max_dti:.0%}"
else:
    decision = "DENIED"
    reason = f"Less than {min_employment} years employment"

print(f"Decision: {decision}")
print(f"Reason: {reason}")
```

---

### Exercise 2: Shipping Cost Calculator

**Goal**: Calculate shipping based on weight, destination, and priority.

```python
weight_kg = 2.5
destination = "international"
priority = True

# Base rates
if destination == "local":
    base_rate = 5.00
elif destination == "national":
    base_rate = 10.00
else:  # international
    base_rate = 25.00

# Weight surcharge
if weight_kg <= 1:
    weight_fee = 0
elif weight_kg <= 5:
    weight_fee = 5.00
else:
    weight_fee = 10.00

# Priority handling
priority_fee = 15.00 if priority else 0

# Total
total = base_rate + weight_fee + priority_fee

print(f"Base rate: ${base_rate:.2f}")
print(f"Weight fee: ${weight_fee:.2f}")
print(f"Priority: ${priority_fee:.2f}")
print(f"Total Shipping: ${total:.2f}")
```

---

### Exercise 3: Customer Tier Classifier

**Goal**: Classify customers based on spending and tenure.

```python
def classify_customer(annual_spend, years_active):
    """Classify customer tier based on spending and tenure."""
    
    # VIP: High spend OR long tenure with decent spend
    if annual_spend >= 10000 or (years_active >= 5 and annual_spend >= 5000):
        return "VIP"
    
    # Premium: Good spend
    if annual_spend >= 5000:
        return "Premium"
    
    # Regular: Some activity
    if annual_spend >= 1000:
        return "Regular"
    
    # Inactive
    return "Inactive"

# Test cases
customers = [
    ("Alice", 15000, 2),
    ("Bob", 3000, 7),
    ("Charlie", 6000, 1),
    ("Diana", 500, 3),
]

print("=== CUSTOMER CLASSIFICATION ===")
for name, spend, years in customers:
    tier = classify_customer(spend, years)
    print(f"{name}: ${spend:,} over {years}yr → {tier}")
```

---

## Mastery Check

### Question 1: Boolean Evaluation

What does this print?

```python
x = 5
if x > 3 and x < 10:
    print("A")
else:
    print("B")
```

<details>
<summary>Click for Answer</summary>

**Answer: `A`**

Both conditions are true: 5 > 3 is True, and 5 < 10 is True. True and True = True.

</details>

---

### Question 2: elif Behavior

What does this print?

```python
score = 95
if score >= 80:
    print("Good")
elif score >= 90:
    print("Excellent")
else:
    print("Needs work")
```

<details>
<summary>Click for Answer</summary>

**Answer: `Good`**

Even though score is 95 (>= 90), the first condition `score >= 80` is checked first and is True, so Python stops there. Order matters in elif chains!

**Fix**: Check the more specific condition first:

```python
if score >= 90:
    print("Excellent")
elif score >= 80:
    print("Good")
```

</details>

---

### Question 3: Truthy Values

What does this print?

```python
data = []
if data:
    print("Has data")
else:
    print("Empty")
```

<details>
<summary>Click for Answer</summary>

**Answer: `Empty`**

Empty lists are falsy in Python. `if data:` is equivalent to `if len(data) > 0:`.

</details>

---

### Question 4: Ternary Expression

Convert to a ternary expression:

```python
if temperature > 25:
    feeling = "hot"
else:
    feeling = "cold"
```

<details>
<summary>Click for Answer</summary>

```python
feeling = "hot" if temperature > 25 else "cold"
```

</details>

---

### Question 5: Design Scenario

**Scenario**: Design a function that determines shipping speed based on:

- Customer tier (regular, premium, vip)
- Order total
- Product availability (in-stock, backorder)

VIPs always get 1-day. Premium gets 2-day if order > $50. Regular gets 3-5 days. Backorder adds 5 days to everything.

<details>
<summary>Click for Answer</summary>

```python
def calculate_shipping_days(tier, order_total, availability):
    # Base days by tier
    if tier == "vip":
        base_days = 1
    elif tier == "premium" and order_total > 50:
        base_days = 2
    elif tier == "premium":
        base_days = 3
    else:
        base_days = 5
    
    # Add backorder delay
    delay = 5 if availability == "backorder" else 0
    
    total_days = base_days + delay
    
    return total_days

# Test
print(calculate_shipping_days("vip", 100, "in-stock"))      # 1
print(calculate_shipping_days("premium", 60, "in-stock"))   # 2
print(calculate_shipping_days("regular", 30, "backorder"))  # 10
```

</details>

---

## Summary

Today you learned:

- ✅ `if` statements control program flow based on conditions
- ✅ `elif` chains handle multiple mutually exclusive cases
- ✅ `and`, `or`, `not` combine or modify conditions
- ✅ Ternary expressions provide concise one-line conditions
- ✅ Order matters in elif chains—check specific cases first

**Tomorrow**: We'll explore **loops**—repeating actions without repeating code.

---

## Recurring Mini-Scenario Challenge: Retail Pulse Sales Tracker (Day 9)

Continue in `sales_tracker_phase1.py` by adding policy decisions.

**Challenge**
- Define policy rules with `if/elif/else`, such as:
  - `orders_count < 40` → `"LOW_TRAFFIC"`
  - `40-120` → `"NORMAL"`
  - `>120` → `"SURGE"`
- Apply rule classification to each day's dictionary.
- Flag discount eligibility when `LOW_TRAFFIC` and not weekend.

**Measurable output**
- Print one policy result line for the latest day: `"POLICY=<tier> | discount_action=True/False"`.

