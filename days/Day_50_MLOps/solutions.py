"""Reusable helpers for the Day 50 MLOps lesson.

The original script demonstrated how to train, persist, load, and reuse a
scikit-learn model.  The logic now lives in functions that can be imported from
tests or other projects.
"""

from __future__ import annotations

from collections import Counter
from math import ceil
from pathlib import Path
from typing import Iterable, Optional, Sequence, Tuple

import joblib
import numpy as np
from sklearn.datasets import load_iris
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split


def train_iris_model(
    *,
    test_size: float = 0.2,
    random_state: int = 42,
    max_iter: int = 200,
    subset_size: Optional[int] = None,
) -> Tuple[LogisticRegression, float, np.ndarray, np.ndarray, np.ndarray]:
    """Train a Logistic Regression model on the Iris dataset.

    Parameters
    ----------
    test_size:
        Fraction of the dataset to hold back for evaluation.
    random_state:
        Seed that controls the train/test split and optional sub-sampling.
    max_iter:
        Maximum number of iterations for the Logistic Regression solver.
    subset_size:
        If provided, draw a deterministic subset of this size before
        training. This is useful for demonstrations and tests where you want a
        smaller, reproducible dataset.

    Returns
    -------
    model:
        The trained scikit-learn estimator.
    accuracy:
        Accuracy on the held-out test set.
    X_test, y_test:
        The evaluation features and labels so callers can verify behaviour.
    target_names:
        Names of the Iris species corresponding to prediction indices.
    """

    iris = load_iris()
    X, y = iris.data, iris.target
    full_classes = np.unique(iris.target)

    if subset_size is not None:
        if subset_size <= 0:
            raise ValueError("subset_size must be a positive integer")
        if subset_size > len(X):
            raise ValueError("subset_size cannot exceed the dataset size")
        rng = np.random.RandomState(random_state)
        indices = rng.choice(len(X), subset_size, replace=False)
        X = X[indices]
        y = y[indices]

    present_classes = np.unique(y)
    missing_classes = sorted(set(full_classes) - set(present_classes))
    if missing_classes:
        raise ValueError(
            "Sub-sampled dataset is missing the following Iris classes: "
            f"{missing_classes}. Increase the subset_size to include all classes."
        )

    class_counts = Counter(int(label) for label in np.asarray(y))
    y_length = len(y)
    effective_test_ratio: Optional[float] = None
    if isinstance(test_size, (float, int)):
        if isinstance(test_size, float):
            if not 0 < test_size < 1:
                raise ValueError(
                    "test_size must be between 0 and 1 when provided as a float"
                )
            effective_test_ratio = test_size
        else:
            test_size_int = int(test_size)
            if test_size_int <= 0 or test_size_int >= y_length:
                raise ValueError(
                    "test_size must leave at least one sample in both the train and test sets"
                )
            effective_test_ratio = test_size_int / y_length

    for label in full_classes:
        count = class_counts[int(label)]
        if count < 2:
            raise ValueError(
                "Sub-sampled dataset must contain at least two samples per class to allow a stratified split."
            )
        if effective_test_ratio is not None:
            test_allocation = ceil(count * effective_test_ratio)
            if test_allocation == 0 or test_allocation >= count:
                raise ValueError(
                    "Sub-sampled dataset does not have enough samples of class "
                    f"{label} to satisfy test_size={test_size}. "
                    "Increase the subset_size or adjust test_size."
                )

    try:
        X_train, X_test, y_train, y_test = train_test_split(
            X,
            y,
            test_size=test_size,
            random_state=random_state,
            stratify=y,
        )
    except ValueError as exc:
        raise ValueError(
            "Unable to perform a stratified train/test split with the requested "
            "parameters. Ensure each class has sufficient samples for the chosen "
            "test_size."
        ) from exc

    model = LogisticRegression(max_iter=max_iter)
    model.fit(X_train, y_train)

    accuracy = accuracy_score(y_test, model.predict(X_test))
    return model, accuracy, X_test, y_test, iris.target_names


def save_model(model: LogisticRegression, path: Path | str) -> Path:
    """Persist the trained model to disk and return the resolved path."""

    path = Path(path).expanduser().resolve()
    path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, path)
    return path


def load_model(path: Path | str) -> LogisticRegression:
    """Load a persisted model from disk."""

    path = Path(path)
    return joblib.load(path)


def predict_sample(
    model: LogisticRegression,
    sample: Iterable[float],
    target_names: Optional[Sequence[str]] = None,
) -> Tuple[int, Optional[str]]:
    """Predict the Iris class for a single feature vector.

    Parameters
    ----------
    model:
        A trained scikit-learn estimator.
    sample:
        Iterable of feature values (sepal length, sepal width, petal length,
        petal width).
    target_names:
        Optional sequence of class labels. If provided, the corresponding name
        is returned alongside the numeric prediction.
    """

    array = np.asarray(sample, dtype=float)
    if array.ndim == 1:
        array = array.reshape(1, -1)
    prediction = model.predict(array)[0]
    name = None
    if target_names is not None:
        name = target_names[prediction]
    return prediction, name


def _demo() -> None:
    """Replicate the original script as a simple CLI demonstration."""

    print("--- Model Persistence Example ---")
    model, accuracy, X_test, y_test, target_names = train_iris_model()
    print(f"Model trained with an accuracy of: {accuracy * 100:.2f}%")
    print("-" * 30)

    model_filename = save_model(model, "iris_model.joblib")
    print(f"Model saved to '{model_filename}'")
    print("-" * 30)

    print("Loading model from file...")
    loaded_model = load_model(model_filename)
    print("Model loaded successfully.")
    print("-" * 30)

    new_sample = np.array([6.0, 2.5, 4.5, 1.5])
    prediction, predicted_class_name = predict_sample(
        loaded_model, new_sample, target_names
    )

    print("--- Making a Prediction with the Loaded Model ---")
    print(f"New sample data: {new_sample.tolist()}")
    print(f"Predicted class index: {prediction}")
    print(f"Predicted class name: '{predicted_class_name}'")
    print("This demonstrates that our saved model retains its knowledge.")
    print("-" * 30)
    print(
        "\nCheck out 'bonus_flask_api.py' for an example of how to serve this model in a web API."
    )


if __name__ == "__main__":
    _demo()
