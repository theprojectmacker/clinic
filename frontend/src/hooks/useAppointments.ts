import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  createAppointment as createAppointmentRequest,
  fetchAppointments,
  updateAppointmentStatus as updateAppointmentStatusRequest,
} from '../services/appointments'
import type {
  Appointment,
  AppointmentCreateInput,
  AppointmentStatus,
  QueueSummaryData,
} from '../types/appointment'
import { appointmentStatuses } from '../types/appointment'

const statusLabel = (status: AppointmentStatus) =>
  status
    .toLowerCase()
    .split('_')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ')

const defaultSummary: QueueSummaryData = {
  totalAppointments: 0,
  scheduledToday: 0,
  waitingCount: 0,
  completedToday: 0,
  onlineCount: 0,
  inPersonCount: 0,
  statusBreakdown: appointmentStatuses.map((status) => ({ status, count: 0, label: statusLabel(status) })),
  nextAppointment: null,
}

const orderBySchedule = (list: Appointment[]) =>
  list.slice().sort((first, second) => new Date(first.scheduledFor).getTime() - new Date(second.scheduledFor).getTime())

const calculateSummary = (appointments: Appointment[]): QueueSummaryData => {
  if (appointments.length === 0) {
    return defaultSummary
  }

  const todayKey = new Date().toDateString()
  const statusCountMap = new Map<AppointmentStatus, number>()
  appointmentStatuses.forEach((item) => statusCountMap.set(item, 0))

  let onlineCount = 0
  let inPersonCount = 0
  let scheduledToday = 0
  let completedToday = 0
  let waitingCount = 0

  appointments.forEach((appointment) => {
    statusCountMap.set(appointment.status, (statusCountMap.get(appointment.status) ?? 0) + 1)
    const appointmentDateKey = new Date(appointment.scheduledFor).toDateString()

    if (appointment.visitType === 'ONLINE') {
      onlineCount += 1
    } else {
      inPersonCount += 1
    }

    if (appointmentDateKey === todayKey) {
      scheduledToday += 1
      if (appointment.status === 'COMPLETED') {
        completedToday += 1
      }
      if (appointment.status === 'SCHEDULED' || appointment.status === 'CHECKED_IN' || appointment.status === 'IN_SESSION') {
        waitingCount += 1
      }
    }
  })

  const nextAppointment = orderBySchedule(
    appointments.filter((appointment) => !['CANCELLED', 'COMPLETED'].includes(appointment.status)),
  )[0] ?? null

  return {
    totalAppointments: appointments.length,
    scheduledToday,
    waitingCount,
    completedToday,
    onlineCount,
    inPersonCount,
    statusBreakdown: appointmentStatuses.map((status) => ({
      status,
      count: statusCountMap.get(status) ?? 0,
      label: statusLabel(status),
    })),
    nextAppointment,
  }
}

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const data = await fetchAppointments()
      setAppointments(orderBySchedule(data))
      setError(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to fetch appointments.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
    const intervalId = window.setInterval(() => {
      void load()
    }, 60_000)
    return () => window.clearInterval(intervalId)
  }, [load])

  const createAppointment = useCallback(
    async (payload: AppointmentCreateInput) => {
      try {
        setSubmitting(true)
        const created = await createAppointmentRequest(payload)
        setAppointments((current) => orderBySchedule([created, ...current]))
        setError(null)
        return { success: true as const, appointment: created }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to create appointment.'
        setError(message)
        return { success: false as const, message }
      } finally {
        setSubmitting(false)
      }
    },
    [],
  )

  const updateAppointmentStatus = useCallback(
    async (appointmentId: number, status: AppointmentStatus) => {
      try {
        const updated = await updateAppointmentStatusRequest(appointmentId, status)
        setAppointments((current) =>
          orderBySchedule(current.map((item) => (item.id === updated.id ? updated : item))),
        )
        setError(null)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to update appointment status.'
        setError(message)
        throw err
      }
    },
    [],
  )

  const summary = useMemo(() => calculateSummary(appointments), [appointments])

  return {
    appointments,
    loading,
    submitting,
    error,
    createAppointment,
    updateAppointmentStatus,
    refresh: load,
    summary,
  }
}
