---
day: 38
title: "Linear Algebra for ML"
phase: 4
phaseTitle: "Mathematical Foundations & ML Fundamentals"
slug: "linear-algebra-ml"
duration: 55
difficulty: "intermediate"
tags:
  - math
  - linear-algebra
  - numpy
  - matrices
  - vectors
concepts:
  - "vectors and vector operations"
  - "matrices and matrix multiplication"
  - "dot products and similarity"
  - "transformations and projections"
prerequisites: [22, 37]
outcomes:
  - "Understand vectors as data representations"
  - "Perform matrix operations with NumPy"
  - "Apply linear algebra to ML computations"
  - "Build intuition for data transformations"
---

# 🎯 Day 38: Linear Algebra for Machine Learning

> *"Linear algebra is the language of machine learning. Master it, and ML becomes intuitive."*

---

## The "Never-Coded" Bridge

**Imagine you're explaining Netflix recommendations to your CEO.** "How does it know I'll like this show?" The answer involves linear algebra—though you'd never say those words.

Every user is a vector of preferences. Every movie is a vector of characteristics. Finding a good recommendation? That's finding movies whose vectors are "close" to yours. The dot product measures this closeness. Matrix multiplication transforms the data. Eigenvectors reveal hidden patterns.

**Real-world applications:**

- **Google**: PageRank uses matrix operations to rank web pages
- **Spotify**: User and song embeddings (vectors) power recommendations
- **Tesla**: Self-driving cars use linear algebra to process sensor data
- **Banks**: Portfolio returns are computed as weighted sums (dot products)

Every neural network, every recommendation system, every computer vision model—they're all matrix operations at their core.

---

## The Technical Deep Dive

### Vectors: The Language of Data

A vector is an ordered list of numbers. In ML, each sample in your dataset is a vector. Formally, a vector $\mathbf{v} \in \mathbb{R}^n$ is written:

$$
\mathbf{v} = \begin{bmatrix} v_1 \\ v_2 \\ \vdots \\ v_n \end{bmatrix}
$$

The **magnitude** (or $\ell_2$-norm) of a vector measures its length:

$$
\|\mathbf{v}\|_2 = \sqrt{\sum_{i=1}^{n} v_i^2} = \sqrt{v_1^2 + v_2^2 + \cdots + v_n^2}
$$

A **unit vector** $\hat{\mathbf{v}} = \mathbf{v} / \|\mathbf{v}\|$ has length $1$ and captures only the direction of $\mathbf{v}$.

```python
import numpy as np

# A customer as a vector: [age, income, spending_score]
customer = np.array([35, 75000, 85])

# A dataset is a matrix: rows are samples, columns are features
customers = np.array(
    [
        [35, 75000, 85],  # Customer 1
        [42, 82000, 72],  # Customer 2
        [28, 45000, 91],  # Customer 3
    ]
)
print(f"Shape: {customers.shape}")  # (3, 3) - 3 customers, 3 features

# Vector operations
a = np.array([1, 2, 3])
b = np.array([4, 5, 6])

# Element-wise operations
print(a + b)  # [5, 7, 9] - addition
print(a * b)  # [4, 10, 18] - element-wise multiplication
print(a * 2)  # [2, 4, 6] - scalar multiplication

# Vector norm (length/magnitude)
magnitude = np.linalg.norm(a)
print(f"Length of a: {magnitude:.2f}")  # sqrt(1² + 2² + 3²) = 3.74

# Unit vector (direction only, length 1)
unit_a = a / np.linalg.norm(a)
print(f"Unit vector: {unit_a}")
print(f"Length: {np.linalg.norm(unit_a):.2f}")  # 1.0
```

### Dot Product: Measuring Similarity

The dot product is fundamental to ML. It measures how "aligned" two vectors are. Algebraically:

$$
\mathbf{a} \cdot \mathbf{b} = \sum_{i=1}^{n} a_i b_i = a_1 b_1 + a_2 b_2 + \cdots + a_n b_n
$$

Geometrically it relates to the angle $\theta$ between the vectors:

$$
\mathbf{a} \cdot \mathbf{b} = \|\mathbf{a}\| \, \|\mathbf{b}\| \cos\theta
$$

The closely-related **cosine similarity** removes magnitude effects, giving a pure direction-based score in $[-1, 1]$:

$$
\text{cos\_sim}(\mathbf{a}, \mathbf{b}) = \frac{\mathbf{a} \cdot \mathbf{b}}{\|\mathbf{a}\| \, \|\mathbf{b}\|}
$$

```python
# Dot product: sum of element-wise products
a = np.array([1, 2, 3])
b = np.array([4, 5, 6])

dot_product = np.dot(a, b)  # 1*4 + 2*5 + 3*6 = 32
# Alternative syntax:
dot_product = a @ b  # Same result: 32
dot_product = (a * b).sum()  # Same result: 32

print(f"Dot product: {dot_product}")

# Geometric interpretation: a · b = |a| |b| cos(θ)
# - Positive: vectors point in similar directions
# - Zero: vectors are perpendicular (orthogonal)
# - Negative: vectors point in opposite directions

# Example: Which customer is more similar to target?
target = np.array([30, 60000, 80])
customer_a = np.array([32, 62000, 78])
customer_b = np.array([55, 40000, 45])


# Cosine similarity (normalized dot product)
def cosine_similarity(v1, v2):
    return np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2))


sim_a = cosine_similarity(target, customer_a)
sim_b = cosine_similarity(target, customer_b)

print(f"Similarity to A: {sim_a:.4f}")  # Higher = more similar
print(f"Similarity to B: {sim_b:.4f}")
```

### Matrices: Data and Transformations

A matrix is a 2D array. In ML, your entire dataset is a matrix. A matrix $A \in \mathbb{R}^{m \times n}$ has $m$ rows and $n$ columns:

$$
A = \begin{bmatrix}
a_{11} & a_{12} & \cdots & a_{1n} \\
a_{21} & a_{22} & \cdots & a_{2n} \\
\vdots & \vdots & \ddots & \vdots \\
a_{m1} & a_{m2} & \cdots & a_{mn}
\end{bmatrix}
$$

**Matrix multiplication** $C = AB$ for $A \in \mathbb{R}^{m \times n}$ and $B \in \mathbb{R}^{n \times p}$ gives $C \in \mathbb{R}^{m \times p}$ where each entry is a dot product:

$$
C_{ij} = \sum_{k=1}^{n} A_{ik} B_{kj}
$$

The inner dimensions must match (both equal to $n$); the outer dimensions form the result shape.

```python
# Create matrices
A = np.array([[1, 2], [3, 4], [5, 6]])  # 3x2 matrix
B = np.array([[1, 2, 3], [4, 5, 6]])  # 2x3 matrix

print(f"A shape: {A.shape}")  # (3, 2)
print(f"B shape: {B.shape}")  # (2, 3)

# Matrix properties
print(f"Transpose of A:\n{A.T}")  # Swap rows and columns: (2, 3)
print(f"First row: {A[0, :]}")  # [1, 2]
print(f"First column: {A[:, 0]}")  # [1, 3, 5]

# Matrix multiplication: (m x n) @ (n x p) = (m x p)
# Inner dimensions must match!
C = A @ B  # (3x2) @ (2x3) = (3x3)
print(f"A @ B shape: {C.shape}")  # (3, 3)
print(f"Result:\n{C}")

# What matrix multiplication computes:
# C[i,j] = dot product of A's row i with B's column j
# C[0,0] = A[0,:] · B[:,0] = [1,2] · [1,4] = 1*1 + 2*4 = 9
```

### Matrix Multiplication in ML

Here's why matrix multiplication matters for ML. **Linear regression** uses a matrix–vector product to compute predictions for every sample at once:

$$
\hat{\mathbf{y}} = X\mathbf{w} + b
$$

A **fully-connected neural network layer** is the same operation, wrapped in a non-linear activation function $\sigma(\cdot)$:

$$
\mathbf{h} = \sigma(XW + \mathbf{b})
$$

```python
# Linear regression: y = Xw + b
# X: data matrix (n_samples x n_features)
# w: weight vector (n_features x 1)
# y: predictions (n_samples x 1)

X = np.array(
    [
        [1, 2],  # Sample 1: 2 features
        [3, 4],  # Sample 2
        [5, 6],  # Sample 3
    ]
)
w = np.array([0.5, 0.3])  # Learned weights
b = 0.1  # Bias

# Predictions via matrix-vector multiplication
predictions = X @ w + b
print(f"Predictions: {predictions}")
# For each sample: prediction = feature1*0.5 + feature2*0.3 + 0.1

# Neural network layer: same idea!
# output = activation(X @ W + b)
W = np.random.randn(2, 3)  # 2 input features → 3 neurons
b = np.zeros(3)

hidden = X @ W + b  # (3 samples x 3 neurons)
output = np.maximum(0, hidden)  # ReLU activation
print(f"Neural layer output shape: {output.shape}")
```

### Special Matrices and Operations

The **identity matrix** $I_n$ acts like the number $1$ for matrices: $IA = AI = A$.

The **inverse** $A^{-1}$ (when it exists) satisfies $A A^{-1} = A^{-1} A = I$. The **determinant** $\det(A)$ measures how the matrix scales volume; if $\det(A) = 0$, the matrix is **singular** and has no inverse.

**Eigenvectors** $\mathbf{v}$ and **eigenvalues** $\lambda$ are the directions a transformation only stretches, never rotates:

$$
A\mathbf{v} = \lambda \mathbf{v}
$$


```python
# Identity matrix: I @ A = A @ I = A
I = np.eye(3)  # 3x3 identity
print(f"Identity:\n{I}")

# Square matrix for demonstrating inverse
A = np.array([[4, 7], [2, 6]])

# Matrix inverse: A @ A_inv = I
A_inv = np.linalg.inv(A)
print(f"A @ A_inv:\n{(A @ A_inv).round(2)}")  # Identity matrix

# Determinant: measure of "scaling"
det_A = np.linalg.det(A)
print(f"Determinant: {det_A:.2f}")
# det = 0 means matrix is singular (not invertible)

# Eigenvalues and eigenvectors: A @ v = λ * v
# These reveal the "principal directions" of a transformation
eigenvalues, eigenvectors = np.linalg.eig(A)
print(f"Eigenvalues: {eigenvalues}")
print(f"Eigenvectors:\n{eigenvectors}")
```

---

## Senior-Level Insights

### Linear Algebra in ML Algorithms

| Algorithm             | Linear Algebra Role                                                |
| --------------------- | ------------------------------------------------------------------ |
| **Linear Regression** | Normal equation: $\mathbf{w} = (X^\top X)^{-1} X^\top \mathbf{y}$  |
| **PCA**               | Eigendecomposition of covariance matrix $\Sigma = \frac{1}{n-1} X^\top X$ |
| **Neural Networks**   | Layers as $\sigma(XW + \mathbf{b})$                                 |
| **SVD**               | Factorization $A = U\Sigma V^\top$ for recommendations              |
| **Word Embeddings**   | Words as vectors; similarity via $\mathbf{a} \cdot \mathbf{b}$      |

### When to Use Sparse Matrices

For large datasets with many zeros (text, user-item interactions):

```python
from scipy.sparse import csr_matrix

# Dense: stores every element (wastes memory for zeros)
dense_matrix = np.zeros((10000, 10000))
dense_matrix[0, 5] = 1
dense_matrix[100, 200] = 3

# Sparse: stores only non-zero elements
sparse_matrix = csr_matrix(dense_matrix)
print(f"Dense memory: {dense_matrix.nbytes / 1e6:.1f} MB")
print(f"Sparse memory: {sparse_matrix.data.nbytes / 1e6:.4f} MB")

# Use sparse for:
# - Text vectorization (TF-IDF matrices)
# - Recommendation systems (user-item ratings)
# - Graph adjacency matrices
```

### Numerical Stability

```python
# Avoid computing inverse directly (numerically unstable)
# Instead of: x = inv(A) @ b
# Use: x = solve(A, b)

A = np.array([[1, 2], [3, 4]])
b = np.array([5, 6])

# Bad (potentially unstable):
x_bad = np.linalg.inv(A) @ b

# Good (numerically stable):
x_good = np.linalg.solve(A, b)

print(f"Solution: {x_good}")
```

---

## Hands-on Lab

### Exercise 1: Vector Similarity Search

```python
import numpy as np

# Product embeddings (simplified: 3 features per product)
products = {
    "laptop_pro": np.array([0.9, 0.8, 0.1]),  # [tech, expensive, home]
    "laptop_budget": np.array([0.8, 0.3, 0.1]),
    "gaming_chair": np.array([0.5, 0.6, 0.2]),
    "office_desk": np.array([0.1, 0.4, 0.9]),
    "monitor_4k": np.array([0.9, 0.7, 0.3]),
}


def find_similar(query_name, products, top_k=3):
    """Find top-k most similar products using cosine similarity."""
    query = products[query_name]
    similarities = {}

    for name, vector in products.items():
        if name != query_name:
            # Cosine similarity
            sim = np.dot(query, vector) / (
                np.linalg.norm(query) * np.linalg.norm(vector)
            )
            similarities[name] = sim

    # Sort by similarity (descending)
    sorted_items = sorted(similarities.items(), key=lambda x: x[1], reverse=True)
    return sorted_items[:top_k]


# Find products similar to laptop_pro
similar = find_similar("laptop_pro", products)
print("Products similar to laptop_pro:")
for name, score in similar:
    print(f"  {name}: {score:.3f}")
```

---

### Exercise 2: Linear Regression from Scratch

```python
import numpy as np
import matplotlib.pyplot as plt

# Generate data: y = 2x + 1 + noise
np.random.seed(42)
X = np.random.randn(100, 1)
y = 2 * X.squeeze() + 1 + np.random.randn(100) * 0.3

# Add bias column to X
X_with_bias = np.column_stack([np.ones(100), X])
print(f"X shape: {X_with_bias.shape}")  # (100, 2)

# Normal equation: w = (X^T X)^(-1) X^T y
XtX = X_with_bias.T @ X_with_bias
XtX_inv = np.linalg.inv(XtX)
Xty = X_with_bias.T @ y
w = XtX_inv @ Xty

print(f"Learned weights: bias={w[0]:.3f}, slope={w[1]:.3f}")
print("Expected: bias≈1, slope≈2")

# Predictions
y_pred = X_with_bias @ w

# Visualize
plt.figure(figsize=(8, 5))
plt.scatter(X, y, alpha=0.6, label="Data")
plt.plot(X, y_pred, color="red", linewidth=2, label="Linear fit")
plt.xlabel("X")
plt.ylabel("y")
plt.title("Linear Regression via Normal Equation")
plt.legend()
plt.show()
```

---

### Exercise 3: PCA Intuition

```python
import numpy as np
import matplotlib.pyplot as plt

# Generate correlated 2D data
np.random.seed(42)
mean = [0, 0]
cov = [[1, 0.8], [0.8, 1]]  # Correlated
data = np.random.multivariate_normal(mean, cov, 200)

# Compute covariance matrix
data_centered = data - data.mean(axis=0)
cov_matrix = (data_centered.T @ data_centered) / (len(data) - 1)
print(f"Covariance matrix:\n{cov_matrix.round(3)}")

# Eigen decomposition
eigenvalues, eigenvectors = np.linalg.eig(cov_matrix)
print(f"Eigenvalues: {eigenvalues.round(3)}")
print(f"Variance explained: {(eigenvalues / eigenvalues.sum() * 100).round(1)}%")

# Plot data with principal components
plt.figure(figsize=(8, 8))
plt.scatter(data[:, 0], data[:, 1], alpha=0.5, label="Data")

# Plot eigenvectors (scaled by eigenvalues for visibility)
origin = data.mean(axis=0)
for i, (val, vec) in enumerate(zip(eigenvalues, eigenvectors.T)):
    plt.arrow(
        origin[0],
        origin[1],
        vec[0] * val * 2,
        vec[1] * val * 2,
        head_width=0.1,
        head_length=0.05,
        fc=f"C{i + 1}",
        ec=f"C{i + 1}",
        label=f"PC{i + 1} (variance={val:.2f})",
    )

plt.xlabel("Feature 1")
plt.ylabel("Feature 2")
plt.title("PCA: Finding Principal Directions")
plt.legend()
plt.axis("equal")
plt.show()

# Project onto first principal component
pc1 = eigenvectors[:, np.argmax(eigenvalues)]
data_1d = data_centered @ pc1
print(f"Reduced from {data.shape[1]}D to 1D")
print(f"Variance retained: {eigenvalues.max() / eigenvalues.sum() * 100:.1f}%")
```

---

## Mastery Check

### Question 1: Dot Product Interpretation

If the dot product of two vectors is 0, what does this tell you?

<details>
<summary>Click for Answer</summary>

**Answer:** The vectors are **orthogonal** (perpendicular).

Geometrically: $\mathbf{a} \cdot \mathbf{b} = \|\mathbf{a}\| \, \|\mathbf{b}\| \cos\theta$.
When $\mathbf{a} \cdot \mathbf{b} = 0$ and neither vector is zero, $\cos\theta = 0$, so $\theta = 90°$.

**In ML context:**

- Orthogonal feature vectors are uncorrelated
- Orthogonal word embeddings represent unrelated concepts
- PCA produces orthogonal principal components

</details>

---

### Question 2: Matrix Multiplication Shape

Given A with shape (100, 50) and B with shape (50, 10), what is the shape of A @ B?

<details>
<summary>Click for Answer</summary>

**Answer:** (100, 10)

**Rule:** (m × n) @ (n × p) = (m × p)

- Inner dimensions must match (50 = 50 ✓)
- Outer dimensions become the result (100 × 10)

**ML interpretation:**

- A could be 100 samples with 50 features
- B could be weights from 50 inputs to 10 outputs
- Result: 100 samples with 10 outputs (like a neural network layer)

</details>

---

### Question 3: Why Transpose?

In the normal equation $\mathbf{w} = (X^\top X)^{-1} X^\top \mathbf{y}$, why do we compute $X^\top X$?

<details>
<summary>Click for Answer</summary>

**Answer:** $X^\top X$ creates a square matrix that can be inverted.

- $X$ has shape $(n_\text{samples} \times n_\text{features})$
- $X^\top$ has shape $(n_\text{features} \times n_\text{samples})$
- $X^\top X$ has shape $(n_\text{features} \times n_\text{features})$ — square!

**Why it works mathematically:**
$X^\top X$ represents the covariance structure of features. The inverse "normalizes" for correlations between features, allowing us to find optimal weights.

**Practical note:** This is called the "normal equation" because it solves $\partial \mathcal{L} / \partial \mathbf{w} = 0$ directly, but it's slow for large $n_\text{features}$. Gradient descent is preferred for large problems.

</details>

---

### Question 4: Eigenvalue Meaning

In PCA, what do the eigenvalues represent?

<details>
<summary>Click for Answer</summary>

**Answer:** Eigenvalues represent the **variance explained** by each principal component.

- Larger eigenvalue = direction captures more variance
- We keep components with largest eigenvalues
- Sum of kept eigenvalues / total = proportion of variance retained

**Example:**
Eigenvalues: [5.2, 2.1, 0.4, 0.1]
Total: 7.8

- PC1 explains: 5.2/7.8 = 67%
- PC1+PC2 explain: 7.3/7.8 = 94%

Keeping 2 of 4 dimensions retains 94% of the information!

</details>

---

### Question 5: Practical Application

Your recommendation system has 1 million users and 100,000 products. If you represent each user and product as a 100-dimensional vector, how would you efficiently find similar products?

<details>
<summary>Click for Answer</summary>

**Answer:** Use **approximate nearest neighbor** search, not brute-force dot products.

**The problem:**

- Brute force: 100K × 100K × 100 = 1 trillion operations for all similarities
- Even for one query: 100K × 100 = 10M operations

**Solutions:**

1. **Locality Sensitive Hashing (LSH)**: Hash similar vectors to same buckets
2. **Annoy** (Spotify's library): Tree-based approximate search
3. **FAISS** (Facebook): GPU-accelerated similarity search
4. **Matrix factorization**: Precompute and cache product similarities

```python
import faiss

# Index 100K product vectors
d = 100  # dimension
index = faiss.IndexFlatIP(d)  # Inner product (dot product)
index.add(product_vectors)

# Find 10 most similar to query
D, I = index.search(query_vector.reshape(1, -1), 10)
```

</details>

---

## Math-to-Debug Tasks

1. **Operation-to-symptom mapping drill**: For each operation (`scaling`, `matrix projection`, `feature interaction`, `PCA rotation`), map how it changes feature geometry and identify one multicollinearity symptom (unstable coefficients, inflated variance, sign flips).
2. **Collinearity diagnosis mini-case**: You observe opposite-signed coefficients for two nearly identical marketing spend variables. Explain conceptually (linear dependence in `X^T X`) *why the model failed*, then take corrective action by computing VIF and applying either feature dropping, Ridge regularization, or PCA.

---

## Summary

Today you learned:

- ✅ Vectors represent data points; matrices represent datasets
- ✅ Dot product $\mathbf{a} \cdot \mathbf{b}$ measures vector similarity
- ✅ Matrix multiplication transforms and combines data
- ✅ Linear regression uses the normal equation: $\mathbf{w} = (X^\top X)^{-1} X^\top \mathbf{y}$
- ✅ PCA uses eigendecomposition $A\mathbf{v} = \lambda \mathbf{v}$ to find principal directions
- ✅ Every ML model is built on these operations

**Tomorrow**: Calculus Foundations—how gradient descent finds optimal parameters.
