import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { CheckCircle2, Calendar, MapPin, Phone, ArrowRight, Copy, Check } from 'lucide-react'
import { findBooking } from '@/lib/api'
import { money, longDate, duration } from '@/lib/format'
import { site } from '@/config/site'

export default function Confirmation() {
  const { ref } = useParams()
  const [b, setB] = useState(undefined)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    findBooking(ref).then(setB)
  }, [ref])

  const copyRef = () => {
    if (b?.ref) {
      navigator.clipboard.writeText(b.ref)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Loading state
  if (b === undefined) {
    return (
      <section className="section bg-ivory container-page pt-44 text-center min-h-[60vh]">
        <p className="font-body text-base text-mutedBrown animate-pulse">Retrieving your reservation…</p>
      </section>
    )
  }

  // Not found
  if (b === null) {
    return (
      <section className="section bg-ivory container-page pt-44 text-center min-h-[70vh]">
        <h1 className="font-display text-4xl font-normal text-charcoal">Booking reference not found</h1>
        <p className="mt-4 font-body text-mutedBrown">
          Please check the reference number in your URL or contact our Khairpur Mir's reception.
        </p>
        <div className="mt-8">
          <Link
            to="/book"
            className="inline-flex items-center gap-2 rounded-sm bg-gold px-6 py-3 font-body text-xs font-semibold uppercase tracking-wider text-charcoal"
          >
            Create a new booking
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="section bg-ivory pt-36 sm:pt-40 pb-24">
      <div className="container-page max-w-2xl text-center">
        {/* Success Icon */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gold/20 text-gold-deep ring-8 ring-gold/10">
          <CheckCircle2 size={40} />
        </div>

        <span className="mt-6 inline-block font-body text-[11px] font-semibold uppercase tracking-[0.24em] text-gold-deep">
          APPOINTMENT CONFIRMED
        </span>

        <h1 className="mt-2 font-display text-4xl sm:text-5xl font-normal text-charcoal">
          We look forward to seeing you, {(b.customerName || b.name || 'Guest').split(' ')[0]}.
        </h1>

        <p className="mt-3 font-body text-sm sm:text-base text-mutedBrown">
          Your reservation at SAM SALON Khairpur Mir's is recorded.
        </p>

        {/* Reference Number Card */}
        <div className="mt-8 flex items-center justify-center gap-3 rounded-lg border border-charcoal/15 bg-white p-4 shadow-sm max-w-md mx-auto">
          <span className="font-body text-xs text-mutedBrown">Reference ID:</span>
          <span className="font-mono text-lg font-bold tracking-wider text-charcoal">{b.ref}</span>
          <button
            onClick={copyRef}
            className="flex items-center gap-1 rounded bg-charcoal/5 px-2.5 py-1 text-xs font-medium text-charcoal hover:bg-gold hover:text-charcoal transition-colors"
            title="Copy reference"
          >
            {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* Appointment Summary Box */}
        <div className="mt-10 rounded-2xl border border-charcoal/15 bg-white p-6 sm:p-8 text-left shadow-sm">
          <h2 className="font-display text-xl font-medium text-charcoal border-b border-charcoal/10 pb-4">
            Reservation Details
          </h2>

          <dl className="mt-4 divide-y divide-charcoal/10 font-body text-sm">
            <div className="flex justify-between py-3">
              <dt className="text-mutedBrown">Treatment</dt>
              <dd className="font-semibold text-charcoal">{b.serviceName}</dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className="text-mutedBrown">Master Specialist</dt>
              <dd className="font-semibold text-charcoal">{b.staffName}</dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className="text-mutedBrown">Date &amp; Time</dt>
              <dd className="font-semibold text-charcoal">{longDate(b.date)} at {b.time}</dd>
            </div>
            {b.durationMin && (
              <div className="flex justify-between py-3">
                <dt className="text-mutedBrown">Estimated Duration</dt>
                <dd className="font-semibold text-charcoal">{duration(b.durationMin)}</dd>
              </div>
            )}
            <div className="flex justify-between py-3">
              <dt className="text-mutedBrown">Client</dt>
              <dd className="font-semibold text-charcoal">{b.customerName || b.name} ({b.customerPhone || b.phone})</dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className="text-mutedBrown">Total (to be paid at salon)</dt>
              <dd className="font-display text-xl font-medium text-charcoal">{money(b.price)}</dd>
            </div>
          </dl>

          <div className="mt-6 rounded-lg bg-ivory p-4 text-xs font-body text-mutedBrown space-y-2">
            <p className="flex items-center gap-2">
              <MapPin size={14} className="text-gold shrink-0" />
              <span>{site.address}</span>
            </p>
            <p className="flex items-center gap-2">
              <Phone size={14} className="text-gold shrink-0" />
              <span>Questions or rescheduling? Call {site.phone}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-sm bg-charcoal px-7 py-3 font-body text-xs font-semibold uppercase tracking-wider text-ivory hover:bg-gold hover:text-charcoal transition-colors"
          >
            <span>Back to homepage</span>
            <ArrowRight size={14} />
          </Link>

          <Link
            to="/book"
            className="inline-flex items-center justify-center rounded-sm border border-charcoal/30 bg-transparent px-7 py-3 font-body text-xs font-semibold uppercase tracking-wider text-charcoal hover:border-charcoal hover:bg-charcoal/5 transition-colors"
          >
            Book another appointment
          </Link>
        </div>
      </div>
    </section>
  )
}
