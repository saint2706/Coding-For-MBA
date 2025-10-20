A **higher-order function** is a function that takes another function as an argument or returns a function as its result. This is a powerful concept used heavily in data analysis for its conciseness and flexibility.

## Key Higher-Order Functions

- **`map(function, iterable)`:** Applies a function to every item in an iterable (e.g., a list).
- **`filter(function, iterable)`:** Creates a new iterable containing only the items for which the function returns `True`.
- **`sorted(iterable, key=function)`:** Sorts an iterable. The `key` argument takes a function that specifies what to sort by.

## Lambda Functions: Quick, Anonymous Functions

A **lambda function** is a small, anonymous function defined with the `lambda` keyword. They are perfect for use with higher-order functions when you need a simple, one-off function.

`lambda arguments: expression`

```python
# The 'for' loop way
new_salaries = []
for s in salaries:
    new_salaries.append(s * 1.10)

# The map and lambda way
new_salaries = list(map(lambda s: s * 1.10, salaries))
```

## Environment Setup

Before you begin, ensure you have followed the setup instructions in the main [README.md](https://github.com/saint2706/Coding-For-MBA/blob/main/README.md) to set up your virtual environment and install the required libraries.

## Exploring the Refactored Code

The script for this lesson, `HOF.py`, has been refactored to place each higher-order function task into its own testable function.

1. **Review the Code:** Open `Day_13_Higher_Order_Functions/HOF.py`. Notice the functions `apply_bonus_to_salaries()`, `filter_high_yield_projects()`, and `sort_products_by_attribute()`.
1. **Run the Script:** From the root directory of the project (`Coding-For-MBA`), run the script to see the functions in action:
   ```bash
   python Day_13_Higher_Order_Functions/HOF.py
   ```
1. **Run the Tests:** You can run the tests for this lesson to verify the correctness of each function:
   ```bash
   pytest tests/test_day_13.py
   ```

## 💻 Exercises: Day 13

1. **Standardize Department Names:**

   - In a new script (`my_solutions_13.py`), create a list of department names: `departments = ["Sales", " marketing ", "  Engineering", "HR  "]`.
   - Write a function that takes this list and uses `map` with a `lambda` function to return a new list where each name is cleaned (whitespace stripped) and converted to lowercase.
   - Call your function and print the result.

1. **Filter Active Subscriptions:**

   - You have a list of customer dictionaries (see below).
   - Import the `get_active_customer_names` function from the lesson script.
   - Call the function with the customer list and print the names of the active customers.
     ```python
     customers = [
         {"name": "Cust A", "subscription_status": "active"},
         {"name": "Cust B", "subscription_status": "inactive"},
         {"name": "Cust C", "subscription_status": "active"}
     ]
     ```

1. **Sort Complex Data:**

   - You have a list of product dictionaries.
   - Import the `sort_products_by_attribute` function.
   - Call the function twice: once to sort the products by `"price"` and once to sort them by `"name"`. Print both sorted lists.
     ```python
     products = [
         {"name": "Laptop", "price": 1200},
         {"name": "Mouse", "price": 25},
         {"name": "Keyboard", "price": 75}
     ]
     ```

🎉 **Congratulations!** Higher-order functions and lambdas are a gateway to a more powerful style of programming that you will see everywhere in the world of data science.

## Additional Materials

- **HOF.ipynb**  
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_13_Higher_Order_Functions/HOF.ipynb){ .md-button } 
  [📓 Open in NBViewer](https://nbviewer.org/github/saint2706/Coding-For-MBA/blob/main/Day_13_Higher_Order_Functions/HOF.ipynb){ .md-button } 
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_13_Higher_Order_Functions/HOF.ipynb){ .md-button .md-button--primary } 
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_13_Higher_Order_Functions/HOF.ipynb){ .md-button }
- **solutions.ipynb**  
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_13_Higher_Order_Functions/solutions.ipynb){ .md-button } 
  [📓 Open in NBViewer](https://nbviewer.org/github/saint2706/Coding-For-MBA/blob/main/Day_13_Higher_Order_Functions/solutions.ipynb){ .md-button } 
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_13_Higher_Order_Functions/solutions.ipynb){ .md-button .md-button--primary } 
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_13_Higher_Order_Functions/solutions.ipynb){ .md-button }

???+ example "HOF.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_13_Higher_Order_Functions/HOF.py)

    ```python title="HOF.py"
    """
    Day 13: Advanced Data Processing with Higher-Order Functions (Refactored)

    This script demonstrates using map, filter, and sorted with lambda functions
    for concise and powerful data manipulation. This version is refactored
    into functions for better organization and testability.
    """


    def apply_bonus_to_salaries(salaries, bonus_percentage):
        """
        Applies a percentage bonus to a list of salaries using map().
        """
        bonus_multiplier = 1 + bonus_percentage
        return list(map(lambda s: s * bonus_multiplier, salaries))


    def filter_high_yield_projects(projects, roi_threshold):
        """
        Filters a list of projects to find those with an ROI above a threshold.
        Assumes projects is a list of tuples: (project_name, roi_percentage).
        """
        return list(filter(lambda p: p[1] > roi_threshold, projects))


    def get_active_customer_names(customers):
        """
        Filters a list of customer dictionaries for active customers and returns their names.
        """
        active_customers = filter(
            lambda c: c.get("subscription_status") == "active", customers
        )
        return list(map(lambda c: c.get("name"), active_customers))


    def sort_products_by_attribute(products, attribute_name):
        """
        Sorts a list of product dictionaries by a specified attribute (e.g., 'price').
        """
        return sorted(products, key=lambda p: p.get(attribute_name, 0))


    def main():
        """Main function to demonstrate higher-order functions."""
        # --- Using map() to transform a list ---
        print("--- Applying a Bonus to All Salaries ---")
        salaries_list = [50000, 80000, 120000, 65000]
        print(f"Original salaries: {salaries_list}")

        new_salaries_list = apply_bonus_to_salaries(salaries_list, 0.10)  # 10% bonus
        print(f"Salaries after 10% bonus: {new_salaries_list}")
        print("-" * 20)

        # --- Using filter() to select data ---
        print("--- Filtering for High-Yield Projects ---")
        projects_list = [
            ("Project A", 12),
            ("Project B", 20),
            ("Project C", 8),
            ("Project D", 25),
        ]
        print(f"All projects: {projects_list}")

        high_yield_list = filter_high_yield_projects(projects_list, 15)
        print(f"High-yield projects (ROI > 15%): {high_yield_list}")
        print("-" * 20)

        # --- Combining map() and filter() ---
        print("--- Analyzing High-Value Customer Data ---")
        customers_list = [
            {"name": "InnovateCorp", "subscription_status": "active", "monthly_spend": 550},
            {
                "name": "DataDriven Inc.",
                "subscription_status": "inactive",
                "monthly_spend": 120,
            },
            {
                "name": "Analytics LLC",
                "subscription_status": "active",
                "monthly_spend": 210,
            },
        ]
        print(f"Original customer data: {customers_list}")

        active_names = get_active_customer_names(customers_list)
        print(f"Names of active customers: {active_names}")
        print("-" * 20)

        # --- Using sorted() with a lambda key ---
        print("--- Sorting Products by Price ---")
        products_list = [
            {"name": "Laptop", "price": 1200},
            {"name": "Mouse", "price": 25},
            {"name": "Keyboard", "price": 75},
            {"name": "Monitor", "price": 300},
        ]
        print(f"Original product list: {products_list}")

        sorted_products = sort_products_by_attribute(products_list, "price")
        print(f"Products sorted by price: {sorted_products}")
        print("-" * 20)


    if __name__ == "__main__":
        main()
    ```

???+ example "solutions.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_13_Higher_Order_Functions/solutions.py)

    ```python title="solutions.py"
    """
    Day 13: Solutions to Exercises
    """

    # --- Exercise 1: Standardize Department Names ---
    print("--- Solution to Exercise 1 ---")
    departments = ["Sales", " marketing ", "  Engineering", "HR  "]
    print(f"Original list: {departments}")

    # The lambda function x.strip().lower() is applied to each item in the list.
    # .strip() removes whitespace, .lower() converts to lowercase.
    cleaned_departments = list(map(lambda x: x.strip().lower(), departments))

    print(f"Cleaned list: {cleaned_departments}")
    print("-" * 20)


    # --- Exercise 2: Filter Active Subscriptions ---
    print("--- Solution to Exercise 2 ---")
    customers = [
        {"id": 1, "status": "active"},
        {"id": 2, "status": "inactive"},
        {"id": 3, "status": "active"},
        {"id": 4, "status": "cancelled"},
    ]
    print(f"Original customers: {customers}")

    # The lambda function returns True only if the customer's status is 'active'.
    # filter() keeps only the items for which the lambda returns True.
    active_customers = list(filter(lambda c: c["status"] == "active", customers))

    print(f"Active customers only: {active_customers}")
    print("-" * 20)


    # --- Exercise 3: Sort Complex Data ---
    print("--- Solution to Exercise 3 ---")
    products = [
        {"name": "Laptop", "price": 1200},
        {"name": "Mouse", "price": 25},
        {"name": "Keyboard", "price": 75},
        {"name": "Monitor", "price": 300},
    ]
    print(f"Original product list: {products}")

    # The 'key' argument of sorted() tells it what to base the sort on.
    # The lambda function tells sorted() to look at the value associated
    # with the 'price' key in each dictionary.
    sorted_products = sorted(products, key=lambda p: p["price"])

    print(f"Products sorted by price: {sorted_products}")
    print("-" * 20)
    ```
