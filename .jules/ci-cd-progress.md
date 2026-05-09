# CI/CD Optimization Progress

## Issues Discovered
1. `.github/workflows/dependency-review.yml`: `actions/dependency-review-action@v4` can be updated to `v5`.
2. `.github/workflows/ci.yml`: `unit-test` job has redundant `npm run test:coverage` when matrix provides no specific value for OS since `os: [ubuntu-latest, windows-latest]` is run for coverage but coverage reports are OS-independent mostly, although matrix helps verify on both. Wait, actually, unit test coverage uploads matrix files. Let's look closer.
3. `.github/workflows/ci.yml`: The `typecheck` and `unit-test` jobs both checkout, bootstrap, and run tasks in matrix. `validate-content` is an independent job. Let's see if we can optimize them.
4. The repo uses `.github/actions/node-bootstrap` to cache and install.
5. In `ci.yml`, `npm run lint:ci` is actually `npm run typecheck` and `typecheck` also runs formatting check.
6. The user requested: Act as 'CI/CD' 🔄, a pipeline optimization specialist.
7. I need to make sure to update versions and pin them properly if missing.
8. We should upgrade `actions/dependency-review-action` to `v5`.
9. The `nightly-smoke.yml` uses `actions/upload-artifact@v7`, `actions/checkout@v6`, `actions/github-script@v9`, `actions/cache@v5`, which seem fully updated based on my recent checks.

Let me double check what exactly needs optimization.
The priorities are:
- Implement caching for dependencies -> already done in `node-bootstrap`
- Pin versions -> done but can update dependency-review to v5
- Parallelize independent jobs -> they are parallel in ci.yml
- Fail fast on errors -> `fail-fast: true` is set in matrix

Wait, looking at `dependency-review.yml`:
```yaml
      - name: Dependency Review
        uses: actions/dependency-review-action@v4
```
It could be `v5`.

What about `ci.yml`:
```yaml
  typecheck:
    runs-on: ${{ matrix.os }}
    timeout-minutes: 15
    strategy:
      fail-fast: true
      matrix:
        os: [ubuntu-latest, windows-latest]
        node-version: [22.x]
```
Do we really need to run `format:check` on both `ubuntu-latest` and `windows-latest`? Formatting is OS-independent.
```yaml
      - name: Check formatting
        run: npm run format:check
```
We could extract formatting to a separate job or only run it on ubuntu-latest, saving some CI time. Or just let it run.

Let's review the instructions and boundaries.
"1. 🔍 **DISCOVERY** - Analyze pipeline health - Review build durations and failure rates - Check for cache hits/misses - Identify bottlenecks - Scan for security vulnerabilities - Validate YAML syntax"
"3. 🔧 **IMPLEMENTATION** - Apply optimizations - Implement dependency caching - Parallelize independent jobs - Replace heavy docker images - Optimize test execution - Refactor reusable steps"

In `ci.yml`, `unit-test` job:
```yaml
      - name: Test with coverage threshold
        env:
          VITE_GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
        shell: bash
        run: |
          mkdir -p test-results coverage
          npm run test:coverage -- \
            --reporter=default \
            --reporter=junit \
            --outputFile.junit=./test-results/vitest-junit.xml \
            --coverage.reporter=text \
            --coverage.reporter=html \
            --coverage.reporter=lcov \
            --coverage.reporter=cobertura
```

And in `codeql.yml`:
```yaml
      - name: Build project
        run: npm run build
```

Wait, `ci.yml` does not actually run `npm run build`? It only runs `format:check`, `npm run lint:ci` (which is `typecheck`), `npm run validate-content`, and `unit-test`. It doesn't verify that the build succeeds, except `deploy.yml` which is triggered after CI succeeds, or `codeql.yml` which runs on push/PR main. Wait, `deploy.yml` is `workflow_run`.
Should we add `npm run build` to `ci.yml` to fail fast on build errors?
Wait, if `codeql.yml` runs on PR and runs `npm run build`, then the build is verified there.
Let's see if we can optimize `deploy.yml`:
```yaml
  build:
    if: ${{ github.event_name == 'workflow_dispatch' || (github.event.workflow_run.conclusion == 'success' && github.event.workflow_run.event == 'push' && github.event.workflow_run.head_repository.full_name == github.repository) }}
    runs-on: ubuntu-latest
```
That looks fine.

What about `ci.yml` concurrency?
```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.event.pull_request.number || github.ref }}
  cancel-in-progress: true
```
This is already present.

Is there a way to cache the Vite build or TS build in `codeql.yml`? It might be fast enough.
Let's check if there are other actions that need version update.
Actions used:
`actions/checkout@v6`
`actions/cache@v4` / `@v5`
`actions/setup-node@v4`
`actions/upload-artifact@v7`
`actions/deploy-pages@v5`
`actions/upload-pages-artifact@v5`
`github/codeql-action/init@v4`
`github/codeql-action/analyze@v4`
`actions/dependency-review-action@v4` -> update to `v5`
`actions/github-script@v9`

Wait, in `.github/actions/node-bootstrap/action.yml`:
```yaml
    - name: Cache node_modules
      id: npm-cache
      uses: actions/cache@v4
```
Wait, we saw `actions/cache@v5` is available (and used in `nightly-smoke.yml`). Let's update `actions/cache@v4` to `v5` in `node-bootstrap/action.yml`.

Wait, in `ci.yml`:
```yaml
    steps:
      - name: Check out repository
        uses: actions/checkout@v6

      - name: Bootstrap Node workspace
        uses: ./.github/actions/node-bootstrap
        with:
          node-version: ${{ matrix.node-version }}
```
This is good.

Let's check `nightly-smoke.yml`:
```yaml
      - name: Cache Playwright browsers
        if: ${{ github.event.inputs.run_playwright_smoke == 'true' || vars.RUN_NIGHTLY_PLAYWRIGHT_SMOKE == 'true' }}
        uses: actions/cache@v5
```
It already uses `v5`. Let's update `node-bootstrap` to use `actions/cache@v5`.

Is there anything else?
Let's look at `ci.yml` `typecheck` job:
```yaml
  typecheck:
    runs-on: ${{ matrix.os }}
    timeout-minutes: 15
    strategy:
      fail-fast: true
      matrix:
        os: [ubuntu-latest, windows-latest]
        node-version: [22.x]
    steps:
      - name: Check out repository
        uses: actions/checkout@v6

      - name: Bootstrap Node workspace
        uses: ./.github/actions/node-bootstrap
        with:
          node-version: ${{ matrix.node-version }}

      - name: Check formatting
        run: npm run format:check

      - name: Typecheck
        run: npm run lint:ci
```
Running `npm run format:check` on both `ubuntu-latest` and `windows-latest` is redundant. Formatting is OS-independent. We can move formatting to a separate lightweight job or only run it if `matrix.os == 'ubuntu-latest'`, but extracting it to a separate job, say `lint-and-format`, makes it clearer. However, `typecheck` is already quite fast.

Let's look at caching in Vite / ESLint / Prettier.
Vite builds are not cached across CI runs currently, but `npm run build` is not in `ci.yml` anyway, only `typecheck` and `unit-test`.

Let's think about caching Playwright browsers in `nightly-smoke.yml`.
The key is:
```yaml
          key: ${{ runner.os }}-playwright-${{ hashFiles('**/package-lock.json') }}
```
This cache key includes `package-lock.json`, which is a good practice.
Wait, Playwright browser binaries are usually stored in `~/.cache/ms-playwright`. Caching them might save time. The current logic in `nightly-smoke.yml` uses:
```yaml
      - name: Cache Playwright browsers
        uses: actions/cache@v5
        with:
          path: ~/.cache/ms-playwright
          key: ${{ runner.os }}-playwright-${{ hashFiles('**/package-lock.json') }}
```
This is already implemented.

What about `lighthouserc.json` / `lighthouse.yml`?
```yaml
      - name: Serve dist
        run: |
          npx --yes serve@14 dist -l 4173 >/tmp/serve.log 2>&1 &
          npx --yes wait-on@8 http://127.0.0.1:4173
```
Running `npx --yes serve@14` downloads the package every time. We could just use `npm run preview` which uses Vite's built-in preview server, which is already installed as a devDependency.
Wait, `npm run preview` is available in `package.json`: `"preview": "vite preview"`.
`vite preview` defaults to port `4173`!
So we can replace:
```yaml
      - name: Serve dist
        run: |
          npx --yes serve@14 dist -l 4173 >/tmp/serve.log 2>&1 &
          npx --yes wait-on@8 http://127.0.0.1:4173
```
with:
```yaml
      - name: Serve dist
        run: |
          npm run preview >/tmp/serve.log 2>&1 &
          npx --yes wait-on@8 http://localhost:4173
```
Wait, `vite preview` runs on `http://localhost:4173`. `wait-on` might need `http-get://localhost:4173` or similar. Let's test it locally in bash!

### Findings & Improvements
1. `node-bootstrap/action.yml`: Bump `actions/cache@v4` -> `v5` (latest).
2. `dependency-review.yml`: Bump `actions/dependency-review-action@v4` -> `v5` (latest).
3. `lighthouse.yml`: Replace `npx --yes serve@14 dist -l 4173` with `npm run preview` to avoid downloading an external package (since Vite is already installed and cached in `node_modules`).
4. `ci.yml`:
    - Redundant `format:check` running on `windows-latest` via matrix. Extracting it to a quick standalone `lint` job or conditioning it to only run on `ubuntu-latest`.
    - `unit-test` job generates test-results and coverage on both OSes but uploading coverage artifacts from both OSes is slightly redundant if it's identical, however for matrix verification it's okay.
5. In `package.json`, `lint` is `npm run typecheck`, and `lint:ci` is `npm run typecheck`. But `format:check` is completely separate. We can have `lint` job in `ci.yml` that runs formatting.
Let's modify `ci.yml` `typecheck` job to only run `npm run format:check` if `matrix.os == 'ubuntu-latest'`.

### Action Items Complete
- Bumped `actions/cache@v4` to `v5` in `node-bootstrap`.
- Bumped `actions/dependency-review-action@v4` to `v5` in `dependency-review.yml`.
- Replaced external `npx --yes serve@14` with built-in `npm run preview` in `lighthouse.yml` to save unnecessary package downloads.
- Added conditional `if: matrix.os == 'ubuntu-latest'` for `npm run format:check` in `ci.yml` to save redundant runs across the matrix.

### Verification
Tests pass and builds complete locally. Next step is pre-commit checks and PR.
