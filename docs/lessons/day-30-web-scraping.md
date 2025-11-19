---
title: 'Day 30: Web Scraping - Extracting Data from the Web'
tags:
  - Data
  - Web
---

Sometimes, the data you need isn't available in a clean CSV file or through an API. It's simply
displayed on a website. **Web scraping** is the process of automatically downloading the HTML code
of a web page and extracting useful information from it.

This is an incredibly powerful tool for a business analyst, allowing you to gather competitive
intelligence, track news sentiment, collect product prices, and much more.

## 📦 Working Offline

If you do not have internet access, you can still explore the examples in this lesson. The folder
includes a curated `presidents.csv` containing a snapshot of key columns—number, name, party, term
dates, and vice presidents—for every U.S. president through Joe Biden. The exercise scripts will
look for this local file first, so you can experiment with parsing and analysis even when the
Wikipedia page is unavailable. When a connection is available you can still re-run the scraper to
refresh the dataset, which will regenerate `presidents.json`. Git ignores these generated JSON files
so your repository stays clean.

**A VERY IMPORTANT NOTE ON ETHICS AND LEGALITY:**

- **Check `robots.txt`:** Always check a website's `robots.txt` file (e.g.,
  `https://example.com/robots.txt`) to see which parts of the site you are allowed to scrape.
  Respect the rules.
- **Be Gentle:** Don't send too many requests in a short period. You could overwhelm the website's
  server, which is inconsiderate and may get your IP address blocked. Introduce delays between your
  requests.
- **Identify Yourself:** Set a user-agent in your request headers that identifies your script or
  bot.
- **Public Data Only:** Only scrape data that is publicly visible. Do not attempt to scrape
  information that is behind a login or a paywall.

## The Web Scraping Toolkit

We will use two main libraries for web scraping:

1. **`requests`**: A simple and elegant library for making HTTP requests to download web pages.
1. **`BeautifulSoup`**: A library for parsing HTML and XML documents. It creates a parse tree from
   the page's source code that you can use to extract data.

## The Scraping Process

1. **Inspect the Page:** Use your web browser's "Inspect" or "View Source" tool to understand the
   HTML structure of the page you want to scrape. Find the HTML tags (e.g., `<h1>`, `<p>`,
   `<table>`, `<div>`) that contain the data you need. Look for unique `id` or `class` attributes on
   those tags.
1. **Download the HTML:** Use the `requests.get(url)` function to download the page's HTML content.
1. **Create a "Soup":** Pass the downloaded HTML to the `BeautifulSoup` constructor to create a
   parsable object.
1. **Find Your Data:** Use BeautifulSoup's methods, like `find()` and `find_all()`, to locate the
   specific HTML tags containing your data.
1. **Extract the Text:** Once you have the tags, use the `.get_text()` method to extract the clean
   text from them.
1. **Structure the Data:** Organize your extracted data into a list or, even better, a Pandas
   DataFrame.

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

## 🔬 Profiling the Scraper

Profiling helps you spot whether networking or HTML parsing is the bottleneck. Two helper commands
wire into the shared profiler:

```bash
python Day_30_Web_Scraping/profile_web_scraping.py --mode cprofile
python Day_30_Web_Scraping/profile_web_scraping.py --mode timeit --local-html Day_30_Web_Scraping/books_sample.html --repeat 5 --number 3
```

The `cProfile` output shows that almost all time is spent inside `requests.Session.get`—network I/O
dominates the runtime, so batching requests or caching responses offers the biggest
win.【ad83b3†L1-L29】 For deterministic timing, use the saved `books_sample.html` page (refresh it
with `curl http://books.toscrape.com/ -o Day_30_Web_Scraping/books_sample.html`). Parsing that local
file takes ~0.03 seconds per iteration across five repeats, letting you focus on BeautifulSoup
performance without hitting the network.【de293a†L1-L7】 Reusing a single `requests.Session` and
avoiding repeated downloads can dramatically cut the cost when scraping multiple pages.

## 💻 Exercises: Day 30

For these exercises, we will scrape the website `http://books.toscrape.com/`, a site specifically
designed for scraping practice.

1. **Scrape Book Titles:**

   - Visit `http://books.toscrape.com/`.
   - Write a script that downloads the page content.
   - Create a BeautifulSoup object from the content.
   - Find all the book titles on the first page. (Hint: Inspect the page to see what tag the titles
     are in. They are inside `<h3>` tags, within an `<a>` tag).
   - Create a list of all the book titles and print it.

1. **Scrape Book Prices:**

   - On the same page, find all the book prices. (Hint: They are in `p` tags with the class
     `price_color`).
   - Extract the text of the prices (e.g., "£51.77").
   - Create a list of all the prices and print it.

1. **Create a DataFrame:**

   - Combine your work from the previous two exercises.
   - Create a script that scrapes both the titles and the prices.
   - Store the results in a Pandas DataFrame with two columns: "Title" and "Price".
   - Print the first 5 rows of your new DataFrame using `.head()`.

🎉 **Great job!** Web scraping is a powerful skill that opens up a vast new source of data for your
analyses. While it can be complex, mastering the basics of `requests` and `BeautifulSoup` is a huge
step forward.

<!-- LESSON_FOOTER_START -->

______________________________________________________________________

**Previous:** [Day 29 – Day 29: Interactive Visualization with Plotly](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_29_Interactive_Visualization/README.md) • **Next:** [Day 31 – Day 31: Working with Databases in Python](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_31_Databases/README.md)

_You are on lesson 30 of 108._

<!-- LESSON_FOOTER_END -->

## Additional Materials

- **presidents.ipynb**
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_30_Web_Scraping/presidents.ipynb){ .md-button }
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_30_Web_Scraping/presidents.ipynb){ .md-button .md-button--primary }
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_30_Web_Scraping/presidents.ipynb){ .md-button }
- **profile_web_scraping.ipynb**
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_30_Web_Scraping/profile_web_scraping.ipynb){ .md-button }
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_30_Web_Scraping/profile_web_scraping.ipynb){ .md-button .md-button--primary }
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_30_Web_Scraping/profile_web_scraping.ipynb){ .md-button }
- **solutions.ipynb**
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_30_Web_Scraping/solutions.ipynb){ .md-button }
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_30_Web_Scraping/solutions.ipynb){ .md-button .md-button--primary }
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_30_Web_Scraping/solutions.ipynb){ .md-button }
- **web_scraping.ipynb**
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_30_Web_Scraping/web_scraping.ipynb){ .md-button }
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_30_Web_Scraping/web_scraping.ipynb){ .md-button .md-button--primary }
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_30_Web_Scraping/web_scraping.ipynb){ .md-button }
- **web_scraping_bu.ipynb**
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_30_Web_Scraping/web_scraping_bu.ipynb){ .md-button }
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_30_Web_Scraping/web_scraping_bu.ipynb){ .md-button .md-button--primary }
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_30_Web_Scraping/web_scraping_bu.ipynb){ .md-button }

???+ example "presidents.py"
[View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_30_Web_Scraping/presidents.py)

````
```python title="presidents.py"
"""Day 30: Web Scraping Presidents Data.

This script prefers locally curated data so learners can work offline, falls back
to a lightweight mock dataset, and only reaches out to Wikipedia when it needs to
refresh the snapshot.
"""

import csv
import json
from pathlib import Path
from typing import Optional

import pandas as pd
import requests

MOCK_PRESIDENTS_DATA = [
    {
        "number": "1",
        "president": "George Washington",
        "term_start": "1789-04-30",
        "term_end": "1797-03-04",
        "party": "Independent",
        "vice_president": "John Adams",
    },
    {
        "number": "2",
        "president": "John Adams",
        "term_start": "1797-03-04",
        "term_end": "1801-03-04",
        "party": "Federalist",
        "vice_president": "Thomas Jefferson",
    },
    {
        "number": "3",
        "president": "Thomas Jefferson",
        "term_start": "1801-03-04",
        "term_end": "1809-03-04",
        "party": "Democratic-Republican",
        "vice_president": "Aaron Burr; George Clinton",
    },
    {
        "number": "4",
        "president": "James Madison",
        "term_start": "1809-03-04",
        "term_end": "1817-03-04",
        "party": "Democratic-Republican",
        "vice_president": "George Clinton; Elbridge Gerry",
    },
    {
        "number": "5",
        "president": "James Monroe",
        "term_start": "1817-03-04",
        "term_end": "1825-03-04",
        "party": "Democratic-Republican",
        "vice_president": "Daniel D. Tompkins",
    },
    {
        "number": "6",
        "president": "John Quincy Adams",
        "term_start": "1825-03-04",
        "term_end": "1829-03-04",
        "party": "Democratic-Republican",
        "vice_president": "John C. Calhoun",
    },
    {
        "number": "7",
        "president": "Andrew Jackson",
        "term_start": "1829-03-04",
        "term_end": "1837-03-04",
        "party": "Democratic",
        "vice_president": "John C. Calhoun; Martin Van Buren",
    },
    {
        "number": "8",
        "president": "Martin Van Buren",
        "term_start": "1837-03-04",
        "term_end": "1841-03-04",
        "party": "Democratic",
        "vice_president": "Richard Mentor Johnson",
    },
    {
        "number": "9",
        "president": "William Henry Harrison",
        "term_start": "1841-03-04",
        "term_end": "1841-04-04",
        "party": "Whig",
        "vice_president": "John Tyler",
    },
    {
        "number": "10",
        "president": "John Tyler",
        "term_start": "1841-04-04",
        "term_end": "1845-03-04",
        "party": "Whig (expelled)",
        "vice_president": "None",
    },
]


def scrape_presidents_data(url: str) -> Optional[pd.DataFrame]:
    """
    Scrapes the list of US presidents from a Wikipedia page.

    Args:
        url (str): The URL of the Wikipedia page.

    Returns:
        pd.DataFrame: A DataFrame containing the presidents' data.
    """
    try:
        print(f"🌐 Connecting to {url}...")
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()

        print("📊 Parsing HTML tables...")
        # Use response.text instead of response.content for pd.read_html
        tables = pd.read_html(response.text)

        if not tables:
            print("❌ No tables found on the page")
            return None

        print(f"✅ Found {len(tables)} tables on the page")

        # The first table is typically the one we want
        presidents_df = tables[0].copy()

        print(f"📋 Original data shape: {presidents_df.shape}")

        # Clean up the data
        # Drop the last row if it appears to be a footnote (common in Wikipedia tables)
        if len(presidents_df) > 1:
            presidents_df = presidents_df.iloc[:-1].copy()

        # Replace empty strings with NaN
        presidents_df.replace("", float("NaN"), inplace=True)
        presidents_df.replace(
            "—", float("NaN"), inplace=True
        )  # Common dash used in Wikipedia

        # Drop columns that are all NaN
        presidents_df.dropna(how="all", axis=1, inplace=True)

        print(f"📋 Cleaned data shape: {presidents_df.shape}")
        print(f"📋 Columns: {list(presidents_df.columns)}")

        return presidents_df
    except requests.exceptions.Timeout:
        print("❌ Request timed out. The server might be slow.")
        return None
    except requests.exceptions.ConnectionError:
        print("❌ Connection error. Please check your internet connection.")
        return None
    except requests.exceptions.HTTPError as e:
        print(f"❌ HTTP error occurred: {e}")
        return None
    except requests.exceptions.RequestException as e:
        print(f"❌ Error downloading the page: {e}")
        return None
    except (IndexError, KeyError) as e:
        print(f"❌ Error parsing the table: {e}")
        print("💡 The website structure may have changed.")
        return None
    except Exception as e:
        print(f"❌ Unexpected error occurred: {e}")
        return None


def convert_csv_to_json(csv_file_path: str, json_file_path: str) -> None:
    """
    Converts a CSV file to a JSON file.

    The JSON file will have the first column of the CSV as keys.

    Args:
        csv_file_path (str): The path to the input CSV file.
        json_file_path (str): The path to the output JSON file.
    """
    data = {}
    try:
        print(f"📄 Converting {csv_file_path} to {json_file_path}...")
        with open(csv_file_path, encoding="utf-8") as csv_file:
            csv_reader = csv.DictReader(csv_file)

            # Check if fieldnames exist and get the first column
            if not csv_reader.fieldnames:
                print("❌ No column headers found in CSV file")
                return

            key_column = csv_reader.fieldnames[0]
            print(f"📊 Using '{key_column}' as the key column")

            row_count = 0
            for row in csv_reader:
                key = row[key_column]
                if key:  # Only add rows with non-empty keys
                    data[key] = row
                    row_count += 1

            print(f"✅ Processed {row_count} records")

        with open(json_file_path, "w", encoding="utf-8") as json_file:
            json.dump(data, json_file, indent=4, ensure_ascii=False)

        print(f"✅ Successfully converted to JSON: {json_file_path}")
    except FileNotFoundError:
        print(f"❌ Error: The file {csv_file_path} was not found.")
    except PermissionError:
        print("❌ Error: Permission denied when accessing files.")
    except Exception as e:
        print(f"❌ An error occurred during conversion: {e}")


def save_mock_json(json_file_path: Path) -> None:
    """Persist the lightweight mock dataset to a JSON file."""

    print("📄 Local CSV not found. Using built-in mock dataset.")
    data = {item["number"]: item for item in MOCK_PRESIDENTS_DATA}
    with json_file_path.open("w", encoding="utf-8") as json_file:
        json.dump(data, json_file, indent=4, ensure_ascii=False)
    print(f"✅ Mock JSON file created: {json_file_path}")


def main():
    """
    Main function to scrape, process, and save the presidents' data.
    """
    print("🕸️  Day 30: Web Scraping Presidents Data")
    print("🏛️  Scraping US Presidents data from Wikipedia")
    print("=" * 50)

    # URL of the Wikipedia page with the list of US presidents
    presidents_url = (
        "https://en.wikipedia.org/wiki/List_of_presidents_of_the_United_States"
    )

    # Define file paths relative to the script's location
    # This makes the script more portable
    base_dir = Path(__file__).resolve().parent
    csv_path = base_dir / "presidents.csv"
    json_path = base_dir / "presidents.json"
    # The JSON outputs are ignored by git so learners can regenerate them
    # locally without creating untracked files.

    print(f"📁 Output files will be saved to: {base_dir}")

    # Scrape the data
    if csv_path.exists():
        print("📄 Found curated CSV. Converting to JSON without scraping.")
        convert_csv_to_json(str(csv_path), str(json_path))
        return

    # If the curated CSV is missing, provide learners with the mock dataset first.
    save_mock_json(json_path)

    presidents_df = scrape_presidents_data(presidents_url)

    if presidents_df is not None:
        try:
            # Save the DataFrame to a temporary CSV file, without the index
            temp_csv_path = base_dir / "presidents_download.csv"
            print("💾 Saving scraped data to a temporary CSV...")
            presidents_df.to_csv(temp_csv_path, index=False, encoding="utf-8")
            print(f"✅ CSV file created: {temp_csv_path}")

            # Convert the CSV to JSON
            convert_csv_to_json(str(temp_csv_path), str(json_path))

            # Remove the temporary CSV file
            try:
                temp_csv_path.unlink()
                print("🧹 Removed temporary CSV file")
            except OSError as e:
                print(
                    f"⚠️  Warning: Could not remove temporary file {temp_csv_path}: {e}"
                )

            # Verify the JSON file was created and show some info
            if json_path.exists():
                file_size = json_path.stat().st_size
                print(f"\n🎉 Success! Created '{json_path}' ({file_size:,} bytes)")

                # Show a preview of the data
                try:
                    with json_path.open("r", encoding="utf-8") as f:
                        data = json.load(f)
                        print(f"📊 Total presidents in dataset: {len(data)}")
                        if data:
                            first_key = next(iter(data))
                            print(
                                f"📋 Sample entry keys: {list(data[first_key].keys())[:5]}..."
                            )
                except Exception as e:
                    print(f"⚠️  Could not preview JSON data: {e}")
            else:
                print("❌ JSON file was not created successfully")

        except Exception as e:
            print(f"❌ Error in main processing: {e}")
    else:
        print("❌ Failed to scrape presidents data.")
        print("💡 This could be due to:")
        print("   • Network connectivity issues")
        print("   • Wikipedia page structure changes")
        print("   • Rate limiting on Wikipedia")
        print("   • Server blocking the request")
        print("   • Temporary website unavailability")
        print("📦 Continuing with the mock dataset so you can keep practicing offline.")


if __name__ == "__main__":
    main()
```
````

???+ example "profile_web_scraping.py"
[View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_30_Web_Scraping/profile_web_scraping.py)

````
```python title="profile_web_scraping.py"
"""Profile the book scraping workflow used in the web scraping lesson."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path
from typing import Callable

try:
    from mypackage.profiling import print_report, profile_callable
except ImportError:
    PROJECT_ROOT = Path(__file__).resolve().parents[1]
    if str(PROJECT_ROOT) not in sys.path:
        sys.path.append(str(PROJECT_ROOT))
    from mypackage.profiling import print_report, profile_callable

try:  # pragma: no cover - runtime guard for direct execution
    from .web_scraping import URL, process_book_data, scrape_books
except ImportError:  # pragma: no cover - allows ``python profile_web_scraping.py``
    CURRENT_DIR = Path(__file__).resolve().parent
    if str(CURRENT_DIR) not in sys.path:
        sys.path.append(str(CURRENT_DIR))
    from web_scraping import URL, process_book_data, scrape_books  # type: ignore


def build_pipeline(url: str, html_path: Path | None) -> Callable[[], None]:
    """Return a callable that performs the scraping workflow."""

    if html_path is not None:
        html_bytes = html_path.read_bytes()

        def pipeline() -> None:
            process_book_data(html_bytes)

    else:

        def pipeline() -> None:
            scrape_books(url)

    return pipeline


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--mode",
        choices=("cprofile", "timeit"),
        default="cprofile",
        help="Profiling backend to use (default: cprofile)",
    )
    parser.add_argument(
        "--url",
        default=URL,
        help="Target URL to scrape when not using --local-html",
    )
    parser.add_argument(
        "--local-html",
        type=Path,
        help="Optional path to a saved HTML page for offline profiling",
    )
    parser.add_argument(
        "--repeat",
        type=int,
        default=5,
        help="Number of timing repeats when --mode=timeit",
    )
    parser.add_argument(
        "--number",
        type=int,
        default=1,
        help="Number of calls per repeat when --mode=timeit",
    )
    args = parser.parse_args()

    if args.mode == "timeit" and args.local_html is None:
        raise SystemExit(
            "--mode=timeit requires --local-html to avoid repeated network calls"
        )

    pipeline = build_pipeline(url=args.url, html_path=args.local_html)
    profile_report, timing_report = profile_callable(
        pipeline,
        mode=args.mode,
        repeat=args.repeat,
        number=args.number,
    )
    print_report(profile_report=profile_report, timing_report=timing_report)


if __name__ == "__main__":
    main()
```
````

???+ example "solutions.py"
[View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_30_Web_Scraping/solutions.py)

````
```python title="solutions.py"
"""
Day 30: Solutions to Exercises
"""

import bs4  # Add this import for type checking
import pandas as pd
import requests
from bs4 import BeautifulSoup

URL = "http://books.toscrape.com/"
headers = {"User-Agent": "Mozilla/5.0"}

try:
    response = requests.get(URL, headers=headers)
    response.raise_for_status()
    soup = BeautifulSoup(response.content, "html.parser")
    print("Successfully connected to books.toscrape.com")
except requests.exceptions.RequestException as e:
    print(f"Could not connect to the website: {e}")
    soup = None

if soup:
    # --- Exercise 1: Scrape Book Titles ---
    print("\n--- Solution to Exercise 1 ---")

    # Find all <h3> tags, then find the <a> tag inside, and get its 'title' attribute
    title_tags = soup.find_all("h3")
    titles = []
    for tag in title_tags:
        if isinstance(tag, bs4.element.Tag):
            a_tag = tag.find("a")
            if isinstance(a_tag, bs4.element.Tag) and "title" in a_tag.attrs:
                titles.append(a_tag.get("title"))

    print("Found the following titles:")
    # Print first 5 for brevity
    for title in titles[:5]:
        print(f"- {title}")
    print("-" * 20)

    # --- Exercise 2: Scrape Book Prices ---
    print("\n--- Solution to Exercise 2 ---")

    # Find all <p> tags that have the class 'price_color'
    price_tags = soup.find_all("p", class_="price_color")
    prices = [tag.get_text() for tag in price_tags]

    print("Found the following prices:")
    # Print first 5 for brevity
    for price in prices[:5]:
        print(f"- {price}")
    print("-" * 20)

    # --- Exercise 3: Create a DataFrame ---
    print("\n--- Solution to Exercise 3 ---")

    # Check if we have the same number of titles and prices
    if len(titles) == len(prices):
        book_df = pd.DataFrame({"Title": titles, "Price": prices})
        print("Created DataFrame from scraped data:")
        print(book_df.head())
    else:
        print(
            "Mismatch between number of titles and prices found. Cannot create DataFrame."
        )
    print("-" * 20)

else:
    print("\nSkipping exercises as the website could not be scraped.")
```
````

???+ example "web_scraping.py"
[View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_30_Web_Scraping/web_scraping.py)

````
```python title="web_scraping.py"
"""
Day 30: Web Scraping in Practice

This script demonstrates the fundamentals of web scraping by
extracting book titles and prices from a practice website.

This educational example shows how to:
- Make HTTP requests with proper headers
- Parse HTML content with BeautifulSoup
- Handle errors gracefully
- Extract and clean data
- Structure data in pandas DataFrame

Author: 50 Days of Python Course
Purpose: Educational example for MBA students
"""

import time
from typing import Any, Dict, Optional, Tuple

import bs4
import pandas as pd
import requests
from bs4 import BeautifulSoup

# The URL of the website we want to scrape
# This site is specifically designed for scraping practice.
URL = "http://books.toscrape.com/"


class ScrapingError(Exception):
    """Custom exception for scraping errors."""


def scrape_books(
    url: str, session: Optional[requests.Session] = None
) -> Tuple[pd.DataFrame, pd.DataFrame, Dict[str, Any]]:
    """
    Scrape book data from the given URL.

    Args:
        url (str): The URL to scrape

    Returns:
        Tuple containing the raw scraped DataFrame, the cleaned DataFrame, and
        a dictionary of summary statistics.
    """
    # --- 1. Download the HTML Content ---
    # Use requests.get() to download the page.
    # It's good practice to include a 'User-Agent' header to identify your script.
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }

    session = session or requests.Session()

    try:
        response = session.get(url, headers=headers, timeout=10)
        response.raise_for_status()
    except requests.exceptions.Timeout:
        raise
    except requests.exceptions.ConnectionError:
        raise
    except requests.exceptions.HTTPError:
        raise
    except requests.exceptions.RequestException as exc:
        raise ScrapingError("Error downloading the page") from exc

    # If we get here, the request was successful
    return process_book_data(response.content)


def process_book_data(
    html_content: bytes,
) -> Tuple[pd.DataFrame, pd.DataFrame, Dict[str, Any]]:
    """
    Process the HTML response and extract book data.

    Args:
        response: The HTTP response object

    Returns:
        Tuple containing the raw scraped DataFrame, the cleaned DataFrame, and
        a dictionary of summary statistics.
    """
    # --- 2. Create a BeautifulSoup Object ---
    # This object parses the HTML content and makes it searchable.
    soup = BeautifulSoup(html_content, "html.parser")

    # --- 3. Find and Extract Data ---
    # We inspected the page and found that book information is within <article> tags with the class 'product_pod'
    books = soup.find_all("article", class_="product_pod")

    if not books:
        raise ValueError("No books found in the provided HTML content")

    titles = []
    prices = []

    # Loop through each book found on the page
    for book in books:
        # Type check to ensure book is a Tag
        if not isinstance(book, bs4.element.Tag):
            continue

        # The title is in an 'a' tag within an 'h3' tag.
        # We access the 'title' attribute of the 'a' tag.
        h3_tag = book.find("h3")
        if isinstance(h3_tag, bs4.element.Tag):
            a_tag = h3_tag.find("a")
            if isinstance(a_tag, bs4.element.Tag):
                title = a_tag.get("title")
                titles.append(str(title) if title else "N/A")
            else:
                titles.append("N/A")
        else:
            titles.append("N/A")

        # The price is in a 'p' tag with the class 'price_color'
        price_tag = book.find("p", attrs={"class": "price_color"})
        if isinstance(price_tag, bs4.element.Tag):
            price_text = price_tag.get_text(strip=True)
            prices.append(price_text)
        else:
            prices.append("N/A")

    # --- 4. Structure the Data in a DataFrame ---
    if not titles or not prices or len(titles) != len(prices):
        raise ValueError("Mismatch between titles and prices in the HTML content")

    book_data = pd.DataFrame({"Title": titles, "Price": prices})

    # --- 5. Data Cleaning (Bonus) ---
    clean_data = book_data.copy()
    clean_data["Price_Float"] = pd.to_numeric(
        clean_data["Price"].str.replace("£", "", regex=False), errors="coerce"
    )
    clean_data = clean_data.dropna(subset=["Price_Float"]).copy()

    if clean_data.empty:
        return book_data, clean_data, {}

    # --- 6. Basic Analysis ---
    price_series = clean_data["Price_Float"]
    analysis: Dict[str, Any] = {
        "average_price": float(price_series.mean()),
        "min_price": float(price_series.min()),
        "max_price": float(price_series.max()),
        "count": int(len(clean_data)),
    }

    most_expensive = clean_data.loc[price_series.idxmax()]
    cheapest = clean_data.loc[price_series.idxmin()]

    analysis["most_expensive_title"] = most_expensive["Title"]
    analysis["most_expensive_price"] = most_expensive["Price"]
    analysis["cheapest_title"] = cheapest["Title"]
    analysis["cheapest_price"] = cheapest["Price"]

    return book_data, clean_data, analysis


def main():
    """
    Main function to demonstrate web scraping workflow.
    """
    print("🕸️  Day 30: Web Scraping Demonstration")
    print("📚 Scraping book data from books.toscrape.com")
    print("=" * 50)

    # Add a small delay to be respectful to the server
    print("⏳ Starting scraping process...")
    time.sleep(1)

    # Execute the scraping
    try:
        print(f"🌐 Connecting to {URL}...")
        raw_df, clean_df, analysis = scrape_books(URL)
    except requests.exceptions.Timeout:
        print("❌ Request timed out. The server might be slow or unresponsive.")
        return
    except requests.exceptions.ConnectionError:
        print("❌ Connection error. Please check your internet connection.")
        return
    except requests.exceptions.HTTPError as exc:
        print(f"❌ HTTP error occurred: {exc}")
        return
    except ScrapingError as exc:
        print(f"❌ {exc}")
        print("💡 This could be due to:")
        print("   • Network connectivity issues")
        print("   • Website being temporarily unavailable")
        print("   • Blocked by website's anti-bot protection")
        print("   • URL has changed or is incorrect")
        return
    except ValueError as exc:
        print(f"❌ {exc}")
        print("💡 The website structure may have changed. Try updating the parser.")
        return

    print("✅ Successfully downloaded the content!")
    print(f"📊 Total books scraped: {len(raw_df)}")

    if clean_df.empty:
        print("⚠️  No valid price data found for analysis.")
        return

    print("\n--- Sample of Scraped Book Data ---")
    print(raw_df.head(10))

    print("\n--- Cleaned Price Data ---")
    print(clean_df.head(10))

    print("\n📈 Basic Price Analysis:")
    print(f"   Average price: £{analysis['average_price']:.2f}")
    print(f"   Minimum price: £{analysis['min_price']:.2f}")
    print(f"   Maximum price: £{analysis['max_price']:.2f}")
    print(f"   Number of books: {analysis['count']}")
    print(
        f"💰 Most expensive: '{analysis['most_expensive_title']}' - {analysis['most_expensive_price']}"
    )
    print(f"💸 Cheapest: '{analysis['cheapest_title']}' - {analysis['cheapest_price']}")

    print("\n💡 Next steps you could take:")
    print("   • Save data to CSV: clean_df.to_csv('books.csv', index=False)")
    print("   • Filter books by price range")
    print("   • Scrape additional pages for more data")
    print("   • Add more data fields (ratings, availability, etc.)")


if __name__ == "__main__":
    main()
```
````

???+ example "web_scraping_bu.py"
[View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_30_Web_Scraping/web_scraping_bu.py)

````
```python title="web_scraping_bu.py"
"""Utilities for scraping the Boston University facts and stats page."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Iterable, List, MutableMapping, Optional, Sequence

import requests
from bs4 import BeautifulSoup

DEFAULT_URL = "https://www.bu.edu/president/boston-university-facts-stats/"
OUTPUT_FILENAME = "scraped_exercise_1.json"


def _parse_tables(tables: Iterable[BeautifulSoup]) -> List[MutableMapping[str, str]]:
    """Convert BeautifulSoup table fragments into dictionaries.

    The parsing logic intentionally mirrors the original script to avoid
    introducing behavioural changes while allowing the scraping work to be
    orchestrated from dedicated functions.
    """

    parsed_tables: List[MutableMapping[str, str]] = []

    for table in tables:
        keys: List[str] = []
        values: List[str] = []
        temp_dict: MutableMapping[str, str] = {}

        table_str = str(table)
        category = table_str[table_str.find("<h5>") + 4 : table_str.find("</h5>")]
        temp_dict["Category"] = category

        all_key_start_indexes = [
            x + 7 for x in range(len(table_str)) if table_str.startswith('"text">', x)
        ]
        all_key_end_indexes = [
            x for x in range(len(table_str)) if table_str.startswith("</p>", x)
        ]

        for start_index, end_index in zip(all_key_start_indexes, all_key_end_indexes):
            keys.append(table_str[start_index:end_index])

        all_values_start_indexes: List[int] = []
        for idx in range(len(table_str)):
            if table_str.startswith('value">', idx):
                all_values_start_indexes.append(idx + 7)
            if table_str.startswith('value-text">', idx):
                all_values_start_indexes.append(idx + 12)

        all_values_end_indexes = [
            x for x in range(len(table_str)) if table_str.startswith("</span>", x)
        ]

        for start_index, end_index in zip(
            all_values_start_indexes, all_values_end_indexes
        ):
            values.append(table_str[start_index:end_index])

        for key, value in zip(keys, values):
            temp_dict[key] = value

        parsed_tables.append(temp_dict)

    return parsed_tables


def fetch_tables(
    url: str = DEFAULT_URL,
    *,
    session: Optional[requests.sessions.Session] = None,
) -> List[MutableMapping[str, str]]:
    """Fetch and parse facts tables from the given URL."""

    http_client = session if session is not None else requests
    response = http_client.get(url)
    soup = BeautifulSoup(response.content, "html.parser")
    tables = soup.find_all("div", class_="facts-wrapper")
    return _parse_tables(tables)


def save_tables(
    tables: Sequence[MutableMapping[str, str]],
    output_path: Optional[Path | str] = None,
) -> Path:
    """Persist the scraped tables to a JSON file."""

    resolved_path = (
        Path(output_path)
        if output_path is not None
        else Path(__file__).resolve().parent / OUTPUT_FILENAME
    )

    with resolved_path.open("w", encoding="utf-8") as fp:
        json.dump(list(tables), fp)

    return resolved_path


def main(
    url: str = DEFAULT_URL,
    output_path: Optional[Path | str] = None,
    *,
    session: Optional[requests.sessions.Session] = None,
) -> Path:
    """Run the full scraping workflow and save the results to disk."""

    tables = fetch_tables(url, session=session)
    return save_tables(tables, output_path)


if __name__ == "__main__":
    main()
```
````
