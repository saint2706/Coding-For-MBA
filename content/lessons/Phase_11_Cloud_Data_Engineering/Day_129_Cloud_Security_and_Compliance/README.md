---
day: 129
title: "Cloud Security and Compliance — VPC, Encryption, PII"
phase: 11
phaseTitle: "Cloud Data Engineering"
slug: "cloud-security-compliance"
duration: 90
difficulty: "intermediate"
tags:
  - security
  - encryption
  - vpc
  - pii
  - compliance
  - gdpr
concepts:
  - "network security (VPC, subnets, security groups)"
  - "encryption at rest and in transit"
  - "PII detection and masking"
  - "compliance frameworks (GDPR, HIPAA, SOC 2)"
  - "secrets management"
prerequisites:
  - "Day 121: Cloud Fundamentals"
  - "Day 128: Data Contracts and Quality"
outcomes:
  - "Design a secure network architecture for data platforms"
  - "Implement encryption and PII handling strategies"
  - "Map compliance requirements to technical controls"
---

# 🔒 Day 129: Cloud Security and Compliance — VPC, Encryption, PII

> *"Security isn't a feature you add at the end — it's a constraint you design around from day one. The cost of a data breach is $4.88M average (IBM 2024). The cost of doing it right is a fraction of that."*

---

## The "Never-Coded" Bridge

**Think of cloud security like building security.** Your office building has: a perimeter fence (VPC), locked doors requiring badges (IAM), security cameras (audit logs), a safe for valuables (encryption), and rules about who can access which floors (network policies). Cloud security applies the same layers to data infrastructure.

The biggest risk isn't sophisticated attacks — it's misconfiguration. 82% of cloud breaches involve misconfigured storage buckets, overly permissive IAM policies, or unencrypted data. Today you learn to avoid all three.

---

## The Technical Deep Dive

### 1. Network Security — VPC Architecture

```python
# VPC (Virtual Private Cloud) — your isolated network in the cloud
vpc_architecture = {
    "vpc": {
        "cidr": "10.0.0.0/16",      # 65,536 IP addresses
        "subnets": {
            "public": {
                "cidr": "10.0.1.0/24",
                "purpose": "Load balancers, bastion hosts",
                "internet_access": True,
            },
            "private_app": {
                "cidr": "10.0.10.0/24",
                "purpose": "Airflow, dbt, application servers",
                "internet_access": "Via NAT Gateway only (outbound)",
            },
            "private_data": {
                "cidr": "10.0.20.0/24",
                "purpose": "Databases, Redshift, internal APIs",
                "internet_access": False,  # No internet access
            },
        },
        "security_groups": {
            "airflow_sg": {
                "inbound": [
                    {"port": 8080, "source": "10.0.1.0/24"},  # Web UI from public
                ],
                "outbound": [
                    {"port": 5432, "destination": "data_sg"},  # To database
                    {"port": 443, "destination": "0.0.0.0/0"}, # APIs
                ],
            },
            "data_sg": {
                "inbound": [
                    {"port": 5432, "source": "airflow_sg"},
                    {"port": 5439, "source": "airflow_sg"},  # Redshift
                ],
                "outbound": [],  # No outbound
            },
        },
    },
}
```

### 2. Encryption — At Rest and In Transit

```python
# Encryption: Two critical layers

encryption_strategy = {
    "at_rest": {
        "S3": "SSE-S3 (default) or SSE-KMS (customer-managed keys)",
        "RDS/Redshift": "AES-256 encryption enabled at creation",
        "EBS volumes": "Encrypted by default (enable in account settings)",
        "best_practice": "Use AWS KMS or GCP CMEK for key management with automatic rotation",
    },
    "in_transit": {
        "API calls": "TLS 1.2+ enforced (HTTPS only)",
        "Database connections": "SSL/TLS required (reject plaintext)",
        "S3 access": "Enforce ssl-only bucket policy",
        "VPC traffic": "VPC endpoints for AWS services (no internet traversal)",
    },
}

# S3 bucket policy: enforce encryption + SSL only
s3_secure_policy = {
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "DenyUnencryptedUploads",
            "Effect": "Deny",
            "Principal": "*",
            "Action": "s3:PutObject",
            "Resource": "arn:aws:s3:::company-data-lake/*",
            "Condition": {
                "StringNotEquals": {
                    "s3:x-amz-server-side-encryption": "aws:kms"
                }
            },
        },
        {
            "Sid": "DenyHTTP",
            "Effect": "Deny",
            "Principal": "*",
            "Action": "s3:*",
            "Resource": "arn:aws:s3:::company-data-lake/*",
            "Condition": {"Bool": {"aws:SecureTransport": "false"}},
        },
    ],
}
```

### 3. PII Detection and Handling

```python
# PII categories and handling strategies
pii_classification = {
    "direct_identifiers": {
        "examples": ["SSN", "passport number", "driver's license"],
        "handling": "Encrypt or tokenize. Never store in plain text.",
        "access": "Only authorized personnel with audit logging",
    },
    "quasi_identifiers": {
        "examples": ["name", "email", "phone", "address", "DOB"],
        "handling": "Mask, hash, or pseudonymize for analytics",
        "access": "Role-based with legitimate business need",
    },
    "sensitive_business": {
        "examples": ["salary", "medical records", "credit score"],
        "handling": "Encrypt at rest, mask in non-production environments",
        "access": "HR/Finance only, audit logged",
    },
}

# PII masking functions
import hashlib

def mask_email(email: str) -> str:
    """Mask email: john.doe@company.com → j***e@company.com"""
    local, domain = email.split("@")
    return f"{local[0]}***{local[-1]}@{domain}"

def hash_pii(value: str, salt: str = "company_secret") -> str:
    """One-way hash for analytics (can group by hashed value)."""
    return hashlib.sha256(f"{salt}:{value}".encode()).hexdigest()[:16]

def tokenize_ssn(ssn: str) -> str:
    """Show last 4 digits only: 123-45-6789 → ***-**-6789"""
    return f"***-**-{ssn[-4:]}"
```

### 4. Compliance Frameworks

```python
compliance_matrix = {
    "GDPR": {
        "scope": "EU personal data",
        "key_requirements": [
            "Right to erasure (must be able to delete user data)",
            "Data minimization (collect only what you need)",
            "Consent management (explicit opt-in)",
            "72-hour breach notification",
            "Data Protection Impact Assessment for high-risk processing",
        ],
        "technical_controls": [
            "PII tagging in Unity Catalog / data catalog",
            "Automated deletion pipelines for DSAR requests",
            "Encryption at rest and in transit",
            "Audit logging for all PII access",
        ],
    },
    "SOC_2_Type_II": {
        "scope": "Service organization controls",
        "key_requirements": [
            "Security: access controls, encryption, monitoring",
            "Availability: uptime SLAs, disaster recovery",
            "Confidentiality: data classification, encryption",
            "Processing integrity: data quality, validation",
            "Privacy: consent, notice, data lifecycle",
        ],
    },
    "HIPAA": {
        "scope": "US healthcare / Protected Health Information (PHI)",
        "key_requirements": [
            "PHI encryption mandatory (at rest and in transit)",
            "Minimum necessary rule (least privilege for PHI)",
            "Audit controls (all PHI access logged)",
            "Business Associate Agreements with cloud providers",
        ],
    },
}
```

### 5. Secrets Management

```python
# NEVER hardcode secrets in code — use secrets managers

# ❌ NEVER DO THIS
# db_password = "SuperSecret123!"

# ✅ AWS Secrets Manager
import boto3

def get_secret(secret_name: str) -> dict:
    """Retrieve secrets from AWS Secrets Manager."""
    client = boto3.client("secretsmanager")
    response = client.get_secret_value(SecretId=secret_name)
    return json.loads(response["SecretString"])

# ✅ Environment variables (for containers/CI)
import os
db_password = os.environ["DB_PASSWORD"]

# ✅ HashiCorp Vault (multi-cloud)
# vault kv get -field=password secret/data/production/database
```

---

## Hands-on Lab

### Exercise 1: VPC Security Design

```python
# TODO: Design a VPC architecture for a data platform with:
# - Airflow (needs internet for PyPI packages + internal DB access)
# - PostgreSQL metadata database (no internet access)
# - Redshift cluster (accessible from Airflow + BI tool on VPN)
# - S3 access (via VPC endpoint, no internet traversal)
# Draw the subnet layout and security group rules.
```

### Exercise 2: PII Handling Pipeline

```python
# TODO: Write a function that classifies columns as PII or non-PII,
# then applies appropriate masking:
# - email → mask_email()
# - phone → show last 4 digits
# - name → first initial + "***"
# - ssn → tokenize_ssn()
# - address → hash for analytics

def classify_and_mask(df, pii_config: dict):
    """Apply PII masking to a DataFrame based on column classification."""
    pass
```

### Exercise 3: GDPR Deletion Request

```python
# A user requests deletion under GDPR Article 17.
# TODO: Design a deletion pipeline that:
# 1. Finds all instances of user data across bronze/silver/gold tables
# 2. Deletes or anonymizes the data
# 3. Handles Delta Lake time travel (historical versions still contain PII)
# 4. Logs the deletion for compliance audit trail
# 5. Notifies downstream consumers
```

---

## Mastery Check

**Q1**: What is the difference between encryption at rest and in transit?
<details><summary>Answer</summary>
Encryption at rest protects stored data (S3 objects, database files on disk) — if a hard drive is stolen, the data is unreadable without the encryption key. Encryption in transit protects data moving between systems (API calls, database connections) — if network traffic is intercepted, it's encrypted. Both are required for compliance; neither alone is sufficient.
</details>

**Q2**: A public S3 bucket is discovered containing customer data. What immediate steps do you take?
<details><summary>Answer</summary>
1. Immediately remove public access (block public access at bucket level). 2. Check CloudTrail logs to see if the data was accessed by unauthorized parties. 3. Assess the data — what PII was exposed? How many records? 4. Notify the security team and legal (potential GDPR 72-hour notification requirement). 5. Implement preventive controls: S3 Block Public Access at the account level, SCPs to prevent future public buckets.
</details>

**Q3**: How do you handle GDPR "right to erasure" when using Delta Lake with time travel?
<details><summary>Answer</summary>
Delta Lake time travel means old versions still contain the deleted user's data. You must: (1) Delete/anonymize in the current table, (2) Run `VACUUM` with a retention of 0 days to remove old versions (careful: this is irreversible), (3) Document the deletion in your compliance audit trail. Alternative: use pseudonymization with a key mapping table — deleting the mapping effectively anonymizes all historical data.
</details>

**Q4**: What is a VPC endpoint and why should data platforms use them?
<details><summary>Answer</summary>
A VPC endpoint provides private connectivity to AWS services (S3, KMS, Secrets Manager) without traffic leaving the AWS network. Without it, requests to S3 from a private subnet go through a NAT Gateway and the public internet — adding latency, cost, and security risk. VPC endpoints are free (gateway type for S3/DynamoDB) and eliminate internet exposure.
</details>

**Q5**: Why should you never store secrets in code, environment variables in Docker images, or Git history?
<details><summary>Answer</summary>
Code repositories are shared, forked, and sometimes accidentally made public — any secret in Git history is permanently exposed. Docker images are stored in registries that may not be secured. Use dedicated secrets managers (AWS Secrets Manager, Vault, GCP Secret Manager) that provide encryption, rotation, access control, and audit logging. Even if a secret is removed from code, it persists in Git history unless the repo is rewritten.
</details>

---

## Summary

- ✅ **VPC**: Isolate data platforms in private subnets, use security groups as firewalls
- ✅ **Encryption**: At rest (KMS/CMEK) + in transit (TLS 1.2+) — enable both everywhere
- ✅ **PII**: Classify, mask, hash, or tokenize — never store in plain text in analytics tables
- ✅ **Compliance**: GDPR (erasure + consent), SOC 2 (controls audit), HIPAA (PHI encryption)
- ✅ **Secrets**: Never in code — use Secrets Manager, Vault, or KMS

**Tomorrow → Day 130**: **Cost Engineering** — optimizing cloud spend, query costs, and building a FinOps practice.
