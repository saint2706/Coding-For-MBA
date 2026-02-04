---
title: 'Day 5: Managing Collections of Business Data with Lists'
tags:
  - BI
  - Basics
  - Data
  - Python
---

# 📘 Day 5: Managing Collections of Business Data with Lists

In business, you often work with collections of data: lists of customers, quarterly sales figures,
products, and more. Python's most fundamental tool for managing ordered collections is the **list**.

## What is a List?

A list is an ordered, changeable collection of items, created by placing items inside square
brackets `[]`.

```python
# A list of department names (strings)
departments = ["Sales", "Marketing", "Human Resources", "Engineering"]

# A list of quarterly sales figures (floats)
quarterly_sales = [120000.50, 135000.75, 110000.00, 145000.25]
```

## Key List Operations

- **Accessing Data:** Use an item's **index** (position starting from 0) to access it.
  `departments[0]` returns `"Sales"`. Negative indexing like `departments[-1]` gets the last item.
- **Slicing:** Get a sub-section of a list, like `quarterly_sales[0:2]` for the first two quarters.
- **Modifying Data:** Lists are dynamic. Key methods include:
  - `.append()`: Adds an item to the end.
  - `.remove()`: Removes the first item with a specified value.
  - `.sort()`: Sorts the list in place, which is great for ranking.

## Environment Setup

Before you begin, ensure you have followed the setup instructions in the main
[README.md](../../README.md) to set up your virtual environment and install the required libraries.

## Exploring the Refactored Code

The script for this lesson, `lists.py`, has been refactored into functions to make the logic for
each list operation reusable and testable.

1. **Review the Code:** Open `Day_05_Lists/lists.py`. Each list operation (e.g., `add_product()`,
   `analyze_team_sales()`) is now its own function. Notice that the functions return a *new* list
   rather than modifying the original, which is a good practice to avoid unexpected side effects.
1. **Run the Script:** From the root directory of the project (`Coding-For-MBA`), run the script to
   see the functions in action:
   ```bash
   python Day_05_Lists/lists.py
   ```
1. **Run the Tests:** You can run the tests for this lesson to verify the correctness of each
   function:
   ```bash
   pytest tests/test_day_05.py
   ```

## 💻 Exercises: Day 5

1. **Manage a Product List:**

   - In a new script (`my_solutions_05.py`), create a list of product names:
     `["Laptop", "Mouse", "Keyboard", "Monitor"]`.
   - A new product, "Webcam", is now in stock. Call the `add_product` function (you can import it)
     to get a new list with the webcam.
   - The "Mouse" is sold out. Call the `remove_product` function on your *new* list.
   - Print the final list of available products.

1. **Analyze Monthly Expenses:**

   - Create a function `analyze_expenses(expenses)` that takes a list of numbers.
   - The function should return a dictionary containing the `total_expenses`, `highest_expense`, and
     `lowest_expense`.
   - Call the function with a list like `[2200, 2350, 2600, 2130, 2190]` and print the results.

1. **Select Top Sales Performers:**

   - The `analyze_team_sales` function in `lists.py` already does this.
   - Import it into your script: `from Day_05_Lists.lists import analyze_team_sales`.
   - Call the function with a list of sales figures: `[5000, 8000, 4500, 12000, 6000, 11000]`.
   - Print the `top_3_sales` from the dictionary that the function returns.

🎉 **Great job!** Lists are the workhorse for storing collections of data in Python. Understanding
how to manage and analyze data within lists is a fundamental skill for any data analyst.

<!-- LESSON_FOOTER_START -->

______________________________________________________________________

**Previous:** [Day 04 – Day 4: Working with Text Data - Strings](../Day_04_Strings/README.md) • **Next:** [Day 06 – Day 6: Tuples - Storing Immutable Business Data](../Day_06_Tuples/README.md)

_You are on lesson 5 of 108._

<!-- LESSON_FOOTER_END -->
