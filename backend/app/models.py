from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Enum, Integer, String, Text

from .database import Base
from .enums import AppointmentStatus, VisitType



def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(160), nullable=False)
    contact_number = Column(String(32), nullable=True)
    visit_type = Column(Enum(VisitType, name="visit_type"), nullable=False)
    scheduled_for = Column(DateTime(timezone=True), nullable=False, index=True)
    visit_reason = Column(Text, nullable=True)
    status = Column(Enum(AppointmentStatus, name="appointment_status"), nullable=False, default=AppointmentStatus.SCHEDULED)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)
