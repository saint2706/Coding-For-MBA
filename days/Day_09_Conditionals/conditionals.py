"""
Day 9: Implementing Business Logic with Conditionals (Refactored)

This script demonstrates how to use if, elif, and else statements
to create business rules and make decisions in code. This version is
refactored into functions for better organization and testability.
"""


def calculate_discount_percent(purchase_amount):
    """
    Calculates a discount percentage based on the purchase amount.

    This demonstrates if/elif/else statements - the foundation of
    decision-making in programming. The computer checks each condition
    in order and executes the first matching block.

    Business Rule:
    - Over $100: 10% discount
    - Over $50: 5% discount
    - Otherwise: No discount

    Parameters
    ----------
    purchase_amount : float or int
        The total purchase amount in dollars

    Returns
    -------
    float
        The discount rate as a decimal (e.g., 0.10 for 10%)

    Example
    -------
    >>> calculate_discount_percent(125.50)
    0.10
    >>> calculate_discount_percent(75.00)
    0.05
    """
    # First, validate the input (edge case handling)
    if not isinstance(purchase_amount, (int, float)) or purchase_amount < 0:
        return 0.0

    # Check conditions from most specific to least specific
    # The order matters! Python checks these top-to-bottom
    if purchase_amount > 100.00:
        return 0.10  # 10% discount for big purchases
    elif purchase_amount > 50.00:
        return 0.05  # 5% discount for medium purchases
    else:
        return 0.00  # No discount for small purchases


def calculate_shipping_cost(country, order_weight_kg):
    """
    Calculates shipping cost based on destination and weight.

    This demonstrates NESTED if statements - conditionals inside conditionals.
    This is common when you have multiple factors affecting a decision.

    Parameters
    ----------
    country : str
        Destination country ("USA" or "Canada")
    order_weight_kg : float
        Weight of the order in kilograms

    Returns
    -------
    int
        Shipping cost in dollars, or -1 if shipping not available

    Example
    -------
    >>> calculate_shipping_cost("USA", 60)
    75
    """
    # First level: Check the country
    if country == "USA":
        # Second level (nested): Check the weight within USA
        if order_weight_kg > 50:
            return 75  # Heavy package to USA
        else:
            return 50  # Light package to USA
    elif country == "Canada":
        # Second level (nested): Check the weight within Canada
        if order_weight_kg > 50:
            return 100  # Heavy package to Canada
        else:
            return 65  # Light package to Canada
    else:
        # Country not supported
        return -1  # Using -1 to indicate "not available"


def calculate_employee_bonus(performance_rating, department, salary):
    """
    Calculates an employee's bonus based on performance and department.

    This demonstrates complex conditional logic combining multiple factors.
    Real business logic often depends on multiple conditions.

    Parameters
    ----------
    performance_rating : int
        Employee rating (1-5 scale)
    department : str
        Employee's department
    salary : float
        Annual salary

    Returns
    -------
    float
        Bonus amount in dollars

    Example
    -------
    >>> calculate_employee_bonus(5, "Sales", 80000)
    12000.0
    """
    # Top performers get bonuses
    if performance_rating >= 4:
        # Sales department gets higher bonuses (15% vs 10%)
        if department == "Sales":
            return salary * 0.15  # 15% bonus for high-performing sales
        else:
            return salary * 0.10  # 10% bonus for high performers in other depts
    # Average performers get a smaller bonus
    elif performance_rating == 3:
        return salary * 0.05  # 5% bonus for meeting expectations
    # Below-average performers get no bonus
    else:
        return 0.0  # No bonus


if __name__ == "__main__":
    # --- Example 1: Customer Discount Policy ---
    print("--- Customer Discount Calculator ---")
    customer_purchase = 125.50
    discount_rate = calculate_discount_percent(customer_purchase)
    discount = customer_purchase * discount_rate
    final = customer_purchase - discount

    print(f"Original Price: ${customer_purchase:.2f}")
    print(f"Discount ({discount_rate * 100}%): ${discount:.2f}")
    print(f"Final Price: ${final:.2f}")
    print("-" * 20)

    # --- Example 2: Nested Conditionals for Shipping Costs ---
    print("--- Shipping Cost Calculator ---")
    shipping_country = "Canada"
    weight = 60
    cost = calculate_shipping_cost(shipping_country, weight)

    if cost != -1:
        print(f"Shipping to {shipping_country} for a {weight}kg package costs: ${cost}")
    else:
        print(f"Sorry, shipping to {shipping_country} is not available.")
    print("-" * 20)

    # --- Example 3: Complex Bonus Calculation ---
    print("--- Employee Bonus Calculator ---")
    emp_rating = 5
    emp_dept = "Sales"
    emp_salary = 80000
    bonus_amount = calculate_employee_bonus(emp_rating, emp_dept, emp_salary)

    print(
        f"Employee in {emp_dept} with rating {emp_rating} gets a bonus of: ${bonus_amount:.2f}"
    )
    print("-" * 20)
