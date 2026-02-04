---
title: "Day 2: Storing and Analyzing Business Data (Variables)"
tags:
  - Basics
  - Python
  - Data Types
---

# 📘 Day 2: Storing and Analyzing Business Data

## Managerial Relevance

In Excel, you put data in cells (A1, B2). In Python, you put data in **variables**.

Naming these variables nicely (`quarterly_revenue` vs `x`) is what makes Python code readable by humans. If you inherit a spreadsheet with a formula like `=SUM(A1:A50)*Sheet2!C3`, you're lost. If you read `profit = revenue - cost`, you understand the business logic immediately.

## Key Concepts

- **Variables:** Containers for storing data values.
  - `revenue = 100000`
- **Data Types:**
  - `int` (Integers): Whole numbers (Units sold: `50`)
  - `float` (Integers): Decimals (Price: `19.99`)
  - `str` (String): Text (Product Name: `"Widget A"`)
  - `bool` (Boolean): True/False (Is In Stock: `True`)
- **f-strings**: A professional way to inject variables into text.
  - `print(f"Revenue is ${revenue}")`

## Code Walkthrough

Open `variables.py`. We model a simple inventory scenario.

1.  **Variable Assignment**:
    - We create variables like `item_name`, `price`, `quantity`.
    - Notice we use `_` (snake_case) for multi-word names. This is the Python standard.

2.  **`calculate_inventory_value()`**:
    - We multiply `price * quantity`.
    - Because `price` is a float, the result is a float.

3.  **Built-in Functions**:
    - `len(item_name)`: Counts characters. Useful for data validation (e.g., SKU length).
    - `type(price)`: Confirms what kind of data we are holding.

### Running the Code

```bash
python Day_02_Variables_Builtin_Functions/variables.py
```

## 💻 Practice Exercises

Open `solutions.py` to write your answers.

1.  **Employee Data**:
    - Create variables for an employee: `first_name`, `last_name`, `salary` (monthly).
    - Create a variable `annual_salary` by multiplying by 12.

2.  **Formatted Report**:
    - Use an f-string to print: `"John Doe earns $60000 per year."`
    - _Tip:_ F-strings are the bread and butter of automated reporting.

3.  **Type Check**:
    - Create a variable `is_manager = True`.
    - Print its type. What do you get?

<!-- LESSON_FOOTER_START -->

---

**Previous:** [Day 01 – Introduction](../Day_01_Introduction/README.md) • **Next:** [Day 03 – Operators](../Day_03_Operators/README.md)

_You are on lesson 2 of 108._

<!-- LESSON_FOOTER_END -->
