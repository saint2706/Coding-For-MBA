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

## Next Steps

**Go deeper on implementation:**
- 🔗 **Phase 10 → Day 112**: Full RAG pipeline — ChromaDB + LangChain + evaluation
- 🔗 **Phase 10 → Day 114**: Evaluating RAG quality with RAGAS and TruLens
- 📖 [RAG paper (Lewis et al., 2020)](https://arxiv.org/abs/2005.11401) — Original Facebook Research paper
- 📖 [LangChain RAG Tutorial](https://python.langchain.com/docs/use_cases/question_answering/) — Official walkthrough
- 🔧 [ChromaDB Docs](https://docs.trychroma.com/) — open-source vector database

**Next → Phase 6 (Days 61–72)**: Cutting-edge ML applications, AI Agents, and the modern applied AI stack.
