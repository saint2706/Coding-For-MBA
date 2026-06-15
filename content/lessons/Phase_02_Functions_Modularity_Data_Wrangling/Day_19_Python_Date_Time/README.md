---
day: 19
title: "Date and Time"
phase: 2
phaseTitle: "Functions, Modularity & Data Wrangling"
slug: "date-time"
duration: 45
difficulty: "intermediate"
tags:
  - python
  - datetime
  - timezones
  - scheduling
concepts:
  - "date and time objects"
  - "formatting and parsing"
  - "timedelta arithmetic"
  - "timezone handling"
prerequisites: [4, 14]
outcomes:
  - "Create and manipulate dates and times"
  - "Format dates for display and parse from strings"
  - "Perform date arithmetic"
---

# 🎯 Day 19: Date and Time

> *"Time is the most valuable resource in business—and code."*

---

## The "Never-Coded" Bridge

**Dates and times are everywhere in business:**

- Invoice due dates
- Subscription renewals
- Report timestamps
- Scheduling meetings

Without proper handling:

- "Is 01/02/2024 January 2nd or February 1st?"
- "What time is our meeting in Tokyo?"
- "How many business days until the deadline?"

Python's `datetime` module handles all of this:

```python
from datetime import datetime, timedelta

# Invoice due 30 days from now
due_date = datetime.now() + timedelta(days=30)
print(f"Payment due: {due_date.strftime('%B %d, %Y')}")
# Payment due: February 15, 2024
```

---

## The Technical Deep Dive

### The datetime Module

```python
from datetime import date, time, datetime, timedelta

# Date objects
today = date.today()
specific = date(2024, 12, 25)  # Christmas 2024

# Time objects
now = datetime.now().time()
specific_time = time(14, 30, 0)  # 2:30 PM

# Datetime objects (date + time)
now = datetime.now()
specific_dt = datetime(2024, 1, 15, 10, 30)
```

### Accessing Components

```python
dt = datetime.now()

dt.year  # 2024
dt.month  # 1
dt.day  # 15
dt.hour  # 10
dt.minute  # 30
dt.second  # 45
dt.weekday()  # 0=Monday, 6=Sunday
dt.date()  # date portion
dt.time()  # time portion
```

### Formatting (datetime → string)

```python
dt = datetime(2024, 1, 15, 14, 30)

# Using strftime
dt.strftime("%Y-%m-%d")  # "2024-01-15"
dt.strftime("%B %d, %Y")  # "January 15, 2024"
dt.strftime("%m/%d/%Y %I:%M %p")  # "01/15/2024 02:30 PM"
```

| Code | Meaning          | Example |
| ---- | ---------------- | ------- |
| `%Y` | 4-digit year     | 2024    |
| `%y` | 2-digit year     | 24      |
| `%m` | Month (01-12)    | 01      |
| `%B` | Full month name  | January |
| `%b` | Short month      | Jan     |
| `%d` | Day (01-31)      | 15      |
| `%H` | Hour 24h (00-23) | 14      |
| `%I` | Hour 12h (01-12) | 02      |
| `%M` | Minute           | 30      |
| `%S` | Second           | 00      |
| `%p` | AM/PM            | PM      |
| `%A` | Full weekday     | Monday  |
| `%a` | Short weekday    | Mon     |

### Parsing (string → datetime)

```python
from datetime import datetime

# Parse from string
dt = datetime.strptime("2024-01-15", "%Y-%m-%d")
dt = datetime.strptime("Jan 15, 2024", "%b %d, %Y")
dt = datetime.strptime("01/15/2024 02:30 PM", "%m/%d/%Y %I:%M %p")

# ISO format (common in APIs)
dt = datetime.fromisoformat("2024-01-15T14:30:00")
```

### Date Arithmetic with timedelta

```python
from datetime import datetime, timedelta

now = datetime.now()

# Add/subtract time
tomorrow = now + timedelta(days=1)
last_week = now - timedelta(weeks=1)
two_hours_later = now + timedelta(hours=2)

# Difference between dates
deadline = datetime(2024, 12, 31)
remaining = deadline - now
print(f"Days remaining: {remaining.days}")

# timedelta components
delta = timedelta(days=5, hours=3, minutes=30)
delta.total_seconds()  # 450600.0
```

### Comparing Dates

```python
from datetime import datetime

dt1 = datetime(2024, 1, 15)
dt2 = datetime(2024, 6, 30)

dt1 < dt2  # True
dt1 > dt2  # False
dt1 == dt2  # False

# Check if past/future
if datetime.now() > deadline:
    print("Deadline passed!")
```

---

## Senior-Level Insights

### ISO 8601 Standard

Use ISO format for data exchange:

```python
dt = datetime.now()

# To ISO string
iso_string = dt.isoformat()  # "2024-01-15T14:30:00.123456"

# From ISO string
dt = datetime.fromisoformat("2024-01-15T14:30:00")
```

### Timezone Handling (Python 3.9+)

```python
from datetime import datetime
from zoneinfo import ZoneInfo

# Timezone-aware datetime
utc_now = datetime.now(ZoneInfo("UTC"))
ny_time = datetime.now(ZoneInfo("America/New_York"))
tokyo_time = datetime.now(ZoneInfo("Asia/Tokyo"))

# Convert between timezones
la_time = utc_now.astimezone(ZoneInfo("America/Los_Angeles"))

print(f"UTC: {utc_now.strftime('%H:%M')}")
print(f"LA: {la_time.strftime('%H:%M')}")
```

### Business Days Calculation

```python
def business_days_from_now(days):
    """Calculate date N business days from today."""
    from datetime import date, timedelta

    current = date.today()
    added = 0

    while added < days:
        current += timedelta(days=1)
        if current.weekday() < 5:  # Monday=0, Friday=4
            added += 1

    return current


due_date = business_days_from_now(5)
print(f"Due in 5 business days: {due_date}")
```

### Performance: Avoid datetime.now() in Loops

```python
# Slow: calls now() each iteration
for item in items:
    item.timestamp = datetime.now()

# Fast: capture once
now = datetime.now()
for item in items:
    item.timestamp = now
```

---

## Hands-on Lab

### Exercise 1: Report Scheduler

```python
from datetime import datetime, timedelta


def get_report_schedule(start_date, frequency, count):
    """Generate report dates."""
    dates = []
    current = start_date

    for _ in range(count):
        dates.append(current)
        if frequency == "daily":
            current += timedelta(days=1)
        elif frequency == "weekly":
            current += timedelta(weeks=1)
        elif frequency == "monthly":
            # Approximate: add 30 days
            current += timedelta(days=30)

    return dates


# Generate weekly reports for next 4 weeks
start = datetime(2024, 1, 15)
schedule = get_report_schedule(start, "weekly", 4)

print("Report Schedule:")
for i, date in enumerate(schedule, 1):
    print(f"  Report {i}: {date.strftime('%A, %B %d, %Y')}")
```

**Expected Output:**

```
Report Schedule:
  Report 1: Monday, January 15, 2024
  Report 2: Monday, January 22, 2024
  Report 3: Monday, January 29, 2024
  Report 4: Monday, February 05, 2024
```

---

### Exercise 2: Age Calculator

```python
from datetime import date


def calculate_age(birthdate):
    """Calculate age and days until next birthday."""
    today = date.today()

    # Age in years
    age = today.year - birthdate.year
    if (today.month, today.day) < (birthdate.month, birthdate.day):
        age -= 1

    # Next birthday
    next_bday = date(today.year, birthdate.month, birthdate.day)
    if next_bday < today:
        next_bday = date(today.year + 1, birthdate.month, birthdate.day)

    days_until = (next_bday - today).days

    return {"age": age, "next_birthday": next_bday, "days_until": days_until}


# Test
bday = date(1990, 7, 15)
result = calculate_age(bday)
print(f"Age: {result['age']} years")
print(f"Next birthday: {result['next_birthday']} ({result['days_until']} days)")
```

**Expected Output (example for birthday 1990-07-15, run in 2026):**

```
Age: 35 years
Next birthday: 2026-07-15 (31 days)
```

---

### Exercise 3: Event Countdown

```python
from datetime import datetime


class EventCountdown:
    def __init__(self, name, event_date):
        self.name = name
        self.event_date = event_date

    @property
    def time_remaining(self):
        return self.event_date - datetime.now()

    @property
    def status(self):
        remaining = self.time_remaining
        if remaining.total_seconds() < 0:
            return "past"
        elif remaining.days == 0:
            return "today"
        elif remaining.days == 1:
            return "tomorrow"
        else:
            return "upcoming"

    def display(self):
        remaining = self.time_remaining
        if remaining.total_seconds() < 0:
            return f"🏁 {self.name} happened {abs(remaining.days)} days ago"

        days = remaining.days
        hours = remaining.seconds // 3600
        minutes = (remaining.seconds % 3600) // 60

        return f"⏳ {self.name}: {days}d {hours}h {minutes}m remaining"


# Usage
events = [
    EventCountdown("Product Launch", datetime(2024, 3, 15, 9, 0)),
    EventCountdown("Team Meeting", datetime.now().replace(hour=14, minute=0)),
    EventCountdown("Holiday", datetime(2024, 12, 25)),
]

for event in events:
    print(event.display())
```

**Expected Output (approximate, depends on run time):**

```
🏁 Product Launch happened 831 days ago
⏳ Team Meeting: 0d 3h 45m remaining
⏳ Holiday: 193d 0h 0m remaining
```

---

## Mastery Check

### Question 1: Format String

Write format string for "Monday, January 15, 2024 at 2:30 PM":

<details>
<summary>Click for Answer</summary>

```python
dt.strftime("%A, %B %d, %Y at %I:%M %p")
```

</details>

---

### Question 2: Date Difference

How do you get days between two dates?

<details>
<summary>Click for Answer</summary>

```python
from datetime import date

d1 = date(2024, 1, 1)
d2 = date(2024, 12, 31)

diff = d2 - d1
print(diff.days)  # 365
```

</details>

---

### Question 3: Parse Date

Parse "March 15, 2024":

<details>
<summary>Click for Answer</summary>

```python
from datetime import datetime

dt = datetime.strptime("March 15, 2024", "%B %d, %Y")
```

</details>

---

### Question 4: Week Number

How do you get the week number of the year?

<details>
<summary>Click for Answer</summary>

```python
from datetime import datetime

dt = datetime.now()
week_number = dt.isocalendar()[1]
# Or
week_number = int(dt.strftime("%W"))
```

</details>

---

### Question 5: Design Scenario

**Scenario**: Build a subscription tracker that calculates renewal dates and identifies expiring subscriptions.

<details>
<summary>Click for Answer</summary>

```python
from datetime import date, timedelta
from dataclasses import dataclass


@dataclass
class Subscription:
    name: str
    start_date: date
    period_months: int

    @property
    def renewal_date(self):
        # Approximate: 30 days per month
        return self.start_date + timedelta(days=30 * self.period_months)

    @property
    def days_until_renewal(self):
        return (self.renewal_date - date.today()).days

    @property
    def is_expiring_soon(self):
        return 0 < self.days_until_renewal <= 30

    @property
    def is_expired(self):
        return self.days_until_renewal < 0


def check_subscriptions(subscriptions):
    expiring = [s for s in subscriptions if s.is_expiring_soon]
    expired = [s for s in subscriptions if s.is_expired]

    print(f"⚠️ Expiring soon ({len(expiring)}):")
    for s in expiring:
        print(f"  {s.name}: {s.days_until_renewal} days left")

    print(f"\n❌ Expired ({len(expired)}):")
    for s in expired:
        print(f"  {s.name}: expired {abs(s.days_until_renewal)} days ago")
```

</details>

---

## Summary

Today you learned:

- ✅ `date`, `time`, `datetime` objects for temporal data
- ✅ `strftime` formats dates to strings
- ✅ `strptime` parses strings to dates
- ✅ `timedelta` for date arithmetic
- ✅ Timezone handling with `zoneinfo`

**Tomorrow**: We'll explore **Python Package Manager (pip)**—installing and managing third-party packages.

---

## Glossary

| Term | Definition |
|------|------------|
| `datetime` | A Python standard-library module providing classes (`date`, `time`, `datetime`, `timedelta`) for working with dates and times. |
| Epoch | The reference point (January 1, 1970 UTC) from which Unix timestamps are measured as a count of seconds. |
| Timezone Offset | The difference (in hours/minutes) between a local time and UTC; e.g., UTC-5 means 5 hours behind Coordinated Universal Time. |
| Naive Datetime | A `datetime` object with no timezone information attached; assumes the local system timezone by convention. |
| Aware Datetime | A `datetime` object with explicit timezone information attached (e.g., using `zoneinfo.ZoneInfo`). |
| `strftime` | A method that formats a `datetime` object into a string using format codes like `%Y` (year) and `%m` (month). |
| `strptime` | A class method that parses a date string into a `datetime` object using a matching format string. |
| `timedelta` | A duration representing the difference between two `datetime` or `date` objects, stored as days, seconds, and microseconds. |
| ISO 8601 | An international standard for representing dates and times as strings, e.g., `"2024-01-15T14:30:00"`. |

## Task Block (Core / Stretch / Expert)

### Project Thread (Days 18–21): Retail Operations Toolkit

Use the same mini-project across these days so each concept compounds into a usable product artifact.

### Core

- Extend the Day 18 classes with timestamp fields (`created_at`, `updated_at`, `fulfilled_at`).
- Implement date parsing/formatting utilities for order and shipment records.

### Stretch

- Add timezone-aware handling for at least two regions and compare fulfillment windows.
- Build one report function that flags stale/unfulfilled orders by date threshold.

### Expert

- Create a scheduling helper class that calculates SLA deadlines and late penalties.
- Keep interfaces packaging-ready by separating datetime utilities into a dedicated module.

## Common Grading Rubric (applies every day)

| Criterion | 1 - Emerging | 2 - Developing | 3 - Proficient | 4 - Strong |
|---|---|---|---|---|
| Correctness | Major logic errors; results frequently wrong. | Core path works but multiple inaccuracies remain. | Outputs are correct for expected inputs and checked with examples. | Outputs are consistently correct, including tricky cases and clear verification. |
| Robustness | Breaks on minor input changes or missing values. | Handles some variation but fails on common edge cases. | Handles expected edge cases with explicit guards/validation. | Gracefully handles unexpected data, with informative failures and recovery paths. |
| Readability | Hard to follow; unclear naming/structure. | Partially clear but inconsistent style or organization. | Clear naming, structure, and comments/docstrings where needed. | Highly readable, well-organized, and easy for teammates to extend quickly. |
| Reuse | One-off script with duplicated logic. | Some modularization, limited reuse. | Reusable functions/classes with sensible boundaries. | Well-factored components with clean interfaces and minimal duplication. |
