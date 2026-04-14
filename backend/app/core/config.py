import os

from pydantic import computed_field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database
    db_driver: str = os.getenv("DB_DRIVER", "postgresql+asyncpg")
    db_user: str = os.getenv("DB_USER", "tppdev")
    db_password: str = os.getenv("DB_PASSWORD", "tppdev123")
    db_host: str = os.getenv("DB_HOST", "localhost")
    db_port: int = os.getenv("DB_PORT", 5432)
    db_name: str = os.getenv("DB_NAME", "themeparkplanner")

    database_pool_size: int = int(os.getenv("DATABASE_POOL_SIZE", "10"))
    database_max_overflow: int = int(os.getenv("DATABASE_MAX_OVERFLOW", "20"))

    @computed_field
    @property
    def database_connection_url(self) -> str:
        """Build database URL from components."""
        return (
            f"{self.db_driver}://{self.db_user}:{self.db_password}"
            f"@{self.db_host}:{self.db_port}/{self.db_name}"
        )

    # Redis
    redis_url: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    redis_max_connections: int = int(os.getenv("REDIS_MAX_CONNECTIONS", "10"))

    # API
    api_v1_str: str = "/api/v1"
    project_name: str = "Theme Park Planner API"

    # Session Management
    session_timeout_days: int = int(os.getenv("SESSION_TIMEOUT_DAYS", "30"))
    password_reset_token_expiration_hours: int = int(
        os.getenv("PASSWORD_RESET_TOKEN_EXPIRATION_HOURS", "1")
    )

    # Security
    secret_key: str = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    access_token_expire_minutes: int = int(
        os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30")
    )

    # Environment
    environment: str = os.getenv("ENVIRONMENT", "development")
    debug: bool = os.getenv("DEBUG", "True").lower() == "true"

    # Email
    mail_username: str = os.getenv("MAIL_USERNAME")
    mail_password: str = os.getenv("MAIL_PASSWORD")
    mail_from: str = os.getenv("MAIL_FROM", os.getenv("MAIL_USERNAME"))
    mail_port: int = os.getenv("MAIL_PORT", 587)
    mail_server: str = os.getenv("MAIL_SERVER", "smtp.gmail.com")
    mail_from_name: str = os.getenv("MAIL_FROM_NAME", "Theme Park Planner")
    mail_starttls: bool = os.getenv("MAIL_STARTTLS", "True").lower() == "true"
    mail_ssl_tls: bool = os.getenv("MAIL_SSL_TLS", "False").lower() == "true"
    use_credentials: bool = os.getenv("USE_CREDENTIALS", "True").lower() == "true"
    validate_certs: bool = os.getenv("VALIDATE_CERTS", "True").lower() == "true"

    # Frontend
    frontend_host: str = os.getenv("FRONTEND_HOST", "http://localhost")
    frontend_port: str = os.getenv("FRONTEND_PORT", "3000")

    @computed_field
    @property
    def frontend_base_url(self) -> str:
        """Build frontend base URL from components."""
        return f"{self.frontend_host}:{self.frontend_port}"

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
