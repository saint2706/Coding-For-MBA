---
day: 34
title: "Building an API"
phase: 3
phaseTitle: "Data Engineering & Web Development"
slug: "building-api"
duration: 55
difficulty: "intermediate"
tags: [python, fastapi, rest, backend]
concepts: [REST endpoints, HTTP methods, request validation, Pydantic]
prerequisites: [33]
outcomes: [Build REST APIs with FastAPI, Validate requests with Pydantic, Handle CRUD operations]
---

# 🎯 Day 34: Building an API with FastAPI

> *"Yesterday you consumed APIs. Today you build them."*

---

## The "Never-Coded" Bridge

**Imagine your data team builds amazing models.** They work in Jupyter notebooks. But how do other teams use them? They can't all run Python notebooks.

**APIs expose your work to the world.** Your model becomes a service anyone can call—from mobile apps, websites, other services, or automated pipelines.

**What you're building:**

- Endpoints other programs can call
- Input validation to catch bad requests
- Structured responses everyone can understand

**Real-world examples:**

- Stripe's payment API
- Twilio's messaging API
- Your internal ML model serving predictions

---

## The Technical Deep Dive

### FastAPI Basics

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Hello, World!"}

@app.get("/items/{item_id}")
def get_item(item_id: int):
    return {"item_id": item_id}

# Run with: uvicorn main:app --reload
```

### Path and Query Parameters

```python
from fastapi import FastAPI

app = FastAPI()

# Path parameter
@app.get("/users/{user_id}")
def get_user(user_id: int):
    return {"user_id": user_id}

# Query parameter
@app.get("/search")
def search(q: str, limit: int = 10):
    return {"query": q, "limit": limit}

# Combined
@app.get("/users/{user_id}/items")
def get_user_items(user_id: int, skip: int = 0, limit: int = 10):
    return {"user_id": user_id, "skip": skip, "limit": limit}
```

### Request Bodies with Pydantic

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Item(BaseModel):
    name: str
    price: float
    description: str = None

@app.post("/items")
def create_item(item: Item):
    return {"name": item.name, "price": item.price}

# Request validation automatic!
# {"name": "Widget", "price": 9.99} -> Valid
# {"name": "Widget"} -> Error: price required
# {"name": "Widget", "price": "abc"} -> Error: price must be float
```

### CRUD Operations

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

# In-memory database (use real DB in production)
items_db = {}

class Item(BaseModel):
    name: str
    price: float

# CREATE
@app.post("/items/{item_id}")
def create_item(item_id: int, item: Item):
    if item_id in items_db:
        raise HTTPException(status_code=400, detail="Item exists")
    items_db[item_id] = item
    return {"id": item_id, **item.dict()}

# READ
@app.get("/items/{item_id}")
def get_item(item_id: int):
    if item_id not in items_db:
        raise HTTPException(status_code=404, detail="Not found")
    return items_db[item_id]

# UPDATE
@app.put("/items/{item_id}")
def update_item(item_id: int, item: Item):
    if item_id not in items_db:
        raise HTTPException(status_code=404, detail="Not found")
    items_db[item_id] = item
    return {"id": item_id, **item.dict()}

# DELETE
@app.delete("/items/{item_id}")
def delete_item(item_id: int):
    if item_id not in items_db:
        raise HTTPException(status_code=404, detail="Not found")
    del items_db[item_id]
    return {"deleted": item_id}
```

---

## Senior-Level Insights

### HTTP Methods and REST

| Method | Purpose             | Idempotent |
| ------ | ------------------- | ---------- |
| GET    | Retrieve data       | Yes        |
| POST   | Create new resource | No         |
| PUT    | Replace resource    | Yes        |
| PATCH  | Partial update      | No         |
| DELETE | Remove resource     | Yes        |

**Idempotent** = Multiple identical requests have same effect as one.

### Status Codes to Use

| Scenario            | Code |
| ------------------- | ---- |
| Success             | 200  |
| Created             | 201  |
| No Content (DELETE) | 204  |
| Bad Request         | 400  |
| Unauthorized        | 401  |
| Forbidden           | 403  |
| Not Found           | 404  |
| Server Error        | 500  |

### Validation Best Practices

```python
from pydantic import BaseModel, Field, validator

class User(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: str
    age: int = Field(..., ge=0, le=150)
    
    @validator("email")
    def validate_email(cls, v):
        if "@" not in v:
            raise ValueError("Invalid email")
        return v
```

---

## Hands-on Lab

### Exercise 1: Todo API

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional

app = FastAPI()

class Todo(BaseModel):
    title: str
    completed: bool = False

todos = {}

@app.post("/todos")
def create_todo(todo: Todo):
    todo_id = len(todos) + 1
    todos[todo_id] = todo
    return {"id": todo_id, **todo.dict()}

@app.get("/todos")
def list_todos():
    return list(todos.values())

@app.get("/todos/{todo_id}")
def get_todo(todo_id: int):
    if todo_id not in todos:
        raise HTTPException(404, "Todo not found")
    return todos[todo_id]

@app.put("/todos/{todo_id}")
def update_todo(todo_id: int, todo: Todo):
    if todo_id not in todos:
        raise HTTPException(404, "Todo not found")
    todos[todo_id] = todo
    return {"id": todo_id, **todo.dict()}

@app.delete("/todos/{todo_id}")
def delete_todo(todo_id: int):
    if todo_id not in todos:
        raise HTTPException(404, "Todo not found")
    del todos[todo_id]
    return {"deleted": todo_id}
```

### Exercise 2: Calculator API

```python
from fastapi import FastAPI, Query

app = FastAPI()

@app.get("/add")
def add(a: float = Query(...), b: float = Query(...)):
    return {"result": a + b}

@app.get("/multiply")
def multiply(a: float = Query(...), b: float = Query(...)):
    return {"result": a * b}

@app.get("/calculate")
def calculate(operation: str, a: float, b: float):
    operations = {
        "add": a + b,
        "subtract": a - b,
        "multiply": a * b,
        "divide": a / b if b != 0 else None
    }
    if operation not in operations:
        raise HTTPException(400, f"Unknown operation: {operation}")
    return {"operation": operation, "result": operations[operation]}
```

### Exercise 3: User Registration

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, EmailStr, validator

app = FastAPI()

class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    
    @validator("username")
    def username_valid(cls, v):
        if len(v) < 3:
            raise ValueError("Username must be 3+ characters")
        return v
    
    @validator("password")
    def password_strong(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be 8+ characters")
        return v

users = {}

@app.post("/register")
def register(user: UserCreate):
    if user.username in users:
        raise HTTPException(400, "Username taken")
    users[user.username] = user
    return {"message": f"User {user.username} created"}

@app.get("/users/{username}")
def get_user(username: str):
    if username not in users:
        raise HTTPException(404, "User not found")
    user = users[username]
    return {"username": user.username, "email": user.email}
```

---

## Mastery Check

### Question 1: GET vs POST

When do you use GET vs POST?

<details>
<summary>Click for Answer</summary>

**GET:**

- Retrieving data
- No side effects
- Parameters in URL
- Cacheable
- Example: `/users/123`

**POST:**

- Creating new resources
- Sending data in body
- Not cacheable
- Example: Create new user

</details>

### Question 2: Validation

Why use Pydantic instead of checking manually?

<details>
<summary>Click for Answer</summary>

Pydantic provides:

- Automatic type conversion (`"123"` → `123`)
- Clear error messages
- Documentation generation
- Less boilerplate code

```python
# Manual (verbose, error-prone)
if "name" not in data:
    raise HTTPException(400, "name required")
if not isinstance(data["name"], str):
    raise HTTPException(400, "name must be string")

# Pydantic (automatic)
class Item(BaseModel):
    name: str  # All validation handled
```

</details>

### Question 3: Idempotency

Why does PUT return 200 but POST returns 201?

<details>
<summary>Click for Answer</summary>

- **POST 201 (Created)**: New resource was created at a new URI
- **PUT 200 (OK)**: Resource was replaced/updated at existing URI

PUT is idempotent—calling it multiple times has same effect.
POST is not—each call might create a new resource.

</details>

### Question 4: Error Handling

This endpoint crashes on missing ID. Fix it:

```python
@app.get("/items/{item_id}")
def get_item(item_id: int):
    return items_db[item_id]
```

<details>
<summary>Click for Answer</summary>

```python
@app.get("/items/{item_id}")
def get_item(item_id: int):
    if item_id not in items_db:
        raise HTTPException(status_code=404, detail="Item not found")
    return items_db[item_id]
```

</details>

### Question 5: Design

You're building an API for a bookstore. What endpoints would you create?

<details>
<summary>Click for Answer</summary>

```
GET    /books              # List all books
GET    /books/{id}         # Get single book
POST   /books              # Create book
PUT    /books/{id}         # Update book
DELETE /books/{id}         # Delete book

GET    /books?author=X     # Filter by author
GET    /books?genre=Y      # Filter by genre

GET    /authors            # List authors
GET    /authors/{id}/books # Books by author
```

REST convention: Resources as nouns, HTTP methods as verbs.

</details>

---

## Summary

- ✅ FastAPI for quick, type-safe APIs
- ✅ Path and query parameters
- ✅ Request validation with Pydantic
- ✅ CRUD operations with proper status codes
- ✅ Error handling with HTTPException

**Tomorrow**: Full web applications with Flask.
