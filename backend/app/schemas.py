from datetime import datetime

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from .enums import AppointmentStatus, VisitType


def _status_label(status: AppointmentStatus) -> str:
    return " ".join(segment.capitalize() for segment in status.value.split("_"))


class AppointmentBase(BaseModel):
    full_name: str = Field(..., alias="fullName", max_length=160)
    contact_number: str | None = Field(default=None, alias="contactNumber", max_length=32)
    visit_type: VisitType = Field(..., alias="visitType")
    scheduled_for: datetime = Field(..., alias="scheduledFor")
    visit_reason: str | None = Field(default=None, alias="visitReason", max_length=500)

    model_config = ConfigDict(populate_by_name=True)


class AppointmentCreate(AppointmentBase):
    pass


class AppointmentRead(AppointmentBase):
    id: int
    status: AppointmentStatus
    created_at: datetime = Field(..., alias="createdAt")
    updated_at: datetime = Field(..., alias="updatedAt")

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class AppointmentStatusUpdate(BaseModel):
    status: AppointmentStatus


class AppointmentSummary(BaseModel):
    status: AppointmentStatus
    label: str
    count: int


class QueueSnapshot(BaseModel):
    totalAppointments: int
    scheduledToday: int
    waitingCount: int
    completedToday: int
    onlineCount: int
    inPersonCount: int
    statusBreakdown: list[AppointmentSummary]
    nextAppointment: AppointmentRead | None

    model_config = ConfigDict(from_attributes=True)


class AdminLoginRequest(BaseModel):
    password: str = Field(..., min_length=8, max_length=128)


class AdminLoginResponse(BaseModel):
    token: str
    expires_at: datetime = Field(..., alias="expiresAt")

    model_config = ConfigDict(populate_by_name=True)


def build_status_summaries() -> list[AppointmentSummary]:
    return [AppointmentSummary(status=status, label=_status_label(status), count=0) for status in AppointmentStatus]
