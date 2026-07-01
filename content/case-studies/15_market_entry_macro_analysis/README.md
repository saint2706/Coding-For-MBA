# 🌍 Case Study 15: Market-Entry Strategy with Real Macro Data

> **Phases covered**: Phase 2 (Data Wrangling) · Phase 4 (ML Fundamentals)
> **Difficulty**: Intermediate
> **Estimated time**: 6–8 hours

---

## 🎯 Case Overview

**ACME Consumer Electronics** wants to expand into one new international
market next year. Rather than rely on a consultant's slide deck, the CFO
wants a data-driven scorecard built on **real World Bank macroeconomic
indicators** — actual GDP, inflation, unemployment, and connectivity data
for the candidate countries, not illustrative numbers.

Your job: pull real indicators for a shortlist of candidate countries,
build a weighted market-attractiveness index, cluster the countries into
peer groups, and recommend an entry sequence.

---

## 📊 Data Source & Attribution

| | |
| --- | --- |
| **Dataset** | World Development Indicators (WDI) |
| **Provider** | The World Bank |
| **URL** | https://data.worldbank.org/ (API docs: https://datahelpdesk.worldbank.org/knowledgebase/articles/889392) |
| **License** | CC BY 4.0 |
| **Citation** | World Bank. *World Development Indicators*. The World Bank Group. Retrieved via the World Bank Open Data API. |
| **Access method** | `pandas_datareader.wb` (no API key required — the World Bank API is fully public) |

Indicators used (World Bank codes):

| Code | Meaning |
| --- | --- |
| `NY.GDP.MKTP.KD.ZG` | GDP growth (annual %) |
| `FP.CPI.TOTL.ZG` | Inflation, consumer prices (annual %) |
| `SL.UEM.TOTL.ZS` | Unemployment (% of labor force) |
| `IT.NET.USER.ZS` | Individuals using the Internet (% of population) |
| `SP.POP.TOTL` | Total population |

---

## 📋 Business Context

| Metric | Value |
| --- | --- |
| Candidate countries under review | 8 |
| Years of history to pull | 10 |
| Target segment | Middle-income consumer electronics buyers |
| Board decision deadline | Next quarterly review |

**Key question:** *Of the candidate countries, which offer the best
risk-adjusted growth opportunity, and in what order should ACME enter them?*

---

## 🗂️ Project Structure

```
15_market_entry_macro_analysis/
├── README.md          ← this file (hand-holding guide)
├── starter.py          ← scaffold with TODOs — follow step by step
└── data_loader.py       ← pulls real indicators from the World Bank API
```

---

## 🛠️ Skills Applied

| Phase | Topics |
| ----- | ------ |
| Phase 2 | Pandas reshaping (long ↔ wide), handling missing years in real API data |
| Phase 4 | Feature scaling, K-Means clustering, weighted index construction |
| Phase 37B | Volatility as a risk proxy (standard deviation of growth) |

---

## 🤝 Hand-Holding Walkthrough

### Step 1 — Pull Real Indicators from the World Bank

**What:** Fetch 10 years of real macro indicators for 8 candidate countries
directly from the World Bank's public API.

**Why:** This is the same data source finance and strategy teams actually
cite in board decks — no placeholder numbers, and it's freely reproducible
by anyone.

**How:**

```python
# pip install pandas-datareader
python data_loader.py             # fetches and caches macro_indicators.csv

df = pd.read_csv("macro_indicators.csv")
print(df.shape)
print(df["country"].unique())
```

**✅ Checkpoint:** You should have rows for each country × year × indicator
combination, spanning roughly the last 10 years (the World Bank API has
reporting lag, so the most recent 1–2 years may be missing for some
countries — a realistic constraint, not a bug).

---

### Step 2 — Reshape & Handle Real Gaps

**What:** Pivot from long format (one row per country-year-indicator) to
wide format (one row per country-year, one column per indicator), and
decide how to handle missing values.

**Why:** Real government statistics agencies don't all report on the same
schedule — some countries have gaps for certain years/indicators. Forward-
filling or averaging over available years is a defensible, explainable
choice; silently dropping countries with any gap would bias your sample
toward highly-developed economies.

**How:**

```python
wide = df.pivot_table(
    index=["country", "year"], columns="indicator", values="value"
).reset_index()

country_avg = wide.groupby("country").mean(numeric_only=True)
print(country_avg)
print(wide.isna().sum())
```

**✅ Checkpoint:** Every candidate country should have at least 6–7 years of
non-missing data for GDP growth and inflation (the most reliably reported
indicators); internet penetration may have more gaps for smaller countries.

---

### Step 3 — Build a Weighted Attractiveness Index

**What:** Normalise each indicator (0–1 scale) and combine into a single
weighted market-attractiveness score.

**Why:** The CFO needs one ranked number per country, not five separate
tables — but the *weights* should be explicit and adjustable, since
"attractiveness" is a judgment call the business should own, not something
buried in code.

**How:**

```python
from sklearn.preprocessing import MinMaxScaler

indicators = ["NY.GDP.MKTP.KD.ZG", "IT.NET.USER.ZS", "SP.POP.TOTL"]
inverse_indicators = ["FP.CPI.TOTL.ZG", "SL.UEM.TOTL.ZS"]  # lower is better

scaled = country_avg.copy()
scaler = MinMaxScaler()
scaled[indicators] = scaler.fit_transform(country_avg[indicators])
scaled[inverse_indicators] = 1 - scaler.fit_transform(country_avg[inverse_indicators])

weights = {
    "NY.GDP.MKTP.KD.ZG": 0.35,
    "FP.CPI.TOTL.ZG": 0.20,
    "SL.UEM.TOTL.ZS": 0.15,
    "IT.NET.USER.ZS": 0.20,
    "SP.POP.TOTL": 0.10,
}
scaled["attractiveness_score"] = sum(scaled[k] * w for k, w in weights.items())
print(scaled["attractiveness_score"].sort_values(ascending=False))
```

**✅ Checkpoint:** Re-run with two different weight sets (e.g. growth-
weighted vs. stability-weighted) and check whether the top-3 ranking
changes — report this sensitivity in your write-up.

---

### Step 4 — Cluster Countries into Peer Groups

**What:** Run K-Means on the standardized indicators to group the 8
candidates into 2–3 clusters (e.g. "high-growth/high-volatility" vs.
"stable/moderate-growth").

**Why:** A single ranked list hides structure — clustering surfaces whether
your top picks are actually similar to each other (concentration risk) or
diversified across different economic profiles.

**How:**

```python
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

X = StandardScaler().fit_transform(country_avg[indicators + inverse_indicators])
kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
country_avg["cluster"] = kmeans.fit_predict(X)
print(country_avg[["cluster"]].join(scaled["attractiveness_score"]))
```

**✅ Checkpoint:** Identify which cluster the top-ranked countries fall
into and label each cluster in plain business language (e.g. "emerging
high-growth", "stable mature market").

---

### Step 5 — Risk & Recommendation

**What:** Compute year-over-year GDP growth volatility (standard deviation)
per country as a risk proxy, and combine it with the attractiveness score
into a final risk-adjusted recommendation.

**Why:** A high-growth country with wildly swinging GDP is a different bet
than a steady grower — the board needs both dimensions, not just the
average.

**How:**

```python
volatility = (
    wide.groupby("country")["NY.GDP.MKTP.KD.ZG"].std().rename("gdp_volatility")
)
final = scaled[["attractiveness_score"]].join(volatility)
final["risk_adjusted_score"] = final["attractiveness_score"] / (1 + final["gdp_volatility"] / 10)
print(final.sort_values("risk_adjusted_score", ascending=False))
```

**✅ Checkpoint:** Rank the final entry sequence and note any countries
where the risk adjustment meaningfully changes their position vs. the raw
attractiveness score — that reordering is the key insight for the board.

---

## 📊 Deliverables

| # | Deliverable | Format |
| - | --- | --- |
| 1 | Real macro indicator pull pipeline | `data_loader.py` |
| 2 | Attractiveness index with sensitivity analysis | Jupyter / .py |
| 3 | Country cluster visualization | PNG |
| 4 | Risk-adjusted ranking table | Markdown |
| 5 | Executive summary with recommended entry sequence | Markdown |

---

## 🏆 Stretch Goals

- [ ] Add a real ease-of-doing-business or logistics-performance indicator
- [ ] Plot GDP growth trajectories over time for the top-3 countries
- [ ] Extend to 15–20 candidate countries and re-cluster
- [ ] Build a Streamlit tool where the CFO can adjust indicator weights live
- [ ] Compare your ranking against a real published index (e.g. IMD World Competitiveness) as a sanity check

---

## 📚 Reference Lessons

- Day 23–24D: Pandas reshaping and real-world data gaps (Phase 2)
- Day 44: Unsupervised learning — K-Means clustering (Phase 4)
- Day 37B: Probability & statistics — volatility as risk (Phase 4)

---

*This case study is built entirely on real, publicly reproducible World
Bank data — the same source real corporate strategy and finance teams cite,
so the pipeline you build here generalises directly to any set of
candidate markets.*
