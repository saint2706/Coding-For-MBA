"""Reusable helpers that demonstrate SQL and MongoDB connection patterns.

The functions in this module deliberately receive their database clients as
arguments so they can be easily tested without establishing real network
connections.  The calling code is responsible for creating the client (or a
stub implementation) and passing in the relevant credentials or connection
configuration.
"""

from __future__ import annotations

from typing import Any, Callable, Iterable, Mapping, MutableMapping, Optional, Sequence

Credentials = Mapping[str, Any]
ClientFactory = Callable[[Credentials], Any]


def execute_sql_query(
    client_factory: ClientFactory,
    query: str,
    *,
    credentials: Credentials,
    parameters: Optional[Sequence[Any]] = None,
    commit: bool = False,
) -> Sequence[Any]:
    """Execute a SQL query using a dependency-injected client factory.

    Parameters
    ----------
    client_factory:
        Callable that accepts a credentials mapping and returns a DB-API style
        connection object.  In production this could be ``mysql.connector.connect``
        or ``psycopg2.connect``; in tests this can be a stub or mock.
    query:
        SQL string to execute.
    credentials:
        Mapping that contains the connection details (host, database, user,
        password, etc.).
    parameters:
        Optional sequence of parameters to pass to ``cursor.execute``.
    commit:
        Whether to call ``commit`` on the connection after execution.  This is
        useful for ``INSERT``/``UPDATE`` statements.

    Returns
    -------
    Sequence[Any]
        The rows returned by ``cursor.fetchall()``.  For statements that do not
        return rows this will typically be an empty sequence.
    """

    connection = client_factory(credentials)
    cursor = connection.cursor()
    try:
        if parameters is None:
            cursor.execute(query)
        else:
            cursor.execute(query, parameters)

        results: Sequence[Any] = []
        description = getattr(cursor, "description", None)
        if description:
            results = cursor.fetchall()

        if commit and hasattr(connection, "commit"):
            connection.commit()

        return results
    finally:
        # Ensure resources are released even if ``execute`` raises an error.
        if hasattr(cursor, "close"):
            cursor.close()
        if hasattr(connection, "close"):
            connection.close()


def upsert_sales_forecast(
    client_factory: ClientFactory,
    *,
    credentials: Credentials,
    forecast_rows: Iterable[Sequence[Any]],
) -> None:
    """Insert or update forecast data via an injected SQL client.

    The function expects the ``forecast_rows`` iterable to contain tuples of the
    form ``(region, forecast_month, revenue)``.  The specific SQL syntax is kept
    intentionally generic so that the function remains database-agnostic.
    """

    merge_query = """
        INSERT INTO sales_forecast (region, forecast_month, revenue)
        VALUES (%s, %s, %s)
        ON CONFLICT (region, forecast_month) DO UPDATE
        SET revenue = EXCLUDED.revenue
        """.strip()

    connection = client_factory(credentials)
    cursor = connection.cursor()
    try:
        for row in forecast_rows:
            cursor.execute(merge_query, row)

        if hasattr(connection, "commit"):
            connection.commit()
    finally:
        if hasattr(cursor, "close"):
            cursor.close()
        if hasattr(connection, "close"):
            connection.close()


def find_documents(
    mongo_client: MutableMapping[str, Any],
    *,
    database: str,
    collection: str,
    filter_query: Optional[Mapping[str, Any]] = None,
    projection: Optional[Mapping[str, Any]] = None,
) -> list[Any]:
    """Query a MongoDB collection using an injected client object."""

    filter_query = dict(filter_query or {})

    db = mongo_client[database]
    collection_handle = db[collection]

    if projection is None:
        cursor = collection_handle.find(filter_query)
    else:
        cursor = collection_handle.find(filter_query, projection)

    return list(cursor)


def insert_documents(
    mongo_client: MutableMapping[str, Any],
    *,
    database: str,
    collection: str,
    documents: Sequence[Mapping[str, Any]],
) -> Sequence[Any]:
    """Insert multiple documents into a MongoDB collection."""

    if not documents:
        return []

    db = mongo_client[database]
    collection_handle = db[collection]
    result = collection_handle.insert_many(list(documents))
    return getattr(result, "inserted_ids", result)
