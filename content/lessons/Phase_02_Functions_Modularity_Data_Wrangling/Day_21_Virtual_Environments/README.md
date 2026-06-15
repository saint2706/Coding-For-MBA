---
day: 21
title: "Virtual Environments"
phase: 2
phaseTitle: "Functions, Modularity & Data Wrangling"
slug: "virtual-environments"
duration: 35
difficulty: "beginner"
tags:
  - python
  - venv
  - isolation
  - dependencies
concepts:
  - "creating virtual environments"
  - "activating and deactivating"
  - "project isolation"
  - "python version management"
prerequisites: [14, 20]
outcomes:
  - "Create and manage virtual environments"
  - "Isolate project dependencies"
  - "Avoid dependency conflicts"
---

# 🎯 Day 21: Virtual Environments

> *"Keep your projects isolated—what happens in one venv stays in one venv."*

---

## The "Never-Coded" Bridge

**Imagine every project sharing one kitchen:**

- Project A needs salt (Django 3.2)
- Project B needs pepper (Django 4.2)
- They both can't be in the same jar!

Without virtual environments, all your Python projects share the same packages. One project upgrades a package, another breaks.

Virtual environments give each project its own isolated "kitchen":

```bash
# Project A has its own packages
myproject_a/venv/
├── Django 3.2
└── requests 2.25

# Project B has different versions
myproject_b/venv/
├── Django 4.2
└── requests 2.28
```

---

## The Technical Deep Dive

### Creating a Virtual Environment

```bash
# Create venv directory
python -m venv venv

# Or with a custom name
python -m venv myenv
```

### Activating the Environment

```bash
# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

# You'll see (venv) in your prompt:
(venv) C:\myproject>
```

### Deactivating

```bash
deactivate
```

### Installing Packages in venv

```bash
# Activate first!
(venv) > pip install requests pandas

# Verify isolated installation
(venv) > pip list
# Shows only packages in THIS venv

# Generate requirements
(venv) > pip freeze > requirements.txt
```

### Project Workflow

```bash
# 1. Create project directory
mkdir my_project
cd my_project

# 2. Create virtual environment
python -m venv venv

# 3. Activate it
venv\Scripts\activate  # Windows

# 4. Install dependencies
pip install requests pandas flask

# 5. Save requirements
pip freeze > requirements.txt

# 6. Work on your project...

# 7. When done
deactivate
```

### Cloning an Environment

```bash
# On a new machine or for a teammate:
git clone project_repo
cd project_repo

# 1. Create new venv
python -m venv venv

# 2. Activate
venv\Scripts\activate

# 3. Install from requirements
pip install -r requirements.txt
```

---

## Senior-Level Insights

### .gitignore Best Practice

```gitignore
# .gitignore
venv/
.venv/
env/
ENV/
*.pyc
__pycache__/
.env
```

Never commit the `venv` folder—it's reproducible from `requirements.txt`.

### Multiple Python Versions

```bash
# Use specific Python version
python3.11 -m venv venv

# Or with pyenv (popular version manager)
pyenv install 3.11.0
pyenv local 3.11.0
python -m venv venv
```

### VS Code Integration

VS Code automatically detects venvs. To select:

1. Open Command Palette (Ctrl+Shift+P)
2. "Python: Select Interpreter"
3. Choose your venv's Python

### Common Issues

**Issue**: `pip install` not working in venv

```bash
# Ensure venv is activated
# Check prompt for (venv)

# If pip is outdated:
python -m pip install --upgrade pip
```

**Issue**: Wrong Python version

```bash
# Check which Python
python --version
where python  # Windows
which python  # macOS/Linux
```

---

## Hands-on Lab

### Exercise 1: Create Project Environment

```bash
# Step 1: Create project
mkdir weather_app
cd weather_app

# Step 2: Create and activate venv
python -m venv venv
venv\Scripts\activate  # Windows

# Step 3: Install packages
pip install requests python-dotenv

# Step 4: Create requirements
pip freeze > requirements.txt

# Step 5: Verify
pip list
```

**Expected Output (after successful setup):**

```
(venv) > pip list
Package      Version
------------ -------
pip          23.3.1
python-dotenv 1.0.0
requests     2.31.0
```

### Exercise 2: Recreate Environment

```bash
# Simulate a new developer joining the project

# 1. Deactivate and delete venv
deactivate
rmdir /s /q venv  # Windows
# rm -rf venv     # macOS/Linux

# 2. Create fresh venv
python -m venv venv
venv\Scripts\activate

# 3. Install from requirements
pip install -r requirements.txt

# 4. Verify all packages are back
pip list
```

**Expected Output (environment is fresh, same packages reinstalled):**

```
(venv) > pip list
Package      Version
------------ -------
pip          23.3.1
python-dotenv 1.0.0
requests     2.31.0
# All packages restored from requirements.txt
```

### Exercise 3: Environment Info Script

```python
# env_info.py
import sys
import os


def show_environment_info():
    print("=== Python Environment Info ===\n")

    # Python version and location
    print(f"Python Version: {sys.version}")
    print(f"Python Executable: {sys.executable}")

    # Virtual environment detection
    venv = os.environ.get("VIRTUAL_ENV")
    if venv:
        print(f"\n✅ Virtual Environment ACTIVE")
        print(f"   Location: {venv}")
    else:
        print("\n⚠️ No virtual environment detected!")
        print("   Consider creating one: python -m venv venv")

    # List key packages
    print("\n=== Installed Packages ===")
    import pkg_resources

    for pkg in sorted(pkg_resources.working_set, key=lambda x: x.key):
        print(f"   {pkg.key}: {pkg.version}")


if __name__ == "__main__":
    show_environment_info()
```

**Expected Output (when run inside an active venv):**

```
=== Python Environment Info ===

Python Version: 3.11.5 (main, ...)
Python Executable: /home/user/weather_app/venv/bin/python

✅ Virtual Environment ACTIVE
   Location: /home/user/weather_app/venv

=== Installed Packages ===
   pip: 23.3.1
   python-dotenv: 1.0.0
   requests: 2.31.0
```

---

## Mastery Check

### Question 1: Why Virtual Environments?

What problem do virtual environments solve?

<details>
<summary>Click for Answer</summary>

**Dependency isolation.** Each project can have:

- Different versions of the same package
- Different Python versions (with tools like pyenv)
- No conflicts between projects

Without venvs, upgrading a package for one project could break another.

</details>

---

### Question 2: Activation Check

How do you verify your venv is activated?

<details>
<summary>Click for Answer</summary>

1. Look for `(venv)` in your command prompt
2. Run `which python` (macOS/Linux) or `where python` (Windows)
3. Check `sys.executable` in Python:

```python
import sys

print(sys.executable)  # Should show path inside venv/
```

</details>

---

### Question 3: Requirements

What's the workflow for a new team member?

<details>
<summary>Click for Answer</summary>

```bash
# 1. Clone the repository
git clone <repo-url>
cd project

# 2. Create virtual environment
python -m venv venv

# 3. Activate it
source venv/bin/activate  # or venv\Scripts\activate

# 4. Install dependencies
pip install -r requirements.txt

# 5. Ready to work!
```

</details>

---

### Question 4: Git Integration

Should you commit the venv folder?

<details>
<summary>Click for Answer</summary>

**No!** The venv folder:

- Is large (hundreds of MB)
- Is platform-specific
- Is reproducible from requirements.txt

Add to `.gitignore`:

```
venv/
.venv/
```

</details>

---

### Question 5: Design Scenario

**Scenario**: You have two projects—one needs Django 3.2 for a legacy app, another needs Django 4.2 for a new app. How do you manage this?

<details>
<summary>Click for Answer</summary>

```bash
# Legacy project
cd legacy_app
python -m venv venv
venv\Scripts\activate
pip install django==3.2
pip freeze > requirements.txt
deactivate

# New project
cd ../new_app
python -m venv venv
venv\Scripts\activate
pip install django==4.2
pip freeze > requirements.txt
deactivate

# Now each project has its own Django version
# Activate the appropriate venv when working on each
```

</details>

---

## Summary

Today you learned:

- ✅ `python -m venv venv` creates isolated environments
- ✅ Activate with `venv\Scripts\activate` (Windows)
- ✅ Each project gets its own dependencies
- ✅ Never commit `venv/` to git
- ✅ Share `requirements.txt`, not the venv folder

**Tomorrow**: We'll explore **NumPy**—the foundation of numerical computing in Python.

---

## Glossary

| Term | Definition |
|------|------------|
| Virtual Environment | An isolated Python installation that has its own `site-packages` directory, separate from the system-wide Python. |
| Isolation | The property of a virtual environment whereby packages installed in it cannot interfere with packages in other environments. |
| Dependency Conflict | A situation where two projects require incompatible versions of the same package; virtual environments prevent this. |
| Activation | The act of switching the shell's `PATH` so that `python` and `pip` point to the virtual environment's executables. |
| `venv` | The built-in Python module for creating lightweight virtual environments, invoked as `python -m venv <name>`. |
| `deactivate` | A shell command that reverses activation, restoring `python` and `pip` to their system defaults. |
| `.gitignore` | A file listing paths that Git should not track; the `venv/` directory should always be listed here. |
| `requirements.txt` | The shareable list of a project's dependencies; teammates use it to recreate the same environment with `pip install -r`. |

## Task Block (Core / Stretch / Expert)

### Project Thread (Days 18–21): Retail Operations Toolkit

Use the same mini-project across these days so each concept compounds into a usable product artifact.

### Prereq Refresh (2–5 minutes)

- Create and activate one virtual environment, then install your Day 20 package in editable mode.
- If blocked, review: activation commands by OS and how `pip list` confirms environment isolation.

### Core

- Run the packaged toolkit in a fresh virtual environment and verify reproducible setup.
- Capture a short setup script/checklist (`create venv -> install -> run demo`).
- Validate imports, command entry point, and one sample report.

### Stretch

- Create separate `dev` and `runtime` environments and compare installed dependency sets.
- Add a troubleshooting note for common environment mismatch issues.

### Expert

- Automate environment bootstrap with a single command (`Makefile`, script, or task runner).
- Demonstrate deterministic installs (pinning strategy and lockfile/tooling recommendation).

## Common Grading Rubric (applies every day)

| Criterion | 1 - Emerging | 2 - Developing | 3 - Proficient | 4 - Strong |
|---|---|---|---|---|
| Correctness | Major logic errors; results frequently wrong. | Core path works but multiple inaccuracies remain. | Outputs are correct for expected inputs and checked with examples. | Outputs are consistently correct, including tricky cases and clear verification. |
| Robustness | Breaks on minor input changes or missing values. | Handles some variation but fails on common edge cases. | Handles expected edge cases with explicit guards/validation. | Gracefully handles unexpected data, with informative failures and recovery paths. |
| Readability | Hard to follow; unclear naming/structure. | Partially clear but inconsistent style or organization. | Clear naming, structure, and comments/docstrings where needed. | Highly readable, well-organized, and easy for teammates to extend quickly. |
| Reuse | One-off script with duplicated logic. | Some modularization, limited reuse. | Reusable functions/classes with sensible boundaries. | Well-factored components with clean interfaces and minimal duplication. |
