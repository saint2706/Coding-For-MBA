---
day: 38
title: "Linear Algebra for ML"
phase: 4
phaseTitle: "Mathematical Foundations & ML Fundamentals"
slug: "linear-algebra-ml"
duration: 55
difficulty: "intermediate"
tags: [math, linear-algebra, numpy, matrices]
concepts: [vectors, matrices, dot products, matrix operations]
prerequisites: [22]
outcomes: [Understand vectors and matrices, Perform matrix operations, Apply linear algebra to ML]
---

# 🎯 Day 38: Linear Algebra for Machine Learning

> *"Linear algebra is the language of machine learning."*

---

## The "Never-Coded" Bridge

Why linear algebra for ML?
- **Data** is stored in matrices (rows = samples, columns = features)
- **Models** are matrix operations (weights, transformations)
- **Speed** comes from vectorized operations

---

## The Technical Deep Dive

### Vectors

```python
import numpy as np

# Row vector
v = np.array([1, 2, 3])

# Column vector
v_col = v.reshape(-1, 1)

# Vector operations
a = np.array([1, 2, 3])
b = np.array([4, 5, 6])

a + b           # Element-wise addition
a * b           # Element-wise multiplication
np.dot(a, b)    # Dot product: 1*4 + 2*5 + 3*6 = 32
```

### Matrices

```python
# Create matrix
A = np.array([[1, 2], [3, 4], [5, 6]])  # 3x2 matrix

A.shape         # (3, 2)
A.T             # Transpose: 2x3
A[0, :]         # First row
A[:, 1]         # Second column
```

### Matrix Multiplication

```python
A = np.array([[1, 2], [3, 4]])
B = np.array([[5, 6], [7, 8]])

# Matrix multiply
C = np.dot(A, B)
# or
C = A @ B

# Rule: (m x n) @ (n x p) = (m x p)
```

### ML Application: Linear Model

```python
# y = Xw + b (linear regression formula)
X = np.array([[1, 2], [3, 4], [5, 6]])  # 3 samples, 2 features
w = np.array([0.5, 0.3])                 # weights
b = 0.1                                   # bias

predictions = X @ w + b
print(predictions)  # [1.2, 2.6, 4.0]
```

### Useful Operations

```python
# Identity matrix
I = np.eye(3)

# Matrix inverse
A_inv = np.linalg.inv(A)

# Determinant
det = np.linalg.det(A)

# Eigenvalues
eigenvalues, eigenvectors = np.linalg.eig(A)
```

---

## Hands-on Lab

```python
import numpy as np

# Simulate linear regression calculation
np.random.seed(42)
X = np.random.randn(100, 3)  # 100 samples, 3 features
true_weights = np.array([2.0, -1.5, 0.5])
y = X @ true_weights + np.random.randn(100) * 0.1

# Normal equation: w = (X^T X)^-1 X^T y
XtX = X.T @ X
XtX_inv = np.linalg.inv(XtX)
estimated_weights = XtX_inv @ X.T @ y

print(f"True weights: {true_weights}")
print(f"Estimated:    {estimated_weights.round(2)}")
```

---

## Summary

- ✅ Vectors and matrices are ML building blocks
- ✅ Dot product measures similarity
- ✅ Matrix multiplication transforms data
- ✅ NumPy makes linear algebra fast

**Tomorrow**: Calculus foundations for optimization.
