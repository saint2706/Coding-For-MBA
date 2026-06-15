# Gap Analysis — Phase 06: Cutting-Edge ML

> Audited against the Phase 1 Quality Bar. See [GAP_ANALYSIS.md](../../GAP_ANALYSIS.md) for the full rubric, gap taxonomy, and severity legend.

## Phase summary

Phase 06 consistently supplies complete frontmatter, approachable analogies, MBA-oriented examples, senior notes, explained mastery answers, and strong quizzes. Its largest quality gap is that it reads as twelve independent surveys rather than a cumulative production curriculum: glossaries, explicit pitfall callouts, cross-references, and a recurring project are mostly absent, while Days 68–72 omit expected lab outputs entirely. Several cutting-edge subjects also need deeper operational coverage and explicit differentiation from overlapping Phase 5/10 material.

**Recurring gaps in this phase:**

- No lesson contains a dedicated glossary, and most jargon is introduced inline without a consolidated reference.
- No recurring project thread connects the phase's models, pipelines, deployment, monitoring, agents, governance, RAG, and multimodal work.
- Most comparison tables describe differences but do not turn them into explicit decision rules, thresholds, or escalation choices.
- Labs after Day 67 generally lack expected output; several earlier exercises also provide code without fully justified constants or reproducible setup.
- Cross-references are sparse, especially for overlapping LLM fine-tuning, RAG, and multimodal lessons in Phases 5 and 10.

**Lessons audited:** 12

---

## Day 61 — Reinforcement & Offline Learning

**Path:** `content/lessons/Phase_06_Cutting_Edge_ML/Day_61_Reinforcement_and_Offline_Learning/README.md`

**Assessment:** This is one of the phase's strongest lessons: the dog-training bridge, Q-learning equation, business applications, production considerations, three exercises, explained mastery check, and summary form a useful layered introduction. However, the central coding lab visibly discovers that its world is unsound mid-lesson—“Correction in logic” and “Let's Fix the World for the student”—then supplies only symbolic expected values, which blocks a clean first run; offline RL itself remains much thinner than tabular Q-learning.

**Gap task stubs:**

- [ ] [P0][C:Lab] Rewrite Exercise 2 into one internally consistent, runnable grid world; remove the mid-lab “Correction in logic” / “Let's Fix the World for the student” detour and provide deterministic or bounded approximate expected Q-values.
- [ ] [P1][M:Coverage] Expand “Offline RL (Batch RL)” with behavior-policy coverage, out-of-distribution actions, conservatism, off-policy evaluation, and a safe go/no-go deployment workflow.
- [ ] [P1][A:Concept] Justify the lab's `alpha = 0.1`, `gamma = 0.9`, `epsilon = 0.1`, 500 episodes, and inventory reward constants; explain how changing each affects business behavior.
- [ ] [P1][F:Tables] Convert “Online vs. Offline RL” into a decision guide with risk tolerance, simulator availability, feedback delay, and minimum logging-quality criteria.
- [ ] [P1][N:Thread] Introduce a phase-long business system whose policy, deployment, monitoring, governance, and later agent/RAG components can be extended in Days 62–72.
- [ ] [P2][O:Glossary] Add a glossary for agent, environment, state, action, policy, reward, Q-value, epsilon, discount factor, behavior policy, and off-policy evaluation.

---

## Day 62 — Model Interpretability & Fairness

**Path:** `content/lessons/Phase_06_Cutting_Edge_ML/Day_62_Model_Interpretability_and_Fairness/README.md`

**Assessment:** The loan-rejection bridge and global/local distinction are clear, and the SHAP and bias-detection exercises make abstract ideas tangible. Yet the lesson makes overly broad claims—“SHAP is the gold standard” and GDPR laws “require companies to explain automated decisions”—without discussing method assumptions, correlated-feature failure modes, jurisdictional nuance, or how an executive chooses among competing fairness criteria.

**Gap task stubs:**

- [ ] [P0][A:Concept] Qualify “SHAP is the gold standard” by defining model-specific versus model-agnostic explainers, baseline/background data, correlated-feature caveats, and why an explanation is not a causal account.
- [ ] [P1][M:Coverage] Add fairness-metric incompatibility, calibration, subgroup sample-size uncertainty, proxy variables, intersectional analysis, and mitigation choices before/after training.
- [ ] [P1][I:Senior] Replace the blanket GDPR “Right to Explanation” statement with a jurisdiction-aware governance note and a checklist to involve legal/compliance counsel.
- [ ] [P1][F:Tables] Extend “The Accuracy-Interpretability Trade-off” with explicit model-selection guidance based on decision stakes, auditability, latency, and appeal requirements.
- [ ] [P1][K:Xref] Cross-reference Day 69 Responsible AI and clarify what fairness material is introductory here versus operationalized there.
- [ ] [P2][O:Glossary] Add a glossary for SHAP, Shapley value, LIME, global/local interpretability, disparate impact, equal opportunity, protected class, and proxy variable.

---

## Day 63 — Causal Inference & Uplift

**Path:** `content/lessons/Phase_06_Cutting_Edge_ML/Day_63_Causal_Inference_and_Uplift/README.md`

**Assessment:** The rain/umbrella framing, Simpson's paradox example, “Persuadables” framing, and ROI-oriented uplift discussion are highly MBA-relevant. The lesson nonetheless jumps from identifying confounders to calculating uplift without teaching identification assumptions, uncertainty, validation, or how to estimate effects from real observational data; the Translation Lab requests artifacts but gives no sample dataset or expected deliverable.

**Gap task stubs:**

- [ ] [P0][M:Coverage] Add potential outcomes, ATE/CATE, treatment/control assignment, overlap/positivity, ignorability, leakage, and confidence intervals before presenting uplift scores as actionable.
- [ ] [P1][C:Lab] Turn the Translation Lab's “Your task” list into a reproducible case with sample campaign data, steps, a memo template, and expected charts/KPI conclusions.
- [ ] [P1][M:Coverage] Add practical estimators and selection guidance: randomized experiments, regression adjustment, propensity scores, difference-in-differences, instrumental variables, and uplift-model evaluation (Qini/AUUC).
- [ ] [P1][H:Pitfalls] Add a dedicated pitfalls callout for post-treatment variables, selection bias, interference, peeking, heterogeneous effects, and targeting “Sleeping Dogs.”
- [ ] [P1][K:Xref] Link to prior experimentation/statistics lessons and forward-link to monitoring causal interventions after deployment.
- [ ] [P2][O:Glossary] Add a glossary for confounder, counterfactual, intervention, ATE, CATE, propensity score, uplift, persuadable, and sleeping dog.

---

## Day 64 — Modern NLP Pipelines

**Path:** `content/lessons/Phase_06_Cutting_Edge_ML/Day_64_Modern_NLP_Pipelines/README.md`

**Assessment:** The “intern who read every book” bridge, pipeline API examples, and NER/zero-shot/semantic-search labs provide an accessible tour of modern NLP. It is primarily a collection of happy-path Hugging Face calls, though: “one-line magic” obscures model selection, data governance, evaluation, reproducibility, failure handling, and the distinction between a demo pipeline and an operable business pipeline.

**Gap task stubs:**

- [ ] [P0][M:Coverage] Add task-specific evaluation and acceptance criteria for NER, classification, and semantic search, including labeled test sets, precision/recall trade-offs, subgroup/language slices, and human review.
- [ ] [P1][B:CodeCtx] Replace the “one-line magic” framing with what/why preambles that explain model downloads, inference defaults, output schemas, hardware/network requirements, and reproducibility risks.
- [ ] [P1][C:Lab] Provide pinned dependencies, sample inputs/datasets, offline/failure alternatives, and expected outputs robust to changing hosted model scores.
- [ ] [P1][M:Coverage] Cover preprocessing, batching, truncation, multilingual/domain shift, PII handling, prompt/model injection risks, and model licensing.
- [ ] [P1][K:Xref] Cross-reference Day 70 fine-tuning and Day 71 RAG, explicitly stating when classification pipelines, fine-tuning, or retrieval are the better investment.
- [ ] [P2][O:Glossary] Add a glossary for transformer, encoder, decoder, tokenization, embedding, NER, zero-shot, transfer learning, and cosine similarity.

---

## Day 65 — MLOps Pipelines & CI

**Path:** `content/lessons/Phase_06_Cutting_Edge_ML/Day_65_MLOps_Pipelines_and_CI/README.md`

**Assessment:** The McDonald's analogy, three-pillar versioning, training-serving skew, and validation exercises make the operational mindset clear. But Exercise 1 only “Simulate[s] MLflow Tracking,” CI/CD/CT is not implemented, and the Translation Lab asks for a dashboard and decision memo without data or expected output, leaving the lesson short of its “Pipelines & CI” title.

**Gap task stubs:**

- [ ] [P0][M:Coverage] Add an actual minimal CI pipeline that runs unit, data-contract, model-performance, fairness, and packaging checks with explicit promotion/failure gates.
- [ ] [P1][C:Lab] Replace or supplement “Simulate MLflow Tracking” with a real, pinned MLflow/DVC or lightweight equivalent workflow and show expected run/artifact output.
- [ ] [P1][C:Lab] Give the Translation Lab sample pipeline events, KPI formulas, dashboard acceptance criteria, and an example deploy/rollback memo.
- [ ] [P1][I:Senior] Add registry stages, lineage, rollback, secrets, artifact integrity/SBOM, ownership, retraining approval, and cost controls.
- [ ] [P1][A:Concept] Justify “Only ~5%,” “10% of experiments,” validation ranges, and the simulated accuracy formula; distinguish illustrative numbers from sourced benchmarks.
- [ ] [P2][O:Glossary] Add a glossary for CI, CD, CT, lineage, artifact, model registry, feature store, data contract, skew, and reproducibility.

---

## Day 66 — Model Deployment & Serving

**Path:** `content/lessons/Phase_06_Cutting_Edge_ML/Day_66_Model_Deployment_and_Serving/README.md`

**Assessment:** The food-truck/catering analogy and cost-versus-latency table offer a strong architectural bridge, and the FastAPI, Dockerfile, and batch examples are concrete. Still, the “prediction API” merely adds numbers rather than serving a serialized model, Docker is shown but not run, Exercise 2 has no expected output, and production concerns such as authentication, observability, scaling, and safe serialization are absent.

**Gap task stubs:**

- [ ] [P0][C:Lab] Upgrade Exercise 1 from “adds two numbers (simulating a model)” to loading and serving a small versioned model with validation, error responses, health/readiness endpoints, and exact curl/test output.
- [ ] [P1][C:Lab] Make Exercise 2 runnable with `requirements.txt`, build/run commands, image-size/security checks, and expected build and API outputs.
- [ ] [P1][M:Coverage] Cover streaming and edge patterns, autoscaling, concurrency, timeouts, retries, idempotency, authentication, secrets, observability, and GPU/model-server choices.
- [ ] [P1][H:Pitfalls] Add a callout on unsafe pickle deserialization, dependency vulnerabilities, unbounded inputs, cold starts, and retry storms.
- [ ] [P1][F:Tables] Turn the architecture table into a selection rubric with traffic shape, p95/p99 SLO, freshness, cost ceiling, and outage-tolerance thresholds.
- [ ] [P2][O:Glossary] Add a glossary for REST, endpoint, serialization, container/image, serverless, cold start, throughput, latency, canary, and shadow mode.

---

## Day 67 — Model Monitoring & Reliability

**Path:** `content/lessons/Phase_06_Cutting_Edge_ML/Day_67_Model_Monitoring_and_Reliability/README.md`

**Assessment:** The “model is a living system” framing, drift distinction, feedback-loop warning, and PSI/fallback/monitor labs are useful foundations. The lesson remains metric-centric rather than operational: thresholds are illustrative but not justified, delayed labels and ground truth are underdeveloped, and the Translation Lab has no supplied alerts, owners, or expected action plan.

**Gap task stubs:**

- [ ] [P0][M:Coverage] Add a complete monitoring stack spanning service SLOs, data quality, drift, model quality, business KPIs, fairness, costs, and delayed/absent ground truth.
- [ ] [P1][A:Concept] Justify PSI bins and alert thresholds rather than presenting fixed cutoffs as universal; explain calibration using baselines, seasonality, and false-alert budgets.
- [ ] [P1][C:Lab] Supply sample time-series/segment data and expected dashboard, alert, and incident-response outputs for the Translation Lab.
- [ ] [P1][I:Senior] Add runbooks, severity levels, owner/on-call routing, rollback/fallback triggers, postmortems, retraining gates, and monitoring of monitors.
- [ ] [P1][K:Xref] Connect this lesson explicitly to Day 65 CI/retraining, Day 66 deployment, and Day 69 fairness governance.
- [ ] [P2][O:Glossary] Add a glossary for covariate drift, concept drift, PSI, KS test, SLO, alert fatigue, feedback loop, fallback, and ground truth.

---

## Day 68 — AI Agents & Tool Use

**Path:** `content/lessons/Phase_06_Cutting_Edge_ML/Day_68_AI_Agents_and_Tool_Use/README.md`

**Assessment:** The intern analogy, ReAct loop, tool-schema examples, and “Three Guard Rails” make agents approachable and appropriately risk-aware. However, every exercise lacks expected output, the hand-built agent is not evaluated, and the lesson's provider/framework examples risk aging quickly; it does not cover durable state, permission design, prompt injection, or production traces deeply enough.

**Gap task stubs:**

- [ ] [P0][C:Lab] Add exact or representative expected traces/output for all three exercises, including safe refusal/error paths and assertions students can use to verify tool selection and arguments.
- [ ] [P0][M:Coverage] Add prompt injection and indirect injection defenses, least-privilege credentials, sandboxing, approval gates, idempotency, budgets, timeouts, and audit logs.
- [ ] [P1][M:Coverage] Teach agent evaluation with task-success sets, tool-call accuracy, groundedness, latency/cost, adversarial tests, and regression gates.
- [ ] [P1][A:Concept] Define tool calling versus agents, workflows, memory/state, planning, orchestration, and autonomy levels; qualify “The LLM never executes code” as an architectural boundary rather than a universal platform fact.
- [ ] [P1][K:Xref] Cross-reference RAG, deployment, monitoring, and Responsible AI lessons so students can assemble a governed agent system.
- [ ] [P2][O:Glossary] Add a glossary for ReAct, tool/function calling, observation, schema, orchestration, memory, sandbox, least privilege, and human-in-the-loop.

---

## Day 69 — Responsible AI in Practice

**Path:** `content/lessons/Phase_06_Cutting_Edge_ML/Day_69_Responsible_AI_in_Practice/README.md`

**Assessment:** This lesson improves on Day 62 by presenting multiple fairness metrics, a model-card template, and red-team prompts, while “Fairness Washing” is a valuable senior-level warning. Yet “in Practice” overpromises: all labs lack expected output, governance is reduced mostly to fairness/model cards/red teaming, and there is no risk-tiering, control ownership, incident process, or regulatory mapping.

**Gap task stubs:**

- [ ] [P0][M:Coverage] Add an end-to-end responsible-AI governance lifecycle: use-case intake, risk tiering, impact assessment, control owners, approval evidence, deployment conditions, monitoring, incident response, and retirement.
- [ ] [P1][C:Lab] Provide sample group outcomes, a completed model-card exemplar/rubric, a red-team test set, severity scoring, and expected findings/remediations for all exercises.
- [ ] [P1][M:Coverage] Expand beyond fairness to privacy, security/misuse, transparency, accessibility, human autonomy, intellectual property, environmental/cost impacts, and vendor risk.
- [ ] [P1][K:Xref] Reconcile overlap with Day 62 and cross-reference agent, RAG, and multimodal threat/control requirements rather than treating governance as a standalone topic.
- [ ] [P1][I:Senior] Add jurisdiction-aware regulatory coverage and require legal/compliance review rather than implying one fairness metric resolves a deployment decision.
- [ ] [P2][O:Glossary] Add a glossary for demographic parity, equal opportunity, predictive parity, model card, red teaming, impact assessment, risk tier, and fairness washing.

---

## Day 70 — LLM Fine-Tuning & PEFT

**Path:** `content/lessons/Phase_06_Cutting_Edge_ML/Day_70_LLM_Fine_Tuning_and_PEFT/README.md`

**Assessment:** The “specialist training” analogy, LoRA parameter math, PEFT snippet, and “When to Use Each Approach” table give a concise conceptual introduction. The labs stop at parameter counting and data formatting, though—none produces or evaluates a tuned model, no expected outputs are provided, and cost/hardware claims are presented as broadly applicable despite rapid change and overlap with other phases.

**Gap task stubs:**

- [ ] [P0][C:Lab] Add a small end-to-end PEFT/LoRA lab with pinned model/dataset, hardware-aware fallback, training command, saved adapter, before/after evaluation, and expected outputs.
- [ ] [P0][M:Coverage] Cover dataset quality/licensing/PII, train-validation-test splits, chat templates, masking, overfitting, catastrophic forgetting, hyperparameter selection, evaluation, safety regression, and adapter deployment/merging.
- [ ] [P1][A:Concept] Mark “350GB,” “weeks,” “$100,000+,” rank choices, and consumer-GPU claims as illustrative assumptions and teach students to estimate current memory/compute cost.
- [ ] [P1][F:Tables] Extend “When to Use Each Approach” into a decision framework comparing prompting, RAG, fine-tuning, distillation, and full training by knowledge freshness, behavior change, budget, latency, and governance.
- [ ] [P1][K:Xref] Add explicit cross-references to overlapping Phase 5 and Phase 10 fine-tuning material, stating prerequisite, unique scope, and what should not be repeated.
- [ ] [P2][O:Glossary] Add a glossary for PEFT, LoRA, QLoRA, rank, adapter, quantization, gradient, epoch, catastrophic forgetting, and instruction tuning.

---

## Day 71 — RAG & Vector Databases

**Path:** `content/lessons/Phase_06_Cutting_Edge_ML/Day_71_RAG_and_Vector_Databases/README.md`

**Assessment:** The open-book-exam bridge, complete pipeline sketch, chunking section, and RAG-versus-fine-tuning comparison form a coherent introduction. Still, all three labs omit expected output, the pipeline is a local happy path, and critical enterprise concerns—retrieval evaluation, permissions, citations, ingestion freshness, hybrid search, reranking, and injection defenses—are missing or shallow.

**Gap task stubs:**

- [ ] [P0][C:Lab] Add expected search results, chunks, grounding scores, and automated assertions for every exercise; supply a fixed mini-corpus so outputs are reproducible.
- [ ] [P0][M:Coverage] Add retrieval and answer evaluation using labeled queries, recall@k/MRR/NDCG, faithfulness, answer relevance, abstention, and end-to-end regression tests.
- [ ] [P1][M:Coverage] Cover ingestion/versioning, metadata filters, ACL-aware retrieval, hybrid search, reranking, deduplication, freshness/deletion, citations, and prompt-injection/data-exfiltration defenses.
- [ ] [P1][A:Concept] Define ANN/index choices and justify chunk size, overlap, top-k, embedding model, and similarity thresholds rather than leaving them as magic defaults.
- [ ] [P1][K:Xref] Flag overlap with Phase 5 and Phase 10 RAG/vector-database lessons and state this lesson's unique progression and prerequisites; link to Days 64, 68, and 70.
- [ ] [P2][O:Glossary] Add a glossary for embedding, vector store, ANN, chunk, overlap, top-k, reranker, hybrid search, grounding, and faithfulness.

---

## Day 72 — Multimodal AI

**Path:** `content/lessons/Phase_06_Cutting_Edge_ML/Day_72_Multimodal_AI/README.md`

**Assessment:** The “multilingual executive” bridge and invoice/receipt use cases communicate immediate business value, and the API examples make multimodal models feel accessible. As the phase finale, however, it has no “Tomorrow”/next-step preview, no expected lab outputs, no culminating recurring-project deliverable, and limited treatment of evaluation, privacy, image-based attacks, accessibility, or non-image modalities.

**Gap task stubs:**

- [ ] [P0][C:Lab] Provide fixture images/documents, expected JSON/output, field-level validation, confidence/review logic, and failure cases for all three exercises.
- [ ] [P0][M:Coverage] Add multimodal evaluation for OCR/extraction, visual question answering, hallucination, chart reasoning, subgroup/accessibility performance, and human-review thresholds.
- [ ] [P1][M:Coverage] Cover image/document prompt injection, malicious files, EXIF/PII, copyright/consent, retention, redaction, cost/latency, and secure file handling.
- [ ] [P1][M:Coverage] Expand beyond image-plus-text to audio/speech/video and provide a business decision guide for specialized OCR/document AI versus general VLMs.
- [ ] [P1][K:Xref] Flag overlap with Phase 5 and Phase 10 multimodal lessons, and connect multimodal RAG to Day 71 and governance/monitoring to Days 67–69.
- [ ] [P1][N:Thread] Make the final lab a capstone that integrates deployment, monitoring, RAG/agents, and responsible-AI controls from the phase-long project.
- [ ] [P1][J:Summary] Add a “Tomorrow”/next-phase preview and a Phase 06 synthesis checklist that maps each lesson into one production architecture.
- [ ] [P2][O:Glossary] Add a glossary for VLM, visual token, vision encoder, OCR, document AI, multimodal RAG, field-level accuracy, and confidence threshold.

---
