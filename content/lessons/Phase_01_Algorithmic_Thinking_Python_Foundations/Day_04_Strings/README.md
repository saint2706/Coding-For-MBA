---
day: 4
title: "Strings"
phase: 1
phaseTitle: "Algorithmic Thinking & Python Foundations"
slug: "strings"
duration: 55
difficulty: "beginner"
tags:
  - python
  - strings
  - text-manipulation
  - formatting
concepts:
  - "string creation and concatenation"
  - "string methods"
  - "string formatting (f-strings)"
  - "string indexing and slicing"
prerequisites: [1, 2, 3]
outcomes:
  - "Create and manipulate text data"
  - "Use string methods for data cleaning"
  - "Format strings for professional output"
---

# 🎯 Day 4: Strings

> *"In business, everything becomes text eventually—master strings, master communication."*

---

## The "Never-Coded" Bridge

**Think about the data you handle every day:**

- Customer names: "Sarah Chen"
- Email addresses: "<sarah@company.com>"
- Product descriptions: "Premium wireless headphones with 24-hour battery"
- Status updates: "Order shipped - ETA 3 days"

All of this is **text data**, and in Python, we call text a **string**—think of it as a "string of characters" linked together like beads on a necklace.

Strings are everywhere in business:

- **Reports**: Generating text summaries
- **Emails**: Personalizing bulk communications
- **Data Cleaning**: Fixing inconsistent formats ("NEW YORK" vs "new york")
- **Parsing**: Extracting information from text files

---

## The Technical Deep Dive

### Creating Strings

Strings can use single or double quotes:

```python
name = "Alice Johnson"
company = 'TechCorp Inc.'
message = "She said, 'Hello!'"  # Mixing quotes for apostrophes

# Multi-line strings with triple quotes
email_template = """
Dear {customer},

Thank you for your order!

Best regards,
The Team
"""
```

### String Concatenation

Join strings together:

```python
first_name = "Jane"
last_name = "Smith"

# Method 1: Plus operator
full_name = first_name + " " + last_name  # "Jane Smith"

# Method 2: F-strings (recommended)
greeting = f"Hello, {first_name} {last_name}!"

# Method 3: .join() for lists
parts = ["Jane", "Marie", "Smith"]
full_name = " ".join(parts)  # "Jane Marie Smith"
```

### F-Strings (Formatured String Literals)

The modern, preferred way to format strings (Python 3.6+):

```python
product = "Laptop Pro"
price = 1299.99
quantity = 3

# Embed variables directly
message = f"You ordered {quantity} x {product} at ${price} each"

# Embed expressions
total = f"Total: ${price * quantity:.2f}"  # Total: $3899.97

# Formatting options
percentage = 0.156
print(f"Growth: {percentage:.1%}")  # Growth: 15.6%

large_number = 1234567
print(f"Revenue: ${large_number:,}")  # Revenue: $1,234,567
```

### String Indexing and Slicing

Access individual characters or substrings:

```python
text = "PYTHON"
#       012345   (index positions)

# Indexing
print(text[0])    # P (first character)
print(text[-1])   # N (last character)

# Slicing: [start:end] (end is exclusive)
print(text[0:3])  # PYT
print(text[3:])   # HON (from index 3 to end)
print(text[:3])   # PYT (from start to index 3)
print(text[::2])  # PTO (every 2nd character)
print(text[::-1]) # NOHTYP (reversed)
```

### Essential String Methods

| Method          | Purpose           | Example                                 |
| --------------- | ----------------- | --------------------------------------- |
| `.upper()`      | Uppercase         | `"hello".upper()` → `"HELLO"`           |
| `.lower()`      | Lowercase         | `"HELLO".lower()` → `"hello"`           |
| `.title()`      | Title Case        | `"jane doe".title()` → `"Jane Doe"`     |
| `.strip()`      | Remove whitespace | `"  hi  ".strip()` → `"hi"`             |
| `.replace()`    | Replace text      | `"a-b-c".replace("-", "/")` → `"a/b/c"` |
| `.split()`      | Split into list   | `"a,b,c".split(",")` → `["a","b","c"]`  |
| `.startswith()` | Check prefix      | `"hello".startswith("he")` → `True`     |
| `.endswith()`   | Check suffix      | `"file.pdf".endswith(".pdf")` → `True`  |
| `.find()`       | Find position     | `"hello".find("l")` → `2`               |
| `.count()`      | Count occurrences | `"hello".count("l")` → `2`              |

```python
# Business example: Clean customer input
raw_email = "  John.Doe@Email.COM  "
clean_email = raw_email.strip().lower()
print(clean_email)  # "john.doe@email.com"

# Parse CSV-like data
row = "Apple,100,0.99"
product, quantity, price = row.split(",")
```

### String Validation

```python
text = "ABC123"

text.isalpha()     # False (has numbers)
text.isdigit()     # False (has letters)
text.isalnum()     # True (letters and numbers)
text.isupper()     # False (has numbers)
"12345".isdigit()  # True
"hello".islower()  # True
```

---

## Senior-Level Insights

### Strings Are Immutable

You cannot change a string in place—you create new strings:

```python
name = "John"
# name[0] = "J"  # ERROR! Strings don't support item assignment

# Instead, create a new string
name = "J" + name[1:]  # Create new string "John"
```

**Why this matters**: String operations create new objects in memory. For massive string manipulation, consider using `list` or `io.StringIO` for efficiency.

### Regular Expressions for Complex Patterns

When simple methods aren't enough:

```python
import re

text = "Contact us at support@company.com or sales@company.com"
emails = re.findall(r'\b[\w.-]+@[\w.-]+\.\w+\b', text)
print(emails)  # ['support@company.com', 'sales@company.com']
```

### Unicode and Encoding (Real-World Headaches)

```python
# Python 3 strings are Unicode by default
name = "José García"
emoji = "Sales 📈 are up!"

# When reading/writing files, specify encoding
with open("data.txt", "r", encoding="utf-8") as f:
    content = f.read()
```

### String Interning (Performance Deep-Cut)

Python caches small strings for performance:

```python
a = "hello"
b = "hello"
print(a is b)  # True - same object in memory

c = "hello world"
d = "hello world"
print(c is d)  # Often False - not interned
```

---

## Hands-on Lab

### Exercise 1: Email Generator

**Goal**: Generate personalized email addresses from employee data.

```python
# Employee data
first_name = "Sarah"
last_name = "O'Connor"
department = "Marketing"

# Clean and format
first_clean = first_name.lower().strip()
last_clean = last_name.lower().replace("'", "").strip()

# Generate email
email = f"{first_clean}.{last_clean}@company.com"
display = f"{first_name} {last_name} ({department})"

print("Email:", email)        # sarah.oconnor@company.com
print("Display:", display)    # Sarah O'Connor (Marketing)
```

---

### Exercise 2: Invoice Line Formatter

**Goal**: Format product lines for an invoice.

```python
# Product data
products = [
    ("Widget Pro", 3, 29.99),
    ("Gadget Max", 1, 149.50),
    ("Cable Basic", 10, 4.99)
]

print("=" * 50)
print(f"{'Product':<20} {'Qty':>5} {'Price':>10} {'Total':>10}")
print("=" * 50)

grand_total = 0
for name, qty, price in products:
    total = qty * price
    grand_total += total
    print(f"{name:<20} {qty:>5} ${price:>9.2f} ${total:>9.2f}")

print("=" * 50)
print(f"{'GRAND TOTAL':>37} ${grand_total:>9.2f}")
```

**Output:**

```text
==================================================
Product                Qty      Price      Total
==================================================
Widget Pro               3     $29.99     $89.97
Gadget Max               1    $149.50    $149.50
Cable Basic             10      $4.99     $49.90
==================================================
                        GRAND TOTAL    $289.37
```

---

### Exercise 3: Data Cleaning Pipeline

**Goal**: Clean messy customer data.

```python
# Messy data
raw_data = "   JOHN DOE , john.doe@email.com , 555-123-4567   "

# Step 1: Remove outer whitespace
cleaned = raw_data.strip()

# Step 2: Split into fields
parts = cleaned.split(",")
name = parts[0].strip().title()
email = parts[1].strip().lower()
phone = parts[2].strip().replace("-", "")

# Step 3: Validate and display
print(f"Name: {name}")
print(f"Email: {email}")
print(f"Phone: {phone}")
print(f"Valid email: {email.count('@') == 1}")
print(f"Valid phone: {phone.isdigit() and len(phone) == 10}")
```

---

## Mastery Check

### Question 1: String Indexing

What does this print?

```python
text = "Business"
print(text[2:5])
```

<details>
<summary>Click for Answer</summary>

**Answer: `"sin"`**

- Index 2: 's'
- Index 3: 'i'
- Index 4: 'n'
- Index 5 is excluded

</details>

---

### Question 2: Method Chaining

What's the output?

```python
data = "  HELLO, World!  "
result = data.strip().lower().replace("!", "?")
print(result)
```

<details>
<summary>Click for Answer</summary>

**Answer: `"hello, world?"`**

1. `.strip()` → `"HELLO, World!"`
2. `.lower()` → `"hello, world!"`
3. `.replace("!", "?")` → `"hello, world?"`

</details>

---

### Question 3: F-String Formatting

Format a price of 1234567.891 to show as "$1,234,567.89"

<details>
<summary>Click for Answer</summary>

```python
price = 1234567.891
print(f"${price:,.2f}")  # $1,234,567.89
```

- `,` adds thousand separators
- `.2f` limits to 2 decimal places

</details>

---

### Question 4: String Validation

Write code to check if a username is valid (only letters and numbers, 3-15 characters):

<details>
<summary>Click for Answer</summary>

```python
username = "User123"

is_valid = (
    username.isalnum() and
    3 <= len(username) <= 15
)

print(f"Username '{username}' is valid: {is_valid}")
```

</details>

---

### Question 5: Design Scenario

**Scenario**: Build a function that generates a URL-friendly "slug" from article titles. Rules:

- Lowercase
- Replace spaces with hyphens
- Remove special characters
- Maximum 50 characters

Input: "Top 10 Tips for Python Developers! (2024 Edition)"
Expected: "top-10-tips-for-python-developers-2024-edition"

<details>
<summary>Click for Answer</summary>

```python
import re

def create_slug(title, max_length=50):
    # Lowercase
    slug = title.lower()
    
    # Replace spaces with hyphens
    slug = slug.replace(" ", "-")
    
    # Remove special characters (keep letters, numbers, hyphens)
    slug = re.sub(r'[^a-z0-9-]', '', slug)
    
    # Remove multiple consecutive hyphens
    slug = re.sub(r'-+', '-', slug)
    
    # Trim to max length
    slug = slug[:max_length].rstrip('-')
    
    return slug

title = "Top 10 Tips for Python Developers! (2024 Edition)"
print(create_slug(title))
# Output: top-10-tips-for-python-developers-2024-edition
```

**Production Considerations**:

- Handle Unicode characters (é → e)
- Check for duplicate slugs in database
- Consider URL-encoding requirements

</details>

---

## Summary

Today you learned:

- ✅ Strings hold text data using quotes
- ✅ F-strings provide powerful, readable formatting
- ✅ Indexing and slicing extract parts of strings
- ✅ String methods clean and transform text
- ✅ Strings are immutable—operations create new strings

**Tomorrow**: We'll explore **lists**—collections that let you store and manipulate multiple values at once.

---

## Recurring Mini-Scenario Challenge: Retail Pulse Sales Tracker (Day 4)

Keep extending `sales_tracker_phase1.py`; do not restart.

**Challenge**

- Parse a raw text code like `"KIOSK-NYC-2024-07-15"` using string methods/splitting.
- Extract and store `channel`, `city_code`, and date parts in clearly named variables.
- Generate a cleaned label in title case for reporting, such as `"Kiosk | Nyc | 2024-07-15"`.

**Measurable output**

- Print one parsed-label line showing extracted city and normalized date so correctness is visible immediately.
