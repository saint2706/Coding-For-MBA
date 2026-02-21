---
day: 68
title: "AI Agents & Tool Use"
phase: 6
phaseTitle: "Cutting-Edge ML"
slug: "ai-agents-tool-use"
duration: 120
difficulty: "advanced"
tags:
  - llm
  - agents
  - langchain
  - function-calling
  - automation
concepts:
  - "ReAct pattern (Reason + Act)"
  - "function calling"
  - "agent loops"
  - "tool orchestration"
  - "multi-step reasoning"
prerequisites:
  - "LLM API basics (Day 64)"
  - "Python decorators and closures"
outcomes:
  - "Build a ReAct-style agent that uses multiple tools"
  - "Implement OpenAI function calling"
  - "Design safe agent workflows with guardrails"
---

# 🤖 Day 68: AI Agents & Tool Use

> *"An LLM that can only talk is a consultant. An LLM that can act is an employee."*

---

## The "Never-Coded" Bridge

**Think of an AI Agent like a capable new hire at a company.**

A standard LLM (like ChatGPT alone) is like calling that employee on the phone and reading their response aloud to your team. They give you great advice — but they can't *do* anything themselves.

An **AI Agent** is that same employee — but now they have:
- 🖥️ **A computer** (code execution tool)
- 📞 **A phone** (API calling tool)
- 📊 **A spreadsheet** (database query tool)
- 📅 **A calendar** (scheduling tool)

They can **reason** about what they need to do, **pick the right tool**, **use it**, **observe the result**, and **decide the next step** — all autonomously.

---

## The Technical Deep Dive

### 1. The ReAct Pattern (Reason → Act → Observe → Repeat)

The dominant agent architecture is **ReAct**, proposed by Yao et al. (2022):

```
Thought: I need to find today's stock price for AAPL, then calculate the 30-day average.
Action: search_web("AAPL stock price today")
Observation: AAPL is trading at $189.45
Thought: Now I need historical data for the 30-day average.
Action: get_stock_history("AAPL", days=30)
Observation: [187.2, 191.3, 185.0, ... ] (30 values)
Thought: I now have all the data. I'll calculate the average.
Action: calculate_average([187.2, 191.3, 185.0, ...])
Observation: 30-day average is $188.92
Final Answer: AAPL trades at $189.45, which is above its 30-day average of $188.92. Slightly bullish signal.
```

### 2. OpenAI Function Calling

The cleanest way to give an LLM tools is via **function calling** (supported by GPT-4, Gemini, Claude):

```python
import json
from openai import OpenAI

client = OpenAI()

# Define the tools the agent can use
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get current weather for a city",
            "parameters": {
                "type": "object",
                "properties": {
                    "city": {
                        "type": "string",
                        "description": "City name, e.g. 'London'",
                    }
                },
                "required": ["city"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "calculate",
            "description": "Evaluate a math expression",
            "parameters": {
                "type": "object",
                "properties": {
                    "expression": {
                        "type": "string",
                        "description": "Math expression e.g. '2 + 2 * 10'",
                    }
                },
                "required": ["expression"],
            },
        },
    },
]


# Actual implementations
def get_weather(city: str) -> str:
    # In production: call a weather API
    return f"Weather in {city}: 22°C, Partly Cloudy"


def calculate(expression: str) -> str:
    try:
        result = eval(expression, {"__builtins__": {}})
        return str(result)
    except Exception as e:
        return f"Error: {e}"


# Agent loop
def run_agent(user_message: str):
    messages = [{"role": "user", "content": user_message}]

    while True:
        response = client.chat.completions.create(
            model="gpt-4o", messages=messages, tools=tools
        )

        msg = response.choices[0].message

        # If no tool call: we have a final answer
        if not msg.tool_calls:
            return msg.content

        # Execute each tool call
        messages.append(msg)
        for tool_call in msg.tool_calls:
            fn_name = tool_call.function.name
            args = json.loads(tool_call.function.arguments)

            if fn_name == "get_weather":
                result = get_weather(**args)
            elif fn_name == "calculate":
                result = calculate(**args)
            else:
                result = "Tool not found"

            messages.append(
                {"role": "tool", "tool_call_id": tool_call.id, "content": result}
            )


# Run it
answer = run_agent("What's the weather in Tokyo, and what is 15% of 2500?")
print(answer)
```

### 3. LangChain Agents (High-Level)

For multi-tool orchestration without boilerplate:

```python
from langchain_openai import ChatOpenAI
from langchain.agents import create_react_agent, AgentExecutor
from langchain_core.tools import tool
from langchain import hub

llm = ChatOpenAI(model="gpt-4o", temperature=0)


@tool
def search_company_data(query: str) -> str:
    """Search internal company knowledge base."""
    # Connect to your actual data source
    return f"Found 3 results for: {query}"


@tool
def run_sql_query(sql: str) -> str:
    """Execute a SQL query against the analytics database."""
    import sqlite3

    # In production: connect to your actual DB
    conn = sqlite3.connect(":memory:")
    # Demo only
    return f"Query executed: {sql}"


tools = [search_company_data, run_sql_query]

# Pull the standard ReAct prompt from LangChain Hub
prompt = hub.pull("hwchase17/react")

agent = create_react_agent(llm, tools, prompt)
executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

result = executor.invoke(
    {"input": "What products had the highest revenue last quarter? Check the database."}
)
print(result["output"])
```

---

## Senior-Level Insights

### Agent Safety: The Three Guard Rails

1. **Scope Limiting**: Give agents only the tools they *need*. An agent that analyzes sales reports should NOT have a `delete_database` tool.

2. **Human-in-the-Loop (HITL)**: For destructive or high-risk actions (sending emails, making payments), require explicit human approval before execution.

3. **Max Steps**: Set a maximum iteration limit to prevent infinite loops.

```python
executor = AgentExecutor(
    agent=agent,
    tools=tools,
    max_iterations=10,  # Stop after 10 steps
    handle_parsing_errors=True,  # Recover from LLM output errors
)
```

### When Agents Go Wrong

- **Tool hallucination**: LLM invents tool arguments that don't exist → strong schema + validation
- **Loop traps**: Agent gets stuck calling the same tool → step limit + loop detection
- **Context overflow**: Long conversations exceed token limit → sliding window + summarization

---

## Hands-on Lab

### Exercise 1: Build a Simple ReAct Agent

Without using any framework — implement the ReAct loop manually:

```python
def simple_react_agent(question: str, tools: dict, max_steps: int = 5):
    """
    A minimal ReAct agent.
    tools: dict of name -> callable
    """
    history = [f"Question: {question}"]

    for step in range(max_steps):
        # In a real implementation, call an LLM here
        # For this exercise, simulate with a decision function
        print(f"Step {step + 1}: Thinking...")
        print(f"History so far: {'|'.join(history[-3:])}")

        # TODO: Call LLM with history, get Thought + Action
        # TODO: Parse the action name and arguments
        # TODO: Execute the tool
        # TODO: Append to history
        # TODO: If "Final Answer:" in response, return it
        break


# Test tool set
available_tools = {
    "get_today_date": lambda: "2026-02-21",
    "calculate": lambda expr: str(eval(expr, {"__builtins__": {}})),
}

simple_react_agent("What is today's date? And what is 365 * 3?", available_tools)
```

### Exercise 2: Function Calling Schema

Define a complete OpenAI-compatible tool schema for a `retrieve_lesson` function:

```python
retrieve_lesson_schema = {
    "type": "function",
    "function": {
        "name": "retrieve_lesson",
        "description": "Fetch content from a curriculum lesson by day number",
        "parameters": {
            # TODO: Define the JSON Schema
            # Parameters needed: day (integer), section (string, optional)
        },
    },
}
```

### Exercise 3: Agent with Safety Guard

Extend the function-calling example with a human approval step before any write operations:

```python
WRITE_TOOLS = {"send_email", "update_database", "make_payment"}


def safe_execute_tool(tool_name: str, args: dict) -> str:
    if tool_name in WRITE_TOOLS:
        # TODO: Prompt for human approval before executing
        # Return "CANCELLED" if user types 'n'
        pass

    # TODO: Execute if safe tool or approved
    pass
```

---

## Mastery Check

**Q1**: What does the "Act" step in ReAct refer to?
<details><summary>Answer</summary>
Calling a specific tool (function/API) based on the model's reasoning. The result becomes the next "Observation".
</details>

**Q2**: Why is `eval()` dangerous for a `calculate` tool in production?
<details><summary>Answer</summary>
`eval()` executes arbitrary Python code. Without sanitization, a malicious input like `__import__('os').system('rm -rf /')` could destroy data. Use a safe math parser (e.g., `simpleeval`) in production.
</details>

**Q3**: What is "tool hallucination" in the context of AI agents?
<details><summary>Answer</summary>
When the LLM invents tool names or arguments that don't exist in the schema, causing execution errors. Fixed with strict schema validation and robust error handling.
</details>

**Q4**: Why would you set `max_iterations=10` on an agent executor?
<details><summary>Answer</summary>
To prevent infinite loops where the agent keeps calling tools without reaching a final answer, wasting tokens and money.
</details>

**Q5**: Name two scenarios where human-in-the-loop (HITL) approval is essential for agents.
<details><summary>Answer</summary>
(1) Financial transactions (payments, refunds), (2) Sending external communications (emails, Slack messages), (3) Deleting/modifying production data, (4) Deploying code to production.
</details>

---

## Summary

- ✅ **AI Agents = LLM + Tools + Loop**: The model reasons, picks tools, observes results, and iterates.
- ✅ **ReAct pattern**: The dominant architecture — Reason, Act, Observe.
- ✅ **Function calling**: The safest, most structured way to give LLMs tools.
- ✅ **Safety first**: Scope limits, HITL approval, and step limits prevent disasters.

**Tomorrow → Day 69**: We explore **Responsible AI in Practice** — auditing models for bias, fairness, and safe deployment.
