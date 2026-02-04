---
day: 49
title: "Natural Language Processing"
phase: 5
phaseTitle: "Advanced ML & Deep Learning"
slug: "nlp"
duration: 55
difficulty: "advanced"
tags: [nlp, text, machine-learning]
concepts: [text preprocessing, tokenization, embeddings, sentiment analysis]
prerequisites: [46, 48]
outcomes: [Preprocess text data, Create word embeddings, Build text classifiers]
---

# 🎯 Day 49: Natural Language Processing

> *"Teaching machines to understand human language."*

---

## The Technical Deep Dive

### Text Preprocessing

```python
import re
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer

text = "The quick brown fox jumps over the lazy dog!"

# Lowercase and remove punctuation
text = re.sub(r"[^\w\s]", "", text.lower())

# Tokenize
tokens = word_tokenize(text)

# Remove stopwords
stop_words = set(stopwords.words("english"))
tokens = [t for t in tokens if t not in stop_words]

# Stem
stemmer = PorterStemmer()
tokens = [stemmer.stem(t) for t in tokens]
```

### Bag of Words / TF-IDF

```python
from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer

texts = ["I love Python", "Python is great", "I hate bugs"]

# Bag of Words
vectorizer = CountVectorizer()
bow = vectorizer.fit_transform(texts)

# TF-IDF
tfidf = TfidfVectorizer()
X = tfidf.fit_transform(texts)
```

### Sentiment Analysis

```python
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split

# Vectorize
vectorizer = TfidfVectorizer(max_features=5000)
X = vectorizer.fit_transform(texts)

# Train classifier
X_train, X_test, y_train, y_test = train_test_split(X, labels, test_size=0.2)
model = LogisticRegression()
model.fit(X_train, y_train)
```

---

## Summary

- ✅ Preprocess: clean, tokenize, stem
- ✅ Vectorize: BoW or TF-IDF
- ✅ Classify with standard ML models
- ✅ Deep learning for more complex tasks

**Tomorrow**: MLOps fundamentals.
