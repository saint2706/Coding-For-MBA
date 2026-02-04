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
