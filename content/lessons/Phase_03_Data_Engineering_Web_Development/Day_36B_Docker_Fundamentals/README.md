---
day: 36B
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

**Image vs Container — the key distinction:**

| Concept | Analogy | Definition |
|---------|---------|-----------|
| **Docker Image** | Class / Blueprint | A read-only snapshot of your application and all its dependencies. Built once with `docker build`. Stored in a registry (Docker Hub, ECR). Can be shared and reused. |
| **Docker Container** | Instance / Running process | A live, running instance created FROM an image. You can have 10 containers all running from the same image. Containers are isolated, ephemeral, and disposable. |

```
docker build -t myapp:v1 .    # Creates an IMAGE from your Dockerfile
docker run myapp:v1           # Creates and starts a CONTAINER from that IMAGE
docker ps                     # Lists running CONTAINERS
docker images                 # Lists available IMAGES on your machine
```

**The lifecycle:**
1. Write a `Dockerfile` (recipe for your image)
2. `docker build` → creates an immutable image
3. `docker run` → starts a container from that image
4. Container runs your app, isolated from the host system
5. `docker stop` → stops the container (image still exists)
6. `docker rm` → removes the container (image still exists)
7. The same image can be run on any machine that has Docker installed — no more "it works on my machine"

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

**Business Scenario:** Your Phase 3 Flask/FastAPI case study app works perfectly on your laptop, but the DevOps team needs to deploy it to a Linux server. Instead of documenting every install step, you'll containerize it — one `docker build` command creates a self-contained unit that runs identically everywhere.

**Your Task:**
1. Create a `Dockerfile` in the project root
2. Use `python:3.11-slim` as the base image
3. Set the working directory to `/app`, copy your code, install requirements, and expose port 5000
4. Build: `docker build -t phase3-app:v1 .`
5. Run: `docker run -p 5000:5000 phase3-app:v1`
6. Verify: `curl http://localhost:5000/health` should return `{"status": "ok"}`

**Expected Dockerfile:**
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["python", "app.py"]
```

**Expected terminal output after `docker run`:**
```
 * Running on http://0.0.0.0:5000
 * Press CTRL+C to quit

# In a new terminal:
curl http://localhost:5000/health
{"status": "ok"}
```

### Exercise 2: Multi-Service Data Pipeline

**Business Scenario:** Your data pipeline needs three services running together: a Flask API (Python), a MongoDB database, and a Redis cache. Instead of starting each manually, `docker-compose` orchestrates all three with a single command.

**Your Task:**
1. Create `docker-compose.yml` with three services: `api`, `mongo`, `redis`
2. The `api` service builds from your local `Dockerfile`, exposes port 5000, and depends on `mongo` and `redis`
3. `mongo` uses `mongo:7.0` image, `redis` uses `redis:alpine`
4. Run: `docker-compose up`
5. Verify all services start

**Expected `docker-compose.yml` (replace any `pass` stubs — YAML does not support `pass`):**
```yaml
version: "3.8"

services:
  api:
    build: .
    ports:
      - "5000:5000"
    environment:
      - MONGO_URL=mongodb://mongo:27017/appdb
      - REDIS_URL=redis://redis:6379
    depends_on:
      - mongo
      - redis

  mongo:
    image: mongo:7.0
    volumes:
      - mongo_data:/data/db
    ports:
      - "27017:27017"

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"

volumes:
  mongo_data:
```

**Expected folder structure:**
```
project/
├── app.py
├── Dockerfile
├── docker-compose.yml
└── requirements.txt
```

**Expected terminal output after `docker-compose up`:**
```
[+] Running 3/3
 ✔ Container project-mongo-1  Started
 ✔ Container project-redis-1  Started
 ✔ Container project-api-1    Started
```

### Exercise 3: Debug a Broken Container

**Business Scenario:** A colleague pushed a broken `Dockerfile` that fails to build. You need to diagnose the error from the build output and fix it.

**Broken `Dockerfile`:**
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt    # BUG 1: Missing destination argument
RUN pip install requirements.txt  # BUG 2: Should be `pip install -r requirements.txt`
COPY . /app
EXPOSE 8080
CMD python app.py  # BUG 3: Should use exec form ["python", "app.py"] for signal handling
```

**Your Task:**
1. Identify all 3 bugs
2. Fix them in the corrected Dockerfile
3. Build successfully: `docker build -t fixed-app .`
4. Verify the build completes without errors

**Fixed `Dockerfile`:**
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .           # Fixed: added destination "."
RUN pip install -r requirements.txt  # Fixed: added -r flag
COPY . /app
EXPOSE 8080
CMD ["python", "app.py"]          # Fixed: exec form for proper signal handling
```

**Expected output after fix:**
```
Step 1/7 : FROM python:3.11-slim
 ---> a1b2c3d4e5f6
...
Step 7/7 : CMD ["python", "app.py"]
 ---> Running in abc123
Successfully built abc123def456
Successfully tagged fixed-app:latest
```

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
