---
title: "Day 21: Virtual Environments - Professional Project Management"
tags:
  - Data
---

# 📘 Day 21: Virtual Environments - Professional Project Management

As you work on more complex projects, you'll find they have different requirements. Project A might
need an older version of a library, while Project B needs the latest version. Installing everything
globally on your computer leads to conflicts.

The professional solution is to use **virtual environments**.

## What is a Virtual Environment?

A virtual environment is an isolated, self-contained directory that holds a specific version of
Python plus all the specific packages and libraries required for a particular project. Think of it
as a clean, separate workspace for each project.

This is a **critical best practice** for any serious Python development because it makes your
projects:

- **Isolated:** Prevents package versions from clashing between projects.
- **Reproducible:** Allows anyone to recreate the exact same environment your project needs to run
  correctly.

## How it Works: `venv` and `requirements.txt`

The main `README.md` file for this entire repository now contains the standard setup instructions
for this project, which includes creating a virtual environment and installing the project's
dependencies.

The key commands, which you should run from your terminal, are:

1. **Create Environment:** `python3 -m venv venv`
   - This creates a `venv` folder in your project directory.

1. **Activate Environment:**
   - **macOS/Linux:** `source venv/bin/activate`
   - **Windows:** `venv\\Scripts\\activate`
   - Your terminal prompt will change to show `(venv)`, indicating it's active.

1. **Install Packages:** `pip install -r requirements.txt`
   - This command reads the `requirements.txt` file and installs the exact versions of all necessary
     packages into your active `venv`.

1. **Deactivate Environment:** `deactivate`
   - When you're done, this command returns you to your normal shell.

## 💻 Exercises: Day 21

This lesson is about terminal commands, not Python scripts. The best way to learn is by doing.

1. **Create a New Project:**
   - On your computer, create a new folder called `my_test_project`.
   - Navigate into it using `cd my_test_project`.

1. **Initialize and Activate:**
   - Create a new virtual environment inside it: `python3 -m venv my_env`.
   - Activate the new environment.

1. **Install and Freeze:**
   - Install a package that is not in our main project, for example: `pip install "cowsay==5.0"`.
   - Generate a `requirements.txt` file for this new project using the `pip freeze` command. Open
     the file and see that `cowsay` is listed.

1. **Deactivate and Clean Up:**
   - Deactivate the environment. You can now delete the `my_test_project` folder.

🎉 **Congratulations!** You've practiced one of the most important skills for professional Python
development. Using virtual environments will save you from countless headaches and make your
projects more robust and shareable.

<!-- LESSON_FOOTER_START -->

---

**Previous:** [Day 20 – Day 20: Python Package Manager (pip) & Third-Party Libraries](../Day_20_Python_Package_Manager/README.md) • **Next:** [Day 22 – Day 22: NumPy - The Foundation of Numerical Computing](../Day_22_NumPy/README.md)

_You are on lesson 21 of 108._

<!-- LESSON_FOOTER_END -->
