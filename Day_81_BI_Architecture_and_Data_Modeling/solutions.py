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
