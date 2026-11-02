import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Clock } from 'lucide-react'
import { services as fallbackServices } from '@/data/services'
import { getFeaturedServices } from '@/lib/api'
import { money, duration } from '@/lib/format'
import SectionHeading from '@/components/ui/SectionHeading'
import CategoryIcon from '@/components/ui/CategoryIcon'

export default function FeaturedServices() {
  const [featured, setFeatured] = useState(() => fallbackServices.slice(0, 6))

  useEffect(() => {
    let isMounted = true
    getFeaturedServices().then((liveServices) => {
      if (isMounted && liveServices && liveServices.length > 0) {
        setFeatured(liveServices)
      }
    })
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <section className="section bg-ivory-light">
      <div className="container-page">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="Curated Salon Menu"
            title="Signature services tailored to you"
            text="Unisex precision cuts, bespoke hair colour, luxury beard grooming and aesthetic skincare."
            noMargin
          />
          <Link
            to="/services"
            className="inline-flex items-center gap-2 font-body text-xs font-semibold uppercase tracking-[0.14em] text-charcoal hover:text-gold transition-colors self-start md:self-auto"
          >
            <span>View all services</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Services Grid */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((s) => (
            <div
              key={s.id || s._id}
              className="group flex flex-col justify-between rounded-lg border border-charcoal/10 bg-ivory p-6 transition-all duration-300 hover:border-gold/60 hover:shadow-editorial"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-mutedBrown">
                  <span className="inline-flex items-center gap-1.5 text-gold-deep">
                    <CategoryIcon category={s.category} size={13} className="text-gold" />
                    <span>{s.category}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} className="text-gold" />
                    {duration(s.durationMin)}
                  </span>
                </div>

                <h3 className="mt-3 font-display text-2xl font-medium text-charcoal group-hover:text-gold-deep transition-colors">
                  {s.name}
                </h3>

                <p className="mt-2 font-body text-sm text-mutedBrown line-clamp-2">
                  {s.description}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-charcoal/10 pt-4">
                <span className="font-display text-2xl font-medium text-charcoal">
                  {money(s.price)}
                </span>

                <Link
                  to={`/book?service=${s.id || s._id}`}
                  className="inline-flex items-center gap-1.5 rounded-sm bg-charcoal px-4 py-2 font-body text-xs font-medium text-ivory transition-colors hover:bg-gold hover:text-charcoal"
                >
                  <span>Book now</span>
                  <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
