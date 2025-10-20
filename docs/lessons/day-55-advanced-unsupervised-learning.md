Density-based clustering, hierarchical approaches, and modern embeddings unlock structure within messy
unlabelled datasets. Use the resources in this folder to:

- Compare DBSCAN and agglomerative clustering on reproducible customer segmentation datasets.
- Generate t-SNE and UMAP-style embeddings for storytelling-ready visualisations of high-dimensional data.
- Train compact autoencoders that reconstruct core signal while surfacing anomalies through reconstruction error.
- Combine reconstruction-based methods with classic isolation forests for a practical anomaly detection workflow.

Run `python Day_55_Advanced_Unsupervised_Learning/solutions.py` to reproduce the cluster assignments,
embeddings, and anomaly scores featured in the lesson.

## Additional Materials

- **solutions.ipynb**  
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_55_Advanced_Unsupervised_Learning/solutions.ipynb){ .md-button } 
  [📓 Open in NBViewer](https://nbviewer.org/github/saint2706/Coding-For-MBA/blob/main/Day_55_Advanced_Unsupervised_Learning/solutions.ipynb){ .md-button } 
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_55_Advanced_Unsupervised_Learning/solutions.ipynb){ .md-button .md-button--primary } 
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_55_Advanced_Unsupervised_Learning/solutions.ipynb){ .md-button }

???+ example "solutions.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_55_Advanced_Unsupervised_Learning/solutions.py)

    ```python title="solutions.py"
    """Advanced unsupervised learning helpers for Day 55."""

    from __future__ import annotations

    from dataclasses import dataclass
    from typing import Dict, Tuple

    import numpy as np
    import tensorflow as tf
    from numpy.typing import ArrayLike, NDArray
    from sklearn.cluster import DBSCAN, AgglomerativeClustering
    from sklearn.datasets import make_blobs
    from sklearn.ensemble import IsolationForest
    from sklearn.manifold import TSNE
    from sklearn.metrics import pairwise_distances
    from sklearn.neighbors import LocalOutlierFactor
    from sklearn.preprocessing import StandardScaler
    from tensorflow import keras
    from tensorflow.keras import layers


    @dataclass
    class ClusteringResult:
        """Simple container for clustering outputs."""

        labels: NDArray[np.int_]
        model: object


    def generate_clustering_data(
        n_samples: int = 450,
        random_state: int = 55,
    ) -> Tuple[NDArray[np.float64], NDArray[np.int_]]:
        """Return a reproducible blob dataset for clustering experiments."""

        X, y = make_blobs(
            n_samples=n_samples,
            centers=[[0, 0], [4, 4], [-4, 4]],
            cluster_std=[0.55, 0.6, 0.7],
            random_state=random_state,
        )
        return X, y


    def run_dbscan(
        X: ArrayLike,
        eps: float = 0.55,
        min_samples: int = 8,
        scale: bool = True,
    ) -> ClusteringResult:
        """Cluster the dataset with DBSCAN and optional feature scaling."""

        X = np.asarray(X, dtype=float)
        if scale:
            scaler = StandardScaler()
            X = scaler.fit_transform(X)
        model = DBSCAN(eps=eps, min_samples=min_samples)
        labels = model.fit_predict(X)
        return ClusteringResult(labels=labels, model=model)


    def run_agglomerative(
        X: ArrayLike,
        n_clusters: int = 3,
        linkage: str = "ward",
    ) -> ClusteringResult:
        """Perform agglomerative clustering and return labels and the fitted estimator."""

        X = np.asarray(X, dtype=float)
        model = AgglomerativeClustering(n_clusters=n_clusters, linkage=linkage)
        labels = model.fit_predict(X)
        return ClusteringResult(labels=labels, model=model)


    def compute_tsne_embedding(
        X: ArrayLike,
        n_components: int = 2,
        perplexity: float = 30.0,
        random_state: int = 55,
    ) -> NDArray[np.float64]:
        """Return a deterministic t-SNE embedding for visualisation."""

        X = np.asarray(X, dtype=float)
        tsne = TSNE(
            n_components=n_components,
            perplexity=perplexity,
            random_state=random_state,
            init="pca",
            learning_rate="auto",
            max_iter=1500,
        )
        return tsne.fit_transform(X)


    def build_autoencoder(
        input_dim: int,
        encoding_dim: int = 2,
        random_state: int = 55,
    ) -> keras.Model:
        """Create a compact dense autoencoder."""

        tf.keras.utils.set_random_seed(random_state)
        encoder_inputs = keras.Input(shape=(input_dim,))
        encoded = layers.Dense(encoding_dim, activation="relu")(encoder_inputs)
        decoded = layers.Dense(input_dim, activation="linear")(encoded)
        autoencoder = keras.Model(inputs=encoder_inputs, outputs=decoded)
        autoencoder.compile(optimizer=keras.optimizers.Adam(learning_rate=0.01), loss="mse")
        return autoencoder


    def train_autoencoder(
        model: keras.Model,
        X_train: ArrayLike,
        epochs: int = 80,
        batch_size: int = 32,
    ) -> keras.callbacks.History:
        """Train the autoencoder on the provided dataset."""

        X_train = np.asarray(X_train, dtype=float)
        history = model.fit(
            X_train,
            X_train,
            epochs=epochs,
            batch_size=batch_size,
            shuffle=True,
            verbose=0,
        )
        return history


    def reconstruction_errors(model: keras.Model, X: ArrayLike) -> NDArray[np.float64]:
        """Return mean squared reconstruction error per sample."""

        X = np.asarray(X, dtype=float)
        reconstructions = model.predict(X, verbose=0)
        return np.mean((X - reconstructions) ** 2, axis=1)


    def autoencoder_anomaly_threshold(errors: ArrayLike, quantile: float = 0.95) -> float:
        """Return an empirical anomaly threshold from reconstruction errors."""

        errors = np.asarray(errors, dtype=float)
        return float(np.quantile(errors, quantile))


    def detect_anomalies_with_autoencoder(
        model: keras.Model,
        X: ArrayLike,
        threshold: float,
    ) -> NDArray[np.int_]:
        """Return a binary mask where 1 indicates an anomaly."""

        errors = reconstruction_errors(model, X)
        return (errors > threshold).astype(int)


    def isolation_forest_scores(
        X: ArrayLike,
        contamination: float = 0.05,
        random_state: int = 55,
    ) -> NDArray[np.float64]:
        """Return anomaly scores from an isolation forest."""

        X = np.asarray(X, dtype=float)
        model = IsolationForest(
            contamination=contamination,
            random_state=random_state,
            n_estimators=200,
        )
        model.fit(X)
        return -model.decision_function(X)


    def lof_anomaly_scores(
        X: ArrayLike, n_neighbors: int = 20
    ) -> Tuple[NDArray[np.float64], NDArray[np.int_]]:
        """Return Local Outlier Factor scores (larger implies more anomalous)."""

        X = np.asarray(X, dtype=float)
        lof = LocalOutlierFactor(n_neighbors=n_neighbors, novelty=False)
        labels = lof.fit_predict(X)
        return -lof.negative_outlier_factor_, labels


    def tsne_distance_preservation(X: ArrayLike, embedding: ArrayLike) -> float:
        """Compute Spearman correlation between pairwise distances before and after embedding."""

        original = pairwise_distances(np.asarray(X, dtype=float))
        embedded = pairwise_distances(np.asarray(embedding, dtype=float))
        original_flat = original[np.triu_indices_from(original, k=1)]
        embedded_flat = embedded[np.triu_indices_from(embedded, k=1)]
        if original_flat.size == 0:
            return 1.0
        return float(np.corrcoef(original_flat, embedded_flat)[0, 1])


    def demo_unsupervised_pipeline(random_state: int = 55) -> Dict[str, float]:
        """Run the featured unsupervised workflow and return summary statistics."""

        X, _ = generate_clustering_data(random_state=random_state)
        dbscan_result = run_dbscan(X)
        agg_result = run_agglomerative(X)
        embedding = compute_tsne_embedding(X, random_state=random_state)
        distance_corr = tsne_distance_preservation(X, embedding)

        auto = build_autoencoder(input_dim=X.shape[1], random_state=random_state)
        train_autoencoder(auto, X, epochs=60)
        errors = reconstruction_errors(auto, X)
        threshold = autoencoder_anomaly_threshold(errors, 0.9)
        anomaly_rate = float(np.mean(errors > threshold))

        if_scores = isolation_forest_scores(X)

        return {
            "dbscan_clusters": float(
                len(set(dbscan_result.labels)) - (1 if -1 in dbscan_result.labels else 0)
            ),
            "agglomerative_clusters": float(len(np.unique(agg_result.labels))),
            "tsne_distance_corr": distance_corr,
            "autoencoder_threshold": threshold,
            "autoencoder_anomaly_rate": anomaly_rate,
            "isolation_forest_score_mean": float(np.mean(if_scores)),
        }


    if __name__ == "__main__":
        summary = demo_unsupervised_pipeline()
        for key, value in summary.items():
            print(f"{key}: {value:.3f}")
    ```
