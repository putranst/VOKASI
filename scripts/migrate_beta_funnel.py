#!/usr/bin/env python3
"""
Beta Funnel DB Migration

Run from repo root:
  python scripts/migrate_beta_funnel.py

This script is idempotent and safe to re-run.
It supports both SQLite (local) and PostgreSQL (production).
"""

import os
import sys

from sqlalchemy import inspect, text

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from database import engine  # noqa: E402
import sql_models as models  # noqa: E402


def _table_exists(inspector, table_name: str) -> bool:
    return inspector.has_table(table_name)


def _column_exists(inspector, table_name: str, column_name: str) -> bool:
    if not _table_exists(inspector, table_name):
        return False
    cols = inspector.get_columns(table_name)
    return any(c["name"] == column_name for c in cols)


def _safe_add_column(conn, table_name: str, column_name: str, column_sql: str) -> None:
    inspector = inspect(conn)
    if _column_exists(inspector, table_name, column_name):
        print(f"  ⏭  {table_name}.{column_name} already exists")
        return
    conn.execute(text(f"ALTER TABLE {table_name} ADD COLUMN {column_name} {column_sql}"))
    print(f"  ✅ Added {table_name}.{column_name}")


def migrate() -> None:
    dialect = engine.dialect.name
    json_type = "JSON" if dialect == "postgresql" else "TEXT"

    print("🚀 Running beta funnel migration...")
    print(f"   DB dialect: {dialect}")

    # 1) Ensure newly introduced tables exist.
    #    create_all is safe: it only creates missing tables.
    models.Base.metadata.create_all(bind=engine)
    print("  ✅ Ensured new tables exist (create_all)")

    # 2) Add new columns for existing tables (idempotent)
    with engine.begin() as conn:
        _safe_add_column(conn, "users", "name", "VARCHAR")
        _safe_add_column(conn, "users", "onboarding_completed", "BOOLEAN DEFAULT 0")
        _safe_add_column(conn, "users", "bio", "TEXT")
        _safe_add_column(conn, "users", "linkedin_url", "VARCHAR")
        _safe_add_column(conn, "users", "github_url", "VARCHAR")
        _safe_add_column(conn, "users", "learning_goals", json_type)

        _safe_add_column(conn, "enrollments", "cohort_id", "INTEGER")
        _safe_add_column(conn, "enrollments", "payment_status", "VARCHAR")
        _safe_add_column(conn, "enrollments", "payment_reference", "VARCHAR")
        _safe_add_column(conn, "enrollments", "amount_usd", "FLOAT")

        _safe_add_column(conn, "course_certificates", "capstone_id", "INTEGER")

    print("\n🎉 Beta funnel migration completed.")


if __name__ == "__main__":
    migrate()
