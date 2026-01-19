import pytest
from httpx import AsyncClient, ASGITransport
from mongomock_motor import AsyncMongoMockClient
import asyncio
import os
import sys
from unittest.mock import MagicMock

# Ensure backend is in python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app
from database import db
from auth import create_access_token
import main # Import main module to patch startup handlers if needed, or better patch database functions

@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(scope="session")
async def mock_mongo_client():
    client = AsyncMongoMockClient()
    return client

@pytest.fixture(autouse=True)
async def mock_db_connection(mock_mongo_client):
    # Override the global db object
    db.client = mock_mongo_client
    db.db = mock_mongo_client.get_database("tradetracking_test")

    # We also need to prevent the app from overwriting this on startup
    # We can do this by mocking connect_to_mongo and close_mongo_connection in the database module
    # or by overriding the app's startup event handler.

    # Let's mock the functions in database module
    import database
    original_connect = database.connect_to_mongo
    original_close = database.close_mongo_connection

    # Define no-op async functions
    async def mock_connect():
        # Ensure db uses our mock
        database.db.client = mock_mongo_client
        database.db.db = mock_mongo_client.get_database("tradetracking_test")
        # Create indexes if needed for logic, but mongomock might ignore
        # from indexes import create_indexes
        # await create_indexes()
        pass

    async def mock_close():
        pass

    database.connect_to_mongo = mock_connect
    database.close_mongo_connection = mock_close

    yield

    # Restore
    database.connect_to_mongo = original_connect
    database.close_mongo_connection = original_close

    # Clear data after each test?
    # Since mock_mongo_client is session scoped, data persists.
    # We might want to clear collections.
    cols = await db.db.list_collection_names()
    for col in cols:
        await db.db[col].drop()

@pytest.fixture
async def client(mock_db_connection):
    # The app startup will call our mocked connect_to_mongo
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

@pytest.fixture
async def auth_headers(mock_mongo_client):
    # Ensure user exists in the mock DB
    db = mock_mongo_client.get_database("tradetracking_test")
    user_data = {
        "username": "testuser",
        "email": "test@example.com",
        "hashed_password": "hashedpassword123"
    }
    existing = await db["users"].find_one({"username": "testuser"})
    if not existing:
        user = await db["users"].insert_one(user_data)
        user_id = str(user.inserted_id)
    else:
        user_id = str(existing["_id"])

    token = create_access_token(data={"sub": "testuser", "id": user_id})
    return {"Authorization": f"Bearer {token}"}
