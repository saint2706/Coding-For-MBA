"""
Day 23: Introduction to Pandas

This script demonstrates how to create a Pandas DataFrame,
the primary data structure for data analysis, and how to
perform basic inspections.
"""

# The standard convention for importing pandas is to use the alias 'pd'
import pandas as pd

# --- Creating a DataFrame from a Dictionary ---
# This is a common way to create a DataFrame from scratch.
# The keys of the dictionary become the column names.
# The lists of values become the data in those columns.
data = {
    "Product Name": ["Laptop", "Mouse", "Keyboard", "Monitor", "Webcam"],
    "Category": [
        "Electronics",
        "Electronics",
        "Electronics",
        "Electronics",
        "Peripherals",
    ],
    "Price": [1200, 25, 75, 300, 50],
    "Units Sold": [150, 300, 220, 180, 250],
}

# Create the DataFrame
df = pd.DataFrame(data)


# --- Inspecting the DataFrame ---
# These are the first commands you should run after creating or loading a DataFrame.
print("--- Inspecting the DataFrame ---")

# .head() shows the first 5 rows
print("First 5 rows of the data (df.head()):")
print(df.head())
print("-" * 20)

# .info() gives a summary of the DataFrame's structure
print("DataFrame summary (df.info()):")
df.info()
print("-" * 20)

# .describe() provides descriptive statistics for numerical columns
print("Descriptive statistics (df.describe()):")
print(df.describe())
print("-" * 20)


# --- Selecting Columns ---
print("--- Selecting Columns ---")

# To select a single column, use its name in square brackets.
# This returns a Pandas Series.
price_column = df["Price"]
print("The 'Price' column (a Pandas Series):")
print(price_column)
print()

# To select multiple columns, pass a list of column names.
# This returns a new, smaller DataFrame.
product_and_sales = df[["Product Name", "Units Sold"]]
print("The 'Product Name' and 'Units Sold' columns (a new DataFrame):")
print(product_and_sales)
print("-" * 20)


# --- Creating a New Column (Vectorized Operation) ---
print("--- Creating a New 'Revenue' Column ---")
# Like NumPy, Pandas allows for vectorized operations.
# We can multiply two columns together without a loop.
df["Revenue"] = df["Price"] * df["Units Sold"]

print("DataFrame after adding 'Revenue' column (df.head()):")
print(df.head())
print("-" * 20)
