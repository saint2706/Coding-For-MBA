# Gap Fulfillment Report — Phase 10: Generative AI & LLM Engineering

> Converted from the Phase 10 Gap Analysis (`Phase_10_Generative_AI_LLM_Engineering.md`). All gaps listed here have been resolved. See individual lesson `README.md` files for the full updated content.

**Status:** ✅ All gaps resolved
**Lessons audited:** 12
**Total gaps filled:** 36
**Completed:** 2026-06-21

---

## Phase Summary

Phase 10 covers Generative AI and LLM engineering across 12 lessons (Days 114–125), moving from the LLM landscape through prompt engineering, RAG, fine-tuning, evaluation, agents, LLM ops, multimodal AI, product design, ethics, and a capstone. The gap audit identified two systemic content gaps affecting every lesson, one frequent structural gap concentrated in the later lessons, and a handful of targeted per-lesson concept/lab/table gaps.

**Tier 1 — Systemic (all 12 lessons):**

- [O:Glossary] No lesson had a dedicated `## Glossary` section
- [H:Pitfalls] No lesson had a dedicated `## Pitfalls` callout section

**Tier 2 — Structural:**

- [C:Lab] Hands-on Lab exercises across several lessons (most acutely Days 121, 122, 123, 124, 125) lacked sample data and/or expected results, leaving students no way to self-check their work
- [K:Xref] Day 125 (the phase's final lesson) closed with a "120-day journey" victory line instead of a forward cross-reference into Phase 11

**Tier 3 — Targeted per-lesson gaps:**

- [P0] Day 114: LLMs introduced as "powerful" without ever explaining what an LLM actually is (transformers, next-token prediction)
- [P1] Day 116: Jumped into LangChain/LlamaIndex framework code without explaining what a "chain" or "memory" structurally is
- [P1] Day 117: Lab asked students to "Calculate embeddings" without ever defining vector space conceptually
- [P1] Day 118: Lab exercises gave no way to verify fine-tuning "success"; PEFT/LoRA workflow was never explained conceptually before the Unsloth code
- [P1] Day 119: RAGAS metrics (faithfulness, answer relevancy) were named and used without explaining how they're actually computed
- [P0] Day 120: The highest-severity concept gap in the phase — "agent" was never defined before diving into ReAct/tool-use code
- [P1] Day 121: No decision matrix for choosing Prompt Compression vs. Semantic Caching
- [P0] Day 123: Exercise 1 (Feature Evaluation) and Exercise 3 (AI Feature Spec) were assessed as lacking concrete scenarios/instructions
- [P0] Day 124: Exercise 1 (Fairness Audit) and Exercise 3 (Model Card) were assessed as lacking problem statements/data
- [P0] Day 125: The capstone's final assistant had no explicit "EXPECTED RESULT" criteria to verify correct behavior

**Recurring gaps resolved:**

- ✅ [O:Glossary] Dedicated `## Glossary` section (8–12 term table) added to ALL 12 lessons
- ✅ [H:Pitfalls] Dedicated `## Pitfalls` callout section (4–5 ⚠️ bullets) added to ALL 12 lessons
- ✅ [C:Lab] Every Hands-on Lab exercise flagged as missing sample data/expected results now has an explicit `# EXPECTED RESULT` block (or, for non-code reflection exercises, an "EXPECTED RESULT" rubric) with concrete computed values or qualitative pass/fail criteria
- ✅ [K:Xref] Day 125's closing "120-day journey" line is now followed by an explicit "Tomorrow → Day 126: Cloud Fundamentals" Phase 11 preview
- ✅ [P0]/[P1] All concept gaps resolved with new conceptual prose inserted *before* the corresponding code, in "The Technical Deep Dive" of each affected lesson
- ✅ [P1][F:Tables] Day 121's Prompt Compression vs. Semantic Caching decision matrix added

**Note on Day 123/124 reconciliation:** the source gap-analysis document characterizes several Day 123 and Day 124 lab exercises as having "no concrete scenario" or "lacking problem statement and data." On inspection, the current lesson content already contained a scenario for each flagged exercise (e.g., Day 123 Exercise 1 already lists 4 concrete feature scenarios; Day 124 Exercise 1 already describes the law-firm persuasiveness-scorer scenario). Rather than discard or rewrite existing, usable scenario text, the resolution for these gaps adds explicit "EXPECTED RESULT" rubrics/reasoning beneath each exercise so students have a concrete standard to self-check against — closing the *substantive* gap (no way to verify correctness) that the assessment was pointing at, without manufacturing duplicate scenarios.

---

## Day 114 — LLM Landscape — GPT-4o, Gemini, Claude, Llama

**Path:** `content/lessons/Phase_10_Generative_AI_LLM_Engineering/Day_114_LLM_Landscape/README.md`

**Line count:** 387 → 441

| # | Priority | Tag | Gap Description | Resolution |
|---|----------|-----|-----------------|------------|
| 1 | P2 | O:Glossary | No glossary | ✅ Added 10-term glossary (Transformer, Self-attention, Autoregressive, Token, Parameters, Context window, RLHF, Quantization, Temperature, Lost in the middle) |
| 2 | P0 | A:Concept | Models called "powerful" but LLMs (transformers, next-token prediction) never explained | ✅ Added ~15 lines of conceptual prose under "What Makes an LLM an LLM?" explaining self-attention, "Attention Is All You Need," and the 4-step tokenize→forward-pass→sample→repeat inference loop, plus why this causes confident hallucination |
| 3 | — | H:Pitfalls (bonus) | Not individually stubbed for Day 114, but flagged phase-wide in the Phase Summary's recurring gaps | ✅ Added 5-bullet `## Pitfalls` anyway (benchmark-only trust, context-window-as-memory myth, data residency, defaulting to biggest model, accuracy-only comparison), so all 12 lessons end up structurally consistent |
| 4 | — | C:Lab (bonus) | Not individually stubbed for Day 114, but no self-check value was given | ✅ Added `# EXPECTED RESULT` to `calculate_monthly_cost` (per-model dollar figures) and `evaluate_model` (~80% accuracy with explanation) |

---

## Day 115 — Prompt Engineering Mastery

**Path:** `content/lessons/Phase_10_Generative_AI_LLM_Engineering/Day_115_Prompt_Engineering_Mastery/README.md`

**Line count:** 493 → 549

| # | Priority | Tag | Gap Description | Resolution |
|---|----------|-----|-----------------|------------|
| 1 | P2 | O:Glossary | No glossary | ✅ Added 10-term glossary (Zero-shot, Few-shot, CoT, Temperature, top_p, System prompt, JSON mode, Prompt injection, Self-consistency, Prompt chaining) |
| 2 | P1 | H:Pitfalls | No pitfalls section | ✅ Added 5-bullet `## Pitfalls` (mixing instructions/data, temperature=0 non-determinism myth, JSON-without-JSON-mode, single-example overfitting, too many few-shot examples) |
| 3 | — | C:Lab (bonus) | Not individually stubbed for Day 115, but exercises 2/3 had no expected-output values | ✅ Added `# EXPECTED RESULT` to `solve_with_cot` (full month-by-month MRR calc, ≈$54.8-55K by Month 3) and the extraction exercise (`JobPosting` field values with a required_skills false-positive check) |

---

## Day 116 — LangChain & LlamaIndex — Document Loaders, Chains, Memory

**Path:** `content/lessons/Phase_10_Generative_AI_LLM_Engineering/Day_116_LangChain_and_LlamaIndex/README.md`

**Line count:** 458 → 534

| # | Priority | Tag | Gap Description | Resolution |
|---|----------|-----|-----------------|------------|
| 1 | P2 | O:Glossary | No glossary | ✅ Added 10-term glossary (Chain, LCEL, Runnable, Document loader, Text splitter/chunking, Conversation memory, RunnableParallel, Vector index, Query engine, Response mode) |
| 2 | P1 | H:Pitfalls | No pitfalls section | ✅ Added 5-bullet `## Pitfalls` (reaching for LangChain on 1-step tasks, memory cost growth, chunk_size/embedding mismatch, version pinning, re-indexing waste) |
| 3 | P1 | A:Concept | Chains/memory used without explaining the underlying structure | ✅ Added new "Architectural Concepts: What 'Chains' and 'Memory' Actually Are" subsection — chains as function composition (`prompt \| llm \| parser` = `f∘g∘h`), memory as resent client-side history with cost implications |
| 4 | — | C:Lab (bonus) | Not individually stubbed for Day 116, but the lab had no expected results | ✅ Added `# EXPECTED RESULT` to Exercise 1 (financial-health chain verdict), Exercise 2 (3-turn `SupportBot` memory dialogue), Exercise 3 (LlamaIndex synthesis answer + honesty check) |

---

## Day 117 — RAG Pipelines — Embeddings, Vector Stores, Retrieval

**Path:** `content/lessons/Phase_10_Generative_AI_LLM_Engineering/Day_117_RAG_Pipelines/README.md`

**Line count:** 500 → 561

| # | Priority | Tag | Gap Description | Resolution |
|---|----------|-----|-----------------|------------|
| 1 | P2 | O:Glossary | No glossary | ✅ Added 12-term glossary (RAG, Embedding, Vector space, Cosine similarity, Vector store, Dense retrieval, BM25, Hybrid search, MMR, Reranking, Chunking, Faithfulness) |
| 2 | P1 | H:Pitfalls | No pitfalls section | ✅ Added 5-bullet `## Pitfalls` (fixed-character chunking ignoring structure, re-embedding waste, embedding-model mismatch, trusting retrieval blindly, no "don't know" fallback) |
| 3 | P1 | A:Concept | "Calculate embeddings" used without ever defining vector space | ✅ Expanded "Understanding Embeddings" with 2 new paragraphs on embeddings as points in 1536-dim space, before the ChromaDB code |
| 4 | — | C:Lab (bonus) | Not individually stubbed for Day 117, but exercises 1/3 had no expected results | ✅ Added `# EXPECTED RESULT` to the index/retrieve/answer exercise (top-match + grounded answer) and `evaluate_retrieval` (precision@5≈0.30, recall@5=1.0, with explanation) |

---

## Day 118 — Fine-Tuning LLMs — LoRA, QLoRA, Unsloth

**Path:** `content/lessons/Phase_10_Generative_AI_LLM_Engineering/Day_118_Fine_Tuning_LLMs/README.md`

**Line count:** 461 → 535

| # | Priority | Tag | Gap Description | Resolution |
|---|----------|-----|-----------------|------------|
| 1 | P2 | O:Glossary | No glossary | ✅ Added 11-term glossary (Fine-tuning, PEFT, LoRA, Rank (r), QLoRA, Quantization (NF4), Alpaca format, ShareGPT format, EOS token, Catastrophic forgetting, Train loss vs eval loss) |
| 2 | P1 | H:Pitfalls | No pitfalls section | ✅ Added 5-bullet `## Pitfalls` (missing EOS token, judging by train_loss alone, LoRA rank too high, skipping dataset validation, fine-tuning when prompting would suffice) |
| 3 | P1 | A:Concept | PEFT/LoRA workflow never explained before the Unsloth demo | ✅ Added new "The PEFT Workflow, Conceptually" subsection (VRAM cost of full fine-tuning, the `W + A·B` LoRA insight, `d²`→`2dr` parameter reduction, QLoRA's 4-bit base) inserted before the training code; existing sections renumbered 4→6 to stay sequential |
| 4 | — | C:Lab (bonus) | Not individually stubbed for Day 118, but exercises gave no way to verify "success" | ✅ Added `# EXPECTED RESULT` to Exercise 1 (4 named dataset issues), Exercise 2 (full LoRA parameter-count table for r=4/16/64), Exercise 3 (computed v1=80%/v2=100% accuracy comparison) |

---

## Day 119 — Evaluation & Guardrails — RAGAS, TruLens, Guardrails AI

**Path:** `content/lessons/Phase_10_Generative_AI_LLM_Engineering/Day_119_Evaluation_and_Guardrails/README.md`

**Line count:** 515 → 582

| # | Priority | Tag | Gap Description | Resolution |
|---|----------|-----|-----------------|------------|
| 1 | P2 | O:Glossary | No consolidated glossary of evaluation metrics | ✅ Added 11-term glossary (Faithfulness, Answer relevancy, Context recall, Context precision, LLM-as-a-judge, Self-preference bias, Guardrail, Hallucination, Jailbreak, Colang, Drift) |
| 2 | P1 | H:Pitfalls | No pitfalls section | ✅ Added 5-bullet `## Pitfalls` (self-preference bias, treating RAGAS scores as exact ground truth, guardrail thresholds without held-out test set, unmonitored review queues, one-time-only evaluation) |
| 3 | P1 | A:Concept | "Measure Hallucination"/"Answer Relevance" used without explaining how metrics are computed | ✅ Added conceptual explanation of faithfulness (claim decomposition + verification), answer relevancy (reverse-question cosine similarity), context recall/precision, with a caution about RAGAS's own imprecision |
| 4 | — | C:Lab (bonus) | Not individually stubbed for Day 119, but exercises 1/3 had no expected outputs | ✅ Added `# EXPECTED RESULT` to `detect_hallucination` (exact expected output per test response) and `run_eval_dashboard` (per-case scores + aggregate, with Case 3 flagged as "incomplete" not "hallucinated") |

---

## Day 120 — LLM Agents & Tool Use — ReAct, Function Calling, Multi-Agent

**Path:** `content/lessons/Phase_10_Generative_AI_LLM_Engineering/Day_120_LLM_Agents_and_Tool_Use/README.md`

**Line count:** 483 → 573

| # | Priority | Tag | Gap Description | Resolution |
|---|----------|-----|-----------------|------------|
| 1 | P2 | O:Glossary | No glossary | ✅ Added 9-term glossary (Agent, ReAct, Tool/function calling, Tool schema, tool_choice, Agentic loop, Multi-agent orchestration, Human-in-the-loop, Max iterations) |
| 2 | P1 | H:Pitfalls | No pitfalls section | ✅ Added 5-bullet `## Pitfalls` (vague tool descriptions, no max_iterations cap, irreversible actions without approval gate, large tool-result token bloat, assuming the model self-catches tool errors) |
| 3 | P0 | A:Concept | **Highest-severity concept gap in the phase** — "agent" never defined before the ReAct/tool-use code | ✅ Added new "What an 'Agent' Actually Is" subsection — an agent as a `while` loop around a stateless LLM, breaking down Reason/Act/Observe and the grounded-correction vs. real-world-risk tradeoff |
| 4 | — | C:Lab (bonus) | Not individually stubbed for Day 120, but the lab lacked sample data/expected results | ✅ Added `# EXPECTED RESULT` to Exercise 1 (full reference tool schema), Exercise 2 (3 behavioral test-case expectations for `run_robust_agent`), Exercise 3 (computed answers for all 3 business questions) |

---

## Day 121 — LLM Ops & Cost Management — Token Optimization, Caching, Tracing

**Path:** `content/lessons/Phase_10_Generative_AI_LLM_Engineering/Day_121_LLM_Ops_and_Cost_Management/README.md`

**Line count:** 523 → 588

| # | Priority | Tag | Gap Description | Resolution |
|---|----------|-----|-----------------|------------|
| 1 | P2 | O:Glossary | No glossary | ✅ Added 10-term glossary (Token, tiktoken, Prompt compression, LLMLingua, Semantic cache, Cosine similarity threshold, Model routing, Prompt caching, LangSmith trace, Cost attribution, Token budget) |
| 2 | P1 | H:Pitfalls | No pitfalls section | ✅ Added 5-bullet `## Pitfalls` (trimming by message count not tokens, semantic-cache false-positive risk, caching freshness-dependent answers, ignoring output-token cost asymmetry, no cost monitoring) |
| 3 | P1 | F:Tables | No decision matrix for Prompt Compression vs. Semantic Caching | ✅ Added 7-row "Decision Matrix: Prompt Compression vs. Semantic Caching" comparison table with a closing rule-of-thumb |
| 4 | — | C:Lab (bonus) | Not individually stubbed for Day 121, but "calculate monthly cost" gave no expected dollar amount | ✅ Added `# EXPECTED RESULT` to `audit_conversation_cost` (computed ≈245 tokens, ≈$1.10/month at 1000 sessions/day) and `TokenBudgetManager.call_llm` (budget-threshold behavioral expectations) |

---

## Day 122 — Multimodal AI — Vision-Language Models, GPT-4V, Gemini Vision

**Path:** `content/lessons/Phase_10_Generative_AI_LLM_Engineering/Day_122_Multimodal_AI/README.md`

**Line count:** 497 → 573

| # | Priority | Tag | Gap Description | Resolution |
|---|----------|-----|-----------------|------------|
| 1 | P2 | O:Glossary | No glossary | ✅ Added 10-term glossary (VLM, Detail level, Base64 encoding, Structured extraction, `instructor`, Document intelligence, OCR, Multi-page processing, Vision pricing, Hallucinated extraction) |
| 2 | P1 | H:Pitfalls | No pitfalls section | ✅ Added 5-bullet `## Pitfalls` (full-resolution images when "low" detail suffices, freeform-text extraction, numeric misreads, using vision on clean digital text, ignoring image orientation/resolution limits) |
| 3 | — | C:Lab (bonus) | Not individually stubbed for Day 122, but "complete the receipt extraction function" had no sample receipt or expected JSON schema | ✅ Added `# EXPECTED RESULT` to `extract_receipt` (full sample `Receipt` object + category-totals sanity check), `validate_chart_extraction` (flawed pie-chart example with named issues), `compare_visions` (comparison dict shape + qualitative GPT-4o vs. Gemini Flash expectations) |

---

## Day 123 — AI Product Design — Product Thinking for LLM Features

**Path:** `content/lessons/Phase_10_Generative_AI_LLM_Engineering/Day_123_AI_Product_Design/README.md`

**Line count:** 407 → 447

| # | Priority | Tag | Gap Description | Resolution |
|---|----------|-----|-----------------|------------|
| 1 | P2 | O:Glossary | No glossary | ✅ Added 10-term glossary (6-gate framework, Confidence-gated UX, Co-pilot pattern, Autopilot pattern, Failure mode, AI feature spec, Magical demo trap, Red-teaming, Guard rail, Rollout plan) |
| 2 | P1 | H:Pitfalls | No pitfalls section | ✅ Added 5-bullet `## Pitfalls` (writing the spec after the demo, confusing model confidence with correctness, defaulting to autopilot, no designed failure state, treating the launch checklist as one-time) |
| 3 | P0 | C:Lab | Exercise 1 (Feature Evaluation) assessed as lacking a concrete scenario | ✅ Existing 4 scenarios retained (already present); added an "EXPECTED RESULT" verdict rubric (APPROVED/BLOCK/CAUTION reasoning) for all 4, so students can self-check their 6-gate analysis |
| 4 | P0 | C:Lab | Exercise 3 (Write an AI Feature Spec) assessed as lacking instructions | ✅ Existing template reference retained; added an "EXPECTED RESULT" checklist of the minimum content each spec section must contain for the Invoice Approval Assistant scenario |

---

## Day 124 — AI Ethics in Practice — Bias Audits, Red-Teaming, Responsible Deployment

**Path:** `content/lessons/Phase_10_Generative_AI_LLM_Engineering/Day_124_AI_Ethics_in_Practice/README.md`

**Line count:** 446 → 498

| # | Priority | Tag | Gap Description | Resolution |
|---|----------|-----|-----------------|------------|
| 1 | P2 | O:Glossary | No glossary | ✅ Added 10-term glossary (Demographic parity, Disparate impact ratio, Counterfactual testing, Equalized odds, Red-teaming, Prompt injection, Jailbreak, AIF360, Model card, Responsible deployment checklist) |
| 2 | P1 | H:Pitfalls | No pitfalls section | ✅ Added 5-bullet `## Pitfalls` (auditing the model but not the pipeline, demographic parity as the only metric, one-time red-teaming, homogeneous red-team reviewers, stale model cards) |
| 3 | P0 | C:Lab | Exercise 1 (Fairness Audit) assessed as lacking problem statement/data | ✅ Existing law-firm persuasiveness-scorer scenario retained; added a full "EXPECTED RESULT" walk-through answering all 5 sub-questions (attributes, methodology, metric/threshold, data needed, remediation action) |
| 4 | P0 | C:Lab | Exercise 3 (Model Card) assessed as lacking problem statement | ✅ Added "EXPECTED RESULT" minimum-content checklist for the Email Reply Generator model card (intended use, 2+ limitations, 3 metrics, 2 fairness considerations); also added equivalent expected-coverage guidance for Exercise 2's red-team test cases (10 categories with defined safe behaviors) |

---

## Day 125 — Capstone: Build an AI-Powered Data Assistant

**Path:** `content/lessons/Phase_10_Generative_AI_LLM_Engineering/Day_125_Capstone_AI_Data_Assistant/README.md`

**Line count:** 742 → 781

| # | Priority | Tag | Gap Description | Resolution |
|---|----------|-----|-----------------|------------|
| 1 | P2 | O:Glossary | No glossary | ✅ Added 8-term glossary (Orchestrator, Semantic cache, Guardrail layer, Routing, Response synthesizer, Cache hit rate, Model card, End-to-end evaluation) |
| 2 | P1 | H:Pitfalls | No pitfalls section | ✅ Added 5-bullet `## Pitfalls` (routing before checking cache, trusting LLM-generated SQL as a security boundary, no RAG fallback for empty SQL results, caching empty/blocked answers, mistaking demo scale for production scale) |
| 3 | P0 | C:Lab | No explicit "EXPECTED RESULT" criteria for the final assistant's performance | ✅ Added a 7-row "What 'Working' Looks Like" table mapping each `test_questions` entry to its expected `source`/`cached` value and correct answer (including the $4.25M Q3 Americas revenue calculation and the expected cache hit on the semantically-similar refund question), plus expected `get_stats()` behavior |
| 4 | P2 | K:Xref | No Phase 11 preview cross-reference; ended with a closing "120-day journey" line instead | ✅ Added "Tomorrow → Day 126: Cloud Fundamentals" line following the closing summary, connecting the capstone's AI application to Phase 11's cloud data infrastructure focus |

---

## Gap Resolution Statistics

Counts below reflect the 36 official stubs listed in the source gap-analysis document's `[ ]` checklists. Beyond these, 10 bonus fixes were also made (not individually stubbed, but closing the same class of gap for consistency) — see the footnote.

| Gap Type | Tag | Count (official stubs) | Status |
|----------|-----|-------------------------|--------|
| Missing glossaries | O:Glossary | 12 | ✅ All resolved |
| Missing pitfalls callouts | H:Pitfalls | 11 (all lessons except Day 114, which had none stubbed) | ✅ All resolved |
| Missing concept explanations | A:Concept | 6 (Days 114, 116, 117, 118, 119, 120) | ✅ All resolved |
| Labs without sample data/expected results | C:Lab | 5 (Days 123 ×2, 124 ×2, 125 ×1) | ✅ All resolved |
| Missing decision tables | F:Tables | 1 (Day 121) | ✅ All resolved |
| Missing/broken cross-references | K:Xref | 1 (Day 125) | ✅ All resolved |

**Total gaps resolved: 36** (matches the 36 `[x]` checkboxes in the source gap-analysis document)

*Also added beyond the minimum stub requirements: a `## Pitfalls` section for Day 114 (1 bonus, since it wasn't individually stubbed there) and `# EXPECTED RESULT` lab annotations for Days 114, 115, 116, 117, 118, 119, 120, 121, and 122 (9 bonus, one lesson each) — bringing every lesson in the phase to the same structural and self-check standard even where the source document didn't flag it line-by-line. These 10 bonus rows are marked with priority "—" and a `(bonus)` tag suffix in the per-day tables above.*

---

## Quality Bar Checklist

| Quality Criterion | Status |
|-------------------|--------|
| All 12 lessons now have a dedicated `## Glossary` section | ✅ |
| All 12 lessons now have a dedicated `## Pitfalls` section with ⚠️-prefixed callouts | ✅ |
| Every concept gap (Days 114, 116, 117, 118, 119, 120) resolved with new prose inserted before the relevant code | ✅ |
| Day 120's P0 "what is an agent" gap — the single highest-severity gap in the phase — fully resolved with a new conceptual subsection | ✅ |
| Day 121's Prompt Compression vs. Semantic Caching decision matrix added | ✅ |
| Every lab exercise flagged for missing sample data/expected results now has an explicit `# EXPECTED RESULT` annotation or rubric | ✅ |
| Day 118's heading renumbering (after inserting the new PEFT conceptual subsection) verified sequential (1→6) | ✅ |
| Day 123/124 lab gaps resolved honestly — existing scenario text preserved, EXPECTED RESULT rubrics added rather than rewriting working content | ✅ |
| Day 125's closing line now points to Phase 11 (Day 126: Cloud Fundamentals) instead of ending the curriculum | ✅ |
| No existing lesson content deleted — all changes are additive | ✅ |
| Phase 09 → Phase 10 → Phase 11 transition preserved | ✅ |
| All 36 gap-analysis checkboxes verified checked (`grep -c '\[x\]'` → 36, `'\[ \]'` → 0) | ✅ |
