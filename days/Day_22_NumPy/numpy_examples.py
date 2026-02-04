"""
Day 22: NumPy in Action for Business Analytics (Refactored)

This script demonstrates fundamental NumPy operations for
efficient numerical analysis of business data. This version is
refactored into functions for better organization and testability.
"""

import numpy as np


def calculate_revenue_vectorized(prices: list, units: list) -> np.ndarray:
    """
    Calculates revenue by performing a vectorized multiplication of prices and units.
    """
    prices_array = np.array(prices)
    units_array = np.array(units)
    return prices_array * units_array


def analyze_sales_data(sales: list) -> dict:
    """
    Analyzes a list of sales data and returns a dictionary of key statistics.
    """
    sales_array = np.array(sales)
    if sales_array.size == 0:
        return {}

    return {
        "total": sales_array.sum(),
        "mean": sales_array.mean(),
        "max": sales_array.max(),
        "min": sales_array.min(),
        "std_dev": sales_array.std(),
    }


def filter_above_average(data: np.ndarray) -> np.ndarray:
    """
    Filters a NumPy array to return only the elements above its average.
    """
    if data.size == 0:
        return np.array([])

    average = data.mean()
    return data[data > average]


def main():
    """Main function to demonstrate NumPy capabilities."""
    # --- Example 1: Vectorized Calculations ---
    print("--- Calculating Revenue with Vectorization ---")
    prices_data = [12.50, 15.00, 22.50, 18.00, 19.99]
    units_data = [100, 85, 120, 95, 110]

    revenue_data = calculate_revenue_vectorized(prices_data, units_data)
    print(f"Prices array: {np.array(prices_data)}")
    print(f"Units sold array: {np.array(units_data)}")
    print(f"Revenue per product (vectorized): {revenue_data}")
    print("-" * 20)

    # --- Example 2: Sales Data Analysis ---
    print("--- Analyzing Weekly Sales Data ---")
    weekly_sales_data = [250, 300, 280, 450, 500, 220, 180]
    sales_stats = analyze_sales_data(weekly_sales_data)

    print(f"Sales for the week: {np.array(weekly_sales_data)}")
    print(f"Total weekly sales: ${sales_stats['total']:.2f}")
    print(f"Average daily sales: ${sales_stats['mean']:.2f}")
    print(f"Best sales day: ${sales_stats['max']:.2f}")
    print(f"Worst sales day: ${sales_stats['min']:.2f}")
    print(f"Standard deviation of sales: ${sales_stats['std_dev']:.2f}")
    print("-" * 20)

    # --- Example 3: Conditional Filtering ---
    print("--- Filtering for Above-Average Sales Days ---")
    sales_array = np.array(weekly_sales_data)
    good_days = filter_above_average(sales_array)

    print(f"The sales figures for good days were: {good_days}")
    print(f"Number of good sales days: {len(good_days)}")
    print("-" * 20)


if __name__ == "__main__":
    main()
