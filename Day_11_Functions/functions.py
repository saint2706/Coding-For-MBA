"""
Day 11: Building Reusable Business Tools with Functions (Refactored)

This script demonstrates how to define and call functions
to perform repeatable business calculations.
"""


# Type hints make the function's expected inputs and outputs clear
# revenue: float means "revenue parameter should be a float"
# -> float means "this function returns a float"
def get_net_profit(revenue: float, expenses: float) -> float:
    """
    Calculates the net profit from revenue and expenses.

    Functions are reusable blocks of code that perform a specific task.
    They help us avoid repeating code and make programs easier to understand.

    Parameters
    ----------
    revenue : float
        Total revenue (income)
    expenses : float
        Total expenses (costs)

    Returns
    -------
    float
        Net profit (revenue minus expenses)

    Example
    -------
    >>> get_net_profit(500000, 400000)
    100000
    """
    net_profit = revenue - expenses
    return net_profit  # 'return' sends the result back to the caller


def calculate_commission(sales_amount: float) -> float:
    """
    Calculates a 15% commission on a given sales amount.

    Functions can define their own internal variables (like commission_rate).
    These are called "local variables" and only exist inside the function.

    Parameters
    ----------
    sales_amount : float
        The total sales amount

    Returns
    -------
    float
        The commission earned (15% of sales)

    Example
    -------
    >>> calculate_commission(10000)
    1500.0
    """
    # This variable only exists inside this function (local scope)
    commission_rate = 0.15  # 15% commission rate
    commission = sales_amount * commission_rate
    return commission


def is_eligible_for_bonus(performance_rating: int, years_of_service: int) -> bool:
    """
    Checks if an employee is eligible for a bonus based on performance
    and years of service.

    Functions can return boolean values (True/False) which is useful
    for yes/no questions or validation logic.

    Parameters
    ----------
    performance_rating : int
        Employee rating (1-5 scale)
    years_of_service : int
        Number of years with the company

    Returns
    -------
    bool
        True if eligible for bonus, False otherwise

    Example
    -------
    >>> is_eligible_for_bonus(4, 3)
    True
    >>> is_eligible_for_bonus(3, 1)
    False
    """
    # This entire expression evaluates to True or False
    # Returns True if rating is 4 or 5 AND service is more than 2 years
    return performance_rating >= 4 and years_of_service > 2


def format_currency(amount: float) -> str:
    """
    Formats a number into a currency string (e.g., $1,234.56).

    Functions can transform data from one type to another.
    This one takes a number and returns a formatted string.

    Parameters
    ----------
    amount : float
        Dollar amount to format

    Returns
    -------
    str
        Formatted currency string with $ sign and 2 decimal places

    Example
    -------
    >>> format_currency(1234.567)
    '$1,234.57'
    """
    # f-string formatting: {:,.2f} means "format as float with commas and 2 decimals"
    return f"${amount:,.2f}"


def main():
    """Main function to demonstrate the use of the business functions."""
    # --- Using the Functions ---
    print("--- Calculating Company-Wide Profits ---")
    # Let's use our functions to analyze two different products.
    product_a_revenue = 500000
    product_a_expenses = 400000
    product_a_profit = get_net_profit(product_a_revenue, product_a_expenses)
    print(f"Product A Profit: {format_currency(product_a_profit)}")

    product_b_revenue = 250000
    product_b_expenses = 210000
    product_b_profit = get_net_profit(product_b_revenue, product_b_expenses)
    print(f"Product B Profit: {format_currency(product_b_profit)}")

    total_profit = product_a_profit + product_b_profit
    print(f"Total Company Profit: {format_currency(total_profit)}")
    print("-" * 20)

    print("--- Sales and Bonus Calculations ---")
    sales_figure = 12000
    commission_earned = calculate_commission(sales_figure)
    print(
        f"A sale of {format_currency(sales_figure)} earns a commission of {format_currency(commission_earned)}."
    )
    print()

    # Test the bonus eligibility function with different scenarios
    employee1_rating = 5
    employee1_service = 3
    eligibility1 = is_eligible_for_bonus(employee1_rating, employee1_service)
    print(
        f"Employee 1 (Rating: {employee1_rating}, Service: {employee1_service} yrs) is eligible for bonus: {eligibility1}"
    )

    employee2_rating = 4
    employee2_service = 1
    eligibility2 = is_eligible_for_bonus(employee2_rating, employee2_service)
    print(
        f"Employee 2 (Rating: {employee2_rating}, Service: {employee2_service} yr) is eligible for bonus: {eligibility2}"
    )
    print("-" * 20)


if __name__ == "__main__":
    main()
