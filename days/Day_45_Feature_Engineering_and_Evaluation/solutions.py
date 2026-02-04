"""Composable feature engineering and evaluation utilities for Day 45."""

from __future__ import annotations

from typing import Dict, Iterable, Tuple

import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler


def create_sample_dataframe() -> pd.DataFrame:
    """Return the toy purchase dataset used in the lesson."""

    data = {
        "age": [25, 30, 35, 40, np.nan, 45, 50],
        "salary": [50000, 60000, np.nan, 80000, 90000, 100000, 110000],
        "city": [
            "New York",
            "London",
            "Paris",
            "New York",
            "London",
            "Tokyo",
            "Paris",
        ],
        "purchased": [0, 1, 0, 1, 1, 0, 1],
    }
    return pd.DataFrame(data)


def build_preprocessing_pipeline(
    numeric_features: Iterable[str] = ("age", "salary"),
    categorical_features: Iterable[str] = ("city",),
) -> ColumnTransformer:
    """Create a ColumnTransformer that handles numeric and categorical columns."""

    numeric_transformer = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="mean")),
            ("scaler", StandardScaler()),
        ]
    )
    categorical_transformer = Pipeline(
        steps=[
            ("onehot", OneHotEncoder(handle_unknown="ignore")),
        ]
    )

    return ColumnTransformer(
        transformers=[
            ("num", numeric_transformer, list(numeric_features)),
            ("cat", categorical_transformer, list(categorical_features)),
        ]
    )


def preprocess_dataframe(
    df: pd.DataFrame,
    preprocessor: ColumnTransformer | None = None,
) -> Tuple[np.ndarray, pd.Series, ColumnTransformer]:
    """Fit the preprocessing pipeline and return the transformed feature matrix."""

    if "purchased" not in df.columns:
        raise ValueError("Expected 'purchased' target column in the dataframe.")

    X = df.drop("purchased", axis=1)
    y = df["purchased"]
    preprocessor = preprocessor or build_preprocessing_pipeline()
    X_processed = preprocessor.fit_transform(X)
    return X_processed, y, preprocessor


def build_model_pipeline(preprocessor: ColumnTransformer) -> Pipeline:
    """Combine preprocessing with a logistic regression classifier."""

    return Pipeline(
        steps=[
            ("preprocess", preprocessor),
            ("classifier", LogisticRegression()),
        ]
    )


def evaluate_model(
    df: pd.DataFrame,
    test_size: float = 0.3,
    random_state: int | None = 42,
) -> Tuple[Pipeline, Dict[str, object]]:
    """Train the pipeline and compute evaluation metrics on a test split."""

    if "purchased" not in df.columns:
        raise ValueError("Expected 'purchased' target column in the dataframe.")

    X = df.drop("purchased", axis=1)
    y = df["purchased"]
    preprocessor = build_preprocessing_pipeline()
    pipeline = build_model_pipeline(preprocessor)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state
    )
    pipeline.fit(X_train, y_train)
    y_pred = pipeline.predict(X_test)

    metrics: Dict[str, object] = {
        "confusion_matrix": confusion_matrix(y_test, y_pred),
        "classification_report": classification_report(y_test, y_pred, zero_division=0),
    }
    return pipeline, metrics


if __name__ == "__main__":
    print("--- Feature Engineering Example ---")
    dataframe = create_sample_dataframe()
    print("Original DataFrame:")
    print(dataframe)
    print("-" * 30)

    processed, target, fitted_preprocessor = preprocess_dataframe(dataframe)
    print("Shape of data after preprocessing:", processed.shape)
    print("Note: 'city' was expanded into multiple columns by OneHotEncoder.")
    print("Transformed data (first 3 rows):")
    print(processed[:3])
    print("-" * 30)

    print("\n--- Model Evaluation Example ---")
    model, metrics = evaluate_model(dataframe)
    confusion = metrics["confusion_matrix"]
    print("Confusion Matrix:")
    print(confusion)
    print("TN | FP")
    print("FN | TP")
    print(
        f"True Negatives (TN): {confusion[0, 0]} | False Positives (FP): {confusion[0, 1]}"
    )
    print(
        f"False Negatives (FN): {confusion[1, 0]} | True Positives (TP): {confusion[1, 1]}"
    )
    print("-" * 30)
    print("Classification Report:")
    print(metrics["classification_report"])
    print(
        "This report provides a breakdown of precision, recall, and f1-score for each class."
    )
    print("-" * 30)
