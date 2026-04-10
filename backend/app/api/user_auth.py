import bcrypt
import secrets

from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, Response, status
from pydantic import BaseModel
from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db

from app.models import User, UserPreference, Session

SESSION_TIMEOUT_DAYS = 30    # 30 days

router = APIRouter()


class UserRegistrationData(BaseModel):
    email: str
    password: str
    firstName: Optional[str] = None
    lastName: Optional[str] = None


@router.post("/auth/register", status_code=status.HTTP_201_CREATED)
async def register_user(registration_data: UserRegistrationData, response: Response, db: AsyncSession = Depends(get_db)):
    """
    User registration endpoint.

    Creates a new user account with the provided email, password, and optional name. The password is hashed using
    bcrypt before being stored in the database.

    Successful registration will result in a UserPreference record being created for the new user with default
    values as well as a Session record.

    Returns:
        201 Created on success
        409 Bad Request if the email is already in use
        422 if there are validation errors
    """
    if len(registration_data.password) < 8:
        response.status_code = status.HTTP_422_UNPROCESSABLE_ENTITY
        return {"error": "Password must be at least 8 characters long"}

    existing_user = await db.execute(select(User).where(User.email == registration_data.email))
    if existing_user.scalar() is not None:
        response.status_code = status.HTTP_409_CONFLICT
        return {"error": "An account with this email already exists."}

    hashed_pass = bcrypt.hashpw(registration_data.password.encode('utf-8'), bcrypt.gensalt())

    try:
        # Create the user and flush to get the ID before creating preferences
        new_user = User(
            email=registration_data.email,
            password_hash=hashed_pass.decode('utf-8'),
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

        response.set_cookie(key="session_token", value=user_session.token, httponly=True, samesite="lax", secure=True)
        await db.commit()
    except Exception as e:
        response.status_code = status.HTTP_422_UNPROCESSABLE_ENTITY
        return {"error": "User creation failed"}

    return {"message": "User created successfully", "user_id": new_user.id}
