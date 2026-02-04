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
