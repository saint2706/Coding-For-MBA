"""
PEFT Configuration Examples — LoRA and QLoRA Templates.

Ready-to-use configuration templates for fine-tuning LLMs using
Parameter-Efficient Fine-Tuning (PEFT) methods.

Prerequisites:
    pip install peft transformers bitsandbytes datasets torch

Reference: Day 60B (LLM Fine-Tuning & PEFT)
"""

# ─── LoRA Configuration ─────────────────────────────────────────────────────

LORA_CONFIG_7B = {
    "description": "LoRA config for 7B models (Mistral, Llama 3.1 8B)",
    "r": 16,                          # Rank — higher = more capacity, more memory
    "lora_alpha": 32,                 # Scaling factor (usually 2*r)
    "lora_dropout": 0.05,            # Regularization
    "target_modules": [
        "q_proj", "k_proj",
        "v_proj", "o_proj",
        "gate_proj", "up_proj", "down_proj",
    ],
    "bias": "none",
    "task_type": "CAUSAL_LM",
}

LORA_CONFIG_70B = {
    "description": "LoRA config for 70B models (requires QLoRA for single GPU)",
    "r": 64,
    "lora_alpha": 128,
    "lora_dropout": 0.05,
    "target_modules": ["q_proj", "k_proj", "v_proj", "o_proj"],
    "bias": "none",
    "task_type": "CAUSAL_LM",
}


# ─── QLoRA (4-bit) Configuration ─────────────────────────────────────────────

QLORA_QUANTIZATION_CONFIG = {
    "description": "4-bit quantization for QLoRA fine-tuning",
    "load_in_4bit": True,
    "bnb_4bit_quant_type": "nf4",           # NormalFloat4 — best for LLMs
    "bnb_4bit_compute_dtype": "bfloat16",   # Computation precision
    "bnb_4bit_use_double_quant": True,      # Double quantization saves ~0.4 bits/param
}


# ─── Training Arguments ──────────────────────────────────────────────────────

TRAINING_ARGS_SMALL = {
    "description": "Training args for small datasets (<5K examples)",
    "num_train_epochs": 3,
    "per_device_train_batch_size": 4,
    "gradient_accumulation_steps": 4,       # Effective batch = 16
    "learning_rate": 2e-4,
    "weight_decay": 0.01,
    "warmup_ratio": 0.03,
    "lr_scheduler_type": "cosine",
    "fp16": False,
    "bf16": True,                            # Use bfloat16 on A100/H100
    "logging_steps": 10,
    "save_strategy": "steps",
    "save_steps": 100,
    "eval_strategy": "steps",
    "eval_steps": 100,
    "output_dir": "./output",
}

TRAINING_ARGS_LARGE = {
    "description": "Training args for large datasets (>10K examples)",
    "num_train_epochs": 1,
    "per_device_train_batch_size": 8,
    "gradient_accumulation_steps": 2,
    "learning_rate": 1e-4,
    "weight_decay": 0.01,
    "warmup_ratio": 0.05,
    "lr_scheduler_type": "cosine",
    "bf16": True,
    "logging_steps": 50,
    "save_strategy": "epoch",
    "eval_strategy": "steps",
    "eval_steps": 500,
    "output_dir": "./output",
}


# ─── Dataset Format Templates ────────────────────────────────────────────────

ALPACA_FORMAT = {
    "description": "Stanford Alpaca instruction format",
    "example": {
        "instruction": "Summarize the key points of this earnings report.",
        "input": "Revenue grew 23% YoY to $4.2B...",
        "output": "Key points: (1) Revenue growth of 23%..."
    },
    "template": "### Instruction:\n{instruction}\n\n### Input:\n{input}\n\n### Response:\n{output}"
}

SHAREGPT_FORMAT = {
    "description": "ShareGPT conversation format",
    "example": {
        "conversations": [
            {"from": "human", "value": "Explain the concept of P/E ratio."},
            {"from": "gpt", "value": "The Price-to-Earnings (P/E) ratio measures..."},
        ]
    }
}


# ─── Quick Start ──────────────────────────────────────────────────────────────

QUICK_START = """
# Quick Start — Fine-tune Llama 3.1 8B with QLoRA

from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
from transformers import (
    AutoModelForCausalLM, AutoTokenizer,
    BitsAndBytesConfig, TrainingArguments
)
from trl import SFTTrainer

# 1. Load model in 4-bit
bnb_config = BitsAndBytesConfig(**QLORA_QUANTIZATION_CONFIG)
model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-3.1-8B-Instruct",
    quantization_config=bnb_config,
    device_map="auto",
)
tokenizer = AutoTokenizer.from_pretrained("meta-llama/Llama-3.1-8B-Instruct")

# 2. Apply LoRA
model = prepare_model_for_kbit_training(model)
lora_config = LoraConfig(**{k: v for k, v in LORA_CONFIG_7B.items() if k != "description"})
model = get_peft_model(model, lora_config)
model.print_trainable_parameters()  # Should show ~0.5% trainable

# 3. Train
trainer = SFTTrainer(
    model=model,
    train_dataset=your_dataset,
    args=TrainingArguments(**{k: v for k, v in TRAINING_ARGS_SMALL.items() if k != "description"}),
    tokenizer=tokenizer,
    max_seq_length=2048,
)
trainer.train()

# 4. Save adapter (tiny file, ~50MB)
model.save_pretrained("./my_adapter")
"""

if __name__ == "__main__":
    print("PEFT Configuration Examples")
    print("=" * 40)
    for name, config in [
        ("LoRA 7B", LORA_CONFIG_7B),
        ("LoRA 70B", LORA_CONFIG_70B),
        ("QLoRA Quantization", QLORA_QUANTIZATION_CONFIG),
    ]:
        print(f"\n{name}: {config['description']}")
    print(QUICK_START)
