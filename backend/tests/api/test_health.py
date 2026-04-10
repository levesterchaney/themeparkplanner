from unittest.mock import AsyncMock, patch

import pytest
from httpx import AsyncClient

from app.main import app


class TestHealthAPI:
    """Test health check API endpoints."""

    @pytest.mark.asyncio
    async def test_health_check_all_healthy(self):
        """Test health check when all services are healthy."""

        # Mock database connection
        with (
            patch("app.api.health.AsyncSessionLocal") as mock_session_local,
            patch("app.api.health.redis_client") as mock_redis_client,
        ):

            # Mock successful database connection
            mock_session = AsyncMock()
            mock_session.execute = AsyncMock()
            mock_session_context = AsyncMock()
            mock_session_context.__aenter__.return_value = mock_session
            mock_session_local.return_value = mock_session_context

            # Mock successful Redis connection
            mock_redis = AsyncMock()
            mock_redis.ping = AsyncMock()
            mock_redis_client.get_redis = AsyncMock(return_value=mock_redis)

            async with AsyncClient(app=app, base_url="http://testserver") as client:
                response = await client.get("/api/v1/health")

                assert response.status_code == 200
                data = response.json()
                assert data["status"] == "healthy"
                assert data["database"] == "healthy"
                assert data["redis"] == "healthy"

    @pytest.mark.asyncio
    async def test_health_check_database_unhealthy(self):
        """Test health check when database is unhealthy."""

        with (
            patch("app.api.health.AsyncSessionLocal") as mock_session_local,
            patch("app.api.health.redis_client") as mock_redis_client,
        ):

            # Mock database connection failure
            mock_session_context = AsyncMock()
            mock_session_context.__aenter__.side_effect = Exception(
                "Database connection failed"
            )
            mock_session_local.return_value = mock_session_context

            # Mock successful Redis connection
            mock_redis = AsyncMock()
            mock_redis.ping = AsyncMock()
            mock_redis_client.get_redis = AsyncMock(return_value=mock_redis)

            async with AsyncClient(app=app, base_url="http://testserver") as client:
                response = await client.get("/api/v1/health")

                assert response.status_code == 503
                data = response.json()["detail"]
                assert data["status"] == "unhealthy"
                assert data["database"] == "unhealthy"
                assert data["redis"] == "healthy"

    @pytest.mark.asyncio
    async def test_health_check_redis_unhealthy(self):
        """Test health check when Redis is unhealthy."""

        with (
            patch("app.api.health.AsyncSessionLocal") as mock_session_local,
            patch("app.api.health.redis_client") as mock_redis_client,
        ):

            # Mock successful database connection
            mock_session = AsyncMock()
            mock_session.execute = AsyncMock()
            mock_session_local.return_value.__aenter__.return_value = mock_session

            # Mock Redis connection failure
            mock_redis_client.get_redis.side_effect = Exception(
                "Redis connection failed"
            )

            async with AsyncClient(app=app, base_url="http://testserver") as client:
                response = await client.get("/api/v1/health")

                assert response.status_code == 503
                data = response.json()["detail"]
                assert data["status"] == "unhealthy"
                assert data["database"] == "healthy"
                assert data["redis"] == "unhealthy"

    @pytest.mark.asyncio
    async def test_health_check_both_unhealthy(self):
        """Test health check when both services are unhealthy."""

        with (
            patch("app.api.health.AsyncSessionLocal") as mock_session_local,
            patch("app.api.health.redis_client") as mock_redis_client,
        ):

            # Mock database connection failure
            mock_session_local.return_value.__aenter__.side_effect = Exception(
                "Database connection failed"
            )

            # Mock Redis connection failure
            mock_redis_client.get_redis.side_effect = Exception(
                "Redis connection failed"
            )

            async with AsyncClient(app=app, base_url="http://testserver") as client:
                response = await client.get("/api/v1/health")

                assert response.status_code == 503
                data = response.json()["detail"]
                assert data["status"] == "unhealthy"
                assert data["database"] == "unhealthy"
                assert data["redis"] == "unhealthy"

    @pytest.mark.asyncio
    async def test_database_health_check_success(self):
        """Test dedicated database health check - success."""

        with patch("app.api.health.AsyncSessionLocal") as mock_session_local:
            # Mock successful database connection
            mock_session = AsyncMock()
            mock_session.execute = AsyncMock()
            mock_session_local.return_value.__aenter__.return_value = mock_session

            async with AsyncClient(app=app, base_url="http://testserver") as client:
                response = await client.get("/api/v1/health/database")

                assert response.status_code == 200
                data = response.json()
                assert data["status"] == "healthy"
                assert data["database"] == "connected"

    @pytest.mark.asyncio
    async def test_database_health_check_failure(self):
        """Test dedicated database health check - failure."""

        with patch("app.api.health.AsyncSessionLocal") as mock_session_local:
            # Mock database connection failure
            mock_session_local.return_value.__aenter__.side_effect = Exception(
                "Database connection failed"
            )

            async with AsyncClient(app=app, base_url="http://testserver") as client:
                response = await client.get("/api/v1/health/database")

                assert response.status_code == 503
                data = response.json()["detail"]
                assert data["status"] == "unhealthy"
                assert data["database"] == "disconnected"
                assert "error" in data

    @pytest.mark.asyncio
    async def test_redis_health_check_success(self):
        """Test dedicated Redis health check - success."""

        with patch("app.api.health.redis_client") as mock_redis_client:
            # Mock successful Redis connection
            mock_redis = AsyncMock()
            mock_redis.ping = AsyncMock()
            mock_redis_client.get_redis.return_value = mock_redis

            async with AsyncClient(app=app, base_url="http://testserver") as client:
                response = await client.get("/api/v1/health/redis")

                assert response.status_code == 200
                data = response.json()
                assert data["status"] == "healthy"
                assert data["redis"] == "connected"

    @pytest.mark.asyncio
    async def test_redis_health_check_failure(self):
        """Test dedicated Redis health check - failure."""

        with patch("app.api.health.redis_client") as mock_redis_client:
            # Mock Redis connection failure
            mock_redis_client.get_redis.side_effect = Exception(
                "Redis connection failed"
            )

            async with AsyncClient(app=app, base_url="http://testserver") as client:
                response = await client.get("/api/v1/health/redis")

                assert response.status_code == 503
                data = response.json()["detail"]
                assert data["status"] == "unhealthy"
                assert data["redis"] == "disconnected"
                assert "error" in data
