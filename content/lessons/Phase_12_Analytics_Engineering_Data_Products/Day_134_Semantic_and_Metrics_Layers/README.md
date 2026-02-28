---
day: 134
title: "Semantic and Metrics Layers — Define Once, Use Everywhere"
phase: 12
phaseTitle: "Analytics Engineering & Data Products"
slug: "semantic-metrics-layers"
duration: 90
difficulty: "intermediate"
tags:
  - semantic-layer
  - metrics
  - cube
  - lookml
  - dbt-semantic-layer
concepts:
  - "semantic layer architecture"
  - "metric definitions and governance"
  - "dbt Semantic Layer and MetricFlow"
  - "Cube.js for headless BI"
  - "LookML for Looker"
prerequisites:
  - "Day 133: Analytics Engineer Role"
  - "Day 124: dbt at Scale"
outcomes:
  - "Design a semantic layer that eliminates metric inconsistencies"
  - "Define reusable metrics using dbt Semantic Layer"
  - "Compare Cube.js, dbt Semantic Layer, and LookML approaches"
---

# 📐 Day 134: Semantic and Metrics Layers — Define Once, Use Everywhere

> *"When the CEO asks 'What's our revenue?' and gets three different numbers from three teams, you don't have a data problem — you have a semantic layer problem."*

---

## The "Never-Coded" Bridge

**Think of the semantic layer like a dictionary for your company's data.** Without a dictionary, different teams use words differently — "active user" means "logged in this month" to marketing but "made a purchase this quarter" to finance. The semantic layer is the authoritative dictionary: it defines every metric once, in one place, and every dashboard, report, and application uses that definition.

Without it: 50 dashboards × 10 metrics = 500 potential inconsistencies. With it: 10 metric definitions → consumed everywhere.

---

## The Technical Deep Dive

### 1. The Semantic Layer Problem

```python
# THREE different "revenue" queries across the company:

# Marketing dashboard (includes refunds, wrong!)
marketing_sql = """
SELECT SUM(amount) as revenue FROM orders WHERE date >= '2025-01-01'
"""

# Finance report (excludes refunds, correct... maybe)
finance_sql = """
SELECT SUM(amount) as revenue FROM orders
WHERE date >= '2025-01-01' AND status != 'refunded'
"""

# Executive dashboard (excludes refunds + taxes, also correct?)
exec_sql = """
SELECT SUM(amount - tax) as revenue FROM orders
WHERE date >= '2025-01-01' AND status NOT IN ('refunded', 'cancelled')
"""

# THE FIX: Define "revenue" ONCE in a semantic layer
# Every tool (Looker, Superset, Python, API) queries the same definition
```

### 2. dbt Semantic Layer with MetricFlow

```yaml
# models/semantic/sem_orders.yml
# dbt Semantic Layer: define metrics as code

semantic_models:
  - name: orders
    defaults:
      agg_time_dimension: order_date
    model: ref('fct_orders')

    entities:
      - name: order_id
        type: primary
      - name: customer_id
        type: foreign

    dimensions:
      - name: order_date
        type: time
        type_params:
          time_granularity: day
      - name: region
        type: categorical
      - name: category
        type: categorical
      - name: order_status
        type: categorical

    measures:
      - name: order_count
        agg: count
        expr: order_id
      - name: total_revenue
        agg: sum
        expr: total_amount
      - name: total_cost
        agg: sum
        expr: cost_amount

metrics:
  - name: revenue
    description: "Net revenue excluding refunds and cancellations"
    type: simple
    label: "Revenue"
    type_params:
      measure: total_revenue
    filter:
      - "{{ Dimension('order_status') }} NOT IN ('refunded', 'cancelled')"

  - name: gross_margin
    description: "Gross margin percentage"
    type: derived
    label: "Gross Margin %"
    type_params:
      expr: (revenue - total_cost) / revenue * 100
      metrics:
        - name: revenue
        - name: total_cost
          filter:
            - "{{ Dimension('order_status') }} NOT IN ('refunded', 'cancelled')"

  - name: average_order_value
    description: "Average revenue per order"
    type: derived
    label: "AOV"
    type_params:
      expr: revenue / order_count
      metrics:
        - name: revenue
        - name: order_count
```

### 3. Cube.js — Headless BI Semantic Layer

```javascript
// schema/Orders.js — Cube.js semantic model
cube('Orders', {
  sql: `SELECT * FROM gold.fct_orders`,

  measures: {
    count: {
      type: 'count',
    },
    revenue: {
      sql: 'total_amount',
      type: 'sum',
      filters: [
        { sql: `${CUBE}.status NOT IN ('refunded', 'cancelled')` }
      ],
    },
    aov: {
      sql: `${revenue} / NULLIF(${count}, 0)`,
      type: 'number',
      title: 'Average Order Value',
    },
  },

  dimensions: {
    orderDate: {
      sql: 'order_date',
      type: 'time',
    },
    region: {
      sql: 'region',
      type: 'string',
    },
    status: {
      sql: 'status',
      type: 'string',
    },
  },

  preAggregations: {
    dailyByRegion: {
      measures: [Orders.revenue, Orders.count],
      dimensions: [Orders.region],
      timeDimension: Orders.orderDate,
      granularity: 'day',
      refreshKey: {
        every: '1 hour',
      },
    },
  },
});
```

### 4. Comparison Matrix

| Feature                 | dbt Semantic Layer    | Cube.js                    | LookML (Looker)          |
| ----------------------- | --------------------- | -------------------------- | ------------------------ |
| **Definition Language** | YAML (MetricFlow)     | JavaScript                 | LookML (proprietary DSL) |
| **Query Engine**        | Pushdown to warehouse | Cube Store (caching layer) | Looker SQL generation    |
| **API Access**          | dbt Cloud GraphQL API | REST + GraphQL APIs        | Looker API only          |
| **Caching**             | Warehouse-level       | Built-in pre-aggregations  | PDT (Persistent Derived) |
| **Open Source**         | MetricFlow (OSS)      | Fully open source          | Proprietary              |
| **Best For**            | dbt-centric teams     | Custom apps + embedded     | Looker-centric orgs      |
| **Lock-in Risk**        | Low (dbt + warehouse) | Low (open source)          | High (Looker-specific)   |

---

## Senior-Level Insights

### The "Metric Governance" Problem

Defining metrics isn't the hard part — getting everyone to agree on definitions is. The analytics engineer must facilitate metric governance: bring marketing and finance together, agree on "revenue" definition, document decisions, and enforce the single definition. This is 70% people work, 30% technical.

---

## Hands-on Lab

### Exercise 1: Define 5 Core Metrics

```yaml
# TODO: Define these 5 metrics for an e-commerce company using dbt Semantic Layer:
# 1. Monthly Active Users (MAU) — users with at least 1 session in 30 days
# 2. Revenue — net revenue excluding refunds
# 3. Customer Acquisition Cost (CAC) — total marketing spend / new customers
# 4. Retention Rate — (returning customers / total customers last month) × 100
# 5. Gross Margin % — (revenue - COGS) / revenue × 100
```

### Exercise 2: Semantic Layer Selection

For each scenario, which semantic layer tool would you recommend?
1. A dbt Cloud shop with 20 analysts using Tableau.
2. A startup building an embedded analytics product for customers.
3. A large enterprise standardized on Google Cloud + Looker.

### Exercise 3: Metric Governance Meeting

```markdown
## TODO: Plan a metric governance meeting agenda:
- Who should attend? (roles and teams)
- What metrics need agreement most urgently?
- How do you handle disagreements?
- What documentation is produced?
- How often should the committee meet?
```

---

## Mastery Check

**Q1**: What problem does a semantic layer solve?
<details><summary>Answer</summary>
A semantic layer provides a single, authoritative definition for every business metric. Without it, different teams write their own SQL to calculate "revenue," "MAU," or "churn" — producing inconsistent numbers. The semantic layer defines each metric once with its business logic, filters, and dimensions, then every tool queries from that definition.
</details>

**Q2**: How does the dbt Semantic Layer work under the hood?
<details><summary>Answer</summary>
MetricFlow translates metric queries into optimized SQL that runs against your data warehouse. You define semantic models (entities, dimensions, measures) and metrics (simple, derived, cumulative) in YAML. When a tool queries "revenue by region for Q1," MetricFlow generates the appropriate SQL with correct filters and GROUP BY, pushing computation to the warehouse. No data is duplicated.
</details>

**Q3**: When would you choose Cube.js over dbt Semantic Layer?
<details><summary>Answer</summary>
Choose Cube.js when: (1) you're building a customer-facing embedded analytics product (Cube's API serves metrics directly to your app UI), (2) you need aggressive caching with pre-aggregations for sub-second response times, or (3) you're not using dbt for transformations. dbt Semantic Layer is better when you're already dbt-centric and want tight integration with your dbt models.
</details>

**Q4**: What is a "derived metric" and give an example?
<details><summary>Answer</summary>
A derived metric is calculated from other metrics — not directly from raw measures. Example: Average Order Value = Revenue / Order Count. In MetricFlow, you define it as `type: derived` with an `expr` referencing the component metrics. This ensures consistency: if the revenue definition changes, AOV automatically updates everywhere.
</details>

**Q5**: Why is metric governance more of a people challenge than a technical one?
<details><summary>Answer</summary>
Different teams have legitimate reasons for measuring things differently — marketing measures "users" differently from finance because they have different objectives. The technical implementation is straightforward (write YAML). The hard part is getting stakeholders in a room, agreeing on definitions, handling edge cases (what about internal test users? What about partial refunds?), and enforcing discipline to use the shared definitions instead of writing ad-hoc SQL.
</details>

---

## Summary

- ✅ **Semantic layer** = single definition for every metric, consumed by all tools
- ✅ **dbt Semantic Layer**: YAML-based, warehouse-pushdown, tight dbt integration
- ✅ **Cube.js**: API-first, pre-aggregation caching, great for embedded analytics
- ✅ **LookML**: Looker-specific, powerful but locked into the Looker ecosystem
- ✅ **Governance**: The hardest part is getting teams to agree — schedule a metrics committee

**Tomorrow → Day 135**: **Self-Serve Analytics** — empowering stakeholders with no-code/low-code tools while maintaining data quality.
