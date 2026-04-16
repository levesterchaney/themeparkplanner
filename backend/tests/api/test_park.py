from datetime import datetime
from unittest.mock import AsyncMock, Mock, patch

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.main import app
from app.models import User


class TestParksAPI:
    """Test Parks API endpoints."""

    @pytest.fixture
    async def mock_user(self):
        """Create a mock user for authentication."""
        user = Mock(spec=User)
        user.id = 1
        user.email = "test@example.com"
        user.role = "user"
        return user

    @pytest.fixture
    async def mock_admin_user(self):
        """Create a mock admin user for authentication."""
        admin = Mock(spec=User)
        admin.id = 2
        admin.email = "admin@example.com"
        admin.role = "admin"
        return admin

    @pytest.fixture
    async def mock_parks_data(self):
        """Mock parks data for testing."""
        return [
            {
                "id": 1,
                "external_id": "park_1",
                "name": "Magic Kingdom",
                "slug": "magic-kingdom",
                "resort_name": "Walt Disney World",
                "timezone": "America/New_York",
                "location_lat": 28.417663,
                "location_lon": -81.581212,
                "synced_at": "2023-01-01T00:00:00+00:00",
            },
            {
                "id": 2,
                "external_id": "park_2",
                "name": "EPCOT",
                "slug": "epcot",
                "resort_name": "Walt Disney World",
                "timezone": "America/New_York",
                "location_lat": 28.375015,
                "location_lon": -81.549303,
                "synced_at": "2023-01-01T00:00:00+00:00",
            },
        ]

    @pytest.fixture
    async def mock_attractions_data(self):
        """Mock attractions data for testing."""
        return [
            {
                "id": 1,
                "park_id": 1,
                "external_id": "attraction_1",
                "name": "Space Mountain",
                "type": "ATTRACTION",
                "location_lat": 28.418956,
                "location_lon": -81.578674,
                "synced_at": "2023-01-01T00:00:00+00:00",
            },
            {
                "id": 2,
                "park_id": 1,
                "external_id": "attraction_2",
                "name": "Pirates of the Caribbean",
                "type": "ATTRACTION",
                "location_lat": 28.418024,
                "location_lon": -81.583755,
                "synced_at": "2023-01-01T00:00:00+00:00",
            },
        ]

    @pytest.mark.asyncio
    async def test_get_parks_from_cache(self, mock_user, mock_parks_data):
        """Test getting parks when data is cached."""

        async def mock_get_current_user():
            return mock_user

        async def mock_get_db():
            yield AsyncMock()

        # Mock cache service
        with patch("app.api.park.cache_service") as mock_cache:
            mock_cache.get = AsyncMock(return_value=mock_parks_data)

            # Override dependencies
            app.dependency_overrides[get_current_user] = mock_get_current_user
            app.dependency_overrides[get_db] = mock_get_db

            async with AsyncClient(app=app, base_url="http://testserver") as client:
                response = await client.get("/api/v1/parks")

                assert response.status_code == 200
                data = response.json()
                assert len(data) == 2
                assert data[0]["name"] == "Magic Kingdom"
                assert data[1]["name"] == "EPCOT"

                mock_cache.get.assert_called_once()

            app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_get_parks_from_database(self, mock_user, mock_parks_data):
        """Test getting parks from database when cache is empty."""

        # Create mock Park objects
        park1 = Mock()
        park1.id = 1
        park1.external_id = "park_1"
        park1.name = "Magic Kingdom"
        park1.slug = "magic-kingdom"
        park1.resort_name = "Walt Disney World"
        park1.timezone = "America/New_York"
        park1.location_lat = 28.417663
        park1.location_lon = -81.581212
        park1.synced_at = datetime.fromisoformat("2023-01-01T00:00:00+00:00")

        park2 = Mock()
        park2.id = 2
        park2.external_id = "park_2"
        park2.name = "EPCOT"
        park2.slug = "epcot"
        park2.resort_name = "Walt Disney World"
        park2.timezone = "America/New_York"
        park2.location_lat = 28.375015
        park2.location_lon = -81.549303
        park2.synced_at = datetime.fromisoformat("2023-01-01T00:00:00+00:00")

        mock_db = AsyncMock(spec=AsyncSession)
        mock_result = Mock()
        mock_result.scalars.return_value.all.return_value = [park1, park2]
        mock_db.execute.return_value = mock_result

        async def mock_get_current_user():
            return mock_user

        async def mock_get_db():
            yield mock_db

        # Mock cache service - return None for cache miss
        with patch("app.api.park.cache_service") as mock_cache:
            mock_cache.get = AsyncMock(return_value=None)
            mock_cache.set = AsyncMock()

            # Override dependencies
            app.dependency_overrides[get_current_user] = mock_get_current_user
            app.dependency_overrides[get_db] = mock_get_db

            async with AsyncClient(app=app, base_url="http://testserver") as client:
                response = await client.get("/api/v1/parks")

                assert response.status_code == 200
                data = response.json()
                assert len(data) == 2
                assert data[0]["name"] == "Magic Kingdom"
                assert data[1]["name"] == "EPCOT"

                # Verify cache was set
                mock_cache.set.assert_called_once()

            app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_get_park_from_cache(self, mock_user):
        """Test getting specific park when data is cached."""
        park_data = {
            "id": 1,
            "external_id": "park_1",
            "name": "Magic Kingdom",
            "slug": "magic-kingdom",
            "resort_name": "Walt Disney World",
            "timezone": "America/New_York",
            "location_lat": 28.417663,
            "location_lon": -81.581212,
            "synced_at": "2023-01-01T00:00:00+00:00",
        }

        async def mock_get_current_user():
            return mock_user

        async def mock_get_db():
            yield AsyncMock()

        # Mock cache service
        with patch("app.api.park.cache_service") as mock_cache:
            mock_cache.get = AsyncMock(return_value=park_data)

            # Override dependencies
            app.dependency_overrides[get_current_user] = mock_get_current_user
            app.dependency_overrides[get_db] = mock_get_db

            async with AsyncClient(app=app, base_url="http://testserver") as client:
                response = await client.get("/api/v1/parks/1")

                assert response.status_code == 200
                data = response.json()
                assert data["name"] == "Magic Kingdom"
                assert data["id"] == 1

            app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_get_park_not_found(self, mock_user):
        """Test getting park that doesn't exist."""

        mock_db = AsyncMock(spec=AsyncSession)
        mock_result = Mock()
        mock_result.scalar.return_value = None
        mock_db.execute.return_value = mock_result

        async def mock_get_current_user():
            return mock_user

        async def mock_get_db():
            yield mock_db

        # Mock cache service - return None for cache miss
        with patch("app.api.park.cache_service") as mock_cache:
            mock_cache.get = AsyncMock(return_value=None)

            # Override dependencies
            app.dependency_overrides[get_current_user] = mock_get_current_user
            app.dependency_overrides[get_db] = mock_get_db

            async with AsyncClient(app=app, base_url="http://testserver") as client:
                response = await client.get("/api/v1/parks/999")

                assert response.status_code == 404
                data = response.json()
                assert data["message"] == "Park not found"

            app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_get_park_attractions_from_cache(
        self, mock_user, mock_attractions_data
    ):
        """Test getting park attractions when data is cached."""

        async def mock_get_current_user():
            return mock_user

        async def mock_get_db():
            yield AsyncMock()

        # Mock cache service
        with patch("app.api.park.cache_service") as mock_cache:
            mock_cache.get = AsyncMock(return_value=mock_attractions_data)

            # Override dependencies
            app.dependency_overrides[get_current_user] = mock_get_current_user
            app.dependency_overrides[get_db] = mock_get_db

            async with AsyncClient(app=app, base_url="http://testserver") as client:
                response = await client.get("/api/v1/parks/1/attractions")

                assert response.status_code == 200
                data = response.json()
                assert len(data) == 2
                assert data[0]["name"] == "Space Mountain"
                assert data[1]["name"] == "Pirates of the Caribbean"

            app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_get_park_attractions_from_database(self, mock_user):
        """Test getting park attractions from database when cache is empty."""

        # Create mock Attraction objects
        attraction1 = Mock()
        attraction1.id = 1
        attraction1.park_id = 1
        attraction1.external_id = "attraction_1"
        attraction1.name = "Space Mountain"
        attraction1.type = "ATTRACTION"
        attraction1.location_lat = 28.418956
        attraction1.location_lon = -81.578674
        attraction1.synced_at = datetime.fromisoformat("2023-01-01T00:00:00+00:00")

        attraction2 = Mock()
        attraction2.id = 2
        attraction2.park_id = 1
        attraction2.external_id = "attraction_2"
        attraction2.name = "Pirates of the Caribbean"
        attraction2.type = "ATTRACTION"
        attraction2.location_lat = 28.418024
        attraction2.location_lon = -81.583755
        attraction2.synced_at = datetime.fromisoformat("2023-01-01T00:00:00+00:00")

        mock_db = AsyncMock(spec=AsyncSession)
        mock_result = Mock()
        mock_result.scalars.return_value.all.return_value = [attraction1, attraction2]
        mock_db.execute.return_value = mock_result

        async def mock_get_current_user():
            return mock_user

        async def mock_get_db():
            yield mock_db

        # Mock cache service - return None for cache miss
        with patch("app.api.park.cache_service") as mock_cache:
            mock_cache.get = AsyncMock(return_value=None)
            mock_cache.set = AsyncMock()

            # Override dependencies
            app.dependency_overrides[get_current_user] = mock_get_current_user
            app.dependency_overrides[get_db] = mock_get_db

            async with AsyncClient(app=app, base_url="http://testserver") as client:
                response = await client.get("/api/v1/parks/1/attractions")

                assert response.status_code == 200
                data = response.json()
                assert len(data) == 2
                assert data[0]["name"] == "Space Mountain"
                assert data[1]["name"] == "Pirates of the Caribbean"

                # Verify cache was set
                mock_cache.set.assert_called_once()

            app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_sync_park_data_admin_success(self, mock_admin_user):
        """Test park data sync with admin user."""

        async def mock_get_current_user():
            return mock_admin_user

        async def mock_get_db():
            yield AsyncMock()

        # Mock sync service
        with patch("app.api.park.sync_park_data_service") as mock_sync:
            mock_sync.return_value = None

            # Override dependencies
            app.dependency_overrides[get_current_user] = mock_get_current_user
            app.dependency_overrides[get_db] = mock_get_db

            async with AsyncClient(app=app, base_url="http://testserver") as client:
                response = await client.post("/api/v1/parks/sync", json={"park_id": 1})

                assert response.status_code == 200
                data = response.json()
                assert (
                    "Park data synchronization completed successfully"
                    in data["message"]
                )

                mock_sync.assert_called_once_with(1)

            app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_sync_park_data_admin_all_parks(self, mock_admin_user):
        """Test park data sync for all parks with admin user."""

        async def mock_get_current_user():
            return mock_admin_user

        async def mock_get_db():
            yield AsyncMock()

        # Mock sync service
        with patch("app.api.park.sync_park_data_service") as mock_sync:
            mock_sync.return_value = None

            # Override dependencies
            app.dependency_overrides[get_current_user] = mock_get_current_user
            app.dependency_overrides[get_db] = mock_get_db

            async with AsyncClient(app=app, base_url="http://testserver") as client:
                response = await client.post("/api/v1/parks/sync", json={})

                assert response.status_code == 200
                data = response.json()
                assert (
                    "Park data synchronization completed successfully"
                    in data["message"]
                )

                mock_sync.assert_called_once_with()

            app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_sync_park_data_non_admin_forbidden(self, mock_user):
        """Test park data sync with non-admin user returns forbidden."""

        async def mock_get_current_user():
            return mock_user

        async def mock_get_db():
            yield AsyncMock()

        # Override dependencies
        app.dependency_overrides[get_current_user] = mock_get_current_user
        app.dependency_overrides[get_db] = mock_get_db

        async with AsyncClient(app=app, base_url="http://testserver") as client:
            response = await client.post("/api/v1/parks/sync", json={"park_id": 1})

            assert response.status_code == 403
            data = response.json()
            assert "You do not have permission" in data["message"]

        app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_parks_endpoints_require_authentication(self):
        """Test that parks endpoints require authentication."""

        async with AsyncClient(app=app, base_url="http://testserver") as client:
            # Test get parks
            response = await client.get("/api/v1/parks")
            assert response.status_code == 401

            # Test get specific park
            response = await client.get("/api/v1/parks/1")
            assert response.status_code == 401

            # Test get park attractions
            response = await client.get("/api/v1/parks/1/attractions")
            assert response.status_code == 401

            # Test sync endpoint
            response = await client.post("/api/v1/parks/sync", json={})
            assert response.status_code == 401
