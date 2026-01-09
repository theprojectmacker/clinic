import { useMemo, useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import StatusBadge from './StatusBadge'
import { searchAppointmentsByName } from '../../services/appointments'
import type { Appointment } from '../../types/appointment'

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
})
const timeFormatter = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
})

const emptyStateTips = [
  'Double-check spelling and include middle initials if used when booking.',
  'Only appointments booked through this portal are displayed here.',
  'For urgent concerns, contact our triage line at (02) 8567 0000.',
]

function formatSchedule(scheduledFor: string) {
  const scheduleDate = new Date(scheduledFor)
  return `${dateFormatter.format(scheduleDate)} • ${timeFormatter.format(scheduleDate)}`
}

const AppointmentLookup = () => {
  const [fullName, setFullName] = useState('')
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = fullName.trim()
    if (trimmed.length < 3) {
      setError('Enter at least three characters to search for a booking.')
      return
    }

    setLoading(true)
    setError(null)
    setHasSearched(true)

    try {
      const results = await searchAppointmentsByName(trimmed)
      setAppointments(results)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'We could not find appointments right now.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const resultHeading = useMemo(() => {
    if (!hasSearched) {
      return 'Search results'
    }
    const total = appointments.length
    if (total === 0) {
      return 'No scheduled appointments found'
    }
    return `${total} appointment${total === 1 ? '' : 's'} found`
  }, [appointments.length, hasSearched])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-slate-900">Find your appointment</h2>
        <p className="text-sm text-slate-500">
          Provide the full name used during booking to view upcoming and past visits. Status updates refresh instantly as
          the care team progresses through the queue.
        </p>
      </div>
      <form className="flex flex-col gap-4 md:flex-row md:items-end" onSubmit={onSubmit}>
        <div className="flex-1 space-y-2">
          <Label htmlFor="lookup-full-name">Full name</Label>
          <Input
            id="lookup-full-name"
            placeholder="e.g. Jamie L. Santos"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            disabled={loading}
          />
        </div>
        <Button type="submit" className="md:w-auto" disabled={loading}>
          {loading ? 'Searching…' : 'Find appointments'}
        </Button>
      </form>
      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
      ) : null}
      <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{resultHeading}</h3>
          {hasSearched ? (
            <p className="text-xs text-slate-400">Showing matches for “{fullName.trim()}”</p>
          ) : null}
        </div>
        {appointments.length === 0 ? (
          <ul className="mt-4 list-disc space-y-2 pl-5 text-xs text-slate-500">
            {emptyStateTips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        ) : (
          <ul className="mt-4 space-y-3">
            {appointments.map((appointment) => (
              <li
                key={appointment.id}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm transition hover:border-blue-200"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{appointment.fullName}</p>
                    <p className="text-xs text-slate-500">Scheduled {formatSchedule(appointment.scheduledFor)}</p>
                    {appointment.visitReason ? (
                      <p className="mt-2 rounded-lg bg-white/80 p-3 text-xs text-slate-500">{appointment.visitReason}</p>
                    ) : null}
                  </div>
                  <div className="flex flex-col items-end gap-2 text-right">
                    <StatusBadge status={appointment.status} />
                    <p className="text-xs text-slate-400">
                      Last updated {dateFormatter.format(new Date(appointment.updatedAt))}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default AppointmentLookup
