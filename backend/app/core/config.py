from typing import Optional

from pydantic import computed_field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database components
    db_driver: str = "postgresql+asyncpg"
    db_user: str = "tppuser"
    db_password: str = "tppdev123"
    db_host: str = "localhost"
    db_port: int = 5432
    db_name: str = "themeparkplanner"

    # Alternative: allow override with full DATABASE_URL
    database_url: Optional[str] = None

    database_pool_size: int = 10
    database_max_overflow: int = 20

    @computed_field
    @property
    def database_connection_url(self) -> str:
        """Build database URL from components or use provided DATABASE_URL."""
        if self.database_url:
            return self.database_url
        return (
            f"{self.db_driver}://{self.db_user}:{self.db_password}"
            f"@{self.db_host}:{self.db_port}/{self.db_name}"
        )

    # Redis
    redis_url: str = "redis://localhost:6379"
    redis_max_connections: int = 10

    # API
    api_v1_str: str = "/api/v1"
    project_name: str = "Theme Park Planner API"

    # Security
    secret_key: str = "your-secret-key-change-in-production"
    access_token_expire_minutes: int = 30

    # Environment
    environment: str = "development"
    debug: bool = True

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
