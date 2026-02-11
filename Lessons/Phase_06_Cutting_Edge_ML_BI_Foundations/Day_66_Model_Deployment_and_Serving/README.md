---
day: 66
title: "Model Deployment & Serving"
phase: 6
phaseTitle: "Cutting-Edge ML & BI Foundations"
slug: "model-deployment"
duration: 120
difficulty: "advanced"
tags:
  - mlops
  - deployment
  - fast-api
  - docker
  - serverless
concepts:
  - "REST APIs"
  - "containerization (Docker)"
  - "batch vs real-time"
  - "serverless inference"
  - "canary deployment"
prerequisites:
  - "Basic Python"
  - "Model serialization (.pkl knowledge)"
  - "Command Line Basics"
outcomes:
  - "Build a real-time prediction API using FastAPI"
  - "Containerize a model service with Docker"
  - "Understand trade-offs between Batch and Online serving"
---

# 🎯 Day 66: Model Deployment & Serving

> *"If a tree falls in a forest and no one hears it, does it make a sound? If a model trains in a notebook and no one uses it, does it create value?"*

---

## The "Never-Coded" Bridge

**Imagine you run a burger joint.**

**Scenario A: The Food Truck (Real-Time API)**

* A customer walks up and orders "One Cheeseburger."
* You make *that specific burger* right then and there.
* **Pros**: Fresh (latest data), Custom (personalized).
* **Cons**: Customer has to wait (Latency). If 1,000 people show up at once, you crash (Concuprency limits).

**Scenario B: The Catering Service (Batch Processing)**

* You get an order: "500 burgers for lunch at 12:00."
* You make all 500 in advance.
* **Pros**: Efficient (High Throughput). No waiting at lunch time (Low Latency for serving).
* **Cons**: Stale (Old data). If someone changes their mind at 11:55, it's too late.

**Model Deployment** is deciding whether your AI should be a Food Truck (API) or a Catering Service (Batch).

---

## The Technical Deep Dive

### 1. Real-Time Serving (REST APIs)

The standard way to serve a model is wrapping it in a web server (like **FastAPI** or **Flask**).

* **Request**: `POST /predict {"age": 30, "income": 50k}`
* **Response**: `{"approved": true, "confidence": 0.95}`
* **Use Case**: Credit card fraud detection (User is swiping card NOW), Chatbot.

### 2. Batch Serving (Offline Inference)

Run a script every night.

* **Input**: `users_db_dump.csv`
* **Process**: Iterate through 1M rows, predict churn risk.
* **Output**: `churn_risk_YYYY_MM_DD.csv`
* **Use Case**: Email marketing recommendations (Send tomorrow morning), Credit Limit updates.

### 3. Containerization (Docker)

**"It works on my machine!"** -> **"Then we'll ship your machine."**
Docker packages your code + libraries + OS settings into a "Container."

* **Dockerfile**: The recipe (Install Python, Install Pandas, Copy Code, Run App).
* **Image**: The cooked meal (frozen snapshot).
* **Container**: The meal being eaten (running instance).

### 4. Serverless (Function-as-a-Service)

Upload your code to AWS Lambda / Google Cloud Functions.

* **Benefits**: Zero servers to manage. Auto-scales from 0 to 10,000 requests.
* **Drawbacks**: "Cold Starts" (Wait 5s for the first request to wake up).

---

## Senior-Level Insights

### The "Shadow Mode" Pattern

**Never deploy a new model directly to users.**

1. **Old Model (Control)**: Making live decisions.
2. **New Model (Shadow)**: Receiving the same data, making predictions, but **WE THROW THEM AWAY**.
3. **Log Results**: Compare Shadow predictions to reality. Only promote when it beats the Old Model consistently for 2 weeks.

### Cost vs. Latency Trade-off

| Architecture               | Latency                | Cost                                | Maintenance | Use Case                       |
| :------------------------- | :--------------------- | :---------------------------------- | :---------- | :----------------------------- |
| **Serverless**             | Variable (Cold Starts) | Pay-per-use (Cheap for low traffic) | Low         | Low-traffic APIs, Prototypes   |
| **Dedicated Server (EC2)** | Consistent (Fast)      | Fixed (Expensive if idle)           | Medium      | High-traffic Real-time         |
| **Batch Job**              | Hours (Slow)           | Cheapest (Spot Instances)           | Low         | Recommendations, Fraud Reports |

---

## Hands-on Lab

### Exercise 1: Building a Prediction API

**Goal**: Create a standard FastAPI endpoint.

**Scenario**: A simple endpoint that adds two numbers (simulating a model).

```python
# Save as main.py
# Run with: uvicorn main:app --reload
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

# 1. Define Input Schema (Data Validation)
class InputData(BaseModel):
    feature_a: float
    feature_b: float

# 2. Define Endpoint
@app.post("/predict")
def predict(data: InputData):
    # Simulate model
    prediction = (data.feature_a * 2) + data.feature_b
    return {"result": prediction, "status": "success"}

# To test (Python client):
# import requests
# resp = requests.post("http://localhost:8000/predict", json={"feature_a": 10, "feature_b": 5})
# print(resp.json())
```

**Expected Client Output**:

```json
{"result": 25.0, "status": "success"}
```

---

### Exercise 2: Writing a Dockerfile

**Goal**: Containerize the API above.

**Scenario**: You need to hand this off to the Ops team. They don't know Python.

```dockerfile
# 1. Base Image (OS + Python)
FROM python:3.9-slim

# 2. Set Working Directory
WORKDIR /app

# 3. Copy Requirements & Install (Cache Layering)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 4. Copy Code
COPY main.py .

# 5. Command to run
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "80"]
```

**Task**: Explain line 3. Why copy `requirements.txt` separate from code?

* *Answer*: Docker caches layers. If you change your code (`main.py`) but not your libraries, Docker skips the slow `pip install` step. This makes builds fast.

---

### Exercise 3: Simulating Batch Processing

**Goal**: Process a list of "users" and save results.

```python
import pandas as pd
import time

# Fake Model
def predict_churn(usage):
    time.sleep(0.01) # Simulate computation
    return 1 if usage < 5 else 0

# Input Data
users = pd.DataFrame({
    'user_id': range(1, 101),
    'usage_hours': [x % 10 for x in range(100)] # 0 to 9 repeating
})

print("Starting Batch Job...")
start_time = time.time()

# Processing
users['churn_pred'] = users['usage_hours'].apply(predict_churn)

duration = time.time() - start_time
print(f"Processed {len(users)} records in {round(duration, 2)} seconds.")
print(users.head())

# Save
# users.to_csv("daily_batch_predictions.csv", index=False)
```

**Expected Output**:

```text
Starting Batch Job...
Processed 100 records in 1.05 seconds.
   user_id  usage_hours  churn_pred
0        1            0           1
1        2            1           1
2        3            2           1
3        4            3           1
4        5            4           1
...
```

---

## Mastery Check

### Question 1: Latency

You are building an AI for a self-driving car. Which serving pattern do you use?
A) Batch Processing (Nightly)
B) Cloud API (REST)
C) Edge Inference (On the device/car)
D) Serverless

<details>
<summary>Click for Answer</summary>

**Answer: C**
Edge. You cannot wait 500ms for a round-trip to the cloud to decide if you should brake. The internet might disconnect.
</details>

### Question 2: Docker

What is the main advantage of Docker in MLOps?
A) It makes the model more accurate.
B) It guarantees the environment (libraries, OS) is identical in Dev and Prod.
C) It uses less RAM than running natively.
D) It automatically trains models.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Reproducibility of the environment.
</details>

### Question 3: Batch vs API

You need to recommend movies to user based on their history. The recommendations only update once a day. Which pattern is best?
A) Real-Time API
B) Batch Pre-computation
C) Streaming
D) Manual Entry

<details>
<summary>Click for Answer</summary>

**Answer: B**
Batch. It's cheaper and faster to retrieve pre-calculated results from a database than to run the model every time the user visits the homepage.
</details>

### Question 4: Shadow Mode

What is the purpose of "Shadow Mode" deployment?
A) To hide the model from hackers.
B) To test the model on live data without showing predictions to users (Risk-free evaluation).
C) To run the model on a dark theme UI.
D) To train the model faster.

<details>
<summary>Click for Answer</summary>

**Answer: B**
It allows safe testing of a new model version against production traffic.
</details>

### Question 5: Serialization

What file format is commonly used to "freeze" a Python model for deployment?
A) .txt
B) .pkl (Pickle) or .joblib or .onnx
C) .exe
D) .jpg

<details>
<summary>Click for Answer</summary>

**Answer: B**
Serialization saves the model object's state (weights/parameters) to a file.
</details>

---

## Summary

Today you learned:

* ✅ **Real-Time (API)** vs **Batch** is the fundamental architectural choice.
* ✅ **Docker** solves the "It works on my machine" problem.
* ✅ **FastAPI** is the modern standard for Python model serving.
* ✅ **Shadow Mode** is how pros deploy without breaking things.

**Tomorrow**: We look at what happens *after* deployment with **Model Monitoring & Reliability**.
