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
