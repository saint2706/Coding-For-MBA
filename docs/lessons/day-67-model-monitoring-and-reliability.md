The final instalment of the MLOps arc closes the loop from deployment to
operations. After mastering persistence (Day 50), automation (Day 65),
and serving (Day 66), this lesson introduces the observability patterns
that keep models trustworthy in production.

## Learning goals

- **Data and concept drift detection** – Track feature distributions with
  population stability index (PSI), Kullback–Leibler divergence, or
  threshold-based heuristics that trigger alerts when inputs shift.
- **Automated retraining triggers** – Combine drift signals, performance
  metrics, and business guardrails to decide when to schedule a new
  training job.
- **Progressive delivery** – Roll out models with canary or shadow
  deployments, automatically rolling back if latency or accuracy
  regressions appear.
- **Observability tooling** – Instrument models with Prometheus metrics
  exporters, OpenTelemetry traces, and structured logging for rapid
  incident response.

## Hands-on practice

`solutions.py` provides synthetic drift generators, simple detection
algorithms, and a canary analysis helper. These components emit metrics
that could be scraped by Prometheus or pushed to OpenTelemetry
collectors, illustrating how to connect monitoring to automated decision
systems.

Run the script to see drift alerts bubble up:

```bash
python Day_67_Model_Monitoring_and_Reliability/solutions.py
```

`tests/test_day_67.py` feeds controlled distribution shifts through the
helpers and confirms that alerts fire, retraining queues populate, and
canary verdicts respect latency/accuracy thresholds.

## Extend the exercise

- Replace the heuristic drift detector with `alibi-detect`, `evidently`,
  or scikit-multiflow to monitor complex multivariate shifts.
- Export the observability payloads to Prometheus using `prometheus- client` counters, gauges, and histograms.
- Emit OpenTelemetry traces that attach prediction metadata and user
  identifiers for distributed tracing across microservices.
- Integrate human-in-the-loop acknowledgement by forwarding alerts to an
  incident management platform.

## Additional Materials

- **solutions.ipynb**  
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_67_Model_Monitoring_and_Reliability/solutions.ipynb){ .md-button } 
  [📓 Open in NBViewer](https://nbviewer.org/github/saint2706/Coding-For-MBA/blob/main/Day_67_Model_Monitoring_and_Reliability/solutions.ipynb){ .md-button } 
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_67_Model_Monitoring_and_Reliability/solutions.ipynb){ .md-button .md-button--primary } 
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_67_Model_Monitoring_and_Reliability/solutions.ipynb){ .md-button }

???+ example "solutions.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_67_Model_Monitoring_and_Reliability/solutions.py)

    ```python title="solutions.py"
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
    ```
