"""
Day 25: Solutions to Exercises
"""

from pathlib import Path

import pandas as pd

# --- Exercise 1: Load and Initial Clean ---
print("--- Solution to Exercise 1 ---")
resource_dir = Path(__file__).resolve().parent
data_path = resource_dir / "messy_sales_data.csv"

try:
    # Load the data
    df = pd.read_csv(data_path)
    print("Original DataFrame info:")
    df.info()

    # Convert 'Order Date' to datetime
    df["Order Date"] = pd.to_datetime(df["Order Date"])
    print("\n'Order Date' column converted to datetime.")

    # Clean and convert 'Price' to float
    df["Price"] = df["Price"].str.replace("$", "").str.replace(",", "").astype(float)
    print("'Price' column cleaned and converted to float.")

    # Clean 'Region' column whitespace
    df["Region"] = df["Region"].str.strip()
    print("'Region' column whitespace stripped.")

    print("\nDataFrame info after initial cleaning:")
    df.info()

except FileNotFoundError:
    print(
        "Error: messy_sales_data.csv not found in the Day_25_Data_Cleaning folder."
        " Keep the CSV beside this script."
    )
    df = pd.DataFrame()
print("-" * 20)


# --- Exercise 2: Standardize Categories ---
print("--- Solution to Exercise 2 ---")
if not df.empty:
    # Standardize 'Product' column to lowercase
    df["Product"] = df["Product"].str.lower()
    print("'Product' column standardized to lowercase.")
    print(f"Unique product values: {df['Product'].unique()}")

    # Standardize 'Region' column to 'USA'
    df["Region"] = df["Region"].replace({"United States": "USA"})
    print("'Region' column standardized to 'USA'.")
    print(f"Unique region values: {df['Region'].unique()}")
else:
    print("DataFrame not available for this exercise.")
print("-" * 20)


# --- Exercise 3: Handle Duplicates ---
print("--- Solution to Exercise 3 ---")
if not df.empty:
    # Check for and count fully duplicate rows
    num_duplicates = df.duplicated().sum()
    print(f"Number of fully duplicate rows found: {num_duplicates}")

    # Create df_cleaned by removing full duplicates
    df_cleaned = df.drop_duplicates()
    print(f"Shape of original df: {df.shape}")
    print(f"Shape after dropping duplicates (df_cleaned): {df_cleaned.shape}")

    # Check for duplicate Order IDs
    num_duplicate_ids = df_cleaned.duplicated(subset=["Order ID"]).sum()
    print(f"\nNumber of duplicate Order IDs found: {num_duplicate_ids}")

    # Create df_final by removing duplicate Order IDs
    df_final = df_cleaned.drop_duplicates(subset=["Order ID"], keep="first")
    print(f"Shape after dropping duplicate Order IDs (df_final): {df_final.shape}")

    print("\nFinal cleaned DataFrame head:")
    print(df_final.head())
else:
    print("DataFrame not available for this exercise.")
print("-" * 20)
