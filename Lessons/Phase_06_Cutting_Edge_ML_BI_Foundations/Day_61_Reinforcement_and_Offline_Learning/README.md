---
day: 61
title: "Reinforcement & Offline Learning"
phase: 6
phaseTitle: "Cutting-Edge ML & BI Foundations"
slug: "reinforcement-learning"
duration: 55
difficulty: "advanced"
tags: [machine-learning, reinforcement-learning]
concepts: [rewards, policies, Q-learning, offline RL]
prerequisites: [46]
outcomes: [Understand RL paradigm, Implement basic agents, Know offline RL concepts]
---

# 🎯 Day 61: Reinforcement & Offline Learning

> *"Learning by trial and error: rewards guide the way."*

---

## The Technical Deep Dive

### RL Basics

```python
# Agent-Environment loop
# State → Action → Reward → New State

import gym

env = gym.make("CartPole-v1")
state = env.reset()

for _ in range(1000):
    action = env.action_space.sample()  # Random action
    state, reward, done, info = env.step(action)
    if done:
        break
```

### Q-Learning

```python
import numpy as np

# Q-table
Q = np.zeros([state_size, action_size])

# Update rule
# Q[s,a] = Q[s,a] + lr * (reward + gamma * max(Q[s',a']) - Q[s,a])
```

---

## Summary

- ✅ RL learns from rewards
- ✅ Q-learning: value-based approach
- ✅ Offline RL: learn from logged data

**Tomorrow**: Model Interpretability & Fairness.
