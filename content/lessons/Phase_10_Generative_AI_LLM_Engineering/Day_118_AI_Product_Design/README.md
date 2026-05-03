---
day: 118
title: "AI Product Design — Product Thinking for LLM Features"
phase: 10
phaseTitle: "Generative AI & LLM Engineering"
slug: "ai-product-design"
duration: 90
difficulty: "intermediate"
tags:
  - ai-product
  - product-management
  - ux-for-ai
  - ai-features
  - product-strategy
concepts:
  - "AI product fit"
  - "user trust and AI transparency"
  - "failure mode design"
  - "AI feature framing"
  - "confidence communication"
prerequisites:
  - "Day 114: Evaluation & Guardrails"
  - "Day 115: LLM Agents & Tool Use"
outcomes:
  - "Apply a product design framework to decide when AI adds genuine value"
  - "Design AI user experiences that build trust and manage failure gracefully"
  - "Write an AI feature spec with user flows, fallbacks, and success metrics"
---

# 🎯 Day 118: AI Product Design

> *"AI features that delight users are not the ones that are most technically impressive. They're the ones that solve a real problem without making the user feel stupid when they fail."*

---

## The "Never-Coded" Bridge

**Think about the first time you used car navigation.**

Before Google Maps, you printed MapQuest directions. Navigation seemed like magic. But the first time it said "turn right" into a river, you learned: AI is confident even when it's wrong.

The best AI products anticipate this — they have confidence indicators, graceful fallback UX, and never pretend to know what they don't. The worst AI products ship an LLM response as a black box with no feedback mechanism, no error state, and no way for users to understand or trust the output.

**AI product design** is the discipline of designing human experiences around probabilistic, sometimes-wrong systems.

---

## The Technical Deep Dive

### 1. The AI Features Decision Framework

```python
# BEFORE BUILDING ANY AI FEATURE: Answer these 6 questions

def should_build_ai_feature(task: dict) -> str:
    """
    6-gate framework for deciding if AI is the right tool.
    """
    # Gate 1: Is there a real user problem?
    if not task.get("has_user_pain_point"):
        return "REJECT: No clear user problem — you're adding AI for AI's sake"

    # Gate 2: Is the task well-defined enough for AI?
    if task.get("task_ambiguity") == "high" and not task.get("has_eval_dataset"):
        return "BLOCK: Task too ambiguous without an evaluation dataset to measure quality"

    # Gate 3: What's the cost of AI failure for this task?
    failure_severity = task.get("failure_severity")  # low, medium, high, catastrophic
    if failure_severity == "catastrophic":
        return "BLOCK: Catastrophic failures (medical, legal, financial) require human-in-the-loop. Redesign with AI as assistant, not decision-maker."
    if failure_severity == "high":
        return "CAUTION: Implement strong guardrails + human review queue before shipping"

    # Gate 4: Can you measure success?
    if not task.get("has_success_metric"):
        return "BLOCK: Define success metrics first (accuracy threshold, user satisfaction, cost per task)"

    # Gate 5: Alternatives considered?
    if not task.get("non_ai_alternatives_evaluated"):
        return "INVESTIGATE: Could a search filter, dropdown, or rule-based system solve this? AI should be the last resort, not the first."

    # Gate 6: Data / privacy risk?
    if task.get("requires_pii") and not task.get("privacy_review_done"):
        return "BLOCK: PII handling requires privacy review and user consent design"

    return "APPROVED: Proceed to AI feature spec"

# Example evaluations:
tasks = [
    {
        "name": "Auto-classify support tickets",
        "has_user_pain_point": True,
        "task_ambiguity": "low",
        "failure_severity": "low",       # Wrong category → manual re-route, not harmful
        "has_success_metric": True,       # Classification accuracy >90%
        "non_ai_alternatives_evaluated": True,
        "requires_pii": False,
        "has_eval_dataset": True,
    },
    {
        "name": "Auto-approve loan applications",
        "has_user_pain_point": True,
        "task_ambiguity": "medium",
        "failure_severity": "catastrophic",  # False denials or approvals have legal consequences
        "has_success_metric": True,
        "non_ai_alternatives_evaluated": True,
        "requires_pii": True,
        "privacy_review_done": False,
    },
]
```

### 2. Confidence Communication UX Patterns

```python
# Never show raw AI output as unqualified fact
# Design the UX around confidence and uncertainty

CONFIDENCE_UX_PATTERNS = {
    "high_confidence": {
        "threshold": ">95% accuracy in testing",
        "ui_pattern": "Show result directly with subtle AI attribution badge",
        "example": "Email classified as: 📋 Support Request",
        "fallback": "Report feedback button → human review",
    },
    "medium_confidence": {
        "threshold": "80-95% accuracy",
        "ui_pattern": "Show top suggestion + alternatives + confidence indicator",
        "example": "Suggested category: Support Request (most likely)\n  Other possibilities: Feature Request · Billing",
        "fallback": "User can one-click correct the suggestion",
    },
    "low_confidence": {
        "threshold": "<80% accuracy",
        "ui_pattern": "Show 'I'm not sure' state explicitly — ask user to confirm",
        "example": "I couldn't determine the category confidently. Please select: [dropdown]",
        "fallback": "Default to human assignment — don't show uncertain AI output as a suggestion",
    },
}

# Implementation: Always request confidence from the model
def classify_with_confidence(text: str, client) -> dict:
    """Request classification with explicit confidence score."""
    import json
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        response_format={"type": "json_object"},
        messages=[{
            "role": "user",
            "content": f"""
Classify this support ticket into exactly one category: support / billing / feature_request / bug_report / other

Return JSON:
{{
    "category": "<category>",
    "confidence": <0.0 to 1.0>,
    "reason": "<one sentence explanation>",
    "alternatives": [<other possible categories if confidence < 0.9>]
}}

Ticket: {text}
"""
        }]
    )
    return json.loads(response.choices[0].message.content)

def render_classification_ux(result: dict) -> str:
    """Render appropriate UX based on confidence level."""
    conf = result["confidence"]
    cat = result["category"]

    if conf > 0.90:
        return f"✅ Category: {cat} (AI-classified with high confidence)"
    elif conf > 0.75:
        return f"🤔 Suggested: {cat} — does this look right? {result.get('alternatives', [])}"
    else:
        return f"❓ AI wasn't sure. Please select the correct category manually. (AI guessed: {cat})"
```

### 3. AI Feature Spec Template

```markdown
## AI Feature Spec: [Feature Name]

### Problem Statement
What specific user pain point does this solve?
What do users currently have to do manually, and how long does it take?

### AI Approach
Which AI technique? (RAG, classification, extraction, generation, agents)
Which model? (GPT-4o-mini, Claude Haiku, etc.) Why?
What is the prompt strategy? (zero-shot, few-shot, structured output)

### Success Metrics
Primary: [specific, measurable — e.g., "Ticket classification accuracy >90% on our test set"]
Secondary: [user adoption rate, time saved per user, satisfaction score]
Guard rails: [error rate <1%, no PII in outputs, latency <2 seconds]

### User Flows
Happy path: [User sees X → AI does Y → User gets Z benefit]
Uncertainty path: [AI confidence <80% → User sees "Review needed" → User confirms/corrects]
Failure path: [API timeout / error → Fall back to manual → User sees error message (not raw error)]

### Edge Cases
- What happens if the user input is in a foreign language?
- What if input is very short (<10 words)?
- What if the AI returns an invalid output format?
- What if the prompt is abusive/adversarial?

### Evaluation Plan
- Offline: Test on N labeled examples before shipping
- Online: A/B test AI vs non-AI over 2 weeks; measure primary metric
- Alerting: Alert if accuracy drops >5% below baseline

### Rollout Plan
Phase 1: Internal testing (N=50 examples)
Phase 2: Beta users (N=500)
Phase 3: Full rollout with monitoring
```

### 4. Designing for AI Failure

```python
# The 5 failure modes of AI features and their UX mitigations

FAILURE_MODES = {
    "hallucination": {
        "description": "AI confidently states a false fact",
        "examples": ["Cites a law that doesn't exist", "Makes up a product feature"],
        "mitigations": [
            "Source attribution — show what documents were referenced",
            "RAG instead of pure generation for factual questions",
            "Confidence-gated display: only show if model confidence >threshold",
            "Feedback button: 'Was this answer helpful? Flag inaccuracy'",
        ]
    },
    "refusal_overreach": {
        "description": "AI refuses a completely legitimate request",
        "examples": ["Refuses to write a competitive analysis", "Flags normal business email as inappropriate"],
        "mitigations": [
            "Calibrate content policy to your use case (not general-purpose settings)",
            "Provide explicit override path: 'This seems fine — try anyway'",
            "Log all refusals for weekly review",
        ]
    },
    "latency_spike": {
        "description": "AI call takes 30+ seconds due to long context or model issues",
        "examples": ["Long document analysis", "Multi-tool agent loop"],
        "mitigations": [
            "Always show 'AI is thinking...' with a streaming progress indicator",
            "Set request timeouts (15-30s) with graceful fallback message",
            "For background tasks: 'We'll notify you when the analysis is ready'",
        ]
    },
    "stale_knowledge": {
        "description": "AI answers a question with outdated information",
        "examples": ["Gives old regulatory requirements", "Cites deprecated API methods"],
        "mitigations": [
            "RAG from up-to-date document store rather than model training data",
            "Display 'Information last updated: [date]' for factual queries",
            "Allow users to ask 'What documents is this based on?'",
        ]
    },
    "context_loss": {
        "description": "AI forgets earlier conversation context mid-conversation",
        "examples": ["Asks for customer name again on message 5", "Forgets earlier constraints"],
        "mitigations": [
            "Always include key facts (name, account ID) in system prompt",
            "Implement explicit context summarization every N turns",
            "Show 'Conversation history' UI so user can see what the AI knows",
        ]
    },
}
```

### 5. The Responsible Launch Checklist

```python
PRELAUNCH_CHECKLIST = {
    "accuracy": [
        "✅ Evaluated on 100+ labeled examples representing prod distribution",
        "✅ Accuracy meets defined threshold",
        "✅ Evaluated on edge cases (short inputs, foreign language, adversarial inputs)",
    ],
    "safety": [
        "✅ Guardrails implemented (topic restriction, output validation)",
        "✅ Prompt injection resistance tested",
        "✅ PII handling reviewed by privacy team",
        "✅ Red-team testing done (attempted misuse scenarios)",
    ],
    "ux": [
        "✅ Confidence levels communicated in UI",
        "✅ Graceful failure states designed (timeout, error, low confidence)",
        "✅ Feedback mechanism in place (thumbs up/down or flag)",
        "✅ Latency acceptable (median <3s, p95 <8s)",
    ],
    "monitoring": [
        "✅ Logging enabled (queries, responses, latency, errors)",
        "✅ Alerting configured (accuracy drop alert, error rate spike)",
        "✅ Cost monitoring enabled (daily spend alert if >budget)",
        "✅ Daily sample evaluation scheduled (1% of prod traffic)",
    ],
    "legal": [
        "✅ AI disclosure in UX (users know they're talking to AI)",
        "✅ Terms of service updated to include AI usage",
        "✅ Data retention and deletion policy defined",
    ],
}
```

---

## Senior-Level Insights

### The "Magical Demo" Trap

AI demos are always better than production. The demo uses hand-picked examples that work perfectly. Production has: typos, off-topic inputs, adversarial users, edge cases, and data quality issues. Before shipping, test on 100+ *real* examples from your actual user base — not curated ones.

### The "AI as Co-Pilot" Design Principle

The most successful AI features position AI as a co-pilot, not autopilot. Users should always feel in control:
- **Co-pilot**: AI drafts an email, user edits and sends → user feels empowered and accountable
- **Autopilot**: AI sends the email automatically → user feels nervous and distrusts the system

Co-pilot wins on trust. Autopilot wins on efficiency. Choose based on the stakes of the task.

---

## Hands-on Lab

### Exercise 1: Feature Evaluation

For each of these proposed AI features, score it on the 6-gate framework and give a APPROVED/BLOCKED verdict with reasoning:

1. **AI-generated performance reviews** — HR manager uploads peer feedback, AI generates a performance review draft.
2. **Auto-reply to customer emails** — AI reads support emails and sends responses automatically (no human review).
3. **Meeting notes summarizer** — AI transcribes and summarizes meeting recordings into structured action items.
4. **Salary negotiation advisor** — AI recommends salary offers based on candidate resume and market data.

### Exercise 2: Failure Mode Design

You're building an AI feature that suggests the next best action for sales reps (call, email, discount offer, escalate) based on CRM data. 

Design the UX for these failure scenarios:
1. The AI suggests a 30% discount for a customer the rep knows is about to sign at full price
2. The AI suggestion API times out after 15 seconds
3. The AI gave incorrect advice last week, and a customer was lost as a result

For each: what does the user see, and what should happen?

### Exercise 3: Write an AI Feature Spec

Write a complete AI feature spec (using the template from Section 3) for:
**Intelligent Invoice Approval Assistant** — a tool that reads invoice images, validates against purchase orders, flags discrepancies, and routes for approval or auto-approves low-value invoices within policy.

Include: problem statement, AI approach, success metrics, user flows, edge cases, evaluation plan, and rollout plan.

---

## Mastery Check

**Q1**: What is the "magical demo trap" and how does it affect AI product development?
<details><summary>Answer</summary>
The magical demo trap occurs when the AI demo uses handpicked, curated examples that work perfectly — creating unrealistic expectations about production performance. In production, data quality is lower (typos, ambiguous inputs, edge cases), user intent is more varied, and adversarial inputs appear. If you demo on 5 cherry-picked examples and ship to 5,000 users, the disappointment destroys trust. Mitigate by: always testing on 100+ representative examples from real user data, and ensuring the acceptance criteria is met on this representative set, not just demos.
</details>

**Q2**: What is the difference between "co-pilot" and "autopilot" AI design patterns?
<details><summary>Answer</summary>
Co-pilot AI assists humans — it drafts, suggests, or highlights, but a human always reviews and takes the final action. Autopilot AI acts autonomously without human review. Co-pilot is safer, builds trust gradually, and is easier to correct when the AI makes mistakes. Autopilot is more efficient but requires very high accuracy and clear human accountability for errors. Decision rule: use autopilot only for tasks with: proven >99% accuracy, low failure cost (easily reversed), and explicit user opt-in for automation. Start with co-pilot and graduate to autopilot as trust is established.
</details>

**Q3**: A user complains that your AI chatbot "makes things up." What product changes should you make?
<details><summary>Answer</summary>
Hallucination mitigation requires both technical and UX changes: Technical: (1) Switch to RAG — retrieve sources before generating answers, (2) Add RAGAS faithfulness evaluation to flag poor-quality responses, (3) Set guardrail rules that block outputs not grounded in retrieved context. UX: (4) Add source citations to every factual claim, (5) Display "Based on documents from [date]" to set freshness expectations, (6) Add "Thumbs down + explain" feedback button to capture hallucinations, (7) Implement "I don't know" path — when confidence is low, say so explicitly instead of generating a plausible but wrong answer.
</details>

**Q4**: What should a "graceful failure" UX look like for an AI feature that times out?
<details><summary>Answer</summary>
Never show a raw error (`500 Internal Server Error` or a Python traceback). Instead: (1) Show a clear, friendly message: "It's taking longer than expected to analyze this document." (2) Provide actionable next steps: "Try again" button, or "Submit for manual review" for important documents. (3) Set explicit timeout (15-30s) — never make users wait indefinitely. (4) For long-running tasks (>30s expected): use async processing with email/notification on completion. (5) Always preserve the user's input so they don't have to start over. The key principle: the user should feel helped, not abandoned.
</details>

**Q5**: Why should AI features include a user feedback mechanism (thumbs up/down) from day one?
<details><summary>Answer</summary>
Feedback from production users serves several purposes: (1) **Model monitoring**: A sudden drop in thumbs-up rate is the earliest signal that AI quality has degraded. (2) **Evaluation dataset creation**: Thumbs-down cases become labeled examples for offline evaluation and prompt improvement. (3) **Business impact measurement**: Correlate thumbs-up rate with user retention and task completion. (4) **Legal/compliance trail**: Documentation that the company monitors AI output quality. (5) **Continuous improvement**: Flagged responses feed into weekly prompt reviews. Without feedback, you're deploying an AI you can't learn from.
</details>

---

## Further Reading

- [The State of AI Product Design — a16z](https://a16z.com/2023/11/16/ai-product-design/)
- [Designing with AI in Mind — Nielsen Norman Group](https://www.nngroup.com/articles/ai-paradigm/)
- [Boring AI: How to Ship AI Features That Actually Work](https://austinhenley.com/blog/designingboringai.html)
- [Google PAIR — People + AI Research](https://pair.withgoogle.com/guidebook/)
- [AI UX Patterns Library — Human-AI Interaction Patterns](https://www.shapeof.ai/)

---

## Summary

- ✅ **6-gate framework**: Problem → Task clarity → Failure severity → Success metrics → Alternatives → Privacy.
- ✅ **Confidence UX**: Show high-confidence results directly; medium with alternatives; low as "needs review."
- ✅ **AI Feature Spec**: Required document before any AI feature ships — includes fallbacks and evaluation plan.
- ✅ **5 failure modes**: Hallucination, refusal overreach, latency spikes, stale knowledge, context loss — all have UX mitigations.
- ✅ **Co-pilot > autopilot**: Start with human-in-the-loop; automate incrementally as trust is earned.
- ✅ **Day 1 feedback**: Thumbs up/down is your production monitoring and training data pipeline in one.

**Tomorrow → Day 119**: **AI Ethics in Practice** — bias audits, red-teaming, responsible deployment, and turning ethical principles into engineering decisions.
