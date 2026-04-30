---
day: 120
title: "Capstone: Build an AI-Powered Data Assistant"
phase: 10
phaseTitle: "Generative AI & LLM Engineering"
slug: "capstone-ai-data-assistant"
duration: 180
difficulty: "advanced"
tags:
  - capstone
  - rag
  - agents
  - evaluation
  - responsible-ai
  - end-to-end
concepts:
  - "end-to-end LLM application"
  - "RAG + agents + evaluation"
  - "production-ready deployment"
  - "responsible AI principles"
prerequisites:
  - "All Phase 10 days (109-119)"
outcomes:
  - "Build a complete AI-powered data assistant combining RAG, agents, guardrails, and evaluation"
  - "Apply responsible AI principles to every layer of the system"
  - "Present a system design that connects technical implementation to business value"
---

# 🎯 Day 120: Capstone — AI-Powered Data Assistant

> *"Everything you build in tech is ultimately about making a human's life better. Today, you build something that actually does that."*

---

## The "Never-Coded" Bridge

**You are the Head of Data Science at a growing e-commerce company.**

Your CEO asks: *"Why do I need to bother the data team every time I want a simple report? Can't we just ask a machine?"*

You've been building toward this all of Phase 10. Today, you build the **AI Data Assistant** — a production-ready system that lets any business user ask questions in plain English and get accurate, sourced, cost-optimized, ethically-deployed answers backed by real company data.

By the end of today, you'll have built a complete system with:
- **Knowledge base** (company docs + financial summaries via RAG)
- **Database query agent** (SQL-capable for live data)
- **Cost optimization** (caching, model routing)
- **Guardrails** (topic restrictions, hallucination detection)
- **Evaluation pipeline** (RAGAS + LLM-as-judge)
- **Model card** (responsible deployment documentation)

---

## Project Specification

### System Architecture

```
                 ┌─────────────────────────────────────┐
                 │        USER QUESTION                 │
                 └─────────────┬───────────────────────┘
                               │
                 ┌─────────────▼───────────────────────┐
                 │    GUARDRAIL LAYER                   │
                 │  (Topic filter, input sanitization)  │
                 └─────────────┬───────────────────────┘
                               │
              ┌────────────────▼────────────────────┐
              │        SEMANTIC CACHE               │
              │  (Check if similar question answered)│
              └───┬───────────────────────┬─────────┘
                  │ MISS                  │ HIT
                  ▼                       ▼
    ┌─────────────────────┐    ┌──────────────────────┐
    │  ORCHESTRATOR       │    │  Return cached        │
    │  (GPT-4o decides    │    │  answer instantly     │
    │   RAG or Agent)     │    └──────────────────────┘
    └──────┬──────────────┘
           │
    ┌──────▼──────────┬────────────────────┐
    │                 │                    │
    ▼                 ▼                    ▼
RAG PIPELINE    SQL AGENT          CALCULATION AGENT
(Company docs)  (Live sales DB)    (Math, trends)
    │                 │                    │
    └─────────────────┴────────────────────┘
                       │
          ┌────────────▼─────────────┐
          │  RESPONSE SYNTHESIZER    │
          │  (Combine, cite sources) │
          └────────────┬─────────────┘
                       │
          ┌────────────▼─────────────┐
          │  EVALUATION              │
          │  (Faithfulness check,    │
          │   confidence scoring)    │
          └────────────┬─────────────┘
                       │
          ┌────────────▼─────────────┐
          │  FINAL ANSWER + SOURCES  │
          └──────────────────────────┘
```

---

## Implementation

### Part 1: Project Setup and Data

```python
# data_setup.py — Generate the demo knowledge base

import os
import json
from pathlib import Path

# ─────────────────────────────────────────
# Create company knowledge base files
# ─────────────────────────────────────────
KB_DIR = Path("./company_knowledge")
KB_DIR.mkdir(exist_ok=True)

documents = {
    "policies/refund_policy.txt": """
REFUND & RETURN POLICY (Effective January 2026)

Standard Products: 30-day full refund from purchase date, no questions asked.
Electronics: 15-day return window. Must be in original packaging.
Software Licenses: Non-refundable after download/activation.
Enterprise Contracts: Prorated refund with 30-day written notice.
Damaged Goods: Full refund + return shipping within 14 days of delivery.
Subscription Services: Refund pro-rated to next billing date.

Process: All refunds processed to original payment method within 5-7 business days.
Exceptions require VP Customer Success approval.
""",
    "policies/shipping_policy.txt": """
SHIPPING POLICY

Domestic:
- Standard: 5-7 business days, $5.99 (free over $75)
- Express: 2-3 business days, $14.99
- Overnight: Next business day, $29.99

International:
- Standard: 10-15 business days, $24.99
- Express: 5-7 business days, $49.99
- Customs delays may extend timelines

Order cutoff: 2pm EST for same-day processing.
No shipping to P.O. boxes for Electronics category.
""",
    "finance/q3_2025_summary.txt": """
Q3 2025 FINANCIAL SUMMARY — TECHCORP

Revenue:          $12.4M  (+34% YoY, +35% QoQ from $9.2M in Q2)
Gross Profit:     $5.7M   (Gross margin: 46%, up from 44% in Q2)
Operating Income: $2.1M   (Operating margin: 17%)
Net Income:       $1.8M   (Net margin: 14.5%)

Revenue by Product:
  ProSuite:      $5.1M (41% of revenue)
  DataEngine:    $4.2M (34% of revenue)
  AnalyticsHub:  $3.1M (25% of revenue)

Revenue by Region:
  Americas:      $7.9M (64%)
  EMEA:          $3.1M (25%)
  APAC:          $1.4M (11%)

Customers:       312 enterprise accounts (+22 net new in Q3)
Churn Rate:      3.2% (down from 4.1% in Q2 — lowest ever)
NPS:             68 (up from 61 in Q2)
ARR:             $49.6M

Headcount:       201 employees (up from 180 in Q2 2025)
""",
    "products/product_overview.txt": """
TECHCORP PRODUCT PORTFOLIO

1. ProSuite ($99/month per seat)
   - Core data analytics platform
   - Drag-and-drop dashboards, 50+ connectors
   - Up to 10 users, 5GB data storage
   - SLA: 99.5% uptime

2. DataEngine ($149/month per seat)  
   - Advanced analytics + ML pipelines
   - Python/R notebooks, AutoML
   - Up to 25 users, 50GB data storage
   - SLA: 99.9% uptime

3. AnalyticsHub Enterprise ($299/month per seat)
   - Full platform + AI assistant
   - Unlimited users, 1TB storage
   - SSO, custom branding, dedicated support
   - SLA: 99.99% uptime, 24/7 support
""",
    "hr/company_info.txt": """
TECHCORP COMPANY OVERVIEW

Founded: 2019 by Alice Chen (CEO) and Bob Martinez (CTO)
Headquarters: San Francisco, CA
Team Size: 201 employees as of Q3 2025
Offices: San Francisco (HQ), New York, London

Investors: Series B ($45M led by Andreessen Horowitz, 2024)
Total Funding: $62M
Valuation: Undisclosed

Mission: Make data analysis accessible to every business professional.
Values: Customer obsession, transparency, and continuous learning.

Benefits: Unlimited PTO, full remote option, $2,000 annual learning budget,
equity for all employees, monthly team events.
"""
}

for filepath, content in documents.items():
    full_path = KB_DIR / filepath
    full_path.parent.mkdir(parents=True, exist_ok=True)
    full_path.write_text(content.strip())

print(f"Created {len(documents)} knowledge base documents")
```

### Part 2: RAG Component

```python
# rag_component.py

from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_community.vectorstores import Chroma
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import DirectoryLoader, TextLoader
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

def build_knowledge_base(kb_dir: str = "./company_knowledge") -> Chroma:
    """Load, chunk, embed, and store all knowledge base documents."""
    loader = DirectoryLoader(
        kb_dir,
        glob="**/*.txt",
        loader_cls=TextLoader,
        show_progress=True
    )
    docs = loader.load()
    print(f"Loaded {len(docs)} documents")

    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    chunks = splitter.split_documents(docs)
    print(f"Split into {len(chunks)} chunks")

    embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
    vectorstore = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory="./chroma_store",
        collection_name="company_kb"
    )
    print(f"Indexed {vectorstore._collection.count()} chunks")
    return vectorstore

def create_rag_chain(vectorstore: Chroma):
    """Create the RAG response chain."""
    retriever = vectorstore.as_retriever(
        search_type="similarity",
        search_kwargs={"k": 5}
    )

    RAG_PROMPT = ChatPromptTemplate.from_template("""
You are a TechCorp business data assistant. Answer the question using ONLY the provided context.
Include source attribution at the end of your answer.
If the context doesn't contain the answer, say: "I don't have that information in my knowledge base."
Never guess or make up information.

CONTEXT:
{context}

QUESTION: {question}

ANSWER:
""")

    def format_docs_with_sources(docs):
        parts = []
        for doc in docs:
            source = doc.metadata.get("source", "unknown")
            parts.append(f"[Source: {source}]\n{doc.page_content}")
        return "\n\n---\n\n".join(parts)

    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

    return (
        {"context": retriever | format_docs_with_sources, "question": RunnablePassthrough()}
        | RAG_PROMPT
        | llm
        | StrOutputParser()
    )
```

### Part 3: SQL Agent Component

```python
# sql_agent.py

import sqlite3
import json
from openai import OpenAI

client = OpenAI()

def setup_demo_database() -> sqlite3.Connection:
    """Create an in-memory demo sales database."""
    conn = sqlite3.connect(":memory:")
    cursor = conn.cursor()

    cursor.executescript("""
        CREATE TABLE products (
            id INTEGER PRIMARY KEY,
            name TEXT,
            price_monthly REAL,
            tier TEXT
        );

        CREATE TABLE customers (
            id INTEGER PRIMARY KEY,
            name TEXT,
            company TEXT,
            product_id INTEGER,
            region TEXT,
            arr REAL,
            status TEXT,
            joined_date TEXT
        );

        CREATE TABLE revenue_monthly (
            year INTEGER,
            month INTEGER,
            product TEXT,
            region TEXT,
            revenue REAL
        );

        INSERT INTO products VALUES
            (1, 'ProSuite', 99.0, 'starter'),
            (2, 'DataEngine', 149.0, 'growth'),
            (3, 'AnalyticsHub', 299.0, 'enterprise');

        INSERT INTO revenue_monthly VALUES
            (2025, 7, 'ProSuite', 'Americas', 1700000),
            (2025, 7, 'DataEngine', 'Americas', 1400000),
            (2025, 7, 'AnalyticsHub', 'Americas', 900000),
            (2025, 8, 'ProSuite', 'Americas', 1750000),
            (2025, 8, 'DataEngine', 'Americas', 1450000),
            (2025, 8, 'AnalyticsHub', 'Americas', 1050000),
            (2025, 9, 'ProSuite', 'Americas', 1750000),
            (2025, 9, 'DataEngine', 'Americas', 1400000),
            (2025, 9, 'AnalyticsHub', 'Americas', 1100000);
    """)
    conn.commit()
    return conn

def sql_agent(user_question: str, conn: sqlite3.Connection) -> str:
    """Agent that converts natural language to SQL and executes it."""
    schema = """
Tables:
- products(id, name, price_monthly, tier)
- customers(id, name, company, product_id, region, arr, status, joined_date)
- revenue_monthly(year, month, product, region, revenue)
    """

    # Step 1: Generate SQL
    sql_response = client.chat.completions.create(
        model="gpt-4o-mini",
        response_format={"type": "json_object"},
        messages=[{
            "role": "user",
            "content": f"""
Convert this business question to SQL. Return JSON: {{"sql": "<query>", "explanation": "<brief description>"}}

Database schema: {schema}

Question: {user_question}

Rules:
- Only use SELECT (no INSERT/UPDATE/DELETE)
- Only use tables defined in the schema
- If the question cannot be answered with the available tables, return {{"sql": null, "explanation": "Cannot answer: <reason>"}}
"""
        }]
    )
    sql_data = json.loads(sql_response.choices[0].message.content)

    if not sql_data.get("sql"):
        return f"Cannot query database: {sql_data.get('explanation')}"

    try:
        cursor = conn.cursor()
        cursor.execute(sql_data["sql"])
        rows = cursor.fetchall()
        columns = [description[0] for description in cursor.description]

        if not rows:
            return "Query executed but returned no results."

        # Format results
        result_data = [dict(zip(columns, row)) for row in rows]

        # Step 2: Interpret results
        interpretation = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{
                "role": "user",
                "content": f"""
Business question: {user_question}
SQL query used: {sql_data['sql']}
Raw results: {json.dumps(result_data, indent=2)}

Provide a clear, business-friendly answer to the original question based on the data.
Include specific numbers. Be concise (2-4 sentences max).
"""
            }]
        ).choices[0].message.content

        return interpretation

    except sqlite3.Error as e:
        return f"Database error: {e}"
```

### Part 4: The Main Orchestrator

```python
# main_assistant.py

import re
import numpy as np
from openai import OpenAI

client_oai = OpenAI()

class DataAssistant:
    """
    Production AI data assistant combining RAG, SQL agent,
    semantic caching, guardrails, and evaluation.
    """

    ALLOWED_TOPICS = ["revenue", "product", "customer", "policy", "shipping", "refund",
                      "employee", "finance", "company", "sales", "performance", "earnings"]

    BLOCKED_TOPICS = ["competitor salary", "lawsuit", "personal data", "password", "acquisition rumour"]

    def __init__(self, rag_chain, sql_agent_fn, db_conn):
        self.rag_chain = rag_chain
        self.sql_agent = sql_agent_fn
        self.db_conn = db_conn
        self.cache: list[dict] = []
        self.query_log: list[dict] = []

    def _is_allowed_topic(self, question: str) -> tuple[bool, str]:
        """Guardrail: check if question is in scope."""
        q_lower = question.lower()
        for blocked in self.BLOCKED_TOPICS:
            if blocked in q_lower:
                return False, f"I can't answer questions about '{blocked}' — this is outside my scope."
        return True, ""

    def _embed(self, text: str) -> list[float]:
        return client_oai.embeddings.create(
            input=text, model="text-embedding-3-small"
        ).data[0].embedding

    def _check_cache(self, question: str, threshold: float = 0.92) -> str | None:
        if not self.cache:
            return None
        q_emb = np.array(self._embed(question))
        for entry in self.cache:
            cached_emb = np.array(entry["embedding"])
            sim = float(np.dot(q_emb, cached_emb) / (np.linalg.norm(q_emb) * np.linalg.norm(cached_emb)))
            if sim >= threshold:
                entry["hits"] = entry.get("hits", 0) + 1
                print(f"  [CACHE HIT] similarity={sim:.3f}")
                return entry["answer"]
        return None

    def _route_question(self, question: str) -> str:
        """Route to RAG or SQL agent based on question type."""
        routing = client_oai.chat.completions.create(
            model="gpt-4o-mini",
            response_format={"type": "json_object"},
            messages=[{
                "role": "user",
                "content": f"""
Classify this question. Return JSON: {{"route": "rag" or "sql", "reason": "<brief>"}}

- "rag": Questions about policies, company history, product descriptions, HR info
- "sql": Questions requiring live data calculations, figures by date/period/region

Question: {question}
"""
            }]
        ).choices[0].message.content

        import json
        data = json.loads(routing)
        print(f"  [ROUTE] {data['route'].upper()} — {data['reason']}")
        return data["route"]

    def ask(self, question: str) -> dict:
        """Main entry point for asking the data assistant."""
        import time
        start = time.time()

        # Step 1: Guardrail check
        allowed, block_reason = self._is_allowed_topic(question)
        if not allowed:
            return {"answer": block_reason, "source": "guardrail", "cached": False}

        # Step 2: Cache check
        cached = self._check_cache(question)
        if cached:
            latency = int((time.time() - start) * 1000)
            return {"answer": cached, "source": "cache", "cached": True, "latency_ms": latency}

        # Step 3: Route and answer
        route = self._route_question(question)
        if route == "sql":
            answer = self.sql_agent(question, self.db_conn)
            source = "sql_agent"
        else:
            answer = self.rag_chain.invoke(question)
            source = "rag"

        # Step 4: Store in cache
        self.cache.append({
            "embedding": self._embed(question),
            "question": question,
            "answer": answer,
            "hits": 0,
        })

        latency = int((time.time() - start) * 1000)

        # Step 5: Log
        self.query_log.append({
            "question": question, "answer": answer,
            "source": source, "latency_ms": latency
        })

        return {"answer": answer, "source": source, "cached": False, "latency_ms": latency}

    def get_stats(self) -> dict:
        """Usage statistics for monitoring."""
        cache_hits = sum(e.get("hits", 0) for e in self.cache)
        return {
            "total_queries": len(self.query_log),
            "cache_hits": cache_hits,
            "cache_hit_rate": cache_hits / max(len(self.query_log), 1),
            "avg_latency_ms": sum(q["latency_ms"] for q in self.query_log) / max(len(self.query_log), 1),
        }
```

### Part 5: Run It All Together

```python
# run_demo.py

from data_setup import *      # creates knowledge base files
from rag_component import *   # build_knowledge_base, create_rag_chain
from sql_agent import *       # setup_demo_database, sql_agent
from main_assistant import *  # DataAssistant

# Initialize all components
print("=== INITIALIZING TECHCORP DATA ASSISTANT ===\n")

vectorstore = build_knowledge_base("./company_knowledge")
rag_chain = create_rag_chain(vectorstore)
db_conn = setup_demo_database()

assistant = DataAssistant(rag_chain, sql_agent, db_conn)

# Test queries covering all capabilities
test_questions = [
    # RAG questions (policy/company knowledge)
    "What is our refund policy for software licenses?",
    "How long does international shipping take?",
    "Who founded TechCorp and when?",

    # SQL questions (live data)
    "What was total revenue in Q3 2025 for all products in the Americas?",
    "Which product had the highest revenue in 2025?",

    # Cache test (semantically similar to first question)
    "Can I get a refund for a software product I already downloaded?",

    # Guardrail test
    "What are your competitors' salaries?",
]

print("\n=== RUNNING TEST QUERIES ===\n")
for q in test_questions:
    print(f"Q: {q}")
    result = assistant.ask(q)
    print(f"A: {result['answer'][:200]}...")
    print(f"   [Source: {result['source']} | Cached: {result['cached']} | Latency: {result.get('latency_ms', 0)}ms]\n")

print(f"\n=== SYSTEM STATS ===")
print(assistant.get_stats())
```

### Part 6: Evaluation

```python
# evaluate_assistant.py

from ragas import evaluate
from ragas.metrics import faithfulness, answer_relevancy
from datasets import Dataset
import json

# Golden Q&A test set
eval_data = {
    "question": [
        "What is TechCorp's refund policy for standard products?",
        "What was Q3 2025 total revenue?",
        "Who are TechCorp's founders?",
    ],
    "answer": [
        "Standard products get a 30-day full refund from purchase date, no questions asked.",
        "Q3 2025 revenue was $12.4 million, up 34% year-over-year.",
        "TechCorp was founded in 2019 by Alice Chen (CEO) and Bob Martinez (CTO).",
    ],
    "contexts": [
        ["Standard Products: 30-day full refund from purchase date, no questions asked."],
        ["Q3 2025 Revenue: $12.4M (+34% YoY, +35% QoQ from $9.2M in Q2)"],
        ["Founded: 2019 by Alice Chen (CEO) and Bob Martinez (CTO)"],
    ],
    "ground_truth": [
        "30-day full refund from purchase date.",
        "$12.4 million, +34% YoY.",
        "Alice Chen and Bob Martinez in 2019.",
    ],
}

dataset = Dataset.from_dict(eval_data)
result = evaluate(dataset=dataset, metrics=[faithfulness, answer_relevancy])
print("\n=== RAGAS EVALUATION RESULTS ===")
for metric, score in result.items():
    status = "✅" if score > 0.85 else "⚠️"
    print(f"  {status} {metric}: {score:.3f}")
```

---

## Reflection Exercises

### Exercise 1: System Design Review

Review your implementation and answer:
1. Which component is the most likely to fail in production, and why?
2. How would you add authentication so only authorized users can query the system?
3. How would you handle a query that requires BOTH live SQL data AND policy information?
4. At 10,000 queries/day, what would the estimated monthly cost be? (Calculate using Day 116 formulas)

### Exercise 2: Scale to Enterprise

Design (without implementing) how you would scale this system to:
- 100,000 documents in the knowledge base (not just 5 text files)
- 50,000 users per day
- Multi-tenant (each customer sees only their own data)
- Real-time data (sales figures updated every 5 minutes)

### Exercise 3: The Model Card

Write a complete model card (following Day 119's template) for the Data Assistant you just built. Include:
- Intended use and limitations
- Performance metrics
- Known biases or failure modes
- Privacy considerations
- Responsible deployment notes

---

## Mastery Check

**Q1**: In this capstone system, what role does the "orchestrator" play, and why not just route everything to the RAG pipeline?
<details><summary>Answer</summary>
The orchestrator routes questions to the most appropriate tool: RAG for document-based knowledge (policies, company history, product descriptions) and the SQL agent for quantitative live-data questions. Routing everything to RAG would fail for data questions because: (1) RAG retrieves text summaries which may be outdated or incomplete for numerical queries, (2) SQL agents get exact, current figures from the database, (3) Different prompts work better for different task types. The orchestrator is the brain that ensures each question gets the tool optimized for it.
</details>

**Q2**: This system uses semantic caching. What query WOULD NOT get a cache hit even though it's asking the same thing?
<details><summary>Answer</summary>
Queries that are phrased so differently that their embedding vectors fall below the similarity threshold (0.92). Examples: (1) Same question in a different language ("Was ist unsere Rückgaberecht?" vs "What is our refund policy?"), (2) Highly technical vs. informal phrasing ("What is the temporal scope of our return guarantee for standard product SKUs?" vs "Can I return this?"), (3) Questions with opposite polarity ("What CAN'T I return?" vs "What CAN I return?"). Also, questions about different topics that happen to use similar words won't hit cache even if similar-sounding.
</details>

**Q3**: The system routes "What was Q3 revenue?" to the SQL agent. But what if the demo database doesn't have that exact data?
<details><summary>Answer</summary>
The SQL agent generates a query, which returns no rows (or an error). The agent then returns: "Query executed but returned no results" or a clear error message. The assistant should then: (1) Try the RAG pipeline as a fallback (the Q3 summary is in the knowledge base text files), (2) Tell the user: "Live database doesn't have this breakdown, but our Q3 summary states: [RAG result]", (3) Log the query gap for the data team to add to the database schema. This is why production systems need both SQL AND document RAG — each fills gaps the other has.
</details>

**Q4**: What would you add to this system to make it production-ready for a regulated industry (e.g., financial services)?
<details><summary>Answer</summary>
(1) **Audit logging**: Immutable log of every query + response with user ID, timestamp — required for compliance. (2) **PII detection**: Scan inputs/outputs for SSNs, account numbers, addresses — prevent accidental exposure. (3) **Data lineage**: Every answer must cite the source document and its timestamp — regulators need proof. (4) **Model card + risk assessment**: Documented capabilities, limitations, and approval from risk/legal. (5) **Human review queue**: High-stakes queries (> $X threshold) require human approval. (6) **Rate limiting and access control**: Role-based permissions (analyst vs executive vs customer). (7) **Third-party audit**: Annual AI system audit by an independent firm.
</details>

**Q5**: Looking back at all 12 days of Phase 10, which 3 skills do you believe are most valuable for an MBA graduate working in a data-heavy business role?
<details><summary>Answer</summary>
Open-ended — key considerations for a strong answer: (1) **Prompt Engineering (Day 110)** — highest ROI for immediate practical use; any knowledge worker can unlock dramatically better AI output without coding. (2) **RAG Pipelines (Day 112)** — the most practical architecture for business-specific AI (building company knowledge assistants, policy bots, data Q&A systems). (3) **AI Product Design (Day 118)** — the ability to evaluate whether AI should be used, design for failure, and measure real business impact separates leaders from followers. Additional strong choices: Evaluation & Guardrails (Day 114) for responsible deployment, and LLM Ops (Day 116) for economic sustainability.
</details>

---

## Further Reading

- [Full LangChain RAG Tutorial — Harrison Chase](https://python.langchain.com/docs/tutorials/rag/)
- [Building Production RAG Applications — LlamaIndex](https://docs.llamaindex.ai/en/stable/optimizing/production_rag/)
- [Real Python — Building a CLI Chatbot](https://realpython.com/build-a-python-chatbot/)
- [Anthropic's Guide to Building Effective Agents](https://www.anthropic.com/research/building-effective-agents)

---

## Phase 10 Summary

You've completed the **Generative AI & LLM Engineering** phase. In 12 days, you've covered:

| Day | Topic                   | Key Skill                                        |
| --- | ----------------------- | ------------------------------------------------ |
| 109 | LLM Landscape           | Model selection framework                        |
| 110 | Prompt Engineering      | Zero-shot, few-shot, CoT, structured output      |
| 111 | LangChain & LlamaIndex  | Chains, memory, document Q&A                     |
| 112 | RAG Pipelines           | Embeddings, semantic search, hybrid retrieval    |
| 113 | Fine-Tuning LLMs        | LoRA, QLoRA, dataset preparation                 |
| 114 | Evaluation & Guardrails | RAGAS, LLM-as-judge, NeMo                        |
| 115 | LLM Agents & Tool Use   | ReAct loop, function calling, multi-agent        |
| 116 | LLM Ops                 | Caching, routing, tracing, cost control          |
| 117 | Multimodal AI           | GPT-4V, document intelligence, PDF processing    |
| 118 | AI Product Design       | Feature specs, failure modes, responsible launch |
| 119 | AI Ethics               | Bias audits, red-teaming, model cards            |
| 120 | Capstone                | End-to-end AI data assistant                     |

🎓 **You've now completed a 120-day journey from Python basics to production AI engineering. The skills you've built represent the cutting edge of what the most sought-after data professionals know in 2026.**
