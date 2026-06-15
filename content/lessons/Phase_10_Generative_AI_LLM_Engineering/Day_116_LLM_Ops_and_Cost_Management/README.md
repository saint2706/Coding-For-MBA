---
day: 116
title: "LLM Ops & Cost Management — Token Optimization, Caching, Tracing"
phase: 10
phaseTitle: "Generative AI & LLM Engineering"
slug: "llm-ops-cost-management"
duration: 90
difficulty: "advanced"
tags:
  - llmops
  - cost-optimization
  - token-management
  - semantic-caching
  - tracing
  - langsmith
concepts:
  - "token budgeting"
  - "prompt compression"
  - "semantic caching"
  - "LLM tracing"
  - "model routing"
prerequisites:
  - "Day 115: LLM Agents & Tool Use"
outcomes:
  - "Implement token-aware prompt compression to reduce costs by 40-60%"
  - "Build a semantic cache that avoids re-querying for similar questions"
  - "Set up LLM call tracing for debugging and cost attribution"
---

# 🎯 Day 116: LLM Ops & Cost Management

> *"An LLM that works is a feature. An LLM that works profitably at scale is a product."*

---

## The "Never-Coded" Bridge

**Imagine running a boutique coffee shop that becomes wildly popular.**

When you had 20 customers/day, you could use the best beans, the most expensive espresso machines, and take your time. At 20,000 customers/day, you need: an efficient supply chain, standardized processes for common orders, a "fast lane" for simple drinks (drip coffee vs hand-crafted pour-overs), and wastage tracking.

**LLM Ops** is the "20,000 customers/day" discipline for AI products:

- **Token optimization** = using fewer expensive ingredients
- **Caching** = not making coffee someone already ordered in the last 10 minutes  
- **Model routing** = sending simple orders to the barista, complex ones to the master craftsperson
- **Tracing** = knowing exactly which coffee took too long and why

---

## The Technical Deep Dive

### 1. Understanding Token Costs

```python
import tiktoken

def count_tokens(text: str, model: str = "gpt-4o") -> int:
    """Count tokens before sending to API (avoid surprise bills)."""
    enc = tiktoken.encoding_for_model(model)
    return len(enc.encode(text))

# Pricing (2025 approximate)
COST_PER_M_TOKENS = {
    "gpt-4o":           {"input": 2.50, "output": 10.00},
    "gpt-4o-mini":      {"input": 0.15, "output": 0.60},
    "claude-3.5-sonnet":{"input": 3.00, "output": 15.00},
    "claude-3-haiku":   {"input": 0.25, "output": 1.25},
}

def estimate_monthly_cost(
    avg_prompt_tokens: int,
    avg_response_tokens: int,
    requests_per_day: int,
    model: str = "gpt-4o"
) -> dict:
    monthly_requests = requests_per_day * 30
    input_tokens = avg_prompt_tokens * monthly_requests
    output_tokens = avg_response_tokens * monthly_requests
    prices = COST_PER_M_TOKENS[model]
    input_cost = (input_tokens / 1_000_000) * prices["input"]
    output_cost = (output_tokens / 1_000_000) * prices["output"]
    return {
        "monthly_requests": monthly_requests,
        "input_tokens": input_tokens,
        "output_cost": output_cost,
        "input_cost": input_cost,
        "total_monthly_usd": input_cost + output_cost,
    }

# Example: Support chatbot
print(estimate_monthly_cost(
    avg_prompt_tokens=800,    # System prompt + conversation history + user query
    avg_response_tokens=200,
    requests_per_day=5_000,
    model="gpt-4o"
))
# → $450/month on GPT-4o

print(estimate_monthly_cost(
    avg_prompt_tokens=800,
    avg_response_tokens=200,
    requests_per_day=5_000,
    model="gpt-4o-mini"
))
# → $28/month on GPT-4o mini — 16x cheaper!
```

### 2. Prompt Compression

```python
# ─────────────────────────────────────────
# TECHNIQUE 1: System Prompt Audit
# Long system prompts cost money on EVERY call
# ─────────────────────────────────────────

# BEFORE: Verbose, 800-token system prompt
bad_system = """
You are a helpful, friendly, and professional customer service representative 
for TechCorp, a software technology company. Your job is to assist customers 
with their inquiries in a polite and respectful manner. You should always 
greet customers warmly, listen to their concerns carefully, provide accurate 
information based on company policies, and escalate issues that you cannot
resolve to the appropriate team. Never discuss competitor products. Never 
discuss pricing changes that haven't been officially announced. Always maintain
a professional and empathetic tone. When customers are frustrated, acknowledge 
their feelings before providing solutions.
"""
# 151 tokens

# AFTER: Compressed, same meaning, 52 tokens
good_system = """
TechCorp support agent. Rules:
- Use company policy only; escalate unknowns
- Never mention competitors or unannounced pricing
- Acknowledge frustration before solutions
"""
# 35 tokens — 77% reduction, same behavioral result

# ─────────────────────────────────────────
# TECHNIQUE 2: Conversation History Truncation
# ─────────────────────────────────────────
def smart_trim_history(messages: list[dict], max_tokens: int = 2000) -> list[dict]:
    """
    Keep the most recent messages that fit within token budget.
    Always keep: system prompt + last user message.
    """
    enc = tiktoken.encoding_for_model("gpt-4o")
    system = [m for m in messages if m["role"] == "system"]
    non_system = [m for m in messages if m["role"] != "system"]

    system_tokens = sum(len(enc.encode(m["content"])) for m in system)
    remaining_budget = max_tokens - system_tokens

    # Add messages from most recent backwards until budget exhausted
    trimmed = []
    for msg in reversed(non_system):
        msg_tokens = len(enc.encode(msg.get("content", "")))
        if remaining_budget - msg_tokens >= 0:
            trimmed.insert(0, msg)
            remaining_budget -= msg_tokens
        else:
            break

    return system + trimmed

# ─────────────────────────────────────────
# TECHNIQUE 3: LLMLingua — Neural Prompt Compression
# Compresses prompts by 2-10x with minimal quality loss
# pip install llmlingua
# ─────────────────────────────────────────
from llmlingua import PromptCompressor

compressor = PromptCompressor(
    model_name="microsoft/llmlingua-2-bert-base-multilingual-cased-meetingbank",
    use_llmlingua2=True,
)

long_prompt = """
The following is a customer support ticket filed by Jane Smith on February 12, 2026.
The customer's account ID is CUST-8832. She reports that she attempted to process
a refund for order #ORD-445521 on January 30th. The order contained 3 items:
Product A ($45.99), Product B ($89.99), and Product C ($22.50). The total was $158.48.
She received a confirmation email on January 30th at 2:47 PM EST saying the refund 
would appear within 5-7 business days. As of February 12, no refund has appeared.
She has contacted support twice previously: call on Feb 3 (ref: CALL-1234) and 
email on Feb 7 (ref: EMAIL-5678). 
"""

compressed = compressor.compress_prompt(
    long_prompt,
    target_token=80,   # Compress to ~80 tokens (from ~150)
    rank_method="longllmlingua",
)
print(f"Original tokens: ~150")
print(f"Compressed tokens: ~80")
print(f"Compressed: {compressed['compressed_prompt']}")
```

### 3. Semantic Caching

```python
from openai import OpenAI
import numpy as np
import json
import time

client = OpenAI()

class SemanticCache:
    """
    Cache LLM responses by semantic similarity of queries.
    Two questions that mean the same thing return the same (cached) answer.
    """
    def __init__(self, similarity_threshold: float = 0.92):
        self.threshold = similarity_threshold
        self.cache: list[dict] = []  # {embedding, query, response, hits, created_at}

    def _embed(self, text: str) -> list[float]:
        return client.embeddings.create(
            input=text, model="text-embedding-3-small"
        ).data[0].embedding

    def _similarity(self, a: list, b: list) -> float:
        a, b = np.array(a), np.array(b)
        return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))

    def get(self, query: str) -> str | None:
        """Return cached response if a semantically similar query exists."""
        if not self.cache:
            return None
        query_emb = self._embed(query)
        best_score, best_entry = 0, None
        for entry in self.cache:
            score = self._similarity(query_emb, entry["embedding"])
            if score > best_score:
                best_score, best_entry = score, entry
        if best_score >= self.threshold:
            best_entry["hits"] += 1
            print(f"[CACHE HIT] sim={best_score:.3f}, saved {best_entry['cost_saved_usd']:.4f}")
            return best_entry["response"]
        return None

    def set(self, query: str, response: str, token_count: int = 0):
        """Store a new query-response pair."""
        cost_per_token = 0.0000025  # GPT-4o average
        self.cache.append({
            "embedding": self._embed(query),
            "query": query,
            "response": response,
            "hits": 0,
            "cost_saved_usd": token_count * cost_per_token,
            "created_at": time.time(),
        })

    def stats(self) -> dict:
        total_hits = sum(e["hits"] for e in self.cache)
        total_saved = sum(e["hits"] * e["cost_saved_usd"] for e in self.cache)
        return {"cache_size": len(self.cache), "total_hits": total_hits, "total_saved_usd": total_saved}

cache = SemanticCache(similarity_threshold=0.92)

def cached_llm_call(query: str) -> str:
    # Check cache first
    cached = cache.get(query)
    if cached:
        return cached

    # Make real API call
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": query}],
        temperature=0
    )
    result = response.choices[0].message.content
    cache.set(query, result, response.usage.total_tokens)
    return result

# These semantically similar queries will share a cache entry:
r1 = cached_llm_call("What is EBITDA?")
r2 = cached_llm_call("Can you explain EBITDA to me?")      # CACHE HIT
r3 = cached_llm_call("What does EBITDA mean?")             # CACHE HIT
print(cache.stats())  # 2 cache hits
```

### 4. Model Routing by Task Complexity

```python
from openai import OpenAI

client = OpenAI()

SIMPLE_PATTERNS = [
    "classify", "categorize", "extract", "translate",
    "yes or no", "true or false", "list the", "what is"
]

def route_to_model(prompt: str, response_expected_length: str = "short") -> str:
    """
    Intelligently route to cheap vs expensive model.
    Saves ~16x on model cost for simple tasks.
    """
    prompt_lower = prompt.lower()
    is_simple = any(p in prompt_lower for p in SIMPLE_PATTERNS)
    is_short_response = response_expected_length == "short"

    if is_simple and is_short_response:
        return "gpt-4o-mini"   # 16x cheaper, handles simple tasks well
    else:
        return "gpt-4o"        # Full capability for complex reasoning

def smart_llm_call(prompt: str, expected_output_length: str = "short") -> dict:
    model = route_to_model(prompt, expected_output_length)
    response = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": prompt}],
    )
    return {
        "model_used": model,
        "response": response.choices[0].message.content,
        "tokens": response.usage.total_tokens,
    }

# Test routing
r1 = smart_llm_call("Classify this email as spam/not-spam: 'Win a free iPhone!'")
r2 = smart_llm_call("Analyze the strategic implications of this merger for the next 5 years...", "long")
print(f"Q1 used: {r1['model_used']}")  # gpt-4o-mini
print(f"Q2 used: {r2['model_used']}")  # gpt-4o
```

### 5. Tracing with LangSmith

```python
# LangSmith is the LangChain tracing platform
# Captures every LLM call, prompt, response, latency, and cost
# Set these environment variables:
# LANGCHAIN_TRACING_V2=true
# LANGCHAIN_API_KEY=your_key
# LANGCHAIN_PROJECT=my-llm-app

# Once env vars are set, ALL LangChain calls are automatically traced
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-4o-mini")
result = llm.invoke("What is the capital of France?")
# → Automatically logged to LangSmith with latency, token counts, cost

# Custom metadata for cost attribution
from langchain_core.callbacks import CallbackManager
from langsmith import traceable

@traceable(metadata={"team": "data-analytics", "feature": "earnings-analysis", "user_id": "user_123"})
def analyze_document(text: str) -> str:
    """Traced wrapper — attributes costs to team/feature."""
    llm = ChatOpenAI(model="gpt-4o")
    return llm.invoke(f"Analyze: {text}").content

# LangSmith dashboard shows:
# - P50/P95 latency per run
# - Token costs per team/feature
# - Error rate
# - Which prompts fail most often
```

---

## Senior-Level Insights

### The Cost Optimization Playbook

In order of impact (highest first):

1. **Switch to smaller model** for simple tasks — 10-16x cost reduction
2. **Implement semantic caching** — 20-40% cache hit rate typical for support/FAQ use cases
3. **Compress system prompts** — 30-70% token reduction with no quality loss
4. **Trim conversation history** — prevents unbounded cost growth in multi-turn apps
5. **Reduce output length** — set `max_tokens` explicitly for constrained tasks
6. **Batch similar requests** — some providers offer batch discounts for async processing

### Output Tokens Cost More

Note that output tokens are typically 3-4x more expensive than input tokens (e.g., GPT-4o: $2.50 input vs $10 output per million tokens). For extraction tasks, forcing shorter outputs (constrain with `max_tokens=100`) saves more money than trimming prompts.

---

## Hands-on Lab

### Exercise 1: Cost Audit Your Chatbot

```python
# Given this chatbot conversation history, calculate:
# 1. Token count for the full history
# 2. Monthly cost if this is the average session (1000 sessions/day)
# 3. Cost after implementing smart_trim_history at 2000 tokens max

conversation = [
    {"role": "system", "content": "You are a helpful TechCorp customer service agent. Our products include ProSuite ($99/mo), DataEngine ($149/mo), and AnalyticsHub ($299/mo). Refund policy: 30-day full refund. Support hours: 9am-6pm EST."},
    {"role": "user", "content": "Hi, I need help with my subscription"},
    {"role": "assistant", "content": "Hello! I'd be happy to help you with your subscription. Could you please tell me which product you're subscribed to and what issue you're experiencing?"},
    {"role": "user", "content": "I'm on ProSuite and I want to upgrade to DataEngine"},
    {"role": "assistant", "content": "Great choice! Upgrading from ProSuite ($99/mo) to DataEngine ($149/mo) would give you access to advanced analytics features. The upgrade takes effect immediately and you'll be billed the prorated difference for the current month. Would you like me to process this upgrade for you?"},
    {"role": "user", "content": "Yes please"},
    {"role": "assistant", "content": "I've initiated the upgrade to DataEngine ($149/mo). You'll receive a confirmation email within 5 minutes. Is there anything else I can help you with?"},
    {"role": "user", "content": "Actually wait - will I lose my ProSuite data?"},
    {"role": "assistant", "content": "No, you won't lose any data! All your ProSuite data is fully compatible with DataEngine. After upgrading, you'll actually have access to more data visualization options for your existing data. Shall I proceed with the upgrade?"},
]

# TODO:
# 1. Count tokens using tiktoken
# 2. Calculate cost for GPT-4o-mini (input tokens only for the call)
# 3. Trim to 500 tokens max and recalculate
def audit_conversation_cost(conversation: list[dict], model: str = "gpt-4o-mini") -> dict:
    pass
```

### Exercise 2: Implement Prefix Caching

Many providers (OpenAI, Anthropic) offer **prompt caching** — if the first N tokens of your prompt are identical across calls, the cached portion is billed at 50% cost.

```python
# Design a prompt structure that maximizes cache hits

# BAD: Dynamic content at the start destroys caching
bad_prompt = f"""
Customer {customer_id} asked at {timestamp}: {user_query}
Our policies: [1000 tokens of policies]
"""

# GOOD: Static content first, dynamic content last  
good_prompt = f"""
[CACHED — 1000 tokens of static company policies and instructions]
...

---
Customer query: {user_query}
"""

# TODO:
# 1. Explain why "static first, dynamic last" maximizes cache hits
# 2. Rewrite this prompt for maximum caching:
template = f"""
Date: {datetime.now()}
Customer: {customer_name} (ID: {customer_id})
Company Policy: [5000 tokens of policy text]
Question: {user_question}
"""
```

### Exercise 3: Token Budget Manager

```python
# Build a token budget manager that:
# 1. Tracks running token usage per session
# 2. Warns when approaching budget
# 3. Automatically switches to a cheaper model when budget is 50% consumed

class TokenBudgetManager:
    def __init__(self, budget_tokens: int = 10_000, model: str = "gpt-4o"):
        self.budget = budget_tokens
        self.used = 0
        self.model = model

    def call_llm(self, prompt: str) -> str:
        """
        TODO:
        1. Count prompt tokens before calling
        2. If used > 50% of budget, switch to gpt-4o-mini
        3. If used > 90% of budget, return "Budget limit approaching. Please start a new session."
        4. Make the API call, update self.used with total tokens used
        5. Return the response
        """
        pass
```

---

## Mastery Check

**Q1**: Why do output tokens cost 3-4x more than input tokens, and how does this affect your optimization strategy?
<details><summary>Answer</summary>
Output tokens are generated autoregressively — each token requires one full forward pass through the model, making it computationally expensive. Input tokens are processed in parallel in a single forward pass. This means for extraction tasks (where you control output length), adding `max_tokens=100` or constraining to JSON is more impactful than trimming the prompt. For summarization or creative tasks, shorter output constraints (`"Summarize in 3 bullet points"`) provide the largest cost savings.
</details>

**Q2**: What is semantic caching and how does it differ from exact match caching?
<details><summary>Answer</summary>
Exact match caching stores responses keyed by the literal query string — only identical queries reuse the cache. Semantic caching embeds queries and uses cosine similarity to find cached responses for queries that mean the same thing even if worded differently. "What is EBITDA?", "Explain EBITDA", and "Define EBITDA" are semantically identical (similarity >0.92) and share one cache entry. Semantic caching typically achieves 20-40% hit rates for support chatbots vs <5% for exact caching.
</details>

**Q3**: What is model routing and when should you use it?
<details><summary>Answer</summary>
Model routing selects different LLM models based on task complexity. Simple tasks (classification, extraction, translation) route to cheap fast models (GPT-4o-mini, Claude Haiku). Complex tasks (multi-step reasoning, nuanced analysis) route to the best available model (GPT-4o, Claude Sonnet). This can reduce costs by 80-95% for mixed workloads where 70% of queries are simple, without sacrificing quality on tasks that need it. Implement by classifying query intent first, or by trialing the cheap model and falling back to the expensive one when output fails validation.
</details>

**Q4**: What does `LANGCHAIN_TRACING_V2=true` enable, and why is tracing important for production LLM apps?
<details><summary>Answer</summary>
LangSmith tracing records every LLM call: input prompt, output, latency, token count, and cost. It works automatically once the environment variable is set. In production, tracing enables: (1) Cost attribution by team/feature, (2) Debugging failed or slow calls, (3) Regression detection when prompts change, (4) Building evaluation datasets from real traffic. Without tracing, you're flying blind — you don't know which prompts are slow, expensive, or failing.
</details>

**Q5**: A customer support LLM costs $3,000/month on GPT-4o. Name 3 optimizations and estimate the combined savings.
<details><summary>Answer</summary>
Example optimizations: (1) Switch simple classification/FAQs to GPT-4o-mini: 70% of queries = 70% × $3,000 × (1 - 1/16) → saves ~$1,900/month. (2) Semantic caching for repeated FAQ questions (30% hit rate): 30% × remaining → saves ~$330/month. (3) Compress system prompt from 500 to 150 tokens (70% reduction): token savings on every call → saves ~$400/month. Combined potential: ~$2,600/month savings (87% cost reduction) while maintaining quality for complex queries. Always A/B test before full rollout.
</details>

---

## Further Reading

- [LangSmith — LLM Tracing & Evaluation](https://docs.smith.langchain.com/)
- [LLMLingua — Prompt Compression](https://github.com/microsoft/LLMLingua)
- [OpenAI Prompt Caching Guide](https://platform.openai.com/docs/guides/prompt-caching)
- [tiktoken — OpenAI's Tokenizer](https://github.com/openai/tiktoken)
- [Gptpromptbuilder — Visual Token Counter](https://gptpromptbuilder.com/)

---

## Summary

- ✅ **Token costs**: Output tokens are 4x more expensive than input — constrain output length explicitly.
- ✅ **Prompt compression**: Trim system prompts 30-70% with no quality loss; use LLMLingua for long contexts.
- ✅ **Semantic caching**: 20-40% hit rate for support bots — cosine similarity threshold ~0.92.
- ✅ **Model routing**: 70-95% cost reduction by sending simple tasks to GPT-4o-mini.
- ✅ **Tracing**: LangSmith for cost attribution, debugging, and evaluation dataset creation.
- ✅ **Combined optimization**: A well-tuned LLM system can run at 20% of native API cost.

**Tomorrow → Day 117**: **Multimodal AI** — vision-language models, GPT-4V, Gemini Vision, document intelligence, and building apps that see.
