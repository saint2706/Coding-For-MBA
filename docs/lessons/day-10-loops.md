---
title: 'Day 10: Loops - Automating Repetitive Business Tasks'
tags:
  - BI
  - Basics
  - Python
---

What if you have a list of 10,000 sales transactions? You won't write code for each one. This is
where **loops** come in. Loops allow you to perform the same action on every item in a collection,
automating what would otherwise be an impossibly tedious task.

## Key Loop Types

- **`for` loop:** The most common loop. It iterates over a sequence (like a list or dictionary) and
  executes a block of code for each item.
  ```python
  # Calculate total revenue from a list of sales
  total_revenue = 0
  for sale in monthly_sales:
      total_revenue += sale
  ```
- **`while` loop:** Runs as long as a certain condition is `True`. It's used when you don't know
  beforehand how many times you need to loop, such as in a simulation.

## Combining Loops and Conditionals

The real power comes from combining loops with `if` statements. This allows you to perform an action
on only the items that meet a certain criteria, which is the foundation of filtering and
transforming data.

```python
# Find all transactions over a certain amount
large_transactions = []
for amount in transactions:
    if amount > 500:
        large_transactions.append(amount)
```

## Environment Setup

Before you begin, ensure you have followed the setup instructions in the main
[README.md](https://github.com/saint2706/Coding-For-MBA/blob/main/README.md) to set up your virtual environment and install the required libraries.

## Exploring the Refactored Code

The script for this lesson, `loops.py`, has been refactored to place each looping task into its own
testable function.

1. **Review the Code:** Open `Day_10_Loops/loops.py`. Notice the functions
   `calculate_total_from_list()`, `filter_high_value_customers()`, and
   `simulate_investment_growth()`.
1. **Run the Script:** From the root directory of the project (`Coding-For-MBA`), run the script to
   see the functions in action:
   ```bash
   python Day_10_Loops/loops.py
   ```
1. **Run the Tests:** You can run the tests for this lesson to verify the correctness of each
   function:
   ```bash
   pytest tests/test_day_10.py
   ```

## 💻 Exercises: Day 10

1. **Calculate Average Employee Age:**

   - In a new script (`my_solutions_10.py`), create a list of employee dictionaries:
     `employees = [{"name": "Alice", "age": 30}, {"name": "Bob", "age": 45}, {"name": "Charlie", "age": 35}]`.
   - Create a function `calculate_average_age(employee_list)` that takes a list of employee
     dictionaries.
   - Inside the function, use a `for` loop to get the sum of all ages.
   - Return the average age (`total_age / number_of_employees`).
   - Call your function and print the result.

1. **Filter High-Priority Customers:**

   - You have a list of customer dictionaries (see `loops.py` for an example).
   - Import the `filter_high_value_customers` function from the lesson script.
   - Call the function with your list of customers and print the result.

1. **Inventory Stock Alert:**

   - You have a dictionary of product inventory:
     `inventory = {"Laptops": 15, "Mice": 150, "Keyboards": 45}`.
   - Import the `check_inventory_levels` function.
   - Call the function to get a list of low-stock items.
   - Loop through the returned list and print an alert for each item.

🎉 **Incredible!** The combination of loops and conditionals is the foundation of almost all data
processing and analysis tasks. You've completed the core structures of Python!

<!-- LESSON_FOOTER_START -->

______________________________________________________________________

**Previous:** [Day 09 – Day 9: Conditionals - Implementing Business Logic](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_09_Conditionals/README.md) • **Next:** [Day 11 – Day 11: Functions - Creating Reusable Business Tools](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_11_Functions/README.md)

_You are on lesson 10 of 108._

<!-- LESSON_FOOTER_END -->

## Additional Materials

- **loops.ipynb**
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_10_Loops/loops.ipynb){ .md-button }
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_10_Loops/loops.ipynb){ .md-button .md-button--primary }
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_10_Loops/loops.ipynb){ .md-button }
  - **solutions.ipynb**
    [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_10_Loops/solutions.ipynb){ .md-button }
    [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_10_Loops/solutions.ipynb){ .md-button .md-button--primary }
    [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_10_Loops/solutions.ipynb){ .md-button }
    ???+ example "loops.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_10_Loops/loops.py)

````
```python title="loops.py"
"""
Day 10: Automating Tasks with Loops (Refactored)

This script demonstrates how to use for and while loops to
process collections of business data automatically. This version
is refactored into functions for better organization and testability.
"""

def calculate_total_from_list(numbers_list):
    """
    Calculates the sum of all numbers in a list using a for loop.

    A 'for loop' iterates through each item in a collection.
    This is the most common loop pattern in Python.

    Parameters
    ----------
    numbers_list : list of numbers
        List of numbers to sum

    Returns
    -------
    float or int
        The sum of all numbers

    Example
    -------
    >>> calculate_total_from_list([100, 200, 300])
    600
    """
    total = 0  # Initialize accumulator variable

    # 'for number in numbers_list' means:
    # "For each item in numbers_list, call it 'number' and execute this block"
    for number in numbers_list:
        total += number  # Add current number to our running total

    return total

def filter_high_value_customers(customers_list, threshold=2000):
    """
    Filters a list of customer dictionaries to find those who spent above a threshold.

    This demonstrates combining loops with conditionals - a very common pattern.
    We loop through all items, but only keep those that meet our criteria.

    Parameters
    ----------
    customers_list : list of dict
        List of customer dictionaries with 'name' and 'total_spent' keys
    threshold : float, optional
        Minimum spending to be considered high-value (default 2000)

    Returns
    -------
    list of str
        List of high-value customer names

    Example
    -------
    >>> customers = [
    ...     {"name": "Alice", "total_spent": 3000},
    ...     {"name": "Bob", "total_spent": 1000},
    ... ]
    >>> filter_high_value_customers(customers, 2000)
    ['Alice']
    """
    high_priority = []  # Empty list to collect results

    # Loop through each customer dictionary
    for customer in customers_list:
        # .get() safely retrieves the value, returns 0 if key doesn't exist
        spent = customer.get("total_spent", 0)

        # Only add customers who exceed the threshold
        if spent > threshold:
            name = customer.get("name")
            high_priority.append(name)

    return high_priority

def check_inventory_levels(inventory_dict, threshold=50):
    """
    Checks an inventory dictionary and returns a list of products
    that are below a specified stock threshold.

    This demonstrates looping through a dictionary using .items(),
    which gives us both keys and values.

    Parameters
    ----------
    inventory_dict : dict
        Dictionary mapping product names to stock counts
    threshold : int, optional
        Low stock threshold (default 50)

    Returns
    -------
    list of str
        List of products that are low on stock

    Example
    -------
    >>> inventory = {"Laptops": 30, "Mice": 100}
    >>> check_inventory_levels(inventory, 50)
    ['Laptops']
    """
    low_stock_alerts = []  # List to collect low-stock items

    # .items() gives us (key, value) pairs from the dictionary
    # We unpack them into 'product' and 'count'
    for product, count in inventory_dict.items():
        # Check if this product is below threshold
        if count < threshold:
            low_stock_alerts.append(product)

    return low_stock_alerts

def simulate_investment_growth(initial_investment, target_amount, interest_rate):
    """
    Simulates the number of years it takes for an investment to reach a target.

    This demonstrates a 'while loop' - it continues until a condition is met.
    While loops are perfect for simulations where you don't know how many
    iterations you'll need in advance.

    Parameters
    ----------
    initial_investment : float
        Starting investment amount
    target_amount : float
        Goal amount to reach
    interest_rate : float
        Annual interest rate as a decimal (e.g., 0.07 for 7%)

    Returns
    -------
    int
        Number of years to reach target, or -1 if inputs are invalid

    Example
    -------
    >>> simulate_investment_growth(10000, 20000, 0.07)
    11
    """
    # Validate inputs first
    if initial_investment <= 0 or interest_rate <= 0:
        return -1  # Indicate invalid input

    investment = initial_investment  # Start with initial amount
    years = 0  # Counter for years

    # 'while' means "keep looping as long as this condition is True"
    # This will continue until investment reaches or exceeds target
    while investment < target_amount:
        # Apply interest: multiply by (1 + rate)
        investment *= 1 + interest_rate
        years += 1  # Increment year counter

        # Safety check: prevent infinite loops (shouldn't happen with valid inputs)
        if years > 1000:  # Reasonable upper limit
            break

    return years

if __name__ == "__main__":
    # --- Using a for loop to aggregate data ---
    print("--- Calculating Total Monthly Revenue ---")
    sales_data = [2340.50, 3100.25, 2900.00, 4500.75]
    total_rev = calculate_total_from_list(sales_data)
    print(f"Total Revenue for the month: ${total_rev:.2f}")
    print("-" * 20)

    # --- Using a for loop with a conditional to filter data ---
    print("--- Filtering High-Value Customers ---")
    customer_data = [
        {"name": "InnovateCorp", "total_spent": 5500},
        {"name": "DataDriven Inc.", "total_spent": 1200},
        {"name": "Analytics LLC", "total_spent": 2100},
        {"name": "Global Solutions", "total_spent": 850},
    ]
    priority_customers = filter_high_value_customers(customer_data)
    print(f"High-priority customers to contact: {priority_customers}")
    print("-" * 20)

    # --- Looping through a dictionary for inventory alerts ---
    print("--- Inventory Stock Level Alerts ---")
    inventory_levels = {"Laptops": 15, "Mice": 150, "Keyboards": 45, "Monitors": 25}
    low_stock_items = check_inventory_levels(inventory_levels)
    for item in low_stock_items:
        print(
            f"ALERT: {item} are low on stock ({inventory_levels[item]} units remaining)."
        )
    print("-" * 20)

    # --- Using a while loop for financial simulation ---
    print("--- Investment Growth Simulation ---")
    initial = 10000
    target_val = 20000
    rate = 0.07
    years_to_double = simulate_investment_growth(initial, target_val, rate)
    print(
        f"It will take {years_to_double} years for the initial investment of ${initial} to double at a {rate * 100}% interest rate."
    )
    print("-" * 20)
```
````

???+ example "solutions.py"
[View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_10_Loops/solutions.py)

````
```python title="solutions.py"
"""
Day 10: Solutions to Exercises
"""

# --- Exercise 1: Calculate Average Employee Age ---
print("--- Solution to Exercise 1 ---")
employees = [
    {"name": "Alice", "age": 30},
    {"name": "Bob", "age": 45},
    {"name": "Charlie", "age": 35},
    {"name": "Diana", "age": 28},
]

total_age = 0
for employee in employees:
    total_age += employee["age"]

# Ensure we don't divide by zero if the list is empty
if len(employees) > 0:
    average_age = total_age / len(employees)
    print(f"The average age of employees is: {average_age:.1f} years")
else:
    print("No employees in the list.")
print("-" * 20)

# --- Exercise 2: Filter High-Priority Customers ---
print("--- Solution to Exercise 2 ---")
customers = [
    {"name": "InnovateCorp", "total_spent": 5500},
    {"name": "DataDriven Inc.", "total_spent": 1200},
    {"name": "Analytics LLC", "total_spent": 2100},
    {"name": "Key Insights", "total_spent": 1800},
]

high_priority_customers = []
for customer in customers:
    if customer["total_spent"] > 2000:
        high_priority_customers.append(customer["name"])

print(f"High-priority customers (spent > $2000): {high_priority_customers}")
print("-" * 20)

# --- Exercise 3: Inventory Stock Alert ---
print("--- Solution to Exercise 3 ---")
inventory = {"Laptops": 15, "Mice": 150, "Keyboards": 45, "Monitors": 25}
low_stock_threshold = 50

print("Checking inventory levels...")
for product, count in inventory.items():
    if count < low_stock_threshold:
        print(f"  - ALERT: {product} are low on stock ({count} units remaining).")
print("-" * 20)
```
````
