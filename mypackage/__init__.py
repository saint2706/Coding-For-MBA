"""Business Analytics Package for Python Learning.

This package contains utility modules for common business calculations
and operations, designed specifically for MBA students learning Python.

Modules:
    - arithmetics: Basic mathematical operations for business calculations
    - greet: Business greeting and messaging functions
    - bar_system: Tools for managing bar inventory and sales
    - bi_curriculum: Phase 5 Business Intelligence roadmap utilities

Example Usage:
    from mypackage.arithmetics import add_numbers, multiply
    from mypackage.greet import greet_person

    # Calculate quarterly revenue total
    total_revenue = add_numbers(125000, 150000, 175000, 200000)

    # Generate customer greeting
    welcome_message = greet_person("Jane", "Smith")
"""

__version__ = "1.0.0"
__author__ = "50 Days of Python Course"

# Import key functions for easy access
from .arithmetics import add_numbers, divide, multiply, power, remainder, subtract
from .bar_system import BarSystem, InventoryItem, SaleRecord
from .bi_curriculum import (
    DEFAULT_DATA_PATH,
    SUPPORTED_NODE_TYPES,
    BiTopic,
    group_topics_by_titles,
    index_topics_by_title,
    load_bi_topics,
    topics_by_titles,
)
from .greet import greet_person

__all__ = [
    "add_numbers",
    "subtract",
    "multiply",
    "divide",
    "remainder",
    "power",
    "greet_person",
    "BarSystem",
    "InventoryItem",
    "SaleRecord",
    "BiTopic",
    "DEFAULT_DATA_PATH",
    "SUPPORTED_NODE_TYPES",
    "load_bi_topics",
    "index_topics_by_title",
    "topics_by_titles",
    "group_topics_by_titles",
]
