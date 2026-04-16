import json
import logging
from typing import Any, Optional

from app.core.redis import redis_client

logger = logging.getLogger(__name__)


class CacheService:
    """Service for managing Redis cache operations."""

    def __init__(self):
        self.default_ttl = 60 * 60 * 6  # 6 hour default TTL

    async def get(self, key: str) -> Optional[Any]:
        """
        Get value from cache by key.

        Args:
            key: Cache key to retrieve

        Returns:
            Cached value if found, None otherwise
        """
        try:
            redis = await redis_client.get_redis()
            cached_value = await redis.get(key)
            if cached_value:
                return json.loads(cached_value)
            return None
        except Exception as e:
            logger.error(f"Error retrieving cache key {key}: {e}")
            return None

    async def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        """
        Set value in cache with optional TTL.

        Args:
            key: Cache key
            value: Value to cache
            ttl: Time to live in seconds (default: 1 hour)

        Returns:
            True if successful, False otherwise
        """
        try:
            redis = await redis_client.get_redis()
            ttl = ttl or self.default_ttl
            serialized_value = json.dumps(value, default=str)
            await redis.setex(key, ttl, serialized_value)
            logger.info(f"Cached key {key} with TTL {ttl}")
            return True
        except Exception as e:
            logger.error(f"Error setting cache key {key}: {e}")
            return False

    async def delete(self, key: str) -> bool:
        """
        Delete value from cache.

        Args:
            key: Cache key to delete

        Returns:
            True if successful, False otherwise
        """
        try:
            redis = await redis_client.get_redis()
            await redis.delete(key)
            logger.info(f"Deleted cache key {key}")
            return True
        except Exception as e:
            logger.error(f"Error deleting cache key {key}: {e}")
            return False

    async def invalidate_pattern(self, pattern: str) -> bool:
        """
        Invalidate all cache keys matching a pattern.

        Args:
            pattern: Pattern to match (e.g., 'parks:*')

        Returns:
            True if successful, False otherwise
        """
        try:
            redis = await redis_client.get_redis()
            keys = await redis.keys(pattern)
            if keys:
                await redis.delete(*keys)
                logger.info(
                    f"Invalidated {len(keys)} cache keys matching pattern {pattern}"
                )
            return True
        except Exception as e:
            logger.error(f"Error invalidating cache pattern {pattern}: {e}")
            return False

    def generate_park_key(self, park_id: int) -> str:
        """Generate cache key for park data."""
        return f"parks:{park_id}"

    def generate_parks_list_key(self) -> str:
        """Generate cache key for parks list."""
        return "parks:list"

    def generate_park_attractions_key(self, park_id: int) -> str:
        """Generate cache key for park attractions."""
        return f"parks:{park_id}:attractions"

    def generate_destinations_key(self) -> str:
        """Generate cache key for destinations data."""
        return "destinations:list"


cache_service = CacheService()
