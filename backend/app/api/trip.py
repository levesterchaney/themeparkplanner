from datetime import date
from typing import List, Optional

from fastapi import APIRouter, Depends, Response, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.database import get_db
from ..core.dependencies import get_current_user
from ..models import Trip, User, UserPreference

router = APIRouter(prefix="/trips", tags=["trips"])


class TripCreationData(BaseModel):
    title: str
    destination: str
    start_date: date
    end_date: date
    party_size: Optional[int] = None
    has_kids: Optional[bool] = None


class TripDetailData(BaseModel):
    title: str
    destination: str
    start_date: date
    end_date: date
    party_size: int
    has_kids: bool
    notes: str
    status: str


class TripResponse(BaseModel):
    id: int
    user_id: int
    title: str
    destination: str
    start_date: date
    end_date: date
    party_size: int
    has_kids: bool
    notes: Optional[str] = None
    status: str

    class Config:
        from_attributes = True


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_trip(
    trip_data: TripCreationData,
    response: Response,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Creates a new trip for the current user.

    Returns
        201 on successful creation
        400 if the end date does not follow the start date
        422 if any of the required fields are missing
    """
    if trip_data.end_date < trip_data.start_date:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return {"message": "Invalid date range provided."}

    preferences = await db.execute(
        select(UserPreference).where(UserPreference.user_id == current_user.id)
    )
    preferences = preferences.scalar()

    new_trip = Trip(
        user_id=current_user.id,
        title=trip_data.title,
        destination=trip_data.destination,
        start_date=trip_data.start_date,
        end_date=trip_data.end_date,
        party_size=(
            trip_data.party_size
            if trip_data.party_size
            else preferences.default_party_size
        ),
        has_kids=trip_data.has_kids if trip_data.has_kids else preferences.has_kids,
        status="draft",
    )
    db.add(new_trip)
    await db.commit()

    return {"message": "Trip created successfully", "trip_id": new_trip.id}


@router.get("", status_code=status.HTTP_200_OK, response_model=List[TripResponse])
async def get_all_trips(
    response: Response,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """"""
    trips = await db.execute(select(Trip).where(Trip.user_id == current_user.id))
    trip_list = trips.scalars().all()

    return [TripResponse.from_orm(trip) for trip in trip_list]


@router.get("/{trip_id}", status_code=status.HTTP_200_OK)
async def get_individual_trips(
    trip_id: int,
    response: Response,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """"""
    trip = await db.execute(
        select(Trip).where(Trip.user_id == current_user.id, Trip.id == trip_id)
    )
    trip = trip.scalar()

    if trip is None:
        response.status_code = status.HTTP_404_NOT_FOUND
        return {"message": "Trip not found"}

    return TripResponse.from_orm(trip)


@router.patch("/{trip_id}", status_code=status.HTTP_200_OK)
async def update_trip(
    trip_id: int,
    trip_detail_data: TripDetailData,
    response: Response,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """"""
    trip = await db.execute(
        select(Trip).where(Trip.user_id == current_user.id, Trip.id == trip_id)
    )
    trip = trip.scalar()

    if trip is None:
        response.status_code == status.HTTP_404_NOT_FOUND
        return {"message": "Trip not found"}

    trip.title = trip_detail_data.title
    trip.destination = trip_detail_data.destination
    trip.start_date = trip_detail_data.start_date
    trip.end_date = trip_detail_data.end_date
    trip.party_size = trip_detail_data.party_size
    trip.has_kids = trip_detail_data.has_kids
    trip.notes = trip_detail_data.notes
    trip.status = trip_detail_data.status

    db.add(trip)
    await db.commit()
    return {"message": "Trip successfully updated"}


@router.delete("/{trip_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_trip(
    trip_id: int,
    response: Response,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """"""
    trip = await db.execute(
        select(Trip).where(Trip.user_id == current_user.id, Trip.id == trip_id)
    )
    trip = trip.scalar()

    if trip is None:
        response.status_code = status.HTTP_404_NOT_FOUND
        return {"message": "Trip not found"}

    trip.deleted = True
    db.add(trip)
    await db.commit()
