# 🧠 Prompt Engineering Cheatsheet

> Quick reference for the most effective prompting patterns across LLM applications.

---

## Zero-Shot Patterns

```
# Classification
Classify the following text as exactly one of: positive, negative, neutral.
Reply with only the label.
Text: {input}
Label:

# Extraction
Extract all monetary amounts from the text below. Return as JSON array.
Text: {input}
Amounts:

# Summarization
Summarize the following in exactly 3 bullet points. Each bullet should be
one sentence. Focus on key business implications.
Text: {input}
Summary:
```

## Few-Shot Patterns

```
# Sentiment (with examples)
Classify the review sentiment.

Review: "The product exceeded my expectations!"
Sentiment: positive

Review: "It works but the build quality is mediocre"
Sentiment: neutral

Review: "Waste of money, broke on day one"
Sentiment: negative

Review: "{input}"
Sentiment:
```

## Chain-of-Thought (CoT)

```
# Math/Reasoning
{question}

Let's think step by step:
1. First, I need to identify...
2. Then, I can calculate...
3. Finally, the answer is...

# Self-Consistency variant (run 3x, majority vote)
Answer the following question. Show your reasoning.
Question: {input}
Reasoning:
Answer:
```

## System Prompts (Production Patterns)

```
# RAG System Prompt
You are a helpful assistant for {company}. Answer questions using ONLY
the context provided below. If the answer is not in the context, say
"I don't have that information in my knowledge base."

Do NOT use your training knowledge. Do NOT make assumptions.
Always cite the source section when answering.

Context:
{retrieved_chunks}

# Agent System Prompt
You are a data analyst assistant with access to the following tools:
- query_database(sql): Execute SQL against the analytics database
- get_metric_definition(name): Look up metric definitions
- create_chart(data, chart_type): Generate a visualization

When answering questions:
1. ALWAYS check metric definitions before writing SQL
2. Show the SQL you ran
3. Explain the results in business terms
4. If you're unsure, ask for clarification instead of guessing
```

## Structured Output

```python
# Using instructor + Pydantic
from pydantic import BaseModel, Field
import instructor
import openai

class InvoiceData(BaseModel):
    vendor: str = Field(description="Company name of the vendor")
    amount: float = Field(description="Total invoice amount")
    currency: str = Field(description="3-letter currency code")
    date: str = Field(description="Invoice date in YYYY-MM-DD format")
    line_items: list[str] = Field(description="List of line item descriptions")

client = instructor.from_openai(openai.OpenAI())
result = client.chat.completions.create(
    model="gpt-4o-mini",
    response_model=InvoiceData,
    messages=[{"role": "user", "content": f"Extract invoice data: {text}"}]
)
```

## Anti-Patterns to Avoid

| Anti-Pattern                    | Why It Fails                       | Fix                                                    |
| ------------------------------- | ---------------------------------- | ------------------------------------------------------ |
| `"Be helpful"` in system prompt | Too vague, no behavioral anchoring | Specify exact format, constraints, persona             |
| No examples for complex format  | Model guesses output structure     | Add 2-3 few-shot examples                              |
| `"Answer in detail"`            | Response length is uncontrolled    | `"Answer in exactly 3 sentences"`                      |
| Embedding user input directly   | Prompt injection vulnerability     | Wrap in delimiters: `<user_input>{input}</user_input>` |
| No temperature guidance         | Inconsistent outputs               | Classification: temp=0, Creative: temp=0.7             |

---

## Quick Decision Matrix

| Task              | Pattern                    | Temperature | Model Tier            |
| ----------------- | -------------------------- | ----------- | --------------------- |
| Classification    | Zero-shot or few-shot      | 0.0         | Cheap (mini/Flash)    |
| Extraction        | Zero-shot + JSON mode      | 0.0         | Cheap (mini/Flash)    |
| Summarization     | Zero-shot with constraints | 0.2         | Mid (Sonnet/Pro)      |
| Complex reasoning | CoT + self-consistency     | 0.3         | Expensive (4o/Sonnet) |
| Creative writing  | Few-shot with style        | 0.7–0.9     | Mid–Expensive         |
| Code generation   | Zero-shot with context     | 0.0–0.2     | Expensive (4o/Sonnet) |
