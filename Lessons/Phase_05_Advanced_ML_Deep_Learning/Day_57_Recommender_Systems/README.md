---
day: 57
title: "Recommender Systems"
phase: 5
phaseTitle: "Advanced ML & Deep Learning"
slug: "recommender-systems"
duration: 55
difficulty: "advanced"
tags: [machine-learning, recommendations, collaborative-filtering]
concepts: [collaborative filtering, content-based, matrix factorization]
prerequisites: [38, 44]
outcomes: [Build recommendation engines, Understand filtering approaches, Implement matrix factorization]
---

# 🎯 Day 57: Recommender Systems

> *"Netflix recommendations. Amazon suggestions. Spotify playlists. All ML."*

---

## The Technical Deep Dive

### Content-Based Filtering

```python
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Item descriptions
tfidf = TfidfVectorizer()
item_vectors = tfidf.fit_transform(descriptions)

# Find similar items
similarities = cosine_similarity(item_vectors)
```

### Collaborative Filtering

```python
from surprise import SVD, Dataset, Reader

reader = Reader(rating_scale=(1, 5))
data = Dataset.load_from_df(ratings[["user", "item", "rating"]], reader)

model = SVD()
trainset = data.build_full_trainset()
model.fit(trainset)

prediction = model.predict(user_id, item_id)
```

---

## Summary

- ✅ Content-based: item similarity
- ✅ Collaborative: user behavior patterns
- ✅ Matrix factorization: latent features

**Tomorrow**: Transformers and Attention.
