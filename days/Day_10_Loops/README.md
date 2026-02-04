---
title: "Day 10: Automation (Loops)"
tags:
  - Basics
  - Python
  - Automation
---

# 📘 Day 10: Automation (Loops)

## Managerial Relevance

The defining difference between a manual worker and an automated system is **Loops**.
Instead of calculating payroll for one employee, you write a loop to calculate it for _all_ employees.
Instead of checking one stock price, you loop through the S&P 500.

- **`for` loops**: "Do this for every item in this list." (Defined end point).
- **`while` loops**: "Do this as long as this condition is true." (Undefined end point, like simulations).

## Key Concepts

- **Iteration**: The process of going through a collection one by one.
- **Accumulator Pattern**: Starting with `total = 0`, looping, and adding to it (`total += price`).
- **Filtering**: Looping through data and only keeping items that meet an `if` condition.

## Code Walkthrough

Open `loops.py`.

1.  **`calculate_total_from_list()`**:
    - The classic "Sum" algorithm.
    - We initialize a total, visit every number, and add it up.

2.  **`filter_high_value_customers()`**:
    - Loops through a list of dictionaries (customer records).
    - Checks `if spent > 2000`.
    - Appends the name to a new list.
    - _Result:_ An extracted segment of VIPs.

3.  **`simulate_investment_growth()`**:
    - A **While Loop**.
    - "Keep adding interest _until_ my money doubles."
    - We don't know if it will take 5 years or 15 years, so a `while` loop is perfect.

### Running the Code

```bash
python Day_10_Loops/loops.py
```

## 💻 Practice Exercises

Open `solutions.py`.

1.  **Daily Revenue**:
    - `sales = [500, 600, 200]`.
    - Loop through and print each sale with a "$" sign.

2.  **Find the Error**:
    - `transactions = [100, -50, 200, -20]`.
    - Loop through and print "Refund Alert" if the number is negative.

3.  **Countdown**:
    - Start `n = 5`.
    - While `n > 0`, print `n` and subtract 1.
    - Print "Launch!" at the end.

<!-- LESSON_FOOTER_START -->

---

**Previous:** [Day 09 – Conditionals](../Day_09_Conditionals/README.md) • **Next:** [Day 11 – Functions](../Day_11_Functions/README.md)

_You are on lesson 10 of 108._

<!-- LESSON_FOOTER_END -->
