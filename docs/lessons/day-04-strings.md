In business analytics, text data is everywhere—customer names, product reviews, addresses, and report narratives. In Python, we handle text using **strings**.

## Key String Concepts

- **F-Strings:** The modern and most readable way to format strings. They let you embed variables and expressions directly inside a string.
  ```python
  report_summary = f"Company: {company_name}, Revenue: ${revenue}"
  ```
- **String Methods:** Built-in functions attached to strings that let you manipulate them. They are essential for data cleaning and preparation.

| Method | Description | Business Use Case |
| :------------- | :------------------------------------------------- | :------------------------------------ |
| `.lower()`/`.upper()` | Converts case. | Standardizing categories. |
| `.strip()` | Removes whitespace from the beginning and end. | Cleaning user-entered data. |
| `.replace()` | Replaces a substring with another. | Correcting or reformatting data. |
| `.split()` | Splits the string into a list of substrings. | Parsing comma-separated data. |
| `.startswith()`| Checks if the string starts with a substring. | Identifying invoice numbers. |
| `.endswith()` | Checks if the string ends with a substring. | Checking file types. |

## Environment Setup

Before you begin, ensure you have followed the setup instructions in the main [README.md](https://github.com/saint2706/Coding-For-MBA/blob/main/README.md) to set up your virtual environment and install the required libraries.

## Exploring the Refactored Code

The script for this lesson, `strings.py`, has been refactored into functions to make each string manipulation a reusable and testable unit of logic.

1. **Review the Code:** Open `Day_04_Strings/strings.py`. Each data transformation (e.g., `generate_report_header()`, `clean_and_format_name()`) is now its own function.
1. **Run the Script:** From the root directory of the project (`Coding-For-MBA`), run the script to see the functions in action:
   ```bash
   python Day_04_Strings/strings.py
   ```
1. **Run the Tests:** You can run the tests for this lesson to verify the correctness of each function:
   ```bash
   pytest tests/test_day_04.py
   ```

## 💻 Exercises: Day 4

1. **Generate a Report Header:**

   - In a new script (`my_solutions_04.py`), create a function `format_report_title(title, date)`.
   - The function should take a title string and a date string and return a formatted header like: `--- MONTHLY MARKETING REPORT: 2024-07 ---`.
   - Call the function and print the result.

1. **Clean Up Product Codes:**

   - You have a list of raw product codes: `[" prod-001 ", "prod-002", " Prod-003 "]`.
   - Create a function `clean_product_codes(codes)` that takes a list of codes.
   - Inside the function, loop through the list, and for each code, remove whitespace and convert it to uppercase.
   - The function should return a new list of cleaned codes.
   - Call the function and print the cleaned list.

1. **Validate Email Addresses:**

   - Create a function `is_valid_email(email)` that performs two simple checks:
     - Does the email contain an `@` symbol?
     - Does the email end with `.com`?
   - The function should return `True` if both conditions are met, otherwise `False`.
   - Test your function with a valid email (`"test@example.com"`) and an invalid one (`"test-example.com"`).

🎉 **Fantastic!** You can now manipulate text data, which is a massive part of any real-world data analysis task. Cleaning, formatting, and parsing strings are skills you'll use every single day.

## Additional Materials

- **solutions.ipynb**  
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_04_Strings/solutions.ipynb){ .md-button } 
  [📓 Open in NBViewer](https://nbviewer.org/github/saint2706/Coding-For-MBA/blob/main/Day_04_Strings/solutions.ipynb){ .md-button } 
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_04_Strings/solutions.ipynb){ .md-button .md-button--primary } 
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_04_Strings/solutions.ipynb){ .md-button }
- **strings.ipynb**  
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_04_Strings/strings.ipynb){ .md-button } 
  [📓 Open in NBViewer](https://nbviewer.org/github/saint2706/Coding-For-MBA/blob/main/Day_04_Strings/strings.ipynb){ .md-button } 
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_04_Strings/strings.ipynb){ .md-button .md-button--primary } 
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_04_Strings/strings.ipynb){ .md-button }

???+ example "solutions.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_04_Strings/solutions.py)

    ```python title="solutions.py"
    """
    Day 4: Solutions to Exercises
    """

    # --- Exercise 1: Generate a Report Header ---
    print("--- Solution to Exercise 1 ---")
    report_title = "Quarterly Sales Report"
    fiscal_year = 2024

    # Using .upper() to make the title all caps for emphasis
    # and an f-string to combine everything.
    header = f"*** {report_title.upper()} - FY{fiscal_year} ***"
    print(header)
    print("-" * 20)


    # --- Exercise 2: Clean Up Customer Data ---
    print("--- Solution to Exercise 2 ---")
    customer_name = "  john doe  "

    # .strip() removes the leading/trailing whitespace
    # .title() capitalizes the first letter of each word
    cleaned_name = customer_name.strip().title()

    print(f"Original name: '{customer_name}'")
    print(f"Cleaned name: '{cleaned_name}'")
    print("-" * 20)


    # --- Exercise 3: Parse Product SKU ---
    print("--- Solution to Exercise 3 ---")
    sku = "PROD-GADGET-001"

    # .split('-') breaks the string into a list of substrings,
    # using the hyphen as the separator.
    sku_parts = sku.split("-")

    # We can access the parts of the list by their index.
    product_type = sku_parts[0]
    product_name = sku_parts[1]
    product_id = sku_parts[2]

    print(f"Original SKU: {sku}")
    print(f"Product Type: {product_type}")
    print(f"Product Name: {product_name}")
    print(f"Product ID: {product_id}")
    print("-" * 20)
    ```

???+ example "strings.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_04_Strings/strings.py)

    ```python title="strings.py"
    """
    Day 4: Manipulating Business Text Data with Strings (Refactored)

    This script demonstrates common string manipulations and methods
    applied to business-related text data. This version is refactored
    into functions for better organization and testability.
    """


    def generate_report_header(title, year):
        """Creates a formatted report header."""
        return f"*** {title.upper()} - FY{year} ***"


    def clean_and_format_name(raw_name):
        """Cleans and capitalizes a raw name string."""
        return raw_name.strip().title()


    def format_date_string(date_str, old_separator="-", new_separator="/"):
        """Replaces separators in a date string."""
        return date_str.replace(old_separator, new_separator)


    def parse_sku(sku):
        """Parses a SKU string into its component parts."""
        parts = sku.split("-")
        if len(parts) == 3:
            return {"type": parts[0], "name": parts[1], "id": parts[2]}
        return None


    def is_transaction_type(transaction_id, prefix):
        """Checks if a transaction ID starts with a given prefix."""
        return transaction_id.startswith(prefix)


    def has_file_extension(filename, extension):
        """Checks if a filename ends with a given extension."""
        return filename.endswith(extension)


    def feedback_contains_keyword(feedback, keyword):
        """Checks if a feedback string contains a specific keyword."""
        return feedback.find(keyword) != -1


    if __name__ == "__main__":
        # --- Formatting Strings for Reports ---
        print("--- Generating Report Headers ---")
        header_text = generate_report_header("Quarterly Sales Report", 2024)
        print(header_text)
        print("-" * 20)

        # --- Cleaning Customer and Product Data ---
        print("--- Data Cleaning Examples ---")
        customer_name = "  john doe  "
        formatted_customer_name = clean_and_format_name(customer_name)
        print(
            f"Raw name: '{customer_name}', Final formatted name: '{formatted_customer_name}'"
        )

        date_string = "2023-Jan-15"
        formatted_date_str = format_date_string(date_string)
        print(f"Original date: {date_string}, Formatted date: {formatted_date_str}")
        print("-" * 20)

        # --- Parsing and Extracting Information from Strings ---
        print("--- Parsing Product and Transaction IDs ---")
        product_sku = "PROD-GADGET-001"
        parsed_sku = parse_sku(product_sku)
        if parsed_sku:
            print(f"SKU: {product_sku}")
            print(f"  Product Type: {parsed_sku['type']}")
            print(f"  Product Name: {parsed_sku['name']}")
            print(f"  Product ID: {parsed_sku['id']}")
        print()

        trans_id = "INV-2024-03-15-998"
        is_inv = is_transaction_type(trans_id, "INV")
        print(f"Transaction '{trans_id}' is an invoice: {is_inv}")

        report_filename = "q1_sales_report.pdf"
        is_a_pdf = has_file_extension(report_filename, ".pdf")
        print(f"Report file '{report_filename}' is a PDF: {is_a_pdf}")
        print("-" * 20)

        # --- Searching for keywords ---
        customer_feedback_text = "The new CRM is great, but the reporting feature is slow."
        if feedback_contains_keyword(customer_feedback_text, "slow"):
            print("Feedback contains the word 'slow'. Action may be required.")
        else:
            print("Feedback does not contain the word 'slow'.")
    ```
