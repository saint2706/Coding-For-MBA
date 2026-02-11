---
day: 35
title: "Flask Web Framework"
phase: 3
phaseTitle: "Data Engineering & Web Development"
slug: "flask-web"
duration: 55
difficulty: "intermediate"
tags: [python, flask, web, html]
concepts: [web applications, templates, routing, forms]
prerequisites: [34]
outcomes: [Build web applications with Flask, Render HTML templates, Handle form submissions]
---

# 🎯 Day 35: Flask Web Framework

> *"FastAPI for APIs, Flask for web pages."*

---

## The "Never-Coded" Bridge

**APIs return JSON. But users want web pages.** They want to click buttons, submit forms, see styled interfaces.

**Flask gives you the full web experience.** It serves HTML pages with Jinja templates, handles form submissions, manages user sessions—everything needed for real web applications.

**When to use Flask vs FastAPI:**

| Need                    | Tool    |
| ----------------------- | ------- |
| JSON API for apps       | FastAPI |
| Website with HTML pages | Flask   |
| Admin dashboard         | Flask   |
| Mobile app backend      | FastAPI |

---

## The Technical Deep Dive

### Flask Basics

```python
from flask import Flask

app = Flask(__name__)

@app.route("/")
def home():
    return "<h1>Welcome to Flask!</h1>"

@app.route("/about")
def about():
    return "<h1>About Page</h1>"

if __name__ == "__main__":
    app.run(debug=True)
```

### Templates with Jinja2

```python
# app.py
from flask import Flask, render_template

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html", title="Home", user="Alice")

@app.route("/items")
def items():
    products = [
        {"name": "Laptop", "price": 999},
        {"name": "Mouse", "price": 29},
        {"name": "Keyboard", "price": 79}
    ]
    return render_template("items.html", products=products)
```

```html
<!-- templates/index.html -->
<!DOCTYPE html>
<html>
<head><title>{{ title }}</title></head>
<body>
    <h1>Hello, {{ user }}!</h1>
</body>
</html>

<!-- templates/items.html -->
<!DOCTYPE html>
<html>
<body>
    <h1>Products</h1>
    <ul>
    {% for product in products %}
        <li>{{ product.name }}: ${{ product.price }}</li>
    {% endfor %}
    </ul>
</body>
</html>
```

### Handling Forms

```python
from flask import Flask, render_template, request, redirect, url_for

app = Flask(__name__)

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]
        # Validate credentials...
        return redirect(url_for("dashboard", user=username))
    return render_template("login.html")

@app.route("/dashboard/<user>")
def dashboard(user):
    return f"<h1>Welcome, {user}!</h1>"
```

```html
<!-- templates/login.html -->
<form method="POST">
    <input type="text" name="username" placeholder="Username" required>
    <input type="password" name="password" placeholder="Password" required>
    <button type="submit">Login</button>
</form>
```

### Dynamic Routes

```python
@app.route("/user/<username>")
def user_profile(username):
    return f"<h1>Profile: {username}</h1>"

@app.route("/post/<int:post_id>")
def show_post(post_id):
    return f"<h1>Post #{post_id}</h1>"
```

---

## Senior-Level Insights

### Project Structure

```
myapp/
├── app.py              # Main application
├── templates/          # HTML templates
│   ├── base.html       # Base template
│   ├── index.html
│   └── items.html
├── static/             # CSS, JS, images
│   ├── style.css
│   └── script.js
└── requirements.txt
```

### Template Inheritance

```html
<!-- templates/base.html -->
<!DOCTYPE html>
<html>
<head>
    <title>{% block title %}My App{% endblock %}</title>
    <link rel="stylesheet" href="{{ url_for('static', filename='style.css') }}">
</head>
<body>
    <nav><!-- Common navigation --></nav>
    {% block content %}{% endblock %}
</body>
</html>

<!-- templates/index.html -->
{% extends "base.html" %}
{% block title %}Home{% endblock %}
{% block content %}
    <h1>Welcome!</h1>
{% endblock %}
```

### Security Considerations

```python
# CSRF Protection with Flask-WTF
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField

class LoginForm(FlaskForm):
    username = StringField("Username")
    password = PasswordField("Password")
    submit = SubmitField("Login")

# Escape user input (Jinja2 does this by default)
# {{ user_input }}  <- Safe, auto-escaped
# {{ user_input|safe }}  <- Dangerous, renders raw HTML
```

---

## Hands-on Lab

### Exercise 1: Simple Blog

```python
from flask import Flask, render_template

app = Flask(__name__)

posts = [
    {"title": "First Post", "content": "Hello World!", "author": "Alice"},
    {"title": "Flask Tutorial", "content": "Flask is great...", "author": "Bob"}
]

@app.route("/")
def index():
    return render_template("blog_index.html", posts=posts)

@app.route("/post/<int:post_id>")
def post_detail(post_id):
    if 0 <= post_id < len(posts):
        return render_template("post.html", post=posts[post_id])
    return "Post not found", 404

if __name__ == "__main__":
    app.run(debug=True)
```

### Exercise 2: Contact Form

```python
from flask import Flask, render_template, request, flash, redirect, url_for

app = Flask(__name__)
app.secret_key = "your-secret-key"

@app.route("/contact", methods=["GET", "POST"])
def contact():
    if request.method == "POST":
        name = request.form.get("name")
        email = request.form.get("email")
        message = request.form.get("message")
        
        # Here you'd save or email the message
        flash(f"Thanks {name}! We'll respond to {email} soon.")
        return redirect(url_for("contact"))
    
    return render_template("contact.html")

if __name__ == "__main__":
    app.run(debug=True)
```

### Exercise 3: Data Dashboard

```python
from flask import Flask, render_template
import pandas as pd

app = Flask(__name__)

@app.route("/dashboard")
def dashboard():
    # Sample data
    data = {
        "total_users": 1250,
        "active_today": 342,
        "revenue": 15240.50,
        "top_products": [
            {"name": "Product A", "sales": 450},
            {"name": "Product B", "sales": 320},
            {"name": "Product C", "sales": 280}
        ]
    }
    return render_template("dashboard.html", **data)

if __name__ == "__main__":
    app.run(debug=True)
```

---

## Mastery Check

### Question 1: Flask vs FastAPI

When would you choose Flask over FastAPI?

<details>
<summary>Click for Answer</summary>

**Choose Flask when:**

- Building web pages with HTML/CSS
- Need template rendering (Jinja2)
- Building admin interfaces
- Traditional web applications

**Choose FastAPI when:**

- Building JSON APIs
- Mobile app backends
- Need async performance
- API documentation is priority

</details>

### Question 2: Templates

What does `{{ variable }}` vs `{% statement %}` mean in Jinja2?

<details>
<summary>Click for Answer</summary>

- `{{ }}` - Output variable value
- `{% %}` - Execute logic (if, for, etc.)

```html
{{ user.name }}           <!-- Outputs: Alice -->

{% for item in items %}   <!-- Loop -->
    {{ item }}
{% endfor %}

{% if logged_in %}        <!-- Conditional -->
    Welcome back!
{% endif %}
```

</details>

### Question 3: Form Security

What is CSRF and why does Flask-WTF help?

<details>
<summary>Click for Answer</summary>

**CSRF (Cross-Site Request Forgery):** Attacker tricks user's browser into submitting a form to your site.

**Flask-WTF protection:**

- Generates hidden token in each form
- Validates token on submission
- Blocks requests from other sites

```html
<form method="POST">
    {{ form.csrf_token }}  <!-- Hidden token -->
    {{ form.submit() }}
</form>
```

</details>

### Question 4: Static Files

How do you link to CSS in Flask templates?

<details>
<summary>Click for Answer</summary>

```html
<link rel="stylesheet" href="{{ url_for('static', filename='style.css') }}">
<script src="{{ url_for('static', filename='script.js') }}"></script>
<img src="{{ url_for('static', filename='logo.png') }}">
```

Never hardcode paths—`url_for` handles URL generation correctly.

</details>

### Question 5: Debug Mode

Why should you never use `debug=True` in production?

<details>
<summary>Click for Answer</summary>

Debug mode:

- Shows detailed error traces (security risk)
- Allows code execution via debugger console
- Exposes internal application details

**Production:**

```python
# Development
app.run(debug=True)

# Production (use WSGI server)
# gunicorn app:app
```

</details>

---

## Summary

- ✅ Flask for web applications with HTML
- ✅ Jinja2 templates for dynamic content
- ✅ Form handling with GET/POST
- ✅ Template inheritance for DRY code
- ✅ Static files for CSS/JS/images

**Tomorrow**: Putting it all together in a case study.
