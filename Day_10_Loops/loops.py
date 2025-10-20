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
