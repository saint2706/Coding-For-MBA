# 📊 Data Repository - Business Analytics Datasets

## Overview

This data directory contains curated datasets and utility files specifically designed for business analytics education. Each file serves as a practical example of real-world data that MBA students and business analysts commonly encounter in their professional work.

## 📁 Dataset Categories

### 🌍 Geographic and Demographic Data

- **`countries.py`** - Complete list of world countries for market analysis
- **`countries_data.py`** - Detailed country information including population, capitals, languages, and currencies
- **`countries_data.json`** - JSON version of country data for web applications

### 💼 Corporate and Financial Data

- **`F500.csv`** - Fortune 500 company rankings and financial metrics
- **`fortune_500_companies_2017.csv`** - Historical Fortune 500 data with detailed company information
- **`fortune1000_final.csv`** - Extended Fortune 1000 dataset for comprehensive corporate analysis

### 📈 Market and Consumer Data

- **`weight-height.csv`** - Health and fitness industry demographic data
- **`result.csv`** - General results dataset for statistical analysis practice

### 🧭 Business Intelligence Curriculum Support

- **`bi_analyst_roadmap.json`** - Phase 5 topic graph sourced from the developer-roadmap BI Analyst track (MIT license) for aligning lessons, cheat sheets, and stakeholder narratives

### 📰 Text and Social Media Analytics

- **`hacker_news.csv`** - Technology industry discussion data from Hacker News
- **`HN_posts_year_to_Sep_26_2016.csv`** - Time-series social media engagement data
- **`email_exchanges.txt` / `email_exchanges_big.txt`** - Corporate communication patterns for text analysis

### 🗣️ Speech and Sentiment Analysis

- **`donald_speech.txt`** - Political speech text for sentiment analysis
- **`obama_speech.txt`** - Presidential communication analysis
- **`melina_trump_speech.txt`** - Comparative political communication study
- **`michelle_obama_speech.txt`** - First Lady speech patterns and themes

### 📚 Literature and Language Processing

- **`romeo_and_juliet.txt`** - Classic literature for natural language processing tutorials
- **`stop_words.py`** - English stop words collection for text preprocessing

## 🛠️ Utility Modules

- **`stop_words.py`** - Pre-processed list of English stop words for text analytics
- **`countries.py`** - Clean country list for data validation and geographic analysis
- **`countries_data.py`** - Structured country information with business-relevant attributes

## 💡 Business Applications

### Market Research & Expansion

```python
# Example: Identify English-speaking markets for expansion
from data.countries_data import data

english_markets = [country for country in data 
                   if 'English' in country.get('languages', [])]
print(f"Found {len(english_markets)} English-speaking markets")
```

### Competitive Analysis

```python
# Example: Analyze Fortune 500 data
import pandas as pd

fortune_data = pd.read_csv('data/fortune_500_companies_2017.csv')
top_tech = fortune_data[fortune_data['Sector'] == 'Technology'].head(10)
```

### Text Analytics for Business Intelligence

```python
# Example: Clean business communications
from data.stop_words import stop_words

def clean_business_text(text):
    words = text.lower().split()
    return [word for word in words if word not in stop_words]
```

## 🎯 Learning Objectives

By working with these datasets, you will learn to:

1. **Data Import and Exploration** - Load various data formats (CSV, JSON, TXT)
1. **Data Cleaning and Preprocessing** - Handle missing values and inconsistent formats
1. **Geographic Analysis** - Work with country-level data for market research
1. **Corporate Analytics** - Analyze Fortune 500 company performance metrics
1. **Text Mining** - Extract insights from speeches, emails, and social media
1. **Statistical Analysis** - Apply descriptive and inferential statistics to business problems

## 📖 Getting Started

1. **Load a Dataset:**

   ```python
   import pandas as pd
   companies = pd.read_csv('data/fortune_500_companies_2017.csv')
   print(companies.head())
   ```

1. **Explore the Data:**

   ```python
   print(f"Dataset shape: {companies.shape}")
   print(f"Columns: {companies.columns.tolist()}")
   print(companies.describe())
   ```

1. **Start Your Analysis:**

   ```python
   # Group by sector to identify industry trends
   sector_analysis = companies.groupby('Sector')['Revenue'].mean()
   print(sector_analysis.sort_values(ascending=False))
   ```

## 🔍 Data Quality Notes

- All datasets have been curated for educational purposes
- Some data may be from historical periods (2016-2017) for consistency
- Text files use UTF-8 encoding
- CSV files include headers for easy pandas integration
- JSON files follow standard formatting conventions

## 📚 Related Learning Materials

These datasets are used throughout the course in various day modules:

- **Days 22-24**: Pandas and data manipulation
- **Days 25-26**: Data cleaning and statistical analysis
- **Days 27-29**: Data visualization and reporting
- **Days 30-33**: Web scraping and API integration
- **Days 68-84**: Business Intelligence specialization and portfolio strategy using the BI analyst roadmap

______________________________________________________________________

*Ready to turn data into business insights? Start exploring these datasets and discover the power of Python for business analytics!* 🚀
