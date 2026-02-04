---
phase: 1
title: "Algorithmic Thinking & Python Foundations"
days: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
totalDuration: 570
difficulty: "beginner"
---

# 🚀 Phase 1: Algorithmic Thinking & Python Foundations

> *"The journey of a thousand lines of code begins with a single `print()`."*

---

## Phase Summary

Welcome to the first major milestone of your programming journey! Over these 12 transformative days, you've evolved from "what is a variable?" to confidently wielding Python's core toolkit.

### What You've Accomplished

**Days 1-4: The Building Blocks**
You learned that programming is nothing more than giving precise instructions to a machine. You mastered variables (labeled containers), operators (the math and logic), and strings (text manipulation). You can now store data, perform calculations, and format output professionally.

**Days 5-8: Data Collections**
You progressed to collections—lists, tuples, sets, and dictionaries. Each serves a distinct purpose: lists for ordered, changeable sequences; tuples for immutable records; sets for uniqueness and fast lookups; dictionaries for key-value mappings. You now understand which tool to reach for in any situation.

**Days 9-10: Control Flow**
You taught your programs to think. Conditionals let code make decisions; loops let it repeat without repetition. Your programs can now respond to input, process batches, and handle complex business logic.

**Days 11-12: Abstraction**
You learned the art of functions—encapsulating logic into reusable blocks. Combined with list comprehensions, you can now write clean, Pythonic code that's both powerful and readable.

### Skills Unlocked

| Skill              | Capability                                    |
| ------------------ | --------------------------------------------- |
| **Data Types**     | int, float, str, bool, list, tuple, set, dict |
| **Operators**      | Arithmetic, comparison, logical, assignment   |
| **Control Flow**   | if/elif/else, for loops, while loops          |
| **Functions**      | Parameters, returns, scope, *args/**kwargs    |
| **Comprehensions** | List, dict, and set comprehensions            |

---

## The Expert's Toolkit

### Official Documentation
- [Python Official Tutorial](https://docs.python.org/3/tutorial/) — The authoritative beginner guide
- [Python Standard Library](https://docs.python.org/3/library/) — Reference for built-in functions and types

### Interactive Playgrounds
- [Python Tutor](https://pythontutor.com/) — Visualize code execution step-by-step
- [Replit](https://replit.com/) — Browser-based Python environment
- [Google Colab](https://colab.research.google.com/) — Free Jupyter notebooks in the cloud

### Practice Platforms
- [LeetCode Easy Problems](https://leetcode.com/problemset/?difficulty=EASY) — Algorithm practice
- [HackerRank Python Track](https://www.hackerrank.com/domains/python) — Skill certification path
- [Exercism Python](https://exercism.org/tracks/python) — Mentored code exercises

### Industry Resources
- [Real Python](https://realpython.com/) — High-quality tutorials and articles
- [PEP 8 Style Guide](https://peps.python.org/pep-0008/) — Python code formatting standards
- [Python Patterns](https://python-patterns.guide/) — Common design patterns

---

## Phase Milestone Exam

> ⚠️ **Synthetic Challenge Questions**  
> Each question requires combining knowledge from 3-4 days to solve.

---

### Question 1: The E-Commerce Cart

**Combines**: Lists (Day 5), Dictionaries (Day 8), Functions (Day 11), Conditionals (Day 9)

**Scenario**: Build a shopping cart system with the following requirements:

1. Products are stored as dictionaries with `name`, `price`, and `stock`
2. Cart is a list of tuples: `(product_name, quantity)`
3. Implement these functions:
   - `add_to_cart(cart, product, quantity)` — adds item if in stock
   - `calculate_total(cart, products)` — returns subtotal
   - `apply_discount(total, membership_tier)` — tiers: bronze (5%), silver (10%), gold (15%)

**Sample Data**:
```python
products = {
    "laptop": {"name": "Laptop Pro", "price": 999.99, "stock": 10},
    "mouse": {"name": "Wireless Mouse", "price": 29.99, "stock": 50},
    "keyboard": {"name": "Mechanical Keyboard", "price": 79.99, "stock": 25}
}
```

**Expected Behavior**:
```python
cart = []
add_to_cart(cart, "laptop", 2)
add_to_cart(cart, "mouse", 3)
total = calculate_total(cart, products)
final = apply_discount(total, "silver")
# Should correctly calculate: (999.99*2 + 29.99*3) * 0.90
```

<details>
<summary>💡 Hints</summary>

1. Use `in` to check if product exists in products dictionary
2. Compare requested quantity against product's stock
3. For discount, use a dictionary to map tier names to percentages
4. Handle edge cases: empty cart, invalid product, insufficient stock

</details>

---

### Question 2: The Data Cleaning Pipeline

**Combines**: Strings (Day 4), Sets (Day 7), Functions (Day 11), List Comprehensions (Day 12)

**Scenario**: You receive messy customer data that needs cleaning.

**Input Data**:
```python
raw_customers = [
    "  JOHN DOE, john.doe@email.com, 555-123-4567  ",
    "jane smith, JANE@COMPANY.ORG, 555.987.6543",
    "Bob Wilson, bob@test.com, 555-123-4567",  # Duplicate phone
    "  alice jones, alice@email.com, invalid-phone",
    "john doe, johndoe@email.com, 555-111-2222"  # Duplicate name
]
```

**Requirements**:
1. `parse_customer(raw_string)` → Returns dict with `name`, `email`, `phone`
2. `clean_name(name)` → Title case, trimmed
3. `clean_email(email)` → Lowercase, trimmed
4. `clean_phone(phone)` → Numbers only, valid if 10 digits
5. `find_duplicates(customers)` → Returns set of duplicate names

**Expected Output**:
```python
customers = [parse_customer(r) for r in raw_customers]
valid_customers = [c for c in customers if c["phone"]]
unique_names = {c["name"] for c in valid_customers}
```

<details>
<summary>💡 Hints</summary>

1. Use `.split(",")` to separate fields
2. Use `.strip().title()` for names
3. Use comprehension to filter only digits from phone
4. Use a set to track seen names and identify duplicates

</details>

---

### Question 3: The Sales Analytics Dashboard

**Combines**: Loops (Day 10), Dictionaries (Day 8), Conditionals (Day 9), Tuples (Day 6)

**Scenario**: Build analytics functions for monthly sales data.

**Input Data**:
```python
sales_log = [
    ("2024-01-15", "North", "Electronics", 1200),
    ("2024-01-18", "South", "Clothing", 450),
    ("2024-01-22", "North", "Electronics", 890),
    ("2024-02-10", "West", "Electronics", 2100),
    ("2024-02-15", "North", "Clothing", 780),
    ("2024-02-20", "South", "Electronics", 1350),
    # ... more entries
]
```

**Requirements**:
1. `total_by_region(sales)` → Dict mapping region to total sales
2. `top_category(sales)` → Returns (category_name, total_amount)
3. `monthly_growth(sales)` → Dict of month to growth percentage from previous
4. `filter_sales(sales, min_amount=None, region=None, category=None)` → Filtered list

**Expected Usage**:
```python
by_region = total_by_region(sales_log)
# {"North": 2870, "South": 1800, "West": 2100}

best = top_category(sales_log)
# ("Electronics", 5540)

big_north = filter_sales(sales_log, min_amount=1000, region="North")
# Only entries from North with amount >= 1000
```

<details>
<summary>💡 Hints</summary>

1. Use defaultdict(float) for aggregation
2. Unpack tuples: `for date, region, category, amount in sales:`
3. Extract month from date: `date[:7]` gives "2024-01"
4. For filtering, use `and` to combine multiple conditions

</details>

---

### Question 4: The Password Policy Enforcer

**Combines**: Strings (Day 4), Functions (Day 11), Conditionals (Day 9), Operators (Day 3)

**Scenario**: Implement a configurable password validation system.

**Requirements**:
```python
class PasswordPolicy:
    def __init__(self, min_length=8, require_upper=True, 
                 require_lower=True, require_digit=True, 
                 require_special=False, special_chars="!@#$%^&*"):
        # Store configuration
        pass
    
    def validate(self, password):
        """
        Returns (is_valid: bool, errors: list)
        errors is empty if valid, otherwise contains failure reasons
        """
        pass
    
    def strength_score(self, password):
        """
        Returns score 0-100 based on:
        - Length (up to 20 points)
        - Character variety (up to 40 points)
        - No common patterns (up to 40 points)
        """
        pass
```

**Common Patterns to Detect**:
- Sequential numbers: "123", "456"
- Repeated characters: "aaa", "111"
- Keyboard patterns: "qwerty", "asdf"

**Expected Behavior**:
```python
policy = PasswordPolicy(min_length=10, require_special=True)

valid, errors = policy.validate("short")
# (False, ["Password must be at least 10 characters", 
#          "Password must contain a special character"])

valid, errors = policy.validate("SecureP@ss123")
# (True, [])

score = policy.strength_score("SecureP@ssw0rd!")
# 85 (example score)
```

<details>
<summary>💡 Hints</summary>

1. Use `any(c.isupper() for c in password)` to check for uppercase
2. Store requirements in a list of (condition, error_message) tuples
3. For patterns, use string slicing to check substrings
4. Weight the score based on how many criteria are exceeded, not just met

</details>

---

## Completion Checklist

Before moving to Phase 2, ensure you can:

- [ ] Create and use all basic data types
- [ ] Choose the right collection (list vs tuple vs set vs dict)
- [ ] Write conditional logic with multiple branches
- [ ] Use both `for` and `while` loops appropriately
- [ ] Define functions with parameters and return values
- [ ] Write clean list comprehensions
- [ ] Debug code by reading error messages
- [ ] Follow PEP 8 naming conventions

---

**Congratulations on completing Phase 1!** 🎉

You've built a solid foundation. In **Phase 2**, you'll learn to organize larger programs with modules, handle errors gracefully, and work with powerful data manipulation libraries.
