import os
from azure.cosmos import CosmosClient, PartitionKey
from dotenv import load_dotenv

load_dotenv()

COSMOS_CONNECTION_STRING = os.getenv("COSMOS_CONNECTION_STRING")
COSMOS_DATABASE = os.getenv("COSMOS_DATABASE", "medichubs-db")
COSMOS_CONTAINER = os.getenv("COSMOS_CONTAINER", "boards")

if not COSMOS_CONNECTION_STRING:
    raise ValueError("COSMOS_CONNECTION_STRING이 없습니다.")

client = CosmosClient.from_connection_string(COSMOS_CONNECTION_STRING)

database = client.create_database_if_not_exists(id=COSMOS_DATABASE)

container = database.create_container_if_not_exists(
    id=COSMOS_CONTAINER,
    partition_key=PartitionKey(path="/boardType"),
    offer_throughput=400,
)
