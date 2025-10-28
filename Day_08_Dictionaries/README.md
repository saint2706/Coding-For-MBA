# 📘 Day 8: Dictionaries - Structuring Complex Business Data

Real-world business data is structured. A customer has a name, an email, and a location. A product
has a price, an SKU, and an inventory count. For this, we need **dictionaries**. A dictionary is the
most important data structure for handling structured data in Python.

## What is a Dictionary?

A dictionary is an **unordered** collection of **key-value pairs**.

- **Key:** A unique identifier for a piece of data (e.g., `"first_name"`).
- **Value:** The data itself (e.g., `"John"`).

```python
customer = {
    "customer_id": "CUST-001",
    "first_name": "John",
    "last_name": "Doe",
}
```

## Key Dictionary Operations

- **Accessing Data:** Use the key in square brackets (`customer["first_name"]`). For safer access,
  use the `.get()` method (`customer.get("phone", "N/A")`), which returns a default value if the key
  doesn't exist.
- **Adding/Modifying:** Assign a value to a key (`customer["phone"] = "555-123-4567"`).
- **Removing:** Use the `del` keyword (`del customer["company"]`).
- **Nesting:** Dictionaries can contain other dictionaries or lists, allowing you to model complex
  structures like an employee profile with nested contact info and a list of projects.

## Environment Setup

Before you begin, ensure you have followed the setup instructions in the main
[README.md](../../README.md) to set up your virtual environment and install the required libraries.

## Exploring the Refactored Code

The script for this lesson, `dictionaries.py`, has been refactored to encapsulate dictionary
operations into testable functions.

1. **Review the Code:** Open `Day_08_Dictionaries/dictionaries.py`. Notice the functions like
   `create_customer_profile()`, `update_customer_record()`, and `add_project_to_employee()`.
1. **Run the Script:** From the root directory of the project (`Coding-For-MBA`), run the script to
   see the functions in action:
   ```bash
   python Day_08_Dictionaries/dictionaries.py
   ```
1. **Run the Tests:** You can run the tests for this lesson to verify the correctness of each
   function:
   ```bash
   pytest tests/test_day_08.py
   ```

## 💻 Exercises: Day 8

1. **Create a Product Dictionary:**

   - In a new script (`my_solutions_08.py`), create a function
     `create_product(product_id, name, price, in_stock, tags)`.
   - The function should accept these arguments and return a dictionary representing a product.
   - Call the function with sample data (e.g., `PROD-123`, `SuperWidget`, `199.99`, `True`,
     `["electronics", "gadget"]`) and print the resulting dictionary.

1. **Modify Employee Information:**

   - Start with the `employee_record` dictionary from the lesson's main block.
   - Import the `add_project_to_employee` function.
   - Call the function to add a new project, "2025 Strategy," to the employee's project list.
   - Separately, update the `department` key of your new dictionary to "Marketing Director".
   - Print the final, updated employee dictionary.

1. **Access Nested Data:**

   - Create a dictionary for a `company` with keys `company_name` and `headquarters`.
   - The value for `headquarters` should be another dictionary with keys for `city`, `state`, and
     `country`.
   - Write a script that creates this dictionary and then prints a sentence like:
     `"[Company Name] is headquartered in [City], [State]."`, accessing the nested values to build
     the string.

🎉 **Amazing work!** Dictionaries are the cornerstone of handling structured data in Python. Almost
every time you get data from an API or a database, it will be in the form of dictionaries. Mastering
them is a huge step forward.

<!-- LESSON_FOOTER_START -->

---

**Previous:** [Day 07 – Day 7: Sets - Managing Unique Business Data](../Day_07_Sets/README.md) • **Next:** [Day 09 – Day 9: Conditionals - Implementing Business Logic](../Day_09_Conditionals/README.md)

_You are on lesson 8 of 108._

<!-- LESSON_FOOTER_END -->