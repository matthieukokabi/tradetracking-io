#!/usr/bin/env python3
"""
MongoDB Import Script
---------------------
This script imports data exported from Supabase into MongoDB Atlas.

Usage:
    python import_to_mongodb.py

Required environment variables:
    MONGODB_URL - Your MongoDB connection string
                  (e.g., mongodb+srv://user:pass@cluster.mongodb.net/tradetracking)

Run this AFTER export_supabase.py has exported your data.
"""

import os
import json
import sys
import bcrypt
from datetime import datetime
from pathlib import Path
from typing import Any

try:
    from pymongo import MongoClient
    from pymongo.errors import DuplicateKeyError
except ImportError:
    print("Error: pymongo not installed. Run: pip install pymongo")
    sys.exit(1)

# Configuration
MONGODB_URL = os.getenv("MONGODB_URL")


def get_latest_export() -> Path:
    """Find the most recent export directory."""
    export_dir = Path("supabase_export")
    if not export_dir.exists():
        print("Error: No supabase_export directory found!")
        print("Run export_supabase.py first.")
        sys.exit(1)

    exports = sorted(export_dir.glob("export_*"), reverse=True)
    if not exports:
        print("Error: No exports found in supabase_export directory!")
        sys.exit(1)

    return exports[0]


def load_json_file(path: Path) -> list:
    """Load a JSON file and return its contents."""
    if not path.exists():
        return []
    with open(path, "r") as f:
        return json.load(f)


def convert_datetime_fields(doc: dict, fields: list) -> dict:
    """Convert ISO datetime strings to Python datetime objects."""
    for field in fields:
        if field in doc and doc[field]:
            try:
                if isinstance(doc[field], str):
                    # Handle various datetime formats
                    dt_str = doc[field].replace("Z", "+00:00")
                    doc[field] = datetime.fromisoformat(dt_str)
            except (ValueError, TypeError):
                pass
    return doc


def migrate_auth_users(db, export_path: Path) -> int:
    """Migrate Supabase auth users to MongoDB users collection."""
    print("Migrating auth users...")

    auth_users = load_json_file(export_path / "auth_users.json")
    if not auth_users:
        print("  - No auth users to migrate")
        return 0

    users_collection = db["users"]
    migrated = 0
    skipped = 0

    for user in auth_users:
        try:
            # Transform Supabase user to MongoDB schema
            mongo_user = {
                "supabase_id": user.get("id"),  # Keep reference for data linking
                "email": user.get("email"),
                "username": user.get("user_metadata", {}).get("username")
                           or user.get("email", "").split("@")[0],
                "hashed_password": bcrypt.hashpw(
                    "MigratedUser123!".encode(),  # Temporary password
                    bcrypt.gensalt()
                ).decode(),
                "subscription_tier": "starter",
                "is_active": True,
                "is_verified": user.get("email_confirmed_at") is not None,
                "created_at": datetime.fromisoformat(user["created_at"].replace("Z", "+00:00"))
                             if user.get("created_at") else datetime.utcnow(),
                "updated_at": datetime.fromisoformat(user["updated_at"].replace("Z", "+00:00"))
                             if user.get("updated_at") else datetime.utcnow(),
                "last_login": datetime.fromisoformat(user["last_sign_in_at"].replace("Z", "+00:00"))
                             if user.get("last_sign_in_at") else None,
                "needs_password_reset": True,  # Flag to prompt password reset
            }

            # Check for existing user by email
            existing = users_collection.find_one({"email": mongo_user["email"]})
            if existing:
                print(f"    Skipping {mongo_user['email']} (already exists)")
                skipped += 1
                continue

            users_collection.insert_one(mongo_user)
            migrated += 1
            print(f"    ✓ Migrated: {mongo_user['email']}")

        except Exception as e:
            print(f"    ✗ Error migrating {user.get('email')}: {e}")

    print(f"  Users migrated: {migrated}, skipped: {skipped}")
    return migrated


def migrate_trades(db, export_path: Path) -> int:
    """Migrate trades from Supabase to MongoDB."""
    print("Migrating trades...")

    trades = load_json_file(export_path / "trades.json")
    if not trades:
        print("  - No trades to migrate")
        return 0

    trades_collection = db["trades"]
    users_collection = db["users"]
    migrated = 0

    # Build user ID mapping (supabase_id -> mongodb_id)
    user_map = {}
    for user in users_collection.find({"supabase_id": {"$exists": True}}):
        user_map[user["supabase_id"]] = user["_id"]

    for trade in trades:
        try:
            # Map supabase user_id to mongodb user_id
            supabase_user_id = trade.get("user_id")
            mongodb_user_id = user_map.get(supabase_user_id)

            if not mongodb_user_id:
                print(f"    Skipping trade (no matching user): {trade.get('id')}")
                continue

            # Transform to MongoDB schema
            mongo_trade = {
                "supabase_id": trade.get("id"),
                "user_id": mongodb_user_id,
                "symbol": trade.get("symbol") or trade.get("ticker"),
                "side": trade.get("side") or trade.get("direction", "").lower(),
                "entry_price": float(trade.get("entry_price", 0)),
                "exit_price": float(trade.get("exit_price", 0)) if trade.get("exit_price") else None,
                "quantity": float(trade.get("quantity") or trade.get("size", 0)),
                "entry_date": trade.get("entry_date") or trade.get("opened_at"),
                "exit_date": trade.get("exit_date") or trade.get("closed_at"),
                "pnl": float(trade.get("pnl") or trade.get("profit_loss", 0)),
                "pnl_percentage": float(trade.get("pnl_percentage", 0)) if trade.get("pnl_percentage") else None,
                "fees": float(trade.get("fees") or trade.get("commission", 0)),
                "notes": trade.get("notes") or trade.get("description"),
                "tags": trade.get("tags", []),
                "exchange": trade.get("exchange") or trade.get("broker"),
                "asset_type": trade.get("asset_type") or trade.get("market_type", "crypto"),
                "status": trade.get("status", "closed"),
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
            }

            # Convert datetime fields
            for field in ["entry_date", "exit_date"]:
                if mongo_trade.get(field) and isinstance(mongo_trade[field], str):
                    try:
                        mongo_trade[field] = datetime.fromisoformat(
                            mongo_trade[field].replace("Z", "+00:00")
                        )
                    except:
                        pass

            trades_collection.insert_one(mongo_trade)
            migrated += 1

        except Exception as e:
            print(f"    ✗ Error migrating trade {trade.get('id')}: {e}")

    print(f"  Trades migrated: {migrated}")
    return migrated


def migrate_exchange_connections(db, export_path: Path) -> int:
    """Migrate exchange connections from Supabase to MongoDB."""
    print("Migrating exchange connections...")

    connections = load_json_file(export_path / "exchange_connections.json")
    if not connections:
        connections = load_json_file(export_path / "api_keys.json")

    if not connections:
        print("  - No exchange connections to migrate")
        return 0

    collection = db["exchange_connections"]
    users_collection = db["users"]
    migrated = 0

    # Build user ID mapping
    user_map = {}
    for user in users_collection.find({"supabase_id": {"$exists": True}}):
        user_map[user["supabase_id"]] = user["_id"]

    for conn in connections:
        try:
            supabase_user_id = conn.get("user_id")
            mongodb_user_id = user_map.get(supabase_user_id)

            if not mongodb_user_id:
                continue

            # Note: API keys need re-encryption with new ENCRYPTION_KEY
            mongo_conn = {
                "supabase_id": conn.get("id"),
                "user_id": mongodb_user_id,
                "exchange": conn.get("exchange") or conn.get("name"),
                "api_key_encrypted": None,  # Will need to be re-added by user
                "api_secret_encrypted": None,
                "passphrase_encrypted": conn.get("passphrase") and None,
                "is_active": conn.get("is_active", True),
                "needs_reconnection": True,  # Flag to prompt reconnection
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
            }

            collection.insert_one(mongo_conn)
            migrated += 1

        except Exception as e:
            print(f"    ✗ Error migrating connection: {e}")

    print(f"  Exchange connections migrated: {migrated}")
    print("  Note: Users will need to re-enter their API keys")
    return migrated


def migrate_subscriptions(db, export_path: Path) -> int:
    """Migrate subscription data from Supabase to MongoDB."""
    print("Migrating subscriptions...")

    subscriptions = load_json_file(export_path / "subscriptions.json")
    if not subscriptions:
        print("  - No subscriptions to migrate")
        return 0

    users_collection = db["users"]
    migrated = 0

    # Build user ID mapping
    user_map = {}
    for user in users_collection.find({"supabase_id": {"$exists": True}}):
        user_map[user["supabase_id"]] = user

    for sub in subscriptions:
        try:
            supabase_user_id = sub.get("user_id")
            user = user_map.get(supabase_user_id)

            if not user:
                continue

            # Update user with subscription info
            tier = sub.get("tier") or sub.get("plan") or "starter"
            if tier.lower() in ["pro", "premium"]:
                tier = "pro"
            elif tier.lower() in ["elite", "enterprise"]:
                tier = "elite"
            else:
                tier = "starter"

            users_collection.update_one(
                {"_id": user["_id"]},
                {"$set": {
                    "subscription_tier": tier,
                    "stripe_customer_id": sub.get("stripe_customer_id"),
                    "stripe_subscription_id": sub.get("stripe_subscription_id"),
                    "subscription_status": sub.get("status", "active"),
                    "subscription_end_date": sub.get("end_date") or sub.get("current_period_end"),
                }}
            )
            migrated += 1

        except Exception as e:
            print(f"    ✗ Error migrating subscription: {e}")

    print(f"  Subscriptions migrated: {migrated}")
    return migrated


def migrate_generic_collection(db, export_path: Path, filename: str, collection_name: str) -> int:
    """Generic migration for simple collections."""
    print(f"Migrating {collection_name}...")

    data = load_json_file(export_path / f"{filename}.json")
    if not data:
        print(f"  - No {collection_name} to migrate")
        return 0

    collection = db[collection_name]
    users_collection = db["users"]
    migrated = 0

    # Build user ID mapping
    user_map = {}
    for user in users_collection.find({"supabase_id": {"$exists": True}}):
        user_map[user["supabase_id"]] = user["_id"]

    for item in data:
        try:
            # Map user_id if present
            if "user_id" in item:
                supabase_user_id = item.get("user_id")
                mongodb_user_id = user_map.get(supabase_user_id)
                if mongodb_user_id:
                    item["user_id"] = mongodb_user_id
                else:
                    continue  # Skip if user not found

            item["supabase_id"] = item.pop("id", None)
            item["migrated_at"] = datetime.utcnow()

            collection.insert_one(item)
            migrated += 1

        except Exception as e:
            print(f"    ✗ Error: {e}")

    print(f"  {collection_name} migrated: {migrated}")
    return migrated


def create_indexes(db):
    """Create necessary indexes for performance."""
    print("Creating database indexes...")

    # Users indexes
    db["users"].create_index("email", unique=True)
    db["users"].create_index("username")
    db["users"].create_index("supabase_id")

    # Trades indexes
    db["trades"].create_index("user_id")
    db["trades"].create_index([("user_id", 1), ("entry_date", -1)])
    db["trades"].create_index("symbol")

    # Exchange connections indexes
    db["exchange_connections"].create_index("user_id")
    db["exchange_connections"].create_index([("user_id", 1), ("exchange", 1)])

    print("  ✓ Indexes created")


def main():
    print("=" * 60)
    print("MongoDB Import Tool")
    print("=" * 60)
    print("")

    # Check MongoDB URL
    if not MONGODB_URL:
        print("Error: MONGODB_URL environment variable not set!")
        print("")
        print("Example:")
        print('  export MONGODB_URL="mongodb+srv://user:pass@cluster.mongodb.net/tradetracking"')
        sys.exit(1)

    # Find latest export
    export_path = get_latest_export()
    print(f"Using export: {export_path}")
    print("")

    # Load export summary
    summary = load_json_file(export_path / "export_summary.json")
    if summary:
        print("Export summary:")
        print(f"  Exported at: {summary.get('exported_at')}")
        print(f"  Source: {summary.get('supabase_url')}")
        print("")

    # Connect to MongoDB
    print("Connecting to MongoDB...")
    client = MongoClient(MONGODB_URL)
    db = client.get_database()
    print(f"Connected to database: {db.name}")
    print("")

    # Run migrations
    total_migrated = 0

    total_migrated += migrate_auth_users(db, export_path)
    total_migrated += migrate_trades(db, export_path)
    total_migrated += migrate_exchange_connections(db, export_path)
    total_migrated += migrate_subscriptions(db, export_path)

    # Migrate other collections
    for filename in ["journals", "playbooks", "settings", "notifications", "trade_tags"]:
        if (export_path / f"{filename}.json").exists():
            total_migrated += migrate_generic_collection(db, export_path, filename, filename)

    # Create indexes
    create_indexes(db)

    print("")
    print("=" * 60)
    print("Migration Complete!")
    print("=" * 60)
    print("")
    print(f"Total records migrated: {total_migrated}")
    print("")
    print("IMPORTANT - Post-migration steps:")
    print("  1. Notify users they need to reset their passwords")
    print("     (All migrated users have temporary password: MigratedUser123!)")
    print("  2. Users with exchange connections need to re-enter API keys")
    print("  3. Update Railway environment variables (see MIGRATION.md)")
    print("  4. Redeploy Railway from the correct GitHub repo")
    print("")


if __name__ == "__main__":
    main()
