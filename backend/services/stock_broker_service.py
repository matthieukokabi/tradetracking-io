"""
Stock Broker Service - Direct API Integration for TradeTracking.io
Supports stock market brokers that are NOT in CCXT:
  - Tradier (stocks, options, ETFs)
  - Interactive Brokers (stocks, options, futures, forex)
  - E*TRADE (stocks, options)
  - Schwab (stocks, options) - formerly TD Ameritrade
  - Webull (stocks, options, crypto)
  - Firstrade (stocks, options, ETFs)
"""

import httpx
from typing import List, Dict, Optional, Any
from pydantic import BaseModel
from datetime import datetime, timedelta
from cryptography.fernet import Fernet
import os
import asyncio

# Encryption key for API keys
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY", Fernet.generate_key().decode())
cipher = Fernet(ENCRYPTION_KEY.encode() if isinstance(ENCRYPTION_KEY, str) else ENCRYPTION_KEY)


class StockBrokerTrade(BaseModel):
    id: str
    symbol: str
    side: str  # BUY or SELL
    quantity: float
    price: float
    total_cost: float
    timestamp: datetime
    commission: Optional[float] = None
    order_type: Optional[str] = None  # MARKET, LIMIT, etc.


class StockBrokerPosition(BaseModel):
    symbol: str
    quantity: float
    avg_cost: float
    current_price: float
    market_value: float
    unrealized_pnl: float
    unrealized_pnl_percent: float


class StockBrokerAccount(BaseModel):
    account_id: str
    account_type: str  # margin, cash, ira, etc.
    total_value: float
    cash_balance: float
    buying_power: float


# Supported stock brokers configuration
STOCK_BROKERS = {
    # === EASY INTEGRATION (REST API) ===
    "tradier": {
        "name": "Tradier",
        "base_url": "https://api.tradier.com/v1",
        "sandbox_url": "https://sandbox.tradier.com/v1",
        "auth_type": "bearer",
        "category": "stocks",
        "asset_types": ["stocks", "options", "etfs"],
        "docs": "https://documentation.tradier.com",
    },
    "alpaca": {
        "name": "Alpaca",
        "base_url": "https://api.alpaca.markets",
        "sandbox_url": "https://paper-api.alpaca.markets",
        "auth_type": "api_key",
        "category": "stocks",
        "asset_types": ["stocks", "options", "crypto"],
        "docs": "https://alpaca.markets/docs",
        "note": "Also available via CCXT"
    },

    # === MEDIUM INTEGRATION ===
    "etrade": {
        "name": "E*TRADE",
        "base_url": "https://api.etrade.com",
        "sandbox_url": "https://apisb.etrade.com",
        "auth_type": "oauth1",
        "category": "stocks",
        "asset_types": ["stocks", "options", "etfs", "mutual_funds"],
        "docs": "https://developer.etrade.com",
    },
    "schwab": {
        "name": "Charles Schwab",
        "base_url": "https://api.schwab.com",
        "auth_type": "oauth2",
        "category": "stocks",
        "asset_types": ["stocks", "options", "etfs", "futures"],
        "docs": "https://developer.schwab.com",
        "note": "Formerly TD Ameritrade - API in transition"
    },

    # === COMPLEX INTEGRATION (Requires Desktop App/Gateway) ===
    "ibkr": {
        "name": "Interactive Brokers",
        "base_url": "https://localhost:5000/v1/api",  # Client Portal API
        "auth_type": "session",
        "category": "stocks",
        "asset_types": ["stocks", "options", "futures", "forex", "bonds", "crypto"],
        "docs": "https://www.interactivebrokers.com/api",
        "note": "Requires IB Gateway or TWS running locally"
    },

    # === UNOFFICIAL/LIMITED API ===
    "webull": {
        "name": "Webull",
        "base_url": "https://userapi.webull.com/api",
        "auth_type": "custom",
        "category": "stocks",
        "asset_types": ["stocks", "options", "etfs", "crypto"],
        "docs": None,
        "note": "Unofficial API - may break"
    },
    "firstrade": {
        "name": "Firstrade",
        "base_url": None,
        "auth_type": "custom",
        "category": "stocks",
        "asset_types": ["stocks", "options", "etfs", "mutual_funds"],
        "docs": None,
        "note": "Limited API availability"
    },
}


# ============================================================================
# TRADIER INTEGRATION (Recommended - Best API for stocks)
# ============================================================================

class TradierClient:
    """Tradier API client for stocks and options trading."""

    def __init__(self, access_token: str, sandbox: bool = False):
        self.access_token = access_token
        self.base_url = STOCK_BROKERS["tradier"]["sandbox_url" if sandbox else "base_url"]
        self.headers = {
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/json"
        }

    async def get_profile(self) -> Dict[str, Any]:
        """Get user profile and account information."""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/user/profile",
                headers=self.headers
            )
            response.raise_for_status()
            return response.json()

    async def get_accounts(self) -> List[StockBrokerAccount]:
        """Get all trading accounts."""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/user/profile",
                headers=self.headers
            )
            response.raise_for_status()
            data = response.json()

            accounts = []
            for acc in data.get("profile", {}).get("account", []):
                if isinstance(acc, dict):
                    accounts.append(StockBrokerAccount(
                        account_id=acc.get("account_number", ""),
                        account_type=acc.get("type", ""),
                        total_value=float(acc.get("value", 0)),
                        cash_balance=float(acc.get("cash", {}).get("cash_available", 0)),
                        buying_power=float(acc.get("buying_power", 0))
                    ))
            return accounts

    async def get_positions(self, account_id: str) -> List[StockBrokerPosition]:
        """Get current positions for an account."""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/accounts/{account_id}/positions",
                headers=self.headers
            )
            response.raise_for_status()
            data = response.json()

            positions = []
            pos_data = data.get("positions", {}).get("position", [])
            if isinstance(pos_data, dict):
                pos_data = [pos_data]

            for pos in pos_data:
                positions.append(StockBrokerPosition(
                    symbol=pos.get("symbol", ""),
                    quantity=float(pos.get("quantity", 0)),
                    avg_cost=float(pos.get("cost_basis", 0)) / float(pos.get("quantity", 1)),
                    current_price=float(pos.get("close_price", 0)),
                    market_value=float(pos.get("market_value", 0)),
                    unrealized_pnl=float(pos.get("unrealized_pnl", 0)),
                    unrealized_pnl_percent=float(pos.get("unrealized_pnl_pct", 0)) * 100
                ))
            return positions

    async def get_history(self, account_id: str, start_date: Optional[datetime] = None) -> List[StockBrokerTrade]:
        """Get trade history for an account."""
        async with httpx.AsyncClient() as client:
            params = {"limit": 500}
            if start_date:
                params["start"] = start_date.strftime("%Y-%m-%d")

            response = await client.get(
                f"{self.base_url}/accounts/{account_id}/history",
                headers=self.headers,
                params=params
            )
            response.raise_for_status()
            data = response.json()

            trades = []
            history = data.get("history", {}).get("event", [])
            if isinstance(history, dict):
                history = [history]

            for event in history:
                if event.get("type") == "trade":
                    trade_data = event.get("trade", {})
                    trades.append(StockBrokerTrade(
                        id=str(event.get("id", "")),
                        symbol=trade_data.get("symbol", ""),
                        side=trade_data.get("trade_type", "").upper(),
                        quantity=float(trade_data.get("quantity", 0)),
                        price=float(trade_data.get("price", 0)),
                        total_cost=float(trade_data.get("amount", 0)),
                        timestamp=datetime.fromisoformat(event.get("date", "").replace("Z", "+00:00")),
                        commission=float(trade_data.get("commission", 0))
                    ))
            return trades


# ============================================================================
# INTERACTIVE BROKERS INTEGRATION
# ============================================================================

class IBKRClient:
    """Interactive Brokers Client Portal API client.

    Note: Requires IB Gateway or TWS to be running with Client Portal API enabled.
    The gateway runs locally and exposes a REST API on localhost:5000.
    """

    def __init__(self, base_url: str = "https://localhost:5000/v1/api"):
        self.base_url = base_url

    async def get_accounts(self) -> List[Dict[str, Any]]:
        """Get all accounts."""
        async with httpx.AsyncClient(verify=False) as client:
            response = await client.get(f"{self.base_url}/portfolio/accounts")
            response.raise_for_status()
            return response.json()

    async def get_positions(self, account_id: str) -> List[StockBrokerPosition]:
        """Get positions for an account."""
        async with httpx.AsyncClient(verify=False) as client:
            response = await client.get(f"{self.base_url}/portfolio/{account_id}/positions/0")
            response.raise_for_status()
            data = response.json()

            positions = []
            for pos in data:
                positions.append(StockBrokerPosition(
                    symbol=pos.get("contractDesc", ""),
                    quantity=float(pos.get("position", 0)),
                    avg_cost=float(pos.get("avgCost", 0)),
                    current_price=float(pos.get("mktPrice", 0)),
                    market_value=float(pos.get("mktValue", 0)),
                    unrealized_pnl=float(pos.get("unrealizedPnl", 0)),
                    unrealized_pnl_percent=float(pos.get("unrealizedPnlPercent", 0))
                ))
            return positions

    async def get_trades(self, days: int = 7) -> List[StockBrokerTrade]:
        """Get recent trades/orders."""
        async with httpx.AsyncClient(verify=False) as client:
            response = await client.get(f"{self.base_url}/iserver/account/trades")
            response.raise_for_status()
            data = response.json()

            trades = []
            for trade in data:
                trades.append(StockBrokerTrade(
                    id=str(trade.get("execution_id", "")),
                    symbol=trade.get("symbol", ""),
                    side=trade.get("side", "").upper(),
                    quantity=float(trade.get("size", 0)),
                    price=float(trade.get("price", 0)),
                    total_cost=float(trade.get("size", 0)) * float(trade.get("price", 0)),
                    timestamp=datetime.fromtimestamp(trade.get("trade_time_r", 0) / 1000),
                    commission=float(trade.get("commission", 0))
                ))
            return trades


# ============================================================================
# E*TRADE INTEGRATION
# ============================================================================

class ETradeClient:
    """E*TRADE API client (OAuth 1.0a).

    Note: Requires OAuth flow to get access tokens.
    """

    def __init__(self, consumer_key: str, consumer_secret: str,
                 oauth_token: str, oauth_token_secret: str, sandbox: bool = False):
        self.consumer_key = consumer_key
        self.consumer_secret = consumer_secret
        self.oauth_token = oauth_token
        self.oauth_token_secret = oauth_token_secret
        self.base_url = STOCK_BROKERS["etrade"]["sandbox_url" if sandbox else "base_url"]

    async def get_accounts(self) -> List[Dict[str, Any]]:
        """Get all accounts - requires OAuth signing."""
        # OAuth 1.0a signing required - simplified example
        raise NotImplementedError("E*TRADE requires OAuth 1.0a implementation")

    async def get_positions(self, account_id: str) -> List[StockBrokerPosition]:
        """Get positions for an account."""
        raise NotImplementedError("E*TRADE requires OAuth 1.0a implementation")


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

async def test_broker_connection(broker_id: str, credentials: Dict[str, str]) -> Dict[str, Any]:
    """Test connection to a stock broker."""
    try:
        if broker_id == "tradier":
            client = TradierClient(credentials.get("access_token", ""))
            profile = await client.get_profile()
            return {
                "success": True,
                "broker": broker_id,
                "message": f"Connected to Tradier account"
            }
        elif broker_id == "ibkr":
            client = IBKRClient()
            accounts = await client.get_accounts()
            return {
                "success": True,
                "broker": broker_id,
                "accounts": len(accounts)
            }
        else:
            return {
                "success": False,
                "broker": broker_id,
                "error": f"Broker {broker_id} integration not yet implemented"
            }
    except Exception as e:
        return {
            "success": False,
            "broker": broker_id,
            "error": str(e)
        }


def get_supported_stock_brokers() -> List[Dict[str, Any]]:
    """Return list of supported stock brokers with their capabilities."""
    return [
        {
            "id": bid,
            "name": config.get("name"),
            "category": config.get("category", "stocks"),
            "asset_types": config.get("asset_types", ["stocks"]),
            "auth_type": config.get("auth_type"),
            "docs": config.get("docs"),
            "note": config.get("note"),
            "integration_status": "ready" if bid in ["tradier", "alpaca"] else "coming_soon"
        }
        for bid, config in STOCK_BROKERS.items()
    ]


async def sync_broker_trades_to_db(
    broker_id: str,
    credentials: Dict[str, str],
    user_id: str,
    db
) -> Dict[str, Any]:
    """Sync trades from stock broker to database."""
    try:
        if broker_id == "tradier":
            client = TradierClient(credentials.get("access_token", ""))
            accounts = await client.get_accounts()

            total_synced = 0
            for account in accounts:
                trades = await client.get_history(account.account_id)

                for trade in trades:
                    existing = await db["trades"].find_one({
                        "user_id": user_id,
                        "source": broker_id,
                        "external_id": trade.id
                    })

                    if not existing:
                        trade_doc = {
                            "user_id": user_id,
                            "source": broker_id,
                            "external_id": trade.id,
                            "symbol": trade.symbol,
                            "side": trade.side,
                            "quantity": trade.quantity,
                            "entry_price": trade.price,
                            "entry_time": trade.timestamp,
                            "fee": trade.commission,
                            "status": "CLOSED",
                            "synced_at": datetime.utcnow()
                        }
                        await db["trades"].insert_one(trade_doc)
                        total_synced += 1

            return {
                "success": True,
                "broker": broker_id,
                "synced_trades": total_synced
            }
        else:
            return {
                "success": False,
                "broker": broker_id,
                "error": f"Broker {broker_id} sync not yet implemented"
            }
    except Exception as e:
        return {
            "success": False,
            "broker": broker_id,
            "error": str(e)
        }
