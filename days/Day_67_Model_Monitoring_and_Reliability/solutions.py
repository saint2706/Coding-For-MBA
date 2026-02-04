"""Monitoring utilities for production ML systems."""

from __future__ import annotations

from dataclasses import dataclass, field
from statistics import mean, pstdev
from typing import Any, Dict, Iterable, List, Mapping


@dataclass
class DriftReport:
    feature: str
    baseline_mean: float
    current_mean: float
    drift_score: float
    triggered: bool


def compute_mean_drift(
    baseline: Iterable[float],
    current: Iterable[float],
    *,
    threshold: float = 0.2,
) -> DriftReport:
    """Compare distributions using a simple relative mean difference."""

    baseline_list = list(baseline)
    current_list = list(current)
    if not baseline_list or not current_list:
        raise ValueError("Both baseline and current samples must be provided")
    baseline_mean = mean(baseline_list)
    current_mean = mean(current_list)
    baseline_std = pstdev(baseline_list) or 1e-6
    drift_score = abs(current_mean - baseline_mean) / baseline_std
    triggered = drift_score >= threshold
    return DriftReport(
        feature="feature_value",
        baseline_mean=round(baseline_mean, 4),
        current_mean=round(current_mean, 4),
        drift_score=round(drift_score, 4),
        triggered=triggered,
    )


def should_trigger_retraining(
    report: DriftReport, *, accuracy: float, latency: float
) -> bool:
    """Decide whether to retrain given drift and live metrics."""

    if report.triggered:
        return True
    if accuracy < 0.78:
        return True
    if latency > 0.5:
        return True
    return False


@dataclass
class CanaryVerdict:
    promote: bool
    reason: str
    metrics: Dict[str, float] = field(default_factory=dict)


def evaluate_canary(
    baseline_metrics: Mapping[str, float],
    candidate_metrics: Mapping[str, float],
    *,
    allowed_latency_delta: float = 0.05,
    min_accuracy: float = 0.8,
) -> CanaryVerdict:
    """Compare baseline vs candidate metrics and decide promotion."""

    latency_delta = candidate_metrics.get("latency", 0.0) - baseline_metrics.get(
        "latency", 0.0
    )
    accuracy = candidate_metrics.get("accuracy", 0.0)
    error_rate = candidate_metrics.get("error_rate", 0.0)
    if accuracy < min_accuracy:
        return CanaryVerdict(False, "Accuracy below threshold", {"accuracy": accuracy})
    if latency_delta > allowed_latency_delta:
        return CanaryVerdict(
            False, "Latency regression", {"latency_delta": round(latency_delta, 4)}
        )
    if error_rate > baseline_metrics.get("error_rate", 0.0) * 1.2:
        return CanaryVerdict(False, "Error rate increase", {"error_rate": error_rate})
    return CanaryVerdict(
        True,
        "Canary healthy",
        {"accuracy": accuracy, "latency_delta": round(latency_delta, 4)},
    )


def build_observability_snapshot(
    report: DriftReport,
    verdict: CanaryVerdict,
    *,
    predictions_served: int,
) -> Dict[str, Any]:
    """Aggregate metrics for Prometheus/OpenTelemetry exporters."""

    return {
        "drift": {
            "feature": report.feature,
            "score": report.drift_score,
            "triggered": report.triggered,
        },
        "canary": {
            "promote": verdict.promote,
            "reason": verdict.reason,
            "metrics": verdict.metrics,
        },
        "counters": {
            "predictions_served_total": predictions_served,
        },
    }


def detect_drift_across_features(
    baseline_frame: Mapping[str, Iterable[float]],
    current_frame: Mapping[str, Iterable[float]],
    *,
    threshold: float = 0.2,
) -> Dict[str, DriftReport]:
    """Apply mean drift detection across multiple features."""

    reports: Dict[str, DriftReport] = {}
    for feature, baseline_values in baseline_frame.items():
        current_values = current_frame.get(feature)
        if current_values is None:
            continue
        reports[feature] = compute_mean_drift(
            baseline_values, current_values, threshold=threshold
        )
    return reports


def enqueue_retraining_tasks(
    reports: Mapping[str, DriftReport],
    *,
    accuracy: float,
    latency: float,
) -> List[str]:
    """Return a queue of features that should trigger retraining."""

    queue: List[str] = []
    for feature, report in reports.items():
        if should_trigger_retraining(report, accuracy=accuracy, latency=latency):
            queue.append(feature)
    return queue


if __name__ == "__main__":
    baseline = [0.1, 0.2, 0.15, 0.18]
    current = [0.35, 0.4, 0.45, 0.38]
    report = compute_mean_drift(baseline, current)
    verdict = evaluate_canary(
        {"latency": 0.2, "accuracy": 0.83, "error_rate": 0.05},
        {"latency": 0.22, "accuracy": 0.85, "error_rate": 0.04},
    )
    snapshot = build_observability_snapshot(report, verdict, predictions_served=1200)
    print("Drift report", report)  # noqa: T201
    print("Canary verdict", verdict)  # noqa: T201
    print("Observability snapshot", snapshot)  # noqa: T201
