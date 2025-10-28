---
title: "Day 64 \u2013 Modern NLP Pipelines"
tags:
- Advanced
- MLOps
- NLP
---

Connect discrete NLP components into a reproducible workflow. After this lesson you will:

- Tokenize text with configurable normalization options.
- Build deterministic embedding tables for rapid experimentation.
- Fine-tune a lightweight transformer-style classifier head on sentence labels.
- Retrieve support passages and perform retrieval-augmented generation (RAG).
- Evaluate generations with deterministic exact-match and token-overlap metrics.

Run `python Day_64_Modern_NLP_Pipelines/solutions.py` to explore end-to-end text processing with
seeded toy corpora.

<!-- LESSON_FOOTER_START -->

---

**Previous:** [Day 63 – Day 63 – Causal Inference and Uplift Modeling](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_63_Causal_Inference_and_Uplift/README.md) • **Next:** [Day 65 – Day 65 – MLOps Pipelines and CI/CD Automation](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_65_MLOps_Pipelines_and_CI/README.md)

_You are on lesson 64 of 108._

<!-- LESSON_FOOTER_END -->

## Additional Materials

- **solutions.ipynb**
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_64_Modern_NLP_Pipelines/solutions.ipynb){ .md-button }
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_64_Modern_NLP_Pipelines/solutions.ipynb){ .md-button .md-button--primary }
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_64_Modern_NLP_Pipelines/solutions.ipynb){ .md-button }

???+ example "solutions.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_64_Modern_NLP_Pipelines/solutions.py)

    ```python title="solutions.py"
    """Modern NLP pipeline utilities for Day 64."""

    from __future__ import annotations

    import hashlib
    from dataclasses import dataclass
    from typing import Dict, List, Mapping, Sequence, Tuple

    import numpy as np

    TokenizedCorpus = List[List[str]]


    def tokenize_corpus(
        corpus: Sequence[str],
        *,
        lowercase: bool = True,
        strip_punctuation: bool = True,
    ) -> TokenizedCorpus:
        """Tokenize strings with deterministic options."""

        table = str.maketrans({c: " " for c in "!,.?;:"}) if strip_punctuation else None
        tokenized: TokenizedCorpus = []
        for doc in corpus:
            text = doc.translate(table) if table is not None else doc
            if lowercase:
                text = text.lower()
            tokens = [token for token in text.split() if token]
            tokenized.append(tokens)
        return tokenized


    def build_embedding_table(
        tokens: TokenizedCorpus, embedding_dim: int = 8
    ) -> Dict[str, np.ndarray]:
        """Create deterministic embeddings via hashing."""

        vocab = sorted({token for doc in tokens for token in doc})
        table: Dict[str, np.ndarray] = {}
        for token in vocab:
            digest = hashlib.sha256(token.encode("utf-8")).digest()
            seed = int.from_bytes(digest[:4], "little")
            rng = np.random.default_rng(seed)
            table[token] = rng.normal(0, 1, size=embedding_dim)
        return table


    def document_embeddings(
        tokens: TokenizedCorpus, embeddings: Mapping[str, np.ndarray]
    ) -> np.ndarray:
        """Average token embeddings for each document."""

        doc_vectors: List[np.ndarray] = []
        for doc in tokens:
            if doc:
                vecs = [embeddings[token] for token in doc]
                doc_vectors.append(np.mean(vecs, axis=0))
            else:
                doc_vectors.append(
                    np.zeros(next(iter(embeddings.values())).shape, dtype=float)
                )
        return np.vstack(doc_vectors)


    @dataclass
    class MiniTransformer:
        """Lightweight classifier head operating on document embeddings."""

        weights: np.ndarray
        bias: float

        def predict_proba(self, embeddings: np.ndarray) -> np.ndarray:
            logits = embeddings @ self.weights + self.bias
            return 1.0 / (1.0 + np.exp(-logits))

        def predict(self, embeddings: np.ndarray) -> np.ndarray:
            return (self.predict_proba(embeddings) >= 0.5).astype(int)


    @dataclass
    class FineTuneHistory:
        """Record of loss values during fine-tuning."""

        losses: List[float]


    def fine_tune_transformer(
        embeddings: np.ndarray,
        labels: Sequence[int],
        epochs: int = 200,
        lr: float = 0.1,
    ) -> Tuple[MiniTransformer, FineTuneHistory]:
        """Train a logistic head on top of frozen document embeddings."""

        y = np.asarray(labels, dtype=float)
        weights = np.zeros(embeddings.shape[1], dtype=float)
        bias = 0.0
        losses: List[float] = []
        for _ in range(epochs):
            logits = embeddings @ weights + bias
            probs = 1.0 / (1.0 + np.exp(-logits))
            loss = -np.mean(y * np.log(probs + 1e-12) + (1 - y) * np.log(1 - probs + 1e-12))
            losses.append(float(loss))
            gradient_w = embeddings.T @ (probs - y) / len(y)
            gradient_b = np.mean(probs - y)
            weights -= lr * gradient_w
            bias -= lr * gradient_b
        model = MiniTransformer(weights=weights, bias=bias)
        return model, FineTuneHistory(losses=losses)


    def retrieve_documents(
        query_embedding: np.ndarray,
        doc_embeddings: np.ndarray,
        top_k: int = 1,
    ) -> List[int]:
        """Return indices of nearest documents by cosine similarity."""

        similarities = (
            doc_embeddings
            @ query_embedding
            / (
                np.linalg.norm(doc_embeddings, axis=1)
                * (np.linalg.norm(query_embedding) + 1e-12)
            )
        )
        ranked = np.argsort(similarities)[::-1]
        return ranked[:top_k].tolist()


    def rag_generate(
        query: str,
        corpus: Sequence[str],
        doc_embeddings: np.ndarray,
        embeddings_table: Mapping[str, np.ndarray],
        top_k: int = 1,
    ) -> str:
        """Perform retrieval-augmented generation by echoing top documents."""

        tokenized_query = tokenize_corpus([query])[0]
        if tokenized_query:
            # Filter tokens that exist in embeddings_table to avoid KeyError
            valid_tokens = [token for token in tokenized_query if token in embeddings_table]
            if valid_tokens:
                query_vec = np.mean(
                    [embeddings_table[token] for token in valid_tokens], axis=0
                )
            else:
                query_vec = np.zeros(
                    next(iter(embeddings_table.values())).shape, dtype=float
                )
        else:
            query_vec = np.zeros(next(iter(embeddings_table.values())).shape, dtype=float)
        doc_indices = retrieve_documents(query_vec, doc_embeddings, top_k=top_k)
        retrieved = [corpus[idx] for idx in doc_indices]
        return " \n".join(
            [f"Answer: {retrieved[0] if retrieved else ''}", "Sources:"] + retrieved
        )


    def evaluate_generation(reference: str, prediction: str) -> Dict[str, float]:
        """Compute deterministic exact-match and token-overlap metrics."""

        ref_tokens = tokenize_corpus([reference])[0]
        pred_tokens = tokenize_corpus([prediction])[0]
        exact = float(reference.strip().lower() == prediction.strip().lower())
        overlap = len(set(ref_tokens) & set(pred_tokens)) / (len(set(ref_tokens)) + 1e-12)
        recall = len(set(ref_tokens) & set(pred_tokens)) / (len(set(ref_tokens)) + 1e-12)
        precision = len(set(ref_tokens) & set(pred_tokens)) / (
            len(set(pred_tokens)) + 1e-12
        )
        f1 = 2 * precision * recall / (precision + recall + 1e-12)
        return {
            "exact_match": exact,
            "overlap": overlap,
            "precision": precision,
            "recall": recall,
            "f1": f1,
        }


    def build_pipeline(corpus: Sequence[str], labels: Sequence[int]) -> Dict[str, object]:
        """Utility for documentation walkthroughs."""

        tokens = tokenize_corpus(corpus)
        embedding_table = build_embedding_table(tokens)
        doc_vecs = document_embeddings(tokens, embedding_table)
        model, history = fine_tune_transformer(doc_vecs, labels)
        rag_answer = rag_generate("summary", corpus, doc_vecs, embedding_table, top_k=2)
        metrics = evaluate_generation(corpus[0], rag_answer)
        return {
            "tokens": tokens,
            "embeddings": embedding_table,
            "doc_vectors": doc_vecs,
            "model": model,
            "history": history,
            "rag_answer": rag_answer,
            "metrics": metrics,
        }


    if __name__ == "__main__":
        corpus = [
            "Transformers capture long-range dependencies with self-attention.",
            "Retrieval augmented generation grounds answers in documents.",
            "Tokenization and embeddings define the vocabulary space.",
        ]
        labels = [1, 1, 0]
        pipeline = build_pipeline(corpus, labels)
        print("Loss trajectory (first 5):", pipeline["history"].losses[:5])
        print("RAG output:\n", pipeline["rag_answer"])
        print("Metrics:", pipeline["metrics"])
    ```
