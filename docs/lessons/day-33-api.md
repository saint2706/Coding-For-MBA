## Overview

This lesson introduces a lightweight wrapper around the
[JSONPlaceholder](https://jsonplaceholder.typicode.com/) demo API. The module
exports three helpers—`fetch_users`, `fetch_post`, and `fetch_posts_by_user`—that
return structured data for analytics workflows while keeping the HTTP layer easy
to mock during tests.

## Learning goals

- Understand how to issue HTTP GET requests with `requests`.
- Convert JSON payloads into `pandas.DataFrame` objects for analysis.
- Inject custom HTTP clients (for example, `requests.Session` objects or call
  stubs) to make networked code testable.

## Requirements

Install the core and testing dependencies into your environment:

```bash
pip install -r requirements.txt
pip install pytest responses
```

`responses` is only needed when you want to simulate the API locally or run the
pytest suite.

## Running the lesson

### Live API demo

Execute the script directly to fetch data from JSONPlaceholder:

```bash
python Day_33_API/api.py
```

The command prints a preview of the user list, details for post `1`, and a table
of posts authored by user `2`.

### Mocked endpoints

The helper functions accept a `requests.Session` or any callable with the same
signature as `requests.get`. This allows you to supply canned responses when the
internet is unavailable or you want deterministic examples:

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

The included pytest suite (see below) relies on the `responses` library to
provide richer, request-aware mocks if you prefer a declarative API.

## Tests

Run the Day 33 unit tests, which exercise both success and error paths using
mocked HTTP responses:

```bash
pytest tests/test_day_33.py
```

To execute the entire collection of lesson tests, run `pytest` from the project
root.

## Additional Materials

- **api.ipynb**  
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_33_API/api.ipynb){ .md-button } 
  [📓 Open in NBViewer](https://nbviewer.org/github/saint2706/Coding-For-MBA/blob/main/Day_33_API/api.ipynb){ .md-button } 
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_33_API/api.ipynb){ .md-button .md-button--primary } 
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_33_API/api.ipynb){ .md-button }
- **solutions.ipynb**  
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_33_API/solutions.ipynb){ .md-button } 
  [📓 Open in NBViewer](https://nbviewer.org/github/saint2706/Coding-For-MBA/blob/main/Day_33_API/solutions.ipynb){ .md-button } 
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_33_API/solutions.ipynb){ .md-button .md-button--primary } 
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_33_API/solutions.ipynb){ .md-button }

???+ example "api.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_33_API/api.py)

    ```python title="api.py"
    """Utility functions for interacting with the JSONPlaceholder API used in Day 33."""

    from __future__ import annotations

    from typing import Any, Optional

    import pandas as pd
    import requests

    JSONPLACEHOLDER_BASE_URL = "https://jsonplaceholder.typicode.com"
    USERS_ENDPOINT = f"{JSONPLACEHOLDER_BASE_URL}/users"
    POSTS_ENDPOINT = f"{JSONPLACEHOLDER_BASE_URL}/posts"


    def _make_request(
        url: str,
        client: Optional[Any] = None,
        **kwargs: Any,
    ) -> requests.Response:
        """Execute a GET request using the provided client.

        The client can be a ``requests.Session`` (or any object that exposes a
        ``get`` method) or a callable that mimics ``requests.get``.
        """

        if client is None:
            with requests.Session() as session:
                response = session.get(url, **kwargs)
        elif hasattr(client, "get"):
            response = client.get(url, **kwargs)  # type: ignore[call-arg]
        elif callable(client):
            response = client(url, **kwargs)
        else:
            raise TypeError("client must be a requests.Session, callable, or None")

        response.raise_for_status()
        return response


    def fetch_users(
        client: Optional[Any] = None,
    ) -> pd.DataFrame:
        """Fetch all users and return them as a :class:`pandas.DataFrame`."""

        response = _make_request(USERS_ENDPOINT, client=client)
        return pd.DataFrame(response.json())


    def fetch_post(
        post_id: int,
        client: Optional[Any] = None,
    ) -> dict[str, Any]:
        """Fetch a single post by ``post_id`` and return the JSON payload."""

        url = f"{POSTS_ENDPOINT}/{post_id}"
        response = _make_request(url, client=client)
        return response.json()


    def fetch_posts_by_user(
        user_id: int,
        client: Optional[Any] = None,
    ) -> pd.DataFrame:
        """Fetch posts filtered by ``user_id`` and return them as a DataFrame."""

        response = _make_request(POSTS_ENDPOINT, client=client, params={"userId": user_id})
        return pd.DataFrame(response.json())


    def _print_preview(df: pd.DataFrame, label: str) -> None:
        """Utility helper to display a DataFrame preview in the CLI demo."""

        print(f"{label} (showing up to 5 rows):")
        if df.empty:
            print("  No rows returned.")
        else:
            print(df.head())
        print("-" * 20)


    def main() -> None:
        """Simple CLI demonstration that exercises the helper functions."""

        print("--- 1. Fetching a list of users ---")
        try:
            users_df = fetch_users()
            _print_preview(users_df, "Users")
        except requests.RequestException as exc:
            print(f"Failed to fetch users: {exc}")

        print("--- 2. Fetching a single post (ID = 1) ---")
        try:
            post = fetch_post(1)
            print(f"  User ID: {post['userId']}")
            print(f"  Title: {post['title']}")
            print("-" * 20)
        except requests.RequestException as exc:
            print(f"Failed to fetch post: {exc}")

        print("--- 3. Fetching all posts by a specific user (userId = 2) ---")
        try:
            posts_df = fetch_posts_by_user(2)
            _print_preview(posts_df, "Posts for userId=2")
        except requests.RequestException as exc:
            print(f"Failed to fetch posts: {exc}")


    if __name__ == "__main__":
        main()
    ```

???+ example "solutions.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_33_API/solutions.py)

    ```python title="solutions.py"
    """
    Day 33: Solutions to Exercises
    """

    import pandas as pd
    import requests

    # --- Exercise 1: Fetch All Posts ---
    print("--- Solution to Exercise 1 ---")
    posts_url = "https://jsonplaceholder.typicode.com/posts"
    try:
        response = requests.get(posts_url)
        response.raise_for_status()
        posts_data = response.json()
        posts_df = pd.DataFrame(posts_data)
        print("DataFrame of all posts (first 5 rows):")
        print(posts_df.head())
    except requests.exceptions.RequestException as e:
        print(f"Error fetching posts: {e}")
    print("-" * 20)


    # --- Exercise 2: Fetch a Specific User's Data ---
    print("--- Solution to Exercise 2 ---")
    user_id = 5
    user_url = f"https://jsonplaceholder.typicode.com/users/{user_id}"
    try:
        response = requests.get(user_url)
        response.raise_for_status()
        user_data = response.json()
        # The 'company' value is a nested dictionary
        company_name = user_data.get("company", {}).get("name", "N/A")
        print(f"Data for User ID {user_id}:")
        print(f"  Name: {user_data.get('name', 'N/A')}")
        print(f"  Company: {company_name}")
    except requests.exceptions.RequestException as e:
        print(f"Error fetching user {user_id}: {e}")
    print("-" * 20)


    # --- Exercise 3: Fetch Comments for a Specific Post ---
    print("--- Solution to Exercise 3 ---")
    comments_url = "https://jsonplaceholder.typicode.com/comments"
    params = {"postId": 3}
    try:
        response = requests.get(comments_url, params=params)
        response.raise_for_status()
        comments_data = response.json()
        comments_df = pd.DataFrame(comments_data)
        print(f"DataFrame of comments for postId={params['postId']} (first 5 rows):")
        print(comments_df.head())
    except requests.exceptions.RequestException as e:
        print(f"Error fetching comments: {e}")
    print("-" * 20)
    ```
