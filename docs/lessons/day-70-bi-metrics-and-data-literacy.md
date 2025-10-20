Day 70 focuses on translating the BI roadmap's metrics and statistics nodes into a cohesive
classroom conversation. The taxonomy groups the roadmap material into four facilitation
modules:

- **Metric design** – Clarify how analysts connect business objectives to measurement by
  introducing the KPI lifecycle and the major analysis modalities (descriptive and predictive)
  that underpin dashboard storytelling.
- **Data typing** – Review how variable types gate which aggregations and visual encodings are
  valid so teams can choose the right KPI denominator and segmentation logic.
- **Descriptive statistics** – Revisit central tendency tools (mode, mean, median) as the
  building blocks for summary tables, baselines, and trend interpretation.
- **Inferential readiness** – Frame the mindset shifts needed when moving from descriptive work
  into experimentation, including correlation caveats, confidence intervals, and inferential
  testing fundamentals.

The accompanying lesson script demonstrates how to implement these concepts with pandas by
calculating funnel conversion rates, revenue KPIs, and marketing ROI from a sample campaign
DataFrame. Use it to guide the discussion from conceptual taxonomy to practical KPI analysis.

## Additional Materials

???+ example "lesson.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_70_BI_Metrics_and_Data_Literacy/lesson.py)

    ```python title="lesson.py"
    # %%
    """Day 70 – BI Metrics and Data Literacy classroom script."""

    # %%
    from __future__ import annotations

    import pandas as pd

    from Day_70_BI_Metrics_and_Data_Literacy import build_topic_dataframe, load_topics

    # %%
    TOPIC_GROUPS = load_topics()
    TOPIC_FRAME = build_topic_dataframe()


    # %%
    def safe_divide(numerator: pd.Series, denominator: pd.Series) -> pd.Series:
        """Return a ratio with zero-protection for classroom demos."""

        safe_denominator = denominator.where(denominator != 0, pd.NA)
        return numerator.divide(safe_denominator).fillna(0)


    # %%
    def build_campaign_metrics() -> pd.DataFrame:
        """Create a sample campaign DataFrame with common KPIs."""

        campaign = pd.DataFrame(
            {
                "campaign": ["Email", "Paid Social", "Webinar"],
                "visits": [1200, 950, 420],
                "signups": [180, 140, 105],
                "purchases": [48, 32, 27],
                "revenue": [9600.0, 7200.0, 6750.0],
                "spend": [2800.0, 3400.0, 1800.0],
            }
        )

        metrics = campaign.assign(
            signup_rate=lambda df: safe_divide(df["signups"], df["visits"]),
            purchase_rate=lambda df: safe_divide(df["purchases"], df["signups"]),
            overall_conversion=lambda df: safe_divide(df["purchases"], df["visits"]),
            average_order_value=lambda df: safe_divide(df["revenue"], df["purchases"]),
            marketing_roi=lambda df: safe_divide(df["revenue"] - df["spend"], df["spend"]),
        )
        return metrics


    # %%
    def summarize_taxonomy(frame: pd.DataFrame) -> None:
        """Print the roadmap taxonomy for facilitation."""

        print("\nDay 70 taxonomy overview\n")
        print(frame.to_markdown(index=False))


    # %%
    def review_kpi_metrics(frame: pd.DataFrame) -> None:
        """Print the KPI DataFrame with formatted percentages for discussion."""

        formatted = frame.copy()
        percent_columns = [
            "signup_rate",
            "purchase_rate",
            "overall_conversion",
            "marketing_roi",
        ]
        for column in percent_columns:
            formatted[column] = (formatted[column] * 100).map("{:.1f}%".format)
        formatted["average_order_value"] = formatted["average_order_value"].map(
            "${:,.2f}".format
        )

        print("\nSample campaign KPI review\n")
        print(formatted.to_markdown(index=False))


    # %%
    def main() -> None:
        """Run the classroom demo for Day 70."""

        summarize_taxonomy(TOPIC_FRAME)
        kpi_frame = build_campaign_metrics()
        review_kpi_metrics(kpi_frame)


    # %%
    if __name__ == "__main__":
        main()
    ```

???+ example "solutions.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_70_BI_Metrics_and_Data_Literacy/solutions.py)

    ```python title="solutions.py"
    """Utilities for the Day 70 BI Metrics and Data Literacy lesson."""

    from __future__ import annotations

    from typing import Dict, Iterable, Mapping

    import pandas as pd

    from mypackage.bi_curriculum import BiTopic, topics_by_titles

    SECTION_TITLES: Mapping[str, list[str]] = {
        "Metric design": [
            "Metrics and KPIs",
            "Types of Data Analysis",
            "Descriptive Analysis",
            "Predictive Analysis",
        ],
        "Data typing": [
            "Variables and Data Types",
            "Categorical vs Numerical",
        ],
        "Descriptive statistics": [
            "Mode",
            "Mean",
            "Median",
        ],
        "Inferential readiness": [
            "Correlation vs Causation",
            "Confidence Intervals",
            "Inferential Statistics",
        ],
    }

    TOPIC_DESCRIPTIONS: Mapping[str, str] = {
        "Metrics and KPIs": (
            "Frame how KPIs connect to business objectives and translate strategy into "
            "trackable metrics."
        ),
        "Types of Data Analysis": (
            "Introduce the major analysis families so analysts can choose the right lens "
            "for each question."
        ),
        "Descriptive Analysis": (
            "Explain summarizing past performance to contextualize KPI baselines and "
            "historical trends."
        ),
        "Predictive Analysis": (
            "Highlight forecasting techniques that extend KPI planning beyond current "
            "snapshots."
        ),
        "Variables and Data Types": (
            "Clarify how variable structures influence metric aggregation and modeling "
            "decisions."
        ),
        "Categorical vs Numerical": (
            "Reinforce data typing nuances that determine valid calculations and visual "
            "encodings."
        ),
        "Mode": (
            "Define the most frequent categorical outcome to capture common customer or "
            "operational states."
        ),
        "Mean": (
            "Explain the arithmetic average as a baseline indicator for continuous KPIs."
        ),
        "Median": (
            "Show how the midpoint guards against skew when profiling revenue or cycle "
            "time metrics."
        ),
        "Correlation vs Causation": (
            "Stress the analytical discipline needed to interpret related metrics without "
            "overstating causal claims."
        ),
        "Confidence Intervals": (
            "Equip analysts with interval estimates to communicate metric uncertainty and "
            "sampling error."
        ),
        "Inferential Statistics": (
            "Connect hypothesis testing foundations to BI experimentation and advanced "
            "forecasting."
        ),
    }


    def load_topics(
        *, sections: Mapping[str, Iterable[str]] = SECTION_TITLES
    ) -> Dict[str, list[BiTopic]]:
        """Return roadmap topics grouped by the requested sections."""

        grouped_topics: Dict[str, list[BiTopic]] = {}
        for section, titles in sections.items():
            grouped_topics[section] = topics_by_titles(list(titles))
        return grouped_topics


    def build_topic_dataframe(
        *,
        sections: Mapping[str, Iterable[str]] = SECTION_TITLES,
        descriptions: Mapping[str, str] = TOPIC_DESCRIPTIONS,
    ) -> pd.DataFrame:
        """Return a DataFrame describing the BI metrics and data literacy taxonomy."""

        records: list[dict[str, str]] = []
        for section, topics in load_topics(sections=sections).items():
            for topic in topics:
                records.append(
                    {
                        "section": section,
                        "title": topic.title,
                        "description": descriptions.get(topic.title, ""),
                    }
                )
        frame = pd.DataFrame(records, columns=["section", "title", "description"])
        if frame.empty:
            return frame
        deduped = frame.drop_duplicates(subset=["title"], keep="first").reset_index(
            drop=True
        )
        return deduped


    __all__ = ["build_topic_dataframe", "load_topics"]
    ```
