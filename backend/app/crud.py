from collections.abc import Iterable
from collections.abc import Iterable
from datetime import datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from .enums import AppointmentStatus
from .models import Appointment
from .schemas import AppointmentCreate


def list_appointments(session: Session) -> Iterable[Appointment]:
    statement = select(Appointment).order_by(Appointment.scheduled_for.asc(), Appointment.id.asc())
    return session.scalars(statement).all()



def search_appointments_by_name(session: Session, name: str) -> Iterable[Appointment]:
    like_pattern = f"%{name.strip().lower()}%"
    statement = (
        select(Appointment)
        .where(func.lower(Appointment.full_name).like(like_pattern))
        .order_by(Appointment.scheduled_for.asc(), Appointment.id.asc())
    )
    return session.scalars(statement).all()


def create_appointment(session: Session, data: AppointmentCreate) -> Appointment:
    appointment = Appointment(
        full_name=data.full_name,
        contact_number=data.contact_number,
        visit_type=data.visit_type,
        scheduled_for=data.scheduled_for,
        visit_reason=data.visit_reason,
        status=AppointmentStatus.SCHEDULED,
    )
    session.add(appointment)
    session.commit()
    session.refresh(appointment)
    return appointment


def update_appointment_status(session: Session, appointment_id: int, status: AppointmentStatus) -> Appointment | None:
    appointment = session.get(Appointment, appointment_id)
    if appointment is None:
        return None
    appointment.status = status
    appointment.updated_at = datetime.now(timezone.utc)
    session.add(appointment)
    session.commit()
    session.refresh(appointment)
    return appointment
