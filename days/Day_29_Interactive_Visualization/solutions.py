"""
Day 29: Solutions to Exercises
"""

from pathlib import Path

import pandas as pd
import plotly.express as px

# --- Load and Prepare Data ---
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
    # --- Exercise 1: Interactive Sales by Product ---
    print("\n--- Solution to Exercise 1 ---")

    # Group the data by Product to get the sum of Revenue
    product_revenue = df.groupby("Product")["Revenue"].sum().reset_index()

    # Create the interactive bar chart
    fig1 = px.bar(
        product_revenue,
        x="Product",
        y="Revenue",
        title="Total Revenue by Product",
        labels={"Revenue": "Total Revenue (USD)"},
        color="Product",
    )

    # In a real environment, you would use fig1.show()
    # For this exercise, we'll save it to an HTML file.
    fig1.write_html("product_revenue_bar_chart.html")
    print("Plot for Exercise 1 saved to 'product_revenue_bar_chart.html'")

    # --- Exercise 2: Interactive Revenue vs. Units Sold ---
    print("\n--- Solution to Exercise 2 ---")

    # Create the interactive scatter plot
    fig2 = px.scatter(
        df,
        x="Units Sold",
        y="Revenue",
        color="Region",
        title="Revenue vs. Units Sold by Region",
        labels={"Units Sold": "Number of Units Sold", "Revenue": "Total Revenue (USD)"},
        hover_data=["Product"],  # Add Product to the hover tooltip
    )

    # Save the chart to an HTML file
    fig2.write_html("revenue_scatterplot.html")
    print("Plot for Exercise 2 saved to 'revenue_scatterplot.html'")

else:
    print("\nSkipping exercises as DataFrame could not be loaded.")
