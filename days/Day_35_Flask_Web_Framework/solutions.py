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
