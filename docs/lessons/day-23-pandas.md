If NumPy is the foundation, **Pandas** is the tool you will use every single day for practical data
analysis. It is the most important library for data manipulation in Python, giving it the
capabilities of a super-powered spreadsheet.

## The Core Data Structures: Series and DataFrame

- **`Series`**: A one-dimensional labeled array, like a single column in a spreadsheet.
- **`DataFrame`**: A two-dimensional labeled table with columns of potentially different types. This
  is the primary object you will work with in Pandas.

## Key DataFrame Operations

- **Creation:** Create a DataFrame from a dictionary (`pd.DataFrame(my_dict)`) or by reading a file
  (`pd.read_csv('my_file.csv')`).
- **Inspection:** Always inspect your data after loading.
  - `df.head()`: Shows the first 5 rows.
  - `df.info()`: Provides a summary of columns, data types, and non-null values.
  - `df.describe()`: Generates descriptive statistics for numerical columns.
- **Selection:** Select a single column (`df['ColumnName']`) or multiple columns
  (`df[['Col1', 'Col2']]`).
- **Vectorized Operations:** Create new columns by performing operations on existing ones (e.g.,
  `df['Revenue'] = df['Price'] * df['Units Sold']`).

## Environment Setup

Before you begin, ensure you have followed the setup instructions in the main
[README.md](https://github.com/saint2706/Coding-For-MBA/blob/main/README.md) to set up your virtual environment and install the required libraries
(including `pandas`).

## Exploring the Refactored Code

The content for this lesson is split into two main files:

1. **`pandas_introduction.ipynb`**: A new Jupyter Notebook that interactively walks through creating
   a DataFrame from scratch, inspecting it, and creating a visualization. This is the recommended
   starting point for this lesson.
1. **`pandas_from_csv.py`**: A refactored Python script that demonstrates the more common workflow
   of loading data from a CSV file and filtering it.

### Running the Code

- To explore the notebook, you'll need to have Jupyter installed (`pip install jupyter`) and run
  `jupyter notebook` from your terminal.
- To run the script from the root directory of the project (`Coding-For-MBA`):
  ```bash
  python Day_23_Pandas/pandas_from_csv.py
  ```
- To run the tests for the script:
  ```bash
  pytest tests/test_day_23.py
  ```

## 💻 Exercises: Day 23

1. **Create an Employee DataFrame:**

   - In a new script (`my_solutions_23.py`), create a Python dictionary to store data for 3-4
     employees (e.g., `Name`, `Department`, `Salary`).
   - Convert this dictionary into a Pandas DataFrame and print it.

1. **Analyze Sales Data from a File:**

   - Import the `load_data_from_csv` and `filter_by_title` functions from the `pandas_from_csv`
     script.
   - The path to the data file is `data/hacker_news.csv`. Load it using the function.
   - Use the `filter_by_title` function to find all articles with "Google" in the title and print
     their titles.

1. **Calculate a New Column:**

   - Create a DataFrame with `'Price'` and `'Units Sold'` columns.
   - Create a new column called `'Revenue'` by multiplying the 'Price' and 'Units Sold' columns.
   - Display the DataFrame with the new `'Revenue'` column.

🎉 **Welcome to Pandas!** You've just learned how to create and inspect the most fundamental object
in data analysis. In the next lesson, we'll dive deeper into selecting, filtering, and cleaning
data.

## Additional Materials

- **pandas_from_csv.ipynb**
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_23_Pandas/pandas_from_csv.ipynb){ .md-button }
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_23_Pandas/pandas_from_csv.ipynb){ .md-button .md-button--primary }
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_23_Pandas/pandas_from_csv.ipynb){ .md-button }
- **pandas_intro.ipynb**
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_23_Pandas/pandas_intro.ipynb){ .md-button }
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_23_Pandas/pandas_intro.ipynb){ .md-button .md-button--primary }
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_23_Pandas/pandas_intro.ipynb){ .md-button }
- **solutions.ipynb**
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_23_Pandas/solutions.ipynb){ .md-button }
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_23_Pandas/solutions.ipynb){ .md-button .md-button--primary }
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_23_Pandas/solutions.ipynb){ .md-button }

???+ example "pandas_from_csv.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_23_Pandas/pandas_from_csv.py)

    ```python title="pandas_from_csv.py"
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
    ```

???+ example "pandas_intro.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_23_Pandas/pandas_intro.py)

    ```python title="pandas_intro.py"
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
    ```

???+ example "solutions.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_23_Pandas/solutions.py)

    ```python title="solutions.py"
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
    ```
