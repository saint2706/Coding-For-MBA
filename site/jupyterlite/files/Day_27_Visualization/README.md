# 📘 Day 27: Data Visualization - Communicating Insights

Visualising key business metrics makes it easier to communicate findings and uncover patterns. Day 27 introduces reusable Matplotlib and Seaborn helpers that create core business charts for the sales dataset you prepared in Day 24.

## Environment Setup

1. (Recommended) Create a virtual environment and activate it.
1. Install dependencies from the root of the repository:
   ```bash
   pip install -r requirements.txt
   ```
1. Ensure `sales_data.csv` from Day 24 is available in this lesson folder (or update the helper to point to your copy).

## Run the Script

Generate the four lesson visuals from the command line:

```bash
python Day_27_Visualization/visualization.py
```

Each call loads the shared plotting helpers, displays a chart, and waits for you to close the window before moving on.

## Explore the Notebook

Open the companion notebook to iterate on the visuals and review interpretation guidance:

```bash
jupyter notebook Day_27_Visualization/visualization.ipynb
```

The notebook reuses the same plotting functions so you can experiment without duplicating logic.

## Run Tests

A pytest suite validates the chart configuration (titles, labels, legends) using a headless Matplotlib backend:

```bash
pytest tests/test_day_27.py
```

Running the full repository test suite is also supported:

```bash
pytest
```
