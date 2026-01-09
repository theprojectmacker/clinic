from datetime import datetime, timezone

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from .. import crud
from ..auth import require_admin
from ..database import get_session
from ..enums import AppointmentStatus
from ..schemas import AppointmentCreate, AppointmentRead, AppointmentStatusUpdate

router = APIRouter(prefix="/appointments", tags=["appointments"])


@router.get("", response_model=list[AppointmentRead])
def list_appointments(session: Session = Depends(get_session)) -> list[AppointmentRead]:
    return list(crud.list_appointments(session))

@router.delete("/{appointment_id}", status_code=status.HTTP_200_OK)
def delete_appointment(
    appointment_id: int,
    _admin_token: str = Depends(require_admin),  # optional: only admins can delete
    session: Session = Depends(get_session),
) -> dict[str, str]:
    appointment = session.get(crud.models.Appointment, appointment_id)
    if appointment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found.")
    
    session.delete(appointment)
    session.commit()
    return {"status": "deleted"}


@router.post("", response_model=AppointmentRead, status_code=status.HTTP_201_CREATED)
def create_appointment(
    payload: AppointmentCreate,
    session: Session = Depends(get_session),
) -> AppointmentRead:
    scheduled_for = payload.scheduled_for
    now = datetime.now(timezone.utc)
    if scheduled_for.tzinfo is None:
        scheduled_for = scheduled_for.replace(tzinfo=timezone.utc)
    normalized_schedule = scheduled_for.astimezone(timezone.utc)
    if normalized_schedule < now.replace(second=0, microsecond=0):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Selected schedule is in the past.")

    normalized_payload = payload.model_copy(update={"scheduled_for": normalized_schedule})

    created = crud.create_appointment(session, normalized_payload)
    return AppointmentRead.model_validate(created)


@router.patch("/{appointment_id}/status", response_model=AppointmentRead)
def update_status(
    appointment_id: int,
    payload: AppointmentStatusUpdate,
    _admin_token: str = Depends(require_admin),
    session: Session = Depends(get_session),
) -> AppointmentRead:
    updated = crud.update_appointment_status(session, appointment_id, payload.status)
    if updated is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found.")
    return AppointmentRead.model_validate(updated)


@router.get("/search", response_model=list[AppointmentRead])
def search_appointments(
    name: str = Query(..., min_length=3, description="Patient name used when booking"),
    session: Session = Depends(get_session),
) -> list[AppointmentRead]:
    results = crud.search_appointments_by_name(session, name)
    return [AppointmentRead.model_validate(item) for item in results]


@router.get("/statuses", response_model=list[str])
def list_status_labels() -> list[str]:
    return [status.value for status in AppointmentStatus]
