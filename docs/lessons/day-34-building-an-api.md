Consuming data from APIs is a core skill. But what if you need to provide data from your analysis to another person or application? Instead of sending a CSV file, you can build your own API. This allows other services (like a web dashboard or another analyst's script) to access your data programmatically.

Today, we'll learn how to build a simple web API using **Flask**, a popular "micro-framework" for Python. It's called a micro-framework because it's very lightweight and simple to start with, but can be extended to build complex applications.

## What is a Web Framework?

A web framework like Flask handles all the low-level, complicated parts of web communication (like handling HTTP requests and responses), so you can focus on writing your application's logic.

## Your First Flask API

A Flask application can be incredibly simple. Here is a basic "Hello, World" example:

```python
from flask import Flask

# 1. Create an instance of the Flask class
app = Flask(__name__)

# 2. Define a "route"
# This tells Flask: "When someone visits the main URL ('/'), run this function."
@app.route('/')
def home():
    return "Welcome to our API!"

# 3. Run the app
# The __name__ == '__main__' block ensures this code only runs when you execute the script directly.
if __name__ == '__main__':
    app.run(debug=True) # debug=True allows for auto-reloading on code changes
```

## Returning JSON Data

An API for data analysis isn't very useful if it just returns text. We need to return structured data, and the standard format for that is JSON. Flask provides a handy function called `jsonify` that converts a Python dictionary into a proper JSON response.

```python
from flask import Flask, jsonify

app = Flask(__name__)

# Sample data (in a real app, this might come from a database or a Pandas DataFrame)
products = [
    {'id': 1, 'name': 'Laptop', 'price': 1200},
    {'id': 2, 'name': 'Mouse', 'price': 25}
]

@app.route('/api/products', methods=['GET'])
def get_products():
    return jsonify(products)
```

Now, if you run this app and navigate to `http://127.0.0.1:5000/api/products` in your browser or an API tool, you'll get the list of products in JSON format.

## Dynamic Routes

You can create routes that accept parameters. For example, to get a single product by its ID.

```python
@app.route('/api/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    # Find the product with the matching ID
    product = next((p for p in products if p['id'] == product_id), None)
    if product:
        return jsonify(product)
    else:
        # Return a 404 Not Found error if the product doesn't exist
        return jsonify({"error": "Product not found"}), 404
```

Now you can go to `/api/products/1` to get the laptop, or `/api/products/2` to get the mouse.

## 💻 Exercises: Day 34

1. **Create a Basic API Server:**

   - Create a file named `my_api.py`.
   - Set up a basic Flask application.
   - Create a root endpoint `/` that returns a simple welcome message like "Welcome to the Company Data API".

1. **Serve Employee Data:**

   - Inside your `my_api.py` script, create a list of employee dictionaries. Each employee should have an `id`, `name`, and `department`.
   - Create a new endpoint at `/api/employees`.
   - When a `GET` request is made to this endpoint, it should return the full list of employees as a JSON response.

1. **Serve a Single Employee's Data:**

   - Create a dynamic route `/api/employees/<int:employee_id>`.
   - This endpoint should find the employee with the matching ID from your list.
   - If the employee is found, return their data as a JSON object.
   - If no employee with that ID is found, return a JSON error message with a 404 status code.

🎉 **Incredible!** You've just learned how to build a web API. This is a massive step. It bridges the gap between performing analysis for yourself and providing data and services to others, forming the backbone of modern data applications and microservices.

## Running the Development Server

The lesson's reference implementation exposes a `create_app()` factory in `api_server.py`. You can start the local development server with:

```bash
export FLASK_APP=Day_34_Building_an_API.api_server:create_app
flask run --debug
```

The `--debug` flag enables auto-reload and better error messages while you iterate on your API. Flask will serve the application on `http://127.0.0.1:5000/` by default.

## Running the Tests

Pytest is configured to exercise the API endpoints. From the repository root, run:

```bash
pytest tests/test_day_34.py
```

The tests use Flask's test client to verify that the root page and JSON endpoints respond with the expected payloads and HTTP status codes.

## Why Use an Application Factory?

The application factory pattern encapsulates all app configuration inside a function. This makes it easy to:

- Create multiple instances of the app with different settings (e.g., testing versus production).
- Avoid running application code at import time, which keeps tools like the Flask CLI and pytest fast.
- Improve modularity by cleanly separating data configuration from route registration.

Because `create_app()` returns a fully configured Flask instance, you can reuse it for development, testing, or even deployment without duplicating setup code.

## Additional Materials

- **api_server.ipynb**  
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_34_Building_an_API/api_server.ipynb){ .md-button } 
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_34_Building_an_API/api_server.ipynb){ .md-button .md-button--primary } 
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_34_Building_an_API/api_server.ipynb){ .md-button }
- **data.ipynb**  
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_34_Building_an_API/data.ipynb){ .md-button } 
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_34_Building_an_API/data.ipynb){ .md-button .md-button--primary } 
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_34_Building_an_API/data.ipynb){ .md-button }
- **solutions.ipynb**  
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_34_Building_an_API/solutions.ipynb){ .md-button } 
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_34_Building_an_API/solutions.ipynb){ .md-button .md-button--primary } 
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_34_Building_an_API/solutions.ipynb){ .md-button }

???+ example "api_server.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_34_Building_an_API/api_server.py)

    ```python title="api_server.py"
    """Day 34: Building a Simple API with Flask.

    This module exposes a Flask application factory that serves sample
    business data in JSON format.
    """

    from flask import Flask, jsonify

    try:
        from Day_34_Building_an_API.data import EMPLOYEES, PRODUCTS
    except ImportError:
        from data import EMPLOYEES, PRODUCTS


    def create_app() -> Flask:
        """Create and configure the Flask application for the sample API."""
        app = Flask(__name__)

        app.config["PRODUCTS"] = PRODUCTS
        app.config["EMPLOYEES"] = EMPLOYEES

        @app.route("/")
        def home():
            return (
                "<h1>Welcome to the Company Data API</h1>"
                "<p>Use endpoints like /api/v1/products to get data.</p>"
            )

        @app.route("/api/v1/products", methods=["GET"])
        def get_all_products():
            """Return the full list of products as JSON."""
            return jsonify(app.config["PRODUCTS"])

        @app.route("/api/v1/products/<int:product_id>", methods=["GET"])
        def get_single_product(product_id):
            """Return a single product matching the given ID."""
            products = app.config["PRODUCTS"]
            product = next((p for p in products if p["id"] == product_id), None)

            if product:
                return jsonify(product)
            return jsonify({"error": "Product not found"}), 404

        @app.route("/api/v1/employees", methods=["GET"])
        def get_all_employees():
            """Return the full list of employees as JSON."""
            return jsonify(app.config["EMPLOYEES"])

        return app


    app = create_app()


    if __name__ == "__main__":
        import os

        # Skip running the server in test/automated environments
        if os.environ.get("FLASK_RUN_TEST_MODE") != "1":
            app.run(host="0.0.0.0", port=5000, debug=True)
        else:
            print("Flask app created successfully (test mode - not starting server)")
            print("Routes available:")
            print("  - GET /")
            print("  - GET /api/v1/products")
            print("  - GET /api/v1/products/<id>")
            print("  - GET /api/v1/employees")
    ```

???+ example "data.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_34_Building_an_API/data.py)

    ```python title="data.py"
    """Sample data used by the Day 34 Flask API."""

    PRODUCTS = [
        {"id": 1, "name": "Laptop", "price": 1200, "category": "Electronics"},
        {"id": 2, "name": "Mouse", "price": 25, "category": "Peripherals"},
        {"id": 3, "name": "Keyboard", "price": 75, "category": "Peripherals"},
    ]

    EMPLOYEES = [
        {"id": 101, "name": "Alice", "department": "Sales"},
        {"id": 102, "name": "Bob", "department": "Engineering"},
    ]
    ```

???+ example "solutions.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_34_Building_an_API/solutions.py)

    ```python title="solutions.py"
    """
    Day 34: Solutions to Exercises

    This single file contains the complete solution for all three
    exercises, as they build upon each other.
    """

    from flask import Flask, jsonify

    # --- Exercise 1: Create a Basic API Server ---
    app = Flask(__name__)


    @app.route("/")
    def home():
        """Returns a simple welcome message for the root URL."""
        return "Welcome to the Company Data API"


    # --- Exercise 2: Serve Employee Data ---
    # Sample data for the API
    EMPLOYEES = [
        {"id": 1, "name": "John Doe", "department": "Sales"},
        {"id": 2, "name": "Jane Smith", "department": "Engineering"},
        {"id": 3, "name": "Peter Jones", "department": "Marketing"},
        {"id": 4, "name": "Lisa Ray", "department": "Sales"},
    ]


    @app.route("/api/employees", methods=["GET"])
    def get_employees():
        """Returns the full list of employees as JSON."""
        return jsonify(EMPLOYEES)


    # --- Exercise 3: Serve a Single Employee's Data ---
    @app.route("/api/employees/<int:employee_id>", methods=["GET"])
    def get_employee(employee_id):
        """
        Returns data for a single employee based on their ID.
        Returns a 404 error if the employee is not found.
        """
        # Find the employee in the list
        employee = next((emp for emp in EMPLOYEES if emp["id"] == employee_id), None)

        if employee:
            return jsonify(employee)
        else:
            # Return a JSON error message and a 404 status code
            error_message = {"error": f"Employee with ID {employee_id} not found."}
            return jsonify(error_message), 404


    if __name__ == "__main__":
        # To run this API server:
        # 1. Save the code as a Python file (e.g., 'my_api.py').
        # 2. Run from your terminal: python my_api.py
        # 3. Open your web browser or an API tool like Postman.
        # 4. Navigate to URLs like:
        #    - http://127.0.0.1:5000/
        #    - http://127.0.0.1:5000/api/employees
        #    - http://127.0.0.1:5000/api/employees/2
        #    - http://127.0.0.1:5000/api/employees/99 (to see the 404 error)

        import os

        # Skip running the server in test/automated environments
        if os.environ.get("FLASK_RUN_TEST_MODE") != "1":
            # Only enable debug mode if explicitly requested via FLASK_DEBUG
            app.run(debug=os.environ.get("FLASK_DEBUG") == "1")
        else:
            print("Flask app created successfully (test mode - not starting server)")
            print("Routes available:")
            print("  - GET /")
            print("  - GET /api/employees")
            print("  - GET /api/employees/<id>")
    ```
