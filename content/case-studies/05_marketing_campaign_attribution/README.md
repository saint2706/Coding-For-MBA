# 📣 Case Study 05: Marketing Campaign Attribution

> **Phases covered**: Phase 6 (BI & Analytics)
> **Difficulty**: Intermediate → Advanced
> **Estimated time**: 6–8 hours

---

## 🎯 Case Overview

**BrandBoost**, a D2C skincare company spending **$24 M/year** across 6
marketing channels, has no reliable way to attribute conversions to the
right touchpoints. Last-click attribution credits 70% of revenue to Google
Search, but the CMO suspects that Instagram and email nurture sequences
play a critical upstream role.

Your mission: implement multiple attribution models (last-click,
first-click, linear, time-decay, and data-driven), run an A/B test
analysis of a recent campaign, and apply causal inference to estimate the
true incremental lift of each channel.

---

## 📋 Business Context

| Metric | Value |
| --- | --- |
| Annual marketing spend | $24 M |
| Revenue attributed (last-click) | $96 M |
| Marketing channels | 6 (Search, Social, Email, Display, Affiliate, Direct) |
| Average conversion path length | 3.4 touchpoints |
| Current ROAS (blended) | 4.0× |

**Key question:** *Which channels actually drive incremental conversions,
and where should we reallocate the next $2 M of budget?*

---

## 🗂️ Project Structure

```
05_marketing_campaign_attribution/
├── README.md           ← this file (hand-holding guide)
├── starter.py          ← scaffold with TODOs
└── data_generator.py   ← creates synthetic journey dataset
```

---

## 🛠️ Skills Applied

| Phase | Topics |
| ----- | ------ |
| Phase 6 | A/B testing, statistical significance, experiment design |
| Phase 6 | Causal inference — difference-in-differences, propensity scores |
| Phase 4 | Logistic regression for propensity modelling |
| Phase 37B | Hypothesis testing, p-values, confidence intervals |

---

## 🤝 Hand-Holding Walkthrough

### Step 1 — Generate & Explore Journey Data

**What:** Create a synthetic dataset of 50,000 customer journeys, each
with 1–8 marketing touchpoints and a binary `converted` label.

**Why:** Multi-touch attribution requires path-level data, not just
session-level. Understanding path length distribution tells you how
complex the attribution problem is.

**How:**

```python
python data_generator.py          # creates customer_journeys.csv
df = pd.read_csv("customer_journeys.csv")
print(f"Journeys: {df['journey_id'].nunique()}")
print(f"Conversion rate: {df.groupby('journey_id')['converted'].first().mean():.1%}")
print(f"Avg path length: {df.groupby('journey_id').size().mean():.1f}")
```

**✅ Checkpoint:** Conversion rate ≈ 8–12%. Average path length ≈ 3–4 touches.

---

### Step 2 — Rule-Based Attribution Models

**What:** Implement 4 classic attribution models and compare how each
distributes credit across channels.

**Why:** Different models tell different stories. Last-click favours
bottom-funnel channels (Search); first-click favours awareness channels
(Social, Display). Understanding these biases is essential before
proposing a data-driven model.

**How:**

```python
def last_click_attribution(journeys_df):
    """Credit 100% to the last touchpoint before conversion."""
    converted = journeys_df[journeys_df["converted"] == 1]
    last_touch = converted.groupby("journey_id").last()
    return last_touch["channel"].value_counts(normalize=True)

def first_click_attribution(journeys_df):
    """Credit 100% to the first touchpoint."""
    converted = journeys_df[journeys_df["converted"] == 1]
    first_touch = converted.groupby("journey_id").first()
    return first_touch["channel"].value_counts(normalize=True)

def linear_attribution(journeys_df):
    """Split credit equally across all touchpoints."""
    converted = journeys_df[journeys_df["converted"] == 1]
    touch_counts = converted.groupby("journey_id").size()
    converted = converted.merge(touch_counts.rename("n_touches"), on="journey_id")
    converted["credit"] = 1 / converted["n_touches"]
    return converted.groupby("channel")["credit"].sum()

def time_decay_attribution(journeys_df, half_life=7):
    """Weight touchpoints by recency (exponential decay)."""
    converted = journeys_df[journeys_df["converted"] == 1].copy()
    converted["days_before_conv"] = (
        converted.groupby("journey_id")["touch_order"]
        .transform("max") - converted["touch_order"]
    )
    converted["weight"] = 2 ** (-converted["days_before_conv"] / half_life)
    total_weight = converted.groupby("journey_id")["weight"].transform("sum")
    converted["credit"] = converted["weight"] / total_weight
    return converted.groupby("channel")["credit"].sum()

# Compare models
for name, func in [("Last-Click", last_click_attribution),
                    ("First-Click", first_click_attribution),
                    ("Linear", linear_attribution)]:
    print(f"\n{name}:")
    print(func(df))
```

**✅ Checkpoint:** Search should dominate last-click but Social/Display
should rank higher in first-click. If the pattern is reversed, check your
data generator.

---

### Step 3 — A/B Test Analysis

**What:** Analyse the results of a simulated A/B test where a random 50%
of users received an additional email touchpoint.

**Why:** A/B testing is the gold standard for causal claims. The CMO needs
to know: "Did the email campaign *cause* more conversions, or did it just
happen to reach users who were going to convert anyway?"

**How:**

```python
from scipy import stats

# Split data into control and treatment
control = df[df["ab_group"] == "control"]
treatment = df[df["ab_group"] == "treatment"]

conv_control = control.groupby("journey_id")["converted"].first()
conv_treatment = treatment.groupby("journey_id")["converted"].first()

# Two-proportion z-test
z_stat, p_value = stats.proportions_ztest(
    [conv_treatment.sum(), conv_control.sum()],
    [len(conv_treatment), len(conv_control)],
)
print(f"Treatment conversion: {conv_treatment.mean():.2%}")
print(f"Control conversion: {conv_control.mean():.2%}")
print(f"Lift: {(conv_treatment.mean() / conv_control.mean() - 1):.1%}")
print(f"p-value: {p_value:.4f}")
```

**✅ Checkpoint:** If p-value < 0.05, the email campaign has a
statistically significant effect. Calculate the 95% confidence interval
for the lift.

---

### Step 4 — Causal Inference (Propensity Score Matching)

**What:** Use propensity score matching to estimate the causal effect of
Social media touchpoints on conversion, controlling for confounders.

**Why:** In observational data (non-experimental), users who see social
ads may differ from those who don't. Propensity matching creates comparable
groups to isolate the treatment effect.

**How:**

```python
from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import NearestNeighbors

# Treatment: user had at least one Social touchpoint
user_features = df.groupby("journey_id").agg(
    n_touches=("channel", "count"),
    has_search=("channel", lambda x: ("Search" in x.values).astype(int)),
    has_social=("channel", lambda x: ("Social" in x.values).astype(int)),
    converted=("converted", "first"),
).reset_index()

# Propensity model: P(has_social | confounders)
X_prop = user_features[["n_touches", "has_search"]]
treatment = user_features["has_social"]

ps_model = LogisticRegression()
ps_model.fit(X_prop, treatment)
user_features["propensity"] = ps_model.predict_proba(X_prop)[:, 1]

# Match treated and control users on propensity score
# TODO: Implement nearest-neighbor matching
# TODO: Compare conversion rates in matched pairs
```

**✅ Checkpoint:** The ATT (Average Treatment Effect on the Treated) should
be positive but smaller than the naïve difference — this shows confounding
was present.

---

### Step 5 — Budget Reallocation Recommendation

**What:** Synthesise all analyses into a channel budget recommendation.

**Why:** The CMO needs a clear answer: "Move $X from Channel A to Channel B."

**How:**

```python
# Create a summary table
summary = pd.DataFrame({
    "Channel": channels,
    "Current_Spend": current_spend,
    "Last_Click_Share": last_click_shares,
    "Data_Driven_Share": data_driven_shares,
    "Incremental_ROAS": incremental_roas,
})

summary["Recommended_Spend"] = summary["Data_Driven_Share"] * total_budget
summary["Budget_Change"] = summary["Recommended_Spend"] - summary["Current_Spend"]
print(summary.sort_values("Budget_Change", ascending=False))
```

**✅ Checkpoint:** Your recommendation should shift budget *toward* channels
with high incremental ROAS and *away from* channels that only appear
strong under last-click.

---

## 📊 Deliverables

| # | Deliverable | Format |
| - | --- | --- |
| 1 | Attribution model comparison (4 models) | Jupyter / .py |
| 2 | A/B test analysis with CI and p-value | .py |
| 3 | Propensity score matching analysis | .py |
| 4 | Budget reallocation recommendation | Markdown table |
| 5 | Executive presentation (1 slide per model) | Markdown / PDF |

---

## 🏆 Stretch Goals

- [ ] Implement Shapley value attribution (game-theoretic approach)
- [ ] Build a Markov chain attribution model
- [ ] Add a simulation of budget reallocation and projected revenue
- [ ] Create a Streamlit dashboard for interactive attribution comparison
- [ ] Apply causal forests (using EconML or CausalML)

---

## 📚 Reference Lessons

- Day 61–64: Business intelligence and analytics concepts (Phase 6)
- Day 138: A/B Testing at Scale — experiment design and analysis (Phase 12)
- Day 37B: Hypothesis testing, p-values, confidence intervals
- Day 69: Responsible AI — avoiding bias in marketing models (Phase 6)

---

*This case study demonstrates your ability to move beyond correlation
to causation — a skill that separates data analysts from strategic advisors.*
