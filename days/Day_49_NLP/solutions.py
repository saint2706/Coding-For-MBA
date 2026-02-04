"""Utility functions and a demo for bag-of-words and TF-IDF vectorization."""

import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer


def build_count_matrix(corpus):
    """Return a document-term matrix of raw counts for the given corpus."""

    vectorizer = CountVectorizer()
    matrix = vectorizer.fit_transform(corpus)
    return pd.DataFrame(matrix.toarray(), columns=vectorizer.get_feature_names_out())


def build_tfidf_matrix(corpus):
    """Return a document-term matrix of TF-IDF scores for the given corpus."""

    vectorizer = TfidfVectorizer()
    matrix = vectorizer.fit_transform(corpus)
    return pd.DataFrame(matrix.toarray(), columns=vectorizer.get_feature_names_out())


def demo():
    """Print a walkthrough of bag-of-words and TF-IDF representations."""

    corpus = [
        "The quick brown fox jumped over the lazy dog.",
        "The dog was not lazy.",
        "The fox is quick.",
    ]

    print("--- NLP Vectorization Demo ---")
    print("Sample Corpus:")
    for doc in corpus:
        print(f"- '{doc}'")
    print("-" * 30)

    print("\n--- 1. Bag-of-Words (CountVectorizer) ---")
    df_count = build_count_matrix(corpus)
    print("Vocabulary (Feature Names):")
    print(df_count.columns.to_list())
    print("\nDocument-Term Matrix (Counts):")
    print(df_count)
    print("This matrix shows the count of each word in each document.")
    print("-" * 30)

    print("\n--- 2. TF-IDF (TfidfVectorizer) ---")
    df_tfidf = build_tfidf_matrix(corpus)
    print("Vocabulary (Feature Names):")
    print(df_tfidf.columns.to_list())
    print("\nTF-IDF Matrix:")
    print(df_tfidf.round(2))
    print(
        "This matrix shows the TF-IDF score for each word, highlighting important words."
    )
    print("-" * 30)


if __name__ == "__main__":
    demo()
