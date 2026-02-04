"""
Day 14: Business Logic Module

This file acts as a module containing various reusable functions
for common business calculations and validations.
"""


def calculate_roi(investment: float, profit: float) -> float:
    """Calculates the Return on Investment (ROI)."""
    if investment == 0:
        return 0
    return (profit / investment) * 100


def calculate_future_value(principal: float, rate: float, years: int) -> float:
    """Calculates the future value of an investment with annual compounding."""
    return principal * ((1 + rate) ** years)


def is_eligible_for_promotion(years_of_service: int, performance_rating: int) -> bool:
    """Checks if an employee is eligible for promotion."""
    # Rule: Must have > 3 years of service and a performance rating of 4 or 5.
    return years_of_service > 3 and performance_rating >= 4


def format_as_currency(amount: float) -> str:
    """Formats a number into a standard currency string."""
    return f"${amount:,.2f}"
