---
day: 76
title: "BI Platforms & Automation"
phase: 7
phaseTitle: "BI Analytics, Governance & Modern Data Stack"
slug: "bi-platforms"
duration: 120
difficulty: "intermediate"
tags:
  - power-bi
  - tableau
  - looker
  - automation
concepts:
  - "The Semantic Layer"
  - "Import vs Direct Query"
  - "Headless BI"
  - "DAX vs Tabular vs LookML"
prerequisites:
  - "Understanding of Dashboards (Day 75)"
  - "Basic SQL (Day 73)"
outcomes:
  - "Choose the right tool for the job (Tableau vs Power BI)"
  - "Explain the Semantic Layer to a non-technical user"
  - "Automate report delivery (Scheduled Refresh)"
---

# 🎯 Day 76: BI Platforms & Automation

> *"The best tool is the one your users actually open."*

---

## The "Never-Coded" Bridge

**The Menu: Printed vs. Chef's Blackboard vs. iPad.**

1. **Tableau (The Artist's Canvas)**:
    * Beautiful, flexible, powerful.
    * **Pros**: Stunning visuals. Deep analysis.
    * **Cons**: Expensive. Hard to govern (everyone paints their own picture).
    * *Analogy*: Photoshop for Data.

2. **Power BI (The Corporate Excel)**:
    * Integrated, structured, cheap(ish).
    * **Pros**: Works with Excel perfectly. Good Semantic Model.
    * **Cons**: Can be ugly. DAX is hard.
    * *Analogy*: Super-Charged Pivot Tables.

3. **Looker (The Code-First Platform)**:
    * Web-based, governed by Git.
    * **Pros**: "Define once, use everywhere" (Semantic Layer). Version Controlled.
    * **Cons**: Requires learning LookML (code).
    * *Analogy*: GitHub for Dashboarding.

---

## The Technical Deep Dive

### 1. The Semantic Layer

The "Universal Translator" between Database tables and Business terms.

* **Database**: `sales_table`, `cust_table`.
* **Semantic Layer**: Defines `Total Revenue = SUM(sales.amount)`.
* **BI Tool**: User drags "Total Revenue" onto the canvas. They don't write SQL.
* *Benefit*: If the definition changes (e.g., exclude returns), you update it in **one place** (The Layer), not in 50 reports.

### 2. Import vs. Direct Query

* **Import Mode (In-Memory)**:
  * Copy data from SQL -> BI Tool's RAM.
  * **Pros**: Cruising speed (Instant clicks).
  * **Cons**: Data is stale (until next refresh). Size limits (10GB).
* **Direct Query (Live Connection)**:
  * BI Tool sends SQL to Database on every click.
  * **Pros**: Real-time data. Unlimited size.
  * **Cons**: Slow visuals (Network latency).

### 3. Headless BI (Metrics Layer)

A modern trend. Define metrics in code (e.g., Python/YAML), then fetch them via API into *any* tool (Slack, Excel, Tableau).

* **Why?**: Decouples logic from the visualization tool.

### 4. Platform Evaluation: Tableau vs. Power BI vs. Looker vs. Headless/Open-Source

BrightCart's analytics team is choosing a platform for the company's web, app, and marketplace sales data. "Which tool is best?" is the wrong question — the right one is "which tool fits our governance, budget, and embedding needs?"

| Dimension | Tableau | Power BI | Looker | Open-Source / Headless (Metabase, Superset, dbt Semantic Layer) |
|---|---|---|---|---|
| **Licensing** | ~$70/user/month (Creator); per-viewer or capacity-based options | ~$10–$20/user/month (Pro/PPU); cheap if already on Microsoft 365 | Enterprise pricing, often $3,000+/month platform fee + per-user | Free (self-hosted) to low-cost cloud tiers; engineering time is the real cost |
| **Embedding** | Tableau Embedding API v3, JS API; polished but license-gated | Power BI Embedded (Azure capacity-based, can get pricey at scale) | Looker Embedded SDK / Looker Components, strong for SaaS products | Fully embeddable (iframe/API) since you own the code; no vendor embedding fee |
| **APIs** | REST + Metadata API; mature but verbose | REST API + Power Query/M; deep Microsoft Graph integration | Looker API + LookML is itself a queryable API surface | Native REST/GraphQL APIs; you control the contract |
| **Governance** | Tableau Catalog, certified data sources, but governance is bolted on | Microsoft Purview integration, sensitivity labels, native to Entra ID | Strongest built-in governance: LookML is version-controlled, single semantic layer | Governance is DIY — you build RBAC, lineage, and certification yourself |
| **Deployment** | Desktop authoring + Server/Cloud; heavier client footprint | Desktop (Windows-only) + Service; lighter cloud-first push | 100% web/cloud, no desktop client | Self-hosted (Docker/Kubernetes) or managed cloud; ops burden is yours |
| **Lock-in risk** | High — proprietary `.twbx` files, hard to migrate calculations | High — DAX and Power Query logic don't port elsewhere | Medium — LookML is proprietary syntax but plain text (git-diffable, easier to extract than binary formats) | Low — open formats, swappable backend, but you inherit maintenance |

**BrightCart's decision**: They run a Microsoft shop (Office 365, Azure SQL), so Power BI's licensing and Direct Query integration with their warehouse made it the default choice for internal dashboards. They kept a small Looker instance only for the data the marketplace-channel partner team needed embedded in a partner portal, because Looker's embedded SDK and governed LookML model were worth the extra cost for that one external-facing use case.

### 5. Operationalizing BI: CI/CD, Environments, and Reliability

A dashboard is not "done" when it looks right once — it has to keep being right after every change. BrightCart's BI team treats dashboards like software:

* **Version control**: Power BI `.pbix`/`.pbip` files (or Looker's native git-backed LookML) are stored in a Git repo. Every semantic model change is a pull request, reviewed before merge.
* **Environments**: Three tiers — **Dev** (analyst's sandbox, can break), **Test/UAT** (stakeholders validate numbers against known totals), **Production** (certified, read-mostly). A new "Net Revenue" measure ships to Dev, gets validated in Test against last month's finance close, then promotes to Prod.
* **Service accounts**: Scheduled refreshes and embedded reports run under a dedicated **service account** (e.g., `svc-bi-refresh@brightcart.com`), never a named employee's personal login. When that employee leaves, refreshes don't break.
* **Refresh orchestration**: BrightCart's warehouse load finishes at 5:00 AM; an orchestrator (Airflow/ADF) triggers the BI platform's refresh API only after a "data ready" signal — not on a blind fixed clock — to avoid refreshing on top of incomplete data.
* **Alerting**: If a scheduled refresh fails twice in a row, an alert fires to the BI team's Slack/Teams channel and to the on-call data engineer, not silently to an email nobody reads.
* **Usage monitoring**: Admin APIs (Power BI Activity Log, Tableau Server Repository, Looker System Activity) track which dashboards are actually opened. BrightCart found 40% of "critical" dashboards had zero views in 90 days and retired them.
* **Disaster recovery**: Semantic models and connection credentials are backed up outside the BI tool itself (in Git + a secrets manager) so a platform outage doesn't mean rebuilding governance from memory.

---

## Senior-Level Insights

### TCO (Total Cost of Ownership)

* **License Cost**: Tableau ($70/user) vs Power BI ($10/user).
* **Hidden Costs**: Windows Servers for Power BI Gateway? Heavy RAM machines for Tableau Desktop? Training costs for DAX?
* **Lock-In**: Once you write 10,000 lines of DAX, you can *never* leave Microsoft easily.

### Governance vs. Agility

The eternal struggle.

* **Too much Governance**: "It takes 3 weeks to add a column." -> Users export to Excel (Scenario: Shadow IT).
* **Too much Agility**: "Everyone makes their own KPI." -> CEO sees 5 different Revenue numbers.
* **Solution**: Certified Datasets (Gold) + Sandbox Workspaces (Playground).

### Decision Matrix: Import vs. Direct Query

Descriptive trade-offs ("Import is fast, Direct Query is fresh") don't tell you what to *pick*. Use a weighted score instead. Rate each factor 1–5 for your situation, multiply by weight, sum.

| Factor | Weight | Import scores high when... | Direct Query scores high when... |
|---|---|---|---|
| Data freshness requirement | 30% | Daily/weekly reporting is fine | Inventory/price must be real-time (e.g., BrightCart's flash-sale stock counter) |
| Data volume | 20% | Dataset fits in memory (<1–10GB after compression) | Source table has billions of rows (e.g., raw clickstream) |
| Query complexity / interactivity | 20% | Users slice-and-dice heavily, expect instant response | Few, simple, pre-defined queries |
| Source system load tolerance | 15% | Source DB is already busy (OLTP, can't take query hits) | Source is a dedicated, scaled warehouse (Snowflake/BigQuery) that can absorb load |
| Governance/security needs | 15% | Row-level security can be pre-applied at load | Security must reflect live source-side permissions |

**Worked example — BrightCart's "Order Status" dashboard**: Freshness need is high (4/5 × 30% = 1.20 toward Direct Query), volume is moderate (3/5 × 20% = 0.60 toward Import), interactivity is low — ops just checks current backlog (2/5 × 20% = 0.40 toward Direct Query), source is a scaled Snowflake warehouse (4/5 × 15% = 0.60 toward Direct Query), RLS needs are simple by warehouse (3/5 × 15% = 0.45 toward Import). Direct Query wins on weighted total — confirming the team's instinct that this dashboard needed live data more than blazing speed.

Apply the same weighted approach to **platform selection** itself: score Tableau/Power BI/Looker/open-source on weighted factors (cost, embedding need, governance maturity, team skill, existing vendor stack) rather than picking by reputation alone.

### Pitfalls: How "Secure" Dashboards Leak Data Anyway

RLS and permissions are necessary but not sufficient. Senior BI engineers actively hunt for these leak paths:

* **RLS leakage via DAX/LookML bugs**: A measure that references a table *not* covered by the RLS filter (e.g., a disconnected currency-conversion table) can silently expose totals that should have been filtered. Always test RLS by impersonating each role, not just by reading the rule.
* **Cached-data exposure**: Import-mode datasets cache a full copy of the data in the BI server's memory/disk. If RLS is applied only in the *report* layer and not enforced at the *dataset* level, an admin or anyone with dataset-level access can bypass the visual filter and see everything.
* **Export permissions**: A report can be perfectly secured by RLS on-screen, but if "Export to Excel/CSV/PDF" is left enabled, `Manager_North` can export the *underlying query result* — and if that export happens through a misconfigured connector, it may not respect the same row filter as the visual.
* **Shared credentials**: Teams that share one generic login ("bi_viewer/bi_viewer123") to avoid buying more seats destroy any RLS or audit trail — the system can no longer tell who actually saw what.
* **Entitlement drift**: An employee moves from the North region to a corporate analyst role but keeps their old `Manager_North` security group membership for months because nobody runs periodic access reviews. RLS rules are only as good as the identity/role data feeding them — schedule quarterly entitlement audits.

---

## Hands-on Lab

### Exercise 1: The Semantic Definition

**Goal**: Write a "Measure" vs a "Calculated Column".

**Scenario**: You have `Price` and `Quantity`.

* **Calculated Column (Row Level)**: `Row_Sales = Price * Quantity`. Stored in RAM. Good for filtering.
* **Measure (Aggregate Level)**: `Total_Sales = SUM(Price * Quantity)`. Calculated on the fly. Good for values.

**Task**: Write the pseudo-code for "Margin %".

* *Correct*: `SUM(Profit) / SUM(Sales)` (Measure).
* *Incorrect*: `AVERAGE(Profit / Sales)` (Averages the percentages of rows - mathematically wrong).

### Exercise 2: Row Level Security (RLS) — Executable BrightCart Lab

**Goal**: Build, test, and verify an RLS rule against a real semantic model with sample data — not just describe the concept.

**Setup — BrightCart sales fact table (`fact_sales`)**:

| order_id | region | channel | rep_email | amount |
|---|---|---|---|---|
| 1001 | North | web | n/a | 250 |
| 1002 | North | app | n/a | 90 |
| 1003 | South | web | n/a | 400 |
| 1004 | South | marketplace | n/a | 150 |
| 1005 | East | web | n/a | 300 |
| 1006 | East | app | n/a | 120 |
| 1007 | West | marketplace | n/a | 500 |
| 1008 | West | web | n/a | 80 |

**Setup — Users & Roles table (`dim_user_role`)**:

| user_email | role | region_scope |
|---|---|---|
| north.manager@brightcart.com | RegionalManager | North |
| south.manager@brightcart.com | RegionalManager | South |
| east.manager@brightcart.com | RegionalManager | East |
| ceo@brightcart.com | Executive | ALL |
| auditor@brightcart.com | Auditor | ALL |

**Step 1 — Write the semantic-model RLS rule** (DAX-style, portable to LookML/Looker's `access_grant` or Power BI's RLS role filter):

```text
RLS_Filter(fact_sales) =
    LOOKUPVALUE(dim_user_role[region_scope], dim_user_role[user_email], USERPRINCIPALNAME())
    = "ALL"
    OR
    fact_sales[region] = LOOKUPVALUE(dim_user_role[region_scope], dim_user_role[user_email], USERPRINCIPALNAME())
```

**Step 2 — Define roles** in the semantic model: `RegionalManager` (gets the filter above applied), `Executive` and `Auditor` (no filter — `region_scope = "ALL"` short-circuits the rule).

**Step 3 — Test cases and expected visible-row counts**:

| Test — logged in as | Expected rows visible | Expected SUM(amount) |
|---|---|---|
| `north.manager@brightcart.com` | 2 (order_id 1001, 1002) | 340 |
| `south.manager@brightcart.com` | 2 (order_id 1003, 1004) | 550 |
| `east.manager@brightcart.com` | 2 (order_id 1005, 1006) | 420 |
| `ceo@brightcart.com` | 8 (all rows) | 1,890 |
| `auditor@brightcart.com` | 8 (all rows) | 1,890 |
| `west.manager@brightcart.com` (not in `dim_user_role`) | 0 (LOOKUPVALUE returns blank, filter matches nothing) | 0 |

**Step 4 — Verification**: In Power BI Desktop, use **View As Roles** (or in Looker, `access_grant` + "View as user") to impersonate each test user and confirm the visible row count matches the table above exactly. The last row is the most important test — it proves the lab also covers the *fail-safe* case: a user with no matching role sees **nothing**, not everything (a common misconfiguration is to default an unmatched lookup to showing all rows).

* *Impact*: You build **1 Dashboard** for every region, not one dashboard per region — and the test cases above are exactly what a senior reviewer would ask you to run before sign-off.

### Exercise 3: Automation Script (Concept)

**Goal**: Design a Refresh Schedule.

* **Requirement**: CEO needs data at 8:00 AM daily.
* **ETL Job**: Takes 2 hours. Starts at ?
* **Plan**:
    1. Start ETL at 5:00 AM.
    2. ETL finishes at 7:00 AM.
    3. Trigger BI Refresh at 7:05 AM (Event-based trigger, not Time-based, is safer).
    4. Send Slack Alert "Dashboard Ready" at 7:30 AM.

---

## Mastery Check

### Question 1: Import Mode

Why is Import Mode faster than Direct Query?
A) It isn't.
B) Because data is stored in the BI tool's highly optimized, compressed, in-memory columnar engine (VertiPaq/Hyper).
C) Because it uses the internet.
D) Because it deletes old data.

<details>
<summary>Click for Answer</summary>

**Answer: B**
In-memory engines are designed for sub-second slicing. Queries don't travel over the network to a slow database.
</details>

### Question 2: Calculated Columns

When should you use a Calculated Column instead of a Measure?
A) Always.
B) Never.
C) When you need to slice/filter/group by that value on an axis (e.g., "High Value Customer" vs "Low Value").
D) When you want the total sum.

<details>
<summary>Click for Answer</summary>

**Answer: C**
Columns computed at load time can be used as Dimensions (x-axis). Measures computed at query time are Values (y-axis).
</details>

### Question 3: RLS

What allows different users to see different data in the same report?
A) Magic.
B) Row Level Security (RLS).
C) Creating 10 copies of the file.
D) Sending screenshots.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Filters data based on user identity/role.
</details>

### Question 4: Semantic Layer

What is the main benefit of a Semantic Layer?
A) It makes the dashboard look pretty.
B) It ensures "One Version of the Truth" by centralizing metric definitions.
C) It speeds up the internet.
D) It replaces SQL.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Consistency and Reusability.
</details>

### Question 5: Licensing

Which tool is known for its "Code-First" approach using a proprietary language called LookML?
A) Tableau
B) Power BI
C) Looker
D) Excel

<details>
<summary>Click for Answer</summary>

**Answer: C**
Looker is unique for its git-integrated modeling layer.
</details>

### Question 6: Headless BI

What problem does "Headless BI" (a metrics layer) primarily solve?

A) It makes dashboards load faster.
B) It decouples metric *definitions* from any single visualization tool, so Slack, Excel, and Tableau all pull the same number.
C) It removes the need for a database.
D) It is a synonym for Direct Query.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Headless BI defines metrics once (in code/YAML) and serves them via API to many front ends, preventing "One Version of the Truth" drift across tools.
</details>

### Question 7: Service Accounts

Why should scheduled BI refreshes run under a service account rather than a named employee's login?

A) Service accounts are faster.
B) So the refresh keeps working (and is auditable) even after the employee changes roles or leaves the company.
C) It is required by law in all countries.
D) It makes the dashboard prettier.

<details>
<summary>Click for Answer</summary>

**Answer: B**
A personal login tied to a refresh creates a single point of failure — when that person's account is disabled, every dependent refresh breaks. Service accounts decouple infrastructure from individual employment status.
</details>

### Question 8: RLS Pitfalls

In the BrightCart RLS lab, why does `west.manager@brightcart.com` see 0 rows instead of an error?

A) Because the rule is broken.
B) Because `LOOKUPVALUE` finds no matching row in `dim_user_role`, returns blank, and the filter condition `region = blank` matches nothing — a safe fail-closed design.
C) Because West region has no sales.
D) Because Looker doesn't support that user.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Good RLS design fails *closed* (show nothing) when identity data is missing or mismatched, rather than failing *open* (showing everything) — the opposite default is a common and dangerous misconfiguration.
</details>

---

## Cross-References

* **Phase 7 Day 73 — BI SQL & Databases**: the query layer that Direct Query mode sends requests to under the hood.
* **Phase 7 Day 75 — BI Visualization & Dashboard Principles**: the canvas-level design choices that sit on top of whichever platform you pick here.
* **Phase 7 Day 80 — BI Data Quality & Governance**: the broader governance program (certification, lineage, stewardship) that RLS and semantic-layer controls feed into.
* **Phase 7 Day 81 — BI Architecture & Data Modeling**: how the semantic layer's measures and dimensions map back to the underlying warehouse schema.
* **Phase 7 Day 84C — Reverse ETL & Semantic Layer**: a deeper dive into headless BI / metrics-layer architecture introduced briefly here.

## Glossary

* **Semantic layer**: A business-friendly translation layer that maps raw database tables/columns to named metrics and dimensions, so users drag "Total Revenue" instead of writing `SUM(sales.amount)`.
* **Row-Level Security (RLS)**: A rule that filters which rows of data a user can see based on their identity or role, enforced inside the BI tool's data model.
* **Import (mode)**: A connection mode where the BI tool copies data into its own compressed in-memory engine for fast, offline querying.
* **Direct Query (live connection)**: A connection mode where every chart interaction sends a fresh SQL query to the source database, trading speed for real-time freshness.
* **Headless BI**: An architecture that defines metrics once in code/YAML and serves them via API to multiple front-end tools, decoupling logic from visualization.
* **TCO (Total Cost of Ownership)**: The full cost of a platform choice, including license fees plus hidden costs (servers, training, migration, lock-in).
* **Service account**: A non-human login used by automated processes (refreshes, embeds) so credentials aren't tied to one employee.
* **Entitlement drift**: The gradual mismatch between a user's actual job/role and the access permissions still assigned to them, caused by missing periodic access reviews.

---

## Summary

Today you learned:

* ✅ **Semantic Layer**: The brain of the BI system.
* ✅ **Import vs Direct**: Speed vs Freshness trade-off.
* ✅ **RLS**: Secure personalized views from a single report.
* ✅ **Governance**: Balancing "Wild West" vs "Bureaucracy".
* ✅ **Platform Evaluation**: Weighing licensing, embedding, APIs, and lock-in across Tableau, Power BI, Looker, and open-source options.
* ✅ **Operationalization**: CI/CD, service accounts, refresh orchestration, and disaster recovery turn a dashboard into reliable infrastructure.

**Tomorrow**: We apply these tools to specialized domains in **BI Domain Analytics & Value Drivers**.
