---
day: 35
title: "Flask Web Framework"
phase: 3
phaseTitle: "Data Engineering & Web Development"
slug: "flask-web-framework"
duration: 60
difficulty: "intermediate"
tags: [python, flask, web, html]
concepts: [routes, templates, forms, sessions]
prerequisites: [33, 34]
outcomes: [Build web applications with Flask, Render HTML templates, Handle form submissions]
---

# 🎯 Day 35: Flask Web Framework

> *"From scripts to websites. Flask makes Python speak HTML."*

---

## The "Never-Coded" Bridge

FastAPI is for APIs. Flask is for full websites—HTML pages, forms, user sessions. It's Python's most popular web framework.

---

## The Technical Deep Dive

### Basic Flask App

```python
from flask import Flask

app = Flask(__name__)

@app.route("/")
def home():
    return "<h1>Hello, Flask!</h1>"

@app.route("/about")
def about():
    return "<h1>About Page</h1>"

if __name__ == "__main__":
    app.run(debug=True)
```

### Templates (Jinja2)

```html
<!-- templates/index.html -->
<!DOCTYPE html>
<html>
<head><title>{{ title }}</title></head>
<body>
    <h1>Hello, {{ name }}!</h1>
    <ul>
    {% for item in items %}
        <li>{{ item }}</li>
    {% endfor %}
    </ul>
</body>
</html>
```

```python
from flask import render_template

@app.route("/")
def home():
    return render_template("index.html", 
                          title="My App",
                          name="User",
                          items=["Python", "Flask", "HTML"])
```

### Forms

```html
<!-- templates/login.html -->
<form method="POST">
    <input type="text" name="username" placeholder="Username">
    <input type="password" name="password" placeholder="Password">
    <button type="submit">Login</button>
</form>
```

```python
from flask import request, redirect, url_for

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]
        # Validate credentials
        return redirect(url_for("home"))
    return render_template("login.html")
```

### URL Parameters

```python
@app.route("/user/<username>")
def user_profile(username):
    return f"<h1>Profile: {username}</h1>"

@app.route("/product/<int:product_id>")
def product(product_id):
    return f"<h1>Product #{product_id}</h1>"
```

### Static Files

```
project/
├── app.py
├── templates/
│   └── index.html
└── static/
    ├── style.css
    └── script.js
```

```html
<link rel="stylesheet" href="{{ url_for('static', filename='style.css') }}">
```

---

## Hands-on Lab

```python
from flask import Flask, render_template, request

app = Flask(__name__)

tasks = []

@app.route("/")
def home():
    return render_template("tasks.html", tasks=tasks)

@app.route("/add", methods=["POST"])
def add_task():
    task = request.form.get("task")
    if task:
        tasks.append(task)
    return redirect(url_for("home"))

if __name__ == "__main__":
    app.run(debug=True)
```

```html
<!-- templates/tasks.html -->
<!DOCTYPE html>
<html>
<body>
    <h1>Task Manager</h1>
    <form action="/add" method="POST">
        <input type="text" name="task" placeholder="New task">
        <button>Add</button>
    </form>
    <ul>
    {% for task in tasks %}
        <li>{{ task }}</li>
    {% endfor %}
    </ul>
</body>
</html>
```

---

## Summary

- ✅ Flask creates web applications
- ✅ Jinja2 templates render dynamic HTML
- ✅ Forms handle user input
- ✅ `url_for()` generates URLs safely

**Tomorrow**: Capstone case study.
