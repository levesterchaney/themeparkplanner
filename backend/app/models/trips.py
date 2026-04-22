from sqlalchemy import (
    JSON,
    Boolean,
    Column,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    PrimaryKeyConstraint,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import validates
from sqlalchemy.sql import func

from app.core.database import Base


class Trip(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(ForeignKey("users.id"), index=True, nullable=False)
    title = Column(String(255), nullable=False)
    destination = Column(String(255))
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    party_size = Column(Integer, default=2, nullable=False)
    has_kids = Column(Boolean, default=False, nullable=False)
    notes = Column(Text)
    status = Column(String(10), default="draft", nullable=False)
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    @validates("status")
    def validate_status(self, key, value):
        if value is None:
            return value
        allowed_statuses = ["draft", "finalized"]
        if value not in allowed_statuses:
            raise ValueError(f"Status must be one of {allowed_statuses}")
        return value


class Itinerary(Base):
    __tablename__ = "itineraries"
    __table_args__ = (UniqueConstraint("trip_id", "day_date", name="uix_trip_day"),)

    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(ForeignKey("trips.id"), index=True, nullable=False)
    day_date = Column(Date, nullable=False)
    title = Column(String(255))
    must_dos = Column(ARRAY(String(255)))
    skip_list = Column(ARRAY(String(255)))
    status = Column(String(10), default="draft", nullable=False)
    prompt_version = Column(Text)
    token_usage = Column(JSON)
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    @validates("status")
    def validate_status(self, key, value):
        allowed_statuses = ["draft", "finalized"]
        if value not in allowed_statuses:
            raise ValueError(f"Status must be one of {allowed_statuses}")
        return value


class ItineraryPark(Base):
    __tablename__ = "itinerary_parks"
    __table_args__ = (
        PrimaryKeyConstraint("itinerary_id", "park_id", name="pk_itinerary_park"),
    )

    itinerary_id = Column(ForeignKey("itineraries.id"), index=True, nullable=False)
    park_id = Column(ForeignKey("parks.id"), index=True, nullable=False)
    visit_order = Column(Integer, default=0, nullable=False)


class ItineraryItem(Base):
    __tablename__ = "itinerary_items"
    __table_args__ = (
        UniqueConstraint("itinerary_id", "position", name="uix_itinerary_position"),
    )

    id = Column(Integer, primary_key=True, index=True)
    itinerary_id = Column(ForeignKey("itineraries.id"), index=True, nullable=False)
    attraction_id = Column(ForeignKey("attractions.id"), index=True, nullable=False)
    position = Column(Integer, nullable=False)
    arrival_time = Column(DateTime(timezone=True))
    duration_min = Column(Integer)
    notes = Column(Text)
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    itinerary_id = Column(ForeignKey("itineraries.id"), index=True, nullable=False)
    role = Column(String(10), nullable=False)  # 'user' or 'assistant'
    message = Column(Text, nullable=False)
    timestamp = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    @validates("role")
    def validate_role(self, key, value):
        if value is None:
            return value
        allowed_roles = ["user", "assistant"]
        if value not in allowed_roles:
            raise ValueError(f"Role must be one of {allowed_roles}")
        return value
