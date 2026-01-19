from fastapi import FastAPI, HTTPException, Body, status, UploadFile, File, Depends, Query
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware
from fastapi.encoders import jsonable_encoder
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
import os
import pandas as pd
import io
from typing import List, Optional
from jose import JWTError, jwt

from database import connect_to_mongo, close_mongo_connection, db
from indexes import create_indexes
from models import Trade, TradeCreate, TradeUpdate, TradeSide, TradeStatus, User, UserCreate, UserInDB
from schemas import JournalResponse, DailyJournalStat, EquityCurveResponse, EquityPoint
from auth import get_password_hash, verify_password, create_access_token, SECRET_KEY, ALGORITHM, validate_password_strength

app = FastAPI(title="TradeTracking API", version="0.1.0")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")

# --- Common Dependencies ---

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = await db.db["users"].find_one({"username": username})
    if user is None:
        raise credentials_exception
    return User(**user)

async def get_trade_filters(
    start_date: Optional[str] = Query(None, description="Start date (ISO format)"),
    end_date: Optional[str] = Query(None, description="End date (ISO format)"),
    symbol: Optional[str] = Query(None, description="Filter by symbol"),
    side: Optional[TradeSide] = Query(None, description="Filter by side (BUY/SELL)"),
    status: Optional[TradeStatus] = Query(None, description="Filter by status (OPEN/CLOSED)"),
):
    return {
        "start_date": start_date,
        "end_date": end_date,
        "symbol": symbol,
        "side": side,
        "status": status,
    }

def build_mongo_query(user_id: str, filters: dict) -> dict:
    query = {"user_id": user_id}

    if filters.get("symbol"):
        query["symbol"] = filters["symbol"].upper()

    if filters.get("side"):
        query["side"] = filters["side"]

    if filters.get("status"):
        query["status"] = filters["status"]

    date_query = {}
    if filters.get("start_date"):
        date_query["$gte"] = filters["start_date"]
    if filters.get("end_date"):
        # Append end of day time if just a date provided, or rely on ISO string comparison
        # Assuming simple string comparison for now as entry_time is ISO string
        date_query["$lte"] = filters["end_date"]

    if date_query:
        query["entry_time"] = date_query

    return query

# CORS Configuration
origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database Events
@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()
    await create_indexes()

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()

class HealthCheck(BaseModel):
    status: str
    version: str

class DashboardStats(BaseModel):
    total_pnl: float
    win_rate: float
    profit_factor: float
    total_trades: int
    winning_trades: int
    losing_trades: int
    breakeven_trades: int

@app.get("/", response_model=HealthCheck)
async def root():
    return {"status": "ok", "version": "0.1.0"}

@app.get("/api/v1/health")
async def health():
    return {"status": "healthy", "service": "backend"}

# --- Auth Routes ---

@app.post("/api/v1/auth/register", response_model=User)
async def register(user: UserCreate):
    # Check if user exists
    existing_user = await db.db["users"].find_one({"username": user.username})
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")

    existing_email = await db.db["users"].find_one({"email": user.email})
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Validate password strength
    is_valid, error_message = validate_password_strength(user.password)
    if not is_valid:
        raise HTTPException(status_code=400, detail=error_message)

    # Hash password
    hashed_password = get_password_hash(user.password)

    # Create UserInDB dict (exclude raw password)
    user_dict = user.model_dump(exclude={"password"})
    user_dict["hashed_password"] = hashed_password
    user_dict["created_at"] = datetime.utcnow() # explicit datetime

    # Insert
    new_user = await db.db["users"].insert_one(user_dict)
    created_user = await db.db["users"].find_one({"_id": new_user.inserted_id})
    return User(**created_user)

@app.post("/api/v1/auth/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await db.db["users"].find_one({"username": form_data.username})
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect username or password")

    if not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Incorrect username or password")

    access_token = create_access_token(data={"sub": user["username"], "id": str(user["_id"])})
    return {"access_token": access_token, "token_type": "bearer"}


class GoogleAuthRequest(BaseModel):
    email: str
    name: str
    google_id: str
    image: Optional[str] = None


@app.post("/api/v1/auth/google")
async def google_auth(auth_request: GoogleAuthRequest):
    """Handle Google OAuth - create or link user account"""
    # Check if user exists by google_id or email
    user = await db.db["users"].find_one({"google_id": auth_request.google_id})

    if not user:
        # Check if email already registered (link accounts)
        user = await db.db["users"].find_one({"email": auth_request.email})

        if user:
            # Link Google account to existing user
            await db.db["users"].update_one(
                {"_id": user["_id"]},
                {"$set": {
                    "google_id": auth_request.google_id,
                    "avatar_url": auth_request.image,
                    "oauth_provider": "google"
                }}
            )
        else:
            # Create new user from Google data
            import secrets
            username = auth_request.email.split("@")[0] + "_" + secrets.token_hex(4)

            user_dict = {
                "username": username,
                "email": auth_request.email,
                "hashed_password": "",  # No password for OAuth users
                "google_id": auth_request.google_id,
                "oauth_provider": "google",
                "avatar_url": auth_request.image,
                "subscription_tier": "starter",
                "created_at": datetime.utcnow()
            }
            result = await db.db["users"].insert_one(user_dict)
            user = await db.db["users"].find_one({"_id": result.inserted_id})

    # Generate access token
    access_token = create_access_token(data={"sub": user["username"], "id": str(user["_id"])})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": str(user["_id"])
    }

@app.get("/api/v1/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    filters: dict = Depends(get_trade_filters)
):
    match_stage = build_mongo_query(str(current_user.id), filters)

    # Ensure only closed trades or trades with P&L are considered for P&L stats
    # But for total_trades we want all matches.
    # We can use facets to get multiple counts in one query.

    pipeline = [
        {"$match": match_stage},
        {"$facet": {
            "totals": [
                {"$count": "count"}
            ],
            "pnl_stats": [
                {"$match": {"pnl": {"$ne": None}}},
                {"$group": {
                    "_id": None,
                    "total_pnl": {"$sum": "$pnl"},
                    "winning_trades": {
                        "$sum": {"$cond": [{"$gt": ["$pnl", 0]}, 1, 0]}
                    },
                    "losing_trades": {
                        "$sum": {"$cond": [{"$lt": ["$pnl", 0]}, 1, 0]}
                    },
                    "breakeven_trades": {
                        "$sum": {"$cond": [{"$eq": ["$pnl", 0]}, 1, 0]}
                    },
                    "gross_profit": {
                        "$sum": {"$cond": [{"$gt": ["$pnl", 0]}, "$pnl", 0]}
                    },
                    "gross_loss": {
                        "$sum": {"$cond": [{"$lt": ["$pnl", 0]}, {"$abs": "$pnl"}, 0]}
                    }
                }}
            ]
        }}
    ]

    result = await db.db["trades"].aggregate(pipeline).to_list(1)

    stats = {
        "total_trades": 0,
        "total_pnl": 0.0,
        "winning_trades": 0,
        "losing_trades": 0,
        "breakeven_trades": 0,
        "gross_profit": 0.0,
        "gross_loss": 0.0
    }

    if result:
        data = result[0]
        if data["totals"]:
            stats["total_trades"] = data["totals"][0]["count"]

        if data["pnl_stats"]:
            pnl_data = data["pnl_stats"][0]
            stats.update({
                "total_pnl": pnl_data.get("total_pnl", 0.0),
                "winning_trades": pnl_data.get("winning_trades", 0),
                "losing_trades": pnl_data.get("losing_trades", 0),
                "breakeven_trades": pnl_data.get("breakeven_trades", 0),
                "gross_profit": pnl_data.get("gross_profit", 0.0),
                "gross_loss": pnl_data.get("gross_loss", 0.0),
            })

    count_valid_pnl = stats["winning_trades"] + stats["losing_trades"] + stats["breakeven_trades"]
    win_rate = (stats["winning_trades"] / count_valid_pnl) * 100 if count_valid_pnl > 0 else 0
    profit_factor = (stats["gross_profit"] / stats["gross_loss"]) if stats["gross_loss"] > 0 else 0
    # Cap profit factor for JSON safety if needed, though float('inf') is standard in Python but not JSON
    if stats["gross_loss"] == 0 and stats["gross_profit"] > 0:
        profit_factor = 99.0

    return DashboardStats(
        total_pnl=stats["total_pnl"],
        win_rate=round(win_rate, 2),
        profit_factor=round(profit_factor, 2),
        total_trades=stats["total_trades"],
        winning_trades=stats["winning_trades"],
        losing_trades=stats["losing_trades"],
        breakeven_trades=stats["breakeven_trades"]
    )

@app.get("/api/v1/journal/stats", response_model=JournalResponse)
async def get_journal_stats(
    current_user: User = Depends(get_current_user),
    filters: dict = Depends(get_trade_filters)
):
    match_stage = build_mongo_query(str(current_user.id), filters)

    # We need to group by date. entry_time is stored as ISODate in Mongo.
    # We can project the date string part.

    pipeline = [
        {"$match": match_stage},
        {"$match": {"entry_time": {"$ne": None}}},
        {
            "$project": {
                "date_str": {
                    "$dateToString": {"format": "%Y-%m-%d", "date": "$entry_time"}
                },
                "pnl": 1
            }
        },
        {
            "$group": {
                "_id": "$date_str",
                "count": {"$sum": 1},
                "pnl": {"$sum": {"$ifNull": ["$pnl", 0]}},
                "wins": {
                    "$sum": {"$cond": [{"$gt": ["$pnl", 0]}, 1, 0]}
                },
                "losses": {
                    "$sum": {"$cond": [{"$lt": ["$pnl", 0]}, 1, 0]}
                },
                "breakeven": {
                    "$sum": {"$cond": [{"$eq": ["$pnl", 0]}, 1, 0]}
                },
                "_gross_profit": {
                    "$sum": {"$cond": [{"$gt": ["$pnl", 0]}, "$pnl", 0]}
                },
                "_gross_loss": {
                    "$sum": {"$cond": [{"$lt": ["$pnl", 0]}, {"$abs": "$pnl"}, 0]}
                }
            }
        }
    ]

    results = await db.db["trades"].aggregate(pipeline).to_list(10000)

    final_stats = {}
    for r in results:
        date_str = r["_id"]

        count_valid = r["wins"] + r["losses"] + r["breakeven"]
        win_rate = (r["wins"] / count_valid * 100) if count_valid > 0 else 0.0

        gross_loss = r["_gross_loss"]
        gross_profit = r["_gross_profit"]

        profit_factor = 0.0
        if gross_loss > 0:
            profit_factor = gross_profit / gross_loss
        elif gross_profit > 0:
            profit_factor = 99.0

        final_stats[date_str] = {
            "date": date_str,
            "count": r["count"],
            "pnl": r["pnl"],
            "wins": r["wins"],
            "losses": r["losses"],
            "breakeven": r["breakeven"],
            "win_rate": win_rate,
            "profit_factor": profit_factor
        }

    return JournalResponse(stats=final_stats)

@app.get("/api/v1/reports/equity", response_model=EquityCurveResponse)
async def get_equity_curve(
    current_user: User = Depends(get_current_user),
    filters: dict = Depends(get_trade_filters)
):
    match_stage = build_mongo_query(str(current_user.id), filters)

    # We need daily P&L sum, sorted by date
    pipeline = [
        {"$match": match_stage},
        {"$match": {"entry_time": {"$ne": None}, "pnl": {"$ne": None}}},
        {
            "$project": {
                "date_str": {
                    "$dateToString": {"format": "%Y-%m-%d", "date": "$entry_time"}
                },
                "pnl": 1
            }
        },
        {
            "$group": {
                "_id": "$date_str",
                "daily_pnl": {"$sum": "$pnl"}
            }
        },
        {"$sort": {"_id": 1}} # Sort by date ascending
    ]

    results = await db.db["trades"].aggregate(pipeline).to_list(10000)

    equity_curve = []
    running_equity = 0.0

    for r in results:
        date_str = r["_id"]
        daily_pnl = r["daily_pnl"]
        running_equity += daily_pnl

        equity_curve.append(EquityPoint(
            date=date_str,
            equity=running_equity,
            pnl=daily_pnl
        ))

    return EquityCurveResponse(data=equity_curve)

# --- Trade Routes (Basic Implementation) ---

@app.post("/api/v1/trades/import", response_description="Import trades from CSV")
async def import_trades(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    try:
        contents = await file.read()
        # Attempt to decode as utf-8
        df = pd.read_csv(io.StringIO(contents.decode('utf-8')))

        # Normalize columns: lower case and strip whitespace
        df.columns = df.columns.str.lower().str.strip()

        imported_count = 0
        trades_to_insert = []

        for _, row in df.iterrows():
            try:
                # Basic column mapping logic
                # Symbol mappings
                symbol = None
                for col in ['symbol', 'ticker', 'pair', 'instrument']:
                    if col in df.columns and pd.notna(row[col]):
                        symbol = str(row[col])
                        break

                # Side mappings
                side_str = 'BUY'
                for col in ['side', 'type', 'direction', 'action']:
                    if col in df.columns and pd.notna(row[col]):
                        side_str = str(row[col])
                        break

                # Quantity mappings
                quantity = 0.0
                for col in ['quantity', 'qty', 'size', 'amount', 'volume']:
                    if col in df.columns and pd.notna(row[col]):
                        # remove commas if string
                        val = row[col]
                        if isinstance(val, str):
                            val = val.replace(',', '')
                        quantity = float(val)
                        break

                # Price mappings
                price = 0.0
                for col in ['price', 'entry price', 'avg price', 'fill price']:
                    if col in df.columns and pd.notna(row[col]):
                        val = row[col]
                        if isinstance(val, str):
                            val = val.replace(',', '').replace('$', '')
                        price = float(val)
                        break

                # Time mappings
                time_val = None
                for col in ['time', 'date', 'entry time', 'timestamp', 'open time']:
                    if col in df.columns and pd.notna(row[col]):
                        time_val = row[col]
                        break

                if not symbol or not quantity or not price or not time_val:
                    continue

                # Robust Date Parsing
                parsed_date = None
                # List of supported date formats to try
                date_formats = [
                    '%Y-%m-%d %H:%M:%S',
                    '%Y-%m-%dT%H:%M:%S',
                    '%Y-%m-%d',
                    '%d/%m/%Y %H:%M:%S',
                    '%m/%d/%Y %H:%M:%S',
                    '%d-%m-%Y %H:%M:%S',
                    'ISO8601'
                ]

                # First try pandas flexible parsing with dayfirst=False (US default)
                try:
                    parsed_date = pd.to_datetime(time_val)
                except:
                    # Fallback to manual parsing if pandas fails completely
                    pass

                # Ensure we have a valid timestamp
                if pd.isna(parsed_date):
                     print(f"Skipping row due to invalid date: {time_val}")
                     continue

                # Parse Side
                side_enum = TradeSide.BUY
                if side_str.upper() in ['SELL', 'SHORT', 'S']:
                    side_enum = TradeSide.SELL

                # Create trade object
                trade = TradeCreate(
                    symbol=symbol.upper(),
                    side=side_enum,
                    quantity=abs(quantity),
                    entry_price=abs(price),
                    entry_time=parsed_date,
                    status=TradeStatus.OPEN
                )

                trade_dict = jsonable_encoder(trade)
                trade_dict["user_id"] = str(current_user.id)
                trades_to_insert.append(trade_dict)
                imported_count += 1

            except Exception as e:
                print(f"Error parsing row: {e}")
                continue

        if trades_to_insert:
            await db.db["trades"].insert_many(trades_to_insert)

        return {"status": "success", "imported": imported_count, "message": f"Successfully imported {imported_count} trades"}

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to process file: {str(e)}")

@app.post("/api/v1/trades", response_description="Add new trade", response_model=Trade)
async def create_trade(trade: TradeCreate = Body(...), current_user: User = Depends(get_current_user)):
    trade_dict = jsonable_encoder(trade)
    trade_dict["user_id"] = str(current_user.id)
    new_trade = await db.db["trades"].insert_one(trade_dict)
    created_trade = await db.db["trades"].find_one({"_id": new_trade.inserted_id})
    return created_trade

@app.get("/api/v1/trades", response_description="List all trades", response_model=List[Trade])
async def list_trades(
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    filters: dict = Depends(get_trade_filters)
):
    query = build_mongo_query(str(current_user.id), filters)
    trades = await db.db["trades"].find(query).sort("entry_time", -1).to_list(limit)
    return trades

@app.get("/api/v1/trades/{id}", response_description="Get a single trade", response_model=Trade)
async def show_trade(id: str, current_user: User = Depends(get_current_user)):
    if (trade := await db.db["trades"].find_one({"_id": id, "user_id": str(current_user.id)})) is not None:
        return trade
    raise HTTPException(status_code=404, detail=f"Trade {id} not found")

@app.put("/api/v1/trades/{id}", response_description="Update a trade", response_model=Trade)
async def update_trade(id: str, trade: TradeUpdate = Body(...), current_user: User = Depends(get_current_user)):
    # Filter out None values to allow partial updates
    trade_dict = {k: v for k, v in trade.model_dump(exclude_unset=True).items() if v is not None}

    if len(trade_dict) >= 1:
        update_result = await db.db["trades"].update_one(
            {"_id": id, "user_id": str(current_user.id)}, {"$set": trade_dict}
        )

        if update_result.modified_count == 1:
            if (updated_trade := await db.db["trades"].find_one({"_id": id})) is not None:
                return updated_trade

    if (existing_trade := await db.db["trades"].find_one({"_id": id, "user_id": str(current_user.id)})) is not None:
        return existing_trade

    raise HTTPException(status_code=404, detail=f"Trade {id} not found")

@app.delete("/api/v1/trades/{id}", response_description="Delete a trade")
async def delete_trade(id: str, current_user: User = Depends(get_current_user)):
    delete_result = await db.db["trades"].delete_one({"_id": id, "user_id": str(current_user.id)})

    if delete_result.deleted_count == 1:
        return {"status": "success", "message": f"Trade {id} deleted"}

    raise HTTPException(status_code=404, detail=f"Trade {id} not found")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
