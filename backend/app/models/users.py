from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import validates
from sqlalchemy.sql import func

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False)
    first_name = Column(String(80))
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
        if value is None:
            return value
        allowed_levels = ["low", "moderate", "high", "extreme"]
        if value not in allowed_levels:
            raise ValueError(f"Thrill level must be one of {allowed_levels}")
        return value

    @validates("accessibility_needs")
    def validate_accessibility_needs(self, key, value):
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


class PasswordResetToken(Base):
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
        """Check if the password reset token has expired."""
        return self.expires_at < datetime.utcnow()
