---
day: 17
title: "Regular Expressions"
phase: 2
phaseTitle: "Functions, Modularity & Data Wrangling"
slug: "regular-expressions"
duration: 55
difficulty: "intermediate"
tags:
  - python
  - regex
  - pattern-matching
  - text-processing
concepts:
  - "regex syntax"
  - "match, search, findall"
  - "groups and captures"
  - "substitution"
prerequisites: [4, 16]
outcomes:
  - "Write patterns to match text"
  - "Extract data using regex groups"
  - "Validate and clean data with patterns"
---

# 🎯 Day 17: Regular Expressions

> *"Regular expressions: write a pattern once, match thousands of variations."*

---

## The "Never-Coded" Bridge

**Imagine you're reviewing 10,000 customer records looking for:**

- Invalid email addresses
- Phone numbers in any format
- Dates written inconsistently

Manually checking each? Impossible. But with regex, you write ONE pattern that matches ALL variations:

```python
import re

emails = ["alice@email.com", "invalid.email", "bob@company.org"]

pattern = r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
valid = [e for e in emails if re.match(pattern, e)]
# ['alice@email.com', 'bob@company.org']
```

---

## The Technical Deep Dive

### Basic Pattern Matching

```python
import re

text = "The quick brown fox jumps over the lazy dog"

# match - checks start of string
re.match(r"The", text)  # Matches "The"
re.match(r"quick", text)  # None (not at start)

# search - finds first match anywhere
re.search(r"quick", text)  # Matches "quick"

# findall - finds all matches
re.findall(r"o", text)  # ['o', 'o', 'o', 'o']
```

### Basic Syntax

| Pattern          | Matches                           |
| ---------------- | --------------------------------- |
| `.`              | Any character except newline      |
| `\d`             | Any digit (0-9)                   |
| `\w`             | Word character (a-z, A-Z, 0-9, _) |
| `\s`             | Whitespace                        |
| `\D`, `\W`, `\S` | Opposites of above                |
| `^`              | Start of string                   |
| `$`              | End of string                     |

### Quantifiers

| Pattern | Matches         |
| ------- | --------------- |
| `*`     | 0 or more       |
| `+`     | 1 or more       |
| `?`     | 0 or 1          |
| `{n}`   | Exactly n       |
| `{n,}`  | n or more       |
| `{n,m}` | Between n and m |

```python
# Examples
re.findall(r"\d+", "abc 123 def 456")  # ['123', '456']
re.findall(r"\d{3}", "abc 12 345 6789")  # ['345', '678']
```

### Character Classes

```python
# [abc] - matches a, b, or c
re.findall(r"[aeiou]", "hello")  # ['e', 'o']

# [a-z] - range
re.findall(r"[a-z]+", "Hello World!")  # ['ello', 'orld']

# [^abc] - NOT a, b, or c
re.findall(r"[^0-9]+", "abc123def")  # ['abc', 'def']
```

### Groups and Captures

```python
text = "Contact: john@example.com, support@company.org"

# Capturing groups with ()
pattern = r"(\w+)@(\w+)\.(\w+)"
matches = re.findall(pattern, text)
# [('john', 'example', 'com'), ('support', 'company', 'org')]

# Named groups
pattern = r"(?P<user>\w+)@(?P<domain>\w+)\.(?P<tld>\w+)"
match = re.search(pattern, text)
print(match.group("user"))  # "john"
print(match.group("domain"))  # "example"
```

### Substitution

```python
text = "Call 123-456-7890 or 987-654-3210"

# Replace all phone numbers
cleaned = re.sub(r"\d{3}-\d{3}-\d{4}", "[REDACTED]", text)
# "Call [REDACTED] or [REDACTED]"

# Replace with captured groups
formatted = re.sub(r"(\d{3})-(\d{3})-(\d{4})", r"(\1) \2-\3", text)
# "Call (123) 456-7890 or (987) 654-3210"
```

### Common Patterns

```python
# Email (simplified)
email = r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"

# Phone number (US)
phone = r"\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}"

# Date (MM/DD/YYYY)
date = r"\d{2}/\d{2}/\d{4}"

# URL
url = r"https?://[^\s]+"

# IP Address
ip = r"\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}"
```

---

## Senior-Level Insights

### Compile for Performance

```python
# Compile once, use many times
pattern = re.compile(r"\d{3}-\d{3}-\d{4}")

for text in thousands_of_texts:
    matches = pattern.findall(text)
```

### Non-Greedy Matching

```python
text = "<div>content</div><div>more</div>"

# Greedy (default) - matches as much as possible
re.findall(r"<div>.*</div>", text)
# ['<div>content</div><div>more</div>']

# Non-greedy - matches as little as possible
re.findall(r"<div>.*?</div>", text)
# ['<div>content</div>', '<div>more</div>']
```

### Flags

```python
# Case insensitive
re.findall(r"python", "Python PYTHON python", re.IGNORECASE)

# Multiline (^ and $ match line starts/ends)
re.findall(r"^line", "line1\nline2", re.MULTILINE)

# Verbose mode for readable patterns
pattern = re.compile(
    r"""
    (\d{3})     # Area code
    [-.\s]?     # Optional separator
    (\d{3})     # First 3 digits
    [-.\s]?     # Optional separator
    (\d{4})     # Last 4 digits
""",
    re.VERBOSE,
)
```

### Lookahead and Lookbehind

```python
# Lookahead: match only if followed by pattern
re.findall(r"\d+(?= dollars)", "100 dollars and 50 cents")
# ['100']

# Lookbehind: match only if preceded by pattern
re.findall(r"(?<=\$)\d+", "Price: $100")
# ['100']
```

---

## Hands-on Lab

### Exercise 1: Data Extractor

```python
import re

log_entry = """
[2024-01-15 10:30:45] ERROR User login failed for alice@example.com
[2024-01-15 10:31:02] INFO  User bob@company.org authenticated successfully
[2024-01-15 10:32:15] ERROR Database timeout for query id: 12345
"""

# Extract timestamps
timestamps = re.findall(r"\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\]", log_entry)
print("Timestamps:", timestamps)

# Extract log levels
levels = re.findall(r"\] (ERROR|INFO|WARNING)", log_entry)
print("Levels:", levels)

# Extract emails
emails = re.findall(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", log_entry)
print("Emails:", emails)

# Parse full entries
pattern = r"\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\] (\w+)\s+(.+)"
for match in re.finditer(pattern, log_entry):
    print(
        f"Time: {match.group(1)}, Level: {match.group(2)}, Message: {match.group(3)[:30]}..."
    )
```

---

### Exercise 2: Data Validator

```python
import re


def validate_email(email):
    pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    return bool(re.match(pattern, email))


def validate_phone(phone):
    pattern = r"^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$"
    return bool(re.match(pattern, phone))


def validate_password(password):
    """Must have: 8+ chars, uppercase, lowercase, digit."""
    if len(password) < 8:
        return False, "Too short"
    if not re.search(r"[A-Z]", password):
        return False, "Needs uppercase"
    if not re.search(r"[a-z]", password):
        return False, "Needs lowercase"
    if not re.search(r"\d", password):
        return False, "Needs digit"
    return True, "Valid"


# Test
test_data = [
    ("alice@email.com", "555-123-4567", "Password123"),
    ("invalid-email", "12345", "weak"),
]

for email, phone, password in test_data:
    print(f"\nEmail '{email}': {validate_email(email)}")
    print(f"Phone '{phone}': {validate_phone(phone)}")
    print(f"Password: {validate_password(password)}")
```

---

### Exercise 3: Text Cleaner

```python
import re


def clean_text(text):
    """Comprehensive text cleaning."""
    # Remove HTML tags
    text = re.sub(r"<[^>]+>", "", text)

    # Normalize whitespace
    text = re.sub(r"\s+", " ", text)

    # Remove special characters (keep alphanumeric and basic punctuation)
    text = re.sub(r"[^\w\s.,!?'-]", "", text)

    # Fix multiple punctuation
    text = re.sub(r"([.!?]){2,}", r"\1", text)

    return text.strip()


def extract_urls(text):
    pattern = r"https?://[^\s<>\"']+"
    return re.findall(pattern, text)


def mask_sensitive(text):
    """Mask credit card and SSN numbers."""
    # Credit card: XXXX-XXXX-XXXX-1234
    text = re.sub(
        r"\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?(\d{4})", r"XXXX-XXXX-XXXX-\1", text
    )

    # SSN: XXX-XX-1234
    text = re.sub(r"\d{3}-\d{2}-(\d{4})", r"XXX-XX-\1", text)

    return text


# Test
sample = """
<p>Contact us at https://example.com or call 555-123-4567.</p>
Credit card: 1234-5678-9012-3456, SSN: 123-45-6789
Extra    spaces   and   stuff!!!
"""

print("Cleaned:", clean_text(sample))
print("URLs:", extract_urls(sample))
print("Masked:", mask_sensitive(sample))
```

---

## Mastery Check

### Question 1: Pattern Meaning

What does `\d{2,4}` match?

<details>
<summary>Click for Answer</summary>

2 to 4 consecutive digits.

- `12` ✓
- `123` ✓
- `1234` ✓
- `1` ✗ (too few)
- `12345` partially matches `1234`

</details>

---

### Question 2: Greedy vs Non-Greedy

What's the difference between `.*` and `.*?`?

<details>
<summary>Click for Answer</summary>

- `.*` is **greedy**: matches as much as possible
- `.*?` is **non-greedy**: matches as little as possible

```python
text = "'a' and 'b'"
re.findall(r"'.*'", text)  # ["'a' and 'b'"]
re.findall(r"'.*?'", text)  # ["'a'", "'b'"]
```

</details>

---

### Question 3: Group Access

How do you access the first captured group?

<details>
<summary>Click for Answer</summary>

```python
match = re.search(r"(\d+)-(\d+)", "123-456")
match.group(0)  # Full match: "123-456"
match.group(1)  # First group: "123"
match.group(2)  # Second group: "456"
```

</details>

---

### Question 4: Email Extraction

Write a pattern to extract domain from an email:

<details>
<summary>Click for Answer</summary>

```python
email = "user@example.com"
match = re.search(r"@([a-zA-Z0-9.-]+)", email)
domain = match.group(1)  # "example.com"
```

</details>

---

### Question 5: Design Scenario

**Scenario**: Parse log files to extract:

- IP addresses
- HTTP status codes
- Request URLs

From: `192.168.1.1 - - [15/Jan/2024:10:30:45] "GET /api/users HTTP/1.1" 200 1234`

<details>
<summary>Click for Answer</summary>

```python
import re

log_line = '192.168.1.1 - - [15/Jan/2024:10:30:45] "GET /api/users HTTP/1.1" 200 1234'

pattern = r'(\d+\.\d+\.\d+\.\d+).*"(\w+) ([^\s]+).*" (\d+)'

match = re.search(pattern, log_line)
if match:
    ip = match.group(1)  # "192.168.1.1"
    method = match.group(2)  # "GET"
    url = match.group(3)  # "/api/users"
    status = match.group(4)  # "200"
    print(f"IP: {ip}, Method: {method}, URL: {url}, Status: {status}")
```

</details>

---

## Summary

Today you learned:

- ✅ Basic pattern syntax (`\d`, `\w`, `\s`, quantifiers)
- ✅ `match`, `search`, `findall` for different use cases
- ✅ Capturing groups for extracting data
- ✅ `sub` for search and replace
- ✅ Compile patterns for performance

**Tomorrow**: We'll explore **Classes and Objects**—the foundation of object-oriented programming.

---

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
