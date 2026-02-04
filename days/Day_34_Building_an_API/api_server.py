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
