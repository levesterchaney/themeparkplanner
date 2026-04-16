from sqlalchemy import (
    JSON,
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.sql import func

from app.core.database import Base


class Park(Base):
    __tablename__ = "parks"

    id = Column(Integer, primary_key=True, index=True)
    external_id = Column(String(255), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    slug = Column(String(80), nullable=False)
    resort_name = Column(String(255))
    timezone = Column(String(255), nullable=False)
    location_lat = Column(Numeric(9, 6))
    location_lon = Column(Numeric(9, 6))
    description = Column(Text)
    synced_at = Column(DateTime(timezone=True))
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )


class Attraction(Base):
    __tablename__ = "attractions"
    __table_args__ = (
        UniqueConstraint("park_id", "external_id", name="uix_park_attraction"),
    )

    id = Column(Integer, primary_key=True, index=True)
    park_id = Column(ForeignKey("parks.id"), index=True, nullable=False)
    external_id = Column(String(255), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    type = Column(String(255))
    area = Column(String(255))
    min_height_cm = Column(Integer)
    avg_duration_min = Column(Integer)
    thrill_level = Column(String(50))
    kid_friendly = Column(Boolean, default=True)
    location_lat = Column(Numeric(9, 6))
    location_lon = Column(Numeric(9, 6))
    attraction_metadata = Column(JSON)
    synced_at = Column(DateTime(timezone=True))
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
