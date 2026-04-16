import logging
from datetime import datetime, timezone

from httpx import AsyncClient
from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.models import Attraction, Park
from app.services.cache_service import cache_service

logger = logging.getLogger(__name__)


class ThemeParkClient:
    def __init__(self):
        self.base_url = "https://api.themeparks.wiki/v1"
        self.headers = {
            "Accept": "application/json",
            "Referer": "https://themeparkplanner.app",
            "User-Agent": "ThemeParkPlanner/1.0",
        }

    async def invalidate_park_cache(self, park_id: int = None):
        """Invalidate park-related cache entries after data sync"""
        logger.info(f"Invalidating cache for park_id: {park_id}")

        if park_id:
            # Invalidate specific park caches
            await cache_service.delete(cache_service.generate_park_key(park_id))
            await cache_service.delete(
                cache_service.generate_park_attractions_key(park_id)
            )

        # Always invalidate parks list when any park data changes
        await cache_service.delete(cache_service.generate_parks_list_key())

    async def get_parks_by_destination(self, client: AsyncClient):
        """Fetch the list of parks by destination from the API"""
        logger.info("Fetching list of parks by destination from API")
        response = await client.get("/destinations")
        response.raise_for_status()
        destination_list = response.json().get("destinations", [])

        parks_by_destination = {}
        for destination in destination_list:
            parks_by_destination[destination["name"]] = {
                "parks": destination.get("parks", [])
            }

        logger.info(
            f"Fetched {len(parks_by_destination)} destinations with parks from API"
        )
        return parks_by_destination

    async def sync_park_data(
        self, client: AsyncClient, db: AsyncSessionLocal, park_id, destination_name
    ):
        """Fetch the list of parks for the current destination"""
        logger.info(
            f"Fetching park data for park_id {park_id} and "
            f"destination {destination_name}"
        )
        response = await client.get(f"/entity/{park_id}")
        response.raise_for_status()
        park_data = response.json()

        try:
            print(
                f"Checking if park with external_id {park_data['id']} already exists "
                f"in database"
            )
            park = await db.execute(
                select(Park).where(Park.external_id == park_data["id"])
            )
            park = park.scalar_one_or_none()
        except Exception as e:
            logger.error(
                f"Error checking for existing park with external_id {park_data['id']} "
                f"in database: {e}"
            )
            park = None

        if not park:
            print(f"Creating new park with external_id {park_data['id']} in database")
            park = Park(
                external_id=park_data["id"],
                name=park_data["name"],
                slug=(
                    park_data["slug"]
                    if "slug" in park_data
                    else park_data["name"].lower().replace(" ", "")
                ),
                resort_name=destination_name,
                timezone=park_data["timezone"],
                location_lat=(
                    park_data["location"]["latitude"]
                    if "location" in park_data
                    else None
                ),
                location_lon=(
                    park_data["location"]["longitude"]
                    if "location" in park_data
                    else None
                ),
                # description=park_data["description"],
                synced_at=datetime.now(timezone.utc),
            )
        else:
            print(
                f"Updating existing park with external_id {park_data['id']} "
                f"in database"
            )
            park.name = park_data["name"]
            park.slug = (
                park_data["slug"]
                if "slug" in park_data
                else park_data["name"].lower().replace(" ", "")
            )
            park.resort_name = destination_name
            park.timezone = park_data["timezone"]
            park.location_lat = (
                park_data["location"]["latitude"] if "location" in park_data else None
            )
            park.location_lon = (
                park_data["location"]["longitude"] if "location" in park_data else None
            )
            # park.description = park_data["description"]
            park.synced_at = datetime.now(timezone.utc)

        try:
            print(f"Committing park with external_id {park_data['id']} to database")
            db.add(park)
            await db.commit()
            await db.refresh(park)

            # Invalidate park-related cache after successful commit
            await self.invalidate_park_cache(park.id)

            logger.info(
                f"Successfully committed park with external_id {park_data['id']} "
                f"to database with id {park.id}"
            )
            return park_data["id"], park.id
        except Exception as e:
            logger.error(
                f"Error committing park with external_id {park_data['id']} to "
                f"database: {str(e)}"
            )
            await db.rollback()
            raise e

    async def sync_attraction_data(
        self,
        client: AsyncClient,
        db: AsyncSessionLocal,
        external_park_id,
        internal_park_id,
    ):
        """Fetch the list of attractions for the current park"""
        logger.info(f"Fetching attraction data for park_id {external_park_id}")
        response = await client.get(f"/entity/{external_park_id}/children")
        response.raise_for_status()
        attractions_data = response.json().get("children", [])

        for attraction_data in attractions_data:
            logger.info(
                f"Processing attraction with external_id {attraction_data['id']} "
                f"for park_id {external_park_id}"
            )
            try:
                print(
                    f"Checking if attraction with external_id "
                    f"{attraction_data['id']} already exists in database"
                )
                attraction = await db.execute(
                    select(Attraction).where(
                        Attraction.external_id == attraction_data["id"]
                    )
                )
                attraction = attraction.scalar_one_or_none()
            except Exception as e:
                logger.error(
                    f"Error fetching attraction with external_id "
                    f"{attraction_data['id']} from database: {str(e)}"
                )
                attraction = None

            if not attraction:
                print(
                    f"Creating new attraction with external_id "
                    f"{attraction_data['id']} in database"
                )
                attraction = Attraction(
                    park_id=internal_park_id,
                    external_id=attraction_data["id"],
                    name=attraction_data["name"],
                    type=attraction_data["entityType"],
                    # area=attraction_data["area"],
                    # min_height_cm=attraction_data["minHeightCm"],
                    # avg_duration_min=attraction_data["avgDurationMin"],
                    # thrill_level=attraction_data["thrillLevel"],
                    # kid_friendly=attraction_data["kidFriendly"],
                    location_lat=attraction_data["location"]["latitude"],
                    location_lon=attraction_data["location"]["longitude"],
                    # attraction_metadata=attraction_data["metadata"],
                    synced_at=datetime.now(timezone.utc),
                )
            else:
                print(
                    f"Updating existing attraction with external_id "
                    f"{attraction_data['id']} in database"
                )
                attraction.park_id = internal_park_id
                attraction.name = attraction_data["name"]
                attraction.type = attraction_data["entityType"]
                # attraction.area = attraction_data["area"]
                # attraction.min_height_cm = attraction_data["minHeightCm"]
                # attraction.avg_duration_min = attraction_data["avgDurationMin"]
                # attraction.thrill_level = attraction_data["thrillLevel"]
                # attraction.kid_friendly = attraction_data["kidFriendly"]
                attraction.location_lat = attraction_data["location"]["latitude"]
                attraction.location_lon = attraction_data["location"]["longitude"]
                # attraction.attraction_metadata = attraction_data["metadata"]
                attraction.synced_at = datetime.now(timezone.utc)

            try:
                print(
                    f"Committing attraction with external_id {attraction_data['id']} "
                    f"to database"
                )
                db.add(attraction)
                await db.commit()

                # Invalidate attraction cache after successful commit
                await self.invalidate_park_cache(internal_park_id)

                logger.info(
                    f"Successfully committed attraction with external_id "
                    f"{attraction_data['id']} to database with id {attraction.id}"
                )
            except Exception as e:
                logger.error(
                    f"Error committing attraction with external_id "
                    f"{attraction_data['id']} to database: {str(e)}"
                )
                await db.rollback()
                raise e
        logger.info(f"Finished processing attractions for park_id {external_park_id}")

    async def sync_individual_theme_park_data(self, park_id):
        """
        Sync data for a specific theme park by its internal database ID.
        """
        logger.info(f"Starting sync process for park_id {park_id}")
        try:
            async with AsyncClient(
                base_url=self.base_url, headers=self.headers
            ) as client:
                async with AsyncSessionLocal() as session:
                    park = await session.execute(select(Park).where(Park.id == park_id))
                    park = park.scalar_one_or_none()
                    if not park:
                        logger.error(f"Park with id {park_id} not found in database")
                        return

                    external_park_id = park.external_id
                    destination_name = park.resort_name

                    await self.sync_park_data(
                        client, session, external_park_id, destination_name
                    )
                    await self.sync_attraction_data(
                        client, session, external_park_id, park_id
                    )
            logger.info(f"Finished sync process for park_id {park_id}")
        except Exception as e:
            logger.error(f"Error syncing data for park_id {park_id}: {str(e)}")
            raise e

    async def sync_all_theme_park_data(self):
        """
        Sync park data from the Theme Parks Wiki API to the local database.
        """
        logger.info("Starting theme park data sync process")
        try:
            async with AsyncClient(
                base_url=self.base_url, headers=self.headers
            ) as client:
                async with AsyncSessionLocal() as session:
                    parks_by_destination = await self.get_parks_by_destination(client)

                    for (
                        destination_name,
                        destination_data,
                    ) in parks_by_destination.items():
                        for park in destination_data["parks"]:
                            external_park_id, internal_park_id = (
                                await self.sync_park_data(
                                    client, session, park["id"], destination_name
                                )
                            )
                            await self.sync_attraction_data(
                                client, session, external_park_id, internal_park_id
                            )
        except Exception as e:
            logger.error(f"Error syncing theme park data: {str(e)}")
            pass
        logger.info("Finished theme park data sync process")


async def sync_park_data(park_id=None):
    client = ThemeParkClient()
    if park_id:
        await client.sync_individual_theme_park_data(park_id)
    else:
        await client.sync_all_theme_park_data()
