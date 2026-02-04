"""
Day 23: Solutions to Exercises
"""

import pandas as pd

# --- Exercise 1: Create an Employee DataFrame ---
print("--- Solution to Exercise 1 ---")
employee_data = {
    "Name": ["Alice", "Bob", "Charlie", "Diana"],
    "Department": ["Sales", "Engineering", "Marketing", "Sales"],
    "Salary": [80000, 120000, 95000, 85000],
}

employee_df = pd.DataFrame(employee_data)

print("Employee DataFrame (employee_df.head()):")
print(employee_df.head())
print()
print("Employee DataFrame Info (employee_df.info()):")
employee_df.info()
print("-" * 20)


# --- Exercise 2: Analyze Sales Data ---
print("--- Solution to Exercise 2 ---")
# First, let's create the DataFrame from the lesson to work with
sales_data = {
    "Product Name": ["Laptop", "Mouse", "Keyboard", "Monitor"],
    "Category": ["Electronics", "Electronics", "Electronics", "Electronics"],
    "Price": [1200, 25, 75, 300],
    "Units Sold": [150, 300, 220, 180],
}
df = pd.DataFrame(sales_data)

# Select and print the 'Product Name' column
print("Product Name column:")
print(df["Product Name"])
print()

# Select and print 'Product Name' and 'Units Sold'
print("Product Name and Units Sold columns:")
print(df[["Product Name", "Units Sold"]])
print()

# Use .describe() for a statistical summary
print("Statistical summary of numerical columns:")
print(df.describe())
print("-" * 20)


# --- Exercise 3: Calculate a New Column ---
print("--- Solution to Exercise 3 ---")
# We use the same df from the previous exercise

# Create the 'Revenue' column
df["Revenue"] = df["Price"] * df["Units Sold"]

print("DataFrame with new 'Revenue' column (df.head()):")
print(df.head())
print("-" * 20)
