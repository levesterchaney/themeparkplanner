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
    first_name: str
    last_name: str
    avatar_url: str


class UserPreferenceData(BaseModel):
    default_party_size: Optional[int] = None
    has_kids: Optional[bool] = None
    thrill_level: Optional[str] = None
    accessibility_needs: Optional[list[str]] = None
    dietary_restrictions: Optional[list[str]] = None


@router.get("/me", status_code=status.HTTP_200_OK)
async def user_details(
    current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    existing_user = await db.execute(select(User).where(User.id == current_user.id))
    user = existing_user.scalar()

    existing_user_preferences = await db.execute(
        select(UserPreference).where(UserPreference.user_id == current_user.id)
    )
    user_preferences = existing_user_preferences.scalar()

    user_data = {
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "avatar": user.avatar_url,
    }

    if user_preferences:
        user_data["preferences"] = {
            "default_party_size": user_preferences.default_party_size,
            "has_kids": user_preferences.has_kids,
            "thrill_level": user_preferences.thrill_level,
            "accessibility_needs": user_preferences.accessibility_needs,
            "dietary_restrictions": user_preferences.dietary_restrictions,
        }
    else:
        user_data["preferences"] = {
            "default_party_size": None,
            "has_kids": None,
            "thrill_level": None,
            "accessibility_needs": None,
            "dietary_restrictions": None,
        }

    return user_data


@router.patch("/me", status_code=status.HTTP_200_OK)
async def update_user_details(
    user_detail_data: UserDetailData,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    existing_user = await db.execute(select(User).where(User.id == current_user.id))
    user = existing_user.scalar()

    user.first_name = user_detail_data.first_name
    user.last_name = user_detail_data.last_name
    user.avatar_url = user_detail_data.avatar_url
    await db.commit()

    return {"message": "User details updated successfully"}


@router.patch("/me/preferences", status_code=status.HTTP_200_OK)
async def update_user_preferences(
    user_preference_data: UserPreferenceData,
    response: Response,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    existing_user_preferences = await db.execute(
        select(UserPreference).where(UserPreference.user_id == current_user.id)
    )
    user_preferences = existing_user_preferences.scalar()

    try:
        if user_preference_data.default_party_size is not None:
            user_preferences.default_party_size = (
                user_preference_data.default_party_size
            )
        if user_preference_data.has_kids is not None:
            user_preferences.has_kids = user_preference_data.has_kids
        if user_preference_data.thrill_level is not None:
            user_preferences.thrill_level = user_preference_data.thrill_level
        if user_preference_data.accessibility_needs is not None:
            user_preferences.accessibility_needs = (
                user_preference_data.accessibility_needs
            )
        if user_preference_data.dietary_restrictions is not None:
            user_preferences.dietary_restrictions = (
                user_preference_data.dietary_restrictions
            )
    except Exception as e:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return {"error": "User preferences update failed", "details": str(e)}

    await db.commit()

    return {"message": "User preferences updated successfully"}
