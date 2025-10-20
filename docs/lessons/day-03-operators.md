An **operator** is a symbol that tells the computer to perform a specific mathematical or logical manipulation. For a business analyst, operators are the tools you'll use to calculate financial metrics, compare results, and create business rules.

## Key Operator Types

- **Arithmetic Operators (`+`, `-`, `*`, `/`, `**`):** The foundation of any quantitative analysis, used for calculations like profit margin and compound interest.
- **Assignment Operators (`=`, `+=`, `-=`):** Used to assign and update values in variables, such as accumulating total sales.
- **Comparison Operators (`==`, `!=`, `>`, `<`):** Used to compare two values, resulting in `True` or `False`. This is the basis for filtering data and making decisions.
- **Logical Operators (`and`, `or`, `not`):** Used to combine conditional statements to create complex business rules, like determining bonus eligibility.

## Environment Setup

Before you begin, ensure you have followed the setup instructions in the main [README.md](https://github.com/saint2706/Coding-For-MBA/blob/main/README.md) to set up your virtual environment and install the required libraries.

## Exploring the Refactored Code

The script for this lesson, `operators.py`, has been refactored into functions to make the logic clear, reusable, and testable.

1. **Review the Code:** Open `Day_03_Operators/operators.py`. Each business calculation or rule (e.g., `calculate_compound_interest()`, `check_bonus_eligibility()`) is now its own function.
1. **Run the Script:** From the root directory of the project (`Coding-For-MBA`), run the script to see the functions in action:
   ```bash
   python Day_03_Operators/operators.py
   ```
1. **Run the Tests:** You can run the tests for this lesson to verify the correctness of each function:
   ```bash
   pytest tests/test_day_03.py
   ```

## 💻 Exercises: Day 3

1. **Calculate Net Profit Margin:**

   - In a new script (`my_solutions_03.py`), create a function `calculate_net_profit_margin(revenue, expenses)`.
   - The function should return the net profit margin (`(revenue - expenses) / revenue`).
   - Call the function with a `revenue` of 1,200,000 and `total_expenses` of 850,000.
   - Print the result formatted as a percentage with two decimal places.

1. **Inventory Check Function:**

   - Create a function `check_reorder_status(inventory_count, low_stock_threshold, reorder_threshold)`.
   - The function should return a dictionary with two keys: `is_low_stock` (boolean) and `needs_reorder` (boolean).
   - Call the function with an `inventory_count` of 45, a `low_stock_threshold` of 50, and a `reorder_threshold` of 25. Print the results.

1. **Sales Bonus Eligibility Function:**

   - The logic for bonus eligibility is already in the `check_bonus_eligibility` function in `operators.py`.
   - In your own script, import this function: `from Day_03_Operators.operators import check_bonus_eligibility`.
   - Call the function with a few different scenarios for `sales`, `years_of_service`, and `top_performer_last_quarter` to see the results.

🎉 **Excellent work!** You're now equipped with the operators needed to perform the vast majority of business calculations and logical checks you'll encounter.

## Additional Materials

- **operators.ipynb**  
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_03_Operators/operators.ipynb){ .md-button } 
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_03_Operators/operators.ipynb){ .md-button .md-button--primary } 
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_03_Operators/operators.ipynb){ .md-button }
- **solutions.ipynb**  
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_03_Operators/solutions.ipynb){ .md-button } 
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_03_Operators/solutions.ipynb){ .md-button .md-button--primary } 
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_03_Operators/solutions.ipynb){ .md-button }

???+ example "operators.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_03_Operators/operators.py)

    ```python title="operators.py"
    """
    Day 3: Operators in Action for Business Analysis (Refactored)

    This script demonstrates how different Python operators can be used
    to perform business calculations and logical checks. This version is
    refactored into functions for better organization and testability.
    """


    def calculate_compound_interest(principal, rate, time, n=1):
        """
        Calculates the final amount of an investment with compound interest.

        Compound interest is when you earn interest not just on your original
        investment, but also on the interest that accumulates over time.
        This is a fundamental concept in finance.

        Formula: A = P(1 + r/n)^(nt)
        Where:
        - A = final amount
        - P = principal (initial investment)
        - r = annual interest rate (as a decimal, e.g., 0.05 for 5%)
        - n = number of times interest is compounded per year
        - t = time in years

        Parameters
        ----------
        principal : float
            The initial investment amount
        rate : float
            Annual interest rate as a decimal (e.g., 0.05 for 5%)
        time : int or float
            Time period in years
        n : int, optional
            Number of times interest compounds per year (default is 1 = annually)

        Returns
        -------
        float
            The final amount after compound interest

        Example
        -------
        >>> calculate_compound_interest(10000, 0.05, 3)
        11576.25
        """
        # The ** operator is used for exponents (raising to a power)
        # This calculates: principal × (1 + rate/n)^(n×time)
        final_amount = principal * (1 + rate / n) ** (n * time)
        return final_amount


    def accumulate_sales(initial_sales, daily_sales):
        """
        Accumulates daily sales into a total using the += operator.

        The += operator is a shorthand for "add and assign". It's very common
        when you need to keep a running total.

        Parameters
        ----------
        initial_sales : float or int
            Starting sales amount
        daily_sales : list of float
            List of daily sales amounts to add

        Returns
        -------
        float or int
            Total accumulated sales
        """
        total = initial_sales
        # Loop through each sale amount in the list
        for sale in daily_sales:
            # The += operator adds the sale to total and stores it back in total
            # This is equivalent to: total = total + sale
            total += sale
        return total


    def check_inventory_status(inventory_count, low_stock_threshold):
        """
        Checks if the inventory count is below the low stock threshold.

        This demonstrates comparison operators, which compare two values
        and return True or False.

        Parameters
        ----------
        inventory_count : int
            Current number of items in stock
        low_stock_threshold : int
            The minimum acceptable stock level

        Returns
        -------
        bool
            True if inventory is below threshold (needs reordering), False otherwise
        """
        # The < operator checks if the left value is less than the right value
        # Returns True if inventory_count is less than low_stock_threshold
        return inventory_count < low_stock_threshold


    def check_sales_target(current_sales, sales_target):
        """
        Checks if the current sales have met or exceeded the sales target.

        Parameters
        ----------
        current_sales : float
            The actual sales amount achieved
        sales_target : float
            The sales target to meet or exceed

        Returns
        -------
        bool
            True if target is met or exceeded, False otherwise
        """
        # The >= operator checks for "greater than or equal to"
        # Returns True if current_sales is at least as much as sales_target
        return current_sales >= sales_target


    def check_bonus_eligibility(sales, years_of_service, top_performer_last_quarter):
        """
        Determines bonus eligibility based on complex business rules.

        This demonstrates logical operators (and, or) which combine
        multiple conditions. These are essential for implementing
        complex business logic.

        Business Rule: An employee is eligible for a bonus if:
        - They have sales > $10,000 AND years of service > 2, OR
        - They were a top performer last quarter (regardless of other factors)

        Parameters
        ----------
        sales : float
            Employee's sales amount
        years_of_service : int
            Number of years employed
        top_performer_last_quarter : bool
            Whether employee was top performer last quarter

        Returns
        -------
        bool
            True if eligible for bonus, False otherwise
        """
        # The 'and' operator requires BOTH conditions to be True
        # The 'or' operator requires at least ONE condition to be True
        # Parentheses () group conditions and control order of evaluation
        is_eligible = (sales > 10000 and years_of_service > 2) or top_performer_last_quarter
        return is_eligible


    if __name__ == "__main__":
        # --- Arithmetic Operators for Financial Calculations ---
        print("--- Financial Calculations ---")
        principal_amount = 10000  # Initial investment
        interest_rate = 0.05  # 5% annual interest rate
        investment_time = 3  # 3 years

        # Calculate compound interest using the ** (exponent) operator
        final_investment_amount = calculate_compound_interest(
            principal_amount, interest_rate, investment_time
        )
        print(
            f"Investment of ${principal_amount} after {investment_time} years at {interest_rate * 100}% interest will be: ${final_investment_amount:.2f}"
        )
        print("-" * 20)

        # --- Assignment Operators for Accumulating Data ---
        print("--- Accumulating Daily Sales ---")
        sales_over_three_days = [1500, 2200, 1850]
        # Use the += operator to add up all daily sales
        total_sales_figure = accumulate_sales(0, sales_over_three_days)
        print(f"Total sales after 3 days: ${total_sales_figure}")
        print("-" * 20)

        # --- Comparison Operators for Business Rules ---
        print("--- Inventory and Sales Target Checks ---")
        # Check if inventory is running low using the < operator
        is_low = check_inventory_status(inventory_count=45, low_stock_threshold=50)
        print(f"Is inventory low? {is_low}")

        # Check if sales target was met using the >= operator
        target_met = check_sales_target(current_sales=265000, sales_target=250000)
        print(f"Has the sales target been met? {target_met}")
        print("-" * 20)

        # --- Logical Operators for Complex Eligibility Rules ---
        print("--- Sales Bonus Eligibility Test ---")
        # Test different scenarios using 'and' and 'or' operators

        # Scenario 1: High sales but new employee (not top performer)
        eligible_s1 = check_bonus_eligibility(
            sales=12000, years_of_service=1, top_performer_last_quarter=False
        )
        print(f"Scenario 1 (High Sales, New Employee): Eligible? {eligible_s1}")

        # Scenario 2: Was top performer (other factors don't matter)
        eligible_s2 = check_bonus_eligibility(
            sales=8000, years_of_service=3, top_performer_last_quarter=True
        )
        print(f"Scenario 2 (Top Performer): Eligible? {eligible_s2}")

        # Scenario 3: Doesn't meet any criteria
        eligible_s3 = check_bonus_eligibility(
            sales=9000, years_of_service=1, top_performer_last_quarter=False
        )
        print(f"Scenario 3 (Not Eligible): Eligible? {eligible_s3}")
    ```

???+ example "solutions.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_03_Operators/solutions.py)

    ```python title="solutions.py"
    """
    Day 3: Solutions to Exercises
    """

    # --- Exercise 1: Calculate Net Profit Margin ---
    print("--- Solution to Exercise 1 ---")
    revenue = 1200000
    total_expenses = 850000

    # Calculate the profit
    profit = revenue - total_expenses

    # Calculate the net profit margin
    # It's good practice to check if revenue is zero to avoid a DivisionByZeroError
    if revenue > 0:
        net_profit_margin = (profit / revenue) * 100
        print(f"Revenue: ${revenue:,.2f}")
        print(f"Expenses: ${total_expenses:,.2f}")
        print(f"Profit: ${profit:,.2f}")
        print(f"Net Profit Margin: {net_profit_margin:.2f}%")
    else:
        print("Cannot calculate margin as revenue is zero.")
    print("-" * 20)


    # --- Exercise 2: Inventory Check ---
    print("--- Solution to Exercise 2 ---")
    inventory_count = 45
    low_stock_threshold = 50
    reorder_threshold = 25

    is_low_stock = inventory_count < low_stock_threshold
    reorder_required = inventory_count <= reorder_threshold

    print(f"Inventory count: {inventory_count} units")
    print(f"Is inventory considered low stock? {is_low_stock}")
    print(f"Is a reorder required? {reorder_required}")
    print("-" * 20)


    # --- Exercise 3: Sales Bonus Eligibility ---
    print("--- Solution to Exercise 3 ---")


    def check_bonus_eligibility(sales, years_of_service, top_performer_last_quarter):
        """A helper function to test different scenarios easily."""
        is_eligible = (sales > 10000 and years_of_service > 2) or top_performer_last_quarter
        print(
            f"Scenario: Sales=${sales}, Service={years_of_service}yrs, Top Performer={top_performer_last_quarter} -> Eligible? {is_eligible}"
        )


    # Scenario 1: High sales but new employee
    check_bonus_eligibility(12000, 1, False)

    # Scenario 2: Low sales but top performer
    check_bonus_eligibility(8000, 3, True)

    # Scenario 3: High sales and long service
    check_bonus_eligibility(15000, 5, False)

    # Scenario 4: Not eligible on any count
    check_bonus_eligibility(9000, 1, False)
    print("-" * 20)
    ```
