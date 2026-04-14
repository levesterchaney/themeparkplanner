from fastapi import Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models import Session, User


async def get_current_user(
    request: Request, db: AsyncSession = Depends(get_db)
) -> User:
    """
    Get the current authenticated user based on session token.

    This function checks for a session token in the request cookies, validates it
    against the database, and retrieves the associated user if the session is valid
    and not expired.

    Args:
        request: FastAPI request object containing cookies
        db: Database session dependency

    Returns:
        User: The authenticated user object

    Raises:
        HTTPException: 401 if session token is missing, invalid, or expired
        HTTPException: 401 if user associated with session is not found
    """
    token = request.cookies.get("session_token")
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="No session token provided"
        )

    # Query the session from the database
    result = await db.execute(select(Session).where(Session.token == token))
    session = result.scalars().first()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid session token"
        )

    # Check if session is expired
    if session.is_expired:
        # Clean up expired session
        await db.delete(session)
        await db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Session expired"
        )

    # Query the user associated with the session
    user_result = await db.execute(select(User).where(User.id == session.user_id))
    user = user_result.scalars().first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found"
        )

    return user
