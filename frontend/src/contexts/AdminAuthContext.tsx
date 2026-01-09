import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'

import api from '../services/api'
import { requestAdminLogin, requestAdminLogout, type AdminLoginResult } from '../services/admin'

interface AdminSession {
  token: string
  expiresAt: string 
}

interface AdminAuthContextValue {
  session: AdminSession | null
  isAuthenticated: boolean
  initializing: boolean
  login: (password: string) => Promise<AdminLoginResult>
  logout: () => Promise<void>
}

const STORAGE_KEY = 'clinic-admin-session'

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined)

const parseStoredSession = (): AdminSession | null => {
  if (typeof window === 'undefined') {
    return null
  }
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return null
  }
  try {
    const parsed = JSON.parse(raw) as AdminSession
    if (!parsed.token || !parsed.expiresAt) {
      return null
    }
    const expiry = new Date(parsed.expiresAt)
    if (Number.isNaN(expiry.getTime()) || expiry <= new Date()) {
      window.localStorage.removeItem(STORAGE_KEY)
      return null
    }
    return parsed
  } catch {
    window.localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export const AdminAuthProvider = ({ children }: PropsWithChildren) => {
  const [session, setSession] = useState<AdminSession | null>(null)
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    const stored = parseStoredSession()
    if (stored) {
      setSession(stored)
    }
    setInitializing(false)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    if (session) {
      api.defaults.headers.common.Authorization = `Bearer ${session.token}`
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    } else {
      delete api.defaults.headers.common.Authorization
      window.localStorage.removeItem(STORAGE_KEY)
    }
  }, [session])

  const login = useCallback(async (password: string) => {
    const trimmed = password.trim()
    const result = await requestAdminLogin(trimmed)
    const newSession: AdminSession = {
      token: result.token,
      expiresAt: result.expiresAt,
    }
    setSession(newSession)
    return result
  }, [])

  const logout = useCallback(async () => {
    try {
      await requestAdminLogout()
    } catch (error) {
      console.error(error)
    } finally {
      setSession(null)
    }
  }, [])

  const value = useMemo<AdminAuthContextValue>(
    () => ({
      session,
      isAuthenticated: Boolean(session),
      initializing,
      login,
      logout,
    }),
    [initializing, login, logout, session],
  )

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext)
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider')
  }
  return context
}
