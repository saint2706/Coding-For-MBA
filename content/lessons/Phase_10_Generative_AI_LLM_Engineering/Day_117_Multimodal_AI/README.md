---
day: 117
title: "Multimodal AI — Vision-Language Models, GPT-4V, Gemini Vision"
phase: 10
phaseTitle: "Generative AI & LLM Engineering"
slug: "multimodal-ai"
duration: 90
difficulty: "advanced"
tags:
  - multimodal
  - vision
  - gpt-4v
  - gemini-vision
  - document-intelligence
  - ocr
concepts:
  - "vision-language models (VLMs)"
  - "image understanding"
  - "document intelligence"
  - "base64 image encoding"
  - "structured data extraction from images"
prerequisites:
  - "Day 109: LLM Landscape"
  - "Day 110: Prompt Engineering Mastery"
outcomes:
  - "Use GPT-4o vision to extract structured data from images, charts, and documents"
  - "Build a document intelligence pipeline for invoices, contracts, or financial reports"
  - "Understand the capabilities and limits of vision-language models"
---

# 🎯 Day 117: Multimodal AI — Vision-Language Models

> *"The original LLMs were blind — they could read but not see. Multimodal AI gave them eyes, and suddenly a 50-page PDF with charts becomes just another input."*

---

## The "Never-Coded" Bridge

**Think about how you read an annual report.**

You don't just read the text — you look at the charts, read the tables, check the data in the financial statements, and make sense of the whole picture together. Until 2023, AI couldn't do this.

**Vision-Language Models (VLMs)** can now:

- Read and understand images as naturally as text
- Extract data from charts without OCR
- Understand the layout of forms, invoices, contracts
- Answer questions about photographs, diagrams, or screenshots
- Process "page images" of PDF documents without converting to text first

This unlocks an enormous class of real-world enterprise tasks that were previously impossible to automate.

---

## The Technical Deep Dive

### 1. Sending Images to GPT-4o Vision

```python
import base64
import httpx
from openai import OpenAI

client = OpenAI()

# ─────────────────────────────────────────
# METHOD 1: URL reference (simplest)
# ─────────────────────────────────────────
def analyze_image_url(image_url: str, question: str) -> str:
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": question},
                    {"type": "image_url", "image_url": {"url": image_url}},
                ]
            }
        ],
        max_tokens=500
    )
    return response.choices[0].message.content

# Example: Analyze a public chart
result = analyze_image_url(
    image_url="https://example.com/q3-revenue-chart.png",
    question="What was the revenue trend from Q1 to Q3? Provide specific numbers if visible."
)

# ─────────────────────────────────────────
# METHOD 2: Base64 encoding (for local files / private images)
# ─────────────────────────────────────────
def encode_image_to_base64(image_path: str) -> str:
    with open(image_path, "rb") as f:
        return base64.standard_b64encode(f.read()).decode("utf-8")

def analyze_local_image(image_path: str, question: str, detail: str = "high") -> str:
    """
    detail: "low" = fast, cheap (512px thumbnail)
            "high" = slower, costly (tiles up to 2048×2048) — use for documents
    """
    b64 = encode_image_to_base64(image_path)
    ext = image_path.split(".")[-1].lower()
    media_types = {"jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png", "pdf": "application/pdf"}

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": question},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:{media_types.get(ext, 'image/jpeg')};base64,{b64}",
                            "detail": detail
                        }
                    }
                ]
            }
        ],
        max_tokens=1000
    )
    return response.choices[0].message.content
```

### 2. Document Intelligence Pipeline

```python
import json
from pydantic import BaseModel
from typing import Optional
import instructor

# ─────────────────────────────────────────
# Use case: Extract structured data from invoices
# ─────────────────────────────────────────

class InvoiceLineItem(BaseModel):
    description: str
    quantity: Optional[float]
    unit_price: Optional[float]
    total: Optional[float]

class Invoice(BaseModel):
    invoice_number: Optional[str]
    vendor_name: str
    vendor_address: Optional[str]
    bill_to_name: Optional[str]
    invoice_date: Optional[str]  # YYYY-MM-DD
    due_date: Optional[str]
    line_items: list[InvoiceLineItem]
    subtotal: Optional[float]
    tax_amount: Optional[float]
    total_amount: float
    currency: str = "USD"
    payment_terms: Optional[str]

# Use instructor for guaranteed structured output
patched_client = instructor.from_openai(client)

def extract_invoice_data(image_path: str) -> Invoice:
    """Extract fully structured invoice data from an invoice image."""
    b64 = encode_image_to_base64(image_path)

    invoice = patched_client.chat.completions.create(
        model="gpt-4o",
        response_model=Invoice,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": """Extract all invoice data from this image.
For any field that is not visible or unclear, use null.
Do not guess or estimate values — only extract what is explicitly stated.
Dates must be in YYYY-MM-DD format."""
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{b64}",
                            "detail": "high"
                        }
                    }
                ]
            }
        ]
    )
    return invoice

# Process multiple invoices in batch
def batch_extract_invoices(image_paths: list[str]) -> list[dict]:
    results = []
    for path in image_paths:
        try:
            invoice = extract_invoice_data(path)
            results.append({"file": path, "status": "success", "data": invoice.model_dump()})
        except Exception as e:
            results.append({"file": path, "status": "error", "error": str(e)})
    return results
```

### 3. Chart and Graph Analysis

```python
def analyze_chart(image_path: str) -> dict:
    """Extract structured data from chart images."""
    b64 = encode_image_to_base64(image_path)

    prompt = """
Analyze this chart/graph and extract:
1. Chart type (bar, line, pie, scatter, etc.)
2. Title and axis labels (if present)
3. Data series names
4. All data points you can read with confidence
5. Key trends or insights

Return as JSON:
{
  "chart_type": str,
  "title": str or null,
  "x_label": str or null,
  "y_label": str or null,
  "series": [{"name": str, "data_points": [{"label": str, "value": float}]}],
  "key_insights": [str],
  "confidence": "high|medium|low"
}
"""
    response = client.chat.completions.create(
        model="gpt-4o",
        response_format={"type": "json_object"},
        messages=[{
            "role": "user",
            "content": [
                {"type": "text", "text": prompt},
                {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{b64}", "detail": "high"}}
            ]
        }],
        max_tokens=1000
    )
    return json.loads(response.choices[0].message.content)
```

### 4. Multi-Page Document Processing

```python
# PDF processing: convert pages to images first, then process each
from pdf2image import convert_from_path  # pip install pdf2image poppler

def process_pdf_document(pdf_path: str, max_pages: int = 10) -> list[dict]:
    """
    Process a multi-page PDF document.
    Each page becomes an image that GPT-4o Vision can analyze.
    """
    # Convert PDF pages to PIL Images
    pages = convert_from_path(pdf_path, dpi=150, first_page=1, last_page=max_pages)
    results = []

    for page_num, page_image in enumerate(pages, 1):
        # Convert PIL Image to base64
        import io
        buffer = io.BytesIO()
        page_image.save(buffer, format="JPEG", quality=85)
        b64 = base64.standard_b64encode(buffer.getvalue()).decode()

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": f"Page {page_num} of a financial report. Extract: section headings, key financial figures, tables, and any charts or diagrams (describe what they show)."
                    },
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{b64}", "detail": "high"}}
                ]
            }],
            max_tokens=800
        )
        results.append({
            "page": page_num,
            "content": response.choices[0].message.content
        })

    return results

# After extracting per-page content, synthesize
def synthesize_document_analysis(page_analyses: list[dict]) -> str:
    """Combine per-page analyses into a coherent document summary."""
    combined = "\n\n".join(f"=== PAGE {p['page']} ===\n{p['content']}" for p in page_analyses)
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{
            "role": "system",
            "content": "You are a financial analyst. Synthesize these document pages into a coherent summary with key findings, risks, and opportunities."
        }, {
            "role": "user",
            "content": combined
        }],
        max_tokens=1000
    )
    return response.choices[0].message.content
```

### 5. Vision Capabilities and Limitations

```python
VLM_CAPABILITIES = {
    "excellent": [
        "Reading printed text in images",
        "Understanding charts and graphs (approximate data extraction)",
        "Describing image content (objects, scenes, people)",
        "Reading tables and forms",
        "Understanding flowcharts and diagrams",
        "OCR for clear, well-lit documents",
    ],
    "good": [
        "Reading handwriting (if neat and clear)",
        "Understanding infographics",
        "Extracting data from screenshots (UIs, spreadsheets)",
        "Reading scanned documents (if clean)",
    ],
    "limited": [
        "Counting exact quantities in busy images",
        "Reading very small or blurry text",
        "Precise pixel-level measurements",
        "Reading stylized or artistic fonts",
        "Distinguishing similar colors reliably",
    ],
    "cannot_do": [
        "Real-time video processing (per-frame only)",
        "Audio from video",
        "3D spatial reasoning (depth estimation)",
        "Reading sub-pixel text",
    ]
}

# Cost model for vision
# GPT-4o vision pricing (per image):
# detail="low": 85 tokens (~$0.00021)
# detail="high": 1,105 tokens for a 1024×1024 image (~$0.00276)
# For a 50-page PDF at detail="high": ~$0.14 — cheaper than most OCR services!
```

---

## Senior-Level Insights

### Use Structured Output Extraction (Not Freeform Text)

Always force JSON/Pydantic schema output for document intelligence — never parse freeform text descriptions. An invoice extractor should return `Invoice` objects, not "The invoice appears to be from...". This ensures downstream code can process results reliably and surfaces extraction failures clearly.

### When to Use Vision vs OCR-First Approach

| Approach                    | When to Use                                               |
| --------------------------- | --------------------------------------------------------- |
| Direct vision (GPT-4o)      | Complex layouts, charts, tables, mixed text/image         |
| OCR first, then LLM         | Very long documents (50+ pages), pure text pages          |
| Azure Document Intelligence | Enterprise-scale, compliance-required document extraction |
| Simple regex/PDF parser     | Pure digital PDFs with selectable text                    |

### Gemini 1.5 Pro for Long Documents

Gemini's 1M token context means you can send an entire book. Its native PDF support (no conversion needed) makes it excellent for very long document processing. Use Gemini when document length exceeds ~20 pages.

---

## Hands-on Lab

### Exercise 1: Receipt Extraction Pipeline

Design a `Receipt` Pydantic model and extraction function for grocery receipts:

```python
from pydantic import BaseModel
from typing import Optional

class ReceiptItem(BaseModel):
    name: str
    quantity: Optional[float]
    unit_price: Optional[float]
    total_price: float
    category: Optional[str]  # "produce", "dairy", "bakery", etc.

class Receipt(BaseModel):
    store_name: str
    store_address: Optional[str]
    date: Optional[str]
    time: Optional[str]
    items: list[ReceiptItem]
    subtotal: float
    tax: Optional[float]
    total: float
    payment_method: Optional[str]  # "cash", "credit", "debit"

# TODO:
# 1. Complete the receipt extraction function
# 2. Add a calculate_category_totals() method that sums totals by category
# 3. Write the system prompt that maximizes extraction accuracy
def extract_receipt(image_path: str) -> Receipt:
    pass
```

### Exercise 2: Chart Validation

```python
# Build a function that validates whether extracted chart data is internally consistent
def validate_chart_extraction(chart_data: dict) -> list[str]:
    """
    Check for common extraction errors:
    1. In a stacked bar chart, do the segment totals match the total bar height?
    2. For a pie chart, do the percentages sum to ~100%?
    3. For a line chart, are there any impossible values (negative where all should be positive)?
    4. Are there duplicate labels?
    5. Does the data trend match described "key_insights"?
    
    Return a list of validation issues (empty list = no issues found).
    """
    issues = []
    # TODO: Implement validation checks
    return issues
```

### Exercise 3: Compare VLM Performance

```python
# Compare GPT-4o vs Gemini 1.5 Flash on the same invoice image
# (Use whichever APIs you have access to; mock responses if needed)

def compare_visions(image_path: str, question: str) -> dict:
    """
    TODO:
    1. Send the same image + question to GPT-4o vision
    2. Send the same image + question to Gemini 1.5 Flash vision (or another model)
    3. Record: response text, token count, latency_ms, estimated_cost
    4. Return comparison dict

    If you only have access to one API, document what you'd expect to differ
    and why based on Day 109 learnings.
    """
    pass
```

---

## Mastery Check

**Q1**: What is the difference between `detail="low"` and `detail="high"` in GPT-4o vision?
<details><summary>Answer</summary>
`detail="low"` resizes the image to a 512×512 thumbnail and uses 85 tokens (~$0.0002) — fast and cheap, suitable for simple scene descriptions or object detection. `detail="high"` tiles the image into 512×512 segments (up to 2048×2048 original), using up to 1,105+ tokens per image — much better for reading fine text, extracting table data, or analyzing detailed charts. Always use `detail="high"` for document intelligence (invoices, contracts, financial statements).
</details>

**Q2**: Why is base64 encoding necessary for local image files?
<details><summary>Answer</summary>
The OpenAI API sends requests over HTTP/HTTPS. It can accept image URLs (for publicly accessible images) or base64-encoded image data (for local or private files). Base64 encodes binary image data (bytes) as ASCII text, allowing it to be embedded in a JSON request body. The tradeoff: a 1MB image becomes ~1.33MB as base64 (33% overhead). For large batch jobs, consider storing images in cloud storage (S3, GCS) and passing URLs instead.
</details>

**Q3**: A company has 10,000 scanned invoices per month to process. Design the architecture.
<details><summary>Answer</summary>
At 10,000/month: (1) Preprocessing: clean scans with OpenCV (straighten, denoise, increase contrast) to improve OCR quality. (2) Routing: sort by quality — clear digital PDFs go to a text extractor first (free), only true scans go to vision. (3) Extraction: GPT-4o vision at detail="high" for complex layouts, Azure Document Intelligence for standardized invoice formats. (4) Validation: run Pydantic validation + business rules (totals sum correctly). (5) Human review queue: flag low-confidence extractions (missing required fields, impossible values). At $0.003/invoice, 10K = $30/month in vision tokens — very cost effective.
</details>

**Q4**: What is a vision-language model and how does it differ from a pure LLM?
<details><summary>Answer</summary>
A vision-language model (VLM) is an LLM that has been extended with a visual encoder — typically a CLIP or ViT-based model that converts images into token-like representations the language model can "read". The visual encoder tokenizes the image (e.g., 512 tokens for a low-resolution image) and these vision tokens are concatenated with the text tokens before processing. GPT-4o, Gemini 1.5, and Claude 3 are all VLMs. The key property: they can reason about relationships across text and image simultaneously, not just describe images in isolation.
</details>

**Q5**: A chart extraction returned confidence="low". What should your system do next?
<details><summary>Answer</summary>
Treat low-confidence extractions as unverified data — never pass them directly to production systems that take action. Options: (1) Route to a human review queue for manual verification. (2) Try again with a higher-quality image (higher DPI, better contrast). (3) Ask the LLM a targeted follow-up question about the specific uncertain values. (4) Fall back to an OCR+regex pipeline for simple charts. (5) Log the failure for retraining or prompt improvement. Set a business rule: low-confidence data can be used for trends/reporting but not for individual transaction records.
</details>

---

## Further Reading

- [OpenAI Vision Guide](https://platform.openai.com/docs/guides/vision)
- [Google Gemini Vision API](https://ai.google.dev/gemini-api/docs/vision)
- [instructor + Vision — Structured Data Extraction](https://python.useinstructor.com/concepts/multimodal/)
- [Azure Document Intelligence](https://azure.microsoft.com/en-us/products/ai-services/ai-document-intelligence/)
- [pdf2image — PDF to Image Conversion](https://github.com/Belval/pdf2image)

---

## Summary

- ✅ **VLMs** (GPT-4o, Gemini 1.5) understand images as naturally as text — enabling document intelligence.
- ✅ **Use base64** for private/local images; **URL reference** for public images.
- ✅ **detail="high"** for documents and charts; **detail="low"** for simple scene questions.
- ✅ **Always extract structured output** (Pydantic + instructor) — never parse freeform vision responses.
- ✅ **Multi-page PDFs**: Convert to images at 150 DPI, process per page, synthesize at the end.
- ✅ **Limitations**: Handwriting is hit-or-miss; very fine detail may be missed; always validate output.

**Tomorrow → Day 118**: **AI Product Design** — product thinking for LLM features: when to build, what to build, and how to make AI feel magical without being flaky.
