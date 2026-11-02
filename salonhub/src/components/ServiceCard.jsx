import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Clock, ArrowRight } from 'lucide-react'
import { money, duration } from '@/lib/format'
import CategoryIcon from '@/components/ui/CategoryIcon'
import { images } from '@/config/images'

export default function ServiceCard({ s }) {
  const serviceId = s.id || s._id

  // Determine image source
  const rawImage = typeof s.image === 'object' ? s.image?.url : s.image
  const categoryDefault = images.categories[s.category] || images.cta
  const initialImage = rawImage || categoryDefault
  const [imgSrc, setImgSrc] = useState(initialImage)

  return (
    <article className="group flex flex-col justify-between overflow-hidden rounded-xl border border-charcoal/10 bg-white transition-all duration-300 hover:border-gold/60 hover:shadow-editorial">
      <div>
        {/* Photo Frame with Aspect Ratio */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-charcoal">
          <img
            src={imgSrc}
            alt={s.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-premium group-hover:scale-105"
            onError={() => {
              if (imgSrc !== categoryDefault) {
                setImgSrc(categoryDefault)
              }
            }}
          />
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-transparent to-transparent opacity-40 group-hover:opacity-60 transition-opacity" />

          {/* Top category & audience badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-charcoal/80 backdrop-blur-sm px-2.5 py-1 font-body text-[10px] font-semibold uppercase tracking-wider text-ivory border border-white/10">
              <CategoryIcon category={s.category} size={11} className="text-gold" />
              <span>{s.category}</span>
            </span>

            {s.gender && (
              <span className={`rounded-full px-2 py-0.5 font-body text-[9px] font-semibold uppercase tracking-wider backdrop-blur-sm ${
                s.gender === 'Women'
                  ? 'bg-rose-950/70 text-rose-200 border border-rose-400/20'
                  : s.gender === 'Men'
                  ? 'bg-blue-950/70 text-blue-200 border border-blue-400/20'
                  : 'bg-emerald-950/70 text-emerald-200 border border-emerald-400/20'
              }`}>
                {s.gender}
              </span>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5">
          <div className="flex items-center justify-between gap-2 text-xs text-mutedBrown">
            <span className="flex items-center gap-1.5 font-medium">
              <Clock size={12} className="text-gold" />
              <span>{duration(s.durationMin || 45)}</span>
            </span>
            <span className="font-display text-xl font-medium text-charcoal">
              {money(s.price || 0)}
            </span>
          </div>

          <h3 className="mt-2.5 font-display text-xl sm:text-[1.35rem] font-medium leading-tight text-charcoal group-hover:text-gold-deep transition-colors">
            {s.name}
          </h3>

          <p className="mt-2 font-body text-xs text-mutedBrown line-clamp-2 leading-relaxed">
            {s.description || 'Custom consultation, precision execution, and premium finish.'}
          </p>
        </div>
      </div>

      {/* Footer Booking Action */}
      <div className="p-5 pt-0">
        <div className="border-t border-charcoal/10 pt-3">
          <Link
            to={`/book?service=${serviceId}`}
            className="flex w-full items-center justify-center gap-2 rounded-sm bg-charcoal py-2.5 font-body text-xs font-semibold uppercase tracking-wider text-ivory transition-colors hover:bg-gold hover:text-charcoal shadow-2xs"
          >
            <span>Book Now</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </article>
  )
}

