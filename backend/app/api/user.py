from typing import Optional

from fastapi import APIRouter, Depends, Response, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models import User, UserPreference

router = APIRouter(prefix="/users", tags=["users"])


class UserDetailData(BaseModel):
    firstName: str
    lastName: str
    avatarUrl: str


class UserPreferenceData(BaseModel):
    defaultPartySize: Optional[int] = None
    hasKids: Optional[bool] = None
    thrillLevel: Optional[str] = None
    accessibilityNeeds: Optional[list[str]] = None
    dietaryRestrictions: Optional[list[str]] = None


@router.get("/me", status_code=status.HTTP_200_OK)
async def user_details(
    current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    """
    Get the details of the currently authenticated user.

    This endpoint retrieves the information of the user who is currently logged in.
    It requires authentication and will return the user's details if the token is valid.

    Returns:
        A JSON object containing the user's details, including their username and email.
    """
    user_data = {}

    existing_user = await db.execute(select(User).where(User.id == current_user.id))
    user = existing_user.scalar()

    existing_user_preferences = await db.execute(
        select(UserPreference).where(UserPreference.user_id == current_user.id)
    )
    user_preferences = existing_user_preferences.scalar()

    user_data["firstName"] = user.first_name
    user_data["lastName"] = user.last_name
    user_data["email"] = user.email
    user_data["avatar"] = user.avatar_url
    user_data["preferences"] = {
        "defaultPartySize": user_preferences.default_party_size,
        "hasKids": user_preferences.has_kids,
        "thrillLevel": user_preferences.thrill_level,
        "accessibilityNeeds": user_preferences.accessibility_needs,
        "dietaryRestrictions": user_preferences.dietary_restrictions,
    }

    return user_data


@router.patch("/me", status_code=status.HTTP_200_OK)
async def update_user_details(
    user_detail_data: UserDetailData,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Update the details of the currently authenticated user.

    This endpoint allows the user to update their personal information,
    such as their name, email, avatar, and preferences. It requires
    authentication and will update the user's details if the token is valid.

    Returns:
        A JSON object containing the updated user's details.
    """
    existing_user = await db.execute(select(User).where(User.id == current_user.id))
    user = existing_user.scalar()

    user.first_name = user_detail_data.firstName
    user.last_name = user_detail_data.lastName
    user.avatar_url = user_detail_data.avatarUrl
    await db.commit()

    return {"message": "User details updated successfully"}


@router.patch("/me/preferences", status_code=status.HTTP_200_OK)
async def update_user_preferences(
    user_preference_data: UserPreferenceData,
    response: Response,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Update the preferences of the currently authenticated user.

    This endpoint allows the user to update their preferences, such as their
    default party size, whether they have kids, their thrill level preference,
    accessibility needs, and dietary restrictions. It requires authentication
    and will update the user's preferences if the token is valid.

    Returns:
        A JSON object containing the updated user's preferences.
    """
    existing_user_preferences = await db.execute(
        select(UserPreference).where(UserPreference.user_id == current_user.id)
    )
    user_preferences = existing_user_preferences.scalar()

    try:
        if user_preference_data.defaultPartySize:
            user_preferences.default_party_size = user_preference_data.defaultPartySize
        if user_preference_data.hasKids is not None:
            user_preferences.has_kids = user_preference_data.hasKids
        if user_preference_data.thrillLevel:
            user_preferences.thrill_level = user_preference_data.thrillLevel
        if user_preference_data.accessibilityNeeds:
            user_preferences.accessibility_needs = (
                user_preference_data.accessibilityNeeds
            )
        if user_preference_data.dietaryRestrictions:
            user_preferences.dietary_restrictions = (
                user_preference_data.dietaryRestrictions
            )
    except Exception as e:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return {"error": "User preferences update failed", "details": str(e)}
    await db.commit()

    return {"message": "User preferences updated successfully"}
