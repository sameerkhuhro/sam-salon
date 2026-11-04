import { useEffect, useState } from 'react'
import {
  BarChart3,
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Calendar,
  Users,
  Award,
} from 'lucide-react'
import { adminService } from '../services/adminService'
import { money } from '@/lib/format'
import StatCard from '../components/ui/StatCard'

export default function AdminReports() {
  const [reports, setReports] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminService.getReports().then((data) => {
      setReports(data)
      setLoading(false)
    })
  }, [])

  if (loading || !reports) {
    return (
      <div className="py-20 text-center">
        <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-gold border-t-transparent" />
        <p className="mt-3 font-body text-xs text-mutedBrown">Generating salon performance analytics…</p>
      </div>
    )
  }

  const monthlyList = Array.isArray(reports?.monthlyBreakdown) ? reports.monthlyBreakdown : []
  const maxMonthRev = Math.max(...monthlyList.map((m) => Number(m.revenue) || 0), 200000)
  const staffWorkloadList = Array.isArray(reports?.staffWorkload)
    ? reports.staffWorkload
    : Array.isArray(reports?.stylistLeaderboard)
    ? reports.stylistLeaderboard
    : []

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div>
        <h2 className="font-display text-2xl font-medium text-charcoal">
          Reports, Analytics &amp; Salon Performance
        </h2>
        <p className="font-body text-xs text-mutedBrown">
          Business intelligence, booking completion rates, and specialist capacity metrics.
        </p>
      </div>

      {/* High-level Analytics KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Bookings Managed"
          value={reports.totalAppointments ?? 0}
          subtitle="All historical reservations"
          icon={Calendar}
        />
        <StatCard
          title="Completion Rate"
          value={
            typeof reports.completionRate === 'number'
              ? `${reports.completionRate}%`
              : reports.completionRate || '0%'
          }
          subtitle={`${reports.completed ?? 0} sessions fulfilled`}
          icon={CheckCircle2}
        />
        <StatCard
          title="Cancelled Sessions"
          value={reports.cancelled ?? 0}
          subtitle="Prior notice cancellations"
          icon={XCircle}
        />
        <StatCard
          title="No-Show Rate"
          value={reports.noShow ?? 0}
          subtitle="Missed client arrivals"
          icon={AlertTriangle}
        />
      </div>

      {/* Visual Chart: Monthly Revenue Growth */}
      <div className="rounded-2xl border border-charcoal/10 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-charcoal/10 pb-4">
          <div>
            <h3 className="font-display text-xl font-medium text-charcoal">
              Monthly Revenue Growth (PKR)
            </h3>
            <p className="font-body text-xs text-mutedBrown">
              Verified receipts progression across operating months
            </p>
          </div>
          <span className="rounded bg-gold/15 px-2.5 py-1 text-[11px] font-semibold text-gold-deep uppercase">
            {monthlyList.length} Months
          </span>
        </div>

        {/* Visual Bar Progression */}
        <div className="mt-8">
          <div className="flex h-60 items-end gap-4 sm:gap-8 border-b border-charcoal/10 pb-2">
            {monthlyList.map((m) => {
              const heightPercent = Math.round(((m.revenue || 0) / maxMonthRev) * 100)
              return (
                <div key={m.month} className="group relative flex flex-1 flex-col items-center h-full justify-end">
                  {/* Tooltip */}
                  <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-charcoal text-ivory text-[11px] py-1 px-2.5 rounded shadow-md pointer-events-none whitespace-nowrap z-10 text-center">
                    <p className="font-semibold">{money(m.revenue || 0)}</p>
                    <p className="text-[9px] text-taupe">{m.bookings || 0} bookings</p>
                  </div>

                  {/* Gradient bar */}
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full max-w-[50px] rounded-t-lg bg-gradient-to-t from-charcoal via-charcoal-light to-gold group-hover:to-gold-hover transition-all duration-300 shadow-sm"
                  />

                  {/* Month Label */}
                  <span className="mt-3 font-body text-[11px] font-semibold text-mutedBrown whitespace-nowrap">
                    {m.month}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Specialist Capacity & Workload Distribution */}
      <div className="rounded-2xl border border-charcoal/10 bg-white p-6 shadow-sm">
        <h3 className="font-display text-xl font-medium text-charcoal mb-1">
          Specialist Booking Capacity &amp; Workload
        </h3>
        <p className="font-body text-xs text-mutedBrown mb-6">
          Distribution of scheduled appointments across salon artists
        </p>

        {staffWorkloadList.length === 0 ? (
          <p className="text-xs text-mutedBrown italic py-4">No staff workload data currently available.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {staffWorkloadList.map((sw) => (
              <div key={sw.staffName || sw.name || sw.id} className="rounded-xl border border-charcoal/10 p-4 bg-ivory/40">
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-gold-deep" />
                  <h4 className="font-display text-lg font-medium text-charcoal">{sw.staffName || sw.name}</h4>
                </div>
                <p className="text-[11px] text-mutedBrown mt-0.5">{sw.role || 'Stylist'}</p>

                <div className="mt-4 pt-3 border-t border-charcoal/10 flex items-baseline justify-between">
                  <span className="text-xs text-mutedBrown">Appointments:</span>
                  <span className="font-display text-2xl font-semibold text-charcoal">
                    {sw.appointmentCount ?? sw.appointments ?? 0}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Analytics Architecture Note */}
      <div className="rounded-xl border border-charcoal/10 bg-ivory p-4 text-xs font-body text-mutedBrown">
        <p><strong>Note:</strong> Performance metrics are calculated live across registered customer appointments, verified checkout receipts, and assigned salon team specialists.</p>
      </div>

    </div>
  )
}

