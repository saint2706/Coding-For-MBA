It's often said that data analysts spend about 80% of their time cleaning and preparing data. Messy,
inconsistent data leads to incorrect analysis and bad business decisions. Learning to clean data
effectively is a true superpower.

## Common Data Cleaning Tasks

- **Correcting Data Types:** Columns are often loaded with the wrong type (e.g., a 'Price' column
  with '$' symbols is read as a string). Use `.astype()` to convert columns to the correct type
  (e.g., `float`, `datetime64[ns]`).
- **String Manipulation:** Use the `.str` accessor on a Series to apply string methods to every
  element at once (e.g., `df['Category'].str.lower()`, `df['Region'].str.strip()`).
- **Standardizing Categories:** Use the `.replace()` method to consolidate inconsistent values
  (e.g., mapping "USA" and "United States" to a single category).
- **Handling Duplicates:** Use `df.drop_duplicates()` to remove duplicate rows. The `subset`
  parameter lets you define which columns to check for duplicates (e.g., `subset=['OrderID']`).

## Environment Setup

Before you begin, ensure you have followed the setup instructions in the main
[README.md](https://github.com/saint2706/Coding-For-MBA/blob/main/README.md) to set up your virtual
environment and install the required libraries.

## Exploring the Refactored Code

The script for this lesson, `data_cleaning.py`, has been refactored to encapsulate the entire
cleaning process into a single, reusable function.

1. **Review the Code:** Open `Day_25_Data_Cleaning/data_cleaning.py`. Examine the
   `clean_sales_data()` function, which performs all the cleaning steps on a DataFrame.
1. **Run the Script:** From the root directory of the project (`Coding-For-MBA`), run the script. It
   will load the messy CSV, pass it to the cleaning function, and print the results.
   ```bash
   python Day_25_Data_Cleaning/data_cleaning.py
   ```
1. **Run the Tests:** The tests use a sample messy DataFrame created in memory to verify that the
   entire cleaning pipeline works as expected.
   ```bash
   pytest tests/test_day_25.py
   ```

## 💻 Exercises: Day 25

For these exercises, you will use the provided `messy_sales_data.csv` file.

1. **Load and Clean:**

   - In a new script (`my_solutions_25.py`), import `pandas` and the `clean_sales_data` function
     from the lesson script.
   - Load the `messy_sales_data.csv` file into a DataFrame.
   - Pass your DataFrame to the `clean_sales_data` function to get a cleaned version.

1. **Verify the Cleaning:**

   - On your new `cleaned_df`, perform the following checks and print the results:
     - Use `.info()` to confirm that 'Order Date' is a datetime and 'Price' is a float.
     - Print the unique values of the 'Product' column (`cleaned_df['Product'].unique()`) to confirm
       they are all lowercase.
     - Check the shape of the original DataFrame versus the cleaned one to see how many rows were
       removed.

🎉 **Incredible work!** Being able to take a messy, real-world dataset and turn it into a clean,
analysis-ready format is arguably the most valuable skill a data analyst can possess.

## Additional Materials

- **data_cleaning.ipynb**\
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_25_Data_Cleaning/data_cleaning.ipynb){
  .md-button }
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_25_Data_Cleaning/data_cleaning.ipynb){
  .md-button .md-button--primary }
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_25_Data_Cleaning/data_cleaning.ipynb){
  .md-button }
- **solutions.ipynb**\
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_25_Data_Cleaning/solutions.ipynb){
  .md-button }
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_25_Data_Cleaning/solutions.ipynb){
  .md-button .md-button--primary }
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_25_Data_Cleaning/solutions.ipynb){
  .md-button }

???+ example "data_cleaning.py"
[View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_25_Data_Cleaning/data_cleaning.py)

````
```python title="data_cleaning.py"
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
```
````

???+ example "solutions.py"
[View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_25_Data_Cleaning/solutions.py)

````
```python title="solutions.py"
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
```
````
