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

---

## Hands-on Lab

### Exercise 1: Convert a synchronous endpoint
1. Take one Day 34 endpoint that calls an external API.
2. Convert handler from `def` to `async def`.
3. Replace synchronous HTTP client with `httpx.AsyncClient`.
4. Measure average response time over 100 requests.

### Exercise 2: Sequential vs batched concurrency benchmark
1. Run the benchmark script above.
2. Test batch sizes: 2, 4, 8, 12.
3. Record runtime, throughput, and error rates.
4. Recommend a production-safe batch size with rationale.

### Exercise 3: Rate-limit-aware client
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
