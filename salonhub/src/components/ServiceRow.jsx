import { Clock, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { money, duration } from '@/lib/format'

export default function ServiceRow({ s }) {
  return (
    <li className="group flex flex-col gap-5 border-b border-charcoal/10 py-7 transition-colors hover:border-gold/50 sm:flex-row sm:items-center sm:justify-between">
      <div className="max-w-xl">
        <div className="flex items-center gap-2.5">
          <span className="rounded bg-charcoal/5 px-2 py-0.5 font-body text-[10px] font-semibold uppercase tracking-wider text-mutedBrown">
            {s.category}
          </span>
          {s.gender && (
            <span className="rounded bg-gold/15 px-2 py-0.5 font-body text-[10px] font-semibold uppercase tracking-wider text-gold-deep">
              {s.gender}
            </span>
          )}
        </div>

        <h3 className="mt-2 font-display text-2xl font-medium text-charcoal group-hover:text-gold-deep transition-colors duration-200">
          {s.name}
        </h3>
        <p className="mt-1.5 font-body text-sm text-mutedBrown leading-relaxed">
          {s.description}
        </p>
        <p className="mt-2.5 flex items-center gap-1.5 font-body text-xs text-mutedBrown">
          <Clock size={13} className="text-gold" />
          <span>{duration(s.durationMin)}</span>
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-6 sm:flex-col sm:items-end sm:gap-3">
        <span className="font-display text-2xl sm:text-3xl font-medium text-charcoal">
          {money(s.price)}
        </span>
        <Link
          to={`/book?service=${s.id}`}
          className="inline-flex items-center gap-1.5 rounded-sm bg-charcoal px-5 py-2.5 font-body text-xs font-semibold uppercase tracking-wider text-ivory transition-colors hover:bg-gold hover:text-charcoal"
        >
          <span>Book now</span>
          <ArrowRight size={13} />
        </Link>
      </div>
    </li>
  )
}
