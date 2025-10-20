---
tags: [python, analytics, bi, ml, curriculum]
---

# Get started

Follow these steps to configure a local workspace that mirrors the recommended contributor setup.

## 1. Prepare Python 3.11

Install Python 3.11 or use the provided devcontainer (see `.devcontainer/devcontainer.json`). On macOS/Linux you can use [`pyenv`](https://github.com/pyenv/pyenv); on Windows, install from the Microsoft Store.

## 2. Create and activate a virtual environment

```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\\Scripts\\activate
```

Keep the environment active for all following commands.

## 3. Install dependencies

```bash
pip install -r requirements.txt
pip install -r requirements-dev.txt
```

For documentation work, install the MkDocs toolchain:

```bash
pip install -r docs/requirements-docs.txt
```

## 4. Install pre-commit hooks

```bash
pre-commit install
```

Hooks enforce formatting for Python, notebooks, and Markdown before every commit.

## 5. Launch Jupyter when you want notebooks

```bash
jupyter notebook
```

Navigate to any `Day_XX_*` directory and open the lesson notebook. Each folder includes scripts, notebooks, and (when applicable) solutions.

## 6. Run a single lesson script

```bash
python Day_30_Web_Scraping/lesson.py
```

Swap the folder name to execute any other lesson. The scripts are designed to run independently and print their own instructions or outputs.

## 7. Use the Makefile for common tasks

```bash
make setup       # bootstrap a fresh checkout
make docs-serve  # run mkdocs serve locally at http://localhost:8000
make lint        # run ruff, mdformat, and pre-commit checks
```

Once everything works locally, you are ready to explore the lessons or contribute improvements.
