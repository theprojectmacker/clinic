import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppointmentForm from '../components/appointments/AppointmentForm'
import AppointmentBoard from '../components/appointments/AppointmentBoard'
import AppointmentLookup from '../components/appointments/AppointmentLookup'
import QueueSummary from '../components/appointments/QueueSummary'
import { cn } from '../lib/utils'
import { useAppointments } from '../hooks/useAppointments'
import type { Appointment } from '../types/appointment'

const viewOptions = [
  {
    key: 'BOOK' as const,
    label: 'Book a visit',
    description: 'Reserve a clinic or teleconsult slot in under a minute.',
  },
  {
    key: 'TRACK' as const,
    label: 'My appointments',
    description: 'Find existing bookings and monitor their status.',
  },
  {
    key: 'ADMIN' as const,
    label: 'Admin console',
    description: 'Review the master queue and manage appointment statuses.',
  },
]

function ClinicSchedulerPage() {
  const {
    appointments,
    loading,
    submitting,
    error,
    createAppointment,
    updateAppointmentStatus,
    refresh,
    summary,
  } = useAppointments()
  const navigate = useNavigate()
  const [highlightedAppointment, setHighlightedAppointment] = useState<Appointment | null>(null)
  const [activeView, setActiveView] = useState<(typeof viewOptions)[number]['key']>('BOOK')

  const orderedAppointments = useMemo(
    () => appointments.slice().sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime()),
    [appointments],
  )

  const viewContent = useMemo(() => {
    if (activeView === 'TRACK') {
      return (
        <section className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-panel">
          <AppointmentLookup />
        </section>
      )
    }

    if (activeView === 'ADMIN') {
      return (
        <section className="space-y-6">
          <AppointmentBoard
            appointments={orderedAppointments}
            loading={loading}
            error={error}
            onRefresh={refresh}
            highlightedAppointmentId={highlightedAppointment?.id ?? null}
            onStatusChange={updateAppointmentStatus}
            allowStatusUpdates
          />
        </section>
      )
    }

    return (
      <section className="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <AppointmentForm
          submitting={submitting}
          onCreate={async (payload) => {
            const result = await createAppointment(payload)
            if (result?.appointment) {
              setHighlightedAppointment(result.appointment)
              setActiveView('TRACK')
            }
            return result
          }}
        />
        <AppointmentBoard
          appointments={orderedAppointments}
          loading={loading}
          error={error}
          onRefresh={refresh}
          highlightedAppointmentId={highlightedAppointment?.id ?? null}
          onStatusChange={updateAppointmentStatus}
        />
      </section>
    )
  }, [
    activeView,
    createAppointment,
    error,
    highlightedAppointment,
    loading,
    orderedAppointments,
    refresh,
    submitting,
    updateAppointmentStatus,
  ])

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-slate-500">Blue Harbor Medical Group</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 lg:text-4xl">
              Clinic Queue &amp; Scheduling Portal
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Secure your slot, monitor live queues, and coordinate patient flow across virtual and in-person channels.
            </p>
          </div>
          <div className="flex flex-col items-start gap-2 rounded-xl bg-slate-900 px-5 py-4 text-white shadow-panel">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Support hours</p>
            <p className="text-lg font-semibold">Mon – Sat / 7:00 AM – 6:00 PM</p>
            <p className="text-xs text-slate-300">Walk-ins accepted before 5:00 PM</p>
          </div>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10">
        <section className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-panel">
          <div className="grid gap-3 sm:grid-cols-3">
            {viewOptions.map((option) => {
              const isActive = activeView === option.key
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => {
                    if (option.key === 'ADMIN') {
                      navigate('/admin')
                      return
                    }
                    setActiveView(option.key)
                  }}
                  className={cn(
                    'group flex h-full flex-col rounded-xl border px-4 py-4 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400',
                    isActive
                      ? 'border-clinic-primary bg-blue-50 shadow-inner'
                      : 'border-slate-200 bg-white hover:border-blue-200',
                  )}
                >
                  <span className={cn('text-sm font-semibold', isActive ? 'text-clinic-primary' : 'text-slate-700')}>
                    {option.label}
                  </span>
                  <span className="mt-2 text-xs text-slate-500">{option.description}</span>
                </button>
              )
            })}
          </div>
        </section>
        {activeView !== 'TRACK' ? <QueueSummary summary={summary} loading={loading} onRefresh={refresh} /> : null}
        {viewContent}
      </main>
      <footer className="border-t border-slate-200 bg-white/70">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>Blue Harbor Medical Group © {new Date().getFullYear()}</p>
          <p className="text-slate-400">Dedicated telehealth line: (02) 8567 0001</p>
        </div>
      </footer>
    </div>
  )
}

export default ClinicSchedulerPage
