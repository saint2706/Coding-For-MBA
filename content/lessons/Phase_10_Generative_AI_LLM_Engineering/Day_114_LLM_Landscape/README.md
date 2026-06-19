---
day: 114
title: "LLM Landscape — GPT-4o, Gemini, Claude, Llama"
phase: 10
phaseTitle: "Generative AI & LLM Engineering"
slug: "llm-landscape"
duration: 90
difficulty: "intermediate"
tags:
  - llm
  - gpt-4o
  - gemini
  - claude
  - llama
  - open-source-ai
concepts:
  - "large language models (LLMs)"
  - "transformer architecture"
  - "open vs closed source models"
  - "model benchmarking"
  - "context windows"
prerequisites:
  - "Day 58: Transformers & Attention"
  - "Day 64: Modern NLP Pipelines"
outcomes:
  - "Compare leading LLMs on capability, cost, and fit-for-purpose"
  - "Distinguish open-source from proprietary models and when to use each"
  - "Evaluate a model selection framework for a business use case"
---

# 🎯 Day 109: LLM Landscape — GPT-4o, Gemini, Claude, Llama

> *"Choosing the wrong LLM is like buying a Formula 1 car when you need a delivery van — impressive, ruinously expensive, and wrong for the job."*

---

## The "Never-Coded" Bridge

**Think of LLMs like law firms.**

You could hire a **top-tier international firm** (GPT-4o) — brilliant, handles everything, but charges €800/hour. Or you hire a **specialist boutique firm** (Claude for documents, Gemini for multimodal) that costs less and is sharper in their niche. Or you hire an **in-house legal team** (open-source Llama 3) — higher setup cost, but you own everything and it runs inside your walls.

The right choice depends on your **budget**, **data sensitivity**, **volume**, and **task type** — not just raw capability.

Understanding the LLM landscape means knowing which firm to call.

---

## The Technical Deep Dive

### 1. What Makes an LLM an LLM?

LLMs are **autoregressive transformer models** trained on massive text corpora to predict the next token. Key architectural properties that define capability:

| Property             | What It Means                                               | Why It Matters                              |
| -------------------- | ----------------------------------------------------------- | ------------------------------------------- |
| **Parameters**       | Number of learnable weights (e.g., 70B)                     | Larger = more knowledge, more compute cost  |
| **Context Window**   | Max tokens processed at once (e.g., 128K → ~100K words)     | Determines how much text it can "see"       |
| **Training Data**    | Web, books, code, scientific papers                         | Determines domain coverage                  |
| **RLHF / Alignment** | Fine-tuned on human preferences (helpful, harmless, honest) | Determines safety and instruction-following |
| **Quantization**     | 4-bit/8-bit compression to run on smaller hardware          | Enables local deployment                    |

### 2. The Major Players (2025)

#### Closed-Source / API-Only

| Model                 | Provider  | Context | Strengths                                     | Weaknesses                        |
| --------------------- | --------- | ------- | --------------------------------------------- | --------------------------------- |
| **GPT-4o**            | OpenAI    | 128K    | Best all-rounder, multimodal, tool use        | Cost, data privacy                |
| **GPT-4o mini**       | OpenAI    | 128K    | Fast, cheap, 80% of GPT-4o for simple tasks   | Less nuanced reasoning            |
| **Claude 3.5 Sonnet** | Anthropic | 200K    | Long documents, coding, low hallucination     | No native image generation        |
| **Claude 3 Haiku**    | Anthropic | 200K    | Cheapest high-quality option for batch tasks  | Less capable on complex reasoning |
| **Gemini 1.5 Pro**    | Google    | 1M      | Largest context window, multimodal, code      | Inconsistent on structured output |
| **Gemini 1.5 Flash**  | Google    | 1M      | Very fast, cheap, great for simple extraction | Less nuanced than Pro             |

#### Open-Source / Self-Hosted

| Model             | Creator    | Parameters | Strengths                                      | Weaknesses                     |
| ----------------- | ---------- | ---------- | ---------------------------------------------- | ------------------------------ |
| **Llama 3.1 70B** | Meta       | 70B        | Best open-source reasoning, Apache 2.0 license | Requires GPU cluster to serve  |
| **Llama 3.1 8B**  | Meta       | 8B         | Runs on 1×A100, good for structured tasks      | Weaker on complex reasoning    |
| **Mistral 7B**    | Mistral AI | 7B         | Excellent instruction-following for size       | Smaller knowledge base         |
| **Mixtral 8×7B**  | Mistral AI | MoE        | Sparse MoE — uses 13B active params from 47B   | Requires more complex serving  |
| **Phi-3 Mini**    | Microsoft  | 3.8B       | Remarkable capacity for size (textbook data)   | Narrow training distribution   |
| **Qwen 2.5 72B**  | Alibaba    | 72B        | Strong multilingual, code, math                | Less community support in West |

### 3. Connecting to the API

```python
# OpenAI GPT-4o
from openai import OpenAI

client = OpenAI(api_key="YOUR_KEY")  # Set OPENAI_API_KEY env var in production

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "system", "content": "You are a financial analyst assistant."},
        {"role": "user", "content": "Summarize the key risks in this Q3 earnings report: [REPORT TEXT]"}
    ],
    temperature=0.2,       # Lower = more deterministic
    max_tokens=500,
    response_format={"type": "text"}
)

print(response.choices[0].message.content)
print(f"Tokens used: {response.usage.total_tokens}")
print(f"Estimated cost: ${response.usage.total_tokens * 0.000005:.4f}")  # GPT-4o pricing
```

```python
# Anthropic Claude 3.5 Sonnet
import anthropic

client = anthropic.Anthropic(api_key="YOUR_KEY")

message = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "Extract all financial figures from this text and return as JSON."}
    ]
)

print(message.content[0].text)
print(f"Input tokens: {message.usage.input_tokens}")
print(f"Output tokens: {message.usage.output_tokens}")
```

```python
# Google Gemini 1.5 Pro
import google.generativeai as genai

genai.configure(api_key="YOUR_KEY")

model = genai.GenerativeModel("gemini-1.5-pro")
response = model.generate_content("Analyze this 50-page PDF: " + pdf_text)
print(response.text)

# Gemini's killer feature: 1M context window
# You can process entire codebases, books, or years of transaction data in one call
```

```python
# Local Llama 3.1 8B via Ollama (free, private, offline)
import requests

response = requests.post(
    "http://localhost:11434/api/generate",
    json={
        "model": "llama3.1:8b",
        "prompt": "Classify this customer complaint as: billing / technical / shipping / other\n\nComplaint: My package hasn't arrived in 3 weeks.\n\nCategory:",
        "stream": False,
        "options": {"temperature": 0.0}
    }
)

print(response.json()["response"])  # → "shipping"
# Zero cost per call, zero data sent externally
```

### 4. Model Selection Framework

```python
def select_llm(task: dict) -> str:
    """
    A practical decision function for LLM selection.
    Factors: task_type, data_sensitivity, volume, budget, context_size
    """
    if task["data_sensitive"]:
        # Private data → must run locally
        if task["volume"] == "high":
            return "Llama 3.1 8B via Ollama (batch), or Mistral 7B"
        else:
            return "Llama 3.1 70B via private cloud (Azure or AWS Bedrock)"

    if task["context_tokens"] > 100_000:
        return "Gemini 1.5 Pro (1M context) or Claude 3.5 Sonnet (200K)"

    if task["type"] == "structured_extraction":
        return "GPT-4o mini or Claude 3 Haiku (cheap, reliable JSON)"

    if task["type"] == "complex_reasoning":
        return "GPT-4o or Claude 3.5 Sonnet"

    if task["type"] == "code_generation":
        return "GPT-4o or Gemini 1.5 Pro"

    if task["budget"] == "minimal":
        return "GPT-4o mini, Gemini 1.5 Flash, or Claude 3 Haiku"

    # Default for general tasks
    return "GPT-4o or Claude 3.5 Sonnet"
```

### 5. Benchmarking: What the Numbers Mean

```python
# Key benchmarks to know (2025 approximate scores)
benchmarks = {
    "MMLU": {
        "description": "Massive Multitask Language Understanding — 57 academic subjects",
        "GPT-4o": "88.7%",
        "Claude-3.5-Sonnet": "88.3%",
        "Llama-3.1-70B": "86.0%",
        "note": "Tests broad knowledge breadth",
    },
    "HumanEval": {
        "description": "Code generation — 164 Python programming problems",
        "GPT-4o": "90.2%",
        "Claude-3.5-Sonnet": "92.0%",
        "Llama-3.1-70B": "80.5%",
        "note": "Best proxy for coding tasks",
    },
    "MATH": {
        "description": "Competition mathematics",
        "GPT-4o": "76.6%",
        "Claude-3.5-Sonnet": "71.1%",
        "Llama-3.1-70B": "65.7%",
        "note": "Tests reasoning depth",
    },
    "MT-Bench": {
        "description": "Multi-turn conversation quality",
        "note": "Most relevant for chatbot / assistant use cases",
    },
}

# ⚠️ BENCHMARK CAVEAT
# Benchmarks are saturating and models may be partially trained on test sets.
# Always test on YOUR specific task with YOUR data before committing.
```

---

## Senior-Level Insights

### The Hidden Costs of "Free" Open Source

Running Llama 3.1 70B at production scale requires:
- **Hardware**: 2× A100 80GB GPUs (~$15,000/month on cloud)
- **Engineering**: Serving infra (vLLM, TGI), load balancing, monitoring
- **Maintenance**: Model updates, security patches, compliance logging

**Rule of thumb**: If your monthly token volume is under $500/month on GPT-4o, open-source is more expensive when you factor in engineering hours.

### Context Window ≠ Effective Context

Gemini's 1M token window sounds revolutionary, but modern research consistently shows LLMs suffer **"lost in the middle" degradation** — they perform best on information at the start and end of context, and miss information buried in the middle of very long documents. Always verify retrieval quality empirically when using very long contexts.

### The Cost Optimization Ladder

```
$$$$ GPT-4o (full)         — Use for complex reasoning, multi-step agentic tasks
$$$  Claude 3.5 Sonnet     — Use for document analysis, coding, long-form writing
$$   GPT-4o mini / Flash   — Use for classification, extraction, simple Q&A
$    Llama 3.1 8B local    — Use for high-volume batch inference with no data risk
```

Route traffic intelligently: use small models for simple tasks, large models only when needed.

---

## Hands-on Lab

### Exercise 1: API Cost Calculator

```python
# Pricing as of 2025 (per million tokens, input/output)
PRICING = {
    "gpt-4o":              {"input": 2.50, "output": 10.00},
    "gpt-4o-mini":         {"input": 0.15, "output": 0.60},
    "claude-3.5-sonnet":   {"input": 3.00, "output": 15.00},
    "claude-3-haiku":      {"input": 0.25, "output": 1.25},
    "gemini-1.5-pro":      {"input": 3.50, "output": 10.50},
    "gemini-1.5-flash":    {"input": 0.075, "output": 0.30},
}

def calculate_monthly_cost(
    model: str,
    avg_input_tokens: int,
    avg_output_tokens: int,
    requests_per_day: int
) -> dict:
    """
    TODO: Calculate monthly cost for a given usage pattern.
    - Monthly requests = requests_per_day * 30
    - Total input tokens = avg_input_tokens * monthly requests
    - Total output tokens = avg_output_tokens * monthly requests
    - Cost = (total_tokens / 1_000_000) * price_per_million
    - Return: {"monthly_input_cost": ..., "monthly_output_cost": ..., "total_monthly": ...}
    """
    pass

# Test: Support chatbot — 500 requests/day, 500 input tokens, 200 output tokens
for model in PRICING:
    cost = calculate_monthly_cost(model, 500, 200, 500)
    # TODO: print model name and monthly total cost
```

### Exercise 2: Model Selection Justification

For each scenario, choose the best model and write 2 sentences justifying your choice:

1. A law firm wants to analyze 200-page contracts for risk clauses. Data is highly confidential.
2. A retail company wants to classify 10 million customer reviews per month as positive/negative/neutral.
3. A startup wants to build a coding assistant for their internal engineering team (no budget constraints).
4. A hospital wants to generate discharge summaries from clinical notes. HIPAA applies.

### Exercise 3: Empirical Benchmark

```python
# ADVANCED: Compare GPT-4o-mini vs Claude-3-Haiku on a classification task
# (Use whichever APIs you have access to, or mock the responses)

test_cases = [
    {"text": "The product broke after 2 days. Terrible quality!", "expected": "negative"},
    {"text": "Shipping was slow but the item itself is great", "expected": "mixed"},
    {"text": "Exactly as described, very happy with purchase", "expected": "positive"},
    {"text": "meh", "expected": "negative"},
    {"text": "Would buy again for sure", "expected": "positive"},
]

PROMPT = """Classify this review as exactly one of: positive, negative, mixed.
Reply with only the label, nothing else.

Review: {text}
Label:"""

def evaluate_model(model_fn, test_cases: list) -> dict:
    """
    TODO: Run each test case through model_fn(prompt: str) -> str
    Calculate accuracy (exact match to expected label)
    Return: {"accuracy": float, "results": list of {text, expected, predicted, correct}}
    """
    pass
```

---

## Mastery Check

**Q1**: What is the key architectural difference between GPT-4o and Llama 3.1 70B from a deployment perspective?
<details><summary>Answer</summary>
GPT-4o is closed-source and accessed via API only — you never control the model weights. Llama 3.1 70B is open-source (Apache 2.0) and can be downloaded, fine-tuned, and deployed on your own infrastructure. This makes Llama suitable for sensitive data, while GPT-4o offers the best capability with minimal setup.
</details>

**Q2**: A company processes 50,000 support tickets per day, each ~500 tokens, requiring a one-sentence classification. Which model tier should they use and why?
<details><summary>Answer</summary>
A cheap, fast, small model: GPT-4o mini, Claude 3 Haiku, or Gemini 1.5 Flash. At 50K requests × 500 tokens = 25M tokens/day, even a $0.15/million-token model costs only ~$112/month. No need for GPT-4o quality — classification is a simple task where small models excel. Open-source Llama 3.1 8B would be even cheaper at scale if self-hosting is operationally feasible.
</details>

**Q3**: What does "lost in the middle" mean and why does it matter for Gemini's 1M token context?
<details><summary>Answer</summary>
LLMs attend more strongly to information at the beginning and end of their context window. Information buried in the middle of very long inputs (especially beyond ~100K tokens) is more likely to be missed or misattributed. Gemini's 1M window is impressive, but you should verify retrieval accuracy empirically for critical use cases rather than assuming the model reads every token equally.
</details>

**Q4**: A user says "just use open-source, it's free." What hidden costs should you raise?
<details><summary>Answer</summary>
Running a 70B model in production requires: GPU hardware ($10,000–$15,000/month on cloud), serving infrastructure (vLLM, load balancer, autoscaling), engineering time for deployment and maintenance, model updates, security patches, and compliance logging. Open-source is cheaper only at very high token volumes (typically >$5,000/month in API costs). Below that threshold, the API convenience often wins.
</details>

**Q5**: What is RLHF and why does it matter for comparing model benchmarks?
<details><summary>Answer</summary>
RLHF (Reinforcement Learning from Human Feedback) fine-tunes models to be more helpful, harmless, and honest based on human preference labels. It's why a well-aligned smaller model (Claude 3 Haiku) can outperform an unaligned larger model on real-world tasks. Raw benchmark scores don't capture alignment quality — always evaluate on actual tasks. Models that score well on MMLU may still give harmful, inconsistent, or unpredictable outputs in production.
</details>

---

## Further Reading

- [OpenAI API Docs — Models](https://platform.openai.com/docs/models)
- [Anthropic Model Documentation](https://docs.anthropic.com/en/docs/about-claude/models)
- [LMSYS Chatbot Arena Leaderboard](https://chat.lmsys.org/) — human preference-based ranking
- [Open LLM Leaderboard (HuggingFace)](https://huggingface.co/spaces/HuggingFaceH4/open_llm_leaderboard)
- [Ollama — Run LLMs Locally](https://ollama.ai/)

---

## Summary

- ✅ **LLMs differ by**: parameter count, context window, open/closed source, data privacy, and benchmark scores.
- ✅ **Closed-source leaders**: GPT-4o (best all-rounder), Claude 3.5 Sonnet (documents/code), Gemini 1.5 Pro (longest context).
- ✅ **Open-source leaders**: Llama 3.1 70B (best open-source reasoning), Llama 3.1 8B / Mistral 7B (efficient & private).
- ✅ **Selection framework**: Data sensitivity → Context size → Task type → Budget.
- ✅ **Benchmarks**: Directional indicators only. Always test on your specific task.

**Tomorrow → Day 110**: **Prompt Engineering Mastery** — zero-shot, few-shot, chain-of-thought, and the prompting techniques that extract 90% more quality from any model.
