---
title: 'Day 8: Dictionaries - Structuring Complex Business Data'
tags:
  - BI
  - Basics
  - Data
  - Python
---

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
[README.md](https://github.com/saint2706/Coding-For-MBA/blob/main/README.md) to set up your virtual environment and install the required libraries.

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

______________________________________________________________________

**Previous:** [Day 07 – Day 7: Sets - Managing Unique Business Data](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_07_Sets/README.md) • **Next:** [Day 09 – Day 9: Conditionals - Implementing Business Logic](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_09_Conditionals/README.md)

_You are on lesson 8 of 108._

<!-- LESSON_FOOTER_END -->

## Additional Materials

- **dictionaries.ipynb**
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_08_Dictionaries/dictionaries.ipynb){ .md-button }
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_08_Dictionaries/dictionaries.ipynb){ .md-button .md-button--primary }
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_08_Dictionaries/dictionaries.ipynb){ .md-button }
- **solutions.ipynb**
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_08_Dictionaries/solutions.ipynb){ .md-button }
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_08_Dictionaries/solutions.ipynb){ .md-button .md-button--primary }
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_08_Dictionaries/solutions.ipynb){ .md-button }

???+ example "dictionaries.py"
[View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_08_Dictionaries/dictionaries.py)

````
```python title="dictionaries.py"
"""
Day 8: Structuring Business Data with Dictionaries (Refactored)

This script demonstrates how to create, access, and modify
dictionaries that represent complex business records. This version
is refactored into functions for better organization and testability.
"""


def create_customer_profile(cust_id, first, last, email, company, is_premium, spent):
    """
    Creates a dictionary representing a customer profile.

    Dictionaries store data as key-value pairs. They're perfect for
    representing structured records like customer profiles.

    Parameters
    ----------
    cust_id : str
        Unique customer identifier
    first : str
        First name
    last : str
        Last name
    email : str
        Email address
    company : str
        Company name
    is_premium : bool
        Premium membership status
    spent : float
        Total amount spent

    Returns
    -------
    dict
        A dictionary containing all customer information

    Example
    -------
    >>> create_customer_profile(
    ...     "C001", "John", "Doe", "j@example.com", "Acme", True, 5000
    ... )
    {'customer_id': 'C001', 'first_name': 'John', ...}
    """
    # Dictionary syntax: {key: value, key: value, ...}
    # Keys are strings, values can be any type
    return {
        "customer_id": cust_id,
        "first_name": first,
        "last_name": last,
        "email": email,
        "company": company,
        "is_premium_member": is_premium,
        "total_spent": spent,
    }


def get_customer_attribute(customer_profile, attribute, default_value="N/A"):
    """
    Safely gets an attribute from a customer profile with a default fallback.

    The .get() method is safer than direct access with [] because it won't
    cause an error if the key doesn't exist.

    Parameters
    ----------
    customer_profile : dict
        The customer dictionary
    attribute : str
        The key to look up
    default_value : any, optional
        Value to return if key doesn't exist (default is "N/A")

    Returns
    -------
    any
        The value associated with the key, or default_value if not found

    Example
    -------
    >>> profile = {"name": "John", "age": 30}
    >>> get_customer_attribute(profile, "email", "No email")
    'No email'
    """
    # .get(key, default) returns the value for key, or default if key doesn't exist
    # This is safer than profile[attribute] which would raise a KeyError
    return customer_profile.get(attribute, default_value)


def update_customer_record(customer_profile, key, value, is_new=False):
    """
    Updates or adds a key-value pair to a customer profile.

    Demonstrates dictionary modification: adding new keys or updating existing ones.

    Parameters
    ----------
    customer_profile : dict
        The customer dictionary
    key : str
        The key to add or modify
    value : any
        The value to set or add to existing value
    is_new : bool, optional
        If True, creates a new key. If False, adds to existing value (default False)

    Returns
    -------
    dict
        A new dictionary with the update applied

    Example
    -------
    >>> profile = {"total_spent": 1000}
    >>> update_customer_record(profile, "total_spent", 500, is_new=False)
    {'total_spent': 1500}
    """
    # Create a copy to avoid modifying the original dictionary
    profile_copy = customer_profile.copy()

    if is_new:
        # Add a new key-value pair or overwrite existing
        profile_copy[key] = value
    else:
        # Add to existing value (assumes the key exists and value is numeric)
        if key in profile_copy:
            profile_copy[key] += value
    return profile_copy


def remove_customer_attribute(customer_profile, attribute):
    """
    Removes an attribute from a customer profile if it exists.

    Demonstrates the 'del' statement for removing dictionary keys.

    Parameters
    ----------
    customer_profile : dict
        The customer dictionary
    attribute : str
        The key to remove

    Returns
    -------
    dict
        A new dictionary with the attribute removed

    Example
    -------
    >>> profile = {"name": "John", "temp_field": "xyz"}
    >>> remove_customer_attribute(profile, "temp_field")
    {'name': 'John'}
    """
    # Create a copy to avoid modifying the original
    profile_copy = customer_profile.copy()

    # Check if the key exists before trying to delete it
    if attribute in profile_copy:
        # 'del' removes a key-value pair from the dictionary
        del profile_copy[attribute]
    return profile_copy


def add_project_to_employee(employee_profile, new_project):
    """
    Adds a new project to an employee's project list.

    Demonstrates working with nested data structures: a list inside a dictionary.

    Parameters
    ----------
    employee_profile : dict
        Employee dictionary containing a 'projects' list
    new_project : str
        Name of the new project to add

    Returns
    -------
    dict
        Updated employee profile with new project added

    Example
    -------
    >>> emp = {"name": "Jane", "projects": ["Project A"]}
    >>> add_project_to_employee(emp, "Project B")
    {'name': 'Jane', 'projects': ['Project A', 'Project B']}
    """
    # Create a copy of the dictionary
    profile_copy = employee_profile.copy()

    # Ensure the 'projects' key exists and contains a list
    if "projects" in profile_copy and isinstance(profile_copy["projects"], list):
        # To avoid modifying a list within the original dict, we copy it too
        # This is important when dealing with mutable objects inside dictionaries
        profile_copy["projects"] = profile_copy["projects"].copy()

        # Now we can safely append to the copied list
        profile_copy["projects"].append(new_project)
    return profile_copy


if __name__ == "__main__":
    # --- Creating a Dictionary for a Customer Profile ---
    print("--- Customer Profile Dictionary ---")
    customer_record = create_customer_profile(
        "CUST-001", "John", "Doe", "john.doe@example.com", "InnovateCorp", True, 2500.75
    )
    print(f"Original customer record: {customer_record}")

    # Accessing data using keys
    email_address = get_customer_attribute(customer_record, "email")
    print(f"Customer's email: {email_address}")

    # Safer access for a key that might not exist
    phone_num = get_customer_attribute(customer_record, "phone")
    print(f"Customer's phone: {phone_num}")
    print()

    # --- Modifying a Dictionary ---
    print("--- Modifying Customer Record ---")
    customer_record_with_phone = update_customer_record(
        customer_record, "phone", "555-123-4567", is_new=True
    )
    print(
        f"Added phone number: {get_customer_attribute(customer_record_with_phone, 'phone')}"
    )

    customer_record_updated_spent = update_customer_record(
        customer_record_with_phone, "total_spent", 500.25
    )
    print(f"Updated total spent: ${customer_record_updated_spent['total_spent']:.2f}")

    customer_record_no_premium = remove_customer_attribute(
        customer_record_updated_spent, "is_premium_member"
    )
    print(f"Record after removing premium status: {customer_record_no_premium}")
    print("-" * 20)

    # --- Nested Dictionaries for Complex Structures ---
    print("--- Nested Dictionary for an Employee Profile ---")
    employee_record = {
        "employee_id": "EMP-042",
        "name": "Jane Smith",
        "department": "Marketing",
        "contact_info": {"email": "jane.smith@example.com", "phone_ext": 112},
        "projects": ["Q1 Campaign", "Website Redesign"],
    }

    employee_email_address = employee_record.get("contact_info", {}).get("email")
    print(f"Employee Email: {employee_email_address}")

    first_proj = employee_record.get("projects", ["N/A"])[0]
    print(f"First project assigned: {first_proj}")

    employee_with_new_project = add_project_to_employee(
        employee_record, "2025 Strategy"
    )
    print(f"Updated projects: {employee_with_new_project['projects']}")
    print("-" * 20)
```
````

???+ example "solutions.py"
[View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_08_Dictionaries/solutions.py)

````
```python title="solutions.py"
"""
Day 8: Solutions to Exercises
"""

# --- Exercise 1: Create a Product Dictionary ---
print("--- Solution to Exercise 1 ---")
product = {
    "product_id": "PROD-123",
    "product_name": "SuperWidget",
    "price": 199.99,
    "in_stock": True,
    "tags": ["electronics", "gadget"],
}

# Accessing the values using their keys
print(f"Product Name: {product['product_name']}")
print(f"Price: ${product['price']}")
print("-" * 20)


# --- Exercise 2: Modify Employee Information ---
print("--- Solution to Exercise 2 ---")
employee = {
    "employee_id": "EMP-042",
    "name": "Jane Smith",
    "department": "Marketing",
    "contact_info": {"email": "jane.smith@example.com", "phone_ext": 112},
    "projects": ["Q1 Campaign", "Website Redesign"],
}
print(f"Original Employee Record: {employee}")

# Update the department
employee["department"] = "Marketing Director"

# Add a new project to the list of projects
employee["projects"].append("2025 Strategy")

print(f"Updated Employee Record: {employee}")
print("-" * 20)


# --- Exercise 3: Access Nested Data ---
print("--- Solution to Exercise 3 ---")
company = {
    "company_name": "InnovateCorp",
    "year_founded": 2015,
    "headquarters": {"city": "New York", "state": "NY", "country": "USA"},
}

# Accessing the nested dictionary and then the values within it
company_name = company["company_name"]
hq_city = company["headquarters"]["city"]
hq_state = company["headquarters"]["state"]

print(f"{company_name} is headquartered in {hq_city}, {hq_state}.")
print("-" * 20)
```
````
