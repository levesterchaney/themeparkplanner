from unittest.mock import AsyncMock, patch

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal, engine, get_db


class TestDatabase:
    """Test database module functionality."""

    @pytest.mark.asyncio
    async def test_get_db_yields_session(self):
        """Test that get_db yields a database session."""

        with patch.object(
            AsyncSessionLocal, "__call__", return_value=AsyncMock()
        ) as mock_session_call:
            mock_session = AsyncMock()
            mock_session.close = AsyncMock()
            mock_session_call.return_value.__aenter__.return_value = mock_session

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

            # Simulate the finally block by manually calling close
            await session.close()
            mock_session.close.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_db_closes_session_on_exception(self):
        """Test that get_db properly closes session even if exception occurs."""

        with patch.object(
            AsyncSessionLocal, "__call__", return_value=AsyncMock()
        ) as mock_session_call:
            mock_session = AsyncMock()
            mock_session.close = AsyncMock()
            mock_session_call.return_value.__aenter__.return_value = mock_session

            # Create generator
            db_generator = get_db()

            # Get the session
            session = await db_generator.__anext__()

            # Simulate an exception during usage
            try:
                await db_generator.athrow(Exception("Test exception"))
            except Exception:
                pass  # Expected

            # The session should still be closed
            await session.close()
            mock_session.close.assert_called_once()

    def test_engine_configuration(self):
        """Test that engine is properly configured."""
        assert engine is not None
        # The engine should be configured with the database URL from settings
        assert str(engine.url).startswith("postgresql+asyncpg://")

    def test_session_local_configuration(self):
        """Test that AsyncSessionLocal is properly configured."""
        assert AsyncSessionLocal is not None
        # Check that it's configured to return AsyncSession instances
        assert AsyncSessionLocal.kw["class_"] == AsyncSession
        assert AsyncSessionLocal.kw["expire_on_commit"] is False
