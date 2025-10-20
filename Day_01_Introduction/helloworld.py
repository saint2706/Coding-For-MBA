"""
Day 1: Python for Business Analytics - First Steps (Refactored)

This script demonstrates basic Python concepts using business-relevant examples.
We will perform a simple profit calculation and check the types of various
business-related data points. This version is refactored to use functions.
"""


def calculate_gross_profit(revenue, cogs):
    """
    Calculates the gross profit from revenue and COGS.
    
    Gross Profit is a key business metric that shows how much money
    a company makes after deducting the costs associated with making
    and selling its products.
    
    Parameters
    ----------
    revenue : float or int
        Total sales revenue (money earned from sales)
    cogs : float or int
        Cost of Goods Sold (direct costs of producing goods)
    
    Returns
    -------
    float or int
        The gross profit (revenue minus COGS)
    
    Example
    -------
    >>> calculate_gross_profit(500000, 350000)
    150000
    """
    # Simple subtraction: Revenue - Costs = Profit
    return revenue - cogs


def calculate_gross_profit_margin(gross_profit, revenue):
    """
    Calculates the gross profit margin as a percentage.
    
    Gross Profit Margin shows what percentage of revenue is actual profit
    after accounting for direct costs. It's a key indicator of business efficiency.
    
    Parameters
    ----------
    gross_profit : float or int
        The gross profit amount
    revenue : float or int
        Total revenue amount
    
    Returns
    -------
    float
        The gross profit margin as a percentage (0-100)
    
    Example
    -------
    >>> calculate_gross_profit_margin(150000, 500000)
    30.0
    """
    # Prevent division by zero - edge case handling
    if revenue == 0:
        return 0
    # Formula: (Gross Profit / Revenue) × 100
    return (gross_profit / revenue) * 100


def display_business_analytics(revenue, cogs):
    """
    Calculates and displays key business metrics in a formatted dashboard.
    
    This function demonstrates how to combine multiple calculations
    and present them in a readable format - a common task in business analytics.
    
    Parameters
    ----------
    revenue : float or int
        Total revenue for the period
    cogs : float or int
        Cost of Goods Sold for the period
    """
    # Print a welcoming header for the dashboard
    print("Welcome to the Quarterly Business Review Dashboard")
    print()  # Empty line for spacing

    # Step 1: Calculate the gross profit using our helper function
    gross_profit = calculate_gross_profit(revenue, cogs)
    
    # Step 2: Calculate the gross profit margin percentage
    gross_profit_margin = calculate_gross_profit_margin(gross_profit, revenue)

    # Step 3: Display all metrics in a formatted way
    # The f-string (f"...") allows us to embed variables directly in strings
    print(f"Total Revenue: ${revenue}")
    print(f"Cost of Goods Sold: ${cogs}")
    print(f"Gross Profit: ${gross_profit}")
    print()
    # The :.2f formats the number to 2 decimal places
    print(f"Gross Profit Margin: {gross_profit_margin:.2f}%")
    print("-" * 20)  # Visual separator


def display_data_types():
    """
    Displays the types of various business-related data points.
    
    Understanding data types is fundamental in Python. Different types
    of data have different capabilities and uses in business analytics.
    """
    print("Checking the types of some common business data points:")

    # Integer (int): Whole numbers like counts or quantities
    units_sold = 1500
    
    # Float: Decimal numbers like prices or percentages
    product_price = 49.99
    
    # String (str): Text data like names or descriptions
    company_name = "InnovateCorp"
    
    # Boolean (bool): True/False values for yes/no questions
    is_in_stock = True
    
    # List: Ordered collection of items (can be mixed types)
    quarterly_sales = [110000, 120000, 135000, 140000]

    # The type() function tells us what data type a variable holds
    print(f"Data: {units_sold}, Type: {type(units_sold)}")
    print(f"Data: {product_price}, Type: {type(product_price)}")
    print(f"Data: '{company_name}', Type: {type(company_name)}")
    print(f"Data: {is_in_stock}, Type: {type(is_in_stock)}")
    print(f"Data: {quarterly_sales}, Type: {type(quarterly_sales)}")


if __name__ == "__main__":
    # This special condition checks if this file is being run directly
    # (not imported as a module). It's a Python best practice.
    
    # --- Basic Business Calculations ---
    # Define our input values (in dollars)
    revenue_main = 500000  # Half a million in revenue
    cogs_main = 350000     # $350k in costs
    
    # Call our function to calculate and display analytics
    display_business_analytics(revenue_main, cogs_main)

    # --- Understanding Data Types in a Business Context ---
    # Show examples of different Python data types commonly used in business
    display_data_types()
