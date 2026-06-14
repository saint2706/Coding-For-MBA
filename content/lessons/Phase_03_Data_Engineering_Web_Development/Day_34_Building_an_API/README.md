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

### Why FastAPI Uses Python Type Hints

FastAPI is built on two core Python libraries that transform type hints into superpowers:

**Pydantic** (data validation): When you define a function parameter as `price: float`, Pydantic automatically:
- Rejects requests that send a string like `"not a number"` (returns a `422 Unprocessable Entity` error with a clear message)
- Coerces compatible types: `"42"` → `42.0`
- Generates a JSON schema showing exactly what the endpoint expects

**Python type hints → automatic documentation**: FastAPI reads your type hints and generates an interactive **Swagger UI** at `/docs` and a **ReDoc** UI at `/redoc` — with zero extra work. Every parameter, its type, and its description is automatically documented.

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Product(BaseModel):
    name: str
    price: float
    quantity: int = 0  # Default value

@app.post("/products")
def create_product(product: Product):
    # FastAPI automatically:
    # 1. Parses the JSON request body
    # 2. Validates types (price must be float, quantity must be int)
    # 3. Returns 422 if validation fails — before your code even runs
    # 4. Documents this endpoint in Swagger UI at /docs
    return {"message": f"Created {product.name}", "id": 42}
```

**Navigate to `http://127.0.0.1:8000/docs` after starting the server** — you'll see a fully interactive API explorer with no extra setup.

**`dict` vs Pydantic model in responses:**
- Returning a `dict` works but bypasses Pydantic validation on output
- Defining a `response_model=ProductResponse` in the decorator tells FastAPI to validate the response shape too, automatically filtering out any fields not in the model (useful for hiding internal database IDs or passwords)

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

### Deployment-Ready Baseline (FastAPI)

**API contract tests (minimum set):**

- Happy path: valid request returns expected status + response shape.
- Validation failure: invalid type/missing field returns `422` with stable error keys.

```python
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_create_item_happy_path():
    r = client.post("/items", json={"name": "Pen", "price": 1.5})
    assert r.status_code == 200
    assert r.json()["name"] == "Pen"


def test_create_item_validation_error():
    r = client.post("/items", json={"name": "Pen", "price": "bad"})
    assert r.status_code == 422
    assert "detail" in r.json()
```

**Structured logging with request IDs:**

```python
import logging, uuid
from fastapi import Request

logger = logging.getLogger("api")


@app.middleware("http")
async def add_request_context(request: Request, call_next):
    req_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
    response = await call_next(request)
    response.headers["X-Request-ID"] = req_id
    logger.info("request_complete", extra={"request_id": req_id, "path": request.url.path, "status": response.status_code})
    return response
```

**Security baseline (Phase 3 level):**

- Validate all external input with Pydantic constraints (length, bounds, formats).
- Keep secrets in env vars (`DATABASE_URL`, `API_KEY`), never in source.
- If browser clients call your API, allow only trusted CORS origins + needed methods.
- Return safe client errors; log technical context internally with request IDs.

---

## Hands-on Lab

### Exercise 1: Todo API

**Business Scenario:** Your team needs a simple task management API as the backend for a project management tool. The MVP needs four endpoints: list all tasks, get one task, create a task, and mark a task as done.

**Your Task:**
1. Build a FastAPI app with an in-memory `todos` list (a Python list of dicts)
2. Implement: `GET /todos` (list all), `GET /todos/{id}` (get one), `POST /todos` (create), `PATCH /todos/{id}/complete` (mark done)
3. Use a Pydantic model for the create request body
4. Run the server: `uvicorn main:app --reload`

**Testing with curl:**
```bash
# Create a task
curl -X POST "http://localhost:8000/todos" \
     -H "Content-Type: application/json" \
     -d '{"title": "Prepare board presentation", "priority": "high"}'

# List all tasks
curl "http://localhost:8000/todos"

# Mark as done
curl -X PATCH "http://localhost:8000/todos/1/complete"
```

**Expected Output (from `GET /todos` after the above):**
```json
[
  {
    "id": 1,
    "title": "Prepare board presentation",
    "priority": "high",
    "completed": true
  }
]
```

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

**Business Scenario:** A financial modeling team needs a calculator microservice that other applications (Excel macros, Python scripts, a dashboard) can call via HTTP. The service must accept two numbers and an operation, validate inputs, and return the result with proper error handling for division by zero.

**Your Task:**
1. Create `GET /calculate?a=10&b=5&op=multiply` (use query parameters)
2. Support operations: `add`, `subtract`, `multiply`, `divide`
3. Return `{"result": 50}` for valid inputs
4. Return `HTTP 400` with a message for invalid operations or division by zero
5. Return `HTTP 422` automatically for non-numeric inputs (handled by FastAPI type hints)

**Expected Output:**
```bash
curl "http://localhost:8000/calculate?a=10&b=5&op=multiply"
# → {"result": 50.0}

curl "http://localhost:8000/calculate?a=10&b=0&op=divide"
# → {"error": "Division by zero is not allowed"}  (HTTP 400)

curl "http://localhost:8000/calculate?a=10&b=5&op=power"
# → {"detail": "Operation must be one of: add, subtract, multiply, divide"}  (HTTP 400)
```

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
        "divide": a / b if b != 0 else None,
    }
    if operation not in operations:
        raise HTTPException(400, f"Unknown operation: {operation}")
    return {"operation": operation, "result": operations[operation]}
```

### Exercise 3: User Registration

**Business Scenario:** You're building the backend for a SaaS application's signup flow. The endpoint must validate that the email is unique (no duplicate registrations), the password meets minimum requirements, and the response never returns the stored password hash.

**Your Task:**
1. Define `UserCreate` Pydantic model: `email: str`, `name: str`, `password: str`
2. Define `UserResponse` Pydantic model: `id: int`, `email: str`, `name: str` (no password field)
3. `POST /users` — create a new user; reject if email already exists (HTTP 409)
4. `GET /users/{id}` — return user info using `UserResponse` (automatically hides password)
5. Simulate password hashing: `hashed = "hashed_" + password`

**Expected Output:**
```bash
curl -X POST "http://localhost:8000/users" \
     -H "Content-Type: application/json" \
     -d '{"email": "alice@example.com", "name": "Alice", "password": "secret123"}'
# → {"id": 1, "email": "alice@example.com", "name": "Alice"}  ← password hidden!

# Try duplicate email:
curl -X POST "http://localhost:8000/users" \
     -H "Content-Type: application/json" \
     -d '{"email": "alice@example.com", "name": "Alice2", "password": "other"}'
# → {"detail": "Email already registered"}  (HTTP 409)
```

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

### Reliability & Maintainability Tasks

- Define an input validation matrix per route (query params, body fields, edge constraints, unsafe input).
- Add status-code contract tests covering expected responses and stable error models.
- Implement first-class pagination and rate-limit behavior, including documented headers and client guidance.

### Exercise 4: Failure Injection — Contract Break Regression

**Business Scenario:** A colleague has written a FastAPI endpoint that is supposed to return product data matching a specific price range. The code has a **contract break** — the Pydantic response model says `price` should be a `float`, but the code returns it as a string. Debug and fix it.

**Starter Code (Broken):**
```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class ProductResponse(BaseModel):
    id: int
    name: str
    price: float  # Contract: price must be a float

# Simulated database
products_db = [
    {"id": 1, "name": "Laptop", "price": "999.99"},   # BUG: price stored as string
    {"id": 2, "name": "Mouse", "price": "29.99"},      # BUG: same issue
]

@app.get("/products/{product_id}", response_model=ProductResponse)
def get_product(product_id: int):
    for p in products_db:
        if p["id"] == product_id:
            return p  # FastAPI will try to coerce "999.99" → 999.99 via Pydantic
    return {"error": "Not found"}  # BUG: Should raise HTTPException, not return a dict
```

**Your Task:**
1. Run the broken code. What happens when you call `GET /products/1`? Does Pydantic coerce the string to float, or does it fail?
2. What happens when you call `GET /products/99` (non-existent product)? Why is the current error response wrong?
3. Fix both bugs:
   - Convert price strings to floats in the database (or in the query logic)
   - Raise `HTTPException(status_code=404, detail="Product not found")` instead of returning a dict

**Expected Output after fix:**
```bash
curl "http://localhost:8000/products/1"
# → {"id": 1, "name": "Laptop", "price": 999.99}

curl "http://localhost:8000/products/99"
# → {"detail": "Product not found"}  (HTTP 404)
```

### Exercise 5: Definition of Done (DoD) Drill

For one endpoint you built today, ship it only when all boxes are checked:

- [ ] Contract tests include one happy path and one validation failure.
- [ ] Logs include `request_id`, route, status, and one error-context field.
- [ ] Input constraints are explicit (type + range/length rules).
- [ ] Secrets come from env vars (no hardcoded tokens/passwords).
- [ ] CORS policy is explicit (no wildcard in production intent).
- [ ] API docs show success + error examples.

Reuse this checklist in later MLOps phases as your minimum release gate.

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
