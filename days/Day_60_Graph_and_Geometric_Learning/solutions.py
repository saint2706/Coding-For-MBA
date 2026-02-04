"""Graph neural network helpers for Day 60."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List

import numpy as np


@dataclass
class GraphData:
    """Simple container for toy graph node classification tasks."""

    features: np.ndarray
    adjacency: np.ndarray
    labels: np.ndarray


def build_toy_graph() -> GraphData:
    """Create a reproducible toy graph with two communities."""

    features = np.array(
        [
            [1.0, 0.2, 0.8],
            [0.9, 0.1, 0.7],
            [1.1, 0.25, 0.9],
            [-0.2, 1.0, 0.1],
            [-0.1, 0.9, 0.2],
            [-0.3, 1.1, 0.15],
        ],
        dtype=float,
    )
    labels = np.array([0, 0, 0, 1, 1, 1], dtype=int)
    adjacency = np.array(
        [
            [1, 1, 1, 0, 0, 0],
            [1, 1, 1, 0, 0, 0],
            [1, 1, 1, 0, 0, 1],
            [0, 0, 0, 1, 1, 1],
            [0, 0, 0, 1, 1, 1],
            [0, 0, 1, 1, 1, 1],
        ],
        dtype=float,
    )
    adjacency = adjacency + np.eye(adjacency.shape[0]) * 0.0  # ensure float copy
    return GraphData(features=features, adjacency=adjacency, labels=labels)


def _softmax(logits: np.ndarray) -> np.ndarray:
    logits = logits - logits.max(axis=1, keepdims=True)
    exp = np.exp(logits)
    exp /= exp.sum(axis=1, keepdims=True)
    return exp


class GraphSAGEClassifier:
    """Mean-aggregator GraphSAGE classifier with manual gradients."""

    def __init__(
        self, hidden_dim: int = 6, num_classes: int = 2, random_state: int = 60
    ) -> None:
        self.hidden_dim = hidden_dim
        self.num_classes = num_classes
        self.random_state = random_state
        self.W_self: np.ndarray | None = None
        self.W_neigh: np.ndarray | None = None
        self.b_hidden: np.ndarray | None = None
        self.W_out: np.ndarray | None = None
        self.b_out: np.ndarray | None = None

    def _ensure_params(self, input_dim: int) -> None:
        if self.W_self is not None:
            return
        rng = np.random.default_rng(self.random_state)
        self.W_self = rng.normal(0.0, 0.4, size=(input_dim, self.hidden_dim))
        self.W_neigh = rng.normal(0.0, 0.4, size=(input_dim, self.hidden_dim))
        self.b_hidden = np.zeros(self.hidden_dim)
        self.W_out = rng.normal(0.0, 0.4, size=(self.hidden_dim, self.num_classes))
        self.b_out = np.zeros(self.num_classes)

    def forward(self, data: GraphData) -> Dict[str, np.ndarray]:
        assert self.W_self is not None and self.W_neigh is not None
        assert (
            self.b_hidden is not None
            and self.W_out is not None
            and self.b_out is not None
        )
        features = data.features
        adjacency = data.adjacency
        degrees = adjacency.sum(axis=1, keepdims=True)
        degrees[degrees == 0] = 1.0
        neigh_mean = adjacency @ features / degrees
        hidden_pre = features @ self.W_self + neigh_mean @ self.W_neigh + self.b_hidden
        hidden = np.maximum(0.0, hidden_pre)
        logits = hidden @ self.W_out + self.b_out
        probs = _softmax(logits)
        return {
            "logits": logits,
            "hidden": hidden,
            "hidden_pre": hidden_pre,
            "neigh": neigh_mean,
            "probs": probs,
        }

    def train(self, data: GraphData, epochs: int = 200, lr: float = 0.1) -> List[float]:
        self._ensure_params(data.features.shape[1])
        assert self.W_self is not None and self.W_neigh is not None
        assert (
            self.b_hidden is not None
            and self.W_out is not None
            and self.b_out is not None
        )
        y = data.labels
        y_onehot = np.eye(self.num_classes)[y]
        losses: List[float] = []
        for _ in range(epochs):
            forward = self.forward(data)
            probs = forward["probs"]
            loss = float(-np.sum(y_onehot * np.log(probs + 1e-9)) / y.shape[0])
            losses.append(loss)

            grad_logits = (probs - y_onehot) / y.shape[0]
            grad_W_out = forward["hidden"].T @ grad_logits
            grad_b_out = grad_logits.sum(axis=0)
            grad_hidden = grad_logits @ self.W_out.T
            grad_hidden_pre = grad_hidden * (forward["hidden_pre"] > 0)

            grad_W_self = data.features.T @ grad_hidden_pre
            grad_W_neigh = forward["neigh"].T @ grad_hidden_pre
            grad_b_hidden = grad_hidden_pre.sum(axis=0)

            self.W_out -= lr * grad_W_out
            self.b_out -= lr * grad_b_out
            self.W_self -= lr * grad_W_self
            self.W_neigh -= lr * grad_W_neigh
            self.b_hidden -= lr * grad_b_hidden
        return losses

    def predict(self, data: GraphData) -> np.ndarray:
        probs = self.forward(data)["probs"]
        return probs.argmax(axis=1)

    def accuracy(self, data: GraphData) -> float:
        preds = self.predict(data)
        return float((preds == data.labels).mean())


class GraphAttentionClassifier:
    """Attention-based aggregator with trainable linear head."""

    def __init__(
        self, temperature: float = 0.5, num_classes: int = 2, random_state: int = 60
    ) -> None:
        self.temperature = temperature
        self.num_classes = num_classes
        self.random_state = random_state
        self.W_out: np.ndarray | None = None
        self.b_out: np.ndarray | None = None
        self._embeddings: np.ndarray | None = None
        self._attention: np.ndarray | None = None

    def _attention_matrix(
        self, features: np.ndarray, adjacency: np.ndarray
    ) -> np.ndarray:
        sim = (features @ features.T) / self.temperature
        sim -= sim.max(axis=1, keepdims=True)
        weights = np.exp(sim)
        masked = weights * adjacency
        normaliser = masked.sum(axis=1, keepdims=True)
        normaliser[normaliser == 0] = 1.0
        return masked / normaliser

    def encode(self, data: GraphData) -> np.ndarray:
        adjacency = data.adjacency.copy()
        np.fill_diagonal(adjacency, 1.0)
        attn = self._attention_matrix(data.features, adjacency)
        self._attention = attn
        embeddings = attn @ data.features
        self._embeddings = embeddings
        return embeddings

    def train(self, data: GraphData, epochs: int = 200, lr: float = 0.1) -> List[float]:
        embeddings = self.encode(data)
        if self.W_out is None or self.b_out is None:
            rng = np.random.default_rng(self.random_state)
            self.W_out = rng.normal(
                0.0, 0.4, size=(embeddings.shape[1], self.num_classes)
            )
            self.b_out = np.zeros(self.num_classes)
        assert self.W_out is not None and self.b_out is not None
        y = data.labels
        y_onehot = np.eye(self.num_classes)[y]
        losses: List[float] = []
        for _ in range(epochs):
            logits = embeddings @ self.W_out + self.b_out
            probs = _softmax(logits)
            loss = float(-np.sum(y_onehot * np.log(probs + 1e-9)) / y.shape[0])
            losses.append(loss)

            grad_logits = (probs - y_onehot) / y.shape[0]
            grad_W_out = embeddings.T @ grad_logits
            grad_b_out = grad_logits.sum(axis=0)
            self.W_out -= lr * grad_W_out
            self.b_out -= lr * grad_b_out
        return losses

    def predict(self, data: GraphData) -> np.ndarray:
        embeddings = self.encode(data) if self._embeddings is None else self._embeddings
        assert self.W_out is not None and self.b_out is not None
        logits = embeddings @ self.W_out + self.b_out
        probs = _softmax(logits)
        return probs.argmax(axis=1)

    def attention_matrix(self, data: GraphData) -> np.ndarray:
        if self._attention is None:
            self.encode(data)
        assert self._attention is not None
        return self._attention

    def accuracy(self, data: GraphData) -> float:
        preds = self.predict(data)
        return float((preds == data.labels).mean())


def train_node_classifiers(random_state: int = 60) -> Dict[str, object]:
    """Train both GraphSAGE and graph attention classifiers on the toy graph."""

    data = build_toy_graph()
    sage = GraphSAGEClassifier(random_state=random_state)
    gat = GraphAttentionClassifier(random_state=random_state)
    sage_losses = sage.train(data, epochs=200, lr=0.1)
    gat_losses = gat.train(data, epochs=200, lr=0.1)
    results = {
        "graphsage_accuracy": sage.accuracy(data),
        "gat_accuracy": gat.accuracy(data),
        "graphsage_losses": sage_losses,
        "gat_losses": gat_losses,
        "attention_matrix": gat.attention_matrix(data),
    }
    return results


def _demo() -> None:
    results = train_node_classifiers()
    print(
        f"GraphSAGE accuracy: {results['graphsage_accuracy']:.3f} | GAT accuracy: {results['gat_accuracy']:.3f}"
    )
    print(f"Attention matrix row sums: {results['attention_matrix'].sum(axis=1)}")


if __name__ == "__main__":
    _demo()
