---
day: 136
title: "Platform Engineering — Terraform, IaC, Self-Serve Infrastructure"
phase: 11
phaseTitle: "Cloud Data Engineering"
slug: "platform-engineering"
duration: 90
difficulty: "advanced"
tags:
  - terraform
  - iac
  - platform-engineering
  - ci-cd
  - devops
concepts:
  - "Infrastructure as Code (IaC)"
  - "Terraform resources and state"
  - "CI/CD for data pipelines"
  - "self-serve data infrastructure"
  - "GitOps for data platforms"
prerequisites:
  - "Day 121: Cloud Fundamentals"
  - "Day 36B: Docker Fundamentals"
outcomes:
  - "Write Terraform to provision data infrastructure"
  - "Build CI/CD pipelines for dbt and Airflow deployments"
  - "Design a self-serve data platform for domain teams"
---

# 🏗️ Day 136: Platform Engineering — Terraform, IaC, Self-Serve Infrastructure

> *"If you can't reproduce your infrastructure from code, you don't have infrastructure — you have a snowflake that will melt at the worst possible time."*

---

## The "Never-Coded" Bridge

**Think of Infrastructure as Code like architectural blueprints.** You wouldn't build a house by calling workers and verbally describing each room — you'd create blueprints that specify exact dimensions, materials, and wiring. If the house burns down, you rebuild from the same blueprints. IaC does this for cloud infrastructure: every server, database, and network rule is defined in versioned code files. Change the code, review it, and deploy — just like application code.

Platform engineering takes this further: instead of each data team provisioning their own infrastructure, the platform team builds a self-serve "internal developer platform" — domain teams can spin up databases, pipelines, and environments through a catalog, while the platform team ensures consistency, security, and cost control.

---

## The Technical Deep Dive

### 1. Terraform Fundamentals

```hcl
# main.tf — Provision a data platform on AWS

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  backend "s3" {
    bucket = "company-terraform-state"
    key    = "data-platform/terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = var.aws_region
}

# S3 Data Lake Bucket
resource "aws_s3_bucket" "data_lake" {
  bucket = "${var.project_name}-data-lake-${var.environment}"

  tags = {
    Team        = "data-engineering"
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "terraform"
  }
}

resource "aws_s3_bucket_versioning" "data_lake" {
  bucket = aws_s3_bucket.data_lake.id
  versioning_configuration { status = "Enabled" }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "data_lake" {
  bucket = aws_s3_bucket.data_lake.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "aws:kms"
    }
  }
}

# Redshift Serverless
resource "aws_redshiftserverless_namespace" "analytics" {
  namespace_name      = "${var.project_name}-analytics"
  db_name            = "analytics"
  admin_username     = "admin"
  admin_user_password = var.redshift_admin_password
}

resource "aws_redshiftserverless_workgroup" "analytics" {
  namespace_name = aws_redshiftserverless_namespace.analytics.namespace_name
  workgroup_name = "${var.project_name}-workgroup"
  base_capacity  = 32  # RPUs
}
```

Every configuration choice in the block above is deliberate, not default. `aws_s3_bucket_versioning` is enabled so that an accidental overwrite or delete of a raw data file doesn't mean permanent data loss — it pairs naturally with the lifecycle policies from Day 127, since older versions can themselves be transitioned to cheaper storage tiers or expired on a schedule rather than kept forever. Encryption uses `aws:kms` (SSE-KMS) instead of the simpler AWS-managed SSE-S3 because KMS gives you a customer-managed key: you control key rotation policy, can revoke access independently of S3 permissions, and get a CloudTrail audit log of every encrypt/decrypt call — important for any data lake holding data with compliance requirements. The Terraform `backend "s3"` block stores state remotely for durability (a laptop disk failure shouldn't mean losing the only record of what infrastructure exists) and so the whole team reads and writes the same state file; in practice you'd add a DynamoDB table for state locking so two people can't run `apply` at the same time and corrupt the state. Finally, `base_capacity = 32` RPUs for the Redshift Serverless workgroup is sized for a typical baseline analytics workload — enough concurrency for routine dashboard and ad hoc queries without paying for idle peak capacity — and Redshift Serverless auto-scales beyond that base when query demand spikes, so 32 is a starting point tuned by observed usage, not a hard ceiling.

### 2. CI/CD for Data Pipelines

```yaml
# .github/workflows/dbt_deploy.yml
# GitOps: merge to main → deploy dbt models

name: dbt Production Deploy
on:
  push:
    branches: [main]
    paths: ['dbt/**']

jobs:
  dbt-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install dbt
        run: pip install dbt-bigquery==1.7.*

      - name: dbt deps
        run: dbt deps
        working-directory: ./dbt

      - name: dbt build (run + test)
        run: dbt build --target prod --full-refresh false
        working-directory: ./dbt
        env:
          DBT_PROFILES_DIR: ./dbt
          BIGQUERY_KEYFILE: ${{ secrets.BIGQUERY_KEYFILE }}

      - name: dbt docs generate
        run: dbt docs generate
        working-directory: ./dbt

      - name: Notify on failure
        if: failure()
        uses: slackapi/slack-github-action@v1
        with:
          payload: '{"text":"❌ dbt deploy failed on main"}'
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

### 3. Self-Serve Data Platform

```python
# The platform engineering vision:
# Domain teams don't manage infrastructure — they use a catalog

platform_catalog = {
    "data_products": {
        "new_pipeline": {
            "what": "Spin up a new data pipeline",
            "how": "Fill out a form → platform provisions Airflow DAG, dbt project, S3 bucket",
            "includes": ["S3 bucket (tagged)", "Airflow DAG skeleton", "dbt project", "Monitoring dashboard"],
            "sla": "Ready in 30 minutes",
        },
        "new_database": {
            "what": "Provision a new analytics database/schema",
            "how": "Form submission → Terraform creates schema + access policies",
            "includes": ["Schema in Snowflake/BigQuery", "IAM role for the team", "dbt source config"],
        },
        "new_dashboard": {
            "what": "Request a new dashboard data source",
            "how": "Form → gold table spec → dbt model → Looker/Superset connection",
        },
    },
    "guardrails": {
        "cost_limits": "Each team has a monthly budget with alerts at 80%",
        "security": "All resources follow VPC, encryption, tagging standards",
        "quality": "All pipelines must have data quality checks (Soda/GE)",
    },
}
```

### 4. Environment Management

```hcl
# variables.tf — Environment-specific configuration
variable "environment" {
  type    = string
  default = "dev"
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod."
  }
}

# Environment sizing
locals {
  config = {
    dev = {
      redshift_capacity = 8
      s3_lifecycle_days = 30
      airflow_instance  = "t3.medium"
    }
    staging = {
      redshift_capacity = 16
      s3_lifecycle_days = 90
      airflow_instance  = "t3.large"
    }
    prod = {
      redshift_capacity = 64
      s3_lifecycle_days = 365
      airflow_instance  = "m5.xlarge"
    }
  }
  env = local.config[var.environment]
}
```

---

## Glossary

| Term | Definition |
| --- | --- |
| **IaC (Infrastructure as Code)** | Defining infrastructure (servers, networks, databases) in versioned code files instead of manual console actions, so it can be reviewed, tested, and reproduced. |
| **Terraform State** | The file Terraform uses to track the mapping between your code and the real cloud resources it manages — required so Terraform knows what already exists. |
| **`terraform plan` / `apply`** | `plan` previews changes as a dry run with no side effects; `apply` executes those changes against real infrastructure. |
| **HCL** | HashiCorp Configuration Language — the declarative syntax used to write Terraform resource definitions (`.tf` files). |
| **Provider** | A Terraform plugin (e.g., `hashicorp/aws`) that knows how to create, read, update, and delete resources for a specific platform. |
| **Resource** | A single infrastructure object managed by Terraform, such as `aws_s3_bucket` or `aws_redshiftserverless_workgroup`. |
| **Module** | A reusable, packaged set of Terraform resources that can be called with different inputs across environments or projects. |
| **GitOps** | Using the same Git PR review/merge workflow for infrastructure and pipeline changes as for application code — the repo state is the source of truth. |
| **Remote State Locking** | Using a shared backend (e.g., S3 + DynamoDB) to store Terraform state centrally and prevent two people from applying changes concurrently and corrupting it. |
| **Self-Serve Platform** | An internal catalog that lets domain teams provision their own infrastructure (pipelines, databases, dashboards) without filing tickets to a central team. |
| **Guardrail** | An automated constraint (cost limit, encryption requirement, quality check) built into a self-serve platform so teams move fast without bypassing standards. |

---

## Hands-on Lab

### Exercise 1: Terraform Data Infrastructure

```hcl
-- TODO: Write Terraform to provision:
-- 1. An S3 bucket with versioning, encryption, and lifecycle policy
-- 2. An IAM role for data engineers with S3 read/write + Redshift query
-- 3. A Redshift Serverless workgroup
-- 4. Budget alert at $500/month
-- All resources must have team/project/environment tags
```

```text
# EXPECTED RESULT — a representative `terraform plan` summary after writing
# the configuration above (exact counts depend on how resources are split,
# but this is the expected shape):
#
#   # aws_s3_bucket.data_lake will be created
#   # aws_s3_bucket_versioning.data_lake will be created
#   # aws_s3_bucket_server_side_encryption_configuration.data_lake will be created
#   # aws_s3_bucket_lifecycle_configuration.data_lake will be created
#   # aws_iam_role.data_engineer will be created
#   # aws_redshiftserverless_namespace.analytics will be created
#   # aws_redshiftserverless_workgroup.analytics will be created
#   # aws_budgets_budget.monthly_alert will be created
#
#   Plan: 8 to add, 0 to change, 0 to destroy.
#
# Use this as a sanity check: if your plan shows a wildly different resource
# count (e.g., only 3-4 resources), you likely combined the IAM role/policy
# into one resource or omitted the lifecycle/budget resources — go back and
# check the requirements list above.
```

### Exercise 2: CI/CD Pipeline Design

```yaml
# TODO: Design a GitHub Actions workflow that:
# 1. On PR: runs dbt compile + dbt test (dry run) + linting
# 2. On merge to main: deploys to staging and runs integration tests
# 3. On release tag: deploys to production with approval gate
# 4. On any failure: sends Slack notification
```

### Exercise 3: Platform Catalog

```python
# TODO: Design a self-serve platform catalog for a 50-person data org:
# 1. What services can domain teams request?
# 2. What guardrails prevent cost overruns?
# 3. What approval process is needed vs. fully self-serve?
# 4. How do you ensure security/compliance without slowing teams down?
```

---

## Mastery Check

**Q1**: What is Infrastructure as Code and why is clicking in the AWS console bad?
<details><summary>Answer</summary>
IaC defines infrastructure in version-controlled code files (Terraform, CloudFormation). Console clicks are bad because: (1) they're not reproducible — if the environment is lost, you can't rebuild it, (2) they can't be reviewed in PRs, (3) they can't be tested before deployment, (4) they create "snowflake" environments that drift from each other. IaC treats infrastructure like application code: versioned, reviewed, tested, and reproducible.
</details>

**Q2**: What is Terraform state and why is remote state critical?
<details><summary>Answer</summary>
Terraform state tracks the mapping between your code and real cloud resources. Without state, Terraform can't know what exists and would try to recreate everything. Remote state (S3 + DynamoDB lock) is critical because: (1) local state files can be lost, (2) team collaboration requires shared state, (3) state locking prevents two people from deploying simultaneously and corrupting infrastructure.
</details>

**Q3**: What is the difference between `terraform plan` and `terraform apply`?
<details><summary>Answer</summary>
`terraform plan` shows what would change without making any changes — it's a dry run. `terraform apply` actually creates/modifies/destroys resources. Always run `plan` first and review the output. In CI/CD, `plan` runs on PRs (for review) and `apply` runs only after merge with approval.
</details>

**Q4**: Why should data pipelines have staging environments?
<details><summary>Answer</summary>
Staging catches issues before they affect production data: schema changes that break dashboards, query performance regressions, and data quality issues. Without staging, every change is tested directly in production — a single bad deploy can corrupt reporting data, break downstream ML models, or cause incorrect business decisions.
</details>

**Q5**: What is platform engineering and how does it relate to data engineering?
<details><summary>Answer</summary>
Platform engineering builds internal infrastructure platforms so domain teams can self-serve — instead of filing tickets to get a database or pipeline set up. For data, this means a catalog where teams can spin up schemas, pipelines, and dashboards with guardrails (cost limits, security policies, quality requirements) built in. It shifts data engineers from "ticket takers" to "platform builders."
</details>

---

## Summary

- ✅ **IaC** (Terraform): Define all infrastructure in code — versioned, reviewed, reproducible
- ✅ **CI/CD**: Automate dbt/Airflow deploys — PR checks → staging → production with gates
- ✅ **Platform engineering**: Self-serve catalog for domain teams with built-in guardrails
- ✅ **Environments**: Dev → Staging → Prod with environment-specific sizing and configs
- ✅ **GitOps**: Infrastructure and pipeline changes go through the same PR review process

**Tomorrow → Day 137**: **Capstone — Cloud Data Pipeline** — build an end-to-end pipeline from ingestion to dashboard.
