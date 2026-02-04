---
title: "Day 8: Structured Records (Dictionaries)"
tags:
  - Basics
  - Python
  - Data Structures
---

# 📘 Day 8: Structured Records (Dictionaries)

## Managerial Relevance

Lists are great for sequences, but terrible for _records_. If you have `["John", "Doe", 50000]`, you have to remember that index 2 is salary. That's fragile.

**Dictionaries** are Key-Value pairs: `{"First Name": "John", "Salary": 50000}`.
This is how modern business data lives—from JSON responses in APIs to NoSQL databases like MongoDB. It allows you to access data by _name_, not position.

## Key Concepts

- **Key-Value Pairs**: `customer = {"id": 101, "name": "Acme Corp"}`.
- **Access**: `customer["name"]` gives "Acme Corp".
- **Safety**: `.get("email", "N/A")` safely tries to find an email, but returns "N/A" if missing (preventing crashes).
- **Nesting**: Putting a list inside a dictionary (e.g., a customer with a list of previous orders).

## Code Walkthrough

Open `dictionaries.py`. We model a complex CRM record.

1.  **`create_customer_profile()`**:
    - Builds a dictionary from inputs.
    - This is effectively creating a "row" of data, but more flexible.

2.  **`update_customer_record()`**:
    - Shows how to modify data.
    - `profile["phone"] = "555-0199"` adds the key if it's missing, or updates it if it exists.

3.  **`add_project_to_employee()`**:
    - Demonstrates **Nesting**.
    - The employee dict contains a key `"projects"`, which holds a **List**.
    - We access the list and `.append()` to it. This mirrors real-world JSON structures.

### Running the Code

```bash
python Day_08_Dictionaries/dictionaries.py
```

## 💻 Practice Exercises

Open `solutions.py`.

1.  **Product Lookup**:
    - Create a dict: `catalog = {"Laptop": 999.99, "Mouse": 25.50}`.
    - Print the price of "Laptop".

2.  **Inventory Adjustment**:
    - Add a new item "Keyboard" at `45.00`.
    - Update "Mouse" price to `20.00` (sale price).

3.  **Missing Data**:
    - Try to get the price of "Monitor" using `.get("Monitor", "Not Found")`.
    - Print the result.

<!-- LESSON_FOOTER_START -->

---

**Previous:** [Day 07 – Sets](../Day_07_Sets/README.md) • **Next:** [Day 09 – Conditionals](../Day_09_Conditionals/README.md)

_You are on lesson 8 of 108._

<!-- LESSON_FOOTER_END -->
