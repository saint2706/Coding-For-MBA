# 🤖 Project 06: LLM Data Assistant

> **Phases covered**: Phase 10 (Generative AI & LLM Engineering)  
> **Difficulty**: Advanced  
> **Estimated time**: 6–10 hours

---

## 🎯 Project Overview

Build an **AI-powered data assistant** that answers natural-language questions about
business data using a Retrieval-Augmented Generation (RAG) pipeline. Users type a
question like *"Which region had the highest revenue growth last quarter?"* and the
assistant retrieves relevant data, constructs a prompt, and returns a precise answer.

This project proves you can:

- Build a full RAG pipeline: chunking → embedding → retrieval → generation (Phase 10)
- Use an LLM API (Gemini or OpenAI) for response synthesis (Phase 10)
- Build a conversational interface with memory (Phase 10)
- Apply prompt engineering and output validation (Phase 10)

---

## 📋 Business Scenario

Your RetailCo pipeline from Projects 01–05 now stores months of KPI data in SQLite.
The CFO wants to ask questions in plain English instead of writing SQL. You will
build **DataBot**, an AI assistant that:

1. Indexes the KPI database and lesson summaries into a vector store
2. Retrieves the most relevant data chunks for any question
3. Generates a grounded, factual answer using an LLM
4. Maintains a short conversation memory so follow-up questions work

---

## 🗂️ Project Structure

```
06_llm_data_assistant/
├── README.md       ← this file
├── assistant.py    ← main scaffold (fill in the TODOs)
└── requirements.txt
```

---

## 🛠️ Skills Applied

| Phase | Topics |
| ----- | ------ |
| Phase 10 | LLM APIs (Gemini/OpenAI), prompt engineering, RAG pipelines, vector DBs |
| Day 60C | Embeddings, ChromaDB, LangChain RAG |
| Day 109–115 | LLM fundamentals, fine-tuning, agents, function calling |

---

## ✅ Milestones

### Milestone 1 — Data Indexing

- [ ] Load KPI summaries from Project 01 output CSV (or generate synthetic data)
- [ ] Split data into text chunks: one chunk per row/document
- [ ] Generate embeddings using `sentence-transformers` or the Gemini Embedding API
- [ ] Store embeddings + metadata in ChromaDB (local persistent store)

### Milestone 2 — Retrieval

- [ ] Implement `retrieve(query, top_k=5)`: embed the query and return top-k chunks
- [ ] Test with 3 sample questions and inspect retrieved chunks

### Milestone 3 — Generation

- [ ] Implement `generate_answer(query, context_chunks)`:
  - Build a system prompt that instructs the LLM to answer from context only
  - Format retrieved chunks as structured context in the user prompt
  - Call the LLM API and return the answer
- [ ] Add a fallback: if no relevant chunks found, say "I don't have data on that."

### Milestone 4 — Conversation Memory

- [ ] Maintain a `history` list of `{"role": ..., "content": ...}` dicts
- [ ] Include the last 3 turns of history in each LLM call
- [ ] Implement `clear_history()` to reset conversation state

### Milestone 5 — CLI Interface

- [ ] Build a `chat()` loop that reads user input and calls the full RAG pipeline
- [ ] Handle `quit`/`exit` gracefully
- [ ] Print retrieved sources alongside the answer

---

## 🚀 Getting Started

```bash
pip install -r requirements.txt

# Set your API key:
export GEMINI_API_KEY="your-key-here"
# OR
export OPENAI_API_KEY="your-key-here"

python assistant.py
# Opens a chat loop: type your question and press Enter
```

---

## 🏆 Stretch Goals

- [ ] Add a Streamlit UI (text_input + chat_message components)
- [ ] Implement a SQL-generation mode: turn natural language into a SQLite query
- [ ] Add a re-ranking step (cross-encoder) to improve retrieval precision
- [ ] Wrap the assistant as a LangChain `ReActAgent` with SQL and search tools

---

## 📚 Reference Lessons

- Day 60C: RAG & Vector Databases — embeddings, ChromaDB, LangChain RAG pipeline
- Day 109: LLM Fundamentals — tokens, context windows, prompt engineering
- Day 110–114: LLM APIs, fine-tuning, RAG advanced patterns (Phase 10)
- Day 115: AI Agents — ReAct, function calling, tool use

---

*Happy building! Record a short demo video of DataBot answering 5 questions and add it to your portfolio.*
