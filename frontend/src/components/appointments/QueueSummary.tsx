import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import StatusBadge from './StatusBadge'
import type { QueueSummaryData } from '../../types/appointment'

interface QueueSummaryProps {
  summary: QueueSummaryData
  loading: boolean
  onRefresh: () => Promise<void> | void
}

const numberFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })
const timeFormatter = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
})
const dateFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
})

const QueueSummary = ({ summary, loading, onRefresh }: QueueSummaryProps) => {
  const { scheduledToday, onlineCount, inPersonCount, nextAppointment, statusBreakdown, totalAppointments } = summary

  const nextVisitLabel = nextAppointment
    ? `${dateFormatter.format(new Date(nextAppointment.scheduledFor))} • ${timeFormatter.format(new Date(nextAppointment.scheduledFor))}`
    : 'No upcoming visits scheduled'

  return (
    <section className="grid gap-4 md:grid-cols-3">
      <Card className="shadow-panel">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Today’s Flow</CardTitle>
            <CardDescription>Scheduled visits for the current day</CardDescription>
          </div>
          <Button variant="secondary" size="sm" onClick={onRefresh} disabled={loading}>
            {loading ? 'Refreshing…' : 'Refresh'}
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-semibold text-slate-900">{numberFormatter.format(scheduledToday)}</p>
          <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">Appointments today</p>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-blue-900">
              <p className="font-semibold">{numberFormatter.format(summary.waitingCount)}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-blue-700">Awaiting check-in</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-panel">
        <CardHeader>
          <CardTitle>Channel Mix</CardTitle>
          <CardDescription>Distribution across service channels</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-3xl font-semibold text-slate-900">{numberFormatter.format(totalAppointments)}</p>
            <p className="text-xs uppercase tracking-wide text-slate-500">Total active bookings</p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-slate-700">
              <p className="text-xs uppercase tracking-wide text-slate-400">Physical visits</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{numberFormatter.format(inPersonCount)}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-slate-700">
              <p className="text-xs uppercase tracking-wide text-slate-400">Virtual consults</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{numberFormatter.format(onlineCount)}</p>
            </div>
          </div>
          <div className="grid gap-2">
            {statusBreakdown.map((item) => (
              <div key={item.status} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium">
                <span className="text-slate-500">{item.label}</span>
                <span className="text-slate-900">{numberFormatter.format(item.count)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-panel">
        <CardHeader>
          <CardTitle>Next in Queue</CardTitle>
          <CardDescription>High priority appointment on the roster</CardDescription>
        </CardHeader>
        <CardContent className="flex h-full flex-col justify-between">
          <div className="flex flex-col gap-3">
            <p className="text-sm text-slate-500">{nextVisitLabel}</p>
            {nextAppointment ? (
              <>
                <p className="text-xl font-semibold text-slate-900">{nextAppointment.fullName}</p>
                <StatusBadge status={nextAppointment.status} />
                <p className="text-sm text-slate-600">{nextAppointment.visitType === 'ONLINE' ? 'Virtual consultation' : 'In-person consultation'}</p>
                {nextAppointment.visitReason ? (
                  <p className="rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
                    {nextAppointment.visitReason}
                  </p>
                ) : null}
              </>
            ) : (
              <p className="text-sm text-slate-500">Create a new appointment to populate the queue.</p>
            )}
          </div>
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
            <p className="font-semibold text-slate-700">Tip for patients</p>
            <p className="mt-2">Arrive 10 minutes before your slot for a smooth check-in experience.</p>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}

export default QueueSummary
