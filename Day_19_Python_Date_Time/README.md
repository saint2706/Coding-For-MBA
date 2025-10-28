---
title: 'Day 19: Working with Dates and Times'
tags:
- Basics
- Python
---
# 📘 Day 19: Working with Dates and Times

Time-series analysis is at the heart of business analytics. Whether you're tracking daily sales,
monthly user growth, or quarterly financial results, you need to work with dates and times. Python's
built-in `datetime` module is the standard tool for these tasks.

## Key `datetime` Concepts

- **`datetime.now()`:** Gets the current date and time as a `datetime` object.
- **`strftime(format_code)`:** **Str**ing **F**rom **Time**. Formats a `datetime` object into a
  string according to a specific format code (e.g., `"%Y-%m-%d"`).
- **`strptime(string, format_code)`:** **Str**ing **P**arse **Time**. Parses a string into a
  `datetime` object based on a specific format code. This is crucial for converting text-based dates
  into a usable format.
- **`timedelta`:** Represents the difference between two dates or times.

## Environment Setup

Before you begin, ensure you have followed the setup instructions in the main
[README.md](../../README.md) to set up your virtual environment and install the required libraries.

## Exploring the Refactored Code

The script for this lesson, `date_time.py`, has been refactored to place each date/time operation
into its own testable function.

1. **Review the Code:** Open `Day_19_Python_Date_Time/date_time.py`. Examine functions like
   `get_current_datetime_components()`, `format_datetime_to_string()`, `parse_string_to_datetime()`,
   and `calculate_date_difference()`.
1. **Run the Script:** From the root directory of the project (`Coding-For-MBA`), run the script to
   see the functions in action:
   ```bash
   python Day_19_Python_Date_Time/date_time.py
   ```
1. **Run the Tests:** You can run the tests for this lesson to verify the correctness of each
   function:
   ```bash
   pytest tests/test_day_19.py
   ```

## 💻 Exercises: Day 19

1. **Format the Current Date:**

   - In a new script (`my_solutions_19.py`), import the `datetime` object from the `datetime`
     module.
   - Get the current date and time.
   - Use the `strftime` method to format it into a string like `"Today is 24 September, 2025"`.
   - Print the result.

1. **Calculate Days Until a Deadline:**

   - Create a function `days_until(deadline_str)` that takes a date string in `"YYYY-MM-DD"` format.
   - Inside the function, get today's date (`date.today()`) and parse the deadline string into a
     `date` object.
   - Calculate the difference and return the number of days.
   - Call your function with a future date and print the result.

1. **Parse a Log File Timestamp:**

   - You have a timestamp from a log file as a string: `"Log entry: 2023-03-15 10:30:00"`.
   - Import the `parse_string_to_datetime` function from the lesson.
   - The timestamp part starts at index 13. Use string slicing to extract just the date/time part
     (`"2023-03-15 10:30:00"`).
   - Call the function with the extracted string and the correct format code (`"%Y-%m-%d %H:%M:%S"`)
     and print the resulting `datetime` object.

🎉 **Congratulations!** You've learned how to work with dates and times in Python. You're now ready
to tackle time-series analysis and other time-based calculations.

<!-- LESSON_FOOTER_START -->

---

**Previous:** [Day 18 – Day 18: Classes and Objects - Modeling Business Concepts](../Day_18_Classes_and_Objects/README.md) • **Next:** [Day 20 – Day 20: Python Package Manager (pip) & Third-Party Libraries](../Day_20_Python_Package_Manager/README.md)

_You are on lesson 19 of 108._

<!-- LESSON_FOOTER_END -->