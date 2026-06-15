---
day: 114
title: "Evaluation & Guardrails — RAGAS, TruLens, Guardrails AI"
phase: 10
phaseTitle: "Generative AI & LLM Engineering"
slug: "evaluation-and-guardrails"
duration: 90
difficulty: "advanced"
tags:
  - evaluation
  - ragas
  - guardrails
  - hallucination-detection
  - llm-safety
concepts:
  - "RAG evaluation metrics (faithfulness, relevancy, recall)"
  - "LLM-as-a-judge"
  - "guardrail rails"
  - "output validation"
  - "toxicity detection"
prerequisites:
  - "Day 112: RAG Pipelines"
  - "Day 113: Fine-Tuning LLMs"
outcomes:
  - "Measure RAG pipeline quality using RAGAS faithfulness and relevancy metrics"
  - "Implement output guardrails to prevent harmful, off-topic, or hallucinated responses"
  - "Build an automated LLM evaluation pipeline using GPT-4o as a judge"
---

# 🎯 Day 114: Evaluation & Guardrails

> *"Shipping an LLM without evaluation is like shipping software without tests — you'll find the bugs in production, at the worst possible time."*

---

## The "Never-Coded" Bridge

**Imagine you just hired a brilliant but unpredictable salesperson.**

Before letting them talk to customers alone, your manager runs them through structured evaluation: *Do they stay on-topic? Do they make up features that don't exist? Do they say anything that could embarrass the company?*

Then you put guardrails in place: they can't quote prices outside pre-approved ranges, they must escalate legal questions to the legal team, and they can't make promises about unreleased products.

**LLM evaluation** = testing if your model does what you think it does.
**Guardrails** = walls that prevent the worst outcomes in production.

Both are non-negotiable before any customer-facing deployment.

---

## The Technical Deep Dive

### 1. What to Evaluate

```python
# DIMENSIONS OF LLM QUALITY

EVALUATION_DIMENSIONS = {
    "For RAG systems": {
        "faithfulness": "Does the answer stick to the retrieved context? (no hallucination)",
        "answer_relevancy": "Does the answer address the actual question asked?",
        "context_recall": "Did the system retrieve the correct documents?",
        "context_precision": "Are the retrieved documents actually relevant?",
    },
    "For general LLMs": {
        "accuracy": "Is the answer factually correct? (requires ground truth)",
        "coherence": "Is the answer logically consistent and well-structured?",
        "helpfulness": "Does it actually solve the user's problem?",
        "harmlessness": "Is the output free of harmful, toxic, or biased content?",
    },
    "For production systems": {
        "latency": "P50, P95, P99 response times",
        "cost_per_query": "Avg tokens × price per token",
        "error_rate": "% of queries that timeout, fail, or produce invalid output",
        "user_satisfaction": "Thumbs up/down, CSAT, follow-up rate",
    }
}
```

### 2. RAGAS — The RAG Evaluation Standard

```python
# pip install ragas datasets langchain-openai
from ragas import evaluate
from ragas.metrics import (
    faithfulness,        # Is the answer grounded in the retrieved context?
    answer_relevancy,   # Does the answer address the question?
    context_recall,     # Did we retrieve the right chunks? (needs ground truth)
    context_precision,  # Are retrieved chunks actually relevant?
)
from datasets import Dataset

# Your RAG pipeline's inputs and outputs
eval_data = {
    "question": [
        "What is our refund policy for enterprise customers?",
        "Who founded TechCorp?",
        "What was Q3 revenue?",
    ],
    "answer": [
        "Enterprise customers on annual contracts receive prorated refunds with 30-day notice.",
        "TechCorp was founded by Alice Chen and Bob Martinez in 2019.",
        "Revenue was $12.4 million, up 34% year-over-year.",
    ],
    "contexts": [
        # The chunks retrieved by your RAG pipeline for each question
        ["Enterprise refund policy: Customers on annual contracts receive prorated refunds with 30-day notice..."],
        ["TechCorp was founded in 2019 by Alice Chen and Bob Martinez. HQ in San Francisco..."],
        ["Q3 2025 Revenue: $12.4M (up 34% YoY). Top products: ProSuite ($5.1M)..."],
    ],
    "ground_truth": [
        # The correct answer (needed for context_recall only)
        "Annual contract customers get prorated refunds with 30-day notice.",
        "Alice Chen and Bob Martinez founded TechCorp in 2019.",
        "$12.4 million, 34% YoY growth.",
    ],
}

dataset = Dataset.from_dict(eval_data)

result = evaluate(
    dataset=dataset,
    metrics=[faithfulness, answer_relevancy, context_recall, context_precision]
)

print(result)
# Output:
# {
#   "faithfulness": 0.94,           # 94% of statements grounded in context
#   "answer_relevancy": 0.87,        # 87% of answers address the actual question
#   "context_recall": 0.91,          # 91% of ground truth covered by retrieved chunks
#   "context_precision": 0.85,       # 85% of retrieved chunks were actually useful
# }

# ACCEPT/REJECT thresholds (set per business requirements)
THRESHOLDS = {
    "faithfulness": 0.90,      # Must be >90% grounded
    "answer_relevancy": 0.80,  # Must address >80% of questions correctly
    "context_recall": 0.85,
}

for metric, threshold in THRESHOLDS.items():
    score = result[metric]
    status = "✅ PASS" if score >= threshold else "❌ FAIL"
    print(f"{metric}: {score:.2f} {status}")
```

### 3. LLM-as-a-Judge

```python
from openai import OpenAI
import json

client = OpenAI()

def evaluate_with_llm_judge(question: str, expected: str, actual: str) -> dict:
    """
    Use GPT-4o as a judge to score LLM outputs.
    This is the most flexible evaluation approach — works without ground truth.
    """
    prompt = f"""
You are an impartial evaluator. Score the AI's response on three dimensions (1-5 scale).

QUESTION: {question}
EXPECTED ANSWER (reference): {expected}
AI RESPONSE: {actual}

Evaluate on:
1. ACCURACY (1-5): Is the response factually correct vs the reference?
2. COMPLETENESS (1-5): Does it cover all key points in the reference?
3. RELEVANCE (1-5): Does it directly address the question?

Respond as JSON ONLY:
{{"accuracy": <1-5>, "completeness": <1-5>, "relevance": <1-5>, "reasoning": "<one sentence>"}}
"""
    response = client.chat.completions.create(
        model="gpt-4o",
        response_format={"type": "json_object"},
        messages=[{"role": "user", "content": prompt}],
        temperature=0
    )
    return json.loads(response.choices[0].message.content)

# Batch evaluation
test_cases = [
    {
        "question": "What is EBITDA?",
        "expected": "Earnings Before Interest, Taxes, Depreciation, and Amortization",
        "model_answer": "EBITDA stands for Earnings Before Interest, Taxes, Depreciation, and Amortization. It measures operational profitability.",
    },
    {
        "question": "What is EBITDA?",
        "expected": "Earnings Before Interest, Taxes, Depreciation, and Amortization",
        "model_answer": "EBITDA is a measure of stock market performance.",  # Wrong!
    },
]

for case in test_cases:
    scores = evaluate_with_llm_judge(**case)
    print(f"\nAnswer: {case['model_answer'][:60]}...")
    print(f"Scores: {scores}")
```

### 4. Guardrails with NVIDIA NeMo Guardrails

```python
# pip install nemoguardrails
# Alternative: Guardrails AI (guardrails-ai)

# NeMo Guardrails uses Colang configuration (declarative)
guardrails_config = """
# config.co — Define topics and flows

# Define what topics are off-limits
define user ask politics
  "What do you think about the president?"
  "Which political party is better?"

define bot refuse politics
  "I'm a financial assistant and can't discuss political topics."

# Define a flow: if user asks politics, bot refuses
define flow politics
  user ask politics
  bot refuse politics

# Define user asking about competitors
define user ask competitor
  "How does our product compare to Salesforce?"
  "Why is Hubspot better?"

define bot handle competitor
  "I can only speak to our own products. For a fair comparison, I'd recommend reviewing independent analyst reports."

# Define a flow for competitors
define flow competitor
  user ask competitor
  bot handle competitor
"""

# In Python:
from nemoguardrails import LLMRails, RailsConfig
import yaml

config = RailsConfig.from_content(
    colang_content=guardrails_config,
    yaml_content="""
models:
  - type: main
    engine: openai
    model: gpt-4o-mini
"""
)

rails = LLMRails(config)
response = rails.generate(messages=[{
    "role": "user",
    "content": "What do you think about Biden's economic policies?"
}])
print(response["content"])
# → "I'm a financial assistant and can't discuss political topics."
```

### 5. Programmatic Guardrails with Guardrails AI

```python
# pip install guardrails-ai
from guardrails import Guard
from guardrails.hub import ToxicLanguage, RestrictToTopic, ValidLength

# Stack multiple validators
guard = Guard().use_many(
    ToxicLanguage(threshold=0.5, validation_method="sentence"),
    ValidLength(min=10, max=500),
)

response_text = "This is a helpful response about our product."
try:
    validation_result = guard.parse(llm_output=response_text)
    print("Valid:", validation_result.validated_output)
except Exception as e:
    print("GUARDRAIL TRIGGERED:", e)

# Custom guardrail: enforce answer cites sources
from pydantic import BaseModel, validator

class GroundedResponse(BaseModel):
    answer: str
    sources: list[str]

    @validator("sources")
    def must_have_sources(cls, v):
        if len(v) == 0:
            raise ValueError("Response must cite at least one source")
        return v

    @validator("answer")
    def answer_cant_say_i_think(cls, v):
        forbidden = ["I think", "I believe", "in my opinion", "I'm not sure but"]
        for phrase in forbidden:
            if phrase.lower() in v.lower():
                raise ValueError(f"Answer must not contain opinion phrase: '{phrase}'")
        return v
```

### 6. Building a Continuous Evaluation Pipeline

```python
import logging
from datetime import datetime

class LLMProductionMonitor:
    """
    Lightweight monitoring for production LLM systems.
    Log inputs/outputs for offline evaluation.
    """
    def __init__(self, log_file: str = "llm_logs.jsonl"):
        self.log_file = log_file
        self.call_count = 0
        self.total_tokens = 0

    def log_call(self, query: str, response: str, tokens: int, latency_ms: int):
        record = {
            "timestamp": datetime.utcnow().isoformat(),
            "query": query,
            "response": response,
            "tokens": tokens,
            "latency_ms": latency_ms,
            "call_id": self.call_count,
        }
        self.call_count += 1
        self.total_tokens += tokens
        with open(self.log_file, "a") as f:
            f.write(json.dumps(record) + "\n")

    def flag_for_review(self, call_id: int, reason: str):
        """Human review queue for edge cases."""
        logging.warning(f"REVIEW FLAG: call {call_id} — {reason}")

    def get_daily_stats(self) -> dict:
        return {
            "total_calls": self.call_count,
            "total_tokens": self.total_tokens,
            "estimated_cost_usd": self.total_tokens * 0.00000015,  # GPT-4o-mini
        }

# Integrate with your RAG chain
monitor = LLMProductionMonitor()

def monitored_rag_call(query: str) -> str:
    import time
    start = time.time()
    response = rag_chain.invoke(query)
    latency = int((time.time() - start) * 1000)

    # Log for offline evaluation sampling
    monitor.log_call(query, response, tokens=len(response.split())*1.3, latency_ms=latency)

    # Real-time guardrail check
    if "I cannot determine" not in response and len(response) < 15:
        monitor.flag_for_review(monitor.call_count - 1, "suspiciously short response")

    return response
```

---

## Senior-Level Insights

### The 4 Types of LLM Failure

1. **Hallucination**: Model generates plausible-sounding but false information. *Most dangerous.*
2. **Refusal**: Over-cautious model refuses legitimate requests ("I can't help with that").
3. **Drift**: Model gradually shifts behavior over long conversations or prompt variations.
4. **Jailbreak**: Adversarial users bypass guardrails via creative prompting.

Each failure mode requires different countermeasures:

- Hallucination → RAG + faithfulness evaluation
- Refusal → calibrate classifier thresholds
- Drift → conversation resets, session limits
- Jailbreak → red-team testing + multi-layer validation

### Sample 1-5% of Production Queries

You can't evaluate every query in production. Sample 1% and run LLM-as-judge nightly. When quality drops below threshold, auto-page the on-call engineer before users notice.

---

## Hands-on Lab

### Exercise 1: Hallucination Detection

```python
# Implement a hallucination detector using LLM-as-judge
# A response hallucinates if it makes claims not present in the retrieved context

context = """
TechCorp was founded in 2019 by Alice Chen and Bob Martinez.
HQ: San Francisco. Employees: 312. Revenue 2025: $12.4M.
"""

responses = [
    "TechCorp was founded in 2019 by Alice Chen and Bob Martinez.",  # Faithful
    "TechCorp was founded in 2019. They have 3 offices worldwide.",  # Hallucinated (offices)
    "TechCorp, founded in 2020, reported $15M revenue.",             # Multiple hallucinations
]

def detect_hallucination(context: str, response: str, client) -> dict:
    """
    TODO: Build a prompt that asks GPT-4o-mini to:
    1. List specific claims in the response
    2. Mark each as SUPPORTED or UNSUPPORTED by the context
    3. Return: {"hallucinated": bool, "unsupported_claims": list[str], "confidence": "high|medium|low"}
    Use JSON mode.
    """
    pass

for r in responses:
    result = detect_hallucination(context, r, client)
    print(f"Response: {r[:60]}...")
    print(f"Result: {result}\n")
```

### Exercise 2: Design a Guardrail System

For a **hospital IT chatbot** that answers questions about hospital systems (EMR navigation, scheduling, billing codes), design the guardrails:

1. List 5 topics the bot must REFUSE to discuss (be specific)
2. List 3 output format requirements
3. List 2 input sanitization rules (what user inputs should be rejected or modified)
4. Write the colang-style config for your top 2 guardrail rules

### Exercise 3: Evaluation Dashboard

```python
# Build a simple scoring dashboard for your RAG system
# Input: list of (question, retrieved_chunks, answer) tuples
# Output: per-question scores + aggregate metrics

eval_cases = [
    {
        "question": "What is our Q3 revenue?",
        "context": ["Q3 2025 Revenue: $12.4M (up 34% YoY)"],
        "answer": "Q3 revenue was $12.4 million, a 34% increase year-over-year.",
    },
    {
        "question": "How many employees does the company have?",
        "context": ["TechCorp has 312 employees as of 2025."],
        "answer": "The company has approximately 300 employees.",  # Slightly off
    },
    {
        "question": "What is our refund policy?",
        "context": ["Standard: 30-day money-back. Enterprise: prorated with 30-day notice."],
        "answer": "We offer a 30-day money-back guarantee.",  # Incomplete — missed enterprise info
    },
]

# TODO: Implement a function that:
# 1. For each case, calls an LLM judge scoring faithfulness (1-5) and completeness (1-5)
# 2. Flags any case with faithfulness < 4 as "hallucination risk"
# 3. Returns a summary dict: {"avg_faithfulness", "avg_completeness", "flagged_cases"}
def run_eval_dashboard(cases: list[dict], client) -> dict:
    pass
```

---

## Mastery Check

**Q1**: What is the difference between RAGAS `faithfulness` and `answer_relevancy`?
<details><summary>Answer</summary>
Faithfulness measures whether the answer sticks to the provided retrieved context — are all claims in the answer supported by the context? (Anti-hallucination metric.) Answer relevancy measures whether the answer actually addresses the question asked — even if 100% faithful to context, an answer could be off-topic. A response can be faithful but irrelevant ("The refund policy is 30 days" to a question about shipping), or relevant but unfaithful (correctly answers the topic but with fabricated facts).
</details>

**Q2**: What is "LLM-as-a-judge" and what are its limitations?
<details><summary>Answer</summary>
Using a high-quality LLM (like GPT-4o) to score another LLM's outputs, rather than needing human annotators for every sample. It's scalable and cheap. Limitations: (1) Self-preference bias — GPT-4o may rate GPT-4o-generated content higher. (2) Style preference — verbose, confident-sounding answers score higher even if wrong. (3) No ground truth for truly novel questions. (4) The judge itself can make mistakes (~5-15% error rate). Mitigate with: multiple judges, human spot-checks, and calibration against human labels.
</details>

**Q3**: Name three types of outputs that production LLM guardrails should block.
<details><summary>Answer</summary>
(1) **Harmful content** — violence, CSAM, instructions for illegal activities, self-harm. (2) **Off-topic responses** — a customer service bot that starts discussing politics or personal topics. (3) **Hallucinated facts** — especially dangerous in medical, legal, or financial contexts where wrong information has real consequences. Also common: competitor mentions, PII leakage, excessive legal disclaimers, or outputs violating content policy.
</details>

**Q4**: Why can't you evaluate an LLM using traditional ML accuracy metrics (like the ones from Phase 4)?
<details><summary>Answer</summary>
Traditional accuracy requires a single correct answer per input. LLM outputs are: (1) Open-ended — many valid phrasings of a correct answer, (2) Context-dependent — the same question can have different correct answers given different retrieved documents, (3) Multi-dimensional — correct on facts but wrong in tone or format. Evaluation requires: semantic similarity (BLEU, ROUGE), human preference (thumbs up/down), or LLM-as-judge for holistic scoring across multiple quality dimensions.
</details>

**Q5**: What is continuous evaluation in production and why is sampling enough?
<details><summary>Answer</summary>
Continuous evaluation records queries and responses in production, then periodically evaluates them (nightly or weekly) to catch quality degradation before users notice. Sampling 1-5% is sufficient because: evaluation is expensive (each requires an LLM-judge call), quality changes are usually systemic (a prompt regression affects all queries), and statistical power is high with even 100 samples/day. Alert triggers can page engineers when rolling mean quality drops below threshold.
</details>

---

## Further Reading

- [RAGAS Documentation](https://docs.ragas.io/)
- [NVIDIA NeMo Guardrails](https://github.com/NVIDIA/NeMo-Guardrails)
- [Guardrails AI](https://docs.guardrailsai.com/)
- [LLM Evaluation Guide — Hamel Husain](https://hamel.dev/blog/posts/evals/)
- [TruLens — RAG Evaluation with Feedback Functions](https://www.trulens.org/)

---

## Summary

- ✅ **RAG evaluation**: RAGAS gives faithfulness, relevancy, context recall/precision — set numeric thresholds.
- ✅ **LLM-as-a-judge**: Scale evaluation without human annotators; watch for self-preference bias.
- ✅ **Guardrails**: Topic restrictions (NeMo Colang), output validators (Guardrails AI), Pydantic schemas.
- ✅ **4 failure modes**: Hallucination, refusal, drift, jailbreak — each needs its own countermeasure.
- ✅ **Production monitoring**: Log all queries/responses, sample 1-5% for nightly evaluation, alert on degradation.

**Tomorrow → Day 115**: **LLM Agents & Tool Use** — ReAct pattern, function calling, multi-agent frameworks, and building autonomous data analysis agents.
