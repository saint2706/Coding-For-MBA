---
day: 33
title: "Working with APIs"
phase: 3
phaseTitle: "Data Engineering & Web Development"
slug: "working-with-apis"
duration: 50
difficulty: "intermediate"
tags: [python, api, requests, json]
concepts: [REST APIs, HTTP methods, authentication, JSON parsing]
prerequisites: [16, 30]
outcomes: [Consume REST APIs, Handle authentication, Parse JSON responses]
---

# 🎯 Day 33: Working with APIs

> *"APIs: the universal translators of the internet."*

---

## The "Never-Coded" Bridge

APIs let applications talk to each other. Instead of scraping HTML, you request structured data directly:
- Get weather forecasts
- Pull stock prices
- Access social media data

---

## The Technical Deep Dive

### Basic GET Request

```python
import requests

response = requests.get("https://api.github.com/users/octocat")

print(response.status_code)  # 200 = success
data = response.json()       # Parse JSON
print(data["name"])          # Access fields
```

### Query Parameters

```python
params = {
    "q": "python",
    "sort": "stars",
    "order": "desc"
}

response = requests.get("https://api.github.com/search/repositories", params=params)
data = response.json()

for repo in data["items"][:5]:
    print(f"{repo['name']}: ⭐ {repo['stargazers_count']}")
```

### Authentication

```python
# API Key in header
headers = {"Authorization": "Bearer YOUR_API_KEY"}
response = requests.get(url, headers=headers)

# API Key in params
params = {"api_key": "YOUR_API_KEY"}
response = requests.get(url, params=params)

# Basic auth
response = requests.get(url, auth=("username", "password"))
```

### POST Requests

```python
data = {
    "title": "New Post",
    "body": "Content here",
    "userId": 1
}

response = requests.post(
    "https://jsonplaceholder.typicode.com/posts",
    json=data
)

print(response.status_code)  # 201 = created
print(response.json())
```

### Error Handling

```python
response = requests.get(url)

if response.status_code == 200:
    data = response.json()
elif response.status_code == 404:
    print("Not found")
elif response.status_code == 401:
    print("Unauthorized")
else:
    print(f"Error: {response.status_code}")

# Or use raise_for_status
try:
    response.raise_for_status()
except requests.exceptions.HTTPError as e:
    print(f"HTTP Error: {e}")
```

---

## Hands-on Lab

```python
import requests
import pandas as pd

# Fetch cryptocurrency prices
url = "https://api.coindesk.com/v1/bpi/currentprice.json"
response = requests.get(url)
data = response.json()

print(f"Bitcoin Price: ${data['bpi']['USD']['rate']}")

# Create DataFrame from API
url = "https://jsonplaceholder.typicode.com/users"
response = requests.get(url)
users = response.json()

df = pd.DataFrame(users)[["id", "name", "email", "company"]]
df["company"] = df["company"].apply(lambda x: x["name"])
print(df)
```

---

## Summary

- ✅ `requests.get()` fetches data
- ✅ `.json()` parses response
- ✅ Headers for authentication
- ✅ Always handle errors

**Tomorrow**: Building your own APIs.
