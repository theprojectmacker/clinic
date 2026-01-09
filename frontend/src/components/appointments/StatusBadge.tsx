import { cn } from '../../lib/utils'
import type { AppointmentStatus } from '../../types/appointment'

const badgeVariants: Record<AppointmentStatus, string> = {
  SCHEDULED: 'bg-blue-100 text-blue-800 border border-blue-200',
  CHECKED_IN: 'bg-amber-100 text-amber-800 border border-amber-200',
  IN_SESSION: 'bg-indigo-100 text-indigo-800 border border-indigo-200',
  COMPLETED: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
  CANCELLED: 'bg-rose-100 text-rose-800 border border-rose-200',
}

interface StatusBadgeProps {
  status: AppointmentStatus
}

function formatLabel(status: AppointmentStatus) {
  return status
    .toLowerCase()
    .split('_')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ')
}

const StatusBadge = ({ status }: StatusBadgeProps) => (
  <span className={cn('inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold', badgeVariants[status])}>
    {formatLabel(status)}
  </span>
)

export default StatusBadge
