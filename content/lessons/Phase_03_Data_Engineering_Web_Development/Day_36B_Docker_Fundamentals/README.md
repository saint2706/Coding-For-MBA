---
day: 36
title: "Docker Fundamentals"
phase: 3
phaseTitle: "Data Engineering & Web Development"
slug: "docker-fundamentals"
duration: 120
difficulty: "intermediate"
tags:
  - docker
  - containers
  - devops
  - fastapi
  - deployment
concepts:
  - "containers vs virtual machines"
  - "Dockerfile"
  - "docker-compose"
  - "image layers"
  - "environment reproducibility"
prerequisites:
  - "Day 35: Flask Web Framework"
  - "Day 34: Building an API"
outcomes:
  - "Write a Dockerfile to containerize a Python application"
  - "Run a multi-service app with docker-compose"
  - "Understand why containers solve the 'it works on my machine' problem"
---

# 🐳 Day 36B: Docker Fundamentals

> *"Docker is the answer to 'it works on my machine.' It makes your machine portable."*

---

## The "Never-Coded" Bridge

**Imagine shipping furniture from IKEA.**

Without containers (the old way): You disassemble a wardrobe, throw all the pieces in the back of a truck, and hope the movers can reassemble it at the destination. But their truck size is different. Half the pieces are missing. It takes days.

**With Docker containers**: IKEA ships the wardrobe pre-assembled in a standardized container. The container fits on any ship, any truck, any warehouse, in any country. It arrives exactly as shipped.

**Docker containerizes your application** — Python version, libraries, config files, all bundled together — and runs identically on your laptop, your colleague's Mac, your CI server, and production AWS.

This is **why Phase 5's MLOps (Day 50 & 65) uses Docker** — it's the universal packaging format for deploying ML models.

---

## The Technical Deep Dive

### 1. Containers vs Virtual Machines

```
Virtual Machine:                Container:
┌─────────────────────┐        ┌─────────────────────┐
│   Your App          │        │   Your App           │
│   Python 3.11       │        │   Python 3.11        │
│   Libraries         │        │   Libraries          │
├─────────────────────┤        ├─────────────────────┤
│   Guest OS (Ubuntu) │        │   [No Guest OS!]     │
├─────────────────────┤        ├─────────────────────┤
│   Hypervisor        │        │   Docker Engine      │
├─────────────────────┤        ├─────────────────────┤
│   Host OS           │        │   Host OS            │
└─────────────────────┘        └─────────────────────┘
Size: 20GB+, Starts in 30s     Size: 200MB, Starts in 1s
```

Containers share the host OS kernel — they're lighter, faster, and more portable.

### 2. Dockerfile — The Recipe

A `Dockerfile` is a set of instructions for building a container image:

```dockerfile
# Start from an official Python image
FROM python:3.11-slim

# Set working directory inside the container
WORKDIR /app

# Copy requirements first (layer caching optimization)
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Expose the port the app runs on
EXPOSE 8000

# Command to run when container starts
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 3. Building and Running

```bash
# Build image from Dockerfile in current directory
docker build -t my-data-api:v1 .

# Run the container
docker run -p 8000:8000 my-data-api:v1
#              ↑        ↑
#        host port   container port

# Run in background
docker run -d -p 8000:8000 --name my-api my-data-api:v1

# View running containers
docker ps

# View logs
docker logs my-api

# Stop container
docker stop my-api
```

### 4. docker-compose — Multi-Service Apps

Real apps have multiple services (web app + database + cache). `docker-compose.yml` orchestrates them:

```yaml
version: "3.9"

services:
  # Your FastAPI app
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/mydb
      - REDIS_URL=redis://cache:6379
    depends_on:
      - db
      - cache
    volumes:
      - ./data:/app/data  # Mount local data directory

  # PostgreSQL database
  db:
    image: postgres:15
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=mydb
    volumes:
      - postgres_data:/var/lib/postgresql/data  # Persist data

  # Redis cache
  cache:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

```bash
# Start all services
docker-compose up -d

# View all service logs
docker-compose logs -f

# Stop all services  
docker-compose down

# Stop and remove volumes (fresh start)
docker-compose down -v
```

### 5. Containerizing Our Flask API (from Day 35)

```
flask-api/
├── app.py
├── requirements.txt
└── Dockerfile
```

```python
# app.py (from Day 35)
from flask import Flask, jsonify
app = Flask(__name__)

@app.route("/predict", methods=["POST"])
def predict():
    return jsonify({"prediction": 0.87, "model": "v1"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
```

```
# requirements.txt
flask==3.0.0
gunicorn==21.2.0
```

```dockerfile
# Dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app.py .
EXPOSE 5000
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
```

```bash
docker build -t flask-predictor:v1 .
docker run -d -p 5000:5000 flask-predictor:v1
curl http://localhost:5000/predict -X POST
# {"prediction": 0.87, "model": "v1"}
```

---

## Senior-Level Insights

### Image Layer Caching

Docker caches each layer. Put rarely-changing instructions first:

```dockerfile
# ✅ GOOD: requirements.txt copied first (rarely changes)
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .  # Code changes frequently — only this layer rebuilds

# ❌ BAD: Everything rebuilds when code changes
COPY . .
RUN pip install -r requirements.txt
```

### The `.dockerignore` File

Like `.gitignore` — prevents bloating the image:

```
# .dockerignore
__pycache__/
*.pyc
.env
.git
node_modules/
*.egg-info/
dist/
venv/
```

### Environment Variables for Secrets

Never hardcode secrets in Dockerfiles. Use environment variables:

```bash
# ❌ Never do this
ENV API_KEY=sk-abc123

# ✅ Pass at runtime
docker run -e API_KEY=$MY_API_KEY my-app
# Or use a .env file with docker-compose
```

---

## Hands-on Lab

### Exercise 1: Containerize the Phase 3 Case Study

Take the Flask/FastAPI app you built in Day 35 or 36 and containerize it:

1. Write a `Dockerfile` following the template above
2. Build the image: `docker build -t phase3-app:v1 .`
3. Run and verify: `docker run -p 5000:5000 phase3-app:v1`
4. Test with `curl` or Postman

### Exercise 2: Multi-Service Data Pipeline

Write a `docker-compose.yml` for this architecture:
- A Python script that scrapes data (your Day 30 web scraper)
- A PostgreSQL database to store records
- pgAdmin for database inspection (use `dpage/pgadmin4` image)

```yaml
version: "3.9"
services:
  scraper:
    # TODO: build from Dockerfile
    # TODO: set environment variable for DB connection
    pass
  db:
    # TODO: use postgres:15 image
    # TODO: set credentials via environment variables
    pass
  pgadmin:
    # TODO: use dpage/pgadmin4 image
    # TODO: expose on port 5050
    pass
```

### Exercise 3: Debug a Broken Container

The following Dockerfile has 3 bugs. Find and fix them:

```dockerfile
FROM python3.11-slim          # Bug 1
WORKDIR app                   # Bug 2  
copy requirements.txt .       # Bug 3
RUN pip install -r requirements.txt
COPY . /app
EXPOSE 8000
CMD uvicorn main:app --host 0.0.0.0 --port 8000
```

---

## Mastery Check

**Q1**: Why are containers faster to start than virtual machines?
<details><summary>Answer</summary>
Containers share the host OS kernel — they don't need to boot a full guest operating system. A container starts in milliseconds to seconds. A VM takes 30–60 seconds to boot.
</details>

**Q2**: What is the purpose of `WORKDIR` in a Dockerfile?
<details><summary>Answer</summary>
Sets the working directory for all subsequent instructions (COPY, RUN, CMD). All relative paths are resolved from this directory. Prevents files from piling up in the root filesystem.
</details>

**Q3**: You changed a single line in `app.py`. Which Docker layers will rebuild?
<details><summary>Answer</summary>
Only the `COPY . .` layer and everything after it. This is why you copy `requirements.txt` and install dependencies BEFORE copying application code — the slow `pip install` step is cached.
</details>

**Q4**: What does `-p 8000:8000` do in `docker run`?
<details><summary>Answer</summary>
Maps port 8000 on the host machine to port 8000 inside the container. Format is `host_port:container_port`. Without this, the container's port is not accessible from outside.
</details>

**Q5**: Why does the `db` service in docker-compose need a named volume (`postgres_data`)?
<details><summary>Answer</summary>
Containers are ephemeral — when they stop, all data inside is lost. A named volume persists data to the host filesystem, so the database survives container restarts. Without it, every `docker-compose down` would wipe all your data.
</details>

---

## Summary

- ✅ **Containers = portable, reproducible environments**: Solve "works on my machine" forever
- ✅ **Dockerfile**: Instructions for building your container image
- ✅ **docker-compose**: Orchestrate multi-service apps (web + db + cache)
- ✅ **Layer caching**: Copy requirements before code for fast rebuilds

**Tomorrow → Day 36 (Case Study)** and then **Phase 4**!

> 🔗 **Forward reference**: Docker is used extensively in **Phase 5 Day 50 (MLOps)** and **Phase 5 Day 66 (Model Deployment)**. You'll containerize ML models, build Docker-based training pipelines, and deploy to Kubernetes.
