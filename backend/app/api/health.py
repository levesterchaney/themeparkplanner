from fastapi import APIRouter, HTTPException
from sqlalchemy import text
from ..core.database import AsyncSessionLocal
from ..core.redis import redis_client


router = APIRouter()


@router.get("/health")
async def health_check():
    """Health check endpoint that verifies database and Redis connectivity"""
    
    health_status = {
        "status": "healthy",
        "database": "unknown",
        "redis": "unknown"
    }
    
    # Check database connection
    try:
        async with AsyncSessionLocal() as session:
            await session.execute(text("SELECT 1"))
        health_status["database"] = "healthy"
    except Exception as e:
        health_status["database"] = "unhealthy"
        health_status["status"] = "unhealthy"
    
    # Check Redis connection
    try:
        redis = await redis_client.get_redis()
        await redis.ping()
        health_status["redis"] = "healthy"
    except Exception as e:
        health_status["redis"] = "unhealthy"
        health_status["status"] = "unhealthy"
    
    if health_status["status"] == "unhealthy":
        raise HTTPException(status_code=503, detail=health_status)
    
    return health_status


@router.get("/health/database")
async def database_health_check():
    """Dedicated database health check"""
    try:
        async with AsyncSessionLocal() as session:
            await session.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        raise HTTPException(
            status_code=503, 
            detail={"status": "unhealthy", "database": "disconnected", "error": str(e)}
        )


@router.get("/health/redis")
async def redis_health_check():
    """Dedicated Redis health check"""
    try:
        redis = await redis_client.get_redis()
        await redis.ping()
        return {"status": "healthy", "redis": "connected"}
    except Exception as e:
        raise HTTPException(
            status_code=503, 
            detail={"status": "unhealthy", "redis": "disconnected", "error": str(e)}
        )