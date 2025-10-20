As your projects grow, you need a way to organize your code. In Python, we do this with **modules**. A module is simply a Python file (`.py`) containing functions and variables. By grouping related functions into modules, you create a clean, maintainable, and scalable project.

## Why Use Modules?

- **Organization:** Keeps related code together (e.g., all financial calculations in `financials.py`).
- **Reusability:** Import your custom modules into any project.
- **Readability:** Makes your main script shorter and easier to understand.

## How to Import Modules

**1. Import the entire module (recommended):**
This is the most common way. You access functions using the `module_name.function_name` syntax.

```python
import business_logic as bl
roi = bl.calculate_roi(50000, 10000)
```

**2. Import a specific function:**
If you only need one or two functions from a large module.

```python
from business_logic import calculate_roi
roi = calculate_roi(50000, 10000)
```

## Python's Built-in Modules

Python comes with a huge **Standard Library** of built-in modules, including:

- `math`: For advanced mathematical functions (`math.sqrt()`).
- `datetime`: Essential for working with dates and times.
- `random`: For generating random numbers (useful for sampling).

## Environment Setup

Before you begin, ensure you have followed the setup instructions in the main [README.md](https://github.com/saint2706/Coding-For-MBA/blob/main/README.md) to set up your virtual environment and install the required libraries.

## Exploring the Refactored Code

The code for this lesson is split into two files:

- `business_logic.py`: A module containing reusable functions.
- `modules.py`: The main script that imports and uses the `business_logic` module.

We have refactored `modules.py` to wrap its logic in functions and deleted a redundant, unused module file.

1. **Review the Code:** Open both `Day_14_Modules/business_logic.py` and `Day_14_Modules/modules.py`. See how the main script imports and uses the functions defined in the module.
1. **Run the Script:** From the root directory of the project (`Coding-For-MBA`), run the main script:
   ```bash
   python Day_14_Modules/modules.py
   ```
1. **Run the Tests:** You can run the tests for this lesson to verify the correctness of the functions in the `business_logic` module:
   ```bash
   pytest tests/test_day_14.py
   ```

## 💻 Exercises: Day 14

1. **Create Your Own Module:**

   - Create a new file named `text_tools.py`.
   - Inside this file, define a function `count_characters(text)` that returns the length of a string.
   - Create a second file, `main_report.py`.
   - In `main_report.py`, import your `text_tools` module and use your function to count the characters in a sample sentence.

1. **Use the `datetime` Module:**

   - In a new script, `import` the `datetime` module.
   - Get the current date and time using `datetime.datetime.now()`.
   - Print the current date.
   - Print just the current year from the date object (e.g., `my_date.year`).

1. **Use the `math` Module:**

   - A company's sales are growing by the square root of its marketing budget.
   - `import` the `math` module.
   - Create a variable `marketing_budget = 100000`.
   - Use `math.sqrt()` to calculate the growth factor and print the result.

🎉 **Well done!** You've learned how to organize your code into modules. This is a critical skill for building any project that's more than a few dozen lines long.

## Additional Materials

- **business_logic.ipynb**  
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_14_Modules/business_logic.ipynb){ .md-button } 
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_14_Modules/business_logic.ipynb){ .md-button .md-button--primary } 
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_14_Modules/business_logic.ipynb){ .md-button }
- **modules.ipynb**  
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_14_Modules/modules.ipynb){ .md-button } 
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_14_Modules/modules.ipynb){ .md-button .md-button--primary } 
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_14_Modules/modules.ipynb){ .md-button }
- **solutions.ipynb**  
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_14_Modules/solutions.ipynb){ .md-button } 
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_14_Modules/solutions.ipynb){ .md-button .md-button--primary } 
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_14_Modules/solutions.ipynb){ .md-button }

???+ example "business_logic.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_14_Modules/business_logic.py)

    ```python title="business_logic.py"
    """
    Day 14: Business Logic Module

    This file acts as a module containing various reusable functions
    for common business calculations and validations.
    """


    def calculate_roi(investment: float, profit: float) -> float:
        """Calculates the Return on Investment (ROI)."""
        if investment == 0:
            return 0
        return (profit / investment) * 100


    def calculate_future_value(principal: float, rate: float, years: int) -> float:
        """Calculates the future value of an investment with annual compounding."""
        return principal * ((1 + rate) ** years)


    def is_eligible_for_promotion(years_of_service: int, performance_rating: int) -> bool:
        """Checks if an employee is eligible for promotion."""
        # Rule: Must have > 3 years of service and a performance rating of 4 or 5.
        return years_of_service > 3 and performance_rating >= 4


    def format_as_currency(amount: float) -> str:
        """Formats a number into a standard currency string."""
        return f"${amount:,.2f}"
    ```

???+ example "finance_tools.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_14_Modules/finance_tools.py)

    ```python title="finance_tools.py"
    """
    Finance Tools Module - Alias for business_logic module

    This module provides backward compatibility for scripts that import
    finance_tools instead of business_logic.
    """

    from business_logic import (
        calculate_future_value,
        calculate_roi,
        format_as_currency,
        is_eligible_for_promotion,
    )

    __all__ = [
        "calculate_roi",
        "calculate_future_value",
        "is_eligible_for_promotion",
        "format_as_currency",
    ]
    ```

???+ example "modules.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_14_Modules/modules.py)

    ```python title="modules.py"
    """
    Day 14: Using Modules to Organize Code (Refactored)

    This script demonstrates how to import and use functions from
    both custom-built modules and Python's built-in modules.
    """

    # We are importing the functions we created in the 'business_logic.py' file.
    # We use an alias 'bl' to keep our code clean and concise.
    import datetime
    import math

    import business_logic as bl


    def demonstrate_custom_module():
        """Demonstrates using functions from the custom business_logic module."""
        print("--- Using Custom Business Logic Module ---")
        investment_amount = 50000
        profit_amount = 12000
        roi = bl.calculate_roi(investment_amount, profit_amount)
        print(
            f"A project with an investment of {bl.format_as_currency(investment_amount)} and profit of {bl.format_as_currency(profit_amount)} has an ROI of {roi:.2f}%."
        )

        years = 4
        rating = 5
        is_eligible = bl.is_eligible_for_promotion(years, rating)
        print(
            f"An employee with {years} years of service and a rating of {rating} is eligible for promotion: {is_eligible}"
        )
        print("-" * 20)


    def demonstrate_builtin_modules():
        """Demonstrates using Python's built-in datetime and math modules."""
        print("--- Using Built-in 'datetime' and 'math' Modules ---")
        current_datetime = datetime.datetime.now()
        print(f"Current Date and Time: {current_datetime}")
        print(f"Current Year: {current_datetime.year}")
        print()

        marketing_budget = 100000
        growth_factor = math.sqrt(marketing_budget)
        print(
            f"The growth factor for a marketing budget of {bl.format_as_currency(marketing_budget)} is {growth_factor:.2f}."
        )
        print("-" * 20)


    def main():
        """Main function to demonstrate module usage."""
        demonstrate_custom_module()
        demonstrate_builtin_modules()


    if __name__ == "__main__":
        main()
    ```

???+ example "solutions.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_14_Modules/solutions.py)

    ```python title="solutions.py"
    """Day 14: Solutions to Exercises."""

    import datetime
    import math

    import finance_tools as ft

    # --- Exercise 1: Create a Finance Module ---
    print("--- Solution to Exercise 1 ---")

    # --- Call functions from the module ---
    investment = 150000
    profit = 25000
    roi = ft.calculate_roi(investment, profit)
    print(
        f"ROI for a ${investment:,.2f} investment with ${profit:,.2f} profit is: {roi:.2f}%"
    )

    principal = 10000
    rate = 0.05
    years = 10
    future_value = ft.calculate_future_value(principal, rate, years)
    print(
        f"Future value of ${principal:,.2f} after {years} years at a {rate * 100}% rate is: ${future_value:,.2f}"
    )
    print("-" * 20)


    # --- Exercise 2: Use the `datetime` Module ---
    print("--- Solution to Exercise 2 ---")
    # import the module

    # Get the current date and time
    now = datetime.datetime.now()

    print(f"Current full date and time: {now}")
    print(f"Current date only: {now.date()}")
    print(f"Current year: {now.year}")
    print(f"Current month: {now.month}")
    print(f"Current day: {now.day}")
    print("-" * 20)


    # --- Exercise 3: Use the `math` Module ---
    print("--- Solution to Exercise 3 ---")
    # import the module

    marketing_budget = 100000
    # Use the sqrt function from the math module
    growth_factor = math.sqrt(marketing_budget)

    print(
        f"The growth factor for a marketing budget of ${marketing_budget:,.2f} is {growth_factor:.2f}."
    )
    print("-" * 20)
    ```
