# Day 58 – Transformers and Attention

Transformers dominate modern sequence modelling. This lesson demonstrates how to:

- Assemble encoder–decoder stacks with multi-head self-attention, cross-attention, and position-wise
  feed-forward layers.
- Fine-tune pretrained checkpoints (Hugging Face style) with layer-freezing schedules,
  discriminative learning rates, and LoRA adapters.
- Visualise token-to-token attention patterns to interpret model focus during inference.
- Deploy a deterministic tiny transformer classifier for reproducible experiments on compact
  datasets.

Run `python Day_58_Transformers_and_Attention/solutions.py` to simulate encoder–decoder passes,
generate fine-tuning playbooks, and score demo texts with attention heatmaps.
