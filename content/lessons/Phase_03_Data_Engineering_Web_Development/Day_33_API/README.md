---
day: 33
title: "APIs"
phase: 3
phaseTitle: "Data Engineering & Web Development"
slug: "apis"
duration: 50
difficulty: "intermediate"
tags: [python, requests, api, json]
concepts: [REST APIs, HTTP methods, JSON parsing, authentication]
prerequisites: [14, 15]
outcomes: [Consume REST APIs, Parse JSON responses, Handle authentication]
---

# 🎯 Day 33: Consuming APIs

> *"APIs are how programs talk to each other."*

---

## The "Never-Coded" Bridge

**Imagine you need weather data.** You could scrape weather websites, parsing HTML and hoping the layout doesn't change. Or you could ask politely—via an API.

**APIs (Application Programming Interfaces)** are structured ways to request data from services. Instead of parsing HTML, you get clean JSON.

**Real-world APIs:**

- **Weather**: OpenWeatherMap, WeatherAPI
- **Finance**: Yahoo Finance, Alpha Vantage
- **Social**: Twitter, GitHub, Reddit
- **Maps**: Google Maps, Mapbox
- **AI**: OpenAI, Anthropic

**Why APIs beat scraping:**

- Structured data (JSON vs HTML)
- Stable (documented contracts)
- Faster (no HTML overhead)
- Legal (explicit permission)

---

## The Technical Deep Dive

### Making GET Requests

```python
import requests

# Simple GET request
response = requests.get("https://api.github.com/users/python")
print(f"Status: {response.status_code}")
print(f"Content-Type: {response.headers['content-type']}")

# Parse JSON response
data = response.json()
print(f"Name: {data['name']}")
print(f"Followers: {data['followers']}")
```

### Query Parameters

```python
import requests

# Add query parameters
params = {
    "q": "python",
    "sort": "stars",
    "order": "desc"
}
response = requests.get("https://api.github.com/search/repositories", params=params)
data = response.json()

for repo in data["items"][:5]:
    print(f"{repo['full_name']}: {repo['stargazers_count']} stars")
```

### POST Requests

```python
import requests

# POST with JSON body
payload = {
    "name": "New Repository",
    "description": "Created via API"
}
headers = {"Authorization": "token YOUR_TOKEN"}

response = requests.post(
    "https://api.github.com/user/repos",
    json=payload,
    headers=headers
)
print(f"Status: {response.status_code}")
```

### Error Handling

```python
import requests
from requests.exceptions import RequestException

def safe_api_call(url, params=None):
    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()  # Raises for 4xx/5xx
        return response.json()
    except requests.Timeout:
        print("Request timed out")
    except requests.HTTPError as e:
        print(f"HTTP error: {e.response.status_code}")
    except RequestException as e:
        print(f"Request failed: {e}")
    return None

data = safe_api_call("https://api.github.com/users/octocat")
```

---

## Senior-Level Insights

### HTTP Status Codes

| Code | Meaning      | Action                   |
| ---- | ------------ | ------------------------ |
| 200  | Success      | Parse response           |
| 201  | Created      | Resource was created     |
| 400  | Bad Request  | Fix your request         |
| 401  | Unauthorized | Check authentication     |
| 403  | Forbidden    | Insufficient permissions |
| 404  | Not Found    | Check URL                |
| 429  | Rate Limited | Wait and retry           |
| 500  | Server Error | Retry later              |

### Authentication Methods

```python
# API Key (in header)
headers = {"X-API-Key": "your_key"}
response = requests.get(url, headers=headers)

# Bearer Token (OAuth)
headers = {"Authorization": "Bearer your_token"}
response = requests.get(url, headers=headers)

# Basic Auth
response = requests.get(url, auth=("username", "password"))
```

### Rate Limiting Best Practices

```python
import time

def rate_limited_request(urls, delay=1):
    results = []
    for url in urls:
        response = requests.get(url)
        results.append(response.json())
        time.sleep(delay)  # Respect rate limits
    return results
```

---

## Hands-on Lab

### Exercise 1: GitHub API Explorer

```python
import requests

def get_user_repos(username):
    """Fetch user's public repositories."""
    url = f"https://api.github.com/users/{username}/repos"
    response = requests.get(url, params={"sort": "updated", "per_page": 5})
    
    if response.status_code != 200:
        print(f"Error: {response.status_code}")
        return []
    
    repos = response.json()
    for repo in repos:
        print(f"- {repo['name']}: {repo['stargazers_count']} stars")
    return repos

repos = get_user_repos("python")
```

### Exercise 2: JSON Processing Pipeline

```python
import requests
import pandas as pd

def analyze_github_org(org_name):
    """Analyze an organization's repositories."""
    url = f"https://api.github.com/orgs/{org_name}/repos"
    response = requests.get(url, params={"per_page": 30})
    repos = response.json()
    
    df = pd.DataFrame([{
        "name": r["name"],
        "stars": r["stargazers_count"],
        "forks": r["forks_count"],
        "language": r["language"]
    } for r in repos])
    
    print(f"Total repos: {len(df)}")
    print(f"Total stars: {df['stars'].sum()}")
    print(f"\nTop languages:\n{df['language'].value_counts().head()}")
    
    return df

df = analyze_github_org("python")
```

### Exercise 3: Multi-Page API

```python
import requests

def get_all_repos(username, max_pages=3):
    """Fetch all repos with pagination."""
    all_repos = []
    
    for page in range(1, max_pages + 1):
        response = requests.get(
            f"https://api.github.com/users/{username}/repos",
            params={"page": page, "per_page": 30}
        )
        repos = response.json()
        
        if not repos:
            break
            
        all_repos.extend(repos)
        print(f"Page {page}: {len(repos)} repos")
    
    print(f"Total: {len(all_repos)} repos")
    return all_repos

repos = get_all_repos("torvalds", max_pages=2)
```


### Reliability & Maintainability Tasks

- Build an input validation matrix for each endpoint (valid, boundary, invalid, and malicious payloads).
- Write status-code contract tests for success and error paths (`200`, `400`, `401`, `404`, `429`, `500` as relevant).
- Implement robust pagination + rate-limit handling (`next` links, `Retry-After`, bounded retries, checkpoint resume).

### Exercise 4: Failure Injection — Throttling and Bad Payload

Use a mock/stub API mode that intermittently returns `429` and occasionally malformed JSON.

Your debugging goals:
1. Confirm your client honors `Retry-After` and backoff limits.
2. Validate payload shape before transformation.
3. Record failed pages for replay without re-fetching successful pages.

---

## Mastery Check

### Question 1: JSON vs HTML

Why is API JSON easier than scraping HTML?

<details>
<summary>Click for Answer</summary>

- **Structured**: Direct access to data fields
- **Stable**: API contracts don't change like HTML layouts
- **No parsing**: `response.json()` vs BeautifulSoup
- **Documented**: Know exactly what fields exist
- **Legal**: APIs grant explicit access

```python
# API: Direct access
data = response.json()
user_name = data["name"]

# Scraping: Parse HTML
soup = BeautifulSoup(html)
user_name = soup.select_one(".user-name").text  # Fragile!
```

</details>

### Question 2: 429 Error

Your API calls suddenly return 429 status. What happened and how do you fix it?

<details>
<summary>Click for Answer</summary>

**429 = Rate Limited.** You sent too many requests.

**Fixes:**

1. Add delays: `time.sleep(1)`
2. Check `Retry-After` header for wait time
3. Implement exponential backoff
4. Cache responses to reduce calls
5. Upgrade to paid tier if needed

```python
if response.status_code == 429:
    wait = int(response.headers.get("Retry-After", 60))
    time.sleep(wait)
```

</details>

### Question 3: Authentication

What's the difference between API key and Bearer token?

<details>
<summary>Click for Answer</summary>

**API Key:**

- Simple string identifying your app
- Often passed in header or URL
- Usually for read-only or limited access

**Bearer Token (OAuth):**

- Temporary token after user authorization
- Grants access on behalf of user
- Has scopes/permissions
- Expires and can be revoked

```python
# API Key
headers = {"X-API-Key": "abc123"}

# Bearer Token
headers = {"Authorization": "Bearer eyJhbGc..."}
```

</details>

### Question 4: Debugging

API returns `{"error": "Invalid JSON"}`. Your code:

```python
data = {"key": "value"}
response = requests.post(url, data=data)
```

What's wrong?

<details>
<summary>Click for Answer</summary>

**`data=` sends form data, not JSON.**

Fix:

```python
response = requests.post(url, json=data)  # Sends as JSON
# OR
response = requests.post(url, data=json.dumps(data), 
                         headers={"Content-Type": "application/json"})
```

</details>

### Question 5: Design

You need to fetch data from an API for 10,000 items. How do you approach this?

<details>
<summary>Click for Answer</summary>

1. **Check bulk endpoints** - many APIs have batch endpoints
2. **Paginate efficiently** - fetch 100 at a time, not 1 at a time
3. **Rate limit** - respect API limits with delays
4. **Cache** - store responses to avoid re-fetching
5. **Async** - use `asyncio` + `aiohttp` for parallelism (if allowed)

```python
# Bad: 10,000 individual requests
for id in ids:
    fetch_item(id)

# Better: Bulk or paginated
for page in range(100):
    fetch_page(page, per_page=100)
```

</details>

---

## Summary

- ✅ Use `requests.get()` for API calls
- ✅ Parse JSON with `response.json()`
- ✅ Handle errors and status codes
- ✅ Authenticate with API keys or tokens
- ✅ Respect rate limits

**Tomorrow**: Building your own API with FastAPI.
