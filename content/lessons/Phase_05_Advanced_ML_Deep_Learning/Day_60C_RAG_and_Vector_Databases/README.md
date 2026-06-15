---
day: "60C"
title: "Retrieval-Augmented Generation (RAG) & Vector Databases"
phase: 5
phaseTitle: "Advanced ML & Deep Learning"
slug: "rag-vector-databases"
duration: 60
difficulty: "advanced"
tags:
  - rag
  - vector-databases
  - embeddings
  - chromadb
  - langchain
  - llm
concepts:
  - "semantic search and embeddings"
  - "vector databases (ChromaDB, Pinecone, pgvector)"
  - "RAG pipeline architecture"
  - "retrieval strategies"
prerequisites: ["60B", 58, 49]
outcomes:
  - "Explain what a vector embedding is and why it enables semantic search"
  - "Describe the RAG architecture and its components"
  - "Understand when to use RAG vs fine-tuning"
  - "Read and understand a basic RAG pipeline with LangChain"
---

# 🔍 Day 60C: RAG & Vector Databases

> *"RAG is what happens when you give a language model a search engine as a memory."*

---

## The "Never-Coded" Bridge

**The fundamental Problem with LLMs:** They're trained on data up to a cutoff date. They don't know your company's internal documents, your Q4 sales report, or what happened last week. Ask GPT-4 about your proprietary customer data → hallucination.

**RAG (Retrieval-Augmented Generation)** solves this elegantly: before the LLM answers, retrieve the most relevant documents from your knowledge base. Stuff them into the prompt. Now the LLM has real, current, private context to work from.

The secret ingredient is **vector embeddings** — the same mathematical representations you learned in Day 58 (Transformers). This lesson bridges that theory to the most important LLM application pattern of 2025–2026.

> **This lesson is a conceptual bridge.** Full hands-on RAG pipeline implementation is in **Phase 10 → Day 112: RAG Pipelines**, including ChromaDB setup, LangChain chains, and evaluation. Read this lesson to build the mental model; go there for production code.

---

## Core Concepts

### Vector Embeddings: Semantic GPS Coordinates

An **embedding** converts text (or images, audio) into a high-dimensional vector of numbers. Similar meanings → similar vectors → nearby in vector space.

```python
# Embeddings in action — conceptual demonstration
import numpy as np

# Pre-computed embeddings (in practice, from sentence-transformers or OpenAI API)
embeddings = {
    "The customer cancelled their subscription": np.random.randn(1536),
    "User churned from the platform": np.random.randn(1536),
    "New product feature shipped": np.random.randn(1536),
    "The dog ran through the park": np.random.randn(1536),
}

def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

# With real embeddings, semantically similar sentences score high
# "customer cancelled" and "user churned" would have similarity ~0.92
# "customer cancelled" and "dog in the park" would have similarity ~0.12

# This is how semantic search differs from keyword search:
# Keyword search: "churn" must match exactly → misses "cancelled"
# Semantic search: finds conceptually similar text even with different words
print("Semantic similarity is the engine of RAG retrieval.")
print("Building on Day 38 (cosine similarity) applied to NLP embeddings.")
```

### How RAG Works: The 5-Step Architecture

```
Query: "What was our Q3 revenue?"
   │
   ▼
1. EMBED: Convert query to vector [0.23, -0.14, ..., 0.87] (1536 dimensions)
   │
   ▼
2. RETRIEVE: Search vector database for top-k most similar document chunks
   → Finds: "Q3 Financial Report section 2.1: Revenue was $4.2M..."
   │
   ▼  
3. AUGMENT: Inject retrieved documents into the LLM prompt
   → "Context: [Q3 Report excerpt]. Question: What was our Q3 revenue?"
   │
   ▼
4. GENERATE: LLM produces answer grounded in retrieved context
   → "Based on the Q3 report, revenue was $4.2M, up 18% YoY..."
   │
   ▼
5. VERIFY (optional): Check that answer is grounded in context (with RAGAS — Day 114)
```

### Vector Databases: What They Are and Why They're Different

Traditional databases search by exact match or range (SQL WHERE clauses). Vector databases search by **semantic similarity** across millions of high-dimensional vectors — efficiently.

| Database     | Type                 | Use Case                         |
| ------------ | -------------------- | -------------------------------- |
| **ChromaDB** | Open-source, local   | Development, small datasets      |
| **Pinecone** | Managed cloud        | Production, scale                |
| **pgvector** | PostgreSQL extension | Existing Postgres users          |
| **Weaviate** | Open-source + cloud  | Hybrid search (keyword + vector) |
| **Qdrant**   | Open-source + cloud  | High performance, filtering      |
| **FAISS**    | Library (Meta)       | In-memory, research              |

### Conceptual RAG Pipeline Code

```python
# Pseudocode — full runnable version in Phase 10 Day 112
# (requires API keys, model downloads, and proper environment setup)

from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import OpenAIEmbeddings  # or sentence-transformers
from langchain.vectorstores import Chroma
from langchain.llms import OpenAI
from langchain.chains import RetrievalQA

# Step 1: Load and chunk documents
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,       # Characters per chunk
    chunk_overlap=50,     # Overlap to preserve context at boundaries
)
chunks = text_splitter.split_documents(your_documents)

# Why chunk? LLMs have finite context windows.
# A 200-page PDF can't fit in one prompt.
# Breaking into 500-char chunks lets us retrieve only relevant pieces.

# Step 2: Embed and store
embeddings = OpenAIEmbeddings()  # text-embedding-3-small: 1536 dimensions
vectorstore = Chroma.from_documents(
    documents=chunks,
    embedding=embeddings,
    persist_directory="./chroma_db"
)

# Step 3: Create retrieval chain
retriever = vectorstore.as_retriever(
    search_type="similarity",
    search_kwargs={"k": 4}  # Return top 4 most similar chunks
)

qa_chain = RetrievalQA.from_chain_type(
    llm=OpenAI(model="gpt-4o"),
    chain_type="stuff",   # "stuff" = concat all chunks into one prompt
    retriever=retriever,
    return_source_documents=True
)

# Step 4: Query
result = qa_chain.invoke({"query": "What is our churn rate this quarter?"})
print(result["result"])
print(result["source_documents"])  # Show which docs were retrieved
```

### Retrieval Strategies

```python
# Not all retrieval is equal. Four strategies to know:

# 1. DENSE (default — what we built above)
#    Embed query, find nearest vectors. Great for semantic similarity.
#    Weakness: can miss exact keyword matches.

# 2. SPARSE (keyword-based — BM25)
#    Traditional TF-IDF style. Great for exact term matching.
#    Weakness: misses synonyms and paraphrases.

# 3. HYBRID (best of both)
#    Combine dense + sparse scores with a weighted sum.
#    Weaviate and Elasticsearch natively support this.

# 4. RERANKING (post-retrieval refinement)
#    Retrieve top-20 candidates, then use a cross-encoder to rerank to top-4.
#    Adds latency but improves precision significantly.
#    Use: Cohere Rerank API or cross-encoders from sentence-transformers

# Retrieval quality is the #1 factor in RAG output quality.
# "Garbage in, garbage out" applies to vector retrieval too.
```

---

## RAG vs Fine-Tuning: Decision Framework

| Scenario                                             | Recommended Approach                  |
| ---------------------------------------------------- | ------------------------------------- |
| Knowledge changes frequently (news, prices, reports) | **RAG**                               |
| Knowledge is static and specialized (medical texts)  | **Fine-tuning**                       |
| need to cite sources for compliance                  | **RAG** (returns source docs)         |
| Need consistent output format                        | **Fine-tuning**                       |
| Low engineering budget                               | **RAG** (no training cost)            |
| <50K document pages                                  | **RAG**                               |
| Need model to "internalize" reasoning patterns       | **Fine-tuning**                       |
| Both?                                                | **RAG + LoRA** (common in production) |

---

## 💼 MBA Context: RAG in Enterprise

**Where RAG ships today:**

- **Customer support bots**: Retrieve from internal knowledge base → auto-respond to 80% of tickets
- **Legal review**: Query case law database → surface relevant precedents
- **Financial analysis**: Query earnings reports → synthesize competitor intel
- **HR chatbots**: Retrieve policy docs → answer employee questions 24/7
- **Code assistants**: Retrieve internal codebase → suggest company-specific patterns

**Klarna** reduced customer service cost by $40M/year using an LLM + RAG system. **Morgan Stanley** deployed a GPT-4 RAG system that surfaces financial analyst reports for advisors.

---

## Mastery Check

**Q1**: What is a vector embedding, in plain English?
<details><summary>Answer</summary>

A vector embedding is a list of numbers that captures the **meaning** of text in a form computers can do math on. Semantically similar texts → similar numbers → close together in space. Embeddings are typically 768 to 3072 numbers per text chunk. They're produced by encoder models (like BERT variants or OpenAI's text-embedding models). The "distance" between two embeddings measures their semantic similarity.
</details>

**Q2**: Why do we split documents into chunks before embedding instead of embedding entire documents?
<details><summary>Answer</summary>

Three reasons: (1) **Context window limits** — LLMs can only process a finite number of tokens at once; a 200-page document won't fit. (2) **Retrieval precision** — embedding a 50-page document averages out specific details; a 500-character chunk preserves them. (3) **Relevance** — you want to retrieve the specific paragraph that answers the question, not the entire document.
</details>

**Q3**: What is the fundamental limitation of RAG that fine-tuning does not share?
<details><summary>Answer</summary>

**Retrieval failure**: if the relevant information isn't in the vector database, RAG can't generate a correct answer — it hallucinates or says "I don't know." Fine-tuning embeds knowledge into model weights, so there's no retrieval step to fail. Also, RAG requires external infrastructure (vector DB, embedding API), adds latency, and can't help the model "reason like an expert" — only access facts.
</details>

---

## Quick-Start Lab: In-Memory Semantic Search

**Business scenario:** Your customer support team receives 500 tickets per day. You want to auto-retrieve the 3 most relevant past resolutions for each new ticket so agents can resolve issues 40% faster.

This lab uses only `numpy` and `sklearn` — no ChromaDB, no API keys, no internet connection required. Run it right now in any Python environment.

```python
# In-Memory Semantic Search Lab
# No GPU, no API keys, no internet needed
# pip install numpy scikit-learn

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# ─────────────────────────────────────────────
# TASK 1: Create a mock support ticket knowledge base
# ─────────────────────────────────────────────

# 10 resolved support tickets (ticket text → known resolution)
resolved_tickets = [
    "Cannot log in to account, password reset not working",
    "Billing charge appears twice on my credit card statement",
    "App crashes when uploading files larger than 10MB",
    "Unable to export data to CSV format from the dashboard",
    "Email notifications are not being received",
    "Two-factor authentication code is rejected every time",
    "Dashboard loading very slowly, takes more than 30 seconds",
    "Integration with Salesforce stopped syncing yesterday",
    "Mobile app shows blank screen after latest update",
    "Cannot add new team members to the organization account",
]

resolutions = [
    "Clear browser cache, then use 'Forgot Password' flow. If persists, check SSO settings.",
    "Duplicate charge is a pre-authorization hold. It clears within 3–5 business days.",
    "File size limit is 10MB. Compress the file or use our bulk upload API endpoint.",
    "CSV export requires 'Admin' role. Ask your workspace admin to adjust permissions.",
    "Check spam folder. Add noreply@company.com to safe senders list.",
    "Ensure system clock is synchronized. TOTP codes expire every 30 seconds.",
    "Dashboard slowness tied to large date ranges. Filter to last 30 days as a workaround.",
    "Salesforce API token expired. Re-authenticate under Settings → Integrations.",
    "Force-quit the app and reinstall version 3.2.1 from the App Store.",
    "Only 'Owner' role can add members. Check your role under Account → Team.",
]

print(f"Task 1 — Knowledge base created: {len(resolved_tickets)} resolved tickets loaded.")
# Expected Output:
# Task 1 — Knowledge base created: 10 resolved tickets loaded.


# ─────────────────────────────────────────────
# TASK 2: Build TF-IDF embeddings for the knowledge base
# ─────────────────────────────────────────────

# TF-IDF (Term Frequency-Inverse Document Frequency) is a classic sparse embedding.
# It's not as powerful as neural embeddings, but requires no model downloads.
vectorizer = TfidfVectorizer(stop_words="english", ngram_range=(1, 2))
ticket_embeddings = vectorizer.fit_transform(resolved_tickets)

print(f"\nTask 2 — TF-IDF embeddings built:")
print(f"  Knowledge base shape: {ticket_embeddings.shape}")
print(f"  Each ticket is a {ticket_embeddings.shape[1]}-dimensional sparse vector.")
# Expected Output:
# Task 2 — TF-IDF embeddings built:
#   Knowledge base shape: (10, <vocab_size>)
#   Each ticket is a <vocab_size>-dimensional sparse vector.


# ─────────────────────────────────────────────
# TASK 3: Implement top-k semantic retrieval
# ─────────────────────────────────────────────

def retrieve_top_k(query: str, k: int = 3) -> list[dict]:
    """
    Embed the query using the same TF-IDF vocabulary,
    compute cosine similarity against all knowledge base tickets,
    return the top-k most similar results.
    """
    query_vec = vectorizer.transform([query])
    similarities = cosine_similarity(query_vec, ticket_embeddings).flatten()
    top_k_indices = np.argsort(similarities)[::-1][:k]

    results = []
    for idx in top_k_indices:
        results.append({
            "rank": len(results) + 1,
            "score": round(float(similarities[idx]), 4),
            "ticket": resolved_tickets[idx],
            "resolution": resolutions[idx],
        })
    return results


# Test with a new incoming ticket
new_ticket = "I can't sign in and the password reset email never arrives"
results = retrieve_top_k(new_ticket, k=3)

print(f"\nTask 3 — Top-3 retrieved tickets for:")
print(f"  Query: '{new_ticket}'")
print()
for r in results:
    print(f"  Rank {r['rank']} (similarity: {r['score']:.4f})")
    print(f"    Past ticket : {r['ticket']}")
    print(f"    Resolution  : {r['resolution']}")
    print()
# Expected Output (scores will vary but rank order should be stable):
# Task 3 — Top-3 retrieved tickets for:
#   Query: 'I can't sign in and the password reset email never arrives'
#
#   Rank 1 (similarity: 0.4xxx)
#     Past ticket : Cannot log in to account, password reset not working
#     Resolution  : Clear browser cache, then use 'Forgot Password' flow...
#
#   Rank 2 (similarity: 0.2xxx)
#     Past ticket : Email notifications are not being received
#     Resolution  : Check spam folder. Add noreply@company.com to safe senders list.
#
#   Rank 3 (similarity: 0.0xxx)
#     Past ticket : Two-factor authentication code is rejected every time
#     Resolution  : Ensure system clock is synchronized...


# ─────────────────────────────────────────────
# TASK 4: Build the query → retrieve → answer template pipeline
# ─────────────────────────────────────────────

def build_rag_prompt(query: str, k: int = 3) -> str:
    """
    Simulate the AUGMENT step of RAG:
    retrieves relevant context and builds a prompt ready for an LLM.
    In production, you'd pass this string to GPT-4 or Claude.
    """
    retrieved = retrieve_top_k(query, k=k)

    context_blocks = []
    for r in retrieved:
        context_blocks.append(
            f"[Resolution {r['rank']} — similarity {r['score']:.4f}]\n"
            f"Similar past issue: {r['ticket']}\n"
            f"How it was resolved: {r['resolution']}"
        )

    context = "\n\n".join(context_blocks)

    prompt = (
        f"You are a customer support assistant. Use the past resolutions below to help "
        f"answer the new ticket. Cite which resolution you're drawing from.\n\n"
        f"--- RETRIEVED CONTEXT ---\n{context}\n\n"
        f"--- NEW TICKET ---\n{query}\n\n"
        f"--- YOUR RESPONSE ---"
    )
    return prompt


rag_prompt = build_rag_prompt(new_ticket)
print("Task 4 — RAG prompt assembled (first 400 chars):")
print(rag_prompt[:400])
print("...\n[In production: pass this full prompt to an LLM API]")
# Expected Output:
# Task 4 — RAG prompt assembled (first 400 chars):
# You are a customer support assistant. Use the past resolutions below to help answer...


# ─────────────────────────────────────────────
# TASK 5: Evaluate retrieval quality — precision@K
# ─────────────────────────────────────────────

def precision_at_k(query: str, relevant_indices: list[int], k: int = 3) -> float:
    """
    precision@K = (number of relevant results in top-K) / K
    relevant_indices: which knowledge base entries are truly relevant for this query.
    """
    retrieved = retrieve_top_k(query, k=k)
    retrieved_tickets = [resolved_tickets.index(r["ticket"]) for r in retrieved]
    hits = sum(1 for idx in retrieved_tickets if idx in relevant_indices)
    return hits / k


# For our test query, tickets 0 (login issue) and 4 (email issue) are both relevant
test_cases = [
    ("I can't sign in and the password reset email never arrives", [0, 4], 3),
    ("The app freezes when I try to upload a large document", [2], 3),
    ("My Salesforce data hasn't updated since Monday", [7], 3),
]

print("\nTask 5 — Precision@3 evaluation:")
print(f"{'Query':<55} | {'Relevant':<10} | {'P@3'}")
print("-" * 75)
for query, relevant_idx, k in test_cases:
    p_at_k = precision_at_k(query, relevant_idx, k)
    relevant_descriptions = [resolved_tickets[i][:30] + "..." for i in relevant_idx]
    print(f"{query[:54]:<55} | {str(relevant_idx):<10} | {p_at_k:.2f}")

print("\nPrecision@3 = 1.00 means all 3 retrieved results were relevant.")
print("This metric is how production RAG systems are evaluated before deployment.")
# Expected Output:
# Task 5 — Precision@3 evaluation:
# I can't sign in and the password reset email never...   | [0, 4]     | 0.67
# The app freezes when I try to upload a large document   | [2]        | 0.33
# My Salesforce data hasn't updated since Monday          | [7]        | 0.33
```

**Key takeaway:** The query → embed → retrieve → augment pipeline is the same whether you use TF-IDF vectors (this lab) or neural embeddings (production). The embedding model determines retrieval quality; the pipeline structure stays constant.

---

## Choosing Your Embedding Model

Embedding model choice is one of the most consequential infrastructure decisions in a RAG system. Different models trade off cost, speed, quality, and language coverage.

### Embedding Model Comparison

| Model                              | Dimensions | Cost           | Speed      | Best For                                              |
| ---------------------------------- | ---------- | -------------- | ---------- | ----------------------------------------------------- |
| **sentence-transformers/all-MiniLM-L6-v2** | 384    | Free (local)   | Very fast  | Development, budget-constrained production, English   |
| **sentence-transformers/all-mpnet-base-v2**| 768    | Free (local)   | Moderate   | Higher-quality English retrieval, open-source prod    |
| **text-embedding-3-small** (OpenAI)        | 1536   | $0.02/M tokens | Fast (API) | General English production, good quality/cost balance |
| **text-embedding-3-large** (OpenAI)        | 3072   | $0.13/M tokens | Fast (API) | Highest quality needs, complex domain retrieval       |
| **multilingual-e5-large**                  | 1024   | Free (local)   | Moderate   | Multi-language support, global enterprise deployments |

**Rule of thumb:** Start with `all-MiniLM-L6-v2` for development (free, fast, good enough). Move to `text-embedding-3-small` for production if using OpenAI's ecosystem. Use `multilingual-e5-large` if your content is in multiple languages.

### Chunking Strategy Guide

Chunk size is the second most important retrieval parameter after embedding model choice:

| Chunk Size      | When to Use                                                          | Trade-off                                          |
| --------------- | -------------------------------------------------------------------- | -------------------------------------------------- |
| **256 chars**   | FAQ-style content, structured data, short policy clauses             | High precision, low context per chunk              |
| **512 chars**   | General purpose — emails, support tickets, news articles             | Best balance for most use cases                    |
| **1024 chars**  | Long-form reasoning, technical docs, research papers, legal language | More context per chunk, lower retrieval precision  |
| **Semantic**    | Structured documents with logical sections (split on headers/paras)  | Best precision, requires pre-processing logic      |

**Chunk overlap:** Always set overlap to 10–20% of chunk size (e.g., 50–100 chars for 512-char chunks). Overlap prevents splitting a sentence across chunk boundaries and losing the context that ties information together. Without overlap, a key sentence that straddles two chunks may be retrievable from neither.

---

## Senior-Level Insights: RAG in Production

### Retrieval Failure Diagnosis: The 4 Failure Modes

Most RAG failures come from retrieval, not generation. When your RAG system gives a bad answer, diagnose by failure mode:

| Failure Mode             | Symptom                                          | Root Cause                                         | Fix                                                       |
| ------------------------ | ------------------------------------------------ | -------------------------------------------------- | --------------------------------------------------------- |
| **Hallucination**        | Answer is confident but factually wrong          | Retrieved chunks are close but not exact; LLM fills gaps | Increase k, add reranking, tighten chunk size         |
| **Incomplete retrieval** | Answer is correct but missing key details        | Relevant information split across chunks that weren't both retrieved | Add chunk overlap, increase k, use parent-doc retrieval |
| **Irrelevant retrieval** | Retrieved chunks don't match the query at all    | Embedding space mismatch (domain gap), poor chunking strategy | Fine-tune embedding model on domain data, improve chunking |
| **Context overflow**     | LLM ignores retrieved context or truncates       | Total retrieved text exceeds LLM context window    | Reduce k, use smaller chunks, add a summarization step |

### Conversation Memory in Multi-Turn RAG

Single-turn RAG is straightforward. Multi-turn conversations (chatbots) require handling memory across turns:

```
Turn 1: "What is our refund policy?"
         → Retrieves refund policy doc, answers correctly

Turn 2: "How long does it take?"  ← ambiguous without context
         → Naive RAG retrieves random "time" documents
         → FAILS: "it" has no referent in the embedding
```

Two patterns for multi-turn memory:

- **Conversation buffer**: Include the last N turns in the query before embedding. Simple but grows the context window with each turn. Works for short conversations.
- **Summary memory**: Maintain a rolling summary of the conversation. Before each retrieval, prepend the summary to the new query. LangChain's `ConversationSummaryMemory` implements this. Scales to long conversations but requires an extra LLM call per turn.

### Reranking: When Cross-Encoders Are Worth the Latency

Standard RAG uses a **bi-encoder** for retrieval: embed query and documents separately, compare with cosine similarity. Fast, but less precise.

A **cross-encoder reranker** processes query + document together, enabling richer relevance signals — but requires one forward pass per candidate document.

**When to add reranking:**

- You retrieve top-20 candidates but inject only top-4 into the prompt (reranker selects the best 4)
- Your precision@5 is below 0.6 with bi-encoder alone
- Your domain has jargon or ambiguity that cosine similarity handles poorly
- Latency budget allows an extra 50–200ms per query

Practical options: **Cohere Rerank API** (fastest to integrate), **cross-encoders from `sentence-transformers`** (`cross-encoder/ms-marco-MiniLM-L-6-v2` for free local use).

### RAG Evaluation: What to Measure

Don't deploy a RAG system without establishing a baseline on these metrics:

| Metric                  | What It Measures                                         | How to Compute                                                   |
| ----------------------- | -------------------------------------------------------- | ---------------------------------------------------------------- |
| **Precision@K**         | Did we retrieve the right chunks?                        | # relevant chunks in top-K / K (requires labeled test set)      |
| **Answer faithfulness** | Is the answer grounded in the retrieved context?         | LLM judge: "Does this answer follow from this context?" (RAGAS)  |
| **Answer relevance**    | Does the answer actually address the question?           | LLM judge: "Does this answer address the question?" (RAGAS)      |
| **Context recall**      | Did retrieval include all chunks needed to answer fully? | Compare retrieved chunks vs. ground-truth supporting chunks      |

The **RAGAS** library (Phase 10 Day 114) automates answer faithfulness and relevance using an LLM judge. Run it on a 100-question test set before and after any retrieval change.

### Scaling: Approximate Nearest Neighbor Algorithms

Exact cosine similarity search across 10M vectors is too slow for production. Approximate Nearest Neighbor (ANN) algorithms trade a small accuracy loss for dramatic speed gains.

| Algorithm  | How It Works                                        | Best For                              | Vector DB Support          |
| ---------- | --------------------------------------------------- | ------------------------------------- | -------------------------- |
| **HNSW**   | Hierarchical graph; navigates from coarse to fine   | Low-latency production (default pick) | Qdrant, Weaviate, pgvector |
| **IVF**    | Clusters vectors, searches only nearby cluster      | Very large datasets (100M+ vectors)   | FAISS, Pinecone            |
| **Flat**   | Exact brute-force search                            | Small datasets (<100K vectors), dev   | All                        |

Use **Flat (exact) search** during development to establish ground-truth baselines. Switch to **HNSW** for production — it achieves 95–99% of exact search accuracy with 10–100x lower latency.

### Cost Structure: What RAG Actually Costs

Before proposing a RAG solution, model the full cost:

```
Total RAG Cost per Query = Embedding cost + Vector DB cost + LLM inference cost

Embedding cost   = (query_tokens / 1M) × $0.02   (text-embedding-3-small)
                 ≈ $0.000004 per query (50-token query)

Vector DB cost   = depends on tier:
                   Pinecone Starter: free up to 100K vectors
                   Pinecone Standard: ~$0.096/hr for 1M vectors
                   pgvector (self-hosted): infrastructure cost only

LLM inference    = (prompt_tokens + completion_tokens) / 1M × $2.50  (GPT-4o-mini)
                 ≈ $0.002 per query (800-token prompt, 200-token answer)

At 500 queries/day:
  Embedding:  500 × $0.000004 = $0.002/day
  LLM:        500 × $0.002    = $1.00/day
  Vector DB:  ~$2.30/day      (Pinecone standard)
  Total:      ~$3.30/day ≈ $100/month for 500 tickets/day

Engineering cost (one-time): 2–4 weeks × $100–200/hr — this dominates year-1 economics.
```

---

## Glossary

**Embedding**: A numerical vector representation of text (or other data) that captures semantic meaning. Similar texts produce similar vectors. Produced by encoder models; typical dimensions range from 384 to 3072.

**Vector database**: A database optimized for storing and searching high-dimensional vectors by semantic similarity. Unlike SQL databases (which match exact values), vector databases find the nearest neighbors in embedding space. Examples: ChromaDB, Pinecone, Qdrant, pgvector.

**Semantic search**: Retrieval based on meaning rather than exact keyword matching. A search for "churn" will return documents about "cancellations" and "attrition" because their embeddings are nearby in vector space.

**Chunking**: The process of splitting documents into smaller segments before embedding. Required because LLM context windows are finite and embedding an entire document averages out specific details, reducing retrieval precision.

**Retrieval**: The step in a RAG pipeline where the most relevant document chunks are fetched from the vector database given a query embedding. Retrieval quality is the dominant factor in overall RAG system quality.

**Augmentation**: The step where retrieved documents are injected into the LLM prompt as context. The LLM is "augmented" with external knowledge it didn't have at training time, grounding its response in real retrieved facts.

**RAG (Retrieval-Augmented Generation)**: An architecture that improves LLM outputs by retrieving relevant external documents and injecting them into the prompt before generation. Addresses the knowledge cutoff problem and reduces hallucination on factual questions.

**Dense retrieval**: Embedding-based (neural) retrieval using continuous vector representations. Captures semantic similarity and paraphrases. Contrast with sparse retrieval. Most modern RAG systems use dense retrieval as the primary method.

**Sparse retrieval**: Keyword-based retrieval using discrete term representations (TF-IDF, BM25). Excels at exact term matching. The TF-IDF lab above is sparse retrieval. Hybrid RAG systems combine dense and sparse retrieval.

**Reranking**: A post-retrieval step that uses a cross-encoder model to re-score the initial retrieved candidates for more precise relevance ranking. Adds latency but improves precision, especially in specialized domains with technical jargon.

---

## Cross-References

- **Day 38: Cosine Similarity** — The mathematical foundation for measuring vector similarity used in every RAG retrieval step. The `cosine_similarity` function in the lab above is directly built on Day 38 concepts.
- **Day 49: NLP Embeddings** — Introduction to word and sentence embeddings. RAG embeddings are the same representation technique applied at document-chunk scale for retrieval purposes.
- **Day 58: Transformers & Attention** — Transformer encoder models (BERT, RoBERTa) are the backbone of most production embedding models. Understanding how encoders produce contextual representations explains why neural embeddings capture meaning better than TF-IDF.
- **Day 60B: LLM Fine-Tuning & PEFT** — The primary alternative to RAG for adapting LLMs to private knowledge. Rule of thumb: use RAG for dynamic/frequently-changing knowledge, fine-tuning for behavior/style changes. Both can be combined (RAG + LoRA adapter) in production.
- **Phase 10 → Day 112: RAG Pipelines (Full Implementation)** — Complete hands-on RAG system with ChromaDB, LangChain, real embedding models, evaluation with RAGAS, and production deployment patterns. This is where the concepts in this lesson become working code.

---

## Next Steps

**Go deeper on implementation:**

- 🔗 **Phase 10 → Day 112**: Full RAG pipeline — ChromaDB + LangChain + evaluation
- 🔗 **Phase 10 → Day 114**: Evaluating RAG quality with RAGAS and TruLens
- 📖 [RAG paper (Lewis et al., 2020)](https://arxiv.org/abs/2005.11401) — Original Facebook Research paper
- 📖 [LangChain RAG Tutorial](https://python.langchain.com/docs/use_cases/question_answering/) — Official walkthrough
- 🔧 [ChromaDB Docs](https://docs.trychroma.com/) — open-source vector database

**Next → Phase 6 (Days 61–72)**: Cutting-edge ML applications, AI Agents, and the modern applied AI stack.
