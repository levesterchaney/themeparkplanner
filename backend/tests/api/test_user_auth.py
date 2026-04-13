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
        assert "error" in data
        assert "session token" in data["error"].lower()

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
            assert "error" in data
            assert "invalid session" in data["error"].lower()

        app.dependency_overrides.clear()
