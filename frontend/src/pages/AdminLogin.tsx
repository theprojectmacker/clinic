import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'

import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { useAdminAuth } from '../contexts/AdminAuthContext'

const AdminLoginPage = () => {
  const navigate = useNavigate()
  const { login, isAuthenticated, initializing } = useAdminAuth()
  const [password, setPassword] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (initializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-sm font-medium text-slate-500">
        Preparing admin console…
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = password.trim()
    if (!trimmed) {
      setFormError('Enter the administrator access code to continue.')
      return
    }

    try {
      setSubmitting(true)
      setFormError(null)
      await login(trimmed)
      navigate('/admin', { replace: true })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to verify credentials.'
      setFormError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-16 text-slate-900">
      <div className="w-full max-w-md">
        <Card className="shadow-panel">
          <CardHeader>
            <CardTitle>Admin console access</CardTitle>
            <CardDescription>Secure login for clinic coordinators.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="adminPassword">Access code</Label>
                <Input
                  id="adminPassword"
                  name="adminPassword"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>
              {formError ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{formError}</div>
              ) : null}
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? 'Authenticating…' : 'Unlock console'}
              </Button>
            </form>
          </CardContent>
          <CardFooter>
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={() => navigate('/')}
            >
              Return to scheduler
            </Button>
          </CardFooter>
        </Card>
        <p className="mt-6 text-center text-xs text-slate-500">
          Need assistance? Call the care coordination desk at <span className="font-medium">(02) 8567 0000</span>.
        </p>
      </div>
    </div>
  )
}

export default AdminLoginPage
