---
day: 57
title: "Recommender Systems"
phase: 5
phaseTitle: "Advanced ML & Deep Learning"
slug: "recommender-systems"
duration: 55
difficulty: "advanced"
tags:
  - machine-learning
  - recommendations
  - collaborative-filtering
  - matrix-factorization
concepts:
  - "collaborative filtering (user-based, item-based)"
  - "content-based filtering"
  - "matrix factorization (SVD, ALS)"
  - "hybrid recommendation systems"
  - "cold start problem solutions"
prerequisites: [38, 44]
outcomes:
  - "Build collaborative filtering models"
  - "Implement content-based recommendations"
  - "Apply matrix factorization techniques"
  - "Handle cold start and sparsity problems"
---

# 🎯 Day 57: Recommender Systems

> *"Netflix recommendations. Amazon suggestions. Spotify playlists. All ML."*

---

## The "Never-Coded" Bridge

**Why did you click on that YouTube video?** The algorithm knew you'd like it.

Recommendation engines drive modern digital business:

**E-commerce:**

- **Amazon**: 35% of Amazon's revenue comes from recommendations
- Product suggestions → impulse purchases → higher cart value
- "Customers who bought X also bought Y"

**Streaming:**

- **Netflix**: 80% of watched content comes from recommendations
- Personalized homepage → increased engagement → reduced churn
- Saves $1B/year in customer retention

**Social Media:**

- **TikTok**: For You Page algorithm drives addiction
- **Instagram**: Recommended posts keep users scrolling
- **Twitter**: Algorithmic timeline prioritizes engaging content

**Music:**

- **Spotify**: Discover Weekly, Release Radar
- 40% of new artist discoveries through recommendations
- Personalized playlists → premium subscriptions

**The business problem:**

- **Paradox of choice**: 100M songs on Spotify → users overwhelmed
- **Discovery**: How do users find relevant content?
- **Engagement**: Keep users on platform longer
- **Revenue**: Recommendations drive purchases and ad views

**Key challenges:**

1. **Sparsity**: Most users rate <0.1% of items
2. **Cold start**: No data for new users/items
3. **Scalability**: Billions of users × millions of items
4. **Diversity vs accuracy**: Balance relevance with serendipity

---

## The Technical Deep Dive

### Content-Based Filtering

**Idea:** Recommend items similar to what the user liked before.

```python
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Sample movie data
movies = pd.DataFrame({
    'movie_id': [1, 2, 3, 4, 5],
    'title': ['The Matrix', 'John Wick', 'Inception', 'Toy Story', 'Finding Nemo'],
    'genre': ['sci-fi action', 'action thriller', 'sci-fi thriller', 'animation comedy', 'animation adventure'],
    'director': ['Wachowski', 'Stahelski', 'Nolan', 'Lasseter', 'Stanton'],
    'actors': ['Reeves Fishburne', 'Reeves McShane', 'DiCaprio Cotillard', 'Hanks Allen', 'DeGeneres Brooks']
})

# Combine features into description
movies['description'] = movies['genre'] + ' ' + movies['director'] + ' ' + movies['actors']

# TF-IDF vectorization
tfidf = TfidfVectorizer(stop_words='english')
tfidf_matrix = tfidf.fit_transform(movies['description'])

# Compute item similarity
item_similarity = cosine_similarity(tfidf_matrix)

print("=== Item Similarity Matrix ===")
similarity_df = pd.DataFrame(
    item_similarity,
    index=movies['title'],
    columns=movies['title']
)
print(similarity_df.round(2))

# Recommend movies similar to "The Matrix"
def get_recommendations(movie_title, n=3):
    idx = movies[movies['title'] == movie_title].index[0]
    sim_scores = list(enumerate(item_similarity[idx]))
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)[1:n+1]  # Exclude itself
    
    print(f"\n=== Recommendations for '{movie_title}' ===")
    for i, score in sim_scores:
        print(f"{movies.iloc[i]['title']}: {score:.2f} similarity")

get_recommendations('The Matrix')
get_recommendations('Toy Story')
```

### User-Based Collaborative Filtering

**Idea:** Find similar users, recommend what they liked.

```python
# User-item ratings matrix
ratings = pd.DataFrame({
    'user_id': [1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 5, 5],
    'movie_id': [1, 2, 3, 1, 2, 4, 2, 3, 5, 1, 4, 3, 5],
    'rating': [5, 4, 3, 4, 5, 2, 5, 4, 4, 5, 3, 4, 5]
})

# Pivot to user-item matrix
user_item_matrix = ratings.pivot(index='user_id', columns='movie_id', values='rating').fillna(0)

print("=== User-Item Matrix ===")
print(user_item_matrix)

# Compute user similarity
from sklearn.metrics.pairwise import cosine_similarity

user_similarity = cosine_similarity(user_item_matrix)
user_similarity_df = pd.DataFrame(
    user_similarity,
    index=user_item_matrix.index,
    columns=user_item_matrix.index
)

print("\n=== User Similarity Matrix ===")
print(user_similarity_df.round(2))

# Predict rating for user=1, movie=5
def predict_rating(user_id, movie_id, k=2):
    """Predict rating using k nearest neighbors."""
    
    # Get k most similar users who rated this movie
    user_idx = user_id - 1
    movie_col = movie_id
    
    similar_users = user_similarity_df.iloc[user_idx].drop(user_id).nlargest(k)
    
    # Weighted average of their ratings
    total_similarity = 0
    weighted_sum = 0
    
    for similar_user_id, similarity in similar_users.items():
        if user_item_matrix.loc[similar_user_id, movie_col] > 0:
            weighted_sum += similarity * user_item_matrix.loc[similar_user_id, movie_col]
            total_similarity += similarity
    
    if total_similarity == 0:
        return user_item_matrix.mean(axis=0)[movie_col]  # Fall back to average
    
    return weighted_sum / total_similarity

# Predict
predicted_rating = predict_rating(user_id=1, movie_id=5, k=2)
print(f"\nPredicted rating for User 1, Movie 5: {predicted_rating:.2f}")
```

### Item-Based Collaborative Filtering

**Idea:** Find similar items, weight by user's historical ratings.

```python
# Compute item similarity
item_similarity_cf = cosine_similarity(user_item_matrix.T)
item_similarity_cf_df = pd.DataFrame(
    item_similarity_cf,
    index=user_item_matrix.columns,
    columns=user_item_matrix.columns
)

print("=== Item Similarity (Collaborative Filtering) ===")
print(item_similarity_cf_df.round(2))

def predict_rating_item_based(user_id, movie_id, k=2):
    """Predict rating using item-based CF."""
    
    # Get user's rated movies
    user_ratings = user_item_matrix.loc[user_id]
    rated_movies = user_ratings[user_ratings > 0]
    
    # Get k most similar items
    similar_items = item_similarity_cf_df[movie_id].drop(movie_id).nlargest(k)
    
    # Weighted average
    total_similarity = 0
    weighted_sum = 0
    
    for similar_item_id, similarity in similar_items.items():
        if similar_item_id in rated_movies.index and rated_movies[similar_item_id] > 0:
            weighted_sum += similarity * rated_movies[similar_item_id]
            total_similarity += similarity
    
    if total_similarity == 0:
        return user_item_matrix.mean(axis=0)[movie_id]
    
    return weighted_sum / total_similarity

predicted_item_based = predict_rating_item_based(user_id=1, movie_id=5, k=2)
print(f"\nItem-based predicted rating for User 1, Movie 5: {predicted_item_based:.2f}")
```

### Matrix Factorization: SVD (Singular Value Decomposition)

**Idea:** Decompose user-item matrix into latent factors.

```python
from surprise import SVD, Dataset, Reader, accuracy
from surprise.model_selection import train_test_split

# Prepare data for Surprise library
reader = Reader(rating_scale=(1, 5))
data = Dataset.load_from_df(ratings[['user_id', 'movie_id', 'rating']], reader)

# Train/test split
trainset, testset = train_test_split(data, test_size=0.25, random_state=42)

# SVD model
svd = SVD(n_factors=5, n_epochs=20, lr_all=0.005, reg_all=0.02, random_state=42)
svd.fit(trainset)

# Predictions
predictions = svd.test(testset)

# Evaluate
rmse = accuracy.rmse(predictions)

print(f"\n=== SVD Model ===")
print(f"RMSE: {rmse:.3f}")

# Predict specific user-item
pred = svd.predict(uid=1, iid=5)
print(f"\nSVD Prediction for User 1, Movie 5: {pred.est:.2f} (actual: unknown)")

# Get top N recommendations for a user
from collections import defaultdict

def get_top_n_recommendations(predictions, n=3):
    """Get top N recommendations for each user."""
    
    top_n = defaultdict(list)
    for uid, iid, true_r, est, _ in predictions:
        top_n[uid].append((iid, est))
    
    # Sort and get top N
    for uid, user_ratings in top_n.items():
        user_ratings.sort(key=lambda x: x[1], reverse=True)
        top_n[uid] = user_ratings[:n]
    
    return top_n

top_n = get_top_n_recommendations(predictions, n=3)

print("\n=== Top 3 Recommendations per User ===")
for user, recs in sorted(top_n.items()):
    print(f"User {user}: {[f'Movie {iid} ({est:.2f})' for iid, est in recs]}")
```

### ALS (Alternating Least Squares) for Implicit Rating

**Used for:** Clicks, views, plays (no explicit ratings)

```python
from scipy.sparse import csr_matrix
from implicit.als import AlternatingLeastSquares

# Simulate implicit feedback (e.g., number of times watched)
implicit_data = pd.DataFrame({
    'user_id': [0, 0, 1, 1, 2, 2, 3],
    'movie_id': [0, 1, 1, 2, 0, 3, 2],
    'confidence': [5, 3, 10, 2, 7, 4, 8]  # Higher = more confidence
})

# Create sparse matrix (required for implicit library)
sparse_matrix = csr_matrix(
    (implicit_data['confidence'], (implicit_data['user_id'], implicit_data['movie_id'])),
    shape=(4, 4)
)

# ALS model
als_model = AlternatingLeastSquares(factors=5, iterations=20, regularization=0.01)
als_model.fit(sparse_matrix)

# Recommend for user 0
user_id = 0
recommendations = als_model.recommend(user_id, sparse_matrix[user_id], N=3)

print("=== ALS Recommendations for User 0 ===")
for item_id, score in recommendations:
    print(f"Movie {item_id}: {score:.3f}")
```

---

## Senior-Level Insights

### Recommendation Approaches Comparison

| Approach                 | Pros                                 | Cons                                   | Use Case                     |
| ------------------------ | ------------------------------------ | -------------------------------------- | ---------------------------- |
| **Content-Based**        | No cold start for users, explainable | Requires item features, no serendipity | News, articles, job postings |
| **User-Based CF**        | Simple, works with sparse data       | Doesn't scale, user preferences change | Small communities            |
| **Item-Based CF**        | Scalable, stable over time           | Cold start for new items               | E-commerce (Amazon)          |
| **Matrix Factorization** | Handles sparsity, scalable           | Black box, cold start                  | Netflix, Spotify             |
| **Deep Learning**        | Captures complex patterns            | Needs lots of data, slow               | YouTube, TikTok              |

### Cold Start Problem Solutions

```python
strategies = {
    "New User": [
        "Ask for preferences during onboarding",
        "Recommend popular items (most viewed/purchased)",
        "Use demographic info (age, location)",
        "Content-based on clicked items"
    ],
    "New Item": [
        "Content-based similarity to existing items",
        "Boost new items temporarily (exploration)",
        "Use item metadata (genre, tags)",
        "Hybrid: combine content + collaborative"
    ],
    "New System": [
        "Bootstrap with external data (IMDb ratings)",
        "Active learning: ask users to rate seed items",
        "Use non-personalized rules initially"
    ]
}
```

### Evaluation Metrics

```python
# Rating prediction metrics
from sklearn.metrics import mean_squared_error, mean_absolute_error

rmse = np.sqrt(mean_squared_error(y_true, y_pred))  # Penalizes large errors
mae = mean_absolute_error(y_true, y_pred)  # Average error

# Ranking metrics
def precision_at_k(recommended, relevant, k):
    """Precision @ K"""
    recommended_k = recommended[:k]
    return len(set(recommended_k) & set(relevant)) / k

def recall_at_k(recommended, relevant, k):
    """Recall @ K"""
    recommended_k = recommended[:k]
    return len(set(recommended_k) & set(relevant)) / len(relevant)

def ndcg_at_k(recommended, relevant, k):
    """Normalized Discounted Cumulative Gain"""
    dcg = sum([1 / np.log2(i + 2) for i, item in enumerate(recommended[:k]) if item in relevant])
    idcg = sum([1 / np.log2(i + 2) for i in range(min(len(relevant), k))])
    return dcg / idcg if idcg > 0 else 0

# Example
recommended = [1, 3, 5, 2, 7]
relevant = [1, 2, 4]

print(f"Precision@3: {precision_at_k(recommended, relevant, 3):.2f}")
print(f"Recall@3: {recall_at_k(recommended, relevant, 3):.2f}")
print(f"NDCG@3: {ndcg_at_k(recommended, relevant, 3):.2f}")
```

---

## Hands-on Lab

### Exercise 1: MovieLens Recommender with Surprise

```python
# Load MovieLens 100K dataset
from surprise import Dataset
from surprise import SVD, KNNBasic, NMF
from surprise.model_selection import cross_validate

# Load data
data = Dataset.load_builtin('ml-100k')

# Compare algorithms
algorithms = {
    'SVD': SVD(n_factors=100, n_epochs=20),
    'KNN-User': KNNBasic(sim_options={'name': 'cosine', 'user_based': True}),
    'KNN-Item': KNNBasic(sim_options={'name': 'cosine', 'user_based': False}),
    'NMF': NMF(n_factors=15)
}

print("=== Algorithm Comparison on MovieLens ===")
for name, algo in algorithms.items():
    cv_results = cross_validate(algo, data, measures=['RMSE', 'MAE'], cv=5, verbose=False)
    print(f"{name:12} RMSE: {cv_results['test_rmse'].mean():.3f} ± {cv_results['test_rmse'].std():.3f}")
    print(f"             MAE:  {cv_results['test_mae'].mean():.3f} ± {cv_results['test_mae'].std():.3f}")
    print()
```

---

### Exercise 2: Hybrid Recommender System

```python
# Combine content-based + collaborative filtering

class HybridRecommender:
    def __init__(self, alpha=0.5):
        """
        alpha: Weight for collaborative filtering (1-alpha for content-based)
        """
        self.alpha = alpha
        self.svd_model = None
        self.content_similarity = None
    
    def fit(self, ratings_df, item_features_df):
        """Train both models."""
        
        # Collaborative filtering (SVD)
        reader = Reader(rating_scale=(1, 5))
        data = Dataset.load_from_df(ratings_df[['user_id', 'item_id', 'rating']], reader)
        trainset = data.build_full_trainset()
        
        self.svd_model = SVD(n_factors=50, n_epochs=20)
        self.svd_model.fit(trainset)
        
        # Content-based (item similarity)
        tfidf = TfidfVectorizer(stop_words='english')
        tfidf_matrix = tfidf.fit_transform(item_features_df['description'])
        self.content_similarity = cosine_similarity(tfidf_matrix)
        
        self.items = item_features_df.index.tolist()
    
    def predict(self, user_id, item_id, user_history):
        """Hybrid prediction."""
        
        # Collaborative filtering score
        cf_score = self.svd_model.predict(user_id, item_id).est
        
        # Content-based score (average similarity to user's history)
        if len(user_history) == 0:
            content_score = 2.5  # Neutral
        else:
            item_idx = self.items.index(item_id)
            similarities = [self.content_similarity[item_idx][self.items.index(hist_item)] 
                           for hist_item in user_history if hist_item in self.items]
            content_score = np.mean(similarities) * 5 if similarities else 2.5  # Scale to 1-5
        
        # Weighted combination
        hybrid_score = self.alpha * cf_score + (1 - self.alpha) * content_score
        
        return hybrid_score

# Example usage
hybrid = HybridRecommender(alpha=0.7)  # 70% CF, 30% content
hybrid.fit(ratings, movies)

# Predict
user_history = [1, 2]  # User liked movies 1 and 2
score = hybrid.predict(user_id=1, item_id=5, user_history=user_history)
print(f"Hybrid prediction: {score:.2f}")
```

---

### Exercise 3: Neural Collaborative Filtering

```python
import tensorflow as tf
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Input, Embedding, Flatten, Concatenate, Dense, Dropout

# Prepare data
n_users = ratings['user_id'].nunique()
n_items = ratings['movie_id'].nunique()

user_ids = ratings['user_id'].values - 1  # Zero-indexed
item_ids = ratings['movie_id'].values - 1
ratings_values = ratings['rating'].values

# Train/test split
from sklearn.model_selection import train_test_split
user_train, user_test, item_train, item_test, rating_train, rating_test = train_test_split(
    user_ids, item_ids, ratings_values, test_size=0.2, random_state=42
)

# Neural network architecture
embedding_size = 20

# User input
user_input = Input(shape=(1,), name='user_input')
user_embedding = Embedding(n_users, embedding_size, name='user_embedding')(user_input)
user_vec = Flatten()(user_embedding)

# Item input
item_input = Input(shape=(1,), name='item_input')
item_embedding = Embedding(n_items, embedding_size, name='item_embedding')(item_input)
item_vec = Flatten()(item_embedding)

# Concatenate
concat = Concatenate()([user_vec, item_vec])

# Deep layers
dense1 = Dense(64, activation='relu')(concat)
dropout1 = Dropout(0.2)(dense1)
dense2 = Dense(32, activation='relu')(dropout1)
dropout2 = Dropout(0.2)(dense2)

# Output
output = Dense(1, activation='linear')(dropout2)

# Model
ncf_model = Model(inputs=[user_input, item_input], outputs=output)
ncf_model.compile(optimizer='adam', loss='mse', metrics=['mae'])

print(ncf_model.summary())

# Train
history = ncf_model.fit(
    [user_train, item_train],
    rating_train,
    batch_size=64,
    epochs=10,
    validation_split=0.1,
    verbose=1
)

# Evaluate
test_loss, test_mae = ncf_model.evaluate([user_test, item_test], rating_test)
print(f"\nTest MAE: {test_mae:.3f}")

# Recommend for user
def recommend_for_user(user_id, n=5):
    """Get top N recommendations for a user."""
    
    # All items
    all_items = np.arange(n_items)
    user_array = np.full(n_items, user_id)
    
    # Predict ratings
    predictions = ncf_model.predict([user_array, all_items]).flatten()
    
    # Get top N
    top_indices = np.argsort(predictions)[::-1][:n]
    
    print(f"\n=== Top {n} Recommendations for User {user_id} ===")
    for idx in top_indices:
        print(f"Item {idx}: Predicted rating {predictions[idx]:.2f}")

recommend_for_user(user_id=0, n=5)
```

---

## Mastery Check

### Question 1: Content-Based vs Collaborative Filtering

When should you use content-based filtering instead of collaborative filtering?

<details>
<summary>Click for Answer</summary>

**Answer:** Use content-based when you have rich item metadata, need explainability, or face severe cold start problems for users. Use collaborative filtering when you have abundant user behavior data and want to discover unexpected preferences.

**Content-Based advantages:**

**1. No cold start for new users**

```python
# New user signs up
# Can immediately recommend based on:
# - Demographic data (age, location)
# - Explicit preferences (genres they select)
# - First few clicks (content similarity)

# CF: Needs user history → can't recommend initially
```

**2. Explainability**

```
"We recommend this movie because you liked similar sci-fi movies"
# Clear, transparent reasoning

# CF: "Users like you also liked..." (less transparent)
```

**3. Works with limited user data**

```python
# News articles: Users rarely rate/like
# Job postings: One-time interaction
# Real estate: Few transactions per user

# Content-based: Can still match features
# CF: Not enough interaction data
```

**4. Rich item metadata**

```
- Articles: Keywords, topics, entities
- Products: Specifications, categories, descriptions
- Movies: Genre, director, actors, plot

# Content-based leverages this
# CF ignores item features entirely
```

**Collaborative Filtering advantages:**

**1. Serendipity (discovery)**

```python
# User watches action movies
# CF discovers: "Action fans also love sci-fi thrillers"
# Content-based: Would only suggest more action movies

# CF captures non-obvious relationships
```

**2. No item features needed**

```
# What makes a good TikTok video? Hard to define features
# CF: Just learn from user engagement patterns
```

**3. Quality signal from the crowd**

```
# Millions of users voting → wisdom of the crowd
# Content-based: Relies on metadata quality
```

**When to combine (Hybrid):**

```python
# Netflix approach:
# - Content-based for new users (cold start)
# - Gradually incorporate CF as user history grows
# - Final recommendations: Weighted blend

hybrid_score = 0.3 * content_score + 0.7 * cf_score
```

**Decision tree:**

```
if new_user or sparse_ratings:
    use content_based
elif rich_user_history and good_item_metadata:
    use hybrid
elif abundant_interaction_data:
    use collaborative_filtering
```

</details>

---

### Question 2: Matrix Factorization Intuition

Explain how SVD decomposes a user-item matrix and what the latent factors represent.

<details>
<summary>Click for Answer</summary>

**Answer:** SVD factorizes the user-item matrix R into U × Σ × V^T, where U represents user preferences for latent factors (genres, moods), V represents item characteristics on those factors, and Σ scales their importance.

**Mathematical decomposition:**

```
R (users × items) ≈ U (users × factors) × Σ (factors) × V^T (factors × items)

Example:
R (1000 users × 5000 movies) ≈ U (1000 × 20) × Σ (20) × V^T (20 × 5000)

# 1000 × 5000 = 5M parameters
# After SVD: 1000×20 + 20 + 20×5000 = 120,020 parameters (98% reduction!)
```

**Latent factors intuition:**

**Example with k=3 factors:**

```python
# Factor 1: "Action vs Drama"
# Factor 2: "Old vs New"
# Factor 3: "Hollywood vs Independent"

User preferences (U matrix):
User 1: [0.9, 0.2, 0.1]  # Loves action, prefers new, mainstream
User 2: [0.1, 0.8, 0.7]  # Prefers drama, old classics, indie films

Movie characteristics (V matrix):
Matrix: [0.95, 0.3, 0.05]  # Action, modern, blockbuster
Citizen Kane: [0.1, 0.95, 0.6]  # Drama, classic, artistic

# Prediction for User 1, Matrix:
rating ≈ dot_product(User1, Matrix)
      = 0.9×0.95 + 0.2×0.3 + 0.1×0.05
      = 0.855 + 0.06 + 0.005 = 0.92 (high → user will like it!)
```

**Visual analogy:**

```
High-dimensional space → Compressed low-dimensional space

Original: Each user/item is a point in 5000-dimensional space
SVD: Projects to 20-dimensional space (latent factors)
       preserving most structure

Like compressing images:
- Full image: 1920x1080 pixels
- JPEG compression: 100 coefficients capture essence
```

**Why it works:**

**1. Captures correlations**

```
Users who like Inception also like Interstellar
Both movies have high values for "Sci-Fi" and "Mind-Bending" factors
SVD discovers these patterns automatically
```

**2. Handles sparsity**

```
User rated 50 of 5000 movies (99% missing)
SVD fills in based on latent factor matching

User's factors: [0.8, 0.3]
Unrated movie's factors: [0.7, 0.4]
Predicted rating = 0.8×0.7 + 0.3×0.4 = 0.68
```

**3. Dimensional reduction**

```
# Noise reduction
# Not all 5000 dimensions are meaningful
# Top 20 factors capture signal
# Rest is noise → SVD ignores it
```

**Training SVD:**

```python
# Minimize reconstruction error
loss = sum((R_ij - U_i · V_j)^2 for all observed ratings)
      + λ(||U||^2 + ||V||^2)  # Regularization

# Stochastic Gradient Descent:
for each rating (user, item, value):
    error = value - predict(user, item)
    U[user] += learning_rate * (error * V[item] - λ * U[user])
    V[item] += learning_rate * (error * U[user] - λ * V[item])
```

**Key insight:** SVD doesn't "know" what factors mean (action, drama, etc.). It learns abstract patterns that best reconstruct observed ratings.

</details>

---

### Question 3: Evaluation Offline vs Online

Your offline RMSE is 0.8 (excellent), but online click-through rate doesn't improve. Why?

<details>
<summary>Click for Answer</summary>

**Answer:** Offline metrics (RMSE, MAE) measure rating prediction accuracy, but online success depends on ranking quality, diversity, novelty, and business metrics like engagement and revenue.

**The mismatch:**

**What offline RMSE measures:**

```python
# How well you predict exact ratings
User rated Matrix: 4.5
Model predicted: 4.6
Error = 0.1 → Good!

# But in production:
# User doesn't see predicted ratings
# User sees TOP 10 recommendations
# → Rating accuracy != ranking quality
```

**What matters online:**

```
# Did user CLICK on recommendations?
# Did user ENGAGE (watch, purchase)?
# Did user come BACK tomorrow?
```

**Why low RMSE ≠ high CTR:**

**1. Popularity bias**

```python
# Model learns: "Everyone likes The Matrix"
# Predicts 4.5 for everyone → Low RMSE
# But: User already watched it → No click

# Solution: Penalize recommending already-seen items
```

**2. Filter bubble (no diversity)**

```
User likes action movies
Model recommends: Action, Action, Action, Action, more Action
Predictions are accurate → Low RMSE
User gets bored, leaves platform → Low engagement

# Solution: Diversify recommendations
```

**3. Missing the "long tail"**

```
# Optimizing RMSE → Recommends safe, popular items
# Indie/niche content gets ignored
# But: Niche recommendations drive engagement (serendipity)
```

**4. Positional bias in production**

```
# Offline: All recommendations treated equally
# Online: Position matters
#   - Item 1: 30% CTR
#   - Item 5: 10% CTR
#   - Item 10: 2% CTR

# Need ranking metrics, not just RMSE
```

**5. Temporal dynamics**

```python
# Offline: Historical data (last year)
# Online: User preferences change
#   - Seasonal (Christmas movies in Dec)
#   - Trending (new releases)
#   - User lifecycle (binge-watch phase → casual viewing)

# RMSE doesn't capture recency
```

**Better offline metrics:**

**Ranking metrics:**

```python
# Precision@K: Of top K, how many are relevant?
precision_at_10 = relevant_in_top_10 / 10

# NDCG@K: Discounted cumulative gain (position-aware)
# Rewards putting best items at top

# MAP: Mean Average Precision (across all users)
```

**Diversity metrics:**

```python
# Intra-list diversity
diversity = 1 - avg_pairwise_similarity(recommended_items)

# Coverage: % of catalog recommended
coverage = unique_items_recommended / total_items
```

**Novelty:**

```python
# Recommend items user hasn't seen
# Bonus for less-popular items (surprise factor)
novelty = -log(popularity(item))
```

**A/B testing (online evaluation):**

```
# Deploy model to 5% of users
# Compare vs baseline:

Metrics:
- CTR (click-through rate)
- Engagement time
- Purchase conversion
- Return rate (next day)
- Revenue per user

# These matter more than RMSE!
```

**Production optimization:**

```python
# Multi-objective optimization
# Not just accuracy, but:

score = 0.4 * accuracy_score      # Relevance
      + 0.3 * diversity_score     # Avoid filter bubble
      + 0.2 * novelty_score       # Discovery
      + 0.1 * business_value      # Revenue potential
```

**Key lesson:** Offline metrics are proxies. Always validate with online A/B tests measuring actual business outcomes.

</details>

---

### Question 4: Implicit vs Explicit Feedback

You're building a YouTube recommender. Users don't rate videos (1-5 stars). How do you model preferences from implicit feedback (views, clicks)?

<details>
<summary>Click for Answer</summary>

**Answer:** Use implicit feedback signals (watch time, clicks, shares) as confidence weights, not ratings. Apply algorithms like ALS (Alternating Least Squares) or  Bayesian Personalized Ranking (BPR) designed for implicit data.

**Explicit vs Implicit feedback:**

| Aspect         | Explicit              | Implicit                  |
| -------------- | --------------------- | ------------------------- |
| Signal         | Ratings (1-5 stars)   | Clicks, views, watch time |
| User effort    | High (must rate)      | Low (passive collection)  |
| Abundance      | Sparse (~1%)          | Dense (~100%)             |
| Interpretation | Clear preference      | Ambiguous (click ≠ like)  |
| Examples       | Netflix ratings, Yelp | YouTube, Amazon browsing  |

**Challenges with implicit feedback:**

**1. No negative signal**

```python
# Explicit: User rated 1 star → Clearly disliked
# Implicit: User didn't click → Dislike or didn't see?

# Can't distinguish:
# - Not interested
# - Didn't see the recommendation
# - Saw but already watched
```

**2. Ambiguous meaning**

```
# User watched 10 seconds of video
# Did they like it? Or click by mistake and left?

# Need to interpret confidence:
# - 10 sec watch → Low confidence (maybe disliked)
# - Full video watch → High confidence (likely liked)
# - Re-watched → Very high confidence
```

**3. Bias in collection**

```
# Only observe what system recommended
# Missing data: What if user would've loved video X but never saw it?
```

**Modeling approaches:**

**1. Confidence weighting (ALS)**

```python
# Treat all interactions as "positive" but with varying confidence

from implicit.als import AlternatingLeastSquares

# Example data:
# user_id, video_id, watch_time (seconds)

# Convert watch time → confidence
confidence = 1 + alpha * watch_time  # alpha=0.01

# Sparse matrix
sparse_user_item = create_sparse_matrix(user_id, video_id, confidence)

# ALS model
model = AlternatingLeastSquares(factors=50, iterations=20)
model.fit(sparse_user_item)

# Higher confidence → Model tries harder to "explain" this interaction
```

**Confidence formula:**

```python
confidence = 1 + alpha * log(1 + interaction_count / epsilon)

# interaction_count: How many times user engaged
# alpha: Scaling factor
# epsilon: Smoothing constant

# Examples:
# 1 view: confidence = 1.5
# 10 views: confidence = 3.0
# 100 views: confidence = 5.0
```

**2. Bayesian Personalized Ranking (BPR)**

```python
# Learn from relative preferences
# "User prefers item i over item j"

# Triplet: (user, positive_item, negative_item)
# Positive: User interacted
# Negative: User didn't interact (sampled)

# Loss: Maximize difference
loss = -sum(log(sigmoid(score(user, pos_item) - score(user, neg_item))))

# Encourages ranking positive items higher than negatives
```

**3. Watch time as target**

```python
# Regression: Predict watch time directly

model.fit(user_video_features, watch_time_seconds)

# Recommendation: Rank by predicted watch time
# Assumes: Longer watch = better match
```

**4. Multi-signal aggregation**

```python
# Combine multiple implicit signals

interactions = {
    'click': 1,           # Base signal
    'watch_25%': 2,       # Quarter watched
    'watch_50%': 3,
    'watch_100%': 5,      # Full video
    'like': 3,
    'share': 5,
    'subscribe': 10       # Strong signal
}

# Aggregate into confidence score
user_video_confidence = sum(interactions.values())
```

**YouTube-specific approach:**

```python
class YouTubeImplicitModel:
    def compute_confidence(self, interaction_data):
        """Convert implicit signals to confidence."""
        
        # Watch time (most important)
        watch_ratio = interaction_data['watch_time'] / interaction_data['video_duration']
        confidence = watch_ratio * 10  # Scale 0-10
        
        # Engagement boosts
        if interaction_data['liked']:
            confidence += 3
        if interaction_data['commented']:
            confidence +=2
        if interaction_data['shared']:
            confidence += 5
        
        # Negative signals (discount)
        if interaction_data['disliked']:
            confidence = max(0, confidence - 5)
        if interaction_data['skipped_within_30sec']:
            confidence = max(0, confidence - 2)
        
        return confidence
    
    def mark_negative_samples(self, user_history, all_videos):
        """Sample negative examples."""
        
        # Impressions not clicked = weak negative
        shown_not_clicked = all_videos - user_history['clicked']
        
        # Random sample from un-shown videos = neutral (ignore)
        # Only use shown-but-not-clicked as negatives
        
        return shown_not_clicked
```

**Evaluation for implicit feedback:**

```python
# Can't use RMSE (no ratings!)
# Use ranking metrics:

# 1. Precision@K
relevant_in_top_k = len(set(recommended[:k]) & set(user_interacted))
precision = relevant_in_top_k / k

# 2. Recall@K
recall = relevant_in_top_k / len(user_interacted)

# 3. AUC (Area Under ROC Curve)
# Probability that positive item ranked higher than negative

# 4. Mean Percentile Rank
# Average rank of positive items
```

**Key insight:** With implicit feedback, focus on **ranking quality** and **confidence calibration**, not predicting exact preference values.

</details>

---

### Question 5: Production Scalability

Your matrix factorization model works great on 10K users × 1K items. How do you scale to 100M users × 10M items (Netflix/Amazon scale)?

<details>
<summary>Click for Answer</summary>

**Answer:** Use approximate methods (ALS, sub-sampling), distributed computing (Spark), candidate generation + re-ranking, and precompute/cache embeddings for fast serving.

**Computational challenges:**

**Naive SVD:**

```
Training: O(n_users × n_items × n_factors × n_iterations)
100M × 10M × 100 × 20 = 2 × 10^17 operations → Years!

Memory: User matrix (100M × 100) + Item matrix (10M × 100)
       = 10B + 1B floats = 44 GB (just for embeddings)
```

**Scalability solutions:**

**1. Alternating Least Squares (ALS)**

```python
# Instead of optimizing U and V together (expensive)
# Alternate: Fix U, optimize V; Fix V, optimize U

# Advantage: Parallelizable!
# Each user embedding independent given item embeddings
# → Distribute across workers

from pyspark.ml.recommendation import ALS

als = ALS(
    userCol='user_id',
    itemCol='item_id',
    ratingCol='rating',
    maxIter=10,
    regParam=0.01,
    rank=50,  # Latent factors
    coldStartStrategy='drop'
)

# Spark distributes computation across cluster
model = als.fit(ratings_spark_df)
```

**2. Candidate generation + Re-ranking**

```python
# Two-stage funnel

# Stage 1: Candidate Generation (fast, approximate)
# Reduce 10M items → 1000 candidates
candidates = get_candidates_fast(user_id, n=1000)
# Methods:
# - Top items in user's favorite genres
# - Items from similar users (KNN)
# - Trending items
# - Collaborative filtering with low-rank factors

# Stage 2: Re-ranking (slow, precise)
# Rank 1000 candidates with complex model
scores = complex_model.predict(user_id, candidates)
top_recommendations = candidates[np.argsort(scores)[::-1][:10]]

# Total: 1K predictions (not 10M!) → 10,000x speedup
```

**3. Approximate Nearest Neighbors (ANN)**

```python
# Instead of computing similarity to all items
# Use ANN index (FAISS, Annoy, HNSW)

import faiss

# Item embeddings
item_vectors = model.item_factors  # 10M × 100

# Build FAISS index
index = faiss.IndexFlatIP(100)  # Inner product (cosine similarity)
index.add(item_vectors)

# Query
user_vector = model.user_factors[user_id].reshape(1, -1)
distances, item_ids = index.search(user_vector, k=100)  # Top 100

# Complexity: O(log n) instead of O(n)
```

**4. Sub-sampling negatives**

```python
# Don't train on all unobserved items (billions!)
# Sample small subset of negatives

for user, positive_item in user_interactions:
    # Sample 5 negative items (not 10M)
    negative_items = random.sample(all_items - user_interacted, k=5)
    
    for neg_item in negative_items:
        # Train on triplet (user, positive, negative)
        update_model(user, positive_item, neg_item)

# Reduces training data by 1000x+
```

**5. Precompute & cache**

```python
# Precompute item-item similarities (offline batch job)
item_similarities = compute_all_pairs_similarity(item_vectors)
# Store in Redis/Memcached

# Serving (online):
# GET user's recent items
recent_items = get_user_history(user_id, limit=10)

# Lookup precomputed similarities
recommendations = []
for item in recent_items:
    similar_items = cache.get(f"similar:{item}")
    recommendations.extend(similar_items)

# Deduplicate and rank
top_recommendations = rank_and_deduplicate(recommendations)

# Latency: <10ms (cache lookup only, no model inference!)
```

**6. Model compression**

```python
# Reduce embedding dimensions
# 100 factors → 20 factors (5x smaller, faster)

# Quantization
# Float32 → Int8 (4x smaller)
# embeddings = (embeddings * 127).astype(np.int8)

# Pruning
# Remove least important factors (SVD + truncation)
```

**7. Distributed serving**

```python
# Shard by user ID
# User 0-10M → Server 1
# User 10M-20M → Server 2
# ...

# Load balancer routes requests

# Each server:
# - Stores subset of user embeddings
# - Has full item embeddings (smaller)

# Serving: O(n_items / n_servers)
```

**8. Batch prediction**

```python
# Don't predict per request
# Pre-generate recommendations daily (offline)

# Nightly batch job:
for user in all_users:
    top_1000_recommendations[user] = model.recommend(user, n=1000)

# Store in database

# Serving: Simple lookup (no model!)
GET redis:user:{user_id}:recommendations

# Trade-off: Slightly stale (up to 24h old) but instant serving
```

**Netflix architecture (simplified):**

```
1. Offline training (Spark cluster)
   - ALS on full data
   - Train weekly

2. Nearline candidate generation
   - Update trending items hourly
   - Personalized candidates (lightweight models)

3. Online re-ranking
   - Fetch 1000 candidates
   - Deep learning model ranks top 50
   - Latency: <100ms

4. Caching
   - Redis: User profiles, item metadata
   - Precomputed: Top 10 recs per user (updated daily)
```

**Key metrics to track:**

- Training time (should be <24h for daily refresh)
- Serving latency (<100ms p99)
- Memory footprint (fit in RAM?)
- Throughput (QPS - queries per second)

**Rule of thumb:** At scale, 80% of recommendations can be from precomputed/cached simple models. Use complex models for the 20% where it matters most (e.g., homepage, high-value users).

</details>

---

## Summary

Today you learned:

- ✅ Content-based filtering recommends items similar to past preferences
- ✅ Collaborative filtering leverages wisdom of the crowd (user-based, item-based)
- ✅ Matrix factorization (SVD, ALS) discovers latent factors for scalable recommendations
- ✅ Hybrid systems combine content + collaborative for better performance
- ✅ Implicit feedback (clicks, views) requires confidence weighting and ranking metrics
- ✅ Production systems use candidate generation + re-ranking for scalability
- ✅ Offline RMSE ≠ online engagement; always A/B test with business metrics

**Tomorrow**: Transformers and Attention mechanisms—the architecture behind BERT, GPT, and modern NLP.
