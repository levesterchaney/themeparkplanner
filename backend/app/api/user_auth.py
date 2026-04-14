import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional

import bcrypt
from fastapi import APIRouter, Depends, Request, Response, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models import PasswordResetToken, Session, User, UserPreference
from app.services.email import send_email

router = APIRouter()


class UserRegistrationData(BaseModel):
    email: str
    password: str
    firstName: Optional[str] = None
    lastName: Optional[str] = None


class UserLoginData(BaseModel):
    email: str
    password: str


class ForgotPasswordData(BaseModel):
    email: str


class ResetPasswordData(BaseModel):
    token: str
    new_password: str


@router.post("/auth/register", status_code=status.HTTP_201_CREATED)
async def register_user(
    registration_data: UserRegistrationData,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    """
    User registration endpoint.

    Creates a new user account with the provided email, password, and optional name.
    The password is hashed using bcrypt before being stored in the database.

    Successful registration will result in a UserPreference record being created for
    the new user with default values as well as a Session record.

    Returns:
        201 Created on success
        409 Bad Request if the email is already in use
        422 if there are validation errors
    """
    if len(registration_data.password) < 8:
        response.status_code = status.HTTP_422_UNPROCESSABLE_ENTITY
        return {"error": "Password must be at least 8 characters long"}

    existing_user = await db.execute(
        select(User).where(User.email == registration_data.email)
    )
    user = existing_user.scalar()

    if user is not None:
        response.status_code = status.HTTP_409_CONFLICT
        return {"error": "An account with this email already exists."}

    hashed_pass = bcrypt.hashpw(
        registration_data.password.encode("utf-8"), bcrypt.gensalt()
    )

    try:
        # Create the user and flush to get the ID before creating preferences
        new_user = User(
            email=registration_data.email,
            password_hash=hashed_pass.decode("utf-8"),
        )
        if registration_data.firstName:
            new_user.first_name = registration_data.firstName
        if registration_data.lastName:
            new_user.last_name = registration_data.lastName
        db.add(new_user)
        await db.flush()  # Ensure new_user.id is populated

        # Create default preferences for the new user
        user_prefs = UserPreference(user_id=new_user.id)
        db.add(user_prefs)
        await db.flush()  # Ensure user_prefs.id is populated

        # Create a session for the new user (optional, depending on your auth flow)
        user_session = Session(
            user_id=new_user.id,
            token=secrets.token_urlsafe(32),
            expires_at=datetime.now(timezone.utc)
            + timedelta(days=settings.session_timeout_days),
        )
        db.add(user_session)
        await db.flush()  # Ensure user_session.id is populated

        response.set_cookie(
            key="session_token",
            value=user_session.token,
            httponly=True,
            samesite="lax",
            secure=True,
        )
        await db.commit()
    except Exception:
        response.status_code = status.HTTP_422_UNPROCESSABLE_ENTITY
        return {"error": "User creation failed"}

    return {"message": "User created successfully", "user_id": new_user.id}


@router.post("/auth/login", status_code=status.HTTP_200_OK)
async def login_user(
    login_data: UserLoginData, response: Response, db: AsyncSession = Depends(get_db)
):
    """
    User login endpoint.

    Creates a new session for the user if the provided email and password are correct.
    The password is verified using passlib.

    Returns:
        200 OK on successful login
        401 Unauthorized if the email or password is incorrect
        422 if there are validation errors
    """
    existing_user = await db.execute(select(User).where(User.email == login_data.email))
    user = existing_user.scalar()

    if user is None or not bcrypt.checkpw(
        login_data.password.encode("utf-8"), user.password_hash.encode("utf-8")
    ):
        response.status_code = status.HTTP_401_UNAUTHORIZED
        return {"error": "Invalid email or password"}

    try:
        # Create a new session for the user
        user_session = Session(
            user_id=user.id,
            token=secrets.token_urlsafe(32),
            expires_at=datetime.now(timezone.utc)
            + timedelta(days=settings.session_timeout_days),
        )
        db.add(user_session)
        await db.flush()

        response.set_cookie(
            key="session_token",
            value=user_session.token,
            httponly=True,
            samesite="lax",
            secure=True,
        )
        await db.commit()
    except Exception:
        response.status_code = status.HTTP_422_UNPROCESSABLE_ENTITY
        return {"error": "User login failed"}

    return {"message": "Login successful", "user_id": user.id}


@router.post("/auth/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout_user(
    request: Request,
    response: Response,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    User logout endpoint.

    Deletes the user's current session based on the session token cookie.
    The session token is removed from the response cookies. This is a protected
    endpoint that requires valid authentication.

    Args:
        request: FastAPI request object containing cookies
        response: FastAPI response object for cookie manipulation
        current_user: Authenticated user from session (via dependency)
        db: Database session dependency

    Returns:
        204 No Content on successful logout
        401 Unauthorized if the session token is missing, invalid, or expired
    """
    session_token = request.cookies.get("session_token")

    # Find and delete the current session
    session_result = await db.execute(
        select(Session).where(Session.token == session_token)
    )
    session = session_result.scalars().first()

    if session:
        await db.delete(session)
        await db.commit()

    # Clear the session cookie regardless
    response.delete_cookie(key="session_token")

    # Return 204 No Content (no body for successful logout)
    return


@router.post("/auth/forgot-password", status_code=status.HTTP_200_OK)
async def forgot_password(
    forgot_data: ForgotPasswordData,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    """
    Forgot password endpoint.

    Generates a password reset token for the user with the provided email and
    sends an email with instructions to reset the password. The token is valid
    for a limited time.

    Returns:
        200 OK if the email was sent successfully (even if the email does not exist)
        422 if there are validation errors
    """
    default_msg = "If an account with that email exists, a reset link has been sent."
    existing_user = await db.execute(
        select(User).where(User.email == forgot_data.email)
    )
    user = existing_user.scalar()

    if user is None:
        # To prevent email enumeration, we return success even if the user doesn't exist
        return {"message": default_msg}

    try:
        # Generate a password reset token
        reset_token = secrets.token_urlsafe(32)
        expires_at = datetime.now(timezone.utc) + timedelta(
            hours=settings.password_reset_token_expiration_hours
        )

        # Store the reset token in the database
        password_reset = PasswordResetToken(
            user_id=user.id,
            token_hash=reset_token,
            expires_at=expires_at,
        )
        db.add(password_reset)
        await db.commit()

        reset_link = f"{settings.frontend_base_url}/reset-password?token={reset_token}"

        # Send the password reset email
        await send_email(
            to_email=user.email,
            subject="Reset your account password",
            body={
                "name": user.first_name,
                "email": user.email,
                "reset_url": reset_link,
                "unsubscribe_url": f"{settings.frontend_base_url}/unsubscribe",
                "privacy_url": f"{settings.frontend_base_url}/privacy",
            },
            template="password_reset.html",
        )
    except Exception:
        response.status_code = status.HTTP_422_UNPROCESSABLE_ENTITY
        return {"error": "Failed to process forgot password request"}

    return {"message": default_msg}


@router.post("/auth/reset-password", status_code=status.HTTP_200_OK)
async def reset_password(
    reset_data: ResetPasswordData,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    """
    Reset password endpoint.

    Resets the user's password if the provided reset token is valid and not expired.
    The new password is hashed and stored in the database.

    Returns:
        200 OK on successful password reset
        400 Bad Request if the token is invalid or expired
        422 if there are validation errors
    """
    token_result = await db.execute(
        select(PasswordResetToken).where(
            PasswordResetToken.token_hash == reset_data.token
        )
    )
    reset_token = token_result.scalar()

    if (
        reset_token is None
        or reset_token.expires_at < datetime.now(timezone.utc)
        or reset_token.used_at is not None
    ):
        response.status_code = status.HTTP_400_BAD_REQUEST
        return {"error": "Reset token is either invalid, expired, or was already used."}

    user_result = await db.execute(select(User).where(User.id == reset_token.user_id))
    user = user_result.scalar()

    if user is None:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return {"error": "User not found"}

    user_sessions = await db.execute(select(Session).where(Session.user_id == user.id))

    try:
        # Hash the new password and update the user's password hash
        new_password_hash = bcrypt.hashpw(
            reset_data.new_password.encode("utf-8"), bcrypt.gensalt()
        ).decode("utf-8")
        user.password_hash = new_password_hash

        # Clear all existing sessions for the user
        sessions = user_sessions.scalars().all()
        await db.delete(sessions)

        # Delete the used password reset token
        await db.delete(reset_token)
        await db.commit()
    except Exception:
        response.status_code = status.HTTP_422_UNPROCESSABLE_ENTITY
        return {"error": "Failed to reset password"}

    return {"message": "Password reset successful"}
