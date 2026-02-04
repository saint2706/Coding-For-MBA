"""Collaborative filtering helpers for Day 57."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, Iterable, List, Sequence

import numpy as np
import pandas as pd
from numpy.typing import ArrayLike


@dataclass
class Recommendation:
    """Container storing recommendations for a single user."""

    user: str
    ranked_items: List[str]
    scores: List[float]


def build_demo_user_item_matrix(random_state: int = 57) -> pd.DataFrame:
    """Return a reproducible user–item ratings matrix."""

    users = ["A", "B", "C", "D"]
    items = ["Item1", "Item2", "Item3", "Item4", "Item5"]
    base = np.array(
        [
            [5, 4, 0, 1, 0],
            [4, 0, 4, 1, 0],
            [1, 1, 0, 5, 4],
            [0, 1, 5, 4, 0],
        ],
        dtype=float,
    )
    rng = np.random.default_rng(random_state)
    noise = rng.normal(0, 0.05, size=base.shape)
    ratings = base + noise
    ratings[base == 0] = 0  # keep missing entries at zero
    return pd.DataFrame(ratings, index=users, columns=items)


def cosine_similarity_matrix(matrix: ArrayLike) -> np.ndarray:
    """Compute cosine similarity between rows of the given matrix."""

    X = np.asarray(matrix, dtype=float)
    norms = np.linalg.norm(X, axis=1, keepdims=True)
    norms[norms == 0] = 1
    normalised = X / norms
    return normalised @ normalised.T


def user_based_scores(
    ratings: pd.DataFrame,
    target_user: str,
    k_neighbors: int = 2,
) -> pd.Series:
    """Return item scores for a target user using user-based collaborative filtering."""

    if target_user not in ratings.index:
        msg = f"Unknown user: {target_user}"
        raise KeyError(msg)
    similarity = cosine_similarity_matrix(ratings.values)
    user_index = list(ratings.index).index(target_user)
    user_sim = similarity[user_index]
    np.fill_diagonal(similarity, 0.0)
    top_indices = np.argsort(user_sim)[::-1][:k_neighbors]
    neighbour_weights = user_sim[top_indices]
    neighbour_ratings = ratings.iloc[top_indices]
    weighted = neighbour_weights[:, np.newaxis] * neighbour_ratings.values
    denom = np.sum(np.abs(neighbour_weights)) + 1e-9
    scores = np.sum(weighted, axis=0) / denom
    scores_series = pd.Series(scores, index=ratings.columns)
    already_rated = ratings.loc[target_user] > 0
    return scores_series.mask(already_rated, other=-np.inf)


def svd_matrix_factorisation(
    ratings: pd.DataFrame,
    n_factors: int = 2,
    regularisation: float = 0.0,
) -> pd.DataFrame:
    """Approximate the ratings matrix with truncated SVD."""

    matrix = ratings.values.astype(float)
    user_means = np.where(
        matrix.sum(axis=1) > 0, matrix.sum(axis=1) / np.count_nonzero(matrix, axis=1), 0
    )
    demeaned = matrix - user_means[:, np.newaxis]
    demeaned[np.isnan(demeaned)] = 0
    U, s, Vt = np.linalg.svd(demeaned, full_matrices=False)
    s = np.diag(s[:n_factors])
    U = U[:, :n_factors]
    Vt = Vt[:n_factors, :]
    if regularisation > 0:
        s = s / (1.0 + regularisation)
    approx = U @ s @ Vt
    recon = approx + user_means[:, np.newaxis]
    return pd.DataFrame(recon, index=ratings.index, columns=ratings.columns)


def implicit_confidence_matrix(
    interactions: pd.DataFrame, alpha: float = 20.0
) -> pd.DataFrame:
    """Convert implicit interactions into confidence scores."""

    confidence = 1 + alpha * interactions
    return confidence


def rank_items(scores: pd.Series, top_n: int = 3) -> Recommendation:
    """Return the highest-scoring unrated items for a user."""

    user = scores.name if scores.name is not None else "user"
    sorted_items = scores.sort_values(ascending=False)
    filtered = sorted_items[sorted_items > -np.inf]
    top_items = filtered.head(top_n)
    return Recommendation(
        user=user, ranked_items=list(top_items.index), scores=list(top_items.values)
    )


def mask_known_items(predictions: pd.Series, original_ratings: pd.Series) -> pd.Series:
    """Mask items that already have explicit feedback."""

    return predictions.mask(original_ratings > 0, other=-np.inf)


def precision_at_k(
    recommended: Sequence[str], relevant: Iterable[str], k: int
) -> float:
    """Compute precision@k for the provided recommendation list."""

    if k <= 0:
        return 0.0
    recommended_at_k = recommended[:k]
    relevant_set = set(relevant)
    hits = sum(1 for item in recommended_at_k if item in relevant_set)
    return hits / min(k, len(recommended_at_k) or k)


def recall_at_k(recommended: Sequence[str], relevant: Iterable[str], k: int) -> float:
    """Compute recall@k."""

    relevant_list = list(relevant)
    if not relevant_list:
        return 0.0
    recommended_at_k = recommended[:k]
    hits = sum(1 for item in recommended_at_k if item in set(relevant_list))
    return hits / len(relevant_list)


def average_precision(
    recommended: Sequence[str], relevant: Iterable[str], k: int
) -> float:
    """Compute average precision for a single user."""

    relevant_set = set(relevant)
    if not relevant_set:
        return 0.0
    score = 0.0
    hits = 0
    for idx, item in enumerate(recommended[:k], start=1):
        if item in relevant_set:
            hits += 1
            score += hits / idx
    return score / len(relevant_set)


def mean_average_precision(
    recommendations: Iterable[Sequence[str]], relevants: Iterable[Iterable[str]], k: int
) -> float:
    """Compute MAP@k across multiple users."""

    ap_scores = [
        average_precision(rec, rel, k) for rec, rel in zip(recommendations, relevants)
    ]
    if not ap_scores:
        return 0.0
    return float(np.mean(ap_scores))


def demo_recommender_workflow(random_state: int = 57) -> Dict[str, float]:
    """Run a small recommender pipeline and return evaluation metrics."""

    ratings = build_demo_user_item_matrix(random_state=random_state)
    target_user = "A"
    scores = user_based_scores(ratings, target_user, k_neighbors=2)
    rec = rank_items(scores, top_n=3)

    svd_preds = svd_matrix_factorisation(ratings, n_factors=2)
    masked_svd = mask_known_items(svd_preds.loc[target_user], ratings.loc[target_user])
    svd_rec = rank_items(masked_svd, top_n=3)

    implicit = (ratings > 3).astype(int)
    confidence = implicit_confidence_matrix(implicit)
    implicit_scores = mask_known_items(
        confidence.loc[target_user], ratings.loc[target_user]
    )
    implicit_rec = rank_items(implicit_scores, top_n=3)

    relevant = {"Item3", "Item5"}
    precision = precision_at_k(rec.ranked_items, relevant, k=3)
    recall = recall_at_k(rec.ranked_items, relevant, k=3)
    map_score = mean_average_precision(
        [rec.ranked_items, svd_rec.ranked_items, implicit_rec.ranked_items],
        [relevant, relevant, relevant],
        k=3,
    )

    return {
        "precision_at_3": precision,
        "recall_at_3": recall,
        "map_at_3": map_score,
        "svd_top_item": float(svd_rec.scores[0]),
    }


if __name__ == "__main__":
    metrics = demo_recommender_workflow()
    for name, value in metrics.items():
        print(f"{name}: {value:.3f}")
