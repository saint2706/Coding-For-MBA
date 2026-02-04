"""
Day 11: Solutions to Exercises
"""

# --- Exercise 1: Commission Calculator Function ---
print("--- Solution to Exercise 1 ---")


def calculate_commission(sales_amount: float) -> float:
    """
    Calculates a commission of 15% of the sales amount.
    Takes sales_amount as a float, returns the commission as a float.
    """
    commission_rate = 0.15
    return sales_amount * commission_rate


# Example usage:
sample_sale = 5000.00
commission_earned = calculate_commission(sample_sale)
print(f"A sale of ${sample_sale:,.2f} earns a commission of ${commission_earned:,.2f}.")
print("-" * 20)


# --- Exercise 2: Employee Bonus Eligibility Function ---
print("--- Solution to Exercise 2 ---")


def is_eligible_for_bonus(performance_rating: int, years_of_service: int) -> bool:
    """
    Returns True if rating is 4 or 5 AND service is more than 2 years.
    """
    return performance_rating >= 4 and years_of_service > 2


# Test cases:
print(
    f"Rating 5, 3 years service -> Eligible? {is_eligible_for_bonus(5, 3)}"
)  # Expected: True
print(
    f"Rating 4, 3 years service -> Eligible? {is_eligible_for_bonus(4, 3)}"
)  # Expected: True
print(
    f"Rating 5, 1 year service  -> Eligible? {is_eligible_for_bonus(5, 1)}"
)  # Expected: False
print(
    f"Rating 3, 5 years service -> Eligible? {is_eligible_for_bonus(3, 5)}"
)  # Expected: False
print("-" * 20)


# --- Exercise 3: Format Currency Function ---
print("--- Solution to Exercise 3 ---")


def format_currency(number: float) -> str:
    """
    Returns a string formatted as currency with a dollar sign and commas.
    Example: 1250.5 -> "$1,250.50"
    """
    return f"${number:,.2f}"


# Example usage:
amount1 = 1250.5
amount2 = 500
print(f"{amount1} -> {format_currency(amount1)}")
print(f"{amount2} -> {format_currency(amount2)}")
print("-" * 20)
