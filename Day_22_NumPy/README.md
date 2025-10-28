# 📘 Day 22: NumPy - The Foundation of Numerical Computing

While Python lists are flexible, they aren't efficient for large-scale numerical calculations. For
this, we use **NumPy** (Numerical Python), the fundamental package for scientific and numerical
computing in Python. It is the bedrock upon which almost all data science libraries, including
Pandas, are built.

## Why NumPy for Business?

The core advantage of NumPy is **vectorization**. Instead of looping through 10,000 sales figures to
apply a price increase, you can perform the operation on the entire dataset at once. This makes your
code:

1. **Faster:** NumPy operations are performed in highly optimized C code, making them orders of
   magnitude faster than Python loops.
1. **More Readable:** `new_prices = prices * 1.05` is much clearer than a `for` loop.

## Key NumPy Concepts

- **`ndarray`:** The core data structure, a powerful N-dimensional array. It's like a Python list
  but faster and more memory-efficient.
- **Vectorized Operations:** Performing math on entire arrays at once (e.g.,
  `revenue = prices_array * units_array`).
- **Array Methods:** NumPy arrays have built-in methods for fast calculations (e.g., `.sum()`,
  `.mean()`, `.max()`, `.std()`).
- **Boolean Indexing:** Using a conditional to create a boolean array (`True`/`False` values) and
  then using that array to filter your data.

## Environment Setup

Before you begin, ensure you have followed the setup instructions in the main
[README.md](../../README.md) to set up your virtual environment and install the required libraries
(including `numpy`).

## Exploring the Refactored Code

The script for this lesson, `numpy_examples.py`, has been refactored to place each NumPy task into
its own testable function.

1. **Review the Code:** Open `Day_22_NumPy/numpy_examples.py`. Examine the functions
   `calculate_revenue_vectorized()`, `analyze_sales_data()`, and `filter_above_average()`.
1. **Run the Script:** From the root directory of the project (`Coding-For-MBA`), run the script to
   see the functions in action:
   ```bash
   python Day_22_NumPy/numpy_examples.py
   ```
1. **Run the Tests:** You can run the tests for this lesson to verify the correctness of each
   function:
   ```bash
   pytest tests/test_day_22.py
   ```

## 💻 Exercises: Day 22

1. **Vectorized Revenue Calculation:**

   - In a new script (`my_solutions_22.py`), create two Python lists:
     `prices = [12.50, 15.00, 22.50]` and `units = [100, 85, 120]`.
   - Import the `calculate_revenue_vectorized` function from the lesson script.
   - Call the function with your lists and print the resulting NumPy array.

1. **Sales Data Analysis:**

   - You have a list of sales figures: `sales_data = [250, 300, 280, 450, 500, 220, 180]`.
   - Import and use the `analyze_sales_data` function to get a dictionary of statistics.
   - Print the total sales and the mean sales from the returned dictionary.

1. **Conditional Filtering with Arrays:**

   - Import the `filter_above_average` function and the `numpy` library (`import numpy as np`).
   - Create a NumPy array from your `sales_data` list from the previous exercise.
   - Pass this array to the `filter_above_average` function to get a new array containing only the
     sales figures that were better than average.
   - Print the resulting array.

🎉 **Fantastic start!** NumPy is the essential first step into the world of high-performance data
analysis in Python. Understanding vectorization will make all subsequent topics, especially Pandas,
much easier to grasp.
