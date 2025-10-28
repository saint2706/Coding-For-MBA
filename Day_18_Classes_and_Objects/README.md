# 📘 Day 18: Classes and Objects - Modeling Business Concepts

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
[README.md](../../README.md) to set up your virtual environment and install the required libraries.

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

---

**Previous:** [Day 17 – Day 17: Regular Expressions for Text Pattern Matching](../Day_17_Regular_Expressions/README.md) • **Next:** [Day 19 – Day 19: Working with Dates and Times](../Day_19_Python_Date_Time/README.md)

_You are on lesson 18 of 108._

<!-- LESSON_FOOTER_END -->