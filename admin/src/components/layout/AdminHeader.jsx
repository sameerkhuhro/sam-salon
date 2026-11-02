/**
 * SalonHub Admin Top Header Bar
 * Breadcrumbs, mobile hamburger toggle, live salon time, quick status.
 */

import { Menu, Bell, Calendar } from 'lucide-react'
import { useLocation } from 'react-router-dom'

const BREADCRUMB_MAP = {
  '/admin': 'Dashboard',
  '/admin/dashboard': 'Dashboard',
  '/admin/appointments': 'Appointments Management',
  '/admin/staff': 'Staff Management',
  '/admin/services': 'Services & Categories',
  '/admin/customers': 'Customer Directory',
  '/admin/payments': 'Payments & Earnings',
  '/admin/schedule': 'Schedule & Availability',
  '/admin/reports': 'Reports & Analytics',
  '/admin/admins': 'Admin Accounts',
  '/admin/settings': 'Salon Settings',
}

export default function AdminHeader({ onOpenMobile }) {
  const { pathname } = useLocation()
  const currentTitle = BREADCRUMB_MAP[pathname] || 'Administration'

  const todayFormatted = new Date().toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-charcoal/10 bg-white/95 px-5 sm:px-8 backdrop-blur-md">
      {/* Left: Mobile hamburger & Breadcrumbs */}
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenMobile}
          className="rounded-lg p-2 text-charcoal hover:bg-charcoal/5 lg:hidden"
          aria-label="Open sidebar menu"
        >
          <Menu size={22} />
        </button>

        <div>
          <div className="flex items-center gap-2 font-body text-[11px] font-semibold uppercase tracking-wider text-mutedBrown">
            <span>Portal</span>
            <span className="text-taupe">/</span>
            <span className="text-gold-deep">{currentTitle}</span>
          </div>
          <h1 className="font-display text-2xl font-medium tracking-tight text-charcoal leading-none mt-0.5">
            {currentTitle}
          </h1>
        </div>
      </div>

      {/* Right: Date, Notifications, Branch Badge */}
      <div className="flex items-center gap-4">
        {/* Salon Date */}
        <div className="hidden sm:flex items-center gap-2 rounded-full border border-charcoal/10 bg-ivory px-3.5 py-1.5 font-body text-xs text-charcoal">
          <Calendar size={14} className="text-gold-deep" />
          <span>{todayFormatted}</span>
        </div>

        {/* Notifications Icon (Mock indicator) */}
        <div className="relative">
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full text-charcoal/70 hover:bg-charcoal/5 hover:text-charcoal transition-colors"
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-gold ring-2 ring-white" />
          </button>
        </div>

        {/* Branch pill */}
        <div className="hidden md:flex items-center gap-1.5 rounded-md bg-charcoal/5 px-3 py-1 font-body text-xs text-charcoal font-medium">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span>SAM SALON Flagship</span>
        </div>
      </div>
    </header>
  )
}

