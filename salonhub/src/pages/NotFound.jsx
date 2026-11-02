import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function NotFound() {
  return (
    <section className="flex min-h-[85vh] flex-col items-center justify-center text-center bg-ivory px-5 pt-20">
      <p className="font-display text-[8rem] sm:text-[11rem] font-light leading-none text-charcoal/10 select-none" aria-hidden="true">
        404
      </p>
      <h1 className="font-display text-4xl sm:text-5xl font-normal text-charcoal -mt-6">
        Page Not Found
      </h1>
      <p className="mt-4 max-w-md font-body text-base text-mutedBrown">
        The page you are looking for doesn't exist or may have been relocated.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-sm bg-gold px-6 py-3 font-body text-xs font-semibold uppercase tracking-wider text-charcoal hover:bg-gold-hover transition-colors"
        >
          <span>Return to Homepage</span>
          <ArrowRight size={14} />
        </Link>
        <Link
          to="/services"
          className="inline-flex items-center justify-center rounded-sm border border-charcoal/30 bg-transparent px-6 py-3 font-body text-xs font-semibold uppercase tracking-wider text-charcoal hover:border-charcoal hover:bg-charcoal/5 transition-colors"
        >
          Explore Services
        </Link>
      </div>
    </section>
  )
}
