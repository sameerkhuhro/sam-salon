import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle2, Clock, ArrowRight, ArrowLeft, Star, Sparkles } from 'lucide-react'
import { services, getService } from '@/data/services'
import { team } from '@/data/team'
import { getAvailability, createBooking, getLiveServices, getLiveStaff } from '@/lib/api'
import { money, duration, longDate, todayISO } from '@/lib/format'
import { site } from '@/config/site'
import PageHero from '@/components/ui/PageHero'
import CategoryIcon from '@/components/ui/CategoryIcon'

const STEPS = ['Service', 'Stylist', 'Date & Time', 'Your Details', 'Review']

function StepIndicator({ current }) {
  return (
    <ol className="mb-10 flex flex-wrap items-center gap-x-2 gap-y-3">
      {STEPS.map((s, i) => {
        const done = i < current
        const active = i === current
        return (
          <li key={s} className="flex items-center gap-2">
            <span
              aria-current={active ? 'step' : undefined}
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-all ${
                done
                  ? 'bg-gold text-charcoal shadow-sm'
                  : active
                  ? 'bg-charcoal text-ivory ring-2 ring-gold'
                  : 'border border-charcoal/20 text-mutedBrown bg-white/50'
              }`}
            >
              {done ? <CheckCircle2 size={16} /> : i + 1}
            </span>
            <span
              className={`font-body text-xs sm:text-sm transition-colors ${
                active ? 'font-semibold text-charcoal' : done ? 'text-gold-deep font-medium' : 'text-mutedBrown'
              }`}
            >
              {s}
            </span>
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
      className={`group w-full rounded-lg border p-5 text-left transition-all duration-200 ${
        active
          ? 'border-charcoal bg-charcoal text-ivory shadow-md ring-1 ring-gold'
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
  const [b, setB] = useState({
    serviceId: params.get('service') || '',
    staffId: params.get('staff') || '',
    date: '',
    time: '',
    name: '',
    phone: '',
    email: '',
    notes: '',
  })
  const [slots, setSlots] = useState([])
  const [err, setErr] = useState({})
  const [busy, setBusy] = useState(false)
  const [catFilter, setCatFilter] = useState('All')

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
  const svc = serviceList.find((s) => s.id === b.serviceId || s._id === b.serviceId) || getService(b.serviceId)
  const person = staffList.find((t) => t.id === b.staffId || t._id === b.staffId) || team.find((t) => t.id === b.staffId)

  const staffOptions = staffList.filter((t) => {
    const isActive = t.status === undefined || t.status === 'active'
    if (!isActive) return false
    if (!svc) return true
    if (!t.serviceIds || t.serviceIds.length === 0) return true
    return t.serviceIds.includes(svc.id) || (svc._id && t.serviceIds.includes(svc._id))
  })

  // Fetch available slots when service, stylist, and date are selected
  useEffect(() => {
    if (svc && b.staffId && b.date) {
      getAvailability({ staffId: b.staffId, date: b.date, durationMin: svc.durationMin || 45 })
        .then(setSlots)
        .catch(() => setSlots([]))
    }
  }, [b.serviceId, b.staffId, b.date])

  const validate = () => {
    const x = {}
    if (step === 3) {
      if (b.name.trim().length < 2) x.name = 'Please enter your full name.'
      if (!/^(\+92|0)3\d{9}$/.test(b.phone.replace(/[\s-]/g, '')))
        x.phone = 'Please enter a valid Pakistani mobile number (e.g. 0300 1234567).'
      if (b.email && !/^\S+@\S+\.\S+$/.test(b.email))
        x.email = 'Please enter a valid email address or leave it blank.'
    }
    setErr(x)
    return !Object.keys(x).length
  }

  const canNext = [!!b.serviceId, !!b.staffId, !!b.time, true, true][step]

  const next = () => validate() && setStep(step + 1)

  const confirm = async () => {
    if (!svc || !person) return
    setBusy(true)
    try {
      const fresh = await getAvailability({ staffId: b.staffId, date: b.date, durationMin: svc.durationMin || 45 })
      if (!fresh.find((s) => s.label === b.time)?.available) {
        setBusy(false)
        set({ time: '' })
        setStep(2)
        return setErr({ time: 'That time slot is no longer available. Please choose another time.' })
      }
      const r = await createBooking({
        ...b,
        serviceId: svc.id || svc._id,
        serviceName: svc.name,
        price: svc.price,
        durationMin: svc.durationMin,
        staffId: person.id || person._id,
        staffName: person.name,
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
        text="Choose your service, select your preferred master specialist, and secure your time in under a minute."
      />

      <section className="section !pt-12 bg-ivory min-h-screen">
        <div className="container-page grid gap-12 lg:grid-cols-[1fr_22rem]">

          {/* Main Booking Column */}
          <div>
            <StepIndicator current={step} />

            {/* Step 0: Choose Service */}
            {step === 0 && (
              <div>
                <h2 className="mb-2 font-display text-3xl font-medium text-charcoal">
                  1. Choose a treatment
                </h2>
                <p className="mb-5 font-body text-sm text-mutedBrown">
                  Select from precision cuts, color treatments, beard grooming, skincare or spa sessions.
                </p>

                {/* Category Quick Filter Chips */}
                <div className="mb-6 flex flex-wrap items-center gap-1.5">
                  {['All', 'Hair', 'Colour', 'Grooming', 'Skin', 'Nails', 'Relax'].map((catName) => {
                    const isCatActive = catFilter === catName
                    return (
                      <button
                        key={catName}
                        type="button"
                        onClick={() => setCatFilter(catName)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-body text-xs font-medium transition-all ${
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

                <div className="grid gap-3 sm:grid-cols-2">
                  {serviceList
                    .filter((s) => catFilter === 'All' || s.category?.toLowerCase() === catFilter.toLowerCase())
                    .map((s) => {
                    const sId = s.id || s._id
                    const isSelected = b.serviceId === sId
                    return (
                      <ChoiceCard
                        key={sId}
                        active={isSelected}
                        onClick={() => set({ serviceId: sId, staffId: '', time: '' })}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider ${isSelected ? 'text-gold' : 'text-mutedBrown'}`}>
                            <CategoryIcon category={s.category} size={11} className={isSelected ? 'text-gold' : 'text-taupe'} />
                            <span>{s.category} · {s.gender}</span>
                          </span>
                          <span className={`font-display text-lg font-medium ${isSelected ? 'text-gold' : 'text-charcoal'}`}>
                            {money(s.price)}
                          </span>
                        </div>
                        <span className="mt-2 block font-display text-xl font-medium leading-tight">
                          {s.name}
                        </span>
                        <span className={`mt-1.5 block font-body text-xs leading-relaxed line-clamp-2 ${isSelected ? 'text-ivory/80' : 'text-mutedBrown'}`}>
                          {s.description}
                        </span>
                        <div className={`mt-3 flex items-center gap-1.5 font-body text-[11px] ${isSelected ? 'text-gold' : 'text-mutedBrown'}`}>
                          <Clock size={12} />
                          <span>{duration(s.durationMin)}</span>
                        </div>
                      </ChoiceCard>
                    )
                  })}
                </div>
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

                {staffOptions.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-charcoal/20 bg-white/60 p-8 text-center">
                    <p className="font-display text-xl font-medium text-charcoal">
                      No active specialists currently assigned to {svc?.name || 'this service'}.
                    </p>
                    <p className="font-body text-xs text-mutedBrown mt-1">
                      Please choose another treatment or contact the salon directly at {site?.phone || '+92 300 1234567'}.
                    </p>
                    <button
                      type="button"
                      onClick={() => setStep(0)}
                      className="mt-4 inline-flex items-center gap-1.5 rounded bg-charcoal px-4 py-2 font-body text-xs font-semibold text-ivory hover:bg-gold hover:text-charcoal transition-colors"
                    >
                      <ArrowLeft size={14} />
                      <span>Choose Another Service</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {staffOptions.map((t) => {
                      const tId = t.id || t._id
                      const isSelected = b.staffId === tId
                      const isSpecialist =
                        svc &&
                        t.specialtyServiceIds &&
                        (t.specialtyServiceIds.includes(svc.id) || (svc._id && t.specialtyServiceIds.includes(svc._id)))

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
                      Available Slots for {longDate(b.date)}
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
                  We'll use these to send your confirmation and appointment reminders.
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
                    <label htmlFor="b-email" className="mb-1.5 block font-body text-xs font-semibold uppercase tracking-wider text-charcoal">
                      Email Address (Optional)
                    </label>
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
                    {[
                      ['Service', svc?.name || '—'],
                      ['Category', svc ? `${svc.category} (${svc.gender})` : '—'],
                      ['Specialist', person?.name || '—'],
                      ['Date', b.date ? longDate(b.date) : '—'],
                      ['Time Slot', b.time || '—'],
                      ['Duration', svc ? duration(svc.durationMin) : '—'],
                      ['Client Name', b.name || '—'],
                      ['Mobile', b.phone || '—'],
                      ['Total Amount', svc ? money(svc.price) : '—'],
                    ].map(([label, val]) => (
                      <div key={label} className="flex justify-between py-3">
                        <dt className="text-mutedBrown">{label}</dt>
                        <dd className="font-semibold text-charcoal">{val}</dd>
                      </div>
                    ))}
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

            {/* Step Navigation Buttons */}
            <div className="mt-10 flex items-center gap-4 border-t border-charcoal/10 pt-6">
              {step > 0 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="inline-flex items-center gap-2 rounded-sm border border-charcoal/30 bg-transparent px-6 py-3 font-body text-xs font-semibold uppercase tracking-wider text-charcoal hover:border-charcoal hover:bg-charcoal/5"
                >
                  <ArrowLeft size={14} />
                  <span>Back</span>
                </button>
              )}

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
                <p className="text-[11px] font-semibold uppercase tracking-wider text-mutedBrown">Treatment</p>
                <p className="mt-1 font-medium text-charcoal">
                  {svc ? svc.name : <span className="text-mutedBrown italic">Not selected</span>}
                </p>
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

              {svc && (
                <div className="pt-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-mutedBrown font-medium">Estimated Price:</span>
                    <span className="font-display text-2xl font-medium text-charcoal">
                      {money(svc.price)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-mutedBrown">Duration: {duration(svc.durationMin)}</p>
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
    </>
  )
}
