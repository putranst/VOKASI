from __future__ import annotations

import logging

from sqlalchemy import text
from sqlalchemy.engine import Engine

logger = logging.getLogger("funnel_migrations")


def _safe_execute(engine: Engine, sql: str) -> None:
    try:
        with engine.begin() as conn:
            conn.execute(text(sql))
    except Exception as exc:
        logger.debug("Migration statement skipped/failed: %s (%s)", sql, exc)


def run_funnel_migrations(engine: Engine) -> None:
    """Additive column migrations for all tables. Safe to re-run (idempotent)."""
    dialect = engine.dialect.name
    json_t = "JSON" if dialect == "postgresql" else "TEXT"

    # ── users ──────────────────────────────────────────────────────────────────
    _safe_execute(engine, "ALTER TABLE users ADD COLUMN name VARCHAR")
    _safe_execute(engine, "ALTER TABLE users ADD COLUMN onboarding_completed BOOLEAN DEFAULT 0")
    _safe_execute(engine, "ALTER TABLE users ADD COLUMN onboarding_prepay_completed BOOLEAN DEFAULT 0")
    _safe_execute(engine, "ALTER TABLE users ADD COLUMN onboarding_postpay_completed BOOLEAN DEFAULT 0")
    _safe_execute(engine, f"ALTER TABLE users ADD COLUMN registration_status VARCHAR DEFAULT 'registered'")
    _safe_execute(engine, f"ALTER TABLE users ADD COLUMN onboarding_phase VARCHAR DEFAULT 'none'")
    _safe_execute(engine, f"ALTER TABLE users ADD COLUMN funnel_status VARCHAR DEFAULT 'registered'")
    _safe_execute(engine, "ALTER TABLE users ADD COLUMN bio TEXT")
    _safe_execute(engine, "ALTER TABLE users ADD COLUMN linkedin_url VARCHAR")
    _safe_execute(engine, "ALTER TABLE users ADD COLUMN github_url VARCHAR")
    _safe_execute(engine, f"ALTER TABLE users ADD COLUMN learning_goals {json_t}")
    _safe_execute(engine, "ALTER TABLE users ADD COLUMN career_pathway_id VARCHAR")
    _safe_execute(engine, "ALTER TABLE users ADD COLUMN institution_id INTEGER")
    _safe_execute(engine, "ALTER TABLE users ADD COLUMN instructor_type VARCHAR")

    # ── institutions (white-label BR-003) ──────────────────────────────────────
    _safe_execute(engine, "ALTER TABLE institutions ADD COLUMN banner_url VARCHAR")
    _safe_execute(engine, "ALTER TABLE institutions ADD COLUMN website_url VARCHAR")
    _safe_execute(engine, "ALTER TABLE institutions ADD COLUMN is_featured BOOLEAN DEFAULT 0")
    _safe_execute(engine, "ALTER TABLE institutions ADD COLUMN primary_color VARCHAR")
    _safe_execute(engine, "ALTER TABLE institutions ADD COLUMN accent_color VARCHAR")
    _safe_execute(engine, "ALTER TABLE institutions ADD COLUMN favicon_url VARCHAR")
    _safe_execute(engine, "ALTER TABLE institutions ADD COLUMN custom_logo_url VARCHAR")
    _safe_execute(engine, "ALTER TABLE institutions ADD COLUMN platform_name VARCHAR")

    # ── courses ────────────────────────────────────────────────────────────────
    _safe_execute(engine, "ALTER TABLE courses ADD COLUMN instructor_id INTEGER")
    _safe_execute(engine, "ALTER TABLE courses ADD COLUMN tag VARCHAR")
    _safe_execute(engine, "ALTER TABLE courses ADD COLUMN description TEXT")
    _safe_execute(engine, "ALTER TABLE courses ADD COLUMN duration VARCHAR")
    _safe_execute(engine, f"ALTER TABLE courses ADD COLUMN approval_status VARCHAR DEFAULT 'approved'")
    _safe_execute(engine, "ALTER TABLE courses ADD COLUMN approved_by INTEGER")
    _safe_execute(engine, "ALTER TABLE courses ADD COLUMN approved_at DATETIME")
    _safe_execute(engine, "ALTER TABLE courses ADD COLUMN rejection_reason TEXT")

    # ── enrollments (beta funnel) ──────────────────────────────────────────────
    _safe_execute(engine, "ALTER TABLE enrollments ADD COLUMN cohort_id INTEGER")
    _safe_execute(engine, "ALTER TABLE enrollments ADD COLUMN payment_status VARCHAR")
    _safe_execute(engine, "ALTER TABLE enrollments ADD COLUMN payment_reference VARCHAR")
    _safe_execute(engine, "ALTER TABLE enrollments ADD COLUMN amount_usd FLOAT")
    _safe_execute(engine, f"ALTER TABLE enrollments ADD COLUMN payment_attempt_status VARCHAR DEFAULT 'initiated'")
    _safe_execute(engine, "ALTER TABLE enrollments ADD COLUMN payment_expires_at DATETIME")
    _safe_execute(engine, "ALTER TABLE enrollments ADD COLUMN payment_confirmed_at DATETIME")

    # ── implementations ────────────────────────────────────────────────────────
    _safe_execute(engine, "ALTER TABLE implementations ADD COLUMN iteration_number INTEGER DEFAULT 1")
    _safe_execute(engine, "ALTER TABLE implementations ADD COLUMN hypothesis TEXT")
    _safe_execute(engine, "ALTER TABLE implementations ADD COLUMN learnings TEXT")
    _safe_execute(engine, "ALTER TABLE implementations ADD COLUMN next_hypothesis VARCHAR")
    _safe_execute(engine, f"ALTER TABLE implementations ADD COLUMN ai_feedback {json_t}")
    _safe_execute(engine, "ALTER TABLE implementations ADD COLUMN notes TEXT")
    _safe_execute(engine, "ALTER TABLE implementations ADD COLUMN code_repository_url VARCHAR")
    _safe_execute(engine, "ALTER TABLE implementations ADD COLUMN code_snapshot TEXT")
    _safe_execute(engine, "ALTER TABLE implementations ADD COLUMN security_check_passed BOOLEAN DEFAULT 0")
    _safe_execute(engine, "ALTER TABLE implementations ADD COLUMN linting_passed BOOLEAN DEFAULT 0")
    _safe_execute(engine, "ALTER TABLE implementations ADD COLUMN tests_passed BOOLEAN DEFAULT 0")

    # ── deployments (scale phase) ──────────────────────────────────────────────
    _safe_execute(engine, "ALTER TABLE deployments ADD COLUMN institutional_handoff TEXT")
    _safe_execute(engine, "ALTER TABLE deployments ADD COLUMN stakeholder_training TEXT")
    _safe_execute(engine, f"ALTER TABLE deployments ADD COLUMN impact_metrics {json_t}")
    _safe_execute(engine, f"ALTER TABLE deployments ADD COLUMN sfia_evidence {json_t}")

    # ── course_certificates ────────────────────────────────────────────────────
    _safe_execute(engine, "ALTER TABLE course_certificates ADD COLUMN capstone_id INTEGER")

    # ── project_charters / design_blueprints (timestamps) ─────────────────────
    _safe_execute(engine, "ALTER TABLE project_charters ADD COLUMN created_at DATETIME")
    _safe_execute(engine, "ALTER TABLE project_charters ADD COLUMN updated_at DATETIME")
    _safe_execute(engine, "ALTER TABLE design_blueprints ADD COLUMN created_at DATETIME")
    _safe_execute(engine, "ALTER TABLE design_blueprints ADD COLUMN updated_at DATETIME")
