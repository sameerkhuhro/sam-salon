import { useEffect, useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowLeft,
  Star,
  Sparkles,
  Search,
  X,
  Check,
  RotateCcw,
  Scissors,
} from 'lucide-react'
import { services, getService } from '@/data/services'
import { team } from '@/data/team'
import { getAvailability, createBooking, getLiveServices, getLiveStaff } from '@/lib/api'
import { money, duration, longDate, todayISO } from '@/lib/format'
import { site } from '@/config/site'
import PageHero from '@/components/ui/PageHero'
import CategoryIcon from '@/components/ui/CategoryIcon'

const STEPS = ['Services', 'Stylist', 'Date & Time', 'Your Details', 'Review']

function StepIndicator({ current, onSelectStep }) {
  return (
    <ol className="mb-10 flex flex-wrap items-center gap-x-2 gap-y-3" aria-label="Booking Progress">
      {STEPS.map((s, i) => {
        const done = i < current
        const active = i === current
        return (
          <li key={s} className="flex items-center gap-2">
            <button
              type="button"
              disabled={!done}
              onClick={() => done && onSelectStep(i)}
              aria-current={active ? 'step' : undefined}
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-all ${
                done
                  ? 'bg-gold text-charcoal shadow-sm hover:scale-105 cursor-pointer'
                  : active
                  ? 'bg-charcoal text-ivory ring-2 ring-gold'
                  : 'border border-charcoal/20 text-mutedBrown bg-white/50 cursor-default'
              }`}
              title={done ? `Return to ${s}` : undefined}
            >
              {done ? <CheckCircle2 size={16} /> : i + 1}
            </button>
            <button
              type="button"
              disabled={!done}
              onClick={() => done && onSelectStep(i)}
              className={`font-body text-xs sm:text-sm transition-colors text-left ${
                active
                  ? 'font-semibold text-charcoal'
                  : done
                  ? 'text-gold-deep font-medium hover:underline cursor-pointer'
                  : 'text-mutedBrown cursor-default'
              }`}
            >
              {s}
            </button>
            {i < STEPS.length - 1 && (
              <span className="mx-1 h-px w-5 sm:w-8 bg-charcoal/15" aria-hidden="true" />
            )}
          </li>
        )
      })}
    </ol>
  )
}

function ChoiceCard({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`group relative w-full rounded-lg border p-5 text-left transition-all duration-200 ${
        active
          ? 'border-gold bg-charcoal text-ivory shadow-md ring-1 ring-gold'
          : 'border-charcoal/15 bg-white/80 hover:border-gold hover:bg-white hover:shadow-sm'
      }`}
    >
      {children}
    </button>
  )
}

export default function Book() {
  const [params] = useSearchParams()
  const nav = useNavigate()
  const [step, setStep] = useState(0)

  // Initialize selected services from URL param or empty
  const initialParam = params.get('service') || ''
  const [selectedServiceIds, setSelectedServiceIds] = useState(() => {
    if (!initialParam) return []
    return initialParam.includes(',') ? initialParam.split(',').filter(Boolean) : [initialParam]
  })

  const [b, setB] = useState({
    staffId: params.get('staff') || '',
    date: '',
    time: '',
    name: '',
    phone: '',
    email: '',
    notes: '',
  })

  const [searchQuery, setSearchQuery] = useState('')
  const [catFilter, setCatFilter] = useState('All')
  const [slots, setSlots] = useState([])
  const [err, setErr] = useState({})
  const [busy, setBusy] = useState(false)
  const [staffNotice, setStaffNotice] = useState('')

  // Live service and staff state with fallback to static catalog
  const [serviceList, setServiceList] = useState(services)
  const [staffList, setStaffList] = useState(team)

  useEffect(() => {
    getLiveServices().then((liveSvc) => {
      if (liveSvc && liveSvc.length > 0) setServiceList(liveSvc)
    })
    getLiveStaff().then((liveSt) => {
      if (liveSt && liveSt.length > 0) setStaffList(liveSt)
    })
  }, [])

  const set = (p) => setB((x) => ({ ...x, ...p }))

  // Calculate selected service objects
  const selectedServices = useMemo(() => {
    return serviceList.filter((s) => {
      const sId = s.id || s._id
      return selectedServiceIds.includes(sId) || (s._id && selectedServiceIds.includes(s._id))
    })
  }, [serviceList, selectedServiceIds])

  // Aggregate price and duration for selected services
  const totalPrice = useMemo(() => {
    return selectedServices.reduce((sum, s) => sum + (Number(s.price) || 0), 0)
  }, [selectedServices])

  const totalDurationMin = useMemo(() => {
    const sum = selectedServices.reduce((sum, s) => sum + (Number(s.durationMin) || 45), 0)
    return sum > 0 ? sum : 45
  }, [selectedServices])

  const combinedServiceNames = useMemo(() => {
    return selectedServices.map((s) => s.name).join(' + ')
  }, [selectedServices])

  const person = staffList.find((t) => t.id === b.staffId || t._id === b.staffId) || team.find((t) => t.id === b.staffId)

  // Filter staff qualified for ALL selected services
  const staffOptions = useMemo(() => {
    return staffList.filter((t) => {
      const isActive = t.status === undefined || t.status === 'active'
      if (!isActive) return false
      if (selectedServices.length === 0) return true
      if (!t.serviceIds || t.serviceIds.length === 0) return true
      return selectedServices.every((s) => {
        const sId = s.id || s._id
        return t.serviceIds.includes(sId) || (s._id && t.serviceIds.includes(s._id))
      })
    })
  }, [staffList, selectedServices])

  // Filter service catalog by category AND search query
  const filteredServices = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return serviceList.filter((s) => {
      const matchesCategory =
        catFilter === 'All' || s.category?.toLowerCase() === catFilter.toLowerCase()
      const matchesSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        (s.description && s.description.toLowerCase().includes(q)) ||
        (s.category && s.category.toLowerCase().includes(q))
      return matchesCategory && matchesSearch
    })
  }, [serviceList, catFilter, searchQuery])

  // Fetch available slots when services, stylist, and date are selected
  useEffect(() => {
    if (selectedServices.length > 0 && b.staffId && b.date) {
      getAvailability({ staffId: b.staffId, date: b.date, durationMin: totalDurationMin })
        .then(setSlots)
        .catch(() => setSlots([]))
    }
  }, [selectedServices.length, b.staffId, b.date, totalDurationMin])

  // Toggle service selection
  const handleToggleService = (sId) => {
    setSelectedServiceIds((prev) => {
      const exists = prev.includes(sId)
      if (exists) {
        return prev.filter((id) => id !== sId)
      } else {
        return [...prev, sId]
      }
    })
  }

  // Remove individual service
  const handleRemoveService = (sId) => {
    setSelectedServiceIds((prev) => prev.filter((id) => id !== sId))
  }

  // Clear all selected services
  const handleClearAllServices = () => {
    setSelectedServiceIds([])
  }

  // Proceed from Step 0 to Step 1 (Stylist)
  const handleServiceContinue = () => {
    if (selectedServices.length === 0) return

    // If a stylist was previously picked, verify they can still perform all selected services
    if (b.staffId) {
      const currentStaff = staffList.find((t) => t.id === b.staffId || t._id === b.staffId)
      const isStaffStillValid =
        currentStaff &&
        (!currentStaff.serviceIds ||
          currentStaff.serviceIds.length === 0 ||
          selectedServices.every((s) => {
            const sId = s.id || s._id
            return currentStaff.serviceIds.includes(sId) || (s._id && currentStaff.serviceIds.includes(s._id))
          }))

      if (!isStaffStillValid) {
        set({ staffId: '', time: '' })
        setStaffNotice(
          'Your previously selected specialist is not qualified for all selected treatments. Please select a specialist who performs this combination.'
        )
      }
    }

    setStep(1)
  }

  // Return customer to step 0 to edit services while preserving other state
  const handleEditServices = () => {
    setStep(0)
  }

  const validate = () => {
    const x = {}
    if (step === 3) {
      if (b.name.trim().length < 2) x.name = 'Please enter your full name.'
      if (!/^(\+92|0)3\d{9}$/.test(b.phone.replace(/[\s-]/g, '')))
        x.phone = 'Please enter a valid Pakistani mobile number (e.g. 0300 1234567).'
      // Email is strictly optional: only validate format if entered
      if (b.email && b.email.trim() && !/^\S+@\S+\.\S+$/.test(b.email.trim()))
        x.email = 'Please enter a valid email address or leave it blank.'
    }
    setErr(x)
    return !Object.keys(x).length
  }

  const canNext = [selectedServices.length > 0, !!b.staffId, !!b.time, true, true][step]

  const next = () => validate() && setStep(step + 1)

  const confirm = async () => {
    if (selectedServices.length === 0 || !person) return
    setBusy(true)
    try {
      const fresh = await getAvailability({ staffId: b.staffId, date: b.date, durationMin: totalDurationMin })
      if (!fresh.find((s) => s.label === b.time)?.available) {
        setBusy(false)
        set({ time: '' })
        setStep(2)
        return setErr({ time: 'That time slot is no longer available. Please choose another time.' })
      }

      const primaryService = selectedServices[0]
      const r = await createBooking({
        ...b,
        serviceId: selectedServices.map((s) => s.id || s._id).join(','),
        serviceIds: selectedServices.map((s) => s.id || s._id),
        services: selectedServices.map((s) => ({
          id: s.id || s._id,
          name: s.name,
          price: s.price,
          durationMin: s.durationMin,
          category: s.category,
        })),
        serviceName: combinedServiceNames,
        price: totalPrice,
        durationMin: totalDurationMin,
        staffId: person.id || person._id,
        staffName: person.name,
        customerEmail: b.email ? b.email.trim() : '',
      })
      nav(`/booking/confirmation/${r.ref}`)
    } catch (error) {
      setBusy(false)
      const msg = error.message || ''
      if (
        msg.includes('booked') ||
        msg.includes('conflict') ||
        msg.includes('slot') ||
        msg.includes('unavailable') ||
        msg.includes('shift') ||
        msg.includes('leave') ||
        msg.includes('closed')
      ) {
        set({ time: '' })
        setStep(2)
        setErr({ time: msg })
      } else {
        setErr({ submit: msg || 'Could not complete your booking. Please try again or call us.' })
      }
    }
  }

  return (
    <>
      <PageHero
        title="Reserve Your Salon Experience"
        eyebrow="SAM SALON Khairpur Mir's"
        text="Choose your treatments, select your preferred master specialist, and secure your time in under a minute."
      />

      <section className={`section !pt-12 bg-ivory min-h-screen ${step === 0 ? 'pb-32 sm:pb-36' : ''}`}>
        <div className="container-page grid gap-12 lg:grid-cols-[1fr_22rem]">

          {/* Main Booking Column */}
          <div>
            <StepIndicator current={step} onSelectStep={setStep} />

            {/* Contextual "Change Services" banner on steps 1, 2, 3, 4 */}
            {step > 0 && selectedServices.length > 0 && (
              <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-charcoal/15 bg-white p-4 shadow-sm">
                <div className="min-w-0 flex-1">
                  <span className="font-body text-[10px] font-semibold uppercase tracking-wider text-mutedBrown block">
                    Selected Treatments ({selectedServices.length}):
                  </span>
                  <div className="flex flex-wrap items-baseline gap-2 mt-0.5">
                    <span className="font-display text-base font-medium text-charcoal">
                      {combinedServiceNames}
                    </span>
                    <span className="font-display text-sm font-semibold text-gold-deep">
                      {money(totalPrice)}
                    </span>
                    <span className="text-xs text-taupe font-body">
                      ({duration(totalDurationMin)})
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleEditServices}
                  className="inline-flex items-center gap-1.5 rounded-sm border border-charcoal/20 bg-ivory px-3.5 py-1.5 font-body text-xs font-semibold text-charcoal hover:border-gold hover:text-gold-deep transition-all shrink-0"
                >
                  <Scissors size={13} className="text-gold-deep" />
                  <span>Change Services</span>
                </button>
              </div>
            )}

            {/* Step 0: Choose Service */}
            {step === 0 && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-2">
                  <h2 className="font-display text-3xl font-medium text-charcoal">
                    1. Choose treatments
                  </h2>
                  <span className="text-xs text-mutedBrown font-body">
                    Select one or more services
                  </span>
                </div>
                <p className="mb-6 font-body text-sm text-mutedBrown">
                  Select from precision haircuts, hair colour, grooming, aesthetic skincare, and spa sessions.
                </p>

                {/* ─── Search Field ─── */}
                <div className="mb-5 relative flex items-center">
                  <Search size={16} className="absolute left-3.5 text-mutedBrown pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search services by treatment name (e.g. haircut, facial, beard, balayage)..."
                    className="w-full rounded-sm border border-charcoal/20 bg-white py-3 pl-10 pr-10 font-body text-xs sm:text-sm text-charcoal outline-none transition-all placeholder:text-mutedBrown/60 focus:border-gold focus:ring-1 focus:ring-gold/30 shadow-xs"
                    aria-label="Search services"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 rounded p-1 text-mutedBrown hover:text-charcoal transition-colors"
                      aria-label="Clear search"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>

                {/* ─── Category Quick Filter Chips ─── */}
                <div className="mb-6 flex flex-wrap items-center gap-1.5">
                  {['All', 'Hair', 'Colour', 'Grooming', 'Skin', 'Nails', 'Relax'].map((catName) => {
                    const isCatActive = catFilter === catName
                    return (
                      <button
                        key={catName}
                        type="button"
                        onClick={() => setCatFilter(catName)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-body text-xs font-medium transition-all ${
                          isCatActive
                            ? 'bg-charcoal text-ivory shadow-xs font-semibold'
                            : 'bg-white/80 border border-charcoal/15 text-charcoal hover:border-gold hover:bg-white'
                        }`}
                      >
                        {catName === 'All' ? (
                          <Sparkles size={12} className={isCatActive ? 'text-gold' : 'text-taupe'} />
                        ) : (
                          <CategoryIcon category={catName} size={12} className={isCatActive ? 'text-gold' : 'text-taupe'} />
                        )}
                        <span>{catName === 'All' ? 'All Services' : catName}</span>
                      </button>
                    )
                  })}
                </div>

                {/* ─── Selected Services Summary Box (Visible when ≥ 1 selected) ─── */}
                {selectedServices.length > 0 && (
                  <div className="mb-6 rounded-xl border border-gold/40 bg-charcoal p-4 sm:p-5 text-ivory shadow-md animate-fade-in">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold text-charcoal font-body text-xs font-bold">
                          {selectedServices.length}
                        </span>
                        <h3 className="font-display text-base sm:text-lg font-medium text-ivory">
                          {selectedServices.length === 1 ? 'Selected Service' : 'Selected Services'}
                        </h3>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="font-display text-lg sm:text-xl font-semibold text-gold">
                            {money(totalPrice)}
                          </span>
                          <span className="text-[11px] text-taupe block -mt-0.5">
                            Est. {duration(totalDurationMin)}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleClearAllServices}
                          className="text-[11px] font-body text-taupe hover:text-white underline underline-offset-2 ml-2"
                        >
                          Clear all
                        </button>
                      </div>
                    </div>

                    {/* Removable Service Pills */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedServices.map((s) => {
                        const sId = s.id || s._id
                        return (
                          <div
                            key={sId}
                            className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-charcoal-light/80 px-3 py-1 font-body text-xs text-ivory shadow-xs"
                          >
                            <span className="font-medium">{s.name}</span>
                            <span className="text-gold font-semibold text-[11px]">{money(s.price)}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveService(sId)}
                              className="rounded-full p-0.5 text-taupe hover:text-white hover:bg-white/10 transition-colors"
                              aria-label={`Remove ${s.name}`}
                              title={`Remove ${s.name}`}
                            >
                              <X size={13} />
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* ─── Services Grid ─── */}
                {filteredServices.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-charcoal/20 bg-white/60 p-10 text-center">
                    <Search className="mx-auto text-taupe mb-2" size={28} />
                    <h3 className="font-display text-xl font-medium text-charcoal">
                      No treatments found
                    </h3>
                    <p className="mt-1 font-body text-xs text-mutedBrown">
                      No services match &ldquo;{searchQuery}&rdquo; in {catFilter === 'All' ? 'the salon menu' : catFilter}.
                    </p>
                    <div className="mt-4 flex justify-center gap-2">
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery('')}
                          className="rounded bg-charcoal px-4 py-2 font-body text-xs font-semibold text-ivory hover:bg-gold hover:text-charcoal transition-colors"
                        >
                          Clear Search
                        </button>
                      )}
                      {catFilter !== 'All' && (
                        <button
                          type="button"
                          onClick={() => setCatFilter('All')}
                          className="rounded border border-charcoal/20 px-4 py-2 font-body text-xs font-semibold text-charcoal hover:bg-charcoal/5 transition-colors"
                        >
                          View All Categories
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {filteredServices.map((s) => {
                      const sId = s.id || s._id
                      const isSelected = selectedServiceIds.includes(sId) || (s._id && selectedServiceIds.includes(s._id))
                      return (
                        <ChoiceCard
                          key={sId}
                          active={isSelected}
                          onClick={() => handleToggleService(sId)}
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider ${
                                isSelected ? 'text-gold' : 'text-mutedBrown'
                              }`}
                            >
                              <CategoryIcon category={s.category} size={11} className={isSelected ? 'text-gold' : 'text-taupe'} />
                              <span>{s.category} · {s.gender}</span>
                            </span>

                            <div className="flex items-center gap-2">
                              <span className={`font-display text-lg font-medium ${isSelected ? 'text-gold' : 'text-charcoal'}`}>
                                {money(s.price)}
                              </span>
                              <div
                                className={`flex h-5 w-5 items-center justify-center rounded-full border transition-all ${
                                  isSelected
                                    ? 'border-gold bg-gold text-charcoal'
                                    : 'border-charcoal/30 bg-transparent text-transparent group-hover:border-gold/60'
                                }`}
                              >
                                <Check size={12} strokeWidth={3} />
                              </div>
                            </div>
                          </div>

                          <span className="mt-2 block font-display text-xl font-medium leading-tight">
                            {s.name}
                          </span>
                          <span
                            className={`mt-1.5 block font-body text-xs leading-relaxed line-clamp-2 ${
                              isSelected ? 'text-ivory/80' : 'text-mutedBrown'
                            }`}
                          >
                            {s.description}
                          </span>
                          <div
                            className={`mt-3 flex items-center justify-between font-body text-[11px] ${
                              isSelected ? 'text-gold' : 'text-mutedBrown'
                            }`}
                          >
                            <span className="flex items-center gap-1.5">
                              <Clock size={12} />
                              <span>{duration(s.durationMin)}</span>
                            </span>
                            <span className="text-[10px] uppercase tracking-wider font-semibold">
                              {isSelected ? '✓ Selected (Tap to remove)' : '+ Tap to select'}
                            </span>
                          </div>
                        </ChoiceCard>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Step 1: Choose Stylist */}
            {step === 1 && (
              <div>
                <h2 className="mb-2 font-display text-3xl font-medium text-charcoal">
                  2. Select your specialist
                </h2>
                <p className="mb-6 font-body text-sm text-mutedBrown">
                  Pick the master artist who will take care of your session.
                </p>

                {staffNotice && (
                  <div className="mb-6 rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
                    {staffNotice}
                  </div>
                )}

                {staffOptions.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-charcoal/20 bg-white/60 p-8 text-center">
                    <p className="font-display text-xl font-medium text-charcoal">
                      No active specialists currently assigned to all selected treatments.
                    </p>
                    <p className="font-body text-xs text-mutedBrown mt-1">
                      Please adjust your treatments or contact the salon directly at {site?.phone || '+92 300 1234567'}.
                    </p>
                    <button
                      type="button"
                      onClick={() => setStep(0)}
                      className="mt-4 inline-flex items-center gap-1.5 rounded bg-charcoal px-4 py-2 font-body text-xs font-semibold text-ivory hover:bg-gold hover:text-charcoal transition-colors"
                    >
                      <ArrowLeft size={14} />
                      <span>Modify Selected Services</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {staffOptions.map((t) => {
                      const tId = t.id || t._id
                      const isSelected = b.staffId === tId
                      const isSpecialist = selectedServices.some((svc) => {
                        const sId = svc.id || svc._id
                        return (
                          t.specialtyServiceIds &&
                          (t.specialtyServiceIds.includes(sId) || (svc._id && t.specialtyServiceIds.includes(svc._id)))
                        )
                      })

                      return (
                        <ChoiceCard
                          key={tId}
                          active={isSelected}
                          onClick={() => set({ staffId: tId, time: '' })}
                        >
                          <div className="flex items-center gap-4">
                            <img
                              src={t.avatar || t.photo}
                              alt={t.name}
                              className="h-16 w-16 rounded-full object-cover border border-gold/40 shadow-sm shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-display text-xl font-medium leading-tight block truncate">
                                  {t.name}
                                </span>
                                {isSpecialist && (
                                  <span className="shrink-0 inline-flex items-center gap-1 rounded bg-gold/20 text-gold px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                                    <Star size={10} className="fill-gold" />
                                    Specialist
                                  </span>
                                )}
                              </div>
                              <span className={`mt-0.5 block font-body text-xs font-medium ${isSelected ? 'text-gold' : 'text-mutedBrown'}`}>
                                {t.role} · {t.years} yrs exp
                              </span>
                              <span className={`mt-1 block font-body text-[11px] truncate ${isSelected ? 'text-ivory/70' : 'text-mutedBrown/80'}`}>
                                {Array.isArray(t.specialties) ? t.specialties.join(', ') : ''}
                              </span>
                            </div>
                          </div>
                        </ChoiceCard>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Choose Date & Time */}
            {step === 2 && (
              <div>
                <h2 className="mb-2 font-display text-3xl font-medium text-charcoal">
                  3. Select date &amp; available time
                </h2>
                <p className="mb-6 font-body text-sm text-mutedBrown">
                  Choose a date to view live available time slots for {person?.name || 'your specialist'}.
                </p>

                <div className="max-w-xs">
                  <label htmlFor="book-date" className="mb-2 block font-body text-xs font-semibold uppercase tracking-wider text-charcoal">
                    Appointment Date *
                  </label>
                  <input
                    id="book-date"
                    type="date"
                    min={todayISO()}
                    value={b.date}
                    onChange={(e) => set({ date: e.target.value, time: '' })}
                    className="field rounded-sm"
                  />
                </div>
                {err.time && <p className="field-error mt-2" role="alert">{err.time}</p>}

                {b.date && (
                  <div className="mt-8 border-t border-charcoal/10 pt-6">
                    <p className="mb-4 font-body text-xs font-semibold uppercase tracking-[0.12em] text-mutedBrown">
                      Available Slots for {longDate(b.date)} ({duration(totalDurationMin)} required)
                    </p>
                    {slots.length === 0 ? (
                      <p className="font-body text-sm text-mutedBrown animate-pulse">
                        Checking calendar slots…
                      </p>
                    ) : (
                      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-5">
                        {slots.map((s) => {
                          const isPicked = b.time === s.label
                          return (
                            <button
                              key={s.label}
                              disabled={!s.available}
                              onClick={() => set({ time: s.label })}
                              aria-pressed={isPicked}
                              className={`rounded-sm border py-3 text-xs font-body font-semibold tracking-wide transition-all duration-150 disabled:cursor-not-allowed disabled:line-through disabled:opacity-30 ${
                                isPicked
                                  ? 'border-charcoal bg-charcoal text-ivory ring-1 ring-gold shadow-sm'
                                  : 'border-charcoal/15 bg-white hover:border-gold hover:text-gold-deep'
                              }`}
                            >
                              {s.label}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Customer Details */}
            {step === 3 && (
              <div>
                <h2 className="mb-2 font-display text-3xl font-medium text-charcoal">
                  4. Your contact details
                </h2>
                <p className="mb-6 font-body text-sm text-mutedBrown">
                  We will use your phone number to send your confirmation and arrival details.
                </p>

                <div className="max-w-md space-y-5">
                  <div>
                    <label htmlFor="b-name" className="mb-1.5 block font-body text-xs font-semibold uppercase tracking-wider text-charcoal">
                      Full Name *
                    </label>
                    <input
                      id="b-name"
                      type="text"
                      className="field rounded-sm"
                      value={b.name}
                      onChange={(e) => set({ name: e.target.value })}
                      placeholder="e.g. Sana Ahmed"
                    />
                    {err.name && <p className="field-error">{err.name}</p>}
                  </div>

                  <div>
                    <label htmlFor="b-phone" className="mb-1.5 block font-body text-xs font-semibold uppercase tracking-wider text-charcoal">
                      Mobile Number (Pakistani) *
                    </label>
                    <input
                      id="b-phone"
                      type="tel"
                      className="field rounded-sm"
                      value={b.phone}
                      onChange={(e) => set({ phone: e.target.value })}
                      placeholder="0300 1234567"
                    />
                    {err.phone && <p className="field-error">{err.phone}</p>}
                  </div>

                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <label htmlFor="b-email" className="font-body text-xs font-semibold uppercase tracking-wider text-charcoal">
                        Email Address (Optional)
                      </label>
                      <span className="text-[10px] text-mutedBrown uppercase tracking-wider">Optional</span>
                    </div>
                    <input
                      id="b-email"
                      type="email"
                      className="field rounded-sm"
                      value={b.email}
                      onChange={(e) => set({ email: e.target.value })}
                      placeholder="sana@example.com"
                    />
                    {err.email && <p className="field-error">{err.email}</p>}
                  </div>

                  <div>
                    <label htmlFor="b-notes" className="mb-1.5 block font-body text-xs font-semibold uppercase tracking-wider text-charcoal">
                      Special Requests or Notes (Optional)
                    </label>
                    <textarea
                      id="b-notes"
                      rows={3}
                      className="field resize-none rounded-sm"
                      value={b.notes}
                      onChange={(e) => set({ notes: e.target.value })}
                      placeholder="Hair history, allergies, or styling preferences..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review & Confirm */}
            {step === 4 && (
              <div>
                <h2 className="mb-2 font-display text-3xl font-medium text-charcoal">
                  5. Review &amp; confirm appointment
                </h2>
                <p className="mb-6 font-body text-sm text-mutedBrown">
                  Please review your reservation details before confirming.
                </p>

                <div className="max-w-md rounded-xl border border-charcoal/15 bg-white p-6 shadow-sm">
                  <dl className="divide-y divide-charcoal/10 font-body text-sm">
                    <div className="flex justify-between py-3">
                      <dt className="text-mutedBrown">Selected Treatments</dt>
                      <dd className="font-semibold text-charcoal text-right max-w-[65%]">
                        {combinedServiceNames || '—'}
                      </dd>
                    </div>

                    {selectedServices.length > 1 && (
                      <div className="py-2.5 text-xs text-mutedBrown space-y-1 bg-ivory/50 px-3 rounded">
                        {selectedServices.map((s) => (
                          <div key={s.id || s._id} className="flex justify-between">
                            <span>• {s.name}</span>
                            <span className="font-medium text-charcoal">{money(s.price)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex justify-between py-3">
                      <dt className="text-mutedBrown">Master Specialist</dt>
                      <dd className="font-semibold text-charcoal">{person?.name || '—'}</dd>
                    </div>

                    <div className="flex justify-between py-3">
                      <dt className="text-mutedBrown">Date &amp; Time</dt>
                      <dd className="font-semibold text-charcoal">{b.date ? `${longDate(b.date)} at ${b.time}` : '—'}</dd>
                    </div>

                    <div className="flex justify-between py-3">
                      <dt className="text-mutedBrown">Total Duration</dt>
                      <dd className="font-semibold text-charcoal">{duration(totalDurationMin)}</dd>
                    </div>

                    <div className="flex justify-between py-3">
                      <dt className="text-mutedBrown">Client</dt>
                      <dd className="font-semibold text-charcoal">
                        {b.name} ({b.phone})
                      </dd>
                    </div>

                    {b.email && (
                      <div className="flex justify-between py-3">
                        <dt className="text-mutedBrown">Email</dt>
                        <dd className="font-medium text-charcoal">{b.email}</dd>
                      </div>
                    )}

                    <div className="flex justify-between py-3 border-t-2 border-charcoal/20">
                      <dt className="font-semibold text-charcoal">Total Amount</dt>
                      <dd className="font-display text-xl font-bold text-gold-deep">{money(totalPrice)}</dd>
                    </div>
                  </dl>
                </div>

                {err.submit && (
                  <p className="field-error mt-4" role="alert">{err.submit}</p>
                )}

                <p className="mt-6 max-w-md font-body text-xs text-mutedBrown leading-relaxed">
                  By confirming, you agree to arrive 5 minutes prior to your time in Khairpur Mir's and present your booking reference at reception.
                </p>
              </div>
            )}

            {/* Standard Step Navigation Buttons (Steps 1, 2, 3, 4) */}
            {step > 0 && (
              <div className="mt-10 flex items-center gap-4 border-t border-charcoal/10 pt-6">
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="inline-flex items-center gap-2 rounded-sm border border-charcoal/30 bg-transparent px-6 py-3 font-body text-xs font-semibold uppercase tracking-wider text-charcoal hover:border-charcoal hover:bg-charcoal/5"
                >
                  <ArrowLeft size={14} />
                  <span>Back</span>
                </button>

                {step < 4 ? (
                  <button
                    type="button"
                    disabled={!canNext}
                    onClick={next}
                    className="inline-flex items-center gap-2 rounded-sm bg-charcoal px-7 py-3 font-body text-xs font-semibold uppercase tracking-wider text-ivory hover:bg-gold hover:text-charcoal transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span>Continue</span>
                    <ArrowRight size={14} />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={confirm}
                    className="inline-flex items-center gap-2 rounded-sm bg-gold px-8 py-3.5 font-body text-xs font-semibold uppercase tracking-wider text-charcoal shadow-gold hover:bg-gold-hover hover:scale-[1.01] transition-all disabled:opacity-50"
                  >
                    <span>{busy ? 'Securing slot…' : 'Confirm reservation'}</span>
                    <ArrowRight size={14} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Sticky Booking Summary Sidebar */}
          <aside
            className="h-fit rounded-xl border border-charcoal/10 bg-ivory-light p-6 lg:sticky lg:top-28 shadow-sm"
            aria-label="Booking Summary"
          >
            <h3 className="mb-5 font-display text-xl font-medium text-charcoal border-b border-charcoal/10 pb-3">
              Reservation Summary
            </h3>

            <div className="space-y-4 divide-y divide-charcoal/10 font-body text-sm">
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-mutedBrown">Treatments</p>
                  {step > 0 && (
                    <button
                      type="button"
                      onClick={handleEditServices}
                      className="text-[10px] font-semibold uppercase tracking-wider text-gold-deep hover:underline"
                    >
                      Change
                    </button>
                  )}
                </div>
                <p className="mt-1 font-medium text-charcoal">
                  {selectedServices.length > 0 ? (
                    combinedServiceNames
                  ) : (
                    <span className="text-mutedBrown italic">Not selected</span>
                  )}
                </p>
                {selectedServices.length > 1 && (
                  <p className="text-[11px] text-taupe mt-0.5">
                    {selectedServices.length} treatments selected
                  </p>
                )}
              </div>

              <div className="pt-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-mutedBrown">Specialist</p>
                <p className="mt-1 font-medium text-charcoal">
                  {person ? person.name : <span className="text-mutedBrown italic">Not selected</span>}
                </p>
              </div>

              <div className="pt-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-mutedBrown">Date &amp; Time</p>
                <p className="mt-1 font-medium text-charcoal">
                  {b.date && b.time ? (
                    `${longDate(b.date)}, ${b.time}`
                  ) : (
                    <span className="text-mutedBrown italic">Not selected</span>
                  )}
                </p>
              </div>

              {selectedServices.length > 0 && (
                <div className="pt-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-mutedBrown font-medium">Estimated Total:</span>
                    <span className="font-display text-2xl font-medium text-charcoal">
                      {money(totalPrice)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-mutedBrown">Duration: {duration(totalDurationMin)}</p>
                </div>
              )}
            </div>

            <div className="mt-6 rounded-lg bg-white/70 p-3 text-[11px] text-mutedBrown border border-charcoal/10">
              <p>📍 {site.name}, {site.address}</p>
              <p className="mt-1">📞 Helpline: {site.phone}</p>
            </div>
          </aside>

        </div>
      </section>

      {/* ─── Responsive Sticky Booking Footer / Bottom Action Bar (Step 0) ─── */}
      {step === 0 && (
        <div
          className="fixed bottom-0 left-0 right-0 z-40 bg-charcoal/95 border-t border-gold/30 backdrop-blur-md py-3.5 px-4 sm:px-8 shadow-2xl transition-transform duration-300 pb-[calc(0.875rem+env(safe-area-inset-bottom,0px))]"
          role="region"
          aria-label="Booking Selection Footer"
        >
          <div className="container-page flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Left: Summary information */}
            <div className="w-full sm:w-auto text-center sm:text-left min-w-0">
              {selectedServices.length === 0 ? (
                <p className="font-body text-xs sm:text-sm text-taupe italic">
                  Select one or more services above to continue.
                </p>
              ) : (
                <div>
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <span className="font-display text-sm sm:text-base font-medium text-ivory">
                      {selectedServices.length} {selectedServices.length === 1 ? 'treatment' : 'treatments'} selected:
                    </span>
                    <span className="font-display text-base sm:text-lg font-semibold text-gold">
                      {money(totalPrice)}
                    </span>
                    <span className="text-xs text-taupe font-body">
                      • {duration(totalDurationMin)}
                    </span>
                  </div>
                  <p className="font-body text-[11px] text-taupe truncate max-w-sm sm:max-w-xl hidden xs:block">
                    {combinedServiceNames}
                  </p>
                </div>
              )}
            </div>

            {/* Right: Prominent Sticky Continue Button */}
            <button
              type="button"
              disabled={selectedServices.length === 0}
              onClick={handleServiceContinue}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-sm bg-gold px-7 sm:px-8 py-3.5 font-body text-xs font-semibold uppercase tracking-wider text-charcoal hover:bg-gold-hover shadow-gold transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              <span>Continue to Specialist</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
