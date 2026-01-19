import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_create_trade(client: AsyncClient, auth_headers):
    trade_data = {
        "symbol": "BTC/USD",
        "side": "BUY",
        "quantity": 1.5,
        "entry_price": 50000.0,
        "entry_time": "2024-01-01T10:00:00",
        "status": "OPEN"
    }
    response = await client.post("/api/v1/trades", json=trade_data, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["symbol"] == "BTC/USD"
    assert data["quantity"] == 1.5
    assert "_id" in data

@pytest.mark.asyncio
async def test_get_trades(client: AsyncClient, auth_headers):
    response = await client.get("/api/v1/trades", headers=auth_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)

@pytest.mark.asyncio
async def test_get_dashboard_stats(client: AsyncClient, auth_headers):
    # Create a winning trade
    await client.post("/api/v1/trades", json={
        "symbol": "ETH/USD",
        "side": "BUY",
        "quantity": 10,
        "entry_price": 2000,
        "exit_price": 2100,
        "entry_time": "2024-01-02T10:00:00",
        "status": "CLOSED",
        "pnl": 1000.0
    }, headers=auth_headers)

    response = await client.get("/api/v1/dashboard/stats", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total_trades"] > 0
    assert data["total_pnl"] >= 1000.0

@pytest.mark.asyncio
async def test_filtering(client: AsyncClient, auth_headers):
    # Create trade with specific symbol
    await client.post("/api/v1/trades", json={
        "symbol": "SOL/USD",
        "side": "SELL",
        "quantity": 100,
        "entry_price": 100,
        "entry_time": "2024-01-03T10:00:00",
        "status": "OPEN"
    }, headers=auth_headers)

    # Filter by symbol
    response = await client.get("/api/v1/trades?symbol=SOL/USD", headers=auth_headers)
    data = response.json()
    assert len(data) >= 1
    assert all(t["symbol"] == "SOL/USD" for t in data)

    # Filter by symbol that doesn't exist
    response = await client.get("/api/v1/trades?symbol=INVALID", headers=auth_headers)
    data = response.json()
    assert len(data) == 0
