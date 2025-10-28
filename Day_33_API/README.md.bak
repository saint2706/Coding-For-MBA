# 📘 Day 33: Accessing Web APIs with `requests`

## Overview

This lesson introduces a lightweight wrapper around the
[JSONPlaceholder](https://jsonplaceholder.typicode.com/) demo API. The module exports three
helpers—`fetch_users`, `fetch_post`, and `fetch_posts_by_user`—that return structured data for
analytics workflows while keeping the HTTP layer easy to mock during tests.

## Learning goals

- Understand how to issue HTTP GET requests with `requests`.
- Convert JSON payloads into `pandas.DataFrame` objects for analysis.
- Inject custom HTTP clients (for example, `requests.Session` objects or call stubs) to make
  networked code testable.

## Requirements

Install the core and testing dependencies into your environment:

```bash
pip install -r requirements.txt
pip install pytest responses
```

`responses` is only needed when you want to simulate the API locally or run the pytest suite.

## Running the lesson

### Live API demo

Execute the script directly to fetch data from JSONPlaceholder:

```bash
python Day_33_API/api.py
```

The command prints a preview of the user list, details for post `1`, and a table of posts authored
by user `2`.

### Mocked endpoints

The helper functions accept a `requests.Session` or any callable with the same signature as
`requests.get`. This allows you to supply canned responses when the internet is unavailable or you
want deterministic examples:

```python
from Day_33_API.api import fetch_users

class MockClient:
    def get(self, url, **kwargs):
        class _Response:
            def __init__(self, payload):
                self._payload = payload

            def raise_for_status(self):
                return None

            def json(self):
                return self._payload

        return _Response([{"id": 1, "name": "Ada", "username": "ada"}])

mocked_users = fetch_users(client=MockClient())
print(mocked_users)
```

The included pytest suite (see below) relies on the `responses` library to provide richer,
request-aware mocks if you prefer a declarative API.

## Tests

Run the Day 33 unit tests, which exercise both success and error paths using mocked HTTP responses:

```bash
pytest tests/test_day_33.py
```

To execute the entire collection of lesson tests, run `pytest` from the project root.

<!-- LESSON_FOOTER_START -->

---

**Previous:** [Day 32 – Day 32: Connecting to Other Databases (MySQL & MongoDB)](../Day_32_Other_Databases/README.md) • **Next:** [Day 34 – Day 34: Building a Simple API with Flask](../Day_34_Building_an_API/README.md)

_You are on lesson 33 of 108._

<!-- LESSON_FOOTER_END -->