from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import validates
from sqlalchemy.sql import func

from app.core.database import Base


class User(Base):
    """
    User account model for the theme park planner application.

    Represents registered users with authentication credentials and profile
    information. Users can have preferences, sessions, and password reset
    tokens associated with them.

    Attributes:
        id: Primary key identifier
        email: Unique email address for login and communication
        first_name: User's first name
        last_name: User's last name (optional)
        avatar_url: URL to user's profile picture (optional)
        password_hash: Bcrypt hash of user's password
        created_at: Account creation timestamp
        updated_at: Last modification timestamp
    """

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False)
    first_name = Column(String(80), nullable=False)
    last_name = Column(String(80))
    avatar_url = Column(Text)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


class UserPreference(Base):
    """
    User preference model for customizing theme park experiences.

    Stores user-specific preferences that influence trip planning recommendations,
    attraction suggestions, and accessibility accommodations.

    Attributes:
        id: Primary key identifier
        user_id: Foreign key reference to the User
        default_party_size: Default number of people in user's group (minimum 1)
        has_kids: Whether the user typically travels with children
        thrill_level: User's preferred intensity level for attractions
        accessibility_needs: List of accessibility accommodations required
        dietary_restrictions: List of dietary restrictions for dining recommendations
    """

    __tablename__ = "user_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(ForeignKey("users.id"), nullable=False)
    default_party_size = Column(Integer, default=2, nullable=False)
    has_kids = Column(Boolean, default=False, nullable=False)
    thrill_level = Column(String(50), default="moderate", nullable=False)
    accessibility_needs = Column(ARRAY(String(80)), default=[], nullable=False)
    dietary_restrictions = Column(ARRAY(String(80)), default=[], nullable=False)

    @validates("thrill_level")
    def validate_thrill_level(self, key, value):
        """
        Validate thrill level preference.

        Args:
            key: The column name being validated
            value: The thrill level value to validate

        Returns:
            str: The validated thrill level value

        Raises:
            ValueError: If thrill level is not in allowed values
        """
        if value is None:
            return value
        allowed_levels = ["low", "moderate", "high", "extreme"]
        if value not in allowed_levels:
            raise ValueError(f"Thrill level must be one of {allowed_levels}")
        return value

    @validates("accessibility_needs")
    def validate_accessibility_needs(self, key, value):
        """
        Validate accessibility needs list.

        Args:
            key: The column name being validated
            value: List of accessibility needs to validate

        Returns:
            list: The validated accessibility needs list

        Raises:
            ValueError: If any accessibility need is not recognized
        """
        if value is None:
            return value
        allowed_needs = [
            "wheelchair",
            "hearing_impairment",
            "visual_impairment",
            "service_animal",
            "cognitive_disability",
            "mobility_aid",
        ]
        for need in value:
            if need not in allowed_needs:
                raise ValueError(f"Accessibility need '{need}' is not recognized.")
        return value

    @validates("dietary_restrictions")
    def validate_dietary_restrictions(self, key, value):
        """
        Validate dietary restrictions list.

        Args:
            key: The column name being validated
            value: List of dietary restrictions to validate

        Returns:
            list: The validated dietary restrictions list

        Raises:
            ValueError: If any dietary restriction is not recognized
        """
        if value is None:
            return value
        allowed_restrictions = [
            "vegetarian",
            "vegan",
            "gluten_free",
            "dairy_free",
            "nut_allergy",
            "halal",
            "kosher",
            "shellfish_allergy",
        ]
        for restriction in value:
            if restriction not in allowed_restrictions:
                raise ValueError(
                    f"Dietary restriction '{restriction}' is not recognized."
                )
        return value


class Session(Base):
    """
    User authentication session model.

    Represents an active user session with token-based authentication.
    Sessions have expiration times and track user activity for security.

    Attributes:
        id: Primary key identifier
        user_id: Foreign key reference to the User
        token: Unique session token for authentication
        expires_at: Session expiration timestamp
        last_active_at: Timestamp of last user activity
        created_at: Session creation timestamp
    """

    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(ForeignKey("users.id"), index=True, nullable=False)
    token = Column(String(255), unique=True, index=True, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    last_active_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    @property
    def is_expired(self) -> bool:
        """
        Check if the session has expired.

        Returns:
            bool: True if the session has expired, False otherwise.
                  Returns False if expires_at is None (never expires).
        """
        if self.expires_at is None:
            return False
        return self.expires_at < datetime.now(timezone.utc)


class PasswordResetToken(Base):
    """
    Password reset token model for secure password recovery.

    Represents time-limited tokens used for password reset functionality.
    Tokens are hashed for security and can only be used once.

    Attributes:
        id: Primary key identifier
        user_id: Foreign key reference to the User
        token_hash: Hashed version of the reset token
        expires_at: Token expiration timestamp (typically 1-2 hours)
        used_at: Timestamp when token was used (null if unused)
        created_at: Token creation timestamp
    """

    __tablename__ = "password_reset_tokens"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(ForeignKey("users.id"), index=True, nullable=False)
    token_hash = Column(String(255), unique=True, index=True, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    used_at = Column(DateTime(timezone=True))
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    @property
    def is_expired(self) -> bool:
        """
        Check if the password reset token has expired.

        Returns:
            bool: True if the password reset token has expired, False otherwise
        """
        return self.expires_at < datetime.now(timezone.utc)
