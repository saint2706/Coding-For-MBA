# Coding for MBA

> **A comprehensive applied Python, analytics, machine learning, and database curriculum designed
> for business professionals.**

Transform your business acumen into technical capability with this comprehensive, hands-on
curriculum. Each lesson is self-contained and builds toward end-to-end data fluency—from programming
fundamentals to advanced ML operations and database mastery.

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

The documentation includes interactive examples, detailed explanations, and downloadable materials
for each lesson.

### 🆕 New Documentation Features

Our enhanced documentation site now includes:

- **🔍 [Interactive Lessons Index](https://saint2706.github.io/Coding-For-MBA/lessons/index.html)** -
  Browse all 108 lessons with live search and tag filtering
- **📊 [Phase Overview Pages](https://saint2706.github.io/Coding-For-MBA/phases/phase_1_overview/)** -
  Detailed roadmaps for each of the 7 curriculum phases
- **🏷️ Tag-Based Navigation** - Filter lessons by topics like Python, ML, SQL, BI, Data, and more
- **📈 Progress Tracking** - Automatic progress indicators on lesson pages showing your journey
- **🌓 Dark Mode** - Toggle between light and dark themes for comfortable reading
- **📱 Mobile Responsive** - Full curriculum accessible on any device

**How to run the docs locally:**

```bash
# Install documentation dependencies
pip install -r docs/requirements-docs.txt

# Serve locally
mkdocs serve

# Visit http://127.0.0.1:8000
```

## 🎯 Platform Features

Beyond the curriculum, this repository includes a complete learning platform:

### 📊 Progress Tracking Dashboard

- **Track completion** across all 108 lessons
- **Earn badges** for completing each of the 7 phases
- **Monitor quiz scores** and learning streaks
- **Generate certificates** for phase completion
- **Privacy-first**: Cookie-only mode (no registration required) or optional GitHub OAuth

**Quick start:**

```bash
# Start the learner backend
cd learner_backend
python -m learner_backend.main

# Access dashboard at http://localhost:8000/static/dashboard.html
```

See [learner_backend/README.md](learner_backend/README.md) and [docs/dashboard/](docs/dashboard/) for details.

### 📝 Interactive Quizzes

- **Self-check quizzes** for key lessons
- **Instant feedback** with explanations
- **Progress tracking** integrated with dashboard
- **YAML-based** quiz format for easy contribution

Example: `quizzes/Day_02_quiz.yml`, `quizzes/Day_23_quiz.yml`

### 📚 Downloadable Resources

- **Full curriculum PDF** (all lessons combined)
- **Per-phase PDFs** (7 separate documents)
- **ZIP bundles** with markdown + notebooks per phase

Generate with:

```bash
python scripts/generate_pdfs.py --all
```

### 🏆 Gamification

- **SVG badges** for each phase completion
- **PDF certificates** with professional design
- **Streak tracking** to maintain motivation
- **Leaderboards** (optional, for group learning)

Generate certificates:

```bash
python scripts/generate_certificate.py --name "Your Name" --phase 1
```

### 🚀 Interactive Notebooks

- **Binder integration** for zero-install Jupyter notebooks
- **JupyterLite** support for browser-based notebooks
- **"Open in Binder" buttons** on lesson pages

### 🌍 Internationalization (i18n)

- **Multi-language support** (English + Spanish template)
- **Locale extraction tools** for translators
- **Language switcher** in documentation
- **Contribute translations** - see [docs/i18n.md](docs/i18n.md)

### 📊 Privacy-First Analytics (Optional)

- **Lesson popularity** tracking
- **Quiz performance** aggregation
- **Anonymous, opt-in** analytics
- **GDPR compliant** - see [docs/analytics.md](docs/analytics.md)

### 💼 Real-World Projects

- **One project per phase** with business scenarios
- **Sample datasets** and starter notebooks
- **Evaluation rubrics** for self-assessment
- **Progressive difficulty** from beginner to advanced

Explore: [projects/README.md](projects/README.md)

## 🏗️ Architecture

### Repository Structure

```
Coding-For-MBA/
├── Day_01_Introduction/       # Lessons (Day 01-108)
│   ├── README.md               # Lesson content
│   ├── *.py                    # Python scripts
│   └── *.ipynb                 # Jupyter notebooks
├── learner_backend/            # FastAPI progress tracking server
│   ├── main.py                 # API endpoints
│   ├── db.py                   # Database models
│   └── static/dashboard.html   # Progress dashboard UI
├── docs/                       # MkDocs documentation
│   ├── lessons/                # Generated lesson pages
│   ├── phases/                 # Phase overviews
│   ├── dashboard/              # Dashboard docs
│   ├── analytics.md            # Analytics guide
│   └── i18n.md                 # Translation guide
├── scripts/                    # Automation scripts
│   ├── generate_pdfs.py        # PDF generation
│   ├── generate_badge.py       # Badge creation
│   ├── generate_certificate.py # Certificate generation
│   ├── generate_quiz_pages.py  # Quiz HTML generation
│   ├── add_binder_buttons.py   # Binder integration
│   └── extract_i18n.py         # i18n extraction
├── analytics/                  # Analytics system
│   ├── logger.js               # Client-side event tracker
│   └── report.py               # Report generator
├── quizzes/                    # Quiz YAML files
├── projects/                   # Real-world projects
│   ├── phase_1/                # Projects by phase
│   └── README.md               # Projects index
├── artifacts/                  # Generated PDFs & bundles
├── generated/badges/           # Generated SVG badges
├── locales/                    # i18n translations
└── .github/workflows/          # CI/CD pipelines
    ├── docs-ci.yml             # Docs build & deploy
    └── deploy-certs.yml        # PDF/bundle releases
```

### Technology Stack

**Core Curriculum:**

- Python 3.13
- Jupyter Notebooks
- NumPy, Pandas, scikit-learn
- TensorFlow, Matplotlib, Plotly

**Platform Components:**

- **Documentation**: MkDocs with Material theme
- **Progress Tracking**: FastAPI + SQLite
- **PDF Generation**: WeasyPrint + markdown2
- **Notebooks**: Binder + JupyterLite
- **CI/CD**: GitHub Actions
- **Analytics**: Privacy-first JavaScript logger

### Local Development

1. **Setup environment:**

   ```bash
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt -r requirements-dev.txt
   ```

1. **Run documentation locally:**

   ```bash
   mkdocs serve
   ```

1. **Start learner backend:**

   ```bash
   python -m learner_backend.main
   ```

1. **Generate resources:**

   ```bash
   # PDFs and bundles
   python scripts/generate_pdfs.py --all

   # Badges
   python scripts/generate_badge.py --all

   # Quiz pages
   python scripts/generate_quiz_pages.py --all
   ```

1. **Run tests:**

   ```bash
   pytest
   ```

1. **Format code:**

   ```bash
   make format
   ```

### Deployment Options

**Documentation (GitHub Pages):**

- Automatic deployment via `.github/workflows/docs-ci.yml`
- Triggered on push to `main` branch
- Site: https://saint2706.github.io/Coding-For-MBA/

**Learner Backend:**

- **Local**: `python -m learner_backend.main`
- **Heroku**: See [learner_backend/README.md](learner_backend/README.md)
- **Fly.io**: `fly launch && fly deploy`
- **Render**: One-click deploy from dashboard
- **Docker**: Dockerfile included

**PDF Distribution:**

- Generated on releases via `.github/workflows/deploy-certs.yml`
- Attached to GitHub releases as assets
- Manual generation: `python scripts/generate_pdfs.py --all`

## 🗣️ Community & Support

- **[Join GitHub Discussions →](https://github.com/saint2706/Coding-For-MBA/discussions)** – Connect
  with peers, ask questions in the Help Desk, and showcase wins in Show and Tell.
- **[GitHub Discussions Playbook](docs/community/github-discussions.md)** – Learn how we organize
  categories, moderate conversations, and track learner engagement.
- **[Contribution Guidelines](CONTRIBUTING.md)** – Follow the external contributor workflow for
  proposing changes and submitting pull requests.

## 🗺️ Curriculum Overview

The curriculum is organized into seven progressive phases:

| Phase | Days | Focus | |-------|------|-------| |
**[Phase 1](https://saint2706.github.io/Coding-For-MBA/phases/phase1/)** | 01-20 | Python
foundations, data structures, file handling | |
**[Phase 2](https://saint2706.github.io/Coding-For-MBA/phases/phase2/)** | 21-39 | Data workflows,
databases, APIs, statistics, visualization | |
**[Phase 3](https://saint2706.github.io/Coding-For-MBA/phases/phase3/)** | 40-54 | ML fundamentals,
neural networks, NLP | | **[Phase 4](https://saint2706.github.io/Coding-For-MBA/phases/phase4/)** |
55-67 | Advanced ML, MLOps, transformers, deployment | |
**[Phase 5](https://saint2706.github.io/Coding-For-MBA/phases/phase5/)** | 68-84 | Business
Intelligence strategy, tooling, and career assets | |
**[Phase 6](https://saint2706.github.io/Coding-For-MBA/phases/phase6/)** | 85-90 | Advanced SQL,
cloud BI, governance, and capstone project | |
**[Phase 7](https://saint2706.github.io/Coding-For-MBA/phases/phase7/)** | 91-108 | SQL & database
mastery, design, optimization |

📘 **[See full curriculum roadmap →](docs/ml_curriculum.md)** <br> 🧭
**[Explore all phases →](https://saint2706.github.io/Coding-For-MBA/phases/overview/)**

## 📄 Phase Cheat Sheets

Need the essentials at a glance? Download quick-reference guides for each phase of the journey:
**[Phase Cheat Sheets](docs/cheatsheets/index.md)**.

Each cheat sheet highlights core outcomes, business wins, and refresh drills so you can reinforce
skills between lessons or share them with your team.

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

Quick access to all 108 lessons:

<!-- AUTO_ALL_LESSONS_START -->

- [Day 01 – Day 1: Python for Business Analytics - First Steps](./Day_01_Introduction/README.md)
- [Day 02 – Day 2: Storing and Analyzing Business Data](./Day_02_Variables_Builtin_Functions/README.md)
- [Day 03 – Day 3: Operators - The Tools for Business Calculation and Logic](./Day_03_Operators/README.md)
- [Day 04 – Day 4: Working with Text Data - Strings](./Day_04_Strings/README.md)
- [Day 05 – Day 5: Managing Collections of Business Data with Lists](./Day_05_Lists/README.md)
- [Day 06 – Day 6: Tuples - Storing Immutable Business Data](./Day_06_Tuples/README.md)
- [Day 07 – Day 7: Sets - Managing Unique Business Data](./Day_07_Sets/README.md)
- [Day 08 – Day 8: Dictionaries - Structuring Complex Business Data](./Day_08_Dictionaries/README.md)
- [Day 09 – Day 9: Conditionals - Implementing Business Logic](./Day_09_Conditionals/README.md)
- [Day 10 – Day 10: Loops - Automating Repetitive Business Tasks](./Day_10_Loops/README.md)
- [Day 11 – Day 11: Functions - Creating Reusable Business Tools](./Day_11_Functions/README.md)
- [Day 12 – Day 12: List Comprehension - Elegant Data Manipulation](./Day_12_List_Comprehension/README.md)
- [Day 13 – Day 13: Higher-Order Functions & Lambda](./Day_13_Higher_Order_Functions/README.md)
- [Day 14 – Day 14: Modules - Organizing Your Business Logic](./Day_14_Modules/README.md)
- [Day 15 – Day 15: Exception Handling - Building Robust Business Logic](./Day_15_Exception_Handling/README.md)
- [Day 16 – Day 16: File Handling for Business Analytics](./Day_16_File_Handling/README.md)
- [Day 17 – Day 17: Regular Expressions for Text Pattern Matching](./Day_17_Regular_Expressions/README.md)
- [Day 18 – Day 18: Classes and Objects - Modeling Business Concepts](./Day_18_Classes_and_Objects/README.md)
- [Day 19 – Day 19: Working with Dates and Times](./Day_19_Python_Date_Time/README.md)
- [Day 20 – Day 20: Python Package Manager (pip) & Third-Party Libraries](./Day_20_Python_Package_Manager/README.md)
- [Day 21 – Day 21: Virtual Environments - Professional Project Management](./Day_21_Virtual_Environments/README.md)
- [Day 22 – Day 22: NumPy - The Foundation of Numerical Computing](./Day_22_NumPy/README.md)
- [Day 23 – Day 23: Pandas - Your Data Analysis Superpower](./Day_23_Pandas/README.md)
- [Day 24 – Day 24: Advanced Pandas - Working with Real Data](./Day_24_Pandas_Advanced/README.md)
- [Day 25 – Day 25: Data Cleaning - The Most Important Skill in Analytics](./Day_25_Data_Cleaning/README.md)
- [Day 26 – Day 26: Practical Statistics for Business Analysis](./Day_26_Statistics/README.md)
- [Day 27 – Day 27: Data Visualization - Communicating Insights](./Day_27_Visualization/README.md)
- [Day 28 – Day 28: Advanced Visualization & Customization](./Day_28_Advanced_Visualization/README.md)
- [Day 29 – Day 29: Interactive Visualization with Plotly](./Day_29_Interactive_Visualization/README.md)
- [Day 30 – Day 30: Web Scraping - Extracting Data from the Web](./Day_30_Web_Scraping/README.md)
- [Day 31 – Day 31: Working with Databases in Python](./Day_31_Databases/README.md)
- [Day 32 – Day 32: Connecting to Other Databases (MySQL & MongoDB)](./Day_32_Other_Databases/README.md)
- [Day 33 – Day 33: Accessing Web APIs with `requests`](./Day_33_API/README.md)
- [Day 34 – Day 34: Building a Simple API with Flask](./Day_34_Building_an_API/README.md)
- [Day 35 – Day 35: Flask Web Framework](./Day_35_Flask_Web_Framework/README.md)
- [Day 36 – Day 36 – Capstone Case Study](./Day_36_Case_Study/README.md)
- [Day 37 – Day 37: Conclusion & Your Journey Forward](./Day_37_Conclusion/README.md)
- [Day 38 – Day 38: Math Foundations - Linear Algebra](./Day_38_Linear_Algebra/README.md)
- [Day 39 – Day 39: Math Foundations - Calculus](./Day_39_Calculus/README.md)
- [Day 40 – Day 40: Introduction to Machine Learning & Core Concepts](./Day_40_Intro_to_ML/README.md)
- [Day 41 – Day 41 · Supervised Learning – Regression](./Day_41_Supervised_Learning_Regression/README.md)
- [Day 42 – Day 42 · Supervised Learning – Classification (Part 1)](./Day_42_Supervised_Learning_Classification_Part_1/README.md)
- [Day 43 – Day 43 · Supervised Learning – Classification (Part 2)](./Day_43_Supervised_Learning_Classification_Part_2/README.md)
- [Day 44 – Day 44: Unsupervised Learning](./Day_44_Unsupervised_Learning/README.md)
- [Day 45 – Day 45: Feature Engineering & Model Evaluation](./Day_45_Feature_Engineering_and_Evaluation/README.md)
- [Day 46 – Day 46: Introduction to Neural Networks & Frameworks](./Day_46_Intro_to_Neural_Networks/README.md)
- [Day 47 – Day 47: Convolutional Neural Networks (CNNs) for Computer Vision](./Day_47_Convolutional_Neural_Networks/README.md)
- [Day 48 – Day 48: Recurrent Neural Networks (RNNs) for Sequence Data](./Day_48_Recurrent_Neural_Networks/README.md)
- [Day 49 – Day 49: Natural Language Processing (NLP)](./Day_49_NLP/README.md)
- [Day 50 – Day 50: MLOps - Model Deployment](./Day_50_MLOps/README.md)
- [Day 51 – Day 51 – Regularised Models](./Day_51_Regularized_Models/README.md)
- [Day 52 – Day 52 – Ensemble Methods](./Day_52_Ensemble_Methods/README.md)
- [Day 53 – Day 53 – Model Tuning and Feature Selection](./Day_53_Model_Tuning_and_Feature_Selection/README.md)
- [Day 54 – Day 54 – Probabilistic Modeling](./Day_54_Probabilistic_Modeling/README.md)
- [Day 55 – Day 55 – Advanced Unsupervised Learning](./Day_55_Advanced_Unsupervised_Learning/README.md)
- [Day 56 – Day 56 – Time Series and Forecasting](./Day_56_Time_Series_and_Forecasting/README.md)
- [Day 57 – Day 57 – Recommender Systems](./Day_57_Recommender_Systems/README.md)
- [Day 58 – Day 58 – Transformers and Attention](./Day_58_Transformers_and_Attention/README.md)
- [Day 59 – Day 59 – Generative Models](./Day_59_Generative_Models/README.md)
- [Day 60 – Day 60 – Graph and Geometric Learning](./Day_60_Graph_and_Geometric_Learning/README.md)
- [Day 61 – Day 61 – Reinforcement and Offline Learning](./Day_61_Reinforcement_and_Offline_Learning/README.md)
- [Day 62 – Day 62 – Model Interpretability and Fairness](./Day_62_Model_Interpretability_and_Fairness/README.md)
- [Day 63 – Day 63 – Causal Inference and Uplift Modeling](./Day_63_Causal_Inference_and_Uplift/README.md)
- [Day 64 – Day 64 – Modern NLP Pipelines](./Day_64_Modern_NLP_Pipelines/README.md)
- [Day 65 – Day 65 – MLOps Pipelines and CI/CD Automation](./Day_65_MLOps_Pipelines_and_CI/README.md)
- [Day 66 – Day 66 – Model Deployment and Serving Patterns](./Day_66_Model_Deployment_and_Serving/README.md)
- [Day 67 – Day 67 – Model Monitoring and Reliability Engineering](./Day_67_Model_Monitoring_and_Reliability/README.md)
- [Day 68 – Day 68 – BI Analyst Foundations](./Day_68_BI_Analyst_Foundations/README.md)
- [Day 69 – Day 69 – BI Strategy and Stakeholders](./Day_69_BI_Strategy_and_Stakeholders/README.md)
- [Day 70 – Day 70 – BI Metrics and Data Literacy](./Day_70_BI_Metrics_and_Data_Literacy/README.md)
- [Day 71 – Day 71 – BI Data Landscape Fundamentals](./Day_71_BI_Data_Landscape/README.md)
- [Day 72 – Day 72 – BI Data Formats and Ingestion](./Day_72_BI_Data_Formats_and_Ingestion/README.md)
- [Day 73 – Day 73 – BI SQL and Databases](./Day_73_BI_SQL_and_Databases/README.md)
- [Day 74 – Day 74 – BI Data Preparation and Tools](./Day_74_BI_Data_Preparation_and_Tools/README.md)
- [Day 75 – Day 75 – BI Visualization and Dashboard Principles](./Day_75_BI_Visualization_and_Dashboard_Principles/README.md)
- [Day 76 – Day 76 – BI Platforms and Automation Tools](./Day_76_BI_Platforms_and_Automation_Tools/README.md)
- [Day 77 – Day 77 – BI Domain Analytics and Value Drivers](./Day_77_BI_Domain_Analytics_and_Value_Drivers/README.md)
- [Day 78 – Day 78 – BI Experimentation and Predictive Insights](./Day_78_BI_Experimentation_and_Predictive_Insights/README.md)
- [Day 79 – Day 79 – BI Storytelling and Stakeholder Influence](./Day_79_BI_Storytelling_and_Stakeholder_Influence/README.md)
- [Day 80 – Day 80 – BI Data Quality and Governance](./Day_80_BI_Data_Quality_and_Governance/README.md)
- [Day 81 – Day 81 – BI Architecture and Data Modeling](./Day_81_BI_Architecture_and_Data_Modeling/README.md)
- [Day 82 – Day 82 – BI ETL and Pipeline Automation](./Day_82_BI_ETL_and_Pipeline_Automation/README.md)
- [Day 83 – Day 83 – BI Cloud and Modern Data Stack](./Day_83_BI_Cloud_and_Modern_Data_Stack/README.md)
- [Day 84 – Day 84 – BI Career Development and Capstone](./Day_84_BI_Career_Development_and_Capstone/README.md)
- [Day 85 – Day 85 – Advanced SQL and Performance Tuning](./Day_85_Advanced_SQL/README.md)
- [Day 86 – Day 86 – BI in the Cloud](./Day_86_BI_Cloud/README.md)
- [Day 87 – Day 87 – Data Governance and Security](./Day_87_Data_Governance/README.md)
- [Day 88 – Day 88 – Capstone Project - Part 1](./Day_88_Capstone_Part_1/README.md)
- [Day 89 – Day 89 – Capstone Project - Part 2](./Day_89_Capstone_Part_2/README.md)
- [Day 90 – Day 90 – Career Workshop and Next Steps](./Day_90_Career_Workshop/README.md)
- [Day 91 – Day 91: Relational Databases](./Day_91_Relational_Databases/README.md)
- [Day 92 – Day 92: Data Definition Language (DDL)](./Day_92_Data_Definition_Language/README.md)
- [Day 93 – Day 93: Data Manipulation Language (DML)](./Day_93_Data_Manipulation_Language/README.md)
- [Day 94 – Day 94: Data Query Language (DQL)](./Day_94_Data_Query_Language/README.md)
- [Day 95 – Day 95: Joins](./Day_95_Joins/README.md)
- [Day 96 – Day 96: Subqueries](./Day_96_Subqueries/README.md)
- [Day 97 – Day 97: Views](./Day_97_Views/README.md)
- [Day 98 – Day 98: Indexes](./Day_98_Indexes/README.md)
- [Day 99 – Day 99: Transactions](./Day_99_Transactions/README.md)
- [Day 100 – Day 100: Stored Procedures](./Day_100_Stored_Procedures/README.md)
- [Day 101 – Day 101: Triggers](./Day_101_Triggers/README.md)
- [Day 102 – Day 102: Common Table Expressions (CTEs)](./Day_102_Common_Table_Expressions/README.md)
- [Day 103 – Day 103: Pivoting Data](./Day_103_Pivoting_Data/README.md)
- [Day 104 – Day 104: Database Design and Normalization](./Day_104_Database_Design_and_Normalization/README.md)
- [Day 105 – Day 105: JSON in SQL](./Day_105_JSON_in_SQL/README.md)
- [Day 106 – Day 106: XML in SQL](./Day_106_XML_in_SQL/README.md)
- [Day 107 – Day 107: SQL Security](./Day_107_Security/README.md)
- [Day 108 – Day 108: SQL Performance Tuning](./Day_108_Performance_Tuning/README.md)

<!-- AUTO_ALL_LESSONS_END -->

_The complete list is auto-generated. See [generated/all_lessons.md](./generated/all_lessons.md) for the full list._

## ⭐ Featured Lessons

Explore some of the standout lessons that demonstrate production-ready patterns:

- **[Day 50 – MLOps](docs/featured-lessons.md#day-50--mlops)** - Model training, saving, and
  deployment patterns
- **[Day 58 – Transformers](docs/featured-lessons.md#day-58--transformers-and-attention)** -
  Attention mechanisms and Hugging Face integration
- **[Day 60 – Graph Learning](docs/featured-lessons.md#day-60--graph-and-geometric-learning)** -
  GraphSAGE and attention message passing
- **[Day 36 – Case Study](docs/featured-lessons.md#day-36--capstone-case-study)** - End-to-end
  analytics workflow

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

### Documentation Scripts

The repository includes automated scripts for maintaining documentation:

```bash
# Generate phase overview pages
python scripts/gen_phase_overviews.py --apply

# Add tags to lesson READMEs
python scripts/add_tags.py --apply

# Create interactive lessons index
python scripts/gen_lessons_index.py --apply

# Update navigation structure
python scripts/gen_nav.py --apply

# Revert changes if needed
python scripts/revert_nav_changes.py --apply
```

📘 **[Script documentation →](scripts/README.md)** | **[Full development guide →](docs/contributing.md)**

## 📁 Repository Structure

```
├── Day_01_Introduction → Day_108_Performance_Tuning/
│   └── Self-contained lessons with READMEs, scripts, and notebooks
├── docs/          # Documentation, curriculum roadmaps, guides
├── scripts/       # Automation scripts for lesson management
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
