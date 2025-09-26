# 📘 Day 30: Web Scraping - Extracting Data from the Web

Sometimes, the data you need isn't available in a clean CSV file or through an API. It's simply displayed on a website. **Web scraping** is the process of automatically downloading the HTML code of a web page and extracting useful information from it.

This is an incredibly powerful tool for a business analyst, allowing you to gather competitive intelligence, track news sentiment, collect product prices, and much more.

## 📦 Working Offline

If you do not have internet access, you can still explore the examples in this lesson. The folder includes a curated `presidents.csv` containing a snapshot of key columns—number, name, party, term dates, and vice presidents—for every U.S. president through Joe Biden. The exercise scripts will look for this local file first, so you can experiment with parsing and analysis even when the Wikipedia page is unavailable. When a connection is available you can still re-run the scraper to refresh the dataset, which will regenerate `presidents.json`. Git ignores these generated JSON files so your repository stays clean.

**A VERY IMPORTANT NOTE ON ETHICS AND LEGALITY:**

* **Check `robots.txt`:** Always check a website's `robots.txt` file (e.g., `https://example.com/robots.txt`) to see which parts of the site you are allowed to scrape. Respect the rules.
* **Be Gentle:** Don't send too many requests in a short period. You could overwhelm the website's server, which is inconsiderate and may get your IP address blocked. Introduce delays between your requests.
* **Identify Yourself:** Set a user-agent in your request headers that identifies your script or bot.
* **Public Data Only:** Only scrape data that is publicly visible. Do not attempt to scrape information that is behind a login or a paywall.

## The Web Scraping Toolkit

We will use two main libraries for web scraping:

1. **`requests`**: A simple and elegant library for making HTTP requests to download web pages.
2. **`BeautifulSoup`**: A library for parsing HTML and XML documents. It creates a parse tree from the page's source code that you can use to extract data.

## The Scraping Process

1. **Inspect the Page:** Use your web browser's "Inspect" or "View Source" tool to understand the HTML structure of the page you want to scrape. Find the HTML tags (e.g., `<h1>`, `<p>`, `<table>`, `<div>`) that contain the data you need. Look for unique `id` or `class` attributes on those tags.
2. **Download the HTML:** Use the `requests.get(url)` function to download the page's HTML content.
3. **Create a "Soup":** Pass the downloaded HTML to the `BeautifulSoup` constructor to create a parsable object.
4. **Find Your Data:** Use BeautifulSoup's methods, like `find()` and `find_all()`, to locate the specific HTML tags containing your data.
5. **Extract the Text:** Once you have the tags, use the `.get_text()` method to extract the clean text from them.
6. **Structure the Data:** Organize your extracted data into a list or, even better, a Pandas DataFrame.

```python
import requests
from bs4 import BeautifulSoup

url = 'http://example.com' # A simple example page
response = requests.get(url)
soup = BeautifulSoup(response.content, 'html.parser')

# Find the first <h1> tag
header = soup.find('h1').get_text()

# Find all <p> (paragraph) tags
paragraphs = soup.find_all('p')
first_paragraph_text = paragraphs[0].get_text()
```

## 💻 Exercises: Day 30

For these exercises, we will scrape the website `http://books.toscrape.com/`, a site specifically designed for scraping practice.

1. **Scrape Book Titles:**
    * Visit `http://books.toscrape.com/`.
    * Write a script that downloads the page content.
    * Create a BeautifulSoup object from the content.
    * Find all the book titles on the first page. (Hint: Inspect the page to see what tag the titles are in. They are inside `<h3>` tags, within an `<a>` tag).
    * Create a list of all the book titles and print it.

2. **Scrape Book Prices:**
    * On the same page, find all the book prices. (Hint: They are in `p` tags with the class `price_color`).
    * Extract the text of the prices (e.g., "£51.77").
    * Create a list of all the prices and print it.

3. **Create a DataFrame:**
    * Combine your work from the previous two exercises.
    * Create a script that scrapes both the titles and the prices.
    * Store the results in a Pandas DataFrame with two columns: "Title" and "Price".
    * Print the first 5 rows of your new DataFrame using `.head()`.

🎉 **Great job!** Web scraping is a powerful skill that opens up a vast new source of data for your analyses. While it can be complex, mastering the basics of `requests` and `BeautifulSoup` is a huge step forward.
