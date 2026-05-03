---
phase: 10
title: "Generative AI & LLM Engineering"
days: [109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120]
totalDuration: 1260
difficulty: "advanced"
---

# 🧠 Phase 10: Generative AI & LLM Engineering

> *"Every phase of this curriculum made you analytically stronger. Phase 10 makes you the person in the room who can actually build AI products — not just talk about them."*

---

## Phase At A Glance

You've mastered Python, machine learning, deep learning, SQL, and full-stack data engineering across nine phases. Now you step into the defining technology of 2025–2026: **large language models and generative AI**.

This is the phase that closes the gap between where most MBA graduates are (talking about AI) and where high-value data professionals need to be (building with AI).

**Phase 10 transforms you from AI consumer to AI engineer**, capable of:

- Selecting the right model for any task using a repeatable evaluation framework
- Building RAG systems that give LLMs access to private company knowledge
- Fine-tuning open-source models with LoRA/QLoRA for specialized domains
- Deploying production agents that use tools, take actions, and handle failures
- Evaluating output quality at scale — and detecting when it degrades
- Running LLM systems profitably through caching, routing, and token optimization
- Applying vision-language models to document intelligence workflows
- Designing AI product experiences that users trust and that comply with law

**What makes this phase unique:**

- **2026 skill demand**: Every topic maps directly to a critical gap in the 2026 MBA-to-data-professional transition
- **Full-stack**: From raw API calls → frameworks → agents → ops → ethics — no gaps
- **Production-grade**: Emphasis on what actually works in production, not just demos
- **Responsible by design**: Ethics and responsible AI are embedded in every layer, not treated as an afterthought

---

## The Journey Through Phase 10

### Week 1: Foundations (Days 109–111)

**Day 109: LLM Landscape**
- The model zoo: GPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro, Llama 3.1, Mistral
- Open-source vs closed-source — deployment tradeoffs and data privacy
- Model selection framework: sensitivity, context, task, budget
- Benchmarks: MMLU, HumanEval, MT-Bench — what they measure and what they miss
- *Why it matters*: Wrong model choice = 10x the cost or half the quality

**Day 110: Prompt Engineering Mastery**
- Zero-shot, few-shot, chain-of-thought, self-consistency
- System prompt engineering for persona, constraints, and output format
- Structured output with JSON mode and Pydantic/instructor
- Prompt injection: the threat and the defenses
- Temperature, max_tokens, and prompt versioning in production
- *Why it matters*: Better prompts unlock 90% of model capability before spending on fine-tuning

**Day 111: LangChain & LlamaIndex**
- LangChain LCEL: `prompt | llm | parser` composition pattern
- Document loaders and text splitters for any file format
- Conversation memory: sliding windows and summary buffers
- RunnableParallel for concurrent multi-analysis pipelines
- LlamaIndex: persistent queryable knowledge bases over large corpora
- *Why it matters*: The frameworks that 90% of production LLM applications are built on

---

### Week 2: RAG & Fine-Tuning (Days 112–113)

**Day 112: RAG Pipelines**
- What embeddings are: text → vector → cosine similarity
- The complete RAG stack: chunk → embed → store → retrieve → generate
- ChromaDB: local persistent vector store with metadata filtering
- Retrieval strategies: Dense, MMR (diversity), Hybrid (BM25 + dense), Reranking
- RAGAS evaluation: faithfulness, relevancy, context recall, context precision
- RAG failure modes: chunk mismatch, query-doc mismatch, stale index
- *Why it matters*: RAG is the most deployed LLM architecture in enterprise settings

**Day 113: Fine-Tuning LLMs**
- The decision tree: prompt engineering → RAG → fine-tuning
- Instruction dataset preparation: Alpaca and ShareGPT formats
- LoRA math: low-rank decomposition, only 0.5% of params trained
- QLoRA: 4-bit quantization enabling 70B fine-tuning on a single A100
- Unsloth: 2x faster training, 70% memory savings vs standard PEFT
- Training monitoring: loss curves, overfitting detection, held-out evaluation
- *Why it matters*: Teaches a general LLM your company's specific terminology and format

---

### Week 3: Production Systems (Days 114–116)

**Day 114: Evaluation & Guardrails**
- RAGAS: automated RAG quality scoring with numeric thresholds
- LLM-as-a-judge: scalable quality evaluation without human labelers
- NeMo Guardrails: Colang configuration for topic restrictions
- Guardrails AI: Pydantic validators for output schema enforcement
- The 4 failure modes: hallucination, refusal overreach, drift, jailbreak
- Continuous evaluation: sample 1-5% of production traffic nightly
- *Why it matters*: Shipping without evaluation is shipping without tests

**Day 115: LLM Agents & Tool Use**
- ReAct loop: Reason → Act → Observe → Reason (with cycles)
- OpenAI function calling: JSON schema design, multi-tool dispatch
- LangChain AgentExecutor with custom @tool decorators
- Multi-agent orchestration: specialist agents for data, analysis, writing
- Agent safety: max_iterations, HITL approval, irreversible action gates
- *Why it matters*: Agents that act are 10x more valuable than models that only talk

**Day 116: LLM Ops & Cost Management**
- Token cost anatomy: why output tokens cost 4x more than input
- Prompt compression: 30-70% reduction with zero quality loss
- Semantic caching: 20-40% hit rate for FAQ-type workloads
- Model routing: cheap models for simple tasks → 16x cost reduction
- LangSmith tracing: cost attribution, debugging, regression detection
- Combined optimization: reduce 80% of LLM spend without quality sacrifice
- *Why it matters*: A product that works but isn't economically viable won't survive

---

### Week 4: Applications & Responsibility (Days 117–120)

**Day 117: Multimodal AI**
- Vision-language models: GPT-4o, Gemini 1.5 Pro, Claude 3.5 Sonnet
- Image input: URL references vs base64 encoding; detail settings
- Document intelligence: invoice extraction, contract analysis, receipt parsing
- Chart analysis: extracting structured data from graphs without OCR
- Multi-page PDF processing: convert to images, process per page, synthesize
- VLM capabilities and limits: what they do and don't reliably see
- *Why it matters*: 80% of enterprise data is not plain text — VLMs unlock the rest

**Day 118: AI Product Design**
- The 6-gate AI feature decision framework (problem → privacy)
- Confidence UX patterns: high/medium/low confidence UI flows
- The AI Feature Spec template: required doc before any AI feature ships
- 5 failure modes and their UX mitigations (hallucination, refusal, drift...)
- Co-pilot vs autopilot: when to automate and when to keep humans in control
- Responsible launch checklist: accuracy, safety, UX, monitoring, legal
- *Why it matters*: Technical capability without product judgment yields features no one trusts

**Day 119: AI Ethics in Practice**
- Taxonomy of AI bias: data, prompt framing, retrieval, output, evaluation
- Counterfactual testing: swap demographic details, measure output stability
- AIF360 fairness metrics: disparate impact (4/5ths rule), statistical parity
- Red-teaming methodology: injection, jailbreaks, data leakage, bias probing
- Model cards: the documentation required for responsible AI deployment
- Responsible deployment checklist: transparency, privacy, safety, accountability
- *Why it matters*: EU AI Act, EEOC, GDPR — compliance is now a technical requirement

**Day 120: Capstone — AI Data Assistant**
- Full-stack integration: RAG + SQL agent + semantic caching + guardrails
- Query routing: orchestrator determines RAG vs agent per question type
- Evaluation pipeline: RAGAS on production sample
- Monitoring hooks: latency logging, cost tracking, cache hit rate
- Model card and responsible deployment documentation
- *Why it matters*: The capstone proves you can build, not just understand

---

## The Business Value Proposition

### ROI by Technique

| Day     | Technique               | Industry Example                        | Impact                             |
| ------- | ----------------------- | --------------------------------------- | ---------------------------------- |
| **109** | Model selection         | Routing 70% of queries to cheap model   | 16x cost savings                   |
| **110** | Prompt engineering      | Chain-of-thought for financial analysis | 40% accuracy improvement           |
| **111** | LangChain RAG           | Internal policy Q&A assistant           | 3 hrs/day → 10 min per employee    |
| **112** | RAG pipelines           | Salesforce knowledge base bot           | 40% reduction in support tickets   |
| **113** | Fine-tuning             | Law firm: clause classification         | 93% accuracy on firm-specific docs |
| **114** | Evaluation & guardrails | Hospital chatbot safety                 | Prevented $2M liability incident   |
| **115** | AI agents               | Research automation at McKinsey         | 8hr report → 20 minutes            |
| **116** | LLM Ops                 | Semantic caching in support bot         | 85% cost reduction ($3K → $450/mo) |
| **117** | Multimodal AI           | Invoice processing at SAP               | 95% automation of AP workflows     |
| **118** | AI product design       | Launched AI feature with high NPS       | 23% CSAT improvement               |
| **119** | AI ethics               | Bias audit for hiring AI                | Avoided $10M EEOC settlement       |
| **120** | Capstone system         | End-to-end data assistant               | $2.5M/yr productivity value        |

---

## Skills Matrix

### Foundational Skills (All Students)

- ✅ Select the right LLM for any task using the decision framework
- ✅ Write zero-shot, few-shot, and chain-of-thought prompts
- ✅ Force structured JSON output using JSON mode and Pydantic
- ✅ Build a basic RAG pipeline with ChromaDB and LangChain
- ✅ Explain when fine-tuning is warranted vs. RAG vs. prompting
- ✅ Evaluate a RAG system using RAGAS faithfulness and relevancy
- ✅ Build a single-agent ReAct loop with OpenAI function calling
- ✅ Implement semantic caching and model routing for cost control
- ✅ Extract structured data from document images using VLMs
- ✅ Write an AI Feature Spec with failure modes and evaluation plan
- ✅ Conduct a basic fairness audit using counterfactual testing
- ✅ Write a model card for a deployed AI system

### Advanced Skills (For Practitioners)

- ⚡ Fine-tune a 7B model with QLoRA on a custom instruction dataset
- ⚡ Build a multi-agent workflow with specialist agents and handoffs
- ⚡ Implement hybrid search (BM25 + dense) with cross-encoder reranking
- ⚡ Build a semantic cache with TTL and cache invalidation logic
- ⚡ Design a continuous evaluation pipeline with alerting thresholds
- ⚡ Implement prompt injection defenses validated by red-team testing
- ⚡ Process multi-page PDFs with per-page vision extraction + synthesis
- ⚡ Run AIF360 bias audit and interpret disparate impact ratios

### Expert Skills (For Architects & Leaders)

- 🔬 Design a production LLM platform with multi-tenant data isolation
- 🔬 Build a custom LangChain provider for proprietary vector databases
- 🔬 Design RLHF-style feedback loop from user thumbs up/down signals
- 🔬 Architect an organization-wide AI governance framework
- 🔬 Implement LLM fine-tuning at scale with experiment versioning
- 🔬 Design a responsible AI review board process for enterprise AI products

---

## Real-World Application Scenarios

### Scenario 1: The Internal Knowledge Assistant

**Company**: Financial services firm with 8,000 employees and 200TB of internal SharePoint/Confluence/PDF content.

**Challenge**: Employees spend 2.5 hours/day searching for policies, past analyses, and templates. New joiners take 6 months to become productive.

**Phase 10 Solution**:
1. **Day 111 (LangChain)**: Document loaders across SharePoint, Confluence, email archives — clean, deduplicate, structure
2. **Day 112 (RAG)**: Index 200TB with `text-embedding-3-small`, hybrid search (BM25 + dense), reranking
3. **Day 113 (Fine-Tuning)**: Fine-tune Llama 3.1 8B on firm's writing style and terminology with LoRA
4. **Day 115 (Agents)**: Add tools: query compliance systems, check calendar availability, file document requests
5. **Day 116 (Ops)**: Semantic caching, model routing (compliance queries → GPT-4o, general → fine-tuned LLaMA)
6. **Day 118–119 (Product + Ethics)**: Feature spec written, bias audit completed, data access controls enforced

**Impact**: 2.5hrs → 12 min per employee per day. 8,000 employees × $80/hr × 2.3hrs saved = **$1.47M/day saved**.

---

### Scenario 2: The Intelligent Document Processor

**Company**: Global insurance company processes 200,000 claims documents (PDFs, forms, photos) per month.

**Challenge**: Each document requires 15 minutes of manual data entry. $480,000/month in labor. Error rate: 4.2%.

**Phase 10 Solution**:
1. **Day 117 (Multimodal)**: GPT-4o vision extracts structured data from scanned forms, medical reports, photos
2. **Day 112 (RAG)**: Policy knowledge base for cross-referencing claim eligibility
3. **Day 114 (Evaluation)**: RAGAS-style extraction accuracy monitoring; flag low-confidence documents for human review
4. **Day 119 (Ethics)**: Bias audit to ensure claim approval rates don't vary by policyholder demographics
5. **Day 116 (Ops)**: Batch API calls during off-peak hours for 50% cost savings

**Impact**: 15 min → 90 sec per document. 200,000 docs × 13.5 min saved = 45,000 hrs/month = **$360,000/month saved** (75% reduction). Error rate: 4.2% → 0.8%.

---

### Scenario 3: The Product Intelligence Layer

**Company**: SaaS analytics platform with 15,000 business users who are not technical.

**Challenge**: Non-technical users can't answer their own data questions — they queue requests to the data team, which has a 3-day backlog. The CEO received her Q3 revenue breakdown 5 days after Q3 ended.

**Phase 10 Solution**:
1. **Day 115 (Agents)**: SQL agent converts plain-English questions to SQL against the production data warehouse
2. **Day 112 (RAG)**: Policy and metric definition knowledge base (what is "active user"? how is "churn" calculated?)
3. **Day 110 (Prompting)**: Few-shot examples for common question patterns; JSON mode for charting output
4. **Day 116 (Ops)**: Semantic cache for popular reports (weekly revenue query hits cache 200 times/day)
5. **Day 118 (Product Design)**: Confidence-gated output — queries with ambiguous references ask clarifying questions first
6. **Day 114 (Guardrails)**: Topic restriction to approved metrics; no raw PII in outputs

**Impact**: 3-day backlogs eliminated. Data team refocused on strategic work. CEO gets Q3 breakdown in 8 seconds.

---

## Common Pitfalls & Solutions

### Pitfall 1: "Our RAG system hallucinates despite having the right documents"
**Why**: Retrieved chunks are correct, but the LLM ignores them and relies on training knowledge instead.
**Fix**: Strengthen the system prompt: "Answer ONLY from the provided context. If the answer is not in the context, say 'I don't have that information.'" Use temperature=0. Implement RAGAS faithfulness metric — if it drops below 0.85, retune the prompt.

### Pitfall 2: "Fine-tuning made the model better on training examples but worse in production"
**Why**: Overfitting — the model memorized the training data rather than generalizing. Or: the training distribution doesn't match production queries.
**Fix**: Always evaluate on a held-out 20% test set (never touch it during training). Collect 20 real production examples and evaluate before/after fine-tuning. If train loss hits 0.01 but eval loss is 2.0, add more training data and/or reduce training steps.

### Pitfall 3: "Our agent enters an infinite loop and burns $50 in API costs"
**Why**: No `max_iterations` limit. Agent calls the same tool repeatedly when results are ambiguous.
**Fix**: Always set `max_iterations=5-10`. Add a self-evaluation prompt after each tool call: "Do I have enough information to answer the question now? Yes/No." Log every tool call — loop detection triggers when the same tool is called with the same args 3 times in a row.

### Pitfall 4: "Semantic caching returns stale answers after data updates"
**Why**: The cache doesn't know that the underlying data has changed. "What is today's revenue?" returns yesterday's cached answer.
**Fix**: Implement time-to-live (TTL): fresh data questions expire in 1 hour; policy questions in 7 days; historical reports in 30 days. Use metadata tags (`cache_category: "real_time"`) to bypass cache for time-sensitive queries. On significant data refreshes, clear the relevant cache partition.

### Pitfall 5: "Our bias audit passed at launch but we discovered bias 6 months later"
**Why**: Distribution shift — the user population in production is different from the test set. Or: the model behaved differently in production due to unseen inputs.
**Fix**: Bias is not a one-time audit — it's a continuous monitoring task. Set a monthly fairness metric review in production. Alert if any demographic gap exceeds the threshold. Include fairness metrics in your regular product health dashboard alongside latency and error rate.

---

## Phase Milestone Exam

> ⚠️ **Synthetic Challenge Questions** — Each requires combining knowledge from 3-4 days.

### Question 1: The Failing Knowledge Assistant

**Combines**: Day 112 (RAG), Day 114 (Evaluation), Day 116 (Ops)

**Scenario**: Your company's internal knowledge assistant is returning accurate answers for 85% of questions — but for 15%, users report: "That information is outdated" or "That's not in our policy." Simultaneously, your LLM API costs have tripled this month because the company hired 200 new employees who all use the assistant.

**Task**:
1. Design a 3-step evaluation process to diagnose WHY retrieval accuracy is 85% (not higher)
2. Propose two retrieval strategy upgrades based on your diagnosis
3. Implement a cost optimization plan targeting 50% cost reduction while maintaining quality

<details>
<summary>💡 Hints</summary>

- Evaluate: context recall (did we retrieve the right chunks?), context precision (were retrieved chunks relevant?), faithfulness (is answer grounded?)
- Strategies: BM25+dense hybrid for keyword precision; MMR for diversity; reranking for accuracy
- Ops: semantic caching (high hit rate for common onboarding questions); route simple FAQs to GPT-4o-mini

</details>

---

### Question 2: The Compliant Healthcare Chatbot

**Combines**: Day 114 (Guardrails), Day 118 (AI Product Design), Day 119 (AI Ethics)

**Scenario**: A hospital wants to deploy an LLM chatbot for patient-facing discharge instructions. The chatbot reads the patient's discharge summary (uploaded by a nurse) and answers patient questions about it.

**Task**:
1. Apply the 6-gate AI feature framework — which gates does this feature need to pass?
2. Design the guardrail system: what topics must be blocked? What output validation is required?
3. Write the responsible deployment checklist specific to this HIPAA-regulated use case

<details>
<summary>💡 Hints</summary>

- Gates: failure severity = HIGH (medical context); privacy = critical (PHI/HIPAA); success metrics = accuracy >98%, no hallucination of drug dosages
- Guardrails: block diagnosis questions ("Do I have cancer?"), medication changes, treatment recommendations; output must cite source document section; PII stripped from logs
- HIPAA: Business Associate Agreement with LLM provider; data not used for training; audit log of every query; access control by patient ID

</details>

---

### Question 3: The Expensive Agent

**Combines**: Day 115 (Agents), Day 116 (Ops), Day 110 (Prompting)

**Scenario**: Your customer analytics agent answers questions like "Which customers are at churn risk this week?" It works well — but each query costs $2 in API calls and takes 45 seconds. At 200 queries/day, that's $400/day ($146,000/year).

**Task**:
1. Profile the cost breakdown (how many tool calls? which model? input vs output token ratio?)
2. Design a 3-layer optimization strategy to cut costs to <$0.50 per query
3. How would you verify that cost reduction didn't degrade answer quality?

<details>
<summary>💡 Hints</summary>

- Profile: most costs likely come from large SQL results in context; expensive model for routing/reasoning steps; no caching
- Optimization L1: semantic cache for weekly recurring questions (same query Mon morning: 80% hit rate). L2: Route SQL generation to GPT-4o-mini; use GPT-4o only for final synthesis. L3: Compress SQL results before sending to LLM (aggregate, don't return raw rows)
- Quality gate: A/B test old vs new pipeline on 50 eval questions; require same accuracy threshold

</details>

---

### Question 4: The Multimodal Intelligence Platform

**Combines**: Day 117 (Multimodal), Day 112 (RAG), Day 113 (Fine-Tuning)

**Scenario**: A law firm has 50,000 past case documents in PDF format (scanned, non-searchable). They want: (1) semantic search across all documents, (2) automatic identification of key legal clauses, (3) a Q&A assistant that cites specific case precedents.

**Task**:
1. Should they use VLM-based extraction, OCR-first, or another approach? Justify the decision.
2. Design the chunking strategy for legal documents (hint: legal structure matters)
3. How would they know if the clause classifier is biased against certain case types?

<details>
<summary>💡 Hints</summary>

- Approach: OCR-first (AWS Textract / Azure) for bulk processing (cheaper than VLM at 50K docs), VLM for complex tables, diagrams, and handwritten annotations
- Chunking: parse legal structure — WHEREAS, THEREFORE, §1, §2 create natural boundaries; preserve sentence context across chunk boundaries; keep citations intact
- Bias: stratify test set by case type, jurisdiction, and time period; check recall@10 across strata; flag if precision drops >10% for minority case types

</details>

---

## Specialization Tracks

**Track A: LLM Product Engineer**
- Master: Days 110, 112, 115, 118
- Extend with: LangGraph (stateful multi-agent), Vercel AI SDK, OpenAI Assistants API
- Build: Production AI-powered SaaS feature with evaluation dashboard

**Track B: AI Infrastructure & Ops**
- Master: Days 113, 114, 116
- Extend with: vLLM serving, kubernetes + GPU scheduling, LangSmith Enterprise
- Build: Private LLM serving infrastructure with SLA and cost monitoring

**Track C: Responsible AI Leader**
- Master: Days 118, 119, and EU AI Act study
- Extend with: ISO 42001 (AI Management Systems), NIST AI RMF
- Build: AI governance framework + model card governance process for an organization

---

## Resources & Further Reading

### Libraries & Frameworks

- [LangChain](https://python.langchain.com/) — Orchestration, chains, agents
- [LlamaIndex](https://docs.llamaindex.ai/) — Knowledge base indexing and retrieval
- [ChromaDB](https://docs.trychroma.com/) — Local vector store
- [Pinecone](https://pinecone.io/) / [Weaviate](https://weaviate.io/) — Cloud-scale vector databases
- [RAGAS](https://docs.ragas.io/) — RAG evaluation framework
- [NeMo Guardrails](https://github.com/NVIDIA/NeMo-Guardrails) — LLM safety rails
- [Unsloth](https://github.com/unslothai/unsloth) — Fast LoRA/QLoRA fine-tuning
- [instructor](https://github.com/jxnl/instructor) — Structured LLM outputs with Pydantic
- [LangSmith](https://docs.smith.langchain.com/) — LLM tracing and evaluation
- [AIF360](https://aif360.res.ibm.com/) — AI Fairness 360

### Books

- *"Building LLM Apps"* by Valentina Alto — Practical LangChain + LlamaIndex guide
- *"Hands-On Large Language Models"* by Jay Alammar & Maarten Grootendorst — Visual deep dive
- *"AI Engineering"* by Chip Huyen (2025) — Production LLM systems from first principles
- *"Trustworthy Machine Learning"* by Kush R. Varshney — Responsible AI foundations

### Must-Read Papers

- [Attention Is All You Need (Vaswani et al., 2017)](https://arxiv.org/abs/1706.03762) — The transformer paper
- [LoRA (Hu et al., 2021)](https://arxiv.org/abs/2106.09685) — Low-rank adaptation for fine-tuning
- [ReAct (Yao et al., 2022)](https://arxiv.org/abs/2210.03629) — Reasoning and acting in language models
- [RAGAS (Es et al., 2023)](https://arxiv.org/abs/2309.15217) — RAG evaluation metrics
- [RAG Survey (Gao et al., 2024)](https://arxiv.org/abs/2312.10997) — Comprehensive RAG patterns

### Communities & Events

- [AI Engineer World's Fair](https://www.ai.engineer/) — Annual conference for LLM builders
- [Latent Space Podcast](https://www.latent.space/) — Weekly deep dives on AI engineering
- [r/LocalLLaMA](https://reddit.com/r/localllama) — Open-source LLM community
- [Weights & Biases (wandb) blog](https://wandb.ai/site/articles) — MLOps + LLM production insights

---

## What's Next

You've completed the full 120-day curriculum. Depending on your career path:

### For the Data Analyst / BI Specialist
- Apply Day 110–112 immediately: build an LLM assistant over your team's documentation
- The most impactful next skill: LangGraph for stateful data workflows

### For the ML Engineer / Data Scientist
- Apply Day 113 + 115: fine-tune a domain model and deploy it as an agent with tools
- The most impactful next skill: vLLM for serving open-source models at production scale

### For the Technical Product Manager / MBA
- Apply Day 118–119: lead an AI feature spec and responsible deployment for your team
- The most impactful next skill: EU AI Act literacy (compliance is a competitive advantage in 2026)

### For the Aspiring AI Engineer
- Complete all 12 days, build the Day 120 capstone fully, and ship it publicly
- The most impactful next skill: LangGraph + LangSmith for observable production agents

---

**Congratulations on completing Phase 10 — and the complete 120-day Coding for MBA curriculum!** 🎓

You've traveled from algorithmic thinking and Python fundamentals through machine learning, SQL mastery, data engineering, and now the cutting edge of generative AI. The skills in this curriculum represent what the most sought-after business-data professionals know in 2026.

**What you've built isn't just knowledge — it's capability.**
