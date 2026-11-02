import { useEffect, useState } from 'react'
import {
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  Calendar,
  Eye,
  Edit2,
  DollarSign,
  History,
} from 'lucide-react'
import { adminService } from '../services/adminService'
import { money, longDate } from '@/lib/format'
import StatusBadge from '../components/ui/StatusBadge'
import AdminModal from '../components/ui/AdminModal'

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Modals
  const [viewHistoryCust, setViewHistoryCust] = useState(null)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [custForm, setCustForm] = useState({
    name: '',
    email: '',
    phone: '',
    city: "Khairpur Mir's",
    notes: '',
  })
  const [formErr, setFormErr] = useState({})

  const loadData = async () => {
    setLoading(true)
    const [custList, apptList] = await Promise.all([
      adminService.getCustomers(),
      adminService.getAppointments(),
    ])
    setCustomers(custList)
    setAppointments(apptList)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const filteredCustomers = customers.filter((c) => {
    const q = search.toLowerCase()
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.city?.toLowerCase().includes(q)
    )
  })

  // Submit Add Customer
  const handleAddSubmit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!custForm.name.trim()) errs.name = 'Full name required'
    if (!custForm.phone.trim()) errs.phone = 'Mobile number required'

    setFormErr(errs)
    if (Object.keys(errs).length > 0) return

    await adminService.addCustomer(custForm)
    setAddModalOpen(false)
    setCustForm({
      name: '',
      email: '',
      phone: '',
      city: "Khairpur Mir's",
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
            Customer Directory &amp; History
          </h2>
          <p className="font-body text-xs text-mutedBrown">
            Client records, preferences, appointment visit logs, and lifetime spending.
          </p>
        </div>

        <button
          onClick={() => setAddModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-sm bg-charcoal px-4 py-2.5 font-body text-xs font-semibold uppercase tracking-wider text-ivory hover:bg-gold hover:text-charcoal transition-colors self-start sm:self-auto shadow-sm"
        >
          <Plus size={15} />
          <span>Add Client</span>
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="rounded-xl border border-charcoal/10 bg-white p-4 shadow-sm">
        <div className="relative max-w-md">
          <Search size={15} className="absolute left-3 top-2.5 text-mutedBrown pointer-events-none" />
          <input
            type="text"
            placeholder="Search by client name, mobile, email, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-sm border border-charcoal/20 bg-ivory/40 py-2 pl-9 pr-3 font-body text-xs text-charcoal outline-none focus:border-gold focus:bg-white"
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-xl border border-charcoal/10 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-gold border-t-transparent" />
            <p className="mt-3 font-body text-xs text-mutedBrown">Loading customer directory…</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="py-16 text-center">
            <Users className="mx-auto text-taupe mb-2" size={32} />
            <h3 className="font-display text-xl font-medium text-charcoal">No customers found</h3>
            <p className="mt-1 font-body text-xs text-mutedBrown">Try checking your search spelling.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-body text-xs">
              <thead className="border-b border-charcoal/10 bg-ivory/60 text-mutedBrown uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Client Name</th>
                  <th className="py-3 px-4 font-semibold">Contact Info</th>
                  <th className="py-3 px-4 font-semibold">Location</th>
                  <th className="py-3 px-4 font-semibold">Registered</th>
                  <th className="py-3 px-4 font-semibold">Visits</th>
                  <th className="py-3 px-4 font-semibold">Lifetime Spend</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal/5">
                {filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-ivory/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold/20 font-display text-xs font-semibold text-gold-deep">
                          {c.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-charcoal text-sm">{c.name}</p>
                          {c.notes && (
                            <p className="text-[10px] text-taupe line-clamp-1 max-w-xs">{c.notes}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-medium text-charcoal">{c.phone}</p>
                      <p className="text-[10px] text-mutedBrown">{c.email || 'No email'}</p>
                    </td>
                    <td className="py-3.5 px-4 text-charcoal">
                      {c.city || "Khairpur Mir's"}
                    </td>
                    <td className="py-3.5 px-4 text-mutedBrown">
                      {c.registeredAt}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="rounded-full bg-ivory px-2.5 py-0.5 font-semibold text-charcoal border border-charcoal/10">
                        {c.appointmentsCount} bookings
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-display text-sm font-medium text-charcoal whitespace-nowrap">
                      {money(c.totalSpent || 0)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setViewHistoryCust(c)}
                        className="inline-flex items-center gap-1.5 rounded border border-charcoal/15 bg-white px-2.5 py-1 text-xs font-medium text-charcoal hover:border-gold hover:text-gold-deep"
                      >
                        <History size={13} />
                        <span>History</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer History & Notes Drawer/Modal */}
      {viewHistoryCust && (
        <AdminModal
          isOpen={!!viewHistoryCust}
          onClose={() => setViewHistoryCust(null)}
          title={`Client History: ${viewHistoryCust.name}`}
          subtitle={`Member since ${viewHistoryCust.registeredAt} · ${viewHistoryCust.phone}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-6">
            {/* Quick summary stats */}
            <div className="grid grid-cols-3 gap-3 rounded-xl bg-ivory p-4 border border-charcoal/10">
              <div>
                <span className="text-[10px] uppercase font-semibold text-mutedBrown">Total Visits</span>
                <p className="font-display text-2xl font-medium text-charcoal">{viewHistoryCust.appointmentsCount}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-mutedBrown">Total Spent</span>
                <p className="font-display text-2xl font-medium text-charcoal">{money(viewHistoryCust.totalSpent || 0)}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-mutedBrown">Home Branch</span>
                <p className="font-display text-lg font-medium text-charcoal">{viewHistoryCust.city || "Khairpur Mir's"}</p>
              </div>
            </div>

            {/* Special preferences and allergies note */}
            {viewHistoryCust.notes && (
              <div className="rounded-lg border border-gold/40 bg-gold/5 p-3.5 text-xs text-charcoal">
                <span className="font-semibold text-gold-deep block mb-0.5">Styling &amp; Treatment Notes:</span>
                <p>{viewHistoryCust.notes}</p>
              </div>
            )}

            {/* Appointment Visit History */}
            <div>
              <h4 className="font-display text-lg font-medium text-charcoal mb-3">
                Appointment History
              </h4>

              {appointments.filter((a) => a.customerName.toLowerCase() === viewHistoryCust.name.toLowerCase() || a.customerPhone === viewHistoryCust.phone).length === 0 ? (
                <p className="text-xs text-mutedBrown py-4">No historical records on file yet.</p>
              ) : (
                <div className="space-y-2.5 max-h-60 overflow-y-auto">
                  {appointments
                    .filter((a) => a.customerName.toLowerCase() === viewHistoryCust.name.toLowerCase() || a.customerPhone === viewHistoryCust.phone)
                    .map((a) => (
                      <div
                        key={a.id}
                        className="flex items-center justify-between rounded-lg border border-charcoal/10 bg-white p-3 text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-charcoal">{a.ref}</span>
                            <StatusBadge status={a.status} />
                          </div>
                          <p className="font-medium text-charcoal mt-1">{a.serviceName} with {a.staffName}</p>
                          <p className="text-taupe text-[10px] mt-0.5">{longDate(a.date)} at {a.time}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-display text-sm font-medium text-charcoal">{money(a.price)}</p>
                          <StatusBadge status={a.paymentStatus} />
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-charcoal/10">
              <button
                type="button"
                onClick={() => setViewHistoryCust(null)}
                className="rounded bg-charcoal px-5 py-2 text-xs font-semibold uppercase tracking-wider text-ivory"
              >
                Close
              </button>
            </div>
          </div>
        </AdminModal>
      )}

      {/* Add Client Modal */}
      {addModalOpen && (
        <AdminModal
          isOpen={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          title="Register New Salon Client"
          subtitle="Add client contact information and hair/skin preferences"
        >
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">
                Full Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Sana Ahmed"
                value={custForm.name}
                onChange={(e) => setCustForm({ ...custForm, name: e.target.value })}
                className="w-full rounded border border-charcoal/20 p-2 text-xs text-charcoal outline-none focus:border-gold"
              />
              {formErr.name && <p className="text-[11px] text-rose-600 mt-0.5">{formErr.name}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  placeholder="0300 1234567"
                  value={custForm.phone}
                  onChange={(e) => setCustForm({ ...custForm, phone: e.target.value })}
                  className="w-full rounded border border-charcoal/20 p-2 text-xs text-charcoal outline-none focus:border-gold"
                />
                {formErr.phone && <p className="text-[11px] text-rose-600 mt-0.5">{formErr.phone}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="sana@example.com"
                  value={custForm.email}
                  onChange={(e) => setCustForm({ ...custForm, email: e.target.value })}
                  className="w-full rounded border border-charcoal/20 p-2 text-xs text-charcoal outline-none focus:border-gold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">
                City / Location
              </label>
              <input
                type="text"
                placeholder="Khairpur Mir's, Sukkur, etc."
                value={custForm.city}
                onChange={(e) => setCustForm({ ...custForm, city: e.target.value })}
                className="w-full rounded border border-charcoal/20 p-2 text-xs text-charcoal outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">
                Client Preferences &amp; Styling History
              </label>
              <textarea
                rows={3}
                placeholder="Preferred styling specialists, color allergy notes, scalp sensitivity..."
                value={custForm.notes}
                onChange={(e) => setCustForm({ ...custForm, notes: e.target.value })}
                className="w-full rounded border border-charcoal/20 p-2 text-xs text-charcoal outline-none focus:border-gold resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-charcoal/10">
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="rounded border border-charcoal/20 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-charcoal"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded bg-gold px-6 py-2 text-xs font-semibold uppercase tracking-wider text-charcoal hover:bg-gold-hover shadow-sm"
              >
                Save Client
              </button>
            </div>
          </form>
        </AdminModal>
      )}

    </div>
  )
}

