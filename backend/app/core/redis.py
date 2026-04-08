import redis.asyncio as redis
from .config import settings


class RedisClient:
    def __init__(self):
        self.redis = None
    
    async def init_redis(self):
        self.redis = redis.from_url(
            settings.redis_url,
            max_connections=settings.redis_max_connections,
            decode_responses=True
        )
        return self.redis
    
    async def close_redis(self):
        if self.redis:
            await self.redis.close()
    
    async def get_redis(self):
        if not self.redis:
            await self.init_redis()
        return self.redis


redis_client = RedisClient()