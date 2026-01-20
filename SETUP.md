# TradeTracking.io - Complete Setup Guide

## Current Architecture
- **Frontend**: Next.js 16 on Vercel (https://tradetracking.io)
- **Backend**: FastAPI on Railway
- **Database**: MongoDB Atlas
- **Auth**: NextAuth.js with credentials + Google OAuth

> **Note**: This project uses MongoDB only. There is NO Supabase integration.
> If you have users in Supabase from a previous version, they need to be migrated to MongoDB.

---

## Step 1: MongoDB Atlas Setup

### 1.1 Create/Access MongoDB Atlas
1. Go to https://cloud.mongodb.com
2. Create a free cluster if you don't have one

### 1.2 Create Database User
1. Go to **Database Access** → **Add New Database User**
2. Choose **Password** authentication
3. Username: `tradetracking_admin` (or your choice)
4. Password: Generate a strong password (SAVE IT!)
5. Role: **Atlas Admin** or **readWriteAnyDatabase**
6. Click **Add User**

### 1.3 Whitelist All IPs (for Railway)
1. Go to **Network Access** → **Add IP Address**
2. Click **Allow Access from Anywhere** (adds 0.0.0.0/0)
3. Click **Confirm**

### 1.4 Get Connection String
1. Go to **Database** → **Connect** → **Drivers**
2. Copy the connection string, it looks like:
   ```
   mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/
   ```
3. Replace `USERNAME` and `PASSWORD` with your actual credentials
4. Add database name at the end:
   ```
   mongodb+srv://tradetracking_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/tradetracking?retryWrites=true&w=majority
   ```

---

## Step 2: Railway Backend Setup

### 2.1 Environment Variables for Railway
Go to Railway → Your Project → Variables, and add:

```env
# REQUIRED
ENVIRONMENT=production
MONGODB_URL=mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/tradetracking?retryWrites=true&w=majority
SECRET_KEY=<generate with: openssl rand -hex 32>
ALLOWED_ORIGINS=https://tradetracking.io,https://www.tradetracking.io,https://tradetracking-io.vercel.app

# REQUIRED for Exchange Connections
ENCRYPTION_KEY=<generate with: python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())">

# OPTIONAL - Stripe (add when ready for payments)
STRIPE_SECRET_KEY=sk_live_xxx or sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRO_MONTHLY_PRICE_ID=price_xxx
STRIPE_PRO_YEARLY_PRICE_ID=price_xxx
STRIPE_ELITE_MONTHLY_PRICE_ID=price_xxx
STRIPE_ELITE_YEARLY_PRICE_ID=price_xxx
```

### 2.2 Set Custom Domain (Optional)
1. Railway → Settings → Networking → Custom Domain
2. Add: `api.tradetracking.io`
3. Add CNAME record in Namecheap pointing to Railway

---

## Step 3: Vercel Frontend Setup

### 3.1 Environment Variables for Vercel
Go to Vercel → Project Settings → Environment Variables, and add:

```env
# REQUIRED
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
NEXTAUTH_URL=https://tradetracking.io
NEXT_PUBLIC_API_URL=https://api.tradetracking.io  (or your Railway URL)

# OPTIONAL - Google OAuth
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx
```

### 3.2 Custom Domain
Should already be set to `tradetracking.io`

---

## Step 4: Google OAuth Setup (Optional)

1. Go to https://console.cloud.google.com/apis/credentials
2. Create OAuth 2.0 Client ID
3. Authorized redirect URIs:
   - `https://tradetracking.io/api/auth/callback/google`
   - `http://localhost:3000/api/auth/callback/google` (for dev)
4. Copy Client ID and Client Secret to Vercel env vars

---

## Step 5: Namecheap DNS Setup

### For tradetracking.io (Vercel):
```
Type: A
Host: @
Value: 76.76.21.21

Type: CNAME
Host: www
Value: cname.vercel-dns.com
```

### For api.tradetracking.io (Railway):
```
Type: CNAME
Host: api
Value: <your-railway-app>.up.railway.app
```

---

## Step 6: Verify Everything Works

### Test Backend:
```bash
curl https://api.tradetracking.io/api/v1/health
# Should return: {"status":"healthy","service":"backend"}
```

### Test Frontend:
1. Go to https://tradetracking.io
2. Try to register a new account
3. Login should work

### Check Railway Logs:
```bash
# If you have Railway CLI
railway logs
```

---

## Migrating Users from Supabase (If Needed)

If you have existing users in Supabase that need to be in MongoDB:

### Export from Supabase:
1. Go to Supabase Dashboard → Table Editor → users
2. Export as CSV

### Import to MongoDB:
```python
# Run this script locally with your MongoDB connection
import csv
from pymongo import MongoClient
from datetime import datetime
import bcrypt

client = MongoClient("mongodb+srv://...")
db = client["tradetracking"]

with open("supabase_users.csv") as f:
    reader = csv.DictReader(f)
    for row in reader:
        user = {
            "username": row["username"] or row["email"].split("@")[0],
            "email": row["email"],
            "hashed_password": bcrypt.hashpw(
                "TempPassword123!".encode(),
                bcrypt.gensalt()
            ).decode(),
            "subscription_tier": "starter",
            "created_at": datetime.utcnow()
        }
        db["users"].insert_one(user)
        print(f"Migrated: {user['email']}")
```

Then notify users to reset their passwords.

---

## Quick Reference - All Environment Variables

### Backend (Railway):
| Variable | Required | Example |
|----------|----------|---------|
| `ENVIRONMENT` | Yes | `production` |
| `MONGODB_URL` | Yes | `mongodb+srv://user:pass@cluster.mongodb.net/tradetracking` |
| `SECRET_KEY` | Yes | `64-char-hex-string` |
| `ALLOWED_ORIGINS` | Yes | `https://tradetracking.io,https://www.tradetracking.io` |
| `ENCRYPTION_KEY` | For exchanges | Fernet key |
| `STRIPE_SECRET_KEY` | For payments | `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | For payments | `whsec_...` |

### Frontend (Vercel):
| Variable | Required | Example |
|----------|----------|---------|
| `NEXTAUTH_SECRET` | Yes | `base64-string` |
| `NEXTAUTH_URL` | Yes | `https://tradetracking.io` |
| `NEXT_PUBLIC_API_URL` | Yes | `https://api.tradetracking.io` |
| `GOOGLE_CLIENT_ID` | For Google login | `xxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | For Google login | `GOCSPX-xxx` |

---

## Troubleshooting

### "Authentication failed" from MongoDB
- Check username/password in connection string
- Ensure IP whitelist includes 0.0.0.0/0
- Verify database user has correct permissions

### Railway app crashing
- Check logs: `railway logs`
- Ensure all required env vars are set
- Check Dockerfile uses `${PORT:-8000}`

### Frontend can't reach backend
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check CORS `ALLOWED_ORIGINS` includes frontend URL
- Test backend health endpoint directly

### Google OAuth not working
- Verify redirect URIs in Google Console
- Check `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set
- Ensure `NEXTAUTH_URL` matches your domain
