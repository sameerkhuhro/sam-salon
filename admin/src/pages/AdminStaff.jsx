/**
 * SalonHub Admin Portal — Staff & Specialist Management
 * Full service assignment, signature specialties designation, and working availability.
 */

import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  UserCheck,
  Plus,
  Search,
  Mail,
  Phone,
  Calendar,
  Clock,
  Edit2,
  Power,
  Eye,
  CheckCircle2,
  XCircle,
  Star,
  Scissors,
  Filter,
  Sparkles,
  Check,
  AlertCircle,
  X,
  ExternalLink,
} from 'lucide-react'
import { adminService } from '../services/adminService'
import { money, duration } from '@/lib/format'
import StatusBadge from '../components/ui/StatusBadge'
import AdminModal from '../components/ui/AdminModal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import ImageUpload from '../components/ui/ImageUpload'

export default function AdminStaff() {
  const [staff, setStaff] = useState([])
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)

  // Leave Management State
  const [leaveDate, setLeaveDate] = useState('')
  const [leaveReason, setLeaveReason] = useState('')
  const [leaveSubmitting, setLeaveSubmitting] = useState(false)

  // Filters
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [serviceFilter, setServiceFilter] = useState('all')
  const [specialtyFilter, setSpecialtyFilter] = useState('all')

  // Modals
  const [editModalStaff, setEditModalStaff] = useState(null)
  const [isNewStaff, setIsNewStaff] = useState(false)
  const [staffForm, setStaffForm] = useState({
    id: '',
    name: '',
    role: '',
    email: '',
    phone: '',
    years: 5,
    bio: '',
    avatar: '',
    avatarPublicId: '',
    status: 'active',
    isFeatured: false,
    featuredOrder: 1,
    serviceIds: [],
    specialtyServiceIds: [],
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    shiftStart: '10:00',
    shiftEnd: '19:00',
    breakTime: '13:00 - 14:00',
  })
  const [formErrors, setFormErrors] = useState({})

  // Inside Modal: Service search & category filter
  const [serviceSearch, setServiceSearch] = useState('')
  const [serviceCatFilter, setServiceCatFilter] = useState('All')

  const [viewDetailStaff, setViewDetailStaff] = useState(null)
  const [confirmToggle, setConfirmToggle] = useState({
    isOpen: false,
    staff: null,
  })

  const loadData = async () => {
    setLoading(true)
    const [staffList, serviceList] = await Promise.all([
      adminService.getStaff(),
      adminService.getServices(),
    ])
    setStaff(staffList)
    setServices(serviceList)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  // Helper to resolve specialty services for a staff member
  const getStaffSpecialties = (st) => {
    if (!st) return []
    if (st.specialtyServiceIds && st.specialtyServiceIds.length > 0) {
      return st.specialtyServiceIds
        .map((id) => services.find((s) => s.id === id))
        .filter(Boolean)
    }
    // Fallback if legacy specialties strings exist
    if (st.specialties && st.specialties.length > 0) {
      return st.specialties.map((name) => ({ id: name, name, category: 'General' }))
    }
    return []
  }

  // Helper to resolve all assigned services for a staff member
  const getStaffAssignedServices = (st) => {
    if (!st || !st.serviceIds) return []
    return st.serviceIds
      .map((id) => services.find((s) => s.id === id))
      .filter(Boolean)
  }

  // Filtered staff list
  const filteredStaff = useMemo(() => {
    return staff.filter((s) => {
      const q = search.toLowerCase().trim()

      const assignedNames = (s.serviceIds || [])
        .map((id) => services.find((svc) => svc.id === id)?.name || '')
        .join(' ')
        .toLowerCase()
      const specialtyNames = (s.specialtyServiceIds || [])
        .map((id) => services.find((svc) => svc.id === id)?.name || '')
        .join(' ')
        .toLowerCase()
      const legacySpecialties = (s.specialties || []).join(' ').toLowerCase()

      const matchesQuery =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.role.toLowerCase().includes(q) ||
        assignedNames.includes(q) ||
        specialtyNames.includes(q) ||
        legacySpecialties.includes(q)

      const matchesStatus = statusFilter === 'all' || s.status === statusFilter

      const matchesService =
        serviceFilter === 'all' ||
        (s.serviceIds && s.serviceIds.includes(serviceFilter))

      const matchesSpecialty =
        specialtyFilter === 'all'
          ? true
          : specialtyFilter === 'specialists_only'
          ? s.specialtyServiceIds && s.specialtyServiceIds.length > 0
          : s.specialtyServiceIds && s.specialtyServiceIds.includes(specialtyFilter)

      return matchesQuery && matchesStatus && matchesService && matchesSpecialty
    })
  }, [staff, services, search, statusFilter, serviceFilter, specialtyFilter])

  // Homepage featured calculations (max 4 active specialists)
  const featuredStaffList = useMemo(() => {
    return staff.filter((s) => s.isFeatured && s.status === 'active')
  }, [staff])
  const featuredCount = featuredStaffList.length

  // Quick toggle featured status directly from card
  const handleToggleStaffFeatured = async (st) => {
    if (st.status !== 'active') {
      alert('Only active staff members can be featured on the homepage.')
      return
    }

    if (!st.isFeatured) {
      if (featuredCount >= 4) {
        alert('Maximum of 4 featured staff members reached. Please unfeature a staff member before adding another.')
        return
      }
      try {
        await adminService.toggleStaffFeatured(st.id, true, featuredCount + 1)
        await loadData()
      } catch (err) {
        alert(err.message || 'Failed to feature staff member.')
      }
    } else {
      try {
        await adminService.toggleStaffFeatured(st.id, false)
        await loadData()
      } catch (err) {
        alert(err.message || 'Failed to unfeature staff member.')
      }
    }
  }

  // Handle modal featured checkbox change with limit enforcement
  const handleFeaturedCheckboxChange = (checked) => {
    if (checked) {
      if (staffForm.status !== 'active') {
        alert('Only active staff members can be featured on the homepage.')
        return
      }
      const wasAlreadyFeatured = !isNewStaff && editModalStaff?.isFeatured
      if (!wasAlreadyFeatured && featuredCount >= 4) {
        alert('Maximum of 4 featured staff members reached. Please unfeature a staff member before adding another.')
        return
      }
      setStaffForm({
        ...staffForm,
        isFeatured: true,
        featuredOrder: staffForm.featuredOrder || Math.min(featuredCount + 1, 4),
      })
    } else {
      setStaffForm({
        ...staffForm,
        isFeatured: false,
      })
    }
  }

  // Open Add Modal
  const openAddModal = () => {
    setIsNewStaff(true)
    setStaffForm({
      name: '',
      role: '',
      email: '',
      phone: '',
      years: 4,
      bio: '',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      avatarPublicId: '',
      status: 'active',
      isFeatured: false,
      featuredOrder: Math.min(featuredCount + 1, 4),
      serviceIds: services.slice(0, 3).map((s) => s.id),
      specialtyServiceIds: services.length > 0 ? [services[0].id] : [],
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Saturday'],
      shiftStart: '10:00',
      shiftEnd: '19:00',
      breakTime: '13:00 - 14:00',
    })
    setServiceSearch('')
    setServiceCatFilter('All')
    setFormErrors({})
    setEditModalStaff(true)
  }

  // Open Edit Modal
  const openEditModal = (st) => {
    setIsNewStaff(false)
    setStaffForm({
      id: st.id,
      name: st.name,
      role: st.role,
      email: st.email || '',
      phone: st.phone || '',
      years: st.years || 1,
      bio: st.bio || '',
      avatar: st.avatar || '',
      avatarPublicId: st.avatarPublicId || '',
      status: st.status || 'active',
      isFeatured: Boolean(st.isFeatured),
      featuredOrder: st.featuredOrder || 1,
      serviceIds: st.serviceIds || [],
      specialtyServiceIds: st.specialtyServiceIds || [],
      days: st.schedule?.days || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      shiftStart: st.schedule?.shiftStart || '10:00',
      shiftEnd: st.schedule?.shiftEnd || '19:00',
      breakTime: st.schedule?.breakTime || '13:00 - 14:00',
    })
    setServiceSearch('')
    setServiceCatFilter('All')
    setFormErrors({})
    setEditModalStaff(st)
  }

  // Submit Add / Edit
  const handleFormSubmit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!staffForm.name.trim()) errs.name = 'Full name is required'
    if (!staffForm.role.trim()) errs.role = 'Role title is required'
    if (!staffForm.phone.trim()) errs.phone = 'Contact number is required'

    // Clean specialtyServiceIds to guarantee subset of serviceIds
    const validatedSpecialties = staffForm.specialtyServiceIds.filter((sid) =>
      staffForm.serviceIds.includes(sid)
    )

    setFormErrors(errs)
    if (Object.keys(errs).length > 0) return

    const schedule = {
      days: staffForm.days,
      shiftStart: staffForm.shiftStart,
      shiftEnd: staffForm.shiftEnd,
      breakTime: staffForm.breakTime,
    }

    const payload = {
      ...staffForm,
      isFeatured: staffForm.status === 'active' ? Boolean(staffForm.isFeatured) : false,
      featuredOrder: Number(staffForm.featuredOrder) || 1,
      specialtyServiceIds: validatedSpecialties,
      schedule,
    }

    if (isNewStaff) {
      await adminService.addStaff(payload)
    } else {
      await adminService.updateStaff(staffForm.id, payload)
    }

    setEditModalStaff(null)
    await loadData()
  }

  // Toggle Day selection helper
  const toggleDay = (day) => {
    if (staffForm.days.includes(day)) {
      setStaffForm({ ...staffForm, days: staffForm.days.filter((d) => d !== day) })
    } else {
      setStaffForm({ ...staffForm, days: [...staffForm.days, day] })
    }
  }

  // Toggle Service assignment checkbox
  const toggleServiceAssignment = (serviceId) => {
    const isAssigned = staffForm.serviceIds.includes(serviceId)
    if (isAssigned) {
      // Unassign: also remove from specialties automatically
      setStaffForm({
        ...staffForm,
        serviceIds: staffForm.serviceIds.filter((id) => id !== serviceId),
        specialtyServiceIds: staffForm.specialtyServiceIds.filter((id) => id !== serviceId),
      })
    } else {
      // Assign service
      setStaffForm({
        ...staffForm,
        serviceIds: [...staffForm.serviceIds, serviceId],
      })
    }
  }

  // Toggle Specialty star marker
  const toggleSpecialtyMark = (serviceId, e) => {
    if (e) e.stopPropagation()
    // Cannot be specialty unless assigned
    if (!staffForm.serviceIds.includes(serviceId)) return

    const isSpecialty = staffForm.specialtyServiceIds.includes(serviceId)
    if (isSpecialty) {
      setStaffForm({
        ...staffForm,
        specialtyServiceIds: staffForm.specialtyServiceIds.filter((id) => id !== serviceId),
      })
    } else {
      setStaffForm({
        ...staffForm,
        specialtyServiceIds: [...staffForm.specialtyServiceIds, serviceId],
      })
    }
  }

  // Select all visible services in modal
  const handleSelectAllVisibleServices = (visibleList) => {
    const visibleIds = visibleList.map((s) => s.id)
    const merged = Array.from(new Set([...staffForm.serviceIds, ...visibleIds]))
    setStaffForm({ ...staffForm, serviceIds: merged })
  }

  // Deselect all visible services in modal
  const handleDeselectAllVisibleServices = (visibleList) => {
    const visibleIds = new Set(visibleList.map((s) => s.id))
    const filtered = staffForm.serviceIds.filter((id) => !visibleIds.has(id))
    const filteredSpecialties = staffForm.specialtyServiceIds.filter((id) => !visibleIds.has(id))
    setStaffForm({
      ...staffForm,
      serviceIds: filtered,
      specialtyServiceIds: filteredSpecialties,
    })
  }

  // Handle Status Toggle (Activate/Deactivate)
  const confirmToggleStatus = async () => {
    if (!confirmToggle.staff) return
    await adminService.toggleStaffStatus(confirmToggle.staff.id)
    setConfirmToggle({ isOpen: false, staff: null })
    await loadData()
  }

  const allWeekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const serviceCategories = ['All', 'Hair', 'Grooming', 'Skin', 'Colour', 'Nails', 'Relax']

  // Filtered services for the modal assignment list
  const modalFilteredServices = services.filter((s) => {
    const q = serviceSearch.toLowerCase().trim()
    const matchesSearch =
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q)
    const matchesCat = serviceCatFilter === 'All' || s.category === serviceCatFilter
    return matchesSearch && matchesCat
  })

  const hasActiveFilters =
    search ||
    statusFilter !== 'all' ||
    serviceFilter !== 'all' ||
    specialtyFilter !== 'all'

  const resetFilters = () => {
    setSearch('')
    setStatusFilter('all')
    setServiceFilter('all')
    setSpecialtyFilter('all')
  }

  return (
    <div className="space-y-6">
      
      {/* Header & Add Action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-display text-2xl font-medium text-charcoal">
              Staff &amp; Master Specialists
            </h2>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-body text-xs font-semibold ${
                featuredCount >= 4
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-gold/15 text-charcoal border border-gold/40'
              }`}
              title="Only up to 4 active specialists appear on the homepage"
            >
              <Star size={13} className="fill-gold text-gold" />
              <span>
                Featured on Homepage: <strong>{featuredCount} of 4 slots used</strong>
              </span>
            </span>
          </div>
          <p className="font-body text-xs text-mutedBrown mt-1">
            Manage salon team members, working shifts, services assigned, and homepage featured showcase.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 rounded-sm bg-charcoal px-4 py-2.5 font-body text-xs font-semibold uppercase tracking-wider text-ivory hover:bg-gold hover:text-charcoal transition-colors self-start sm:self-auto shadow-sm"
        >
          <Plus size={15} />
          <span>Add Specialist</span>
        </button>
      </div>

      {/* Advanced Filter Toolbar */}
      <div className="flex flex-col gap-3 rounded-xl border border-charcoal/10 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          
          {/* Search Input */}
          <div className="relative md:col-span-1">
            <Search size={15} className="absolute left-3 top-2.5 text-mutedBrown pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name, role, service, or specialty..."
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
              className="w-full rounded-sm border border-charcoal/20 bg-ivory/40 py-2 px-3 font-body text-xs text-charcoal outline-none focus:border-gold"
            >
              <option value="all">All Statuses (Active &amp; Inactive)</option>
              <option value="active">Active Only (Available for Booking)</option>
              <option value="inactive">Inactive Only (Paused / Leave)</option>
            </select>
          </div>

          {/* Filter by Assigned Service */}
          <div>
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="w-full rounded-sm border border-charcoal/20 bg-ivory/40 py-2 px-3 font-body text-xs text-charcoal outline-none focus:border-gold"
            >
              <option value="all">Filter by Service: All Services</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  Qualified: {s.name} ({s.category})
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Specialty */}
          <div className="flex items-center gap-2">
            <select
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
              className="flex-1 rounded-sm border border-charcoal/20 bg-ivory/40 py-2 px-3 font-body text-xs text-charcoal outline-none focus:border-gold"
            >
              <option value="all">Filter by Specialty: All</option>
              <option value="specialists_only">★ Any Signature Specialist</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  ★ Specializes in: {s.name}
                </option>
              ))}
            </select>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="shrink-0 rounded p-2 text-mutedBrown hover:text-rose-600 hover:bg-rose-50"
                title="Reset all filters"
                aria-label="Reset all filters"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Filter Summary */}
        <div className="flex items-center justify-between pt-2 border-t border-charcoal/5 font-body text-[11px] text-mutedBrown">
          <span>
            Showing <strong>{filteredStaff.length}</strong> of <strong>{staff.length}</strong> specialists
          </span>
          {hasActiveFilters && (
            <span className="text-gold-deep font-medium">Filtered view active</span>
          )}
        </div>
      </div>

      {/* Staff Grid Cards */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-gold border-t-transparent" />
          <p className="mt-3 font-body text-xs text-mutedBrown">Loading specialist directory…</p>
        </div>
      ) : filteredStaff.length === 0 ? (
        <div className="rounded-xl border border-charcoal/10 bg-white p-12 text-center">
          <UserCheck className="mx-auto text-taupe mb-2" size={32} />
          <h3 className="font-display text-xl font-medium text-charcoal">No staff members found</h3>
          <p className="mt-1 font-body text-xs text-mutedBrown">
            Try adjusting your service or specialty filters, or clear your search query.
          </p>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="mt-3 inline-flex items-center gap-1.5 rounded bg-charcoal px-4 py-2 font-body text-xs font-semibold text-ivory hover:bg-gold hover:text-charcoal"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {filteredStaff.map((st) => {
            const specialtiesList = getStaffSpecialties(st)
            const assignedCount = st.serviceIds?.length || 0

            return (
              <div
                key={st.id}
                className={`flex flex-col justify-between rounded-2xl border bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md ${
                  st.status === 'active'
                    ? 'border-charcoal/10'
                    : 'border-dashed border-charcoal/25 bg-ivory/10 opacity-75'
                }`}
              >
                <div>
                  {/* Photo & Status Header */}
                  <div className="flex items-start justify-between">
                    <div className="relative">
                      <img
                        src={st.avatar}
                        alt={st.name}
                        className="h-16 w-16 rounded-full object-cover border-2 border-gold/40 shadow-sm"
                      />
                      <span
                        className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white ${
                          st.status === 'active' ? 'bg-emerald-500' : 'bg-gray-400'
                        }`}
                        title={st.status === 'active' ? 'Active' : 'Inactive'}
                      />
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <StatusBadge status={st.status} />
                      {st.isFeatured && st.status === 'active' && (
                        <span className="inline-flex items-center gap-1 rounded bg-amber-500/15 border border-amber-500/40 px-2 py-0.5 text-[10px] font-bold text-amber-900 shadow-2xs">
                          <Star size={10} className="fill-amber-500 text-amber-500" />
                          <span>Featured #{st.featuredOrder || 1}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Name & Role */}
                  <div className="mt-4">
                    <h3 className="font-display text-xl font-medium text-charcoal leading-tight">
                      {st.name}
                    </h3>
                    <p className="font-body text-xs font-semibold text-gold-deep mt-0.5">
                      {st.role}
                    </p>
                    <p className="font-body text-[11px] text-taupe mt-0.5">
                      {st.years} Years Experience
                    </p>
                  </div>

                  {/* Signature Specialties (Highlighted) */}
                  <div className="mt-3">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-mutedBrown block mb-1">
                      Signature Specialties
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {specialtiesList.length > 0 ? (
                        specialtiesList.map((spec) => (
                          <span
                            key={spec.id || spec.name}
                            className="inline-flex items-center gap-1 rounded bg-gold/15 border border-gold/40 px-2 py-0.5 font-body text-[10px] font-semibold text-charcoal shadow-2xs"
                            title={`Specializes in ${spec.name}`}
                          >
                            <Star size={10} className="fill-gold text-gold shrink-0" />
                            <span className="truncate max-w-[140px]">{spec.name}</span>
                          </span>
                        ))
                      ) : (
                        <span className="font-body text-[11px] text-taupe italic">
                          No specialties designated
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Assigned Services Count Pill */}
                  <div className="mt-3 flex items-center justify-between text-[11px] text-mutedBrown bg-ivory/60 rounded px-2.5 py-1.5 border border-charcoal/5">
                    <span className="flex items-center gap-1.5">
                      <Scissors size={12} className="text-gold" />
                      <span>Assigned Services</span>
                    </span>
                    <span className="font-semibold text-charcoal">
                      {assignedCount} Treatments
                    </span>
                  </div>

                  {/* Contact info */}
                  <div className="mt-4 space-y-1.5 border-t border-charcoal/5 pt-3 font-body text-xs text-mutedBrown">
                    <div className="flex items-center gap-2 truncate">
                      <Phone size={13} className="text-gold shrink-0" />
                      <span className="truncate">{st.phone || 'Phone unlisted'}</span>
                    </div>
                    <div className="flex items-center gap-2 truncate">
                      <Mail size={13} className="text-gold shrink-0" />
                      <span className="truncate">{st.email || 'Email unlisted'}</span>
                    </div>
                    <div className="flex items-center gap-2 truncate">
                      <Clock size={13} className="text-gold shrink-0" />
                      <span className="truncate">
                        {st.schedule?.shiftStart} - {st.schedule?.shiftEnd}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex items-center justify-between border-t border-charcoal/10 pt-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewDetailStaff(st)}
                      className="inline-flex items-center gap-1 font-body text-xs font-semibold text-charcoal hover:text-gold-deep"
                    >
                      <Eye size={13} />
                      <span>Dossier</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleStaffFeatured(st)}
                      className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-semibold transition-colors ${
                        st.isFeatured && st.status === 'active'
                          ? 'bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300'
                          : 'bg-ivory hover:bg-gold/20 text-charcoal/70 hover:text-charcoal border border-charcoal/15'
                      }`}
                      title={
                        st.isFeatured
                          ? `Featured as Position #${st.featuredOrder || 1} on homepage. Click to unfeature.`
                          : 'Feature on homepage (max 4)'
                      }
                    >
                      <Star size={11} className={st.isFeatured && st.status === 'active' ? 'fill-amber-500 text-amber-500' : 'text-taupe'} />
                      <span>{st.isFeatured && st.status === 'active' ? 'Featured' : 'Feature'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(st)}
                      className="rounded p-1.5 text-charcoal/70 hover:bg-charcoal/10 hover:text-charcoal"
                      title="Edit Specialist"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() =>
                        setConfirmToggle({
                          isOpen: true,
                          staff: st,
                        })
                      }
                      className={`rounded p-1.5 ${
                        st.status === 'active'
                          ? 'text-rose-600 hover:bg-rose-50'
                          : 'text-emerald-700 hover:bg-emerald-50'
                      }`}
                      title={st.status === 'active' ? 'Deactivate Specialist' : 'Activate Specialist'}
                    >
                      <Power size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Staff Profile Dossier Modal */}
      {viewDetailStaff && (
        <AdminModal
          isOpen={!!viewDetailStaff}
          onClose={() => setViewDetailStaff(null)}
          title={`Staff Dossier: ${viewDetailStaff.name}`}
          subtitle={viewDetailStaff.role}
        >
          <div className="space-y-6">
            {/* Header / Avatar */}
            <div className="flex items-center gap-4">
              <img
                src={viewDetailStaff.avatar}
                alt={viewDetailStaff.name}
                className="h-20 w-20 rounded-full object-cover border-2 border-gold/40 shadow-sm"
              />
              <div>
                <h4 className="font-display text-2xl font-medium text-charcoal">
                  {viewDetailStaff.name}
                </h4>
                <p className="font-body text-xs text-gold-deep font-semibold">{viewDetailStaff.role}</p>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge status={viewDetailStaff.status} />
                  <span className="font-body text-xs text-mutedBrown">
                    {viewDetailStaff.years} yrs salon experience
                  </span>
                </div>
              </div>
            </div>

            {viewDetailStaff.bio && (
              <div className="rounded-lg bg-ivory p-4 border border-charcoal/10 text-xs font-body text-mutedBrown leading-relaxed">
                <span className="font-semibold text-charcoal block mb-1">Biography &amp; Style Philosophy</span>
                {viewDetailStaff.bio}
              </div>
            )}

            {/* Weekly Schedule */}
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-charcoal block mb-2">
                Weekly Active Shifts
              </span>
              <div className="flex flex-wrap gap-1.5">
                {allWeekdays.map((day) => {
                  const isWorking = viewDetailStaff.schedule?.days?.includes(day)
                  return (
                    <span
                      key={day}
                      className={`rounded px-2.5 py-1 text-[11px] font-body font-medium ${
                        isWorking ? 'bg-charcoal text-ivory' : 'bg-gray-100 text-gray-400 line-through'
                      }`}
                    >
                      {day}
                    </span>
                  )
                })}
              </div>
              <p className="mt-2 text-xs text-mutedBrown">
                Shift: <strong>{viewDetailStaff.schedule?.shiftStart} - {viewDetailStaff.schedule?.shiftEnd}</strong> (Break: {viewDetailStaff.schedule?.breakTime})
              </p>
            </div>

            {/* Scheduled Leaves & Time Off */}
            <div className="border-t border-charcoal/10 pt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-charcoal flex items-center gap-1.5">
                  <Calendar size={13} className="text-gold" />
                  <span>Scheduled Leaves &amp; Time Off</span>
                </span>
                <span className="text-[11px] text-mutedBrown">
                  {(viewDetailStaff.leaves || []).length} scheduled
                </span>
              </div>

              {/* Add Leave Input Row */}
              <div className="flex flex-wrap items-center gap-2 mb-3 bg-ivory/60 p-2.5 rounded-lg border border-charcoal/10">
                <input
                  type="date"
                  value={leaveDate}
                  onChange={(e) => setLeaveDate(e.target.value)}
                  className="rounded border border-charcoal/20 px-2 py-1 text-xs text-charcoal outline-none focus:border-gold"
                />
                <input
                  type="text"
                  placeholder="Reason (e.g. Annual Leave, Family Event)"
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  className="flex-1 min-w-[140px] rounded border border-charcoal/20 px-2 py-1 text-xs text-charcoal outline-none focus:border-gold"
                />
                <button
                  type="button"
                  disabled={!leaveDate || leaveSubmitting}
                  onClick={async () => {
                    if (!leaveDate) return
                    setLeaveSubmitting(true)
                    try {
                      const updatedLeaves = await adminService.addStaffLeave(
                        viewDetailStaff.id,
                        leaveDate,
                        leaveReason
                      )
                      setViewDetailStaff({ ...viewDetailStaff, leaves: updatedLeaves })
                      setLeaveDate('')
                      setLeaveReason('')
                      await loadData()
                    } catch (err) {
                      alert(err.message || 'Failed to schedule leave')
                    } finally {
                      setLeaveSubmitting(false)
                    }
                  }}
                  className="rounded bg-charcoal px-3 py-1 text-xs font-medium text-ivory hover:bg-gold-deep disabled:opacity-50 transition"
                >
                  {leaveSubmitting ? 'Adding...' : 'Add Leave'}
                </button>
              </div>

              {/* List of Leaves */}
              {(viewDetailStaff.leaves || []).length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {viewDetailStaff.leaves.map((l) => (
                    <div
                      key={l._id || l.id || l.date}
                      className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-800 px-2.5 py-1 rounded-full text-xs"
                    >
                      <span>
                        <strong>{l.date}</strong>: {l.reason}
                      </span>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            const updatedLeaves = await adminService.deleteStaffLeave(
                              viewDetailStaff.id,
                              l._id || l.id
                            )
                            setViewDetailStaff({ ...viewDetailStaff, leaves: updatedLeaves })
                            await loadData()
                          } catch (err) {
                            alert(err.message || 'Failed to remove leave')
                          }
                        }}
                        className="text-rose-600 hover:text-rose-900 ml-1 font-bold text-sm"
                        title="Remove leave"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-mutedBrown italic">No upcoming leaves scheduled for this specialist.</p>
              )}
            </div>

            {/* Dedicated Services & Specialties Section */}
            <div className="border-t border-charcoal/10 pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-charcoal flex items-center gap-2">
                    <Scissors size={14} className="text-gold" />
                    <span>Assigned Services &amp; Specialties</span>
                  </h5>
                  <p className="text-[11px] text-mutedBrown mt-0.5">
                    Single source of truth from SalonHub Services catalog.
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className="rounded bg-ivory px-2 py-1 text-[11px] font-medium text-charcoal border border-charcoal/10">
                    {getStaffAssignedServices(viewDetailStaff).length} Assigned
                  </span>
                  <span className="rounded bg-gold/20 px-2 py-1 text-[11px] font-bold text-charcoal border border-gold/40">
                    ★ {getStaffSpecialties(viewDetailStaff).length} Specialties
                  </span>
                </div>
              </div>

              {/* Signature Specialties Sub-block */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-gold-deep block mb-2">
                  ★ Signature Master Specialties
                </span>
                {getStaffSpecialties(viewDetailStaff).length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {getStaffSpecialties(viewDetailStaff).map((s) => (
                      <div
                        key={s.id}
                        className="rounded-lg border border-gold/40 bg-gold/10 p-3 flex items-start justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <Star size={13} className="fill-gold text-gold" />
                            <p className="font-semibold text-charcoal">{s.name}</p>
                          </div>
                          <p className="text-[11px] text-mutedBrown mt-1">
                            {s.category} · {duration(s.durationMin || 60)}
                          </p>
                        </div>
                        <span className="font-display font-medium text-charcoal">
                          {money(s.price || 0)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-mutedBrown italic">No specialties designated yet.</p>
                )}
              </div>

              {/* All Qualified Services Sub-block */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal block mb-2">
                  All Authorized Salon Treatments
                </span>
                {getStaffAssignedServices(viewDetailStaff).length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {getStaffAssignedServices(viewDetailStaff).map((s) => {
                      const isSpec = viewDetailStaff.specialtyServiceIds?.includes(s.id)
                      return (
                        <div
                          key={s.id}
                          className={`rounded border p-2.5 flex items-center justify-between ${
                            isSpec
                              ? 'border-gold/30 bg-gold/5'
                              : 'border-charcoal/10 bg-white'
                          }`}
                        >
                          <div>
                            <p className="font-medium text-charcoal flex items-center gap-1.5">
                              {isSpec && <Star size={11} className="fill-gold text-gold" />}
                              <span>{s.name}</span>
                            </p>
                            <p className="text-[10px] text-mutedBrown">
                              {s.category} · {duration(s.durationMin || 45)}
                            </p>
                          </div>
                          <span className="font-display font-medium text-charcoal text-xs">
                            {money(s.price || 0)}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-mutedBrown italic">No services currently assigned.</p>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-charcoal/10">
              <button
                type="button"
                onClick={() => setViewDetailStaff(null)}
                className="rounded bg-charcoal px-5 py-2 text-xs font-semibold uppercase tracking-wider text-ivory hover:bg-gold hover:text-charcoal"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </AdminModal>
      )}

      {/* Add / Edit Staff Modal */}
      {editModalStaff && (
        <AdminModal
          isOpen={!!editModalStaff}
          onClose={() => setEditModalStaff(null)}
          title={isNewStaff ? 'Add New Master Specialist' : `Edit Specialist: ${staffForm.name}`}
          subtitle="Configure professional details, status, working shifts, and assign services & specialties"
        >
          <form onSubmit={handleFormSubmit} className="space-y-5">
            
            {/* Status & Availability Toggle */}
            <div className="rounded-xl border border-charcoal/10 bg-ivory/40 p-3.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-2">
                Staff Status &amp; Booking Eligibility *
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStaffForm({ ...staffForm, status: 'active' })}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 px-3 text-xs font-semibold transition-all ${
                    staffForm.status === 'active'
                      ? 'border border-emerald-600 bg-emerald-50 text-emerald-800 shadow-xs ring-1 ring-emerald-500'
                      : 'border border-charcoal/20 bg-white text-mutedBrown hover:bg-ivory'
                  }`}
                >
                  <CheckCircle2 size={15} className={staffForm.status === 'active' ? 'text-emerald-600' : 'text-taupe'} />
                  <span>Active (Bookable Online)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStaffForm({ ...staffForm, status: 'inactive' })}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 px-3 text-xs font-semibold transition-all ${
                    staffForm.status === 'inactive'
                      ? 'border border-rose-500 bg-rose-50 text-rose-800 shadow-xs ring-1 ring-rose-500'
                      : 'border border-charcoal/20 bg-white text-mutedBrown hover:bg-ivory'
                  }`}
                >
                  <XCircle size={15} className={staffForm.status === 'inactive' ? 'text-rose-500' : 'text-taupe'} />
                  <span>Inactive (Paused / On Leave)</span>
                </button>
              </div>
              <p className="mt-2 text-[11px] text-mutedBrown">
                {staffForm.status === 'active'
                  ? 'Eligible for client bookings for assigned services across scheduled shift days.'
                  : 'Hidden from public appointment booking. Existing past records and analytics are safely preserved.'}
              </p>
            </div>

            {/* Homepage Featured Specialist Showcase */}
            <div className="rounded-xl border border-gold/40 bg-gold/5 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Star size={18} className="fill-gold text-gold shrink-0" />
                  <div>
                    <label
                      htmlFor="staff-featured-toggle"
                      className="text-xs font-bold uppercase tracking-wider text-charcoal cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Featured on Homepage</span>
                      <span className="rounded bg-gold/20 px-2 py-0.5 text-[10px] font-semibold text-charcoal">
                        {featuredCount} of 4 slots used
                      </span>
                    </label>
                    <p className="text-[11px] text-mutedBrown">
                      Showcase this master specialist in the 4-member team spotlight on the public landing page.
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  id="staff-featured-toggle"
                  checked={staffForm.isFeatured}
                  disabled={staffForm.status !== 'active'}
                  onChange={(e) => handleFeaturedCheckboxChange(e.target.checked)}
                  className="h-5 w-5 rounded text-gold focus:ring-gold cursor-pointer disabled:opacity-40"
                />
              </div>

              {staffForm.isFeatured && (
                <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-gold/20">
                  <label className="text-xs font-semibold text-charcoal whitespace-nowrap">
                    Homepage Display Order:
                  </label>
                  <select
                    value={staffForm.featuredOrder}
                    onChange={(e) => setStaffForm({ ...staffForm, featuredOrder: Number(e.target.value) })}
                    className="rounded border border-charcoal/20 bg-white py-1 px-3 text-xs text-charcoal outline-none focus:border-gold"
                  >
                    <option value={1}>Position 1 (First in grid)</option>
                    <option value={2}>Position 2</option>
                    <option value={3}>Position 3</option>
                    <option value={4}>Position 4 (Fourth in grid)</option>
                  </select>
                  <span className="text-[11px] text-mutedBrown">
                    Controls card sequence from left to right on the public homepage.
                  </span>
                </div>
              )}

              {!staffForm.isFeatured && featuredCount >= 4 && (!editModalStaff || !editModalStaff.isFeatured) && (
                <div className="flex items-center gap-1.5 rounded bg-amber-50 border border-amber-200 px-3 py-1.5 text-[11px] text-amber-800 font-medium">
                  <AlertCircle size={13} className="shrink-0 text-amber-600" />
                  <span>Maximum 4 specialists are already featured. Please unfeature a specialist before adding another.</span>
                </div>
              )}
              {staffForm.status !== 'active' && (
                <div className="flex items-center gap-1.5 text-[11px] text-rose-600">
                  <AlertCircle size={13} className="shrink-0" />
                  <span>Only active staff members are eligible to appear on the homepage.</span>
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Amara Khan"
                  value={staffForm.name}
                  onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                  className="w-full rounded border border-charcoal/20 p-2 text-xs text-charcoal outline-none focus:border-gold"
                />
                {formErrors.name && <p className="text-[11px] text-rose-600 mt-0.5">{formErrors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">
                  Professional Title / Role *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Creative Director & Colorist"
                  value={staffForm.role}
                  onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}
                  className="w-full rounded border border-charcoal/20 p-2 text-xs text-charcoal outline-none focus:border-gold"
                />
                {formErrors.role && <p className="text-[11px] text-rose-600 mt-0.5">{formErrors.role}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  placeholder="0300 1234567"
                  value={staffForm.phone}
                  onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                  className="w-full rounded border border-charcoal/20 p-2 text-xs text-charcoal outline-none focus:border-gold"
                />
                {formErrors.phone && <p className="text-[11px] text-rose-600 mt-0.5">{formErrors.phone}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="staff@salonhub.pk"
                  value={staffForm.email}
                  onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                  className="w-full rounded border border-charcoal/20 p-2 text-xs text-charcoal outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">
                  Years of Experience
                </label>
                <input
                  type="number"
                  min="0"
                  max="40"
                  value={staffForm.years}
                  onChange={(e) => setStaffForm({ ...staffForm, years: Number(e.target.value) })}
                  className="w-full rounded border border-charcoal/20 p-2 text-xs text-charcoal outline-none focus:border-gold"
                />
              </div>
            </div>

            {/* Profile Photo Upload */}
            <div>
              <ImageUpload
                label="Specialist Portrait Photo (Cloudinary / Storage)"
                value={staffForm.avatar}
                onChange={(url, publicId) =>
                  setStaffForm({
                    ...staffForm,
                    avatar: url,
                    avatarPublicId: publicId,
                  })
                }
                folder="staff"
                aspect="square"
                helperText="JPG, PNG, or WebP portrait. Up to 5MB."
              />
            </div>

            {/* ─────────────────────────────────────────────────────────────
                DEDICATED "SERVICES & SPECIALTIES" SECTION
            ───────────────────────────────────────────────────────────── */}
            <div className="rounded-xl border border-charcoal/15 bg-white p-4 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-charcoal/10 pb-3">
                <div>
                  <h4 className="font-display text-lg font-medium text-charcoal flex items-center gap-2">
                    <Scissors size={16} className="text-gold" />
                    <span>Services &amp; Specialties</span>
                  </h4>
                  <p className="font-body text-xs text-mutedBrown">
                    Check services this specialist can perform, then designate signature specialties with the gold star.
                  </p>
                </div>

                <div className="flex items-center gap-2 font-body text-xs">
                  <span className="rounded bg-ivory px-2.5 py-1 font-medium text-charcoal border border-charcoal/10">
                    {staffForm.serviceIds.length} Assigned
                  </span>
                  <span className="rounded bg-gold/20 px-2.5 py-1 font-bold text-charcoal border border-gold/40 flex items-center gap-1">
                    <Star size={11} className="fill-gold text-gold" />
                    <span>{staffForm.specialtyServiceIds.length} Specialties</span>
                  </span>
                </div>
              </div>

              {/* Service Catalog Empty State */}
              {services.length === 0 ? (
                <div className="rounded-lg border border-dashed border-charcoal/20 bg-ivory/40 p-6 text-center">
                  <Scissors className="mx-auto text-taupe mb-2" size={28} />
                  <h5 className="font-display text-base font-medium text-charcoal">
                    No Services Created Yet
                  </h5>
                  <p className="mt-1 font-body text-xs text-mutedBrown max-w-sm mx-auto">
                    Services must be created in the Services Management module before they can be assigned to staff members.
                  </p>
                  <Link
                    to="/admin/services"
                    className="mt-3 inline-flex items-center gap-1.5 rounded bg-gold px-4 py-2 font-body text-xs font-semibold uppercase tracking-wider text-charcoal hover:bg-gold-hover shadow-sm"
                  >
                    <Plus size={14} />
                    <span>Go to Services Catalog</span>
                  </Link>
                </div>
              ) : (
                <>
                  {/* Search and Category Filter Tabs */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="relative flex-1">
                      <Search size={14} className="absolute left-2.5 top-2 text-mutedBrown pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Search services by name or category..."
                        value={serviceSearch}
                        onChange={(e) => setServiceSearch(e.target.value)}
                        className="w-full rounded border border-charcoal/20 bg-ivory/30 py-1.5 pl-8 pr-2.5 text-xs text-charcoal outline-none focus:border-gold"
                      />
                    </div>

                    <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                      {serviceCategories.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setServiceCatFilter(cat)}
                          className={`rounded px-2.5 py-1 text-[11px] font-medium transition-colors ${
                            serviceCatFilter === cat
                              ? 'bg-charcoal text-ivory'
                              : 'bg-ivory/80 text-mutedBrown hover:bg-ivory hover:text-charcoal'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Batch Selection Controls */}
                  <div className="flex items-center justify-between text-[11px] text-mutedBrown px-1">
                    <span>
                      Showing {modalFilteredServices.length} of {services.length} catalog services
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleSelectAllVisibleServices(modalFilteredServices)}
                        className="font-medium text-gold-deep hover:underline"
                      >
                        Select all visible
                      </button>
                      <span>·</span>
                      <button
                        type="button"
                        onClick={() => handleDeselectAllVisibleServices(modalFilteredServices)}
                        className="font-medium text-rose-600 hover:underline"
                      >
                        Deselect all visible
                      </button>
                    </div>
                  </div>

                  {/* Scrollable Services Checkbox & Specialty Matrix */}
                  <div className="max-h-72 overflow-y-auto space-y-2 rounded-lg border border-charcoal/10 bg-ivory/20 p-2.5">
                    {modalFilteredServices.length === 0 ? (
                      <p className="text-center py-6 text-xs text-mutedBrown">
                        No services match "{serviceSearch}" in {serviceCatFilter}.
                      </p>
                    ) : (
                      modalFilteredServices.map((svc) => {
                        const isAssigned = staffForm.serviceIds.includes(svc.id)
                        const isSpecialty = staffForm.specialtyServiceIds.includes(svc.id)

                        return (
                          <div
                            key={svc.id}
                            onClick={() => toggleServiceAssignment(svc.id)}
                            className={`group flex items-center justify-between rounded-lg border p-2.5 cursor-pointer transition-all duration-150 ${
                              isAssigned
                                ? 'border-charcoal/30 bg-white shadow-2xs'
                                : 'border-charcoal/10 bg-white/60 hover:border-charcoal/20 hover:bg-white'
                            }`}
                          >
                            {/* Left: Checkbox + Service Meta */}
                            <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                              <input
                                type="checkbox"
                                checked={isAssigned}
                                onChange={() => {}} // Handled by container onClick
                                className="h-4 w-4 rounded border-charcoal/30 text-gold focus:ring-gold"
                              />

                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs font-medium truncate ${isAssigned ? 'text-charcoal font-semibold' : 'text-charcoal/80'}`}>
                                    {svc.name}
                                  </span>
                                  {svc.status === 'inactive' && (
                                    <span className="rounded bg-gray-100 px-1.5 py-0.2 text-[9px] font-semibold text-gray-500 uppercase">
                                      Inactive Catalog
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-mutedBrown mt-0.5">
                                  <span className="rounded bg-ivory px-1.5 py-0.2 font-medium text-charcoal">
                                    {svc.category}
                                  </span>
                                  <span>{duration(svc.durationMin || 45)}</span>
                                  <span>·</span>
                                  <span className="font-semibold text-charcoal">{money(svc.price)}</span>
                                </div>
                              </div>
                            </div>

                            {/* Right: Specialty Designation Toggle Button */}
                            <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                              {isAssigned ? (
                                <button
                                  type="button"
                                  onClick={(e) => toggleSpecialtyMark(svc.id, e)}
                                  className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-all shadow-2xs ${
                                    isSpecialty
                                      ? 'bg-gold text-charcoal ring-1 ring-gold shadow-xs hover:bg-gold-hover'
                                      : 'border border-charcoal/20 bg-ivory/60 text-mutedBrown hover:border-gold hover:text-charcoal hover:bg-white'
                                  }`}
                                  title={
                                    isSpecialty
                                      ? 'Designated as Signature Specialty. Click to remove.'
                                      : 'Click to mark as Signature Specialty.'
                                  }
                                >
                                  <Star
                                    size={12}
                                    className={isSpecialty ? 'fill-charcoal text-charcoal' : 'text-taupe'}
                                  />
                                  <span>{isSpecialty ? 'Specialty' : 'Mark Specialty'}</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  disabled
                                  title="Must assign service first before designating as specialty"
                                  className="inline-flex items-center gap-1.5 rounded-md border border-charcoal/10 bg-gray-50 px-2.5 py-1 text-xs text-gray-400 cursor-not-allowed opacity-60"
                                >
                                  <Star size={12} />
                                  <span>Specialty</span>
                                </button>
                              )}
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Schedule Section */}
            <div className="border-t border-charcoal/10 pt-3 space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-2">
                  Working Shift Days
                </label>
                <div className="flex flex-wrap gap-2">
                  {allWeekdays.map((day) => {
                    const selected = staffForm.days.includes(day)
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
                          selected
                            ? 'bg-charcoal text-ivory'
                            : 'border border-charcoal/20 text-charcoal hover:bg-charcoal/5'
                        }`}
                      >
                        {day}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-mutedBrown mb-1">Shift Start</label>
                  <input
                    type="time"
                    value={staffForm.shiftStart}
                    onChange={(e) => setStaffForm({ ...staffForm, shiftStart: e.target.value })}
                    className="w-full rounded border border-charcoal/20 p-1.5 text-xs text-charcoal outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-mutedBrown mb-1">Shift End</label>
                  <input
                    type="time"
                    value={staffForm.shiftEnd}
                    onChange={(e) => setStaffForm({ ...staffForm, shiftEnd: e.target.value })}
                    className="w-full rounded border border-charcoal/20 p-1.5 text-xs text-charcoal outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-mutedBrown mb-1">Break Time</label>
                  <input
                    type="text"
                    placeholder="13:00 - 14:00"
                    value={staffForm.breakTime}
                    onChange={(e) => setStaffForm({ ...staffForm, breakTime: e.target.value })}
                    className="w-full rounded border border-charcoal/20 p-1.5 text-xs text-charcoal outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Profile Bio */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">
                Profile Bio &amp; Expertise Note
              </label>
              <textarea
                rows={2}
                placeholder="Background, certifications, specialty techniques..."
                value={staffForm.bio}
                onChange={(e) => setStaffForm({ ...staffForm, bio: e.target.value })}
                className="w-full rounded border border-charcoal/20 p-2 text-xs text-charcoal outline-none focus:border-gold resize-none"
              />
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-charcoal/10">
              <button
                type="button"
                onClick={() => setEditModalStaff(null)}
                className="rounded border border-charcoal/20 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-charcoal hover:bg-charcoal/5"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded bg-gold px-6 py-2 text-xs font-semibold uppercase tracking-wider text-charcoal hover:bg-gold-hover shadow-sm"
              >
                {isNewStaff ? 'Create Specialist' : 'Save Changes'}
              </button>
            </div>
          </form>
        </AdminModal>
      )}

      {/* Deactivate / Activate Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmToggle.isOpen}
        onClose={() => setConfirmToggle({ isOpen: false, staff: null })}
        onConfirm={confirmToggleStatus}
        title={
          confirmToggle.staff?.status === 'active'
            ? `Deactivate ${confirmToggle.staff?.name}?`
            : `Reactivate ${confirmToggle.staff?.name}?`
        }
        message={
          confirmToggle.staff?.status === 'active'
            ? `Deactivating ${confirmToggle.staff?.name} will hide them from future online booking selection. Historical records and existing reservations remain preserved.`
            : `Reactivating will make ${confirmToggle.staff?.name} available for client appointments immediately.`
        }
        confirmLabel={confirmToggle.staff?.status === 'active' ? 'Deactivate' : 'Reactivate'}
        confirmVariant={confirmToggle.staff?.status === 'active' ? 'danger' : 'primary'}
      />

    </div>
  )
}
