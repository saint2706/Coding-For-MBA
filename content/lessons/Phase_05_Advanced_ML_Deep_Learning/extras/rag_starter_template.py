"""
RAG Starter Template — Phase 5 Extras
======================================
A complete Retrieval-Augmented Generation pipeline scaffold.
Companion to Day 60C (RAG & Vector Databases).

Prerequisites:
    pip install chromadb sentence-transformers openai langchain tiktoken

Architecture:
    Documents → Chunk → Embed → Store in ChromaDB
                                    ↓
    Query → Embed → Retrieve top-K → Build prompt → LLM answer

Run:
    python rag_starter_template.py
"""

from __future__ import annotations

import os
import textwrap
from typing import Optional


# ═════════════════════════════════════════════════════════════════════════════
# 1. Document Chunker
# ═════════════════════════════════════════════════════════════════════════════

def chunk_text(
    text: str,
    chunk_size: int = 500,
    overlap: int = 50,
) -> list[str]:
    """
    Split text into overlapping chunks for embedding.

    Args:
        text: Raw document text.
        chunk_size: Max characters per chunk.
        overlap: Characters shared between consecutive chunks.

    Returns:
        List of text chunks.

    Why overlap?  Ensures sentences at chunk boundaries are not
    lost — the retriever can still surface them.
    """
    chunks: list[str] = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end].strip())
        start += chunk_size - overlap
    return [c for c in chunks if c]


# ═════════════════════════════════════════════════════════════════════════════
# 2. Embedding + Vector Store (ChromaDB)
# ═════════════════════════════════════════════════════════════════════════════

def create_collection(
    collection_name: str = "mba_docs",
    persist_dir: str = "./chroma_db",
):
    """
    Create (or open) a ChromaDB collection with a sentence-transformers
    embedding function.

    Returns:
        (client, collection) tuple.
    """
    import chromadb
    from chromadb.utils.embedding_functions import (
        SentenceTransformerEmbeddingFunction,
    )

    embedding_fn = SentenceTransformerEmbeddingFunction(
        model_name="all-MiniLM-L6-v2"   # 384-dim, fast, good quality
    )

    client = chromadb.PersistentClient(path=persist_dir)
    collection = client.get_or_create_collection(
        name=collection_name,
        embedding_function=embedding_fn,
        metadata={"hnsw:space": "cosine"},
    )
    return client, collection


def ingest_documents(
    collection,
    documents: list[str],
    metadatas: Optional[list[dict]] = None,
    chunk_size: int = 500,
    overlap: int = 50,
):
    """
    Chunk documents and upsert into the ChromaDB collection.

    Args:
        collection: ChromaDB collection object.
        documents: List of full document texts.
        metadatas: Optional per-document metadata dicts.
        chunk_size: Characters per chunk.
        overlap: Overlap between chunks.
    """
    all_chunks: list[str] = []
    all_ids: list[str] = []
    all_metas: list[dict] = []

    for doc_idx, doc in enumerate(documents):
        chunks = chunk_text(doc, chunk_size, overlap)
        for chunk_idx, chunk in enumerate(chunks):
            all_chunks.append(chunk)
            all_ids.append(f"doc{doc_idx}_chunk{chunk_idx}")
            meta = {"doc_index": doc_idx, "chunk_index": chunk_idx}
            if metadatas and doc_idx < len(metadatas):
                meta.update(metadatas[doc_idx])
            all_metas.append(meta)

    # Upsert in batches (ChromaDB limit: 5461 per call)
    batch_size = 5000
    for i in range(0, len(all_chunks), batch_size):
        collection.upsert(
            ids=all_ids[i : i + batch_size],
            documents=all_chunks[i : i + batch_size],
            metadatas=all_metas[i : i + batch_size],
        )
    print(f"Ingested {len(all_chunks)} chunks from {len(documents)} documents.")


# ═════════════════════════════════════════════════════════════════════════════
# 3. Retriever
# ═════════════════════════════════════════════════════════════════════════════

def retrieve(
    collection,
    query: str,
    top_k: int = 5,
) -> list[dict]:
    """
    Embed the query, search ChromaDB, return top-K results.

    Returns:
        List of dicts with keys: id, document, distance, metadata.
    """
    results = collection.query(
        query_texts=[query],
        n_results=top_k,
        include=["documents", "distances", "metadatas"],
    )

    hits: list[dict] = []
    for i in range(len(results["ids"][0])):
        hits.append({
            "id": results["ids"][0][i],
            "document": results["documents"][0][i],
            "distance": results["distances"][0][i],
            "metadata": results["metadatas"][0][i],
        })
    return hits


# ═════════════════════════════════════════════════════════════════════════════
# 4. Prompt Builder + LLM Call
# ═════════════════════════════════════════════════════════════════════════════

RAG_SYSTEM_PROMPT = textwrap.dedent("""\
    You are a helpful MBA study assistant. Answer the user's question
    using ONLY the context provided below.  If the context does not
    contain the answer, say "I don't have enough information to answer."

    Context:
    {context}
""")


def build_rag_prompt(query: str, hits: list[dict]) -> list[dict]:
    """
    Assemble the RAG prompt from retrieved chunks.

    Returns:
        OpenAI-style messages list [{"role": ..., "content": ...}].
    """
    context = "\n---\n".join(h["document"] for h in hits)
    return [
        {"role": "system", "content": RAG_SYSTEM_PROMPT.format(context=context)},
        {"role": "user", "content": query},
    ]


def ask_llm(
    messages: list[dict],
    model: str = "gpt-4o-mini",
    temperature: float = 0.2,
) -> str:
    """
    Send the RAG prompt to an OpenAI-compatible LLM.

    Requires:  OPENAI_API_KEY environment variable.
    Swap model to "gpt-4o" or a local Ollama endpoint as needed.
    """
    from openai import OpenAI

    client = OpenAI()  # uses OPENAI_API_KEY env var
    response = client.chat.completions.create(
        model=model,
        messages=messages,
        temperature=temperature,
        max_tokens=1024,
    )
    return response.choices[0].message.content


# ═════════════════════════════════════════════════════════════════════════════
# 5. Full RAG Pipeline
# ═════════════════════════════════════════════════════════════════════════════

def rag_answer(collection, query: str, top_k: int = 5) -> str:
    """
    End-to-end: query → retrieve → prompt → LLM answer.
    """
    hits = retrieve(collection, query, top_k=top_k)
    messages = build_rag_prompt(query, hits)
    return ask_llm(messages)


# ═════════════════════════════════════════════════════════════════════════════
# DEMO — Runnable without an API key (retrieval-only)
# ═════════════════════════════════════════════════════════════════════════════

SAMPLE_DOCS = [
    textwrap.dedent("""\
        The Price-to-Earnings (P/E) ratio is one of the most widely used
        valuation metrics. It compares a company's current share price to
        its earnings per share (EPS). A high P/E may indicate expected
        growth, while a low P/E might signal undervaluation or risk.
        The trailing P/E uses the last 12 months of earnings, while the
        forward P/E uses analyst forecasts. MBA students should compare
        P/E ratios within the same industry, never across industries.
    """),
    textwrap.dedent("""\
        Discounted Cash Flow (DCF) analysis estimates the intrinsic value
        of a business by projecting future free cash flows and discounting
        them to present value using the Weighted Average Cost of Capital
        (WACC). Key inputs include revenue growth rate, operating margins,
        capital expenditure, and terminal value assumptions. DCF is highly
        sensitive to the discount rate — a 1% change can swing the
        valuation by 15-25%.
    """),
    textwrap.dedent("""\
        The Balanced Scorecard is a strategic management framework that
        tracks performance across four perspectives: Financial, Customer,
        Internal Process, and Learning & Growth. Developed by Kaplan and
        Norton, it prevents over-reliance on financial metrics alone.
        Each perspective should have 3-5 KPIs linked to the organisation's
        strategic objectives.
    """),
]


if __name__ == "__main__":
    print("RAG Starter Template — Phase 5 Extras")
    print("=" * 55)

    # 1. Chunk
    for i, doc in enumerate(SAMPLE_DOCS):
        chunks = chunk_text(doc, chunk_size=200, overlap=30)
        print(f"  Doc {i}: {len(doc)} chars → {len(chunks)} chunks")

    # 2. Ingest into ChromaDB
    print("\nCreating ChromaDB collection...")
    try:
        _, collection = create_collection(persist_dir="./demo_chroma")
        ingest_documents(collection, SAMPLE_DOCS, chunk_size=200, overlap=30)

        # 3. Retrieve
        query = "What is the P/E ratio and how should MBA students use it?"
        print(f"\nQuery: {query}")
        hits = retrieve(collection, query, top_k=3)
        for i, hit in enumerate(hits):
            print(f"\n  Hit {i + 1} (distance={hit['distance']:.4f}):")
            print(f"    {hit['document'][:120]}...")

        # 4. LLM answer (only if API key is set)
        if os.environ.get("OPENAI_API_KEY"):
            print("\n--- LLM Answer ---")
            answer = rag_answer(collection, query, top_k=3)
            print(answer)
        else:
            print("\n💡 Set OPENAI_API_KEY to get LLM-generated answers.")
            print("   The retrieval step above works without an API key.")

    except ImportError as e:
        print(f"\n⚠️  Missing dependency: {e}")
        print("   Install with: pip install chromadb sentence-transformers")
        print("   The chunker and prompt builder work without these deps.")

    print("\n" + "=" * 55)
    print("✅ RAG pipeline demonstrated!")
    print("Next: Swap SAMPLE_DOCS with your own data and add an LLM key.")
