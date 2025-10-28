# 📘 Day 3: Operators - The Tools for Business Calculation and Logic

An **operator** is a symbol that tells the computer to perform a specific mathematical or logical
manipulation. For a business analyst, operators are the tools you'll use to calculate financial
metrics, compare results, and create business rules.

## Key Operator Types

- **Arithmetic Operators (`+`, `-`, `*`, `/`, `**`):** The foundation of any quantitative analysis,
  used for calculations like profit margin and compound interest.
- **Assignment Operators (`=`, `+=`, `-=`):** Used to assign and update values in variables, such as
  accumulating total sales.
- **Comparison Operators (`==`, `!=`, `>`, `<`):** Used to compare two values, resulting in `True`
  or `False`. This is the basis for filtering data and making decisions.
- **Logical Operators (`and`, `or`, `not`):** Used to combine conditional statements to create
  complex business rules, like determining bonus eligibility.

## Environment Setup

Before you begin, ensure you have followed the setup instructions in the main
[README.md](../../README.md) to set up your virtual environment and install the required libraries.

## Exploring the Refactored Code

The script for this lesson, `operators.py`, has been refactored into functions to make the logic
clear, reusable, and testable.

1. **Review the Code:** Open `Day_03_Operators/operators.py`. Each business calculation or rule
   (e.g., `calculate_compound_interest()`, `check_bonus_eligibility()`) is now its own function.
1. **Run the Script:** From the root directory of the project (`Coding-For-MBA`), run the script to
   see the functions in action:
   ```bash
   python Day_03_Operators/operators.py
   ```
1. **Run the Tests:** You can run the tests for this lesson to verify the correctness of each
   function:
   ```bash
   pytest tests/test_day_03.py
   ```

## 💻 Exercises: Day 3

1. **Calculate Net Profit Margin:**

   - In a new script (`my_solutions_03.py`), create a function
     `calculate_net_profit_margin(revenue, expenses)`.
   - The function should return the net profit margin (`(revenue - expenses) / revenue`).
   - Call the function with a `revenue` of 1,200,000 and `total_expenses` of 850,000.
   - Print the result formatted as a percentage with two decimal places.

1. **Inventory Check Function:**

   - Create a function
     `check_reorder_status(inventory_count, low_stock_threshold, reorder_threshold)`.
   - The function should return a dictionary with two keys: `is_low_stock` (boolean) and
     `needs_reorder` (boolean).
   - Call the function with an `inventory_count` of 45, a `low_stock_threshold` of 50, and a
     `reorder_threshold` of 25. Print the results.

1. **Sales Bonus Eligibility Function:**

   - The logic for bonus eligibility is already in the `check_bonus_eligibility` function in
     `operators.py`.
   - In your own script, import this function:
     `from Day_03_Operators.operators import check_bonus_eligibility`.
   - Call the function with a few different scenarios for `sales`, `years_of_service`, and
     `top_performer_last_quarter` to see the results.

🎉 **Excellent work!** You're now equipped with the operators needed to perform the vast majority of
business calculations and logical checks you'll encounter.
