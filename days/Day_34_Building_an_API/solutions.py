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
