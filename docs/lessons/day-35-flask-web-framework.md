---
title: 'Day 35: Flask Web Framework'
tags:
  - Data
  - Web
---

Welcome to Day 35! This lesson contains a small Flask project that analyses submitted text and
reports simple statistics such as word counts and lexical diversity.

## Environment setup

1. **Create and activate a virtual environment** (recommended):
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows use: .venv\\Scripts\\activate
   ```
1. **Install the dependencies for this lesson**:
   ```bash
   pip install -r Day_35_Flask_Web_Framework/requirements.txt
   ```

## Running the Flask application

The application now exposes a `create_app()` factory in
`Day_35_Flask_Web_Framework/app/__init__.py`, so it can be started with the Flask CLI:

```bash
FLASK_APP=Day_35_Flask_Web_Framework.app:create_app flask run
```

Alternatively, you can execute the module directly:

```bash
python -m Day_35_Flask_Web_Framework.app
```

Once running, visit <http://127.0.0.1:5000/> to interact with the analyser. Use the **Post** page to
submit text and review the calculated statistics on the **Result** page.

## Running the tests

Automated tests validate both the Flask routes and the helper functions that power the analyser.
Execute them from the repository root:

```bash
pytest -k day_35
```

## 💻 Exercises: Day 35

1. **Create a new route**:

   - Add a new route to the `create_app` factory at the URL `/about`.
   - Create a view function that returns a simple string, like "This is the about page."

1. **Create a new template**:

   - Create a new HTML file named `contact.html` in the `templates` directory.
   - Add a new route to the Flask app at the URL `/contact` that renders the `contact.html`
     template.

1. **Pass data to a template**:

   - Modify the `/about` route to pass your name to a new `about.html` template.
   - In the `about.html` template, display the name that was passed from the view function.

### Solutions

You can find the solutions to these exercises in the `solutions.py` file in this directory.

🎉 **Congratulations!** You've learned the basics of Flask, a powerful tool for building web
applications and dashboards with Python.

<!-- LESSON_FOOTER_START -->

______________________________________________________________________

**Previous:** [Day 34 – Day 34: Building a Simple API with Flask](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_34_Building_an_API/README.md) • **Next:** [Day 36 – Day 36 – Capstone Case Study](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_36_Case_Study/README.md)

_You are on lesson 35 of 108._

<!-- LESSON_FOOTER_END -->

## Interactive Notebooks

Run this lesson's notebooks directly in your browser with the built-in JupyterLite runtime.

[🪐 Launch in JupyterLite](/jupyterlite/lab?path=Day_35_Flask_Web_Framework/solutions.ipynb){ .md-button .md-button--primary }

## Additional Materials

- **solutions.ipynb**
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_35_Flask_Web_Framework/solutions.ipynb){ .md-button }
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_35_Flask_Web_Framework/solutions.ipynb){ .md-button .md-button--primary }
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_35_Flask_Web_Framework/solutions.ipynb){ .md-button }
  [🪐 Launch in JupyterLite](/jupyterlite/lab?path=Day_35_Flask_Web_Framework/solutions.ipynb){ .md-button }

???+ example "solutions.py"
[View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_35_Flask_Web_Framework/solutions.py)

````
```python title="solutions.py"
# Day 35: Flask Web Framework - Solutions

from flask import Flask, render_template

app = Flask(__name__)

## Exercise 1: Create a new route


@app.route("/about-solution")
def about_solution():
    return "This is the about page."


## Exercise 2: Create a new template

# 1. Create a new HTML file named 'contact.html' in the 'templates' directory.
#    You can add some simple content to it, like:
#
#    <!DOCTYPE html>
#    <html>
#    <head>
#        <title>Contact Us</title>
#    </head>
#    <body>
#        <h1>Contact Us</h1>
#        <p>You can contact us at contact@example.com</p>
#    </body>
#    </html>
#
# 2. Add a new route to app.py that renders this template.


@app.route("/contact")
def contact():
    return render_template("contact.html")


## Exercise 3: Pass data to a template

# 1. Create a new HTML file named 'about.html' in the 'templates' directory.
#
#    <!DOCTYPE html>
#    <html>
#    <head>
#        <title>About Me</title>
#    </head>
#    <body>
#        <h1>About {{ name }}</h1>
#    </body>
#    </html>
#
# 2. Modify the '/about' route to pass your name to the template.


@app.route("/about-me")
def about_me():
    my_name = "Jules"  # You can replace this with your name
    return render_template("about.html", name=my_name)


if __name__ == "__main__":
    import os

    # Skip running the server in test/automated environments
    if os.environ.get("FLASK_RUN_TEST_MODE") != "1":
        app.run(debug=True)
    else:
        print("Flask app created successfully (test mode - not starting server)")
        print("Routes available:")
        print("  - GET /about-solution")
        print("  - GET /contact")
        print("  - GET /about-me")
```
````
