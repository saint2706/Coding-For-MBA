As you perform more complex analysis, you'll write the same code repeatedly. **Functions** are named, reusable blocks of code that perform a specific task, helping you avoid repetition and write cleaner, more maintainable code.

## Key Function Concepts

- **Definition (`def`):** You define a function using the `def` keyword.
- **Parameters:** Inputs to your function that allow you to pass data to it (e.g., `revenue`, `expenses`).
- **`return` Statement:** Sends a value *back* from the function, so you can use the result in other parts of your code.
- **Type Hinting:** A modern Python feature that lets you specify the expected data types for parameters and the return value (e.g., `def get_net_profit(revenue: float) -> float:`). This improves code clarity and helps prevent bugs.

## Environment Setup

Before you begin, ensure you have followed the setup instructions in the main [README.md](https://github.com/saint2706/Coding-For-MBA/blob/main/README.md) to set up your virtual environment and install the required libraries.

## Exploring the Refactored Code

The script for this lesson, `functions.py`, is already well-structured, with each piece of business logic encapsulated in its own function. We've made a minor improvement by wrapping the example usage in a `main()` function, which is a standard convention.

1. **Review the Code:** Open `Day_11_Functions/functions.py`. Examine the different functions like `get_net_profit()`, `calculate_commission()`, and `format_currency()`.
1. **Run the Script:** From the root directory of the project (`Coding-For-MBA`), run the script to see the functions in action:
   ```bash
   python Day_11_Functions/functions.py
   ```
1. **Run the Tests:** You can run the tests for this lesson to verify the correctness of each function:
   ```bash
   pytest tests/test_day_11.py
   ```

## 💻 Exercises: Day 11

1. **Commission Calculator Function:**

   - The `calculate_commission` function is already created in `functions.py`.
   - In a new script (`my_solutions_11.py`), import this function: `from Day_11_Functions.functions import calculate_commission`.
   - Call the function with a sample sales amount and print the returned commission.

1. **Employee Bonus Eligibility Function:**

   - Import the `is_eligible_for_bonus` function.
   - Call the function with a few different scenarios for `performance_rating` and `years_of_service` and print the `True`/`False` results.

1. **Advanced Currency Formatter:**

   - Create a new function `format_currency_with_symbol(amount, symbol='$')`.
   - This function should take an amount and an optional `symbol` parameter that defaults to `'$'`.
   - It should return a formatted string like `€1,250.50` if the symbol is `'€'`.
   - Test your new function by calling it with and without the `symbol` parameter.

🎉 **Great work!** Functions are the key to writing clean, organized, and professional code. By packaging your logic into reusable tools, you're moving from a simple scripter to a true programmer.

## Additional Materials

- **functions.ipynb**  
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_11_Functions/functions.ipynb){ .md-button } 
  [📓 Open in NBViewer](https://nbviewer.org/github/saint2706/Coding-For-MBA/blob/main/Day_11_Functions/functions.ipynb){ .md-button } 
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_11_Functions/functions.ipynb){ .md-button .md-button--primary } 
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_11_Functions/functions.ipynb){ .md-button }
- **solutions.ipynb**  
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_11_Functions/solutions.ipynb){ .md-button } 
  [📓 Open in NBViewer](https://nbviewer.org/github/saint2706/Coding-For-MBA/blob/main/Day_11_Functions/solutions.ipynb){ .md-button } 
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_11_Functions/solutions.ipynb){ .md-button .md-button--primary } 
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_11_Functions/solutions.ipynb){ .md-button }

???+ example "functions.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_11_Functions/functions.py)

    ```python title="functions.py"
    """
    Day 11: Building Reusable Business Tools with Functions (Refactored)

    This script demonstrates how to define and call functions
    to perform repeatable business calculations.
    """


    # Type hints make the function's expected inputs and outputs clear
    # revenue: float means "revenue parameter should be a float"
    # -> float means "this function returns a float"
    def get_net_profit(revenue: float, expenses: float) -> float:
        """
        Calculates the net profit from revenue and expenses.

        Functions are reusable blocks of code that perform a specific task.
        They help us avoid repeating code and make programs easier to understand.

        Parameters
        ----------
        revenue : float
            Total revenue (income)
        expenses : float
            Total expenses (costs)

        Returns
        -------
        float
            Net profit (revenue minus expenses)

        Example
        -------
        >>> get_net_profit(500000, 400000)
        100000
        """
        net_profit = revenue - expenses
        return net_profit  # 'return' sends the result back to the caller


    def calculate_commission(sales_amount: float) -> float:
        """
        Calculates a 15% commission on a given sales amount.

        Functions can define their own internal variables (like commission_rate).
        These are called "local variables" and only exist inside the function.

        Parameters
        ----------
        sales_amount : float
            The total sales amount

        Returns
        -------
        float
            The commission earned (15% of sales)

        Example
        -------
        >>> calculate_commission(10000)
        1500.0
        """
        # This variable only exists inside this function (local scope)
        commission_rate = 0.15  # 15% commission rate
        commission = sales_amount * commission_rate
        return commission


    def is_eligible_for_bonus(performance_rating: int, years_of_service: int) -> bool:
        """
        Checks if an employee is eligible for a bonus based on performance
        and years of service.

        Functions can return boolean values (True/False) which is useful
        for yes/no questions or validation logic.

        Parameters
        ----------
        performance_rating : int
            Employee rating (1-5 scale)
        years_of_service : int
            Number of years with the company

        Returns
        -------
        bool
            True if eligible for bonus, False otherwise

        Example
        -------
        >>> is_eligible_for_bonus(4, 3)
        True
        >>> is_eligible_for_bonus(3, 1)
        False
        """
        # This entire expression evaluates to True or False
        # Returns True if rating is 4 or 5 AND service is more than 2 years
        return performance_rating >= 4 and years_of_service > 2


    def format_currency(amount: float) -> str:
        """
        Formats a number into a currency string (e.g., $1,234.56).

        Functions can transform data from one type to another.
        This one takes a number and returns a formatted string.

        Parameters
        ----------
        amount : float
            Dollar amount to format

        Returns
        -------
        str
            Formatted currency string with $ sign and 2 decimal places

        Example
        -------
        >>> format_currency(1234.567)
        '$1,234.57'
        """
        # f-string formatting: {:,.2f} means "format as float with commas and 2 decimals"
        return f"${amount:,.2f}"


    def main():
        """Main function to demonstrate the use of the business functions."""
        # --- Using the Functions ---
        print("--- Calculating Company-Wide Profits ---")
        # Let's use our functions to analyze two different products.
        product_a_revenue = 500000
        product_a_expenses = 400000
        product_a_profit = get_net_profit(product_a_revenue, product_a_expenses)
        print(f"Product A Profit: {format_currency(product_a_profit)}")

        product_b_revenue = 250000
        product_b_expenses = 210000
        product_b_profit = get_net_profit(product_b_revenue, product_b_expenses)
        print(f"Product B Profit: {format_currency(product_b_profit)}")

        total_profit = product_a_profit + product_b_profit
        print(f"Total Company Profit: {format_currency(total_profit)}")
        print("-" * 20)

        print("--- Sales and Bonus Calculations ---")
        sales_figure = 12000
        commission_earned = calculate_commission(sales_figure)
        print(
            f"A sale of {format_currency(sales_figure)} earns a commission of {format_currency(commission_earned)}."
        )
        print()

        # Test the bonus eligibility function with different scenarios
        employee1_rating = 5
        employee1_service = 3
        eligibility1 = is_eligible_for_bonus(employee1_rating, employee1_service)
        print(
            f"Employee 1 (Rating: {employee1_rating}, Service: {employee1_service} yrs) is eligible for bonus: {eligibility1}"
        )

        employee2_rating = 4
        employee2_service = 1
        eligibility2 = is_eligible_for_bonus(employee2_rating, employee2_service)
        print(
            f"Employee 2 (Rating: {employee2_rating}, Service: {employee2_service} yr) is eligible for bonus: {eligibility2}"
        )
        print("-" * 20)


    if __name__ == "__main__":
        main()
    ```

???+ example "solutions.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_11_Functions/solutions.py)

    ```python title="solutions.py"
    """
    Day 11: Solutions to Exercises
    """

    # --- Exercise 1: Commission Calculator Function ---
    print("--- Solution to Exercise 1 ---")


    def calculate_commission(sales_amount: float) -> float:
        """
        Calculates a commission of 15% of the sales amount.
        Takes sales_amount as a float, returns the commission as a float.
        """
        commission_rate = 0.15
        return sales_amount * commission_rate


    # Example usage:
    sample_sale = 5000.00
    commission_earned = calculate_commission(sample_sale)
    print(f"A sale of ${sample_sale:,.2f} earns a commission of ${commission_earned:,.2f}.")
    print("-" * 20)


    # --- Exercise 2: Employee Bonus Eligibility Function ---
    print("--- Solution to Exercise 2 ---")


    def is_eligible_for_bonus(performance_rating: int, years_of_service: int) -> bool:
        """
        Returns True if rating is 4 or 5 AND service is more than 2 years.
        """
        return performance_rating >= 4 and years_of_service > 2


    # Test cases:
    print(
        f"Rating 5, 3 years service -> Eligible? {is_eligible_for_bonus(5, 3)}"
    )  # Expected: True
    print(
        f"Rating 4, 3 years service -> Eligible? {is_eligible_for_bonus(4, 3)}"
    )  # Expected: True
    print(
        f"Rating 5, 1 year service  -> Eligible? {is_eligible_for_bonus(5, 1)}"
    )  # Expected: False
    print(
        f"Rating 3, 5 years service -> Eligible? {is_eligible_for_bonus(3, 5)}"
    )  # Expected: False
    print("-" * 20)


    # --- Exercise 3: Format Currency Function ---
    print("--- Solution to Exercise 3 ---")


    def format_currency(number: float) -> str:
        """
        Returns a string formatted as currency with a dollar sign and commas.
        Example: 1250.5 -> "$1,250.50"
        """
        return f"${number:,.2f}"


    # Example usage:
    amount1 = 1250.5
    amount2 = 500
    print(f"{amount1} -> {format_currency(amount1)}")
    print(f"{amount2} -> {format_currency(amount2)}")
    print("-" * 20)
    ```
