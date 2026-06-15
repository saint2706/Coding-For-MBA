---
day: 138
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

## Hands-on Lab

### Exercise 1: Design an A/B Test

Design a test for making the "Add to Cart" button larger. Define hypothesis, primary metric, sample size, and duration. List 3 guardrail metrics.

### Exercise 2: Analyze Results

Given: Control (n=50K, 1500 conversions), Treatment (n=50K, 1620 conversions). Calculate lift, p-value, and confidence interval. Should you ship?

### Exercise 3: Spot the Errors

Review 3 hypothetical A/B test reports and identify the statistical errors in each (peeking, underpowered, multiple comparisons).

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
