# 🎁 Case Study 11: E-Commerce Customer Segmentation & CLV (Real Data)

> **Phases covered**: Phase 2 (Data Wrangling) · Phase 4 (ML Fundamentals)
> **Difficulty**: Intermediate
> **Estimated time**: 6–8 hours

---

## 🎯 Case Overview

This case study uses **real transaction data** from a UK-based online gift
retailer — no synthetic generator this time. Over two years (Dec 2009 – Dec
2011), the company logged roughly **1 million line items** across ~40,000
invoices from customers in the UK and abroad.

Leadership wants to move from "blast the same email to everyone" marketing to
**segment-based targeting**: who are the VIP customers worth protecting, who
is drifting away, and who is a one-time bargain shopper not worth chasing?
Your job: turn raw invoice rows into an RFM segmentation and a customer
lifetime value (CLV) estimate that marketing can act on.

---

## 📊 Data Source & Attribution

| | |
| --- | --- |
| **Dataset** | Online Retail II |
| **Provider** | UCI Machine Learning Repository |
| **Author** | Dr Daqing Chen, School of Engineering, London South Bank University |
| **URL** | https://archive.ics.uci.edu/dataset/502/online+retail+ii |
| **License** | CC BY 4.0 (free to use, share, and adapt with attribution) |
| **Citation** | Chen, D. (2019). *Online Retail II* [Dataset]. UCI Machine Learning Repository. https://doi.org/10.24432/C5CG6D |
| **Size** | ~1,067,371 rows, Dec 2009 – Dec 2011, two sheets ("Year 2009-2010", "Year 2010-2011") |

This is real, messy, production data: it contains cancelled orders (invoice
numbers prefixed `C`), missing `Customer ID` values, negative quantities, and
non-product stock codes (postage, bank charges, adjustments). Cleaning it is
part of the exercise, not something a generator has done for you.

---

## 📋 Business Context

| Metric | Value |
| --- | --- |
| Invoices in dataset | ~40,000 |
| Unique customers (with ID) | ~5,900 |
| Countries represented | 40+ (mostly UK) |
| Time span | 25 months |
| Marketing budget per campaign | $50,000 |

**Key question:** *Which customer segments should get a retention offer,
which should get a win-back campaign, and which aren't worth the marketing
spend?*

---

## 🗂️ Project Structure

```
11_ecommerce_customer_segmentation/
├── README.md          ← this file (hand-holding guide)
├── starter.py          ← scaffold with TODOs — follow step by step
└── data_loader.py       ← downloads the real UCI dataset via `ucimlrepo`
```

---

## 🛠️ Skills Applied

| Phase | Topics |
| ----- | ------ |
| Phase 2 | Pandas data wrangling, real-world data cleaning, `datetime` handling |
| Phase 4 | K-Means clustering, feature scaling, RFM analysis |
| Phase 37B | Descriptive statistics, distribution skew in real financial data |

---

## 🤝 Hand-Holding Walkthrough

> Follow these steps one at a time. Each step tells you *what* to do, *why*
> it matters for the business, and *how* to code it.

### Step 1 — Fetch the Real Dataset

**What:** Download the actual Online Retail II dataset from UCI.

**Why:** Unlike our other case studies, there is no generator here — you're
working with the same raw export a real analyst would have pulled from the
company's order system.

**How:**

```python
# In data_loader.py
pip install ucimlrepo
python data_loader.py             # downloads and caches online_retail_ii.csv

df = pd.read_csv("online_retail_ii.csv")
print(df.shape)
print(df.head())
print(df["Invoice"].nunique(), "invoices |", df["Customer ID"].nunique(), "customers")
```

**✅ Checkpoint:** You should see columns `Invoice, StockCode, Description,
Quantity, InvoiceDate, Price, Customer ID, Country` and roughly 1M rows
across both years combined.

---

### Step 2 — Clean the Real-World Mess

**What:** Remove cancellations, rows with no `Customer ID`, and non-positive
quantities/prices.

**Why:** Real data is dirty. Cancelled orders (invoices starting with `C`)
would double-count revenue; rows without a `Customer ID` can't be attributed
to a person for segmentation.

**How:**

```python
df = df.dropna(subset=["Customer ID"])
df = df[~df["Invoice"].astype(str).str.startswith("C")]
df = df[(df["Quantity"] > 0) & (df["Price"] > 0)]
df["InvoiceDate"] = pd.to_datetime(df["InvoiceDate"])
df["revenue"] = df["Quantity"] * df["Price"]
```

**✅ Checkpoint:** Row count should drop by roughly 20–25% after cleaning.
Total revenue should be a positive, plausible figure (tens of millions of
pounds across the full period).

---

### Step 3 — RFM Feature Engineering

**What:** For each customer, compute Recency (days since last purchase),
Frequency (number of distinct invoices), and Monetary (total revenue).

**Why:** RFM is the industry-standard segmentation lens for e-commerce and
retail — it's simple, explainable to a non-technical marketing team, and
correlates strongly with future value.

**How:**

```python
snapshot_date = df["InvoiceDate"].max() + pd.Timedelta(days=1)

rfm = df.groupby("Customer ID").agg(
    recency=("InvoiceDate", lambda x: (snapshot_date - x.max()).days),
    frequency=("Invoice", "nunique"),
    monetary=("revenue", "sum"),
)
print(rfm.describe())
```

**✅ Checkpoint:** Recency should range 0–700+ days (spans the full dataset).
Monetary should be right-skewed — a small number of customers driving a large
share of revenue (check with `rfm["monetary"].quantile([0.5, 0.9, 0.99])`).

---

### Step 4 — K-Means Segmentation

**What:** Scale the RFM features and cluster customers into 4–5 segments.

**Why:** Raw RFM numbers aren't directly comparable (monetary is in pounds,
recency is in days) — scaling puts them on equal footing before clustering.

**How:**

```python
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans

X = StandardScaler().fit_transform(rfm[["recency", "frequency", "monetary"]])

inertias = []
for k in range(2, 8):
    km = KMeans(n_clusters=k, random_state=42, n_init=10).fit(X)
    inertias.append(km.inertia_)
# Plot inertias to find the elbow, then refit with the chosen k

kmeans = KMeans(n_clusters=4, random_state=42, n_init=10)
rfm["segment"] = kmeans.fit_predict(X)
print(rfm.groupby("segment")[["recency", "frequency", "monetary"]].mean())
```

**✅ Checkpoint:** You should see one segment with low recency/high frequency/
high monetary (your VIPs) and one with high recency/low frequency (at-risk
or lapsed). Label each segment in plain English.

---

### Step 5 — Customer Lifetime Value & Targeting

**What:** Estimate a simple historical CLV per segment and translate it into
a targeting recommendation.

**Why:** Segments alone don't tell marketing what to *do*. Attaching a dollar
value to each segment justifies the spend on retention vs. win-back offers.

**How:**

```python
rfm["avg_order_value"] = rfm["monetary"] / rfm["frequency"]
segment_summary = rfm.groupby("segment").agg(
    customers=("monetary", "count"),
    avg_monetary=("monetary", "mean"),
    avg_frequency=("frequency", "mean"),
    avg_recency=("recency", "mean"),
)
segment_summary["pct_of_revenue"] = (
    rfm.groupby("segment")["monetary"].sum() / rfm["monetary"].sum() * 100
)
print(segment_summary.sort_values("pct_of_revenue", ascending=False))
```

**✅ Checkpoint:** Your top-value segment should represent a disproportionate
share of revenue relative to its customer count (classic 80/20 pattern) —
this is your headline stat for the executive summary.

---

## 📊 Deliverables

| # | Deliverable | Format |
| - | --- | --- |
| 1 | Cleaned, attributed dataset load pipeline | `data_loader.py` |
| 2 | RFM table with segment labels | Jupyter / .py |
| 3 | Segment profile chart (radar or bar) | PNG |
| 4 | CLV-by-segment summary table | Markdown |
| 5 | Executive summary with targeting recommendation | Markdown |

---

## 🏆 Stretch Goals

- [ ] Add a probabilistic CLV model (BG/NBD + Gamma-Gamma via `lifetimes`)
- [ ] Compare the two dataset years (2009-2010 vs. 2010-2011) for segment drift
- [ ] Break segmentation out by `Country` to spot regional patterns
- [ ] Build a Streamlit dashboard for marketing to explore segments interactively
- [ ] Market-basket analysis (Apriori) on top segment's `Description` field

---

## 📚 Reference Lessons

- Day 23–24D: Pandas, EDA, and the data cleaning playbook (Phase 2)
- Day 44: Unsupervised learning — K-Means clustering (Phase 4)
- Day 37B: Probability & statistics — distribution skew (Phase 4)

---

*This case study demonstrates working with real, unclean, attributed
production data — the same skill gap between "tutorial data" and "my
company's actual database export" that trips up most new analysts.*
