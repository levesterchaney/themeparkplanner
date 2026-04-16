from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.health import router as health_router
from .api.park import router as park_router
from .api.user import router as user_router
from .api.user_auth import router as auth_router
from .core.config import settings
from .core.redis import redis_client


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan context manager.

    Handles startup and shutdown events for the FastAPI application.
    Manages Redis connection lifecycle and any other resources that need
    initialization and cleanup.

    Args:
        app: FastAPI application instance

    Yields:
        None: Control to the application during runtime

    Note:
        This function is called automatically by FastAPI during application
        startup and shutdown. Resources initialized here are available
        throughout the application lifecycle.
    """
    # Startup
    await redis_client.init_redis()
    yield
    # Shutdown
    await redis_client.close_redis()


app = FastAPI(
    title=settings.project_name,
    openapi_url=f"{settings.api_v1_str}/openapi.json",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health_router, prefix=settings.api_v1_str, tags=["health"])
app.include_router(auth_router, prefix=settings.api_v1_str, tags=["auth"])
app.include_router(user_router, prefix=settings.api_v1_str, tags=["users"])
app.include_router(park_router, prefix=settings.api_v1_str, tags=["parks"])


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to Theme Park Planner API",
        "version": "1.0.0",
        "docs": "/docs",
    }
