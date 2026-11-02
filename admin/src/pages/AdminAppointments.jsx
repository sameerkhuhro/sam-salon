import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Search,
  Filter,
  Plus,
  Calendar,
  Clock,
  Eye,
  CheckCircle2,
  XCircle,
  AlertCircle,
  User,
  ArrowRight,
  RefreshCw,
  CreditCard,
  DollarSign,
} from 'lucide-react'
import { adminService } from '../services/adminService'
import { money, duration, longDate, todayISO } from '@/lib/format'
import StatusBadge from '../components/ui/StatusBadge'
import AdminModal from '../components/ui/AdminModal'
import ConfirmDialog from '../components/ui/ConfirmDialog'

export default function AdminAppointments() {
  const [params, setParams] = useSearchParams()
  const [appointments, setAppointments] = useState([])
  const [staffList, setStaffList] = useState([])
  const [servicesList, setServicesList] = useState([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [staffFilter, setStaffFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('')

  // Modals
  const [detailModalAppt, setDetailModalAppt] = useState(null)
  const [rescheduleAppt, setRescheduleAppt] = useState(null)
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('')

  // Record Payment Modal State
  const [paymentModalAppt, setPaymentModalAppt] = useState(null)
  const [payAmount, setPayAmount] = useState('')
  const [payMethod, setPayMethod] = useState('Cash')
  const [payNotes, setPayNotes] = useState('')
  const [payErr, setPayErr] = useState('')
  const [paySubmitting, setPaySubmitting] = useState(false)
  const [statusNotice, setStatusNotice] = useState('')

  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    action: null,
    appt: null,
    title: '',
    message: '',
    variant: 'danger',
  })

  const [createModalOpen, setCreateModalOpen] = useState(params.get('action') === 'new')
  const [newApptForm, setNewApptForm] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    serviceId: '',
    staffId: '',
    date: todayISO(),
    time: '11:00 am',
    paymentStatus: 'unpaid',
    paymentMethod: 'Cash',
    notes: '',
  })
  const [formErr, setFormErr] = useState({})

  const loadData = async () => {
    setLoading(true)
    const [appts, staff, svcs] = await Promise.all([
      adminService.getAppointments({
        search,
        status: statusFilter,
        staffId: staffFilter,
        date: dateFilter,
      }),
      adminService.getStaff(),
      adminService.getServices(),
    ])
    setAppointments(appts)
    setStaffList(staff)
    setServicesList(svcs)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [search, statusFilter, staffFilter, dateFilter])

  // Handle status update
  const handleStatusChange = async (appt, newStatus) => {
    if (newStatus === 'cancelled' || newStatus === 'no-show') {
      setConfirmState({
        isOpen: true,
        action: async () => {
          await adminService.updateAppointmentStatus(appt.id, newStatus)
          await loadData()
          setConfirmState({ ...confirmState, isOpen: false })
          if (detailModalAppt?.id === appt.id) {
            setDetailModalAppt({ ...detailModalAppt, status: newStatus })
          }
        },
        appt,
        title: `Mark as ${newStatus.toUpperCase()}?`,
        message: `Are you sure you want to change booking ${appt.ref} for ${appt.customerName} to ${newStatus}?`,
        variant: 'danger',
      })
    } else {
      await adminService.updateAppointmentStatus(appt.id, newStatus)
      if (newStatus === 'completed' && appt.paymentStatus !== 'paid') {
        setStatusNotice(`Appointment ${appt.ref} marked as Completed. Payment status remains ${appt.paymentStatus.toUpperCase()} until payment is recorded.`)
        setTimeout(() => setStatusNotice(''), 6000)
      }
      await loadData()
      if (detailModalAppt?.id === appt.id) {
        setDetailModalAppt({ ...detailModalAppt, status: newStatus })
      }
    }
  }

  // Open Record Payment Modal
  const openPaymentModal = (appt) => {
    const price = Number(appt.price) || 0
    const alreadyPaid = Number(appt.amountPaid) || 0
    const remaining = appt.outstandingAmount !== undefined ? appt.outstandingAmount : Math.max(0, price - alreadyPaid)

    setPaymentModalAppt(appt)
    setPayAmount(remaining > 0 ? remaining : price)
    setPayMethod('Cash')
    setPayNotes('')
    setPayErr('')
  }

  // Submit Payment for Appointment
  const handleRecordPaymentSubmit = async (e) => {
    e.preventDefault()
    setPayErr('')
    const amt = Number(payAmount)
    if (!amt || amt <= 0) {
      setPayErr('Please enter a valid payment amount greater than PKR 0')
      return
    }

    const price = Number(paymentModalAppt.price) || 0
    const alreadyPaid = Number(paymentModalAppt.amountPaid) || 0
    const remaining = paymentModalAppt.outstandingAmount !== undefined ? paymentModalAppt.outstandingAmount : Math.max(0, price - alreadyPaid)

    if (amt > remaining) {
      setPayErr(`Payment cannot exceed the remaining balance of PKR ${remaining.toLocaleString()}`)
      return
    }

    setPaySubmitting(true)
    try {
      await adminService.recordAppointmentPayment(paymentModalAppt.id, {
        amount: amt,
        method: payMethod,
        notes: payNotes,
      })
      setPaymentModalAppt(null)
      setStatusNotice(`Payment of PKR ${amt.toLocaleString()} recorded successfully for booking ${paymentModalAppt.ref}.`)
      setTimeout(() => setStatusNotice(''), 6000)
      await loadData()
    } catch (err) {
      setPayErr(err.message || 'Failed to record payment')
    } finally {
      setPaySubmitting(false)
    }
  }

  // Handle Reschedule
  const submitReschedule = async (e) => {
    e.preventDefault()
    if (!newDate || !newTime) return
    await adminService.rescheduleAppointment(rescheduleAppt.id, newDate, newTime)
    setRescheduleAppt(null)
    setNewDate('')
    setNewTime('')
    await loadData()
  }

  // Handle Create Appointment
  const handleCreateSubmit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!newApptForm.customerName.trim()) errs.customerName = 'Customer name required'
    if (!newApptForm.customerPhone.trim()) errs.customerPhone = 'Mobile number required'
    if (!newApptForm.serviceId) errs.serviceId = 'Please select a service'
    if (!newApptForm.staffId) errs.staffId = 'Please assign a specialist'

    setFormErr(errs)
    if (Object.keys(errs).length > 0) return

    const selectedService = servicesList.find((s) => s.id === newApptForm.serviceId)
    const selectedStaff = staffList.find((t) => t.id === newApptForm.staffId)

    await adminService.createAppointment({
      ...newApptForm,
      serviceName: selectedService?.name || 'Selected Treatment',
      price: selectedService?.price || 0,
      durationMin: selectedService?.durationMin || 45,
      staffName: selectedStaff?.name || 'Assigned Specialist',
    })

    setCreateModalOpen(false)
    setNewApptForm({
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      serviceId: '',
      staffId: '',
      date: todayISO(),
      time: '11:00 am',
      paymentStatus: 'unpaid',
      paymentMethod: 'Cash',
      notes: '',
    })
    await loadData()
  }

  return (
    <div className="space-y-6">
      
      {/* Header and Add Action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-medium text-charcoal">
            Appointments &amp; Booking Management
          </h2>
          <p className="font-body text-xs text-mutedBrown">
            Monitor, reschedule, and update customer appointment statuses in real time.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-sm bg-charcoal px-4 py-2.5 font-body text-xs font-semibold uppercase tracking-wider text-ivory hover:bg-gold hover:text-charcoal transition-colors self-start sm:self-auto shadow-sm"
        >
          <Plus size={15} />
          <span>New Reservation</span>
        </button>
      </div>

      {/* Status Notice Alert */}
      {statusNotice && (
        <div className="rounded-lg bg-gold/15 border border-gold/40 p-3.5 flex items-center justify-between text-xs text-charcoal font-medium animate-fade-in shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle size={16} className="text-gold-deep shrink-0" />
            <span>{statusNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusNotice('')}
            className="text-xs text-charcoal/60 hover:text-charcoal font-bold px-2 py-0.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="rounded-xl border border-charcoal/10 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          
          {/* Search Input */}
          <div className="relative flex items-center">
            <Search size={15} className="absolute left-3 text-mutedBrown pointer-events-none" />
            <input
              type="text"
              placeholder="Search reference, customer, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-sm border border-charcoal/20 bg-ivory/40 py-2 pl-9 pr-3 font-body text-xs text-charcoal outline-none focus:border-gold focus:bg-white"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-sm border border-charcoal/20 bg-ivory/40 py-2 px-3 font-body text-xs text-charcoal outline-none focus:border-gold focus:bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no-show">No-Show</option>
            </select>
          </div>

          {/* Specialist Filter */}
          <div>
            <select
              value={staffFilter}
              onChange={(e) => setStaffFilter(e.target.value)}
              className="w-full rounded-sm border border-charcoal/20 bg-ivory/40 py-2 px-3 font-body text-xs text-charcoal outline-none focus:border-gold focus:bg-white"
            >
              <option value="all">All Specialists</option>
              {staffList.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} ({st.role.split('&')[0]})
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full rounded-sm border border-charcoal/20 bg-ivory/40 py-2 px-3 font-body text-xs text-charcoal outline-none focus:border-gold focus:bg-white"
            />
            {dateFilter && (
              <button
                onClick={() => setDateFilter('')}
                className="text-[11px] font-semibold text-gold-deep hover:underline whitespace-nowrap"
              >
                Clear
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-xl border border-charcoal/10 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-gold border-t-transparent" />
            <p className="mt-3 font-body text-xs text-mutedBrown">Updating appointments…</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="py-16 text-center">
            <Calendar className="mx-auto text-taupe mb-2" size={32} />
            <h3 className="font-display text-xl font-medium text-charcoal">No appointments found</h3>
            <p className="mt-1 font-body text-xs text-mutedBrown">
              Try adjusting your date or status filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-body text-xs">
              <thead className="border-b border-charcoal/10 bg-ivory/60 text-mutedBrown uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Reference</th>
                  <th className="py-3 px-4 font-semibold">Customer</th>
                  <th className="py-3 px-4 font-semibold">Treatment</th>
                  <th className="py-3 px-4 font-semibold">Specialist</th>
                  <th className="py-3 px-4 font-semibold">Date &amp; Time</th>
                  <th className="py-3 px-4 font-semibold">Price</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Payment</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal/5">
                {appointments.map((a) => (
                  <tr key={a.id} className="hover:bg-ivory/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-charcoal">
                      {a.ref}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-medium text-charcoal">{a.customerName}</p>
                      <p className="text-[10px] text-mutedBrown">{a.customerPhone}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-medium text-charcoal">{a.serviceName}</p>
                      <span className="text-[10px] text-taupe">{duration(a.durationMin)}</span>
                    </td>
                    <td className="py-3.5 px-4 text-charcoal font-medium">
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
                      <div className="space-y-0.5">
                        <StatusBadge status={a.paymentStatus} />
                        {a.status !== 'cancelled' && a.paymentStatus !== 'paid' && (
                          <span className="text-[10px] text-amber-700 font-semibold block whitespace-nowrap">
                            {money(a.outstandingAmount !== undefined ? a.outstandingAmount : Math.max(0, (a.price || 0) - (a.amountPaid || 0)))} due
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Quick Record Payment button */}
                        {a.status !== 'cancelled' && a.paymentStatus !== 'paid' && (
                          <button
                            type="button"
                            onClick={() => openPaymentModal(a)}
                            className="rounded bg-gold/20 p-1.5 text-gold-deep hover:bg-gold hover:text-charcoal transition-colors"
                            title="Record Payment"
                          >
                            <CreditCard size={15} />
                          </button>
                        )}

                        {/* View Details */}
                        <button
                          type="button"
                          onClick={() => setDetailModalAppt(a)}
                          className="rounded p-1.5 text-charcoal/70 hover:bg-charcoal/10 hover:text-charcoal transition-colors"
                          title="View Details"
                        >
                          <Eye size={15} />
                        </button>

                        {/* Quick Status Dropdown */}
                        <select
                          value={a.status}
                          onChange={(e) => handleStatusChange(a, e.target.value)}
                          className="rounded border border-charcoal/15 bg-white py-1 px-1.5 text-[11px] text-charcoal font-medium outline-none focus:border-gold"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="no-show">No-Show</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Appointment Detail Modal */}
      {detailModalAppt && (
        <AdminModal
          isOpen={!!detailModalAppt}
          onClose={() => setDetailModalAppt(null)}
          title={`Reservation: ${detailModalAppt.ref}`}
          subtitle={`Booked on ${new Date(detailModalAppt.createdAt).toLocaleDateString()}`}
        >
          <div className="space-y-5">
            {/* Customer block */}
            <div className="rounded-lg bg-ivory p-4 border border-charcoal/10">
              <span className="font-body text-[10px] font-semibold uppercase tracking-wider text-gold-deep block">
                Client Information
              </span>
              <p className="mt-1 font-display text-xl font-medium text-charcoal">
                {detailModalAppt.customerName}
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-mutedBrown">
                <p>Phone: <strong className="text-charcoal">{detailModalAppt.customerPhone}</strong></p>
                <p>Email: <strong className="text-charcoal">{detailModalAppt.customerEmail || 'Not provided'}</strong></p>
              </div>
            </div>

            {/* Service & Schedule block */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-charcoal/10 p-3.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-mutedBrown">Treatment</span>
                <p className="font-display text-base font-medium text-charcoal mt-1">{detailModalAppt.serviceName}</p>
                <p className="text-xs text-taupe mt-0.5">{duration(detailModalAppt.durationMin)}</p>
              </div>

              <div className="rounded-lg border border-charcoal/10 p-3.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-mutedBrown">Specialist</span>
                <p className="font-display text-base font-medium text-charcoal mt-1">{detailModalAppt.staffName}</p>
                <p className="text-xs text-taupe mt-0.5">Master Artist</p>
              </div>
            </div>

            {/* Slot & Payment */}
            <dl className="divide-y divide-charcoal/10 border-y border-charcoal/10 py-2 text-xs">
              <div className="flex justify-between py-2.5">
                <dt className="text-mutedBrown">Date &amp; Time Slot</dt>
                <dd className="font-medium text-charcoal">{longDate(detailModalAppt.date)} at {detailModalAppt.time}</dd>
              </div>
              <div className="flex justify-between py-2.5">
                <dt className="text-mutedBrown">Total Price</dt>
                <dd className="font-display text-base font-medium text-charcoal">{money(detailModalAppt.price)}</dd>
              </div>
              <div className="flex justify-between py-2.5">
                <dt className="text-mutedBrown">Amount Paid</dt>
                <dd className="font-medium text-emerald-800">{money(detailModalAppt.amountPaid || 0)}</dd>
              </div>
              <div className="flex justify-between py-2.5">
                <dt className="text-mutedBrown">Remaining Balance</dt>
                <dd className="font-semibold text-amber-800">
                  {money(detailModalAppt.outstandingAmount !== undefined ? detailModalAppt.outstandingAmount : Math.max(0, (detailModalAppt.price || 0) - (detailModalAppt.amountPaid || 0)))}
                </dd>
              </div>
              <div className="flex justify-between py-2.5">
                <dt className="text-mutedBrown">Booking Status</dt>
                <dd><StatusBadge status={detailModalAppt.status} /></dd>
              </div>
              <div className="flex justify-between py-2.5">
                <dt className="text-mutedBrown">Payment Status</dt>
                <dd><StatusBadge status={detailModalAppt.paymentStatus} /></dd>
              </div>
              <div className="flex justify-between py-2.5">
                <dt className="text-mutedBrown">Payment Method</dt>
                <dd className="font-medium text-charcoal">{detailModalAppt.paymentMethod || 'Cash'}</dd>
              </div>
            </dl>

            {detailModalAppt.notes && (
              <div className="rounded bg-ivory/60 p-3 text-xs text-mutedBrown">
                <span className="font-semibold text-charcoal block mb-0.5">Special Requests:</span>
                <p>{detailModalAppt.notes}</p>
              </div>
            )}

            {/* Actions in details */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setRescheduleAppt(detailModalAppt)
                  setNewDate(detailModalAppt.date)
                  setNewTime(detailModalAppt.time)
                  setDetailModalAppt(null)
                }}
                className="inline-flex items-center gap-1.5 rounded-sm border border-charcoal/20 px-3.5 py-2 text-xs font-semibold uppercase tracking-wider text-charcoal hover:bg-charcoal/5"
              >
                <RefreshCw size={13} />
                <span>Reschedule</span>
              </button>

              <div className="flex flex-wrap items-center gap-2">
                {detailModalAppt.status !== 'cancelled' && detailModalAppt.paymentStatus !== 'paid' && (
                  <button
                    type="button"
                    onClick={() => {
                      const target = detailModalAppt
                      setDetailModalAppt(null)
                      openPaymentModal(target)
                    }}
                    className="inline-flex items-center gap-1.5 rounded-sm bg-gold px-3.5 py-2 text-xs font-semibold uppercase tracking-wider text-charcoal hover:bg-gold-hover shadow-sm"
                  >
                    <CreditCard size={14} />
                    <span>Record Payment</span>
                  </button>
                )}

                {detailModalAppt.status !== 'confirmed' && (
                  <button
                    onClick={() => handleStatusChange(detailModalAppt, 'confirmed')}
                    className="rounded-sm bg-blue-600 px-3.5 py-2 text-xs font-semibold uppercase tracking-wider text-white hover:bg-blue-700"
                  >
                    Confirm
                  </button>
                )}
                {detailModalAppt.status !== 'completed' && (
                  <button
                    onClick={() => handleStatusChange(detailModalAppt, 'completed')}
                    className="rounded-sm bg-emerald-700 px-3.5 py-2 text-xs font-semibold uppercase tracking-wider text-white hover:bg-emerald-800"
                  >
                    Complete
                  </button>
                )}
              </div>
            </div>
          </div>
        </AdminModal>
      )}

      {/* Reschedule Modal */}
      {rescheduleAppt && (
        <AdminModal
          isOpen={!!rescheduleAppt}
          onClose={() => setRescheduleAppt(null)}
          title={`Reschedule Booking ${rescheduleAppt.ref}`}
          subtitle={`Current: ${rescheduleAppt.date} at ${rescheduleAppt.time}`}
        >
          <form onSubmit={submitReschedule} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">
                New Date *
              </label>
              <input
                type="date"
                min={todayISO()}
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                required
                className="w-full rounded border border-charcoal/20 p-2.5 text-xs text-charcoal outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">
                New Time Slot *
              </label>
              <select
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                required
                className="w-full rounded border border-charcoal/20 p-2.5 text-xs text-charcoal outline-none focus:border-gold"
              >
                <option value="">Select a time slot</option>
                {['10:00 am', '11:00 am', '11:30 am', '12:00 pm', '01:00 pm', '02:00 pm', '03:00 pm', '04:00 pm', '05:00 pm', '06:00 pm', '07:00 pm'].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-charcoal/10">
              <button
                type="button"
                onClick={() => setRescheduleAppt(null)}
                className="rounded border border-charcoal/20 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-charcoal"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded bg-charcoal px-5 py-2 text-xs font-semibold uppercase tracking-wider text-ivory hover:bg-gold hover:text-charcoal"
              >
                Save New Time
              </button>
            </div>
          </form>
        </AdminModal>
      )}

      {/* New Walk-in / Reservation Modal */}
      <AdminModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New Salon Reservation"
        subtitle="Book a walk-in or telephone client appointment"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">
                Client Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Tariq Mehmood"
                value={newApptForm.customerName}
                onChange={(e) => setNewApptForm({ ...newApptForm, customerName: e.target.value })}
                className="w-full rounded border border-charcoal/20 p-2 text-xs text-charcoal outline-none focus:border-gold"
              />
              {formErr.customerName && <p className="text-[11px] text-rose-600 mt-0.5">{formErr.customerName}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">
                Client Phone *
              </label>
              <input
                type="tel"
                placeholder="0300 1234567"
                value={newApptForm.customerPhone}
                onChange={(e) => setNewApptForm({ ...newApptForm, customerPhone: e.target.value })}
                className="w-full rounded border border-charcoal/20 p-2 text-xs text-charcoal outline-none focus:border-gold"
              />
              {formErr.customerPhone && <p className="text-[11px] text-rose-600 mt-0.5">{formErr.customerPhone}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">
                Select Treatment *
              </label>
              <select
                value={newApptForm.serviceId}
                onChange={(e) => setNewApptForm({ ...newApptForm, serviceId: e.target.value })}
                className="w-full rounded border border-charcoal/20 p-2 text-xs text-charcoal outline-none focus:border-gold"
              >
                <option value="">Select Service</option>
                {servicesList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({money(s.price)})
                  </option>
                ))}
              </select>
              {formErr.serviceId && <p className="text-[11px] text-rose-600 mt-0.5">{formErr.serviceId}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">
                Assigned Specialist *
              </label>
              <select
                value={newApptForm.staffId}
                onChange={(e) => setNewApptForm({ ...newApptForm, staffId: e.target.value })}
                className="w-full rounded border border-charcoal/20 p-2 text-xs text-charcoal outline-none focus:border-gold"
              >
                <option value="">Select Specialist</option>
                {staffList
                  .filter(
                    (s) =>
                      s.status === 'active' &&
                      (!newApptForm.serviceId || !s.serviceIds || s.serviceIds.includes(newApptForm.serviceId))
                  )
                  .map((t) => {
                    const isSpec = newApptForm.serviceId && t.specialtyServiceIds?.includes(newApptForm.serviceId)
                    return (
                      <option key={t.id} value={t.id}>
                        {t.name} {isSpec ? '★ (Signature Specialist)' : `(${t.role.split('&')[0].trim()})`}
                      </option>
                    )
                  })}
              </select>
              {formErr.staffId && <p className="text-[11px] text-rose-600 mt-0.5">{formErr.staffId}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">
                Date *
              </label>
              <input
                type="date"
                min={todayISO()}
                value={newApptForm.date}
                onChange={(e) => setNewApptForm({ ...newApptForm, date: e.target.value })}
                className="w-full rounded border border-charcoal/20 p-2 text-xs text-charcoal outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">
                Time Slot *
              </label>
              <select
                value={newApptForm.time}
                onChange={(e) => setNewApptForm({ ...newApptForm, time: e.target.value })}
                className="w-full rounded border border-charcoal/20 p-2 text-xs text-charcoal outline-none focus:border-gold"
              >
                {['10:00 am', '11:00 am', '11:30 am', '12:00 pm', '01:00 pm', '02:00 pm', '03:00 pm', '04:00 pm', '05:00 pm', '06:00 pm', '07:00 pm'].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">
                Payment Status
              </label>
              <select
                value={newApptForm.paymentStatus}
                onChange={(e) => setNewApptForm({ ...newApptForm, paymentStatus: e.target.value })}
                className="w-full rounded border border-charcoal/20 p-2 text-xs text-charcoal outline-none focus:border-gold"
              >
                <option value="unpaid">Unpaid (Pay after service)</option>
                <option value="paid">Paid in advance</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">
                Payment Method
              </label>
              <select
                value={newApptForm.paymentMethod}
                onChange={(e) => setNewApptForm({ ...newApptForm, paymentMethod: e.target.value })}
                className="w-full rounded border border-charcoal/20 p-2 text-xs text-charcoal outline-none focus:border-gold"
              >
                <option value="Cash">Cash</option>
                <option value="Card">Credit / Debit Card</option>
                <option value="Bank Transfer">Bank Transfer / Raast</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">
              Internal Booking Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Walk-in, client requested quiet booth..."
              value={newApptForm.notes}
              onChange={(e) => setNewApptForm({ ...newApptForm, notes: e.target.value })}
              className="w-full rounded border border-charcoal/20 p-2 text-xs text-charcoal outline-none focus:border-gold resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-charcoal/10">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="rounded border border-charcoal/20 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-charcoal"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded bg-gold px-6 py-2 text-xs font-semibold uppercase tracking-wider text-charcoal hover:bg-gold-hover shadow-sm"
            >
              Create Reservation
            </button>
          </div>
        </form>
      </AdminModal>

      {/* Record Payment Modal */}
      {paymentModalAppt && (
        <AdminModal
          isOpen={!!paymentModalAppt}
          onClose={() => setPaymentModalAppt(null)}
          title={`Record Payment: ${paymentModalAppt.ref}`}
          subtitle={`Client: ${paymentModalAppt.customerName} · Treatment: ${paymentModalAppt.serviceName}`}
        >
          <form onSubmit={handleRecordPaymentSubmit} className="space-y-4">
            {/* Financial Overview Card */}
            <div className="rounded-lg bg-ivory p-4 border border-charcoal/10 grid grid-cols-3 gap-2 text-center">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-mutedBrown block">Price</span>
                <span className="font-display text-base font-medium text-charcoal mt-0.5 block">{money(paymentModalAppt.price)}</span>
              </div>
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 block">Already Paid</span>
                <span className="font-display text-base font-medium text-emerald-800 mt-0.5 block">{money(paymentModalAppt.amountPaid || 0)}</span>
              </div>
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-700 block">Balance Due</span>
                <span className="font-display text-base font-semibold text-amber-800 mt-0.5 block">
                  {money(paymentModalAppt.outstandingAmount !== undefined ? paymentModalAppt.outstandingAmount : Math.max(0, (paymentModalAppt.price || 0) - (paymentModalAppt.amountPaid || 0)))}
                </span>
              </div>
            </div>

            {payErr && (
              <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded" role="alert">{payErr}</p>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">
                Payment Amount (PKR) *
              </label>
              <input
                type="number"
                min="1"
                max={paymentModalAppt.outstandingAmount !== undefined ? paymentModalAppt.outstandingAmount : Math.max(0, (paymentModalAppt.price || 0) - (paymentModalAppt.amountPaid || 0))}
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                required
                className="w-full rounded border border-charcoal/20 p-2.5 text-xs text-charcoal outline-none focus:border-gold font-medium"
              />
              <p className="text-[10px] text-mutedBrown mt-1">
                Supports full balance settlement or partial payment.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">
                Payment Method *
              </label>
              <select
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value)}
                className="w-full rounded border border-charcoal/20 p-2.5 text-xs text-charcoal outline-none focus:border-gold"
              >
                <option value="Cash">Cash Register</option>
                <option value="Card">Credit / Debit Card (POS)</option>
                <option value="Bank Transfer">Bank Transfer / Raast</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">
                Receipt / Audit Note (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Paid at reception counter by cash"
                value={payNotes}
                onChange={(e) => setPayNotes(e.target.value)}
                className="w-full rounded border border-charcoal/20 p-2.5 text-xs text-charcoal outline-none focus:border-gold"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-charcoal/10">
              <button
                type="button"
                onClick={() => setPaymentModalAppt(null)}
                className="rounded border border-charcoal/20 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-charcoal"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={paySubmitting}
                className="rounded bg-gold px-6 py-2 text-xs font-semibold uppercase tracking-wider text-charcoal hover:bg-gold-hover shadow-sm disabled:opacity-50"
              >
                {paySubmitting ? 'Recording…' : 'Record & Settle Payment'}
              </button>
            </div>
          </form>
        </AdminModal>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState({ ...confirmState, isOpen: false })}
        onConfirm={confirmState.action}
        title={confirmState.title}
        message={confirmState.message}
        confirmVariant={confirmState.variant}
      />

    </div>
  )
}

