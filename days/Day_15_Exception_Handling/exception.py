"""
Day 15: Handling Exceptions in Business Logic (Refactored)

This script demonstrates exception handling and iterable unpacking
with more practical, testable functions.
"""


def unpack_country_list(countries):
    """
    Unpacks a list of countries into nordic countries, Estonia, and Russia.
    Uses a try-except block to handle cases where the list is too short.
    """
    if not isinstance(countries, list) or len(countries) < 3:
        return None, None, None

    try:
        # Extended iterable unpacking
        *nordic, estonia, russia = countries
        return nordic, estonia, russia
    except ValueError:
        # This would catch errors if the list had fewer than 2 items,
        # but the initial check makes it mostly for demonstration.
        return None, None, None


def calculate_profit_margin(revenue, profit):
    """
    Calculates the profit margin and handles the case of zero revenue
    to avoid a ZeroDivisionError.
    """
    try:
        margin = (profit / revenue) * 100
        return margin
    except ZeroDivisionError:
        print("Error: Revenue is zero, cannot calculate profit margin.")
        return 0.0  # Return a sensible default
    except TypeError:
        print("Error: Invalid input, revenue and profit must be numbers.")
        return None


def main():
    """Main function to demonstrate exception handling and unpacking."""
    # --- Example 1: Extended Iterable Unpacking ---
    print("--- Unpacking a List of Countries ---")
    country_names = [
        "Finland",
        "Sweden",
        "Norway",
        "Denmark",
        "Iceland",
        "Estonia",
        "Russia",
    ]

    nordic_list, estonia_country, russia_country = unpack_country_list(country_names)

    if nordic_list is not None:
        print("Nordic Countries:", nordic_list)
        print("Estonia:", estonia_country)
        print("Russia:", russia_country)
    print("-" * 20)

    # --- Example 2: Handling a ZeroDivisionError ---
    print("--- Calculating Profit Margin (with Error Handling) ---")

    # Successful case
    revenue1 = 500000
    profit1 = 75000
    margin1 = calculate_profit_margin(revenue1, profit1)
    print(f"Revenue: ${revenue1}, Profit: ${profit1} -> Margin: {margin1:.2f}%")

    # Error case
    revenue2 = 0
    profit2 = -10000  # A loss
    margin2 = calculate_profit_margin(revenue2, profit2)
    print(f"Revenue: ${revenue2}, Profit: ${profit2} -> Margin: {margin2:.2f}%")
    print("-" * 20)


if __name__ == "__main__":
    main()
