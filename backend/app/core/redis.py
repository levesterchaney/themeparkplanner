import redis.asyncio as redis

from .config import settings


class RedisClient:
    """
    Redis client wrapper for session storage and caching.

    Manages Redis connections with automatic initialization and cleanup.
    Provides a singleton-like interface for Redis operations across the application.
    """

    def __init__(self):
        """Initialize Redis client without connecting."""
        self.redis = None

    async def init_redis(self):
        """
        Initialize Redis connection.

        Creates an async Redis connection with configured URL and connection pool.

        Returns:
            redis.Redis: The initialized Redis client instance
        """
        self.redis = redis.from_url(
            settings.redis_url,
            max_connections=settings.redis_max_connections,
            decode_responses=True,
        )
        return self.redis

    async def close_redis(self):
        """
        Close Redis connection.

        Properly closes the Redis connection and cleans up resources.
        Safe to call multiple times or when connection is already closed.
        """
        if self.redis:
            await self.redis.close()

    async def get_redis(self):
        """
        Get Redis client instance.

        Returns existing connection or creates new one if needed.
        Ensures Redis client is always available for operations.

        Returns:
            redis.Redis: Active Redis client instance
        """
        if not self.redis:
            await self.init_redis()
        return self.redis


redis_client = RedisClient()
