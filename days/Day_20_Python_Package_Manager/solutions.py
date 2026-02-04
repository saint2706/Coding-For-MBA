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
