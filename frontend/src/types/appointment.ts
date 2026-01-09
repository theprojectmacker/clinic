export const appointmentStatuses = [
  'SCHEDULED',
  'CHECKED_IN',
  'IN_SESSION',
  'COMPLETED',
  'CANCELLED',
] as const

export type AppointmentStatus = (typeof appointmentStatuses)[number]

export const visitTypes = ['IN_PERSON', 'ONLINE'] as const

export type VisitType = (typeof visitTypes)[number]

export interface Appointment {
  id: number
  fullName: string
  contactNumber?: string | null
  visitType: VisitType
  scheduledFor: string
  visitReason?: string | null
  status: AppointmentStatus
  createdAt: string
  updatedAt: string
}

export interface AppointmentCreateInput {
  fullName: string
  contactNumber?: string
  visitType: VisitType
  scheduledFor: string
  visitReason?: string
}

export interface QueueSummaryData {
  totalAppointments: number
  scheduledToday: number
  waitingCount: number
  completedToday: number
  onlineCount: number
  inPersonCount: number
  statusBreakdown: Array<{ status: AppointmentStatus; count: number; label: string }>
  nextAppointment: Appointment | null
}
