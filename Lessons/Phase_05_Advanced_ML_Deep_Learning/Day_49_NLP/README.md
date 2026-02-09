---
day: 49
title: "Natural Language Processing"
phase: 5
phaseTitle: "Advanced ML & Deep Learning"
slug: "nlp"
duration: 55
difficulty: "advanced"
tags:
  - nlp
  - text-processing
  - transformers
  - sentiment-analysis
concepts:
  - "text preprocessing"
  - "tokenization and vectorization"
  - "word embeddings"
  - "sentiment analysis"
  - "named entity recognition"
prerequisites: [46, 48]
outcomes:
  - "Preprocess and clean text data"
  - "Build word embeddings for semantic understanding"
  - "Implement sentiment analysis and text classification"
  - "Use pretrained transformers for NLP tasks"
---

# 🎯 Day 49: Natural Language Processing

> *"Teaching machines to understand human language—from spam filters to ChatGPT."*

---

## The "Never-Coded" Bridge

**Imagine sorting 10,000 customer emails by urgency.** A human reads context, tone, urgency—"URGENT: Payment failed" vs "Quick question about billing." This takes hours and is prone to burnout.

NLP automates this. It teaches machines to:
- **Understand** meaning ("bank" the institution vs "bank" the river edge)
- **Classify** sentiment (angry customer vs satisfied customer)
- **Extract** key information (names, dates, amounts)
- **Generate** responses (chatbots, auto-replies)

**NLP in business today:**
- **Customer Support**: Chatbots handle 70% of queries (reduce support costs by 30%)
- **Email Triage**: Automatically route urgent emails to priority queues
- **Sentiment Analysis**: Monitor brand reputation across social media in real-time
- **Document Processing**: Extract data from invoices, contracts, resumes
- **Search Engines**: Google understands "near me" and "best" contextually

---

## The Technical Deep Dive

### Text Preprocessing: Cleaning the Mess

Raw text is messy. Before analysis, we clean and normalize.

```python
import re
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer, WordNetLemmatizer

# Download required NLTK data (run once)
# nltk.download('punkt')
# nltk.download('stopwords')
# nltk.download('wordnet')

# Sample customer review
text = "This product is AMAZING!!! I've been using it for 3 months and I'm loving it. Best purchase ever! 😊"

# Step 1: Lowercase and remove special characters
cleaned = re.sub(r'[^a-zA-Z\s]', '', text.lower())
print(f"Cleaned: {cleaned}")
# Output: "this product is amazing ive been using it for  months and im loving it best purchase ever"

# Step 2: Tokenization (split into words)
tokens = word_tokenize(cleaned)
print(f"Tokens: {tokens}")
# Output: ['this', 'product', 'is', 'amazing', 'ive', 'been', 'using', ...]

# Step 3: Remove stopwords (common words like "the", "is", "and")
stop_words = set(stopwords.words('english'))
filtered_tokens = [word for word in tokens if word not in stop_words]
print(f"Without stopwords: {filtered_tokens}")
# Output: ['product', 'amazing', 'ive', 'using', 'months', 'im', 'loving', 'best', 'purchase', 'ever']

# Step 4a: Stemming (aggressive: "running" → "run", "ran" → "ran")
stemmer = PorterStemmer()
stemmed = [stemmer.stem(word) for word in filtered_tokens]
print(f"Stemmed: {stemmed}")
# Output: ['product', 'amaz', 'ive', 'use', 'month', 'im', 'love', 'best', 'purchas', 'ever']

# Step 4b: Lemmatization (smart: "running" → "run", "ran" → "run")
lemmatizer = WordNetLemmatizer()
lemmatized = [lemmatizer.lemmatize(word, pos='v') for word in filtered_tokens]
print(f"Lemmatized: {lemmatized}")
# Output: ['product', 'amazing', 'ive', 'use', 'month', 'im', 'love', 'best', 'purchase', 'ever']
```

### Bag of Words and TF-IDF: Turning Text into Numbers

Machine learning models need numbers, not words. Two classic approaches:

```python
from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer
import pandas as pd

# Sample documents
documents = [
    "I love Python programming",
    "Python is great for machine learning",
    "I hate debugging errors",
    "Machine learning is the future",
    "Python programming is fun"
]

# Bag of Words (BoW): Count word frequency
bow_vectorizer = CountVectorizer()
bow_matrix = bow_vectorizer.fit_transform(documents)

print("Vocabulary:", bow_vectorizer.get_feature_names_out())
print("\nBoW Matrix:")
print(pd.DataFrame(bow_matrix.toarray(), columns=bow_vectorizer.get_feature_names_out()))

# TF-IDF: Term Frequency-Inverse Document Frequency
# Downweights common words, highlights unique words
tfidf_vectorizer = TfidfVectorizer()
tfidf_matrix = tfidf_vectorizer.fit_transform(documents)

print("\nTF-IDF Matrix:")
print(pd.DataFrame(tfidf_matrix.toarray(), columns=tfidf_vectorizer.get_feature_names_out()).round(2))

# What this shows:
# - "python" appears in many docs → lower TF-IDF score
# - "debugging" appears in only one doc → higher TF-IDF score
```

### Word Embeddings: Capturing Meaning

Modern NLP uses dense vector representations where similar words have similar vectors.

```python
import gensim.downloader as api
import numpy as np
from sklearn.manifold import TSNE
import matplotlib.pyplot as plt

# Load pretrained Word2Vec embeddings (run once, downloads ~1.6GB)
print("Loading Word2Vec model (this may take a minute)...")
word2vec_model = api.load('word2vec-google-news-300')

# Embedding examples
king = word2vec_model['king']
print(f"'king' embedding shape: {king.shape}")  # 300-dimensional vector

# Semantic similarity
similarity = word2vec_model.similarity('king', 'queen')
print(f"Similarity between 'king' and 'queen': {similarity:.3f}")  # ~0.651

similarity_dog_cat = word2vec_model.similarity('dog', 'cat')
print(f"Similarity between 'dog' and 'cat': {similarity_dog_cat:.3f}")  # ~0.760

# Famous word analogy: king - man + woman ≈ queen
result = word2vec_model.most_similar(positive=['king', 'woman'], negative=['man'], topn=1)
print(f"king - man + woman = {result[0][0]}")  # queen

# Visualize embeddings with t-SNE
words = ['king', 'queen', 'man', 'woman', 'prince', 'princess', 
         'dog', 'cat', 'puppy', 'kitten',
         'python', 'java', 'programming', 'code']

word_vectors = np.array([word2vec_model[word] for word in words])

# Reduce 300D to 2D for visualization
tsne = TSNE(n_components=2, random_state=42, perplexity=5)
embeddings_2d = tsne.fit_transform(word_vectors)

# Plot
plt.figure(figsize=(12, 8))
plt.scatter(embeddings_2d[:, 0], embeddings_2d[:, 1], alpha=0.5)
for i, word in enumerate(words):
    plt.annotate(word, (embeddings_2d[i, 0], embeddings_2d[i, 1]), fontsize=12)
plt.title('Word2Vec Embeddings (t-SNE projection)')
plt.xlabel('Dimension 1')
plt.ylabel('Dimension 2')
plt.grid(True, alpha=0.3)
plt.show()
```

### Sentiment Analysis: Classifying Opinions

```python
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, confusion_matrix
import numpy as np

# Sample movie reviews dataset
reviews = [
    "This movie was absolutely fantastic! Loved every minute.",
    "Worst film I've ever seen. Waste of time.",
    "Pretty good, would recommend to friends.",
    "Terrible acting and boring plot.",
    "Masterpiece! Oscar-worthy performance.",
    "Meh, it was okay. Nothing special.",
    "Brilliant cinematography and storytelling.",
    "I fell asleep halfway through.",
    "Amazing! Best movie of the year!",
    "Disappointing. Expected much more."
]

# Labels: 1 = positive, 0 = negative
labels = [1, 0, 1, 0, 1, 0, 1, 0, 1, 0]

# Vectorize text
vectorizer = TfidfVectorizer(max_features=100, ngram_range=(1, 2))  # unigrams + bigrams
X = vectorizer.fit_transform(reviews)
y = np.array(labels)

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)

# Train classifier
model = LogisticRegression(max_iter=1000)
model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)
print("=== Sentiment Analysis Performance ===")
print(classification_report(y_test, y_pred, target_names=['Negative', 'Positive']))

# Predict on new review
new_review = ["This movie exceeded all my expectations!"]
new_vector = vectorizer.transform(new_review)
prediction = model.predict(new_vector)[0]
probability = model.predict_proba(new_vector)[0]

print(f"\nNew Review: {new_review[0]}")
print(f"Sentiment: {'Positive' if prediction == 1 else 'Negative'}")
print(f"Confidence: {probability[prediction]:.1%}")
```

### Modern NLP with Transformers

```python
from transformers import pipeline

# Load pretrained sentiment analysis model
# First run downloads model (~500MB)
sentiment_analyzer = pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english")

# Analyze sentiment
texts = [
    "I absolutely love this product!",
    "This is the worst experience ever.",
    "It's okay, nothing special."
]

results = sentiment_analyzer(texts)
for text, result in zip(texts, results):
    print(f"Text: {text}")
    print(f"  → {result['label']}: {result['score']:.2%}\n")

# Named Entity Recognition (NER)
ner = pipeline("ner", model="dbmdz/bert-large-cased-finetuned-conll03-english", grouped_entities=True)

text = "Apple Inc. CEO Tim Cook announced new products in Cupertino on March 15th."
entities = ner(text)

print("=== Named Entities ===")
for entity in entities:
    print(f"{entity['word']}: {entity['entity_group']} (confidence: {entity['score']:.2%})")
```

---

## Senior-Level Insights

### Text Representation Comparison

| Method       | Dimensionality        | Semantics | Speed    | Use Case                            |
| ------------ | --------------------- | --------- | -------- | ----------------------------------- |
| **BoW**      | Vocabulary size       | ❌ No      | ⚡ Fast   | Simple classification, topic models |
| **TF-IDF**   | Vocabulary size       | ❌ No      | ⚡ Fast   | Document similarity, search         |
| **Word2Vec** | 50-300                | ✅ Yes     | 🔥 Medium | Semantic similarity, analogies      |
| **BERT**     | 768-1024 (contextual) | ✅✅ Yes    | 🐌 Slow   | Question answering, complex NLU     |

### Preprocessing Trade-offs

```python
# Aggressive preprocessing (classic ML)
# - Lowercase, remove punctuation, stem
# - Pro: Reduces vocabulary, faster training
# - Con: Loses information ("US" vs "us", "Apple" vs "apple")

# Minimal preprocessing (transformers)
# - Keep casing, punctuation, use subword tokenization
# - Pro: Preserves all information
# - Con: Larger vocabulary, slower
```

### When to Use What

| Task                     | Recommended Approach                   |
| ------------------------ | -------------------------------------- |
| Spam detection           | TF-IDF + Logistic Regression           |
| Sentiment analysis       | Pretrained BERT fine-tuning            |
| Topic modeling           | LDA or NMF on TF-IDF                   |
| Named entity recognition | SpaCy or Hugging Face transformers     |
| Text generation          | GPT-2/GPT-3                            |
| Translation              | MarianMT or Google Translate API       |
| Large-scale search       | Elasticsearch with TF-IDF + embeddings |

---

## Hands-on Lab

### Exercise 1: Email Spam Classifier

Build a spam filter using real-world techniques.

```python
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import MultinomialNB
from sklearn.metrics import classification_report, confusion_matrix
import seaborn as sns
import matplotlib.pyplot as plt

# Sample email dataset
emails = [
    "Congratulations! You've won $1,000,000! Click here now!",
    "Meeting scheduled for tomorrow at 10 AM",
    "URGENT: Your account will be closed unless you verify",
    "Can you review the attached quarterly report?",
    "FREE VIAGRA! Limited time offer!",
    "Let's catch up over coffee next week",
    "You have been selected for a special prize",
    "Project deadline reminder: Submit by Friday",
    "Click here to claim your free iPhone!",
    "Thanks for your email. I'll get back to you soon."
]

labels = [1, 0, 1, 0, 1, 0, 1, 0, 1, 0]  # 1 = spam, 0 = ham

# Expand with more samples (in practice, use real dataset)
X_text = emails * 10  # Duplicate for demonstration
y = labels * 10

# Vectorize
vectorizer = TfidfVectorizer(max_features=50, stop_words='english')
X = vectorizer.fit_transform(X_text)

# Split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)

# Train Naive Bayes (classic for spam detection)
model = MultinomialNB()
model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)
print("=== Spam Classifier Performance ===")
print(classification_report(y_test, y_pred, target_names=['Ham', 'Spam']))

# Confusion matrix
cm = confusion_matrix(y_test, y_pred)
plt.figure(figsize=(6, 5))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=['Ham', 'Spam'], yticklabels=['Ham', 'Spam'])
plt.xlabel('Predicted')
plt.ylabel('Actual')
plt.title('Spam Detection Confusion Matrix')
plt.show()

# Show most indicative words
feature_names = vectorizer.get_feature_names_out()
spam_words_idx = model.feature_log_prob_[1].argsort()[-10:][::-1]
print("\nTop spam indicators:", [feature_names[i] for i in spam_words_idx])
```

---

### Exercise 2: Customer Review Sentiment Dashboard

Analyze product reviews at scale.

```python
import pandas as pd
from textblob import TextBlob
import matplotlib.pyplot as plt

# Sample product reviews
reviews_data = pd.DataFrame({
    'review': [
        "Absolutely love this product! Best purchase ever.",
        "Terrible quality. Broke after 2 days.",
        "Good value for money. Works as expected.",
        "Not worth the price. Very disappointed.",
        "Amazing! Exceeded all expectations.",
        "Meh, it's okay. Nothing special.",
        "Fantastic quality and fast shipping!",
        "Worst product I've ever bought.",
        "Pretty decent, would buy again.",
        "Complete waste of money."
    ],
    'date': pd.date_range('2024-01-01', periods=10, freq='D')
})

# Sentiment analysis with TextBlob (simpler than training custom model)
def get_sentiment(text):
    analysis = TextBlob(text)
    # Polarity: -1 (negative) to +1 (positive)
    polarity = analysis.sentiment.polarity
    if polarity > 0.1:
        return 'Positive', polarity
    elif polarity < -0.1:
        return 'Negative', polarity
    else:
        return 'Neutral', polarity

reviews_data[['sentiment', 'polarity']] = reviews_data['review'].apply(
    lambda x: pd.Series(get_sentiment(x))
)

print("=== Sentiment Analysis Results ===")
print(reviews_data[['review', 'sentiment', 'polarity']])

# Visualize sentiment distribution
sentiment_counts = reviews_data['sentiment'].value_counts()
plt.figure(figsize=(10, 5))

plt.subplot(1, 2, 1)
sentiment_counts.plot(kind='bar', color=['green', 'gray', 'red'])
plt.title('Sentiment Distribution')
plt.xlabel('Sentiment')
plt.ylabel('Count')
plt.xticks(rotation=0)

plt.subplot(1, 2, 2)
plt.scatter(reviews_data['date'], reviews_data['polarity'], 
            c=reviews_data['polarity'], cmap='RdYlGn', s=100, alpha=0.6)
plt.axhline(y=0, color='black', linestyle='--', alpha=0.3)
plt.title('Sentiment Over Time')
plt.xlabel('Date')
plt.ylabel('Polarity Score')
plt.colorbar(label='Sentiment')
plt.tight_layout()
plt.show()

# Alert on negative trend
avg_sentiment = reviews_data['polarity'].mean()
print(f"\nAverage Sentiment: {avg_sentiment:.2f}")
if avg_sentiment < -0.2:
    print("⚠️  ALERT: Negative sentiment trend detected!")
```

---

### Exercise 3: Document Similarity Finder

Find similar documents using embeddings.

```python
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

# Document collection
documents = [
    "Python is a popular programming language for data science",
    "Machine learning algorithms can predict customer churn",
    "JavaScript is widely used for web development",
    "Deep learning models require large datasets for training",
    "SQL is essential for database management",
    "Data scientists use Python and R for analytics",
    "Neural networks are inspired by the human brain",
    "Web developers prefer React and Vue frameworks"
]

# Vectorize documents
vectorizer = TfidfVectorizer()
tfidf_matrix = vectorizer.fit_transform(documents)

# Compute cosine similarity between all documents
similarity_matrix = cosine_similarity(tfidf_matrix)

# Function to find similar documents
def find_similar(query_idx, top_n=3):
    similarities = similarity_matrix[query_idx]
    # Get indices of most similar (excluding the query itself)
    similar_idx = similarities.argsort()[::-1][1:top_n+1]
    
    print(f"Query Document: \"{documents[query_idx]}\"")
    print(f"\nTop {top_n} Similar Documents:")
    for idx in similar_idx:
        print(f"  Similarity: {similarities[idx]:.3f} - \"{documents[idx]}\"")

# Example: Find documents similar to document 0
find_similar(0, top_n=3)

# Visualize similarity matrix
import matplotlib.pyplot as plt
import seaborn as sns

plt.figure(figsize=(10, 8))
sns.heatmap(similarity_matrix, annot=True, fmt='.2f', cmap='YlGnBu', 
            xticklabels=range(len(documents)), yticklabels=range(len(documents)))
plt.title('Document Similarity Matrix')
plt.xlabel('Document Index')
plt.ylabel('Document Index')
plt.tight_layout()
plt.show()
```

---

## Mastery Check

### Question 1: Preprocessing Choice
Why would you use lemmatization instead of stemming for a customer service chatbot?

<details>
<summary>Click for Answer</summary>

**Answer:** Lemmatization is better for chatbots because it preserves actual words that can be displayed to users.

**Comparison:**
- **Stemming**: "running" → "run", "meeting" → "meet", "better" → "better"
  - Fast but produces non-words: "studies" → "studi"
- **Lemmatization**: "running" → "run", "meeting" → "meeting", "better" → "good"
  - Slower but produces real words

**For chatbots**, responses need to be readable:
```python
# Stemmed: "Your meet has been confirm"
# Lemmatized: "Your meeting has been confirmed"
```

**Use stemming** for search engines (speed matters, display doesn't)  
**Use lemmatization** for user-facing applications (readability matters)

</details>

---

### Question 2: BoW vs TF-IDF
You're building a news article classifier. 100 articles mention "the" and "a" frequently, but only 3 mention "blockchain". Which vectorization gives better features?

<details>
<summary>Click for Answer</summary>

**Answer:** TF-IDF is better because it reduces the weight of common words and highlights distinctive words like "blockchain".

**Why:**
- **Bag of Words**: Counts raw frequency
  - "the" appears 1000 times → high weight
  - "blockchain" appears 10 times → low weight
  - Common words dominate, masking meaningful signals

- **TF-IDF**: Balances frequency with uniqueness
  - "the" appears in all docs → IDF is low → weight reduced
  - "blockchain" appears in 3/100 docs → IDF is high → weight boosted
  - Distinctive words are highlighted

**Formula:**
```
TF-IDF(word, doc) = TF(word, doc) × log(total_docs / docs_containing_word)
```

**Practical impact**: In news classification, TF-IDF helps distinguish between topics (sports vs finance) by emphasizing category-specific terms.

</details>

---

### Question 3: Word Embeddings Analogy
If `king - man + woman ≈ queen`, what mathematical operation allows this? Why doesn't BoW support analogies?

<details>
<summary>Click for Answer</summary>

**Answer:** Word embeddings represent words as dense vectors in a semantic space where relationships are captured by vector arithmetic. BoW represents words as independent dimensions with no relationships.

**Why embeddings work:**
```python
king = [0.2, 0.5, 0.8, ...]  # 300D vector
man = [0.1, 0.4, 0.6, ...]
woman = [0.1, 0.3, 0.5, ...]

# Vector arithmetic captures relationships
king - man + woman ≈ [0.1, 0.4, 0.7, ...] ≈ queen
```

**Geometric interpretation:**
- "king" and "man" differ by a "royalty" vector
- "queen" and "woman" differ by the same "royalty" vector
- Embeddings place semantically similar words close together in space

**Why BoW fails:**
```python
# BoW: Each word is a separate dimension
king = [0, 1, 0, 0, ...]  # Position 1 in vocabulary
man = [0, 0, 1, 0, ...]   # Position 2 in vocabulary
# Subtracting gives nonsensical results
```

**Key difference**: Embeddings encode meaning in dense continuous space; BoW treats words as independent symbols.

</details>

---

### Question 4: Sentiment False Positives
Your sentiment model classifies "This movie is not bad" as negative (wrong—it's positive). What's the issue and how do you fix it?

<details>
<summary>Click for Answer</summary>

**Answer:** The model doesn't understand negation. "not bad" should flip sentiment, but simple bag-of-words sees "bad" and predicts negative.

**The problem:**
```python
# BoW/TF-IDF representation
"This movie is not bad" → ['movie', 'not', 'bad']
# Model sees "bad" → predicts negative ❌
```

**Solutions:**

1. **Use n-grams** (capture word pairs):
   ```python
   TfidfVectorizer(ngram_range=(1, 2))  # Include bigrams
   # Now captures "not bad" as a single feature
   ```

2. **Negation handling**:
   ```python
   # Attach "NOT_" to words following negation
   "not bad" → "not NOT_bad"
   ```

3. **Use deep learning** (LSTM, transformers):
   - Models learn context and word order
   - BERT understands "not bad" means positive

**Best practice**: For production sentiment analysis, use pretrained transformers (BERT, RoBERTa) that handle negation, sarcasm, and context naturally.

</details>

---

### Question 5: Production NLP Pipeline
Design an end-to-end system for automatically categorizing incoming support tickets (billing, technical, account) and routing them. What components do you need?

<details>
<summary>Click for Answer</summary>

**Answer:** A production NLP pipeline requires data preprocessing, model training, API deployment, monitoring, and continuous improvement.

**Architecture:**

```
1. Data Ingestion
   ↓ Email/chat arrives
   
2. Preprocessing Pipeline
   ├─ Text cleaning (remove HTML, special chars)
   ├─ Tokenization
   └─ Vectorization (TF-IDF or BERT embeddings)
   
3. Classification Model
   ├─ Model: Fine-tuned BERT or Logistic Regression
   ├─ Outputs: [billing: 0.15, technical: 0.70, account: 0.15]
   └─ Confidence threshold (e.g., route if > 0.60)
   
4. Routing Logic
   ├─ High confidence → Auto-route
   ├─ Low confidence → Manual review queue
   └─ Log predictions for retraining
   
5. API Layer
   └─ FastAPI endpoint: POST /classify
   
6. Monitoring
   ├─ Model accuracy tracking
   ├─ Prediction confidence distribution
   └─ Data drift alerts (vocabulary changes)
   
7. Feedback Loop
   └─ Agents correct misclassifications → Retrain monthly
```

**Code sketch:**
```python
from fastapi import FastAPI
from transformers import pipeline
import logging

app = FastAPI()
classifier = pipeline("text-classification", model="fine-tuned-bert")

@app.post("/classify")
def classify_ticket(text: str):
    result = classifier(text)[0]
    
    # Log for monitoring
    logging.info(f"Prediction: {result['label']} ({result['score']:.2f})")
    
    # Route if confident
    if result['score'] > 0.60:
        route = result['label']
        status = "auto-routed"
    else:
        route = "manual-review"
        status = "low-confidence"
    
    return {"category": route, "confidence": result['score'], "status": status}
```

**Production considerations:**
- **Scalability**: Deploy on Kubernetes, autoscale based on traffic
- **Latency**: Cache common queries, use smaller/faster models if needed
- **Security**: Sanitize inputs (prevent injection attacks)
- **Privacy**: Mask PII before logging
- **Versioning**: Track model version, A/B test new models

</details>

---

## Summary

Today you learned:
- ✅ Text preprocessing: cleaning, tokenization, stemming vs lemmatization
- ✅ Classical methods: BoW and TF-IDF for vectorization
- ✅ Word embeddings: Word2Vec captures semantic relationships
- ✅ Sentiment analysis: From logistic regression to transformers
- ✅ Modern NLP: Leveraging pretrained models (BERT) for state-of-the-art results
- ✅ Production pipelines: From raw text to deployed classification system

**Tomorrow**: MLOps—versioning, deploying, and monitoring ML models in production.
