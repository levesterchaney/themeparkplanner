from typing import Optional

from fastapi import APIRouter, Depends, Response, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models import Attraction, Park, User
from app.services.cache_service import cache_service
from app.services.theme_park_service import sync_park_data as sync_park_data_service

router = APIRouter(prefix="/parks", tags=["parks"])


class ParkSyncData(BaseModel):
    park_id: Optional[int] = None


@router.get("", status_code=status.HTTP_200_OK)
async def get_parks(
    current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    """
    Get the full list of parks.
    """
    cache_key = cache_service.generate_parks_list_key()

    # Try cache first
    cached_parks = await cache_service.get(cache_key)
    if cached_parks:
        return cached_parks

    # Fetch from database
    parks = await db.execute(select(Park))
    parks_list = parks.scalars().all()

    # Convert to dict for serialization and caching
    parks_data = []
    for park in parks_list:
        park_dict = {
            "id": park.id,
            "external_id": park.external_id,
            "name": park.name,
            "slug": park.slug,
            "resort_name": park.resort_name,
            "timezone": park.timezone,
            "location_lat": park.location_lat,
            "location_lon": park.location_lon,
            "synced_at": park.synced_at.isoformat() if park.synced_at else None,
        }
        parks_data.append(park_dict)

    # Cache for 1 hour
    await cache_service.set(cache_key, parks_data, 3600)

    return parks_data


@router.get("/{park_id}", status_code=status.HTTP_200_OK)
async def get_park(
    park_id: int,
    response: Response,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get details of a specific park by its ID.

    - **park_id**: The ID of the park to retrieve
    """
    cache_key = cache_service.generate_park_key(park_id)

    # Try cache first
    cached_park = await cache_service.get(cache_key)
    if cached_park:
        return cached_park

    # Fetch from database
    park = await db.execute(select(Park).where(Park.id == park_id))
    park = park.scalar()

    if not park:
        response.status_code = status.HTTP_404_NOT_FOUND
        return {"message": "Park not found"}

    # Convert to dict for serialization and caching
    park_data = {
        "id": park.id,
        "external_id": park.external_id,
        "name": park.name,
        "slug": park.slug,
        "resort_name": park.resort_name,
        "timezone": park.timezone,
        "location_lat": park.location_lat,
        "location_lon": park.location_lon,
        "synced_at": park.synced_at.isoformat() if park.synced_at else None,
    }

    # Cache for 1 hour
    await cache_service.set(cache_key, park_data, 3600)

    return park_data


@router.get("/{park_id}/attractions", status_code=status.HTTP_200_OK)
async def get_park_attractions(
    park_id: int,
    response: Response,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get a list of attractions for a specific park.

    - **park_id**: The ID of the park to retrieve attractions for
    """
    cache_key = cache_service.generate_park_attractions_key(park_id)

    # Try cache first
    cached_attractions = await cache_service.get(cache_key)
    if cached_attractions:
        return cached_attractions

    # Fetch from database
    attractions = await db.execute(
        select(Attraction).where(Attraction.park_id == park_id)
    )
    attractions_list = attractions.scalars().all()

    # Convert to dict for serialization and caching
    attractions_data = []
    for attraction in attractions_list:
        attraction_dict = {
            "id": attraction.id,
            "park_id": attraction.park_id,
            "external_id": attraction.external_id,
            "name": attraction.name,
            "type": attraction.type,
            "location_lat": attraction.location_lat,
            "location_lon": attraction.location_lon,
            "synced_at": (
                attraction.synced_at.isoformat() if attraction.synced_at else None
            ),
        }
        attractions_data.append(attraction_dict)

    # Cache for 30 minutes
    await cache_service.set(cache_key, attractions_data, 1800)

    return attractions_data


@router.post("/sync", status_code=status.HTTP_200_OK)
async def sync_park_data(
    park_data: ParkSyncData,
    response: Response,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Trigger a manual synchronization of park data from the external API.
    """
    if current_user.role != "admin":
        response.status_code = status.HTTP_403_FORBIDDEN
        return {"message": "You do not have permission to perform this action."}

    if park_data.park_id:
        await sync_park_data_service(park_data.park_id)
    else:
        await sync_park_data_service()

    return {"message": "Park data synchronization completed successfully."}
