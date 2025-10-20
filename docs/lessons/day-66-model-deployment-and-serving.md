Production machine learning systems expose predictions through a variety
of runtime patterns. Building on the MLOps pipeline from Day 65, this
lesson compares the trade-offs between synchronous APIs, high-throughput
RPC services, scheduled batch scoring, streaming inference, and
resource-constrained edge deployments.

## Learning goals

- **REST serving with FastAPI** – Design JSON contracts, response
  schemas, and dependency-injected models that work with serverless
  platforms, container orchestrators, or BentoML services.
- **gRPC microservices** – Use protobuf schemas and streaming RPCs for
  low-latency online inference with strong typing and bi-directional
  streaming.
- **Batch and streaming predictions** – Trigger nightly or hourly
  backfills alongside event-driven inference to balance cost and
  freshness requirements.
- **Edge deployment** – Package lightweight runtimes that run inside
  mobile apps, browsers (WebAssembly), or IoT gateways with offline
  caching and resilience to intermittent connectivity.
- **Operational readiness** – Instrument health endpoints, log
  structured telemetry, and integrate load testing into CI to prevent
  regressions.

## Hands-on practice

`solutions.py` provides protocol-specific adapters for a mock model and a
synthetic load-testing harness. The helpers lean on FastAPI-style input
validation semantics and BentoML-inspired service bundling while keeping
runtime dependencies lightweight for local experimentation.

Run the example service locally:

```bash
python Day_66_Model_Deployment_and_Serving/solutions.py
```

Then execute the tests (`tests/test_day_66.py`) to verify that the REST,
gRPC, and batch adapters share a consistent response schema and survive a
stress scenario with concurrent workers.

## Extend the exercise

- Swap the stubbed adapters with real FastAPI routers and BentoML
  services to deploy a containerised API.
- Generate protobuf definitions for the gRPC helper and implement a
  client using `grpcio` or `grpclib`.
- Port the load test harness to `locust`, `k6`, or `vegeta` and capture
  latency percentiles across different hardware profiles.
- Add schema evolution examples demonstrating backwards-compatible API
  rollouts.

## Additional Materials

- **solutions.ipynb**  
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_66_Model_Deployment_and_Serving/solutions.ipynb){ .md-button } 
  [📓 Open in NBViewer](https://nbviewer.org/github/saint2706/Coding-For-MBA/blob/main/Day_66_Model_Deployment_and_Serving/solutions.ipynb){ .md-button } 
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_66_Model_Deployment_and_Serving/solutions.ipynb){ .md-button .md-button--primary } 
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_66_Model_Deployment_and_Serving/solutions.ipynb){ .md-button }

???+ example "solutions.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_66_Model_Deployment_and_Serving/solutions.py)

    ```python title="solutions.py"
    """Adapters that demonstrate multiple model serving patterns.

    The code intentionally avoids heavyweight dependencies so it can run
    inside unit tests, yet the abstractions mirror FastAPI/BentoML service
    interfaces, gRPC handlers, and streaming/batch processors.
    """

    from __future__ import annotations

    from dataclasses import dataclass, field
    from statistics import mean
    from time import perf_counter
    from typing import Any, Callable, Dict, Iterable, List, Mapping, Sequence


    @dataclass
    class PredictionResponse:
        """Normalised response payload shared across transports."""

        predictions: List[float]
        metadata: Dict[str, Any] = field(default_factory=dict)

        def to_dict(self) -> Dict[str, Any]:
            return {"predictions": self.predictions, "metadata": self.metadata}


    def _coerce_predictions(raw: Iterable[Any]) -> List[float]:
        values: List[float] = []
        for item in raw:
            try:
                values.append(float(item))
            except (TypeError, ValueError) as exc:  # pragma: no cover - defensive
                raise ValueError(f"Prediction values must be numeric: {item!r}") from exc
        return values


    def fastapi_rest_adapter(
        model: Callable[[Sequence[float]], Sequence[float]],
    ) -> Callable[[Mapping[str, Any]], Dict[str, Any]]:
        """Create a FastAPI-style callable that accepts JSON payloads."""

        def predict(payload: Mapping[str, Any]) -> Dict[str, Any]:
            instances = payload.get("instances")
            if instances is None:
                raise KeyError("Payload missing 'instances'")
            predictions = model(instances)
            response = PredictionResponse(
                predictions=_coerce_predictions(predictions),
                metadata={"transport": "REST", "framework": "FastAPI"},
            )
            return response.to_dict()

        return predict


    def grpc_streaming_adapter(
        model: Callable[[Sequence[float]], Sequence[float]],
    ) -> Callable[[Iterable[Mapping[str, Any]]], Iterable[Dict[str, Any]]]:
        """Return a generator-like gRPC handler that yields streaming responses."""

        def handler(
            request_iterator: Iterable[Mapping[str, Any]],
        ) -> Iterable[Dict[str, Any]]:
            for payload in request_iterator:
                instances = payload.get("instances", [])
                predictions = model(instances)
                response = PredictionResponse(
                    predictions=_coerce_predictions(predictions),
                    metadata={"transport": "gRPC", "streaming": True},
                )
                yield response.to_dict()

        return handler


    def batch_scoring_runner(
        model: Callable[[Sequence[float]], Sequence[float]],
        batches: Iterable[Sequence[float]],
    ) -> List[Dict[str, Any]]:
        """Process offline batches while preserving response structure."""

        outputs: List[Dict[str, Any]] = []
        for batch in batches:
            predictions = model(batch)
            response = PredictionResponse(
                predictions=_coerce_predictions(predictions),
                metadata={"transport": "batch", "batch_size": len(list(batch))},
            )
            outputs.append(response.to_dict())
        return outputs


    def edge_inference_adapter(
        model: Callable[[Sequence[float]], Sequence[float]], *, quantise: bool = True
    ) -> Callable[[Sequence[float]], Dict[str, Any]]:
        """Wrap a model for offline/edge execution with optional quantisation."""

        def run(features: Sequence[float]) -> Dict[str, Any]:
            scaled = [round(float(x), 3) for x in features]
            predictions = model(scaled)
            response = PredictionResponse(
                predictions=_coerce_predictions(predictions),
                metadata={"transport": "edge", "quantised": quantise},
            )
            return response.to_dict()

        return run


    def ensure_response_schema(payload: Mapping[str, Any]) -> None:
        """Validate that a payload follows the canonical schema."""

        if "predictions" not in payload:
            raise AssertionError("Missing predictions field")
        if not isinstance(payload["predictions"], list):
            raise AssertionError("Predictions must be a list")
        for value in payload["predictions"]:
            if not isinstance(value, (int, float)):
                raise AssertionError("Predictions must be numeric")
        metadata = payload.get("metadata", {})
        if not isinstance(metadata, dict):
            raise AssertionError("Metadata must be a mapping")


    @dataclass
    class LoadTestResult:
        avg_latency: float
        throughput: float
        success_rate: float


    def run_synthetic_load_test(
        endpoint: Callable[[Mapping[str, Any]], Mapping[str, Any]],
        payloads: Sequence[Mapping[str, Any]],
        *,
        warmups: int = 1,
    ) -> LoadTestResult:
        """Execute a deterministic load-test loop against an endpoint."""

        total_latency = 0.0
        successes = 0
        # Warmup calls (not included in metrics but ensure caches are primed)
        for i in range(warmups):
            endpoint(payloads[i % len(payloads)])
        for payload in payloads:
            start = perf_counter()
            response = endpoint(payload)
            latency = perf_counter() - start
            total_latency += latency
            try:
                ensure_response_schema(response)
                successes += 1
            except AssertionError:
                pass
        avg_latency = total_latency / len(payloads)
        throughput = len(payloads) / max(total_latency, 1e-6)
        success_rate = successes / len(payloads)
        return LoadTestResult(
            avg_latency=avg_latency, throughput=throughput, success_rate=success_rate
        )


    def averaged_ensembled_model(instances: Sequence[float]) -> List[float]:
        """Reference model that mimics an ensemble averaged prediction."""

        if not instances:
            return [0.0]
        centre = mean(float(x) for x in instances)
        return [round(centre * 0.8 + 0.1, 4)]


    def describe_serving_landscape() -> Dict[str, Any]:
        """Summarise the pros/cons of deployment patterns for quick reference."""

        return {
            "REST": {"latency": "medium", "strength": "ubiquitous clients"},
            "gRPC": {"latency": "low", "strength": "typed contracts"},
            "batch": {"latency": "high", "strength": "cost efficiency"},
            "streaming": {"latency": "low", "strength": "event-driven"},
            "edge": {"latency": "ultra-low", "strength": "offline ready"},
        }


    if __name__ == "__main__":
        model = averaged_ensembled_model
        endpoint = fastapi_rest_adapter(model)
        sample_payloads = [{"instances": [0.1, 0.2, 0.4]} for _ in range(10)]
        result = run_synthetic_load_test(endpoint, sample_payloads)
        print("Synthetic load test", result)  # noqa: T201
    ```
