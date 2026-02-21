---
day: 72
title: "Multimodal AI"
phase: 6
phaseTitle: "Cutting-Edge ML"
slug: "multimodal-ai"
duration: 120
difficulty: "advanced"
tags:
  - multimodal
  - vision-language
  - gpt-4v
  - gemini
  - document-ai
concepts:
  - "vision-language models (VLMs)"
  - "image embeddings"
  - "document understanding"
  - "cross-modal retrieval"
  - "multimodal RAG"
prerequisites:
  - "Day 47: CNNs (image features)"
  - "Day 58: Transformers & Attention"
  - "Day 71: RAG & Vector Databases"
outcomes:
  - "Send images to GPT-4o and Gemini Vision APIs"
  - "Extract structured data from document images"
  - "Build a multimodal RAG pipeline"
---

# 🎨 Day 72: Multimodal AI

> *"The world is not made of text. 80% of enterprise data lives in PDFs, images, spreadsheets, and videos. Multimodal AI finally lets you process all of it."*

---

## The "Never-Coded" Bridge

**When you interview a candidate, what do you learn from?**

- Their **resume** (text)
- Their **spoken answers** (audio)
- Their **body language** (visual)
- Their **portfolio samples** (images/documents)

A purely text-based AI is like a hiring manager who only reads resumes. A **multimodal AI** is one that can process all four inputs simultaneously — just like a human does.

This is why multimodal is the frontier: real business data isn't just text. It's invoices, charts, scanned contracts, product photos, and dashboards — and now AI can read all of them.

---

## The Technical Deep Dive

### 1. Vision-Language Models (VLMs)

VLMs process both images and text in a unified architecture. The dominant 2026 models:

| Model             | Provider    | Strengths                           |
| ----------------- | ----------- | ----------------------------------- |
| GPT-4o            | OpenAI      | Best overall, real-time audio/video |
| Gemini 1.5 Pro    | Google      | 1M token context, native multimodal |
| Claude 3.5 Sonnet | Anthropic   | Best document understanding         |
| LLaVA-1.6         | Open-source | Run locally, no API needed          |

### 2. Image Input via API

```python
import base64
from openai import OpenAI
from pathlib import Path

client = OpenAI()


def encode_image(image_path: str) -> str:
    """Base64 encode an image for API submission."""
    with open(image_path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")


def analyze_chart(image_path: str, question: str) -> str:
    """Ask a question about a chart or graph image."""
    image_b64 = encode_image(image_path)

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{image_b64}",
                            "detail": "high",  # "low" or "high" resolution
                        },
                    },
                    {"type": "text", "text": question},
                ],
            }
        ],
        max_tokens=500,
    )
    return response.choices[0].message.content


# Example: Analyze a sales dashboard screenshot
answer = analyze_chart(
    "sales_dashboard.png",
    "What is the highest-performing region shown in this chart, and by what percentage does it lead?",
)
print(answer)
```

### 3. Document AI — Extracting Structure from PDFs

```python
import anthropic
import base64

claude = anthropic.Anthropic()


def extract_invoice_data(pdf_image_path: str) -> dict:
    """Extract structured fields from an invoice image."""

    image_b64 = encode_image(pdf_image_path)

    response = claude.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=1024,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": "image/jpeg",
                            "data": image_b64,
                        },
                    },
                    {
                        "type": "text",
                        "text": """Extract the following fields from this invoice.
Return a JSON object with these exact keys:
- invoice_number
- date
- vendor_name
- line_items (list of {description, quantity, unit_price, total})
- subtotal
- tax
- total_amount
- payment_terms

If a field is not visible, use null.""",
                    },
                ],
            }
        ],
    )

    import json

    # Parse the JSON from the response
    text = response.content[0].text
    start = text.find("{")
    end = text.rfind("}") + 1
    return json.loads(text[start:end])


# Usage
invoice_data = extract_invoice_data("vendor_invoice.jpg")
print(f"Total: {invoice_data['total_amount']}")
print(f"Line items: {len(invoice_data['line_items'])}")
```

### 4. Multimodal RAG

Extend your RAG pipeline to handle images alongside text:

```python
from sentence_transformers import SentenceTransformer
import chromadb
from chromadb.utils import embedding_functions

# For multimodal, use CLIP embeddings (image + text in same space)
CLIP_MODEL = "clip-ViT-B-32"

# Index: mix of text chunks and image descriptions
multimodal_docs = [
    # Text documents
    {"content": "Q3 2025 revenue was $42M. Top region: North India.", "type": "text"},
    # Image documents (described by VLM for indexing)
    {
        "content": "Bar chart showing Q3 regional sales. North India: $18M, South: $12M, West: $8M, East: $4M.",
        "type": "image",
        "image_path": "q3_chart.png",
    },
    {
        "content": "Scanned contract showing payment terms of Net-30 with Acme Corp.",
        "type": "document",
        "image_path": "contract.pdf",
    },
]


def index_multimodal_content(docs: list, collection) -> None:
    """Index mixed text and image content."""
    for i, doc in enumerate(docs):
        content = doc["content"]  # Text or VLM-generated image description
        metadata = {"type": doc["type"]}
        if "image_path" in doc:
            metadata["image_path"] = doc["image_path"]

        collection.add(documents=[content], ids=[f"doc_{i}"], metadatas=[metadata])


# Query works the same — embedding space is now shared for text + image descriptions
```

---

## Senior-Level Insights

### The "Context Window as Context" Insight

GPT-4o and Gemini 1.5 Pro support 100K+ token contexts. This means you can:
- Send a **30-page PDF** as a series of images
- Include **multiple charts** in one prompt
- Process an **entire dataset** in a single call

This changes the architecture: for many document analysis tasks, you don't need complex RAG — just send the whole document.

**When RAG is still better**: When your knowledge base has thousands of documents and you need to select the right ones (search > context window for discovery).

### Business Use Cases with Immediate ROI

| Use Case                         | Technique                   | Time Saved                   |
| -------------------------------- | --------------------------- | ---------------------------- |
| Invoice processing               | Document AI (Claude)        | 8 hrs/day → 10 min           |
| Chart understanding in reports   | VLM (GPT-4o)                | Manual analysis → instant    |
| Product photo moderation         | Image classification        | Human review → 95% automated |
| Contract review                  | Document AI                 | 3 hrs/contract → 15 min      |
| Competitive screenshots analysis | VLM + structured extraction | Ad-hoc → systematic          |

---

## Hands-on Lab

### Exercise 1: URL-Based Image Analysis

```python
def analyze_public_image(image_url: str, question: str) -> str:
    """
    Use GPT-4o to analyze an image available at a public URL.
    (No base64 encoding needed for public URLs.)
    """
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "image_url", "image_url": {"url": image_url}},
                    {"type": "text", "text": question},
                ],
            }
        ],
    )
    return response.choices[0].message.content


# Test with a public chart
result = analyze_public_image(
    "https://upload.wikimedia.org/wikipedia/commons/a/a7/Camponotus_flavomarginatus_ant.jpg",
    "Describe what you see in exactly one sentence.",
)
print(result)
```

### Exercise 2: Build a Receipt Scanner

Write a function that takes a receipt image and returns a Python dict with `merchant`, `date`, `items`, and `total`:

```python
def scan_receipt(image_path: str) -> dict:
    """Extract structured data from a receipt photo."""
    # TODO: Encode image to base64
    # TODO: Create a GPT-4o or Claude message with the image
    # TODO: Prompt for structured JSON output
    # TODO: Parse and return the JSON
    pass


# Test
receipt = scan_receipt("restaurant_receipt.jpg")
print(f"Paid ${receipt['total']} at {receipt['merchant']}")
```

### Exercise 3: Multi-Image Comparison

Ask GPT-4o to compare two product images and return which one better matches a description:

```python
def find_best_match(description: str, image_paths: list[str]) -> int:
    """
    Given a text description and a list of images, return the index
    of the image that best matches the description.
    Uses GPT-4o vision.
    """
    # TODO: Encode all images
    # TODO: Build a message with multiple images + the description
    # TODO: Ask the model to pick image 1, 2, or 3
    # TODO: Parse the response and return the index
    pass
```

---

## Mastery Check

**Q1**: What does "multimodal" mean in the context of AI?
<details><summary>Answer</summary>
A model that can process and reason across multiple types of data simultaneously — typically text + images, but also audio, video, and structured data.
</details>

**Q2**: What is the difference between `"detail": "low"` and `"detail": "high"` when sending images to GPT-4o?
<details><summary>Answer</summary>
`low` compresses the image to 512×512, using fewer tokens (85 tokens). `high` processes the image at full resolution with multiple tiles, using more tokens (1000s per image but capturing fine detail). Use `low` for quick summaries, `high` for charts, text in images, or technical drawings.
</details>

**Q3**: Why do we describe images in text before indexing them in a vector database?
<details><summary>Answer</summary>
Standard text embedding models don't understand raw image pixels. By using a VLM to generate a text description of each image, we can embed that description and make it searchable. CLIP-style models embed images and text in the same space natively.
</details>

**Q4**: For a company with 5,000 invoices, would you use VLM + RAG or VLM + long context window? Why?
<details><summary>Answer</summary>
VLM + RAG. A long context window can hold maybe 30–50 invoices. For 5,000, you need to retrieve the relevant ones first, then process them. RAG + semantic search allows you to find the specific invoices matching a query, then process only those with the VLM.
</details>

**Q5**: Name two document types that were previously impossible to automate with text-only LLMs but are now automatable with multimodal AI.
<details><summary>Answer</summary>
(1) Scanned PDFs (no text layer), (2) Handwritten documents, (3) Screenshot-based reports (where data is in images), (4) Technical drawings/schematics, (5) Medical imaging reports with embedded scans.
</details>

---

## Summary

- ✅ **VLMs**: See images, understand documents, process the full richness of enterprise data.
- ✅ **Document AI**: Extract structured fields from invoices, contracts, receipts — at scale.
- ✅ **Multimodal RAG**: Combine image descriptions with text for a unified knowledge base.
- ✅ **High ROI**: Document processing is a $100B+ market that multimodal AI is disrupting.

**Phase 6 Complete!** 🎉 You've built expertise in the cutting edge of ML — from RL to Responsible AI, Fine-Tuning to RAG, and now Multimodal AI.

**Next → Phase 7: BI Analytics, Governance & Modern Data Stack**
