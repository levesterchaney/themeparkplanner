from datetime import datetime, timedelta

import pytest

from app.models.users import PasswordResetToken, Session, User, UserPreference


class TestUser:
    """Test User model."""

    def test_user_creation(self):
        """Test basic user creation."""
        user = User(
            email="test@example.com",
            password_hash="hashed_password",
            first_name="Test",
            last_name="User",
        )

        assert user.email == "test@example.com"
        assert user.password_hash == "hashed_password"
        assert user.first_name == "Test"
        assert user.last_name == "User"


class TestSession:
    """Test Session model methods."""

    def test_session_creation(self):
        """Test basic session creation."""
        session = Session(
            user_id=1,
            token="test_token_123",
            expires_at=datetime.now() + timedelta(hours=1),
        )

        assert session.user_id == 1
        assert session.token == "test_token_123"
        assert session.expires_at > datetime.now()

    def test_session_expiration_time_past(self):
        """Test session with past expiration time."""
        session = Session(
            user_id=1,
            token="test_token_123",
            expires_at=datetime.now() - timedelta(hours=1),  # Expired
        )

        # Test that we can create session and check expiration manually
        assert session.expires_at < datetime.now()

    def test_session_expiration_time_future(self):
        """Test session with future expiration time."""
        future_time = datetime.now() + timedelta(hours=1)
        session = Session(
            user_id=1,
            token="test_token_123",
            expires_at=future_time,  # Not expired
        )

        assert session.expires_at == future_time
        assert session.expires_at > datetime.now()


class TestUserPreference:
    """Test UserPreference model validation."""

    def test_user_preference_creation(self):
        """Test basic user preference creation."""
        preference = UserPreference(
            user_id=1,
            default_party_size=4,
            has_kids=True,
            thrill_level="high",
            accessibility_needs=["wheelchair"],
            dietary_restrictions=["vegetarian"],
        )

        assert preference.user_id == 1
        assert preference.default_party_size == 4
        assert preference.has_kids is True
        assert preference.thrill_level == "high"

    def test_thrill_level_validation_valid(self):
        """Test valid thrill level validation."""
        preference = UserPreference(user_id=1)

        # Test all valid levels
        for level in ["low", "moderate", "high", "extreme"]:
            result = preference.validate_thrill_level("thrill_level", level)
            assert result == level

    def test_thrill_level_validation_invalid(self):
        """Test invalid thrill level validation."""
        preference = UserPreference(user_id=1)

        with pytest.raises(ValueError, match="Thrill level must be one of"):
            preference.validate_thrill_level("thrill_level", "invalid")

    def test_thrill_level_validation_none(self):
        """Test None thrill level validation."""
        preference = UserPreference(user_id=1)
        result = preference.validate_thrill_level("thrill_level", None)
        assert result is None

    def test_accessibility_needs_validation_valid(self):
        """Test valid accessibility needs validation."""
        preference = UserPreference(user_id=1)

        valid_needs = ["wheelchair", "hearing_impairment"]
        result = preference.validate_accessibility_needs(
            "accessibility_needs", valid_needs
        )
        assert result == valid_needs

    def test_accessibility_needs_validation_invalid(self):
        """Test invalid accessibility needs validation."""
        preference = UserPreference(user_id=1)

        with pytest.raises(ValueError, match="is not recognized"):
            preference.validate_accessibility_needs(
                "accessibility_needs", ["invalid_need"]
            )

    def test_accessibility_needs_validation_none(self):
        """Test None accessibility needs validation."""
        preference = UserPreference(user_id=1)
        result = preference.validate_accessibility_needs("accessibility_needs", None)
        assert result is None


class TestPasswordResetToken:
    """Test PasswordResetToken model methods."""

    def test_password_reset_token_creation(self):
        """Test basic password reset token creation."""
        token = PasswordResetToken(
            user_id=1,
            token="reset_token_123",
            expires_at=datetime.now() + timedelta(hours=1),
        )

        assert token.user_id == 1
        assert token.token == "reset_token_123"
        assert token.expires_at > datetime.now()

    def test_password_reset_token_is_expired_true(self):
        """Test password reset token expiration check when expired."""
        token = PasswordResetToken(
            user_id=1,
            token="reset_token_123",
            expires_at=datetime.now() - timedelta(hours=1),  # Expired
        )

        assert token.is_expired is True

    def test_password_reset_token_is_expired_false(self):
        """Test password reset token expiration check when not expired."""
        token = PasswordResetToken(
            user_id=1,
            token="reset_token_123",
            expires_at=datetime.now() + timedelta(hours=1),  # Not expired
        )

        assert token.is_expired is False
