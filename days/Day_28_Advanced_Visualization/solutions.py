"""
Day 28: Solutions to Exercises
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
    df = pd.read_csv(data_path, parse_dates=["Date"])
    df.dropna(inplace=True)  # Drop rows with missing values for simplicity
    print("Data loaded successfully for exercises.")
except FileNotFoundError:
    print("Error: sales_data.csv not found. Keep the CSV beside this script.")
    df = pd.DataFrame()


if not df.empty:
    # --- Exercise 1: Create a Customized Sales Chart ---
    print("\n--- Solution to Exercise 1 ---")

    # Calculate total and average revenue by product
    product_revenue = df.groupby("Product")["Revenue"].sum()
    average_revenue = product_revenue.mean()

    plt.figure(figsize=(10, 7))
    sns.barplot(x=product_revenue.index, y=product_revenue.values)

    # Customizations
    plt.title("Total Revenue per Product", fontsize=16)
    plt.ylabel("Total Revenue (USD)", fontsize=12)
    plt.xlabel("Product", fontsize=12)
    plt.axhline(
        y=average_revenue,
        color="red",
        linestyle="--",
        label=f"Average Revenue (${average_revenue:,.2f})",
    )
    plt.legend()

    # Save the figure
    plt.savefig("product_revenue.png", dpi=300)
    print("Plot for Exercise 1 saved to 'product_revenue.png'. Displaying plot now.")
    plt.show()

    # --- Exercise 2: Build a 2x1 Dashboard ---
    print("\n--- Solution to Exercise 2 ---")

    # Create the figure and axes grid
    fig, axes = plt.subplots(nrows=2, ncols=1, figsize=(12, 10))

    # --- Top Plot: Units Sold Trend ---
    daily_units = df.groupby("Date")["Units Sold"].sum().reset_index()
    sns.lineplot(x="Date", y="Units Sold", data=daily_units, ax=axes[0])
    axes[0].set_title("Trend of Units Sold Over Time", fontsize=14)
    axes[0].set_xlabel("Date")
    axes[0].set_ylabel("Total Units Sold")

    # --- Bottom Plot: Price vs. Units Sold ---
    sns.scatterplot(x="Price", y="Units Sold", data=df, ax=axes[1], hue="Region")
    axes[1].set_title("Price vs. Units Sold by Region", fontsize=14)
    axes[1].set_xlabel("Price per Unit ($)")
    axes[1].set_ylabel("Units Sold per Transaction")

    # --- Final Touches ---
    fig.suptitle("Sales Analysis Dashboard", fontsize=20, weight="bold")
    plt.tight_layout(rect=(0, 0.03, 1, 0.95))

    print("Displaying plot for Exercise 2. Please close the plot window.")
    plt.show()

else:
    print("\nSkipping exercises as DataFrame could not be loaded.")
