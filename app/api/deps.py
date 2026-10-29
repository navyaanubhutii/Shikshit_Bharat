from typing import Generator, Optional
from fastapi import Header
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.enums import AccessibilityMode


def get_db() -> Generator[Session, None, None]:
    """Dependency that yields a database session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_accessibility_mode(
    x_accessibility_mode: Optional[str] = Header(None, alias="X-Accessibility-Mode")
) -> AccessibilityMode:
    """Detect student's current sensory accessibility preference from headers."""
    if not x_accessibility_mode:
        return AccessibilityMode.UNIVERSAL
    try:
        return AccessibilityMode(x_accessibility_mode.lower())
    except ValueError:
        return AccessibilityMode.UNIVERSAL
