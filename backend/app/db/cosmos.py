import os
from azure.cosmos import CosmosClient, PartitionKey, exceptions
from dotenv import load_dotenv

load_dotenv()

COSMOS_ENDPOINT = os.getenv("COSMOS_ENDPOINT")
COSMOS_KEY = os.getenv("COSMOS_KEY")
COSMOS_DATABASE = os.getenv("COSMOS_DATABASE", "mediclens-db")
COSMOS_CONTAINER = os.getenv("COSMOS_CONTAINER", "pill-schedules")

if not COSMOS_ENDPOINT or not COSMOS_KEY:
    raise ValueError("COSMOS_ENDPOINT 또는 COSMOS_KEY가 설정되지 않았습니다.")

client = CosmosClient(COSMOS_ENDPOINT, credential=COSMOS_KEY)

database = client.create_database_if_not_exists(id=COSMOS_DATABASE)

container = database.create_container_if_not_exists(
    id=COSMOS_CONTAINER,
    partition_key=PartitionKey(path="/userId"),
    offer_throughput=400,
)


def get_container():
    return container
