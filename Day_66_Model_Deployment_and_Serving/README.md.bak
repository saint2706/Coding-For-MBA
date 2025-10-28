# Day 66 – Model Deployment and Serving Patterns

Production machine learning systems expose predictions through a variety of runtime patterns.
Building on the MLOps pipeline from Day 65, this lesson compares the trade-offs between synchronous
APIs, high-throughput RPC services, scheduled batch scoring, streaming inference, and
resource-constrained edge deployments.

## Learning goals

- **REST serving with FastAPI** – Design JSON contracts, response schemas, and dependency-injected
  models that work with serverless platforms, container orchestrators, or BentoML services.
- **gRPC microservices** – Use protobuf schemas and streaming RPCs for low-latency online inference
  with strong typing and bi-directional streaming.
- **Batch and streaming predictions** – Trigger nightly or hourly backfills alongside event-driven
  inference to balance cost and freshness requirements.
- **Edge deployment** – Package lightweight runtimes that run inside mobile apps, browsers
  (WebAssembly), or IoT gateways with offline caching and resilience to intermittent connectivity.
- **Operational readiness** – Instrument health endpoints, log structured telemetry, and integrate
  load testing into CI to prevent regressions.

## Hands-on practice

`solutions.py` provides protocol-specific adapters for a mock model and a synthetic load-testing
harness. The helpers lean on FastAPI-style input validation semantics and BentoML-inspired service
bundling while keeping runtime dependencies lightweight for local experimentation.

Run the example service locally:

```bash
python Day_66_Model_Deployment_and_Serving/solutions.py
```

Then execute the tests (`tests/test_day_66.py`) to verify that the REST, gRPC, and batch adapters
share a consistent response schema and survive a stress scenario with concurrent workers.

## Extend the exercise

- Swap the stubbed adapters with real FastAPI routers and BentoML services to deploy a containerised
  API.
- Generate protobuf definitions for the gRPC helper and implement a client using `grpcio` or
  `grpclib`.
- Port the load test harness to `locust`, `k6`, or `vegeta` and capture latency percentiles across
  different hardware profiles.
- Add schema evolution examples demonstrating backwards-compatible API rollouts.

<!-- LESSON_FOOTER_START -->

---

**Previous:** [Day 65 – Day 65 – MLOps Pipelines and CI/CD Automation](../Day_65_MLOps_Pipelines_and_CI/README.md) • **Next:** [Day 67 – Day 67 – Model Monitoring and Reliability Engineering](../Day_67_Model_Monitoring_and_Reliability/README.md)

_You are on lesson 66 of 108._

<!-- LESSON_FOOTER_END -->