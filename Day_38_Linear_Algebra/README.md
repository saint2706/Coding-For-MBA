# Day 38: Math Foundations - Linear Algebra

## Overview

Linear algebra underpins much of machine learning. This lesson revisits the building blocks—vectors,
matrices, and eigendecomposition—so you can reason about data transformations and model behaviour
with confidence.

## Key Concepts

- **Vectors:** Mathematical objects with magnitude and direction that often represent individual
  data points or feature sets.
- **Matrices:** Rectangular arrays that hold datasets and enable transformations when combined with
  vectors or other matrices.
- **Dot Product:** A measure of similarity between two vectors computed by multiplying corresponding
  elements and summing the results.
- **Eigenvectors and Eigenvalues:** Special vector–scalar pairs that describe how a matrix stretches
  space; essential for dimensionality reduction techniques such as PCA.

## Practice Exercises

1. **Vector Operations:** Use `vector_operations()` to compute the sum, difference, and dot product
   for `[1, 2, 3]` and `[4, 5, 6]`.
1. **Matrix Operations:** Call `matrix_operations()` to produce the sum and product for the matrices
   `[[1, 2], [3, 4]]` and `[[5, 6], [7, 8]]`.
1. **Eigen-analysis:** Explore the eigenvalues and eigenvectors of `[[4, 1], [2, 3]]` via
   `eigen_analysis()`.

## How to Use This Folder

- Run the worked examples: `python Day_38_Linear_Algebra/solutions.py`
- Execute the automated checks: `pytest tests/test_day_38.py`
