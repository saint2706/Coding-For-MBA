---
day: 30
title: "Web Scraping"
phase: 3
phaseTitle: "Data Engineering & Web Development"
slug: "web-scraping"
duration: 60
difficulty: "intermediate"
tags: [python, beautifulsoup, requests, scraping]
concepts: [HTTP requests, HTML parsing, data extraction, ethical scraping]
prerequisites: [16, 17]
outcomes: [Fetch web pages with requests, Parse HTML with BeautifulSoup, Extract structured data]
---

# 🎯 Day 30: Web Scraping

> *"The internet is the world's largest database. Learn to read it."*

---

## The "Never-Coded" Bridge

Data doesn't always come in CSVs. Sometimes it's on a website—product prices, stock quotes, news articles. Web scraping lets you collect this data automatically.

---

## The Technical Deep Dive

### Fetching Web Pages

```python
import requests

url = "https://example.com"
response = requests.get(url)

print(response.status_code)  # 200 = success
print(response.text[:500])   # HTML content
```

### Parsing with BeautifulSoup

```python
from bs4 import BeautifulSoup

html = """
<html>
  <body>
    <h1 class="title">Welcome</h1>
    <div class="products">
      <div class="product">
        <span class="name">Laptop</span>
        <span class="price">$999</span>
      </div>
      <div class="product">
        <span class="name">Mouse</span>
        <span class="price">$29</span>
      </div>
    </div>
  </body>
</html>
"""

soup = BeautifulSoup(html, "html.parser")

# Find single element
title = soup.find("h1", class_="title").text

# Find all elements
products = soup.find_all("div", class_="product")
for p in products:
    name = p.find("span", class_="name").text
    price = p.find("span", class_="price").text
    print(f"{name}: {price}")
```

### CSS Selectors

```python
# Alternative to find methods
soup.select("h1.title")[0].text
soup.select("div.product span.name")
soup.select("a[href]")  # All links
```

### Handling Pagination

```python
import requests
from bs4 import BeautifulSoup

base_url = "https://example.com/products?page="
all_products = []

for page in range(1, 6):
    response = requests.get(f"{base_url}{page}")
    soup = BeautifulSoup(response.text, "html.parser")
    
    products = soup.find_all("div", class_="product")
    for p in products:
        all_products.append({
            "name": p.find("span", class_="name").text,
            "price": p.find("span", class_="price").text
        })

print(f"Collected {len(all_products)} products")
```

### Ethical Scraping

```python
import time

# Check robots.txt
# Respect rate limits
# Identify yourself

headers = {"User-Agent": "MyBot/1.0 (contact@example.com)"}

for url in urls:
    response = requests.get(url, headers=headers)
    time.sleep(1)  # Be polite - don't overload servers
```

---

## Hands-on Lab

```python
import requests
from bs4 import BeautifulSoup
import pandas as pd

# Scrape a quotes website
url = "http://quotes.toscrape.com"
response = requests.get(url)
soup = BeautifulSoup(response.text, "html.parser")

quotes = []
for q in soup.find_all("div", class_="quote"):
    text = q.find("span", class_="text").text
    author = q.find("small", class_="author").text
    tags = [t.text for t in q.find_all("a", class_="tag")]
    quotes.append({"text": text, "author": author, "tags": tags})

df = pd.DataFrame(quotes)
print(df.head())
```

---

## Summary

- ✅ `requests` fetches web pages
- ✅ BeautifulSoup parses HTML
- ✅ `find()` and `find_all()` extract data
- ✅ Always scrape ethically

**Tomorrow**: Working with databases.
