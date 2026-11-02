import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { images } from '@/config/images'

export default function CtaBanner() {
  return (
    <section
      className="relative overflow-hidden bg-charcoal bg-cover bg-center py-24 sm:py-28 text-center text-ivory"
      style={{
        backgroundImage: `linear-gradient(rgba(36,33,31,0.85), rgba(36,33,31,0.92)), url(${images.cta})`,
      }}
    >
      {/* Subtle gold border top and bottom */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />

      <div className="container-page relative z-10">
        <div className="mx-auto flex items-center justify-center gap-3">
          <span className="font-body text-[11px] font-semibold uppercase tracking-[0.24em] text-gold">
            READY WHEN YOU ARE
          </span>
          <span className="h-px w-8 bg-gold/70" aria-hidden="true" />
        </div>

        <h2 className="mt-4 font-display text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-ivory max-w-2xl mx-auto">
          Your next appointment is a minute away.
        </h2>

        <p className="mx-auto mt-5 max-w-lg font-body text-base sm:text-lg text-taupe leading-relaxed">
          Book online any time, choose your specialist, and secure your preferred time in Khairpur Mir's.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/book"
            className="inline-flex items-center gap-2 rounded-sm bg-gold px-8 py-4 font-body text-xs font-semibold uppercase tracking-wider text-charcoal shadow-gold transition-all duration-200 hover:bg-gold-hover hover:scale-[1.02]"
          >
            <span>Book an appointment</span>
            <ArrowRight size={15} />
          </Link>

          <Link
            to="/services"
            className="inline-flex items-center justify-center rounded-sm border border-ivory/30 bg-transparent px-8 py-4 font-body text-xs font-semibold uppercase tracking-wider text-ivory transition-all duration-200 hover:border-gold hover:text-gold hover:bg-gold/5"
          >
            View services &amp; prices
          </Link>
        </div>
      </div>
    </section>
  )
}
