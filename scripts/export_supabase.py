#!/usr/bin/env python3
"""
Supabase Data Export Script
---------------------------
This script exports all data from your Supabase project for migration to MongoDB.

Usage:
    python export_supabase.py

Required environment variables:
    SUPABASE_URL - Your Supabase project URL (e.g., https://xxxxx.supabase.co)
    SUPABASE_SERVICE_ROLE_KEY - Your Supabase service role key (NOT the anon key)

The service role key is needed to bypass Row Level Security and export all data.
Find it in: Supabase Dashboard → Settings → API → service_role key
"""

import os
import json
import sys
from datetime import datetime
from pathlib import Path

try:
    from supabase import create_client, Client
except ImportError:
    print("Error: supabase-py not installed. Run: pip install supabase")
    sys.exit(1)

# Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# Tables to export (common for trade tracking apps)
# Add or remove tables based on your actual schema
TABLES_TO_EXPORT = [
    "users",
    "profiles",
    "trades",
    "accounts",
    "exchange_connections",
    "subscriptions",
    "api_keys",
    "settings",
    "notifications",
    "trade_tags",
    "journals",
    "playbooks",
]


def get_supabase_client() -> Client:
    """Initialize Supabase client with service role key."""
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("Error: Missing environment variables!")
        print("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY")
        print("")
        print("Example:")
        print('  export SUPABASE_URL="https://xxxxx.supabase.co"')
        print('  export SUPABASE_SERVICE_ROLE_KEY="eyJhbGci..."')
        sys.exit(1)

    return create_client(SUPABASE_URL, SUPABASE_KEY)


def export_table(supabase: Client, table_name: str) -> list:
    """Export all rows from a single table."""
    try:
        # Fetch all rows (paginated if needed)
        all_rows = []
        offset = 0
        limit = 1000

        while True:
            response = supabase.table(table_name).select("*").range(offset, offset + limit - 1).execute()
            rows = response.data

            if not rows:
                break

            all_rows.extend(rows)

            if len(rows) < limit:
                break

            offset += limit

        return all_rows

    except Exception as e:
        error_msg = str(e)
        if "relation" in error_msg and "does not exist" in error_msg:
            return None  # Table doesn't exist
        print(f"  Warning: Could not export '{table_name}': {e}")
        return None


def export_auth_users(supabase: Client) -> list:
    """Export users from Supabase Auth (auth.users table)."""
    try:
        # Use admin API to list all users
        response = supabase.auth.admin.list_users()
        users = []

        for user in response:
            users.append({
                "id": user.id,
                "email": user.email,
                "phone": user.phone,
                "created_at": user.created_at.isoformat() if user.created_at else None,
                "updated_at": user.updated_at.isoformat() if user.updated_at else None,
                "last_sign_in_at": user.last_sign_in_at.isoformat() if user.last_sign_in_at else None,
                "email_confirmed_at": user.email_confirmed_at.isoformat() if user.email_confirmed_at else None,
                "user_metadata": user.user_metadata,
                "app_metadata": user.app_metadata,
            })

        return users

    except Exception as e:
        print(f"  Warning: Could not export auth users: {e}")
        return []


def discover_tables(supabase: Client) -> list:
    """Try to discover all tables in the public schema."""
    try:
        # Query information_schema to get all tables
        response = supabase.rpc(
            "get_tables",
            {}
        ).execute()
        return response.data if response.data else []
    except:
        # If RPC doesn't exist, return default list
        return TABLES_TO_EXPORT


def main():
    print("=" * 60)
    print("Supabase Data Export Tool")
    print("=" * 60)
    print("")

    # Initialize client
    print("Connecting to Supabase...")
    supabase = get_supabase_client()
    print(f"Connected to: {SUPABASE_URL}")
    print("")

    # Create export directory
    export_dir = Path("supabase_export")
    export_dir.mkdir(exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    export_path = export_dir / f"export_{timestamp}"
    export_path.mkdir(exist_ok=True)

    print(f"Export directory: {export_path}")
    print("")

    # Export auth users first
    print("Exporting Supabase Auth users...")
    auth_users = export_auth_users(supabase)
    if auth_users:
        with open(export_path / "auth_users.json", "w") as f:
            json.dump(auth_users, f, indent=2, default=str)
        print(f"  ✓ Exported {len(auth_users)} auth users")
    else:
        print("  - No auth users found or access denied")

    print("")
    print("Exporting database tables...")

    # Export each table
    export_summary = {}

    for table_name in TABLES_TO_EXPORT:
        print(f"  Exporting '{table_name}'...", end=" ")
        rows = export_table(supabase, table_name)

        if rows is None:
            print("(table not found)")
            continue
        elif len(rows) == 0:
            print("(empty)")
            export_summary[table_name] = 0
        else:
            with open(export_path / f"{table_name}.json", "w") as f:
                json.dump(rows, f, indent=2, default=str)
            print(f"✓ {len(rows)} rows")
            export_summary[table_name] = len(rows)

    # Save export summary
    summary = {
        "exported_at": datetime.now().isoformat(),
        "supabase_url": SUPABASE_URL,
        "auth_users_count": len(auth_users) if auth_users else 0,
        "tables": export_summary,
    }

    with open(export_path / "export_summary.json", "w") as f:
        json.dump(summary, f, indent=2)

    print("")
    print("=" * 60)
    print("Export Complete!")
    print("=" * 60)
    print(f"")
    print(f"Files saved to: {export_path}")
    print(f"")
    print("Summary:")
    print(f"  Auth users: {len(auth_users) if auth_users else 0}")
    for table, count in export_summary.items():
        print(f"  {table}: {count} rows")
    print("")
    print("Next step: Run import_to_mongodb.py to import this data")
    print("")


if __name__ == "__main__":
    main()
