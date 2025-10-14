## Overview

Day 44 introduces two foundational unsupervised learning workflows:

- **K-Means clustering** groups unlabeled observations into clusters using
  distance to learned centroids.
- **Principal Component Analysis (PCA)** compresses high-dimensional data
  into a smaller number of orthogonal components for easier visualization
  and downstream modeling.

Install scikit-learn before running the examples:

```bash
pip install scikit-learn
```

## What's inside

- `solutions.py` – reusable functions for generating blob data, fitting
  K-Means, and projecting datasets with PCA. Executing the file still
  creates the original visualisations.
- `README.md` – lesson summary (this document).

## Running the lesson script

Execute the scripted walkthrough, which will save clustering and PCA plots
to the project directory:

```bash
python Day_44_Unsupervised_Learning/solutions.py
```

## Running the tests

Automated tests validate the reusable helpers. Run just the Day 44 checks
with:

```bash
pytest tests/test_day_44.py
```

To execute the entire suite, simply call `pytest` from the repository
root.

## Further exploration

- Experiment with different numbers of clusters in `fit_kmeans` to observe
  how centroids move.
- Try increasing the number of PCA components and inspect the cumulative
  explained variance to decide how many dimensions to keep.



## Interactive Notebooks

Run this lesson's code interactively in your browser:

- [🚀 Launch solutions in JupyterLite](../../jupyterlite/lab?path=Day_44_Unsupervised_Learning/solutions.ipynb){ .md-button .md-button--primary }

!!! tip "About JupyterLite"
    JupyterLite runs entirely in your browser using WebAssembly. No installation or server required! Note: First launch may take a moment to load.
## Additional Materials

- **solutions.ipynb**  
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_44_Unsupervised_Learning/solutions.ipynb){ .md-button } 
  [📓 Open in NBViewer](https://nbviewer.org/github/saint2706/Coding-For-MBA/blob/main/Day_44_Unsupervised_Learning/solutions.ipynb){ .md-button } 
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_44_Unsupervised_Learning/solutions.ipynb){ .md-button .md-button--primary } 
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_44_Unsupervised_Learning/solutions.ipynb){ .md-button }

???+ example "solutions.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_44_Unsupervised_Learning/solutions.py)

    ```python title="solutions.py"
    """Reusable utilities for Day 44 unsupervised learning demos."""

    from typing import Tuple

    import matplotlib.pyplot as plt
    import numpy as np
    from sklearn.cluster import KMeans
    from sklearn.datasets import load_iris, make_blobs
    from sklearn.decomposition import PCA
    from sklearn.preprocessing import StandardScaler


    def generate_blobs(
        n_samples: int = 300,
        centers: int = 4,
        cluster_std: float = 0.7,
        random_state: int | None = 42,
    ) -> Tuple[np.ndarray, np.ndarray]:
        """Create a synthetic blob dataset for clustering demonstrations."""

        return make_blobs(
            n_samples=n_samples,
            centers=centers,
            cluster_std=cluster_std,
            random_state=random_state,
        )


    def fit_kmeans(
        X: np.ndarray,
        n_clusters: int = 4,
        random_state: int | None = 42,
        n_init: int = 10,
    ) -> Tuple[KMeans, np.ndarray, np.ndarray]:
        """Fit a K-Means model and return the estimator, labels, and cluster centers."""

        model = KMeans(n_clusters=n_clusters, random_state=random_state, n_init=n_init)
        labels = model.fit_predict(X)
        return model, labels, model.cluster_centers_


    def load_iris_data() -> Tuple[np.ndarray, np.ndarray, list[str]]:
        """Load the Iris dataset along with target values and class labels."""

        iris = load_iris()
        return iris.data, iris.target, iris.target_names.tolist()


    def run_pca(
        X: np.ndarray,
        n_components: int = 2,
    ) -> Tuple[np.ndarray, PCA, StandardScaler]:
        """Scale the features, run PCA, and return the transformed data with models."""

        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
        pca = PCA(n_components=n_components)
        transformed = pca.fit_transform(X_scaled)
        return transformed, pca, scaler


    def _plot_kmeans_results(
        X: np.ndarray, labels: np.ndarray, centers: np.ndarray
    ) -> None:
        plt.figure(figsize=(10, 6))
        plt.scatter(X[:, 0], X[:, 1], c=labels, s=50, cmap="viridis", label="Data Points")
        plt.scatter(
            centers[:, 0],
            centers[:, 1],
            c="red",
            s=200,
            alpha=0.75,
            marker="X",
            label="Centroids",
        )
        plt.title("K-Means Clustering")
        plt.xlabel("Feature 1")
        plt.ylabel("Feature 2")
        plt.legend()
        plt.grid(True)
        plt.savefig("kmeans_clusters.png")


    def _plot_pca_results(
        transformed: np.ndarray, targets: np.ndarray, target_names: list[str]
    ) -> None:
        plt.figure(figsize=(10, 6))
        scatter = plt.scatter(
            transformed[:, 0],
            transformed[:, 1],
            c=targets,
            cmap="viridis",
            edgecolor="k",
            s=60,
        )
        plt.title("PCA of Iris Dataset")
        plt.xlabel("First Principal Component")
        plt.ylabel("Second Principal Component")
        plt.legend(handles=scatter.legend_elements()[0], labels=target_names)
        plt.grid(True)
        plt.savefig("pca_iris.png")


    if __name__ == "__main__":
        print("--- K-Means Clustering Example ---")
        blobs, _ = generate_blobs()
        model, blob_labels, centers = fit_kmeans(blobs)
        print("K-Means applied to synthetic data with 4 clusters.")
        print(f"Cluster centers:\n{centers}")
        _plot_kmeans_results(blobs, blob_labels, centers)
        print("Saved K-Means visualization to 'kmeans_clusters.png'")
        print("-" * 30)

        print("\n--- PCA Example ---")
        iris_features, iris_target, iris_names = load_iris_data()
        transformed, pca_model, _ = run_pca(iris_features)
        print(f"Original shape: {iris_features.shape}")
        print(f"Shape after PCA: {transformed.shape}")
        explained_variance = pca_model.explained_variance_ratio_
        print(f"Explained variance by component: {explained_variance}")
        total_variance = explained_variance.sum() * 100
        print(f"Total variance explained by 2 components: {total_variance:.2f}%")
        _plot_pca_results(transformed, iris_target, iris_names)
        print("Saved PCA visualization to 'pca_iris.png'")
        print("-" * 30)
    ```
