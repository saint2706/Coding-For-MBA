"""Day 16: File Handling for Business Analytics (Refactored)

This module demonstrates various file handling operations commonly used in business.
"""

import csv
import os
import re
import string
from collections import Counter
from typing import Dict, List, Optional, Tuple

# Import stop words from the local file
try:
    from .stop_words import stop_words as sw
except ImportError:
    from stop_words import stop_words as sw


def count_words_and_lines(fname: str) -> Tuple[int, int]:
    """Count words and lines in a text file."""
    num_words, num_lines = 0, 0
    try:
        with open(fname, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                wordslist = line.split()
                num_lines += 1
                num_words += len(wordslist)
        return num_words, num_lines
    except FileNotFoundError:
        print(f"❌ Error: File '{fname}' not found")
        return 0, 0
    except IOError as e:
        print(f"❌ Error reading file '{fname}': {e}")
        return 0, 0


def find_most_common_words(fname: str, top_n: int) -> List[Tuple[str, int]]:
    """Find the most frequently used words in a text file, ignoring stop words."""
    try:
        with open(fname, "r", encoding="utf-8") as f:
            text = f.read().lower()

        # Remove punctuation
        text = text.translate(str.maketrans("", "", string.punctuation))
        words = text.split()

        # Filter out stop words
        filtered_words = [word for word in words if word not in sw]

        # Count and return the most common
        counts = Counter(filtered_words)
        return counts.most_common(top_n)

    except FileNotFoundError:
        print(f"❌ Error: File '{fname}' not found")
        return []
    except Exception as e:
        print(f"❌ An unexpected error occurred: {e}")
        return []


def extract_emails_from_file(fname: str) -> List[str]:
    """Extract all unique email addresses from a text file."""
    email_pattern = r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b"
    try:
        with open(fname, "r", encoding="utf-8") as f:
            text = f.read()

        emails = re.findall(email_pattern, text)
        return sorted(list(set(emails)))  # Return unique emails, sorted

    except FileNotFoundError:
        print(f"❌ Error: File '{fname}' not found")
        return []
    except Exception as e:
        print(f"❌ An unexpected error occurred: {e}")
        return []


def check_email(email: str) -> bool:
    """Validate an email address format."""
    email_pattern = r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b"
    return re.match(email_pattern, email) is not None


# Aliases for backward compatibility
counter = count_words_and_lines
extract_emails = extract_emails_from_file


def analyze_sales_csv(fname: str) -> Optional[Dict[str, float]]:
    """
    Reads a sales CSV and calculates total revenue and average transaction value.
    Assumes CSV format: Product,Price,Quantity
    """
    total_revenue = 0.0
    transaction_count = 0

    try:
        with open(fname, mode="r", encoding="utf-8") as file:
            csv_reader = csv.reader(file)
            _ = next(csv_reader)  # Skip header row

            for row in csv_reader:
                try:
                    price = float(row[1])
                    quantity = int(row[2])
                    total_revenue += price * quantity
                    transaction_count += 1
                except (ValueError, IndexError):
                    # Skip rows with malformed data
                    continue

        if transaction_count == 0:
            return None

        average_transaction = total_revenue / transaction_count
        return {
            "total_revenue": total_revenue,
            "average_transaction": average_transaction,
        }

    except FileNotFoundError:
        print(f"❌ Error: File '{fname}' not found")
        return None
    except Exception as e:
        print(f"❌ An unexpected error occurred: {e}")
        return None


def main():
    """Main function to demonstrate file handling capabilities."""
    print("🗂️  Day 16: File Handling for Business Analytics")
    print("=" * 60)

    # Create dummy files for demonstration
    # In a real scenario, these files would already exist.
    demo_text_content = "This is a sample business report. The report details sales and profits. Contact support@example.com for details."
    demo_csv_content = "Product,Price,Quantity\nLaptop,1200.00,5\nMouse,25.50,10"

    demo_text_file = "demo_report.txt"
    demo_csv_file = "demo_sales.csv"

    with open(demo_text_file, "w") as f:
        f.write(demo_text_content)
    with open(demo_csv_file, "w") as f:
        f.write(demo_csv_content)

    # 1. Analyze document word counts
    print("\n📄 Document Analysis Example:")
    words, lines = count_words_and_lines(demo_text_file)
    print(f"✅ Document '{demo_text_file}' has {words} words and {lines} lines.")

    # 2. Find most common words
    print("\n📊 Most Common Words Example:")
    common_words = find_most_common_words(demo_text_file, 3)
    print(f"✅ Top 3 most common words: {common_words}")

    # 3. Extract emails
    print("\n📧 Email Extraction Example:")
    emails = extract_emails_from_file(demo_text_file)
    print(f"✅ Found emails: {emails}")

    # 4. Analyze CSV data
    print("\n📈 CSV Sales Analysis Example:")
    sales_analysis = analyze_sales_csv(demo_csv_file)
    if sales_analysis:
        print(f"✅ Total Revenue: ${sales_analysis['total_revenue']:.2f}")
        print(f"✅ Average Transaction: ${sales_analysis['average_transaction']:.2f}")

    # Clean up dummy files
    os.remove(demo_text_file)
    os.remove(demo_csv_file)

    print("\n✨ Demonstration complete!")


if __name__ == "__main__":
    main()
