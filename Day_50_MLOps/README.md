# Day 50: MLOps - Model Deployment

Welcome to our final day, Day 50! Today, we touch upon **MLOps (Machine Learning Operations)**, which focuses on the practical side of deploying, monitoring, and maintaining machine learning models in production environments. Our focus will be on a crucial first step: **saving and loading a trained model**.

## Key Concepts

### What is MLOps?

MLOps is a set of practices that aims to deploy and maintain machine learning models in production reliably and efficiently. It's the intersection of Machine Learning, DevOps, and Data Engineering.

**Key MLOps concerns include:**

- **Model Deployment:** How do you make your trained model available to users or other systems?
- **Automation:** Automating the ML workflow from data ingestion to model training and deployment.
- **Monitoring:** Tracking the model's performance in production to detect degradation or drift.
- **Scalability & Reproducibility:** Ensuring your system can handle load and that your experiments can be reproduced.

### Saving and Loading Models

Before you can deploy a model, you need to save its learned state (the weights, parameters, etc.). This process is often called **serialization**. Once saved, the model can be loaded into another environment (like a web server) to make predictions without needing to be retrained.

- **For Scikit-learn:** The standard way is to use Python's `pickle` module or the more efficient `joblib` library. `joblib` is often preferred for objects that carry large NumPy arrays.

- **For TensorFlow/Keras:** TensorFlow has its own built-in saving and loading functionality (`model.save()` and `tf.keras.models.load_model()`). It can save the model's architecture, weights, and training configuration all in one place.

### Serving a Model via a Web API

A common way to deploy a model is to wrap it in a web API.

1. A client (e.g., a web or mobile app) sends a POST request with new data to an API endpoint (e.g., `/predict`).
1. The server, running a web framework like **Flask** or **FastAPI**, receives the data.
1. The server loads the saved model and uses it to make a prediction on the data.
1. The prediction is sent back to the client in the API response (usually in JSON format).

______________________________________________________________________

## Practice Exercise

- The `solutions.py` file demonstrates the basic workflow of saving and loading a `scikit-learn` model using `joblib`.
- The `bonus_flask_api.py` file provides a simple example of how you could serve this saved model using the Flask web framework.
- The code covers:
  1. Training a simple model on the Iris dataset.
  1. Saving the trained model to a file (`iris_model.joblib`).
  1. Loading the model back from the file and using it to make a new prediction.
  1. (Bonus) A minimal Flask app that loads the model and exposes a `/predict` endpoint.

Review the code to understand the fundamental step of model persistence, which is the gateway to model deployment.
