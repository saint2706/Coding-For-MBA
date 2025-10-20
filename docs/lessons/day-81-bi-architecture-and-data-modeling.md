## Why it matters

Business intelligence teams translate raw data into governed insights. A clear architecture
keeps ingestion, storage, and analytics aligned so analysts can trust their data assets and
ship faster.

## Agenda

- Map core data architecture layers, from ingestion pipelines to semantic models.
- Compare centralized warehouses, flexible lakes, and focused marts for BI delivery.
- Evaluate modeling trade-offs between star and snowflake patterns.
- Clarify fact/dimension roles, calculated measures, and semantic model governance.

## Star schema example

The `build_star_schema_example` helper in `solutions.py` models a retail analytics star schema
with a `fact_sales` table and conformed date, customer, product, and store dimensions. Use the
[Power BI star schema guidance](https://learn.microsoft.com/power-bi/guidance/star-schema)
for a diagrammed walkthrough that mirrors the classroom example.

## Snowflake schema example

The `build_snowflake_schema_example` helper extends the retail model by normalizing the
product hierarchy into dedicated tables. Compare the metadata with the
[Snowflake TPC-DS reference models](https://docs.snowflake.com/en/user-guide/sample-data-tpcds)
to see how snowflaked product dimensions appear in SQL DDL.

## Classroom resources

- `lesson.py` prints the roadmap topics and walks through both schema examples with references.
- `solutions.py` exposes grouped topic metadata plus helper functions for converting schema
  examples into structured dictionaries suitable for tests, slides, or demos.
- `tests/test_day_81.py` (added in this task) ensures the helpers surface all expected titles and
  schema metadata.

## Additional Topic: Operational BI Governance

> This lesson is part of the Phase 5 Business Intelligence specialization. Use the [Phase 5 overview](https://github.com/saint2706/Coding-For-MBA/blob/main/docs/bi-curriculum.md) to see how the developer-roadmap topics align across Days 68–84.

## Why it matters

Codify the controls that keep BI programs trustworthy.

## Developer-roadmap alignment

- Data Lineage
- Data Quality
- Privacy
- Bias Recognition

## Next steps

- Draft case studies and notebooks that exercise these roadmap nodes.
- Update the Phase 5 cheat sheet with the insights you capture here.

## Additional Materials

???+ example "lesson.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_81_BI_Architecture_and_Data_Modeling/lesson.py)

    ```python title="lesson.py"
    # %%
    """Day 81 – BI Architecture and Data Modeling classroom script."""

    # %%
    from __future__ import annotations

    import pandas as pd

    from Day_81_BI_Architecture_and_Data_Modeling import (
        SchemaExample,
        build_snowflake_schema_example,
        build_star_schema_example,
        build_topic_dataframe,
    )

    # %%
    STAR_SCHEMA_RESOURCE = "https://learn.microsoft.com/power-bi/guidance/star-schema"
    SNOWFLAKE_SCHEMA_RESOURCE = "https://docs.snowflake.com/en/user-guide/sample-data-tpcds"

    TOPIC_FRAME = build_topic_dataframe()
    STAR_SCHEMA = build_star_schema_example()
    SNOWFLAKE_SCHEMA = build_snowflake_schema_example()


    # %%
    def schema_to_dataframe(schema: SchemaExample) -> pd.DataFrame:
        """Convert schema metadata to a tabular view for classroom walkthroughs."""

        records: list[dict[str, str]] = []
        fact = schema["fact_table"]
        records.append(
            {
                "table": fact.get("name", ""),
                "kind": "fact",
                "grain": fact.get("grain", ""),
                "keys": ", ".join(fact.get("keys", [])),
                "business_fields": ", ".join(fact.get("measures", [])),
                "references": ", ".join(
                    f"{key} → {target}"
                    for key, target in fact.get("references", {}).items()
                ),
            }
        )
        for dimension in schema["dimensions"]:
            records.append(
                {
                    "table": dimension.get("name", ""),
                    "kind": "dimension",
                    "grain": dimension.get("grain", ""),
                    "keys": ", ".join(dimension.get("keys", [])),
                    "business_fields": ", ".join(
                        dimension.get("attributes", dimension.get("measures", []))
                    ),
                    "references": ", ".join(
                        f"{key} → {target}"
                        for key, target in dimension.get("references", {}).items()
                    ),
                }
            )
        return pd.DataFrame(
            records,
            columns=["table", "kind", "grain", "keys", "business_fields", "references"],
        )


    # %%
    def summarize_topics(frame: pd.DataFrame) -> None:
        """Print the taxonomy of Day 81 topics."""

        print("\nDay 81 architecture and modeling roadmap\n")
        print(frame.to_markdown(index=False))


    # %%
    def review_schema(title: str, schema: SchemaExample, resource_url: str) -> None:
        """Display schema metadata and provide a reference link for diagrams or SQL models."""

        summary = schema_to_dataframe(schema)
        print(f"\n{title}\n")
        print(summary.to_markdown(index=False))
        print(f"Reference: {resource_url}\n")
        print(schema["commentary"])


    # %%
    def main() -> None:
        """Run the classroom demo for Day 81."""

        summarize_topics(TOPIC_FRAME)
        review_schema("Retail star schema", STAR_SCHEMA, STAR_SCHEMA_RESOURCE)
        review_schema(
            "Retail snowflake schema", SNOWFLAKE_SCHEMA, SNOWFLAKE_SCHEMA_RESOURCE
        )


    # %%
    if __name__ == "__main__":
        main()
    ```

???+ example "solutions.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_81_BI_Architecture_and_Data_Modeling/solutions.py)

    ```python title="solutions.py"
    """Utilities for the Day 81 BI architecture and modeling lesson."""

    from __future__ import annotations

    from typing import Dict, Iterable, Mapping, Sequence, TypedDict, cast

    import pandas as pd

    from mypackage.bi_curriculum import BiTopic, topics_by_titles


    SECTION_TITLES: Mapping[str, list[str]] = {
        "Architectures": [
            "Data Architectures",
            "Cloud BI Ecosystem",
            "Data Warehouse",
            "Data Lake",
            "Data Mart",
        ],
        "Modeling patterns": [
            "Star vs Snowflake Schema",
            "Normalization vs Denormalization",
            "Fact vs Dimension Tables",
            "Calculated Fields & Measures",
            "Data Modeling for BI",
        ],
    }

    TOPIC_DESCRIPTIONS: Mapping[str, str] = {
        "Data Architectures": (
            "Position the overall data platform blueprint that connects sources, storage, and analytics "
            "layers."
        ),
        "Cloud BI Ecosystem": (
            "Highlight managed services and integration patterns that modernize analytics delivery."
        ),
        "Data Warehouse": (
            "Explain curated, structured storage optimized for governed reporting workloads."
        ),
        "Data Lake": (
            "Describe flexible storage that retains raw, semi-structured, and streaming data feeds."
        ),
        "Data Mart": (
            "Discuss subject-area presentation layers tailored to department-specific questions."
        ),
        "Star vs Snowflake Schema": (
            "Compare modeling layouts that balance query simplicity with normalization discipline."
        ),
        "Normalization vs Denormalization": (
            "Assess trade-offs between update efficiency, storage, and analytic performance."
        ),
        "Fact vs Dimension Tables": (
            "Clarify table roles, grains, and relationships when designing BI semantic layers."
        ),
        "Calculated Fields & Measures": (
            "Show how derived metrics provide reusable business logic for dashboards and self-service."
        ),
        "Data Modeling for BI": (
            "Connect modeling choices to governance, scalability, and downstream decision-making."
        ),
    }


    class SchemaTable(TypedDict, total=False):
        """Structure describing a table in an example schema."""

        name: str
        grain: str
        keys: Sequence[str]
        measures: Sequence[str]
        attributes: Sequence[str]
        references: Mapping[str, str]


    class SchemaExample(TypedDict):
        """Container for schema-level metadata used in classroom demos."""

        fact_table: SchemaTable
        dimensions: Sequence[SchemaTable]
        commentary: str


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
        """Return a DataFrame describing the BI architecture and modeling taxonomy."""

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
        return frame.drop_duplicates(subset=["title"], keep="first").reset_index(drop=True)


    def build_star_schema_example() -> SchemaExample:
        """Return metadata for a classroom retail sales star schema."""

        fact_sales: SchemaTable = {
            "name": "fact_sales",
            "grain": "one row per order line",
            "keys": ["date_key", "customer_key", "product_key", "store_key"],
            "measures": ["sales_amount", "quantity", "discount_amount", "gross_margin"],
            "references": {
                "date_key": "dim_date.date_key",
                "customer_key": "dim_customer.customer_key",
                "product_key": "dim_product.product_key",
                "store_key": "dim_store.store_key",
            },
        }

        dimensions: list[SchemaTable] = [
            {
                "name": "dim_date",
                "grain": "one row per calendar day",
                "keys": ["date_key"],
                "attributes": [
                    "date",
                    "day_of_week",
                    "month",
                    "quarter",
                    "year",
                    "holiday_flag",
                ],
            },
            {
                "name": "dim_customer",
                "grain": "one row per customer",
                "keys": ["customer_key"],
                "attributes": [
                    "customer_name",
                    "customer_segment",
                    "lifetime_value_band",
                    "loyalty_tier",
                ],
            },
            {
                "name": "dim_product",
                "grain": "one row per SKU",
                "keys": ["product_key"],
                "attributes": [
                    "product_name",
                    "brand",
                    "category",
                    "subcategory",
                ],
            },
            {
                "name": "dim_store",
                "grain": "one row per physical or digital storefront",
                "keys": ["store_key"],
                "attributes": [
                    "store_name",
                    "channel",
                    "region",
                ],
            },
        ]

        commentary = (
            "Classic star schema anchored on a sales fact table with conformed dimensions to simplify "
            "self-service reporting and aggregate navigation."
        )
        return cast(
            SchemaExample,
            {"fact_table": fact_sales, "dimensions": dimensions, "commentary": commentary},
        )


    def build_snowflake_schema_example() -> SchemaExample:
        """Return metadata for a snowflake schema extending the retail example."""

        star = build_star_schema_example()
        dim_product = next(
            dim for dim in star["dimensions"] if dim["name"] == "dim_product"
        )

        hierarchical_dimensions: list[SchemaTable] = list(star["dimensions"])
        product_category: SchemaTable = {
            "name": "dim_product_category",
            "grain": "one row per product subcategory",
            "keys": ["subcategory_key"],
            "attributes": ["subcategory", "category_key"],
            "references": {"category_key": "dim_product_category_group.category_key"},
        }
        product_category_group: SchemaTable = {
            "name": "dim_product_category_group",
            "grain": "one row per product category",
            "keys": ["category_key"],
            "attributes": ["category", "department"],
        }
        hierarchical_dimensions.extend([product_category, product_category_group])

        augmented_fact: SchemaTable = {
            **star["fact_table"],
            "references": {
                **star["fact_table"].get("references", {}),
                "product_key": "dim_product.product_key",
            },
        }

        commentary = (
            "Snowflake schema normalizes the product hierarchy into separate tables to reduce "
            "duplication while preserving downstream joins."
        )

        dimensions: list[SchemaTable] = []
        for dim in hierarchical_dimensions:
            if dim["name"] == "dim_product":
                dimensions.append(
                    {
                        **dim_product,
                        "references": {
                            "subcategory_key": "dim_product_category.subcategory_key"
                        },
                    }
                )
            else:
                dimensions.append(dim)

        return cast(
            SchemaExample,
            {
                "fact_table": augmented_fact,
                "dimensions": dimensions,
                "commentary": commentary,
            },
        )


    __all__ = [
        "build_snowflake_schema_example",
        "build_star_schema_example",
        "build_topic_dataframe",
        "load_topics",
        "SchemaExample",
        "SchemaTable",
    ]
    ```
