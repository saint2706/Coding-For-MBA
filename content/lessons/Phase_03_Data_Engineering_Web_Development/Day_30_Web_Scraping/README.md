---
day: 30
title: "Web Scraping"
phase: 3
phaseTitle: "Data Engineering & Web Development"
slug: "web-scraping"
duration: 55
difficulty: "intermediate"
tags: [python, beautifulsoup, requests, scraping]
concepts: [HTTP requests, HTML parsing, CSS selectors, ethical scraping]
prerequisites: [15]
outcomes: [Fetch web pages with requests, Parse HTML with BeautifulSoup, Extract structured data]
---

# 🎯 Day 30: Web Scraping

> *"When there's no API, there's scraping."*

---

## The "Never-Coded" Bridge

**Imagine you need competitor pricing data.** They have a website with prices, but no API. Or you want to track job postings, news articles, or real estate listings—all displayed on websites, none available as downloads.

**Web scraping fills the gap.** It programmatically extracts data from websites, turning unstructured HTML into structured datasets.

**Real-world applications:**

- **Price monitoring**: Track competitor prices daily
- **Job boards**: Aggregate listings from multiple sites
- **Research**: Collect publicly available data at scale
- **News**: Monitor mentions and sentiment

**Ethical considerations:**

- Respect `robots.txt` files
- Add delays between requests
- Don't overload servers
- Check terms of service

---

## The Technical Deep Dive

### Fetching Pages with Requests

```python
import requests

url = "http://quotes.toscrape.com"
response = requests.get(url)

print(f"Status: {response.status_code}")  # 200 = success
print(f"Content length: {len(response.text)} characters")
print(response.text[:500])
```

### Parsing HTML with BeautifulSoup

```python
from bs4 import BeautifulSoup
import requests

response = requests.get("http://quotes.toscrape.com")
soup = BeautifulSoup(response.text, "html.parser")

# Find elements by tag
title = soup.find("title")
print(f"Title: {title.text}")

# Find all elements of a type
quotes = soup.find_all("span", class_="text")
for quote in quotes[:3]:
    print(quote.text)
```

### CSS Selectors

**CSS Selector Syntax — Quick Reference:**

CSS selectors are patterns that identify HTML elements. They were originally designed for styling web pages, but `BeautifulSoup`'s `.select()` method uses the same syntax for finding elements:

| Selector | Syntax | Example | Matches |
|----------|--------|---------|---------|
| Tag | `tag` | `"span"` | All `<span>` elements |
| Class | `.classname` | `".price"` | Elements with `class="price"` |
| ID | `#idname` | `"#main"` | Element with `id="main"` |
| Descendant | `parent child` | `"div span"` | `<span>` inside a `<div>` |
| Direct child | `parent > child` | `"ul > li"` | `<li>` directly inside `<ul>` |
| Attribute | `[attr=value]` | `'a[href]'` | `<a>` elements that have an `href` |
| Multiple | `s1, s2` | `"h1, h2"` | All `<h1>` and `<h2>` elements |

**Examples:**

```python
# Find all elements with class="price"
prices = soup.select(".price")

# Find all <a> elements inside <div class="product">
links = soup.select("div.product a")

# Find the element with id="main-content"
main = soup.select("#main-content")

# Find all <li> elements directly inside <ul class="nav">
nav_items = soup.select("ul.nav > li")
```

```python
from bs4 import BeautifulSoup
import requests

response = requests.get("http://quotes.toscrape.com")
soup = BeautifulSoup(response.text, "html.parser")

# CSS selector syntax
quotes = soup.select("span.text")
authors = soup.select("small.author")
tags = soup.select("div.tags a.tag")

for quote, author in zip(quotes[:3], authors[:3]):
    print(f'"{quote.text}" — {author.text}')
```

### Extracting Structured Data

```python
from bs4 import BeautifulSoup
import requests
import pandas as pd


def scrape_quotes(url):
    response = requests.get(url)
    soup = BeautifulSoup(response.text, "html.parser")

    data = []
    for div in soup.select("div.quote"):
        quote = div.select_one("span.text").text
        author = div.select_one("small.author").text
        tags = [tag.text for tag in div.select("a.tag")]
        data.append({"quote": quote, "author": author, "tags": tags})

    return data


quotes = scrape_quotes("http://quotes.toscrape.com")
df = pd.DataFrame(quotes)
print(df.head())
```

### Pagination

```python
import time
import requests
from bs4 import BeautifulSoup


def scrape_all_pages(base_url, max_pages=5):
    all_quotes = []

    for page in range(1, max_pages + 1):
        url = f"{base_url}/page/{page}/"
        response = requests.get(url)

        if response.status_code != 200:
            break

        soup = BeautifulSoup(response.text, "html.parser")
        quotes = soup.select("div.quote")

        if not quotes:
            break

        for div in quotes:
            quote = div.select_one("span.text").text
            author = div.select_one("small.author").text
            all_quotes.append({"quote": quote, "author": author})

        print(f"Scraped page {page}: {len(quotes)} quotes")
        time.sleep(1)  # Be polite!

    return all_quotes


quotes = scrape_all_pages("http://quotes.toscrape.com", max_pages=3)
print(f"Total: {len(quotes)} quotes")
```

---

## Senior-Level Insights

### Robust Scraping Practices

```python
import requests
from requests.exceptions import RequestException


def safe_request(url, retries=3):
    headers = {"User-Agent": "Mozilla/5.0 (Educational scraper)"}

    for attempt in range(retries):
        try:
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()
            return response
        except RequestException as e:
            print(f"Attempt {attempt + 1} failed: {e}")
            time.sleep(2**attempt)  # Exponential backoff

    return None
```

### Common Challenges

| Issue              | Solution                       |
| ------------------ | ------------------------------ |
| 403 Forbidden      | Add User-Agent header          |
| Pages load slow    | Add timeout, implement retries |
| JavaScript content | Use Selenium or Playwright     |
| Data in tables     | Use `pd.read_html()`           |
| Rate limiting      | Add delays, respect robots.txt |

### When NOT to Scrape

- When an API exists (use the API!)
- When data is behind login/paywall
- When robots.txt disallows it
- When terms of service prohibit it
- When data is personal/private

### Why `requests` Fails on Modern Websites — and When You Need a Headless Browser

Many modern websites are **Single Page Applications (SPAs)** — they use JavaScript to load content dynamically *after* the initial HTML is delivered. When you use `requests.get(url)`, you receive only the initial HTML shell, and the actual product listings / prices / data are missing because they haven't been loaded yet by JavaScript.

**How to tell if a site uses JavaScript rendering:**

- Right-click → "View Page Source" and the data you see in the browser is NOT in the source
- The URL doesn't change as you click around, but the content changes

**Solutions:**

| Approach | Tool | When to Use |
|----------|------|-------------|
| Static HTML scraping | `requests` + `BeautifulSoup` | Page content is in the raw HTML |
| Headless browser | `selenium` or `playwright` | Content is rendered by JavaScript |
| Official API | `requests` + JSON | Site offers a public API |

**Playwright example (headless browser):**

```python
# pip install playwright && playwright install
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.goto("https://example.com/spa-page")
    page.wait_for_selector(".product-price")  # Wait for JS to render
    html = page.content()
    browser.close()
# Now parse html with BeautifulSoup as normal
```

**Note:** Headless browsing is slower and more resource-intensive than `requests`. Use it only when necessary.

---

## Hands-on Lab

### Exercise 1: Basic Quote Scraper

**Business Scenario:** The Marketing team wants to build an internal database of inspirational quotes for use in weekly newsletters and social media posts. They need a script that automatically scrapes the public quotes website `http://quotes.toscrape.com` and returns a structured list of quotes with their authors and tags.

**Your Task:**

1. Fetch the first page of `http://quotes.toscrape.com`
2. Extract all quote texts, author names, and tags
3. Store the results in a list of dictionaries (or a DataFrame)
4. Print the first 3 results in a formatted way

**Expected Output:**

```
Quote 1:
  Text: "The world as we have created it is a process of our thinking..."
  Author: Albert Einstein
  Tags: ['change', 'deep-thoughts', 'thinking', 'world']

Quote 2:
  Text: "It is our choices, Harry, that show what we truly are..."
  Author: J.K. Rowling
  Tags: ['abilities', 'choices']

Quote 3:
  Text: "There are only two ways to live your life..."
  Author: Albert Einstein
  Tags: ['inspirational', 'life', 'live', 'miracle', 'miracles']

Total quotes found: 10
```

```python
from bs4 import BeautifulSoup
import requests
import pandas as pd


def scrape_quotes_page(url):
    response = requests.get(url)
    soup = BeautifulSoup(response.text, "html.parser")

    data = []
    for div in soup.select("div.quote"):
        data.append(
            {
                "text": div.select_one("span.text").text.strip('"" '),
                "author": div.select_one("small.author").text,
                "tags": ", ".join([t.text for t in div.select("a.tag")]),
            }
        )
    return data


quotes = scrape_quotes_page("http://quotes.toscrape.com")
df = pd.DataFrame(quotes)
df.to_csv("quotes.csv", index=False)
print(df)
```

### Exercise 2: Multi-Page Scraper

**Business Scenario:** Marketing needs ALL quotes from the website (which spans multiple pages), not just the first page. The script must follow pagination links and stop when there are no more pages.

**Your Task:**

1. Start at `http://quotes.toscrape.com`
2. After scraping each page, look for the "Next" button and follow the link
3. Continue until there is no "Next" page (or until you've scraped 5 pages max to be polite)
4. Count total quotes collected and print the unique authors found

**Expected Output:**

```
Scraping page 1...
Scraping page 2...
Scraping page 3...
...
Scraping page 10...
No more pages found.

Total quotes collected: 100
Unique authors: 52
Top 3 authors by quote count:
  Albert Einstein: 10
  J.K. Rowling: 7
  Mark Twain: 6
```

```python
import time
import requests
from bs4 import BeautifulSoup
import pandas as pd


def scrape_all_quotes(max_pages=5):
    all_data = []
    base_url = "http://quotes.toscrape.com"

    for page in range(1, max_pages + 1):
        url = f"{base_url}/page/{page}/"
        response = requests.get(url, timeout=10)

        if response.status_code != 200:
            break

        soup = BeautifulSoup(response.text, "html.parser")
        quotes = soup.select("div.quote")

        if not quotes:
            break

        for div in quotes:
            all_data.append(
                {
                    "text": div.select_one("span.text").text,
                    "author": div.select_one("small.author").text,
                }
            )

        print(f"Page {page}: {len(quotes)} quotes")
        time.sleep(1)

    return pd.DataFrame(all_data)


df = scrape_all_quotes(3)
print(f"Total scraped: {len(df)}")
print(df.head())
```

### Exercise 3: Table Extraction

**Business Scenario:** An analyst needs to extract a financial comparison table from a public webpage and load it into a Pandas DataFrame for further analysis. HTML tables are ubiquitous in financial reporting, economic databases, and Wikipedia — `pd.read_html()` is the fastest way to extract them.

**Your Task:**

1. Use `pd.read_html()` to extract a table from a public URL (you can use `https://en.wikipedia.org/wiki/List_of_countries_by_GDP_(nominal)` or any table-heavy page)
2. Select the most relevant table from the list returned
3. Clean the column names (strip whitespace, rename as needed)
4. Display the first 5 rows

**Expected Output:**

```
Tables found on page: 4
Using table index 1 (first main data table):

   Rank   Country/Territory       IMF Estimate
0     1   United States           28,781,083
1     2   China                   18,532,633
2     3   Germany                  4,591,100
3     4   Japan                    4,110,452
4     5   India                    3,937,011
```

```python
import pandas as pd

# pandas can scrape HTML tables directly!
url = "https://en.wikipedia.org/wiki/List_of_countries_by_GDP_(nominal)"
tables = pd.read_html(url)

# Usually multiple tables on page
print(f"Found {len(tables)} tables")

# First table is usually what we want
gdp_table = tables[0]
print(gdp_table.head())
```

### Reliability & Maintainability Tasks

- Add retry + exponential backoff to every network request and log each retry attempt with URL, status, and wait time.
- Implement schema drift guards: if expected selectors are missing, write the raw HTML snapshot to a `debug/` folder and raise a descriptive parsing error.
- Add an ethics checklist prompt before each run: review `robots.txt`, terms of service, crawl frequency, and contact info in User-Agent.

### Exercise 4: Failure Injection — Broken HTML Layout

Simulate a controlled breakage by changing one critical CSS selector (for example, `span.text` → `span.quote-text`) and run your scraper.

Your debugging goals:

1. Detect the selector failure quickly with explicit assertions.
2. Capture a sample failing page for investigation.
3. Patch the extractor to support both old and new selector variants without silently dropping rows.

---

## Mastery Check

### Question 1: User-Agent

Why add a User-Agent header to requests?

<details>
<summary>Click for Answer</summary>

Some sites block requests without User-Agent (looks like bots). Adding one identifies your scraper and improves success rate.

```python
headers = {"User-Agent": "Mozilla/5.0 (Educational scraper)"}
requests.get(url, headers=headers)
```

</details>

### Question 2: Rate Limiting

Your scraper gets blocked after 50 requests. What's likely happening and how do you fix it?

<details>
<summary>Click for Answer</summary>

**Problem**: Requesting too fast, triggering rate limits

**Fix**: Add delays between requests

```python
time.sleep(1)  # Wait 1 second between requests
```

Also: Use exponential backoff, respect robots.txt, limit concurrent connections

</details>

### Question 3: JavaScript Content

Page loads but content is missing. Browser shows it, but requests.get() doesn't. Why?

<details>
<summary>Click for Answer</summary>

Content is loaded by JavaScript after page load. `requests` only gets initial HTML.

**Solutions**:

- Use Selenium or Playwright (browser automation)
- Check for API calls in Network tab
- Look for data in page's `<script>` tags

</details>

### Question 4: Error Handling Bug

This code crashes randomly. What's missing?

```python
response = requests.get(url)
data = response.json()
```

<details>
<summary>Click for Answer</summary>

No error handling. Add:

```python
try:
    response = requests.get(url, timeout=10)
    response.raise_for_status()
    data = response.json()
except requests.RequestException as e:
    print(f"Request failed: {e}")
    data = None
```

</details>

### Question 5: Ethics Question

You want to scrape a competitor's product catalog updated hourly. What should you check first?

<details>
<summary>Click for Answer</summary>

1. **robots.txt**: Check `competitor.com/robots.txt` for disallowed paths
2. **Terms of Service**: Many prohibit automated access
3. **Rate limits**: Don't overload their servers
4. **Public vs. Private data**: Only scrape publicly accessible pages
5. **Legal**: Some jurisdictions have laws against certain scraping

</details>

---

## Summary

- ✅ Use `requests` to fetch pages, `BeautifulSoup` to parse
- ✅ CSS selectors (`soup.select()`) for precise element targeting
- ✅ Handle pagination with loops and delays
- ✅ Add error handling and retries
- ✅ Respect robots.txt and rate limits

**Tomorrow**: Databases with SQL for persistent data storage.
