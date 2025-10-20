Reinforcement learning (RL) balances exploration and exploitation while offline evaluation keeps policies safe. After this lesson you can:

- Compare value-based, policy-based, and actor–critic methods across episodic control problems.
- Simulate contextual bandits and conservative offline policy evaluation with replay buffers and importance sampling.
- Analyse stability tricks: entropy bonuses, target networks, batch-constrained Q-learning, and doubly robust estimators.
- Reproduce seeded experiments that converge to expected reward thresholds for regression tests.

Execute `python Day_61_Reinforcement_and_Offline_Learning/solutions.py` to walk through deterministic policy optimisation, offline evaluation diagnostics, and bandit baselines.

## Additional Materials

- **solutions.ipynb**  
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_61_Reinforcement_and_Offline_Learning/solutions.ipynb){ .md-button } 
  [📓 Open in NBViewer](https://nbviewer.org/github/saint2706/Coding-For-MBA/blob/main/Day_61_Reinforcement_and_Offline_Learning/solutions.ipynb){ .md-button } 
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_61_Reinforcement_and_Offline_Learning/solutions.ipynb){ .md-button .md-button--primary } 
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_61_Reinforcement_and_Offline_Learning/solutions.ipynb){ .md-button }

???+ example "solutions.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_61_Reinforcement_and_Offline_Learning/solutions.py)

    ```python title="solutions.py"
    """Reinforcement learning utilities for Day 61."""

    from __future__ import annotations

    from dataclasses import dataclass
    from typing import Dict, List

    import numpy as np


    @dataclass
    class EpisodeLog:
        """Track rewards and moving averages for RL experiments."""

        rewards: List[float]
        moving_average: List[float]
        policy_parameter: float


    def _sigmoid(x: float) -> float:
        return 1.0 / (1.0 + np.exp(-x))


    def run_policy_gradient_bandit(
        episodes: int = 200,
        lr: float = 0.2,
        random_state: int = 61,
    ) -> EpisodeLog:
        """Train a REINFORCE-style policy on a two-armed bandit."""

        rng = np.random.default_rng(random_state)
        theta = 0.0
        baseline = 0.0
        rewards: List[float] = []
        moving_avg: List[float] = []
        for episode in range(episodes):
            prob_action_one = _sigmoid(theta)
            action = 1 if rng.random() < prob_action_one else 0
            reward = float(rng.normal(1.2, 0.05) if action == 1 else rng.normal(0.2, 0.05))
            rewards.append(reward)
            baseline = 0.9 * baseline + 0.1 * reward
            grad = (reward - baseline) * (action - prob_action_one)
            theta += lr * grad
            moving_avg.append(float(np.mean(rewards[max(0, episode - 19) : episode + 1])))
        return EpisodeLog(
            rewards=rewards, moving_average=moving_avg, policy_parameter=float(theta)
        )


    @dataclass
    class QLearningResult:
        """Container for Q-learning progress on a deterministic MDP."""

        q_values: np.ndarray
        rewards: List[float]


    def run_q_learning(
        episodes: int = 200,
        gamma: float = 0.9,
        lr: float = 0.3,
        epsilon: float = 0.2,
        random_state: int = 61,
    ) -> QLearningResult:
        """Run tabular Q-learning on a two-state MDP."""

        rng = np.random.default_rng(random_state)
        q_values = np.zeros((2, 2))
        rewards: List[float] = []
        transition = {
            (0, 0): (0, 0.5),
            (0, 1): (1, 1.0),
            (1, 0): (0, 0.4),
            (1, 1): (1, 1.2),
        }
        state = 0
        for _ in range(episodes):
            if rng.random() < epsilon:
                action = rng.integers(0, 2)
            else:
                action = int(np.argmax(q_values[state]))
            next_state, reward = transition[(state, action)]
            rewards.append(reward)
            best_next = np.max(q_values[next_state])
            td_target = reward + gamma * best_next
            td_error = td_target - q_values[state, action]
            q_values[state, action] += lr * td_error
            state = next_state
        return QLearningResult(q_values=q_values, rewards=rewards)


    @dataclass
    class BanditSummary:
        """Summary statistics for epsilon-greedy contextual bandit."""

        action_counts: np.ndarray
        cumulative_reward: float
        average_reward: float


    def run_contextual_bandit(
        steps: int = 300,
        epsilon: float = 0.1,
        random_state: int = 61,
    ) -> BanditSummary:
        """Execute epsilon-greedy strategy on a contextual bandit."""

        rng = np.random.default_rng(random_state)
        action_values = np.zeros(3)
        action_counts = np.zeros(3, dtype=int)
        reward_means = np.array([0.3, 0.8, 1.1])
        total_reward = 0.0
        for step in range(steps):
            if rng.random() < epsilon:
                action = rng.integers(0, 3)
            else:
                action = int(np.argmax(action_values))
            reward = float(rng.normal(reward_means[action], 0.05))
            action_counts[action] += 1
            total_reward += reward
            step_size = 1.0 / action_counts[action]
            action_values[action] += step_size * (reward - action_values[action])
        return BanditSummary(
            action_counts=action_counts,
            cumulative_reward=total_reward,
            average_reward=total_reward / steps,
        )


    def offline_evaluation(
        num_samples: int = 500,
        random_state: int = 61,
    ) -> Dict[str, float]:
        """Estimate evaluation policy performance with weighted importance sampling."""

        rng = np.random.default_rng(random_state)
        reward_means = np.array([0.2, 0.5, 1.0])
        behaviour_policy = np.array([0.5, 0.4, 0.1])
        evaluation_policy = np.array([0.1, 0.2, 0.7])
        weights: List[float] = []
        weighted_rewards: List[float] = []
        for _ in range(num_samples):
            action = rng.choice(3, p=behaviour_policy)
            reward = float(rng.normal(reward_means[action], 0.1))
            importance = evaluation_policy[action] / behaviour_policy[action]
            weights.append(importance)
            weighted_rewards.append(importance * reward)
        weights_arr = np.array(weights)
        weighted_rewards_arr = np.array(weighted_rewards)
        estimate = float(weighted_rewards_arr.sum() / (weights_arr.sum() + 1e-9))
        ess = float((weights_arr.sum() ** 2) / (np.sum(weights_arr**2) + 1e-9))
        return {"estimate": estimate, "effective_sample_size": ess}


    def run_rl_suite(random_state: int = 61) -> Dict[str, object]:
        """Run policy/value/bandit/offline learning experiments and aggregate metrics."""

        pg = run_policy_gradient_bandit(random_state=random_state)
        ql = run_q_learning(random_state=random_state)
        bandit = run_contextual_bandit(random_state=random_state)
        offline = offline_evaluation(random_state=random_state)
        return {
            "policy_gradient": pg,
            "q_learning": ql,
            "bandit": bandit,
            "offline": offline,
        }


    def _demo() -> None:
        results = run_rl_suite()
        print(
            f"Policy gradient final avg reward: {results['policy_gradient'].moving_average[-1]:.3f}"
        )
        print(f"Q-learning Q-values: {results['q_learning'].q_values}")
        print(f"Bandit average reward: {results['bandit'].average_reward:.3f}")
        print(
            f"Offline estimate: {results['offline']['estimate']:.3f} (ESS={results['offline']['effective_sample_size']:.1f})"
        )


    if __name__ == "__main__":
        _demo()
    ```
