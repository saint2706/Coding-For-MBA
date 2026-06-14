---
day: 18
title: "Classes and Objects"
phase: 2
phaseTitle: "Functions, Modularity & Data Wrangling"
slug: "classes-objects"
duration: 60
difficulty: "intermediate"
tags:
  - python
  - oop
  - classes
  - encapsulation
concepts:
  - "class definition"
  - "instance methods"
  - "attributes and properties"
  - "inheritance basics"
prerequisites: [11, 12]
outcomes:
  - "Define and instantiate classes"
  - "Use __init__ and instance methods"
  - "Understand encapsulation principles"
---

# 🎯 Day 18: Classes and Objects

> *"Object-oriented programming: model the real world in code."*

---

## The "Never-Coded" Bridge

**Think about how businesses organize information:**

A "Customer" has:

- Name, email, phone (data)
- Can place orders, update profile, check balance (behaviors)

An "Order" has:

- Items, total, status (data)
- Can add items, calculate total, process payment (behaviors)

Classes in programming work the same way. They bundle **data** (attributes) with **behaviors** (methods) into reusable blueprints:

```python
class Customer:
    def __init__(self, name, email):
        self.name = name
        self.email = email
        self.orders = []

    def place_order(self, order):
        self.orders.append(order)
        return f"Order placed for {self.name}"
```

---

## The Technical Deep Dive

### Defining a Class

```python
class Dog:
    # Class attribute (shared by all instances)
    species = "Canis familiaris"

    # Constructor (initializer)
    def __init__(self, name, age):
        # Instance attributes (unique to each instance)
        self.name = name
        self.age = age

    # Instance method
    def bark(self):
        return f"{self.name} says Woof!"

    def description(self):
        return f"{self.name} is {self.age} years old"


# Create instances
buddy = Dog("Buddy", 3)
max = Dog("Max", 5)

print(buddy.bark())  # "Buddy says Woof!"
print(max.description())  # "Max is 5 years old"
print(Dog.species)  # "Canis familiaris"
```

### The `self` Parameter

`self` refers to the instance calling the method:

```python
class Counter:
    def __init__(self):
        self.count = 0

    def increment(self):
        self.count += 1
        return self.count


c1 = Counter()
c2 = Counter()

c1.increment()  # c1.count = 1
c1.increment()  # c1.count = 2
c2.increment()  # c2.count = 1 (separate instance)
```

### Properties (Getters/Setters)

```python
class BankAccount:
    def __init__(self, balance=0):
        self._balance = balance  # Convention: _private

    @property
    def balance(self):
        """Getter for balance."""
        return self._balance

    @balance.setter
    def balance(self, value):
        """Setter with validation."""
        if value < 0:
            raise ValueError("Balance cannot be negative")
        self._balance = value


account = BankAccount(100)
print(account.balance)  # 100 (calls getter)
account.balance = 200  # Calls setter
# account.balance = -50    # Raises ValueError
```

### Class Methods and Static Methods

```python
class Employee:
    raise_rate = 1.05  # Class attribute

    def __init__(self, name, salary):
        self.name = name
        self.salary = salary

    def apply_raise(self):
        self.salary = int(self.salary * Employee.raise_rate)

    @classmethod
    def set_raise_rate(cls, rate):
        """Modify class attribute."""
        cls.raise_rate = rate

    @classmethod
    def from_string(cls, emp_str):
        """Alternative constructor."""
        name, salary = emp_str.split("-")
        return cls(name, int(salary))

    @staticmethod
    def is_workday(day):
        """Utility function, doesn't need instance or class."""
        return day.weekday() < 5


# Usage
Employee.set_raise_rate(1.10)
emp = Employee.from_string("Alice-50000")
```

### Inheritance

```python
class Animal:
    def __init__(self, name):
        self.name = name

    def speak(self):
        raise NotImplementedError


class Dog(Animal):
    def speak(self):
        return f"{self.name} says Woof!"


class Cat(Animal):
    def speak(self):
        return f"{self.name} says Meow!"


# Polymorphism
animals = [Dog("Buddy"), Cat("Whiskers")]
for animal in animals:
    print(animal.speak())
```

### Dunder (Magic) Methods

```python
class Product:
    def __init__(self, name, price):
        self.name = name
        self.price = price

    def __str__(self):
        """Human-readable string."""
        return f"{self.name}: ${self.price}"

    def __repr__(self):
        """Debug/developer string."""
        return f"Product('{self.name}', {self.price})"

    def __eq__(self, other):
        """Equality comparison."""
        return self.name == other.name and self.price == other.price

    def __lt__(self, other):
        """Less than (enables sorting)."""
        return self.price < other.price


p = Product("Laptop", 999)
print(p)  # "Laptop: $999"
repr(p)  # "Product('Laptop', 999)"
```

---

## Senior-Level Insights

### Composition Over Inheritance

```python
# Instead of deep inheritance hierarchies...
class Engine:
    def start(self):
        return "Engine running"


class Car:
    def __init__(self):
        self.engine = Engine()  # Composition

    def start(self):
        return self.engine.start()
```

### Data Classes (Python 3.7+)

```python
from dataclasses import dataclass


@dataclass
class Product:
    name: str
    price: float
    quantity: int = 0

    @property
    def total_value(self):
        return self.price * self.quantity


# Automatically generates __init__, __repr__, __eq__
p = Product("Laptop", 999, 5)
print(p)  # Product(name='Laptop', price=999, quantity=5)
```

### Abstract Base Classes

```python
from abc import ABC, abstractmethod


class PaymentProcessor(ABC):
    @abstractmethod
    def process(self, amount):
        pass

    @abstractmethod
    def refund(self, transaction_id):
        pass


class CreditCardProcessor(PaymentProcessor):
    def process(self, amount):
        return f"Charged ${amount} to credit card"

    def refund(self, transaction_id):
        return f"Refunded transaction {transaction_id}"
```

---

## Hands-on Lab

### Exercise 1: Bank Account System

```python
class BankAccount:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self._balance = balance
        self.transactions = []

    @property
    def balance(self):
        return self._balance

    def deposit(self, amount):
        if amount <= 0:
            raise ValueError("Deposit must be positive")
        self._balance += amount
        self.transactions.append(("deposit", amount))
        return self._balance

    def withdraw(self, amount):
        if amount <= 0:
            raise ValueError("Withdrawal must be positive")
        if amount > self._balance:
            raise ValueError("Insufficient funds")
        self._balance -= amount
        self.transactions.append(("withdraw", amount))
        return self._balance

    def statement(self):
        print(f"Account: {self.owner}")
        print("-" * 30)
        for action, amount in self.transactions:
            sign = "+" if action == "deposit" else "-"
            print(f"{action.title():12} {sign}${amount:>10.2f}")
        print("-" * 30)
        print(f"{'Balance':12} ${self._balance:>10.2f}")


# Usage
account = BankAccount("Alice", 1000)
account.deposit(500)
account.withdraw(200)
account.statement()
```

**Expected Output:**
```
Account: Alice
------------------------------
Deposit      +$    500.00
Withdraw     -$    200.00
------------------------------
Balance      $   1300.00
```

---

### Exercise 2: Product Inventory

```python
from dataclasses import dataclass
from typing import List


@dataclass
class Product:
    sku: str
    name: str
    price: float
    stock: int


class Inventory:
    def __init__(self):
        self.products: dict[str, Product] = {}

    def add_product(self, product: Product):
        self.products[product.sku] = product

    def get_product(self, sku: str) -> Product:
        if sku not in self.products:
            raise KeyError(f"Product {sku} not found")
        return self.products[sku]

    def update_stock(self, sku: str, quantity: int):
        product = self.get_product(sku)
        product.stock += quantity

    def low_stock_report(self, threshold: int = 10) -> List[Product]:
        return [p for p in self.products.values() if p.stock < threshold]

    def total_value(self) -> float:
        return sum(p.price * p.stock for p in self.products.values())


# Usage
inv = Inventory()
inv.add_product(Product("LAP001", "Laptop", 999, 5))
inv.add_product(Product("MOU001", "Mouse", 29, 50))
print(f"Total value: ${inv.total_value():,.2f}")
```

**Expected Output:**
```
Total value: $6,445.00
```

---

### Exercise 3: Order Processing System

```python
from datetime import datetime
from dataclasses import dataclass, field
from typing import List


@dataclass
class OrderItem:
    product_name: str
    quantity: int
    unit_price: float

    @property
    def subtotal(self):
        return self.quantity * self.unit_price


@dataclass
class Order:
    customer: str
    items: List[OrderItem] = field(default_factory=list)
    status: str = "pending"
    created_at: datetime = field(default_factory=datetime.now)

    def add_item(self, name, quantity, price):
        self.items.append(OrderItem(name, quantity, price))

    @property
    def total(self):
        return sum(item.subtotal for item in self.items)

    def process(self):
        if not self.items:
            raise ValueError("Cannot process empty order")
        self.status = "processed"
        return f"Order processed. Total: ${self.total:.2f}"


# Usage
order = Order("Alice")
order.add_item("Laptop", 1, 999)
order.add_item("Mouse", 2, 29)
print(order.process())
print(f"Items: {len(order.items)}, Total: ${order.total:.2f}")
```

**Expected Output:**
```
Order processed. Total: $1,057.00
Items: 2, Total: $1,057.00
```

---

## Mastery Check

### Question 1: Class vs Instance

What's the difference between class and instance attributes?

<details>
<summary>Click for Answer</summary>

- **Class attributes**: Shared by all instances
- **Instance attributes**: Unique to each instance

```python
class Dog:
    species = "Canine"  # Class attribute

    def __init__(self, name):
        self.name = name  # Instance attribute


d1 = Dog("Buddy")
d2 = Dog("Max")
# d1.species == d2.species (same)
# d1.name != d2.name (different)
```

</details>

---

### Question 2: Self Purpose

Why is `self` required in method definitions?

<details>
<summary>Click for Answer</summary>

`self` refers to the specific instance calling the method. It allows:

- Access to instance attributes
- Calling other instance methods
- Distinguishing between different instances

</details>

---

### Question 3: Property Usage

When would you use `@property` instead of a regular attribute?

<details>
<summary>Click for Answer</summary>

Use `@property` when you need:

- **Validation** on setting values
- **Computed values** derived from other attributes
- **Read-only** access
- **Lazy loading** of expensive computations

</details>

---

### Question 4: Inheritance

Create a class hierarchy for shapes with area calculation:

<details>
<summary>Click for Answer</summary>

```python
from abc import ABC, abstractmethod
import math


class Shape(ABC):
    @abstractmethod
    def area(self):
        pass


class Rectangle(Shape):
    def __init__(self, width, height):
        self.width = width
        self.height = height

    def area(self):
        return self.width * self.height


class Circle(Shape):
    def __init__(self, radius):
        self.radius = radius

    def area(self):
        return math.pi * self.radius**2
```

</details>

---

### Question 5: Design Scenario

**Scenario**: Design a library system with Books, Members, and Loans.

<details>
<summary>Click for Answer</summary>

```python
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import List, Optional


@dataclass
class Book:
    isbn: str
    title: str
    author: str
    available: bool = True


@dataclass
class Member:
    member_id: str
    name: str
    loans: List["Loan"] = field(default_factory=list)

    def borrow(self, book: Book) -> "Loan":
        if not book.available:
            raise ValueError(f"{book.title} is not available")
        book.available = False
        loan = Loan(self, book)
        self.loans.append(loan)
        return loan


@dataclass
class Loan:
    member: Member
    book: Book
    checkout_date: datetime = field(default_factory=datetime.now)
    due_date: datetime = field(
        default_factory=lambda: datetime.now() + timedelta(days=14)
    )
    returned: bool = False

    def return_book(self):
        self.book.available = True
        self.returned = True
```

</details>

---

## Summary

Today you learned:

- ✅ Classes bundle data and behavior
- ✅ `__init__` initializes instances
- ✅ Properties provide controlled attribute access
- ✅ Inheritance enables code reuse
- ✅ Dunder methods customize object behavior

**Tomorrow**: We'll explore **DateTime**—handling dates, times, and time zones.

---

## Glossary

| Term | Definition |
|------|------------|
| Class | A blueprint for creating objects that bundles data (attributes) and behavior (methods) into a single reusable template. |
| Object | An instance of a class; a concrete entity created from the class blueprint with its own attribute values. |
| Instance | A specific realized object created by calling a class, e.g., `account = BankAccount("Alice")` creates one instance. |
| `__init__` | The constructor method called automatically when an instance is created; used to initialize instance attributes. |
| Method | A function defined inside a class that operates on instances via the `self` parameter. |
| Inheritance | A mechanism where a child class acquires attributes and methods from a parent class, enabling code reuse. |
| `self` | A conventional name for the first parameter of instance methods, referring to the specific object calling the method. |
| `@property` | A decorator that allows a method to be accessed like an attribute, enabling computed values and validation on assignment. |
| Encapsulation | Bundling data and the methods that operate on that data together, and restricting direct access to internal state. |
| Dataclass | A class decorated with `@dataclass` that auto-generates `__init__`, `__repr__`, and `__eq__` from annotated fields. |

## Task Block (Core / Stretch / Expert)

### Project Thread (Days 18–21): Retail Operations Toolkit

Use the same mini-project across these days so each concept compounds into a usable product artifact.

### Core

- Model `Customer`, `Product`, and `Order` classes for a retail workflow.
- Add methods that compute order totals and update inventory in memory.
- Write 3–5 asserts that validate class behavior and edge cases.

### Stretch

- Add inheritance or composition for discount strategies (e.g., member, promo code, seasonal).
- Persist object state to JSON-friendly dictionaries for packaging later.

### Expert

- Refactor class boundaries to reduce coupling and document why your design supports packaging on Day 20.
- Add a tiny CLI entry function (`main()`) that runs one realistic order scenario.

## Common Grading Rubric (applies every day)

| Criterion | 1 - Emerging | 2 - Developing | 3 - Proficient | 4 - Strong |
|---|---|---|---|---|
| Correctness | Major logic errors; results frequently wrong. | Core path works but multiple inaccuracies remain. | Outputs are correct for expected inputs and checked with examples. | Outputs are consistently correct, including tricky cases and clear verification. |
| Robustness | Breaks on minor input changes or missing values. | Handles some variation but fails on common edge cases. | Handles expected edge cases with explicit guards/validation. | Gracefully handles unexpected data, with informative failures and recovery paths. |
| Readability | Hard to follow; unclear naming/structure. | Partially clear but inconsistent style or organization. | Clear naming, structure, and comments/docstrings where needed. | Highly readable, well-organized, and easy for teammates to extend quickly. |
| Reuse | One-off script with duplicated logic. | Some modularization, limited reuse. | Reusable functions/classes with sensible boundaries. | Well-factored components with clean interfaces and minimal duplication. |
