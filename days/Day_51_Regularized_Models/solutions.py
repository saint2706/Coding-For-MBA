"""Utilities for exploring regularised linear models in Day 51."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, Tuple

import numpy as np
from sklearn.datasets import make_regression
from sklearn.linear_model import (
    ElasticNet,
    Lasso,
    LinearRegression,
    PoissonRegressor,
    Ridge,
)
from sklearn.metrics import mean_poisson_deviance
from sklearn.model_selection import KFold, cross_val_score
from sklearn.pipeline import Pipeline, make_pipeline
from sklearn.preprocessing import StandardScaler


@dataclass(frozen=True)
class RegularisedModelResult:
    """Container for a fitted regularised model and its metrics."""

    name: str
    pipeline: Pipeline
    cv_score: float


def load_synthetic_regression(
    n_samples: int = 200,
    n_features: int = 12,
    n_informative: int = 6,
    noise: float = 8.0,
    random_state: int = 51,
) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
    """Return a deterministic regression dataset with informative coefficients."""

    X, y, true_coef = make_regression(
        n_samples=n_samples,
        n_features=n_features,
        n_informative=n_informative,
        noise=noise,
        coef=True,
        random_state=random_state,
    )
    return X, y, true_coef


def build_regularised_pipeline(
    model: str,
    alpha: float = 1.0,
    l1_ratio: float = 0.5,
    random_state: int | None = 51,
) -> Pipeline:
    """Create a standardised pipeline for the requested regularised estimator."""

    if model == "ridge":
        estimator = Ridge(alpha=alpha, random_state=random_state)
    elif model == "lasso":
        estimator = Lasso(alpha=alpha, random_state=random_state, max_iter=5000)
    elif model == "elastic_net":
        estimator = ElasticNet(
            alpha=alpha, l1_ratio=l1_ratio, random_state=random_state, max_iter=5000
        )
    elif model == "linear":
        estimator = LinearRegression()
    else:
        raise ValueError(f"Unsupported model '{model}'.")
    return make_pipeline(StandardScaler(), estimator)


def evaluate_models_with_cv(
    pipelines: Dict[str, Pipeline],
    X: np.ndarray,
    y: np.ndarray,
    cv: int = 5,
    scoring: str = "neg_mean_squared_error",
) -> Dict[str, RegularisedModelResult]:
    """Fit each pipeline with cross-validation and capture their scores."""

    splitter = KFold(n_splits=cv, shuffle=True, random_state=42)
    results: Dict[str, RegularisedModelResult] = {}
    for name, pipeline in pipelines.items():
        scores = cross_val_score(pipeline, X, y, scoring=scoring, cv=splitter)
        pipeline.fit(X, y)
        results[name] = RegularisedModelResult(
            name=name, pipeline=pipeline, cv_score=float(np.mean(scores))
        )
    return results


def summarise_coefficients(
    results: Dict[str, RegularisedModelResult],
) -> Dict[str, Dict[str, float]]:
    """Report coefficient shrinkage statistics for fitted regularised models."""

    summary: Dict[str, Dict[str, float]] = {}
    for name, result in results.items():
        estimator = result.pipeline[-1]
        if not hasattr(estimator, "coef_"):
            continue
        coef = estimator.coef_
        summary[name] = {
            "l1_norm": float(np.sum(np.abs(coef))),
            "l2_norm": float(np.sqrt(np.sum(coef**2))),
            "non_zero": int(np.count_nonzero(np.abs(coef) > 1e-8)),
        }
    return summary


def fit_poisson_glm(
    X: np.ndarray,
    y: np.ndarray,
    alpha: float = 0.0,
    max_iter: int = 500,
    random_state: int | None = 51,
) -> Tuple[Pipeline, float]:
    """Fit a Poisson regression GLM and return the model with its deviance."""

    pipeline = make_pipeline(
        StandardScaler(with_mean=False),
        PoissonRegressor(alpha=alpha, max_iter=max_iter, fit_intercept=True),
    )
    pipeline.fit(X, y)
    preds = pipeline.predict(X)
    deviance = mean_poisson_deviance(y, preds)
    return pipeline, float(deviance)


def run_day51_demo() -> Dict[str, RegularisedModelResult]:
    """Train ridge, lasso, and elastic net pipelines on the synthetic dataset."""

    X, y, _ = load_synthetic_regression()
    models = {
        "linear": build_regularised_pipeline("linear"),
        "ridge": build_regularised_pipeline("ridge", alpha=1.0),
        "lasso": build_regularised_pipeline("lasso", alpha=0.05),
        "elastic_net": build_regularised_pipeline(
            "elastic_net", alpha=0.08, l1_ratio=0.5
        ),
    }
    results = evaluate_models_with_cv(models, X, y)
    return results


if __name__ == "__main__":
    fitted = run_day51_demo()
    coefficient_summary = summarise_coefficients(fitted)
    print("Day 51 Regularised Models Demo")
    for name, result in fitted.items():
        print(f"- {name}: CV score (neg MSE) = {result.cv_score:.3f}")
    print("\nCoefficient summary:")
    for name, stats in coefficient_summary.items():
        print(
            f"- {name}: L1 {stats['l1_norm']:.2f}, L2 {stats['l2_norm']:.2f}, non-zero {stats['non_zero']}"
        )
