"""
Day 13: Advanced Data Processing with Higher-Order Functions (Refactored)

This script demonstrates using map, filter, and sorted with lambda functions
for concise and powerful data manipulation. This version is refactored
into functions for better organization and testability.
"""


def apply_bonus_to_salaries(salaries, bonus_percentage):
    """
    Applies a percentage bonus to a list of salaries using map().

    map() is a higher-order function that applies a function to every
    item in a list. It's more efficient than a for loop for simple
    transformations.

    Lambda functions are small anonymous functions written as:
    lambda arguments: expression

    Parameters
    ----------
    salaries : list of float
        Original salary amounts
    bonus_percentage : float
        Bonus as a decimal (e.g., 0.10 for 10%)

    Returns
    -------
    list of float
        Salaries with bonus applied

    Example
    -------
    >>> apply_bonus_to_salaries([50000, 80000], 0.10)
    [55000.0, 88000.0]
    """
    bonus_multiplier = 1 + bonus_percentage

    # map(function, list) applies the function to each item in the list
    # lambda s: s * bonus_multiplier creates a small function that:
    #   - Takes one parameter 's' (each salary)
    #   - Returns s * bonus_multiplier
    # list() converts the map object to a list
    return list(map(lambda s: s * bonus_multiplier, salaries))


def filter_high_yield_projects(projects, roi_threshold):
    """
    Filters a list of projects to find those with an ROI above a threshold.

    filter() is a higher-order function that keeps only items that
    meet a condition (where the function returns True).

    Parameters
    ----------
    projects : list of tuple
        List of (project_name, roi_percentage) tuples
    roi_threshold : float
        Minimum ROI to include

    Returns
    -------
    list of tuple
        Projects that exceed the ROI threshold

    Example
    -------
    >>> filter_high_yield_projects([("A", 20), ("B", 10)], 15)
    [('A', 20)]
    """
    # filter(function, list) keeps items where function returns True
    # lambda p: p[1] > roi_threshold creates a function that:
    #   - Takes one parameter 'p' (each project tuple)
    #   - Returns True if p[1] (the ROI, 2nd element) > threshold
    # Only projects returning True are kept
    return list(filter(lambda p: p[1] > roi_threshold, projects))


def get_active_customer_names(customers):
    """
    Filters a list of customer dictionaries for active customers and returns their names.

    This demonstrates CHAINING higher-order functions:
    1. First filter() to keep only active customers
    2. Then map() to extract just their names

    Parameters
    ----------
    customers : list of dict
        Customer dictionaries with 'name' and 'subscription_status' keys

    Returns
    -------
    list of str
        Names of active customers

    Example
    -------
    >>> customers = [
    ...     {"name": "Alice", "subscription_status": "active"},
    ...     {"name": "Bob", "subscription_status": "inactive"},
    ... ]
    >>> get_active_customer_names(customers)
    ['Alice']
    """
    # Step 1: Filter for active customers only
    # lambda c: checks if subscription_status == "active"
    active_customers = filter(
        lambda c: c.get("subscription_status") == "active", customers
    )

    # Step 2: Extract just the names from those active customers
    # lambda c: c.get("name") gets the 'name' field from each customer
    return list(map(lambda c: c.get("name"), active_customers))


def sort_products_by_attribute(products, attribute_name):
    """
    Sorts a list of product dictionaries by a specified attribute.

    sorted() can use a 'key' function to determine what to sort by.
    This is powerful for sorting complex objects.

    Parameters
    ----------
    products : list of dict
        Product dictionaries
    attribute_name : str
        The dictionary key to sort by (e.g., 'price', 'quantity')

    Returns
    -------
    list of dict
        Products sorted by the specified attribute (lowest to highest)

    Example
    -------
    >>> products = [{"name": "A", "price": 100}, {"name": "B", "price": 50}]
    >>> sort_products_by_attribute(products, "price")
    [{'name': 'B', 'price': 50}, {'name': 'A', 'price': 100}]
    """
    # sorted(list, key=function) sorts the list
    # The 'key' function determines what value to use for sorting
    # lambda p: p.get(attribute_name, 0) extracts the attribute value
    # Default of 0 handles missing keys gracefully
    return sorted(products, key=lambda p: p.get(attribute_name, 0))


def main():
    """Main function to demonstrate higher-order functions."""
    # --- Using map() to transform a list ---
    print("--- Applying a Bonus to All Salaries ---")
    salaries_list = [50000, 80000, 120000, 65000]
    print(f"Original salaries: {salaries_list}")

    new_salaries_list = apply_bonus_to_salaries(salaries_list, 0.10)  # 10% bonus
    print(f"Salaries after 10% bonus: {new_salaries_list}")
    print("-" * 20)

    # --- Using filter() to select data ---
    print("--- Filtering for High-Yield Projects ---")
    projects_list = [
        ("Project A", 12),
        ("Project B", 20),
        ("Project C", 8),
        ("Project D", 25),
    ]
    print(f"All projects: {projects_list}")

    high_yield_list = filter_high_yield_projects(projects_list, 15)
    print(f"High-yield projects (ROI > 15%): {high_yield_list}")
    print("-" * 20)

    # --- Combining map() and filter() ---
    print("--- Analyzing High-Value Customer Data ---")
    customers_list = [
        {"name": "InnovateCorp", "subscription_status": "active", "monthly_spend": 550},
        {
            "name": "DataDriven Inc.",
            "subscription_status": "inactive",
            "monthly_spend": 120,
        },
        {
            "name": "Analytics LLC",
            "subscription_status": "active",
            "monthly_spend": 210,
        },
    ]
    print(f"Original customer data: {customers_list}")

    active_names = get_active_customer_names(customers_list)
    print(f"Names of active customers: {active_names}")
    print("-" * 20)

    # --- Using sorted() with a lambda key ---
    print("--- Sorting Products by Price ---")
    products_list = [
        {"name": "Laptop", "price": 1200},
        {"name": "Mouse", "price": 25},
        {"name": "Keyboard", "price": 75},
        {"name": "Monitor", "price": 300},
    ]
    print(f"Original product list: {products_list}")

    sorted_products = sort_products_by_attribute(products_list, "price")
    print(f"Products sorted by price: {sorted_products}")
    print("-" * 20)


if __name__ == "__main__":
    main()
