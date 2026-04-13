import secrets
from datetime import datetime, timedelta
from typing import Optional

import bcrypt
from fastapi import APIRouter, Depends, Request, Response, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.models import PasswordResetToken, Session, User, UserPreference
from app.services.email import send_email

SESSION_TIMEOUT_DAYS = 30  # 30 days
PASSWORD_RESET_TOKEN_EXPIRATION_HOURS = 1  # 1 hour

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
            expires_at=datetime.utcnow() + timedelta(days=SESSION_TIMEOUT_DAYS),
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
            expires_at=datetime.utcnow() + timedelta(days=SESSION_TIMEOUT_DAYS),
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
    request: Request, response: Response, db: AsyncSession = Depends(get_db)
):
    """
    User logout endpoint.

    Deletes the user's session based on the session token cookie. The session token is
    removed from the response cookies.

    Returns:
        204 No Content on successful logout
        401 Unauthorized if the session token is missing or invalid
    """
    session_token = request.cookies.get("session_token")
    if not session_token:
        response.status_code = status.HTTP_401_UNAUTHORIZED
        return {"error": "No session token provided"}

    session_result = await db.execute(
        select(Session).where(Session.token == session_token)
    )
    session = session_result.scalar()

    if session is None:
        response.status_code = status.HTTP_401_UNAUTHORIZED
        return {"error": "Invalid session token"}

    try:
        await db.delete(session)
        await db.commit()
        response.delete_cookie(key="session_token")
    except Exception:
        response.status_code = status.HTTP_422_UNPROCESSABLE_ENTITY
        return {"error": "User logout failed"}

    return {"message": "Logout successful"}


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
        expires_at = datetime.utcnow() + timedelta(
            hours=PASSWORD_RESET_TOKEN_EXPIRATION_HOURS
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
            subject="Reset your ThemeParkPlanner password",
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
