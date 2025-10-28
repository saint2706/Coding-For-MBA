# Phase 4 Cheat Sheet — Advanced ML & MLOps (Days 55-67)

> Ship trustworthy, scalable AI systems. Phase 4 emphasises governance, automation, and emerging
> model families for strategic edge.

## Core Outcomes

- Deploy and monitor advanced models: transformers, generative AI, graph learning, reinforcement
  learning.
- Manage experimentation pipelines, CI/CD automation, and reproducible training infrastructure.
- Implement fairness, interpretability, and causal inference guardrails to satisfy executives and
  regulators.
- Build production-grade serving layers (batch + real-time) with observability and rollback
  strategies.
- Design monitoring plans that track model/data drift, performance decay, and ethical KPIs.

## Production-Ready Lifecycle

1. **Packaging** – Containerise models (`Dockerfile`, `requirements.txt`), freeze dependencies,
   capture artefacts.
1. **Automation** – Use CI/CD (GitHub Actions, Airflow, Prefect) to orchestrate training, testing,
   and deployment.
1. **Deployment** – Choose fit-for-purpose channels: REST APIs, streaming consumers, batch scoring
   jobs, or edge devices.
1. **Governance** – Maintain model cards, data lineage, and approval checklists. Integrate fairness
   & bias audits.
1. **Monitoring** – Track latency, throughput, accuracy, calibration, drift, and business KPIs.
   Trigger alerts and fallbacks.
1. **Feedback loop** – Capture human-in-the-loop labels, log predictions, and continuously retrain
   when thresholds are breached.

## Advanced Technique Highlights

| Topic | Use Case | Key Moves | |-------|----------|-----------| | Transformers | Text
summarisation, Q&A, document intelligence | Fine-tune with transfer learning; manage token budgets
and hallucination risk. | | Generative Models | Marketing copy, scenario simulation, data
augmentation | Guardrails: prompt templates, content filters, human review checkpoints. | | Graph
Learning | Customer networks, supply chain risk, fraud rings | Build graph features (centrality,
community), leverage GraphSAGE/GAT for inductive learning. | | Reinforcement Learning | Pricing
strategies, operations optimisation | Define reward shaping with business KPIs; run offline
evaluation before live testing. | | Causal Inference | Campaign uplift, treatment effect | Use
uplift models, doubly robust estimators, or causal forests; validate assumptions (ignorability,
overlap). |

## Risk & Compliance Checklist

- [ ] Maintain dataset documentation with provenance, consent, and refresh cadence.
- [ ] Run fairness metrics (demographic parity, equal opportunity) and mitigation strategies when
  gaps appear.
- [ ] Stress-test against adversarial or out-of-distribution samples; log anomalies.
- [ ] Establish rollback plans and SLA thresholds for each deployment pathway.
- [ ] Socialise a communication plan for incidents, including exec briefings and customer messaging.

## Business Wins to Target

- Automated marketing content assistant with human-in-the-loop approval queue.
- Graph-based lead scoring that identifies relationship clusters sales can activate.
- Real-time fraud or risk scoring pipeline with latency SLOs and adaptive retraining.
- Causal uplift model that guides personalised promotions and measures incremental lift.

## 30-Minute Refresh Sprint

1. **Ops drill (10 min):** Sketch the CI/CD stages for retraining and deploying a recommendation
   model.
1. **Monitoring (10 min):** Define metrics, alert thresholds, and dashboards for a production NLP
   service.
1. **Ethics brief (10 min):** Summarise fairness risks, governance controls, and escalation paths
   for executives.

______________________________________________________________________

🎯 **Graduation checkpoint:** You now have the assets to steward ML products from prototype to
long-term business impact.
