"""
Exchange Service - CCXT Integration for TradeTracking.io
Supports 23+ exchanges and brokers:
  - Crypto CEX (12): Binance, Bybit, OKX, Coinbase, Kraken, KuCoin, Bitget, Gate, MEXC, Crypto.com, HTX, WOO X
  - Crypto DEX (5): Hyperliquid, dYdX, Phemex, BitMEX, Apex
  - Stocks via CCXT (1): Alpaca
  - Stocks via Direct API (6): Tradier, E*TRADE, Schwab, Interactive Brokers, Webull, Firstrade

For stock brokers with direct API integration, see stock_broker_service.py
"""

import ccxt
from typing import List, Dict, Optional, Any
from pydantic import BaseModel
from datetime import datetime, timedelta
from cryptography.fernet import Fernet
import os
import asyncio

# Encryption key for API keys (should be in env vars in production)
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY", Fernet.generate_key().decode())
cipher = Fernet(ENCRYPTION_KEY.encode() if isinstance(ENCRYPTION_KEY, str) else ENCRYPTION_KEY)


class ExchangeCredentials(BaseModel):
    exchange: str
    api_key: str
    api_secret: str
    passphrase: Optional[str] = None  # For exchanges like OKX that require it


class ExchangeBalance(BaseModel):
    currency: str
    total: float
    free: float
    used: float
    usd_value: Optional[float] = None


class ExchangeTrade(BaseModel):
    id: str
    symbol: str
    side: str
    price: float
    amount: float
    cost: float
    timestamp: datetime
    fee: Optional[float] = None
    fee_currency: Optional[str] = None


class ExchangePosition(BaseModel):
    symbol: str
    side: str
    size: float
    entry_price: float
    mark_price: float
    unrealized_pnl: float
    leverage: Optional[int] = None


# Supported exchanges configuration
SUPPORTED_EXCHANGES = {
    # === CRYPTO SPOT & FUTURES (CEX) ===
    "binance": {"class": ccxt.binance, "has_futures": True, "category": "crypto"},
    "bybit": {"class": ccxt.bybit, "has_futures": True, "category": "crypto"},
    "okx": {"class": ccxt.okx, "has_futures": True, "requires_passphrase": True, "category": "crypto"},
    "coinbase": {"class": ccxt.coinbase, "has_futures": False, "category": "crypto"},
    "kraken": {"class": ccxt.kraken, "has_futures": True, "category": "crypto"},
    "kucoin": {"class": ccxt.kucoin, "has_futures": True, "requires_passphrase": True, "category": "crypto"},
    "bitget": {"class": ccxt.bitget, "has_futures": True, "requires_passphrase": True, "category": "crypto"},
    "gate": {"class": ccxt.gate, "has_futures": True, "category": "crypto"},
    "mexc": {"class": ccxt.mexc, "has_futures": True, "category": "crypto"},
    "cryptocom": {"class": ccxt.cryptocom, "has_futures": True, "category": "crypto"},
    "htx": {"class": ccxt.htx, "has_futures": True, "category": "crypto"},  # Formerly Huobi
    "woo": {"class": ccxt.woo, "has_futures": True, "category": "crypto"},  # WOO X

    # === CRYPTO DERIVATIVES (DEX) ===
    "hyperliquid": {"class": ccxt.hyperliquid, "has_futures": True, "category": "crypto-derivatives"},
    "dydx": {"class": ccxt.dydx, "has_futures": True, "category": "crypto-derivatives"},
    "phemex": {"class": ccxt.phemex, "has_futures": True, "category": "crypto-derivatives"},
    "bitmex": {"class": ccxt.bitmex, "has_futures": True, "category": "crypto-derivatives"},
    "apex": {"class": ccxt.apex, "has_futures": True, "category": "crypto-derivatives"},

    # === STOCK MARKET ===
    "alpaca": {"class": ccxt.alpaca, "has_futures": False, "category": "stocks", "asset_types": ["stocks", "options"]},
}


def encrypt_api_key(api_key: str) -> str:
    """Encrypt API key before storing in database."""
    return cipher.encrypt(api_key.encode()).decode()


def decrypt_api_key(encrypted_key: str) -> str:
    """Decrypt API key from database."""
    return cipher.decrypt(encrypted_key.encode()).decode()


def create_exchange_client(
    exchange_id: str,
    api_key: str,
    api_secret: str,
    passphrase: Optional[str] = None,
    testnet: bool = False
) -> Any:
    """Create a CCXT exchange client instance."""
    if exchange_id not in SUPPORTED_EXCHANGES:
        raise ValueError(f"Exchange {exchange_id} is not supported")

    config = SUPPORTED_EXCHANGES[exchange_id]
    exchange_class = config["class"]

    options = {
        "apiKey": api_key,
        "secret": api_secret,
        "enableRateLimit": True,
        "timeout": 30000,
    }

    if config.get("requires_passphrase") and passphrase:
        options["password"] = passphrase

    if testnet:
        options["sandbox"] = True

    return exchange_class(options)


async def test_connection(
    exchange_id: str,
    api_key: str,
    api_secret: str,
    passphrase: Optional[str] = None
) -> Dict[str, Any]:
    """Test exchange API connection and return account info."""
    try:
        exchange = create_exchange_client(exchange_id, api_key, api_secret, passphrase)

        # Use asyncio to run sync methods
        loop = asyncio.get_event_loop()
        balance = await loop.run_in_executor(None, exchange.fetch_balance)

        # Calculate total balance in USD (simplified)
        total_usd = 0.0
        if "USDT" in balance.get("total", {}):
            total_usd = float(balance["total"]["USDT"] or 0)
        elif "USD" in balance.get("total", {}):
            total_usd = float(balance["total"]["USD"] or 0)
        elif "USDC" in balance.get("total", {}):
            total_usd = float(balance["total"]["USDC"] or 0)

        return {
            "success": True,
            "exchange": exchange_id,
            "total_balance_usd": total_usd,
            "currencies": len([k for k, v in balance.get("total", {}).items() if v and float(v) > 0])
        }
    except Exception as e:
        return {
            "success": False,
            "exchange": exchange_id,
            "error": str(e)
        }


async def fetch_balances(
    exchange_id: str,
    api_key: str,
    api_secret: str,
    passphrase: Optional[str] = None
) -> List[ExchangeBalance]:
    """Fetch account balances from exchange."""
    exchange = create_exchange_client(exchange_id, api_key, api_secret, passphrase)

    loop = asyncio.get_event_loop()
    balance = await loop.run_in_executor(None, exchange.fetch_balance)

    result = []
    for currency, data in balance.items():
        if isinstance(data, dict) and data.get("total") and float(data["total"]) > 0:
            result.append(ExchangeBalance(
                currency=currency,
                total=float(data.get("total", 0)),
                free=float(data.get("free", 0)),
                used=float(data.get("used", 0))
            ))

    return result


async def fetch_trades(
    exchange_id: str,
    api_key: str,
    api_secret: str,
    passphrase: Optional[str] = None,
    symbol: Optional[str] = None,
    since: Optional[datetime] = None,
    limit: int = 100
) -> List[ExchangeTrade]:
    """Fetch trade history from exchange."""
    exchange = create_exchange_client(exchange_id, api_key, api_secret, passphrase)

    loop = asyncio.get_event_loop()

    since_timestamp = None
    if since:
        since_timestamp = int(since.timestamp() * 1000)

    if symbol:
        trades = await loop.run_in_executor(
            None,
            lambda: exchange.fetch_my_trades(symbol, since_timestamp, limit)
        )
    else:
        # Fetch trades for all symbols (may require multiple calls)
        await loop.run_in_executor(None, exchange.load_markets)
        trades = []
        # Get most traded symbols
        for sym in list(exchange.markets.keys())[:10]:
            try:
                sym_trades = await loop.run_in_executor(
                    None,
                    lambda s=sym: exchange.fetch_my_trades(s, since_timestamp, limit)
                )
                trades.extend(sym_trades)
            except Exception:
                continue

    result = []
    for trade in trades[:limit]:
        result.append(ExchangeTrade(
            id=str(trade.get("id", "")),
            symbol=trade.get("symbol", ""),
            side=trade.get("side", "").upper(),
            price=float(trade.get("price", 0)),
            amount=float(trade.get("amount", 0)),
            cost=float(trade.get("cost", 0)),
            timestamp=datetime.fromtimestamp(trade.get("timestamp", 0) / 1000),
            fee=float(trade.get("fee", {}).get("cost", 0)) if trade.get("fee") else None,
            fee_currency=trade.get("fee", {}).get("currency") if trade.get("fee") else None
        ))

    return result


async def fetch_positions(
    exchange_id: str,
    api_key: str,
    api_secret: str,
    passphrase: Optional[str] = None
) -> List[ExchangePosition]:
    """Fetch open positions (for futures/derivatives exchanges)."""
    config = SUPPORTED_EXCHANGES.get(exchange_id, {})
    if not config.get("has_futures"):
        return []

    exchange = create_exchange_client(exchange_id, api_key, api_secret, passphrase)

    try:
        loop = asyncio.get_event_loop()
        positions = await loop.run_in_executor(None, exchange.fetch_positions)

        result = []
        for pos in positions:
            if pos.get("contracts") and float(pos["contracts"]) != 0:
                result.append(ExchangePosition(
                    symbol=pos.get("symbol", ""),
                    side=pos.get("side", "").upper(),
                    size=abs(float(pos.get("contracts", 0))),
                    entry_price=float(pos.get("entryPrice", 0)),
                    mark_price=float(pos.get("markPrice", 0)),
                    unrealized_pnl=float(pos.get("unrealizedPnl", 0)),
                    leverage=int(pos.get("leverage", 1)) if pos.get("leverage") else None
                ))

        return result
    except Exception:
        return []


async def sync_trades_to_db(
    exchange_id: str,
    api_key: str,
    api_secret: str,
    passphrase: Optional[str],
    user_id: str,
    db
) -> Dict[str, Any]:
    """Sync trades from exchange to database."""
    try:
        # Get last synced trade timestamp
        last_trade = await db["trades"].find_one(
            {"user_id": user_id, "source": exchange_id},
            sort=[("entry_time", -1)]
        )

        since = None
        if last_trade and last_trade.get("entry_time"):
            since = last_trade["entry_time"]
        else:
            # Default to last 30 days
            since = datetime.utcnow() - timedelta(days=30)

        # Fetch trades from exchange
        trades = await fetch_trades(
            exchange_id, api_key, api_secret, passphrase,
            since=since, limit=500
        )

        # Insert new trades
        inserted_count = 0
        for trade in trades:
            # Check if trade already exists
            existing = await db["trades"].find_one({
                "user_id": user_id,
                "source": exchange_id,
                "external_id": trade.id
            })

            if not existing:
                trade_doc = {
                    "user_id": user_id,
                    "source": exchange_id,
                    "external_id": trade.id,
                    "symbol": trade.symbol,
                    "side": trade.side,
                    "quantity": trade.amount,
                    "entry_price": trade.price,
                    "entry_time": trade.timestamp,
                    "fee": trade.fee,
                    "fee_currency": trade.fee_currency,
                    "pnl": None,  # Will be calculated by matching engine
                    "status": "CLOSED",
                    "synced_at": datetime.utcnow()
                }
                await db["trades"].insert_one(trade_doc)
                inserted_count += 1

        return {
            "success": True,
            "exchange": exchange_id,
            "synced_trades": inserted_count,
            "total_fetched": len(trades)
        }
    except Exception as e:
        return {
            "success": False,
            "exchange": exchange_id,
            "error": str(e)
        }


def get_supported_exchanges() -> List[Dict[str, Any]]:
    """Return list of supported exchanges with their capabilities."""
    return [
        {
            "id": eid,
            "name": eid.capitalize(),
            "has_futures": config.get("has_futures", False),
            "requires_passphrase": config.get("requires_passphrase", False),
            "category": config.get("category", "crypto"),
            "asset_types": config.get("asset_types", ["crypto"]),
        }
        for eid, config in SUPPORTED_EXCHANGES.items()
    ]
