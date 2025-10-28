# Performance Benchmarking

To make sure the most data-intensive lessons stay responsive, automated benchmarks run the
representative workloads from `tools/benchmark_lessons.py`.

## How it works

1. **Scenarios**: Each scenario loads a public dataset from the `data/` directory and performs the
   same aggregations learners execute in the notebook. The initial suite covers:
   - `fortune1000_sector_rollup`: profit aggregation by sector from `fortune1000_final.csv`.
   - `hn_keyword_engagement`: Hacker News engagement trends for business, data, and Python keywords.
1. **Metrics**: For every scenario the runner captures mean, max, and standard deviation for
   execution time as well as an approximate peak memory footprint.
1. **Reporting**: Results are emitted as JSON (`benchmark-results.json`) and uploaded as a GitHub
   Actions artifact for historical comparison.

## Local execution

```bash
python tools/benchmark_lessons.py --repeats 5 --output benchmark-results.json
```

The script prints a human-readable summary and writes the JSON file that mirrors what CI produces.

## Continuous benchmarking workflow

The workflow `.github/workflows/performance-benchmark.yml` executes on a weekly schedule and
on-demand. It installs Python 3.13, syncs pandas (the only runtime requirement for the scenarios),
and archives the JSON report as an artifact named `lesson-benchmarks`. Use the workflow logs to
quickly inspect the textual summary without downloading the artifact.

## Adding new scenarios

1. Extend `_load_scenarios` inside `tools/benchmark_lessons.py` with a new entry that returns a
   callable.
1. Implement the callable to return serialisable metadata summarising the workload.
1. Run the benchmarks locally to ensure the new scenario is stable and update this document with a
   short description of the workload.
