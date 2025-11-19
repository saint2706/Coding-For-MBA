---
title: 'Day 18: Classes and Objects - Modeling Business Concepts'
tags:
  - BI
  - Basics
  - ML
  - Python
---

So far, we've organized our code with functions. But what if you want to model a real-world concept,
like a "Customer," that has both data (name, email) and actions (calculate total spending)? For
this, we use **Object-Oriented Programming (OOP)**, and its building blocks: **classes** and
**objects**.

## What are Classes and Objects?

- A **Class** is a blueprint for creating an object. It defines the data (attributes) and actions
  (methods) that the object will have. Think of `Car` as a class.
- An **Object** is an instance of a class. It's a concrete thing created from the blueprint. Your
  specific `toyota_camry` would be an object of the `Car` class.

This approach is powerful because it lets you bundle data and the functions that operate on that
data together in a clean, logical way.

## Key Class Concepts

- **`__init__(self, ...)`:** The "initializer" or "constructor" method. It runs automatically when
  you create a new object and is used to set up its initial attributes.
- **`self`:** Represents the instance of the class itself. Inside a method, you use `self` to access
  the object's own attributes (e.g., `self.firstname`).
- **Attributes:** Variables that belong to an object (e.g., `person.firstname`).
- **Methods:** Functions that belong to an object (e.g., `person.account_balance()`).

## Environment Setup

Before you begin, ensure you have followed the setup instructions in the main
[README.md](https://github.com/saint2706/Coding-For-MBA/blob/main/README.md) to set up your virtual environment and install the required libraries.

## Exploring the Refactored Code

The script for this lesson, `CaO.py`, has been refactored for clarity and robustness.

1. **Review the Code:** Open `Day_18_Classes_and_Objects/CaO.py`.
   - The `Statistics` class now gracefully handles empty data and potential errors when calculating
     the mode.
   - The `PersonAccount` class has been streamlined to add incomes and expenses via methods, which
     is a more standard object-oriented approach.
1. **Run the Script:** From the root directory of the project (`Coding-For-MBA`), run the script to
   see the classes instantiated and their methods called:
   ```bash
   python Day_18_Classes_and_Objects/CaO.py
   ```
1. **Run the Tests:** You can run the tests for this lesson to verify the correctness of each class
   and its methods under various conditions:
   ```bash
   pytest tests/test_day_18.py
   ```

## 💻 Exercises: Day 18

1. **Create a `Product` Class:**

   - In a new script (`my_solutions_18.py`), create a class named `Product`.
   - The `__init__` method should take `name`, `price`, and `initial_quantity` as arguments and
     store them as attributes.
   - Add a method `get_inventory_value()` that returns the total value of the product's inventory
     (`price * quantity`).
   - Add a method `restock(amount)` that increases the product's quantity.
   - Create an instance of your `Product` class, check its initial inventory value, restock it, and
     then check the new value.

1. **Extend the `PersonAccount` Class:**

   - Import the `PersonAccount` class from the lesson script.
   - Create an instance of the class for a new person.
   - Add several income and expense items using the `.add_income()` and `.add_expense()` methods.
   - Print the final account summary using the `.account_info()` method.

🎉 **Congratulations!** You've learned the basics of object-oriented programming. This will enable
you to write more organized, powerful, and scalable analytical scripts that model real-world
business concepts.

<!-- LESSON_FOOTER_START -->

______________________________________________________________________

**Previous:** [Day 17 – Day 17: Regular Expressions for Text Pattern Matching](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_17_Regular_Expressions/README.md) • **Next:** [Day 19 – Day 19: Working with Dates and Times](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_19_Python_Date_Time/README.md)

_You are on lesson 18 of 108._

<!-- LESSON_FOOTER_END -->

## Additional Materials

- **CaO.ipynb**
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_18_Classes_and_Objects/CaO.ipynb){ .md-button }
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_18_Classes_and_Objects/CaO.ipynb){ .md-button .md-button--primary }
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_18_Classes_and_Objects/CaO.ipynb){ .md-button }
  - **solutions.ipynb**
    [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_18_Classes_and_Objects/solutions.ipynb){ .md-button }
    [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_18_Classes_and_Objects/solutions.ipynb){ .md-button .md-button--primary }
    [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_18_Classes_and_Objects/solutions.ipynb){ .md-button }
    ???+ example "CaO.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_18_Classes_and_Objects/CaO.py)

````
```python title="CaO.py"
"""
Day 18: Classes and Objects for Structured Business Data (Refactored)

This module demonstrates how to use classes and objects to model
real-world business concepts like a statistics calculator and a personal account.
"""

import statistics as stat
from collections import Counter
from typing import Any, Dict, List, Sequence, Tuple, Union

class Statistics:
    """
    A class to perform basic statistical calculations on a list of numbers.

    Classes are blueprints for creating objects. They bundle data (attributes)
    and functions (methods) together. This makes code more organized and reusable.

    Think of a class as a template: you define it once, then create many
    instances (objects) from it.

    Attributes
    ----------
    data : list
        The sequence of numbers to analyze

    Example
    -------
    >>> stats = Statistics([1, 2, 3, 4, 5])
    >>> stats.mean()
    3.0
    """

    def __init__(self, data: Sequence[Union[int, float]]):
        """
        Initializes the Statistics class with a sequence of numbers.

        __init__ is the constructor - it runs when you create a new instance.
        'self' refers to the specific instance being created.

        Parameters
        ----------
        data : Sequence of numbers
            The data to analyze (list, tuple, etc.)
        """
        if not data:
            # Handle empty data case gracefully
            # self.data creates an attribute that belongs to this instance
            self.data = []
        else:
            self.data = data

    def count(self) -> int:
        """
        Calculates the number of elements.

        Methods are functions that belong to a class. They always have
        'self' as their first parameter, which gives access to the
        instance's attributes.

        Returns
        -------
        int
            Number of data points
        """
        # self.data accesses the data attribute of this instance
        return len(self.data)

    def sum(self) -> Union[int, float]:
        """
        Calculates the sum of the numbers.

        Returns
        -------
        float or int
            Sum of all data points, or 0 if empty
        """
        # Conditional expression: returns sum if data exists, else 0
        return sum(self.data) if self.data else 0

    def min(self) -> Union[int, float, None]:
        """Finds the minimum value."""
        return min(self.data) if self.data else None

    def max(self) -> Union[int, float, None]:
        """Finds the maximum value."""
        return max(self.data) if self.data else None

    def range(self) -> Union[int, float]:
        """
        Calculates the range of the data (max - min).

        Methods can call other methods using self.method_name()
        This promotes code reuse within a class.

        Returns
        -------
        float or int
            Range (difference between max and min)
        """
        # Calling self.max() and self.min() - reusing our own methods
        return self.max() - self.min() if self.data else 0

    def mean(self) -> float:
        """Calculates the mean."""
        return stat.mean(self.data) if self.data else 0.0

    def median(self) -> Union[int, float]:
        """Calculates the median."""
        return stat.median(self.data) if self.data else 0.0

    def mode(self) -> Dict[str, Any]:
        """Calculates the mode, handling cases with no unique mode."""
        if not self.data:
            return {"mode": "No data", "count": 0}

        counts = Counter(self.data)
        most_common = counts.most_common(2)  # Get up to two most common

        # If there's only one item or the most common is more frequent than the second most common
        if len(most_common) == 1 or most_common[0][1] > most_common[1][1]:
            mode_value = most_common[0][0]
            return {"mode": mode_value, "count": most_common[0][1]}
        else:
            return {"mode": "No unique mode", "count": 0}

    def std(self) -> float:
        """Calculates the standard deviation."""
        return stat.stdev(self.data) if self.count() > 1 else 0.0

    def var(self) -> float:
        """Calculates the variance."""
        return stat.variance(self.data) if self.count() > 1 else 0.0

    def freq_dist(self) -> List[Tuple[float, Union[int, float]]]:
        """Calculates the frequency distribution as percentages."""
        if not self.data:
            return []
        total = self.count()
        counts = Counter(self.data)
        return sorted(
            [(count / total * 100, item) for item, count in counts.items()],
            reverse=True,
        )

    def describe(self) -> str:
        """Provides a descriptive summary of the data."""
        if not self.data:
            return "No data to describe."

        desc = (
            f"Count: {self.count()}\n"
            f"Sum: {self.sum()}\n"
            f"Min: {self.min()}\n"
            f"Max: {self.max()}\n"
            f"Range: {self.range()}\n"
            f"Mean: {self.mean():.2f}\n"
            f"Median: {self.median()}\n"
            f"Mode: {self.mode()['mode']} (Count: {self.mode()['count']})\n"
            f"Standard Deviation: {self.std():.2f}\n"
            f"Variance: {self.var():.2f}"
        )
        return desc

class PersonAccount:
    """A class to manage a person's income and expenses."""

    def __init__(self, firstname: str, lastname: str):
        self.firstname = firstname
        self.lastname = lastname
        self.incomes: Dict[str, Union[int, float]] = {}
        self.expenses: Dict[str, Union[int, float]] = {}

    def add_income(self, source: str, amount: Union[int, float]):
        """Adds an income source and amount."""
        self.incomes[source] = self.incomes.get(source, 0) + amount

    def add_expense(self, category: str, amount: Union[int, float]):
        """Adds an expense category and amount."""
        self.expenses[category] = self.expenses.get(category, 0) + amount

    def total_income(self) -> Union[int, float]:
        """Calculates the total income."""
        return sum(self.incomes.values())

    def total_expense(self) -> Union[int, float]:
        """Calculates the total expense."""
        return sum(self.expenses.values())

    def account_balance(self) -> Union[int, float]:
        """Calculates the account balance."""
        return self.total_income() - self.total_expense()

    def account_info(self) -> str:
        """Provides information about the person's account."""
        return f"{self.firstname} {self.lastname}'s account:\n  Total Income: ${self.total_income():,.2f}\n  Total Expense: ${self.total_expense():,.2f}\n  Balance: ${self.account_balance():,.2f}"

def main():
    """Main function to demonstrate class usage."""
    print("--- Statistics Class Demonstration ---")
    ages = [
        31,
        26,
        34,
        37,
        27,
        26,
        32,
        32,
        26,
        27,
        27,
        24,
        32,
        33,
        27,
        25,
        26,
        38,
        37,
        31,
        34,
        24,
        33,
        29,
        26,
    ]
    stats_data = Statistics(ages)
    print(stats_data.describe())
    print("-" * 20)

    print("\n--- PersonAccount Class Demonstration ---")
    person_account = PersonAccount("Rishabh", "Agrawal")
    person_account.add_income("Salary", 150000)
    person_account.add_income("Bonus", 5500)
    person_account.add_expense("Rent", 20000)
    person_account.add_expense("General", 4500)

    print(person_account.account_info())

    person_account.add_income("Diwali", 2500)
    person_account.add_expense("Fuel", 5000)
    print("\nAfter adding more income and expenses:")
    print(person_account.account_info())
    print("-" * 20)

if __name__ == "__main__":
    main()
```
````

???+ example "solutions.py"
[View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_18_Classes_and_Objects/solutions.py)

````
```python title="solutions.py"
# Day 18: Classes and Objects - Solutions

from datetime import datetime
from typing import List

from CaO import PersonAccount

## Exercise 1 & 2: Create a `Car` class with a `get_age` method

class Car:
    def __init__(self, make: str, model: str, year: int):
        self.make = make
        self.model = model
        self.year = year

    def display_info(self) -> None:
        print(f"Car Information: {self.year} {self.make} {self.model}")

    def get_age(self) -> int:
        current_year = datetime.now().year
        return current_year - self.year

# Example usage:
my_car = Car("Toyota", "Camry", 2020)
my_car.display_info()
print(f"The car is {my_car.get_age()} years old.")

## Exercise 3: Extend the `PersonAccount` class

# Create an enhanced PersonAccount instance with additional methods
# The PersonAccount class is imported from CaO.py

# Example usage:
person = PersonAccount("John", "Doe")
# Add incomes
person.add_income("Salary", 5000)
person.add_income("Bonus", 1000)
# Add expenses
person.add_expense("Rent", 1500)
person.add_expense("Food", 500)

# Additional methods that could be added to PersonAccount class:
def get_income_sources(account: PersonAccount) -> List[str]:
    """Get all income source names for a PersonAccount."""
    return list(account.incomes.keys())

def get_expense_sources(account: PersonAccount) -> List[str]:
    """Get all expense source names for a PersonAccount."""
    return list(account.expenses.keys())

print(f"Income sources: {get_income_sources(person)}")
print(f"Expense sources: {get_expense_sources(person)}")
print(f"Total income: {person.total_income()}")
print(f"Total expenses: {person.total_expense()}")
print(f"Account balance: {person.account_balance()}")
```
````
