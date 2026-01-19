from pymongo import IndexModel, ASCENDING, DESCENDING
from database import db

async def create_indexes():
    # User indexes
    user_indexes = [
        IndexModel([("username", ASCENDING)], unique=True),
        IndexModel([("email", ASCENDING)], unique=True),
    ]
    await db.db["users"].create_indexes(user_indexes)

    # Trade indexes
    trade_indexes = [
        IndexModel([("user_id", ASCENDING)]),
        IndexModel([("user_id", ASCENDING), ("entry_time", DESCENDING)]),
        IndexModel([("user_id", ASCENDING), ("symbol", ASCENDING)]),
    ]
    await db.db["trades"].create_indexes(trade_indexes)
    print("Indexes created successfully")
