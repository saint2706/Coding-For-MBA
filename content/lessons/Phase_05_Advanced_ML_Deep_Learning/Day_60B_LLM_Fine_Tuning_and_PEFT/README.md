---
day: "60B"
title: "LLM Fine-Tuning & Parameter-Efficient Fine-Tuning (PEFT)"
phase: 5
phaseTitle: "Advanced ML & Deep Learning"
slug: "llm-fine-tuning-peft"
duration: 60
difficulty: "advanced"
tags:
  - llm
  - fine-tuning
  - peft
  - lora
  - qlora
  - transformers
concepts:
  - "full fine-tuning vs PEFT"
  - "LoRA: Low-Rank Adaptation"
  - "QLoRA: quantized LoRA"
  - "parameter efficiency"
  - "Hugging Face PEFT library"
prerequisites: [58, 59]
outcomes:
  - "Understand why fine-tuning large language models requires PEFT techniques"
  - "Explain the LoRA architecture and why it dramatically reduces trainable parameters"
  - "Know when to fine-tune vs use RAG vs prompt engineering"
  - "Read and understand a basic PEFT training loop"
---

# 🤖 Day 60B: LLM Fine-Tuning & PEFT

> *"Full fine-tuning a 70B model requires 140GB of VRAM. LoRA fine-tunes it with 12GB. That's the budget difference between a research lab and a startup."*

---

## The "Never-Coded" Bridge

**You've trained Transformers (Day 58) and Generative Models (Day 59).** Now imagine you want to take GPT-4 and make it an expert in your company's internal legalese. Fine-tuning the entire model would require dozens of A100 GPUs and millions of dollars.

**PEFT (Parameter-Efficient Fine-Tuning)** is the engineering discipline that makes this achievable on a single GPU. The core insight: you don't need to update all 70 billion parameters. Update only a tiny, clever subset — and get equivalent results.

> **This lesson is a conceptual bridge.** Full implementation, code walkthroughs, and hands-on training loops are in **Phase 10 → Day 113: Fine-Tuning LLMs**, which runs on real models with Unsloth. Read this lesson to build intuition; go there to build the code.

---

## Core Concepts

### Why Fine-Tuning Matters

Pre-trained LLMs are general-purpose. They know world knowledge but not your:
- Internal jargon, product names, or business rules
- Desired output format (always return JSON, always be concise)
- Domain-specific tone (medical, legal, financial)
- Private dataset patterns that never appeared in training

**Fine-tuning** adapts a pre-trained model to your specific task/domain by continuing training on your data.

### The Memory Problem

| Model        | Parameters | Full Fine-Tune VRAM Needed |
| ------------ | ---------- | -------------------------- |
| BERT-base    | 110M       | ~4 GB                      |
| GPT-2 (1.5B) | 1.5B       | ~24 GB                     |
| LLaMA 2 7B   | 7B         | ~56 GB                     |
| LLaMA 2 70B  | 70B        | ~560 GB                    |

Each parameter needs: FP32 weights (4B) + gradients (4B) + optimizer state (8B) = **16 bytes per parameter**. Full fine-tuning is economically infeasible at 7B+ parameters for most organizations.

### LoRA: Low-Rank Adaptation

The key insight behind LoRA (Hu et al., 2021): **weight updates during fine-tuning are inherently low-rank**.

Instead of updating the full weight matrix W (shape d × k), LoRA approximates the update ΔW as a product of two small matrices: ΔW = A × B, where:
- A has shape d × r  (r = rank, typically 4–64)
- B has shape r × k

During fine-tuning, only A and B are trained. W is frozen. This reduces trainable parameters from d×k to r×(d+k) — often a **10,000x reduction**.

```python
# Conceptual LoRA: what's happening under the hood
import torch
import torch.nn as nn

class LoRALayer(nn.Module):
    """
    Wraps an existing linear layer with low-rank adaptation.
    In practice, use Hugging Face PEFT — this illustrates the concept.
    """
    def __init__(self, original_layer: nn.Linear, rank: int = 8, alpha: float = 16):
        super().__init__()
        d_in = original_layer.in_features
        d_out = original_layer.out_features

        # Frozen original weights
        self.original = original_layer
        for param in self.original.parameters():
            param.requires_grad = False  # Freeze!

        # Trainable low-rank matrices
        self.lora_A = nn.Parameter(torch.randn(rank, d_in) * 0.01)
        self.lora_B = nn.Parameter(torch.zeros(d_out, rank))

        # Scaling factor
        self.scaling = alpha / rank

    def forward(self, x):
        # Original output (frozen) + low-rank adaptation
        original_out = self.original(x)
        lora_out = (x @ self.lora_A.T @ self.lora_B.T) * self.scaling
        return original_out + lora_out


# Parameter count comparison
d_in, d_out, rank = 4096, 4096, 8
original_params = d_in * d_out          # 16,777,216
lora_params = rank * d_in + rank * d_out  # 65,536
print(f"Original: {original_params:,} params")
print(f"LoRA: {lora_params:,} trainable params ({lora_params/original_params:.2%})")
```

### QLoRA: Quantization + LoRA

QLoRA pushes further: **quantize** the frozen base model weights to 4-bit integers (from 16-bit floats), then apply LoRA adapters in 16-bit. This reduces the memory footprint by ~4x again:
- A 7B model that needed 14 GB in FP16 → needs ~4 GB in 4-bit + LoRA adapters
- Enables fine-tuning 7B models on a **single consumer GPU (RTX 3090/4090)**

### When to Fine-Tune vs Other Options

| Approach                              | When to Use                               | Cost           |
| ------------------------------------- | ----------------------------------------- | -------------- |
| **Prompt engineering**                | Task is well-defined, few examples needed | Free           |
| **Few-shot prompting**                | Need format or style guidance             | Free           |
| **RAG** *(Day 60C, Phase 10 Day 112)* | Need fresh/private knowledge              | Medium (infra) |
| **LoRA fine-tuning**                  | Need behavior/style/domain adaptation     | Low-Medium     |
| **Full fine-tuning**                  | New capability not in base model          | Very High      |

---

## The Hugging Face PEFT Library

For full implementation with real models, go to **Phase 10 → Day 113**. Here's the mental model:

```python
# Pseudocode — actual runnable version in Phase 10 Day 113
# (requires GPU, model downloads, and full PEFT/transformers setup)

from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import get_peft_model, LoraConfig, TaskType

# 1. Load base model
model = AutoModelForCausalLM.from_pretrained("meta-llama/Llama-2-7b-hf")

# 2. Configure LoRA
lora_config = LoraConfig(
    task_type=TaskType.CAUSAL_LM,
    r=8,          # Rank — lower = fewer params, less capacity
    lora_alpha=32,  # Scaling factor (alpha/r controls magnitude)
    lora_dropout=0.1,
    target_modules=["q_proj", "v_proj"],  # Which layers to apply LoRA
)

# 3. Wrap model with PEFT — magically adds trainable LoRA adapters
peft_model = get_peft_model(model, lora_config)
peft_model.print_trainable_parameters()
# Output: trainable params: 4,194,304 || all params: 6,742,609,920 || trainable%: 0.0622

# 4. Train normally with your dataset
# (standard HuggingFace Trainer or custom loop)

# 5. Save only the adapter weights (tiny — usually ~20MB vs 14GB base)
peft_model.save_pretrained("./my_lora_adapter")
```

---

## Mastery Check

**Q1**: Why does LoRA freeze the original model weights and only train A and B matrices?
<details><summary>Answer</summary>

Two reasons: (1) **Memory efficiency** — freezing the original weights means you don't need to store gradients and optimizer states for them (saves ~12 bytes/param). (2) **Catastrophic forgetting prevention** — the original model's general capabilities are preserved because its weights never change; only the low-rank adaptation specializes it.
</details>

**Q2**: A colleague says "just use a bigger prompt instead of fine-tuning." When is fine-tuning actually necessary?
<details><summary>Answer</summary>

Prompt engineering has limits: (1) it can't teach the model new facts not in its training data, (2) context windows are finite (can't put 10,000 examples in a prompt), (3) inference costs scale with prompt length, and (4) prompts don't reliably change fundamental behavior (e.g., always produce valid JSON). Fine-tune when you need consistent behavior change, domain adaptation, or must use your proprietary data to shift the model's outputs.
</details>

**Q3**: What is the trade-off of choosing rank r=4 vs r=64 in LoRA?
<details><summary>Answer</summary>

Lower rank (r=4): fewer trainable parameters, less memory, faster training, less risk of overfitting — but less expressive capacity. Higher rank (r=64): more capacity to learn complex adaptations — but approaches the memory/compute cost of full fine-tuning. In practice, r=8 to r=32 is sufficient for most downstream tasks; use validation loss curves to find the sweet spot.
</details>

---

## Next Steps

**Go deeper on implementation:**
- 🔗 **Phase 10 → Day 113**: Full fine-tuning walkthrough with Unsloth (QLoRA on LLaMA 3)
- 🔗 **Phase 10 → Day 114**: Evaluating your fine-tuned model with RAGAS
- 📖 [LoRA paper](https://arxiv.org/abs/2106.09685) — Original Hu et al. 2021 paper (accessible)
- 📖 [QLoRA paper](https://arxiv.org/abs/2305.14314) — Dettmers et al. 2023
- 🔧 [Hugging Face PEFT](https://huggingface.co/docs/peft/index) — Official library docs

**Tomorrow → Day 60C**: RAG & Vector Databases — retrieve private knowledge without fine-tuning.
