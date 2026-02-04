---
title: "Day 3: Financial Calculations (Operators)"
tags:
  - Basics
  - Python
  - Math
---

# 📘 Day 3: Financial Calculations (Operators)

## Managerial Relevance

Business is math. Profit margins, year-over-year growth, compound interest—these are all arithmetic operations.

Python's operators are more powerful than a standard calculator because they handle precedence (PEMDAS) unambiguously and can be part of automated pipelines. You're building the logic engine for your financial models today.

## Key Concepts

- **Arithmetic Operators:** `+` (Add), `-` (Subtract), `*` (Multiply), `/` (Divide).
- **Power Operator (`**`):** Exponents. `x \*\* 2` is $x^2$. Critical for compound interest formulas.
- **Modulus (`%`):** Returns the remainder. (e.g., `10 % 3` is `1`).
  - _Business Use Case:_ Batch sizing. If you have 100 items and boxes fit 12, `100 % 12` tells you how many loose items are left over.
- **Floor Division (`//`):** Divides and rounds down to the nearest whole number.
  - _Business Use Case:_ determining how many _full_ teams you can form from a pool of people.

## Code Walkthrough

Open `operators.py`. We perform a few standard financial ops.

1.  **`calculate_profit_margin()`**:
    - `(Revenue - Cost) / Revenue`.
    - Parentheses are vital here! Without them, Python would divide Cost/Revenue first.

2.  **`compound_interest()`**:
    - Formula: $A = P(1 + r)^t$
    - In Python: `Principal * (1 + rate) ** time`
    - This one line replaces complex Excel logic.

3.  **`logistics_planning()`**:
    - Uses `//` to find full shipments.
    - Uses `%` to find leftover stock.

### Running the Code

```bash
python Day_03_Operators/operators.py
```

## 💻 Practice Exercises

Open `solutions.py`.

1.  **VAT Calculation**:
    - Price = 100.
    - Tax Rate = 0.20 (20%).
    - Calculate `total_price`.

2.  **Even Split**:
    - You have a `$5000` bonus pool and `7` employees.
    - How much does each get (whole dollars)? Use `//`.
    - How much is left in the pool? Use `%`.

3.  **Growth Projection**:
    - Current Users: 1000.
    - Monthly Growth: 10% (1.10 multiplier).
    - Users in 6 months? `1000 * (1.10 ** 6)`.

<!-- LESSON_FOOTER_START -->

---

**Previous:** [Day 02 – Variables](../Day_02_Variables_Builtin_Functions/README.md) • **Next:** [Day 04 – Strings](../Day_04_Strings/README.md)

_You are on lesson 3 of 108._

<!-- LESSON_FOOTER_END -->
