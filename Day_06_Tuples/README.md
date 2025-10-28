# 📘 Day 6: Tuples - Storing Immutable Business Data

While lists are great for data that changes, sometimes you need to store data that *shouldn't*
change. For this, Python provides the **tuple**.

## What is a Tuple?

A tuple is an ordered, **immutable** collection of items. "Immutable" means once a tuple is created,
it cannot be changed. This makes tuples perfect for protecting the integrity of fixed data records.

```python
# A tuple for a transaction record (ID, Date, Amount)
transaction = (1001, "2024-03-15", 499.99)
```

### Why Use a Tuple?

1. **Data Integrity:** Prevents accidental modification of data that should be constant.
1. **Performance:** Tuples are slightly more memory-efficient and faster than lists.
1. **Dictionary Keys:** Tuples can be used as keys in dictionaries, whereas lists cannot.

### Unpacking Tuples

A very common and elegant feature is "unpacking," which lets you assign the items of a tuple to
multiple variables at once.

```python
trans_id, date, amount = transaction
```

## Environment Setup

Before you begin, ensure you have followed the setup instructions in the main
[README.md](../../README.md) to set up your virtual environment and install the required libraries.

## Exploring the Refactored Code

The script for this lesson, `tuples.py`, has been refactored to separate the logic for handling
tuples into testable functions.

1. **Review the Code:** Open `Day_06_Tuples/tuples.py`. Notice the functions
   `get_location_coordinates()` and `unpack_transaction()` that now contain the core logic.
1. **Run the Script:** From the root directory of the project (`Coding-For-MBA`), run the script to
   see the functions in action:
   ```bash
   python Day_06_Tuples/tuples.py
   ```
1. **Run the Tests:** You can run the tests for this lesson to verify the correctness of each
   function:
   ```bash
   pytest tests/test_day_06.py
   ```

## 💻 Exercises: Day 6

1. **Store Geographic Coordinates:**

   - In a new script (`my_solutions_06.py`), a company's headquarters is located at latitude
     `40.7128` and longitude `-74.0060`.
   - Store these in a tuple called `hq_location`.
   - "Unpack" the tuple into `latitude` and `longitude` variables and print them.

1. **Define Product Dimensions:**

   - Create a function `format_dimensions(dims_tuple)` that takes a tuple of three numbers (length,
     width, height).
   - The function should return a formatted string like `"Dimensions (LxWxH): 25cm x 15cm x 10cm"`.
   - Call the function with a tuple like `(25, 15, 10)` and print the result.

1. **List vs. Tuple - The Right Tool for the Job:**

   - For each scenario below, decide if a **list** or a **tuple** is more appropriate and write a
     comment in your script explaining why.
     - Scenario A: Storing the monthly sales figures for the past year.
     - Scenario B: Storing the RGB color code for your company's logo.
     - Scenario C: Storing the names of employees in a department.

🎉 **Excellent!** You've learned about immutability and how to use tuples to ensure your data remains
constant. Knowing when to use a tuple versus a list is a sign of a thoughtful analyst.
