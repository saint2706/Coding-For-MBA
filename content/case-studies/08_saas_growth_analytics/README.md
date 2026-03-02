# 📈 Case Study 08: SaaS Growth Analytics

> **Phases covered**: Phase 7 (Data Governance & Advanced Analytics)
> **Difficulty**: Intermediate
> **Estimated time**: 6–8 hours

---

## 🎯 Case Overview

**CloudMetrics**, a B2B SaaS company with 12,000 active accounts and
**$48 M ARR**, is experiencing slowing growth. The Net Revenue Retention
(NRR) dropped from 115% to 102% last quarter, and the CEO wants to
understand *why*. The product analytics team needs a comprehensive
**growth analytics framework** covering cohort analysis, retention curves,
product engagement scoring, and revenue analytics.

Your mission: build a product analytics pipeline that surfaces actionable
insights about user retention, feature adoption, and expansion revenue
opportunities.

---

## 📋 Business Context

| Metric | Value |
| --- | --- |
| Active accounts | 12,000 |
| Annual Recurring Revenue (ARR) | $48 M |
| Monthly churn rate | 2.8% |
| Net Revenue Retention (NRR) | 102% |
| Target NRR | 115%+ |
| Average Contract Value (ACV) | $4,000 |

**Key question:** *What product behaviours predict retention and expansion,
and which user segments should we prioritise?*

---

## 🗂️ Project Structure

```
08_saas_growth_analytics/
├── README.md           ← this file (hand-holding guide)
├── starter.py          ← scaffold with TODOs
└── data_generator.py   ← creates synthetic SaaS dataset
```

---

## 🛠️ Skills Applied

| Phase | Topics |
| ----- | ------ |
| Phase 7 | Cohort analysis, retention curves, engagement scoring |
| Phase 7 | Product analytics — DAU/MAU, feature adoption, power users |
| Phase 12 | Funnel analysis, conversion metrics, revenue analytics |
| Phase 37B | Survival analysis concepts, statistical testing |

---

## 🤝 Hand-Holding Walkthrough

### Step 1 — Generate & Explore SaaS Data

**What:** Create synthetic datasets: `accounts.csv` (company-level data),
`events.csv` (product usage events), and `subscriptions.csv` (MRR history).

**Why:** SaaS analytics requires three layers of data: who the customers
are (accounts), what they do (events), and how much they pay (subscriptions).

**How:**

```python
python data_generator.py
accounts = pd.read_csv("accounts.csv")
events = pd.read_csv("events.csv", parse_dates=["timestamp"])
subscriptions = pd.read_csv("subscriptions.csv", parse_dates=["start_date"])

print(f"Accounts: {len(accounts)}")
print(f"Events: {len(events)}")
print(f"Active subscriptions: {subscriptions['is_active'].sum()}")
```

**✅ Checkpoint:** ~12,000 accounts, ~500,000 events, ~2.8% monthly churn.

---

### Step 2 — Cohort Retention Analysis

**What:** Build a monthly cohort retention matrix showing what % of users
from each signup month are still active N months later.

**Why:** Cohort analysis is the single most important tool in SaaS analytics.
It separates "are we getting better at retaining users?" from "are we just
growing faster than we're churning?"

**How:**

```python
# Assign cohort (signup month)
accounts["cohort"] = pd.to_datetime(accounts["signup_date"]).dt.to_period("M")

# Merge with events to find last active month
last_active = events.groupby("account_id")["timestamp"].max().reset_index()
last_active.columns = ["account_id", "last_active_date"]
cohort_data = accounts.merge(last_active, on="account_id")
cohort_data["last_active_period"] = pd.to_datetime(
    cohort_data["last_active_date"]
).dt.to_period("M")

# Calculate periods since signup
cohort_data["periods_active"] = (
    cohort_data["last_active_period"] - cohort_data["cohort"]
).apply(lambda x: x.n)

# Pivot into retention matrix
cohort_sizes = cohort_data.groupby("cohort").size()
retention = cohort_data.groupby(["cohort", "periods_active"]).size().unstack(fill_value=0)
retention_pct = retention.div(cohort_sizes, axis=0)
print(retention_pct.iloc[:6, :6])  # first 6 cohorts, first 6 months
```

**✅ Checkpoint:** Month-1 retention should be 70–85%. Month-12 should be
40–60%. Plot as a heatmap.

---

### Step 3 — Product Engagement Scoring

**What:** Compute a per-account engagement score based on feature usage
frequency, breadth, and recency.

**Why:** Engagement scores predict retention better than any single metric.
A customer who uses 5 features daily is far less likely to churn than one
who logs in once a month to view a dashboard.

**How:**

```python
# Feature usage breadth (how many distinct features used in last 30 days)
recent = events[events["timestamp"] >= events["timestamp"].max() - pd.Timedelta(days=30)]
breadth = recent.groupby("account_id")["feature"].nunique().rename("feature_breadth")

# Usage frequency (events per week)
freq = recent.groupby("account_id").size().rename("events_30d")

# Recency (days since last event)
recency = (events["timestamp"].max() - events.groupby("account_id")["timestamp"].max())
recency = recency.dt.days.rename("days_since_last_event")

engagement = pd.concat([breadth, freq, recency], axis=1).fillna(0)
engagement["engagement_score"] = (
    0.4 * (engagement["feature_breadth"] / engagement["feature_breadth"].max())
    + 0.4 * (engagement["events_30d"] / engagement["events_30d"].quantile(0.95)).clip(0, 1)
    + 0.2 * (1 - engagement["days_since_last_event"] / 30).clip(0, 1)
)
print(engagement["engagement_score"].describe())
```

**✅ Checkpoint:** Score should range 0–1. Churned accounts should have
scores < 0.2. Power users should score > 0.8.

---

### Step 4 — Funnel Analysis

**What:** Build a product activation funnel: Signup → First Login →
Core Feature Used → Aha Moment → Paid Conversion.

**Why:** Finding where users drop off in the activation funnel reveals the
highest-leverage improvement opportunity. A 10% improvement at the bottleneck
compounds into significant revenue growth.

**How:**

```python
funnel_stages = ["signup", "first_login", "core_feature_used",
                 "aha_moment", "paid_conversion"]

funnel_counts = {}
for stage in funnel_stages:
    if stage == "signup":
        funnel_counts[stage] = len(accounts)
    else:
        funnel_counts[stage] = events[events["event_type"] == stage]["account_id"].nunique()

funnel_df = pd.DataFrame({
    "Stage": funnel_stages,
    "Users": [funnel_counts[s] for s in funnel_stages],
})
funnel_df["Conversion"] = funnel_df["Users"] / funnel_df["Users"].iloc[0]
funnel_df["Drop-off"] = 1 - funnel_df["Users"] / funnel_df["Users"].shift(1)
print(funnel_df)
```

**✅ Checkpoint:** Identify the biggest drop-off point. This is where the
product team should focus.

---

### Step 5 — Revenue Analytics (MRR Decomposition)

**What:** Decompose Monthly Recurring Revenue into New, Expansion,
Contraction, and Churned MRR.

**Why:** Total MRR can be flat while hiding dangerous dynamics: lots of new
revenue masking high churn. MRR decomposition reveals the true health.

**How:**

```python
# Monthly MRR by category
mrr = subscriptions.groupby(
    [pd.Grouper(key="start_date", freq="M"), "mrr_category"]
)["mrr"].sum().unstack(fill_value=0)

mrr.columns = ["New", "Expansion", "Contraction", "Churned"]
mrr["Net_New"] = mrr["New"] + mrr["Expansion"] - mrr["Contraction"] - mrr["Churned"]
mrr["Total_MRR"] = mrr["Net_New"].cumsum() + 2_000_000  # base MRR

print(mrr.tail(6))

# NRR calculation
mrr["NRR"] = (mrr["Total_MRR"] + mrr["Expansion"] - mrr["Contraction"] - mrr["Churned"]) / mrr["Total_MRR"].shift(1)
```

**✅ Checkpoint:** NRR should be ≈ 102% (matching the business context).
Plot MRR waterfall chart.

---

### Step 6 — Growth Recommendations

**What:** Synthesise all analyses into an actionable growth strategy.

**Why:** The CEO needs 3–5 concrete recommendations, not just dashboards.

**How:**

```markdown
## Growth Strategy Recommendations

1. **Fix the activation funnel bottleneck** (Step → Step conversion)
   - Expected impact: +X% monthly signups converting to paid
2. **Launch engagement-based health scoring** for CS team
   - Flag accounts with score < 0.3 for proactive outreach
3. **Drive feature adoption** of [underused feature]
   - Accounts using this feature retain 2× better
4. **Expand high-engagement accounts** with upsell campaign
   - Target: accounts with score > 0.7 and < 50% seat utilisation
5. **Improve onboarding** for cohorts showing < 70% M1 retention
```

**✅ Checkpoint:** Each recommendation should include expected revenue
impact.

---

## 📊 Deliverables

| # | Deliverable | Format |
| - | --- | --- |
| 1 | Cohort retention heatmap | PNG / Jupyter |
| 2 | Engagement scoring model | .py |
| 3 | Activation funnel analysis | Jupyter / .py |
| 4 | MRR decomposition chart | PNG |
| 5 | Growth strategy memo for CEO | Markdown |

---

## 🏆 Stretch Goals

- [ ] Build a Streamlit SaaS metrics dashboard
- [ ] Add a churn prediction model using engagement features
- [ ] Implement a customer health score with weighted signals
- [ ] Design a product-qualified lead (PQL) scoring model
- [ ] Build an automated alerting system for engagement drops

---

## 📚 Reference Lessons

- Day 73–78: BI concepts, dashboard design, KPI frameworks (Phase 7)
- Day 137: Product Analytics Deep Dive — retention, funnels, cohorts (Phase 12)
- Day 138: A/B Testing — experimentation for growth (Phase 12)
- Day 139: Data Products & Monetisation (Phase 12)

---

*This case study demonstrates the analytical toolkit every SaaS company
needs — perfect for Product Analytics and Growth roles.*
