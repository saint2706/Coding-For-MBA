---
day: 36
title: "Case Study: ETL Pipeline"
phase: 3
phaseTitle: "Data Engineering & Web Development"
slug: "case-study-etl"
duration: 60
difficulty: "intermediate"
tags: [python, etl, pipeline, integration]
concepts: [ETL pipelines, data integration, automation, end-to-end projects]
prerequisites: [25, 27, 31, 33]
outcomes: [Build complete ETL pipelines, Integrate APIs with databases, Create data dashboards]
---

# 🎯 Day 36: Case Study - Complete ETL Pipeline

> *"The capstone: Extract, Transform, Load—then visualize."*

---

## The "Never-Coded" Bridge

**All month you've learned individual skills.** Cleaning data. Visualizations. APIs. Databases. Flask.

**Now you combine them all.** A real data pipeline:
1. **Extract**: Fetch data from an API
2. **Transform**: Clean and reshape it
3. **Load**: Store in a database
4. **Serve**: Display via web dashboard

**This is what data engineers actually do.** Every company needs pipelines that automatically gather, process, and present data.

---

## The Technical Deep Dive

### Pipeline Architecture

```
API Source → Extract → Transform → Load → Database → Dashboard
               ↓           ↓          ↓
            requests    pandas    sqlite3
               ↓           ↓          ↓
            raw JSON   cleaned DF  stored data
```

### Step 1: Extract

```python
import requests
import pandas as pd

def extract_data(url):
    """Extract data from API."""
    response = requests.get(url, timeout=10)
    response.raise_for_status()
    data = response.json()
    print(f"Extracted {len(data)} records")
    return data

# Example: Using JSONPlaceholder (fake API)
url = "https://jsonplaceholder.typicode.com/users"
raw_data = extract_data(url)
```

### Step 2: Transform

```python
import pandas as pd

def transform_data(raw_data):
    """Clean and transform raw data."""
    df = pd.DataFrame(raw_data)
    
    # Select relevant columns
    df = df[["id", "name", "email", "company"]]
    
    # Flatten nested structure
    df["company_name"] = df["company"].apply(lambda x: x["name"])
    df = df.drop("company", axis=1)
    
    # Clean text
    df["email"] = df["email"].str.lower()
    df["name"] = df["name"].str.strip()
    
    # Validate
    df = df.dropna()
    df = df.drop_duplicates(subset=["email"])
    
    print(f"Transformed to {len(df)} clean records")
    return df

clean_df = transform_data(raw_data)
print(clean_df.head())
```

### Step 3: Load

```python
import sqlite3

def load_data(df, db_path, table_name):
    """Load data into SQLite database."""
    conn = sqlite3.connect(db_path)
    
    # Replace existing data
    df.to_sql(table_name, conn, if_exists="replace", index=False)
    
    # Verify
    cursor = conn.cursor()
    cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
    count = cursor.fetchone()[0]
    print(f"Loaded {count} records to {table_name}")
    
    conn.close()
    return count

load_data(clean_df, "pipeline.db", "users")
```

### Step 4: Serve (Dashboard)

```python
from flask import Flask, render_template
import sqlite3
import pandas as pd

app = Flask(__name__)

def get_data():
    conn = sqlite3.connect("pipeline.db")
    df = pd.read_sql("SELECT * FROM users", conn)
    conn.close()
    return df

@app.route("/")
def dashboard():
    df = get_data()
    stats = {
        "total_users": len(df),
        "companies": df["company_name"].nunique(),
        "users": df.to_dict("records")
    }
    return render_template("dashboard.html", **stats)

if __name__ == "__main__":
    app.run(debug=True)
```

### Complete Pipeline

```python
import requests
import pandas as pd
import sqlite3
from datetime import datetime

class ETLPipeline:
    def __init__(self, source_url, db_path, table_name):
        self.source_url = source_url
        self.db_path = db_path
        self.table_name = table_name
    
    def extract(self):
        """Fetch data from source."""
        print(f"[{datetime.now()}] Extracting from {self.source_url}")
        response = requests.get(self.source_url, timeout=30)
        response.raise_for_status()
        return response.json()
    
    def transform(self, data):
        """Clean and transform data."""
        print(f"[{datetime.now()}] Transforming {len(data)} records")
        df = pd.DataFrame(data)
        
        # Your transformation logic here
        df = df.dropna()
        df = df.drop_duplicates()
        
        return df
    
    def load(self, df):
        """Load to database."""
        print(f"[{datetime.now()}] Loading to {self.db_path}")
        conn = sqlite3.connect(self.db_path)
        df.to_sql(self.table_name, conn, if_exists="replace", index=False)
        conn.close()
        return len(df)
    
    def run(self):
        """Execute full pipeline."""
        try:
            raw = self.extract()
            cleaned = self.transform(raw)
            count = self.load(cleaned)
            print(f"Pipeline complete: {count} records processed")
            return True
        except Exception as e:
            print(f"Pipeline failed: {e}")
            return False

# Run pipeline
pipeline = ETLPipeline(
    source_url="https://jsonplaceholder.typicode.com/posts",
    db_path="blog.db",
    table_name="posts"
)
pipeline.run()
```

---

## Senior-Level Insights

### Pipeline Design Principles

| Principle   | Implementation                  |
| ----------- | ------------------------------- |
| Idempotent  | Running twice gives same result |
| Observable  | Logging at each step            |
| Recoverable | Save intermediate state         |
| Testable    | Each step can run independently |

### Error Handling

```python
def robust_extract(url, retries=3):
    for attempt in range(retries):
        try:
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            print(f"Attempt {attempt+1} failed: {e}")
            if attempt == retries - 1:
                raise
            time.sleep(2 ** attempt)  # Exponential backoff
```

### Scheduling Options

| Tool                   | Use Case               |
| ---------------------- | ---------------------- |
| cron                   | Simple Unix scheduling |
| Airflow                | Complex DAG workflows  |
| Prefect                | Modern Python-native   |
| Windows Task Scheduler | Windows environments   |

---

## Hands-on Lab

### Exercise 1: Weather Pipeline

```python
import requests
import pandas as pd
import sqlite3

def weather_pipeline():
    # Note: Use your own API key from openweathermap.org
    cities = ["London", "Paris", "Berlin", "Tokyo", "New York"]
    api_key = "YOUR_API_KEY"
    
    all_weather = []
    for city in cities:
        url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={api_key}"
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            all_weather.append({
                "city": city,
                "temp_kelvin": data["main"]["temp"],
                "humidity": data["main"]["humidity"],
                "description": data["weather"][0]["description"]
            })
    
    df = pd.DataFrame(all_weather)
    df["temp_celsius"] = df["temp_kelvin"] - 273.15
    
    conn = sqlite3.connect("weather.db")
    df.to_sql("current_weather", conn, if_exists="replace", index=False)
    conn.close()
    
    return df

# Run and inspect
df = weather_pipeline()
print(df)
```

### Exercise 2: GitHub Stats Pipeline

```python
import requests
import pandas as pd
import sqlite3

def github_pipeline(username):
    # Extract
    url = f"https://api.github.com/users/{username}/repos"
    response = requests.get(url, params={"per_page": 100})
    repos = response.json()
    
    # Transform
    df = pd.DataFrame([{
        "name": r["name"],
        "stars": r["stargazers_count"],
        "forks": r["forks_count"],
        "language": r["language"],
        "updated": r["updated_at"][:10]
    } for r in repos])
    
    df = df.dropna(subset=["language"])
    df = df.sort_values("stars", ascending=False)
    
    # Load
    conn = sqlite3.connect("github.db")
    df.to_sql("repositories", conn, if_exists="replace", index=False)
    conn.close()
    
    # Stats
    print(f"Total repos: {len(df)}")
    print(f"Total stars: {df['stars'].sum()}")
    print(f"Top language: {df['language'].value_counts().idxmax()}")
    
    return df

df = github_pipeline("python")
```

### Exercise 3: Full Dashboard

```python
# app.py
from flask import Flask, render_template
import sqlite3
import pandas as pd

app = Flask(__name__)

@app.route("/")
def index():
    conn = sqlite3.connect("github.db")
    df = pd.read_sql("SELECT * FROM repositories ORDER BY stars DESC LIMIT 10", conn)
    
    by_language = pd.read_sql("""
        SELECT language, COUNT(*) as count, SUM(stars) as stars
        FROM repositories
        GROUP BY language
        ORDER BY stars DESC
        LIMIT 5
    """, conn)
    
    conn.close()
    
    return render_template("index.html",
        repos=df.to_dict("records"),
        languages=by_language.to_dict("records"),
        total_repos=len(df)
    )

if __name__ == "__main__":
    app.run(debug=True)
```

---

## Mastery Check

### Question 1: ETL Order
Why is it Extract → Transform → Load, not Transform → Extract → Load?

<details>
<summary>Click for Answer</summary>

You can't transform what you don't have!

1. **Extract**: Get raw data from source
2. **Transform**: Clean and reshape (requires data)
3. **Load**: Store final result

Logic requires this order.

</details>

### Question 2: Idempotent Pipelines
What makes a pipeline "idempotent"?

<details>
<summary>Click for Answer</summary>

Running it multiple times produces the same result as running once.

**Idempotent**: `if_exists="replace"` in `to_sql()`
**Not idempotent**: `if_exists="append"` (duplicates data)

Idempotent pipelines are safer for reruns and recovery.

</details>

### Question 3: Error Recovery
Pipeline fails during Transform. What should happen?

<details>
<summary>Click for Answer</summary>

Good pipeline design:
1. **Log the error** with context
2. **Don't corrupt existing data** (Load didn't run)
3. **Save extracted data** so re-run doesn't re-fetch
4. **Alert operators** if scheduled

```python
try:
    raw = extract()
    save_checkpoint(raw, "raw_data.json")  # Recovery point
    cleaned = transform(raw)
    load(cleaned)
except TransformError as e:
    log_error(e)
    alert_team()
    # Raw data saved, can retry transform only
```

</details>

### Question 4: Scheduling
Your pipeline must run daily at 2 AM. How?

<details>
<summary>Click for Answer</summary>

Options:

**Linux/Mac (cron):**
```bash
0 2 * * * /usr/bin/python3 /path/to/pipeline.py
```

**Windows (Task Scheduler):**
- Create task with trigger at 2:00 AM daily
- Action: Run python pipeline.py

**Python scheduler:**
```python
import schedule
schedule.every().day.at("02:00").do(pipeline.run)
```

**Production**: Use Airflow, Prefect, or cloud schedulers.

</details>

### Question 5: Scale
Your pipeline processes 100 records now. How do you handle 1 million?

<details>
<summary>Click for Answer</summary>

1. **Batch processing**: Process in chunks, not all at once
2. **Streaming**: Process as data arrives
3. **Parallel**: Multiple workers
4. **Pagination**: API requests in pages
5. **Database optimization**: Indexes, bulk inserts

```python
# Chunked loading
for chunk in pd.read_json(file, chunksize=10000):
    cleaned = transform(chunk)
    conn.execute("INSERT INTO ...", cleaned)
```

</details>

---

## Summary

- ✅ ETL = Extract, Transform, Load
- ✅ APIs → Pandas → SQLite → Flask
- ✅ Error handling at each step
- ✅ Idempotent design for reruns
- ✅ Complete data pipeline architecture

**Phase 3 Complete!** You've mastered data engineering and web development fundamentals.
