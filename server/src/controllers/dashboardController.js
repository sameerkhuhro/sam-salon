import { Appointment } from '../models/Appointment.js'
import { Payment } from '../models/Payment.js'
import { Staff } from '../models/Staff.js'
import { Customer } from '../models/Customer.js'

// Helper: Calculate net payment value (amount paid minus any recorded refunds)
const getNetPayment = (p) => {
  const paid = Number(p.amountPaid !== undefined ? p.amountPaid : (p.amount || 0))
  const refunded = (p.refunds || []).reduce((sum, r) => sum + (r.amount || 0), 0)
  return Math.max(0, paid - refunded)
}

// GET /api/dashboard
export const getDashboardMetrics = async (req, res) => {
  try {
    const { period = 'week', startDate, endDate } = req.query
    const today = new Date().toISOString().slice(0, 10)

    // Determine start and end date bounds for filtering
    let filterStart = ''
    let filterEnd = today

    if (period === 'today') {
      filterStart = today
      filterEnd = today
    } else if (period === 'week') {
      const d = new Date()
      d.setDate(d.getDate() - 6)
      filterStart = d.toISOString().slice(0, 10)
    } else if (period === 'month') {
      const d = new Date()
      d.setDate(1) // 1st of current month
      filterStart = d.toISOString().slice(0, 10)
    } else if (period === 'custom' && startDate && endDate) {
      filterStart = startDate
      filterEnd = endDate
    } else if (period === 'all') {
      filterStart = '2020-01-01'
      filterEnd = '2099-12-31'
    } else {
      // Default: past 7 days
      const d = new Date()
      d.setDate(d.getDate() - 6)
      filterStart = d.toISOString().slice(0, 10)
    }

    // Query both all-time and period-specific datasets
    const [
      allAppointments,
      todayAppointments,
      totalStaffActive,
      totalCustomers,
      allPayments,
    ] = await Promise.all([
      Appointment.find().sort({ date: -1, createdAt: -1 }),
      Appointment.find({ date: today }),
      Staff.countDocuments({ status: 'active' }),
      Customer.countDocuments(),
      Payment.find({ status: { $in: ['paid', 'partial', 'partially_paid', 'refunded'] } }),
    ])

    // Filter appointments within requested period
    const periodAppointments = allAppointments.filter((a) => {
      if (!a.date) return false
      return a.date >= filterStart && a.date <= filterEnd
    })

    // Filter payments within requested period (using payment date or createdAt date)
    const periodPayments = allPayments.filter((p) => {
      const pDate = p.date || (p.createdAt ? new Date(p.createdAt).toISOString().slice(0, 10) : '')
      return pDate >= filterStart && pDate <= filterEnd
    })

    // ─────────────────────────────────────────────────────────────
    // ACCURATE FINANCIAL CALCULATIONS
    // ─────────────────────────────────────────────────────────────

    // 1. Collected Income: Actual recorded payments minus refunds in period
    const collectedIncome = periodPayments.reduce((sum, p) => sum + getNetPayment(p), 0)

    // 2. All-Time Collected Income (for backward compatibility)
    const totalPaidRevenue = allPayments.reduce((sum, p) => sum + getNetPayment(p), 0)

    // 3. Completed Service Value: Total price of services where status === 'completed'
    const completedServiceValue = periodAppointments
      .filter((a) => a.status === 'completed')
      .reduce((sum, a) => sum + (Number(a.price) || 0), 0)

    // 4. Period Outstanding Amount: Remaining balance of non-cancelled appointments in period
    const periodOutstanding = periodAppointments
      .filter((a) => a.status !== 'cancelled')
      .reduce((sum, a) => {
        const remaining = a.outstandingAmount !== undefined
          ? a.outstandingAmount
          : Math.max(0, (Number(a.price) || 0) - (Number(a.amountPaid) || 0))
        return sum + remaining
      }, 0)

    // 5. Total All-Time Outstanding Balance (non-cancelled)
    const totalUnpaidBalance = allAppointments
      .filter((a) => a.status !== 'cancelled' && a.paymentStatus !== 'paid')
      .reduce((sum, a) => {
        const remaining = a.outstandingAmount !== undefined
          ? a.outstandingAmount
          : Math.max(0, (Number(a.price) || 0) - (Number(a.amountPaid) || 0))
        return sum + remaining
      }, 0)

    // Status counts in current period
    const pendingCount = periodAppointments.filter((a) => a.status === 'pending').length
    const confirmedCount = periodAppointments.filter((a) => a.status === 'confirmed').length
    const completedCount = periodAppointments.filter((a) => a.status === 'completed').length
    const cancelledCount = periodAppointments.filter((a) => a.status === 'cancelled').length

    // All-time counts for quick reference
    const allPendingCount = allAppointments.filter((a) => a.status === 'pending').length
    const allConfirmedCount = allAppointments.filter((a) => a.status === 'confirmed').length
    const allCompletedCount = allAppointments.filter((a) => a.status === 'completed').length

    // ─────────────────────────────────────────────────────────────
    // TOP SERVICES (in period)
    // ─────────────────────────────────────────────────────────────
    const serviceMap = {}
    periodAppointments.forEach((a) => {
      const name = a.serviceName || 'Custom Service'
      if (!serviceMap[name]) {
        serviceMap[name] = { name, count: 0, revenue: 0 }
      }
      serviceMap[name].count += 1
      if (a.status !== 'cancelled') {
        serviceMap[name].revenue += Number(a.price) || 0
      }
    })
    const topServices = Object.values(serviceMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // ─────────────────────────────────────────────────────────────
    // REVENUE & APPOINTMENT TREND
    // ─────────────────────────────────────────────────────────────
    const daysMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const trendLength = period === 'today' ? 1 : (period === 'month' ? 14 : 7)
    
    const revenueTrend = Array.from({ length: trendLength }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (trendLength - 1 - i))
      const iso = d.toISOString().slice(0, 10)
      return {
        iso,
        day: daysMap[d.getDay()],
        label: `${d.getDate()} ${daysMap[d.getDay()]}`,
        amount: 0,
        appointments: 0,
      }
    })

    periodPayments.forEach((p) => {
      const pDate = p.date || (p.createdAt ? new Date(p.createdAt).toISOString().slice(0, 10) : '')
      const entry = revenueTrend.find((d) => d.iso === pDate)
      if (entry) {
        entry.amount += getNetPayment(p)
      }
    })

    periodAppointments.forEach((a) => {
      const entry = revenueTrend.find((d) => d.iso === a.date)
      if (entry) {
        entry.appointments += 1
      }
    })

    res.json({
      success: true,
      period,
      filterStart,
      filterEnd,
      metrics: {
        // Core accurate business indicators
        collectedIncome,
        completedServiceValue,
        outstandingAmount: periodOutstanding,
        totalPaidRevenue,
        totalUnpaidBalance,

        // Operational volumes
        todayCount: todayAppointments.length,
        periodAppointmentsCount: periodAppointments.length,
        pendingCount: period === 'all' ? allPendingCount : pendingCount,
        confirmedCount: period === 'all' ? allConfirmedCount : confirmedCount,
        completedCount: period === 'all' ? allCompletedCount : completedCount,
        cancelledCount,
        allPendingCount,
        allConfirmedCount,
        allCompletedCount,
        totalStaffActive,
        totalCustomers,

        // Lists and visual charts
        recentAppointments: allAppointments.slice(0, 8),
        topServices,
        revenueTrend,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard metrics',
      error: error.message,
    })
  }
}
