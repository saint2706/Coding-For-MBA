---
title: "Day 9: Business Rules (Conditionals)"
tags:
  - Basics
  - Python
  - Logic
---

# 📘 Day 9: Business Rules (Conditionals)

## Managerial Relevance

Every business policy is a Conditional Statement:

- "_If_ order value > $100, free shipping."
- "_If_ customer is in Canada, add huge shipping fees, _else_ flat rate."
- "_If_ employee is Sales _and_ hit quota, give bonus."

In Python, `if`, `elif` (else if), and `else` let you codify these rules into automated logic trees.

## Key Concepts

- **`if`**: The gatekeeper. Checks a condition.
- **`elif`**: The alternative. Checked only if the previous `if` failed.
- **`else`**: The catch-all. Executed if nothing else matched.
- **Logical Operators**: `and`, `or`, `not` used to combine complex rules.

## Code Walkthrough

Open `conditionals.py`. We implement standard discount and HR policies.

1.  **`calculate_discount_percent()`**:
    - Checks cascading tiers.
    - Order Matters! If we checked `> 50` _before_ `> 100`, a $500 order would only get the 5% discount.

2.  **`calculate_shipping_cost()`**:
    - **Nested Logic**: An `if` inside an `if`.
    - First check Country. _Then_ check Weight.
    - This mirrors efficient decision trees.

3.  **`calculate_employee_bonus()`**:
    - Uses `and` / `or`.
    - `if department == "Sales" and performance >= 4`: Both must be true.

### Running the Code

```bash
python Day_09_Conditionals/conditionals.py
```

## 💻 Practice Exercises

Open `solutions.py`.

1.  **Credit Check**:
    - Input: `score = 750`.
    - If score > 700 print "Approved".
    - Else print "Rejected".

2.  **Inventory Warning**:
    - Input: `stock = 10`.
    - If stock < 20 print "Low Stock - Reorder".
    - `elif` stock > 100 print "Overstocked".
    - `else` print "Healthy".

3.  **VIP Access**:
    - Input: `is_member = True`, `age = 20`.
    - Rule: Must be member AND over 18.
    - Print result.

<!-- LESSON_FOOTER_START -->

---

**Previous:** [Day 08 – Dictionaries](../Day_08_Dictionaries/README.md) • **Next:** [Day 10 – Loops](../Day_10_Loops/README.md)

_You are on lesson 9 of 108._

<!-- LESSON_FOOTER_END -->
