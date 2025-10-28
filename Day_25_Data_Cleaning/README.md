# 📘 Day 25: Data Cleaning - The Most Important Skill in Analytics

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
[README.md](../../README.md) to set up your virtual environment and install the required libraries.

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
