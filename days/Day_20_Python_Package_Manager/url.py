"""Day 20: Python Package Manager - Working with Third-Party Libraries (Refactored)."""

import json
import re
from collections import Counter
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
import requests

# Optional import for web scraping
try:
    from bs4 import BeautifulSoup

    BS4_AVAILABLE = True
except ImportError:
    BS4_AVAILABLE = False

# --- Data Fetching Functions ---


def fetch_api_data(url: str) -> Optional[List[Dict[str, Any]]]:
    """Fetches and parses JSON data from a given API endpoint."""
    try:
        print(f"📚 Fetching data from {url}...")
        response = requests.get(url, timeout=15)
        response.raise_for_status()  # Raises an HTTPError for bad responses (4xx or 5xx)
        print("✅ Data downloaded successfully!")
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"❌ Error fetching data: {e}")
        return None
    except json.JSONDecodeError:
        print("❌ Error: Failed to decode JSON response.")
        return None


# --- Data Analysis Functions ---


def analyze_text_frequency(text: str, top_n: int = 5) -> List[Tuple[str, int]]:
    """Analyzes text to find the most common words."""
    words = re.findall(r"\b[a-z]+\b", text.lower())
    return Counter(words).most_common(top_n)


def parse_metric_range(metric_str: str) -> float:
    """Parses a string like '3 - 7' and returns the average."""
    try:
        parts = [float(p.strip()) for p in metric_str.split("-")]
        return sum(parts) / len(parts)
    except (ValueError, IndexError):
        return 0.0


def analyze_breed_metrics(
    breeds_data: List[Dict[str, Any]], metric: str, unit: str
) -> Optional[Dict[str, float]]:
    """Analyzes a specific metric (e.g., 'weight', 'life_span') from breed data."""
    values = []
    for breed in breeds_data:
        if metric == "weight" and "weight" in breed and "metric" in breed["weight"]:
            avg_value = parse_metric_range(breed["weight"]["metric"])
        elif metric == "life_span" and "life_span" in breed:
            avg_value = parse_metric_range(breed["life_span"])
        else:
            continue

        if avg_value > 0:
            values.append(avg_value)

    if not values:
        return None

    return {
        "unit": unit,
        "mean": np.mean(values),
        "median": np.median(values),
        "std_dev": np.std(values),
    }


def analyze_breed_origins(
    breeds_data: List[Dict[str, Any]], top_n: int = 5
) -> List[Tuple[str, int]]:
    """Analyzes the geographic distribution of cat breed origins."""
    origins = [
        breed["origin"]
        for breed in breeds_data
        if "origin" in breed and breed["origin"]
    ]
    return Counter(origins).most_common(top_n)


def main():
    """Main function to demonstrate package manager capabilities."""
    print("🚀 Day 20: Python Package Manager Demo\n")

    # 1. Analyze Cat Breed Data from TheCatAPI
    print("--- Analyzing Cat Breed Data ---")
    cat_breeds = fetch_api_data("https://api.thecatapi.com/v1/breeds")
    if cat_breeds:
        weight_stats = analyze_breed_metrics(cat_breeds, "weight", "kg")
        if weight_stats:
            print(
                f"Average Cat Weight: {weight_stats['mean']:.2f} {weight_stats['unit']}"
            )

        lifespan_stats = analyze_breed_metrics(cat_breeds, "life_span", "years")
        if lifespan_stats:
            print(
                f"Average Cat Lifespan: {lifespan_stats['mean']:.2f} {lifespan_stats['unit']}"
            )

        top_origins = analyze_breed_origins(cat_breeds)
        print("Top 5 Breed Origins:", top_origins)

    print("-" * 20)

    # 2. Web Scraping Demonstration (Optional)
    if BS4_AVAILABLE:
        print("\n--- Web Scraping Demonstration ---")
        try:
            response = requests.get("https://httpbin.org/html", timeout=10)
            response.raise_for_status()
            soup = BeautifulSoup(response.content, "html.parser")
            title = soup.find("h1")
            print(f"Scraped Page Title: {title.get_text() if title else 'Not Found'}")
        except Exception as e:
            print(f"❌ Web scraping demo failed: {e}")
    else:
        print("\n--- Web Scraping Demonstration ---")
        print("BeautifulSoup4 not installed. Skipping.")

    print("\n✅ Demo complete!")


if __name__ == "__main__":
    main()
