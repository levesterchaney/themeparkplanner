from unittest.mock import AsyncMock, Mock, patch

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.theme_park_service import ThemeParkClient, sync_park_data


class TestThemeParkClient:
    """Test ThemeParkClient service methods."""

    def setup_method(self):
        """Setup for each test method."""
        self.client = ThemeParkClient()

    @pytest.mark.asyncio
    async def test_invalidate_park_cache_specific_park(self):
        """Test cache invalidation for a specific park."""
        with patch("app.services.theme_park_service.cache_service") as mock_cache:
            mock_cache.delete = AsyncMock()

            await self.client.invalidate_park_cache(park_id=1)

            mock_cache.delete.assert_any_call(mock_cache.generate_park_key.return_value)
            mock_cache.delete.assert_any_call(
                mock_cache.generate_park_attractions_key.return_value
            )
            mock_cache.delete.assert_any_call(
                mock_cache.generate_parks_list_key.return_value
            )
            assert mock_cache.delete.call_count == 3

    @pytest.mark.asyncio
    async def test_invalidate_park_cache_no_park_id(self):
        """Test cache invalidation when no park_id provided."""
        with patch("app.services.theme_park_service.cache_service") as mock_cache:
            mock_cache.delete = AsyncMock()

            await self.client.invalidate_park_cache()

            mock_cache.delete.assert_called_once_with(
                mock_cache.generate_parks_list_key.return_value
            )

    @pytest.mark.asyncio
    async def test_get_parks_by_destination_success(self):
        """Test successful fetching of parks by destination."""
        mock_response_data = {
            "destinations": [
                {
                    "name": "Walt Disney World",
                    "parks": [
                        {"id": "destination1_park1", "name": "Magic Kingdom"},
                        {"id": "destination1_park2", "name": "EPCOT"},
                    ],
                },
                {
                    "name": "Universal Studios",
                    "parks": [
                        {
                            "id": "destination2_park1",
                            "name": "Universal Studios Florida",
                        }
                    ],
                },
            ]
        }

        mock_response = Mock()
        mock_response.json.return_value = mock_response_data
        mock_response.raise_for_status.return_value = None

        mock_client = AsyncMock()
        mock_client.get.return_value = mock_response

        result = await self.client.get_parks_by_destination(mock_client)

        expected = {
            "Walt Disney World": {
                "parks": [
                    {"id": "destination1_park1", "name": "Magic Kingdom"},
                    {"id": "destination1_park2", "name": "EPCOT"},
                ]
            },
            "Universal Studios": {
                "parks": [
                    {"id": "destination2_park1", "name": "Universal Studios Florida"}
                ]
            },
        }

        assert result == expected
        mock_client.get.assert_called_once_with("/destinations")

    @pytest.mark.asyncio
    async def test_sync_park_data_new_park(self):
        """Test syncing data for a new park."""
        park_data = {
            "id": "test_park_123",
            "name": "Test Park",
            "slug": "test-park",
            "timezone": "America/New_York",
            "location": {"latitude": 28.417663, "longitude": -81.581212},
        }

        mock_response = Mock()
        mock_response.json.return_value = park_data
        mock_response.raise_for_status.return_value = None

        mock_client = AsyncMock()
        mock_client.get.return_value = mock_response

        mock_db = AsyncMock(spec=AsyncSession)

        # Mock park doesn't exist
        mock_result = Mock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute.return_value = mock_result

        # Mock the created park
        mock_park = Mock()
        mock_park.id = 1

        with patch("app.services.theme_park_service.Park") as mock_park_class:
            mock_park_class.return_value = mock_park

            with patch.object(self.client, "invalidate_park_cache") as mock_invalidate:
                external_id, internal_id = await self.client.sync_park_data(
                    mock_client, mock_db, "test_park_123", "Test Destination"
                )

                assert external_id == "test_park_123"
                assert internal_id == 1
                mock_db.add.assert_called_once_with(mock_park)
                mock_db.commit.assert_called_once()
                mock_db.refresh.assert_called_once_with(mock_park)
                mock_invalidate.assert_called_once_with(1)

    @pytest.mark.asyncio
    async def test_sync_park_data_existing_park(self):
        """Test syncing data for an existing park."""
        park_data = {
            "id": "existing_park_123",
            "name": "Updated Park Name",
            "slug": "updated-park",
            "timezone": "America/Los_Angeles",
            "location": {"latitude": 33.817660, "longitude": -117.922330},
        }

        mock_response = Mock()
        mock_response.json.return_value = park_data
        mock_response.raise_for_status.return_value = None

        mock_client = AsyncMock()
        mock_client.get.return_value = mock_response

        # Mock existing park
        mock_existing_park = Mock()
        mock_existing_park.id = 2
        mock_existing_park.external_id = "existing_park_123"

        mock_db = AsyncMock(spec=AsyncSession)
        mock_result = Mock()
        mock_result.scalar_one_or_none.return_value = mock_existing_park
        mock_db.execute.return_value = mock_result

        with patch.object(self.client, "invalidate_park_cache") as mock_invalidate:
            external_id, internal_id = await self.client.sync_park_data(
                mock_client, mock_db, "existing_park_123", "Test Destination"
            )

            assert external_id == "existing_park_123"
            assert internal_id == 2

            # Verify park was updated
            assert mock_existing_park.name == "Updated Park Name"
            assert mock_existing_park.slug == "updated-park"

            mock_db.add.assert_called_once_with(mock_existing_park)
            mock_db.commit.assert_called_once()
            mock_invalidate.assert_called_once_with(2)

    @pytest.mark.asyncio
    async def test_sync_attraction_data_new_attraction(self):
        """Test syncing attraction data for new attractions."""
        attractions_data = {
            "children": [
                {
                    "id": "attraction_1",
                    "name": "Test Ride",
                    "entityType": "ATTRACTION",
                    "location": {"latitude": 28.42, "longitude": -81.58},
                },
                {
                    "id": "attraction_2",
                    "name": "Test Show",
                    "entityType": "SHOW",
                    "location": {"latitude": 28.43, "longitude": -81.59},
                },
            ]
        }

        mock_response = Mock()
        mock_response.json.return_value = attractions_data
        mock_response.raise_for_status.return_value = None

        mock_client = AsyncMock()
        mock_client.get.return_value = mock_response

        mock_db = AsyncMock(spec=AsyncSession)

        # Mock attractions don't exist
        mock_result = Mock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute.return_value = mock_result

        with patch(
            "app.services.theme_park_service.Attraction"
        ) as mock_attraction_class:
            mock_attraction_1 = Mock()
            mock_attraction_1.id = 1
            mock_attraction_2 = Mock()
            mock_attraction_2.id = 2
            mock_attraction_class.side_effect = [mock_attraction_1, mock_attraction_2]

            with patch.object(self.client, "invalidate_park_cache") as mock_invalidate:
                await self.client.sync_attraction_data(
                    mock_client, mock_db, "park_123", 5
                )

                # Should create 2 attractions
                assert mock_attraction_class.call_count == 2
                assert mock_db.add.call_count == 2
                assert mock_db.commit.call_count == 2
                assert mock_invalidate.call_count == 2

    @pytest.mark.asyncio
    async def test_sync_attraction_data_database_error(self):
        """Test attraction sync with database error."""
        attractions_data = {
            "children": [
                {
                    "id": "attraction_error",
                    "name": "Error Attraction",
                    "entityType": "ATTRACTION",
                    "location": {"latitude": 28.42, "longitude": -81.58},
                }
            ]
        }

        mock_response = Mock()
        mock_response.json.return_value = attractions_data
        mock_response.raise_for_status.return_value = None

        mock_client = AsyncMock()
        mock_client.get.return_value = mock_response

        mock_db = AsyncMock(spec=AsyncSession)

        # Mock attraction doesn't exist
        mock_result = Mock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute.return_value = mock_result

        # Mock commit error
        mock_db.commit.side_effect = Exception("Database error")

        with patch("app.services.theme_park_service.Attraction"):
            with pytest.raises(Exception, match="Database error"):
                await self.client.sync_attraction_data(
                    mock_client, mock_db, "park_123", 5
                )

            mock_db.rollback.assert_called_once()

    @pytest.mark.asyncio
    async def test_sync_individual_theme_park_data_success(self):
        """Test syncing data for a specific park by internal ID."""
        mock_park = Mock()
        mock_park.id = 1
        mock_park.external_id = "external_123"
        mock_park.resort_name = "Test Resort"

        with patch(
            "app.services.theme_park_service.AsyncSessionLocal"
        ) as mock_session_local:
            with patch(
                "app.services.theme_park_service.AsyncClient"
            ) as mock_client_class:
                mock_session = AsyncMock()
                mock_session_context = AsyncMock()
                mock_session_context.__aenter__.return_value = mock_session
                mock_session_local.return_value = mock_session_context

                # Mock park lookup
                mock_result = Mock()
                mock_result.scalar_one_or_none.return_value = mock_park
                mock_session.execute.return_value = mock_result

                mock_client = AsyncMock()
                mock_client_context = AsyncMock()
                mock_client_context.__aenter__.return_value = mock_client
                mock_client_class.return_value = mock_client_context

                with patch.object(self.client, "sync_park_data") as mock_sync_park:
                    with patch.object(
                        self.client, "sync_attraction_data"
                    ) as mock_sync_attractions:
                        await self.client.sync_individual_theme_park_data(1)

                        mock_sync_park.assert_called_once_with(
                            mock_client, mock_session, "external_123", "Test Resort"
                        )
                        mock_sync_attractions.assert_called_once_with(
                            mock_client, mock_session, "external_123", 1
                        )

    @pytest.mark.asyncio
    async def test_sync_individual_theme_park_data_park_not_found(self):
        """Test syncing when park is not found."""
        with patch(
            "app.services.theme_park_service.AsyncSessionLocal"
        ) as mock_session_local:
            mock_session = AsyncMock()
            mock_session_context = AsyncMock()
            mock_session_context.__aenter__.return_value = mock_session
            mock_session_local.return_value = mock_session_context

            # Mock park not found
            mock_result = Mock()
            mock_result.scalar_one_or_none.return_value = None
            mock_session.execute.return_value = mock_result

            # Should not raise exception, just return
            await self.client.sync_individual_theme_park_data(999)


class TestSyncParkDataFunction:
    """Test the sync_park_data function."""

    @pytest.mark.asyncio
    async def test_sync_park_data_with_park_id(self):
        """Test sync_park_data function with specific park ID."""
        with patch.object(
            ThemeParkClient, "sync_individual_theme_park_data"
        ) as mock_sync:
            await sync_park_data(park_id=1)
            mock_sync.assert_called_once_with(1)

    @pytest.mark.asyncio
    async def test_sync_park_data_all_parks(self):
        """Test sync_park_data function for all parks."""
        with patch.object(ThemeParkClient, "sync_all_theme_park_data") as mock_sync:
            await sync_park_data()
            mock_sync.assert_called_once()

    @pytest.mark.asyncio
    async def test_sync_park_data_none_park_id(self):
        """Test sync_park_data function with park_id=None."""
        with patch.object(ThemeParkClient, "sync_all_theme_park_data") as mock_sync:
            await sync_park_data(park_id=None)
            mock_sync.assert_called_once()
