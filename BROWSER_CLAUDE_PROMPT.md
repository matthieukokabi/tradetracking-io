# FINAL PROMPT FOR BROWSER CLAUDE

Copy and paste this entire prompt to Claude in your browser to complete the configuration and testing of TradeTracking.io.

---

## PROMPT START

You are helping me configure and test TradeTracking.io, a trading journal platform. Here's the complete context:

### PROJECT OVERVIEW
- **Frontend**: Next.js 16 on Vercel at https://tradetracking.io
- **Backend**: FastAPI on Railway at https://tradetracking-io-production.up.railway.app
- **Database**: MongoDB Atlas
- **GitHub**: https://github.com/matthieukokabi/tradetracking-io

### CURRENT STATUS
- Backend deployed and healthy (just pushed new stock broker integrations)
- Frontend deployed with coming soon/maintenance mode capability
- Database has 12 users, 513 trades migrated from Supabase
- 24 exchanges/brokers now supported

### WHAT I NEED YOU TO DO

#### 1. VERIFY VERCEL CONFIGURATION
Go to Vercel dashboard and check these environment variables are set:
```
NEXT_PUBLIC_API_URL=https://tradetracking-io-production.up.railway.app
NEXTAUTH_URL=https://tradetracking.io
NEXTAUTH_SECRET=<should be set - generate 32+ char random string if missing>
GOOGLE_CLIENT_ID=<check if set for Google OAuth>
GOOGLE_CLIENT_SECRET=<check if set for Google OAuth>
MAINTENANCE_MODE=false (set to "true" to enable coming soon page)
```

#### 2. VERIFY RAILWAY CONFIGURATION
Go to Railway dashboard and check these environment variables:
```
MONGODB_URL=mongodb+srv://tradetracking_admin:a6eUsTuqCPps9DOf@tradetracking-cluster.hlbiqe6.mongodb.net/
DATABASE_NAME=tradetracking
ENCRYPTION_KEY=<generate with: python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())">
CORS_ORIGINS=https://tradetracking.io,http://localhost:3000
JWT_SECRET=<generate 32+ char random string>
```

#### 3. TEST API ENDPOINTS
Test these endpoints and report results:

```bash
# Health check
curl https://tradetracking-io-production.up.railway.app/health

# Get supported exchanges (should return 24 now)
curl https://tradetracking-io-production.up.railway.app/api/v1/exchanges/supported
```

#### 4. VERIFY MONGODB ATLAS
Go to MongoDB Atlas dashboard:
- Cluster: tradetracking-cluster.hlbiqe6.mongodb.net
- Database: tradetracking
- Check collections exist: users, trades, exchange_connections, playbooks, sessions
- Verify network access allows 0.0.0.0/0 (or Railway's IP)

#### 5. CONFIGURE GOOGLE OAUTH (if not done)
In Google Cloud Console:
1. Create OAuth 2.0 credentials
2. Add authorized redirect URIs:
   - https://tradetracking.io/api/auth/callback/google
   - http://localhost:3000/api/auth/callback/google
3. Copy Client ID and Secret to Vercel env vars

#### 6. UPDATE FRONTEND EXCHANGE COMPONENT
The backend now supports 24 exchanges. Check if the frontend ExchangeConnection component lists all of them:
- Check `/frontend/components/` or `/frontend/app/settings/` for exchange selection UI
- Update to include all exchanges from the supported list

#### 7. TEST USER FLOWS
1. Visit https://tradetracking.io
2. Test registration/login
3. Test dashboard access
4. Test exchange connection UI

#### 8. ADMIN ACCESS
- Coming soon page: /coming-soon
- Admin access: /admin-access
- Password: TradeAdmin2026!

### SUPPORTED EXCHANGES (24 TOTAL)

**Crypto CEX via CCXT (12):**
binance, bybit, okx, coinbase, kraken, kucoin, bitget, gate, mexc, cryptocom, htx, woo

**Crypto DEX via CCXT (5):**
hyperliquid, dydx, phemex, bitmex, apex

**Stocks via CCXT (1):**
alpaca

**Stocks via Direct API (6):**
tradier (ready), ibkr (ready), etrade (coming), schwab (coming), webull (coming), firstrade (coming)

### CREDENTIALS REFERENCE

**MongoDB Atlas:**
- Connection: mongodb+srv://tradetracking_admin:a6eUsTuqCPps9DOf@tradetracking-cluster.hlbiqe6.mongodb.net/
- Database: tradetracking

**VPS (legacy backup):**
- IP: 72.61.151.25
- User: root
- Password: 8Uf2SQ2Eb9OXk3i2Oz(x

### REPORT BACK
After checking everything, provide:
1. List of any missing environment variables
2. Any API endpoints that fail
3. Any frontend components that need updating
4. Recommendations for next steps

---

## PROMPT END

---

## QUICK CHECKLIST FOR YOU (Ralph)

Before giving this to browser Claude:
- [ ] Have Vercel dashboard access ready
- [ ] Have Railway dashboard access ready
- [ ] Have MongoDB Atlas dashboard access ready
- [ ] Have Google Cloud Console access ready (if setting up OAuth)
- [ ] Have GitHub access ready

Browser Claude will verify each service, test the APIs, and report what needs fixing.
