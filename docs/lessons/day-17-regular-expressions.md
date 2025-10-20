Often, the text data you need to analyze isn't perfectly structured. You might need to find all the invoice numbers in a document, extract all email addresses from a messy text block, or validate that a product code follows a specific format. For these tasks, we use **regular expressions** (regex).

## What is a Regular Expression?

A regular expression is a special sequence of characters that defines a search pattern. It's like a mini-language for finding and manipulating text. While it can look intimidating at first, a few key patterns can solve most common business problems.

- `\d+`: Matches one or more digits (e.g., `123`).
- `[a-z]+`: Matches one or more lowercase letters.
- `\s`: Matches a whitespace character.
- `\b`: Matches a word boundary.
- `[]`: Defines a character set (e.g., `[abc]` matches 'a', 'b', or 'c').
- `[^...]`: Matches anything *not* in the character set.

## Environment Setup

Before you begin, ensure you have followed the setup instructions in the main [README.md](https://github.com/saint2706/Coding-For-MBA/blob/main/README.md) to set up your virtual environment and install the required libraries.

## Exploring the Refactored Code

The script for this lesson, `regex.py`, has been refactored to place each regex task into its own testable function.

1. **Review the Code:** Open `Day_17_Regular_Expressions/regex.py`. Examine functions like `find_most_common_words()`, `extract_and_analyze_numbers()`, `is_valid_python_variable()`, and `clean_text_advanced()`.
1. **Run the Script:** From the root directory of the project (`Coding-For-MBA`), run the script to see the functions in action:
   ```bash
   python Day_17_Regular_Expressions/regex.py
   ```
1. **Run the Tests:** You can run the tests for this lesson to verify the correctness of each regex function:
   ```bash
   pytest tests/test_day_17.py
   ```

## 💻 Exercises: Day 17

1. **Extract All Numbers from a String:**

   - In a new script (`my_solutions_17.py`), you have a string: `text = "Order #123 was placed for $49.99. The order contains 3 items."`
   - Import the `extract_and_analyze_numbers` function from the lesson script. Note that it only extracts integers. Can you modify the regex inside it to extract floating-point numbers as well?
   - Call the function and print the extracted numbers.

1. **Validate a Product Code:**

   - A valid product code must follow the format `PROD-XXXX`, where `X` is a digit.
   - Create a function `is_valid_product_code(code)` that returns `True` if the code is valid and `False` otherwise.
   - Use the `re.fullmatch(pattern, string)` function. Your pattern should look something like `r'PROD-\d{4}'`. (`\d{4}` means exactly four digits).
   - Test your function with `"PROD-1234"` (valid) and `"PROD-123"` (invalid).

1. **Clean Up a Messy Sentence:**

   - You have a sentence with extra symbols: `sentence = "Contact us... at (support@example.com)!"`
   - Import and use the `clean_text_advanced` function from the lesson to remove the punctuation and symbols.
   - Print the cleaned sentence.

🎉 **Excellent!** Regular expressions are a fundamental tool for any data analyst who works with text. They provide a powerful and efficient way to clean, validate, and extract information from unstructured data.

## Additional Materials

- **regex.ipynb**  
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_17_Regular_Expressions/regex.ipynb){ .md-button } 
  [📓 Open in NBViewer](https://nbviewer.org/github/saint2706/Coding-For-MBA/blob/main/Day_17_Regular_Expressions/regex.ipynb){ .md-button } 
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_17_Regular_Expressions/regex.ipynb){ .md-button .md-button--primary } 
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_17_Regular_Expressions/regex.ipynb){ .md-button }
- **solutions.ipynb**  
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_17_Regular_Expressions/solutions.ipynb){ .md-button } 
  [📓 Open in NBViewer](https://nbviewer.org/github/saint2706/Coding-For-MBA/blob/main/Day_17_Regular_Expressions/solutions.ipynb){ .md-button } 
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_17_Regular_Expressions/solutions.ipynb){ .md-button .md-button--primary } 
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_17_Regular_Expressions/solutions.ipynb){ .md-button }

???+ example "regex.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_17_Regular_Expressions/regex.py)

    ```python title="regex.py"
    """
    Day 17: Using Regular Expressions for Text Pattern Matching (Refactored)

    This script demonstrates how to use the 're' module for common
    business text processing tasks like finding patterns, validating text,
    and cleaning data. This version is refactored into testable functions.
    """

    import re
    from collections import Counter
    from typing import List, Tuple


    def find_most_common_words(text: str, top_n: int) -> List[Tuple[str, int]]:
        """
        Finds the most common words in a given text string.
        The text is converted to lowercase and punctuation is removed before counting.
        """
        # Use regex to find all words (sequences of alphabetic characters)
        words = re.findall(r"\b[a-z]+\b", text.lower())
        return Counter(words).most_common(top_n)


    def extract_and_analyze_numbers(text: str) -> dict:
        """
        Extracts all integer numbers from a text and returns the sorted list
        and the distance between the maximum and minimum numbers.
        """
        # Regex to find all integers, including negative ones
        numbers = [int(n) for n in re.findall(r"-?\d+", text)]
        if not numbers:
            return {"sorted_numbers": [], "distance": 0}

        numbers.sort()
        distance = numbers[-1] - numbers[0]
        return {"sorted_numbers": numbers, "distance": distance}


    def is_valid_python_variable(name: str) -> bool:
        """
        Checks if a string is a valid Python variable name using regex.
        Valid: starts with a letter or underscore, followed by letters, numbers, or underscores.
        """
        # ^[a-zA-Z_] matches the start of the string with a letter or underscore.
        # \w* matches zero or more "word" characters (letters, numbers, underscore).
        # $ matches the end of the string.
        return bool(re.fullmatch(r"[a-zA-Z_]\w*", name))


    def clean_text_advanced(text: str) -> str:
        """
        Cleans a text string by removing all non-alphanumeric characters
        (except spaces) and converting to lowercase.
        """
        # [^a-z0-9\s] is a character set that matches anything that is NOT
        # a lowercase letter, a digit, or a whitespace character.
        return re.sub(r"[^a-z0-9\s]", "", text.lower())


    def main():
        """Main function to demonstrate regex capabilities."""
        print("--- Finding Most Common Words ---")
        paragraph = (
            "I love teaching. If you do not love teaching what else can you love. I love Python if you do not love "
            "something which can give you all the capabilities to develop an application what else can you love."
        )
        top_words = find_most_common_words(paragraph, 5)
        print(f"Original Text: '{paragraph[:50]}...'")
        print(f"Top 5 most common words: {top_words}")
        print("-" * 20)

        print("--- Extracting and Analyzing Numbers ---")
        para_with_nums = (
            "The position of some particles on the x-axis are -12, -4, -3, -1, 0, 4, and 8."
        )
        analysis = extract_and_analyze_numbers(para_with_nums)
        print(f"Original Text: '{para_with_nums}'")
        print(f"Extracted and sorted numbers: {analysis['sorted_numbers']}")
        print(f"Distance between max and min: {analysis['distance']}")
        print("-" * 20)

        print("--- Validating Python Variable Names ---")
        print(
            f"'first_name' is a valid variable name: {is_valid_python_variable('first_name')}"
        )
        print(
            f"'first-name' is a valid variable name: {is_valid_python_variable('first-name')}"
        )
        print(
            f"'2nd_place' is a valid variable name: {is_valid_python_variable('2nd_place')}"
        )
        print("-" * 20)

        print("--- Advanced Text Cleaning ---")
        messy_sentence = """%I $am@% a %tea@cher%, &and& I lo%#ve %tea@ching%;."""
        cleaned = clean_text_advanced(messy_sentence)
        print(f"Original: '{messy_sentence}'")
        print(f"Cleaned: '{cleaned}'")
        print("-" * 20)


    if __name__ == "__main__":
        main()
    ```

???+ example "solutions.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_17_Regular_Expressions/solutions.py)

    ```python title="solutions.py"
    # Day 17: Regular Expressions - Solutions

    import re
    import string
    from collections import Counter

    ## Exercise 1: Find all numbers in a string

    para = """The position of some particles on the horizontal x-axis are -12, -4, -3 and -1 in the negative direction,
    0 at origin, 4 and 8 in the positive direction. """

    num_list = list(map(int, re.findall(r"[-+]?[.]?[\d]+", para)))
    print("Numbers found in the string:", num_list)


    ## Exercise 2: Validate a variable name


    def is_valid_variable(potential_variable):
        if re.search(r"^[a-zA-Z_]\w*$", potential_variable):
            return True
        else:
            return False


    print("Is '_name' a valid variable?", is_valid_variable("_name"))  # Expected: True
    print(
        "Is 'first_name' a valid variable?", is_valid_variable("first_name")
    )  # Expected: True
    print("Is '1name' a valid variable?", is_valid_variable("1name"))  # Expected: False
    print("Is 'name-1' a valid variable?", is_valid_variable("name-1"))  # Expected: False


    ## Exercise 3: Clean up a messy sentence

    sentence = """%I $am@% a %tea@cher%, &and& I lo%#ve %tea@ching%;. There $is nothing; &as& mo@re rewarding as
    educa@ting &and& @emp%o@wering peo@ple. ;I found tea@ching m%o@re interesting tha@n any other %jo@bs. %Do@es thi%s
    mo@tivate yo@u to be a tea@cher!? """


    def clean_text(text):
        text = text.lower()
        text = re.sub(r"\[.*?]", "", text)
        text = re.sub(r"https?://\S+|www\.\S+", "", text)
        text = re.sub(r"<.*?>+", "", text)
        text = re.sub(r"[%s]" % re.escape(string.punctuation), "", text)
        text = re.sub(r"\n", "", text)
        text = re.sub(r"\w*\d\w*", "", text)
        return text


    def most_common_words(text, n):
        split_it = text.split()
        return Counter(split_it).most_common(n)


    cleaned_sentence = clean_text(sentence)
    print("Cleaned sentence:", cleaned_sentence)
    print("Top 3 most common words:", most_common_words(cleaned_sentence, 3))
    ```
