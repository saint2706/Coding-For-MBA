---
title: "Day 1: Python for Business Analytics - First Steps"
tags:
  - BI
  - Basics
  - Python
---

# 📘 Day 1: Python for Business Analytics - First Steps

## Managerial Relevance

Welcome! As a future business leader, understanding data is your most critical asset. You don't need to be a software engineer, but you do need to be "data literate."

Python is the standard language for data science. By learning it, you gain:

- **Independence:** Stop waiting for data teams to run simple reports.
- **Automation:** Replace hours of Excel copy-pasting with a single script.
- **Insight:** Perform analyses that are simply impossible in spreadsheets.

Today is about overcoming the "blank page" fear and running your first business calculation.

## Key Concepts

- **Scripts (`.py` files):** A text file containing Python instructions. Think of it as a recipe you give the computer.
- **Functions:** Reusable blocks of code. Like an Excel macro, but more powerful.
- **`print()`:** The way Python talks back to you. It displays results on the screen.
- **Basic Math:** Python is calculator. It handles `+`, `-`, `*`, `/` naturally.

## Code Walkthrough

Open `helloworld.py`. We've structured it into professional "functions" to build good habits early.

1.  **`hello_world()`**:
    - Prints a welcome message.
    - Demonstrates that Python executes lines in order, top to bottom.

2.  **`calculate_roi()`**:
    - A simple business function!
    - Takes `revenue` and `cost`.
    - Returns the Return on Investment (ROI) formatted as a percentage.
    - _Business Note:_ Automating standard KPIs ensures everyone calculates them the exact same way.

3.  **`main()`**
    - The entry point. It calls the other functions to tell the story.

### Running the Code

In your terminal, run:

```bash
python Day_01_Introduction/helloworld.py
```

## 💻 Practice Exercises

Open `solutions.py` (or create it) and try these challenges:

1.  **Company Intro**:
    - Print a statement introducing a fictional start-up.
    - Example: `"InnovateCorp Logistics: Optimizing the Extra Mile."`

2.  **Break-Even Point**:
    - If Fixed Costs are $50,000 and Contribution Margin per Unit is $25.
    - Calculate how many units you need to sell to break even.
    - Hint: `50000 / 25`.

3.  **Data Types**:
    - Use `type(100)` and `type("Revenue")` to see what Python calls them.
    - _Why it matters:_ You can't do math on text. Knowing your data type prevents errors.

<!-- LESSON_FOOTER_START -->

---

**Previous:** _None_ • **Next:** [Day 02 – Storing and Analyzing Business Data](../Day_02_Variables_Builtin_Functions/README.md)

_You are on lesson 1 of 108._

<!-- LESSON_FOOTER_END -->
