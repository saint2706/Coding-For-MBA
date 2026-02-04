"""Utilities for scraping the Boston University facts and stats page."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Iterable, List, MutableMapping, Optional, Sequence

import requests
from bs4 import BeautifulSoup

DEFAULT_URL = "https://www.bu.edu/president/boston-university-facts-stats/"
OUTPUT_FILENAME = "scraped_exercise_1.json"


def _parse_tables(tables: Iterable[BeautifulSoup]) -> List[MutableMapping[str, str]]:
    """Convert BeautifulSoup table fragments into dictionaries.

    The parsing logic intentionally mirrors the original script to avoid
    introducing behavioural changes while allowing the scraping work to be
    orchestrated from dedicated functions.
    """

    parsed_tables: List[MutableMapping[str, str]] = []

    for table in tables:
        keys: List[str] = []
        values: List[str] = []
        temp_dict: MutableMapping[str, str] = {}

        table_str = str(table)
        category = table_str[table_str.find("<h5>") + 4 : table_str.find("</h5>")]
        temp_dict["Category"] = category

        all_key_start_indexes = [
            x + 7 for x in range(len(table_str)) if table_str.startswith('"text">', x)
        ]
        all_key_end_indexes = [
            x for x in range(len(table_str)) if table_str.startswith("</p>", x)
        ]

        for start_index, end_index in zip(all_key_start_indexes, all_key_end_indexes):
            keys.append(table_str[start_index:end_index])

        all_values_start_indexes: List[int] = []
        for idx in range(len(table_str)):
            if table_str.startswith('value">', idx):
                all_values_start_indexes.append(idx + 7)
            if table_str.startswith('value-text">', idx):
                all_values_start_indexes.append(idx + 12)

        all_values_end_indexes = [
            x for x in range(len(table_str)) if table_str.startswith("</span>", x)
        ]

        for start_index, end_index in zip(
            all_values_start_indexes, all_values_end_indexes
        ):
            values.append(table_str[start_index:end_index])

        for key, value in zip(keys, values):
            temp_dict[key] = value

        parsed_tables.append(temp_dict)

    return parsed_tables


def fetch_tables(
    url: str = DEFAULT_URL,
    *,
    session: Optional[requests.sessions.Session] = None,
) -> List[MutableMapping[str, str]]:
    """Fetch and parse facts tables from the given URL."""

    http_client = session if session is not None else requests
    response = http_client.get(url)
    soup = BeautifulSoup(response.content, "html.parser")
    tables = soup.find_all("div", class_="facts-wrapper")
    return _parse_tables(tables)


def save_tables(
    tables: Sequence[MutableMapping[str, str]],
    output_path: Optional[Path | str] = None,
) -> Path:
    """Persist the scraped tables to a JSON file."""

    resolved_path = (
        Path(output_path)
        if output_path is not None
        else Path(__file__).resolve().parent / OUTPUT_FILENAME
    )

    with resolved_path.open("w", encoding="utf-8") as fp:
        json.dump(list(tables), fp)

    return resolved_path


def main(
    url: str = DEFAULT_URL,
    output_path: Optional[Path | str] = None,
    *,
    session: Optional[requests.sessions.Session] = None,
) -> Path:
    """Run the full scraping workflow and save the results to disk."""

    tables = fetch_tables(url, session=session)
    return save_tables(tables, output_path)


if __name__ == "__main__":
    main()
