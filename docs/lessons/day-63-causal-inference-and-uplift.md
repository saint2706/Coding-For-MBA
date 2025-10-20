Understand how experimentation and counterfactual reasoning quantify impact. After this lesson you will:

- Estimate average treatment effects (ATE) from randomized A/B tests.
- Learn propensity score workflows for observational studies.
- Implement double machine learning with cross-fitted residualization.
- Build two-model uplift estimators to target incremental responders.

Run `python Day_63_Causal_Inference_and_Uplift/solutions.py` to generate synthetic treatment data, estimate effects with multiple techniques, and visualise uplift segmentations.

## Additional Materials

- **solutions.ipynb**  
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_63_Causal_Inference_and_Uplift/solutions.ipynb){ .md-button } 
  [📓 Open in NBViewer](https://nbviewer.org/github/saint2706/Coding-For-MBA/blob/main/Day_63_Causal_Inference_and_Uplift/solutions.ipynb){ .md-button } 
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_63_Causal_Inference_and_Uplift/solutions.ipynb){ .md-button .md-button--primary } 
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_63_Causal_Inference_and_Uplift/solutions.ipynb){ .md-button }

???+ example "solutions.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_63_Causal_Inference_and_Uplift/solutions.py)

    ```python title="solutions.py"
    """Causal inference utilities for Day 63."""

    from __future__ import annotations

    from dataclasses import dataclass
    from typing import Dict, List, Tuple

    import numpy as np
    import pandas as pd


    @dataclass
    class ABTestResult:
        """Summary statistics for a difference-in-means test."""

        lift: float
        stderr: float
        ci_low: float
        ci_high: float


    @dataclass
    class PropensityModel:
        """Logistic regression coefficients for propensity scores."""

        weights: np.ndarray
        feature_mean: np.ndarray
        feature_scale: np.ndarray

        def _scale(self, features: np.ndarray) -> np.ndarray:
            scaled = features.copy()
            scaled[:, 1:] = (scaled[:, 1:] - self.feature_mean) / (
                self.feature_scale + 1e-12
            )
            return scaled

        def predict_proba(self, features: np.ndarray) -> np.ndarray:
            logits = self._scale(features) @ self.weights
            return 1.0 / (1.0 + np.exp(-logits))


    @dataclass
    class DoubleMLResult:
        """Double machine learning effect estimate."""

        ate: float
        nuisance_r2: Tuple[float, float]


    @dataclass
    class UpliftResult:
        """Two-model uplift estimates for targeting."""

        treatment_response: float
        control_response: float
        uplift: float


    def generate_synthetic_treatment_data(
        n: int = 600, random_state: int = 63
    ) -> pd.DataFrame:
        """Create observational data with known treatment effect."""

        rng = np.random.default_rng(random_state)
        age = rng.integers(18, 65, size=n)
        browsing_time = rng.normal(4.0, 1.0, size=n)
        income = rng.normal(55_000, 8_000, size=n)
        baseline = 0.1 + 0.002 * (age - 30) + 0.00001 * (income - 50_000)
        propensity_logits = -0.5 + 0.04 * (browsing_time - 4) + 0.00003 * (income - 55_000)
        propensity = 1.0 / (1.0 + np.exp(-propensity_logits))
        treatment = rng.binomial(1, propensity)
        true_effect = 0.15
        outcome = np.clip(
            baseline + true_effect * treatment + 0.005 * (browsing_time - 4), 0, 1
        )
        return pd.DataFrame(
            {
                "age": age,
                "browsing_time": browsing_time,
                "income": income,
                "treatment": treatment,
                "outcome": outcome,
                "true_propensity": propensity,
                "true_effect": np.repeat(true_effect, n),
            }
        )


    def difference_in_means(data: pd.DataFrame) -> ABTestResult:
        """Compute lift and confidence interval for a randomized test."""

        treated = data[data["treatment"] == 1]["outcome"].to_numpy(dtype=float)
        control = data[data["treatment"] == 0]["outcome"].to_numpy(dtype=float)
        lift = treated.mean() - control.mean()
        stderr = np.sqrt(
            treated.var(ddof=1) / treated.size + control.var(ddof=1) / control.size
        )
        ci_low = lift - 1.96 * stderr
        ci_high = lift + 1.96 * stderr
        return ABTestResult(
            lift=float(lift),
            stderr=float(stderr),
            ci_low=float(ci_low),
            ci_high=float(ci_high),
        )


    def _prepare_design_matrix(
        data: pd.DataFrame, include_intercept: bool = True
    ) -> np.ndarray:
        features = data[["age", "browsing_time", "income"]].to_numpy(dtype=float)
        if include_intercept:
            return np.column_stack([np.ones(len(data)), features])
        return features


    def fit_propensity_model(
        data: pd.DataFrame, lr: float = 0.05, epochs: int = 800
    ) -> PropensityModel:
        """Fit logistic regression via gradient descent for propensity scores."""

        X = _prepare_design_matrix(data)
        y = data["treatment"].to_numpy(dtype=float)
        feature_mean = X[:, 1:].mean(axis=0)
        feature_scale = X[:, 1:].std(axis=0) + 1e-6
        X_scaled = X.copy()
        X_scaled[:, 1:] = (X_scaled[:, 1:] - feature_mean) / feature_scale
        weights = np.zeros(X.shape[1], dtype=float)
        for _ in range(epochs):
            logits = X_scaled @ weights
            preds = 1.0 / (1.0 + np.exp(-logits))
            gradient = X_scaled.T @ (preds - y) / len(y)
            weights -= lr * gradient
        return PropensityModel(
            weights=weights, feature_mean=feature_mean, feature_scale=feature_scale
        )


    def estimate_ipw_ate(data: pd.DataFrame, propensity_model: PropensityModel) -> float:
        """Inverse propensity weighting estimate of the treatment effect."""

        X = _prepare_design_matrix(data)
        propensities = propensity_model.predict_proba(X)
        treated = data["treatment"].to_numpy(dtype=float)
        outcome = data["outcome"].to_numpy(dtype=float)
        weights_treated = treated / (propensities + 1e-12)
        weights_control = (1 - treated) / (1 - propensities + 1e-12)
        ate = (weights_treated @ outcome) / weights_treated.sum() - (
            weights_control @ outcome
        ) / weights_control.sum()
        return float(ate)


    def _linear_regression(X: np.ndarray, y: np.ndarray) -> np.ndarray:
        beta, *_ = np.linalg.lstsq(X, y, rcond=None)
        return beta


    def double_machine_learning(data: pd.DataFrame) -> DoubleMLResult:
        """Compute double ML ATE with two-fold cross fitting."""

        n = len(data)
        fold = n // 2
        indices = np.arange(n)
        X = data[["age", "browsing_time", "income"]].to_numpy(dtype=float)
        T = data["treatment"].to_numpy(dtype=float)
        Y = data["outcome"].to_numpy(dtype=float)
        residuals_y = np.zeros_like(Y)
        residuals_t = np.zeros_like(T)
        r2_y: List[float] = []  # type: ignore[name-defined]
        r2_t: List[float] = []  # type: ignore[name-defined]
        for train_idx, test_idx in (
            (indices[:fold], indices[fold:]),
            (indices[fold:], indices[:fold]),
        ):
            X_train = X[train_idx]
            X_test = X[test_idx]
            Y_train = Y[train_idx]
            T_train = T[train_idx]
            X_design_train = np.column_stack([np.ones(len(train_idx)), X_train])
            beta_y = _linear_regression(X_design_train, Y_train)
            beta_t = _linear_regression(X_design_train, T_train)
            X_design_test = np.column_stack([np.ones(len(test_idx)), X_test])
            y_hat = X_design_test @ beta_y
            t_hat = X_design_test @ beta_t
            residuals_y[test_idx] = Y[test_idx] - y_hat
            residuals_t[test_idx] = T[test_idx] - t_hat
            ss_tot_y = np.sum((Y[train_idx] - Y[train_idx].mean()) ** 2)
            ss_res_y = np.sum((Y_train - X_design_train @ beta_y) ** 2)
            ss_tot_t = np.sum((T_train - T_train.mean()) ** 2)
            ss_res_t = np.sum((T_train - X_design_train @ beta_t) ** 2)
            r2_y.append(1 - ss_res_y / (ss_tot_y + 1e-12))
            r2_t.append(1 - ss_res_t / (ss_tot_t + 1e-12))
        ate = float(
            np.dot(residuals_t, residuals_y) / (np.dot(residuals_t, residuals_t) + 1e-12)
        )
        return DoubleMLResult(
            ate=ate, nuisance_r2=(float(np.mean(r2_y)), float(np.mean(r2_t)))
        )


    def two_model_uplift(data: pd.DataFrame) -> UpliftResult:
        """Estimate uplift using separate treatment and control response models."""

        treated = data[data["treatment"] == 1]
        control = data[data["treatment"] == 0]
        features_treated = np.column_stack(
            [
                np.ones(len(treated)),
                treated[["age", "browsing_time", "income"]].to_numpy(dtype=float),
            ]
        )
        features_control = np.column_stack(
            [
                np.ones(len(control)),
                control[["age", "browsing_time", "income"]].to_numpy(dtype=float),
            ]
        )
        beta_treated = _linear_regression(
            features_treated, treated["outcome"].to_numpy(dtype=float)
        )
        beta_control = _linear_regression(
            features_control, control["outcome"].to_numpy(dtype=float)
        )
        cohort = data[["age", "browsing_time", "income"]].to_numpy(dtype=float)
        cohort_design = np.column_stack([np.ones(len(cohort)), cohort])
        treatment_pred = float(np.mean(cohort_design @ beta_treated))
        control_pred = float(np.mean(cohort_design @ beta_control))
        uplift = treatment_pred - control_pred
        return UpliftResult(
            treatment_response=treatment_pred,
            control_response=control_pred,
            uplift=uplift,
        )


    def run_causal_suite(random_state: int = 63) -> Dict[str, object]:
        """Execute all causal estimators for documentation demos."""

        data = generate_synthetic_treatment_data(random_state=random_state)
        ab_result = difference_in_means(data)
        propensity_model = fit_propensity_model(data)
        ipw_ate = estimate_ipw_ate(data, propensity_model)
        dml_result = double_machine_learning(data)
        uplift_result = two_model_uplift(data)
        return {
            "data": data,
            "ab_test": ab_result,
            "ipw_ate": ipw_ate,
            "double_ml": dml_result,
            "uplift": uplift_result,
        }


    if __name__ == "__main__":
        results = run_causal_suite()
        print("A/B lift:", results["ab_test"])
        print("IPW ATE:", results["ipw_ate"])
        print("Double ML ATE:", results["double_ml"].ate)
        print("Uplift estimate:", results["uplift"].uplift)
    ```
