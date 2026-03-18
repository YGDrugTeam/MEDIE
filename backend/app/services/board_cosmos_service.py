import os
import logging
from azure.cosmos import CosmosClient, PartitionKey

COSMOS_CONNECTION_STRING = os.getenv("COSMOS_CONNECTION_STRING")

# 일단 진단용으로 하드코딩 기본값도 확실히 둠
BOARD_COSMOS_DATABASE = os.getenv("BOARD_COSMOS_DATABASE", "medichubs-db")
BOARD_COSMOS_CONTAINER = os.getenv("BOARD_COSMOS_CONTAINER", "boards")

if not COSMOS_CONNECTION_STRING:
    raise ValueError("COSMOS_CONNECTION_STRING이 설정되지 않았습니다.")

_client = None
_container = None


def get_board_container():
    global _client, _container

    if _container is not None:
        return _container

    logging.warning(
        f"[BOARD COSMOS] database={BOARD_COSMOS_DATABASE}, container={BOARD_COSMOS_CONTAINER}"
    )

    _client = CosmosClient.from_connection_string(COSMOS_CONNECTION_STRING)

    database = _client.create_database_if_not_exists(id=BOARD_COSMOS_DATABASE)

    _container = database.create_container_if_not_exists(
        id=BOARD_COSMOS_CONTAINER,
        partition_key=PartitionKey(path="/boardType"),
        offer_throughput=400,
    )

    return _container
