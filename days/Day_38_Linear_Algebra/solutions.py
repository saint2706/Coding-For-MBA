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
