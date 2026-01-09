import type {
  Appointment,
  AppointmentCreateInput,
  AppointmentStatus,
} from '../types/appointment'
import api from './api'

export const fetchAppointments = async (): Promise<Appointment[]> => {
  const { data } = await api.get<Appointment[]>('/appointments')
  return data
}

export const createAppointment = async (
  payload: AppointmentCreateInput,
): Promise<Appointment> => {
  const { data } = await api.post<Appointment>('/appointments', payload)
  return data
}

export const updateAppointmentStatus = async (
  appointmentId: number,
  status: AppointmentStatus,
): Promise<Appointment> => {
  const { data } = await api.patch<Appointment>(`/appointments/${appointmentId}/status`, { status })
  return data
}

export const searchAppointmentsByName = async (fullName: string): Promise<Appointment[]> => {
  const { data } = await api.get<Appointment[]>('/appointments/search', {
    params: { name: fullName },
  })
  return data
}
