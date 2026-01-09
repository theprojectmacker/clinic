import api from './api'

export interface AdminLoginResult {
  token: string
  expiresAt: string
}

export const requestAdminLogin = async (password: string): Promise<AdminLoginResult> => {
  const { data } = await api.post<AdminLoginResult>('/admin/login', { password })
  return data
}

export const requestAdminLogout = async (): Promise<void> => {
  await api.post('/admin/logout')
}
