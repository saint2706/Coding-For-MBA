---
title: Day 78 – BI Experimentation and Predictive Insights
tags:
  - BI
---

This lesson connects experimentation design, forecasting, and machine learning so BI teams can run
trustworthy experiments and produce forward-looking recommendations.

## What's inside

- `lesson.py` – runnable walkthrough covering experimentation diagnostics, cohort retention,
  linear-trend forecasting, and predictive modelling/segmentation patterns.
- `solutions.py` – reusable helpers grouped into Experimentation, Forecasting, and Machine learning
  sections for quick import into notebooks or dashboards.

## How to use

1. Run `python -m Day_78_BI_Experimentation_and_Predictive_Insights.lesson` to print reference
   outputs for experimentation, forecasting, and learning workflows.
1. Import functions from `solutions.py` in your own notebook or BI job to calculate A/B lift, cohort
   retention tables, or supervised predictions on new datasets.
1. Pair forecasting outputs with experimentation insights to prioritise roadmap decisions and align
   downstream stakeholders.

## Practitioner checklist

- Frame experiments with clear hypotheses, power targets, and retention cohorts before launch.
- Track time-series drivers separately for level, trend, and seasonality to explain BI forecasts.
- Use lightweight regression and segmentation helpers for fast predictive insights before escalating
  to heavier models.
- Document p-value interpretations and error trade-offs so cross-functional partners understand the
  decision logic.

## Additional Topic: Analytics Toolchain

> This lesson is part of the Phase 5 Business Intelligence specialization. Use the
> [Phase 5 overview](https://github.com/saint2706/Coding-For-MBA/blob/main/docs/bi-curriculum.md) to see how the developer-roadmap topics align across
> Days 68–84.

## Why it matters

Map the technical stack that underpins BI delivery.

## Developer-roadmap alignment

- BI Platforms
- Popular Databases
- SQL Fundamentals
- Programming Languages

## Next steps

- Draft case studies and notebooks that exercise these roadmap nodes.
- Update the Phase 5 cheat sheet with the insights you capture here.

<!-- LESSON_FOOTER_START -->

______________________________________________________________________

**Previous:** [Day 77 – Day 77 – BI Domain Analytics and Value Drivers](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_77_BI_Domain_Analytics_and_Value_Drivers/README.md) • **Next:** [Day 79 – Day 79 – BI Storytelling and Stakeholder Influence](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_79_BI_Storytelling_and_Stakeholder_Influence/README.md)

_You are on lesson 78 of 108._

<!-- LESSON_FOOTER_END -->

## Interactive Notebooks

Run this lesson's notebooks directly in your browser with the built-in JupyterLite runtime.

[🪐 Launch in JupyterLite](/jupyterlite/lab?path=Day_78_BI_Experimentation_and_Predictive_Insights){ .md-button .md-button--primary }

## Additional Materials

???+ example "lesson.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_78_BI_Experimentation_and_Predictive_Insights/lesson.py)

    ```python title="lesson.py"
    """Lesson scaffolding for Day 78 – BI Experimentation and Predictive Insights."""

    from __future__ import annotations

    import pandas as pd

    from . import solutions


    def run_experimentation_examples() -> None:
        control = [195, 202, 198, 205, 199]
        treatment = [210, 214, 208, 215, 211]
        summary = solutions.summarize_ab_test(control, treatment)
        p_value = solutions.welch_t_p_value(control, treatment, alternative="greater")
        hypothesis = solutions.run_hypothesis_test(
            treatment, baseline=200, alternative="greater"
        )
        error_table = solutions.type_error_table(alpha=0.05, beta=0.2)

        print("=== Experimentation ===")
        print(summary)
        print(f"p-value (Welch's t-test, greater): {p_value:.4f}")
        print("Hypothesis test:", hypothesis)
        print(error_table)
        print("p-value interpretation:", solutions.interpret_p_value(p_value))

        cohort_events = pd.DataFrame(
            {
                "cohort": [
                    "2024-01",
                    "2024-01",
                    "2024-01",
                    "2024-02",
                    "2024-02",
                    "2024-02",
                ],
                "period": [0, 1, 2, 0, 1, 2],
                "active_users": [180, 135, 90, 200, 150, 120],
            }
        )
        retention = solutions.cohort_retention(cohort_events)
        print("Cohort retention:")
        print(retention)


    def run_forecasting_examples() -> None:
        history = pd.DataFrame(
            {
                "metric": [320, 340, 360, 380, 400, 420],
            }
        )
        fitted, forecast = solutions.forecast_business_metric(
            history, value_col="metric", horizon=3, season_length=2
        )
        print("=== Forecasting ===")
        print(fitted)
        print(forecast)
        component_summary = solutions.describe_time_series_components(fitted)
        print(component_summary)


    def run_machine_learning_examples() -> None:
        training = pd.DataFrame(
            {
                "spend": [1.0, 2.0, 3.0, 4.0, 5.0],
                "touches": [3, 4, 5, 6, 7],
                "revenue": [4.0, 6.0, 8.0, 10.0, 12.0],
            }
        )
        model, predictions = solutions.supervised_predictions(
            training, target_col="revenue"
        )
        print("=== Machine Learning ===")
        print("Regression analysis:")
        print(solutions.regression_analysis_table(model))
        print("Predictions:", predictions.tolist())

        polynomial = solutions.engineer_polynomial_features(
            training, column="spend", degree=3
        )
        print("Polynomial features:")
        print(polynomial.head())

        segmentation_input = pd.DataFrame(
            {
                "spend": [60, 25, 80, 15],
                "engagement": [12, 4, 9, 2],
            }
        )
        segments = solutions.segment_customers_by_behavior(segmentation_input)
        print("Segments:")
        print(segments)
        scorecard = solutions.unsupervised_scorecard(segments)
        print("Segment scorecard:")
        print(scorecard)

        report = solutions.reinforcement_learning_report(
            [0.1, 0.3, 0.5], epsilon=0.2, draws=10, seed=42
        )
        print("Reinforcement learning report:")
        print(report)


    def main() -> None:
        run_experimentation_examples()
        run_forecasting_examples()
        run_machine_learning_examples()


    if __name__ == "__main__":
        main()
    ```

???+ example "solutions.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_78_BI_Experimentation_and_Predictive_Insights/solutions.py)

    ```python title="solutions.py"
    """Utilities for BI experimentation, forecasting, and predictive insights."""

    from __future__ import annotations

    import math
    from dataclasses import dataclass
    from statistics import NormalDist
    from typing import Dict, Iterable, List, MutableMapping, Sequence, Tuple

    import numpy as np
    import pandas as pd

    # ---------------------------------------------------------------------------
    # Experimentation
    # ---------------------------------------------------------------------------


    def summarize_ab_test(
        control: Iterable[float], treatment: Iterable[float]
    ) -> pd.DataFrame:
        """Return descriptive statistics and lift for an A/B test."""

        control_series = pd.Series(list(control), dtype="float")
        treatment_series = pd.Series(list(treatment), dtype="float")
        if control_series.empty or treatment_series.empty:
            raise ValueError("Control and treatment samples must contain data")

        summary = pd.DataFrame(
            {
                "group": ["control", "treatment"],
                "mean": [control_series.mean(), treatment_series.mean()],
                "std": [control_series.std(ddof=1), treatment_series.std(ddof=1)],
                "count": [control_series.size, treatment_series.size],
            }
        )
        summary["standard_error"] = summary["std"] / np.sqrt(summary["count"])
        control_mean = summary.loc[summary["group"] == "control", "mean"].iat[0]
        summary["lift_vs_control"] = summary["mean"].apply(
            lambda m: 0.0 if control_mean == 0 else (m - control_mean) / control_mean
        )
        return summary


    def welch_t_p_value(
        control: Iterable[float],
        treatment: Iterable[float],
        *,
        alternative: str = "two-sided",
    ) -> float:
        """Compute a Welch's t-test p-value without requiring SciPy."""

        control_series = pd.Series(list(control), dtype="float")
        treatment_series = pd.Series(list(treatment), dtype="float")
        if control_series.empty or treatment_series.empty:
            raise ValueError("Control and treatment samples must contain data")

        mean_diff = treatment_series.mean() - control_series.mean()
        var_control = control_series.var(ddof=1)
        var_treatment = treatment_series.var(ddof=1)
        n_control = control_series.size
        n_treatment = treatment_series.size
        se = math.sqrt(var_control / n_control + var_treatment / n_treatment)
        if se == 0:
            return 0.0
        t_stat = mean_diff / se
        dist = NormalDist()
        if alternative == "greater":
            return 1 - dist.cdf(t_stat)
        if alternative == "less":
            return dist.cdf(t_stat)
        return 2 * (1 - dist.cdf(abs(t_stat)))


    def run_hypothesis_test(
        sample: Iterable[float],
        *,
        baseline: float,
        alternative: str = "two-sided",
        alpha: float = 0.05,
    ) -> Dict[str, float | bool]:
        """Perform a one-sample z-test and return decision metadata."""

        series = pd.Series(list(sample), dtype="float")
        if series.empty:
            raise ValueError("Sample must contain observations")
        sample_mean = series.mean()
        sample_std = series.std(ddof=1)
        if sample_std == 0:
            z_score = 0.0
        else:
            z_score = (sample_mean - baseline) / (sample_std / math.sqrt(series.size))
        dist = NormalDist()
        if alternative == "greater":
            p_value = 1 - dist.cdf(z_score)
        elif alternative == "less":
            p_value = dist.cdf(z_score)
        else:
            p_value = 2 * (1 - dist.cdf(abs(z_score)))
        return {
            "mean": float(sample_mean),
            "z_score": float(z_score),
            "p_value": float(p_value),
            "reject_null": bool(p_value < alpha),
        }


    def type_error_table(alpha: float, beta: float) -> pd.DataFrame:
        """Summarise Type I/II error trade-offs for experimentation design."""

        if not 0 <= alpha <= 1 or not 0 <= beta <= 1:
            raise ValueError("Alpha and beta must be probabilities between 0 and 1")
        data = [
            {
                "error": "Type I",
                "probability": float(alpha),
                "description": "False positive",
            },
            {
                "error": "Type II",
                "probability": float(beta),
                "description": "False negative",
            },
            {
                "error": "Power",
                "probability": float(1 - beta),
                "description": "Probability of detecting a true effect",
            },
        ]
        return pd.DataFrame(data)


    def interpret_p_value(p_value: float) -> str:
        """Return a guideline-friendly interpretation for a p-value."""

        if p_value < 0 or p_value > 1:
            raise ValueError("p-value must be between 0 and 1")
        if p_value < 0.01:
            return "Very strong evidence against the null"
        if p_value < 0.05:
            return "Strong evidence against the null"
        if p_value < 0.1:
            return "Suggestive evidence; consider more data"
        return "Little evidence against the null"


    def cohort_retention(
        events: pd.DataFrame,
        *,
        cohort_col: str = "cohort",
        period_col: str = "period",
        value_col: str = "active_users",
    ) -> pd.DataFrame:
        """Compute cohort retention by normalising activity within each cohort."""

        required_cols = {cohort_col, period_col, value_col}
        missing = required_cols - set(events.columns)
        if missing:
            raise KeyError(f"events missing required columns: {sorted(missing)}")
        cohort_totals = (
            events.loc[events[period_col] == 0, [cohort_col, value_col]]
            .groupby(cohort_col)[value_col]
            .sum()
        )
        pivot = (
            events.groupby([cohort_col, period_col])[value_col]
            .sum()
            .unstack(fill_value=0)
            .sort_index()
        )
        pivot = pivot.astype(float)
        for cohort in pivot.index:
            base = cohort_totals.get(cohort, 0)
            if base == 0:
                pivot.loc[cohort] = 0.0
            else:
                pivot.loc[cohort] = (pivot.loc[cohort] / base).round(4)
        pivot.index.name = cohort_col
        pivot.columns = [f"period_{int(col)}" for col in pivot.columns]
        return pivot.reset_index()


    # ---------------------------------------------------------------------------
    # Forecasting
    # ---------------------------------------------------------------------------


    def estimate_trend_coefficients(values: Sequence[float]) -> Tuple[float, float]:
        """Estimate intercept and slope for a linear trend using least squares."""

        y = np.asarray(values, dtype="float")
        if y.size == 0:
            raise ValueError("values must contain at least one element")
        x = np.arange(y.size, dtype="float")
        X = np.column_stack([np.ones_like(x), x])
        beta, *_ = np.linalg.lstsq(X, y, rcond=None)
        intercept, slope = beta
        return float(intercept), float(slope)


    def seasonal_pattern(values: Sequence[float], season_length: int) -> np.ndarray:
        """Return the average seasonal offsets for a given periodicity."""

        data = np.asarray(values, dtype="float")
        if season_length <= 0:
            raise ValueError("season_length must be positive")
        if data.size < season_length:
            return np.zeros(season_length, dtype="float")
        pattern = np.zeros(season_length, dtype="float")
        counts = np.zeros(season_length, dtype=int)
        intercept, slope = estimate_trend_coefficients(data)
        trend = intercept + slope * np.arange(data.size)
        residuals = data - trend
        for idx, value in enumerate(residuals):
            slot = idx % season_length
            pattern[slot] += value
            counts[slot] += 1
        counts[counts == 0] = 1
        return pattern / counts


    def forecast_business_metric(
        history: pd.DataFrame,
        *,
        value_col: str = "metric",
        horizon: int = 3,
        season_length: int = 1,
    ) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """Forecast future periods using a linear trend plus seasonal pattern."""

        if value_col not in history.columns:
            raise KeyError(f"history missing required column '{value_col}'")
        ordered = history.reset_index(drop=True).copy()
        values = ordered[value_col].astype(float).to_numpy()
        intercept, slope = estimate_trend_coefficients(values)
        trend = intercept + slope * np.arange(values.size)
        pattern = seasonal_pattern(values, max(1, season_length))
        season_length = max(1, season_length)
        seasonal_component = np.array(
            [pattern[i % season_length] for i in range(values.size)]
        )
        ordered["trend"] = trend
        ordered["seasonality"] = seasonal_component
        ordered["fitted"] = ordered["trend"] + ordered["seasonality"]

        future_index = np.arange(values.size, values.size + horizon)
        forecast_trend = intercept + slope * future_index
        future_seasonal = np.array(
            [pattern[i % season_length] for i in range(values.size, values.size + horizon)]
        )
        forecast_values = forecast_trend + future_seasonal
        forecast_df = pd.DataFrame(
            {
                "period": future_index,
                "forecast": forecast_values,
                "trend": forecast_trend,
                "seasonality": future_seasonal,
            }
        )
        return ordered, forecast_df


    def describe_time_series_components(df: pd.DataFrame) -> pd.DataFrame:
        """Provide summary statistics for level, trend, and seasonality components."""

        required = {"metric", "trend", "seasonality", "fitted"} - set(df.columns)
        if required:
            raise KeyError(f"DataFrame missing required columns: {sorted(required)}")
        summary = {
            "component": ["metric", "trend", "seasonality", "fitted"],
            "mean": [
                df[col].mean() for col in ["metric", "trend", "seasonality", "fitted"]
            ],
            "std": [
                df[col].std(ddof=1) for col in ["metric", "trend", "seasonality", "fitted"]
            ],
        }
        return pd.DataFrame(summary)


    # ---------------------------------------------------------------------------
    # Machine learning
    # ---------------------------------------------------------------------------


    @dataclass
    class LinearRegressionModel:
        """Lightweight linear regression fitted via the normal equation."""

        intercept: float
        coefficients: Dict[str, float]

        def predict(self, frame: pd.DataFrame) -> pd.Series:
            """Generate predictions for the provided feature frame."""

            if not self.coefficients:
                return pd.Series(self.intercept, index=frame.index, dtype="float")
            coeffs = pd.Series(self.coefficients)
            missing = set(coeffs.index) - set(frame.columns)
            if missing:
                raise KeyError(f"Missing features for prediction: {sorted(missing)}")
            return self.intercept + frame[coeffs.index].astype(float).dot(coeffs)


    def fit_linear_regression(
        frame: pd.DataFrame, *, target_col: str, feature_cols: Sequence[str] | None = None
    ) -> LinearRegressionModel:
        """Fit a linear regression using an analytic closed form solution."""

        if target_col not in frame.columns:
            raise KeyError(f"Frame missing target column '{target_col}'")
        if feature_cols is None:
            feature_cols = [col for col in frame.columns if col != target_col]
        if not feature_cols:
            raise ValueError("At least one feature column is required")
        X = frame[feature_cols].astype(float).to_numpy()
        y = frame[target_col].astype(float).to_numpy()
        ones = np.ones((X.shape[0], 1))
        design = np.hstack([ones, X])
        beta, *_ = np.linalg.lstsq(design, y, rcond=None)
        intercept = float(beta[0])
        coef = {feature: float(value) for feature, value in zip(feature_cols, beta[1:])}
        return LinearRegressionModel(intercept=intercept, coefficients=coef)


    def regression_analysis_table(model: LinearRegressionModel) -> pd.DataFrame:
        """Return a tidy view of regression coefficients for reporting."""

        rows = [{"term": "intercept", "coefficient": model.intercept, "impact": "baseline"}]
        for feature, value in model.coefficients.items():
            rows.append({"term": feature, "coefficient": value, "impact": "marginal"})
        return pd.DataFrame(rows)


    def engineer_polynomial_features(
        frame: pd.DataFrame, *, column: str, degree: int = 2
    ) -> pd.DataFrame:
        """Expand a single feature into polynomial terms for non-linear modelling."""

        if column not in frame.columns:
            raise KeyError(f"Frame missing feature column '{column}'")
        if degree < 2:
            raise ValueError("degree must be at least 2 for non-linear features")
        base = frame[[column]].astype(float).copy()
        for power in range(2, degree + 1):
            base[f"{column}^{power}"] = base[column] ** power
        return base


    def segment_customers_by_behavior(
        frame: pd.DataFrame,
        *,
        spend_col: str = "spend",
        engagement_col: str = "engagement",
    ) -> pd.DataFrame:
        """Create behaviour-based customer segments without fitting heavy models."""

        required = {spend_col, engagement_col}
        missing = required - set(frame.columns)
        if missing:
            raise KeyError(f"Frame missing required columns: {sorted(missing)}")
        output = frame.copy()
        spend_threshold = output[spend_col].median()
        engagement_threshold = output[engagement_col].median()

        def classify(row: MutableMapping[str, float]) -> str:
            high_spend = row[spend_col] >= spend_threshold
            high_engagement = row[engagement_col] >= engagement_threshold
            if high_spend and high_engagement:
                return "high_value"
            if high_spend:
                return "growing"
            if high_engagement:
                return "promising"
            return "at_risk"

        output["segment"] = output.apply(classify, axis=1)
        return output


    def epsilon_greedy_action(
        values: Sequence[float],
        *,
        epsilon: float = 0.1,
        random_state: np.random.Generator | None = None,
    ) -> Tuple[int, bool]:
        """Choose an action using an epsilon-greedy policy for reinforcement learning."""

        if len(values) == 0:
            raise ValueError("values must contain at least one estimate")
        if not 0 <= epsilon <= 1:
            raise ValueError("epsilon must be between 0 and 1")
        rng = random_state or np.random.default_rng()
        explore = bool(rng.random() < epsilon)
        if explore:
            return int(rng.integers(0, len(values))), True
        best_index = int(np.argmax(values))
        return best_index, False


    def supervised_predictions(
        frame: pd.DataFrame,
        *,
        target_col: str,
        feature_cols: Sequence[str] | None = None,
    ) -> Tuple[LinearRegressionModel, pd.Series]:
        """Train a regression model and return in-sample predictions."""

        model = fit_linear_regression(
            frame, target_col=target_col, feature_cols=feature_cols
        )
        features = frame[[col for col in frame.columns if col != target_col]]
        predictions = model.predict(features)
        return model, predictions


    def unsupervised_scorecard(frame: pd.DataFrame) -> pd.DataFrame:
        """Summarise customer segments for dashboarding."""

        if "segment" not in frame.columns:
            raise KeyError("Frame must include a 'segment' column")
        counts = frame.groupby("segment").size().rename("customers")
        metric_col = frame.columns[0]
        spend = frame.groupby("segment")[metric_col].mean().rename("avg_value")
        return pd.concat([counts, spend], axis=1).reset_index()


    def reinforcement_learning_report(
        estimates: Sequence[float],
        *,
        epsilon: float = 0.1,
        draws: int = 100,
        seed: int | None = None,
    ) -> pd.DataFrame:
        """Simulate epsilon-greedy choices to illustrate exploration vs exploitation."""

        rng = np.random.default_rng(seed)
        choices: List[int] = []
        explore_flags: List[bool] = []
        for _ in range(draws):
            action, explore = epsilon_greedy_action(
                estimates, epsilon=epsilon, random_state=rng
            )
            choices.append(action)
            explore_flags.append(explore)
        return pd.DataFrame({"action": choices, "explore": explore_flags})


    if __name__ == "__main__":
        control = [100, 104, 99, 101]
        treatment = [110, 112, 109, 115]
        print("A/B test summary:\n", summarize_ab_test(control, treatment))
        print("Welch's t-test p-value:", welch_t_p_value(control, treatment))

        events = pd.DataFrame(
            {
                "cohort": ["2024-01", "2024-01", "2024-02", "2024-02", "2024-02"],
                "period": [0, 1, 0, 1, 2],
                "active_users": [100, 68, 90, 60, 45],
            }
        )
        print("Cohort retention:\n", cohort_retention(events))

        history = pd.DataFrame({"metric": [100, 110, 120, 130, 140]})
        fitted, forecast = forecast_business_metric(history, value_col="metric", horizon=2)
        print("Time series with components:\n", fitted)
        print("Forecast horizon:\n", forecast)

        dataset = pd.DataFrame(
            {
                "spend": [1, 2, 3, 4],
                "touches": [3, 4, 5, 6],
                "revenue": [3, 5, 7, 9],
            }
        )
        model, preds = supervised_predictions(dataset, target_col="revenue")
        print("Linear regression coefficients:\n", regression_analysis_table(model))
        print("In-sample predictions:", preds.tolist())

        segments = segment_customers_by_behavior(
            pd.DataFrame({"spend": [50, 20, 70, 10], "engagement": [10, 3, 7, 1]})
        )
        print("Segments:\n", segments)
    ```
