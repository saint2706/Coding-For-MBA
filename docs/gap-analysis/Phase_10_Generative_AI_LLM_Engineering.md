# Gap Analysis — Phase 10: Generative AI & LLM Engineering
>
> Audited against the Phase 1 Quality Bar. See [GAP_ANALYSIS.md](../../GAP_ANALYSIS.md) for the full rubric, gap taxonomy, and severity legend.

## Phase summary

Phase 10 provides a solid technical overview of Generative AI, moving from basic prompt engineering through to RAG, fine-tuning, and LLM ops. However, compared to the Phase 1 Quality Bar, there are significant structural gaps. The most critical recurring issues are missing expected outputs in lab exercises, a complete absence of glossaries across all lessons, and missing pitfalls sections. Furthermore, conceptual explanations often take a back seat to framework demonstrations, particularly in the later half of the phase.

**Recurring gaps in this phase:**

* No `Glossary` sections in any lesson.
* No `Pitfalls` sections to warn about common errors.
* `Hands-on Lab` exercises frequently lack sample data and expected results, especially in Days 111, 115, 117, 118, and 119.
* Several lessons miss the `Tomorrow` preview cross-reference.

**Lessons audited:** 12

---

## Day 114 — LLM Landscape — GPT-4o, Gemini, Claude, Llama

**Path:** `content/lessons/Phase_10_Generative_AI_LLM_Engineering/Day_114_LLM_Landscape/README.md`
**Assessment:** Provides a solid overview of the LLM landscape and cost considerations, but lacks a formal glossary. The code examples are strong, but the conceptual bridge could be tighter. Text like "Use for complex reasoning" is present but not explicitly defined.

**Gap task stubs:**

* [ ] [P2][O:Glossary] Add a Glossary section to define key jargon.
* [ ] [P0][A:Concept] The introduction states models are "powerful" but doesn't define what an LLM actually is (transformers, next-token prediction) under "The Technical Deep Dive".

---

## Day 115 — Prompt Engineering Mastery

**Path:** `content/lessons/Phase_10_Generative_AI_LLM_Engineering/Day_115_Prompt_Engineering_Mastery/README.md`
**Assessment:** Strong coverage of zero-shot, few-shot, and chain-of-thought, including injection defense. However, lacks explicit pitfall warnings and a glossary for terms like 'temperature' and 'top_p'. A prompt says "Ignore all previous instructions" but lacks an explanation of how parsing works.

**Gap task stubs:**

* [ ] [P2][O:Glossary] Add a Glossary section to define key jargon.
* [ ] [P1][H:Pitfalls] Add a Pitfalls callout section to highlight common implementation errors.

---

## Day 116 — LangChain & LlamaIndex — Document Loaders, Chains, Memory

**Path:** `content/lessons/Phase_10_Generative_AI_LLM_Engineering/Day_116_LangChain_and_LlamaIndex/README.md`
**Assessment:** Jumps quickly into framework implementations without fully defining the underlying concepts of document loaders or memory structures. The lab lacks expected results, asking students to "Build a basic LangChain summarization pipeline" without sample input.

**Gap task stubs:**

* [ ] [P2][O:Glossary] Add a Glossary section to define key jargon.
* [ ] [P1][H:Pitfalls] Add a Pitfalls callout section to highlight common implementation errors.
* [ ] [P1][A:Concept] Explain the architectural concepts of Chains and Memory before jumping into framework usage.

---

## Day 117 — RAG Pipelines — Embeddings, Vector Stores, Retrieval

**Path:** `content/lessons/Phase_10_Generative_AI_LLM_Engineering/Day_117_RAG_Pipelines/README.md`
**Assessment:** Explains RAG but relies heavily on demonstrations rather than conceptual architecture deep-dives. Missing pitfalls regarding chunking strategies. Asks to "Calculate embeddings" but doesn't define vector space.

**Gap task stubs:**

* [ ] [P2][O:Glossary] Add a Glossary section to define key jargon.
* [ ] [P1][H:Pitfalls] Add a Pitfalls callout section to highlight common implementation errors.
* [ ] [P1][A:Concept] Define vector embeddings conceptually before showing the ChromaDB code.

---

## Day 118 — Fine-Tuning LLMs — LoRA, QLoRA, Unsloth

**Path:** `content/lessons/Phase_10_Generative_AI_LLM_Engineering/Day_118_Fine_Tuning_LLMs/README.md`
**Assessment:** Covers LoRA and QLoRA, but the lab exercises lack clear expected outputs, making it difficult for students to verify success. Quotes like "Train your model" lack context on what 'success' looks like.

**Gap task stubs:**

* [ ] [P2][O:Glossary] Add a Glossary section to define key jargon.
* [ ] [P1][H:Pitfalls] Add a Pitfalls callout section to highlight common implementation errors.
* [ ] [P1][A:Concept] Define the PEFT (Parameter-Efficient Fine-Tuning) workflow conceptually before the Unsloth demonstration.

---

## Day 119 — Evaluation & Guardrails — RAGAS, TruLens, Guardrails AI

**Path:** `content/lessons/Phase_10_Generative_AI_LLM_Engineering/Day_119_Evaluation_and_Guardrails/README.md`
**Assessment:** Introduces RAGAS and TruLens well, but lacks a consolidated glossary of evaluation metrics. Phrases like "Measure Hallucination" appear without defining the mathematical or logical basis.

**Gap task stubs:**

* [ ] [P2][O:Glossary] Add a Glossary section to define key jargon.
* [ ] [P1][H:Pitfalls] Add a Pitfalls callout section to highlight common implementation errors.
* [ ] [P1][A:Concept] Explain how evaluation metrics like Answer Relevance are actually calculated conceptually.

---

## Day 120 — LLM Agents & Tool Use — ReAct, Function Calling, Multi-Agent

**Path:** `content/lessons/Phase_10_Generative_AI_LLM_Engineering/Day_120_LLM_Agents_and_Tool_Use/README.md`
**Assessment:** Shows how to build an agent, but fails to clearly define what an agent is conceptually before diving into the code. The lab says "Build an agent with these tools..." but lacks sample data and expected result.

**Gap task stubs:**

* [ ] [P2][O:Glossary] Add a Glossary section to define key jargon.
* [ ] [P1][H:Pitfalls] Add a Pitfalls callout section to highlight common implementation errors.
* [ ] [P0][A:Concept] Define agent systems conceptually (ReAct, reasoning loops) rather than just demonstrating tool use.

---

## Day 121 — LLM Ops & Cost Management — Token Optimization, Caching, Tracing

**Path:** `content/lessons/Phase_10_Generative_AI_LLM_Engineering/Day_121_LLM_Ops_and_Cost_Management/README.md`
**Assessment:** Good insights on token optimization, but the lab "Exercise 1: Cost Audit Your Chatbot" just says "Calculate monthly cost" without giving the expected dollar amount for verification. Doesn't explain caching architectures clearly.

**Gap task stubs:**

* [ ] [P2][O:Glossary] Add a Glossary section to define key jargon.
* [ ] [P1][H:Pitfalls] Add a Pitfalls callout section to highlight common implementation errors.
* [ ] [P1][F:Tables] Provide a decision matrix/table for when to use Prompt Compression vs Semantic Caching.

---

## Day 122 — Multimodal AI — Vision-Language Models, GPT-4V, Gemini Vision

**Path:** `content/lessons/Phase_10_Generative_AI_LLM_Engineering/Day_122_Multimodal_AI/README.md`
**Assessment:** Explores vision models effectively, but exercise 1 "Complete the receipt extraction function" provides no sample receipt or expected JSON output schema. The "Document Intelligence Pipeline" is more code than concept.

**Gap task stubs:**

* [ ] [P2][O:Glossary] Add a Glossary section to define key jargon.
* [ ] [P1][H:Pitfalls] Add a Pitfalls callout section to highlight common implementation errors.

---

## Day 123 — AI Product Design — Product Thinking for LLM Features

**Path:** `content/lessons/Phase_10_Generative_AI_LLM_Engineering/Day_123_AI_Product_Design/README.md`
**Assessment:** The business framing is strong, but the lab exercises like "Write an AI Feature Spec" are completely empty and lack any guiding structure or expected outcome. Mentions "confidence and uncertainty" without providing concrete UX patterns.

**Gap task stubs:**

* [ ] [P2][O:Glossary] Add a Glossary section to define key jargon.
* [ ] [P1][H:Pitfalls] Add a Pitfalls callout section to highlight common implementation errors.
* [ ] [P0][C:Lab] Exercise 1: Feature Evaluation lacks any concrete scenario. "Exercise 1: Feature Evaluation..."
* [ ] [P0][C:Lab] Exercise 3: Write an AI Feature Spec lacks instructions. "Exercise 3: Write an AI Feature Spec..."

---

## Day 124 — AI Ethics in Practice — Bias Audits, Red-Teaming, Responsible Deployment

**Path:** `content/lessons/Phase_10_Generative_AI_LLM_Engineering/Day_124_AI_Ethics_in_Practice/README.md`
**Assessment:** Covers bias and red-teaming, but the exercises are extremely thin, such as "Design a Fairness Audit" with no sample dataset or expected outcome. Quotes "BIAS DETECTED" but doesn't explain the math behind disparity analysis deeply enough.

**Gap task stubs:**

* [ ] [P2][O:Glossary] Add a Glossary section to define key jargon.
* [ ] [P1][H:Pitfalls] Add a Pitfalls callout section to highlight common implementation errors.
* [ ] [P0][C:Lab] Exercise 1 lacks problem statement and data. "Exercise 1: Design a Fairness Audit..."
* [ ] [P0][C:Lab] Exercise 3 lacks problem statement. "Exercise 3: Write a Model Card..."

---

## Day 125 — Capstone: Build an AI-Powered Data Assistant

**Path:** `content/lessons/Phase_10_Generative_AI_LLM_Engineering/Day_125_Capstone_AI_Data_Assistant/README.md`
**Assessment:** The capstone project outlines an architecture but lacks a 'Tomorrow' preview (as it ends the phase) and doesn't clearly provide the 'Golden Q&A test set' mentioned in Part 6. Quotes "Evaluate your results" without a rubric.

**Gap task stubs:**

* [ ] [P2][O:Glossary] Add a Glossary section to define key jargon.
* [ ] [P1][H:Pitfalls] Add a Pitfalls callout section to highlight common implementation errors.
* [ ] [P0][C:Lab] The Capstone lacks explicit 'EXPECTED RESULT' criteria for the final assistant's performance.
* [ ] [P2][K:Xref] Add a Phase 11 preview cross-reference at the end of the phase summary.

---
