# Day 80 – BI Data Quality and Governance

Day 80 fills the roadmap gap on enterprise-grade data quality programmes and governance frameworks. We build pragmatic scorecards
covering the six classic data-quality dimensions while linking them to ethics, privacy, and regulatory obligations (GDPR/CCPA). The
lesson emphasises how these controls inform BI delivery—from dashboard reliability to stakeholder trust.

## Building Data-Quality Dashboards

1. **Profile reliability signals.** Track accuracy (variance vs source of truth), coherence (cross-system consistency),
   interpretability (metadata coverage), timeliness (pipeline latency), relevance (active usage), and accessibility (role-based
   coverage). The `build_data_quality_scorecard` helper converts these dimensions into a reusable checklist/metric template.
2. **Instrument operational datasets.** Use the sample orders dataset in `lesson.py` to compute dashboard-friendly metrics such as
   reconciliation accuracy, on-time delivery rates, and adoption ratios. The script demonstrates how to convert those metrics into
a concise dashboard table with status indicators against agreed thresholds.
3. **Close the loop with remediation.** Highlight exception owners, SLAs, and actions in the scorecard so remediation workstreams
   can be prioritised alongside product backlogs.

## Governance and Ethics Frameworks

1. **Map the roadmap.** `load_topic_groups` pulls the Business Intelligence roadmap nodes into two groups—data quality dimensions
   and governance & ethics—to ensure curriculum alignment.
2. **Codify control expectations.** `build_governance_scorecard` translates lineage, privacy, ethical use, bias recognition,
   mitigation strategies, and GDPR/CCPA requirements into a checklist with evidence artefacts for audits.
3. **Communicate the operating model.** The lesson script adds a governance highlights table summarising current control status,
   showing how BI teams can brief executives on stewardship, compliance, and mitigation programmes.

## How to Use This Lesson

- Run `lesson.py` to print the roadmap groupings, scorecard templates, calculated dashboard metrics, and governance status
  snapshot.
- Adapt the generated pandas DataFrames into your BI platform (Power BI, Tableau, Looker) by wiring the metrics to actual data
  pipelines and linking governance status back to your data catalogue or privacy management tool.
- Extend the checklists with your organisation’s specific controls—e.g., SOC2 evidence, ISO/IEC 27001 clauses, or additional
  fairness/bias diagnostics for machine-learning products.
