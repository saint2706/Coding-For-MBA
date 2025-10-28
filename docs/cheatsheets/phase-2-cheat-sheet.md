# Phase 2 Cheat Sheet — Data Workflows & Analytics Stack (Days 21-39)

> Translate raw data into trustworthy insights. This phase turns you into the connective tissue
> between business stakeholders and technical data platforms.

## Core Outcomes

- Operate confidently inside virtual environments and manage dependencies across projects.
- Analyse datasets with NumPy and Pandas, handling missing values, joins, reshaping, and
  aggregations.
- Design data-cleaning pipelines that produce reproducible, well-documented transformations.
- Produce compelling static and interactive visualisations for executive storytelling.
- Connect to relational databases, NoSQL stores, and third-party APIs to automate ingestion.
- Build and deploy lightweight Flask services to expose analytics logic to other teams.

## Analytics Workflow Blueprint

1. **Ingest** – `pandas.read_csv`, database connectors (`sqlite3`, `sqlalchemy`, `psycopg2`,
   `pymongo`), authenticated API calls with `requests`.
1. **Clean** – handle nulls (`fillna`, `dropna`), enforce schema (`astype`, categorical types),
   deduplicate, standardise text.
1. **Transform** – vectorised calculations, window functions (`rolling`, `expanding`), group-by
   aggregations, pivot/unpivot operations.
1. **Visualise** – Matplotlib/Seaborn for executive slides; Plotly for interactive dashboards.
1. **Operationalise** – package pipeline steps into reusable functions, schedule scripts, or expose
   via Flask endpoints.

## Pandas Power Moves

| Situation | Method | Snippet | |-----------|--------|---------| | Combine datasets | `merge` /
`join` | `orders.merge(customers, on="customer_id", how="left")` | | Feature scaling | `assign` |
`df.assign(conversion_rate=lambda d: d.deals / d.visits)` | | Data quality | boolean masks |
`df[df.revenue.between(0, 1_000_000)]` | | Multi-level analysis | `groupby` + `agg` |
`sales.groupby(["region","segment"]).agg(rev=("revenue","sum"))` | | Share insights | `to_excel`,
`to_markdown`, `to_json` | `df.to_excel("kpi-report.xlsx", index=False)` |

## Visual Storytelling Prompts

- Pair a key metric with a cumulative trend (line + area) to highlight compounding growth.
- Use small multiples to compare regional performance while keeping scales consistent.
- Add callouts (annotations) that explain inflection points—executives remember stories, not charts.

## Integration Checklist

- [ ] Store secrets and API keys in `.env` files and load with `python-dotenv`.
- [ ] Wrap database queries in context managers to close connections reliably.
- [ ] Version datasets or transformations with timestamps/hashes for traceability.
- [ ] Provide a single `make report` or `python run_pipeline.py` command for teammates.
- [ ] Document assumptions and edge cases in README snippets or inline comments.

## Business Wins to Target

- Automated KPI dashboards combining CRM exports + finance data.
- API monitor that pings SaaS usage stats and alerts Slack when thresholds are exceeded.
- Flask microservice exposing an underwriting or pricing model for internal stakeholders.
- Interactive Plotly app that lets leaders scenario-plan pipeline or budget inputs.

## 30-Minute Refresh Sprint

1. **Data pull (10 min):** Request an authenticated JSON payload, normalise into a DataFrame, and
   persist as Parquet.
1. **Transformation (10 min):** Chain `assign`, `groupby`, and `pivot_table` to produce a
   board-level KPI table.
1. **Communication (10 min):** Export a clean PNG visual with annotations and craft a brief
   executive takeaway.

______________________________________________________________________

**Next stop:** Phase 3 moves from analytics to machine learning. Bring your disciplined
pipelines—they become the backbone of model development.
