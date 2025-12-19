---
title: 'Day 15: Exception Handling - Building Robust Business Logic'
tags:
  - BI
  - Basics
  - Python
---

In the real world, data is messy and operations can fail. A file might be missing, a user might
enter text instead of a number, or you might try to divide by zero when calculating a financial
ratio. Without a safety net, these errors—called **exceptions**—will crash your script.

**Exception handling** is the process of catching these errors and handling them gracefully so your
program can continue running or fail in a predictable way.

## Key Concepts: `try` and `except`

The core of exception handling is the `try...except` block.

- **`try` block:** You place the code that might cause an error inside the `try` block.
- **`except` block:** If an error occurs in the `try` block, the code inside the `except` block is
  executed, and the program does not crash.

```python
# A common business scenario: calculating profit margin
try:
    # This might cause a ZeroDivisionError if revenue is 0
    margin = (profit / revenue) * 100
    print(f"Profit margin is {margin:.2f}%")
except ZeroDivisionError:
    print("Cannot calculate margin: revenue is zero.")
```

You can also catch specific error types like `ValueError` (e.g., trying to convert "abc" to a
number) or `FileNotFoundError`.

## Environment Setup

Before you begin, ensure you have followed the setup instructions in the main
[README.md](https://github.com/saint2706/Coding-For-MBA/blob/main/README.md) to set up your virtual environment and install the required libraries.

## Exploring the Refactored Code

The script for this lesson, `exception.py`, has been refactored to place the logic into testable
functions that include exception handling.

1. **Review the Code:** Open `Day_15_Exception_Handling/exception.py`.
   - The `unpack_country_list()` function now includes a check to prevent errors with small lists.
   - The new `calculate_profit_margin()` function demonstrates how to handle a `ZeroDivisionError`
     and `TypeError` in a practical business calculation.
1. **Run the Script:** From the root directory of the project (`Coding-For-MBA`), run the script to
   see the functions handle both successful cases and errors gracefully:
   ```bash
   python Day_15_Exception_Handling/exception.py
   ```
1. **Run the Tests:** You can run the tests for this lesson to verify that the functions behave
   correctly, both with valid input and when exceptions are expected:
   ```bash
   pytest tests/test_day_15.py
   ```

## 💻 Exercises: Day 15

1. **Safe Division Function:**

   - In a new script (`my_solutions_15.py`), create a function
     `safe_divide(numerator, denominator)`.
   - Inside the function, use a `try...except` block to handle a potential `ZeroDivisionError`.
   - If division is successful, return the result.
   - If a `ZeroDivisionError` occurs, print an error message and return `0`.
   - Test your function by calling it with valid numbers (e.g., `10, 2`) and with a zero denominator
     (e.g., `10, 0`).

1. **User Input with Validation:**

   - Create a function `get_user_age()` that prompts the user to enter their age.
   - Use a `try...except` block to handle the `ValueError` that occurs if the user enters text
     instead of a number.
   - If the input is invalid, print an error message and return `None`.
   - If the input is valid, convert it to an integer and return it.

1. **File Reading with Error Handling:**

   - Create a function `read_file_contents(filepath)`.
   - Use a `try...except` block to handle a `FileNotFoundError`.
   - If the file is found, the function should read its contents and return them.
   - If the file is not found, it should print an error message and return `None`.
   - Test your function with a real file path and a fake one.

🎉 **Congratulations!** You've learned how to make your Python scripts more robust and reliable.
Exception handling is a critical skill for any data analyst or developer working with real-world
data.

<!-- LESSON_FOOTER_START -->

______________________________________________________________________

**Previous:** [Day 14 – Day 14: Modules - Organizing Your Business Logic](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_14_Modules/README.md) • **Next:** [Day 16 – Day 16: File Handling for Business Analytics](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_16_File_Handling/README.md)

_You are on lesson 15 of 108._

<!-- LESSON_FOOTER_END -->

## Additional Materials

- **exception.ipynb**
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_15_Exception_Handling/exception.ipynb){ .md-button }
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_15_Exception_Handling/exception.ipynb){ .md-button .md-button--primary }
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_15_Exception_Handling/exception.ipynb){ .md-button }
- **solutions.ipynb**
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_15_Exception_Handling/solutions.ipynb){ .md-button }
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_15_Exception_Handling/solutions.ipynb){ .md-button .md-button--primary }
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_15_Exception_Handling/solutions.ipynb){ .md-button }

???+ example "exception.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_15_Exception_Handling/exception.py)

    ```python title="exception.py"
    """
    Day 15: Handling Exceptions in Business Logic (Refactored)

    This script demonstrates exception handling and iterable unpacking
    with more practical, testable functions.
    """


    def unpack_country_list(countries):
        """
        Unpacks a list of countries into nordic countries, Estonia, and Russia.
        Uses a try-except block to handle cases where the list is too short.
        """
        if not isinstance(countries, list) or len(countries) < 3:
            return None, None, None

        try:
            # Extended iterable unpacking
            *nordic, estonia, russia = countries
            return nordic, estonia, russia
        except ValueError:
            # This would catch errors if the list had fewer than 2 items,
            # but the initial check makes it mostly for demonstration.
            return None, None, None


    def calculate_profit_margin(revenue, profit):
        """
        Calculates the profit margin and handles the case of zero revenue
        to avoid a ZeroDivisionError.
        """
        try:
            margin = (profit / revenue) * 100
            return margin
        except ZeroDivisionError:
            print("Error: Revenue is zero, cannot calculate profit margin.")
            return 0.0  # Return a sensible default
        except TypeError:
            print("Error: Invalid input, revenue and profit must be numbers.")
            return None


    def main():
        """Main function to demonstrate exception handling and unpacking."""
        # --- Example 1: Extended Iterable Unpacking ---
        print("--- Unpacking a List of Countries ---")
        country_names = [
            "Finland",
            "Sweden",
            "Norway",
            "Denmark",
            "Iceland",
            "Estonia",
            "Russia",
        ]

        nordic_list, estonia_country, russia_country = unpack_country_list(country_names)

        if nordic_list is not None:
            print("Nordic Countries:", nordic_list)
            print("Estonia:", estonia_country)
            print("Russia:", russia_country)
        print("-" * 20)

        # --- Example 2: Handling a ZeroDivisionError ---
        print("--- Calculating Profit Margin (with Error Handling) ---")

        # Successful case
        revenue1 = 500000
        profit1 = 75000
        margin1 = calculate_profit_margin(revenue1, profit1)
        print(f"Revenue: ${revenue1}, Profit: ${profit1} -> Margin: {margin1:.2f}%")

        # Error case
        revenue2 = 0
        profit2 = -10000  # A loss
        margin2 = calculate_profit_margin(revenue2, profit2)
        print(f"Revenue: ${revenue2}, Profit: ${profit2} -> Margin: {margin2:.2f}%")
        print("-" * 20)


    if __name__ == "__main__":
        main()
    ```

???+ example "solutions.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_15_Exception_Handling/solutions.py)

    ```python title="solutions.py"
    # Day 15: Exception Handling - Solutions

    ## Exercise 1: Handling a `ValueError`

    # Using example values for non-interactive execution
    # To run interactively, uncomment the input() line and comment the age = 25 line
    print("Exercise 1: Handling a ValueError")
    try:
        # age = int(input("Enter your age: "))
        age = 25  # Example value for automated testing
        print(f"You are {age} years old.")
    except ValueError:
        print("Invalid input. Please enter a numeric value for your age.")


    ## Exercise 2: Handling a `ZeroDivisionError`

    # Using example values for non-interactive execution
    # To run interactively, uncomment the input() lines and comment the num1/num2 lines
    print("\nExercise 2: Handling a ZeroDivisionError")
    try:
        # num1 = float(input("Enter the first number: "))
        # num2 = float(input("Enter the second number: "))
        num1 = 10.0  # Example value for automated testing
        num2 = 2.0  # Example value for automated testing
        result = num1 / num2
        print(f"The result of the division is: {result}")
    except ZeroDivisionError:
        print("Error: Cannot divide by zero.")
    except ValueError:
        print("Invalid input. Please enter numeric values.")


    ## Exercise 3: Refactor `exception.py`


    country_names = ["Finland"]

    try:
        *nordic_countries, estonia, russia = country_names

        print("Nordic Countries:", nordic_countries)
        print("Estonia:", estonia)
        print("Russia:", russia)

    except ValueError as e:
        if "not enough values to unpack" in str(e):
            print(
                f"Error: The list of countries must have at least two elements. Details: {e}"
            )
        else:
            print(f"A ValueError occurred: {e}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
    ```
