"""Transformer helpers and deterministic classifier for Day 58."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, Iterable, List, Sequence, Tuple

import numpy as np


@dataclass
class TransformerConfig:
    """Configuration for the tiny encoder–decoder demonstration."""

    vocab_size: int = 16
    d_model: int = 8
    num_heads: int = 2
    ff_dim: int = 16


@dataclass
class EncoderDecoderStates:
    """Container capturing intermediate encoder/decoder representations."""

    encoder_hidden: np.ndarray
    decoder_hidden: np.ndarray
    cross_attention: np.ndarray


DEFAULT_VOCAB: Tuple[str, ...] = (
    "<pad>",
    "<unk>",
    "great",
    "bad",
    "product",
    "service",
    "love",
    "hate",
    "fast",
    "slow",
    "support",
    "terrible",
    "amazing",
    "not",
    "boring",
    "exciting",
)
DEFAULT_LABELS: Tuple[str, ...] = ("negative", "positive")


class TinyTransformerClassifier:
    """Deterministic self-attention classifier for miniature datasets."""

    def __init__(
        self,
        vocab: Sequence[str] | None = None,
        labels: Sequence[str] | None = None,
        config: TransformerConfig | None = None,
        random_state: int = 58,
    ) -> None:
        self.config = config or TransformerConfig(vocab_size=len(DEFAULT_VOCAB))
        self.vocab_tokens = tuple(vocab) if vocab is not None else DEFAULT_VOCAB
        self.labels = tuple(labels) if labels is not None else DEFAULT_LABELS
        self.token_to_id: Dict[str, int] = {
            token: idx for idx, token in enumerate(self.vocab_tokens)
        }
        if "<unk>" not in self.token_to_id:
            self.token_to_id["<unk>"] = len(self.token_to_id)
        rng = np.random.default_rng(random_state)

        vocab_size = len(self.token_to_id)
        d_model = self.config.d_model
        ff_dim = self.config.ff_dim
        self.embed = rng.normal(0.0, 0.2, size=(vocab_size, d_model))
        self.W_q = rng.normal(0.0, 0.3, size=(d_model, d_model))
        self.W_k = rng.normal(0.0, 0.3, size=(d_model, d_model))
        self.W_v = rng.normal(0.0, 0.3, size=(d_model, d_model))
        self.W_o = rng.normal(0.0, 0.2, size=(d_model, d_model))
        self.ff_w1 = rng.normal(0.0, 0.2, size=(d_model, ff_dim))
        self.ff_b1 = rng.normal(0.0, 0.1, size=(ff_dim,))
        self.ff_w2 = rng.normal(0.0, 0.2, size=(ff_dim, d_model))
        self.ff_b2 = rng.normal(0.0, 0.05, size=(d_model,))
        self.classifier_w = rng.normal(0.0, 0.4, size=(d_model, len(self.labels)))
        self.classifier_b = rng.normal(0.0, 0.1, size=(len(self.labels),))
        sentiment = {
            "great": 1.1,
            "amazing": 1.0,
            "love": 1.2,
            "fast": 0.6,
            "support": 0.5,
            "bad": -1.0,
            "terrible": -1.3,
            "hate": -1.2,
            "slow": -0.8,
            "boring": -0.7,
            "not": -0.4,
            "service": -0.1,
        }
        self.sentiment_vector = np.zeros(vocab_size)
        for token, weight in sentiment.items():
            idx = self.token_to_id.get(token)
            if idx is not None:
                self.sentiment_vector[idx] = weight
        self.lexicon_scale = 0.6

    # ------------------------------------------------------------------
    # Tokenisation utilities
    # ------------------------------------------------------------------
    def tokenize(self, text: str) -> List[int]:
        """Convert raw text into token ids."""

        tokens = text.lower().replace("!", " ").replace("?", " ").split()
        unk_id = self.token_to_id["<unk>"]
        return [self.token_to_id.get(token, unk_id) for token in tokens]

    def pad(self, token_ids: Sequence[int], length: int) -> np.ndarray:
        """Pad or truncate token ids to the provided length."""

        pad_id = self.token_to_id.get("<pad>", 0)
        output = np.full(length, pad_id, dtype=int)
        seq = np.asarray(token_ids[:length], dtype=int)
        output[: seq.size] = seq
        return output

    # ------------------------------------------------------------------
    # Transformer block
    # ------------------------------------------------------------------
    def _reshape_for_heads(self, array: np.ndarray) -> np.ndarray:
        """Reshape (seq, d_model) into (num_heads, seq, head_dim)."""

        seq_len, d_model = array.shape
        head_dim = d_model // self.config.num_heads
        reshaped = array.reshape(seq_len, self.config.num_heads, head_dim)
        return np.transpose(reshaped, (1, 0, 2))

    def _combine_heads(self, array: np.ndarray) -> np.ndarray:
        """Combine (num_heads, seq, head_dim) into (seq, d_model)."""

        num_heads, seq_len, head_dim = array.shape
        combined = np.transpose(array, (1, 0, 2)).reshape(seq_len, num_heads * head_dim)
        return combined

    def _scaled_dot_product(
        self, q: np.ndarray, k: np.ndarray, v: np.ndarray
    ) -> Tuple[np.ndarray, np.ndarray]:
        """Compute scaled dot-product attention for a single head."""

        scale = np.sqrt(q.shape[-1]).astype(float)
        scores = (q @ k.T) / scale
        scores -= scores.max(axis=-1, keepdims=True)
        weights = np.exp(scores)
        weights /= weights.sum(axis=-1, keepdims=True)
        attended = weights @ v
        return attended, weights

    def _self_attention(self, embeddings: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """Apply multi-head self-attention to the token embeddings."""

        query = embeddings @ self.W_q
        key = embeddings @ self.W_k
        value = embeddings @ self.W_v

        q_heads = self._reshape_for_heads(query)
        k_heads = self._reshape_for_heads(key)
        v_heads = self._reshape_for_heads(value)

        outputs = []
        attn_scores = []
        for head in range(self.config.num_heads):
            attended, weights = self._scaled_dot_product(
                q_heads[head], k_heads[head], v_heads[head]
            )
            outputs.append(attended)
            attn_scores.append(weights)
        concat = self._combine_heads(np.stack(outputs, axis=0))
        attn_matrix = np.stack(attn_scores, axis=0)
        transformed = concat @ self.W_o
        return transformed, attn_matrix

    def _feed_forward(self, tensor: np.ndarray) -> np.ndarray:
        hidden = np.maximum(0.0, tensor @ self.ff_w1 + self.ff_b1)
        return hidden @ self.ff_w2 + self.ff_b2

    def forward(self, token_ids: Sequence[int]) -> Tuple[np.ndarray, np.ndarray]:
        """Run the transformer block and return logits and attention."""

        if not token_ids:
            token_ids = [self.token_to_id.get("<pad>", 0)]
        ids = np.asarray(token_ids, dtype=int)
        embeddings = self.embed[ids]
        attn_output, attn_weights = self._self_attention(embeddings)
        transformed = self._feed_forward(attn_output)
        pooled = transformed.mean(axis=0)
        logits = pooled @ self.classifier_w + self.classifier_b
        lexicon_boost = float(np.sum(self.sentiment_vector[ids]))
        if logits.shape[0] >= 2:
            logits = logits.copy()
            logits[0] -= self.lexicon_scale * lexicon_boost
            logits[1] += self.lexicon_scale * lexicon_boost
        return logits, attn_weights

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------
    def predict_proba(self, text: str) -> Dict[str, float]:
        """Return class probabilities for the given text."""

        token_ids = self.tokenize(text)
        logits, _ = self.forward(token_ids)
        logits = logits - logits.max()
        probs = np.exp(logits)
        probs /= probs.sum()
        return {label: float(prob) for label, prob in zip(self.labels, probs)}

    def classify(self, text: str) -> str:
        """Return the most likely label for a text sequence."""

        probs = self.predict_proba(text)
        return max(probs, key=probs.get)

    def attention_heatmap(self, text: str) -> np.ndarray:
        """Return average attention weights across heads for inspection."""

        token_ids = self.tokenize(text)
        _, attn = self.forward(token_ids)
        return attn.mean(axis=0)


def build_encoder_decoder_stack(
    source_tokens: Sequence[int],
    target_tokens: Sequence[int],
    config: TransformerConfig | None = None,
    random_state: int = 58,
) -> EncoderDecoderStates:
    """Run a compact encoder–decoder simulation and return states."""

    cfg = config or TransformerConfig()
    rng = np.random.default_rng(random_state)
    d_model = cfg.d_model
    num_heads = cfg.num_heads

    def multi_head(
        x: np.ndarray, W_q: np.ndarray, W_k: np.ndarray, W_v: np.ndarray
    ) -> np.ndarray:
        seq_len = x.shape[0]
        q = x @ W_q
        k = x @ W_k
        v = x @ W_v
        head_dim = d_model // num_heads
        q = q.reshape(seq_len, num_heads, head_dim).transpose(1, 0, 2)
        k = k.reshape(seq_len, num_heads, head_dim).transpose(1, 0, 2)
        v = v.reshape(seq_len, num_heads, head_dim).transpose(1, 0, 2)
        outputs = []
        for head in range(num_heads):
            scale = np.sqrt(head_dim)
            weights = (q[head] @ k[head].T) / scale
            weights -= weights.max(axis=-1, keepdims=True)
            prob = np.exp(weights)
            prob /= prob.sum(axis=-1, keepdims=True)
            outputs.append(prob @ v[head])
        concat = np.stack(outputs, axis=1).reshape(seq_len, d_model)
        return concat

    vocab_size = cfg.vocab_size
    encoder_embed = rng.normal(0.0, 0.4, size=(vocab_size, d_model))
    decoder_embed = rng.normal(0.0, 0.4, size=(vocab_size, d_model))

    encoder_inp = encoder_embed[np.asarray(source_tokens, dtype=int)]
    decoder_inp = decoder_embed[np.asarray(target_tokens, dtype=int)]

    W_q = rng.normal(0.0, 0.3, size=(d_model, d_model))
    W_k = rng.normal(0.0, 0.3, size=(d_model, d_model))
    W_v = rng.normal(0.0, 0.3, size=(d_model, d_model))
    encoder_hidden = multi_head(encoder_inp, W_q, W_k, W_v)

    cross_W_q = rng.normal(0.0, 0.3, size=(d_model, d_model))
    cross_W_k = rng.normal(0.0, 0.3, size=(d_model, d_model))
    cross_W_v = rng.normal(0.0, 0.3, size=(d_model, d_model))

    decoder_self = multi_head(decoder_inp, W_q, W_k, W_v)
    seq_len_t = decoder_inp.shape[0]
    q = (
        (decoder_self @ cross_W_q)
        .reshape(seq_len_t, num_heads, d_model // num_heads)
        .transpose(1, 0, 2)
    )
    k = (
        (encoder_hidden @ cross_W_k)
        .reshape(encoder_hidden.shape[0], num_heads, d_model // num_heads)
        .transpose(1, 0, 2)
    )
    v = (
        (encoder_hidden @ cross_W_v)
        .reshape(encoder_hidden.shape[0], num_heads, d_model // num_heads)
        .transpose(1, 0, 2)
    )

    cross_outputs = []
    for head in range(num_heads):
        scale = np.sqrt(d_model // num_heads)
        weights = (q[head] @ k[head].T) / scale
        weights -= weights.max(axis=-1, keepdims=True)
        prob = np.exp(weights)
        prob /= prob.sum(axis=-1, keepdims=True)
        cross_outputs.append(prob @ v[head])
    cross_attention = np.stack(cross_outputs, axis=0)
    decoder_hidden = cross_attention.transpose(1, 0, 2).reshape(seq_len_t, d_model)

    return EncoderDecoderStates(
        encoder_hidden=encoder_hidden,
        decoder_hidden=decoder_hidden,
        cross_attention=cross_attention,
    )


def fine_tuning_playbook(
    base_model: str = "distilbert-base-uncased",
    lr: float = 2e-5,
    weight_decay: float = 0.01,
    epochs: int = 3,
) -> Dict[str, object]:
    """Return a Hugging Face style fine-tuning recipe for documentation."""

    schedule = [
        {
            "phase": 1,
            "frozen_layers": "embeddings+encoder[:2]",
            "learning_rate": lr / 10,
        },
        {"phase": 2, "frozen_layers": "encoder[:1]", "learning_rate": lr},
        {"phase": 3, "adapter": "LoRA rank=4", "learning_rate": lr * 1.5},
    ]
    return {
        "model": base_model,
        "epochs": epochs,
        "weight_decay": weight_decay,
        "discriminative_lrs": schedule,
        "evaluation_strategy": "epoch",
        "gradient_accumulation_steps": 2,
    }


def demo_attention_visualisation(
    text: str, classifier: TinyTransformerClassifier | None = None
) -> Dict[str, object]:
    """Return attention weights and tokens for plotting."""

    clf = classifier or TinyTransformerClassifier()
    token_ids = clf.tokenize(text)
    heatmap = clf.attention_heatmap(text)
    tokens = [
        clf.vocab_tokens[idx] if idx < len(clf.vocab_tokens) else "<extra>"
        for idx in token_ids
    ]
    return {"tokens": tokens, "attention": heatmap}


def run_demo_classification(
    texts: Iterable[str], classifier: TinyTransformerClassifier | None = None
) -> List[Dict[str, object]]:
    """Score a batch of texts with deterministic predictions and attention."""

    clf = classifier or TinyTransformerClassifier()
    outputs: List[Dict[str, object]] = []
    for text in texts:
        probs = clf.predict_proba(text)
        heatmap = clf.attention_heatmap(text)
        outputs.append(
            {
                "text": text,
                "prediction": clf.classify(text),
                "probs": probs,
                "attention": heatmap,
            }
        )
    return outputs


def _demo() -> None:
    classifier = TinyTransformerClassifier()
    texts = ["Great product and amazing support", "Terrible and slow service"]
    reports = run_demo_classification(texts, classifier)
    for report in reports:
        print(f"Text: {report['text']}")
        print(f"Prediction: {report['prediction']} – probs: {report['probs']}")
        print(f"Attention shape: {report['attention'].shape}\n")


if __name__ == "__main__":
    _demo()
