"""
Day 26: Solutions to Exercises
"""

from pathlib import Path

import pandas as pd
from scipy.stats import ttest_ind

# --- Exercise 1: Descriptive Statistics of Sales ---
print("--- Solution to Exercise 1 ---")
resource_dir = Path(__file__).resolve().parent
data_path = resource_dir / "sales_data.csv"

try:
    df = pd.read_csv(data_path)
    df.dropna(inplace=True)  # Clean the data first

    revenue = df["Revenue"]

    print(f"Mean Revenue: ${revenue.mean():,.2f}")
    print(f"Median Revenue: ${revenue.median():,.2f}")
    print(f"Standard Deviation of Revenue: ${revenue.std():,.2f}")
    print(f"Minimum Revenue: ${revenue.min():,.2f}")
    print(f"Maximum Revenue: ${revenue.max():,.2f}")

except FileNotFoundError:
    print("Error: sales_data.csv not found. Keep the CSV beside this script.")
    df = pd.DataFrame()
print("-" * 20)


# --- Exercise 2: Correlation Analysis ---
print("--- Solution to Exercise 2 ---")
if not df.empty:
    # Select only the numerical columns
    numerical_cols = df[["Units Sold", "Price", "Revenue"]]

    # Calculate the correlation matrix
    correlation_matrix = numerical_cols.corr()

    print("Correlation Matrix:")
    print(correlation_matrix)
    print(
        "\nAnswer: 'Units Sold' and 'Revenue' have the strongest positive correlation (0.93)."
    )
else:
    print("DataFrame not available for this exercise.")
print("-" * 20)


# --- Exercise 3: A/B Test Analysis (T-Test) ---
print("--- Solution to Exercise 3 ---")
group_a_durations = [10.5, 12.1, 11.8, 13.0, 12.5]
group_b_durations = [12.8, 13.5, 13.2, 14.0, 13.8]

print(f"Group A Durations: {group_a_durations}")
print(f"Group B Durations: {group_b_durations}")

# Perform the t-test
t_stat, p_value = ttest_ind(group_a_durations, group_b_durations)

print(f"\nP-value: {p_value:.4f}")

# Conclusion based on the p-value
if p_value < 0.05:  # pyright: ignore[reportOperatorIssue]
    print(
        "Conclusion: The result is statistically significant. The two headlines likely have different effects on session duration."
    )
else:
    print(
        "Conclusion: The result is not statistically significant. We cannot conclude there is a difference between the headlines."
    )
print("-" * 20)
