As you work on more complex projects, you'll find they have different requirements. Project A might need an older version of a library, while Project B needs the latest version. Installing everything globally on your computer leads to conflicts.

The professional solution is to use **virtual environments**.

## What is a Virtual Environment?

A virtual environment is an isolated, self-contained directory that holds a specific version of Python plus all the specific packages and libraries required for a particular project. Think of it as a clean, separate workspace for each project.

This is a **critical best practice** for any serious Python development because it makes your projects:

- **Isolated:** Prevents package versions from clashing between projects.
- **Reproducible:** Allows anyone to recreate the exact same environment your project needs to run correctly.

## How it Works: `venv` and `requirements.txt`

The main `README.md` file for this entire repository now contains the standard setup instructions for this project, which includes creating a virtual environment and installing the project's dependencies.

The key commands, which you should run from your terminal, are:

1. **Create Environment:** `python3 -m venv venv`

   - This creates a `venv` folder in your project directory.

1. **Activate Environment:**

   - **macOS/Linux:** `source venv/bin/activate`
   - **Windows:** `venv\\Scripts\\activate`
   - Your terminal prompt will change to show `(venv)`, indicating it's active.

1. **Install Packages:** `pip install -r requirements.txt`

   - This command reads the `requirements.txt` file and installs the exact versions of all necessary packages into your active `venv`.

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
   - Generate a `requirements.txt` file for this new project using the `pip freeze` command. Open the file and see that `cowsay` is listed.

1. **Deactivate and Clean Up:**

   - Deactivate the environment. You can now delete the `my_test_project` folder.

🎉 **Congratulations!** You've practiced one of the most important skills for professional Python development. Using virtual environments will save you from countless headaches and make your projects more robust and shareable.

## Additional Materials

- **solutions.ipynb**  
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_21_Virtual_Environments/solutions.ipynb){ .md-button } 
  [📓 Open in NBViewer](https://nbviewer.org/github/saint2706/Coding-For-MBA/blob/main/Day_21_Virtual_Environments/solutions.ipynb){ .md-button } 
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_21_Virtual_Environments/solutions.ipynb){ .md-button .md-button--primary } 
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_21_Virtual_Environments/solutions.ipynb){ .md-button }
- **virtual_environments.ipynb**  
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_21_Virtual_Environments/virtual_environments.ipynb){ .md-button } 
  [📓 Open in NBViewer](https://nbviewer.org/github/saint2706/Coding-For-MBA/blob/main/Day_21_Virtual_Environments/virtual_environments.ipynb){ .md-button } 
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_21_Virtual_Environments/virtual_environments.ipynb){ .md-button .md-button--primary } 
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_21_Virtual_Environments/virtual_environments.ipynb){ .md-button }

???+ example "solutions.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_21_Virtual_Environments/solutions.py)

    ```python title="solutions.py"
    """
    Day 21: Solutions to Exercises (Command-Line Steps)

    These exercises are performed in your terminal. This file describes
    the steps you would take to complete them.
    """

    # --- Exercise 1: Create a Project and Environment ---
    solution_1 = """
    --- Solution to Exercise 1 ---
    1. Open your terminal (Command Prompt, PowerShell, Terminal, etc.).
    2. Navigate to a place where you want to create your project (e.g., Desktop or Documents).
       cd Desktop
    3. Create the project folder:
       mkdir my_analytics_project
    4. Navigate into the new folder:
       cd my_analytics_project
    5. Create the virtual environment (named 'venv'):
       # On macOS/Linux:
       python3 -m venv venv
       # On Windows:
       python -m venv venv
    """
    print(solution_1)


    # --- Exercise 2: Activate and Install ---
    solution_2 = """
    --- Solution to Exercise 2 ---
    1. Make sure you are inside the 'my_analytics_project' directory.
    2. Activate the environment:
       # On macOS/Linux:
       source venv/bin/activate
       # On Windows Command Prompt:
       venv\\Scripts\\activate.bat
       # Your terminal prompt should now start with '(venv)'.

    3. Install the packages using pip:
       pip install pandas scipy

    4. Verify the installation by listing the packages:
       pip list
       # You should see pandas, scipy, and their dependencies in the output.
    """
    print(solution_2)


    # --- Exercise 3: Create a Requirements File ---
    solution_3 = """
    --- Solution to Exercise 3 ---
    1. Ensure your virtual environment is still active.
    2. Run the 'pip freeze' command and redirect the output to a file:
       pip freeze > requirements.txt

    3. You can now see a 'requirements.txt' file in your project folder.
       If you open it, it will contain lines like:
       numpy==...
       pandas==...
       scipy==...
       ...and other dependencies with their exact versions.
    """
    print(solution_3)


    # --- Exercise 4: Deactivate ---
    solution_4 = """
    --- Solution to Exercise 4 ---
    1. To exit the virtual environment, simply type:
       deactivate
    2. Your terminal prompt will return to normal.
    """
    print(solution_4)
    ```

???+ example "virtual_environments.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_21_Virtual_Environments/virtual_environments.py)

    ```python title="virtual_environments.py"
    """
    Day 21: Virtual Environments

    This lesson is primarily focused on commands you run in your terminal,
    not in a Python script.

    Please see the README.md file for the full lesson and exercises.

    The key commands are:
    1. Create environment: python -m venv venv
    2. Activate (macOS/Linux): source venv/bin/activate
    3. Activate (Windows): venv\\Scripts\\activate.bat
    4. Install packages: pip install <package_name>
    5. Save packages: pip freeze > requirements.txt
    6. Deactivate: deactivate
    """

    print("This Python script is a placeholder.")
    print(
        "Please follow the instructions in README.md to practice using virtual environments in your terminal."
    )
    ```
