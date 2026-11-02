/**
 * Accessible Reusable Admin Modal Dialog
 */

import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function AdminModal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-xl',
}) {
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Surface */}
      <div
        className={`relative w-full ${maxWidth} rounded-2xl bg-white shadow-2xl border border-charcoal/15 z-10 my-8 overflow-hidden`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-charcoal/10 px-6 py-4 bg-ivory">
          <div>
            <h3 className="font-display text-xl font-medium text-charcoal">
              {title}
            </h3>
            {subtitle && (
              <p className="mt-0.5 font-body text-xs text-mutedBrown">
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-charcoal/60 hover:text-charcoal hover:bg-charcoal/10 transition-colors"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}

