In data analysis, you constantly create new lists by transforming or filtering existing ones. While `for` loops work, Python provides a more concise, powerful, and often faster way to do this: a **list comprehension**.

## The Syntax of List Comprehension

A list comprehension creates a new list in a single, readable line.

`new_list = [expression for item in iterable if condition]`

1. **`[expression ... ]`**: The brackets that create the new list.
1. **`expression`**: What to do with each item (e.g., `item * 1.1`, `item["name"]`).
1. **`for item in iterable`**: The loop part that iterates through the original list.
1. **`if condition` (Optional):** A filter that decides whether to include the item.

```python
# The for loop way
large_sales = []
for sale in sales:
    if sale > 1000:
        large_sales.append(sale)

# The list comprehension way
large_sales = [sale for sale in sales if sale > 1000]
```

## Environment Setup

Before you begin, ensure you have followed the setup instructions in the main [README.md](https://github.com/saint2706/Coding-For-MBA/blob/main/README.md) to set up your virtual environment and install the required libraries.

## Exploring the Refactored Code

The script for this lesson, `list_comprehension.py`, has been refactored to place each list comprehension task into its own testable function.

1. **Review the Code:** Open `Day_12_List_Comprehension/list_comprehension.py`. Notice the functions `apply_price_increase()`, `filter_large_sales()`, and `get_top_sales_performers()`.
1. **Run the Script:** From the root directory of the project (`Coding-For-MBA`), run the script to see the functions in action:
   ```bash
   python Day_12_List_Comprehension/list_comprehension.py
   ```
1. **Run the Tests:** You can run the tests for this lesson to verify the correctness of each function:
   ```bash
   pytest tests/test_day_12.py
   ```

## 💻 Exercises: Day 12

1. **Calculate Sales Commissions:**

   - In a new script (`my_solutions_12.py`), create a list of sales figures: `sales = [2500, 8000, 12000, 5500]`.
   - Write a function `calculate_commissions(sales_list, commission_rate)` that takes a list of sales and a rate.
   - Inside the function, use a list comprehension to return a new list of calculated commissions.
   - Call your function with a 15% commission rate (`0.15`) and print the result.

1. **Filter Products by Category:**

   - You have a list of product dictionaries (see below).
   - Create a function `filter_by_category(product_list, category)` that takes a list of products and a category name.
   - The function should use a list comprehension to return a new list containing only the *names* of products in the specified category.
   - Call your function with the category `"electronics"` and print the result.
     ```python
     products = [
         {"name": "Laptop", "category": "electronics"},
         {"name": "T-Shirt", "category": "apparel"},
         {"name": "Keyboard", "category": "electronics"}
     ]
     ```

1. **Format Prices for Display:**

   - You have a list of prices as floats: `prices = [49.99, 199.99, 19.95]`.
   - Use a list comprehension to create a new list called `display_prices`.
   - Each item in the new list should be a string, formatted as currency (e.g., `"$49.99"`).
   - Print the `display_prices` list.

🎉 **Excellent!** List comprehensions are a powerful tool for writing clean, efficient, and professional Python code. They are heavily used in data analysis for quick and readable data transformations.

## Additional Materials

- **list_comprehension.ipynb**  
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_12_List_Comprehension/list_comprehension.ipynb){ .md-button } 
  [📓 Open in NBViewer](https://nbviewer.org/github/saint2706/Coding-For-MBA/blob/main/Day_12_List_Comprehension/list_comprehension.ipynb){ .md-button } 
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_12_List_Comprehension/list_comprehension.ipynb){ .md-button .md-button--primary } 
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_12_List_Comprehension/list_comprehension.ipynb){ .md-button }
- **solutions.ipynb**  
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_12_List_Comprehension/solutions.ipynb){ .md-button } 
  [📓 Open in NBViewer](https://nbviewer.org/github/saint2706/Coding-For-MBA/blob/main/Day_12_List_Comprehension/solutions.ipynb){ .md-button } 
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_12_List_Comprehension/solutions.ipynb){ .md-button .md-button--primary } 
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_12_List_Comprehension/solutions.ipynb){ .md-button }

???+ example "list_comprehension.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_12_List_Comprehension/list_comprehension.py)

    ```python title="list_comprehension.py"
    """
    Day 12: Elegant Data Manipulation with List Comprehensions (Refactored)

    This script demonstrates how to use list comprehensions to
    efficiently transform and filter lists of business data. This version
    is refactored into functions for better organization and testability.
    """


    def apply_price_increase(prices, increase_percentage):
        """
        Applies a percentage price increase to a list of prices
        using a list comprehension.
        """
        increase_multiplier = 1 + increase_percentage
        # [expression for item in iterable]
        return [price * increase_multiplier for price in prices]


    def filter_large_sales(sales, threshold):
        """
        Filters a list of sales to find those above a given threshold
        using a list comprehension.
        """
        # [expression for item in iterable if condition]
        return [sale for sale in sales if sale > threshold]


    def get_top_sales_performers(employees, sales_target):
        """
        Filters and transforms a list of employee dictionaries to get the
        names of top-performing sales staff.
        """
        # [expression for item in iterable if condition]
        return [
            employee["name"]
            for employee in employees
            if employee.get("department") == "Sales"
            and employee.get("quarterly_sales", 0) > sales_target
        ]


    def main():
        """Main function to demonstrate list comprehensions."""
        # --- Example 1: Transforming Data ---
        print("--- Applying a Price Increase ---")
        original_prices = [100.00, 150.50, 200.00, 80.25]
        print(f"Original prices: {original_prices}")

        increased_prices = apply_price_increase(original_prices, 0.10)  # 10% increase
        print(f"New prices (from comprehension): {[f'${p:.2f}' for p in increased_prices]}")
        print("-" * 20)

        # --- Example 2: Filtering Data ---
        print("--- Filtering for Large Sales Transactions ---")
        sales_data = [500, 1200, 800, 1500, 300, 2500]
        print(f"All sales: {sales_data}")

        large_sales_data = filter_large_sales(sales_data, 1000)
        print(f"Large sales (from comprehension): {large_sales_data}")
        print("-" * 20)

        # --- Example 3: Filtering and Transforming ---
        print("--- Extracting Names of High-Performing Sales Staff ---")
        employee_data = [
            {"name": "Alice", "department": "Sales", "quarterly_sales": 12000},
            {"name": "Bob", "department": "Engineering", "quarterly_sales": 0},
            {"name": "Charlie", "department": "Sales", "quarterly_sales": 8000},
            {"name": "David", "department": "Sales", "quarterly_sales": 15000},
        ]
        target = 10000
        top_performers_list = get_top_sales_performers(employee_data, target)
        print(f"Top performing sales staff (sales > ${target}): {top_performers_list}")
        print("-" * 20)


    if __name__ == "__main__":
        main()
    ```

???+ example "solutions.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_12_List_Comprehension/solutions.py)

    ```python title="solutions.py"
    """
    Day 12: Solutions to Exercises
    """

    # --- Exercise 1: Calculate Sales Commissions ---
    print("--- Solution to Exercise 1 ---")
    sales = [2500, 8000, 12000, 5500]
    commission_rate = 0.10

    # [expression for item in iterable]
    # The expression is the calculation for each sale.
    commissions = [sale * commission_rate for sale in sales]

    print(f"Original sales: {sales}")
    print(f"Calculated commissions (10%): {commissions}")
    print("-" * 20)


    # --- Exercise 2: Filter Products by Category ---
    print("--- Solution to Exercise 2 ---")
    products = [
        {"name": "Laptop", "category": "electronics"},
        {"name": "T-Shirt", "category": "apparel"},
        {"name": "Keyboard", "category": "electronics"},
        {"name": "Coffee Mug", "category": "homeware"},
        {"name": "Webcam", "category": "electronics"},
    ]

    # [expression for item in iterable if condition]
    # The expression is the product's name.
    # The condition checks if the product's category is 'electronics'.
    electronic_products = [
        product["name"] for product in products if product["category"] == "electronics"
    ]

    print(f"All products: {products}")
    print(f"Electronic products only: {electronic_products}")
    print("-" * 20)


    # --- Exercise 3: Format Prices for Display ---
    print("--- Solution to Exercise 3 ---")
    prices = [49.99, 199.99, 19.95, 24.50, 12.00]

    # The expression is an f-string that formats each price.
    display_prices = [f"${price:,.2f}" for price in prices]

    print(f"Original prices (float): {prices}")
    print(f"Display prices (string): {display_prices}")
    print("-" * 20)
    ```
