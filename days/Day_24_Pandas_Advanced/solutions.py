"""
Day 24: Solutions to Exercises
"""

from pathlib import Path

import pandas as pd

# --- Exercise 1: Load and Inspect ---
print("--- Solution to Exercise 1 ---")
# Load the data
resource_dir = Path(__file__).resolve().parent
data_path = resource_dir / "sales_data.csv"

try:
    df = pd.read_csv(data_path)
    print("Successfully loaded sales_data.csv")

    # View the first few rows
    print("\n.head():")
    print(df.head())

    # Check data types and for missing values
    print("\n.info():")
    df.info()

    # Get statistical overview
    print("\n.describe():")
    print(df.describe())

except FileNotFoundError:
    print(
        "Error: sales_data.csv not found in the Day_24_Pandas_Advanced folder."
        " Keep the CSV beside this script."
    )
print("-" * 20)


# --- Exercise 2: Select and Filter ---
print("--- Solution to Exercise 2 ---")
if "df" in locals():  # Check if the DataFrame was loaded successfully
    # Select 'Product' and 'Revenue' for the first 5 rows using .loc
    # Index labels are 0-4 for the first 5 rows.
    product_revenue_subset = df.loc[  # pyright: ignore[reportPossiblyUnboundVariable]
        0:4, ["Product", "Revenue"]
    ]  # pyright: ignore[reportPossiblyUnboundVariable]
    print("Product and Revenue for first 5 rows:")
    print(product_revenue_subset)
    print()

    # Select all sales from the 'South' region
    south_sales = df[  # pyright: ignore[reportPossiblyUnboundVariable]
        df["Region"] == "South"  # pyright: ignore[reportPossiblyUnboundVariable]
    ]  # pyright: ignore[reportPossiblyUnboundVariable]
    print("All sales from the 'South' region:")
    print(south_sales)
    print()

    # Select sales with Units Sold > 100 AND Revenue > $20,000
    high_performers = df[  # pyright: ignore[reportPossiblyUnboundVariable]
        (df["Units Sold"] > 100)  # pyright: ignore[reportPossiblyUnboundVariable]
        & (df["Revenue"] > 20000)  # pyright: ignore[reportPossiblyUnboundVariable]
    ]  # pyright: ignore[reportPossiblyUnboundVariable]
    print("Sales with >100 Units Sold and >$20,000 Revenue:")
    print(high_performers)
else:
    print("DataFrame 'df' not available for this exercise.")
print("-" * 20)


# --- Exercise 3: Basic Data Cleaning ---
print("--- Solution to Exercise 3 ---")
if "df" in locals():
    # Count missing values in each column
    print("Count of missing values per column:")
    print(df.isnull().sum())  # pyright: ignore[reportPossiblyUnboundVariable]
    print()

    # Create a new DataFrame by dropping rows with missing values
    df_cleaned = df.dropna()  # pyright: ignore[reportPossiblyUnboundVariable]
    print(
        "Shape of original df:",
        df.shape,  # pyright: ignore[reportPossiblyUnboundVariable]
    )  # pyright: ignore[reportPossiblyUnboundVariable]
    print("Shape of cleaned df (after dropna):", df_cleaned.shape)
    print("Missing values count in cleaned df:")
    print(df_cleaned.isnull().sum())
    print()

    # Create another DataFrame where missing Revenue is filled with the mean
    mean_revenue = df[  # pyright: ignore[reportPossiblyUnboundVariable]
        "Revenue"
    ].mean()  # pyright: ignore[reportPossiblyUnboundVariable]
    print(f"Mean revenue to be used for filling: ${mean_revenue:,.2f}")
    df_filled = df.copy()  # pyright: ignore[reportPossiblyUnboundVariable]
    df_filled["Revenue"] = df_filled["Revenue"].fillna(mean_revenue)
    print("Missing values count in filled df:")
    print(df_filled.isnull().sum())
    print("First 5 rows of the filled DataFrame:")
    print(df_filled.head())
else:
    print("DataFrame 'df' not available for this exercise.")
print("-" * 20)
