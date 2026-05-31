---
day: 1
title: "Introduction to Python"
phase: 1
phaseTitle: "Algorithmic Thinking & Python Foundations"
slug: "introduction-to-python"
duration: 60
difficulty: "beginner"
tags:
  - python
  - basics
  - getting-started
  - algorithmic-thinking
concepts:
  - "algorithmic thinking"
  - "problem decomposition"
  - "pseudocode"
  - "print statements"
  - "basic arithmetic"
  - "script execution"
  - "REPL environment"
prerequisites: []
outcomes:
  - "Decompose a business problem into algorithmic steps"
  - "Write and execute your first Python script"
  - "Perform basic arithmetic calculations"
  - "Understand the difference between scripts and the REPL"
---

# 🎯 Day 1: Introduction to Python

> *"Every expert was once a beginner. Today, you take your first step."*

---

## The "Never-Coded" Bridge

**Imagine you're teaching a new employee to use a calculator—but this calculator can remember steps, repeat tasks, and never makes arithmetic errors.**

That's Python.

Think of writing code like writing a recipe for a robot chef. You give it precise instructions:

- "Take 2 eggs" → In Python: `eggs = 2`
- "Add 3 cups of flour" → In Python: `flour = 3`
- "Tell me the total ingredients" → In Python: `print(eggs + flour)`

The robot follows your recipe exactly, every single time. No guessing, no improvisation—just reliable, repeatable results.

**Why does this matter for business?**

- That monthly report you spend 4 hours creating in Excel? Python can do it in 4 seconds.
- Those 500 customer emails you need to personalize? Python handles them before your coffee gets cold.
- That pricing analysis across 10,000 products? Python doesn't need lunch breaks.

---

## Thinking Algorithmically

Before writing a single line of Python, the most important skill to develop is **algorithmic thinking**: the ability to break any problem into a clear, ordered sequence of steps a machine can follow.

This is the "Algorithmic" in Phase 1's title — and it underpins everything else you'll learn.

### What Is an Algorithm?

An algorithm is simply a precise, ordered recipe for solving a problem. You already write algorithms every day — you just don't call them that.

**Business example — Approving a Purchase Order:**

> 1. Receive the purchase request
> 2. Check if the amount is within the requester's approval limit
> 3. If yes → mark as approved and notify the requester
> 4. If no → escalate to the requester's manager
> 5. Log the decision with timestamp

That's an algorithm. Python lets you express it so a computer runs it automatically, thousands of times per day without mistakes.

### Three Skills of Algorithmic Thinking

**1. Decomposition — Break the problem down**

Never try to solve the whole problem at once. Split it into the smallest possible pieces, then solve each piece.

| The Big Problem | Decomposed Steps |
|---|---|
| "Calculate customer churn rate" | 1. Count total customers at start of period<br>2. Count customers lost during period<br>3. Divide lost ÷ total<br>4. Multiply by 100 for percentage |

**2. Abstraction — Ignore irrelevant details**

Focus only on what matters for the problem at hand. When calculating churn, you don't need each customer's address or favorite product — just whether they churned or not.

**3. Pattern Recognition — Spot what repeats**

If you're doing the same calculation for January, then February, then March… that's a pattern you can automate with a loop (Day 10). Spotting repetition is what tells you when to stop copy-pasting and start programming.

### Pseudocode: Plan Before You Code

Pseudocode is informal, human-readable logic — not valid Python, but a bridge between your thinking and the code you'll write.

**Business problem**: Calculate a sales rep's commission.

```
Pseudocode:
  GET sales_amount and commission_rate
  IF sales_amount > 50000 THEN
      apply bonus_multiplier of 1.5 to commission_rate
  CALCULATE commission = sales_amount × commission_rate
  PRINT "Commission earned: $" + commission
```

Now translating to Python is mechanical — the hard thinking is already done:

```python
sales_amount = 62000
commission_rate = 0.08

if sales_amount > 50000:
    commission_rate = commission_rate * 1.5

commission = sales_amount * commission_rate
print("Commission earned: $", commission)
# Output: Commission earned: $ 7440.0
```

### The Three-Question Framework

Before writing any code, ask yourself:

1. **What is the input?** (What data do I start with?)
2. **What is the output?** (What does the result look like?)
3. **What are the steps?** (How do I transform input into output?)

Answering these three questions in plain English *before* touching the keyboard is what separates professionals from beginners.

---

## The Technical Deep Dive

### Your First Python Program

The `print()` function is how Python "talks" to you. It displays information on your screen.

```python
print("Hello, World!")
```

**Breaking it down:**

- `print` → The instruction (called a "function")
- `()` → Parentheses hold what you want to print
- `"Hello, World!"` → The message (text in quotes is called a "string")

### Basic Arithmetic

Python is a powerful calculator. No special syntax needed—just type math naturally:

```python
# Addition
print(100 + 50)  # Output: 150

# Subtraction
print(1000 - 250)  # Output: 750

# Multiplication (use * not ×)
print(25 * 4)  # Output: 100

# Division
print(100 / 4)  # Output: 25.0

# Exponents (powers)
print(2**10)  # Output: 1024
```

> **Note:** Lines starting with `#` are *comments*—notes for humans that Python ignores completely.

### Running Python Code

**Option 1: The REPL (Interactive Mode)**
Type `python` in your terminal. You get a `>>>` prompt where you can type code line-by-line and see results immediately.

```text
>>> 50 * 12
600
>>> print("Revenue calculated!")
Revenue calculated!
```

**Option 2: Script Files**
Save code in a `.py` file and run it all at once:

```bash
python my_script.py
```

---

## Senior-Level Insights

### Why Python for Enterprise?

| Language   | Learning Curve | Data Science | Web Apps | Enterprise Adoption       |
| ---------- | -------------- | ------------ | -------- | ------------------------- |
| Python     | Low            | ⭐⭐⭐⭐⭐        | ⭐⭐⭐⭐     | Netflix, Google, JPMorgan |
| Java       | High           | ⭐⭐⭐          | ⭐⭐⭐⭐⭐    | Banks, Large Corps        |
| JavaScript | Medium         | ⭐⭐           | ⭐⭐⭐⭐⭐    | Web-first companies       |

### Production Considerations

1. **Readability is Law**: Python enforces clean code through indentation. In professional codebases, this dramatically reduces debugging time.

2. **The 80/20 Rule of Automation**: In business, 80% of repetitive tasks can be automated with 20% of Python's features. You don't need to master everything—start with what solves real problems.

3. **Interpreted vs. Compiled**: Python runs line-by-line (interpreted), making it perfect for rapid prototyping. For performance-critical systems, companies often prototype in Python, then optimize bottlenecks.

### Architectural Trade-off

> **Speed vs. Simplicity**: Python prioritizes developer productivity over raw execution speed. For most business applications, the time saved in development far outweighs milliseconds of runtime.

---

## Hands-on Lab

### Exercise 0: Algorithmic Thinking Before Code

**Goal**: Practice decomposing a business problem before writing any Python.

**The Business Problem**: A retailer wants to calculate the final price a customer pays, given a product price, a percentage discount, and a sales tax rate.

**Your task** (in plain English, no code yet):
1. Write out the three-question framework answers:
   - What is the input?
   - What is the output?
   - What are the steps?
2. Write pseudocode for the solution
3. Only then translate it to Python

<details>
<summary>Click for Answer</summary>

**Three-Question Framework:**
- Input: `price`, `discount_percent`, `tax_rate`
- Output: `final_price` (a single dollar amount)
- Steps:
  1. Calculate the discount amount = price × (discount_percent / 100)
  2. Calculate the discounted price = price − discount amount
  3. Calculate tax amount = discounted price × tax_rate
  4. Final price = discounted price + tax amount

**Pseudocode:**
```
GET price, discount_percent, tax_rate
CALCULATE discount_amount = price × (discount_percent / 100)
CALCULATE discounted_price = price - discount_amount
CALCULATE tax_amount = discounted_price × tax_rate
CALCULATE final_price = discounted_price + tax_amount
PRINT final_price
```

**Python translation:**
```python
price = 120.00
discount_percent = 15
tax_rate = 0.08

discount_amount = price * (discount_percent / 100)
discounted_price = price - discount_amount
tax_amount = discounted_price * tax_rate
final_price = discounted_price + tax_amount

print("Final price: $", round(final_price, 2))
# Output: Final price: $ 110.16
```

Notice: the Python almost writes itself once the pseudocode is clear.

</details>

---

### Exercise 1: The Company Introduction

**Goal**: Print a professional introduction for a fictional company.

**Step-by-step**:

1. Open your Python environment (REPL or create `lab1.py`)
2. Think of a company name and tagline
3. Use `print()` to display them

```python
# Your solution:
print("TechVentures Inc.")
print("Innovating Tomorrow, Today")
```

**Expected Output:**

```text
TechVentures Inc.
Innovating Tomorrow, Today
```

---

### Exercise 2: Break-Even Analysis

**Goal**: Calculate the break-even point for a product launch.

**The Business Scenario:**

- Fixed Costs (rent, salaries, equipment): $75,000
- Contribution Margin per Unit: $25

**Step-by-step**:

1. The break-even formula: `Fixed Costs ÷ Contribution Margin = Units Needed`
2. Write this in Python
3. Print the result with context

```python
# Your solution:
fixed_costs = 75000
margin_per_unit = 25
break_even_units = fixed_costs / margin_per_unit
print("Break-even point:", break_even_units, "units")
```

**Expected Output:**

```text
Break-even point: 3000.0 units
```

---

### Exercise 3: Quarterly Revenue Report

**Goal**: Calculate total Q1 revenue from monthly figures.

**The Data:**

- January: $125,000
- February: $142,500
- March: $138,750

**Step-by-step**:

1. Store each month's revenue
2. Calculate the total
3. Calculate the monthly average
4. Print both results

```python
# Your solution:
jan = 125000
feb = 142500
mar = 138750

q1_total = jan + feb + mar
monthly_avg = q1_total / 3

print("Q1 Total Revenue: $", q1_total)
print("Monthly Average: $", monthly_avg)
```

**Expected Output:**

```text
Q1 Total Revenue: $ 406250
Monthly Average: $ 135416.66666666666
```

---

## Mastery Check

### Question 1: Basic Syntax

What will the following code display?

```python
print(10 + 5 * 2)
```

<details>
<summary>Click for Answer</summary>

**Answer: `20`**

Python follows mathematical order of operations (PEMDAS). Multiplication happens before addition: `5 * 2 = 10`, then `10 + 10 = 20`.

</details>

---

### Question 2: String vs. Number

What's wrong with this code?

```python
print("Revenue: " + 50000)
```

<details>
<summary>Click for Answer</summary>

**Answer: TypeError**

You cannot concatenate a string (`"Revenue: "`) with a number (`50000`) directly. Fix it with:

```python
print("Revenue: " + str(50000))
# OR
print("Revenue:", 50000)
```

</details>

---

### Question 3: Real-World Application

You need to calculate the ROI for a marketing campaign that cost $15,000 and generated $45,000 in revenue. Write the Python code.

<details>
<summary>Click for Answer</summary>

```python
cost = 15000
revenue = 45000
roi = ((revenue - cost) / cost) * 100
print("ROI:", roi, "%")
# Output: ROI: 200.0 %
```

</details>

---

### Question 4: Debugging Challenge

This code should print the average of three test scores, but it's wrong. Find and fix the bug:

```python
score1 = 85
score2 = 92
score3 = 78
average = score1 + score2 + score3 / 3
print("Average:", average)
```

<details>
<summary>Click for Answer</summary>

**Bug**: Order of operations! Division happens before addition.

**Fix**:

```python
average = (score1 + score2 + score3) / 3
```

Without parentheses, Python calculates: `85 + 92 + (78/3)` = `85 + 92 + 26` = `203`

With parentheses: `(85 + 92 + 78) / 3` = `255 / 3` = `85`

</details>

---

### Question 5: Design Scenario

**Scenario**: Your CFO asks you to build a tool that calculates compound interest for investment projections. The formula is:

`A = P × (1 + r)^n`

Where:

- P = Principal ($10,000)
- r = Annual rate (5% = 0.05)
- n = Years (10)

How would you structure this program? What would you need to consider for different users with different inputs?

<details>
<summary>Click for Answer</summary>

```python
# Basic solution
principal = 10000
rate = 0.05
years = 10
final_amount = principal * (1 + rate) ** years
print("Final amount: $", round(final_amount, 2))
# Output: Final amount: $ 16288.95
```

**Design Considerations for Production:**

1. **Input validation**: What if someone enters a negative rate?
2. **User interface**: Should users input their own values?
3. **Formatting**: Currency should display with 2 decimal places and commas
4. **Edge cases**: What happens with 0 years? Negative principal?
5. **Documentation**: Add comments explaining the formula for future maintainers

</details>

---

## Summary

Today you learned:

- ✅ Algorithmic thinking means decomposing problems into ordered steps before coding
- ✅ Pseudocode bridges your reasoning and Python code
- ✅ The three-question framework (input / output / steps) prevents wasted effort
- ✅ Python is a precise, repeatable tool for business automation
- ✅ `print()` displays information to users
- ✅ Python handles arithmetic naturally with proper order of operations
- ✅ Scripts (`.py` files) allow you to save and rerun code
- ✅ The REPL lets you experiment interactively

**Tomorrow**: We'll learn how to store and manipulate data using **variables**—the building blocks of every program.
