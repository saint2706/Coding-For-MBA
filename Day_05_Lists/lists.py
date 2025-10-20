"""
Day 5: Managing and Analyzing Business Data with Lists (Refactored)

This script demonstrates how to create, access, modify, and analyze
lists containing business-related data. This version is refactored
into functions for better organization and testability.
"""


def get_list_element(data_list, index):
    """
    Safely gets an element from a list by its index.
    
    Lists use zero-based indexing: the first element is at index 0.
    Negative indices count from the end: -1 is the last element.
    
    Parameters
    ----------
    data_list : list
        The list to access
    index : int
        The position to retrieve (0-based, or negative for end-counting)
    
    Returns
    -------
    Any or None
        The element at the specified index, or None if index is out of range
    
    Example
    -------
    >>> get_list_element([10, 20, 30], 1)
    20
    >>> get_list_element([10, 20, 30], -1)
    30
    """
    # Check if the index is within valid range
    # -len(data_list) is the furthest negative index, len(data_list)-1 is the last positive
    if -len(data_list) <= index < len(data_list):
        return data_list[index]
    return None  # Return None for invalid indices (safer than raising an error)


def get_first_half_sales(sales_list):
    """
    Returns the first half of a list of sales using slicing.
    
    List slicing [start:end] creates a new list with elements from
    start index up to (but not including) end index.
    
    Parameters
    ----------
    sales_list : list
        A list of sales figures
    
    Returns
    -------
    list
        The first half of the list
    
    Example
    -------
    >>> get_first_half_sales([100, 200, 300, 400])
    [100, 200]
    """
    # Calculate the midpoint using integer division (//)
    midpoint = len(sales_list) // 2
    
    # [:midpoint] means "from the beginning up to (not including) midpoint"
    return sales_list[:midpoint]


def add_product(product_list, new_product):
    """
    Adds a new product to a list of products.
    
    Demonstrates the .append() method which adds an item to the end of a list.
    We create a copy to avoid modifying the original list.
    
    Parameters
    ----------
    product_list : list
        The existing list of products
    new_product : str
        The new product to add
    
    Returns
    -------
    list
        A new list with the product added
    
    Example
    -------
    >>> add_product(["Laptop", "Mouse"], "Keyboard")
    ['Laptop', 'Mouse', 'Keyboard']
    """
    # .copy() creates a new list so we don't modify the original
    new_list = product_list.copy()
    
    # .append() adds an item to the end of the list
    new_list.append(new_product)
    return new_list


def remove_product(product_list, product_to_remove):
    """
    Removes a product from a list if it exists.
    
    Demonstrates the .remove() method which removes the first occurrence
    of a value from a list.
    
    Parameters
    ----------
    product_list : list
        The list of products
    product_to_remove : str
        The product to remove
    
    Returns
    -------
    list
        A new list with the product removed (if it existed)
    
    Example
    -------
    >>> remove_product(["Laptop", "Mouse", "Keyboard"], "Mouse")
    ['Laptop', 'Keyboard']
    """
    # Create a copy to avoid modifying the original
    new_list = product_list.copy()
    
    # Check if the item exists before trying to remove it
    if product_to_remove in new_list:
        # .remove() deletes the first occurrence of the value
        new_list.remove(product_to_remove)
    return new_list


def analyze_team_sales(sales_figures):
    """
    Sorts sales, finds top performers, and returns an analysis.
    
    Demonstrates several list operations:
    - sorted() to order data
    - Slicing to get top N items
    - sum() to aggregate values
    
    Parameters
    ----------
    sales_figures : list of numbers
        List of individual sales amounts
    
    Returns
    -------
    dict or None
        Dictionary containing sorted sales, top 3, and their total
        Returns None if list is empty
    
    Example
    -------
    >>> analyze_team_sales([5000, 8000, 4500, 12000])
    {'sorted_sales': [12000, 8000, 5000, 4500], 'top_3_sales': [12000, 8000, 5000], 'total_top_sales': 25000}
    """
    # Handle empty list case
    if not sales_figures:
        return None

    # sorted() creates a new sorted list
    # reverse=True means highest to lowest (descending order)
    sorted_sales = sorted(sales_figures, reverse=True)
    
    # [:3] slices the first 3 elements (top 3 performers)
    top_3_sales = sorted_sales[:3]
    
    # sum() adds all numbers in the list
    total_top_sales = sum(top_3_sales)

    # Return results as a dictionary for structured access
    return {
        "sorted_sales": sorted_sales,
        "top_3_sales": top_3_sales,
        "total_top_sales": total_top_sales,
    }


if __name__ == "__main__":
    # --- Initializing Lists with Business Data ---
    print("--- Initializing Business Lists ---")
    departments_list = ["Sales", "Marketing", "Human Resources", "Engineering"]
    quarterly_sales_figures = [120000.50, 135000.75, 110000.00, 145000.25]
    print(f"Company Departments: {departments_list}")
    print(f"Quarterly Sales: {quarterly_sales_figures}")
    print("-" * 20)

    # --- Accessing and Slicing List Data ---
    print("--- Accessing Specific Data ---")
    marketing_department = get_list_element(departments_list, 1)
    print(f"The second department is: {marketing_department}")

    last_sales = get_list_element(quarterly_sales_figures, -1)
    print(f"Sales for the last quarter: ${last_sales}")

    first_half_figures = get_first_half_sales(quarterly_sales_figures)
    print(f"First half sales: {first_half_figures}")
    print("-" * 20)

    # --- Modifying Lists ---
    print("--- Modifying a Product List ---")
    initial_products = ["Laptop", "Mouse", "Keyboard", "Monitor"]
    print(f"Original product list: {initial_products}")

    products_after_add = add_product(initial_products, "Webcam")
    print(f"After adding 'Webcam': {products_after_add}")

    products_after_remove = remove_product(products_after_add, "Mouse")
    print(f"After removing 'Mouse': {products_after_remove}")
    print("-" * 20)

    # --- Analyzing List Data ---
    print("--- Analyzing Sales Performance ---")
    team_sales_figures = [5000, 8000, 4500, 12000, 6000, 11000]
    print(f"Sales figures for the team: {team_sales_figures}")

    sales_analysis = analyze_team_sales(team_sales_figures)
    if sales_analysis:
        print(f"Sales sorted from highest to lowest: {sales_analysis['sorted_sales']}")
        print(f"Top 3 sales figures: {sales_analysis['top_3_sales']}")
        print(
            f"Total sales from top 3 performers: ${sales_analysis['total_top_sales']}"
        )
    print("-" * 20)
