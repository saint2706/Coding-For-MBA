# Day 75 – BI Visualization and Dashboard Principles

Day 75 codifies the BI visualization fundamentals that analysts rely on to communicate
credibly, and it layers in the design guardrails that keep dashboards inclusive and
trustworthy. Use this lesson to practice building each core chart type while checking
your work against accessibility and storytelling heuristics.

## Learning objectives

- Differentiate when to use bar, line, scatter, heatmap, histogram, and map charts.
- Apply color, annotation, and layout techniques that reduce the risk of misleading
  insights.
- Stress test dashboards for accessibility, mobile responsiveness, and executive
  consumption.

## Assets

| File | Description |
| --- | --- |
| [`lesson.py`](lesson.py) | Walks through each chart helper and prints trace counts so you can confirm the setup in headless environments. |
| [`solutions.py`](solutions.py) | Exposes reusable helpers to build Plotly figures for every chart type plus a Matplotlib palette demo, and a curriculum outline DataFrame grouping fundamentals versus guardrails. |

Run the interactive demo:

```bash
python Day_75_BI_Visualization_and_Dashboard_Principles/lesson.py
```

## Visualization fundamentals

| Chart | When to use | Design do | Design don't |
| --- | --- | --- | --- |
| Bar | Compare discrete categories such as departmental revenue. | Sort bars, annotate totals, and start axes at zero. | Overload colors or rotate labels unless necessary. |
| Line | Show change over ordered time. | Highlight key turning points and label end values directly. | Mix unrelated measures on the same axis or truncate time spans. |
| Scatter | Reveal correlations between two measures. | Use consistent point sizes and call out notable clusters or outliers. | Combine more than two measures without encoding size/colour intentionally. |
| Heatmap | Contrast intensity across two categorical dimensions. | Keep the colour scale perceptually uniform and annotate extremes. | Use rainbow gradients or omit a legend. |
| Histogram | Understand distribution spread and skew. | Pick bin widths that match the audience's mental buckets. | Stack dissimilar distributions without faceting. |
| Map | Communicate geographic comparisons. | Add tooltips for values and provide context on projection or boundaries. | Map sparse data without normalising by population/area. |

## Design guardrails

- **Color theory:** Favor accessible palettes (see `create_color_palette_demo`) and test
  contrast ratios with WCAG guidelines.
- **Misleading charts:** Avoid dual axes with mismatched scales, truncated axes, and
  unnecessary 3D effects.
- **Accessibility:** Provide descriptive titles, alt text for exported images, and
  keyboard-friendly interactions.
- **Mobile-responsiveness:** Prototype small-screen layouts with stacked tiles and
  simplified navigation.
- **Design principles:** Use whitespace, alignment, and grouping to guide the reader's
  eye along the intended narrative.
- **Dashboard design:** Start with business questions, draft mockups before building,
  and iterate with stakeholders to validate usefulness.

## Additional Topic: Inferential Analytics

> This lesson is part of the Phase 5 Business Intelligence specialization. Use the [Phase 5 overview](../docs/bi-curriculum.md) to see how the developer-roadmap topics align across Days 68–84.

## Why it matters

Move from descriptive reporting to evidence-backed inference.

## Developer-roadmap alignment

- Inferential Statistics
- Hypothesis Testing
- Regression Analysis

## Next steps

- Draft case studies and notebooks that exercise these roadmap nodes.
- Update the Phase 5 cheat sheet with the insights you capture here.
