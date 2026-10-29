from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from app.core.config import settings

# Engine configuration: handle sqlite vs PostgreSQL specific connection parameters
engine_kwargs = {}
if settings.DATABASE_URL.startswith("sqlite"):
    engine_kwargs["connect_args"] = {"check_same_thread": False}
else:
    engine_kwargs["pool_pre_ping"] = True
    engine_kwargs["pool_recycle"] = 300

try:
    engine = create_engine(settings.DATABASE_URL, **engine_kwargs)
except Exception:
    # Graceful fallback to SQLite for local development or sandbox testing if postgres driver is absent
    fallback_url = "sqlite:///./shikshit_bharat.db"
    engine = create_engine(fallback_url, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency that provides a transactional database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """Initialize database tables."""
    Base.metadata.create_all(bind=engine)
