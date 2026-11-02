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

  const maxMonthRev = Math.max(...reports.monthlyBreakdown.map((m) => m.revenue), 200000)

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
          value={reports.totalAppointments}
          subtitle="All historical reservations"
          icon={Calendar}
        />
        <StatCard
          title="Completion Rate"
          value={`${reports.completionRate}%`}
          subtitle={`${reports.completed} sessions fulfilled`}
          icon={CheckCircle2}
        />
        <StatCard
          title="Cancelled Sessions"
          value={reports.cancelled}
          subtitle="Prior notice cancellations"
          icon={XCircle}
        />
        <StatCard
          title="No-Show Rate"
          value={reports.noShow}
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
              Verified receipts progression across the last 5 operating months
            </p>
          </div>
          <span className="rounded bg-gold/15 px-2.5 py-1 text-[11px] font-semibold text-gold-deep uppercase">
            5 Months
          </span>
        </div>

        {/* Visual Bar Progression */}
        <div className="mt-8">
          <div className="flex h-60 items-end gap-4 sm:gap-8 border-b border-charcoal/10 pb-2">
            {reports.monthlyBreakdown.map((m) => {
              const heightPercent = Math.round((m.revenue / maxMonthRev) * 100)
              return (
                <div key={m.month} className="group relative flex flex-1 flex-col items-center h-full justify-end">
                  {/* Tooltip */}
                  <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-charcoal text-ivory text-[11px] py-1 px-2.5 rounded shadow-md pointer-events-none whitespace-nowrap z-10 text-center">
                    <p className="font-semibold">{money(m.revenue)}</p>
                    <p className="text-[9px] text-taupe">{m.bookings} bookings</p>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {reports.staffWorkload.map((sw) => (
            <div key={sw.staffName} className="rounded-xl border border-charcoal/10 p-4 bg-ivory/40">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-gold-deep" />
                <h4 className="font-display text-lg font-medium text-charcoal">{sw.staffName}</h4>
              </div>
              <p className="text-[11px] text-mutedBrown mt-0.5">{sw.role}</p>

              <div className="mt-4 pt-3 border-t border-charcoal/10 flex items-baseline justify-between">
                <span className="text-xs text-mutedBrown">Appointments:</span>
                <span className="font-display text-2xl font-semibold text-charcoal">
                  {sw.appointmentCount}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Academic PBL Assignment Note */}
      <div className="rounded-xl border border-charcoal/10 bg-ivory p-4 text-xs font-body text-mutedBrown">
        <p><strong>PBL Note:</strong> In Phase 1, analytics are derived dynamically from structured mock datasets and client test bookings. In Phase 2, these aggregations will execute directly in MongoDB Atlas using Mongoose aggregation pipelines.</p>
      </div>

    </div>
  )
}

