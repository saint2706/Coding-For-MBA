---
day: 34
title: "Building an API"
phase: 3
phaseTitle: "Data Engineering & Web Development"
slug: "building-api"
duration: 55
difficulty: "intermediate"
tags: [python, fastapi, rest, backend]
concepts: [REST endpoints, request/response, FastAPI basics, data validation]
prerequisites: [33, 18]
outcomes: [Create REST endpoints, Handle HTTP methods, Validate request data]
---

# 🎯 Day 34: Building an API

> *"From consumer to creator. Build APIs that others will use."*

---

## The "Never-Coded" Bridge

Yesterday you consumed APIs. Today you build one. Your API can:
- Serve data to dashboards
- Power mobile apps
- Integrate systems

---

## The Technical Deep Dive

### FastAPI Basics

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Hello, World!"}

@app.get("/items/{item_id}")
def read_item(item_id: int):
    return {"item_id": item_id}

# Run with: uvicorn main:app --reload
```

### Path and Query Parameters

```python
@app.get("/products/{product_id}")
def get_product(product_id: int, category: str = None):
    return {
        "product_id": product_id,
        "category": category
    }

# GET /products/42?category=electronics
```

### Request Body (POST)

```python
from pydantic import BaseModel

class Product(BaseModel):
    name: str
    price: float
    in_stock: bool = True

@app.post("/products")
def create_product(product: Product):
    return {"created": product.dict()}

# POST with JSON body
```

### CRUD Operations

```python
products = {}

@app.get("/products")
def list_products():
    return list(products.values())

@app.get("/products/{id}")
def get_product(id: int):
    return products.get(id, {"error": "Not found"})

@app.post("/products")
def create_product(product: Product):
    id = len(products) + 1
    products[id] = product.dict()
    return {"id": id, **product.dict()}

@app.delete("/products/{id}")
def delete_product(id: int):
    if id in products:
        del products[id]
        return {"deleted": id}
    return {"error": "Not found"}
```

### Interactive Docs

FastAPI auto-generates documentation:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

---

## Hands-on Lab

```python
# Save as main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List

app = FastAPI(title="Todo API")

class Todo(BaseModel):
    title: str
    completed: bool = False

todos: List[dict] = []

@app.get("/todos")
def get_todos():
    return todos

@app.post("/todos")
def create_todo(todo: Todo):
    todos.append(todo.dict())
    return {"id": len(todos), **todo.dict()}

@app.put("/todos/{todo_id}")
def update_todo(todo_id: int, todo: Todo):
    if 0 <= todo_id < len(todos):
        todos[todo_id] = todo.dict()
        return todos[todo_id]
    raise HTTPException(status_code=404, detail="Todo not found")

# Run: uvicorn main:app --reload
# Visit: http://localhost:8000/docs
```

---

## Summary

- ✅ FastAPI creates REST endpoints
- ✅ Pydantic validates data
- ✅ Auto-generated documentation
- ✅ Type hints = better code

**Tomorrow**: Full web applications with Flask.
