While lists are great for data that changes, sometimes you need to store data that *shouldn't* change. For this, Python provides the **tuple**.

## What is a Tuple?

A tuple is an ordered, **immutable** collection of items. "Immutable" means once a tuple is created, it cannot be changed. This makes tuples perfect for protecting the integrity of fixed data records.

```python
# A tuple for a transaction record (ID, Date, Amount)
transaction = (1001, "2024-03-15", 499.99)
```

### Why Use a Tuple?

1. **Data Integrity:** Prevents accidental modification of data that should be constant.
1. **Performance:** Tuples are slightly more memory-efficient and faster than lists.
1. **Dictionary Keys:** Tuples can be used as keys in dictionaries, whereas lists cannot.

### Unpacking Tuples

A very common and elegant feature is "unpacking," which lets you assign the items of a tuple to multiple variables at once.

```python
trans_id, date, amount = transaction
```

## Environment Setup

Before you begin, ensure you have followed the setup instructions in the main [README.md](https://github.com/saint2706/Coding-For-MBA/blob/main/README.md) to set up your virtual environment and install the required libraries.

## Exploring the Refactored Code

The script for this lesson, `tuples.py`, has been refactored to separate the logic for handling tuples into testable functions.

1. **Review the Code:** Open `Day_06_Tuples/tuples.py`. Notice the functions `get_location_coordinates()` and `unpack_transaction()` that now contain the core logic.
1. **Run the Script:** From the root directory of the project (`Coding-For-MBA`), run the script to see the functions in action:
   ```bash
   python Day_06_Tuples/tuples.py
   ```
1. **Run the Tests:** You can run the tests for this lesson to verify the correctness of each function:
   ```bash
   pytest tests/test_day_06.py
   ```

## 💻 Exercises: Day 6

1. **Store Geographic Coordinates:**

   - In a new script (`my_solutions_06.py`), a company's headquarters is located at latitude `40.7128` and longitude `-74.0060`.
   - Store these in a tuple called `hq_location`.
   - "Unpack" the tuple into `latitude` and `longitude` variables and print them.

1. **Define Product Dimensions:**

   - Create a function `format_dimensions(dims_tuple)` that takes a tuple of three numbers (length, width, height).
   - The function should return a formatted string like `"Dimensions (LxWxH): 25cm x 15cm x 10cm"`.
   - Call the function with a tuple like `(25, 15, 10)` and print the result.

1. **List vs. Tuple - The Right Tool for the Job:**

   - For each scenario below, decide if a **list** or a **tuple** is more appropriate and write a comment in your script explaining why.
     - Scenario A: Storing the monthly sales figures for the past year.
     - Scenario B: Storing the RGB color code for your company's logo.
     - Scenario C: Storing the names of employees in a department.

🎉 **Excellent!** You've learned about immutability and how to use tuples to ensure your data remains constant. Knowing when to use a tuple versus a list is a sign of a thoughtful analyst.

## Additional Materials

- **solutions.ipynb**  
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_06_Tuples/solutions.ipynb){ .md-button } 
  [📓 Open in NBViewer](https://nbviewer.org/github/saint2706/Coding-For-MBA/blob/main/Day_06_Tuples/solutions.ipynb){ .md-button } 
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_06_Tuples/solutions.ipynb){ .md-button .md-button--primary } 
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_06_Tuples/solutions.ipynb){ .md-button }
- **tuples.ipynb**  
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_06_Tuples/tuples.ipynb){ .md-button } 
  [📓 Open in NBViewer](https://nbviewer.org/github/saint2706/Coding-For-MBA/blob/main/Day_06_Tuples/tuples.ipynb){ .md-button } 
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_06_Tuples/tuples.ipynb){ .md-button .md-button--primary } 
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_06_Tuples/tuples.ipynb){ .md-button }

???+ example "solutions.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_06_Tuples/solutions.py)

    ```python title="solutions.py"
    """
    Day 6: Solutions to Exercises
    """

    # --- Exercise 1: Store Geographic Coordinates ---
    print("--- Solution to Exercise 1 ---")
    # A tuple is perfect here because these coordinates are fixed.
    hq_location = (40.7128, -74.0060)

    # "Unpacking" the tuple into separate variables
    latitude, longitude = hq_location

    print(f"Headquarters Location: {hq_location}")
    print(f"Latitude: {latitude}")
    print(f"Longitude: {longitude}")
    print("-" * 20)


    # --- Exercise 2: Define Product Dimensions ---
    print("--- Solution to Exercise 2 ---")
    # Dimensions are fixed, so a tuple is the right choice.
    package_dimensions = (25, 15, 10)

    # Accessing the tuple elements by their index for the print statement.
    print(
        f"Package Dimensions (LxWxH): {package_dimensions[0]}cm x {package_dimensions[1]}cm x {package_dimensions[2]}cm"
    )
    print("-" * 20)


    # --- Exercise 3: List vs. Tuple - The Right Tool for the Job ---
    print("--- Solution to Exercise 3 ---")

    # Scenario A: Storing the monthly sales figures for the past year.
    # Choice: List. Sales figures might need to be corrected or updated. A list is mutable.
    print("Scenario A (Monthly Sales): Use a LIST because the data may need to be changed.")

    # Scenario B: Storing the RGB color code for your company's official logo.
    # Choice: Tuple. A brand color is a constant and should not be accidentally changed. A tuple is immutable.
    print(
        "Scenario B (Brand Color): Use a TUPLE because the data is constant and should not change."
    )

    # Scenario C: Storing the names of employees in a department.
    # Choice: List. The roster of employees in a department changes frequently. A list is mutable.
    print(
        "Scenario C (Employee Roster): Use a LIST because the roster of employees changes over time."
    )

    # Scenario D: Storing the name, founding year, and stock ticker symbol for a company.
    # Choice: Tuple. This is core, identifying information that is fixed and should not change. A tuple is immutable.
    print(
        "Scenario D (Company Profile): Use a TUPLE because this core information is fixed."
    )
    print("-" * 20)
    ```

???+ example "tuples.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_06_Tuples/tuples.py)

    ```python title="tuples.py"
    """
    Day 6: Using Tuples for Immutable Business Data (Refactored)

    This script demonstrates the creation and use of tuples to store
    data that should not be changed, such as transaction records or
    fixed coordinates. This version is refactored into functions for
    better organization and testability.
    """


    def get_location_coordinates(location_tuple):
        """
        Returns the latitude and longitude from a location tuple.
        Assumes the tuple is in the format (latitude, longitude).
        """
        if isinstance(location_tuple, tuple) and len(location_tuple) == 2:
            return location_tuple[0], location_tuple[1]
        return None, None


    def unpack_transaction(transaction_tuple):
        """
        Unpacks a transaction tuple into a dictionary.
        Assumes tuple format is (id, date, amount).
        """
        if isinstance(transaction_tuple, tuple) and len(transaction_tuple) == 3:
            trans_id, date, amount = transaction_tuple
            return {"id": trans_id, "date": date, "amount": amount}
        return None


    def demonstrate_list_vs_tuple():
        """
        Prints scenarios demonstrating when to use a list vs. a tuple.
        """
        print("--- Choosing Between a List and a Tuple ---")

        # Scenario A: Storing the monthly sales figures for the past year.
        # Choice: List. Sales data is likely to be updated or amended.
        monthly_sales = [45000, 52000, 48000, 55000]
        print(
            f"Scenario A (Monthly Sales): Use a list. Data might change. Example: {monthly_sales}"
        )

        # Scenario B: Storing the RGB color code for your company's official logo.
        # Choice: Tuple. The brand color is a fixed constant and should not change.
        brand_color_rgb = (45, 85, 150)
        print(
            f"Scenario B (Brand Color): Use a tuple. Data is constant. Example: {brand_color_rgb}"
        )

        # Scenario C: Storing the names of employees in a department.
        # Choice: List. Employees can be added or removed from the department.
        marketing_team = ["Alice", "Bob", "Charlie"]
        print(
            f"Scenario C (Team Roster): Use a list. Roster changes. Example: {marketing_team}"
        )

        # Scenario D: Storing the name, founding year, and stock ticker symbol for a company.
        # Choice: Tuple. This core identifying information for a company is fixed.
        company_profile = ("InnovateCorp", 2015, "INVC")
        print(
            f"Scenario D (Company Profile): Use a tuple. Core info is fixed. Example: {company_profile}"
        )
        print("-" * 20)


    if __name__ == "__main__":
        # --- Using a Tuple for Fixed Data ---
        print("--- Storing Fixed Location Data ---")
        hq_coords = (40.7128, -74.0060)
        lat, lon = get_location_coordinates(hq_coords)
        if lat is not None:
            print(f"Headquarters Latitude: {lat}")
            print(f"Headquarters Longitude: {lon}")
        print()

        # --- Unpacking Tuples for Readability ---
        print("--- Unpacking a Transaction Record ---")
        transaction_data = (1001, "2024-03-15", 499.99)
        unpacked_data = unpack_transaction(transaction_data)
        if unpacked_data:
            print(f"Transaction ID: {unpacked_data['id']}")
            print(f"Date: {unpacked_data['date']}")
            print(f"Amount: ${unpacked_data['amount']}")
        print("-" * 20)

        # --- List vs. Tuple Demonstration ---
        demonstrate_list_vs_tuple()
    ```
