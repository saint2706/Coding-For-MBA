---
day: 116
title: "LangChain & LlamaIndex — Document Loaders, Chains, Memory"
phase: 10
phaseTitle: "Generative AI & LLM Engineering"
slug: "langchain-llamaindex"
duration: 120
difficulty: "advanced"
tags:
  - langchain
  - llamaindex
  - chains
  - memory
  - document-processing
concepts:
  - "LangChain LCEL (LangChain Expression Language)"
  - "document loaders"
  - "text splitters"
  - "conversation memory"
  - "LlamaIndex query engine"
prerequisites:
  - "Day 110: Prompt Engineering Mastery"
outcomes:
  - "Build an LLM chain that processes documents using LangChain LCEL"
  - "Add conversation memory to maintain context across turns"
  - "Index a document corpus with LlamaIndex for semantic Q&A"
---

# 🎯 Day 111: LangChain & LlamaIndex

> *"The raw OpenAI API is a car engine. LangChain and LlamaIndex are the full car — steering wheel, dashboard, fuel system, and GPS included."*

---

## The "Never-Coded" Bridge

**Think about how a McKinsey partner works on a big project.**

They don't write every slide themselves. They have a **system**: 
- An Associate reads all the documents and extracts key facts
- A Consultant structures the analysis and connects the dots
- The Partner reviews and produces the final deliverable
- The whole team remembers context from previous discussions

**LangChain and LlamaIndex** let you build exactly this kind of multi-agent, multi-step system for LLMs — document reading, reasoning chains with memory, and specialized knowledge retrieval — without building the plumbing from scratch.

---

## The Technical Deep Dive

### 1. LangChain: The Orchestration Framework

LangChain provides composable building blocks (the **LCEL** — LangChain Expression Language) for building multi-step LLM pipelines.

```python
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
import os

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.2)

# Basic chain: prompt | llm | parser (the | operator composes steps)
prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a financial analyst. Be concise and precise."),
    ("human", "Summarize the key financial risks in this text:\n\n{document}")
])

chain = prompt | llm | StrOutputParser()

# Invoke the chain
result = chain.invoke({"document": "Q3 earnings showed 15% revenue decline..."})
print(result)

# Stream for real-time output (for UIs)
for chunk in chain.stream({"document": "Q3 earnings..."}):
    print(chunk, end="", flush=True)
```

### 2. Document Loaders & Text Splitters

```python
from langchain_community.document_loaders import (
    PyPDFLoader,
    WebBaseLoader,
    CSVLoader,
    Docx2txtLoader,
)
from langchain.text_splitter import RecursiveCharacterTextSplitter

# Load a PDF
loader = PyPDFLoader("annual_report_2025.pdf")
docs = loader.load()
print(f"Loaded {len(docs)} pages")
print(docs[0].page_content[:200])

# Load from web
web_loader = WebBaseLoader("https://techcrunch.com/article/...")
web_docs = web_loader.load()

# Load CSV as document (each row becomes a document)
csv_loader = CSVLoader("customers.csv", source_column="customer_id")
customer_docs = csv_loader.load()

# ⚠️ Problem: LLMs have context limits. A 100-page PDF won't fit.
# Solution: Split into overlapping chunks

splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,        # Characters per chunk
    chunk_overlap=200,      # Overlap to avoid cutting mid-sentence
    length_function=len,
    separators=["\n\n", "\n", " ", ""]  # Try to split at paragraph boundaries first
)

chunks = splitter.split_documents(docs)
print(f"Split {len(docs)} pages into {len(chunks)} chunks")
# A 100-page PDF (400KB) might become 400 chunks of 1000 chars each
```

### 3. Conversation Memory

```python
from langchain_core.prompts import MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage

# Session-level memory (in-memory, resets on restart)
class ConversationChain:
    def __init__(self, model_name: str = "gpt-4o"):
        self.llm = ChatOpenAI(model=model_name, temperature=0.3)
        self.history: list = []
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", "You are a helpful MBA finance tutor. Remember context from previous messages."),
            MessagesPlaceholder(variable_name="history"),  # ← Insert history here
            ("human", "{input}"),
        ])
        self.chain = self.prompt | self.llm | StrOutputParser()

    def chat(self, user_input: str) -> str:
        response = self.chain.invoke({
            "history": self.history,
            "input": user_input
        })
        # Update history
        self.history.append(HumanMessage(content=user_input))
        self.history.append(AIMessage(content=response))
        return response

    def reset(self):
        self.history = []

# Usage
tutor = ConversationChain()
print(tutor.chat("What is EBITDA?"))
print(tutor.chat("How does it differ from net income?"))
print(tutor.chat("Give me a real-world example of a company with high EBITDA but negative net income"))
# Each turn correctly references the previous discussion

# ⚠️ Memory grows unboundedly — in production, implement a sliding window or summary
def summarize_old_history(history: list, keep_last_n: int = 10) -> list:
    """Keep only the last N messages, summarize older ones."""
    if len(history) <= keep_last_n:
        return history
    old_messages = history[:-keep_last_n]
    recent = history[-keep_last_n:]
    # Summarize old messages in one line
    summary_text = f"[Earlier conversation summary: {len(old_messages)} messages covering topic X]"
    summary_msg = AIMessage(content=summary_text)
    return [summary_msg] + recent
```

### 4. Parallel Chains & Branching

```python
from langchain_core.runnables import RunnableParallel, RunnableLambda

# Run multiple analyses simultaneously on the same document
def create_parallel_analyzer():
    llm = ChatOpenAI(model="gpt-4o")

    # Three independent analysis chains
    risk_chain = (
        ChatPromptTemplate.from_template("Identify 3 financial risks in:\n{document}")
        | llm
        | StrOutputParser()
    )

    opportunity_chain = (
        ChatPromptTemplate.from_template("Identify 3 growth opportunities in:\n{document}")
        | llm
        | StrOutputParser()
    )

    summary_chain = (
        ChatPromptTemplate.from_template("Write a 2-sentence executive summary of:\n{document}")
        | llm
        | StrOutputParser()
    )

    # Run in parallel (saves time vs sequential)
    parallel_chain = RunnableParallel(
        risks=risk_chain,
        opportunities=opportunity_chain,
        summary=summary_chain
    )

    return parallel_chain

analyzer = create_parallel_analyzer()
result = analyzer.invoke({"document": "Q3 earnings report text..."})
# result = {"risks": "...", "opportunities": "...", "summary": "..."}
# Runs in ~3-5 seconds vs ~10-15 seconds sequentially
```

### 5. LlamaIndex: The Knowledge Graph Framework

LlamaIndex specializes in building **persistent, searchable knowledge bases** from your documents.

```python
from llama_index.core import (
    VectorStoreIndex,
    SimpleDirectoryReader,
    Settings,
)
from llama_index.core.node_parser import SentenceSplitter
from llama_index.llms.openai import OpenAI
from llama_index.embeddings.openai import OpenAIEmbedding

# Configure default LLM and embeddings
Settings.llm = OpenAI(model="gpt-4o-mini")
Settings.embed_model = OpenAIEmbedding(model="text-embedding-3-small")
Settings.node_parser = SentenceSplitter(chunk_size=512, chunk_overlap=50)

# Step 1: Load and index your documents
# Supports: PDF, Word, PowerPoint, HTML, CSV, Markdown, JSON, etc.
documents = SimpleDirectoryReader("./company_kb/").load_data()
print(f"Loaded {len(documents)} documents")

# Step 2: Build vector index (embeddings stored locally)
index = VectorStoreIndex.from_documents(documents, show_progress=True)
index.storage_context.persist("./storage")  # Save to disk

# Step 3: Create a query engine
query_engine = index.as_query_engine(
    similarity_top_k=5,  # Retrieve 5 most relevant chunks
    response_mode="compact"  # How to combine chunks: compact, tree, simple
)

# Step 4: Query your knowledge base
response = query_engine.query("What is our refund policy for enterprise customers?")
print(response.response)
print("\nSources used:")
for node in response.source_nodes:
    print(f"  - {node.metadata.get('file_name', 'unknown')} (score: {node.score:.3f})")

# Load index from disk (no re-embedding needed)
from llama_index.core import StorageContext, load_index_from_storage
storage_context = StorageContext.from_defaults(persist_dir="./storage")
loaded_index = load_index_from_storage(storage_context)
```

### 6. LangChain vs LlamaIndex: When to Use Which

```python
# Decision framework — not mutually exclusive, use together

DECISION_GUIDE = {
    "use_langchain_when": [
        "Building complex multi-step chains (extract → analyze → summarize)",
        "Need conversation memory across turns",
        "Building agents that use multiple tools",
        "Processing one document at a time (not a persistent KB)",
        "Need fine-grained control over each prompt",
        "Building production APIs with complex business logic",
    ],
    "use_llamaindex_when": [
        "Building a searchable knowledge base over 100s-1000s of documents",
        "Need semantic search over a corpus ('Find all mentions of X')",
        "Building internal wikis, support bots, document Q&A",
        "Want managed indexing with automatic chunk-and-embed",
        "Need structured data queries (SQL + semantic hybrid search)",
        "Building RAG pipelines (tomorrow's focus)",
    ],
    "use_both_when": [
        "LlamaIndex retrieves relevant context, LangChain builds the response chain",
        "Most production RAG systems use both"
    ]
}
```

---

## Senior-Level Insights

### The LangChain Maturity Trap

LangChain is excellent for rapid prototyping but has a reputation for:
- **Frequent breaking changes** between versions (major API redesigns)
- **Hidden complexity** — abstraction leaks make debugging hard
- **Over-engineering simple tasks** — a basic prompt chain doesn't need LangChain

**Rule**: Use the raw API for ≤3-step workflows. Adopt LangChain when you genuinely need: memory management, parallel chains, agent loops, or complex document processing pipelines.

### Embedding Costs Matter

Indexing 1,000 documents at ~5,000 chars each with `text-embedding-3-small` costs:
- 5 million chars ≈ 1.25 million tokens × $0.02/million ≈ **$0.025** — essentially free
- But querying every second adds up: 1,000 queries/day × 5 retrieved chunks × $0.02/million tokens = ~$0.10/day

Open-source embeddings (sentence-transformers, BAAI/bge) are free to run locally — use them for high-volume production systems.

---

## Hands-on Lab

### Exercise 1: Document Summarization Chain

```python
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

sample_text = """
OpenAI reported Q3 2025 revenue of $3.4 billion, a 200% year-over-year increase,
primarily driven by ChatGPT Enterprise subscriptions ($1.8B) and API revenue ($1.6B).
However, operating expenses reached $4.1B due to significant compute infrastructure
investment and headcount growth from 3,000 to 5,500 employees. The company remains
unprofitable but guided for Q4 revenue of $4.5B with a path to profitability by 2026.
"""

# TODO: Build a chain that:
# 1. Extracts numerical figures (first prompt)
# 2. Analyzes financial health from those figures (second prompt using first result)
# 3. Returns a single verdict: HEALTHY / CONCERNING / CRITICAL

def build_financial_health_chain(client_llm):
    """
    Build a two-step chain.
    Step 1: extract_chain — extract raw numbers
    Step 2: verdict_chain — produce one of HEALTHY/CONCERNING/CRITICAL
    Tip: use the | operator to compose a chain of prompt | llm | parser
    """
    pass

chain = build_financial_health_chain(ChatOpenAI(model="gpt-4o-mini"))
print(chain.invoke({"text": sample_text}))
```

### Exercise 2: Adding Memory to a Chatbot

```python
# TODO: Implement a customer support chatbot with conversation memory
# The bot should:
# 1. Remember customer name and issue from earlier in the conversation
# 2. Stay in role as a "TechCorp Support Agent"
# 3. Limit context to last 6 messages (trim older history)

class SupportBot:
    def __init__(self):
        self.history = []
        # TODO: Initialize LLM, prompt template with MessagesPlaceholder

    def chat(self, user_input: str) -> str:
        # TODO: Invoke chain with history, update history, trim if > 6 messages
        pass

bot = SupportBot()
print(bot.chat("Hi, I'm Sarah and my order #1234 hasn't arrived"))
print(bot.chat("It's been 3 weeks"))
print(bot.chat("Can you escalate this for me?"))
# Should remember: user is Sarah, order #1234, 3-week delay
```

### Exercise 3: LlamaIndex Knowledge Base

```python
# TODO: Build a mini knowledge base from text files
import os

# Create sample knowledge base files
os.makedirs("./kb", exist_ok=True)

with open("./kb/refund_policy.txt", "w") as f:
    f.write("""
    REFUND POLICY
    Standard products: 30-day full refund.
    Software licenses: Non-refundable after download.
    Enterprise contracts: Prorated refund with 30-day notice.
    Damaged goods: Full refund including shipping within 14 days.
    """)

with open("./kb/shipping.txt", "w") as f:
    f.write("""
    SHIPPING POLICY
    Standard shipping: 5-7 business days, $5.99
    Express shipping: 2-3 business days, $14.99
    Overnight: Next business day, $29.99
    International: 10-15 business days, $24.99
    Free shipping on orders over $75 (standard only)
    """)

# TODO: Use LlamaIndex to:
# 1. Load both files
# 2. Build a VectorStoreIndex
# 3. Create a query engine
# 4. Answer: "What is the refund policy for damaged enterprise products?"
# 5. Answer: "How much does express international shipping cost?"
```

---

## Mastery Check

**Q1**: In LangChain LCEL, what does the `|` (pipe) operator do?
<details><summary>Answer</summary>
The pipe operator composes Runnable objects into a sequential chain. Each component receives the output of the previous component as its input. For example, `prompt | llm | parser` means: format the prompt → send to the LLM → parse the string output. This is the LangChain Expression Language (LCEL) pattern, equivalent to function composition (f ∘ g ∘ h).
</details>

**Q2**: Why is infinite conversation history a problem, and how do you solve it?
<details><summary>Answer</summary>
Every message in history consumes tokens in each API call. A very long conversation costs more per turn and eventually exceeds the context window limit. Solutions: (1) Sliding window — keep only the last N messages. (2) Summarization — periodically compress old history into a summary message. (3) Summary buffer memory — auto-summarize when history exceeds a token threshold. In production, always cap memory to control costs.
</details>

**Q3**: What does `chunk_size` and `chunk_overlap` control in text splitting?
<details><summary>Answer</summary>
`chunk_size` sets the maximum characters (or tokens) per document chunk. `chunk_overlap` creates overlapping windows between adjacent chunks so that information at chunk boundaries isn't lost. For example, with size=1000 and overlap=200: chunk 1 is chars 0-1000, chunk 2 is chars 800-1800. The overlap ensures a sentence split across chunks exists fully in at least one chunk.
</details>

**Q4**: When would you choose LlamaIndex over LangChain for a project?
<details><summary>Answer</summary>
LlamaIndex is preferred when building a persistent, searchable knowledge base over many documents (100s to 1000s). It handles indexing, embedding, storage, and retrieval out of the box. LangChain is preferred for building multi-step processing pipelines, agents with tools, or conversation bots where you need fine-grained control over each step. Most production RAG systems use both: LlamaIndex for retrieval, LangChain for orchestrating the response generation pipeline.
</details>

**Q5**: What is `RunnableParallel` in LangChain and what problem does it solve?
<details><summary>Answer</summary>
`RunnableParallel` runs multiple chains concurrently on the same input and collects their outputs as a dictionary. This solves the latency problem of sequential chaining: running 3 analyses sequentially (3 × 5s = 15s) vs in parallel (max(5s, 5s, 5s) = ~5s) is 3x faster. Use it whenever multiple analyses can be done independently on the same input.
</details>

---

## Further Reading

- [LangChain Python Docs](https://python.langchain.com/docs/get_started/introduction)
- [LangChain Expression Language (LCEL)](https://python.langchain.com/docs/expression_language/)
- [LlamaIndex Documentation](https://docs.llamaindex.ai/)
- [LangChain vs LlamaIndex — Greg Kamradt's Comparison](https://www.youtube.com/watch?v=f95rGD9trL0)

---

## Summary

- ✅ **LangChain LCEL (`|`)**: Compose prompts, LLMs, parsers, and retrievers into chains.
- ✅ **Document loaders + text splitters**: Chunk any file type for LLM processing.
- ✅ **Memory**: Store conversation history; use sliding windows or summaries in production.
- ✅ **RunnableParallel**: Run multiple analyses concurrently for 3x+ speed improvement.
- ✅ **LlamaIndex**: Build persistent, queryable vector knowledge bases over document corpora.
- ✅ **Choose based on task**: Orchestration → LangChain. Knowledge retrieval → LlamaIndex. Production → use both.

**Tomorrow → Day 112**: **RAG Pipelines** — retrieval-augmented generation from scratch: embeddings, vector stores, retrieval strategies, and evaluation.
