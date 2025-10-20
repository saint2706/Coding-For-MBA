"""Tests for Day 78 – BI Experimentation and Predictive Insights."""

from __future__ import annotations

import importlib.util
import sys
from pathlib import Path

import numpy as np
import pandas as pd
import pytest

MODULE_PATH = (
    Path(__file__).resolve().parents[1]
    / "Day_78_BI_Experimentation_and_Predictive_Insights"
    / "solutions.py"
)


def _load_module():
    spec = importlib.util.spec_from_file_location("day_78_solutions", MODULE_PATH)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


solutions = _load_module()


def test_ab_testing_summary_and_p_value() -> None:
    control = [100, 102, 98, 101]
    treatment = [110, 111, 109, 112]
    summary = solutions.summarize_ab_test(control, treatment)

    assert list(summary["group"]) == ["control", "treatment"]
    assert set(summary.columns) == {
        "group",
        "mean",
        "std",
        "count",
        "standard_error",
        "lift_vs_control",
    }
    expected_lift = (np.mean(treatment) - np.mean(control)) / np.mean(control)
    treatment_row = summary.loc[summary["group"] == "treatment", "lift_vs_control"].iat[
        0
    ]
    assert treatment_row == pytest.approx(expected_lift, rel=1e-6)

    p_value = solutions.welch_t_p_value(control, treatment, alternative="greater")
    assert p_value < 0.05


def test_cohort_retention_segments() -> None:
    events = pd.DataFrame(
        {
            "cohort": ["2024-01", "2024-01", "2024-02", "2024-02"],
            "period": [0, 1, 0, 1],
            "active_users": [200, 150, 180, 90],
        }
    )
    retention = solutions.cohort_retention(events)
    assert list(retention.columns) == ["cohort", "period_0", "period_1"]
    jan_row = retention.loc[retention["cohort"] == "2024-01", "period_1"].iat[0]
    feb_row = retention.loc[retention["cohort"] == "2024-02", "period_1"].iat[0]
    assert jan_row == pytest.approx(0.75, rel=1e-6)
    assert feb_row == pytest.approx(0.5, rel=1e-6)


def test_forecast_produces_expected_trend() -> None:
    history = pd.DataFrame({"metric": [100, 110, 120, 130]})
    fitted, forecast = solutions.forecast_business_metric(
        history, value_col="metric", horizon=2
    )

    assert {"metric", "trend", "seasonality", "fitted"}.issubset(fitted.columns)
    assert list(forecast.columns) == ["period", "forecast", "trend", "seasonality"]
    assert forecast["forecast"].tolist() == pytest.approx([140.0, 150.0], rel=1e-6)


def test_supervised_and_unsupervised_helpers() -> None:
    frame = pd.DataFrame(
        {
            "spend": [1.0, 2.0, 3.0, 4.0],
            "touches": [2.0, 3.0, 4.0, 5.0],
            "revenue": [3.0, 5.0, 7.0, 9.0],
        }
    )
    model, predictions = solutions.supervised_predictions(frame, target_col="revenue")
    assert predictions.tolist() == pytest.approx([3.0, 5.0, 7.0, 9.0], rel=1e-6)

    segments = solutions.segment_customers_by_behavior(
        pd.DataFrame({"spend": [60, 10, 30, 80], "engagement": [12, 2, 7, 5]})
    )
    assert "segment" in segments.columns
    scorecard = solutions.unsupervised_scorecard(segments)
    assert set(scorecard.columns) == {"segment", "customers", "avg_value"}
    assert scorecard["customers"].sum() == len(segments)


def test_reinforcement_learning_report_consistency() -> None:
    report = solutions.reinforcement_learning_report(
        [0.1, 0.3, 0.5], epsilon=0.0, draws=5, seed=1
    )
    assert set(report.columns) == {"action", "explore"}
    assert report["explore"].sum() == 0
    assert report["action"].nunique() == 1
