import json
from unittest.mock import AsyncMock, patch

import pytest

from app.services.cache_service import CacheService, cache_service


class TestCacheService:
    """Test CacheService functionality."""

    def setup_method(self):
        """Setup for each test method."""
        self.cache_service = CacheService()

    @pytest.mark.asyncio
    async def test_get_cache_hit(self):
        """Test getting value from cache when key exists."""
        test_data = {"test": "value", "number": 123}
        cached_json = json.dumps(test_data, default=str)

        with patch("app.services.cache_service.redis_client") as mock_redis_client:
            mock_redis = AsyncMock()
            mock_redis.get.return_value = cached_json
            mock_redis_client.get_redis = AsyncMock(return_value=mock_redis)

            result = await self.cache_service.get("test_key")

            assert result == test_data
            mock_redis.get.assert_called_once_with("test_key")

    @pytest.mark.asyncio
    async def test_get_cache_miss(self):
        """Test getting value from cache when key doesn't exist."""
        with patch("app.services.cache_service.redis_client") as mock_redis_client:
            mock_redis = AsyncMock()
            mock_redis.get.return_value = None
            mock_redis_client.get_redis = AsyncMock(return_value=mock_redis)

            result = await self.cache_service.get("nonexistent_key")

            assert result is None
            mock_redis.get.assert_called_once_with("nonexistent_key")

    @pytest.mark.asyncio
    async def test_get_cache_error(self):
        """Test getting value from cache when Redis error occurs."""
        with patch("app.services.cache_service.redis_client") as mock_redis_client:
            mock_redis_client.get_redis.side_effect = Exception(
                "Redis connection error"
            )

            result = await self.cache_service.get("test_key")

            assert result is None

    @pytest.mark.asyncio
    async def test_set_cache_success(self):
        """Test setting value in cache successfully."""
        test_data = {"test": "value", "list": [1, 2, 3]}

        with patch("app.services.cache_service.redis_client") as mock_redis_client:
            mock_redis = AsyncMock()
            mock_redis_client.get_redis = AsyncMock(return_value=mock_redis)

            result = await self.cache_service.set("test_key", test_data, 3600)

            assert result is True
            mock_redis.setex.assert_called_once()

            # Verify the call arguments
            call_args = mock_redis.setex.call_args
            assert call_args[0][0] == "test_key"  # key
            assert call_args[0][1] == 3600  # ttl
            # Verify the data can be deserialized back
            cached_data = json.loads(call_args[0][2])
            assert cached_data == test_data

    @pytest.mark.asyncio
    async def test_set_cache_default_ttl(self):
        """Test setting value in cache with default TTL."""
        with patch("app.services.cache_service.redis_client") as mock_redis_client:
            mock_redis = AsyncMock()
            mock_redis_client.get_redis = AsyncMock(return_value=mock_redis)

            result = await self.cache_service.set("test_key", {"data": "test"})

            assert result is True
            mock_redis.setex.assert_called_once()

            # Verify default TTL was used
            call_args = mock_redis.setex.call_args
            assert call_args[0][1] == self.cache_service.default_ttl

    @pytest.mark.asyncio
    async def test_set_cache_error(self):
        """Test setting value in cache when Redis error occurs."""
        with patch("app.services.cache_service.redis_client") as mock_redis_client:
            mock_redis_client.get_redis.side_effect = Exception(
                "Redis connection error"
            )

            result = await self.cache_service.set("test_key", {"data": "test"})

            assert result is False

    @pytest.mark.asyncio
    async def test_delete_cache_success(self):
        """Test deleting value from cache successfully."""
        with patch("app.services.cache_service.redis_client") as mock_redis_client:
            mock_redis = AsyncMock()
            mock_redis_client.get_redis = AsyncMock(return_value=mock_redis)

            result = await self.cache_service.delete("test_key")

            assert result is True
            mock_redis.delete.assert_called_once_with("test_key")

    @pytest.mark.asyncio
    async def test_delete_cache_error(self):
        """Test deleting value from cache when Redis error occurs."""
        with patch("app.services.cache_service.redis_client") as mock_redis_client:
            mock_redis_client.get_redis.side_effect = Exception(
                "Redis connection error"
            )

            result = await self.cache_service.delete("test_key")

            assert result is False

    @pytest.mark.asyncio
    async def test_invalidate_pattern_success(self):
        """Test invalidating cache keys by pattern successfully."""
        with patch("app.services.cache_service.redis_client") as mock_redis_client:
            mock_redis = AsyncMock()
            mock_redis.keys.return_value = ["parks:1", "parks:2", "parks:3"]
            mock_redis_client.get_redis = AsyncMock(return_value=mock_redis)

            result = await self.cache_service.invalidate_pattern("parks:*")

            assert result is True
            mock_redis.keys.assert_called_once_with("parks:*")
            mock_redis.delete.assert_called_once_with("parks:1", "parks:2", "parks:3")

    @pytest.mark.asyncio
    async def test_invalidate_pattern_no_keys(self):
        """Test invalidating cache keys by pattern when no keys match."""
        with patch("app.services.cache_service.redis_client") as mock_redis_client:
            mock_redis = AsyncMock()
            mock_redis.keys.return_value = []
            mock_redis_client.get_redis = AsyncMock(return_value=mock_redis)

            result = await self.cache_service.invalidate_pattern("nonexistent:*")

            assert result is True
            mock_redis.keys.assert_called_once_with("nonexistent:*")
            mock_redis.delete.assert_not_called()

    @pytest.mark.asyncio
    async def test_invalidate_pattern_error(self):
        """Test invalidating cache keys by pattern when Redis error occurs."""
        with patch("app.services.cache_service.redis_client") as mock_redis_client:
            mock_redis_client.get_redis.side_effect = Exception(
                "Redis connection error"
            )

            result = await self.cache_service.invalidate_pattern("parks:*")

            assert result is False

    def test_generate_park_key(self):
        """Test generating park cache key."""
        key = self.cache_service.generate_park_key(123)
        assert key == "parks:123"

    def test_generate_parks_list_key(self):
        """Test generating parks list cache key."""
        key = self.cache_service.generate_parks_list_key()
        assert key == "parks:list"

    def test_generate_park_attractions_key(self):
        """Test generating park attractions cache key."""
        key = self.cache_service.generate_park_attractions_key(456)
        assert key == "parks:456:attractions"

    def test_generate_destinations_key(self):
        """Test generating destinations cache key."""
        key = self.cache_service.generate_destinations_key()
        assert key == "destinations:list"


class TestCacheServiceSingleton:
    """Test the cache service singleton instance."""

    def test_cache_service_instance_exists(self):
        """Test that cache_service singleton instance exists."""
        assert cache_service is not None
        assert isinstance(cache_service, CacheService)

    def test_cache_service_default_ttl(self):
        """Test that cache service has expected default TTL."""
        # Default TTL should be 6 hours (21600 seconds) based on the modified file
        assert cache_service.default_ttl == 60 * 60 * 6
