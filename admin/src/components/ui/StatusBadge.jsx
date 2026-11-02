/**
 * Reusable Status Badge Component
 * Formats appointment, payment, and entity statuses with accessible colors and indicators.
 */

const BADGE_STYLES = {
  // Appointment Statuses
  pending: 'bg-amber-500/15 text-amber-800 border-amber-500/30',
  confirmed: 'bg-blue-500/15 text-blue-800 border-blue-500/30',
  completed: 'bg-emerald-500/15 text-emerald-800 border-emerald-500/30',
  cancelled: 'bg-rose-500/15 text-rose-800 border-rose-500/30',
  'no-show': 'bg-gray-500/15 text-gray-700 border-gray-400/40',

  // Payment Statuses
  paid: 'bg-emerald-600/15 text-emerald-800 border-emerald-600/30 font-semibold',
  unpaid: 'bg-rose-600/15 text-rose-800 border-rose-600/30 font-semibold',
  'partially-paid': 'bg-purple-500/15 text-purple-800 border-purple-500/30',
  refunded: 'bg-gray-500/15 text-gray-700 border-gray-400/30 line-through',

  // General Statuses
  active: 'bg-emerald-500/15 text-emerald-800 border-emerald-500/30',
  inactive: 'bg-gray-400/20 text-gray-600 border-gray-400/30',
  approved: 'bg-blue-500/15 text-blue-800 border-blue-500/30',
}

export default function StatusBadge({ status, type = 'default' }) {
  const norm = (status || '').toLowerCase()
  const style = BADGE_STYLES[norm] || 'bg-charcoal/10 text-charcoal border-charcoal/20'

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-body tracking-wider uppercase border capitalize ${style}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" aria-hidden="true" />
      <span>{status}</span>
    </span>
  )
}

