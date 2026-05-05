from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# Hybrid Database Configuration
# Priority: 1. Environment Variable (Production) 2. Local SQLite (Development)
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    # Fallback to SQLite for local development
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    DATABASE_URL = f"sqlite:///{os.path.join(BASE_DIR, 'sql_app_v3.db')}"
    connect_args = {"check_same_thread": False}
else:
    # PostgreSQL Configuration (Production)
    # Ensure usage of psycopg2 driver if not specified
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    connect_args = {}


engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    pool_size=20,
    max_overflow=30,
    pool_pre_ping=True,
    pool_recycle=300,
)

# Production guard: prevent SQLite in production
if DATABASE_URL.startswith("sqlite://") and os.getenv("ENV") == "production":
    raise RuntimeError(
        "SQLite not allowed in production. Set DATABASE_URL to PostgreSQL connection string."
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_tables():
    """Create all database tables (including new ones like Syllabus)"""
    from sql_models import Base as ModelsBase
    ModelsBase.metadata.create_all(bind=engine)
