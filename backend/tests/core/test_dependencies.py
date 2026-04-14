from datetime import datetime, timedelta, timezone
from unittest.mock import AsyncMock, Mock

import pytest
from fastapi import HTTPException, Request

from app.core.dependencies import get_current_user
from app.models import Session, User


class TestGetCurrentUser:
    """Test get_current_user dependency function."""

    @pytest.mark.asyncio
    async def test_get_current_user_success(self):
        """Test successful user retrieval with valid session token."""
        # Create mock request with session token
        mock_request = Mock(spec=Request)
        mock_request.cookies = {"session_token": "valid_token_123"}

        # Create mock database session
        mock_db = AsyncMock()

        # Create mock user and session objects
        mock_user = User(
            id=1,
            email="test@example.com",
            password_hash="hashed_password",
            first_name="Test",
            last_name="User",
        )

        mock_session = Session(
            id=1,
            user_id=1,
            token="valid_token_123",
            expires_at=datetime.now(timezone.utc) + timedelta(hours=1),
        )
        # Set expires_at to future date so is_expired returns False
        mock_session.expires_at = datetime.now(timezone.utc) + timedelta(hours=1)

        # Mock database queries
        def mock_execute(query):
            mock_result = Mock()
            query_str = str(query)

            if "sessions.token" in query_str.lower():
                mock_result.scalars.return_value.first.return_value = mock_session
            elif "users.id" in query_str.lower():
                mock_result.scalars.return_value.first.return_value = mock_user
            else:
                mock_result.scalars.return_value.first.return_value = None

            return mock_result

        mock_db.execute.side_effect = mock_execute

        # Call the function
        result = await get_current_user(mock_request, mock_db)

        # Assertions
        assert result == mock_user
        assert result.id == 1
        assert result.email == "test@example.com"
        assert mock_db.execute.call_count == 2  # One for session, one for user

    @pytest.mark.asyncio
    async def test_get_current_user_no_token(self):
        """Test that HTTPException is raised when no session token is provided."""
        # Create mock request without session token
        mock_request = Mock(spec=Request)
        mock_request.cookies = {}

        mock_db = AsyncMock()

        # Call function and expect HTTPException
        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(mock_request, mock_db)

        assert exc_info.value.status_code == 401
        assert "No session token provided" in exc_info.value.detail
        mock_db.execute.assert_not_called()

    @pytest.mark.asyncio
    async def test_get_current_user_empty_token(self):
        """Test that HTTPException is raised when session token is empty."""
        # Create mock request with empty session token
        mock_request = Mock(spec=Request)
        mock_request.cookies = {"session_token": ""}

        mock_db = AsyncMock()

        # Call function and expect HTTPException
        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(mock_request, mock_db)

        assert exc_info.value.status_code == 401
        assert "No session token provided" in exc_info.value.detail
        mock_db.execute.assert_not_called()

    @pytest.mark.asyncio
    async def test_get_current_user_invalid_token(self):
        """Test that HTTPException is raised when session token is invalid."""
        # Create mock request with invalid session token
        mock_request = Mock(spec=Request)
        mock_request.cookies = {"session_token": "invalid_token"}

        mock_db = AsyncMock()

        # Mock database query returning no session
        def mock_execute(query):
            mock_result = Mock()
            mock_result.scalars.return_value.first.return_value = None
            return mock_result

        mock_db.execute.side_effect = mock_execute

        # Call function and expect HTTPException
        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(mock_request, mock_db)

        assert exc_info.value.status_code == 401
        assert "Invalid session token" in exc_info.value.detail
        mock_db.execute.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_current_user_expired_session(self):
        """Test that expired sessions are cleaned up and HTTPException is raised."""
        # Create mock request with session token
        mock_request = Mock(spec=Request)
        mock_request.cookies = {"session_token": "expired_token"}

        mock_db = AsyncMock()

        # Create expired session
        expired_session = Session(
            id=1,
            user_id=1,
            token="expired_token",
            expires_at=datetime.now(timezone.utc) - timedelta(hours=1),
        )

        # Mock database query returning expired session
        def mock_execute(query):
            mock_result = Mock()
            mock_result.scalars.return_value.first.return_value = expired_session
            return mock_result

        mock_db.execute.side_effect = mock_execute

        # Call function and expect HTTPException
        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(mock_request, mock_db)

        assert exc_info.value.status_code == 401
        assert "Session expired" in exc_info.value.detail

        # Verify expired session was deleted
        mock_db.delete.assert_called_once_with(expired_session)
        mock_db.commit.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_current_user_session_without_user(self):
        """Test HTTPException when session exists but user doesn't."""
        # Create mock request with session token
        mock_request = Mock(spec=Request)
        mock_request.cookies = {"session_token": "orphaned_session"}

        mock_db = AsyncMock()

        # Create session with no corresponding user
        mock_session = Session(
            id=1,
            user_id=999,  # Non-existent user ID
            token="orphaned_session",
            expires_at=datetime.now(timezone.utc) + timedelta(hours=1),
        )
        # Set expires_at to future date so is_expired returns False
        mock_session.expires_at = datetime.now(timezone.utc) + timedelta(hours=1)

        # Mock database queries
        def mock_execute(query):
            mock_result = Mock()
            query_str = str(query)

            if "sessions.token" in query_str.lower():
                mock_result.scalars.return_value.first.return_value = mock_session
            elif "users.id" in query_str.lower():
                mock_result.scalars.return_value.first.return_value = (
                    None  # User not found
                )
            else:
                mock_result.scalars.return_value.first.return_value = None

            return mock_result

        mock_db.execute.side_effect = mock_execute

        # Call function and expect HTTPException
        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(mock_request, mock_db)

        assert exc_info.value.status_code == 401
        assert "User not found" in exc_info.value.detail
        assert mock_db.execute.call_count == 2

    @pytest.mark.asyncio
    async def test_get_current_user_database_error(self):
        """Test that database errors are properly propagated."""
        # Create mock request with session token
        mock_request = Mock(spec=Request)
        mock_request.cookies = {"session_token": "valid_token"}

        mock_db = AsyncMock()
        mock_db.execute.side_effect = Exception("Database connection error")

        # Call function and expect original exception to be raised
        with pytest.raises(Exception) as exc_info:
            await get_current_user(mock_request, mock_db)

        assert "Database connection error" in str(exc_info.value)

    @pytest.mark.asyncio
    async def test_get_current_user_with_none_cookie_values(self):
        """Test behavior when cookies contain None values."""
        # Create mock request with None cookie value
        mock_request = Mock(spec=Request)
        mock_request.cookies = {"session_token": None}

        mock_db = AsyncMock()

        # Call function and expect HTTPException
        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(mock_request, mock_db)

        assert exc_info.value.status_code == 401
        assert "No session token provided" in exc_info.value.detail

    @pytest.mark.asyncio
    async def test_get_current_user_multiple_sessions_same_token(self):
        """
        Test that first session is returned when multiple sessions
        have same token.
        """
        # Create mock request with session token
        mock_request = Mock(spec=Request)
        mock_request.cookies = {"session_token": "duplicate_token"}

        mock_db = AsyncMock()

        # Create user and session objects
        mock_user = User(
            id=1, email="test@example.com", password_hash="hashed_password"
        )

        mock_session = Session(
            id=1,
            user_id=1,
            token="duplicate_token",
            expires_at=datetime.now(timezone.utc) + timedelta(hours=1),
        )
        # Set expires_at to future date so is_expired returns False
        mock_session.expires_at = datetime.now(timezone.utc) + timedelta(hours=1)

        # Mock database queries
        def mock_execute(query):
            mock_result = Mock()
            query_str = str(query)

            if "sessions.token" in query_str.lower():
                mock_result.scalars.return_value.first.return_value = mock_session
            elif "users.id" in query_str.lower():
                mock_result.scalars.return_value.first.return_value = mock_user

            return mock_result

        mock_db.execute.side_effect = mock_execute

        # Call the function
        result = await get_current_user(mock_request, mock_db)

        # Should return the user successfully
        assert result == mock_user


class TestDependenciesIntegration:
    """Integration tests for dependencies."""

    @pytest.mark.asyncio
    async def test_session_cleanup_on_expired_session(self):
        """Test that expired sessions are properly cleaned up from database."""
        # Create mock request with session token
        mock_request = Mock(spec=Request)
        mock_request.cookies = {"session_token": "expired_token"}

        mock_db = AsyncMock()

        # Create expired session
        expired_session = Session(
            id=1,
            user_id=1,
            token="expired_token",
            expires_at=datetime.now(timezone.utc) - timedelta(hours=2),
        )

        # Mock database query returning expired session
        def mock_execute(query):
            mock_result = Mock()
            mock_result.scalars.return_value.first.return_value = expired_session
            return mock_result

        mock_db.execute.side_effect = mock_execute

        # Call function and expect HTTPException
        with pytest.raises(HTTPException):
            await get_current_user(mock_request, mock_db)

        # Verify session cleanup
        mock_db.delete.assert_called_once_with(expired_session)
        mock_db.commit.assert_called_once()

    @pytest.mark.asyncio
    async def test_proper_error_messages_for_different_scenarios(self):
        """
        Test that appropriate error messages are returned for
        different failure scenarios.
        """
        mock_db = AsyncMock()

        # Test 1: No token
        mock_request_no_token = Mock(spec=Request)
        mock_request_no_token.cookies = {}

        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(mock_request_no_token, mock_db)
        assert exc_info.value.detail == "No session token provided"

        # Test 2: Invalid token
        mock_request_invalid = Mock(spec=Request)
        mock_request_invalid.cookies = {"session_token": "invalid"}

        def mock_execute_invalid(query):
            mock_result = Mock()
            mock_result.scalars.return_value.first.return_value = None
            return mock_result

        mock_db.execute.side_effect = mock_execute_invalid

        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(mock_request_invalid, mock_db)
        assert exc_info.value.detail == "Invalid session token"

        # Test 3: Expired session
        mock_request_expired = Mock(spec=Request)
        mock_request_expired.cookies = {"session_token": "expired"}

        expired_session = Session(
            id=1,
            user_id=1,
            token="expired",
            expires_at=datetime.now(timezone.utc) - timedelta(hours=1),
        )

        def mock_execute_expired(query):
            mock_result = Mock()
            mock_result.scalars.return_value.first.return_value = expired_session
            return mock_result

        mock_db.execute.side_effect = mock_execute_expired

        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(mock_request_expired, mock_db)
        assert exc_info.value.detail == "Session expired"

        # Test 4: User not found
        mock_request_user_not_found = Mock(spec=Request)
        mock_request_user_not_found.cookies = {"session_token": "valid_token"}

        valid_session = Session(id=1, user_id=999, token="valid_token")
        valid_session.expires_at = datetime.now(timezone.utc) + timedelta(hours=1)

        def mock_execute_user_not_found(query):
            mock_result = Mock()
            query_str = str(query)
            if "sessions.token" in query_str.lower():
                mock_result.scalars.return_value.first.return_value = valid_session
            elif "users.id" in query_str.lower():
                mock_result.scalars.return_value.first.return_value = None
            return mock_result

        mock_db.execute.side_effect = mock_execute_user_not_found

        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(mock_request_user_not_found, mock_db)
        assert exc_info.value.detail == "User not found"
