______________________________________________________________________

## layout: default title: Dependency review — 2025-09-29 nav_order: 90 permalink: /dependency-review/

## Summary

- Upgraded the production requirements to the latest stable releases that support Python 3.13.
- Realigned TensorFlow with NumPy 2.x compatibility and refreshed ancillary scientific tooling
  (pandas, scikit-learn, matplotlib, seaborn, sympy).
- Adjusted the Day 29 interactive visualisation helper to preserve Python `datetime` objects after
  pandas 2.3's aggregation changes.

## Upgrade matrix

| Package | Previous | Updated | Notes | |---------|----------|---------|-------| | beautifulsoup4 |
4.12.3 | 4.14.2 | Bug fixes and parser improvements; no code changes required. | | Flask | 3.0.0 |
3.1.2 | New click/werkzeug minimums satisfied automatically; project uses only stable APIs. | |
joblib | 1.3.2 | 1.5.2 | Backwards-compatible speedups; consumed indirectly by scikit-learn. | |
matplotlib | 3.8.2 | 3.10.6 | Deprecation clean-up only; smoke tests confirmed plotting helpers
still render. | | numpy | 1.26.2 | 2.3.3 | Required upgrading TensorFlow to 2.20.0 because 2.16.x
pins `<2.0`. | | pandas | 2.1.4 | 2.3.2 | Aggregations now preserve `datetime64`; code updated to
convert to Python `datetime`. | | plotly | 5.18.0 | 6.3.0 | No breaking API changes encountered. | |
psycopg2-binary | 2.9.9 | 2.9.10 | Security/bug-fix release. | | requests | 2.31.0 | 2.32.5 |
Carries urllib3 security patches. | | scikit-learn | 1.3.2 | 1.7.2 | Supports NumPy 2.x and Python
3.13; no API changes affecting lesson utilities. | | seaborn | 0.13.0 | 0.13.2 | Minor bug fixes
only. | | sympy | 1.12 | 1.14.0 | Symbolics lessons continue to run without modification. | |
tensorflow | 2.16.1 | 2.20.0 | Provides Python 3.13 wheels and compatibility with NumPy 2.x. | |
responses | 0.25.3 | 0.25.8 | Keeps HTTP mocking utilities current for API lessons. |

## Smoke test matrix

- `pytest` — full suite (182 tests) with coverage thresholds intact.
