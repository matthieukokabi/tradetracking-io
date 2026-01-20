# Migration Guide: Supabase → MongoDB

This guide walks you through migrating TradeTracking.io from the current Supabase-based backend (running on Railway) to the MongoDB-based backend (in GitHub).

---

## Current Situation

| Component | Current State | Target State |
|-----------|---------------|--------------|
| **Railway Backend** | v2.0.0 with Supabase | v0.1.0+ with MongoDB |
| **Database** | Supabase PostgreSQL | MongoDB Atlas |
| **API Endpoints** | `/api/*` (no v1 prefix) | `/api/v1/*` |
| **Auth** | Supabase Auth | NextAuth.js + MongoDB |

---

## Step 1: Export Data from Supabase

### 1.1 Get Your Supabase Credentials

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **service_role key** (NOT the anon key - you need full access)

### 1.2 Run the Export Script

```bash
cd /Users/magikmad/tradezella-killer/scripts

# Install required package
pip install supabase

# Set environment variables
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Run export
python export_supabase.py
```

This will create a `supabase_export/export_YYYYMMDD_HHMMSS/` directory with JSON files for all your data.

### 1.3 Verify Export

Check the export directory:
```bash
ls -la supabase_export/export_*/
```

You should see files like:
- `auth_users.json` - All Supabase Auth users
- `trades.json` - Trade history
- `subscriptions.json` - Subscription data
- `export_summary.json` - Export metadata

---

## Step 2: Set Up MongoDB Atlas

### 2.1 Create MongoDB Atlas Account/Cluster

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Sign up or log in
3. Create a **Free Tier** cluster (M0) if you don't have one

### 2.2 Create Database User

1. Go to **Database Access** → **Add New Database User**
2. **Authentication Method**: Password
3. **Username**: `tradetracking_admin`
4. **Password**: Generate and **SAVE** a strong password
5. **Database User Privileges**: Atlas Admin
6. Click **Add User**

### 2.3 Configure Network Access

1. Go to **Network Access** → **Add IP Address**
2. Click **Allow Access from Anywhere** (adds `0.0.0.0/0`)
3. Click **Confirm**

> ⚠️ For production, consider using Railway's static IPs instead

### 2.4 Get Connection String

1. Go to **Database** → **Connect** → **Drivers**
2. Select **Python** and version **3.6 or later**
3. Copy the connection string
4. Replace `<password>` with your actual password
5. Add database name:

```
mongodb+srv://tradetracking_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/tradetracking?retryWrites=true&w=majority
```

---

## Step 3: Import Data to MongoDB

### 3.1 Run the Import Script

```bash
cd /Users/magikmad/tradezella-killer/scripts

# Install required packages
pip install pymongo bcrypt

# Set environment variable
export MONGODB_URL="mongodb+srv://tradetracking_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/tradetracking?retryWrites=true&w=majority"

# Run import
python import_to_mongodb.py
```

### 3.2 Verify Import

Connect to MongoDB Atlas dashboard:
1. Go to **Database** → **Browse Collections**
2. Select the `tradetracking` database
3. Verify collections: `users`, `trades`, `exchange_connections`

---

## Step 4: Configure Railway for MongoDB Backend

### 4.1 Disconnect Current Deployment

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Select your project
3. Go to **Settings** → **Source**
4. Note the current configuration (for backup)

### 4.2 Connect to Correct GitHub Repo

1. **Settings** → **Source** → **Connect GitHub**
2. Repository: `matthieukokabi/tradetracking-io` (or your repo)
3. **Root Directory**: `/backend`
4. Branch: `main`

### 4.3 Update Environment Variables

Remove old Supabase variables and add MongoDB variables:

| Variable | Value |
|----------|-------|
| `ENVIRONMENT` | `production` |
| `MONGODB_URL` | `mongodb+srv://...` (your connection string) |
| `SECRET_KEY` | Generate: `openssl rand -hex 32` |
| `ALLOWED_ORIGINS` | `https://tradetracking.io,https://www.tradetracking.io` |
| `ENCRYPTION_KEY` | Generate: `python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"` |

**Variables to REMOVE:**
- `SUPABASE_URL`
- `SUPABASE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- Any other Supabase-related variables

### 4.4 Trigger Redeploy

1. Click **Deploy** or push a commit
2. Watch the logs to ensure successful startup
3. Test the health endpoint:

```bash
curl https://your-railway-app.up.railway.app/api/v1/health
# Expected: {"status":"healthy","service":"backend"}
```

---

## Step 5: Update Vercel Frontend

### 5.1 Update Environment Variables

Go to Vercel → Project Settings → Environment Variables:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://api.tradetracking.io` (or Railway URL) |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://tradetracking.io` |

### 5.2 Redeploy Frontend

```bash
# Or trigger from Vercel dashboard
vercel --prod
```

---

## Step 6: Post-Migration Tasks

### 6.1 User Password Reset

All migrated users have a temporary password. Options:

**Option A: Bulk Password Reset Email**
Notify users to reset their passwords via the app's "Forgot Password" feature.

**Option B: Force Password Change**
The migrated users have `needs_password_reset: true` flag. Update your frontend to check this and force password change on login.

### 6.2 Exchange API Keys

Exchange connections are migrated but API keys are NOT (they were encrypted with the old system). Users need to:
1. Log in to the app
2. Go to exchange connections
3. Re-enter their API keys

### 6.3 Verify Everything Works

1. **Test user login**: Use a migrated account
2. **Test registration**: Create a new account
3. **Test trades**: View existing trades
4. **Test API**: Make API calls from the frontend

---

## Troubleshooting

### Railway Build Fails

```bash
# Check logs
railway logs
```

Common issues:
- Missing environment variables
- Requirements.txt has incompatible versions
- Dockerfile syntax errors

### MongoDB Connection Fails

- Verify IP whitelist includes `0.0.0.0/0`
- Check username/password in connection string
- Ensure database name is included in URL

### Frontend Can't Reach Backend

- Check `NEXT_PUBLIC_API_URL` in Vercel
- Verify `ALLOWED_ORIGINS` in Railway includes frontend URL
- Check for CORS errors in browser console

### "Invalid credentials" on Login

- Migrated users need to reset passwords
- Check if user exists in MongoDB:
  ```bash
  # In MongoDB shell
  db.users.findOne({email: "user@example.com"})
  ```

---

## Quick Reference

### Generate Required Keys

```bash
# SECRET_KEY (for JWT)
openssl rand -hex 32

# NEXTAUTH_SECRET
openssl rand -base64 32

# ENCRYPTION_KEY (for API keys)
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

### Test Endpoints

```bash
# Health check
curl https://api.tradetracking.io/api/v1/health

# Auth test (should return 401 without token)
curl https://api.tradetracking.io/api/v1/trades
```

---

## Rollback Plan

If migration fails, you can revert Railway to the old Supabase backend:

1. Railway → Settings → Source
2. Change root directory back to old location
3. Restore old environment variables
4. Redeploy

Keep your Supabase project active for at least 30 days after migration as backup.
