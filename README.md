# Coding for MBA

> **A comprehensive applied Python, analytics, machine learning, and database curriculum designed for business professionals.**

Transform your business acumen into technical capability with this comprehensive, hands-on curriculum. Each lesson is self-contained and builds toward end-to-end data fluency—from programming fundamentals to advanced ML operations and database mastery.

[![Python CI](https://github.com/saint2706/Coding-For-MBA/actions/workflows/ci.yml/badge.svg)](https://github.com/saint2706/Coding-For-MBA/actions/workflows/ci.yml)
[![Documentation](https://github.com/saint2706/Coding-For-MBA/actions/workflows/docs.yml/badge.svg)](https://saint2706.github.io/Coding-For-MBA/)

## 🚀 Quick Start

```bash
# Clone and setup
git clone https://github.com/saint2706/Coding-For-MBA.git
cd Coding-For-MBA
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

**Optional database dependencies:**

```bash
pip install mysql-connector-python psycopg2-binary pymongo
```

## 📖 Documentation

**[View the full documentation site →](https://saint2706.github.io/Coding-For-MBA/)**

The documentation includes interactive examples, detailed explanations, and downloadable materials for each lesson.

## 🗣️ Community & Support

- **[Join GitHub Discussions →](https://github.com/saint2706/Coding-For-MBA/discussions)** – Connect with peers, ask questions in the Help Desk, and showcase wins in Show and Tell.
- **[GitHub Discussions Playbook](docs/community/github-discussions.md)** – Learn how we organize categories, moderate conversations, and track learner engagement.
- **[Contribution Guidelines](CONTRIBUTING.md)** – Follow the external contributor workflow for proposing changes and submitting pull requests.

## 🗺️ Curriculum Overview

The curriculum is organized into seven progressive phases:

| Phase | Days | Focus |
|-------|------|-------|
| **[Phase 1](https://saint2706.github.io/Coding-For-MBA/phases/phase1/)** | 01-20 | Python foundations, data structures, file handling |
| **[Phase 2](https://saint2706.github.io/Coding-For-MBA/phases/phase2/)** | 21-39 | Data workflows, databases, APIs, statistics, visualization |
| **[Phase 3](https://saint2706.github.io/Coding-For-MBA/phases/phase3/)** | 40-54 | ML fundamentals, neural networks, NLP |
| **[Phase 4](https://saint2706.github.io/Coding-For-MBA/phases/phase4/)** | 55-67 | Advanced ML, MLOps, transformers, deployment |
| **[Phase 5](https://saint2706.github.io/Coding-For-MBA/phases/phase5/)** | 68-84 | Business Intelligence strategy, tooling, and career assets |
| **[Phase 6](https://saint2706.github.io/Coding-For-MBA/phases/phase6/)** | 85-90 | Advanced BI and capstone projects *(under development)* |
| **[Phase 7](https://saint2706.github.io/Coding-For-MBA/phases/phase7/)** | 91-108 | SQL & database mastery, design, optimization |

📘 **[See full curriculum roadmap →](docs/ml_curriculum.md)**
<br>
🧭 **[Explore all phases →](https://saint2706.github.io/Coding-For-MBA/phases/overview/)**

## 📄 Phase Cheat Sheets

Need the essentials at a glance? Download quick-reference guides for each phase of the journey: **[Phase Cheat Sheets](docs/cheatsheets/index.md)**.

Each cheat sheet highlights core outcomes, business wins, and refresh drills so you can reinforce skills between lessons or share them with your team.

## 💻 Working with Lessons

Each `Day_XX_*` folder contains:

- **README.md** - Lesson content and explanations
- **Python scripts (.py)** - Executable code examples
- **Jupyter notebooks (.ipynb)** - Interactive versions
- **Solutions (where applicable)** - Reference implementations

**Launch Jupyter for interactive learning:**

```bash
jupyter notebook
# Navigate to any Day_XX folder and open the .ipynb file
```

## 📚 All Lessons

Quick access to all 90 lessons:

| Day | Lesson |
| --- | --- |
| Day 01 | [📘 Day 1: Python for Business Analytics - First Steps](./docs/lessons/day-01-introduction.md) |
| Day 02 | [📘 Day 2: Storing and Analyzing Business Data](./docs/lessons/day-02-variables-builtin-functions.md) |
| Day 03 | [📘 Day 3: Operators - The Tools for Business Calculation and Logic](./docs/lessons/day-03-operators.md) |
| Day 04 | [📘 Day 4: Working with Text Data - Strings](./docs/lessons/day-04-strings.md) |
| Day 05 | [📘 Day 5: Managing Collections of Business Data with Lists](./docs/lessons/day-05-lists.md) |
| Day 06 | [📘 Day 6: Tuples - Storing Immutable Business Data](./docs/lessons/day-06-tuples.md) |
| Day 07 | [📘 Day 7: Sets - Managing Unique Business Data](./docs/lessons/day-07-sets.md) |
| Day 08 | [📘 Day 8: Dictionaries - Structuring Complex Business Data](./docs/lessons/day-08-dictionaries.md) |
| Day 09 | [📘 Day 9: Conditionals - Implementing Business Logic](./docs/lessons/day-09-conditionals.md) |
| Day 10 | [📘 Day 10: Loops - Automating Repetitive Business Tasks](./docs/lessons/day-10-loops.md) |
| Day 11 | [📘 Day 11: Functions - Creating Reusable Business Tools](./docs/lessons/day-11-functions.md) |
| Day 12 | [📘 Day 12: List Comprehension - Elegant Data Manipulation](./docs/lessons/day-12-list-comprehension.md) |
| Day 13 | [📘 Day 13: Higher-Order Functions & Lambda](./docs/lessons/day-13-higher-order-functions.md) |
| Day 14 | [📘 Day 14: Modules - Organizing Your Business Logic](./docs/lessons/day-14-modules.md) |
| Day 15 | [📘 Day 15: Exception Handling - Building Robust Business Logic](./docs/lessons/day-15-exception-handling.md) |
| Day 16 | [📘 Day 16: File Handling for Business Analytics](./docs/lessons/day-16-file-handling.md) |
| Day 17 | [📘 Day 17: Regular Expressions for Text Pattern Matching](./docs/lessons/day-17-regular-expressions.md) |
| Day 18 | [📘 Day 18: Classes and Objects - Modeling Business Concepts](./docs/lessons/day-18-classes-and-objects.md) |
| Day 19 | [📘 Day 19: Working with Dates and Times](./docs/lessons/day-19-python-date-time.md) |
| Day 20 | [📘 Day 20: Python Package Manager (pip) & Third-Party Libraries](./docs/lessons/day-20-python-package-manager.md) |
| Day 21 | [📘 Day 21: Virtual Environments - Professional Project Management](./docs/lessons/day-21-virtual-environments.md) |
| Day 22 | [📘 Day 22: NumPy - The Foundation of Numerical Computing](./docs/lessons/day-22-numpy.md) |
| Day 23 | [📘 Day 23: Pandas - Your Data Analysis Superpower](./docs/lessons/day-23-pandas.md) |
| Day 24 | [📘 Day 24: Advanced Pandas - Working with Real Data](./docs/lessons/day-24-pandas-advanced.md) |
| Day 25 | [📘 Day 25: Data Cleaning - The Most Important Skill in Analytics](./docs/lessons/day-25-data-cleaning.md) |
| Day 26 | [📘 Day 26: Practical Statistics for Business Analysis](./docs/lessons/day-26-statistics.md) |
| Day 27 | [📘 Day 27: Data Visualization - Communicating Insights](./docs/lessons/day-27-visualization.md) |
| Day 28 | [📘 Day 28: Advanced Visualization & Customization](./docs/lessons/day-28-advanced-visualization.md) |
| Day 29 | [📘 Day 29: Interactive Visualization with Plotly](./docs/lessons/day-29-interactive-visualization.md) |
| Day 30 | [📘 Day 30: Web Scraping - Extracting Data from the Web](./docs/lessons/day-30-web-scraping.md) |
| Day 31 | [📘 Day 31: Working with Databases in Python](./docs/lessons/day-31-databases.md) |
| Day 32 | [📘 Day 32: Connecting to Other Databases (MySQL & MongoDB)](./docs/lessons/day-32-other-databases.md) |
| Day 33 | [📘 Day 33: Accessing Web APIs with `requests`](./docs/lessons/day-33-api.md) |
| Day 34 | [📘 Day 34: Building a Simple API with Flask](./docs/lessons/day-34-building-an-api.md) |
| Day 35 | [🌐 Day 35: Flask Web Framework](./docs/lessons/day-35-flask-web-framework.md) |
| Day 36 | [📊 Day 36 – Capstone Case Study](./docs/lessons/day-36-case-study.md) |
| Day 37 | [🎉 Day 37: Conclusion & Your Journey Forward 🎉](./docs/lessons/day-37-conclusion.md) |
| Day 38 | [Day 38: Math Foundations - Linear Algebra](./docs/lessons/day-38-linear-algebra.md) |
| Day 39 | [Day 39: Math Foundations - Calculus](./docs/lessons/day-39-calculus.md) |
| Day 40 | [Day 40: Introduction to Machine Learning & Core Concepts](./docs/lessons/day-40-intro-to-ml.md) |
| Day 41 | [Day 41 · Supervised Learning – Regression](./docs/lessons/day-41-supervised-learning-regression.md) |
| Day 42 | [Day 42 · Supervised Learning – Classification (Part 1)](./docs/lessons/day-42-supervised-learning-classification-part-1.md) |
| Day 43 | [Day 43 · Supervised Learning – Classification (Part 2)](./docs/lessons/day-43-supervised-learning-classification-part-2.md) |
| Day 44 | [Day 44: Unsupervised Learning](./docs/lessons/day-44-unsupervised-learning.md) |
| Day 45 | [Day 45: Feature Engineering & Model Evaluation](./docs/lessons/day-45-feature-engineering-and-evaluation.md) |
| Day 46 | [Day 46: Introduction to Neural Networks & Frameworks](./docs/lessons/day-46-intro-to-neural-networks.md) |
| Day 47 | [Day 47: Convolutional Neural Networks (CNNs) for Computer Vision](./docs/lessons/day-47-convolutional-neural-networks.md) |
| Day 48 | [Day 48: Recurrent Neural Networks (RNNs) for Sequence Data](./docs/lessons/day-48-recurrent-neural-networks.md) |
| Day 49 | [Day 49: Natural Language Processing (NLP)](./docs/lessons/day-49-nlp.md) |
| Day 50 | [Day 50: MLOps - Model Deployment](./docs/lessons/day-50-mlops.md) |
| Day 51 | [Day 51 – Regularised Models](./docs/lessons/day-51-regularized-models.md) |
| Day 52 | [Day 52 – Ensemble Methods](./docs/lessons/day-52-ensemble-methods.md) |
| Day 53 | [Day 53 – Model Tuning and Feature Selection](./docs/lessons/day-53-model-tuning-and-feature-selection.md) |
| Day 54 | [Day 54 – Probabilistic Modeling](./docs/lessons/day-54-probabilistic-modeling.md) |
| Day 55 | [Day 55 – Advanced Unsupervised Learning](./docs/lessons/day-55-advanced-unsupervised-learning.md) |
| Day 56 | [Day 56 – Time Series and Forecasting](./docs/lessons/day-56-time-series-and-forecasting.md) |
| Day 57 | [Day 57 – Recommender Systems](./docs/lessons/day-57-recommender-systems.md) |
| Day 58 | [Day 58 – Transformers and Attention](./docs/lessons/day-58-transformers-and-attention.md) |
| Day 59 | [Day 59 – Generative Models](./docs/lessons/day-59-generative-models.md) |
| Day 60 | [Day 60 – Graph and Geometric Learning](./docs/lessons/day-60-graph-and-geometric-learning.md) |
| Day 61 | [Day 61 – Reinforcement and Offline Learning](./docs/lessons/day-61-reinforcement-and-offline-learning.md) |
| Day 62 | [Day 62 – Model Interpretability and Fairness](./docs/lessons/day-62-model-interpretability-and-fairness.md) |
| Day 63 | [Day 63 – Causal Inference and Uplift Modeling](./docs/lessons/day-63-causal-inference-and-uplift.md) |
| Day 64 | [Day 64 – Modern NLP Pipelines](./docs/lessons/day-64-modern-nlp-pipelines.md) |
| Day 65 | [Day 65 – MLOps Pipelines and CI/CD Automation](./docs/lessons/day-65-mlops-pipelines-and-ci.md) |
| Day 66 | [Day 66 – Model Deployment and Serving Patterns](./docs/lessons/day-66-model-deployment-and-serving.md) |
| Day 67 | [Day 67 – Model Monitoring and Reliability Engineering](./docs/lessons/day-67-model-monitoring-and-reliability.md) |
| Day 68 | [Day 68 – Business Intelligence Foundations](./docs/lessons/day-68-bi-analyst-foundations.md) |
| Day 69 | [Day 69 – BI Skill Stack & Professional Identity](./docs/lessons/day-69-bi-strategy-and-stakeholders.md) |
| Day 70 | [Day 70 – Understanding Data for BI](./docs/lessons/day-70-bi-metrics-and-data-literacy.md) |
| Day 71 | [Day 71 – Data Sources & Governance](./docs/lessons/day-71-bi-data-landscape.md) |
| Day 72 | [Day 72 – Data Architecture & Modeling](./docs/lessons/day-72-bi-data-formats-and-ingestion.md) |
| Day 73 | [Day 73 – ETL & Data Preparation](./docs/lessons/day-73-bi-sql-and-databases.md) |
| Day 74 | [Day 74 – Descriptive Analytics](./docs/lessons/day-74-bi-data-preparation-and-tools.md) |
| Day 75 | [Day 75 – Inferential Analytics](./docs/lessons/day-75-bi-visualization-and-dashboard-principles.md) |
| Day 76 | [Day 76 – Exploratory Diagnostics](./docs/lessons/day-76-bi-platforms-and-automation-tools.md) |
| Day 77 | [Day 77 – Experimentation & Predictive Foundations](./docs/lessons/day-77-bi-domain-analytics-and-value-drivers.md) |
| Day 78 | [Day 78 – Analytics Toolchain](./docs/lessons/day-78-bi-experimentation-and-predictive-insights.md) |
| Day 79 | [Day 79 – Self-Service Dashboards](./docs/lessons/day-79-bi-storytelling-and-stakeholder-influence.md) |
| Day 80 | [Day 80 – Visualization Strategy & Storytelling](./docs/lessons/day-80-bi-data-quality-and-governance.md) |
| Day 81 | [Day 81 – Operational BI Governance](./docs/lessons/day-81-bi-architecture-and-data-modeling.md) |
| Day 82 | [Day 82 – Industry Applications](./docs/lessons/day-82-bi-etl-and-pipeline-automation.md) |
| Day 83 | [Day 83 – Career Assets & Credentials](./docs/lessons/day-83-bi-cloud-and-modern-data-stack.md) |
| Day 84 | [Day 84 – Strategic Roadmapping & Next Steps](./docs/lessons/day-84-bi-career-development-and-capstone.md) |
| Day 85 | [Day 85 – Advanced SQL and Performance Tuning](./docs/lessons/day-85-advanced-sql.md) |
| Day 86 | [Day 86 – BI in the Cloud](./docs/lessons/day-86-bi-cloud.md) |
| Day 87 | [Day 87 – Data Governance and Security](./docs/lessons/day-87-data-governance.md) |
| Day 88 | [Day 88 – Capstone Project - Part 1](./docs/lessons/day-88-capstone-part-1.md) |
| Day 89 | [Day 89 – Capstone Project - Part 2](./docs/lessons/day-89-capstone-part-2.md) |
| Day 90 | [Day 90 – Career Workshop and Next Steps](./docs/lessons/day-90-career-workshop.md) |

## ⭐ Featured Lessons

Explore some of the standout lessons that demonstrate production-ready patterns:

- **[Day 50 – MLOps](docs/featured-lessons.md#day-50--mlops)** - Model training, saving, and deployment patterns
- **[Day 58 – Transformers](docs/featured-lessons.md#day-58--transformers-and-attention)** - Attention mechanisms and Hugging Face integration
- **[Day 60 – Graph Learning](docs/featured-lessons.md#day-60--graph-and-geometric-learning)** - GraphSAGE and attention message passing
- **[Day 36 – Case Study](docs/featured-lessons.md#day-36--capstone-case-study)** - End-to-end analytics workflow

📘 **[View all featured lessons →](docs/featured-lessons.md)**

## 🧪 Testing & Development

### Running Tests

```bash
pip install -r requirements-dev.txt
pytest
```

Tests cover 233+ scenarios across all lesson phases with 40%+ coverage requirements.

### Code Formatting

```bash
make format  # Auto-format Python, notebooks, and Markdown
make lint    # Check formatting without changes
```

📘 **[Full development guide →](docs/contributing.md)**

## 📁 Repository Structure

```
├── Day_01_Introduction → Day_67_Model_Monitoring_and_Reliability/
│   └── Self-contained lessons with READMEs, scripts, and notebooks
├── docs/          # Documentation, curriculum roadmaps, guides
├── tools/         # Build scripts for docs and notebooks
├── tests/         # 233+ automated tests
└── data/          # Sample datasets
```

## 🙌 Contributing

We welcome contributions that keep the curriculum practical and accessible!

- 🐛 **Report bugs** via GitHub Issues
- 💡 **Suggest improvements** through Pull Requests
- 📖 **Improve documentation** - every contribution helps

📘 **[Read the contributing guide →](docs/contributing.md)**

## 📄 License

This project is open source and available under the [LICENSE](LICENSE) file in this repository.

______________________________________________________________________

**Built with ❤️ for business professionals learning data science and ML**
