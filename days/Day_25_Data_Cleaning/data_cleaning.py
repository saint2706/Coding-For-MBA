"""
Day 25: Data Cleaning in Practice (Optimized)

This script demonstrates common data cleaning techniques on a
messy, real-world-style dataset using Pandas. This version includes
performance optimizations.
"""

from pathlib import Path

import pandas as pd


def clean_sales_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Cleans the sales data by correcting data types, standardizing text,
    and removing duplicates.
    """
    df_clean = df.copy()

    # --- 1. Correcting Data Types ---
    df_clean["Order Date"] = pd.to_datetime(df_clean["Order Date"])

    # Optimized price cleaning using a single regex
    df_clean["Price"] = (
        df_clean["Price"].str.replace(r"[$,]", "", regex=True).astype(float)
    )

    # --- 2. Cleaning and Standardizing Text Data ---
    df_clean["Region"] = df_clean["Region"].str.strip().str.lower()
    df_clean["Product"] = df_clean["Product"].str.lower()
    df_clean["Region"] = df_clean["Region"].replace({"usa": "united states"})

    # --- 3. Handling Duplicates ---
    df_clean.drop_duplicates(inplace=True)
    df_clean.drop_duplicates(subset=["Order ID"], keep="first", inplace=True)

    return df_clean


def main():  # pragma: no cover
    """
    Main function to load, clean, and inspect the data.
    """
    # --- Load the Messy Data ---
    resource_dir = Path(__file__).resolve().parent
    data_path = resource_dir / "messy_sales_data.csv"

    print("--- Loading and Inspecting Messy Data ---")
    try:
        df = pd.read_csv(data_path)
        print("Original data types (df.info()):")
        df.info()
        print("\nOriginal data head:")
        print(df.head())
    except FileNotFoundError:
        print(
            "Error: messy_sales_data.csv not found in the Day_25_Data_Cleaning folder."
        )
        return

    # --- Clean the Data ---
    df_cleaned = clean_sales_data(
        df.copy()
    )  # Use a copy to avoid SettingWithCopyWarning

    # --- Inspect Cleaned Data ---
    print("\n--- Inspecting Cleaned Data ---")
    print("\nCleaned data types (df.info()):")
    df_cleaned.info()
    print("\nCleaned data head:")
    print(df_cleaned.head())
    print("\nUnique values in 'Region' column:", df_cleaned["Region"].unique())


if __name__ == "__main__":
    main()
