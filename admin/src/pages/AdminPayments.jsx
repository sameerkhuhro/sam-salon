import { useEffect, useState } from 'react'
import {
  CreditCard,
  Plus,
  Search,
  DollarSign,
  TrendingUp,
  AlertCircle,
  FileText,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react'
import { adminService } from '../services/adminService'
import { money } from '@/lib/format'
import StatCard from '../components/ui/StatCard'
import StatusBadge from '../components/ui/StatusBadge'
import AdminModal from '../components/ui/AdminModal'

export default function AdminPayments() {
  const [payments, setPayments] = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [search, setSearch] = useState('')
  const [methodFilter, setMethodFilter] = useState('all')

  // Record Manual Payment Modal
  const [recordModalOpen, setRecordModalOpen] = useState(false)
  const [payForm, setPayForm] = useState({
    bookingRef: '',
    customerName: '',
    serviceName: '',
    amount: '',
    method: 'Cash',
    notes: '',
  })
  const [formErr, setFormErr] = useState({})

  // Refund Modal
  const [refundModalPayment, setRefundModalPayment] = useState(null)
  const [refundAmount, setRefundAmount] = useState('')
  const [refundReason, setRefundReason] = useState('')
  const [refundError, setRefundError] = useState('')
  const [refundSubmitting, setRefundSubmitting] = useState(false)

  const loadData = async () => {
    setLoading(true)
    const [payList, apptList] = await Promise.all([
      adminService.getPayments(),
      adminService.getAppointments(),
    ])
    setPayments(payList)
    setAppointments(apptList)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  // Calculations
  const getNetPaid = (p) => {
    const paid = Number(p.amountPaid !== undefined ? p.amountPaid : (p.amount || 0))
    const refunded = (p.refunds || []).reduce((sum, r) => sum + (r.amount || 0), 0)
    return Math.max(0, paid - refunded)
  }

  const verifiedRevenue = payments
    .filter((p) => p.status === 'paid' || p.status === 'partial')
    .reduce((sum, p) => sum + getNetPaid(p), 0)

  const pendingUnpaid = appointments
    .filter((a) => a.paymentStatus === 'unpaid' && a.status !== 'cancelled')
    .reduce((sum, a) => sum + (a.price || 0), 0)

  const totalRefunded = payments.reduce((sum, p) => {
    const fromRefundsList = (p.refunds || []).reduce((rSum, r) => rSum + (r.amount || 0), 0)
    if (fromRefundsList > 0) return sum + fromRefundsList
    return p.status === 'refunded' ? sum + (p.amountPaid || p.amount || 0) : sum
  }, 0)

  // Filtered payments list
  const filteredPayments = payments.filter((p) => {
    const q = search.toLowerCase()
    const inv = (p.invoiceNo || p.ref || '').toLowerCase()
    const bRef = (p.appointmentRef || p.bookingRef || '').toLowerCase()
    const matchesSearch =
      inv.includes(q) ||
      bRef.includes(q) ||
      p.customerName.toLowerCase().includes(q) ||
      (p.serviceName && p.serviceName.toLowerCase().includes(q))
    const matchesMethod = methodFilter === 'all' || p.method === methodFilter
    return matchesSearch && matchesMethod
  })

  // Submit manual payment
  const handlePaymentSubmit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!payForm.customerName.trim()) errs.customerName = 'Customer name required'
    if (Number(payForm.amount) <= 0) errs.amount = 'Valid payment amount required'

    setFormErr(errs)
    if (Object.keys(errs).length > 0) return

    await adminService.recordPayment({
      ...payForm,
      appointmentId: payForm.appointmentId || null,
      appointmentRef: payForm.bookingRef || '',
      totalAmount: Number(payForm.totalAmount || payForm.amount),
      amountPaid: Number(payForm.amount),
    })
    setRecordModalOpen(false)
    setPayForm({
      appointmentId: null,
      bookingRef: '',
      customerName: '',
      serviceName: '',
      amount: '',
      method: 'Cash',
      notes: '',
    })
    await loadData()
  }

  // Submit Refund
  const handleRefundSubmit = async (e) => {
    e.preventDefault()
    setRefundError('')
    const amt = Number(refundAmount)
    if (!amt || amt <= 0) {
      setRefundError('Enter a valid refund amount.')
      return
    }

    setRefundSubmitting(true)
    try {
      await adminService.refundPayment(refundModalPayment.id, amt, refundReason)
      setRefundModalPayment(null)
      setRefundAmount('')
      setRefundReason('')
      await loadData()
    } catch (err) {
      setRefundError(err.message || 'Failed to process refund')
    } finally {
      setRefundSubmitting(false)
    }
  }

  // Pre-fill when selecting an unpaid appointment
  const handleSelectBookingToPay = (ref) => {
    const target = appointments.find((a) => a.ref === ref)
    if (target) {
      const remaining = target.outstandingAmount !== undefined ? target.outstandingAmount : Math.max(0, (target.price || 0) - (target.amountPaid || 0))
      setPayForm({
        appointmentId: target.id || target._id,
        bookingRef: target.ref,
        customerName: target.customerName,
        customerPhone: target.customerPhone || '',
        serviceName: target.serviceName,
        staffName: target.staffName || '',
        totalAmount: target.price,
        amount: remaining > 0 ? remaining : target.price,
        method: 'Cash',
        notes: `Settled balance for reservation ${target.ref}`,
      })
    }
  }

  return (
    <div className="space-y-6">
      
      {/* Header & Record Payment Action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-medium text-charcoal">
            Payments, Receipts &amp; Earnings
          </h2>
          <p className="font-body text-xs text-mutedBrown">
            Audit salon cash register, card receipts, outstanding client balances, and refunds.
          </p>
        </div>

        <button
          onClick={() => setRecordModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-sm bg-charcoal px-4 py-2.5 font-body text-xs font-semibold uppercase tracking-wider text-ivory hover:bg-gold hover:text-charcoal transition-colors self-start sm:self-auto shadow-sm"
        >
          <Plus size={15} />
          <span>Record Payment</span>
        </button>
      </div>

      {/* Financial KPI Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Verified Received Revenue"
          value={money(verifiedRevenue)}
          subtitle="Actually deposited / collected"
          icon={TrendingUp}
        />
        <StatCard
          title="Pending Unpaid Balance"
          value={money(pendingUnpaid)}
          subtitle="Appointments awaiting payment"
          icon={AlertCircle}
        />
        <StatCard
          title="Processed Transactions"
          value={payments.length}
          subtitle="Total receipts generated"
          icon={FileText}
        />
        <StatCard
          title="Processed Refunds"
          value={money(totalRefunded)}
          subtitle="Returned to clients"
          icon={RotateCcw}
        />
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-charcoal/10 bg-white p-4 shadow-sm">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-2.5 text-mutedBrown pointer-events-none" />
          <input
            type="text"
            placeholder="Search payment reference, booking ID, or client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-sm border border-charcoal/20 bg-ivory/40 py-2 pl-9 pr-3 font-body text-xs text-charcoal outline-none focus:border-gold focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="font-body text-xs text-mutedBrown">Payment Method:</span>
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="rounded-sm border border-charcoal/20 bg-ivory/40 py-1.5 px-3 font-body text-xs text-charcoal outline-none focus:border-gold"
          >
            <option value="all">All Methods</option>
            <option value="Cash">Cash</option>
            <option value="Card">Card</option>
            <option value="Bank Transfer">Bank Transfer / Raast</option>
          </select>
        </div>
      </div>

      {/* Payment Records Table */}
      <div className="rounded-xl border border-charcoal/10 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-gold border-t-transparent" />
            <p className="mt-3 font-body text-xs text-mutedBrown">Compiling financial records…</p>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="py-16 text-center">
            <CreditCard className="mx-auto text-taupe mb-2" size={32} />
            <h3 className="font-display text-xl font-medium text-charcoal">No payment records found</h3>
            <p className="mt-1 font-body text-xs text-mutedBrown">Try clearing your search query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-body text-xs">
              <thead className="border-b border-charcoal/10 bg-ivory/60 text-mutedBrown uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Payment ID</th>
                  <th className="py-3 px-4 font-semibold">Booking Ref</th>
                  <th className="py-3 px-4 font-semibold">Client Name</th>
                  <th className="py-3 px-4 font-semibold">Treatment</th>
                  <th className="py-3 px-4 font-semibold">Amount</th>
                  <th className="py-3 px-4 font-semibold">Method</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Date &amp; Time</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal/5">
                {filteredPayments.map((p) => {
                  const isRefundable = (p.status === 'paid' || p.status === 'partial') && getNetPaid(p) > 0
                  return (
                    <tr key={p.id} className="hover:bg-ivory/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-charcoal">
                        {p.invoiceNo || p.ref}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-mutedBrown">
                        {p.appointmentRef || p.bookingRef || '—'}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-charcoal">
                        {p.customerName}
                      </td>
                      <td className="py-3.5 px-4 text-charcoal">
                        {p.serviceName}
                      </td>
                      <td className="py-3.5 px-4 font-display text-sm font-semibold text-charcoal whitespace-nowrap">
                        {money(p.amountPaid !== undefined ? p.amountPaid : p.amount)}
                        {(p.refunds || []).length > 0 && (
                          <span className="block text-[10px] text-rose-600 font-sans font-normal">
                            Refunded: {money((p.refunds || []).reduce((s, r) => s + (r.amount || 0), 0))}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="rounded bg-ivory px-2 py-0.5 font-medium border border-charcoal/10">
                          {p.method}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="py-3.5 px-4 text-mutedBrown whitespace-nowrap">
                        {p.date}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {isRefundable ? (
                          <button
                            onClick={() => {
                              setRefundModalPayment(p)
                              setRefundAmount(getNetPaid(p))
                              setRefundReason('')
                              setRefundError('')
                            }}
                            className="inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition"
                            title="Issue Refund"
                          >
                            <RotateCcw size={12} />
                            <span>Refund</span>
                          </button>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Manual Payment Modal */}
      {recordModalOpen && (
        <AdminModal
          isOpen={recordModalOpen}
          onClose={() => setRecordModalOpen(false)}
          title="Record Counter Payment"
          subtitle="Log cash, card, or transfer payment for an appointment or walk-in"
        >
          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            
            {/* Quick Unpaid Appointment Picker */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">
                Link to Unpaid Reservation (Optional)
              </label>
              <select
                onChange={(e) => handleSelectBookingToPay(e.target.value)}
                className="w-full rounded border border-charcoal/20 p-2 text-xs text-charcoal outline-none focus:border-gold"
              >
                <option value="">Select unpaid appointment to auto-fill...</option>
                {appointments
                  .filter((a) => a.paymentStatus === 'unpaid' && a.status !== 'cancelled')
                  .map((a) => (
                    <option key={a.id} value={a.ref}>
                      {a.ref} — {a.customerName} ({a.serviceName} - {money(a.price)})
                    </option>
                  ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sana Ahmed"
                  value={payForm.customerName}
                  onChange={(e) => setPayForm({ ...payForm, customerName: e.target.value })}
                  className="w-full rounded border border-charcoal/20 p-2 text-xs text-charcoal outline-none focus:border-gold"
                />
                {formErr.customerName && <p className="text-[11px] text-rose-600 mt-0.5">{formErr.customerName}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">
                  Service / Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Signature Cut & Style"
                  value={payForm.serviceName}
                  onChange={(e) => setPayForm({ ...payForm, serviceName: e.target.value })}
                  className="w-full rounded border border-charcoal/20 p-2 text-xs text-charcoal outline-none focus:border-gold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">
                  Amount Received (PKR) *
                </label>
                <input
                  type="number"
                  min="50"
                  step="50"
                  placeholder="2500"
                  value={payForm.amount}
                  onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })}
                  className="w-full rounded border border-charcoal/20 p-2 text-xs text-charcoal outline-none focus:border-gold font-semibold"
                />
                {formErr.amount && <p className="text-[11px] text-rose-600 mt-0.5">{formErr.amount}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">
                  Tender Method *
                </label>
                <select
                  value={payForm.method}
                  onChange={(e) => setPayForm({ ...payForm, method: e.target.value })}
                  className="w-full rounded border border-charcoal/20 p-2 text-xs text-charcoal outline-none focus:border-gold"
                >
                  <option value="Cash">Cash at Reception</option>
                  <option value="Card">Card (POS Terminal)</option>
                  <option value="Bank Transfer">Bank Transfer / Raast</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">
                Receipt / Register Notes
              </label>
              <textarea
                rows={2}
                placeholder="Cash slip number, POS terminal auth code, etc."
                value={payForm.notes}
                onChange={(e) => setPayForm({ ...payForm, notes: e.target.value })}
                className="w-full rounded border border-charcoal/20 p-2 text-xs text-charcoal outline-none focus:border-gold resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-charcoal/10">
              <button
                type="button"
                onClick={() => setRecordModalOpen(false)}
                className="rounded border border-charcoal/20 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-charcoal"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded bg-gold px-6 py-2 text-xs font-semibold uppercase tracking-wider text-charcoal hover:bg-gold-hover shadow-sm"
              >
                Save Receipt
              </button>
            </div>
          </form>
        </AdminModal>
      )}

      {/* Issue Refund Modal */}
      {refundModalPayment && (
        <AdminModal
          isOpen={!!refundModalPayment}
          onClose={() => setRefundModalPayment(null)}
          title={`Process Client Refund: ${refundModalPayment.invoiceNo || refundModalPayment.ref}`}
          subtitle={`Client: ${refundModalPayment.customerName} · Available for refund: ${money(getNetPaid(refundModalPayment))}`}
        >
          <form onSubmit={handleRefundSubmit} className="space-y-4">
            {refundError && (
              <div className="rounded border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700 flex items-center gap-1.5">
                <AlertCircle size={14} className="shrink-0" />
                <span>{refundError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">
                Refund Amount (PKR) *
              </label>
              <input
                type="number"
                min="1"
                max={getNetPaid(refundModalPayment)}
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                className="w-full rounded border border-charcoal/20 p-2 text-xs text-charcoal outline-none focus:border-gold font-semibold"
                required
              />
              <p className="text-[11px] text-mutedBrown mt-1">
                Maximum refundable: <strong>{money(getNetPaid(refundModalPayment))}</strong>
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">
                Reason for Refund *
              </label>
              <textarea
                rows={3}
                placeholder="Reason (e.g., Client requested cancellation, partial dissatisfaction, billing adjustment)"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                className="w-full rounded border border-charcoal/20 p-2 text-xs text-charcoal outline-none focus:border-gold resize-none"
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-charcoal/10">
              <button
                type="button"
                onClick={() => setRefundModalPayment(null)}
                className="rounded border border-charcoal/20 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-charcoal"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={refundSubmitting}
                className="rounded bg-rose-600 px-6 py-2 text-xs font-semibold uppercase tracking-wider text-white hover:bg-rose-700 disabled:opacity-50 transition shadow-sm"
              >
                {refundSubmitting ? 'Processing...' : 'Confirm Refund'}
              </button>
            </div>
          </form>
        </AdminModal>
      )}

    </div>
  )
}

