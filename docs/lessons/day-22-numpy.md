While Python lists are flexible, they aren't efficient for large-scale numerical calculations. For this, we use **NumPy** (Numerical Python), the fundamental package for scientific and numerical computing in Python. It is the bedrock upon which almost all data science libraries, including Pandas, are built.

## Why NumPy for Business?

The core advantage of NumPy is **vectorization**. Instead of looping through 10,000 sales figures to apply a price increase, you can perform the operation on the entire dataset at once. This makes your code:

1. **Faster:** NumPy operations are performed in highly optimized C code, making them orders of magnitude faster than Python loops.
1. **More Readable:** `new_prices = prices * 1.05` is much clearer than a `for` loop.

## Key NumPy Concepts

- **`ndarray`:** The core data structure, a powerful N-dimensional array. It's like a Python list but faster and more memory-efficient.
- **Vectorized Operations:** Performing math on entire arrays at once (e.g., `revenue = prices_array * units_array`).
- **Array Methods:** NumPy arrays have built-in methods for fast calculations (e.g., `.sum()`, `.mean()`, `.max()`, `.std()`).
- **Boolean Indexing:** Using a conditional to create a boolean array (`True`/`False` values) and then using that array to filter your data.

## Environment Setup

Before you begin, ensure you have followed the setup instructions in the main [README.md](https://github.com/saint2706/Coding-For-MBA/blob/main/README.md) to set up your virtual environment and install the required libraries (including `numpy`).

## Exploring the Refactored Code

The script for this lesson, `numpy_examples.py`, has been refactored to place each NumPy task into its own testable function.

1. **Review the Code:** Open `Day_22_NumPy/numpy_examples.py`. Examine the functions `calculate_revenue_vectorized()`, `analyze_sales_data()`, and `filter_above_average()`.
1. **Run the Script:** From the root directory of the project (`Coding-For-MBA`), run the script to see the functions in action:
   ```bash
   python Day_22_NumPy/numpy_examples.py
   ```
1. **Run the Tests:** You can run the tests for this lesson to verify the correctness of each function:
   ```bash
   pytest tests/test_day_22.py
   ```

## 💻 Exercises: Day 22

1. **Vectorized Revenue Calculation:**

   - In a new script (`my_solutions_22.py`), create two Python lists: `prices = [12.50, 15.00, 22.50]` and `units = [100, 85, 120]`.
   - Import the `calculate_revenue_vectorized` function from the lesson script.
   - Call the function with your lists and print the resulting NumPy array.

1. **Sales Data Analysis:**

   - You have a list of sales figures: `sales_data = [250, 300, 280, 450, 500, 220, 180]`.
   - Import and use the `analyze_sales_data` function to get a dictionary of statistics.
   - Print the total sales and the mean sales from the returned dictionary.

1. **Conditional Filtering with Arrays:**

   - Import the `filter_above_average` function and the `numpy` library (`import numpy as np`).
   - Create a NumPy array from your `sales_data` list from the previous exercise.
   - Pass this array to the `filter_above_average` function to get a new array containing only the sales figures that were better than average.
   - Print the resulting array.

🎉 **Fantastic start!** NumPy is the essential first step into the world of high-performance data analysis in Python. Understanding vectorization will make all subsequent topics, especially Pandas, much easier to grasp.

## Additional Materials

- **numpy_examples.ipynb**  
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_22_NumPy/numpy_examples.ipynb){ .md-button } 
  [📓 Open in NBViewer](https://nbviewer.org/github/saint2706/Coding-For-MBA/blob/main/Day_22_NumPy/numpy_examples.ipynb){ .md-button } 
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_22_NumPy/numpy_examples.ipynb){ .md-button .md-button--primary } 
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_22_NumPy/numpy_examples.ipynb){ .md-button }
- **solutions.ipynb**  
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_22_NumPy/solutions.ipynb){ .md-button } 
  [📓 Open in NBViewer](https://nbviewer.org/github/saint2706/Coding-For-MBA/blob/main/Day_22_NumPy/solutions.ipynb){ .md-button } 
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_22_NumPy/solutions.ipynb){ .md-button .md-button--primary } 
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_22_NumPy/solutions.ipynb){ .md-button }

???+ example "numpy_examples.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_22_NumPy/numpy_examples.py)

    ```python title="numpy_examples.py"
    """
    Day 22: NumPy in Action for Business Analytics (Refactored)

    This script demonstrates fundamental NumPy operations for
    efficient numerical analysis of business data. This version is
    refactored into functions for better organization and testability.
    """

    import numpy as np


    def calculate_revenue_vectorized(prices: list, units: list) -> np.ndarray:
        """
        Calculates revenue by performing a vectorized multiplication of prices and units.
        """
        prices_array = np.array(prices)
        units_array = np.array(units)
        return prices_array * units_array


    def analyze_sales_data(sales: list) -> dict:
        """
        Analyzes a list of sales data and returns a dictionary of key statistics.
        """
        sales_array = np.array(sales)
        if sales_array.size == 0:
            return {}

        return {
            "total": sales_array.sum(),
            "mean": sales_array.mean(),
            "max": sales_array.max(),
            "min": sales_array.min(),
            "std_dev": sales_array.std(),
        }


    def filter_above_average(data: np.ndarray) -> np.ndarray:
        """
        Filters a NumPy array to return only the elements above its average.
        """
        if data.size == 0:
            return np.array([])

        average = data.mean()
        return data[data > average]


    def main():
        """Main function to demonstrate NumPy capabilities."""
        # --- Example 1: Vectorized Calculations ---
        print("--- Calculating Revenue with Vectorization ---")
        prices_data = [12.50, 15.00, 22.50, 18.00, 19.99]
        units_data = [100, 85, 120, 95, 110]

        revenue_data = calculate_revenue_vectorized(prices_data, units_data)
        print(f"Prices array: {np.array(prices_data)}")
        print(f"Units sold array: {np.array(units_data)}")
        print(f"Revenue per product (vectorized): {revenue_data}")
        print("-" * 20)

        # --- Example 2: Sales Data Analysis ---
        print("--- Analyzing Weekly Sales Data ---")
        weekly_sales_data = [250, 300, 280, 450, 500, 220, 180]
        sales_stats = analyze_sales_data(weekly_sales_data)

        print(f"Sales for the week: {np.array(weekly_sales_data)}")
        print(f"Total weekly sales: ${sales_stats['total']:.2f}")
        print(f"Average daily sales: ${sales_stats['mean']:.2f}")
        print(f"Best sales day: ${sales_stats['max']:.2f}")
        print(f"Worst sales day: ${sales_stats['min']:.2f}")
        print(f"Standard deviation of sales: ${sales_stats['std_dev']:.2f}")
        print("-" * 20)

        # --- Example 3: Conditional Filtering ---
        print("--- Filtering for Above-Average Sales Days ---")
        sales_array = np.array(weekly_sales_data)
        good_days = filter_above_average(sales_array)

        print(f"The sales figures for good days were: {good_days}")
        print(f"Number of good sales days: {len(good_days)}")
        print("-" * 20)


    if __name__ == "__main__":
        main()
    ```

???+ example "solutions.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_22_NumPy/solutions.py)

    ```python title="solutions.py"
    """
    Day 22: NumPy - Solutions

    This file contains comprehensive solutions to all Day 22 exercises,
    demonstrating NumPy fundamentals for business analytics and data science.

    Author: 50 Days of Python Course
    Purpose: Educational solutions for MBA students learning NumPy
    """

    import warnings

    import numpy as np

    # Suppress numpy warnings for cleaner output
    warnings.filterwarnings("ignore", category=RuntimeWarning)


    def exercise_1_array_creation_and_vectorization():
        """
        Exercise 1: Array Creation and Vectorization

        Demonstrates the power of vectorized operations for business calculations
        compared to traditional loop-based approaches.
        """
        print("=" * 60)
        print("📊 EXERCISE 1: Array Creation and Vectorization")
        print("=" * 60)

        # Create the data as requested
        prices = [12.50, 15.00, 22.50, 18.00]
        units = [100, 85, 120, 95]

        print(f"💰 Product Prices: {prices}")
        print(f"📦 Units Sold: {units}")

        # Convert to NumPy arrays
        prices_array = np.array(prices)
        units_array = np.array(units)

        print("\n🔧 Converting to NumPy arrays:")
        print(f"   Prices array: {prices_array}")
        print(f"   Units array: {units_array}")
        print(f"   Prices array type: {type(prices_array)}")
        print(f"   Data type: {prices_array.dtype}")

        # Vectorized multiplication (the magic of NumPy!)
        revenue_array = prices_array * units_array

        print("\n📈 Revenue Calculation (Vectorized):")
        print(f"   Revenue array: {revenue_array}")
        print(f"   Total revenue: ${revenue_array.sum():,.2f}")

        # Demonstrate the difference with traditional loop approach
        print("\n🔍 Comparison with Traditional Loop Approach:")
        revenue_loop = []
        for i in range(len(prices)):
            revenue_loop.append(prices[i] * units[i])

        print(f"   Loop result: {revenue_loop}")
        print(f"   Same result? {np.array_equal(revenue_array, np.array(revenue_loop))}")

        # Advanced: Show additional business insights
        print("\n💡 Business Insights:")
        avg_price = prices_array.mean()
        avg_units = units_array.mean()
        avg_revenue = revenue_array.mean()

        print(f"   Average price per product: ${avg_price:.2f}")
        print(f"   Average units sold: {avg_units:.1f}")
        print(f"   Average revenue per product: ${avg_revenue:.2f}")
        print(
            f"   Best performing product (revenue): Product {np.argmax(revenue_array) + 1} (${revenue_array.max():.2f})"
        )
        print(
            f"   Lowest performing product (revenue): Product {np.argmin(revenue_array) + 1} (${revenue_array.min():.2f})"
        )


    def exercise_2_sales_data_analysis():
        """
        Exercise 2: Sales Data Analysis

        Demonstrates comprehensive statistical analysis of business data
        using NumPy array methods.
        """
        print("\n" + "=" * 60)
        print("📊 EXERCISE 2: Sales Data Analysis")
        print("=" * 60)

        # Weekly sales data as requested
        sales_data = np.array([250, 300, 280, 450, 500, 220, 180])
        days_of_week = [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
        ]

        print("📅 Weekly Sales Data:")
        for day, sales in zip(days_of_week, sales_data):
            print(f"   {day:>9}: ${sales:>6.2f}")

        # Calculate required metrics
        total_weekly_sales = sales_data.sum()
        average_daily_sales = sales_data.mean()
        best_sales_day = sales_data.max()
        worst_sales_day = sales_data.min()

        print("\n📈 Sales Metrics:")
        print(f"   Total weekly sales: ${total_weekly_sales:,.2f}")
        print(f"   Average daily sales: ${average_daily_sales:.2f}")
        print(f"   Best sales day: ${best_sales_day:.2f}")
        print(f"   Worst sales day: ${worst_sales_day:.2f}")

        # Additional business insights
        print("\n💡 Advanced Business Insights:")

        # Standard deviation and variance
        sales_std = sales_data.std()
        sales_var = sales_data.var()

        print(f"   Sales volatility (std dev): ${sales_std:.2f}")
        print(f"   Sales variance: {sales_var:.2f}")

        # Identify specific days
        best_day_index = np.argmax(sales_data)
        worst_day_index = np.argmin(sales_data)

        print(f"   Best performing day: {days_of_week[best_day_index]} (${best_sales_day})")
        print(
            f"   Worst performing day: {days_of_week[worst_day_index]} (${worst_sales_day})"
        )

        # Performance relative to average
        above_average_days = np.sum(sales_data > average_daily_sales)
        below_average_days = np.sum(sales_data < average_daily_sales)

        print(f"   Days above average: {above_average_days}")
        print(f"   Days below average: {below_average_days}")

        # Business recommendations
        print("\n📋 Business Recommendations:")
        if sales_std > average_daily_sales * 0.3:
            print(
                "   ⚠️  High sales volatility detected. Consider investigating factors causing variation."
            )

        weekend_sales = sales_data[5:7]  # Saturday and Sunday
        weekday_sales = sales_data[0:5]  # Monday to Friday

        avg_weekend = weekend_sales.mean()
        avg_weekday = weekday_sales.mean()

        print(f"   Weekend average: ${avg_weekend:.2f}")
        print(f"   Weekday average: ${avg_weekday:.2f}")

        if avg_weekend < avg_weekday:
            print(
                "   💡 Weekend sales are lower. Consider weekend promotions or different staffing."
            )
        else:
            print("   ✅ Weekend sales are strong. Current strategy is working well.")


    def exercise_3_conditional_filtering():
        """
        Exercise 3: Conditional Filtering with Arrays

        Demonstrates boolean indexing and conditional filtering,
        essential for data analysis and business intelligence.
        """
        print("\n" + "=" * 60)
        print("🔍 EXERCISE 3: Conditional Filtering with Arrays")
        print("=" * 60)

        # Using the same sales data from exercise 2
        sales_data = np.array([250, 300, 280, 450, 500, 220, 180])
        days_of_week = [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
        ]

        print(f"📅 Original Sales Data: {sales_data}")

        # Calculate average for filtering
        average_daily_sales = sales_data.mean()
        print(f"📊 Average daily sales: ${average_daily_sales:.2f}")

        # Create boolean mask for days above average
        above_average_boolean = sales_data > average_daily_sales
        print(f"\n🔍 Boolean mask (sales > average): {above_average_boolean}")

        # Filter to get good sales days as requested
        good_sales_days = sales_data[above_average_boolean]
        print(f"📈 Good sales days (above average): {good_sales_days}")

        # Additional filtering examples for business intelligence
        print("\n💼 Advanced Filtering Examples:")

        # High performance days (> 400)
        high_performance = sales_data > 400
        high_sales_values = sales_data[high_performance]
        print(f"   High performance days (>$400): {high_sales_values}")

        # Low performance days (< 250)
        low_performance = sales_data < 250
        low_sales_values = sales_data[low_performance]
        print(f"   Low performance days (<$250): {low_sales_values}")

        # Days within one standard deviation of mean
        std_dev = sales_data.std()
        within_one_std = np.abs(sales_data - average_daily_sales) <= std_dev
        normal_days = sales_data[within_one_std]
        print(f"   Normal performance days (within 1 std dev): {normal_days}")

        # Get the actual day names for good sales days
        good_day_names = np.array(days_of_week)[above_average_boolean]
        print(f"\n📅 Names of good sales days: {list(good_day_names)}")

        # Multiple condition filtering
        print("\n🎯 Multiple Condition Filtering:")

        # Days with sales between 250 and 450
        moderate_sales = (sales_data >= 250) & (sales_data <= 450)
        moderate_values = sales_data[moderate_sales]
        print(f"   Sales between $250-$450: {moderate_values}")

        # Weekend OR high sales (> 400)
        weekend_or_high = (sales_data > 400) | np.isin(
            np.arange(len(sales_data)), [5, 6]
        )  # Sat, Sun indices
        special_days = sales_data[weekend_or_high]
        print(f"   Weekend or high sales days: {special_days}")

        # Business intelligence summary
        print("\n📊 Business Intelligence Summary:")
        print(
            f"   • {np.sum(above_average_boolean)} out of {len(sales_data)} days exceeded average sales"
        )
        print(f"   • {np.sum(high_performance)} days had exceptional sales (>$400)")
        print(f"   • {np.sum(low_performance)} days underperformed (<$250)")
        print(
            f"   • Performance consistency: {np.sum(within_one_std)} days within normal range"
        )


    def bonus_exercise_advanced_numpy():
        """
        Bonus Exercise: Advanced NumPy for Business Analytics

        Demonstrates more sophisticated NumPy operations for real-world
        business scenarios including multi-dimensional arrays and advanced operations.
        """
        print("\n" + "=" * 60)
        print("🚀 BONUS: Advanced NumPy for Business Analytics")
        print("=" * 60)

        # Multi-dimensional array: Sales by product by day
        print("📊 Multi-Dimensional Sales Analysis")

        # Sales data for 3 products over 7 days
        sales_matrix = np.array(
            [
                [120, 150, 130, 180, 200, 90, 80],  # Product A
                [80, 90, 85, 120, 140, 70, 60],  # Product B
                [200, 220, 210, 250, 280, 180, 160],  # Product C
            ]
        )

        products = ["Product A", "Product B", "Product C"]
        days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

        print(f"Sales Matrix Shape: {sales_matrix.shape} (3 products × 7 days)")
        print(f"Sales Matrix:\n{sales_matrix}")

        # Analysis along different axes
        print("\n📈 Axis-based Analysis:")

        # Total sales per product (sum across days - axis=1)
        total_by_product = sales_matrix.sum(axis=1)
        print(f"Total sales per product: {total_by_product}")

        for product, total in zip(products, total_by_product):
            print(f"   {product}: ${total:,}")

        # Total sales per day (sum across products - axis=0)
        total_by_day = sales_matrix.sum(axis=0)
        print(f"\nTotal sales per day: {total_by_day}")

        for day, total in zip(days, total_by_day):
            print(f"   {day}: ${total:,}")

        # Advanced operations
        print("\n🔍 Advanced Operations:")

        # Average sales per product
        avg_by_product = sales_matrix.mean(axis=1)
        print("Average daily sales per product:")
        for product, avg in zip(products, avg_by_product):
            print(f"   {product}: ${avg:.2f}")

        # Best and worst performing days for each product
        print("\nBest performing day for each product:")
        best_days_idx = sales_matrix.argmax(axis=1)
        for i, (product, day_idx) in enumerate(zip(products, best_days_idx)):
            best_sales = sales_matrix[i, day_idx]
            print(f"   {product}: {days[day_idx]} (${best_sales})")

        # Correlation analysis (bonus advanced topic)
        print("\n📊 Product Performance Correlation:")
        correlation_matrix = np.corrcoef(sales_matrix)
        print(f"Correlation matrix shape: {correlation_matrix.shape}")

        # Find most correlated products
        for i in range(len(products)):
            for j in range(i + 1, len(products)):
                correlation = correlation_matrix[i, j]
                print(f"   {products[i]} vs {products[j]}: {correlation:.3f}")

        # Performance ranking
        print("\n🏆 Performance Ranking:")
        product_ranking = np.argsort(total_by_product)[::-1]  # Descending order
        for rank, product_idx in enumerate(product_ranking, 1):
            product_name = products[product_idx]
            total_sales = total_by_product[product_idx]
            print(f"   #{rank}: {product_name} - ${total_sales:,}")

        # Statistical insights
        print("\n📈 Statistical Insights:")
        overall_mean = sales_matrix.mean()
        overall_std = sales_matrix.std()
        print(f"   Overall average daily sales: ${overall_mean:.2f}")
        print(f"   Overall sales volatility (std dev): ${overall_std:.2f}")

        # Identify outliers (sales > mean + 2*std)
        outlier_threshold = overall_mean + 2 * overall_std
        outliers = sales_matrix > outlier_threshold
        print(f"   Outlier threshold (mean + 2*std): ${outlier_threshold:.2f}")
        print(f"   Number of outlier days: {np.sum(outliers)}")


    def performance_comparison_demo():
        """
        Demonstration of NumPy performance advantages over pure Python
        for business data processing.
        """
        print("\n" + "=" * 60)
        print("⚡ PERFORMANCE COMPARISON: NumPy vs Pure Python")
        print("=" * 60)

        import time

        # Create large dataset for performance testing
        size = 100000  # 100k data points
        print(f"📊 Processing {size:,} sales transactions")

        # Generate sample data
        np.random.seed(42)  # For reproducible results
        sales_data_large = np.random.uniform(
            100, 1000, size
        )  # Random sales between $100-$1000
        sales_list = sales_data_large.tolist()  # Convert to Python list

        print("\n🔧 Test: Calculating 15% discount on all sales")

        # NumPy vectorized approach
        start_time = time.time()
        discounted_numpy = sales_data_large * 0.85
        numpy_time = time.time() - start_time

        # Pure Python approach
        start_time = time.time()
        discounted_python = [price * 0.85 for price in sales_list]
        python_time = time.time() - start_time

        print("\n⏱️  Performance Results:")
        print(f"   NumPy vectorized: {numpy_time:.6f} seconds")
        print(f"   Python list comp: {python_time:.6f} seconds")
        print(f"   Speed improvement: {python_time / numpy_time:.1f}x faster with NumPy")

        # Verify results are the same
        print(f"   Results identical: {np.allclose(discounted_numpy, discounted_python)}")

        print("\n💡 Business Impact:")
        if python_time > 0.001:  # If measurable difference
            time_saved = python_time - numpy_time
            print(f"   Time saved per operation: {time_saved:.6f} seconds")
            print(f"   For 1000 daily operations: {time_saved * 1000:.2f} seconds saved")
            print(f"   Annual time savings: {time_saved * 1000 * 365 / 3600:.2f} hours")

        print("   💼 For large-scale business analytics, NumPy is essential!")


    def practical_business_scenarios():
        """
        Practical business scenarios demonstrating real-world NumPy applications.
        """
        print("\n" + "=" * 60)
        print("💼 PRACTICAL BUSINESS SCENARIOS")
        print("=" * 60)

        # Scenario 1: Inventory Management
        print("📦 Scenario 1: Inventory Management")

        # Current inventory levels
        inventory = np.array([150, 75, 200, 50, 300])
        products = ["Widget A", "Widget B", "Widget C", "Widget D", "Widget E"]
        reorder_point = np.array([100, 80, 150, 60, 250])

        # Check which products need reordering
        needs_reorder = inventory < reorder_point
        products_to_reorder = np.array(products)[needs_reorder]

        print(f"   Current inventory: {dict(zip(products, inventory))}")
        print(f"   Products needing reorder: {list(products_to_reorder)}")
        print(f"   Total products below reorder point: {np.sum(needs_reorder)}")

        # Scenario 2: Sales Forecasting
        print("\n📈 Scenario 2: Sales Trend Analysis")

        # Monthly sales data
        months = np.array(["Jan", "Feb", "Mar", "Apr", "May", "Jun"])
        sales = np.array([10000, 12000, 15000, 14000, 18000, 22000])

        # Calculate month-over-month growth
        growth_rates = np.diff(sales) / sales[:-1] * 100

        print(f"   Monthly sales: {dict(zip(months, sales))}")
        print("   Month-over-month growth rates:")
        for i, rate in enumerate(growth_rates):
            print(f"      {months[i]} to {months[i + 1]}: {rate:.1f}%")

        avg_growth = growth_rates.mean()
        print(f"   Average monthly growth rate: {avg_growth:.1f}%")

        # Simple forecast for next month
        next_month_forecast = sales[-1] * (1 + avg_growth / 100)
        print(f"   Forecast for Jul: ${next_month_forecast:,.0f}")

        # Scenario 3: Customer Segmentation
        print("\n👥 Scenario 3: Customer Segmentation")

        # Customer data
        customer_spending = np.array([500, 1500, 300, 2000, 800, 1200, 400, 3000, 600, 900])

        # Define segments based on spending
        high_value = customer_spending > 1500
        medium_value = (customer_spending >= 800) & (customer_spending <= 1500)
        low_value = customer_spending < 800

        print(f"   Total customers: {len(customer_spending)}")
        print(
            f"   High-value customers (>$1500): {np.sum(high_value)} ({np.sum(high_value) / len(customer_spending) * 100:.1f}%)"
        )
        print(
            f"   Medium-value customers ($800-$1500): {np.sum(medium_value)} ({np.sum(medium_value) / len(customer_spending) * 100:.1f}%)"
        )
        print(
            f"   Low-value customers (<$800): {np.sum(low_value)} ({np.sum(low_value) / len(customer_spending) * 100:.1f}%)"
        )

        # Average spending per segment
        print("   Average spending per segment:")
        if np.sum(high_value) > 0:
            print(f"      High-value: ${customer_spending[high_value].mean():.2f}")
        if np.sum(medium_value) > 0:
            print(f"      Medium-value: ${customer_spending[medium_value].mean():.2f}")
        if np.sum(low_value) > 0:
            print(f"      Low-value: ${customer_spending[low_value].mean():.2f}")


    def main():
        """
        Main function to run all Day 22 solutions and demonstrations.
        """
        print("🐍 Day 22: NumPy for Business Analytics - Solutions")
        print("🎓 50 Days of Python for MBA Program")
        print("📚 Comprehensive demonstrations of NumPy fundamentals")

        try:
            # Core exercises
            exercise_1_array_creation_and_vectorization()
            exercise_2_sales_data_analysis()
            exercise_3_conditional_filtering()

            # Advanced content
            bonus_exercise_advanced_numpy()
            performance_comparison_demo()
            practical_business_scenarios()

            print("\n" + "=" * 60)
            print("🎉 All NumPy Exercises Completed Successfully!")
            print("💡 Key Skills Demonstrated:")
            print("   📊 Array creation and vectorized operations")
            print("   📈 Statistical analysis with NumPy methods")
            print("   🔍 Boolean indexing and conditional filtering")
            print("   🏢 Multi-dimensional array operations")
            print("   ⚡ Performance advantages over pure Python")
            print("   💼 Real-world business applications")
            print("=" * 60)

            print("\n🚀 Next Steps:")
            print("   • Master these NumPy fundamentals before moving to Pandas")
            print("   • Practice with your own business datasets")
            print("   • Explore NumPy's extensive documentation")
            print("   • Ready for Day 23: Pandas for advanced data manipulation!")

        except Exception as e:
            print(f"❌ Error in main execution: {e}")
            import traceback

            traceback.print_exc()


    if __name__ == "__main__":
        main()
    ```
