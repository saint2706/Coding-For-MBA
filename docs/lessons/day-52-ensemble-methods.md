Day 52 highlights how bagging, boosting, and stacking unlock better accuracy
than single estimators. Use the notebook or `solutions.py` helpers to:

- Generate a balanced synthetic dataset for comparing ensemble families.
- Train a random forest with out-of-bag (OOB) scoring and export feature
  importances for stakeholder-ready summaries.
- Fit a gradient boosting model, combine learners through stacking, and calibrate
  probabilities so the predictions can power downstream decision rules.

Execute `python Day_52_Ensemble_Methods/solutions.py` to print validation scores
for each ensemble configuration.

## Additional Materials

- **solutions.ipynb**  
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_52_Ensemble_Methods/solutions.ipynb){ .md-button } 
  [📓 Open in NBViewer](https://nbviewer.org/github/saint2706/Coding-For-MBA/blob/main/Day_52_Ensemble_Methods/solutions.ipynb){ .md-button } 
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_52_Ensemble_Methods/solutions.ipynb){ .md-button .md-button--primary } 
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_52_Ensemble_Methods/solutions.ipynb){ .md-button }

???+ example "solutions.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_52_Ensemble_Methods/solutions.py)

    ```python title="solutions.py"
    """Reusable ensemble helpers for Day 52."""

    from __future__ import annotations

    from dataclasses import dataclass
    from pathlib import Path
    from typing import Dict, List, Sequence, Tuple

    import numpy as np
    import pandas as pd
    from sklearn.calibration import CalibratedClassifierCV
    from sklearn.datasets import make_classification
    from sklearn.ensemble import (
        GradientBoostingClassifier,
        RandomForestClassifier,
        StackingClassifier,
    )
    from sklearn.linear_model import LogisticRegression
    from sklearn.metrics import accuracy_score, brier_score_loss
    from sklearn.model_selection import cross_val_score, train_test_split
    from sklearn.pipeline import Pipeline, make_pipeline
    from sklearn.preprocessing import StandardScaler


    @dataclass
    class EnsembleResult:
        """Summary of an ensemble model and its validation score."""

        name: str
        model: object
        score: float


    def generate_classification_data(
        n_samples: int = 400,
        n_features: int = 12,
        n_informative: int = 6,
        class_sep: float = 1.8,
        random_state: int = 52,
    ) -> Tuple[np.ndarray, np.ndarray]:
        """Return a deterministic classification dataset suitable for ensembles."""

        X, y = make_classification(
            n_samples=n_samples,
            n_features=n_features,
            n_informative=n_informative,
            n_redundant=0,
            class_sep=class_sep,
            random_state=random_state,
        )
        return X, y


    def train_random_forest(
        X: np.ndarray,
        y: np.ndarray,
        n_estimators: int = 200,
        max_depth: int | None = None,
        random_state: int = 52,
    ) -> RandomForestClassifier:
        """Fit a random forest classifier with out-of-bag scoring enabled."""

        model = RandomForestClassifier(
            n_estimators=n_estimators,
            max_depth=max_depth,
            oob_score=True,
            random_state=random_state,
            bootstrap=True,
            n_jobs=-1,
        )
        model.fit(X, y)
        return model


    def train_gradient_boosting(
        X: np.ndarray,
        y: np.ndarray,
        learning_rate: float = 0.05,
        n_estimators: int = 300,
        max_depth: int = 2,
        random_state: int = 52,
    ) -> GradientBoostingClassifier:
        """Train a gradient boosting classifier with mild regularisation."""

        model = GradientBoostingClassifier(
            learning_rate=learning_rate,
            n_estimators=n_estimators,
            max_depth=max_depth,
            random_state=random_state,
        )
        model.fit(X, y)
        return model


    def build_stacking_classifier(
        estimators: List[Tuple[str, Pipeline]] | None = None,
        random_state: int = 52,
    ) -> StackingClassifier:
        """Create a stacking classifier with logistic regression as the final estimator."""

        if estimators is None:
            estimators = [
                (
                    "rf",
                    make_pipeline(
                        StandardScaler(with_mean=False),
                        RandomForestClassifier(
                            n_estimators=150,
                            max_depth=None,
                            random_state=random_state,
                            n_jobs=-1,
                        ),
                    ),
                ),
                (
                    "gb",
                    make_pipeline(
                        StandardScaler(),
                        GradientBoostingClassifier(
                            learning_rate=0.05,
                            n_estimators=200,
                            max_depth=2,
                            random_state=random_state,
                        ),
                    ),
                ),
            ]
        final_estimator = LogisticRegression(max_iter=1000, random_state=random_state)
        stacking = StackingClassifier(
            estimators=estimators,
            final_estimator=final_estimator,
            passthrough=False,
            stack_method="predict_proba",
            n_jobs=-1,
        )
        return stacking


    def calibrate_classifier(
        model,
        X_train: np.ndarray,
        y_train: np.ndarray,
        method: str = "isotonic",
        cv: int = 3,
    ) -> CalibratedClassifierCV:
        """Wrap a fitted classifier with probability calibration."""

        calibrated = CalibratedClassifierCV(estimator=model, method=method, cv=cv)
        calibrated.fit(X_train, y_train)
        return calibrated


    def evaluate_classifier(
        model, X_test: np.ndarray, y_test: np.ndarray
    ) -> Dict[str, float]:
        """Return accuracy and Brier score for the provided classifier."""

        probs = model.predict_proba(X_test)[:, 1]
        preds = (probs >= 0.5).astype(int)
        return {
            "accuracy": float(accuracy_score(y_test, preds)),
            "brier": float(brier_score_loss(y_test, probs)),
        }


    def export_feature_importance(
        model: RandomForestClassifier,
        feature_names: Sequence[str],
        output_path: str | Path | None = None,
    ) -> pd.DataFrame:
        """Return and optionally persist feature importances as a DataFrame."""

        importances = pd.DataFrame(
            {
                "feature": list(feature_names),
                "importance": model.feature_importances_,
            }
        ).sort_values("importance", ascending=False)
        if output_path is not None:
            output_path = Path(output_path)
            importances.to_csv(output_path, index=False)
        return importances.reset_index(drop=True)


    def evaluate_with_cross_validation(
        model,
        X: np.ndarray,
        y: np.ndarray,
        cv: int = 5,
        scoring: str = "roc_auc",
    ) -> float:
        """Return the mean cross-validated score for a classifier."""

        scores = cross_val_score(model, X, y, cv=cv, scoring=scoring)
        return float(np.mean(scores))


    def run_day52_demo() -> Dict[str, EnsembleResult]:
        """Train and evaluate the featured ensemble models."""

        X, y = generate_classification_data()
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.25, random_state=52, stratify=y
        )

        rf = train_random_forest(X_train, y_train)
        gb = train_gradient_boosting(X_train, y_train)

        stacking = build_stacking_classifier()
        stacking.fit(X_train, y_train)
        calibrated = calibrate_classifier(stacking, X_train, y_train)

        results = {
            "random_forest": EnsembleResult(
                name="random_forest",
                model=rf,
                score=float(rf.oob_score_),
            ),
            "gradient_boosting": EnsembleResult(
                name="gradient_boosting",
                model=gb,
                score=float(evaluate_with_cross_validation(gb, X, y)),
            ),
            "stacking_calibrated": EnsembleResult(
                name="stacking_calibrated",
                model=calibrated,
                score=evaluate_classifier(calibrated, X_test, y_test)["accuracy"],
            ),
        }
        return results


    if __name__ == "__main__":
        results = run_day52_demo()
        for name, result in results.items():
            print(f"{name}: validation score = {result.score:.3f}")
    ```
