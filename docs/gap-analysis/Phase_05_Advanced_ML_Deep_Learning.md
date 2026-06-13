# Gap Analysis — Phase 05: Advanced ML & Deep Learning

> Audited against the Phase 1 Quality Bar. See [GAP_ANALYSIS.md](../../GAP_ANALYSIS.md) for the full rubric, gap taxonomy, and severity legend.

## Phase summary

Phase 05 is unusually rich in runnable examples, analogies, mastery answers, and production commentary, especially in Days 49–60. Its consistent weakness is that breadth outruns conceptual scaffolding: sophisticated methods and numerical defaults often arrive in quick succession, while labs are mostly completed walkthroughs rather than fully specified learner assignments. The short bridge lessons, Days 60B and 60C, are substantially below the phase's own standard because they defer hands-on work to Phase 10.

**Recurring gaps in this phase:**
- No lesson includes an explicit prerequisites section or glossary, despite dense specialist vocabulary.
- Labs rarely state a business scenario, learner deliverable, and concrete expected output independently of the supplied solution code.
- Many code blocks are introduced only by a heading or an inline code comment, and many defaults/magic numbers are not justified.
- Model-selection tables are useful but often omit cost, data-size, latency, interpretability, and failure-mode decision guidance.
- The optional build tracks are repeated, but most lessons do not explicitly carry one recurring artifact through the core lesson.
- Additional coverage is needed around evaluation, governance, robustness, and modern production practice.

**Lessons audited:** 14

---

## Day 49 — Natural Language Processing

**Path:** `content/lessons/Phase_05_Advanced_ML_Deep_Learning/Day_49_NLP/README.md`

**Assessment:** The lesson has a strong bridge, substantial classic-to-transformer progression, decision tables, three worked labs, and explained mastery answers. However, the rapid move from preprocessing to TF-IDF, Word2Vec, t-SNE, sentiment, NER, and transformers leaves key assumptions underexplained; phrases such as “Famous word analogy: king - man + woman ≈ queen” present a memorable result without discussing bias or failure conditions. The labs are solution-heavy and do not define expected metrics or business acceptance criteria.

**Gap task stubs:**
- [ ] [P0][A:Concept] Before “Bag of Words and TF-IDF,” derive TF, IDF, cosine similarity, sparsity, and out-of-vocabulary behavior with one tiny hand-calculated corpus; explain why each representation changes a business decision.
- [ ] [P1][A:Concept] Expand “Famous word analogy: king - man + woman ≈ queen” with embedding bias, corpus dependence, polysemy, and why vector analogies frequently fail.
- [ ] [P1][C:Lab] Rewrite “Email Spam Classifier” as a business assignment with asymmetric false-positive costs, a supplied train/test sample, explicit steps, and expected confusion-matrix/precision-recall output.
- [ ] [P1][I:Senior] Add production guidance for label drift, multilingual text, PII redaction, adversarial text, human review, and monitoring by language/customer segment.
- [ ] [P2][M:Coverage] Add coverage of tokenization and subwords (BPE/WordPiece), contextual embeddings, semantic search, and retrieval evaluation so the jump to transformers is grounded.
- [ ] [P2][O:Glossary] Add a glossary defining token, corpus, stopword, lemma, TF-IDF, embedding, NER, transformer, and cosine similarity.
- [ ] [P2][K:Xref] Add prerequisites and explicit cross-references to prior classification/evaluation lessons and forward references to Days 58 and 60C.
- [ ] [P2][N:Thread] Make one optional build-track dataset the default recurring thread through preprocessing, classification, monitoring, and evaluation.

---

## Day 50 — MLOps Fundamentals

**Path:** `content/lessons/Phase_05_Advanced_ML_Deep_Learning/Day_50_MLOps/README.md`

**Assessment:** This is one of the phase's strongest lessons: it connects experiment tracking, registry, API serving, drift, CI/CD, maturity levels, and retraining decisions, and its opening—“ML that works in a notebook isn't ML that works in production”—creates clear framing. Still, it treats production as a collection of tools more than an end-to-end operating model, and completed Docker/API/dashboard code substitutes for lab specifications and observable expected results.

**Gap task stubs:**
- [ ] [P0][A:Concept] Add an end-to-end lifecycle diagram defining reproducibility, lineage, feature skew, concept drift, data drift, registry stages, rollback, and champion/challenger models before introducing MLflow code.
- [ ] [P1][B:CodeCtx] Add what/why preambles before the registry, FastAPI, drift-monitor, and GitHub Actions blocks; explain what artifact each creates and how learners verify it.
- [ ] [P1][C:Lab] Turn “Dockerize ML API” into a scenario with supplied files, SLOs, steps, expected health/prediction responses, image-size target, and rollback test.
- [ ] [P1][I:Senior] Extend “When to Retrain Models” with delayed labels, shadow/canary deployment, approval gates, incident response, audit logs, security, and model/data ownership.
- [ ] [P1][M:Coverage] Add feature stores, orchestration, model cards, data contracts, online/offline skew, observability, and cost governance.
- [ ] [P2][F:Tables] Expand “Cloud Platform Comparison” with lock-in, compliance, team maturity, workload pattern, cost, and when not to adopt a managed platform.
- [ ] [P2][O:Glossary] Add a glossary for artifact, lineage, registry, drift, SLO, CI/CD, canary, shadow, and rollback.
- [ ] [P2][N:Thread] Require learners to deploy and monitor the model produced by the previous/recurring project rather than generating another isolated sample.

---

## Day 51 — Regularized Models

**Path:** `content/lessons/Phase_05_Advanced_ML_Deep_Learning/Day_51_Regularized_Models/README.md`

**Assessment:** The lesson clearly contrasts Ridge, Lasso, and ElasticNet, repeatedly emphasizes scaling, and provides strong mastery explanations. The bridge quote—“I'll punish you for using too many features or making coefficients too large”—is approachable, but the mathematical meaning of the penalty, alpha, and coefficient paths is not built slowly enough for a never-coded learner, and several defaults are demonstrated rather than justified.

**Gap task stubs:**
- [ ] [P0][A:Concept] Derive the ordinary loss plus L1/L2 penalty on a two-feature example; define alpha/lambda, coefficient shrinkage, bias-variance trade-off, and why L1 can create exact zeros.
- [ ] [P1][A:Concept] Explain why correlated predictors make Lasso unstable and why “L1 + L2” is not by itself enough guidance for selecting `l1_ratio`.
- [ ] [P1][C:Lab] Add goal, business scenario, sample-data description, learner steps, and expected coefficient/test-score table to all three exercises instead of only supplying complete code.
- [ ] [P1][I:Senior] Correct/qualify the production claim “Prefer Ridge/ElasticNet over pure Lasso ... They use all features”; discuss missing-feature handling, stability tests, calibration, and interpretability governance.
- [ ] [P2][M:Coverage] Add regularized logistic regression, group lasso, early stopping, Bayesian priors as regularization, and regularization for neural networks beyond a brief dropout snippet.
- [ ] [P2][F:Tables] Extend “Regularization Comparison” with correlated-feature behavior, interpretability, sample-size regime, classification applicability, and selection diagnostics.
- [ ] [P2][O:Glossary] Add a glossary for norm, penalty, shrinkage, sparsity, alpha, coefficient path, multicollinearity, and generalization.
- [ ] [P2][K:Xref] Add prerequisites linking linear regression, scaling, cross-validation, and forward references to Days 53 and 54.

---

## Day 52 — Ensemble Methods

**Path:** `content/lessons/Phase_05_Advanced_ML_Deep_Learning/Day_52_Ensemble_Methods/README.md`

**Assessment:** The “wisdom of the crowd” framing works well, and the lesson covers bagging, random forests, boosting, XGBoost, LightGBM, and stacking with unusually practical production notes. Yet boosting is introduced as “Sequential Learning” without sufficiently explaining residuals/gradients, while numbers such as “50 trees,” “<10ms,” and “Low correlation (0.3-0.7) = good diversity” appear as general rules without context or evidence.

**Gap task stubs:**
- [ ] [P0][A:Concept] Add a small hand-worked example showing bootstrap sampling, out-of-bag observations, variance reduction, and how boosting fits successive residuals/gradients.
- [ ] [P1][A:Concept] Justify or qualify “Low correlation (0.3-0.7) = good diversity,” “Start with 100 trees,” and the `<10ms` threshold; show how dataset/hardware/SLO changes the choice.
- [ ] [P1][C:Lab] Give each exercise a business scenario, fixed dataset split, target metric/cost, expected comparison table, and interpretation questions rather than only completed benchmark code.
- [ ] [P1][I:Senior] Add probability calibration, class imbalance, monotonic constraints, leakage-safe stacking/out-of-fold predictions, explainability, and model-update strategy.
- [ ] [P2][M:Coverage] Add AdaBoost, histogram boosting, out-of-bag evaluation, blending versus stacking, and uncertainty estimation with ensembles.
- [ ] [P2][F:Tables] Expand “Bagging vs Boosting” into a decision matrix including noise/outliers, imbalance, latency, memory, tuning budget, and interpretability.
- [ ] [P2][O:Glossary] Add a glossary for bootstrap, weak learner, residual, gradient boosting, out-of-bag, meta-model, and calibration.
- [ ] [P2][N:Thread] Apply all candidate ensembles to the recurring project and require a documented accuracy/latency/cost deployment recommendation.

---

## Day 53 — Model Tuning & Feature Selection

**Path:** `content/lessons/Phase_05_Advanced_ML_Deep_Learning/Day_53_Model_Tuning_and_Feature_Selection/README.md`

**Assessment:** This lesson does a good job warning about leakage and optimistic bias, including the blunt example “Select features on full dataset ... Problem: Feature selection ‘saw’ test labels.” Its breadth is again a liability: Bayesian optimization, univariate tests, RFE, model importance, permutation importance, nested CV, and TPOT are presented quickly, and “Bayesian Optimization: The Smart Way” overstates a context-dependent choice.

**Gap task stubs:**
- [ ] [P0][A:Concept] Explain hyperparameter search as an optimization problem; define search space, objective, budget, surrogate model, acquisition function, and nested CV with a small visual example.
- [ ] [P1][A:Concept] Replace “Bayesian Optimization: The Smart Way” with a conditional decision framework and justify `n_iter=50`, fold counts, search ranges, scoring metric, and random seeds.
- [ ] [P1][C:Lab] Add expected outputs and acceptance criteria to each exercise, including a leakage-safe pipeline, search-budget log, and final untouched-test result.
- [ ] [P1][I:Senior] Add multi-objective tuning for accuracy/latency/fairness/cost, reproducibility, parallel search, early pruning, and experiment-tracker integration.
- [ ] [P2][M:Coverage] Add successive halving/Hyperband, Optuna pruning, stability selection, SHAP caveats, feature-store constraints, and time/group-aware CV.
- [ ] [P2][F:Tables] Expand “Hyperparameter Tuning Comparison” with search-budget scale, conditional spaces, parallelism, reproducibility, and failure modes.
- [ ] [P2][O:Glossary] Add a glossary for hyperparameter, surrogate, acquisition function, RFE, permutation importance, leakage, and nested CV.
- [ ] [P2][K:Xref] Add prerequisites and cross-references to evaluation, regularization, ensembles, MLOps experiment tracking, and time-series CV.

---

## Day 54 — Probabilistic Modeling

**Path:** `content/lessons/Phase_05_Advanced_ML_Deep_Learning/Day_54_Probabilistic_Modeling/README.md`

**Assessment:** The lesson's “Not just predictions, but confidence in predictions” framing is strong, and it offers broad exposure to Bayes, distributions, Bayesian regression, uncertainty, MCMC, and probabilistic programming. For beginners, however, notation and library code arrive faster than intuition: priors, likelihood, posterior, credible intervals, sampling diagnostics, and calibration need a layered worked example before sophisticated tooling.

**Gap task stubs:**
- [ ] [P0][A:Concept] Build Bayes' rule from a frequency-table business example before formulas/code; explicitly distinguish probability, likelihood, prior, posterior, evidence, and conditional probability.
- [ ] [P0][A:Concept] Explain MCMC intuition and diagnostics (chains, burn-in/warmup, convergence, R-hat, effective sample size, divergences) before any sampler output is treated as trustworthy.
- [ ] [P1][C:Lab] Add decision-focused lab briefs with sample data, explicit priors, expected posterior plots/intervals, and a required business action under uncertainty.
- [ ] [P1][I:Senior] Add prior predictive checks, posterior predictive checks, sensitivity analysis, calibration, model misspecification, and communicating uncertainty to executives.
- [ ] [P2][M:Coverage] Add hierarchical models, conjugate priors, causal-versus-predictive distinction, Bayesian A/B testing pitfalls, and decision theory/expected utility.
- [ ] [P2][F:Tables] Add a when-to-choose guide comparing frequentist intervals, Bayesian inference, bootstrap uncertainty, and probabilistic programming by cost and assumptions.
- [ ] [P2][O:Glossary] Add a notation-aware glossary for prior, likelihood, posterior, credible interval, MCMC, trace, convergence, and calibration.
- [ ] [P2][N:Thread] Use the recurring project's uncertain business decision to connect posterior estimates to an explicit approve/defer/reject recommendation.

---

## Day 55 — Advanced Unsupervised Learning

**Path:** `content/lessons/Phase_05_Advanced_ML_Deep_Learning/Day_55_Advanced_Unsupervised_Learning/README.md`

**Assessment:** The lesson provides extensive examples across clustering and dimensionality reduction and includes senior-level interpretation. But unsupervised learning is especially vulnerable to attractive, unjustified pictures: methods and metrics can imply structure where none exists, and the lesson needs stronger warnings that a visually clean t-SNE or a high internal clustering score does not establish a useful business segment.

**Gap task stubs:**
- [ ] [P0][A:Concept] Add a foundational explanation of distance, scaling, density, manifold assumptions, and why “ground truth” is usually absent in unsupervised learning.
- [ ] [P1][A:Concept] Explain t-SNE/UMAP stochasticity and explicitly warn that cluster size, spacing, and global distance in a 2D plot may be misleading.
- [ ] [P1][C:Lab] Require each lab to state a stakeholder decision, sample schema, validation plan, expected output, and interpretation—not merely produce clusters/plots.
- [ ] [P1][I:Senior] Add cluster stability, drift, segment actionability, human validation, outlier review, privacy, and reproducible embedding/seed practices.
- [ ] [P2][M:Coverage] Add Gaussian mixtures/soft clustering, spectral clustering, HDBSCAN, anomaly detection, self-supervised representation learning, and mixed-type distances.
- [ ] [P2][F:Tables] Expand algorithm comparisons with cluster-shape assumption, noise handling, scale, parameter sensitivity, predict-new-point support, and decision guidance.
- [ ] [P2][O:Glossary] Add a glossary for centroid, density, manifold, silhouette, linkage, core point, embedding, and anomaly.
- [ ] [P2][K:Xref] Add prerequisites and links to scaling, PCA, customer segmentation, model monitoring, and graph community detection.

---

## Day 56 — Time Series & Forecasting

**Path:** `content/lessons/Phase_05_Advanced_ML_Deep_Learning/Day_56_Time_Series_and_Forecasting/README.md`

**Assessment:** This is a broad and business-relevant forecasting survey with classical and learned approaches, evaluation, and production discussion. The central conceptual risk is insufficient emphasis on temporal leakage and forecast design before model code: learners need to define horizon, frequency, cutoff, available-at-prediction-time features, and business loss before selecting ARIMA/Prophet/LSTM.

**Gap task stubs:**
- [ ] [P0][A:Concept] Add a forecast-design worksheet defining grain, horizon, cadence, cutoff, latency, known-future covariates, leakage, and the business cost of error before modeling.
- [ ] [P1][A:Concept] Derive stationarity, differencing, autocorrelation, seasonality, and AR/MA intuition with one small series; justify order/window/seasonal-period choices.
- [ ] [P1][C:Lab] Add rolling-origin evaluation, a naive baseline, supplied time-indexed sample data, expected metric table/plot, and a business acceptance threshold to each lab.
- [ ] [P1][I:Senior] Add intermittent demand, cold starts, hierarchy reconciliation, holidays/promotions, late-arriving data, backfill, drift, and prediction-interval monitoring.
- [ ] [P2][M:Coverage] Add exponential smoothing/ETS, state-space models, probabilistic forecasts, quantile loss, hierarchical forecasting, and modern global forecasting models.
- [ ] [P2][F:Tables] Expand model-selection guidance by history length, number of series, exogenous variables, interpretability, compute budget, and retraining cadence.
- [ ] [P2][O:Glossary] Add a glossary for horizon, lag, stationarity, differencing, autocorrelation, exogenous variable, backtest, and prediction interval.
- [ ] [P2][N:Thread] Tie forecasts to inventory/staffing/revenue decisions in the recurring project and require a cost-based recommendation, not only lowest RMSE.

---

## Day 57 — Recommender Systems

**Path:** `content/lessons/Phase_05_Advanced_ML_Deep_Learning/Day_57_Recommender_Systems/README.md`

**Assessment:** The lesson is impressively comprehensive and connects collaborative filtering, matrix factorization, content, hybrid systems, metrics, and production concerns. Still, ranking objectives and marketplace consequences need more conceptual weight: recommendation quality is not simply rating prediction, and offline improvements may harm novelty, fairness, seller exposure, long-term retention, or business value.

**Gap task stubs:**
- [ ] [P0][A:Concept] Clearly distinguish explicit versus implicit feedback, rating prediction versus ranking, candidate generation versus reranking, and negative sampling before implementation.
- [ ] [P1][A:Concept] Derive matrix factorization and latent factors with a tiny user-item matrix; explain regularization, rank size, and what missing entries mean.
- [ ] [P1][C:Lab] Add realistic train/test-by-time splits, cold-start users/items, expected Recall@K/NDCG output, and a business KPI/guardrail to each exercise.
- [ ] [P1][I:Senior] Add feedback loops, exploration/exploitation, popularity bias, filter bubbles, fairness/exposure, abuse, privacy, and online A/B testing.
- [ ] [P2][M:Coverage] Add two-tower retrieval, learning-to-rank, contextual bandits, session-based/sequential recommendation, approximate nearest neighbors, and causal evaluation.
- [ ] [P2][F:Tables] Expand method comparisons by catalog size, interaction density, cold-start severity, latency, retraining frequency, and explainability.
- [ ] [P2][O:Glossary] Add a glossary for implicit feedback, latent factor, candidate generation, reranking, Recall@K, NDCG, cold start, and negative sampling.
- [ ] [P2][N:Thread] Carry the recurring customer/product dataset through offline ranking, deployment design, and an experiment proposal with guardrail metrics.

---

## Day 58 — Transformers & Attention

**Path:** `content/lessons/Phase_05_Advanced_ML_Deep_Learning/Day_58_Transformers_and_Attention/README.md`

**Assessment:** The lesson is ambitious, with attention intuition, implementation, transformer components, use cases, mastery answers, and production detail. It nevertheless risks name-dropping the architecture: query/key/value, scaling, masks, heads, positional encoding, residuals, and normalization require a slow shape-traced example; otherwise learners can run code without understanding why attention works or fails.

**Gap task stubs:**
- [ ] [P0][A:Concept] Add one complete, hand-calculated attention example tracing token embeddings through Q/K/V matrices, dot products, scaling, mask, softmax, weighted values, and tensor shapes.
- [ ] [P0][A:Concept] Explain and justify the `sqrt(d_k)` scaling, number of heads, embedding dimension, context length, and masking rather than presenting them as architecture defaults.
- [ ] [P1][C:Lab] Rewrite labs with a concrete business task, fixed sample input, steps, expected attention/model output, baseline, and interpretation criteria.
- [ ] [P1][I:Senior] Add inference economics, KV cache, batching, quantization, prompt injection/data leakage risk, evaluation, hallucination, and model/provider selection.
- [ ] [P2][M:Coverage] Add encoder-only versus decoder-only versus encoder-decoder architectures, pretraining objectives, RoPE/relative positions, efficient attention, and mixture-of-experts.
- [ ] [P2][F:Tables] Add a decision table for using a transformer versus classic NLP/RNN/CNN/API model based on data, latency, privacy, cost, and accuracy.
- [ ] [P2][O:Glossary] Add a shape-aware glossary for attention, query, key, value, head, mask, residual, layer normalization, token, and context window.
- [ ] [P2][K:Xref] Add prerequisites linking linear algebra, embeddings/NLP, neural networks, and forward links to Days 60B and 60C.

---

## Day 59 — Generative Models

**Path:** `content/lessons/Phase_05_Advanced_ML_Deep_Learning/Day_59_Generative_Models/README.md`

**Assessment:** The lesson offers extensive VAE/GAN/diffusion coverage, mastery explanations, and deployment optimization advice. However, the volume of architecture and code obscures the core probability story; concepts such as latent space, KL divergence, ELBO, adversarial equilibrium, mode collapse, and diffusion objectives need deeper grounding before learners can responsibly interpret generated outputs.

**Gap task stubs:**
- [ ] [P0][A:Concept] Build a layered derivation of latent variables, reconstruction loss, KL divergence, and ELBO before VAE code; explain what each term optimizes and the trade-off it creates.
- [ ] [P0][A:Concept] Explain GAN minimax training and diffusion forward/reverse processes with small diagrams and failure cases before implementation.
- [ ] [P1][C:Lab] Add scenario, dataset, deliverable, expected sample/metric output, compute budget, and quality/safety review rubric to each exercise.
- [ ] [P1][I:Senior] Add memorization/privacy tests, copyright/provenance, harmful-content controls, red teaming, human evaluation, model cards, and deployment governance.
- [ ] [P2][M:Coverage] Add conditional VAEs, normalizing flows, autoregressive generation, classifier-free guidance, latent diffusion, evaluation metrics and their limitations.
- [ ] [P2][F:Tables] Expand VAE/GAN/diffusion comparisons with training stability, inference speed, controllability, data needs, evaluation, and business use cases.
- [ ] [P2][O:Glossary] Add a glossary for latent space, posterior, reconstruction, KL divergence, ELBO, discriminator, mode collapse, denoising, and guidance.
- [ ] [P2][N:Thread] Require a recurring-project generative use case with explicit value hypothesis, risk assessment, and build-versus-buy recommendation.

---

## Day 60 — Graph & Geometric Learning

**Path:** `content/lessons/Phase_05_Advanced_ML_Deep_Learning/Day_60_Graph_and_Geometric_Learning/README.md`

**Assessment:** This is a deep, practical survey with graph basics, Node2Vec, GCN/GAT, link and graph prediction, scalability, and detailed production mastery answers. Yet its hands-on labs are notably incomplete compared with the surrounding code: “Train GCN for link prediction / Recommend new friendships” and “Train graph classifier on toxicity dataset” are placeholders rather than executable, specified assignments, creating a major gap between demonstration and practice.

**Gap task stubs:**
- [ ] [P0][C:Lab] Replace placeholder lab lines such as “Train GCN for link prediction / Recommend new friendships” with runnable starter code, supplied data, steps, expected outputs, and evaluation criteria.
- [ ] [P0][A:Concept] Trace message passing on a tiny graph by hand, defining adjacency, degree normalization, neighborhood aggregation, node/edge/graph features, and tensor shapes.
- [ ] [P1][A:Concept] Explain negative sampling and leakage-safe edge splits for link prediction; distinguish transductive/inductive evaluation beyond definitions.
- [ ] [P1][I:Senior] Add graph freshness/versioning, dynamic graphs, fairness, adversarial edges, privacy, heterogeneous schemas, and monitoring for topology/embedding drift.
- [ ] [P2][M:Coverage] Add heterogeneous/relational GNNs, temporal GNNs, graph transformers, knowledge-graph embeddings, explainability, and positional/structural encodings.
- [ ] [P2][F:Tables] Expand “GNN Architectures Comparison” with task type, inductive ability, edge features, heterogeneity, scale, sampling needs, and serving constraints.
- [ ] [P2][O:Glossary] Add a glossary for node, edge, adjacency, message passing, homophily, transductive, inductive, over-smoothing, and negative sampling.
- [ ] [P2][J:Summary] Add an explicit “Tomorrow”/phase-transition preview; the current summary ends the core sequence without directing learners to Days 60B/60C or the next phase.

---

## Day 60B — LLM Fine-Tuning & PEFT

**Path:** `content/lessons/Phase_05_Advanced_ML_Deep_Learning/Day_60B_LLM_Fine_Tuning_and_PEFT/README.md`

**Assessment:** The memory-budget framing is excellent, and the short lesson gives a useful conceptual distinction between fine-tuning, LoRA, QLoRA, prompting, and RAG. It explicitly says, “This lesson is a conceptual bridge” and labels its main PEFT example “Pseudocode,” so it does not meet the phase standard for hands-on learning, production insight, or layered mastery on its own.

**Gap task stubs:**
- [ ] [P0][C:Lab] Add a CPU/small-GPU runnable mini-lab with a tiny model/dataset, goal, scenario, sample records, steps, expected trainable-parameter output, evaluation result, and saved adapter artifact.
- [ ] [P0][A:Concept] Explain low-rank decomposition, rank, alpha, target modules, quantization, adapters, gradient accumulation, and memory accounting before the conceptual LoRA code.
- [ ] [P1][B:CodeCtx] Replace “Pseudocode — actual runnable version in Phase 10 Day 113” as the sole implementation with a verified minimal example and a what/why/verify preamble.
- [ ] [P1][I:Senior] Add dataset curation, chat templates, catastrophic forgetting, evaluation, safety regression, licensing, adapter versioning/merging, serving, and rollback.
- [ ] [P1][M:Coverage] Add supervised fine-tuning versus continued pretraining, prompt tuning/prefix tuning, DPO/preference optimization, multi-adapter serving, and PEFT method selection.
- [ ] [P1][G:Mastery] Expand the brief mastery check into scenario-based questions with worked answers requiring memory estimates and fine-tune-versus-RAG decisions.
- [ ] [P2][O:Glossary] Add a glossary for PEFT, LoRA, rank, alpha, adapter, quantization, QLoRA, target module, and catastrophic forgetting.
- [ ] [P2][N:Thread] Apply PEFT to a recurring business-domain artifact and require a baseline comparison plus deployment recommendation.

---

## Day 60C — RAG & Vector Databases

**Path:** `content/lessons/Phase_05_Advanced_ML_Deep_Learning/Day_60C_RAG_and_Vector_Databases/README.md`

**Assessment:** The lesson gives a clear five-step architecture, useful retrieval-strategy comparison, enterprise framing, and a strong RAG-versus-fine-tuning decision table. But it explicitly defers implementation—“Full hands-on RAG pipeline implementation is in Phase 10”—and uses conceptual pseudocode, leaving learners unable to measure whether retrieval or answer quality actually works.

**Gap task stubs:**
- [ ] [P0][C:Lab] Add a runnable local RAG lab using supplied documents and a local vector store, with steps, expected retrieved chunks/citations, answer-quality rubric, and failure-analysis tasks.
- [ ] [P0][A:Concept] Explain embedding models, vector dimensions, similarity metrics, chunk overlap, top-k, approximate nearest-neighbor indexing, recall/precision, and reranking with justified defaults.
- [ ] [P1][B:CodeCtx] Replace “Pseudocode — full runnable version in Phase 10 Day 112” as the only pipeline with a minimal verified implementation and preambles explaining each artifact and check.
- [ ] [P1][I:Senior] Add prompt injection, poisoned documents, ACL-aware retrieval, tenant isolation, PII, freshness/deletion, citation verification, observability, latency, and cost.
- [ ] [P1][M:Coverage] Add query rewriting, metadata filters, parent-child/multi-vector retrieval, contextual compression, GraphRAG, multimodal RAG, and evaluation frameworks.
- [ ] [P1][G:Mastery] Expand mastery into worked diagnosis scenarios separating retrieval failure, context failure, and generation failure.
- [ ] [P2][O:Glossary] Add a glossary for embedding, vector database, chunk, ANN, dense/sparse/hybrid retrieval, reranker, grounding, and hallucination.
- [ ] [P2][J:Summary] Add a proper ✅ summary and next-phase preview; “Next Steps” mainly redirects to Phase 10 and does not close Phase 05 learning.
