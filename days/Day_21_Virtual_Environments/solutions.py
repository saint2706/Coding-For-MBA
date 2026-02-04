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
