---
title: 'Day 5: Managing Collections of Business Data with Lists'
tags:
  - BI
  - Basics
  - Data
  - Python
---

In business, you often work with collections of data: lists of customers, quarterly sales figures,
products, and more. Python's most fundamental tool for managing ordered collections is the **list**.

## What is a List?

A list is an ordered, changeable collection of items, created by placing items inside square
brackets `[]`.

```python
# A list of department names (strings)
departments = ["Sales", "Marketing", "Human Resources", "Engineering"]

# A list of quarterly sales figures (floats)
quarterly_sales = [120000.50, 135000.75, 110000.00, 145000.25]
```

## Key List Operations

- **Accessing Data:** Use an item's **index** (position starting from 0) to access it.
  `departments[0]` returns `"Sales"`. Negative indexing like `departments[-1]` gets the last item.
- **Slicing:** Get a sub-section of a list, like `quarterly_sales[0:2]` for the first two quarters.
- **Modifying Data:** Lists are dynamic. Key methods include:
  - `.append()`: Adds an item to the end.
  - `.remove()`: Removes the first item with a specified value.
  - `.sort()`: Sorts the list in place, which is great for ranking.

## Environment Setup

Before you begin, ensure you have followed the setup instructions in the main
[README.md](https://github.com/saint2706/Coding-For-MBA/blob/main/README.md) to set up your virtual environment and install the required libraries.

## Exploring the Refactored Code

The script for this lesson, `lists.py`, has been refactored into functions to make the logic for
each list operation reusable and testable.

1. **Review the Code:** Open `Day_05_Lists/lists.py`. Each list operation (e.g., `add_product()`,
   `analyze_team_sales()`) is now its own function. Notice that the functions return a *new* list
   rather than modifying the original, which is a good practice to avoid unexpected side effects.
1. **Run the Script:** From the root directory of the project (`Coding-For-MBA`), run the script to
   see the functions in action:
   ```bash
   python Day_05_Lists/lists.py
   ```
1. **Run the Tests:** You can run the tests for this lesson to verify the correctness of each
   function:
   ```bash
   pytest tests/test_day_05.py
   ```

## 💻 Exercises: Day 5

1. **Manage a Product List:**

   - In a new script (`my_solutions_05.py`), create a list of product names:
     `["Laptop", "Mouse", "Keyboard", "Monitor"]`.
   - A new product, "Webcam", is now in stock. Call the `add_product` function (you can import it)
     to get a new list with the webcam.
   - The "Mouse" is sold out. Call the `remove_product` function on your *new* list.
   - Print the final list of available products.

1. **Analyze Monthly Expenses:**

   - Create a function `analyze_expenses(expenses)` that takes a list of numbers.
   - The function should return a dictionary containing the `total_expenses`, `highest_expense`, and
     `lowest_expense`.
   - Call the function with a list like `[2200, 2350, 2600, 2130, 2190]` and print the results.

1. **Select Top Sales Performers:**

   - The `analyze_team_sales` function in `lists.py` already does this.
   - Import it into your script: `from Day_05_Lists.lists import analyze_team_sales`.
   - Call the function with a list of sales figures: `[5000, 8000, 4500, 12000, 6000, 11000]`.
   - Print the `top_3_sales` from the dictionary that the function returns.

🎉 **Great job!** Lists are the workhorse for storing collections of data in Python. Understanding
how to manage and analyze data within lists is a fundamental skill for any data analyst.

<!-- LESSON_FOOTER_START -->

______________________________________________________________________

**Previous:** [Day 04 – Day 4: Working with Text Data - Strings](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_04_Strings/README.md) • **Next:** [Day 06 – Day 6: Tuples - Storing Immutable Business Data](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_06_Tuples/README.md)

_You are on lesson 5 of 108._

<!-- LESSON_FOOTER_END -->

## Additional Materials

- **lists.ipynb**
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_05_Lists/lists.ipynb){ .md-button }
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_05_Lists/lists.ipynb){ .md-button .md-button--primary }
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_05_Lists/lists.ipynb){ .md-button }
  - **solutions.ipynb**
    [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_05_Lists/solutions.ipynb){ .md-button }
    [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_05_Lists/solutions.ipynb){ .md-button .md-button--primary }
    [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_05_Lists/solutions.ipynb){ .md-button }
    ???+ example "lists.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_05_Lists/lists.py)

````
```python title="lists.py"
"""
Day 5: Managing and Analyzing Business Data with Lists (Refactored)

This script demonstrates how to create, access, modify, and analyze
lists containing business-related data. This version is refactored
into functions for better organization and testability.
"""

def get_list_element(data_list, index):
    """
    Safely gets an element from a list by its index.

    Lists use zero-based indexing: the first element is at index 0.
    Negative indices count from the end: -1 is the last element.

    Parameters
    ----------
    data_list : list
        The list to access
    index : int
        The position to retrieve (0-based, or negative for end-counting)

    Returns
    -------
    Any or None
        The element at the specified index, or None if index is out of range

    Example
    -------
    >>> get_list_element([10, 20, 30], 1)
    20
    >>> get_list_element([10, 20, 30], -1)
    30
    """
    # Check if the index is within valid range
    # -len(data_list) is the furthest negative index, len(data_list)-1 is the last positive
    if -len(data_list) <= index < len(data_list):
        return data_list[index]
    return None  # Return None for invalid indices (safer than raising an error)

def get_first_half_sales(sales_list):
    """
    Returns the first half of a list of sales using slicing.

    List slicing [start:end] creates a new list with elements from
    start index up to (but not including) end index.

    Parameters
    ----------
    sales_list : list
        A list of sales figures

    Returns
    -------
    list
        The first half of the list

    Example
    -------
    >>> get_first_half_sales([100, 200, 300, 400])
    [100, 200]
    """
    # Calculate the midpoint using integer division (//)
    midpoint = len(sales_list) // 2

    # [:midpoint] means "from the beginning up to (not including) midpoint"
    return sales_list[:midpoint]

def add_product(product_list, new_product):
    """
    Adds a new product to a list of products.

    Demonstrates the .append() method which adds an item to the end of a list.
    We create a copy to avoid modifying the original list.

    Parameters
    ----------
    product_list : list
        The existing list of products
    new_product : str
        The new product to add

    Returns
    -------
    list
        A new list with the product added

    Example
    -------
    >>> add_product(["Laptop", "Mouse"], "Keyboard")
    ['Laptop', 'Mouse', 'Keyboard']
    """
    # .copy() creates a new list so we don't modify the original
    new_list = product_list.copy()

    # .append() adds an item to the end of the list
    new_list.append(new_product)
    return new_list

def remove_product(product_list, product_to_remove):
    """
    Removes a product from a list if it exists.

    Demonstrates the .remove() method which removes the first occurrence
    of a value from a list.

    Parameters
    ----------
    product_list : list
        The list of products
    product_to_remove : str
        The product to remove

    Returns
    -------
    list
        A new list with the product removed (if it existed)

    Example
    -------
    >>> remove_product(["Laptop", "Mouse", "Keyboard"], "Mouse")
    ['Laptop', 'Keyboard']
    """
    # Create a copy to avoid modifying the original
    new_list = product_list.copy()

    # Check if the item exists before trying to remove it
    if product_to_remove in new_list:
        # .remove() deletes the first occurrence of the value
        new_list.remove(product_to_remove)
    return new_list

def analyze_team_sales(sales_figures):
    """
    Sorts sales, finds top performers, and returns an analysis.

    Demonstrates several list operations:
    - sorted() to order data
    - Slicing to get top N items
    - sum() to aggregate values

    Parameters
    ----------
    sales_figures : list of numbers
        List of individual sales amounts

    Returns
    -------
    dict or None
        Dictionary containing sorted sales, top 3, and their total
        Returns None if list is empty

    Example
    -------
    >>> analyze_team_sales([5000, 8000, 4500, 12000])
    {'sorted_sales': [12000, 8000, 5000, 4500], 'top_3_sales': [12000, 8000, 5000], 'total_top_sales': 25000}
    """
    # Handle empty list case
    if not sales_figures:
        return None

    # sorted() creates a new sorted list
    # reverse=True means highest to lowest (descending order)
    sorted_sales = sorted(sales_figures, reverse=True)

    # [:3] slices the first 3 elements (top 3 performers)
    top_3_sales = sorted_sales[:3]

    # sum() adds all numbers in the list
    total_top_sales = sum(top_3_sales)

    # Return results as a dictionary for structured access
    return {
        "sorted_sales": sorted_sales,
        "top_3_sales": top_3_sales,
        "total_top_sales": total_top_sales,
    }

if __name__ == "__main__":
    # --- Initializing Lists with Business Data ---
    print("--- Initializing Business Lists ---")
    departments_list = ["Sales", "Marketing", "Human Resources", "Engineering"]
    quarterly_sales_figures = [120000.50, 135000.75, 110000.00, 145000.25]
    print(f"Company Departments: {departments_list}")
    print(f"Quarterly Sales: {quarterly_sales_figures}")
    print("-" * 20)

    # --- Accessing and Slicing List Data ---
    print("--- Accessing Specific Data ---")
    marketing_department = get_list_element(departments_list, 1)
    print(f"The second department is: {marketing_department}")

    last_sales = get_list_element(quarterly_sales_figures, -1)
    print(f"Sales for the last quarter: ${last_sales}")

    first_half_figures = get_first_half_sales(quarterly_sales_figures)
    print(f"First half sales: {first_half_figures}")
    print("-" * 20)

    # --- Modifying Lists ---
    print("--- Modifying a Product List ---")
    initial_products = ["Laptop", "Mouse", "Keyboard", "Monitor"]
    print(f"Original product list: {initial_products}")

    products_after_add = add_product(initial_products, "Webcam")
    print(f"After adding 'Webcam': {products_after_add}")

    products_after_remove = remove_product(products_after_add, "Mouse")
    print(f"After removing 'Mouse': {products_after_remove}")
    print("-" * 20)

    # --- Analyzing List Data ---
    print("--- Analyzing Sales Performance ---")
    team_sales_figures = [5000, 8000, 4500, 12000, 6000, 11000]
    print(f"Sales figures for the team: {team_sales_figures}")

    sales_analysis = analyze_team_sales(team_sales_figures)
    if sales_analysis:
        print(f"Sales sorted from highest to lowest: {sales_analysis['sorted_sales']}")
        print(f"Top 3 sales figures: {sales_analysis['top_3_sales']}")
        print(
            f"Total sales from top 3 performers: ${sales_analysis['total_top_sales']}"
        )
    print("-" * 20)
```
````

???+ example "solutions.py"
[View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_05_Lists/solutions.py)

````
```python title="solutions.py"
"""
Day 5: Solutions to Exercises
"""

# --- Exercise 1: Manage a Product List ---
print("--- Solution to Exercise 1 ---")
products = ["Laptop", "Mouse", "Keyboard", "Monitor"]
print(f"Initial product list: {products}")

# Add "Webcam" to the end of the list
products.append("Webcam")
print(f"After adding 'Webcam': {products}")

# Remove "Mouse" from the list
products.remove("Mouse")
print(f"After removing 'Mouse': {products}")
print(f"Final available products: {products}")
print("-" * 20)

# --- Exercise 2: Analyze Monthly Expenses ---
print("--- Solution to Exercise 2 ---")
monthly_expenses = [2200, 2350, 2600, 2130, 2190]
print(f"Initial monthly expenses: {monthly_expenses}")

# Find total, min, and max expenses
total_expenses = sum(monthly_expenses)
highest_expense = max(monthly_expenses)
lowest_expense = min(monthly_expenses)

print(f"Total expenses: ${total_expenses}")
print(f"Highest monthly expense: ${highest_expense}")
print(f"Lowest monthly expense: ${lowest_expense}")

# Add a new expense and print the updated total
new_expense = 2400
monthly_expenses.append(new_expense)
updated_total_expenses = sum(monthly_expenses)
print(
    f"After adding a new expense of ${new_expense}, the new total is: ${updated_total_expenses}"
)
print("-" * 20)

# --- Exercise 3: Select Top Sales Performers ---
print("--- Solution to Exercise 3 ---")
sales_figures = [5000, 8000, 4500, 12000, 6000, 11000]
print(f"Original sales figures: {sales_figures}")

# Sort the list in descending order (highest to lowest)
sales_figures.sort(reverse=True)
print(f"Sorted sales figures: {sales_figures}")

# "Slice" the list to get the top 3
top_3_sales = sales_figures[0:3]

print(f"The top 3 sales figures are: {top_3_sales}")
print("-" * 20)
```
````
