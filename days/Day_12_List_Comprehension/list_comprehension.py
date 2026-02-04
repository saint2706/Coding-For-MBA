"""
Day 12: Elegant Data Manipulation with List Comprehensions (Refactored)

This script demonstrates how to use list comprehensions to
efficiently transform and filter lists of business data. This version
is refactored into functions for better organization and testability.
"""


def apply_price_increase(prices, increase_percentage):
    """
    Applies a percentage price increase to a list of prices
    using a list comprehension.

    List comprehensions are a concise way to create new lists by
    transforming each item in an existing list. They're faster and
    more "Pythonic" than traditional for loops.

    Syntax: [expression for item in iterable]

    Parameters
    ----------
    prices : list of float
        Original prices
    increase_percentage : float
        Percentage increase as decimal (e.g., 0.10 for 10%)

    Returns
    -------
    list of float
        New prices with increase applied

    Example
    -------
    >>> apply_price_increase([100, 200], 0.10)
    [110.0, 220.0]
    """
    increase_multiplier = 1 + increase_percentage

    # List comprehension: [what_to_do_with_each_item for item in list]
    # This creates a new list by multiplying each price by the multiplier
    # Equivalent to a for loop but more concise:
    # new_prices = []
    # for price in prices:
    #     new_prices.append(price * increase_multiplier)
    return [price * increase_multiplier for price in prices]


def filter_large_sales(sales, threshold):
    """
    Filters a list of sales to find those above a given threshold
    using a list comprehension with a conditional.

    List comprehensions can also filter data by adding an 'if' condition.

    Syntax: [expression for item in iterable if condition]

    Parameters
    ----------
    sales : list of float
        List of sale amounts
    threshold : float
        Minimum sale amount to include

    Returns
    -------
    list of float
        Sales that exceed the threshold

    Example
    -------
    >>> filter_large_sales([500, 1200, 800, 1500], 1000)
    [1200, 1500]
    """
    # List comprehension with filtering: [item for item in list if condition]
    # Only includes sales where the amount is greater than threshold
    # Equivalent traditional loop:
    # result = []
    # for sale in sales:
    #     if sale > threshold:
    #         result.append(sale)
    return [sale for sale in sales if sale > threshold]


def get_top_sales_performers(employees, sales_target):
    """
    Filters and transforms a list of employee dictionaries to get the
    names of top-performing sales staff.

    This demonstrates a more complex list comprehension that:
    1. Filters by multiple conditions (AND logic)
    2. Extracts just one field (name) from dictionaries

    Parameters
    ----------
    employees : list of dict
        List of employee dictionaries with 'name', 'department', 'quarterly_sales'
    sales_target : float
        Minimum sales to be considered top performer

    Returns
    -------
    list of str
        Names of sales employees who exceeded the target

    Example
    -------
    >>> employees = [
    ...     {"name": "Alice", "department": "Sales", "quarterly_sales": 12000},
    ...     {"name": "Bob", "department": "Engineering", "quarterly_sales": 0},
    ... ]
    >>> get_top_sales_performers(employees, 10000)
    ['Alice']
    """
    # Complex list comprehension with multiple conditions:
    # [what_to_extract for item in list if condition1 and condition2]
    #
    # This extracts employee['name'] for each employee where:
    # 1. Their department is "Sales" AND
    # 2. Their quarterly_sales exceeds sales_target
    #
    # .get() with a default of 0 prevents errors if key is missing
    return [
        employee["name"]
        for employee in employees
        if employee.get("department") == "Sales"
        and employee.get("quarterly_sales", 0) > sales_target
    ]


def main():
    """Main function to demonstrate list comprehensions."""
    # --- Example 1: Transforming Data ---
    print("--- Applying a Price Increase ---")
    original_prices = [100.00, 150.50, 200.00, 80.25]
    print(f"Original prices: {original_prices}")

    increased_prices = apply_price_increase(original_prices, 0.10)  # 10% increase
    print(f"New prices (from comprehension): {[f'${p:.2f}' for p in increased_prices]}")
    print("-" * 20)

    # --- Example 2: Filtering Data ---
    print("--- Filtering for Large Sales Transactions ---")
    sales_data = [500, 1200, 800, 1500, 300, 2500]
    print(f"All sales: {sales_data}")

    large_sales_data = filter_large_sales(sales_data, 1000)
    print(f"Large sales (from comprehension): {large_sales_data}")
    print("-" * 20)

    # --- Example 3: Filtering and Transforming ---
    print("--- Extracting Names of High-Performing Sales Staff ---")
    employee_data = [
        {"name": "Alice", "department": "Sales", "quarterly_sales": 12000},
        {"name": "Bob", "department": "Engineering", "quarterly_sales": 0},
        {"name": "Charlie", "department": "Sales", "quarterly_sales": 8000},
        {"name": "David", "department": "Sales", "quarterly_sales": 15000},
    ]
    target = 10000
    top_performers_list = get_top_sales_performers(employee_data, target)
    print(f"Top performing sales staff (sales > ${target}): {top_performers_list}")
    print("-" * 20)


if __name__ == "__main__":
    main()
