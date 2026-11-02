import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarCheck,
  Clock,
  CheckCircle2,
  Users,
  UserCheck,
  CreditCard,
  Plus,
  ArrowRight,
  TrendingUp,
  Scissors,
  DollarSign,
  AlertCircle,
  Calendar,
} from 'lucide-react'
import { adminService } from '../services/adminService'
import { money } from '@/lib/format'
import StatCard from '../components/ui/StatCard'
import StatusBadge from '../components/ui/StatusBadge'

const PERIODS = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
  { id: 'all', label: 'All Time' },
]

export default function AdminDashboard() {
  const [period, setPeriod] = useState('week')
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchMetrics = async (selectedPeriod) => {
    setLoading(true)
    try {
      const data = await adminService.getDashboardMetrics(selectedPeriod)
      setMetrics(data)
    } catch (err) {
      console.error('Error fetching dashboard metrics:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics(period)
  }, [period])

  if (loading && !metrics) {
    return (
      <div className="py-20 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
        <p className="mt-3 font-body text-xs font-semibold uppercase tracking-widest text-mutedBrown">
          Loading Salon Dashboard…
        </p>
      </div>
    )
  }

  const revenueTrend = metrics?.revenueTrend || []
  const maxRevenue = Math.max(...revenueTrend.map((d) => d.amount || 0), 10000)

  const collectedIncome = metrics?.collectedIncome !== undefined ? metrics.collectedIncome : (metrics?.totalPaidRevenue || 0)
  const completedValue = metrics?.completedServiceValue || 0
  const outstandingAmount = metrics?.outstandingAmount !== undefined ? metrics.outstandingAmount : (metrics?.totalUnpaidBalance || 0)

  return (
    <div className="space-y-8">
      
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-charcoal/10 bg-white p-6 shadow-sm">
        <div>
          <span className="font-body text-[11px] font-semibold uppercase tracking-wider text-gold-deep">
            SAM SALON Executive Dashboard · Khairpur Mir's
          </span>
          <h2 className="mt-1 font-display text-2xl font-medium text-charcoal">
            Welcome back, Salon Director
          </h2>
          <p className="mt-0.5 font-body text-xs text-mutedBrown">
            Real-time business performance, customer arrivals, and financial metrics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/admin/appointments?action=new"
            className="inline-flex items-center gap-1.5 rounded-sm bg-charcoal px-4 py-2 font-body text-xs font-semibold uppercase tracking-wider text-ivory transition-colors hover:bg-gold hover:text-charcoal"
          >
            <Plus size={14} />
            <span>Book Walk-in</span>
          </Link>
          <Link
            to="/admin/payments"
            className="inline-flex items-center gap-1.5 rounded-sm border border-charcoal/20 bg-ivory px-4 py-2 font-body text-xs font-semibold uppercase tracking-wider text-charcoal transition-colors hover:border-gold hover:text-gold-deep"
          >
            <CreditCard size={14} />
            <span>Payments Register</span>
          </Link>
        </div>
      </div>

      {/* Period Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-charcoal/10 pb-2">
        <div className="flex items-center gap-2">
          <span className="font-body text-xs font-semibold uppercase tracking-wider text-mutedBrown mr-1">
            Time Filter:
          </span>
          <div className="inline-flex rounded-lg bg-ivory p-1 border border-charcoal/10">
            {PERIODS.map((p) => {
              const active = period === p.id
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPeriod(p.id)}
                  className={`rounded-md px-3 py-1 font-body text-xs font-medium transition-all ${
                    active
                      ? 'bg-charcoal text-ivory shadow-xs font-semibold'
                      : 'text-charcoal/70 hover:text-charcoal hover:bg-white/60'
                  }`}
                >
                  {p.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Operational status counters */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-body text-mutedBrown">
          <span>Pending: <strong className="text-amber-700">{metrics?.pendingCount || 0}</strong></span>
          <span>•</span>
          <span>Confirmed: <strong className="text-blue-700">{metrics?.confirmedCount || 0}</strong></span>
          <span>•</span>
          <span>Completed: <strong className="text-emerald-700">{metrics?.completedCount || 0}</strong></span>
        </div>
      </div>

      {/* 6 Key Performance Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          title="Collected Income"
          value={money(collectedIncome)}
          subtitle="Actual payments received"
          icon={CreditCard}
        />
        <StatCard
          title="Completed Value"
          value={money(completedValue)}
          subtitle="Delivered service volume"
          icon={TrendingUp}
        />
        <StatCard
          title="Outstanding Balance"
          value={money(outstandingAmount)}
          subtitle="Uncollected client debt"
          icon={AlertCircle}
        />
        <StatCard
          title="Today's Bookings"
          value={metrics?.todayCount || 0}
          subtitle="Arriving today"
          icon={CalendarCheck}
        />
        <StatCard
          title="Period Bookings"
          value={metrics?.periodAppointmentsCount || 0}
          subtitle={`In ${period}`}
          icon={Clock}
        />
        <StatCard
          title="Active Specialists"
          value={metrics?.totalStaffActive || 0}
          subtitle="On duty roster"
          icon={UserCheck}
        />
      </div>

      {/* Middle Section: Revenue Trend Chart & Popular Services */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        
        {/* Revenue Trend Chart */}
        <div className="rounded-2xl border border-charcoal/10 bg-white p-6 shadow-sm lg:col-span-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-xl font-medium text-charcoal">
                  Collected Revenue &amp; Appointment Volume Trend
                </h3>
                <p className="font-body text-xs text-mutedBrown">
                  Verified cash and card deposits recorded in the database
                </p>
              </div>
              <span className="rounded bg-gold/15 px-2.5 py-1 font-body text-[11px] font-semibold text-gold-deep uppercase tracking-wider">
                {PERIODS.find((p) => p.id === period)?.label || 'Trend'}
              </span>
            </div>

            {/* Visual Bar Chart */}
            <div className="mt-8">
              <div className="flex h-56 items-end gap-2 sm:gap-4 md:gap-6 border-b border-charcoal/10 pb-2">
                {revenueTrend.map((d, idx) => {
                  const heightPercent = maxRevenue > 0 ? Math.min(100, Math.max(8, Math.round((d.amount / maxRevenue) * 100))) : 8
                  return (
                    <div key={d.iso || idx} className="group relative flex flex-1 flex-col items-center h-full justify-end">
                      {/* Tooltip on hover */}
                      <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-charcoal text-ivory text-[10px] py-1 px-2 rounded pointer-events-none whitespace-nowrap shadow-md z-10">
                        {money(d.amount)} ({d.appointments} appts)
                      </div>

                      {/* Bar with gold gradient */}
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full max-w-[36px] rounded-t-md transition-all duration-300 ${
                          d.amount > 0
                            ? 'bg-gradient-to-t from-charcoal to-gold group-hover:to-gold-hover'
                            : 'bg-charcoal/10 group-hover:bg-charcoal/20'
                        }`}
                      />

                      {/* Day Label */}
                      <span className="mt-3 font-body text-[10px] sm:text-[11px] font-semibold uppercase text-mutedBrown truncate max-w-full">
                        {d.day || d.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between border-t border-charcoal/10 pt-4 text-xs font-body text-mutedBrown">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm bg-gold" />
              <span>Paid Revenue (PKR)</span>
            </div>
            <p>
              All-time collected earnings: <strong className="text-charcoal font-semibold">{money(metrics?.totalPaidRevenue || 0)}</strong>
            </p>
          </div>
        </div>

        {/* Popular Services Ranking */}
        <div className="rounded-2xl border border-charcoal/10 bg-white p-6 shadow-sm lg:col-span-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-charcoal/10 pb-4">
              <h3 className="font-display text-xl font-medium text-charcoal">
                Top Requested Services
              </h3>
              <Scissors size={18} className="text-gold-deep" />
            </div>

            <div className="mt-4 space-y-4">
              {(metrics?.topServices || []).length === 0 ? (
                <p className="text-xs text-mutedBrown py-6 text-center italic">
                  No service bookings recorded in this period.
                </p>
              ) : (
                metrics.topServices.map((svc, idx) => (
                  <div key={svc.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ivory font-display text-xs font-medium text-charcoal">
                        0{idx + 1}
                      </span>
                      <p className="truncate font-body text-xs font-medium text-charcoal">
                        {svc.name}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-body text-xs font-semibold text-gold-deep block">
                        {svc.count} booked
                      </span>
                      {svc.revenue > 0 && (
                        <span className="font-body text-[10px] text-mutedBrown block">
                          {money(svc.revenue)}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-6 border-t border-charcoal/10 pt-4">
            <Link
              to="/admin/services"
              className="flex items-center justify-between font-body text-xs font-semibold text-charcoal hover:text-gold-deep transition-colors"
            >
              <span>Manage all services &amp; pricing</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

      </div>

      {/* Bottom Section: Recent Appointments Table */}
      <div className="rounded-2xl border border-charcoal/10 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-charcoal/10 pb-4">
          <div>
            <h3 className="font-display text-xl font-medium text-charcoal">
              Recent Salon Appointments
            </h3>
            <p className="font-body text-xs text-mutedBrown">
              Real-time activity and customer arrivals
            </p>
          </div>
          <Link
            to="/admin/appointments"
            className="inline-flex items-center gap-1.5 font-body text-xs font-semibold text-gold-deep hover:underline uppercase tracking-wider"
          >
            <span>View All</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left font-body text-xs">
            <thead>
              <tr className="border-b border-charcoal/10 text-mutedBrown uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 font-semibold">Reference</th>
                <th className="py-3 px-4 font-semibold">Customer</th>
                <th className="py-3 px-4 font-semibold">Treatment</th>
                <th className="py-3 px-4 font-semibold">Specialist</th>
                <th className="py-3 px-4 font-semibold">Date &amp; Time</th>
                <th className="py-3 px-4 font-semibold">Price</th>
                <th className="py-3 px-4 font-semibold">Booking Status</th>
                <th className="py-3 px-4 font-semibold">Payment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/5">
              {(metrics?.recentAppointments || []).map((a) => (
                <tr key={a.id || a._id} className="hover:bg-ivory/50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-charcoal">
                    {a.ref}
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-medium text-charcoal">{a.customerName}</p>
                    <p className="text-[10px] text-mutedBrown">{a.customerPhone}</p>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-charcoal">
                    {a.serviceName}
                  </td>
                  <td className="py-3.5 px-4 text-mutedBrown">
                    {a.staffName}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="font-medium text-charcoal">{a.date}</span>
                    <span className="text-[10px] text-mutedBrown block">{a.time}</span>
                  </td>
                  <td className="py-3.5 px-4 font-display text-sm font-medium text-charcoal">
                    {money(a.price)}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={a.status} />
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={a.paymentStatus} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
