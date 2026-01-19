import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_register_user(client: AsyncClient, test_db):
    # Ensure cleanup
    await test_db["users"].delete_one({"username": "newuser"})

    response = await client.post("/api/v1/auth/register", json={
        "username": "newuser",
        "email": "new@example.com",
        "password": "password123"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "newuser"
    assert "password" not in data
    assert "hashed_password" not in data

@pytest.mark.asyncio
async def test_register_duplicate_user(client: AsyncClient, test_db):
    # Ensure user exists
    if not await test_db["users"].find_one({"username": "dupuser"}):
        await client.post("/api/v1/auth/register", json={
            "username": "dupuser",
            "email": "dup@example.com",
            "password": "password123"
        })

    response = await client.post("/api/v1/auth/register", json={
        "username": "dupuser",
        "email": "dup2@example.com",
        "password": "password123"
    })
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"]

@pytest.mark.asyncio
async def test_login(client: AsyncClient, test_db):
    # Ensure user exists (created in fixture or manual)
    # We'll use the user created in conftest if we want, but let's create a specific one
    await test_db["users"].delete_one({"username": "loginuser"})
    await client.post("/api/v1/auth/register", json={
        "username": "loginuser",
        "email": "login@example.com",
        "password": "password123"
    })

    response = await client.post("/api/v1/auth/token", data={
        "username": "loginuser",
        "password": "password123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
