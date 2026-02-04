"""Model tuning and feature selection utilities for Day 53."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, Iterable, Tuple

import numpy as np
import pandas as pd
from sklearn.datasets import make_classification
from sklearn.feature_selection import RFE
from sklearn.inspection import permutation_importance
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import GridSearchCV, StratifiedKFold, cross_val_score
from sklearn.pipeline import Pipeline, make_pipeline
from sklearn.preprocessing import StandardScaler
from skopt import BayesSearchCV
from skopt.space import Categorical, Real


@dataclass
class TuningResult:
    """Lightweight container for fitted search objects."""

    name: str
    search: object
    best_params: Dict[str, object]
    best_score: float


def generate_tuning_dataset(
    n_samples: int = 300,
    n_features: int = 10,
    n_informative: int = 5,
    class_sep: float = 2.0,
    random_state: int = 53,
) -> Tuple[np.ndarray, np.ndarray]:
    """Create a deterministic binary classification dataset for tuning demos."""

    X, y = make_classification(
        n_samples=n_samples,
        n_features=n_features,
        n_informative=n_informative,
        n_redundant=0,
        n_repeated=0,
        class_sep=class_sep,
        flip_y=0.01,
        random_state=random_state,
    )
    return X, y


def build_logistic_pipeline(random_state: int = 53) -> Pipeline:
    """Return a scaled logistic regression pipeline."""

    return make_pipeline(
        StandardScaler(),
        LogisticRegression(max_iter=2000, solver="lbfgs", random_state=random_state),
    )


def run_grid_search(
    X: np.ndarray,
    y: np.ndarray,
    param_grid: Dict[str, Iterable[float | int]] | None = None,
    cv: int = 5,
    scoring: str = "roc_auc",
    random_state: int = 53,
) -> TuningResult:
    """Execute a deterministic grid search for logistic regression hyperparameters."""

    pipeline = build_logistic_pipeline(random_state=random_state)
    if param_grid is None:
        param_grid = {
            "logisticregression__C": [0.1, 1.0, 10.0],
            "logisticregression__penalty": ["l2"],
        }
    cv_strategy = StratifiedKFold(n_splits=cv, shuffle=True, random_state=random_state)
    grid = GridSearchCV(
        pipeline,
        param_grid=param_grid,
        cv=cv_strategy,
        scoring=scoring,
        n_jobs=-1,
    )
    grid.fit(X, y)
    return TuningResult(
        name="grid_search",
        search=grid,
        best_params=grid.best_params_,
        best_score=float(grid.best_score_),
    )


def run_bayesian_optimisation(
    X: np.ndarray,
    y: np.ndarray,
    search_spaces: Dict[str, Iterable] | None = None,
    n_iter: int = 16,
    cv: int = 5,
    scoring: str = "roc_auc",
    random_state: int = 53,
) -> TuningResult:
    """Perform Bayesian optimisation using scikit-optimize's BayesSearchCV."""

    pipeline = build_logistic_pipeline(random_state=random_state)
    if search_spaces is None:
        search_spaces = {
            "logisticregression__C": Real(1e-2, 1e2, prior="log-uniform"),
            "logisticregression__penalty": Categorical(["l2"]),
        }
    cv_strategy = StratifiedKFold(n_splits=cv, shuffle=True, random_state=random_state)
    bayes = BayesSearchCV(
        pipeline,
        search_spaces=search_spaces,
        n_iter=n_iter,
        cv=cv_strategy,
        scoring=scoring,
        random_state=random_state,
        n_jobs=-1,
        refit=True,
    )
    bayes.fit(X, y)
    return TuningResult(
        name="bayesian_search",
        search=bayes,
        best_params=bayes.best_params_,
        best_score=float(bayes.best_score_),
    )


def compute_permutation_importance(
    model,
    X: np.ndarray,
    y: np.ndarray,
    n_repeats: int = 15,
    random_state: int = 53,
) -> pd.DataFrame:
    """Return permutation importance scores as a DataFrame."""

    result = permutation_importance(
        model,
        X,
        y,
        n_repeats=n_repeats,
        random_state=random_state,
        scoring="accuracy",
    )
    df = pd.DataFrame(
        {
            "feature": [f"feature_{i}" for i in range(X.shape[1])],
            "importance_mean": result.importances_mean,
            "importance_std": result.importances_std,
        }
    ).sort_values("importance_mean", ascending=False)
    return df.reset_index(drop=True)


def run_recursive_feature_elimination(
    X: np.ndarray,
    y: np.ndarray,
    n_features_to_select: int = 5,
    random_state: int = 53,
) -> Tuple[RFE, np.ndarray]:
    """Perform recursive feature elimination with logistic regression."""

    estimator = LogisticRegression(
        max_iter=2000, solver="lbfgs", random_state=random_state
    )
    selector = RFE(estimator, n_features_to_select=n_features_to_select)
    selector.fit(X, y)
    support = selector.support_
    return selector, support


def evaluate_selected_features(
    selector: RFE,
    X: np.ndarray,
    y: np.ndarray,
    cv: int = 5,
) -> float:
    """Evaluate the selected features with cross-validation accuracy."""

    X_selected = selector.transform(X)
    model = LogisticRegression(max_iter=2000)
    scores = cross_val_score(model, X_selected, y, cv=cv, scoring="accuracy")
    return float(np.mean(scores))


def run_day53_demo() -> Dict[str, TuningResult]:
    """Execute grid search and Bayesian optimisation workflows."""

    X, y = generate_tuning_dataset()
    grid = run_grid_search(X, y)
    bayes = run_bayesian_optimisation(X, y)

    pipeline = grid.search.best_estimator_
    permutation_df = compute_permutation_importance(pipeline, X, y)
    selector, support = run_recursive_feature_elimination(X, y)
    selected_score = evaluate_selected_features(selector, X, y)

    print("Permutation importance head:\n", permutation_df.head())
    print("Selected features:", np.where(support)[0])
    print(f"Cross-validated accuracy with selected features: {selected_score:.3f}")

    return {
        "grid": grid,
        "bayes": bayes,
    }


if __name__ == "__main__":
    results = run_day53_demo()
    for name, result in results.items():
        print(f"{name}: best score = {result.best_score:.3f}")
