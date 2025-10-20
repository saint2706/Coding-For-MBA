Time-series analysis is at the heart of business analytics. Whether you're tracking daily sales, monthly user growth, or quarterly financial results, you need to work with dates and times. Python's built-in `datetime` module is the standard tool for these tasks.

## Key `datetime` Concepts

- **`datetime.now()`:** Gets the current date and time as a `datetime` object.
- **`strftime(format_code)`:** **Str**ing **F**rom **Time**. Formats a `datetime` object into a string according to a specific format code (e.g., `"%Y-%m-%d"`).
- **`strptime(string, format_code)`:** **Str**ing **P**arse **Time**. Parses a string into a `datetime` object based on a specific format code. This is crucial for converting text-based dates into a usable format.
- **`timedelta`:** Represents the difference between two dates or times.

## Environment Setup

Before you begin, ensure you have followed the setup instructions in the main [README.md](https://github.com/saint2706/Coding-For-MBA/blob/main/README.md) to set up your virtual environment and install the required libraries.

## Exploring the Refactored Code

The script for this lesson, `date_time.py`, has been refactored to place each date/time operation into its own testable function.

1. **Review the Code:** Open `Day_19_Python_Date_Time/date_time.py`. Examine functions like `get_current_datetime_components()`, `format_datetime_to_string()`, `parse_string_to_datetime()`, and `calculate_date_difference()`.
1. **Run the Script:** From the root directory of the project (`Coding-For-MBA`), run the script to see the functions in action:
   ```bash
   python Day_19_Python_Date_Time/date_time.py
   ```
1. **Run the Tests:** You can run the tests for this lesson to verify the correctness of each function:
   ```bash
   pytest tests/test_day_19.py
   ```

## 💻 Exercises: Day 19

1. **Format the Current Date:**

   - In a new script (`my_solutions_19.py`), import the `datetime` object from the `datetime` module.
   - Get the current date and time.
   - Use the `strftime` method to format it into a string like `"Today is 24 September, 2025"`.
   - Print the result.

1. **Calculate Days Until a Deadline:**

   - Create a function `days_until(deadline_str)` that takes a date string in `"YYYY-MM-DD"` format.
   - Inside the function, get today's date (`date.today()`) and parse the deadline string into a `date` object.
   - Calculate the difference and return the number of days.
   - Call your function with a future date and print the result.

1. **Parse a Log File Timestamp:**

   - You have a timestamp from a log file as a string: `"Log entry: 2023-03-15 10:30:00"`.
   - Import the `parse_string_to_datetime` function from the lesson.
   - The timestamp part starts at index 13. Use string slicing to extract just the date/time part (`"2023-03-15 10:30:00"`).
   - Call the function with the extracted string and the correct format code (`"%Y-%m-%d %H:%M:%S"`) and print the resulting `datetime` object.

🎉 **Congratulations!** You've learned how to work with dates and times in Python. You're now ready to tackle time-series analysis and other time-based calculations.

## Additional Materials

- **date_time.ipynb**  
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_19_Python_Date_Time/date_time.ipynb){ .md-button } 
  [📓 Open in NBViewer](https://nbviewer.org/github/saint2706/Coding-For-MBA/blob/main/Day_19_Python_Date_Time/date_time.ipynb){ .md-button } 
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_19_Python_Date_Time/date_time.ipynb){ .md-button .md-button--primary } 
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_19_Python_Date_Time/date_time.ipynb){ .md-button }
- **solutions.ipynb**  
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_19_Python_Date_Time/solutions.ipynb){ .md-button } 
  [📓 Open in NBViewer](https://nbviewer.org/github/saint2706/Coding-For-MBA/blob/main/Day_19_Python_Date_Time/solutions.ipynb){ .md-button } 
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_19_Python_Date_Time/solutions.ipynb){ .md-button .md-button--primary } 
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_19_Python_Date_Time/solutions.ipynb){ .md-button }

???+ example "date_time.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_19_Python_Date_Time/date_time.py)

    ```python title="date_time.py"
    """
    Day 19: Working with Dates and Times in Python (Refactored)

    This script demonstrates common date and time operations using the
    datetime module, refactored into testable functions.
    """

    from datetime import date, datetime, timedelta


    def get_current_datetime_components() -> dict:
        """Gets the current date and time and returns its components as a dictionary."""
        now = datetime.now()
        return {
            "day": now.day,
            "month": now.month,
            "year": now.year,
            "hour": now.hour,
            "minute": now.minute,
            "timestamp": now.timestamp(),
        }


    def format_datetime_to_string(dt_object: datetime, format_str: str) -> str:
        """Formats a datetime object into a string according to a format code."""
        return dt_object.strftime(format_str)


    def parse_string_to_datetime(date_string: str, format_str: str) -> datetime:
        """Parses a string into a datetime object based on a format code."""
        try:
            return datetime.strptime(date_string, format_str)
        except ValueError:
            return None


    def calculate_date_difference(date1: date, date2: date) -> timedelta:
        """Calculates the difference between two date objects."""
        return date1 - date2


    def main():
        """Main function to demonstrate datetime operations."""
        print("--- Getting Current Date and Time Components ---")
        dt_components = get_current_datetime_components()
        print(f"Current Datetime Components: {dt_components}")
        print("-" * 20)

        print("--- Formatting a Datetime Object to a String ---")
        now_obj = datetime.now()
        formatted_t = format_datetime_to_string(now_obj, "%m/%d/%Y, %H:%M:%S")
        print(f"Current datetime object: {now_obj}")
        print(f"Formatted as a string: {formatted_t}")
        print("-" * 20)

        print("--- Parsing a String into a Datetime Object ---")
        date_str_to_parse = "5 December, 2019"
        parsed_date_obj = parse_string_to_datetime(date_str_to_parse, "%d %B, %Y")
        print(f"Original string: '{date_str_to_parse}'")
        print(f"Parsed into a datetime object: {parsed_date_obj}")
        print("-" * 20)

        print("--- Calculating the Difference Between Two Dates ---")
        new_year_2022 = date(year=2022, month=1, day=1)
        today_fake = date(year=2021, month=9, day=20)
        time_difference = calculate_date_difference(new_year_2022, today_fake)
        print(
            f"The difference between {new_year_2022} and {today_fake} is {time_difference.days} days."
        )
        print("-" * 20)


    if __name__ == "__main__":
        main()
    ```

???+ example "solutions.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_19_Python_Date_Time/solutions.py)

    ```python title="solutions.py"
    # Day 19: Python Date and Time - Solutions

    from datetime import date, datetime

    ## Exercise 1: Format the current date

    now = datetime.now()
    formatted_date = now.strftime("Today is %d %B, %Y")
    print(formatted_date)


    ## Exercise 2: Calculate the number of days until your next birthday


    def days_until_next_birthday(birthday_month: int, birthday_day: int) -> int:
        today = date.today()
        next_birthday_year = today.year

        # Check if the birthday has already passed this year
        if today.month > birthday_month or (
            today.month == birthday_month and today.day > birthday_day
        ):
            next_birthday_year += 1

        next_birthday = date(next_birthday_year, birthday_month, birthday_day)
        delta = next_birthday - today
        return delta.days


    # Example usage (replace with your own birthday)
    days_left = days_until_next_birthday(10, 25)
    print(f"There are {days_left} days until your next birthday.")


    ## Exercise 3: Parse a date string

    date_string = "2023-01-15"
    parsed_date = datetime.strptime(date_string, "%Y-%m-%d")
    print(f"The parsed date is: {parsed_date}")
    ```
