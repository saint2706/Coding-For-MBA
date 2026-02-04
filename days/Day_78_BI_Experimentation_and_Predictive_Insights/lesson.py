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
