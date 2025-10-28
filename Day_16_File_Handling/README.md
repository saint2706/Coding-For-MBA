---
title: 'Day 16: File Handling for Business Analytics'
tags:
- BI
- Basics
- Python
---
# 📘 Day 16: File Handling for Business Analytics

A huge part of data analysis involves reading data from files and writing results to them. Whether
you're processing a sales report, a customer list, or log files, you need to interact with the file
system. Python makes this easy.

## Key Concepts

- **Opening Files:** Use the `open()` function to open a file. It's best practice to use it with a
  `with` statement, which automatically closes the file for you, even if errors occur.
  ```python
  with open('my_report.txt', 'r') as file:
      content = file.read()
  ```
- **File Modes:**
  - `'r'`: Read (default). Throws an error if the file doesn't exist.
  - `'w'`: Write. Creates a new file or overwrites an existing one.
  - `'a'`: Append. Adds content to the end of an existing file.
- **Exception Handling:** When working with files, it's crucial to wrap your code in a
  `try...except FileNotFoundError` block to handle cases where a file might be missing.

## Environment Setup

Before you begin, ensure you have followed the setup instructions in the main
[README.md](../../README.md) to set up your virtual environment and install the required libraries.

## Exploring the Refactored Code

The script for this lesson, `fh.py`, has been refactored to provide several powerful, reusable
functions for common business file-handling tasks.

1. **Review the Code:** Open `Day_16_File_Handling/fh.py`. Examine functions like
   `count_words_and_lines()`, `find_most_common_words()`, `extract_emails_from_file()`, and
   `analyze_sales_csv()`.
1. **Run the Script:** From the root directory of the project (`Coding-For-MBA`), run the script. It
   will create a few temporary demo files, run the analysis functions on them, print the results,
   and then clean up the files.
   ```bash
   python Day_16_File_Handling/fh.py
   ```
1. **Run the Tests:** The tests for this lesson are more advanced. They create temporary files in
   memory to test the functions without needing actual files on your disk.
   ```bash
   pytest tests/test_day_16.py
   ```

## 💻 Exercises: Day 16

1. **Analyze a Text File:**

   - In a new script (`my_solutions_16.py`), create a simple text file named `my_memo.txt` and write
     a few sentences into it.
   - Import the `count_words_and_lines` and `find_most_common_words` functions from the lesson
     script.
   - Call these functions with your new file's path and print the results.

1. **Process a Simple CSV:**

   - Create a function `create_sales_data(filepath, sales_data)` that takes a list of lists and
     writes it to a CSV file.
   - Your `sales_data` could be
     `[['Product', 'Price', 'Quantity'], ['Widget A', '10.00', '50'], ['Widget B', '15.50', '30']]`.
   - Import and use the `analyze_sales_csv` function from the lesson to read your new CSV and print
     the total revenue and average transaction value.

🎉 **Excellent!** You can now programmatically read from and write to the most common file types.
This is a fundamental skill for automating data intake, processing reports, and saving your
analysis.

<!-- LESSON_FOOTER_START -->

---

**Previous:** [Day 15 – Day 15: Exception Handling - Building Robust Business Logic](../Day_15_Exception_Handling/README.md) • **Next:** [Day 17 – Day 17: Regular Expressions for Text Pattern Matching](../Day_17_Regular_Expressions/README.md)

_You are on lesson 16 of 108._

<!-- LESSON_FOOTER_END -->