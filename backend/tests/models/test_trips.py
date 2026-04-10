from datetime import datetime, timedelta

from app.models.trips import Itinerary, ItineraryItem, ItineraryPark, Trip


class TestTrip:
    """Test Trip model methods."""

    def test_trip_creation(self):
        """Test basic trip creation."""
        start_date = datetime.now().date()
        end_date = start_date + timedelta(days=3)

        trip = Trip(
            name="Disney World Trip",
            user_id=1,
            start_date=start_date,
            end_date=end_date,
            description="Family vacation",
        )

        assert trip.name == "Disney World Trip"
        assert trip.user_id == 1
        assert trip.start_date == start_date
        assert trip.end_date == end_date
        assert trip.description == "Family vacation"

    def test_trip_duration(self):
        """Test trip duration calculation."""
        start_date = datetime.now().date()
        end_date = start_date + timedelta(days=3)

        trip = Trip(
            name="Test Trip", user_id=1, start_date=start_date, end_date=end_date
        )

        assert trip.duration == 4  # 3 days + 1 (inclusive)

    def test_trip_is_active_current(self):
        """Test trip active status when currently active."""
        yesterday = datetime.now().date() - timedelta(days=1)
        tomorrow = datetime.now().date() + timedelta(days=1)

        trip = Trip(
            name="Active Trip", user_id=1, start_date=yesterday, end_date=tomorrow
        )

        assert trip.is_active is True

    def test_trip_is_active_future(self):
        """Test trip active status when in the future."""
        tomorrow = datetime.now().date() + timedelta(days=1)
        next_week = tomorrow + timedelta(days=7)

        trip = Trip(
            name="Future Trip", user_id=1, start_date=tomorrow, end_date=next_week
        )

        assert trip.is_active is False

    def test_trip_is_active_past(self):
        """Test trip active status when in the past."""
        last_week = datetime.now().date() - timedelta(days=7)
        yesterday = datetime.now().date() - timedelta(days=1)

        trip = Trip(
            name="Past Trip", user_id=1, start_date=last_week, end_date=yesterday
        )

        assert trip.is_active is False


class TestItinerary:
    """Test Itinerary model methods."""

    def test_itinerary_creation(self):
        """Test basic itinerary creation."""
        date = datetime.now().date()

        itinerary = Itinerary(trip_id=1, date=date, notes="Morning at Magic Kingdom")

        assert itinerary.trip_id == 1
        assert itinerary.date == date
        assert itinerary.notes == "Morning at Magic Kingdom"


class TestItineraryPark:
    """Test ItineraryPark model methods."""

    def test_itinerary_park_creation(self):
        """Test basic itinerary park creation."""
        itinerary_park = ItineraryPark(
            itinerary_id=1, park_id=1, arrival_time="09:00", departure_time="18:00"
        )

        assert itinerary_park.itinerary_id == 1
        assert itinerary_park.park_id == 1
        assert itinerary_park.arrival_time == "09:00"
        assert itinerary_park.departure_time == "18:00"


class TestItineraryItem:
    """Test ItineraryItem model methods."""

    def test_itinerary_item_creation(self):
        """Test basic itinerary item creation."""
        itinerary_item = ItineraryItem(
            itinerary_id=1,
            attraction_id=1,
            planned_time="10:30",
            priority=1,
            notes="FastPass reserved",
        )

        assert itinerary_item.itinerary_id == 1
        assert itinerary_item.attraction_id == 1
        assert itinerary_item.planned_time == "10:30"
        assert itinerary_item.priority == 1
        assert itinerary_item.notes == "FastPass reserved"
