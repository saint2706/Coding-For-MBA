---
title: "Day 76 \u2013 BI Platforms and Automation Tools"
tags:
- BI
---
# Day 76 – BI Platforms and Automation Tools

Day 76 explores the major BI delivery platforms alongside the scripting and standardisation
practices that keep report refreshes trustworthy. We contrast Power BI, Tableau, Qlik, Looker, and
Excel with the Python/R automation surface that analysts lean on for orchestration.

## Roadmap groupings

| Section | Titles | | --- | --- | | BI platforms | Power BI, Tableau, Qlik, Looker, BI Platforms |
| Scripting & standards | Python, R, Standardisation, Excel |

## Platform comparison matrix

| Platform | Deployment | Export formats | Automation | Scripting hooks | Notes | | --- | --- | ---
| --- | --- | --- | | Power BI | Cloud & desktop | PBIX, PDF, PowerPoint, Excel, CSV | Power
Automate, REST API, Azure Data Factory | Python, R, DAX | Microsoft ecosystem integration with
strong scheduling via Power Automate and dataset refresh APIs. | | Tableau | Cloud & server | TWBX,
PDF, PowerPoint, Image, CSV | Tableau Prep, Tableau Server Client, REST API | Python, R, Tableau
Extensions | Flexible embedding with Tableau Server Client (TSC) for scripted publishes and
extracts. | | Qlik | Cloud & on-premises | QVF, PDF, Excel, CSV | Qlik Application Automation, REST
API | Python, R, Qlik Script | Associative engine excels at governed self-service and scripted
reload tasks. | | Looker | Cloud | Looks, PDF, Google Sheets, CSV | Looker API, Scheduled
Deliveries, Cloud Composer | Python, LookML, SQL | Model-driven semantic layer with strong API
orchestration via Python SDKs. | | Excel | Desktop & cloud | XLSX, CSV, PDF | Power Query, Office
Scripts, VBA | Python, R, VBA | Ubiquitous analysis surface; serves as bridge between BI exports and
finance modelling. |

## Python ↔ R interop for refresh automation

```python
import pathlib
import subprocess

DATA_EXPORT = pathlib.Path("exports/daily_metrics.csv")

# 1. Kick off the platform refresh via Python.
trigger_refresh()

# 2. Use R for statistical QA once the export lands.
subprocess.run(
    ["Rscript", "qa_checks.R", DATA_EXPORT.as_posix()],
    check=True,
)

# 3. Back in Python, notify the analytics channel once tests pass.
notify_slack(channel="#bi-ops", message="Daily metrics refreshed with QA ✅")
```

The snippet mirrors the helper utilities in `solutions.py`: schedule a refresh via Python, execute
R-based QA, and send downstream notifications after successfully validating exports.

## Additional Topic: Exploratory Diagnostics

> This lesson is part of the Phase 5 Business Intelligence specialization. Use the
> [Phase 5 overview](../docs/bi-curriculum.md) to see how the developer-roadmap topics align across
> Days 68–84.

## Why it matters

Reveal why metrics move using diagnostic analytics.

## Developer-roadmap alignment

- Exploratory Data Analysis (EDA)
- Correlation Analysis
- Cohort Analysis

## Next steps

- Draft case studies and notebooks that exercise these roadmap nodes.
- Update the Phase 5 cheat sheet with the insights you capture here.

<!-- LESSON_FOOTER_START -->

---

**Previous:** [Day 75 – Day 75 – BI Visualization and Dashboard Principles](../Day_75_BI_Visualization_and_Dashboard_Principles/README.md) • **Next:** [Day 77 – Day 77 – BI Domain Analytics and Value Drivers](../Day_77_BI_Domain_Analytics_and_Value_Drivers/README.md)

_You are on lesson 76 of 108._

<!-- LESSON_FOOTER_END -->