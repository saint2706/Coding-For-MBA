---
day: "36C"
title: "Async Python and FastAPI"
phase: 3
phaseTitle: "Data Engineering & Web Development"
slug: "async-python-and-fastapi"
duration: 120
difficulty: "intermediate"
tags:
  - asyncio
  - fastapi
  - httpx
  - api-performance
  - concurrency
concepts:
  - "event loop"
  - "await and coroutines"
  - "cooperative multitasking"
  - "async API handlers"
  - "throughput vs latency"
prerequisites: [33, 34]
outcomes:
  - "Design FastAPI endpoints with async patterns that improve I/O-bound throughput"
  - "Benchmark sequential vs concurrent API workflows and interpret timing tradeoffs"
  - "Apply performance-aware API design decisions including timeouts, retries, and rate controls"
---

# ⚡ Day 36C: Async Python and FastAPI

> *"Fast APIs are not just about syntax—they are about controlling waiting time at scale."*

---

## The "Never-Coded" Bridge

Imagine you're managing a customer support desk:

- **Sequential style**: One agent handles one ticket from start to finish, including waiting for customer replies.
- **Async style**: The same agent starts ticket A, then while waiting on a customer response, handles tickets B, C, and D.

The async agent is not "working faster" on each ticket—they're just **not wasting idle waiting time**.

That is the async mental model for APIs:

- Keep CPU busy with useful work.
- Yield when waiting on network/database I/O.
- Resume when data is ready.

---

## The Technical Deep Dive

### 1. Asyncio Mental Model

#### `await`

`await` means: "Pause this coroutine here, and let the event loop run something else until this result is ready."

```python
result = await fetch_customer_profile(customer_id)
```

#### Event loop

The event loop is the scheduler that:

1. Tracks pending coroutines
2. Runs any coroutine that is ready
3. Switches tasks when one hits an `await`

#### Cooperative multitasking

Tasks cooperate by yielding control at `await` points. Unlike preemptive threads, the loop won't forcibly interrupt Python code mid-line.

#### When async helps

Async shines for **I/O-bound** workloads:

- Calling external APIs
- Waiting on database/network
- Reading many remote files/services

#### When async does *not* help much

Async usually doesn't speed up **CPU-bound** tasks:

- Heavy Pandas transforms
- Large model inference on CPU
- Complex numeric loops

For CPU-bound work, use multiprocessing, distributed workers, or job queues.

### 2. FastAPI Async Endpoints + Async HTTP Client

Use `async def` route handlers when your handler performs async I/O.

```python
from fastapi import FastAPI, HTTPException
import httpx

app = FastAPI()

@app.get("/market-snapshot")
async def market_snapshot(symbol: str):
    timeout = httpx.Timeout(5.0, connect=2.0)

    async with httpx.AsyncClient(timeout=timeout) as client:
        try:
            price_resp = await client.get(f"https://api.example.com/price/{symbol}")
            volume_resp = await client.get(f"https://api.example.com/volume/{symbol}")

            price_resp.raise_for_status()
            volume_resp.raise_for_status()
        except httpx.TimeoutException:
            raise HTTPException(status_code=504, detail="Upstream timeout")
        except httpx.HTTPError as exc:
            raise HTTPException(status_code=502, detail=f"Upstream error: {exc}")

    return {
        "symbol": symbol,
        "price": price_resp.json(),
        "volume": volume_resp.json(),
    }
```

#### Timeout/retry basics

- Always set explicit timeouts.
- Retry only for transient failures (timeouts, 429, 5xx).
- Use bounded retries with backoff to avoid retry storms.

Minimal retry pattern:

```python
import asyncio
import httpx

async def get_with_retry(client: httpx.AsyncClient, url: str, retries: int = 3):
    delay = 0.25
    for attempt in range(1, retries + 1):
        try:
            resp = await client.get(url)
            resp.raise_for_status()
            return resp
        except (httpx.TimeoutException, httpx.ConnectError, httpx.HTTPStatusError):
            if attempt == retries:
                raise
            await asyncio.sleep(delay)
            delay *= 2
```

### 3. Concurrency Lab: Sequential vs Async Batched Calls

Goal: compare throughput and latency under equivalent workloads.

```python
import asyncio
import time
import httpx

URLS = [f"https://httpbin.org/delay/1?i={i}" for i in range(12)]

async def fetch_one(client, url):
    r = await client.get(url)
    r.raise_for_status()
    return r.json()

async def run_sequential(urls):
    async with httpx.AsyncClient(timeout=10.0) as client:
        start = time.perf_counter()
        for url in urls:
            await fetch_one(client, url)
        return time.perf_counter() - start

async def run_batched(urls, batch_size=4):
    async with httpx.AsyncClient(timeout=10.0) as client:
        start = time.perf_counter()
        for i in range(0, len(urls), batch_size):
            batch = urls[i:i + batch_size]
            await asyncio.gather(*(fetch_one(client, u) for u in batch))
        return time.perf_counter() - start

async def main():
    seq_t = await run_sequential(URLS)
    batched_t = await run_batched(URLS, batch_size=4)

    speedup = seq_t / batched_t if batched_t else float("inf")
    print(f"Sequential: {seq_t:.2f}s")
    print(f"Batched async: {batched_t:.2f}s")
    print(f"Speedup: {speedup:.2f}x")

asyncio.run(main())
```

**Metrics to capture in your lab notes:**

- Total runtime
- Requests/second
- Error count (timeouts, non-200)
- Best batch size before errors rise

---

## Senior-Level Insights

### 1. Blocking I/O inside async handlers

Calling blocking libraries in `async def` endpoints stalls the event loop and hurts all concurrent requests. Use async-native clients or offload blocking tasks.

### 2. Connection pooling

Creating a new HTTP client per request can waste sockets and TLS handshakes. Prefer shared clients/pools with lifecycle management for high throughput.

### 3. Backpressure

If inbound traffic exceeds downstream capacity, queue sizes explode and tail latency spikes. Use bounded concurrency (semaphores), timeouts, and admission control.

### 4. Rate limits

External APIs often enforce QPS limits. Concurrency without limit awareness triggers 429s. Build rate-aware batching, retries with jitter, and circuit-breaker behavior.

### 5. Throughput vs p95 latency

A higher request-per-second number can hide bad tail latency. Evaluate both throughput and p95/p99 response times when making architecture decisions.

### `asyncio.gather()` vs `asyncio.create_task()` — When to Use Which

Both run coroutines concurrently, but they have different use cases:

| Feature | `asyncio.gather()` | `asyncio.create_task()` |
|---------|-------------------|------------------------|
| **Syntax** | `await asyncio.gather(coro1, coro2)` | `task = asyncio.create_task(coro)` |
| **Returns** | List of all results (in order) once ALL complete | A Task object you can await individually |
| **Error handling** | By default, first exception cancels all tasks | Each task can be awaited separately with try/except |
| **When to use** | Fan-out: run N independent tasks and wait for all | Background tasks: fire-and-forget, or tasks that run alongside other work |

```python
import asyncio

async def task_a():
    await asyncio.sleep(1)
    return "A done"

async def task_b():
    await asyncio.sleep(2)
    return "B done"

# Pattern 1: gather — wait for ALL, get results in order
async def run_with_gather():
    results = await asyncio.gather(task_a(), task_b())
    print(results)  # ["A done", "B done"] — after 2 seconds (not 3!)

# Pattern 2: create_task — start immediately, await later
async def run_with_create_task():
    t_a = asyncio.create_task(task_a())
    t_b = asyncio.create_task(task_b())
    # ... do other work here while tasks run in background ...
    result_a = await t_a  # "A done"
    result_b = await t_b  # "B done"

asyncio.run(run_with_gather())
```

**Rule of thumb:** Use `gather()` when you have a fixed list of tasks to run together. Use `create_task()` when you need to start a task now but want to continue doing other work before checking the result.

---

## Hands-on Lab

### Exercise 1: Convert a synchronous endpoint

**Business Scenario:** Your Day 34 product catalog API currently uses synchronous database calls. Under load testing, it becomes a bottleneck because each request blocks Python while waiting for the database. You need to convert the synchronous handler to async to improve throughput.

**Baseline synchronous code (from Day 34 — convert THIS):**

```python
import time
from fastapi import FastAPI

app = FastAPI()

def fetch_product_from_db(product_id: int) -> dict:
    """Simulates a synchronous database call (blocking I/O)."""
    time.sleep(0.1)  # Simulates 100ms DB query
    return {"id": product_id, "name": "Laptop", "price": 999.99}

@app.get("/products/{product_id}")
def get_product(product_id: int):
    """Synchronous endpoint — blocks the thread during I/O."""
    product = fetch_product_from_db(product_id)
    return product
```

**Your Task:**

1. Convert `fetch_product_from_db` to an async function using `asyncio.sleep` instead of `time.sleep`
2. Convert the FastAPI endpoint to `async def`
3. Verify the endpoint still returns the correct response

**Expected converted code:**

```python
import asyncio
from fastapi import FastAPI

app = FastAPI()

async def fetch_product_from_db(product_id: int) -> dict:
    """Simulates an async database call (non-blocking I/O)."""
    await asyncio.sleep(0.1)  # Non-blocking: releases the event loop during wait
    return {"id": product_id, "name": "Laptop", "price": 999.99}

@app.get("/products/{product_id}")
async def get_product(product_id: int):
    """Async endpoint — other requests can be handled while this one awaits."""
    product = await fetch_product_from_db(product_id)
    return product
```

**Expected output (curl test):**

```bash
curl "http://localhost:8000/products/1"
# → {"id": 1, "name": "Laptop", "price": 999.99}
```

1. Take one Day 34 endpoint that calls an external API.
2. Convert handler from `def` to `async def`.
3. Replace synchronous HTTP client with `httpx.AsyncClient`.
4. Measure average response time over 100 requests.

### Exercise 2: Sequential vs batched concurrency benchmark

**Business Scenario:** A fintech startup's portfolio dashboard needs to fetch current prices for 12 different stocks. The synchronous approach takes 12 × 0.5s = 6 seconds per request. Using `asyncio.gather()` to fetch all 12 concurrently should bring this down to ~0.5s (one round-trip instead of twelve sequential ones).

**Your Task:**

1. Write a `fetch_stock_price(ticker)` async function that simulates a 0.5s API call
2. Benchmark **sequential** execution: loop through 12 tickers with `await` one at a time
3. Benchmark **concurrent** execution: use `asyncio.gather(*[fetch_stock_price(t) for t in tickers])`
4. Print the elapsed time for both approaches

**Expected code structure:**

```python
import asyncio
import time

TICKERS = ["AAPL", "GOOGL", "MSFT", "AMZN", "META",
           "TSLA", "NVDA", "JPM", "BAC", "WFC", "GS", "MS"]

async def fetch_stock_price(ticker: str) -> dict:
    await asyncio.sleep(0.5)  # Simulates 500ms API call
    return {"ticker": ticker, "price": round(100 + hash(ticker) % 900, 2)}

async def sequential_fetch():
    start = time.time()
    results = []
    for ticker in TICKERS:
        result = await fetch_stock_price(ticker)
        results.append(result)
    elapsed = time.time() - start
    print(f"Sequential: {elapsed:.2f}s for {len(results)} stocks")
    return results

async def concurrent_fetch():
    start = time.time()
    results = await asyncio.gather(*[fetch_stock_price(t) for t in TICKERS])
    elapsed = time.time() - start
    print(f"Concurrent: {elapsed:.2f}s for {len(results)} stocks")
    return results

asyncio.run(sequential_fetch())
asyncio.run(concurrent_fetch())
```

**Expected terminal output:**

```
Sequential: 6.01s for 12 stocks
Concurrent: 0.50s for 12 stocks
```

*The concurrent version is ~12× faster because all 12 tasks run simultaneously instead of one at a time.*

1. Run the benchmark script above.
2. Test batch sizes: 2, 4, 8, 12.
3. Record runtime, throughput, and error rates.
4. Recommend a production-safe batch size with rationale.

### Exercise 3: Rate-limit-aware client

**Business Scenario:** A third-party market data API allows a maximum of 5 requests per second. Your application needs to fetch data for 20 companies but must respect the rate limit — otherwise, the API will return HTTP 429 (Too Many Requests) and block your IP.

**Starter Code Template (complete the TODOs):**

```python
import asyncio
import aiohttp
import time

# Configuration
MAX_REQUESTS_PER_SECOND = 5
TOTAL_COMPANIES = 20
API_URL = "https://httpbin.org/delay/0.1"  # Test endpoint — replace with real API

async def fetch_with_retry(session: aiohttp.ClientSession, company_id: int,
                            max_retries: int = 3) -> dict:
    """Fetch data for one company with exponential backoff on failure."""
    for attempt in range(max_retries):
        try:
            async with session.get(
                API_URL,
                timeout=aiohttp.ClientTimeout(total=5.0)  # TODO: Set timeout
            ) as response:
                if response.status == 429:
                    wait_time = 2 ** attempt  # Exponential backoff: 1s, 2s, 4s
                    print(f"Rate limited. Waiting {wait_time}s before retry...")
                    await asyncio.sleep(wait_time)
                    continue
                response.raise_for_status()
                return {"company_id": company_id, "status": "success"}
        except asyncio.TimeoutError:
            print(f"Timeout for company {company_id}, attempt {attempt + 1}")
    return {"company_id": company_id, "status": "failed"}

async def rate_limited_batch_fetch(company_ids: list) -> list:
    """Fetch all companies while respecting the rate limit."""
    results = []
    async with aiohttp.ClientSession() as session:
        # Process in batches of MAX_REQUESTS_PER_SECOND
        for i in range(0, len(company_ids), MAX_REQUESTS_PER_SECOND):
            batch = company_ids[i:i + MAX_REQUESTS_PER_SECOND]
            batch_start = time.time()

            # TODO: Use asyncio.gather() to fetch the batch concurrently
            batch_results = await asyncio.gather(
                *[fetch_with_retry(session, cid) for cid in batch]
            )
            results.extend(batch_results)

            # Ensure we don't exceed rate limit: wait if batch finished too fast
            elapsed = time.time() - batch_start
            if elapsed < 1.0:
                await asyncio.sleep(1.0 - elapsed)
            print(f"Batch {i//MAX_REQUESTS_PER_SECOND + 1}: {len(batch)} companies fetched")

    return results

company_ids = list(range(1, TOTAL_COMPANIES + 1))
results = asyncio.run(rate_limited_batch_fetch(company_ids))
successful = sum(1 for r in results if r["status"] == "success")
print(f"\nCompleted: {successful}/{TOTAL_COMPANIES} successful fetches")
```

**Expected terminal output:**

```
Batch 1: 5 companies fetched
Batch 2: 5 companies fetched
Batch 3: 5 companies fetched
Batch 4: 5 companies fetched

Completed: 20/20 successful fetches
```

Add:

- per-request timeout
- retries with exponential backoff
- handling for 429 responses (`Retry-After` if present)

Then document how your client behaves under synthetic load.

---

## Mastery Check

**Q1**: Your pricing endpoint makes three external API calls, each averaging 400ms. Why might async improve throughput even if each individual upstream call time does not change?
<details><summary>Answer</summary>
Async allows overlapping waiting periods across requests and/or across independent upstream calls, reducing idle time and increasing concurrent request handling capacity.
</details>

**Q2**: A team reports higher requests/sec after adding concurrency, but p95 latency doubled and 429 errors rose. What likely happened, and what is the fix?
<details><summary>Answer</summary>
They exceeded downstream rate/capacity limits, causing retries/queueing. Fix with bounded concurrency, adaptive rate limiting, tighter timeout budgets, and retry policies with jitter.
</details>

**Q3**: In a FastAPI `async def` handler, someone used a blocking database driver. What risk does this introduce for business SLAs?
<details><summary>Answer</summary>
Blocking calls freeze the event loop thread, degrading concurrency and increasing tail latency for unrelated users, which can breach latency/error SLAs during spikes.
</details>

**Q4**: Your B2B integration endpoint must process 1,000 partner API calls/min with strict error budgets. What metrics should guide your design choices?
<details><summary>Answer</summary>
Track throughput (calls/min), success rate, timeout rate, p95/p99 latency, and 429/5xx frequency. Use these to tune concurrency limits, retry/backoff, and circuit-breaker thresholds.
</details>

**Q5**: When should you avoid async and instead move workload to workers/queues?
<details><summary>Answer</summary>
For CPU-heavy or long-running tasks where event-loop concurrency provides little benefit. Offload to worker processes/queues and keep API handlers lightweight.
</details>

---

## Summary

- ✅ Async is about **efficient waiting**, not magically faster compute.
- ✅ FastAPI `async def` + `httpx.AsyncClient` supports scalable I/O-bound endpoints.
- ✅ Performance-aware API design includes timeouts, bounded retries, and rate-aware concurrency.
- ✅ Engineering decisions should be based on **throughput + tail latency + error budgets**, not one metric.

**Next:** apply these patterns to production deployment and observability so performance gains remain reliable under real business traffic.
