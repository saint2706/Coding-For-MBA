---
title: 'Day 17: Regular Expressions for Text Pattern Matching'
tags:
  - Basics
  - NLP
  - Python
---

# 📘 Day 17: Regular Expressions for Text Pattern Matching

Often, the text data you need to analyze isn't perfectly structured. You might need to find all the
invoice numbers in a document, extract all email addresses from a messy text block, or validate that
a product code follows a specific format. For these tasks, we use **regular expressions** (regex).

## What is a Regular Expression?

A regular expression is a special sequence of characters that defines a search pattern. It's like a
mini-language for finding and manipulating text. While it can look intimidating at first, a few key
patterns can solve most common business problems.

- `\d+`: Matches one or more digits (e.g., `123`).
- `[a-z]+`: Matches one or more lowercase letters.
- `\s`: Matches a whitespace character.
- `\b`: Matches a word boundary.
- `[]`: Defines a character set (e.g., `[abc]` matches 'a', 'b', or 'c').
- `[^...]`: Matches anything *not* in the character set.

## Environment Setup

Before you begin, ensure you have followed the setup instructions in the main
[README.md](../../README.md) to set up your virtual environment and install the required libraries.

## Exploring the Refactored Code

The script for this lesson, `regex.py`, has been refactored to place each regex task into its own
testable function.

1. **Review the Code:** Open `Day_17_Regular_Expressions/regex.py`. Examine functions like
   `find_most_common_words()`, `extract_and_analyze_numbers()`, `is_valid_python_variable()`, and
   `clean_text_advanced()`.
1. **Run the Script:** From the root directory of the project (`Coding-For-MBA`), run the script to
   see the functions in action:
   ```bash
   python Day_17_Regular_Expressions/regex.py
   ```
1. **Run the Tests:** You can run the tests for this lesson to verify the correctness of each regex
   function:
   ```bash
   pytest tests/test_day_17.py
   ```

## 💻 Exercises: Day 17

1. **Extract All Numbers from a String:**

   - In a new script (`my_solutions_17.py`), you have a string:
     `text = "Order #123 was placed for $49.99. The order contains 3 items."`
   - Import the `extract_and_analyze_numbers` function from the lesson script. Note that it only
     extracts integers. Can you modify the regex inside it to extract floating-point numbers as
     well?
   - Call the function and print the extracted numbers.

1. **Validate a Product Code:**

   - A valid product code must follow the format `PROD-XXXX`, where `X` is a digit.
   - Create a function `is_valid_product_code(code)` that returns `True` if the code is valid and
     `False` otherwise.
   - Use the `re.fullmatch(pattern, string)` function. Your pattern should look something like
     `r'PROD-\d{4}'`. (`\d{4}` means exactly four digits).
   - Test your function with `"PROD-1234"` (valid) and `"PROD-123"` (invalid).

1. **Clean Up a Messy Sentence:**

   - You have a sentence with extra symbols: `sentence = "Contact us... at (support@example.com)!"`
   - Import and use the `clean_text_advanced` function from the lesson to remove the punctuation and
     symbols.
   - Print the cleaned sentence.

🎉 **Excellent!** Regular expressions are a fundamental tool for any data analyst who works with
text. They provide a powerful and efficient way to clean, validate, and extract information from
unstructured data.

<!-- LESSON_FOOTER_START -->

______________________________________________________________________

**Previous:** [Day 16 – Day 16: File Handling for Business Analytics](../Day_16_File_Handling/README.md) • **Next:** [Day 18 – Day 18: Classes and Objects - Modeling Business Concepts](../Day_18_Classes_and_Objects/README.md)

_You are on lesson 17 of 108._

<!-- LESSON_FOOTER_END -->
