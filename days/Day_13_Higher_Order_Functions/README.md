---
title: "Day 13: Higher-Order Functions & Lambda"
tags:
  - Basics
  - Python
---

# 📘 Day 13: Higher-Order Functions & Lambda

A **higher-order function** is a function that takes another function as an argument or returns a
function as its result. This is a powerful concept used heavily in data analysis for its conciseness
and flexibility.

## Key Higher-Order Functions

- **`map(function, iterable)`:** Applies a function to every item in an iterable (e.g., a list).
- **`filter(function, iterable)`:** Creates a new iterable containing only the items for which the
  function returns `True`.
- **`sorted(iterable, key=function)`:** Sorts an iterable. The `key` argument takes a function that
  specifies what to sort by.

## Lambda Functions: Quick, Anonymous Functions

A **lambda function** is a small, anonymous function defined with the `lambda` keyword. They are
perfect for use with higher-order functions when you need a simple, one-off function.

`lambda arguments: expression`

```python
# The 'for' loop way
new_salaries = []
for s in salaries:
    new_salaries.append(s * 1.10)

# The map and lambda way
new_salaries = list(map(lambda s: s * 1.10, salaries))
```

## Environment Setup

Before you begin, ensure you have followed the setup instructions in the main
[README.md](../../README.md) to set up your virtual environment and install the required libraries.

## Exploring the Refactored Code

The script for this lesson, `HOF.py`, has been refactored to place each higher-order function task
into its own testable function.

1. **Review the Code:** Open `Day_13_Higher_Order_Functions/HOF.py`. Notice the functions
   `apply_bonus_to_salaries()`, `filter_high_yield_projects()`, and `sort_products_by_attribute()`.
1. **Run the Script:** From the root directory of the project (`Coding-For-MBA`), run the script to
   see the functions in action:
   ```bash
   python Day_13_Higher_Order_Functions/HOF.py
   ```
1. **Run the Tests:** You can run the tests for this lesson to verify the correctness of each
   function:
   ```bash
   pytest tests/test_day_13.py
   ```

## 💻 Exercises: Day 13

1. **Standardize Department Names:**
   - In a new script (`my_solutions_13.py`), create a list of department names:
     `departments = ["Sales", " marketing ", "  Engineering", "HR  "]`.
   - Write a function that takes this list and uses `map` with a `lambda` function to return a new
     list where each name is cleaned (whitespace stripped) and converted to lowercase.
   - Call your function and print the result.

1. **Filter Active Subscriptions:**
   - You have a list of customer dictionaries (see below).
   - Import the `get_active_customer_names` function from the lesson script.
   - Call the function with the customer list and print the names of the active customers.
     ```python
     customers = [
         {"name": "Cust A", "subscription_status": "active"},
         {"name": "Cust B", "subscription_status": "inactive"},
         {"name": "Cust C", "subscription_status": "active"}
     ]
     ```

1. **Sort Complex Data:**
   - You have a list of product dictionaries.
   - Import the `sort_products_by_attribute` function.
   - Call the function twice: once to sort the products by `"price"` and once to sort them by
     `"name"`. Print both sorted lists.
     ```python
     products = [
         {"name": "Laptop", "price": 1200},
         {"name": "Mouse", "price": 25},
         {"name": "Keyboard", "price": 75}
     ]
     ```

🎉 **Congratulations!** Higher-order functions and lambdas are a gateway to a more powerful style of
programming that you will see everywhere in the world of data science.

<!-- LESSON_FOOTER_START -->

---

**Previous:** [Day 12 – Day 12: List Comprehension - Elegant Data Manipulation](../Day_12_List_Comprehension/README.md) • **Next:** [Day 14 – Day 14: Modules - Organizing Your Business Logic](../Day_14_Modules/README.md)

_You are on lesson 13 of 108._

<!-- LESSON_FOOTER_END -->
