# TradeTracking.io - Browser Configuration Guide

This document contains all the information needed for browser-based Claude to complete configuration.

---

## Current Deployment Status

| Service | URL | Status |
|---------|-----|--------|
| Frontend | https://tradetracking.io (Vercel) | Active |
| Backend | https://tradetracking-io-production.up.railway.app | Active |
| Database | MongoDB Atlas | Active |

---

## Environment Variables

### Frontend (Vercel)

```env
# API Connection
NEXT_PUBLIC_API_URL=https://tradetracking-io-production.up.railway.app

# NextAuth Configuration
NEXTAUTH_URL=https://tradetracking.io
NEXTAUTH_SECRET=<generate a secure 32+ char random string>

# Google OAuth (configure in Google Cloud Console)
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>

# Maintenance Mode (set to "true" to enable coming soon page)
MAINTENANCE_MODE=false
```

### Backend (Railway)

```env
# MongoDB Atlas Connection
MONGODB_URL=mongodb+srv://tradetracking_admin:a6eUsTuqCPps9DOf@tradetracking-cluster.hlbiqe6.mongodb.net/

# Database Name
DATABASE_NAME=tradetracking

# API Encryption (for storing exchange API keys)
ENCRYPTION_KEY=<generate a Fernet key: python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())">

# CORS Origins
CORS_ORIGINS=https://tradetracking.io,http://localhost:3000

# JWT Secret
JWT_SECRET=<generate a secure 32+ char random string>
```

---

## MongoDB Atlas Configuration

**Cluster:** tradetracking-cluster.hlbiqe6.mongodb.net
**Database:** tradetracking
**Username:** tradetracking_admin
**Password:** a6eUsTuqCPps9DOf

### Collections:
- `users` - User accounts (12 migrated from Supabase)
- `trades` - Trade history (513 migrated from Supabase)
- `exchange_connections` - Exchange API credentials (3 migrated)
- `playbooks` - Trading playbooks/strategies
- `sessions` - User sessions

### Network Access:
Ensure `0.0.0.0/0` is added to allow Railway connections (or add Railway's IP range).

---

## GitHub Repository

**URL:** https://github.com/matthieukokabi/tradetracking-io
**Branch:** main

### Structure:
```
tradetracking-io/
├── frontend/          # Next.js 16 app
│   ├── app/           # App router pages
│   ├── components/    # React components
│   └── lib/           # Utilities
├── backend/           # FastAPI app
│   ├── api/           # API routes
│   ├── models/        # Pydantic models
│   └── services/      # Business logic
└── scripts/           # Migration scripts
```

---

## VPS Information (Legacy/Backup)

**IP:** 72.61.151.25
**User:** root
**Password:** 8Uf2SQ2Eb9OXk3i2Oz(x

**Legacy Paths:**
- `/var/www/tradetracking` - Old Supabase version
- `/root/backups/` - Various backups

---

## Supported Exchanges (18 Total)

### Crypto CEX (12)
| ID | Name | Futures | Passphrase |
|----|------|---------|------------|
| binance | Binance | Yes | No |
| bybit | Bybit | Yes | No |
| okx | OKX | Yes | Yes |
| coinbase | Coinbase | No | No |
| kraken | Kraken | Yes | No |
| kucoin | KuCoin | Yes | Yes |
| bitget | Bitget | Yes | Yes |
| gate | Gate.io | Yes | No |
| mexc | MEXC | Yes | No |
| cryptocom | Crypto.com | Yes | No |
| htx | HTX (Huobi) | Yes | No |
| woo | WOO X | Yes | No |

### Crypto DEX/Derivatives (5)
| ID | Name | Futures |
|----|------|---------|
| hyperliquid | Hyperliquid | Yes |
| dydx | dYdX | Yes |
| phemex | Phemex | Yes |
| bitmex | BitMEX | Yes |
| apex | Apex | Yes |

### Stocks (1)
| ID | Name | Types |
|----|------|-------|
| alpaca | Alpaca | Stocks, Options |

---

## Admin Access

**Coming Soon Page:** /coming-soon
**Admin Access Page:** /admin-access
**Admin Password:** TradeAdmin2026!

To enable maintenance mode:
1. Set `MAINTENANCE_MODE=true` in Vercel environment variables
2. Redeploy the frontend
3. Access the site via /admin-access with the password above

---

## API Endpoints

**Base URL:** https://tradetracking-io-production.up.railway.app

### Health Check
```
GET /health
```

### Authentication
```
POST /api/v1/auth/register
POST /api/v1/auth/login
GET  /api/v1/auth/me
```

### Trades
```
GET  /api/v1/trades?skip=0&limit=50
POST /api/v1/trades
GET  /api/v1/trades/{trade_id}
PUT  /api/v1/trades/{trade_id}
DELETE /api/v1/trades/{trade_id}
```

### Exchanges
```
GET  /api/v1/exchanges
POST /api/v1/exchanges/connect
POST /api/v1/exchanges/{exchange_id}/sync
DELETE /api/v1/exchanges/{exchange_id}
```

### Analytics
```
GET /api/v1/analytics/summary
GET /api/v1/analytics/performance
```

---

## What Browser Claude Should Check/Configure

### 1. Vercel Dashboard
- Verify all environment variables are set
- Check deployment logs for any errors
- Confirm domain configuration (tradetracking.io)

### 2. Railway Dashboard
- Verify all environment variables are set
- Check deployment logs
- Confirm the service is running on port 8080

### 3. MongoDB Atlas
- Verify network access allows Railway connections
- Check that all collections exist with correct indexes
- Verify data migration was successful

### 4. Google Cloud Console (if using OAuth)
- Configure OAuth consent screen
- Create OAuth 2.0 credentials
- Add authorized redirect URIs:
  - https://tradetracking.io/api/auth/callback/google
  - http://localhost:3000/api/auth/callback/google

### 5. Frontend Component Updates Needed
The frontend ExchangeConnection component may need updating to match all 18 exchanges.
Check: `/frontend/components/exchanges/` or `/frontend/app/settings/`

---

## Stock Brokers Note

The user mentioned 3 stock brokers were previously added, but only Alpaca was found in CCXT.
Possible additional brokers that CCXT supports:
- **Interactive Brokers** - via ibkr (limited CCXT support)
- **Tradier** - not in CCXT, would need custom integration
- **TD Ameritrade** - merged with Schwab, complex integration

If the user remembers which brokers, they can be added to exchange_service.py.

---

## Quick Commands

### Generate Encryption Key
```python
from cryptography.fernet import Fernet
print(Fernet.generate_key().decode())
```

### Generate JWT Secret
```bash
openssl rand -base64 32
```

### Test Backend Health
```bash
curl https://tradetracking-io-production.up.railway.app/health
```

### Test API Auth
```bash
curl -X POST https://tradetracking-io-production.up.railway.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password"}'
```
