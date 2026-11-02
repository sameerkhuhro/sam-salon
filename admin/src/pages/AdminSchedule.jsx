import { useEffect, useState } from 'react'
import {
  Clock,
  Calendar,
  Save,
  Plus,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'
import { adminService } from '../services/adminService'
import AdminModal from '../components/ui/AdminModal'

export default function AdminSchedule() {
  const [schedule, setSchedule] = useState(null)
  const [staffList, setStaffList] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Leave Modal
  const [leaveModalOpen, setLeaveModalOpen] = useState(false)
  const [leaveForm, setLeaveForm] = useState({
    staffId: '',
    date: '',
    reason: '',
  })

  const loadData = async () => {
    setLoading(true)
    const [sched, staff] = await Promise.all([
      adminService.getSchedule(),
      adminService.getStaff(),
    ])
    setSchedule(sched)
    setStaffList(staff)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  // Update salon day hour
  const handleDayHourChange = (index, field, value) => {
    const updated = [...schedule.salonHours]
    updated[index] = { ...updated[index], [field]: value }
    setSchedule({ ...schedule, salonHours: updated })
  }

  // Toggle Day Closed
  const handleToggleClosed = (index) => {
    const updated = [...schedule.salonHours]
    updated[index].isClosed = !updated[index].isClosed
    setSchedule({ ...schedule, salonHours: updated })
  }

  // Save Salon Opening Hours
  const handleSaveHours = async () => {
    setSaving(true)
    await adminService.updateSalonHours(schedule.salonHours)
    setSaving(false)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  // Submit Leave
  const handleAddLeave = async (e) => {
    e.preventDefault()
    if (!leaveForm.staffId || !leaveForm.date) return

    const staffMember = staffList.find((s) => s.id === leaveForm.staffId)
    await adminService.addStaffLeave({
      staffId: leaveForm.staffId,
      staffName: staffMember?.name || 'Specialist',
      date: leaveForm.date,
      reason: leaveForm.reason || 'Requested Off',
    })

    setLeaveModalOpen(false)
    setLeaveForm({ staffId: '', date: '', reason: '' })
    await loadData()
  }

  if (loading || !schedule) {
    return (
      <div className="py-20 text-center">
        <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-gold border-t-transparent" />
        <p className="mt-3 font-body text-xs text-mutedBrown">Loading salon schedule &amp; shift calendar…</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div>
        <h2 className="font-display text-2xl font-medium text-charcoal">
          Schedule, Hours &amp; Specialist Availability
        </h2>
        <p className="font-body text-xs text-mutedBrown">
          Configure master salon operational hours, staff shift coverage, and leaves.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        
        {/* Salon Operating Hours Card */}
        <div className="rounded-2xl border border-charcoal/10 bg-white p-6 shadow-sm lg:col-span-7">
          <div className="flex items-center justify-between border-b border-charcoal/10 pb-4">
            <div>
              <h3 className="font-display text-xl font-medium text-charcoal">
                Weekly Salon Operating Hours
              </h3>
              <p className="font-body text-xs text-mutedBrown">
                Public booking slots will strictly follow these opening hours
              </p>
            </div>

            <button
              onClick={handleSaveHours}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-sm bg-charcoal px-4 py-2 font-body text-xs font-semibold uppercase tracking-wider text-ivory hover:bg-gold hover:text-charcoal transition-colors disabled:opacity-50"
            >
              <Save size={13} />
              <span>{saving ? 'Saving…' : 'Save Hours'}</span>
            </button>
          </div>

          {saveSuccess && (
            <div className="mt-4 rounded-lg bg-emerald-50 border border-emerald-200 p-2.5 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 size={15} />
              <span>Operating hours updated successfully.</span>
            </div>
          )}

          <div className="mt-6 divide-y divide-charcoal/5 font-body text-xs">
            {schedule.salonHours.map((sh, idx) => (
              <div
                key={sh.day}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 gap-2"
              >
                <div className="w-28 font-medium text-charcoal">
                  {sh.day}
                </div>

                <div className="flex items-center gap-3">
                  {sh.isClosed ? (
                    <span className="font-semibold text-rose-700 italic py-1">
                      Closed for the day
                    </span>
                  ) : (
                    <>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-mutedBrown">Open:</span>
                        <input
                          type="time"
                          value={sh.open}
                          onChange={(e) => handleDayHourChange(idx, 'open', e.target.value)}
                          className="rounded border border-charcoal/20 bg-ivory/40 p-1 text-xs text-charcoal outline-none"
                        />
                      </div>
                      <span className="text-taupe">—</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-mutedBrown">Close:</span>
                        <input
                          type="time"
                          value={sh.close}
                          onChange={(e) => handleDayHourChange(idx, 'close', e.target.value)}
                          className="rounded border border-charcoal/20 bg-ivory/40 p-1 text-xs text-charcoal outline-none"
                        />
                      </div>
                    </>
                  )}
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => handleToggleClosed(idx)}
                    className={`rounded px-2.5 py-1 text-[11px] font-semibold tracking-wider uppercase transition-colors ${
                      sh.isClosed
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-charcoal/5 text-charcoal hover:bg-rose-50 hover:text-rose-700'
                    }`}
                  >
                    {sh.isClosed ? 'Mark Open' : 'Mark Closed'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-lg bg-ivory p-4 border border-charcoal/10 text-xs text-mutedBrown space-y-1">
            <p><strong>Note on Friday Hours:</strong> Friday opening time defaults to 2:00 pm (14:00) in respect of Juma prayers in Khairpur Mir's.</p>
          </div>
        </div>

        {/* Staff Shift Coverage & Leaves */}
        <div className="space-y-6 lg:col-span-5">
          
          {/* Shift Coverage Overview */}
          <div className="rounded-2xl border border-charcoal/10 bg-white p-6 shadow-sm">
            <h3 className="font-display text-xl font-medium text-charcoal mb-4">
              Specialist Shift Coverage
            </h3>

            <div className="space-y-3 font-body text-xs">
              {staffList.filter((s) => s.status === 'active').map((st) => (
                <div key={st.id} className="rounded-lg border border-charcoal/10 p-3 bg-ivory/30">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-charcoal">{st.name}</p>
                    <span className="text-gold-deep text-[11px] font-semibold">{st.role.split('&')[0]}</span>
                  </div>
                  <p className="text-[11px] text-mutedBrown mt-1">
                    Shift: <strong>{st.schedule?.shiftStart} - {st.schedule?.shiftEnd}</strong>
                  </p>
                  <p className="text-[10px] text-taupe mt-0.5">
                    Days on: {st.schedule?.days?.join(', ')}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Leave & Time-off Management */}
          <div className="rounded-2xl border border-charcoal/10 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-charcoal/10 pb-3">
              <h3 className="font-display text-xl font-medium text-charcoal">
                Leave &amp; Time-off Log
              </h3>
              <button
                onClick={() => setLeaveModalOpen(true)}
                className="inline-flex items-center gap-1 rounded border border-charcoal/20 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-charcoal hover:bg-gold hover:text-charcoal"
              >
                <Plus size={12} />
                <span>Log Leave</span>
              </button>
            </div>

            <div className="mt-4 space-y-2.5 font-body text-xs">
              {schedule.leaves.length === 0 ? (
                <p className="text-mutedBrown text-xs py-2">No active approved leaves recorded.</p>
              ) : (
                schedule.leaves.map((l) => (
                  <div key={l.id} className="flex items-center justify-between rounded border border-charcoal/10 p-2.5 bg-white">
                    <div>
                      <p className="font-medium text-charcoal">{l.staffName}</p>
                      <p className="text-[11px] text-mutedBrown">{l.reason} · {l.date}</p>
                    </div>
                    <span className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 uppercase">
                      {l.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Log Staff Leave Modal */}
      {leaveModalOpen && (
        <AdminModal
          isOpen={leaveModalOpen}
          onClose={() => setLeaveModalOpen(false)}
          title="Log Specialist Leave / Time-off"
          subtitle="Block out specialist calendar for scheduled absence"
        >
          <form onSubmit={handleAddLeave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">
                Select Specialist *
              </label>
              <select
                required
                value={leaveForm.staffId}
                onChange={(e) => setLeaveForm({ ...leaveForm, staffId: e.target.value })}
                className="w-full rounded border border-charcoal/20 p-2 text-xs text-charcoal outline-none focus:border-gold"
              >
                <option value="">Choose specialist...</option>
                {staffList.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">
                Leave Date *
              </label>
              <input
                type="date"
                required
                value={leaveForm.date}
                onChange={(e) => setLeaveForm({ ...leaveForm, date: e.target.value })}
                className="w-full rounded border border-charcoal/20 p-2 text-xs text-charcoal outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">
                Reason / Note
              </label>
              <input
                type="text"
                placeholder="Personal leave, medical, training..."
                value={leaveForm.reason}
                onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                className="w-full rounded border border-charcoal/20 p-2 text-xs text-charcoal outline-none focus:border-gold"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-charcoal/10">
              <button
                type="button"
                onClick={() => setLeaveModalOpen(false)}
                className="rounded border border-charcoal/20 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-charcoal"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded bg-gold px-6 py-2 text-xs font-semibold uppercase tracking-wider text-charcoal hover:bg-gold-hover shadow-sm"
              >
                Confirm Leave
              </button>
            </div>
          </form>
        </AdminModal>
      )}

    </div>
  )
}

