import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select } from '../ui/select'
import { Textarea } from '../ui/textarea'
import type { Appointment, AppointmentCreateInput, VisitType } from '../../types/appointment'
import { visitTypes } from '../../types/appointment'

interface AppointmentFormProps {
  submitting: boolean
  onCreate: (
    payload: AppointmentCreateInput,
  ) => Promise<{ success: boolean; appointment?: Appointment; message?: string } | undefined>
}

type AppointmentFormState = {
  fullName: string
  contactNumber: string
  visitType: VisitType
  scheduledDate: string
  scheduledTime: string
  visitReason: string
}

const initialState = (): AppointmentFormState => {
  const now = new Date()
  const isoDate = now.toISOString().split('T')[0]
  const hour = now.getHours().toString().padStart(2, '0')
  const minute = ((Math.round(now.getMinutes() / 15) * 15) % 60).toString().padStart(2, '0')
  return {
    fullName: '',
    contactNumber: '',
    visitType: 'IN_PERSON',
    scheduledDate: isoDate,
    scheduledTime: `${hour}:${minute}`,
    visitReason: '',
  }
}

const AppointmentForm = ({ submitting, onCreate }: AppointmentFormProps) => {
  const [formState, setFormState] = useState<AppointmentFormState>(initialState)
  const [formError, setFormError] = useState<string | null>(null)
  const [successDetails, setSuccessDetails] = useState<Appointment | null>(null)

  const validate = () => {
    if (!formState.fullName.trim()) {
      return 'Please provide the patient’s full name.'
    }
    if (!formState.scheduledDate) {
      return 'Select a target date for the visit.'
    }
    if (!formState.scheduledTime) {
      return 'Select a target time for the visit.'
    }
    const scheduledFor = new Date(`${formState.scheduledDate}T${formState.scheduledTime}`)
    if (Number.isNaN(scheduledFor.getTime())) {
      return 'The selected schedule is invalid. Please review the date and time.'
    }
    return null
  }

  const appointmentWindow = useMemo(() => {
    const start = new Date(`${formState.scheduledDate}T${formState.scheduledTime}`)
    if (Number.isNaN(start.getTime())) {
      return null
    }
    const end = new Date(start)
    end.setMinutes(end.getMinutes() + 30)
    return `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`
  }, [formState.scheduledDate, formState.scheduledTime])

  const resetForm = () => {
    setFormState((prev) => ({
      ...initialState(),
      visitReason: prev.visitReason ? '' : prev.visitReason,
    }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)
    setSuccessDetails(null)

    const validationMessage = validate()
    if (validationMessage) {
      setFormError(validationMessage)
      return
    }

    const scheduledFor = new Date(`${formState.scheduledDate}T${formState.scheduledTime}`)

    const payload: AppointmentCreateInput = {
      fullName: formState.fullName.trim(),
      contactNumber: formState.contactNumber.trim() || undefined,
      visitType: formState.visitType,
      scheduledFor: scheduledFor.toISOString(),
      visitReason: formState.visitReason.trim() || undefined,
    }

    const result = await onCreate(payload)
    if (!result?.success) {
      setFormError(result?.message ?? 'Unable to create the appointment. Please try again.')
      return
    }

    if (result.appointment) {
      setSuccessDetails(result.appointment)
    }

    resetForm()
  }

  return (
    <Card className="shadow-panel">
      <CardHeader>
        <CardTitle>Schedule an Appointment</CardTitle>
        <CardDescription>Reserve a consultation slot in three quick steps.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="fullName">Patient full name</Label>
            <Input
              id="fullName"
              name="fullName"
              placeholder="e.g. Alex M. Reyes"
              autoComplete="name"
              value={formState.fullName}
              onChange={(event) => setFormState((current) => ({ ...current, fullName: event.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactNumber">Mobile number (optional)</Label>
            <Input
              id="contactNumber"
              name="contactNumber"
              placeholder="09XX XXX XXXX"
              value={formState.contactNumber}
              onChange={(event) => setFormState((current) => ({ ...current, contactNumber: event.target.value }))}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="visitType">Consultation channel</Label>
              <Select
                id="visitType"
                name="visitType"
                value={formState.visitType}
                onChange={(event) =>
                  setFormState((current) => ({ ...current, visitType: event.target.value as VisitType }))
                }
              >
                {visitTypes.map((option) => (
                  <option key={option} value={option}>
                    {option === 'ONLINE' ? 'Teleconsultation' : 'In-person clinic visit'}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Estimated duration</Label>
              <div className="flex h-12 items-center rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-600">
                {appointmentWindow ?? 'Select a schedule to preview'}
              </div>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="scheduledDate">Preferred date</Label>
              <Input
                id="scheduledDate"
                name="scheduledDate"
                type="date"
                value={formState.scheduledDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(event) => setFormState((current) => ({ ...current, scheduledDate: event.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="scheduledTime">Preferred time</Label>
              <Input
                id="scheduledTime"
                name="scheduledTime"
                type="time"
                step={900}
                value={formState.scheduledTime}
                onChange={(event) => setFormState((current) => ({ ...current, scheduledTime: event.target.value }))}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="visitReason">Consultation notes (optional)</Label>
            <Textarea
              id="visitReason"
              name="visitReason"
              placeholder="Share a brief context so our care team can prepare."
              value={formState.visitReason}
              onChange={(event) => setFormState((current) => ({ ...current, visitReason: event.target.value }))}
              rows={4}
            />
          </div>
          {formError ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{formError}</div>
          ) : null}
          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? 'Securing slot…' : 'Confirm appointment'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex-col items-start gap-3 text-xs text-slate-500">
        {successDetails ? (
          <div className="w-full rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            <p className="font-semibold">Appointment confirmed</p>
            <p className="mt-1 text-xs text-emerald-700">
              Reference ID: <span className="font-mono">#{successDetails.id.toString().padStart(4, '0')}</span>
            </p>
            <p className="mt-2 text-xs text-emerald-700">
              You can view this booking anytime from the Live Queue section below.
            </p>
          </div>
        ) : null}
        <p>
          Need to reschedule or cancel? Call our care coordination desk at{' '}
          <span className="font-medium">(02) 8567 0000</span>.
        </p>
      </CardFooter>
    </Card>
  )
}

export default AppointmentForm
