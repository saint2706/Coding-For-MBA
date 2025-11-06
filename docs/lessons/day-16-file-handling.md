---
title: 'Day 16: File Handling for Business Analytics'
tags:
  - BI
  - Basics
  - Python
---

A huge part of data analysis involves reading data from files and writing results to them. Whether
you're processing a sales report, a customer list, or log files, you need to interact with the file
system. Python makes this easy.

## Key Concepts

- **Opening Files:** Use the `open()` function to open a file. It's best practice to use it with a
  `with` statement, which automatically closes the file for you, even if errors occur.
  ```python
  with open('my_report.txt', 'r') as file:
      content = file.read()
  ```
- **File Modes:**
  - `'r'`: Read (default). Throws an error if the file doesn't exist.
  - `'w'`: Write. Creates a new file or overwrites an existing one.
  - `'a'`: Append. Adds content to the end of an existing file.
- **Exception Handling:** When working with files, it's crucial to wrap your code in a
  `try...except FileNotFoundError` block to handle cases where a file might be missing.

## Environment Setup

Before you begin, ensure you have followed the setup instructions in the main
[README.md](https://github.com/saint2706/Coding-For-MBA/blob/main/README.md) to set up your virtual environment and install the required libraries.

## Exploring the Refactored Code

The script for this lesson, `fh.py`, has been refactored to provide several powerful, reusable
functions for common business file-handling tasks.

1. **Review the Code:** Open `Day_16_File_Handling/fh.py`. Examine functions like
   `count_words_and_lines()`, `find_most_common_words()`, `extract_emails_from_file()`, and
   `analyze_sales_csv()`.
1. **Run the Script:** From the root directory of the project (`Coding-For-MBA`), run the script. It
   will create a few temporary demo files, run the analysis functions on them, print the results,
   and then clean up the files.
   ```bash
   python Day_16_File_Handling/fh.py
   ```
1. **Run the Tests:** The tests for this lesson are more advanced. They create temporary files in
   memory to test the functions without needing actual files on your disk.
   ```bash
   pytest tests/test_day_16.py
   ```

## 💻 Exercises: Day 16

1. **Analyze a Text File:**

   - In a new script (`my_solutions_16.py`), create a simple text file named `my_memo.txt` and write
     a few sentences into it.
   - Import the `count_words_and_lines` and `find_most_common_words` functions from the lesson
     script.
   - Call these functions with your new file's path and print the results.

1. **Process a Simple CSV:**

   - Create a function `create_sales_data(filepath, sales_data)` that takes a list of lists and
     writes it to a CSV file.
   - Your `sales_data` could be
     `[['Product', 'Price', 'Quantity'], ['Widget A', '10.00', '50'], ['Widget B', '15.50', '30']]`.
   - Import and use the `analyze_sales_csv` function from the lesson to read your new CSV and print
     the total revenue and average transaction value.

🎉 **Excellent!** You can now programmatically read from and write to the most common file types.
This is a fundamental skill for automating data intake, processing reports, and saving your
analysis.

<!-- LESSON_FOOTER_START -->

______________________________________________________________________

**Previous:** [Day 15 – Day 15: Exception Handling - Building Robust Business Logic](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_15_Exception_Handling/README.md) • **Next:** [Day 17 – Day 17: Regular Expressions for Text Pattern Matching](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_17_Regular_Expressions/README.md)

_You are on lesson 16 of 108._

<!-- LESSON_FOOTER_END -->

## Interactive Notebooks

Run this lesson's notebooks directly in your browser with the built-in JupyterLite runtime.

[🪐 Launch in JupyterLite](/jupyterlite/lab?path=Day_16_File_Handling/fh.ipynb){ .md-button .md-button--primary }

## Additional Materials

- **fh.ipynb**
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_16_File_Handling/fh.ipynb){ .md-button }
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_16_File_Handling/fh.ipynb){ .md-button .md-button--primary }
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_16_File_Handling/fh.ipynb){ .md-button }
  [🪐 Launch in JupyterLite](/jupyterlite/lab?path=Day_16_File_Handling/fh.ipynb){ .md-button }
- **solutions.ipynb**
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_16_File_Handling/solutions.ipynb){ .md-button }
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_16_File_Handling/solutions.ipynb){ .md-button .md-button--primary }
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_16_File_Handling/solutions.ipynb){ .md-button }
  [🪐 Launch in JupyterLite](/jupyterlite/lab?path=Day_16_File_Handling/solutions.ipynb){ .md-button }
- **stop_words.ipynb**
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_16_File_Handling/stop_words.ipynb){ .md-button }
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_16_File_Handling/stop_words.ipynb){ .md-button .md-button--primary }
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_16_File_Handling/stop_words.ipynb){ .md-button }
  [🪐 Launch in JupyterLite](/jupyterlite/lab?path=Day_16_File_Handling/stop_words.ipynb){ .md-button }

???+ example "fh.py"
[View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_16_File_Handling/fh.py)

````
```python title="fh.py"
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
```
````

???+ example "solutions.py"
[View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_16_File_Handling/solutions.py)

````
```python title="solutions.py"
"""
Day 16: File Handling - Solutions

This file contains comprehensive solutions to all Day 16 exercises,
demonstrating advanced file handling techniques for business analytics.

Author: 50 Days of Python Course
Purpose: Educational solutions for MBA students
"""

import csv
import glob
import os
from typing import Dict, List

from fh import (
    check_email,
    counter,
    extract_emails,
    find_most_common_words,
)


def exercise_1_document_analyzer():
    """
    Exercise 1: Document Statistics Analyzer

    Creates and analyzes a sample story file, then demonstrates
    batch processing of multiple business documents.
    """
    print("=" * 60)
    print("📊 EXERCISE 1: Document Statistics Analyzer")
    print("=" * 60)

    # Create sample story file
    story_content = """
    Once upon a time in a bustling corporate office, there lived a data analyst named Sarah.
    Sarah worked tirelessly to transform raw business data into meaningful insights.
    Every morning, she would arrive early to review the previous day's sales reports.

    The company had been struggling with declining market share.
    Sarah believed that data-driven decisions could turn the tide.
    She spent hours analyzing customer feedback, sales trends, and market research.

    One day, Sarah discovered a pattern in the data that nobody had noticed before.
    Customer satisfaction was directly correlated with response time to support tickets.
    This insight led to a complete overhaul of the customer service process.

    Within six months, the company's customer retention improved by 35%.
    Sarah's analytical skills had literally saved the company millions of dollars.
    Her story became legend in the data analytics community.
    """

    # Write story to file
    story_file = "my_story.txt"
    try:
        with open(story_file, "w", encoding="utf-8") as f:
            f.write(story_content.strip())
        print(f"✅ Created story file: {story_file}")
    except Exception as e:
        print(f"❌ Error creating story file: {e}")
        return

    # Analyze the story
    try:
        words, lines = counter(story_file)
        print("\n📈 Story Analysis Results:")
        print(f"   📝 Total words: {words}")
        print(f"   📄 Total lines: {lines}")
        print(f"   📊 Average words per line: {words / lines:.2f}")

        # Find most common words in the story
        common_words = find_most_common_words(story_file, 5)
        print("\n🔤 Most Common Words:")
        for i, (freq, word) in enumerate(common_words, 1):
            print(f"   {i}. '{word}': {freq} times")

    except Exception as e:
        print(f"❌ Error analyzing story: {e}")

    # Demonstrate batch document analysis
    print("\n📚 Batch Document Analysis:")
    batch_analyze_business_documents()

    # Clean up
    if os.path.exists(story_file):
        os.remove(story_file)
        print(f"🧹 Cleaned up: {story_file}")


def batch_analyze_business_documents():
    """
    Advanced function for analyzing multiple business documents
    """
    # Look for sample files in the data directory
    data_dir = os.path.join("..", "data")

    # Common business document patterns
    text_patterns = ["*.txt"]
    sample_files = []

    for pattern in text_patterns:
        files = glob.glob(os.path.join(data_dir, pattern))
        sample_files.extend(files)

    if not sample_files:
        print("   ℹ️  No sample text files found for batch analysis")
        return

    print(f"   📁 Found {len(sample_files)} document(s) for analysis")

    total_words = 0
    total_lines = 0
    all_themes = {}

    for file_path in sample_files[:3]:  # Limit to first 3 files
        try:
            print(f"   🔍 Analyzing: {os.path.basename(file_path)}")
            words, lines = counter(file_path)
            total_words += words
            total_lines += lines

            # Extract themes
            themes = find_most_common_words(file_path, 3)
            for freq, word in themes:
                if len(word) > 3:  # Filter short words
                    all_themes[word] = all_themes.get(word, 0) + freq

        except Exception as e:
            print(f"   ❌ Error processing {file_path}: {e}")

    if total_words > 0:
        print("\n   📊 Batch Analysis Summary:")
        print(f"      📝 Total words across documents: {total_words:,}")
        print(f"      📄 Total lines across documents: {total_lines:,}")

        # Top themes across all documents
        if all_themes:
            top_themes = sorted(all_themes.items(), key=lambda x: x[1], reverse=True)[
                :5
            ]
            print("      🎯 Common themes across documents:")
            for i, (word, freq) in enumerate(top_themes, 1):
                print(f"         {i}. '{word}': {freq} mentions")


def exercise_2_contact_management():
    """
    Exercise 2: Customer Contact Management System

    Demonstrates email extraction and contact database creation.
    """
    print("\n" + "=" * 60)
    print("📧 EXERCISE 2: Customer Contact Management System")
    print("=" * 60)

    # Look for email files in data directory
    data_dir = os.path.join("..", "data")
    email_files = [
        os.path.join(data_dir, "email_exchanges.txt"),
        os.path.join(data_dir, "email_exchanges_big.txt"),
    ]

    all_emails = []
    contact_database = {}
    processed_files = []

    for file_path in email_files:
        if os.path.exists(file_path):
            try:
                print(f"🔍 Processing: {os.path.basename(file_path)}")
                emails = extract_emails(file_path)

                valid_emails = []
                for email in emails:
                    if check_email(email):
                        valid_emails.append(email)

                        # Organize by domain
                        domain = email.split("@")[1].lower()
                        if domain not in contact_database:
                            contact_database[domain] = []
                        contact_database[domain].append(email)
                        all_emails.append(email)

                processed_files.append(file_path)
                print(f"   ✅ Found {len(valid_emails)} valid email addresses")

            except Exception as e:
                print(f"   ❌ Error processing {file_path}: {e}")
        else:
            print(f"   ℹ️  File not found: {os.path.basename(file_path)}")

    if all_emails:
        # Remove duplicates
        unique_emails = list(set(all_emails))

        print("\n📊 Contact Management Summary:")
        print(f"   📧 Total email addresses found: {len(all_emails)}")
        print(f"   🔄 Unique email addresses: {len(unique_emails)}")
        print(f"   🏢 Companies/domains: {len(contact_database)}")

        print("\n🏢 Contact Database by Domain:")
        for domain, emails in sorted(contact_database.items()):
            unique_domain_emails = list(set(emails))
            print(f"   📍 {domain}: {len(unique_domain_emails)} contacts")
            for email in unique_domain_emails[:3]:  # Show first 3
                print(f"      • {email}")
            if len(unique_domain_emails) > 3:
                print(f"      ... and {len(unique_domain_emails) - 3} more")

        # Export contacts to CSV
        export_contacts_to_csv(contact_database)
    else:
        print("   ℹ️  No email addresses found in available files")


def export_contacts_to_csv(contact_database: Dict[str, List[str]]):
    """
    Export contact database to CSV format for business use.
    """
    csv_file = "customer_contacts.csv"
    try:
        with open(csv_file, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(["Email", "Domain", "Company"])

            for domain, emails in contact_database.items():
                unique_emails = list(set(emails))
                for email in unique_emails:
                    # Extract company name from domain (remove .com, .org, etc.)
                    company = domain.split(".")[0].title()
                    writer.writerow([email, domain, company])

        print(f"   💾 Exported contacts to: {csv_file}")

        # Clean up demonstration file
        if os.path.exists(csv_file):
            os.remove(csv_file)
            print("   🧹 Cleaned up demonstration file")

    except Exception as e:
        print(f"   ❌ Error exporting contacts: {e}")


def main():
    """
    Main function to run all Day 16 solutions and demonstrations.
    """
    print("🐍 Day 16: File Handling for Business Analytics - Solutions")
    print("🎓 50 Days of Python for MBA Program")
    print("📚 Comprehensive demonstrations of file processing techniques")

    try:
        # Run key exercises
        exercise_1_document_analyzer()
        exercise_2_contact_management()

        print("\n" + "=" * 60)
        print("🎉 All File Handling Exercises Completed Successfully!")
        print("💡 Key Skills Demonstrated:")
        print("   📄 Text file processing and analysis")
        print("   📊 Data extraction from multiple formats")
        print("   📧 Email validation and contact management")
        print("   🔍 Document similarity and competitive analysis")
        print("   📈 Technology trend tracking")
        print("   🏗️  Integrated business intelligence systems")
        print("=" * 60)

    except Exception as e:
        print(f"❌ Error in main execution: {e}")
        print("💡 This may be due to missing sample files in the data directory")


if __name__ == "__main__":
    main()
# extract_unique_emails('../data/email_exchanges.txt')
```
````

???+ example "stop_words.py"
[View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_16_File_Handling/stop_words.py)

````
```python title="stop_words.py"
"""
English Stop Words Collection for Text Analytics

This module provides a comprehensive list of common English stop words
used in business text analysis, sentiment analysis, and natural language
processing tasks. Stop words are frequently used words that are typically
filtered out during text preprocessing to focus on meaningful content.

Business Use Cases:
- Customer review sentiment analysis
- Social media monitoring and brand sentiment
- Content analysis of business documents
- Market research text mining
- Competitor analysis from web content

Usage:
    from data.stop_words import stop_words

    # Filter out stop words from business text
    business_text = "The company has great customer service"
    filtered_words = [word for word in business_text.lower().split()
                      if word not in stop_words]
    print(filtered_words)  # ['company', 'great', 'customer', 'service']
"""

from typing import List

# Comprehensive English stop words list for business text analysis
stop_words: List[str] = [
    "i",
    "me",
    "my",
    "myself",
    "we",
    "our",
    "ours",
    "ourselves",
    "you",
    "you're",
    "you've",
    "you'll",
    "you'd",
    "your",
    "yours",
    "yourself",
    "yourselves",
    "he",
    "him",
    "his",
    "himself",
    "she",
    "she's",
    "her",
    "hers",
    "herself",
    "it",
    "it's",
    "its",
    "itself",
    "they",
    "them",
    "their",
    "theirs",
    "themselves",
    "what",
    "which",
    "who",
    "whom",
    "this",
    "that",
    "that'll",
    "these",
    "those",
    "am",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "have",
    "has",
    "had",
    "having",
    "do",
    "does",
    "did",
    "doing",
    "a",
    "an",
    "the",
    "and",
    "but",
    "if",
    "or",
    "because",
    "as",
    "until",
    "while",
    "of",
    "at",
    "by",
    "for",
    "with",
    "about",
    "against",
    "between",
    "into",
    "through",
    "during",
    "before",
    "after",
    "above",
    "below",
    "to",
    "from",
    "up",
    "down",
    "in",
    "out",
    "on",
    "off",
    "over",
    "under",
    "again",
    "further",
    "then",
    "once",
    "here",
    "there",
    "when",
    "where",
    "why",
    "how",
    "all",
    "any",
    "both",
    "each",
    "few",
    "more",
    "most",
    "other",
    "some",
    "such",
    "no",
    "nor",
    "not",
    "only",
    "own",
    "same",
    "so",
    "than",
    "too",
    "very",
    "s",
    "t",
    "can",
    "will",
    "just",
    "don",
    "don't",
    "should",
    "should've",
    "now",
    "d",
    "ll",
    "m",
    "o",
    "re",
    "ve",
    "y",
    "ain",
    "aren",
    "aren't",
    "couldn",
    "couldn't",
    "didn",
    "didn't",
    "doesn",
    "doesn't",
    "hadn",
    "hadn't",
    "hasn",
    "hasn't",
    "haven",
    "haven't",
    "isn",
    "isn't",
    "ma",
    "mightn",
    "mightn't",
    "mustn",
    "mustn't",
    "needn",
    "needn't",
    "shan",
    "shan't",
    "shouldn",
    "shouldn't",
    "wasn",
    "wasn't",
    "weren",
    "weren't",
    "won",
    "won't",
    "wouldn",
    "wouldn't",
]
```
````
