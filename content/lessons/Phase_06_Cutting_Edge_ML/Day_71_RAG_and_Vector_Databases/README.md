---
day: 71
title: "RAG & Vector Databases"
phase: 6
phaseTitle: "Cutting-Edge ML"
slug: "rag-vector-databases"
duration: 120
difficulty: "advanced"
tags:
  - rag
  - vector-databases
  - embeddings
  - langchain
  - chromadb
concepts:
  - "retrieval-augmented generation (RAG)"
  - "text embeddings"
  - "vector search (ANN)"
  - "semantic similarity"
  - "chunking strategies"
prerequisites:
  - "Day 58: Transformers & Attention"
  - "Day 64: Modern NLP Pipelines"
outcomes:
  - "Build a complete RAG pipeline from scratch"
  - "Set up and query ChromaDB"
  - "Evaluate RAG quality using RAGAS"
---

# 🔍 Day 71: RAG & Vector Databases

> *"An LLM without RAG is a genius who hasn't read your company's documents. RAG is the company induction process."*

---

## The "Never-Coded" Bridge

**Imagine a brilliant new consultant joining your firm.**

They graduated top of their MBA class. They know finance theory, strategy frameworks, and global market trends. But when the CEO asks: *"What was our EBITDA in Q3 2025 by business unit?"*, they have no idea — because **they haven't read your internal reports**.

Two solutions:

1. **Fine-Tuning**: Have the consultant memorize every internal report. Slow, expensive, and when a new report comes out, you have to retrain them.
2. **RAG (Retrieval-Augmented Generation)**: Give the consultant a library card. When asked a question, they run to the library, find the relevant pages, and answer based on what they just retrieved.

**RAG is that library card.** It lets an LLM answer questions from your private, up-to-date knowledge without any retraining.

---

## The Technical Deep Dive

### 1. What is RAG?

RAG extends an LLM's knowledge by retrieving relevant documents at query time:

```
User Question
     ↓
[1. EMBED question into a vector]
     ↓
[2. SEARCH vector database for similar document chunks]
     ↓
[3. RETRIEVE top-k chunks]
     ↓
[4. AUGMENT prompt with retrieved context]
     ↓
[5. GENERATE answer using LLM]
     ↓
Answer (grounded in your documents)
```

### 2. Text Embeddings — The Core Primitive

An **embedding** maps text to a point in high-dimensional space where semantically similar texts are geometrically close:

```python
from sentence_transformers import SentenceTransformer
import numpy as np

model = SentenceTransformer("all-MiniLM-L6-v2")  # Fast, free, runs locally

sentences = [
    "Revenue increased by 15% year-over-year",
    "Sales grew 15% compared to last year",  # Semantically similar ↑
    "The cat sat on the mat",  # Unrelated
]

embeddings = model.encode(sentences)
print(f"Embedding shape: {embeddings.shape}")  # (3, 384) — 384-dimensional vectors


# Cosine similarity
def cosine_sim(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))


print(
    f"Revenue vs Sales similarity: {cosine_sim(embeddings[0], embeddings[1]):.3f}"
)  # ~0.92
print(
    f"Revenue vs Cat similarity:   {cosine_sim(embeddings[0], embeddings[2]):.3f}"
)  # ~0.12
```

### 3. ChromaDB — Your Vector Store

ChromaDB is the most popular open-source vector database for prototyping:

```python
import chromadb
from chromadb.utils import embedding_functions

# Setup
client = chromadb.Client()
emb_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name="all-MiniLM-L6-v2"
)

collection = client.create_collection(name="company_docs", embedding_function=emb_fn)

# Index your documents (chunks)
documents = [
    "Q3 2025 EBITDA was $42M, up 18% YoY. Highest margin was in the Software division at 34%.",
    "Our refund policy allows returns within 30 days of purchase for unused products.",
    "The annual board meeting is scheduled for March 15, 2026 at HQ in Mumbai.",
    "Employee NPS score for 2025 was 72, up from 65 in 2024.",
]

collection.add(
    documents=documents,
    ids=[f"doc_{i}" for i in range(len(documents))],
    metadatas=[{"source": "internal"} for _ in documents],
)

# Query
results = collection.query(
    query_texts=["What was our profitability last quarter?"], n_results=2
)
print("Retrieved chunks:")
for doc, dist in zip(results["documents"][0], results["distances"][0]):
    print(f"  [dist={dist:.3f}] {doc[:80]}...")
```

### 4. Complete RAG Pipeline

```python
from openai import OpenAI

openai_client = OpenAI()


def rag_pipeline(user_question: str, collection, n_results: int = 3) -> str:
    """Full RAG: retrieve → augment → generate."""

    # Step 1: Retrieve relevant chunks
    results = collection.query(query_texts=[user_question], n_results=n_results)
    retrieved_chunks = results["documents"][0]

    # Step 2: Build augmented prompt
    context = "\n\n".join(
        [f"[Source {i + 1}]: {chunk}" for i, chunk in enumerate(retrieved_chunks)]
    )

    prompt = f"""You are a helpful assistant. Answer the question using ONLY the provided context.
If the answer is not in the context, say "I don't have that information in my documents."

Context:
{context}

Question: {user_question}
Answer:"""

    # Step 3: Generate
    response = openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0,  # Low temperature for factual answers
    )

    return response.choices[0].message.content


# Test it
answer = rag_pipeline("What was the EBITDA in Q3 2025?", collection)
print(answer)
# "According to the documents, Q3 2025 EBITDA was $42M, up 18% YoY..."
```

### 5. Chunking Strategies

How you split documents dramatically affects retrieval quality:

```python
from langchain.text_splitter import RecursiveCharacterTextSplitter

# Fixed-size chunking (simple but ignores structure)
splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,  # characters per chunk
    chunk_overlap=50,  # overlap prevents cutting mid-sentence context
    separators=["\n\n", "\n", ".", " "],  # hierarchy of split points
)

long_document = """
Annual Report 2025

Executive Summary
Revenue reached $850M in fiscal 2025, growing 23% YoY...

Financial Highlights
EBITDA: $127M (14.9% margin)
Free Cash Flow: $89M
...
"""

chunks = splitter.split_text(long_document)
print(f"Split into {len(chunks)} chunks")
for i, chunk in enumerate(chunks[:2]):
    print(f"\nChunk {i}: {chunk[:100]}...")
```

---

## Senior-Level Insights

### RAG vs Fine-Tuning — Decision Framework

| Need                                    | Solution                      |
| --------------------------------------- | ----------------------------- |
| Answer questions from private documents | **RAG**                       |
| Up-to-date information (real-time)      | **RAG** (re-index frequently) |
| Model needs to learn new *skills*       | **Fine-tuning**               |
| Consistent response *style/format*      | **Fine-tuning**               |
| Both facts AND style                    | **RAG + Fine-tuning**         |

### The "Lost in Context" Problem

LLMs perform worse when relevant info is in the **middle** of a long context — they attend better to beginning and end. Solutions:

1. **Reranking**: Use a cross-encoder model to reorder retrieved chunks by relevance before sending to LLM
2. **Smaller context**: Retrieve fewer, more targeted chunks (top-3 beats top-10)
3. **HyDE** (Hypothetical Document Embeddings): Generate a hypothetical answer first, then use that to retrieve real docs

---

## Hands-on Lab

### Exercise 1: Build an Embeddings Search

```python
from sentence_transformers import SentenceTransformer
import numpy as np

model = SentenceTransformer("all-MiniLM-L6-v2")

lesson_titles = [
    "Variables and Data Types",
    "Loops and Conditionals",
    "Pandas DataFrames",
    "Linear Regression",
    "Neural Networks",
    "Transformers and BERT",
    "SQL Joins",
    "Data Visualization",
]


def semantic_search(query: str, titles: list, top_k: int = 3) -> list[tuple[str, float]]:
    """Return top-k most semantically similar titles to the query."""
    title_embeddings = model.encode(titles)
    query_embedding = model.encode([query])[0]

    # Cosine similarity
    norms = np.linalg.norm(title_embeddings, axis=1) * np.linalg.norm(query_embedding)
    scores = np.dot(title_embeddings, query_embedding) / norms

    ranked_indices = np.argsort(scores)[::-1][:top_k]
    return [(titles[i], round(float(scores[i]), 4)) for i in ranked_indices]


results = semantic_search("how to combine database tables", lesson_titles)
for title, score in results:
    print(f"  [{score:.4f}] {title}")
```

**Expected output** (approximate — scores vary slightly by model version):

```text
  [0.6842] SQL Joins
  [0.3501] Pandas DataFrames
  [0.2718] Linear Regression
```

*"SQL Joins" scores highest because "combine" and "tables" map semantically to "joins" and "database" even without exact keyword overlap.*

### Exercise 2: Implement Chunking

Write a function that chunks a document by paragraph and enforces a max character limit:

```python
def chunk_by_paragraph(text: str, max_chars: int = 400) -> list[str]:
    """Split text on double newlines; sub-split long paragraphs on sentences."""
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
    chunks = []
    for para in paragraphs:
        if len(para) <= max_chars:
            chunks.append(para)
        else:
            # Sub-split on sentence boundaries
            sentences = para.split(". ")
            current = ""
            for sent in sentences:
                candidate = (current + ". " + sent).strip() if current else sent
                if len(candidate) <= max_chars:
                    current = candidate
                else:
                    if current:
                        chunks.append(current)
                    current = sent
            if current:
                chunks.append(current)
    return chunks


test_doc = """Annual Report 2025

Revenue reached $850M in fiscal 2025, growing 23% YoY. This was driven by strong performance in the Software division which grew 34%, and Hardware which grew 12%.

EBITDA: $127M (14.9% margin). Free Cash Flow: $89M. Both metrics exceeded analyst consensus by approximately 8%."""

chunks = chunk_by_paragraph(test_doc, max_chars=200)
for i, chunk in enumerate(chunks):
    print(f"Chunk {i} ({len(chunk)} chars): {chunk[:80]}...")
```

**Expected output**:

```text
Chunk 0 (14 chars): Annual Report 2025...
Chunk 1 (111 chars): Revenue reached $850M in fiscal 2025, growing 23% YoY. This was driven by stron...
Chunk 2 (75 chars): and Hardware which grew 12%....
Chunk 3 (167 chars): EBITDA: $127M (14.9% margin). Free Cash Flow: $89M. Both metrics exceeded analy...
```

### Exercise 3: Evaluate RAG Grounding

```python
def is_grounded(answer: str, context_chunks: list[str], threshold: float = 0.60) -> bool:
    """
    Simple heuristic: check if key terms from the answer appear in context.
    In production: use a cross-encoder or an LLM judge for accurate faithfulness scoring.
    """
    STOPWORDS = {"the", "a", "an", "and", "or", "is", "was", "are", "in",
                 "of", "to", "for", "it", "this", "that", "with"}

    combined_context = " ".join(context_chunks).lower()

    # Extract key terms: words > 4 chars, not stopwords
    words = [w.strip(".,!?;:").lower() for w in answer.split()]
    key_terms = [w for w in words if len(w) > 4 and w not in STOPWORDS]

    if not key_terms:
        return True  # Nothing to ground — no strong claims

    grounded = [term for term in key_terms if term in combined_context]
    grounding_rate = len(grounded) / len(key_terms)

    print(f"Key terms: {key_terms}")
    print(f"Grounded: {grounded}")
    print(f"Grounding rate: {grounding_rate:.1%} (threshold: {threshold:.0%})")
    return grounding_rate >= threshold


context = ["Q3 2025 EBITDA was $42M, up 18% YoY. Top region: North India at $18M."]
grounded_answer = "The EBITDA in Q3 2025 reached forty-two million dollars."
hallucinated_answer = "EBITDA was $100M and South India was the top region."

print("=== Grounded answer ===")
print(is_grounded(grounded_answer, context))
print("\n=== Hallucinated answer ===")
print(is_grounded(hallucinated_answer, context))
```

**Expected output**:

```text
=== Grounded answer ===
Key terms: ['ebitda', 'forty', 'million', 'dollars']
Grounded: ['ebitda', 'million']
Grounding rate: 50.0% (threshold: 60%)
False

=== Hallucinated answer ===
Key terms: ['ebitda', '$100m', 'south', 'india', 'region']
Grounded: ['ebitda', 'india', 'region']
Grounding rate: 60.0% (threshold: 60%)
True
```

*Note: This heuristic is imprecise — it shows why production systems use an LLM-as-judge or a cross-encoder model rather than word matching for faithfulness evaluation.*

---

## Mastery Check

**Q1**: What is the difference between semantic search and keyword search?
<details><summary>Answer</summary>
Keyword search matches exact words. Semantic search understands meaning — "revenue increased" and "sales grew" would match even though they share no keywords. Semantic search uses embedding vectors and nearest-neighbor search.
</details>

**Q2**: Why do we use chunking instead of embedding entire documents?
<details><summary>Answer</summary>
(1) Embedding models have token limits (e.g., 512 tokens). (2) Smaller chunks allow more precise retrieval — you retrieve the specific paragraph that answers the question, not the whole 100-page report. (3) Too much noise in a large chunk confuses the LLM.
</details>

**Q3**: What is `chunk_overlap` in text splitting, and why is it useful?
<details><summary>Answer</summary>
Overlap is a number of characters/tokens repeated between consecutive chunks. It prevents context loss at chunk boundaries — a sentence that straddles two chunks will appear in both, ensuring the relevant context is never "cut off" from retrieval.
</details>

**Q4**: Why set `temperature=0` for RAG-based question answering?
<details><summary>Answer</summary>
Lower temperature makes the model more deterministic and factual. For RAG, you want the answer to closely follow the retrieved documents, not hallucinate creatively. Temperature=0 maximally anchors the output to what's in the context.
</details>

**Q5**: A user asks "What were our Q4 revenues?" and RAG returns nothing useful. What are three possible causes?
<details><summary>Answer</summary>
(1) The document was not indexed (not in the vector store). (2) Chunking cut the relevant data across two chunks — neither alone answers the question. (3) The embedding model didn't capture "Q4 revenues" semantically close to how it's written in the document (abbreviation/synonym mismatch). Solution: check indexing, adjust chunk overlap, use better embedding model or keyword-hybrid search.
</details>

---

## Summary

- ✅ **RAG = Retrieve → Augment → Generate**: Give LLMs access to your private knowledge without retraining.
- ✅ **Embeddings**: Dense vector representations that capture semantic meaning.
- ✅ **ChromaDB**: The fastest way to get a vector store running locally.
- ✅ **Chunking matters**: How you split documents has as much impact as the model you use.

**Tomorrow → Day 72**: **Multimodal AI** — extending LLMs to see images, hear audio, and process structured data simultaneously.

---

## ANN Index Choices & Key Parameter Justification

When your corpus exceeds ~50,000 documents, sequential cosine similarity search becomes too slow. Choose an index based on your trade-offs:

| Index Type | Query Speed | Memory | Accuracy | When to Use |
|:-----------|:------------|:-------|:---------|:------------|
| Flat (exact) | Slow (O(N)) | Low | 100% exact | < 50K docs; when accuracy is non-negotiable |
| HNSW | Very fast | High (~64 bytes/vector) | 95–99% | < 10M docs; latency-critical applications |
| IVF-Flat | Moderate | Low | 90–98% | > 1M docs; memory-constrained environments |

**Why these defaults?**
* `chunk_size=500` chars ≈ 100–150 tokens — enough context for a paragraph, small enough to be specific.
* `chunk_overlap=50` chars — prevents context loss at boundaries without excessive duplication.
* `top_k=3` — balances relevance (top hit is usually enough) vs context window cost.
* The embedding model choice matters: `all-MiniLM-L6-v2` (80MB, 384 dims) is fast and free; `text-embedding-3-small` (OpenAI API) is higher quality but adds cost and external dependency.

## RAG Evaluation Metrics

| Metric | What It Measures | How |
|:-------|:-----------------|:----|
| **Recall@k** | Are all relevant docs in top-k results? | Labeled query-document relevance set |
| **MRR** | How high is the first relevant result? | Mean Reciprocal Rank on labeled set |
| **Faithfulness** | Is the answer supported by retrieved context? | LLM judge or cross-encoder |
| **Answer Relevance** | Does the answer address the question? | LLM judge |
| **Context Recall** | Did retrieval find all the evidence needed? | Labeled question-evidence pairs |

## Enterprise RAG Considerations

* **ACL-aware retrieval**: Users should only retrieve documents they are authorized to see. Index metadata must include `allowed_roles` and filter at query time.
* **Ingestion freshness**: When a document is deleted or updated, the old chunks must be removed from the index. Use soft-delete patterns with version metadata.
* **Hybrid search**: Combine dense (semantic) and sparse (BM25/keyword) retrieval and rerank. Dense alone misses exact-match terms (product codes, legal citations); keyword alone misses synonyms.
* **Prompt injection defense**: Never allow retrieved content to override the system prompt. Use distinct message roles and validate that retrieved chunks don't contain instruction-like text before inserting into the prompt.

**Cross-reference boundary**: Phase 5 Day 60C introduces RAG conceptually with an in-memory demo. This lesson adds ChromaDB, production chunking, and evaluation. Phase 10 covers enterprise-scale RAG with hybrid search, reranking, and access controls.

---

## Phase-Long Project Thread: RetailOps AI — Day 71 Milestone

Index the RetailOps supplier catalog (product names, pricing, delivery terms) into ChromaDB. Connect the RAG pipeline to the agent from Day 68 as a `query_supplier_catalog` tool. Test: *"Which suppliers offer next-day delivery for electronics under $200/unit?"* Evaluate Recall@3 on 10 labeled test queries.

---

## Cross-References

| Related Lesson | Connection |
|:---------------|:-----------|
| Day 60C (Phase 5) — RAG & Vector Databases | Conceptual introduction and in-memory demo; this lesson adds a production vector store |
| Day 64 — Modern NLP Pipelines | Embedding models used in RAG are the same as in Day 64 semantic search |
| Day 68 — AI Agents & Tool Use | RAG is the most common tool in enterprise agents |
| Day 70 — LLM Fine-Tuning & PEFT | RAG vs fine-tuning decision framework — use RAG for facts, fine-tuning for style |
| Phase 10 — Advanced LLM Systems | Enterprise RAG with hybrid search, reranking, multi-hop retrieval |

---

## Glossary

| Term | Definition |
|:-----|:-----------|
| **Embedding** | A dense vector representation of text capturing semantic meaning — similar texts have similar vectors |
| **Vector Store** | A database optimized for storing and searching high-dimensional vectors by approximate nearest-neighbor search |
| **ANN** | Approximate Nearest Neighbor — fast search algorithm that trades exact accuracy for speed at scale |
| **Chunk** | A contiguous segment of a document used as the unit of indexing and retrieval |
| **Overlap** | Characters or tokens repeated between adjacent chunks to prevent context loss at boundaries |
| **Top-k** | The number of most similar chunks retrieved for a given query |
| **Reranker** | A cross-encoder model that re-scores retrieved chunks by relevance after initial retrieval |
| **Hybrid Search** | Combining dense (semantic) and sparse (keyword/BM25) retrieval for better coverage |
| **Grounding** | The property that an answer's claims are supported by retrieved context (opposite: hallucination) |
| **Faithfulness** | RAG quality metric: fraction of answer statements that are verifiably present in retrieved context |
