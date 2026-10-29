from app.api.v1.endpoints.health import router as health_router
from app.api.v1.endpoints.lessons import router as lessons_router
from app.api.v1.endpoints.announcements import router as announcements_router

__all__ = ["health_router", "lessons_router", "announcements_router"]
