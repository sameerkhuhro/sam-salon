/**
 * Reusable Confirmation Dialog
 * For high-impact actions like deactivation, cancellation, or data changes.
 */

import { AlertTriangle } from 'lucide-react'
import AdminModal from './AdminModal'

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action will update the system state.',
  confirmLabel = 'Confirm Action',
  confirmVariant = 'danger', // 'danger' | 'primary'
  busy = false,
}) {
  return (
    <AdminModal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="flex items-start gap-4">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
            confirmVariant === 'danger'
              ? 'bg-rose-100 text-rose-700'
              : 'bg-gold/20 text-gold-deep'
          }`}
        >
          <AlertTriangle size={22} />
        </div>
        <div>
          <p className="font-body text-sm text-mutedBrown leading-relaxed">
            {message}
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3 border-t border-charcoal/10 pt-4">
        <button
          type="button"
          onClick={onClose}
          disabled={busy}
          className="rounded-sm border border-charcoal/20 bg-transparent px-4 py-2 font-body text-xs font-semibold uppercase tracking-wider text-charcoal hover:bg-charcoal/5"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className={`rounded-sm px-5 py-2 font-body text-xs font-semibold uppercase tracking-wider text-white shadow-sm transition-all disabled:opacity-50 ${
            confirmVariant === 'danger'
              ? 'bg-rose-700 hover:bg-rose-800'
              : 'bg-charcoal hover:bg-gold hover:text-charcoal'
          }`}
        >
          {busy ? 'Processing…' : confirmLabel}
        </button>
      </div>
    </AdminModal>
  )
}

