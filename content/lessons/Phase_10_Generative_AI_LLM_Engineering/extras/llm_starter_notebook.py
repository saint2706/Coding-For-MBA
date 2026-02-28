"""
LLM Starter Notebook — Boilerplate for Major Providers.

This module provides ready-to-use functions for calling OpenAI, Anthropic,
Google Gemini, and local Ollama models. Import and adapt for your projects.

Prerequisites:
    pip install openai anthropic google-generativeai requests

Usage:
    from llm_starter_notebook import call_openai, call_anthropic, call_gemini
    result = call_openai("Summarize this quarterly report for the board.")
"""

import os


# ─── OpenAI (GPT-4o / GPT-4o-mini) ─────────────────────────────────────────


def call_openai(
    prompt: str,
    model: str = "gpt-4o-mini",
    system: str = "You are a helpful data analyst assistant.",
    temperature: float = 0.2,
    max_tokens: int = 1024,
) -> dict:
    """Call OpenAI Chat Completions API and return response + token usage."""
    from openai import OpenAI

    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    response = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": prompt},
        ],
        temperature=temperature,
        max_tokens=max_tokens,
    )
    return {
        "text": response.choices[0].message.content,
        "input_tokens": response.usage.prompt_tokens,
        "output_tokens": response.usage.completion_tokens,
        "model": model,
    }


# ─── Anthropic (Claude 3.5 Sonnet / Haiku) ──────────────────────────────────


def call_anthropic(
    prompt: str,
    model: str = "claude-3-5-sonnet-20241022",
    system: str = "You are a helpful data analyst assistant.",
    temperature: float = 0.2,
    max_tokens: int = 1024,
) -> dict:
    """Call Anthropic Messages API and return response + token usage."""
    import anthropic

    client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
    message = client.messages.create(
        model=model,
        max_tokens=max_tokens,
        system=system,
        messages=[{"role": "user", "content": prompt}],
    )
    return {
        "text": message.content[0].text,
        "input_tokens": message.usage.input_tokens,
        "output_tokens": message.usage.output_tokens,
        "model": model,
    }


# ─── Google Gemini (1.5 Pro / Flash) ─────────────────────────────────────────


def call_gemini(
    prompt: str,
    model: str = "gemini-1.5-flash",
) -> dict:
    """Call Google Gemini API and return response text."""
    import google.generativeai as genai

    genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
    model_obj = genai.GenerativeModel(model)
    response = model_obj.generate_content(prompt)
    return {
        "text": response.text,
        "model": model,
    }


# ─── Ollama (Local — Llama 3.1, Mistral, etc.) ──────────────────────────────


def call_ollama(
    prompt: str,
    model: str = "llama3.1:8b",
    temperature: float = 0.0,
    base_url: str = "http://localhost:11434",
) -> dict:
    """Call a local Ollama model — free, private, offline."""
    import requests

    response = requests.post(
        f"{base_url}/api/generate",
        json={
            "model": model,
            "prompt": prompt,
            "stream": False,
            "options": {"temperature": temperature},
        },
        timeout=120,
    )
    data = response.json()
    return {
        "text": data["response"],
        "model": model,
        "eval_count": data.get("eval_count", 0),
    }


# ─── Cost Estimator ──────────────────────────────────────────────────────────

PRICING_PER_MILLION = {
    "gpt-4o": {"input": 2.50, "output": 10.00},
    "gpt-4o-mini": {"input": 0.15, "output": 0.60},
    "claude-3-5-sonnet-20241022": {"input": 3.00, "output": 15.00},
    "claude-3-haiku-20240307": {"input": 0.25, "output": 1.25},
    "gemini-1.5-pro": {"input": 3.50, "output": 10.50},
    "gemini-1.5-flash": {"input": 0.075, "output": 0.30},
}


def estimate_cost(model: str, input_tokens: int, output_tokens: int) -> float:
    """Estimate cost in USD for a single API call."""
    pricing = PRICING_PER_MILLION.get(model)
    if not pricing:
        return 0.0
    input_cost = (input_tokens / 1_000_000) * pricing["input"]
    output_cost = (output_tokens / 1_000_000) * pricing["output"]
    return round(input_cost + output_cost, 6)


# ─── Demo ─────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    test_prompt = "What are the three most important metrics for an e-commerce business? Answer in 3 bullet points."

    print("=" * 60)
    print("LLM Starter Notebook — Provider Comparison")
    print("=" * 60)

    # Uncomment the providers you have API keys for:

    # result = call_openai(test_prompt)
    # print(f"\n[OpenAI] {result['model']}")
    # print(f"Response: {result['text'][:200]}...")
    # print(f"Cost: ${estimate_cost(result['model'], result['input_tokens'], result['output_tokens'])}")

    # result = call_anthropic(test_prompt)
    # print(f"\n[Anthropic] {result['model']}")
    # print(f"Response: {result['text'][:200]}...")

    # result = call_gemini(test_prompt)
    # print(f"\n[Gemini] {result['model']}")
    # print(f"Response: {result['text'][:200]}...")

    # result = call_ollama(test_prompt)
    # print(f"\n[Ollama] {result['model']}")
    # print(f"Response: {result['text'][:200]}...")

    print("\n✅ Uncomment the providers above to test. Set API keys as environment variables.")
