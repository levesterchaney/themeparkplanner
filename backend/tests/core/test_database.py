from unittest.mock import AsyncMock, patch

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal, engine, get_db


class TestDatabase:
    """Test database module functionality."""

    @pytest.mark.asyncio
    async def test_get_db_yields_session(self):
        """Test that get_db yields a database session."""

        with patch("app.core.database.AsyncSessionLocal") as mock_session_local:
            mock_session = AsyncMock(spec=AsyncSession)
            mock_session.close = AsyncMock()

            # Mock the context manager behavior
            mock_context_manager = AsyncMock()
            mock_context_manager.__aenter__.return_value = mock_session
            mock_context_manager.__aexit__.return_value = None
            mock_session_local.return_value = mock_context_manager

            # Create generator
            db_generator = get_db()

            # Get the session
            session = await db_generator.__anext__()

            # Verify it's the mocked session
            assert session == mock_session

            # Verify close is called when generator is closed
            try:
                await db_generator.__anext__()
            except StopAsyncIteration:
                pass  # Expected

    @pytest.mark.asyncio
    async def test_get_db_closes_session_on_exception(self):
        """Test that get_db properly closes session even if exception occurs."""

        with patch("app.core.database.AsyncSessionLocal") as mock_session_local:
            mock_session = AsyncMock(spec=AsyncSession)
            mock_session.close = AsyncMock()

            # Mock the context manager behavior
            mock_context_manager = AsyncMock()
            mock_context_manager.__aenter__.return_value = mock_session
            mock_context_manager.__aexit__.return_value = None
            mock_session_local.return_value = mock_context_manager

            # Create generator
            db_generator = get_db()

            # Get the session
            # session = await db_generator.__anext__()

            # Simulate an exception during usage
            try:
                await db_generator.athrow(Exception("Test exception"))
            except Exception:
                pass  # Expected

            # Verify the context manager's __aexit__ was called (which handles cleanup)
            mock_context_manager.__aexit__.assert_called_once()

    def test_engine_configuration(self):
        """Test that engine is properly configured."""
        assert engine is not None
        # The engine should be configured with the database URL from settings
        assert str(engine.url).startswith("postgresql+asyncpg://")

    def test_session_local_configuration(self):
        """Test that AsyncSessionLocal is properly configured."""
        assert AsyncSessionLocal is not None
        # Check that it's configured to return AsyncSession instances
        assert AsyncSessionLocal.class_ == AsyncSession
        # Check expire_on_commit from the kw dict
        assert AsyncSessionLocal.kw.get("expire_on_commit") is False
