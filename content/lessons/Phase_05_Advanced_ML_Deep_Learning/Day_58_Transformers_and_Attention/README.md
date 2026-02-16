---
day: 58
title: "Transformers & Attention"
phase: 5
phaseTitle: "Advanced ML & Deep Learning"
slug: "transformers"
duration: 60
difficulty: "advanced"
tags:
  - deep-learning
  - transformers
  - attention
  - nlp
  - bert
  - gpt
concepts:
  - "self-attention mechanism"
  - "transformer architecture"
  - "BERT and GPT models"
  - "transfer learning with pretrained models"
  - "fine-tuning strategies"
prerequisites: [46, 49]
outcomes:
  - "Understand the attention mechanism and transformer architecture"
  - "Use pretrained models (BERT, GPT) from Hugging Face"
  - "Fine-tune transformers for custom tasks"
  - "Apply transfer learning effectively"
---

# 🎯 Day 58: Transformers & Attention

> *"The architecture behind ChatGPT, BERT, and the AI revolution."*

---

## The "Never-Coded" Bridge

**In 2017, a single paper changed everything:** "Attention Is All You Need"

Before transformers:

- NLP models processed text sequentially (slow)
- Long-range dependencies were lost
- Training took weeks on huge clusters

After transformers:

- **Parallel processing** → 100x faster training
- **Attention** → understands context across entire documents
- **Transfer learning** → pretrained models work out-of-the-box

**Real-world impact:**

**Search engines:**

- **Google BERT (2019)**: Understands search intent better
- "how to catch a cow" → farming advice (not baseball)
- Impact: 10% improvement in search quality

**Customer service:**

- **Chatbots**: Understand complex queries
- Before: "Sorry, I don't understand"
- After: Context-aware, helpful responses

**Content creation:**

- **GPT-3/4**: Write articles, code, emails
- **GitHub Copilot**: Autocomplete entire functions
- Productivity boost: 40-55% faster coding

**Translation:**

- **DeepL, Google Translate**: Near-human quality
- Transformers understand idioms, context
- Error rate: 60% reduction vs older models

**The business transformation:**

- OpenAI: $29B valuation (ChatGPT)
- Hugging Face: $4.5B valuation (model hub)
- Every major tech company building transformer models

---

## The Technical Deep Dive

### The Attention Mechanism

**Problem with RNNs:** Information bottleneck

```python
# RNN: Compress entire sentence into single vector
sentence = "The cat sat on the mat"
hidden_state = RNN(sentence)  # Single 512D vector
# Information from "cat" and "mat" compressed → loss

# Transformer: Every word attends to every other word
# "sat" knows it relates to "cat" and "mat"
```

**Attention formula:**

```
Attention(Q, K, V) = softmax(QK^T / √d_k) × V

Q = Query: "What am I looking for?"
K = Key: "What do I contain?"
V = Value: "What information do I have?"
```

**Intuitive example:**

```python
import numpy as np

# Sentence: "The cat sat on the mat"
words = ["The", "cat", "sat", "on", "the", "mat"]

# Simplified attention (real transformers use learned matrices)
# For word "sat", compute attention to all words

def simple_attention(query_word, all_words):
    """
    Compute how much 'query_word' should attend to each word.
    """
    # Simplified: based on position distance
    query_idx = all_words.index(query_word)
    
    scores = []
    for i, word in enumerate(all_words):
        # Closer words get higher attention
        distance = abs(i - query_idx)
        score = 1 / (1 + distance)
        scores.append(score)
    
    # Softmax: normalize to probabilities
    scores = np.array(scores)
    attention_weights = np.exp(scores) / np.sum(np.exp(scores))
    
    return attention_weights

# Attention for "sat"
sat_attention = simple_attention("sat", words)

print("=== Attention weights for 'sat' ===")
for word, weight in zip(words, sat_attention):
    print(f"{word}: {weight:.3f}")

# Output shows "sat" attends mostly to nearby words
# Real transformers learn these patterns from data
```

**Self-Attention Implementation:**

```python
import torch
import torch.nn as nn
import torch.nn.functional as F

class SelfAttention(nn.Module):
    def __init__(self, embed_dim, num_heads=8):
        super().__init__()
        self.embed_dim = embed_dim
        self.num_heads = num_heads
        self.head_dim = embed_dim // num_heads
        
        assert self.head_dim * num_heads == embed_dim, "embed_dim must be divisible by num_heads"
        
        # Linear transformations for Q, K, V
        self.query = nn.Linear(embed_dim, embed_dim)
        self.key = nn.Linear(embed_dim, embed_dim)
        self.value = nn.Linear(embed_dim, embed_dim)
        
        self.fc_out = nn.Linear(embed_dim, embed_dim)
    
    def forward(self, x):
        # x shape: (batch_size, seq_length, embed_dim)
        batch_size, seq_length, embed_dim = x.shape
        
        # Generate Q, K, V
        Q = self.query(x)  # (batch, seq_len, embed_dim)
        K = self.key(x)
        V = self.value(x)
        
        # Split into multiple heads
        Q = Q.view(batch_size, seq_length, self.num_heads, self.head_dim).transpose(1, 2)
        K = K.view(batch_size, seq_length, self.num_heads, self.head_dim).transpose(1, 2)
        V = V.view(batch_size, seq_length, self.num_heads, self.head_dim).transpose(1, 2)
        # Now: (batch, num_heads, seq_len, head_dim)
        
        # Scaled dot-product attention
        scores = torch.matmul(Q, K.transpose(-2, -1)) / (self.head_dim ** 0.5)
        # scores: (batch, num_heads, seq_len, seq_len)
        
        attention_weights = F.softmax(scores, dim=-1)
        
        # Apply attention to values
        attended = torch.matmul(attention_weights, V)
        # attended: (batch, num_heads, seq_len, head_dim)
        
        # Concatenate heads
        attended = attended.transpose(1, 2).contiguous().view(batch_size, seq_length, embed_dim)
        
        # Final linear layer
        output = self.fc_out(attended)
        
        return output, attention_weights

# Example usage
batch_size, seq_length, embed_dim = 2, 10, 512
x = torch.randn(batch_size, seq_length, embed_dim)

attention_layer = SelfAttention(embed_dim, num_heads=8)
output, weights = attention_layer(x)

print(f"Input shape: {x.shape}")
print(f"Output shape: {output.shape}")
print(f"Attention weights shape: {weights.shape}")
```

### Transformer Architecture

**Full transformer block:**

```python
class TransformerBlock(nn.Module):
    def __init__(self, embed_dim, num_heads, ff_dim, dropout=0.1):
        super().__init__()
        
        # Multi-head self-attention
        self.attention = SelfAttention(embed_dim, num_heads)
        
        # Feed-forward network
        self.ffn = nn.Sequential(
            nn.Linear(embed_dim, ff_dim),
            nn.ReLU(),
            nn.Linear(ff_dim, embed_dim)
        )
        
        # Layer normalization
        self.ln1 = nn.LayerNorm(embed_dim)
        self.ln2 = nn.LayerNorm(embed_dim)
        
        # Dropout
        self.dropout = nn.Dropout(dropout)
    
    def forward(self, x):
        # Self-attention with residual connection
        attn_output, _ = self.attention(x)
        x = self.ln1(x + self.dropout(attn_output))
        
        # Feed-forward with residual connection
        ffn_output = self.ffn(x)
        x = self.ln2(x + self.dropout(ffn_output))
        
        return x

# Stack multiple transformer blocks
class TransformerEncoder(nn.Module):
    def __init__(self, vocab_size, embed_dim=512, num_heads=8, num_layers=6, ff_dim=2048, max_len=512):
        super().__init__()
        
        # Token embeddings
        self.token_embedding = nn.Embedding(vocab_size, embed_dim)
        
        # Positional embeddings
        self.position_embedding = nn.Embedding(max_len, embed_dim)
        
        # Transformer blocks
        self.blocks = nn.ModuleList([
            TransformerBlock(embed_dim, num_heads, ff_dim)
            for _ in range(num_layers)
        ])
        
        self.dropout = nn.Dropout(0.1)
    
    def forward(self, x):
        # x: (batch, seq_len) of token indices
        batch_size, seq_len = x.shape
        
        # Token embeddings
        token_emb = self.token_embedding(x)  # (batch, seq_len, embed_dim)
        
        # Positional embeddings
        positions = torch.arange(0, seq_len, device=x.device).unsqueeze(0).expand(batch_size, -1)
        pos_emb = self.position_embedding(positions)
        
        # Combine
        x = self.dropout(token_emb + pos_emb)
        
        # Pass through transformer blocks
        for block in self.blocks:
            x = block(x)
        
        return x

# Example
vocab_size = 10000
model = TransformerEncoder(vocab_size, embed_dim=512, num_layers=6)

# Input: batch of token sequences
token_ids = torch.randint(0, vocab_size, (4, 50))  # batch=4, seq_len=50
output = model(token_ids)

print(f"Transformer output shape: {output.shape}")  # (4, 50, 512)
```

### Using Pretrained Models: Hugging Face Transformers

**The ecosystem:**

```python
from transformers import pipeline

# 1. Sentiment Analysis
sentiment_analyzer = pipeline("sentiment-analysis")
result = sentiment_analyzer("I love machine learning!")
print(result)  # [{'label': 'POSITIVE', 'score': 0.9998}]

# 2. Named Entity Recognition
ner = pipeline("ner", grouped_entities=True)
entities = ner("Apple Inc. is headquartered in Cupertino, California.")
print(entities)
# [{'entity_group': 'ORG', 'word': 'Apple Inc.', ...},
#  {'entity_group': 'LOC', 'word': 'Cupertino', ...}]

# 3. Question Answering
qa = pipeline("question-answering")
context = "Paris is the capital of France. It has a population of 2.2 million."
question = "What is the capital of France?"
answer = qa(question=question, context=context)
print(answer)  # {'answer': 'Paris', 'score': 0.98}

# 4. Text Generation
generator = pipeline("text-generation", model="gpt2")
generated = generator("Machine learning is", max_length=50, num_return_sequences=2)
for i, text in enumerate(generated):
    print(f"\nGeneration {i+1}: {text['generated_text']}")

# 5. Summarization
summarizer = pipeline("summarization")
article = """Long article text here..."""
summary = summarizer(article, max_length=130, min_length=30)
print(summary)

# 6. Translation
translator = pipeline("translation_en_to_fr")
french = translator("Hello, how are you?")
print(french)  # [{'translation_text': 'Bonjour, comment allez-vous?'}]
```

### BERT: Bidirectional Encoder

**Use case: Text classification, Q&A, NER**

```python
from transformers import BertTokenizer, BertForSequenceClassification, Trainer, TrainingArguments
import torch
from torch.utils.data import Dataset

# Load pretrained BERT
model_name = "bert-base-uncased"
tokenizer = BertTokenizer.from_pretrained(model_name)
model = BertForSequenceClassification.from_pretrained(model_name, num_labels=2)

# Prepare data
texts = [
    "This movie was amazing!",
    "Terrible waste of time.",
    "Absolutely loved it!",
    "Boring and predictable."
]
labels = [1, 0, 1, 0]  # 1 = positive, 0 = negative

# Tokenize
encodings = tokenizer(texts, truncation=True, padding=True, max_length=128, return_tensors="pt")

# Create dataset
class SentimentDataset(Dataset):
    def __init__(self, encodings, labels):
        self.encodings = encodings
        self.labels = labels
    
    def __len__(self):
        return len(self.labels)
    
    def __getitem__(self, idx):
        item = {key: val[idx] for key, val in self.encodings.items()}
        item['labels'] = torch.tensor(self.labels[idx])
        return item

dataset = SentimentDataset(encodings, labels)

# Training arguments
training_args = TrainingArguments(
    output_dir="./results",
    num_train_epochs=3,
    per_device_train_batch_size=2,
    warmup_steps=10,
    weight_decay=0.01,
    logging_dir="./logs",
)

# Trainer
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=dataset,
)

# Fine-tune
trainer.train()

# Inference
test_text = "This is an excellent product!"
test_encoding = tokenizer(test_text, return_tensors="pt", truncation=True, padding=True)

with torch.no_grad():
    outputs = model(**test_encoding)
    predictions = torch.nn.functional.softmax(outputs.logits, dim=-1)
    predicted_label = torch.argmax(predictions, dim=-1).item()

print(f"Text: {test_text}")
print(f"Sentiment: {'Positive' if predicted_label == 1 else 'Negative'}")
print(f"Confidence: {predictions[0][predicted_label]:.2%}")
```

### GPT: Generative Pretrained Transformer

**Use case: Text generation, completion**

```python
from transformers import GPT2LMHeadModel, GPT2Tokenizer

# Load GPT-2
model_name = "gpt2"
tokenizer = GPT2Tokenizer.from_pretrained(model_name)
model = GPT2LMHeadModel.from_pretrained(model_name)

# Set pad token
tokenizer.pad_token = tokenizer.eos_token

# Generate text
prompt = "In the year 2050, artificial intelligence"
input_ids = tokenizer.encode(prompt, return_tensors="pt")

# Generate with sampling
output = model.generate(
    input_ids,
    max_length=100,
    num_return_sequences=3,
    temperature=0.8,  # Controls randomness (0.1 = conservative, 1.5 = creative)
    top_k=50,  # Sample from top 50 tokens
    top_p=0.95,  # Nucleus sampling
    do_sample=True
)

print("=== GPT-2 Generations ===")
for i, generated_sequence in enumerate(output):
    text = tokenizer.decode(generated_sequence, skip_special_tokens=True)
    print(f"\nGeneration {i+1}:")
    print(text)
```

---

## Senior-Level Insights

### Transformer vs RNN/LSTM

| Aspect              | RNN/LSTM                        | Transformer                       |
| ------------------- | ------------------------------- | --------------------------------- |
| **Parallelization** | Sequential (slow)               | Parallel (fast)                   |
| **Long-range**      | Vanishing gradients             | Attention (no limit)              |
| **Training time**   | Days/weeks                      | Hours/days                        |
| **Memory**          | O(seq_len)                      | O(seq_len²) attention matrix      |
| **Best for**        | Small datasets, online learning | Large datasets, pretrained models |

### BERT vs GPT

| Feature          | BERT                                | GPT                              |
| ---------------- | ----------------------------------- | -------------------------------- |
| **Architecture** | Encoder-only (bidirectional)        | Decoder-only (unidirectional)    |
| **Training**     | Masked language modeling            | Next-token prediction            |
| **Use case**     | Understanding (classification, Q&A) | Generation (writing, completion) |
| **Context**      | Sees full sentence                  | Sees only previous tokens        |

### Fine-Tuning Strategies

```python
strategies = {
    "Feature extraction": {
        "Method": "Freeze pretrained layers, train only classifier head",
        "Data needed": "100-1000 examples",
        "Speed": "Fast",
        "Use when": "Very limited data, task similar to pretraining"
    },
    "Fine-tuning top layers": {
        "Method": "Freeze bottom layers, train top layers + head",
        "Data needed": "1000-10000 examples",
        "Speed": "Medium",
        "Use when": "Moderate data, some domain shift"
    },
    "Full fine-tuning": {
        "Method": "Train all layers (with low LR)",
        "Data needed": "10000+ examples",
        "Speed": "Slow",
        "Use when": "Lots of data, significant domain shift"
    }
}
```

### Attention Patterns Visualization

Different heads learn different patterns:

```
Head 1: Syntax (subject-verb agreement)
    "The cat [attends to] sat"
    
Head 2: Coreference
    "John went to the store. [He attends to John] bought milk."
    
Head 3: Position
    Adjacent words attend strongly

Ensemble of heads → Rich understanding
```

---

## Hands-on Lab

### Exercise 1: Sentiment Analysis with BERT

```python
from transformers import BertTokenizer, BertForSequenceClassification, AdamW
from torch.utils.data import DataLoader
import torch

# Prepare larger dataset
train_texts = [
    "This product exceeded my expectations!",
    "Waste of money, very disappointed.",
    "Amazing quality, highly recommend!",
    # ... (add more examples)
]
train_labels = [1, 0, 1, ...]  # 1=positive, 0=negative

# Tokenize
tokenizer = BertTokenizer.from_pretrained("bert-base-uncased")
train_encodings = tokenizer(train_texts, truncation=True, padding=True, max_length=128)

# Dataset
class ReviewDataset(torch.utils.data.Dataset):
    def __init__(self, encodings, labels):
        self.encodings = encodings
        self.labels = labels
    
    def __getitem__(self, idx):
        item = {key: torch.tensor(val[idx]) for key, val in self.encodings.items()}
        item['labels'] = torch.tensor(self.labels[idx])
        return item
    
    def __len__(self):
        return len(self.labels)

train_dataset = ReviewDataset(train_encodings, train_labels)
train_loader = DataLoader(train_dataset, batch_size=8, shuffle=True)

# Model
model = BertForSequenceClassification.from_pretrained("bert-base-uncased", num_labels=2)
optimizer = AdamW(model.parameters(), lr=2e-5)

# Training loop
model.train()
for epoch in range(3):
    total_loss = 0
    for batch in train_loader:
        optimizer.zero_grad()
        
        outputs = model(
            input_ids=batch['input_ids'],
            attention_mask=batch['attention_mask'],
            labels=batch['labels']
        )
        
        loss = outputs.loss
        loss.backward()
        optimizer.step()
        
        total_loss += loss.item()
    
    print(f"Epoch {epoch+1}, Loss: {total_loss/len(train_loader):.4f}")

# Save model
model.save_pretrained("./sentiment_model")
tokenizer.save_pretrained("./sentiment_model")
```

---

### Exercise 2: Text Generation with GPT-2 Fine-Tuning

```python
from transformers import GPT2LMHeadModel, GPT2Tokenizer, TextDataset, DataCollatorForLanguageModeling
from transformers import Trainer, TrainingArguments

# Prepare custom text data
with open("custom_text.txt", "w") as f:
    f.write("""
    Machine learning is transforming industries.
    Deep learning models can recognize patterns in data.
    Neural networks are inspired by the human brain.
    # ... (add more domain-specific text)
    """)

# Load GPT-2
model = GPT2LMHeadModel.from_pretrained("gpt2")
tokenizer = GPT2Tokenizer.from_pretrained("gpt2")
tokenizer.pad_token = tokenizer.eos_token

# Prepare dataset
train_dataset = TextDataset(
    tokenizer=tokenizer,
    file_path="custom_text.txt",
    block_size=128
)

data_collator = DataCollatorForLanguageModeling(
    tokenizer=tokenizer,
    mlm=False  # GPT uses causal LM, not masked LM
)

# Training arguments
training_args = TrainingArguments(
    output_dir="./gpt2-finetuned",
    overwrite_output_dir=True,
    num_train_epochs=3,
    per_device_train_batch_size=4,
    save_steps=500,
    save_total_limit=2,
)

# Trainer
trainer = Trainer(
    model=model,
    args=training_args,
    data_collator=data_collator,
    train_dataset=train_dataset,
)

# Fine-tune
trainer.train()

# Generate with fine-tuned model
prompt = "Machine learning"
input_ids = tokenizer.encode(prompt, return_tensors="pt")

output = model.generate(
    input_ids,
    max_length=100,
    temperature=0.7,
    num_return_sequences=1
)

generated_text = tokenizer.decode(output[0], skip_special_tokens=True)
print(f"Generated: {generated_text}")
```

---

### Exercise 3: Question Answering System

```python
from transformers import pipeline

# Load QA model
qa_pipeline = pipeline("question-answering", model="distilbert-base-cased-distilled-squad")

# Custom knowledge base
knowledge_base = """
DeepMind is an artificial intelligence research laboratory. 
It was founded in 2010 and acquired by Google in 2014 for $500 million.
DeepMind is known for creating AlphaGo, which defeated world champion Go player Lee Sedol in 2016.
The company focuses on artificial general intelligence and has made breakthroughs in protein folding with AlphaFold.
"""

# Ask questions
questions = [
    "When was DeepMind founded?",
    "Who acquired DeepMind?",
    "What is DeepMind known for?",
    "What did AlphaGo do in 2016?"
]

print("=== Question Answering System ===")
for question in questions:
    result = qa_pipeline(question=question, context=knowledge_base)
    print(f"\nQ: {question}")
    print(f"A: {result['answer']} (confidence: {result['score']:.2%})")
```

---

## Mastery Check

### Question 1: Why Attention Over RNNs?

Transformers replaced RNNs for most NLP tasks. Why is attention better?

<details>
<summary>Click for Answer</summary>

**Answer:** Attention enables **parallel processing** (faster training), handles **long-range dependencies** without vanishing gradients, and provides **interpretability** through attention weights.

**Key advantages:**

**1. Parallelization**

```python
# RNN: Must process sequentially
h1 = RNN(word1)
h2 = RNN(word2, h1)  # Depends on h1
h3 = RNN(word3, h2)  # Depends on h2
# Can't parallelize → slow

# Transformer: All positions simultaneously
all_outputs = Attention(all_words)  # Parallel!
# 100x faster training
```

**2. Long-range dependencies**

```
RNN problem: "Vanishing gradient"
Sentence: "The keys, which were left on the kitchen table yesterday, are missing."

RNN: By the time we reach "are", information about "keys" has faded
→ Struggles with subject-verb agreement

Transformer: "are" directly attends to "keys"
→ No information loss, any distance
```

**3. No bottleneck**

```
RNN: Entire sentence → single hidden state (1024D vector)
→ Information compressed/lost

Transformer: Each word has full representation
→ No compression, preserves all information
```

**4. Interpretability**

```python
# Visualize attention weights
# Can see which words the model focuses on

"The cat sat on the mat"
# For "sat", attention shows:
#   cat: 0.4  ← High attention (subject)
#   on: 0.3   ← Medium (preposition)
#   mat: 0.2  ← Medium (object)

# Helps debug and understand model decisions
```

**When RNNs are still better:**

- **Online/streaming**: Process one token at a time
- **Very long sequences**: Attention is O(n²), RNN is O(n)
- **Small data**: Transformers need lots of data to train

</details>

---

### Question 2: BERT vs GPT

Both use transformers but are trained differently. When should you use BERT vs GPT?

<details>
<summary>Click for Answer</summary>

**Answer:** Use **BERT** for understanding tasks (classification, Q&A, NER) where bidirectional context helps. Use **GPT** for generation tasks (writing, completion, chatbots) where left-to-right decoding is natural.

**Architecture differences:**

**BERT (Encoder-only):**

```
Training: Masked Language Modeling
Sentence: "The [MASK] sat on the mat"
Model must predict: cat

Can see BOTH directions:
← looks at "The"
→ looks at "on the mat"

Learns bidirectional representations
```

**GPT (Decoder-only):**

```
Training: Next-token prediction
Sentence: "The cat sat"
Model predicts: "on"

Can only see LEFT (previous tokens):
← looks at "The cat sat"
→ cannot look ahead

Learns causal (left-to-right) generation
```

**Use cases:**

**BERT → Understanding:**

```python
# 1. Classification
"This movie is terrible" → Negative sentiment
# Needs full sentence context

# 2. Named Entity Recognition
"Apple CEO Tim Cook" → [ORG, PERSON]
# "Apple" meaning depends on "CEO" (right context)

# 3. Question Answering
Context: "Paris is the capital of France"
Question: "What is the capital of France?"
Answer: "Paris"
# Must understand question AND context

# 4. Search/Retrieval
Query: "python programming"
Document: "Guide to Python for beginners"
# Match query intent to document meaning
```

**GPT → Generation:**

```python
# 1. Text completion
Input: "Once upon a time"
Output: "there was a brave knight who..."

# 2. Chatbots
User: "How do I fix my code?"
GPT: "Sure, I can help. What's the error message?"

# 3. Code generation
Prompt: "Function to reverse a string"
Output: "def reverse_string(s): return s[::-1]"

# 4. Creative writing
Prompt: "Write a poem about AI"
Output: [generates poem]
```

**Can't use GPT for classification?**

```
Actually, you can! But it's inefficient:

GPT classification (via prompting):
"Classify sentiment: 'This movie is terrible'"
→ Generate: "Negative"
→ Works, but slow and wasteful

BERT classification:
Direct prediction: input → [0.1, 0.9] → Negative
→ Much faster, more accurate
```

**Modern trend: Instruction-tuned models**

```
ChatGPT, Claude, GPT-4:
- Based on GPT (generation architecture)
- But fine-tuned to follow instructions
- Can do BOTH understanding and generation

"Summarize this article" → understanding
"Write a story" → generation

Best of both worlds!
```

</details>

---

### Question 3: Fine-Tuning Data Requirements

You have a pretrained BERT model. How much labeled data do you need to fine-tune it for your custom task?

<details>
<summary>Click for Answer</summary>

**Answer:** **50-1000 examples** for simple tasks with feature extraction; **1000-10000** for domain-specific fine-tuning; **10000+** for complex tasks or significant domain shift.

**Data requirements by approach:**

**1. Feature extraction (50-500 examples)**

```python
# Freeze BERT, train only final classifier
for param in bert_model.parameters():
    param.requires_grad = False

classifier = nn.Linear(768, num_classes)
# Only train classifier → needs few examples

# When to use:
# - Very limited data
# - Task similar to pretraining (general language understanding)
# - Fast experimentation
```

**2. Partial fine-tuning (500-5000 examples)**

```python
# Freeze early layers, train top layers
for param in bert_model.bert.encoder.layer[:8].parameters():
    param.requires_grad = False

# Train layers 9-12 + classifier

# When to use:
# - Moderate data
# - Some domain difference (e.g., medical texts)
```

**3. Full fine-tuning (5000-50000+ examples)**

```python
# Train all layers (with low learning rate)
optimizer = AdamW(bert_model.parameters(), lr=2e-5)

# When to use:
# - Lots of data
# - Significant domain shift (legal, medical, code)
# - Complex task
```

**Examples by task:**

**Sentiment analysis (binary):**

- 100 examples: 75-80% accuracy (feature extraction)
- 1000 examples: 85-90% accuracy (light fine-tuning)
- 10000 examples: 92-95% accuracy (full fine-tuning)

**Named Entity Recognition:**

- 500 examples: 60-70% F1
- 5000 examples: 80-85% F1
- 50000 examples: 90-93% F1 (near SOTA)

**Domain-specific Q&A:**

- 1000 Q&A pairs: Basic performance
- 10000 pairs: Good performance
- 100000 pairs: SOTA

**Data efficiency tricks:**

**1. Data augmentation**

```python
# Back-translation
"Great product!" 
→ translate to French → translate back to English
→ "Excellent product!"
# 2x data for free

# Synonym replacement
"This movie is amazing"
→ "This film is incredible"
```

**2. Semi-supervised learning**

```python
# Use unlabeled data for pretraining on domain
# medical_texts (1M unlabeled) → pretrain BERT
# medical_labels (1k labeled) → fine-tune
# Better than using general BERT with 1k labels
```

**3. Few-shot prompting (GPT-3+)**

```
# Doesn't require fine-tuning!
Prompt: """
Classify sentiment:
"I love this!" → Positive
"Terrible experience" → Negative
"Pretty good" → Positive
"This product is amazing" → ?
"""
→ Model answers: "Positive"

# Works with 0-10 examples (no training!)
```

**Rule of thumb:**

```
Examples needed ≈ num_classes × 50-500

Binary classification: 100-1000
10 classes: 500-5000  
100 classes: 5000-50000
```

</details>

---

### Question 4: Positional Encodings

Transformers have no inherent notion of word order. How do they know "dog bit man" ≠ "man bit dog"?

<details>
<summary>Click for Answer</summary>

**Answer:** **Positional encodings** add position information to word embeddings, either through fixed sinusoidal functions (original transformers) or learned embeddings (BERT, GPT).

**The problem:**

```python
# Attention mechanism is permutation-invariant
sentence1 = ["dog", "bit", "man"]
sentence2 = ["man", "bit", "dog"]

# Without position info:
attention(sentence1) == attention(sentence2)
# Model can't distinguish order!
```

**Solution 1: Sinusoidal positional encoding (original Transformer)**

```python
import numpy as np
import matplotlib.pyplot as plt

def positional_encoding(seq_len, d_model):
    """
    Generate sinusoidal positional encodings.
    
    PE(pos, 2i) = sin(pos / 10000^(2i/d_model))
    PE(pos, 2i+1) = cos(pos / 10000^(2i/d_model))
    """
    position = np.arange(seq_len)[:, np.newaxis]
    div_term = np.exp(np.arange(0, d_model, 2) * -(np.log(10000.0) / d_model))
    
    pe = np.zeros((seq_len, d_model))
    pe[:, 0::2] = np.sin(position * div_term)
    pe[:, 1::2] = np.cos(position * div_term)
    
    return pe

# Visualize
pe = positional_encoding(seq_len=100, d_model=128)

plt.figure(figsize=(12, 8))
plt.imshow(pe.T, cmap='RdBu', aspect='auto')
plt.colorbar()
plt.xlabel('Position')
plt.ylabel('Embedding Dimension')
plt.title('Sinusoidal Positional Encodings')
plt.show()

# Each position has unique pattern
# Nearby positions have similar encodings (smooth)
```

**Why sinusoids?**

```
1. Deterministic (no learning needed)
2. Generalizes to longer sequences than training
3. Relative position: PE(pos+k) is linear function of PE(pos)
   → Model can learn "3 words to the right

"
```

**Solution 2: Learned positional embeddings (BERT, GPT)**

```python
class PositionalEmbedding(nn.Module):
    def __init__(self, max_len, d_model):
        super().__init__()
        # Learnable position embeddings
        self.position_embeddings = nn.Embedding(max_len, d_model)
    
    def forward(self, x):
        batch_size, seq_len = x.shape
        positions = torch.arange(seq_len, device=x.device).unsqueeze(0).expand(batch_size, -1)
        return self.position_embeddings(positions)

# Combined with token embeddings
class TransformerEmbedding(nn.Module):
    def __init__(self, vocab_size, d_model, max_len):
        super().__init__()
        self.token_emb = nn.Embedding(vocab_size, d_model)
        self.pos_emb = PositionalEmbedding(max_len, d_model)
    
    def forward(self, tokens):
        # tokens: (batch, seq_len)
        token_embeddings = self.token_emb(tokens)  # (batch, seq_len, d_model)
        position_embeddings = self.pos_emb(tokens)
        
        # Add together
        return token_embeddings + position_embeddings
```

**Advantages of learned embeddings:**

- Can adapt to data patterns
- Often slightly better accuracy

**Disadvantages:**

- Can't generalize beyond max_len seen in training
- Requires learning (more parameters)

**How it distinguishes order:**

```python
# Example
words = ["dog", "bit", "man"]

# Token embeddings (same for both sentences)
dog_emb = [0.2, 0.5, ...]
bit_emb = [0.1, 0.3, ...]
man_emb = [0.4, 0.2, ...]

# Positional embeddings
pos_0 = [0.1, 0.0, ...]
pos_1 = [0.0, 0.1, ...]
pos_2 = [-0.1, 0.0, ...]

# "dog bit man"
final_dog = dog_emb + pos_0  # Position 0
final_bit = bit_emb + pos_1  # Position 1
final_man = man_emb + pos_2  # Position 2

# "man bit dog"  
final_man_v2 = man_emb + pos_0  # Position 0 (different!)
final_bit_v2 = bit_emb + pos_1  # Position 1
final_dog_v2 = dog_emb + pos_2  # Position 2

# Now attention sees different representations
# Can distinguish order!
```

**Modern alternatives:**

**Relative positional encoding (Transformer-XL, T5):**

```python
# Instead of absolute positions (0, 1, 2, ...)
# Encode relative distances (-2, -1, 0, +1, +2)

# Benefit: Better for long sequences
# "Word 5 is 2 positions before word 7" (generalizes to any length)
```

**Rotary Position Embeddings (RoPE)** (used in GPT-4, LLaMA):

```python
# Rotate query and key vectors based on position
# More efficient, better extrapolation to longer sequences
```

</details>

---

### Question 5: Production Serving

Your BERT model takes 500ms per inference (too slow for production). How do you speed it up?

<details>
<summary>Click for Answer</summary>

**Answer:** Use **model distillation** (DistilBERT), **quantization** (INT8), **ONNX Runtime** for optimized inference, or **batch processing**. Target: <100ms latency.

**Optimization strategies:**

**1. Model distillation (2-3x faster)**

```python
# DistilBERT: 97% of BERT's performance, 40% smaller, 60% faster
from transformers import DistilBertForSequenceClassification

# Replace
model = BertForSequenceClassification.from_pretrained("bert-base-uncased")
# With
model = DistilBertForSequenceClassification.from_pretrained("distilbert-base-uncased")

# Latency: 500ms → 200ms
```

**How distillation works:**

```python
# Train small "student" model to mimic large "teacher"
teacher_output = bert_large.predict(x)  # Soft labels
student_loss = KL_divergence(student_output, teacher_output)

# Student learns from teacher's knowledge, not just hard labels
```

**2. Quantization (2-4x faster)**

```python
# Convert FP32 → INT8 (4x smaller, faster)
from transformers import AutoModelForSequenceClassification
import torch

model = AutoModelForSequenceClassification.from_pretrained("bert-base-uncased")

# Dynamic quantization
quantized_model = torch.quantization.quantize_dynamic(
    model,
    {torch.nn.Linear},  # Quantize linear layers
    dtype=torch.qint8
)

# Latency: 500ms → 200ms
# Accuracy drop: <1%
```

**3. ONNX Runtime (1.5-2x faster)**

```python
# Convert to ONNX format for optimized inference
from transformers import AutoTokenizer
from optimum.onnxruntime import ORTModelForSequenceClassification

# Convert
model = ORTModelForSequenceClassification.from_pretrained(
    "bert-base-uncased",
    from_transformers=True
)

# Inference with ONNX Runtime
# Latency: 500ms → 250ms
```

**4. Reduce sequence length**

```python
# Longer sequences = more computation (quadratic in attention)

# Before: max_length=512
tokenizer(text, max_length=512)  # 500ms

# After: max_length=128 (if task allows)
tokenizer(text, max_length=128)  # 125ms (4x faster)

# Attention complexity: O(seq_len²)
# 512² / 128² = 16x speedup in attention!
```

**5. Batch processing**

```python
# Process multiple requests together

# Sequential: 500ms × 10 requests = 5000ms
for text in texts:
    model.predict(text)

# Batched: 800ms for 10 requests (6x faster)
batch = tokenizer(texts, padding=True, truncation=True)
model.predict(batch)

# GPU utilization: 20% → 90%
```

**6. Caching**

```python
# Cache frequent queries
from functools import lru_cache

@lru_cache(maxsize=10000)
def predict_sentiment(text):
    return model.predict(text)

# Repeated queries: 500ms → 0.1ms (cache hit)
```

**7. Model pruning**

```python
# Remove unimportant weights
from transformers import BertForSequenceClassification
import torch.nn.utils.prune as prune

# Prune 30% of weights
for module in model.modules():
    if isinstance(module, torch.nn.Linear):
        prune.l1_unstructured(module, name='weight', amount=0.3)

# Latency: 500ms → 350ms
# Accuracy: -1% to -2%
```

**8. Specialized hardware**

```python
# CPU → GPU: 500ms → 50ms (10x)
model.to('cuda')

# GPU → TPU/custom chips: Even faster

# Cost vs speed trade-off
```

**Production architecture:**

```
Request → Load Balancer
           ↓
       [Model Serving Cluster]
       ├─ Server 1 (DistilBERT + ONNX + INT8)
       ├─ Server 2 (with GPU)
       └─ Server 3
           ↓
       Cache (Redis)
           ↓
       Response (<100ms)
```

**Latency budget example:**

```
Target: 100ms end-to-end

Breakdown:
- Network: 10ms
- Tokenization: 5ms
- Model inference: 50ms (optimized from 500ms!)
- Post-processing: 5ms
- Response: 10ms
Total: 80ms ✓

Achieved via:
- DistilBERT (2x speedup)
- ONNX Runtime (1.5x speedup)
- INT8 quantization (1.5x speedup)
- max_length=128 (2x speedup)
Combined: ~9x speedup (500ms → 55ms)
```

**Monitor in production:**

```python
metrics = {
    "p50_latency": "45ms",
    "p95_latency": "90ms",
    "p99_latency": "150ms",
    "throughput": "200 req/sec",
    "accuracy": "92.5%"
}

# Alert if p95 > 100ms or accuracy < 90%
```

</details>

---

## Summary

Today you learned:

- ✅ Self-attention computes relationships between all words in parallel
- ✅ Transformers replaced RNNs with faster, more effective architecture
- ✅ BERT (bidirectional) excels at understanding tasks
- ✅ GPT (causal) excels at generation tasks
- ✅ Hugging Face Transformers provides easy access to pretrained models
- ✅ Fine-tuning requires 100-10000+ examples depending on task complexity
- ✅ Production optimization: distillation, quantization, ONNX, batching

**Tomorrow**: Generative Models—GANs, VAEs, and modern diffusion models for creating realistic images and data.
