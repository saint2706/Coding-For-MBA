"""
Day 6: Using Tuples for Immutable Business Data (Refactored)

This script demonstrates the creation and use of tuples to store
data that should not be changed, such as transaction records or
fixed coordinates. This version is refactored into functions for
better organization and testability.
"""


def get_location_coordinates(location_tuple):
    """
    Returns the latitude and longitude from a location tuple.

    Tuples are like lists but immutable (cannot be changed after creation).
    They're perfect for fixed data like coordinates.

    Parameters
    ----------
    location_tuple : tuple
        A tuple in the format (latitude, longitude)

    Returns
    -------
    tuple of (float, float) or (None, None)
        The latitude and longitude, or (None, None) if invalid

    Example
    -------
    >>> get_location_coordinates((40.7128, -74.0060))
    (40.7128, -74.006)
    """
    # Check if it's actually a tuple and has exactly 2 elements
    if isinstance(location_tuple, tuple) and len(location_tuple) == 2:
        # Access tuple elements by index (just like lists)
        return location_tuple[0], location_tuple[1]
    return None, None  # Return None values if invalid


def unpack_transaction(transaction_tuple):
    """
    Unpacks a transaction tuple into a dictionary.

    Tuple unpacking is a powerful feature where we can assign tuple
    elements to multiple variables in one line.

    Parameters
    ----------
    transaction_tuple : tuple
        A tuple in format (id, date, amount)

    Returns
    -------
    dict or None
        Dictionary with 'id', 'date', and 'amount' keys, or None if invalid

    Example
    -------
    >>> unpack_transaction((1001, "2024-03-15", 499.99))
    {'id': 1001, 'date': '2024-03-15', 'amount': 499.99}
    """
    # Validate the tuple format
    if isinstance(transaction_tuple, tuple) and len(transaction_tuple) == 3:
        # Tuple unpacking: assign each element to a named variable
        # This makes the code more readable than using indices
        trans_id, date, amount = transaction_tuple

        # Return as a dictionary for structured access
        return {"id": trans_id, "date": date, "amount": amount}
    return None  # Return None if format is invalid


def demonstrate_list_vs_tuple():
    """
    Prints scenarios demonstrating when to use a list vs. a tuple.

    Key difference:
    - Lists are MUTABLE (can be changed): use for data that might change
    - Tuples are IMMUTABLE (cannot be changed): use for fixed/constant data

    This immutability makes tuples:
    - Safer (prevents accidental changes)
    - Faster (Python can optimize them)
    - Suitable as dictionary keys (lists cannot be used as keys)
    """
    print("--- Choosing Between a List and a Tuple ---")

    # Scenario A: Data that changes over time → Use a LIST
    # Sales data is likely to be updated or amended.
    monthly_sales = [45000, 52000, 48000, 55000]
    print(
        f"Scenario A (Monthly Sales): Use a list. Data might change. Example: {monthly_sales}"
    )

    # Scenario B: Fixed constant data → Use a TUPLE
    # The brand color is a fixed constant and should not change.
    brand_color_rgb = (45, 85, 150)  # RGB values for a specific color
    print(
        f"Scenario B (Brand Color): Use a tuple. Data is constant. Example: {brand_color_rgb}"
    )

    # Scenario C: Data that grows/shrinks → Use a LIST
    # Employees can be added or removed from the department.
    marketing_team = ["Alice", "Bob", "Charlie"]
    print(
        f"Scenario C (Team Roster): Use a list. Roster changes. Example: {marketing_team}"
    )

    # Scenario D: Core identifying information → Use a TUPLE
    # This core identifying information for a company is fixed.
    company_profile = ("InnovateCorp", 2015, "INVC")
    print(
        f"Scenario D (Company Profile): Use a tuple. Core info is fixed. Example: {company_profile}"
    )
    print("-" * 20)


if __name__ == "__main__":
    # --- Using a Tuple for Fixed Data ---
    print("--- Storing Fixed Location Data ---")
    hq_coords = (40.7128, -74.0060)
    lat, lon = get_location_coordinates(hq_coords)
    if lat is not None:
        print(f"Headquarters Latitude: {lat}")
        print(f"Headquarters Longitude: {lon}")
    print()

    # --- Unpacking Tuples for Readability ---
    print("--- Unpacking a Transaction Record ---")
    transaction_data = (1001, "2024-03-15", 499.99)
    unpacked_data = unpack_transaction(transaction_data)
    if unpacked_data:
        print(f"Transaction ID: {unpacked_data['id']}")
        print(f"Date: {unpacked_data['date']}")
        print(f"Amount: ${unpacked_data['amount']}")
    print("-" * 20)

    # --- List vs. Tuple Demonstration ---
    demonstrate_list_vs_tuple()
