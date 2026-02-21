---
day: 70
title: "LLM Fine-Tuning & PEFT"
phase: 6
phaseTitle: "Cutting-Edge ML"
slug: "llm-fine-tuning-peft"
duration: 120
difficulty: "advanced"
tags:
  - llm
  - fine-tuning
  - peft
  - lora
  - qlora
concepts:
  - "parameter-efficient fine-tuning (PEFT)"
  - "LoRA (Low-Rank Adaptation)"
  - "QLoRA (Quantized LoRA)"
  - "adapter layers"
  - "instruction tuning"
prerequisites:
  - "Day 58: Transformers & Attention"
  - "Understanding of gradient descent"
outcomes:
  - "Explain why PEFT is preferred over full fine-tuning"
  - "Fine-tune a model with LoRA using Hugging Face PEFT"
  - "Choose between LoRA, QLoRA, and full fine-tuning for a given scenario"
---

# 🎯 Day 70: LLM Fine-Tuning & PEFT

> *"GPT-4 is brilliant at everything in general but knows nothing about your company. Fine-tuning makes it brilliant at your specific problem."*

---

## The "Never-Coded" Bridge

**Imagine hiring a world-class chef from a 3-Michelin-star restaurant.**

They know every cuisine, every technique. But you run a **Hyderabad biryani restaurant**. Their knowledge is too general.

Two options:
1. **Full Retraining**: Send them to biryani school for 10 years. Expensive, slow, and they'll mostly learn what they already know.
2. **Fine-Tuning (PEFT)**: Give them a 2-week crash course on your specific spice blends and plating style. 10x cheaper. They keep all their existing knowledge and add your specialization.

**PEFT (Parameter-Efficient Fine-Tuning)** is that 2-week crash course for LLMs.

---

## The Technical Deep Dive

### 1. Why Not Full Fine-Tuning?

Fine-tuning GPT-3 (175B parameters) from scratch requires:
- **GPU memory**: ~350GB VRAM (you'd need ~40 A100 GPUs)
- **Time**: Weeks of training
- **Cost**: $100,000+

PEFT solves this by only training a small number of *new* parameters while keeping the original model frozen.

### 2. LoRA: Low-Rank Adaptation

LoRA's key insight: instead of updating the full weight matrix W (huge), learn two small matrices A and B such that ΔW = A × B:

```
Original: W (d × k) — e.g., 4096 × 4096 = 16.7M parameters
LoRA:     A (d × r) + B (r × k) — e.g., 4096×8 + 8×4096 = 65,536 parameters
          (where r = rank, typically 4–64)
```

**Only A and B are trained.** The original W stays frozen. At inference, you add: W_effective = W + A × B.

```python
from peft import LoraConfig, get_peft_model, TaskType
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

# Load base model (use a small one for demo)
model_name = "microsoft/phi-2"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(
    model_name, torch_dtype=torch.float16, device_map="auto"
)

# Configure LoRA
lora_config = LoraConfig(
    task_type=TaskType.CAUSAL_LM,
    r=16,  # Rank — higher = more capacity, more params
    lora_alpha=32,  # Scaling factor (usually 2*r)
    target_modules=["q_proj", "v_proj"],  # Which layers to adapt
    lora_dropout=0.1,
    bias="none",
)

# Wrap model with LoRA
peft_model = get_peft_model(model, lora_config)
peft_model.print_trainable_parameters()
# Output: trainable params: 2,097,152 || all params: 2,779,683,840 || trainable%: 0.0755%
# Only 0.075% of parameters are trained!
```

### 3. Training with Hugging Face PEFT

```python
from transformers import TrainingArguments, Trainer
from datasets import Dataset

# Prepare instruction dataset
data = [
    {
        "input": "What is our refund policy?",
        "output": "We offer 30-day full refunds for all products.",
    },
    {
        "input": "How do I track my order?",
        "output": "Log in and visit Orders > Track Shipment.",
    },
    # ... more company-specific Q&As
]


def format_prompt(sample):
    return {"text": f"### Question: {sample['input']}\n### Answer: {sample['output']}"}


dataset = Dataset.from_list(data).map(format_prompt)

# Training arguments
training_args = TrainingArguments(
    output_dir="./lora-finetuned",
    num_train_epochs=3,
    per_device_train_batch_size=4,
    gradient_accumulation_steps=4,
    learning_rate=2e-4,
    fp16=True,
    logging_steps=10,
    save_strategy="epoch",
)

trainer = Trainer(
    model=peft_model, train_dataset=dataset, args=training_args, tokenizer=tokenizer
)

trainer.train()

# Save only the LoRA weights (very small — a few MB)
peft_model.save_pretrained("./my-lora-adapter")
```

### 4. QLoRA — Fine-Tuning on Consumer GPUs

QLoRA quantizes the base model to 4-bit precision (reducing memory 4x) while keeping LoRA adapters in 16-bit:

```python
from transformers import BitsAndBytesConfig

# 4-bit quantization config
bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_use_double_quant=True,
    bnb_4bit_quant_type="nf4",  # NormalFloat4 — best for LLMs
    bnb_4bit_compute_dtype=torch.float16,
)

# Load model in 4-bit — fits 70B model on a 2×A100 instead of 8×A100
model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-3-8b-hf", quantization_config=bnb_config, device_map="auto"
)
# Then apply LoRA as before — this combination is QLoRA
```

---

## Senior-Level Insights

### When to Use Each Approach

| Scenario                                   | Recommendation                                        |
| ------------------------------------------ | ----------------------------------------------------- |
| General task, just want latest model       | **Prompt engineering** — no fine-tuning needed        |
| Need consistent format/persona             | **LoRA** (fast, cheap)                                |
| Limited GPU memory (1×A100 or less)        | **QLoRA** (4-bit)                                     |
| Domain-specific knowledge (medical, legal) | **Full fine-tuning** + LoRA                           |
| Real-time feedback correction              | **RLHF** (Reinforcement Learning from Human Feedback) |

### The Fine-Tuning Trap

Most teams rush to fine-tune when they should first:
1. Try better prompting (system prompt + few-shot examples)
2. Try RAG (retrieval-augmented generation — tomorrow)
3. *Then* consider fine-tuning if both fail

Fine-tuning teaches *style and format*, not new factual knowledge. RAG teaches *facts*.

---

## Hands-on Lab

### Exercise 1: Count LoRA Parameters

Given a Transformer attention layer with `d_model=768`:

```python
def count_lora_params(d_model: int, rank: int, num_target_modules: int) -> dict:
    """
    Calculate LoRA parameter counts.
    Assume each target module has one q_proj and one v_proj of shape (d_model, d_model).
    """
    # TODO: Calculate params for A matrix (d_model × rank) per module
    # TODO: Calculate params for B matrix (rank × d_model) per module
    # TODO: Total LoRA params vs original params
    params_per_module_lora = None  # Your calculation
    original_params_per_module = None  # d_model * d_model
    return {
        "lora_params": params_per_module_lora * num_target_modules,
        "original_params": original_params_per_module * num_target_modules,
        "reduction_percent": None,  # (1 - lora/original) * 100
    }


result = count_lora_params(d_model=768, rank=16, num_target_modules=12)
print(result)
```

### Exercise 2: Format an Instruction Dataset

Convert this raw Q&A data into the Alpaca instruction format used to fine-tune instruction-following models:

```python
raw_data = [
    {
        "q": "What does EBITDA stand for?",
        "a": "Earnings Before Interest, Taxes, Depreciation, and Amortization",
    },
    {"q": "What is working capital?", "a": "Current Assets minus Current Liabilities"},
]


def to_alpaca_format(sample: dict) -> dict:
    """
    Convert to: {"instruction": ..., "input": "", "output": ...}
    Add system context: "You are a finance tutor for MBA students."
    """
    # TODO: Format with instruction, input, output keys
    pass


formatted = [to_alpaca_format(d) for d in raw_data]
print(formatted[0])
```

### Exercise 3: LoRA Rank Intuition

Rank `r` controls the expressiveness of your adaptation. For each scenario below, reason about which rank to choose (4, 16, or 64) and why:

1. Teaching a model to always respond in JSON format
2. Teaching a model the entire domain of corporate law case studies
3. Teaching a model to be more concise in its responses

---

## Mastery Check

**Q1**: What two matrices does LoRA add to each layer, and why does this save memory?
<details><summary>Answer</summary>
LoRA adds matrix A (d×r) and matrix B (r×d) where r << d. The product AB approximates the weight update ΔW. Since r is small (e.g., 16 vs 4096), total parameters trained is tiny — e.g., 2×4096×16 = 131K vs 4096×4096 = 16.7M (127x reduction).
</details>

**Q2**: What is the key difference between LoRA and QLoRA?
<details><summary>Answer</summary>
QLoRA additionally quantizes the frozen base model to 4-bit precision, reducing GPU memory requirements by ~4x. This allows fine-tuning large models (e.g., 70B) on consumer hardware. The LoRA adapters remain in 16-bit for training stability.
</details>

**Q3**: You want your support chatbot to always respond in a specific JSON schema. Should you use fine-tuning or prompt engineering?
<details><summary>Answer</summary>
Start with prompt engineering (system prompt with a JSON example). If the model is inconsistent across many prompts, apply fine-tuning. Fine-tuning is ideal for consistent format/style enforcement.
</details>

**Q4**: What does `lora_alpha` control, and what is the typical rule of thumb?
<details><summary>Answer</summary>
`lora_alpha` is a scaling factor. The effective learning rate for LoRA layers is `lora_alpha / r`. Common rule of thumb: set `lora_alpha = 2 * r` (e.g., r=16 → alpha=32).
</details>

**Q5**: After fine-tuning with LoRA, what must you save to deploy the model?
<details><summary>Answer</summary>
Only the LoRA adapter weights — typically just a few MB. The base model remains unchanged and can be shared. At inference, you load base model + adapter, and the weights are merged: W_effective = W + A×B.
</details>

---

## Summary

- ✅ **PEFT solves the economics of fine-tuning**: train <1% of parameters, get 90%+ of the benefit.
- ✅ **LoRA**: Injects small trainable matrices A and B into frozen layers.
- ✅ **QLoRA**: LoRA + 4-bit quantization for the base model — fine-tune big models on small GPUs.
- ✅ **Fine-tuning teaches style; RAG teaches facts** — choose the right tool.

**Tomorrow → Day 71**: **RAG & Vector Databases** — how to give LLMs access to your company's private knowledge without fine-tuning.
