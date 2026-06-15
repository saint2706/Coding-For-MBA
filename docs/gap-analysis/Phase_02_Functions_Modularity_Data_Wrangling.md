# Gap Analysis — Phase 02: Functions, Modularity & Data Wrangling

> Audited against the Phase 1 Quality Bar. See [GAP_ANALYSIS.md](../../GAP_ANALYSIS.md) for the full rubric, gap taxonomy, and severity legend.

## Phase summary

Phase 02 covers critical ground in intermediate Python, standard libraries, and data wrangling with Pandas. However, compared to the Phase 1 gold standard, this phase suffers from systemic structural gaps. The curriculum heavily leans into technical execution but frequently omits the necessary business framing, glossaries, and structured problem statements required for an MBA audience.

**Recurring gaps in this phase:**

- **[E:Framing]:** Missing "Never-Coded" plain-language analogies at the start of most lessons.
- **[C:Lab]:** Hands-on Labs are almost universally just bare code blocks without business scenarios, numbered steps, or expected outputs.
- **[O:Glossary]:** Complete absence of glossaries across all lessons.
- **[L:Quiz]:** Days 17-20 are entirely missing their `quiz.json` files and explanations.
- **[A:Concept]:** Critical definitions (e.g., "vectorization", "idempotent") and business justifications for magic numbers (e.g., 5% null thresholds) are missing in key data lessons.

**Lessons audited:** 15

---

## Day 13 — Higher Order Functions

**Path:** `content/lessons/Phase_02_Functions_Modularity_Data_Wrangling/Day_13_Higher_Order_Functions/README.md`

**Assessment:** The lesson has a strong "Never-Coded" bridge comparing functions to delegating tasks as a manager. However, the Lab section presents bare code without clear business scenarios or numbered steps. The lesson is also missing a glossary.

**Gap task stubs:**

- [ ] [P1][C:Lab] Add explicit problem statements, business scenarios, and expected output text to Exercises 1-3. Currently it says "Exercise 1: Data Transformation Pipeline" followed immediately by a code block.
- [ ] [P2][O:Glossary] Add a Glossary section defining terms like "First-Class Objects", "Lambda", "Closure", and "Lazy Evaluation".
- [ ] [P2][M:Coverage] Add coverage of `itertools` module functions like `groupby` and `chain` as they complement higher order functions well.

---

## Day 14 — Modules

**Path:** `content/lessons/Phase_02_Functions_Modularity_Data_Wrangling/Day_14_Modules/README.md`

**Assessment:** The technical explanation of imports, `__name__`, and packages is good, and it includes a comparison of Standard Library modules. However, the "Never-Coded" bridge is generic/missing, and the Lab exercises are just code dumps.

**Gap task stubs:**

- [ ] [P1][E:Framing] Add a "Never-Coded" plain-language analogy before the technical deep dive (e.g., comparing modules to departments in a company).
- [ ] [P1][C:Lab] Add problem statements, goals, and expected outputs to Exercises 1-3. Currently "Exercise 1: Create a Finance Module" is just a code block.
- [ ] [P2][O:Glossary] Add a Glossary section defining "Module", "Package", "Standard Library", and "Circular Import".
- [ ] [P2][M:Coverage] Add coverage of Python's `sys.path` modification for advanced import scenarios or `importlib`.

---

## Day 15 — Exception Handling

**Path:** `content/lessons/Phase_02_Functions_Modularity_Data_Wrangling/Day_15_Exception_Handling/README.md`

**Assessment:** The lesson explains exceptions and `try-except-finally` blocks well, including custom exceptions. However, the initial framing lacks a strong analogy, and the labs are missing explicit instructions and scenarios.

**Gap task stubs:**

- [ ] [P1][E:Framing] Add a "Never-Coded" bridge at the top, perhaps comparing exception handling to a business continuity plan or a customer service escalation path.
- [ ] [P1][C:Lab] Add written problem statements, business scenarios, and expected output for Exercises 1-3. Currently "Exercise 1: Safe Input Handler" jumps straight into code.
- [ ] [P2][O:Glossary] Add a Glossary section defining "Exception", "Traceback", "Try/Except", and "Context Manager".
- [ ] [P2][M:Coverage] Add coverage of custom exception hierarchies and when to use them versus standard exceptions.

---

## Day 16 — File Handling

**Path:** `content/lessons/Phase_02_Functions_Modularity_Data_Wrangling/Day_16_File_Handling/README.md`

**Assessment:** The lesson covers basic file operations, CSV, JSON, and `pathlib` nicely, with good senior insights on large file processing. As with the previous lessons, the lab exercises are missing explicit scenarios, and the introductory analogy could be stronger.

**Gap task stubs:**

- [ ] [P1][E:Framing] Add a "Never-Coded" bridge comparing file handling to reading and writing physical ledgers or reports in a filing cabinet.
- [ ] [P1][C:Lab] Add problem statements, scenarios, and expected outputs to Exercises 1-3. "Exercise 1: Log File Analyzer" starts with bare code.
- [ ] [P2][O:Glossary] Add a Glossary section defining "File Handle", "Mode (r/w/a)", "Context Manager", and "Pathlib".
- [ ] [P2][M:Coverage] Add coverage of reading/writing Parquet files or compressed files (e.g., gzip) since it's a data wrangling phase.

---

## Day 17 — Regular Expressions

**Path:** `content/lessons/Phase_02_Functions_Modularity_Data_Wrangling/Day_17_Regular_Expressions/README.md`

**Assessment:** The lesson explains regex syntax well and demonstrates capturing groups, substitutions, and lookaheads. However, regex is notoriously cryptic, and the lesson lacks a "Never-Coded" plain-language analogy to ease learners in. The Lab exercises (e.g., `"Exercise 1: Data Extractor"`) also drop straight into code without problem statements. There is no `quiz.json` file.

**Gap task stubs:**

- [ ] [P0][L:Quiz] Create a `quiz.json` with at least 5 questions and detailed explanations.
- [ ] [P1][E:Framing] Add a "Never-Coded" bridge comparing regex to a super-powered "Find and Replace" or a highly specific search warrant.
- [ ] [P1][C:Lab] Add explicit problem statements, scenarios, and expected outputs to Exercises 1-3. Currently, "Exercise 1: Data Extractor" is just code.
- [ ] [P2][O:Glossary] Add a Glossary defining "Quantifier", "Character Class", "Capturing Group", "Greedy vs Non-Greedy", and "Lookahead".

---

## Day 18 — Classes and Objects

**Path:** `content/lessons/Phase_02_Functions_Modularity_Data_Wrangling/Day_18_Classes_and_Objects/README.md`

**Assessment:** The lesson explains classes, objects, and properties effectively, but lacks the "Never-Coded" plain-language analogy at the start to frame why object-oriented programming is useful. It provides no glossary of OOP terms. The lab exercises ("Bank Account System", "Product Inventory") lack explicit problem statements and scenarios. There is no `quiz.json` file in the directory.

**Gap task stubs:**

- [ ] [P0][L:Quiz] Create a `quiz.json` with at least 5 questions and detailed explanations.
- [ ] [P1][E:Framing] Add a "Never-Coded" bridge comparing classes to blueprints and objects to houses, or cookie-cutters to cookies.
- [ ] [P1][C:Lab] Add explicit problem statements, business scenarios, and expected outputs to Exercises 1-3. Currently, "Exercise 1: Bank Account System" starts directly with code.
- [ ] [P2][O:Glossary] Add a Glossary defining "Class", "Object", "Instance", "Method", and "Inheritance".

---

## Day 19 — Python Date Time

**Path:** `content/lessons/Phase_02_Functions_Modularity_Data_Wrangling/Day_19_Python_Date_Time/README.md`

**Assessment:** The technical explanation of datetime, timedelta, and ISO formatting is solid. However, timezones and dates often trip up beginners, and the lesson lacks a framing analogy and a glossary to help anchor these concepts. The labs ("Report Scheduler", "Age Calculator") are missing written scenarios and numbered steps. There is no `quiz.json` file.

**Gap task stubs:**

- [ ] [P0][L:Quiz] Create a `quiz.json` with at least 5 questions and detailed explanations.
- [ ] [P1][E:Framing] Add a "Never-Coded" bridge comparing datetimes to coordinating global meetings and the importance of standardizing on UTC.
- [ ] [P1][C:Lab] Add explicit problem statements, scenarios, and expected outputs to Exercises 1-3. "Exercise 1: Report Scheduler" drops straight into code.
- [ ] [P2][O:Glossary] Add a Glossary defining "Epoch", "Timezone Offset", "Naive vs Aware Datetime", and "Strftime/Strptime".

---

## Day 20 — Python Package Manager

**Path:** `content/lessons/Phase_02_Functions_Modularity_Data_Wrangling/Day_20_Python_Package_Manager/README.md`

**Assessment:** The lesson has a good "Never-Coded" bridge comparing building tools to installing them. However, it completely lacks a glossary for package management terms. The Lab exercises jump into bash commands without clear problem statements or expected outputs. There is no `quiz.json` file.

**Gap task stubs:**

- [ ] [P0][L:Quiz] Create a `quiz.json` with at least 5 questions and detailed explanations.
- [ ] [P1][C:Lab] Add explicit problem statements, business scenarios, and expected outputs to Exercises 1-3. "Exercise 1: Project Setup" just lists bash commands.
- [ ] [P2][O:Glossary] Add a Glossary defining "Package Manager", "Dependency", "Requirements File", "PyPI", and "Semantic Versioning".

---

## Day 21 — Virtual Environments

**Path:** `content/lessons/Phase_02_Functions_Modularity_Data_Wrangling/Day_21_Virtual_Environments/README.md`

**Assessment:** The lesson explains virtual environments, but the lab exercises (e.g. `"### Exercise 1: Environment Setup"`) lack explicit goals and scenarios. It is also missing a glossary.

**Gap task stubs:**

- [ ] [P1][C:Lab] Add explicit problem statements, scenarios, and expected outputs to the Lab exercises.
- [ ] [P2][O:Glossary] Add a Glossary defining "Virtual Environment", "Isolation", "Dependency Conflict", and "Activation".
- [ ] [P2][M:Coverage] Add coverage of alternative environment managers like `conda` or `poetry` briefly, to provide a broader ecosystem view.

---

## Day 22 — NumPy

**Path:** `content/lessons/Phase_02_Functions_Modularity_Data_Wrangling/Day_22_NumPy/README.md`

**Assessment:** The lesson covers NumPy basics but critically misses the mark on key concepts. It states broadcasting rules but provides no intuition for *why* they work, and it entirely fails to define "vectorization"—a core reason for using NumPy. The labs are also bare code, and there is no glossary.

**Gap task stubs:**

- [ ] [P0][A:Concept] Define "vectorization" explicitly before introducing array operations. Explain why it is faster than Python loops.
- [ ] [P0][A:Concept] Add intuition for broadcasting rules. Explain *how* NumPy stretches arrays to match shapes conceptually, not just mathematically.
- [ ] [P1][C:Lab] Add explicit problem statements, scenarios, and expected outputs to the Lab exercises.
- [ ] [P2][O:Glossary] Add a Glossary defining "Vectorization", "Broadcasting", "Ndarray", "Axis", and "Shape".
- [ ] [P2][M:Coverage] Add coverage of boolean indexing/masking which is essential for data wrangling.

---

## Day 23 — Pandas

**Path:** `content/lessons/Phase_02_Functions_Modularity_Data_Wrangling/Day_23_Pandas/README.md`

**Assessment:** The Pandas introduction is missing its "Never-Coded" bridge. The labs drop straight into code blocks without business scenarios or structured steps. The glossary is also missing.

**Gap task stubs:**

- [ ] [P1][E:Framing] Add a "Never-Coded" bridge comparing a Pandas DataFrame to an Excel spreadsheet or a SQL table.
- [ ] [P1][C:Lab] Add explicit problem statements, business scenarios, and expected outputs to the Lab exercises.
- [ ] [P2][O:Glossary] Add a Glossary defining "DataFrame", "Series", "Index", "Loc/Iloc", and "Aggregation".
- [ ] [P2][M:Coverage] Add coverage of dealing with missing data (`fillna`, `dropna`) at a basic level before the advanced Pandas lesson.

---

## Day 24 — Pandas Advanced

**Path:** `content/lessons/Phase_02_Functions_Modularity_Data_Wrangling/Day_24_Pandas_Advanced/README.md`

**Assessment:** The lesson lacks a "Never-Coded" analogy entirely. It provides detailed benchmarking scripts for the lab, but it doesn't wrap them in explicit problem statements or business scenarios (it says "Goal: quantify performance decisions...", but lacks a numbered step-by-step structure for the learner before dropping code). It also misses the glossary and uses a non-standard format for the Mastery Check ("Q1: GroupBy with multiple aggregations..." without clickable explanations).

**Gap task stubs:**

- [ ] [P1][E:Framing] Add a "Never-Coded" bridge before the technical deep dive, perhaps comparing advanced Pandas operations (groupby, merge) to organizing a company by departments or joining disparate ledgers.
- [ ] [P1][C:Lab] Add explicit problem statements, business scenarios, and numbered expected outputs to the "Benchmark Lab" and "Chunked Processing vs Full-Load Validation" exercises.
- [ ] [P1][G:Mastery] Rewrite the Mastery Check to follow the standard format with clear questions and `<details>` blocks with explanations.
- [ ] [P2][O:Glossary] Add a Glossary defining "GroupBy", "Merge/Join", "Pivot Table", and "Resample".

---

## Day 24B — Exploratory Data Analysis

**Path:** `content/lessons/Phase_02_Functions_Modularity_Data_Wrangling/Day_24B_Exploratory_Data_Analysis/README.md`

**Assessment:** The lesson has a strong business-first EDA framework and an excellent "Never-Coded" bridge explaining what MBA teams actually ask. However, the Lab exercise lacks explicit sample data setup or expected outputs, and there is no glossary of terms for quick reference.

**Gap task stubs:**

- [ ] [P1][C:Lab] Add explicit sample data description and numbered expected outputs to the Lab exercise. Currently it lists instructions ("Frame three business-first EDA questions..."), but lacks a clear scaffolding block for the learner to compare against.
- [ ] [P2][O:Glossary] Add a Glossary defining "EDA", "Profiling", "Distribution", and "Correlation".

---

## Day 24C — Data Cleaning Playbook

**Path:** `content/lessons/Phase_02_Functions_Modularity_Data_Wrangling/Day_24C_Data_Cleaning_Playbook/README.md`

**Assessment:** The playbook is practical and provides excellent decision matrices. However, it uses arbitrary thresholds like "missingness < 5%" and "Email validity drops below threshold (e.g., < 98%)" without justifying *why* those numbers are chosen in a business context. The term "idempotent" is noted as a known issue (though it may be implicitly handled via "repeatable cleaning workflow"). The Lab section is very brief ("Your tasks" list) and lacks sample data/expected output scaffolding. There is no glossary.

**Gap task stubs:**

- [ ] [P0][A:Concept] Justify the arbitrary thresholds ("missingness < 5%" and "< 98%" validity). Add text explaining *how* a business decides these thresholds based on materiality rather than presenting them as absolute rules.
- [ ] [P0][A:Concept] Define "idempotent" explicitly within the "repeatable cleaning workflow" outcome, explaining that a script should yield the same result whether run once or 100 times.
- [ ] [P1][C:Lab] Expand the "Hands-on Lab" section to include an explicit business scenario, sample data description, and expected output block.
- [ ] [P2][O:Glossary] Add a Glossary defining "Imputation", "Coercion", "Assertion", "Entity Resolution", and "Idempotent".

---

## Day 24D — Phase2 Mini Capstone

**Path:** `content/lessons/Phase_02_Functions_Modularity_Data_Wrangling/Day_24D_Phase2_Mini_Capstone/README.md`

**Assessment:** The capstone provides excellent structure, track options, and an executive readout template. However, it relies heavily on instructions and lacks a true "Never-Coded" bridge to emotionally ground the business context for the learner before diving into the required deliverables. It also lacks a glossary summarizing the key terms learned in Phase 2.

**Gap task stubs:**

- [ ] [P1][E:Framing] Add a "Never-Coded" bridge before the Capstone Scenario to set the overarching business context (e.g., comparing building a pipeline to setting up a reliable manufacturing assembly line vs. hand-crafting items).
- [ ] [P2][O:Glossary] Add a Glossary summarizing the key terms from Phase 2 (Functions, Pandas, Cleaning) as a quick reference for the capstone.

---
