from httpx import AsyncClient


class TestHealthEndpoint:
    """Test health check endpoint."""

    async def test_health_check_success(self, client: AsyncClient):
        """Test health check returns success."""
        response = await client.get("/api/v1/health")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "database" in data
        assert "redis" in data

    async def test_health_check_structure(self, client: AsyncClient):
        """Test health check response structure."""
        response = await client.get("/api/v1/health")

        assert response.status_code == 200
        data = response.json()

        # Required fields
        assert "status" in data
        assert "database" in data
        assert "redis" in data

        # Status should be one of expected values
        assert data["status"] in ["healthy", "unhealthy"]
        assert data["database"] in ["healthy", "unhealthy", "unknown"]
        assert data["redis"] in ["healthy", "unhealthy", "unknown"]
