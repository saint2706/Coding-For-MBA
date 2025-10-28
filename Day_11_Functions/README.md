---
title: 'Day 11: Functions - Creating Reusable Business Tools'
tags:
  - BI
  - Basics
  - Python
---

# 📘 Day 11: Functions - Creating Reusable Business Tools

As you perform more complex analysis, you'll write the same code repeatedly. **Functions** are
named, reusable blocks of code that perform a specific task, helping you avoid repetition and write
cleaner, more maintainable code.

## Key Function Concepts

- **Definition (`def`):** You define a function using the `def` keyword.
- **Parameters:** Inputs to your function that allow you to pass data to it (e.g., `revenue`,
  `expenses`).
- **`return` Statement:** Sends a value *back* from the function, so you can use the result in other
  parts of your code.
- **Type Hinting:** A modern Python feature that lets you specify the expected data types for
  parameters and the return value (e.g., `def get_net_profit(revenue: float) -> float:`). This
  improves code clarity and helps prevent bugs.

## Environment Setup

Before you begin, ensure you have followed the setup instructions in the main
[README.md](../../README.md) to set up your virtual environment and install the required libraries.

## Exploring the Refactored Code

The script for this lesson, `functions.py`, is already well-structured, with each piece of business
logic encapsulated in its own function. We've made a minor improvement by wrapping the example usage
in a `main()` function, which is a standard convention.

1. **Review the Code:** Open `Day_11_Functions/functions.py`. Examine the different functions like
   `get_net_profit()`, `calculate_commission()`, and `format_currency()`.
1. **Run the Script:** From the root directory of the project (`Coding-For-MBA`), run the script to
   see the functions in action:
   ```bash
   python Day_11_Functions/functions.py
   ```
1. **Run the Tests:** You can run the tests for this lesson to verify the correctness of each
   function:
   ```bash
   pytest tests/test_day_11.py
   ```

## 💻 Exercises: Day 11

1. **Commission Calculator Function:**

   - The `calculate_commission` function is already created in `functions.py`.
   - In a new script (`my_solutions_11.py`), import this function:
     `from Day_11_Functions.functions import calculate_commission`.
   - Call the function with a sample sales amount and print the returned commission.

1. **Employee Bonus Eligibility Function:**

   - Import the `is_eligible_for_bonus` function.
   - Call the function with a few different scenarios for `performance_rating` and
     `years_of_service` and print the `True`/`False` results.

1. **Advanced Currency Formatter:**

   - Create a new function `format_currency_with_symbol(amount, symbol='$')`.
   - This function should take an amount and an optional `symbol` parameter that defaults to `'$'`.
   - It should return a formatted string like `€1,250.50` if the symbol is `'€'`.
   - Test your new function by calling it with and without the `symbol` parameter.

🎉 **Great work!** Functions are the key to writing clean, organized, and professional code. By
packaging your logic into reusable tools, you're moving from a simple scripter to a true programmer.

<!-- LESSON_FOOTER_START -->

______________________________________________________________________

**Previous:** [Day 10 – Day 10: Loops - Automating Repetitive Business Tasks](../Day_10_Loops/README.md) • **Next:** [Day 12 – Day 12: List Comprehension - Elegant Data Manipulation](../Day_12_List_Comprehension/README.md)

_You are on lesson 11 of 108._

<!-- LESSON_FOOTER_END -->
