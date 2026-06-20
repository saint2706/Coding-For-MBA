---
day: "113C"
title: "Cloud-Native SQL: BigQuery ML, Snowflake Cortex & Redshift ML"
phase: 9
phaseTitle: "Enterprise SQL & Performance Engineering"
slug: "cloud-native-sql"
duration: 90
difficulty: "advanced"
tags:
  - bigquery
  - snowflake
  - redshift
  - cloud-sql
  - sql-ml
  - cost-engineering
concepts:
  - "BigQuery ML (BQML)"
  - "Snowflake Cortex AI functions"
  - "Redshift ML"
  - "cloud warehouse cost optimization"
  - "ML via SQL"
prerequisites: [113, "113B"]
outcomes:
  - "Write and run a BigQuery ML model using CREATE MODEL syntax"
  - "Use Snowflake Cortex functions for LLM-powered SQL analytics"
  - "Explain Redshift ML's SageMaker integration model"
  - "Apply cost management strategies for cloud warehouse queries"
  - "Decide which cloud platform best fits a given analytics workload"
---

# ☁️ Day 108C: Cloud-Native SQL

> *"In 2026, the most powerful ML toolkit isn't Python — it's your data warehouse's SQL engine with ML extensions built in."*

---

## The "Never-Coded" Bridge

**The traditional ML workflow:**

Data Scientist exports data to CSV → opens Jupyter notebook → trains model → pickles it → hands off to engineering → engineering re-implements it in production → six months later.

**Cloud-native SQL ML:**

```sql
CREATE MODEL my_churn_model
OPTIONS (model_type='logistic_reg', input_label_cols=['churned'])
AS SELECT * FROM my_customer_features;
```

Done. The model lives in the warehouse. The same SQL your BI team uses to build dashboards can now train, evaluate, and predict with ML models — no data movement, no Python environment, no handoff overhead.

This is the direction every major cloud platform is moving. **BigQuery ML**, **Snowflake Cortex**, and **Redshift ML** are already in production at thousands of companies. As an MBA data professional, understanding these platforms is your competitive advantage.

> **Sequencing note**: this lesson's prerequisites are Day 113 (Performance Tuning) and Day 113B (the Curriculum Capstone) — both of which now correctly point forward to this lesson rather than declaring Phase 9 finished early. Day 113C is the true close of Phase 9.

---

## The Technical Deep Dive

### Part 1: BigQuery ML (BQML)

BQML trains and deploys ML models entirely within BigQuery using SQL. No Python. No notebooks. No data export.

#### Supported Model Types

| Model Type           | BQML `model_type`                        | Use Case                             |
| -------------------- | ---------------------------------------- | ------------------------------------ |
| Logistic Regression  | `logistic_reg`                           | Churn, fraud, classification         |
| Linear Regression    | `linear_reg`                             | Price prediction, demand forecasting |
| K-Means Clustering   | `kmeans`                                 | Customer segmentation                |
| Matrix Factorization | `matrix_factorization`                   | Recommendations                      |
| XGBoost              | `boosted_tree_classifier` / `_regressor` | High-accuracy tabular ML             |
| DNN                  | `dnn_classifier` / `_regressor`          | Complex patterns                     |
| Time Series          | `arima_plus`                             | Demand forecasting                   |
| AutoML               | `automl_classifier` / `_regressor`       | Automated model selection            |
| Text Classification  | `text_classifier` (via Vertex AI)        | Sentiment, topic classification      |

#### Full ML Workflow in SQL

```sql
-- Step 1: Explore the data (standard SQL)
SELECT
  churned,
  COUNT(*) AS count,
  AVG(tenure_months) AS avg_tenure,
  AVG(monthly_charges) AS avg_charges
FROM `project.dataset.customers`
GROUP BY churned;


-- Step 2: Train a logistic regression model
CREATE OR REPLACE MODEL `project.dataset.churn_model`
OPTIONS (
  model_type         = 'logistic_reg',
  input_label_cols   = ['churned'],
  l2_reg             = 0.1,         -- Regularization
  data_split_method  = 'auto_split' -- BQML auto creates train/eval split
)
AS
SELECT
  tenure_months,
  monthly_charges,
  total_charges,
  contract_type,
  payment_method,
  paperless_billing,
  churned
FROM `project.dataset.customers`
WHERE split_col = 'TRAIN';


-- Step 3: Evaluate the model
SELECT *
FROM ML.EVALUATE(MODEL `project.dataset.churn_model`,
  (SELECT * FROM `project.dataset.customers` WHERE split_col = 'TEST')
);
-- Returns: precision, recall, accuracy, f1_score, roc_auc, log_loss


-- Step 4: Predict on new data
SELECT
  customer_id,
  predicted_churned,
  predicted_churned_probs[OFFSET(1)].prob AS churn_probability
FROM ML.PREDICT(MODEL `project.dataset.churn_model`,
  (SELECT * FROM `project.dataset.new_customers`)
)
ORDER BY churn_probability DESC
LIMIT 100;


-- Step 5: Explain predictions (feature importance)
SELECT *
FROM ML.EXPLAIN_PREDICT(
  MODEL `project.dataset.churn_model`,
  (SELECT * FROM `project.dataset.new_customers` LIMIT 10),
  STRUCT(3 AS top_k_features)
)
ORDER BY customer_id, feature_attribution DESC;


-- Step 6: Time series forecasting (ARIMA+)
CREATE OR REPLACE MODEL `project.dataset.demand_forecast`
OPTIONS (
  model_type        = 'arima_plus',
  time_series_timestamp_col = 'sale_date',
  time_series_data_col      = 'daily_sales',
  time_series_id_col        = 'product_id',  -- Multi-series!
  forecast_horizon          = 30,             -- Forecast 30 days ahead
  auto_arima                = TRUE,
  decompose_time_series     = TRUE
)
AS SELECT sale_date, product_id, daily_sales
FROM `project.dataset.sales_history`;

-- Generate the forecast
SELECT *
FROM ML.FORECAST(MODEL `project.dataset.demand_forecast`,
  STRUCT(30 AS horizon, 0.9 AS confidence_level)
)
ORDER BY product_id, forecast_timestamp;
```

#### The Cost Model: Think in $-per-Query

```sql
-- BigQuery pricing: $5–7 per TB scanned (on-demand)
-- Always estimate cost before running large queries:

-- 1. Use LIMIT to explore before full runs
SELECT * FROM huge_table LIMIT 1000;  -- only scans what it returns? NO.

-- 2. Use query cost preview (dry run via API, or check "This query will process X MB")
```

> ⚠️ **Pitfall: LIMIT Does Not Save Money in BigQuery**
> This is the #1 BigQuery misconception for SQL-trained analysts coming from Postgres or MySQL, where `LIMIT` can short-circuit a scan. BigQuery is a **columnar, distributed** engine: `SELECT * FROM huge_table LIMIT 1000` still reads every byte of every selected column across the whole table before truncating the result set to 1,000 rows for display. A 40 TB table queried this way bills for 40 TB scanned — full price — even though you only ever see 1,000 rows.
> **Detection**: Before running, check the BigQuery console's "This query will process X GB/TB when run" estimate (or use a dry run via the API: `bigquery.QueryJobConfig(dry_run=True)`). If that number is large, `LIMIT` will not shrink it.
> **Fix**: Reduce bytes scanned at the source — select only needed columns (BigQuery is columnar, so `SELECT col1, col2` instead of `SELECT *` already cuts cost), add a `WHERE` clause on a **partitioned** column, and use `TABLESAMPLE SYSTEM` if you genuinely just want a statistical sample rather than the first N rows.

```sql

-- 3. PARTITION PRUNING — the single biggest cost lever:
-- Costs $6.00: full table scan
SELECT * FROM `project.dataset.events` WHERE user_id = '12345';

-- Costs $0.06: only scans 1 day's partition
SELECT * FROM `project.dataset.events`
WHERE DATE(event_timestamp) = '2026-02-22'  -- partition filter!
  AND user_id = '12345';

-- 4. CLUSTERING: within a partition, data is sorted by cluster columns
-- CREATE TABLE ... PARTITION BY DATE(ts) CLUSTER BY country, product_id
-- Dramatically reduces bytes scanned for filtered queries

-- 5. MATERIALIZED VIEWS: pre-compute expensive aggregations
CREATE MATERIALIZED VIEW `project.dataset.daily_revenue_mv`
PARTITIONED BY order_date AS
SELECT
  DATE(created_at) AS order_date,
  country,
  SUM(amount) AS revenue,
  COUNT(*) AS orders
FROM `project.dataset.orders`
GROUP BY 1, 2;
-- Refreshed automatically. Queries on this view cost a fraction of the base table.
```

> **Note**: The `daily_revenue_mv` materialized view above is the BigQuery equivalent of the **Materialized View** you built in Day 102. The concept — pre-compute an expensive aggregation once, read it cheaply many times — is identical; only the DDL differs (`PARTITIONED BY` instead of Postgres's `CONCURRENTLY` refresh syntax, and BigQuery auto-refreshes incrementally instead of requiring `REFRESH MATERIALIZED VIEW`).

#### On-Demand Pricing vs Slot Commitments

BigQuery offers two billing models, and choosing the wrong one is a common source of surprise invoices:

- **On-demand pricing**: $5–7 per TB scanned, pay-as-you-go, no upfront commitment. Best for unpredictable, spiky, or low-volume workloads — most small teams and ad hoc analytics start here.
- **Slot commitments (capacity pricing)**: you reserve a fixed pool of compute (100–500+ "slots") for a flat monthly or annual fee, regardless of how many bytes you scan. Best for predictable, high-volume workloads — dashboards refreshing hourly, ETL pipelines running on a schedule, or many analysts querying continuously throughout the business day.
- **Break-even point**: as a rule of thumb, teams scanning roughly **2–3 TB per day or more** on a sustained basis tend to save money switching from on-demand to a slot commitment, because the flat fee starts to undercut the per-byte on-demand rate. Below that volume, on-demand is usually cheaper since you aren't paying for idle reserved capacity.
- **Decision rule for an MBA data leader**: track your team's `INFORMATION_SCHEMA.JOBS` bytes-scanned trend for 30 days. If it's flat or growing and crosses the 2–3 TB/day threshold, propose a slot commitment to Finance — it converts a variable, unpredictable line item into a fixed, budgetable one.

#### dbt + BigQuery: The Modern Analytics Stack

A brief but important pairing: **dbt** (data build tool) handles SQL-based transformations — turning raw ingested tables into clean, tested, documented analytics tables — while **BigQuery ML** handles the modelling layer on top of those same tables. In practice, a modern analytics team's stack looks like: raw data lands in BigQuery → dbt models transform it into curated marts (the same kind of KPI tables you built in the Day 113B capstone's `02_sql_kpis.sql`) → `CREATE MODEL` trains directly on a dbt-managed mart. This dbt-plus-BQML combination is the dominant modern analytics stack because it keeps the entire pipeline — transformation, testing, and modelling — inside one SQL-based toolchain with no separate Python ML infrastructure required for standard algorithms.

---

### Part 2: Snowflake Cortex AI Functions

Snowflake Cortex brings LLM capabilities directly into SQL — analyze, summarize, translate, classify text without leaving Snowflake.

```sql
-- Snowflake Cortex: LLM functions in SQL (as of Snowflake 2024+)

-- --- Sentiment Analysis ---
SELECT
  review_id,
  customer_comment,
  SNOWFLAKE.CORTEX.SENTIMENT(customer_comment) AS sentiment_score
  -- Returns -1 (negative) to 1 (positive)
FROM customer_reviews
LIMIT 100;


-- --- Text Classification ---
SELECT
  support_ticket_id,
  ticket_text,
  SNOWFLAKE.CORTEX.CLASSIFY_TEXT(
    ticket_text,
    ['billing_issue', 'technical_bug', 'feature_request', 'general_inquiry']
  ):label::VARCHAR AS category
FROM support_tickets;


-- --- LLM Completion (arbitrary prompts) ---
SELECT
  product_id,
  product_description,
  SNOWFLAKE.CORTEX.COMPLETE(
    'mistral-7b',
    CONCAT(
      'Write a one-sentence marketing tagline for this product: ',
      product_description
    )
  ) AS marketing_tagline
FROM products
WHERE tagline IS NULL
LIMIT 50;


-- --- Extraction from unstructured text ---
SELECT
  contract_id,
  contract_text,
  SNOWFLAKE.CORTEX.EXTRACT_ANSWER(
    contract_text,
    'What is the termination clause notice period?'
  ) AS notice_period
FROM contracts;


-- --- Summarization ---
SELECT
  earnings_call_id,
  SNOWFLAKE.CORTEX.SUMMARIZE(transcript) AS executive_summary
FROM earnings_call_transcripts
WHERE YEAR(call_date) = 2026;
```

#### Snowflake ML Functions (Traditional ML in SQL)

```sql
-- Snowflake ML Functions: classification, regression, anomaly detection

-- Train a regression model to predict order value
CREATE OR REPLACE SNOWFLAKE.ML.REGRESSOR order_value_model
FROM (
  SELECT
    customer_age, customer_segment, product_category,
    days_since_last_order, lifetime_orders,
    order_value AS label
  FROM training_data
);

-- Predict
SELECT
  order_id,
  order_value_model!PREDICT(
    customer_age, customer_segment, product_category,
    days_since_last_order, lifetime_orders
  ) AS predicted_order_value
FROM new_orders;

-- Anomaly detection (no labels needed — unsupervised)
CREATE OR REPLACE SNOWFLAKE.ML.ANOMALY_DETECTION fraud_detector
FROM (
  SELECT transaction_amount, merchant_category, hour_of_day, 
         is_international, transaction_time
  FROM historical_transactions
);

SELECT *, fraud_detector!DETECT_ANOMALIES(
  transaction_amount, merchant_category, hour_of_day,
  is_international, transaction_time
) AS anomaly_score
FROM todays_transactions
WHERE anomaly_score > 0.9;
```

#### Snowflake Cost Management

```sql
-- Virtual Warehouse sizing: choose the right size, auto-suspend aggressively
ALTER WAREHOUSE analytics_wh
  SET WAREHOUSE_SIZE = 'SMALL'          -- Start small, scale up if needed
      AUTO_SUSPEND   = 60               -- Suspend after 60s of inactivity
      AUTO_RESUME    = TRUE;            -- Resume automatically on query

-- Query acceleration: Snowflake auto-routes large scan portions to elastic compute
ALTER WAREHOUSE analytics_wh
  SET ENABLE_QUERY_ACCELERATION = TRUE
      QUERY_ACCELERATION_MAX_SCALE_FACTOR = 8;  -- Up to 8x warehouse clones

-- Resource monitoring: alert when credits exceed threshold
CREATE RESOURCE MONITOR monthly_budget
  WITH CREDIT_QUOTA = 1000  -- 1000 credits per month
  TRIGGERS ON 80 PERCENT DO NOTIFY
           ON 100 PERCENT DO SUSPEND;

ALTER WAREHOUSE analytics_wh SET RESOURCE_MONITOR = monthly_budget;

-- Clustering keys: pre-sort data to minimize partition scanning
-- For a table frequently queried by date + region:
ALTER TABLE sales CLUSTER BY (TO_DATE(created_at), region);
```

---

### Part 3: Redshift ML

Amazon Redshift ML integrates with SageMaker Autopilot — you define the model in SQL, SageMaker trains it, results come back to Redshift as a SQL function.

```sql
-- Step 1: Create model (triggers SageMaker Autopilot training)
CREATE MODEL customer_churn_prediction
FROM (
  SELECT tenure, monthly_charges, total_charges,
         contract_type, internet_service, churned
  FROM customers
  WHERE created_at < '2026-01-01'  -- Training data
)
TARGET churned
FUNCTION predict_churn
IAM_ROLE 'arn:aws:iam::123456789:role/RedshiftMLRole'
SETTINGS (
  S3_BUCKET 'my-redshift-ml-bucket',  -- Stores training artifacts
  MAX_RUNTIME 7200                     -- Max training time (seconds)
);


-- Step 2: Check model status (training can take 30-90 mins)
SHOW MODEL customer_churn_prediction;
-- STATUS: READY (once SageMaker finishes training)


-- Step 3: Predict using the auto-generated SQL function
SELECT
  customer_id,
  predict_churn(
    tenure,
    monthly_charges,
    total_charges,
    contract_type,
    internet_service
  ) AS churn_prediction,
  predict_churn_prob(  -- Probability function also auto-generated
    tenure, monthly_charges, total_charges, contract_type, internet_service
  ) AS churn_probability
FROM customers
WHERE created_at >= '2026-01-01'  -- New customers to score
ORDER BY churn_probability DESC;


-- Step 4: Use Redshift Spectrum for external S3 data
-- Query data directly in S3 without loading (for cold data)
CREATE EXTERNAL TABLE spectrum.cold_orders (
    order_id VARCHAR,
    customer_id VARCHAR,
    amount DECIMAL(10,2),
    order_date DATE
)
STORED AS PARQUET
LOCATION 's3://my-data-lake/orders/year=2023/';

-- Join in-warehouse and S3 data seamlessly
SELECT
  c.customer_segment,
  COUNT(o.order_id) AS orders_2023,
  SUM(o.amount) AS revenue_2023
FROM customers c
JOIN spectrum.cold_orders o ON c.customer_id = o.customer_id
GROUP BY 1
ORDER BY revenue_2023 DESC;
```

---

### Platform Comparison: When to Use Which

| Criterion          | BigQuery                         | Snowflake                     | Redshift              |
| ------------------ | -------------------------------- | ----------------------------- | --------------------- |
| **Pricing model**  | Pay-per-byte-scanned             | Pay-per-compute-time          | Reserved + Spectrum   |
| **ML via SQL**     | ML.EVALUATE, ML.PREDICT          | Cortex + ML Functions         | SageMaker integration |
| **LLM/GenAI SQL**  | Vertex AI integration            | Cortex COMPLETE, SENTIMENT    | Bedrock integration   |
| **Best for**       | Serverless, ad hoc analytics     | Mixed workloads, data sharing | AWS-native shops      |
| **Superpower**     | ARIMA+, multi-series forecasting | Data Marketplace, Cortex LLMs | Spectrum (S3 query)   |
| **Growth pattern** | Scales per-query automatically   | Scale via warehouse size      | Resize cluster        |

---

## 💼 MBA Context: The $ Mindset

At the MBA level, cloud SQL isn't just technical — it's a **cost center you manage**:

```
BigQuery cost per Monday morning CEO dashboard re-run:
  Without optimization: scans 800 GB → $5.60 per run × 52 weeks = $291/year
  With partitioning + clustering: scans 2 GB → $0.014 per run = $0.73/year

That's a 400x cost reduction — a simple DDL change, zero performance loss.
```

The same discipline applies to Snowflake and Redshift — the cost lever just moves from "bytes scanned" to "compute time" or "reserved capacity":

```
Snowflake cost per analytics team running a MEDIUM warehouse all day:
  Without auto-suspend: warehouse stays "running" 24 hrs/day × $4/credit-hr × 365 = $14,600/year
  With AUTO_SUSPEND=60s + AUTO_RESUME: warehouse only billed during actual query time,
    ~3 active hrs/day × $4/credit-hr × 365 = $4,380/year

That's a ~70% reduction — purely from one ALTER WAREHOUSE statement, zero code changes.

Redshift cost per 10 TB analytics cluster:
  On-demand (ra3.4xlarge, pay-as-you-go): ~$3.26/hr × 24 × 365 = $28,558/year
  1-year Reserved Instance (same node type): ~$1.80/hr equivalent × 24 × 365 = $15,768/year

That's a ~45% reduction for predictable, steady-state workloads — the trade-off is a
1-3 year commitment, so Reserved Instances only make sense once usage is stable and
forecastable (the same logic as a BigQuery slot commitment, above).
```

**The FinOps mindset**: query efficiency = direct dollar savings. Senior data professionals are expected to own their team's cloud spend, set up resource monitors, and regularly audit top-cost queries in the query history — whether that's BigQuery's `INFORMATION_SCHEMA.JOBS`, Snowflake's `ACCOUNT_USAGE.WAREHOUSE_METERING_HISTORY`, or Redshift's `STL_QUERY` system tables.

---

## Hands-on Lab

### Exercise 1: BigQuery ML Churn Prediction (Easy)

```sql
-- Setup: create the table and load sample rows so you can verify syntax
-- without needing a live BigQuery project.
CREATE TABLE ml_dataset.telecom_customers (
  customer_id     STRING,
  tenure_months   INT64,
  monthly_charges FLOAT64,
  total_charges   FLOAT64,
  contract_type   STRING,
  tech_support    BOOL,
  churned         BOOL
);

INSERT INTO ml_dataset.telecom_customers VALUES
  ('C001', 2,  85.50,  171.00, 'month-to-month', FALSE, TRUE),
  ('C002', 34, 56.95,  1937.30, 'one-year',       TRUE,  FALSE),
  ('C003', 1,  90.10,  90.10,  'month-to-month', FALSE, TRUE),
  ('C004', 58, 42.30,  2453.40, 'two-year',       TRUE,  FALSE),
  ('C005', 5,  70.20,  351.00, 'month-to-month', FALSE, TRUE),
  ('C006', 72, 38.10,  2743.20, 'two-year',       TRUE,  FALSE),
  ('C007', 8,  95.00,  760.00, 'month-to-month', FALSE, NULL),
  ('C008', 22, 61.40,  1350.80, 'one-year',       TRUE,  NULL),
  ('C009', 45, 49.90,  2245.50, 'two-year',       TRUE,  NULL),
  ('C010', 3,  88.75,  266.25, 'month-to-month', FALSE, NULL);

-- 1. Train a logistic regression model named `ml_dataset.churn_lr`
-- 2. Evaluate it — report precision, recall, and AUC
-- 3. Predict churn probability for all customers where churned IS NULL
-- 4. Export the top 20 highest-risk customers (customer_id + probability)
```

**Expected result** of `SELECT * FROM ML.EVALUATE(MODEL ml_dataset.churn_lr);` — a one-row table with these column headers (values will vary by random split):

| precision | recall | accuracy | f1_score | roc_auc |
| --------- | ------ | -------- | -------- | ------- |
| 0.83      | 0.79   | 0.81     | 0.81     | 0.88    |

### Exercise 2: Snowflake Cortex Sentiment Pipeline (Medium)

```sql
-- You have a `customer_reviews` table with: review_id, product_id, review_text, rating
-- Build a pipeline that:
-- 1. Computes sentiment score for each review using CORTEX.SENTIMENT
-- 2. Classifies reviews into: 'quality_issue', 'shipping_issue', 
--    'price_feedback', 'positive' using CORTEX.CLASSIFY_TEXT
-- 3. Creates a summary view: for each product_id, show avg_sentiment, 
--    avg_rating, most_common_category, review_count
-- 4. Flags products where avg_sentiment < -0.3 AND avg_rating < 3.0 
--    as 'needs_attention'

-- Write the complete Snowflake SQL (CREATE TABLE AS + final summary query)
```

**Full solution:**

```sql
-- Step 1: Score sentiment + classify each review into a working table
CREATE OR REPLACE TABLE scored_reviews AS
SELECT
  review_id,
  product_id,
  review_text,
  rating,
  SNOWFLAKE.CORTEX.SENTIMENT(review_text) AS sentiment_score,
  SNOWFLAKE.CORTEX.CLASSIFY_TEXT(
    review_text,
    ['quality_issue', 'shipping_issue', 'price_feedback', 'positive']
  ):label::VARCHAR AS category
FROM customer_reviews;

-- Step 2: Build the per-product summary view
CREATE OR REPLACE VIEW product_review_summary AS
SELECT
  product_id,
  AVG(sentiment_score)                              AS avg_sentiment,
  AVG(rating)                                        AS avg_rating,
  MODE(category)                                     AS most_common_category,
  COUNT(*)                                           AS review_count,
  CASE
    WHEN AVG(sentiment_score) < -0.3 AND AVG(rating) < 3.0
      THEN TRUE ELSE FALSE
  END                                                AS needs_attention
FROM scored_reviews
GROUP BY product_id;

-- Step 3: Surface the flagged products
SELECT * FROM product_review_summary
WHERE needs_attention = TRUE
ORDER BY avg_sentiment ASC;
```

**Expected result** of `SELECT * FROM product_review_summary LIMIT 3;` — schema:

| product_id | avg_sentiment | avg_rating | most_common_category | review_count | needs_attention |
| ---------- | -------------- | ---------- | --------------------- | ------------- | ---------------- |
| SKU-1042   | -0.52           | 2.1        | quality_issue          | 38            | TRUE              |
| SKU-2090   | 0.61            | 4.6        | positive               | 112           | FALSE             |
| SKU-3311   | -0.08           | 3.4        | shipping_issue         | 27            | FALSE             |

### Exercise 3: Cost Engineering Design (Hard)

```
Your team's BigQuery bill spiked from $400 to $3,200 this month.
The `project.dataset.user_events` table is 40 TB and is queried by 
8 analysts who each run 3-5 queries per day — mostly filtering by 
date range and country.

Current table DDL (no optimization):
  CREATE TABLE user_events (
    event_id STRING,
    user_id STRING,
    event_type STRING,
    country STRING,
    event_timestamp TIMESTAMP,
    properties JSON
  );

Design:
1. What partitioning strategy would you apply? Write the ALTER TABLE.
2. What clustering columns would you choose? Justify.
3. Write a Materialized View for the most common query pattern 
   (daily active users by country).
4. How would you implement a Slot Commitment reservation vs on-demand 
   for this team's usage pattern?
5. What BigQuery query to audit which analysts are generating the most cost?
   (hint: INFORMATION_SCHEMA.JOBS)
```

---

## Mastery Check

**Q1**: What is the key difference between ML in BigQuery and traditional sklearn ML?
<details><summary>Answer</summary>

**Data location**: In sklearn, you export data to a Python environment, train there, then deploy separately. In BigQuery ML, data never leaves BigQuery — training, evaluation, and prediction all happen via SQL in the warehouse. Benefits: no data transfer costs, no Python environment management, no deployment gap, model is immediately queryable by any SQL user. Limitation: less flexibility than custom Python models; best for standard algorithms (logistic regression, XGBoost, ARIMA).
</details>

**Q2**: What is Snowflake Cortex and what makes it different from calling a separate LLM API?
<details><summary>Answer</summary>

Cortex brings LLM functions (COMPLETE, SENTIMENT, CLASSIFY_TEXT, SUMMARIZE, EXTRACT_ANSWER) directly into SnowSQL. Difference from external API: (1) **No data leaves Snowflake** — critical for PII/compliance, (2) **No Python/ETL required** — run LLM analytics in pure SQL, (3) **Billing in Snowflake credits** — unified cost management, (4) **Scales with warehouse** — no separate API rate limits to manage. The trade-off: fewer model choices vs calling OpenAI/Anthropic directly.
</details>

**Q3**: Why does adding a `WHERE DATE(event_timestamp) = '2026-02-22'` filter NOT reduce cost in BigQuery if the table isn't partitioned on `event_timestamp`?
<details><summary>Answer</summary>

BigQuery scans full column files (columnar storage). Without partitioning, the engine must read every row's `event_timestamp` to evaluate the filter — full table scan. With `PARTITION BY DATE(event_timestamp)`, BigQuery physically stores each day's data in separate files. The filter `WHERE DATE(event_timestamp) = '2026-02-22'` tells the engine to only open that day's files — **partition pruning** reduces scan from 40 TB to perhaps 100 GB. Cost is proportional to bytes scanned, so partition pruning is the single biggest cost lever.
</details>

**Q4**: How does Redshift ML differ architecturally from BigQuery ML?
<details><summary>Answer</summary>

BigQuery ML trains **inside BigQuery** using Google's infrastructure — fast, seamless, no external services. Redshift ML **delegates training to SageMaker Autopilot** — you define the model in SQL, Redshift sends data to S3, SageMaker trains (which can take 30-90 minutes), then deploys the model back to Redshift as a SQL function. Architectural implication: Redshift ML requires IAM role + S3 bucket setup, has longer training latency, but benefits from SageMaker's AutoML capabilities and AWS ecosystem integration.
</details>

**Q5**: A CFO asks you: "We spend $8,000/month on BigQuery. Is that a lot?" How do you answer?
<details><summary>Answer</summary>

You need context, not a yes/no. Answer: "It depends on what decisions that $8,000 is powering. If it's supporting 50 analysts making $10M+ in data-driven decisions, it's very ROI-positive. Let me audit what's actually driving the cost." Then: query `INFORMATION_SCHEMA.JOBS` to see top-cost queries by user, identify unpartitioned table scans, and propose 3 quick wins (partition keys, materialized views, slot reservations for predictable workloads). Present: "We can likely reduce this to $2,000/month with 2 weeks of optimization work."
</details>

---

## Glossary

| Term | Definition |
| --- | --- |
| **BigQuery ML (BQML)** | Google BigQuery's built-in feature for training, evaluating, and deploying ML models using standard SQL (`CREATE MODEL`), without exporting data or writing Python. |
| **ML.EVALUATE** | BQML function that scores a trained model against a held-out test set, returning precision, recall, accuracy, F1, and ROC-AUC. |
| **ML.PREDICT** | BQML function that applies a trained model to new rows and returns predicted labels/probabilities. |
| **ML.EXPLAIN_PREDICT** | BQML function that returns per-feature attribution for a prediction — answers "why did the model predict this?" |
| **ARIMA+** | BQML's enhanced AutoRegressive Integrated Moving Average time-series model type; supports multi-series forecasting and automatic seasonality/trend decomposition. |
| **Partition Pruning** | The query optimizer skipping entire partitions (e.g., days) that cannot match a `WHERE` filter, so only relevant files are scanned — the single biggest cost lever in BigQuery. |
| **Clustering (BigQuery)** | Sorting data within each partition by one or more columns so that filtered queries on those columns scan even fewer bytes than partitioning alone provides. |
| **Snowflake Cortex** | Snowflake's suite of built-in LLM functions (sentiment, classification, completion, summarization, extraction) callable directly from SQL. |
| **CORTEX.SENTIMENT** | Cortex function that scores text from -1 (very negative) to 1 (very positive). |
| **CORTEX.COMPLETE** | Cortex function that sends a prompt to a hosted LLM (e.g., `mistral-7b`) and returns the generated text — LLM completion as a SQL function call. |
| **Redshift ML** | Amazon Redshift's ML feature that delegates model training to SageMaker Autopilot; you define the model in SQL, Redshift orchestrates training in S3/SageMaker, and a callable SQL prediction function is generated automatically. |
| **SageMaker Autopilot** | AWS's AutoML service that Redshift ML uses under the hood — automatically tries multiple model types and hyperparameters to find the best performer. |
| **Slot Commitment** | A Bigquery flat-fee billing model where you reserve a fixed pool of compute capacity ("slots") for predictable, high-volume workloads, instead of paying per byte scanned. |
| **On-Demand Pricing** | Pay-as-you-go billing (e.g., BigQuery's $5–7/TB scanned) with no upfront reservation — best for unpredictable or low-volume usage. |
| **FinOps** | The discipline of treating cloud spend as a managed, continuously-optimized budget line — combining engineering, finance, and operations practices to track and reduce cloud cost. |

---

## Further Reading & Tools

- 📖 [BigQuery ML Documentation](https://cloud.google.com/bigquery/docs/bqml-introduction) — Complete BQML reference
- 📖 [Snowflake Cortex Functions](https://docs.snowflake.com/en/user-guide/snowflake-cortex/llm-functions) — Official Cortex guide
- 📖 [Redshift ML Guide](https://docs.aws.amazon.com/redshift/latest/dg/redshift-ml.html) — SageMaker integration docs
- 🔧 [BigQuery Pricing Calculator](https://cloud.google.com/products/calculator) — Estimate before you build
- 🏢 **Spotify Engineering**: "How Spotify Uses BigQuery ML to Predict User Behavior" — real-world BQML at scale

---

## Summary

Today you mastered the frontier of SQL-native cloud analytics:

- ✅ **BigQuery ML**: train, evaluate, and predict with logistic regression, XGBoost, ARIMA+ — entirely in SQL
- ✅ **Snowflake Cortex**: sentiment analysis, LLM completion, text classification — LLMs as SQL functions
- ✅ **Redshift ML**: SageMaker Autopilot integration — enterprise AWS ecosystem ML via SQL
- ✅ **Cost engineering**: partitioning + clustering + materialized views = 100x-400x cost reduction
- ✅ **Platform selection matrix**: BigQuery (serverless), Snowflake (data sharing), Redshift (AWS-native)

**Phase 9 Complete!** You've now mastered the full enterprise SQL stack from fundamentals through performance engineering and cloud-native ML. This is the complete journey — from writing your first SELECT on Day 1 to training ML models in the cloud warehouse on Day 108C. → **Continue to Phase 10** for Generative AI & LLM Engineering.
