## CI/CD Optimizations
- Pinned stable major versions for GitHub Actions across all workflows (`actions/checkout@v4`, `actions/upload-artifact@v4`, `github/codeql-action/*@v3`, etc.).
- Removed unnecessary `strategy.matrix` configuration in `codeql.yml` since it only analyzed `javascript-typescript`.
- Verified testing, linting, and build pass without issue.
