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
