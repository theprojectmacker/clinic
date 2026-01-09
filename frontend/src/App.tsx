import type { ReactElement } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import { useAdminAuth } from './contexts/AdminAuthContext.tsx'
import AdminConsolePage from './pages/AdminConsole'
import AdminLoginPage from './pages/AdminLogin'
import ClinicSchedulerPage from './pages/ClinicScheduler'

const RequireAdmin = ({ children }: { children: ReactElement }) => {
  const { isAuthenticated, initializing } = useAdminAuth()

  if (initializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-sm font-medium text-slate-500">
        Verifying admin access…
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  return children
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<ClinicSchedulerPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <AdminConsolePage />
          </RequireAdmin>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
