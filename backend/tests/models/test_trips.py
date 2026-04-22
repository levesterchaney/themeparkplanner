from datetime import date, datetime, timedelta

from app.models.trips import Itinerary, ItineraryItem, ItineraryPark, Trip


class TestTrip:
    """Test Trip model methods."""

    def test_trip_creation(self):
        """Test basic trip creation."""
        start_date = date.today()
        end_date = start_date + timedelta(days=3)

        trip = Trip(
            title="Disney World Trip",
            user_id=1,
            start_date=start_date,
            end_date=end_date,
            notes="Family vacation",
        )

        assert trip.title == "Disney World Trip"
        assert trip.user_id == 1
        assert trip.start_date == start_date
        assert trip.end_date == end_date
        assert trip.notes == "Family vacation"

    def test_trip_default_values(self):
        """Test trip default values."""
        start_date = date.today()
        end_date = start_date + timedelta(days=3)

        # Test that defaults are applied correctly
        trip = Trip(
            title="Test Trip",
            user_id=1,
            start_date=start_date,
            end_date=end_date,
        )

        # Before persisting, check the column defaults from the model definition
        assert Trip.party_size.default.arg == 2
        assert Trip.has_kids.default.arg is False
        assert Trip.status.default.arg == "draft"

        # When no value is explicitly set, the attribute should be None until persisted
        # But we can verify the model has the correct default definitions
        assert trip.party_size is None or trip.party_size == 2
        assert trip.has_kids is None or trip.has_kids is False
        assert trip.status is None or trip.status == "draft"


class TestItinerary:
    """Test Itinerary model methods."""

    def test_itinerary_creation(self):
        """Test basic itinerary creation."""
        day_date = date.today()

        itinerary = Itinerary(
            trip_id=1, day_date=day_date, title="Morning at Magic Kingdom"
        )

        assert itinerary.trip_id == 1
        assert itinerary.day_date == day_date
        assert itinerary.title == "Morning at Magic Kingdom"


class TestItineraryPark:
    """Test ItineraryPark model methods."""

    def test_itinerary_park_creation(self):
        """Test basic itinerary park creation."""
        itinerary_park = ItineraryPark(itinerary_id=1, park_id=1, visit_order=1)

        assert itinerary_park.itinerary_id == 1
        assert itinerary_park.park_id == 1
        assert itinerary_park.visit_order == 1


class TestItineraryItem:
    """Test ItineraryItem model methods."""

    def test_itinerary_item_creation(self):
        """Test basic itinerary item creation."""
        arrival_time = datetime.now()

        itinerary_item = ItineraryItem(
            itinerary_id=1,
            attraction_id=1,
            position=1,
            arrival_time=arrival_time,
            duration_min=60,
            notes="FastPass reserved",
        )

        assert itinerary_item.itinerary_id == 1
        assert itinerary_item.attraction_id == 1
        assert itinerary_item.position == 1
        assert itinerary_item.arrival_time == arrival_time
        assert itinerary_item.duration_min == 60
        assert itinerary_item.notes == "FastPass reserved"
