---
title: "Day 10: Loops - Automating Repetitive Business Tasks"
tags:
  - BI
  - Basics
  - Python
---

# 📘 Day 10: Loops - Automating Repetitive Business Tasks

What if you have a list of 10,000 sales transactions? You won't write code for each one. This is
where **loops** come in. Loops allow you to perform the same action on every item in a collection,
automating what would otherwise be an impossibly tedious task.

## Key Loop Types

- **`for` loop:** The most common loop. It iterates over a sequence (like a list or dictionary) and
  executes a block of code for each item.
  ```python
  # Calculate total revenue from a list of sales
  total_revenue = 0
  for sale in monthly_sales:
      total_revenue += sale
  ```
- **`while` loop:** Runs as long as a certain condition is `True`. It's used when you don't know
  beforehand how many times you need to loop, such as in a simulation.

## Combining Loops and Conditionals

The real power comes from combining loops with `if` statements. This allows you to perform an action
on only the items that meet a certain criteria, which is the foundation of filtering and
transforming data.

```python
# Find all transactions over a certain amount
large_transactions = []
for amount in transactions:
    if amount > 500:
        large_transactions.append(amount)
```

## Environment Setup

Before you begin, ensure you have followed the setup instructions in the main
[README.md](../../README.md) to set up your virtual environment and install the required libraries.

## Exploring the Refactored Code

The script for this lesson, `loops.py`, has been refactored to place each looping task into its own
testable function.

1. **Review the Code:** Open `Day_10_Loops/loops.py`. Notice the functions
   `calculate_total_from_list()`, `filter_high_value_customers()`, and
   `simulate_investment_growth()`.
1. **Run the Script:** From the root directory of the project (`Coding-For-MBA`), run the script to
   see the functions in action:
   ```bash
   python Day_10_Loops/loops.py
   ```
1. **Run the Tests:** You can run the tests for this lesson to verify the correctness of each
   function:
   ```bash
   pytest tests/test_day_10.py
   ```

## 💻 Exercises: Day 10

1. **Calculate Average Employee Age:**
   - In a new script (`my_solutions_10.py`), create a list of employee dictionaries:
     `employees = [{"name": "Alice", "age": 30}, {"name": "Bob", "age": 45}, {"name": "Charlie", "age": 35}]`.
   - Create a function `calculate_average_age(employee_list)` that takes a list of employee
     dictionaries.
   - Inside the function, use a `for` loop to get the sum of all ages.
   - Return the average age (`total_age / number_of_employees`).
   - Call your function and print the result.

1. **Filter High-Priority Customers:**
   - You have a list of customer dictionaries (see `loops.py` for an example).
   - Import the `filter_high_value_customers` function from the lesson script.
   - Call the function with your list of customers and print the result.

1. **Inventory Stock Alert:**
   - You have a dictionary of product inventory:
     `inventory = {"Laptops": 15, "Mice": 150, "Keyboards": 45}`.
   - Import the `check_inventory_levels` function.
   - Call the function to get a list of low-stock items.
   - Loop through the returned list and print an alert for each item.

🎉 **Incredible!** The combination of loops and conditionals is the foundation of almost all data
processing and analysis tasks. You've completed the core structures of Python!

<!-- LESSON_FOOTER_START -->

---

**Previous:** [Day 09 – Day 9: Conditionals - Implementing Business Logic](../Day_09_Conditionals/README.md) • **Next:** [Day 11 – Day 11: Functions - Creating Reusable Business Tools](../Day_11_Functions/README.md)

_You are on lesson 10 of 108._

<!-- LESSON_FOOTER_END -->
