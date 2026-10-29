from fastapi import APIRouter
from app.api.v1.endpoints import (
    health_router,
    lessons_router,
    announcements_router,
)

api_router = APIRouter()

api_router.include_router(health_router, tags=["Health"])
api_router.include_router(lessons_router, prefix="/lessons", tags=["Lessons"])
api_router.include_router(announcements_router, prefix="/announcements", tags=["Announcements"])
