## Overview

Linear algebra underpins much of machine learning. This lesson revisits the building blocks—vectors, matrices, and eigendecomposition—so you can reason about data transformations and model behaviour with confidence.

## Key Concepts

- **Vectors:** Mathematical objects with magnitude and direction that often represent individual data points or feature sets.
- **Matrices:** Rectangular arrays that hold datasets and enable transformations when combined with vectors or other matrices.
- **Dot Product:** A measure of similarity between two vectors computed by multiplying corresponding elements and summing the results.
- **Eigenvectors and Eigenvalues:** Special vector–scalar pairs that describe how a matrix stretches space; essential for dimensionality reduction techniques such as PCA.

## Practice Exercises

1. **Vector Operations:** Use `vector_operations()` to compute the sum, difference, and dot product for `[1, 2, 3]` and `[4, 5, 6]`.
1. **Matrix Operations:** Call `matrix_operations()` to produce the sum and product for the matrices `[[1, 2], [3, 4]]` and `[[5, 6], [7, 8]]`.
1. **Eigen-analysis:** Explore the eigenvalues and eigenvectors of `[[4, 1], [2, 3]]` via `eigen_analysis()`.

## How to Use This Folder

- Run the worked examples: `python Day_38_Linear_Algebra/solutions.py`
- Execute the automated checks: `pytest tests/test_day_38.py`

## Additional Materials

- **solutions.ipynb**  
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_38_Linear_Algebra/solutions.ipynb){ .md-button } 
  [📓 Open in NBViewer](https://nbviewer.org/github/saint2706/Coding-For-MBA/blob/main/Day_38_Linear_Algebra/solutions.ipynb){ .md-button } 
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_38_Linear_Algebra/solutions.ipynb){ .md-button .md-button--primary } 
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_38_Linear_Algebra/solutions.ipynb){ .md-button }

???+ example "solutions.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_38_Linear_Algebra/solutions.py)

    ```python title="solutions.py"
    import numpy as np


    def vector_operations(v1=None, v2=None):
        """Return the sum, difference, and dot product of two vectors."""

        v1_array = np.array([1, 2, 3]) if v1 is None else np.asarray(v1)
        v2_array = np.array([4, 5, 6]) if v2 is None else np.asarray(v2)

        vector_sum = v1_array + v2_array
        vector_difference = v1_array - v2_array
        dot_product = np.dot(v1_array, v2_array)

        return vector_sum, vector_difference, dot_product


    def matrix_operations(m1=None, m2=None):
        """Return the sum and product of two matrices."""

        m1_array = np.array([[1, 2], [3, 4]]) if m1 is None else np.asarray(m1)
        m2_array = np.array([[5, 6], [7, 8]]) if m2 is None else np.asarray(m2)

        matrix_sum = m1_array + m2_array
        matrix_product = np.dot(m1_array, m2_array)

        return matrix_sum, matrix_product


    def eigen_analysis(matrix=None):
        """Return the eigenvalues and eigenvectors for the provided matrix."""

        matrix_array = np.array([[4, 1], [2, 3]]) if matrix is None else np.asarray(matrix)
        eigenvalues, eigenvectors = np.linalg.eig(matrix_array)
        return eigenvalues, eigenvectors


    def main():
        print("--- Vector Operations ---")
        vector_sum, vector_difference, dot_product = vector_operations()
        print(f"Sum of v1 and v2: {vector_sum}")
        print(f"Difference of v1 and v2: {vector_difference}")
        print(f"Dot product of v1 and v2: {dot_product}")
        print("-" * 25)

        print("\n--- Matrix Operations ---")
        matrix_sum, matrix_product = matrix_operations()
        print(f"Sum of M1 and M2:\n{matrix_sum}")
        print(f"Product of M1 and M2:\n{matrix_product}")
        print("-" * 25)

        print("\n--- Eigen-analysis ---")
        eigenvalues, eigenvectors = eigen_analysis()
        print(f"Matrix A:\n{np.array([[4, 1], [2, 3]])}")
        print(f"Eigenvalues: {eigenvalues}")
        print(f"Eigenvectors:\n{eigenvectors}")
        print("-" * 25)


    if __name__ == "__main__":
        main()
    ```
