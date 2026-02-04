"""
Day 14: Using Modules to Organize Code (Refactored)

This script demonstrates how to import and use functions from
both custom-built modules and Python's built-in modules.
"""

# We are importing the functions we created in the 'business_logic.py' file.
# We use an alias 'bl' to keep our code clean and concise.
import datetime
import math

import business_logic as bl


def demonstrate_custom_module():
    """Demonstrates using functions from the custom business_logic module."""
    print("--- Using Custom Business Logic Module ---")
    investment_amount = 50000
    profit_amount = 12000
    roi = bl.calculate_roi(investment_amount, profit_amount)
    print(
        f"A project with an investment of {bl.format_as_currency(investment_amount)} and profit of {bl.format_as_currency(profit_amount)} has an ROI of {roi:.2f}%."
    )

    years = 4
    rating = 5
    is_eligible = bl.is_eligible_for_promotion(years, rating)
    print(
        f"An employee with {years} years of service and a rating of {rating} is eligible for promotion: {is_eligible}"
    )
    print("-" * 20)


def demonstrate_builtin_modules():
    """Demonstrates using Python's built-in datetime and math modules."""
    print("--- Using Built-in 'datetime' and 'math' Modules ---")
    current_datetime = datetime.datetime.now()
    print(f"Current Date and Time: {current_datetime}")
    print(f"Current Year: {current_datetime.year}")
    print()

    marketing_budget = 100000
    growth_factor = math.sqrt(marketing_budget)
    print(
        f"The growth factor for a marketing budget of {bl.format_as_currency(marketing_budget)} is {growth_factor:.2f}."
    )
    print("-" * 20)


def main():
    """Main function to demonstrate module usage."""
    demonstrate_custom_module()
    demonstrate_builtin_modules()


if __name__ == "__main__":
    main()
