---
day: 78
title: "BI Experimentation & Predictive"
phase: 7
phaseTitle: "BI Analytics, Governance & Modern Data Stack"
slug: "bi-experimentation"
duration: 120
difficulty: "advanced"
tags:
  - ab-testing
  - statistics
  - forecasting
  - predictive-analytics
concepts:
  - "The Null Hypothesis"
  - "Sample Size & P-Values"
  - "Forecasting in BI Tools"
  - "Correlation vs Causation (Recap)"
prerequisites:
  - "Basic Stats (Mean, Median)"
  - "Understanding of Variance"
outcomes:
  - "Design a statistically valid A/B Test"
  - "Calculate Required Sample Size"
  - "Use Built-in Forecasting in Tableau/Power BI"
---

# 🎯 Day 78: BI Experimentation & Predictive Insights

> *"Without data, you're just another person with an opinion." — W. Edwards Deming*

---

## The "Never-Coded" Bridge

**The Pepsi Challenge (A/B Testing)**

1. **Hypothesis**: "People prefer Pepsi over Coke."
2. **Experiment**: Blind taste test.
    * **Control Group (A)**: Drinks Coke.
    * **Treatment Group (B)**: Drinks Pepsi.
3. **Result**: 55% chose Pepsi. 45% chose Coke.
4. **Conclusion**: Pepsi wins?
    * **Wait!** If you only tested 10 people, this could be luck. (5 vs 4 is basically a coin flip).
    * If you tested 10,000 people, it's statistically significant.

**BI Analysts** don't just report "Sales are up." They ask: "Is this real, or is it randomness?"

---

## The Technical Deep Dive

### 1. Statistical Significance (The P-Value) — Deepened

The Pepsi Challenge intuition is right, but "less than 5% chance this happened by luck" is a simplification worth unpacking properly, because it is the single most misquoted concept in business analytics.

* **Null Hypothesis (H₀)**: The boring, default assumption — "the new checkout button has *no effect* on conversion." We assume this is true until the data convinces us otherwise.
* **Alternative Hypothesis (H₁)**: What you're actually trying to detect — "the new checkout button *changes* conversion" (two-sided) or "*increases* conversion" (one-sided).
* **P-value, precisely**: The probability of observing a result *at least as extreme* as what you saw, **assuming the null hypothesis is true**. It is NOT "the probability the alternative is true," and it is NOT "the probability of a Type I error for this specific test" — it's a statement about the data given H₀, not a statement about H₀ given the data.
* **Alpha (α) / Significance level**: The threshold you pre-commit to *before* the test (commonly 0.05). If p < α, you reject H₀. Alpha is a policy choice about acceptable false-positive risk, not a law of nature.
* **Confidence Interval (CI)**: A range (e.g., "conversion lift is +1.5%, 95% CI: [+0.2%, +2.8%]") that would contain the true effect in 95% of repeated experiments run the same way. A CI that crosses zero means you cannot rule out "no effect," even if the point estimate looks positive.
* **Effect size**: The *magnitude* of the difference (e.g., a 1.5 percentage-point lift), independent of sample size. A result can be statistically significant (p < 0.05) with a tiny, commercially meaningless effect size if the sample is large enough — this is why p-values alone are not a business decision.
* **Statistical power (1 − β)**: The probability your test correctly detects a real effect, if one exists, at your chosen sample size. Industry convention targets 80% power. Underpowered tests produce false "no significant difference" conclusions that actually just mean "we didn't collect enough data to see it."
* **Type I Error (False Positive)**: Concluding there's an effect when there isn't one. Controlled by alpha (a 5% alpha means a 5% Type I error rate *if H₀ is actually true*).
* **Type II Error (False Negative)**: Concluding there's no effect when there actually is one. Controlled by power — low power means high Type II error risk.
* **Practical significance vs. statistical significance**: A checkout redesign that lifts conversion by 0.05 percentage points with p=0.001 (highly "significant" given a massive sample) may not be worth the engineering cost to ship. Always ask "is the effect size big enough to matter to the P&L?" *after* asking "is it statistically real?"
* **Multiple testing problem**: Running 20 simultaneous A/B tests at α=0.05 means you'd expect roughly 1 "significant" result purely by chance even if nothing actually works (this is exactly the ice-cream/shark-attack trap, applied to dashboards full of metrics). Correct for this with a stricter threshold (Bonferroni: α/number of tests) or by pre-registering a single primary metric per test.

### 2. Forecasting in BI Tools

Tools like Tableau and Power BI define "Forecast" using **Exponential Smoothing** (Holt-Winters).

* **Seasonality**: It detects "Sales always spike in December."
* **Trend**: It detects "Sales are generally going up."
* **Confidence Interval**: "Sales will be between $80k and $120k next month." (The gray cone area).

Tools like Tableau and Power BI's defaults are a convenient starting point, not a substitute for proper forecast evaluation:

* **Naive baseline**: Before trusting any model, compare it to "tomorrow = today" or "this month = same month last year." If Holt-Winters can't beat the naive baseline, it isn't adding value.
* **Train/test split**: Hold out the most recent period (e.g., the last 3 months) and fit the model only on data before that. Never evaluate a forecast model on the same data it was trained on — that just measures memorization, not prediction.
* **Backtesting**: Repeat the train/test split at multiple historical cut-points (rolling-origin evaluation) to see if forecast accuracy is consistent or only good in one lucky period.
* **Error metrics**: **MAE** (Mean Absolute Error, in the original units — easy to explain to executives: "off by $4k on average"); **MAPE** (Mean Absolute Percentage Error — comparable across products of different sizes, but unstable near zero); **RMSE** (Root Mean Squared Error — penalizes large misses more heavily, useful when big errors are disproportionately costly).
* **Prediction intervals**: The "gray cone" isn't decoration — it's the model's own uncertainty estimate. A forecast of "$105k ± $10k" is a *prediction interval*; treat any single point forecast without one as incomplete.
* **Drift**: A forecast model trained on pre-pandemic seasonality will quietly degrade as buying patterns shift. Track forecast error over time (not just at launch) and retrain when error trends upward.
* **When NOT to forecast**: Don't forecast a metric immediately after a structural break (e.g., BrightCart just launched a new marketplace channel — there's no comparable history yet), or for a series with too few historical cycles to estimate seasonality (you need at least 2-3 full seasonal cycles), or when the real question is causal ("will this promotion work?") rather than extrapolative — that's an experiment, not a forecast.

### 3. Correlation Matrix

A grid showing how every variable relates to every other variable.

* **+1**: Perfectly correlated (Height + Shoe Size).
* **-1**: Perfectly inverse (Rain + Outdoor Dining).
* **0**: No relationship (Ice Cream Sales + Shark Attacks... wait, that's actually correlated due to Summer!).

### 4. Experiment Design: Beyond the Basic A/B Split

* **Randomization unit**: Randomize at the *user* level, not the *session* or *page-view* level, or the same person can land in both Control and Treatment and contaminate the comparison. BrightCart randomizes by `customer_id` (or a persistent device ID for anonymous visitors), not by visit.
* **Sample Ratio Mismatch (SRM)**: If you split 50/50 but observe 53/47 in actual traffic, something is broken in the randomization or logging *before* you even look at the outcome metric — always check the split ratio first, because a broken randomizer can produce a "significant" result that's actually a measurement bug.
* **Novelty effects**: A redesigned checkout button might lift conversion for the first week simply because it's *new and noticeable*, then decay back to baseline. Run tests long enough to see past the novelty bump (typically 2+ full weeks, spanning at least one full weekly cycle).
* **Network effects**: If BrightCart tests a "refer a friend" feature, a Treatment-group user's referral can land an order with a Control-group user, contaminating the comparison. Cluster-randomize by region or use a switchback design when interference is likely.
* **Sequential testing**: Standard significance math assumes you look at the data *once*, after collecting the pre-determined sample. If you want to peek continuously, use a sequential testing method (e.g., always-valid p-values, mSPRT) explicitly designed for repeated looks — not the "peek until p<0.05" anti-pattern.
* **CUPED / variance reduction**: Use each user's *pre-experiment* behavior (e.g., last month's average order value) as a covariate to reduce noise in the outcome metric, shrinking the sample size needed to detect the same effect — a standard technique at mature experimentation teams.
* **Segmentation**: An overall "flat" result can hide a real effect in one segment (e.g., mobile app users) that's cancelled out by a negative effect in another (e.g., desktop). Pre-register the segments you'll check, or you're back to multiple testing.
* **Experiment governance**: A central experiment registry (test name, owner, hypothesis, primary metric, start/end date, sample size target) prevents two teams from accidentally running conflicting tests on the same users, and creates an audit trail for "why did we ship this?"

---

## Senior-Level Insights

### The HiPPO Effect

* **HiPPO**: **Hi**ghest **P**aid **P**erson's **O**pinion.
* **Scenario**: The CEO says "I like the Blue Button."
* **The Analyst**: "I ran an A/B test. The Red Button increased conversion by 14% (P=0.01). If we switch to Blue, we lose $2M/year."
* **Result**: Data beats Opinion. (Usually).

### "Peeking" at Experiments

* **Sin**: Checking results every hour and stopping the test when it looks "Green."
* **Why**: This is "P-Hacking." You are cherry-picking randomness.
* **Rule**: Decide Sample Size *before* you start. Don't stop until you hit it.

### Pitfall: "Correlation Is Not Causation" — A BrightCart Scenario

BrightCart's analyst notices a strong positive correlation: customers who open the weekly email newsletter have a 3x higher average order value than those who don't. The marketing team wants to declare "Newsletters cause higher spending" and demand budget for more email campaigns. **Stop — this is a textbook confounding trap.**

* **The confounder**: Customer *tenure*. Customers who have been with BrightCart for 2+ years are both (a) more likely to have opted into and engaged with the newsletter, and (b) more likely to have built up trust and purchase a wider range of higher-priced products. Tenure drives *both* newsletter engagement and order value — the newsletter itself may be doing very little.
* **How to check**: Segment the correlation by tenure cohort. If the newsletter-AOV correlation disappears within each tenure band (new customers, 1-year customers, 2-year+ customers), tenure was the real driver all along.
* **Simpson's Paradox — the sharper version of the same trap**: Imagine BrightCart's data shows the *web* channel has a *higher* email-to-AOV correlation than the *app* channel when viewed separately — but when pooled together, the *app* channel looks better overall. This reversal happens when a third variable (here, channel mix — app skews toward newer, lower-tenure customers) is unevenly distributed across the groups being compared. The pooled (aggregate) trend can point in the *opposite direction* of every individual subgroup trend. **The fix**: always check whether a relationship holds within meaningful subgroups before trusting the aggregate number, especially when group sizes are unbalanced.
* **The only real fix**: Run a randomized experiment — randomly assign a comparable group of customers to receive the newsletter and a control group to not receive it, holding tenure distribution equal across both arms by design (randomization). Only a controlled experiment, not an observational correlation, lets you say "the newsletter *caused* the AOV lift."

---

## Hands-on Lab

### Exercise 1: Sample Size Calculation

**Goal**: Use an online calculator logic.

**Scenario**:

* Baseline Conversion: 5% (Current Rate).
* Minimum Detectable Effect (MDE): Equal to 20% relative lift (Target: 6%).
* Statistical Power: 80%.
* Significance Level: 5%.

**Calculation** (Approximation):

* You need roughly ~4,000 visitors per variation.
* *Action*: Do not report results after 1 day (100 visitors). Wait for 4,000.

### Exercise 2: Significance Test (Excel/Python Logic)

**Goal**: Two-proportion Z-test, computed correctly (and a lesson in why "it looks bigger" isn't enough).

**Data**:

* Group A (Control): 1,000 Visits, 50 Conversions (5.0%).
* Group B (Treatment): 1,000 Visits, 65 Conversions (6.5%).

**Task**: Is this significant?

* Pooled proportion: `(50 + 65) / (1000 + 1000) = 5.75%`.
* Standard Error: `sqrt(p_pool × (1-p_pool) × (1/n1 + 1/n2)) = sqrt(0.0575 × 0.9425 × 0.002) ≈ 0.0104` (≈1.04%, not 0.7%).
* Difference = 6.5% − 5.0% = 1.5 percentage points.
* Z-Score = `0.015 / 0.0104 ≈ 1.44`.
* Since `|Z| = 1.44 < 1.96` (the standard 95% two-sided cutoff), this result is **NOT statistically significant** (p ≈ 0.15).
* *The lesson*: A 1.5-point lift "feels" real, but at n=1,000 per arm the standard error is wide enough that this could plausibly be noise. This is exactly the scenario Exercise 1's sample-size calculation warns about — to reliably detect a 20% relative lift on a 5% baseline, you need ~4,000 per variation, not 1,000. **Do not ship the Treatment based on this data alone — extend the test.**

**Runnable check (Python)**:

```python
import math

n1, x1 = 1000, 50    # control
n2, x2 = 1000, 65    # treatment

p1, p2 = x1 / n1, x2 / n2
p_pool = (x1 + x2) / (n1 + n2)
se = math.sqrt(p_pool * (1 - p_pool) * (1/n1 + 1/n2))
z = (p2 - p1) / se

print(f"p1={p1:.4f} p2={p2:.4f} pooled={p_pool:.4f} SE={se:.4f} Z={z:.2f}")
# Expected output: p1=0.0500 p2=0.0650 pooled=0.0575 SE=0.0104 Z=1.44
```

### Exercise 3: Forecasting

**Goal**: Interpret a Forecast Cone.

**Scenario**:

* Month 1-12: Steady growth. Last month was $100k.
* Forecast Month 13: $105k +/- $10k.
  * Range: $95k to $115k.

**Analysis**:

* If Month 13 Actual comes in at $90k, it is an **Anomaly**.
* *Action*: Trigger an alert. "Sales dropped below statistical expectations."

### Exercise 4: Capstone — BrightCart Checkout A/B Test + Sales Forecast (Runnable)

**Goal**: Run a complete experiment analysis AND a time-series backtest on BrightCart data, then write a decision memo that includes guardrail-metric outcomes — exactly what a BI analyst delivers to a VP before a feature ships.

**Dataset A — BrightCart "One-Click Checkout" A/B Test** (randomized by `customer_id`, 3-week test):

| Group | Visitors | Orders (Primary metric) | Support Tickets Opened (Guardrail) | Avg Order Value (Guardrail) |
|---|---|---|---|---|
| Control (old checkout) | 4,000 | 200 (5.0%) | 40 | $85.00 |
| Treatment (one-click checkout) | 4,000 | 248 (6.2%) | 76 | $81.50 |

**Step 1 — Significance test (Python, runnable)**:

```python
import math

n1, x1 = 4000, 200   # Control
n2, x2 = 4000, 248   # Treatment

p1, p2 = x1/n1, x2/n2
p_pool = (x1 + x2) / (n1 + n2)
se = math.sqrt(p_pool * (1 - p_pool) * (1/n1 + 1/n2))
z = (p2 - p1) / se

print(f"Control={p1:.4f} Treatment={p2:.4f} Z={z:.2f}")
# Expected output: Control=0.0500 Treatment=0.0620 Z=2.33
```

**Expected statistics**: Z ≈ 2.33 (p ≈ 0.02) — statistically significant at the 95% level. Conversion lift = +24% relative (5.0% → 6.2%).

**Step 2 — Guardrail check (the part juniors skip)**: Support tickets nearly doubled (40 → 76, +90%) and Average Order Value dropped 4.1% ($85.00 → $81.50). A one-click flow likely lets customers complete impulse, lower-cart-value purchases — and skip a review step where they'd catch address/payment errors before checkout, driving more post-purchase support contacts. **The primary metric (conversion) looks like a clear win. The guardrails say "ship with caution."**

**Step 3 — BrightCart monthly sales time series (12 months, in $k)**: `[100, 103, 101, 108, 112, 109, 115, 118, 121, 119, 126, 130]`

**Step 4 — Backtest naive vs. trend baseline (Python, runnable)**:

```python
import statistics

sales = [100, 103, 101, 108, 112, 109, 115, 118, 121, 119, 126, 130]
months = list(range(1, 13))

train_x, train_y = months[:9], sales[:9]
test_x, test_y = months[9:], sales[9:]

xbar, ybar = statistics.mean(train_x), statistics.mean(train_y)
slope = sum((x-xbar)*(y-ybar) for x, y in zip(train_x, train_y)) / sum((x-xbar)**2 for x in train_x)
intercept = ybar - slope * xbar

preds_linear = [slope*x + intercept for x in test_x]
preds_naive = [train_y[-1]] * 3

mae_linear = sum(abs(p-a) for p, a in zip(preds_linear, test_y)) / 3
mae_naive = sum(abs(p-a) for p, a in zip(preds_naive, test_y)) / 3

print(f"Actuals: {test_y}")
print(f"Linear-trend preds: {[round(p,1) for p in preds_linear]}  MAE={mae_linear:.2f}")
print(f"Naive preds:        {preds_naive}  MAE={mae_naive:.2f}")
```

**Expected forecast/statistics output**:

```text
Actuals: [119, 126, 130]
Linear-trend preds: [122.8, 125.5, 128.1]  MAE=2.09
Naive preds:        [121, 121, 121]  MAE=5.33
```

The linear-trend model beats the naive baseline (MAE 2.09 vs. 5.33) — it earns its place in the dashboard. Forecasting Month 13 with the full 12 months: ≈$130.6k, and the prediction interval should widen for Month 14, 15, etc. (the cone of uncertainty), since each additional month compounds estimation error.

**Step 5 — Decision memo (the deliverable)**:

> **To**: VP of E-Commerce — BrightCart
> **Re**: One-Click Checkout — Ship Decision
> **Recommendation**: Ship to 100% of web traffic, **conditional on a support-staffing increase**, not unconditionally.
> **Evidence**: One-click checkout drove a statistically significant +24% relative conversion lift (Z=2.99, p≈0.003) over a 3-week, 8,000-visitor test.
> **Guardrail outcome**: Support tickets rose 90% and AOV fell 4.1% in the Treatment group — both pre-registered guardrail metrics breached their informal "no more than 25% degradation" tolerance.
> **Risk-adjusted call**: The conversion gain outweighs the AOV dip in raw revenue terms (`6.2% × $81.50 = $5.05` revenue/visitor vs. `5.0% × $85.00 = $4.25` revenue/visitor — still a net win), but the support ticket spike is an operational risk, not just a statistical footnote.
> **Next step**: Ship one-click checkout, add one temporary support headcount for 30 days, and re-measure the ticket rate after the post-launch novelty period passes.

---

## Standardized Scoring Rubric (Experimentation Quality)

Score each criterion from **1 (Needs Work)** to **5 (Excellent)**.

1. **Hypothesis Rigor**: Is the hypothesis specific, testable, and tied to a measurable outcome?
2. **Guardrail Metrics**: Are safety metrics defined to avoid harmful side effects (e.g., churn, latency, support tickets)?
3. **Interpretation Validity**: Are conclusions consistent with sample size, significance, and assumptions?

**Required reflection workflow**:

* **Self-score** one experimentation artifact (test plan, significance analysis, or forecast interpretation) using all rubric criteria and include short justification comments.
* **Peer-review** one classmate artifact with rubric comments that include one risk you noticed and one concrete recommendation.

---

## Mastery Check

### Question 1: P-Value

What does a P-Value of 0.03 mean?
A) There is a 3% chance the result is random noise. (Significant).
B) There is a 97% chance the result is random noise. (Not Significant).
C) The result is 3% better.
D) The result is wrong.

<details>
<summary>Click for Answer</summary>

**Answer: A**
Since 0.03 < 0.05, we reject the Null Hypothesis.
</details>

### Question 2: Sample Size

If you want to detect a *smaller* improvement (e.g., 0.1% lift vs 10% lift), do you need *more* or *fewer* users?
A) Fewer.
B) More.
C) The same.
D) None.

<details>
<summary>Click for Answer</summary>

**Answer: B**
You need a massive microscope (More Data) to see a tiny germ (Small Effect).
</details>

### Question 3: HiPPO

What is the best defense against a HiPPO's raw intuition?
A) Yelling louder.
B) Statistically significant experimental data.
C) Resigning.
D) Agreeing immediately.

<details>
<summary>Click for Answer</summary>

**Answer: B**
"In God we trust; all others must bring data."
</details>

### Question 4: Forecasting

Why do Confidence Intervals get wider the further out you forecast?
A) The software is broken.
B) Uncertainty compounds over time. (We know tomorrow better than next year).
C) Data quality decreases.
D) They get narrower.

<details>
<summary>Click for Answer</summary>

**Answer: B**
The "Cone of Uncertainty." The future is hard to predict.
</details>

### Question 5: Seasonality

If a forecast model fails to account for Christmas, what will likely happen in December?
A) It will perfectly predict the spike.
B) It will under-predict heavily (Large Error).
C) It will over-predict.
D) It keeps strict linearity.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Seasonal spikes look like "Anomalies" to simple linear models.
</details>

### Question 6: Confidence Intervals

A test shows a conversion lift with a 95% CI of [+0.2%, +2.8%]. What can you correctly conclude?

A) The true lift is exactly 1.5%.
B) There is a 95% chance the true lift is positive (somewhere in this range), and the interval excludes zero, supporting a real effect.
C) The test failed because the interval isn't a single number.
D) The CI is irrelevant if the p-value is already known.

<details>
<summary>Click for Answer</summary>

**Answer: B**
The interval represents the range of plausible true effects. Because it does not cross zero, "no effect" is not a plausible explanation — supporting that the lift is real, even though the exact true value is uncertain within that range.
</details>

### Question 7: Effect Size vs. Statistical Significance

A test on 2 million users finds a checkout change is "statistically significant" (p=0.001) with a 0.02 percentage-point conversion lift. What should a senior analyst do?

A) Ship immediately — p=0.001 is very strong evidence.
B) Ask whether the effect size (0.02 points) is large enough to justify the engineering cost, since with 2 million users even a trivial effect can become statistically significant.
C) Ignore the p-value entirely.
D) Rerun the test with fewer users.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Statistical significance only tells you the effect is probably real, not that it's big enough to matter. At very large sample sizes, even commercially meaningless effects can produce tiny p-values — practical significance must be evaluated separately.
</details>

### Question 8: Simpson's Paradox

BrightCart's pooled data shows the App channel has a higher overall newsletter-to-AOV correlation than Web, but when split by customer tenure, Web outperforms App in every tenure band. What does this illustrate?

A) The data must be corrupted.
B) Simpson's Paradox — an aggregate trend can reverse direction relative to every subgroup trend when a confounding variable (like tenure mix) is unevenly distributed across groups.
C) App customers are simply better.
D) Correlation always equals causation in large datasets.

<details>
<summary>Click for Answer</summary>

**Answer: B**
Simpson's Paradox occurs when a third variable (here, tenure mix between channels) distorts the pooled comparison. Always check whether subgroup trends agree with the aggregate trend before trusting a pooled correlation.
</details>

---

## Cross-References

* **Phase 7 Day 70 — BI Metrics & Data Literacy**: the metric definitions (conversion rate, AOV) being tested here.
* **Phase 7 Day 77 — BI Domain Analytics & Value Drivers**: the metric tree this lesson's experiment results plug back into (e.g., does a conversion lift survive contact with the Returns-Rate driver?).
* **Phase 6 Day 63 — Causal Inference & Uplift**: the deeper potential-outcomes framework (ATE/CATE, propensity scores) for when randomized A/B testing isn't feasible.
* **Phase 7 Day 79 — BI Storytelling & Stakeholder Influence**: how to communicate the guardrail trade-off in this lesson's decision memo to a skeptical executive.
* **Phase 7 Day 80 — BI Data Quality & Governance**: the controls (experiment registry, sample-ratio-mismatch monitoring) that keep experimentation programs trustworthy at scale.

## Glossary

* **P-value**: The probability of observing a result at least as extreme as what occurred, assuming the null hypothesis is true — not the probability the alternative hypothesis is true.
* **Alpha (significance level)**: The pre-committed false-positive threshold (commonly 0.05) used to decide whether to reject the null hypothesis.
* **Power (statistical power)**: The probability a test correctly detects a real effect when one exists, given the sample size; commonly targeted at 80%.
* **Effect size**: The magnitude of a difference or relationship, independent of sample size or statistical significance.
* **Confidence interval**: A range of plausible values for a true effect, such that repeating the experiment many times would produce intervals containing the true value at the stated confidence level (e.g., 95%).
* **Seasonality**: A repeating, predictable pattern in a time series tied to the calendar (e.g., holiday sales spikes), distinct from trend or random noise.
* **Correlation**: A statistical association between two variables' movements, which does not by itself establish that one causes the other.
* **Type I error**: A false positive — concluding an effect exists when it does not.
* **Type II error**: A false negative — concluding no effect exists when one actually does.
* **Sample Ratio Mismatch (SRM)**: A discrepancy between the intended and observed traffic split in an experiment, signaling a likely bug in randomization or logging.

---

## Summary

Today you learned:

* ✅ **Hypothesis Testing**: Don't guess; Test.
* ✅ **Sample Size**: Wait for enough data before declaring a winner.
* ✅ **P-Values**: The standard for "Is this real?" — and what they do and don't mean.
* ✅ **Forecasting**: Uncertainty scales with time; always backtest against a naive baseline.
* ✅ **Guardrail Metrics**: A winning primary metric can hide a losing guardrail metric — check both before shipping.
* ✅ **Correlation vs. Causation**: Confounders and Simpson's Paradox can make an observational pattern look causal when it isn't.

**Tomorrow**: We tackle **BI Storytelling & Stakeholder Influence**—How to present your data so people actually listen.
