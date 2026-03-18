import os
from azure.cosmos import CosmosClient, PartitionKey

COSMOS_CONNECTION_STRING = os.getenv("COSMOS_CONNECTION_STRING")

USER_COSMOS_DB = os.getenv("USER_COSMOS_DB", "medichub")
USER_COSMOS_CONTAINER = os.getenv("USER_COSMOS_CONTAINER", "users")

client = CosmosClient.from_connection_string(COSMOS_CONNECTION_STRING)


def get_user_container():
    database = client.create_database_if_not_exists(id=USER_COSMOS_DB)
    container = database.create_container_if_not_exists(
        id=USER_COSMOS_CONTAINER,
        partition_key=PartitionKey(path="/email"),
        offer_throughput=400,
    )
    return container
