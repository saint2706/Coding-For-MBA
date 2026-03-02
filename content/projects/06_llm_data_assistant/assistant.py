"""
Project 06: LLM Data Assistant — RAG Scaffold
==============================================
Phase 10 skills showcase.

Fill in every section marked TODO.
Run with:  python assistant.py
Requires GEMINI_API_KEY or OPENAI_API_KEY environment variable.
"""

from __future__ import annotations

import os
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd

# ─────────────────────────────────────────────────────────────────────────────
# Configuration
# ─────────────────────────────────────────────────────────────────────────────

CHROMA_DIR = Path(".chroma_db")
COLLECTION_NAME = "retailco_kpis"
TOP_K = 5
MAX_HISTORY_TURNS = 3

# Detect which LLM backend to use
USE_GEMINI = bool(os.getenv("GEMINI_API_KEY"))
USE_OPENAI = bool(os.getenv("OPENAI_API_KEY"))


# ─────────────────────────────────────────────────────────────────────────────
# MILESTONE 1 — Data Indexing
# ─────────────────────────────────────────────────────────────────────────────


def load_documents(csv_path: str | None = None) -> list[dict[str, Any]]:
    """
    Load KPI data and convert each row to a text document chunk.

    TODO:
    1. If csv_path exists, load with pd.read_csv().
       Otherwise generate synthetic monthly KPI rows (12 rows × 4 regions).
    2. For each row, create a dict:
       {
           "id":      f"kpi_{i}",
           "text":    f"Region {row.region}, Month {row.month}/{row.year}: "
                      f"Revenue ${row.total_revenue:,.0f}, "
                      f"AOV ${row.avg_order_value:.2f}, "
                      f"Return Rate {row.return_rate:.1f}%",
           "metadata": {"region": ..., "year": ..., "month": ...}
       }
    3. Return the list of document dicts.

    Hint for synthetic data:
        months = pd.date_range("2024-01", periods=12, freq="ME")
        regions = ["North", "South", "East", "West"]
        rows = [{"region": r, "year": m.year, "month": m.month,
                 "total_revenue": ..., ...} for r in regions for m in months]
    """
    # Your implementation here...
    raise NotImplementedError("Implement load_documents()")


def build_index(documents: list[dict[str, Any]]) -> Any:
    """
    Embed documents and store in a ChromaDB collection.

    TODO:
    1. Import chromadb and sentence_transformers.SentenceTransformer.
    2. Create a persistent ChromaDB client: chromadb.PersistentClient(path=str(CHROMA_DIR)).
    3. Get or create collection: client.get_or_create_collection(COLLECTION_NAME).
    4. Load embedding model: SentenceTransformer("all-MiniLM-L6-v2").
    5. Embed all document["text"] values: model.encode([d["text"] for d in documents]).
    6. Add to collection: collection.add(
           ids=[d["id"] for d in documents],
           embeddings=embeddings.tolist(),
           documents=[d["text"] for d in documents],
           metadatas=[d["metadata"] for d in documents],
       )
    7. Print f"  Indexed {len(documents)} documents into ChromaDB."
    8. Return the collection.

    Hint:
        from sentence_transformers import SentenceTransformer
        import chromadb
    """
    # Your implementation here...
    raise NotImplementedError("Implement build_index()")


# ─────────────────────────────────────────────────────────────────────────────
# MILESTONE 2 — Retrieval
# ─────────────────────────────────────────────────────────────────────────────


def retrieve(query: str, collection: Any, top_k: int = TOP_K) -> list[str]:
    """
    Embed the query and return the top-k most similar document texts.

    TODO:
    1. Import SentenceTransformer and encode the query.
    2. Query the collection: results = collection.query(
           query_embeddings=[embedding.tolist()], n_results=top_k
       )
    3. Return results["documents"][0]  (a list of text strings).

    Hint:
        from sentence_transformers import SentenceTransformer
        model = SentenceTransformer("all-MiniLM-L6-v2")
        embedding = model.encode([query])[0]
    """
    # Your implementation here...
    raise NotImplementedError("Implement retrieve()")


# ─────────────────────────────────────────────────────────────────────────────
# MILESTONE 3 — Generation
# ─────────────────────────────────────────────────────────────────────────────


def build_prompt(query: str, context_chunks: list[str], history: list[dict]) -> list[dict]:
    """
    Build the message list for the LLM API call.

    TODO:
    1. Create a system message:
       "You are DataBot, a data analyst assistant for RetailCo.
        Answer questions using ONLY the data provided in the context.
        If the context does not contain the answer, say 'I don't have data on that.'
        Be concise and cite specific numbers."
    2. Add the last MAX_HISTORY_TURNS turns from history (alternate user/assistant).
    3. Build the current user message:
       "Context:\n" + "\n---\n".join(context_chunks) + "\n\nQuestion: " + query
    4. Return the full messages list.
    """
    # Your implementation here...
    raise NotImplementedError("Implement build_prompt()")


def call_llm(messages: list[dict]) -> str:
    """
    Send messages to the configured LLM and return the response text.

    TODO (choose one backend):

    Gemini:
        import google.generativeai as genai
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        model = genai.GenerativeModel("gemini-1.5-flash")
        # Gemini uses a different message format — convert messages to
        # a single formatted string or use the chat API.
        response = model.generate_content(formatted_prompt)
        return response.text

    OpenAI:
        from openai import OpenAI
        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
        )
        return response.choices[0].message.content

    Fallback (no API key — for testing):
        Return a hardcoded string: "[Mock LLM] Based on the context: ..."
    """
    # Your implementation here...
    raise NotImplementedError("Implement call_llm()")


def generate_answer(query: str, context_chunks: list[str], history: list[dict]) -> str:
    """
    Build the prompt and call the LLM. Return the answer string.

    TODO:
    1. If context_chunks is empty, return "I don't have data on that topic."
    2. Call build_prompt(query, context_chunks, history).
    3. Call call_llm(messages) and return the result.
    """
    # Your implementation here...
    raise NotImplementedError("Implement generate_answer()")


# ─────────────────────────────────────────────────────────────────────────────
# MILESTONE 4 — Conversation Memory
# ─────────────────────────────────────────────────────────────────────────────

_history: list[dict] = []


def add_to_history(role: str, content: str) -> None:
    """Append a message to the conversation history."""
    _history.append({"role": role, "content": content})


def clear_history() -> None:
    """Reset the conversation history."""
    _history.clear()


# ─────────────────────────────────────────────────────────────────────────────
# MILESTONE 5 — CLI Interface
# ─────────────────────────────────────────────────────────────────────────────


def chat(collection: Any) -> None:
    """
    Run an interactive chat loop in the terminal.

    TODO:
    1. Print a welcome banner and instructions.
    2. Loop: read input with input("You: ").strip().
    3. If input is empty, continue. If "quit" or "exit", break.
    4. Call retrieve(query, collection) to get context_chunks.
    5. Call generate_answer(query, context_chunks, _history).
    6. Print "DataBot: {answer}" and the source chunks.
    7. Call add_to_history("user", query) and add_to_history("assistant", answer).
    """
    print("\n" + "=" * 55)
    print("  DataBot — RetailCo AI Data Assistant")
    print("=" * 55)
    print("  Type your question and press Enter.")
    print("  Type 'clear' to reset memory. Type 'quit' to exit.")
    print("=" * 55 + "\n")

    # Your implementation here...
    raise NotImplementedError("Implement chat()")


# ─────────────────────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────────────────────


if __name__ == "__main__":
    if not USE_GEMINI and not USE_OPENAI:
        print("⚠️  No API key found. Set GEMINI_API_KEY or OPENAI_API_KEY.")
        print("   The assistant will use a mock LLM response for testing.\n")

    print("[1/2] Building knowledge index...")
    docs = load_documents()
    collection = build_index(docs)

    print("[2/2] Starting chat interface...")
    chat(collection)
