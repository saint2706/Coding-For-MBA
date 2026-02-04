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
