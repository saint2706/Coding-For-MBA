"""Interpretability and fairness helpers for Day 62."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List, Mapping, Sequence, Tuple

import numpy as np
import pandas as pd


@dataclass
class LinearModel:
    """Simple linear model container."""

    coefficients: np.ndarray
    intercept: float
    feature_names: Sequence[str]

    def predict(self, features: Sequence[float]) -> float:
        vector = np.asarray(features, dtype=float)
        return float(self.intercept + np.dot(self.coefficients, vector))


@dataclass
class ShapExplanation:
    """Container for SHAP-style additive explanations."""

    base_value: float
    contributions: np.ndarray

    def reconstructed_prediction(self) -> float:
        return float(self.base_value + self.contributions.sum())


@dataclass
class LimeExplanation:
    """Container for LIME-style local linear approximations."""

    intercept: float
    weights: np.ndarray
    prediction: float

    def local_prediction(self, instance: Sequence[float]) -> float:
        vector = np.asarray(instance, dtype=float)
        return float(self.intercept + np.dot(self.weights, vector))


@dataclass
class CounterfactualResult:
    """Result of a counterfactual search."""

    original_prediction: float
    target: float
    counterfactual_features: np.ndarray
    counterfactual_prediction: float
    delta: np.ndarray


@dataclass
class FairnessReport:
    """Bias metrics calculated on binary outcomes."""

    statistical_parity: float
    disparate_impact: float
    equal_opportunity: float


def load_credit_dataset() -> pd.DataFrame:
    """Return a deterministic lending dataset for fairness experiments."""

    rng = np.random.default_rng(62)
    records: List[Dict[str, float]] = []
    for credit_score in (580, 620, 660, 700, 740):
        for income in (42_000, 58_000, 74_000):
            for gender in ("F", "M"):
                base_prob = (
                    0.15 + 0.0006 * (credit_score - 600) + 0.000002 * (income - 50_000)
                )
                shift = -0.04 if gender == "F" else 0.0
                approval = rng.random() < (base_prob + shift)
                records.append(
                    {
                        "credit_score": credit_score,
                        "income": income,
                        "gender": gender,
                        "approved": float(approval),
                        "default_risk": 0.35
                        - 0.0004 * credit_score
                        - 0.0000015 * income
                        + (0.02 if gender == "F" else 0.0),
                    }
                )
    return pd.DataFrame.from_records(records)


def train_default_risk_model() -> LinearModel:
    """Fit a closed-form linear regression on the credit dataset."""

    df = load_credit_dataset()
    feature_names = ["credit_score", "income", "is_female"]
    X = np.column_stack(
        [
            df["credit_score"].to_numpy(dtype=float),
            df["income"].to_numpy(dtype=float),
            (df["gender"] == "F").to_numpy(dtype=float),
        ]
    )
    y = df["default_risk"].to_numpy(dtype=float)
    X_design = np.column_stack([np.ones(len(df)), X])
    coefficients, *_ = np.linalg.lstsq(X_design, y, rcond=None)
    intercept = float(coefficients[0])
    weights = np.asarray(coefficients[1:], dtype=float)
    return LinearModel(
        coefficients=weights, intercept=intercept, feature_names=feature_names
    )


def _baseline_from_dataset(
    model: LinearModel, dataset: pd.DataFrame | None = None
) -> Tuple[float, np.ndarray]:
    if dataset is None:
        dataset = load_credit_dataset()
    baseline_features = np.column_stack(
        [
            dataset["credit_score"].to_numpy(dtype=float),
            dataset["income"].to_numpy(dtype=float),
            (dataset["gender"] == "F").to_numpy(dtype=float),
        ]
    ).mean(axis=0)
    base_value = model.predict(baseline_features)
    return base_value, baseline_features


def compute_shap_values(
    model: LinearModel,
    instance: Sequence[float],
    dataset: pd.DataFrame | None = None,
) -> ShapExplanation:
    """Return additive SHAP-style contributions for a linear model."""

    base_value, baseline_features = _baseline_from_dataset(model, dataset)
    instance_arr = np.asarray(instance, dtype=float)
    contributions = model.coefficients * (instance_arr - baseline_features)
    return ShapExplanation(base_value=base_value, contributions=contributions)


def _kernel_weights(distances: np.ndarray, kernel_width: float) -> np.ndarray:
    weights = np.exp(-(distances**2) / (kernel_width**2))
    return weights / (weights.sum() + 1e-12)


def lime_explanation(
    model: LinearModel,
    instance: Sequence[float],
    num_samples: int = 200,
    kernel_width: float = 0.75,
    random_state: int = 62,
) -> LimeExplanation:
    """Fit a locally weighted surrogate model around an instance."""

    rng = np.random.default_rng(random_state)
    instance_arr = np.asarray(instance, dtype=float)
    noise = rng.normal(
        scale=[20.0, 5_000.0, 0.2], size=(num_samples, instance_arr.size)
    )
    samples = instance_arr + noise
    predictions = np.apply_along_axis(model.predict, 1, samples)
    distances = np.linalg.norm(samples - instance_arr, axis=1)
    weights = _kernel_weights(distances, kernel_width)
    X_design = np.column_stack([np.ones(num_samples), samples])
    W = np.diag(weights)
    beta = np.linalg.pinv(X_design.T @ W @ X_design) @ (X_design.T @ W @ predictions)
    coefs = np.asarray(beta[1:], dtype=float)
    prediction = model.predict(instance_arr)
    intercept = float(prediction - np.dot(coefs, instance_arr))
    return LimeExplanation(intercept=intercept, weights=coefs, prediction=prediction)


def generate_counterfactual(
    model: LinearModel,
    instance: Sequence[float],
    target: float,
    bounds: Mapping[str, Tuple[float, float]],
) -> CounterfactualResult:
    """Compute a counterfactual by moving along the coefficient direction."""

    features = np.asarray(instance, dtype=float)
    original_pred = model.predict(features)
    direction = model.coefficients
    scale = (target - original_pred) / (np.dot(direction, direction) + 1e-12)
    raw_cf = features + scale * direction
    ordered_bounds = np.array(
        [bounds[name] for name in model.feature_names], dtype=float
    )
    clipped_cf = np.clip(raw_cf, ordered_bounds[:, 0], ordered_bounds[:, 1])
    cf_prediction = model.predict(clipped_cf)
    return CounterfactualResult(
        original_prediction=original_pred,
        target=target,
        counterfactual_features=clipped_cf,
        counterfactual_prediction=cf_prediction,
        delta=clipped_cf - features,
    )


def fairness_metrics(dataset: pd.DataFrame) -> FairnessReport:
    """Compute key bias metrics for the approval outcome."""

    grouped = dataset.groupby("gender")
    approval_rate = grouped["approved"].mean()
    female_rate = float(approval_rate.get("F", np.nan))
    male_rate = float(approval_rate.get("M", np.nan))
    statistical_parity = female_rate - male_rate
    disparate_impact = female_rate / male_rate if male_rate > 0 else np.nan

    # Equal opportunity: P(approval=1 | default risk below threshold)
    low_risk = dataset[dataset["default_risk"] < dataset["default_risk"].median()]
    eq_grouped = low_risk.groupby("gender")["approved"].mean()
    female_eq = float(eq_grouped.get("F", np.nan))
    male_eq = float(eq_grouped.get("M", np.nan))
    equal_opportunity = female_eq - male_eq

    return FairnessReport(
        statistical_parity=statistical_parity,
        disparate_impact=disparate_impact,
        equal_opportunity=equal_opportunity,
    )


def apply_reweighing(dataset: pd.DataFrame) -> pd.DataFrame:
    """Return a dataframe with sample weights that mitigate statistical parity gaps."""

    df = dataset.copy()
    grouped = df.groupby("gender")
    approval_rate = grouped["approved"].mean()
    target_rate = float(df["approved"].mean())
    weights = []
    for _, row in df.iterrows():
        group_rate = float(approval_rate[row["gender"]])
        weights.append(target_rate / (group_rate + 1e-12))
    df["sample_weight"] = weights
    return df


def mitigation_effect(dataset: pd.DataFrame) -> FairnessReport:
    """Recompute fairness metrics after reweighing."""

    reweighted = apply_reweighing(dataset)
    weighted = {
        gender: float(np.average(grp["approved"], weights=grp["sample_weight"]))
        for gender, grp in reweighted.groupby("gender")
    }
    female_rate = float(weighted.get("F", np.nan))
    male_rate = float(weighted.get("M", np.nan))
    statistical_parity = female_rate - male_rate
    disparate_impact = female_rate / male_rate if male_rate > 0 else np.nan

    low_risk = reweighted[
        reweighted["default_risk"] < reweighted["default_risk"].median()
    ]
    eq_weighted = {
        gender: float(np.average(grp["approved"], weights=grp["sample_weight"]))
        for gender, grp in low_risk.groupby("gender")
    }
    female_eq = float(eq_weighted.get("F", np.nan))
    male_eq = float(eq_weighted.get("M", np.nan))
    equal_opportunity = female_eq - male_eq

    return FairnessReport(
        statistical_parity=statistical_parity,
        disparate_impact=disparate_impact,
        equal_opportunity=equal_opportunity,
    )


def run_interpretability_suite() -> Dict[str, object]:
    """Execute interpretability and fairness utilities for documentation demos."""

    model = train_default_risk_model()
    dataset = load_credit_dataset()
    instance = dataset.loc[0, ["credit_score", "income", "gender"]]
    encoded_instance = np.array(
        [instance["credit_score"], instance["income"], float(instance["gender"] == "F")]
    )
    shap = compute_shap_values(model, encoded_instance, dataset)
    lime = lime_explanation(model, encoded_instance)
    bounds = {
        "credit_score": (500, 850),
        "income": (30_000, 120_000),
        "is_female": (0.0, 1.0),
    }
    counterfactual = generate_counterfactual(
        model, encoded_instance, target=0.05, bounds=bounds
    )
    fairness = fairness_metrics(dataset)
    mitigated = mitigation_effect(dataset)
    return {
        "model": model,
        "shap": shap,
        "lime": lime,
        "counterfactual": counterfactual,
        "fairness": fairness,
        "mitigated": mitigated,
    }


if __name__ == "__main__":
    report = run_interpretability_suite()
    print("Base prediction:", report["shap"].reconstructed_prediction())
    print(
        "LIME local prediction:",
        report["lime"].local_prediction(
            report["counterfactual"].counterfactual_features
        ),
    )
    print("Counterfactual delta:", report["counterfactual"].delta)
    print("Fairness metrics:", report["fairness"])
    print("After mitigation:", report["mitigated"])
