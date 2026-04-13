import asyncio
from unittest.mock import AsyncMock, Mock

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.main import app


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
async def mock_db():
    """Create mock database session for basic tests (no existing users)."""
    mock_session = AsyncMock(spec=AsyncSession)

    # Mock execute to return empty result for user lookups
    mock_result = Mock()
    mock_result.scalar.return_value = None  # No existing user found
    mock_session.execute.return_value = mock_result

    # Mock add, flush, and commit operations
    counter = 1

    def mock_add(obj):
        nonlocal counter
        if hasattr(obj, "id") and obj.id is None:
            obj.id = counter
            counter += 1

    mock_session.add.side_effect = mock_add
    mock_session.flush = AsyncMock()
    mock_session.commit = AsyncMock()

    yield mock_session


@pytest.fixture
async def mock_db_with_existing_user():
    """Create mock database session that returns an existing user."""
    from app.models.users import User

    mock_session = AsyncMock(spec=AsyncSession)

    # Create a mock existing user
    existing_user = User(
        id=1, email="duplicate@example.com", password_hash="hashed_password"
    )

    # Mock execute to return existing user
    mock_result = Mock()
    mock_result.scalar.return_value = existing_user
    mock_session.execute.return_value = mock_result

    # Mock other operations
    mock_session.add.return_value = None
    mock_session.flush = AsyncMock()
    mock_session.commit = AsyncMock()

    yield mock_session


@pytest.fixture
async def mock_db_with_login_user():
    """Create mock database session for login tests."""
    import bcrypt

    from app.models.users import Session, User

    mock_session = AsyncMock(spec=AsyncSession)

    # Create user with properly hashed password for "TestPassword123"
    password_hash = bcrypt.hashpw("TestPassword123".encode("utf-8"), bcrypt.gensalt())
    login_user = User(
        id=1, email="login@example.com", password_hash=password_hash.decode("utf-8")
    )

    # Create a session for logout tests
    user_session = Session(id=1, user_id=1, token="test_session_token", expires_at=None)

    # Mock execute to return appropriate objects based on query
    def mock_execute(query):
        mock_result = Mock()
        query_str = str(query)

        if "sessions.token" in query_str.lower():
            # This is a session lookup
            mock_result.scalar.return_value = user_session
        elif "users.email" in query_str.lower():
            # This is a user lookup
            mock_result.scalar.return_value = login_user
        else:
            mock_result.scalar.return_value = None

        return mock_result

    mock_session.execute.side_effect = mock_execute

    # Mock other operations
    counter = 2

    def mock_add(obj):
        nonlocal counter
        if hasattr(obj, "id") and obj.id is None:
            obj.id = counter
            counter += 1

    mock_session.add.side_effect = mock_add
    mock_session.flush = AsyncMock()
    mock_session.commit = AsyncMock()
    mock_session.delete = AsyncMock()

    yield mock_session


@pytest.fixture
async def client(mock_db):
    """Create test client with mocked database dependency."""

    async def override_get_db():
        yield mock_db

    app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(app=app, base_url="http://testserver") as test_client:
        yield test_client

    app.dependency_overrides.clear()


@pytest_asyncio.fixture()
async def async_client(mock_db):
    """Async fixture providing a client."""
    transport = ASGITransport(app=app)
    async with AsyncClient(
        transport=transport,
        base_url="http://testserver",
    ) as client:
        yield client
