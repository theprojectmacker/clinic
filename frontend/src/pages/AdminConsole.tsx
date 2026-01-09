import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import AppointmentBoard from '../components/appointments/AppointmentBoard'
import QueueSummary from '../components/appointments/QueueSummary'
import { Button } from '../components/ui/button'
import { useAdminAuth } from '../contexts/AdminAuthContext'
import { useAppointments } from '../hooks/useAppointments'

const AdminConsolePage = () => {
  const navigate = useNavigate()
  const { logout } = useAdminAuth()
  const {
    appointments,
    loading,
    error,
    refresh,
    updateAppointmentStatus,
    summary,
  } = useAppointments()
  const [signingOut, setSigningOut] = useState(false)

  const handleSignOut = async () => {
    try {
      setSigningOut(true)
      await logout()
      navigate('/admin/login', { replace: true })
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-slate-500">Blue Harbor Medical Group</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 lg:text-4xl">
              Clinic Queue Command Center
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Monitor arrivals, mark completions, and balance physical versus virtual consult volumes.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => navigate('/')}
            >
              Patient scheduler
            </Button>
            <Button variant="destructive" onClick={handleSignOut} disabled={signingOut}>
              {signingOut ? 'Signing out…' : 'Sign out'}
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10">
        <QueueSummary summary={summary} loading={loading} onRefresh={refresh} />
        <AppointmentBoard
          appointments={appointments}
          loading={loading}
          error={error}
          highlightedAppointmentId={null}
          onRefresh={refresh}
          onStatusChange={updateAppointmentStatus}
          allowStatusUpdates
        />
      </main>
    </div>
  )
}

export default AdminConsolePage
