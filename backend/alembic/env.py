import asyncio
import os
import sys
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.ext.asyncio import create_async_engine

from alembic import context

# Import the Base class from your application
from app.core.database import Base

# Import all models to ensure they are registered with Base.metadata
from app.models import (  # noqa
    Attraction,
    ChatMessage,
    Itinerary,
    ItineraryItem,
    ItineraryPark,
    Park,
    PasswordResetToken,
    Session,
    Trip,
    User,
    UserPreference,
)

# Add the parent directory to Python path to import from app
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# add your model's MetaData object here
# for 'autogenerate' support
target_metadata = Base.metadata


def get_database_url():
    """Get database URL from environment or alembic.ini."""
    # Priority: DATABASE_URL env var > alembic.ini
    database_url = None

    # Check environment variable first
    if os.getenv("DATABASE_URL"):
        database_url = os.getenv("DATABASE_URL")
    else:
        # Fallback to alembic.ini
        database_url = config.get_main_option("sqlalchemy.url")

    # Ensure we use asyncpg for async migrations
    if database_url and "postgresql+psycopg2" in database_url:
        database_url = database_url.replace("postgresql+psycopg2", "postgresql+asyncpg")
    elif database_url and "postgresql://" in database_url:
        database_url = database_url.replace("postgresql://", "postgresql+asyncpg://")

    return database_url


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    url = get_database_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode with async support.

    In this scenario we need to create an async Engine
    and associate a connection with the context.

    """
    url = get_database_url()

    # configuration = {
    #     "sqlalchemy.url": url,
    # }

    connectable = create_async_engine(
        url,
        poolclass=pool.NullPool,
    )

    async def do_run_migrations() -> None:
        async with connectable.begin() as connection:
            await connection.run_sync(do_run_migrations_sync, connectable)

    def do_run_migrations_sync(connection, engine) -> None:
        context.configure(connection=connection, target_metadata=target_metadata)

        with context.begin_transaction():
            context.run_migrations()

    asyncio.run(do_run_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
