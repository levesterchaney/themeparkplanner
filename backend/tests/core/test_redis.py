from unittest.mock import AsyncMock, patch

import pytest

from app.core.redis import RedisClient, redis_client


class TestRedisClient:
    """Test Redis client functionality."""

    def test_init_redis_client(self):
        """Test RedisClient initialization."""
        client = RedisClient()
        assert client.redis is None

    @pytest.mark.asyncio
    async def test_init_redis(self):
        """Test Redis initialization."""
        client = RedisClient()

        with patch("app.core.redis.redis.from_url") as mock_from_url:
            mock_redis = AsyncMock()
            mock_from_url.return_value = mock_redis

            result = await client.init_redis()

            assert client.redis == mock_redis
            assert result == mock_redis
            mock_from_url.assert_called_once()

    @pytest.mark.asyncio
    async def test_close_redis_with_connection(self):
        """Test closing Redis connection when connection exists."""
        client = RedisClient()
        mock_redis = AsyncMock()
        client.redis = mock_redis

        await client.close_redis()

        mock_redis.close.assert_called_once()

    @pytest.mark.asyncio
    async def test_close_redis_without_connection(self):
        """Test closing Redis connection when no connection exists."""
        client = RedisClient()
        # Should not raise an exception
        await client.close_redis()

    @pytest.mark.asyncio
    async def test_get_redis_with_existing_connection(self):
        """Test get_redis when connection already exists."""
        client = RedisClient()
        mock_redis = AsyncMock()
        client.redis = mock_redis

        result = await client.get_redis()

        assert result == mock_redis

    @pytest.mark.asyncio
    async def test_get_redis_without_existing_connection(self):
        """Test get_redis when no connection exists."""
        client = RedisClient()

        with patch.object(client, "init_redis") as mock_init:
            mock_redis = AsyncMock()
            mock_init.return_value = mock_redis
            client.redis = mock_redis

            result = await client.get_redis()

            mock_init.assert_called_once()
            assert result == mock_redis

    def test_redis_client_singleton(self):
        """Test that redis_client is a RedisClient instance."""
        assert isinstance(redis_client, RedisClient)
        assert redis_client.redis is None
