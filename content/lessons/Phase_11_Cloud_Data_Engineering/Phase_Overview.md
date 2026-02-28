---
phase: 11
title: "Cloud Data Engineering"
days: [121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132]
totalDuration: 720
difficulty: "advanced"
tags:
  - cloud
  - aws
  - gcp
  - data-engineering
  - pipelines
  - production
---

# ☁️ Phase 11: Cloud Data Engineering

> *"The modern data engineer doesn't manage servers — they architect cloud-native platforms that scale from zero to petabytes while their dashboards stay green."*

---

## Phase Overview

Phase 11 takes you from on-premises thinking to cloud-native data engineering. You'll learn to design, build, and operate production data platforms on AWS, GCP, and Azure — with a focus on cost optimization, security, and operational excellence.

**This phase answers:** "How do I build a data platform that handles real-world scale, is secure, cost-efficient, and doesn't wake me up at 3 AM?"

---

## What You'll Build

By the end of Phase 11, you'll have designed and implemented:

- ☁️ A **multi-tier data lake** on object storage (S3/GCS) with medallion architecture
- 🏗️ **Cloud data warehouse** queries optimized for cost and performance
- 🔧 **dbt transformations** with incremental models and quality contracts
- 🎼 **Orchestrated pipelines** (Airflow/Prefect) with retry logic and monitoring
- 🌊 **Streaming architecture** with Kafka concepts and windowed aggregations
- 🏠 **Lakehouse patterns** with Delta Lake and governance via Unity Catalog
- ✅ **Data quality gates** with Great Expectations and Soda
- 🔒 **Secure infrastructure** with VPC, encryption, and compliance controls
- 💰 **FinOps practice** with cost attribution, optimization, and unit economics
- 🏗️ **Infrastructure as Code** with Terraform and CI/CD for data
- 🏆 **End-to-end capstone** pipeline from ingestion to dashboard

---

## Curriculum

| Day | Topic                                                                    | Key Skills                                              |
| --- | ------------------------------------------------------------------------ | ------------------------------------------------------- |
| 121 | [Cloud Fundamentals](./Day_121_Cloud_Fundamentals/)                      | AWS/GCP/Azure, IAM, regions, cost models                |
| 122 | [Object Storage](./Day_122_Object_Storage/)                              | S3/GCS, medallion architecture, Delta Lake, Iceberg     |
| 123 | [Cloud Data Warehouses](./Day_123_Cloud_Data_Warehouses/)                | BigQuery, Snowflake, Redshift, query optimization       |
| 124 | [dbt at Scale](./Day_124_dbt_at_Scale/)                                  | Incremental models, snapshots, macros, contracts        |
| 125 | [Orchestration](./Day_125_Orchestration/)                                | Airflow, Prefect, Dagster, DAGs, idempotency            |
| 126 | [Streaming Pipelines](./Day_126_Streaming_Pipelines/)                    | Kafka, Pub/Sub, delivery guarantees, windowing          |
| 127 | [Lakehouse Architecture](./Day_127_Lakehouse_Architecture/)              | Databricks, Delta Live Tables, Unity Catalog            |
| 128 | [Data Contracts & Quality](./Day_128_Data_Contracts_and_Quality/)        | Great Expectations, Soda, SLAs, anomaly detection       |
| 129 | [Cloud Security & Compliance](./Day_129_Cloud_Security_and_Compliance/)  | VPC, encryption, PII, GDPR, SOC 2                       |
| 130 | [Cost Engineering](./Day_130_Cost_Engineering/)                          | FinOps, tagging, reserved instances, query optimization |
| 131 | [Platform Engineering](./Day_131_Platform_Engineering/)                  | Terraform, IaC, CI/CD, self-serve infrastructure        |
| 132 | [Capstone: Cloud Data Pipeline](./Day_132_Capstone_Cloud_Data_Pipeline/) | End-to-end pipeline from ingestion to dashboard         |

---

## ROI for MBA Professionals

| Skill Area                | Business Impact                               | Market Value           |
| ------------------------- | --------------------------------------------- | ---------------------- |
| Cloud Architecture        | Design scalable platforms for any data volume | $150-220K roles        |
| Data Pipeline Engineering | Build automated, reliable data delivery       | Core DE skill          |
| FinOps / Cost Management  | Save $10K-100K/month through optimization     | CFO-visible impact     |
| Security & Compliance     | Prevent $4.88M avg. data breach cost          | Enterprise requirement |
| Platform Engineering      | Enable 10x more data products with self-serve | Leadership trajectory  |

---

## Skills Matrix

```
Cloud Infrastructure    ████████████████████ Advanced
Object Storage          ████████████████████ Advanced
Data Warehousing        ████████████████████ Advanced
dbt Engineering         ████████████████████ Advanced
Orchestration           ████████████████████ Advanced
Streaming               ██████████████████░░ Proficient
Lakehouse               ██████████████████░░ Proficient
Data Quality            ████████████████████ Advanced
Security                ██████████████████░░ Proficient
FinOps                  ████████████████████ Advanced
IaC / Platform          ██████████████████░░ Proficient
```

---

## Prerequisites

Before starting Phase 11, you should be comfortable with:

- ✅ **Phase 3**: Python data processing (Pandas, files, APIs)
- ✅ **Phase 7**: dbt fundamentals (Day 84B)
- ✅ **Phase 8**: SQL mastery (joins, CTEs, window functions)
- ✅ **Phase 9**: Enterprise SQL patterns
- ✅ **Day 36B**: Docker fundamentals (helpful for Airflow)

---

## Career Paths Unlocked

| Role                    | Salary Range (2025) | Phase 11 Focus           |
| ----------------------- | ------------------- | ------------------------ |
| **Cloud Data Engineer** | $140-200K           | Days 121-126, 131-132    |
| **Analytics Engineer**  | $130-180K           | Days 123-124, 128        |
| **Platform Engineer**   | $160-220K           | Days 127, 129-131        |
| **Data Architect**      | $170-240K           | All days — holistic view |
| **FinOps Practitioner** | $140-190K           | Days 121, 130            |

---

## Expert Track

For those who want to go deeper:

1. **Get Cloud Certified**: AWS Data Analytics Specialty, GCP Professional Data Engineer
2. **Build a Portfolio Project**: Deploy the capstone pipeline with real-time data
3. **Contribute to Open Source**: dbt packages, Great Expectations custom expectations
4. **Learn Kubernetes**: Container orchestration for data platforms (EKS, GKE)
5. **Study Data Mesh**: Domain-oriented data ownership (covered in Phase 12)

---

## What's Next

**Phase 12: Analytics Engineering & Data Products** builds on Phase 11's infrastructure to focus on the business side: semantic layers, self-serve analytics, data mesh, product analytics, A/B testing, and building data products that drive revenue.
