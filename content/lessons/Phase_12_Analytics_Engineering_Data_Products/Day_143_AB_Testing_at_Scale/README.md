---
day: 143
title: "A/B Testing at Scale — Statistical Rigor and Experimentation Platforms"
phase: 12
phaseTitle: "Analytics Engineering & Data Products"
slug: "ab-testing-at-scale"
duration: 90
difficulty: "advanced"
tags:
  - ab-testing
  - experimentation
  - statistics
  - p-value
  - causal-inference
concepts:
  - "hypothesis testing and p-values"
  - "sample size calculation and power"
  - "multiple testing correction"
  - "experimentation platforms"
  - "sequential testing and peeking"
prerequisites:
  - "Day 37B: Probability and Statistics for ML"
  - "Day 137: Product Analytics Deep Dive"
outcomes:
  - "Design a rigorous A/B test with proper sample size"
  - "Avoid common statistical pitfalls (peeking, multiple comparisons)"
  - "Build an experimentation pipeline from assignment to analysis"
---

# 🧪 Day 138: A/B Testing at Scale — Statistical Rigor and Experimentation Platforms

> *"The plural of anecdote is not data. The plural of poorly-run A/B tests is not evidence. Rigor matters — every wrong decision based on a bad test costs real money."*

---

## The "Never-Coded" Bridge

**Think of A/B testing like a clinical drug trial.** You wouldn't approve a drug based on giving it to 5 people and asking "do you feel better?" You'd need a control group, a treatment group, enough patients, and statistical proof that the improvement isn't just random luck. A/B testing applies the same scientific rigor to product decisions: "Does changing the checkout button from blue to green actually increase purchases, or is it just noise?"

---

## The Technical Deep Dive

### 1. A/B Testing Fundamentals

A rigorous A/B test follows four steps in strict order: state a hypothesis, calculate the required sample size *before* collecting any data, run the test for that long, then analyze with a statistical test — never the reverse. The code below walks through all four steps for a checkout-flow test, using `scipy.stats` to both size the test (via a power calculation) and analyze the result (via a chi-square test of independence).

```python
from scipy import stats
import numpy as np

# A/B test: Does a new checkout flow increase conversion?

# Step 1: Define hypothesis
# H0 (null): No difference between control and treatment
# H1 (alternative): Treatment has higher conversion rate

# Step 2: Calculate sample size BEFORE running the test
def calculate_sample_size(
    baseline_rate: float,
    minimum_detectable_effect: float,
    alpha: float = 0.05,      # False positive rate (5%)
    power: float = 0.80,      # True positive rate (80%)
) -> int:
    """Calculate required sample size per group."""
    p1 = baseline_rate
    p2 = baseline_rate * (1 + minimum_detectable_effect)
    effect_size = (p2 - p1) / np.sqrt(p1 * (1 - p1))
    z_alpha = stats.norm.ppf(1 - alpha / 2)
    z_beta = stats.norm.ppf(power)
    n = ((z_alpha + z_beta) / effect_size) ** 2
    return int(np.ceil(n))

# Example: 3% baseline conversion, want to detect 10% relative lift
n = calculate_sample_size(baseline_rate=0.03, minimum_detectable_effect=0.10)
print(f"Need {n:,} users per group ({n*2:,} total)")
# → ~28,946 per group (57,892 total)

# Step 3: Run the test — collect data for the required duration
control = {"users": 30000, "conversions": 900}     # 3.0%
treatment = {"users": 30000, "conversions": 1020}   # 3.4%

# Step 4: Analyze with statistical test
contingency_table = [[900, 30000-900], [1020, 30000-1020]]
chi2, p_value, dof, expected = stats.chi2_contingency(contingency_table)
lift = (1020/30000 - 900/30000) / (900/30000) * 100

print(f"Control:   {900/30000:.2%}")
print(f"Treatment: {1020/30000:.2%}")
print(f"Lift:      {lift:.1f}%")
print(f"p-value:   {p_value:.4f}")
print(f"Result:    {'✅ Significant' if p_value < 0.05 else '❌ Not significant'}")
```

### 2. Common Pitfalls

Most A/B test failures aren't bad luck — they're one of a handful of well-known statistical traps. The dictionary below names each pitfall, why it produces a wrong conclusion, and the concrete fix, so you can audit a test report (like Lab Exercise 3) against this checklist before trusting its result.

```python
ab_test_pitfalls = {
    "peeking": {
        "problem": "Checking results daily and stopping when p < 0.05",
        "why_bad": "Checking 10 times inflates false positive rate from 5% to ~26%",
        "solution": "Pre-commit to sample size. Use sequential testing if early stopping needed.",
    },
    "multiple_comparisons": {
        "problem": "Testing 20 metrics, celebrating the one with p < 0.05",
        "why_bad": "With 20 metrics at 5% alpha, 1 false positive is EXPECTED",
        "solution": "Bonferroni correction (alpha/n) or designate 1 primary metric.",
    },
    "underpowered_tests": {
        "problem": "Running test with too few users, declaring 'no effect'",
        "why_bad": "Small sample → can't detect real effects → false negatives",
        "solution": "Calculate sample size BEFORE running. Don't start what you can't finish.",
    },
    "novelty_effect": {
        "problem": "Treatment looks great in week 1, fades by week 4",
        "why_bad": "Users click the shiny new thing, then revert to old behavior",
        "solution": "Run tests for at least 2 full business cycles. Check for time interaction.",
    },
    "simpson_paradox": {
        "problem": "Treatment wins overall but loses in every segment",
        "why_bad": "Uneven traffic allocation across segments distorts aggregate results",
        "solution": "Always segment results by key dimensions (mobile/desktop, new/returning).",
    },
}
```

### 3. Experimentation Pipeline

Scaling A/B testing beyond ad-hoc scripts requires a repeatable pipeline that any team can follow without re-deriving the statistics each time. The five stages below — design, implement, monitor, analyze, ship-or-kill — map directly onto the pitfalls above (e.g., "monitor" exists specifically to catch SRM and guardrail violations before they corrupt the analysis).

```python
experimentation_pipeline = {
    "1_design": {
        "steps": [
            "Define hypothesis and primary metric",
            "Calculate sample size and test duration",
            "Identify segments for heterogeneous effects",
            "Get stakeholder sign-off on decision criteria",
        ],
    },
    "2_implement": {
        "steps": [
            "Feature flag for treatment allocation (using LaunchDarkly, Eppo, etc.)",
            "Random assignment with consistent hashing (user_id-based)",
            "Event logging for all relevant metrics",
            "A/A test first to validate randomization",
        ],
    },
    "3_monitor": {
        "steps": [
            "Check sample ratio mismatch (SRM) — control and treatment should be 50/50",
            "Monitor guardrail metrics (latency, errors, revenue shouldn't tank)",
            "Don't peek at primary metric until planned analysis date",
        ],
    },
    "4_analyze": {
        "steps": [
            "Run statistical test on primary metric",
            "Check secondary metrics for unexpected effects",
            "Segment analysis (does it help/hurt specific user groups?)",
            "Document results and decision in experiment log",
        ],
    },
    "5_ship_or_kill": {
        "steps": [
            "If significant + positive: ship to 100%, monitor for 1 week",
            "If significant + negative: kill immediately",
            "If not significant: decide if worth running longer or kill",
        ],
    },
}
```

### 4. Experimentation Platforms Comparison

| Platform              | Type        | Key Feature                        | Best For                 |
| --------------------- | ----------- | ---------------------------------- | ------------------------ |
| **Eppo**              | SaaS        | Warehouse-native (queries your DW) | Modern data teams        |
| **Statsig**           | SaaS        | Feature flags + experiments        | Product teams            |
| **LaunchDarkly**      | SaaS        | Feature flags (ads experiments)    | Feature management first |
| **GrowthBook**        | Open Source | Bayesian + frequentist analysis    | Budget-conscious teams   |
| **Custom (in-house)** | Self-built  | Full control, high cost            | Large/mature orgs only   |

---

## Glossary

| Term | Definition |
|---|---|
| **Null Hypothesis (H0)** | The default assumption that there is no difference between control and treatment; the test looks for evidence to reject it. |
| **p-value** | The probability of observing a result this extreme (or more) if the null hypothesis were true; not the probability the treatment "works." |
| **Statistical Power** | The probability of correctly detecting a real effect when one exists (commonly targeted at 80%). |
| **Minimum Detectable Effect (MDE)** | The smallest relative lift you want the test to reliably detect; smaller MDEs require larger sample sizes. |
| **Sample Ratio Mismatch (SRM)** | When the observed control/treatment split deviates from the intended split (e.g., 46/54 instead of 50/50), signaling a randomization bug. |
| **Peeking** | Repeatedly checking test results before the planned sample size is reached and stopping as soon as significance appears, which inflates the false-positive rate. |
| **Multiple Comparisons Problem** | The increased chance of a false positive when testing many metrics or variants simultaneously, without correcting the significance threshold. |
| **Novelty Effect** | A temporary lift in a metric because users react to something new, which fades once the change is no longer novel. |
| **Simpson's Paradox** | When an aggregate result (treatment wins overall) reverses or disappears within every individual segment, often due to uneven segment traffic allocation. |
| **Guardrail Metric** | A secondary metric monitored during a test to ensure the primary metric's improvement isn't coming at the cost of something critical (e.g., latency, revenue, error rate). |
| **A/A Test** | A test that randomly splits users into two groups that both see the *same* experience, used to validate that the randomization and measurement pipeline itself is unbiased. |

---

## Hands-on Lab

### Exercise 1: Design an A/B Test

```python
# Scenario: a product manager proposes making the "Add to Cart" button 50%
# larger on the product detail page. Current baseline add-to-cart rate: 8%
# of product-page sessions. ~40,000 product-page sessions/day.

# TODO: Design a test for making the "Add to Cart" button larger.
# Define hypothesis, primary metric, sample size, and duration.
# List 3 guardrail metrics.

# EXPECTED RESULT:
# H0: Button size has no effect on add-to-cart rate.
# H1: A larger button increases add-to-cart rate.
# Primary metric: add-to-cart rate (clicks / product-page sessions).
# MDE: detect a 10% relative lift (8% -> 8.8%), alpha=0.05, power=0.80.
from scipy import stats
import numpy as np

def calculate_sample_size(baseline_rate, mde, alpha=0.05, power=0.80):
    p1 = baseline_rate
    p2 = baseline_rate * (1 + mde)
    effect_size = (p2 - p1) / np.sqrt(p1 * (1 - p1))
    z_alpha = stats.norm.ppf(1 - alpha / 2)
    z_beta = stats.norm.ppf(power)
    return int(np.ceil(((z_alpha + z_beta) / effect_size) ** 2))

n = calculate_sample_size(baseline_rate=0.08, mde=0.10)
# n ≈ 19,400 sessions per group (38,800 total)
# At ~40,000 sessions/day split 50/50, that's ~1 day of traffic minimum —
# round up to a full week to average out day-of-week effects.
#
# Guardrail metrics: (1) overall page load time (a bigger button shouldn't
# slow rendering), (2) checkout completion rate (more carts shouldn't mean
# more abandoned carts downstream), (3) revenue per session (a UI change
# shouldn't tank revenue even if add-to-cart ticks up).
```

### Exercise 2: Analyze Results

```python
# Given: Control (n=50K, 1500 conversions), Treatment (n=50K, 1620 conversions).
# TODO: Calculate lift, p-value, and confidence interval. Should you ship?

from scipy import stats

control = {"users": 50000, "conversions": 1500}     # 3.0%
treatment = {"users": 50000, "conversions": 1620}   # 3.24%

contingency_table = [
    [control["conversions"], control["users"] - control["conversions"]],
    [treatment["conversions"], treatment["users"] - treatment["conversions"]],
]
chi2, p_value, dof, expected = stats.chi2_contingency(contingency_table)
c_rate = control["conversions"] / control["users"]
t_rate = treatment["conversions"] / treatment["users"]
lift = (t_rate - c_rate) / c_rate * 100

# EXPECTED RESULT:
# Control:   3.00%
# Treatment: 3.24%
# Lift:      +8.0%
# p-value:   ≈ 0.146  (NOT significant at p < 0.05)
# Decision: Do NOT ship based on this result alone. The 8% lift is directionally
# positive but not statistically distinguishable from noise at this sample
# size — either run longer to accumulate more data, or treat this as a
# promising signal worth a follow-up test with a larger sample.
```

### Exercise 3: Spot the Errors

```markdown
# Review 3 hypothetical A/B test reports and identify the statistical
# errors in each.

Report A: "We checked results every morning for 2 weeks and stopped on day
9 when p dropped to 0.04, so we shipped it."
  -> ERROR: Peeking. Checking daily and stopping at the first p<0.05 sighting
     inflates the true false-positive rate far above 5%.

Report B: "We ran the test for 3 days with only 800 users per group and got
p=0.31, so we concluded the change has no effect."
  -> ERROR: Underpowered test. 800 users/group is likely far below the
     sample size needed to detect a realistic effect — "not significant"
     here means "we couldn't tell," not "there is no effect" (false negative risk).

Report C: "We tracked 15 metrics and found 'time on page' was significant
at p=0.04, so that's our big win."
  -> ERROR: Multiple comparisons. With 15 metrics tested at alpha=0.05,
     finding ~1 false positive by chance is expected; without a pre-
     designated primary metric or a correction (e.g., Bonferroni: alpha/15
     ≈ 0.0033), this "win" is likely noise.
```

---

## Mastery Check

**Q1**: What is statistical significance and why does the threshold of p < 0.05 matter?
<details><summary>Answer</summary>
P-value is the probability of seeing results this extreme if there's actually no difference (null hypothesis is true). P < 0.05 means there's less than a 5% chance the result is due to random noise. The 0.05 threshold is a convention — it balances false positives (shipping things that don't work) against false negatives (killing things that do work). Some companies use stricter thresholds (0.01) for high-stakes tests.
</details>

**Q2**: Why is "peeking" at A/B test results dangerous?
<details><summary>Answer</summary>
Each time you check results, you're essentially running a new test. With enough peeks, random fluctuations will eventually show p < 0.05 by chance alone. Checking daily for 14 days inflates your false positive rate from 5% to ~26%. Solutions: (1) pre-commit to a single analysis date, (2) use sequential testing methods (always valid p-values), or (3) use Bayesian methods which don't have the peeking problem.
</details>

**Q3**: What is Sample Ratio Mismatch (SRM) and why should it stop a test?
<details><summary>Answer</summary>
SRM means the split between control and treatment isn't what you expected (e.g., 48/52 instead of 50/50). This indicates a bug in randomization — some users are systematically excluded from or included in the treatment. Any results from a test with SRM are unreliable because the groups aren't comparable. Stop the test, fix the bug, and restart.
</details>

**Q4**: Your A/B test shows p = 0.06. The product manager says "that's basically significant, let's ship." What do you say?
<details><summary>Answer</summary>
p = 0.06 is not significant at the 0.05 threshold. Options: (1) run longer to accumulate more data — the effect might become significant with more power, (2) if the business impact of the expected lift is large, re-evaluate whether 90% confidence (p < 0.10) is acceptable for this specific decision, (3) don't lower the bar post-hoc — that's p-hacking. The honest answer: "we don't have evidence of an effect yet."
</details>

**Q5**: When should you NOT run an A/B test?
<details><summary>Answer</summary>
Don't A/B test when: (1) the change is a bug fix or compliance requirement — just ship it, (2) you don't have enough traffic to reach statistical significance within a reasonable timeframe, (3) the cost of being wrong is near zero (just ship and monitor), (4) the change is irreversible (you can't undo it if the test loses). A/B testing has overhead — use it for decisions that matter.
</details>

---

## Summary

- ✅ **Rigor**: Hypothesis → sample size → run → analyze → decision (in that order)
- ✅ **Pitfalls**: Peeking, multiple comparisons, underpowered tests, novelty effect
- ✅ **Pipeline**: Design → implement (feature flags) → monitor (SRM, guardrails) → analyze → ship
- ✅ **Platforms**: Eppo, Statsig, GrowthBook, LaunchDarkly — choose based on team maturity
- ✅ **Key rule**: Calculate sample size BEFORE running. Don't peek. Pre-commit to your decision criteria.

**Tomorrow → Day 139**: **Data Products and Monetization** — building data-powered products that drive revenue.
