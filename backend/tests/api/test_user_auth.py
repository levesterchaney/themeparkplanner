from httpx import AsyncClient


class TestUserRegistration:
    """Test user registration endpoint."""

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

    async def test_register_user_duplicate_email(self, client: AsyncClient):
        """Test registration with duplicate email fails."""
        user_data = {
            "email": "duplicate@example.com",
            "password": "TestPassword123",
            "firstName": "Test",
        }

        # Register first user
        await client.post("/api/v1/auth/register", json=user_data)

        # Try to register with same email
        response = await client.post("/api/v1/auth/register", json=user_data)

        assert response.status_code == 409
        data = response.json()
        assert "error" in data
        assert "email already exists" in data["error"].lower()

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

    async def test_login_user_success(self, client: AsyncClient):
        """Test successful user login."""
        # First register a user
        register_data = {
            "email": "login@example.com",
            "password": "TestPassword123",
            "firstName": "Login",
        }
        await client.post("/api/v1/auth/register", json=register_data)

        # Now login
        login_data = {"email": "login@example.com", "password": "TestPassword123"}
        response = await client.post("/api/v1/auth/login", json=login_data)

        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Login successful"
        assert "user_id" in data

        # Check that session cookie is set
        assert "session_token" in response.cookies

    async def test_login_user_invalid_email(self, client: AsyncClient):
        """Test login with non-existent email fails."""
        login_data = {"email": "nonexistent@example.com", "password": "TestPassword123"}
        response = await client.post("/api/v1/auth/login", json=login_data)

        assert response.status_code == 401
        data = response.json()
        assert "error" in data
        assert "invalid" in data["error"].lower()

    async def test_login_user_invalid_password(self, client: AsyncClient):
        """Test login with wrong password fails."""
        # Register user first
        register_data = {
            "email": "wrongpass@example.com",
            "password": "CorrectPassword123",
            "firstName": "Test",
        }
        await client.post("/api/v1/auth/register", json=register_data)

        # Try login with wrong password
        login_data = {"email": "wrongpass@example.com", "password": "WrongPassword123"}
        response = await client.post("/api/v1/auth/login", json=login_data)

        assert response.status_code == 401
        data = response.json()
        assert "error" in data
        assert "invalid" in data["error"].lower()
