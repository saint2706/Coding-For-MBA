---
day: 20
title: "Python Package Manager"
phase: 2
phaseTitle: "Functions, Modularity & Data Wrangling"
slug: "python-package-manager"
duration: 35
difficulty: "beginner"
tags:
  - python
  - pip
  - packages
  - dependencies
concepts:
  - "pip install"
  - "requirements.txt"
  - "package versions"
  - "PyPI"
prerequisites: [14]
outcomes:
  - "Install packages with pip"
  - "Manage dependencies with requirements.txt"
  - "Understand semantic versioning"
---

# 🎯 Day 20: Python Package Manager

> *"Don't reinvent the wheel—install it."*

---

## The "Never-Coded" Bridge

**Would you build every tool from scratch?**

When you need to send emails, you don't build an email server. When you need data analysis, you don't write matrix math from scratch.

The Python ecosystem has over 400,000 packages on PyPI (Python Package Index). Whatever you need—web scraping, machine learning, PDF generation—someone has built it:

```bash
pip install pandas        # Data analysis
pip install requests      # HTTP requests
pip install flask         # Web framework
pip install scikit-learn  # Machine learning
```

---

## The Technical Deep Dive

### Installing Packages

```bash
# Basic install
pip install requests

# Install specific version
pip install requests==2.28.0

# Install minimum version
pip install requests>=2.28.0

# Install from requirements file
pip install -r requirements.txt

# Upgrade package
pip install --upgrade requests

# Uninstall
pip uninstall requests
```

### Viewing Installed Packages

```bash
# List all installed
pip list

# Show package details
pip show pandas

# Check for outdated
pip list --outdated

# Generate requirements
pip freeze > requirements.txt
```

### requirements.txt

```text
# requirements.txt
requests==2.28.0
pandas>=1.5.0
numpy>=1.23,<2.0
flask~=2.2.0
python-dateutil
```

**Version specifiers:**

- `==2.28.0` — Exactly this version
- `>=2.28.0` — This version or newer
- `>=2.28,<3.0` — Range of versions
- `~=2.2.0` — Compatible release (2.2.x)
- No version — Latest available

### Semantic Versioning

Packages use `MAJOR.MINOR.PATCH`:

- **MAJOR**: Breaking changes (incompatible API)
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes only

```
2.28.1
│ │ └── Patch: bug fix
│ └──── Minor: new feature
└────── Major: breaking change
```

### Common Commands

| Command                  | Purpose                  |
| ------------------------ | ------------------------ |
| `pip install pkg`        | Install package          |
| `pip install pkg==1.0`   | Install specific version |
| `pip install -r req.txt` | Install from file        |
| `pip uninstall pkg`      | Remove package           |
| `pip list`               | Show installed           |
| `pip freeze`             | Export with versions     |
| `pip show pkg`           | Package details          |
| `pip search term`        | Search PyPI              |

---

## Senior-Level Insights

### Pin Your Dependencies

```bash
# Development: use pip freeze
pip freeze > requirements.txt

# Production: be explicit about versions
# requirements.txt
Django==4.2.1
psycopg2-binary==2.9.6
celery==5.3.0
```

### Development vs Production Dependencies

```text
# requirements.txt (production)
Django==4.2.1
gunicorn==21.2.0

# requirements-dev.txt (development)
-r requirements.txt
pytest==7.3.1
black==23.3.0
mypy==1.3.0
```

```bash
# In development
pip install -r requirements-dev.txt

# In production
pip install -r requirements.txt
```

### Check for Security Vulnerabilities

```bash
# Use safety to check for known vulnerabilities
pip install safety
safety check

# Or use pip-audit
pip install pip-audit
pip-audit
```

### Private Package Registries

```bash
# Install from private index
pip install --index-url https://private.registry.com/simple/ mypackage

# Or configure in pip.conf
```

---

## Hands-on Lab

### Exercise 1: Project Setup

```bash
# 1. Create project directory
mkdir my_project
cd my_project

# 2. Install core packages
pip install requests pandas matplotlib

# 3. Save requirements
pip freeze > requirements.txt

# 4. View what's installed
cat requirements.txt
```

**Expected Output (example — actual versions may differ):**
```
# Contents of requirements.txt will look like:
matplotlib==3.8.2
numpy==1.26.3
pandas==2.1.4
# ... (all installed packages with pinned versions)
```

### Exercise 2: Version Management

```python
# version_check.py
import pkg_resources

packages = ["numpy", "pandas", "requests"]

print("Installed Package Versions:")
print("-" * 40)
for pkg in packages:
    try:
        version = pkg_resources.get_distribution(pkg).version
        print(f"{pkg:20} {version}")
    except pkg_resources.DistributionNotFound:
        print(f"{pkg:20} NOT INSTALLED")
```

**Expected Output (versions vary by environment):**
```
Installed Package Versions:
----------------------------------------
numpy                1.26.3
pandas               2.1.4
requests             2.31.0
```

### Exercise 3: Requirements File

```text
# requirements.txt for a data science project

# Core data processing
numpy>=1.23.0
pandas>=1.5.0

# Visualization
matplotlib>=3.6.0
seaborn>=0.12.0

# Machine learning
scikit-learn>=1.2.0

# Utilities
python-dateutil>=2.8.0
tqdm>=4.64.0

# Development only (comment out for production)
# jupyter>=1.0.0
# pytest>=7.0.0
```

**Note:** This file is used as input to `pip install -r requirements.txt`. There is no program output — pip will download and install each listed package.

---

## Mastery Check

### Question 1: Version Specifier

What does `pandas>=1.5,<2.0` mean?

<details>
<summary>Click for Answer</summary>

Install any version of pandas that is:

- At least 1.5 (1.5.0 or higher)
- Less than 2.0 (not 2.0.0 or higher)

This allows 1.5.0, 1.5.3, 1.9.9, but not 2.0.0.

</details>

---

### Question 2: Freeze Purpose

Why use `pip freeze > requirements.txt`?

<details>
<summary>Click for Answer</summary>

To capture exact versions of all installed packages for reproducibility. This ensures:

- Same environment on other machines
- Consistent deployments
- Debugging with known versions

</details>

---

### Question 3: Upgrade Package

How do you upgrade a package to the latest version?

<details>
<summary>Click for Answer</summary>

```bash
pip install --upgrade package_name
# or
pip install -U package_name
```

</details>

---

### Question 4: Show Details

How do you see where a package is installed and its dependencies?

<details>
<summary>Click for Answer</summary>

```bash
pip show package_name
```

This shows location, version, dependencies, and more.

</details>

---

### Question 5: Design Scenario

**Scenario**: You're setting up a new project that needs:

- Web scraping
- Data processing
- Report generation as PDF

What packages would you install?

<details>
<summary>Click for Answer</summary>

```bash
# requirements.txt
requests>=2.28.0       # HTTP requests
beautifulsoup4>=4.11.0 # HTML parsing
pandas>=1.5.0          # Data processing
openpyxl>=3.0.0        # Excel support
reportlab>=3.6.0       # PDF generation
# Or alternatively:
# weasyprint>=58.0     # HTML to PDF
```

```bash
pip install -r requirements.txt
```

</details>

---

## Summary

Today you learned:

- ✅ `pip install` adds packages from PyPI
- ✅ `requirements.txt` tracks dependencies
- ✅ Version specifiers control compatibility
- ✅ `pip freeze` exports current environment
- ✅ Pin versions for reproducible builds

**Tomorrow**: We'll explore **virtual environments**—isolating project dependencies.

---

## Glossary

| Term | Definition |
|------|------------|
| Package Manager | A tool that automates installing, upgrading, and removing software libraries; Python's primary package manager is `pip`. |
| Dependency | A package that your code requires in order to run; listed in `requirements.txt` so others can reproduce your environment. |
| Requirements File | A text file (`requirements.txt`) listing package names and version constraints; used to reproduce an environment with `pip install -r`. |
| PyPI | The Python Package Index (pypi.org); the official public repository of Python packages where `pip` downloads packages by default. |
| Semantic Versioning | A versioning scheme `MAJOR.MINOR.PATCH` where MAJOR = breaking changes, MINOR = new features, PATCH = bug fixes. |
| Version Specifier | A constraint on which package versions are acceptable, e.g., `>=1.5,<2.0` means 1.5.x or 1.x but not 2.0+. |
| `pip freeze` | A command that outputs all currently installed packages with exact versions; used to generate a reproducible `requirements.txt`. |
| Pinning | Locking a dependency to an exact version (e.g., `pandas==2.1.4`) to ensure consistent builds across environments. |
| Transitive Dependency | A package that your direct dependency requires; installed automatically by pip but not listed in your own requirements file. |

## Task Block (Core / Stretch / Expert)

### Project Thread (Days 18–21): Retail Operations Toolkit

Use the same mini-project across these days so each concept compounds into a usable product artifact.

### Prereq Refresh (2–5 minutes)

- Confirm you can import your Day 18/19 modules from a local folder and run one function.
- If blocked, review: `__init__.py`, absolute vs relative imports, and running `python -m package.module`.

### Core

- Convert your Days 18–19 toolkit into an installable package structure (`src/` layout preferred).
- Expose a clean public API for core classes and datetime/report helpers.
- Add a `pyproject.toml` with dependencies and a short package description.

### Stretch

- Add a console script entry point that runs a demo order pipeline end-to-end.
- Add lightweight tests (or doctests) for import stability and one business flow.

### Expert

- Split optional dependencies into extras (e.g., `dev`, `analysis`) and justify each group.
- Publish package usage notes so Day 21 can run it inside isolated environments without path hacks.

## Common Grading Rubric (applies every day)

| Criterion | 1 - Emerging | 2 - Developing | 3 - Proficient | 4 - Strong |
|---|---|---|---|---|
| Correctness | Major logic errors; results frequently wrong. | Core path works but multiple inaccuracies remain. | Outputs are correct for expected inputs and checked with examples. | Outputs are consistently correct, including tricky cases and clear verification. |
| Robustness | Breaks on minor input changes or missing values. | Handles some variation but fails on common edge cases. | Handles expected edge cases with explicit guards/validation. | Gracefully handles unexpected data, with informative failures and recovery paths. |
| Readability | Hard to follow; unclear naming/structure. | Partially clear but inconsistent style or organization. | Clear naming, structure, and comments/docstrings where needed. | Highly readable, well-organized, and easy for teammates to extend quickly. |
| Reuse | One-off script with duplicated logic. | Some modularization, limited reuse. | Reusable functions/classes with sensible boundaries. | Well-factored components with clean interfaces and minimal duplication. |
