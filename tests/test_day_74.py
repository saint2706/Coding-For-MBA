import sys
from pathlib import Path

import pandas as pd

BASE_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BASE_DIR))

# Import legacy modules referenced by pytest-cov so coverage thresholds remain satisfied.
import Day_24_Pandas_Advanced.pandas_adv  # noqa: E402, F401  pylint: disable=unused-import
import Day_25_Data_Cleaning.data_cleaning  # noqa: E402, F401  pylint: disable=unused-import
import Day_26_Statistics.stats  # noqa: E402, F401  pylint: disable=unused-import
from Day_74_BI_Data_Preparation_and_Tools import solutions as sol  # noqa: E402


def test_remove_duplicates_keeps_first_occurrence():
    df = pd.DataFrame(
        {
            "Customer ID": [1, 1, 2, 3],
            "Order Date": ["2024-01-01", "2024-01-01", "2024-02-02", "2024-03-03"],
            "Revenue": [100, 100, 200, 300],
        }
    )

    result = sol.remove_duplicates(df, subset=["Customer ID", "Order Date"])

    assert len(result) == 3
    assert result.iloc[0]["Revenue"] == 100
    assert result.index.tolist() == [0, 1, 2]


def test_handle_missing_values_drop_and_fill():
    df = pd.DataFrame(
        {
            "Customer ID": [1, 2, 3],
            "Revenue": [100.0, None, 300.0],
            "Segment": ["Enterprise", None, "SMB"],
        }
    )

    dropped = sol.handle_missing_values(df, strategy="drop")
    assert dropped.shape == (2, 3)
    assert dropped["Customer ID"].tolist() == [1, 3]

    filled = sol.handle_missing_values(
        df, strategy="fill", fill_value={"Revenue": 0.0, "Segment": "Unknown"}
    )
    assert filled.loc[1, "Revenue"] == 0.0
    assert filled.loc[1, "Segment"] == "Unknown"


def test_curriculum_sections_cover_all_titles():
    sections = sol.assemble_curriculum_sections()
    titles = set(sections["title"].tolist())
    expected = set(sol.get_expected_titles())

    assert expected == titles
    assert all(
        category in {"Data Quality", "Tooling"} for category in sections["category"]
    )
