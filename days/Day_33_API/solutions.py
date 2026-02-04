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
