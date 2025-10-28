---
title: 'Day 20: Python Package Manager (pip) & Third-Party Libraries'
tags:
- Basics
- Python
---
# 📘 Day 20: Python Package Manager (pip) & Third-Party Libraries

The real power of Python for data analysis comes from its vast ecosystem of third-party libraries.
These are pre-written modules, created by the community, that provide powerful tools for specific
tasks.

- **`requests`**: For making HTTP requests to APIs and websites.
- **`numpy`**: For numerical computing and advanced math.
- **`pandas`**: For data manipulation and analysis (we'll dive deep into this soon).
- **`beautifulsoup4`**: For web scraping.

## `pip` and `requirements.txt`

- **`pip`** is the standard tool for installing these packages. You use it in your terminal (e.g.,
  `pip install requests`).
- A **`requirements.txt`** file is the standard way to list all the third-party packages your
  project depends on. This allows anyone (including you, on a different computer) to install all the
  necessary libraries at once using a single command: `pip install -r requirements.txt`.

## Environment Setup

This project now has a `requirements.txt` file at its root. Before you begin, ensure you have
followed the setup instructions in the main [README.md](../../README.md) to create a virtual
environment and run `pip install -r requirements.txt`.

## Exploring the Refactored Code

The script for this lesson, `url.py`, demonstrates how to use `requests` to fetch data from live
APIs and `numpy` to perform calculations. The code has been refactored to separate the data fetching
logic from the data analysis logic, which is a crucial best practice.

1. **Review the Code:** Open `Day_20_Python_Package_Manager/url.py`. Notice the `fetch_api_data()`
   function, which is responsible for the network request, and the `analyze_...` functions, which
   take data as input and perform calculations.
1. **Run the Script:** From the root directory of the project (`Coding-For-MBA`), run the script. It
   will make live calls to external APIs and print the analysis.
   ```bash
   python Day_20_Python_Package_Manager/url.py
   ```
1. **Run the Tests:** The tests for this lesson demonstrate a key testing technique: **mocking**. We
   replace the live network call with a "mock" object that returns sample data. This makes our tests
   fast, reliable, and independent of the network.
   ```bash
   pytest tests/test_day_20.py
   ```

## 💻 Exercises: Day 20

1. **Explore the `requests` Response:**

   - In a new script (`my_solutions_20.py`), import the `requests` library.
   - Make a `get` request to `"https://api.thecatapi.com/v1/breeds"`.
   - The object returned by `requests.get()` is a `Response` object. Print its `status_code`
     attribute (e.g., `response.status_code`) and its `headers` attribute.

1. **Analyze Different Metrics:**

   - Import the `fetch_api_data` and `analyze_breed_metrics` functions from the lesson script.
   - Fetch the cat breed data.
   - The `analyze_breed_metrics` function can analyze both `'weight'` and `'life_span'`. Call it for
     `'life_span'` and print the result.

1. **Find the Top 3 Origins:**

   - Import and use the `analyze_breed_origins` function, but modify the call so it returns the top
     3 most common origins instead of the default 5.

🎉 **Congratulations!** You now understand how to leverage the vast Python ecosystem using `pip`.
This skill unlocks a world of powerful tools for data analysis, machine learning, web development,
and more.

<!-- LESSON_FOOTER_START -->

---

**Previous:** [Day 19 – Day 19: Working with Dates and Times](../Day_19_Python_Date_Time/README.md) • **Next:** [Day 21 – Day 21: Virtual Environments - Professional Project Management](../Day_21_Virtual_Environments/README.md)

_You are on lesson 20 of 108._

<!-- LESSON_FOOTER_END -->