"""Tests for Day 81 – BI Architecture and Data Modeling."""

import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from Day_81_BI_Architecture_and_Data_Modeling import (
    build_snowflake_schema_example,
    build_star_schema_example,
    build_topic_dataframe,
)


def test_topic_dataframe_lists_all_titles() -> None:
    """Ensure the taxonomy includes every required topic title."""

    frame = build_topic_dataframe()
    expected_titles = {
        "Data Architectures",
        "Cloud BI Ecosystem",
        "Data Warehouse",
        "Data Lake",
        "Data Mart",
        "Star vs Snowflake Schema",
        "Normalization vs Denormalization",
        "Fact vs Dimension Tables",
        "Calculated Fields & Measures",
        "Data Modeling for BI",
    }
    assert expected_titles.issubset(set(frame["title"]))


def test_star_schema_metadata() -> None:
    """The star schema example should expose a retail fact table and conformed dimensions."""

    schema = build_star_schema_example()
    assert schema["fact_table"]["name"] == "fact_sales"
    assert schema["fact_table"]["references"]["date_key"] == "dim_date.date_key"
    dimension_names = {dimension["name"] for dimension in schema["dimensions"]}
    assert {"dim_date", "dim_customer", "dim_product", "dim_store"}.issubset(
        dimension_names
    )


def test_snowflake_schema_metadata() -> None:
    """The snowflake example should normalize the product hierarchy and preserve joins."""

    schema = build_snowflake_schema_example()
    dimensions = {dimension["name"]: dimension for dimension in schema["dimensions"]}
    assert "dim_product_category" in dimensions
    assert "dim_product_category_group" in dimensions
    assert dimensions["dim_product"]["references"]["subcategory_key"] == (
        "dim_product_category.subcategory_key"
    )
    assert dimensions["dim_product_category"]["references"]["category_key"] == (
        "dim_product_category_group.category_key"
    )
    assert (
        schema["fact_table"]["references"]["product_key"] == "dim_product.product_key"
    )
    assert schema["commentary"]
