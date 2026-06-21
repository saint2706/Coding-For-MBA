---
day: 118
title: "Fine-Tuning LLMs — LoRA, QLoRA, Unsloth"
phase: 10
phaseTitle: "Generative AI & LLM Engineering"
slug: "fine-tuning-llms"
duration: 120
difficulty: "advanced"
tags:
  - fine-tuning
  - lora
  - qlora
  - unsloth
  - supervised-fine-tuning
  - instruction-tuning
concepts:
  - "supervised fine-tuning (SFT)"
  - "LoRA (Low-Rank Adaptation)"
  - "QLoRA (Quantized LoRA)"
  - "Unsloth (2x faster training)"
  - "instruction dataset format"
  - "RLHF overview"
prerequisites:
  - "Day 112: RAG Pipelines"
  - "Day 70: LLM Fine-Tuning & PEFT (Phase 6 — review)"
outcomes:
  - "Decide when fine-tuning is justified over RAG or prompt engineering"
  - "Prepare an instruction-tuning dataset in the correct format"
  - "Fine-tune a 7B model with QLoRA and push the adapter to HuggingFace Hub"
---

# 🎯 Day 113: Fine-Tuning LLMs — LoRA, QLoRA, Unsloth

> *"Prompt engineering is renting an apartment. Fine-tuning is buying it, renovating it, and making it exactly yours — but you only buy when renting stops working."*

---

## The "Never-Coded" Bridge

**Compare training a new hire vs coaching an existing expert.**

- **Prompt engineering**: You write *really good* instructions every time you ask them to do something. Works great for most tasks.
- **RAG**: You give them a library card. Before answering, they look things up. Great for fact-heavy tasks.
- **Fine-tuning**: You send them to a specialist bootcamp for your domain. They internalize your company's style, terminology, and workflow. After, they just *know* how your company operates.

Fine-tuning is for when: the task requires consistent style/format that prompting can't reliably produce, you need behavior not achievable through instruction alone, or you're running millions of queries and need a cheaper, faster model that performs like a large one.

**Fine-tuning teaches style and behavior. RAG teaches facts. Use both wisely.**

---

## The Technical Deep Dive

### 1. The Decision Tree: Fine-Tuning vs RAG vs Prompting

```python
def should_fine_tune(task: dict) -> str:
    """
    A practical decision framework before committing to fine-tuning.
    Fine-tuning is expensive and time-consuming — only if justified.
    """
    # First: have you tried these?
    checks = {
        "prompt_engineering_tried": task.get("prompt_engineering_tried", False),
        "few_shot_tried": task.get("few_shot_tried", False),
        "rag_tried": task.get("rag_considered", False),
    }

    if not all(checks.values()):
        return "STOP: Try prompt engineering and few-shot first. They're free."

    # Now evaluate if fine-tuning is justified
    reasons_to_fine_tune = [
        task.get("has_consistent_style_requirement"),    # e.g., always respond like a doctor
        task.get("prompting_fails_at_scale"),            # inconsistent outputs despite best prompts
        task.get("running_millions_of_queries"),         # cost optimization via smaller fine-tuned model
        task.get("domain_specific_vocabulary"),          # medical, legal, proprietary terminology
        task.get("format_must_be_exact"),                # structured output that JSON mode can't guarantee
    ]

    if sum(reasons_to_fine_tune) >= 2:
        return "PROCEED: Fine-tuning justified. Prepare dataset."
    else:
        return "RECONSIDER: Only 1 reason found. RAG may be sufficient."
```

### 2. Preparing an Instruction Dataset

```python
# Instruction tuning requires examples in a standardized format
# The most common: Alpaca / ShareGPT format

# ALPACA FORMAT (for simple instruction → response tasks)
alpaca_sample = {
    "instruction": "You are a financial analyst. Classify the following news headline as BULLISH, BEARISH, or NEUTRAL.",
    "input": "Federal Reserve signals two more rate hikes before year-end",  # The dynamic part
    "output": "BEARISH"
}

# SHAREGPT FORMAT (for multi-turn conversations)
sharegpt_sample = {
    "conversations": [
        {"from": "system", "value": "You are a clinical data assistant. Be concise and medically accurate."},
        {"from": "human", "value": "What is HbA1c and what does 7.2% mean?"},
        {"from": "gpt", "value": "HbA1c measures average blood glucose over 2-3 months. 7.2% indicates poorly controlled Type 2 diabetes (target: <7.0%). Recommend medication review."},
        {"from": "human", "value": "What are the risks if untreated?"},
        {"from": "gpt", "value": "Sustained HbA1c >7% increases risk of: nephropathy (kidney disease), retinopathy (vision loss), neuropathy (nerve damage), and cardiovascular disease. Immediate lifestyle + pharmacological intervention indicated."},
    ]
}

# Building a quality dataset
import json
from pathlib import Path

def validate_dataset(samples: list[dict], format: str = "alpaca") -> dict:
    """Validate instruction dataset quality."""
    issues = []
    for i, s in enumerate(samples):
        if format == "alpaca":
            if not s.get("instruction"):
                issues.append(f"Row {i}: missing 'instruction'")
            if not s.get("output"):
                issues.append(f"Row {i}: missing 'output'")
            if len(s.get("output", "")) < 5:
                issues.append(f"Row {i}: output too short ({s['output']!r})")
            if len(s.get("output", "")) > 2000:
                issues.append(f"Row {i}: output very long — may slow training")

    # Check for duplicates
    outputs = [s.get("output", "") for s in samples]
    dedup_ratio = len(set(outputs)) / len(outputs)
    if dedup_ratio < 0.8:
        issues.append(f"High duplication: only {dedup_ratio:.1%} unique outputs")

    return {
        "total": len(samples),
        "issues": issues,
        "dedup_ratio": dedup_ratio,
        "is_valid": len(issues) == 0
    }

# Minimum viable dataset sizes (rule of thumb)
DATASET_SIZE_GUIDE = {
    "style_transfer": "50–200 examples",
    "classification": "100–500 examples per class",
    "domain_adaptation": "1,000–10,000 examples",
    "complex_reasoning": "10,000+ examples",
    "general_chat_fine_tune": "50,000+ examples (like ShareGPT)",
}
```

### 3. The PEFT Workflow, Conceptually

Before running any Unsloth code, understand what PEFT (Parameter-Efficient Fine-Tuning) is actually doing, because the code below is just an implementation of this idea.

**The problem PEFT solves.** A 7B-parameter model has 7 billion individual numbers. "Full fine-tuning" means recomputing gradients for and updating all 7 billion of them — which requires storing the weights, the gradients, AND the optimizer state (Adam keeps two extra numbers per weight) simultaneously in GPU memory. That's roughly 4x the model size in VRAM just for training math, before you even load any data — well over 100GB for a 7B model. Most people don't have that hardware.

**The PEFT insight: you don't need to change all the weights.** Adapting a model to a new task turns out to require only a small, low-rank "correction" on top of the existing weights — not a wholesale rewrite. Concretely, LoRA freezes the original weight matrix `W` (size `d × d`) completely, and instead learns two small matrices `A` (size `d × r`) and `B` (size `r × d`), where `r` (the "rank") is small — typically 4 to 64. At inference time, the effective weight becomes `W + A·B`. Since `r ≪ d`, the number of trainable parameters collapses from `d²` to `2 × d × r` — for `d=4096, r=16`, that's a >99% reduction in trainable parameters.

**Why this changes what hardware you need.** Because only `A` and `B` need gradients and optimizer state, and the frozen `W` can sit in memory at reduced precision, the entire training memory footprint drops by an order of magnitude. QLoRA pushes this further by storing the frozen base model in 4-bit instead of 16-bit. The net effect: fine-tuning that once needed an 8-GPU cluster now fits on a single consumer GPU. The mechanics in the code below (Unsloth, `r=16`, `target_modules`) are just configuring where these `A`/`B` pairs get inserted — into the attention and feed-forward projection matrices of each transformer layer.

### 4. Fine-Tuning with Unsloth (2x Faster QLoRA)

```python
# Unsloth is a drop-in replacement for HuggingFace PEFT
# Delivers 2x training speed and 70% less memory than standard PEFT
# pip install unsloth

from unsloth import FastLanguageModel
from unsloth.chat_templates import get_chat_template
import torch

# ─────────────────────────────────────────
# STEP 1: Load model in 4-bit (QLoRA)
# ─────────────────────────────────────────
model, tokenizer = FastLanguageModel.from_pretrained(
    model_name="unsloth/Llama-3.1-8B-Instruct",  # 8B quantized to 4-bit
    max_seq_length=2048,
    dtype=None,           # Auto-detect best dtype
    load_in_4bit=True,    # QLoRA: quantize base model to 4-bit
)

# ─────────────────────────────────────────
# STEP 2: Add LoRA adapters
# ─────────────────────────────────────────
model = FastLanguageModel.get_peft_model(
    model,
    r=16,               # LoRA rank
    lora_alpha=16,      # Scaling factor (alpha = r for 1:1 scaling)
    lora_dropout=0.05,
    target_modules=[    # Which transformer modules to adapt
        "q_proj", "k_proj", "v_proj", "o_proj",
        "gate_proj", "up_proj", "down_proj"
    ],
    bias="none",
    use_gradient_checkpointing="unsloth",   # Saves 30% memory
    random_state=42,
)

print(model.print_trainable_parameters())
# trainable params: 41,943,040 || all params: 8,072,000,000 || trainable%: 0.52%

# ─────────────────────────────────────────
# STEP 3: Prepare dataset
# ─────────────────────────────────────────
from datasets import Dataset

# Example: Finance sentiment classification
samples = [
    {"instruction": "Classify sentiment: BULLISH/BEARISH/NEUTRAL", "input": "Apple beats earnings by 15%", "output": "BULLISH"},
    {"instruction": "Classify sentiment: BULLISH/BEARISH/NEUTRAL", "input": "CEO resigns amid accounting scandal", "output": "BEARISH"},
    # ... 500+ more examples
]

alpaca_prompt = """Below is an instruction that describes a task, paired with input. Write a response.

### Instruction:
{}

### Input:
{}

### Response:
{}"""

def format_sample(sample):
    return {
        "text": alpaca_prompt.format(
            sample["instruction"],
            sample.get("input", ""),
            sample["output"]
        ) + tokenizer.eos_token   # ← Critical: add EOS token!
    }

dataset = Dataset.from_list(samples).map(format_sample)

# ─────────────────────────────────────────
# STEP 4: Train
# ─────────────────────────────────────────
from trl import SFTTrainer
from transformers import TrainingArguments

trainer = SFTTrainer(
    model=model,
    tokenizer=tokenizer,
    train_dataset=dataset,
    dataset_text_field="text",
    max_seq_length=2048,
    args=TrainingArguments(
        per_device_train_batch_size=4,
        gradient_accumulation_steps=4,      # Effective batch = 16
        warmup_steps=10,
        max_steps=100,                      # For quick test; use num_train_epochs in production
        learning_rate=2e-4,
        fp16=not torch.cuda.is_bf16_supported(),
        bf16=torch.cuda.is_bf16_supported(),
        logging_steps=10,
        output_dir="./fine_tuning_output",
        optim="adamw_8bit",                  # Memory-efficient optimizer
        save_strategy="epoch",
    ),
)

trainer_stats = trainer.train()
print(f"Training time: {trainer_stats.metrics['train_runtime']:.1f}s")

# ─────────────────────────────────────────
# STEP 5: Save and push adapter
# ─────────────────────────────────────────
model.save_pretrained("./my-finance-adapter")         # Save locally
tokenizer.save_pretrained("./my-finance-adapter")

# Push to HuggingFace Hub (optional)
model.push_to_hub("username/my-finance-llama-lora")
tokenizer.push_to_hub("username/my-finance-llama-lora")
```

### 5. Running the Fine-Tuned Model

```python
# Inference with the fine-tuned adapter
FastLanguageModel.for_inference(model)  # Enable 2x faster inference

inputs = tokenizer(
    alpaca_prompt.format(
        "Classify sentiment: BULLISH/BEARISH/NEUTRAL",
        "Federal Reserve cuts rates by 50bps",
        ""   # Leave output empty — model fills this in
    ),
    return_tensors="pt"
).to("cuda")

outputs = model.generate(
    **inputs,
    max_new_tokens=10,      # Classification only needs a few tokens
    temperature=0.0,        # Deterministic for classification
    do_sample=False,
)

print(tokenizer.decode(outputs[0], skip_special_tokens=True))
# → BULLISH
```

### 6. Monitoring Training

```python
# Key metrics to watch during training
TRAINING_SIGNAL_GUIDE = {
    "train_loss": {
        "healthy": "Decreasing from ~2.5 to <0.5 over training",
        "alarm": "Loss not decreasing below 2.0 → learning rate too low or bad data",
        "alarm2": "Loss oscillating wildly → learning rate too high"
    },
    "grad_norm": {
        "healthy": "0.5–5.0",
        "alarm": "> 10 consistently → gradient explosion, reduce learning rate"
    },
    "learning_rate": {
        "typical_range": "1e-5 to 2e-4 for LoRA",
        "note": "Higher ranks (r=64) need lower LR (5e-5)"
    }
}

# CRITICAL: Evaluate on a held-out test set after every epoch
# (10–20% of your dataset should be reserved for evaluation)
# Monitor: eval_loss, task-specific metrics (accuracy, BLEU, ROUGE)
```

---

## Senior-Level Insights

### The Fine-Tuning Trap: Overfitting

With only 100 examples, the model will memorize them exactly and fail on new inputs. Signs of overfitting:
- `train_loss` hits 0.01 but `eval_loss` stays at 2.0
- Model produces near-identical outputs for different inputs

Fixes: More data, data augmentation, reduce training steps, increase regularization (`lora_dropout`).

### Data Quality > Data Quantity

100 high-quality, diverse, correctly-labeled examples outperform 10,000 poor-quality examples. Before training:
1. Manually review 50 random samples
2. Use GPT-4o to check label quality: *"Is this output correct given this instruction?"*
3. Remove duplicates rigorously
4. Ensure class balance (for classification tasks)

### When NOT to Fine-Tune

- **You have <50 examples**: Use few-shot prompting instead.
- **The task changes frequently**: Fine-tuning is expensive to repeat; use RAG.
- **You're not sure if prompting works**: You haven't tried it properly yet.
- **Budget is limited**: For most tasks, GPT-4o-mini with good prompting beats a poorly fine-tuned open-source model.

---

## Pitfalls

- ⚠️ **Forgetting the EOS token in training data.** If `tokenizer.eos_token` isn't appended to every example, the model never learns when to stop generating — it will ramble past the intended output in production. This is one of the most common silent bugs in fine-tuning pipelines.
- ⚠️ **Judging success by `train_loss` alone.** A model can hit a near-zero training loss while its `eval_loss` stays high — that's overfitting/memorization, not learning. Always hold out 10-20% of data for evaluation and watch both numbers.
- ⚠️ **Setting LoRA rank too high "to be safe."** A higher `r` means more trainable parameters and a higher risk of overfitting on small datasets, plus slower training — it does not automatically mean better quality. Start at `r=8` or `r=16` and only increase if evaluation shows underfitting.
- ⚠️ **Skipping dataset validation before a multi-hour training run.** Empty instructions, mismatched formats, or heavy duplication will silently degrade the trained model — and you won't find out until after paying for a full training run. Always run a dataset quality check (see Exercise 1) first.
- ⚠️ **Fine-tuning when the real problem is prompting.** If you haven't tried a well-engineered system prompt and a few-shot example set first, you can't know fine-tuning was actually necessary — and you've taken on the ongoing cost of retraining every time requirements change.

---

## Glossary

| Term | Definition |
| --- | --- |
| **Fine-tuning** | Continuing to train a pretrained model's weights on a smaller, task-specific dataset, so the model internalizes a particular style, format, or domain. |
| **PEFT (Parameter-Efficient Fine-Tuning)** | A family of techniques (LoRA, QLoRA, prefix tuning, etc.) that fine-tune a model by training only a small subset of parameters instead of the full weight set. |
| **LoRA (Low-Rank Adaptation)** | A PEFT method that freezes the original weight matrix and learns two small low-rank matrices (`A`, `B`) whose product is added to it, drastically reducing trainable parameter count. |
| **Rank (r)** | The inner dimension of the LoRA `A`/`B` matrices; controls the capacity of the adaptation — higher rank means more trainable parameters and (usually) more expressiveness, at higher overfitting risk. |
| **QLoRA** | LoRA applied on top of a 4-bit quantized frozen base model, reducing memory requirements further so larger models can be fine-tuned on consumer-grade GPUs. |
| **Quantization (NF4)** | Compressing model weights to a lower-precision numeric format (4-bit NormalFloat in QLoRA) to reduce memory footprint with minimal quality loss. |
| **Alpaca format** | An instruction-tuning dataset format with `instruction`, `input`, and `output` fields for single-turn tasks. |
| **ShareGPT format** | An instruction-tuning dataset format structured as a list of multi-turn `conversations` with `from`/`value` roles. |
| **EOS token** | "End of Sequence" — the special token that signals to the model where generated text should stop; must be included at the end of every training example. |
| **Catastrophic forgetting** | The degradation of a model's general capabilities that can occur when full fine-tuning on a narrow task overwrites previously learned weights. |
| **Train loss vs. eval loss** | Train loss measures fit to the training data; eval loss measures fit to held-out data. A growing gap between them (low train loss, high eval loss) is the signature of overfitting. |

---

## Hands-on Lab

### Exercise 1: Dataset Quality Check

```python
# Evaluate this dataset for fine-tuning quality issues
sample_dataset = [
    {"instruction": "Classify", "input": "Bad earnings", "output": "Bad"},
    {"instruction": "Classify", "input": "Good results", "output": "Good"},
    {"instruction": "Classify", "input": "Revenue up", "output": "Good"},
    {"instruction": "Classify", "input": "Losses", "output": "Bad"},
    {"instruction": "", "input": "Market crash", "output": "BEARISH"},
    {"instruction": "Classify sentiment: BULLISH/BEARISH/NEUTRAL",
     "input": "Apple reports 15% revenue growth",
     "output": "BULLISH"},
]

# TODO:
# 1. Identify at least 4 quality issues in this dataset
# 2. Write a fix_dataset() function that corrects each issue
# 3. Add 5 more high-quality samples to reach 11 total
def fix_dataset(samples: list[dict]) -> list[dict]:
    pass

# EXPECTED RESULT — at minimum, fix_dataset() should resolve these 4 issues:
#   1. Inconsistent label vocabulary: rows use "Bad"/"Good" while others use
#      "BULLISH"/"BEARISH"/"NEUTRAL" — pick ONE label set and apply it to all.
#   2. Missing instruction text: row 5 has instruction="" — every row must
#      restate the full task instruction, not rely on positional context.
#   3. Instructions too generic: "Classify" (rows 1-4) doesn't tell the model
#      what categories exist — should read like row 6's full instruction.
#   4. Insufficient size and class imbalance: 6 samples is far below the
#      "100-500 examples per class" guideline in DATASET_SIZE_GUIDE, and
#      labels skew toward only 2 classes (no NEUTRAL examples at all).
# After fixing, validate_dataset(fixed_samples) should return is_valid=True
# with issues=[] and dedup_ratio >= 0.8.
```

### Exercise 2: LoRA Parameter Sensitivity

For a model with `d_model=4096`, fill in this table:

| LoRA Rank (r) | Parameters per Layer | Total Layers (assume 32 q,v) | Total LoRA Params | % of 7B model |
| ------------- | -------------------- | ---------------------------- | ----------------- | ------------- |
| 4             | ?                    | 32×2                         | ?                 | ?             |
| 16            | ?                    | 32×2                         | ?                 | ?             |
| 64            | ?                    | 32×2                         | ?                 | ?             |

Formula: params per layer = 2 × d_model × r (A matrix + B matrix)

**EXPECTED RESULT** (d_model=4096, 32 layers × 2 target matrices = 64 adapted matrices, 7B base model):

| LoRA Rank (r) | Parameters per Layer | Total Layers | Total LoRA Params | % of 7B model |
| ------------- | --------------------- | ------------- | ------------------ | -------------- |
| 4             | 2×4096×4 = 32,768      | 64            | 2,097,152 (~2.1M)   | ~0.030%        |
| 16            | 2×4096×16 = 131,072    | 64            | 8,388,608 (~8.4M)   | ~0.120%        |
| 64            | 2×4096×64 = 524,288    | 64            | 33,554,432 (~33.6M) | ~0.480%        |

Even at rank 64, LoRA trains under 0.5% of the model's total parameters — this is the core PEFT efficiency argument made concrete.

### Exercise 3: Evaluate Two Model Variants

```python
# You fine-tuned two versions of the same model:
# v1: rank=4, 50 training steps, lr=2e-4
# v2: rank=16, 200 training steps, lr=1e-4
# Both have training_loss reported as 0.15

# Given this eval dataset, calculate which version is better:
eval_examples = [
    {"input": "Tesla stock drops 12% after production miss", "expected": "BEARISH"},
    {"input": "Inflation falls to 2.1%, Fed signals rate cuts", "expected": "BULLISH"},
    {"input": "Company announces new product line", "expected": "NEUTRAL"},
    {"input": "Major acquisition blocked by regulators", "expected": "BEARISH"},
    {"input": "Q3 earnings in line with analysts expectations", "expected": "NEUTRAL"},
]

# v1 model predictions (mock)
v1_predictions = ["BEARISH", "BULLISH", "NEUTRAL", "BEARISH", "BULLISH"]
# v2 model predictions (mock)
v2_predictions = ["BEARISH", "BULLISH", "NEUTRAL", "BEARISH", "NEUTRAL"]

# TODO: Calculate accuracy for both models and declare a winner
# Discuss: what does a low training_loss but lower accuracy tell you?

# EXPECTED RESULT:
#   v1_predictions vs expected: ["BEARISH","BULLISH","NEUTRAL","BEARISH","BULLISH"]
#     vs ["BEARISH","BULLISH","NEUTRAL","BEARISH","NEUTRAL"] -> 4/5 correct = 80%
#   v2_predictions vs expected: ["BEARISH","BULLISH","NEUTRAL","BEARISH","NEUTRAL"]
#     vs expected -> 5/5 correct = 100%
#   Winner: v2 (rank=16, 200 steps, lr=1e-4), accuracy 100% vs v1's 80%.
# Discussion takeaway: both models report the same training_loss (0.15), but
# v1's identical training loss with worse held-out accuracy suggests v1
# overfit faster (fewer steps, higher LR, lower rank = less capacity, so it
# memorized the training set's surface patterns quickly without generalizing
# as well to the eval set's NEUTRAL case). This is exactly why train_loss
# alone cannot be used to pick a winner — always compare on held-out eval data.
```

---

## Mastery Check

**Q1**: What is the key practical difference between LoRA and full fine-tuning?
<details><summary>Answer</summary>
Full fine-tuning updates all model parameters — for a 7B model, that's 7 billion weights, requiring enormous GPU memory (140GB+ in fp16) and risking catastrophic forgetting of previous capabilities. LoRA freezes all original weights and only trains two small matrices (A and B) per layer, with rank r ≪ d_model. For rank=16, only ~0.5% of all parameters are trained, fitting in ~6GB VRAM. The final model adds A×B to the original weights — the quality gap from full fine-tuning is typically <5%.
</details>

**Q2**: What does QLoRA add on top of LoRA?
<details><summary>Answer</summary>
QLoRA quantizes the frozen base model to 4-bit NormalFloat (NF4) precision using double quantization, reducing memory ~4x (e.g., a 7B model fits in ~4GB VRAM instead of 14GB). The LoRA adapters remain in 16-bit for training stability. The combination allows fine-tuning models like Llama 3.1 70B on a single A100 (80GB) instead of requiring an 8-GPU cluster. Quality loss from quantization is minimal due to NF4's information-theoretic optimal quantization for normally distributed weights.
</details>

**Q3**: A company wants to fine-tune a model to answer questions about their proprietary product. They have 50 Q&A pairs. Should they fine-tune?
<details><summary>Answer</summary>
No — 50 examples is insufficient and RAG is far better suited. With 50 examples, the model will perfectly memorize training examples but generalize poorly to variations. RAG would: index all product documentation (hundreds of pages), retrieve relevant sections at query time, and produce accurate, up-to-date answers. If they later collect 500+ high-quality examples AND the product has a consistent communication style they want to enforce, fine-tuning is worth revisiting.
</details>

**Q4**: What is catastrophic forgetting and how does LoRA mitigate it?
<details><summary>Answer</summary>
Catastrophic forgetting occurs when fine-tuning on a specific task overwrites the general knowledge baked into the model's weights. For example, full fine-tuning on medical Q&A can degrade the model's coding or math abilities. LoRA mitigates this by keeping all original weights frozen — only the small A and B matrices are trained. The general knowledge in the original weights is preserved; the adapters add task-specific behavior on top.
</details>

**Q5**: What is the EOS token and why is it critical to include it in training data?
<details><summary>Answer</summary>
The EOS (End of Sequence) token signals the model to stop generating text. During training, if EOS tokens are missing at the end of each example, the model doesn't learn when to stop — it will continue generating garbage text after the desired output in production. Always append `tokenizer.eos_token` to training examples. Also ensure `dataset_text_field` is correctly set so the trainer applies attention masking to input tokens (not gradients on the prompt, only on the output).
</details>

---

## Further Reading

- [Unsloth — 2x Faster QLoRA Fine-Tuning](https://github.com/unslothai/unsloth)
- [HuggingFace PEFT Documentation](https://huggingface.co/docs/peft/)
- [TRL — Transformer Reinforcement Learning (SFTTrainer)](https://huggingface.co/docs/trl/)
- [QLoRA Paper — Dettmers et al. 2023](https://arxiv.org/abs/2305.14314)
- [Axolotl — Production Fine-Tuning Framework](https://github.com/OpenAccess-AI-Collective/axolotl)

---

## Summary

- ✅ **Decision order**: Prompt engineering → Few-shot → RAG → Fine-tuning.
- ✅ **LoRA** adds small trainable matrices (A×B) to frozen layers — 0.5% of params, 95% of full fine-tune quality.
- ✅ **QLoRA** adds 4-bit quantization of base model — enables 70B fine-tuning on 1–2 GPUs.
- ✅ **Unsloth**: 2x faster training, 70% less memory — drop-in for PEFT.
- ✅ **Dataset quality > quantity** — 200 excellent examples beats 2,000 noisy ones.
- ✅ **Always evaluate on a held-out set** — training loss alone doesn't measure generalization.

**Tomorrow → Day 114**: **Evaluation & Guardrails** — measuring what LLMs actually produce, RAGAS for RAG evaluation, and guardrail systems to keep outputs safe and on-topic.
