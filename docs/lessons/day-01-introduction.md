## Welcome to the Course

Welcome, future business leader! You're about to take your first step into a larger world of data-driven decision-making. In today's business landscape, the ability to understand and leverage data is not just a technical skill—it's a core competency for effective management. This course is designed specifically for MBA students like you. We'll skip the abstract computer science jargon and focus on one thing: **using Python as a powerful tool to solve real-world business problems.**

You don't need any prior coding experience. We'll start from zero and build your skills step-by-step. By the end of this 50-day journey, you'll be able to manipulate data, generate insights, and even build predictive models.

## Why Python for Business?

1. **The Lingua Franca of Data:** Python is the most widely used language for data science, machine learning, and analytics.
1. **Automation of Tedious Tasks:** Automate cleaning messy Excel sheets, gathering web data, or generating weekly reports.
1. **Powerful Analytics at Your Fingertips:** Python's extensive libraries allow for complex statistical analysis and compelling data visualizations.
1. **Strategic Advantage:** Understanding the language of your data science team gives you a significant strategic advantage.

## Environment Setup

Before you begin, please follow the setup instructions in the main [README.md](https://github.com/saint2706/Coding-For-MBA/blob/main/README.md) at the root of this repository. This will guide you through:

1. Cloning the project.
1. Setting up a virtual environment.
1. Installing all the necessary libraries from `requirements.txt`.

Once you have completed those steps and activated your virtual environment, you are ready to start this lesson.

## Your First Python Script: A Business Calculation

Let's explore the code for today's lesson. The script for this lesson is `helloworld.py`.

1. **Review the Code:** Open `Day_01_Introduction/helloworld.py` in your code editor. You will see that the code is now organized into functions, which is a best practice for writing clean and reusable code.
1. **Run the Script:** To run the script, make sure your terminal is in the root directory of this project (the `Coding-For-MBA` folder) and your virtual environment is active. Then, execute the script by running:
   ```bash
   python Day_01_Introduction/helloworld.py
   ```

You will see the output of the business calculations printed to your console.

## 💻 Exercises: Day 1

The exercises are designed to help you practice the fundamental concepts introduced in the script.

1. **Company Introduction:**

   - Create a new Python file named `my_solutions.py` in the `Day_01_Introduction` folder.
   - In your new script, use the `print()` function to introduce a fictional company.
   - Example: `print("Welcome to InnovateCorp Analytics")`

1. **Quarterly Sales Calculation:**

   - A company had quarterly sales of $110,000, $120,000, $135,000, and $140,000.
   - In your script, use the `print()` function to calculate and display the total annual sales. (Hint: you can do math right inside the print statement: `print(110000 + 120000 + ...)`).

1. **Checking Data Types in Business:**

   - Use the `type()` function to check the data types of the following business-related data points.
     - `1500` (e.g., number of units sold)
     - `1500.75` (e.g., a price or a financial metric)
     - `'InnovateCorp'` (e.g., a company name)
     - `True` (e.g., is the product in stock?)

🎉 **Congratulations!** You've just run your first refactored Python script and are on your way to becoming a data-savvy leader.

## Additional Materials

- **helloworld.ipynb**  
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_01_Introduction/helloworld.ipynb){ .md-button } 
  [📓 Open in NBViewer](https://nbviewer.org/github/saint2706/Coding-For-MBA/blob/main/Day_01_Introduction/helloworld.ipynb){ .md-button } 
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_01_Introduction/helloworld.ipynb){ .md-button .md-button--primary } 
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_01_Introduction/helloworld.ipynb){ .md-button }
- **solutions.ipynb**  
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_01_Introduction/solutions.ipynb){ .md-button } 
  [📓 Open in NBViewer](https://nbviewer.org/github/saint2706/Coding-For-MBA/blob/main/Day_01_Introduction/solutions.ipynb){ .md-button } 
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_01_Introduction/solutions.ipynb){ .md-button .md-button--primary } 
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_01_Introduction/solutions.ipynb){ .md-button }

???+ example "helloworld.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_01_Introduction/helloworld.py)

    ```python title="helloworld.py"
    """
    Day 1: Python for Business Analytics - First Steps (Refactored)

    This script demonstrates basic Python concepts using business-relevant examples.
    We will perform a simple profit calculation and check the types of various
    business-related data points. This version is refactored to use functions.
    """


    def calculate_gross_profit(revenue, cogs):
        """Calculates the gross profit from revenue and COGS."""
        return revenue - cogs


    def calculate_gross_profit_margin(gross_profit, revenue):
        """Calculates the gross profit margin."""
        if revenue == 0:
            return 0
        return (gross_profit / revenue) * 100


    def display_business_analytics(revenue, cogs):
        """Calculates and displays key business metrics."""
        print("Welcome to the Quarterly Business Review Dashboard")
        print()

        gross_profit = calculate_gross_profit(revenue, cogs)
        gross_profit_margin = calculate_gross_profit_margin(gross_profit, revenue)

        print(f"Total Revenue: ${revenue}")
        print(f"Cost of Goods Sold: ${cogs}")
        print(f"Gross Profit: ${gross_profit}")
        print()
        print(f"Gross Profit Margin: {gross_profit_margin:.2f}%")
        print("-" * 20)


    def display_data_types():
        """Displays the types of various business-related data points."""
        print("Checking the types of some common business data points:")

        units_sold = 1500
        product_price = 49.99
        company_name = "InnovateCorp"
        is_in_stock = True
        quarterly_sales = [110000, 120000, 135000, 140000]

        print(f"Data: {units_sold}, Type: {type(units_sold)}")
        print(f"Data: {product_price}, Type: {type(product_price)}")
        print(f"Data: '{company_name}', Type: {type(company_name)}")
        print(f"Data: {is_in_stock}, Type: {type(is_in_stock)}")
        print(f"Data: {quarterly_sales}, Type: {type(quarterly_sales)}")


    if __name__ == "__main__":
        # --- Basic Business Calculations ---
        revenue_main = 500000
        cogs_main = 350000
        display_business_analytics(revenue_main, cogs_main)

        # --- Understanding Data Types in a Business Context ---
        display_data_types()
    ```

???+ example "solutions.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_01_Introduction/solutions.py)

    ```python title="solutions.py"
    """
    Day 1: Solutions to Exercises
    """

    # --- Exercise 1: Company Introduction ---
    print("--- Solution to Exercise 1 ---")
    print("Welcome to InnovateCorp Analytics")
    print("-" * 20)


    # --- Exercise 2: Quarterly Sales Calculation ---
    print("--- Solution to Exercise 2 ---")
    # The calculation is done directly inside the print function.
    print("Total Annual Sales:")
    print(110000 + 120000 + 135000 + 140000)
    print("-" * 20)


    # --- Exercise 3: Checking Data Types in Business ---
    print("--- Solution to Exercise 3 ---")
    # Using the type() function to inspect each data point.
    print("Data point: 1500, Type:", type(1500))
    print("Data point: 1500.75, Type:", type(1500.75))
    print("Data point: 'InnovateCorp', Type:", type("InnovateCorp"))
    print("Data point: True, Type:", type(True))
    print("-" * 20)
    ```
