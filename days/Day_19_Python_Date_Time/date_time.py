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
