"""Utility helpers for text processing used by the Day 35 Flask app."""

from __future__ import annotations

import re
import string
from collections import Counter
from typing import List, Tuple

from lexical_diversity import lex_div as ld  # pyright: ignore[reportMissingImports]

WordCount = List[Tuple[str, int]]


def clean_text(text: str) -> str:
    """Normalize raw input text by stripping markup, punctuation and digits."""

    text = text.lower()
    text = re.sub(r"\[.*?]", "", text)
    text = re.sub(r"https?://\S+|www\.\S+", "", text)
    text = re.sub("<.*?>+", "", text)
    text = re.sub("[%s]" % re.escape(string.punctuation), "", text)
    text = re.sub("\n", " ", text)
    text = re.sub(r"\w*\d\w*", "", text)
    return re.sub(r"\s+", " ", text).strip()


def most_common_word(text: str) -> WordCount:
    """Return word counts sorted by frequency."""

    if not text:
        return []

    return Counter(text.split()).most_common()


def lex_div_calc(text: str) -> str:
    """Calculate lexical diversity and return it formatted as a percentage string."""

    if not text:
        return "0.0"

    return f"{ld.ttr(ld.flemmatize(text)) * 100:.1f}"
