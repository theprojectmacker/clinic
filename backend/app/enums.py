from enum import Enum


class VisitType(str, Enum):
    IN_PERSON = "IN_PERSON"
    ONLINE = "ONLINE"


class AppointmentStatus(str, Enum):
    SCHEDULED = "SCHEDULED"
    CHECKED_IN = "CHECKED_IN"
    IN_SESSION = "IN_SESSION"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


__all__ = ["VisitType", "AppointmentStatus"]
