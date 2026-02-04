---
title: 'Day 2: Storing and Analyzing Business Data'
tags:
  - BI
  - Basics
  - Data
  - Python
---

# 📘 Day 2: Storing and Analyzing Business Data

In Day 1, we performed basic calculations. Now, we'll learn how to store data in **variables** and
use Python's **built-in functions** to analyze it.

## What is a Variable?

A variable is a labeled container for information. Instead of using a raw number like `500000`, we
can store it in a variable called `revenue`, making our code more readable and manageable.

**`revenue = 500000`**

### Naming Conventions

- **Be Descriptive:** `quarterly_sales` is better than `qs`.
- **Use Snake Case:** Separate words with underscores, like `cost_of_goods_sold`.

## Built-in Functions: Your Basic Toolkit

Python includes pre-built functions for common tasks:

- `len()`: Finds the length (e.g., number of items in a list).
- `sum()`: Calculates the sum of numbers in a list.
- `min()` and `max()`: Find the minimum and maximum values.
- `round()`: Rounds a number to a specified number of decimal places.

## Environment Setup

Before you begin, ensure you have followed the setup instructions in the main
[README.md](../../README.md) to set up your virtual environment and install the required libraries.

## Exploring the Refactored Code

The script for this lesson, `variables.py`, has been refactored into functions to promote code reuse
and testability.

1. **Review the Code:** Open `Day_02_Variables_Builtin_Functions/variables.py`. Notice how the logic
   is now organized into functions like `display_company_profile()` and `analyze_weekly_sales()`.
1. **Run the Script:** From the root directory of the project (`Coding-For-MBA`), run the script:
   ```bash
   python Day_02_Variables_Builtin_Functions/variables.py
   ```
   You will see the output from the example scenarios defined at the bottom of the script.
1. **Run the Tests:** You can also run the tests for this lesson to see how we verify the functions'
   correctness:
   ```bash
   pytest tests/test_day_02.py
   ```

## 💻 Exercises: Day 2

1. **Company Profile Variables:**

   - In a new Python script (`my_solutions_02.py`), declare variables for a fictional company:
     `company_name`, `year_founded`, `current_revenue`, and `is_publicly_traded`.
   - Print each of these variables with a descriptive label.

1. **Sales Analysis:**

   - A list of sales transactions is: `[150.50, 200.00, 75.25, 300.75, 120.00]`.
   - Store these in a variable called `weekly_sales`.
   - Use built-in functions to calculate and print:
     - The total number of sales (`len()`).
     - The total revenue (`sum()`).
     - The smallest and largest sales (`min()`, `max()`).
     - The average sale amount.

1. **Profit Calculator Function:**

   - Create a function `calculate_profit(revenue, expenses)` that takes two numbers and returns the
     difference.
   - Call this function with some example numbers (e.g., `calculate_profit(50000, 35000)`) and print
     the result.

🎉 **Well done!** You've learned how to store data in variables and use Python's built-in functions
for analysis—foundational skills for everything that comes next.

<!-- LESSON_FOOTER_START -->

______________________________________________________________________

**Previous:** [Day 01 – Day 1: Python for Business Analytics - First Steps](../Day_01_Introduction/README.md) • **Next:** [Day 03 – Day 3: Operators - The Tools for Business Calculation and Logic](../Day_03_Operators/README.md)

_You are on lesson 2 of 108._

<!-- LESSON_FOOTER_END -->
