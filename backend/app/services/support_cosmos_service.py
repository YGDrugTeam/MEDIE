import os
import logging
from azure.cosmos import CosmosClient

COSMOS_CONNECTION_STRING = os.getenv("COSMOS_CONNECTION_STRING")
COSMOS_DATABASE_NAME = os.getenv("COSMOS_DATABASE_NAME", "medichubs-db")
COSMOS_SUPPORT_CONTAINER_NAME = os.getenv(
    "COSMOS_SUPPORT_CONTAINER_NAME", "support-tickets"
)

_client = None
_database = None
_container = None


def get_support_container():
    global _client, _database, _container

    if _container is not None:
        return _container

    if not COSMOS_CONNECTION_STRING:
        raise ValueError("COSMOS_CONNECTION_STRING 환경변수가 없습니다.")

    _client = CosmosClient.from_connection_string(COSMOS_CONNECTION_STRING)
    _database = _client.get_database_client(COSMOS_DATABASE_NAME)
    _container = _database.get_container_client(COSMOS_SUPPORT_CONTAINER_NAME)

    logging.warning(
        f"[SUPPORT COSMOS] database={COSMOS_DATABASE_NAME}, container={COSMOS_SUPPORT_CONTAINER_NAME}"
    )

    return _container
