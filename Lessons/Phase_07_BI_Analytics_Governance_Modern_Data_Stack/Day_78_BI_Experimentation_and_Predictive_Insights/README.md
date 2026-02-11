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

1.  **Hypothesis**: "People prefer Pepsi over Coke."
2.  **Experiment**: Blind taste test.
    *   **Control Group (A)**: Drinks Coke.
    *   **Treatment Group (B)**: Drinks Pepsi.
3.  **Result**: 55% chose Pepsi. 45% chose Coke.
4.  **Conclusion**: Pepsi wins?
    *   **Wait!** If you only tested 10 people, this could be luck. (5 vs 4 is basically a coin flip).
    *   If you tested 10,000 people, it's statistically significant.

**BI Analysts** don't just report "Sales are up." They ask: "Is this real, or is it randomness?"

---

## The Technical Deep Dive

### 1. Statistical Significance (The P-Value)

*   **P-Value < 0.05**: "There is less than a 5% chance this result happened by luck." (We trust it).
*   **Sample Size Formula**: 
    *   To detect a small change (1% lift), you need HUGE traffic.
    *   To detect a huge change (50% lift), you need small traffic.

### 2. Forecasting in BI Tools

Tools like Tableau and Power BI define "Forecast" using **Exponential Smoothing** (Holt-Winters).
*   **Seasonality**: It detects "Sales always spike in December."
*   **Trend**: It detects "Sales are generally going up."
*   **Confidence Interval**: "Sales will be between $80k and $120k next month." (The gray cone area).

### 3. Correlation Matrix

A grid showing how every variable relates to every other variable.
*   **+1**: Perfectly correlated (Height + Shoe Size).
*   **-1**: Perfectly inverse (Rain + Outdoor Dining).
*   **0**: No relationship (Ice Cream Sales + Shark Attacks... wait, that's actually correlated due to Summer!).

---

## Senior-Level Insights

### The HiPPO Effect

*   **HiPPO**: **Hi**ghest **P**aid **P**erson's **O**pinion.
*   **Scenario**: The CEO says "I like the Blue Button."
*   **The Analyst**: "I ran an A/B test. The Red Button increased conversion by 14% (P=0.01). If we switch to Blue, we lose $2M/year."
*   **Result**: Data beats Opinion. (Usually).

### "Peeking" at Experiments

*   **Sin**: Checking results every hour and stopping the test when it looks "Green."
*   **Why**: This is "P-Hacking." You are cherry-picking randomness.
*   **Rule**: Decide Sample Size *before* you start. Don't stop until you hit it.

---

## Hands-on Lab

### Exercise 1: Sample Size Calculation
**Goal**: Use an online calculator logic.

**Scenario**:
*   Baseline Conversion: 5% (Current Rate).
*   Minimum Detectable Effect (MDE): Equal to 20% relative lift (Target: 6%).
*   Statistical Power: 80%.
*   Significance Level: 5%.

**Calculation** (Approximation):
*   You need roughly ~4,000 visitors per variation.
*   *Action*: Do not report results after 1 day (100 visitors). Wait for 4,000.

### Exercise 2: Significance Test (Excel/Python Logic)
**Goal**: T-Test.

**Data**:
*   Group A (Control): 1000 Visits, 50 Conversions (5%).
*   Group B (Treatment): 1000 Visits, 65 Conversions (6.5%).

**Task**: Is this significant?
*   Standard Error ~ 0.7%.
*   Difference = 1.5%.
*   Z-Score = 1.5 / 0.7 = 2.14.
*   Since Z > 1.96 (Standard 95% Cutoff), **Yes**, it is significant.

### Exercise 3: Forecasting
**Goal**: Interpret a Forecast Cone.

**Scenario**:
*   Month 1-12: Steady growth. Last month was $100k.
*   Forecast Month 13: $105k +/- $10k.
    *   Range: $95k to $115k.

**Analysis**:
*   If Month 13 Actual comes in at $90k, it is an **Anomaly**.
*   *Action*: Trigger an alert. "Sales dropped below statistical expectations."

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

---

## Summary

Today you learned:
*   ✅ **Hypothesis Testing**: Don't guess; Test.
*   ✅ **Sample Size**: Wait for enough data before declaring a winner.
*   ✅ **P-Values**: The standard for "Is this real?"
*   ✅ **Forecasting**: Uncertainty scales with time.

**Tomorrow**: We tackle **BI Storytelling & Stakeholder Influence**—How to present your data so people actually listen.
