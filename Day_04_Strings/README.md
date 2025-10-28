# 📘 Day 4: Working with Text Data - Strings

In business analytics, text data is everywhere—customer names, product reviews, addresses, and
report narratives. In Python, we handle text using **strings**.

## Key String Concepts

- **F-Strings:** The modern and most readable way to format strings. They let you embed variables
  and expressions directly inside a string.
  ```python
  report_summary = f"Company: {company_name}, Revenue: ${revenue}"
  ```
- **String Methods:** Built-in functions attached to strings that let you manipulate them. They are
  essential for data cleaning and preparation.

| Method | Description | Business Use Case | | :------------- |
:\------------------------------------------------- | :------------------------------------ | |
`.lower()`/`.upper()` | Converts case. | Standardizing categories. | | `.strip()` | Removes
whitespace from the beginning and end. | Cleaning user-entered data. | | `.replace()` | Replaces a
substring with another. | Correcting or reformatting data. | | `.split()` | Splits the string into a
list of substrings. | Parsing comma-separated data. | | `.startswith()`| Checks if the string starts
with a substring. | Identifying invoice numbers. | | `.endswith()` | Checks if the string ends with
a substring. | Checking file types. |

## Environment Setup

Before you begin, ensure you have followed the setup instructions in the main
[README.md](../../README.md) to set up your virtual environment and install the required libraries.

## Exploring the Refactored Code

The script for this lesson, `strings.py`, has been refactored into functions to make each string
manipulation a reusable and testable unit of logic.

1. **Review the Code:** Open `Day_04_Strings/strings.py`. Each data transformation (e.g.,
   `generate_report_header()`, `clean_and_format_name()`) is now its own function.
1. **Run the Script:** From the root directory of the project (`Coding-For-MBA`), run the script to
   see the functions in action:
   ```bash
   python Day_04_Strings/strings.py
   ```
1. **Run the Tests:** You can run the tests for this lesson to verify the correctness of each
   function:
   ```bash
   pytest tests/test_day_04.py
   ```

## 💻 Exercises: Day 4

1. **Generate a Report Header:**

   - In a new script (`my_solutions_04.py`), create a function `format_report_title(title, date)`.
   - The function should take a title string and a date string and return a formatted header like:
     `--- MONTHLY MARKETING REPORT: 2024-07 ---`.
   - Call the function and print the result.

1. **Clean Up Product Codes:**

   - You have a list of raw product codes: `[" prod-001 ", "prod-002", " Prod-003 "]`.
   - Create a function `clean_product_codes(codes)` that takes a list of codes.
   - Inside the function, loop through the list, and for each code, remove whitespace and convert it
     to uppercase.
   - The function should return a new list of cleaned codes.
   - Call the function and print the cleaned list.

1. **Validate Email Addresses:**

   - Create a function `is_valid_email(email)` that performs two simple checks:
     - Does the email contain an `@` symbol?
     - Does the email end with `.com`?
   - The function should return `True` if both conditions are met, otherwise `False`.
   - Test your function with a valid email (`"test@example.com"`) and an invalid one
     (`"test-example.com"`).

🎉 **Fantastic!** You can now manipulate text data, which is a massive part of any real-world data
analysis task. Cleaning, formatting, and parsing strings are skills you'll use every single day.

<!-- LESSON_FOOTER_START -->

---

**Previous:** [Day 03 – Day 3: Operators - The Tools for Business Calculation and Logic](../Day_03_Operators/README.md) • **Next:** [Day 05 – Day 5: Managing Collections of Business Data with Lists](../Day_05_Lists/README.md)

_You are on lesson 4 of 108._

<!-- LESSON_FOOTER_END -->