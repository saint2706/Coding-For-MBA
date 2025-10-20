## Overview

Day 49 introduces the classic feature-extraction techniques that turn raw
text into numeric matrices. Bag-of-words counts and TF-IDF scores are the
foundations for many traditional NLP pipelines and remain useful for quick
baselines or lightweight models.

## What's in this folder?

- `solutions.py` – exposes `build_count_matrix` and `build_tfidf_matrix`
  helper functions plus a small demo script that prints both
  representations for a sample corpus.

## Running the lesson script

Ensure the lesson dependencies are installed (in particular
`scikit-learn`, `pandas`, and `numpy`). Then execute the walkthrough:

```bash
python Day_49_NLP/solutions.py
```

## Running the tests

The automated checks validate the helper functions against a miniature
corpus. Run them with:

```bash
pytest tests/test_day_49.py
```

All tests expect to be run from the repository root so that imports
resolve correctly.

## Next steps

- Jump to [`Day_64_Modern_NLP_Pipelines`](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_64_Modern_NLP_Pipelines/README.md)
  for transformer fine-tuning, retrieval-augmented generation, and robust
  evaluation workflows that build on the vectorization foundations covered
  here.

## Additional Materials

- **solutions.ipynb**  
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_49_NLP/solutions.ipynb){ .md-button } 
  [📓 Open in NBViewer](https://nbviewer.org/github/saint2706/Coding-For-MBA/blob/main/Day_49_NLP/solutions.ipynb){ .md-button } 
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_49_NLP/solutions.ipynb){ .md-button .md-button--primary } 
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_49_NLP/solutions.ipynb){ .md-button }

???+ example "solutions.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_49_NLP/solutions.py)

    ```python title="solutions.py"
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
    ```
