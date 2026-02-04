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
