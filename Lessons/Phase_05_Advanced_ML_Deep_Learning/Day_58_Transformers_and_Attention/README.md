---
day: 58
title: "Transformers & Attention"
phase: 5
phaseTitle: "Advanced ML & Deep Learning"
slug: "transformers"
duration: 60
difficulty: "advanced"
tags: [deep-learning, transformers, attention, nlp]
concepts: [attention mechanism, BERT, GPT, transfer learning]
prerequisites: [46, 49]
outcomes: [Understand transformer architecture, Use pretrained models, Apply transfer learning]
---

# 🎯 Day 58: Transformers & Attention

> *"The architecture behind ChatGPT, BERT, and the AI revolution."*

---

## The Technical Deep Dive

### Attention Mechanism

```
Query, Key, Value matrices
Attention(Q, K, V) = softmax(QK^T / sqrt(d)) × V
```

### Using Pretrained Transformers

```python
from transformers import pipeline

# Sentiment analysis
classifier = pipeline("sentiment-analysis")
result = classifier("I love machine learning!")
print(result)  # [{'label': 'POSITIVE', 'score': 0.99}]

# Text generation
generator = pipeline("text-generation", model="gpt2")
text = generator("Machine learning is", max_length=50)
```

### BERT for Classification

```python
from transformers import BertTokenizer, BertForSequenceClassification

tokenizer = BertTokenizer.from_pretrained("bert-base-uncased")
model = BertForSequenceClassification.from_pretrained("bert-base-uncased")

inputs = tokenizer("I love this!", return_tensors="pt")
outputs = model(**inputs)
```

---

## Summary

- ✅ Attention enables parallel processing
- ✅ Pretrained models save training time
- ✅ Hugging Face makes transformers accessible

**Tomorrow**: Generative Models.
