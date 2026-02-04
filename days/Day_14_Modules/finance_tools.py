"""
Finance Tools Module - Alias for business_logic module

This module provides backward compatibility for scripts that import
finance_tools instead of business_logic.
"""

from business_logic import (
    calculate_future_value,
    calculate_roi,
    format_as_currency,
    is_eligible_for_promotion,
)

__all__ = [
    "calculate_roi",
    "calculate_future_value",
    "is_eligible_for_promotion",
    "format_as_currency",
]
