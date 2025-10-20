In Day 1, we performed basic calculations. Now, we'll learn how to store data in **variables** and use Python's **built-in functions** to analyze it.

## What is a Variable?

A variable is a labeled container for information. Instead of using a raw number like `500000`, we can store it in a variable called `revenue`, making our code more readable and manageable.

**`revenue = 500000`**

### Naming Conventions

- **Be Descriptive:** `quarterly_sales` is better than `qs`.
- **Use Snake Case:** Separate words with underscores, like `cost_of_goods_sold`.

## Built-in Functions: Your Basic Toolkit

Python includes pre-built functions for common tasks:

- `len()`: Finds the length (e.g., number of items in a list).
- `sum()`: Calculates the sum of numbers in a list.
- `min()` and `max()`: Find the minimum and maximum values.
- `round()`: Rounds a number to a specified number of decimal places.

## Environment Setup

Before you begin, ensure you have followed the setup instructions in the main [README.md](https://github.com/saint2706/Coding-For-MBA/blob/main/README.md) to set up your virtual environment and install the required libraries.

## Exploring the Refactored Code

The script for this lesson, `variables.py`, has been refactored into functions to promote code reuse and testability.

1. **Review the Code:** Open `Day_02_Variables_Builtin_Functions/variables.py`. Notice how the logic is now organized into functions like `display_company_profile()` and `analyze_weekly_sales()`.
1. **Run the Script:** From the root directory of the project (`Coding-For-MBA`), run the script:
   ```bash
   python Day_02_Variables_Builtin_Functions/variables.py
   ```
   You will see the output from the example scenarios defined at the bottom of the script.
1. **Run the Tests:** You can also run the tests for this lesson to see how we verify the functions' correctness:
   ```bash
   pytest tests/test_day_02.py
   ```

## 💻 Exercises: Day 2

1. **Company Profile Variables:**

   - In a new Python script (`my_solutions_02.py`), declare variables for a fictional company: `company_name`, `year_founded`, `current_revenue`, and `is_publicly_traded`.
   - Print each of these variables with a descriptive label.

1. **Sales Analysis:**

   - A list of sales transactions is: `[150.50, 200.00, 75.25, 300.75, 120.00]`.
   - Store these in a variable called `weekly_sales`.
   - Use built-in functions to calculate and print:
     - The total number of sales (`len()`).
     - The total revenue (`sum()`).
     - The smallest and largest sales (`min()`, `max()`).
     - The average sale amount.

1. **Profit Calculator Function:**

   - Create a function `calculate_profit(revenue, expenses)` that takes two numbers and returns the difference.
   - Call this function with some example numbers (e.g., `calculate_profit(50000, 35000)`) and print the result.

🎉 **Well done!** You've learned how to store data in variables and use Python's built-in functions for analysis—foundational skills for everything that comes next.

## Additional Materials

- **solutions.ipynb**  
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_02_Variables_Builtin_Functions/solutions.ipynb){ .md-button } 
  [📓 Open in NBViewer](https://nbviewer.org/github/saint2706/Coding-For-MBA/blob/main/Day_02_Variables_Builtin_Functions/solutions.ipynb){ .md-button } 
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_02_Variables_Builtin_Functions/solutions.ipynb){ .md-button .md-button--primary } 
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_02_Variables_Builtin_Functions/solutions.ipynb){ .md-button }
- **variables.ipynb**  
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_02_Variables_Builtin_Functions/variables.ipynb){ .md-button } 
  [📓 Open in NBViewer](https://nbviewer.org/github/saint2706/Coding-For-MBA/blob/main/Day_02_Variables_Builtin_Functions/variables.ipynb){ .md-button } 
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_02_Variables_Builtin_Functions/variables.ipynb){ .md-button .md-button--primary } 
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_02_Variables_Builtin_Functions/variables.ipynb){ .md-button }

???+ example "solutions.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_02_Variables_Builtin_Functions/solutions.py)

    ```python title="solutions.py"
    """
    Day 2: Solutions to Exercises
    """

    # --- Exercise 1: Company Profile Variables ---
    print("--- Solution to Exercise 1 ---")
    company_name = "InnovateCorp"
    year_founded = 2015
    current_revenue = 2500000.50
    is_publicly_traded = False

    print(f"Company Name: {company_name}")
    print(f"Year Founded: {year_founded}")
    print(f"Current Revenue: ${current_revenue}")
    print(f"Is Publicly Traded: {is_publicly_traded}")
    print("-" * 20)


    # --- Exercise 2: Sales Analysis ---
    print("--- Solution to Exercise 2 ---")
    weekly_sales = [150.50, 200.00, 75.25, 300.75, 120.00]
    print(f"Sales data: {weekly_sales}")

    # The total number of sales transactions
    num_transactions = len(weekly_sales)
    print(f"Total number of transactions: {num_transactions}")

    # The total revenue for the week
    total_revenue = sum(weekly_sales)
    print(f"Total revenue: ${total_revenue:.2f}")

    # The smallest sale
    min_sale = min(weekly_sales)
    print(f"Smallest sale: ${min_sale:.2f}")

    # The largest sale
    max_sale = max(weekly_sales)
    print(f"Largest sale: ${max_sale:.2f}")

    # The average sale amount
    average_sale = total_revenue / num_transactions
    print(f"Average sale amount: ${average_sale:.2f}")
    print("-" * 20)


    # --- Exercise 3: User Input for a Profit Calculator ---
    print("--- Solution to Exercise 3 ---")
    # Note: To run this interactively, you would need to uncomment the input() lines
    # and run the python file in your terminal. The input() function will pause the script
    # and wait for you to type a value and press Enter.

    # For automated/non-interactive execution, we use example values:
    print("Using example values for demonstration:")
    revenue_input = 150000.00
    expenses_input = 95000.00
    profit = revenue_input - expenses_input
    print(f"Revenue: ${revenue_input:.2f}")
    print(f"Expenses: ${expenses_input:.2f}")
    print(f"Calculated Profit: ${profit:.2f}")

    # To run interactively, uncomment the lines below and comment out the lines above:
    # try:
    #     # float() converts the string from input() into a floating-point number
    #     revenue_input = float(input("Enter total revenue: "))
    #     expenses_input = float(input("Enter total expenses: "))
    #
    #     profit = revenue_input - expenses_input
    #     print(f"Calculated Profit: ${profit:.2f}")
    #
    # except ValueError:
    #     print("Invalid input. Please make sure to enter numbers only.")

    print("-" * 20)
    ```

???+ example "variables.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_02_Variables_Builtin_Functions/variables.py)

    ```python title="variables.py"
    """
    Day 2: Storing and Analyzing Business Data (Refactored)

    This script demonstrates the use of variables to store business data
    and built-in functions to perform basic analysis. This version is
    refactored into functions for better organization and testability.
    """


    def display_company_profile(name, founded, revenue, is_public):
        """
        Displays the company's profile information in a formatted way.

        This function demonstrates how variables can store different types
        of business data and how to present them clearly.

        Parameters
        ----------
        name : str
            The company name
        founded : int
            The year the company was founded
        revenue : float
            Current annual revenue in dollars
        is_public : bool
            Whether the company is publicly traded (True) or private (False)
        """
        print("--- Company Profile ---")
        # f-strings (f"...{variable}...") make it easy to insert variable values into text
        print(f"Company Name: {name}")
        print(f"Year Founded: {founded}")
        print(f"Current Revenue: ${revenue}")
        print(f"Is Publicly Traded: {is_public}")
        print("-" * 20)  # Print a separator line


    def analyze_weekly_sales(sales_data):
        """
        Analyzes and prints a summary of weekly sales data.

        This function demonstrates Python's built-in functions:
        - len(): counts items in a list
        - sum(): adds all numbers in a list
        - min(): finds the smallest value
        - max(): finds the largest value

        Parameters
        ----------
        sales_data : list of float
            A list of individual sale amounts

        Returns
        -------
        dict or None
            Dictionary with sales statistics, or None if no data provided
        """
        # Check if the list is empty - important edge case!
        if not sales_data:
            print("No sales data to analyze.")
            return

        print("--- Weekly Sales Analysis ---")

        # Built-in function len() counts how many items are in the list
        num_transactions = len(sales_data)

        # Built-in function sum() adds up all the numbers in the list
        total_revenue = sum(sales_data)

        # Built-in function min() finds the smallest number
        smallest_sale = min(sales_data)

        # Built-in function max() finds the largest number
        largest_sale = max(sales_data)

        # Calculate average: total divided by count
        # The "if...else" prevents division by zero
        average_sale = total_revenue / num_transactions if num_transactions > 0 else 0

        # Display the results with proper formatting
        print(f"Number of Transactions: {num_transactions}")
        print(f"Total Weekly Revenue: ${total_revenue:.2f}")  # .2f = 2 decimal places
        print(f"Smallest Sale: ${smallest_sale:.2f}")
        print(f"Largest Sale: ${largest_sale:.2f}")
        print(
            f"Average Sale Amount: ${round(average_sale, 2)}"
        )  # round() is another built-in
        print("-" * 20)

        # Return a dictionary with all the calculated values
        # This allows other code to use these results programmatically
        return {
            "num_transactions": num_transactions,
            "total_revenue": total_revenue,
            "smallest_sale": smallest_sale,
            "largest_sale": largest_sale,
            "average_sale": average_sale,
        }


    def interactive_profit_calculator():
        """
        Handles user input to calculate and display profit.

        This function demonstrates:
        - The input() function to get user input
        - Type conversion with float()
        - Error handling with try/except blocks

        Returns
        -------
        float or None
            The calculated profit, or None if invalid input provided
        """
        print("--- Interactive Profit Calculator ---")
        try:
            # input() gets text from the user
            # float() converts the text string to a decimal number
            user_revenue = float(input("Enter your total revenue: "))
            user_expenses = float(input("Enter your total expenses: "))

            # Simple calculation: Revenue - Expenses = Profit
            profit = user_revenue - user_expenses
            print(f"Your calculated profit is: ${profit:.2f}")
            return profit
        except ValueError:
            # If the user enters something that can't be converted to a number,
            # Python raises a ValueError. We catch it and handle it gracefully.
            print("Invalid input. Please enter numbers only.")
            return None


    if __name__ == "__main__":
        # This block only runs when the file is executed directly

        # --- Storing Company Profile in Variables ---
        # We pass different types of data: string, int, float, and boolean
        display_company_profile("InnovateCorp", 2015, 2500000.50, False)

        # --- Using Built-in Functions for Sales Analysis ---
        # Create a list of individual sale amounts (floats)
        weekly_sales_data = [150.50, 200.00, 75.25, 300.75, 120.00, 450.50, 275.00]
        # Analyze this data using Python's built-in functions
        analyze_weekly_sales(weekly_sales_data)

        # --- Getting User Input ---
        # Note: This part is not easily testable in an automated way without mocking input.
        # The function is separated to keep the core logic testable.
        # Uncomment the line below to try the interactive calculator:
        # interactive_profit_calculator()
    ```
