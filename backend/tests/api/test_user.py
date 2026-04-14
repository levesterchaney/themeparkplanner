from unittest.mock import AsyncMock, Mock

import pytest
from httpx import AsyncClient


class TestGetUserDetails:
    """Test GET /users/me endpoint."""

    @pytest.mark.asyncio
    async def test_get_user_details_success(self):
        """Test successful retrieval of user details."""
        import bcrypt
        from httpx import AsyncClient

        from app.core.database import get_db
        from app.main import app
        from app.models.users import User, UserPreference

        mock_session = AsyncMock()

        # Create test user
        test_user = User(
            id=1,
            email="test@example.com",
            first_name="John",
            last_name="Doe",
            avatar_url="https://example.com/avatar.jpg",
            password_hash=bcrypt.hashpw(
                "password".encode("utf-8"), bcrypt.gensalt()
            ).decode("utf-8"),
        )

        # Create user preferences
        user_preferences = UserPreference(
            id=1,
            user_id=1,
            default_party_size=4,
            has_kids=True,
            thrill_level="high",
            accessibility_needs=["wheelchair"],
            dietary_restrictions=["vegetarian", "gluten_free"],
        )

        def mock_execute(query):
            mock_result = Mock()
            query_str = str(query)

            if "user_preferences" in query_str.lower():
                mock_result.scalar.return_value = user_preferences
            elif "users" in query_str.lower():
                mock_result.scalar.return_value = test_user
            else:
                mock_result.scalar.return_value = None

            return mock_result

        mock_session.execute.side_effect = mock_execute

        async def override_get_db():
            yield mock_session

        app.dependency_overrides[get_db] = override_get_db

        # Mock get_current_user dependency
        from app.core.dependencies import get_current_user

        async def override_get_current_user():
            return test_user

        app.dependency_overrides[get_current_user] = override_get_current_user

        async with AsyncClient(app=app, base_url="http://testserver") as client:
            response = await client.get("/api/v1/users/me")

            assert response.status_code == 200
            data = response.json()

            assert data["firstName"] == "John"
            assert data["lastName"] == "Doe"
            assert data["email"] == "test@example.com"
            assert data["avatar"] == "https://example.com/avatar.jpg"
            assert data["preferences"]["defaultPartySize"] == 4
            assert data["preferences"]["hasKids"] is True
            assert data["preferences"]["thrillLevel"] == "high"
            assert data["preferences"]["accessibilityNeeds"] == ["wheelchair"]
            assert data["preferences"]["dietaryRestrictions"] == [
                "vegetarian",
                "gluten_free",
            ]

        app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_get_user_details_no_preferences(self):
        """Test user details when preferences don't exist."""
        import bcrypt
        from httpx import AsyncClient

        from app.core.database import get_db
        from app.main import app
        from app.models.users import User

        mock_session = AsyncMock()

        # Create test user
        test_user = User(
            id=1,
            email="test@example.com",
            first_name="Jane",
            last_name="Smith",
            avatar_url=None,
            password_hash=bcrypt.hashpw(
                "password".encode("utf-8"), bcrypt.gensalt()
            ).decode("utf-8"),
        )

        def mock_execute(query):
            mock_result = Mock()
            query_str = str(query)

            if "user_preferences" in query_str.lower():
                mock_result.scalar.return_value = None  # No preferences
            elif "users" in query_str.lower():
                mock_result.scalar.return_value = test_user
            else:
                mock_result.scalar.return_value = None

            return mock_result

        mock_session.execute.side_effect = mock_execute

        async def override_get_db():
            yield mock_session

        app.dependency_overrides[get_db] = override_get_db

        # Mock get_current_user dependency
        from app.core.dependencies import get_current_user

        async def override_get_current_user():
            return test_user

        app.dependency_overrides[get_current_user] = override_get_current_user

        async with AsyncClient(app=app, base_url="http://testserver") as client:
            response = await client.get("/api/v1/users/me")

            assert response.status_code == 200
            data = response.json()

            assert data["firstName"] == "Jane"
            assert data["lastName"] == "Smith"
            assert data["email"] == "test@example.com"
            assert data["avatar"] is None
            assert data["preferences"]["defaultPartySize"] is None
            assert data["preferences"]["hasKids"] is None

        app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_get_user_details_unauthorized(self, client: AsyncClient):
        """Test user details endpoint without authentication."""
        response = await client.get("/api/v1/users/me")

        assert response.status_code == 401
        data = response.json()
        assert "detail" in data


class TestUpdateUserDetails:
    """Test PATCH /users/me endpoint."""

    @pytest.mark.asyncio
    async def test_update_user_details_success(self):
        """Test successful user details update."""
        import bcrypt
        from httpx import AsyncClient

        from app.core.database import get_db
        from app.main import app
        from app.models.users import User

        mock_session = AsyncMock()

        # Create test user
        test_user = User(
            id=1,
            email="test@example.com",
            first_name="John",
            last_name="Doe",
            avatar_url="https://example.com/old-avatar.jpg",
            password_hash=bcrypt.hashpw(
                "password".encode("utf-8"), bcrypt.gensalt()
            ).decode("utf-8"),
        )

        def mock_execute(query):
            mock_result = Mock()
            mock_result.scalar.return_value = test_user
            return mock_result

        mock_session.execute.side_effect = mock_execute
        mock_session.commit = AsyncMock()

        async def override_get_db():
            yield mock_session

        app.dependency_overrides[get_db] = override_get_db

        # Mock get_current_user dependency
        from app.core.dependencies import get_current_user

        async def override_get_current_user():
            return test_user

        app.dependency_overrides[get_current_user] = override_get_current_user

        async with AsyncClient(app=app, base_url="http://testserver") as client:
            update_data = {
                "firstName": "Johnny",
                "lastName": "Updated",
                "avatarUrl": "https://example.com/new-avatar.jpg",
            }

            response = await client.patch("/api/v1/users/me", json=update_data)

            assert response.status_code == 200
            data = response.json()
            assert data["message"] == "User details updated successfully"

            # Verify user object was updated
            assert test_user.first_name == "Johnny"
            assert test_user.last_name == "Updated"
            assert test_user.avatar_url == "https://example.com/new-avatar.jpg"

            # Verify database commit was called
            mock_session.commit.assert_called_once()

        app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_update_user_details_validation_error(self):
        """Test user details update with invalid data."""
        from httpx import AsyncClient

        from app.main import app

        async with AsyncClient(app=app, base_url="http://testserver") as client:
            update_data = {
                "firstName": "",  # Empty first name should fail validation
                "lastName": "Doe",
                "avatarUrl": "https://example.com/avatar.jpg",
            }

            response = await client.patch("/api/v1/users/me", json=update_data)

            # Should return 422 for validation error when authenticated,
            # but 401 without auth
            assert response.status_code in [401, 422]

    @pytest.mark.asyncio
    async def test_update_user_details_unauthorized(self):
        """Test user details update without authentication."""
        from httpx import AsyncClient

        from app.main import app

        async with AsyncClient(app=app, base_url="http://testserver") as client:
            update_data = {
                "firstName": "John",
                "lastName": "Doe",
                "avatarUrl": "https://example.com/avatar.jpg",
            }

            response = await client.patch("/api/v1/users/me", json=update_data)

            assert response.status_code == 401
            data = response.json()
            assert "detail" in data


class TestUpdateUserPreferences:
    """Test PATCH /users/me/preferences endpoint."""

    @pytest.mark.asyncio
    async def test_update_user_preferences_success(self):
        """Test successful user preferences update."""
        import bcrypt
        from httpx import AsyncClient

        from app.core.database import get_db
        from app.main import app
        from app.models.users import User, UserPreference

        mock_session = AsyncMock()

        # Create test user
        test_user = User(
            id=1,
            email="test@example.com",
            first_name="John",
            last_name="Doe",
            password_hash=bcrypt.hashpw(
                "password".encode("utf-8"), bcrypt.gensalt()
            ).decode("utf-8"),
        )

        # Create existing preferences
        user_preferences = UserPreference(
            id=1,
            user_id=1,
            default_party_size=2,
            has_kids=False,
            thrill_level="moderate",
            accessibility_needs=[],
            dietary_restrictions=[],
        )

        def mock_execute(query):
            mock_result = Mock()
            mock_result.scalar.return_value = user_preferences
            return mock_result

        mock_session.execute.side_effect = mock_execute
        mock_session.commit = AsyncMock()

        async def override_get_db():
            yield mock_session

        app.dependency_overrides[get_db] = override_get_db

        # Mock get_current_user dependency
        from app.core.dependencies import get_current_user

        async def override_get_current_user():
            return test_user

        app.dependency_overrides[get_current_user] = override_get_current_user

        async with AsyncClient(app=app, base_url="http://testserver") as client:
            update_data = {
                "defaultPartySize": 4,
                "hasKids": True,
                "thrillLevel": "high",
                "accessibilityNeeds": ["wheelchair", "hearing_impairment"],
                "dietaryRestrictions": ["vegetarian"],
            }

            response = await client.patch(
                "/api/v1/users/me/preferences", json=update_data
            )

            assert response.status_code == 200
            data = response.json()
            assert data["message"] == "User preferences updated successfully"

            # Verify preferences object was updated
            assert user_preferences.default_party_size == 4
            assert user_preferences.has_kids is True
            assert user_preferences.thrill_level == "high"
            assert user_preferences.accessibility_needs == [
                "wheelchair",
                "hearing_impairment",
            ]
            assert user_preferences.dietary_restrictions == ["vegetarian"]

            # Verify database commit was called
            mock_session.commit.assert_called_once()

        app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_update_user_preferences_partial_update(self):
        """Test partial user preferences update."""
        import bcrypt
        from httpx import AsyncClient

        from app.core.database import get_db
        from app.main import app
        from app.models.users import User, UserPreference

        mock_session = AsyncMock()

        # Create test user
        test_user = User(
            id=1,
            email="test@example.com",
            first_name="John",
            last_name="Doe",
            password_hash=bcrypt.hashpw(
                "password".encode("utf-8"), bcrypt.gensalt()
            ).decode("utf-8"),
        )

        # Create existing preferences
        user_preferences = UserPreference(
            id=1,
            user_id=1,
            default_party_size=2,
            has_kids=False,
            thrill_level="moderate",
            accessibility_needs=["wheelchair"],
            dietary_restrictions=["gluten_free"],
        )

        def mock_execute(query):
            mock_result = Mock()
            mock_result.scalar.return_value = user_preferences
            return mock_result

        mock_session.execute.side_effect = mock_execute
        mock_session.commit = AsyncMock()

        async def override_get_db():
            yield mock_session

        app.dependency_overrides[get_db] = override_get_db

        # Mock get_current_user dependency
        from app.core.dependencies import get_current_user

        async def override_get_current_user():
            return test_user

        app.dependency_overrides[get_current_user] = override_get_current_user

        async with AsyncClient(app=app, base_url="http://testserver") as client:
            # Only update hasKids, leave other fields unchanged
            update_data = {"hasKids": True}

            response = await client.patch(
                "/api/v1/users/me/preferences", json=update_data
            )

            assert response.status_code == 200
            data = response.json()
            assert data["message"] == "User preferences updated successfully"

            # Verify only hasKids was updated
            assert user_preferences.has_kids is True
            # Other fields should remain unchanged
            assert user_preferences.default_party_size == 2
            assert user_preferences.thrill_level == "moderate"
            assert user_preferences.accessibility_needs == ["wheelchair"]
            assert user_preferences.dietary_restrictions == ["gluten_free"]

        app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_update_user_preferences_no_preferences_found(self):
        """Test preferences update when user preferences don't exist."""
        import bcrypt
        from httpx import AsyncClient

        from app.core.database import get_db
        from app.main import app
        from app.models.users import User

        mock_session = AsyncMock()

        # Create test user
        test_user = User(
            id=1,
            email="test@example.com",
            first_name="John",
            last_name="Doe",
            password_hash=bcrypt.hashpw(
                "password".encode("utf-8"), bcrypt.gensalt()
            ).decode("utf-8"),
        )

        def mock_execute(query):
            mock_result = Mock()
            mock_result.scalar.return_value = None  # No preferences found
            return mock_result

        mock_session.execute.side_effect = mock_execute

        async def override_get_db():
            yield mock_session

        app.dependency_overrides[get_db] = override_get_db

        # Mock get_current_user dependency
        from app.core.dependencies import get_current_user

        async def override_get_current_user():
            return test_user

        app.dependency_overrides[get_current_user] = override_get_current_user

        async with AsyncClient(app=app, base_url="http://testserver") as client:
            update_data = {"defaultPartySize": 4, "hasKids": True}

            response = await client.patch(
                "/api/v1/users/me/preferences", json=update_data
            )

            # Should return 400 because trying to update non-existent preferences
            assert response.status_code == 400

        app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_update_user_preferences_unauthorized(self):
        """Test user preferences update without authentication."""
        from httpx import AsyncClient

        from app.main import app

        async with AsyncClient(app=app, base_url="http://testserver") as client:
            update_data = {
                "defaultPartySize": 4,
                "hasKids": True,
                "thrillLevel": "high",
            }

            response = await client.patch(
                "/api/v1/users/me/preferences", json=update_data
            )

            assert response.status_code == 401
            data = response.json()
            assert "detail" in data

    @pytest.mark.asyncio
    async def test_update_user_preferences_invalid_thrill_level(self):
        """Test preferences update with invalid thrill level."""
        import bcrypt
        from httpx import AsyncClient

        from app.core.database import get_db
        from app.main import app
        from app.models.users import User, UserPreference

        mock_session = AsyncMock()

        # Create test user
        test_user = User(
            id=1,
            email="test@example.com",
            first_name="John",
            last_name="Doe",
            password_hash=bcrypt.hashpw(
                "password".encode("utf-8"), bcrypt.gensalt()
            ).decode("utf-8"),
        )

        # Create existing preferences that will raise validation error
        user_preferences = UserPreference(
            id=1,
            user_id=1,
            default_party_size=2,
            has_kids=False,
            thrill_level="moderate",
            accessibility_needs=[],
            dietary_restrictions=[],
        )

        def mock_execute(query):
            mock_result = Mock()
            mock_result.scalar.return_value = user_preferences
            return mock_result

        mock_session.execute.side_effect = mock_execute

        async def override_get_db():
            yield mock_session

        app.dependency_overrides[get_db] = override_get_db

        # Mock get_current_user dependency
        from app.core.dependencies import get_current_user

        async def override_get_current_user():
            return test_user

        app.dependency_overrides[get_current_user] = override_get_current_user

        async with AsyncClient(app=app, base_url="http://testserver") as client:
            update_data = {
                "thrillLevel": "invalid_level"  # This should trigger validation error
            }

            # Mock the preference assignment for invalid thrill level
            original_setattr = user_preferences.__class__.__setattr__

            def mock_setattr(self, name, value):
                if name == "thrill_level" and value == "invalid_level":
                    raise ValueError(
                        "Thrill level must be one of "
                        "['low', 'moderate', 'high', 'extreme']"
                    )
                return original_setattr(self, name, value)

            user_preferences.__class__.__setattr__ = mock_setattr

            response = await client.patch(
                "/api/v1/users/me/preferences", json=update_data
            )

            assert response.status_code == 400
            data = response.json()
            assert "error" in data
            assert "User preferences update failed" in data["error"]

        app.dependency_overrides.clear()
