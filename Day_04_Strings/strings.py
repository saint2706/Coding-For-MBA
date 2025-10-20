"""
Day 4: Manipulating Business Text Data with Strings (Refactored)

This script demonstrates common string manipulations and methods
applied to business-related text data. This version is refactored
into functions for better organization and testability.
"""


def generate_report_header(title, year):
    """
    Creates a formatted report header with uppercase text and asterisks.
    
    This demonstrates string formatting and the .upper() method which
    converts all letters to uppercase.
    
    Parameters
    ----------
    title : str
        The report title
    year : int
        The fiscal year
    
    Returns
    -------
    str
        A formatted header string
    
    Example
    -------
    >>> generate_report_header("Quarterly Sales Report", 2024)
    '*** QUARTERLY SALES REPORT - FY2024 ***'
    """
    # .upper() converts the string to all uppercase letters
    # f-strings allow us to embed variables and expressions in strings
    return f"*** {title.upper()} - FY{year} ***"


def clean_and_format_name(raw_name):
    """
    Cleans and capitalizes a raw name string.
    
    Common data cleaning task: remove extra whitespace and ensure
    proper capitalization (Title Case).
    
    Parameters
    ----------
    raw_name : str
        A name that may have extra spaces or inconsistent capitalization
    
    Returns
    -------
    str
        A cleaned and properly formatted name
    
    Example
    -------
    >>> clean_and_format_name("  john doe  ")
    'John Doe'
    """
    # .strip() removes whitespace from the beginning and end
    # .title() capitalizes the first letter of each word
    return raw_name.strip().title()


def format_date_string(date_str, old_separator="-", new_separator="/"):
    """
    Replaces separators in a date string.
    
    Demonstrates the .replace() method for string substitution.
    Useful for standardizing date formats across different systems.
    
    Parameters
    ----------
    date_str : str
        The original date string
    old_separator : str, optional
        The separator to replace (default is "-")
    new_separator : str, optional
        The new separator (default is "/")
    
    Returns
    -------
    str
        Date string with new separator
    
    Example
    -------
    >>> format_date_string("2023-Jan-15")
    '2023/Jan/15'
    """
    # .replace(old, new) finds all occurrences of 'old' and replaces with 'new'
    return date_str.replace(old_separator, new_separator)


def parse_sku(sku):
    """
    Parses a SKU (Stock Keeping Unit) string into its component parts.
    
    Demonstrates the .split() method which breaks a string into a list
    based on a separator character. Common for parsing structured data.
    
    Parameters
    ----------
    sku : str
        A SKU string in format "TYPE-NAME-ID"
    
    Returns
    -------
    dict or None
        Dictionary with 'type', 'name', and 'id' keys, or None if format is invalid
    
    Example
    -------
    >>> parse_sku("PROD-GADGET-001")
    {'type': 'PROD', 'name': 'GADGET', 'id': '001'}
    """
    # .split("-") breaks the string into a list wherever it finds a "-"
    # For example: "A-B-C" becomes ["A", "B", "C"]
    parts = sku.split("-")
    
    # Check if we got exactly 3 parts (safety check)
    if len(parts) == 3:
        # Create a dictionary with named keys for clarity
        return {"type": parts[0], "name": parts[1], "id": parts[2]}
    return None  # Return None if the format doesn't match


def is_transaction_type(transaction_id, prefix):
    """
    Checks if a transaction ID starts with a given prefix.
    
    Demonstrates the .startswith() method - useful for categorizing
    or filtering data based on prefixes.
    
    Parameters
    ----------
    transaction_id : str
        The transaction identifier
    prefix : str
        The prefix to check for (e.g., "INV" for invoice)
    
    Returns
    -------
    bool
        True if transaction_id starts with prefix, False otherwise
    
    Example
    -------
    >>> is_transaction_type("INV-2024-03-15", "INV")
    True
    """
    # .startswith() returns True if the string begins with the specified text
    return transaction_id.startswith(prefix)


def has_file_extension(filename, extension):
    """
    Checks if a filename ends with a given extension.
    
    Demonstrates the .endswith() method - useful for file type validation.
    
    Parameters
    ----------
    filename : str
        The name of the file
    extension : str
        The file extension to check for (e.g., ".pdf")
    
    Returns
    -------
    bool
        True if filename ends with extension, False otherwise
    
    Example
    -------
    >>> has_file_extension("report.pdf", ".pdf")
    True
    """
    # .endswith() returns True if the string ends with the specified text
    return filename.endswith(extension)


def feedback_contains_keyword(feedback, keyword):
    """
    Checks if a feedback string contains a specific keyword.
    
    Demonstrates the .find() method for searching within strings.
    Returns -1 if not found, otherwise returns the position.
    
    Parameters
    ----------
    feedback : str
        Customer feedback text
    keyword : str
        The word to search for
    
    Returns
    -------
    bool
        True if keyword is found in feedback, False otherwise
    
    Example
    -------
    >>> feedback_contains_keyword("The service is slow", "slow")
    True
    """
    # .find() returns -1 if the keyword is not found, otherwise returns position
    # We check if the result is NOT -1 (i.e., keyword was found)
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
