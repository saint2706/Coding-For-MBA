# Day 4: Strings

## 🌉 The "Never-Coded" Bridge

Imagine receiving a spreadsheet with 10,000 customer records. The names are inconsistent: "john smith," "JANE DOE," "Bob  Wilson" (extra spaces), and "alice_johnson." You need to clean this data for your CRM system, which requires "First Last" format with proper capitalization. In Excel, you'd use a combination of `PROPER()`, `TRIM()`, `LEFT()`, `FIND()`, and pray nothing breaks. For 10,000 rows, this takes hours and is error-prone.

In Python, text processing is native and intuitive. `name.strip().title()` removes extra spaces and capitalizes properly. You write the logic once and apply it to millions of records in seconds. Text data—customer names, product descriptions, email addresses, SKU codes—makes up the majority of business data. Mastering string manipulation means you can clean, validate, transform, and extract insights from the messy real-world data that powers every business decision.

Strings aren't just words; they're structured data. An email address contains a username and domain. A product SKU encodes category, manufacturer, and variant. Learning to parse, validate, and transform strings turns you from a passive data consumer into someone who can extract signal from noise at scale.

## 🔬 The Technical Deep Dive

In Python, strings are immutable sequences of Unicode characters, enclosed in single (`'`), double (`"`), or triple quotes (`'''` or `"""`). Immutability means once created, a string cannot be changed—operations like `.upper()` return a new string rather than modifying the original:

```python
name = "Alice"
upper_name = name.upper()  # Returns "ALICE"
print(name)  # Still "Alice" - original unchanged
```

**String indexing** uses zero-based indices. For `text = "Python"`, `text[0]` is `"P"` and `text[-1]` is `"n"` (negative indices count from the end). **Slicing** extracts substrings using `[start:end]` syntax (end is exclusive):

```python
sku = "PROD-2024-XL-RED"
category = sku[0:4]    # "PROD"
year = sku[5:9]        # "2024"
size = sku[10:12]      # "XL"
color = sku[13:]       # "RED" (omit end for "to the end")
```

**String methods** are functions called on string objects:
- `.lower()`, `.upper()`, `.title()`: Case conversion
- `.strip()`, `.lstrip()`, `.rstrip()`: Remove whitespace
- `.replace(old, new)`: Substitute substrings
- `.split(delimiter)`: Break string into list of parts
- `.join(iterable)`: Combine list into string with separator
- `.startswith(prefix)`, `.endswith(suffix)`: Boolean checks
- `.find(substring)`: Returns index of first occurrence (or -1 if not found)

Example of method chaining:
```python
email = "  USER@EXAMPLE.COM  "
clean_email = email.strip().lower()  # "user@example.com"
```

**F-strings** (formatted string literals) embed expressions in `{}`:
```python
name = "Alice"
salary = 75000
print(f"{name} earns ${salary:,} annually")
# Output: Alice earns $75,000 annually
```

Format specifiers control presentation: `:,` adds comma separators, `:.2f` formats floats to 2 decimals, `:>10` right-aligns in 10 characters.

**String concatenation** uses `+` but creates new string objects each time (inefficient in loops). For building strings from many parts, use `.join()`:
```python
# Inefficient
result = ""
for word in words:
    result += word + " "  # Creates new string each iteration

# Efficient
result = " ".join(words)  # Single concatenation operation
```

## 🏗️ Senior-Level Insights

In production systems handling millions of strings, performance and memory usage matter. String immutability means every modification creates a new object. In tight loops, this causes memory churn. The `io.StringIO` class provides a mutable buffer for efficient string building. For truly performance-critical text processing, libraries like `regex` (enhanced regular expressions) or `re` (standard library) provide pattern-matching capabilities that dwarf simple string methods.

Unicode handling is critical for international applications. Python 3 strings are Unicode by default, supporting characters from any language. However, encoding/decoding issues arise when reading files or receiving data from APIs. Understanding the difference between strings (text) and bytes (encoded data) prevents the classic `UnicodeDecodeError`. Always specify encoding explicitly: `open('file.txt', 'r', encoding='utf-8')`.

Security vulnerabilities arise from improper string handling. SQL injection occurs when user input is concatenated into SQL queries. Consider:
```python
# DANGEROUS - SQL injection vulnerability
query = f"SELECT * FROM users WHERE username = '{user_input}'"
```
If `user_input` is `"admin' OR '1'='1"`, the query becomes `SELECT * FROM users WHERE username = 'admin' OR '1'='1'` (always true, exposing all users). Always use parameterized queries or ORMs that handle escaping.

Similarly, validating string inputs prevents attacks. Email validation, phone number formatting, and SKU verification should use whitelists (allow only valid patterns) rather than blacklists (block known bad patterns). Regular expressions provide robust validation:
```python
import re
email_pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
is_valid = re.match(email_pattern, email_input) is not None
```

Architectural decisions around string handling affect system design. Storing raw, unprocessed strings in databases leads to inconsistent data. Normalize at ingestion: trim whitespace, standardize case, validate format. ETL (Extract, Transform, Load) pipelines perform these operations once, ensuring downstream systems receive clean data. The principle: validate at boundaries, trust internally.

## 💻 Hands-on Lab

### Exercise 1: Customer Data Standardization

**Problem:** Clean and standardize messy customer name and email data for CRM import.

**Solution Approach:**
1. Use string methods to remove whitespace and standardize case
2. Split full names into first and last names
3. Validate and format email addresses

```python
# Messy customer data from various sources
customers = [
    {"name": "  john smith  ", "email": "JOHN.SMITH@EXAMPLE.COM"},
    {"name": "jane_doe", "email": "  jane@test.com  "},
    {"name": "BOB WILSON", "email": "bob.wilson@company.org"},
]

print("CUSTOMER DATA STANDARDIZATION")
print("=" * 60)

for customer in customers:
    # Clean and format name
    raw_name = customer["name"]
    clean_name = raw_name.strip().replace("_", " ").title()
    
    # Split into first and last name
    name_parts = clean_name.split()
    first_name = name_parts[0] if len(name_parts) > 0 else ""
    last_name = name_parts[-1] if len(name_parts) > 1 else ""
    
    # Clean and format email
    raw_email = customer["email"]
    clean_email = raw_email.strip().lower()
    
    # Extract email components
    if "@" in clean_email:
        username, domain = clean_email.split("@")
        email_valid = True
    else:
        username, domain = "", ""
        email_valid = False
    
    # Display results
    print(f"\nOriginal Name: '{raw_name}'")
    print(f"Standardized: {clean_name}")
    print(f"First Name: {first_name}")
    print(f"Last Name: {last_name}")
    print(f"Original Email: '{raw_email}'")
    print(f"Standardized: {clean_email}")
    print(f"Email Valid: {email_valid}")
    if email_valid:
        print(f"  Username: {username}")
        print(f"  Domain: {domain}")
```

This demonstrates practical string cleaning, splitting, validation, and formatting for business data processing.

### Exercise 2: Product SKU Parser and Validator

**Problem:** Parse structured product SKUs to extract category, year, and attributes, then validate format compliance.

**Solution Approach:**
1. Use slicing to extract SKU components
2. Validate format using string methods
3. Generate reports on SKU compliance

```python
# Product SKUs following format: CAT-YYYY-SIZE-COLOR
products = [
    "ELEC-2024-LG-BLK",
    "APRL-2023-MD-BLU",
    "HOME-2024-SM-WHT",
    "INVALID_SKU",
    "ELEC-2024-XL",  # Missing color
]

print("PRODUCT SKU ANALYSIS")
print("=" * 60)

valid_categories = ["ELEC", "APRL", "HOME", "FOOD"]
valid_sizes = ["SM", "MD", "LG", "XL"]

for sku in products:
    print(f"\nSKU: {sku}")
    
    # Check if SKU uses correct delimiter
    if "-" not in sku:
        print("  Status: INVALID (Wrong format - no hyphens)")
        continue
    
    # Split SKU into components
    parts = sku.split("-")
    
    # Validate number of components
    if len(parts) != 4:
        print(f"  Status: INVALID (Expected 4 parts, found {len(parts)})")
        continue
    
    # Extract components
    category = parts[0]
    year = parts[1]
    size = parts[2]
    color = parts[3]
    
    # Validate each component
    errors = []
    
    if category not in valid_categories:
        errors.append(f"Invalid category '{category}'")
    
    if not (year.isdigit() and len(year) == 4):
        errors.append(f"Invalid year '{year}'")
    
    if size not in valid_sizes:
        errors.append(f"Invalid size '{size}'")
    
    if len(color) != 3:
        errors.append(f"Invalid color code '{color}' (must be 3 chars)")
    
    # Display validation results
    if errors:
        print("  Status: INVALID")
        for error in errors:
            print(f"    - {error}")
    else:
        print("  Status: VALID")
        print(f"  Category: {category}")
        print(f"  Year: {year}")
        print(f"  Size: {size}")
        print(f"  Color: {color}")
        
        # Generate human-readable description
        size_map = {"SM": "Small", "MD": "Medium", "LG": "Large", "XL": "Extra Large"}
        print(f"  Description: {size_map[size]} {category} product ({year})")
```

This exercise showcases slicing, splitting, validation logic, and practical SKU parsing for inventory systems.

### Exercise 3: Automated Email Generation System

**Problem:** Generate personalized marketing emails from a template using customer data and string formatting.

**Solution Approach:**
1. Create email template with placeholders
2. Use f-strings and string methods to personalize
3. Format content for professional business communication

```python
# Customer data
customers = [
    {"name": "Alice Johnson", "company": "TechCorp", "spend": 125000, "tier": "platinum"},
    {"name": "Bob Smith", "company": "DataVentures", "spend": 45000, "tier": "gold"},
    {"name": "Carol White", "company": "CloudStart", "spend": 15000, "tier": "silver"},
]

# Email templates by tier
templates = {
    "platinum": """
Dear {name},

As a PLATINUM member of our partnership program, we want to express our 
gratitude for your continued trust in our services. Your company, {company}, 
has been instrumental in our success.

This year, your investment of ${spend:,} has positioned you for exclusive 
benefits including:
- Dedicated account manager
- 24/7 priority support
- 20% discount on all new services
- Invitation to our annual executive summit

We look forward to serving you in the coming year.

Best regards,
Partnership Team
""",
    "gold": """
Dear {name},

Thank you for being a valued GOLD partner. {company} has invested ${spend:,} 
with us, and we're committed to delivering exceptional value.

Your benefits include:
- Priority support
- 10% discount on services
- Quarterly business reviews

We appreciate your partnership.

Best regards,
Account Team
""",
    "silver": """
Dear {name},

We appreciate {company}'s partnership. Your ${spend:,} investment qualifies 
you for our SILVER benefits:
- Standard support
- 5% discount on renewals

Thank you for choosing us.

Regards,
Customer Success
"""
}

print("AUTOMATED EMAIL GENERATION")
print("=" * 70)

for customer in customers:
    # Extract customer info
    name = customer["name"]
    company = customer["company"]
    spend = customer["spend"]
    tier = customer["tier"]
    
    # Get appropriate template
    template = templates[tier]
    
    # Generate personalized email
    email_body = template.format(
        name=name,
        company=company,
        spend=spend
    )
    
    # Generate subject line
    tier_upper = tier.upper()
    subject = f"{tier_upper} Partner Update - {company}"
    
    # Display email
    print(f"\n{'=' * 70}")
    print(f"TO: {name} <{name.lower().replace(' ', '.')}@{company.lower()}.com>")
    print(f"SUBJECT: {subject}")
    print(f"{'=' * 70}")
    print(email_body)

# Generate summary
print(f"\n{'=' * 70}")
print("EMAIL CAMPAIGN SUMMARY")
print(f"{'=' * 70}")
print(f"Total emails generated: {len(customers)}")

# Count by tier
from collections import Counter
tier_counts = Counter(c["tier"] for c in customers)
for tier, count in sorted(tier_counts.items()):
    print(f"{tier.title()} tier: {count} emails")
```

This advanced exercise demonstrates template-based string formatting, multi-level data processing, and automated business communication generation.

## ✅ Mastery Check

1. **Basic Implementation:** Given the string `product_code = "  LAPTOP-DELL-XPS15  "`, write code to: (a) remove whitespace, (b) convert to lowercase, (c) replace hyphens with underscores. What is the final result?

2. **Applied Understanding:** You receive customer emails in various formats: "JOHN@EXAMPLE.COM", "  jane@test.com  ", "bob.wilson@COMPANY.ORG". Write a function `standardize_email(email)` that returns the email in lowercase with whitespace removed. How would you validate that the email contains an "@" symbol?

3. **Debugging Challenge:** A developer wrote this code to extract the first name from a full name:
   ```python
   full_name = "Alice Johnson"
   first_name = full_name[0:5]
   print(first_name)
   ```
   This works for "Alice Johnson" but fails for "Bob Smith" (returns "Bob S"). Fix the code to work for any name by using the `.split()` method instead of slicing.

4. **Design Scenario:** You're building a customer support system that needs to generate ticket IDs in the format: `DEPT-YYYYMMDD-NNNN` where DEPT is the department code (4 chars), YYYYMMDD is today's date, and NNNN is a zero-padded sequence number. For example: `TECH-20240315-0042`. Design a function that takes department and sequence number as inputs and generates the ticket ID. What string methods and formatting will you use?

5. **Synthesis Challenge:** Explain the difference between these three approaches to building a comma-separated list from 10,000 customer IDs:
   ```python
   # Approach 1
   result = ""
   for id in customer_ids:
       result = result + id + ","
   
   # Approach 2
   result = ""
   for id in customer_ids:
       result += id + ","
   
   # Approach 3
   result = ",".join(customer_ids)
   ```
   Which is most performant and why? How does string immutability affect performance? At what scale does this matter in production systems? If you're processing 1 million records per hour, how much performance improvement could the optimal approach provide?
