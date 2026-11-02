/**
 * SalonHub Admin Sidebar
 * Premium charcoal sidebar with gold active indicators and responsive mobile drawer support.
 */

import { NavLink, Link } from 'react-router-dom'
import {
  LayoutDashboard,
  CalendarCheck,
  UserCheck,
  Scissors,
  Users,
  CreditCard,
  Clock,
  BarChart3,
  Settings,
  ShieldCheck,
  LogOut,
  ExternalLink,
  X,
} from 'lucide-react'
import { useAdminAuth } from '../../context/AdminAuthContext'

const NAV_ITEMS = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/appointments', label: 'Appointments', icon: CalendarCheck },
  { to: '/admin/staff', label: 'Staff Management', icon: UserCheck },
  { to: '/admin/services', label: 'Services & Menu', icon: Scissors },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/payments', label: 'Payments & Revenue', icon: CreditCard },
  { to: '/admin/schedule', label: 'Schedule & Shifts', icon: Clock },
  { to: '/admin/reports', label: 'Reports & Analytics', icon: BarChart3 },
  { to: '/admin/admins', label: 'Admin Accounts', icon: ShieldCheck },
  { to: '/admin/settings', label: 'Salon Settings', icon: Settings },
]

export default function AdminSidebar({ mobileOpen, onCloseMobile }) {
  const { adminUser, logout } = useAdminAuth()

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-charcoal/70 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col justify-between bg-charcoal text-ivory transition-transform duration-300 ease-premium lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top: Wordmark & Brand Badge */}
        <div>
          <div className="flex h-20 items-center justify-between border-b border-charcoal-light/70 px-6">
            <Link to="/admin/dashboard" className="flex flex-col">
              <div className="flex items-baseline font-display text-2xl font-medium tracking-tight text-ivory">
                <span>SAM SALON</span>
                <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-gold" aria-hidden="true" />
              </div>
              <span className="font-body text-[9px] uppercase tracking-[0.24em] text-gold -mt-1 font-semibold">
                ADMIN PORTAL
              </span>
            </Link>

            {/* Mobile close button */}
            <button
              onClick={onCloseMobile}
              className="rounded-lg p-1.5 text-taupe hover:text-white hover:bg-charcoal-light lg:hidden"
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="mt-4 px-3 space-y-1" aria-label="Admin Navigation">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 rounded-lg px-4 py-2.5 font-body text-xs font-medium tracking-wider transition-all duration-150 ${
                      isActive
                        ? 'bg-gold text-charcoal font-semibold shadow-sm'
                        : 'text-taupe hover:bg-charcoal-light hover:text-white'
                    }`
                  }
                >
                  <Icon size={17} className="shrink-0 transition-transform group-hover:scale-110" />
                  <span>{item.label}</span>
                </NavLink>
              )
            })}
          </nav>
        </div>

        {/* Bottom Area: User Badge, Public Site Link, Logout */}
        <div className="border-t border-charcoal-light/70 p-4 space-y-3">
          {/* Quick link to live public site */}
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between rounded-lg border border-charcoal-light bg-charcoal-light/30 px-3.5 py-2 font-body text-[11px] text-taupe hover:text-gold hover:border-gold/40 transition-colors"
          >
            <span className="truncate">View Public Website</span>
            <ExternalLink size={13} className="shrink-0" />
          </Link>

          {/* User profile card */}
          <div className="flex items-center gap-3 rounded-lg bg-charcoal-light/40 p-2.5">
            <img
              src={adminUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
              alt={adminUser?.name || 'Admin'}
              className="h-9 w-9 rounded-full object-cover border border-gold/40 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-sm font-medium text-ivory">
                {adminUser?.name || 'Administrator'}
              </p>
              <p className="truncate font-body text-[10px] text-taupe">
                {adminUser?.salonBranch || "Khairpur Mir's"}
              </p>
            </div>
            <button
              onClick={logout}
              title="Sign out of admin portal"
              className="rounded p-1.5 text-taupe hover:text-rose-400 hover:bg-charcoal-light transition-colors"
              aria-label="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

