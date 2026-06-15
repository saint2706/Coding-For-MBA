---
day: 15
title: "Exception Handling"
phase: 2
phaseTitle: "Functions, Modularity & Data Wrangling"
slug: "exception-handling"
duration: 50
difficulty: "intermediate"
tags:
  - python
  - exceptions
  - error-handling
  - debugging
concepts:
  - "try-except blocks"
  - "exception types"
  - "raising exceptions"
  - "custom exceptions"
prerequisites: [9, 11]
outcomes:
  - "Handle errors gracefully without crashing"
  - "Use specific exception types"
  - "Create custom exceptions for business logic"
---

# 🎯 Day 15: Exception Handling

> *"Good code doesn't just work—it fails gracefully."*

---

## The "Never-Coded" Bridge

**Every business has contingency plans:**

- What if a supplier fails to deliver? → Use backup supplier
- What if a customer payment declines? → Request alternate payment method
- What if a server goes down? → Failover to backup server

Your code needs the same resilience. Without exception handling:

```python
price = int(input("Enter price: "))  # User types "abc"
# CRASH! ValueError - entire program stops
```

With exception handling:

```python
try:
    price = int(input("Enter price: "))
except ValueError:
    print("Please enter a valid number")
    price = 0  # Use default or retry
```

Programs should handle unexpected situations without crashing.

---

## The Technical Deep Dive

### Basic Try-Except

```python
try:
    result = 10 / 0
except ZeroDivisionError:
    print("Cannot divide by zero!")
    result = 0
```

### Multiple Exception Types

```python
try:
    value = int(input("Enter a number: "))
    result = 100 / value
except ValueError:
    print("That's not a valid number")
except ZeroDivisionError:
    print("Cannot divide by zero")
except Exception as e:
    print(f"Unexpected error: {e}")
```

### The Full Try-Except-Else-Finally

```python
try:
    file = open("data.txt", "r")
    content = file.read()
except FileNotFoundError:
    print("File not found")
    content = ""
else:
    # Runs only if no exception occurred
    print(f"Read {len(content)} characters")
finally:
    # Always runs (cleanup)
    if "file" in locals():
        file.close()
```

### Common Exception Types

| Exception           | Cause                         |
| ------------------- | ----------------------------- |
| `ValueError`        | Wrong value type              |
| `TypeError`         | Wrong data type for operation |
| `KeyError`          | Dictionary key not found      |
| `IndexError`        | List index out of range       |
| `FileNotFoundError` | File doesn't exist            |
| `ZeroDivisionError` | Division by zero              |
| `AttributeError`    | Object lacks attribute        |
| `ImportError`       | Module import failed          |

### Raising Exceptions

```python
def withdraw(balance, amount):
    if amount <= 0:
        raise ValueError("Amount must be positive")
    if amount > balance:
        raise ValueError("Insufficient funds")
    return balance - amount


try:
    new_balance = withdraw(100, 150)
except ValueError as e:
    print(f"Transaction failed: {e}")
```

### Custom Exceptions

```python
class InsufficientFundsError(Exception):
    """Raised when account doesn't have enough funds."""

    def __init__(self, balance, amount):
        self.balance = balance
        self.amount = amount
        super().__init__(f"Cannot withdraw ${amount} from balance ${balance}")


def withdraw(balance, amount):
    if amount > balance:
        raise InsufficientFundsError(balance, amount)
    return balance - amount


try:
    withdraw(100, 150)
except InsufficientFundsError as e:
    print(f"Error: {e}")
    print(f"Balance: ${e.balance}, Attempted: ${e.amount}")
```

### Exception Chaining

```python
def process_data(data):
    try:
        return json.loads(data)
    except json.JSONDecodeError as e:
        raise ValueError("Invalid data format") from e
```

---

## Senior-Level Insights

### Context Managers (The Better Way)

```python
# Without context manager (needs manual cleanup)
try:
    f = open("file.txt")
    data = f.read()
finally:
    f.close()

# With context manager (automatic cleanup)
with open("file.txt") as f:
    data = f.read()
# File automatically closed, even if exception occurs
```

### Creating Context Managers

```python
from contextlib import contextmanager


@contextmanager
def database_connection(host):
    conn = connect(host)  # Setup
    try:
        yield conn  # Provide resource
    finally:
        conn.close()  # Cleanup


with database_connection("localhost") as db:
    db.query("SELECT * FROM users")
```

### Logging Exceptions

```python
import logging

logging.basicConfig(level=logging.ERROR)

try:
    risky_operation()
except Exception as e:
    logging.exception("Operation failed")
    # Logs full traceback
```

### Exception Best Practices

1. **Be specific**: Catch specific exceptions, not bare `except:`
2. **Don't suppress silently**: At minimum, log the error
3. **Fail fast**: Don't catch exceptions you can't handle
4. **Clean up resources**: Use `finally` or context managers
5. **Provide context**: Include helpful error messages

```python
# Bad
try:
    do_something()
except:
    pass  # Silent failure - debugging nightmare!

# Good
try:
    do_something()
except SpecificError as e:
    logger.error(f"Operation failed: {e}")
    raise  # Re-raise if you can't handle it
```

---

## Hands-on Lab

### Exercise 1: Safe Input Handler

```python
def get_positive_number(prompt, max_attempts=3):
    """Safely get a positive number from user input."""
    for attempt in range(max_attempts):
        try:
            value = float(input(prompt))
            if value <= 0:
                raise ValueError("Number must be positive")
            return value
        except ValueError as e:
            remaining = max_attempts - attempt - 1
            if remaining > 0:
                print(f"Invalid input: {e}. {remaining} attempts left.")
            else:
                print("Max attempts reached. Using default.")
                return None
    return None


# Usage
price = get_positive_number("Enter price: $")
if price:
    print(f"Price set to ${price:.2f}")
else:
    print("Using default price")
```

**Expected Output (simulated - assuming user enters "abc", then "-5", then gives up):**

```
Invalid input: could not convert string to float: 'abc'. 2 attempts left.
Invalid input: Number must be positive. 1 attempts left.
Max attempts reached. Using default.
Using default price
```

---

### Exercise 2: File Processing with Error Recovery

```python
def process_data_files(file_paths):
    """Process multiple files, continuing on errors."""
    results = []
    errors = []

    for path in file_paths:
        try:
            with open(path) as f:
                data = f.read()
                results.append({"file": path, "size": len(data)})
        except FileNotFoundError:
            errors.append({"file": path, "error": "File not found"})
        except PermissionError:
            errors.append({"file": path, "error": "Permission denied"})
        except Exception as e:
            errors.append({"file": path, "error": str(e)})

    return {
        "processed": len(results),
        "failed": len(errors),
        "results": results,
        "errors": errors,
    }


# Test
files = ["data1.txt", "data2.txt", "nonexistent.txt"]
report = process_data_files(files)
print(f"Processed: {report['processed']}, Failed: {report['failed']}")
```

**Expected Output (assuming data1.txt and data2.txt don't exist):**

```
Processed: 0, Failed: 3
```

---

### Exercise 3: Transaction System with Custom Exceptions

```python
class TransactionError(Exception):
    """Base exception for transactions."""

    pass


class InsufficientFundsError(TransactionError):
    pass


class InvalidAmountError(TransactionError):
    pass


class AccountLockedError(TransactionError):
    pass


class BankAccount:
    def __init__(self, balance=0, locked=False):
        self.balance = balance
        self.locked = locked

    def withdraw(self, amount):
        if self.locked:
            raise AccountLockedError("Account is locked")
        if amount <= 0:
            raise InvalidAmountError("Amount must be positive")
        if amount > self.balance:
            raise InsufficientFundsError(
                f"Cannot withdraw ${amount} from ${self.balance}"
            )
        self.balance -= amount
        return self.balance


# Usage
account = BankAccount(100)
try:
    account.withdraw(150)
except InsufficientFundsError as e:
    print(f"❌ {e}")
except AccountLockedError:
    print("❌ Contact support to unlock account")
except InvalidAmountError:
    print("❌ Please enter a valid amount")
```

**Expected Output:**

```
❌ Cannot withdraw $150 from $100
```

---

## Mastery Check

### Question 1: Exception Order

What's wrong here?

```python
try:
    value = int("abc")
except Exception:
    print("Error")
except ValueError:
    print("Bad value")
```

<details>
<summary>Click for Answer</summary>

`Exception` catches everything, so `ValueError` is never reached.

**Fix**: Put specific exceptions BEFORE general ones:

```python
except ValueError:
    print("Bad value")
except Exception:
    print("Other error")
```

</details>

---

### Question 2: Finally Behavior

What prints?

```python
def test():
    try:
        return "try"
    finally:
        print("finally")


result = test()
print(result)
```

<details>
<summary>Click for Answer</summary>

```
finally
try
```

`finally` always runs, even when returning. It executes before the return completes.

</details>

---

### Question 3: Exception Handling

How do you get the error message from an exception?

<details>
<summary>Click for Answer</summary>

```python
try:
    risky_code()
except ValueError as e:
    print(str(e))  # or just print(e)
```

</details>

---

### Question 4: Re-raising

How do you handle an error, log it, then let it propagate?

<details>
<summary>Click for Answer</summary>

```python
try:
    risky_code()
except SomeError as e:
    logger.error(f"Error occurred: {e}")
    raise  # Re-raises the same exception
```

</details>

---

### Question 5: Design Scenario

**Scenario**: Build a configuration loader that:

1. Tries to load from JSON file
2. Falls back to environment variables
3. Falls back to defaults
4. Logs all failures

<details>
<summary>Click for Answer</summary>

```python
import json
import os
import logging


def load_config(config_path, defaults=None):
    """Load config with multiple fallback levels."""
    defaults = defaults or {}
    config = defaults.copy()

    # Try JSON file
    try:
        with open(config_path) as f:
            file_config = json.load(f)
            config.update(file_config)
            logging.info(f"Loaded config from {config_path}")
            return config
    except FileNotFoundError:
        logging.warning(f"Config file {config_path} not found")
    except json.JSONDecodeError as e:
        logging.error(f"Invalid JSON in {config_path}: {e}")

    # Fallback: environment variables
    env_mappings = {"DB_HOST": "database_host", "DB_PORT": "database_port"}
    for env_var, config_key in env_mappings.items():
        if env_var in os.environ:
            config[config_key] = os.environ[env_var]
            logging.info(f"Loaded {config_key} from environment")

    if config == defaults:
        logging.warning("Using default configuration")

    return config
```

</details>

---

## Summary

Today you learned:

- ✅ `try-except` catches and handles errors
- ✅ Be specific with exception types
- ✅ `finally` always runs for cleanup
- ✅ `raise` creates or re-raises exceptions
- ✅ Custom exceptions clarify business logic

**Tomorrow**: We'll explore **file handling**—reading from and writing to files.

---

## Glossary

| Term | Definition |
|------|------------|
| Exception | An event that disrupts the normal flow of a program; in Python, exceptions are objects raised when an error occurs. |
| Traceback | The stack trace printed when an unhandled exception occurs, showing the call chain that led to the error. |
| `try/except` | A control structure that attempts risky code in `try` and catches specific errors in `except` blocks. |
| `finally` | A block that always executes after `try/except`, regardless of whether an exception was raised — used for cleanup. |
| `raise` | A keyword that explicitly throws an exception, either a new one or re-raises the current one. |
| Context Manager | An object (used with `with`) that handles setup and teardown automatically, e.g., file handles and database connections. |
| Custom Exception | A user-defined exception class that inherits from `Exception` or a subclass, giving business-meaningful error names. |
| Exception Chaining | Using `raise NewError from original_error` to preserve the original cause when re-raising as a different exception type. |
| Silent Failure | The anti-pattern of catching an exception with `except: pass`, hiding errors that should be logged or handled. |

## Task Block (Core / Stretch / Expert)

### Core

- Complete one end-to-end task that applies today’s main concept to realistic business data.
- Add basic validation (assertions or checks) for normal and edge-case inputs.

### Stretch

- Refactor for modularity: split logic into reusable helper functions or modules.
- Add one additional scenario that tests robustness under imperfect data.

### Expert

- Generalize your solution for reuse across datasets or teams.
- Document key tradeoffs and why your implementation is maintainable.

## Common Grading Rubric (applies every day)

| Criterion | 1 - Emerging | 2 - Developing | 3 - Proficient | 4 - Strong |
|---|---|---|---|---|
| Correctness | Major logic errors; results frequently wrong. | Core path works but multiple inaccuracies remain. | Outputs are correct for expected inputs and checked with examples. | Outputs are consistently correct, including tricky cases and clear verification. |
| Robustness | Breaks on minor input changes or missing values. | Handles some variation but fails on common edge cases. | Handles expected edge cases with explicit guards/validation. | Gracefully handles unexpected data, with informative failures and recovery paths. |
| Readability | Hard to follow; unclear naming/structure. | Partially clear but inconsistent style or organization. | Clear naming, structure, and comments/docstrings where needed. | Highly readable, well-organized, and easy for teammates to extend quickly. |
| Reuse | One-off script with duplicated logic. | Some modularization, limited reuse. | Reusable functions/classes with sensible boundaries. | Well-factored components with clean interfaces and minimal duplication. |
