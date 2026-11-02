import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function StaffCard({ m }) {
  const staffPhoto = m.avatar || m.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
  const [imgSrc, setImgSrc] = useState(staffPhoto)

  useEffect(() => {
    setImgSrc(m.avatar || m.photo || staffPhoto)
  }, [m.avatar, m.photo])

  const staffId = m.id || m._id
  const specialtiesText = Array.isArray(m.specialties)
    ? m.specialties.map((s) => (typeof s === 'string' ? s : s.name)).join(' · ')
    : ''

  return (
    <article className="group flex flex-col justify-between rounded-xl border border-charcoal/10 bg-ivory p-4 transition-all duration-300 hover:border-gold/60 hover:shadow-editorial">
      {/* Photo Frame */}
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-charcoal">
        <img
          src={imgSrc}
          alt={`${m.name}, ${m.role} at SAM SALON`}
          loading="lazy"
          className="h-full w-full object-cover object-top transition-transform duration-700 ease-premium group-hover:scale-105"
          onError={() => {
            if (m.fallbackPhoto) {
              setImgSrc(m.fallbackPhoto)
            } else if (imgSrc !== staffPhoto) {
              setImgSrc(staffPhoto)
            }
          }}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

        {/* Floating specialties tag */}
        {specialtiesText && (
          <div className="absolute bottom-3 left-3 right-3">
            <p className="font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-gold line-clamp-1">
              {specialtiesText}
            </p>
          </div>
        )}
      </div>

      {/* Stylist Details */}
      <div className="mt-4 flex flex-1 flex-col justify-between">
        <div>
          <div className="flex items-baseline justify-between">
            <h3 className="font-display text-xl font-medium text-charcoal">
              {m.name}
            </h3>
            <span className="font-body text-xs font-semibold uppercase tracking-wider text-mutedBrown">
              {m.years || 1} yrs exp
            </span>
          </div>
          <p className="mt-1 font-body text-xs text-mutedBrown">
            {m.role}
          </p>
          {m.bio && (
            <p className="mt-2 font-body text-xs text-mutedBrown/80 line-clamp-2 leading-relaxed">
              {m.bio}
            </p>
          )}
        </div>

        {/* Direct Booking CTA */}
        <div className="mt-5 pt-3 border-t border-charcoal/10">
          <Link
            to={`/book?staff=${staffId}`}
            className="flex w-full items-center justify-center gap-2 rounded-sm bg-charcoal py-2.5 font-body text-xs font-medium text-ivory transition-colors hover:bg-gold hover:text-charcoal"
          >
            <span>Book with {m.name ? m.name.split(' ')[0] : 'Stylist'}</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </article>
  )
}
