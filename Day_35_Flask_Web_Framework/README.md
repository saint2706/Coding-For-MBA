# 🌐 Day 35: Flask Web Framework

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

---

**Previous:** [Day 34 – Day 34: Building a Simple API with Flask](../Day_34_Building_an_API/README.md) • **Next:** [Day 36 – Day 36 – Capstone Case Study](../Day_36_Case_Study/README.md)

_You are on lesson 35 of 108._

<!-- LESSON_FOOTER_END -->