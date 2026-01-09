import { useMemo, useState } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Select } from '../ui/select'
import StatusBadge from './StatusBadge'
import type { Appointment, AppointmentStatus } from '../../types/appointment'
import { appointmentStatuses } from '../../types/appointment'
import api from '../../services/api'

interface AppointmentBoardProps {
  appointments: Appointment[]
  loading: boolean
  error: string | null
  highlightedAppointmentId: number | null
  onRefresh: () => Promise<void> | void
  onStatusChange: (appointmentId: number, status: AppointmentStatus) => Promise<void>
  allowStatusUpdates?: boolean
}

const statusOptions = appointmentStatuses

const formatStatusLabel = (status: AppointmentStatus) =>
  status
    .toLowerCase()
    .split('_')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ')

const AppointmentBoard = ({
  appointments,
  loading,
  error,
  highlightedAppointmentId,
  onRefresh,
  onStatusChange,
  allowStatusUpdates = false,
}: AppointmentBoardProps) => {
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  const grouped = useMemo(() => {
    const byDate = new Map<string, Appointment[]>()
    appointments.forEach((entry) => {
      const key = new Date(entry.scheduledFor).toDateString()
      if (!byDate.has(key)) byDate.set(key, [])
      byDate.get(key)?.push(entry)
    })
    return Array.from(byDate.entries()).map(([key, list]) => ({
      dateLabel: key,
      items: list.sort(
        (a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime()
      ),
    }))
  }, [appointments])

  const handleStatusChange = async (id: number, status: AppointmentStatus) => {
    if (!allowStatusUpdates) return
    try {
      setUpdatingId(id)
      await onStatusChange(id, status)
    } catch (err) {
      console.error(`Failed to update status for appointment ${id}:`, err)
    } finally {
      setUpdatingId((current) => (current === id ? null : current))
    }
  }

  const deleteAppointment = async (id: number) => {
    if (!allowStatusUpdates) return
    try {
      setUpdatingId(id)
      await api.delete(`/appointments/${id}`) // DELETE request
      try {
        await onRefresh()
      } catch (refreshErr) {
        console.error('Failed to refresh after deletion:', refreshErr)
      }
    } catch (err) {
      console.error('Failed to delete appointment:', err)
    } finally {
      setUpdatingId((current) => (current === id ? null : current))
    }
  }

  const headerDescription = allowStatusUpdates
    ? 'Assign statuses, acknowledge arrivals, and keep the queue moving.'
    : 'Live view of active bookings across physical and virtual channels.'

  return (
    <Card className="shadow-panel">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Live Queue</CardTitle>
          <CardDescription>{headerDescription}</CardDescription>
        </div>
        <Button variant="secondary" size="sm" onClick={onRefresh} disabled={loading}>
          {loading ? 'Refreshing…' : 'Refresh'}
        </Button>
      </CardHeader>
      <CardContent className="gap-8">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-16 animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {error}
          </div>
        ) : appointments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
            No appointments yet. Create a booking to start the queue.
          </div>
        ) : (
          grouped.map((group) => (
            <div key={group.dateLabel} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  {group.dateLabel}
                </h3>
                <p className="text-xs text-slate-400">{group.items.length} appointments</p>
              </div>
              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      <th className="px-4 py-3">Queue</th>
                      <th className="px-4 py-3">Patient</th>
                      <th className="px-4 py-3">Mode</th>
                      <th className="px-4 py-3">Schedule</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">{allowStatusUpdates ? 'Manage' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white text-sm text-slate-600">
                    {group.items.map((appointment, index) => {
                      const scheduleDate = new Date(appointment.scheduledFor)
                      const timeLabel = scheduleDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      const highlight = appointment.id === highlightedAppointmentId
                      const isUpdating = updatingId === appointment.id
                      const canAccept =
                        allowStatusUpdates &&
                        !['CHECKED_IN', 'IN_SESSION', 'COMPLETED'].includes(appointment.status)
                      const canDelete = allowStatusUpdates

                      return (
                        <tr key={appointment.id} className={highlight ? 'bg-blue-50/70 text-slate-700' : undefined}>
                          <td className="px-4 py-4 font-semibold text-slate-900">
                            #{String(index + 1).padStart(2, '0')}
                          </td>
                          <td className="px-4 py-4">
                            <p className="font-semibold text-slate-900">{appointment.fullName}</p>
                            {appointment.contactNumber && (
                              <p className="mt-1 text-xs text-slate-500">{appointment.contactNumber}</p>
                            )}
                            {appointment.visitReason && (
                              <p className="mt-2 text-xs text-slate-500">{appointment.visitReason}</p>
                            )}
                          </td>
                          <td className="px-4 py-4 text-xs font-medium uppercase tracking-wide text-slate-500">
                            {appointment.visitType === 'ONLINE' ? 'Virtual' : 'In-person'}
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-500">
                            <p className="font-medium text-slate-900">{timeLabel}</p>
                            <p className="text-xs text-slate-400">{scheduleDate.toLocaleDateString()}</p>
                          </td>
                          <td className="px-4 py-4">
                            <StatusBadge status={appointment.status} />
                          </td>
                          <td className="px-4 py-4">
                            {allowStatusUpdates ? (
                              <div className="flex flex-col gap-3">
                                <Select
                                  aria-label="Update appointment status"
                                  value={appointment.status}
                                  onChange={async (event) => {
                                    const newStatus = event.target.value as AppointmentStatus
                                    if (newStatus !== appointment.status) {
                                      await handleStatusChange(appointment.id, newStatus)
                                    }
                                  }}
                                  disabled={isUpdating}
                                  className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-medium uppercase tracking-wide text-slate-500"
                                >
                                  {statusOptions.map((status) => (
                                    <option key={status} value={status}>
                                      {formatStatusLabel(status)}
                                    </option>
                                  ))}
                                </Select>
                                <div className="flex flex-wrap gap-2">
                                  <Button
                                    size="sm"
                                    variant="primary"
                                    disabled={!canAccept || isUpdating}
                                    onClick={() => handleStatusChange(appointment.id, 'CHECKED_IN')}
                                  >
                                    Accept
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    disabled={!canDelete || isUpdating}
                                    onClick={() => deleteAppointment(appointment.id)}
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-xs text-slate-400">Appointment updates managed by the clinic team.</p>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

export default AppointmentBoard
