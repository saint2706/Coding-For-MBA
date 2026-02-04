---
title: "Day 4: Processing Business Text (Strings)"
tags:
  - Basics
  - Python
  - Text Processing
---

# 📘 Day 4: Processing Business Text (Strings)

## Managerial Relevance

Text data is everywhere: emails, product descriptions, customer reviews, and address fields.
In Excel, cleaning this data (e.g., extracting "First Name" from "First Last") involves complex formulas like `=LEFT(A1, FIND(" ", A1)-1)`.

In Python, text processing is **native** and **readable**. You can clean thousands of messy customer inputs in seconds, preparing them for your CRM or analysis tools.

## Key Concepts

- **Index/Slicing**: Accessing specific parts of a text.
  - `sku[0:3]` gets the first 3 characters (e.g., "ABC" from "ABC-123").
- **Methods**: Built-in text tools.
  - `.lower()`, `.upper()`: Standardize sizing for comparison.
  - `.strip()`: Removes pesky leading/trailing spaces (a common Excel headache).
  - `.replace("old", "new")`: Batch correction of typos.
- **Formatted Strings (f-strings)**: Injecting data into report templates dynamically.

## Code Walkthrough

Open `strings.py`. We solve common data quality issues.

1.  **`generate_username()`**:
    - Takes a full name (e.g., "John Doe") and creating a system ID (e.g., "john.doe").
    - Uses `.lower()` and `.replace(" ", ".")` to standardize formatting.

2.  **`clean_product_id()`**:
    - Handles messy input like `"  XM-99-Red  "`.
    - Uses `.strip()` to remove whitespace.
    - Uses `.upper()` to ensure the ID matches your database standard.

3.  **`extract_ticker_symbol()`**:
    - Uses **slicing** (`text[start:end]`) to pull specific codes from a standard format.

### Running the Code

```bash
python Day_04_Strings/strings.py
```

## 💻 Practice Exercises

Open `solutions.py`.

1.  **Email Generator**:
    - Input: `first = "Jane"`, `last = "Doe"`.
    - Task: Create `jane.doe@company.com`.
    - _Tip:_ Use `.lower()` and an f-string.

2.  **SKU Validator**:
    - A valid SKU must start with "PROD-".
    - Check if the string `"PROD-123"` starts with it using `.startswith("PROD-")`.

3.  **Review Sentiment (Simple)**:
    - Input: `"This product is TERRIBLE!"`
    - Task: Replace "TERRIBLE" with "needs improvement" using `.replace()`.

<!-- LESSON_FOOTER_START -->

---

**Previous:** [Day 03 – Operators](../Day_03_Operators/README.md) • **Next:** [Day 05 – Lists](../Day_05_Lists/README.md)

_You are on lesson 4 of 108._

<!-- LESSON_FOOTER_END -->
