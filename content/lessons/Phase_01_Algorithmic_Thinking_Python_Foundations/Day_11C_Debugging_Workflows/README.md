---
day: "11C"
title: "Debugging Workflows"
phase: 1
phaseTitle: "Algorithmic Thinking & Python Foundations"
slug: "debugging-workflows"
duration: 75
difficulty: "beginner"
tags:
  - python
  - debugging
  - traceback
  - logging
  - pdb
concepts:
  - "debugging lifecycle"
  - "traceback interpretation"
  - "breakpoint and pdb commands"
  - "logging levels and context"
  - "verification and regression safety"
prerequisites: [1, 2, 3, 4, 5, 8, 9, 10, 11, 12]
outcomes:
  - "Use a repeatable workflow to debug small business scripts"
  - "Read Python tracebacks and identify likely root causes"
  - "Inspect state interactively with breakpoint() / pdb"
  - "Add targeted logs that make bugs reproducible and explainable"
  - "Debug end-to-end from failure report to verified fix"
---

# 🛠️ Day 11C: Debugging Workflows

> *"Professionals don't just fix bugs—they build a method they can trust under pressure."*

---

## Why This Matters for MBA Learners

In real teams, you will often inherit scripts that:

- calculate KPIs,
- transform CSV exports,
- classify customers,
- generate operational reports.

When those scripts fail, the business does not ask for theory—they ask for **reliable recovery**.

Today you learn a practical debugging system you can apply immediately.

---

## 1) Beginner-First Debugging Framework

Use this five-step loop every time:

## **Reproduce → Isolate → Inspect State → Fix → Verify**

### 1. Reproduce
- Run the exact code path that fails.
- Save the input data and parameters.
- Confirm you can trigger the bug consistently.

```python
# Keep a tiny "known failing" input nearby.
orders = [120, 250, 90]
# "monthly_bonus" crashes on this set.
```

### 2. Isolate
- Reduce the failing scenario to the smallest snippet possible.
- Remove unrelated code (file I/O, plotting, extra formatting).
- Aim for 10–20 lines that still fail.

### 3. Inspect State
- Print/log key variables or use `breakpoint()`.
- Inspect assumptions (types, lengths, dictionary keys, loop counters).
- Compare expected state vs actual state.

### 4. Fix
- Change one thing at a time.
- Prefer clear logic over clever logic.
- Keep your old failing example to test against.

### 5. Verify
- Re-run the failing case.
- Run 1–3 nearby cases to catch side effects.
- Add a tiny regression check so the bug stays fixed.

> Think of this like managerial problem-solving: define, diagnose, intervene, validate.

---

## 2) Reading Python Tracebacks (Days 1–12 Error Patterns)

A traceback is a timeline of function calls ending at the failure point.

```text
Traceback (most recent call last):
  File "kpi.py", line 21, in <module>
    print(calc_margin(revenue, cost))
  File "kpi.py", line 9, in calc_margin
    return (revenue - cost) / revenue
ZeroDivisionError: division by zero
```

How to read it:
1. Start at the **bottom** (`ZeroDivisionError`).
2. Read the failing line (`line 9`).
3. Move upward to understand who called it (`line 21`).

### Common error classes from Days 1–12

- **`NameError`**: variable/function name not defined.
  - Often typo or variable created in a different scope.
- **`TypeError`**: operation on incompatible types.
  - Example: adding string + int; calling function with wrong argument count.
- **`ValueError`**: type is correct, value is invalid.
  - Example: `int("abc")`.
- **`IndexError`**: list index out of range.
  - Common in loops with wrong stop condition.
- **`KeyError`**: dictionary key missing.
  - Use `.get()` or conditional checks.
- **`AttributeError`**: method/property does not exist for object.
  - Example: calling `.append` on a string.
- **`ZeroDivisionError`**: division by zero.
  - Common in ratio calculations with empty/zero denominators.
- **`SyntaxError` / `IndentationError`**: parser cannot read code structure.
  - Usually punctuation, missing colon, indentation mismatch.

### Fast traceback triage checklist

- What is the error class?
- Which file + line failed?
- What is the value/type of critical variables on that line?
- Did earlier lines create bad state that surfaces later?

### Connecting tracebacks to error handling (Day 11 review)

Once you've identified the error class from the traceback, you can often prevent the crash entirely with a targeted `try/except` at the right layer. The debugging workflow tells you *what* went wrong and *where*; error handling (taught in Day 11) tells you *how to recover*.

| Traceback error | Typical `except` fix |
|---|---|
| `ZeroDivisionError` | `except ZeroDivisionError: return None` |
| `KeyError` | `except KeyError:` or use `.get()` before accessing |
| `ValueError` | `except ValueError:` around type conversion |
| `AttributeError` | `except AttributeError:` or check with `hasattr()` |
| `TypeError` | Add input validation with `raise TypeError(...)` at function entry |

> **Debugging vs. error handling**: Debugging finds bugs during development. Error handling manages *expected* bad states at runtime — missing data, malformed input, edge cases the business sends in. Both skills are essential; neither replaces the other.

---

## 3) `breakpoint()` / `pdb` Walkthrough

### Using pdb: Python's Built-in Debugger

Python ships with a built-in interactive debugger called `pdb`. You can activate it two ways:

```python
# Python 3.6 and below — explicit import
import pdb; pdb.set_trace()

# Python 3.7+ — preferred, cleaner
breakpoint()
```

**Key pdb commands:**

| Command | Action |
|---------|--------|
| `n` | Next line (step over) |
| `s` | Step into function call |
| `c` | Continue until next breakpoint |
| `p variable_name` | Print a variable's value |
| `l` | List surrounding source code |
| `q` | Quit the debugger |

**Concrete example — using `breakpoint()` to inspect a crash:**

```python
def calculate_margin(revenue, cost):
    margin = (revenue - cost) / revenue   # crashes if revenue is 0
    return round(margin * 100, 2)

records = [
    {"revenue": 50000, "cost": 30000},
    {"revenue": 0,     "cost": 5000},   # <-- bug is here
    {"revenue": 80000, "cost": 45000},
]

for record in records:
    breakpoint()   # pause before each calculation to inspect record
    result = calculate_margin(record["revenue"], record["cost"])
    print(f"Margin: {result}%")
```

At the `(Pdb)` prompt, type `p record` to see the current record's values before the crash happens. When you reach the zero-revenue record, type `p record["revenue"]` — you'll see `0`, confirming the root cause.

> **VS Code alternative**: For a visual step-through debugger, VS Code's built-in debugger (click the Run & Debug panel, set breakpoints by clicking line numbers) is the modern alternative. It shows variables in a sidebar and lets you hover over values — no terminal commands needed.

Python's built-in debugger pauses execution and lets you inspect state in real time.

```python
def categorize_order(amount):
    if amount < 100:
        tier = "small"
    elif amount < 500:
        tier = "mid"
    else:
        tier = "enterprise"

    breakpoint()  # pause here
    return tier.upper()

print(categorize_order(220))
```

Run script, then use these commands:

- `n` = **next** line (stay in same function)
- `s` = **step** into called function
- `c` = **continue** until next breakpoint/end
- `p expr` = print expression
- `pp expr` = pretty-print (clean for dict/list)
- `l` = list source around current line
- `q` = quit debugger

### Watch-style inspection patterns (manual but effective)

In `pdb`, repeatedly check expressions at each step:

```text
(Pdb) p amount
(Pdb) p type(amount)
(Pdb) p tier
(Pdb) pp {'amount': amount, 'tier': tier}
```

Useful watch expressions:
- loop index + current value: `p i, row`
- list growth: `p len(results)`
- dict key availability: `p 'customer_id' in row`
- guard conditions: `p revenue != 0`

> Rule of thumb: inspect **state transitions**, not just final outputs.

---

## 4) Logging Basics: Prefer Logs Over Random Prints

`print()` is fine for quick local checks, but logging is better for repeatable diagnostics.

### Core levels

- `DEBUG`: detailed internal state.
- `INFO`: normal business progress.
- `WARNING`: unusual but still running.
- `ERROR`: operation failed.
- `CRITICAL`: severe failure requiring immediate attention.

### Simple logging setup

```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s"
)

def compute_conversion(signups, visits):
    logging.info("Computing conversion", extra={"signups": signups, "visits": visits})

    if visits == 0:
        logging.error("Cannot compute conversion: visits is zero")
        return 0

    rate = signups / visits
    logging.info("Computed conversion", extra={"rate": rate})
    return rate
```

### Structured context fields to include

For business scripts, attach context that helps replay failures:

- `job_id`
- `file_name`
- `customer_id`
- `region`
- `step_name`
- `record_count`

Even if your formatter is simple text, consistently logging these fields massively improves troubleshooting.

### When to use logs vs print

Use `print()` when:
- learning basics,
- debugging a one-off 10-line script.

Use `logging` when:
- script may run repeatedly,
- multiple people will read output,
- you need severity levels,
- you need historical diagnostics.

---

## 5) Bug Clinic (Phase 1 Topic-Based Exercises)

For each exercise:
1. Reproduce failure.
2. Isolate smallest failing snippet.
3. Inspect state (`print`, `breakpoint`, or logs).
4. Fix.
5. Verify with at least two test inputs.

### Exercise A — Lists + Loops

```python
def average_top_3(scores):
    top = sorted(scores, reverse=True)
    return sum(top[:3]) / 3

print(average_top_3([80, 90]))
```

**Symptom:** returns misleading average when list has fewer than 3 items.

**Expected debug steps:**
- Inspect `len(scores)` and `top[:3]`.
- Identify hard-coded denominator `3`.
- Fix denominator to `len(top[:3])` with empty-list guard.

---

### Exercise B — Dictionaries

```python
def revenue_by_region(rows):
    totals = {}
    for row in rows:
        totals[row["region"]] += row["revenue"]
    return totals
```

**Symptom:** `KeyError` on first region occurrence.

**Expected debug steps:**
- Reproduce with one-row input.
- Inspect `totals` before update.
- Replace with initialization pattern:
  - `totals[region] = totals.get(region, 0) + revenue`

---

### Exercise C — Functions + Types

```python
def discount(price, pct):
    return price * (1 - pct / 100)

print(discount("100", 10))
```

**Symptom:** `TypeError` (string math).

**Expected debug steps:**
- Inspect `type(price)` at function entry.
- Decide conversion policy (`float(price)`) or strict validation.
- Verify with numeric and string numeric inputs.

---

### Exercise D — Comprehensions

```python
orders = [
    {"id": 1, "amount": 120},
    {"id": 2},
    {"id": 3, "amount": 340},
]

large_ids = [o["id"] for o in orders if o["amount"] > 200]
print(large_ids)
```

**Symptom:** `KeyError: 'amount'`.

**Expected debug steps:**
- Expand comprehension into loop to inspect each `o`.
- Detect missing key case.
- Fix with guard: `if o.get("amount", 0) > 200`.

---

### Exercise E — Loop Control Logic

```python
def first_negative(nums):
    for n in nums:
        if n < 0:
            return n
        else:
            return None
```

**Symptom:** returns `None` too early.

**Expected debug steps:**
- Step with debugger and inspect first iteration.
- Notice `else:return None` runs on first non-negative value.
- Move `return None` outside loop.

---

## 6) Mastery Check: Debug a Mini Business Script End-to-End

### Broken script

```python
"""Monthly sales summary tool (broken on purpose)."""

def summarize_sales(rows):
    totals = {}

    for row in rows:
        region = row["region"]
        amount = row["amount"]

        if amount > 0:
            totals[region] = totals[region] + amount

    grand_total = sum(totals)
    avg = grand_total / len(rows)

    return {
        "totals": totals,
        "grand_total": grand_total,
        "avg_order": avg,
    }


data = [
    {"region": "North", "amount": 1200},
    {"region": "South", "amount": 800},
    {"region": "North", "amount": 600},
]

print(summarize_sales(data))
```

### Your mission

Apply the full workflow and produce a corrected version.

### Hints for likely issues

- Dictionary accumulation assumes key already exists.
- `sum(totals)` sums dict keys, not numeric values.
- Average order should use number of valid orders, not always `len(rows)` if filtering changed row count.

### Expected verification checklist

- Works for normal input.
- Works for empty input.
- Works when one row has zero or negative amount.
- Grand total equals sum of per-region totals.
- Average matches `grand_total / valid_order_count`.

---

## Quick Reference: Debugging Cheat Sheet

1. Reproduce with fixed small input.
2. Read traceback bottom-up.
3. Isolate minimal failing code.
4. Inspect state (`p`, `pp`, type checks, lengths, key checks).
5. Apply one clear fix.
6. Verify with failing + nearby cases.
7. Keep a regression example.

---

## Reflection Prompts

- Which debugging step do you skip most often today?
- Do you usually debug symptoms or root causes?
- Where can you replace ad hoc prints with structured logs in your current work?

By mastering this workflow now, you'll ship more reliable analytics code in every later phase.

---

## Mastery Check

### Question 1: Reading a Traceback

Study this traceback and answer: what is the error, and on which line did it occur?

```text
Traceback (most recent call last):
  File "report.py", line 14, in <module>
    result = generate_report(data)
  File "report.py", line 8, in generate_report
    rate = signups / visits
ZeroDivisionError: division by zero
```

<details>
<summary>Click for Answer</summary>

The error is a `ZeroDivisionError` — the code tried to divide by zero. It occurred on **line 8** inside the `generate_report` function, at the expression `signups / visits`. The call originated from **line 14** in the main script. Fix: add a guard `if visits == 0: return None` before the division.

</details>

---

### Question 2: Find and Fix the Bug

What is wrong with this function, and how do you fix it?

```python
def first_above_threshold(values, threshold):
    for v in values:
        if v > threshold:
            return v
        else:
            return None
```

<details>
<summary>Click for Answer</summary>

The `else: return None` runs on the very first value that is NOT above the threshold, exiting the loop immediately before checking the remaining values. The fix is to move `return None` **outside** the loop so it only runs after all values have been checked:

```python
def first_above_threshold(values, threshold):
    for v in values:
        if v > threshold:
            return v
    return None  # only reached if no value exceeds threshold
```

</details>

---

### Question 3: Choosing the Right Debugging Tool

You have three situations. Match each to the right debugging approach: `print()` debugging, `pdb` / `breakpoint()`, or VS Code debugger.

1. You have a 15-line script that crashes on one specific input and you want to check one variable quickly.
2. You're debugging a complex function with 5 nested loops, and you need to inspect state at each iteration to find where the logic diverges.
3. You're working on a large multi-file project, want to set breakpoints across different files, and prefer a visual interface.

<details>
<summary>Click for Answer</summary>

1. **`print()` debugging** — for a quick, one-off check in a small script, inserting a `print(variable)` is the fastest path to an answer.
2. **`pdb` / `breakpoint()`** — for complex logic requiring step-by-step inspection in the terminal, `breakpoint()` lets you pause at each iteration and run `p` commands to check state as you go.
3. **VS Code debugger** — for multi-file projects where a visual sidebar showing all variable values, a call stack panel, and click-to-set breakpoints makes the process far more manageable than terminal-based pdb.

</details>

---

## Glossary

- **Bug**: An error in code that causes incorrect or unexpected behavior
- **Debugging**: The process of finding and fixing bugs in code
- **`print()` debugging**: The practice of inserting `print()` statements to inspect variable values at runtime
- **`pdb`**: Python's built-in interactive debugger module
- **Breakpoint**: A marker that pauses program execution so you can inspect state at that point
- **`breakpoint()`**: Built-in function (Python 3.7+) that activates the debugger at that line
- **Stack trace (Traceback)**: The error output showing the chain of function calls that led to an exception
- **Exception**: A runtime error that interrupts normal program flow
- **`try/except`**: Block structure that catches and handles exceptions gracefully
- **`logging` module**: Python's standard library for structured, level-based logging (preferred over print in production)
- **Scientific method of debugging**: Form hypothesis → test → observe → revise → repeat
