from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.core.database import init_db
from app.api.v1.api import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure database tables are initialized
    init_db()
    yield
    # Shutdown logic if needed in the future


app = FastAPI(
    title=settings.APP_NAME,
    description=(
        "Shikshit Bharat Backend API: An inclusive digital classroom platform providing "
        "differentiated learning experiences for Blind and Deaf students in Indian schools."
    ),
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount v1 routes
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


@app.get("/", tags=["Root"])
def root_summary():
    """Service status and quick links."""
    return JSONResponse({
        "project": settings.APP_NAME,
        "version": "0.1.0",
        "status": "online",
        "documentation": "/docs",
        "health": f"{settings.API_V1_PREFIX}/health",
        "endpoints": {
            "lessons": f"{settings.API_V1_PREFIX}/lessons",
            "blind_lesson_template": f"{settings.API_V1_PREFIX}/lessons/{{id}}/blind",
            "deaf_lesson_template": f"{settings.API_V1_PREFIX}/lessons/{{id}}/deaf",
            "announcements": f"{settings.API_V1_PREFIX}/announcements",
            "blind_announcements": f"{settings.API_V1_PREFIX}/announcements/blind",
            "deaf_announcements": f"{settings.API_V1_PREFIX}/announcements/deaf",
        }
    })


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
