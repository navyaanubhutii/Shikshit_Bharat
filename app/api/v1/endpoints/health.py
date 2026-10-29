from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.api.deps import get_db
from app.core.config import settings
from app.schemas.common import HealthResponse, DatabaseHealthResponse

router = APIRouter()


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Application Health Check",
    description="Verify backend service availability and current operational parameters."
)
def health_check() -> HealthResponse:
    return HealthResponse(
        status="ok",
        app_name=settings.APP_NAME,
        version="0.1.0",
        environment=settings.APP_ENV
    )


@router.get(
    "/health/db",
    response_model=DatabaseHealthResponse,
    summary="Database Connectivity Check",
    description="Verify relational database connection health."
)
def database_health_check(db: Session = Depends(get_db)) -> DatabaseHealthResponse:
    try:
        db.execute(text("SELECT 1"))
        db_type = "PostgreSQL" if "postgresql" in settings.DATABASE_URL else "SQLite"
        return DatabaseHealthResponse(
            status="healthy",
            database=db_type,
            connection="active"
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Database unreachable: {str(exc)}"
        )
