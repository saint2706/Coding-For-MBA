"""
Day 2: Storing and Analyzing Business Data (Refactored)

This script demonstrates the use of variables to store business data
and built-in functions to perform basic analysis. This version is
refactored into functions for better organization and testability.
"""


def display_company_profile(name, founded, revenue, is_public):
    """
    Displays the company's profile information in a formatted way.
    
    This function demonstrates how variables can store different types
    of business data and how to present them clearly.
    
    Parameters
    ----------
    name : str
        The company name
    founded : int
        The year the company was founded
    revenue : float
        Current annual revenue in dollars
    is_public : bool
        Whether the company is publicly traded (True) or private (False)
    """
    print("--- Company Profile ---")
    # f-strings (f"...{variable}...") make it easy to insert variable values into text
    print(f"Company Name: {name}")
    print(f"Year Founded: {founded}")
    print(f"Current Revenue: ${revenue}")
    print(f"Is Publicly Traded: {is_public}")
    print("-" * 20)  # Print a separator line


def analyze_weekly_sales(sales_data):
    """
    Analyzes and prints a summary of weekly sales data.
    
    This function demonstrates Python's built-in functions:
    - len(): counts items in a list
    - sum(): adds all numbers in a list
    - min(): finds the smallest value
    - max(): finds the largest value
    
    Parameters
    ----------
    sales_data : list of float
        A list of individual sale amounts
    
    Returns
    -------
    dict or None
        Dictionary with sales statistics, or None if no data provided
    """
    # Check if the list is empty - important edge case!
    if not sales_data:
        print("No sales data to analyze.")
        return

    print("--- Weekly Sales Analysis ---")
    
    # Built-in function len() counts how many items are in the list
    num_transactions = len(sales_data)
    
    # Built-in function sum() adds up all the numbers in the list
    total_revenue = sum(sales_data)
    
    # Built-in function min() finds the smallest number
    smallest_sale = min(sales_data)
    
    # Built-in function max() finds the largest number
    largest_sale = max(sales_data)
    
    # Calculate average: total divided by count
    # The "if...else" prevents division by zero
    average_sale = total_revenue / num_transactions if num_transactions > 0 else 0

    # Display the results with proper formatting
    print(f"Number of Transactions: {num_transactions}")
    print(f"Total Weekly Revenue: ${total_revenue:.2f}")  # .2f = 2 decimal places
    print(f"Smallest Sale: ${smallest_sale:.2f}")
    print(f"Largest Sale: ${largest_sale:.2f}")
    print(f"Average Sale Amount: ${round(average_sale, 2)}")  # round() is another built-in
    print("-" * 20)

    # Return a dictionary with all the calculated values
    # This allows other code to use these results programmatically
    return {
        "num_transactions": num_transactions,
        "total_revenue": total_revenue,
        "smallest_sale": smallest_sale,
        "largest_sale": largest_sale,
        "average_sale": average_sale,
    }


def interactive_profit_calculator():
    """
    Handles user input to calculate and display profit.
    
    This function demonstrates:
    - The input() function to get user input
    - Type conversion with float()
    - Error handling with try/except blocks
    
    Returns
    -------
    float or None
        The calculated profit, or None if invalid input provided
    """
    print("--- Interactive Profit Calculator ---")
    try:
        # input() gets text from the user
        # float() converts the text string to a decimal number
        user_revenue = float(input("Enter your total revenue: "))
        user_expenses = float(input("Enter your total expenses: "))
        
        # Simple calculation: Revenue - Expenses = Profit
        profit = user_revenue - user_expenses
        print(f"Your calculated profit is: ${profit:.2f}")
        return profit
    except ValueError:
        # If the user enters something that can't be converted to a number,
        # Python raises a ValueError. We catch it and handle it gracefully.
        print("Invalid input. Please enter numbers only.")
        return None


if __name__ == "__main__":
    # This block only runs when the file is executed directly
    
    # --- Storing Company Profile in Variables ---
    # We pass different types of data: string, int, float, and boolean
    display_company_profile("InnovateCorp", 2015, 2500000.50, False)

    # --- Using Built-in Functions for Sales Analysis ---
    # Create a list of individual sale amounts (floats)
    weekly_sales_data = [150.50, 200.00, 75.25, 300.75, 120.00, 450.50, 275.00]
    # Analyze this data using Python's built-in functions
    analyze_weekly_sales(weekly_sales_data)

    # --- Getting User Input ---
    # Note: This part is not easily testable in an automated way without mocking input.
    # The function is separated to keep the core logic testable.
    # Uncomment the line below to try the interactive calculator:
    # interactive_profit_calculator()
