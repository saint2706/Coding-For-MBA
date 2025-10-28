---
title: "Day 83 \u2013 BI Cloud and Modern Data Stack"
tags:
- BI
- Data
---
# Day 83 – BI Cloud and Modern Data Stack

> This lesson is part of the Phase 5 Business Intelligence specialization. Use the
> [Phase 5 overview](../docs/bi-curriculum.md) to see how the developer-roadmap topics align across
> Days 68–84.

## Why it matters

Modern BI teams assemble cloud-native tooling that balances time-to-value, governance, and spend.
Understanding how the cloud ecosystem fits together ensures analysts can navigate trade-offs when
choosing warehouses, integration layers, and visualization services.

## Developer-roadmap alignment

- Cloud Computing Basics
- Cloud BI Ecosystem
- Cloud data warehouses
- Providers: AWS, GCP, Azure
- Cloud

## Cloud architecture patterns

| Pattern | Components | Feature focus | Cost trade-off | | --- | --- | --- | --- | | Centralized
warehouse with semantic layer | Serverless warehouse, ELT pipelines, BI semantic model | Curated
metrics exposed through governed BI layers | Reserved capacity discounts exchange flexibility for
governance licensing costs | | Lakehouse with streaming ingestion | Object storage, streaming
ingestion, open table formats, SQL endpoints | Unified analytics supporting dashboards and ML on the
same platform | Streaming autoscale fees must be balanced against freshness SLAs | | Composable
stack with reverse ETL | Cloud warehouse, transformation service, reverse ETL activations |
Operationalizes analytics inside SaaS tools without duplicating logic | Connector-based pricing
introduces variable spend per downstream system |

## Provider evaluation checklist

- Confirm the managed warehouse option (Redshift, BigQuery, Synapse) and how it scales.
- Map analytics services (QuickSight, Looker, Power BI) to stakeholder use cases.
- Align orchestration choices (Step Functions, Cloud Composer, Data Factory) with existing
  engineering standards.
- Capture pricing guardrails, including autosuspend, flat-rate commitments, and hybrid benefits.
- Note governance integrations such as IAM, Dataplex, and Purview for security reviews.

## Next steps

- Use the comparison matrix in `lesson.py` to facilitate vendor shortlists.
- Draft cost scenarios that highlight egress, autoscaling, and reserved capacity for each provider.

## Additional Topic: Career Assets & Credentials

> This lesson is part of the Phase 5 Business Intelligence specialization. Use the
> [Phase 5 overview](../docs/bi-curriculum.md) to see how the developer-roadmap topics align across
> Days 68–84.

## Why it matters

Design a career evidence plan that highlights BI outcomes.

## Developer-roadmap alignment

- Building Your Portfolio
- Job Preparation
- Certifications
- Networking

## Next steps

- Draft case studies and notebooks that exercise these roadmap nodes.
- Update the Phase 5 cheat sheet with the insights you capture here.

<!-- LESSON_FOOTER_START -->

---

**Previous:** [Day 82 – Day 82 – BI ETL and Pipeline Automation](../Day_82_BI_ETL_and_Pipeline_Automation/README.md) • **Next:** [Day 84 – Day 84 – BI Career Development and Capstone](../Day_84_BI_Career_Development_and_Capstone/README.md)

_You are on lesson 83 of 108._

<!-- LESSON_FOOTER_END -->