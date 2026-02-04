"""
Day 27: Solutions to Exercises
"""

from pathlib import Path

import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns

# --- Load and Prepare Data ---
# We use the cleaned data from Day 24 for reliable plotting.
resource_dir = Path(__file__).resolve().parent
data_path = resource_dir / "sales_data.csv"

try:
    # We use the data from Day 24, so we need to reference its path
    # parse_dates=['Date'] tells pandas to automatically convert the 'Date' column
    df = pd.read_csv(data_path, parse_dates=["Date"])
    df.dropna(inplace=True)  # Drop rows with missing values for simplicity
    print("Data loaded successfully for exercises.")
except FileNotFoundError:
    print("Error: sales_data.csv not found. Keep the CSV beside this script.")
    df = pd.DataFrame()


if not df.empty:
    # --- Exercise 1: Sales by Product ---
    print("\n--- Solution to Exercise 1 ---")
    plt.figure(figsize=(10, 6))
    # Group by Product and sum the Units Sold for each
    product_sales = df.groupby("Product")["Units Sold"].sum().reset_index()
    sns.barplot(x="Product", y="Units Sold", data=product_sales)
    plt.title("Total Units Sold by Product")
    plt.xlabel("Product Category")
    plt.ylabel("Total Units Sold")
    print("Displaying plot for Exercise 1. Please close the plot window.")
    plt.show()

    # --- Exercise 2: Revenue Over Time ---
    print("\n--- Solution to Exercise 2 ---")
    # Group the data by date and sum the revenue for each day
    daily_revenue = df.groupby("Date")["Revenue"].sum().reset_index()

    plt.figure(figsize=(12, 6))
    sns.lineplot(x="Date", y="Revenue", data=daily_revenue)
    plt.title("Daily Revenue Trend")
    plt.xlabel("Date")
    plt.ylabel("Total Revenue ($)")
    plt.xticks(rotation=45)
    plt.tight_layout()
    print("Displaying plot for Exercise 2. Please close the plot window.")
    plt.show()

    # --- Exercise 3: Price Distribution ---
    print("\n--- Solution to Exercise 3 ---")
    plt.figure(figsize=(10, 6))
    sns.histplot(data=df, x="Price", bins=8, kde=False)
    plt.title("Distribution of Product Prices")
    plt.xlabel("Price Bins ($)")
    plt.ylabel("Number of Products")
    print("Displaying plot for Exercise 3. Please close the plot window.")
    plt.show()
else:
    print("\nSkipping exercises as DataFrame could not be loaded.")
