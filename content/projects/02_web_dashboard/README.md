# 📊 Project 02: Web Dashboard

> **Phases covered**: Phase 3 (Data Engineering & Web Development)  
> **Difficulty**: Intermediate  
> **Estimated time**: 5–7 hours

---

## 🎯 Project Overview

Build an **interactive web dashboard** using **Streamlit** (or Flask + Plotly) that
visualises retail sales KPIs from a SQLite database. The app allows business users
to filter by date range, region, and category without writing a single SQL query.

This project proves you can:

- Build a working web application in Python (Phase 3)
- Connect Python to a database and render data-driven charts
- Design a simple, usable UI for non-technical stakeholders

---

## 📋 Business Scenario

Your RetailCo pipeline from Project 01 now runs every Monday. The Finance VP says,
*"The CSV is great, but I want to click around and explore the data myself."*

You have one week to build a dashboard that shows:

| Panel | Chart Type | Description |
| ----- | ---------- | ----------- |
| KPI Cards | Metric tiles | Total Revenue · Avg Order Value · Return Rate |
| Revenue Trend | Line chart | Monthly revenue by region (last 12 months) |
| Store Ranking | Bar chart | Top 10 stores by revenue (sortable) |
| Category Mix | Pie / Donut | Revenue share by product category |
| Filter Sidebar | Widgets | Date range · Region multi-select · Category |

---

## 🗂️ Project Structure

```
02_web_dashboard/
├── README.md        ← this file
├── app.py           ← main scaffold (fill in the TODOs)
└── requirements.txt ← Python dependencies
```

---

## 🛠️ Skills Applied

| Phase | Topics |
| ----- | ------ |
| Phase 3 | Flask/Streamlit, Jinja2 / widget API, REST principles, SQLite, Plotly |

---

## ✅ Milestones

### Milestone 1 — Setup & Data Layer

- [ ] Install Streamlit: `pip install streamlit plotly pandas`
- [ ] Load data from `../01_python_data_pipeline/output/retailco.db`
  or regenerate from Project 01's `_generate_sample_data()` helper
- [ ] Wrap the DB query in a cached function using `@st.cache_data`

### Milestone 2 — Sidebar Filters

- [ ] Add a date range slider (`st.date_input` or `st.slider`)
- [ ] Add a region multi-select (`st.multiselect`)
- [ ] Add a category multi-select
- [ ] Apply filters to the underlying DataFrame before rendering charts

### Milestone 3 — KPI Cards

- [ ] Use `st.metric()` to display Total Revenue, AOV, and Return Rate
- [ ] Show delta (MoM change) on each metric tile

### Milestone 4 — Charts

- [ ] Line chart: monthly revenue per region (`px.line`)
- [ ] Horizontal bar chart: top 10 stores by revenue (`px.bar`)
- [ ] Donut chart: category revenue share (`px.pie` with `hole=0.4`)

### Milestone 5 — Polish & Deploy

- [ ] Add a page title, favicon, and sidebar logo
- [ ] Make charts responsive to filter changes
- [ ] Deploy to [Streamlit Community Cloud](https://streamlit.io/cloud) (free tier)

---

## 🚀 Getting Started

```bash
pip install -r requirements.txt

# If you completed Project 01:
streamlit run app.py

# If you skipped Project 01, the app will generate sample data automatically.
```

---

## 🏆 Stretch Goals

- [ ] Add a raw data table with `st.dataframe()` and `st.download_button()` (CSV export)
- [ ] Implement a Flask version using Jinja2 templates and Chart.js
- [ ] Add HTTP Basic Auth to protect the dashboard
- [ ] Cache results in Redis (Phase 3 bonus)

---

## 📚 Reference Lessons

- Day 25–36: Data Engineering, Flask, Streamlit (Phase 3)
- Day 36B: Docker — containerise your dashboard
- Day 37B: Statistics for the KPI delta calculations

---

*Happy coding! Take a screenshot of your dashboard and include it in your portfolio README.*
