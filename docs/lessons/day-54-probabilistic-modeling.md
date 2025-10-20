Gaussian mixtures, Bayesian classifiers, expectation-maximisation, and hidden Markov models power
probabilistic reasoning for ambiguous business signals. Use the notebook or `solutions.py` helpers to:

- Simulate multi-modal customer cohorts and recover their structure with Gaussian mixtures.
- Train Gaussian Naive Bayes classifiers that expose posterior log-probabilities for fast decision rules.
- Run expectation-maximisation loops to maximise mixture log-likelihoods on noisy, partially labelled data.
- Implement a numerically stable hidden Markov forward pass to evaluate sequence likelihoods under state
  transitions and Gaussian emissions.

Execute `python Day_54_Probabilistic_Modeling/solutions.py` to print representative log-likelihood outputs
for the reproducible toy datasets.

## Additional Materials

- **solutions.ipynb**  
  [📁 View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_54_Probabilistic_Modeling/solutions.ipynb){ .md-button } 
  [📓 Open in NBViewer](https://nbviewer.org/github/saint2706/Coding-For-MBA/blob/main/Day_54_Probabilistic_Modeling/solutions.ipynb){ .md-button } 
  [🚀 Run in Google Colab](https://colab.research.google.com/github/saint2706/Coding-For-MBA/blob/main/Day_54_Probabilistic_Modeling/solutions.ipynb){ .md-button .md-button--primary } 
  [☁️ Run in Binder](https://mybinder.org/v2/gh/saint2706/Coding-For-MBA/main?filepath=Day_54_Probabilistic_Modeling/solutions.ipynb){ .md-button }

???+ example "solutions.py"
    [View on GitHub](https://github.com/saint2706/Coding-For-MBA/blob/main/Day_54_Probabilistic_Modeling/solutions.py)

    ```python title="solutions.py"
    """Reusable probabilistic modelling utilities for Day 54."""

    from __future__ import annotations

    from dataclasses import dataclass
    from typing import Tuple

    import numpy as np
    from numpy.typing import ArrayLike, NDArray
    from sklearn.mixture import GaussianMixture
    from sklearn.naive_bayes import GaussianNB


    @dataclass
    class HiddenMarkovModel:
        """Container for Gaussian-emission HMM parameters."""

        transition: NDArray[np.float64]
        startprob: NDArray[np.float64]
        means: NDArray[np.float64]
        covariances: NDArray[np.float64]

        def __post_init__(self) -> None:
            if self.transition.shape[0] != self.transition.shape[1]:
                msg = "Transition matrix must be square."
                raise ValueError(msg)
            if not np.allclose(self.transition.sum(axis=1), 1.0):
                msg = "Rows of the transition matrix must sum to 1."
                raise ValueError(msg)
            if not np.isclose(self.startprob.sum(), 1.0):
                msg = "Start probabilities must sum to 1."
                raise ValueError(msg)
            if len(self.means) != self.transition.shape[0]:
                msg = "Means must match number of hidden states."
                raise ValueError(msg)
            if self.covariances.shape[0] != self.transition.shape[0]:
                msg = "Covariances must match number of hidden states."
                raise ValueError(msg)


    def generate_probabilistic_dataset(
        n_samples: int = 400,
        random_state: int = 54,
    ) -> Tuple[NDArray[np.float64], NDArray[np.int_]]:
        """Create a reproducible Gaussian mixture dataset with component labels."""

        rng = np.random.default_rng(random_state)
        weights = np.array([0.55, 0.45])
        means = np.array([[0.0, 0.0], [3.5, 2.8]])
        covariances = np.array(
            [
                [[0.8, 0.2], [0.2, 0.6]],
                [[0.5, -0.15], [-0.15, 0.7]],
            ]
        )
        assignments = rng.choice(len(weights), size=n_samples, p=weights)
        observations = np.vstack(
            [
                rng.multivariate_normal(
                    means[idx], covariances[idx], size=(assignments == idx).sum()
                )
                for idx in range(len(weights))
            ]
        )
        labels = np.concatenate(
            [
                np.full((assignments == idx).sum(), idx, dtype=int)
                for idx in range(len(weights))
            ]
        )
        ordering = rng.permutation(n_samples)
        return observations[ordering], labels[ordering]


    def fit_gaussian_mixture(
        X: ArrayLike,
        n_components: int = 2,
        covariance_type: str = "full",
        random_state: int = 54,
        max_iter: int = 300,
    ) -> GaussianMixture:
        """Fit a Gaussian mixture model using expectation-maximisation."""

        model = GaussianMixture(
            n_components=n_components,
            covariance_type=covariance_type,
            random_state=random_state,
            max_iter=max_iter,
            tol=1e-4,
            reg_covar=1e-6,
        )
        model.fit(np.asarray(X))
        return model


    def mixture_log_likelihood(model: GaussianMixture, X: ArrayLike) -> float:
        """Return the total data log-likelihood under the fitted mixture."""

        X = np.asarray(X)
        return float(np.sum(model.score_samples(X)))


    def run_expectation_maximisation(
        X: ArrayLike,
        n_components: int = 2,
        random_state: int = 54,
        max_iter: int = 300,
    ) -> Tuple[GaussianMixture, float]:
        """Fit a Gaussian mixture and return the average log-likelihood bound."""

        model = fit_gaussian_mixture(
            X,
            n_components=n_components,
            random_state=random_state,
            max_iter=max_iter,
        )
        return model, float(model.lower_bound_)


    def train_bayesian_classifier(X: ArrayLike, y: ArrayLike) -> GaussianNB:
        """Train a Gaussian Naive Bayes classifier."""

        model = GaussianNB()
        model.fit(np.asarray(X), np.asarray(y))
        return model


    def bayesian_log_posterior(model: GaussianNB, X: ArrayLike) -> NDArray[np.float64]:
        """Return class log-posterior probabilities for the given observations."""

        return np.asarray(model.predict_log_proba(np.asarray(X)))


    def _gaussian_log_pdf(
        x: NDArray[np.float64], mean: NDArray[np.float64], cov: NDArray[np.float64]
    ) -> float:
        """Log probability density of a multivariate normal distribution."""

        x = np.atleast_1d(x)
        mean = np.atleast_1d(mean)
        cov = np.asarray(cov)
        diff = x - mean
        sign, logdet = np.linalg.slogdet(cov)
        if sign <= 0:
            msg = "Covariance matrix must be positive definite."
            raise ValueError(msg)
        inv_cov = np.linalg.inv(cov)
        dim = mean.size
        exponent = float(diff.T @ inv_cov @ diff)
        return -0.5 * (dim * np.log(2.0 * np.pi) + logdet + exponent)


    def _logsumexp(
        arr: NDArray[np.float64], axis: int | None = None
    ) -> NDArray[np.float64]:
        """Compute log-sum-exp in a numerically stable fashion."""

        arr = np.asarray(arr, dtype=float)
        max_val = np.max(arr, axis=axis, keepdims=True)
        stabilized = np.exp(arr - max_val)
        summed = np.sum(stabilized, axis=axis, keepdims=True)
        result = max_val + np.log(summed)
        if axis is None:
            return np.squeeze(result)
        return np.squeeze(result, axis=axis)


    def hmm_log_likelihood(model: HiddenMarkovModel, observations: ArrayLike) -> float:
        """Compute the log-likelihood of observations under a Gaussian HMM."""

        obs = np.asarray(observations, dtype=float)
        n_states = model.transition.shape[0]
        n_obs = obs.shape[0]
        emission_log_probs = np.empty((n_obs, n_states))
        for state in range(n_states):
            emission_log_probs[:, state] = [
                _gaussian_log_pdf(point, model.means[state], model.covariances[state])
                for point in obs
            ]

        log_alpha = np.log(model.startprob) + emission_log_probs[0]
        for t in range(1, n_obs):
            log_alpha = (
                _logsumexp(log_alpha[:, np.newaxis] + np.log(model.transition), axis=0)
                + emission_log_probs[t]
            )
        return float(_logsumexp(log_alpha))


    def build_demo_hmm(random_state: int = 54) -> HiddenMarkovModel:
        """Return a small two-state Gaussian HMM for demonstrations."""

        rng = np.random.default_rng(random_state)
        transition = np.array([[0.85, 0.15], [0.2, 0.8]])
        startprob = np.array([0.6, 0.4])
        means = np.array([[0.0], [3.0]])
        covariances = np.array([[[0.5]], [[0.7]]])
        _ = rng  # Reserved for future extensions; keeps signature consistent.
        return HiddenMarkovModel(
            transition=transition, startprob=startprob, means=means, covariances=covariances
        )


    def demo_log_likelihoods() -> dict[str, float]:
        """Train baseline models and return key log-likelihood metrics."""

        X, labels = generate_probabilistic_dataset()
        gmm = fit_gaussian_mixture(X)
        total_log_like = mixture_log_likelihood(gmm, X)

        bayes = train_bayesian_classifier(X, labels)
        avg_bayes_log_like = float(
            np.mean(bayesian_log_posterior(bayes, X)[np.arange(len(labels)), labels])
        )

        hmm = build_demo_hmm()
        demo_sequence = np.array([[0.2], [-0.1], [2.8], [3.4], [2.5]])
        hmm_log_like = hmm_log_likelihood(hmm, demo_sequence)

        return {
            "gmm_log_likelihood": total_log_like,
            "bayes_average_log_posterior": avg_bayes_log_like,
            "hmm_log_likelihood": hmm_log_like,
        }


    if __name__ == "__main__":
        metrics = demo_log_likelihoods()
        for name, value in metrics.items():
            print(f"{name}: {value:.3f}")
    ```
