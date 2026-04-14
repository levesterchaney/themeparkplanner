from unittest.mock import AsyncMock, Mock

import pytest
from httpx import AsyncClient


class TestUserRegistration:
    """Test user registration endpoint."""

    @pytest.mark.asyncio
    async def test_register_user_success(self, client: AsyncClient):
        """Test successful user registration."""
        user_data = {
            "email": "test@example.com",
            "password": "TestPassword123",
            "firstName": "Test",
            "lastName": "User",
        }

        response = await client.post("/api/v1/auth/register", json=user_data)

        assert response.status_code == 201
        data = response.json()
        assert data["message"] == "User created successfully"
        assert "user_id" in data

        # Check that session cookie is set
        assert "session_token" in response.cookies

    @pytest.mark.asyncio
    async def test_register_user_duplicate_email(
        self, mock_db_with_existing_user: AsyncMock
    ):
        """Test registration with duplicate email fails."""
        from httpx import AsyncClient

        from app.core.database import get_db
        from app.main import app

        async def override_get_db():
            yield mock_db_with_existing_user

        app.dependency_overrides[get_db] = override_get_db

        async with AsyncClient(app=app, base_url="http://testserver") as client:
            user_data = {
                "email": "duplicate@example.com",
                "password": "TestPassword123",
                "firstName": "Test",
            }

            response = await client.post("/api/v1/auth/register", json=user_data)

            assert response.status_code == 409
            data = response.json()
            assert "error" in data
            assert "email already exists" in data["error"].lower()

        app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_register_user_weak_password(self, client: AsyncClient):
        """Test registration with weak password fails."""
        user_data = {
            "email": "weak@example.com",
            "password": "123",  # Too short
            "firstName": "Test",
        }

        response = await client.post("/api/v1/auth/register", json=user_data)

        assert response.status_code == 422
        data = response.json()
        assert "error" in data
        assert "8 characters" in data["error"]


class TestUserLogin:
    """Test user login endpoint."""

    @pytest.mark.asyncio
    async def test_login_user_success(self, mock_db_with_login_user: AsyncMock):
        """Test successful user login."""
        from httpx import AsyncClient

        from app.core.database import get_db
        from app.main import app

        async def override_get_db():
            yield mock_db_with_login_user

        app.dependency_overrides[get_db] = override_get_db

        async with AsyncClient(app=app, base_url="http://testserver") as client:
            # Login with existing user
            login_data = {"email": "login@example.com", "password": "TestPassword123"}
            response = await client.post("/api/v1/auth/login", json=login_data)

            assert response.status_code == 200
            data = response.json()
            assert data["message"] == "Login successful"
            assert "user_id" in data

            # Check that session cookie is set
            assert "session_token" in response.cookies

        app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_login_user_invalid_email(self, client: AsyncClient):
        """Test login with non-existent email fails."""
        login_data = {"email": "nonexistent@example.com", "password": "TestPassword123"}
        response = await client.post("/api/v1/auth/login", json=login_data)

        assert response.status_code == 401
        data = response.json()
        assert "error" in data
        assert "invalid" in data["error"].lower()

    @pytest.mark.asyncio
    async def test_login_user_invalid_password(
        self, mock_db_with_login_user: AsyncMock
    ):
        """Test login with wrong password fails."""
        from httpx import AsyncClient

        from app.core.database import get_db
        from app.main import app

        async def override_get_db():
            yield mock_db_with_login_user

        app.dependency_overrides[get_db] = override_get_db

        async with AsyncClient(app=app, base_url="http://testserver") as client:
            # Try login with wrong password
            login_data = {"email": "login@example.com", "password": "WrongPassword123"}
            response = await client.post("/api/v1/auth/login", json=login_data)

            assert response.status_code == 401
            data = response.json()
            assert "error" in data
            assert "invalid" in data["error"].lower()

        app.dependency_overrides.clear()


class TestUserLogout:
    """Test user logout endpoint."""

    @pytest.mark.asyncio
    async def test_logout_user_success(self, mock_db_with_login_user: AsyncMock):
        from httpx import AsyncClient

        from app.core.database import get_db
        from app.main import app

        async def override_get_db():
            yield mock_db_with_login_user

        app.dependency_overrides[get_db] = override_get_db

        async with AsyncClient(app=app, base_url="http://testserver") as client:
            # Login with existing user to get session token
            login_data = {"email": "login@example.com", "password": "TestPassword123"}
            login_response = await client.post("/api/v1/auth/login", json=login_data)
            assert login_response.status_code == 200
            assert "session_token" in login_response.cookies

            # Get the session token for logout
            session_token = login_response.cookies["session_token"]

            # Logout with the session token
            logout_response = await client.post(
                "/api/v1/auth/logout", cookies={"session_token": session_token}
            )
            assert logout_response.status_code == 204

        app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_logout_user_unauthorized(self, client: AsyncClient):
        """Test logout without session token."""
        response = await client.post("/api/v1/auth/logout")
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
        assert "session token" in data["detail"].lower()

    @pytest.mark.asyncio
    async def test_logout_user_invalid_session_token(self):
        """Test logout with invalid session token."""
        from httpx import AsyncClient

        from app.core.database import get_db
        from app.main import app

        # Create mock that returns None for session lookup
        mock_session = AsyncMock()
        mock_result = Mock()
        mock_result.scalar.return_value = None
        mock_session.execute.return_value = mock_result

        async def override_get_db():
            yield mock_session

        app.dependency_overrides[get_db] = override_get_db

        async with AsyncClient(app=app, base_url="http://testserver") as client:
            response = await client.post(
                "/api/v1/auth/logout", cookies={"session_token": "invalid_token"}
            )
            assert response.status_code == 401
            data = response.json()
            assert "detail" in data
            assert (
                "invalid" in data["detail"].lower()
                or "session" in data["detail"].lower()
            )

        app.dependency_overrides.clear()


class TestForgotPassword:
    """Test forgot password endpoint."""

    @pytest.mark.asyncio
    async def test_forgot_password_success(self, mock_db_with_login_user: AsyncMock):
        """Test forgot password with valid email."""
        from unittest.mock import patch

        from httpx import AsyncClient

        from app.core.database import get_db
        from app.main import app

        async def override_get_db():
            yield mock_db_with_login_user

        app.dependency_overrides[get_db] = override_get_db

        # Mock the send_email function
        with patch("app.api.user_auth.send_email") as mock_send_email:
            mock_send_email.return_value = True

            async with AsyncClient(app=app, base_url="http://testserver") as client:
                forgot_data = {"email": "login@example.com"}
                response = await client.post(
                    "/api/v1/auth/forgot-password", json=forgot_data
                )

                assert response.status_code == 200
                data = response.json()
                assert "reset link has been sent" in data["message"].lower()

                # Verify send_email was called
                mock_send_email.assert_called_once()
                call_args = mock_send_email.call_args
                assert call_args[1]["to_email"] == "login@example.com"
                assert call_args[1]["subject"] == "Reset your account password"
                assert "reset-password?token=" in call_args[1]["body"]["reset_url"]

                # Verify password reset token was stored in database
                mock_db_with_login_user.add.assert_called()
                mock_db_with_login_user.commit.assert_called()

        app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_forgot_password_nonexistent_email(self, client: AsyncClient):
        """Test forgot password with non-existent email."""
        from unittest.mock import patch

        # Mock the send_email function
        with patch("app.api.user_auth.send_email") as mock_send_email:
            forgot_data = {"email": "nonexistent@example.com"}
            response = await client.post(
                "/api/v1/auth/forgot-password", json=forgot_data
            )

            assert response.status_code == 200
            data = response.json()
            assert "reset link has been sent" in data["message"].lower()

            # Verify send_email was NOT called for non-existent email
            mock_send_email.assert_not_called()

    @pytest.mark.asyncio
    async def test_forgot_password_email_failure(
        self, mock_db_with_login_user: AsyncMock
    ):
        """Test forgot password when email sending fails."""
        from unittest.mock import patch

        from httpx import AsyncClient

        from app.core.database import get_db
        from app.main import app

        async def override_get_db():
            yield mock_db_with_login_user

        app.dependency_overrides[get_db] = override_get_db

        # Mock the send_email function to raise an exception
        with patch("app.api.user_auth.send_email") as mock_send_email:
            mock_send_email.side_effect = Exception("Email server error")

            async with AsyncClient(app=app, base_url="http://testserver") as client:
                forgot_data = {"email": "login@example.com"}
                response = await client.post(
                    "/api/v1/auth/forgot-password", json=forgot_data
                )

                assert response.status_code == 422
                data = response.json()
                assert "failed to process" in data["error"].lower()

        app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_forgot_password_database_failure(self):
        """Test forgot password when database operation fails."""
        from unittest.mock import AsyncMock, Mock, patch

        from httpx import AsyncClient

        from app.core.database import get_db
        from app.main import app
        from app.models.users import User

        # Create mock session that fails on commit
        mock_session = AsyncMock()

        # Mock user lookup to return a user
        existing_user = User(
            id=1, email="test@example.com", password_hash="hashed_password"
        )
        mock_result = Mock()
        mock_result.scalar.return_value = existing_user
        mock_session.execute.return_value = mock_result

        # Make commit fail
        mock_session.commit.side_effect = Exception("Database error")
        mock_session.add = Mock()

        async def override_get_db():
            yield mock_session

        app.dependency_overrides[get_db] = override_get_db

        with patch("app.api.user_auth.send_email") as mock_send_email:
            async with AsyncClient(app=app, base_url="http://testserver") as client:
                forgot_data = {"email": "test@example.com"}
                response = await client.post(
                    "/api/v1/auth/forgot-password", json=forgot_data
                )

                assert response.status_code == 422
                data = response.json()
                assert "failed to process" in data["error"].lower()

                # Email should not be sent when database fails
                mock_send_email.assert_not_called()

        app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_forgot_password_token_generation(
        self, mock_db_with_login_user: AsyncMock
    ):
        """Test that password reset tokens are generated properly."""
        from datetime import datetime, timedelta, timezone
        from unittest.mock import patch

        from httpx import AsyncClient

        from app.core.database import get_db
        from app.main import app

        async def override_get_db():
            yield mock_db_with_login_user

        app.dependency_overrides[get_db] = override_get_db

        with patch("app.api.user_auth.send_email") as mock_send_email:
            mock_send_email.return_value = True

            async with AsyncClient(app=app, base_url="http://testserver") as client:
                forgot_data = {"email": "login@example.com"}
                response = await client.post(
                    "/api/v1/auth/forgot-password", json=forgot_data
                )

                assert response.status_code == 200

                # Check that add was called with PasswordResetToken
                mock_db_with_login_user.add.assert_called()
                added_token = mock_db_with_login_user.add.call_args[0][0]

                assert added_token.user_id == 1
                assert added_token.token_hash is not None
                assert len(added_token.token_hash) > 10  # Token should be substantial
                assert added_token.expires_at > datetime.now(timezone.utc)
                assert added_token.expires_at <= datetime.now(timezone.utc) + timedelta(
                    hours=2
                )

        app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_forgot_password_invalid_email_format(self, client: AsyncClient):
        """Test forgot password with invalid email format."""
        from unittest.mock import patch

        with patch("app.api.user_auth.send_email") as mock_send_email:
            forgot_data = {"email": "invalid-email-format"}
            response = await client.post(
                "/api/v1/auth/forgot-password", json=forgot_data
            )

            # The endpoint returns 200 even for invalid email to prevent enumeration
            assert response.status_code == 200
            data = response.json()
            assert "reset link has been sent" in data["message"].lower()

            # Email should not be sent for invalid format
            mock_send_email.assert_not_called()

    @pytest.mark.asyncio
    async def test_forgot_password_missing_email(self, client: AsyncClient):
        """Test forgot password with missing email field."""
        forgot_data = {}
        response = await client.post("/api/v1/auth/forgot-password", json=forgot_data)

        # Should return 422 for validation error
        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_forgot_password_empty_email(self, client: AsyncClient):
        """Test forgot password with empty email."""
        from unittest.mock import patch

        with patch("app.api.user_auth.send_email") as mock_send_email:
            forgot_data = {"email": ""}
            response = await client.post(
                "/api/v1/auth/forgot-password", json=forgot_data
            )

            # The endpoint returns 200 even for empty email to prevent enumeration
            assert response.status_code == 200
            data = response.json()
            assert "reset link has been sent" in data["message"].lower()

            # Email should not be sent for empty email
            mock_send_email.assert_not_called()


class TestResetPassword:
    """Test reset password endpoint."""

    @pytest.mark.asyncio
    async def test_reset_password_success(self):
        """Test successful password reset with valid token."""
        from datetime import datetime, timedelta, timezone
        from unittest.mock import AsyncMock, Mock

        import bcrypt
        from httpx import AsyncClient

        from app.core.database import get_db
        from app.main import app
        from app.models.users import PasswordResetToken, Session, User

        # Create mock session with user and valid reset token
        mock_session = AsyncMock()

        # Create user
        existing_user = User(
            id=1,
            email="reset@example.com",
            password_hash=bcrypt.hashpw(
                "OldPassword123".encode("utf-8"), bcrypt.gensalt()
            ).decode("utf-8"),
        )

        # Create valid reset token
        reset_token = PasswordResetToken(
            id=1,
            user_id=1,
            token_hash="valid_reset_token",
            expires_at=datetime.now(timezone.utc) + timedelta(hours=1),
            used_at=None,
        )

        # Create user sessions to be deleted
        user_sessions = [
            Session(id=1, user_id=1, token="session1"),
            Session(id=2, user_id=1, token="session2"),
        ]

        def mock_execute(query):
            mock_result = Mock()
            query_str = str(query)

            if (
                "password_reset_tokens" in query_str.lower()
                and "token_hash" in query_str.lower()
            ):
                mock_result.scalar.return_value = reset_token
            elif "users" in query_str.lower() and "users.id" in query_str.lower():
                mock_result.scalar.return_value = existing_user
            elif "sessions" in query_str.lower() and "user_id" in query_str.lower():
                mock_result.scalars.return_value.all.return_value = user_sessions
            else:
                mock_result.scalar.return_value = None

            return mock_result

        mock_session.execute.side_effect = mock_execute
        mock_session.commit = AsyncMock()
        mock_session.delete = AsyncMock()

        async def override_get_db():
            yield mock_session

        app.dependency_overrides[get_db] = override_get_db

        async with AsyncClient(app=app, base_url="http://testserver") as client:
            reset_data = {
                "token": "valid_reset_token",
                "new_password": "NewPassword123",
            }
            response = await client.post("/api/v1/auth/reset-password", json=reset_data)

            assert response.status_code == 200
            data = response.json()
            assert "password reset successful" in data["message"].lower()

            # Verify user password was updated
            assert existing_user.password_hash != bcrypt.hashpw(
                "OldPassword123".encode("utf-8"), bcrypt.gensalt()
            ).decode("utf-8")

            # Verify sessions were deleted
            assert mock_session.delete.call_count >= 1

            # Verify commit was called
            mock_session.commit.assert_called()

        app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_reset_password_invalid_token(self, client: AsyncClient):
        """Test reset password with invalid token."""
        reset_data = {"token": "invalid_token", "new_password": "NewPassword123"}
        response = await client.post("/api/v1/auth/reset-password", json=reset_data)

        assert response.status_code == 400
        data = response.json()
        assert "invalid" in data["error"].lower()

    @pytest.mark.asyncio
    async def test_reset_password_expired_token(self):
        """Test reset password with expired token."""
        from datetime import datetime, timedelta, timezone
        from unittest.mock import AsyncMock, Mock

        from httpx import AsyncClient

        from app.core.database import get_db
        from app.main import app
        from app.models.users import PasswordResetToken

        mock_session = AsyncMock()

        # Create expired reset token
        expired_token = PasswordResetToken(
            id=1,
            user_id=1,
            token_hash="expired_token",
            expires_at=datetime.now(timezone.utc) - timedelta(hours=1),  # Expired
            used_at=None,
        )

        def mock_execute(query):
            mock_result = Mock()
            query_str = str(query)

            if (
                "password_reset_tokens" in query_str.lower()
                and "token_hash" in query_str.lower()
            ):
                mock_result.scalar.return_value = expired_token
            else:
                mock_result.scalar.return_value = None

            return mock_result

        mock_session.execute.side_effect = mock_execute

        async def override_get_db():
            yield mock_session

        app.dependency_overrides[get_db] = override_get_db

        async with AsyncClient(app=app, base_url="http://testserver") as client:
            reset_data = {"token": "expired_token", "new_password": "NewPassword123"}
            response = await client.post("/api/v1/auth/reset-password", json=reset_data)

            assert response.status_code == 400
            data = response.json()
            assert "expired" in data["error"].lower()

        app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_reset_password_used_token(self):
        """Test reset password with already used token."""
        from datetime import datetime, timedelta, timezone
        from unittest.mock import AsyncMock, Mock

        from httpx import AsyncClient

        from app.core.database import get_db
        from app.main import app
        from app.models.users import PasswordResetToken

        mock_session = AsyncMock()

        # Create used reset token
        used_token = PasswordResetToken(
            id=1,
            user_id=1,
            token_hash="used_token",
            expires_at=datetime.now(timezone.utc) + timedelta(hours=1),
            used_at=datetime.now(timezone.utc) - timedelta(minutes=30),  # Already used
        )

        def mock_execute(query):
            mock_result = Mock()
            query_str = str(query)

            if (
                "password_reset_tokens" in query_str.lower()
                and "token_hash" in query_str.lower()
            ):
                mock_result.scalar.return_value = used_token
            else:
                mock_result.scalar.return_value = None

            return mock_result

        mock_session.execute.side_effect = mock_execute

        async def override_get_db():
            yield mock_session

        app.dependency_overrides[get_db] = override_get_db

        async with AsyncClient(app=app, base_url="http://testserver") as client:
            reset_data = {"token": "used_token", "new_password": "NewPassword123"}
            response = await client.post("/api/v1/auth/reset-password", json=reset_data)

            assert response.status_code == 400
            data = response.json()
            assert "already used" in data["error"].lower()

        app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_reset_password_user_not_found(self):
        """Test reset password when user is deleted after token creation."""
        from datetime import datetime, timedelta, timezone
        from unittest.mock import AsyncMock, Mock

        from httpx import AsyncClient

        from app.core.database import get_db
        from app.main import app
        from app.models.users import PasswordResetToken

        mock_session = AsyncMock()

        # Create valid reset token but user doesn't exist
        reset_token = PasswordResetToken(
            id=1,
            user_id=999,  # Non-existent user
            token_hash="orphaned_token",
            expires_at=datetime.now(timezone.utc) + timedelta(hours=1),
            used_at=None,
        )

        def mock_execute(query):
            mock_result = Mock()
            query_str = str(query)

            if (
                "password_reset_tokens" in query_str.lower()
                and "token_hash" in query_str.lower()
            ):
                mock_result.scalar.return_value = reset_token
            elif "users" in query_str.lower() and "users.id" in query_str.lower():
                mock_result.scalar.return_value = None  # User not found
            else:
                mock_result.scalar.return_value = None

            return mock_result

        mock_session.execute.side_effect = mock_execute

        async def override_get_db():
            yield mock_session

        app.dependency_overrides[get_db] = override_get_db

        async with AsyncClient(app=app, base_url="http://testserver") as client:
            reset_data = {"token": "orphaned_token", "new_password": "NewPassword123"}
            response = await client.post("/api/v1/auth/reset-password", json=reset_data)

            assert response.status_code == 400
            data = response.json()
            assert "user not found" in data["error"].lower()

        app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_reset_password_database_failure(self):
        """Test reset password when database operation fails."""
        from datetime import datetime, timedelta, timezone
        from unittest.mock import AsyncMock, Mock

        import bcrypt
        from httpx import AsyncClient

        from app.core.database import get_db
        from app.main import app
        from app.models.users import PasswordResetToken, User

        mock_session = AsyncMock()

        # Create valid reset token and user
        existing_user = User(
            id=1,
            email="reset@example.com",
            password_hash=bcrypt.hashpw(
                "OldPassword123".encode("utf-8"), bcrypt.gensalt()
            ).decode("utf-8"),
        )

        reset_token = PasswordResetToken(
            id=1,
            user_id=1,
            token_hash="valid_token",
            expires_at=datetime.now(timezone.utc) + timedelta(hours=1),
            used_at=None,
        )

        def mock_execute(query):
            mock_result = Mock()
            query_str = str(query)

            if (
                "password_reset_tokens" in query_str.lower()
                and "token_hash" in query_str.lower()
            ):
                mock_result.scalar.return_value = reset_token
            elif "users" in query_str.lower() and "users.id" in query_str.lower():
                mock_result.scalar.return_value = existing_user
            elif "sessions" in query_str.lower() and "user_id" in query_str.lower():
                mock_result.scalars.return_value.all.return_value = []
            else:
                mock_result.scalar.return_value = None

            return mock_result

        mock_session.execute.side_effect = mock_execute
        mock_session.delete = AsyncMock()
        # Make commit fail
        mock_session.commit.side_effect = Exception("Database error")

        async def override_get_db():
            yield mock_session

        app.dependency_overrides[get_db] = override_get_db

        async with AsyncClient(app=app, base_url="http://testserver") as client:
            reset_data = {"token": "valid_token", "new_password": "NewPassword123"}
            response = await client.post("/api/v1/auth/reset-password", json=reset_data)

            assert response.status_code == 422
            data = response.json()
            assert "failed to reset password" in data["error"].lower()

        app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_reset_password_missing_token(self, client: AsyncClient):
        """Test reset password with missing token field."""
        reset_data = {"new_password": "NewPassword123"}
        response = await client.post("/api/v1/auth/reset-password", json=reset_data)

        # Should return 422 for validation error
        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_reset_password_missing_password(self, client: AsyncClient):
        """Test reset password with missing new_password field."""
        reset_data = {"token": "some_token"}
        response = await client.post("/api/v1/auth/reset-password", json=reset_data)

        # Should return 422 for validation error
        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_reset_password_empty_token(self, client: AsyncClient):
        """Test reset password with empty token."""
        reset_data = {"token": "", "new_password": "NewPassword123"}
        response = await client.post("/api/v1/auth/reset-password", json=reset_data)

        assert response.status_code == 400
        data = response.json()
        assert "invalid" in data["error"].lower()

    @pytest.mark.asyncio
    async def test_reset_password_empty_new_password(self, client: AsyncClient):
        """Test reset password with empty new password."""
        reset_data = {"token": "valid_token", "new_password": ""}
        response = await client.post("/api/v1/auth/reset-password", json=reset_data)

        assert response.status_code == 400
        data = response.json()
        assert "invalid" in data["error"].lower()

    @pytest.mark.asyncio
    async def test_reset_password_clears_all_sessions(self):
        """Test that password reset clears all user sessions."""
        from datetime import datetime, timedelta, timezone
        from unittest.mock import AsyncMock, Mock

        import bcrypt
        from httpx import AsyncClient

        from app.core.database import get_db
        from app.main import app
        from app.models.users import PasswordResetToken, Session, User

        mock_session = AsyncMock()

        # Create user
        existing_user = User(
            id=1,
            email="reset@example.com",
            password_hash=bcrypt.hashpw(
                "OldPassword123".encode("utf-8"), bcrypt.gensalt()
            ).decode("utf-8"),
        )

        # Create valid reset token
        reset_token = PasswordResetToken(
            id=1,
            user_id=1,
            token_hash="valid_token",
            expires_at=datetime.now(timezone.utc) + timedelta(hours=1),
            used_at=None,
        )

        # Create multiple user sessions
        user_sessions = [
            Session(id=1, user_id=1, token="session1"),
            Session(id=2, user_id=1, token="session2"),
            Session(id=3, user_id=1, token="session3"),
        ]

        def mock_execute(query):
            mock_result = Mock()
            query_str = str(query)

            if (
                "password_reset_tokens" in query_str.lower()
                and "token_hash" in query_str.lower()
            ):
                mock_result.scalar.return_value = reset_token
            elif "users" in query_str.lower() and "users.id" in query_str.lower():
                mock_result.scalar.return_value = existing_user
            elif "sessions" in query_str.lower() and "user_id" in query_str.lower():
                mock_result.scalars.return_value.all.return_value = user_sessions
            else:
                mock_result.scalar.return_value = None

            return mock_result

        mock_session.execute.side_effect = mock_execute
        mock_session.commit = AsyncMock()
        mock_session.delete = AsyncMock()

        async def override_get_db():
            yield mock_session

        app.dependency_overrides[get_db] = override_get_db

        async with AsyncClient(app=app, base_url="http://testserver") as client:
            reset_data = {"token": "valid_token", "new_password": "NewPassword123"}
            response = await client.post("/api/v1/auth/reset-password", json=reset_data)

            assert response.status_code == 200

            # Verify all sessions were deleted
            assert mock_session.delete.call_count == 2  # sessions + reset token

            # Verify commit was called
            mock_session.commit.assert_called()

        app.dependency_overrides.clear()
