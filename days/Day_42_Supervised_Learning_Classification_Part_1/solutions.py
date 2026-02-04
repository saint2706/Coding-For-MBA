"""Reusable helpers for logistic regression and KNN on the Iris dataset."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Dict

import numpy as np
from sklearn.datasets import load_iris
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import StandardScaler


@dataclass
class IrisData:
    X_train: np.ndarray
    X_test: np.ndarray
    y_train: np.ndarray
    y_test: np.ndarray
    X_train_scaled: np.ndarray
    X_test_scaled: np.ndarray
    scaler: StandardScaler


def load_and_prepare_iris(
    test_size: float = 0.3,
    random_state: int = 42,
) -> IrisData:
    """Load the Iris dataset and return scaled/unscaled splits."""
    iris = load_iris()
    X_train, X_test, y_train, y_test = train_test_split(
        iris.data,
        iris.target,
        test_size=test_size,
        random_state=random_state,
        stratify=iris.target,
    )
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    return IrisData(
        X_train=X_train,
        X_test=X_test,
        y_train=y_train,
        y_test=y_test,
        X_train_scaled=X_train_scaled,
        X_test_scaled=X_test_scaled,
        scaler=scaler,
    )


def train_logistic_regression(
    X_train: np.ndarray,
    y_train: np.ndarray,
    *,
    random_state: int = 42,
    max_iter: int = 200,
) -> LogisticRegression:
    """Train a logistic regression classifier with deterministic settings."""
    model = LogisticRegression(random_state=random_state, max_iter=max_iter)
    model.fit(X_train, y_train)
    return model


def train_knn_classifier(
    X_train: np.ndarray,
    y_train: np.ndarray,
    *,
    n_neighbors: int = 5,
) -> KNeighborsClassifier:
    """Train a K-Nearest Neighbours classifier."""
    model = KNeighborsClassifier(n_neighbors=n_neighbors)
    model.fit(X_train, y_train)
    return model


def evaluate_classifier(
    model,
    X_test: np.ndarray,
    y_test: np.ndarray,
) -> Dict[str, float]:
    """Return a dictionary of evaluation metrics for the classifier."""
    accuracy = accuracy_score(y_test, model.predict(X_test))
    return {"accuracy": accuracy}


def run_classification_demo() -> Dict[str, Dict[str, float]]:
    """Run the Day 42 classification demo and return the metrics."""
    data = load_and_prepare_iris()
    log_reg = train_logistic_regression(data.X_train_scaled, data.y_train)
    knn = train_knn_classifier(data.X_train_scaled, data.y_train)
    return {
        "logistic_regression": evaluate_classifier(
            log_reg, data.X_test_scaled, data.y_test
        ),
        "knn": evaluate_classifier(knn, data.X_test_scaled, data.y_test),
    }


if __name__ == "__main__":
    metrics = run_classification_demo()
    print("--- Classification Example on Iris Dataset ---")
    print("Training Logistic Regression and KNN models...")
    for model_name, model_metrics in metrics.items():
        print(
            f"{model_name.replace('_', ' ').title()} accuracy: {model_metrics['accuracy']:.4f}"
        )
