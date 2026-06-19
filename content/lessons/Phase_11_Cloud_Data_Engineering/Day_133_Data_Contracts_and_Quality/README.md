---
day: 133
title: "Data Contracts and Quality — Great Expectations, Soda, SLAs"
phase: 11
phaseTitle: "Cloud Data Engineering"
slug: "data-contracts-quality"
duration: 90
difficulty: "intermediate"
tags:
  - data-quality
  - great-expectations
  - soda
  - data-contracts
  - sla
concepts:
  - "data contracts between producers and consumers"
  - "expectation suites and validation"
  - "data SLAs and SLOs"
  - "schema validation and profiling"
  - "anomaly detection on data"
prerequisites:
  - "Day 124: dbt at Scale"
  - "Day 127: Lakehouse Architecture"
outcomes:
  - "Design data contracts between data teams"
  - "Implement data quality checks with Great Expectations"
  - "Define and monitor data SLAs for production pipelines"
---

# ✅ Day 128: Data Contracts and Quality — Great Expectations, Soda, SLAs

> *"Bad data doesn't just produce wrong reports — it erodes trust. And once business users stop trusting the data, they stop using it. That's the real cost."*

---

## The "Never-Coded" Bridge

**Think of data contracts like building codes.** Before a contractor builds your house, there are written standards: walls must support X load, wiring must follow Y code, plumbing pressure must stay within Z range. Without codes, buildings collapse. Data contracts do the same for data — the team producing data guarantees its format, freshness, and quality; the consuming team builds dashboards and models confident those guarantees hold.

**Great Expectations** and **Soda** are the building inspectors — they automatically verify that every data delivery meets the contract.

---

## The Technical Deep Dive

### 1. What Is a Data Contract?

```yaml
# data_contracts/orders_contract.yaml
# A data contract is a formal agreement between data producer and consumer

contract:
  name: "Orders Pipeline Contract"
  version: "2.1.0"
  owner: "data-engineering@company.com"
  consumers:
    - "marketing-analytics@company.com"
    - "finance-team@company.com"

  schema:
    table: "gold.fct_orders"
    columns:
      - name: order_id
        type: bigint
        nullable: false
        unique: true
      - name: customer_id
        type: bigint
        nullable: false
      - name: order_date
        type: date
        nullable: false
      - name: total_amount
        type: decimal(12,2)
        nullable: false
        constraints:
          - "total_amount > 0"
          - "total_amount < 1000000"

  quality:
    freshness:
      max_delay_minutes: 120
      measured_by: "MAX(order_date)"
    completeness:
      min_row_count: 1000
      max_null_rate:
        customer_id: 0.00
        total_amount: 0.00
    accuracy:
      duplicate_rate: 0.001  # < 0.1% duplicates allowed

  sla:
    availability: "99.5%"
    refresh_schedule: "Daily by 06:00 UTC"
    breaking_change_notice: "14 days"
```

### 2. Great Expectations — Build Expectation Suites

```python
import great_expectations as gx

context = gx.get_context()

# Create a data source
datasource = context.data_sources.add_pandas("my_datasource")
data_asset = datasource.add_dataframe_asset("orders")

# Build an expectation suite
suite = context.suites.add(gx.ExpectationSuite(name="orders_quality"))

# Add expectations
suite.add_expectation(
    gx.expectations.ExpectColumnValuesToNotBeNull(column="order_id")
)
suite.add_expectation(
    gx.expectations.ExpectColumnValuesToBeUnique(column="order_id")
)
suite.add_expectation(
    gx.expectations.ExpectColumnValuesToBeBetween(
        column="total_amount", min_value=0, max_value=1_000_000
    )
)
suite.add_expectation(
    gx.expectations.ExpectTableRowCountToBeBetween(
        min_value=1000, max_value=10_000_000
    )
)
suite.add_expectation(
    gx.expectations.ExpectColumnValuesToMatchRegex(
        column="email", regex=r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
    )
)

# Validate a batch of data
batch = data_asset.add_batch_definition_whole_dataframe("full_batch")
results = batch.validate(suite)

# Check results
print(f"Overall success: {results.success}")
for result in results.results:
    status = "✅" if result.success else "❌"
    print(f"  {status} {result.expectation_config.type}: {result.result}")
```

### 3. Soda — SQL-Based Data Checks

```yaml
# soda/checks/orders_checks.yml
# Soda uses YAML + SQL for data quality checks

checks for gold.fct_orders:
  # Freshness check
  - freshness(order_date) < 2d:
      name: "Orders data is fresh"

  # Volume checks
  - row_count > 1000:
      name: "Minimum expected rows"
  - row_count between 1000 and 10000000

  # Null checks
  - missing_count(order_id) = 0
  - missing_count(customer_id) = 0
  - missing_percent(email) < 5%

  # Uniqueness
  - duplicate_count(order_id) = 0

  # Value ranges
  - invalid_count(total_amount) = 0:
      valid min: 0
      valid max: 1000000

  # Schema check
  - schema:
      fail:
        when required column missing: [order_id, customer_id, order_date, total_amount]
        when wrong type:
          order_id: bigint
          total_amount: decimal

  # Anomaly detection (ML-based)
  - anomaly detection for row_count:
      name: "Unusual order volume"
      warn: 0.1  # 10% deviation warning
      fail: 0.3  # 30% deviation failure

  # Custom SQL
  - orders_revenue_check:
      orders_revenue_check query: |
        SELECT COUNT(*)
        FROM gold.fct_orders
        WHERE total_amount < 0
      fail: when > 0
```

### 4. Data SLAs and Monitoring

```python
# Implementing Data SLA monitoring
from datetime import datetime, timedelta

data_slas = {
    "gold.fct_orders": {
        "freshness_sla": timedelta(hours=2),
        "completeness_sla": 0.995,     # 99.5% of expected rows
        "accuracy_sla": 0.001,          # <0.1% error rate
        "availability_sla": 0.995,      # 99.5% uptime
    },
    "gold.fct_revenue": {
        "freshness_sla": timedelta(hours=4),
        "completeness_sla": 0.999,
        "accuracy_sla": 0.0001,
        "availability_sla": 0.999,
    },
}

def check_freshness_sla(table: str, last_updated: datetime) -> dict:
    """Check if a table meets its freshness SLA."""
    sla = data_slas[table]["freshness_sla"]
    age = datetime.utcnow() - last_updated
    is_met = age <= sla
    return {
        "table": table,
        "sla_hours": sla.total_seconds() / 3600,
        "actual_age_hours": age.total_seconds() / 3600,
        "sla_met": is_met,
        "severity": "critical" if age > sla * 2 else "warning" if not is_met else "ok",
    }
```

---

## Senior-Level Insights

### The Contract Negotiation

Data contracts aren't just technical documents — they're agreements between teams. The producing team commits to quality guarantees; the consuming team agrees on change notification periods. Breaking changes need 14-day notice. This reduces the "I changed the column name and broke 5 dashboards" problem.

### Quality as a Feature, Not a Tax

Teams that treat data quality as an afterthought build "data quality tax" — cleaning bad data becomes 60% of analysts' time. Teams that build quality into the pipeline (expectations in DLT, Soda checks in CI/CD) spend 10% on quality and 90% on insights.

---

## Hands-on Lab

### Exercise 1: Write a Data Contract

```yaml
# TODO: Write a data contract for a `dim_customers` table:
# Include: schema (5+ columns), freshness SLA, completeness thresholds,
# acceptable null rates, value ranges, and breaking change policy.
```

### Exercise 2: Great Expectations Suite

```python
# TODO: Build an expectation suite for a financial transactions table with:
# 1. No null transaction_ids (not null + unique)
# 2. Amount between -1M and +1M (negative = refund)
# 3. Currency must be one of: USD, EUR, GBP, JPY
# 4. Transaction_date must be within last 365 days
# 5. Row count anomaly detection (compare to 7-day average)
```

### Exercise 3: SLA Dashboard Design

```python
# TODO: Design a data quality dashboard that shows:
# 1. Freshness status for the 10 most critical tables
# 2. 7-day trend of validation pass/fail rates
# 3. Top 5 most common data quality issues this week
# 4. SLA compliance percentage (target: >99.5%)
```

---

## Mastery Check

**Q1**: What is a data contract and who should own it?
<details><summary>Answer</summary>
A data contract is a formal agreement specifying schema, quality guarantees, freshness SLAs, and change management policies for a dataset. It should be co-owned: the producing team commits to meeting the guarantees, and consuming teams specify their requirements. Ideally, contracts are version-controlled (in Git) and validated automatically in CI/CD.
</details>

**Q2**: When should you use Great Expectations vs. dbt tests?
<details><summary>Answer</summary>
Use dbt tests for in-warehouse checks that are part of the transformation DAG (uniqueness, not-null, referential integrity, accepted values). Use Great Expectations for more complex validations before data enters the warehouse (schema drift detection, distribution checks, anomaly detection, cross-table consistency) and for non-dbt environments.
</details>

**Q3**: What is a freshness SLA and how do you monitor it?
<details><summary>Answer</summary>
A freshness SLA guarantees how recent the data in a table will be — e.g., "orders table updated within 2 hours of source." Monitor by comparing `MAX(updated_at)` against current time. If the gap exceeds the SLA, fire an alert. Use Soda's `freshness()` check or a custom monitoring query.
</details>

**Q4**: Your data quality dashboard shows a sudden 15% increase in null email addresses. What do you do?
<details><summary>Answer</summary>
1. Check if the source system changed — did a new app version stop collecting emails? 2. Check the ETL pipeline — did a code change in the transformation introduce the bug? 3. Check data contracts — does the producing team know about this? 4. If it's a source issue, file a ticket with the producer and add a temporary imputation or filter. Don't silently exclude null records — that hides the problem.
</details>

**Q5**: What is the difference between data quality checks and anomaly detection?
<details><summary>Answer</summary>
Data quality checks are deterministic rules: "this column must not be null," "values must be between 0 and 1M." They catch known failure modes. Anomaly detection uses statistical methods to catch unknown issues: "row count today is 3 standard deviations below the 30-day average." Both are needed: rules catch definite problems, anomaly detection catches unexpected ones.
</details>

---

## Summary

- ✅ **Data contracts** formalize agreements between data producers and consumers
- ✅ **Great Expectations** provides rich, programmatic data validation with 300+ built-in expectations
- ✅ **Soda** offers SQL-native, YAML-configured checks ideal for warehouse-centric teams
- ✅ **Data SLAs** define freshness, completeness, and accuracy guarantees with monitoring
- ✅ **Quality is a feature**: Build it into the pipeline, don't bolt it on afterward

**Tomorrow → Day 129**: **Cloud Security and Compliance** — VPC, encryption, PII handling, and the regulations every data engineer must know.
