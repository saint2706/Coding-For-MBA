---
title: FAQ
tags:
  - python
  - analytics
  - bi
  - ml
  - curriculum
---

______________________________________________________________________

# FAQ

## Why does `pip install` fail on macOS?

Ensure you are using Python 3.11 from a universal2 installer or Homebrew. Older system Pythons often
lack SSL headers. Installing Xcode Command Line Tools and upgrading `pip` resolves most issues.

## How do I run notebooks without polluting my global environment?

Create the project virtual environment (`python -m venv .venv`) and launch Jupyter from within it.
This keeps dependencies isolated and matches the environment used in CI.

## MkDocs build fails with missing plugins

Install documentation dependencies with:

```bash
pip install -r docs/requirements-docs.txt
```

Then rerun `make docs`. The requirements file pins MkDocs Material, mkdocs-jupyter, redirects, and
other plugins.

## Pre-commit takes a long time on notebooks

The nbQA hooks lint notebooks using `ruff` and `black`. Run
`pre-commit run --all-files --hook-stage manual` after large notebook edits, or scope to the changed
files with `pre-commit run nbqa-black --files path/to/notebook.ipynb`.

## Where do I ask for help or suggest improvements?

Open a [GitHub Discussion](https://github.com/saint2706/Coding-For-MBA/discussions) for curriculum
questions or propose a change through an issue using the templates in `.github/ISSUE_TEMPLATE/`.
