import joblib
from flask import Flask, jsonify, request

# NOTE: To run this script, you need to install Flask:
# pip install Flask

# 1. Initialize the Flask app
app = Flask(__name__)

# 2. Load the trained model
# This is done once when the app starts.
model_filename = "iris_model.joblib"
try:
    model = joblib.load(model_filename)
    print(f"Model '{model_filename}' loaded successfully.")
except FileNotFoundError:
    print(
        f"Error: Model file '{model_filename}' not found. Please run solutions.py first."
    )
    model = None


# 3. Define the prediction endpoint
@app.route("/predict", methods=["POST"])
def predict():
    """
    Receives a POST request with JSON data and returns a prediction.
    """
    if model is None:
        return jsonify({"error": "Model not loaded"}), 500

    # Get the JSON data from the request
    data = request.get_json()

    # Basic validation
    if not data or "features" not in data:
        return jsonify({"error": "Invalid input: 'features' key not found"}), 400

    try:
        # Extract features and convert to a list of lists for prediction
        features = [data["features"]]

        # Make a prediction
        prediction_index = model.predict(features)

        # Get the class name from the index
        iris_target_names = [
            "setosa",
            "versicolor",
            "virginica",
        ]  # In a real app, load this properly
        predicted_class = iris_target_names[prediction_index[0]]

        # Return the result as JSON
        return jsonify(
            {
                "prediction": predicted_class,
                "prediction_index": int(prediction_index[0]),
            }
        )

    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500


# --- How to Run This API ---
# 1. Make sure 'iris_model.joblib' exists by running solutions.py.
# 2. Run this script from your terminal: `python bonus_flask_api.py`
# 3. The server will start, usually on http://127.0.0.1:5000.
#
# --- How to Test This API ---
# You can use a tool like 'curl' from another terminal:
#
# curl -X POST http://127.0.0.1:5000/predict \
# -H "Content-Type: application/json" \
# -d '{"features": [6.0, 2.5, 4.5, 1.5]}'
#
# Expected Response:
# {
#   "prediction": "versicolor",
#   "prediction_index": 1
# }

if __name__ == "__main__":
    # The `debug=True` flag allows for auto-reloading when you save changes.
    # Do not use `debug=True` in a production environment.
    import os
    
    # Skip running the server in test/automated environments
    if os.environ.get("FLASK_RUN_TEST_MODE") != "1":
        app.run(debug=False)
    else:
        print("Flask app created successfully (test mode - not starting server)")
        print("Model loaded:" if model is not None else "Model not loaded")
        print("Routes available:")
        print("  - POST /predict")
