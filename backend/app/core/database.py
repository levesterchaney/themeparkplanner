from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from .config import settings


class Base(DeclarativeBase):
    """
    SQLAlchemy declarative base class for all database models.

    This is the base class that all database models inherit from.
    It provides the basic SQLAlchemy ORM functionality and table creation.
    """

    pass


engine = create_async_engine(
    settings.database_connection_url,
    pool_size=settings.database_pool_size,
    max_overflow=settings.database_max_overflow,
    echo=settings.debug,
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_db() -> AsyncSession:
    """
    Database dependency for FastAPI dependency injection.

    Creates and manages database sessions for request handling.
    Ensures proper session cleanup and connection management.

    Yields:
        AsyncSession: Database session for the current request

    Note:
        This function is used as a FastAPI dependency to provide
        database sessions to API endpoints. The session is automatically
        closed after the request completes.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
