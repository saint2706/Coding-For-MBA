"""
Day 23: Working with Real-World Data using Pandas from a CSV (Refactored)

This script demonstrates how to load data from a CSV file into a
Pandas DataFrame and perform basic filtering and inspection. This version
is refactored into testable functions.
"""

from pathlib import Path
from typing import Optional

import pandas as pd


def load_data_from_csv(file_path: str) -> Optional[pd.DataFrame]:
    """
    Loads data from a CSV file into a Pandas DataFrame.
    Handles potential FileNotFoundError.
    """
    try:
        return pd.read_csv(file_path)
    except FileNotFoundError:
        print(f"❌ Error: The file was not found at {file_path}")
        return None


def filter_by_title(df: pd.DataFrame, keyword: str) -> pd.DataFrame:
    """
    Filters a DataFrame to find rows where the 'title' column contains a keyword.
    This is case-insensitive.
    """
    if df is None or "title" not in df.columns:
        return pd.DataFrame()  # Return empty DataFrame if input is invalid

    # Ensure title column is string type to use .str accessor without mutating the original DataFrame
    title_series = df["title"].astype(str)
    mask = title_series.str.contains(keyword, case=False, na=False)

    return df.loc[mask]


def main():
    """Main function to demonstrate loading and filtering a CSV."""
    print("--- Loading and Filtering Data from a CSV ---")

    # Construct the path to the data file relative to this script's location
    # This makes the script more portable
    resource_dir = Path(__file__).resolve().parent
    data_path = resource_dir.parent / "data" / "hacker_news.csv"

    # 1. Load the data
    print(f"Attempting to load data from: {data_path}")
    df = load_data_from_csv(data_path)

    if df is not None:
        print(f"✅ Successfully loaded DataFrame with shape: {df.shape}")
        print("\n--- First 5 rows ---")
        print(df.head())

        # 2. Filter for titles containing 'Python'
        print("\n--- Filtering for titles containing 'Python' ---")
        python_titles_df = filter_by_title(df, "Python")
        print(f"Found {len(python_titles_df)} titles containing 'Python':")
        # Print only the title column for brevity
        print(python_titles_df["title"].to_string(index=False))

        # 3. Filter for titles containing 'JavaScript'
        print("\n--- Filtering for titles containing 'JavaScript' ---")
        js_titles_df = filter_by_title(df, "JavaScript")
        print(f"Found {len(js_titles_df)} titles containing 'JavaScript':")
        print(js_titles_df["title"].to_string(index=False))


if __name__ == "__main__":
    main()
