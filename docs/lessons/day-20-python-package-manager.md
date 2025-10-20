The real power of Python for data analysis comes from its vast ecosystem of third-party libraries. These are pre-written modules, created by the community, that provide powerful tools for specific tasks.

- **`requests`**: For making HTTP requests to APIs and websites.
- **`numpy`**: For numerical computing and advanced math.
- **`pandas`**: For data manipulation and analysis (we'll dive deep into this soon).
- **`beautifulsoup4`**: For web scraping.

## `pip` and `requirements.txt`

- **`pip`** is the standard tool for installing these packages. You use it in your terminal (e.g., `pip install requests`).
- A **`requirements.txt`** file is the standard way to list all the third-party packages your project depends on. This allows anyone (including you, on a different computer) to install all the necessary libraries at once using a single command: `pip install -r requirements.txt`.

## Environment Setup

This project now has a `requirements.txt` file at its root. Before you begin, ensure you have followed the setup instructions in the main [README.md](https://github.com/saint2706/Coding-For-MBA/blob/main/README.md) to create a virtual environment and run `pip install -r requirements.txt`.

## Exploring the Refactored Code

The script for this lesson, `url.py`, demonstrates how to use `requests` to fetch data from live APIs and `numpy` to perform calculations. The code has been refactored to separate the data fetching logic from the data analysis logic, which is a crucial best practice.

1. **Review the Code:** Open `Day_20_Python_Package_Manager/url.py`. Notice the `fetch_api_data()` function, which is responsible for the network request, and the `analyze_...` functions, which take data as input and perform calculations.
1. **Run the Script:** From the root directory of the project (`Coding-For-MBA`), run the script. It will make live calls to external APIs and print the analysis.
   ```bash
   python Day_20_Python_Package_Manager/url.py
   ```
1. **Run the Tests:** The tests for this lesson demonstrate a key testing technique: **mocking**. We replace the live network call with a "mock" object that returns sample data. This makes our tests fast, reliable, and independent of the network.
   ```bash
   pytest tests/test_day_20.py
   ```

## 💻 Exercises: Day 20

1. **Explore the `requests` Response:**

   - In a new script (`my_solutions_20.py`), import the `requests` library.
   - Make a `get` request to `"https://api.thecatapi.com/v1/breeds"`.
   - The object returned by `requests.get()` is a `Response` object. Print its `status_code` attribute (e.g., `response.status_code`) and its `headers` attribute.

1. **Analyze Different Metrics:**

   - Import the `fetch_api_data` and `analyze_breed_metrics` functions from the lesson script.
   - Fetch the cat breed data.
   - The `analyze_breed_metrics` function can analyze both `'weight'` and `'life_span'`. Call it for `'life_span'` and print the result.

1. **Find the Top 3 Origins:**

   - Import and use the `analyze_breed_origins` function, but modify the call so it returns the top 3 most common origins instead of the default 5.

🎉 **Congratulations!** You now understand how to leverage the vast Python ecosystem using `pip`. This skill unlocks a world of powerful tools for data analysis, machine learning, web development, and more.

## Additional Materials

- **solutions.ipynb**  
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_20_Python_Package_Manager/solutions.ipynb){ .md-button } 
  [📓 Open in NBViewer](https://nbviewer.org/github/saint2706/Coding-For-MBA/blob/main/Day_20_Python_Package_Manager/solutions.ipynb){ .md-button } 
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_20_Python_Package_Manager/solutions.ipynb){ .md-button .md-button--primary } 
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_20_Python_Package_Manager/solutions.ipynb){ .md-button }
- **url.ipynb**  
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_20_Python_Package_Manager/url.ipynb){ .md-button } 
  [📓 Open in NBViewer](https://nbviewer.org/github/saint2706/Coding-For-MBA/blob/main/Day_20_Python_Package_Manager/url.ipynb){ .md-button } 
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_20_Python_Package_Manager/url.ipynb){ .md-button .md-button--primary } 
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_20_Python_Package_Manager/url.ipynb){ .md-button }

???+ example "solutions.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_20_Python_Package_Manager/solutions.py)

    ```python title="solutions.py"
    """
    Day 20: Python Package Manager (pip) - Solutions

    This file contains solutions to the exercises for Day 20, demonstrating
    how to use pip to install and work with third-party Python packages
    for business analytics and data processing.

    Author: 50 Days of Python Course
    """

    import json

    import requests

    ## Exercise 1: Install a package

    """
    SOLUTION TO EXERCISE 1: Install a package

    To install pandas (a powerful data analysis library), follow these steps:

    1. Open your terminal or command prompt
    2. Run the following command:
       pip install pandas

    3. To verify the installation was successful, run:
       pip show pandas

    4. You can also check the version:
       pip show pandas | findstr Version     (Windows)
       pip show pandas | grep Version        (macOS/Linux)

    Alternative commands:
    - Install a specific version: pip install pandas==1.5.0
    - Upgrade to latest version: pip install --upgrade pandas
    - Install from requirements file: pip install -r requirements.txt
    """

    print("📦 Exercise 1: Package Installation")
    print("✅ To install pandas, run: pip install pandas")
    print("✅ To verify installation, run: pip show pandas")
    print("=" * 50)


    ## Exercise 2: Explore a package

    """
    SOLUTION TO EXERCISE 2: Explore the requests package

    The requests library is one of the most popular Python packages for making HTTP requests.
    It's commonly used in business applications for:
    - API integrations
    - Data collection from web services
    - Microservice communication
    - Web scraping (when appropriate)

    Key information about requests.get():
    - Documentation: https://requests.readthedocs.io/en/latest/
    - The get() function sends a GET request to a specified URL
    - Returns a Response object with status codes, headers, and content
    - Supports parameters, headers, authentication, and more

    Example usage:
        import requests
        response = requests.get('https://api.example.com/data')
        if response.status_code == 200:
            data = response.json()  # Parse JSON response
            print(data)
    """

    print("\\n🔍 Exercise 2: Exploring the requests package")
    print("📖 Documentation: https://requests.readthedocs.io/")
    print("🎯 Purpose: HTTP requests made simple for Python")
    print("💼 Business use: API integrations, data collection, web services")
    print("=" * 50)


    ## Exercise 3: Analyze country data

    print("\\n🌍 Exercise 3: Analyzing World Countries Data")
    print("🎯 Objective: Find the top 5 largest countries by area")
    print("📊 Data Source: REST Countries API v3.1")


    def top_5_largest_countries_by_area():
        """
        Fetch and display the top 5 largest countries by area using the REST Countries API v3.1.

        This demonstrates how to work with modern APIs and handle data structure changes
        that commonly occur in business applications.
        """
        try:
            # Try multiple approaches for better reliability
            api_attempts = [
                "https://restcountries.com/v3.1/all?fields=name,area",  # Optimized query
                "https://restcountries.com/v3.1/all",  # Full data fallback
            ]

            countries = None
            for i, url in enumerate(api_attempts, 1):
                try:
                    print(f"📡 Attempt {i}: Fetching from {url}")
                    response = requests.get(
                        url,
                        timeout=15,
                        headers={"User-Agent": "Business-Analytics-Course/1.0"},
                    )
                    response.raise_for_status()
                    countries = response.json()
                    print(f"✅ Success! Retrieved data for {len(countries)} countries")
                    break
                except requests.exceptions.RequestException as e:
                    print(f"❌ Attempt {i} failed: {e}")
                    if i < len(api_attempts):
                        print("🔄 Trying alternative endpoint...")

            # If API completely fails, use fallback data
            if not countries:
                print("\\n🔄 All API endpoints failed. Using educational fallback data...")
                countries = [
                    {"name": {"common": "Russia"}, "area": 17098242},
                    {"name": {"common": "Canada"}, "area": 9984670},
                    {"name": {"common": "United States"}, "area": 9833517},
                    {"name": {"common": "China"}, "area": 9596961},
                    {"name": {"common": "Brazil"}, "area": 8514877},
                    {"name": {"common": "Australia"}, "area": 7692024},
                    {"name": {"common": "India"}, "area": 3287263},
                ]
                print(f"✅ Using fallback dataset with {len(countries)} countries")

            # Filter out countries that don't have an 'area' key
            countries_with_area = []
            for country in countries:
                if "area" in country and country["area"] is not None:
                    # v3.1 API has a different structure for country names
                    name = country.get("name", {}).get("common", "Unknown")
                    area = country["area"]
                    countries_with_area.append({"name": name, "area": area})

            # Sort the countries by area in descending order
            sorted_countries = sorted(
                countries_with_area, key=lambda x: x["area"], reverse=True
            )

            print("\n🌍 Top 5 largest countries by area:")
            print("=" * 45)
            for i in range(min(5, len(sorted_countries))):
                country = sorted_countries[i]
                print(f"{i + 1}. {country['name']:<20}: {country['area']:>15,.0f} sq. km")

            print("\n💡 Business Insight: These large countries represent significant")
            print("   market opportunities for international expansion!")

        except requests.exceptions.Timeout:
            print("❌ Error: Request timed out. The API might be slow to respond.")
        except requests.exceptions.RequestException as e:
            print(f"❌ Error fetching data: {e}")
            print("💡 Tip: Check your internet connection or try again later.")
        except json.JSONDecodeError as e:
            print(f"❌ Error: Could not decode the JSON response - {e}")
        except KeyError as e:
            print(f"❌ Error: Expected data field missing - {e}")
        except Exception as e:
            print(f"❌ Unexpected error occurred: {e}")


    def demonstrate_additional_package_features():
        """
        Bonus demonstration: Additional features you can explore with pip and packages.
        """
        print("\\n🎁 BONUS: Additional Package Manager Features")
        print("=" * 50)
        print("📋 Useful pip commands for business projects:")
        print("   • pip list                    - Show installed packages")
        print("   • pip freeze > requirements.txt - Save current environment")
        print("   • pip install -r requirements.txt - Install from requirements")
        print("   • pip uninstall package_name  - Remove a package")
        print("   • pip search keyword          - Search for packages")
        print("   • pip show --files package    - Show package files")

        print("\\n🏢 Popular business analytics packages:")
        packages = [
            ("pandas", "Data manipulation and analysis"),
            ("numpy", "Numerical computing"),
            ("matplotlib", "Data visualization"),
            ("requests", "HTTP library for APIs"),
            ("openpyxl", "Excel file handling"),
            ("sqlalchemy", "Database toolkit"),
            ("scikit-learn", "Machine learning"),
            ("plotly", "Interactive visualizations"),
        ]

        for package, description in packages:
            print(f"   • {package:12s} - {description}")


    def main():
        """Main function to run all exercise solutions."""
        print("🚀 Day 20: Python Package Manager Solutions")
        print("🎓 Learning how to leverage the Python ecosystem for business")
        print("=" * 60)

        # Run Exercise 3 solution
        top_5_largest_countries_by_area()

        # Show additional features
        demonstrate_additional_package_features()

        print("\\n✨ Congratulations! You've learned how to:")
        print("   ✅ Install Python packages with pip")
        print("   ✅ Explore package documentation")
        print("   ✅ Use APIs for real-world data analysis")
        print("   ✅ Handle errors in data fetching operations")
        print("\\n🌟 Next steps: Explore more packages at https://pypi.org/")


    if __name__ == "__main__":
        main()
    ```

???+ example "url.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_20_Python_Package_Manager/url.py)

    ```python title="url.py"
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
    ```
