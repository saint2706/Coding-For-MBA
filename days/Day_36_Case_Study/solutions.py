"""
Day 36: Solution to the Capstone Case Study
"""

import matplotlib.pyplot as plt
import pandas as pd

# --- Step 1 & 2: Load and Clean the Data ---
print("--- Step 1 & 2: Loading and Cleaning Data ---")
try:
    df = pd.read_csv("case_study_sales.csv", parse_dates=["Date"])
    print("Data loaded successfully.")

    # Check for missing values
    if df.isnull().sum().sum() > 0:
        print("Missing values found. Dropping rows with missing data.")
        df.dropna(inplace=True)

    # Ensure numeric columns are properly typed
    numeric_columns = ["Price", "Units Sold"]
    has_revenue_column = "Revenue" in df.columns
    if has_revenue_column:
        numeric_columns.append("Revenue")
    for col in numeric_columns:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    if has_revenue_column:
        if df["Revenue"].isnull().any():
            print(
                "Revenue column contained missing or non-numeric values. Recalculating from Price and Units Sold."
            )
            df["Revenue"] = df["Price"] * df["Units Sold"]
    else:
        print("Revenue column not found. Creating it from Price and Units Sold.")
        df["Revenue"] = df["Price"] * df["Units Sold"]

    print("Data cleaned and 'Revenue' column created.")

except FileNotFoundError:
    print("Error: case_study_sales.csv not found.")
    df = pd.DataFrame()

if not df.empty:
    # --- Step 3: Exploratory Data Analysis (EDA) ---
    print("\n--- Step 3: Answering Key Business Questions ---")

    # 1. Top 5 products by total revenue
    top_products = (
        df.groupby("Product")["Revenue"].sum().sort_values(ascending=False).head(5)
    )
    print("\n1. Top 5 Products by Revenue:")
    print(top_products)

    # 2. Top sales region by revenue
    region_revenue = df.groupby("Region")["Revenue"].sum().sort_values(ascending=False)
    print("\n2. Revenue by Region:")
    print(region_revenue)

    # 3. Customer segment and sales channel performance
    segment_revenue = (
        df.groupby("Customer Segment")["Revenue"].sum().sort_values(ascending=False)
    )
    channel_revenue = (
        df.groupby("Sales Channel")["Revenue"].sum().sort_values(ascending=False)
    )
    print("\n3. Revenue by Customer Segment:")
    print(segment_revenue)
    print("\n4. Revenue by Sales Channel:")
    print(channel_revenue)

    # 4. Correlation between Price and Units Sold
    correlation = df[["Price", "Units Sold"]].corr()
    print("\n5. Correlation between Price and Units Sold:")
    print(correlation)

    # 5. Monthly revenue trend
    monthly_revenue = df.set_index("Date")["Revenue"].resample("M").sum()
    print("\n6. Monthly Revenue Trend:")
    print(monthly_revenue)

    # --- Step 4: Visualize Your Findings ---
    print("\n--- Step 4: Generating Visualizations ---")

    # Plot 1: Top 5 Products by Revenue
    plt.figure(figsize=(10, 6))
    top_products.plot(kind="bar")
    plt.title("Top 5 Products by Total Revenue", fontsize=16)
    plt.ylabel("Total Revenue ($)")
    plt.xlabel("Product")
    plt.xticks(rotation=45)
    print("Displaying plot 1...")
    plt.show()

    # Plot 2: Revenue by Region
    plt.figure(figsize=(10, 6))
    region_revenue.plot(kind="pie", autopct="%1.1f%%", startangle=90)
    plt.title("Revenue Contribution by Region", fontsize=16)
    plt.ylabel("")  # Hide the y-label for pie charts
    print("Displaying plot 2...")
    plt.show()

    # Plot 3: Revenue by Customer Segment
    plt.figure(figsize=(10, 6))
    segment_revenue.plot(kind="bar")
    plt.title("Revenue by Customer Segment", fontsize=16)
    plt.ylabel("Total Revenue ($)")
    plt.xlabel("Customer Segment")
    plt.xticks(rotation=45)
    print("Displaying plot 3...")
    plt.show()

    # Plot 4: Monthly Revenue Trend
    plt.figure(figsize=(12, 6))
    monthly_revenue.plot(kind="line", marker="o")
    plt.title("Monthly Revenue Trend", fontsize=16)
    plt.ylabel("Total Revenue ($)")
    plt.xlabel("Date")
    print("Displaying plot 4...")
    plt.show()

    # --- Step 5: Summary and Recommendations ---
    print("\n--- Step 5: Summary and Recommendations ---")
    summary = """
    Key Insights:
    1. Laptops continue to dominate revenue, with smartphones and tablets forming a strong secondary tier.
    2. The North and South regions lead performance, but international sales are a growing share thanks to strong marketplace channels.
    3. Enterprise customers drive the bulk of revenue across both online and partner channels, while consumer sales excel through retail and marketplace partners.
    4. There remains only a modest relationship between price and units sold, so pricing adjustments should be paired with targeted marketing.

    Recommendations:
    1. Double-down on laptop bundles and smartphone upsells for enterprise and consumer segments, respectively.
    2. Invest in the marketplace channel internationally while reinforcing partner relationships in top-performing regions.
    3. Monitor pricing experiments carefully, coupling them with targeted campaigns rather than broad discounts.
    """
    print(summary)

else:
    print("\nSkipping analysis as DataFrame could not be loaded.")
