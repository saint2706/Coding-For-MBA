# 📘 Day 15: Exception Handling - Building Robust Business Logic

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
[README.md](../../README.md) to set up your virtual environment and install the required libraries.

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

---

**Previous:** [Day 14 – Day 14: Modules - Organizing Your Business Logic](../Day_14_Modules/README.md) • **Next:** [Day 16 – Day 16: File Handling for Business Analytics](../Day_16_File_Handling/README.md)

_You are on lesson 15 of 108._

<!-- LESSON_FOOTER_END -->