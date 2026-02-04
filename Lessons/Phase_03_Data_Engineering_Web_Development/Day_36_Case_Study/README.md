---
day: 36
title: "Case Study: End-to-End Data Pipeline"
phase: 3
phaseTitle: "Data Engineering & Web Development"
slug: "case-study-pipeline"
duration: 60
difficulty: "intermediate"
tags: [python, etl, pipeline, integration]
concepts: [data pipeline design, ETL workflow, project integration]
prerequisites: [25, 30, 31, 35]
outcomes: [Design end-to-end data pipelines, Integrate multiple skills, Build complete data applications]
---

# 🎯 Day 36: Case Study - End-to-End Data Pipeline

> *"Tie it all together. Real projects combine every skill."*

---

## The "Never-Coded" Bridge

This phase taught many skills in isolation. Real projects combine them:
1. **Extract**: APIs, web scraping, databases
2. **Transform**: Pandas, cleaning, statistics
3. **Load**: Databases, visualizations, dashboards

---

## The Technical Deep Dive

### Pipeline Architecture

```
Data Sources          Processing           Output
┌──────────┐         ┌──────────┐        ┌──────────┐
│   API    │───┐     │  Clean   │        │    DB    │
└──────────┘   │     │   Data   │        └──────────┘
               ├────►│          │───────►           
┌──────────┐   │     │ Transform│        ┌──────────┐
│   CSV    │───┤     │          │        │Dashboard │
└──────────┘   │     │ Aggregate│        └──────────┘
               │     └──────────┘
┌──────────┐   │
│ Scraping │───┘
└──────────┘
```

### Sample Pipeline

```python
import requests
import pandas as pd
import sqlite3
from datetime import datetime

def extract_data():
    """Fetch data from API"""
    response = requests.get("https://api.example.com/sales")
    return pd.DataFrame(response.json())

def transform_data(df):
    """Clean and transform"""
    df = df.dropna()
    df["date"] = pd.to_datetime(df["date"])
    df["revenue"] = df["quantity"] * df["price"]
    return df

def load_data(df, db_path):
    """Save to database"""
    with sqlite3.connect(db_path) as conn:
        df.to_sql("sales", conn, if_exists="append", index=False)
    print(f"Loaded {len(df)} records")

def run_pipeline():
    """Execute full ETL"""
    print(f"Pipeline started: {datetime.now()}")
    
    raw_data = extract_data()
    clean_data = transform_data(raw_data)
    load_data(clean_data, "sales.db")
    
    print(f"Pipeline completed: {datetime.now()}")

if __name__ == "__main__":
    run_pipeline()
```

### Adding Logging

```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

def run_pipeline():
    logger.info("Pipeline started")
    try:
        raw_data = extract_data()
        logger.info(f"Extracted {len(raw_data)} records")
        
        clean_data = transform_data(raw_data)
        logger.info(f"Transformed data: {len(clean_data)} records")
        
        load_data(clean_data, "sales.db")
        logger.info("Pipeline completed successfully")
    except Exception as e:
        logger.error(f"Pipeline failed: {e}")
        raise
```

### Scheduling with cron

```bash
# crontab -e
# Run daily at 6 AM
0 6 * * * /usr/bin/python3 /path/to/pipeline.py
```

---

## Hands-on Lab: Complete Project

```python
"""
Mini Project: News Aggregator Pipeline
- Scrape headlines
- Clean and categorize
- Store in database
- Generate summary report
"""

import requests
from bs4 import BeautifulSoup
import pandas as pd
import sqlite3
from datetime import datetime

def scrape_news():
    """Extract news from quotes site (demo)"""
    url = "http://quotes.toscrape.com"
    response = requests.get(url)
    soup = BeautifulSoup(response.text, "html.parser")
    
    quotes = []
    for q in soup.find_all("div", class_="quote"):
        quotes.append({
            "text": q.find("span", class_="text").text,
            "author": q.find("small", class_="author").text,
            "scraped_at": datetime.now()
        })
    return pd.DataFrame(quotes)

def transform_news(df):
    """Clean and enrich"""
    df["text_length"] = df["text"].str.len()
    df["author"] = df["author"].str.strip()
    return df

def save_to_db(df):
    """Store in SQLite"""
    with sqlite3.connect("news.db") as conn:
        df.to_sql("quotes", conn, if_exists="replace", index=False)

def generate_report(df):
    """Create summary statistics"""
    print("\n=== News Pipeline Report ===")
    print(f"Total quotes: {len(df)}")
    print(f"Unique authors: {df['author'].nunique()}")
    print(f"Avg quote length: {df['text_length'].mean():.1f} chars")
    print(f"\nTop 3 Authors:")
    print(df["author"].value_counts().head(3))

def main():
    print("Starting pipeline...")
    raw = scrape_news()
    cleaned = transform_news(raw)
    save_to_db(cleaned)
    generate_report(cleaned)
    print("\nPipeline complete!")

if __name__ == "__main__":
    main()
```

---

## Summary

- ✅ ETL: Extract, Transform, Load
- ✅ Combine APIs, scraping, databases
- ✅ Add logging for production
- ✅ Schedule for automation

**🎉 Congratulations!** You've completed **Phase 3: Data Engineering & Web Development**!
